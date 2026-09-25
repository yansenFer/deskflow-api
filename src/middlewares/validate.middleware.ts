import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/app-error";

type RequestLocation = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodSchema,
  location: RequestLocation = "body",
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[location]);
      if (location === "body") {
        req.body = parsed;
      } else if (location === "query") {
        // Express 5: req.query is a getter; mutate properties instead of reassigning
        for (const key of Object.keys(req.query)) {
          delete (req.query as Record<string, unknown>)[key];
        }
        Object.assign(req.query, parsed);
      } else if (location === "params") {
        Object.assign(req.params, parsed);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(AppError.badRequest("Validation failed", errorMessages));
      } else {
        next(error);
      }
    }
  };
};
