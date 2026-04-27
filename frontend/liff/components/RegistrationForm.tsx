import { useState } from 'react';

interface RegistrationFormProps {
  onSubmit: (data: { firebaseUid: string; email: string; role: string; patientId?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function RegistrationForm({ onSubmit, onCancel, isLoading }: RegistrationFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'CAREGIVER' | 'DOCTOR'>('PATIENT');
  const [patientId, setPatientId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use LINE userId as firebaseUid substitute
    const firebaseUid = `line_${Date.now()}`;
    await onSubmit({ firebaseUid, email, role, patientId: role === 'PATIENT' ? patientId || undefined : undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ลงทะเบียนผู้ใช้ใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="PATIENT">ผู้ป่วย</option>
              <option value="CAREGIVER">ผู้ดูแล</option>
              <option value="DOCTOR">แพทย์</option>
            </select>
          </div>
          {role === 'PATIENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ทิ้งไว้ถ้ายังไม่มี"
              />
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
