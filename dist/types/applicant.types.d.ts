import { z } from "zod";
export declare const applicantSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    jobId: z.ZodString;
    businessId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    resume: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
    stage: z.ZodString;
    adminNotes: z.ZodOptional<z.ZodString>;
    isStaffConverted: z.ZodDefault<z.ZodBoolean>;
    staffId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    appliedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    businessId: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    jobId: string;
    stage: string;
    isStaffConverted: boolean;
    _id?: string | undefined;
    staffId?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resume?: string | undefined;
    coverLetter?: string | undefined;
    adminNotes?: string | undefined;
    appliedAt?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    jobId: string;
    stage: string;
    _id?: string | undefined;
    staffId?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    phone?: string | undefined;
    resume?: string | undefined;
    coverLetter?: string | undefined;
    adminNotes?: string | undefined;
    isStaffConverted?: boolean | undefined;
    appliedAt?: string | undefined;
}>;
export declare const createApplicantSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    resume: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
    resume?: string | undefined;
    coverLetter?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | undefined;
    resume?: string | undefined;
    coverLetter?: string | undefined;
}>;
export declare const updateApplicantSchema: z.ZodObject<{
    adminNotes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    adminNotes?: string | undefined;
}, {
    isActive?: boolean | undefined;
    adminNotes?: string | undefined;
}>;
export declare const updateApplicantStageSchema: z.ZodObject<{
    stage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    stage: string;
}, {
    stage: string;
}>;
export declare const hireApplicantSchema: z.ZodObject<{
    salary: z.ZodNumber;
    salaryType: z.ZodEnum<["hourly", "daily", "monthly", "annual"]>;
}, "strip", z.ZodTypeAny, {
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    salary: number;
}, {
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    salary: number;
}>;
export declare const applicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly jobId: {
            readonly type: "string";
        };
        readonly businessId: {
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
        readonly resume: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly coverLetter: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly stage: {
            readonly type: "string";
        };
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly isStaffConverted: {
            readonly type: "boolean";
        };
        readonly staffId: {
            readonly type: "string";
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
    readonly required: readonly ["jobId", "businessId", "firstName", "lastName", "email", "position", "stage"];
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
        readonly resume: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly coverLetter: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
    };
    readonly required: readonly ["firstName", "lastName", "email"];
};
export declare const updateApplicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly adminNotes: {
            readonly type: "string";
            readonly maxLength: 2000;
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
export declare const updateApplicantStageJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly stage: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
    readonly required: readonly ["stage"];
};
export declare const hireApplicantJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly salary: {
            readonly type: "number";
        };
        readonly salaryType: {
            readonly type: "string";
            readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
        };
    };
    readonly required: readonly ["salary", "salaryType"];
};
//# sourceMappingURL=applicant.types.d.ts.map