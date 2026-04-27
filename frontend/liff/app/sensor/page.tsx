"use client";
import { useEffect, useState } from 'react';
import { sensorApi, ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';

interface TremorData {
  rmsValue: number;
  duration: number;
  timestamp: string;
}

interface StepData {
  steps: number;
  distance?: number;
  timestamp: string;
}

export default function SensorPage() {
  const { user, logout } = useAuth();
  const [baseline, setBaseline] = useState<{ rmsBaseline: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tremor form
  const [rmsValue, setRmsValue] = useState('');
  const [duration, setDuration] = useState('');

  // Steps form
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');

  useEffect(() => {
    async function loadBaseline() {
      if (!user?.patientId) {
        setLoading(false);
        return;
      }

      try {
        const data = await sensorApi.getBaseline(user.patientId);
        setBaseline(data);
      } catch (err) {
        // Baseline might not exist yet
        console.error('Load baseline error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBaseline();
  }, [user?.patientId]);

  const handleTremorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId || !rmsValue || !duration) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data: TremorData = {
        rmsValue: parseFloat(rmsValue),
        duration: parseFloat(duration),
        timestamp: new Date().toISOString(),
      };
      await sensorApi.submitTremor(user.patientId, data);
      setSuccess('บันทึกข้อมูลการสั่นสำเร็จ');
      setRmsValue('');
      setDuration('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBaselineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId || !rmsValue) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await sensorApi.setBaseline(user.patientId, parseFloat(rmsValue));
      const data = await sensorApi.getBaseline(user.patientId);
      setBaseline(data);
      setSuccess('ตั้งค่า baseline สำเร็จ');
      setRmsValue('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId || !steps) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data: StepData = {
        steps: parseInt(steps),
        distance: distance ? parseFloat(distance) : undefined,
        timestamp: new Date().toISOString(),
      };
      await sensorApi.submitSteps(user.patientId, data);
      setSuccess('บันทึกข้อมูลก้าวเดินสำเร็จ');
      setSteps('');
      setDistance('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navigation userRole={user?.role || 'PATIENT'} onLogout={logout} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูล Sensor</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tremor Reading */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">บันทึกข้อมูลการสั่น</h2>
              <form onSubmit={handleTremorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ค่า RMS (Root Mean Square)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rmsValue}
                    onChange={(e) => setRmsValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ระยะเวลา (วินาที)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </form>
            </div>

            {/* Baseline Setting */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">ตั้งค่า Baseline</h2>
              {baseline && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Baseline ปัจจุบัน</p>
                  <p className="text-xl font-bold text-blue-700">{baseline.rmsBaseline.toFixed(2)}</p>
                </div>
              )}
              <form onSubmit={handleBaselineSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ค่า RMS Baseline
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rmsValue}
                    onChange={(e) => setRmsValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'ตั้งค่า Baseline'}
                </button>
              </form>
            </div>

            {/* Steps Reading */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">บันทึกข้อมูลก้าวเดิน</h2>
              <form onSubmit={handleStepsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนก้าว
                    </label>
                    <input
                      type="number"
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระยะทาง (กม.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.80"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-2">💡 เคล็ดลับ</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ค่า RMS ที่สูงกว่า baseline อาจหมายถึงอาการสั่นที่รุนแรงขึ้น</li>
              <li>• ควรวัดค่า baseline ในช่วงที่อาการสงบเพื่อเปรียบเทียบ</li>
              <li>• บันทึกข้อมูลก้าวเดินเป็นประจำเพื่อติดตามกิจกรรมประจำวัน</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
