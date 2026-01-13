import React, { useState, useEffect } from 'react';
import { collection, updateDoc, doc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

export default function OrdersManagement({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, preparing, ready
  const [playNotification, setPlayNotification] = useState(false);

  useEffect(() => {
    loadRestaurantAndOrders();
    // Set up real-time updates (simplified version)
    const interval = setInterval(loadRestaurantAndOrders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRestaurantAndOrders = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // Load restaurant
        const restaurantsQuery = query(collection(db, 'restaurants'), where('userId', '==', user.uid));
        const restaurantSnapshot = await getDocs(restaurantsQuery);
        
        if (!restaurantSnapshot.empty) {
          const restaurantData = { id: restaurantSnapshot.docs[0].id, ...restaurantSnapshot.docs[0].data() };
          setRestaurant(restaurantData);
          
          // Load orders
          const ordersQuery = query(
            collection(db, 'orders'), 
            where('restaurantId', '==', restaurantData.id),
            orderBy('createdAt', 'desc')
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Check for new orders
          const newOrders = ordersData.filter(order => 
            order.status === 'Pending' && !orders.find(existingOrder => existingOrder.id === order.id)
          );
          
          if (newOrders.length > 0 && orders.length > 0) {
            setPlayNotification(true);
            setTimeout(() => setPlayNotification(false), 3000);
          }
          
          setOrders(ordersData);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      await loadRestaurantAndOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'في الانتظار';
      case 'Accepted': return 'مقبول';
      case 'Preparing': return 'قيد التحضير';
      case 'Ready': return 'جاهز';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'Accepted';
      case 'Accepted': return 'Preparing';
      case 'Preparing': return 'Ready';
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 'قبول الطلب';
      case 'Accepted': return 'بدء التحضير';
      case 'Preparing': return 'الطلب جاهز';
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Sound Effect */}
      {playNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          🔔 طلب جديد وصل!
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-2 rounded-xl transition-all duration-200 ml-4"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">إدارة الطلبات</h1>
                <p className="text-purple-200">متابعة وإدارة طلبات العملاء</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-10 rounded-xl px-4 py-2">
                <span className="text-white font-semibold">{filteredOrders.length} طلب</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'جميع الطلبات', count: orders.length },
              { key: 'pending', label: 'في الانتظار', count: orders.filter(o => o.status === 'Pending').length },
              { key: 'accepted', label: 'مقبولة', count: orders.filter(o => o.status === 'Accepted').length },
              { key: 'preparing', label: 'قيد التحضير', count: orders.filter(o => o.status === 'Preparing').length },
              { key: 'ready', label: 'جاهزة', count: orders.filter(o => o.status === 'Ready').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">طلب #{order.id.slice(-6)}</h3>
                      <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">تفاصيل الطلب:</h4>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900">{item.name || `وجبة ${index + 1}`}</span>
                        <span className="text-gray-500 text-sm mr-2">× {item.quantity || 1}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{item.price || 0} ج.س</span>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-sm">لا توجد تفاصيل للطلب</div>
                  )}
                </div>

                {/* Total Price */}
                <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4">
                  <span className="font-bold text-lg text-gray-900">المجموع:</span>
                  <span className="font-bold text-xl text-purple-600">{order.totalPrice || 0} ج.س</span>
                </div>

                {/* Payment Method */}
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    طريقة الدفع: {order.paymentMethod === 'cash' ? 'نقداً' : 'بنكك'}
                  </span>
                </div>

                {/* Action Button */}
                {getNextStatus(order.status) && (
                  <button
                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {getNextStatusText(order.status)}
                  </button>
                )}

                {order.status === 'Ready' && (
                  <div className="w-full bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-xl text-center">
                    ✅ الطلب جاهز للاستلام
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'لا توجد طلبات' : `لا توجد طلبات ${getStatusText(filter)}`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'ستظهر الطلبات الجديدة هنا عند وصولها' 
                : 'جرب تغيير الفلتر لعرض طلبات أخرى'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}