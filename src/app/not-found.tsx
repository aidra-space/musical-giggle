import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>That page doesn&apos;t exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to the dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
