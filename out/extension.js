"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const chatProvider_1 = require("./chatProvider");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let chatProvider;
let panel;
let freebuffTerminal;
function activate(context) {
    console.log('Freebuff Code extension is now active!');
    // Create chat provider
    chatProvider = new chatProvider_1.FreebuffCodeProvider(context);
    // Register commands
    const startChatCommand = vscode.commands.registerCommand('freebuffCode.startChat', () => {
        startChatPanel(context);
    });
    const toggleChatCommand = vscode.commands.registerCommand('freebuffCode.toggleChat', () => {
        if (panel?.visible) {
            panel.dispose();
        }
        else {
            startChatPanel(context);
        }
    });
    const openAgentCommand = vscode.commands.registerCommand('freebuffCode.openAgent', () => {
        openFreebuffTerminal();
    });
    const clearChatCommand = vscode.commands.registerCommand('freebuffCode.clearChat', () => {
        if (panel) {
            panel.webview.postMessage({ command: 'clearChat' });
        }
    });
    const copyLastResponseCommand = vscode.commands.registerCommand('freebuffCode.copyLastResponse', () => {
        if (panel) {
            panel.webview.postMessage({ command: 'copyLastResponse' });
        }
    });
    const applyCodeCommand = vscode.commands.registerCommand('freebuffCode.applyCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        // Get the last assistant message from the chat
        const lastResponse = chatProvider?.getLastAssistantMessage();
        if (!lastResponse) {
            vscode.window.showWarningMessage('No AI response available to apply');
            return;
        }
        // Try to extract code blocks from the response
        const codeBlocks = extractCodeBlocks(lastResponse);
        if (codeBlocks.length === 0) {
            vscode.window.showWarningMessage('No code blocks found in the response');
            return;
        }
        // Show diff/preview for each code block
        for (const codeBlock of codeBlocks) {
            await showCodeDiffPreview(editor, codeBlock);
        }
    });
    const showDiffCommand = vscode.commands.registerCommand('freebuffCode.showDiff', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const lastResponse = chatProvider?.getLastAssistantMessage();
        if (!lastResponse) {
            vscode.window.showWarningMessage('No AI response available');
            return;
        }
        const codeBlocks = extractCodeBlocks(lastResponse);
        if (codeBlocks.length === 0) {
            vscode.window.showWarningMessage('No code blocks found');
            return;
        }
        // Show quick pick to select which code block to apply
        const selections = codeBlocks.map((cb, i) => ({
            label: cb.language || `Code Block ${i + 1}`,
            description: `${cb.language || 'text'} - ${cb.code.substring(0, 50)}...`,
            code: cb.code,
            language: cb.language
        }));
        const selected = await vscode.window.showQuickPick(selections, {
            placeHolder: 'Select a code block to apply',
            matchOnDescription: true
        });
        if (selected) {
            await showCodeDiffPreview(editor, selected);
        }
    });
    const sendSelectionCommand = vscode.commands.registerCommand('freebuffCode.sendSelection', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showWarningMessage('No text selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        startChatPanel(context, `Here's my code:\n\n${selectedText}\n\nPlease help me with this code:`);
    });
    const quickPromptCommand = vscode.commands.registerCommand('freebuffCode.quickPrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const config = vscode.workspace.getConfiguration('freebuffCode');
        const quickActions = config.get('quickActions') || [
            'Explain this code',
            'Refactor this code',
            'Add error handling',
            'Write unit tests',
            'Optimize this code'
        ];
        const selected = await vscode.window.showQuickPick(quickActions, {
            placeHolder: 'Select a quick action'
        });
        if (selected && !editor.selection.isEmpty) {
            const selectedText = editor.document.getText(editor.selection);
            startChatPanel(context, `${selected}:\n\n${selectedText}`);
        }
        else if (selected) {
            startChatPanel(context, selected);
        }
    });
    context.subscriptions.push(startChatCommand, toggleChatCommand, openAgentCommand, clearChatCommand, copyLastResponseCommand, applyCodeCommand, showDiffCommand, sendSelectionCommand, quickPromptCommand);
    // Load configuration and show panel if enabled
    const config = vscode.workspace.getConfiguration('freebuffCode');
    if (config.get('showPanel')) {
        startChatPanel(context);
    }
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('freebuffCode')) {
            if (panel) {
                panel.webview.postMessage({ command: 'configUpdated', config: getConfig() });
            }
        }
    }));
    // Register tree data provider
    const treeView = vscode.window.createTreeView('freebuffCodeChat', {
        treeDataProvider: chatProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);
}
function startChatPanel(context, initialMessage) {
    if (panel) {
        panel.reveal(vscode.ViewColumn.One);
        if (initialMessage) {
            panel.webview.postMessage({ command: 'sendMessage', text: initialMessage });
        }
        return;
    }
    panel = vscode.window.createWebviewPanel('freebuffCodeChat', 'Freebuff Code Chat', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [context.extensionUri]
    });
    // Read the HTML file
    const htmlPath = path.join(context.extensionUri.fsPath, 'src', 'webview', 'chatPanel.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    panel.webview.html = htmlContent;
    panel.onDidDispose(() => {
        panel = undefined;
    }, null, context.subscriptions);
    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'sendMessage':
                await handleSendMessage(message.text);
                break;
            case 'changeModel':
                console.log(`Model changed to: ${message.model}`);
                break;
            case 'copyResponse':
                await vscode.env.clipboard.writeText(message.text);
                break;
            case 'triggerLogin':
                triggerFreebuffLogin(context);
                break;
            case 'openAgent':
                openFreebuffTerminal();
                break;
            case 'getConfig':
                panel?.webview.postMessage({ command: 'configUpdated', config: getConfig() });
                break;
            case 'applyCodeBlock':
                await handleApplyCodeBlock(message.code, message.filePath, message.language, context);
                break;
            case 'createNewFile':
                await handleCreateNewFile(message.filePath, message.code, context);
                break;
        }
    }, undefined, context.subscriptions);
    // Send initial config
    panel.webview.postMessage({ command: 'configUpdated', config: getConfig() });
}
async function handleSendMessage(message) {
    if (!panel)
        return;
    const config = vscode.workspace.getConfiguration('freebuffCode');
    const useCli = config.get('useCli') ?? true;
    const model = config.get('defaultModel') || 'solar-pro';
    if (useCli) {
        openFreebuffTerminal();
        panel.webview.postMessage({
            command: 'showError',
            text: 'Freebuff is open in the integrated terminal. This message was not sent; type your prompt in the Freebuff Agent terminal.'
        });
        return;
    }
    try {
        panel.webview.postMessage({ command: 'showTyping' });
        const response = await callFreebuffApi(message, config);
        // Wait a bit before hiding typing to ensure smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        panel?.webview.postMessage({
            command: 'messageResponse',
            text: response,
            model: model
        });
    }
    catch (error) {
        console.error('Freebuff error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        panel?.webview.postMessage({
            command: 'showError',
            text: `Error: ${errorMessage}`
        });
        vscode.window.showErrorMessage(`Freebuff Code: ${errorMessage}`);
    }
}
function openFreebuffTerminal() {
    freebuffTerminal = vscode.window.terminals.find(terminal => terminal.name === 'Freebuff Agent');
    if (!freebuffTerminal) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        freebuffTerminal = vscode.window.createTerminal({
            name: 'Freebuff Agent',
            cwd: workspaceFolder?.uri.fsPath
        });
        freebuffTerminal.sendText('freebuff', true);
    }
    freebuffTerminal.show();
}
async function callFreebuffApi(message, config) {
    const apiKey = config.get('apiKey') || '';
    const baseUrl = config.get('baseUrl') || 'https://api.freebuff.com';
    const model = config.get('defaultModel') || 'solar-pro';
    const temperature = config.get('temperature') ?? 0.7;
    const maxTokens = config.get('maxTokens') ?? 4096;
    const systemPrompt = config.get('systemPrompt') || '';
    if (!apiKey) {
        throw new Error('API key not configured. Please set freebuffCode.apiKey in settings.');
    }
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: temperature,
            max_tokens: maxTokens,
            stream: false
        })
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error ${response.status}: ${errorBody}`);
    }
    const data = await response.json();
    // Handle different response formats
    if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
        return data.choices[0].message.content;
    }
    else if (data.response?.content) {
        return data.response.content;
    }
    else if (data.text) {
        return data.text;
    }
    else {
        throw new Error('Unexpected response format from API');
    }
}
function extractCodeBlocks(text) {
    const codeBlocks = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        codeBlocks.push({
            code: match[2].trim(),
            language: match[1] || null
        });
    }
    return codeBlocks;
}
async function showCodeDiffPreview(editor, codeBlock) {
    const document = editor.document;
    const originalText = document.getText();
    // Try to detect the language from the document
    const documentLang = document.languageId;
    // Create a temporary document with the new code
    const tempDoc = await vscode.workspace.openTextDocument({
        content: codeBlock.code,
        language: codeBlock.language || documentLang
    });
    // Show the diff
    await vscode.commands.executeCommand('vscode.diff', vscode.Uri.from(document.uri), vscode.Uri.from(tempDoc.uri), `Apply Code Change - ${document.fileName}`);
    const selected = await vscode.window.showInformationMessage('Do you want to apply this change?', { modal: true }, 'Apply', 'Cancel');
    if (selected === 'Apply') {
        await editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(document.positionAt(0), document.positionAt(originalText.length)), codeBlock.code);
        });
        vscode.window.showInformationMessage('Code updated successfully!');
    }
}
async function handleApplyCodeBlock(code, filePath, language, context) {
    if (!filePath) {
        vscode.window.showErrorMessage('No file path provided');
        return;
    }
    try {
        // Resolve the file path relative to workspace
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullPath = workspaceFolder ? path.join(workspaceFolder, filePath) : filePath;
        // Check if file exists
        if (fs.existsSync(fullPath)) {
            // Create a diff view
            const tempDoc = await vscode.workspace.openTextDocument({
                content: code,
                language: language || 'plaintext'
            });
            await vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(fullPath), vscode.Uri.from(tempDoc.uri), `Apply changes to ${path.basename(fullPath)}`);
            const selected = await vscode.window.showInformationMessage('Apply these changes?', { modal: true }, 'Apply', 'Cancel');
            if (selected === 'Apply') {
                fs.writeFileSync(fullPath, code, 'utf-8');
                vscode.window.showInformationMessage(`File updated: ${filePath}`);
                // Open the file
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fullPath));
                await vscode.window.showTextDocument(doc);
            }
        }
        else {
            // Create new file
            fs.writeFileSync(fullPath, code, 'utf-8');
            vscode.window.showInformationMessage(`File created: ${filePath}`);
            // Open the file
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fullPath));
            await vscode.window.showTextDocument(doc);
        }
    }
    catch (error) {
        console.error('Error applying code block:', error);
        vscode.window.showErrorMessage(`Failed to apply code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function handleCreateNewFile(filePath, code, context) {
    if (!filePath) {
        vscode.window.showErrorMessage('No file path provided');
        return;
    }
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullPath = workspaceFolder ? path.join(workspaceFolder, filePath) : filePath;
        // Create directory if it doesn't exist
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Check if file already exists
        if (fs.existsSync(fullPath)) {
            const selected = await vscode.window.showWarningMessage(`File already exists: ${filePath}`, { modal: true }, 'Overwrite', 'Cancel');
            if (selected !== 'Overwrite') {
                return;
            }
        }
        fs.writeFileSync(fullPath, code, 'utf-8');
        vscode.window.showInformationMessage(`File created: ${filePath}`);
        // Open the file
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fullPath));
        await vscode.window.showTextDocument(doc);
    }
    catch (error) {
        console.error('Error creating file:', error);
        vscode.window.showErrorMessage(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function getConfig() {
    const config = vscode.workspace.getConfiguration('freebuffCode');
    // Check if freebuff CLI is available
    let cliAvailable = false;
    try {
        const { execSync } = require('child_process');
        execSync('freebuff --version', { stdio: 'ignore' });
        cliAvailable = true;
    }
    catch (e) {
        cliAvailable = false;
    }
    return {
        apiKey: config.get('apiKey') ? '••••••••' : '',
        hasApiKey: !!config.get('apiKey'),
        baseUrl: config.get('baseUrl'),
        defaultModel: config.get('defaultModel'),
        models: [
            { id: 'solar-pro', name: 'Solar Pro', provider: 'Upstage' },
            { id: 'solar-mini', name: 'Solar Mini', provider: 'Upstage' },
            { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
            { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
            { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
            { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
            { id: 'claude-code', name: 'Claude Code', provider: 'Anthropic' }
        ],
        temperature: config.get('temperature'),
        maxTokens: config.get('maxTokens'),
        systemPrompt: config.get('systemPrompt'),
        inlineSuggestions: config.get('inlineSuggestions'),
        useCli: config.get('useCli') ?? true,
        cliAvailable: cliAvailable
    };
}
function triggerFreebuffLogin(context) {
    // Open a terminal and run freebuff login
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Opening Freebuff Login...',
        cancellable: false
    }, async () => {
        const terminal = vscode.window.createTerminal({
            name: 'Freebuff Login',
            shellPath: process.env.SHELL || 'cmd.exe'
        });
        terminal.sendText('freebuff login', true);
        terminal.show(true);
        vscode.window.showInformationMessage('Freebuff login terminal opened. Follow the prompts to login, then refresh the chat panel.', { modal: false });
    });
}
function deactivate() {
    console.log('Freebuff Code extension is now deactivated.');
}
//# sourceMappingURL=extension.js.map