# Invoice Revamp (EOD-Only)

## Scope
This revamp covers invoice generation using **EOD** data only.
Attendance (`clockIn/clockOut`) is out of scope.

## Goals
1. Cron should generate invoices for the **latest completed payout cycle only** (no historical backfill).
2. Use a single **hourly-only** pay model for all staff (`no work, no pay`).
3. Add payroll components for:
- Statutory deductions in PH: `SSS`, `Pag-IBIG`, `PhilHealth`
- Earnings additions: `OT`, Sunday premium, rice allowance, and night differential
4. Statutory deductions must be **optional per staff record** (admin-managed opt in/out).

## Current State (from code)
- Cron and startup recovery in [`src/plugins/cron.ts`](../src/plugins/cron.ts) generate hourly invoices and also recover older missing periods.
- Batch manual generation in [`src/modules/invoice/admin.invoice.controller.ts`](../src/modules/invoice/admin.invoice.controller.ts) is hourly-only (`generateBusinessInvoices`).
- Single-staff manual generation still contains legacy multi-`salaryType` support.
- Invoice already supports generic `deductions` and `additions`, but no structured statutory/OT/rest-day breakdown.

## Recommended Design

### 1. Period Policy: Current Cycle Only
Use one function that resolves **only the latest completed cycle**:
- If run on day `1` to `15`: generate `previous month 16 -> previous month last day`
- If run on day `16` to end: generate `current month 1 -> current month 15`

Changes:
- Keep scheduled runs on `1st` and `16th`.
- Remove/disable startup historical recovery (`recoverMissingInvoices`) so cron does not create old periods.
- Keep duplicate check (`staffId + businessId + periodStart + periodEnd + isActive`) to make reruns safe.

### 2. Unified Hourly Generation
Use one invoice generation service for all staff:

- `generateHourlyInvoicesForPeriod(periodStart, periodEnd, filters?)`

Keep existing endpoint behavior:
- Existing: `POST /invoices/generate/business/:businessId` (hourly)
- Optional explicit alias: `POST /invoices/generate/business/:businessId/hourly`

No non-hourly generation flow is required.

### 3. Compensation Configuration (Answer to your table question)
Yes, add a **separate compensation/rate table**.

Use this precedence:
1. `staff_compensation_profile` (staff-specific override)
2. `position_compensation_profile` (default per job position)
3. legacy fallback: current `staff.salary` as hourly rate

Why:
- Same position can still have different rates/allowances per staff.
- You can safely change position defaults without rewriting old invoices.
- Invoice should snapshot all rates used at generation time.

Suggested collection: `compensation_profiles`

```ts
{
  _id: string;
  name: string;               // admin-defined profile name
  businessId: string;
  profileScope: "position" | "staff";
  jobPosition: string;        // this profile is effective for one job position
  staffId?: string;

  hourlyRate: number;

  overtimeRateMultiplier: number;           // e.g. 1.25
  sundayRateMultiplier: number;             // Sunday premium multiplier
  nightDifferentialRateMultiplier: number;  // multiplier for night hours
  isRiceAllowanceEligible: boolean;         // eligibility flag
  riceAllowanceFixedAmount: number;         // fixed bonus amount per cutoff

  // Position-level defaults are allowed, but staff-level preference wins
  isSssEnabled: boolean;
  isPagIbigEnabled: boolean;
  isPhilHealthEnabled: boolean;

  // Fixed statutory deduction amounts
  sssDeductionFixedAmount: number;
  pagIbigDeductionFixedAmount: number;
  philHealthDeductionFixedAmount: number;

  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Profile constraints:
- If `profileScope = "position"`: `staffId` must be empty.
- If `profileScope = "staff"`: `staffId` is required.
- `jobPosition` is required for both scopes.
- All `*RateMultiplier` fields are full multipliers (example: `1.25` means 125% of base, not +25 only).

Staff statutory settings rule:
- Each staff record can be set to opt in/out of each statutory deduction individually.
- Only admins can update these preferences (staff cannot edit).
- Effective flags during generation should resolve as:
1. staff-specific preference (highest priority)
2. position default
3. fallback default (`false` if unspecified)

## EOD Additions Needed for OT / Sunday / Night Differential
Current EOD has `date` and `hoursWorked` only. To compute OT, Sunday premium, and night differential cleanly, add:

```ts
// add to eod_reports
regularHoursWorked?: number;         // optional; fallback from hoursWorked
overtimeHoursWorked?: number;        // OT hours for the day
nightDifferentialHours?: number;     // hours eligible for night differential
```

If you do not want UI changes yet, server can derive temporary defaults:
- `regularHoursWorked = hoursWorked`
- `overtimeHoursWorked = 0`
- `nightDifferentialHours = 0`
- `isSunday` is derived from `date` (no manual day-type input needed)

Validation rules:
- `regularHoursWorked + overtimeHoursWorked` should not exceed `hoursWorked` (when `hoursWorked` exists).
- `nightDifferentialHours` should not exceed total worked hours for that EOD.

## Invoice Breakdown Enhancement
Keep existing `deductions[]` and `additions[]`, but also store structured breakdown for audit:

```ts
earningsBreakdown: {
  regularEarnings: number;
  overtimeEarnings: number;
  sundayPremiumEarnings: number;
  nightDifferentialEarnings: number;
  riceAllowanceEarnings: number;
};

statutoryDeductions: {
  sss: number;
  pagIbig: number;
  philHealth: number;
};
```

Then:
- `calculatedPay = regularEarnings + overtimeEarnings + sundayPremiumEarnings + nightDifferentialEarnings + riceAllowanceEarnings`
- `deductions[]` should include entries for SSS/Pag-IBIG/PhilHealth when deduction amount > 0
- `netPay = calculatedPay + additionsTotal - deductionsTotal`
- `additions[]` should be used for manual/admin adjustments only (to avoid double-counting computed earnings like rice allowance).

If a staff member opted out of a statutory item, that item is stored as `0` and is not added to `deductions[]`.
To avoid mismatch, generate `deductions[]` from `statutoryDeductions` during invoice calculation (single source of truth).

## Calculation Flow
For each staff in selected period:
1. Resolve compensation profile (staff override > position default > staff fallback).
2. Load approved EODs in range.
3. Aggregate:
- `regularHoursWorked`
- `overtimeHoursWorked`
- Sunday hours (derived from EOD `date`)
- `nightDifferentialHours`
4. Compute earnings using multipliers.
   - Include rice allowance as fixed addition from compensation profile.
   - If `isRiceAllowanceEligible = true`, include `riceAllowanceFixedAmount` even when worked hours are `0`.
5. Compute statutory deductions from configured compensation settings.
   - Apply only for enabled items based on resolved staff preference.
   - Use fixed amounts (`sssDeductionFixedAmount`, `pagIbigDeductionFixedAmount`, `philHealthDeductionFixedAmount`).
   - Apply to all staff records, but only when staff is opted in.
6. Snapshot all inputs/rates into invoice document.
7. Save draft invoice (or skip duplicate).
8. Use the **latest** admin compensation settings at generation time.

## Statutory Deduction Strategy (No Government Policy Table)
No separate `government_deduction_policies` collection is required.
We only store and compute the deduction amounts used for payroll output.

Recommended setup:
- Keep deduction enable/disable flags in compensation profile (admin-managed only).
- Keep fixed deduction amounts in the same admin-managed compensation settings (staff-level or position-level).
- At invoice generation time, compute `sss`, `pagIbig`, and `philHealth` from those fixed amounts and snapshot them in the invoice.
- If an item is disabled for staff, computed value is `0`.
- Apply latest settings at generation time (no per-EOD historical rate reconstruction for now).

## API Additions (Minimal)
- `POST /invoices/generate/business/:businessId/hourly` (optional explicit route; existing route can stay as hourly)
- `POST /compensation-profiles`
- `PATCH /compensation-profiles/:id`
- `GET /compensation-profiles?businessId=...&profileScope=...`
- `PATCH /compensation-profiles/staff/:staffId/statutory-settings` (admin only)

## Migration Plan
1. Add `compensation_profiles` collection.
2. Add invoice fields for structured earnings/deductions snapshot.
3. Add EOD optional fields (`overtimeHoursWorked`, optional `regularHoursWorked`, `nightDifferentialHours`) and derive Sunday from `date`.
4. Extract current invoice compute logic into one hourly-only shared service.
5. Remove legacy `salaryType` branching from invoice calculations.
6. Disable startup historical recovery in cron; keep only scheduled current-cycle generation.
7. Backfill strategy (optional): run one-off script only when explicitly needed.

## Important Guardrails
- Never recompute approved/paid invoices.
- Always snapshot rates/multipliers/deduction rules used inside invoice.
- Keep duplicate prevention key unchanged.
- Keep `no work, no pay` behavior for base earnings: zero approved work hours means zero **regular/overtime/sunday/night** earnings.
- Rice allowance is exempt from the above and should still be included when `isRiceAllowanceEligible = true`.

## Quick Answer
Your idea is correct: make compensation hourly-only for all staff, keep a **compensation profile system** (position defaults + staff overrides), and remove non-hourly invoice logic.
