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
import { subscribeToArticles, saveArticleToFirebase, deleteArticleFromFirebase, logoutUser, subscribeToAuthChanges } from './services/firebaseService';

// Initial dummy data for fallback
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
  }
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  // Firebase Subscriptions
  useEffect(() => {
    // Auth Subscription
    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });

    // Articles Subscription
    const unsubscribeArticles = subscribeToArticles((fetchedArticles) => {
      setArticles(fetchedArticles);
      setIsLoadingArticles(false);

      // Data Migration: Check if we have local articles but remote is empty (first sync)
      // Or just a one-time migration check
      const localData = localStorage.getItem('lekhoni_articles');
      if (localData && fetchedArticles.length === 0) {
        try {
          const parsed = JSON.parse(localData) as Article[];
          if (parsed.length > 0) {
            console.log("Migrating local data to Firebase...");
            parsed.forEach(async (article) => {
              await saveArticleToFirebase({
                ...article,
                status: article.status || 'published',
                views: article.views || 0
              });
            });
            // Clear local to avoid re-migration
            localStorage.removeItem('lekhoni_articles');
            addToast('লোকাল ডাটা ক্লাউডে আপলোড করা হয়েছে', 'success');
          }
        } catch (e) {
          console.error("Migration failed", e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeArticles();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('saadwrites_theme', theme);
  }, [theme]);

  // Persist total visits locally (simplification, real analytics should be in DB)
  useEffect(() => {
    localStorage.setItem('saadwrites_visits', totalVisits.toString());
  }, [totalVisits]);

  // Persist Admin state
  useEffect(() => {
    localStorage.setItem('saadwrites_admin', JSON.stringify(isAdmin));
  }, [isAdmin]);

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
    // State update handled by subscription
    addToast(`স্বাগতম, ${user.name}!`, 'success');
    setView(ViewState.HOME);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      addToast('লগআউট সফল হয়েছে', 'info');
    } catch (e) {
      addToast('লগআউট করতে সমস্যা হয়েছে', 'error');
    }
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
              if (window.confirm('আপনি কি এই ডাটা ফায়ারবেসে ইমপোর্ট করতে চান?')) {
                parsedData.forEach(async (article) => {
                  await saveArticleToFirebase(article);
                });
                addToast('ডাটা ইমপোর্ট সফল হয়েছে', 'success');
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

  const handleSaveArticle = async (articleData: Article) => {
    try {
      await saveArticleToFirebase({
        ...articleData,
        views: articleData.views || 0 // Ensure views are preserved or init
      });
      
      setEditingArticle(null);
      addToast('লেখা ক্লাউডে সেভ হয়েছে', 'success');
      
      // Clear session draft
      localStorage.removeItem('saadwrites_draft_content');
      localStorage.removeItem('saadwrites_draft_title');
      setView(ViewState.HOME);
    } catch (e) {
      console.error(e);
      addToast('সেভ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleSelectArticle = async (article: Article) => {
    // Increment view counts locally and remotely
    const newViews = (article.views || 0) + 1;
    setTotalVisits(prev => prev + 1);
    
    // Fire and forget update
    saveArticleToFirebase({ ...article, views: newViews }).catch(e => console.error(e));
    
    // Update local state for immediate feedback
    setActiveArticle({ ...article, views: newViews });
    setView(ViewState.READER);
    window.scrollTo(0,0);
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleFromFirebase(articleId);
      setActiveArticle(null);
      setView(ViewState.HOME);
      addToast('লেখা মুছে ফেলা হয়েছে', 'success');
    } catch (e) {
      addToast('মুছতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setView(ViewState.EDITOR);
  };

  const handleAddComment = async (articleId: string, commentData: { author: string; content: string; authorId?: string; authorAvatar?: string }) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: commentData.author,
      content: commentData.content,
      createdAt: Date.now(),
      authorId: commentData.authorId,
      authorAvatar: commentData.authorAvatar
    };

    const updatedComments = [...(article.comments || []), newComment];
    try {
      await saveArticleToFirebase({ ...article, comments: updatedComments });
      if (activeArticle && activeArticle.id === articleId) {
        setActiveArticle({ ...activeArticle, comments: updatedComments });
      }
      addToast('মন্তব্য প্রকাশ করা হয়েছে', 'success');
    } catch (e) {
      addToast('মন্তব্য সেভ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setView(ViewState.HOME);
    addToast(`#${tag} খোঁজা হচ্ছে`, 'info');
  };

  const renderContent = () => {
    if (isLoadingArticles) {
      return <div className="flex h-screen items-center justify-center text-gold font-kalpurush text-xl">লোড হচ্ছে...</div>;
    }

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