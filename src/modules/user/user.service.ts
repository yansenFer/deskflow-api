import type { Prisma } from "@prisma/client";
import type { UserQuerySchema } from "./user.schema";
import { prisma } from "../../config/prisma";
import { use } from "react";

export class UserService {
  static async getAll(query: Partial<UserQuerySchema>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const { search, userId, email } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (email) {
      where.email = {
        contains: email,
      };
    }

    if (userId) {
      where.id = userId;
    }

    const [user, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      user,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
