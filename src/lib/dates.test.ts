import { describe, expect, it } from "vitest";

import {
  formatDate,
  isIsoDate,
  monthKey,
  monthLabel,
  monthRange,
  shiftMonth,
  yearRange,
} from "./dates";

describe("isIsoDate", () => {
  it("accepts real calendar dates", () => {
    expect(isIsoDate("2026-10-07")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects impossible or malformed dates", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2023-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("07/10/2026")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });
});

describe("month helpers", () => {
  it("derives the month key and range", () => {
    expect(monthKey("2026-10-07")).toBe("2026-10");
    expect(monthRange("2026-02")).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(monthRange("2024-02")).toEqual({ from: "2024-02-01", to: "2024-02-29" });
    expect(yearRange(2026)).toEqual({ from: "2026-01-01", to: "2026-12-31" });
  });

  it("shifts across year boundaries", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-10", -5)).toBe("2026-05");
    expect(shiftMonth("2026-11", 3)).toBe("2027-02");
  });

  it("formats labels", () => {
    expect(monthLabel("2026-10")).toBe("Oct 2026");
    expect(formatDate("2026-10-07")).toBe("7 Oct 2026");
  });
});
