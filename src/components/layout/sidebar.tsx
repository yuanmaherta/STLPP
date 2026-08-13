'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileEdit,
  BarChart3,
  UserCog,
  ClipboardCheck,
  History,
} from 'lucide-react';

// Data navigasi didefinisikan di sini (dalam Client Component), bukan dikirim
// lewat props dari layout.tsx (Server Component) — karena referensi komponen
// ikon tidak bisa diserialisasi lintas batas Server/Client di Next.js App Router.
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
  userName?: string;
}

export function Sidebar({ variant, userName }: SidebarProps) {
  const pathname = usePathname();
  const { portalLabel, userRoleLabel, items } = NAV_CONFIG[variant];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-200 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">STLPP</p>
        <p className="text-sm font-bold text-white mt-0.5">{portalLabel}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-sm font-semibold text-white truncate">{userName ?? '(belum login)'}</p>
        <p className="text-xs text-slate-500">{userRoleLabel}</p>
      </div>
    </aside>
  );
}
