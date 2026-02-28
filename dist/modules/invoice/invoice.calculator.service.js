import { ObjectId } from "mongodb";
const STATUTORY_ADJUSTMENT_TYPES = new Set(["SSS", "Pag-IBIG", "PhilHealth"]);
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function adjustmentTotal(items) {
    return roundMoney(items.reduce((sum, item) => sum + (item.amount || 0), 0));
}
function parseDateAsUtc(dateValue) {
    const parts = dateValue.split("-").map((part) => Number(part));
    if (parts.length !== 3) {
        return null;
    }
    const [year, month, day] = parts;
    if (!year || !month || !day) {
        return null;
    }
    return new Date(Date.UTC(year, month - 1, day));
}
function isSunday(dateValue) {
    const date = parseDateAsUtc(dateValue);
    return date ? date.getUTCDay() === 0 : false;
}
function statutoryToAdjustments(statutory) {
    const adjustments = [];
    if (statutory.sss > 0) {
        adjustments.push({
            type: "SSS",
            description: "Statutory deduction",
            amount: roundMoney(statutory.sss),
        });
    }
    if (statutory.pagIbig > 0) {
        adjustments.push({
            type: "Pag-IBIG",
            description: "Statutory deduction",
            amount: roundMoney(statutory.pagIbig),
        });
    }
    if (statutory.philHealth > 0) {
        adjustments.push({
            type: "PhilHealth",
            description: "Statutory deduction",
            amount: roundMoney(statutory.philHealth),
        });
    }
    return adjustments;
}
function manualDeductionsOnly(deductions) {
    return deductions.filter((item) => !STATUTORY_ADJUSTMENT_TYPES.has(item.type));
}
function toNumeric(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
async function findActiveProfileById(db, profileId, businessId, periodEnd) {
    const profiles = db.collection("compensation_profiles");
    if (!profileId || !ObjectId.isValid(profileId)) {
        return null;
    }
    const rows = await profiles
        .find({
        _id: new ObjectId(profileId),
        businessId,
        isActive: true,
        effectiveFrom: { $lte: periodEnd },
        $or: [
            { effectiveTo: { $exists: false } },
            { effectiveTo: null },
            { effectiveTo: "" },
            { effectiveTo: { $gte: periodEnd } },
        ],
    })
        .limit(1)
        .toArray();
    return rows[0] || null;
}
export async function resolveHourlyCompensationProfile(db, staffMember, periodEnd) {
    const businessId = staffMember.businessId || "";
    const linkedProfileId = staffMember.compensationProfileId || "";
    if (!businessId) {
        return {
            source: "legacy_staff_salary",
            hourlyRate: toNumeric(staffMember.salary, 0),
            overtimeRateMultiplier: 1,
            sundayRateMultiplier: 1,
            nightDifferentialRateMultiplier: 1,
            isRiceAllowanceEligible: false,
            riceAllowanceFixedAmount: 0,
            isSssEnabled: false,
            isPagIbigEnabled: false,
            isPhilHealthEnabled: false,
            sssDeductionFixedAmount: 0,
            pagIbigDeductionFixedAmount: 0,
            philHealthDeductionFixedAmount: 0,
        };
    }
    const fallbackHourlyRate = toNumeric(staffMember.salary, 0);
    const linkedProfile = await findActiveProfileById(db, linkedProfileId, businessId, periodEnd);
    const merged = {
        source: "legacy_staff_salary",
        hourlyRate: fallbackHourlyRate,
        overtimeRateMultiplier: 1,
        sundayRateMultiplier: 1,
        nightDifferentialRateMultiplier: 1,
        isRiceAllowanceEligible: false,
        riceAllowanceFixedAmount: 0,
        isSssEnabled: false,
        isPagIbigEnabled: false,
        isPhilHealthEnabled: false,
        sssDeductionFixedAmount: 0,
        pagIbigDeductionFixedAmount: 0,
        philHealthDeductionFixedAmount: 0,
    };
    if (linkedProfile) {
        merged.source = "linked_profile";
        merged.profileId = String(linkedProfile._id);
        merged.hourlyRate = toNumeric(linkedProfile.hourlyRate, merged.hourlyRate);
        merged.overtimeRateMultiplier = toNumeric(linkedProfile.overtimeRateMultiplier, merged.overtimeRateMultiplier);
        merged.sundayRateMultiplier = toNumeric(linkedProfile.sundayRateMultiplier, merged.sundayRateMultiplier);
        merged.nightDifferentialRateMultiplier = toNumeric(linkedProfile.nightDifferentialRateMultiplier, merged.nightDifferentialRateMultiplier);
        merged.isRiceAllowanceEligible = !!linkedProfile.isRiceAllowanceEligible;
        merged.riceAllowanceFixedAmount = toNumeric(linkedProfile.riceAllowanceFixedAmount, merged.riceAllowanceFixedAmount);
        merged.isSssEnabled = !!linkedProfile.isSssEnabled;
        merged.isPagIbigEnabled = !!linkedProfile.isPagIbigEnabled;
        merged.isPhilHealthEnabled = !!linkedProfile.isPhilHealthEnabled;
        merged.sssDeductionFixedAmount = toNumeric(linkedProfile.sssDeductionFixedAmount, merged.sssDeductionFixedAmount);
        merged.pagIbigDeductionFixedAmount = toNumeric(linkedProfile.pagIbigDeductionFixedAmount, merged.pagIbigDeductionFixedAmount);
        merged.philHealthDeductionFixedAmount = toNumeric(linkedProfile.philHealthDeductionFixedAmount, merged.philHealthDeductionFixedAmount);
    }
    return merged;
}
export function calculateInvoiceFinancials(eodRecords, compensation, additions = [], existingDeductions = []) {
    let totalHoursWorked = 0;
    let regularHoursWorked = 0;
    let overtimeHoursWorked = 0;
    let nightDifferentialHours = 0;
    let sundayRegularHoursWorked = 0;
    const uniqueDates = new Set();
    for (const record of eodRecords) {
        const hoursWorked = toNumeric(record.hoursWorked, 0);
        const overtime = toNumeric(record.overtimeHoursWorked, 0);
        const regularFallback = Math.max(0, hoursWorked - overtime);
        const regular = toNumeric(record.regularHoursWorked, regularFallback);
        const night = toNumeric(record.nightDifferentialHours, 0);
        const safeOvertime = Math.max(0, Math.min(overtime, hoursWorked));
        const safeRegular = Math.max(0, Math.min(regular, hoursWorked - safeOvertime));
        const safeNight = Math.max(0, Math.min(night, hoursWorked));
        totalHoursWorked += hoursWorked;
        regularHoursWorked += safeRegular;
        overtimeHoursWorked += safeOvertime;
        nightDifferentialHours += safeNight;
        if (record.date) {
            uniqueDates.add(record.date);
            if (isSunday(record.date)) {
                sundayRegularHoursWorked += safeRegular;
            }
        }
    }
    const regularEarnings = roundMoney(regularHoursWorked * compensation.hourlyRate);
    const overtimeEarnings = roundMoney(overtimeHoursWorked *
        compensation.hourlyRate *
        compensation.overtimeRateMultiplier);
    const sundayPremiumEarnings = roundMoney(sundayRegularHoursWorked *
        compensation.hourlyRate *
        Math.max(0, compensation.sundayRateMultiplier - 1));
    const nightDifferentialEarnings = roundMoney(nightDifferentialHours *
        compensation.hourlyRate *
        Math.max(0, compensation.nightDifferentialRateMultiplier - 1));
    const riceAllowanceEarnings = compensation.isRiceAllowanceEligible
        ? roundMoney(compensation.riceAllowanceFixedAmount)
        : 0;
    const earningsBreakdown = {
        regularEarnings,
        overtimeEarnings,
        sundayPremiumEarnings,
        nightDifferentialEarnings,
        riceAllowanceEarnings,
    };
    const statutoryDeductions = {
        sss: compensation.isSssEnabled
            ? roundMoney(compensation.sssDeductionFixedAmount)
            : 0,
        pagIbig: compensation.isPagIbigEnabled
            ? roundMoney(compensation.pagIbigDeductionFixedAmount)
            : 0,
        philHealth: compensation.isPhilHealthEnabled
            ? roundMoney(compensation.philHealthDeductionFixedAmount)
            : 0,
    };
    const statutoryAdjustments = statutoryToAdjustments(statutoryDeductions);
    const manualDeductions = manualDeductionsOnly(existingDeductions);
    const deductions = [...manualDeductions, ...statutoryAdjustments];
    const calculatedPay = roundMoney(regularEarnings +
        overtimeEarnings +
        sundayPremiumEarnings +
        nightDifferentialEarnings +
        riceAllowanceEarnings);
    const additionsTotal = adjustmentTotal(additions);
    const deductionsTotal = adjustmentTotal(deductions);
    const netPay = roundMoney(calculatedPay + additionsTotal - deductionsTotal);
    return {
        totalHoursWorked: roundMoney(totalHoursWorked),
        totalDaysWorked: uniqueDates.size,
        earningsBreakdown,
        statutoryDeductions,
        deductions,
        calculatedPay,
        netPay,
    };
}
//# sourceMappingURL=invoice.calculator.service.js.map