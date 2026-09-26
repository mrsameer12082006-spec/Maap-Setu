import csv
import os
import json

snapshot_dir = r"C:\Users\ayesh\OneDrive\Desktop\SIH2\MaapSetu\data\lgd\2026-09-26"
out_file = r"C:\Users\ayesh\OneDrive\Desktop\SIH2\MaapSetu\supabase\migrations\20260926000020_lgd_snapshot_20260926.sql"
remote_geo_file = r"C:\Users\ayesh\OneDrive\Desktop\SIH2\MaapSetu\remote_geo.json"

with open(remote_geo_file, "r", encoding="utf-16") as f:
    remote = json.load(f)

classifications = {}
with open(os.path.join(snapshot_dir, "state-classification.csv"), encoding="utf-8") as f:
    for row in csv.DictReader(f):
        classifications[row['State Code']] = row['Type']

states = []
with open(os.path.join(snapshot_dir, "states.csv"), encoding="utf-8") as f:
    for row in csv.DictReader(f):
        code = row['State Code']
        name = row['State Name (In English)'].replace("'", "''")
        type_ = classifications[code]
        states.append(f"('{code}', '{name}', '{type_}')")

districts = []
with open(os.path.join(snapshot_dir, "districts.csv"), encoding="utf-8") as f:
    for row in csv.DictReader(f):
        state_code = row['State Code']
        code = row['District Code']
        name = row['District Name (In English)'].replace("'", "''")
        districts.append(f"('{state_code}', '{code}', '{name}')")

subdistricts = []
with open(os.path.join(snapshot_dir, "subdistricts.csv"), encoding="utf-8") as f:
    for row in csv.DictReader(f):
        dist_code = row['District Code']
        code = row['Sub-District Code']
        name = row['Sub-District Name (In English)'].replace("'", "''")
        subdistricts.append(f"('{dist_code}', '{code}', '{name}')")

with open(out_file, "w", encoding="utf-8") as f:
    f.write("-- Migration 20: LGD Snapshot 2026-09-26 Import\n")
    f.write("-- Idempotent, atomic geographic import.\n\n")
    
    f.write("-- Phase 7: Pre-Import Assertions\n")
    f.write("DO $$\nDECLARE\n    c INT;\n    uuid_val UUID;\nBEGIN\n")
    
    # Pre-assertions
    f.write("    SELECT count(*) INTO c FROM geo_states;\n")
    f.write("    IF c != 3 THEN RAISE EXCEPTION 'Pre-condition failed: expected exactly 3 existing states, got %', c; END IF;\n")
    f.write("    SELECT count(*) INTO c FROM geo_districts;\n")
    f.write("    IF c != 8 THEN RAISE EXCEPTION 'Pre-condition failed: expected exactly 8 existing districts, got %', c; END IF;\n")
    f.write("    SELECT count(*) INTO c FROM geo_subdistricts;\n")
    f.write("    IF c != 4 THEN RAISE EXCEPTION 'Pre-condition failed: expected exactly 4 existing subdistricts, got %', c; END IF;\n\n")

    for s in remote['states']:
        f.write(f"    SELECT state_id INTO uuid_val FROM geo_states WHERE lgd_code = '{s['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{s['state_id']}'::uuid THEN RAISE EXCEPTION 'Pre-condition failed: State {s['lgd_code']} missing or UUID drift'; END IF;\n")
        
    for d in remote['districts']:
        f.write(f"    SELECT district_id INTO uuid_val FROM geo_districts WHERE lgd_code = '{d['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{d['district_id']}'::uuid THEN RAISE EXCEPTION 'Pre-condition failed: District {d['lgd_code']} missing or UUID drift'; END IF;\n")
        
    for sd in remote['subdistricts']:
        f.write(f"    SELECT subdistrict_id INTO uuid_val FROM geo_subdistricts WHERE lgd_code = '{sd['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{sd['subdistrict_id']}'::uuid THEN RAISE EXCEPTION 'Pre-condition failed: Subdistrict {sd['lgd_code']} missing or UUID drift'; END IF;\n")
        
    f.write("END $$;\n\n")
    
    f.write("-- Upsert States\n")
    f.write("INSERT INTO geo_states (lgd_code, name, type) VALUES\n")
    f.write(",\n".join(states))
    f.write("\nON CONFLICT (lgd_code) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type;\n\n")

    f.write("-- Upsert Districts\n")
    f.write("INSERT INTO geo_districts (state_id, lgd_code, name)\n")
    f.write("SELECT geo_states.state_id, v.lgd_code, v.name\n")
    f.write("FROM (VALUES\n")
    f.write(",\n".join(districts))
    f.write("\n) AS v(state_lgd, lgd_code, name)\n")
    f.write("JOIN geo_states ON geo_states.lgd_code = v.state_lgd\n")
    f.write("ON CONFLICT (lgd_code) DO UPDATE SET name = EXCLUDED.name;\n\n")

    f.write("-- Upsert Subdistricts\n")
    batch_size = 2000
    for i in range(0, len(subdistricts), batch_size):
        batch = subdistricts[i:i+batch_size]
        f.write("INSERT INTO geo_subdistricts (state_id, district_id, lgd_code, name)\n")
        f.write("SELECT geo_districts.state_id, geo_districts.district_id, v.lgd_code, v.name\n")
        f.write("FROM (VALUES\n")
        f.write(",\n".join(batch))
        f.write("\n) AS v(district_lgd, lgd_code, name)\n")
        f.write("JOIN geo_districts ON geo_districts.lgd_code = v.district_lgd\n")
        f.write("ON CONFLICT (lgd_code) DO UPDATE SET name = EXCLUDED.name;\n\n")

    f.write("-- Phase 8: Post-Import Assertions\n")
    f.write("DO $$\nDECLARE\n    c INT;\n    uuid_val UUID;\nBEGIN\n")
    f.write("    SELECT count(*) INTO c FROM geo_states;\n")
    f.write("    IF c != 36 THEN RAISE EXCEPTION 'Assertion failed: expected 36 states, got %', c; END IF;\n")
    f.write("    SELECT count(*) INTO c FROM geo_districts;\n")
    f.write("    IF c != 784 THEN RAISE EXCEPTION 'Assertion failed: expected 784 districts, got %', c; END IF;\n")
    f.write("    SELECT count(*) INTO c FROM geo_subdistricts;\n")
    f.write("    IF c != 7092 THEN RAISE EXCEPTION 'Assertion failed: expected 7092 subdistricts, got %', c; END IF;\n\n")
    
    # Check for orphans
    f.write("    SELECT count(*) INTO c FROM geo_districts WHERE state_id IS NULL;\n")
    f.write("    IF c > 0 THEN RAISE EXCEPTION 'Assertion failed: orphan districts detected'; END IF;\n")
    f.write("    SELECT count(*) INTO c FROM geo_subdistricts WHERE district_id IS NULL OR state_id IS NULL;\n")
    f.write("    IF c > 0 THEN RAISE EXCEPTION 'Assertion failed: orphan subdistricts detected'; END IF;\n\n")

    # Post UUID checks
    for s in remote['states']:
        f.write(f"    SELECT state_id INTO uuid_val FROM geo_states WHERE lgd_code = '{s['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{s['state_id']}'::uuid THEN RAISE EXCEPTION 'Assertion failed: State {s['lgd_code']} UUID drifted'; END IF;\n")
        
    for d in remote['districts']:
        f.write(f"    SELECT district_id INTO uuid_val FROM geo_districts WHERE lgd_code = '{d['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{d['district_id']}'::uuid THEN RAISE EXCEPTION 'Assertion failed: District {d['lgd_code']} UUID drifted'; END IF;\n")
        
    for sd in remote['subdistricts']:
        f.write(f"    SELECT subdistrict_id INTO uuid_val FROM geo_subdistricts WHERE lgd_code = '{sd['lgd_code']}';\n")
        f.write(f"    IF uuid_val IS NULL OR uuid_val != '{sd['subdistrict_id']}'::uuid THEN RAISE EXCEPTION 'Assertion failed: Subdistrict {sd['lgd_code']} UUID drifted'; END IF;\n")
        
    f.write("END $$;\n")

print("Generated corrected SQL artifact!")
