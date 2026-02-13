import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseMessage } from '@langchain/core/messages';
import { createGeminiLLM } from '../config/geminiConfig';
import { CLERK_SYSTEM_PROMPT } from '../prompts/clerkPersonality';

/**
 * Create a simple conversation chain (without tool calling).
 * Useful for general chitchat that doesn't require product search or cart actions.
 */
export async function createConversationChain() {
  const llm = createGeminiLLM(0.7);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', CLERK_SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);

  const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

  return {
    invoke: async (input: string, chatHistory: BaseMessage[] = []) => {
      return chain.invoke({ input, chat_history: chatHistory });
    },
  };
}
