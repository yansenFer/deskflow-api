import { meiliClient } from "../../config/meilisearch";
import { prisma } from "../../config/prisma";

export const USER_SEARCH_INDEX = "users";

export interface UserSearchDocument {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: number;
}

export class UserSearchService {
  private static index = meiliClient.index<UserSearchDocument>(USER_SEARCH_INDEX);

  /**
   * Setup index settings (searchable & filterable attributes)
   */
  static async setupIndex() {
    try {
      await this.index.updateSearchableAttributes(["name", "email"]);
      await this.index.updateFilterableAttributes(["role"]);
      await this.index.updateSortableAttributes(["createdAt"]);
    } catch (err) {
      console.warn("Meilisearch setupIndex warning:", err);
    }
  }

  /**
   * Sync a single user to Meilisearch
   */
  static async syncUser(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }) {
    try {
      await this.index.addDocuments([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.getTime(),
        },
      ]);
    } catch (err) {
      console.error("Failed to sync user to Meilisearch:", err);
    }
  }

  /**
   * Remove a user from Meilisearch
   */
  static async deleteUser(userId: string) {
    try {
      await this.index.deleteDocument(userId);
    } catch (err) {
      console.error("Failed to delete user from Meilisearch:", err);
    }
  }

  /**
   * Sync all users from MySQL to Meilisearch
   */
  static async syncAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (users.length === 0) return { totalSynced: 0 };

    const documents: UserSearchDocument[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.getTime(),
    }));

    await this.index.addDocuments(documents);
    return { totalSynced: documents.length };
  }

  /**
   * Search users with typo tolerance, infix/substring, and ranking
   */
  static async search(query: string, options: { limit: number; offset: number }) {
    const result = await this.index.search(query, {
      limit: options.limit,
      offset: options.offset,
    });

    return {
      hits: result.hits,
      total: result.estimatedTotalHits ?? result.hits.length,
      page: Math.floor(options.offset / options.limit) + 1,
      limit: options.limit,
      totalPages: Math.ceil((result.estimatedTotalHits ?? result.hits.length) / options.limit),
    };
  }
}
