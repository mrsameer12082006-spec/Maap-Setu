-- Migration 15: Add Application Geography and Snapshot Columns

ALTER TABLE applications 
ADD COLUMN inspection_state_id UUID,
ADD COLUMN inspection_district_id UUID,
ADD COLUMN inspection_subdistrict_id UUID,
ADD COLUMN snapshot_state_name TEXT,
ADD COLUMN snapshot_district_name TEXT,
ADD COLUMN snapshot_subdistrict_name TEXT,
ADD COLUMN snapshot_pincode TEXT,
ADD COLUMN snapshot_address TEXT;

ALTER TABLE applications
ADD CONSTRAINT fk_applications_inspection_state 
FOREIGN KEY (inspection_state_id) 
REFERENCES geo_states(state_id),

ADD CONSTRAINT fk_applications_inspection_district 
FOREIGN KEY (inspection_state_id, inspection_district_id) 
REFERENCES geo_districts(state_id, district_id) MATCH SIMPLE,

ADD CONSTRAINT fk_applications_inspection_subdistrict 
FOREIGN KEY (inspection_state_id, inspection_district_id, inspection_subdistrict_id) 
REFERENCES geo_subdistricts(state_id, district_id, subdistrict_id) MATCH SIMPLE;

ALTER TABLE applications
ADD CONSTRAINT chk_applications_district_requires_state
CHECK (
    inspection_district_id IS NULL
    OR inspection_state_id IS NOT NULL
),
ADD CONSTRAINT chk_applications_subdistrict_requires_parent
CHECK (
    inspection_subdistrict_id IS NULL
    OR (
        inspection_state_id IS NOT NULL
        AND inspection_district_id IS NOT NULL
    )
),
ADD CONSTRAINT chk_applications_state_requires_district
CHECK (
    inspection_state_id IS NULL
    OR inspection_district_id IS NOT NULL
);
