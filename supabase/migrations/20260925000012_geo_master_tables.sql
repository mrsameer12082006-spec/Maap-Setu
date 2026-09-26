-- Migration 12: Geography Master Tables
-- Enforces strict hierarchical integrity for State -> District -> Subdistrict

CREATE TABLE geo_states (
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL DEFAULT 'LGD',
    lgd_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('STATE', 'UT')),
    lgd_version DATE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE geo_districts (
    district_id UUID DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES geo_states(state_id),
    source TEXT NOT NULL DEFAULT 'LGD',
    lgd_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (state_id, district_id)
);

CREATE TABLE geo_subdistricts (
    subdistrict_id UUID DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL,
    district_id UUID NOT NULL,
    source TEXT NOT NULL DEFAULT 'LGD',
    lgd_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (state_id, district_id, subdistrict_id),
    FOREIGN KEY (state_id, district_id) REFERENCES geo_districts(state_id, district_id)
);

-- RLS
ALTER TABLE geo_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_subdistricts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access on geo_states"
    ON geo_states FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access on geo_districts"
    ON geo_districts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access on geo_subdistricts"
    ON geo_subdistricts FOR SELECT
    TO authenticated
    USING (true);
