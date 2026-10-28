import type { Metadata } from "next";
import Link from "next/link";

import { requireUserId } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { PeriodPicker } from "@/components/period-picker";
import { Button } from "@/components/ui/button";
import { businessExpenseCategoryLabels } from "@/features/business-expenses/labels";
import { CategoryBreakdown } from "@/features/dashboard/category-breakdown";
import { MetricCards } from "@/features/dashboard/metric-cards";
import { MonthlyOverview } from "@/features/dashboard/monthly-overview";
import {
  OwingOrders,
  RecentOrders,
  TopOrders,
} from "@/features/dashboard/order-lists";
import { getDashboardData } from "@/features/dashboard/queries";
import { orderExpenseCategoryLabels } from "@/features/order-expenses/labels";
import { resolvePeriod } from "@/lib/period";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await requireUserId();
  const period = resolvePeriod(await searchParams);
  const data = await getDashboardData(userId, period);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="How the business is doing, in plain numbers."
      >
        <Button variant="outline" asChild>
          <Link href="/expenses">Add expense</Link>
        </Button>
        <Button asChild>
          <Link href="/orders/new">Add order</Link>
        </Button>
      </PageHeader>

      <PeriodPicker period={period} basePath="/dashboard" />

      <MetricCards
        totals={data.totals}
        outstandingTotal={data.outstandingTotal}
        periodLabel={period.label}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OwingOrders orders={data.owingOrders} />
        <TopOrders orders={data.topOrders} />
      </div>

      <MonthlyOverview monthly={data.monthly} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown
          title="Cost to make, by category"
          description={`What went into orders dated ${period.label}.`}
          rows={data.orderExpenseBreakdown.map((row) => ({
            category: row.category,
            label: orderExpenseCategoryLabels[row.category],
            total: row.total,
          }))}
          emptyText="No order expenses in this period."
        />
        <CategoryBreakdown
          title="Running costs, by category"
          description={`Business expenses dated ${period.label}.`}
          rows={data.businessExpenseBreakdown.map((row) => ({
            category: row.category,
            label: businessExpenseCategoryLabels[row.category],
            total: row.total,
          }))}
          emptyText="No business expenses in this period."
        />
      </div>

      <RecentOrders orders={data.recentOrders} />
    </div>
  );
}
