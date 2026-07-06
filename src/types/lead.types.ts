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
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  source: leadSourceEnum.default("contact_form"),
  status: leadStatusEnum.default("new"),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Public lead submission schema (from AVSPH contact form)
export const createLeadSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  source: leadSourceEnum.default("contact_form"),
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
  })
  .partial();

export const updateLeadStatusSchema = z.object({
  status: leadStatusEnum,
});

// JSON Schemas
export const leadJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    businessId: { type: "string" },
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
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["businessId", "firstName", "lastName", "email"],
} as const;

export const createLeadJsonSchema = {
  type: "object",
  properties: {
    businessId: { type: "string" },
    firstName: { type: "string", minLength: 1, maxLength: 100 },
    lastName: { type: "string", minLength: 1, maxLength: 100 },
    email: { type: "string", format: "email", maxLength: 100 },
    phone: { type: "string", maxLength: 20 },
    company: { type: "string", maxLength: 200 },
    source: {
      type: "string",
      enum: ["contact_form", "newsletter", "other"],
      default: "contact_form",
    },
    hp: { type: "string", maxLength: 200 },
  },
  required: ["businessId", "firstName", "lastName", "email"],
} as const;

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
  },
} as const;

export const updateLeadStatusJsonSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["new", "contacted", "qualified", "converted"],
    },
  },
  required: ["status"],
} as const;
