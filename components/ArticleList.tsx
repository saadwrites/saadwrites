import React, { useState, useMemo } from 'react';
import { Article, ArticleCategory } from '../types';
import { ArrowRight, Clock, Book, Feather, FileText, Layers, Search, Hourglass, Sun, Moon } from 'lucide-react';

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

  const categories = useMemo(() => {
    const defaultCats = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const articleCats = articles.map(a => a.category);
    const uniqueCats = Array.from(new Set([...defaultCats, ...articleCats]));
    return ['সব', ...uniqueCats];
  }, [articles]);

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} মিনিট`;
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'সব' || article.category === selectedCategory;
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'কবিতা': return <Feather className="w-3 h-3" />;
      case 'গল্প': return <Book className="w-3 h-3" />;
      case 'প্রবন্ধ': return <FileText className="w-3 h-3" />;
      default: return <Layers className="w-3 h-3" />;
    }
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in relative">
        {/* Top bar even when empty */}
        <div className="absolute top-0 right-0 p-4">
           <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-sm border border-stone-200 dark:border-stone-700"
            title={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        <div className="mb-6 inline-block p-4 rounded-full bg-stone-100 dark:bg-stone-800 mt-10">
          <div className="w-16 h-1 bg-stone-300 dark:bg-stone-600 rounded-full mb-2 mx-auto"></div>
          <div className="w-12 h-1 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto"></div>
        </div>
        <h3 className="text-2xl font-hind font-bold text-stone-800 dark:text-stone-100 mb-2">এখনো কোনো লেখা নেই</h3>
        <p className="text-stone-500 dark:text-stone-400 mb-8">আপনার চিন্তাভাবনা সবার সাথে শেয়ার করতে আজই লেখা শুরু করুন।</p>
        <button 
          onClick={onNewArticle}
          className="px-6 py-3 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors shadow-md font-medium"
        >
          প্রথম লেখা লিখুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-hind font-bold text-stone-800 dark:text-stone-100 mb-4">SaadWrites</h2>
        <div className="w-24 h-1 bg-accent mx-auto rounded-full mb-8"></div>

        {/* Search Bar & Theme Toggle */}
        <div className="max-w-md mx-auto mb-8 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="লেখা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-full leading-5 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent sm:text-sm transition-all shadow-sm"
            />
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-sm border border-stone-200 dark:border-stone-700"
            title={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer bg-white dark:bg-stone-800 rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {article.coverImage && (
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1 shadow-sm">
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-full">
                    <Hourglass className="w-3 h-3" />
                    <span>{calculateReadingTime(article.content)}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-hind font-bold text-stone-800 dark:text-stone-100 mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                {/* Just taking a rough slice, formatting chars might remain but it's just a preview */}
                <p className="text-stone-600 dark:text-stone-400 line-clamp-3 text-sm leading-relaxed mb-4 font-serif flex-grow">
                  {article.content.replace(/(\*\*|__|[*])/g, '').substring(0, 150)}...
                </p>
                <div className="flex items-center text-accent text-sm font-medium pt-4 border-t border-stone-100 dark:border-stone-700">
                  পড়তে থাকুন <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-stone-400">
             {searchQuery ? 'দুঃখিত, আপনার অনুসন্ধানের সাথে কোনো লেখা পাওয়া যায়নি।' : 'এই ক্যাটাগরিতে কোনো লেখা পাওয়া যায়নি।'}
          </div>
        )}
      </div>
    </div>
  );
};