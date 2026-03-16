import type { FastifyPluginAsync } from "fastify";
import {
  getBusinessOverviewStats,
  getRecentBusinessInvoices,
  getRecentBusinessEods,
} from "./overview.controller.js";

const overviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { businessId: string } }>(
    "/businesses/:businessId/overview/stats",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get business overview stats for the dashboard",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            businessId: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["businessId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              businessId: { type: "string" },
              totalStaff: { type: "number" },
              openPositions: { type: "number" },
              recentEods7d: { type: "number" },
              pendingEodApprovals: { type: "number" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    getBusinessOverviewStats,
  );

  fastify.get<{
    Params: { businessId: string };
    Querystring: { limit?: string };
  }>(
    "/businesses/:businessId/overview/recent-invoices",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get most recent invoices for a business",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            businessId: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["businessId"],
        },
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "string",
              description:
                "Max number of records to return (default 5, max 20)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    staffId: { type: "string" },
                    staffName: { type: "string" },
                    staffEmail: { type: "string" },
                    periodStart: { type: "string" },
                    periodEnd: { type: "string" },
                    status: { type: "string" },
                    netPay: { type: "number" },
                    currency: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              total: { type: "number" },
              limit: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    getRecentBusinessInvoices,
  );

  fastify.get<{
    Params: { businessId: string };
    Querystring: { limit?: string };
  }>(
    "/businesses/:businessId/overview/recent-eods",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get most recent EOD submissions for a business",
        tags: ["Overview"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            businessId: {
              type: "string",
              description: "Business ID (MongoDB ObjectId)",
            },
          },
          required: ["businessId"],
        },
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "string",
              description:
                "Max number of records to return (default 5, max 20)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    staffId: { type: "string" },
                    staffName: { type: "string" },
                    staffEmail: {
                      anyOf: [{ type: "string" }, { type: "null" }],
                    },
                    date: { type: "string" },
                    hoursWorked: { type: "number" },
                    tasksCompleted: { type: "string" },
                    status: { type: "string" },
                    isApproved: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              total: { type: "number" },
              limit: { type: "number" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    getRecentBusinessEods,
  );
};

export default overviewRoutes;
