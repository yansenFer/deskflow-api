import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { UserQuerySchema } from "./user.schema";
import { UserService } from "./user.service";

export class userController {
  static getAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as UserQuerySchema;

    const { user, pagination } = await UserService.getAll(query);

    sendSuccess(res, {
      message: "User retrieved successfully",
      data: user,
      pagination,
    });
  };
}
