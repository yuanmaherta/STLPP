// ====================================================================
// STLPP - SUPABASE ADMIN CLIENT (SERVER-ONLY)
// Menggunakan service_role key yang bisa bypass RLS sepenuhnya.
// JANGAN PERNAH import file ini dari Client Component ('use client')
// atau expose SUPABASE_SERVICE_ROLE_KEY dengan prefix NEXT_PUBLIC_.
// Hanya boleh dipakai di dalam Route Handler (src/app/api/**/route.ts).
// ====================================================================

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
