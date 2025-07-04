import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  config = require("../config.json");
} catch (error) {
  config = {
    TOKEN: process.env.TOKEN || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
    GITHUB_USERNAME: process.env.GITHUB_USERNAME || ""
  };
}

export { config };
