
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Editor } from './components/Editor';
import { ArticleList } from './components/ArticleList';
import { ArticleReader } from './components/ArticleReader';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { Insight } from './components/Insight';
import { Login } from './components/Login';
import { Article, ViewState, Comment, Toast, ToastType, User, SiteConfig } from './types';
import { 
  subscribeToArticles, 
  saveArticleToFirebase, 
  deleteArticleFromFirebase, 
  logoutUser, 
  subscribeToAuthChanges,
  subscribeToConfig,
  saveSiteConfig
} from './services/firebaseService';
import { DEMO_ARTICLES } from './demoData';

// Default config used as fallback
const INITIAL_CONFIG: SiteConfig = {
  siteName: "SaadWrites",
  tagline: "শব্দ যেখানে কথা বলে",
  footerText: "© 2025 SaadWrites.",
  contactEmail: "abdullahsaadbd61@gmail.com",
  contactPhone: "+880 1883-672961",
  contactAddress: "Kishoreganj, Bangladesh",
  newsletterTitle: "সাহিত্য ও চিন্তার সাথে থাকুন",
  newsletterDesc: "আমার নতুন লেখা, ভাবনা এবং আপডেটের খবর সবার আগে পেতে ইমেইল দিয়ে যুক্ত হোন। কোনো স্প্যাম নয়, শুধুই সাহিত্য।",
  aboutName: "আব্দুল্লাহ সাআদ",
  aboutBio: "আমি আব্দুল্লাহ সাআদ। আমার ধমনীতে কিশোরগঞ্জের পলিমাটির ঘ্রাণ, আর স্মৃতির পাতায় মেঘনা-বিধৌত নোয়াখালীর নোনা বাতাস। জন্ম ও শৈশবের সোনালী দিনগুলো কেটেছে কিশোরগঞ্জের মায়াবী পরিবেশে। পরবর্তীতে বেড়ে ওঠা এবং বিদ্যার্জনের পাঠ চুকিয়েছি নোয়াখালীর ব্যস্ত জনপদে। স্বভাবে আমি কিছুটা ভবঘুরে, আর খানিকটা হেয়ালি। ধরাবাঁধা জীবনের ছক কষতে আমার ভালো লাগে না; বরং অজানাকে জানার, অচেনাকে চেনার নেশায় আমি খুঁজে ফিরি জীবনের ভিন্ন অর্থ। আমার লেখায় উঠে আসে এই ভবঘুরে জীবনের গল্প, প্রকৃতির প্রেম আর মানুষের মনের অব্যক্ত কথা।",
  aboutLocation1: "কিশোরগঞ্জ",
  aboutLocation2: "নোয়াখালী",
  aboutTrait: "ভবঘুরে"
};

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  
  // Initialize from localStorage immediately to prevent flash of default content
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saadwrites_site_config');
      if (saved) {
        try {
          return { ...INITIAL_CONFIG, ...JSON.parse(saved) };
        } catch (e) {
          return INITIAL_CONFIG;
        }
      }
    }
    return INITIAL_CONFIG;
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

  // Helper to show toast
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const seedArticles = async () => {
    console.log("Auto-posting articles...");
    try {
      const promises = DEMO_ARTICLES.map(article => saveArticleToFirebase(article));
      await Promise.all(promises);
      addToast('নতুন লেখা পোস্ট হয়েছে', 'success');
    } catch (error) {
      console.error("Auto-post failed", error);
    }
  };

  // Firebase Subscriptions
  useEffect(() => {
    // Auth Subscription
    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });

    // Config Subscription
    const unsubscribeConfig = subscribeToConfig((config) => {
      setSiteConfig(config);
    });

    // Articles Subscription
    const unsubscribeArticles = subscribeToArticles((fetchedArticles) => {
      setArticles(fetchedArticles);
      setIsLoadingArticles(false);

      // Check if we need to seed any missing demo articles
      // CRITICAL FIX: Only seed if the user hasn't explicitly deleted it before
      const missingDemos = DEMO_ARTICLES.filter(demo => {
        const isDeleted = localStorage.getItem(`saadwrites_deleted_${demo.id}`);
        const exists = fetchedArticles.some(existing => existing.id === demo.id);
        return !exists && !isDeleted;
      });

      if (missingDemos.length > 0) {
        console.log(`Seeding ${missingDemos.length} missing demo articles...`);
        missingDemos.forEach(async (article) => {
           await saveArticleToFirebase(article);
        });
        if (missingDemos.length === DEMO_ARTICLES.length) {
           addToast('স্বাগতম! ডেমো লেখা পোস্ট হয়েছে', 'success');
        } else {
           // Silently add individual missing ones to avoid spamming toasts on reload
           // addToast('নতুন লেখা যুক্ত হয়েছে', 'success');
        }
      }

      // Data Migration Logic (One time)
      const localData = localStorage.getItem('lekhoni_articles');
      if (localData && fetchedArticles.length === 0) {
        try {
          const parsed = JSON.parse(localData) as Article[];
          if (parsed.length > 0) {
            parsed.forEach(async (article) => {
              await saveArticleToFirebase({
                ...article,
                status: article.status || 'published',
                views: article.views || 0
              });
            });
            localStorage.removeItem('lekhoni_articles');
          }
        } catch (e) {
          console.error("Migration failed", e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeArticles();
      unsubscribeConfig();
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

  // Persist total visits locally
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

  const handleUpdateConfig = async (updates: Partial<SiteConfig>) => {
    if (!isAdmin) return;
    const newConfig = { ...siteConfig, ...updates };
    setSiteConfig(newConfig); // Optimistic update
    try {
      await saveSiteConfig(newConfig);
      addToast('আপডেট সেভ হয়েছে', 'success');
    } catch (e) {
      addToast('সেভ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleLogin = (user: User) => {
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
        views: articleData.views || 0
      });
      
      setEditingArticle(null);
      addToast('লেখা ক্লাউডে সেভ হয়েছে', 'success');
      
      // Clear drafts
      localStorage.removeItem('saadwrites_draft_content');
      localStorage.removeItem('saadwrites_draft_title');
      if (articleData.id) {
        localStorage.removeItem(`saadwrites_edit_draft_${articleData.id}`);
      }

      setView(ViewState.HOME);
    } catch (e) {
      console.error(e);
      addToast('সেভ করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleSelectArticle = async (article: Article) => {
    const newViews = (article.views || 0) + 1;
    setTotalVisits(prev => prev + 1);
    
    saveArticleToFirebase({ ...article, views: newViews }).catch(e => console.error(e));
    
    setActiveArticle({ ...article, views: newViews });
    setView(ViewState.READER);
    window.scrollTo(0,0);
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleFromFirebase(articleId);
      
      // CRITICAL FIX: Mark as deleted in localStorage so auto-seeder ignores it
      localStorage.setItem(`saadwrites_deleted_${articleId}`, 'true');
      
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
      return <div className="flex h-screen items-center justify-center text-gold font-kalpurush text-xl animate-pulse">লোড হচ্ছে...</div>;
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
        return (
          <Contact 
            config={siteConfig}
            updateConfig={handleUpdateConfig}
            isAdmin={isAdmin}
          />
        );
      case ViewState.ABOUT:
        return (
          <About 
            config={siteConfig}
            updateConfig={handleUpdateConfig}
            isAdmin={isAdmin}
          />
        );
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
            config={siteConfig}
            updateConfig={handleUpdateConfig}
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
      onLoadDemoData={seedArticles}
      totalVisits={totalVisits}
      toasts={toasts}
      removeToast={removeToast}
      isAdmin={isAdmin}
      toggleAdmin={toggleAdmin}
      user={currentUser}
      onLogout={handleLogout}
      config={siteConfig}
      updateConfig={handleUpdateConfig}
    >
      {renderContent()}
    </Layout>
  );
}
