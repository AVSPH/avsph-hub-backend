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
}
export interface ResolvedCompensationProfile {
    source: "linked_profile" | "legacy_staff_salary";
    profileId?: string;
    hourlyRate: number;
    overtimeRateMultiplier: number;
    sundayRateMultiplier: number;
    nightDifferentialRateMultiplier: number;
    isRiceAllowanceEligible: boolean;
    riceAllowanceFixedAmount: number;
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
export declare function calculateInvoiceFinancials(eodRecords: EodPayrollRecord[], compensation: ResolvedCompensationProfile, additions?: InvoiceAdjustmentType[], existingDeductions?: InvoiceAdjustmentType[]): InvoiceFinancialComputation;
export {};
//# sourceMappingURL=invoice.calculator.service.d.ts.map