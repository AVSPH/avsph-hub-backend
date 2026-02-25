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
// Full invoice schema
export const invoiceSchema = z.object({
    _id: z.string().optional(),
    staffId: z.string().min(1, "Staff ID is required"),
    businessId: z.string().min(1, "Business ID is required"),
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
    deductions: z.array(invoiceAdjustmentSchema).default([]),
    additions: z.array(invoiceAdjustmentSchema).default([]),
    netPay: z.number().default(0),
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
// ==================== JSON Schemas for Fastify route validation ====================
export const invoiceAdjustmentJsonSchema = {
    type: "object",
    properties: {
        type: { type: "string", minLength: 1, maxLength: 50 },
        description: { type: "string", maxLength: 200 },
        amount: { type: "number" },
    },
    required: ["type", "amount"],
};
export const invoiceJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        staffId: { type: "string" },
        businessId: { type: "string" },
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
        deductions: { type: "array", items: invoiceAdjustmentJsonSchema },
        additions: { type: "array", items: invoiceAdjustmentJsonSchema },
        netPay: { type: "number" },
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
};
export const generateInvoiceJsonSchema = {
    type: "object",
    properties: {
        staffId: { type: "string" },
        periodStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        periodEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    },
    required: ["staffId", "periodStart", "periodEnd"],
};
export const generateBusinessInvoiceJsonSchema = {
    type: "object",
    properties: {
        periodStart: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        periodEnd: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    },
    required: ["periodStart", "periodEnd"],
};
export const approveInvoiceJsonSchema = {
    type: "object",
    properties: {
        notes: { type: "string", maxLength: 500 },
    },
};
export const addInvoiceAdjustmentJsonSchema = {
    type: "object",
    properties: {
        type: { type: "string", enum: ["deduction", "addition"] },
        adjustmentType: { type: "string", minLength: 1, maxLength: 50 },
        description: { type: "string", maxLength: 200 },
        amount: { type: "number" },
    },
    required: ["type", "adjustmentType", "amount"],
};
//# sourceMappingURL=invoice.types.js.map