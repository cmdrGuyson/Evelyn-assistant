# Evelyn Assistant

A friendly Discord bot with AI-powered conversation capabilities using Mastra agents.

## Features

- **Slash Commands**: Traditional Discord slash commands for various utilities
- **AI-Powered DMs**: Direct messages are automatically processed by a Mastra AI agent
- **Friendly Personality**: The AI assistant (Evelyn) responds in a warm, helpful manner

## Setup

1. **Install Dependencies**

   ```bash
   yarn install
   ```

2. **Configuration**
   Create a `config.json` file based on `config.json.example`:

   ```json
   {
     "TOKEN": "your-discord-bot-token",
     "OPENAI_API_KEY": "your-openai-api-key"
   }
   ```

   Or use environment variables:

   ```bash
   export TOKEN="your-discord-bot-token"
   export OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Run the Bot**

   ```bash
   # Development
   yarn dev

   # Production
   yarn start
   ```

## How It Works

### Slash Commands

The bot responds to traditional Discord slash commands for utilities like:

- `/ping` - Check bot latency
- `/help` - Show available commands
- `/uptime` - Show bot uptime
- `/invite` - Get bot invite link

### AI-Powered Direct Messages

When users send direct messages to the bot (not slash commands), the message is automatically processed by a Mastra AI agent named "Evelyn". The agent:

- Responds conversationally and helpfully
- Can answer questions, provide information, and engage in casual conversation
- Uses GPT-4o-mini for intelligent responses
- Maintains context and provides natural interactions

## Technical Details

- **Framework**: Discord.js v14
- **AI Integration**: Mastra Core with OpenAI
- **Language**: TypeScript
- **Package Manager**: Yarn

## Development

```bash
# Build the project
yarn build

# Run in development mode with auto-restart
yarn dev

# Format code
yarn format
```

## Architecture

- `index.ts` - Main entry point
- `structs/Bot.ts` - Core bot logic and message handling
- `structs/MastraAgent.ts` - AI agent configuration
- `commands/` - Slash command implementations
- `interfaces/` - TypeScript type definitions
- `utils/` - Utility functions and configuration
