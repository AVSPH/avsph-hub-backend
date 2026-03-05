import { type Db, type Document } from "mongodb";
import type { InvoiceAdjustmentType, InvoiceEarningsBreakdownType, InvoiceStatutoryDeductionsType } from "../../schema/invoice.schema.js";
interface MinimalStaffDocument extends Document {
    _id: unknown;
    businessId?: string;
    salary?: number;
    compensationProfileId?: string;
}
interface EodPayrollRecord extends Document {
    _id: unknown;
    date?: string;
    hoursWorked?: number;
    regularHoursWorked?: number;
    overtimeHoursWorked?: number;
    nightDifferentialHours?: number;
    onSite?: boolean;
}
export interface ResolvedCompensationProfile {
    source: "linked_profile" | "legacy_staff_salary";
    profileId?: string;
    currency: string;
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
}
export interface InvoiceFinancialComputation {
    totalHoursWorked: number;
    totalDaysWorked: number;
    earningsBreakdown: InvoiceEarningsBreakdownType;
    statutoryDeductions: InvoiceStatutoryDeductionsType;
    deductions: InvoiceAdjustmentType[];
    calculatedPay: number;
    netPay: number;
}
export declare function resolveHourlyCompensationProfile(db: Db, staffMember: MinimalStaffDocument, periodEnd: string): Promise<ResolvedCompensationProfile>;
export declare function calculateInvoiceFinancials(eodRecords: EodPayrollRecord[], compensation: ResolvedCompensationProfile, additions?: InvoiceAdjustmentType[], existingDeductions?: InvoiceAdjustmentType[], periodEnd?: string, currency?: string): InvoiceFinancialComputation;
export interface PhpConversion {
    exchangeRate: number;
    baseSalaryPhp: number;
    calculatedPayPhp: number;
    netPayPhp: number;
    statutoryDeductions: InvoiceStatutoryDeductionsType;
    earningsBreakdownPhp: InvoiceEarningsBreakdownType;
}
export declare function getExchangeRateValue(db: Db, fromCurrency: string, toCurrency: string): Promise<number | null>;
export declare function buildPhpConversion(db: Db, currency: string, invoice: {
    baseSalary: number;
    calculatedPay: number;
    netPay: number;
    earningsBreakdown: InvoiceEarningsBreakdownType;
}, statutoryDeductions?: InvoiceStatutoryDeductionsType): Promise<PhpConversion | null>;
export declare function computePhpConversion(invoice: {
    baseSalary: number;
    calculatedPay: number;
    netPay: number;
    earningsBreakdown: InvoiceEarningsBreakdownType;
}, exchangeRate: number, statutoryDeductions?: InvoiceStatutoryDeductionsType): PhpConversion;
export {};
//# sourceMappingURL=invoice.calculator.service.d.ts.map