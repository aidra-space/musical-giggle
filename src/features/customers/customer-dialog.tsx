"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Customer } from "@/db/schema";
import { createCustomer, updateCustomer } from "@/features/customers/actions";
import { CustomerForm } from "@/features/customers/customer-form";

export function CustomerDialog({
  customer,
  trigger,
}: {
  customer?: Customer;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = customer
    ? updateCustomer.bind(null, customer.id)
    : createCustomer;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit customer" : "New customer"}</DialogTitle>
          <DialogDescription>
            {customer
              ? "Update this customer's details."
              : "Only the name is required."}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          action={action}
          customer={customer}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
