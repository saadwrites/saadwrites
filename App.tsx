import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Editor } from './components/Editor';
import { ArticleList } from './components/ArticleList';
import { ArticleReader } from './components/ArticleReader';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { Article, ViewState, Comment } from './types';

// Initial dummy data for visual population
const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'বৃষ্টির দিনে জানালার পাশে',
    content: `আকাশটা আজ সকাল থেকেই ভার হয়ে আছে। মেঘের ঘনঘটা দেখে মনে হচ্ছে, প্রকৃতি আজ কাঁদবে। জানালার পাশে বসে আছি, হাতে ধোঁয়া ওঠা চায়ের কাপ। এমন দিনে পুরোনো স্মৃতিগুলো বড় বেশি নাড়া দেয়। \n\nছোটবেলার সেই কাগজের নৌকা ভাসানো, কাদা মাখা পায়ে বাড়ি ফেরা – সব যেন চোখের সামনে ভেসে উঠছে। বড় হওয়ার সাথে সাথে আমরা কত কিছু হারিয়ে ফেলি। সারল্য, নির্ভাবনা, আর সেই অকারণ আনন্দগুলো। \n\nবৃষ্টির রিমঝিম শব্দে এক অদ্ভুত সুর আছে। যেন কোনো এক অজানা বিষাদ আর আনন্দের সংমিশ্রণ। এই শব্দ শুনলে মনটা কোথায় যেন হারিয়ে যায়।`,
    createdAt: Date.now() - 86400000 * 2,
    tags: ['স্মৃতি', 'বৃষ্টি', 'প্রকৃতি'],
    category: 'গল্প',
    coverImage: 'https://picsum.photos/800/400?random=1',
    comments: [
      {
        id: 'c1',
        author: 'তানভীর আহমেদ',
        content: 'খুব সুন্দর লিখেছেন! বৃষ্টির দিনে এমন অনুভূতি আমাদের সবারই হয়।',
        createdAt: Date.now() - 86400000
      }
    ]
  },
  {
    id: '2',
    title: 'প্রযুক্তি ও আমাদের জীবন',
    content: `বর্তমান যুগ প্রযুক্তির যুগ। সকালের অ্যালার্ম থেকে শুরু করে রাতে ঘুমানোর আগে সোশ্যাল মিডিয়া স্ক্রলিং – আমাদের জীবনের প্রতিটি মুহূর্ত এখন প্রযুক্তির সাথে জড়িয়ে আছে। কিন্তু এই অতি প্রযুক্তি নির্ভরতা কি আমাদের যান্ত্রিক করে তুলছে না? \n\nমানুষের সাথে মানুষের সরাসরি যোগাযোগের চেয়ে আমরা এখন ভার্চুয়াল যোগাযোগেই বেশি স্বাচ্ছন্দ্য বোধ করি। অথচ, একটা উষ্ণ করমর্দন বা সরাসরি চোখের দিকে তাকিয়ে কথা বলার যে আবেদন, তা কি কোনো ইমোজি প্রকাশ করতে পারে?`,
    createdAt: Date.now() - 86400000 * 5,
    tags: ['প্রযুক্তি', 'জীবন', 'ভাবনা'],
    category: 'প্রবন্ধ',
    coverImage: 'https://picsum.photos/800/400?random=2',
    comments: []
  },
  {
    id: '3',
    title: 'নিঃসঙ্গ পথিক',
    content: `হেঁটে চলেছে সে বহুদূর,\nপায়ের তলায় তপ্ত দুপুর।\nনেই কোনো ছায়া, নেই কোনো মায়া,\nশুধু ধুধু প্রান্তর, শূন্য কায়া।\n\nবাতাসেরা কানে কানে বলে যায় কথা,\nমুছে দিতে চায় সব পুরোনো ব্যথা।\nতবুও সে পথিক থামে না কোথাও,\nখুঁজে ফেরে অজানার নতুন কোনো দাও।`,
    createdAt: Date.now() - 86400000 * 10,
    tags: ['কবিতা', 'পথিক', 'জীবন'],
    category: 'কবিতা',
    coverImage: 'https://picsum.photos/800/400?random=3',
    comments: []
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('lekhoni_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('saadwrites_theme');
      if (savedTheme) return savedTheme as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('lekhoni_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('saadwrites_theme', theme);
  }, [theme]);

  // Derived state for all categories used in articles
  const allCategories = useMemo(() => {
    const defaultCats = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const articleCats = articles.map(a => a.category);
    return Array.from(new Set([...defaultCats, ...articleCats]));
  }, [articles]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Backup & Restore functionality
  const handleExportData = () => {
    const dataStr = JSON.stringify(articles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `saadwrites_backup_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsedData = JSON.parse(event.target.result as string);
            if (Array.isArray(parsedData)) {
              if (window.confirm('আপনি কি বর্তমান ডাটা রিপ্লেস করে ব্যাকআপ রিস্টোর করতে চান? এটি বর্তমান ডাটা মুছে ফেলবে।')) {
                setArticles(parsedData);
                alert('ডাটা সফলভাবে রিস্টোর করা হয়েছে!');
                setView(ViewState.HOME);
              }
            } else {
              alert('ভুল ফাইল ফরম্যাট!');
            }
          }
        } catch (error) {
          alert('ফাইল পড়তে সমস্যা হয়েছে। দয়া করে সঠিক JSON ফাইল আপলোড করুন।');
        }
      };
    }
  };

  const handleSaveArticle = (articleData: Article) => {
    if (editingArticle) {
      // Update existing article
      const updatedArticles = articles.map(a => 
        a.id === articleData.id ? articleData : a
      );
      setArticles(updatedArticles);
      setEditingArticle(null);
    } else {
      // Create new article
      setArticles([articleData, ...articles]);
    }
    setView(ViewState.HOME);
  };

  const handleSelectArticle = (article: Article) => {
    setActiveArticle(article);
    setView(ViewState.READER);
  };

  const handleDeleteArticle = (articleId: string) => {
    const updatedArticles = articles.filter(a => a.id !== articleId);
    setArticles(updatedArticles);
    setActiveArticle(null);
    setView(ViewState.HOME);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setView(ViewState.EDITOR);
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
    setView(ViewState.HOME);
  };

  const handleAddComment = (articleId: string, commentData: { author: string; content: string }) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentData.author,
      content: commentData.content,
      createdAt: Date.now()
    };

    const updatedArticles = articles.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          comments: [...(article.comments || []), newComment]
        };
      }
      return article;
    });

    setArticles(updatedArticles);

    // Update active article if it's the one being modified
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle({
        ...activeArticle,
        comments: [...(activeArticle.comments || []), newComment]
      });
    }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.EDITOR:
        return (
          <Editor 
            initialArticle={editingArticle || undefined}
            onSave={handleSaveArticle} 
            onCancel={handleCancelEdit}
            existingCategories={allCategories}
          />
        );
      case ViewState.READER:
        return activeArticle ? (
          <ArticleReader 
            article={activeArticle} 
            onBack={() => setView(ViewState.HOME)} 
            onAddComment={handleAddComment}
            onDelete={handleDeleteArticle}
            onEdit={handleEditArticle}
          />
        ) : (
          <div className="text-center p-10">কোনো লেখা পাওয়া যায়নি</div>
        );
      case ViewState.CONTACT:
        return <Contact />;
      case ViewState.ABOUT:
        return <About />;
      case ViewState.HOME:
      default:
        return (
          <ArticleList 
            articles={articles} 
            onSelectArticle={handleSelectArticle} 
            onNewArticle={() => {
              setEditingArticle(null);
              setView(ViewState.EDITOR);
            }}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
    }
  };

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView} 
      theme={theme} 
      toggleTheme={toggleTheme}
      onExportData={handleExportData}
      onImportData={handleImportData}
    >
      {renderContent()}
    </Layout>
  );
}