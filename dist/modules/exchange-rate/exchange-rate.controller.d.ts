import type { FastifyReply, FastifyRequest } from "fastify";
interface CurrencyPairParams {
    fromCurrency: string;
    toCurrency: string;
}
export declare function getExchangeRates(request: FastifyRequest, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>[]>;
export declare function getExchangeRate(request: FastifyRequest<{
    Params: CurrencyPairParams;
}>, reply: FastifyReply): Promise<import("mongodb").WithId<import("bson").Document>>;
export declare function upsertExchangeRate(request: FastifyRequest, reply: FastifyReply): Promise<{
    message: string;
    _id?: import("bson").ObjectId | undefined;
}>;
export declare function deleteExchangeRate(request: FastifyRequest<{
    Params: CurrencyPairParams;
}>, reply: FastifyReply): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=exchange-rate.controller.d.ts.map