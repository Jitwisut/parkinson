"use client";
import { useEffect, useState } from 'react';
import { caregiverApi, ApiError } from '@/lib/api';
import { PatientStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

export default function CaregiverPage() {
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<PatientStatus[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        const data = await caregiverApi.listPatients();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient?.patientId) {
      loadPatientStatus(selectedPatient.patientId);
    }
  }, [selectedPatient?.patientId]);

  const loadPatientStatus = async (patientId: string) => {
    try {
      const status = await caregiverApi.getPatientStatus(patientId);
      setSelectedPatient(status);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'CAREGIVER'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {user?.role === 'DOCTOR' ? 'จัดการผู้ป่วย' : 'ผู้ป่วยที่ดูแล'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">รายการผู้ป่วย</h2>
                {patients.length > 0 ? (
                  <ul className="space-y-2">
                    {patients.map((patient) => (
                      <li key={patient.patientId}>
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            selectedPatient?.patientId === patient.patientId
                              ? 'bg-green-50 text-green-700'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{patient.name || 'ผู้ป่วย'}</span>
                            {patient.pendingAlerts && patient.pendingAlerts.length > 0 && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                {patient.pendingAlerts.length}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">ไม่มีผู้ป่วย</p>
                )}
              </div>
            </div>

            {/* Patient Details */}
            <div className="lg:col-span-2">
              {selectedPatient ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {selectedPatient.name || 'ข้อมูลผู้ป่วย'}
                  </h2>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">ยาที่ใช้งาน</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedPatient.activeMedications?.length || 0}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">การแจ้งเตือนค้าง</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {selectedPatient.pendingAlerts?.length || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">การกินยา</p>
                      <p className="text-2xl font-bold text-green-700">
                        {selectedPatient.complianceRate ? `${selectedPatient.complianceRate}%` : '-'}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">อาการล่าสุด</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {selectedPatient.lastSymptoms?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Recent Symptoms */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">อาการล่าสุด</h3>
                    {selectedPatient.lastSymptoms && selectedPatient.lastSymptoms.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPatient.lastSymptoms.slice(0, 5).map((symptom) => (
                          <li key={symptom.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{symptom.type}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              symptom.severity >= 7 ? 'bg-red-100 text-red-700' :
                              symptom.severity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              รุนแรง {symptom.severity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">ไม่มีข้อมูล</p>
                    )}
                  </div>

                  {/* Active Medications */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">ยาที่ใช้งาน</h3>
                    {selectedPatient.activeMedications && selectedPatient.activeMedications.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPatient.activeMedications.map((med) => (
                          <li key={med.id} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">{med.name}</span>
                              <span className="text-gray-500">{med.dosage}</span>
                            </div>
                            <p className="text-gray-400 text-xs">{med.frequency}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">ไม่มีข้อมูล</p>
                    )}
                  </div>

                  {/* Pending Alerts */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">การแจ้งเตือนค้าง</h3>
                    {selectedPatient.pendingAlerts && selectedPatient.pendingAlerts.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedPatient.pendingAlerts.map((alert) => (
                          <li key={alert.id} className="border border-red-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{alert.type}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {alert.severity === 'high' ? 'สูง' : alert.severity === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                            <p className="text-gray-400 text-xs mt-2">
                              {new Date(alert.createdAt).toLocaleString('th-TH')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">ไม่มีการแจ้งเตือนค้าง</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <p className="text-gray-400 text-sm">เลือกผู้ป่วยเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
