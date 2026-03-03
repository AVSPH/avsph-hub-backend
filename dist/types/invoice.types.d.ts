import { z } from "zod";
export declare const invoiceStatusEnum: z.ZodEnum<["draft", "calculated", "approved", "paid"]>;
export declare const invoiceAdjustmentSchema: z.ZodObject<{
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
export declare const earningsBreakdownSchema: z.ZodObject<{
    regularEarnings: z.ZodDefault<z.ZodNumber>;
    overtimeEarnings: z.ZodDefault<z.ZodNumber>;
    sundayPremiumEarnings: z.ZodDefault<z.ZodNumber>;
    nightDifferentialEarnings: z.ZodDefault<z.ZodNumber>;
    transportationAllowanceEarnings: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    regularEarnings: number;
    overtimeEarnings: number;
    sundayPremiumEarnings: number;
    nightDifferentialEarnings: number;
    transportationAllowanceEarnings: number;
}, {
    regularEarnings?: number | undefined;
    overtimeEarnings?: number | undefined;
    sundayPremiumEarnings?: number | undefined;
    nightDifferentialEarnings?: number | undefined;
    transportationAllowanceEarnings?: number | undefined;
}>;
export declare const statutoryDeductionsSchema: z.ZodObject<{
    sss: z.ZodDefault<z.ZodNumber>;
    pagIbig: z.ZodDefault<z.ZodNumber>;
    philHealth: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sss: number;
    pagIbig: number;
    philHealth: number;
}, {
    sss?: number | undefined;
    pagIbig?: number | undefined;
    philHealth?: number | undefined;
}>;
export declare const invoiceSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    staffId: z.ZodString;
    businessId: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
    totalHoursWorked: z.ZodDefault<z.ZodNumber>;
    totalDaysWorked: z.ZodDefault<z.ZodNumber>;
    salaryType: z.ZodEnum<["hourly", "daily", "monthly", "annual"]>;
    baseSalary: z.ZodNumber;
    calculatedPay: z.ZodDefault<z.ZodNumber>;
    earningsBreakdown: z.ZodDefault<z.ZodObject<{
        regularEarnings: z.ZodDefault<z.ZodNumber>;
        overtimeEarnings: z.ZodDefault<z.ZodNumber>;
        sundayPremiumEarnings: z.ZodDefault<z.ZodNumber>;
        nightDifferentialEarnings: z.ZodDefault<z.ZodNumber>;
        transportationAllowanceEarnings: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        regularEarnings: number;
        overtimeEarnings: number;
        sundayPremiumEarnings: number;
        nightDifferentialEarnings: number;
        transportationAllowanceEarnings: number;
    }, {
        regularEarnings?: number | undefined;
        overtimeEarnings?: number | undefined;
        sundayPremiumEarnings?: number | undefined;
        nightDifferentialEarnings?: number | undefined;
        transportationAllowanceEarnings?: number | undefined;
    }>>;
    statutoryDeductions: z.ZodDefault<z.ZodObject<{
        sss: z.ZodDefault<z.ZodNumber>;
        pagIbig: z.ZodDefault<z.ZodNumber>;
        philHealth: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sss: number;
        pagIbig: number;
        philHealth: number;
    }, {
        sss?: number | undefined;
        pagIbig?: number | undefined;
        philHealth?: number | undefined;
    }>>;
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
    phpConversion: z.ZodOptional<z.ZodObject<{
        exchangeRate: z.ZodNumber;
        baseSalaryPhp: z.ZodNumber;
        calculatedPayPhp: z.ZodNumber;
        netPayPhp: z.ZodNumber;
        statutoryDeductions: z.ZodDefault<z.ZodObject<{
            sss: z.ZodDefault<z.ZodNumber>;
            pagIbig: z.ZodDefault<z.ZodNumber>;
            philHealth: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            sss: number;
            pagIbig: number;
            philHealth: number;
        }, {
            sss?: number | undefined;
            pagIbig?: number | undefined;
            philHealth?: number | undefined;
        }>>;
        earningsBreakdownPhp: z.ZodObject<{
            regularEarnings: z.ZodDefault<z.ZodNumber>;
            overtimeEarnings: z.ZodDefault<z.ZodNumber>;
            sundayPremiumEarnings: z.ZodDefault<z.ZodNumber>;
            nightDifferentialEarnings: z.ZodDefault<z.ZodNumber>;
            transportationAllowanceEarnings: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            regularEarnings: number;
            overtimeEarnings: number;
            sundayPremiumEarnings: number;
            nightDifferentialEarnings: number;
            transportationAllowanceEarnings: number;
        }, {
            regularEarnings?: number | undefined;
            overtimeEarnings?: number | undefined;
            sundayPremiumEarnings?: number | undefined;
            nightDifferentialEarnings?: number | undefined;
            transportationAllowanceEarnings?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        statutoryDeductions: {
            sss: number;
            pagIbig: number;
            philHealth: number;
        };
        exchangeRate: number;
        baseSalaryPhp: number;
        calculatedPayPhp: number;
        netPayPhp: number;
        earningsBreakdownPhp: {
            regularEarnings: number;
            overtimeEarnings: number;
            sundayPremiumEarnings: number;
            nightDifferentialEarnings: number;
            transportationAllowanceEarnings: number;
        };
    }, {
        exchangeRate: number;
        baseSalaryPhp: number;
        calculatedPayPhp: number;
        netPayPhp: number;
        earningsBreakdownPhp: {
            regularEarnings?: number | undefined;
            overtimeEarnings?: number | undefined;
            sundayPremiumEarnings?: number | undefined;
            nightDifferentialEarnings?: number | undefined;
            transportationAllowanceEarnings?: number | undefined;
        };
        statutoryDeductions?: {
            sss?: number | undefined;
            pagIbig?: number | undefined;
            philHealth?: number | undefined;
        } | undefined;
    }>>;
    eodIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    eodCount: z.ZodDefault<z.ZodNumber>;
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
    currency: string;
    periodStart: string;
    periodEnd: string;
    totalHoursWorked: number;
    totalDaysWorked: number;
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    baseSalary: number;
    calculatedPay: number;
    earningsBreakdown: {
        regularEarnings: number;
        overtimeEarnings: number;
        sundayPremiumEarnings: number;
        nightDifferentialEarnings: number;
        transportationAllowanceEarnings: number;
    };
    statutoryDeductions: {
        sss: number;
        pagIbig: number;
        philHealth: number;
    };
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
    eodIds: string[];
    eodCount: number;
    isActive: boolean;
    _id?: string | undefined;
    phpConversion?: {
        statutoryDeductions: {
            sss: number;
            pagIbig: number;
            philHealth: number;
        };
        exchangeRate: number;
        baseSalaryPhp: number;
        calculatedPayPhp: number;
        netPayPhp: number;
        earningsBreakdownPhp: {
            regularEarnings: number;
            overtimeEarnings: number;
            sundayPremiumEarnings: number;
            nightDifferentialEarnings: number;
            transportationAllowanceEarnings: number;
        };
    } | undefined;
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
    currency?: string | undefined;
    totalHoursWorked?: number | undefined;
    totalDaysWorked?: number | undefined;
    calculatedPay?: number | undefined;
    earningsBreakdown?: {
        regularEarnings?: number | undefined;
        overtimeEarnings?: number | undefined;
        sundayPremiumEarnings?: number | undefined;
        nightDifferentialEarnings?: number | undefined;
        transportationAllowanceEarnings?: number | undefined;
    } | undefined;
    statutoryDeductions?: {
        sss?: number | undefined;
        pagIbig?: number | undefined;
        philHealth?: number | undefined;
    } | undefined;
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
    phpConversion?: {
        exchangeRate: number;
        baseSalaryPhp: number;
        calculatedPayPhp: number;
        netPayPhp: number;
        earningsBreakdownPhp: {
            regularEarnings?: number | undefined;
            overtimeEarnings?: number | undefined;
            sundayPremiumEarnings?: number | undefined;
            nightDifferentialEarnings?: number | undefined;
            transportationAllowanceEarnings?: number | undefined;
        };
        statutoryDeductions?: {
            sss?: number | undefined;
            pagIbig?: number | undefined;
            philHealth?: number | undefined;
        } | undefined;
    } | undefined;
    eodIds?: string[] | undefined;
    eodCount?: number | undefined;
    approvedBy?: string | undefined;
    approvedAt?: string | undefined;
    paidAt?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export declare const generateInvoiceSchema: z.ZodObject<{
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
export declare const generateBusinessInvoiceSchema: z.ZodObject<{
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
}, "strip", z.ZodTypeAny, {
    periodStart: string;
    periodEnd: string;
}, {
    periodStart: string;
    periodEnd: string;
}>;
export declare const approveInvoiceSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const addInvoiceAdjustmentSchema: z.ZodObject<{
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
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceAdjustment = z.infer<typeof invoiceAdjustmentSchema>;
export type EarningsBreakdown = z.infer<typeof earningsBreakdownSchema>;
export type StatutoryDeductions = z.infer<typeof statutoryDeductionsSchema>;
export type GenerateInvoice = z.infer<typeof generateInvoiceSchema>;
export type GenerateBusinessInvoice = z.infer<typeof generateBusinessInvoiceSchema>;
export type ApproveInvoice = z.infer<typeof approveInvoiceSchema>;
export type AddInvoiceAdjustment = z.infer<typeof addInvoiceAdjustmentSchema>;
export declare const invoiceAdjustmentJsonSchema: {
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
export declare const earningsBreakdownJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly regularEarnings: {
            readonly type: "number";
        };
        readonly overtimeEarnings: {
            readonly type: "number";
        };
        readonly sundayPremiumEarnings: {
            readonly type: "number";
        };
        readonly nightDifferentialEarnings: {
            readonly type: "number";
        };
        readonly transportationAllowanceEarnings: {
            readonly type: "number";
        };
    };
    readonly required: readonly ["regularEarnings", "overtimeEarnings", "sundayPremiumEarnings", "nightDifferentialEarnings", "transportationAllowanceEarnings"];
};
export declare const statutoryDeductionsJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly sss: {
            readonly type: "number";
        };
        readonly pagIbig: {
            readonly type: "number";
        };
        readonly philHealth: {
            readonly type: "number";
        };
    };
    readonly required: readonly ["sss", "pagIbig", "philHealth"];
};
export declare const invoiceJsonSchema: {
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
        readonly currency: {
            readonly type: "string";
        };
        readonly staffName: {
            readonly type: "string";
        };
        readonly staffEmail: {
            readonly type: "string";
        };
        readonly staffPosition: {
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
        readonly earningsBreakdown: {
            readonly type: "object";
            readonly properties: {
                readonly regularEarnings: {
                    readonly type: "number";
                };
                readonly overtimeEarnings: {
                    readonly type: "number";
                };
                readonly sundayPremiumEarnings: {
                    readonly type: "number";
                };
                readonly nightDifferentialEarnings: {
                    readonly type: "number";
                };
                readonly transportationAllowanceEarnings: {
                    readonly type: "number";
                };
            };
            readonly required: readonly ["regularEarnings", "overtimeEarnings", "sundayPremiumEarnings", "nightDifferentialEarnings", "transportationAllowanceEarnings"];
        };
        readonly statutoryDeductions: {
            readonly type: "object";
            readonly properties: {
                readonly sss: {
                    readonly type: "number";
                };
                readonly pagIbig: {
                    readonly type: "number";
                };
                readonly philHealth: {
                    readonly type: "number";
                };
            };
            readonly required: readonly ["sss", "pagIbig", "philHealth"];
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
        readonly phpConversion: {
            readonly type: "object";
            readonly properties: {
                readonly exchangeRate: {
                    readonly type: "number";
                };
                readonly baseSalaryPhp: {
                    readonly type: "number";
                };
                readonly calculatedPayPhp: {
                    readonly type: "number";
                };
                readonly netPayPhp: {
                    readonly type: "number";
                };
                readonly statutoryDeductions: {
                    readonly type: "object";
                    readonly properties: {
                        readonly sss: {
                            readonly type: "number";
                        };
                        readonly pagIbig: {
                            readonly type: "number";
                        };
                        readonly philHealth: {
                            readonly type: "number";
                        };
                    };
                    readonly required: readonly ["sss", "pagIbig", "philHealth"];
                };
                readonly earningsBreakdownPhp: {
                    readonly type: "object";
                    readonly properties: {
                        readonly regularEarnings: {
                            readonly type: "number";
                        };
                        readonly overtimeEarnings: {
                            readonly type: "number";
                        };
                        readonly sundayPremiumEarnings: {
                            readonly type: "number";
                        };
                        readonly nightDifferentialEarnings: {
                            readonly type: "number";
                        };
                        readonly transportationAllowanceEarnings: {
                            readonly type: "number";
                        };
                    };
                    readonly required: readonly ["regularEarnings", "overtimeEarnings", "sundayPremiumEarnings", "nightDifferentialEarnings", "transportationAllowanceEarnings"];
                };
            };
        };
        readonly eodIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly eodCount: {
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
export declare const generateInvoiceJsonSchema: {
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
export declare const generateBusinessInvoiceJsonSchema: {
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
export declare const approveInvoiceJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 500;
        };
    };
};
export declare const addInvoiceAdjustmentJsonSchema: {
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
//# sourceMappingURL=invoice.types.d.ts.map