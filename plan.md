# Parkinson Care Assistant — Project Plan

> โปรแกรมช่วยติดตามอาการ + เตือนยา + แจ้งเตือนช่วง OFF สำหรับผู้ป่วยโรคพาร์กินสัน

---

## 1. Project Overview

| Item                 | Detail                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------- |
| **ชื่อโปรเจ็ก**      | Parkinson Care Assistant                                                               |
| **เป้าหมาย**         | ช่วยผู้ป่วยพาร์กินสันและผู้ดูแล ติดตามอาการ กินยาตรงเวลา และรู้ว่ากำลังเข้าสู่ช่วง OFF |
| **Platform**         | Mobile App (Android + iOS) via Flutter                                                 |
| **Backend**          | Node.js (Express) + PostgreSQL                                                         |
| **เวลาทำ (ประเมิน)** | 3–4 เดือน (แบ่งเป็น 4 Phase)                                                           |

---

## 2. ปัญหาที่แก้ (Problem Statement)

ผู้ป่วยโรคพาร์กินสันมีปัญหาหลักคือ:

1. **ลืมกินยา** — ยา Levodopa ต้องกินตรงเวลามาก ถ้าช้าจะเข้าสู่ช่วง “OFF” (อาการแย่กะทันหัน)
1. **ไม่รู้ตัวว่าเข้าช่วง OFF** — ผู้ป่วยบางคนไม่สามารถแยกแยะได้ว่าตัวเองกำลังเข้าสู่ช่วง OFF หรือเปล่า
1. **แพทย์ไม่มีข้อมูลอาการรายวัน** — ไม่มีข้อมูลอาการระหว่างนัดหมาย ทำให้การปรับยาทำได้ยาก
1. **ผู้ดูแลไม่รู้สถานการณ์** — ครอบครัวหรือผู้ดูแลไม่ทราบสภาพผู้ป่วยแบบ real-time

---

## 3. Features (MVP → Advanced)

### Phase 1 — MVP Core

#### 3.1 บันทึกอาการ (Symptom Logger)

- กด rating ง่ายๆ ไม่เกิน 30 วินาที
- ฟิลด์ที่บันทึก:
  - `tremor_level` (0–5) — ระดับการสั่น
  - `rigidity_level` (0–5) — ความแข็งเกร็ง
  - `walking_difficulty` (boolean) — เดินลำบากไหม
  - `freezing_gait` (boolean) — มี freezing กลางทางไหม
  - `mood` (0–5) — อารมณ์
  - `energy_level` (0–5) — พลังงาน
  - `note` (text, optional) — โน้ตเพิ่มเติม
  - `recorded_at` (timestamp)
- แสดงกราฟเส้นดูแนวโน้ม 7 วัน / 30 วัน
- Export เป็น PDF/CSV เพื่อนำไปพบแพทย์

#### 3.2 ระบบเตือนกินยา (Medication Reminder)

- สร้าง profile ยาของตัวเอง (ชื่อยา, ขนาด, เวลา)
- แจ้งเตือน Push Notification + เสียง + สั่น
- กด “กินแล้ว” / “ข้าม” บันทึกลงฐานข้อมูล
- Compliance tracking — ดูว่ากินยาครบ % ไหมแต่ละสัปดาห์

#### 3.3 แจ้งเตือนช่วง OFF (OFF Period Alert)

- Rule-based detection:
  - ถ้าอาการถูกบันทึกว่า tremor ≥ 4 → แจ้งเตือน
  - ถ้าเลยเวลายา > 30 นาทีและยังไม่กด “กินแล้ว” → แจ้งเตือน
  - ถ้า symptom log score รวมสูง (threshold ตั้งได้) → แจ้ง
- ส่ง notification ไปยังผู้ดูแล (caregiver) ด้วย

---

### Phase 2 — Sensor Integration

#### 3.4 ตรวจจับการสั่น (Tremor Detection)

- ใช้ **Accelerometer** ของมือถือ
- วัดขณะที่ผู้ป่วยถือมือถือนิ่งๆ 10 วินาที
- คำนวณ RMS (Root Mean Square) ของ acceleration
- เปรียบเทียบกับ baseline ที่วัดตอนแรก (calibration)
- ผลออกมาเป็น tremor score อัตโนมัติ (ไม่ต้องกดเอง)

#### 3.5 Step Counter / Gait Analysis

- นับก้าวเดินผ่าน Pedometer API
- ตรวจ irregularity ของก้าว (ก้าวสั้นๆ ถี่ผิดปกติ = freezing risk)
- บันทึก daily step goal และ compliance

---

### Phase 3 — Caregiver & Doctor Portal

#### 3.6 Caregiver Dashboard (Web)

- ผู้ดูแลดูสถานะผู้ป่วยแบบ real-time
- รับ alert เมื่อผู้ป่วยเข้าสู่ช่วง OFF
- ดู symptom history และ medication compliance

#### 3.7 Doctor Report Export

- สร้าง PDF สรุปรายเดือน:
  - กราฟอาการ
  - medication compliance %
  - OFF episode count
  - เทียบกับช่วงก่อนหน้า

---

### Phase 4 — ML Enhancement

#### 3.8 OFF Period Prediction (ML)

- Train model จากข้อมูลอาการ + เวลายา + sensor
- predict ล่วงหน้า 30–60 นาทีว่าจะเข้าช่วง OFF
- Stack: Python + scikit-learn → export เป็น API แยก (Flask/FastAPI)

---

## 4. System Architecture

```
┌─────────────────────────────────────────┐
│              Mobile App (Flutter)        │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Symptom  │ │   Med    │ │ Sensor  │  │
│  │  Logger  │ │Reminder  │ │Monitor  │  │
│  └────┬─────┘ └────┬─────┘ └────┬────┘  │
│       └────────────┴────────────┘        │
│              Local SQLite DB             │
│         (offline-first queue)            │
└──────────────────┬──────────────────────┘
                   │ HTTPS (REST / WebSocket)
                   ▼
┌─────────────────────────────────────────┐
│         Backend (Node.js + Express)      │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  REST API    │  │  Socket.IO       │ │
│  │  /symptoms   │  │  /caregiver/live │ │
│  │  /medications│  └──────────────────┘ │
│  │  /alerts     │                        │
│  └──────┬───────┘                        │
│         │                                │
│  ┌──────▼───────────────────────────┐   │
│  │        Business Logic Layer       │   │
│  │  OFF Detection Engine (rules)     │   │
│  │  Notification Dispatcher (FCM)    │   │
│  │  node-cron job (ทุก 5 นาที)      │   │
│  └──────┬───────────────────────────┘   │
└─────────┼──────────────────────────────┘
          │
   ┌──────▼──────────┐
   │   PostgreSQL     │
   │  (Railway/       │
   │   Supabase)      │
   └─────────────────┘
          │
   ┌──────▼──────────┐
   │  External APIs   │
   │  FCM / APNs      │  ← Push Notifications
   │  Firebase Auth   │  ← Authentication
   └─────────────────┘
```

---

## 5. Tech Stack

### Mobile (Frontend)

| Layer            | Technology                      | เหตุผล                              |
| ---------------- | ------------------------------- | ----------------------------------- |
| Framework        | **Flutter** (Dart)              | Cross-platform, sensor API ครบ      |
| State Management | **Riverpod**                    | Modern, testable                    |
| Local DB         | **sqflite** (SQLite)            | Offline-first queue, ง่ายกว่า Drift |
| Charts           | **fl_chart**                    | กราฟสวย customize ได้               |
| Notifications    | **flutter_local_notifications** | Local alarm                         |
| Sensors          | **sensors_plus**                | Accelerometer/Gyroscope             |
| Pedometer        | **pedometer** package           | Step counting                       |
| HTTP Client      | **Dio**                         | REST calls + retry logic            |
| Auth             | **Firebase Auth**               | Google/Apple Sign-in                |

### Backend

| Layer             | Technology                     | เหตุผล                                |
| ----------------- | ------------------------------ | ------------------------------------- |
| Language          | **Node.js**                    | ทุกคนรู้ JavaScript, ecosystem ใหญ่   |
| Web Framework     | **Express.js**                 | เรียนง่าย, tutorial เยอะมาก           |
| ORM               | **Prisma**                     | Schema-first, type-safe, migrate ง่าย |
| Database          | **PostgreSQL**                 | Reliable, ฟรี, deploy ง่าย            |
| Real-time         | **Socket.IO**                  | WebSocket caregiver dashboard         |
| Push Notification | **firebase-admin** (FCM)       | Android + iOS                         |
| Auth              | **Firebase Auth** + verify JWT | Plug-and-play ไม่ต้องทำเอง            |
| Job Queue         | **node-cron**                  | เช็ค OFF condition ทุก 5 นาที         |
| PDF Export        | **PDFKit**                     | generate PDF รายงานแพทย์              |
| Validation        | **Zod**                        | validate request body                 |

### Infrastructure

| Layer                 | Technology                               | เหตุผล                              |
| --------------------- | ---------------------------------------- | ----------------------------------- |
| Hosting (Backend)     | **Railway** หรือ **Render**              | Deploy ฟรี, push → deploy อัตโนมัติ |
| Hosting (DB)          | **Railway PostgreSQL** หรือ **Supabase** | ฟรี tier ใช้งานได้เลย               |
| Container (local dev) | **Docker + docker-compose**              | dev environment สม่ำเสมอ            |
| CI/CD                 | **GitHub Actions**                       | auto deploy เมื่อ push              |

### Web Dashboard (Caregiver)

| Layer     | Technology           | เหตุผล                                           |
| --------- | -------------------- | ------------------------------------------------ |
| Framework | **Next.js** (React)  | ใช้ JavaScript เหมือนกัน ทีมไม่ต้องเรียนภาษาใหม่ |
| Charts    | **Recharts**         | ใช้ง่าย, React-native                            |
| Styling   | **Tailwind CSS**     | เร็ว, ไม่ต้องเขียน CSS เยอะ                      |
| Real-time | **Socket.IO client** | คู่กับ backend                                   |
| Hosting   | **Vercel**           | ฟรี, deploy อัตโนมัติ                            |

---

## 6. Database Schema (PostgreSQL + Prisma)

```prisma
// schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(PATIENT)
  fcmToken  String?  // สำหรับ push notification
  createdAt DateTime @default(now())

  symptoms        SymptomLog[]
  medications     Medication[]
  medicationLogs  MedicationLog[]
  offAlerts       OffAlert[]
  sensorReadings  SensorReading[]
  patients        PatientCaregiver[] @relation("caregiver")
  caregivers      PatientCaregiver[] @relation("patient")
}

enum Role {
  PATIENT
  CAREGIVER
  DOCTOR
}

model PatientCaregiver {
  patientId   String
  caregiverId String
  patient     User @relation("patient",   fields: [patientId],   references: [id])
  caregiver   User @relation("caregiver", fields: [caregiverId], references: [id])

  @@id([patientId, caregiverId])
}

model Medication {
  id        String   @id @default(uuid())
  patientId String
  patient   User     @relation(fields: [patientId], references: [id])
  name      String   // "Levodopa 100mg"
  doseMg    Float?
  times     String[] // ["08:00", "12:00", "17:00"]
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  logs MedicationLog[]
}

model MedicationLog {
  id           String     @id @default(uuid())
  patientId    String
  patient      User       @relation(fields: [patientId], references: [id])
  medicationId String
  medication   Medication @relation(fields: [medicationId], references: [id])
  scheduledAt  DateTime
  takenAt      DateTime?  // null = ยังไม่กิน
  status       MedStatus
  recordedAt   DateTime   @default(now())
}

enum MedStatus {
  TAKEN
  SKIPPED
  MISSED
}

model SymptomLog {
  id                String   @id @default(uuid())
  patientId         String
  patient           User     @relation(fields: [patientId], references: [id])
  tremorLevel       Int      // 0–5
  rigidityLevel     Int      // 0–5
  walkingDifficulty Boolean  @default(false)
  freezingGait      Boolean  @default(false)
  mood              Int      // 0–5
  energyLevel       Int      // 0–5
  note              String?
  source            String   // "manual" | "sensor"
  recordedAt        DateTime @default(now())
}

model SensorReading {
  id         String   @id @default(uuid())
  patientId  String
  patient    User     @relation(fields: [patientId], references: [id])
  ax         Float
  ay         Float
  az         Float
  rms        Float    // คำนวณ √((ax²+ay²+az²)/3)
  recordedAt DateTime @default(now())
}

model OffAlert {
  id        String   @id @default(uuid())
  patientId String
  patient   User     @relation(fields: [patientId], references: [id])
  trigger   String   // "symptom_score" | "missed_dose" | "sensor"
  severity  String   // "warning" | "critical"
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 7. API Endpoints

### Auth

```
POST   /auth/verify            verify Firebase token → return user profile
POST   /auth/register          สร้าง user ครั้งแรกหลัง Firebase signup
```

### Symptoms

```
POST   /symptoms               บันทึกอาการ (single)
POST   /symptoms/bulk          บันทึกหลายรายการ (offline sync)
GET    /symptoms               ดึงประวัติอาการ ?from=&to=&limit=
GET    /symptoms/summary       สรุปรายวัน/สัปดาห์/เดือน ?period=daily|weekly|monthly
GET    /symptoms/export        export CSV
```

### Medications

```
GET    /medications            ดูรายการยาทั้งหมด
POST   /medications            เพิ่มยา
PUT    /medications/:id        แก้ไขยา
DELETE /medications/:id        ลบยา

POST   /medications/:id/log    บันทึกการกินยา { status: "taken" | "skipped" }
GET    /medications/logs       ดูประวัติการกินยา
GET    /medications/compliance ดู compliance รายสัปดาห์ (%)
```

### Alerts

```
GET    /alerts                 ดู OFF alert ทั้งหมด
POST   /alerts/:id/resolve     mark ว่าแก้ไขแล้ว
GET    /alerts/history         ประวัติ OFF episodes
```

### Sensor

```
POST   /sensor/tremor          ส่งข้อมูล accelerometer { ax, ay, az, rms }
GET    /sensor/tremor/baseline รับ baseline calibration ของผู้ป่วย
POST   /sensor/steps           sync step count รายวัน
```

### Caregiver

```
GET    /caregiver/patients              ดูรายชื่อผู้ป่วยที่ดูแล
GET    /caregiver/patients/:id/status   สถานะปัจจุบัน
WS     /caregiver/live                  Socket.IO real-time updates
```

### Reports

```
GET    /reports/monthly        รายงานรายเดือน (JSON)
GET    /reports/pdf            export PDF สรุปพบแพทย์
```

---

## 8. OFF Detection Engine (Business Logic)

```javascript
// services/offDetector.js

const OFF_RULES = {
  tremorThreshold: 4, // tremor_level >= 4
  missedDoseMinutes: 30, // เลยเวลายา > 30 นาที
  sensorRmsMultiplier: 2.0, // rms > baseline * 2
};

async function evaluatePatient(patientId) {
  const [latestSymptom, nextDose, latestRms, baseline] = await Promise.all([
    getLatestSymptom(patientId),
    getNextOverdueDose(patientId),
    getLatestSensorRms(patientId),
    getBaselineRms(patientId),
  ]);

  // Rule 1: symptom score สูง
  if (latestSymptom?.tremorLevel >= OFF_RULES.tremorThreshold) {
    return createAlert(patientId, "symptom_score", "warning");
  }

  // Rule 2: เลยเวลายา > 30 นาที และยังไม่กิน
  if (nextDose && getOverdueMinutes(nextDose) > OFF_RULES.missedDoseMinutes) {
    return createAlert(patientId, "missed_dose", "critical");
  }

  // Rule 3: sensor RMS สูงกว่า baseline * 2
  if (
    latestRms &&
    baseline &&
    latestRms > baseline * OFF_RULES.sensorRmsMultiplier
  ) {
    return createAlert(patientId, "sensor", "warning");
  }

  return null;
}

// jobs/offCheck.js — รันทุก 5 นาที
cron.schedule("*/5 * * * *", async () => {
  const patients = await getActivePatients();
  for (const patient of patients) {
    const alert = await evaluatePatient(patient.id);
    if (alert) {
      await sendFCMNotification(patient.fcmToken, alert); // แจ้งผู้ป่วย
      await notifyCaregivers(patient.id, alert); // แจ้ง caregiver
      io.to(`patient:${patient.id}`).emit("off_alert", alert); // Socket.IO
    }
  }
});
```

---

## 9. Offline-First Strategy

```
Mobile App (Flutter)
    │
    ├─ Log symptom / sensor data → SQLite local (sqflite)
    │
    ├─ Background sync (ทุก 60 วินาที ถ้ามี internet)
    │       POST /symptoms/bulk  [ส่ง array]
    │
    └─ Server ตอบ 200 → ลบออกจาก local queue
```

- ใช้ **sqflite** เก็บ queue (ง่ายกว่า Drift สำหรับผู้เริ่มต้น)
- เช็ค connectivity ก่อน sync ด้วย `connectivity_plus` package
- Conflict resolution: `recordedAt` เป็น source of truth

---

## 10. Folder Structure

```
parkinson-care/
├── apps/
│   ├── mobile/                    # Flutter app
│   │   ├── lib/
│   │   │   ├── features/
│   │   │   │   ├── symptoms/      # symptom logger UI + logic
│   │   │   │   ├── medications/   # med reminder + log
│   │   │   │   ├── alerts/        # OFF alert display
│   │   │   │   └── sensor/        # accelerometer + pedometer
│   │   │   ├── core/
│   │   │   │   ├── db/            # sqflite local queue
│   │   │   │   ├── api/           # Dio HTTP client
│   │   │   │   └── sync/          # offline → online sync
│   │   │   └── main.dart
│   │   └── pubspec.yaml
│   │
│   └── web/                       # Next.js caregiver dashboard
│       ├── app/
│       │   ├── dashboard/
│       │   └── patients/
│       └── package.json
│
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── symptoms.js
│   │   │   ├── medications.js
│   │   │   ├── alerts.js
│   │   │   ├── sensor.js
│   │   │   ├── caregiver.js
│   │   │   └── reports.js
│   │   ├── services/
│   │   │   ├── offDetector.js     # OFF detection rules
│   │   │   ├── notification.js    # FCM sender
│   │   │   └── pdfReport.js       # PDFKit report
│   │   ├── middleware/
│   │   │   └── auth.js            # Firebase token verify
│   │   ├── jobs/
│   │   │   └── offCheck.js        # node-cron every 5 min
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
│
├── docker-compose.yml             # local dev: PostgreSQL
├── .env.example
└── plan.md
```

---

## 11. Project Phases & Timeline

### Phase 0 — Setup (สัปดาห์ 1–2)

- [ ] สร้าง Flutter project + folder structure
- [ ] สร้าง Node.js + Express project
- [ ] docker-compose: PostgreSQL สำหรับ local dev
- [ ] Prisma schema + `prisma migrate dev`
- [ ] Firebase project: Auth + FCM
- [ ] Deploy backend ขึ้น Railway (ว่างเปล่าก่อน)

### Phase 1 — MVP Core (สัปดาห์ 3–6)

- [ ] Symptom Logger UI (Flutter)
- [ ] Medication profile management
- [ ] Medication reminder (local notifications)
- [ ] REST API ครบทุก endpoint
- [ ] Firebase Auth middleware
- [ ] Basic OFF alert (rule-based + node-cron)
- [ ] Symptom graph (fl_chart)

### Phase 2 — Sensor (สัปดาห์ 7–9)

- [ ] Accelerometer tremor measurement (sensors_plus)
- [ ] Calibration flow (baseline)
- [ ] Pedometer integration
- [ ] Auto-score จาก sensor → symptom log
- [ ] Offline sync queue (sqflite)

### Phase 3 — Caregiver Portal (สัปดาห์ 10–12)

- [ ] Next.js web dashboard
- [ ] Socket.IO real-time caregiver view
- [ ] Caregiver alert (FCM)
- [ ] Doctor PDF report (PDFKit)
- [ ] Deploy web ขึ้น Vercel

### Phase 4 — Polish & Deploy (สัปดาห์ 13–16)

- [ ] UI/UX pass (font size ใหญ่สำหรับผู้สูงอายุ)
- [ ] Accessibility (contrast, screen reader)
- [ ] Production deploy Railway + Vercel
- [ ] Beta test กับผู้ป่วยจริง (ถ้าทำได้)
- [ ] เขียนเอกสารโปรเจ็ก

---

## 12. External APIs & Services

| Service                            | ใช้ทำอะไร                             | Free Tier            |
| ---------------------------------- | ------------------------------------- | -------------------- |
| **Firebase Auth**                  | Google/Apple Sign-in                  | ✅ ฟรี               |
| **Firebase Cloud Messaging (FCM)** | Push Notifications ทั้ง Android + iOS | ✅ ฟรี               |
| **Railway**                        | Host Node.js backend + PostgreSQL     | ✅ ฟรี (500hr/month) |
| **Vercel**                         | Host Next.js caregiver dashboard      | ✅ ฟรี               |
| **Flutter sensors_plus**           | Accelerometer/Gyroscope ในมือถือ      | ✅ built-in          |
| **flutter_local_notifications**    | Local alarm สำหรับเตือนยา             | ✅ ฟรี               |

---

## 13. UX Design Notes

> ผู้ใช้คือผู้ป่วยพาร์กินสัน (มือสั่น, อาจมีอายุมาก) → ต้องออกแบบให้ใช้ง่ายสุดๆ

- **ตัวอักษรใหญ่** — minimum 18sp
- **ปุ่มใหญ่** — minimum 56dp height
- **Contrast สูง** — dark background / white text
- **Tap target ใหญ่** — ไม่ใช้ gesture ซับซ้อน
- **Haptic feedback** — สั่นยืนยันทุกการกด
- **Log อาการ < 30 วินาที** — ไม่เกิน 3 หน้าจอ
- **ภาษาไทยเป็นหลัก** — พร้อม i18n รองรับภาษาอื่น

---

## 14. ความแตกต่างจากแอปทั่วไป (Novelty สำหรับโครงงาน)

1. **Tremor auto-detection** จาก accelerometer แทนการกดเอง
1. **OFF period detection** โดยรวม symptom + sensor + missed dose
1. **Caregiver real-time dashboard** ผ่าน Socket.IO
1. **Offline-first** รองรับแพทย์/ผู้ป่วยในพื้นที่ที่ internet ไม่เสถียร
1. **Doctor report PDF** ที่ generate อัตโนมัติจากข้อมูลในระบบ

---

_plan.md — Parkinson Care Assistant v1.1 (Node.js Edition)_
