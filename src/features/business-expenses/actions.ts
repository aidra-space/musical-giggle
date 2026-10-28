"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { db } from "@/db";
import { businessExpenses } from "@/db/schema";
import { businessExpenseSchema } from "@/features/business-expenses/schema";
import {
  type ActionState,
  actionError,
  actionValidationError,
  successActionState,
} from "@/lib/action-state";
import { defaultCurrency } from "@/lib/money";
import { formDataToObject } from "@/lib/validation";

export async function addBusinessExpense(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const values = formDataToObject(formData);
  const parsed = businessExpenseSchema.safeParse(values);
  if (!parsed.success) {
    return actionValidationError(parsed.error, values);
  }

  await db.insert(businessExpenses).values({
    userId,
    currency: defaultCurrency,
    ...parsed.data,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return successActionState;
}

export async function deleteBusinessExpense(
  expenseId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const deleted = await db
    .delete(businessExpenses)
    .where(
      and(eq(businessExpenses.id, expenseId), eq(businessExpenses.userId, userId)),
    )
    .returning({ id: businessExpenses.id });

  if (deleted.length === 0) {
    return actionError("Expense not found");
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return successActionState;
}
