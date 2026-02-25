import { z } from "zod";
import {
  invoiceSchema,
  invoiceAdjustmentSchema,
  generateInvoiceSchema,
  generateBusinessInvoiceSchema,
  approveInvoiceSchema,
  addInvoiceAdjustmentSchema,
} from "../types/invoice.types.js";

// Infer TypeScript types from Zod schemas
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceAdjustment = z.infer<typeof invoiceAdjustmentSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type GenerateBusinessInvoiceInput = z.infer<
  typeof generateBusinessInvoiceSchema
>;
export type ApproveInvoiceInput = z.infer<typeof approveInvoiceSchema>;
export type AddInvoiceAdjustmentInput = z.infer<
  typeof addInvoiceAdjustmentSchema
>;

// Invoice adjustment interface
export interface InvoiceAdjustmentType {
  type: string;
  description?: string;
  amount: number;
}

// MongoDB document type
export interface InvoiceDocumentType {
  _id?: string;
  staffId: string;
  businessId: string;

  // Period details
  periodStart: string;
  periodEnd: string;

  // Calculation base
  totalHoursWorked: number;
  totalDaysWorked: number;
  salaryType: "hourly" | "daily" | "monthly" | "annual";
  baseSalary: number;

  // Financials
  calculatedPay: number;
  deductions: InvoiceAdjustmentType[];
  additions: InvoiceAdjustmentType[];
  netPay: number;

  // Linkages
  eodIds: string[];
  eodCount: number;

  // State
  status: "draft" | "calculated" | "approved" | "paid";
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;

  // Native
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
