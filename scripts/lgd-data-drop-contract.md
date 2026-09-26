# LGD Official Data Drop Contract
## Administrator Action Required

## Status: BLOCKED — OFFICIAL DATA REQUIRED

Automated acquisition of official Government of India LGD datasets was attempted and FAILED due to:

- `lgdirectory.gov.in` — Returns HTML login/CAPTCHA page (200 OK but not CSV data)
- `data.gov.in` REST API — Connection timed out
- `data.gov.in` catalog — Infinite redirect loop

## Acquisition Steps (Manual)

The administrator must manually download the following official files:

### Source: lgdirectory.gov.in

1. Navigate to: **https://lgdirectory.gov.in**
2. Select "Download Directory" from the navigation menu
3. Download:
   - **States/UTs**: All States + Union Territories → Export CSV
   - **Districts**: All Districts → Export CSV  
   - **Sub-Districts**: All Sub-Districts → Export CSV

### Alternative Source: data.gov.in

Search for:
- **"Local Government Directory – States"** on data.gov.in
- **"Local Government Directory – Districts"** on data.gov.in
- **"Local Government Directory – Sub-Districts"** on data.gov.in

## Required Drop Location

Place official files at:

```
data/lgd/<OFFICIAL_SNAPSHOT_DATE>/states.csv
data/lgd/<OFFICIAL_SNAPSHOT_DATE>/districts.csv
data/lgd/<OFFICIAL_SNAPSHOT_DATE>/subdistricts.csv
```

Where `<OFFICIAL_SNAPSHOT_DATE>` is the exact publication/update date from the LGD source metadata (e.g., `2024-03-01`).

**DO NOT invent the date. Use the date from the official source.**

## Required Metadata to Record

After downloading, record this information in `data/lgd/<DATE>/PROVENANCE.md`:

```
Source URL: [exact URL used to download]
Dataset Title: [exact title from the LGD source page]
Source Authority: Government of India, Ministry of Panchayati Raj
Publication/Update Date: [from source metadata]
Download Timestamp: [ISO 8601]
States File: states.csv
Districts File: districts.csv
Subdistricts File: subdistricts.csv
States SHA-256: [sha256sum states.csv]
Districts SHA-256: [sha256sum districts.csv]
Subdistricts SHA-256: [sha256sum subdistricts.csv]
```

## Expected Column Headers

The importer expects the following CSV column headers (as published by LGD):

### states.csv
```
State Code,State Name (In English),State Name (In Local),Census 2001 Code,Census 2011 Code,Status
```

### districts.csv
```
District Code,State Code,State Name (In English),District Name (In English),District Name (In Local),Census 2001 Code,Census 2011 Code
```

### subdistricts.csv
```
Sub-District Code,District Code,State Code,Sub-District Name (In English),Sub-District Name (In Local),Census 2011 Code
```

> NOTE: If the official LGD export uses different headers, document the actual headers in PROVENANCE.md.
> The importer will be updated to match the actual headers before execution.

## DO NOT

- Place synthetic, test, or mock data in `data/lgd/<DATE>/`
- Invent LGD codes
- Infer hierarchy from any non-official source
- Use GitHub copies of LGD data without explicit date verification
- Use Wikipedia district lists

## Synthetic Test Fixtures

Test fixtures (3 states / 3 districts / 2 subdistricts) are safely isolated at:

```
scripts/fixtures/geo-test/states_SYNTHETIC_TEST.csv
scripts/fixtures/geo-test/districts_SYNTHETIC_TEST.csv
scripts/fixtures/geo-test/subdistricts_SYNTHETIC_TEST.csv
```

These MUST NOT be used for any database import.

## Next Steps After Drop

Once official files are placed, run the reconciliation tool:

```bash
node scripts/reconcile-lgd.js --snapshot <DATE>
```

This will produce a deterministic diff (MATCH / RENAMED / NEW / ABSENT_FROM_SOURCE) before any import is executed.
