import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown = undefined;

  // 1. Handled AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // 2. Prisma Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        statusCode = 409;
        const target = (err.meta?.target as string[]) || ["Field"];
        message = `Unique constraint failed: ${target.join(", ")} already exists`;
        break;
      }
      case "P2025": {
        statusCode = 404;
        message = (err.meta?.cause as string) || "Record not found in database";
        break;
      }
      case "P2003": {
        statusCode = 400;
        message =
          "Foreign key constraint violated: related record prevents this action";
        break;
      }
      default: {
        statusCode = 400;
        message = `Database query error: ${err.message}`;
      }
    }
  }
  // 3. Syntax / JSON parse error
  else if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as { status?: number }).status === 400
  ) {
    statusCode = 400;
    message = "Malformed JSON in request body";
  }
  // 4. Other unexpected errors
  else {
    message = err.message || "An unexpected error occurred";
  }

  // Log non-operational errors or errors in development
  if (env.NODE_ENV === "development" || statusCode === 500) {
    console.error("💥 Error Stack:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors !== undefined && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    AppError.notFound(
      `Cannot find route ${req.method} ${req.originalUrl} on this server`,
    ),
  );
};
