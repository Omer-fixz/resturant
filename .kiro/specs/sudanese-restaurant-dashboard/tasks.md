# خطة التنفيذ: تطبيق لوحة تحكم المطاعم السودانية

## نظرة عامة

تنفيذ تطبيق متكامل لإدارة المطاعم السودانية مع نظام طلبات فوري وتقارير تحليلية.

## المهام

### المرحلة 1: الإعداد والبنية الأساسية

- [ ] 1.1 إعداد مشروع React مع Tailwind CSS
  - إنشاء مشروع React جديد
  - تثبيت Tailwind CSS
  - إعداد البنية الأساسية للمشروع
  - _Requirements: 9.1, 9.2_

- [ ] 1.2 إعداد خادم Node.js مع Express و Socket.io
  - إنشاء خادم Express
  - تثبيت Socket.io
  - إعداد CORS والمتغيرات البيئية
  - _Requirements: 1.1, 4.1_

- [ ] 1.3 إعداد Firebase و Firestore
  - إنشاء مشروع Firebase
  - تفعيل Firestore Database
  - تفعيل Firebase Authentication
  - _Requirements: 1.1, 2.1_

- [ ] 1.4 إعداد Cloudinary
  - إنشاء حساب Cloudinary
  - إعداد متغيرات البيئة
  - اختبار رفع الصور
  - _Requirements: 2.2, 3.1_

### المرحلة 2: نظام المصادقة

- [ ] 2.1 إنشاء صفحة تسجيل الدخول
  - تصميم نموذج تسجيل الدخول
  - ربط Firebase Authentication
  - معالجة الأخطاء والتحقق من الصحة
  - _Requirements: 1.1, 1.2_

- [ ] 2.2 إنشاء صفحة التسجيل
  - تصميم نموذج التسجيل
  - التحقق من صحة البيانات
  - حفظ بيانات المستخدم في Firestore
  - _Requirements: 1.1, 1.3_

- [ ]* 2.3 كتابة اختبارات للمصادقة
  - **Property 1: Authentication Round Trip**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 2.4 إنشاء ProtectedRoute للحماية
  - التحقق من تسجيل الدخول
  - إعادة التوجيه إلى صفحة تسجيل الدخول
  - _Requirements: 10.3_

### المرحلة 3: ملف شخصي للمطعم

- [ ] 3.1 إنشاء صفحة الملف الشخصي
  - عرض معلومات المطعم
  - تصميم نموذج التعديل
  - _Requirements: 2.1, 2.3_

- [ ] 3.2 إنشاء مكون رفع الشعار
  - ربط Cloudinary
  - رفع الصورة وحفظ الرابط
  - معاينة الشعار
  - _Requirements: 2.2_

- [ ]* 3.3 كتابة اختبارات الملف الشخصي
  - **Property 2: Profile Data Integrity**
  - **Validates: Requirements 2.1, 2.3**

- [ ] 3.4 إنشاء API لحفظ الملف الشخصي
  - POST /api/restaurant/profile
  - PUT /api/restaurant/profile
  - GET /api/restaurant/profile
  - _Requirements: 2.1, 2.3_

### المرحلة 4: إدارة المنيو

- [ ] 4.1 إنشاء صفحة المنيو
  - عرض قائمة الوجبات
  - تصميم بطاقات الوجبات
  - _Requirements: 3.4_

- [ ] 4.2 إنشاء نموذج إضافة وجبة
  - حقول الاسم والسعر والوصف
  - رفع الصورة إلى Cloudinary
  - حفظ البيانات في Firestore
  - _Requirements: 3.1_

- [ ] 4.3 إنشاء نموذج تعديل وجبة
  - تحميل بيانات الوجبة
  - تعديل البيانات والصورة
  - تحديث Firestore
  - _Requirements: 3.2_

- [ ] 4.4 إنشاء مكون حذف وجبة
  - تأكيد الحذف
  - حذف من Firestore وCloudinary
  - _Requirements: 3.3_

- [ ] 4.5 إنشاء مكون تفعيل/تعطيل وجبة
  - زر Toggle للتفعيل/التعطيل
  - تحديث حالة الوجبة فوراً
  - _Requirements: 3.5_

- [ ]* 4.6 كتابة اختبارات إدارة المنيو
  - **Property 3: Menu Data Consistency**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 4.7 إنشاء APIs للمنيو
  - GET /api/menu
  - POST /api/menu/meal
  - PUT /api/menu/meal/:id
  - DELETE /api/menu/meal/:id
  - PATCH /api/menu/meal/:id/toggle
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

### المرحلة 5: تحديث الأسعار بالجملة

- [ ] 5.1 إنشاء مكون تحديث الأسعار بالجملة
  - إدخال النسبة المئوية
  - عرض الأسعار القديمة والجديدة
  - _Requirements: 5.1, 5.2_

- [ ] 5.2 إنشاء API لتحديث الأسعار
  - POST /api/menu/bulk-price-update
  - تطبيق النسبة على جميع الوجبات
  - حفظ في Firestore
  - _Requirements: 5.1, 5.3_

- [ ]* 5.3 كتابة اختبارات تحديث الأسعار
  - **Property 4: Bulk Price Update Calculation**
  - **Validates: Requirements 5.1, 5.2**

### المرحلة 6: نظام الطلبات اللحظي

- [ ] 6.1 إعداد Socket.io على السيرفر
  - إنشاء اتصال Socket.io
  - معالجة الاتصال والقطع
  - _Requirements: 4.1, 6.1_

- [ ] 6.2 إعداد Socket.io على العميل
  - الاتصال بـ Socket.io
  - الاستماع للأحداث
  - _Requirements: 4.1, 4.2_

- [ ] 6.3 إنشاء صفحة الطلبات
  - عرض قائمة الطلبات
  - تصميم بطاقات الطلبات
  - _Requirements: 4.1_

- [ ] 6.4 إنشاء مكون تنبيه الطلب الجديد
  - صوت تنبيه
  - رسالة مرئية
  - _Requirements: 4.2_

- [ ] 6.5 إنشاء مكون تحديث حالة الطلب
  - أزرار تحديث الحالة
  - Pending -> Accepted -> Preparing -> Ready
  - _Requirements: 4.4_

- [ ] 6.6 إنشاء API لاستقبال الطلبات
  - POST /api/orders
  - حفظ في Firestore
  - إرسال عبر Socket.io
  - _Requirements: 4.1_

- [ ] 6.7 إنشاء API لتحديث حالة الطلب
  - PUT /api/orders/:id/status
  - تحديث Firestore
  - إرسال تحديث عبر Socket.io
  - _Requirements: 4.4_

- [ ]* 6.8 كتابة اختبارات الطلبات
  - **Property 5: Order Status Sequence**
  - **Validates: Requirements 4.4**

### المرحلة 7: إدارة حالة الاتصال

- [ ] 7.1 إنشاء مكون عرض حالة الاتصال
  - عرض Online/Offline
  - ألوان مختلفة
  - _Requirements: 6.1, 6.2_

- [ ] 7.2 إنشاء خدمة حفظ الطلبات محلياً
  - حفظ الطلبات في LocalStorage
  - مزامجة عند الاتصال
  - _Requirements: 6.3_

- [ ]* 7.3 كتابة اختبارات حالة الاتصال
  - **Property 6: Connection Status Accuracy**
  - **Validates: Requirements 6.1, 6.2**

### المرحلة 8: خيارات الدفع

- [ ] 8.1 إنشاء مكون تحديد طرق الدفع
  - اختيار Cash/Bank/Both
  - حفظ في Firestore
  - _Requirements: 7.1, 7.2_

- [ ] 8.2 إنشاء API لطرق الدفع
  - GET /api/restaurant/payment-methods
  - PUT /api/restaurant/payment-methods
  - _Requirements: 7.1, 7.2_

- [ ]* 8.3 كتابة اختبارات طرق الدفع
  - **Property 7: Payment Methods Consistency**
  - **Validates: Requirements 7.1, 7.2**

### المرحلة 9: لوحة التحليلات

- [ ] 9.1 إنشاء صفحة التحليلات
  - تصميم لوحة التحكم
  - عرض المقاييس الأساسية
  - _Requirements: 8.1_

- [ ] 9.2 إنشاء مكون رسم بياني المبيعات
  - عرض مبيعات اليوم
  - رسم بياني يومي/أسبوعي/شهري
  - _Requirements: 8.1, 8.3_

- [ ] 9.3 إنشاء مكون الوجبات الأكثر طلباً
  - عرض قائمة الوجبات الأكثر طلباً
  - عرض عدد الطلبات والإيرادات
  - _Requirements: 8.2_

- [ ] 9.4 إنشاء مكون مقارنة الأداء
  - مقارنة أسبوعية/شهرية
  - رسوم بيانية مقارنة
  - _Requirements: 8.3_

- [ ] 9.5 إنشاء API للإحصائيات
  - GET /api/orders/analytics
  - حساب المبيعات والإحصائيات
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 9.6 كتابة اختبارات التحليلات
  - **Property 8: Analytics Data Accuracy**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### المرحلة 10: الاختبار والتحسينات

- [ ] 10.1 اختبار شامل للتطبيق
  - اختبار جميع الميزات
  - اختبار الأداء
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 10.2 تحسين الأداء
  - تحسين سرعة التحميل
  - تحسين استهلاك الذاكرة
  - _Requirements: 9.2_

- [ ] 10.3 إضافة معالجة الأخطاء الشاملة
  - معالجة أخطاء الشبكة
  - معالجة أخطاء الخادم
  - _Requirements: 9.3, 9.4_

- [ ] 10.4 توثيق الكود
  - توثيق الدوال والمكونات
  - توثيق APIs
  - _Requirements: 9.1_

## ملاحظات

- المهام المعلمة بـ `*` اختيارية ويمكن تخطيها للتركيز على الميزات الأساسية
- كل مهمة تشير إلى المتطلبات ذات الصلة
- يجب اختبار كل مهمة قبل الانتقال إلى التالية
- استخدام Git للتحكم في الإصدارات
