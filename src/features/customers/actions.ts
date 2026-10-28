"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/auth";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { countCustomerOrders } from "@/features/customers/queries";
import { customerSchema } from "@/features/customers/schema";
import {
  type ActionState,
  actionError,
  actionValidationError,
  successActionState,
} from "@/lib/action-state";
import { formDataToObject } from "@/lib/validation";

export async function createCustomer(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }

  await db.insert(customers).values({ userId, ...parsed.data });

  revalidatePath("/customers");
  revalidatePath("/orders/new");
  return successActionState;
}

export async function updateCustomer(
  customerId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }

  const updated = await db
    .update(customers)
    .set(parsed.data)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .returning({ id: customers.id });

  if (updated.length === 0) {
    return actionError("Customer not found");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return successActionState;
}

export async function deleteCustomer(
  customerId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const orderCount = await countCustomerOrders(userId, customerId);
  if (orderCount > 0) {
    return actionError(
      "This customer has orders. Delete or move those orders before deleting the customer.",
    );
  }

  const deleted = await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .returning({ id: customers.id });

  if (deleted.length === 0) {
    return actionError("Customer not found");
  }

  revalidatePath("/customers");
  redirect("/customers");
}
