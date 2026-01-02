import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    formDefinition?: any; // Optionnel, si un formulaire a été généré
}

export interface IConversation extends Document {
    conversationId: string;
    userId: string;
    title: string;
    messages: IMessage[];
    lastUpdated: Date;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    formDefinition: { type: Schema.Types.Mixed },
});

const ConversationSchema = new Schema<IConversation>({
    conversationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Nouvelle conversation' },
    messages: [MessageSchema],
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

// Index pour recherche rapide par utilisateur
ConversationSchema.index({ userId: 1, lastUpdated: -1 });

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
