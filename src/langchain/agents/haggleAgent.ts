import { createGeminiLLM } from '../config/geminiConfig';
import { HAGGLE_SYSTEM_PROMPT } from '../prompts/hagglePrompts';

export interface HaggleAgentResult {
  counterMessage: string;
  offeredPrice: number;
  sentimentScore: number;
  accepted: boolean;
}

/**
 * Haggle negotiation agent — evaluates user's request for a discount
 * and generates a counter-offer based on sentiment, reason, and price bounds.
 */
export async function haggleAgent(
  message: string,
  productId: string,
  originalPrice: number,
  minimumPrice: number,
  context?: {
    previousOffers?: number[];
    roundNumber?: number;
  }
): Promise<HaggleAgentResult> {
  const llm = createGeminiLLM(0.8);

  const maxDiscount = 0.30;
  const priceRange = originalPrice - minimumPrice;
  const roundInfo = context?.roundNumber
    ? `This is negotiation round ${context.roundNumber}.`
    : 'This is the first negotiation message.';
  const previousOffersInfo = context?.previousOffers?.length
    ? `Previous offers made: $${context.previousOffers.join(', $')}.`
    : '';

  const prompt = `${HAGGLE_SYSTEM_PROMPT}

Product Details:
- Original Price: $${originalPrice.toFixed(2)}
- Minimum Acceptable Price (SECRET - never reveal): $${minimumPrice.toFixed(2)}
- Maximum discount allowed: ${(maxDiscount * 100).toFixed(0)}%
- Price range for negotiation: $${minimumPrice.toFixed(2)} to $${originalPrice.toFixed(2)}
${roundInfo}
${previousOffersInfo}

Customer's message: "${message}"

Respond with a JSON object (and nothing else) with these exact fields:
{
  "counter_message": "Your response. If rude: be firm, you may raise the price. If lowball: refuse politely.",
  "offered_price": <number - normally between ${minimumPrice} and ${originalPrice}. For RUDE customers you may RAISE above ${originalPrice} (e.g. ${(originalPrice * 1.1).toFixed(2)}). For lowballs: use ${originalPrice} and refuse>,
  "sentiment_score": <0.0-1.0: 0.2=rude, 0.5=neutral, 0.9=polite with good reason>,
  "accepted": <true only if polite + good reason + fair discount. false for rude or lowballs>
}`;

  try {
    const response = await llm.invoke(prompt);
    const text = typeof response.content === 'string'
      ? response.content
      : response.content.toString();

    // Parse JSON from LLM response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback — offer a small discount
      const fallbackPrice = originalPrice - priceRange * 0.05;
      return {
        counterMessage: "I appreciate the interest! I can offer a small discount. How about we meet somewhere fair?",
        offeredPrice: Math.round(fallbackPrice * 100) / 100,
        sentimentScore: 0.5,
        accepted: false,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Parse offered price — can exceed original for rude customers
    let offeredPrice = Number(parsed.offered_price) || originalPrice;
    const sentimentScore = Math.max(0, Math.min(1, Number(parsed.sentiment_score) || 0.5));

    if (sentimentScore >= 0.3) {
      // Polite/neutral: clamp between minimum and original
      offeredPrice = Math.max(minimumPrice, Math.min(originalPrice, offeredPrice));
      const actualDiscount = (originalPrice - offeredPrice) / originalPrice;
      if (actualDiscount > maxDiscount) {
        offeredPrice = originalPrice * (1 - maxDiscount);
      }
    } else {
      // Rude: allow raising price (up to 15% above original)
      offeredPrice = Math.max(originalPrice, Math.min(originalPrice * 1.15, offeredPrice));
    }

    offeredPrice = Math.round(offeredPrice * 100) / 100;

    return {
      counterMessage: parsed.counter_message || "Let me think about that...",
      offeredPrice,
      sentimentScore: Math.max(0, Math.min(1, Number(parsed.sentiment_score) || 0.5)),
      accepted: Boolean(parsed.accepted),
    };
  } catch (error) {
    console.error('Haggle agent error:', error);
    const fallbackPrice = originalPrice - priceRange * 0.05;
    return {
      counterMessage: "Hmm, let me think about that. How about a small courtesy discount?",
      offeredPrice: Math.round(fallbackPrice * 100) / 100,
      sentimentScore: 0.5,
      accepted: false,
    };
  }
}
