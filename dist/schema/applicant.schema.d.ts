import { z } from "zod";
import { applicantSchema, createApplicantSchema, updateApplicantSchema } from "../types/applicant.types.js";
export type Applicant = z.infer<typeof applicantSchema>;
export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;
export interface ApplicantDocument {
    _id?: string;
    jobId: string;
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position: string;
    resume?: string;
    coverLetter?: string;
    stage: string;
    adminNotes?: string;
    isStaffConverted: boolean;
    staffId?: string;
    isActive: boolean;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=applicant.schema.d.ts.map