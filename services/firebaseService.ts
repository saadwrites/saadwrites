
import { auth, db, isFirebaseConfigured } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Article, User } from '../types';

// --- LocalStorage Helpers for Fallback Mode ---
const STORAGE_KEY_ARTICLES = 'saadwrites_articles';
const STORAGE_KEY_USER = 'saadwrites_user';

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
  const articles = getLocalArticles().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  notifySubscribers();
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
    // Trigger a reload or state update logic if needed, but the auth subscription handles it
    // We simulate the auth callback for the mock user
    setTimeout(() => {
        // Since we can't easily trigger the auth subscription externally in mock mode without complex eventing,
        // we rely on the App component checking localStorage or the return value here.
    }, 100);
    return mockUser;
  }
};

export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
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
    
    // Listen for storage events (e.g. logging out in another tab)
    window.addEventListener('storage', checkLocalAuth);
    return () => window.removeEventListener('storage', checkLocalAuth);
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
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      callback(articles);
    }, (error) => {
       console.error("Firestore subscription error:", error);
       // Fallback to local if permission denied or other error
       console.log("Falling back to local storage due to Firestore error");
       callback(getLocalArticles());
    });
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
    } catch (error) {
        console.error("Firestore delete error, falling back to local:", error);
        deleteLocalArticle(id);
    }
  } else {
    deleteLocalArticle(id);
  }
};
