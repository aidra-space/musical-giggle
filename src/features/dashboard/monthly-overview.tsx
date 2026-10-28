import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyChart } from "@/features/dashboard/monthly-chart";
import type { MonthlyPoint } from "@/features/dashboard/queries";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function MonthlyOverview({ monthly }: { monthly: MonthlyPoint[] }) {
  const hasData = monthly.some(
    (point) => point.revenue !== 0 || point.expenses !== 0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last {monthly.length} months</CardTitle>
        <CardDescription>
          Orders value and cost to make follow each order&apos;s date; running
          costs follow their own date. Profit is orders value minus both.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {hasData ? (
          <MonthlyChart data={monthly} />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing to chart yet. Orders and expenses from the last{" "}
            {monthly.length} months will show up here.
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Orders value</TableHead>
              <TableHead className="text-right">Cost to make</TableHead>
              <TableHead className="text-right">Running costs</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthly.map((point) => (
              <TableRow key={point.month}>
                <TableCell className="font-medium">{point.label}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(point.revenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(point.directCost)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(point.operatingExpenses)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    point.profit < 0 && "text-negative",
                  )}
                >
                  {formatMoney(point.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
