import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
    phone: '',
  });
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const q = query(collection(db, 'restaurants'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setRestaurant({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error) {
      setError('خطأ في تسجيل الدخول: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Create restaurant document
      await addDoc(collection(db, 'restaurants'), {
        userId: userCredential.user.uid,
        name: formData.restaurantName,
        email: formData.email,
        phone: formData.phone,
        location: '',
        logoUrl: '',
        paymentMethods: ['cash'],
        isOnline: false,
      });

    } catch (error) {
      setError('خطأ في التسجيل: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFormData({ email: '', password: '', restaurantName: '', phone: '' });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">تسجيل الدخول</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@restaurant.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            ليس لديك حساب؟{' '}
            <button 
              onClick={() => setCurrentPage('register')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Register Page
  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">إنشاء حساب جديد</h1>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المطعم</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleInputChange}
                placeholder="مطعمي"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@restaurant.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+249123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'جاري التحميل...' : 'إنشاء حساب'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            هل لديك حساب بالفعل؟{' '}
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">متصل</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurant ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Restaurant Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات المطعم</h2>
              <p className="text-gray-600">
                <strong>الاسم:</strong> {restaurant.name}
              </p>
              <p className="text-gray-600">
                <strong>الهاتف:</strong> {restaurant.phone}
              </p>
              <p className="text-gray-600">
                <strong>البريد:</strong> {restaurant.email}
              </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الملف الشخصي</h2>
              <button
                onClick={() => setCurrentPage('profile')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                تعديل الملف الشخصي
              </button>
            </div>

            {/* Menu Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">المنيو</h2>
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                إدارة المنيو
              </button>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الطلبات</h2>
              <button
                onClick={() => setCurrentPage('orders')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                عرض الطلبات
              </button>
            </div>

            {/* Analytics Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">التحليلات</h2>
              <button
                onClick={() => setCurrentPage('analytics')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              >
                عرض التقارير
              </button>
            </div>

            {/* Coming Soon Cards */}
            <div className="bg-white rounded-lg shadow p-6 opacity-75">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">قريباً</h2>
              <p className="text-gray-500 text-sm">المزيد من الميزات قادمة...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">لم يتم العثور على بيانات المطعم</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الإجراءات السريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 px-4 rounded-lg transition">
              إضافة وجبة جديدة
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-3 px-4 rounded-lg transition">
              عرض الطلبات الجديدة
            </button>
            <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-3 px-4 rounded-lg transition">
              تحديث الأسعار
            </button>
            <button className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold py-3 px-4 rounded-lg transition">
              عرض التقارير
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;