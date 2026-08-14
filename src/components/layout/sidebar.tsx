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
  Settings,
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
    <aside className="w-64 shrink-0 bg-white border-r border-navy-100 min-h-screen flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="shrink-0 w-9 h-9 flex items-center justify-center">
          <Image src="/hk-icon.png" alt="Hutama Karya" width={32} height={16} className="w-full h-auto object-contain" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-navy-400 font-semibold font-display">STLPP</p>
          <p className="text-sm font-bold text-navy-900 -mt-0.5 font-display">{portalLabel}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-navy-900 text-white shadow-card' : 'text-navy-500 hover:bg-navy-50 hover:text-navy-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-navy-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 bg-navy-50 rounded-xl p-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white font-display shrink-0">
            {userName ? initial : ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy-900 truncate">{userName ?? 'Memuat...'}</p>
            <p className="text-xs text-navy-400">{userRoleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Keluar"
            className="text-navy-400 hover:text-navy-900 transition-colors disabled:opacity-50 shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
