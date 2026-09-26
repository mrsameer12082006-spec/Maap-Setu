-- Migration 16: Deterministic Application Geography Backfill
-- Maps exactly 19 legacy applications to explicit LGD geographies.
-- Quarantines exactly 1 contradictory application (APP-2026-0020).

DO $$
DECLARE
    mh_state_id UUID;
    nagpur_dist_id UUID;
    pune_dist_id UUID;
    mh_name TEXT;
    nagpur_name TEXT;
    pune_name TEXT;
    v_count INT;
BEGIN
    -- ==========================================
    -- 1. PRECONDITIONS
    -- ==========================================
    
    -- 1. Confirm exactly 20 rows in applications
    SELECT COUNT(*) INTO v_count FROM applications;
    IF v_count != 20 THEN
        RAISE EXCEPTION 'Precondition Failed: applications contains % rows, expected exactly 20.', v_count;
    END IF;

    -- 2. Confirm exactly 20 distinct application_numbers exist
    SELECT COUNT(DISTINCT application_number) INTO v_count FROM applications;
    IF v_count != 20 THEN
        RAISE EXCEPTION 'Precondition Failed: applications contains % distinct application_numbers, expected 20.', v_count;
    END IF;

    -- 3. Confirm all 19 SAFE_TO_MAP application_numbers exist exactly once
    SELECT COUNT(*) INTO v_count FROM applications WHERE application_number IN (
        'APP-2026-0001', 'APP-2026-0002', 'APP-2026-0003', 'APP-2026-0004', 'APP-2026-0005', 
        'APP-2026-0006', 'APP-2026-0007', 'APP-2026-0008', 'APP-2026-0010', 'APP-2026-0011', 
        'APP-2026-0012', 'APP-2026-0013', 'APP-2026-0014', 'APP-2026-0015', 'APP-2026-0016', 
        'APP-2026-0017', 'APP-2026-0018', 'APP-2026-0019', 'APP-2026-0021'
    );
    IF v_count != 19 THEN
        RAISE EXCEPTION 'Precondition Failed: SAFE_TO_MAP applications count is %, expected 19.', v_count;
    END IF;

    -- 4. Confirm APP-2026-0020 exists exactly once
    SELECT COUNT(*) INTO v_count FROM applications WHERE application_number = 'APP-2026-0020';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: APP-2026-0020 count is %, expected 1.', v_count;
    END IF;

    -- 5. Confirm ALL 20 applications currently have NULL for ALL 8 new Phase 3A columns
    SELECT COUNT(*) INTO v_count FROM applications 
    WHERE inspection_state_id IS NULL 
      AND inspection_district_id IS NULL 
      AND inspection_subdistrict_id IS NULL
      AND snapshot_state_name IS NULL
      AND snapshot_district_name IS NULL
      AND snapshot_subdistrict_name IS NULL
      AND snapshot_pincode IS NULL
      AND snapshot_address IS NULL;
    IF v_count != 20 THEN
        RAISE EXCEPTION 'Precondition Failed: Expected 20 applications with all 8 new geography columns completely NULL, found %.', v_count;
    END IF;

    -- 6. Confirm LGD '27' exists exactly once in geo_states
    SELECT COUNT(*) INTO v_count FROM geo_states WHERE lgd_code = '27';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: LGD 27 geo_states count is %, expected 1.', v_count;
    END IF;

    -- 7. Confirm LGD '484' exists exactly once in geo_districts
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code = '484';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: LGD 484 geo_districts count is %, expected 1.', v_count;
    END IF;

    -- 8. Confirm LGD '490' exists exactly once in geo_districts
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code = '490';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: LGD 490 geo_districts count is %, expected 1.', v_count;
    END IF;

    -- Fetch canonical master data references
    SELECT state_id, name INTO mh_state_id, mh_name FROM geo_states WHERE lgd_code = '27';
    SELECT district_id, name INTO nagpur_dist_id, nagpur_name FROM geo_districts WHERE lgd_code = '484';
    SELECT district_id, name INTO pune_dist_id, pune_name FROM geo_districts WHERE lgd_code = '490';

    -- 9. Confirm all resolved district rows belong to state LGD '27'
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code IN ('484', '490') AND state_id != mh_state_id;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Precondition Failed: Resolved districts do not logically belong to Maharashtra state_id.';
    END IF;

    -- ==========================================
    -- 2. BACKFILL EXECUTION
    -- ==========================================

    -- A. Map Nagpur applications (9 rows)
    UPDATE applications SET 
        inspection_state_id = mh_state_id,
        inspection_district_id = nagpur_dist_id,
        snapshot_state_name = mh_name,
        snapshot_district_name = nagpur_name,
        snapshot_address = inspection_location
    WHERE application_number IN (
        'APP-2026-0001', 'APP-2026-0002', 'APP-2026-0003', 'APP-2026-0004', 
        'APP-2026-0005', 'APP-2026-0006', 'APP-2026-0007', 'APP-2026-0008', 'APP-2026-0010'
    );

    -- B. Map Pune applications (10 rows)
    UPDATE applications SET 
        inspection_state_id = mh_state_id,
        inspection_district_id = pune_dist_id,
        snapshot_state_name = mh_name,
        snapshot_district_name = pune_name,
        snapshot_address = inspection_location
    WHERE application_number IN (
        'APP-2026-0011', 'APP-2026-0012', 'APP-2026-0013', 'APP-2026-0014', 'APP-2026-0015',
        'APP-2026-0016', 'APP-2026-0017', 'APP-2026-0018', 'APP-2026-0019', 'APP-2026-0021'
    );

    -- C. Quarantine Contradictory application (1 row)
    UPDATE applications SET 
        snapshot_address = inspection_location
    WHERE application_number = 'APP-2026-0020';

    -- ==========================================
    -- 3. POST-BACKFILL ASSERTIONS
    -- ==========================================

    -- 1. Exactly 9 Nagpur applications have exact geography matching mh_state_id and nagpur_dist_id
    SELECT COUNT(*) INTO v_count FROM applications WHERE inspection_state_id = mh_state_id AND inspection_district_id = nagpur_dist_id;
    IF v_count != 9 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 9 Nagpur mapped apps, found %.', v_count;
    END IF;

    -- 2. Exactly 10 Pune applications have exact geography matching mh_state_id and pune_dist_id
    SELECT COUNT(*) INTO v_count FROM applications WHERE inspection_state_id = mh_state_id AND inspection_district_id = pune_dist_id;
    IF v_count != 10 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 10 Pune mapped apps, found %.', v_count;
    END IF;

    -- 3. Exactly 19 applications have both non-null state and district IDs
    SELECT COUNT(*) INTO v_count FROM applications WHERE inspection_state_id IS NOT NULL AND inspection_district_id IS NOT NULL;
    IF v_count != 19 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 19 apps with non-null state and district IDs, found %.', v_count;
    END IF;

    -- 4. Exactly 0 applications have non-null subdistrict IDs
    SELECT COUNT(*) INTO v_count FROM applications WHERE inspection_subdistrict_id IS NOT NULL;
    IF v_count != 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected 0 apps with non-null inspection_subdistrict_id, found %.', v_count;
    END IF;

    -- 5. Exactly 19 applications have snapshot_state_name = mh_name
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_state_name = mh_name;
    IF v_count != 19 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 19 apps with snapshot_state_name = mh_name, found %.', v_count;
    END IF;

    -- 6. Exactly 9 applications have snapshot_district_name = nagpur_name
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_district_name = nagpur_name;
    IF v_count != 9 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 9 apps with snapshot_district_name = nagpur_name, found %.', v_count;
    END IF;

    -- 7. Exactly 10 applications have snapshot_district_name = pune_name
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_district_name = pune_name;
    IF v_count != 10 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 10 apps with snapshot_district_name = pune_name, found %.', v_count;
    END IF;

    -- 8. Exactly 20 applications have snapshot_address = inspection_location
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_address = inspection_location;
    IF v_count != 20 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected 20 apps with snapshot_address = inspection_location, found %.', v_count;
    END IF;

    -- 9. Exactly 20 applications have snapshot_pincode IS NULL
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_pincode IS NOT NULL;
    IF v_count != 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected 0 apps with non-null snapshot_pincode, found %.', v_count;
    END IF;

    -- 10. Exactly 20 applications have snapshot_subdistrict_name IS NULL
    SELECT COUNT(*) INTO v_count FROM applications WHERE snapshot_subdistrict_name IS NOT NULL;
    IF v_count != 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected 0 apps with non-null snapshot_subdistrict_name, found %.', v_count;
    END IF;

    -- 11. APP-2026-0020 specifically remains UNMAPPED and correctly snapshotted
    SELECT COUNT(*) INTO v_count FROM applications 
    WHERE application_number = 'APP-2026-0020' 
      AND inspection_state_id IS NULL 
      AND inspection_district_id IS NULL 
      AND inspection_subdistrict_id IS NULL
      AND snapshot_state_name IS NULL
      AND snapshot_district_name IS NULL
      AND snapshot_subdistrict_name IS NULL
      AND snapshot_pincode IS NULL
      AND snapshot_address = inspection_location;
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Assertion Failed: APP-2026-0020 was improperly mapped or fields corrupted.';
    END IF;

    -- 12. Exactly 20 total applications remain in the table
    SELECT COUNT(*) INTO v_count FROM applications;
    IF v_count != 20 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected exactly 20 total applications, found %.', v_count;
    END IF;

END $$;
