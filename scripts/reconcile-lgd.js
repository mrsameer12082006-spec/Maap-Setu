#!/usr/bin/env node
/**
 * scripts/reconcile-lgd.js
 * 
 * Deterministic LGD Geography Reconciliation Tool
 * 
 * Usage:
 *   node scripts/reconcile-lgd.js --snapshot <DATE>
 *   e.g.: node scripts/reconcile-lgd.js --snapshot 2024-03-01
 * 
 * DOES NOT MODIFY THE DATABASE.
 * Produces a full MATCH / RENAMED / NEW / ABSENT_FROM_SOURCE diff.
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment or .env.local
 *   - Official LGD CSVs placed at data/lgd/<snapshot>/
 */

import { createClient } from '@supabase/supabase-js';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const snapshot = process.argv[process.argv.indexOf('--snapshot') + 1];
if (!snapshot) {
  console.error('ERROR: --snapshot <DATE> is required. E.g.: --snapshot 2024-03-01');
  process.exit(1);
}

const SNAPSHOT_DIR = join('data', 'lgd', snapshot);
const STATES_CSV   = join(SNAPSHOT_DIR, 'states.csv');
const DISTRICTS_CSV = join(SNAPSHOT_DIR, 'districts.csv');
const SUBDISTS_CSV  = join(SNAPSHOT_DIR, 'subdistricts.csv');

for (const f of [STATES_CSV, DISTRICTS_CSV, SUBDISTS_CSV]) {
  if (!existsSync(f)) {
    console.error(`ERROR: Required file not found: ${f}`);
    console.error('See scripts/lgd-data-drop-contract.md for administrator instructions.');
    process.exit(1);
  }
}

// Detect synthetic files by small row count
function assertNotSynthetic(rows, label) {
  if (rows.length < 20) {
    console.error(
      `SAFETY ABORT: ${label} has only ${rows.length} rows — this is likely synthetic test data.\n` +
      `Official LGD data must contain all 36 states, ~780 districts, and ~7000+ subdistricts.\n` +
      `See scripts/lgd-data-drop-contract.md`
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------
function parseCsv(filepath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    createReadStream(filepath)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Hierarchy Validation
// ---------------------------------------------------------------------------
function validateHierarchy(states, districts, subdistricts) {
  const errors = [];
  const stateCodes = new Set(states.map(s => s['State Code']?.trim()));
  const districtKeys = new Set();

  // States
  const stateCodeSeen = new Set();
  for (const s of states) {
    const code = s['State Code']?.trim();
    const name = s['State Name (In English)']?.trim();
    if (!code) errors.push(`BLANK state code for row: ${JSON.stringify(s)}`);
    if (!name) errors.push(`BLANK state name for code: ${code}`);
    if (stateCodeSeen.has(code)) errors.push(`DUPLICATE state code: ${code}`);
    stateCodeSeen.add(code);
  }

  // Districts
  const districtCodeSeen = new Set();
  for (const d of districts) {
    const code = d['District Code']?.trim();
    const name = d['District Name (In English)']?.trim();
    const stateCode = d['State Code']?.trim();
    if (!code) errors.push(`BLANK district code: ${JSON.stringify(d)}`);
    if (!name) errors.push(`BLANK district name for code: ${code}`);
    if (!stateCodes.has(stateCode)) errors.push(`ORPHAN district ${code}: references unknown state ${stateCode}`);
    if (districtCodeSeen.has(code)) errors.push(`DUPLICATE district code: ${code}`);
    districtCodeSeen.add(code);
    districtKeys.add(`${stateCode}:${code}`);
  }

  // Subdistricts
  const subdistrictCodeSeen = new Set();
  for (const sd of subdistricts) {
    const code = sd['Sub-District Code']?.trim();
    const name = sd['Sub-District Name (In English)']?.trim();
    const stateCode = sd['State Code']?.trim();
    const districtCode = sd['District Code']?.trim();
    if (!code) errors.push(`BLANK subdistrict code: ${JSON.stringify(sd)}`);
    if (!name) errors.push(`BLANK subdistrict name for code: ${code}`);
    if (!stateCodes.has(stateCode)) errors.push(`ORPHAN subdistrict ${code}: unknown state ${stateCode}`);
    if (!districtKeys.has(`${stateCode}:${districtCode}`)) errors.push(`ORPHAN subdistrict ${code}: unknown district ${districtCode} in state ${stateCode}`);
    if (subdistrictCodeSeen.has(code)) errors.push(`DUPLICATE subdistrict code: ${code}`);
    subdistrictCodeSeen.add(code);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Reconcile
// ---------------------------------------------------------------------------
function reconcile(dbRecords, sourceRecords, codeField, nameField, label) {
  const dbByCode = {};
  for (const r of dbRecords) dbByCode[r.lgd_code] = r;

  const srcByCode = {};
  for (const r of sourceRecords) {
    const code = r[codeField]?.trim();
    if (code) srcByCode[code] = r;
  }

  const results = { MATCH: [], RENAMED: [], NEW: [], ABSENT_FROM_SOURCE: [] };

  for (const [code, srcRow] of Object.entries(srcByCode)) {
    const srcName = srcRow[nameField]?.trim();
    if (dbByCode[code]) {
      const dbRow = dbByCode[code];
      if (dbRow.name === srcName) {
        results.MATCH.push({ code, name: srcName, uuid: dbRow.state_id || dbRow.district_id || dbRow.subdistrict_id });
      } else {
        results.RENAMED.push({ code, currentName: dbRow.name, sourceName: srcName, uuid: dbRow.state_id || dbRow.district_id || dbRow.subdistrict_id });
      }
    } else {
      results.NEW.push({ code, name: srcName });
    }
  }

  for (const [code, dbRow] of Object.entries(dbByCode)) {
    if (!srcByCode[code]) {
      results.ABSENT_FROM_SOURCE.push({
        code,
        name: dbRow.name,
        uuid: dbRow.state_id || dbRow.district_id || dbRow.subdistrict_id
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n=== LGD Geography Reconciliation Tool ===`);
  console.log(`Snapshot: ${snapshot}`);
  console.log(`READ-ONLY — No database mutations will occur.\n`);

  // 1. Parse CSV files
  console.log('Loading CSV files...');
  const [lgdStates, lgdDistricts, lgdSubdistricts] = await Promise.all([
    parseCsv(STATES_CSV),
    parseCsv(DISTRICTS_CSV),
    parseCsv(SUBDISTS_CSV),
  ]);

  console.log(`CSV loaded: ${lgdStates.length} States | ${lgdDistricts.length} Districts | ${lgdSubdistricts.length} Subdistricts`);

  // 2. Synthetic data guard
  assertNotSynthetic(lgdStates, 'states.csv');
  assertNotSynthetic(lgdDistricts, 'districts.csv');
  assertNotSynthetic(lgdSubdistricts, 'subdistricts.csv');

  // 3. Validate hierarchy
  console.log('\nValidating local hierarchy...');
  const errors = validateHierarchy(lgdStates, lgdDistricts, lgdSubdistricts);
  if (errors.length > 0) {
    console.error(`\n❌ VALIDATION FAILED with ${errors.length} error(s):`);
    errors.forEach(e => console.error('  ', e));
    process.exit(1);
  }
  console.log('✓ Local hierarchy valid\n');

  // 4. Connect to DB (read-only)
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const [{ data: dbStates }, { data: dbDistricts }, { data: dbSubdistricts }] = await Promise.all([
    supabase.from('geo_states').select('*'),
    supabase.from('geo_districts').select('*'),
    supabase.from('geo_subdistricts').select('*'),
  ]);

  // 5. Reconcile
  const statesDiff = reconcile(dbStates, lgdStates, 'State Code', 'State Name (In English)', 'STATES');
  const districtsDiff = reconcile(dbDistricts, lgdDistricts, 'District Code', 'District Name (In English)', 'DISTRICTS');
  const subdistrictsDiff = reconcile(dbSubdistricts, lgdSubdistricts, 'Sub-District Code', 'Sub-District Name (In English)', 'SUBDISTRICTS');

  // 6. Print report
  console.log('=== STATES ===');
  console.log(`  MATCH:             ${statesDiff.MATCH.length}`);
  console.log(`  RENAMED:           ${statesDiff.RENAMED.length}`);
  console.log(`  NEW:               ${statesDiff.NEW.length}`);
  console.log(`  ABSENT_FROM_SOURCE: ${statesDiff.ABSENT_FROM_SOURCE.length}`);

  if (statesDiff.RENAMED.length > 0) {
    console.log('\n  RENAMED states (requires review):');
    statesDiff.RENAMED.forEach(r => console.log(`    LGD ${r.code}: "${r.currentName}" → "${r.sourceName}" (UUID: ${r.uuid})`));
  }

  console.log('\n=== DISTRICTS ===');
  console.log(`  MATCH:             ${districtsDiff.MATCH.length}`);
  console.log(`  RENAMED:           ${districtsDiff.RENAMED.length}`);
  console.log(`  NEW:               ${districtsDiff.NEW.length}`);
  console.log(`  ABSENT_FROM_SOURCE: ${districtsDiff.ABSENT_FROM_SOURCE.length}`);

  console.log('\n=== SUBDISTRICTS ===');
  console.log(`  MATCH:             ${subdistrictsDiff.MATCH.length}`);
  console.log(`  RENAMED:           ${subdistrictsDiff.RENAMED.length}`);
  console.log(`  NEW:               ${subdistrictsDiff.NEW.length}`);
  console.log(`  ABSENT_FROM_SOURCE: ${subdistrictsDiff.ABSENT_FROM_SOURCE.length}`);

  console.log('\n=== CRITICAL RECORD PRESERVATION ===');
  const critical = [
    { name: 'Maharashtra', code: '27' },
    { name: 'Pune',        code: '490' },
    { name: 'Nagpur',      code: '484' },
    { name: 'Mumbai',      code: '482' },
    { name: 'Chhatrapati Sambhajinagar', code: '469' },
  ];
  for (const c of critical) {
    const s = dbStates?.find(r => r.lgd_code === c.code) || dbDistricts?.find(r => r.lgd_code === c.code);
    const uuid = s?.state_id || s?.district_id || 'NOT FOUND';
    console.log(`  ${c.name} (LGD ${c.code}): UUID=${uuid}`);
  }

  const hasRisks = statesDiff.RENAMED.length > 0 || districtsDiff.RENAMED.length > 0 || subdistrictsDiff.RENAMED.length > 0;
  const hasMissing = statesDiff.ABSENT_FROM_SOURCE.length > 0 || districtsDiff.ABSENT_FROM_SOURCE.length > 0;

  if (hasRisks || hasMissing) {
    console.log('\n⚠️  RECONCILIATION REQUIRES ADMINISTRATOR REVIEW before import can proceed.');
  } else {
    console.log('\n✓ Reconciliation complete. Ready for import approval.');
  }

  console.log('\nREAD-ONLY COMPLETE — no database mutations occurred.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
