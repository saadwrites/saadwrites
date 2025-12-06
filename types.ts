
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
  likes?: number;
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

export interface SiteConfig {
  siteName: string;
  tagline: string;
  logoUrl?: string; // If user uploads a custom image
  footerText: string;
  
  // Contact Info
  contactEmail: string;
  contactPhone: string;
  contactAddress: string; // Not strictly used in UI yet but good to have
  
  // Newsletter
  newsletterTitle: string;
  newsletterDesc: string;
  
  // About Page Defaults
  aboutName: string;
  aboutBio: string;
  aboutLocation1: string; // Kishoreganj
  aboutLocation2: string; // Noakhali
  aboutTrait: string; // Bhavoghure
  aboutWebsite?: string; // Portfolio link
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
}
