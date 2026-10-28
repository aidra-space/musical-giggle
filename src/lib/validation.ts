import { z } from "zod";

import { isIsoDate } from "@/lib/dates";
import { ulidPattern } from "@/lib/id";
import { parseMoney } from "@/lib/money";

export const idSchema = z.string().regex(ulidPattern, "Invalid id");

export const optionalTextSchema = z
  .string()
  .trim()
  .max(2000, "Too long")
  .optional()
  .transform((value) => (value ? value : null));

export const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }
    if (!z.email().safeParse(value).success) {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address" });
      return z.NEVER;
    }
    return value;
  });

export const moneySchema = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .transform((value, ctx) => {
    const minor = parseMoney(value);
    if (minor === null) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount, for example 150000 or 2500.50",
      });
      return z.NEVER;
    }
    return minor;
  });

export const dateSchema = z
  .string()
  .trim()
  .min(1, "Enter a date")
  .refine(isIsoDate, "Enter a valid date");

export const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }
    if (!isIsoDate(value)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      return z.NEVER;
    }
    return value;
  });

export function formDataToObject(formData: FormData): Record<string, string> {
  const object: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      object[key] = value;
    }
  }
  return object;
}
