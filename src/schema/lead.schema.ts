import { z } from "zod";
import {
  leadSchema,
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "../types/lead.types.js";

// Infer TypeScript types from Zod schemas
export type Lead = z.infer<typeof leadSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

// MongoDB document type (with ObjectId)
export interface LeadDocument {
  _id?: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: "contact_form" | "newsletter" | "other";
  status: "new" | "contacted" | "qualified" | "converted";
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
