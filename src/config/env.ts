import { z } from "zod";

// Environment schema for type-safe configuration
export const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  API_PREFIX: z.string().default("/api"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/avsph"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security"),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Nodemailer Configuration
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587").transform(Number),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  SMTP_FROM: z.string().email().optional(),

  // Gmail OAuth2 Configuration
  GMAIL_CLIENT_ID: z.string().min(1, "GMAIL_CLIENT_ID is required"),
  GMAIL_CLIENT_SECRET: z.string().min(1, "GMAIL_CLIENT_SECRET is required"),
  GMAIL_REDIRECT_URI: z
    .string()
    .url()
    .default("https://developers.google.com/oauthplayground"),
  GMAIL_REFRESH_TOKEN: z.string().min(1, "GMAIL_REFRESH_TOKEN is required"),
});

export type Env = z.infer<typeof envSchema>;

// Extend FastifyInstance to include config
declare module "fastify" {
  interface FastifyInstance {
    config: Env;
  }
}
