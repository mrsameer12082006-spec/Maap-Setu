-- PRE-DEPLOYMENT DATA RECONCILIATION & SAFETY CHECK
-- Execute this read-only script against the linked database before deploying Migration 18A

DO $$
DECLARE
    v_count INT;
    v_distinct_apps INT;
    v_app20 RECORD;
    v_app22 RECORD;
    v_premise_count INT;
    v_rls_count INT;
BEGIN
    -- 1. Check Applications Count (Expected: >= 21 based on last known state)
    SELECT COUNT(*) INTO v_count FROM applications;
    RAISE NOTICE 'Total applications: %', v_count;
    
    -- 2. Check Distinct Application Numbers
    SELECT COUNT(DISTINCT application_number) INTO v_distinct_apps FROM applications;
    IF v_count != v_distinct_apps THEN
        RAISE WARNING 'Duplicate application numbers exist (Total: %, Distinct: %)', v_count, v_distinct_apps;
    ELSE
        RAISE NOTICE 'All application numbers are distinct (Count: %)', v_distinct_apps;
    END IF;

    -- 3. Check APP-2026-0020 is quarantined
    SELECT * INTO v_app20 FROM applications WHERE application_number = 'APP-2026-0020';
    IF NOT FOUND THEN
        RAISE WARNING 'APP-2026-0020 does not exist';
    ELSE
        IF v_app20.inspection_state_id IS NOT NULL THEN
            RAISE WARNING 'APP-2026-0020 is mapped (inspection_state_id is NOT NULL)';
        ELSE
            RAISE NOTICE 'APP-2026-0020 is safely quarantined (unmapped)';
        END IF;
    END IF;

    -- 4. Check APP-2026-0022 is quarantined
    SELECT * INTO v_app22 FROM applications WHERE application_number = 'APP-2026-0022';
    IF NOT FOUND THEN
        RAISE WARNING 'APP-2026-0022 does not exist';
    ELSE
        IF v_app22.inspection_state_id IS NOT NULL THEN
            RAISE WARNING 'APP-2026-0022 is mapped (inspection_state_id is NOT NULL)';
        ELSE
            RAISE NOTICE 'APP-2026-0022 is safely quarantined (unmapped)';
        END IF;
    END IF;

    -- 5. Check current business_premises count
    SELECT COUNT(*) INTO v_premise_count FROM business_premises;
    RAISE NOTICE 'Current business_premises count: %', v_premise_count;

    -- 6. Current RLS policy inventory check
    SELECT COUNT(*) INTO v_rls_count FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('applications', 'verification_results', 'certificates', 'business_premises');
    RAISE NOTICE 'Current RLS policy count across target tables: %', v_rls_count;
END $$;

-- Explicitly dump the RLS inventory for visual verification
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('applications', 'verification_results', 'certificates', 'business_premises')
ORDER BY tablename, policyname;
