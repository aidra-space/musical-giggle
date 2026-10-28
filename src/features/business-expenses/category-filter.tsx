"use client";

import { useRouter } from "next/navigation";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { businessExpenseCategories } from "@/db/enums";
import { businessExpenseCategoryLabels } from "@/features/business-expenses/labels";

export function CategoryFilter({
  category,
  periodQuery,
}: {
  category?: string;
  periodQuery: string;
}) {
  const router = useRouter();

  return (
    <div className="w-60">
      <NativeSelect
        key={category ?? "all"}
        aria-label="Filter by category"
        defaultValue={category ?? ""}
        onChange={(event) => {
          const params = new URLSearchParams(periodQuery);
          if (event.target.value) {
            params.set("category", event.target.value);
          } else {
            params.delete("category");
          }
          const query = params.toString();
          router.replace(query ? `/expenses?${query}` : "/expenses");
        }}
      >
        <NativeSelectOption value="">All categories</NativeSelectOption>
        {businessExpenseCategories.map((value) => (
          <NativeSelectOption key={value} value={value}>
            {businessExpenseCategoryLabels[value]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
