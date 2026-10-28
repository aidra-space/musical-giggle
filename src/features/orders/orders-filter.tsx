"use client";

import { usePathname, useRouter } from "next/navigation";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { orderStatuses } from "@/db/enums";
import { orderStatusLabels } from "@/features/orders/labels";

export function OrdersFilter({
  customers,
  status,
  customerId,
}: {
  customers: { id: string; name: string }[];
  status?: string;
  customerId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(next: { status: string; customer: string }) {
    const params = new URLSearchParams();
    if (next.status) {
      params.set("status", next.status);
    }
    if (next.customer) {
      params.set("customer", next.customer);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-44">
        <NativeSelect
          key={status ?? "all"}
          aria-label="Filter by status"
          defaultValue={status ?? ""}
          onChange={(event) =>
            apply({ status: event.target.value, customer: customerId ?? "" })
          }
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          {orderStatuses.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {orderStatusLabels[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="w-52">
        <NativeSelect
          key={customerId ?? "all"}
          aria-label="Filter by customer"
          defaultValue={customerId ?? ""}
          onChange={(event) =>
            apply({ status: status ?? "", customer: event.target.value })
          }
        >
          <NativeSelectOption value="">All customers</NativeSelectOption>
          {customers.map((customer) => (
            <NativeSelectOption key={customer.id} value={customer.id}>
              {customer.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
