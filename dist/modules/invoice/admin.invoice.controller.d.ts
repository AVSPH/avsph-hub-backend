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
interface InvoiceQuery {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: string;
    limit?: string;
}
export declare function generateInvoice(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function generateBusinessInvoices(request: FastifyRequest<{
    Params: BusinessIdParams;
}>, reply: FastifyReply): Promise<{
    generated: any[];
    skipped: any[];
    errors: any[];
    message: string;
    summary: {
        total: number;
        generated: number;
        skipped: number;
        errors: number;
    };
}>;
export declare function recalculateInvoice(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    recalculation: {
        previousHoursWorked: any;
        newHoursWorked: number;
        previousPay: any;
        newPay: number;
        eodsAdded: number;
        eodsRemoved: number;
    };
    _id?: ObjectId | undefined;
}>;
export declare function getAllInvoices(request: FastifyRequest<{
    Querystring: InvoiceQuery & {
        businessId?: string;
        staffId?: string;
    };
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getInvoiceById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    staff: {
        firstName: any;
        lastName: any;
        email: any;
        position: any;
    } | null;
    eodReports: import("mongodb").WithId<import("bson").Document>[];
    _id: ObjectId;
}>;
export declare function getInvoicesByBusiness(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: InvoiceQuery;
}>, reply: FastifyReply): Promise<{
    data: {
        staffName?: string | undefined;
        staffEmail?: any;
        staffPosition?: any;
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
export declare function getInvoicesByStaff(request: FastifyRequest<{
    Params: StaffIdParams;
    Querystring: InvoiceQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function approveInvoice(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function markInvoicePaid(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function addInvoiceAdjustment(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function removeInvoiceAdjustment(request: FastifyRequest<{
    Params: IdParams;
    Body: {
        type: "deduction" | "addition";
        index: number;
    };
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function deleteInvoice(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=admin.invoice.controller.d.ts.map