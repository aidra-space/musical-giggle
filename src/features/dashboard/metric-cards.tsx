import { Stat, toneForAmount } from "@/components/stat";
import type { BusinessFinancials } from "@/features/orders/financials";
import { formatMoney, formatPercent } from "@/lib/money";

export function MetricCards({
  totals,
  outstandingTotal,
  periodLabel,
}: {
  totals: BusinessFinancials;
  outstandingTotal: number;
  periodLabel: string;
}) {
  const orderWord = totals.orderCount === 1 ? "order" : "orders";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Orders value"
        value={formatMoney(totals.revenue)}
        hint={`${totals.orderCount} ${orderWord} · ${periodLabel}`}
      />
      <Stat
        label="Cash received"
        value={formatMoney(totals.cashReceived)}
        hint="Payments in this period, whichever order they belong to"
      />
      <Stat
        label="Cost to make"
        value={formatMoney(totals.directCost)}
        hint="Fabric, labour and other costs of those orders"
      />
      <Stat
        label="Gross profit"
        value={formatMoney(totals.grossProfit)}
        hint="Orders value minus cost to make"
        tone={toneForAmount(totals.grossProfit)}
      />
      <Stat
        label="Gross margin"
        value={formatPercent(totals.grossMarginPercent)}
        hint="Gross profit as a share of orders value"
        tone={
          totals.grossMarginPercent === null
            ? "muted"
            : toneForAmount(totals.grossMarginPercent)
        }
      />
      <Stat
        label="Running costs"
        value={formatMoney(totals.operatingExpenses)}
        hint="Business expenses in this period"
      />
      <Stat
        label="Net profit"
        value={formatMoney(totals.netProfit)}
        hint={
          totals.netMarginPercent === null
            ? "Gross profit minus running costs"
            : `${formatPercent(totals.netMarginPercent)} of orders value after running costs`
        }
        tone={toneForAmount(totals.netProfit)}
      />
      <Stat
        label="Customers still owe"
        value={formatMoney(outstandingTotal)}
        hint="Across all open orders, as of today"
        tone={outstandingTotal > 0 ? "negative" : "muted"}
      />
    </div>
  );
}
