import { staffJsonSchema, updateStaffProfileJsonSchema, addStaffDocumentJsonSchema, } from "../../types/staff.types.js";
import { updateStaffProfile, addStaffDocument } from "./staff.controller.js";
const staffRoutes = async (fastify) => {
    // PATCH /staff/me/profile - Update own profile: firstName, lastName, phone
    fastify.patch("/staff/me/profile", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Update current staff member's profile (firstName, lastName, phone)",
            tags: ["Staff"],
            security: [{ bearerAuth: [] }],
            body: updateStaffProfileJsonSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        staff: staffJsonSchema,
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                401: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, updateStaffProfile);
    // POST /staff/me/documents - Add a document via URL (e.g. Google Drive)
    fastify.post("/staff/me/documents", {
        preHandler: [fastify.authenticateStaff],
        schema: {
            description: "Add a document to the current staff member's profile using a URL (e.g. Google Drive)",
            tags: ["Staff"],
            security: [{ bearerAuth: [] }],
            body: addStaffDocumentJsonSchema,
            response: {
                201: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        document: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                url: { type: "string" },
                                type: { type: "string" },
                                uploadedAt: { type: "string" },
                            },
                        },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                        details: { type: "array" },
                    },
                },
                401: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
                404: {
                    type: "object",
                    properties: { error: { type: "string" } },
                },
            },
        },
    }, addStaffDocument);
};
export default staffRoutes;
//# sourceMappingURL=staff.route.js.map