import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Editor } from './components/Editor';
import { ArticleList } from './components/ArticleList';
import { ArticleReader } from './components/ArticleReader';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { Insight } from './components/Insight';
import { Login } from './components/Login';
import { Article, ViewState, Comment, Toast, ToastType, User } from './types';

// Initial dummy data
const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'বৃষ্টির দিনে জানালার পাশে',
    content: `আকাশটা আজ সকাল থেকেই ভার হয়ে আছে। মেঘের ঘনঘটা দেখে মনে হচ্ছে, প্রকৃতি আজ কাঁদবে। জানালার পাশে বসে আছি, হাতে ধোঁয়া ওঠা চায়ের কাপ। এমন দিনে পুরোনো স্মৃতিগুলো বড় বেশি নাড়া দেয়। \n\nছোটবেলার সেই কাগজের নৌকা ভাসানো, কাদা মাখা পায়ে বাড়ি ফেরা – সব যেন চোখের সামনে ভেসে উঠছে। বড় হওয়ার সাথে সাথে আমরা কত কিছু হারিয়ে ফেলি। সারল্য, নির্ভাবনা, আর সেই অকারণ আনন্দগুলো। \n\nবৃষ্টির রিমঝিম শব্দে এক অদ্ভুত সুর আছে। যেন কোনো এক অজানা বিষাদ আর আনন্দের সংমিশ্রণ। এই শব্দ শুনলে মনটা কোথায় যেন হারিয়ে যায়।`,
    createdAt: Date.now() - 86400000 * 2,
    tags: ['স্মৃতি', 'বৃষ্টি', 'প্রকৃতি'],
    category: 'গল্প',
    coverImage: 'https://picsum.photos/800/400?random=1',
    comments: [],
    status: 'published',
    views: 124
  },
  {
    id: '2',
    title: 'প্রযুক্তি ও আমাদের জীবন',
    content: `বর্তমান যুগ প্রযুক্তির যুগ। সকালের অ্যালার্ম থেকে শুরু করে রাতে ঘুমানোর আগে সোশ্যাল মিডিয়া স্ক্রলিং – আমাদের জীবনের প্রতিটি মুহূর্ত এখন প্রযুক্তির সাথে জড়িয়ে আছে। কিন্তু এই অতি প্রযুক্তি নির্ভরতা কি আমাদের যান্ত্রিক করে তুলছে না?`,
    createdAt: Date.now() - 86400000 * 5,
    tags: ['প্রযুক্তি', 'জীবন', 'ভাবনা'],
    category: 'প্রবন্ধ',
    coverImage: 'https://picsum.photos/800/400?random=2',
    comments: [],
    status: 'published',
    views: 89
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('lekhoni_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Data Migration: Ensure 'status' and 'views' exist
        return parsed.map((a: any) => ({
          ...a,
          status: a.status || 'published',
          views: a.views || 0
        }));
      } catch (e) {
        return INITIAL_ARTICLES;
      }
    }
    return INITIAL_ARTICLES;
  });
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats State
  const [totalVisits, setTotalVisits] = useState<number>(() => {
    const saved = localStorage.getItem('saadwrites_visits');
    return saved ? parseInt(saved, 10) : 1054;
  });

  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('saadwrites_admin');
    return saved ? JSON.parse(saved) : true;
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('saadwrites_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Toasts State
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // Persist total visits
  useEffect(() => {
    localStorage.setItem('saadwrites_visits', totalVisits.toString());
  }, [totalVisits]);

  // Persist Admin state
  useEffect(() => {
    localStorage.setItem('saadwrites_admin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Persist User state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('saadwrites_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('saadwrites_user');
    }
  }, [currentUser]);

  const toggleAdmin = () => {
    setIsAdmin(prev => {
      const newState = !prev;
      addToast(newState ? 'এডিটর মোড চালু হয়েছে' : 'রিডার মোড চালু হয়েছে', 'info');
      if (!newState && (view === ViewState.EDITOR || view === ViewState.INSIGHT)) {
        setView(ViewState.HOME);
      }
      return newState;
    });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addToast(`স্বাগতম, ${user.name}!`, 'success');
    setView(ViewState.HOME);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('লগআউট সফল হয়েছে', 'info');
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const allCategories = useMemo(() => {
    const defaultCats = ['গল্প', 'কবিতা', 'প্রবন্ধ', 'অন্যান্য'];
    const articleCats = articles.map(a => a.category);
    return Array.from(new Set([...defaultCats, ...articleCats]));
  }, [articles]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    addToast(theme === 'light' ? 'ডার্ক মোড চালু হয়েছে' : 'লাইট মোড চালু হয়েছে', 'info');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(articles, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `saadwrites_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addToast('ব্যাকআপ ডাউনলোড হয়েছে', 'success');
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
              if (window.confirm('আপনি কি বর্তমান ডাটা রিপ্লেস করে ব্যাকআপ রিস্টোর করতে চান?')) {
                setArticles(parsedData);
                addToast('ডাটা রিস্টোর সফল হয়েছে', 'success');
                setView(ViewState.HOME);
              }
            } else {
              addToast('ভুল ফাইল ফরম্যাট', 'error');
            }
          }
        } catch (error) {
          addToast('ফাইল পড়তে সমস্যা হয়েছে', 'error');
        }
      };
    }
  };

  const handleSaveArticle = (articleData: Article) => {
    if (editingArticle) {
      const updatedArticles = articles.map(a => 
        a.id === articleData.id ? { ...articleData, views: a.views || 0 } : a
      );
      setArticles(updatedArticles);
      setEditingArticle(null);
      addToast('লেখা আপডেট করা হয়েছে', 'success');
    } else {
      setArticles([{ ...articleData, views: 0 }, ...articles]);
      addToast('নতুন লেখা সেভ হয়েছে', 'success');
    }
    // Clear session draft
    localStorage.removeItem('saadwrites_draft_content');
    localStorage.removeItem('saadwrites_draft_title');
    setView(ViewState.HOME);
  };

  const handleSelectArticle = (article: Article) => {
    // Increment view counts
    const updatedArticles = articles.map(a => 
      a.id === article.id ? { ...a, views: (a.views || 0) + 1 } : a
    );
    setArticles(updatedArticles);
    setTotalVisits(prev => prev + 1);
    
    // Update local state for immediate feedback
    setActiveArticle({ ...article, views: (article.views || 0) + 1 });
    setView(ViewState.READER);
    window.scrollTo(0,0);
  };

  const handleDeleteArticle = (articleId: string) => {
    const updatedArticles = articles.filter(a => a.id !== articleId);
    setArticles(updatedArticles);
    setActiveArticle(null);
    setView(ViewState.HOME);
    addToast('লেখা মুছে ফেলা হয়েছে', 'success');
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setView(ViewState.EDITOR);
  };

  const handleAddComment = (articleId: string, commentData: { author: string; content: string; authorId?: string; authorAvatar?: string }) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentData.author,
      content: commentData.content,
      createdAt: Date.now(),
      authorId: commentData.authorId,
      authorAvatar: commentData.authorAvatar
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
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle({
        ...activeArticle,
        comments: [...(activeArticle.comments || []), newComment]
      });
    }
    addToast('মন্তব্য প্রকাশ করা হয়েছে', 'success');
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setView(ViewState.HOME);
    addToast(`#${tag} খোঁজা হচ্ছে`, 'info');
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.EDITOR:
        return isAdmin ? (
          <Editor 
            initialArticle={editingArticle || undefined}
            onSave={handleSaveArticle} 
            onCancel={() => {
              setEditingArticle(null);
              setView(ViewState.HOME);
            }}
            existingCategories={allCategories}
            onShowToast={addToast}
          />
        ) : <div className="text-center p-10">অনুমতি নেই</div>;
      case ViewState.INSIGHT:
        return isAdmin ? (
          <Insight articles={articles} totalVisits={totalVisits} />
        ) : <div className="text-center p-10">অনুমতি নেই</div>;
      case ViewState.READER:
        return activeArticle ? (
          <ArticleReader 
            article={activeArticle}
            allArticles={articles}
            onBack={() => setView(ViewState.HOME)} 
            onSelectArticle={handleSelectArticle}
            onAddComment={handleAddComment}
            onDelete={handleDeleteArticle}
            onEdit={handleEditArticle}
            onTagClick={handleTagClick}
            onShowToast={addToast}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
        ) : (
          <div className="text-center p-10">কোনো লেখা পাওয়া যায়নি</div>
        );
      case ViewState.CONTACT:
        return <Contact />;
      case ViewState.ABOUT:
        return <About />;
      case ViewState.LOGIN:
        return <Login onLogin={handleLogin} />;
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
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isAdmin={isAdmin}
            onShowToast={addToast}
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
      totalVisits={totalVisits}
      toasts={toasts}
      removeToast={removeToast}
      isAdmin={isAdmin}
      toggleAdmin={toggleAdmin}
      user={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
