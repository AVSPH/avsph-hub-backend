import { z } from "zod";
export declare const adminRoleEnum: z.ZodEnum<["super-admin", "admin"]>;
export declare const adminSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["super-admin", "admin"]>>;
    businessIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "super-admin";
    businessIds: string[];
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    _id?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    role?: "admin" | "super-admin" | undefined;
    businessIds?: string[] | undefined;
}>;
export declare const createAdminSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["super-admin", "admin"]>>;
    businessIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "super-admin";
    businessIds: string[];
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isActive?: boolean | undefined;
    role?: "admin" | "super-admin" | undefined;
    businessIds?: string[] | undefined;
}>;
export declare const updateAdminSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["super-admin", "admin"]>>;
    businessIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "super-admin" | undefined;
    businessIds?: string[] | undefined;
}, {
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "super-admin" | undefined;
    businessIds?: string[] | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type Admin = z.infer<typeof adminSchema>;
export type CreateAdmin = z.infer<typeof createAdminSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export declare const adminJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly email: {
            readonly type: "string";
            readonly format: "email";
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
        readonly role: {
            readonly type: "string";
            readonly enum: readonly ["super-admin", "admin"];
        };
        readonly businessIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
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
    readonly required: readonly ["email", "firstName", "lastName", "role"];
};
export declare const createAdminJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly password: {
            readonly type: "string";
            readonly minLength: 8;
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
        readonly role: {
            readonly type: "string";
            readonly enum: readonly ["super-admin", "admin"];
            readonly default: "admin";
        };
        readonly businessIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly default: readonly [];
        };
    };
    readonly required: readonly ["email", "password", "firstName", "lastName"];
};
export declare const updateAdminJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly email: {
            readonly type: "string";
            readonly format: "email";
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
        readonly role: {
            readonly type: "string";
            readonly enum: readonly ["super-admin", "admin"];
        };
        readonly businessIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
export declare const loginJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly password: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
    readonly required: readonly ["email", "password"];
};
export declare const loginResponseJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly token: {
            readonly type: "string";
        };
        readonly admin: {
            readonly type: "object";
            readonly properties: {
                readonly _id: {
                    readonly type: "string";
                };
                readonly email: {
                    readonly type: "string";
                    readonly format: "email";
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
                readonly role: {
                    readonly type: "string";
                    readonly enum: readonly ["super-admin", "admin"];
                };
                readonly businessIds: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
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
            readonly required: readonly ["email", "firstName", "lastName", "role"];
        };
    };
    readonly required: readonly ["token", "admin"];
};
export declare const updateAdminProfileSchema: z.ZodEffects<z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
}>, {
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
}>;
export declare const updateAdminEmailSchema: z.ZodObject<{
    email: z.ZodString;
    currentPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    currentPassword: string;
}, {
    email: string;
    currentPassword: string;
}>;
export declare const updateAdminPasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export type UpdateAdminProfile = z.infer<typeof updateAdminProfileSchema>;
export type UpdateAdminEmail = z.infer<typeof updateAdminEmailSchema>;
export type UpdateAdminPassword = z.infer<typeof updateAdminPasswordSchema>;
export declare const updateAdminProfileJsonSchema: {
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
    };
};
export declare const updateAdminEmailJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly email: {
            readonly type: "string";
            readonly format: "email";
        };
        readonly currentPassword: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
    readonly required: readonly ["email", "currentPassword"];
};
export declare const updateAdminPasswordJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly currentPassword: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly newPassword: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly confirmPassword: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
    readonly required: readonly ["currentPassword", "newPassword", "confirmPassword"];
};
//# sourceMappingURL=admin.types.d.ts.map