export interface PendingAction {
    id: string;
    type: 'add_ingredient' | 'update_ingredient' | 'remove_ingredient';
    data: unknown;
    description: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    pendingAction?: PendingAction;
}
