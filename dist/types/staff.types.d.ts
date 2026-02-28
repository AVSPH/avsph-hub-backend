import { z } from "zod";
export declare const staffStatusEnum: z.ZodEnum<["active", "on_leave", "terminated"]>;
export declare const employmentTypeEnum: z.ZodEnum<["full-time", "part-time", "contract"]>;
export declare const salaryTypeEnum: z.ZodEnum<["hourly", "daily", "monthly", "annual"]>;
export declare const staffDocumentSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    type: z.ZodString;
    uploadedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    url: string;
    name: string;
    uploadedAt: string;
}, {
    type: string;
    url: string;
    name: string;
    uploadedAt: string;
}>;
export declare const staffSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    dateHired: z.ZodString;
    salary: z.ZodOptional<z.ZodNumber>;
    salaryType: z.ZodDefault<z.ZodEnum<["hourly", "daily", "monthly", "annual"]>>;
    compensationProfileId: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodDefault<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    businessId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "on_leave", "terminated"]>>;
    notes: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
        uploadedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }, {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }>, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "on_leave" | "terminated";
    businessId: string;
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    isActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    employmentType: "full-time" | "part-time" | "contract";
    _id?: string | undefined;
    notes?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    phone?: string | undefined;
    department?: string | undefined;
    photoUrl?: string | undefined;
    documents?: {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }[] | undefined;
}, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    status?: "active" | "on_leave" | "terminated" | undefined;
    _id?: string | undefined;
    salaryType?: "hourly" | "daily" | "monthly" | "annual" | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    phone?: string | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    department?: string | undefined;
    photoUrl?: string | undefined;
    documents?: {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }[] | undefined;
}>;
export declare const createStaffSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    dateHired: z.ZodString;
    salary: z.ZodOptional<z.ZodNumber>;
    salaryType: z.ZodDefault<z.ZodEnum<["hourly", "daily", "monthly", "annual"]>>;
    compensationProfileId: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodDefault<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    businessId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "on_leave", "terminated"]>>;
    notes: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        type: z.ZodString;
        uploadedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }, {
        type: string;
        url: string;
        name: string;
        uploadedAt: string;
    }>, "many">>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "status" | "_id" | "notes" | "isActive" | "createdAt" | "updatedAt" | "photoUrl" | "documents">, "strip", z.ZodTypeAny, {
    businessId: string;
    salaryType: "hourly" | "daily" | "monthly" | "annual";
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    employmentType: "full-time" | "part-time" | "contract";
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    phone?: string | undefined;
    department?: string | undefined;
}, {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    password: string;
    dateHired: string;
    salaryType?: "hourly" | "daily" | "monthly" | "annual" | undefined;
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    phone?: string | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    department?: string | undefined;
}>;
export declare const updateStaffSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    dateHired: z.ZodOptional<z.ZodString>;
    salary: z.ZodOptional<z.ZodNumber>;
    salaryType: z.ZodOptional<z.ZodEnum<["hourly", "daily", "monthly", "annual"]>>;
    compensationProfileId: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "on_leave", "terminated"]>>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "on_leave" | "terminated" | undefined;
    salaryType?: "hourly" | "daily" | "monthly" | "annual" | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    position?: string | undefined;
    dateHired?: string | undefined;
    phone?: string | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    department?: string | undefined;
}, {
    status?: "active" | "on_leave" | "terminated" | undefined;
    salaryType?: "hourly" | "daily" | "monthly" | "annual" | undefined;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    salary?: number | undefined;
    compensationProfileId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    position?: string | undefined;
    dateHired?: string | undefined;
    phone?: string | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    department?: string | undefined;
}>;
export declare const staffLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const staffChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type StaffLogin = z.infer<typeof staffLoginSchema>;
export type StaffChangePassword = z.infer<typeof staffChangePasswordSchema>;
export declare const staffDocumentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly url: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly type: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
        readonly uploadedAt: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
    readonly required: readonly ["name", "url", "type", "uploadedAt"];
};
export declare const staffJsonSchema: {
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
        readonly department: {
            readonly type: "string";
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly salary: {
            readonly type: "number";
        };
        readonly salaryType: {
            readonly type: "string";
            readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
        };
        readonly compensationProfileId: {
            readonly type: "string";
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "on_leave", "terminated"];
        };
        readonly notes: {
            readonly type: "string";
            readonly maxLength: 1000;
        };
        readonly photoUrl: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly documents: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 100;
                    };
                    readonly url: {
                        readonly type: "string";
                        readonly format: "uri";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 50;
                    };
                    readonly uploadedAt: {
                        readonly type: "string";
                        readonly format: "date-time";
                    };
                };
                readonly required: readonly ["name", "url", "type", "uploadedAt"];
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
    readonly required: readonly ["firstName", "lastName", "email", "position", "dateHired", "businessId"];
};
export declare const createStaffJsonSchema: {
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
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
        readonly position: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly department: {
            readonly type: "string";
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly salary: {
            readonly type: "number";
        };
        readonly salaryType: {
            readonly type: "string";
            readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
        };
        readonly compensationProfileId: {
            readonly type: "string";
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly businessId: {
            readonly type: "string";
        };
    };
    readonly required: readonly ["firstName", "lastName", "email", "password", "position", "dateHired", "businessId"];
};
export declare const updateStaffJsonSchema: {
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
        readonly department: {
            readonly type: "string";
            readonly maxLength: 100;
        };
        readonly dateHired: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly salary: {
            readonly type: "number";
        };
        readonly salaryType: {
            readonly type: "string";
            readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
        };
        readonly compensationProfileId: {
            readonly type: "string";
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["active", "on_leave", "terminated"];
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
export declare const staffLoginJsonSchema: {
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
export declare const staffLoginResponseJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly token: {
            readonly type: "string";
        };
        readonly staff: {
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
                readonly department: {
                    readonly type: "string";
                    readonly maxLength: 100;
                };
                readonly dateHired: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly salary: {
                    readonly type: "number";
                };
                readonly salaryType: {
                    readonly type: "string";
                    readonly enum: readonly ["hourly", "daily", "monthly", "annual"];
                };
                readonly compensationProfileId: {
                    readonly type: "string";
                };
                readonly employmentType: {
                    readonly type: "string";
                    readonly enum: readonly ["full-time", "part-time", "contract"];
                };
                readonly businessId: {
                    readonly type: "string";
                };
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["active", "on_leave", "terminated"];
                };
                readonly notes: {
                    readonly type: "string";
                    readonly maxLength: 1000;
                };
                readonly photoUrl: {
                    readonly type: "string";
                    readonly format: "uri";
                };
                readonly documents: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly name: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 100;
                            };
                            readonly url: {
                                readonly type: "string";
                                readonly format: "uri";
                            };
                            readonly type: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 50;
                            };
                            readonly uploadedAt: {
                                readonly type: "string";
                                readonly format: "date-time";
                            };
                        };
                        readonly required: readonly ["name", "url", "type", "uploadedAt"];
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
            readonly required: readonly ["firstName", "lastName", "email", "position", "dateHired", "businessId"];
        };
    };
    readonly required: readonly ["token", "staff"];
};
export declare const staffChangePasswordJsonSchema: {
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
    };
    readonly required: readonly ["currentPassword", "newPassword"];
};
export declare const updateStaffProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export type UpdateStaffProfile = z.infer<typeof updateStaffProfileSchema>;
export declare const updateStaffProfileJsonSchema: {
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
        readonly phone: {
            readonly type: "string";
            readonly maxLength: 20;
        };
    };
    readonly additionalProperties: false;
};
export declare const addStaffDocumentSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    url: string;
    name: string;
}, {
    type: string;
    url: string;
    name: string;
}>;
export type AddStaffDocument = z.infer<typeof addStaffDocumentSchema>;
export declare const addStaffDocumentJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly url: {
            readonly type: "string";
            readonly format: "uri";
        };
        readonly type: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 50;
        };
    };
    readonly required: readonly ["name", "url", "type"];
    readonly additionalProperties: false;
};
//# sourceMappingURL=staff.types.d.ts.map