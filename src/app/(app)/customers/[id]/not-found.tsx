import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function CustomerNotFound() {
  return (
    <EmptyState
      title="Customer not found"
      description="They may have been deleted, or the link is wrong."
    >
      <Button variant="outline" asChild>
        <Link href="/customers">Back to customers</Link>
      </Button>
    </EmptyState>
  );
}
