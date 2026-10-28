import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <EmptyState
      title="Order not found"
      description="It may have been deleted, or the link is wrong."
    >
      <Button variant="outline" asChild>
        <Link href="/orders">Back to orders</Link>
      </Button>
    </EmptyState>
  );
}
