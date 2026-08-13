import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

async function getRole(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single();
  return data?.role ?? null;
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path === '/' || path.startsWith('/admin') || path.startsWith('/atasan');

  // Belum login, coba akses halaman terproteksi -> lempar ke /login
  if (!user) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Sudah login: tentukan role-nya
  const role = await getRole(supabase, user.id);

  // Sudah login tapi buka /login atau / -> lempar ke portal sesuai role
  if (path === '/login' || path === '/') {
    return NextResponse.redirect(new URL(role === 'ADMIN' ? '/admin' : '/atasan', request.url));
  }

  // Cegah atasan membuka halaman admin, dan sebaliknya
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/atasan', request.url));
  }
  if (path.startsWith('/atasan') && role !== 'ATASAN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
