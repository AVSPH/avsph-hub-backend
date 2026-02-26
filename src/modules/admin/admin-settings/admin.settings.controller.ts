import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import bcrypt from "bcrypt";
import {
  updateAdminProfileSchema,
  updateAdminEmailSchema,
  updateAdminPasswordSchema,
} from "../../../types/admin.types.js";
import type {
  UpdateAdminProfile,
  UpdateAdminEmail,
  UpdateAdminPassword,
} from "../../../types/admin.types.js";

// PATCH /admin/settings/profile – update firstName and/or lastName
export async function updateAdminProfile(
  request: FastifyRequest<{ Body: UpdateAdminProfile }>,
  reply: FastifyReply,
) {
  const admins = request.server.mongo.db?.collection("admins");

  if (!admins) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = updateAdminProfileSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid admin ID" });
  }

  const { firstName, lastName } = parseResult.data;

  const updateFields: Record<string, string> = {
    updatedAt: new Date().toISOString(),
  };
  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;

  const result = await admins.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateFields },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Admin not found" });
  }

  const { password, ...adminWithoutPassword } = result;
  return reply.status(200).send({
    message: "Profile updated successfully",
    admin: { ...adminWithoutPassword, _id: result._id.toString() },
  });
}

// PATCH /admin/settings/email – update email (requires current password)
export async function updateAdminEmail(
  request: FastifyRequest<{ Body: UpdateAdminEmail }>,
  reply: FastifyReply,
) {
  const admins = request.server.mongo.db?.collection("admins");

  if (!admins) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = updateAdminEmailSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid admin ID" });
  }

  const { email, currentPassword } = parseResult.data;

  const admin = await admins.findOne({ _id: new ObjectId(id) });

  if (!admin) {
    return reply.status(404).send({ error: "Admin not found" });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, admin.password);

  if (!isValidPassword) {
    return reply.status(401).send({ error: "Current password is incorrect" });
  }

  // Check if email is already taken by another admin
  const existing = await admins.findOne({
    email,
    _id: { $ne: new ObjectId(id) },
  });

  if (existing) {
    return reply.status(409).send({ error: "Email is already in use" });
  }

  const result = await admins.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { email, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );

  if (!result) {
    return reply.status(404).send({ error: "Admin not found" });
  }

  const { password, ...adminWithoutPassword } = result;
  return reply.status(200).send({
    message: "Email updated successfully",
    admin: { ...adminWithoutPassword, _id: result._id.toString() },
  });
}

// PATCH /admin/settings/password – change password
export async function updateAdminPassword(
  request: FastifyRequest<{ Body: UpdateAdminPassword }>,
  reply: FastifyReply,
) {
  const admins = request.server.mongo.db?.collection("admins");

  if (!admins) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = updateAdminPasswordSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid admin ID" });
  }

  const { currentPassword, newPassword } = parseResult.data;

  const admin = await admins.findOne({ _id: new ObjectId(id) });

  if (!admin) {
    return reply.status(404).send({ error: "Admin not found" });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, admin.password);

  if (!isValidPassword) {
    return reply.status(401).send({ error: "Current password is incorrect" });
  }

  const isSamePassword = await bcrypt.compare(newPassword, admin.password);

  if (isSamePassword) {
    return reply
      .status(400)
      .send({ error: "New password must differ from the current password" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await admins.updateOne(
    { _id: new ObjectId(id) },
    { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } },
  );

  return reply.status(200).send({ message: "Password updated successfully" });
}
