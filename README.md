# تبادل المساعدات في غزة (Gaza Aid Exchange)

تطبيق ويب بسيط لمساعدة سكان غزة على تبادل المواد والمساعدات المحلية، تقليل الهدر وتحسين الوصول أثناء النقص.

## المميزات

- **منشورات "لدي" و "أحتاج"** - سهولة نشر ما تمتلكه أو ما تحتاجه
- **فلترة حسب المنطقة** - شمال غزة، مدينة غزة، دير البلح، خان يونس، رفح
- **تصنيف المواد** - طعام، مياه، طبي، أطفال، طاقة، أخرى
- **نظام مطابقة بسيط** - بدون دردشة معقدة
- **واجهة عربية بالكامل** - مصممة للاستخدام اليومي
- **متوافق مع الهواتف المحمولة** - يعمل بشكل جيد على الأجهزة منخفضة المواصفات

## تقنيات المستخدمة

### الواجهة الأمامية

- React + TypeScript
- Vite
- TailwindCSS
- React Router

### الواجهة الخلفية

- Node.js + Express
- PostgreSQL
- JWT للمصادقة
- bcrypt لتشفير كلمات المرور

## متطلبات التشغيل

- Node.js 18+
- PostgreSQL 12+
- npm أو yarn

## التثبيت والتشغيل

### 1. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
createdb gaza_aid_exchange

# استيراد المخطط
psql gaza_aid_exchange < backend/src/schema.sql
```

### 2. تشغيل الواجهة الخلفية

```bash
cd backend
npm install
npm run dev
```

### 3. تشغيل الواجهة الأمامية

```bash
cd frontend
npm install
npm run dev
```

## متغيرات البيئة

### الواجهة الخلفية (.env)

```
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/gaza_aid_exchange
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## هيكل المشروع

```
gaza-aid-exchange/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   └── matches.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── database.ts
│   │   ├── schema.sql
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
└── README.md
```

## واجهة برمجة التطبيقات (API)

### المصادقة

- `POST /auth/register` - تسجيل مستخدم جديد
- `POST /auth/login` - تسجيل الدخول

### المنشورات

- `GET /posts` - جلب جميع المنشورات (مع فلاتر اختيارية)
- `POST /posts` - إنشاء منشور جديد
- `GET /posts/:id` - جلب منشور محدد
- `PATCH /posts/:id/complete` - إكمال المنشور

### المطابقات

- `POST /matches` - إنشاء مطابقة جديدة
- `GET /matches/my` - جلب مطابقات المستخدم

## المساهمة

هذا المشروع مفتوح المصدر للمساعدة في تحسين الوصول إلى المساعدات في غزة. جميع المساهمات مرحب بها.

## الرخصة

MIT License

---

**ملاحظة:** هذا التطبيق مصمم ليكون أداة إنسانية للمساعدة المتبادلة، وليس للتجارة أو الربح.
