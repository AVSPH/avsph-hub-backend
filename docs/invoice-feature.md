# Invoice Generation Feature Plan

## Overview

We are transitioning the traditional "Payroll" system to an **Invoice** system. Instead of calculating pay based on exact clock in/out times, we will generate bi-monthly invoices based on the `hoursWorked` logged in the **approved End of Day (EOD) Reports**.

## Payout Schedule (Bi-Monthly)

Invoices will be generated twice a month:

1. **First Half**: 1st day of the month to the 15th day.
2. **Second Half**: 16th day of the month to the last day of the month.

## Core Mechanics

1. **EOD Linking**: When generating an invoice for a specific period, the system will query all _approved_ EOD reports for the `staffId` within that date range.
2. **Calculation**: Total Pay = Sum(`EOD.hoursWorked`) \* `Staff.salary` (if hourly basis) or a pro-rated amount based on the salary type and days worked.
3. **Adjustments**: The admin can add manual additions (bonuses) or deductions before finalizing the invoice.
4. **PDF Generation**: Once the invoice is approved/finalized, the system will generate a PDF copy that the staff/VA can download for their own records.

## Proposed Schema updates (`invoice.schema.ts` replacing `payroll.schema.ts`)

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
  periodStart: string; // e.g., '2023-11-01'
  periodEnd: string; // e.g., '2023-11-15'

  // Calculation Base
  totalHoursWorked: number; // Sum of EOD hours
  totalDaysWorked: number; // Count of EODs submitted
  salaryType: "hourly" | "daily" | "monthly" | "annual";
  baseSalary: number; // The rate configured on the Staff member

  // Financials
  calculatedPay: number; // Earnings based on rate * hours/days
  deductions: InvoiceAdjustmentType[];
  additions: InvoiceAdjustmentType[];
  netPay: number; // Final amount to be paid

  // Linkages
  eodIds: string[]; // Replaces attendanceIds; references approved EODs
  eodCount: number; // Handled instead of attendanceCount

  // Document Generation (Removed backend storage requirement)
  // pdfUrl?: string; // No longer needed, PDF is generated on the fly via frontend

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

## PDF Generation Workflow (Frontend-Only)

Instead of generating and storing PDFs on the backend, the process is streamlined:

1. When generating an invoice, the backend simply aggregates the EODs and calculates the totals in the `InvoiceDocument`.
2. The frontend fetches the `InvoiceDocument` and the populated `EODReport` data.
3. The frontend displays the invoice data in a clean UI.
4. When the user clicks "Download PDF", a frontend library (like `html2pdf.js`, `react-pdf`, or the browser's native print-to-pdf) captures the rendered UI and saves it locally as a PDF file.

## Dashboard Views (Frontend)

1. **Admin/Manager View**:
   - A table listing all generated invoices.
   - Ability to "Generate Invoices" for a selected period (e.g., select First Half of Nov -> system finds all EODs for all active staff and creates `draft` invoices).
   - Ability to click into an individual invoice, review the list of aggregated EODs, add bonuses/deductions, and click "Approve".

2. **VA/Staff View**:
   - Under a "My Earnings" or "My Invoices" tab, they see a clean list of their finalized invoices.
   - Click to see a breakdown of the hours worked for that period.
   - A button to "Download PDF", which triggers the frontend string-to-pdf generation of their invoice view.

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
- **Duplicate prevention**: The job checks for existing invoices before creating. This means if the cron fires twice (server restart, etc.), it won't create duplicates.
- **Manual fallback**: Admins can still manually trigger invoice generation from the dashboard for any period. The same `generateInvoicesForPeriod` function is reused by both the cron job and the manual API endpoint.
- **Missed runs**: If the server was down when a cron was supposed to fire, the admin can trigger it manually. Optionally, a startup check can look for "missing" invoices and generate them.

### Required Dependency

```bash
npm install node-cron
npm install -D @types/node-cron
```

### Timezone

All cron schedules are configured with `{ timezone: "Asia/Manila" }` as decided above. This ensures consistent invoice period boundaries regardless of which server or cloud region the app is deployed to.

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

### Startup Recovery Logic

On server start, the system will:

1. Determine all expected invoice periods from the earliest active staff `createdAt` date up to the current date.
2. For each period, check if invoices exist for all active **hourly-rate** staff members (`salaryType: 'hourly'`) assigned to businesses.
3. For any missing staff+period combinations, generate `draft` invoices automatically.
4. Log a summary of recovered invoices (e.g., `[STARTUP] Generated 3 missing draft invoices`).

This ensures no invoices are lost due to server downtime, while the manual trigger serves as a fallback for ad-hoc or re-generation scenarios.
