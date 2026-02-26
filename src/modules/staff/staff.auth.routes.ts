import type { FastifyPluginAsync } from "fastify";
import {
  staffJsonSchema,
  staffLoginJsonSchema,
  staffLoginResponseJsonSchema,
  staffChangePasswordJsonSchema,
} from "../../types/staff.types.js";
import {
  loginStaff,
  getCurrentStaff,
  changeStaffPassword,
  forgotStaffPassword,
  resetStaffPassword,
} from "./staff.auth.controllers.js";

const staffAuthRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /staff/login - Staff login (public)
  fastify.post(
    "/staff/login",
    {
      schema: {
        description:
          "Staff login - authenticate with email, password, and business ID",
        tags: ["Staff Auth"],
        body: staffLoginJsonSchema,
        response: {
          200: staffLoginResponseJsonSchema,
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    loginStaff,
  );

  // GET /staff/me - Get current staff (protected - staff only)
  fastify.get(
    "/staff/me",
    {
      preHandler: [fastify.authenticateStaff],
      schema: {
        description: "Get current authenticated staff member",
        tags: ["Staff Auth"],
        security: [{ bearerAuth: [] }],
        response: {
          200: staffJsonSchema,
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    getCurrentStaff,
  );

  // PUT /staff/me/password - Change staff password (protected - staff only)
  fastify.put<{ Body: { currentPassword: string; newPassword: string } }>(
    "/staff/me/password",
    {
      preHandler: [fastify.authenticateStaff],
      schema: {
        description: "Change current staff member's password",
        tags: ["Staff Auth"],
        security: [{ bearerAuth: [] }],
        body: staffChangePasswordJsonSchema,
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
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    changeStaffPassword,
  );
  // POST /staff/forgot-password
  fastify.post(
    "/staff/forgot-password",
    {
      schema: {
        description:
          "Request a staff password reset. Sends a 6-digit code to the registered email address.",
        tags: ["Staff Auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Staff account email",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: { message: { type: "string" } },
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
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    forgotStaffPassword,
  );

  // POST /staff/reset-password
  fastify.post(
    "/staff/reset-password",
    {
      schema: {
        description:
          "Reset the staff password using the 6-digit code sent to their email.",
        tags: ["Staff Auth"],
        body: {
          type: "object",
          required: ["email", "code", "newPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Staff account email",
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
            properties: { message: { type: "string" } },
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
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    resetStaffPassword,
  );
};

export default staffAuthRoutes;
