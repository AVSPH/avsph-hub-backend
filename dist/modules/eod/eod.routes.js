import { eodReportJsonSchema, submitEodJsonSchema, editOwnEodJsonSchema, reviewEodJsonSchema, adminEditEodJsonSchema, } from "../../types/eod.types.js";
import { submitEod, editOwnEod, getMyEodReports, getMyEodById, getMyExpectedEarnings, getAllEodReports, getEodByBusiness, getEodByStaff, getEodById, reviewEod, adminEditEod, deleteEod, } from "./eod.controllers.js";
const eodRoutes = async (fastify) => {
    // ==================== STAFF ROUTES ====================
    // GET /eod/my-earnings - Staff views expected earnings for current pay cycle
    fastify.get("/eod/my-earnings", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Get expected earnings for the current (or specified) pay cycle based on approved EODs",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    periodStart: {
                        type: "string",
                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        description: "Start of the pay period (YYYY-MM-DD). If omitted, auto-detects current cycle.",
                    },
                    periodEnd: {
                        type: "string",
                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                        description: "End of the pay period (YYYY-MM-DD). If omitted, auto-detects current cycle.",
                    },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        periodStart: { type: "string" },
                        periodEnd: { type: "string" },
                        totalHoursWorked: { type: "number" },
                        totalDaysWorked: { type: "number" },
                        baseSalary: { type: "number" },
                        salaryType: { type: "string" },
                        estimatedPay: { type: "number" },
                        approvedEodCount: { type: "number" },
                        pendingEodCount: { type: "number" },
                        nextPayoutDate: { type: "string" },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
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
    }, getMyExpectedEarnings);
    // POST /eod - Staff submits an EOD report
    fastify.post("/eod", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Submit an End of Day report",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            body: submitEodJsonSchema,
            response: {
                201: {
                    type: "object",
                    properties: {
                        ...eodReportJsonSchema.properties,
                        message: { type: "string" },
                    },
                },
                409: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                        existingId: { type: "string" },
                    },
                },
            },
        },
    }, submitEod);
    // PUT /eod/:id/resubmit - Staff edits and resubmits a returned EOD
    fastify.put("/eod/:id/resubmit", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Edit and resubmit an EOD report that was returned for revision",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: editOwnEodJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        ...eodReportJsonSchema.properties,
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
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, editOwnEod);
    // GET /eod/me - Staff views their own EOD reports (paginated)
    fastify.get("/eod/me", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Get current staff's EOD reports",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    status: {
                        type: "string",
                        enum: ["submitted", "reviewed", "needs_revision"],
                    },
                    page: { type: "string" },
                    limit: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: eodReportJsonSchema,
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
            },
        },
    }, getMyEodReports);
    // GET /eod/me/:id - Staff views a single EOD report
    fastify.get("/eod/me/:id", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Get a specific EOD report (own report only)",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            response: {
                200: eodReportJsonSchema,
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, getMyEodById);
    // ==================== ADMIN ROUTES ====================
    // GET /eod - Admin views all EOD reports
    fastify.get("/eod", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get all EOD reports (admin only, filtered by business access)",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    businessId: { type: "string" },
                    staffId: { type: "string" },
                    status: {
                        type: "string",
                        enum: ["submitted", "reviewed", "needs_revision"],
                    },
                    isApproved: { type: "string", enum: ["true", "false"] },
                    startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
            },
            response: {
                200: {
                    type: "array",
                    items: eodReportJsonSchema,
                },
            },
        },
    }, getAllEodReports);
    // GET /businesses/:businessId/eod - Admin views EOD reports by business (paginated)
    fastify.get("/businesses/:businessId/eod", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get EOD reports for a specific business with pagination, filters, and search",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    businessId: { type: "string" },
                },
                required: ["businessId"],
            },
            querystring: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["submitted", "reviewed", "needs_revision"],
                    },
                    isApproved: { type: "string", enum: ["true", "false"] },
                    startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
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
                            items: eodReportJsonSchema,
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
    }, getEodByBusiness);
    // GET /staff/:staffId/eod - Admin views EOD reports by staff
    fastify.get("/staff/:staffId/eod", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get EOD reports for a specific staff member",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    staffId: { type: "string" },
                },
                required: ["staffId"],
            },
            querystring: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["submitted", "reviewed", "needs_revision"],
                    },
                    isApproved: { type: "string", enum: ["true", "false"] },
                    startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                    endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
                },
            },
            response: {
                200: {
                    type: "array",
                    items: eodReportJsonSchema,
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
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, getEodByStaff);
    // GET /eod/:id - Admin views a single EOD report
    fastify.get("/eod/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a specific EOD report by ID",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            response: {
                200: eodReportJsonSchema,
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
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
    }, getEodById);
    // PUT /eod/:id/review - Admin reviews an EOD report (approve or return for revision)
    fastify.put("/eod/:id/review", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Review an EOD report — approve or return for revision",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: reviewEodJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        ...eodReportJsonSchema.properties,
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
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, reviewEod);
    // PUT /eod/:id - Admin edits an EOD report (minor tweaks)
    fastify.put("/eod/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Admin edits an EOD report (adjust hours, tasks, etc.)",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: adminEditEodJsonSchema,
            response: {
                200: eodReportJsonSchema,
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
                409: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
                    },
                },
            },
        },
    }, adminEditEod);
    // DELETE /eod/:id - Admin soft-deletes an EOD report
    fastify.delete("/eod/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Soft delete an EOD report",
            tags: ["EOD Reports"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
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
                403: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        message: { type: "string" },
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
    }, deleteEod);
};
export default eodRoutes;
//# sourceMappingURL=eod.routes.js.map