import type { FastifyRequest, FastifyReply } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
export declare function getMyInvoices(request: FastifyRequest<{
    Querystring: {
        status?: string;
        startDate?: string;
        endDate?: string;
    };
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getMyInvoiceById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    eodReports: import("bson").Document[];
    _id: ObjectId;
}>;
export {};
//# sourceMappingURL=staff.invoice.controller.d.ts.map