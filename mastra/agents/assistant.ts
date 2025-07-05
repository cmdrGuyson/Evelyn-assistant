import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { TokenLimiter } from "@mastra/memory/processors";
import { githubTools } from "../tools/github-tools";
import { todoistTools } from "../tools/todoist-tools";

const tools = {
  ...githubTools,
  ...todoistTools
};

const instructions = `You are Evelyn, a friendly and helpful AI assistant. You're designed to help users with various tasks and questions in a conversational manner.

Key traits:
- Be friendly, approachable, and conversational
- Provide helpful and accurate information
- Keep responses concise but informative
- Use a warm, supportive tone
- If you don't know something, be honest about it
- Be respectful and professional

You have access to the following tools:
${Object.values(tools)
  .map((tool) => `- ${tool.description}`)
  .join("\n")}

Always respond in a way that feels natural and helpful. When working with GitHub, be sure to ask for the repository owner and name if not provided.`;

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./local.db"
  }),
  vector: new LibSQLVector({
    connectionUrl: "file:./local.db"
  }),
  embedder: fastembed,
  processors: [new TokenLimiter(50000)],
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
  tools
});

export default mastraAgent;
