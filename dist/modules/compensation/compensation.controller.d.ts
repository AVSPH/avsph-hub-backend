import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface StaffIdParams {
    staffId: string;
}
interface CompensationQuery {
    businessId?: string;
    isActive?: string;
}
export declare function createCompensationProfile(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateCompensationProfile(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function getCompensationProfiles(request: FastifyRequest<{
    Querystring: CompensationQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function updateStaffStatutorySettings(request: FastifyRequest<{
    Params: StaffIdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export {};
//# sourceMappingURL=compensation.controller.d.ts.map