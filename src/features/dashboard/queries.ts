import type { BusinessExpenseCategory, OrderExpenseCategory } from "@/db/enums";
import {
  sumBusinessExpenses,
  sumBusinessExpensesByCategory,
  sumBusinessExpensesByMonth,
} from "@/features/business-expenses/queries";
import {
  type CategoryTotal,
  sumOrderExpensesByCategory,
} from "@/features/order-expenses/queries";
import {
  type BusinessFinancials,
  type OrderFinancials,
  businessFinancials,
  orderFinancials,
} from "@/features/orders/financials";
import {
  type OrderWithTotals,
  listOrdersWithTotals,
} from "@/features/orders/queries";
import { sumPaymentsByDate } from "@/features/payments/queries";
import { lastMonthKeys, monthKey, monthLabel, monthRange } from "@/lib/dates";
import type { Period } from "@/lib/period";

export type OrderWithMoney = OrderWithTotals & { money: OrderFinancials };

export type MonthlyPoint = {
  month: string;
  label: string;
  revenue: number;
  directCost: number;
  operatingExpenses: number;
  expenses: number;
  profit: number;
};

export type DashboardData = {
  totals: BusinessFinancials;
  outstandingTotal: number;
  recentOrders: OrderWithMoney[];
  owingOrders: OrderWithMoney[];
  topOrders: OrderWithMoney[];
  orderExpenseBreakdown: CategoryTotal<OrderExpenseCategory>[];
  businessExpenseBreakdown: CategoryTotal<BusinessExpenseCategory>[];
  monthly: MonthlyPoint[];
};

const chartMonthCount = 6;

function withMoney(order: OrderWithTotals): OrderWithMoney {
  return { ...order, money: orderFinancials(order) };
}

export async function getDashboardData(
  userId: string,
  period: Period,
): Promise<DashboardData> {
  const months = lastMonthKeys(chartMonthCount);
  const chartRange = {
    from: monthRange(months[0]).from,
    to: monthRange(months[months.length - 1]).to,
  };

  const [
    periodOrders,
    cashReceived,
    operatingExpenses,
    allOrders,
    orderExpenseBreakdown,
    businessExpenseBreakdown,
    chartOrders,
    chartOperatingExpenses,
  ] = await Promise.all([
    listOrdersWithTotals(userId, { from: period.from, to: period.to }),
    sumPaymentsByDate(userId, period),
    sumBusinessExpenses(userId, { from: period.from, to: period.to }),
    listOrdersWithTotals(userId, {}),
    sumOrderExpensesByCategory(userId, period),
    sumBusinessExpensesByCategory(userId, period),
    listOrdersWithTotals(userId, chartRange),
    sumBusinessExpensesByMonth(userId, chartRange),
  ]);

  const periodOrdersWithMoney = periodOrders.map(withMoney);
  const totals = businessFinancials({
    orders: periodOrdersWithMoney.map((order) => order.money),
    cashReceived,
    operatingExpenses,
  });

  const allOrdersWithMoney = allOrders.map(withMoney);
  const owingOrders = allOrdersWithMoney
    .filter((order) => order.money.outstanding > 0)
    .sort((a, b) => b.money.outstanding - a.money.outstanding);
  const outstandingTotal = owingOrders.reduce(
    (total, order) => total + order.money.outstanding,
    0,
  );

  const recentOrders = [...allOrdersWithMoney]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const topOrders = periodOrdersWithMoney
    .filter((order) => order.status !== "cancelled")
    .sort((a, b) => b.money.grossProfit - a.money.grossProfit)
    .slice(0, 5);

  const operatingByMonth = new Map(
    chartOperatingExpenses.map((row) => [row.month, row.total]),
  );
  const monthly = months.map((month) => {
    let revenue = 0;
    let directCost = 0;
    for (const order of chartOrders) {
      if (monthKey(order.orderDate) !== month) {
        continue;
      }
      const money = orderFinancials(order);
      revenue += money.revenue;
      directCost += money.directCost;
    }
    const monthOperatingExpenses = operatingByMonth.get(month) ?? 0;
    const expenses = directCost + monthOperatingExpenses;
    return {
      month,
      label: monthLabel(month),
      revenue,
      directCost,
      operatingExpenses: monthOperatingExpenses,
      expenses,
      profit: revenue - expenses,
    };
  });

  return {
    totals,
    outstandingTotal,
    recentOrders,
    owingOrders: owingOrders.slice(0, 5),
    topOrders,
    orderExpenseBreakdown,
    businessExpenseBreakdown,
    monthly,
  };
}
