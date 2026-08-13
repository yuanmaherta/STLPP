import { ClipboardCheck } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function TugasPenilaianPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tugas Penilaian Saya</h1>
      <ComingSoon
        title="Daftar Karyawan yang Perlu Dinilai"
        description="Karyawan yang di-assign admin ke kamu untuk dievaluasi akan muncul di sini, tersambung ke tabel assignments (terfilter otomatis lewat RLS)."
        icon={ClipboardCheck}
      />
    </div>
  );
}
