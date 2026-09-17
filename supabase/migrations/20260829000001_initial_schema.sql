-- 001_initial_schema.sql



-- 1. PROFILES (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('business', 'lmd', 'officer')),
    organization TEXT,
    jurisdiction TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTRUMENTS
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    instrument_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('weighbridge', 'retail_scale', 'fuel_dispenser', 'flowmeter', 'package_scale', 'lab_balance')),
    serial_number TEXT UNIQUE NOT NULL,
    model_number TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    max_capacity TEXT NOT NULL,
    min_capacity TEXT,
    unit_of_measurement TEXT NOT NULL,
    accuracy_class TEXT NOT NULL,
    scale_interval TEXT,
    quantity INTEGER DEFAULT 1,
    installation_location TEXT NOT NULL,
    premises_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    model_approval_no TEXT,
    previous_certificate_no TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'under_verification', 'rejected')),
    last_verification_date DATE,
    next_reverification_due DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFICERS
CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    officer_type TEXT NOT NULL CHECK(officer_type IN ('LMO', 'GATC')),
    employee_code TEXT UNIQUE,
    designation TEXT NOT NULL,
    zone TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    active_assignments_count INTEGER DEFAULT 0,
    rating NUMERIC(3,1) DEFAULT 5.0,
    avatar_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPLICATIONS
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    applicant_id UUID NOT NULL REFERENCES profiles(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    application_type TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'passed', 'failed')),
    preferred_date DATE,
    inspection_location TEXT NOT NULL,
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    assigned_officer_id UUID REFERENCES officers(id),
    assigned_date DATE,
    scheduled_inspection_date DATE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VERIFICATION RESULTS
CREATE TABLE verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES applications(id),
    officer_id UUID NOT NULL REFERENCES officers(id),
    outcome TEXT NOT NULL CHECK(outcome IN ('PASS', 'FAIL')),
    checklist_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    technical_test_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    officer_remarks TEXT,
    rejection_reason TEXT,
    photo_evidence_urls JSONB DEFAULT '[]'::jsonb,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_fail_reason CHECK (
        (outcome = 'PASS' AND rejection_reason IS NULL) OR 
        (outcome = 'FAIL' AND rejection_reason IS NOT NULL)
    )
);

-- 6. CERTIFICATES
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES applications(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    certificate_number TEXT UNIQUE NOT NULL,
    instrument_type TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    capacity TEXT NOT NULL,
    accuracy_class TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_address TEXT NOT NULL,
    verification_authority TEXT NOT NULL,
    verification_officer TEXT NOT NULL,
    verification_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT DEFAULT 'VERIFIED' CHECK(status IN ('VERIFIED', 'EXPIRED', 'REVOKED')),
    seal_number TEXT,
    qr_code_token UUID UNIQUE DEFAULT gen_random_uuid(),
    remarks TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APP TIMELINE
CREATE TABLE app_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    step TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    actor_user_id UUID REFERENCES profiles(id),
    actor_role TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVITY LOGS
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_instrument_id ON applications(instrument_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_assigned_officer_id ON applications(assigned_officer_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_expiry_date ON certificates(expiry_date);
CREATE INDEX idx_instruments_owner_id ON instruments(owner_id);
CREATE INDEX idx_verification_results_application_id ON verification_results(application_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_instruments_modtime BEFORE UPDATE ON instruments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_officers_modtime BEFORE UPDATE ON officers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_applications_modtime BEFORE UPDATE ON applications FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_verification_results_modtime BEFORE UPDATE ON verification_results FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_certificates_modtime BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
