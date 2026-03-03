import { z } from "zod";

// Invoice status enum
export const invoiceStatusEnum = z.enum([
  "draft",
  "calculated",
  "approved",
  "paid",
]);

// Adjustment schema (deduction or addition)
export const invoiceAdjustmentSchema = z.object({
  type: z.string().min(1, "Type is required").max(50),
  description: z.string().max(200).optional(),
  amount: z.number(),
});

export const earningsBreakdownSchema = z.object({
  regularEarnings: z.number().default(0),
  overtimeEarnings: z.number().default(0),
  sundayPremiumEarnings: z.number().default(0),
  nightDifferentialEarnings: z.number().default(0),
  transportationAllowanceEarnings: z.number().default(0),
});

export const statutoryDeductionsSchema = z.object({
  sss: z.number().default(0),
  pagIbig: z.number().default(0),
  philHealth: z.number().default(0),
});

// Full invoice schema
export const invoiceSchema = z.object({
  _id: z.string().optional(),
  staffId: z.string().min(1, "Staff ID is required"),
  businessId: z.string().min(1, "Business ID is required"),

  // Currency
  currency: z.string().min(1).max(10).default("PHP"),

  // Period details
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  periodEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

  // Calculation base
  totalHoursWorked: z.number().default(0),
  totalDaysWorked: z.number().default(0),
  salaryType: z.enum(["hourly", "daily", "monthly", "annual"]),
  baseSalary: z.number().positive(),

  // Financials
  calculatedPay: z.number().default(0),
  earningsBreakdown: earningsBreakdownSchema.default({
    regularEarnings: 0,
    overtimeEarnings: 0,
    sundayPremiumEarnings: 0,
    nightDifferentialEarnings: 0,
    transportationAllowanceEarnings: 0,
  }),
  statutoryDeductions: statutoryDeductionsSchema.default({
    sss: 0,
    pagIbig: 0,
    philHealth: 0,
  }),
  deductions: z.array(invoiceAdjustmentSchema).default([]),
  additions: z.array(invoiceAdjustmentSchema).default([]),
  netPay: z.number().default(0),

  // PHP conversion (stored at generate/recalculate time for non-PHP invoices)
  phpConversion: z
    .object({
      exchangeRate: z.number(),
      baseSalaryPhp: z.number(),
      calculatedPayPhp: z.number(),
      netPayPhp: z.number(),
      statutoryDeductions: statutoryDeductionsSchema.default({
        sss: 0,
        pagIbig: 0,
        philHealth: 0,
      }),
      earningsBreakdownPhp: earningsBreakdownSchema,
    })
    .optional(),

  // Linkages (EOD-based)
  eodIds: z.array(z.string()).default([]),
  eodCount: z.number().default(0),

  // State
  status: invoiceStatusEnum.default("draft"),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),

  // Native
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for generating a single invoice
export const generateInvoiceSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  periodEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

// Schema for batch generating invoices for a business
export const generateBusinessInvoiceSchema = z.object({
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  periodEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

// Schema for approving an invoice
export const approveInvoiceSchema = z.object({
  notes: z.string().max(500).optional(),
});

// Schema for adding adjustments
export const addInvoiceAdjustmentSchema = z.object({
  type: z.enum(["deduction", "addition"]),
  adjustmentType: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  amount: z.number().positive(),
});

// Type exports
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceAdjustment = z.infer<typeof invoiceAdjustmentSchema>;
export type EarningsBreakdown = z.infer<typeof earningsBreakdownSchema>;
export type StatutoryDeductions = z.infer<typeof statutoryDeductionsSchema>;
export type GenerateInvoice = z.infer<typeof generateInvoiceSchema>;
export type GenerateBusinessInvoice = z.infer<
  typeof generateBusinessInvoiceSchema
>;
export type ApproveInvoice = z.infer<typeof approveInvoiceSchema>;
export type AddInvoiceAdjustment = z.infer<typeof addInvoiceAdjustmentSchema>;

// ==================== JSON Schemas for Fastify route validation ====================

export const invoiceAdjustmentJsonSchema = {
  type: "object",
  properties: {
    type: { type: "string", minLength: 1, maxLength: 50 },
    description: { type: "string", maxLength: 200 },
    amount: { type: "number" },
  },
  required: ["type", "amount"],
} as const;

export const earningsBreakdownJsonSchema = {
  type: "object",
  properties: {
    regularEarnings: { type: "number" },
    overtimeEarnings: { type: "number" },
    sundayPremiumEarnings: { type: "number" },
    nightDifferentialEarnings: { type: "number" },
    transportationAllowanceEarnings: { type: "number" },
  },
  required: [
    "regularEarnings",
    "overtimeEarnings",
    "sundayPremiumEarnings",
    "nightDifferentialEarnings",
    "transportationAllowanceEarnings",
  ],
} as const;

export const statutoryDeductionsJsonSchema = {
  type: "object",
  properties: {
    sss: { type: "number" },
    pagIbig: { type: "number" },
    philHealth: { type: "number" },
  },
  required: ["sss", "pagIbig", "philHealth"],
} as const;

export const invoiceJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    staffId: { type: "string" },
    businessId: { type: "string" },
    currency: { type: "string" },
    staffName: { type: "string" },
    staffEmail: { type: "string" },
    staffPosition: { type: "string" },
    periodStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    periodEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    totalHoursWorked: { type: "number" },
    totalDaysWorked: { type: "number" },
    salaryType: {
      type: "string",
      enum: ["hourly", "daily", "monthly", "annual"],
    },
    baseSalary: { type: "number" },
    calculatedPay: { type: "number" },
    earningsBreakdown: earningsBreakdownJsonSchema,
    statutoryDeductions: statutoryDeductionsJsonSchema,
    deductions: { type: "array", items: invoiceAdjustmentJsonSchema },
    additions: { type: "array", items: invoiceAdjustmentJsonSchema },
    netPay: { type: "number" },
    phpConversion: {
      type: "object",
      properties: {
        exchangeRate: { type: "number" },
        baseSalaryPhp: { type: "number" },
        calculatedPayPhp: { type: "number" },
        netPayPhp: { type: "number" },
        statutoryDeductions: statutoryDeductionsJsonSchema,
        earningsBreakdownPhp: earningsBreakdownJsonSchema,
      },
    },
    eodIds: { type: "array", items: { type: "string" } },
    eodCount: { type: "number" },
    status: {
      type: "string",
      enum: ["draft", "calculated", "approved", "paid"],
    },
    approvedBy: { type: "string" },
    approvedAt: { type: "string", format: "date-time" },
    paidAt: { type: "string", format: "date-time" },
    notes: { type: "string", maxLength: 500 },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "staffId",
    "businessId",
    "periodStart",
    "periodEnd",
    "salaryType",
    "baseSalary",
  ],
} as const;

export const generateInvoiceJsonSchema = {
  type: "object",
  properties: {
    staffId: { type: "string" },
    periodStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    periodEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
  required: ["staffId", "periodStart", "periodEnd"],
} as const;

export const generateBusinessInvoiceJsonSchema = {
  type: "object",
  properties: {
    periodStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    periodEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
  required: ["periodStart", "periodEnd"],
} as const;

export const approveInvoiceJsonSchema = {
  type: "object",
  properties: {
    notes: { type: "string", maxLength: 500 },
  },
} as const;

export const addInvoiceAdjustmentJsonSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["deduction", "addition"] },
    adjustmentType: { type: "string", minLength: 1, maxLength: 50 },
    description: { type: "string", maxLength: 200 },
    amount: { type: "number" },
  },
  required: ["type", "adjustmentType", "amount"],
} as const;
