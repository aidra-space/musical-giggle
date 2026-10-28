import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/money";

export function CategoryBreakdown({
  title,
  description,
  rows,
  emptyText,
}: {
  title: string;
  description: string;
  rows: { category: string; label: string; total: number }[];
  emptyText: string;
}) {
  const grandTotal = rows.reduce((total, row) => total + row.total, 0);
  const largest = rows.reduce((max, row) => Math.max(max, row.total), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const share =
                grandTotal > 0 ? Math.round((row.total / grandTotal) * 100) : 0;
              const width = largest > 0 ? (row.total / largest) * 100 : 0;
              return (
                <li key={row.category} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span>{row.label}</span>
                    <span className="tabular-nums">
                      <span className="font-medium">{formatMoney(row.total)}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {share}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
            <li className="flex items-baseline justify-between border-t pt-3 text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(grandTotal)}</span>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
