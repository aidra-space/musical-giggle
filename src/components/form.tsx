"use client";

import { useFormStatus } from "react-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/action-state";
import { type CurrencyCode, currencies, defaultCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  htmlFor,
  errors,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  const error = errors?.[0];
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status !== "error" || !state.message) {
    return null;
  }
  return (
    <Alert variant="destructive">
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}

export function MoneyInput({
  currency = defaultCurrency,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { currency?: CurrencyCode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        {currencies[currency].symbol}
      </span>
      <Input
        inputMode="decimal"
        placeholder="0"
        className={cn("pl-8", className)}
        {...props}
      />
    </div>
  );
}

export function SubmitButton({
  children,
  pendingText,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingText ?? "Saving…") : children}
    </Button>
  );
}
