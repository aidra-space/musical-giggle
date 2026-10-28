"use client";

import { useActionState, useRef } from "react";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { type OrderStatus, orderStatuses } from "@/db/enums";
import { updateOrderStatus } from "@/features/orders/actions";
import { orderStatusLabels } from "@/features/orders/labels";
import { idleActionState } from "@/lib/action-state";

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatus,
    idleActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="w-40">
        <NativeSelect
          key={status}
          name="status"
          aria-label="Order status"
          defaultValue={status}
          disabled={pending}
          onChange={() => formRef.current?.requestSubmit()}
        >
          {orderStatuses.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {orderStatusLabels[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
