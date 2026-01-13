import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

export default function MenuManagement({ onBack }) {
  const [meals, setMeals] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRestaurantAndMeals();
  }, []);

  const loadRestaurantAndMeals = async () => {
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
          
          // Load meals
          const mealsQuery = query(collection(db, 'meals'), where('restaurantId', '==', restaurantData.id));
          const mealsSnapshot = await getDocs(mealsQuery);
          const mealsData = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMeals(mealsData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned');
    formData.append('folder', 'sudanese-restaurant/meals');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/ml_default/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant) return;

    setUploading(true);
    try {
      let imageUrl = editingMeal?.imageUrl || '';
      
      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      const mealData = {
        restaurantId: restaurant.id,
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        imageUrl,
        available: editingMeal?.available ?? true,
        updatedAt: serverTimestamp(),
      };

      if (editingMeal) {
        await updateDoc(doc(db, 'meals', editingMeal.id), mealData);
      } else {
        await addDoc(collection(db, 'meals'), {
          ...mealData,
          createdAt: serverTimestamp(),
        });
      }

      // Reset form
      setFormData({ name: '', price: '', description: '', image: null });
      setImagePreview(null);
      setEditingMeal(null);
      setShowAddForm(false);
      
      // Reload meals
      await loadRestaurantAndMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('خطأ في حفظ الوجبة');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      price: meal.price.toString(),
      description: meal.description || '',
      image: null,
    });
    setImagePreview(meal.imageUrl);
    setShowAddForm(true);
  };

  const handleDelete = async (mealId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
      try {
        await deleteDoc(doc(db, 'meals', mealId));
        await loadRestaurantAndMeals();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('خطأ في حذف الوجبة');
      }
    }
  };

  const toggleAvailability = async (meal) => {
    try {
      await updateDoc(doc(db, 'meals', meal.id), {
        available: !meal.available,
        updatedAt: serverTimestamp(),
      });
      await loadRestaurantAndMeals();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const optimizeImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_400,c_fill,f_auto,q_auto/');
    }
    return url;
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
                <h1 className="text-2xl font-bold text-white">إدارة المنيو</h1>
                <p className="text-purple-200">إضافة وتعديل وجبات المطعم</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingMeal(null);
                setFormData({ name: '', price: '', description: '', image: null });
                setImagePreview(null);
              }}
              className="bg-white text-purple-800 font-semibold py-2 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة وجبة جديدة
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingMeal ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">اسم الوجبة</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="مثال: فول سوداني"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">السعر (جنيه سوداني)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">الوصف</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="وصف مختصر للوجبة"
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">صورة الوجبة</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all duration-200"
                    />
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="معاينة"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                          جاري الحفظ...
                        </div>
                      ) : (
                        editingMeal ? 'تحديث الوجبة' : 'إضافة الوجبة'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Meal Card */}
          <div
            onClick={() => {
              setShowAddForm(true);
              setEditingMeal(null);
              setFormData({ name: '', price: '', description: '', image: null });
              setImagePreview(null);
            }}
            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all duration-300 cursor-pointer group min-h-[320px] flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-purple-100 group-hover:bg-purple-200 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">إضافة وجبة جديدة</h3>
            <p className="text-gray-500 text-sm mt-2">انقر لإضافة وجبة إلى المنيو</p>
          </div>

          {/* Meal Cards */}
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105"
            >
              {/* Image Section */}
              <div className="relative aspect-video overflow-hidden">
                {meal.imageUrl ? (
                  <img
                    src={optimizeImageUrl(meal.imageUrl)}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg">
                  <span className="text-lg font-bold text-gray-900">{meal.price}</span>
                  <span className="text-sm text-gray-600 mr-1">ج.س</span>
                </div>

                {/* Availability Toggle */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => toggleAvailability(meal)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      meal.available
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {meal.available ? 'متوفر' : 'غير متوفر'}
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-2">{meal.name}</h3>
                {meal.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{meal.description}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meal)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {meals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد وجبات في المنيو</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة وجبات جديدة لمطعمك</p>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingMeal(null);
                setFormData({ name: '', price: '', description: '', image: null });
                setImagePreview(null);
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200"
            >
              إضافة أول وجبة
            </button>
          </div>
        )}
      </main>
    </div>
  );
}