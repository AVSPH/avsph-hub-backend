import { z } from "zod";

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

  currency: z.string().min(1).max(10).toUpperCase().default("PHP"),
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or greater"),

  overtimeRateMultiplier: positiveMultiplierSchema.default(1),
  sundayRateMultiplier: positiveMultiplierSchema.default(1),
  nightDifferentialRateMultiplier: positiveMultiplierSchema.default(1),
  isTransportationAllowanceEnabled: z.boolean().default(false),
  transportationAllowanceMonthlyAmount: z.number().min(0).default(0),

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

const validateDateRange = (
  value: { effectiveFrom?: string; effectiveTo?: string },
  ctx: z.RefinementCtx,
) => {
  if (
    value.effectiveFrom &&
    value.effectiveTo &&
    value.effectiveTo < value.effectiveFrom
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["effectiveTo"],
      message: "effectiveTo cannot be earlier than effectiveFrom",
    });
  }
};

export const compensationProfileSchema =
  compensationProfileBaseSchema.superRefine(validateDateRange);

export const createCompensationProfileSchema = compensationProfileBaseSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  })
  .superRefine(validateDateRange);

export const updateCompensationProfileSchema = compensationProfileBaseSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .superRefine(validateDateRange);

export const updateStaffStatutorySettingsSchema = z.object({
  isSssEnabled: z.boolean().optional(),
  isPagIbigEnabled: z.boolean().optional(),
  isPhilHealthEnabled: z.boolean().optional(),
  sssDeductionFixedAmount: z.number().min(0).optional(),
  pagIbigDeductionFixedAmount: z.number().min(0).optional(),
  philHealthDeductionFixedAmount: z.number().min(0).optional(),
});

export type CompensationProfile = z.infer<typeof compensationProfileSchema>;
export type CreateCompensationProfile = z.infer<
  typeof createCompensationProfileSchema
>;
export type UpdateCompensationProfile = z.infer<
  typeof updateCompensationProfileSchema
>;
export type UpdateStaffStatutorySettings = z.infer<
  typeof updateStaffStatutorySettingsSchema
>;

export const compensationProfileJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    name: { type: "string", minLength: 1, maxLength: 120 },
    businessId: { type: "string" },

    currency: { type: "string", minLength: 1, maxLength: 10 },
    hourlyRate: { type: "number", minimum: 0 },

    overtimeRateMultiplier: { type: "number", minimum: 1 },
    sundayRateMultiplier: { type: "number", minimum: 1 },
    nightDifferentialRateMultiplier: { type: "number", minimum: 1 },
    isTransportationAllowanceEnabled: { type: "boolean" },
    transportationAllowanceMonthlyAmount: { type: "number", minimum: 0 },

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
  required: ["name", "businessId", "hourlyRate", "effectiveFrom"],
} as const;

export const createCompensationProfileJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 120 },
    businessId: { type: "string" },
    currency: { type: "string", minLength: 1, maxLength: 10 },
    hourlyRate: { type: "number", minimum: 0 },
    overtimeRateMultiplier: { type: "number", minimum: 1 },
    sundayRateMultiplier: { type: "number", minimum: 1 },
    nightDifferentialRateMultiplier: { type: "number", minimum: 1 },
    isTransportationAllowanceEnabled: { type: "boolean" },
    transportationAllowanceMonthlyAmount: { type: "number", minimum: 0 },
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
  required: ["name", "businessId", "hourlyRate", "effectiveFrom"],
} as const;

export const updateCompensationProfileJsonSchema = {
  type: "object",
  properties: createCompensationProfileJsonSchema.properties,
} as const;

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
} as const;
