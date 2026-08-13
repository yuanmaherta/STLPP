import { createClient } from '@/lib/supabase/server';
import { PenugasanClient } from '@/components/penugasan/penugasan-client';

export const dynamic = 'force-dynamic';

export default async function PenugasanPage() {
  const supabase = createClient();

  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select(
      'id, period, deadline, status, assigned_at, employee:employees(id, nama, nik, jabatan, divisi), evaluator:users(id, name, email)'
    )
    .order('assigned_at', { ascending: false });

  const { data: employees } = await supabase
    .from('employees')
    .select('id, nama, nik, jabatan, divisi')
    .order('nama', { ascending: true });

  const { data: atasanList } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'ATASAN')
    .order('name', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Penugasan Evaluasi</h1>
      <PenugasanClient
        initialAssignments={(assignments as any) ?? []}
        employees={employees ?? []}
        atasanList={atasanList ?? []}
        loadError={assignError?.message ?? null}
      />
    </div>
  );
}
