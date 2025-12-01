export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  authorId?: string; // Optional link to signed-in user
  authorAvatar?: string;
}

export type ArticleCategory = string;

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: number;
  tags: string[];
  coverImage?: string;
  comments?: Comment[];
  category: ArticleCategory;
  status: 'published' | 'draft';
  views?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'facebook' | 'email';
}

export enum ViewState {
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  READER = 'READER',
  CONTACT = 'CONTACT',
  ABOUT = 'ABOUT',
  INSIGHT = 'INSIGHT',
  LOGIN = 'LOGIN',
}

export interface WritingPrompt {
  type: 'grammar' | 'expand' | 'summarize' | 'ideas';
  label: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}