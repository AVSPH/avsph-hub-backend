import { z } from "zod";
export const profileScopeEnum = z.enum(["position", "staff"]);
const dateStringSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");
const positiveMultiplierSchema = z
    .number()
    .min(1, "Multiplier must be at least 1");
const compensationProfileBaseSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1).max(120),
    businessId: z.string().min(1, "Business ID is required"),
    profileScope: profileScopeEnum,
    jobPosition: z.string().min(1, "Job position is required"),
    staffId: z.string().optional(),
    hourlyRate: z.number().min(0, "Hourly rate must be 0 or greater"),
    overtimeRateMultiplier: positiveMultiplierSchema.default(1),
    sundayRateMultiplier: positiveMultiplierSchema.default(1),
    nightDifferentialRateMultiplier: positiveMultiplierSchema.default(1),
    isRiceAllowanceEligible: z.boolean().default(false),
    riceAllowanceFixedAmount: z.number().min(0).default(0),
    isSssEnabled: z.boolean().default(false),
    isPagIbigEnabled: z.boolean().default(false),
    isPhilHealthEnabled: z.boolean().default(false),
    sssDeductionFixedAmount: z.number().min(0).default(0),
    pagIbigDeductionFixedAmount: z.number().min(0).default(0),
    philHealthDeductionFixedAmount: z.number().min(0).default(0),
    effectiveFrom: dateStringSchema,
    effectiveTo: dateStringSchema.optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const compensationProfileSchema = compensationProfileBaseSchema.superRefine((value, ctx) => {
    if (value.profileScope === "position" && value.staffId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "staffId must be empty for position scope profiles",
        });
    }
    if (value.profileScope === "staff" && !value.staffId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "staffId is required for staff scope profiles",
        });
    }
    if (value.effectiveTo && value.effectiveTo < value.effectiveFrom) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["effectiveTo"],
            message: "effectiveTo cannot be earlier than effectiveFrom",
        });
    }
});
export const createCompensationProfileSchema = compensationProfileBaseSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
}).superRefine((value, ctx) => {
    if (value.profileScope === "position" && value.staffId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "staffId must be empty for position scope profiles",
        });
    }
    if (value.profileScope === "staff" && !value.staffId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "staffId is required for staff scope profiles",
        });
    }
    if (value.effectiveTo && value.effectiveTo < value.effectiveFrom) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["effectiveTo"],
            message: "effectiveTo cannot be earlier than effectiveFrom",
        });
    }
});
export const updateCompensationProfileSchema = compensationProfileBaseSchema
    .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
})
    .partial()
    .superRefine((value, ctx) => {
    if (value.profileScope === "position" &&
        value.staffId !== undefined &&
        value.staffId !== "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["staffId"],
            message: "staffId must be empty for position scope profiles",
        });
    }
});
export const updateStaffStatutorySettingsSchema = z.object({
    isSssEnabled: z.boolean().optional(),
    isPagIbigEnabled: z.boolean().optional(),
    isPhilHealthEnabled: z.boolean().optional(),
    sssDeductionFixedAmount: z.number().min(0).optional(),
    pagIbigDeductionFixedAmount: z.number().min(0).optional(),
    philHealthDeductionFixedAmount: z.number().min(0).optional(),
});
export const compensationProfileJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 120 },
        businessId: { type: "string" },
        profileScope: { type: "string", enum: ["position", "staff"] },
        jobPosition: { type: "string", minLength: 1 },
        staffId: { type: "string" },
        hourlyRate: { type: "number", minimum: 0 },
        overtimeRateMultiplier: { type: "number", minimum: 1 },
        sundayRateMultiplier: { type: "number", minimum: 1 },
        nightDifferentialRateMultiplier: { type: "number", minimum: 1 },
        isRiceAllowanceEligible: { type: "boolean" },
        riceAllowanceFixedAmount: { type: "number", minimum: 0 },
        isSssEnabled: { type: "boolean" },
        isPagIbigEnabled: { type: "boolean" },
        isPhilHealthEnabled: { type: "boolean" },
        sssDeductionFixedAmount: { type: "number", minimum: 0 },
        pagIbigDeductionFixedAmount: { type: "number", minimum: 0 },
        philHealthDeductionFixedAmount: { type: "number", minimum: 0 },
        effectiveFrom: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        effectiveTo: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: [
        "name",
        "businessId",
        "profileScope",
        "jobPosition",
        "hourlyRate",
        "effectiveFrom",
    ],
};
export const createCompensationProfileJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 120 },
        businessId: { type: "string" },
        profileScope: { type: "string", enum: ["position", "staff"] },
        jobPosition: { type: "string", minLength: 1 },
        staffId: { type: "string" },
        hourlyRate: { type: "number", minimum: 0 },
        overtimeRateMultiplier: { type: "number", minimum: 1 },
        sundayRateMultiplier: { type: "number", minimum: 1 },
        nightDifferentialRateMultiplier: { type: "number", minimum: 1 },
        isRiceAllowanceEligible: { type: "boolean" },
        riceAllowanceFixedAmount: { type: "number", minimum: 0 },
        isSssEnabled: { type: "boolean" },
        isPagIbigEnabled: { type: "boolean" },
        isPhilHealthEnabled: { type: "boolean" },
        sssDeductionFixedAmount: { type: "number", minimum: 0 },
        pagIbigDeductionFixedAmount: { type: "number", minimum: 0 },
        philHealthDeductionFixedAmount: { type: "number", minimum: 0 },
        effectiveFrom: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        effectiveTo: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        isActive: { type: "boolean" },
    },
    required: [
        "name",
        "businessId",
        "profileScope",
        "jobPosition",
        "hourlyRate",
        "effectiveFrom",
    ],
};
export const updateCompensationProfileJsonSchema = {
    type: "object",
    properties: createCompensationProfileJsonSchema.properties,
};
export const updateStaffStatutorySettingsJsonSchema = {
    type: "object",
    properties: {
        isSssEnabled: { type: "boolean" },
        isPagIbigEnabled: { type: "boolean" },
        isPhilHealthEnabled: { type: "boolean" },
        sssDeductionFixedAmount: { type: "number", minimum: 0 },
        pagIbigDeductionFixedAmount: { type: "number", minimum: 0 },
        philHealthDeductionFixedAmount: { type: "number", minimum: 0 },
    },
};
//# sourceMappingURL=compensation-profile.types.js.map