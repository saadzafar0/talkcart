import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createGeminiLLM } from '../config/geminiConfig';
import { retrieveProducts } from '../retrievers/productRetriever';

/**
 * Create a RAG chain that retrieves products semantically and generates
 * a natural language response about them.
 */
export async function createRagChain() {
  const llm = createGeminiLLM(0.5);

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a product search assistant. Based on the user's query and the retrieved products below, provide a helpful summary.

Retrieved Products:
{context}

User Query: {query}

Provide a natural, helpful response about the products found. Include names, prices, and key features.`
  );

  const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

  return {
    invoke: async (query: string, limit = 5) => {
      // Retrieve products semantically
      const products = await retrieveProducts(query, limit);

      if (products.length === 0) {
        return "I couldn't find any products matching your search. Try different keywords!";
      }

      // Build context from retrieved products
      const context = products
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} - $${p.base_price} (Rating: ${p.rating}/5, Stock: ${p.stock_quantity}) — ${p.description?.substring(0, 100) || 'No description'}`
        )
        .join('\n');

      return chain.invoke({ query, context });
    },
  };
}
