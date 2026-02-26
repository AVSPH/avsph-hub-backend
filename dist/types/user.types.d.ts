import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    position: z.ZodString;
    dateHired: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    _id?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export declare const createUserSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    position: z.ZodString;
    dateHired: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
}, {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    isActive?: boolean | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    dateHired: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    position?: string | undefined;
    password?: string | undefined;
    dateHired?: string | undefined;
}, {
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    position?: string | undefined;
    password?: string | undefined;
    dateHired?: string | undefined;
}>;
export declare const userJsonSchema: {
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
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
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
    readonly required: readonly ["firstName", "lastName", "email", "position", "dateHired"];
};
export declare const createUserJsonSchema: {
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
        readonly password: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly isActive: {
            readonly type: "boolean";
            readonly default: true;
        };
    };
    readonly required: readonly ["firstName", "lastName", "email", "password", "position", "dateHired"];
};
export declare const updateUserJsonSchema: {
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
        readonly password: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=user.types.d.ts.map