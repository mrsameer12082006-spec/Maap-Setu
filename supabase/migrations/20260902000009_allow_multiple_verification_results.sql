-- 20260902000009_allow_multiple_verification_results.sql
-- Allow multiple verification results per application to support re-inspection / verification history.
--
-- ROOT CAUSE:
--   In 20260829000001_initial_schema.sql, the verification_results table was defined with:
--     application_id UUID UNIQUE NOT NULL REFERENCES applications(id)
--   PostgreSQL automatically created the unique constraint:
--     "verification_results_application_id_key"
--   When an application undergoes a subsequent verification / re-inspection attempt,
--   inserting a second row fails with:
--     duplicate key value violates unique constraint "verification_results_application_id_key"
--
-- ARCHITECTURAL REQUIREMENTS:
--   1. Drop the UNIQUE constraint on application_id so ONE application can have MANY verification_results.
--   2. Preserve primary key (id UUID PRIMARY KEY).
--   3. Preserve foreign keys to applications(id) and officers(id).
--   4. Preserve CHECK constraint (check_fail_reason).
--   5. Add compound index on (application_id, created_at DESC) for efficient retrieval of verification history.

-- Step 1: Drop the unique constraint on application_id
ALTER TABLE public.verification_results
DROP CONSTRAINT IF EXISTS verification_results_application_id_key;

-- Step 2: Create index on (application_id, created_at DESC) for ordered history queries
CREATE INDEX IF NOT EXISTS idx_verification_results_application_created
ON public.verification_results (application_id, created_at DESC);
