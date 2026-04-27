"use client";
import { useEffect, useState } from 'react';
import { medicationsApi, ApiError } from '@/lib/api';
import { Medication, MedicationLog } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

export default function MedicationsPage() {
  const { user, logout } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user?.patientId) {
        setLoading(false);
        return;
      }

      try {
        const [medsData, logsData] = await Promise.all([
          medicationsApi.list(user.patientId).catch(() => []),
          medicationsApi.logs(user.patientId).catch(() => []),
        ]);
        setMedications(medsData);
        setLogs(logsData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId) return;

    setSubmitting(true);
    setError('');

    try {
      if (editingMed) {
        const updated = await medicationsApi.update(editingMed.id, { name, dosage, frequency });
        setMedications(medications.map(m => m.id === editingMed.id ? updated : m));
        setEditingMed(null);
      } else {
        const newMed = await medicationsApi.create(user.patientId, { name, dosage, frequency });
        setMedications([...medications, newMed]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setShowAddForm(false);
    setEditingMed(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบยานี้หรือไม่?')) return;

    try {
      await medicationsApi.delete(id);
      setMedications(medications.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ');
    }
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setShowAddForm(true);
  };

  const handleLog = async (medId: string, status: 'taken' | 'skipped') => {
    try {
      await medicationsApi.log(medId, { takenAt: new Date().toISOString(), status });
      const newLogs = await medicationsApi.logs(user!.patientId!);
      setLogs(newLogs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">จัดการยา</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + เพิ่มยา
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {editingMed ? 'แก้ไขยา' : 'เพิ่มยาใหม่'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อยา</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="เช่น Levodopa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ขนาด</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="เช่น 250mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ความถี่</label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'กำลังบันทึก...' : editingMed ? 'แก้ไข' : 'เพิ่ม'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Medications List */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">รายการยา</h2>
            {medications.length > 0 ? (
              <ul className="space-y-4">
                {medications.map((med) => (
                  <li key={med.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{med.name}</h3>
                          {!med.isActive && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">หยุดใช้</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{med.dosage}</p>
                        <p className="text-gray-500 text-sm">{med.frequency}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(med)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                    {med.isActive && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleLog(med.id, 'taken')}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
                        >
                          ✓ กินแล้ว
                        </button>
                        <button
                          onClick={() => handleLog(med.id, 'skipped')}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium"
                        >
                          ✕ ข้าม
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีข้อมูลยา</p>
            )}
          </div>

          {/* Logs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ประวัติการกินยา</h2>
            {logs.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {logs.slice(0, 20).map((log) => {
                  const med = medications.find(m => m.id === log.medicationId);
                  return (
                    <li key={log.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{med?.name || 'ยาที่ถูกลบ'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          log.status === 'taken' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status === 'taken' ? 'กินแล้ว' : 'ข้าม'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(log.takenAt).toLocaleString('th-TH')}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีประวัติ</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
