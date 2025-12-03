import React, { useState, useEffect, useRef } from 'react';
import { Save, Sparkles, Image as ImageIcon, X, Bold, Italic, List, FolderOpen, FileText, Clock, Type } from 'lucide-react';
import { generateWritingAssistance } from '../services/geminiService';
import { Article, ArticleCategory, ToastType } from '../types';

interface EditorProps {
  initialArticle?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
  existingCategories?: string[];
  onShowToast: (msg: string, type: ToastType) => void;
}

export const Editor: React.FC<EditorProps> = ({ initialArticle, onSave, onCancel, existingCategories = [], onShowToast }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('গল্প');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stats
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Initialize categories
  useEffect(() => {
    const defaults = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const merged = Array.from(new Set([...defaults, ...existingCategories]));
    setAvailableCategories(prev => Array.from(new Set([...prev, ...merged])));
  }, [existingCategories]);

  // Restore or Init Data
  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title);
      setContent(initialArticle.content);
      setTags(initialArticle.tags.join(', '));
      setCategory(initialArticle.category);
      setCoverImage(initialArticle.coverImage || null);
    } else {
      // Auto-restore draft from session
      const savedTitle = localStorage.getItem('saadwrites_draft_title');
      const savedContent = localStorage.getItem('saadwrites_draft_content');
      if (savedTitle) setTitle(savedTitle);
      if (savedContent) setContent(savedContent);
    }
  }, [initialArticle]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!initialArticle) {
      localStorage.setItem('saadwrites_draft_title', title);
      localStorage.setItem('saadwrites_draft_content', content);
    }
  }, [title, content, initialArticle]);

  const handleSave = (status: 'published' | 'draft') => {
    if (!title.trim() && !content.trim()) {
      onShowToast('অনুগ্রহ করে অন্তত শিরোনাম বা কিছু লেখা লিখুন', 'error');
      return;
    }
    
    const article: Article = {
      id: initialArticle ? initialArticle.id : Date.now().toString(),
      title: title.trim() || 'শিরোনামহীন',
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: initialArticle ? initialArticle.createdAt : Date.now(),
      coverImage: coverImage || undefined,
      category,
      comments: initialArticle?.comments,
      status: status,
      views: initialArticle?.views || 0
    };
    
    onSave(article);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      setShowNewCatInput(true);
    } else {
      setCategory(value);
      setShowNewCatInput(false);
    }
  };

  const handleAddCategory = () => {
    if (newCatInput.trim()) {
      setAvailableCategories(prev => [...prev, newCatInput.trim()]);
      setCategory(newCatInput.trim());
      setNewCatInput('');
      setShowNewCatInput(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        onShowToast('ছবির সাইজ ৫MB এর বেশি হতে পারবে না', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        onShowToast('ছবি যুক্ত হয়েছে', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const insertFormatting = (startTag: string, endTag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = content;
      const newText = text.substring(0, start) + startTag + text.substring(start, end) + endTag + text.substring(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + startTag.length, end + startTag.length);
        }
      }, 0);
    }
  };

  const handleAiAssist = async (task: string) => {
    setIsGenerating(true);
    setShowAiMenu(false);
    try {
      const result = await generateWritingAssistance(task === 'ideas' ? title : '', content, task);
      if (task === 'ideas') {
        setContent(prev => prev + '\n\n--- আইডিয়া সমূহ ---\n' + result);
      } else {
        // Appending result for all other tasks (grammar, expand, styles, tones)
        setContent(prev => prev + '\n\n' + result);
      }
      onShowToast('এআই জেনারেশন সম্পন্ন হয়েছে', 'success');
    } catch (error) {
      onShowToast('এআই সেবা সংযোগে সমস্যা হচ্ছে', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-12 sticky top-0 bg-cream/90 dark:bg-[#0f0f0f]/90 backdrop-blur z-20 py-6 border-b border-stone-200/50 dark:border-stone-800 transition-colors duration-700 ease-in-out">
        <button 
          onClick={onCancel}
          className="text-stone-500 hover:text-charcoal dark:hover:text-stone-200 text-sm font-bold uppercase tracking-wider transition-colors"
        >
          বাতিল
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSave('draft')}
            className="px-6 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-stone-300 dark:hover:bg-stone-700 transition-all text-sm font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            খসড়া রাখুন
          </button>
          <button 
            onClick={() => handleSave('published')}
            className="px-8 py-2.5 bg-charcoal dark:bg-stone-100 text-white dark:text-charcoal rounded-full hover:bg-gold dark:hover:bg-gold transition-all shadow-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {initialArticle && initialArticle.status === 'published' ? 'আপডেট করুন' : 'প্রকাশ করুন'}
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Cover Image Upload */}
        <div className="group relative">
          {coverImage ? (
            <div className="relative w-full h-80 md:h-[450px] rounded-sm shadow-xl overflow-hidden bg-stone-100 dark:bg-stone-800 transition-colors duration-700">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10"></div>
              <button 
                onClick={() => setCoverImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/90 text-stone-600 hover:text-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 w-full border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg hover:border-gold dark:hover:border-gold hover:bg-white/50 dark:hover:bg-stone-800/50 cursor-pointer transition-all gap-3 text-stone-400 hover:text-gold group duration-700">
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full group-hover:bg-gold/10 transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">কভার ছবি যুক্ত করুন</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="শিরোনাম..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-5xl md:text-7xl font-kalpurush font-bold bg-transparent border-none placeholder-stone-300 dark:placeholder-stone-700 focus:ring-0 focus:outline-none text-charcoal dark:text-stone-50 p-0 leading-tight transition-colors duration-700"
        />

        {/* Minimal Toolbar */}
        <div className="flex flex-wrap items-center gap-6 text-stone-400 border-y border-stone-200 dark:border-stone-800 py-4 sticky top-24 z-10 bg-cream dark:bg-[#0f0f0f] transition-colors duration-700 ease-in-out">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 hover:border-gold transition-colors">
            <FolderOpen className="w-4 h-4 text-gold" />
            {!showNewCatInput ? (
              <select 
                value={category}
                onChange={handleCategoryChange}
                className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-charcoal dark:text-stone-300 focus:ring-0 cursor-pointer p-0 pr-6 focus:outline-none transition-colors duration-700"
              >
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="__NEW__" className="text-gold font-bold">+ নতুন</option>
              </select>
            ) : (
              <div className="flex items-center">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="নাম লিখুন..." 
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 w-24"
                />
                <button onClick={handleAddCategory} className="text-gold text-xs px-2 hover:underline">Add</button>
                <button onClick={() => setShowNewCatInput(false)} className="text-stone-400 px-1 hover:text-red-500"><X className="w-3 h-3"/></button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-stone-700 transition-colors duration-700"></div>

          <div className="flex gap-2">
            <button onClick={() => insertFormatting('**', '**')} className="p-2 hover:text-charcoal dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertFormatting('*', '*')} className="p-2 hover:text-charcoal dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
            <button onClick={() => insertFormatting('\n- ', '')} className="p-2 hover:text-charcoal dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors" title="List"><List className="w-4 h-4" /></button>
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-stone-700 transition-colors duration-700"></div>

          {/* Stats */}
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-stone-500 hidden md:flex">
             <span className="flex items-center gap-1"><Type className="w-3 h-3"/> {wordCount} শব্দ</span>
             <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {readingTime} মিনিট</span>
          </div>

          <div className="relative ml-auto">
             <button 
               onClick={() => setShowAiMenu(!showAiMenu)}
               disabled={isGenerating}
               className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-full ${isGenerating ? 'text-stone-300 bg-stone-100' : 'text-stone-500 hover:text-gold hover:bg-gold/10'}`}
             >
               <Sparkles className="w-4 h-4" />
               {isGenerating ? 'চিন্তা করছে...' : 'এআই সাহায্য'}
             </button>
             {showAiMenu && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-stone-900 rounded-lg shadow-premium border border-stone-100 dark:border-stone-700 overflow-hidden z-30 py-2 max-h-96 overflow-y-auto">
                  <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 dark:bg-stone-900/50">সাধারণ</div>
                  <button onClick={() => handleAiAssist('grammar')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">ব্যাকরণ ঠিক করুন</button>
                  <button onClick={() => handleAiAssist('expand')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">লেখা বড় করুন</button>
                  <button onClick={() => handleAiAssist('ideas')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">আইডিয়া দিন</button>
                  
                  <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800">শৈলী (Style)</div>
                  <button onClick={() => handleAiAssist('style_concise')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">সংক্ষিপ্ত করুন</button>
                  <button onClick={() => handleAiAssist('style_descriptive')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">বর্ণনামূলক করুন</button>

                  <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800">সুর (Tone)</div>
                  <button onClick={() => handleAiAssist('tone_literary')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">সাহিত্যিক</button>
                  <button onClick={() => handleAiAssist('tone_formal')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">আনুষ্ঠানিক</button>
                  <button onClick={() => handleAiAssist('tone_casual')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">বন্ধুসুলভ</button>
                  
                  <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800">ধরণ (Genre)</div>
                  <button onClick={() => handleAiAssist('genre_mystery')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">রহস্য (Mystery)</button>
                  <button onClick={() => handleAiAssist('genre_romance')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">রোমান্টিক (Romance)</button>
                  <button onClick={() => handleAiAssist('genre_horror')} className="w-full text-left px-5 py-3 hover:bg-cream dark:hover:bg-stone-800 text-sm font-medium text-charcoal dark:text-stone-300 transition-colors">ভৌতিক (Horror)</button>
                </div>
              )}
          </div>
        </div>

        {/* Content Area */}
        <textarea
          ref={textareaRef}
          placeholder="আপনার গল্প শুরু করুন..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[60vh] text-xl md:text-2xl leading-[2] text-charcoal dark:text-stone-300 bg-transparent border-none resize-none focus:ring-0 focus:outline-none font-serif placeholder-stone-300 dark:placeholder-stone-700 p-0 transition-colors duration-700"
        />

        <div className="pt-8 border-t border-stone-200 dark:border-stone-800 transition-colors duration-700">
           <input 
             type="text" 
             placeholder="#ট্যাগ (যেমন: ভ্রমণ, স্মৃতি)"
             value={tags}
             onChange={(e) => setTags(e.target.value)}
             className="w-full bg-transparent text-base font-medium text-stone-600 dark:text-stone-400 focus:outline-none placeholder-stone-300 dark:placeholder-stone-700 border-none p-0 transition-colors duration-700"
           />
        </div>
      </div>
    </div>
  );
};