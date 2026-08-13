-- ====================================================================
-- STLPP - FIX: RLS INFINITE RECURSION ON public.users
-- ====================================================================
-- Masalah: policy "Admin Full Access Users" mengecek role admin dengan
-- query ke public.users -- tabel yang sama yang sedang diproteksi.
-- Ini menyebabkan "infinite recursion detected in policy" di Postgres.
--
-- Solusi standar Supabase: buat fungsi SECURITY DEFINER yang membaca
-- role user TANPA melewati RLS (karena fungsi ini jalan dengan hak akses
-- pembuatnya, bukan hak akses user yang query), lalu semua policy admin
-- memanggil fungsi ini alih-alih melakukan subquery langsung.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- Hapus policy lama yang menyebabkan recursion, ganti pakai is_admin()
DROP POLICY IF EXISTS "Admin Full Access Users" ON public.users;
CREATE POLICY "Admin Full Access Users" ON public.users
    FOR ALL USING (public.is_admin());

-- Sekalian samakan policy admin lainnya supaya konsisten & sedikit lebih
-- cepat (tidak subquery berulang), walau tabel ini tidak recursive:
DROP POLICY IF EXISTS "Admin Full Access Employees" ON public.employees;
CREATE POLICY "Admin Full Access Employees" ON public.employees
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access Assignments" ON public.assignments;
CREATE POLICY "Admin Full Access Assignments" ON public.assignments
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Full Access Evaluations" ON public.evaluations;
CREATE POLICY "Admin Full Access Evaluations" ON public.evaluations
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Manage Form Templates" ON public.form_templates;
CREATE POLICY "Admin Manage Form Templates" ON public.form_templates
    FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Form Templates" ON public.form_templates;
CREATE POLICY "Admin Update Form Templates" ON public.form_templates
    FOR UPDATE USING (public.is_admin());

-- Tambahan: cegah admin membuat assignment ganda untuk karyawan+periode yang sama
ALTER TABLE public.assignments
    ADD CONSTRAINT uq_assignment_employee_period UNIQUE (employee_id, period);
