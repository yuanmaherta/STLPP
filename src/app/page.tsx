// Middleware (src/middleware.ts) yang menangani redirect halaman ini:
// - Belum login -> /login
// - Sudah login sebagai ADMIN -> /admin
// - Sudah login sebagai ATASAN -> /atasan
// Konten di bawah ini praktis tidak pernah terlihat user, hanya fallback.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center">
      <p className="text-sm text-navy-300">Mengalihkan...</p>
    </div>
  );
}
