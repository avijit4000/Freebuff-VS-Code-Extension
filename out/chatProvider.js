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
exports.ChatItem = exports.FreebuffCodeProvider = void 0;
const vscode = __importStar(require("vscode"));
class FreebuffCodeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.chatHistory = [];
        // Load chat history from storage
        this.context.globalState.get('chatHistory', []).forEach(msg => {
            this.chatHistory.push(msg);
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Return recent chat sessions
            return Promise.resolve(this.getRecentSessions());
        }
        return Promise.resolve([]);
    }
    getRecentSessions() {
        const items = [];
        // Add current conversation
        items.push(new ChatItem('Current Conversation', '💬', vscode.TreeItemCollapsibleState.None, 'current'));
        // Add recent history
        const recentMessages = this.chatHistory.slice(-10).reverse();
        for (const msg of recentMessages) {
            if (msg.role === 'user') {
                const preview = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
                items.push(new ChatItem(`User: ${preview}`, '👤', vscode.TreeItemCollapsibleState.None, `msg-${msg.id}`));
            }
        }
        return items;
    }
    addMessage(role, content) {
        const msg = {
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
    getLastAssistantMessage() {
        for (let i = this.chatHistory.length - 1; i >= 0; i--) {
            if (this.chatHistory[i].role === 'assistant') {
                return this.chatHistory[i].content;
            }
        }
        return null;
    }
}
exports.FreebuffCodeProvider = FreebuffCodeProvider;
class ChatItem extends vscode.TreeItem {
    constructor(label, icon, collapsibleState, id) {
        super(label, collapsibleState);
        this.label = label;
        this.icon = icon;
        this.collapsibleState = collapsibleState;
        this.id = id;
        this.tooltip = this.label;
    }
}
exports.ChatItem = ChatItem;
//# sourceMappingURL=chatProvider.js.map