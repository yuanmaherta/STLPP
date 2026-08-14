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
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Dashboard</h1>
          <p className="text-sm text-navy-400 mt-0.5">PT Hutama Karya (Persero) — Evaluasi Perpanjangan Kontrak PKWT</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} color="indigo" label="Total Karyawan PKWT" value={totalEmployees ?? 0} />
        <StatCard icon={FileText} color="amber" label="Evaluasi Pending" value={pendingCount ?? 0} />
        <StatCard icon={CheckCircle2} color="emerald" label="Rekomendasi Lanjut" value={extendedCount ?? 0} />
        <StatCard icon={AlertCircle} color="rose" label="Tidak Diperpanjang" value={notExtendedCount ?? 0} />
      </div>

      <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-navy-900 text-sm font-display">Kontrak Akan Berakhir ({REMINDER_WINDOW_DAYS} Hari ke Depan)</h3>
        </div>
        <p className="text-xs text-navy-400 mb-4">Karyawan yang perlu segera dievaluasi/ditugaskan sebelum kontraknya habis.</p>

        {(expiringContracts?.length ?? 0) === 0 ? (
          <p className="text-sm text-navy-400 py-4 text-center">Tidak ada kontrak yang akan berakhir dalam {REMINDER_WINDOW_DAYS} hari ke depan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-navy-400 text-xs uppercase tracking-wide border-b border-navy-100">
                <tr>
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Divisi</th>
                  <th className="py-2 pr-4">Status Kontrak</th>
                  <th className="py-2 pr-4">Akhir Kontrak</th>
                  <th className="py-2">Sisa Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {(expiringContracts ?? []).map((emp: any) => {
                  const d = daysUntil(emp.tgl_habis_kontrak);
                  const urgent = d <= 14;
                  return (
                    <tr key={emp.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2 pr-4 font-medium text-navy-900">{emp.nama}</td>
                      <td className="py-2 pr-4 text-navy-500">{emp.divisi}</td>
                      <td className="py-2 pr-4 text-navy-500">{emp.status_kontrak}</td>
                      <td className="py-2 pr-4 text-navy-500">{emp.tgl_habis_kontrak}</td>
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
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-card hover:shadow-card-hover transition-shadow">
      <div className={`w-11 h-11 rounded-xl ${colorMap[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-medium text-navy-400">{label}</p>
      <p className="text-2xl font-bold text-navy-900 font-display mt-0.5">{value}</p>
    </div>
  );
}
