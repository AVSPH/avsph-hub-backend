import { z } from "zod";
import { exchangeRateSchema } from "../types/exchange-rate.types.js";
export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
export interface ExchangeRateDocumentType {
    _id?: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=exchange-rate.schema.d.ts.map