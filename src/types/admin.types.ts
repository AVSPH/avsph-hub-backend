import { z } from "zod";

// Admin roles
export const adminRoleEnum = z.enum(["super-admin", "admin"]);

// Admin schema for validation
export const adminSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  role: adminRoleEnum.default("admin"),
  businessIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Schema for creating admin
export const createAdminSchema = adminSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating admin (by super-admin)
export const updateAdminSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: adminRoleEnum.optional(),
  businessIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Schema for login
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type Admin = z.infer<typeof adminSchema>;
export type CreateAdmin = z.infer<typeof createAdminSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// JSON Schemas for Fastify
export const adminJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    email: { type: "string", format: "email" },
    firstName: { type: "string", minLength: 1, maxLength: 50 },
    lastName: { type: "string", minLength: 1, maxLength: 50 },
    role: { type: "string", enum: ["super-admin", "admin"] },
    businessIds: { type: "array", items: { type: "string" } },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["email", "firstName", "lastName", "role"],
} as const;

export const createAdminJsonSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    firstName: { type: "string", minLength: 1, maxLength: 50 },
    lastName: { type: "string", minLength: 1, maxLength: 50 },
    role: { type: "string", enum: ["super-admin", "admin"], default: "admin" },
    businessIds: { type: "array", items: { type: "string" }, default: [] },
  },
  required: ["email", "password", "firstName", "lastName"],
} as const;

export const updateAdminJsonSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    firstName: { type: "string", minLength: 1, maxLength: 50 },
    lastName: { type: "string", minLength: 1, maxLength: 50 },
    role: { type: "string", enum: ["super-admin", "admin"] },
    businessIds: { type: "array", items: { type: "string" } },
    isActive: { type: "boolean" },
  },
} as const;

export const loginJsonSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 1 },
  },
  required: ["email", "password"],
} as const;

export const loginResponseJsonSchema = {
  type: "object",
  properties: {
    token: { type: "string" },
    admin: adminJsonSchema,
  },
  required: ["token", "admin"],
} as const;

// ── Admin Settings Schemas ────────────────────────────────────────────────────

// Zod schemas
export const updateAdminProfileSchema = z
  .object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
  })
  .refine(
    (data) => data.firstName !== undefined || data.lastName !== undefined,
    {
      message: "At least one of firstName or lastName must be provided",
    },
  );

export const updateAdminEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

export const updateAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// TypeScript types
export type UpdateAdminProfile = z.infer<typeof updateAdminProfileSchema>;
export type UpdateAdminEmail = z.infer<typeof updateAdminEmailSchema>;
export type UpdateAdminPassword = z.infer<typeof updateAdminPasswordSchema>;

// JSON schemas for Fastify Swagger
export const updateAdminProfileJsonSchema = {
  type: "object",
  properties: {
    firstName: { type: "string", minLength: 1, maxLength: 50 },
    lastName: { type: "string", minLength: 1, maxLength: 50 },
  },
} as const;

export const updateAdminEmailJsonSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    currentPassword: { type: "string", minLength: 1 },
  },
  required: ["email", "currentPassword"],
} as const;

export const updateAdminPasswordJsonSchema = {
  type: "object",
  properties: {
    currentPassword: { type: "string", minLength: 1 },
    newPassword: { type: "string", minLength: 8 },
    confirmPassword: { type: "string", minLength: 1 },
  },
  required: ["currentPassword", "newPassword", "confirmPassword"],
} as const;
