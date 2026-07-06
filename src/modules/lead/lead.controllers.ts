import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import {
  createLeadSchema,
  updateLeadSchema,
  bulkLeadActionSchema,
} from "../../types/lead.types.js";

interface IdParams {
  id: string;
}

interface BusinessIdParams {
  businessId: string;
}

interface LeadsByBusinessQuery {
  search?: string;
  page?: string;
  limit?: string;
  status?: string;
  source?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Max rows a single CSV export request will return
const EXPORT_CAP = 5000;

// Build the Mongo filter shared by the list + export endpoints
function buildLeadQuery(
  businessId: string,
  q: Omit<LeadsByBusinessQuery, "page" | "limit">,
): Record<string, unknown> {
  const query: Record<string, unknown> = { businessId, isActive: true };

  if (q.search && q.search.trim()) {
    const searchRegex = new RegExp(q.search.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
    ];
  }

  if (q.status) query.status = q.status;
  if (q.source) query.source = q.source;

  if (q.tags && q.tags.trim()) {
    const tags = q.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length) query.tags = { $in: tags };
  }

  if (q.dateFrom || q.dateTo) {
    const createdAt: Record<string, string> = {};
    if (q.dateFrom) createdAt.$gte = q.dateFrom;
    if (q.dateTo) createdAt.$lte = q.dateTo;
    query.createdAt = createdAt;
  }

  return query;
}

// Check whether the current user (unless super-admin) has access to a business
async function hasBusinessAccess(
  request: FastifyRequest,
  businessId: string,
): Promise<boolean> {
  if (request.user.role === "super-admin") {
    return true;
  }

  const businesses = request.server.mongo.db?.collection("businesses");
  if (!businesses) return false;

  const business = await businesses.findOne({
    _id: new ObjectId(businessId),
    adminIds: request.user.id,
  });

  return !!business;
}

// Create a lead (public - from AVSPH contact form, no auth)
export async function createLead(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply,
) {
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

  const { businessId, firstName, lastName, email, phone, company, source, notes, hp } =
    parseResult.data;

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
    const updated = await leads.findOneAndUpdate(
      { _id: existingLead._id },
      {
        $set: {
          firstName,
          lastName,
          phone,
          company,
          source,
          ...(notes !== undefined && { notes }),
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

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
    status: "new" as const,
    notes,
    tags: [] as string[],
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
export async function getLeadsByBusiness(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: LeadsByBusinessQuery;
  }>,
  reply: FastifyReply,
) {
  const leads = request.server.mongo.db?.collection("leads");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!leads || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const { page: pageStr, limit: limitStr, ...filters } = request.query;

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

  const query = buildLeadQuery(businessId, filters);

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
export async function getLeadById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
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
export async function updateLead(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
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

  const result = await leads.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Lead not found" });
  }

  return result;
}

// Delete lead (soft delete - protected)
export async function deleteLead(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
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

  const result = await leads.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Lead not found" });
  }

  return reply.status(200).send({ message: "Lead deleted successfully" });
}

// Get distinct tags used across a business's leads (protected)
export async function getLeadTags(
  request: FastifyRequest<{ Params: BusinessIdParams }>,
  reply: FastifyReply,
) {
  const leads = request.server.mongo.db?.collection("leads");

  if (!leads) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  if (!(await hasBusinessAccess(request, businessId))) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const tags = (await leads.distinct("tags", {
    businessId,
    isActive: true,
  })) as string[];

  return { tags: tags.filter(Boolean).sort((a, b) => a.localeCompare(b)) };
}

// Export all matching leads (protected) - JSON, capped, frontend builds CSV
export async function exportLeads(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: LeadsByBusinessQuery;
  }>,
  reply: FastifyReply,
) {
  const leads = request.server.mongo.db?.collection("leads");

  if (!leads) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  if (!(await hasBusinessAccess(request, businessId))) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const query = buildLeadQuery(businessId, request.query);

  const total = await leads.countDocuments(query);
  const data = await leads
    .find(query)
    .sort({ createdAt: -1 })
    .limit(EXPORT_CAP)
    .toArray();

  return { data, truncated: total > EXPORT_CAP, total };
}

// Bulk action on leads within a business (protected)
export async function bulkLeads(
  request: FastifyRequest<{ Params: BusinessIdParams; Body: unknown }>,
  reply: FastifyReply,
) {
  const leads = request.server.mongo.db?.collection("leads");

  if (!leads) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  if (!(await hasBusinessAccess(request, businessId))) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  const parseResult = bulkLeadActionSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { ids, action, value, tags } = parseResult.data;

  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (!objectIds.length) {
    return reply.status(400).send({ error: "No valid lead IDs provided" });
  }

  // Scope every write to this business so ids from another business are ignored
  const filter = { _id: { $in: objectIds }, businessId, isActive: true };
  const now = new Date().toISOString();

  let update: Record<string, unknown>;
  switch (action) {
    case "status":
      update = { $set: { status: value, updatedAt: now } };
      break;
    case "addTags":
      update = {
        $addToSet: { tags: { $each: tags } },
        $set: { updatedAt: now },
      };
      break;
    case "removeTags":
      update = { $pull: { tags: { $in: tags } }, $set: { updatedAt: now } };
      break;
    case "delete":
      update = { $set: { isActive: false, updatedAt: now } };
      break;
    default:
      return reply.status(400).send({ error: "Unknown action" });
  }

  const result = await leads.updateMany(filter, update);

  return { modified: result.modifiedCount };
}
