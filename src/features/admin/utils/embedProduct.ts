import { createServerSupabase } from '@/lib/supabase/server';
import { embeddingService } from '@/langchain/embeddings/embeddingService';

export function buildEmbeddingText(product: {
  name: string;
  description: string | null;
  category_name?: string | null;
  base_price: number;
  metadata?: Record<string, unknown> | null;
}): string {
  let text = `${product.name}.`;

  if (product.description) {
    text += ` ${product.description}.`;
  }

  if (product.category_name) {
    text += ` Category: ${product.category_name}.`;
  }

  if (product.metadata && typeof product.metadata === 'object') {
    const metaParts = Object.entries(product.metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('. ');
    if (metaParts) {
      text += ` ${metaParts}.`;
    }
  }

  text += ` Price: $${product.base_price}`;

  return text;
}

export async function embedProduct(productId: string): Promise<void> {
  const supabase = createServerSupabase();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id, name, description, base_price, metadata,
      categories ( name )
    `)
    .eq('id', productId)
    .single();

  if (error || !product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const categoryName = (product.categories as unknown as { name: string } | null)?.name ?? null;

  const text = buildEmbeddingText({
    name: product.name,
    description: product.description,
    category_name: categoryName,
    base_price: product.base_price,
    metadata: product.metadata as Record<string, unknown> | null,
  });

  const embedding = await embeddingService.generateEmbedding(text);

  if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
    throw new Error(`Embedding generation returned empty result for product ${productId}`);
  }

  // pgvector expects the vector as a string in format [0.1,0.2,...]
  const vectorString = `[${embedding.join(',')}]`;

  // Upsert into product_embeddings
  const { error: upsertError } = await supabase
    .from('product_embeddings')
    .upsert(
      {
        product_id: productId,
        embedding: vectorString,
        content: text,
      },
      { onConflict: 'product_id' }
    );

  if (upsertError) {
    throw new Error(`Failed to embed product: ${upsertError.message}`);
  }
}

export async function embedAllProducts(): Promise<{ success: number; failed: number }> {
  const supabase = createServerSupabase();

  const { data: products, error } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true);

  if (error || !products) {
    throw new Error('Failed to fetch products for embedding');
  }

  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await embedProduct(product.id);
      success++;
    } catch (err) {
      console.error(`Failed to embed product ${product.id}:`, err);
      failed++;
    }
  }

  return { success, failed };
}
