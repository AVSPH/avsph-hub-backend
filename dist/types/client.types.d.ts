import { z } from "zod";
export declare const clientStatusEnum: z.ZodEnum<["active", "inactive"]>;
export declare const clientSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    name: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    billingInfo: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    logoUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive";
    name: string;
    businessId: string;
    isActive: boolean;
    tags?: string[] | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name: string;
    businessId: string;
    status?: "active" | "inactive" | undefined;
    tags?: string[] | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const createClientSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    name: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    contactPerson: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    billingInfo: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    logoUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "isActive" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    status: "active" | "inactive";
    name: string;
    businessId: string;
    tags?: string[] | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name: string;
    businessId: string;
    status?: "active" | "inactive" | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["active", "inactive"]>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    name: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    website: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    contactPerson: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    billingInfo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | undefined;
    tags?: string[] | undefined;
    name?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}, {
    status?: "active" | "inactive" | undefined;
    tags?: string[] | undefined;
    name?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    email?: string | undefined;
    website?: string | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    contactPerson?: string | undefined;
    address?: string | undefined;
    billingInfo?: string | undefined;
    logoUrl?: string | undefined;
}>;
export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export declare const clientJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly companyName: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly contactPerson: {
            readonly type: "string";
            readonly maxLength: 120;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 30;
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly address: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly billingInfo: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly maxLength: 50;
            };
        };
        readonly logoUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "inactive"];
        };
        readonly isActive: {
            readonly type: "boolean";
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
    readonly required: readonly ["name", "businessId"];
};
export declare const createClientJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly businessId: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly companyName: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly contactPerson: {
            readonly type: "string";
            readonly maxLength: 120;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 30;
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly address: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly billingInfo: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly maxLength: 50;
            };
        };
        readonly logoUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "inactive"];
        };
    };
    readonly required: readonly ["name", "businessId"];
};
export declare const updateClientJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 120;
        };
        readonly companyName: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly contactPerson: {
            readonly type: "string";
            readonly maxLength: 120;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 30;
        };
        readonly website: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly address: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly billingInfo: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly maxLength: 50;
            };
        };
        readonly logoUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "inactive"];
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=client.types.d.ts.map