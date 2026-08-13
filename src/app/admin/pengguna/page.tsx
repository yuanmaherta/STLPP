import { UserCog } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export default function ManajemenPenggunaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manajemen Pengguna</h1>
      <ComingSoon
        title="Kelola Akun Atasan"
        description="Admin bisa membuat akun atasan baru dan mengatur perannya di sini, tersambung ke Supabase Auth + tabel users."
        icon={UserCog}
      />
    </div>
  );
}
