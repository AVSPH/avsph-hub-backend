import type { FastifyReply, FastifyRequest } from "fastify";
import { upsertExchangeRateSchema } from "../../types/exchange-rate.types.js";

interface CurrencyPairParams {
  fromCurrency: string;
  toCurrency: string;
}

// ==================== GET ALL EXCHANGE RATES ====================

export async function getExchangeRates(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const exchangeRates = request.server.mongo.db?.collection("exchange_rates");

  if (!exchangeRates) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const result = await exchangeRates
    .find({})
    .sort({ fromCurrency: 1, toCurrency: 1 })
    .toArray();

  return result;
}

// ==================== GET SINGLE EXCHANGE RATE ====================

export async function getExchangeRate(
  request: FastifyRequest<{ Params: CurrencyPairParams }>,
  reply: FastifyReply,
) {
  const exchangeRates = request.server.mongo.db?.collection("exchange_rates");

  if (!exchangeRates) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { fromCurrency, toCurrency } = request.params;

  const rate = await exchangeRates.findOne({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
  });

  if (!rate) {
    return reply.status(404).send({
      error: "Exchange rate not found",
      message: `No exchange rate found for ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()}`,
    });
  }

  return rate;
}

// ==================== UPSERT EXCHANGE RATE ====================

export async function upsertExchangeRate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const exchangeRates = request.server.mongo.db?.collection("exchange_rates");

  if (!exchangeRates) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = upsertExchangeRateSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { fromCurrency, toCurrency, rate } = parseResult.data;

  if (fromCurrency === toCurrency) {
    return reply.status(400).send({
      error: "Invalid currency pair",
      message: "Source and target currencies must be different",
    });
  }

  const now = new Date().toISOString();

  const result = await exchangeRates.findOneAndUpdate(
    {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
    },
    {
      $set: {
        rate,
        updatedBy: request.user.id,
        updatedAt: now,
      },
      $setOnInsert: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  return {
    ...result,
    message: `Exchange rate ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()} set to ${rate}`,
  };
}

// ==================== DELETE EXCHANGE RATE ====================

export async function deleteExchangeRate(
  request: FastifyRequest<{ Params: CurrencyPairParams }>,
  reply: FastifyReply,
) {
  const exchangeRates = request.server.mongo.db?.collection("exchange_rates");

  if (!exchangeRates) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { fromCurrency, toCurrency } = request.params;

  const result = await exchangeRates.findOneAndDelete({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
  });

  if (!result) {
    return reply.status(404).send({
      error: "Exchange rate not found",
      message: `No exchange rate found for ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()}`,
    });
  }

  return { message: "Exchange rate deleted successfully" };
}
