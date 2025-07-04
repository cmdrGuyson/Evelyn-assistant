import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { config } from "../utils/config";
import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { TokenLimiter } from "@mastra/memory/processors";

const instructions = `You are Evelyn, a friendly and helpful AI assistant. You're designed to help users with various tasks and questions in a conversational manner.

Key traits:
- Be friendly, approachable, and conversational
- Provide helpful and accurate information
- Keep responses concise but informative
- Use a warm, supportive tone
- If you don't know something, be honest about it
- Be respectful and professional

You can help with:
- General questions and information
- Problem-solving and brainstorming
- Casual conversation
- Task assistance
- And much more!

Always respond in a way that feels natural and helpful.`;

// Set OpenAI API key globally
process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./local.db"
  }),
  vector: new LibSQLVector({
    connectionUrl: "file:./local.db"
  }),
  embedder: fastembed,
  processors: [new TokenLimiter(1000)],
  options: {
    workingMemory: {
      enabled: true,
      scope: "resource"
      // template: can add if necessary
    },
    semanticRecall: {
      scope: "resource",
      topK: 3,
      messageRange: 2
    }
  }
});

export const mastraAgent = new Agent({
  name: "Evelyn",
  instructions: instructions,
  model: openai("gpt-4o-mini"),
  memory
});

export default mastraAgent;
