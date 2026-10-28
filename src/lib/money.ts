export const currencies = {
  NGN: { symbol: "₦", name: "Nigerian naira", minorUnitDigits: 2 },
} as const;

export type CurrencyCode = keyof typeof currencies;

export const currencyCodes = Object.keys(currencies) as CurrencyCode[];

export const defaultCurrency: CurrencyCode = "NGN";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value in currencies;
}

export function parseMoney(
  input: string,
  currency: CurrencyCode = defaultCurrency,
): number | null {
  const { symbol, minorUnitDigits } = currencies[currency];
  const cleaned = input.replace(/[\s,]/g, "").replace(symbol, "");
  const pattern =
    minorUnitDigits > 0
      ? new RegExp(`^(\\d+)(?:\\.(\\d{1,${minorUnitDigits}}))?$`)
      : /^(\d+)$/;
  const match = pattern.exec(cleaned);
  if (!match) {
    return null;
  }
  const whole = match[1];
  const fraction = (match[2] ?? "").padEnd(minorUnitDigits, "0");
  const minor = Number(whole) * 10 ** minorUnitDigits + Number(fraction);
  if (!Number.isSafeInteger(minor)) {
    return null;
  }
  return minor;
}

export function toMajorUnits(
  minor: number,
  currency: CurrencyCode = defaultCurrency,
): string {
  const { minorUnitDigits } = currencies[currency];
  const scale = 10 ** minorUnitDigits;
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const fraction = abs % scale;
  const whole = (abs - fraction) / scale;
  if (fraction === 0) {
    return `${sign}${whole}`;
  }
  return `${sign}${whole}.${String(fraction).padStart(minorUnitDigits, "0")}`;
}

export function formatMoney(
  minor: number,
  currency: CurrencyCode = defaultCurrency,
): string {
  const { symbol, minorUnitDigits } = currencies[currency];
  const scale = 10 ** minorUnitDigits;
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const fraction = abs % scale;
  const whole = (abs - fraction) / scale;
  const wholeText = new Intl.NumberFormat("en-NG").format(whole);
  const fractionText =
    fraction === 0 ? "" : `.${String(fraction).padStart(minorUnitDigits, "0")}`;
  return `${sign}${symbol}${wholeText}${fractionText}`;
}

export function formatMoneyCompact(
  minor: number,
  currency: CurrencyCode = defaultCurrency,
): string {
  const { symbol, minorUnitDigits } = currencies[currency];
  const scale = 10 ** minorUnitDigits;
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = (abs - (abs % scale)) / scale;
  const thousands = Math.round(whole / 1_000);
  if (thousands >= 1_000) {
    return `${sign}${symbol}${(whole / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (whole >= 1_000) {
    return `${sign}${symbol}${thousands}k`;
  }
  return `${sign}${symbol}${whole}`;
}

export function sumAmounts(items: { amount: number }[]): number {
  let total = 0;
  for (const item of items) {
    total += item.amount;
  }
  return total;
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 }).format(value)}%`;
}
