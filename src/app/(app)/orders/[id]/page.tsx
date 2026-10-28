import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUserId } from "@/auth";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderExpenseDialog } from "@/features/order-expenses/order-expense-dialog";
import { OrderExpensesTable } from "@/features/order-expenses/order-expenses-table";
import { listOrderExpenses } from "@/features/order-expenses/queries";
import { deleteOrder } from "@/features/orders/actions";
import { orderFinancials } from "@/features/orders/financials";
import { OrderDetailsDialog } from "@/features/orders/order-details-dialog";
import { OrderMoneySummary } from "@/features/orders/order-money-summary";
import { OrderStatusSelect } from "@/features/orders/order-status-select";
import { getOrder } from "@/features/orders/queries";
import { PaymentDialog } from "@/features/payments/payment-dialog";
import { PaymentsTable } from "@/features/payments/payments-table";
import { listOrderPayments } from "@/features/payments/queries";
import { formatDate, formatDateTime, todayIsoDate } from "@/lib/dates";
import { ulidPattern } from "@/lib/id";
import {
  formatMoney,
  isCurrencyCode,
  sumAmounts,
  toMajorUnits,
} from "@/lib/money";

export const metadata: Metadata = {
  title: "Order",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  if (!ulidPattern.test(id)) {
    notFound();
  }

  const [order, paymentRows, expenseRows] = await Promise.all([
    getOrder(userId, id),
    listOrderPayments(userId, id),
    listOrderExpenses(userId, id),
  ]);
  if (!order) {
    notFound();
  }

  const currency = isCurrencyCode(order.currency) ? order.currency : undefined;
  const cancelled = order.status === "cancelled";
  const money = orderFinancials({
    status: order.status,
    amountCharged: order.amountCharged,
    amountReceived: sumAmounts(paymentRows),
    directCost: sumAmounts(expenseRows),
  });
  const today = todayIsoDate();

  const dateLine = [
    `Ordered ${formatDate(order.orderDate)}`,
    order.dueDate ? `Due ${formatDate(order.dueDate)}` : null,
    order.deliveredAt ? `Delivered ${formatDateTime(order.deliveredAt)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/orders"
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← All orders
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Customer:{" "}
            <Link
              href={`/customers/${order.customerId}`}
              className="font-medium text-foreground hover:underline"
            >
              {order.customerName}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{order.title}</h1>
          {order.description ? (
            <p className="max-w-prose text-sm text-muted-foreground">
              {order.description}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">{dateLine}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusSelect orderId={order.id} status={order.status} />
          <OrderDetailsDialog
            order={{
              id: order.id,
              title: order.title,
              description: order.description,
              amountCharged: toMajorUnits(order.amountCharged, currency),
              orderDate: order.orderDate,
              dueDate: order.dueDate,
              notes: order.notes,
            }}
          />
          <DeleteButton
            action={deleteOrder.bind(null, order.id)}
            confirmText="Delete this order together with its payments and expenses? This cannot be undone."
            variant="outline"
            size="default"
          >
            Delete
          </DeleteButton>
        </div>
      </div>

      <OrderMoneySummary money={money} currency={currency} cancelled={cancelled} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>What the customer has paid so far.</CardDescription>
            <CardAction>
              <PaymentDialog
                orderId={order.id}
                outstanding={
                  money.outstanding > 0
                    ? formatMoney(money.outstanding, currency)
                    : null
                }
                defaultDate={today}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            {paymentRows.length === 0 ? (
              <EmptyState
                title="No payments yet"
                description="Record the deposit or any payment as soon as it lands."
              />
            ) : (
              <PaymentsTable payments={paymentRows} currency={currency} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Everything spent making this outfit.</CardDescription>
            <CardAction>
              <OrderExpenseDialog orderId={order.id} defaultDate={today} />
            </CardAction>
          </CardHeader>
          <CardContent>
            {expenseRows.length === 0 ? (
              <EmptyState
                title="No expenses yet"
                description="Add fabric, tailoring, delivery and other costs to see the real profit."
              />
            ) : (
              <OrderExpensesTable expenses={expenseRows} currency={currency} />
            )}
          </CardContent>
        </Card>
      </div>

      {order.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
