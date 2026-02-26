import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  staffLoginSchema,
  staffChangePasswordSchema,
  type StaffLogin,
  type StaffChangePassword,
} from "../../types/staff.types.js";
import { getForgotPasswordEmail } from "../../utils/emails/auth/forgot.password.email.js";

// ── Forgot / Reset password schemas ──────────────────────────────────────────

const staffForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const staffResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z
    .string()
    .length(6, "Reset code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Reset code must contain only digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type StaffForgotPassword = z.infer<typeof staffForgotPasswordSchema>;
export type StaffResetPassword = z.infer<typeof staffResetPasswordSchema>;

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Staff login
export async function loginStaff(
  request: FastifyRequest<{ Body: StaffLogin }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");

  if (!staff) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = staffLoginSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { email, password } = parseResult.data;

  // Find staff member by email
  const staffMember = await staff.findOne({
    email,
    isActive: true,
    status: "active",
  });

  if (!staffMember) {
    return reply.status(401).send({ error: "Invalid email or password" });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, staffMember.password);

  if (!isValidPassword) {
    return reply.status(401).send({ error: "Invalid email or password" });
  }

  // Generate JWT token with staff-specific payload
  const token = request.server.jwt.sign({
    id: staffMember._id.toString(),
    email: staffMember.email,
    role: "staff",
    userType: "staff",
    businessId: staffMember.businessId,
  });

  // Remove password from response
  const { password: _, ...staffWithoutPassword } = staffMember;

  return {
    token,
    staff: {
      ...staffWithoutPassword,
      _id: staffMember._id.toString(),
    },
  };
}

// Get current staff (from JWT)
export async function getCurrentStaff(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");

  if (!staff) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID" });
  }

  const staffMember = await staff.findOne({ _id: new ObjectId(id) });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Remove password from response
  const { password, ...staffWithoutPassword } = staffMember;
  return staffWithoutPassword;
}

// Change staff password
export async function changeStaffPassword(
  request: FastifyRequest<{ Body: StaffChangePassword }>,
  reply: FastifyReply,
) {
  const staff = request.server.mongo.db?.collection("staff");

  if (!staff) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const { id } = request.user;

  if (!ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "Invalid staff ID" });
  }

  const parseResult = staffChangePasswordSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { currentPassword, newPassword } = parseResult.data;

  // Get current staff member
  const staffMember = await staff.findOne({ _id: new ObjectId(id) });

  if (!staffMember) {
    return reply.status(404).send({ error: "Staff member not found" });
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(
    currentPassword,
    staffMember.password,
  );

  if (!isValidPassword) {
    return reply.status(401).send({ error: "Current password is incorrect" });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await staff.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      },
    },
  );

  return { message: "Password changed successfully" };
}

// ── Forgot password ───────────────────────────────────────────────────────────

/**
 * POST /staff/forgot-password
 * Generates a 6-digit reset code, stores it (hashed) and sends it via Gmail.
 */
export async function forgotStaffPassword(
  request: FastifyRequest<{ Body: StaffForgotPassword }>,
  reply: FastifyReply,
) {
  const staffCol = request.server.mongo.db?.collection("staff");

  if (!staffCol) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = staffForgotPasswordSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { email } = parseResult.data;

  const staffMember = await staffCol.findOne({
    email,
    isActive: true,
    status: "active",
  });

  // Always return the same response to prevent email enumeration
  if (!staffMember) {
    return reply.status(200).send({
      message:
        "If an account with that email exists, a reset code has been sent.",
    });
  }

  const resetCode = generateResetCode();
  const hashedCode = await bcrypt.hash(resetCode, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await staffCol.updateOne(
    { _id: staffMember._id },
    {
      $set: {
        resetPasswordCode: hashedCode,
        resetPasswordExpiry: expiresAt.toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  );

  try {
    await request.server.gmail.sendEmail({
      to: email,
      subject: "Password Reset Code",
      body: getForgotPasswordEmail(
        staffMember.firstName as string,
        resetCode,
        "Staff",
      ),
    });
  } catch (err) {
    request.server.log.error(
      { err },
      "Failed to send staff forgot-password email",
    );
    return reply
      .status(500)
      .send({ error: "Failed to send reset email. Please try again later." });
  }

  return reply.status(200).send({
    message:
      "If an account with that email exists, a reset code has been sent.",
  });
}

/**
 * POST /staff/reset-password
 * Verifies the 6-digit code and updates the staff member's password.
 */
export async function resetStaffPassword(
  request: FastifyRequest<{ Body: StaffResetPassword }>,
  reply: FastifyReply,
) {
  const staffCol = request.server.mongo.db?.collection("staff");

  if (!staffCol) {
    return reply.status(500).send({ error: "Database not available" });
  }

  const parseResult = staffResetPasswordSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Validation failed",
      details: parseResult.error.errors,
    });
  }

  const { email, code, newPassword } = parseResult.data;

  const staffMember = await staffCol.findOne({
    email,
    isActive: true,
    status: "active",
  });

  if (
    !staffMember ||
    !staffMember.resetPasswordCode ||
    !staffMember.resetPasswordExpiry
  ) {
    return reply.status(400).send({ error: "Invalid or expired reset code." });
  }

  // Check expiry
  const expiry = new Date(staffMember.resetPasswordExpiry as string);
  if (Date.now() > expiry.getTime()) {
    await staffCol.updateOne(
      { _id: staffMember._id },
      { $unset: { resetPasswordCode: "", resetPasswordExpiry: "" } },
    );
    return reply
      .status(400)
      .send({ error: "Reset code has expired. Please request a new one." });
  }

  // Verify code
  const isValidCode = await bcrypt.compare(
    code,
    staffMember.resetPasswordCode as string,
  );

  if (!isValidCode) {
    return reply.status(400).send({ error: "Invalid reset code." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await staffCol.updateOne(
    { _id: staffMember._id },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        resetPasswordCode: "",
        resetPasswordExpiry: "",
      },
    },
  );

  return reply
    .status(200)
    .send({ message: "Password has been reset successfully." });
}
