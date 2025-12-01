import React, { useState, useMemo } from 'react';
import { Article, ArticleCategory } from '../types';
import { ArrowRight, Clock, Book, Feather, FileText, Layers } from 'lucide-react';

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNewArticle: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelectArticle, onNewArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');

  const categories = useMemo(() => {
    const defaultCats = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const articleCats = articles.map(a => a.category);
    const uniqueCats = Array.from(new Set([...defaultCats, ...articleCats]));
    return ['সব', ...uniqueCats];
  }, [articles]);

  const filteredArticles = selectedCategory === 'সব' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

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
      <div className="text-center py-20 animate-fade-in">
        <div className="mb-6 inline-block p-4 rounded-full bg-stone-100">
          <div className="w-16 h-1 bg-stone-300 rounded-full mb-2 mx-auto"></div>
          <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto"></div>
        </div>
        <h3 className="text-2xl font-serif text-stone-800 mb-2">এখনো কোনো লেখা নেই</h3>
        <p className="text-stone-500 mb-8">আপনার চিন্তাভাবনা সবার সাথে শেয়ার করতে আজই লেখা শুরু করুন।</p>
        <button 
          onClick={onNewArticle}
          className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors shadow-md"
        >
          প্রথম লেখা লিখুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-4">আমার রচনাবলী</h2>
        <div className="w-24 h-1 bg-accent mx-auto rounded-full mb-8"></div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-800 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
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
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {article.coverImage && (
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={article.coverImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1 shadow-sm">
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-stone-600 line-clamp-3 text-sm leading-relaxed mb-4 font-serif flex-grow">
                  {article.content.substring(0, 150)}...
                </p>
                <div className="flex items-center text-accent text-sm font-medium pt-4 border-t border-stone-100">
                  পড়তে থাকুন <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-stone-400">
            এই ক্যাটাগরিতে কোনো লেখা পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
};