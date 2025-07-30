# Evelyn - Discord AI Assistant

Evelyn is a friendly Discord bot that can chat with you and help you with various tasks. It's powered by AI and can connect to your GitHub and Todoist accounts to help you manage your projects and tasks.

## What can Evelyn do?

- **Chat with you**: Evelyn can have natural conversations and answer your questions
- **GitHub integration**: Help you manage your GitHub repositories, issues, and pull requests
- **Todoist integration**: Create, update, and manage your tasks and to-do lists
- **Slash commands**: Use commands like `/help`, `/ping`, `/uptime`, and `/invite`

## Setup

### Prerequisites

- Node.js 16.11.0 or higher
- A Discord bot token
- An OpenAI API key
- (Optional) GitHub personal access token
- (Optional) Todoist API token

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd evelyn-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up configuration**
   - Copy `config.json.example` to `config.json`
   - Fill in your API keys and tokens:
     ```json
     {
       "TOKEN": "your-discord-bot-token",
       "OPENAI_API_KEY": "your-openai-api-key",
       "GITHUB_TOKEN": "your-github-personal-access-token",
       "GITHUB_USERNAME": "your-github-username",
       "TODOIST_TOKEN": "your-todoist-api-token"
     }
     ```

4. **Run the bot**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run prod
   ```

## How to use

1. **Invite the bot to your Discord server** using the `/invite` command
2. **Start chatting** by sending Evelyn a direct message
3. **Use slash commands** in any channel where the bot is present
4. **Ask for help** with `/help` to see all available commands

## Features

### Chat

- Send Evelyn a direct message and she'll respond like a helpful friend
- She remembers your conversation history
- She can help with general questions and tasks

### GitHub Tools

- List your repositories
- Create and manage issues
- Handle pull requests
- Get repository information

### Todoist Tools

- Create new tasks
- Update existing tasks
- Mark tasks as complete
- Delete tasks
- Set due dates and priorities

## Commands

- `/help` - Shows all available commands
- `/ping` - Check if the bot is responding
- `/uptime` - See how long the bot has been running
- `/invite` - Get an invite link for the bot
