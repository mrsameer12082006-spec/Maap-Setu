DO $$
DECLARE
    v_col_exists BOOLEAN;
BEGIN
    -- 1. Check applications table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'applications'
    ) THEN
        RAISE EXCEPTION 'Precondition failed: Table applications does not exist';
    END IF;

    -- 2. Check business_premises table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'business_premises'
    ) THEN
        RAISE EXCEPTION 'Precondition failed: Table business_premises does not exist';
    END IF;

    -- 3. Check business_premise_id column does not already exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'business_premise_id'
    ) INTO v_col_exists;

    IF v_col_exists THEN
        RAISE EXCEPTION 'Precondition failed: Column business_premise_id already exists in applications';
    END IF;
END $$;

-- Schema Modification
ALTER TABLE applications
ADD COLUMN business_premise_id UUID REFERENCES business_premises(id) ON DELETE RESTRICT;

CREATE INDEX idx_applications_business_premise_id
ON applications(business_premise_id);

-- Postconditions
DO $$
DECLARE
    v_not_null_count INT;
    v_col_type TEXT;
    v_col_nullable TEXT;
    v_col_default TEXT;
    v_fk_exists BOOLEAN;
    v_fk_rule TEXT;
    v_idx_exists BOOLEAN;
BEGIN
    -- 1. Verify all existing business_premise_id values are NULL
    SELECT COUNT(*) INTO v_not_null_count FROM applications WHERE business_premise_id IS NOT NULL;
    IF v_not_null_count != 0 THEN
        RAISE EXCEPTION 'Postcondition failed: All existing applications must have business_premise_id = NULL';
    END IF;

    -- 2. Verify column definition
    SELECT data_type, is_nullable, column_default 
    INTO v_col_type, v_col_nullable, v_col_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'applications' 
      AND column_name = 'business_premise_id';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Postcondition failed: Column business_premise_id does not exist';
    END IF;

    IF v_col_type != 'uuid' THEN
        RAISE EXCEPTION 'Postcondition failed: Column data_type must be uuid (found %)', v_col_type;
    END IF;
    IF v_col_nullable != 'YES' THEN
        RAISE EXCEPTION 'Postcondition failed: Column is_nullable must be YES (found %)', v_col_nullable;
    END IF;
    IF v_col_default IS NOT NULL THEN
        RAISE EXCEPTION 'Postcondition failed: Column must have no default value';
    END IF;

    -- 3. Verify FK exists and ON DELETE RESTRICT
    SELECT tc.constraint_type, rc.delete_rule 
    INTO v_col_type, v_fk_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints rc 
      ON tc.constraint_name = rc.constraint_name AND tc.constraint_schema = rc.constraint_schema
    WHERE tc.table_schema = 'public' 
      AND tc.table_name = 'applications' 
      AND kcu.column_name = 'business_premise_id' 
      AND tc.constraint_type = 'FOREIGN KEY';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Postcondition failed: Foreign key does not exist';
    END IF;
    IF v_fk_rule != 'RESTRICT' THEN
        RAISE EXCEPTION 'Postcondition failed: Foreign key ON DELETE must be RESTRICT (found %)', v_fk_rule;
    END IF;

    -- 4. Verify index exists
    SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'applications'
          AND indexname = 'idx_applications_business_premise_id'
    ) INTO v_idx_exists;

    IF NOT v_idx_exists THEN
        RAISE EXCEPTION 'Postcondition failed: Index idx_applications_business_premise_id does not exist';
    END IF;
END $$;
