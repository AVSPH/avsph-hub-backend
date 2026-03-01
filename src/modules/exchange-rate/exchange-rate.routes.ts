import type { FastifyPluginAsync } from "fastify";
import {
  exchangeRateJsonSchema,
  upsertExchangeRateJsonSchema,
} from "../../types/exchange-rate.types.js";
import {
  getExchangeRates,
  getExchangeRate,
  upsertExchangeRate,
  deleteExchangeRate,
} from "./exchange-rate.controller.js";

const exchangeRateRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /exchange-rates — List all exchange rates
  fastify.get(
    "/exchange-rates",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "List all exchange rates (admin only)",
        tags: ["Exchange Rates"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "array",
            items: exchangeRateJsonSchema,
          },
        },
      },
    },
    getExchangeRates,
  );

  // GET /exchange-rates/:fromCurrency/:toCurrency — Get a specific rate
  fastify.get<{ Params: { fromCurrency: string; toCurrency: string } }>(
    "/exchange-rates/:fromCurrency/:toCurrency",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get a specific exchange rate by currency pair",
        tags: ["Exchange Rates"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            fromCurrency: { type: "string" },
            toCurrency: { type: "string" },
          },
          required: ["fromCurrency", "toCurrency"],
        },
        response: {
          200: exchangeRateJsonSchema,
        },
      },
    },
    getExchangeRate,
  );

  // PUT /exchange-rates — Create or update an exchange rate
  fastify.put(
    "/exchange-rates",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Create or update an exchange rate (upserts by currency pair). Admin only.",
        tags: ["Exchange Rates"],
        security: [{ bearerAuth: [] }],
        body: upsertExchangeRateJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              ...exchangeRateJsonSchema.properties,
              message: { type: "string" },
            },
          },
        },
      },
    },
    upsertExchangeRate,
  );

  // DELETE /exchange-rates/:fromCurrency/:toCurrency — Remove an exchange rate
  fastify.delete<{ Params: { fromCurrency: string; toCurrency: string } }>(
    "/exchange-rates/:fromCurrency/:toCurrency",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Delete an exchange rate by currency pair (admin only)",
        tags: ["Exchange Rates"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            fromCurrency: { type: "string" },
            toCurrency: { type: "string" },
          },
          required: ["fromCurrency", "toCurrency"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    deleteExchangeRate,
  );
};

export default exchangeRateRoutes;
