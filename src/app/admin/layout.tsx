import { Sidebar } from '@/components/layout/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100 print:block print:bg-white">
      <div className="print:hidden">
        <Sidebar variant="admin" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="print:hidden flex justify-end items-center px-6 py-3 bg-white border-b border-slate-200">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-x-hidden print:p-0">{children}</main>
      </div>
    </div>
  );
}
