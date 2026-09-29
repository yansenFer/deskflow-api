import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { RoomService } from "./room.service";
import type { RoomQuerySchema } from "./room.schema";

export class RoomController {
  static getAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as RoomQuerySchema;

    const { room, pagination } = await RoomService.getAll(query);

    sendSuccess(res, {
      message: "Room retrieved successfully",
      data: room,
      pagination,
    });
  };
}
