import { z } from "zod";

/** Validates and normalises a URL field that may be empty/null */
export const urlField = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v?.trim() === "" ? null : v?.trim() ?? null))
  .pipe(
    z
      .string()
      .refine(
        (v) => { try { new URL(v); return true; } catch { return false; } },
        { message: "Must be a valid URL" },
      )
      .nullable(),
  );
