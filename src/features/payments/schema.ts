import { z } from "zod";

import { paymentMethods } from "@/db/enums";
import {
  dateSchema,
  idSchema,
  moneySchema,
  optionalTextSchema,
} from "@/lib/validation";

export const paymentSchema = z.object({
  orderId: idSchema,
  amount: moneySchema.refine((minor) => minor > 0, "Enter an amount above zero"),
  paymentDate: dateSchema,
  paymentMethod: z
    .enum(paymentMethods)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  reference: optionalTextSchema,
  notes: optionalTextSchema,
});
