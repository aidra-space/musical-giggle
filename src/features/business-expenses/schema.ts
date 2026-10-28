import { z } from "zod";

import { businessExpenseCategories } from "@/db/enums";
import { dateSchema, moneySchema, optionalTextSchema } from "@/lib/validation";

export const businessExpenseSchema = z.object({
  category: z.enum(businessExpenseCategories, { error: "Choose a category" }),
  description: z
    .string()
    .trim()
    .min(1, "Describe the expense")
    .max(200, "Description is too long"),
  amount: moneySchema,
  expenseDate: dateSchema,
  vendor: optionalTextSchema,
  notes: optionalTextSchema,
});

export const businessExpenseCategoryFilterSchema = z
  .enum(businessExpenseCategories)
  .optional()
  .catch(undefined);
