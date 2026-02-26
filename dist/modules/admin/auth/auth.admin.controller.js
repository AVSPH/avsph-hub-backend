import bcrypt from "bcrypt";
import { z } from "zod";
import { getForgotPasswordEmail } from "../../../utils/emails/auth/forgot.password.email.js";
// ── Zod schemas ────────────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z
        .string()
        .length(6, "Reset code must be exactly 6 digits")
        .regex(/^\d{6}$/, "Reset code must contain only digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
// ── Helpers ────────────────────────────────────────────────────────────────────
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// ── Controllers ────────────────────────────────────────────────────────────────
/**
 * POST /admin/forgot-password
 * Generates a 6-digit reset code, stores it (hashed) in the DB and sends it
 * to the admin's email via the Gmail plugin.
 */
export async function forgotPassword(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = forgotPasswordSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { email } = parseResult.data;
    const admin = await admins.findOne({ email, isActive: true });
    // Always return the same response to prevent email enumeration
    if (!admin) {
        return reply.status(200).send({
            message: "If an account with that email exists, a reset code has been sent.",
        });
    }
    const resetCode = generateResetCode();
    const hashedCode = await bcrypt.hash(resetCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await admins.updateOne({ _id: admin._id }, {
        $set: {
            resetPasswordCode: hashedCode,
            resetPasswordExpiry: expiresAt.toISOString(),
            updatedAt: new Date().toISOString(),
        },
    });
    try {
        await request.server.gmail.sendEmail({
            to: email,
            subject: "Password Reset Code",
            body: getForgotPasswordEmail(admin.firstName, resetCode),
        });
    }
    catch (err) {
        request.server.log.error({ err }, "Failed to send forgot-password email");
        return reply
            .status(500)
            .send({ error: "Failed to send reset email. Please try again later." });
    }
    return reply.status(200).send({
        message: "If an account with that email exists, a reset code has been sent.",
    });
}
/**
 * POST /admin/reset-password
 * Verifies the 6-digit code and updates the admin's password.
 */
export async function resetPassword(request, reply) {
    const admins = request.server.mongo.db?.collection("admins");
    if (!admins) {
        return reply.status(500).send({ error: "Database not available" });
    }
    const parseResult = resetPasswordSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            error: "Validation failed",
            details: parseResult.error.errors,
        });
    }
    const { email, code, newPassword } = parseResult.data;
    const admin = await admins.findOne({ email, isActive: true });
    if (!admin || !admin.resetPasswordCode || !admin.resetPasswordExpiry) {
        return reply.status(400).send({ error: "Invalid or expired reset code." });
    }
    // Check expiry
    const expiry = new Date(admin.resetPasswordExpiry);
    if (Date.now() > expiry.getTime()) {
        // Clean up expired code
        await admins.updateOne({ _id: admin._id }, { $unset: { resetPasswordCode: "", resetPasswordExpiry: "" } });
        return reply
            .status(400)
            .send({ error: "Reset code has expired. Please request a new one." });
    }
    // Verify code
    const isValidCode = await bcrypt.compare(code, admin.resetPasswordCode);
    if (!isValidCode) {
        return reply.status(400).send({ error: "Invalid reset code." });
    }
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admins.updateOne({ _id: admin._id }, {
        $set: {
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
        },
        $unset: {
            resetPasswordCode: "",
            resetPasswordExpiry: "",
        },
    });
    return reply
        .status(200)
        .send({ message: "Password has been reset successfully." });
}
//# sourceMappingURL=auth.admin.controller.js.map