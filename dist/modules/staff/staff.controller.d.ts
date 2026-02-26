import type { FastifyRequest, FastifyReply } from "fastify";
import { type UpdateStaffProfile, type AddStaffDocument } from "../../types/staff.types.js";
export declare function updateStaffProfile(request: FastifyRequest<{
    Body: UpdateStaffProfile;
}>, reply: FastifyReply): Promise<never>;
export declare function addStaffDocument(request: FastifyRequest<{
    Body: AddStaffDocument;
}>, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=staff.controller.d.ts.map