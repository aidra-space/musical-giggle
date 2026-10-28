"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MonthlyPoint } from "@/features/dashboard/queries";
import { formatMoney, formatMoneyCompact } from "@/lib/money";

const chartConfig = {
  revenue: { label: "Orders value", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
  profit: { label: "Profit", color: "var(--chart-3)" },
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;

function isSeriesKey(value: unknown): value is SeriesKey {
  return typeof value === "string" && value in chartConfig;
}

export function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => formatMoneyCompact(value)}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="size-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.color }}
                    />
                    {isSeriesKey(name) ? chartConfig[name].label : String(name)}
                  </span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatMoney(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} maxBarSize={28} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} maxBarSize={28} />
        <Bar dataKey="profit" fill="var(--color-profit)" radius={4} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  );
}
