import * as vscode from 'vscode';

export class FreebuffCodeProvider implements vscode.TreeDataProvider<ChatItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChatItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private chatHistory: ChatMessage[] = [];

    constructor(private context: vscode.ExtensionContext) {
        // Load chat history from storage
        this.context.globalState.get<ChatMessage[]>('chatHistory', []).forEach(msg => {
            this.chatHistory.push(msg);
        });
    }

    getTreeItem(element: ChatItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChatItem): Thenable<ChatItem[]> {
        if (!element) {
            // Return recent chat sessions
            return Promise.resolve(this.getRecentSessions());
        }
        return Promise.resolve([]);
    }

    private getRecentSessions(): ChatItem[] {
        const items: ChatItem[] = [];
        
        // Add current conversation
        items.push(new ChatItem(
            'Current Conversation',
            '💬',
            vscode.TreeItemCollapsibleState.None,
            'current'
        ));

        // Add recent history
        const recentMessages = this.chatHistory.slice(-10).reverse();
        for (const msg of recentMessages) {
            if (msg.role === 'user') {
                const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
                items.push(new ChatItem(
                    `User: ${preview}`,
                    '👤',
                    vscode.TreeItemCollapsibleState.None,
                    `msg-${msg.id}`
                ));
            }
        }

        return items;
    }

    addMessage(role: 'user' | 'assistant', content: string) {
        const msg: ChatMessage = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        this.chatHistory.push(msg);
        
        // Save to global state
        this.context.globalState.update('chatHistory', this.chatHistory);
        
        // Notify tree view
        this._onDidChangeTreeData.fire(undefined);
    }

    clearHistory() {
        this.chatHistory = [];
        this.context.globalState.update('chatHistory', []);
        this._onDidChangeTreeData.fire(undefined);
    }

    getLastAssistantMessage(): string | null {
        for (let i = this.chatHistory.length - 1; i >= 0; i--) {
            if (this.chatHistory[i].role === 'assistant') {
                return this.chatHistory[i].content;
            }
        }
        return null;
    }
}

export class ChatItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly icon: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly id: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
    }
}

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}
