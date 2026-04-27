"use client";
import { useEffect, useState } from 'react';
import { reportsApi, ApiError } from '@/lib/api';
import { MonthlyReport } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    async function loadReport() {
      if (!user?.patientId) {
        setLoading(false);
        return;
      }

      try {
        const data = await reportsApi.monthly(user.patientId, month, year);
        setReport(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setReport(null);
        } else {
          setError(err instanceof ApiError ? err.message : 'โหลดรายงานไม่สำเร็จ');
        }
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [user?.patientId, month, year]);

  const handleDownloadPdf = async () => {
    if (!user?.patientId) return;

    setDownloading(true);
    setError('');

    try {
      const blob = await reportsApi.pdf(user.patientId, month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${user.patientId}-${year}-${month.toString().padStart(2, '0')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Download ไม่สำเร็จ');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">รายงานประจำเดือน</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Month Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เดือน</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>เดือน {m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[today.getFullYear() - 2, today.getFullYear() - 1, today.getFullYear()].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading || !report}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {downloading ? 'กำลัง Download...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {report ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                รายงานเดือน {month}/{year}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Symptom Summary */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>📝</span> สรุปอาการ
                  </h3>
                  {Object.entries(report.symptomSummary).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(report.symptomSummary).map(([type, count]) => (
                        <li key={type} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{type}</span>
                          <span className="font-medium text-gray-800">{count} ครั้ง</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">ไม่มีข้อมูล</p>
                  )}
                </div>

                {/* Medication Compliance */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>💊</span> การกินยา
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">อัตราการปฏิบัติตามคำสั่งแพทย์</span>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${
                        report.medicationCompliance >= 80 ? 'text-green-600' :
                        report.medicationCompliance >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {report.medicationCompliance}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        report.medicationCompliance >= 80 ? 'bg-green-600' :
                        report.medicationCompliance >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(report.medicationCompliance, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Alerts */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span>🔔</span> การแจ้งเตือน
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">จำนวนการแจ้งเตือนทั้งหมด</span>
                    <span className="text-2xl font-bold text-gray-800">{report.alertCount} ครั้ง</span>
                  </div>
                </div>

                {/* Tremor Analysis */}
                {report.tremorAnalysis && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>📊</span> วิเคราะห์การสั่น
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ค่าเฉลี่ย RMS</span>
                        <span className="font-medium text-gray-800">{report.tremorAnalysis.averageRms.toFixed(2)}</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ค่าสูงสุด RMS</span>
                        <span className="font-medium text-gray-800">{report.tremorAnalysis.peakRms.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Step Summary */}
                {report.stepSummary && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>👣</span> การเดิน
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">ก้าวทั้งหมด</span>
                        <span className="font-medium text-gray-800">{report.stepSummary.totalSteps.toLocaleString()} ก้าว</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">เฉลี่ยต่อวัน</span>
                        <span className="font-medium text-gray-800">{report.stepSummary.averageSteps.toLocaleString()} ก้าว</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-400 text-sm">ไม่มีรายงานสำหรับเดือนที่เลือก</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
