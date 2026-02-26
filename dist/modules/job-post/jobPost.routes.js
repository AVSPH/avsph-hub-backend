import { jobPostJsonSchema, createJobPostJsonSchema, updateJobPostJsonSchema, } from "../../types/jobPost.types.js";
import { createApplicantJsonSchema, applicantJsonSchema, } from "../../types/applicant.types.js";
import { getAllJobPosts, getJobPostById, createJobPost, updateJobPost, updateJobPostStatus, deleteJobPost, getPublicJobPosts, getPublicJobPostById, submitPublicApplication, } from "./jobPost.controllers.js";
const jobPostRoutes = async (fastify) => {
    // ─── Admin Routes (protected) ───────────────────────────────────────
    // GET /job-posts - List all job posts
    fastify.get("/job-posts", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get all job posts with optional filters (requires authentication)",
            tags: ["Job Posts"],
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
                        enum: ["draft", "open", "closed"],
                        description: "Filter by status",
                    },
                },
            },
            response: {
                200: { type: "array", items: jobPostJsonSchema },
            },
        },
    }, getAllJobPosts);
    // GET /job-posts/:id - Get job post by ID
    fastify.get("/job-posts/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Get a job post by ID (requires authentication)",
            tags: ["Job Posts"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Job Post ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: jobPostJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getJobPostById);
    // POST /job-posts - Create a new job post
    fastify.post("/job-posts", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Create a new job post (requires authentication)",
            tags: ["Job Posts"],
            security: [{ bearerAuth: [] }],
            body: createJobPostJsonSchema,
            response: {
                201: jobPostJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
            },
        },
    }, createJobPost);
    // PUT /job-posts/:id - Update a job post
    fastify.put("/job-posts/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update a job post (requires authentication)",
            tags: ["Job Posts"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Job Post ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            body: updateJobPostJsonSchema,
            response: {
                200: jobPostJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateJobPost);
    // PATCH /job-posts/:id/status - Change job post status
    fastify.patch("/job-posts/:id/status", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Change the status of a job post (requires authentication)",
            tags: ["Job Posts"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Job Post ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            body: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["draft", "open", "closed"],
                    },
                },
                required: ["status"],
            },
            response: {
                200: jobPostJsonSchema,
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateJobPostStatus);
    // DELETE /job-posts/:id - Soft delete a job post
    fastify.delete("/job-posts/:id", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Soft delete a job post (requires authentication)",
            tags: ["Job Posts"],
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Job Post ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: { message: { type: "string" } },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, deleteJobPost);
    // ─── Public Routes (no auth) ────────────────────────────────────────
    // GET /public/jobs?businessId=xxx - List open jobs for a business
    fastify.get("/public/jobs", {
        schema: {
            description: "List all open job posts for a specific business (public, no auth required)",
            tags: ["Public Jobs"],
            querystring: {
                type: "object",
                properties: {
                    businessId: {
                        type: "string",
                        description: "Business ID (required)",
                    },
                },
                required: ["businessId"],
            },
            response: {
                200: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            _id: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            requirements: {
                                type: "array",
                                items: { type: "string" },
                            },
                            employmentType: { type: "string" },
                            businessId: { type: "string" },
                            businessName: { type: "string" },
                            createdAt: { type: "string" },
                        },
                    },
                },
            },
        },
    }, getPublicJobPosts);
    // GET /api/public/jobs/:id - Get single public job post
    fastify.get("/public/jobs/:id", {
        schema: {
            description: "Get a single open job post detail (public, no auth required)",
            tags: ["Public Jobs"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Job Post ID (MongoDB ObjectId)",
                    },
                },
                required: ["id"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        requirements: {
                            type: "array",
                            items: { type: "string" },
                        },
                        employmentType: { type: "string" },
                        businessId: { type: "string" },
                        businessName: { type: "string" },
                        createdAt: { type: "string" },
                    },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, getPublicJobPostById);
    // POST /api/public/jobs/:jobId/apply - Submit a job application
    fastify.post("/public/jobs/:jobId/apply", {
        schema: {
            description: "Submit a job application (public, no auth required)",
            tags: ["Public Jobs"],
            params: {
                type: "object",
                properties: {
                    jobId: {
                        type: "string",
                        description: "Job Post ID to apply for",
                    },
                },
                required: ["jobId"],
            },
            body: createApplicantJsonSchema,
            response: {
                201: applicantJsonSchema,
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
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
    }, submitPublicApplication);
};
export default jobPostRoutes;
//# sourceMappingURL=jobPost.routes.js.map