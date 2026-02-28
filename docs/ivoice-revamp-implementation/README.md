# Invoice Revamp Implementation Plan (Step-by-Step)

## Objective
Implement the invoice revamp with:
- EOD-only payroll source
- Hourly-only computation model
- Admin-managed statutory deductions (SSS, Pag-IBIG, PhilHealth)
- OT, Sunday premium, night differential, and always-include rice allowance when eligible
- Cron generation for latest completed cutoff only

## Implementation Order

### 1. Schema Layer (Mongo document contracts)

1. Update EOD schema/type contracts
- Files:
  - `src/types/eod.types.ts`
  - `src/schema/eod.schema.ts`
- Add fields:
  - `regularHoursWorked?: number`
  - `overtimeHoursWorked?: number`
  - `nightDifferentialHours?: number`
- Keep `hoursWorked` as base existing field.
- Add validation rules:
  - `regularHoursWorked + overtimeHoursWorked <= hoursWorked` (if provided)
  - `nightDifferentialHours <= hoursWorked`

2. Create compensation profile schema/type (new collection)
- Files (new module suggested):
  - `src/types/compensation-profile.types.ts`
  - `src/schema/compensation-profile.schema.ts`
- Collection: `compensation_profiles`
- Required fields:
  - `name`, `businessId`, `profileScope`, `jobPosition`, `hourlyRate`
  - `overtimeRateMultiplier`, `sundayRateMultiplier`, `nightDifferentialRateMultiplier`
  - `isRiceAllowanceEligible`, `riceAllowanceFixedAmount`
  - `isSssEnabled`, `isPagIbigEnabled`, `isPhilHealthEnabled`
  - `sssDeductionFixedAmount`, `pagIbigDeductionFixedAmount`, `philHealthDeductionFixedAmount`
  - `effectiveFrom`, `effectiveTo?`, `isActive`, timestamps
- Constraints:
  - `profileScope = "position"` => `staffId` must be empty
  - `profileScope = "staff"` => `staffId` required

3. Update invoice schema/type for structured breakdown
- Files:
  - `src/types/invoice.types.ts`
  - `src/schema/invoice.schema.ts`
- Add fields:
  - `earningsBreakdown`:
    - `regularEarnings`, `overtimeEarnings`, `sundayPremiumEarnings`, `nightDifferentialEarnings`, `riceAllowanceEarnings`
  - `statutoryDeductions`:
    - `sss`, `pagIbig`, `philHealth`
- Keep existing `deductions[]`, `additions[]`, `calculatedPay`, `netPay`.
- Set `deductions[]` to be generated from `statutoryDeductions` during calculation.
- Hourly-only migration choice:
  - Option A (safer rollout): keep `salaryType` field but enforce `"hourly"` in write paths
  - Option B (hard cut): replace with `hourlyRate` snapshot and remove enum branching

4. Add indexes
- `invoices`: unique logical key on `(staffId, businessId, periodStart, periodEnd, isActive)`
- `compensation_profiles`: lookup index for precedence resolution:
  - `(businessId, profileScope, staffId, jobPosition, isActive, effectiveFrom, updatedAt)`

### 2. Types + Validation JSON Schemas

1. Update route validation schemas for invoice responses
- File: `src/types/invoice.types.ts`
- Add JSON schema properties for:
  - `earningsBreakdown`
  - `statutoryDeductions`
- Keep old fields for compatibility in response contracts.

2. Add compensation profile request/response schemas
- File: `src/types/compensation-profile.types.ts` (new)
- Create:
  - create schema
  - update schema
  - list query schema
  - statutory-settings patch schema (admin-only)

### 3. Controller/Service Layer

1. Extract hourly invoice calculator service (new)
- New file suggested:
  - `src/modules/invoice/invoice.calculator.service.ts`
- Responsibilities:
  - Resolve compensation profile precedence:
    1) staff scope
    2) position scope
    3) legacy `staff.salary` fallback
  - Resolve latest active profile by effective date and `updatedAt`
  - Compute components:
    - regular earnings
    - overtime earnings
    - Sunday premium (Sunday derived from EOD date)
    - night differential earnings
    - rice allowance earnings (always include when eligible)
  - Compute statutory deductions from fixed amounts with admin-managed toggles
  - Build `statutoryDeductions`, derive `deductions[]` from it
  - Produce `calculatedPay` and `netPay`

2. Refactor admin invoice controllers to use service
- File: `src/modules/invoice/admin.invoice.controller.ts`
- Update:
  - `generateInvoice`
  - `generateBusinessInvoices`
  - `recalculateInvoice`
- Remove salary-type branching in controller logic (hourly-only computation path).
- Keep manual `additions[]` and adjustment endpoints as separate admin adjustments.

3. Keep staff invoice controller contract stable
- File: `src/modules/invoice/staff.invoice.controller.ts`
- Ensure staff endpoints return new breakdown fields without exposing draft invoices.

### 4. Route Layer

1. Update existing invoice routes (no breaking path changes)
- File: `src/modules/invoice/admin.invoice.route.ts`
- Keep:
  - `POST /businesses/:businessId/invoices/generate`
- Optional alias:
  - `POST /businesses/:businessId/invoices/generate/hourly`
- Update route descriptions/response schemas to include breakdown fields.

2. Add compensation profile routes (admin-only)
- New files suggested:
  - `src/modules/compensation/compensation.routes.ts`
  - `src/modules/compensation/compensation.controller.ts`
- Endpoints:
  - `POST /compensation-profiles`
  - `PATCH /compensation-profiles/:id`
  - `GET /compensation-profiles?businessId=...&profileScope=...`
  - `PATCH /compensation-profiles/staff/:staffId/statutory-settings`

3. Register new routes
- File: `src/routes/routes.ts`
- Register compensation module with admin auth.

### 5. Cron Layer

1. Keep current schedule cadence
- File: `src/plugins/cron.ts`
- Keep `0 0 1 * *` and `0 0 16 * *` with `Asia/Manila`.

2. Remove startup backfill recovery
- Remove `recoverMissingInvoices()` call from `onReady`.
- Remove historical period recovery helpers if no longer used.

3. Switch cron generation to shared hourly calculator
- In cron generation path, use same service used by controllers.
- Ensure generated invoices contain:
  - `earningsBreakdown`
  - `statutoryDeductions`
  - `deductions[]` (derived)
  - rice allowance included when eligible

4. Preserve idempotency
- Keep duplicate check before insert.
- Log generated/skipped/errors per run.

### 6. Migration + Backward Compatibility

1. Non-breaking rollout (recommended)
- Add new fields first, keep old fields readable.
- Write both old and new fields for one release if needed.
- Then remove unused salaryType branches.

2. Data backfill script (optional)
- Backfill missing `earningsBreakdown` and `statutoryDeductions` for draft invoices only.
- Do not mutate approved/paid financial amounts unless explicitly approved.

### 7. Verification Checklist

1. Schema/type validation
- Build passes with strict TS checks.
- Route JSON schema includes new response properties.

2. Calculation correctness
- Hourly-only regular case
- Sunday-only case
- Night differential case
- OT + Sunday + night combination case
- Zero-work-hours with rice allowance eligible case
- Statutory opt-in/out combinations

3. Invoice lifecycle safety
- Recalculate blocked for approved/paid.
- Duplicate prevention works on repeated cron/manual runs.

4. Cron behavior
- No startup historical invoice generation.
- Only latest completed period gets generated at scheduled runs.

## Suggested Execution Sequence (Practical)
1. EOD + compensation + invoice schema/types
2. Calculator service
3. Admin invoice controller refactor
4. Route schema updates + compensation routes
5. Cron refactor
6. Verification tests and staged rollout
