import { z } from "zod";
export declare const bookingSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    fullName: z.ZodString;
    email: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "contacted", "completed", "cancelled"]>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "contacted" | "completed" | "cancelled";
    message: string;
    businessId: string;
    email: string;
    fullName: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    companyName?: string | undefined;
}, {
    message: string;
    businessId: string;
    email: string;
    fullName: string;
    status?: "pending" | "contacted" | "completed" | "cancelled" | undefined;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    companyName?: string | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    fullName: z.ZodString;
    email: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "contacted", "completed", "cancelled"]>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "status" | "_id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    message: string;
    businessId: string;
    email: string;
    fullName: string;
    companyName?: string | undefined;
}, {
    message: string;
    businessId: string;
    email: string;
    fullName: string;
    companyName?: string | undefined;
}>;
export declare const updateBookingSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["pending", "contacted", "completed", "cancelled"]>>>;
    message: z.ZodOptional<z.ZodString>;
    businessId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    fullName: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "contacted" | "completed" | "cancelled" | undefined;
    message?: string | undefined;
    businessId?: string | undefined;
    email?: string | undefined;
    fullName?: string | undefined;
    companyName?: string | undefined;
}, {
    status?: "pending" | "contacted" | "completed" | "cancelled" | undefined;
    message?: string | undefined;
    businessId?: string | undefined;
    email?: string | undefined;
    fullName?: string | undefined;
    companyName?: string | undefined;
}>;
export declare const bookingJsonSchema: {
    type: string;
    properties: {
        businessId: {
            type: string;
            minLength: number;
        };
        fullName: {
            type: string;
            minLength: number;
            maxLength: number;
        };
        email: {
            type: string;
            format: string;
        };
        companyName: {
            type: string;
            maxLength: number;
        };
        message: {
            type: string;
            minLength: number;
            maxLength: number;
        };
    };
    required: string[];
};
export declare const updateBookingJsonSchema: {
    type: string;
    properties: {
        businessId: {
            type: string;
            minLength: number;
        };
        fullName: {
            type: string;
            minLength: number;
            maxLength: number;
        };
        email: {
            type: string;
            format: string;
        };
        companyName: {
            type: string;
            maxLength: number;
        };
        message: {
            type: string;
            minLength: number;
            maxLength: number;
        };
        status: {
            type: string;
            enum: string[];
        };
    };
};
//# sourceMappingURL=booking.types.d.ts.map