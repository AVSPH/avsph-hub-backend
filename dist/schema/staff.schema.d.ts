import { z } from "zod";
import { staffSchema, createStaffSchema, updateStaffSchema, staffDocumentSchema } from "../types/staff.types.js";
export type Staff = z.infer<typeof staffSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffDocument = z.infer<typeof staffDocumentSchema>;
export interface StaffDocumentType {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    position: string;
    department?: string;
    dateHired: string;
    salary?: number;
    salaryType: 'hourly' | 'daily' | 'monthly' | 'annual';
    compensationProfileId?: string;
    employmentType: 'full-time' | 'part-time' | 'contract';
    businessId: string;
    status: 'active' | 'on_leave' | 'terminated';
    notes?: string;
    photoUrl?: string;
    documents?: {
        name: string;
        url: string;
        type: string;
        uploadedAt: string;
    }[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=staff.schema.d.ts.map