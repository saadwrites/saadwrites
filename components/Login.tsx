import React, { useState } from 'react';
import { Mail, Facebook, Chrome, ArrowRight, Lock } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<'google' | 'facebook' | 'email' | null>(null);

  // Simulated Login Handlers
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(provider);
    setTimeout(() => {
      const mockUser: User = {
        id: Date.now().toString(),
        name: provider === 'google' ? 'সাকিব আল হাসান' : 'নুসরাত জাহান',
        email: provider === 'google' ? 'sakib@example.com' : 'nusrat@example.com',
        avatar: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60' 
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
        provider: provider
      };
      onLogin(mockUser);
    }, 1500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading('email');
    setTimeout(() => {
      const mockUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0], // Use part of email as name for demo
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=b45309&color=fff`,
        provider: 'email'
      };
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in py-10">
      <div className="bg-white dark:bg-[#161413] rounded-sm shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden relative">
        <div className="h-2 bg-gold w-full absolute top-0 left-0"></div>
        
        <div className="p-10 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-kalpurush font-bold text-charcoal dark:text-stone-100">স্বাগতম</h2>
            <p className="text-stone-500 font-serif">SaadWrites এ যোগ দিন এবং আপনার মতামত জানান</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors group"
            >
              {isLoading === 'google' ? (
                <span className="animate-spin w-5 h-5 border-2 border-stone-400 border-t-gold rounded-full"></span>
              ) : (
                <>
                  <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-stone-600 dark:text-stone-300">Google দিয়ে চালিয়ে যান</span>
                </>
              )}
            </button>

            <button 
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] border border-[#1877F2] rounded shadow-sm hover:bg-[#166fe5] transition-colors text-white group"
            >
               {isLoading === 'facebook' ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/50 border-t-white rounded-full"></span>
              ) : (
                <>
                  <Facebook className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Facebook দিয়ে চালিয়ে যান</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-xs font-bold uppercase tracking-widest">অথবা</span>
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-charcoal dark:text-stone-200"
                  placeholder="আপনার ইমেইল"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-charcoal dark:text-stone-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading !== null}
              className="w-full py-3 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded font-bold uppercase tracking-widest hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading === 'email' ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <p className="text-center text-xs text-stone-400">
            লগইন করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন।
          </p>
        </div>
      </div>
    </div>
  );
};