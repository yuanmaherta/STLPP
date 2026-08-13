import { ClipboardList } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function PenugasanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Penugasan Evaluasi</h1>
      <ComingSoon
        title="Assign Karyawan ke Atasan"
        description="Form untuk memilih karyawan, atasan penilai, dan periode evaluasi akan tampil di sini, tersambung ke tabel assignments."
        icon={ClipboardList}
      />
    </div>
  );
}
