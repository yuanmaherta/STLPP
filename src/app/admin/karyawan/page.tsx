import { createClient } from '@/lib/supabase/server';
import { KaryawanClient } from '@/components/karyawan/karyawan-client';

export const dynamic = 'force-dynamic';

export default async function MasterKaryawanPage() {
  const supabase = createClient();

  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .order('nama', { ascending: true });

  const { data: atasanList, error: atasanError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'ATASAN')
    .order('name', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Master Karyawan</h1>
      <KaryawanClient
        initialEmployees={employees ?? []}
        atasanList={atasanList ?? []}
        loadError={employeesError?.message ?? atasanError?.message ?? null}
      />
    </div>
  );
}
