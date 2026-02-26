import type { FastifyPluginAsync } from "fastify";
import {
  invoiceJsonSchema,
  generateInvoiceJsonSchema,
  generateBusinessInvoiceJsonSchema,
  approveInvoiceJsonSchema,
  addInvoiceAdjustmentJsonSchema,
} from "../../types/invoice.types.js";
import {
  generateInvoice,
  generateBusinessInvoices,
  getAllInvoices,
  getInvoiceById,
  getInvoicesByBusiness,
  getInvoicesByStaff,
  recalculateInvoice,
  approveInvoice,
  markInvoicePaid,
  addInvoiceAdjustment,
  removeInvoiceAdjustment,
  deleteInvoice,
} from "./admin.invoice.controller.js";

const adminInvoiceRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== INVOICE GENERATION ====================

  // POST /invoices/generate - Generate invoice for a single staff member
  fastify.post(
    "/invoices/generate",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Generate an invoice for a staff member based on approved EOD reports",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        body: generateInvoiceJsonSchema,
        response: {
          201: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
              invoiceId: { type: "string" },
            },
          },
        },
      },
    },
    generateInvoice,
  );

  // POST /businesses/:businessId/invoices/generate - Batch generate invoices
  fastify.post<{ Params: { businessId: string } }>(
    "/businesses/:businessId/invoices/generate",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Generate invoices for all hourly-rate staff in a business based on approved EOD reports",
        tags: ["Invoices"],
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
        body: generateBusinessInvoiceJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              summary: {
                type: "object",
                properties: {
                  total: { type: "number" },
                  generated: { type: "number" },
                  skipped: { type: "number" },
                  errors: { type: "number" },
                },
              },
              generated: { type: "array" },
              skipped: { type: "array" },
              errors: { type: "array" },
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
    generateBusinessInvoices,
  );

  // ==================== INVOICE RETRIEVAL ====================

  // GET /invoices - Get all invoices (filtered by business access)
  fastify.get<{
    Querystring: {
      businessId?: string;
      staffId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    };
  }>(
    "/invoices",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Get all invoices (admin only, filtered by business access)",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            businessId: { type: "string" },
            staffId: { type: "string" },
            status: {
              type: "string",
              enum: ["draft", "calculated", "approved", "paid"],
            },
            startDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            endDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
          },
        },
        response: {
          200: {
            type: "array",
            items: invoiceJsonSchema,
          },
        },
      },
    },
    getAllInvoices,
  );

  // GET /invoices/:id - Get invoice by ID (with staff details and EOD reports)
  fastify.get<{ Params: { id: string } }>(
    "/invoices/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Get an invoice by ID with staff details and linked EOD reports",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              staff: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                  position: { type: "string" },
                },
              },
              eodReports: { type: "array" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    getInvoiceById,
  );

  // GET /businesses/:businessId/invoices - Get invoices by business (paginated)
  fastify.get<{
    Params: { businessId: string };
    Querystring: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      page?: string;
      limit?: string;
    };
  }>(
    "/businesses/:businessId/invoices",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Get invoices for a specific business with pagination, filters, and search",
        tags: ["Invoices"],
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
            status: {
              type: "string",
              enum: ["draft", "calculated", "approved", "paid"],
            },
            startDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            endDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            search: {
              type: "string",
              description: "Search by staff first name, last name, or email",
            },
            page: { type: "string", default: "1" },
            limit: { type: "string", default: "20" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: invoiceJsonSchema,
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  totalCount: { type: "number" },
                  totalPages: { type: "number" },
                  hasNextPage: { type: "boolean" },
                  hasPrevPage: { type: "boolean" },
                },
              },
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
    getInvoicesByBusiness,
  );

  // GET /staff/:staffId/invoices - Get invoices by staff
  fastify.get<{
    Params: { staffId: string };
    Querystring: {
      status?: string;
      startDate?: string;
      endDate?: string;
    };
  }>(
    "/staff/:staffId/invoices",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get all invoices for a specific staff member",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            staffId: {
              type: "string",
              description: "Staff ID (MongoDB ObjectId)",
            },
          },
          required: ["staffId"],
        },
        querystring: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["draft", "calculated", "approved", "paid"],
            },
            startDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            endDate: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
          },
        },
        response: {
          200: {
            type: "array",
            items: invoiceJsonSchema,
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    getInvoicesByStaff,
  );

  // ==================== INVOICE ACTIONS ====================

  // PUT /invoices/:id/recalculate - Recalculate invoice from current approved EODs
  fastify.put<{ Params: { id: string } }>(
    "/invoices/:id/recalculate",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Recalculate an invoice by re-aggregating all currently approved EODs for its period. Only works on draft or calculated invoices.",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
              recalculation: {
                type: "object",
                properties: {
                  previousHoursWorked: { type: "number" },
                  newHoursWorked: { type: "number" },
                  previousPay: { type: "number" },
                  newPay: { type: "number" },
                  eodsAdded: { type: "number" },
                  eodsRemoved: { type: "number" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    recalculateInvoice,
  );

  // PUT /invoices/:id/approve - Approve invoice
  fastify.put<{ Params: { id: string } }>(
    "/invoices/:id/approve",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Approve an invoice (changes status from draft to approved)",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        body: approveInvoiceJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    approveInvoice,
  );

  // PUT /invoices/:id/paid - Mark invoice as paid
  fastify.put<{ Params: { id: string } }>(
    "/invoices/:id/paid",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Mark an approved invoice as paid",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    markInvoicePaid,
  );

  // POST /invoices/:id/adjustment - Add deduction or addition
  fastify.post<{ Params: { id: string } }>(
    "/invoices/:id/adjustment",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Add a deduction or addition to a draft invoice",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        body: addInvoiceAdjustmentJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    addInvoiceAdjustment,
  );

  // DELETE /invoices/:id/adjustment - Remove adjustment
  fastify.delete<{
    Params: { id: string };
    Body: { type: "deduction" | "addition"; index: number };
  }>(
    "/invoices/:id/adjustment",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Remove a deduction or addition from a draft invoice by index",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["deduction", "addition"],
            },
            index: { type: "number", minimum: 0 },
          },
          required: ["type", "index"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              ...invoiceJsonSchema.properties,
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    removeInvoiceAdjustment,
  );

  // DELETE /invoices/:id - Soft delete invoice
  fastify.delete<{ Params: { id: string } }>(
    "/invoices/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Soft delete an invoice (cannot delete paid invoices)",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Invoice ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    deleteInvoice,
  );
};

export default adminInvoiceRoutes;
