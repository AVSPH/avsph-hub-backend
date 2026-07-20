import { ObjectId } from "@fastify/mongodb";
import { createClientSchema, updateClientSchema, } from "../../types/client.types.js";
import { resolveHourlyCompensationProfile, calculateInvoiceFinancials, getExchangeRateValue, } from "../invoice/invoice.calculator.service.js";
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
async function canAccessBusiness(request, businessId) {
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
export async function createClient(request, reply) {
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
export async function getClients(request, reply) {
    const clients = request.server.mongo.db?.collection("clients");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!clients || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const query = {};
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
    }
    else if (request.user.role !== "super-admin") {
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
    }
    else {
        query.isActive = true;
    }
    const result = await clients
        .find(query)
        .sort({ updatedAt: -1 })
        .toArray();
    return result;
}
export async function getClientById(request, reply) {
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
export async function updateClient(request, reply) {
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
    const result = await clients.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            ...parseResult.data,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    return {
        ...result,
        message: "Client updated successfully",
    };
}
export async function deleteClient(request, reply) {
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
    await clients.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date().toISOString() } });
    return { message: "Client deleted successfully" };
}
// ==================== ASSIGNED STAFF ====================
export async function getClientStaff(request, reply) {
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
function toMonday(dateValue) {
    const parts = dateValue.split("-").map((p) => Number(p));
    if (parts.length !== 3)
        return null;
    const [year, month, day] = parts;
    if (!year || !month || !day)
        return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime()))
        return null;
    const dow = date.getUTCDay(); // 0 = Sunday ... 6 = Saturday
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    date.setUTCDate(date.getUTCDate() + diffToMonday);
    return date;
}
function formatUtcDate(date) {
    return date.toISOString().split("T")[0];
}
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export async function getClientWeeklyReport(request, reply) {
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
    let periodStart;
    let periodEnd;
    if (from || to) {
        if (from && !ISO_DATE_RE.test(from)) {
            return reply.status(400).send({ error: "Invalid 'from' date" });
        }
        if (to && !ISO_DATE_RE.test(to)) {
            return reply.status(400).send({ error: "Invalid 'to' date" });
        }
        periodStart = from || to;
        periodEnd = to || from;
        if (periodStart > periodEnd) {
            [periodStart, periodEnd] = [periodEnd, periodStart];
        }
    }
    else {
        const monday = toMonday(formatUtcDate(new Date()));
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
    const currencyToPhpCache = new Map();
    async function currencyToPhpRate(currency) {
        if (currency === "PHP")
            return 1;
        if (currencyToPhpCache.has(currency)) {
            return currencyToPhpCache.get(currency);
        }
        const rate = await getExchangeRateValue(db, currency, "PHP");
        currencyToPhpCache.set(currency, rate);
        return rate;
    }
    async function toUsd(amount, currency) {
        if (!usdConversionAvailable)
            return null;
        if (currency === "USD")
            return roundMoney(amount);
        const cToPhp = await currencyToPhpRate(currency);
        if (cToPhp == null)
            return null;
        const php = amount * cToPhp;
        return roundMoney(php / usdToPhp);
    }
    const staffBreakdown = [];
    let totalHours = 0;
    let totalPay = 0;
    let totalPayUsd = 0;
    let totalBillableUsd = 0;
    let allUsdResolved = usdConversionAvailable;
    const currencyCounts = new Map();
    const missingBillRateStaff = [];
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
        const comp = await resolveHourlyCompensationProfile(db, {
            _id: member._id,
            businessId: member.businessId,
            salary: member.salary,
            compensationProfileId: member.compensationProfileId,
        }, periodEnd);
        const financials = calculateInvoiceFinancials(eodRecords, comp, [], [], periodEnd, comp.currency);
        const payUsd = await toUsd(financials.calculatedPay, comp.currency);
        if (payUsd == null) {
            allUsdResolved = false;
        }
        else {
            totalPayUsd += payUsd;
        }
        // What the client pays the agency: bill rate (USD) x hours worked.
        // A missing/zero bill rate bills 0 and is flagged rather than guessed.
        const rawBillRate = member.billRateUsd;
        const hasBillRate = typeof rawBillRate === "number" &&
            Number.isFinite(rawBillRate) &&
            rawBillRate > 0;
        const billRateUsd = hasBillRate ? rawBillRate : 0;
        const billableUsd = roundMoney(billRateUsd * financials.totalHoursWorked);
        const marginUsd = payUsd == null ? null : roundMoney(billableUsd - payUsd);
        const staffName = `${member.firstName} ${member.lastName}`.trim();
        if (!hasBillRate) {
            missingBillRateStaff.push(staffName);
        }
        totalHours += financials.totalHoursWorked;
        totalPay += financials.calculatedPay;
        totalBillableUsd += billableUsd;
        currencyCounts.set(comp.currency, (currencyCounts.get(comp.currency) ?? 0) + 1);
        staffBreakdown.push({
            staffId,
            name: staffName,
            position: member.position ?? "",
            hourlyRate: comp.hourlyRate,
            totalHours: financials.totalHoursWorked,
            daysWorked: financials.totalDaysWorked,
            calculatedPay: financials.calculatedPay,
            currency: comp.currency,
            payUsd,
            billRateUsd,
            hasBillRate,
            billableUsd,
            marginUsd,
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
        missingBillRateStaff,
        totals: {
            totalHours: roundMoney(totalHours),
            totalPay: roundMoney(totalPay),
            totalPayUsd: allUsdResolved ? roundMoney(totalPayUsd) : null,
            totalBillableUsd: roundMoney(totalBillableUsd),
            // Margin needs staff cost in USD; unavailable if any cost couldn't be
            // converted (no USD rate configured).
            totalMarginUsd: allUsdResolved
                ? roundMoney(totalBillableUsd - totalPayUsd)
                : null,
            missingBillRateCount: missingBillRateStaff.length,
            staffCount: members.length,
        },
        staff: staffBreakdown,
    };
}
/**
 * Builds a USD conversion context. Exchange rates are stored as
 * <currency> -> PHP, so a non-PHP amount goes to PHP first, then PHP -> USD
 * via the USD -> PHP rate. Per-currency rates are cached.
 */
async function buildUsdContext(db) {
    const usdToPhp = await getExchangeRateValue(db, "USD", "PHP");
    const usdAvailable = !!usdToPhp && usdToPhp > 0;
    const cache = new Map();
    async function currencyToPhp(currency) {
        if (currency === "PHP")
            return 1;
        if (cache.has(currency))
            return cache.get(currency);
        const r = await getExchangeRateValue(db, currency, "PHP");
        cache.set(currency, r);
        return r;
    }
    async function toUsd(amount, currency) {
        if (!usdAvailable)
            return null;
        if (currency === "USD")
            return roundMoney(amount);
        const c = await currencyToPhp(currency);
        if (c == null)
            return null;
        return roundMoney((amount * c) / usdToPhp);
    }
    return { usdToPhp, usdAvailable, toUsd };
}
function eodDateFilter(from, to) {
    if (!from && !to)
        return {};
    const range = {};
    if (from)
        range.$gte = from;
    if (to)
        range.$lte = to;
    return { date: range };
}
/**
 * Bills a single staff member over an optional date window: approved EOD hours
 * priced at the current bill rate (revenue) and the compensation profile
 * (cost). Rates are current, not versioned — all-time totals approximate on
 * today's rates.
 */
async function billMember(db, businessId, member, from, to, ctx, effectiveDate) {
    const eodRecords = await db
        .collection("eod_reports")
        .find({
        staffId: String(member._id),
        businessId,
        isActive: true,
        isApproved: true,
        ...eodDateFilter(from, to),
    })
        .toArray();
    const comp = await resolveHourlyCompensationProfile(db, {
        _id: member._id,
        businessId: member.businessId,
        salary: member.salary,
        compensationProfileId: member.compensationProfileId,
    }, effectiveDate);
    const fin = calculateInvoiceFinancials(eodRecords, comp, [], [], effectiveDate, comp.currency);
    const paidUsd = await ctx.toUsd(fin.calculatedPay, comp.currency);
    const hasBillRate = typeof member.billRateUsd === "number" &&
        Number.isFinite(member.billRateUsd) &&
        member.billRateUsd > 0;
    const billRate = hasBillRate ? member.billRateUsd : 0;
    const revenueUsd = roundMoney(billRate * fin.totalHoursWorked);
    const marginUsd = paidUsd == null ? null : roundMoney(revenueUsd - paidUsd);
    return {
        hours: fin.totalHoursWorked,
        paidUsd,
        revenueUsd,
        marginUsd,
        hasBillRate,
    };
}
function pct(part, whole) {
    if (!whole)
        return null;
    return Math.round(((part / whole) * 100 + Number.EPSILON) * 100) / 100;
}
/** Resolve + validate an optional from/to window; returns effective comp date. */
function resolveWindow(from, to) {
    let f = from;
    let t = to;
    if (f && !ISO_DATE_RE.test(f))
        return { effectiveDate: "", error: "Invalid 'from' date" };
    if (t && !ISO_DATE_RE.test(t))
        return { effectiveDate: "", error: "Invalid 'to' date" };
    if (f && t && f > t)
        [f, t] = [t, f];
    const effectiveDate = t || new Date().toISOString().split("T")[0];
    return { from: f, to: t, effectiveDate };
}
// Business-wide client analytics: revenue, cost, margin across all clients.
export async function getBusinessClientAnalytics(request, reply) {
    const db = request.server.mongo.db;
    const clients = db?.collection("clients");
    const staff = db?.collection("staff");
    if (!db || !clients || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    const hasAccess = await canAccessBusiness(request, businessId);
    if (!hasAccess) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this business",
        });
    }
    const win = resolveWindow(request.query.from, request.query.to);
    if (win.error)
        return reply.status(400).send({ error: win.error });
    const clientDocs = await clients
        .find({ businessId, isActive: true })
        .toArray();
    const assignedStaff = await staff
        .find({ businessId, isActive: true, clientId: { $exists: true, $ne: "" } })
        .toArray();
    // Group assigned staff by client.
    const staffByClient = new Map();
    for (const s of assignedStaff) {
        const cid = String(s.clientId);
        if (!staffByClient.has(cid))
            staffByClient.set(cid, []);
        staffByClient.get(cid).push(s);
    }
    const ctx = await buildUsdContext(db);
    let totalHours = 0;
    let totalRevenueUsd = 0;
    let totalPaidUsd = 0;
    let totalStaff = 0;
    let missingBillRateCount = 0;
    let allUsdResolved = ctx.usdAvailable;
    const clientRows = [];
    for (const client of clientDocs) {
        const cid = String(client._id);
        const members = staffByClient.get(cid) ?? [];
        let cHours = 0;
        let cRevenue = 0;
        let cPaid = 0;
        let cPaidResolved = ctx.usdAvailable;
        for (const member of members) {
            const b = await billMember(db, businessId, member, win.from, win.to, ctx, win.effectiveDate);
            cHours += b.hours;
            cRevenue += b.revenueUsd;
            if (b.paidUsd == null) {
                cPaidResolved = false;
                allUsdResolved = false;
            }
            else {
                cPaid += b.paidUsd;
            }
            if (!b.hasBillRate)
                missingBillRateCount++;
        }
        totalStaff += members.length;
        totalHours += cHours;
        totalRevenueUsd += cRevenue;
        if (cPaidResolved)
            totalPaidUsd += cPaid;
        clientRows.push({
            clientId: cid,
            name: client.name,
            companyName: client.companyName ?? null,
            staffCount: members.length,
            totalHours: roundMoney(cHours),
            revenueUsd: roundMoney(cRevenue),
            paidUsd: cPaidResolved ? roundMoney(cPaid) : null,
            marginUsd: cPaidResolved ? roundMoney(cRevenue - cPaid) : null,
        });
    }
    clientRows.sort((a, b) => b.revenueUsd - a.revenueUsd);
    const revenue = roundMoney(totalRevenueUsd);
    const paid = allUsdResolved ? roundMoney(totalPaidUsd) : null;
    const margin = paid == null ? null : roundMoney(revenue - paid);
    return {
        businessId,
        from: win.from ?? null,
        to: win.to ?? null,
        usdConversionAvailable: allUsdResolved,
        usdRate: ctx.usdAvailable ? ctx.usdToPhp : null,
        totals: {
            clientCount: clientDocs.length,
            activeClientCount: clientRows.filter((c) => c.staffCount > 0).length,
            staffCount: totalStaff,
            totalHours: roundMoney(totalHours),
            totalRevenueUsd: revenue,
            totalPaidUsd: paid,
            totalMarginUsd: margin,
            vaSharePct: paid == null ? null : pct(paid, revenue),
            marginPct: margin == null ? null : pct(margin, revenue),
            missingBillRateCount,
        },
        clients: clientRows,
    };
}
// Single-client analytics (all-time by default, or a date window).
export async function getClientAnalytics(request, reply) {
    const db = request.server.mongo.db;
    const clients = db?.collection("clients");
    const staff = db?.collection("staff");
    if (!db || !clients || !staff) {
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
    const win = resolveWindow(request.query.from, request.query.to);
    if (win.error)
        return reply.status(400).send({ error: win.error });
    const members = await staff
        .find({ clientId: id, isActive: true })
        .toArray();
    const ctx = await buildUsdContext(db);
    let totalHours = 0;
    let totalRevenueUsd = 0;
    let totalPaidUsd = 0;
    let missingBillRateCount = 0;
    let allUsdResolved = ctx.usdAvailable;
    for (const member of members) {
        const b = await billMember(db, client.businessId, member, win.from, win.to, ctx, win.effectiveDate);
        totalHours += b.hours;
        totalRevenueUsd += b.revenueUsd;
        if (b.paidUsd == null)
            allUsdResolved = false;
        else
            totalPaidUsd += b.paidUsd;
        if (!b.hasBillRate)
            missingBillRateCount++;
    }
    const revenue = roundMoney(totalRevenueUsd);
    const paid = allUsdResolved ? roundMoney(totalPaidUsd) : null;
    const margin = paid == null ? null : roundMoney(revenue - paid);
    return {
        clientId: id,
        from: win.from ?? null,
        to: win.to ?? null,
        usdConversionAvailable: allUsdResolved,
        totals: {
            staffCount: members.length,
            totalHours: roundMoney(totalHours),
            totalRevenueUsd: revenue,
            totalPaidUsd: paid,
            totalMarginUsd: margin,
            vaSharePct: paid == null ? null : pct(paid, revenue),
            marginPct: margin == null ? null : pct(margin, revenue),
            missingBillRateCount,
        },
    };
}
//# sourceMappingURL=client.controller.js.map