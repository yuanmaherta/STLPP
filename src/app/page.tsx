import Link from 'next/link';
import { ShieldCheck, ClipboardCheck } from 'lucide-react';

// Halaman ini sementara — nanti diganti dengan halaman login yang otomatis
// redirect ke /admin atau /atasan sesuai role, begitu autentikasi selesai dibuat.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800">STLPP</h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Digital Contract Renewal Evaluation System — PT Hutama Karya (Persero)
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Portal Admin HC</p>
              <p className="text-xs text-slate-500">Dashboard, master data, penugasan, laporan</p>
            </div>
          </Link>

          <Link
            href="/atasan"
            className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left"
          >
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Portal Atasan</p>
              <p className="text-xs text-slate-500">Tugas penilaian & riwayat evaluasi</p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Sementara: belum ada login. Halaman ini akan diganti begitu autentikasi dibuat.
        </p>
      </div>
    </div>
  );
}
