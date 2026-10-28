"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getOrder } from "@/features/orders/queries";
import { paymentSchema } from "@/features/payments/schema";
import {
  type ActionState,
  actionError,
  actionValidationError,
  successActionState,
} from "@/lib/action-state";
import { formDataToObject } from "@/lib/validation";

function revalidatePaymentPages(orderId: string) {
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
}

export async function recordPayment(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }
  const { orderId, ...payment } = parsed.data;

  const order = await getOrder(userId, orderId);
  if (!order) {
    return actionError("Order not found", values);
  }

  await db.insert(payments).values({
    userId,
    orderId: order.id,
    currency: order.currency,
    ...payment,
  });

  revalidatePaymentPages(order.id);
  return successActionState;
}

export async function deletePayment(
  paymentId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.userId, userId)))
    .returning({ orderId: payments.orderId });

  if (deleted.length === 0) {
    return actionError("Payment not found");
  }

  revalidatePaymentPages(deleted[0].orderId);
  return successActionState;
}
