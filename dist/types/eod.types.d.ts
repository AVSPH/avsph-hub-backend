import { z } from "zod";
export declare const eodStatusEnum: z.ZodEnum<["submitted", "reviewed", "needs_revision"]>;
export declare const eodReportSchema: z.ZodEffects<z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    staffId: z.ZodString;
    businessId: z.ZodString;
    date: z.ZodString;
    hoursWorked: z.ZodNumber;
    regularHoursWorked: z.ZodOptional<z.ZodNumber>;
    overtimeHoursWorked: z.ZodOptional<z.ZodNumber>;
    nightDifferentialHours: z.ZodOptional<z.ZodNumber>;
    tasksCompleted: z.ZodString;
    onSite: z.ZodOptional<z.ZodBoolean>;
    challenges: z.ZodOptional<z.ZodString>;
    nextDayPlan: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["submitted", "reviewed", "needs_revision"]>>;
    isApproved: z.ZodDefault<z.ZodBoolean>;
    adminNotes: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodOptional<z.ZodString>;
    reviewedAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "submitted" | "reviewed" | "needs_revision";
    date: string;
    staffId: string;
    businessId: string;
    isActive: boolean;
    hoursWorked: number;
    isApproved: boolean;
    tasksCompleted: string;
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    adminNotes?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
}, {
    date: string;
    staffId: string;
    businessId: string;
    hoursWorked: number;
    tasksCompleted: string;
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
}>, {
    status: "submitted" | "reviewed" | "needs_revision";
    date: string;
    staffId: string;
    businessId: string;
    isActive: boolean;
    hoursWorked: number;
    isApproved: boolean;
    tasksCompleted: string;
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    adminNotes?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
}, {
    date: string;
    staffId: string;
    businessId: string;
    hoursWorked: number;
    tasksCompleted: string;
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
}>;
export declare const submitEodSchema: z.ZodEffects<z.ZodObject<{
    date: z.ZodString;
    hoursWorked: z.ZodNumber;
    regularHoursWorked: z.ZodOptional<z.ZodNumber>;
    overtimeHoursWorked: z.ZodOptional<z.ZodNumber>;
    nightDifferentialHours: z.ZodOptional<z.ZodNumber>;
    tasksCompleted: z.ZodString;
    onSite: z.ZodOptional<z.ZodBoolean>;
    challenges: z.ZodOptional<z.ZodString>;
    nextDayPlan: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    hoursWorked: number;
    tasksCompleted: string;
    notes?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}, {
    date: string;
    hoursWorked: number;
    tasksCompleted: string;
    notes?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}>, {
    date: string;
    hoursWorked: number;
    tasksCompleted: string;
    notes?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}, {
    date: string;
    hoursWorked: number;
    tasksCompleted: string;
    notes?: string | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}>;
export declare const editOwnEodSchema: z.ZodEffects<z.ZodObject<{
    hoursWorked: z.ZodOptional<z.ZodNumber>;
    regularHoursWorked: z.ZodOptional<z.ZodNumber>;
    overtimeHoursWorked: z.ZodOptional<z.ZodNumber>;
    nightDifferentialHours: z.ZodOptional<z.ZodNumber>;
    tasksCompleted: z.ZodOptional<z.ZodString>;
    onSite: z.ZodOptional<z.ZodBoolean>;
    challenges: z.ZodOptional<z.ZodString>;
    nextDayPlan: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    tasksCompleted?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}, {
    notes?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    tasksCompleted?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}>, {
    notes?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    tasksCompleted?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}, {
    notes?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    tasksCompleted?: string | undefined;
    challenges?: string | undefined;
    nextDayPlan?: string | undefined;
}>;
export declare const reviewEodSchema: z.ZodObject<{
    status: z.ZodEnum<["reviewed", "needs_revision"]>;
    isApproved: z.ZodOptional<z.ZodBoolean>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "reviewed" | "needs_revision";
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
}, {
    status: "reviewed" | "needs_revision";
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
}>;
export declare const adminEditEodSchema: z.ZodEffects<z.ZodObject<{
    hoursWorked: z.ZodOptional<z.ZodNumber>;
    regularHoursWorked: z.ZodOptional<z.ZodNumber>;
    overtimeHoursWorked: z.ZodOptional<z.ZodNumber>;
    nightDifferentialHours: z.ZodOptional<z.ZodNumber>;
    tasksCompleted: z.ZodOptional<z.ZodString>;
    onSite: z.ZodOptional<z.ZodBoolean>;
    date: z.ZodOptional<z.ZodString>;
    adminNotes: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["submitted", "reviewed", "needs_revision"]>>;
    isApproved: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    date?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    tasksCompleted?: string | undefined;
}, {
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    date?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    tasksCompleted?: string | undefined;
}>, {
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    date?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    tasksCompleted?: string | undefined;
}, {
    status?: "submitted" | "reviewed" | "needs_revision" | undefined;
    date?: string | undefined;
    hoursWorked?: number | undefined;
    regularHoursWorked?: number | undefined;
    overtimeHoursWorked?: number | undefined;
    nightDifferentialHours?: number | undefined;
    onSite?: boolean | undefined;
    isApproved?: boolean | undefined;
    adminNotes?: string | undefined;
    tasksCompleted?: string | undefined;
}>;
export type EodReport = z.infer<typeof eodReportSchema>;
export type SubmitEod = z.infer<typeof submitEodSchema>;
export type EditOwnEod = z.infer<typeof editOwnEodSchema>;
export type ReviewEod = z.infer<typeof reviewEodSchema>;
export type AdminEditEod = z.infer<typeof adminEditEodSchema>;
export declare const eodReportJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly staffId: {
            readonly type: "string";
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly date: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly hoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly regularHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly overtimeHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly nightDifferentialHours: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly tasksCompleted: {
            readonly type: "string";
            readonly maxLength: 5000;
        };
        readonly challenges: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly nextDayPlan: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly onSite: {
            readonly type: "boolean";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["submitted", "reviewed", "needs_revision"];
        };
        readonly isApproved: {
            readonly type: "boolean";
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly reviewedBy: {
            readonly type: "string";
        };
        readonly reviewedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly updatedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly staffName: {
            readonly type: "string";
        };
        readonly staffEmail: {
            readonly type: "string";
        };
    };
    readonly required: readonly ["staffId", "businessId", "date", "hoursWorked", "tasksCompleted"];
};
export declare const submitEodJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly date: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly hoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly regularHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly overtimeHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly nightDifferentialHours: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly tasksCompleted: {
            readonly type: "string";
            readonly maxLength: 5000;
        };
        readonly onSite: {
            readonly type: "boolean";
        };
        readonly challenges: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly nextDayPlan: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
    };
    readonly required: readonly ["date", "hoursWorked", "tasksCompleted"];
};
export declare const editOwnEodJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly hoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly regularHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly overtimeHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly nightDifferentialHours: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly tasksCompleted: {
            readonly type: "string";
            readonly maxLength: 5000;
        };
        readonly onSite: {
            readonly type: "boolean";
        };
        readonly challenges: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly nextDayPlan: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
    };
};
export declare const reviewEodJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["reviewed", "needs_revision"];
        };
        readonly isApproved: {
            readonly type: "boolean";
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
    };
    readonly required: readonly ["status"];
};
export declare const adminEditEodJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly hoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly regularHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly overtimeHoursWorked: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly nightDifferentialHours: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 24;
        };
        readonly tasksCompleted: {
            readonly type: "string";
            readonly maxLength: 5000;
        };
        readonly onSite: {
            readonly type: "boolean";
        };
        readonly date: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["submitted", "reviewed", "needs_revision"];
        };
        readonly isApproved: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=eod.types.d.ts.map