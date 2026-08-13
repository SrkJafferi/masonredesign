"use client";

import { LogOutIcon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

function SignOutInner() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      <LogOutIcon className="size-4" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutInner />
    </form>
  );
}
