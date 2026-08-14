import { Sidebar } from '@/components/layout/sidebar';

export default function AtasanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas print:block print:bg-white">
      <div className="print:hidden">
        <Sidebar variant="atasan" />
      </div>
      <main className="flex-1 p-6 overflow-x-hidden print:p-0">{children}</main>
    </div>
  );
}
