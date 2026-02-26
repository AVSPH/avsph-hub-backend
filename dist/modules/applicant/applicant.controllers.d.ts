import type { FastifyRequest, FastifyReply } from "fastify";
interface IdParams {
    id: string;
}
interface JobIdParams {
    jobId: string;
}
interface ApplicantQuery {
    businessId?: string;
    jobId?: string;
    stage?: string;
}
export declare function getAllApplicants(request: FastifyRequest<{
    Querystring: ApplicantQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getApplicantById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function getApplicantsByJob(request: FastifyRequest<{
    Params: JobIdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function updateApplicant(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateApplicantStage(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function hireApplicant(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function deleteApplicant(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=applicant.controllers.d.ts.map