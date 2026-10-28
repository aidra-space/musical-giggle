import { z } from "zod";

import { orderExpenseCategories } from "@/db/enums";
import {
  dateSchema,
  idSchema,
  moneySchema,
  optionalTextSchema,
} from "@/lib/validation";

export const orderExpenseSchema = z.object({
  orderId: idSchema,
  category: z.enum(orderExpenseCategories, { error: "Choose a category" }),
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
