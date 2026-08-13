import { Users } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function MasterKaryawanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Master Karyawan</h1>
      <ComingSoon
        title="Master Data Karyawan"
        description="Tabel CRUD karyawan PKWT (tambah, edit, import dari Excel) akan tampil di sini, tersambung ke tabel employees."
        icon={Users}
      />
    </div>
  );
}
