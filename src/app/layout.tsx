import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Renewa - Digital Contract Renewal Evaluation System',
  description: 'Sistem Evaluasi Perpanjangan Kontrak Karyawan PKWT - PT Hutama Karya (Persero)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-canvas text-navy-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
