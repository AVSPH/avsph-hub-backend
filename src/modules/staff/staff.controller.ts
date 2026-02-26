import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import {
  updateStaffProfileSchema,
  addStaffDocumentSchema,
  type UpdateStaffProfile,
  type AddStaffDocument,
} from "../../types/staff.types.js";

// Update staff profile (firstName, lastName, phone — no email)
export async function updateStaffProfile(
  request: FastifyRequest<{ Body: UpdateStaffProfile }>,
  reply: FastifyReply,
) {
  const staffCol = request.server.mongo.db?.collection("staff");

  if (!staffCol) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID" });
  }

  const parseResult = updateStaffProfileSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const updates = parseResult.data;

  if (Object.keys(updates).length === 0) {
    return reply.status(400).send({ error: "No fields provided to update" });
  }

  const staffMember = await staffCol.findOne({ _id: new ObjectId(id) });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  await staffCol.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    },
  );

  const updated = await staffCol.findOne({ _id: new ObjectId(id) });

  if (!updated) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  const { password: _, ...staffWithoutPassword } = updated;
  return reply.status(200).send({
    message: "Profile updated successfully",
    staff: { ...staffWithoutPassword, _id: updated._id.toString() },
  });
}

// Add a document to staff profile via URL (e.g. Google Drive)
export async function addStaffDocument(
  request: FastifyRequest<{ Body: AddStaffDocument }>,
  reply: FastifyReply,
) {
  const staffCol = request.server.mongo.db?.collection("staff");

  if (!staffCol) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID" });
  }

  const parseResult = addStaffDocumentSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { name, url, type } = parseResult.data;

  const staffMember = await staffCol.findOne({ _id: new ObjectId(id) });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  const newDocument = {
    name,
    url,
    type,
    uploadedAt: new Date().toISOString(),
  };

  await staffCol.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: { documents: newDocument } as any,
      $set: { updatedAt: new Date().toISOString() },
    },
  );

  return reply.status(201).send({
    message: "Document added successfully",
    document: newDocument,
  });
}
