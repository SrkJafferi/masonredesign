"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { DeleteConfirm } from "@/components/admin/delete-confirm";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createHijriMonth,
  deleteHijriMonth,
  updateHijriMonth,
} from "@/features/calendar/actions";
import { hijriMonthNames } from "@/features/calendar/config";
import type { HijriMonthAdminItem } from "@/features/calendar/types";
import { idleResult } from "@/lib/cms/validation";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; month: HijriMonthAdminItem }
  | null;

type MonthAction = typeof createHijriMonth;

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function MonthForm({
  isEdit,
  month,
  action,
  onClose,
}: {
  isEdit: boolean;
  month: HijriMonthAdminItem | null;
  action: MonthAction;
  onClose: () => void;
}) {
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") onClose();
  }, [result, onClose]);

  return (
    <form action={formAction} className="space-y-4">
          {isEdit ? <input type="hidden" name="id" value={month!.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="hijri_month">Hijri month</Label>
            <select
              id="hijri_month"
              name="hijri_month"
              defaultValue={month?.hijri_month ?? 1}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Object.entries(hijriMonthNames).map(([value, name]) => (
                <option key={value} value={value}>
                  {value}. {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hijri_year">Hijri year</Label>
              <Input
                id="hijri_year"
                name="hijri_year"
                type="number"
                min={1}
                defaultValue={month?.hijri_year ?? 1447}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gregorian_start">Begins on</Label>
              <Input
                id="gregorian_start"
                name="gregorian_start"
                type="date"
                defaultValue={month?.gregorian_start ?? ""}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_published"
              name="is_published"
              defaultChecked={month ? month.is_published : true}
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          {result.status === "error" ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {result.message}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton pendingLabel="Saving…">
              {isEdit ? "Save changes" : "Add boundary"}
            </SubmitButton>
          </DialogFooter>
    </form>
  );
}

function MonthDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const isEdit = state?.mode === "edit";
  const month = isEdit ? state.month : null;
  const action = isEdit ? updateHijriMonth : createHijriMonth;

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit month boundary" : "Add month boundary"}</DialogTitle>
          <DialogDescription>
            The Gregorian date on which this Hijri month begins.
          </DialogDescription>
        </DialogHeader>

        <MonthForm
          key={month?.id ?? "create"}
          isEdit={isEdit}
          month={month}
          action={action}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export function HijriMonthManager({ months }: { months: HijriMonthAdminItem[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Hijri month boundaries</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The single place month starts live. Moving a date here shifts the whole month.
          </p>
        </div>
        <Button variant="cta" onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon className="size-4" />
          Add boundary
        </Button>
      </div>

      {months.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No month boundaries yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hijri month</TableHead>
                <TableHead>Begins on (Gregorian)</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow key={month.id}>
                  <TableCell className="font-medium text-foreground">
                    {hijriMonthNames[month.hijri_month]} {month.hijri_year}
                  </TableCell>
                  <TableCell>{formatDate(month.gregorian_start)}</TableCell>
                  <TableCell>
                    <StatusBadge active={month.is_published} activeLabel="Published" inactiveLabel="Draft" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit boundary"
                        onClick={() => setDialog({ mode: "edit", month })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteHijriMonth}
                        id={month.id}
                        entityLabel="month boundary"
                        name={`${hijriMonthNames[month.hijri_month]} ${month.hijri_year}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MonthDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
