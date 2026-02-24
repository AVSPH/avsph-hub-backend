# EOD (End of Day) Report Feature Plan

## Overview
We are transitioning from a traditional time-clock "Attendance" system (`clockIn`, `clockOut`) to an **End of Day (EOD) Report** system. Instead of tracking exact clock-in/out times, staff/VAs will submit a daily report summarizing their shift.

## Core Fields Requested
- **Date**: The date the report is for. *(Note: A Staff/VA can only submit ONE EOD per day. Consecutive shifts on the same day must be combined into a single report).*
- **Working Hours**: Total hours worked that day.
- **Tasks Finished**: What was accomplished.

## Suggested Improvements & Additional Fields
To make the EOD reports more effective for management and tracking, I suggest adding the following optional (or required) fields to the schema:
1. **Challenges/Blockers (`challengesAndBlockers`)**: Helps management know if the VA is stuck on anything (optional, but highly recommended).
2. **Plan for Tomorrow (`nextDayPlan`)**: Helps set expectations for the next shift and keeps the VA organized (optional).
3. **Report Status (`status`)**: We can use `submitted`, `reviewed` (acknowledged), and `needs_revision` (returned to VA for disputes).
4. **Approval Status (`isApproved`)**: A boolean flag to indicate if the EOD report has been approved by an admin (initial status `false`).
5. **Admin Notes (`adminNotes`)**: A place for the manager to leave feedback on the specific EOD report.

## Proposed Document Interface (`eodReport.schema.ts`)
```typescript
export interface EODReportDocument {
    _id?: string;
    
    // Relations
    staffId: string;        // ID of the VA/Staff
    businessId: string;     // ID of the Client/Business
    
    // Core Report Data
    date: string;           // Date of the shift (ISO string or YYYY-MM-DD)
    hoursWorked: number;    // Total hours logged
    tasksCompleted: string; // Detailed description of tasks finished (or string[])
    
    // Suggested Additions (Optional)
    challenges?: string;    // Any hurdles faced during the shift
    nextDayPlan?: string;   // What is the priority for the next shift
    
    // Meta & Review
    status: 'submitted' | 'reviewed' | 'needs_revision';
    isApproved: boolean;    // Must be approved by admin (default: false)
    notes?: string;         // Additional general notes from the VA
    adminNotes?: string;    // Feedback from admin
    reviewedBy?: string;    // ID of admin who reviewed
    reviewedAt?: string;    // When it was reviewed
    
    // Native properties
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
```

## EOD Dispute & Editing Workflow
To best handle discrepancies (e.g., claiming 8 hours when only 4 were worked), a hybrid approach is best:
1. **Admin Edits (Minor Tweaks)**: The Admin has full access to edit the `hoursWorked` or `tasksCompleted` directly on the submitted EOD. They can leave an `adminNotes` message explaining the change (e.g., "Adjusted hours down by 0.5 for unpaid lunch break"), and then set `isApproved = true`. This prevents bottlenecks for simple fixes.
2. **VA Revisions (Major Disputes)**: If the report is fundamentally wrong or missing critical information, the Admin changes the `status` to `'needs_revision'`, leaves an `adminNotes` explaining what needs fixing, and does *not* approve it.
3. The VA sees the `'needs_revision'` flag on their dashboard, edits their own EOD, and submits it again (putting it back to `'submitted'`).

## Migration Plan / Action Items
1. **Update Types & Zod Schemas**: Replace `attendance.types.ts` and `attendance.schema.ts` with `eod.types.ts` and `eod.schema.ts`.
2. **Update Mongoose Model**: Create a new Mongoose schema definition for the EOD Report.
3. **Update Controllers & Routes**: Modify controllers to handle EOD submissions (including logic to reject duplicate dates for the same `staffId`), admin edits, review/approval toggles, and fetching.
4. **Frontend Form (Next steps later)**: The UI will change from standard "Clock In/Out" buttons to a form containing fields for `date`, `hoursWorked`, `tasksCompleted`, etc., with UI to handle the `needs_revision` state.

Please review this plan. If you are good with these rules (the single daily limit, the hybrid dispute flow, etc.), we can move on to actually writing the code!
