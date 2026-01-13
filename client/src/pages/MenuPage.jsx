import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import { cloudinaryService } from '../services/cloudinaryService';
import { authService } from '../services/authService';

export default function MenuPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
  });
  const [restaurant, setRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurantAndMeals();
  }, []);

  const loadRestaurantAndMeals = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const restaurants = await firestoreService.queryDocuments('restaurants', 'userId', '==', user.uid);
        if (restaurants.length > 0) {
          setRestaurant(restaurants[0]);
          const restaurantMeals = await firestoreService.queryDocuments('meals', 'restaurantId', '==', restaurants[0].id);
          setMeals(restaurantMeals);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      if (formData.image) {
        imageUrl = await cloudinaryService.uploadImage(formData.image, 'sudanese-restaurant/meals');
      }

      if (editingId) {
        await firestoreService.updateDocument('meals', editingId, {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          ...(imageUrl && { imageUrl }),
        });
      } else {
        await firestoreService.addDocument('meals', {
          restaurantId: restaurant.id,
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          imageUrl,
          available: true,
        });
      }

      setFormData({ name: '', price: '', description: '', image: null });
      setEditingId(null);
      setShowForm(false);
      await loadRestaurantAndMeals();
    } catch (error) {
      console.error('خطأ في حفظ الوجبة:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
      try {
        await firestoreService.deleteDocument('meals', mealId);
        await loadRestaurantAndMeals();
      } catch (error) {
        console.error('خطأ في حذف الوجبة:', error);
      }
    }
  };

  const handleToggleAvailability = async (meal) => {
    try {
      await firestoreService.updateDocument('meals', meal.id, {
        available: !meal.available,
      });
      await loadRestaurantAndMeals();
    } catch (error) {
      console.error('خطأ في تحديث الوجبة:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المنيو</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            العودة
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Meal Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', price: '', description: '', image: null });
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            {showForm ? 'إلغاء' : 'إضافة وجبة جديدة'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الوجبة</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="مثال: فول سوداني"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="وصف الوجبة"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
              >
                {loading ? 'جاري الحفظ...' : editingId ? 'تحديث الوجبة' : 'إضافة الوجبة'}
              </button>
            </form>
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {meal.imageUrl && (
                <img src={meal.imageUrl} alt={meal.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{meal.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{meal.description}</p>
                <p className="text-xl font-bold text-blue-600 mb-4">{meal.price} جنيه</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(meal.id);
                      setFormData({
                        name: meal.name,
                        price: meal.price,
                        description: meal.description,
                        image: null,
                      });
                      setShowForm(true);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(meal)}
                    className={`flex-1 font-bold py-2 px-4 rounded text-white ${
                      meal.available ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {meal.available ? 'متاح' : 'غير متاح'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {meals.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">لا توجد وجبات حالياً. أضف وجبة جديدة للبدء.</p>
          </div>
        )}
      </main>
    </div>
  );
}
