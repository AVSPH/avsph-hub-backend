import { z } from 'zod';
export declare const attendanceStatusEnum: z.ZodEnum<["pending", "approved", "rejected"]>;
export declare const attendanceSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    staffId: z.ZodString;
    businessId: z.ZodString;
    clockIn: z.ZodString;
    clockOut: z.ZodOptional<z.ZodString>;
    hoursWorked: z.ZodOptional<z.ZodNumber>;
    workDate: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "approved", "rejected"]>>;
    notes: z.ZodOptional<z.ZodString>;
    adminNotes: z.ZodOptional<z.ZodString>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected" | "pending";
    staffId: string;
    businessId: string;
    isActive: boolean;
    clockIn: string;
    workDate: string;
    _id?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    hoursWorked?: number | undefined;
    adminNotes?: string | undefined;
    clockOut?: string | undefined;
}, {
    staffId: string;
    businessId: string;
    clockIn: string;
    workDate: string;
    status?: "approved" | "rejected" | "pending" | undefined;
    _id?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    hoursWorked?: number | undefined;
    adminNotes?: string | undefined;
    clockOut?: string | undefined;
}>;
export declare const clockInSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const clockOutSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const approveAttendanceSchema: z.ZodObject<{
    status: z.ZodEnum<["approved", "rejected"]>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected";
    adminNotes?: string | undefined;
}, {
    status: "approved" | "rejected";
    adminNotes?: string | undefined;
}>;
export declare const editAttendanceSchema: z.ZodObject<{
    clockIn: z.ZodOptional<z.ZodString>;
    clockOut: z.ZodOptional<z.ZodString>;
    workDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    adminNotes: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "approved" | "rejected" | "pending" | undefined;
    notes?: string | undefined;
    adminNotes?: string | undefined;
    clockIn?: string | undefined;
    clockOut?: string | undefined;
    workDate?: string | undefined;
}, {
    status?: "approved" | "rejected" | "pending" | undefined;
    notes?: string | undefined;
    adminNotes?: string | undefined;
    clockIn?: string | undefined;
    clockOut?: string | undefined;
    workDate?: string | undefined;
}>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type ClockIn = z.infer<typeof clockInSchema>;
export type ClockOut = z.infer<typeof clockOutSchema>;
export type ApproveAttendance = z.infer<typeof approveAttendanceSchema>;
export type EditAttendance = z.infer<typeof editAttendanceSchema>;
export declare const attendanceJsonSchema: {
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
        readonly clockIn: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly clockOut: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly hoursWorked: {
            readonly type: "number";
        };
        readonly workDate: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pending", "approved", "rejected"];
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly approvedBy: {
            readonly type: "string";
        };
        readonly approvedAt: {
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
    };
    readonly required: readonly ["staffId", "businessId", "clockIn", "workDate"];
};
export declare const clockInJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
    };
};
export declare const clockOutJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
    };
};
export declare const approveAttendanceJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["approved", "rejected"];
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
    };
    readonly required: readonly ["status"];
};
export declare const editAttendanceJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly clockIn: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly clockOut: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly workDate: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pending", "approved", "rejected"];
        };
    };
};
//# sourceMappingURL=attendance.types.d.ts.map