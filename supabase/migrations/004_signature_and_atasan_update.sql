-- ====================================================================
-- STLPP - ADD SIGNATURE DATA + ALLOW ATASAN TO COMPLETE OWN ASSIGNMENT
-- ====================================================================

-- Simpan info tanda tangan (tempat/tanggal, nama+jabatan penilai, BOD 1
-- opsional) sebagai JSONB terpisah dari form_c_data supaya rapi.
ALTER TABLE public.evaluations
    ADD COLUMN IF NOT EXISTS signature_data JSONB DEFAULT '{}'::jsonb;

-- Sebelumnya atasan cuma bisa SELECT assignment miliknya (lihat), tapi
-- tidak bisa UPDATE status jadi 'COMPLETED' setelah submit form. Tambah
-- policy UPDATE khusus untuk assignment miliknya sendiri.
CREATE POLICY "Atasan Update Own Assignment" ON public.assignments
    FOR UPDATE USING (evaluator_id = auth.uid());
