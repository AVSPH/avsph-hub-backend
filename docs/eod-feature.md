# EOD (End of Day) Report Feature Plan

## Overview
We are transitioning from a traditional time-clock "Attendance" system (`clockIn`, `clockOut`) to an **End of Day (EOD) Report** system. Instead of tracking exact clock-in/out times, staff/VAs will submit a daily report summarizing their shift.

## Core Fields Requested
- **Date**: The date the report is for.
- **Working Hours**: Total hours worked that day.
- **Tasks Finished**: What was accomplished.

## Suggested Improvements & Additional Fields
To make the EOD reports more effective for management and tracking, I suggest adding the following optional (or required) fields to the schema:
1. **Challenges/Blockers (`challengesAndBlockers`)**: Helps management know if the VA is stuck on anything (optional, but highly recommended).
2. **Plan for Tomorrow (`nextDayPlan`)**: Helps set expectations for the next shift and keeps the VA organized (optional).
3. **Report Status (`status`)**: Instead of `pending`/`approved`, we can use `submitted` and `reviewed`/`acknowledged` to indicate an admin has seen it.
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
    status: 'submitted' | 'reviewed'; // Replaces pending/approved
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

## Migration Plan / Action Items
1. **Update Types & Zod Schemas**: Replace `attendance.types.ts` and `attendance.schema.ts` with `eod.types.ts` and `eod.schema.ts`.
2. **Update Mongoose Model**: Create a new Mongoose schema definition for the EOD Report.
3. **Update Controllers & Routes**: Modify controllers to handle EOD submissions, reviews, and fetching instead of clock in/out logic.
4. **Frontend Form (Next steps later)**: The UI will change from standard "Clock In/Out" buttons to a form containing fields for `date`, `hoursWorked`, `tasksCompleted`, etc.

Please review this plan. If you like the suggested fields (`challenges`, `nextDayPlan`, etc.) or want to stick strictly to the 3 fields you mentioned, let me know!
