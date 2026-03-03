import { z } from "zod";
export declare const compensationProfileSchema: z.ZodEffects<z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    businessId: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    hourlyRate: z.ZodNumber;
    overtimeRateMultiplier: z.ZodDefault<z.ZodNumber>;
    sundayRateMultiplier: z.ZodDefault<z.ZodNumber>;
    nightDifferentialRateMultiplier: z.ZodDefault<z.ZodNumber>;
    isTransportationAllowanceEnabled: z.ZodDefault<z.ZodBoolean>;
    transportationAllowanceMonthlyAmount: z.ZodDefault<z.ZodNumber>;
    isSssEnabled: z.ZodDefault<z.ZodBoolean>;
    isPagIbigEnabled: z.ZodDefault<z.ZodBoolean>;
    isPhilHealthEnabled: z.ZodDefault<z.ZodBoolean>;
    sssDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    pagIbigDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    philHealthDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    businessId: string;
    currency: string;
    isActive: boolean;
    hourlyRate: number;
    overtimeRateMultiplier: number;
    sundayRateMultiplier: number;
    nightDifferentialRateMultiplier: number;
    isTransportationAllowanceEnabled: boolean;
    transportationAllowanceMonthlyAmount: number;
    isSssEnabled: boolean;
    isPagIbigEnabled: boolean;
    isPhilHealthEnabled: boolean;
    sssDeductionFixedAmount: number;
    pagIbigDeductionFixedAmount: number;
    philHealthDeductionFixedAmount: number;
    effectiveFrom: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name: string;
    businessId: string;
    hourlyRate: number;
    effectiveFrom: string;
    _id?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveTo?: string | undefined;
}>, {
    name: string;
    businessId: string;
    currency: string;
    isActive: boolean;
    hourlyRate: number;
    overtimeRateMultiplier: number;
    sundayRateMultiplier: number;
    nightDifferentialRateMultiplier: number;
    isTransportationAllowanceEnabled: boolean;
    transportationAllowanceMonthlyAmount: number;
    isSssEnabled: boolean;
    isPagIbigEnabled: boolean;
    isPhilHealthEnabled: boolean;
    sssDeductionFixedAmount: number;
    pagIbigDeductionFixedAmount: number;
    philHealthDeductionFixedAmount: number;
    effectiveFrom: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name: string;
    businessId: string;
    hourlyRate: number;
    effectiveFrom: string;
    _id?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveTo?: string | undefined;
}>;
export declare const createCompensationProfileSchema: z.ZodEffects<z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    businessId: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    hourlyRate: z.ZodNumber;
    overtimeRateMultiplier: z.ZodDefault<z.ZodNumber>;
    sundayRateMultiplier: z.ZodDefault<z.ZodNumber>;
    nightDifferentialRateMultiplier: z.ZodDefault<z.ZodNumber>;
    isTransportationAllowanceEnabled: z.ZodDefault<z.ZodBoolean>;
    transportationAllowanceMonthlyAmount: z.ZodDefault<z.ZodNumber>;
    isSssEnabled: z.ZodDefault<z.ZodBoolean>;
    isPagIbigEnabled: z.ZodDefault<z.ZodBoolean>;
    isPhilHealthEnabled: z.ZodDefault<z.ZodBoolean>;
    sssDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    pagIbigDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    philHealthDeductionFixedAmount: z.ZodDefault<z.ZodNumber>;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    name: string;
    businessId: string;
    currency: string;
    isActive: boolean;
    hourlyRate: number;
    overtimeRateMultiplier: number;
    sundayRateMultiplier: number;
    nightDifferentialRateMultiplier: number;
    isTransportationAllowanceEnabled: boolean;
    transportationAllowanceMonthlyAmount: number;
    isSssEnabled: boolean;
    isPagIbigEnabled: boolean;
    isPhilHealthEnabled: boolean;
    sssDeductionFixedAmount: number;
    pagIbigDeductionFixedAmount: number;
    philHealthDeductionFixedAmount: number;
    effectiveFrom: string;
    effectiveTo?: string | undefined;
}, {
    name: string;
    businessId: string;
    hourlyRate: number;
    effectiveFrom: string;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveTo?: string | undefined;
}>, {
    name: string;
    businessId: string;
    currency: string;
    isActive: boolean;
    hourlyRate: number;
    overtimeRateMultiplier: number;
    sundayRateMultiplier: number;
    nightDifferentialRateMultiplier: number;
    isTransportationAllowanceEnabled: boolean;
    transportationAllowanceMonthlyAmount: number;
    isSssEnabled: boolean;
    isPagIbigEnabled: boolean;
    isPhilHealthEnabled: boolean;
    sssDeductionFixedAmount: number;
    pagIbigDeductionFixedAmount: number;
    philHealthDeductionFixedAmount: number;
    effectiveFrom: string;
    effectiveTo?: string | undefined;
}, {
    name: string;
    businessId: string;
    hourlyRate: number;
    effectiveFrom: string;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveTo?: string | undefined;
}>;
export declare const updateCompensationProfileSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    businessId: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    hourlyRate: z.ZodOptional<z.ZodNumber>;
    overtimeRateMultiplier: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    sundayRateMultiplier: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    nightDifferentialRateMultiplier: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isTransportationAllowanceEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    transportationAllowanceMonthlyAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isSssEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isPagIbigEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isPhilHealthEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    sssDeductionFixedAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    pagIbigDeductionFixedAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    philHealthDeductionFixedAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    businessId?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name?: string | undefined;
    businessId?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}>, {
    name?: string | undefined;
    businessId?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name?: string | undefined;
    businessId?: string | undefined;
    currency?: string | undefined;
    isActive?: boolean | undefined;
    hourlyRate?: number | undefined;
    overtimeRateMultiplier?: number | undefined;
    sundayRateMultiplier?: number | undefined;
    nightDifferentialRateMultiplier?: number | undefined;
    isTransportationAllowanceEnabled?: boolean | undefined;
    transportationAllowanceMonthlyAmount?: number | undefined;
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}>;
export declare const updateStaffStatutorySettingsSchema: z.ZodObject<{
    isSssEnabled: z.ZodOptional<z.ZodBoolean>;
    isPagIbigEnabled: z.ZodOptional<z.ZodBoolean>;
    isPhilHealthEnabled: z.ZodOptional<z.ZodBoolean>;
    sssDeductionFixedAmount: z.ZodOptional<z.ZodNumber>;
    pagIbigDeductionFixedAmount: z.ZodOptional<z.ZodNumber>;
    philHealthDeductionFixedAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
}, {
    isSssEnabled?: boolean | undefined;
    isPagIbigEnabled?: boolean | undefined;
    isPhilHealthEnabled?: boolean | undefined;
    sssDeductionFixedAmount?: number | undefined;
    pagIbigDeductionFixedAmount?: number | undefined;
    philHealthDeductionFixedAmount?: number | undefined;
}>;
export type CompensationProfile = z.infer<typeof compensationProfileSchema>;
export type CreateCompensationProfile = z.infer<typeof createCompensationProfileSchema>;
export type UpdateCompensationProfile = z.infer<typeof updateCompensationProfileSchema>;
export type UpdateStaffStatutorySettings = z.infer<typeof updateStaffStatutorySettingsSchema>;
export declare const compensationProfileJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly currency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly hourlyRate: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly overtimeRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly sundayRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly nightDifferentialRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly isTransportationAllowanceEnabled: {
            readonly type: "boolean";
        };
        readonly transportationAllowanceMonthlyAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly isSssEnabled: {
            readonly type: "boolean";
        };
        readonly isPagIbigEnabled: {
            readonly type: "boolean";
        };
        readonly isPhilHealthEnabled: {
            readonly type: "boolean";
        };
        readonly sssDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly pagIbigDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly philHealthDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly effectiveFrom: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly effectiveTo: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
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
    readonly required: readonly ["name", "businessId", "hourlyRate", "effectiveFrom"];
};
export declare const createCompensationProfileJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly currency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly hourlyRate: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly overtimeRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly sundayRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly nightDifferentialRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly isTransportationAllowanceEnabled: {
            readonly type: "boolean";
        };
        readonly transportationAllowanceMonthlyAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly isSssEnabled: {
            readonly type: "boolean";
        };
        readonly isPagIbigEnabled: {
            readonly type: "boolean";
        };
        readonly isPhilHealthEnabled: {
            readonly type: "boolean";
        };
        readonly sssDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly pagIbigDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly philHealthDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly effectiveFrom: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly effectiveTo: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
    readonly required: readonly ["name", "businessId", "hourlyRate", "effectiveFrom"];
};
export declare const updateCompensationProfileJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly currency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly hourlyRate: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly overtimeRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly sundayRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly nightDifferentialRateMultiplier: {
            readonly type: "number";
            readonly minimum: 1;
        };
        readonly isTransportationAllowanceEnabled: {
            readonly type: "boolean";
        };
        readonly transportationAllowanceMonthlyAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly isSssEnabled: {
            readonly type: "boolean";
        };
        readonly isPagIbigEnabled: {
            readonly type: "boolean";
        };
        readonly isPhilHealthEnabled: {
            readonly type: "boolean";
        };
        readonly sssDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly pagIbigDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly philHealthDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly effectiveFrom: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly effectiveTo: {
            readonly type: "string";
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
export declare const updateStaffStatutorySettingsJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly isSssEnabled: {
            readonly type: "boolean";
        };
        readonly isPagIbigEnabled: {
            readonly type: "boolean";
        };
        readonly isPhilHealthEnabled: {
            readonly type: "boolean";
        };
        readonly sssDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly pagIbigDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly philHealthDeductionFixedAmount: {
            readonly type: "number";
            readonly minimum: 0;
        };
    };
};
//# sourceMappingURL=compensation-profile.types.d.ts.map