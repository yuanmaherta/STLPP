import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar variant="admin" />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
