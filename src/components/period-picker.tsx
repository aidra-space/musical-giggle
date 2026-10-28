import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Period, periodPresetLabels, periodPresets } from "@/lib/period";
import { cn } from "@/lib/utils";

export function PeriodPicker({
  period,
  basePath,
  keepParams = {},
}: {
  period: Period;
  basePath: string;
  keepParams?: Record<string, string | undefined>;
}) {
  const kept = Object.entries(keepParams).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );

  function presetHref(preset: string) {
    const params = new URLSearchParams(kept);
    params.set("period", preset);
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {periodPresets.map((preset) => (
          <Link
            key={preset}
            href={presetHref(preset)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              period.preset === preset
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent",
            )}
          >
            {periodPresetLabels[preset]}
          </Link>
        ))}
      </div>
      <Form action={basePath} className="flex flex-wrap items-center gap-2">
        {kept.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <Input
          type="date"
          name="from"
          aria-label="From date"
          defaultValue={period.from ?? ""}
          className="w-auto"
          required
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          name="to"
          aria-label="To date"
          defaultValue={period.to ?? ""}
          className="w-auto"
          required
        />
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </Form>
    </div>
  );
}
