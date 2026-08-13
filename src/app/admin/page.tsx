import { Users, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [{ count: totalEmployees }, { count: pendingCount }, { count: extendedCount }, { count: notExtendedCount }] =
    await Promise.all([
      supabase.from('employees').select('*', { count: 'exact', head: true }),
      supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('recommendation', 'DI PERPANJANG'),
      supabase.from('evaluations').select('*', { count: 'exact', head: true }).eq('recommendation', 'TIDAK DI PERPANJANG'),
    ]);

  const { data: employees } = await supabase.from('employees').select('status_kontrak');
  const { data: assignments } = await supabase.from('assignments').select('period, status');
  const { data: evaluations } = await supabase.from('evaluations').select('form_c_data');

  return (
    <div>
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin HC</h1>
        <p className="text-sm text-slate-500 mt-1">PT Hutama Karya (Persero) — Portal Evaluasi Perpanjangan Kontrak PKWT</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} color="blue" label="Total Karyawan PKWT" value={totalEmployees ?? 0} />
        <StatCard icon={FileText} color="amber" label="Evaluasi Pending" value={pendingCount ?? 0} />
        <StatCard icon={CheckCircle2} color="emerald" label="Rekomendasi Lanjut" value={extendedCount ?? 0} />
        <StatCard icon={AlertCircle} color="rose" label="Tidak Diperpanjang" value={notExtendedCount ?? 0} />
      </div>

      <DashboardCharts employees={employees ?? []} assignments={assignments ?? []} evaluations={evaluations ?? []} />
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }: { icon: any; color: string; label: string; value: number }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
