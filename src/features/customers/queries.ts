import { and, asc, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { type Customer, customers, orders } from "@/db/schema";
import { orderFinancials } from "@/features/orders/financials";
import { listOrdersWithTotals } from "@/features/orders/queries";

export async function listCustomers(userId: string): Promise<Customer[]> {
  return db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(asc(customers.name));
}

export async function getCustomer(
  userId: string,
  customerId: string,
): Promise<Customer | null> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .limit(1);
  return customer ?? null;
}

export async function countCustomerOrders(
  userId: string,
  customerId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.customerId, customerId)));
  return row?.value ?? 0;
}

export type CustomerTotals = {
  orderCount: number;
  totalValue: number;
  amountReceived: number;
  outstanding: number;
};

const emptyTotals: CustomerTotals = {
  orderCount: 0,
  totalValue: 0,
  amountReceived: 0,
  outstanding: 0,
};

export type CustomerWithTotals = Customer & CustomerTotals;

export async function listCustomersWithTotals(
  userId: string,
): Promise<CustomerWithTotals[]> {
  const [customerRows, orderRows] = await Promise.all([
    listCustomers(userId),
    listOrdersWithTotals(userId, {}),
  ]);

  const totalsByCustomer = new Map<string, CustomerTotals>();
  for (const order of orderRows) {
    const money = orderFinancials(order);
    const current = totalsByCustomer.get(order.customerId) ?? emptyTotals;
    totalsByCustomer.set(order.customerId, {
      orderCount: current.orderCount + 1,
      totalValue: current.totalValue + money.revenue,
      amountReceived: current.amountReceived + money.amountReceived,
      outstanding: current.outstanding + money.outstanding,
    });
  }

  return customerRows.map((customer) => ({
    ...customer,
    ...(totalsByCustomer.get(customer.id) ?? emptyTotals),
  }));
}
