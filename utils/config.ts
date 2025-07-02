import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  config = require("../config.json");
} catch (error) {
  config = {
    TOKEN: process.env.TOKEN || ""
  };
}

export { config };
