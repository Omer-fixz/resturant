const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp 
} = require('firebase/firestore');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// إعداد Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد Multer لتخزين الملفات مؤقتاً
const upload = multer({ storage: multer.memoryStorage() });

// API لرفع الصورة وحفظ الوجبة
app.post('/api/meals', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;

    // التحقق من البيانات
    if (!name || !price || !req.file) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // رفع الصورة إلى Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sudanese-restaurant/meals',
        resource_type: 'auto',
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'فشل رفع الصورة' });
        }

        try {
          // حفظ الوجبة في Firestore
          const mealsCollection = collection(db, 'meals');
          const mealRef = await addDoc(mealsCollection, {
            name,
            price: parseFloat(price),
            imageUrl: result.secure_url,
            createdAt: serverTimestamp(),
          });

          res.json({
            success: true,
            mealId: mealRef.id,
            imageUrl: result.secure_url,
          });
        } catch (firestoreError) {
          console.error('خطأ Firestore:', firestoreError);
          res.status(500).json({ error: 'فشل حفظ الوجبة' });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('خطأ في الخادم:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// API للحصول على المنيو
app.get('/api/menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const mealsQuery = query(collection(db, 'meals'), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(mealsQuery);
    
    const meals = [];
    querySnapshot.forEach((doc) => {
      meals.push({ id: doc.id, ...doc.data() });
    });

    res.json(meals);
  } catch (error) {
    console.error('خطأ في الحصول على المنيو:', error);
    res.status(500).json({ error: 'فشل في الحصول على المنيو' });
  }
});

// API لإضافة وجبة جديدة
app.post('/api/menu/meal', upload.single('image'), async (req, res) => {
  try {
    const { restaurantId, name, price, description } = req.body;

    if (!restaurantId || !name || !price) {
      return res.status(400).json({ error: 'الحقول المطلوبة مفقودة' });
    }

    let imageUrl = '';
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'sudanese-restaurant/meals' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const mealRef = await addDoc(collection(db, 'meals'), {
      restaurantId,
      name,
      price: parseFloat(price),
      description: description || '',
      imageUrl,
      available: true,
      createdAt: serverTimestamp(),
    });

    res.json({ success: true, mealId: mealRef.id });
  } catch (error) {
    console.error('خطأ في إضافة الوجبة:', error);
    res.status(500).json({ error: 'فشل في إضافة الوجبة' });
  }
});

// API لتعديل وجبة
app.put('/api/menu/meal/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    const updateData = {
      name,
      price: parseFloat(price),
      description: description || '',
      updatedAt: serverTimestamp(),
    };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'sudanese-restaurant/meals' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      updateData.imageUrl = uploadResult.secure_url;
    }

    await updateDoc(doc(db, 'meals', id), updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('خطأ في تعديل الوجبة:', error);
    res.status(500).json({ error: 'فشل في تعديل الوجبة' });
  }
});

// API لحذف وجبة
app.delete('/api/menu/meal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, 'meals', id));
    res.json({ success: true });
  } catch (error) {
    console.error('خطأ في حذف الوجبة:', error);
    res.status(500).json({ error: 'فشل في حذف الوجبة' });
  }
});

// API لتفعيل/تعطيل وجبة
app.patch('/api/menu/meal/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    await updateDoc(doc(db, 'meals', id), {
      available: Boolean(available),
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث حالة الوجبة:', error);
    res.status(500).json({ error: 'فشل في تحديث حالة الوجبة' });
  }
});

// API لتحديث الأسعار بالجملة
app.post('/api/menu/bulk-price-update', async (req, res) => {
  try {
    const { restaurantId, percentage } = req.body;

    if (!restaurantId || percentage === undefined) {
      return res.status(400).json({ error: 'معرف المطعم والنسبة مطلوبان' });
    }

    const mealsQuery = query(collection(db, 'meals'), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(mealsQuery);

    const updatePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      const meal = docSnapshot.data();
      const newPrice = meal.price * (1 + percentage / 100);
      updatePromises.push(
        updateDoc(doc(db, 'meals', docSnapshot.id), {
          price: Math.round(newPrice * 100) / 100, // تقريب إلى منزلتين عشريتين
          updatedAt: serverTimestamp(),
        })
      );
    });

    await Promise.all(updatePromises);
    res.json({ success: true, updatedCount: updatePromises.length });
  } catch (error) {
    console.error('خطأ في تحديث الأسعار:', error);
    res.status(500).json({ error: 'فشل في تحديث الأسعار' });
  }
});

// API للملف الشخصي للمطعم
app.get('/api/restaurant/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const restaurantsQuery = query(collection(db, 'restaurants'), where('userId', '==', userId));
    const querySnapshot = await getDocs(restaurantsQuery);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'المطعم غير موجود' });
    }

    const restaurant = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    res.json(restaurant);
  } catch (error) {
    console.error('خطأ في الحصول على الملف الشخصي:', error);
    res.status(500).json({ error: 'فشل في الحصول على الملف الشخصي' });
  }
});

// API لتحديث الملف الشخصي
app.put('/api/restaurant/profile/:id', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, location, paymentMethods } = req.body;

    const updateData = {
      name,
      phone,
      location: location || '',
      paymentMethods: JSON.parse(paymentMethods || '["cash"]'),
      updatedAt: serverTimestamp(),
    };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'sudanese-restaurant/logos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      updateData.logoUrl = uploadResult.secure_url;
    }

    await updateDoc(doc(db, 'restaurants', id), updateData);
    res.json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    res.status(500).json({ error: 'فشل في تحديث الملف الشخصي' });
  }
});

// API للطلبات
app.post('/api/orders', async (req, res) => {
  try {
    const { restaurantId, customerId, items, totalPrice, paymentMethod } = req.body;

    if (!restaurantId || !items || !totalPrice) {
      return res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
    }

    const orderRef = await addDoc(collection(db, 'orders'), {
      restaurantId,
      customerId: customerId || 'anonymous',
      items,
      totalPrice: parseFloat(totalPrice),
      paymentMethod: paymentMethod || 'cash',
      status: 'Pending',
      createdAt: serverTimestamp(),
    });

    const order = {
      id: orderRef.id,
      restaurantId,
      customerId: customerId || 'anonymous',
      items,
      totalPrice: parseFloat(totalPrice),
      paymentMethod: paymentMethod || 'cash',
      status: 'Pending',
    };

    // إرسال تنبيه عبر Socket.io
    io.to(`restaurant-${restaurantId}`).emit('new-order', order);

    res.json({ success: true, orderId: orderRef.id });
  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    res.status(500).json({ error: 'فشل في إنشاء الطلب' });
  }
});

// API لتحديث حالة الطلب
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, restaurantId } = req.body;

    const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'حالة الطلب غير صحيحة' });
    }

    await updateDoc(doc(db, 'orders', id), {
      status,
      updatedAt: serverTimestamp(),
    });

    // إرسال تحديث عبر Socket.io
    io.to(`restaurant-${restaurantId}`).emit('order-status-updated', { orderId: id, status });

    res.json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث حالة الطلب:', error);
    res.status(500).json({ error: 'فشل في تحديث حالة الطلب' });
  }
});

// API للحصول على طلبات المطعم
app.get('/api/orders/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const ordersQuery = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(ordersQuery);

    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // ترتيب الطلبات حسب التاريخ (الأحدث أولاً)
    orders.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });

    res.json(orders);
  } catch (error) {
    console.error('خطأ في الحصول على الطلبات:', error);
    res.status(500).json({ error: 'فشل في الحصول على الطلبات' });
  }
});

const PORT = process.env.PORT || 5000;

// إعداد Socket.io
io.on('connection', (socket) => {
  console.log('عميل جديد متصل:', socket.id);

  socket.on('disconnect', () => {
    console.log('عميل قطع الاتصال:', socket.id);
  });

  socket.on('restaurant-online', (restaurantId) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`المطعم ${restaurantId} متصل`);
  });

  socket.on('new-order', (order) => {
    io.to(`restaurant-${order.restaurantId}`).emit('order-received', order);
  });

  socket.on('order-status-update', (data) => {
    io.to(`restaurant-${data.restaurantId}`).emit('status-updated', data);
  });
});

server.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
