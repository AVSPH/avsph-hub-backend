import { z } from "zod";
import { eodReportSchema, submitEodSchema, editOwnEodSchema, reviewEodSchema, adminEditEodSchema } from "../types/eod.types.js";
export type EodReport = z.infer<typeof eodReportSchema>;
export type SubmitEodInput = z.infer<typeof submitEodSchema>;
export type EditOwnEodInput = z.infer<typeof editOwnEodSchema>;
export type ReviewEodInput = z.infer<typeof reviewEodSchema>;
export type AdminEditEodInput = z.infer<typeof adminEditEodSchema>;
export interface EODReportDocument {
    _id?: string;
    staffId: string;
    businessId: string;
    date: string;
    hoursWorked: number;
    regularHoursWorked?: number;
    overtimeHoursWorked?: number;
    nightDifferentialHours?: number;
    tasksCompleted: string;
    onSite?: boolean;
    challenges?: string;
    nextDayPlan?: string;
    notes?: string;
    status: "submitted" | "reviewed" | "needs_revision";
    isApproved: boolean;
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=eod.schema.d.ts.map