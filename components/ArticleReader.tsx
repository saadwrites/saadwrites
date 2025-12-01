import React, { useState } from 'react';
import { ArrowLeft, Calendar, Tag, Share2, MessageCircle, User, Send, Folder } from 'lucide-react';
import { Article } from '../types';

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onAddComment: (articleId: string, comment: { author: string; content: string }) => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onBack, onAddComment }) => {
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <article className="max-w-3xl mx-auto animate-fade-in pb-20">
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-stone-500 hover:text-accent mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>ফিরে যান</span>
      </button>

      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-stone-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Folder className="w-4 h-4" />
            <span className="font-medium text-accent">{article.category}</span>
          </div>
          <div className="w-1 h-1 bg-stone-300 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight mb-8">
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
              <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-lg prose-stone max-w-none font-serif text-stone-700 leading-8 whitespace-pre-wrap">
        {article.content}
      </div>

      <div className="mt-16 pt-8 border-t border-stone-200 flex justify-between items-center">
        <p className="text-stone-500 italic font-serif">ধন্যবাদ পড়ার জন্য।</p>
        <button className="flex items-center gap-2 text-stone-600 hover:text-accent transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="text-sm">শেয়ার করুন</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-serif font-bold text-stone-800 mb-8 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          পাঠকের মন্তব্য ({article.comments?.length || 0})
        </h3>

        {/* Comment List */}
        <div className="space-y-6 mb-12">
          {article.comments && article.comments.length > 0 ? (
            article.comments.map((comment) => (
              <div key={comment.id} className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm">{comment.author}</h4>
                      <p className="text-xs text-stone-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-stone-700 text-sm leading-relaxed pl-10">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-stone-500 text-center py-8 italic bg-stone-50 rounded-xl border border-dashed border-stone-200">
              এখনো কোনো মন্তব্য নেই। আপনিই প্রথম মন্তব্য করুন!
            </p>
          )}
        </div>

        {/* Comment Form */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h4 className="font-bold text-stone-800 mb-6">আপনার মতামত জানান</h4>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <input
                required
                type="text"
                placeholder="আপনার নাম"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm"
              />
            </div>
            <div>
              <textarea
                required
                rows={3}
                placeholder="আপনার মন্তব্য এখানে লিখুন..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none font-serif"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
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