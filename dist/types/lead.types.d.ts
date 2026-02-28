import { z } from "zod";
export declare const leadSourceEnum: z.ZodEnum<["blog_comment", "contact_form", "other"]>;
export declare const leadStatusEnum: z.ZodEnum<["new", "contacted", "qualified", "converted"]>;
export declare const leadSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    source: z.ZodDefault<z.ZodEnum<["blog_comment", "contact_form", "other"]>>;
    status: z.ZodDefault<z.ZodEnum<["new", "contacted", "qualified", "converted"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "contacted" | "new" | "qualified" | "converted";
    name: string;
    isActive: boolean;
    source: "blog_comment" | "contact_form" | "other";
    email: string;
    phone: string;
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    name: string;
    email: string;
    phone: string;
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    _id?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    source?: "blog_comment" | "contact_form" | "other" | undefined;
}>;
export declare const createLeadSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    source: z.ZodDefault<z.ZodEnum<["blog_comment", "contact_form", "other"]>>;
    status: z.ZodDefault<z.ZodEnum<["new", "contacted", "qualified", "converted"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    status: "contacted" | "new" | "qualified" | "converted";
    name: string;
    isActive: boolean;
    source: "blog_comment" | "contact_form" | "other";
    email: string;
    phone: string;
    notes?: string | undefined;
}, {
    name: string;
    email: string;
    phone: string;
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    source?: "blog_comment" | "contact_form" | "other" | undefined;
}>;
export declare const updateLeadSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["new", "contacted", "qualified", "converted"]>>>;
    name: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodEnum<["blog_comment", "contact_form", "other"]>>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    name?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    source?: "blog_comment" | "contact_form" | "other" | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    status?: "contacted" | "new" | "qualified" | "converted" | undefined;
    name?: string | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    source?: "blog_comment" | "contact_form" | "other" | undefined;
    email?: string | undefined;
    phone?: string | undefined;
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
        readonly name: {
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
            readonly minLength: 1;
            readonly maxLength: 20;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["blog_comment", "contact_form", "other"];
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
    readonly required: readonly ["name", "email", "phone"];
};
export declare const createLeadJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
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
            readonly minLength: 1;
            readonly maxLength: 20;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["blog_comment", "contact_form", "other"];
            readonly default: "other";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["new", "contacted", "qualified", "converted"];
            readonly default: "new";
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly isActive: {
            readonly type: "boolean";
            readonly default: true;
        };
    };
    readonly required: readonly ["name", "email", "phone"];
};
export declare const updateLeadJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
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
            readonly minLength: 1;
            readonly maxLength: 20;
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["blog_comment", "contact_form", "other"];
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