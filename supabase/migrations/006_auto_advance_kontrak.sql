-- ====================================================================
-- STLPP - AUTO-ADVANCE STATUS KONTRAK
-- Setiap kali evaluasi baru masuk dengan rekomendasi 'DI PERPANJANG',
-- status_kontrak karyawan di master data otomatis naik satu tingkat
-- (Kontrak I -> II -> III -> IV -> V). Kontrak V adalah maksimal,
-- tidak naik lagi setelah itu.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.advance_contract_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_id UUID;
  current_status TEXT;
  new_status TEXT;
BEGIN
  IF NEW.recommendation = 'DI PERPANJANG' THEN
    SELECT a.employee_id INTO emp_id FROM public.assignments a WHERE a.id = NEW.assignment_id;
    SELECT status_kontrak INTO current_status FROM public.employees WHERE id = emp_id;

    new_status := CASE current_status
      WHEN 'Kontrak I' THEN 'Kontrak II'
      WHEN 'Kontrak II' THEN 'Kontrak III'
      WHEN 'Kontrak III' THEN 'Kontrak IV'
      WHEN 'Kontrak IV' THEN 'Kontrak V'
      ELSE current_status  -- Kontrak V (maksimal) atau nilai lain yang tidak dikenali: tidak diubah
    END;

    IF new_status IS DISTINCT FROM current_status THEN
      UPDATE public.employees SET status_kontrak = new_status WHERE id = emp_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_advance_contract_status ON public.evaluations;
CREATE TRIGGER trg_advance_contract_status
    AFTER INSERT ON public.evaluations
    FOR EACH ROW
    EXECUTE FUNCTION public.advance_contract_status();
