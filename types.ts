export interface User {
  name: string;
  email: string;
  isPro: boolean;
}
7     export interface ChatMessage {
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
19     export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
27     export interface Generation {
  id: string;
  prompt: string;
  url: string;
  favorite: boolean;
  time: string;
  style: string;
  sourceUrl?: string;
}
37     export interface ToolInfo {
  title: string;
  sub: string;
  icon: string;
  bg: string;
  color: string;
  route: string;
}
46     export type Route =
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
Junpon AI — Source Code PackagePage 2 of 89Junpon AI — Source Code PackagePage 3 of 89Junpon AI — Source Code PackagePage 4 of 89Junpon AI — Source Code PackagePage 5 of 89Junpon AI — Source Code PackagePage 6 of 89Junpon AI — Source Code PackagePage 7 of 89Junpon AI — Source Code PackagePage 8 of 89Junpon AI — Source Code PackagePage 9 of 89Junpon AI — Source Code PackagePage 10 of 89Junpon AI — Source Code PackagePage 11 of 89Junpon AI — Source Code PackagePage 12 of 89Junpon AI — Source Code PackagePage 13 of 89Junpon AI — Source Code PackagePage 14 of 89Junpon AI — Source Code PackagePage 15 of 89Junpon AI — Source Code PackagePage 16 of 89Junpon AI — Source Code PackagePage 17 of 89Junpon AI — Source Code PackagePage 18 of 89Junpon AI — Source Code PackagePage 19 of 89Junpon AI — Source Code PackagePage 20 of 89Junpon AI — Source Code PackagePage 21 of 89Junpon AI — Source Code PackagePage 22 of 89Junpon AI — Source Code PackagePage 23 of 89Junpon AI — Source Code PackagePage 24 of 89Junpon AI — Source Code PackagePage 25 of 89Junpon AI — Source Code PackagePage 26 of 89Junpon AI — Source Code PackagePage 27 of 89Junpon AI — Source Code PackagePage 28 of 89Junpon AI — Source Code PackagePage 29 of 89Junpon AI — Source Code PackagePage 30 of 89Junpon AI — Source Code PackagePage 31 of 89Junpon AI — Source Code PackagePage 32 of 89Junpon AI — Source Code PackagePage 33 of 89Junpon AI — Source Code PackagePage 34 of 89Junpon AI — Source Code PackagePage 35 of 89Junpon AI — Source Code PackagePage 36 of 89Junpon AI — Source Code PackagePage 37 of 89Junpon AI — Source Code PackagePage 38 of 89Junpon AI — Source Code PackagePage 39 of 89Junpon AI — Source Code PackagePage 40 of 89Junpon AI — Source Code PackagePage 41 of 89Junpon AI — Source Code PackagePage 42 of 89Junpon AI — Source Code PackagePage 43 of 89Junpon AI — Source Code PackagePage 44 of 89Junpon AI — Source Code PackagePage 45 of 89Junpon AI — Source Code PackagePage 46 of 89Junpon AI — Source Code PackagePage 47 of 89Junpon AI — Source Code PackagePage 48 of 89Junpon AI — Source Code PackagePage 49 of 89Junpon AI — Source Code PackagePage 50 of 89Junpon AI — Source Code PackagePage 51 of 89Junpon AI — Source Code PackagePage 52 of 89Junpon AI — Source Code PackagePage 53 of 89Junpon AI — Source Code PackagePage 54 of 89Junpon AI — Source Code PackagePage 55 of 89Junpon AI — Source Code PackagePage 56 of 89Junpon AI — Source Code PackagePage 57 of 89Junpon AI — Source Code PackagePage 58 of 89Junpon AI — Source Code PackagePage 59 of 89Junpon AI — Source Code PackagePage 60 of 89Junpon AI — Source Code PackagePage 61 of 89Junpon AI — Source Code PackagePage 62 of 89Junpon AI — Source Code PackagePage 63 of 89Junpon AI — Source Code PackagePage 64 of 89Junpon AI — Source Code PackagePage 65 of 89Junpon AI — Source Code PackagePage 66 of 89Junpon AI — Source Code PackagePage 67 of 89Junpon AI — Source Code PackagePage 68 of 89Junpon AI — Source Code PackagePage 69 of 89Junpon AI — Source Code PackagePage 70 of 89Junpon AI — Source Code PackagePage 71 of 89Junpon AI — Source Code PackagePage 72 of 89Junpon AI — Source Code PackagePage 73 of 89Junpon AI — Source Code PackagePage 74 of 89Junpon AI — Source Code PackagePage 75 of 89Junpon AI — Source Code PackagePage 76 of 89Junpon AI — Source Code PackagePage 77 of 89Junpon AI — Source Code PackagePage 78 of 89Junpon AI — Source Code PackagePage 79 of 89Junpon AI — Source Code PackagePage 80 of 89Junpon AI — Source Code PackagePage 81 of 89Junpon AI — Source Code PackagePage 82 of 89Junpon AI — Source Code PackagePage 83 of 89Junpon AI — Source Code PackagePage 84 of 89Junpon AI — Source Code PackagePage 85 of 89Junpon AI — Source Code PackagePage 86 of 89Junpon AI — Source Code PackagePage 87 of 89Junpon AI — Source Code PackagePage 88 of 89Junpon AI — Source Code PackagePage 89 of 89
