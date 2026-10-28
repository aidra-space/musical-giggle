import type { OrderStatus } from "@/db/enums";

export type OrderFinancialsInput = {
  status: OrderStatus;
  amountCharged: number;
  amountReceived: number;
  directCost: number;
};

export type OrderFinancials = {
  revenue: number;
  amountCharged: number;
  amountReceived: number;
  outstanding: number;
  overpaid: number;
  directCost: number;
  grossProfit: number;
  grossMarginPercent: number | null;
};

export type OrderTotals = {
  orderCount: number;
  revenue: number;
  amountReceived: number;
  outstanding: number;
  directCost: number;
  grossProfit: number;
  grossMarginPercent: number | null;
};

export type BusinessFinancials = OrderTotals & {
  cashReceived: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number | null;
};

export function marginPercent(profit: number, revenue: number): number | null {
  if (revenue <= 0) {
    return null;
  }
  return (profit * 100) / revenue;
}

export function orderFinancials(input: OrderFinancialsInput): OrderFinancials {
  const cancelled = input.status === "cancelled";
  const revenue = cancelled ? input.amountReceived : input.amountCharged;
  const outstanding = cancelled
    ? 0
    : Math.max(0, input.amountCharged - input.amountReceived);
  const overpaid = cancelled
    ? 0
    : Math.max(0, input.amountReceived - input.amountCharged);
  const grossProfit = revenue - input.directCost;

  return {
    revenue,
    amountCharged: input.amountCharged,
    amountReceived: input.amountReceived,
    outstanding,
    overpaid,
    directCost: input.directCost,
    grossProfit,
    grossMarginPercent: marginPercent(grossProfit, revenue),
  };
}

export function sumOrderFinancials(items: OrderFinancials[]): OrderTotals {
  let revenue = 0;
  let amountReceived = 0;
  let outstanding = 0;
  let directCost = 0;
  for (const item of items) {
    revenue += item.revenue;
    amountReceived += item.amountReceived;
    outstanding += item.outstanding;
    directCost += item.directCost;
  }
  const grossProfit = revenue - directCost;

  return {
    orderCount: items.length,
    revenue,
    amountReceived,
    outstanding,
    directCost,
    grossProfit,
    grossMarginPercent: marginPercent(grossProfit, revenue),
  };
}

export function businessFinancials(input: {
  orders: OrderFinancials[];
  cashReceived: number;
  operatingExpenses: number;
}): BusinessFinancials {
  const totals = sumOrderFinancials(input.orders);
  const netProfit = totals.grossProfit - input.operatingExpenses;

  return {
    ...totals,
    cashReceived: input.cashReceived,
    operatingExpenses: input.operatingExpenses,
    netProfit,
    netMarginPercent: marginPercent(netProfit, totals.revenue),
  };
}
