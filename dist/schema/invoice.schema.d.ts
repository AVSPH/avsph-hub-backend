import { z } from "zod";
import { invoiceSchema, invoiceAdjustmentSchema, generateInvoiceSchema, generateBusinessInvoiceSchema, approveInvoiceSchema, addInvoiceAdjustmentSchema } from "../types/invoice.types.js";
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceAdjustment = z.infer<typeof invoiceAdjustmentSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type GenerateBusinessInvoiceInput = z.infer<typeof generateBusinessInvoiceSchema>;
export type ApproveInvoiceInput = z.infer<typeof approveInvoiceSchema>;
export type AddInvoiceAdjustmentInput = z.infer<typeof addInvoiceAdjustmentSchema>;
export interface InvoiceAdjustmentType {
    type: string;
    description?: string;
    amount: number;
}
export interface InvoiceEarningsBreakdownType {
    regularEarnings: number;
    overtimeEarnings: number;
    sundayPremiumEarnings: number;
    nightDifferentialEarnings: number;
    transportationAllowanceEarnings: number;
}
export interface InvoiceStatutoryDeductionsType {
    sss: number;
    pagIbig: number;
    philHealth: number;
}
export interface InvoiceDocumentType {
    _id?: string;
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
    earningsBreakdown: InvoiceEarningsBreakdownType;
    statutoryDeductions: InvoiceStatutoryDeductionsType;
    deductions: InvoiceAdjustmentType[];
    additions: InvoiceAdjustmentType[];
    netPay: number;
    phpConversion?: {
        exchangeRate: number;
        baseSalaryPhp: number;
        calculatedPayPhp: number;
        netPayPhp: number;
        statutoryDeductions: InvoiceStatutoryDeductionsType;
        earningsBreakdownPhp: InvoiceEarningsBreakdownType;
    };
    eodIds: string[];
    eodCount: number;
    status: "draft" | "calculated" | "approved" | "paid";
    approvedBy?: string;
    approvedAt?: string;
    paidAt?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=invoice.schema.d.ts.map