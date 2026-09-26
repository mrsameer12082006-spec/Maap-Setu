-- Migration 13: Geography Master Seed
-- Verified LGD Data for SIH Demo Context
-- SOURCE PROVENANCE: Government of India Local Government Directory (LGD)
-- NOTE: District 469 reflects the recent authoritative renaming from "Aurangabad" to "Chhatrapati Sambhajinagar".
-- NOTE: State 7 uses canonical LGD name "NCT OF DELHI". District 482 uses canonical LGD name "Mumbai".
-- Exact snapshot version date is unknown, hence lgd_version = NULL.

DO $$
DECLARE
    mh_id UUID := gen_random_uuid();
    up_id UUID := gen_random_uuid();
    dl_id UUID := gen_random_uuid();
    
    pune_id UUID := gen_random_uuid();
    mumbai_id UUID := gen_random_uuid();
    mumbai_sub_id UUID := gen_random_uuid();
    nagpur_id UUID := gen_random_uuid();
    nashik_id UUID := gen_random_uuid();
    sambhajinagar_id UUID := gen_random_uuid();
    thane_id UUID := gen_random_uuid();
    kolhapur_id UUID := gen_random_uuid();
BEGIN

    INSERT INTO geo_states (state_id, lgd_code, name, type, lgd_version) VALUES
    (mh_id, '27', 'Maharashtra', 'STATE', NULL),
    (up_id, '9', 'Uttar Pradesh', 'STATE', NULL),
    (dl_id, '7', 'NCT OF DELHI', 'UT', NULL);

    INSERT INTO geo_districts (district_id, state_id, lgd_code, name) VALUES
    (pune_id, mh_id, '490', 'Pune'),
    (mumbai_id, mh_id, '482', 'Mumbai'),
    (mumbai_sub_id, mh_id, '483', 'Mumbai Suburban'),
    (nagpur_id, mh_id, '484', 'Nagpur'),
    (nashik_id, mh_id, '487', 'Nashik'),
    (sambhajinagar_id, mh_id, '469', 'Chhatrapati Sambhajinagar'),
    (thane_id, mh_id, '497', 'Thane'),
    (kolhapur_id, mh_id, '480', 'Kolhapur');

    INSERT INTO geo_subdistricts (state_id, district_id, lgd_code, name) VALUES
    (mh_id, pune_id, '4194', 'Pune City'),
    (mh_id, pune_id, '4193', 'Haveli'),
    (mh_id, pune_id, '4190', 'Khed'),
    (mh_id, pune_id, '4189', 'Shirur');

END $$;
