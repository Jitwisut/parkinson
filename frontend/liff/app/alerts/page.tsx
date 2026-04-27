"use client";
import { useEffect, useState } from 'react';
import { alertsApi, ApiError } from '@/lib/api';
import { Alert } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

export default function AlertsPage() {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [resolveNote, setResolveNote] = useState('');
  const [resolvingAlert, setResolvingAlert] = useState<Alert | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.patientId) {
        setLoading(false);
        return;
      }

      try {
        const [alertsData, historyData] = await Promise.all([
          alertsApi.list(user.patientId).catch(() => []),
          alertsApi.history(user.patientId).catch(() => []),
        ]);
        setAlerts(alertsData);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.patientId]);

  const handleResolve = async (alert: Alert, resolved: boolean) => {
    if (!user?.patientId) return;

    setSubmitting(true);
    setError('');

    try {
      await alertsApi.resolve(alert.id, resolved, resolveNote || undefined);
      setAlerts(alerts.filter(a => a.id !== alert.id));
      setHistory([alert, ...history]);
      setResolvingAlert(null);
      setResolveNote('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'อัพเดทไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return { label: 'สูง', class: 'bg-red-100 text-red-700' };
      case 'medium': return { label: 'ปานกลาง', class: 'bg-yellow-100 text-yellow-700' };
      case 'low': return { label: 'ต่ำ', class: 'bg-green-100 text-green-700' };
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">การแจ้งเตือน</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              ค้างจัดการ ({alerts.filter(a => !a.isResolved).length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              ประวัติ ({history.length})
            </button>
          </div>

          {/* Active Alerts */}
          {activeTab === 'active' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {alerts.filter(a => !a.isResolved).length > 0 ? (
                <ul className="space-y-4">
                  {alerts.filter(a => !a.isResolved).map((alert) => (
                    <li key={alert.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">{alert.type}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityLabel(alert.severity).class}`}>
                              {getSeverityLabel(alert.severity).label}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{alert.message}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {new Date(alert.createdAt).toLocaleString('th-TH')}
                          </p>
                        </div>
                        <button
                          onClick={() => setResolvingAlert(alert)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          แก้ไขแล้ว
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="text-gray-500">ไม่มีการแจ้งเตือนค้าง</p>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {history.length > 0 ? (
                <ul className="space-y-3">
                  {history.slice(0, 50).map((alert) => (
                    <li key={alert.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{alert.type}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityLabel(alert.severity).class}`}>
                              {getSeverityLabel(alert.severity).label}
                            </span>
                            {alert.isResolved && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">แก้ไขแล้ว</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">
                            {new Date(alert.createdAt).toLocaleDateString('th-TH')}
                          </p>
                          {alert.resolvedAt && (
                            <p className="text-green-600 text-xs">
                              {new Date(alert.resolvedAt).toLocaleDateString('th-TH')}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">ไม่มีประวัติ</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการแก้ไข</h2>
            <p className="text-gray-600 mb-4">
              คุณต้องการ marked การแจ้งเตือนนี้ว่าแก้ไขแล้วหรือไม่?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุ (ถ้ามี)
              </label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="รายละเอียดเพิ่มเติม"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setResolvingAlert(null);
                  setResolveNote('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleResolve(resolvingAlert, true)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
