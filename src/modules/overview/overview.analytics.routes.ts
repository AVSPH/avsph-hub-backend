import type { FastifyPluginAsync } from "fastify";
import {
  getBusinessAttendanceStats,
  getBusinessRecruitmentStats,
  getBusinessWorkforceStats,
  getBusinessPayrollTrend,
} from "./overview.analytics.controller.js";

const businessIdParams = {
  type: "object",
  properties: {
    businessId: {
      type: "string",
      description: "Business ID (MongoDB ObjectId)",
    },
  },
  required: ["businessId"],
} as const;

const overviewAnalyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Params: { businessId: string };
    Querystring: { days?: string };
  }>(
    "/businesses/:businessId/overview/attendance-stats",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Attendance analytics for a business (status mix, hours, daily trend)",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: businessIdParams,
        querystring: {
          type: "object",
          properties: {
            days: {
              type: "string",
              description: "Trailing window in days (default 30, max 90)",
            },
          },
        },
      },
    },
    getBusinessAttendanceStats,
  );

  fastify.get<{ Params: { businessId: string } }>(
    "/businesses/:businessId/overview/recruitment-stats",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Recruitment funnel analytics for a business",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: businessIdParams,
      },
    },
    getBusinessRecruitmentStats,
  );

  fastify.get<{ Params: { businessId: string } }>(
    "/businesses/:businessId/overview/workforce-stats",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Workforce composition analytics for a business",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: businessIdParams,
      },
    },
    getBusinessWorkforceStats,
  );

  fastify.get<{
    Params: { businessId: string };
    Querystring: { months?: string };
  }>(
    "/businesses/:businessId/overview/payroll-trend",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Payroll cost trend and earnings breakdown for a business",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: businessIdParams,
        querystring: {
          type: "object",
          properties: {
            months: {
              type: "string",
              description: "Trailing window in months (default 6, max 24)",
            },
          },
        },
      },
    },
    getBusinessPayrollTrend,
  );
};

export default overviewAnalyticsRoutes;
