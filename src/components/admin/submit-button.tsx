"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
  variant?: "default" | "cta" | "destructive" | "outline" | "secondary" | "ghost";
};

/** Submit button that reflects the enclosing form's pending state. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "cta",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}
