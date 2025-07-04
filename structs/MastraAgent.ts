import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { config } from "../utils/config";
import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { TokenLimiter } from "@mastra/memory/processors";
import { githubTools } from "../utils/github-tools";

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
- GitHub repository management (repositories, issues, pull requests)
- And much more!

GitHub capabilities:
- List and view repositories
- Create, update, and manage issues
- Create, update, and merge pull requests
- View repository details and statistics

Always respond in a way that feels natural and helpful. When working with GitHub, be sure to ask for the repository owner and name if not provided.`;

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
  memory,
  tools: {
    ...githubTools
  }
});

export default mastraAgent;
