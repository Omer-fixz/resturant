import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDboo494XXXC8gF6iYsvVuS5xlu20Ho4kc",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fixz123.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "fixz123",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "fixz123.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "326873831326",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:326873831326:web:21cbb8e10603fd2070288f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
