import { updateAdminProfileJsonSchema, updateAdminEmailJsonSchema, updateAdminPasswordJsonSchema, adminJsonSchema, } from "../../../types/admin.types.js";
import { updateAdminProfile, updateAdminEmail, updateAdminPassword, } from "./admin.settings.controller.js";
const errorSchema = {
    type: "object",
    properties: {
        error: { type: "string" },
        details: { type: "array" },
    },
};
const adminSettingsRoutes = async (fastify) => {
    // PATCH /admin/settings/profile – update name
    fastify.patch("/admin/settings/profile", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update authenticated admin's first and/or last name",
            tags: ["Admin Settings"],
            security: [{ bearerAuth: [] }],
            body: updateAdminProfileJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        admin: adminJsonSchema,
                    },
                },
                400: errorSchema,
                401: errorSchema,
                404: errorSchema,
            },
        },
    }, updateAdminProfile);
    // PATCH /admin/settings/email – update email
    fastify.patch("/admin/settings/email", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Update authenticated admin's email (requires current password)",
            tags: ["Admin Settings"],
            security: [{ bearerAuth: [] }],
            body: updateAdminEmailJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        admin: adminJsonSchema,
                    },
                },
                400: errorSchema,
                401: errorSchema,
                404: errorSchema,
                409: errorSchema,
            },
        },
    }, updateAdminEmail);
    // PATCH /admin/settings/password – change password
    fastify.patch("/admin/settings/password", {
        preHandler: [fastify.authenticate],
        schema: {
            description: "Change authenticated admin's password",
            tags: ["Admin Settings"],
            security: [{ bearerAuth: [] }],
            body: updateAdminPasswordJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
                400: errorSchema,
                401: errorSchema,
                404: errorSchema,
            },
        },
    }, updateAdminPassword);
};
export default adminSettingsRoutes;
//# sourceMappingURL=admin.settings.route.js.map