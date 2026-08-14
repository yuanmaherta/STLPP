import Link from 'next/link';
import { History, FileCheck2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function RiwayatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, period, deadline, employee:employees(id, nama, nik, jabatan, divisi)')
    .eq('evaluator_id', user?.id ?? '')
    .eq('status', 'COMPLETED')
    .order('deadline', { ascending: false });

  const list = (assignments as any) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2 font-display">Riwayat Penilaian</h1>
      <p className="text-sm text-navy-400 mb-6">Evaluasi yang sudah kamu selesaikan. Klik untuk lihat detail / cetak ulang.</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-dashed border-navy-200">
          <div className="p-4 bg-navy-50 text-navy-300 rounded-full mb-4">
            <History className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-navy-900">Belum ada riwayat</h2>
          <p className="text-sm text-navy-400 mt-1 max-w-sm">Penilaian yang sudah kamu kirim akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((a: any) => (
            <Link
              key={a.id}
              href={`/atasan/form/${a.id}`}
              className="bg-white rounded-2xl border border-navy-100 shadow-card hover:border-blue-400 hover:shadow-card-hover transition-all p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{a.employee?.nama}</p>
                  <p className="text-xs text-navy-300">
                    {a.employee?.jabatan} — {a.employee?.divisi}
                  </p>
                </div>
              </div>
              <p className="text-xs text-navy-300">Periode: {a.period}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
