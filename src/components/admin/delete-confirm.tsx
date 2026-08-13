"use client";

import { Trash2Icon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { idleResult, type ActionResult } from "@/lib/cms/validation";

type DeleteAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

type DeleteConfirmProps = {
  action: DeleteAction;
  id: string;
  entityLabel: string;
  name?: string | null;
};

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

export function DeleteConfirm({ action, id, entityLabel, name }: DeleteConfirmProps) {
  const [state, formAction] = useActionState(action, idleResult);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.status === "success") setOpen(false);
  }, [state]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${entityLabel}`}>
          <Trash2Icon className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {entityLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {name ? `“${name}” will be permanently removed. ` : ""}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.status === "error" ? (
          <p className="text-sm font-medium text-destructive">{state.message}</p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
