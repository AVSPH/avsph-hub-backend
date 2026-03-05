import { ObjectId, type Db, type Document } from "mongodb";
import type {
  InvoiceAdjustmentType,
  InvoiceEarningsBreakdownType,
  InvoiceStatutoryDeductionsType,
} from "../../schema/invoice.schema.js";

const STATUTORY_ADJUSTMENT_TYPES = new Set(["SSS", "Pag-IBIG", "PhilHealth"]);

interface MinimalStaffDocument extends Document {
  _id: unknown;
  businessId?: string;
  salary?: number;
  compensationProfileId?: string;
}

interface CompensationProfileDocument extends Document {
  _id?: unknown;
  businessId: string;
  currency?: string;
  hourlyRate?: number;
  overtimeRateMultiplier?: number;
  sundayRateMultiplier?: number;
  nightDifferentialRateMultiplier?: number;
  isTransportationAllowanceEnabled?: boolean;
  transportationAllowanceMonthlyAmount?: number;
  isSssEnabled?: boolean;
  isPagIbigEnabled?: boolean;
  isPhilHealthEnabled?: boolean;
  sssDeductionFixedAmount?: number;
  pagIbigDeductionFixedAmount?: number;
  philHealthDeductionFixedAmount?: number;
}

interface EodPayrollRecord extends Document {
  _id: unknown;
  date?: string;
  hoursWorked?: number;
  regularHoursWorked?: number;
  overtimeHoursWorked?: number;
  nightDifferentialHours?: number;
  onSite?: boolean;
}

export interface ResolvedCompensationProfile {
  source: "linked_profile" | "legacy_staff_salary";
  profileId?: string;
  currency: string;
  hourlyRate: number;
  overtimeRateMultiplier: number;
  sundayRateMultiplier: number;
  nightDifferentialRateMultiplier: number;
  isTransportationAllowanceEnabled: boolean;
  transportationAllowanceMonthlyAmount: number;
  isSssEnabled: boolean;
  isPagIbigEnabled: boolean;
  isPhilHealthEnabled: boolean;
  sssDeductionFixedAmount: number;
  pagIbigDeductionFixedAmount: number;
  philHealthDeductionFixedAmount: number;
}

export interface InvoiceFinancialComputation {
  totalHoursWorked: number;
  totalDaysWorked: number;
  earningsBreakdown: InvoiceEarningsBreakdownType;
  statutoryDeductions: InvoiceStatutoryDeductionsType;
  deductions: InvoiceAdjustmentType[];
  calculatedPay: number;
  netPay: number;
}

type PayrollPeriodHalf = "first" | "second" | "unknown";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function adjustmentTotal(items: InvoiceAdjustmentType[]): number {
  return roundMoney(items.reduce((sum, item) => sum + (item.amount || 0), 0));
}

function parseDateAsUtc(dateValue: string): Date | null {
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

function getPayrollPeriodHalf(periodEnd: string): PayrollPeriodHalf {
  const date = parseDateAsUtc(periodEnd);
  if (!date) {
    return "unknown";
  }
  return date.getUTCDate() <= 15 ? "first" : "second";
}

function isSunday(dateValue: string): boolean {
  const date = parseDateAsUtc(dateValue);
  return date ? date.getUTCDay() === 0 : false;
}

/**
 * Count the number of weekdays (Mon-Fri) in the full calendar month
 * that the given date belongs to.
 */
function getWeekdayCountInMonth(dateValue: string): number {
  const date = parseDateAsUtc(dateValue);
  if (!date) return 22; // safe fallback
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let weekdays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(Date.UTC(year, month, day)).getUTCDay();
    if (dow >= 1 && dow <= 5) weekdays++;
  }
  return weekdays;
}

function statutoryToAdjustments(
  statutory: InvoiceStatutoryDeductionsType,
): InvoiceAdjustmentType[] {
  const adjustments: InvoiceAdjustmentType[] = [];
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

function manualDeductionsOnly(
  deductions: InvoiceAdjustmentType[],
): InvoiceAdjustmentType[] {
  return deductions.filter(
    (item) => !STATUTORY_ADJUSTMENT_TYPES.has(item.type),
  );
}

function toNumeric(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

async function findActiveProfileById(
  db: Db,
  profileId: string,
  businessId: string,
  periodEnd: string,
): Promise<CompensationProfileDocument | null> {
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

  return (rows[0] as CompensationProfileDocument | undefined) || null;
}

export async function resolveHourlyCompensationProfile(
  db: Db,
  staffMember: MinimalStaffDocument,
  periodEnd: string,
): Promise<ResolvedCompensationProfile> {
  const businessId = staffMember.businessId || "";
  const linkedProfileId = staffMember.compensationProfileId || "";

  if (!businessId) {
    return {
      source: "legacy_staff_salary",
      currency: "PHP",
      hourlyRate: toNumeric(staffMember.salary, 0),
      overtimeRateMultiplier: 1,
      sundayRateMultiplier: 1,
      nightDifferentialRateMultiplier: 1,
      isTransportationAllowanceEnabled: false,
      transportationAllowanceMonthlyAmount: 0,
      isSssEnabled: false,
      isPagIbigEnabled: false,
      isPhilHealthEnabled: false,
      sssDeductionFixedAmount: 0,
      pagIbigDeductionFixedAmount: 0,
      philHealthDeductionFixedAmount: 0,
    };
  }

  const fallbackHourlyRate = toNumeric(staffMember.salary, 0);
  const linkedProfile = await findActiveProfileById(
    db,
    linkedProfileId,
    businessId,
    periodEnd,
  );

  const merged: ResolvedCompensationProfile = {
    source: "legacy_staff_salary",
    currency: "PHP",
    hourlyRate: fallbackHourlyRate,
    overtimeRateMultiplier: 1,
    sundayRateMultiplier: 1,
    nightDifferentialRateMultiplier: 1,
    isTransportationAllowanceEnabled: false,
    transportationAllowanceMonthlyAmount: 0,
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
    merged.currency = (linkedProfile.currency || "PHP").toUpperCase();
    merged.hourlyRate = toNumeric(linkedProfile.hourlyRate, merged.hourlyRate);
    merged.overtimeRateMultiplier = toNumeric(
      linkedProfile.overtimeRateMultiplier,
      merged.overtimeRateMultiplier,
    );
    merged.sundayRateMultiplier = toNumeric(
      linkedProfile.sundayRateMultiplier,
      merged.sundayRateMultiplier,
    );
    merged.nightDifferentialRateMultiplier = toNumeric(
      linkedProfile.nightDifferentialRateMultiplier,
      merged.nightDifferentialRateMultiplier,
    );
    merged.isTransportationAllowanceEnabled =
      !!linkedProfile.isTransportationAllowanceEnabled;
    merged.transportationAllowanceMonthlyAmount = toNumeric(
      linkedProfile.transportationAllowanceMonthlyAmount,
      merged.transportationAllowanceMonthlyAmount,
    );
    merged.isSssEnabled = !!linkedProfile.isSssEnabled;
    merged.isPagIbigEnabled = !!linkedProfile.isPagIbigEnabled;
    merged.isPhilHealthEnabled = !!linkedProfile.isPhilHealthEnabled;
    merged.sssDeductionFixedAmount = toNumeric(
      linkedProfile.sssDeductionFixedAmount,
      merged.sssDeductionFixedAmount,
    );
    merged.pagIbigDeductionFixedAmount = toNumeric(
      linkedProfile.pagIbigDeductionFixedAmount,
      merged.pagIbigDeductionFixedAmount,
    );
    merged.philHealthDeductionFixedAmount = toNumeric(
      linkedProfile.philHealthDeductionFixedAmount,
      merged.philHealthDeductionFixedAmount,
    );
  }

  return merged;
}

export function calculateInvoiceFinancials(
  eodRecords: EodPayrollRecord[],
  compensation: ResolvedCompensationProfile,
  additions: InvoiceAdjustmentType[] = [],
  existingDeductions: InvoiceAdjustmentType[] = [],
  periodEnd?: string,
  currency?: string,
): InvoiceFinancialComputation {
  let totalHoursWorked = 0;
  let regularHoursWorked = 0;
  let overtimeHoursWorked = 0;
  let nightDifferentialHours = 0;
  let sundayRegularHoursWorked = 0;
  let onSiteDays = 0;
  const uniqueDates = new Set<string>();

  for (const record of eodRecords) {
    const hoursWorked = toNumeric(record.hoursWorked, 0);
    const overtime = toNumeric(record.overtimeHoursWorked, 0);
    const regularFallback = Math.max(0, hoursWorked - overtime);
    const regular = toNumeric(record.regularHoursWorked, regularFallback);
    const night = toNumeric(record.nightDifferentialHours, 0);

    const safeOvertime = Math.max(0, Math.min(overtime, hoursWorked));
    const safeRegular = Math.max(
      0,
      Math.min(regular, hoursWorked - safeOvertime),
    );
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
      if (record.onSite) {
        onSiteDays++;
      }
    }
  }

  const regularEarnings = roundMoney(
    regularHoursWorked * compensation.hourlyRate,
  );
  const overtimeEarnings = roundMoney(
    overtimeHoursWorked *
      compensation.hourlyRate *
      compensation.overtimeRateMultiplier,
  );
  const sundayPremiumEarnings = roundMoney(
    sundayRegularHoursWorked *
      compensation.hourlyRate *
      Math.max(0, compensation.sundayRateMultiplier - 1),
  );
  const nightDifferentialEarnings = roundMoney(
    nightDifferentialHours *
      compensation.hourlyRate *
      Math.max(0, compensation.nightDifferentialRateMultiplier - 1),
  );

  // Transportation allowance: always PHP-denominated, per on-site day
  // transpoPerDay = monthlyAmount / weekdaysInMonth
  // transportationAllowanceEarnings = transpoPerDay * onSiteDays
  let transportationAllowanceEarnings = 0;
  if (
    compensation.isTransportationAllowanceEnabled &&
    compensation.transportationAllowanceMonthlyAmount > 0 &&
    onSiteDays > 0 &&
    periodEnd
  ) {
    const weekdaysInMonth = getWeekdayCountInMonth(periodEnd);
    const transpoPerDay =
      compensation.transportationAllowanceMonthlyAmount / weekdaysInMonth;
    transportationAllowanceEarnings = roundMoney(transpoPerDay * onSiteDays);
  }

  const earningsBreakdown: InvoiceEarningsBreakdownType = {
    regularEarnings,
    overtimeEarnings,
    sundayPremiumEarnings,
    nightDifferentialEarnings,
    transportationAllowanceEarnings,
  };

  const periodHalf = periodEnd ? getPayrollPeriodHalf(periodEnd) : "unknown";
  const shouldApplySss =
    compensation.isSssEnabled &&
    (periodHalf === "first" || periodHalf === "unknown");
  const shouldApplyPagIbig =
    compensation.isPagIbigEnabled &&
    (periodHalf === "first" || periodHalf === "unknown");
  const shouldApplyPhilHealth =
    compensation.isPhilHealthEnabled &&
    (periodHalf === "second" || periodHalf === "unknown");

  const statutoryDeductions: InvoiceStatutoryDeductionsType = {
    sss: shouldApplySss ? roundMoney(compensation.sssDeductionFixedAmount) : 0,
    pagIbig: shouldApplyPagIbig
      ? roundMoney(compensation.pagIbigDeductionFixedAmount)
      : 0,
    philHealth: shouldApplyPhilHealth
      ? roundMoney(compensation.philHealthDeductionFixedAmount)
      : 0,
  };

  // For non-PHP currencies, statutory deductions are PHP-denominated and must
  // NOT be subtracted from the base-currency pay.  They will be applied in the
  // phpConversion instead.  Transportation allowance is also always PHP.
  const isPhp = !currency || currency === "PHP";
  const statutoryAdjustments = isPhp
    ? statutoryToAdjustments(statutoryDeductions)
    : [];
  const manualDeductions = manualDeductionsOnly(existingDeductions);
  const deductions = [...manualDeductions, ...statutoryAdjustments];

  // For PHP invoices, include transpo in calculatedPay.
  // For non-PHP invoices, exclude transpo from base-currency total
  // (it will be added in phpConversion).
  const baseCurrencyTranspo = isPhp ? transportationAllowanceEarnings : 0;

  const calculatedPay = roundMoney(
    regularEarnings +
      overtimeEarnings +
      sundayPremiumEarnings +
      nightDifferentialEarnings +
      baseCurrencyTranspo,
  );

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

// ==================== PHP CONVERSION UTILITIES ====================

export interface PhpConversion {
  exchangeRate: number;
  baseSalaryPhp: number;
  calculatedPayPhp: number;
  netPayPhp: number;
  statutoryDeductions: InvoiceStatutoryDeductionsType;
  earningsBreakdownPhp: InvoiceEarningsBreakdownType;
}

export async function getExchangeRateValue(
  db: Db,
  fromCurrency: string,
  toCurrency: string,
): Promise<number | null> {
  const exchangeRates = db.collection("exchange_rates");
  const record = await exchangeRates.findOne({
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
  });
  return record?.rate ?? null;
}

export async function buildPhpConversion(
  db: Db,
  currency: string,
  invoice: {
    baseSalary: number;
    calculatedPay: number;
    netPay: number;
    earningsBreakdown: InvoiceEarningsBreakdownType;
  },
  statutoryDeductions: InvoiceStatutoryDeductionsType = {
    sss: 0,
    pagIbig: 0,
    philHealth: 0,
  },
): Promise<PhpConversion | null> {
  if (!currency || currency === "PHP") return null;
  const rate = await getExchangeRateValue(db, currency, "PHP");
  if (!rate) return null;
  return computePhpConversion(invoice, rate, statutoryDeductions);
}

export function computePhpConversion(
  invoice: {
    baseSalary: number;
    calculatedPay: number;
    netPay: number;
    earningsBreakdown: InvoiceEarningsBreakdownType;
  },
  exchangeRate: number,
  statutoryDeductions: InvoiceStatutoryDeductionsType = {
    sss: 0,
    pagIbig: 0,
    philHealth: 0,
  },
): PhpConversion {
  const totalStatutory =
    statutoryDeductions.sss +
    statutoryDeductions.pagIbig +
    statutoryDeductions.philHealth;

  // Transportation allowance is always PHP.  The earningsBreakdown already has
  // the PHP value.  For non-PHP invoices it was excluded from calculatedPay /
  // netPay, so we add it now in PHP space.
  const transpoPhp = invoice.earningsBreakdown.transportationAllowanceEarnings;

  // netPay (base currency) already excludes statutory for non-PHP invoices,
  // so convert it to PHP then subtract the PHP statutory deductions and add
  // the PHP transportation allowance.
  const netPayPhp = roundMoney(
    invoice.netPay * exchangeRate + transpoPhp - totalStatutory,
  );
  return {
    exchangeRate,
    baseSalaryPhp: roundMoney(invoice.baseSalary * exchangeRate),
    calculatedPayPhp: roundMoney(invoice.calculatedPay * exchangeRate),
    netPayPhp,
    statutoryDeductions,
    earningsBreakdownPhp: {
      regularEarnings: roundMoney(
        invoice.earningsBreakdown.regularEarnings * exchangeRate,
      ),
      overtimeEarnings: roundMoney(
        invoice.earningsBreakdown.overtimeEarnings * exchangeRate,
      ),
      sundayPremiumEarnings: roundMoney(
        invoice.earningsBreakdown.sundayPremiumEarnings * exchangeRate,
      ),
      nightDifferentialEarnings: roundMoney(
        invoice.earningsBreakdown.nightDifferentialEarnings * exchangeRate,
      ),
      // Transportation allowance is already PHP — no exchange rate conversion
      transportationAllowanceEarnings: transpoPhp,
    },
  };
}
