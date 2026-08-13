import { History } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function RiwayatPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Penilaian</h1>
      <ComingSoon
        title="Evaluasi yang Sudah Kamu Isi"
        description="Daftar evaluasi yang pernah kamu selesaikan, lengkap dengan tombol cetak ulang PDF, akan tampil di sini."
        icon={History}
      />
    </div>
  );
}
