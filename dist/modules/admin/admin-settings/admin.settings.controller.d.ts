import type { FastifyRequest, FastifyReply } from "fastify";
import type { UpdateAdminProfile, UpdateAdminEmail, UpdateAdminPassword } from "../../../types/admin.types.js";
export declare function updateAdminProfile(request: FastifyRequest<{
    Body: UpdateAdminProfile;
}>, reply: FastifyReply): Promise<never>;
export declare function updateAdminEmail(request: FastifyRequest<{
    Body: UpdateAdminEmail;
}>, reply: FastifyReply): Promise<never>;
export declare function updateAdminPassword(request: FastifyRequest<{
    Body: UpdateAdminPassword;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=admin.settings.controller.d.ts.map