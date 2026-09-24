import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { z } from "zod";

// Load and expand .env variables (e.g. ${DB_USER})
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("8000")
    .transform((val) => parseInt(val, 10)),

  // MySQL Individual Variables
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z
    .string()
    .default("3306")
    .transform((val) => parseInt(val, 10)),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string(),

  // Prisma Connection String
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
