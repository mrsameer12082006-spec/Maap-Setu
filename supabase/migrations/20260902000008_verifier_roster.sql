-- 20260902000008_verifier_roster.sql
-- Seed Authorized Verifiers Roster: 8 LMO Officers + 8 GATC Approved Centres (16 Total)
--
-- SECURITY ARCHITECTURE:
--   officers.user_id remains strictly NOT NULL REFERENCES profiles(id).
--   Every verifier entity (both LMO and GATC) resolves to an authenticated Officer profile.
--   When an officer submits verification via submit-verification Edge Function,
--   the officer's identity is verified from the JWT:
--     auth.users -> profiles.id -> officers.user_id -> officers.id -> applications.assigned_officer_id
--
-- In accordance with project security practices (Approach B as established in 004_seed_data.sql),
-- this migration matches users created via Supabase Auth by email.
-- For each matching auth user, it idempotently creates/updates profiles and officers records.
-- If an auth user is not yet provisioned, a NOTICE is emitted without aborting the transaction.

DO $$
DECLARE
  -- LMO Officers auth user IDs
  lmo2_uid UUID; lmo3_uid UUID; lmo4_uid UUID; lmo5_uid UUID;
  lmo6_uid UUID; lmo7_uid UUID; lmo8_uid UUID;

  -- GATC Approved Centres auth user IDs
  gatc1_uid UUID; gatc2_uid UUID; gatc3_uid UUID; gatc4_uid UUID;
  gatc5_uid UUID; gatc6_uid UUID; gatc7_uid UUID; gatc8_uid UUID;

  -- Deterministic UUIDs for officers table (idempotent primary keys)
  -- LMO Officers 2-8 (Officer 1 is Rajesh V. Sharma seeded in 004)
  lmo2_id UUID := 'b2b2b2b2-0001-0001-0001-000000000002';
  lmo3_id UUID := 'b3b3b3b3-0001-0001-0001-000000000003';
  lmo4_id UUID := 'b4b4b4b4-0001-0001-0001-000000000004';
  lmo5_id UUID := 'b5b5b5b5-0001-0001-0001-000000000005';
  lmo6_id UUID := 'b6b6b6b6-0001-0001-0001-000000000006';
  lmo7_id UUID := 'b7b7b7b7-0001-0001-0001-000000000007';
  lmo8_id UUID := 'b8b8b8b8-0001-0001-0001-000000000008';

  -- GATC Approved Centres 1-8
  gatc1_id UUID := 'c1c1c1c1-0001-0001-0001-000000000001';
  gatc2_id UUID := 'c2c2c2c2-0001-0001-0001-000000000002';
  gatc3_id UUID := 'c3c3c3c3-0001-0001-0001-000000000003';
  gatc4_id UUID := 'c4c4c4c4-0001-0001-0001-000000000004';
  gatc5_id UUID := 'c5c5c5c5-0001-0001-0001-000000000005';
  gatc6_id UUID := 'c6c6c6c6-0001-0001-0001-000000000006';
  gatc7_id UUID := 'c7c7c7c7-0001-0001-0001-000000000007';
  gatc8_id UUID := 'c8c8c8c8-0001-0001-0001-000000000008';

BEGIN
  -- ==========================================================
  -- 1. LMO / STATE LEGAL METROLOGY OFFICERS (8 TOTAL)
  -- Officer 1: Inspector Rajesh V. Sharma (seeded in 004)
  -- Officers 2 to 8:
  -- ==========================================================

  -- LMO 2: Inspector Amit Kulkarni
  SELECT id INTO lmo2_uid FROM auth.users WHERE email = 'a.kulkarni.lmo@maapsetu.gov.in';
  IF lmo2_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo2_uid, 'Inspector Amit Kulkarni', 'a.kulkarni.lmo@maapsetu.gov.in', '+91 9876500002', 'officer', 'Legal Metrology Dept', 'Pune Zone 1', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo2_id, lmo2_uid, 'LMO', 'EMP-LMO-443', 'Legal Metrology Officer', 'Pune Zone 1', '+91 9876500002', 'a.kulkarni.lmo@maapsetu.gov.in', 4.7, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for a.kulkarni.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 3: Inspector Neha Deshmukh
  SELECT id INTO lmo3_uid FROM auth.users WHERE email = 'n.deshmukh.lmo@maapsetu.gov.in';
  IF lmo3_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo3_uid, 'Inspector Neha Deshmukh', 'n.deshmukh.lmo@maapsetu.gov.in', '+91 9876500003', 'officer', 'Legal Metrology Dept', 'Mumbai Zone 2', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo3_id, lmo3_uid, 'LMO', 'EMP-LMO-444', 'Senior Legal Metrology Officer', 'Mumbai Zone 2', '+91 9876500003', 'n.deshmukh.lmo@maapsetu.gov.in', 4.9, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for n.deshmukh.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 4: Inspector Sandeep Patil
  SELECT id INTO lmo4_uid FROM auth.users WHERE email = 's.patil.lmo@maapsetu.gov.in';
  IF lmo4_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo4_uid, 'Inspector Sandeep Patil', 's.patil.lmo@maapsetu.gov.in', '+91 9876500004', 'officer', 'Legal Metrology Dept', 'Nashik Zone 1', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo4_id, lmo4_uid, 'LMO', 'EMP-LMO-445', 'Legal Metrology Officer', 'Nashik Zone 1', '+91 9876500004', 's.patil.lmo@maapsetu.gov.in', 4.6, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for s.patil.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 5: Inspector Priya Joshi
  SELECT id INTO lmo5_uid FROM auth.users WHERE email = 'p.joshi.lmo@maapsetu.gov.in';
  IF lmo5_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo5_uid, 'Inspector Priya Joshi', 'p.joshi.lmo@maapsetu.gov.in', '+91 9876500005', 'officer', 'Legal Metrology Dept', 'Aurangabad Zone 1', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo5_id, lmo5_uid, 'LMO', 'EMP-LMO-446', 'Legal Metrology Officer', 'Aurangabad Zone 1', '+91 9876500005', 'p.joshi.lmo@maapsetu.gov.in', 4.8, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for p.joshi.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 6: Inspector Rohan Mehta
  SELECT id INTO lmo6_uid FROM auth.users WHERE email = 'r.mehta.lmo@maapsetu.gov.in';
  IF lmo6_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo6_uid, 'Inspector Rohan Mehta', 'r.mehta.lmo@maapsetu.gov.in', '+91 9876500006', 'officer', 'Legal Metrology Dept', 'Nagpur Zone 2', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo6_id, lmo6_uid, 'LMO', 'EMP-LMO-447', 'Legal Metrology Officer', 'Nagpur Zone 2', '+91 9876500006', 'r.mehta.lmo@maapsetu.gov.in', 4.5, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for r.mehta.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 7: Inspector Anjali Verma
  SELECT id INTO lmo7_uid FROM auth.users WHERE email = 'a.verma.lmo@maapsetu.gov.in';
  IF lmo7_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo7_uid, 'Inspector Anjali Verma', 'a.verma.lmo@maapsetu.gov.in', '+91 9876500007', 'officer', 'Legal Metrology Dept', 'Kolhapur Zone 1', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo7_id, lmo7_uid, 'LMO', 'EMP-LMO-448', 'Senior Legal Metrology Officer', 'Kolhapur Zone 1', '+91 9876500007', 'a.verma.lmo@maapsetu.gov.in', 4.9, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for a.verma.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- LMO 8: Inspector Vivek Nair
  SELECT id INTO lmo8_uid FROM auth.users WHERE email = 'v.nair.lmo@maapsetu.gov.in';
  IF lmo8_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (lmo8_uid, 'Inspector Vivek Nair', 'v.nair.lmo@maapsetu.gov.in', '+91 9876500008', 'officer', 'Legal Metrology Dept', 'Thane Zone 1', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (lmo8_id, lmo8_uid, 'LMO', 'EMP-LMO-449', 'Legal Metrology Officer', 'Thane Zone 1', '+91 9876500008', 'v.nair.lmo@maapsetu.gov.in', 4.7, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for v.nair.lmo@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- ==========================================================
  -- 2. GATC APPROVED TEST CENTRES (8 TOTAL)
  -- Each institutional GATC entity links to an authenticated officer profile.
  -- ==========================================================

  -- GATC 1: Western India Weights & Measures Test Centre
  SELECT id INTO gatc1_uid FROM auth.users WHERE email = 'wiwmtc.gatc@maapsetu.gov.in';
  IF gatc1_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc1_uid, 'Western India Weights & Measures Test Centre', 'wiwmtc.gatc@maapsetu.gov.in', '+91 2222 100001', 'officer', 'Western India Weights & Measures Test Centre', 'Mumbai Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc1_id, gatc1_uid, 'GATC', 'GATC-MH-001', 'Government Approved Test Centre', 'Mumbai', '+91 2222 100001', 'wiwmtc.gatc@maapsetu.gov.in', 4.8, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for wiwmtc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 2: Maharashtra Precision Measurement Centre
  SELECT id INTO gatc2_uid FROM auth.users WHERE email = 'mpmc.gatc@maapsetu.gov.in';
  IF gatc2_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc2_uid, 'Maharashtra Precision Measurement Centre', 'mpmc.gatc@maapsetu.gov.in', '+91 2222 100002', 'officer', 'Maharashtra Precision Measurement Centre', 'Mumbai Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc2_id, gatc2_uid, 'GATC', 'GATC-MH-002', 'Government Approved Test Centre', 'Mumbai', '+91 2222 100002', 'mpmc.gatc@maapsetu.gov.in', 4.7, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for mpmc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 3: Pune Instrument Compliance Laboratory
  SELECT id INTO gatc3_uid FROM auth.users WHERE email = 'picl.gatc@maapsetu.gov.in';
  IF gatc3_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc3_uid, 'Pune Instrument Compliance Laboratory', 'picl.gatc@maapsetu.gov.in', '+91 2023 100003', 'officer', 'Pune Instrument Compliance Laboratory', 'Pune Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc3_id, gatc3_uid, 'GATC', 'GATC-MH-003', 'Government Approved Test Centre', 'Pune', '+91 2023 100003', 'picl.gatc@maapsetu.gov.in', 4.9, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for picl.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 4: Nagpur Weights & Measures Testing Centre
  SELECT id INTO gatc4_uid FROM auth.users WHERE email = 'nwmtc.gatc@maapsetu.gov.in';
  IF gatc4_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc4_uid, 'Nagpur Weights & Measures Testing Centre', 'nwmtc.gatc@maapsetu.gov.in', '+91 7122 100004', 'officer', 'Nagpur Weights & Measures Testing Centre', 'Nagpur Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc4_id, gatc4_uid, 'GATC', 'GATC-MH-004', 'Government Approved Test Centre', 'Nagpur', '+91 7122 100004', 'nwmtc.gatc@maapsetu.gov.in', 4.6, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for nwmtc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 5: Mumbai Legal Metrology Test Centre
  SELECT id INTO gatc5_uid FROM auth.users WHERE email = 'mlmtc.gatc@maapsetu.gov.in';
  IF gatc5_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc5_uid, 'Mumbai Legal Metrology Test Centre', 'mlmtc.gatc@maapsetu.gov.in', '+91 2222 100005', 'officer', 'Mumbai Legal Metrology Test Centre', 'Mumbai Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc5_id, gatc5_uid, 'GATC', 'GATC-MH-005', 'Government Approved Test Centre', 'Mumbai', '+91 2222 100005', 'mlmtc.gatc@maapsetu.gov.in', 4.8, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for mlmtc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 6: Nashik Measurement Standards Centre
  SELECT id INTO gatc6_uid FROM auth.users WHERE email = 'nmsc.gatc@maapsetu.gov.in';
  IF gatc6_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc6_uid, 'Nashik Measurement Standards Centre', 'nmsc.gatc@maapsetu.gov.in', '+91 2532 100006', 'officer', 'Nashik Measurement Standards Centre', 'Nashik Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc6_id, gatc6_uid, 'GATC', 'GATC-MH-006', 'Government Approved Test Centre', 'Nashik', '+91 2532 100006', 'nmsc.gatc@maapsetu.gov.in', 4.7, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for nmsc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 7: Aurangabad Instrument Verification Centre
  SELECT id INTO gatc7_uid FROM auth.users WHERE email = 'aivc.gatc@maapsetu.gov.in';
  IF gatc7_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc7_uid, 'Aurangabad Instrument Verification Centre', 'aivc.gatc@maapsetu.gov.in', '+91 2402 100007', 'officer', 'Aurangabad Instrument Verification Centre', 'Aurangabad Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc7_id, gatc7_uid, 'GATC', 'GATC-MH-007', 'Government Approved Test Centre', 'Aurangabad', '+91 2402 100007', 'aivc.gatc@maapsetu.gov.in', 4.5, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for aivc.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

  -- GATC 8: Kolhapur Weights & Measures Laboratory
  SELECT id INTO gatc8_uid FROM auth.users WHERE email = 'kwml.gatc@maapsetu.gov.in';
  IF gatc8_uid IS NOT NULL THEN
    INSERT INTO profiles (id, name, email, phone, role, organization, jurisdiction, is_active)
    VALUES (gatc8_uid, 'Kolhapur Weights & Measures Laboratory', 'kwml.gatc@maapsetu.gov.in', '+91 2312 100008', 'officer', 'Kolhapur Weights & Measures Laboratory', 'Kolhapur Division', true)
    ON CONFLICT (id) DO UPDATE SET role = 'officer', name = EXCLUDED.name, is_active = true;

    INSERT INTO officers (id, user_id, officer_type, employee_code, designation, zone, phone, email, rating, is_available)
    VALUES (gatc8_id, gatc8_uid, 'GATC', 'GATC-MH-008', 'Government Approved Test Centre', 'Kolhapur', '+91 2312 100008', 'kwml.gatc@maapsetu.gov.in', 4.9, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Auth user for kwml.gatc@maapsetu.gov.in not found. Create via Supabase Dashboard to link.';
  END IF;

END $$;
