import { z } from "zod";

// ==================== Zod Schemas ====================

export const exchangeRateSchema = z.object({
  _id: z.string().optional(),
  fromCurrency: z
    .string()
    .min(1, "Source currency is required")
    .max(10)
    .toUpperCase(),
  toCurrency: z
    .string()
    .min(1, "Target currency is required")
    .max(10)
    .toUpperCase(),
  rate: z.number().positive("Exchange rate must be a positive number"),
  updatedBy: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const upsertExchangeRateSchema = z.object({
  fromCurrency: z
    .string()
    .min(1, "Source currency is required")
    .max(10)
    .toUpperCase(),
  toCurrency: z
    .string()
    .min(1, "Target currency is required")
    .max(10)
    .toUpperCase(),
  rate: z.number().positive("Exchange rate must be a positive number"),
});

// ==================== Type exports ====================

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
export type UpsertExchangeRate = z.infer<typeof upsertExchangeRateSchema>;

// ==================== JSON Schemas for Fastify route validation ====================

export const exchangeRateJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    fromCurrency: { type: "string", minLength: 1, maxLength: 10 },
    toCurrency: { type: "string", minLength: 1, maxLength: 10 },
    rate: { type: "number", exclusiveMinimum: 0 },
    updatedBy: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["fromCurrency", "toCurrency", "rate"],
} as const;

export const upsertExchangeRateJsonSchema = {
  type: "object",
  properties: {
    fromCurrency: { type: "string", minLength: 1, maxLength: 10 },
    toCurrency: { type: "string", minLength: 1, maxLength: 10 },
    rate: { type: "number", exclusiveMinimum: 0 },
  },
  required: ["fromCurrency", "toCurrency", "rate"],
} as const;
