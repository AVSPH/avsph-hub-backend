import type { FastifyReply, FastifyRequest } from "fastify";
interface BusinessIdParams {
    businessId: string;
}
interface RangeDaysQuery {
    days?: string;
}
interface RangeMonthsQuery {
    months?: string;
}
export declare function getBusinessAttendanceStats(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RangeDaysQuery;
}>, reply: FastifyReply): Promise<{
    businessId: string;
    rangeDays: number;
    totalRecords: any;
    statusCounts: {
        pending: number;
        approved: number;
        rejected: number;
    };
    totalHours: any;
    approvedHours: any;
    avgHoursPerDay: number;
    daily: any;
    updatedAt: string;
} | undefined>;
export declare function getBusinessRecruitmentStats(request: FastifyRequest<{
    Params: BusinessIdParams;
}>, reply: FastifyReply): Promise<{
    businessId: string;
    jobs: {
        total: number;
        open: number;
        draft: number;
        closed: number;
    };
    applicants: {
        total: number;
        active: number;
        hired: number;
        rejected: number;
        converted: number;
    };
    conversionRate: number;
    topOpenJobs: {
        jobId: string;
        title: string;
        applicantCount: number;
    }[];
    updatedAt: string;
} | undefined>;
export declare function getBusinessWorkforceStats(request: FastifyRequest<{
    Params: BusinessIdParams;
}>, reply: FastifyReply): Promise<{
    businessId: string;
    totalStaff: any;
    byStatus: {
        active: number;
        on_leave: number;
        terminated: number;
    };
    byEmploymentType: Record<string, number>;
    byDepartment: any;
    hires: any;
    avgTenureMonths: number;
    updatedAt: string;
} | undefined>;
export declare function getBusinessPayrollTrend(request: FastifyRequest<{
    Params: BusinessIdParams;
    Querystring: RangeMonthsQuery;
}>, reply: FastifyReply): Promise<{
    businessId: string;
    rangeMonths: number;
    currencies: {
        currency: string;
        periods: {
            month: string;
            netPay: number;
            calculatedPay: number;
            count: number;
        }[];
        breakdown: {
            regular: number;
            overtime: number;
            sundayPremium: number;
            nightDifferential: number;
            transportation: number;
        };
        statutory: {
            sss: number;
            pagIbig: number;
            philHealth: number;
        };
        totalNetPay: number;
        totalStatutory: number;
        invoiceCount: number;
    }[];
    updatedAt: string;
} | undefined>;
export {};
//# sourceMappingURL=overview.analytics.controller.d.ts.map