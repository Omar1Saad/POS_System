# 🛒 نظام نقاط البيع | POS System

> نظام ويب متكامل مصمم للمحلات التجارية الصغيرة والمقاهي، يهدف إلى تسهيل وأتمتة عمليات البيع، إدارة المنتجات، وتتبع المخزون بكفاءة عالية.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)

## 📸 لقطات الشاشة

### 🖥️ واجهة البيع الرئيسية
<!-- TODO: إضافة صورة لواجهة البيع -->
<img width="1867" height="907" alt="Screenshot 2025-10-13 at 14-09-04 POS System - Point of Sale" src="https://github.com/user-attachments/assets/367987f1-cac3-49f0-8ee0-75b0d38f45bc" />


### 📦 صفحة إدارة المنتجات
<img width="1867" height="886" alt="Screenshot 2025-10-13 at 14-22-03 POS System - Point of Sale" src="https://github.com/user-attachments/assets/71821fbf-72df-410e-89d4-77dede6be23d" />

### 📊 لوحة التحكم والتقارير
<img width="1867" height="886" alt="Screenshot 2025-10-13 at 14-07-32 POS System - Point of Sale" src="https://github.com/user-attachments/assets/a842c389-0256-4dc9-bbf3-91ae9805c651" />


## 📋 جدول المحتويات

- [نبذة عن المشروع](#-نبذة-عن-المشروع)
- [الميزات الرئيسية](#-الميزات-الرئيسية)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [كيفية التشغيل محلياً](#-كيفية-التشغيل-محلياً)
- [هيكل المشروع](#-هيكل-المشروع)
- [المطور](#-المطور)

## 🎯 نبذة عن المشروع

في عالم التجارة الحديث، تواجه المحلات التجارية الصغيرة والمقاهي تحديات كبيرة في إدارة عمليات البيع والمخزون. الإدارة اليدوية للمبيعات غالباً ما تؤدي إلى أخطاء بشرية، صعوبة في تتبع المخزون، وفقدان الوقت الثمين.

**نظام نقاط البيع** هو الحل التقني المتكامل الذي يهدف إلى:

- 🚀 **أتمتة عمليات البيع** وتسهيل التعامل مع العملاء
- 📊 **تتبع المخزون آلياً** وتجنب نفاد المنتجات
- 💰 **تحسين الإيرادات** من خلال تقارير المبيعات الدقيقة
- ⏱️ **توفير الوقت** والجهد المبذول في العمليات الإدارية

## ✨ الميزات الرئيسية

### 🛍️ إدارة المبيعات
- 💳 **واجهة بيع سريعة وسهلة** مع دعم المدفوعات النقدية والرقمية
- 🧾 **إنشاء وطباعة الفواتير** بتصميم احترافي
- 📱 **واجهة متجاوبة** تعمل على جميع الأجهزة (سطح المكتب، التابلت، الهاتف)

### 📦 إدارة المنتجات
- ➕ **إضافة منتجات جديدة** مع تفاصيل شاملة (الاسم، السعر، الوصف، الصورة)
- ✏️ **تعديل وحذف المنتجات** بسهولة
- 🏷️ **تصنيف المنتجات** في فئات مختلفة
- 📊 **تتبع المخزون آلياً** بعد كل عملية بيع

### 👥 إدارة المستخدمين
- 🔐 **نظام صلاحيات متقدم** (مدير، كاشير، موظف)
- 🔑 **مصادقة آمنة** باستخدام JWT
- 👤 **ملفات شخصية** قابلة للتخصيص

### 📈 التقارير والتحليلات
- 📊 **لوحة تحكم شاملة** تعرض إحصائيات المبيعات
- 📅 **تقارير يومية وأسبوعية وشهرية**
- 📈 **رسوم بيانية تفاعلية** لعرض اتجاهات المبيعات
- 💰 **تتبع الأرباح والمصروفات**

### 🔧 إدارة النظام
- ⚙️ **إعدادات قابلة للتخصيص** (العملة، الضرائب، إلخ)
- 💾 **نسخ احتياطية تلقائية** للبيانات
- 🔄 **مزامنة البيانات** بين الأجهزة المتعددة

## 🛠️ التقنيات المستخدمة

### 🎨 الواجهة الأمامية (Frontend)
| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| ![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white) | 18.x | مكتبة واجهة المستخدم |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white) | 5.x | لغة البرمجة المطورة |
| ![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-1.x-764ABC?style=flat&logo=redux&logoColor=white) | 1.x | إدارة الحالة |
| ![Material-UI](https://img.shields.io/badge/Material--UI-5.x-0081CB?style=flat&logo=mui&logoColor=white) | 5.x | مكتبة مكونات الواجهة |
| ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat&logo=axios&logoColor=white) | 1.x | طلبات HTTP |

### ⚙️ الواجهة الخلفية (Backend)
| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| ![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat&logo=nestjs&logoColor=white) | 10.x | إطار عمل الخادم |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white) | 5.x | لغة البرمجة |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?style=flat&logo=postgresql&logoColor=white) | 15.x | قاعدة البيانات |
| ![TypeORM](https://img.shields.io/badge/TypeORM-0.3.x-FE0900?style=flat&logo=typeorm&logoColor=white) | 0.3.x | ORM |
| ![JWT](https://img.shields.io/badge/JWT-Latest-000000?style=flat&logo=jsonwebtokens&logoColor=white) | Latest | المصادقة |
| ![Passport.js](https://img.shields.io/badge/Passport.js-0.7.x-34E27A?style=flat&logo=passport&logoColor=white) | 0.7.x | استراتيجيات المصادقة |

## 🚀 كيفية التشغيل محلياً

## 🌐 النشر على Vercel

### 📋 المتطلبات للنشر
- حساب Vercel (مجاني)
- مشروع على GitHub
- قاعدة بيانات متاحة عبر الإنترنت (مثل Supabase أو Railway)

### 🔧 خطوات النشر

#### 1. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة بيانات على Supabase أو Railway
# نسخ رابط الاتصال وقاعدة البيانات
```

#### 2. إعداد متغيرات البيئة في Vercel
في لوحة تحكم Vercel، أضف المتغيرات التالية:
```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

#### 3. ربط المشروع مع Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# نشر المشروع
vercel --prod
```

#### 4. إعدادات إضافية
- تأكد من أن ملف `vercel.json` موجود في المجلد الرئيسي
- تأكد من أن جميع المسارات في الواجهة الأمامية تستخدم `/api/` للطلبات الخلفية
- اختبر التطبيق بعد النشر

### 🔗 رابط النسخة الحية
بعد النشر، ستحصل على رابط مثل: `https://your-project-name.vercel.app`

## 🚀 كيفية التشغيل محلياً

### 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت البرامج التالية على جهازك:

- **Node.js** (الإصدار 18.x أو أحدث)
- **npm** أو **yarn** (مدير الحزم)
- **Git** (للحصول على الكود المصدري)

### 📥 1. استنساخ المشروع

```bash
# استنساخ المستودع
git clone https://github.com/Omar1Saad/POS_System.git

### 🗄️ 2. تشغيل قاعدة البيانات والواجهة الخلفية

```bash
# الانتقال إلى مجلد الواجهة الخلفية
cd backend

# إنشاء ملف البيئة (إذا لم يكن موجوداً)
cp .env.example .env

# تثبيت التبعيات
npm install

# تشغيل الواجهة الخلفية
npm run start:dev
```

الواجهة الخلفية ستكون متاحة على: `http://localhost:3000`

### 🎨 3. تشغيل الواجهة الأمامية

```bash
# فتح terminal جديد والانتقال إلى مجلد الواجهة الأمامية
cd frontend

# تثبيت التبعيات
npm install

# تشغيل الواجهة الأمامية
npm run dev
```

الواجهة الأمامية ستكون متاحة على: `http://localhost:5175`

### 🔧 4. إعداد قاعدة البيانات

```bash
# تشغيل migrations (في مجلد backend)
npm run migration:run

# (اختياري) بذرة البيانات التجريبية
npm run seed
```

### ✅ 5. التحقق من التشغيل

1. افتح المتصفح وانتقل إلى `http://localhost:5175`
2. قم بانشاء حساب جديد واعطيه الصلاحيات

## 📁 هيكل المشروع

```
pos-system/
├── 📁 frontend/                 # الواجهة الأمامية (React)
│   ├── 📁 public/              # الملفات العامة
│   ├── 📁 src/                 # الكود المصدري
│   │   ├── 📁 components/      # المكونات
│   │   ├── 📁 pages/          # الصفحات
│   │   ├── 📁 services/       # خدمات API
│   │   ├── 📁 hooks/          # React Hooks
│   │   ├── 📁 contexts/       # React Contexts
│   │   ├── 📁 types/          # TypeScript Types
│   │   └── 📁 theme/          # إعدادات التصميم
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
├── 📁 backend/                 # الواجهة الخلفية (NestJS)
│   ├── 📁 src/                # الكود المصدري
│   │   ├── 📁 auth/           # نظام المصادقة
│   │   ├── 📁 users/          # إدارة المستخدمين
│   │   ├── 📁 products/       # إدارة المنتجات
│   │   ├── 📁 sales/          # إدارة المبيعات
│   │   ├── 📁 categories/     # إدارة الفئات
│   │   ├── 📁 customers/      # إدارة العملاء
│   │   ├── 📁 suppliers/      # إدارة الموردين
│   │   ├── 📁 analytics/      # التقارير والتحليلات
│   │   ├── 📁 common/         # الملفات المشتركة
│   │   └── 📄 main.ts         # نقطة البداية
│   ├── 📁 dist/               # الملفات المبنية
│   ├── 📄 package.json
│   ├── 📄 docker-compose.yml  # إعدادات Docker
│   └── 📄 .env.example        # مثال على متغيرات البيئة
├── 📄 .gitignore              # ملف تجاهل Git
├── 📄 README.md              # هذا الملف
└── 📄 LICENSE                # رخصة المشروع
```

## 👨‍💻 المطور

### [عمر سعد]
- **GitHub**: [@Omar1Saad](https://github.com/Omar1Saad)
- **البريد الإلكتروني**: froomomer66@gmail.com
- **LinkedIn**: [رابط LinkedIn](https://www.linkedin.com/in/omar-saad-616044363?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

---

## 🔗 روابط المشروع

- [🚀 مشاهدة النسخة الحية (Live Demo)](https://pos-system-frontend-psi.vercel.app/dashboard)
- [📄 توثيق الـ API](https://api-docs-url.com) - *سيتم إضافتها قريباً*
- [🐛 الإبلاغ عن مشكلة](https://github.com/Omar1Saad/POS_System/issues)
- [💡 اقتراح ميزة جديدة](https://github.com/Omar1Saad/POS_System/issues)

---

<div align="center">

### ⭐ إذا أعجبك المشروع، لا تنس إعطاؤه نجمة!


</div>
