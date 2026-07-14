import { z } from "zod";
// Client status enum
export const clientStatusEnum = z.enum(["active", "inactive"]);
// Base client schema. Only `name` and `businessId` are required; every other
// profile field is optional because client details are filled in progressively.
const clientBaseSchema = z.object({
    _id: z.string().optional(),
    businessId: z.string().min(1, "Business ID is required"),
    name: z.string().min(1, "Client name is required").max(120),
    companyName: z.string().max(200).optional(),
    contactPerson: z.string().max(120).optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().max(30).optional(),
    website: z.string().url("Invalid website URL").optional(),
    address: z.string().max(500).optional(),
    billingInfo: z.string().max(1000).optional(),
    tags: z.array(z.string().min(1).max(50)).optional(),
    logoUrl: z.string().url("Invalid logo URL").optional(),
    notes: z.string().max(2000).optional(),
    status: clientStatusEnum.default("active"),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
export const clientSchema = clientBaseSchema;
export const createClientSchema = clientBaseSchema.omit({
    _id: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
});
export const updateClientSchema = clientBaseSchema
    .omit({
    _id: true,
    businessId: true,
    createdAt: true,
    updatedAt: true,
})
    .partial();
// JSON Schemas for Fastify route validation
export const clientJsonSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        businessId: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 120 },
        companyName: { type: "string", maxLength: 200 },
        contactPerson: { type: "string", maxLength: 120 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 30 },
        website: { type: "string", format: "uri" },
        address: { type: "string", maxLength: 500 },
        billingInfo: { type: "string", maxLength: 1000 },
        tags: { type: "array", items: { type: "string", maxLength: 50 } },
        logoUrl: { type: "string", format: "uri" },
        notes: { type: "string", maxLength: 2000 },
        status: { type: "string", enum: ["active", "inactive"] },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
    required: ["name", "businessId"],
};
export const createClientJsonSchema = {
    type: "object",
    properties: {
        businessId: { type: "string" },
        name: { type: "string", minLength: 1, maxLength: 120 },
        companyName: { type: "string", maxLength: 200 },
        contactPerson: { type: "string", maxLength: 120 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 30 },
        website: { type: "string", format: "uri" },
        address: { type: "string", maxLength: 500 },
        billingInfo: { type: "string", maxLength: 1000 },
        tags: { type: "array", items: { type: "string", maxLength: 50 } },
        logoUrl: { type: "string", format: "uri" },
        notes: { type: "string", maxLength: 2000 },
        status: { type: "string", enum: ["active", "inactive"] },
    },
    required: ["name", "businessId"],
};
export const updateClientJsonSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 120 },
        companyName: { type: "string", maxLength: 200 },
        contactPerson: { type: "string", maxLength: 120 },
        email: { type: "string", format: "email" },
        phone: { type: "string", maxLength: 30 },
        website: { type: "string", format: "uri" },
        address: { type: "string", maxLength: 500 },
        billingInfo: { type: "string", maxLength: 1000 },
        tags: { type: "array", items: { type: "string", maxLength: 50 } },
        logoUrl: { type: "string", format: "uri" },
        notes: { type: "string", maxLength: 2000 },
        status: { type: "string", enum: ["active", "inactive"] },
        isActive: { type: "boolean" },
    },
};
//# sourceMappingURL=client.types.js.map