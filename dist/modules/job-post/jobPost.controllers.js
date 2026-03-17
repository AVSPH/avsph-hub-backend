import { ObjectId } from "@fastify/mongodb";
import { createJobPostSchema, updateJobPostSchema, updateJobPostStatusSchema, } from "../../types/jobPost.types.js";
async function countApplicantsForJob(request, jobId) {
    const applicants = request.server.mongo.db?.collection("applicants");
    if (!applicants) {
        return 0;
    }
    return applicants.countDocuments({
        jobId,
        isActive: true,
    });
}
async function withApplicantCount(request, jobPost) {
    return {
        ...jobPost,
        applicantCount: await countApplicantsForJob(request, String(jobPost._id)),
    };
}
// ─── Admin Endpoints ────────────────────────────────────────────────────
// Get all job posts (protected - filtered by business access)
export async function getAllJobPosts(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const query = { isActive: true };
    if (request.query.businessId) {
        if (!ObjectId.isValid(request.query.businessId)) {
            return reply.status(400).send({ error: "Invalid business ID format" });
        }
        query.businessId = request.query.businessId;
    }
    if (request.query.status) {
        query.status = request.query.status;
    }
    // If not super-admin, filter by accessible businesses
    if (request.user.role !== "super-admin") {
        const accessibleBusinesses = await businesses
            .find({ adminIds: request.user.id, isActive: true })
            .project({ _id: 1 })
            .toArray();
        const businessIds = accessibleBusinesses.map((b) => b._id.toString());
        if (query.businessId && !businessIds.includes(query.businessId)) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this business",
            });
        }
        if (!query.businessId) {
            query.businessId = { $in: businessIds };
        }
    }
    const result = await jobPosts.find(query).sort({ createdAt: -1 }).toArray();
    return Promise.all(result.map((jobPost) => withApplicantCount(request, jobPost)));
}
// Get job post by ID (protected)
export async function getJobPostById(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    const jobPost = await jobPosts.findOne({ _id: new ObjectId(id) });
    if (!jobPost) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(jobPost.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this job post's business",
            });
        }
    }
    return withApplicantCount(request, jobPost);
}
// Create job post (protected)
export async function createJobPost(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = createJobPostSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { businessId, title, overview, employmentType, status, stages } = parseResult.data;
    // Validate business exists
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    const business = await businesses.findOne({
        _id: new ObjectId(businessId),
        isActive: true,
    });
    if (!business) {
        return reply.status(404).send({ error: "Business not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        if (!business.adminIds?.includes(request.user.id)) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this business",
            });
        }
    }
    const now = new Date().toISOString();
    const newJobPost = {
        businessId,
        title,
        overview,
        employmentType: employmentType || "full-time",
        status: status || "draft",
        stages,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    const result = await jobPosts.insertOne(newJobPost);
    return reply.status(201).send({
        _id: result.insertedId,
        ...newJobPost,
        applicantCount: 0,
    });
}
// Update job post (protected)
export async function updateJobPost(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    const existingJobPost = await jobPosts.findOne({ _id: new ObjectId(id) });
    if (!existingJobPost) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingJobPost.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this job post's business",
            });
        }
    }
    const parseResult = updateJobPostSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const updateData = {
        ...parseResult.data,
        updatedAt: new Date().toISOString(),
    };
    const result = await jobPosts.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    return withApplicantCount(request, result);
}
// Change job post status (protected)
export async function updateJobPostStatus(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    const existingJobPost = await jobPosts.findOne({ _id: new ObjectId(id) });
    if (!existingJobPost) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingJobPost.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this job post's business",
            });
        }
    }
    const parseResult = updateJobPostStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const result = await jobPosts.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            status: parseResult.data.status,
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    return withApplicantCount(request, result);
}
// Delete job post (soft delete - protected)
export async function deleteJobPost(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    const existingJobPost = await jobPosts.findOne({ _id: new ObjectId(id) });
    if (!existingJobPost) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingJobPost.businessId),
            adminIds: request.user.id,
        });
        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this job post's business",
            });
        }
    }
    const result = await jobPosts.findOneAndUpdate({ _id: new ObjectId(id) }, {
        $set: {
            isActive: false,
            status: "closed",
            updatedAt: new Date().toISOString(),
        },
    }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    return reply.status(200).send({ message: "Job post deleted successfully" });
}
// ─── Public Endpoints ───────────────────────────────────────────────────
// Get all open job posts for a specific business (PUBLIC)
export async function getPublicJobPosts(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.query;
    if (!businessId) {
        return reply.status(400).send({ error: "Business ID is required" });
    }
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    // Verify business exists and is active
    const business = await businesses.findOne({
        _id: new ObjectId(businessId),
        isActive: true,
    });
    if (!business) {
        return reply.status(404).send({ error: "Business not found" });
    }
    const result = await jobPosts
        .find({
        businessId,
        status: "open",
        isActive: true,
    })
        .sort({ createdAt: -1 })
        .toArray();
    // Return sanitized job posts (public-safe fields only)
    return result.map((jp) => ({
        _id: jp._id,
        title: jp.title,
        overview: jp.overview,
        employmentType: jp.employmentType,
        businessId: jp.businessId,
        businessName: business.name,
        createdAt: jp.createdAt,
    }));
}
// Get single public job post detail (PUBLIC)
export async function getPublicJobPostById(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!jobPosts || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    const jobPost = await jobPosts.findOne({
        _id: new ObjectId(id),
        status: "open",
        isActive: true,
    });
    if (!jobPost) {
        return reply.status(404).send({ error: "Job post not found" });
    }
    const business = await businesses.findOne({
        _id: new ObjectId(jobPost.businessId),
    });
    return {
        _id: jobPost._id,
        title: jobPost.title,
        overview: jobPost.overview,
        employmentType: jobPost.employmentType,
        businessId: jobPost.businessId,
        businessName: business?.name || "Unknown",
        createdAt: jobPost.createdAt,
    };
}
// Submit a public job application (PUBLIC)
export async function submitPublicApplication(request, reply) {
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const applicants = request.server.mongo.db?.collection("applicants");
    if (!jobPosts || !applicants) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { jobId } = request.params;
    if (!ObjectId.isValid(jobId)) {
        return reply.status(400).send({ error: "Invalid job post ID format" });
    }
    // Verify the job post exists and is open
    const jobPost = await jobPosts.findOne({
        _id: new ObjectId(jobId),
        status: "open",
        isActive: true,
    });
    if (!jobPost) {
        return reply
            .status(404)
            .send({
            error: "Job post not found or no longer accepting applications",
        });
    }
    // Validate the application body
    const { createApplicantSchema } = await import("../../types/applicant.types.js");
    const parseResult = createApplicantSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { firstName, lastName, email, phone, resume, coverLetter } = parseResult.data;
    // Check for duplicate application (same email + same job)
    const existingApplication = await applicants.findOne({
        jobId: jobId,
        email: email,
        isActive: true,
    });
    if (existingApplication) {
        return reply.status(409).send({
            error: "You have already applied for this position",
        });
    }
    // Get the first stage (lowest order) from the job post's stages
    const sortedStages = [...jobPost.stages].sort((a, b) => a.order - b.order);
    const firstStage = sortedStages.find((s) => s.type === "active");
    if (!firstStage) {
        return reply.status(500).send({
            error: "Job post has no valid active stages configured",
        });
    }
    const now = new Date().toISOString();
    const newApplicant = {
        jobId: jobId,
        businessId: jobPost.businessId,
        firstName,
        lastName,
        email,
        phone,
        position: jobPost.title,
        resume,
        coverLetter,
        stage: firstStage.id,
        adminNotes: undefined,
        isStaffConverted: false,
        staffId: undefined,
        isActive: true,
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    const result = await applicants.insertOne(newApplicant);
    return reply.status(201).send({
        _id: result.insertedId,
        ...newApplicant,
        message: "Application submitted successfully",
    });
}
//# sourceMappingURL=jobPost.controllers.js.map