
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Settings, Edit2, Trash2, Facebook, Twitter, Copy, ArrowRight, Eye, Send, Check, X } from 'lucide-react';
import { Article, ToastType, User } from '../types';

interface ArticleReaderProps {
  article: Article;
  allArticles?: Article[];
  onBack: () => void;
  onSelectArticle?: (article: Article) => void;
  onAddComment: (articleId: string, comment: { author: string; content: string; authorId?: string; authorAvatar?: string }) => void;
  onDelete: (id: string) => void;
  onEdit: (article: Article) => void;
  onTagClick: (tag: string) => void;
  onShowToast: (msg: string, type: ToastType) => void;
  isAdmin: boolean;
  currentUser: User | null;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ 
  article, 
  allArticles = [], 
  onBack, 
  onSelectArticle, 
  onAddComment, 
  onDelete, 
  onEdit,
  onTagClick,
  onShowToast,
  isAdmin,
  currentUser
}) => {
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'serif' | 'kalpurush' | 'bornomala' | 'hind'>('kalpurush');
  const [showSettings, setShowSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCommentAuthor(currentUser.name);
    }
  }, [currentUser]);

  // Update Page Title for SEO
  useEffect(() => {
    document.title = `${article.title} - SaadWrites`;
    return () => {
      document.title = 'SaadWrites - ব্যক্তিগত ব্লগ';
    };
  }, [article.title]);

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} মিনিট`;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const authorName = currentUser ? currentUser.name : commentAuthor;
    
    if (authorName.trim() && commentContent.trim()) {
      onAddComment(article.id, {
        author: authorName,
        content: commentContent,
        authorId: currentUser?.id,
        authorAvatar: currentUser?.avatar
      });
      if (!currentUser) setCommentAuthor('');
      setCommentContent('');
    }
  };

  const handleDeleteClick = () => {
    if (deleteConfirm) {
      onDelete(article.id);
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000); // Reset after 3s
    }
  };

  const copyLink = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(shareUrl);
    onShowToast('লিংক কপি করা হয়েছে', 'success');
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.title + "। " + article.content);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-lg';
      case 'base': return 'text-xl';
      case 'lg': return 'text-2xl';
      case 'xl': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'kalpurush': return 'font-kalpurush';
      case 'bornomala': return 'font-bornomala';
      case 'hind': return 'font-hind';
      default: return 'font-serif';
    }
  };

  const renderContent = (content: string) => {
    const paragraphs = content.split('\n');
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;
      if (paragraph.trim().startsWith('- ')) {
        return <li key={index} className="list-disc ml-6 my-4 marker:text-gold pl-2">{parseInlineStyles(paragraph.substring(2))}</li>;
      }
      return <p key={index} className="mb-8 last:mb-0 leading-[2] text-justify">{parseInlineStyles(paragraph)}</p>;
    });
  };

  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-charcoal dark:text-white">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-stone-600 dark:text-stone-400">{part.slice(1, -1)}</em>;
      if (part.startsWith('__') && part.endsWith('__')) return <u key={i} className="underline underline-offset-4 decoration-gold/50">{part.slice(2, -2)}</u>;
      return part;
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `পড়ুন: ${article.title} - SaadWrites`;

  // Get Related Articles
  const relatedArticles = allArticles
    .filter(a => a.category === article.category && a.id !== article.id && a.status !== 'draft')
    .slice(0, 3);

  return (
    <article className="animate-slide-up pb-20 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gold z-[100] transition-all duration-300" style={{ width: `${readingProgress}%` }}></div>

      {/* Action Toolbar */}
      <div className="flex justify-between items-center mb-12 sticky top-0 bg-cream/90 dark:bg-[#0f0f0f]/90 backdrop-blur-md z-40 py-4 border-b border-stone-200/50 dark:border-stone-800">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-charcoal dark:hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm hidden md:inline">ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isPlaying ? 'bg-gold text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
          >
             {isPlaying ? 'থামুন' : 'শুনুন'}
          </button>

          {isAdmin && (
            <>
              <button onClick={() => onEdit(article)} className="p-2.5 text-stone-500 hover:text-blue-600 transition-colors rounded-full hover:bg-white dark:hover:bg-stone-800" title="এডিট করুন"><Edit2 className="w-4 h-4" /></button>
              
              {/* Delete Button with Confirmation State */}
              <button 
                onClick={handleDeleteClick} 
                className={`flex items-center gap-2 px-2.5 py-2.5 rounded-full transition-all duration-300 ${deleteConfirm ? 'bg-red-600 text-white w-auto px-4' : 'text-stone-500 hover:text-red-600 hover:bg-white dark:hover:bg-stone-800'}`}
                title={deleteConfirm ? "নিশ্চিত করুন" : "ডিলিট করুন"}
              >
                {deleteConfirm ? (
                  <>
                    <span className="text-xs font-bold">নিশ্চিত?</span>
                    <Trash2 className="w-4 h-4" />
                  </>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
              
              <div className="w-px h-5 bg-stone-300 dark:bg-stone-700 mx-1"></div>
            </>
          )}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 transition-colors rounded-full ${showSettings ? 'bg-charcoal text-white' : 'text-stone-500 hover:text-charcoal dark:hover:text-white hover:bg-white dark:hover:bg-stone-800'}`} title="সেটিংস"><Settings className="w-4 h-4" /></button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-4 w-72 bg-white dark:bg-stone-900 rounded-lg shadow-premium border border-stone-100 dark:border-stone-800 p-6 z-50">
                <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">ফন্ট সাইজ</p>
                     <div className="flex bg-stone-100 dark:bg-stone-800 rounded-md p-1">
                       {(['sm', 'base', 'lg', 'xl'] as const).map(s => (
                         <button key={s} onClick={() => setFontSize(s)} className={`flex-1 py-1.5 rounded text-xs font-bold font-serif transition-all ${fontSize === s ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white' : 'text-stone-400'}`}>{s === 'sm' ? 'A' : s === 'xl' ? 'A++' : 'A+'}</button>
                       ))}
                     </div>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">ফন্ট স্টাইল</p>
                     <div className="space-y-1">
                       {['serif', 'kalpurush', 'bornomala', 'hind'].map(f => (
                         <button key={f} onClick={() => setFontFamily(f as any)} className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${fontFamily === f ? 'bg-stone-100 dark:bg-stone-800 text-gold font-bold' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                           {f === 'hind' ? 'হিন্দ শিলিগুড়ি (Sans)' : f === 'serif' ? 'মেরিওয়েদার (Serif)' : f === 'kalpurush' ? 'কালপুরুষ (Classic)' : 'বর্ণমালা (Artistic)'}
                         </button>
                       ))}
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-16 text-center max-w-4xl mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-6">
          <span>{article.category}</span>
          <span className="w-1 h-1 rounded-full bg-gold"></span>
          <span>{formatDate(article.createdAt)}</span>
          <span className="w-1 h-1 rounded-full bg-gold"></span>
          <span>{calculateReadingTime(article.content)}</span>
          {article.views !== undefined && isAdmin && (
            <>
              <span className="w-1 h-1 rounded-full bg-gold"></span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views} বার পঠিত</span>
            </>
          )}
          {article.status === 'draft' && <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-500 rounded text-[10px] ml-2">খসড়া</span>}
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-kalpurush font-bold text-charcoal dark:text-stone-50 leading-tight mb-10">
          {article.title}
        </h1>

        {article.coverImage && (
          <div className="w-full relative shadow-2xl rounded-sm overflow-hidden mb-8 group">
             <div className="aspect-w-16 aspect-h-9 md:aspect-h-7">
               <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
             </div>
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10"></div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className={`max-w-3xl mx-auto ${getFontSizeClass()} ${getFontFamilyClass()} text-charcoal dark:text-stone-300 antialiased`}>
        {renderContent(article.content)}
      </div>
      
      {/* Tags Section */}
      {article.tags.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12 flex flex-wrap gap-2">
           {article.tags.map(tag => (
             <button 
               key={tag} 
               onClick={() => onTagClick(tag)}
               className="text-sm font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full hover:bg-gold hover:text-white transition-colors"
             >
               #{tag}
             </button>
           ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-20">
         <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent w-full mb-12"></div>
         
         {/* Footer Share */}
         <div className="flex flex-col items-center gap-6 mb-16">
            <p className="text-sm font-serif italic text-stone-500">লেখাটি শেয়ার করুন</p>
            <div className="flex items-center gap-4">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-white dark:bg-stone-800 shadow-md hover:shadow-lg hover:text-blue-600 transition-all text-stone-400"><Facebook className="w-5 h-5" /></a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-white dark:bg-stone-800 shadow-md hover:shadow-lg hover:text-sky-500 transition-all text-stone-400"><Twitter className="w-5 h-5" /></a>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-white dark:bg-stone-800 shadow-md hover:shadow-lg hover:text-green-600 transition-all text-stone-400"><Share2 className="w-5 h-5" /></a>
              <button onClick={copyLink} className="p-4 rounded-full bg-white dark:bg-stone-800 shadow-md hover:shadow-lg hover:text-charcoal dark:hover:text-white transition-all text-stone-400"><Copy className="w-5 h-5" /></button>
            </div>
         </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && onSelectArticle && (
        <div className="max-w-4xl mx-auto mb-20">
          <h3 className="text-2xl font-kalpurush font-bold text-center text-charcoal dark:text-stone-100 mb-10">
            আরও পড়ুন
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map(related => (
              <div 
                key={related.id}
                onClick={() => onSelectArticle(related)}
                className="group cursor-pointer bg-white dark:bg-[#161413] rounded-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {related.coverImage && (
                  <div className="h-40 overflow-hidden relative">
                    <img src={related.coverImage} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">{related.category}</p>
                  <h4 className="text-xl font-kalpurush font-bold text-charcoal dark:text-stone-200 group-hover:text-gold transition-colors line-clamp-2 mb-2">
                    {related.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-medium text-stone-400">
                    পড়ুন <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#161413] p-8 md:p-12 rounded-sm shadow-xl border-t-4 border-gold">
        <h3 className="text-2xl font-kalpurush font-bold text-charcoal dark:text-stone-100 mb-10 flex items-center gap-3">
          পাঠকের মন্তব্য <span className="text-lg text-stone-400 font-normal">({article.comments?.length || 0})</span>
        </h3>

        <div className="space-y-10 mb-12">
          {article.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-6 animate-fade-in">
              {comment.authorAvatar ? (
                <img src={comment.authorAvatar} alt={comment.author} className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-700 shadow-sm object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-cream dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-gold shrink-0 font-serif font-bold text-xl shadow-sm">
                  {comment.author.charAt(0)}
                </div>
              )}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                   <h4 className="font-bold font-serif text-charcoal dark:text-stone-200 text-lg">{comment.author}</h4>
                   <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-lg">{comment.content}</p>
              </div>
            </div>
          ))}
          {(!article.comments || article.comments.length === 0) && (
            <p className="text-center text-stone-400 italic font-serif py-4">এখনো কোনো মন্তব্য নেই। আপনিই প্রথম মন্তব্য করুন।</p>
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-6">
           {currentUser ? (
             <div className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
               <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
               <p className="text-sm text-stone-600 dark:text-stone-300">
                 <span className="font-bold">{currentUser.name}</span> হিসেবে মন্তব্য করছেন
               </p>
             </div>
           ) : (
             <div>
               <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">আপনার নাম</label>
               <input required type="text" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b-2 border-stone-200 dark:border-stone-700 focus:border-gold outline-none transition-colors text-charcoal dark:text-stone-100 font-serif" placeholder="এখানে নাম লিখুন" />
             </div>
           )}
           <div>
             <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">আপনার মন্তব্য</label>
             <textarea required rows={4} value={commentContent} onChange={(e) => setCommentContent(e.target.value)} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b-2 border-stone-200 dark:border-stone-700 focus:border-gold outline-none transition-colors resize-none text-charcoal dark:text-stone-100 font-serif" placeholder="মনের কথা খুলে বলুন..." />
           </div>
           <div className="text-right">
             <button type="submit" className="px-8 py-3 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded-full font-medium hover:bg-gold dark:hover:bg-gold transition-colors shadow-lg inline-flex items-center gap-2">
               মন্তব্য প্রকাশ করুন <Send className="w-4 h-4" />
             </button>
           </div>
        </form>
      </div>
    </article>
  );
};
