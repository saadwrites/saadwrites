import React, { useState } from 'react';
import { ArrowLeft, Calendar, Tag, Share2, MessageCircle, User, Send, Folder, Type, Settings, Edit2, Trash2, Hourglass, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Article } from '../types';

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onAddComment: (articleId: string, comment: { author: string; content: string }) => void;
  onDelete: (id: string) => void;
  onEdit: (article: Article) => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onBack, onAddComment, onDelete, onEdit }) => {
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'serif' | 'kalpurush' | 'bornomala' | 'hind'>('serif');
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);

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
    if (commentAuthor.trim() && commentContent.trim()) {
      onAddComment(article.id, {
        author: commentAuthor,
        content: commentContent
      });
      setCommentAuthor('');
      setCommentContent('');
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই লেখাটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।')) {
      onDelete(article.id);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'prose-sm';
      case 'base': return 'prose-base';
      case 'lg': return 'prose-lg';
      case 'xl': return 'prose-xl';
      default: return 'prose-lg';
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

  // Simple Markdown Parser for display
  const renderContent = (content: string) => {
    // Split by newlines to handle paragraphs
    const paragraphs = content.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;

      // Handle Lists
      if (paragraph.trim().startsWith('- ')) {
        return (
          <li key={index} className="list-disc ml-6 my-2">
            {parseInlineStyles(paragraph.substring(2))}
          </li>
        );
      }

      return (
        <p key={index} className="mb-4 last:mb-0">
          {parseInlineStyles(paragraph)}
        </p>
      );
    });
  };

  const parseInlineStyles = (text: string) => {
    // Regex for bold (**text**), italic (*text*), underline (__text__)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={i} className="underline underline-offset-4">{part.slice(2, -2)}</u>;
      }
      return part;
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `পড়ুন: ${article.title} - SaadWrites`;

  return (
    <article className="max-w-3xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-stone-500 hover:text-accent transition-colors dark:text-stone-400"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(article)}
            className="p-2 text-stone-500 hover:text-blue-600 dark:text-stone-400 dark:hover:text-blue-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="সম্পাদনা করুন"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleDeleteClick}
            className="p-2 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-stone-300 dark:bg-stone-600 mx-1"></div>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="পড়ার সেটিংস"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 p-4 z-20">
                <div className="mb-4">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-2">ফন্ট সাইজ</p>
                  <div className="flex justify-between bg-stone-100 dark:bg-stone-900 rounded-lg p-1">
                    {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`flex-1 py-1 rounded-md text-sm font-medium transition-colors ${fontSize === s ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-800'}`}
                      >
                        {s === 'sm' ? 'A' : s === 'base' ? 'A+' : s === 'lg' ? 'A++' : 'A+++'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-2">ফন্ট স্টাইল</p>
                  <div className="space-y-1">
                    <button onClick={() => setFontFamily('serif')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-serif ${fontFamily === 'serif' ? 'bg-stone-100 dark:bg-stone-700 text-accent' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>মেরিওয়েদার (ডিফল্ট)</button>
                    <button onClick={() => setFontFamily('kalpurush')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-kalpurush ${fontFamily === 'kalpurush' ? 'bg-stone-100 dark:bg-stone-700 text-accent' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>কালপুরুষ</button>
                    <button onClick={() => setFontFamily('bornomala')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bornomala ${fontFamily === 'bornomala' ? 'bg-stone-100 dark:bg-stone-700 text-accent' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>বর্ণমালা</button>
                    <button onClick={() => setFontFamily('hind')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-hind ${fontFamily === 'hind' ? 'bg-stone-100 dark:bg-stone-700 text-accent' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>হিন্দ শিলিগুড়ি</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Folder className="w-4 h-4" />
            <span className="font-medium text-accent">{article.category}</span>
          </div>
          <div className="hidden md:block w-1 h-1 bg-stone-300 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
          <div className="hidden md:block w-1 h-1 bg-stone-300 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Hourglass className="w-4 h-4" />
            <span>{calculateReadingTime(article.content)} সময় লাগবে</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-hind font-bold text-stone-900 dark:text-stone-100 leading-tight mb-8">
          {article.title}
        </h1>

        {article.coverImage && (
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {article.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-xs font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className={`prose dark:prose-invert max-w-none ${getFontSizeClass()} ${getFontFamilyClass()} text-stone-700 dark:text-stone-300 leading-8 transition-all`}>
        {renderContent(article.content)}
      </div>

      <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 text-sm">ভালো লাগলে বন্ধুদের সাথে শেয়ার করুন</p>
        <div className="flex items-center gap-3">
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="ফেসবুকে শেয়ার করুন"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
            title="টুইটারে শেয়ার করুন"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors"
            title="লিংকডইনে শেয়ার করুন"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="হোয়াটসঅ্যাপে শেয়ার করুন"
          >
            <Share2 className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-hind font-bold text-stone-800 dark:text-stone-100 mb-8 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          পাঠকের মন্তব্য ({article.comments?.length || 0})
        </h3>

        {/* Comment List */}
        <div className="space-y-6 mb-12">
          {article.comments && article.comments.length > 0 ? (
            article.comments.map((comment) => (
              <div key={comment.id} className="bg-stone-50 dark:bg-stone-800 p-6 rounded-xl border border-stone-100 dark:border-stone-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm font-hind">{comment.author}</h4>
                      <p className="text-xs text-stone-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed pl-10">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-stone-500 dark:text-stone-400 text-center py-8 italic bg-stone-50 dark:bg-stone-800 rounded-xl border border-dashed border-stone-200 dark:border-stone-700">
              এখনো কোনো মন্তব্য নেই। আপনিই প্রথম মন্তব্য করুন!
            </p>
          )}
        </div>

        {/* Comment Form */}
        <div className="bg-white dark:bg-stone-800 p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
          <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-6 font-hind">আপনার মতামত জানান</h4>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <input
                required
                type="text"
                placeholder="আপনার নাম"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm text-stone-800 dark:text-stone-100 dark:placeholder-stone-400"
              />
            </div>
            <div>
              <textarea
                required
                rows={3}
                placeholder="আপনার মন্তব্য এখানে লিখুন..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none font-serif text-stone-800 dark:text-stone-100 dark:placeholder-stone-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              মন্তব্য প্রকাশ করুন
            </button>
          </form>
        </div>
      </div>
    </article>
  );
};