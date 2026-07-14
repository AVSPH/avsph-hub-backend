import { ObjectId } from "@fastify/mongodb";
import { ensureBusinessAccess } from "./overview.controller.js";
function parseRange(raw, fallback, max) {
    const parsed = Number.parseInt(raw || "", 10);
    if (Number.isNaN(parsed))
        return fallback;
    return Math.min(max, Math.max(1, parsed));
}
/* Cutoff date string (YYYY-MM-DD) N days before today, at local midnight. */
function daysAgoDate(days) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1));
    return d.toISOString().split("T")[0];
}
/* First-of-month cutoff (YYYY-MM-DD) N months back, inclusive of the current month. */
function monthsAgoDate(months) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    d.setMonth(d.getMonth() - (months - 1));
    return d.toISOString().split("T")[0];
}
/* ── 1. Attendance stats ──────────────────────────────────────────────────── */
export async function getBusinessAttendanceStats(request, reply) {
    const db = request.server.mongo.db;
    const attendance = db?.collection("attendance");
    if (!db || !attendance) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!(await ensureBusinessAccess(request, reply, businessId)))
        return;
    const rangeDays = parseRange(request.query.days, 30, 90);
    const cutoff = daysAgoDate(rangeDays);
    const [facet] = await attendance
        .aggregate([
        {
            $match: {
                businessId,
                isActive: true,
                clockIn: { $gte: cutoff },
            },
        },
        {
            $facet: {
                byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                totals: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            totalHours: { $sum: { $ifNull: ["$hoursWorked", 0] } },
                        },
                    },
                ],
                approved: [
                    { $match: { status: "approved" } },
                    {
                        $group: {
                            _id: null,
                            hours: { $sum: { $ifNull: ["$hoursWorked", 0] } },
                        },
                    },
                ],
                daily: [
                    {
                        $group: {
                            _id: { $substrBytes: ["$clockIn", 0, 10] },
                            count: { $sum: 1 },
                            hours: { $sum: { $ifNull: ["$hoursWorked", 0] } },
                        },
                    },
                    { $sort: { _id: 1 } },
                ],
            },
        },
    ])
        .toArray();
    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    for (const row of facet?.byStatus ?? []) {
        if (row._id in statusCounts) {
            statusCounts[row._id] = row.count;
        }
    }
    const totalRecords = facet?.totals?.[0]?.count ?? 0;
    const totalHours = facet?.totals?.[0]?.totalHours ?? 0;
    const approvedHours = facet?.approved?.[0]?.hours ?? 0;
    return {
        businessId,
        rangeDays,
        totalRecords,
        statusCounts,
        totalHours,
        approvedHours,
        avgHoursPerDay: rangeDays > 0 ? totalHours / rangeDays : 0,
        daily: (facet?.daily ?? []).map((d) => ({
            date: d._id,
            count: d.count,
            hours: d.hours,
        })),
        updatedAt: new Date().toISOString(),
    };
}
/* ── 2. Recruitment funnel ────────────────────────────────────────────────── */
export async function getBusinessRecruitmentStats(request, reply) {
    const db = request.server.mongo.db;
    const jobPosts = db?.collection("jobPosts");
    const applicants = db?.collection("applicants");
    if (!db || !jobPosts || !applicants) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!(await ensureBusinessAccess(request, reply, businessId)))
        return;
    const jobs = await jobPosts
        .find({ businessId, isActive: true })
        .project({ title: 1, status: 1, stages: 1 })
        .toArray();
    // Map jobId -> (stageId -> stage type) so we can classify each applicant.
    const stageTypeByJob = new Map();
    const jobMeta = new Map();
    const jobCounts = { total: 0, open: 0, draft: 0, closed: 0 };
    for (const job of jobs) {
        const id = String(job._id);
        const stageMap = new Map();
        for (const s of job.stages ?? []) {
            stageMap.set(s.id, s.type);
        }
        stageTypeByJob.set(id, stageMap);
        jobMeta.set(id, { title: job.title, status: job.status });
        jobCounts.total += 1;
        if (job.status === "open")
            jobCounts.open += 1;
        else if (job.status === "draft")
            jobCounts.draft += 1;
        else if (job.status === "closed")
            jobCounts.closed += 1;
    }
    const grouped = await applicants
        .aggregate([
        { $match: { businessId, isActive: true } },
        {
            $group: {
                _id: { jobId: "$jobId", stage: "$stage" },
                count: { $sum: 1 },
                converted: { $sum: { $cond: ["$isStaffConverted", 1, 0] } },
            },
        },
    ])
        .toArray();
    const applicantStats = { total: 0, active: 0, hired: 0, rejected: 0, converted: 0 };
    const perOpenJob = new Map();
    for (const row of grouped) {
        const jobId = String(row._id.jobId);
        const stageType = stageTypeByJob.get(jobId)?.get(row._id.stage) ?? "active";
        applicantStats.total += row.count;
        applicantStats.converted += row.converted;
        if (stageType === "hired")
            applicantStats.hired += row.count;
        else if (stageType === "rejected")
            applicantStats.rejected += row.count;
        else
            applicantStats.active += row.count;
        if (jobMeta.get(jobId)?.status === "open") {
            perOpenJob.set(jobId, (perOpenJob.get(jobId) ?? 0) + row.count);
        }
    }
    const topOpenJobs = Array.from(perOpenJob, ([jobId, applicantCount]) => ({
        jobId,
        title: jobMeta.get(jobId)?.title ?? "Untitled",
        applicantCount,
    }))
        .sort((a, b) => b.applicantCount - a.applicantCount)
        .slice(0, 5);
    return {
        businessId,
        jobs: jobCounts,
        applicants: applicantStats,
        conversionRate: applicantStats.total > 0 ? applicantStats.hired / applicantStats.total : 0,
        topOpenJobs,
        updatedAt: new Date().toISOString(),
    };
}
/* ── 3. Workforce composition ─────────────────────────────────────────────── */
export async function getBusinessWorkforceStats(request, reply) {
    const db = request.server.mongo.db;
    const staff = db?.collection("staff");
    if (!db || !staff) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!(await ensureBusinessAccess(request, reply, businessId)))
        return;
    const [facet] = await staff
        .aggregate([
        { $match: { businessId, isActive: true } },
        {
            $facet: {
                total: [{ $count: "n" }],
                byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
                byType: [{ $group: { _id: "$employmentType", count: { $sum: 1 } } }],
                byClient: [
                    {
                        $group: {
                            _id: "$clientId",
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { count: -1 } },
                ],
                hires: [
                    { $match: { dateHired: { $ne: null } } },
                    {
                        $group: {
                            _id: { $substrBytes: ["$dateHired", 0, 7] },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ],
                tenure: [
                    { $match: { dateHired: { $ne: null } } },
                    {
                        $group: {
                            _id: null,
                            avgMs: { $avg: { $toLong: { $toDate: "$dateHired" } } },
                        },
                    },
                ],
            },
        },
    ])
        .toArray();
    const pick = (rows, keys) => {
        const out = {};
        for (const k of keys)
            out[k] = 0;
        for (const r of rows)
            if (r._id in out)
                out[r._id] = r.count;
        return out;
    };
    const byStatus = pick(facet?.byStatus ?? [], ["active", "on_leave", "terminated"]);
    const byEmploymentType = pick(facet?.byType ?? [], [
        "full-time",
        "part-time",
        "contract",
    ]);
    const avgMs = facet?.tenure?.[0]?.avgMs;
    const avgTenureMonths = typeof avgMs === "number"
        ? (Date.now() - avgMs) / (1000 * 60 * 60 * 24 * 30.44)
        : 0;
    // Resolve client names for the client breakdown. Staff with no clientId
    // (null/missing) are grouped as "Unassigned".
    const clientRows = (facet?.byClient ?? []);
    const clientIds = clientRows
        .map((r) => r._id)
        .filter((id) => typeof id === "string" && ObjectId.isValid(id));
    const clientNameById = new Map();
    if (clientIds.length > 0) {
        const clientDocs = await db
            .collection("clients")
            .find({ _id: { $in: clientIds.map((id) => new ObjectId(id)) } })
            .project({ name: 1 })
            .toArray();
        for (const c of clientDocs) {
            clientNameById.set(String(c._id), c.name);
        }
    }
    const byClient = clientRows.map((r) => ({
        clientId: typeof r._id === "string" ? r._id : null,
        client: (typeof r._id === "string" && clientNameById.get(r._id)) || "Unassigned",
        count: r.count,
    }));
    return {
        businessId,
        totalStaff: facet?.total?.[0]?.n ?? 0,
        byStatus,
        byEmploymentType,
        byClient,
        hires: (facet?.hires ?? []).map((h) => ({
            month: h._id,
            count: h.count,
        })),
        avgTenureMonths: Math.max(0, avgTenureMonths),
        updatedAt: new Date().toISOString(),
    };
}
/* ── 4. Payroll trend ─────────────────────────────────────────────────────── */
export async function getBusinessPayrollTrend(request, reply) {
    const db = request.server.mongo.db;
    const invoices = db?.collection("invoices");
    if (!db || !invoices) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    if (!(await ensureBusinessAccess(request, reply, businessId)))
        return;
    const rangeMonths = parseRange(request.query.months, 6, 24);
    const cutoff = monthsAgoDate(rangeMonths);
    const match = { businessId, isActive: true, periodStart: { $gte: cutoff } };
    const [periods, summary] = await Promise.all([
        invoices
            .aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        currency: { $ifNull: ["$currency", "PHP"] },
                        month: { $substrBytes: ["$periodStart", 0, 7] },
                    },
                    netPay: { $sum: { $ifNull: ["$netPay", 0] } },
                    calculatedPay: { $sum: { $ifNull: ["$calculatedPay", 0] } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.month": 1 } },
        ])
            .toArray(),
        invoices
            .aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $ifNull: ["$currency", "PHP"] },
                    totalNetPay: { $sum: { $ifNull: ["$netPay", 0] } },
                    invoiceCount: { $sum: 1 },
                    regular: { $sum: { $ifNull: ["$earningsBreakdown.regularEarnings", 0] } },
                    overtime: { $sum: { $ifNull: ["$earningsBreakdown.overtimeEarnings", 0] } },
                    sundayPremium: {
                        $sum: { $ifNull: ["$earningsBreakdown.sundayPremiumEarnings", 0] },
                    },
                    nightDifferential: {
                        $sum: { $ifNull: ["$earningsBreakdown.nightDifferentialEarnings", 0] },
                    },
                    transportation: {
                        $sum: {
                            $ifNull: ["$earningsBreakdown.transportationAllowanceEarnings", 0],
                        },
                    },
                    sss: { $sum: { $ifNull: ["$statutoryDeductions.sss", 0] } },
                    pagIbig: { $sum: { $ifNull: ["$statutoryDeductions.pagIbig", 0] } },
                    philHealth: { $sum: { $ifNull: ["$statutoryDeductions.philHealth", 0] } },
                },
            },
        ])
            .toArray(),
    ]);
    const currencyMap = new Map();
    for (const s of summary) {
        currencyMap.set(String(s._id), {
            currency: String(s._id),
            periods: [],
            breakdown: {
                regular: s.regular,
                overtime: s.overtime,
                sundayPremium: s.sundayPremium,
                nightDifferential: s.nightDifferential,
                transportation: s.transportation,
            },
            statutory: { sss: s.sss, pagIbig: s.pagIbig, philHealth: s.philHealth },
            totalNetPay: s.totalNetPay,
            totalStatutory: s.sss + s.pagIbig + s.philHealth,
            invoiceCount: s.invoiceCount,
        });
    }
    for (const p of periods) {
        const currency = String(p._id.currency);
        const entry = currencyMap.get(currency);
        if (!entry)
            continue;
        entry.periods.push({
            month: p._id.month,
            netPay: p.netPay,
            calculatedPay: p.calculatedPay,
            count: p.count,
        });
    }
    const currencies = Array.from(currencyMap.values()).sort((a, b) => b.totalNetPay - a.totalNetPay);
    return {
        businessId,
        rangeMonths,
        currencies,
        updatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=overview.analytics.controller.js.map