import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import bcrypt from "bcrypt";
import {
  createStaffSchema,
  updateStaffSchema,
} from "../../types/staff.types.js";

interface IdParams {
  id: string;
}

interface BusinessIdParams {
  businessId: string;
}

interface StaffQuery {
  businessId?: string;
  status?: string;
  employmentType?: string;
}

interface StaffByBusinessQuery {
  search?: string;
  page?: string;
  limit?: string;
  status?: string;
  employmentType?: string;
}

// Get all staff (protected - filtered by business access)
export async function getAllStaff(
  request: FastifyRequest<{ Querystring: StaffQuery }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
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

  // Filter by status if provided
  if (request.query.status) {
    query.status = request.query.status;
  }

  // Filter by employment type if provided
  if (request.query.employmentType) {
    query.employmentType = request.query.employmentType;
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

  const result = await staff.find(query).sort({ createdAt: -1 }).toArray();

  return result;
}

// Get staff by ID (protected)
export async function getStaffById(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  const staffMember = await staff.findOne({ _id: new ObjectId(id) });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(staffMember.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  return staffMember;
}

// Get staff by business (protected)
export async function getStaffByBusiness(
  request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: StaffByBusinessQuery;
  }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { businessId } = request.params;
  const {
    search,
    page: pageStr,
    limit: limitStr,
    status,
    employmentType,
  } = request.query;

  // Pagination defaults
  const page = Math.max(1, parseInt(pageStr || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || "10", 10)));
  const skip = (page - 1) * limit;

  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }
  }

  // Build query
  const query: any = { businessId, isActive: true };

  // Add search filter
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { position: searchRegex },
      { department: searchRegex },
    ];
  }

  // Add status filter
  if (status) {
    query.status = status;
  }

  // Add employment type filter
  if (employmentType) {
    query.employmentType = employmentType;
  }

  // Get total count for pagination
  const total = await staff.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Get paginated results
  const result = await staff
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

// Create staff member (protected - admin only)
export async function createStaff(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = createStaffSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    position,
    department,
    dateHired,
    salary,
    salaryType,
    employmentType,
    businessId,
  } = parseResult.data;

  // Validate business exists and admin has access
  if (!ObjectId.isValid(businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  const businessQuery: any = {
    _id: new ObjectId(businessId),
    isActive: true,
  };

  // Non-super-admins can only create staff in their businesses
  if (request.user.role !== "super-admin") {
    businessQuery.adminIds = request.user.id;
  }

  const business = await businesses.findOne(businessQuery);

  if (!business) {
    return reply
      .status(404)
      .send({ error: "Business not found or access denied" });
  }

  // Check if email already exists in this business
  const existingStaff = await staff.findOne({
    email,
    businessId,
    isActive: true,
  });
  if (existingStaff) {
    return reply
      .status(409)
      .send({
        error: "Staff member with this email already exists in this business",
      });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const now = new Date().toISOString();
  const newStaff = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    position,
    department,
    dateHired,
    salary,
    salaryType: salaryType || "monthly",
    employmentType: employmentType || "full-time",
    businessId,
    status: "active" as const,
    notes: undefined,
    photoUrl: undefined,
    documents: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await staff.insertOne(newStaff);

  // Remove password from response
  const { password: _, ...staffWithoutPassword } = newStaff;

  return reply.status(201).send({
    _id: result.insertedId,
    ...staffWithoutPassword,
  });
}

// Update staff member (protected - admin only)
export async function updateStaff(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  // Get the staff member to check business access
  const existingStaff = await staff.findOne({ _id: new ObjectId(id) });
  if (!existingStaff) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check if admin has access to the staff's business (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(existingStaff.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  const parseResult = updateStaffSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  // Check if email is being updated and if it conflicts
  if (
    parseResult.data.email &&
    parseResult.data.email !== existingStaff.email
  ) {
    const emailConflict = await staff.findOne({
      email: parseResult.data.email,
      businessId: existingStaff.businessId,
      _id: { $ne: new ObjectId(id) },
      isActive: true,
    });
    if (emailConflict) {
      return reply
        .status(409)
        .send({
          error: "Staff member with this email already exists in this business",
        });
    }
  }

  const updateData = {
    ...parseResult.data,
    updatedAt: new Date().toISOString(),
  };

  const result = await staff.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  return result;
}

// Delete staff member (soft delete - protected)
export async function deleteStaff(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  // Get the staff member to check business access
  const existingStaff = await staff.findOne({ _id: new ObjectId(id) });
  if (!existingStaff) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check if admin has access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(existingStaff.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  const result = await staff.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  return reply
    .status(200)
    .send({ message: "Staff member deleted successfully" });
}

// Upload staff photo (protected)
export async function uploadStaffPhoto(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  // Check if staff exists
  const staffMember = await staff.findOne({ _id: new ObjectId(id) });
  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(staffMember.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  try {
    // Get the uploaded file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    // Validate file type (images only)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF",
      });
    }

    // Convert file stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to Cloudinary
    const uploadResult = await request.server.uploadToCloudinary(fileBuffer, {
      folder: `staff/${staffMember.businessId}/${id}`,
      public_id: `photo_${Date.now()}`,
      resource_type: "image",
    });

    // Update staff with photo URL
    const result = await staff.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          photoUrl: uploadResult.secure_url,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

    return reply.status(200).send({
      message: "Photo uploaded successfully",
      photoUrl: uploadResult.secure_url,
      staff: result,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({
      error: "Failed to upload photo",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Upload staff document (protected)
export async function uploadStaffDocument(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!staff || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  // Check if staff exists
  const staffMember = await staff.findOne({ _id: new ObjectId(id) });
  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Check business access (unless super-admin)
  if (request.user.role !== "super-admin") {
    const business = await businesses.findOne({
      _id: new ObjectId(staffMember.businessId),
      adminIds: request.user.id,
    });

    if (!business) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this staff member's business",
      });
    }
  }

  try {
    // Get the uploaded file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    // Validate file type (documents and images)
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        error: "Invalid file type. Allowed types: PDF, DOC, DOCX, JPEG, PNG",
      });
    }

    // Convert file stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload to Cloudinary
    const uploadResult = await request.server.uploadToCloudinary(fileBuffer, {
      folder: `staff/${staffMember.businessId}/${id}/documents`,
      public_id: `doc_${Date.now()}`,
      resource_type: "auto",
    });

    const newDocument = {
      name: data.filename || `document_${Date.now()}`,
      url: uploadResult.secure_url,
      type: data.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    // Update staff with new document
    const result = await staff.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: { documents: newDocument } as any,
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    return reply.status(200).send({
      message: "Document uploaded successfully",
      document: newDocument,
      staff: result,
    });
  } catch (error) {
    request.server.log.error(error);
    return reply.status(500).send({
      error: "Failed to upload document",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
