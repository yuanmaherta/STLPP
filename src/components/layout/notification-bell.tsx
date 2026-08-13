'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Notif {
  id: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifs(data ?? []);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  const handleClick = async (n: Notif) => {
    setOpen(false);
    if (!n.is_read) {
      const supabase = createClient();
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
    if (n.link) router.push(n.link);
  };

  const markAllRead = async () => {
    const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifs((prev) => prev.map((x) => ({ ...x, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white">
              <span className="font-semibold text-sm text-slate-800">Notifikasi</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                  Tandai semua dibaca
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">Belum ada notifikasi.</div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 text-sm transition-colors ${
                    !n.is_read ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <p className={`text-slate-700 ${!n.is_read ? 'font-semibold' : ''}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
