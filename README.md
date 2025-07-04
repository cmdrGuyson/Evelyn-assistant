```
I asked AI to write this README.md. So prepare for dissapointment
```

# Evelyn Assistant

A friendly Discord bot powered by Agentic AI with access to modular tools.

## 🚀 Features

- **Conversational AI**: Powered by OpenAI's GPT-4o-mini with natural language processing
- **Persistent Memory**: Conversation history and context using LibSQL with vector embeddings
- **GitHub Integration**: Full GitHub repository management capabilities via Octokit
- **Discord Bot**: Seamless Discord integration with slash commands and DM support
- **Real-time Logging**: Comprehensive logging system with multiple levels
- **Permission Management**: Role-based access control for commands
- **Cooldown System**: Rate limiting to prevent spam

## 📁 Project Structure

```
evelyn-assistant/
├── 📄 index.ts                 # Application entry point
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 nodemon.json             # Development server config
├── 📄 Dockerfile               # Container configuration
├── 📄 app.json                 # Application metadata
│
├── 🏗️ structs/                 # Core system components
│   ├── Bot.ts                  # Discord bot handler & event management
│   ├── MastraAgent.ts          # AI agent with memory & tools
│   └── Logger.ts               # Logging system with colored output
│
├── 🛠️ utils/                   # Utility functions & integrations
│   ├── config.ts               # Configuration management
│   ├── github-tools.ts         # GitHub API integration tools
│   ├── checkPermissions.ts     # Permission validation
│   └── MissingPermissionsException.ts
│
├── ⚡ commands/                # Discord slash commands
│   ├── help.ts                 # Help command
│   ├── invite.ts               # Bot invitation
│   ├── ping.ts                 # Latency check
│   └── uptime.ts               # Bot uptime
│
├── 📋 interfaces/              # TypeScript type definitions
│   ├── Command.ts              # Command interface
│   └── Config.ts               # Configuration interface
│
├── 💾 local.db*                # SQLite database (auto-generated)
└── 📖 README.md                # This file
```

## 🔧 Core Components

### 🤖 Bot.ts - Discord Bot Handler

- **Purpose**: Manages Discord client, events, and message processing
- **Key Features**:
  - Discord.js client initialization with proper intents
  - Slash command registration and handling
  - Direct message processing for AI conversations
  - Cooldown management and rate limiting
  - Permission checking for commands
  - Error handling and logging

### 🧠 MastraAgent.ts - AI Agent

- **Purpose**: Core AI processing with memory and tool integration
- **Key Features**:
  - OpenAI GPT-4o-mini integration
  - Persistent conversation memory using LibSQL
  - Vector embeddings for semantic search
  - GitHub tools integration
  - MCP (Model Context Protocol) server support
  - Token limiting and memory management

### 📝 Logger.ts - Logging System

- **Purpose**: Centralized logging with multiple levels and colored output
- **Log Levels**: Error, Log, Info, Warn, Debug
- **Features**: Type-based categorization, colored console output

### 🔑 GitHub Tools - Repository Management

- **Purpose**: Comprehensive GitHub API integration
- **Capabilities**:
  - Repository listing and details
  - Issue management (create, list, update, close)
  - Pull request operations (create, list, update, merge)
  - User and organization data access
  - Real-time API communication via Octokit

### 💾 Memory System

- **Storage**: LibSQL (SQLite-based) for persistent storage
- **Vector Store**: FastEmbed for semantic search
- **Features**:
  - Conversation history per user
  - Semantic recall for context
  - Working memory for active sessions
  - Token limiting to manage memory usage

## 🚀 Setup

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

## 🎯 Usage

### Starting the Bot

```bash
# Development with hot reload
yarn dev

# Production
yarn start

# Build and run production
yarn build && yarn prod
```

### Discord Commands

#### Slash Commands

- `/help` - Display available commands
- `/ping` - Check bot latency
- `/uptime` - Show bot uptime
- `/invite` - Get bot invitation link

#### Direct Messages

Send any message to Evelyn in a DM to start a conversation. The bot will:

- Process your message through the AI agent
- Access GitHub tools if needed
- Maintain conversation context
- Provide helpful responses

### GitHub Tools

Interact with GitHub through natural language in DMs:

- "List my repositories"
- "Show issues for repository owner/repo-name"
- "Create an issue in owner/repo-name with title 'Bug fix needed'"
- "List pull requests in owner/repo-name"
- "Create a pull request from feature-branch to main in owner/repo-name"

## 🔄 Data Flow

1. **Message Reception**: Discord Gateway → Bot.ts
2. **Command Processing**: Bot.ts → Command System → Permission Check
3. **AI Processing**: Bot.ts → MastraAgent.ts → OpenAI API
4. **Tool Execution**: MastraAgent.ts → Tools/MCP Server → GitHub API
5. **Memory Storage**: MastraAgent.ts → Memory System → Local Database
6. **Response**: MastraAgent.ts → Bot.ts → Discord Gateway

## 🔧 Development

### Adding New Commands

1. Create a new file in `commands/` directory
2. Export a command object with `data` and `execute` properties
3. The bot will automatically register it on startup

### Adding New Tools

1. Create a new tool in `utils/<tool-name>.ts`
2. Use the `createTool` function with proper schema validation
3. Export it from the `tools` object
4. The agent will automatically have access to it

or if you want to use a MCP server:

1. Expose and attach MCP server to the agent

### Memory Configuration

The memory system can be configured in `MastraAgent.ts`:

```typescript
const memory = new Memory({
  storage: new LibSQLStore({ url: "file:./local.db" }),
  vector: new LibSQLVector({ connectionUrl: "file:./local.db" }),
  embedder: fastembed,
  processors: [new TokenLimiter(1000)],
  options: {
    workingMemory: { enabled: true, scope: "resource" },
    semanticRecall: { scope: "resource", topK: 3, messageRange: 2 }
  }
});
```

## 📊 Monitoring

The system provides comprehensive logging:

- **Bot Events**: Command execution, user interactions, errors
- **AI Processing**: Agent responses, tool usage, memory operations
- **GitHub Operations**: API calls, repository actions, error handling
- **System Health**: Uptime, performance, resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
