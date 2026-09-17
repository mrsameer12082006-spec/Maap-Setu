-- 20260903000011_fix_application_number_sequence.sql

-- 1. Advance the sequence to the maximum existing application number (at least 8)
SELECT setval(
  'public.application_number_seq',
  GREATEST(
    8,
    (SELECT COALESCE(MAX(SUBSTRING(application_number FROM 10)::integer), 0) FROM public.applications)
  )
);

-- 2. Make generate_application_number trigger collision-proof with a loop
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  v_num text;
  v_exists boolean;
BEGIN
  IF NEW.application_number IS NULL THEN
    LOOP
      v_num := 'APP-' || to_char(CURRENT_TIMESTAMP, 'YYYY') || '-' || lpad(nextval('public.application_number_seq')::text, 4, '0');
      SELECT EXISTS(SELECT 1 FROM public.applications WHERE application_number = v_num) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.application_number := v_num;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
