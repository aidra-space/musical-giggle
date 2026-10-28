import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  type Order,
  type OrderStatus,
  customers,
  orderExpenses,
  orders,
  payments,
} from "@/db/schema";

const amountReceivedSql = sql<number>`coalesce((select sum(${payments.amount}) from ${payments} where ${payments.orderId} = ${orders.id}), 0)`.mapWith(
  Number,
);

const directCostSql = sql<number>`coalesce((select sum(${orderExpenses.amount}) from ${orderExpenses} where ${orderExpenses.orderId} = ${orders.id}), 0)`.mapWith(
  Number,
);

export type OrderWithTotals = {
  id: string;
  title: string;
  status: OrderStatus;
  currency: string;
  amountCharged: number;
  orderDate: string;
  dueDate: string | null;
  createdAt: Date;
  customerId: string;
  customerName: string;
  amountReceived: number;
  directCost: number;
};

export type OrderFilters = {
  status?: OrderStatus;
  customerId?: string;
  from?: string | null;
  to?: string | null;
};

export async function listOrdersWithTotals(
  userId: string,
  filters: OrderFilters,
): Promise<OrderWithTotals[]> {
  return db
    .select({
      id: orders.id,
      title: orders.title,
      status: orders.status,
      currency: orders.currency,
      amountCharged: orders.amountCharged,
      orderDate: orders.orderDate,
      dueDate: orders.dueDate,
      createdAt: orders.createdAt,
      customerId: customers.id,
      customerName: customers.name,
      amountReceived: amountReceivedSql,
      directCost: directCostSql,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(
      and(
        eq(orders.userId, userId),
        filters.status ? eq(orders.status, filters.status) : undefined,
        filters.customerId ? eq(orders.customerId, filters.customerId) : undefined,
        filters.from ? gte(orders.orderDate, filters.from) : undefined,
        filters.to ? lte(orders.orderDate, filters.to) : undefined,
      ),
    )
    .orderBy(desc(orders.orderDate), desc(orders.createdAt));
}

export type OrderWithCustomer = Order & { customerName: string };

export async function getOrder(
  userId: string,
  orderId: string,
): Promise<OrderWithCustomer | null> {
  const [row] = await db
    .select({ order: orders, customerName: customers.name })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }
  return { ...row.order, customerName: row.customerName };
}

export async function orderExists(
  userId: string,
  orderId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  return row !== undefined;
}
