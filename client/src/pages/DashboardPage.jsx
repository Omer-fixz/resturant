import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import { firestoreService } from '../services/firestoreService';

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          const restaurants = await firestoreService.queryDocuments('restaurants', 'userId', '==', user.uid);
          if (restaurants.length > 0) {
            setRestaurant(restaurants[0]);
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المطعم:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, []);

  useEffect(() => {
    // الاتصال بـ Socket.io
    socketService.connect();

    if (restaurant) {
      socketService.emit('restaurant-online', restaurant.id);
      setIsOnline(true);
    }

    return () => {
      socketService.disconnect();
    };
  }, [restaurant]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <div className="flex items-center gap-4">
            {/* حالة الاتصال */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{isOnline ? 'متصل' : 'غير متصل'}</span>
            </div>
            {/* زر تسجيل الخروج */}
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
            {/* بطاقة المعلومات */}
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

            {/* بطاقة الملف الشخصي */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الملف الشخصي</h2>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                تعديل الملف الشخصي
              </button>
            </div>

            {/* بطاقة المنيو */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">المنيو</h2>
              <button
                onClick={() => navigate('/menu')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                إدارة المنيو
              </button>
            </div>

            {/* بطاقة الطلبات */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">الطلبات</h2>
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                عرض الطلبات
              </button>
            </div>

            {/* بطاقة التحليلات */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">التحليلات</h2>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              >
                عرض التقارير
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">لم يتم العثور على بيانات المطعم</p>
          </div>
        )}
      </main>
    </div>
  );
}
