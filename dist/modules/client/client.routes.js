import { clientJsonSchema, createClientJsonSchema, updateClientJsonSchema, } from "../../types/client.types.js";
import { createClient, getClients, getClientById, updateClient, deleteClient, getClientStaff, getClientWeeklyReport, getBusinessClientAnalytics, getClientAnalytics, } from "./client.controller.js";
const idParamsSchema = {
    type: "object",
    properties: { id: { type: "string" } },
    required: ["id"],
};
const clientRoutes = async (fastify) => {
    // List clients
    fastify.get("/clients", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "List clients (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    businessId: { type: "string" },
                    status: { type: "string", enum: ["active", "inactive"] },
                    isActive: { type: "string", enum: ["true", "false"] },
                },
            },
            response: {
                200: { type: "array", items: clientJsonSchema },
            },
        },
    }, getClients);
    // Get one client
    fastify.get("/clients/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a client by ID (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
            response: { 200: clientJsonSchema },
        },
    }, getClientById);
    // Create client
    fastify.post("/clients", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Create a client (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            body: createClientJsonSchema,
            response: {
                201: {
                    type: "object",
                    properties: {
                        ...clientJsonSchema.properties,
                        message: { type: "string" },
                    },
                },
            },
        },
    }, createClient);
    // Update client
    fastify.patch("/clients/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a client (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
            body: updateClientJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        ...clientJsonSchema.properties,
                        message: { type: "string" },
                    },
                },
            },
        },
    }, updateClient);
    // Soft-delete client
    fastify.delete("/clients/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Soft-delete a client (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
            response: {
                200: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
            },
        },
    }, deleteClient);
    // Staff assigned to a client
    fastify.get("/clients/:id/staff", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "List active staff assigned to a client (admin only)",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
        },
    }, getClientStaff);
    // Weekly report for a client
    fastify.get("/clients/:id/weekly-report", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Hours + pay report for a client's staff over a date range " +
                "(defaults to the current week). Admin only.",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
            querystring: {
                type: "object",
                properties: {
                    from: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    to: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
            },
        },
    }, getClientWeeklyReport);
    // Business-wide client analytics (revenue / cost / margin)
    fastify.get("/businesses/:businessId/clients/analytics", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "All-time (or date-ranged) client analytics for a business " +
                "(revenue, staff cost, margin). Admin only.",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { businessId: { type: "string" } },
                required: ["businessId"],
            },
            querystring: {
                type: "object",
                properties: {
                    from: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    to: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
            },
        },
    }, getBusinessClientAnalytics);
    // Single-client analytics (all-time or date-ranged)
    fastify.get("/clients/:id/analytics", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "All-time (or date-ranged) analytics for one client " +
                "(revenue, staff cost, margin). Admin only.",
            tags: ["Clients"],
            security: [{ bearerAuth: [] }],
            params: idParamsSchema,
            querystring: {
                type: "object",
                properties: {
                    from: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    to: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
            },
        },
    }, getClientAnalytics);
};
export default clientRoutes;
//# sourceMappingURL=client.routes.js.map