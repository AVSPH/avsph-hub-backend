import { z } from "zod";
// Staff status enum
export const staffStatusEnum = z.enum(["active", "on_leave", "terminated"]);
// Employment type enum
export const employmentTypeEnum = z.enum([
    "full-time",
    "part-time",
    "contract",
]);
// Salary type enum
export const salaryTypeEnum = z.enum(["hourly", "daily", "monthly", "annual"]);
// Document schema for staff documents
export const staffDocumentSchema = z.object({
    name: z.string().min(1).max(100),
    url: z.string().url(),
    type: z.string().min(1).max(50),
    uploadedAt: z.string().datetime(),
});
// Staff schema
export const staffSchema = z.object({
    _id: z.string().optional(),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().max(20).optional(),
    position: z.string().min(1, "Position is required").max(100),
    department: z.string().max(100).optional(),
    dateHired: z.string().datetime({ message: "Invalid date format" }),
    salary: z.number().positive().optional(),
    salaryType: salaryTypeEnum.default("monthly"),
    compensationProfileId: z.string().min(1).optional(),
    employmentType: employmentTypeEnum.default("full-time"),
    businessId: z.string().min(1, "Business ID is required"),
    status: staffStatusEnum.default("active"),
    notes: z.string().max(1000).optional(),
    photoUrl: z.string().url().optional(),
    documents: z.array(staffDocumentSchema).optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Schema for creating a new staff member (admin only)
export const createStaffSchema = staffSchema.omit({
    _id: true,
    status: true,
    notes: true,
    photoUrl: true,
    documents: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
});
// Schema for updating a staff member (admin only)
export const updateStaffSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    position: z.string().min(1).max(100).optional(),
    department: z.string().max(100).optional(),
    dateHired: z.string().datetime().optional(),
    salary: z.number().positive().optional(),
    salaryType: salaryTypeEnum.optional(),
    compensationProfileId: z.string().min(1).optional(),
    employmentType: employmentTypeEnum.optional(),
    status: staffStatusEnum.optional(),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
});
// Staff login schema
export const staffLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
// Staff change password schema
export const staffChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
// JSON Schemas for Fastify route validation
export const staffDocumentJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        url: { type: "string", format: "uri" },
        type: { type: "string", minLength: 1, maxLength: 50 },
        uploadedAt: { type: "string", format: "date-time" },
    },
    required: ["name", "url", "type", "uploadedAt"],
};
export const staffJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 20 },
        position: { type: "string", minLength: 1, maxLength: 100 },
        department: { type: "string", maxLength: 100 },
        dateHired: { type: "string", format: "date-time" },
        salary: { type: "number" },
        salaryType: {
            type: "string",
            enum: ["hourly", "daily", "monthly", "annual"],
        },
        compensationProfileId: { type: "string" },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        businessId: { type: "string" },
        status: { type: "string", enum: ["active", "on_leave", "terminated"] },
        notes: { type: "string", maxLength: 1000 },
        photoUrl: { type: "string", format: "uri" },
        documents: { type: "array", items: staffDocumentJsonSchema },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: [
        "firstName",
        "lastName",
        "email",
        "position",
        "dateHired",
        "businessId",
    ],
};
export const createStaffJsonSchema = {
    type: "object",
    properties: {
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
        phone: { type: "string", maxLength: 20 },
        position: { type: "string", minLength: 1, maxLength: 100 },
        department: { type: "string", maxLength: 100 },
        dateHired: { type: "string", format: "date-time" },
        salary: { type: "number" },
        salaryType: {
            type: "string",
            enum: ["hourly", "daily", "monthly", "annual"],
        },
        compensationProfileId: { type: "string" },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        businessId: { type: "string" },
    },
    required: [
        "firstName",
        "lastName",
        "email",
        "password",
        "position",
        "dateHired",
        "businessId",
    ],
};
export const updateStaffJsonSchema = {
    type: "object",
    properties: {
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 20 },
        position: { type: "string", minLength: 1, maxLength: 100 },
        department: { type: "string", maxLength: 100 },
        dateHired: { type: "string", format: "date-time" },
        salary: { type: "number" },
        salaryType: {
            type: "string",
            enum: ["hourly", "daily", "monthly", "annual"],
        },
        compensationProfileId: { type: "string" },
        employmentType: {
            type: "string",
            enum: ["full-time", "part-time", "contract"],
        },
        status: { type: "string", enum: ["active", "on_leave", "terminated"] },
        notes: { type: "string", maxLength: 1000 },
        isActive: { type: "boolean" },
    },
};
export const staffLoginJsonSchema = {
    type: "object",
    properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 1 },
    },
    required: ["email", "password"],
};
export const staffLoginResponseJsonSchema = {
    type: "object",
    properties: {
        token: { type: "string" },
        staff: staffJsonSchema,
    },
    required: ["token", "staff"],
};
export const staffChangePasswordJsonSchema = {
    type: "object",
    properties: {
        currentPassword: { type: "string", minLength: 1 },
        newPassword: { type: "string", minLength: 8 },
    },
    required: ["currentPassword", "newPassword"],
};
// Schema for staff self-updating their own profile (firstName, lastName, phone only)
export const updateStaffProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50).optional(),
    lastName: z.string().min(1, "Last name is required").max(50).optional(),
    phone: z.string().max(20).optional(),
});
export const updateStaffProfileJsonSchema = {
    type: "object",
    properties: {
        firstName: { type: "string", minLength: 1, maxLength: 50 },
        lastName: { type: "string", minLength: 1, maxLength: 50 },
        phone: { type: "string", maxLength: 20 },
    },
    additionalProperties: false,
};
// Schema for staff adding a document via URL (e.g. Google Drive link)
export const addStaffDocumentSchema = z.object({
    name: z.string().min(1, "Document name is required").max(100),
    url: z.string().url("A valid URL is required"),
    type: z.string().min(1, "Document type is required").max(50),
});
export const addStaffDocumentJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        url: { type: "string", format: "uri" },
        type: { type: "string", minLength: 1, maxLength: 50 },
    },
    required: ["name", "url", "type"],
    additionalProperties: false,
};
//# sourceMappingURL=staff.types.js.map