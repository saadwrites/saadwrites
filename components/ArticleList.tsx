import React, { useState, useMemo } from 'react';
import { Article, ArticleCategory } from '../types';
import { ArrowRight, Search, Sun, Moon, Sparkles, Feather, FileText } from 'lucide-react';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNewArticle: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelectArticle, onNewArticle, theme, toggleTheme }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [searchQuery, setSearchQuery] = useState('');

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
    // Determine if we are looking for drafts or published posts
    const isDraftView = selectedCategory === 'খসড়া';
    const articleIsDraft = article.status === 'draft';
    
    // Status Filter
    if (isDraftView) {
      if (!articleIsDraft) return false;
    } else {
      if (articleIsDraft) return false; // Hide drafts from other tabs
      
      // Category Filter for published posts
      if (selectedCategory !== 'সব' && article.category !== selectedCategory) return false;
    }

    // Search Filter
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

  return (
    <div className="space-y-16 animate-fade-in max-w-5xl mx-auto">
      {/* Header Section with Artistic Touch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-stone-200 dark:border-stone-800 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gold">
            <Feather className="w-5 h-5" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">আমার চিন্তার জগৎ</p>
          </div>
          <h2 className="text-5xl md:text-6xl font-kalpurush font-bold text-charcoal dark:text-stone-100 tracking-tight">
            SaadWrites
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Search Box - Premium Style */}
           <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              placeholder="অনুসন্ধান..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full py-2.5 pl-10 pr-6 text-sm text-charcoal dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:border-gold dark:focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-sm"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-gold dark:hover:text-gold hover:border-gold dark:hover:border-gold transition-all shadow-sm"
            title={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Category Filters - Minimalist Elegant */}
      <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar border-b border-stone-200 dark:border-stone-800/50">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`pb-2 text-sm font-bold font-kalpurush transition-all whitespace-nowrap relative ${
              selectedCategory === cat
                ? 'text-gold'
                : 'text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            {cat}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-300 ${selectedCategory === cat ? 'scale-x-100' : 'scale-x-0'}`}></span>
          </button>
        ))}
        {hasDrafts && (
           <button
             onClick={() => setSelectedCategory('খসড়া')}
             className={`pb-2 text-sm font-bold font-kalpurush transition-all whitespace-nowrap relative flex items-center gap-2 ${
               selectedCategory === 'খসড়া'
                 ? 'text-gold'
                 : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
             }`}
           >
             <FileText className="w-3 h-3" />
             খসড়া
             <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-300 ${selectedCategory === 'খসড়া' ? 'scale-x-100' : 'scale-x-0'}`}></span>
           </button>
        )}
      </div>

      {/* Article Grid - Premium Cards */}
      {articles.length === 0 ? (
        <div className="text-center py-40 animate-fade-in">
          <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-kalpurush font-bold text-stone-800 dark:text-stone-200 mb-3">এখনো কিছু লেখা হয়নি</h3>
          <p className="text-stone-500 dark:text-stone-400 mb-8 font-serif">আপনার চিন্তার ডায়েরিটি শূন্য। আজই নতুন কিছু লিখুন।</p>
          <button 
            onClick={onNewArticle}
            className="px-8 py-3 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded-full font-medium hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg"
          >
            প্রথম লেখা লিখুন
          </button>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid gap-16">
          {filteredArticles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => onSelectArticle(article)}
              className={`group cursor-pointer bg-white dark:bg-[#161413] rounded-sm shadow-xl dark:shadow-none dark:border dark:border-stone-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col md:flex-row ${article.status === 'draft' ? 'border-l-4 border-gold' : ''}`}
            >
              {article.coverImage && (
                <div className="w-full md:w-[400px] h-64 md:h-auto overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {article.status === 'draft' && (
                    <div className="absolute top-4 left-4 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-md">খসড়া</div>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gold">
                  <span>{article.category}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span className="text-stone-400">{formatDate(article.createdAt)}</span>
                  {article.status === 'draft' && !article.coverImage && (
                     <span className="ml-auto bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded text-[10px]">খসড়া</span>
                  )}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-kalpurush font-bold text-charcoal dark:text-stone-100 leading-tight group-hover:text-gold transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-stone-600 dark:text-stone-400 line-clamp-3 text-lg font-serif leading-relaxed">
                  {article.content.replace(/(\*\*|__|[*])/g, '').substring(0, 200)}...
                </p>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                   <span className="text-xs font-medium text-stone-400 font-sans italic">{calculateReadingTime(article.content)} সময় লাগবে</span>
                   <div className="flex items-center gap-2 text-charcoal dark:text-stone-200 text-sm font-bold uppercase tracking-wide group-hover:text-gold transition-colors">
                     পুরোটা পড়ুন <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-stone-400 font-serif italic text-lg">
          {selectedCategory === 'খসড়া' ? 'কোনো খসড়া লেখা নেই।' : 'দুঃখিত, কোনো লেখা খুঁজে পাওয়া যায়নি।'}
        </div>
      )}
    </div>
  );
};