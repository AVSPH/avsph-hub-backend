import { z } from 'zod';
export declare const applicantStatusEnum: z.ZodEnum<["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"]>;
export declare const applicantSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    resumeUrl: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    appliedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "reviewed" | "shortlisted" | "interviewed" | "hired" | "rejected";
    isActive: boolean;
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resumeUrl?: string | undefined;
    coverLetter?: string | undefined;
    notes?: string | undefined;
    appliedAt?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    status?: "pending" | "reviewed" | "shortlisted" | "interviewed" | "hired" | "rejected" | undefined;
    _id?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resumeUrl?: string | undefined;
    coverLetter?: string | undefined;
    notes?: string | undefined;
    appliedAt?: string | undefined;
}>;
export declare const createApplicantSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    resumeUrl: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    appliedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "status" | "_id" | "isActive" | "notes" | "appliedAt">, "strip", z.ZodTypeAny, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resumeUrl?: string | undefined;
    coverLetter?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resumeUrl?: string | undefined;
    coverLetter?: string | undefined;
}>;
export declare const updateApplicantSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "reviewed" | "shortlisted" | "interviewed" | "hired" | "rejected" | undefined;
    isActive?: boolean | undefined;
    notes?: string | undefined;
}, {
    status?: "pending" | "reviewed" | "shortlisted" | "interviewed" | "hired" | "rejected" | undefined;
    isActive?: boolean | undefined;
    notes?: string | undefined;
}>;
export declare const applicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly firstName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly lastName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly resumeUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly coverLetter: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"];
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly isActive: {
            readonly type: "boolean";
        };
        readonly appliedAt: {
            readonly type: "string";
            readonly format: "date-time";
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
    readonly required: readonly ["firstName", "lastName", "email", "position", "businessId"];
};
export declare const createApplicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly firstName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly lastName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly resumeUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly coverLetter: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly businessId: {
            readonly type: "string";
        };
    };
    readonly required: readonly ["firstName", "lastName", "email", "position", "businessId"];
};
export declare const updateApplicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["pending", "reviewed", "shortlisted", "interviewed", "hired", "rejected"];
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
//# sourceMappingURL=applicant.types.d.ts.map