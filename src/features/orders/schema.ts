import { z } from "zod";

import { orderStatuses } from "@/db/enums";
import { ulidPattern } from "@/lib/id";
import {
  dateSchema,
  idSchema,
  moneySchema,
  optionalDateSchema,
  optionalTextSchema,
} from "@/lib/validation";

export const orderStatusSchema = z.enum(orderStatuses, {
  error: "Choose a status",
});

export const orderDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the outfit a name")
    .max(200, "Name is too long"),
  description: optionalTextSchema,
  amountCharged: moneySchema,
  orderDate: dateSchema,
  dueDate: optionalDateSchema,
  notes: optionalTextSchema,
});

export const newOrderSchema = z.discriminatedUnion("customerMode", [
  orderDetailsSchema.extend({
    customerMode: z.literal("existing"),
    customerId: z.string().regex(ulidPattern, "Choose a customer"),
  }),
  orderDetailsSchema.extend({
    customerMode: z.literal("new"),
    customerName: z
      .string()
      .trim()
      .min(1, "Enter the customer's name")
      .max(200, "Name is too long"),
    customerPhoneNumber: optionalTextSchema,
  }),
]);

export const orderStatusUpdateSchema = z.object({
  orderId: idSchema,
  status: orderStatusSchema,
});

export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional().catch(undefined),
  customer: idSchema.optional().catch(undefined),
});
