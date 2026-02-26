import { z } from "zod";

// Applicant schema (updated for job posting feature)
export const applicantSchema = z.object({
    _id: z.string().optional(),
    jobId: z.string().min(1, "Job ID is required"),
    businessId: z.string().min(1, "Business ID is required"),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional(),
    position: z.string().min(1, "Position is required").max(100),
    resume: z.string().max(500).optional(), // Google Drive link (plain string)
    coverLetter: z.string().max(2000).optional(),
    stage: z.string().min(1, "Stage is required"),
    adminNotes: z.string().max(2000).optional(),
    isStaffConverted: z.boolean().default(false),
    staffId: z.string().optional(),
    isActive: z.boolean().default(true),
    appliedAt: z.string().datetime().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

// Schema for public job application submission
export const createApplicantSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional(),
    resume: z.string().max(500).optional(),
    coverLetter: z.string().max(2000).optional(),
});

// Schema for updating an applicant (admin only)
export const updateApplicantSchema = z.object({
    adminNotes: z.string().max(2000).optional(),
    isActive: z.boolean().optional(),
});

// Schema for moving an applicant to a different stage
export const updateApplicantStageSchema = z.object({
    stage: z.string().min(1, "Stage is required"),
});

// Schema for hiring an applicant (converts to staff)
export const hireApplicantSchema = z.object({
    salary: z.number().positive("Salary must be positive"),
    salaryType: z.enum(["hourly", "daily", "monthly", "annual"]),
});

// JSON Schemas for Fastify route validation
export const applicantJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        jobId: { type: "string" },
        businessId: { type: "string" },
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 20 },
        position: { type: "string", minLength: 1, maxLength: 100 },
        resume: { type: "string", maxLength: 500 },
        coverLetter: { type: "string", maxLength: 2000 },
        stage: { type: "string" },
        adminNotes: { type: "string", maxLength: 2000 },
        isStaffConverted: { type: "boolean" },
        staffId: { type: "string" },
        isActive: { type: "boolean" },
        appliedAt: { type: "string", format: "date-time" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: [
        "jobId",
        "businessId",
        "firstName",
        "lastName",
        "email",
        "position",
        "stage",
    ],
} as const;

export const createApplicantJsonSchema = {
    type: "object",
    properties: {
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 20 },
        resume: { type: "string", maxLength: 500 },
        coverLetter: { type: "string", maxLength: 2000 },
    },
    required: ["firstName", "lastName", "email"],
} as const;

export const updateApplicantJsonSchema = {
    type: "object",
    properties: {
        adminNotes: { type: "string", maxLength: 2000 },
        isActive: { type: "boolean" },
    },
} as const;

export const updateApplicantStageJsonSchema = {
    type: "object",
    properties: {
        stage: { type: "string", minLength: 1 },
    },
    required: ["stage"],
} as const;

export const hireApplicantJsonSchema = {
    type: "object",
    properties: {
        salary: { type: "number" },
        salaryType: {
            type: "string",
            enum: ["hourly", "daily", "monthly", "annual"],
        },
    },
    required: ["salary", "salaryType"],
} as const;
