import type { FastifyPluginAsync } from "fastify";
import {
  staffJsonSchema,
  createStaffJsonSchema,
  updateStaffJsonSchema,
} from "../../types/staff.types.js";
import {
  getAllStaff,
  getStaffById,
  getStaffByBusiness,
  createStaff,
  updateStaff,
  deleteStaff,
  uploadStaffPhoto,
  uploadStaffDocument,
} from "./staff.management.controller.js";

const staffRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /staff - Get all staff (protected, filtered by access)
  fastify.get<{
    Querystring: {
      businessId?: string;
      status?: string;
      employmentType?: string;
    };
  }>(
    "/staff",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Get all staff members with optional filters (requires authentication)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            businessId: {
              type: "string",
              description: "Filter by business ID",
            },
            status: {
              type: "string",
              enum: ["active", "on_leave", "terminated"],
              description: "Filter by status",
            },
            employmentType: {
              type: "string",
              enum: ["full-time", "part-time", "contract"],
              description: "Filter by employment type",
            },
          },
        },
        response: {
          200: {
            type: "array",
            items: staffJsonSchema,
          },
        },
      },
    },
    getAllStaff,
  );

  // GET /staff/:id - Get staff by ID (protected)
  fastify.get<{ Params: { id: string } }>(
    "/staff/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Get a staff member by ID (requires authentication)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Staff ID (MongoDB ObjectId)" },
          },
          required: ["id"],
        },
        response: {
          200: staffJsonSchema,
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
    getStaffById,
  );

  // GET /businesses/:businessId/staff - Get staff by business (protected)
  fastify.get<{
    Params: { businessId: string };
    Querystring: {
      search?: string;
      page?: string;
      limit?: string;
      status?: string;
      employmentType?: string;
    };
  }>(
    "/businesses/:businessId/staff",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Get all staff members for a business with search and pagination (requires authentication)",
        tags: ["Staff"],
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
            search: {
              type: "string",
              description: "Search by name, email, position, or department",
            },
            page: {
              type: "string",
              description: "Page number (default: 1)",
            },
            limit: {
              type: "string",
              description: "Items per page (default: 10, max: 100)",
            },
            status: {
              type: "string",
              enum: ["active", "on_leave", "terminated"],
              description: "Filter by status",
            },
            employmentType: {
              type: "string",
              enum: ["full-time", "part-time", "contract"],
              description: "Filter by employment type",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: staffJsonSchema,
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  total: { type: "number" },
                  totalPages: { type: "number" },
                  hasMore: { type: "boolean" },
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
    getStaffByBusiness,
  );

  // POST /staff - Create new staff member (protected)
  fastify.post(
    "/staff",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Create a new staff member (requires authentication)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        body: createStaffJsonSchema,
        response: {
          201: staffJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
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
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    createStaff,
  );

  // PUT /staff/:id - Update staff member (protected)
  fastify.put<{ Params: { id: string } }>(
    "/staff/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Update a staff member (requires authentication)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Staff ID (MongoDB ObjectId)" },
          },
          required: ["id"],
        },
        body: updateStaffJsonSchema,
        response: {
          200: staffJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
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
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    updateStaff,
  );

  // DELETE /staff/:id - Soft delete staff member (protected)
  fastify.delete<{ Params: { id: string } }>(
    "/staff/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Soft delete a staff member (requires authentication)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Staff ID (MongoDB ObjectId)" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: { message: { type: "string" } },
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
    deleteStaff,
  );

  // POST /staff/:id/photo - Upload profile photo (protected)
  fastify.post<{ Params: { id: string } }>(
    "/staff/:id/photo",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Upload a profile photo for a staff member (multipart/form-data)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Staff ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              photoUrl: { type: "string", format: "uri" },
              staff: staffJsonSchema,
            },
          },
          400: {
            type: "object",
            properties: { error: { type: "string" } },
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
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    uploadStaffPhoto,
  );

  // POST /staff/:id/documents - Upload document (protected)
  fastify.post<{ Params: { id: string } }>(
    "/staff/:id/documents",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description:
          "Upload a document for a staff member (multipart/form-data)",
        tags: ["Staff"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Staff ID (MongoDB ObjectId)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              document: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string", format: "uri" },
                  type: { type: "string" },
                  uploadedAt: { type: "string", format: "date-time" },
                },
              },
              staff: staffJsonSchema,
            },
          },
          400: {
            type: "object",
            properties: { error: { type: "string" } },
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
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    uploadStaffDocument,
  );
};

export default staffRoutes;
