import { z } from "zod";
import {
  eodReportSchema,
  submitEodSchema,
  editOwnEodSchema,
  reviewEodSchema,
  adminEditEodSchema,
} from "../types/eod.types.js";

// Infer TypeScript types from Zod schemas
export type EodReport = z.infer<typeof eodReportSchema>;
export type SubmitEodInput = z.infer<typeof submitEodSchema>;
export type EditOwnEodInput = z.infer<typeof editOwnEodSchema>;
export type ReviewEodInput = z.infer<typeof reviewEodSchema>;
export type AdminEditEodInput = z.infer<typeof adminEditEodSchema>;

// MongoDB document type
export interface EODReportDocument {
  _id?: string;
  staffId: string;
  businessId: string;

  // Core Report Data
  date: string;
  hoursWorked: number;
  regularHoursWorked?: number;
  overtimeHoursWorked?: number;
  nightDifferentialHours?: number;
  tasksCompleted: string;

  // Optional Fields
  onSite?: boolean;
  challenges?: string;
  nextDayPlan?: string;
  notes?: string;

  // Meta & Review
  status: "submitted" | "reviewed" | "needs_revision";
  isApproved: boolean;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  // Native
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
