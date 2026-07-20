import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "@fastify/mongodb";
interface IdParams {
    id: string;
}
interface ClientQuery {
    businessId?: string;
    status?: string;
    isActive?: string;
}
interface WeeklyReportQuery {
    from?: string;
    to?: string;
}
export declare function createClient(request: FastifyRequest, reply: FastifyReply): Promise<never>;
export declare function getClients(request: FastifyRequest<{
    Querystring: ClientQuery;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getClientById(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function updateClient(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
    _id?: ObjectId | undefined;
}>;
export declare function deleteClient(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export declare function getClientStaff(request: FastifyRequest<{
    Params: IdParams;
}>, reply: FastifyReply): Promise<{
    [key: string]: any;
    _id: ObjectId;
}[]>;
export declare function getClientWeeklyReport(request: FastifyRequest<{
    Params: IdParams;
    Querystring: WeeklyReportQuery;
}>, reply: FastifyReply): Promise<{
    client: {
        _id: string;
        name: any;
        companyName: any;
    };
    periodStart: string;
    periodEnd: string;
    currency: string;
    mixedCurrency: boolean;
    usdRate: number | null;
    usdConversionAvailable: boolean;
    missingBillRateStaff: string[];
    totals: {
        totalHours: number;
        totalPay: number;
        totalPayUsd: number | null;
        totalBillableUsd: number;
        totalMarginUsd: number | null;
        missingBillRateCount: number;
        staffCount: number;
    };
    staff: {
        staffId: string;
        name: string;
        position: string;
        hourlyRate: number;
        totalHours: number;
        daysWorked: number;
        calculatedPay: number;
        currency: string;
        payUsd: number | null;
        billRateUsd: number;
        hasBillRate: boolean;
        billableUsd: number;
        marginUsd: number | null;
    }[];
}>;
export declare function getBusinessClientAnalytics(request: FastifyRequest<{
    Params: {
        businessId: string;
    };
    Querystring: {
        from?: string;
        to?: string;
    };
}>, reply: FastifyReply): Promise<{
    businessId: string;
    from: string | null;
    to: string | null;
    usdConversionAvailable: boolean;
    usdRate: number | null;
    totals: {
        clientCount: number;
        activeClientCount: number;
        staffCount: number;
        totalHours: number;
        totalRevenueUsd: number;
        totalPaidUsd: number | null;
        totalMarginUsd: number | null;
        vaSharePct: number | null;
        marginPct: number | null;
        missingBillRateCount: number;
    };
    clients: {
        clientId: string;
        name: string;
        companyName: string | null;
        staffCount: number;
        totalHours: number;
        revenueUsd: number;
        paidUsd: number | null;
        marginUsd: number | null;
    }[];
}>;
export declare function getClientAnalytics(request: FastifyRequest<{
    Params: IdParams;
    Querystring: {
        from?: string;
        to?: string;
    };
}>, reply: FastifyReply): Promise<{
    clientId: string;
    from: string | null;
    to: string | null;
    usdConversionAvailable: boolean;
    totals: {
        staffCount: number;
        totalHours: number;
        totalRevenueUsd: number;
        totalPaidUsd: number | null;
        totalMarginUsd: number | null;
        vaSharePct: number | null;
        marginPct: number | null;
        missingBillRateCount: number;
    };
}>;
export {};
//# sourceMappingURL=client.controller.d.ts.map