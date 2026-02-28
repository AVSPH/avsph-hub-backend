import { z } from "zod";
export declare const commentSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    blogId: z.ZodString;
    leadId: z.ZodString;
    comment: z.ZodString;
    isApproved: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isApproved: boolean;
    comment: string;
    blogId: string;
    leadId: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    comment: string;
    blogId: string;
    leadId: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    isApproved?: boolean | undefined;
}>;
export declare const createCommentSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    blogId: z.ZodString;
    leadId: z.ZodString;
    comment: z.ZodString;
    isApproved: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "createdAt" | "updatedAt" | "leadId">, "strip", z.ZodTypeAny, {
    isApproved: boolean;
    comment: string;
    blogId: string;
}, {
    comment: string;
    blogId: string;
    isApproved?: boolean | undefined;
}>;
export declare const createCommentWithLeadSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone: string;
    comment: string;
}, {
    name: string;
    email: string;
    phone: string;
    comment: string;
}>;
export declare const updateCommentSchema: z.ZodObject<{
    comment: z.ZodOptional<z.ZodString>;
    isApproved: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isApproved?: boolean | undefined;
    comment?: string | undefined;
}, {
    isApproved?: boolean | undefined;
    comment?: string | undefined;
}>;
export declare const approveCommentSchema: z.ZodObject<{
    isApproved: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isApproved: boolean;
}, {
    isApproved: boolean;
}>;
export declare const commentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly blogId: {
            readonly type: "string";
        };
        readonly leadId: {
            readonly type: "string";
        };
        readonly comment: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 2000;
        };
        readonly isApproved: {
            readonly type: "boolean";
            readonly default: false;
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
    readonly required: readonly ["blogId", "leadId", "comment"];
};
export declare const createCommentWithLeadJsonSchema: {
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
        readonly comment: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 2000;
        };
    };
    readonly required: readonly ["name", "email", "phone", "comment"];
};
export declare const updateCommentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly comment: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 2000;
        };
        readonly isApproved: {
            readonly type: "boolean";
        };
    };
};
export declare const approveCommentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly isApproved: {
            readonly type: "boolean";
        };
    };
    readonly required: readonly ["isApproved"];
};
//# sourceMappingURL=comment.types.d.ts.map