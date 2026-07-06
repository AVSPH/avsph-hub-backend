import { z } from "zod";
// Lead source enum
export const leadSourceEnum = z.enum(["contact_form", "newsletter", "other"]);
// Lead status enum
export const leadStatusEnum = z.enum([
    "new",
    "contacted",
    "qualified",
    "converted",
]);
// Lead schema
export const leadSchema = z.object({
    _id: z.string().optional(),
    businessId: z.string().min(1, "Business ID is required"),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().max(100).optional(),
    email: z.string().email("Invalid email address").max(100),
    phone: z.string().max(20).optional(),
    company: z.string().max(200).optional(),
    source: leadSourceEnum.default("contact_form"),
    status: leadStatusEnum.default("new"),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string().min(1).max(50)).max(50).default([]),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Public lead submission schema (from site contact forms across businesses)
export const createLeadSchema = z.object({
    businessId: z.string().min(1, "Business ID is required"),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().max(100).optional(),
    email: z.string().email("Invalid email address").max(100),
    phone: z.string().max(20).optional(),
    company: z.string().max(200).optional(),
    source: leadSourceEnum.default("contact_form"),
    notes: z.string().max(1000).optional(),
    hp: z.string().max(200).optional(), // honeypot - should always be empty
});
export const updateLeadSchema = z
    .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(100),
    phone: z.string().max(20),
    company: z.string().max(200),
    source: leadSourceEnum,
    status: leadStatusEnum,
    notes: z.string().max(1000),
    tags: z.array(z.string().min(1).max(50)).max(50),
})
    .partial();
export const updateLeadStatusSchema = z.object({
    status: leadStatusEnum,
});
// Bulk action on multiple leads (protected)
export const bulkLeadActionSchema = z
    .object({
    ids: z.array(z.string().min(1)).min(1).max(500),
    action: z.enum(["status", "addTags", "removeTags", "delete"]),
    value: leadStatusEnum.optional(),
    tags: z.array(z.string().min(1).max(50)).max(50).optional(),
})
    .refine((d) => d.action !== "status" || !!d.value, {
    message: "value (status) is required for action 'status'",
    path: ["value"],
})
    .refine((d) => (d.action !== "addTags" && d.action !== "removeTags") ||
    (d.tags?.length ?? 0) > 0, { message: "tags are required for tag actions", path: ["tags"] });
// JSON Schemas
export const leadJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        businessId: { type: "string" },
        firstName: { type: "string", minLength: 1, maxLength: 100 },
        lastName: { type: "string", maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", maxLength: 20 },
        company: { type: "string", maxLength: 200 },
        source: { type: "string", enum: ["contact_form", "newsletter", "other"] },
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
        notes: { type: "string", maxLength: 1000 },
        tags: { type: "array", items: { type: "string" } },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["businessId", "firstName", "email"],
};
export const createLeadJsonSchema = {
    type: "object",
    properties: {
        businessId: { type: "string" },
        firstName: { type: "string", minLength: 1, maxLength: 100 },
        lastName: { type: "string", maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", maxLength: 20 },
        company: { type: "string", maxLength: 200 },
        source: {
            type: "string",
            enum: ["contact_form", "newsletter", "other"],
            default: "contact_form",
        },
        notes: { type: "string", maxLength: 1000 },
        hp: { type: "string", maxLength: 200 },
    },
    required: ["businessId", "firstName", "email"],
};
export const updateLeadJsonSchema = {
    type: "object",
    properties: {
        firstName: { type: "string", minLength: 1, maxLength: 100 },
        lastName: { type: "string", minLength: 1, maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 100 },
        phone: { type: "string", maxLength: 20 },
        company: { type: "string", maxLength: 200 },
        source: { type: "string", enum: ["contact_form", "newsletter", "other"] },
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
        notes: { type: "string", maxLength: 1000 },
        tags: { type: "array", items: { type: "string", maxLength: 50 } },
    },
};
export const bulkLeadActionJsonSchema = {
    type: "object",
    properties: {
        ids: { type: "array", items: { type: "string" }, minItems: 1 },
        action: {
            type: "string",
            enum: ["status", "addTags", "removeTags", "delete"],
        },
        value: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
        tags: { type: "array", items: { type: "string", maxLength: 50 } },
    },
    required: ["ids", "action"],
};
export const updateLeadStatusJsonSchema = {
    type: "object",
    properties: {
        status: {
            type: "string",
            enum: ["new", "contacted", "qualified", "converted"],
        },
    },
    required: ["status"],
};
//# sourceMappingURL=lead.types.js.map