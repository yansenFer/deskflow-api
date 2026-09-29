import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { userController } from "./user.controller";

const router = Router();

// Public routes
router.get("/", authenticate, asyncHandler(userController.getAll));

export const userRouters = router;
