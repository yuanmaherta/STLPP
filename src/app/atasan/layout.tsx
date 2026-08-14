import { Sidebar } from '@/components/layout/sidebar';

export default function AtasanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas print:block print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden shrink-0">
        <Sidebar variant="atasan" />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 print:p-0 print:overflow-visible">{children}</main>
    </div>
  );
}
