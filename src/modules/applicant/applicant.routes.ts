import type { FastifyPluginAsync } from "fastify";
import {
    applicantJsonSchema,
    updateApplicantJsonSchema,
    updateApplicantStageJsonSchema,
    hireApplicantJsonSchema,
} from "../../types/applicant.types.js";
import {
    getAllApplicants,
    getApplicantById,
    getApplicantsByJob,
    updateApplicant,
    updateApplicantStage,
    hireApplicant,
    deleteApplicant,
} from "./applicant.controllers.js";

const applicantRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /applicants - Get all applicants (protected, filtered by access)
    fastify.get<{
        Querystring: { businessId?: string; jobId?: string; stage?: string };
    }>(
        "/applicants",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description:
                    "Get all applicants with optional filters (requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: "object",
                    properties: {
                        businessId: {
                            type: "string",
                            description: "Filter by business ID",
                        },
                        jobId: {
                            type: "string",
                            description: "Filter by job post ID",
                        },
                        stage: {
                            type: "string",
                            description: "Filter by stage ID",
                        },
                    },
                },
                response: {
                    200: {
                        type: "array",
                        items: applicantJsonSchema,
                    },
                },
            },
        },
        getAllApplicants,
    );

    // GET /applicants/:id - Get applicant by ID (protected)
    fastify.get<{ Params: { id: string } }>(
        "/applicants/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Get an applicant by ID (requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Applicant ID (MongoDB ObjectId)",
                        },
                    },
                    required: ["id"],
                },
                response: {
                    200: applicantJsonSchema,
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
        getApplicantById,
    );

    // GET /job-posts/:jobId/applicants - Get applicants for a job post (Kanban view)
    fastify.get<{ Params: { jobId: string } }>(
        "/job-posts/:jobId/applicants",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description:
                    "Get all applicants for a specific job post (Kanban board view, requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        jobId: {
                            type: "string",
                            description: "Job Post ID (MongoDB ObjectId)",
                        },
                    },
                    required: ["jobId"],
                },
                response: {
                    200: {
                        type: "array",
                        items: applicantJsonSchema,
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
        getApplicantsByJob,
    );

    // PATCH /applicants/:id - Update applicant (notes, etc.)
    fastify.patch<{ Params: { id: string } }>(
        "/applicants/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description:
                    "Update an applicant (admin notes, etc.) - requires authentication",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Applicant ID (MongoDB ObjectId)",
                        },
                    },
                    required: ["id"],
                },
                body: updateApplicantJsonSchema,
                response: {
                    200: applicantJsonSchema,
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
        },
        updateApplicant,
    );

    // PATCH /applicants/:id/stage - Move applicant to a different stage
    fastify.patch<{ Params: { id: string } }>(
        "/applicants/:id/stage",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description:
                    "Move an applicant to a different stage in the pipeline (requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Applicant ID (MongoDB ObjectId)",
                        },
                    },
                    required: ["id"],
                },
                body: updateApplicantStageJsonSchema,
                response: {
                    200: applicantJsonSchema,
                    400: {
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
        updateApplicantStage,
    );

    // POST /applicants/:id/hire - Convert applicant to staff member
    fastify.post<{ Params: { id: string } }>(
        "/applicants/:id/hire",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description:
                    "Hire an applicant — creates a staff member, sends welcome email (requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Applicant ID (MongoDB ObjectId)",
                        },
                    },
                    required: ["id"],
                },
                body: hireApplicantJsonSchema,
                response: {
                    201: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                            staff: {
                                type: "object",
                                properties: {
                                    _id: { type: "string" },
                                    firstName: { type: "string" },
                                    lastName: { type: "string" },
                                    email: { type: "string" },
                                    position: { type: "string" },
                                    businessId: { type: "string" },
                                },
                            },
                            applicantId: { type: "string" },
                            temporaryPassword: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            details: { type: "array" },
                        },
                    },
                    409: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            staffId: { type: "string" },
                        },
                    },
                },
            },
        },
        hireApplicant,
    );

    // DELETE /applicants/:id - Soft delete applicant (protected)
    fastify.delete<{ Params: { id: string } }>(
        "/applicants/:id",
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: "Soft delete an applicant (requires authentication)",
                tags: ["Applicants"],
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            description: "Applicant ID (MongoDB ObjectId)",
                        },
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
        deleteApplicant,
    );
};

export default applicantRoutes;
