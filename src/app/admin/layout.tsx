import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100 print:block print:bg-white">
      <div className="print:hidden">
        <Sidebar variant="admin" />
      </div>
      <main className="flex-1 p-6 overflow-x-hidden print:p-0">{children}</main>
    </div>
  );
}
