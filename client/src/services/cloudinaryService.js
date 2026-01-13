export const cloudinaryService = {
  // رفع صورة إلى Cloudinary
  uploadImage: async (file, folder = 'sudanese-restaurant') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'unsigned');
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // حذف صورة من Cloudinary
  deleteImage: async (publicId) => {
    try {
      // ملاحظة: حذف الصور يتطلب توقيع من الخادم
      // هذه دالة توضيحية فقط
      console.log('حذف الصورة:', publicId);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
