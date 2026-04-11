import type { FastifyRequest, FastifyReply } from "fastify";
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
export declare function resolveDatePeriod(periodType?: string, referenceDate?: string, startDate?: string, endDate?: string): {
    periodStart: string;
    periodEnd: string;
};
export declare function getMyExpectedEarnings(request: FastifyRequest<{
    Querystring: {
        periodStart?: string;
        periodEnd?: string;
    };
}>, reply: FastifyReply): Promise<any>;
export declare function submitEod(request: FastifyRequest, reply: FastifyReply): Promise<any>;
export declare function editOwnEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function getMyEodReports(request: FastifyRequest<{
    Querystring: {
        startDate?: string;
        endDate?: string;
        status?: string;
        page?: string;
        limit?: string;
    };
}>, reply: FastifyReply): Promise<any>;
export declare function getMyEodById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function getAllEodReports(request: FastifyRequest<{
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<any>;
export declare function getEodByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<any>;
export declare function getEodByStaff(request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: EodQuery;
}>, reply: FastifyReply): Promise<any>;
export declare function getEodById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function reviewEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function adminEditEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function deleteEod(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<any>;
export declare function getEodSummaryByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: {
        periodType?: string;
        referenceDate?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        status?: string;
        isApproved?: string;
        page?: string;
        limit?: string;
    };
}>, reply: FastifyReply): Promise<any>;
export {};
//# sourceMappingURL=eod.controllers.d.ts.map