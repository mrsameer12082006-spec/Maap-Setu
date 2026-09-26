-- 20260926000019_demo_expiring_certificates.sql
-- Description: Adds two explicitly requested expiring demo instruments and their certificates.
-- Note: As per authoritative seed conventions (Zero pre-seeded certificates), no third baseline certificate is fabricated.

DO $$
DECLARE
  biz_uid UUID := '43e8a4d1-a30b-4174-b4e1-e0c8790e0f66';  -- business.demo@maapsetu.demo (Vikramaditya Mehta)
  lmo1_id UUID := 'b1b1b1b1-0001-0001-0001-000000000001';  -- officers.id for lmo01@maapsetu.demo

  -- New Instrument 9 (Expiring 1)
  inst9_id UUID := 'd9999999-0001-0001-0001-000000000009';
  app9_id UUID := 'e9999999-0001-0001-0001-000000000009';
  cert9_id UUID := 'c9999999-0001-0001-0001-000000000009';

  -- New Instrument 10 (Expiring 2)
  inst10_id UUID := 'd0000000-0002-0001-0001-000000000010';
  app10_id UUID := 'e0000000-0002-0001-0001-000000000010';
  cert10_id UUID := 'c0000000-0002-0001-0001-000000000010';
BEGIN
  -- ==============================================================================
  -- 1. NEW INSTRUMENT 9 (Expiring Soon)
  -- ==============================================================================
  INSERT INTO public.instruments (
    id, owner_id, instrument_name, category, serial_number, model_number, manufacturer,
    max_capacity, unit_of_measurement, accuracy_class, scale_interval, quantity, 
    installation_location, premises_name, state, district, status
  )
  VALUES (
    inst9_id, biz_uid, 'Fuel Dispensing Meter (Multi-Product)', 'fuel_dispenser', 'GV-994120-F', 'Horizon-5000', 'Gilbarco Veeder-Root',
    '80', 'L/min', 'Class 0.5', '10 ml', 1, 
    'BPCL Petrol Outlet, Station Hub #2, Pune', 'BPCL Hub 2', 'Maharashtra', 'Pune', 'active'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, completed_at, submitted_at, reviewed_at
  )
  VALUES (
    app9_id, 'APP-2025-4401', biz_uid, inst9_id, 'Initial Verification', 'passed',
    'BPCL Petrol Outlet, Station Hub #2, Pune', lmo1_id, '2025-10-11', '2025-10-01', '2025-10-05'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.certificates (
    id, application_id, instrument_id, certificate_number, instrument_type, serial_number, 
    manufacturer, model, capacity, accuracy_class, owner_name, owner_address, 
    verification_authority, verification_officer, verification_date, expiry_date, status, 
    seal_number, qr_code_token
  )
  VALUES (
    cert9_id, app9_id, inst9_id, 'CERT-2026-4401', 'fuel_dispenser', 'GV-994120-F',
    'Gilbarco Veeder-Root', 'Horizon-5000', '80 L/min', 'Class 0.5 (Fuel Dispenser)', 'Apex Logistics & Freight Corp', 'BPCL Petrol Outlet, Station Hub #2, Pune',
    'Legal Metrology Department, Govt of Maharashtra', 'Inspector Rajesh V. Sharma (Badge #LMO-NGP-442)',
    '2025-10-11', '2026-10-10', 'VERIFIED', 'LMD-MH-PUN-2025-1011', 'f9999999-0001-0001-0001-000000000009'
  ) ON CONFLICT (id) DO NOTHING;


  -- ==============================================================================
  -- 2. NEW INSTRUMENT 10 (Expiring Soon)
  -- ==============================================================================
  INSERT INTO public.instruments (
    id, owner_id, instrument_name, category, serial_number, model_number, manufacturer,
    max_capacity, unit_of_measurement, accuracy_class, scale_interval, quantity, 
    installation_location, premises_name, state, district, status
  )
  VALUES (
    inst10_id, biz_uid, 'Retail Digital Counter Scale', 'retail_scale', 'ES-331092', 'DS-252', 'Essae-Teraoka',
    '30', 'kg', 'Class II', '1 g', 1, 
    'Apex Logistics Central Store, Sector 17', 'Apex Logistics Central Store', 'Maharashtra', 'Pune', 'active'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.applications (
    id, application_number, applicant_id, instrument_id, application_type, status,
    inspection_location, assigned_officer_id, completed_at, submitted_at, reviewed_at
  )
  VALUES (
    app10_id, 'APP-2025-7812', biz_uid, inst10_id, 'Initial Verification', 'passed',
    'Apex Logistics Central Store, Sector 17', lmo1_id, '2025-10-19', '2025-10-10', '2025-10-12'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.certificates (
    id, application_id, instrument_id, certificate_number, instrument_type, serial_number, 
    manufacturer, model, capacity, accuracy_class, owner_name, owner_address, 
    verification_authority, verification_officer, verification_date, expiry_date, status, 
    seal_number, qr_code_token
  )
  VALUES (
    cert10_id, app10_id, inst10_id, 'CERT-2026-7812', 'retail_scale', 'ES-331092',
    'Essae-Teraoka', 'DS-252', '30 kg', 'Class II (High Accuracy)', 'Apex Logistics & Freight Corp', 'Apex Logistics Central Store, Sector 17',
    'Legal Metrology Department, Govt of Maharashtra', 'Inspector Rajesh V. Sharma (Badge #LMO-NGP-442)',
    '2025-10-19', '2026-10-18', 'VERIFIED', 'LMD-MH-PUN-2025-1019', 'f0000000-0002-0001-0001-000000000010'
  ) ON CONFLICT (id) DO NOTHING;

END $$;
