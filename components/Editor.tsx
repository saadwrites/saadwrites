import React, { useState, useEffect, useRef } from 'react';
import { Save, Sparkles, RefreshCw, Type, AlignLeft, FolderOpen, Plus, Image as ImageIcon, X, Bold, Italic, Underline, List } from 'lucide-react';
import { generateWritingAssistance } from '../services/geminiService';
import { Article, ArticleCategory } from '../types';

interface EditorProps {
  initialArticle?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
  existingCategories?: string[];
}

export const Editor: React.FC<EditorProps> = ({ initialArticle, onSave, onCancel, existingCategories = [] }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('গল্প');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync available categories with existing ones passed from App
  useEffect(() => {
    const defaults = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const merged = Array.from(new Set([...defaults, ...existingCategories, ...availableCategories]));
    setAvailableCategories(merged);
  }, [existingCategories]);

  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title);
      setContent(initialArticle.content);
      setTags(initialArticle.tags.join(', '));
      setCategory(initialArticle.category);
      setCoverImage(initialArticle.coverImage || null);
      
      // Ensure the category exists in the dropdown
      setAvailableCategories(prev => {
        if (!prev.includes(initialArticle.category)) {
          return [...prev, initialArticle.category];
        }
        return prev;
      });
    }
  }, [initialArticle]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('অনুগ্রহ করে শিরোনাম এবং বিষয়বস্তু লিখুন');
      return;
    }
    
    const article: Article = {
      id: initialArticle ? initialArticle.id : Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: initialArticle ? initialArticle.createdAt : Date.now(),
      coverImage: coverImage || undefined,
      category,
      comments: initialArticle?.comments // Preserve comments if editing
    };
    
    onSave(article);
  };

  const handleAddCategory = () => {
    const newCat = prompt('নতুন ক্যাটাগরির নাম লিখুন:');
    if (newCat && newCat.trim()) {
      const trimmedCat = newCat.trim();
      if (!availableCategories.includes(trimmedCat)) {
        setAvailableCategories([...availableCategories, trimmedCat]);
      }
      setCategory(trimmedCat);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      handleAddCategory();
    } else {
      setCategory(value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to insert formatting tags
  const insertFormatting = (startTag: string, endTag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = content;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      
      const newText = before + startTag + selection + endTag + after;
      setContent(newText);
      
      // Reset cursor
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
      
      if (task === 'grammar' || task === 'expand') {
         setContent(prev => prev + '\n\n' + result);
      } else if (task === 'ideas') {
         setContent(prev => prev + '\n\n--- আইডিয়া সমূহ ---\n' + result);
      } else if (task === 'summarize') {
         alert('সারসংক্ষেপ:\n' + result);
      }

    } catch (error) {
      alert('এআই জেনারেশনে সমস্যা হয়েছে।');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center pb-6 border-b border-stone-200 dark:border-stone-700">
        <h2 className="text-3xl font-hind font-bold text-stone-800 dark:text-stone-100">
          {initialArticle ? 'লেখা সম্পাদনা' : 'নতুন লেখা'}
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
          >
            বাতিল
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl dark:bg-stone-200 dark:text-stone-900"
          >
            <Save className="w-4 h-4" />
            {initialArticle ? 'হালনাগাদ করুন' : 'প্রকাশ করুন'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Cover Image Preview */}
        {coverImage && (
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 group bg-stone-100 dark:bg-stone-800">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <button 
              onClick={() => setCoverImage(null)}
              className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-full shadow-sm transition-all dark:bg-black/50 dark:text-white dark:hover:bg-red-900/50"
              title="ছবি মুছে ফেলুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="গল্প বা প্রবন্ধের শিরোনাম..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-hind font-bold bg-transparent border-none placeholder-stone-300 focus:ring-0 focus:outline-none text-stone-800 dark:text-stone-100 dark:placeholder-stone-600"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 py-3 border-y border-stone-200 dark:border-stone-700 sticky top-0 bg-paper/95 dark:bg-[#1a1a1a]/95 backdrop-blur z-10 transition-colors">
          <div className="relative">
            <button 
              onClick={() => setShowAiMenu(!showAiMenu)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isGenerating ? 'bg-stone-100 text-stone-400 dark:bg-stone-800' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'লিখছে...' : 'এআই সাহায্য'}
            </button>
            
            {showAiMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden z-20">
                <button onClick={() => handleAiAssist('grammar')} className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700 text-sm flex gap-2 items-center text-stone-700 dark:text-stone-200">
                  <AlignLeft className="w-4 h-4 text-stone-400" /> ব্যাকরণ ঠিক করুন
                </button>
                <button onClick={() => handleAiAssist('expand')} className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700 text-sm flex gap-2 items-center text-stone-700 dark:text-stone-200">
                  <Type className="w-4 h-4 text-stone-400" /> লেখা বড় করুন
                </button>
                <button onClick={() => handleAiAssist('ideas')} className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700 text-sm flex gap-2 items-center text-stone-700 dark:text-stone-200">
                  <Sparkles className="w-4 h-4 text-stone-400" /> আইডিয়া জেনারেট করুন
                </button>
              </div>
            )}
          </div>
          
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 hidden md:block"></div>

          {/* Formatting Buttons */}
          <div className="flex items-center gap-1">
            <button onClick={() => insertFormatting('**', '**')} className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors" title="বোল্ড">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormatting('*', '*')} className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors" title="ইটালিক">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormatting('__', '__')} className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors" title="আন্ডারলাইন">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => insertFormatting('\n- ', '')} className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors" title="লিস্ট">
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 hidden md:block"></div>

          {/* Image Upload Button */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden md:inline">কভার ছবি</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 hidden md:block"></div>

          {/* Category Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 px-2 pl-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
            <FolderOpen className="w-4 h-4 text-stone-400" />
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="bg-transparent border-none text-sm text-stone-700 dark:text-stone-300 focus:ring-0 cursor-pointer p-0 pr-6 focus:outline-none"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__NEW__" className="font-bold text-accent">+ নতুন যুক্ত করুন...</option>
            </select>
          </div>
          
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 hidden md:block"></div>
          
          <input 
            type="text" 
            placeholder="ট্যাগ সমূহ (কমা দিয়ে আলাদা করুন)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-sm text-stone-600 dark:text-stone-400 focus:outline-none placeholder-stone-400 dark:placeholder-stone-600"
          />
        </div>

        <textarea
          ref={textareaRef}
          placeholder="এখানে আপনার মনের কথা লিখুন..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[60vh] text-lg leading-relaxed text-stone-700 dark:text-stone-300 bg-transparent border-none resize-none focus:ring-0 focus:outline-none font-serif placeholder-stone-300 dark:placeholder-stone-700"
        />
      </div>
    </div>
  );
};