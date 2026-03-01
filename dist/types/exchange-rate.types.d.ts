import { z } from "zod";
export declare const exchangeRateSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    rate: z.ZodNumber;
    updatedBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    updatedBy?: string | undefined;
}, {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    updatedBy?: string | undefined;
}>;
export declare const upsertExchangeRateSchema: z.ZodObject<{
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    rate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
}, {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
}>;
export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
export type UpsertExchangeRate = z.infer<typeof upsertExchangeRateSchema>;
export declare const exchangeRateJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly fromCurrency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly toCurrency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly rate: {
            readonly type: "number";
            readonly exclusiveMinimum: 0;
        };
        readonly updatedBy: {
            readonly type: "string";
        };
        readonly createdAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly updatedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
    readonly required: readonly ["fromCurrency", "toCurrency", "rate"];
};
export declare const upsertExchangeRateJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly fromCurrency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly toCurrency: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 10;
        };
        readonly rate: {
            readonly type: "number";
            readonly exclusiveMinimum: 0;
        };
    };
    readonly required: readonly ["fromCurrency", "toCurrency", "rate"];
};
//# sourceMappingURL=exchange-rate.types.d.ts.map