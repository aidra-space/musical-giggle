import type { Metadata } from "next";

import { requireUserId } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PeriodPicker } from "@/components/period-picker";
import { Stat } from "@/components/stat";
import { Card } from "@/components/ui/card";
import { BusinessExpenseDialog } from "@/features/business-expenses/business-expense-dialog";
import { BusinessExpensesTable } from "@/features/business-expenses/business-expenses-table";
import { CategoryFilter } from "@/features/business-expenses/category-filter";
import { listBusinessExpenses } from "@/features/business-expenses/queries";
import { businessExpenseCategoryFilterSchema } from "@/features/business-expenses/schema";
import { todayIsoDate } from "@/lib/dates";
import { formatMoney, sumAmounts } from "@/lib/money";
import { periodSearchParams, resolvePeriod } from "@/lib/period";

export const metadata: Metadata = {
  title: "Expenses",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const period = resolvePeriod(params);
  const category = businessExpenseCategoryFilterSchema.parse(params.category);

  const expenses = await listBusinessExpenses(userId, {
    from: period.from,
    to: period.to,
    category,
  });
  const total = sumAmounts(expenses);
  const hasFilters = Boolean(category) || period.preset !== "this-month";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business expenses"
        description="Running costs that aren't tied to one outfit — rent, power, marketing and so on."
      >
        <BusinessExpenseDialog defaultDate={todayIsoDate()} />
      </PageHeader>

      <PeriodPicker
        period={period}
        basePath="/expenses"
        keepParams={{ category }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CategoryFilter
          category={category}
          periodQuery={periodSearchParams(period).toString()}
        />
        <Stat
          label={`Total for ${period.label}`}
          value={formatMoney(total)}
          className="sm:min-w-56"
        />
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? "No expenses for this period"
              : "No business expenses yet"
          }
          description={
            hasFilters
              ? "Try another period or category."
              : "Add rent, electricity, marketing and other running costs to see your real profit."
          }
        >
          {hasFilters ? null : (
            <BusinessExpenseDialog defaultDate={todayIsoDate()} />
          )}
        </EmptyState>
      ) : (
        <Card className="gap-0 px-2 py-2">
          <BusinessExpensesTable expenses={expenses} />
        </Card>
      )}
    </div>
  );
}
