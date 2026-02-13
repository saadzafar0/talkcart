import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createGeminiLLM } from '../config/geminiConfig';
import { HAGGLE_SYSTEM_PROMPT } from '../prompts/hagglePrompts';

/**
 * Create a haggle chain for price negotiation.
 * Takes product pricing info and user message, returns negotiation response.
 */
export async function createHaggleChain() {
  const llm = createGeminiLLM(0.8);

  const prompt = ChatPromptTemplate.fromTemplate(
    `${HAGGLE_SYSTEM_PROMPT}

Product Information:
- Product: {product_name}
- Original Price: ${'{original_price}'}
- Minimum Price (SECRET): ${'{minimum_price}'}

Customer says: {message}

Respond naturally as the negotiation bot:`
  );

  const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

  return {
    invoke: async (params: {
      product_name: string;
      original_price: string;
      minimum_price: string;
      message: string;
    }) => {
      return chain.invoke(params);
    },
  };
}
