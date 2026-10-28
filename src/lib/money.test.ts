import { describe, expect, it } from "vitest";

import {
  formatMoney,
  formatMoneyCompact,
  formatPercent,
  parseMoney,
  sumAmounts,
  toMajorUnits,
} from "./money";

const kobo = (naira: number) => naira * 100;

describe("parseMoney", () => {
  it("converts naira to kobo without floating point", () => {
    expect(parseMoney("10500.50")).toBe(1050050);
    expect(parseMoney("0.1")).toBe(10);
    expect(parseMoney("0.07")).toBe(7);
    expect(parseMoney("200000")).toBe(20000000);
  });

  it("accepts thousands separators, spaces and the currency symbol", () => {
    expect(parseMoney("200,000")).toBe(20000000);
    expect(parseMoney("₦ 1,250.5")).toBe(125050);
  });

  it("rejects negative, empty and malformed input", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("-50")).toBeNull();
    expect(parseMoney("12.345")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney("1e5")).toBeNull();
  });

  it("rejects amounts that cannot be represented safely", () => {
    expect(parseMoney("99999999999999999999")).toBeNull();
  });
});

describe("toMajorUnits", () => {
  it("renders kobo as a plain decimal string for inputs", () => {
    expect(toMajorUnits(1050050)).toBe("10500.50");
    expect(toMajorUnits(20000000)).toBe("200000");
    expect(toMajorUnits(7)).toBe("0.07");
    expect(toMajorUnits(-150)).toBe("-1.50");
  });
});

describe("formatMoney", () => {
  it("formats whole naira without decimals", () => {
    expect(formatMoney(20000000)).toBe("₦200,000");
    expect(formatMoney(0)).toBe("₦0");
  });

  it("keeps kobo when present", () => {
    expect(formatMoney(1050050)).toBe("₦10,500.50");
    expect(formatMoney(5)).toBe("₦0.05");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(-350000)).toBe("-₦3,500");
  });
});

describe("formatMoneyCompact", () => {
  it("shortens large amounts for chart axes", () => {
    expect(formatMoneyCompact(0)).toBe("₦0");
    expect(formatMoneyCompact(kobo(850))).toBe("₦850");
    expect(formatMoneyCompact(kobo(1_500))).toBe("₦2k");
    expect(formatMoneyCompact(kobo(850_000))).toBe("₦850k");
    expect(formatMoneyCompact(kobo(999_500))).toBe("₦1m");
    expect(formatMoneyCompact(kobo(1_250_000))).toBe("₦1.3m");
    expect(formatMoneyCompact(kobo(2_000_000))).toBe("₦2m");
    expect(formatMoneyCompact(kobo(-300_000))).toBe("-₦300k");
  });
});

describe("sumAmounts", () => {
  it("adds amounts and treats an empty list as zero", () => {
    expect(sumAmounts([])).toBe(0);
    expect(sumAmounts([{ amount: 150 }, { amount: 250 }])).toBe(400);
  });
});

describe("formatPercent", () => {
  it("shows a dash when there is no margin to show", () => {
    expect(formatPercent(null)).toBe("—");
  });

  it("rounds to one decimal place", () => {
    expect(formatPercent(55)).toBe("55%");
    expect(formatPercent(12.345)).toBe("12.3%");
    expect(formatPercent(-20)).toBe("-20%");
  });
});
