-- 20260829000004_seed_data.sql

-- APPROACH B: DO NOT directly insert into auth.users
-- Inserting directly into auth.users bypasses Supabase GoTrue identities, sessions, and hashing logic,
-- causing fragility and dependency errors (like pgcrypto/gen_salt).
-- Instead, create the three demo users via the Supabase Dashboard, and this script will securely 
-- link the domain data to them using idempotent logic.

DO $$
DECLARE
  biz_id UUID;
  lmd_id UUID;
  off_id UUID;
  
  -- Hardcoded IDs for Idempotency
  officer_table_id UUID := 'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c';
  inst1_id UUID := 'b1111111-2222-3333-4444-555555555555';
  inst2_id UUID := 'b2222222-2222-3333-4444-555555555555';
  app1_id UUID := 'a1111111-2222-3333-4444-555555555555';
  app2_id UUID := 'a2222222-2222-3333-4444-555555555555';

BEGIN
  -- 1. Lookup users by email (Created manually in Dashboard)
  SELECT id INTO biz_id FROM auth.users WHERE email = 'v.mehta@apexlogistics.in';
  SELECT id INTO lmd_id FROM auth.users WHERE email = 'admin.ngp@maapsetu.gov.in';
  SELECT id INTO off_id FROM auth.users WHERE email = 'r.sharma.lmo@maapsetu.gov.in';

  IF biz_id IS NULL OR lmd_id IS NULL OR off_id IS NULL THEN
    RAISE NOTICE 'Demo Auth users not found. Seed script skipped. Please create them via the Supabase Dashboard first.';
    RETURN;
  END IF;

  -- 2. Create Profiles
  INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
  VALUES
    (biz_id, 'Vikramaditya Mehta', 'v.mehta@apexlogistics.in', '+91 9876543210', 'business', 'Apex Logistics & Freight Corp', NULL, true),
    (lmd_id, 'Rajendra Prasad (Admin)', 'admin.ngp@maapsetu.gov.in', '+91 9999988888', 'lmd', 'Legal Metrology Dept', 'Nagpur Division', true),
    (off_id, 'Inspector Rajesh V. Sharma', 'r.sharma.lmo@maapsetu.gov.in', '+91 8888877777', 'officer', 'Legal Metrology Dept', 'Nagpur Zone 1', true)
  ON CONFLICT (id) DO UPDATE 
  SET role = EXCLUDED.role, is_active = true;

  -- 3. Create Officer Data
  INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, active_assignments_count)
  VALUES
    (officer_table_id, off_id, 'LMO', 'EMP-LMO-442', 'Legal Metrology Officer', 'Nagpur Zone 1', '+91 8888877777', 'r.sharma.lmo@maapsetu.gov.in', 4.8, 0)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Create Instruments
  INSERT INTO instruments (id, owner_id, instrument_name, category, serial_number, model_number, manufacturer, max_capacity, unit_of_measurement, accuracy_class, installation_location, premises_name, state, district)
  VALUES
    (inst1_id, biz_id, 'Heavy Electronic Weighbridge', 'weighbridge', 'AV-984210-IN', 'WB-60T-PRO', 'Avery India Ltd', '60000', 'kg', 'Class III', 'Plot 88, MIDC Butibori, Nagpur', 'Apex Warehouse 1', 'Maharashtra', 'Nagpur'),
    (inst2_id, biz_id, 'Retail Digital Counter Scale', 'retail_scale', 'ESS-773-42X', 'DS-852', 'Essae-Teraoka', '30', 'kg', 'Class II', 'Retail Hub, Sitabuldi, Nagpur', 'Apex Retail Point', 'Maharashtra', 'Nagpur')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Create Applications
  INSERT INTO applications (id, application_number, applicant_id, instrument_id, application_type, status, inspection_location, assigned_officer_id)
  VALUES
    (app1_id, 'APP-2026-0001', biz_id, inst1_id, 'reverification', 'passed', 'Plot 88, MIDC Butibori, Nagpur', officer_table_id),
    (app2_id, 'APP-2026-0002', biz_id, inst2_id, 'initial', 'failed', 'Retail Hub, Sitabuldi, Nagpur', officer_table_id)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Create Verification Results
  INSERT INTO verification_results (application_id, officer_id, outcome, checklist_results, technical_test_results, officer_remarks, rejection_reason)
  VALUES
    (app1_id, officer_table_id, 'PASS', '{"sealIntact": true, "mpeCheck": true}', '{"observedErrorMargin": "0.1"}', 'All tests passed.', null),
    (app2_id, officer_table_id, 'FAIL', '{"sealIntact": false}', '{"observedErrorMargin": "2.5"}', 'Seal broken, high error.', 'Seal broken during transit.')
  ON CONFLICT (application_id) DO NOTHING;

  -- 7. Create Certificate (Only for passed application app1_id)
  INSERT INTO certificates (application_id, instrument_id, certificate_number, instrument_type, serial_number, manufacturer, model, capacity, accuracy_class, owner_name, owner_address, verification_authority, verification_officer, verification_date, expiry_date, status)
  VALUES
    (app1_id, inst1_id, 'CERT-2026-9999', 'weighbridge', 'AV-984210-IN', 'Avery India Ltd', 'WB-60T-PRO', '60000', 'Class III', 'Vikramaditya Mehta', 'Apex Warehouse 1, Nagpur', 'Rajendra Prasad (Admin)', 'Inspector Rajesh V. Sharma', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'VERIFIED')
  ON CONFLICT (application_id) DO NOTHING;

END $$;
