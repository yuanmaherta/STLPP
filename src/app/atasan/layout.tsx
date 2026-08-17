import { Sidebar } from '@/components/layout/sidebar';

export default function AtasanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas print:bg-white">
      <div className="print:hidden">
        <Sidebar variant="atasan" />
      </div>
      <main className="pl-64 print:pl-0 p-6 print:p-0">{children}</main>
    </div>
  );
}
