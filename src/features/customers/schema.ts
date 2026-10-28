import { z } from "zod";

import { optionalEmailSchema, optionalTextSchema } from "@/lib/validation";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the customer's name")
    .max(200, "Name is too long"),
  phoneNumber: optionalTextSchema,
  email: optionalEmailSchema,
  notes: optionalTextSchema,
});

export type CustomerInput = z.infer<typeof customerSchema>;
