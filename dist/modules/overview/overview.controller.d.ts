import type { FastifyReply, FastifyRequest } from "fastify";
interface BusinessIdParams {
    businessId: string;
}
interface RecentQuery {
    limit?: string;
}
export declare function getBusinessOverviewStats(request: FastifyRequest<{
    Params: BusinessIdParams;
}>, reply: FastifyReply): Promise<{
    businessId: string;
    totalStaff: number;
    openPositions: number;
    recentEods7d: number;
    pendingEodApprovals: number;
    updatedAt: string;
} | undefined>;
export declare function getRecentBusinessInvoices(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RecentQuery;
}>, reply: FastifyReply): Promise<{
    data: import("bson").Document[];
    total: number;
    limit: number;
} | undefined>;
export declare function getRecentBusinessEods(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RecentQuery;
}>, reply: FastifyReply): Promise<{
    data: import("bson").Document[];
    total: number;
    limit: number;
} | undefined>;
export {};
//# sourceMappingURL=overview.controller.d.ts.map