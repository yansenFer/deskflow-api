import { Router } from "express";
import { AuthController } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.schema";
import { validateRequest } from "../../middlewares/validate.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { Role } from "@prisma/client";

const router = Router();

// Public routes
router.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(AuthController.login),
);

// Protected routes (Only ADMIN can register new cashiers/admins)
router.post(
  "/register",
  authenticate,
  authorize(Role.ADMIN),
  validateRequest(registerSchema),
  asyncHandler(AuthController.register),
);

// Get current logged-in user profile
router.get("/me", authenticate, asyncHandler(AuthController.getProfile));

export const authRoutes = router;
