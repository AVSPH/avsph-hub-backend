# Invoice Generation Feature Plan

## Overview
We are transitioning the traditional "Payroll" system to an **Invoice** system. Instead of calculating pay based on exact clock in/out times, we will generate bi-monthly invoices based on the `hoursWorked` logged in the **approved End of Day (EOD) Reports**.

## Payout Schedule (Bi-Monthly)
Invoices will be generated twice a month:
1. **First Half**: 1st day of the month to the 15th day.
2. **Second Half**: 16th day of the month to the last day of the month.

## Core Mechanics
1. **EOD Linking**: When generating an invoice for a specific period, the system will query all *approved* EOD reports for the `staffId` within that date range.
2. **Calculation**: Total Pay = Sum(`EOD.hoursWorked`) * `Staff.salary` (if hourly basis) or a pro-rated amount based on the salary type and days worked.
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
    staffId: string;        // ID of the VA/Staff
    businessId: string;     // ID of the Client/Business
    
    // Period details
    periodStart: string;    // e.g., '2023-11-01'
    periodEnd: string;      // e.g., '2023-11-15'
    
    // Calculation Base
    totalHoursWorked: number; // Sum of EOD hours
    totalDaysWorked: number;  // Count of EODs submitted
    salaryType: 'hourly' | 'daily' | 'monthly' | 'annual';
    baseSalary: number;       // The rate configured on the Staff member

    // Financials
    calculatedPay: number;    // Earnings based on rate * hours/days
    deductions: InvoiceAdjustmentType[];
    additions: InvoiceAdjustmentType[];
    netPay: number;           // Final amount to be paid
    
    // Linkages
    eodIds: string[];         // Replaces attendanceIds; references approved EODs
    eodCount: number;         // Handled instead of attendanceCount
    
    // Document Generation (Removed backend storage requirement)
    // pdfUrl?: string; // No longer needed, PDF is generated on the fly via frontend
    
    // State
    status: 'draft' | 'calculated' | 'approved' | 'paid';
    approvedBy?: string;
    approvedAt?: string;
    paidAt?: string;
    notes?: string;           // Admin notes on the invoice
    
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

## Remaining Questions for You
1. **Pay Rate Structure**: Do ALL your VAs get paid hourly based on EOD hours, or do some have a fixed monthly salary where the hours logged are just for tracking and not direct pay calculation?
2. **Draft vs Auto-Approve**: When the system runs the bi-monthly generation, should it automatically approve them if there are no errors, or do you prefer an admin manually reviews every invoice before the VA can see it?
