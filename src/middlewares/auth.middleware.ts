import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import type { AuthUser } from "../types/auth";

interface JwtPayload {
  userId: string;
  role: Role;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Authentication token is missing");
    }

    const token = authHeader.split(" ")[1] || "";
    const jwtSecret = env.JWT_SECRET;

    if (!jwtSecret && !token) {
      throw new Error("JWT_SECRET or token is not defined");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch {
      throw AppError.unauthorized("Invalid or expired authentication token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized(
        "User associated with this token no longer exists",
      );
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized("You must be logged in to perform this action"),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
        ),
      );
    }

    next();
  };
};
