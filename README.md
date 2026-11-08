# Freebuff Code - VS Code Extension

A Visual Studio Code chat panel and integrated-terminal launcher for the **Freebuff CLI**. Use Freebuff's interactive coding agent in the same workspace, without configuring an API key.

## ✨ Features

- 💬 **Chat Interface** - Interactive chat window for code-related questions (like GitHub Copilot Chat)
- 🤖 **Freebuff CLI Integration** - Launches the existing Freebuff agent in VS Code's integrated terminal
- 🤖 **API Mode Option** - Can also use direct API calls if configured
- ⚙️ **Configurable** - Toggle between CLI and API modes
- 📋 **Copy Responses** - Easily copy code and responses
- 🗑️ **Clear Chat** - Start fresh conversations anytime
- 🎯 **Code-Focused** - Optimized for code generation, debugging, and explanation
- ✏️ **Apply Code Changes** - Preview and apply AI-generated code changes to your files
- 📤 **Send Selection** - Send selected code to chat with Ctrl+Shift+Enter
- ⚡ **Quick Actions** - Quick prompts for common tasks (Explain, Refactor, Add tests, etc.)
- 🌳 **Workspace-aware** - Starts Freebuff in the current workspace

## 📋 Prerequisites

### Freebuff CLI Installation

The extension uses the Freebuff CLI by default. Make sure it's installed:

```bash
# Install Freebuff CLI globally
npm install -g freebuff

# Verify installation
freebuff --version

# Login to Freebuff (required before using the extension)
freebuff login
```

After running `freebuff login`, follow the prompts to authenticate.

## 🚀 Installation

### From Source

1. Clone or download this extension
2. Open the extension folder in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to run the extension in development mode
5. To package: Run `npm run compile` then use VS Code's "Publish Extension" or `vsce package`

### Manual Installation

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Click "Install from VSIX..."
4. Select the packaged `.vsix` file

## ⚙️ Configuration

Open Settings (`Ctrl+,` or `Cmd+,`) and search for **"Freebuff Code"**:

### Core Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `freebuffCode.useCli` | `true` | Use Freebuff CLI instead of API (recommended) |

### CLI Mode (Default)

Freebuff is an interactive terminal coding agent, not a chat API. When `useCli`
is `true`, choose **Freebuff Code: Open Agent in Terminal** or click **Open
Agent** in the chat panel. The extension opens Freebuff in VS Code's integrated
terminal at the current workspace, where you can chat with the agent and let it
edit your project. No API key is needed.

The chat panel cannot send messages to or display responses from the interactive
CLI. Its input will remain available to copy, and it will direct you to the
Freebuff terminal. To use the panel's in-editor chat input, configure an API key
and set `freebuffCode.useCli` to `false`.

**Before using:**
```bash
# Login to Freebuff
freebuff login

# Verify it works
freebuff doctor
```

### API Mode (Optional)

When `useCli` is `false`, you can use direct API calls:

| Setting | Default | Description |
|---------|---------|-------------|
| `freebuffCode.apiKey` | `""` | Freebuff API key for authentication |
| `freebuffCode.baseUrl` | `https://api.freebuff.com` | Freebuff API base URL |
| `freebuffCode.defaultModel` | `solar-pro` | Default AI model to use |
| `freebuffCode.temperature` | `0.7` | Response creativity (0-2) |
| `freebuffCode.maxTokens` | `4096` | Maximum response length |
| `freebuffCode.systemPrompt` | `"You are Freebuff Code..."` | Custom system prompt |

### Supported Models

| Model | Provider | Description |
|-------|----------|-------------|
| `solar-pro` | Upstage | High-quality Korean AI model (default) |
| `solar-mini` | Upstage | Lightweight Solar model |
| `gpt-4` | OpenAI | GPT-4 model |
| `gpt-4-turbo` | OpenAI | GPT-4 Turbo (faster) |
| `gpt-3.5-turbo` | OpenAI | GPT-3.5 Turbo |
| `claude-3-opus` | Anthropic | Claude 3 Opus (most capable) |
| `claude-3-sonnet` | Anthropic | Claude 3 Sonnet (balanced) |
| `claude-3-haiku` | Anthropic | Claude 3 Haiku (fastest) |
| `claude-code` | Anthropic | Claude Code optimized |

## 📖 Usage

### First-Time Setup

1. **Install Freebuff CLI** (if not already installed):
   ```bash
   npm install -g freebuff
   ```

2. **Login to Freebuff**:
   ```bash
   freebuff login
   ```
   Follow the prompts in your terminal to complete login.

3. **Open the Extension**:
   - Press `F5` in the extension folder, OR
   - Open VS Code, press `Ctrl+Shift+P`, type "Freebuff Code: Start Chat"

4. **Start Chatting**!

### Starting a Chat

1. **From Command Palette**: Press `Ctrl+Shift+P` or `Cmd+Shift+P`, type "Freebuff Code: Start Chat"
2. **From Sidebar**: Click the chat icon in the activity bar
3. **From Context Menu**: Right-click in editor and select "Freebuff Code: Start Chat"
4. **Toggle Chat**: Run **Freebuff Code: Toggle Chat** or press `Ctrl+Shift+I`
5. **Open the coding agent**: Run **Freebuff Code: Open Agent in Terminal** or
   click **Open Agent** in the panel

### Using the Chat

1. The chat panel will open in a new tab
2. Select your preferred model from the dropdown (API mode only)
3. Type your question in the input field
4. Press `Enter` to send (use `Shift+Enter` for new line)
5. Wait for the AI response
6. Click 📋 Copy to copy code snippets

### Example Prompts

```
Write a Python function to sort a list using quicksort
```

```
Explain what this code does: [select code and ask]
```

```
Fix the bug in this JavaScript function: [paste code]
```

```
Refactor this code to be more efficient: [paste code]
```

```
Create a REST API endpoint in Node.js using Express
```

```
Find memory leaks in this code
```

```
Add unit tests for this function
```

### Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Freebuff Code: Toggle Chat | Ctrl+Shift+I | Show or hide the chat panel |
| Freebuff Code: Open Agent in Terminal | — | Start Freebuff in the integrated terminal |
| Freebuff Code: Clear Chat | Chat panel button | Clear conversation history |
| Freebuff Code: Copy Last Response | Chat panel button | Copy the last AI response |
| Freebuff Code: Apply Code Change | Chat panel button | Apply AI-generated code to file |
| Freebuff Code: Send Selection | Ctrl+Shift+Enter | Send selected code to chat |
| Freebuff Code: Quick Prompt | Chat panel | Quick action prompts (Explain, Refactor, etc.)

### Login Button

If the extension detects Freebuff CLI is not logged in:
1. Click the **🔐 Login** button in the chat panel header
2. A terminal will open with `freebuff login`
3. Complete the login process
4. Return to the chat panel and try again

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Esc` | Close chat panel |

## 💡 Tips for Best Results

1. **Be Specific**: Clearly describe what you want
2. **Include Context**: Share relevant code when asking for help
3. **Specify Language**: Mention the programming language
4. **Use Project Files**: With CLI mode, Freebuff can see your project files
5. **Iterate**: Refine your questions based on responses

## 🔧 Troubleshooting

### "Freebuff CLI not found" Error

**Solution**: Install Freebuff CLI globally:
```bash
npm install -g freebuff
```

Verify installation:
```bash
freebuff --version
```

### "Not logged in" or Login Required

**Solution**: Login to Freebuff CLI:
```bash
freebuff login
```

Or use the **🔐 Login** button in the chat panel.

### CLI Mode Not Working

1. Check if Freebuff is installed: `freebuff --version`
2. Check login status: `freebuff doctor`
3. Try switching to API mode in settings (set `freebuffCode.useCli` to `false`)
4. Configure API key if using API mode

### No Response from CLI

1. Make sure you're logged in: `freebuff login`
2. Check your internet connection
3. Try running `freebuff` directly in terminal to verify it works
4. Check the Output panel (`Ctrl+Shift+U` → "Extension Host") for errors

### API Mode Errors

| Error | Solution |
|-------|----------|
| "API key not configured" | Set `freebuffCode.apiKey` in settings |
| "API error 401" | Check your API key is correct |
| "API error 404" | Verify `freebuffCode.baseUrl` is correct |
| "Model not found" | Try a different model from the dropdown |

## 🛠 Development

### Project Structure

```
freebuff-code-extension/
├── src/
│   ├── extension.ts         # Main extension entry point & CLI integration
│   ├── chatProvider.ts      # Sidebar tree view provider
│   └── webview/
│       └── chatPanel.html   # Chat panel UI (HTML/CSS/JS)
├── .vscode/
│   ├── launch.json         # F5 debug configuration
│   └── tasks.json          # Build tasks
├── package.json            # Extension manifest & settings
├── tsconfig.json           # TypeScript config
├── webpack.config.js       # Build configuration
├── .vscodeignore          # Files to exclude from package
└── README.md              # This file
```

### Building & Running

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run extension in debug mode
# 1. Open this folder in VS Code
# 2. Press F5
# 3. Extension Development Host window opens
```

### Debugging

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in `src/extension.ts`
4. View logs: View → Output → "Extension Host"

### Packaging

```bash
# Install vsce
npm install -g @vscode/vsce

# Package the extension
vsce package

# Install the .vsix file manually
```

## 📝 How It Works (CLI Mode)

In CLI mode, the extension opens `freebuff` in the integrated terminal using
the current workspace as its working directory. Interact with the agent in
that terminal; the CLI manages its own conversation and project context.

## 📄 License

This extension is provided as-is. Check Freebuff's terms of service for usage guidelines.

## 🆘 Support

- **Freebuff CLI Issues**: Run `freebuff doctor` or visit freebuff.com
- **Extension Issues**: Check the Output panel for error details
- **Configuration**: Open Settings and search for "Freebuff Code"
