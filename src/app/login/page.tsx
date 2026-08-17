'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError('Email atau password salah.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single();

    if (!profile) {
      setError('Akun ini belum terdaftar sebagai user aplikasi. Hubungi admin HC.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push(profile.role === 'ADMIN' ? '/admin' : '/atasan');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Panel kiri — identitas brand, tersembunyi di layar kecil */}
      <div className="hidden lg:flex lg:w-[42%] bg-navy-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 15%, white 0%, transparent 40%), radial-gradient(circle at 85% 85%, white 0%, transparent 35%)' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0">
            <Image src="/hk-icon.png" alt="Hutama Karya" width={36} height={18} className="w-full h-auto object-contain" />
          </div>
          <span className="text-white font-bold font-display tracking-tight">Renewa</span>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold text-white font-display leading-tight max-w-sm">
            Evaluasi kontrak PKWT, terdokumentasi dan terukur.
          </h2>
          <p className="text-navy-300 text-sm mt-4 max-w-sm">
            Sistem digital untuk mengelola evaluasi dan perpanjangan kontrak karyawan PKWT — menggantikan proses manual berbasis dokumen.
          </p>
        </div>
        <p className="relative text-xs text-navy-400">PT Hutama Karya (Persero)</p>
      </div>

      {/* Panel kanan — form login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex justify-center mb-3">
              <Image src="/hk-logo.png" alt="Hutama Karya" width={140} height={90} className="h-auto w-[140px]" priority />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 font-display">Renewa</h1>
            <p className="text-sm text-navy-400 mt-1">
              Digital Contract Renewal Evaluation System
              <br />
              PT Hutama Karya (Persero)
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-xl font-bold text-navy-900 font-display">Selamat datang kembali</h2>
            <p className="text-sm text-navy-400 mt-1">Masuk untuk melanjutkan ke portal kamu.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-navy-100 shadow-card space-y-4">
            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <label className="block text-sm">
              <span className="block text-navy-600 mb-1 font-medium">Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-navy-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                placeholder="nama@hutamakarya.com"
              />
            </label>

            <label className="block text-sm">
              <span className="block text-navy-600 mb-1 font-medium">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-navy-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Masuk
            </button>
          </form>

          <p className="text-xs text-navy-400 text-center mt-6">
            Akun dibuat oleh Admin HC. Hubungi HC kalau belum punya akses.
          </p>
        </div>
      </div>
    </div>
  );
}
