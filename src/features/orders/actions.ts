"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/auth";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { getCustomer } from "@/features/customers/queries";
import {
  newOrderSchema,
  orderDetailsSchema,
  orderStatusUpdateSchema,
} from "@/features/orders/schema";
import {
  type ActionState,
  actionError,
  actionValidationError,
  successActionState,
} from "@/lib/action-state";
import { defaultCurrency } from "@/lib/money";
import { formDataToObject } from "@/lib/validation";

function revalidateOrderPages(orderId?: string) {
  revalidatePath("/orders");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }
}

export async function createOrder(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = newOrderSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }
  const input = parsed.data;

  if (input.customerMode === "existing") {
    const customer = await getCustomer(userId, input.customerId);
    if (!customer) {
      return {
        status: "error",
        message: null,
        fieldErrors: { customerId: ["Choose a customer"] },
        values,
      };
    }
  }

  const orderId = await db.transaction(async (tx) => {
    let customerId: string;
    if (input.customerMode === "new") {
      const [customer] = await tx
        .insert(customers)
        .values({
          userId,
          name: input.customerName,
          phoneNumber: input.customerPhoneNumber,
        })
        .returning({ id: customers.id });
      customerId = customer.id;
    } else {
      customerId = input.customerId;
    }

    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        customerId,
        title: input.title,
        description: input.description,
        currency: defaultCurrency,
        amountCharged: input.amountCharged,
        orderDate: input.orderDate,
        dueDate: input.dueDate,
        notes: input.notes,
      })
      .returning({ id: orders.id });
    return order.id;
  });

  revalidateOrderPages();
  redirect(`/orders/${orderId}`);
}

export async function updateOrderDetails(
  orderId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = orderDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }

  const updated = await db
    .update(orders)
    .set(parsed.data)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .returning({ id: orders.id });

  if (updated.length === 0) {
    return actionError("Order not found");
  }

  revalidateOrderPages(orderId);
  return successActionState;
}

export async function updateOrderStatus(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = orderStatusUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }
  const { orderId, status } = parsed.data;

  const updated = await db
    .update(orders)
    .set({
      status,
      deliveredAt:
        status === "delivered"
          ? sql`coalesce(${orders.deliveredAt}, now())`
          : null,
    })
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .returning({ id: orders.id });

  if (updated.length === 0) {
    return actionError("Order not found");
  }

  revalidateOrderPages(orderId);
  return successActionState;
}

export async function deleteOrder(
  orderId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .returning({ id: orders.id });

  if (deleted.length === 0) {
    return actionError("Order not found");
  }

  revalidateOrderPages();
  redirect("/orders");
}
