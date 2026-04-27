"use client";
import { useEffect, useState } from 'react';
import { symptomsApi, medicationsApi, alertsApi, ApiError } from '@/lib/api';
import { Symptom, Medication, Alert } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user?.patientId) {
        setError('ไม่พบข้อมูลผู้ป่วย');
        setLoading(false);
        return;
      }

      try {
        const [symptomsData, medicationsData, alertsData] = await Promise.all([
          symptomsApi.list(user.patientId).catch(() => []),
          medicationsApi.list(user.patientId).catch(() => []),
          alertsApi.list(user.patientId).catch(() => []),
        ]);
        setSymptoms(symptomsData);
        setMedications(medicationsData);
        setAlerts(alertsData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.patientId]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Symptoms Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">อาการล่าสุด</h2>
                <span className="text-sm text-gray-500">{symptoms.length} รายการ</span>
              </div>
              {symptoms.length > 0 ? (
                <ul className="space-y-2">
                  {symptoms.slice(0, 3).map((symptom) => (
                    <li key={symptom.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{symptom.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          symptom.severity >= 7 ? 'bg-red-100 text-red-700' :
                          symptom.severity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          รุนแรง {symptom.severity}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(symptom.timestamp).toLocaleString('th-TH')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">ยังไม่มีข้อมูลอาการ</p>
              )}
            </div>

            {/* Medications Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">ยาที่ใช้งาน</h2>
                <span className="text-sm text-gray-500">{medications.filter(m => m.isActive).length} รายการ</span>
              </div>
              {medications.filter(m => m.isActive).length > 0 ? (
                <ul className="space-y-2">
                  {medications.filter(m => m.isActive).slice(0, 3).map((med) => (
                    <li key={med.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{med.name}</span>
                        <span className="text-gray-400 text-xs">{med.dosage}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{med.frequency}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">ยังไม่มีข้อมูลยา</p>
              )}
            </div>

            {/* Alerts Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">การแจ้งเตือน</h2>
                <span className="text-sm text-gray-500">{alerts.filter(a => !a.isResolved).length} ค้าง</span>
              </div>
              {alerts.filter(a => !a.isResolved).length > 0 ? (
                <ul className="space-y-2">
                  {alerts.filter(a => !a.isResolved).slice(0, 3).map((alert) => (
                    <li key={alert.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{alert.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {alert.severity === 'high' ? 'สูง' : alert.severity === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 truncate">{alert.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">ไม่มีการแจ้งเตือนค้าง</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูด่วน</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/symptoms" className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-center transition-colors">
                <span className="text-2xl">📝</span>
                <p className="text-sm text-gray-700 mt-2">บันทึกอาการ</p>
              </a>
              <a href="/medications" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors">
                <span className="text-2xl">💊</span>
                <p className="text-sm text-gray-700 mt-2">จัดการยา</p>
              </a>
              <a href="/reports" className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors">
                <span className="text-2xl">📊</span>
                <p className="text-sm text-gray-700 mt-2">ดูรายงาน</p>
              </a>
              <a href="/" className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-center transition-colors">
                <span className="text-2xl">🤖</span>
                <p className="text-sm text-gray-700 mt-2">ถาม AI</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
