import { Stat } from "@/components/stat";
import type { OrderFinancials } from "@/features/orders/financials";
import { type CurrencyCode, formatMoney, formatPercent } from "@/lib/money";

export function OrderMoneySummary({
  money,
  currency,
  cancelled,
}: {
  money: OrderFinancials;
  currency?: CurrencyCode;
  cancelled: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat
        label="Order value"
        value={formatMoney(money.amountCharged, currency)}
        hint={
          cancelled
            ? `Cancelled — counted as ${formatMoney(money.revenue, currency)} (what was kept)`
            : undefined
        }
      />
      <Stat label="Received" value={formatMoney(money.amountReceived, currency)} />
      {money.overpaid > 0 ? (
        <Stat
          label="Overpaid by"
          value={formatMoney(money.overpaid, currency)}
          hint="The customer has paid more than the order value"
          tone="negative"
        />
      ) : (
        <Stat
          label="Customer still owes"
          value={formatMoney(money.outstanding, currency)}
          tone={money.outstanding > 0 ? "negative" : "muted"}
          hint={cancelled ? "Nothing is owed on a cancelled order" : undefined}
        />
      )}
      <Stat
        label="Cost to make"
        value={formatMoney(money.directCost, currency)}
      />
      <Stat
        label="Profit"
        value={formatMoney(money.grossProfit, currency)}
        tone={money.grossProfit < 0 ? "negative" : "positive"}
        hint={cancelled ? "What was kept minus what was spent" : "Order value minus cost to make"}
      />
      <Stat
        label="Margin"
        value={formatPercent(money.grossMarginPercent)}
        tone={
          money.grossMarginPercent === null
            ? "muted"
            : money.grossMarginPercent < 0
              ? "negative"
              : "default"
        }
      />
    </div>
  );
}
