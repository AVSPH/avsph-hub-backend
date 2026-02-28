import fp from "fastify-plugin";
import cron from "node-cron";
import type { FastifyPluginAsync, FastifyInstance } from "fastify";
import {
  calculateInvoiceFinancials,
  resolveHourlyCompensationProfile,
} from "../modules/invoice/invoice.calculator.service.js";

interface GenerationResult {
  generated: number;
  skipped: number;
  errors: number;
  details: string[];
}

function getPeriodDates(type: "second-half-previous" | "first-half-current"): {
  start: string;
  end: string;
} {
  const now = new Date();

  if (type === "first-half-current") {
    const year = now.getFullYear();
    const month = now.getMonth();
    return {
      start: new Date(year, month, 1).toISOString().split("T")[0],
      end: new Date(year, month, 15).toISOString().split("T")[0],
    };
  }

  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(
    prevMonth.getFullYear(),
    prevMonth.getMonth() + 1,
    0,
  ).getDate();
  return {
    start: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16)
      .toISOString()
      .split("T")[0],
    end: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), lastDay)
      .toISOString()
      .split("T")[0],
  };
}

async function generateInvoicesForPeriod(
  fastify: FastifyInstance,
  periodType: "second-half-previous" | "first-half-current",
): Promise<GenerationResult> {
  const { start: periodStart, end: periodEnd } = getPeriodDates(periodType);
  return generateInvoicesForDateRange(fastify, periodStart, periodEnd);
}

async function generateInvoicesForDateRange(
  fastify: FastifyInstance,
  periodStart: string,
  periodEnd: string,
): Promise<GenerationResult> {
  const db = fastify.mongo.db;
  if (!db) {
    throw new Error("Database not available");
  }

  const invoices = db.collection("invoices");
  const eodReports = db.collection("eod_reports");
  const staffCollection = db.collection("staff");

  const result: GenerationResult = {
    generated: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  const staffMembers = await staffCollection
    .find({
      isActive: true,
      status: "active",
      salary: { $exists: true, $gt: 0 },
    })
    .toArray();

  for (const staffMember of staffMembers) {
    try {
      const staffId = staffMember._id.toString();
      const businessId = staffMember.businessId;
      const staffName = `${staffMember.firstName} ${staffMember.lastName}`;

      const existingInvoice = await invoices.findOne({
        staffId,
        businessId,
        periodStart,
        periodEnd,
        isActive: true,
      });

      if (existingInvoice) {
        result.skipped++;
        result.details.push(
          `Skipped ${staffName}: invoice already exists for ${periodStart} to ${periodEnd}`,
        );
        continue;
      }

      const eodRecords = await eodReports
        .find({
          staffId,
          businessId,
          isApproved: true,
          isActive: true,
          date: { $gte: periodStart, $lte: periodEnd },
        })
        .toArray();

      const compensation = await resolveHourlyCompensationProfile(
        db,
        staffMember,
        periodEnd,
      );
      const financials = calculateInvoiceFinancials(
        eodRecords,
        compensation,
        [],
        [],
        periodEnd,
      );
      const eodIds = eodRecords.map((record) => record._id.toString());

      const now = new Date().toISOString();
      await invoices.insertOne({
        staffId,
        businessId,
        staffName,
        staffEmail: staffMember.email,
        staffPosition: staffMember.position || "",
        periodStart,
        periodEnd,
        totalHoursWorked: financials.totalHoursWorked,
        totalDaysWorked: financials.totalDaysWorked,
        salaryType: "hourly" as const,
        baseSalary: compensation.hourlyRate,
        calculatedPay: financials.calculatedPay,
        earningsBreakdown: financials.earningsBreakdown,
        statutoryDeductions: financials.statutoryDeductions,
        deductions: financials.deductions,
        additions: [],
        netPay: financials.netPay,
        eodIds,
        eodCount: eodRecords.length,
        status: "draft" as const,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      result.generated++;
      result.details.push(
        `Generated invoice for ${staffName}: ${periodStart} to ${periodEnd} (${financials.totalHoursWorked}h, $${financials.calculatedPay})`,
      );
    } catch (err) {
      result.errors++;
      const staffName = `${staffMember.firstName} ${staffMember.lastName}`;
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      result.details.push(`Error for ${staffName}: ${errMsg}`);
      fastify.log.error(
        err,
        `[CRON] Failed to generate invoice for staff ${staffMember._id}`,
      );
    }
  }

  return result;
}

const cronPlugin: FastifyPluginAsync = async (fastify) => {
  cron.schedule(
    "0 0 1 * *",
    async () => {
      fastify.log.info(
        "[CRON] Generating invoices for previous month second half...",
      );
      try {
        const result = await generateInvoicesForPeriod(
          fastify,
          "second-half-previous",
        );
        fastify.log.info(
          `[CRON] Invoice generation complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`,
        );
      } catch (err) {
        fastify.log.error(err, "[CRON] Invoice generation failed");
      }
    },
    { timezone: "Asia/Manila" },
  );

  cron.schedule(
    "0 0 16 * *",
    async () => {
      fastify.log.info(
        "[CRON] Generating invoices for current month first half...",
      );
      try {
        const result = await generateInvoicesForPeriod(
          fastify,
          "first-half-current",
        );
        fastify.log.info(
          `[CRON] Invoice generation complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`,
        );
      } catch (err) {
        fastify.log.error(err, "[CRON] Invoice generation failed");
      }
    },
    { timezone: "Asia/Manila" },
  );

  fastify.addHook("onClose", () => {
    cron.getTasks().forEach((task) => task.stop());
    fastify.log.info("[CRON] All scheduled tasks stopped.");
  });
};

export default fp(cronPlugin, {
  name: "cron",
  dependencies: ["mongodb"],
});
