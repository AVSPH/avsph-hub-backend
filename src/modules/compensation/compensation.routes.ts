import type { FastifyPluginAsync } from "fastify";
import {
  compensationProfileJsonSchema,
  createCompensationProfileJsonSchema,
  updateCompensationProfileJsonSchema,
  updateStaffStatutorySettingsJsonSchema,
} from "../../types/compensation-profile.types.js";
import {
  createCompensationProfile,
  updateCompensationProfile,
  getCompensationProfiles,
  updateStaffStatutorySettings,
} from "./compensation.controller.js";

const compensationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/compensation-profiles",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Create a compensation profile (admin only)",
        tags: ["Compensation"],
        security: [{ bearerAuth: [] }],
        body: createCompensationProfileJsonSchema,
        response: {
          201: {
            type: "object",
            properties: {
              ...compensationProfileJsonSchema.properties,
              message: { type: "string" },
            },
          },
        },
      },
    },
    createCompensationProfile,
  );

  fastify.patch<{ Params: { id: string } }>(
    "/compensation-profiles/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Update a compensation profile (admin only)",
        tags: ["Compensation"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: updateCompensationProfileJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              ...compensationProfileJsonSchema.properties,
              message: { type: "string" },
            },
          },
        },
      },
    },
    updateCompensationProfile,
  );

  fastify.get<{
    Querystring: {
      businessId?: string;
      isActive?: string;
    };
  }>(
    "/compensation-profiles",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "List compensation profiles (admin only)",
        tags: ["Compensation"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            businessId: { type: "string" },
            isActive: { type: "string", enum: ["true", "false"] },
          },
        },
        response: {
          200: {
            type: "array",
            items: compensationProfileJsonSchema,
          },
        },
      },
    },
    getCompensationProfiles,
  );

  fastify.patch<{ Params: { staffId: string } }>(
    "/compensation-profiles/staff/:staffId/statutory-settings",
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: "Update staff statutory settings (admin only)",
        tags: ["Compensation"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            staffId: { type: "string" },
          },
          required: ["staffId"],
        },
        body: updateStaffStatutorySettingsJsonSchema,
        response: {
          200: {
            type: "object",
            properties: {
              ...compensationProfileJsonSchema.properties,
              message: { type: "string" },
            },
          },
          201: {
            type: "object",
            properties: {
              ...compensationProfileJsonSchema.properties,
              message: { type: "string" },
            },
          },
        },
      },
    },
    updateStaffStatutorySettings,
  );
};

export default compensationRoutes;
