import { Users, FileText, CheckCircle2, AlertCircle, CalendarClock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export const dynamic = 'force-dynamic';

const REMINDER_WINDOW_DAYS = 60;

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

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

  const today = new Date().toISOString().slice(0, 10);
  const windowEnd = new Date(Date.now() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: expiringContracts } = await supabase
    .from('employees')
    .select('id, nama, nik, jabatan, divisi, status_kontrak, tgl_habis_kontrak')
    .gte('tgl_habis_kontrak', today)
    .lte('tgl_habis_kontrak', windowEnd)
    .order('tgl_habis_kontrak', { ascending: true });

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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-800 text-sm">Kontrak Akan Berakhir ({REMINDER_WINDOW_DAYS} Hari ke Depan)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">Karyawan yang perlu segera dievaluasi/ditugaskan sebelum kontraknya habis.</p>

        {(expiringContracts?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Tidak ada kontrak yang akan berakhir dalam {REMINDER_WINDOW_DAYS} hari ke depan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500 text-xs uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Divisi</th>
                  <th className="py-2 pr-4">Status Kontrak</th>
                  <th className="py-2 pr-4">Akhir Kontrak</th>
                  <th className="py-2">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(expiringContracts ?? []).map((emp: any) => {
                  const d = daysUntil(emp.tgl_habis_kontrak);
                  const urgent = d <= 14;
                  return (
                    <tr key={emp.id}>
                      <td className="py-2 pr-4 font-medium text-slate-800">{emp.nama}</td>
                      <td className="py-2 pr-4 text-slate-600">{emp.divisi}</td>
                      <td className="py-2 pr-4 text-slate-600">{emp.status_kontrak}</td>
                      <td className="py-2 pr-4 text-slate-600">{emp.tgl_habis_kontrak}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            urgent ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {d} hari lagi
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
