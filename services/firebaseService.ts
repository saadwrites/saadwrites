import { auth, db } from '../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Article, User } from '../types';

// Auth Operations
export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return mapFirebaseUserToUser(user);
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUserToUser(user) : null);
  });
};

const mapFirebaseUserToUser = (user: FirebaseUser): User => ({
  id: user.uid,
  name: user.displayName || 'Unknown User',
  email: user.email || '',
  avatar: user.photoURL || '',
  provider: 'google'
});

// Firestore Operations for Articles
export const subscribeToArticles = (callback: (articles: Article[]) => void) => {
  const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    callback(articles);
  });
};

export const saveArticleToFirebase = async (article: Article) => {
  const docRef = doc(db, "articles", article.id);
  // Ensure we don't pass undefined values that Firestore dislikes, though simple objects are usually fine.
  // We spread article to ensure it matches the object structure.
  await setDoc(docRef, article, { merge: true });
};

export const deleteArticleFromFirebase = async (id: string) => {
  await deleteDoc(doc(db, "articles", id));
};
