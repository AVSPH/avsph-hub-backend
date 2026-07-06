import rateLimit from "@fastify/rate-limit";
import { leadJsonSchema, createLeadJsonSchema, updateLeadJsonSchema, bulkLeadActionJsonSchema, } from "../../types/lead.types.js";
import { createLead, getLeadsByBusiness, getLeadById, updateLead, deleteLead, getLeadTags, exportLeads, bulkLeads, } from "./lead.controllers.js";
const leadRoutes = async (fastify) => {
    // Rate limiting is scoped to this plugin only (global: false) so it never
    // applies to sibling route modules registered from routes/routes.ts.
    await fastify.register(rateLimit, { global: false });
    // POST /leads - Submit a lead (public route, from AVSPH contact form)
    fastify.post("/leads", {
        config: {
            rateLimit: {
                max: 5,
                timeWindow: "1 minute",
            },
        },
        schema: {
            description: "Submit a new lead (public, replaces GHL contact capture)",
            tags: ["Leads"],
            body: createLeadJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        lead: { type: "object", additionalProperties: true },
                    },
                },
                201: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        lead: { type: "object", additionalProperties: true },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
            },
        },
    }, createLead);
    // GET /businesses/:businessId/leads - Get leads for a business (protected)
    fastify.get("/businesses/:businessId/leads", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get all leads for a business with search and pagination (requires authentication)",
            tags: ["Leads"],
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
                        description: "Search by name, email, or company",
                    },
                    page: { type: "string", description: "Page number (default: 1)" },
                    limit: {
                        type: "string",
                        description: "Items per page (default: 10, max: 100)",
                    },
                    status: {
                        type: "string",
                        enum: ["new", "contacted", "qualified", "converted"],
                        description: "Filter by status",
                    },
                    source: {
                        type: "string",
                        enum: ["contact_form", "newsletter", "other"],
                        description: "Filter by source",
                    },
                    tags: {
                        type: "string",
                        description: "Comma-separated tags; matches leads having ANY",
                    },
                    dateFrom: {
                        type: "string",
                        description: "ISO date-time lower bound on createdAt",
                    },
                    dateTo: {
                        type: "string",
                        description: "ISO date-time upper bound on createdAt",
                    },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: leadJsonSchema,
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
    }, getLeadsByBusiness);
    // GET /businesses/:businessId/lead-tags - Distinct tags for a business (protected)
    fastify.get("/businesses/:businessId/lead-tags", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get the distinct set of tags used across a business's leads",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    businessId: { type: "string", description: "Business ID (MongoDB ObjectId)" },
                },
                required: ["businessId"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        tags: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
    }, getLeadTags);
    // GET /businesses/:businessId/leads/export - All matching leads for CSV (protected)
    fastify.get("/businesses/:businessId/leads/export", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Export all matching leads (no pagination, capped at 5000) for CSV download",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    businessId: { type: "string", description: "Business ID (MongoDB ObjectId)" },
                },
                required: ["businessId"],
            },
            querystring: {
                type: "object",
                properties: {
                    search: { type: "string" },
                    status: {
                        type: "string",
                        enum: ["new", "contacted", "qualified", "converted"],
                    },
                    source: {
                        type: "string",
                        enum: ["contact_form", "newsletter", "other"],
                    },
                    tags: { type: "string" },
                    dateFrom: { type: "string" },
                    dateTo: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: { type: "array", items: leadJsonSchema },
                        truncated: { type: "boolean" },
                        total: { type: "number" },
                    },
                },
            },
        },
    }, exportLeads);
    // POST /businesses/:businessId/leads/bulk - Bulk status/tags/delete (protected)
    fastify.post("/businesses/:businessId/leads/bulk", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Bulk action on leads: set status, add/remove tags, or soft delete",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    businessId: { type: "string", description: "Business ID (MongoDB ObjectId)" },
                },
                required: ["businessId"],
            },
            body: bulkLeadActionJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: { modified: { type: "number" } },
                },
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
            },
        },
    }, bulkLeads);
    // GET /leads/:id - Get lead by ID (protected)
    fastify.get("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a lead by ID (requires authentication)",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            response: {
                200: leadJsonSchema,
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
    }, getLeadById);
    // PATCH /leads/:id - Update a lead (protected - status/notes/details)
    fastify.patch("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a lead (requires authentication)",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
                },
                required: ["id"],
            },
            body: updateLeadJsonSchema,
            response: {
                200: leadJsonSchema,
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
            },
        },
    }, updateLead);
    // DELETE /leads/:id - Soft delete a lead (protected)
    fastify.delete("/leads/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Soft delete a lead (requires authentication)",
            tags: ["Leads"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Lead ID (MongoDB ObjectId)" },
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
    }, deleteLead);
};
export default leadRoutes;
//# sourceMappingURL=lead.routes.js.map