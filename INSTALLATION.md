# تعليمات التثبيت والتشغيل

## المتطلبات

- Node.js (v14 أو أحدث)
- npm أو yarn

## خطوات التثبيت

### 1. تثبيت المكتبات الرئيسية

```bash
# تثبيت مكتبات الخادم
npm install

# تثبيت مكتبات العميل
cd client
npm install
cd ..
```

### 2. إعداد متغيرات البيئة

**للخادم (server/.env):**
```
PORT=5000
CLOUDINARY_CLOUD_NAME=ml_default
CLOUDINARY_API_KEY=924487613446153
CLOUDINARY_API_SECRET=ixqPGfS53czf9sO5-tZqCA2IVUE
REACT_APP_FIREBASE_API_KEY=AIzaSyDboo494XXXC8gF6iYsvVuS5xlu20Ho4kc
REACT_APP_FIREBASE_AUTH_DOMAIN=fixz123.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fixz123
REACT_APP_FIREBASE_STORAGE_BUCKET=fixz123.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=326873831326
REACT_APP_FIREBASE_APP_ID=1:326873831326:web:21cbb8e10603fd2070288f
```

**للعميل (client/.env):**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDboo494XXXC8gF6iYsvVuS5xlu20Ho4kc
REACT_APP_FIREBASE_AUTH_DOMAIN=fixz123.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fixz123
REACT_APP_FIREBASE_STORAGE_BUCKET=fixz123.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=326873831326
REACT_APP_FIREBASE_APP_ID=1:326873831326:web:21cbb8e10603fd2070288f
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_NAME=ml_default
REACT_APP_CLOUDINARY_UPLOAD_PRESET=unsigned
```

### 3. التشغيل

**تشغيل الخادم والعميل معاً:**
```bash
npm run dev
```

**أو تشغيلهما بشكل منفصل:**

في نافذة أولى:
```bash
npm run server
```

في نافذة ثانية:
```bash
npm run client
```

### 4. الوصول إلى التطبيق

- **العميل:** http://localhost:3000
- **الخادم:** http://localhost:5000

## استكشاف الأخطاء

### خطأ: Module not found

إذا واجهت خطأ "Module not found"، جرب:

```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# أو للعميل
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### خطأ: Port already in use

إذا كان المنفذ 5000 أو 3000 مستخدماً بالفعل:

```bash
# تغيير المنفذ في server/.env
PORT=5001

# أو تغيير منفذ React في client/.env
PORT=3001
```

### خطأ: Firebase configuration

تأكد من أن متغيرات Firebase صحيحة في ملفات .env

## الميزات المتاحة حالياً

✅ نظام المصادقة (Login/Register)
✅ لوحة التحكم الأساسية
✅ اتصال Socket.io
✅ تكامل Firebase و Firestore
✅ تكامل Cloudinary

## الخطوات التالية

- [ ] إدارة المنيو (CRUD)
- [ ] نظام الطلبات اللحظي
- [ ] لوحة التحليلات
- [ ] تحديث الأسعار بالجملة
