import type { FastifyPluginAsync } from "fastify";
import { forgotPassword, resetPassword } from "./auth.admin.controller.js";

const authAdminRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /admin/forgot-password
  fastify.post(
    "/admin/forgot-password",
    {
      schema: {
        description:
          "Request an admin password reset. Sends a 6-digit code to the registered email address.",
        tags: ["Admin Auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Admin account email",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    forgotPassword,
  );

  // POST /admin/reset-password
  fastify.post(
    "/admin/reset-password",
    {
      schema: {
        description:
          "Reset the admin password using the 6-digit code sent to their email.",
        tags: ["Admin Auth"],
        body: {
          type: "object",
          required: ["email", "code", "newPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Admin account email",
            },
            code: {
              type: "string",
              minLength: 6,
              maxLength: 6,
              pattern: "^\\d{6}$",
              description: "6-digit verification code from the email",
            },
            newPassword: {
              type: "string",
              minLength: 8,
              description: "New password (minimum 8 characters)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          500: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    resetPassword,
  );
};

export default authAdminRoutes;
