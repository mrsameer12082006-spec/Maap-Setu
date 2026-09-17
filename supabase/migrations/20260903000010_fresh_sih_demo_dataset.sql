-- 20260903000010_fresh_sih_demo_dataset.sql
-- ==============================================================================
-- MAAPSETU — FRESH SIH DEMO DATASET & AUTH ROSTER
-- ==============================================================================
--
-- ARCHITECTURAL GUARANTEES:
-- 1. Clears existing transactional demo applications, results, and certificates.
-- 2. Strictly avoids wildcards on auth/profiles cleanup — deletes ONLY the 18
--    explicit historical demo emails.
-- 3. Resets application_number_seq to 1 for clean sequential numbering (APP-2026-0001..).
-- 4. Links 25 fresh demo user profiles:
--    - 8 LMD Administrators (role = 'lmd')
--    - 8 LMO Field Inspectors (role = 'officer', officer_type = 'LMO')
--    - 8 GATC Approved Test Centres (role = 'officer', officer_type = 'GATC')
--    - 1 Primary Demo Business Owner (role = 'business')
-- 5. Seeds 8 representative demo applications covering all 5 dashboard categories:
--    - App 1: NEW (submitted)
--    - App 2: IN PROGRESS (under_review, reviewed_at = NULL)
--    - App 3: AWAITING ASSIGN (under_review, reviewed_at = NOW(), unassigned)
--    - App 4: VERIFICATION (assigned to LMO 1)
--    - App 5: VERIFICATION (in_progress, assigned to GATC 3)
--    - App 6: COMPLETED (failed, eccentricity failure reason)
--    - App 7: VERIFICATION (assigned to LMO 1, attempt #1 = FAIL, ready for LIVE PASS demo)
--    - App 8: COMPLETED (in-service inspection passed, statutory NO certificate)
-- 6. Zero pre-seeded certificates: Application 7 exercises the real live automatic
--    certificate generation flow upon Officer PASS verification.
-- ==============================================================================

DO $$
DECLARE
  -- Business Demo User
  biz_uid UUID;

  -- 8 LMD Administrator User IDs
  lmd1_uid UUID; lmd2_uid UUID; lmd3_uid UUID; lmd4_uid UUID;
  lmd5_uid UUID; lmd6_uid UUID; lmd7_uid UUID; lmd8_uid UUID;

  -- 8 LMO Inspector User IDs
  lmo1_uid UUID; lmo2_uid UUID; lmo3_uid UUID; lmo4_uid UUID;
  lmo5_uid UUID; lmo6_uid UUID; lmo7_uid UUID; lmo8_uid UUID;

  -- 8 GATC Institutional User IDs
  gatc1_uid UUID; gatc2_uid UUID; gatc3_uid UUID; gatc4_uid UUID;
  gatc5_uid UUID; gatc6_uid UUID; gatc7_uid UUID; gatc8_uid UUID;

  -- Deterministic UUIDs for Officers table (idempotent PKs)
  lmo1_id UUID := 'b1b1b1b1-0001-0001-0001-000000000001';
  lmo2_id UUID := 'b2b2b2b2-0001-0001-0001-000000000002';
  lmo3_id UUID := 'b3b3b3b3-0001-0001-0001-000000000003';
  lmo4_id UUID := 'b4b4b4b4-0001-0001-0001-000000000004';
  lmo5_id UUID := 'b5b5b5b5-0001-0001-0001-000000000005';
  lmo6_id UUID := 'b6b6b6b6-0001-0001-0001-000000000006';
  lmo7_id UUID := 'b7b7b7b7-0001-0001-0001-000000000007';
  lmo8_id UUID := 'b8b8b8b8-0001-0001-0001-000000000008';

  gatc1_id UUID := 'c1c1c1c1-0001-0001-0001-000000000001';
  gatc2_id UUID := 'c2c2c2c2-0001-0001-0001-000000000002';
  gatc3_id UUID := 'c3c3c3c3-0001-0001-0001-000000000003';
  gatc4_id UUID := 'c4c4c4c4-0001-0001-0001-000000000004';
  gatc5_id UUID := 'c5c5c5c5-0001-0001-0001-000000000005';
  gatc6_id UUID := 'c6c6c6c6-0001-0001-0001-000000000006';
  gatc7_id UUID := 'c7c7c7c7-0001-0001-0001-000000000007';
  gatc8_id UUID := 'c8c8c8c8-0001-0001-0001-000000000008';

  -- Deterministic UUIDs for Demo Instruments
  inst1_id UUID := 'd1111111-0001-0001-0001-000000000001';
  inst2_id UUID := 'd2222222-0001-0001-0001-000000000002';
  inst3_id UUID := 'd3333333-0001-0001-0001-000000000003';
  inst4_id UUID := 'd4444444-0001-0001-0001-000000000004';
  inst5_id UUID := 'd5555555-0001-0001-0001-000000000005';
  inst6_id UUID := 'd6666666-0001-0001-0001-000000000006';
  inst7_id UUID := 'd7777777-0001-0001-0001-000000000007';
  inst8_id UUID := 'd8888888-0001-0001-0001-000000000008';

  -- Deterministic UUIDs for Demo Applications
  app1_id UUID := 'e1111111-0001-0001-0001-000000000001';
  app2_id UUID := 'e2222222-0001-0001-0001-000000000002';
  app3_id UUID := 'e3333333-0001-0001-0001-000000000003';
  app4_id UUID := 'e4444444-0001-0001-0001-000000000004';
  app5_id UUID := 'e5555555-0001-0001-0001-000000000005';
  app6_id UUID := 'e6666666-0001-0001-0001-000000000006';
  app7_id UUID := 'e7777777-0001-0001-0001-000000000007';
  app8_id UUID := 'e8888888-0001-0001-0001-000000000008';

BEGIN
  -- ============================================================================
  -- 1. TRANSACTIONAL DATA CLEANUP (Dependency Order)
  -- ============================================================================
  TRUNCATE TABLE public.certificates CASCADE;
  TRUNCATE TABLE public.verification_results CASCADE;
  TRUNCATE TABLE public.app_timeline CASCADE;
  TRUNCATE TABLE public.activity_logs CASCADE;
  TRUNCATE TABLE public.applications CASCADE;
  TRUNCATE TABLE public.instruments CASCADE;
  TRUNCATE TABLE public.officers CASCADE;

  -- Delete ONLY explicit historical demo accounts
  DELETE FROM public.profiles
  WHERE email IN (
    'v.mehta@apexlogistics.in',
    'admin.ngp@maapsetu.gov.in',
    'r.sharma.lmo@maapsetu.gov.in',
    'a.kulkarni.lmo@maapsetu.gov.in',
    'n.deshmukh.lmo@maapsetu.gov.in',
    's.patil.lmo@maapsetu.gov.in',
    'p.joshi.lmo@maapsetu.gov.in',
    'r.mehta.lmo@maapsetu.gov.in',
    'a.verma.lmo@maapsetu.gov.in',
    'v.nair.lmo@maapsetu.gov.in',
    'wiwmtc.gatc@maapsetu.gov.in',
    'mpmc.gatc@maapsetu.gov.in',
    'picl.gatc@maapsetu.gov.in',
    'nwmtc.gatc@maapsetu.gov.in',
    'mlmtc.gatc@maapsetu.gov.in',
    'nmsc.gatc@maapsetu.gov.in',
    'aivc.gatc@maapsetu.gov.in',
    'kwml.gatc@maapsetu.gov.in'
  );

  -- Reset application number generator sequence
  ALTER SEQUENCE IF EXISTS public.application_number_seq RESTART WITH 1;

  -- ============================================================================
  -- 2. RESOLVE AUTH USER IDENTITIES
  -- ============================================================================
  SELECT id INTO biz_uid FROM auth.users WHERE email = 'business.demo@maapsetu.demo';

  SELECT id INTO lmd1_uid FROM auth.users WHERE email = 'lmd01@maapsetu.demo';
  SELECT id INTO lmd2_uid FROM auth.users WHERE email = 'lmd02@maapsetu.demo';
  SELECT id INTO lmd3_uid FROM auth.users WHERE email = 'lmd03@maapsetu.demo';
  SELECT id INTO lmd4_uid FROM auth.users WHERE email = 'lmd04@maapsetu.demo';
  SELECT id INTO lmd5_uid FROM auth.users WHERE email = 'lmd05@maapsetu.demo';
  SELECT id INTO lmd6_uid FROM auth.users WHERE email = 'lmd06@maapsetu.demo';
  SELECT id INTO lmd7_uid FROM auth.users WHERE email = 'lmd07@maapsetu.demo';
  SELECT id INTO lmd8_uid FROM auth.users WHERE email = 'lmd08@maapsetu.demo';

  SELECT id INTO lmo1_uid FROM auth.users WHERE email = 'lmo01@maapsetu.demo';
  SELECT id INTO lmo2_uid FROM auth.users WHERE email = 'lmo02@maapsetu.demo';
  SELECT id INTO lmo3_uid FROM auth.users WHERE email = 'lmo03@maapsetu.demo';
  SELECT id INTO lmo4_uid FROM auth.users WHERE email = 'lmo04@maapsetu.demo';
  SELECT id INTO lmo5_uid FROM auth.users WHERE email = 'lmo05@maapsetu.demo';
  SELECT id INTO lmo6_uid FROM auth.users WHERE email = 'lmo06@maapsetu.demo';
  SELECT id INTO lmo7_uid FROM auth.users WHERE email = 'lmo07@maapsetu.demo';
  SELECT id INTO lmo8_uid FROM auth.users WHERE email = 'lmo08@maapsetu.demo';

  SELECT id INTO gatc1_uid FROM auth.users WHERE email = 'gatc01@maapsetu.demo';
  SELECT id INTO gatc2_uid FROM auth.users WHERE email = 'gatc02@maapsetu.demo';
  SELECT id INTO gatc3_uid FROM auth.users WHERE email = 'gatc03@maapsetu.demo';
  SELECT id INTO gatc4_uid FROM auth.users WHERE email = 'gatc04@maapsetu.demo';
  SELECT id INTO gatc5_uid FROM auth.users WHERE email = 'gatc05@maapsetu.demo';
  SELECT id INTO gatc6_uid FROM auth.users WHERE email = 'gatc06@maapsetu.demo';
  SELECT id INTO gatc7_uid FROM auth.users WHERE email = 'gatc07@maapsetu.demo';
  SELECT id INTO gatc8_uid FROM auth.users WHERE email = 'gatc08@maapsetu.demo';

  -- If auth users have not yet been provisioned via Admin API, skip row insertion safely
  IF biz_uid IS NULL OR lmd1_uid IS NULL OR lmo1_uid IS NULL THEN
    RAISE NOTICE 'SIH Demo Auth accounts not yet provisioned in auth.users. Run provision script first.';
    RETURN;
  END IF;

  -- ============================================================================
  -- 3. PROFILES — BUSINESS DEMO ACCOUNT
  -- ============================================================================
  INSERT INTO public.profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
  VALUES (biz_uid, 'Vikramaditya Mehta', 'business.demo@maapsetu.demo', '+91 9876543210', 'business', 'Apex Logistics & Manufacturing Corp', NULL, true)
  ON CONFLICT (id) DO UPDATE SET role = 'business', name = EXCLUDED.name, is_active = true;

  -- ============================================================================
  -- 4. PROFILES — 8 LMD ADMINISTRATORS
  -- ============================================================================
  INSERT INTO public.profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
  VALUES
    (lmd1_uid, 'Dr. S. K. Roy', 'lmd01@maapsetu.demo', '+91 9811000001', 'lmd', 'State Legal Metrology Department', 'HQ Directorate', true),
    (lmd2_uid, 'Ananya Sen', 'lmd02@maapsetu.demo', '+91 9811000002', 'lmd', 'State Legal Metrology Department', 'Review & Licensing Wing', true),
    (lmd3_uid, 'Rajiv Deshmukh', 'lmd03@maapsetu.demo', '+91 9811000003', 'lmd', 'State Legal Metrology Department', 'Enforcement & Standards', true),
    (lmd4_uid, 'Meera Nambiar', 'lmd04@maapsetu.demo', '+91 9811000004', 'lmd', 'State Legal Metrology Department', 'Mumbai Metropolitan Region', true),
    (lmd5_uid, 'Tarun Mathur', 'lmd05@maapsetu.demo', '+91 9811000005', 'lmd', 'State Legal Metrology Department', 'Pune Industrial Division', true),
    (lmd6_uid, 'Sunita Kashyap', 'lmd06@maapsetu.demo', '+91 9811000006', 'lmd', 'State Legal Metrology Department', 'Nagpur Division', true),
    (lmd7_uid, 'Arvind Swaminathan', 'lmd07@maapsetu.demo', '+91 9811000007', 'lmd', 'State Legal Metrology Department', 'Nashik Division', true),
    (lmd8_uid, 'Farooq Ahmed', 'lmd08@maapsetu.demo', '+91 9811000008', 'lmd', 'State Legal Metrology Department', 'Compliance Audit Wing', true)
  ON CONFLICT (id) DO UPDATE SET role = 'lmd', name = EXCLUDED.name, is_active = true;

  -- ============================================================================
  -- 5. PROFILES & OFFICERS — 8 LMO FIELD INSPECTORS
  -- ============================================================================
  INSERT INTO public.profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
  VALUES
    (lmo1_uid, 'Inspector Rajesh V. Sharma', 'lmo01@maapsetu.demo', '+91 9822000001', 'officer', 'Legal Metrology Department', 'Mumbai Zone 1', true),
    (lmo2_uid, 'Inspector Amit Kulkarni', 'lmo02@maapsetu.demo', '+91 9822000002', 'officer', 'Legal Metrology Department', 'Pune Zone 1', true),
    (lmo3_uid, 'Inspector Neha Deshmukh', 'lmo03@maapsetu.demo', '+91 9822000003', 'officer', 'Legal Metrology Department', 'Nagpur Zone 1', true),
    (lmo4_uid, 'Inspector Sandeep Patil', 'lmo04@maapsetu.demo', '+91 9822000004', 'officer', 'Legal Metrology Department', 'Nashik Zone 1', true),
    (lmo5_uid, 'Inspector Priya Joshi', 'lmo05@maapsetu.demo', '+91 9822000005', 'officer', 'Legal Metrology Department', 'Aurangabad Zone 1', true),
    (lmo6_uid, 'Inspector Rohan Mehta', 'lmo06@maapsetu.demo', '+91 9822000006', 'officer', 'Legal Metrology Department', 'Thane Logistic Hub', true),
    (lmo7_uid, 'Inspector Anjali Verma', 'lmo07@maapsetu.demo', '+91 9822000007', 'officer', 'Legal Metrology Department', 'Kolhapur Commercial Zone', true),
    (lmo8_uid, 'Inspector Vivek Nair', 'lmo08@maapsetu.demo', '+91 9822000008', 'officer', 'Legal Metrology Department', 'Navi Mumbai Port Zone', true)
  ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

  INSERT INTO public.officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
  VALUES
    (lmo1_id, lmo1_uid, 'LMO', 'EMP-LMO-101', 'Senior Legal Metrology Officer', 'Mumbai Zone 1', '+91 9822000001', 'lmo01@maapsetu.demo', 4.9, true),
    (lmo2_id, lmo2_uid, 'LMO', 'EMP-LMO-102', 'Legal Metrology Officer', 'Pune Zone 1', '+91 9822000002', 'lmo02@maapsetu.demo', 4.7, true),
    (lmo3_id, lmo3_uid, 'LMO', 'EMP-LMO-103', 'Senior Legal Metrology Officer', 'Nagpur Zone 1', '+91 9822000003', 'lmo03@maapsetu.demo', 4.8, true),
    (lmo4_id, lmo4_uid, 'LMO', 'EMP-LMO-104', 'Legal Metrology Officer', 'Nashik Zone 1', '+91 9822000004', 'lmo04@maapsetu.demo', 4.6, true),
    (lmo5_id, lmo5_uid, 'LMO', 'EMP-LMO-105', 'Legal Metrology Officer', 'Aurangabad Zone 1', '+91 9822000005', 'lmo05@maapsetu.demo', 4.8, true),
    (lmo6_id, lmo6_uid, 'LMO', 'EMP-LMO-106', 'Legal Metrology Officer', 'Thane Logistic Hub', '+91 9822000006', 'lmo06@maapsetu.demo', 4.5, true),
    (lmo7_id, lmo7_uid, 'LMO', 'EMP-LMO-107', 'Senior Legal Metrology Officer', 'Kolhapur Commercial Zone', '+91 9822000007', 'lmo07@maapsetu.demo', 4.9, true),
    (lmo8_id, lmo8_uid, 'LMO', 'EMP-LMO-108', 'Legal Metrology Officer', 'Navi Mumbai Port Zone', '+91 9822000008', 'lmo08@maapsetu.demo', 4.7, true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 6. PROFILES & OFFICERS — 8 GATC APPROVED TEST CENTRES
  -- ============================================================================
  INSERT INTO public.profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
  VALUES
    (gatc1_uid, 'Western India Weights & Measures Lab', 'gatc01@maapsetu.demo', '+91 2222 100001', 'officer', 'Western India Weights & Measures Lab', 'Mumbai Division', true),
    (gatc2_uid, 'Maharashtra Precision Metrology Centre', 'gatc02@maapsetu.demo', '+91 2222 100002', 'officer', 'Maharashtra Precision Metrology Centre', 'Navi Mumbai Division', true),
    (gatc3_uid, 'Pune Instrument Compliance Laboratory', 'gatc03@maapsetu.demo', '+91 2023 100003', 'officer', 'Pune Instrument Compliance Laboratory', 'Pune Division', true),
    (gatc4_uid, 'Central India Standard Weights Testing Facility', 'gatc04@maapsetu.demo', '+91 7122 100004', 'officer', 'Central India Standard Weights Testing Facility', 'Nagpur Division', true),
    (gatc5_uid, 'Sahyadri Industrial Calibration Agency', 'gatc05@maapsetu.demo', '+91 2532 100005', 'officer', 'Sahyadri Industrial Calibration Agency', 'Nashik Division', true),
    (gatc6_uid, 'Marathwada Heavy Measure Test Station', 'gatc06@maapsetu.demo', '+91 2402 100006', 'officer', 'Marathwada Heavy Measure Test Station', 'Aurangabad Division', true),
    (gatc7_uid, 'Deccan Metrology Certification Unit', 'gatc07@maapsetu.demo', '+91 2312 100007', 'officer', 'Deccan Metrology Certification Unit', 'Kolhapur Division', true),
    (gatc8_uid, 'Konkan Maritime Measure Testing Station', 'gatc08@maapsetu.demo', '+91 2222 100008', 'officer', 'Konkan Maritime Measure Testing Station', 'Konkan Division', true)
  ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

  INSERT INTO public.officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
  VALUES
    (gatc1_id, gatc1_uid, 'GATC', 'GATC-MH-001', 'Government Approved Test Centre', 'Mumbai', '+91 2222 100001', 'gatc01@maapsetu.demo', 4.8, true),
    (gatc2_id, gatc2_uid, 'GATC', 'GATC-MH-002', 'Government Approved Test Centre', 'Navi Mumbai', '+91 2222 100002', 'gatc02@maapsetu.demo', 4.7, true),
    (gatc3_id, gatc3_uid, 'GATC', 'GATC-MH-003', 'Government Approved Test Centre', 'Pune', '+91 2023 100003', 'gatc03@maapsetu.demo', 4.9, true),
    (gatc4_id, gatc4_uid, 'GATC', 'GATC-MH-004', 'Government Approved Test Centre', 'Nagpur', '+91 7122 100004', 'gatc04@maapsetu.demo', 4.6, true),
    (gatc5_id, gatc5_uid, 'GATC', 'GATC-MH-005', 'Government Approved Test Centre', 'Nashik', '+91 2532 100005', 'gatc05@maapsetu.demo', 4.7, true),
    (gatc6_id, gatc6_uid, 'GATC', 'GATC-MH-006', 'Government Approved Test Centre', 'Aurangabad', '+91 2402 100006', 'gatc06@maapsetu.demo', 4.5, true),
    (gatc7_id, gatc7_uid, 'GATC', 'GATC-MH-007', 'Government Approved Test Centre', 'Kolhapur', '+91 2312 100007', 'gatc07@maapsetu.demo', 4.9, true),
    (gatc8_id, gatc8_uid, 'GATC', 'GATC-MH-008', 'Government Approved Test Centre', 'Konkan', '+91 2222 100008', 'gatc08@maapsetu.demo', 4.8, true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 7. INSTRUMENTS — 8 REALISTIC DEMO WEIGHING / MEASURING INSTRUMENTS
  -- ============================================================================
  INSERT INTO public.instruments (
    id, owner_id, instrument_name, category, serial_number, model_number, manufacturer,
    max_capacity, min_capacity, unit_of_measurement, accuracy_class, scale_interval,
    quantity, installation_location, premises_name, state, district, status
  )
  VALUES
    (inst1_id, biz_uid, 'Heavy Electronic Weighbridge 60t', 'weighbridge', 'AV-984210-IN', 'WB-60T-PRO', 'Avery India Ltd', '60000', '200', 'kg', 'Class III', '10 kg', 1, 'Plot 88, MIDC Butibori', 'Apex Central Warehouse', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst2_id, biz_uid, 'Retail Digital Counter Scale 30kg', 'retail_scale', 'ESS-773-42X', 'DS-852', 'Essae-Teraoka Ltd', '30', '100', 'g', 'Class II', '1 g', 1, 'Store 14, Sitabuldi Commercial Hub', 'Apex Retail Hub', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst3_id, biz_uid, 'Heavy Platform Scale 5t', 'package_scale', 'CAS-5000-HD', 'CI-2001A', 'CAS Corporation', '5000', '20', 'kg', 'Class III', '1 kg', 1, 'Loading Bay 3, MIDC Hingna', 'Apex Logistics Yard', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst4_id, biz_uid, 'Dual-Nozzle Fuel Dispenser', 'fuel_dispenser', 'GV-330198-F', 'Horizon-5000', 'Gilbarco Veeder-Root', '80', '5', 'L/min', 'Class 0.5', '0.01 L', 2, 'Fueling Bay 1, NH-44 Express Depot', 'Apex Fleet Depot', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst5_id, biz_uid, 'Laboratory Analytical Precision Balance', 'lab_balance', 'CIT-CY204-X', 'CY-204', 'Citizen Scales Ltd', '220', '10', 'mg', 'Class I', '0.1 mg', 1, 'Chemical Testing Wing, R&D Block', 'Apex Quality Lab', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst6_id, biz_uid, 'Industrial Commercial Scale 15kg', 'retail_scale', 'ESS-215-09A', 'DS-215', 'Essae-Teraoka Ltd', '15', '50', 'g', 'Class III', '2 g', 1, 'Packaging Line 2, Unit 4', 'Apex Packaging Centre', 'Maharashtra', 'Nagpur', 'rejected'),
    (inst7_id, biz_uid, 'High Capacity Crane Suspended Scale 10t', 'package_scale', 'CS-10T-PRO', 'OCS-10T', 'Eagle Scales Pvt Ltd', '10000', '100', 'kg', 'Class III', '5 kg', 1, 'Heavy Crane Bay, Plot 92 MIDC', 'Apex Heavy Staging', 'Maharashtra', 'Nagpur', 'under_verification'),
    (inst8_id, biz_uid, 'Commercial Terminal Flowmeter Gauge', 'flowmeter', 'EM-551042-X', 'Micro Motion Elite', 'Emerson Process', '500', '10', 'L/min', 'Class 0.3', '0.1 L', 1, 'Bulk Liquid Pipeline Terminal 1', 'Apex Terminal Yard', 'Maharashtra', 'Nagpur', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 8. APPLICATIONS — 8 REPRESENTATIVE DEMO WORKFLOW APPLICATIONS
  -- ============================================================================
  -- App 1: NEW (status = 'submitted', awaiting initial LMD review)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, notes, submitted_at
  )
  VALUES (
    app1_id, 'APP-2026-0001', biz_uid, inst1_id, 'Initial Verification', 'submitted',
    'Plot 88, MIDC Butibori, Nagpur', 'New commercial weighbridge installation inspection.', NOW() - INTERVAL '2 hours'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 2: IN PROGRESS (status = 'under_review', reviewed_at is NULL -> actively under LMD doc review)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, notes, submitted_at, reviewed_at
  )
  VALUES (
    app2_id, 'APP-2026-0002', biz_uid, inst2_id, 'Periodic Re-verification', 'under_review',
    'Store 14, Sitabuldi Commercial Hub, Nagpur', 'Annual periodic stamping and verification renewal.', NOW() - INTERVAL '1 day', NULL
  ) ON CONFLICT (id) DO NOTHING;

  -- App 3: AWAITING ASSIGN (status = 'under_review', reviewed_at is NOT NULL, assigned_officer_id is NULL)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, notes, submitted_at, reviewed_at
  )
  VALUES (
    app3_id, 'APP-2026-0003', biz_uid, inst3_id, 'Subsequent Verification', 'under_review',
    'Loading Bay 3, MIDC Hingna, Nagpur', 'Approved by LMD Administration. Awaiting verifier roster dispatch.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 4: VERIFICATION (status = 'assigned' to LMO 1)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, assigned_date, scheduled_inspection_date,
    notes, submitted_at, reviewed_at
  )
  VALUES (
    app4_id, 'APP-2026-0004', biz_uid, inst4_id, 'Initial Verification', 'assigned',
    'Fueling Bay 1, NH-44 Express Depot, Nagpur', lmo1_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day',
    'Assigned to Inspector Rajesh V. Sharma for on-site delivery measure testing.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 5: VERIFICATION (status = 'in_progress' with GATC 3)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, assigned_date, scheduled_inspection_date,
    notes, submitted_at, reviewed_at
  )
  VALUES (
    app5_id, 'APP-2026-0005', biz_uid, inst5_id, 'Subsequent Verification', 'in_progress',
    'Chemical Testing Wing, R&D Block, Nagpur', gatc3_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE,
    'Technical verification in progress with Pune Instrument Compliance Laboratory.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 6: COMPLETED (status = 'failed' with static rejection reason)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, assigned_date, scheduled_inspection_date,
    completed_at, notes, submitted_at, reviewed_at
  )
  VALUES (
    app6_id, 'APP-2026-0006', biz_uid, inst6_id, 'Initial Verification', 'failed',
    'Packaging Line 2, Unit 4, Nagpur', lmo1_id, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days',
    NOW() - INTERVAL '1 day', 'Physical verification failed. Recalibration required before re-inspection.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 7: READY FOR LIVE PASS DEMO (status = 'assigned' to LMO 1, has historical FAIL attempt #1)
  -- LIVE DEMO FLOW: Officer logs in -> opens Case Record -> Start Re-verification -> enters test -> submits PASS
  -- Server generates Certificate automatically!
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, assigned_date, scheduled_inspection_date,
    notes, submitted_at, reviewed_at
  )
  VALUES (
    app7_id, 'APP-2026-0007', biz_uid, inst7_id, 'Periodic Re-verification', 'assigned',
    'Heavy Crane Bay, Plot 92 MIDC, Nagpur', lmo1_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE,
    'Live Demo Candidate: Failed previous attempt. Recalibrated and ready for re-inspection PASS.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- App 8: COMPLETED (status = 'passed', In-Service Inspection, statutory NO certificate)
  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, assigned_date, completed_at,
    notes, submitted_at, reviewed_at
  )
  VALUES (
    app8_id, 'APP-2026-0008', biz_uid, inst8_id, 'In-Service Inspection', 'passed',
    'Bulk Liquid Pipeline Terminal 1, Nagpur', lmo1_id, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '4 hours',
    'Statutory field surveillance inspection verified compliant under Legal Metrology Act, 2009.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- 9. VERIFICATION RESULTS — INITIAL HISTORICAL RECORDS
  -- ============================================================================
  -- Result for App 6: Failed verification attempt
  INSERT INTO public.verification_results (
    application_id, officer_id, outcome, checklist_results, technical_test_results,
    officer_remarks, rejection_reason, verified_at
  )
  VALUES (
    app6_id, lmo1_id, 'FAIL',
    '{"visualInspection": true, "sealIntact": true, "stampingPlateValid": true, "zeroBalanceOperational": false}'::jsonb,
    '{"testedLoad": "15 kg", "observedError": "3.6 g", "maxPermissibleError": "2.0 g", "verificationStage": "INITIAL_VERIFICATION"}'::jsonb,
    'Observed eccentricity error exceeded statutory MPE limits by 1.6 g. Scale recalibration mandatory.',
    'Eccentricity error exceeded statutory MPE limits by 1.6 g',
    NOW() - INTERVAL '1 day'
  );

  -- Result for App 7: Historical attempt #1 (FAIL)
  -- Setting up historical re-verification trail before live PASS demo
  INSERT INTO public.verification_results (
    application_id, officer_id, outcome, checklist_results, technical_test_results,
    officer_remarks, rejection_reason, verified_at
  )
  VALUES (
    app7_id, lmo1_id, 'FAIL',
    '{"visualInspection": true, "sealIntact": true, "stampingPlateValid": true, "zeroBalanceOperational": false}'::jsonb,
    '{"testedLoad": "10000 kg", "observedError": "14 kg", "maxPermissibleError": "10 kg", "verificationStage": "SUBSEQUENT_VERIFICATION"}'::jsonb,
    'Load cell zero-tracking drift detected during test load. Instrument returned for recalibration.',
    'Load cell zero-tracking drift detected during test load',
    NOW() - INTERVAL '2 days'
  );

  -- Result for App 8: In-service inspection compliance (PASS, no cert)
  INSERT INTO public.verification_results (
    application_id, officer_id, outcome, checklist_results, technical_test_results,
    officer_remarks, rejection_reason, verified_at
  )
  VALUES (
    app8_id, lmo1_id, 'PASS',
    '{"visualInspection": true, "sealIntact": true, "stampingPlateValid": true, "zeroBalanceOperational": true}'::jsonb,
    '{"testedLoad": "500 L/min", "observedError": "0.12 L", "maxPermissibleError": "0.30 L", "verificationStage": "IN_SERVICE_INSPECTION"}'::jsonb,
    'Surveillance inspection passed. Flowmeter calibration is fully compliant with statutory tolerances.',
    NULL,
    NOW() - INTERVAL '4 hours'
  );

  -- ============================================================================
  -- 10. TIMELINE EVENTS
  -- ============================================================================
  INSERT INTO public.app_timeline (application_id, event_type, step, old_status, new_status, actor_user_id, actor_role, message)
  VALUES
    (app1_id, 'SUBMISSION', 'Application Submitted', NULL, 'submitted', biz_uid, 'business', 'Weighbridge verification application filed'),
    (app2_id, 'SUBMISSION', 'Application Submitted', NULL, 'submitted', biz_uid, 'business', 'Scale re-verification application filed'),
    (app2_id, 'STATUS_CHANGE', 'Under Review', 'submitted', 'under_review', lmd1_uid, 'lmd', 'Application taken up for document inspection'),
    (app3_id, 'STATUS_CHANGE', 'Review Approved', 'submitted', 'under_review', lmd1_uid, 'lmd', 'Documents cleared; waiting for verifier dispatch'),
    (app4_id, 'ASSIGNMENT', 'Verifier Assigned', 'under_review', 'assigned', lmd1_uid, 'lmd', 'Assigned to Inspector Rajesh V. Sharma'),
    (app5_id, 'ASSIGNMENT', 'Verifier Assigned', 'under_review', 'in_progress', lmd1_uid, 'lmd', 'Assigned to Pune Instrument Compliance Laboratory'),
    (app6_id, 'VERIFICATION', 'Verification FAIL', 'in_progress', 'failed', lmo1_uid, 'officer', 'Failed: Eccentricity error exceeded MPE limits'),
    (app7_id, 'VERIFICATION', 'Verification FAIL (Attempt 1)', 'in_progress', 'assigned', lmo1_uid, 'officer', 'Attempt 1 Failed: Load cell zero drift. Ready for re-verification.'),
    (app8_id, 'VERIFICATION', 'In-Service Inspection PASS', 'in_progress', 'passed', lmo1_uid, 'officer', 'Surveillance inspection completed and verified compliant');

END $$;
