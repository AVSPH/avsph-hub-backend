import { z } from "zod";
export declare const jobEmploymentTypeEnum: z.ZodEnum<["full-time", "part-time", "contract"]>;
export declare const jobPostStatusEnum: z.ZodEnum<["draft", "open", "closed"]>;
export declare const stageTypeEnum: z.ZodEnum<["active", "hired", "rejected"]>;
export declare const jobPostStageSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    order: z.ZodNumber;
    type: z.ZodDefault<z.ZodEnum<["active", "hired", "rejected"]>>;
}, "strip", z.ZodTypeAny, {
    type: "active" | "hired" | "rejected";
    name: string;
    id: string;
    order: number;
}, {
    name: string;
    id: string;
    order: number;
    type?: "active" | "hired" | "rejected" | undefined;
}>;
export declare const jobPostSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    requirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    employmentType: z.ZodDefault<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    status: z.ZodDefault<z.ZodEnum<["draft", "open", "closed"]>>;
    stages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        order: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<["active", "hired", "rejected"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }, {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "open" | "closed";
    title: string;
    description: string;
    businessId: string;
    isActive: boolean;
    stages: {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }[];
    employmentType: "full-time" | "part-time" | "contract";
    requirements: string[];
    _id?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    title: string;
    description: string;
    businessId: string;
    stages: {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }[];
    status?: "draft" | "open" | "closed" | undefined;
    _id?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    requirements?: string[] | undefined;
}>;
export declare const createJobPostSchema: z.ZodObject<Omit<{
    _id: z.ZodOptional<z.ZodString>;
    businessId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    requirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    employmentType: z.ZodDefault<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    status: z.ZodDefault<z.ZodEnum<["draft", "open", "closed"]>>;
    stages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        order: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<["active", "hired", "rejected"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }, {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "_id" | "isActive" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    status: "draft" | "open" | "closed";
    title: string;
    description: string;
    businessId: string;
    stages: {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }[];
    employmentType: "full-time" | "part-time" | "contract";
    requirements: string[];
}, {
    title: string;
    description: string;
    businessId: string;
    stages: {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }[];
    status?: "draft" | "open" | "closed" | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    requirements?: string[] | undefined;
}>;
export declare const updateJobPostSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    employmentType: z.ZodOptional<z.ZodEnum<["full-time", "part-time", "contract"]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "open", "closed"]>>;
    stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        order: z.ZodNumber;
        type: z.ZodDefault<z.ZodEnum<["active", "hired", "rejected"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }, {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }>, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: "draft" | "open" | "closed" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
    stages?: {
        type: "active" | "hired" | "rejected";
        name: string;
        id: string;
        order: number;
    }[] | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    requirements?: string[] | undefined;
}, {
    status?: "draft" | "open" | "closed" | undefined;
    title?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
    stages?: {
        name: string;
        id: string;
        order: number;
        type?: "active" | "hired" | "rejected" | undefined;
    }[] | undefined;
    employmentType?: "full-time" | "part-time" | "contract" | undefined;
    requirements?: string[] | undefined;
}>;
export declare const updateJobPostStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["draft", "open", "closed"]>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "open" | "closed";
}, {
    status: "draft" | "open" | "closed";
}>;
export type JobPostStage = z.infer<typeof jobPostStageSchema>;
export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
export declare const jobPostStageJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly order: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["active", "hired", "rejected"];
        };
    };
    readonly required: readonly ["id", "name", "order", "type"];
};
export declare const jobPostJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly _id: {
            readonly type: "string";
        };
        readonly businessId: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 200;
        };
        readonly description: {
            readonly type: "string";
        };
        readonly requirements: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "open", "closed"];
        };
        readonly stages: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 100;
                    };
                    readonly order: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["active", "hired", "rejected"];
                    };
                };
                readonly required: readonly ["id", "name", "order", "type"];
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
    readonly required: readonly ["businessId", "title", "description", "stages"];
};
export declare const createJobPostJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly businessId: {
            readonly type: "string";
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 200;
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requirements: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "open", "closed"];
        };
        readonly stages: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 100;
                    };
                    readonly order: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["active", "hired", "rejected"];
                    };
                };
                readonly required: readonly ["id", "name", "order", "type"];
            };
            readonly minItems: 1;
        };
    };
    readonly required: readonly ["businessId", "title", "description", "stages"];
};
export declare const updateJobPostJsonSchema: {
    readonly type: "object";
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 200;
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requirements: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly employmentType: {
            readonly type: "string";
            readonly enum: readonly ["full-time", "part-time", "contract"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["draft", "open", "closed"];
        };
        readonly stages: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 100;
                    };
                    readonly order: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["active", "hired", "rejected"];
                    };
                };
                readonly required: readonly ["id", "name", "order", "type"];
            };
            readonly minItems: 1;
        };
        readonly isActive: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=jobPost.types.d.ts.map