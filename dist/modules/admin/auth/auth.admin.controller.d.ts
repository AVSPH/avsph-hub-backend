import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    email: string;
    newPassword: string;
}, {
    code: string;
    email: string;
    newPassword: string;
}>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
/**
 * POST /admin/forgot-password
 * Generates a 6-digit reset code, stores it (hashed) in the DB and sends it
 * to the admin's email via the Gmail plugin.
 */
export declare function forgotPassword(request: FastifyRequest<{
    Body: ForgotPasswordRequest;
}>, reply: FastifyReply): Promise<never>;
/**
 * POST /admin/reset-password
 * Verifies the 6-digit code and updates the admin's password.
 */
export declare function resetPassword(request: FastifyRequest<{
    Body: ResetPasswordRequest;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=auth.admin.controller.d.ts.map