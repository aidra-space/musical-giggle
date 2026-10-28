import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { type Payment, payments } from "@/db/schema";

export async function listOrderPayments(
  userId: string,
  orderId: string,
): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.orderId, orderId)))
    .orderBy(desc(payments.paymentDate), desc(payments.createdAt));
}

export async function sumPaymentsByDate(
  userId: string,
  range: { from: string | null; to: string | null },
): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${payments.amount}), 0)`.mapWith(Number),
    })
    .from(payments)
    .where(
      and(
        eq(payments.userId, userId),
        range.from ? gte(payments.paymentDate, range.from) : undefined,
        range.to ? lte(payments.paymentDate, range.to) : undefined,
      ),
    );
  return row?.total ?? 0;
}
