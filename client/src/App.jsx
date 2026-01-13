import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import MenuManagement from './pages/MenuManagement';
import OrdersManagement from './pages/OrdersManagement';
import './App.css';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDboo494XXXC8gF6iYsvVuS5xlu20Ho4kc",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "fixz123.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "fixz123",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "fixz123.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "326873831326",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:326873831326:web:21cbb8e10603fd2070288f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurantName: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ 
        ...prev, 
        email: rememberedEmail, 
        rememberMe: true 
      }));
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      if (user) {
        try {
          console.log('Loading restaurant for user:', user.uid);
          const q = query(collection(db, 'restaurants'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const restaurantData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            console.log('Restaurant loaded:', restaurantData);
            setRestaurant(restaurantData);
          } else {
            console.log('No restaurant found for user');
          }
          setCurrentPage('dashboard');
        } catch (error) {
          console.error('Error loading restaurant:', error);
        }
      } else {
        setCurrentPage('login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Save email if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'خطأ في تسجيل الدخول: ';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage += 'المستخدم غير موجود';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage += 'كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage += 'محاولات كثيرة جداً، حاول مرة أخرى لاحقاً';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    if (!formData.restaurantName.trim()) {
      setError('يرجى إدخال اسم المطعم');
      return;
    }
    
    setLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Create restaurant document immediately after user creation
      const restaurantData = {
        userId: user.uid,
        name: formData.restaurantName.trim(),
        email: formData.email,
        location: '',
        logoUrl: '',
        paymentMethods: ['cash'],
        isOnline: false,
        createdAt: serverTimestamp(),
      };
      
      const restaurantRef = await addDoc(collection(db, 'restaurants'), restaurantData);
      
      // Set the restaurant data in state
      setRestaurant({ id: restaurantRef.id, ...restaurantData });
      
      console.log('Restaurant created successfully:', restaurantRef.id);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        restaurantName: '',
        rememberMe: false,
      });

    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'خطأ في التسجيل: ';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage += 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/weak-password') {
        errorMessage += 'كلمة المرور ضعيفة جداً';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'permission-denied') {
        errorMessage += 'ليس لديك صلاحية للوصول إلى قاعدة البيانات. يرجى التحقق من إعدادات Firebase';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setError('');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'خطأ في إرسال رابط إعادة التعيين: ';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage += 'البريد الإلكتروني غير مسجل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage += 'البريد الإلكتروني غير صحيح';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFormData({ email: '', password: '', restaurantName: '' });
      setRestaurant(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Geometric Shape */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100 to-purple-50 rounded-full transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-50 to-transparent rounded-full transform -translate-x-32 translate-y-32"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك</h1>
              <p className="text-gray-600">سجل دخولك لإدارة مطعمك</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@restaurant.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="mr-2 text-sm font-medium text-gray-700">
                  تذكرني
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري التحميل...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              {resetEmailSent ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                  <p className="text-sm text-green-700">
                    تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors duration-200"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                ليس لديك حساب؟{' '}
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register Page
  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Geometric Shapes */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full transform -translate-x-40 -translate-y-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-50 to-transparent rounded-full transform translate-x-48 translate-y-48"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
              <p className="text-gray-600">ابدأ رحلتك في إدارة مطعمك</p>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">اسم المطعم</label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  placeholder="مطعم الأصالة السودانية"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="owner@restaurant.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  'إنشاء حساب'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                هل لديك حساب بالفعل؟{' '}
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Menu Management Page
  if (currentPage === 'menu') {
    return <MenuManagement onBack={() => setCurrentPage('dashboard')} />;
  }

  // Orders Management Page
  if (currentPage === 'orders') {
    return <OrdersManagement onBack={() => setCurrentPage('dashboard')} />;
  }

  // Demo Page - Show all components
  if (currentPage === 'demo') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-purple-800 mb-6">جميع مكونات التطبيق</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-purple-800 mb-4">الصفحات الرئيسية</h2>
                <ul className="space-y-2">
                  <li>✅ صفحة تسجيل الدخول</li>
                  <li>✅ صفحة التسجيل</li>
                  <li>✅ لوحة التحكم</li>
                  <li>✅ إدارة المنيو</li>
                  <li>✅ إدارة الطلبات</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-green-800 mb-4">المكونات المساعدة</h2>
                <ul className="space-y-2">
                  <li>✅ مكون قوة كلمة المرور</li>
                  <li>✅ حماية الصفحات</li>
                  <li>✅ رفع الصور</li>
                  <li>✅ إشعارات فورية</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-4">الميزات المتقدمة</h2>
                <ul className="space-y-2">
                  <li>✅ تحديث الأسعار بالجملة</li>
                  <li>✅ تفعيل/تعطيل الوجبات</li>
                  <li>✅ تتبع حالة الطلبات</li>
                  <li>✅ إشعارات صوتية</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-orange-800 mb-4">الخدمات المتكاملة</h2>
                <ul className="space-y-2">
                  <li>✅ Firebase Authentication</li>
                  <li>✅ Firestore Database</li>
                  <li>✅ Cloudinary Images</li>
                  <li>✅ Socket.io Real-time</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setCurrentPage('menu')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                تجربة إدارة المنيو
              </button>
              <button
                onClick={() => setCurrentPage('orders')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                تجربة إدارة الطلبات
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navbar */}
      <header className="bg-gradient-to-r from-purple-800 to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
                <p className="text-purple-200 text-sm">{restaurant?.name || 'مطعمي'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 bg-white bg-opacity-10 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white text-sm font-medium">متصل</span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurant || user ? (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">مرحباً بك في {restaurant?.name || 'مطعمك'}</h2>
                  <p className="text-purple-100">إدارة شاملة لمطعمك بكل سهولة</p>
                  {!restaurant && (
                    <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
                      <p className="text-yellow-100 text-sm">
                        ⚠️ تحتاج إلى تحديث قواعد Firestore لحفظ بيانات المطعم بشكل دائم
                      </p>
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Restaurant Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-3">معلومات المطعم</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">الاسم:</span> {restaurant?.name || 'مطعمي'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">البريد:</span> {restaurant?.email || user?.email}
                  </p>
                </div>
              </div>

              {/* Profile Management */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-3">الملف الشخصي</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">تعديل معلومات المطعم والإعدادات</p>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  تعديل الملف
                </button>
              </div>

              {/* Menu Management */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-3">إدارة المنيو</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">إضافة وتعديل وحذف الوجبات</p>
                <button
                  onClick={() => setCurrentPage('menu')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  إدارة المنيو
                </button>
              </div>

              {/* Orders Management */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-3">الطلبات</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">متابعة وإدارة طلبات العملاء</p>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  عرض الطلبات
                </button>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                الإجراءات السريعة
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  إضافة وجبة
                </button>
                
                <button 
                  onClick={() => setCurrentPage('orders')}
                  className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  طلبات جديدة
                </button>
                
                <button className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  تحديث الأسعار
                </button>
                
                <button 
                  onClick={() => setCurrentPage('demo')}
                  className="bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  عرض المكونات
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">لم يتم العثور على بيانات المطعم</p>
            <p className="text-gray-500 text-sm mt-2">يرجى المحاولة مرة أخرى أو الاتصال بالدعم</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
