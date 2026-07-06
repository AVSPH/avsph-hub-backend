import { ObjectId } from "@fastify/mongodb";
import { createLeadSchema, updateLeadSchema, } from "../../types/lead.types.js";
// Check whether the current user (unless super-admin) has access to a business
async function hasBusinessAccess(request, businessId) {
    if (request.user.role === "super-admin") {
        return true;
    }
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!businesses)
        return false;
    const business = await businesses.findOne({
        _id: new ObjectId(businessId),
        adminIds: request.user.id,
    });
    return !!business;
}
// Create a lead (public - from AVSPH contact form, no auth)
export async function createLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!leads || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = createLeadSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { businessId, firstName, lastName, email, phone, company, source, hp } = parseResult.data;
    // Honeypot: bots that fill this hidden field get a fake success, no DB write
    if (hp) {
        return reply.status(201).send({
            message: "Lead submitted successfully",
        });
    }
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    const business = await businesses.findOne({
        _id: new ObjectId(businessId),
        isActive: true,
    });
    if (!business) {
        return reply.status(400).send({ error: "Business not found" });
    }
    const now = new Date().toISOString();
    // Dedupe on {businessId, email} - resubmission updates the existing lead
    const existingLead = await leads.findOne({
        businessId,
        email,
        isActive: true,
    });
    if (existingLead) {
        const updated = await leads.findOneAndUpdate({ _id: existingLead._id }, {
            $set: {
                firstName,
                lastName,
                phone,
                company,
                source,
                updatedAt: now,
            },
        }, { returnDocument: "after" });
        return reply.status(200).send({
            message: "Lead updated successfully",
            lead: updated,
        });
    }
    const newLead = {
        businessId,
        firstName,
        lastName,
        email,
        phone,
        company,
        source,
        status: "new",
        notes: undefined,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
    const result = await leads.insertOne(newLead);
    return reply.status(201).send({
        message: "Lead submitted successfully",
        lead: { _id: result.insertedId, ...newLead },
    });
}
// Get leads by business (protected)
export async function getLeadsByBusiness(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    const businesses = request.server.mongo.db?.collection("businesses");
    if (!leads || !businesses) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { businessId } = request.params;
    const { search, page: pageStr, limit: limitStr, status } = request.query;
    const page = Math.max(1, parseInt(pageStr || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr || "10", 10)));
    const skip = (page - 1) * limit;
    if (!ObjectId.isValid(businessId)) {
        return reply.status(400).send({ error: "Invalid business ID format" });
    }
    if (!(await hasBusinessAccess(request, businessId))) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this business",
        });
    }
    const query = { businessId, isActive: true };
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { company: searchRegex },
        ];
    }
    if (status) {
        query.status = status;
    }
    const total = await leads.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const result = await leads
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    return {
        data: result,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        },
    };
}
// Get lead by ID (protected)
export async function getLeadById(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    const lead = await leads.findOne({ _id: new ObjectId(id) });
    if (!lead) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    if (!(await hasBusinessAccess(request, lead.businessId))) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this lead's business",
        });
    }
    return lead;
}
// Update lead (protected - status/notes/details)
export async function updateLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    const existingLead = await leads.findOne({ _id: new ObjectId(id) });
    if (!existingLead) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    if (!(await hasBusinessAccess(request, existingLead.businessId))) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this lead's business",
        });
    }
    const parseResult = updateLeadSchema.safeParse(request.body);
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
    const result = await leads.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateData }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return result;
}
// Delete lead (soft delete - protected)
export async function deleteLead(request, reply) {
    const leads = request.server.mongo.db?.collection("leads");
    if (!leads) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const { id } = request.params;
    if (!ObjectId.isValid(id)) {
        return reply.status(400).send({ error: "Invalid lead ID format" });
    }
    const existingLead = await leads.findOne({ _id: new ObjectId(id) });
    if (!existingLead) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    if (!(await hasBusinessAccess(request, existingLead.businessId))) {
        return reply.status(403).send({
            error: "Forbidden",
            message: "You do not have access to this lead's business",
        });
    }
    const result = await leads.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isActive: false, updatedAt: new Date().toISOString() } }, { returnDocument: "after" });
    if (!result) {
        return reply.status(404).send({ error: "Lead not found" });
    }
    return reply.status(200).send({ message: "Lead deleted successfully" });
}
//# sourceMappingURL=lead.controllers.js.map