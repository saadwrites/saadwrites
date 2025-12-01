import React, { useState } from 'react';
import { Save, Sparkles, RefreshCw, Type, AlignLeft, FolderOpen, Plus } from 'lucide-react';
import { generateWritingAssistance } from '../services/geminiService';
import { Article, ArticleCategory } from '../types';

interface EditorProps {
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export const Editor: React.FC<EditorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('গল্প');
  const [availableCategories, setAvailableCategories] = useState<string[]>(['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('অনুগ্রহ করে শিরোনাম এবং বিষয়বস্তু লিখুন');
      return;
    }
    
    const newArticle: Article = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
      coverImage: `https://picsum.photos/800/400?random=${Date.now()}`,
      category
    };
    
    onSave(newArticle);
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
      <div className="flex justify-between items-center pb-6 border-b border-stone-200">
        <h2 className="text-3xl font-serif font-bold text-stone-800">নতুন লেখা</h2>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            বাতিল
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            প্রকাশ করুন
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="গল্প বা প্রবন্ধের শিরোনাম..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-serif font-bold bg-transparent border-none placeholder-stone-300 focus:ring-0 focus:outline-none text-stone-800"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 py-3 border-y border-stone-200 sticky top-0 bg-paper/95 backdrop-blur z-10">
          <div className="relative">
            <button 
              onClick={() => setShowAiMenu(!showAiMenu)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isGenerating ? 'bg-stone-100 text-stone-400' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'লিখছে...' : 'এআই সাহায্য'}
            </button>
            
            {showAiMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20">
                <button onClick={() => handleAiAssist('grammar')} className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm flex gap-2 items-center">
                  <AlignLeft className="w-4 h-4 text-stone-400" /> ব্যাকরণ ঠিক করুন
                </button>
                <button onClick={() => handleAiAssist('expand')} className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm flex gap-2 items-center">
                  <Type className="w-4 h-4 text-stone-400" /> লেখা বড় করুন
                </button>
                <button onClick={() => handleAiAssist('ideas')} className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm flex gap-2 items-center">
                  <Sparkles className="w-4 h-4 text-stone-400" /> আইডিয়া জেনারেট করুন
                </button>
              </div>
            )}
          </div>
          
          <div className="h-4 w-px bg-stone-300 hidden md:block"></div>

          {/* Category Selector */}
          <div className="flex items-center gap-2 bg-white px-2 pl-3 py-1.5 rounded-lg border border-stone-200">
            <FolderOpen className="w-4 h-4 text-stone-400" />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as ArticleCategory)}
              className="bg-transparent border-none text-sm text-stone-700 focus:ring-0 cursor-pointer p-0 pr-6"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button 
              onClick={handleAddCategory}
              className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-accent transition-colors"
              title="নতুন ক্যাটাগরি যোগ করুন"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-4 w-px bg-stone-300 hidden md:block"></div>
          
          <input 
            type="text" 
            placeholder="ট্যাগ সমূহ (কমা দিয়ে আলাদা করুন)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-sm text-stone-600 focus:outline-none placeholder-stone-400"
          />
        </div>

        <textarea
          placeholder="এখানে আপনার মনের কথা লিখুন..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[60vh] text-lg leading-relaxed text-stone-700 bg-transparent border-none resize-none focus:ring-0 focus:outline-none font-serif"
        />
      </div>
    </div>
  );
};