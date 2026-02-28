# Invoice Revamp Workflow (Operational Guide)

## Purpose
This document explains how the new invoice workflow runs in practice:
1. Admin creates staff
2. Admin creates compensation profile (position/staff)
3. Staff submits EOD
4. Admin reviews/approves EOD
5. Invoice is generated (manual or cron)
6. Admin reviews, adjusts, approves, and marks paid

This workflow is EOD-only and hourly-only.

## 1) Staff Creation

### Actor
Admin

### Endpoint
`POST /staff`

### Required setup notes
- Staff should have a `salary` value so legacy fallback works if no compensation profile exists.
- Staff must belong to a `businessId`.
- Staff `position` should be set because position-scope compensation depends on it.

### Result
Staff record is created and can authenticate/submit EOD.

## 2) Compensation Profile Setup

### Actor
Admin

### Endpoints
- Create: `POST /compensation-profiles`
- Update: `PATCH /compensation-profiles/:id`
- List: `GET /compensation-profiles?businessId=...&profileScope=...`
- Staff statutory settings (admin-only): `PATCH /compensation-profiles/staff/:staffId/statutory-settings`

### Profile scopes
- `profileScope = "position"`: default config for a job position
- `profileScope = "staff"`: override config for one staff member

### Resolution precedence at invoice generation
1. Staff-scope profile
2. Position-scope profile
3. Legacy fallback: `staff.salary` as hourly rate

### Important profile fields
- `hourlyRate`
- `overtimeRateMultiplier`
- `sundayRateMultiplier`
- `nightDifferentialRateMultiplier`
- `isRiceAllowanceEligible`
- `riceAllowanceFixedAmount`
- `isSssEnabled`, `isPagIbigEnabled`, `isPhilHealthEnabled`
- `sssDeductionFixedAmount`, `pagIbigDeductionFixedAmount`, `philHealthDeductionFixedAmount`
- `effectiveFrom`, `effectiveTo`

## 3) EOD Submission

### Actor
Staff

### Endpoints
- Submit: `POST /eod`
- Resubmit if returned: `PUT /eod/:id/resubmit`
- View own: `GET /eod/me`

### EOD payroll fields
- `hoursWorked` (base)
- `regularHoursWorked` (optional)
- `overtimeHoursWorked` (optional)
- `nightDifferentialHours` (optional)

### Validation
- `regularHoursWorked + overtimeHoursWorked <= hoursWorked`
- `nightDifferentialHours <= hoursWorked`

### Business rule
Only approved EOD entries are counted in invoice generation.

## 4) EOD Review/Approval

### Actor
Admin

### Endpoints
- Review/approve/return: `PUT /eod/:id/review`
- Edit minor details: `PUT /eod/:id`
- View all/business/staff:
  - `GET /eod`
  - `GET /businesses/:businessId/eod`
  - `GET /staff/:staffId/eod`

### Status flow
- Staff submits -> `submitted`
- Admin marks:
  - `reviewed` (+ usually approved)
  - `needs_revision` (staff must resubmit)

## 5) Invoice Generation

### A. Manual generation (admin)
- Single staff: `POST /invoices/generate`
- Business batch: `POST /businesses/:businessId/invoices/generate`

### B. Automatic generation (cron)
- 1st day, 00:00 Asia/Manila -> generates previous month `16..last day`
- 16th day, 00:00 Asia/Manila -> generates current month `1..15`

### Cron scope
- Generates for latest completed cycle only.
- No startup historical backfill recovery.

### Duplicate protection
Invoice skipped if existing active record already exists for:
`staffId + businessId + periodStart + periodEnd + isActive`

## 6) Invoice Computation Logic

### Inputs
- Approved EOD records in period
- Resolved compensation profile
- Existing manual adjustments (`additions[]` and manual `deductions[]`)

### Earnings breakdown
- `regularEarnings`
- `overtimeEarnings`
- `sundayPremiumEarnings` (Sunday derived from EOD `date`)
- `nightDifferentialEarnings`
- `riceAllowanceEarnings`

### Rice allowance rule
If `isRiceAllowanceEligible = true`, include `riceAllowanceFixedAmount`
even when worked hours are `0`.

### Statutory deductions snapshot
- `statutoryDeductions.sss`
- `statutoryDeductions.pagIbig`
- `statutoryDeductions.philHealth`

### Net formula
- `calculatedPay = sum(earningsBreakdown)`
- `deductions[]` is derived from `statutoryDeductions` plus manual deductions
- `netPay = calculatedPay + additionsTotal - deductionsTotal`

## 7) Invoice Review & Lifecycle

### Admin lifecycle actions
- Recalculate draft/calculated only: `PUT /invoices/:id/recalculate`
- Approve: `PUT /invoices/:id/approve`
- Mark paid: `PUT /invoices/:id/paid`
- Add adjustment: `POST /invoices/:id/adjustment`
- Remove adjustment: `DELETE /invoices/:id/adjustment`
- Soft delete (not paid): `DELETE /invoices/:id`

### Staff visibility
- Staff can only view approved/paid invoices:
  - `GET /invoices/me`
  - `GET /invoices/me/:id`

## 8) Quick Sequence (Summary)

1. Admin creates staff (`POST /staff`).
2. Admin creates position compensation profile (`POST /compensation-profiles`).
3. Optional: admin overrides one staff's statutory settings (`PATCH /compensation-profiles/staff/:staffId/statutory-settings`).
4. Staff submits EOD daily (`POST /eod`).
5. Admin reviews and approves EOD (`PUT /eod/:id/review`).
6. Invoice generated manually or by cron.
7. Admin recalculates (if needed), adds manual adjustments, approves, marks paid.
8. Staff sees finalized invoice only after approval.

