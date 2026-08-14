import { createClient } from '@/lib/supabase/server';
import { KaryawanClient } from '@/components/karyawan/karyawan-client';

export const dynamic = 'force-dynamic';

export default async function MasterKaryawanPage() {
  const supabase = createClient();

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('nama', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6 font-display">Master Karyawan</h1>
      <KaryawanClient initialEmployees={employees ?? []} loadError={error?.message ?? null} />
    </div>
  );
}
