import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import assistant from "./agents/assistant";

export const mastra = new Mastra({
  agents: { assistant },
  storage: new LibSQLStore({
    url: "file:./mastra.db"
  }),

  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  })
});
