import { z } from "zod";
import {
    applicantSchema,
    createApplicantSchema,
    updateApplicantSchema,
} from "../types/applicant.types.js";

// Infer TypeScript types from Zod schemas
export type Applicant = z.infer<typeof applicantSchema>;
export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;

// MongoDB document type (with ObjectId)
export interface ApplicantDocument {
    _id?: string;
    jobId: string;
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position: string;
    resume?: string; // Google Drive link (plain string)
    coverLetter?: string;
    stage: string; // References a stage ID from the job post's stages array
    adminNotes?: string;
    isStaffConverted: boolean;
    staffId?: string;
    isActive: boolean;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
}
