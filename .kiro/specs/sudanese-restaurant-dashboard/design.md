# تصميم تطبيق لوحة تحكم المطاعم السودانية

## نظرة عامة

تطبيق ويب متكامل لإدارة المطاعم السودانية مع نظام طلبات فوري باستخدام Socket.io وتقارير تحليلية شاملة.

## البنية المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  (Tailwind CSS / Material UI)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth UI    │  │  Dashboard   │  │  Menu Mgmt   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Live Orders  │  │  Analytics   │  │  Profile     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Socket.io Connection                     │
├─────────────────────────────────────────────────────────────┤
│                   Node.js + Express API                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth API   │  │  Menu API    │  │  Orders API  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Analytics API│  │ Profile API  │  │ Socket.io    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firestore   │  │  Cloudinary  │  │  Firebase    │     │
│  │  Database    │  │  Image Store │  │  Auth        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## المكونات الرئيسية

### 1. نظام المصادقة (Authentication)

**المكونات:**
- `LoginPage.jsx` - صفحة تسجيل الدخول
- `RegisterPage.jsx` - صفحة التسجيل
- `ProtectedRoute.jsx` - حماية المسارات
- `authService.js` - خدمة Firebase Auth

**التدفق:**
1. المستخدم يدخل البريد والكلمة المرورية
2. Firebase Auth يتحقق من البيانات
3. إذا صحيح، يتم حفظ Token وإعادة التوجيه إلى Dashboard
4. إذا خطأ، يتم عرض رسالة خطأ

### 2. ملف شخصي للمطعم (Restaurant Profile)

**المكونات:**
- `ProfilePage.jsx` - صفحة الملف الشخصي
- `ProfileForm.jsx` - نموذج تعديل البيانات
- `LogoUpload.jsx` - رفع الشعار

**البيانات المحفوظة:**
```javascript
{
  restaurantId: string,
  name: string,
  phone: string,
  location: string,
  logoUrl: string,
  paymentMethods: ['cash', 'bank'],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. إدارة المنيو (Menu Management)

**المكونات:**
- `MenuPage.jsx` - صفحة المنيو
- `MealForm.jsx` - نموذج إضافة/تعديل وجبة
- `MealCard.jsx` - بطاقة الوجبة
- `BulkPriceUpdate.jsx` - تحديث الأسعار بالجملة

**البيانات المحفوظة:**
```javascript
{
  mealId: string,
  restaurantId: string,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  available: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. نظام الطلبات اللحظي (Live Orders)

**المكونات:**
- `OrdersPage.jsx` - صفحة الطلبات
- `OrderCard.jsx` - بطاقة الطلب
- `OrderNotification.jsx` - تنبيه الطلب الجديد
- `socketService.js` - خدمة Socket.io

**حالات الطلب:**
- `Pending` - طلب جديد
- `Accepted` - تم قبول الطلب
- `Preparing` - جاري التحضير
- `Ready` - الطلب جاهز

**البيانات المحفوظة:**
```javascript
{
  orderId: string,
  restaurantId: string,
  customerId: string,
  items: [
    { mealId, quantity, price }
  ],
  status: 'Pending|Accepted|Preparing|Ready',
  totalPrice: number,
  paymentMethod: 'cash|bank',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. لوحة التحليلات (Analytics Dashboard)

**المكونات:**
- `AnalyticsPage.jsx` - صفحة التحليلات
- `SalesChart.jsx` - رسم بياني المبيعات
- `TopMeals.jsx` - الوجبات الأكثر طلباً
- `PerformanceComparison.jsx` - مقارنة الأداء

**المقاييس:**
- إجمالي المبيعات اليومية
- عدد الطلبات
- الوجبات الأكثر طلباً
- متوسط قيمة الطلب
- معدل إكمال الطلبات

## تدفق البيانات

### إضافة وجبة جديدة:
```
1. المستخدم يملأ النموذج
2. يرفع الصورة إلى Cloudinary
3. يحصل على رابط الصورة
4. يرسل البيانات إلى API
5. API يحفظ البيانات في Firestore
6. يتم تحديث المنيو على الفور
```

### استقبال طلب جديد:
```
1. العميل يرسل طلب من التطبيق
2. السيرفر يستقبل الطلب
3. يحفظ الطلب في Firestore
4. يرسل تنبيه عبر Socket.io
5. المطعم يستقبل التنبيه
6. يتم تشغيل صوت وعرض رسالة
7. المطعم يقبل أو يرفض الطلب
8. يتم تحديث حالة الطلب
```

## نقاط الاتصال (APIs)

### Authentication APIs
- `POST /api/auth/register` - تسجيل حساب جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `POST /api/auth/reset-password` - إعادة تعيين كلمة المرور

### Restaurant Profile APIs
- `GET /api/restaurant/profile` - الحصول على الملف الشخصي
- `PUT /api/restaurant/profile` - تحديث الملف الشخصي
- `POST /api/restaurant/logo` - رفع الشعار

### Menu APIs
- `GET /api/menu` - الحصول على المنيو
- `POST /api/menu/meal` - إضافة وجبة
- `PUT /api/menu/meal/:id` - تعديل وجبة
- `DELETE /api/menu/meal/:id` - حذف وجبة
- `PATCH /api/menu/meal/:id/toggle` - تفعيل/تعطيل وجبة
- `POST /api/menu/bulk-price-update` - تحديث الأسعار بالجملة

### Orders APIs
- `GET /api/orders` - الحصول على الطلبات
- `PUT /api/orders/:id/status` - تحديث حالة الطلب
- `GET /api/orders/analytics` - الحصول على إحصائيات الطلبات

### Socket.io Events
- `new-order` - طلب جديد
- `order-status-update` - تحديث حالة الطلب
- `connection` - اتصال جديد
- `disconnect` - قطع الاتصال

## نماذج البيانات (Data Models)

### Restaurant
```javascript
{
  id: string (Firebase UID),
  name: string,
  email: string,
  phone: string,
  location: string,
  logoUrl: string,
  paymentMethods: array,
  isOnline: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Meal
```javascript
{
  id: string,
  restaurantId: string,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  available: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Order
```javascript
{
  id: string,
  restaurantId: string,
  customerId: string,
  items: array,
  status: string,
  totalPrice: number,
  paymentMethod: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## معالجة الأخطاء

- **Network Errors**: عرض رسالة خطأ وحفظ البيانات محلياً
- **Validation Errors**: عرض رسائل خطأ واضحة للمستخدم
- **Server Errors**: عرض رسالة خطأ عامة وتسجيل الخطأ
- **Authentication Errors**: إعادة التوجيه إلى صفحة تسجيل الدخول

## الأمان

- استخدام Firebase Authentication للمصادقة
- استخدام HTTPS لنقل البيانات
- التحقق من صلاحيات المستخدم على السيرفر
- تشفير البيانات الحساسة
- استخدام CORS للتحكم في الوصول

## الخصائص الصحيحة (Correctness Properties)

### Property 1: تكامل البيانات
*For any* meal added to the menu, the meal should be retrievable from Firestore with the same data
**Validates: Requirements 3.1, 3.2**

### Property 2: تحديث الأسعار بالجملة
*For any* percentage value, applying bulk price update should multiply all meal prices by (1 + percentage/100)
**Validates: Requirements 5.1, 5.2**

### Property 3: حالة الطلب
*For any* order, the status should follow the sequence: Pending -> Accepted -> Preparing -> Ready
**Validates: Requirements 4.4**

### Property 4: اتصال Socket.io
*For any* new order, if the restaurant is online, the order should be delivered via Socket.io within 1 second
**Validates: Requirements 4.1, 4.2**

### Property 5: حالة الاتصال
*For any* restaurant, if Socket.io is connected, the status should be "Online", otherwise "Offline"
**Validates: Requirements 6.1, 6.2**

## استراتيجية الاختبار

### اختبارات الوحدة (Unit Tests)
- اختبار دوال التحقق من الصحة
- اختبار حسابات الأسعار
- اختبار معالجة الأخطاء

### اختبارات الخصائص (Property-Based Tests)
- اختبار تكامل البيانات
- اختبار تحديث الأسعار
- اختبار حالات الطلب
- اختبار اتصال Socket.io

### اختبارات التكامل (Integration Tests)
- اختبار تدفق المصادقة
- اختبار إضافة وجبة
- اختبار استقبال طلب جديد
- اختبار تحديث حالة الطلب

### اختبارات النهاية إلى النهاية (E2E Tests)
- اختبار سيناريو كامل من التسجيل إلى استقبال طلب
- اختبار تحديث الأسعار بالجملة
- اختبار عرض التقارير
