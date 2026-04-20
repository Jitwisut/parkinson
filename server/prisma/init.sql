CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('PATIENT', 'CAREGIVER', 'DOCTOR');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MedStatus') THEN
    CREATE TYPE "MedStatus" AS ENUM ('TAKEN', 'SKIPPED', 'MISSED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "firebaseUid" TEXT UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'PATIENT',
  "fcmToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PatientCaregiver" (
  "patientId" TEXT NOT NULL,
  "caregiverId" TEXT NOT NULL,
  PRIMARY KEY ("patientId", "caregiverId"),
  CONSTRAINT "PatientCaregiver_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PatientCaregiver_caregiverId_fkey"
    FOREIGN KEY ("caregiverId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Medication" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "doseMg" DOUBLE PRECISION,
  "times" TEXT[] NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Medication_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MedicationLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "medicationId" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "takenAt" TIMESTAMP(3),
  "status" "MedStatus" NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MedicationLog_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MedicationLog_medicationId_fkey"
    FOREIGN KEY ("medicationId") REFERENCES "Medication"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SymptomLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "tremorLevel" INTEGER NOT NULL,
  "rigidityLevel" INTEGER NOT NULL,
  "walkingDifficulty" BOOLEAN NOT NULL DEFAULT FALSE,
  "freezingGait" BOOLEAN NOT NULL DEFAULT FALSE,
  "mood" INTEGER NOT NULL,
  "energyLevel" INTEGER NOT NULL,
  "note" TEXT,
  "source" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SymptomLog_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SensorReading" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "ax" DOUBLE PRECISION NOT NULL,
  "ay" DOUBLE PRECISION NOT NULL,
  "az" DOUBLE PRECISION NOT NULL,
  "rms" DOUBLE PRECISION NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SensorReading_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TremorBaseline" (
  "patientId" TEXT PRIMARY KEY,
  "rmsBaseline" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TremorBaseline_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "StepEntry" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "stepCount" INTEGER NOT NULL,
  "entryDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StepEntry_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OffAlert" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OffAlert_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "StepEntry_patientId_entryDate_key"
  ON "StepEntry" ("patientId", "entryDate");

CREATE INDEX IF NOT EXISTS "Medication_patientId_idx"
  ON "Medication" ("patientId");

CREATE INDEX IF NOT EXISTS "MedicationLog_patientId_idx"
  ON "MedicationLog" ("patientId");

CREATE INDEX IF NOT EXISTS "MedicationLog_medicationId_idx"
  ON "MedicationLog" ("medicationId");

CREATE INDEX IF NOT EXISTS "SymptomLog_patientId_idx"
  ON "SymptomLog" ("patientId");

CREATE INDEX IF NOT EXISTS "SensorReading_patientId_idx"
  ON "SensorReading" ("patientId");

CREATE INDEX IF NOT EXISTS "OffAlert_patientId_idx"
  ON "OffAlert" ("patientId");

CREATE INDEX IF NOT EXISTS "PatientCaregiver_caregiverId_idx"
  ON "PatientCaregiver" ("caregiverId");
