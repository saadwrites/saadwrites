
import { auth, db, isFirebaseConfigured } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, getDoc, addDoc, getDocs } from "firebase/firestore";
import { Article, User, SiteConfig, ContactMessage } from '../types';

// --- LocalStorage Helpers for Fallback Mode ---
const STORAGE_KEY_ARTICLES = 'saadwrites_articles';
const STORAGE_KEY_USER = 'saadwrites_user';
const STORAGE_KEY_CONFIG = 'saadwrites_site_config';
const STORAGE_KEY_SUBSCRIBERS = 'saadwrites_subscribers';
const STORAGE_KEY_MESSAGES = 'saadwrites_contact_messages';

const DEFAULT_CONFIG: SiteConfig = {
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
  aboutTrait: "ভবঘুরে",
  aboutWebsite: "https://about.me/abdullah-saad"
};

// Simple event system for local updates
const subscribers: ((articles: Article[]) => void)[] = [];
const notifySubscribers = () => {
  const articles = getLocalArticles();
  subscribers.forEach(cb => cb(articles));
};

const getLocalArticles = (): Article[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ARTICLES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalArticle = (article: Article) => {
  const articles = getLocalArticles();
  const index = articles.findIndex(a => a.id === article.id);
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.unshift(article); // Add new at top
  }
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  notifySubscribers();
};

const deleteLocalArticle = (id: string) => {
  console.log("Deleting article locally:", id);
  const articles = getLocalArticles().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  notifySubscribers();
};

// --- Config Operations ---

export const saveSiteConfig = async (config: SiteConfig) => {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "settings", "general"), config, { merge: true });
    } catch (error) {
      console.warn("Config save failed (Network/Auth), fallback local", error);
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }
  } else {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
};

export const subscribeToConfig = (callback: (config: SiteConfig) => void) => {
  const loadLocal = () => {
     const local = localStorage.getItem(STORAGE_KEY_CONFIG);
     callback(local ? JSON.parse(local) : DEFAULT_CONFIG);
  };

  if (isFirebaseConfigured && db) {
    try {
       return onSnapshot(doc(db, "settings", "general"), (doc) => {
         if (doc.exists()) {
           callback({ ...DEFAULT_CONFIG, ...doc.data() as SiteConfig });
         } else {
           callback(DEFAULT_CONFIG);
         }
       }, (err) => {
         console.warn("Firestore config sync failed, using local.");
         loadLocal();
       });
    } catch (e) {
      loadLocal();
      return () => {};
    }
  } else {
    loadLocal();
    return () => {};
  }
};

// --- Newsletter Operations ---

export const subscribeToNewsletter = async (email: string) => {
  const subData = { email, subscribedAt: Date.now() };
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "newsletter_subscribers"), subData);
    } catch (error) {
      console.warn("Newsletter save failed, fallback local", error);
      saveLocalSubscriber(subData);
    }
  } else {
    saveLocalSubscriber(subData);
  }
};

const saveLocalSubscriber = (sub: { email: string, subscribedAt: number }) => {
  const subs = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIBERS) || '[]');
  subs.push(sub);
  localStorage.setItem(STORAGE_KEY_SUBSCRIBERS, JSON.stringify(subs));
};

export const getSubscribers = async () => {
  const getLocal = () => JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIBERS) || '[]');

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "newsletter_subscribers"), orderBy("subscribedAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as { email: string, subscribedAt: number });
    } catch (e) {
      return getLocal();
    }
  } else {
    return getLocal();
  }
};

// --- Contact Message Operations ---

export const sendContactMessage = async (message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
  const msgData: ContactMessage = {
    ...message,
    id: Date.now().toString(),
    createdAt: Date.now(),
    read: false
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "contact_messages"), msgData);
    } catch (error) {
      saveLocalMessage(msgData);
    }
  } else {
    saveLocalMessage(msgData);
  }
};

const saveLocalMessage = (msg: ContactMessage) => {
  const msgs = JSON.parse(localStorage.getItem(STORAGE_KEY_MESSAGES) || '[]');
  msgs.unshift(msg);
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const getLocal = () => JSON.parse(localStorage.getItem(STORAGE_KEY_MESSAGES) || '[]');

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
    } catch (e) {
      return getLocal();
    }
  } else {
    return getLocal();
  }
};

// --- Auth Operations ---

export const loginWithGoogle = async (): Promise<User> => {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return mapFirebaseUserToUser(result.user);
    } catch (error) {
      console.error("Firebase Login failed", error);
      throw error;
    }
  } else {
    // Mock Login for Offline Mode
    const mockUser: User = {
      id: 'mock-user-123',
      name: 'Demo Writer',
      email: 'writer@demo.com',
      avatar: 'https://ui-avatars.com/api/?name=Demo+Writer&background=b45309&color=fff',
      provider: 'google'
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Notify
    window.dispatchEvent(new Event('storage'));
    
    return mockUser;
  }
};

export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
    window.dispatchEvent(new Event('storage'));
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUserToUser(user) : null);
    });
  } else {
    // Check local storage for mock user
    const checkLocalAuth = () => {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        callback(JSON.parse(stored));
      } else {
        callback(null);
      }
    };
    checkLocalAuth();
    
    const handler = () => checkLocalAuth();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
};

const mapFirebaseUserToUser = (user: FirebaseUser): User => ({
  id: user.uid,
  name: user.displayName || 'Unknown User',
  email: user.email || '',
  avatar: user.photoURL || '',
  provider: 'google'
});

// --- Article Operations ---

export const subscribeToArticles = (callback: (articles: Article[]) => void) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        callback(articles);
      }, (error) => {
         console.warn("Firestore access failed. Switching to offline mode.");
         subscribers.push(callback);
         callback(getLocalArticles());
      });
    } catch (e) {
      console.warn("Firestore init failed. Switching to offline mode.");
      subscribers.push(callback);
      callback(getLocalArticles());
      return () => {};
    }
  } else {
    // Offline/Mock Mode
    subscribers.push(callback);
    callback(getLocalArticles());
    return () => {
      const idx = subscribers.indexOf(callback);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  }
};

export const saveArticleToFirebase = async (article: Article) => {
  if (isFirebaseConfigured && db) {
    try {
        const docRef = doc(db, "articles", article.id);
        await setDoc(docRef, article, { merge: true });
    } catch (error) {
        console.error("Firestore save error, falling back to local:", error);
        saveLocalArticle(article);
    }
  } else {
    saveLocalArticle(article);
  }
};

export const deleteArticleFromFirebase = async (id: string) => {
  if (isFirebaseConfigured && db) {
    try {
        await deleteDoc(doc(db, "articles", id));
        // Also ensure local is clean in case of hybrid states
        deleteLocalArticle(id); 
    } catch (error) {
        console.error("Firestore delete error, falling back to local:", error);
        deleteLocalArticle(id);
    }
  } else {
    deleteLocalArticle(id);
  }
};
