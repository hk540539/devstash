"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItemById } from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v?.trim() === "" ? null : v?.trim() ?? null))
    .pipe(
      z
        .string()
        .refine(
          (v) => {
            try { new URL(v); return true; } catch { return false; }
          },
          { message: "Must be a valid URL" },
        )
        .nullable(),
    ),
  language: z.string().trim().nullable().optional().transform((v) => v?.trim() || null),
  tags: z.array(z.string().trim().min(1)),
});

type UpdateItemInput = {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
};

type ActionResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  input: UpdateItemInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = UpdateItemSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { title, description, content, url, language, tags } = parsed.data;

  try {
    const item = await updateItemById(itemId, session.user.id, {
      title,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      tags,
    });
    return { success: true, data: item };
  } catch {
    return { success: false, error: "Failed to save changes. Please try again." };
  }
}