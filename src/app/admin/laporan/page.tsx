import { BarChart3 } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function LaporanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laporan</h1>
      <ComingSoon
        title="Dashboard Analitik & Report"
        description="Chart distribusi kontrak, kata kunci TNA, progress bulanan, serta filter + export Excel/PDF akan tampil di sini."
        icon={BarChart3}
      />
    </div>
  );
}
