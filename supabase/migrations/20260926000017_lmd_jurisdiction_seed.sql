-- Migration 17: Seed LMD Jurisdictions for Demo Application Routing

DO $$
DECLARE
    mh_state_id UUID;
    nagpur_dist_id UUID;
    pune_dist_id UUID;
    v_count INT;
    lmd01_id UUID;
    lmd02_id UUID;
    lmd03_id UUID;
    lmd04_id UUID;
    lmd05_id UUID;
    lmd06_id UUID;
    lmd07_id UUID;
    lmd08_id UUID;
BEGIN
    -- ==========================================
    -- 1. PRECONDITIONS
    -- ==========================================
    
    -- 1. Confirm exactly 8 lmd profiles exist.
    SELECT COUNT(*) INTO v_count FROM profiles WHERE role = 'lmd';
    IF v_count != 8 THEN
        RAISE EXCEPTION 'Precondition Failed: Expected exactly 8 lmd profiles, found %.', v_count;
    END IF;

    -- 2. Confirm user_jurisdictions is empty.
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions;
    IF v_count != 0 THEN
        RAISE EXCEPTION 'Precondition Failed: user_jurisdictions is not empty. Found % rows.', v_count;
    END IF;

    -- 3. Confirm Maharashtra LGD ''27'' exists exactly once.
    SELECT COUNT(*) INTO v_count FROM geo_states WHERE lgd_code = '27';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: Expected 1 Maharashtra state (LGD 27), found %.', v_count;
    END IF;

    -- 4. Confirm Nagpur LGD ''484'' exists exactly once.
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code = '484';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: Expected 1 Nagpur district (LGD 484), found %.', v_count;
    END IF;

    -- 5. Confirm Pune LGD ''490'' exists exactly once.
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code = '490';
    IF v_count != 1 THEN
        RAISE EXCEPTION 'Precondition Failed: Expected 1 Pune district (LGD 490), found %.', v_count;
    END IF;

    -- Resolve Master Data
    SELECT state_id INTO mh_state_id FROM geo_states WHERE lgd_code = '27';
    SELECT district_id INTO nagpur_dist_id FROM geo_districts WHERE lgd_code = '484';
    SELECT district_id INTO pune_dist_id FROM geo_districts WHERE lgd_code = '490';

    -- 6. Confirm Nagpur and Pune belong to Maharashtra.
    SELECT COUNT(*) INTO v_count FROM geo_districts WHERE lgd_code IN ('484', '490') AND state_id != mh_state_id;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Precondition Failed: Resolved districts do not structurally belong to Maharashtra state_id.';
    END IF;

    -- 7. Confirm every target email exists exactly once with role=''lmd'' and extract IDs.
    -- lmd01
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd01@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd01 missing or duplicated.'; END IF;
    SELECT id INTO lmd01_id FROM profiles WHERE email = 'lmd01@maapsetu.demo' AND role = 'lmd';
    
    -- lmd02
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd02@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd02 missing or duplicated.'; END IF;
    SELECT id INTO lmd02_id FROM profiles WHERE email = 'lmd02@maapsetu.demo' AND role = 'lmd';
    
    -- lmd03
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd03@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd03 missing or duplicated.'; END IF;
    SELECT id INTO lmd03_id FROM profiles WHERE email = 'lmd03@maapsetu.demo' AND role = 'lmd';

    -- lmd04
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd04@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd04 missing or duplicated.'; END IF;
    SELECT id INTO lmd04_id FROM profiles WHERE email = 'lmd04@maapsetu.demo' AND role = 'lmd';

    -- lmd05
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd05@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd05 missing or duplicated.'; END IF;
    SELECT id INTO lmd05_id FROM profiles WHERE email = 'lmd05@maapsetu.demo' AND role = 'lmd';

    -- lmd06
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd06@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd06 missing or duplicated.'; END IF;
    SELECT id INTO lmd06_id FROM profiles WHERE email = 'lmd06@maapsetu.demo' AND role = 'lmd';

    -- lmd07
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd07@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd07 missing or duplicated.'; END IF;
    SELECT id INTO lmd07_id FROM profiles WHERE email = 'lmd07@maapsetu.demo' AND role = 'lmd';

    -- lmd08
    SELECT COUNT(*) INTO v_count FROM profiles WHERE email = 'lmd08@maapsetu.demo' AND role = 'lmd';
    IF v_count != 1 THEN RAISE EXCEPTION 'Precondition Failed: lmd08 missing or duplicated.'; END IF;
    SELECT id INTO lmd08_id FROM profiles WHERE email = 'lmd08@maapsetu.demo' AND role = 'lmd';


    -- ==========================================
    -- 2. INSERT JURISDICTIONS
    -- ==========================================

    INSERT INTO user_jurisdictions (user_id, state_id, district_id, is_active)
    VALUES 
        -- STATEWIDE
        (lmd01_id, mh_state_id, NULL, true),
        (lmd08_id, mh_state_id, NULL, true),
        -- NAGPUR
        (lmd02_id, mh_state_id, nagpur_dist_id, true),
        (lmd04_id, mh_state_id, nagpur_dist_id, true),
        (lmd06_id, mh_state_id, nagpur_dist_id, true),
        -- PUNE
        (lmd03_id, mh_state_id, pune_dist_id, true),
        (lmd05_id, mh_state_id, pune_dist_id, true),
        (lmd07_id, mh_state_id, pune_dist_id, true);

    -- ==========================================
    -- 3. POSTCONDITIONS
    -- ==========================================

    -- 1. Assert user_jurisdictions count = 8.
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions;
    IF v_count != 8 THEN
        RAISE EXCEPTION 'Assertion Failed: Expected 8 rows in user_jurisdictions, found %.', v_count;
    END IF;

    -- 2. lmd01 has exactly one: Maharashtra + district NULL
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE user_id = lmd01_id AND state_id = mh_state_id AND district_id IS NULL;
    IF v_count != 1 THEN RAISE EXCEPTION 'Assertion Failed: lmd01 jurisdiction invalid.'; END IF;

    -- 3. lmd08 has exactly one: Maharashtra + district NULL
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE user_id = lmd08_id AND state_id = mh_state_id AND district_id IS NULL;
    IF v_count != 1 THEN RAISE EXCEPTION 'Assertion Failed: lmd08 jurisdiction invalid.'; END IF;

    -- 4. lmd02/lmd04/lmd06 each has exactly one: Maharashtra + Nagpur
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE user_id IN (lmd02_id, lmd04_id, lmd06_id) AND state_id = mh_state_id AND district_id = nagpur_dist_id;
    IF v_count != 3 THEN RAISE EXCEPTION 'Assertion Failed: Nagpur jurisdiction mapping invalid.'; END IF;

    -- 5. lmd03/lmd05/lmd07 each has exactly one: Maharashtra + Pune
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE user_id IN (lmd03_id, lmd05_id, lmd07_id) AND state_id = mh_state_id AND district_id = pune_dist_id;
    IF v_count != 3 THEN RAISE EXCEPTION 'Assertion Failed: Pune jurisdiction mapping invalid.'; END IF;

    -- 6. All 8 rows are active.
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE is_active = true;
    IF v_count != 8 THEN
        RAISE EXCEPTION 'Assertion Failed: Not all jurisdiction rows are active.';
    END IF;

    -- 7. No duplicate active jurisdiction exists.
    SELECT COUNT(*) INTO v_count FROM (
        SELECT user_id, state_id, district_id FROM user_jurisdictions WHERE is_active = true GROUP BY user_id, state_id, district_id HAVING COUNT(*) > 1
    ) as dups;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Duplicate active jurisdictions exist.';
    END IF;

    -- 8. No non-LMD user received a jurisdiction row.
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions uj
    JOIN profiles p ON p.id = uj.user_id
    WHERE p.role != 'lmd';
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Non-LMD user found in user_jurisdictions.';
    END IF;

    -- 9. No jurisdiction references a district outside Maharashtra.
    SELECT COUNT(*) INTO v_count FROM user_jurisdictions WHERE state_id != mh_state_id;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Assertion Failed: Jurisdiction found referencing a state outside Maharashtra.';
    END IF;

END $$;
