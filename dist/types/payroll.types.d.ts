import { z } from 'zod';
export declare const payrollStatusEnum: z.ZodEnum<["draft", "calculated", "approved", "paid"]>;
export declare const payrollAdjustmentSchema: z.ZodObject<{
    type: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    amount: number;
    description?: string | undefined;
}, {
    type: string;
    amount: number;
    description?: string | undefined;
}>;
export declare const payrollSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    staffId: z.ZodString;
    businessId: z.ZodString;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
    totalHoursWorked: z.ZodDefault<z.ZodNumber>;
    totalDaysWorked: z.ZodDefault<z.ZodNumber>;
    salaryType: z.ZodEnum<["hourly", "daily", "monthly", "annual"]>;
    baseSalary: z.ZodNumber;
    calculatedPay: z.ZodDefault<z.ZodNumber>;
    deductions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        amount: number;
        description?: string | undefined;
    }, {
        type: string;
        amount: number;
        description?: string | undefined;
    }>, "many">>;
    additions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        amount: number;
        description?: string | undefined;
    }, {
        type: string;
        amount: number;
        description?: string | undefined;
    }>, "many">>;
    netPay: z.ZodDefault<z.ZodNumber>;
    attendanceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    attendanceCount: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["draft", "calculated", "approved", "paid"]>>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    paidAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "calculated" | "approved" | "paid";
    staffId: string;
    businessId: string;
    periodStart: string;
    periodEnd: string;
    totalHoursWorked: number;
    totalDaysWorked: number;
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    baseSalary: number;
    calculatedPay: number;
    deductions: {
        type: string;
        amount: number;
        description?: string | undefined;
    }[];
    additions: {
        type: string;
        amount: number;
        description?: string | undefined;
    }[];
    netPay: number;
    isActive: boolean;
    attendanceIds: string[];
    attendanceCount: number;
    _id?: string | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    paidAt?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    staffId: string;
    businessId: string;
    periodStart: string;
    periodEnd: string;
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    baseSalary: number;
    status?: "draft" | "calculated" | "approved" | "paid" | undefined;
    _id?: string | undefined;
    totalHoursWorked?: number | undefined;
    totalDaysWorked?: number | undefined;
    calculatedPay?: number | undefined;
    deductions?: {
        type: string;
        amount: number;
        description?: string | undefined;
    }[] | undefined;
    additions?: {
        type: string;
        amount: number;
        description?: string | undefined;
    }[] | undefined;
    netPay?: number | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    paidAt?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    attendanceIds?: string[] | undefined;
    attendanceCount?: number | undefined;
}>;
export declare const generatePayrollSchema: z.ZodObject<{
    staffId: z.ZodString;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
}, "strip", z.ZodTypeAny, {
    staffId: string;
    periodStart: string;
    periodEnd: string;
}, {
    staffId: string;
    periodStart: string;
    periodEnd: string;
}>;
export declare const generateBusinessPayrollSchema: z.ZodObject<{
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
}, "strip", z.ZodTypeAny, {
    periodStart: string;
    periodEnd: string;
}, {
    periodStart: string;
    periodEnd: string;
}>;
export declare const approvePayrollSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const addAdjustmentSchema: z.ZodObject<{
    type: z.ZodEnum<["deduction", "addition"]>;
    adjustmentType: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "deduction" | "addition";
    amount: number;
    adjustmentType: string;
    description?: string | undefined;
}, {
    type: "deduction" | "addition";
    amount: number;
    adjustmentType: string;
    description?: string | undefined;
}>;
export type Payroll = z.infer<typeof payrollSchema>;
export type PayrollAdjustment = z.infer<typeof payrollAdjustmentSchema>;
export type GeneratePayroll = z.infer<typeof generatePayrollSchema>;
export type GenerateBusinessPayroll = z.infer<typeof generateBusinessPayrollSchema>;
export type ApprovePayroll = z.infer<typeof approvePayrollSchema>;
export type AddAdjustment = z.infer<typeof addAdjustmentSchema>;
export declare const payrollAdjustmentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly type: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly description: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly amount: {
            readonly type: "number";
        };
    };
    readonly required: readonly ["type", "amount"];
};
export declare const payrollJsonSchema: {
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
        readonly periodStart: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly periodEnd: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly totalHoursWorked: {
            readonly type: "number";
        };
        readonly totalDaysWorked: {
            readonly type: "number";
        };
        readonly salaryType: {
            readonly type: "string";
            readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
        };
        readonly baseSalary: {
            readonly type: "number";
        };
        readonly calculatedPay: {
            readonly type: "number";
        };
        readonly deductions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 50;
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly maxLength: 200;
                    };
                    readonly amount: {
                        readonly type: "number";
                    };
                };
                readonly required: readonly ["type", "amount"];
            };
        };
        readonly additions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 50;
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly maxLength: 200;
                    };
                    readonly amount: {
                        readonly type: "number";
                    };
                };
                readonly required: readonly ["type", "amount"];
            };
        };
        readonly netPay: {
            readonly type: "number";
        };
        readonly attendanceIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly attendanceCount: {
            readonly type: "number";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "calculated", "approved", "paid"];
        };
        readonly approvedBy: {
            readonly type: "string";
        };
        readonly approvedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly paidAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
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
    readonly required: readonly ["staffId", "businessId", "periodStart", "periodEnd", "salaryType", "baseSalary"];
};
export declare const generatePayrollJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly staffId: {
            readonly type: "string";
        };
        readonly periodStart: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly periodEnd: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
    };
    readonly required: readonly ["staffId", "periodStart", "periodEnd"];
};
export declare const generateBusinessPayrollJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly periodStart: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly periodEnd: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
    };
    readonly required: readonly ["periodStart", "periodEnd"];
};
export declare const approvePayrollJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
    };
};
export declare const addAdjustmentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["deduction", "addition"];
        };
        readonly adjustmentType: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly description: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly amount: {
            readonly type: "number";
        };
    };
    readonly required: readonly ["type", "adjustmentType", "amount"];
};
//# sourceMappingURL=payroll.types.d.ts.map