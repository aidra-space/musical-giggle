import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUserId } from "@/auth";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCustomer } from "@/features/customers/actions";
import { CustomerDialog } from "@/features/customers/customer-dialog";
import { getCustomer } from "@/features/customers/queries";
import { orderFinancials, sumOrderFinancials } from "@/features/orders/financials";
import { OrdersTable } from "@/features/orders/orders-table";
import { listOrdersWithTotals } from "@/features/orders/queries";
import { ulidPattern } from "@/lib/id";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Customer",
};

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  if (!ulidPattern.test(id)) {
    notFound();
  }

  const [customer, orders] = await Promise.all([
    getCustomer(userId, id),
    listOrdersWithTotals(userId, { customerId: id }),
  ]);
  if (!customer) {
    notFound();
  }

  const totals = sumOrderFinancials(orders.map(orderFinancials));
  const contactLine = [customer.phoneNumber, customer.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/customers"
        className="w-fit text-sm text-muted-foreground hover:underline"
      >
        ← All customers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {contactLine || "No contact details yet"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/orders/new?customer=${customer.id}`}>Add order</Link>
          </Button>
          <CustomerDialog
            customer={customer}
            trigger={<Button variant="outline">Edit</Button>}
          />
          {orders.length === 0 ? (
            <DeleteButton
              action={deleteCustomer.bind(null, customer.id)}
              confirmText={`Delete ${customer.name}?`}
              variant="outline"
              size="default"
            >
              Delete
            </DeleteButton>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders" value={String(totals.orderCount)} />
        <Stat label="Total business" value={formatMoney(totals.revenue)} />
        <Stat label="Received" value={formatMoney(totals.amountReceived)} />
        <Stat
          label="Still owes"
          value={formatMoney(totals.outstanding)}
          tone={totals.outstanding > 0 ? "negative" : "muted"}
        />
      </div>

      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          {orders.length === 0 ? (
            <EmptyState
              title="No orders for this customer yet"
              description="Add an outfit to start tracking what it costs and earns."
            >
              <Button asChild>
                <Link href={`/orders/new?customer=${customer.id}`}>
                  Add order
                </Link>
              </Button>
            </EmptyState>
          ) : (
            <OrdersTable orders={orders} showCustomer={false} />
          )}
        </CardContent>
      </Card>

      {customer.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{customer.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
