import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  userRole: 'PATIENT' | 'CAREGIVER' | 'DOCTOR';
  onLogout: () => void;
}

export default function Navigation({ userRole, onLogout }: NavigationProps) {
  const pathname = usePathname();

  const patientLinks = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/symptoms', label: 'บันทึกอาการ' },
    { href: '/medications', label: 'ยา' },
    { href: '/alerts', label: 'การแจ้งเตือน' },
    { href: '/sensor', label: 'Sensor' },
    { href: '/reports', label: 'รายงาน' },
  ];

  const caregiverLinks = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/caregiver', label: 'ผู้ป่วยที่ดูแล' },
    { href: '/alerts', label: 'การแจ้งเตือน' },
    { href: '/reports', label: 'รายงาน' },
  ];

  const doctorLinks = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/caregiver', label: 'ผู้ป่วย' },
    { href: '/alerts', label: 'การแจ้งเตือน' },
    { href: '/reports', label: 'รายงาน' },
  ];

  const links = userRole === 'PATIENT' ? patientLinks : userRole === 'CAREGIVER' ? caregiverLinks : doctorLinks;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === link.href
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}
