"use client";
import { useEffect, useState } from 'react';
import { symptomsApi, ApiError } from '@/lib/api';
import { Symptom } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

const SYMPTOM_TYPES = [
  'สั่น',
  'เกร็ง',
  'เคลื่อนไหวช้า',
  'การเดินผิดปกติ',
  'เสียงเบา',
  'มือสั่น',
  'อื่นๆ'
];

export default function SymptomsPage() {
  const { user, logout } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadSymptoms() {
      if (!user?.patientId) {
        setLoading(false);
        return;
      }

      try {
        const data = await symptomsApi.list(user.patientId, { limit: 50 });
        setSymptoms(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }

    loadSymptoms();
  }, [user?.patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId || !symptomType) return;

    setSubmitting(true);
    setError('');

    try {
      const newSymptom = await symptomsApi.create(user.patientId, {
        type: symptomType,
        severity,
        notes: notes || undefined,
        timestamp: new Date().toISOString(),
      });
      setSymptoms([newSymptom, ...symptoms]);
      setSymptomType('');
      setSeverity(5);
      setNotes('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!user?.patientId) return;

    setSubmitting(true);
    setError('');

    try {
      // Create sample bulk data (for demo - in real app, this would be from sensor data)
      const items = SYMPTOM_TYPES.slice(0, 3).map(type => ({
        type,
        severity: Math.floor(Math.random() * 10) + 1,
        notes: 'บันทึกอัตโนมัติ',
        timestamp: new Date().toISOString(),
      }));

      await symptomsApi.bulkCreate(user.patientId, items);
      const data = await symptomsApi.list(user.patientId, { limit: 50 });
      setSymptoms(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!user?.patientId) return;

    try {
      const blob = await symptomsApi.exportCsv(user.patientId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `symptoms-${user.patientId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Export ไม่สำเร็จ');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">บันทึกอาการ</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">บันทึกอาการใหม่</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทอาการ</label>
                <select
                  value={symptomType}
                  onChange={(e) => setSymptomType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">เลือกอาการ</option>
                  {SYMPTOM_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความรุนแรง: {severity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>เบา</span>
                  <span>ปานกลาง</span>
                  <span>รุนแรง</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !symptomType}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  บันทึกชุด
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">ประวัติอาการ</h2>
              <button
                onClick={handleExport}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Export CSV
              </button>
            </div>
            {symptoms.length > 0 ? (
              <ul className="space-y-3">
                {symptoms.map((symptom) => (
                  <li key={symptom.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{symptom.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        symptom.severity >= 7 ? 'bg-red-100 text-red-700' :
                        symptom.severity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        รุนแรง {symptom.severity}
                      </span>
                    </div>
                    {symptom.notes && (
                      <p className="text-gray-600 text-sm mt-1">{symptom.notes}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(symptom.timestamp).toLocaleString('th-TH')}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีข้อมูลอาการ</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
