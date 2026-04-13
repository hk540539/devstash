"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItemById, deleteItemById, createItemInDb } from "@/lib/db/items";
import type { ItemDetail, ItemWithMeta } from "@/lib/db/items";

const CreateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().transform((v) => v || null),
  content: z.string().optional().transform((v) => v || null),
  url: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null)
    .pipe(
      z
        .string()
        .refine(
          (v) => { try { new URL(v); return true; } catch { return false; } },
          { message: "Must be a valid URL" },
        )
        .nullable(),
    ),
  language: z.string().trim().optional().transform((v) => v?.trim() || null),
  typeId: z.string().min(1, "Type is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
});

type CreateItemInput = {
  title: string;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  typeId: string;
  tags: string[];
};

type CreateResult =
  | { success: true; data: ItemWithMeta }
  | { success: false; error: string };

export async function createItem(input: CreateItemInput): Promise<CreateResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = CreateItemSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: message };
  }

  const { title, description, content, url, language, typeId, tags } = parsed.data;

  try {
    const item = await createItemInDb(session.user.id, {
      title,
      description: description ?? null,
      content: content ?? null,
      url: url ?? null,
      language: language ?? null,
      typeId,
      tags,
    });
    return { success: true, data: item };
  } catch {
    return { success: false, error: "Failed to create item. Please try again." };
  }
}

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

type DeleteResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteItemById(itemId, session.user.id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item. Please try again." };
  }
}

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