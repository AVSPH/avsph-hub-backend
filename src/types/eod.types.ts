import { z } from "zod";

// EOD Report status enum
export const eodStatusEnum = z.enum([
  "submitted",
  "reviewed",
  "needs_revision",
]);

// EOD Report schema
export const eodReportSchema = z
  .object({
    _id: z.string().optional(),
    staffId: z.string().min(1, "Staff ID is required"),
    businessId: z.string().min(1, "Business ID is required"),

    // Core Report Data
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    hoursWorked: z
      .number()
      .min(0, "Hours worked must be 0 or greater")
      .max(24, "Hours worked cannot exceed 24"),
    regularHoursWorked: z
      .number()
      .min(0, "Regular hours worked must be 0 or greater")
      .max(24, "Regular hours worked cannot exceed 24")
      .optional(),
    overtimeHoursWorked: z
      .number()
      .min(0, "Overtime hours worked must be 0 or greater")
      .max(24, "Overtime hours worked cannot exceed 24")
      .optional(),
    nightDifferentialHours: z
      .number()
      .min(0, "Night differential hours must be 0 or greater")
      .max(24, "Night differential hours cannot exceed 24")
      .optional(),
    tasksCompleted: z.string().min(1, "Tasks completed is required").max(5000),

    // Optional Fields
    onSite: z.boolean().optional(),
    challenges: z.string().max(2000).optional(),
    nextDayPlan: z.string().max(2000).optional(),
    notes: z.string().max(1000).optional(),

    // Meta & Review
    status: eodStatusEnum.default("submitted"),
    isApproved: z.boolean().default(false),
    adminNotes: z.string().max(1000).optional(),
    reviewedBy: z.string().optional(),
    reviewedAt: z.string().datetime().optional(),

    // Native properties
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .superRefine((value, ctx) => {
    const regular = value.regularHoursWorked ?? value.hoursWorked;
    const overtime = value.overtimeHoursWorked ?? 0;
    const night = value.nightDifferentialHours ?? 0;

    if (regular + overtime > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overtimeHoursWorked"],
        message:
          "regularHoursWorked + overtimeHoursWorked cannot exceed hoursWorked",
      });
    }

    if (night > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nightDifferentialHours"],
        message: "nightDifferentialHours cannot exceed hoursWorked",
      });
    }
  });

// Schema for staff submitting an EOD report
export const submitEodSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    hoursWorked: z
      .number()
      .min(0, "Hours worked must be 0 or greater")
      .max(24, "Hours worked cannot exceed 24"),
    regularHoursWorked: z.number().min(0).max(24).optional(),
    overtimeHoursWorked: z.number().min(0).max(24).optional(),
    nightDifferentialHours: z.number().min(0).max(24).optional(),
    tasksCompleted: z.string().min(1, "Tasks completed is required").max(5000),
    onSite: z.boolean().optional(),
    challenges: z.string().max(2000).optional(),
    nextDayPlan: z.string().max(2000).optional(),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    const regular = value.regularHoursWorked ?? value.hoursWorked;
    const overtime = value.overtimeHoursWorked ?? 0;
    const night = value.nightDifferentialHours ?? 0;

    if (regular + overtime > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overtimeHoursWorked"],
        message:
          "regularHoursWorked + overtimeHoursWorked cannot exceed hoursWorked",
      });
    }

    if (night > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nightDifferentialHours"],
        message: "nightDifferentialHours cannot exceed hoursWorked",
      });
    }
  });

// Schema for staff editing their own EOD (when needs_revision)
export const editOwnEodSchema = z
  .object({
    hoursWorked: z.number().min(0).max(24).optional(),
    regularHoursWorked: z.number().min(0).max(24).optional(),
    overtimeHoursWorked: z.number().min(0).max(24).optional(),
    nightDifferentialHours: z.number().min(0).max(24).optional(),
    tasksCompleted: z.string().min(1).max(5000).optional(),
    onSite: z.boolean().optional(),
    challenges: z.string().max(2000).optional(),
    nextDayPlan: z.string().max(2000).optional(),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.hoursWorked === undefined) {
      return;
    }

    const regular = value.regularHoursWorked ?? value.hoursWorked;
    const overtime = value.overtimeHoursWorked ?? 0;
    const night = value.nightDifferentialHours ?? 0;

    if (regular + overtime > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overtimeHoursWorked"],
        message:
          "regularHoursWorked + overtimeHoursWorked cannot exceed hoursWorked",
      });
    }

    if (night > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nightDifferentialHours"],
        message: "nightDifferentialHours cannot exceed hoursWorked",
      });
    }
  });

// Schema for admin reviewing an EOD report
export const reviewEodSchema = z.object({
  status: z.enum(["reviewed", "needs_revision"]),
  isApproved: z.boolean().optional(),
  adminNotes: z.string().max(1000).optional(),
});

// Schema for admin editing an EOD report (minor tweaks)
export const adminEditEodSchema = z
  .object({
    hoursWorked: z.number().min(0).max(24).optional(),
    regularHoursWorked: z.number().min(0).max(24).optional(),
    overtimeHoursWorked: z.number().min(0).max(24).optional(),
    nightDifferentialHours: z.number().min(0).max(24).optional(),
    tasksCompleted: z.string().min(1).max(5000).optional(),
    onSite: z.boolean().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .optional(),
    adminNotes: z.string().max(1000).optional(),
    status: eodStatusEnum.optional(),
    isApproved: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.hoursWorked === undefined) {
      return;
    }

    const regular = value.regularHoursWorked ?? value.hoursWorked;
    const overtime = value.overtimeHoursWorked ?? 0;
    const night = value.nightDifferentialHours ?? 0;

    if (regular + overtime > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overtimeHoursWorked"],
        message:
          "regularHoursWorked + overtimeHoursWorked cannot exceed hoursWorked",
      });
    }

    if (night > value.hoursWorked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nightDifferentialHours"],
        message: "nightDifferentialHours cannot exceed hoursWorked",
      });
    }
  });

// Type exports
export type EodReport = z.infer<typeof eodReportSchema>;
export type SubmitEod = z.infer<typeof submitEodSchema>;
export type EditOwnEod = z.infer<typeof editOwnEodSchema>;
export type ReviewEod = z.infer<typeof reviewEodSchema>;
export type AdminEditEod = z.infer<typeof adminEditEodSchema>;

// JSON Schemas for Fastify route validation
export const eodReportJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    staffId: { type: "string" },
    businessId: { type: "string" },
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    hoursWorked: { type: "number", minimum: 0, maximum: 24 },
    regularHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    overtimeHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    nightDifferentialHours: { type: "number", minimum: 0, maximum: 24 },
    tasksCompleted: { type: "string", maxLength: 5000 },
    challenges: { type: "string", maxLength: 2000 },
    nextDayPlan: { type: "string", maxLength: 2000 },
    notes: { type: "string", maxLength: 1000 },
    onSite: { type: "boolean" },
    status: {
      type: "string",
      enum: ["submitted", "reviewed", "needs_revision"],
    },
    isApproved: { type: "boolean" },
    adminNotes: { type: "string", maxLength: 1000 },
    reviewedBy: { type: "string" },
    reviewedAt: { type: "string", format: "date-time" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    // Enriched fields (populated by backend lookups)
    staffName: { type: "string" },
    staffEmail: { type: "string" },
  },
  required: ["staffId", "businessId", "date", "hoursWorked", "tasksCompleted"],
} as const;

export const submitEodJsonSchema = {
  type: "object",
  properties: {
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    hoursWorked: { type: "number", minimum: 0, maximum: 24 },
    regularHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    overtimeHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    nightDifferentialHours: { type: "number", minimum: 0, maximum: 24 },
    tasksCompleted: { type: "string", maxLength: 5000 },
    onSite: { type: "boolean" },
    challenges: { type: "string", maxLength: 2000 },
    nextDayPlan: { type: "string", maxLength: 2000 },
    notes: { type: "string", maxLength: 1000 },
  },
  required: ["date", "hoursWorked", "tasksCompleted"],
} as const;

export const editOwnEodJsonSchema = {
  type: "object",
  properties: {
    hoursWorked: { type: "number", minimum: 0, maximum: 24 },
    regularHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    overtimeHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    nightDifferentialHours: { type: "number", minimum: 0, maximum: 24 },
    tasksCompleted: { type: "string", maxLength: 5000 },
    onSite: { type: "boolean" },
    challenges: { type: "string", maxLength: 2000 },
    nextDayPlan: { type: "string", maxLength: 2000 },
    notes: { type: "string", maxLength: 1000 },
  },
} as const;

export const reviewEodJsonSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["reviewed", "needs_revision"] },
    isApproved: { type: "boolean" },
    adminNotes: { type: "string", maxLength: 1000 },
  },
  required: ["status"],
} as const;

export const adminEditEodJsonSchema = {
  type: "object",
  properties: {
    hoursWorked: { type: "number", minimum: 0, maximum: 24 },
    regularHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    overtimeHoursWorked: { type: "number", minimum: 0, maximum: 24 },
    nightDifferentialHours: { type: "number", minimum: 0, maximum: 24 },
    tasksCompleted: { type: "string", maxLength: 5000 },
    onSite: { type: "boolean" },
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    adminNotes: { type: "string", maxLength: 1000 },
    status: {
      type: "string",
      enum: ["submitted", "reviewed", "needs_revision"],
    },
    isApproved: { type: "boolean" },
  },
} as const;
