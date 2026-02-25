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
2. **Fetch active staff**: Query all staff with `isActive: true` across all businesses.
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
  // 1st of every month at midnight — covers previous month's 2nd half
  cron.schedule("0 0 1 * *", async () => {
    fastify.log.info(
      "[CRON] Generating invoices for previous month 2nd half...",
    );
    try {
      await generateInvoicesForPeriod(fastify, "second-half-previous");
    } catch (err) {
      fastify.log.error(err, "[CRON] Invoice generation failed");
    }
  });

  // 16th of every month at midnight — covers current month's 1st half
  cron.schedule("0 0 16 * *", async () => {
    fastify.log.info(
      "[CRON] Generating invoices for current month 1st half...",
    );
    try {
      await generateInvoicesForPeriod(fastify, "first-half-current");
    } catch (err) {
      fastify.log.error(err, "[CRON] Invoice generation failed");
    }
  });

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

### Timezone Consideration

By default, `node-cron` uses the server's system timezone. To enforce a specific timezone (e.g., UTC or your business timezone):

```typescript
cron.schedule("0 0 1 * *", callback, { timezone: "Asia/Manila" });
```

---

## Remaining Questions for You

1. **Pay Rate Structure**: Do ALL your VAs get paid hourly based on EOD hours, or do some have a fixed monthly salary where the hours logged are just for tracking and not direct pay calculation?
2. **Draft vs Auto-Approve**: When the system runs the bi-monthly generation, should it automatically approve them if there are no errors, or do you prefer an admin manually reviews every invoice before the VA can see it?
3. **Timezone**: What timezone should the cron jobs use? (e.g., `Asia/Manila`, `America/New_York`, or `UTC`?)
4. **Missed Run Recovery**: Should the server auto-detect and generate missing invoices on startup, or is manual admin trigger sufficient?
