# Parkinson Care - Backend (Server)

นี่คือโปรเจกต์ Backend สำหรับแอปพลิเคชัน **Parkinson Care** ซึ่งทำหน้าที่จัดการข้อมูลผู้ป่วย, เก็บประวัติอาการ/การสั่น (Tremor), การกินยา และการแจ้งเตือน (Off Episode) พัฒนาด้วย **Node.js, Express และ Prisma ORM** (รองรับ PostgreSQL) พร้อมระบบ Authentication ด้วย JWT

---

## 🛠️ สิ่งที่ต้องติดตั้งก่อนเริ่มงาน (Prerequisites)
1. **Node.js** (แนะนำเวอร์ชัน 18 ขึ้นไป)
2. **PostgreSQL** (ติดตั้งในเครื่อง หรือรันผ่าน Docker)
3. **Git** (สำหรับโคลนโปรเจกต์)

---

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์

### 1. ติดตั้ง Dependencies
เปิด Terminal แล้วเข้าไปที่โฟลเดอร์ `server` จากนั้นรันคำสั่ง:
```bash
cd server
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
สร้างไฟล์ `.env` ในโฟลเดอร์ `server` (หรือคัดลอก `.env.example` ถ้ามี) และกำหนดค่าพื้นฐานดังนี้:

```env
PORT=4000
NODE_ENV=development

# Database (เปลี่ยน username, password, port ให้ตรงกับเครื่องของคุณ)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parkinson_care?schema=public"

# JWT Auth Secret (ตั้งเป็นรหัสอะไรก็ได้สำหรับเข้ารหัส Token)
JWT_SECRET="your_custom_jwt_secret_key"

# การตั้งค่าเซ็นเซอร์ (ถ้ามีการปรับจูน)
TREMOR_THRESHOLD=4
SENSOR_RMS_MULTIPLIER=2
```

### 3. สร้างและเชื่อมต่อฐานข้อมูล (Database Migration)
รันคำสั่งของ Prisma เพื่อสร้างโครงสร้างตาราง (Tables) ใน PostgreSQL อัตโนมัติ:
```bash
npx prisma generate
npx prisma migrate dev
```
*(ถ้ารันครั้งแรกและเพิ่งสร้าง `.env` มันจะสร้างตารางให้ทั้งหมด)*

### 4. รันเซิร์ฟเวอร์
เริ่มการทำงานของเซิร์ฟเวอร์ในโหมด Development (มี Watch mode เมื่อแก้โค้ดจะรีสตาร์ทอัตโนมัติ):
```bash
npm run dev
```
> เซิร์ฟเวอร์จะรันอยู่ที่: `http://localhost:4000`

*(คำสั่งอื่นๆ: `npm start` สำหรับโหมด Production หรือ `npx prisma studio` เพื่อเปิดหน้าเว็บดูข้อมูลใน Database)*

---

## 🔑 ข้อมูล API เบื้องต้น
- **Health Check:** `GET /health`
- **Auth:** 
  - `POST /auth/register` (รับ `name`, `email`, `password`, `role`)
  - `POST /auth/login` (รับ `email`, `password`)
- **Symptoms:** `GET /symptoms`, `POST /symptoms`, `GET /symptoms/summary`
- **Medications:** `GET /medications`, `POST /medications`, `POST /medications/:id/log`
- **Sensor:** `POST /sensor/tremor`, `GET /sensor/tremor/baseline`, `POST /sensor/steps`
- **Reports:** `GET /reports/monthly`

---

## 📝 โครงสร้างโฟลเดอร์ (Folder Structure)
- `/prisma` - สคีมาของ Database และ Migration script
- `/src`
  - `/config` - ค่าคอนฟิกต่างๆ
  - `/jobs` - Cron jobs เช่น ตรวจจับภาวะ Off
  - `/lib` - การเชื่อมต่อ Database (Prisma), Firebase (ถ้ามี)
  - `/middleware` - จัดการเรื่อง Error, ตรวจสอบสิทธิ์ (JWT Auth), ตรวจสอบ Role
  - `/routes` - รวมเส้นทาง API Endpoint ต่างๆ
  - `/services` - Business logic จัดการฐานข้อมูล (Symptom, Medication, Auth)
  - `/validators` - ตรวจสอบความถูกต้องของข้อมูล (Zod validation)
