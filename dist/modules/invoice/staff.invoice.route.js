import { invoiceJsonSchema } from "../../types/invoice.types.js";
import { getMyInvoices, getMyInvoiceById } from "./staff.invoice.controller.js";
const staffInvoiceRoutes = async (fastify) => {
    // ==================== STAFF INVOICE ROUTES ====================
    // GET /invoices/me - Staff views their own invoices (approved/paid only)
    fastify.get("/invoices/me", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Get current staff's invoices (only approved and paid invoices are visible)",
            tags: ["Invoices - Staff"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["approved", "paid"],
                        description: "Filter by status (only approved or paid allowed)",
                    },
                    startDate: {
                        type: "string",
                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        description: "Filter invoices starting from this period",
                    },
                    endDate: {
                        type: "string",
                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        description: "Filter invoices up to this period",
                    },
                },
            },
            response: {
                200: {
                    type: "array",
                    items: invoiceJsonSchema,
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
            },
        },
    }, getMyInvoices);
    // GET /invoices/me/:id - Staff views a single invoice with EOD breakdown
    fastify.get("/invoices/me/:id", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Get a specific invoice with EOD breakdown (own invoice, approved/paid only)",
            tags: ["Invoices - Staff"],
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
                        eodReports: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    date: { type: "string" },
                                    hoursWorked: { type: "number" },
                                    tasksCompleted: { type: "string" },
                                    status: { type: "string" },
                                    isApproved: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, getMyInvoiceById);
};
export default staffInvoiceRoutes;
//# sourceMappingURL=staff.invoice.route.js.map