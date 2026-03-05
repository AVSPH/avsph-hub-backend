import { calculateInvoiceFinancials, resolveHourlyCompensationProfile, buildPhpConversion, } from "./invoice.calculator.service.js";
/**
 * Determine the payroll period (periodStart, periodEnd) for a given EOD date.
 * Day 1–15  → first half of the month
 * Day 16–N  → second half of the month
 */
function getPayrollPeriodForDate(dateStr) {
    const parts = dateStr.split("-").map(Number);
    const [year, month, day] = parts;
    if (!year || !month || !day) {
        throw new Error(`Invalid EOD date format: ${dateStr}`);
    }
    if (day <= 15) {
        const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
        const endStr = `${year}-${String(month).padStart(2, "0")}-15`;
        return { periodStart: startStr, periodEnd: endStr };
    }
    const lastDay = new Date(year, month, 0).getDate(); // month is 1-indexed here; Date(y, m, 0) gives last day of prev month which is month m-1 → actually month (1-indexed) is correct: new Date(2026, 3, 0) = last day of March
    const startStr = `${year}-${String(month).padStart(2, "0")}-16`;
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { periodStart: startStr, periodEnd: endStr };
}
/**
 * Called after an EOD is approved or un-approved.
 * Creates or recalculates the draft invoice for the affected payroll period.
 *
 * - If no invoice exists → creates a new draft
 * - If invoice is draft/calculated → recalculates with all currently approved EODs
 * - If invoice is approved/paid → skips silently (locked)
 * - If staff has no salary → skips silently (not payroll-ready)
 */
export async function invoiceOnEodApproval(db, eodRecord, staffMember) {
    const invoices = db.collection("invoices");
    const eodReports = db.collection("eod_reports");
    const staffId = String(staffMember._id);
    const businessId = staffMember.businessId || eodRecord.businessId;
    if (!businessId)
        return;
    if (!staffMember.salary && !staffMember.compensationProfileId)
        return;
    const eodDate = eodRecord.date;
    if (!eodDate)
        return;
    const { periodStart, periodEnd } = getPayrollPeriodForDate(eodDate);
    // Find existing invoice for this period
    const existingInvoice = await invoices.findOne({
        staffId,
        businessId,
        periodStart,
        periodEnd,
        isActive: true,
    });
    // If invoice is locked, skip silently
    if (existingInvoice &&
        (existingInvoice.status === "approved" || existingInvoice.status === "paid")) {
        return;
    }
    // Query all currently approved EODs for this period
    const eodRecords = await eodReports
        .find({
        staffId,
        businessId,
        isApproved: true,
        isActive: true,
        date: { $gte: periodStart, $lte: periodEnd },
    })
        .toArray();
    const compensation = await resolveHourlyCompensationProfile(db, staffMember, periodEnd);
    const existingAdditions = existingInvoice?.additions || [];
    const existingDeductions = existingInvoice?.deductions || [];
    const financials = calculateInvoiceFinancials(eodRecords, compensation, existingAdditions, existingDeductions, periodEnd, compensation.currency);
    const eodIds = eodRecords.map((r) => r._id.toString());
    const now = new Date().toISOString();
    const phpConversion = await buildPhpConversion(db, compensation.currency, {
        baseSalary: compensation.hourlyRate,
        calculatedPay: financials.calculatedPay,
        netPay: financials.netPay,
        earningsBreakdown: financials.earningsBreakdown,
    }, financials.statutoryDeductions);
    if (existingInvoice) {
        // Recalculate existing draft/calculated invoice
        const $set = {
            currency: compensation.currency,
            totalHoursWorked: financials.totalHoursWorked,
            totalDaysWorked: financials.totalDaysWorked,
            eodIds,
            eodCount: eodRecords.length,
            salaryType: "hourly",
            baseSalary: compensation.hourlyRate,
            calculatedPay: financials.calculatedPay,
            earningsBreakdown: financials.earningsBreakdown,
            statutoryDeductions: financials.statutoryDeductions,
            deductions: financials.deductions,
            netPay: financials.netPay,
            phpConversion: phpConversion ?? null,
            updatedAt: now,
        };
        await invoices.findOneAndUpdate({ _id: existingInvoice._id }, { $set });
    }
    else {
        // Create new draft invoice
        const staffName = `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim();
        await invoices.insertOne({
            staffId,
            businessId,
            currency: compensation.currency,
            staffName,
            staffEmail: staffMember.email || "",
            staffPosition: staffMember.position || "",
            periodStart,
            periodEnd,
            totalHoursWorked: financials.totalHoursWorked,
            totalDaysWorked: financials.totalDaysWorked,
            salaryType: "hourly",
            baseSalary: compensation.hourlyRate,
            calculatedPay: financials.calculatedPay,
            earningsBreakdown: financials.earningsBreakdown,
            statutoryDeductions: financials.statutoryDeductions,
            deductions: financials.deductions,
            additions: [],
            netPay: financials.netPay,
            ...(phpConversion ? { phpConversion } : {}),
            eodIds,
            eodCount: eodRecords.length,
            status: "draft",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }
}
//# sourceMappingURL=invoice.eod-hook.service.js.map