import { z } from "zod";
// Employment type enum (shared with staff)
export const jobEmploymentTypeEnum = z.enum([
    "full-time",
    "part-time",
    "contract",
]);
// Job post status enum
export const jobPostStatusEnum = z.enum(["draft", "open", "closed"]);
// Stage type enum — determines Kanban behavior
export const stageTypeEnum = z.enum(["active", "hired", "rejected"]);
// Single stage in the hiring pipeline
export const jobPostStageSchema = z.object({
    id: z.string().min(1, "Stage ID is required"),
    name: z.string().min(1, "Stage name is required").max(100),
    order: z.number().int().min(0),
    type: stageTypeEnum.default("active"),
});
// Full job post schema
export const jobPostSchema = z.object({
    _id: z.string().optional(),
    businessId: z.string().min(1, "Business ID is required"),
    title: z.string().min(1, "Job title is required").max(200),
    description: z.string().min(1, "Description is required"),
    requirements: z.array(z.string()).default([]),
    employmentType: jobEmploymentTypeEnum.default("full-time"),
    status: jobPostStatusEnum.default("draft"),
    stages: z.array(jobPostStageSchema).min(1, "At least one stage is required"),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Schema for creating a new job post
export const createJobPostSchema = jobPostSchema.omit({
    _id: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
});
// Schema for updating a job post
export const updateJobPostSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    requirements: z.array(z.string()).optional(),
    employmentType: jobEmploymentTypeEnum.optional(),
    status: jobPostStatusEnum.optional(),
    stages: z.array(jobPostStageSchema).min(1).optional(),
    isActive: z.boolean().optional(),
});
// Schema for changing job post status only
export const updateJobPostStatusSchema = z.object({
    status: jobPostStatusEnum,
});
// ─── JSON Schemas for Fastify route validation ──────────────────────────
export const jobPostStageJsonSchema = {
    type: "object",
    properties: {
        id: { type: "string", minLength: 1 },
        name: { type: "string", minLength: 1, maxLength: 100 },
        order: { type: "integer", minimum: 0 },
        type: { type: "string", enum: ["active", "hired", "rejected"] },
    },
    required: ["id", "name", "order", "type"],
};
export const jobPostJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        businessId: { type: "string" },
        title: { type: "string", minLength: 1, maxLength: 200 },
        description: { type: "string" },
        requirements: { type: "array", items: { type: "string" } },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        status: { type: "string", enum: ["draft", "open", "closed"] },
        stages: { type: "array", items: jobPostStageJsonSchema },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["businessId", "title", "description", "stages"],
};
export const createJobPostJsonSchema = {
    type: "object",
    properties: {
        businessId: { type: "string" },
        title: { type: "string", minLength: 1, maxLength: 200 },
        description: { type: "string", minLength: 1 },
        requirements: { type: "array", items: { type: "string" } },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        status: { type: "string", enum: ["draft", "open", "closed"] },
        stages: {
            type: "array",
            items: jobPostStageJsonSchema,
            minItems: 1,
        },
    },
    required: ["businessId", "title", "description", "stages"],
};
export const updateJobPostJsonSchema = {
    type: "object",
    properties: {
        title: { type: "string", minLength: 1, maxLength: 200 },
        description: { type: "string", minLength: 1 },
        requirements: { type: "array", items: { type: "string" } },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        status: { type: "string", enum: ["draft", "open", "closed"] },
        stages: {
            type: "array",
            items: jobPostStageJsonSchema,
            minItems: 1,
        },
        isActive: { type: "boolean" },
    },
};
//# sourceMappingURL=jobPost.types.js.map