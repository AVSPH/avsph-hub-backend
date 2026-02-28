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
  position?: string;
  salary?: number;
  compensationProfileId?: string;
}

interface CompensationProfileDocument extends Document {
  _id?: unknown;
  businessId: string;
  profileScope: "position" | "staff";
  jobPosition: string;
  staffId?: string;
  hourlyRate?: number;
  overtimeRateMultiplier?: number;
  sundayRateMultiplier?: number;
  nightDifferentialRateMultiplier?: number;
  isRiceAllowanceEligible?: boolean;
  riceAllowanceFixedAmount?: number;
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
}

export interface ResolvedCompensationProfile {
  source:
    | "linked_profile"
    | "staff_profile"
    | "position_profile"
    | "legacy_staff_salary";
  profileId?: string;
  hourlyRate: number;
  overtimeRateMultiplier: number;
  sundayRateMultiplier: number;
  nightDifferentialRateMultiplier: number;
  isRiceAllowanceEligible: boolean;
  riceAllowanceFixedAmount: number;
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

function isSunday(dateValue: string): boolean {
  const date = parseDateAsUtc(dateValue);
  return date ? date.getUTCDay() === 0 : false;
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
  return deductions.filter((item) => !STATUTORY_ADJUSTMENT_TYPES.has(item.type));
}

function toNumeric(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

async function findLatestProfile(
  db: Db,
  query: Record<string, unknown>,
  periodEnd: string,
): Promise<CompensationProfileDocument | null> {
  const profiles = db.collection("compensation_profiles");
  const rows = await profiles
    .find({
      ...query,
      isActive: true,
      effectiveFrom: { $lte: periodEnd },
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: null },
        { effectiveTo: "" },
        { effectiveTo: { $gte: periodEnd } },
      ],
    })
    .sort({ effectiveFrom: -1, updatedAt: -1 })
    .limit(1)
    .toArray();

  return (rows[0] as CompensationProfileDocument | undefined) || null;
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
  const staffId = String(staffMember._id);
  const businessId = staffMember.businessId || "";
  const jobPosition = staffMember.position || "";
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

  const staffProfile = await findLatestProfile(
    db,
    {
      businessId,
      profileScope: "staff",
      staffId,
    },
    periodEnd,
  );

  const positionProfile = await findLatestProfile(
    db,
    {
      businessId,
      profileScope: "position",
      jobPosition,
    },
    periodEnd,
  );

  const fallbackHourlyRate = toNumeric(staffMember.salary, 0);
  const linkedProfile = await findActiveProfileById(
    db,
    linkedProfileId,
    businessId,
    periodEnd,
  );

  const merged: ResolvedCompensationProfile = {
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

  if (positionProfile) {
    merged.source = "position_profile";
    merged.profileId = String(positionProfile._id);
    merged.hourlyRate = toNumeric(positionProfile.hourlyRate, merged.hourlyRate);
    merged.overtimeRateMultiplier = toNumeric(
      positionProfile.overtimeRateMultiplier,
      merged.overtimeRateMultiplier,
    );
    merged.sundayRateMultiplier = toNumeric(
      positionProfile.sundayRateMultiplier,
      merged.sundayRateMultiplier,
    );
    merged.nightDifferentialRateMultiplier = toNumeric(
      positionProfile.nightDifferentialRateMultiplier,
      merged.nightDifferentialRateMultiplier,
    );
    merged.isRiceAllowanceEligible = !!positionProfile.isRiceAllowanceEligible;
    merged.riceAllowanceFixedAmount = toNumeric(
      positionProfile.riceAllowanceFixedAmount,
      merged.riceAllowanceFixedAmount,
    );
    merged.isSssEnabled = !!positionProfile.isSssEnabled;
    merged.isPagIbigEnabled = !!positionProfile.isPagIbigEnabled;
    merged.isPhilHealthEnabled = !!positionProfile.isPhilHealthEnabled;
    merged.sssDeductionFixedAmount = toNumeric(
      positionProfile.sssDeductionFixedAmount,
      merged.sssDeductionFixedAmount,
    );
    merged.pagIbigDeductionFixedAmount = toNumeric(
      positionProfile.pagIbigDeductionFixedAmount,
      merged.pagIbigDeductionFixedAmount,
    );
    merged.philHealthDeductionFixedAmount = toNumeric(
      positionProfile.philHealthDeductionFixedAmount,
      merged.philHealthDeductionFixedAmount,
    );
  }

  if (staffProfile) {
    merged.source = "staff_profile";
    merged.profileId = String(staffProfile._id);
    merged.hourlyRate = toNumeric(staffProfile.hourlyRate, merged.hourlyRate);
    merged.overtimeRateMultiplier = toNumeric(
      staffProfile.overtimeRateMultiplier,
      merged.overtimeRateMultiplier,
    );
    merged.sundayRateMultiplier = toNumeric(
      staffProfile.sundayRateMultiplier,
      merged.sundayRateMultiplier,
    );
    merged.nightDifferentialRateMultiplier = toNumeric(
      staffProfile.nightDifferentialRateMultiplier,
      merged.nightDifferentialRateMultiplier,
    );
    merged.isRiceAllowanceEligible = !!staffProfile.isRiceAllowanceEligible;
    merged.riceAllowanceFixedAmount = toNumeric(
      staffProfile.riceAllowanceFixedAmount,
      merged.riceAllowanceFixedAmount,
    );
    merged.isSssEnabled = !!staffProfile.isSssEnabled;
    merged.isPagIbigEnabled = !!staffProfile.isPagIbigEnabled;
    merged.isPhilHealthEnabled = !!staffProfile.isPhilHealthEnabled;
    merged.sssDeductionFixedAmount = toNumeric(
      staffProfile.sssDeductionFixedAmount,
      merged.sssDeductionFixedAmount,
    );
    merged.pagIbigDeductionFixedAmount = toNumeric(
      staffProfile.pagIbigDeductionFixedAmount,
      merged.pagIbigDeductionFixedAmount,
    );
    merged.philHealthDeductionFixedAmount = toNumeric(
      staffProfile.philHealthDeductionFixedAmount,
      merged.philHealthDeductionFixedAmount,
    );
  }

  if (linkedProfile) {
    merged.source = "linked_profile";
    merged.profileId = String(linkedProfile._id);
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
    merged.isRiceAllowanceEligible = !!linkedProfile.isRiceAllowanceEligible;
    merged.riceAllowanceFixedAmount = toNumeric(
      linkedProfile.riceAllowanceFixedAmount,
      merged.riceAllowanceFixedAmount,
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
): InvoiceFinancialComputation {
  let totalHoursWorked = 0;
  let regularHoursWorked = 0;
  let overtimeHoursWorked = 0;
  let nightDifferentialHours = 0;
  let sundayRegularHoursWorked = 0;
  const uniqueDates = new Set<string>();

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
  const riceAllowanceEarnings = compensation.isRiceAllowanceEligible
    ? roundMoney(compensation.riceAllowanceFixedAmount)
    : 0;

  const earningsBreakdown: InvoiceEarningsBreakdownType = {
    regularEarnings,
    overtimeEarnings,
    sundayPremiumEarnings,
    nightDifferentialEarnings,
    riceAllowanceEarnings,
  };

  const statutoryDeductions: InvoiceStatutoryDeductionsType = {
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

  const calculatedPay = roundMoney(
    regularEarnings +
      overtimeEarnings +
      sundayPremiumEarnings +
      nightDifferentialEarnings +
      riceAllowanceEarnings,
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
