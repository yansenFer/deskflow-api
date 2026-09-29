import type { Prisma } from "@prisma/client";
import type { RoomQuerySchema } from "./room.schema";
import { prisma } from "../../config/prisma";
import { getCachedCount } from "../../utils/db-cache";

export class RoomService {
  static async getAll(query: Partial<RoomQuerySchema>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const { search, roomId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (roomId) {
      where.id = roomId;
    }

    const [room, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      getCachedCount({
        modelName: "room",
        model: prisma.room,
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      room,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
