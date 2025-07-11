"use server";

import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const ShoppingListItem = z.object({
  category: z.string(),
});

export async function categorizeItem(item: string): Promise<string> {
  const response = await openai.responses.parse({
    model: "gpt-4.1-nano-2025-04-14",
    input: [
      {
        role: "system",
        content:
          "Assign the item to one of following categories: Produce, Meat & Seafood, Bakery, Canned Goods, Beverages, Dairy, Snacks, Pantry Items, Frozen Foods, Household, Personal Care, Baby, Pet Care, Clothing, Other",
      },
      {
        role: "user",
        content: item,
      },
    ],
    text: {
      format: zodTextFormat(ShoppingListItem, "item"),
    },
  });

  return response.output_parsed?.category || "Other";
}
