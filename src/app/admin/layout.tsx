import { Sidebar } from '@/components/layout/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas print:block print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden shrink-0">
        <Sidebar variant="admin" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-screen print:h-auto">
        <header className="print:hidden shrink-0 flex justify-end items-center px-6 py-3 bg-white border-b border-navy-100">
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 print:p-0 print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
