import type { Metadata } from "next";
import Link from "next/link";

import { requireUserId } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listCustomers } from "@/features/customers/queries";
import { OrdersFilter } from "@/features/orders/orders-filter";
import { OrdersTable } from "@/features/orders/orders-table";
import { listOrdersWithTotals } from "@/features/orders/queries";
import { orderFiltersSchema } from "@/features/orders/schema";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const filters = orderFiltersSchema.parse({
    status: params.status,
    customer: params.customer,
  });

  const customers = await listCustomers(userId);
  const customerId = customers.find((item) => item.id === filters.customer)?.id;
  const hasFilters = Boolean(filters.status || customerId);

  const orders = await listOrdersWithTotals(userId, {
    status: filters.status,
    customerId,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Every outfit, what it brings in and what it costs to make."
      >
        <Button asChild>
          <Link href="/orders/new">Add order</Link>
        </Button>
      </PageHeader>

      <OrdersFilter
        customers={customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
        }))}
        status={filters.status}
        customerId={customerId}
      />

      {orders.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="No orders match these filters"
            description="Try a different status or customer."
          >
            <Button variant="outline" asChild>
              <Link href="/orders">Clear filters</Link>
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Add your first outfit to start tracking profit."
          >
            <Button asChild>
              <Link href="/orders/new">Add order</Link>
            </Button>
          </EmptyState>
        )
      ) : (
        <Card className="gap-0 px-2 py-2">
          <OrdersTable orders={orders} />
        </Card>
      )}
    </div>
  );
}
