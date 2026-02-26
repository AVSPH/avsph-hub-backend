import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface JobPostQuery {
    businessId?: string;
    status?: string;
}
export declare function getAllJobPosts(request: FastifyRequest<{
    Querystring: JobPostQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[] | {
    applicantCount: number;
    _id: ObjectId;
}[]>;
export declare function getJobPostById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    applicantCount: number;
    _id: ObjectId;
}>;
export declare function createJobPost(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function updateJobPost(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateJobPostStatus(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function deleteJobPost(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<never>;
export declare function getPublicJobPosts(request: FastifyRequest<{
    Querystring: {
        businessId: string;
    };
}>, reply: FastifyReply): Promise<{
    _id: ObjectId;
    title: any;
    description: any;
    requirements: any;
    employmentType: any;
    businessId: any;
    businessName: any;
    createdAt: any;
}[]>;
export declare function getPublicJobPostById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    _id: ObjectId;
    title: any;
    description: any;
    requirements: any;
    employmentType: any;
    businessId: any;
    businessName: any;
    createdAt: any;
}>;
export declare function submitPublicApplication(request: FastifyRequest<{
    Params: {
        jobId: string;
    };
}>, reply: FastifyReply): Promise<never>;
export {};
//# sourceMappingURL=jobPost.controllers.d.ts.map