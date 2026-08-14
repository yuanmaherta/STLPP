import Link from 'next/link';
import { ClipboardCheck, CalendarClock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TugasPenilaianPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, period, deadline, status, employee:employees(id, nama, nik, jabatan, divisi)')
    .eq('evaluator_id', user?.id ?? '')
    .eq('status', 'PENDING')
    .order('deadline', { ascending: true });

  const list = (assignments as any) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2 font-display">Tugas Penilaian Saya</h1>
      <p className="text-sm text-navy-400 mb-6">Karyawan yang perlu kamu evaluasi. Klik untuk mulai mengisi form.</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-xl border border-dashed border-navy-200">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full mb-4">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-navy-900">Tidak ada tugas penilaian saat ini</h2>
          <p className="text-sm text-navy-400 mt-1 max-w-sm">
            Kalau admin HC menugaskan karyawan baru untuk kamu nilai, akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((a: any) => (
            <Link
              key={a.id}
              href={`/atasan/form/${a.id}`}
              className="bg-white rounded-2xl border border-navy-100 shadow-card hover:border-blue-400 hover:shadow-card-hover transition-all p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-navy-900">{a.employee?.nama}</p>
                <p className="text-xs text-navy-300">
                  {a.employee?.jabatan} — {a.employee?.divisi}
                </p>
                <p className="text-xs text-navy-300 mt-1">NIK: {a.employee?.nik}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-1">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Deadline: {a.deadline}
                </div>
                <p className="text-xs text-navy-300">Periode: {a.period}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
