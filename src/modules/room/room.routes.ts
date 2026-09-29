import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { RoomController } from "./room.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(RoomController.getAll));

export const roomRouters = router;
