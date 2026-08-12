-- ====================================================================
-- STLPP - DIGITAL CONTRACT RENEWAL EVALUATION SYSTEM
-- Initial Database Migration Schema
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table (Integrated with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ATASAN' CHECK (role IN ('ADMIN', 'ATASAN')),
    division VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Employees Table (Master Data Karyawan PKWT)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    tgl_lahir DATE,
    jabatan VARCHAR(100) NOT NULL,
    divisi VARCHAR(100) NOT NULL,
    bagian VARCHAR(100),
    masa_kerja VARCHAR(100),
    status_kontrak VARCHAR(50) NOT NULL DEFAULT 'Kontrak 1',
    tgl_habis_kontrak DATE NOT NULL,
    atasan_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Form Templates Table (Form Builder & Versioning)
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    structure JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Assignments Table (Penugasan Evaluasi)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('UNASSIGNED', 'PENDING', 'COMPLETED')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Evaluations Table (Hasil Penilaian Form A, B, C)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL UNIQUE REFERENCES public.assignments(id) ON DELETE CASCADE,
    template_version VARCHAR(20) NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    grand_avg DECIMAL(5,2) NOT NULL,
    recommendation VARCHAR(50) NOT NULL CHECK (recommendation IN ('DI PERPANJANG', 'TIDAK DI PERPANJANG')),
    duration VARCHAR(20),
    form_c_data JSONB DEFAULT '{}'::jsonb,
    tna_categories JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employees_tgl_habis_kontrak ON public.employees(tgl_habis_kontrak);
CREATE INDEX IF NOT EXISTS idx_assignments_evaluator_status ON public.assignments(evaluator_id, status);
CREATE INDEX IF NOT EXISTS idx_evaluations_assignment_id ON public.evaluations(assignment_id);

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Policy: Admin Full Access
CREATE POLICY "Admin Full Access Users" ON public.users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admin Full Access Employees" ON public.employees FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admin Full Access Assignments" ON public.assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Admin Full Access Evaluations" ON public.evaluations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Policy: Atasan Access Assigned Tasks Only
CREATE POLICY "Atasan Read Assigned Assignments" ON public.assignments FOR SELECT USING (
    evaluator_id = auth.uid()
);

CREATE POLICY "Atasan Manage Assigned Evaluations" ON public.evaluations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.assignments 
        WHERE assignments.id = evaluations.assignment_id 
        AND assignments.evaluator_id = auth.uid()
    )
);
