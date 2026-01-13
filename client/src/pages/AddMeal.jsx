import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './AddMeal.css';

export default function AddMeal() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // معالجة تغيير الحقول النصية
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // معالجة اختيار الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // التحقق من صحة البيانات
  const isFormValid = () => {
    return formData.name.trim() && formData.price && image;
  };

  // معالجة الحفظ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError('يرجى ملء جميع الحقول واختيار صورة');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('image', image);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/meals`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('فشل حفظ الوجبة');
      }

      const result = await response.json();
      setSuccess('تم إضافة الوجبة بنجاح');
      setFormData({ name: '', price: '' });
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message || 'خطأ في الاتصال. تحقق من الإنترنت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-meal-container">
      <div className="add-meal-card">
        <h1>إضافة وجبة جديدة</h1>

        <form onSubmit={handleSubmit}>
          {/* حقل اسم الوجبة */}
          <div className="form-group">
            <label htmlFor="name">اسم الوجبة</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="مثال: فول سوداني"
              disabled={loading}
            />
          </div>

          {/* حقل السعر */}
          <div className="form-group">
            <label htmlFor="price">السعر (جنيه سوداني)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          {/* اختيار الصورة */}
          <div className="form-group">
            <label htmlFor="image">صورة الوجبة</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>

          {/* معاينة الصورة */}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="معاينة الصورة" />
            </div>
          )}

          {/* رسائل الخطأ والنجاح */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className="submit-btn"
          >
            {loading ? (
              <div className="spinner">
                <div className="spinner-circle"></div>
                جاري الحفظ...
              </div>
            ) : (
              'حفظ الوجبة'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
