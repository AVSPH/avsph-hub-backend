import { z } from "zod";
export declare const leadSourceEnum: z.ZodEnum<["contact_form", "newsletter", "other"]>;
export declare const leadStatusEnum: z.ZodEnum<["new", "contacted", "qualified", "converted"]>;
export declare const leadSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<["contact_form", "newsletter", "other"]>>;
    status: z.ZodDefault<z.ZodEnum<["new", "contacted", "qualified", "converted"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "contacted" | "new" | "qualified" | "converted";
    businessId: string;
    isActive: boolean;
    source: "contact_form" | "newsletter" | "other";
    firstName: string;
    email: string;
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    email: string;
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    source?: "contact_form" | "newsletter" | "other" | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
}>;
export declare const createLeadSchema: z.ZodObject<{
    businessId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<["contact_form", "newsletter", "other"]>>;
    notes: z.ZodOptional<z.ZodString>;
    hp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    businessId: string;
    source: "contact_form" | "newsletter" | "other";
    firstName: string;
    email: string;
    notes?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    hp?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    email: string;
    notes?: string | undefined;
    source?: "contact_form" | "newsletter" | "other" | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    hp?: string | undefined;
}>;
export declare const updateLeadSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["contact_form", "newsletter", "other"]>>;
    status: z.ZodOptional<z.ZodEnum<["new", "contacted", "qualified", "converted"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    notes?: string | undefined;
    source?: "contact_form" | "newsletter" | "other" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
}, {
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    notes?: string | undefined;
    source?: "contact_form" | "newsletter" | "other" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
}>;
export declare const updateLeadStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["new", "contacted", "qualified", "converted"]>;
}, "strip", z.ZodTypeAny, {
    status: "contacted" | "new" | "qualified" | "converted";
}, {
    status: "contacted" | "new" | "qualified" | "converted";
}>;
export declare const leadJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly firstName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly lastName: {
            readonly type: "string";
            readonly maxLength: 100;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
            readonly maxLength: 100;
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly company: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["contact_form", "newsletter", "other"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["new", "contacted", "qualified", "converted"];
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
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
    readonly required: readonly ["businessId", "firstName", "email"];
};
export declare const createLeadJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly businessId: {
            readonly type: "string";
        };
        readonly firstName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly lastName: {
            readonly type: "string";
            readonly maxLength: 100;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
            readonly maxLength: 100;
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly company: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["contact_form", "newsletter", "other"];
            readonly default: "contact_form";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly hp: {
            readonly type: "string";
            readonly maxLength: 200;
        };
    };
    readonly required: readonly ["businessId", "firstName", "email"];
};
export declare const updateLeadJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly firstName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly lastName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
            readonly maxLength: 100;
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly company: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["contact_form", "newsletter", "other"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["new", "contacted", "qualified", "converted"];
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
    };
};
export declare const updateLeadStatusJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["new", "contacted", "qualified", "converted"];
        };
    };
    readonly required: readonly ["status"];
};
//# sourceMappingURL=lead.types.d.ts.map