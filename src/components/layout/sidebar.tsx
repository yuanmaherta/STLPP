'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileEdit,
  BarChart3,
  UserCog,
  ClipboardCheck,
  History,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_CONFIG = {
  admin: {
    portalLabel: 'Portal Admin HC',
    userRoleLabel: 'Admin',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/karyawan', label: 'Master Karyawan', icon: Users },
      { href: '/admin/penugasan', label: 'Penugasan', icon: ClipboardList },
      { href: '/admin/template', label: 'Template Form', icon: FileEdit },
      { href: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
      { href: '/admin/pengguna', label: 'Manajemen Pengguna', icon: UserCog },
    ],
  },
  atasan: {
    portalLabel: 'Portal Atasan',
    userRoleLabel: 'Atasan / Evaluator',
    items: [
      { href: '/atasan', label: 'Tugas Penilaian', icon: ClipboardCheck },
      { href: '/atasan/riwayat', label: 'Riwayat', icon: History },
    ],
  },
} as const;

interface SidebarProps {
  variant: keyof typeof NAV_CONFIG;
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { portalLabel, userRoleLabel, items } = NAV_CONFIG[variant];

  const [userName, setUserName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('users')
          .select('name')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => setUserName(profile?.name ?? data.user!.email ?? null));
      }
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initial = (userName ?? '?').trim().charAt(0).toUpperCase();

  return (
    <aside className="w-64 shrink-0 bg-navy-900 text-navy-100 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1">
          <Image src="/hk-icon.png" alt="Hutama Karya" width={28} height={14} className="w-full h-auto object-contain" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-navy-300 font-semibold font-display">STLPP</p>
          <p className="text-sm font-bold text-white -mt-0.5 font-display">{portalLabel}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/[0.07] text-white' : 'text-navy-200 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <span
                className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold-500 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                }`}
              />
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-400' : 'text-navy-300 group-hover:text-gold-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-navy-700 border border-white/10 flex items-center justify-center text-xs font-bold text-gold-300 font-display shrink-0">
          {userName ? initial : ''}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{userName ?? 'Memuat...'}</p>
          <p className="text-xs text-navy-300">{userRoleLabel}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Keluar"
          className="text-navy-300 hover:text-white transition-colors disabled:opacity-50 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
