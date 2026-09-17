-- 20260831000005_app_number_sequence.sql

-- Create a sequence to guarantee atomic, race-condition-free number generation.
-- Starting at 3 because the seed data implicitly uses 0001 and 0002.
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 3;

-- Create the trigger function that formats the number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    -- Format: APP-YYYY-XXXX (e.g. APP-2026-0003)
    NEW.application_number := 'APP-' || to_char(CURRENT_TIMESTAMP, 'YYYY') || '-' || lpad(nextval('application_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the applications table before insert
CREATE TRIGGER set_application_number
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION generate_application_number();
