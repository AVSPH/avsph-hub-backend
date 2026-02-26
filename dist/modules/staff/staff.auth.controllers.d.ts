import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
import { z } from "zod";
import { type StaffLogin, type StaffChangePassword } from "../../types/staff.types.js";
declare const staffForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
declare const staffResetPasswordSchema: z.ZodObject<{
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
export type StaffForgotPassword = z.infer<typeof staffForgotPasswordSchema>;
export type StaffResetPassword = z.infer<typeof staffResetPasswordSchema>;
export declare function loginStaff(request: FastifyRequest<{
    Body: StaffLogin;
}>, reply: FastifyReply): Promise<{
    token: string;
    staff: {
        _id: string;
    };
}>;
export declare function getCurrentStaff(request: FastifyRequest, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}>;
export declare function changeStaffPassword(request: FastifyRequest<{
    Body: StaffChangePassword;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
/**
 * POST /staff/forgot-password
 * Generates a 6-digit reset code, stores it (hashed) and sends it via Gmail.
 */
export declare function forgotStaffPassword(request: FastifyRequest<{
    Body: StaffForgotPassword;
}>, reply: FastifyReply): Promise<never>;
/**
 * POST /staff/reset-password
 * Verifies the 6-digit code and updates the staff member's password.
 */
export declare function resetStaffPassword(request: FastifyRequest<{
    Body: StaffResetPassword;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=staff.auth.controllers.d.ts.map