import z from "zod";

export const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("")
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 10))),
  search: z.string().optional(),
  email: z.string().optional(),
  userId: z.string().optional(),
});

export type UserQuerySchema = z.infer<typeof userQuerySchema>;
