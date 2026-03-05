import Fastify, { type FastifyError } from "fastify";
import {
  envPlugin,
  corsPlugin,
  securityPlugin,
  sensiblePlugin,
  mongodbPlugin,
  swaggerPlugin,
  authPlugin,
  cloudinaryPlugin,
  multipartPlugin,
  nodemailerPlugin,
  gmailPlugin,
  // cronPlugin — kept available as fallback (see registration comment below)
} from "./plugins/index.js";
import routes from "./routes/routes.js";

async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
  });

  // Register plugins in order
  await fastify.register(envPlugin);
  await fastify.register(sensiblePlugin);
  await fastify.register(multipartPlugin);
  await fastify.register(mongodbPlugin);
  await fastify.register(cloudinaryPlugin);
  await fastify.register(nodemailerPlugin);
  await fastify.register(gmailPlugin);
  await fastify.register(authPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(securityPlugin);
  // Cron plugin disabled — invoice generation is now event-driven (triggered on EOD approval).
  // Kept available as fallback: uncomment the line below to re-enable scheduled generation.
  // await fastify.register(cronPlugin);

  // Register all API routes with /api prefix
  await fastify.register(routes, { prefix: "/api" });

  // Global error handler
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message =
      statusCode === 500 ? "Internal Server Error" : error.message;

    reply.status(statusCode).send({
      error: error.name || "Error",
      message,
      statusCode,
    });
  });

  // Not found handler
  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: "Not Found",
      message: "The requested resource was not found",
      statusCode: 404,
    });
  });

  return fastify;
}

async function start() {
  try {
    const fastify = await buildApp();

    const host = fastify.config.HOST;
    const port = fastify.config.PORT;

    await fastify.listen({ port, host });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

start();
