import {
  currentMonthKey,
  isIsoDate,
  monthLabel,
  monthRange,
  shiftMonth,
  todayIsoDate,
  yearRange,
  formatDate,
} from "@/lib/dates";

export const periodPresets = [
  "this-month",
  "last-month",
  "this-year",
  "all-time",
] as const;

export type PeriodPreset = (typeof periodPresets)[number];

export type Period = {
  preset: PeriodPreset | "custom";
  from: string | null;
  to: string | null;
  label: string;
};

export const periodPresetLabels: Record<PeriodPreset, string> = {
  "this-month": "This month",
  "last-month": "Last month",
  "this-year": "This year",
  "all-time": "All time",
};

function isPeriodPreset(value: string): value is PeriodPreset {
  return (periodPresets as readonly string[]).includes(value);
}

export function presetPeriod(preset: PeriodPreset): Period {
  switch (preset) {
    case "this-month": {
      const key = currentMonthKey();
      return { preset, ...monthRange(key), label: monthLabel(key) };
    }
    case "last-month": {
      const key = shiftMonth(currentMonthKey(), -1);
      return { preset, ...monthRange(key), label: monthLabel(key) };
    }
    case "this-year": {
      const year = Number(todayIsoDate().slice(0, 4));
      return { preset, ...yearRange(year), label: String(year) };
    }
    case "all-time":
      return { preset, from: null, to: null, label: "All time" };
  }
}

export function resolvePeriod(params: {
  period?: string | string[];
  from?: string | string[];
  to?: string | string[];
}): Period {
  const preset = typeof params.period === "string" ? params.period : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  if (preset && isPeriodPreset(preset)) {
    return presetPeriod(preset);
  }

  if (from && to && isIsoDate(from) && isIsoDate(to) && from <= to) {
    return {
      preset: "custom",
      from,
      to,
      label: `${formatDate(from)} – ${formatDate(to)}`,
    };
  }

  return presetPeriod("this-month");
}

export function periodSearchParams(period: Period): URLSearchParams {
  const params = new URLSearchParams();
  if (period.preset === "custom" && period.from && period.to) {
    params.set("from", period.from);
    params.set("to", period.to);
  } else if (period.preset !== "custom") {
    params.set("period", period.preset);
  }
  return params;
}
