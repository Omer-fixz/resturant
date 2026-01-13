import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

export const authService = {
  // تسجيل حساب جديد
  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // تسجيل الدخول
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // تسجيل الخروج
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // الاستماع لتغييرات حالة المصادقة
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: () => {
    return auth.currentUser;
  },
};
