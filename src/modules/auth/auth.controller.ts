import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/app-error";

export class AuthController {
  static register = async (req: Request, res: Response): Promise<void> => {
    const user = await AuthService.register(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: "User registered successfully",
      data: user,
    });
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);
    sendSuccess(res, {
      statusCode: 200,
      message: "Login successful",
      data: result,
    });
  };

  static getProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const profile = await AuthService.getProfile(req.user.id);
    sendSuccess(res, {
      statusCode: 200,
      message: "User profile retrieved",
      data: profile,
    });
  };
}
