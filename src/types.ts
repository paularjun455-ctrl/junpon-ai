export interface User {
  name: string;
  email: string;
  isPro: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  attachment?: {
    url: string;
    mimeType: string;
    name: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  prompt: string;
  url: string;
  favorite: boolean;
  time: string;
  style: string;
  sourceUrl?: string;
}

export interface ToolInfo {
  title: string;
  sub: string;
  icon: string;
  bg: string;
  color: string;
  route: string;
}

export type Route =
  | 'splash'
  | 'login'
  | 'home'
  | 'chat'
  | 'imagegen'
  | 'editor'
  | 'history'
  | 'favorites'
  | 'profile'
  | 'settings'
  | 'subscription'
  | 'search';
