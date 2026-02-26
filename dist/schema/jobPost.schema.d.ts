import { z } from "zod";
import { jobPostSchema, createJobPostSchema, updateJobPostSchema, jobPostStageSchema } from "../types/jobPost.types.js";
export type JobPost = z.infer<typeof jobPostSchema>;
export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
export type JobPostStage = z.infer<typeof jobPostStageSchema>;
export interface JobPostDocumentType {
    _id?: string;
    businessId: string;
    title: string;
    description: string;
    requirements: string[];
    employmentType: "full-time" | "part-time" | "contract";
    status: "draft" | "open" | "closed";
    stages: {
        id: string;
        name: string;
        order: number;
        type: "active" | "hired" | "rejected";
    }[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=jobPost.schema.d.ts.map