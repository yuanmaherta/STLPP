'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { topKeywords } from '@/lib/utils/text-analysis';

interface DashboardChartsProps {
  employees: Array<{ status_kontrak: string }>;
  assignments: Array<{ period: string; status: string }>;
  evaluations: Array<{ form_c_data: any }>;
}

const BAR_COLOR = '#2563eb';
const BAR_COLOR_2 = '#10b981';

export function DashboardCharts({ employees, assignments, evaluations }: DashboardChartsProps) {
  const kontrakData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of employees) {
      const key = e.status_kontrak?.trim() || 'Tidak diketahui';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, jumlah]) => ({ name, jumlah }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [employees]);

  const progressData = useMemo(() => {
    const byPeriod = new Map<string, { total: number; selesai: number }>();
    for (const a of assignments) {
      const key = a.period || '-';
      const cur = byPeriod.get(key) ?? { total: 0, selesai: 0 };
      cur.total += 1;
      if (a.status === 'COMPLETED') cur.selesai += 1;
      byPeriod.set(key, cur);
    }
    return Array.from(byPeriod.entries()).map(([period, v]) => ({ period, Target: v.total, Selesai: v.selesai }));
  }, [assignments]);

  const keywordData = useMemo(() => {
    const texts = evaluations.flatMap((e) => [e.form_c_data?.saranPengembangan, e.form_c_data?.kesanUmum]);
    return topKeywords(texts, 8).map((k) => ({ name: k.word, jumlah: k.count }));
  }, [evaluations]);

  return (
    <div className="grid lg:grid-cols-2 gap-4 mb-8">
      <div className="bg-white rounded-xl border border-navy-100 shadow-card p-5">
        <h3 className="font-bold text-navy-900 text-sm mb-1">Distribusi Status Kontrak</h3>
        <p className="text-xs text-navy-300 mb-4">Jumlah karyawan per status kontrak (Kontrak 1, 2, dst.)</p>
        {kontrakData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kontrakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="jumlah" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-navy-100 shadow-card p-5">
        <h3 className="font-bold text-navy-900 text-sm mb-1">Progress Penilaian per Periode</h3>
        <p className="text-xs text-navy-300 mb-4">Target penugasan vs yang sudah selesai dinilai</p>
        {progressData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Selesai" fill={BAR_COLOR_2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-navy-100 shadow-card p-5 lg:col-span-2">
        <h3 className="font-bold text-navy-900 text-sm mb-1">Kata Kunci Tersering — Saran &amp; Pengembangan</h3>
        <p className="text-xs text-navy-300 mb-4">Diambil dari kolom "Saran &amp; Pengembangan" dan "Kesan-kesan Umum" semua evaluasi yang masuk</p>
        {keywordData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, keywordData.length * 32)}>
            <BarChart data={keywordData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-40 flex items-center justify-center text-sm text-navy-300">Belum ada data untuk ditampilkan.</div>;
}
