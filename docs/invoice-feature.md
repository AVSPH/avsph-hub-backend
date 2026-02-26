# Invoice Generation Feature Plan

## Overview

We are transitioning the traditional "Payroll" system to an **Invoice** system. Instead of calculating pay based on exact clock in/out times, we will generate bi-monthly invoices based on the `hoursWorked` logged in the **approved End of Day (EOD) Reports**.

Staff/VAs can view their **expected earnings in real-time** (a live aggregation from approved EODs), independent of whether an invoice document exists yet. Invoices are admin-controlled artifacts that go through a `draft → calculated → approved → paid` lifecycle.

## Payout Schedule (Bi-Monthly)

Invoices will be generated twice a month:

1. **First Half**: 1st day of the month to the 15th day.
2. **Second Half**: 16th day of the month to the last day of the month.

---

## Staff Expected Earnings (Real-Time — No Invoice Required)

### Problem

Staff need to see how much they will be paid for the current pay cycle **before** an invoice is generated or approved. This should not depend on an invoice document existing.

### Solution — Live Aggregation Endpoint

A lightweight read-only endpoint that queries approved EODs in real-time:

```
GET /eod/my-earnings?periodStart=2026-02-16&periodEnd=2026-02-28
```

If no dates are provided, the endpoint auto-detects the **current active pay cycle**:

- If today is between the 1st–15th → period is `1st – 15th` of the current month.
- If today is between the 16th–end → period is `16th – last day` of the current month.

#### Response Shape

```json
{
  "periodStart": "2026-02-16",
  "periodEnd": "2026-02-28",
  "totalHoursWorked": 72,
  "totalDaysWorked": 9,
  "baseSalary": 5,
  "salaryType": "hourly",
  "estimatedPay": 360,
  "approvedEodCount": 9,
  "pendingEodCount": 2,
  "nextPayoutDate": "2026-03-01"
}
```

#### Key Rules

- **No document is created.** This is a pure aggregation query (`approved EODs` + `staff.salary`).
- **Only approved EODs** count toward `estimatedPay`. Pending/needs_revision EODs are shown as `pendingEodCount` for transparency.
- Staff sees this on their dashboard as an "Expected Earnings" card — always up to date.
- `nextPayoutDate` is the upcoming 1st or 16th when the invoice would be generated.

---

## Core Mechanics

1. **EOD Linking**: When generating an invoice for a specific period, the system will query all _approved_ EOD reports for the `staffId` within that date range.
2. **Calculation**: Total Pay = Sum(`EOD.hoursWorked`) \* `Staff.salary` (hourly rate). The `salaryType` field supports edge cases but the primary path is `hourly`.
3. **Adjustments**: The admin can add manual additions (bonuses) or deductions before finalizing the invoice.
4. **PDF Generation**: Frontend-only via `html2pdf.js`, `react-pdf`, or browser print-to-pdf.

## Invoice Schema (Already Implemented — `invoice.schema.ts`)

```typescript
export interface InvoiceAdjustmentType {
  type: string;
  description?: string;
  amount: number;
}

export interface InvoiceDocumentType {
  _id?: string;
  staffId: string; // ID of the VA/Staff
  businessId: string; // ID of the Client/Business

  // Period details
  periodStart: string; // e.g., '2026-02-01'
  periodEnd: string; // e.g., '2026-02-15'

  // Calculation Base
  totalHoursWorked: number; // Sum of EOD hours
  totalDaysWorked: number; // Count of approved EODs
  salaryType: "hourly" | "daily" | "monthly" | "annual";
  baseSalary: number; // The rate configured on the Staff member

  // Financials
  calculatedPay: number; // Earnings based on rate * hours/days
  deductions: InvoiceAdjustmentType[];
  additions: InvoiceAdjustmentType[];
  netPay: number; // Final amount to be paid

  // Linkages
  eodIds: string[]; // References to approved EODs included in this invoice
  eodCount: number;

  // State
  status: "draft" | "calculated" | "approved" | "paid";
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string; // Admin notes on the invoice

  // Native
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## Invoice Generation Strategy: Generate Once + Recalculate on Demand

### The Problem

What happens when an EOD gets approved **after** the invoice for that period was already generated? For example:

- Cron generates a draft invoice on March 1st for the Feb 16–28 period.
- On March 3rd, the admin approves a late EOD from Feb 20th.
- The existing draft invoice is now missing that EOD's hours.

### The Solution — Three Mechanisms

| Mechanism              | Endpoint                          | Purpose                                                                                                                                                                                                   |
| ---------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cron auto-generate** | _(internal, runs on 1st/16th)_    | Creates `draft` invoices for all hourly staff. Uses unique constraint: `staffId + businessId + periodStart + periodEnd`. Safe to re-run.                                                                  |
| **Recalculate**        | `PATCH /invoices/:id/recalculate` | Re-queries approved EODs for the invoice's period, updates `totalHoursWorked`, `eodIds`, `calculatedPay`, `netPay`. **Only works on `draft` or `calculated` status** — cannot recalculate after approval. |
| **Manual generate**    | `POST /invoices/generate`         | Admin triggers for any arbitrary period. Same duplicate check. If an invoice already exists for that staff+period, it returns the existing one (admin can then recalculate if needed).                    |

### Why This Approach?

| Alternative                                  | Problem                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Strict 1st/16th only (no recalculate)        | Breaks when an EOD gets approved late. Admin would have to delete and recreate the invoice.                                     |
| Auto-update invoice on EOD approval          | Complex event-driven coupling between EOD and invoice modules. Race conditions, hard to debug, invoice amounts change silently. |
| **Generate once + Recalculate on demand** ✅ | Simple, explicit, admin-controlled. Admin knows exactly when the numbers change. No silent mutations.                           |

### The Complete Flow

```
Staff submits EOD → Admin approves EOD
    ↓
Staff sees updated "Expected Earnings" instantly (real-time aggregation query)
    ↓
1st or 16th arrives → Cron generates draft invoices (snapshot of approved EODs at that moment)
    ↓
Admin reviews draft → Notices a late EOD was approved after generation → Clicks "Recalculate"
    ↓
Invoice re-aggregates all approved EODs for that period → totals update
    ↓
Admin adds adjustments (bonuses/deductions) → Approves invoice
    ↓
Staff sees finalized invoice under "My Invoices" (only approved+ invoices are visible to staff)
```

---

## Recalculate Endpoint Details

### `PATCH /invoices/:id/recalculate`

**Who can call**: Admin only
**Allowed statuses**: `draft`, `calculated` (not `approved` or `paid`)

#### Logic:

1. Fetch the invoice by ID.
2. Verify status is `draft` or `calculated` (reject otherwise — approved invoices are locked).
3. Re-query all approved EODs for `staffId` + `businessId` where `date` is between `periodStart` and `periodEnd`.
4. Recalculate:
   - `totalHoursWorked` = sum of all matched EOD `hoursWorked`
   - `totalDaysWorked` = count of matched EODs
   - `eodIds` = array of matched EOD `_id`s
   - `eodCount` = length of `eodIds`
   - `calculatedPay` = `totalHoursWorked * baseSalary` (for hourly)
   - `netPay` = `calculatedPay + sum(additions) - sum(deductions)`
5. Update the invoice document.
6. Return the updated invoice.

#### Response:

```json
{
  "message": "Invoice recalculated successfully",
  "previousTotal": 320,
  "newTotal": 360,
  "eodsAdded": 1,
  "eodsRemoved": 0
}
```

> **Note:** If an EOD's approval is _revoked_ (e.g., admin un-approves it), recalculating will also remove that EOD from the invoice — the numbers always reflect the current state of approved EODs.

---

## PDF Generation Workflow (Frontend-Only)

Instead of generating and storing PDFs on the backend, the process is streamlined:

1. When generating an invoice, the backend simply aggregates the EODs and calculates the totals in the `InvoiceDocument`.
2. The frontend fetches the `InvoiceDocument` and the populated `EODReport` data.
3. The frontend displays the invoice data in a clean UI.
4. When the user clicks "Download PDF", a frontend library (like `html2pdf.js`, `react-pdf`, or the browser's native print-to-pdf) captures the rendered UI and saves it locally as a PDF file.

## Dashboard Views (Frontend)

### Admin/Manager View

- A table listing all generated invoices with filters (status, business, period, staff).
- **"Generate Invoices"** button: select a period → system finds all EODs for all active hourly staff and creates `draft` invoices.
- Click into an individual invoice:
  - Review the list of aggregated EODs.
  - **"Recalculate"** button (visible on `draft`/`calculated` invoices) — re-aggregates EODs to catch any late approvals.
  - Add bonuses/deductions.
  - Click "Approve" to finalize.

### VA/Staff View

- **"Expected Earnings" card** on the dashboard — real-time aggregation, always shows current pay cycle projection based on approved EODs. No invoice needed.
- **"My Invoices" tab** — list of `approved` and `paid` invoices only (staff never sees `draft`).
  - Click to see a breakdown of hours worked for that period.
  - **"Download PDF"** button — frontend-only PDF generation.

---

## Scheduled Invoice Generation (Background Job)

### Overview

The system will automatically generate `draft` invoices on a bi-monthly schedule using **`node-cron`** integrated into the Fastify server lifecycle. No external job queue or worker process is needed.

### Schedule

| Cron Expression | Trigger Time                     | Invoice Period Covered                    |
| --------------- | -------------------------------- | ----------------------------------------- |
| `0 0 1 * *`     | **1st of each month, midnight**  | 16th → last day of the **previous** month |
| `0 0 16 * *`    | **16th of each month, midnight** | 1st → 15th of the **current** month       |

> **Why offset?** Invoices are generated _after_ the period ends so all EODs for that period have been submitted and (ideally) approved.

### Job Logic (per trigger)

1. **Determine the period**: Based on the trigger date, calculate `periodStart` and `periodEnd`.
2. **Fetch active hourly staff**: Query all staff with `isActive: true` **and `salaryType: 'hourly'`** across all businesses. Staff with other salary types (daily, monthly, annual) are excluded from automatic generation.
3. **For each staff member**:
   a. **Duplicate check**: Skip if an invoice already exists for this `staffId` + `businessId` + `periodStart` + `periodEnd`.
   b. **Query approved EODs**: Find all EOD reports where `staffId` matches, `date` is within the period, and `isApproved: true`.
   c. **Aggregate hours**: Sum `hoursWorked` from the matching EODs.
   d. **Calculate pay**: Apply the staff member's `salaryType` and `baseSalary` rate.
   e. **Create draft invoice**: Insert an `InvoiceDocument` with `status: 'draft'`, empty `deductions`/`additions`, and link all `eodIds`.
4. **Log results**: Record how many invoices were created, skipped (duplicates), or failed.

### Fastify Integration (`src/plugins/cron.plugin.ts`)

```typescript
import fp from "fastify-plugin";
import cron from "node-cron";
import { FastifyInstance } from "fastify";

export default fp(async (fastify: FastifyInstance) => {
  // --- Startup Recovery: detect and generate any missing invoices ---
  fastify.addHook("onReady", async () => {
    fastify.log.info("[STARTUP] Checking for missing invoices...");
    try {
      await recoverMissingInvoices(fastify);
    } catch (err) {
      fastify.log.error(err, "[STARTUP] Missing invoice recovery failed");
    }
  });

  // 1st of every month at midnight (Asia/Manila) — covers previous month's 2nd half
  cron.schedule(
    "0 0 1 * *",
    async () => {
      fastify.log.info(
        "[CRON] Generating invoices for previous month 2nd half...",
      );
      try {
        await generateInvoicesForPeriod(fastify, "second-half-previous");
      } catch (err) {
        fastify.log.error(err, "[CRON] Invoice generation failed");
      }
    },
    { timezone: "Asia/Manila" },
  );

  // 16th of every month at midnight (Asia/Manila) — covers current month's 1st half
  cron.schedule(
    "0 0 16 * *",
    async () => {
      fastify.log.info(
        "[CRON] Generating invoices for current month 1st half...",
      );
      try {
        await generateInvoicesForPeriod(fastify, "first-half-current");
      } catch (err) {
        fastify.log.error(err, "[CRON] Invoice generation failed");
      }
    },
    { timezone: "Asia/Manila" },
  );

  // Graceful shutdown — stop all cron tasks when server closes
  fastify.addHook("onClose", () => {
    cron.getTasks().forEach((task) => task.stop());
    fastify.log.info("[CRON] All scheduled tasks stopped.");
  });
});
```

### Period Calculation Helper

```typescript
function getPeriodDates(type: "second-half-previous" | "first-half-current"): {
  start: string;
  end: string;
} {
  const now = new Date();

  if (type === "first-half-current") {
    // Triggered on the 16th — covers 1st to 15th of current month
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    return {
      start: new Date(year, month, 1).toISOString().split("T")[0],
      end: new Date(year, month, 15).toISOString().split("T")[0],
    };
  } else {
    // Triggered on the 1st — covers 16th to last day of PREVIOUS month
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0,
    ).getDate();
    return {
      start: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16)
        .toISOString()
        .split("T")[0],
      end: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), lastDay)
        .toISOString()
        .split("T")[0],
    };
  }
}
```

### Error Handling & Resilience

- **Per-staff try/catch**: If invoice generation fails for one staff member, it logs the error and continues to the next. One failure does not block the entire batch.
- **Duplicate prevention**: The job checks for existing invoices before creating. This means if the cron fires twice (server restart, etc.), it won't create duplicates. The unique constraint is: `staffId + businessId + periodStart + periodEnd`.
- **Manual fallback**: Admins can still manually trigger invoice generation from the dashboard for any period. The same `generateInvoicesForPeriod` function is reused by both the cron job and the manual API endpoint.
- **Recalculate after late approvals**: If EODs are approved after the invoice was generated, admin clicks "Recalculate" on the draft invoice to pull in the newly approved EODs.
- **Missed runs**: If the server was down when a cron was supposed to fire, the startup recovery auto-generates missing invoices. Admin can also trigger manually.

### Required Dependency

```bash
npm install node-cron
npm install -D @types/node-cron
```

### Timezone

All cron schedules are configured with `{ timezone: "Asia/Manila" }` as decided above. This ensures consistent invoice period boundaries regardless of which server or cloud region the app is deployed to.

---

## API Endpoints Summary

### Staff Endpoints (auth: staff token)

| Method | Endpoint                    | Description                                                                           |
| ------ | --------------------------- | ------------------------------------------------------------------------------------- |
| `GET`  | `/eod/my-earnings`          | Real-time expected earnings for current pay cycle (or custom period via query params) |
| `GET`  | `/invoices/my-invoices`     | List of `approved`/`paid` invoices for the logged-in staff                            |
| `GET`  | `/invoices/my-invoices/:id` | Single invoice detail with linked EOD breakdown                                       |

### Admin Endpoints (auth: admin token)

| Method   | Endpoint                                  | Description                                                           |
| -------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `POST`   | `/invoices/generate`                      | Generate invoice for a single staff member for a given period         |
| `POST`   | `/invoices/generate/business/:businessId` | Batch generate invoices for all hourly staff in a business            |
| `GET`    | `/invoices`                               | List all invoices (with filters: status, businessId, staffId, period) |
| `GET`    | `/invoices/:id`                           | Get single invoice with populated EOD details                         |
| `PATCH`  | `/invoices/:id/recalculate`               | Re-aggregate approved EODs and update totals (draft/calculated only)  |
| `PATCH`  | `/invoices/:id/approve`                   | Approve an invoice (locks it, sets approvedBy/approvedAt)             |
| `PATCH`  | `/invoices/:id/adjustments`               | Add deduction or addition to an invoice                               |
| `PATCH`  | `/invoices/:id/mark-paid`                 | Mark an approved invoice as paid                                      |
| `DELETE` | `/invoices/:id`                           | Soft-delete an invoice                                                |

---

## Decisions (Resolved)

1. **Pay Rate Structure**: Most VAs are paid on an **hourly rate** basis. The primary calculation is `totalHoursWorked * baseSalary` (hourly rate). The `salaryType` field remains on the schema to support edge cases in the future, but the default and most common path is `hourly`. **Only staff with `salaryType: 'hourly'` are included in automatic (cron & startup recovery) invoice generation.** Staff with other salary types can still have invoices created manually by an admin if needed.

2. **Draft vs Auto-Approve**: All generated invoices remain in **`draft`** status until an admin explicitly reviews and approves them. VAs/Staff should **not** see an invoice until its status is at least `approved`. This gives admins the opportunity to review hours, add adjustments (bonuses/deductions), and catch any discrepancies before the VA is notified.

3. **Timezone**: All cron jobs will use **`Asia/Manila`** timezone.

   ```typescript
   cron.schedule("0 0 1 * *", callback, { timezone: "Asia/Manila" });
   cron.schedule("0 0 16 * *", callback, { timezone: "Asia/Manila" });
   ```

4. **Missed Run Recovery**: The system will support **both** approaches:
   - **Auto-detect on startup**: When the server boots, it checks for any invoice periods that should have been generated but weren't (e.g., server was down during a scheduled run). If missing periods are found, it automatically generates `draft` invoices for them.
   - **Manual trigger**: Admins can also manually trigger invoice generation for any arbitrary period from the dashboard via a dedicated API endpoint (`POST /invoices/generate`). This reuses the same `generateInvoicesForPeriod` logic and includes duplicate prevention so it's safe to call multiple times.

5. **Late EOD Approvals**: Handled via the **Recalculate** mechanism. When an EOD is approved after the invoice for that period was already generated, the admin uses `PATCH /invoices/:id/recalculate` to re-aggregate. This is explicit and admin-controlled — no silent invoice mutations.

6. **Staff Earnings Visibility**: Staff see **real-time expected earnings** via a live aggregation query (`GET /eod/my-earnings`), independent of invoice existence. They see **finalized invoices** only after admin approval (`status: 'approved'` or `'paid'`).

### Startup Recovery Logic

On server start, the system will:

1. Determine all expected invoice periods from the earliest active staff `createdAt` date up to the current date.
2. For each period, check if invoices exist for all active **hourly-rate** staff members (`salaryType: 'hourly'`) assigned to businesses.
3. For any missing staff+period combinations, generate `draft` invoices automatically.
4. Log a summary of recovered invoices (e.g., `[STARTUP] Generated 3 missing draft invoices`).

This ensures no invoices are lost due to server downtime, while the manual trigger serves as a fallback for ad-hoc or re-generation scenarios.

---

## Implementation Order

1. **Staff Expected Earnings endpoint** — `GET /eod/my-earnings` (real-time aggregation, no document created)
2. **Invoice controllers & routes** — generate, recalculate, approve, adjustments, list/get, mark-paid, delete
3. **Cron plugin** — auto-generates on 1st/16th with startup recovery
4. **Frontend: Staff earnings card** — dashboard widget showing current cycle projection
5. **Frontend: Admin invoice management** — generate, review, recalculate, approve, adjustments
6. **Frontend: Staff invoice list** — view approved invoices, download PDF
