import Link from "next/link";

import { signOut } from "@/auth";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { appName } from "@/lib/app";

export function AppHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center justify-between gap-6">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {appName}
          </Link>
          <div className="sm:hidden">
            <SignOutButton />
          </div>
        </div>
        <AppNav />
        <div className="hidden items-center gap-3 sm:flex">
          <span className="max-w-48 truncate text-sm text-muted-foreground">
            {user.name ?? user.email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/sign-in" });
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </form>
  );
}
