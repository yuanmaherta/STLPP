-- ====================================================================
-- STLPP - RLS PATCH
-- Menambal celah izin akses yang ditemukan pada migration 001:
--   1. form_templates belum diaktifkan RLS-nya
--   2. Atasan belum bisa membaca baris dirinya sendiri di tabel users
--   3. Atasan belum bisa membaca data employees dari assignment miliknya
-- ====================================================================

-- 1. Aktifkan RLS untuk form_templates (semua user login boleh baca,
--    karena atasan butuh struktur form untuk menampilkan form evaluasi;
--    hanya admin yang boleh membuat/mengubah versi baru)
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated Read Form Templates" ON public.form_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Manage Form Templates" ON public.form_templates
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
    );

CREATE POLICY "Admin Update Form Templates" ON public.form_templates
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 2. Atasan boleh membaca profilnya sendiri di tabel users
--    (dibutuhkan untuk menampilkan nama/role setelah login)
CREATE POLICY "Users Read Own Profile" ON public.users
    FOR SELECT USING (id = auth.uid());

-- 3. Atasan boleh membaca data employee yang menjadi assignment miliknya
--    (dibutuhkan supaya form evaluasi bisa menampilkan nama/NIK/divisi karyawan)
CREATE POLICY "Atasan Read Assigned Employees" ON public.employees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE assignments.employee_id = employees.id
            AND assignments.evaluator_id = auth.uid()
        )
    );
