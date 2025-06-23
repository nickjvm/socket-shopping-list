"use server";

import db from "@/db";
import { gt, eq, not, and, desc, isNull } from "drizzle-orm";
import { items } from "@/../drizzle/schema";

export const fetchRecentlyCompletedItems = async (
  listId: string
): Promise<ApiResponse<string[]>> => {
  try {
    const recentlyCompletedItems = await db
      .select({ id: items.id })
      .from(items)
      .where(
        and(
          eq(items.listId, listId),
          not(isNull(items.completedAt)),
          gt(items.completedAt, Date.now() - 60 * 60 * 1000)
        )
      )
      .orderBy(desc(items.completedAt));

    return {
      status: 200,
      message: "Recently deleted items fetched successfully",
      data: recentlyCompletedItems.map((item) => item.id),
    };
  } catch (error) {
    return {
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "Unable to fetch recently deleted items",
      errors: {
        general: "An error occurred while fetching recently deleted items.",
      },
    };
  }
};
