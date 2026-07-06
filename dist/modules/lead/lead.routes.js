import rateLimit from "@fastify/rate-limit";
import { leadJsonSchema, createLeadJsonSchema, updateLeadJsonSchema, } from "../../types/lead.types.js";
import { createLead, getLeadsByBusiness, getLeadById, updateLead, deleteLead, } from "./lead.controllers.js";
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