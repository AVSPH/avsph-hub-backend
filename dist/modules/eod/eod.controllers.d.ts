import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface BusinessIdParams {
    businessId: string;
}
interface StaffIdParams {
    staffId: string;
}
interface EodQuery {
    businessId?: string;
    staffId?: string;
    status?: string;
    isApproved?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: string;
    limit?: string;
}
export declare function submitEod(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function editOwnEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function getMyEodReports(request: FastifyRequest<{
    Querystring: {
        startDate?: string;
        endDate?: string;
        status?: string;
    };
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getMyEodById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function getAllEodReports(request: FastifyRequest<{
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getEodByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<{
    data: {
        staffName?: string | undefined;
        staffEmail?: any;
        _id: ObjectId;
    }[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}>;
export declare function getEodByStaff(request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getEodById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function reviewEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function adminEditEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document> | null>;
export declare function deleteEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=eod.controllers.d.ts.map