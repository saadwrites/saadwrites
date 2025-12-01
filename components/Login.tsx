import React, { useState } from 'react';
import { Mail, Facebook, Chrome, ArrowRight, Lock } from 'lucide-react';
import { User } from '../types';
import { loginWithGoogle } from '../services/firebaseService';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState<'google' | 'facebook' | 'email' | null>(null);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    setError('');
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err) {
      console.error(err);
      setError('গুগল লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setIsLoading(null);
    }
  };

  // Placeholder for other methods
  const handleFeatureNotReady = (provider: string) => {
    alert(`${provider} লগইন এখনো চালু হয়নি। অনুগ্রহ করে Google ব্যবহার করুন।`);
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

          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
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
              onClick={() => handleFeatureNotReady('Facebook')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] border border-[#1877F2] rounded shadow-sm hover:bg-[#166fe5] transition-colors text-white group"
            >
              <Facebook className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              <span className="font-bold">Facebook দিয়ে চালিয়ে যান</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-xs font-bold uppercase tracking-widest">অথবা</span>
            <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleFeatureNotReady('Email'); }} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-charcoal dark:text-stone-200"
                  placeholder="আপনার ইমেইল"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-charcoal dark:text-stone-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded font-bold uppercase tracking-widest hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
               লগইন করুন <ArrowRight className="w-4 h-4" />
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