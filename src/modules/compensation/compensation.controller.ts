import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import {
  createCompensationProfileSchema,
  updateCompensationProfileSchema,
  updateStaffStatutorySettingsSchema,
} from "../../types/compensation-profile.types.js";

interface IdParams {
  id: string;
}

interface StaffIdParams {
  staffId: string;
}

interface CompensationQuery {
  businessId?: string;
  profileScope?: "position" | "staff";
  staffId?: string;
  jobPosition?: string;
  isActive?: string;
}

async function canAccessBusiness(
  request: FastifyRequest,
  businessId: string,
): Promise<boolean> {
  if (request.user.role === "super-admin") {
    return true;
  }

  const businesses = request.server.mongo.db?.collection("businesses");
  if (!businesses) {
    return false;
  }

  const business = await businesses.findOne({
    _id: new ObjectId(businessId),
    adminIds: request.user.id,
    isActive: true,
  });

  return !!business;
}

export async function createCompensationProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const profiles = request.server.mongo.db?.collection("compensation_profiles");
  const staffCollection = request.server.mongo.db?.collection("staff");

  if (!profiles || !staffCollection) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = createCompensationProfileSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const payload = parseResult.data;

  if (!ObjectId.isValid(payload.businessId)) {
    return reply.status(400).send({ error: "Invalid business ID format" });
  }

  const hasAccess = await canAccessBusiness(request, payload.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  if (payload.profileScope === "staff") {
    if (!payload.staffId || !ObjectId.isValid(payload.staffId)) {
      return reply
        .status(400)
        .send({ error: "Valid staffId is required for staff profiles" });
    }

    const staff = await staffCollection.findOne({
      _id: new ObjectId(payload.staffId),
      businessId: payload.businessId,
      isActive: true,
    });

    if (!staff) {
      return reply.status(404).send({
        error: "Staff member not found in this business",
      });
    }
  }

  const now = new Date().toISOString();
  const doc = {
    ...payload,
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await profiles.insertOne(doc);

  return reply.status(201).send({
    _id: result.insertedId,
    ...doc,
    message: "Compensation profile created successfully",
  });
}

export async function updateCompensationProfile(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  const profiles = request.server.mongo.db?.collection("compensation_profiles");
  if (!profiles) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.params;
  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid profile ID format" });
  }

  const parseResult = updateCompensationProfileSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const updates = parseResult.data;

  const existingProfile = await profiles.findOne({
    _id: new ObjectId(id),
    isActive: true,
  });

  if (!existingProfile) {
    return reply.status(404).send({ error: "Compensation profile not found" });
  }

  const hasAccess = await canAccessBusiness(request, existingProfile.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this business",
    });
  }

  if (
    updates.businessId &&
    updates.businessId !== existingProfile.businessId
  ) {
    return reply.status(400).send({
      error: "Business ID cannot be changed",
    });
  }

  const result = await profiles.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  );

  return {
    ...result,
    message: "Compensation profile updated successfully",
  };
}

export async function getCompensationProfiles(
  request: FastifyRequest<{ Querystring: CompensationQuery }>,
  reply: FastifyReply,
) {
  const profiles = request.server.mongo.db?.collection("compensation_profiles");
  const businesses = request.server.mongo.db?.collection("businesses");

  if (!profiles || !businesses) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const query: Record<string, unknown> = {};

  if (request.query.businessId) {
    if (!ObjectId.isValid(request.query.businessId)) {
      return reply.status(400).send({ error: "Invalid business ID format" });
    }

    const hasAccess = await canAccessBusiness(request, request.query.businessId);
    if (!hasAccess) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "You do not have access to this business",
      });
    }

    query.businessId = request.query.businessId;
  } else if (request.user.role !== "super-admin") {
    const accessibleBusinesses = await businesses
      .find({ adminIds: request.user.id, isActive: true })
      .project({ _id: 1 })
      .toArray();

    const businessIds = accessibleBusinesses.map((b) => b._id.toString());
    query.businessId = { $in: businessIds };
  }

  if (request.query.profileScope) {
    query.profileScope = request.query.profileScope;
  }

  if (request.query.staffId) {
    query.staffId = request.query.staffId;
  }

  if (request.query.jobPosition) {
    query.jobPosition = request.query.jobPosition;
  }

  if (request.query.isActive !== undefined) {
    query.isActive = request.query.isActive === "true";
  }

  const result = await profiles
    .find(query)
    .sort({ updatedAt: -1, effectiveFrom: -1 })
    .toArray();

  return result;
}

export async function updateStaffStatutorySettings(
  request: FastifyRequest<{ Params: StaffIdParams }>,
  reply: FastifyReply,
) {
  const profiles = request.server.mongo.db?.collection("compensation_profiles");
  const staffCollection = request.server.mongo.db?.collection("staff");

  if (!profiles || !staffCollection) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { staffId } = request.params;
  if (!ObjectId.isValid(staffId)) {
    return reply.status(400).send({ error: "Invalid staff ID format" });
  }

  const parseResult = updateStaffStatutorySettingsSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const staffMember = await staffCollection.findOne({
    _id: new ObjectId(staffId),
    isActive: true,
  });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  const hasAccess = await canAccessBusiness(request, staffMember.businessId);
  if (!hasAccess) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "You do not have access to this staff member's business",
    });
  }

  const latestStaffProfile = await profiles
    .find({
      businessId: staffMember.businessId,
      profileScope: "staff",
      staffId,
      isActive: true,
    })
    .sort({ updatedAt: -1, effectiveFrom: -1 })
    .limit(1)
    .toArray();

  const now = new Date().toISOString();
  const settings = parseResult.data;

  if (latestStaffProfile.length > 0) {
    const result = await profiles.findOneAndUpdate(
      { _id: latestStaffProfile[0]._id },
      {
        $set: {
          ...settings,
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    return {
      ...result,
      message: "Staff statutory settings updated successfully",
    };
  }

  const effectiveFrom = now.split("T")[0];
  const newProfile = {
    name: `${staffMember.firstName} ${staffMember.lastName} Statutory Settings`,
    businessId: staffMember.businessId,
    profileScope: "staff" as const,
    jobPosition: staffMember.position || "Unassigned",
    staffId,
    hourlyRate: staffMember.salary || 0,

    overtimeRateMultiplier: 1,
    sundayRateMultiplier: 1,
    nightDifferentialRateMultiplier: 1,
    isRiceAllowanceEligible: false,
    riceAllowanceFixedAmount: 0,

    isSssEnabled: settings.isSssEnabled ?? false,
    isPagIbigEnabled: settings.isPagIbigEnabled ?? false,
    isPhilHealthEnabled: settings.isPhilHealthEnabled ?? false,
    sssDeductionFixedAmount: settings.sssDeductionFixedAmount ?? 0,
    pagIbigDeductionFixedAmount: settings.pagIbigDeductionFixedAmount ?? 0,
    philHealthDeductionFixedAmount: settings.philHealthDeductionFixedAmount ?? 0,

    effectiveFrom,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await profiles.insertOne(newProfile);

  return reply.status(201).send({
    _id: result.insertedId,
    ...newProfile,
    message: "Staff statutory settings created successfully",
  });
}

