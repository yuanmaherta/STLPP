import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden: hanya admin yang boleh mengelola user' }, { status: 403 }) };
  }

  return { user };
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await request.json();
  const { email, password, name, role } = body as {
    email?: string;
    password?: string;
    name?: string;
    role?: 'ADMIN' | 'ATASAN';
  };

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Gagal membuat akun.' }, { status: 400 });
  }

  const { error: insertError } = await admin.from('users').insert({
    id: created.user.id,
    email,
    name,
    role,
  });

  if (insertError) {
    // Rollback supaya tidak ada auth user "yatim" tanpa profil
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: created.user.id });
}
