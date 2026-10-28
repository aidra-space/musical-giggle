import { describe, expect, it } from "vitest";

import {
  businessFinancials,
  marginPercent,
  orderFinancials,
  sumOrderFinancials,
} from "./financials";

const kobo = (naira: number) => naira * 100;

describe("orderFinancials", () => {
  it("matches the worked example from the brief", () => {
    const money = orderFinancials({
      status: "in_progress",
      amountCharged: kobo(200_000),
      amountReceived: kobo(150_000),
      directCost: kobo(90_000),
    });

    expect(money.revenue).toBe(kobo(200_000));
    expect(money.outstanding).toBe(kobo(50_000));
    expect(money.overpaid).toBe(0);
    expect(money.grossProfit).toBe(kobo(110_000));
    expect(money.grossMarginPercent).toBe(55);
  });

  it("never reports a negative balance, and surfaces overpayment instead", () => {
    const money = orderFinancials({
      status: "delivered",
      amountCharged: kobo(100_000),
      amountReceived: kobo(120_000),
      directCost: kobo(40_000),
    });

    expect(money.outstanding).toBe(0);
    expect(money.overpaid).toBe(kobo(20_000));
    expect(money.grossProfit).toBe(kobo(60_000));
  });

  it("handles a free outfit without dividing by zero", () => {
    const money = orderFinancials({
      status: "new",
      amountCharged: 0,
      amountReceived: 0,
      directCost: kobo(5_000),
    });

    expect(money.grossProfit).toBe(kobo(-5_000));
    expect(money.grossMarginPercent).toBeNull();
    expect(money.outstanding).toBe(0);
  });

  it("treats a cancelled order's value as whatever the customer actually paid", () => {
    const money = orderFinancials({
      status: "cancelled",
      amountCharged: kobo(200_000),
      amountReceived: kobo(50_000),
      directCost: kobo(30_000),
    });

    expect(money.revenue).toBe(kobo(50_000));
    expect(money.outstanding).toBe(0);
    expect(money.overpaid).toBe(0);
    expect(money.grossProfit).toBe(kobo(20_000));
    expect(money.grossMarginPercent).toBe(40);
  });

  it("shows a cancelled order with sunk costs as a loss", () => {
    const money = orderFinancials({
      status: "cancelled",
      amountCharged: kobo(200_000),
      amountReceived: 0,
      directCost: kobo(30_000),
    });

    expect(money.revenue).toBe(0);
    expect(money.grossProfit).toBe(kobo(-30_000));
    expect(money.grossMarginPercent).toBeNull();
  });
});

describe("marginPercent", () => {
  it("returns null when there is no revenue", () => {
    expect(marginPercent(0, 0)).toBeNull();
    expect(marginPercent(-500, 0)).toBeNull();
  });

  it("returns a percentage otherwise", () => {
    expect(marginPercent(kobo(25), kobo(100))).toBe(25);
    expect(marginPercent(kobo(-10), kobo(100))).toBe(-10);
  });
});

describe("sumOrderFinancials and businessFinancials", () => {
  const orders = [
    orderFinancials({
      status: "delivered",
      amountCharged: kobo(1_200_000),
      amountReceived: kobo(1_200_000),
      directCost: kobo(600_000),
    }),
    orderFinancials({
      status: "in_progress",
      amountCharged: kobo(800_000),
      amountReceived: kobo(300_000),
      directCost: kobo(400_000),
    }),
  ];

  it("matches the dashboard example from the brief", () => {
    const totals = sumOrderFinancials(orders);
    expect(totals.orderCount).toBe(2);
    expect(totals.revenue).toBe(kobo(2_000_000));
    expect(totals.directCost).toBe(kobo(1_000_000));
    expect(totals.grossProfit).toBe(kobo(1_000_000));
    expect(totals.grossMarginPercent).toBe(50);
    expect(totals.outstanding).toBe(kobo(500_000));

    const business = businessFinancials({
      orders,
      cashReceived: kobo(1_500_000),
      operatingExpenses: kobo(300_000),
    });
    expect(business.netProfit).toBe(kobo(700_000));
    expect(business.netMarginPercent).toBe(35);
    expect(business.cashReceived).toBe(kobo(1_500_000));
  });

  it("keeps outstanding balances separate from overpayments", () => {
    const totals = sumOrderFinancials([
      orderFinancials({
        status: "new",
        amountCharged: kobo(100),
        amountReceived: kobo(150),
        directCost: 0,
      }),
      orderFinancials({
        status: "new",
        amountCharged: kobo(100),
        amountReceived: kobo(20),
        directCost: 0,
      }),
    ]);
    expect(totals.outstanding).toBe(kobo(80));
  });

  it("works with no orders at all", () => {
    const business = businessFinancials({
      orders: [],
      cashReceived: 0,
      operatingExpenses: kobo(50_000),
    });
    expect(business.revenue).toBe(0);
    expect(business.grossProfit).toBe(0);
    expect(business.netProfit).toBe(kobo(-50_000));
    expect(business.grossMarginPercent).toBeNull();
    expect(business.netMarginPercent).toBeNull();
  });
});
