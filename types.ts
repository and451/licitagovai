export enum SenderType {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  type: 'TR' | 'ETP' | 'EDITAL';
}

export enum AppView {
  CHAT = 'CHAT',
  DOC_GENERATOR = 'DOC_GENERATOR',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE'
}