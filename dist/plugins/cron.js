import fp from "fastify-plugin";
import cron from "node-cron";
// ==================== HELPERS ====================
// Calculate pay based on salary type
function calculatePay(salaryType, baseSalary, totalHoursWorked, totalDaysWorked) {
    switch (salaryType) {
        case "hourly":
            return Math.round(baseSalary * totalHoursWorked * 100) / 100;
        case "daily":
            return Math.round(baseSalary * totalDaysWorked * 100) / 100;
        case "monthly":
            return baseSalary;
        case "annual":
            return Math.round((baseSalary / 12) * 100) / 100;
        default:
            return 0;
    }
}
// Get period dates based on trigger type
function getPeriodDates(type) {
    const now = new Date();
    if (type === "first-half-current") {
        // Triggered on the 16th — covers 1st to 15th of current month
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed
        return {
            start: new Date(year, month, 1).toISOString().split("T")[0],
            end: new Date(year, month, 15).toISOString().split("T")[0],
        };
    }
    else {
        // Triggered on the 1st — covers 16th to last day of PREVIOUS month
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
        return {
            start: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16)
                .toISOString()
                .split("T")[0],
            end: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), lastDay)
                .toISOString()
                .split("T")[0],
        };
    }
}
async function generateInvoicesForPeriod(fastify, periodType) {
    const { start: periodStart, end: periodEnd } = getPeriodDates(periodType);
    return generateInvoicesForDateRange(fastify, periodStart, periodEnd);
}
async function generateInvoicesForDateRange(fastify, periodStart, periodEnd) {
    const db = fastify.mongo.db;
    if (!db) {
        throw new Error("Database not available");
    }
    const invoices = db.collection("invoices");
    const eodReports = db.collection("eod_reports");
    const staffCollection = db.collection("staff");
    const result = {
        generated: 0,
        skipped: 0,
        errors: 0,
        details: [],
    };
    // Fetch all active hourly-rate staff across all businesses
    const staffMembers = await staffCollection
        .find({
        isActive: true,
        status: "active",
        salaryType: "hourly",
        salary: { $exists: true, $gt: 0 },
    })
        .toArray();
    for (const staffMember of staffMembers) {
        try {
            const staffId = staffMember._id.toString();
            const businessId = staffMember.businessId;
            const staffName = `${staffMember.firstName} ${staffMember.lastName}`;
            // Duplicate check
            const existingInvoice = await invoices.findOne({
                staffId,
                businessId,
                periodStart,
                periodEnd,
                isActive: true,
            });
            if (existingInvoice) {
                result.skipped++;
                result.details.push(`Skipped ${staffName}: invoice already exists for ${periodStart} to ${periodEnd}`);
                continue;
            }
            // Get approved EOD reports for the period
            const eodRecords = await eodReports
                .find({
                staffId,
                businessId,
                isApproved: true,
                isActive: true,
                date: { $gte: periodStart, $lte: periodEnd },
            })
                .toArray();
            const totalHoursWorked = eodRecords.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
            const uniqueDates = new Set(eodRecords.map((record) => record.date));
            const totalDaysWorked = uniqueDates.size;
            const eodIds = eodRecords.map((record) => record._id.toString());
            const calculatedPay = calculatePay(staffMember.salaryType, staffMember.salary, Math.round(totalHoursWorked * 100) / 100, totalDaysWorked);
            const now = new Date().toISOString();
            await invoices.insertOne({
                staffId,
                businessId,
                staffName,
                staffEmail: staffMember.email,
                staffPosition: staffMember.position || "",
                periodStart,
                periodEnd,
                totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
                totalDaysWorked,
                salaryType: staffMember.salaryType,
                baseSalary: staffMember.salary,
                calculatedPay,
                deductions: [],
                additions: [],
                netPay: calculatedPay,
                eodIds,
                eodCount: eodRecords.length,
                status: "draft",
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });
            result.generated++;
            result.details.push(`Generated invoice for ${staffName}: ${periodStart} to ${periodEnd} (${totalHoursWorked}h, $${calculatedPay})`);
        }
        catch (err) {
            result.errors++;
            const staffName = `${staffMember.firstName} ${staffMember.lastName}`;
            const errMsg = err instanceof Error ? err.message : "Unknown error";
            result.details.push(`Error for ${staffName}: ${errMsg}`);
            fastify.log.error(err, `[CRON] Failed to generate invoice for staff ${staffMember._id}`);
        }
    }
    return result;
}
// ==================== STARTUP RECOVERY ====================
// Get all expected bi-monthly periods from a start date to now
function getExpectedPeriods(fromDate) {
    const periods = [];
    const now = new Date();
    let cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    while (cursor <= now) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        // First half: 1st–15th (generated on the 16th, so only if now >= 16th of that month)
        const firstHalfGenerationDate = new Date(year, month, 16);
        if (firstHalfGenerationDate <= now) {
            periods.push({
                start: new Date(year, month, 1).toISOString().split("T")[0],
                end: new Date(year, month, 15).toISOString().split("T")[0],
            });
        }
        // Second half: 16th–last day (generated on 1st of next month, so only if now >= 1st of next month)
        const lastDay = new Date(year, month + 1, 0).getDate();
        const secondHalfGenerationDate = new Date(year, month + 1, 1);
        if (secondHalfGenerationDate <= now) {
            periods.push({
                start: new Date(year, month, 16).toISOString().split("T")[0],
                end: new Date(year, month, lastDay).toISOString().split("T")[0],
            });
        }
        // Move to next month
        cursor = new Date(year, month + 1, 1);
    }
    return periods;
}
async function recoverMissingInvoices(fastify) {
    const db = fastify.mongo.db;
    if (!db) {
        fastify.log.warn("[STARTUP] Database not available for invoice recovery");
        return;
    }
    const staffCollection = db.collection("staff");
    // Find the earliest active hourly staff member
    const earliestStaff = await staffCollection
        .find({ isActive: true, status: "active", salaryType: "hourly" })
        .sort({ createdAt: 1 })
        .limit(1)
        .toArray();
    if (earliestStaff.length === 0) {
        fastify.log.info("[STARTUP] No active hourly staff found — skipping invoice recovery");
        return;
    }
    const earliestDate = new Date(earliestStaff[0].createdAt);
    const expectedPeriods = getExpectedPeriods(earliestDate);
    if (expectedPeriods.length === 0) {
        fastify.log.info("[STARTUP] No completed pay periods found — skipping invoice recovery");
        return;
    }
    let totalGenerated = 0;
    for (const period of expectedPeriods) {
        try {
            const result = await generateInvoicesForDateRange(fastify, period.start, period.end);
            totalGenerated += result.generated;
            if (result.generated > 0) {
                fastify.log.info(`[STARTUP] Period ${period.start} to ${period.end}: generated ${result.generated}, skipped ${result.skipped}`);
            }
        }
        catch (err) {
            fastify.log.error(err, `[STARTUP] Failed to recover invoices for period ${period.start} to ${period.end}`);
        }
    }
    if (totalGenerated > 0) {
        fastify.log.info(`[STARTUP] Invoice recovery complete: generated ${totalGenerated} missing draft invoices`);
    }
    else {
        fastify.log.info("[STARTUP] Invoice recovery complete: no missing invoices");
    }
}
// ==================== PLUGIN ====================
const cronPlugin = async (fastify) => {
    // --- Startup Recovery: detect and generate any missing invoices ---
    fastify.addHook("onReady", async () => {
        fastify.log.info("[STARTUP] Checking for missing invoices...");
        try {
            await recoverMissingInvoices(fastify);
        }
        catch (err) {
            fastify.log.error(err, "[STARTUP] Missing invoice recovery failed");
        }
    });
    // 1st of every month at midnight (Asia/Manila) — covers previous month's 2nd half
    cron.schedule("0 0 1 * *", async () => {
        fastify.log.info("[CRON] Generating invoices for previous month 2nd half...");
        try {
            const result = await generateInvoicesForPeriod(fastify, "second-half-previous");
            fastify.log.info(`[CRON] Invoice generation complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`);
        }
        catch (err) {
            fastify.log.error(err, "[CRON] Invoice generation failed");
        }
    }, { timezone: "Asia/Manila" });
    // 16th of every month at midnight (Asia/Manila) — covers current month's 1st half
    cron.schedule("0 0 16 * *", async () => {
        fastify.log.info("[CRON] Generating invoices for current month 1st half...");
        try {
            const result = await generateInvoicesForPeriod(fastify, "first-half-current");
            fastify.log.info(`[CRON] Invoice generation complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`);
        }
        catch (err) {
            fastify.log.error(err, "[CRON] Invoice generation failed");
        }
    }, { timezone: "Asia/Manila" });
    // Graceful shutdown — stop all cron tasks when server closes
    fastify.addHook("onClose", () => {
        cron.getTasks().forEach((task) => task.stop());
        fastify.log.info("[CRON] All scheduled tasks stopped.");
    });
};
export default fp(cronPlugin, {
    name: "cron",
    dependencies: ["mongodb"],
});
//# sourceMappingURL=cron.js.map