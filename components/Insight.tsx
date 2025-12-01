import React from 'react';
import { Article } from '../types';
import { BarChart, Users, FileText, MessageCircle, TrendingUp, Eye, PenTool } from 'lucide-react';

interface InsightProps {
  articles: Article[];
  totalVisits: number;
}

export const Insight: React.FC<InsightProps> = ({ articles, totalVisits }) => {
  // Calculate Stats
  const publishedArticles = articles.filter(a => a.status === 'published');
  const draftArticles = articles.filter(a => a.status === 'draft');
  const totalComments = articles.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);
  const totalWords = articles.reduce((acc, curr) => {
    const words = curr.content.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  // Sort by views for popular list
  const popularArticles = [...publishedArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-12 pb-16">
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-gold">
           <TrendingUp className="w-5 h-5" />
           <p className="text-xs font-bold uppercase tracking-[0.3em]">পরিসংখ্যান</p>
        </div>
        <h2 className="text-5xl font-kalpurush font-bold text-charcoal dark:text-stone-100">ইনসাইট ড্যাশবোর্ড</h2>
        <p className="text-stone-500 dark:text-stone-400 font-serif text-lg">আপনার লেখার অগ্রগতির চিত্র</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye className="w-6 h-6" />} 
          label="মোট ভিজিটর" 
          value={totalVisits.toLocaleString()} 
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          icon={<FileText className="w-6 h-6" />} 
          label="প্রকাশিত লেখা" 
          value={publishedArticles.length.toString()} 
          subValue={`${draftArticles.length} টি খসড়া`}
          color="text-green-500"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard 
          icon={<MessageCircle className="w-6 h-6" />} 
          label="মোট মন্তব্য" 
          value={totalComments.toLocaleString()} 
          color="text-purple-500"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard 
          icon={<PenTool className="w-6 h-6" />} 
          label="শব্দ সংখ্যা" 
          value={totalWords.toLocaleString()} 
          color="text-gold"
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Popular Articles Section */}
      <div className="bg-white dark:bg-[#161413] rounded-sm shadow-xl border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <h3 className="text-2xl font-kalpurush font-bold text-charcoal dark:text-stone-100">জনপ্রিয় লেখা</h3>
          <BarChart className="w-5 h-5 text-stone-400" />
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {popularArticles.length > 0 ? (
            popularArticles.map((article, index) => (
              <div key={article.id} className="p-6 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg font-serif shrink-0 ${
                    index === 0 ? 'bg-gold text-white' : 
                    index === 1 ? 'bg-stone-300 text-charcoal' :
                    index === 2 ? 'bg-stone-200 text-charcoal' :
                    'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold font-kalpurush text-lg text-charcoal dark:text-stone-200 group-hover:text-gold transition-colors">{article.title}</h4>
                    <p className="text-xs text-stone-400 uppercase tracking-wider mt-1">{article.category} • {new Date(article.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-stone-500 font-medium">
                  <Eye className="w-4 h-4" />
                  {article.views?.toLocaleString() || 0}
                </div>
              </div>
            ))
          ) : (
             <div className="p-10 text-center text-stone-400 font-serif italic">কোনো ডাটা পাওয়া যায়নি</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color, bg }: any) => (
  <div className="bg-white dark:bg-[#161413] p-8 rounded-sm shadow-lg border border-stone-100 dark:border-stone-800 hover:-translate-y-1 transition-transform duration-300">
    <div className={`w-12 h-12 rounded-full ${bg} ${color} flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">{label}</p>
    <h3 className="text-4xl font-serif font-bold text-charcoal dark:text-stone-100">{value}</h3>
    {subValue && <p className="text-xs text-stone-400 mt-2 font-medium">{subValue}</p>}
  </div>
);
