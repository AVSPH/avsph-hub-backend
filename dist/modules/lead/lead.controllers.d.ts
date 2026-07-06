import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface BusinessIdParams {
    businessId: string;
}
interface LeadsByBusinessQuery {
    search?: string;
    page?: string;
    limit?: string;
    status?: string;
}
export declare function createLead(request: FastifyRequest<{
    Body: unknown;
}>, reply: FastifyReply): Promise<never>;
export declare function getLeadsByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: LeadsByBusinessQuery;
}>, reply: FastifyReply): Promise<{
    data: import("mongodb").WithId<import("bson").Document>[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}>;
export declare function getLeadById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateLead(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteLead(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=lead.controllers.d.ts.map