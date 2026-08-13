// Middleware (src/middleware.ts) yang menangani redirect halaman ini:
// - Belum login -> /login
// - Sudah login sebagai ADMIN -> /admin
// - Sudah login sebagai ATASAN -> /atasan
// Konten di bawah ini praktis tidak pernah terlihat user, hanya fallback.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <p className="text-sm text-slate-400">Mengalihkan...</p>
    </div>
  );
}
