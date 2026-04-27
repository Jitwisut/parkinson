import { UserProfile as LiffUserProfile } from '@line/liff/types';

export interface UserProfile extends LiffUserProfile {
  userId: string;
}

export interface AuthTokens {
  authToken: string;
  expiresIn?: number;
}

export interface User {
  userId: string;
  role: 'PATIENT' | 'CAREGIVER' | 'DOCTOR';
  patientId?: string;
  email?: string;
}

export interface Symptom {
  id: string;
  patientId: string;
  type: string;
  severity: number;
  notes?: string;
  timestamp: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  status: 'taken' | 'skipped';
}

export interface Alert {
  id: string;
  patientId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface SensorReading {
  id: string;
  patientId: string;
  rmsValue?: number;
  steps?: number;
  distance?: number;
  timestamp: string;
}

export interface PatientStatus {
  patientId: string;
  name?: string;
  lastSymptoms?: Symptom[];
  activeMedications?: Medication[];
  pendingAlerts?: Alert[];
  complianceRate?: number;
}

export interface MonthlyReport {
  patientId: string;
  month: number;
  year: number;
  symptomSummary: Record<string, number>;
  medicationCompliance: number;
  alertCount: number;
  tremorAnalysis?: {
    averageRms: number;
    peakRms: number;
  };
  stepSummary?: {
    totalSteps: number;
    averageSteps: number;
  };
}
