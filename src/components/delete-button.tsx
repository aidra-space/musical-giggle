"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { type ActionState, idleActionState } from "@/lib/action-state";

export function DeleteButton({
  action,
  confirmText,
  children = "Delete",
  size = "sm",
  variant = "ghost",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  confirmText: string;
  children?: React.ReactNode;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [state, formAction, pending] = useActionState(action, idleActionState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
      className="inline-flex flex-col items-end gap-1"
    >
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        className="text-destructive hover:text-destructive"
      >
        {pending ? "Deleting…" : children}
      </Button>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
