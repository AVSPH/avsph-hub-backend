import { z } from "zod";
import { compensationProfileSchema, createCompensationProfileSchema, updateCompensationProfileSchema, updateStaffStatutorySettingsSchema } from "../types/compensation-profile.types.js";
export type CompensationProfile = z.infer<typeof compensationProfileSchema>;
export type CreateCompensationProfileInput = z.infer<typeof createCompensationProfileSchema>;
export type UpdateCompensationProfileInput = z.infer<typeof updateCompensationProfileSchema>;
export type UpdateStaffStatutorySettingsInput = z.infer<typeof updateStaffStatutorySettingsSchema>;
export interface CompensationProfileDocumentType {
    _id?: string;
    name: string;
    businessId: string;
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
    effectiveFrom: string;
    effectiveTo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=compensation-profile.schema.d.ts.map