export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

export type ArticleCategory = string;

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: number; // timestamp
  tags: string[];
  coverImage?: string;
  comments?: Comment[];
  category: ArticleCategory;
}

export enum ViewState {
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  READER = 'READER',
  CONTACT = 'CONTACT',
  ABOUT = 'ABOUT',
}

export interface WritingPrompt {
  type: 'grammar' | 'expand' | 'summarize' | 'ideas';
  label: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}