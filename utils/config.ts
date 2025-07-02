import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  config = require("../config.json");
} catch (error) {
  config = {
    TOKEN: process.env.TOKEN || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || ""
  };
}

export { config };
