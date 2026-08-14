import { createClient } from '@/lib/supabase/server';
import { PenggunaClient } from '@/components/pengguna/pengguna-client';

export const dynamic = 'force-dynamic';

export default async function ManajemenPenggunaPage() {
  const supabase = createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, division, created_at')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6 font-display">Manajemen Pengguna</h1>
      <PenggunaClient initialUsers={users ?? []} loadError={error?.message ?? null} currentUserId={currentUser?.id ?? ''} />
    </div>
  );
}
