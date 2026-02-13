import { createServerSupabase } from '@/lib/supabase/server';
import { HaggleRequest, HaggleResponse, HaggleSession, DiscountCode } from '../types';
import { haggleAgent } from '@/langchain/agents/haggleAgent';

function generateDiscountCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'HAGGLE-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const haggleService = {
  /**
   * Negotiate price via LangChain haggle agent
   */
  async negotiate(userId: string | null, data: HaggleRequest): Promise<HaggleResponse> {
    const supabase = createServerSupabase();

    // 1. Fetch product details (base_price, minimum_price)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, base_price, minimum_price')
      .eq('id', data.product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // 2. Get or create haggle session
    let session: HaggleSession;
    let roundNumber = 1;
    const previousOffers: number[] = [];

    if (data.session_id) {
      // Continue existing session
      const { data: existingSession, error: sessionError } = await supabase
        .from('haggle_sessions')
        .select('*')
        .eq('id', data.session_id)
        .single();

      if (sessionError || !existingSession) {
        throw new Error('Haggle session not found');
      }

      if (existingSession.status !== 'negotiating') {
        throw new Error('This negotiation has already concluded');
      }

      session = existingSession as HaggleSession;

      // Count previous rounds
      if (session.offered_price) {
        previousOffers.push(session.offered_price);
      }

      // Estimate round number from session age
      roundNumber = previousOffers.length + 1;
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('haggle_sessions')
        .insert({
          user_id: userId,
          product_id: product.id,
          original_price: product.base_price,
          status: 'negotiating',
          reason: data.message,
        })
        .select()
        .single();

      if (createError || !newSession) {
        throw new Error('Failed to create haggle session');
      }

      session = newSession as HaggleSession;
    }

    // 3. Run haggle agent
    const agentResult = await haggleAgent(
      data.message,
      product.id,
      product.base_price,
      product.minimum_price,
      { previousOffers, roundNumber }
    );

    // 4. Update session with agent result
    const updateData: Record<string, unknown> = {
      offered_price: agentResult.offeredPrice,
      sentiment_score: agentResult.sentimentScore,
      reason: data.message,
    };

    let discountCode: DiscountCode | undefined;

    if (agentResult.offeredPrice < product.base_price) {
      // Agent offered a discount — generate coupon code immediately
      // Per PRD: good reason → Clerk generates a unique Coupon Code
      const code = generateDiscountCode();
      const discountValue = product.base_price - agentResult.offeredPrice;

      const { data: createdDiscount, error: discountError } = await supabase
        .from('discount_codes')
        .insert({
          code,
          discount_type: 'fixed',
          discount_value: Math.round(discountValue * 100) / 100,
          user_id: userId,
          product_id: product.id,
          usage_limit: 1,
          is_active: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
        })
        .select()
        .single();

      if (!discountError && createdDiscount) {
        discountCode = createdDiscount as DiscountCode;
        updateData.status = 'accepted';
        updateData.final_price = agentResult.offeredPrice;
        updateData.discount_code_id = createdDiscount.id;
      }
    } else if (agentResult.accepted) {
      // Edge case: agent accepted but didn't lower price
      updateData.status = 'accepted';
      updateData.final_price = agentResult.offeredPrice;
    }

    // Update the session
    const { data: updatedSession, error: updateError } = await supabase
      .from('haggle_sessions')
      .update(updateData)
      .eq('id', session.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update haggle session:', updateError);
    }

    const finalSession = (updatedSession || session) as HaggleSession;

    return {
      message: agentResult.counterMessage,
      session: finalSession,
      discount_code: discountCode,
    };
  },

  /**
   * Accept a haggle deal — finalize and generate discount code
   */
  async accept(userId: string | null, sessionId: string): Promise<HaggleResponse> {
    const supabase = createServerSupabase();

    // 1. Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('haggle_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Haggle session not found');
    }

    if (session.status !== 'negotiating') {
      throw new Error('This negotiation has already concluded');
    }

    if (!session.offered_price) {
      throw new Error('No offer has been made yet');
    }

    // 2. Fetch product for base_price
    const { data: product } = await supabase
      .from('products')
      .select('base_price, name')
      .eq('id', session.product_id)
      .single();

    const basePrice = product?.base_price || session.original_price;
    const discountValue = basePrice - session.offered_price;

    // 3. Generate discount code
    const code = generateDiscountCode();

    const { data: createdDiscount, error: discountError } = await supabase
      .from('discount_codes')
      .insert({
        code,
        discount_type: 'fixed',
        discount_value: Math.round(discountValue * 100) / 100,
        user_id: userId,
        product_id: session.product_id,
        usage_limit: 1,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (discountError || !createdDiscount) {
      throw new Error('Failed to generate discount code');
    }

    // 4. Update session to accepted
    const { data: updatedSession, error: updateError } = await supabase
      .from('haggle_sessions')
      .update({
        status: 'accepted',
        final_price: session.offered_price,
        discount_code_id: createdDiscount.id,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to finalize haggle session');
    }

    return {
      message: `Deal accepted! 🎉 Use code "${code}" at checkout to get $${discountValue.toFixed(2)} off. This code expires in 24 hours!`,
      session: updatedSession as HaggleSession,
      discount_code: createdDiscount as DiscountCode,
    };
  },
};
