import type { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
}

export const sendSuccess = <T>(
  res: Response,
  {
    statusCode = 200,
    message = "Success",
    data,
    pagination,
  }: SuccessResponseOptions<T>,
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};
