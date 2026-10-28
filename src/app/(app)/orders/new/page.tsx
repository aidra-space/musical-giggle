import type { Metadata } from "next";

import { requireUserId } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { listCustomers } from "@/features/customers/queries";
import { OrderForm } from "@/features/orders/order-form";
import { todayIsoDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Add order",
};

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string | string[] }>;
}) {
  const userId = await requireUserId();
  const { customer } = await searchParams;
  const customers = await listCustomers(userId);
  const defaultCustomerId = customers.find((item) => item.id === customer)?.id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Add order"
        description="Who is it for, what is it, and what did you agree to charge."
      />
      <Card>
        <CardContent>
          <OrderForm
            customers={customers.map((item) => ({
              id: item.id,
              name: item.name,
            }))}
            defaultCustomerId={defaultCustomerId}
            defaultOrderDate={todayIsoDate()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
