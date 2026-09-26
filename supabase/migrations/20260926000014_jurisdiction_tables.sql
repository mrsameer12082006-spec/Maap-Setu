-- Migration 14: Jurisdiction and Premises Tables
-- Phase 2 implementation of Multistate Geography architecture

CREATE TABLE business_premises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES profiles(id),
    premises_type TEXT NOT NULL CHECK(premises_type IN ('REGISTERED_OFFICE', 'INSPECTION_SITE', 'MANUFACTURING_UNIT', 'REPAIR_WORKSHOP')),
    premises_name TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    state_id UUID NOT NULL,
    district_id UUID NOT NULL,
    subdistrict_id UUID,
    locality TEXT,
    pincode TEXT CHECK (pincode ~ '^[0-9]{6}$'),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    FOREIGN KEY (state_id, district_id) REFERENCES geo_districts(state_id, district_id),
    FOREIGN KEY (state_id, district_id, subdistrict_id) REFERENCES geo_subdistricts(state_id, district_id, subdistrict_id) MATCH SIMPLE
);

CREATE UNIQUE INDEX idx_uniq_active_primary_premises 
ON business_premises (business_id) 
WHERE is_primary = true AND is_active = true;


CREATE TABLE user_jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    state_id UUID NOT NULL,
    district_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    FOREIGN KEY (state_id) REFERENCES geo_states(state_id),
    FOREIGN KEY (state_id, district_id) REFERENCES geo_districts(state_id, district_id) MATCH SIMPLE
);

CREATE UNIQUE INDEX idx_uniq_active_user_jurisdiction 
ON user_jurisdictions (user_id, state_id, district_id) 
NULLS NOT DISTINCT 
WHERE is_active = true;


CREATE TABLE verifier_jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES officers(id),
    state_id UUID NOT NULL,
    district_id UUID NOT NULL,
    subdistrict_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    FOREIGN KEY (state_id, district_id) REFERENCES geo_districts(state_id, district_id),
    FOREIGN KEY (state_id, district_id, subdistrict_id) REFERENCES geo_subdistricts(state_id, district_id, subdistrict_id) MATCH SIMPLE
);

CREATE UNIQUE INDEX idx_uniq_active_verifier_jurisdiction
ON verifier_jurisdictions (officer_id, state_id, district_id, subdistrict_id) 
NULLS NOT DISTINCT 
WHERE is_active = true;


CREATE TABLE legal_metrology_offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    office_type TEXT NOT NULL CHECK(office_type IN ('HQ', 'ZONAL', 'DISTRICT', 'GATC_LAB')),
    state_id UUID NOT NULL,
    district_id UUID NOT NULL,
    address TEXT,
    pincode TEXT CHECK (pincode ~ '^[0-9]{6}$'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    FOREIGN KEY (state_id, district_id) REFERENCES geo_districts(state_id, district_id)
);

-- RLS
ALTER TABLE business_premises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifier_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_metrology_offices ENABLE ROW LEVEL SECURITY;

-- Business Premises RLS
CREATE POLICY "Business can view own premises" ON business_premises 
FOR SELECT TO authenticated 
USING (
    business_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'business'
    )
);

CREATE POLICY "Business can insert own premises" ON business_premises 
FOR INSERT TO authenticated 
WITH CHECK (
    business_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'business'
    )
);

CREATE POLICY "Business can update own premises" ON business_premises 
FOR UPDATE TO authenticated 
USING (
    business_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'business'
    )
)
WITH CHECK (
    business_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'business'
    )
);

CREATE POLICY "LMD and Officers can read all premises" ON business_premises 
FOR SELECT TO authenticated 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('lmd', 'officer'))
);

-- Jurisdiction RLS (Read-only for clients, tightly scoped)
CREATE POLICY "User can read own jurisdiction" ON user_jurisdictions 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Officer can read own verifier jurisdiction" ON verifier_jurisdictions 
FOR SELECT TO authenticated 
USING (officer_id = public.get_officer_id());

-- Offices RLS (Catalog lookup available to all authenticated)
CREATE POLICY "Authenticated users can read legal_metrology_offices" ON legal_metrology_offices 
FOR SELECT TO authenticated 
USING (true);
