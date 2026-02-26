import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import bcrypt from "bcrypt";
import {
    updateApplicantSchema,
    updateApplicantStageSchema,
    hireApplicantSchema,
} from "../../types/applicant.types.js";
import { getApplicantHiredEmail } from "../../utils/emails/auth/applicant.hired.email.js";

interface IdParams {
    id: string;
}

interface JobIdParams {
    jobId: string;
}

interface ApplicantQuery {
    businessId?: string;
    jobId?: string;
    stage?: string;
}

// ─── Helper: generate a temporary password ──────────────────────────────
function generateTempPassword(firstName: string): string {
    const digits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
    return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}${digits}`;
}

// ─── Admin Endpoints ────────────────────────────────────────────────────

// Get all applicants (protected - filtered by business access)
export async function getAllApplicants(
    request: FastifyRequest<{ Querystring: ApplicantQuery }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");

    if (!applicants || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const query: any = { isActive: true };

    // Filter by business if provided
    if (request.query.businessId) {
        if (!ObjectId.isValid(request.query.businessId)) {
            return reply.status(400).send({ error: "Invalid business ID format" });
        }
        query.businessId = request.query.businessId;
    }

    // Filter by job if provided
    if (request.query.jobId) {
        if (!ObjectId.isValid(request.query.jobId)) {
            return reply.status(400).send({ error: "Invalid job ID format" });
        }
        query.jobId = request.query.jobId;
    }

    // Filter by stage if provided
    if (request.query.stage) {
        query.stage = request.query.stage;
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

    const result = await applicants
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

    return result;
}

// Get applicant by ID (protected)
export async function getApplicantById(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");

    if (!applicants || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid applicant ID format" });
    }

    const applicant = await applicants.findOne({ _id: new ObjectId(id) });

    if (!applicant) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(applicant.businessId),
            adminIds: request.user.id,
        });

        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this applicant's business",
            });
        }
    }

    return applicant;
}

// Get applicants by job post (protected - for Kanban view)
export async function getApplicantsByJob(
    request: FastifyRequest<{ Params: JobIdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");
    const jobPosts = request.server.mongo.db?.collection("jobPosts");

    if (!applicants || !businesses || !jobPosts) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { jobId } = request.params;

    if (!ObjectId.isValid(jobId)) {
        return reply.status(400).send({ error: "Invalid job ID format" });
    }

    // Verify job post exists
    const jobPost = await jobPosts.findOne({ _id: new ObjectId(jobId) });
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
                message: "You do not have access to this business",
            });
        }
    }

    const result = await applicants
        .find({ jobId, isActive: true })
        .sort({ createdAt: -1 })
        .toArray();

    return result;
}

// Update applicant (protected - admin only)
export async function updateApplicant(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");

    if (!applicants || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid applicant ID format" });
    }

    // Get the applicant to check business access
    const existingApplicant = await applicants.findOne({
        _id: new ObjectId(id),
    });
    if (!existingApplicant) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    // Check if admin has access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingApplicant.businessId),
            adminIds: request.user.id,
        });

        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this applicant's business",
            });
        }
    }

    const parseResult = updateApplicantSchema.safeParse(request.body);

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

    const result = await applicants.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
    );

    if (!result) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    return result;
}

// Move applicant to a different stage (protected)
export async function updateApplicantStage(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");
    const jobPosts = request.server.mongo.db?.collection("jobPosts");

    if (!applicants || !businesses || !jobPosts) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid applicant ID format" });
    }

    const existingApplicant = await applicants.findOne({
        _id: new ObjectId(id),
    });
    if (!existingApplicant) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingApplicant.businessId),
            adminIds: request.user.id,
        });

        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this applicant's business",
            });
        }
    }

    const parseResult = updateApplicantStageSchema.safeParse(request.body);

    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }

    const { stage } = parseResult.data;

    // Validate stage exists in the job post's stages
    const jobPost = await jobPosts.findOne({
        _id: new ObjectId(existingApplicant.jobId),
    });

    if (!jobPost) {
        return reply.status(404).send({ error: "Associated job post not found" });
    }

    const validStage = jobPost.stages.find((s: any) => s.id === stage);
    if (!validStage) {
        return reply.status(400).send({
            error: "Invalid stage",
            message: `Stage '${stage}' does not exist in this job post's pipeline`,
        });
    }

    const result = await applicants.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { stage, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
    );

    if (!result) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    return result;
}

// Hire applicant — convert to staff member (protected)
export async function hireApplicant(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");
    const jobPosts = request.server.mongo.db?.collection("jobPosts");
    const staffCollection = request.server.mongo.db?.collection("staff");

    if (!applicants || !businesses || !jobPosts || !staffCollection) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid applicant ID format" });
    }

    const applicant = await applicants.findOne({ _id: new ObjectId(id) });
    if (!applicant) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    // Check if already converted
    if (applicant.isStaffConverted) {
        return reply.status(409).send({
            error: "This applicant has already been converted to a staff member",
            staffId: applicant.staffId,
        });
    }

    // Check business access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(applicant.businessId),
            adminIds: request.user.id,
        });

        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this applicant's business",
            });
        }
    }

    // Validate hire input (salary, salaryType)
    const parseResult = hireApplicantSchema.safeParse(request.body);

    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }

    const { salary, salaryType } = parseResult.data;

    // Get the job post for position and employment type
    const jobPost = await jobPosts.findOne({
        _id: new ObjectId(applicant.jobId),
    });

    if (!jobPost) {
        return reply.status(404).send({ error: "Associated job post not found" });
    }

    // Get the business name for the email
    const business = await businesses.findOne({
        _id: new ObjectId(applicant.businessId),
    });

    // Check if email already exists in staff
    const existingStaff = await staffCollection.findOne({
        email: applicant.email,
        isActive: true,
    });
    if (existingStaff) {
        return reply.status(409).send({
            error: "A staff member with this email already exists",
        });
    }

    // Generate temporary password and hash it
    const tempPassword = generateTempPassword(applicant.firstName);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const now = new Date().toISOString();

    // Create the staff record
    const newStaff = {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        password: hashedPassword,
        phone: applicant.phone,
        position: jobPost.title,
        department: undefined,
        dateHired: now,
        salary,
        salaryType,
        employmentType: jobPost.employmentType,
        businessId: applicant.businessId,
        status: "active" as const,
        notes: `Hired from job application. Applicant ID: ${id}`,
        photoUrl: undefined,
        documents: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };

    const staffResult = await staffCollection.insertOne(newStaff);

    // Find the "hired" stage in the job post
    const hiredStage = jobPost.stages.find((s: any) => s.type === "hired");

    // Update the applicant record
    await applicants.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
            $set: {
                isStaffConverted: true,
                staffId: staffResult.insertedId.toString(),
                stage: hiredStage?.id || applicant.stage,
                updatedAt: now,
            },
        },
    );

    // Send welcome email via Gmail API
    try {
        const emailHtml = getApplicantHiredEmail(
            applicant.firstName,
            applicant.email,
            tempPassword,
            jobPost.title,
            business?.name || "Advanced Virtual Staff",
        );

        await request.server.gmail.sendEmail({
            to: applicant.email,
            subject: `🎉 Welcome to ${business?.name || "the Team"} — Your Account is Ready!`,
            body: emailHtml,
        });

        request.server.log.info(
            `Welcome email sent to ${applicant.email} for staff conversion`,
        );
    } catch (emailError) {
        // Log the error but don't fail the hire — staff is already created
        request.server.log.error(
            emailError,
            `Failed to send welcome email to ${applicant.email}`,
        );
    }

    return reply.status(201).send({
        message: "Applicant hired and staff member created successfully",
        staff: {
            _id: staffResult.insertedId,
            firstName: newStaff.firstName,
            lastName: newStaff.lastName,
            email: newStaff.email,
            position: newStaff.position,
            businessId: newStaff.businessId,
        },
        applicantId: id,
        temporaryPassword: tempPassword, // Return to admin for backup
    });
}

// Delete applicant (soft delete - protected)
export async function deleteApplicant(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
) {
    const applicants = request.server.mongo.db?.collection("applicants");
    const businesses = request.server.mongo.db?.collection("businesses");

    if (!applicants || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }

    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid applicant ID format" });
    }

    // Get the applicant to check business access
    const existingApplicant = await applicants.findOne({
        _id: new ObjectId(id),
    });
    if (!existingApplicant) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    // Check if admin has access (unless super-admin)
    if (request.user.role !== "super-admin") {
        const business = await businesses.findOne({
            _id: new ObjectId(existingApplicant.businessId),
            adminIds: request.user.id,
        });

        if (!business) {
            return reply.status(403).send({
                error: "Forbidden",
                message: "You do not have access to this applicant's business",
            });
        }
    }

    const result = await applicants.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
    );

    if (!result) {
        return reply.status(404).send({ error: "Applicant not found" });
    }

    return reply.status(200).send({ message: "Applicant deleted successfully" });
}
