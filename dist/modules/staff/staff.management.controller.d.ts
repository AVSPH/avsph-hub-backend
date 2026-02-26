import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface BusinessIdParams {
    businessId: string;
}
interface StaffQuery {
    businessId?: string;
    status?: string;
    employmentType?: string;
}
interface StaffByBusinessQuery {
    search?: string;
    page?: string;
    limit?: string;
    status?: string;
    employmentType?: string;
}
export declare function getAllStaff(request: FastifyRequest<{
    Querystring: StaffQuery;
}>, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}[]>;
export declare function getStaffById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}>;
export declare function getStaffByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: StaffByBusinessQuery;
}>, reply: FastifyReply): Promise<{
    data: {
        [key: string]: any;
        _id: ObjectId;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}>;
export declare function createStaff(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateStaff(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}>;
export declare function deleteStaff(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function uploadStaffPhoto(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function uploadStaffDocument(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=staff.management.controller.d.ts.map