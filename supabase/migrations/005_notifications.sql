-- ====================================================================
-- STLPP - NOTIFICATIONS
-- Tabel notifikasi + trigger otomatis: setiap kali atasan submit
-- penilaian (insert ke evaluations), semua admin dapat notifikasi.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users Read Own Notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users Update Own Notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admin Full Access Notifications" ON public.notifications
    FOR ALL USING (public.is_admin());

-- Trigger function: setiap evaluasi baru masuk, beri tahu SEMUA admin.
-- SECURITY DEFINER supaya bisa insert notifikasi untuk user lain
-- (atasan yang submit tidak punya izin insert ke baris admin secara langsung).
CREATE OR REPLACE FUNCTION public.notify_admins_on_evaluation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
  emp_name TEXT;
  evaluator_name TEXT;
BEGIN
  SELECT e.nama, u.name INTO emp_name, evaluator_name
  FROM public.assignments a
  JOIN public.employees e ON e.id = a.employee_id
  JOIN public.users u ON u.id = a.evaluator_id
  WHERE a.id = NEW.assignment_id;

  FOR admin_id IN SELECT id FROM public.users WHERE role = 'ADMIN' LOOP
    INSERT INTO public.notifications (user_id, message, link)
    VALUES (
      admin_id,
      COALESCE(evaluator_name, 'Seorang atasan') || ' telah menyelesaikan penilaian untuk ' || COALESCE(emp_name, 'karyawan'),
      '/admin/laporan'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_on_evaluation ON public.evaluations;
CREATE TRIGGER trg_notify_admins_on_evaluation
    AFTER INSERT ON public.evaluations
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admins_on_evaluation();
