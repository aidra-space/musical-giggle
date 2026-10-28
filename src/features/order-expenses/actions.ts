"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { db } from "@/db";
import { orderExpenses } from "@/db/schema";
import { orderExpenseSchema } from "@/features/order-expenses/schema";
import { getOrder } from "@/features/orders/queries";
import {
  type ActionState,
  actionError,
  actionValidationError,
  successActionState,
} from "@/lib/action-state";
import { formDataToObject } from "@/lib/validation";

function revalidateExpensePages(orderId: string) {
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
}

export async function addOrderExpense(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = orderExpenseSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }
  const { orderId, ...expense } = parsed.data;

  const order = await getOrder(userId, orderId);
  if (!order) {
    return actionError("Order not found", values);
  }

  await db.insert(orderExpenses).values({
    userId,
    orderId: order.id,
    currency: order.currency,
    ...expense,
  });

  revalidateExpensePages(order.id);
  return successActionState;
}

export async function deleteOrderExpense(
  expenseId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(orderExpenses)
    .where(and(eq(orderExpenses.id, expenseId), eq(orderExpenses.userId, userId)))
    .returning({ orderId: orderExpenses.orderId });

  if (deleted.length === 0) {
    return actionError("Expense not found");
  }

  revalidateExpensePages(deleted[0].orderId);
  return successActionState;
}
