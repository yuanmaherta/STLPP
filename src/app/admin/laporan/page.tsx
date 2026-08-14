import { createClient } from '@/lib/supabase/server';
import { LaporanClient } from '@/components/laporan/laporan-client';

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  const supabase = createClient();

  const { data: rows, error } = await supabase
    .from('evaluations')
    .select(
      'id, scores, grand_avg, recommendation, duration, form_c_data, submitted_at, assignment:assignments(id, period, employee:employees(id, nik, nama, jabatan, divisi, bagian, masa_kerja, tgl_lahir, tgl_habis_kontrak), evaluator:users(name))'
    )
    .order('submitted_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6 font-display">Laporan</h1>
      <LaporanClient initialRows={(rows as any) ?? []} loadError={error?.message ?? null} />
    </div>
  );
}
