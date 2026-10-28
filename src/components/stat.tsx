import { cn } from "@/lib/utils";

export type StatTone = "default" | "positive" | "negative" | "muted";

export function toneForAmount(amount: number): StatTone {
  if (amount > 0) {
    return "positive";
  }
  if (amount < 0) {
    return "negative";
  }
  return "default";
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border bg-card px-4 py-3 text-card-foreground shadow-sm",
        className,
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xl font-semibold tabular-nums tracking-tight",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
