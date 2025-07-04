# Evelyn Assistant

A friendly Discord bot powered by Mastra AI with GitHub integration capabilities.

## Features

- **Conversational AI**: Powered by OpenAI's GPT-4o-mini
- **Memory**: Persistent conversation memory using LibSQL
- **GitHub Integration**: Full GitHub repository management capabilities
- **Discord Bot**: Seamless Discord integration

## GitHub Integration

Evelyn now includes comprehensive GitHub management tools that allow you to:

### Repository Management

- List all your repositories
- Get detailed repository information
- View repository statistics

### Issue Management

- List issues from repositories
- Create new issues
- Update existing issues
- Close issues

### Pull Request Management

- List pull requests
- Create new pull requests
- Update pull request details
- Merge pull requests

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configuration

Copy the example configuration and fill in your credentials:

```bash
cp config.json.example config.json
```

Edit `config.json` with your credentials:

```json
{
  "TOKEN": "your-discord-bot-token",
  "OPENAI_API_KEY": "your-openai-api-key",
  "GITHUB_TOKEN": "your-github-personal-access-token",
  "GITHUB_USERNAME": "your-github-username"
}
```

### 3. GitHub Token Setup

To use GitHub features, you need to create a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
   - `read:user` (Read user data)

### 4. Environment Variables (Alternative)

You can also use environment variables instead of config.json:

```bash
export TOKEN="your-discord-bot-token"
export OPENAI_API_KEY="your-openai-api-key"
export GITHUB_TOKEN="your-github-personal-access-token"
export GITHUB_USERNAME="your-github-username"
```

## Usage

### Starting the Bot

```bash
# Development
yarn dev

# Production
yarn start
```

### GitHub Commands

Once the bot is running, you can interact with GitHub through natural language:

- "List my repositories"
- "Show issues for repository owner/repo-name"
- "Create an issue in owner/repo-name with title 'Bug fix needed'"
- "List pull requests in owner/repo-name"
- "Create a pull request from feature-branch to main in owner/repo-name"

## Architecture

The GitHub integration uses two approaches:

1. **Custom Tools**: Direct Octokit integration for specific GitHub operations
2. **MCP Server**: Model Context Protocol server for additional GitHub capabilities

This dual approach ensures maximum compatibility and functionality.

## Development

### Project Structure

```
├── structs/
│   └── MastraAgent.ts      # Main AI agent with GitHub tools
├── utils/
│   ├── github-mcp.ts       # MCP client configuration
│   ├── github-tools.ts     # Custom GitHub tools
│   └── config.ts           # Configuration management
├── commands/               # Discord bot commands
└── interfaces/             # TypeScript interfaces
```

### Adding New GitHub Tools

To add new GitHub functionality:

1. Create a new tool in `utils/github-tools.ts`
2. Export it from the `githubTools` object
3. The agent will automatically have access to it

## License

[Your License Here]
