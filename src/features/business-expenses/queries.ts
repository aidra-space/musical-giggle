import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  type BusinessExpense,
  type BusinessExpenseCategory,
  businessExpenses,
} from "@/db/schema";
import type { CategoryTotal } from "@/features/order-expenses/queries";

export type BusinessExpenseFilters = {
  from: string | null;
  to: string | null;
  category?: BusinessExpenseCategory;
};

function filterConditions(userId: string, filters: BusinessExpenseFilters) {
  return and(
    eq(businessExpenses.userId, userId),
    filters.from ? gte(businessExpenses.expenseDate, filters.from) : undefined,
    filters.to ? lte(businessExpenses.expenseDate, filters.to) : undefined,
    filters.category ? eq(businessExpenses.category, filters.category) : undefined,
  );
}

export async function listBusinessExpenses(
  userId: string,
  filters: BusinessExpenseFilters,
): Promise<BusinessExpense[]> {
  return db
    .select()
    .from(businessExpenses)
    .where(filterConditions(userId, filters))
    .orderBy(desc(businessExpenses.expenseDate), desc(businessExpenses.createdAt));
}

export async function sumBusinessExpenses(
  userId: string,
  filters: BusinessExpenseFilters,
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${businessExpenses.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(businessExpenses)
    .where(filterConditions(userId, filters));
  return row?.total ?? 0;
}

export async function sumBusinessExpensesByCategory(
  userId: string,
  range: { from: string | null; to: string | null },
): Promise<CategoryTotal<BusinessExpenseCategory>[]> {
  return db
    .select({
      category: businessExpenses.category,
      total: sql<number>`coalesce(sum(${businessExpenses.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(businessExpenses)
    .where(filterConditions(userId, range))
    .groupBy(businessExpenses.category)
    .orderBy(desc(sql`sum(${businessExpenses.amount})`));
}

export async function sumBusinessExpensesByMonth(
  userId: string,
  range: { from: string; to: string },
): Promise<{ month: string; total: number }[]> {
  const month = sql<string>`to_char(${businessExpenses.expenseDate}, 'YYYY-MM')`;
  return db
    .select({
      month,
      total: sql<number>`coalesce(sum(${businessExpenses.amount}), 0)`.mapWith(
        Number,
      ),
    })
    .from(businessExpenses)
    .where(filterConditions(userId, range))
    .groupBy(month)
    .orderBy(month);
}
