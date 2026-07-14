import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import {
  createClientSchema,
  updateClientSchema,
} from "../../types/client.types.js";
import {
  resolveHourlyCompensationProfile,
  calculateInvoiceFinancials,
  getExchangeRateValue,
} from "../invoice/invoice.calculator.service.js";

interface IdParams {
  id: string;
}

interface ClientQuery {
  businessId?: string;
  status?: string;
  isActive?: string;
}

interface WeeklyReportQuery {
  from?: string;
  to?: string;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function canAccessBusiness(
  request: FastifyRequest,
  businessId: string,
): Promise<boolean> {
  if (request.user.role === "super-admin") {
    return true;
  }

  const businesses = request.server.mongo.db?.collection("businesses");
  if (!businesses) {
    return false;
  }

  const business = await businesses.findOne({
    _id: new ObjectId(businessId),
    adminIds: request.user.id,
    isActive: true,
  });

  return !!business;
}

// ==================== CRUD ====================

export async function createClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  if (!clients) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = createClientSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const payload = parseResult.data;

  if (!ObjectId.isValid(payload.businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  const hasAccess = await canAccessBusiness(request, payload.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const now = new Date().toISOString();
  const doc = {
    ...payload,
    status: payload.status ?? "active",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await clients.insertOne(doc);

  return reply.status(201).send({
    _id: result.insertedId,
    ...doc,
    message: "Client created successfully",
  });
}

export async function getClients(
  request: FastifyRequest<{ Querystring: ClientQuery }>,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!clients || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const query: Record<string, unknown> = {};

  if (request.query.businessId) {
    if (!ObjectId.isValid(request.query.businessId)) {
      return reply.status(400).send({ error: "Invalid business ID format" });
    }

    const hasAccess = await canAccessBusiness(request, request.query.businessId);
    if (!hasAccess) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }

    query.businessId = request.query.businessId;
  } else if (request.user.role !== "super-admin") {
    const accessibleBusinesses = await businesses
      .find({ adminIds: request.user.id, isActive: true })
      .project({ _id: 1 })
      .toArray();

    const businessIds = accessibleBusinesses.map((b) => b._id.toString());
    query.businessId = { $in: businessIds };
  }

  if (request.query.status) {
    query.status = request.query.status;
  }

  if (request.query.isActive !== undefined) {
    query.isActive = request.query.isActive === "true";
  } else {
    query.isActive = true;
  }

  const result = await clients
    .find(query)
    .sort({ updatedAt: -1 })
    .toArray();

  return result;
}

export async function getClientById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  if (!clients) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid client ID format" });
  }

  const client = await clients.findOne({ _id: new ObjectId(id) });
  if (!client) {
    return reply.status(404).send({ error: "Client not found" });
  }

  const hasAccess = await canAccessBusiness(request, client.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  return client;
}

export async function updateClient(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  if (!clients) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid client ID format" });
  }

  const parseResult = updateClientSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const existingClient = await clients.findOne({ _id: new ObjectId(id) });
  if (!existingClient) {
    return reply.status(404).send({ error: "Client not found" });
  }

  const hasAccess = await canAccessBusiness(request, existingClient.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const result = await clients.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: "Client updated successfully",
  };
}

export async function deleteClient(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  if (!clients) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid client ID format" });
  }

  const existingClient = await clients.findOne({ _id: new ObjectId(id) });
  if (!existingClient) {
    return reply.status(404).send({ error: "Client not found" });
  }

  const hasAccess = await canAccessBusiness(request, existingClient.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  await clients.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
  );

  return { message: "Client deleted successfully" };
}

// ==================== ASSIGNED STAFF ====================

export async function getClientStaff(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const clients = request.server.mongo.db?.collection("clients");
  const staff = request.server.mongo.db?.collection("staff");

  if (!clients || !staff) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid client ID format" });
  }

  const client = await clients.findOne({ _id: new ObjectId(id) });
  if (!client) {
    return reply.status(404).send({ error: "Client not found" });
  }

  const hasAccess = await canAccessBusiness(request, client.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const members = await staff
    .find({ clientId: id, isActive: true })
    .sort({ firstName: 1, lastName: 1 })
    .toArray();

  return members.map(({ password: _password, ...rest }) => rest);
}

// ==================== WEEKLY REPORT ====================

/**
 * Returns the Monday (UTC) of the ISO week containing the given YYYY-MM-DD date.
 * If the input is invalid, returns null.
 */
function toMonday(dateValue: string): Date | null {
  const parts = dateValue.split("-").map((p) => Number(p));
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  const dow = date.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  return date;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function getClientWeeklyReport(
  request: FastifyRequest<{
    Params: IdParams;
    Querystring: WeeklyReportQuery;
  }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const clients = db?.collection("clients");
  const staff = db?.collection("staff");
  const eodReports = db?.collection("eod_reports");

  if (!db || !clients || !staff || !eodReports) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid client ID format" });
  }

  const client = await clients.findOne({ _id: new ObjectId(id) });
  if (!client) {
    return reply.status(404).send({ error: "Client not found" });
  }

  const hasAccess = await canAccessBusiness(request, client.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  // Resolve the reporting window (UTC, inclusive). Accepts an arbitrary
  // `from`/`to` date range; defaults to the current Monday–Sunday week.
  const { from, to } = request.query;
  let periodStart: string;
  let periodEnd: string;

  if (from || to) {
    if (from && !ISO_DATE_RE.test(from)) {
      return reply.status(400).send({ error: "Invalid 'from' date" });
    }
    if (to && !ISO_DATE_RE.test(to)) {
      return reply.status(400).send({ error: "Invalid 'to' date" });
    }
    periodStart = from || to!;
    periodEnd = to || from!;
    if (periodStart > periodEnd) {
      [periodStart, periodEnd] = [periodEnd, periodStart];
    }
  } else {
    const monday = toMonday(formatUtcDate(new Date()))!;
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    periodStart = formatUtcDate(monday);
    periodEnd = formatUtcDate(sunday);
  }

  // Active staff assigned to this client.
  const members = await staff
    .find({ clientId: id, isActive: true })
    .sort({ firstName: 1, lastName: 1 })
    .toArray();

  // USD conversion. Exchange rates are stored as <currency> -> PHP, so a
  // non-PHP native amount is first taken to PHP, then PHP -> USD via the
  // USD -> PHP rate. Rates are cached per currency for this request.
  const usdToPhp = await getExchangeRateValue(db, "USD", "PHP");
  const usdConversionAvailable = !!usdToPhp && usdToPhp > 0;
  const currencyToPhpCache = new Map<string, number | null>();

  async function currencyToPhpRate(currency: string): Promise<number | null> {
    if (currency === "PHP") return 1;
    if (currencyToPhpCache.has(currency)) {
      return currencyToPhpCache.get(currency)!;
    }
    const rate = await getExchangeRateValue(db!, currency, "PHP");
    currencyToPhpCache.set(currency, rate);
    return rate;
  }

  async function toUsd(
    amount: number,
    currency: string,
  ): Promise<number | null> {
    if (!usdConversionAvailable) return null;
    if (currency === "USD") return roundMoney(amount);
    const cToPhp = await currencyToPhpRate(currency);
    if (cToPhp == null) return null;
    const php = amount * cToPhp;
    return roundMoney(php / usdToPhp!);
  }

  const staffBreakdown: Array<{
    staffId: string;
    name: string;
    position: string;
    hourlyRate: number;
    totalHours: number;
    daysWorked: number;
    calculatedPay: number;
    currency: string;
    payUsd: number | null;
  }> = [];

  let totalHours = 0;
  let totalPay = 0;
  let totalPayUsd = 0;
  let allUsdResolved = usdConversionAvailable;
  const currencyCounts = new Map<string, number>();

  for (const member of members) {
    const staffId = String(member._id);

    // Approved EOD reports within the window.
    const eodRecords = await eodReports
      .find({
        staffId,
        businessId: client.businessId,
        isActive: true,
        isApproved: true,
        date: { $gte: periodStart, $lte: periodEnd },
      })
      .toArray();

    const comp = await resolveHourlyCompensationProfile(
      db,
      {
        _id: member._id,
        businessId: member.businessId,
        salary: member.salary,
        compensationProfileId: member.compensationProfileId,
      },
      periodEnd,
    );

    const financials = calculateInvoiceFinancials(
      eodRecords,
      comp,
      [],
      [],
      periodEnd,
      comp.currency,
    );

    const payUsd = await toUsd(financials.calculatedPay, comp.currency);
    if (payUsd == null) {
      allUsdResolved = false;
    } else {
      totalPayUsd += payUsd;
    }

    totalHours += financials.totalHoursWorked;
    totalPay += financials.calculatedPay;
    currencyCounts.set(
      comp.currency,
      (currencyCounts.get(comp.currency) ?? 0) + 1,
    );

    staffBreakdown.push({
      staffId,
      name: `${member.firstName} ${member.lastName}`.trim(),
      position: member.position ?? "",
      hourlyRate: comp.hourlyRate,
      totalHours: financials.totalHoursWorked,
      daysWorked: financials.totalDaysWorked,
      calculatedPay: financials.calculatedPay,
      currency: comp.currency,
      payUsd,
    });
  }

  // Dominant currency + mixed-currency flag for the UI to warn on.
  let dominantCurrency = "PHP";
  let maxCount = -1;
  for (const [currency, count] of currencyCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantCurrency = currency;
    }
  }
  const mixedCurrency = currencyCounts.size > 1;

  return {
    client: {
      _id: String(client._id),
      name: client.name,
      companyName: client.companyName ?? null,
    },
    periodStart,
    periodEnd,
    currency: dominantCurrency,
    mixedCurrency,
    usdRate: usdConversionAvailable ? usdToPhp : null,
    usdConversionAvailable: allUsdResolved,
    totals: {
      totalHours: roundMoney(totalHours),
      totalPay: roundMoney(totalPay),
      totalPayUsd: allUsdResolved ? roundMoney(totalPayUsd) : null,
      staffCount: members.length,
    },
    staff: staffBreakdown,
  };
}
