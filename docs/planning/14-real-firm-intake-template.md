# 14 — Manual Real-Firm Intake Template and Guidelines

## Purpose

This planning document supports the first manual real-firm intake process. It defines the standards, source priorities, validation criteria, and duplicate checking rules that must be followed before manually adding real law firm prospects to the database.

---

## Pilot Scope

### Target First Geography
- **ZIP**: `19103`
- **City**: Philadelphia
- **State**: PA

### Recommended Pilot Size
- **1–3 real firms first**
- **Reason**: The first real data entries should test the database seeding, API query matching, and UI display workflows using a very small sample before attempting to input larger datasets (e.g. 5–10 records).

---

## Qualification Standards

### Required Evidence Before Adding a Record
A real firm record must not be added to the project unless the researcher has confirmed:
- Official firm website loads successfully.
- Physical office address is verified to be in ZIP `19103`.
- Firm appears to be actively practicing law.
- At least one attorney can be identified as affiliated with the firm.
- Attorney/bar registration status has been checked where practical.
- Record is not a duplicate of an existing record in the database.
- A reliable source URL is saved.
- Public data claims are not overrepresented (e.g. do not label as verified if only found on an unverified secondary aggregator).

### Source Priority
1. **Official Law Firm Website** (Primary source for name, practice areas, attorney listings, and contact info)
2. **Official Attorney/Bar/Disciplinary Directory** (Primary source for active licensing and status)
3. **Google Business Profile / Google Maps listing** (Supporting source for physical location, phone number, and operating status verification)
4. **Secondary Directories** (e.g., Yelp, Avvo, FindLaw) as supporting evidence only. Secondary directories must not be the primary `sourceUrl` unless no better source exists, and in such cases, the record must not be marked with a `HIGH` confidence level.

---

## Data Validation and Normalization Rules

### Placeholder Rejection Rules
Do not use placeholder terms. Reject or leave as `null` or empty fields when values are not explicitly known. 

**Forbidden values include:**
- `unknown`
- `n/a`
- `none`
- `null` (do not type the string `"null"`, use TypeScript/JSON literal `null` instead)
- `undefined`
- `placeholder`
- `coming soon`
- `test`
- `example`

### Deduplication Rules
Before adding a new firm record, check for duplicates against both seed prospects and any existing real firms using the following criteria:
1. **Normalized Website Domain**: Strip `https://`, `http://`, `www.`, and trailing slashes. Compare domains.
2. **Normalized Firm Name + ZIP**: Check if the lowercase firm name in the same ZIP code matches.
3. **Phone Number**: Compare numbers after removing non-alphanumeric characters (spaces, dashes, parens).
4. **Street Address**: Check for identical suite numbers at the same street address.

If any of these check criteria match an existing record, **do not create a duplicate**.

### Recommended Field Defaults
For the first manual intake records:
- `sourceType`: `"MANUAL"`
- `verificationStatus`: `"PENDING_REVIEW"`
- `confidenceLevel`: `"MEDIUM"`

Only upgrade a record to `confidenceLevel: "HIGH"` and `verificationStatus: "VERIFIED"` after a final peer/human review confirms the data is clean and matches the primary sources.

### Stable ID Convention
Use stable, human-readable IDs matching the pattern:
```text
firm-real-19103-{normalized-firm-slug}
```
**Example**: `firm-real-19103-smith-law-group`

Do not use random IDs (like UUIDs) if a stable, readable slug can be generated.

---

## Per-Record Checklist

Before adding a record to `src/data/real-firms.ts`, copy and verify the following checklist for each firm:

- [ ] Official website loads
- [ ] Website domain normalized and checked for duplicates
- [ ] Firm name checked for duplicates
- [ ] Physical office address is in ZIP 19103
- [ ] Phone number checked and normalized
- [ ] At least one attorney identified
- [ ] Attorney/bar status checked where practical
- [ ] Practice areas copied from official source only
- [ ] `sourceUrl` points to the source used for review
- [ ] `sourceType` is `MANUAL`
- [ ] `confidenceLevel` is not overclaimed
- [ ] `verificationStatus` is `PENDING_REVIEW` until final review
- [ ] Record displays correctly in local UI after seed
