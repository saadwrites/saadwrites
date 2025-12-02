
import React, { useState, useMemo } from 'react';
import { Article, ToastType, SiteConfig } from '../types';
import { Search, Sun, Moon, Sparkles, Feather, FileText, Eye, Mail, Send, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { EditableText, EditableImage } from './Editable';
import { subscribeToNewsletter } from '../services/firebaseService';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNewArticle: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdmin: boolean;
  onShowToast: (msg: string, type: ToastType) => void;
  config: SiteConfig;
  updateConfig: (c: Partial<SiteConfig>) => void;
  onLoadDemoData?: () => void; // Kept as optional prop but unused in UI
}

export const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  onSelectArticle, 
  onNewArticle, 
  theme, 
  toggleTheme,
  searchQuery,
  setSearchQuery,
  isAdmin,
  onShowToast,
  config,
  updateConfig
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { categories, hasDrafts } = useMemo(() => {
    const defaultCats = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const articleCats = articles.filter(a => a.status === 'published' || !a.status).map(a => a.category);
    const uniqueCats = Array.from(new Set([...defaultCats, ...articleCats]));
    
    const draftCount = articles.filter(a => a.status === 'draft').length;
    
    return {
      categories: ['সব', ...uniqueCats],
      hasDrafts: draftCount > 0
    };
  }, [articles]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} মিনিট`;
  };

  const filteredArticles = articles.filter(article => {
    const isDraftView = selectedCategory === 'খসড়া';
    const articleIsDraft = article.status === 'draft';
    
    // Only show drafts if isAdmin is true
    if (articleIsDraft && !isAdmin) return false;

    if (isDraftView) {
      if (!articleIsDraft) return false;
    } else {
      if (articleIsDraft) return false;
      if (selectedCategory !== 'সব' && article.category !== selectedCategory) return false;
    }

    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    try {
      await subscribeToNewsletter(email);
      onShowToast('নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে! স্বাগতম।', 'success');
      setEmail('');
    } catch (err) {
      console.error(err);
      onShowToast('সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200/50 dark:border-stone-800/50 pb-8 transition-colors duration-[800ms] ease-in-out">
        <div className="space-y-3">
          <div className="flex items-center gap-6">
             {/* Logo Section */}
             {(config.logoUrl || isAdmin) && (
               <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
                  <EditableImage 
                      src={config.logoUrl} 
                      onSave={(url) => updateConfig({ logoUrl: url })} 
                      isAdmin={isAdmin} 
                      className="w-full h-full object-contain"
                      fallbackIcon={<ImageIcon className="w-8 h-8 text-stone-300" />}
                    />
               </div>
             )}
             
             {/* Text Section */}
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-gold animate-slide-up">
                 <Feather className="w-4 h-4" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.3em]">আমার চিন্তার জগৎ</p>
               </div>
               
               <EditableText 
                  value={config.siteName} 
                  onSave={(val) => updateConfig({ siteName: val })} 
                  isAdmin={isAdmin}
                  className="text-4xl md:text-6xl font-kalpurush font-bold text-charcoal dark:text-stone-100 leading-tight transition-colors duration-[800ms] block"
               />
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Search Box */}
           <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-gold transition-colors duration-500" />
            <input
              type="text"
              placeholder="অনুসন্ধান..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-56 bg-white/40 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-800 rounded-full py-2 pl-10 pr-6 text-sm text-charcoal dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-gold dark:focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-500 ease-out shadow-sm backdrop-blur-sm"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/40 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-gold dark:hover:text-gold hover:border-gold dark:hover:border-gold transition-all duration-500 ease-out shadow-sm backdrop-blur-sm"
            title={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar border-b border-transparent">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`pb-2 text-sm font-bold font-kalpurush transition-all duration-500 ease-out whitespace-nowrap relative ${
              selectedCategory === cat
                ? 'text-gold'
                : 'text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            {cat}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${selectedCategory === cat ? 'scale-x-100' : 'scale-x-0'}`}></span>
          </button>
        ))}
        {hasDrafts && isAdmin && (
           <button
             onClick={() => setSelectedCategory('খসড়া')}
             className={`pb-2 text-sm font-bold font-kalpurush transition-all duration-500 ease-out whitespace-nowrap relative flex items-center gap-2 ${
               selectedCategory === 'খসড়া'
                 ? 'text-gold'
                 : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
             }`}
           >
             <FileText className="w-3 h-3" />
             খসড়া
             <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${selectedCategory === 'খসড়া' ? 'scale-x-100' : 'scale-x-0'}`}></span>
           </button>
        )}
      </div>

      {/* Article Grid - Compact & Elegant */}
      {articles.length === 0 ? (
        <div className="text-center py-40 animate-fade-in">
          <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600 transition-colors duration-[800ms]">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-kalpurush font-bold text-stone-800 dark:text-stone-200 mb-3 transition-colors duration-[800ms]">এখনো কিছু লেখা হয়নি</h3>
          <p className="text-stone-500 dark:text-stone-400 mb-8 font-serif transition-colors duration-[800ms]">আপনার চিন্তার ডায়েরিটি শূন্য। আজই নতুন কিছু লিখুন।</p>
          {isAdmin && (
            <button 
              onClick={onNewArticle}
              className="px-8 py-3 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded-full font-medium hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg hover:shadow-xl"
            >
              প্রথম লেখা লিখুন
            </button>
          )}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredArticles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => onSelectArticle(article)}
              className={`group cursor-pointer bg-white dark:bg-[#161413] rounded-sm shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden flex flex-col h-full ${article.status === 'draft' ? 'border-l-4 border-gold' : 'border border-stone-100 dark:border-stone-800/40'}`}
            >
              {article.coverImage && (
                <div className="w-full h-48 md:h-56 overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  {article.status === 'draft' && isAdmin && (
                    <div className="absolute top-4 left-4 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-md">খসড়া</div>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-5 md:p-6 flex flex-col space-y-3">
                <div className="flex items-center gap-3 text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-gold/80 group-hover:text-gold transition-colors duration-500">
                  <span>{article.category}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span className="text-stone-400">{formatDate(article.createdAt)}</span>
                  {article.status === 'draft' && !article.coverImage && isAdmin && (
                     <span className="ml-auto bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded text-[10px]">খসড়া</span>
                  )}
                </div>
                
                <h3 className="text-xl md:text-2xl font-kalpurush font-bold text-charcoal dark:text-stone-100 leading-tight group-hover:text-gold transition-colors duration-500 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-stone-600 dark:text-stone-400 line-clamp-3 text-sm md:text-base font-serif leading-relaxed transition-colors duration-700 opacity-90 group-hover:opacity-100 flex-1">
                  {article.content.replace(/(\*\*|__|[*])/g, '').substring(0, 150)}...
                </p>

                <div className="pt-3 mt-auto border-t border-stone-100 dark:border-stone-800/50 flex items-center justify-between transition-colors duration-700">
                   <div className="flex items-center gap-3 text-[10px] md:text-xs font-medium text-stone-400 font-sans italic">
                      <span>{calculateReadingTime(article.content)}</span>
                      {article.status !== 'draft' && isAdmin && (
                        <span className="flex items-center gap-1 text-stone-300 dark:text-stone-600"><Eye className="w-3 h-3"/> {article.views || 0}</span>
                      )}
                   </div>
                   <div className="flex items-center gap-2 text-charcoal dark:text-stone-200 text-xs font-bold uppercase tracking-wide group-hover:text-gold transition-colors duration-300">
                     পড়ুন <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400 font-serif italic text-lg animate-fade-in">
          {selectedCategory === 'খসড়া' ? 'কোনো খসড়া লেখা নেই।' : 'দুঃখিত, কোনো লেখা খুঁজে পাওয়া যায়নি।'}
        </div>
      )}

      {/* Newsletter Subscription Section */}
      <div className="bg-charcoal dark:bg-stone-900 rounded-sm p-8 md:p-12 text-center relative overflow-hidden shadow-premium mt-16 group transition-colors duration-[800ms]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
        
        {/* Decorative Background */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/5 rounded-full blur-[100px] group-hover:bg-gold/10 transition-colors duration-1000"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-[100px] group-hover:bg-gold/10 transition-colors duration-1000"></div>

        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
           <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gold mb-4 border border-white/10 shadow-lg backdrop-blur-sm">
             <Mail className="w-6 h-6" />
           </div>
           
           <div>
             <div className="mb-3">
               <EditableText 
                 value={config.newsletterTitle} 
                 onSave={(val) => updateConfig({ newsletterTitle: val })} 
                 isAdmin={isAdmin}
                 className="text-2xl md:text-3xl font-kalpurush font-bold text-white tracking-wide"
               />
             </div>
             <div className="text-stone-300 font-serif text-base md:text-lg leading-relaxed opacity-90">
               <EditableText 
                 value={config.newsletterDesc} 
                 onSave={(val) => updateConfig({ newsletterDesc: val })} 
                 isAdmin={isAdmin}
                 multiline
               />
             </div>
           </div>
           
           <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 mt-8">
             <div className="flex-1 relative group">
               <input 
                 type="email" 
                 placeholder="আপনার ইমেইল ঠিকানা" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-sm focus:border-gold focus:outline-none text-white placeholder-stone-500 transition-all duration-300 font-serif focus:bg-white/10"
               />
               <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-gold transition-colors" />
             </div>
             <button 
               type="submit" 
               disabled={isSubscribing}
               className="px-8 py-3 bg-gold text-white font-bold uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all duration-300 shadow-lg flex items-center justify-center gap-2 rounded-sm disabled:opacity-70 hover:shadow-xl hover:-translate-y-0.5"
             >
               {isSubscribing ? 'যুক্ত হচ্ছে...' : 'সাবস্ক্রাইব'} <Send className="w-4 h-4" />
             </button>
           </form>
           <p className="text-[10px] text-stone-500 uppercase tracking-widest pt-4 opacity-70">নিয়মিত পাঠকদের সাথে যুক্ত হোন</p>
        </div>
      </div>
    </div>
  );
};
