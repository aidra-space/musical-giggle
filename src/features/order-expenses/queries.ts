import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  type OrderExpense,
  type OrderExpenseCategory,
  orderExpenses,
  orders,
} from "@/db/schema";

export async function listOrderExpenses(
  userId: string,
  orderId: string,
): Promise<OrderExpense[]> {
  return db
    .select()
    .from(orderExpenses)
    .where(
      and(eq(orderExpenses.userId, userId), eq(orderExpenses.orderId, orderId)),
    )
    .orderBy(desc(orderExpenses.expenseDate), desc(orderExpenses.createdAt));
}

export type CategoryTotal<Category extends string> = {
  category: Category;
  total: number;
};

export async function sumOrderExpensesByCategory(
  userId: string,
  orderDateRange: { from: string | null; to: string | null },
): Promise<CategoryTotal<OrderExpenseCategory>[]> {
  return db
    .select({
      category: orderExpenses.category,
      total: sql<number>`coalesce(sum(${orderExpenses.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(orderExpenses)
    .innerJoin(orders, eq(orders.id, orderExpenses.orderId))
    .where(
      and(
        eq(orderExpenses.userId, userId),
        orderDateRange.from
          ? gte(orders.orderDate, orderDateRange.from)
          : undefined,
        orderDateRange.to ? lte(orders.orderDate, orderDateRange.to) : undefined,
      ),
    )
    .groupBy(orderExpenses.category)
    .orderBy(desc(sql`sum(${orderExpenses.amount})`));
}
