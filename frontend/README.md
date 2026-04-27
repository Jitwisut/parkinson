# Parkinson Care - Mobile App (Frontend)

นี่คือโปรเจกต์แอปพลิเคชันมือถือสำหรับ **Parkinson Care** พัฒนาด้วย **React Native + Expo** เพื่อให้ผู้ป่วยพาร์กินสันสามารถบันทึกอาการ (Symptom Log), ตรวจจับการสั่น, บันทึกการกินยา, และดูรายงานสรุปได้

---

## 🛠️ สิ่งที่ต้องติดตั้งก่อนเริ่มงาน (Prerequisites)
1. **Node.js** (แนะนำเวอร์ชัน 18 ขึ้นไป)
2. **แอปพลิเคชัน Expo Go** (ดาวน์โหลดได้จาก App Store หรือ Google Play Store บนสมาร์ทโฟนของคุณ)
3. เครื่องคอมพิวเตอร์และโทรศัพท์มือถือต้อง **เชื่อมต่อ Wi-Fi วงเดียวกัน**

---

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์

### 1. ติดตั้ง Dependencies
เปิด Terminal แล้วเข้าไปที่โฟลเดอร์ `frontend` จากนั้นรันคำสั่ง:
```bash
cd frontend
npm install
```

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend` 

⚠️ **สำคัญมาก:** คุณต้องเปลี่ยน IP Address ให้ตรงกับเครื่องคอมพิวเตอร์ของคุณ (IPv4) เพื่อให้แอปในมือถือยิง API หา Backend ในคอมได้เจอ **ห้ามใช้ `localhost` เมื่อทดสอบบนมือถือจริง**

```env
# เปลี่ยน 192.168.1.xxx เป็น IPv4 ของคอมพิวเตอร์ที่คุณเปิดรัน Backend ไว้
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.91:4000
```
*(วิธีดู IPv4 บน Windows: เปิด cmd พิมพ์ `ipconfig`, บน Mac: เปิด Terminal พิมพ์ `ifconfig`)*

### 3. รันแอปพลิเคชัน (Start Expo)
หลังจากตั้งค่า `.env` และมั่นใจว่ารัน Backend Server (พอร์ต 4000) ทิ้งไว้แล้ว ให้รันคำสั่งนี้:

```bash
# แนะนำให้ใช้ --clear เพื่อป้องกัน Expo จำ IP เดิมที่ผิดพลาด (Cache)
npx expo start --clear
```

### 4. เปิดแอปบนมือถือ
1. เปิดแอป **Expo Go** บนโทรศัพท์มือถือ
2. **iOS:** เปิดกล้องแล้วสแกน QR Code ที่ขึ้นใน Terminal
3. **Android:** เปิดแอป Expo Go แล้วเลือก "Scan QR Code" เพื่อสแกน

---

## 🌟 ฟีเจอร์หลัก (Features)
- **ระบบเข้าสู่ระบบ (Authentication):** ใช้ Custom JWT ร่วมกับ SecureStore
- **แดชบอร์ด (Dashboard):** แสดงข้อมูลสรุป, สถานะเซิร์ฟเวอร์, และแจ้งเตือนยา
- **บันทึกอาการ (Symptom Log):** บันทึกระดับการสั่น, อาการเดินติดขัด, อารมณ์ ฯลฯ
- **เซ็นเซอร์ (Sensor - ถ้ามี):** ดึงข้อมูลเซ็นเซอร์ตรวจจับการสั่น (Tremor)

---

## 📝 โครงสร้างโฟลเดอร์ (Folder Structure)
- `/app` - ระบบ Routing ของแอป (Expo Router) เช่นหน้า Login, Register, แท็บต่างๆ
- `/assets` - รูปภาพ, ไอคอน, และฟอนต์ที่ใช้ในแอป
- `/components` - UI Components ย่อยๆ ที่นำมาใช้ซ้ำได้
- `/constants` - ค่าคงที่ เช่น Theme สีหลักของแอป
- `/context` - Global state เช่น `AuthContext` ใช้เก็บข้อมูล User และ Token
- `/hooks` - Custom React Hooks
- `/lib` - การเชื่อมต่อและเรียกใช้ API (`api.ts`)
