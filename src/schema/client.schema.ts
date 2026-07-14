import { z } from "zod";
import {
  clientSchema,
  createClientSchema,
  updateClientSchema,
} from "../types/client.types.js";

// Infer TypeScript types from Zod schemas
export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// MongoDB document type (with ObjectId)
export interface ClientDocumentType {
  _id?: string;
  businessId: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  billingInfo?: string;
  tags?: string[];
  logoUrl?: string;
  notes?: string;
  status: "active" | "inactive";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
