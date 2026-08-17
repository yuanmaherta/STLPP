import { Sidebar } from '@/components/layout/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas print:bg-white">
      <div className="print:hidden">
        <Sidebar variant="admin" />
      </div>
      <div className="pl-64 print:pl-0">
        <header className="print:hidden sticky top-0 z-10 flex justify-end items-center px-6 py-3 bg-white border-b border-navy-100">
          <NotificationBell />
        </header>
        <main className="p-6 print:p-0">{children}</main>
      </div>
    </div>
  );
}
