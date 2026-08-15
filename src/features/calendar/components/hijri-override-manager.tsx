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
  createHijriOverride,
  deleteHijriOverride,
  updateHijriOverride,
} from "@/features/calendar/actions";
import { hijriMonthNames } from "@/features/calendar/config";
import type { HijriOverrideAdminItem } from "@/features/calendar/types";
import { idleResult } from "@/lib/cms/validation";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; override: HijriOverrideAdminItem }
  | null;

type OverrideAction = typeof createHijriOverride;

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

function OverrideForm({
  isEdit,
  override,
  action,
  onClose,
}: {
  isEdit: boolean;
  override: HijriOverrideAdminItem | null;
  action: OverrideAction;
  onClose: () => void;
}) {
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") onClose();
  }, [result, onClose]);

  return (
    <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gregorian_date">Gregorian date</Label>
            <Input
              id="gregorian_date"
              name="gregorian_date"
              type="date"
              defaultValue={override?.gregorian_date ?? ""}
              required
              readOnly={isEdit}
              className={isEdit ? "bg-muted" : undefined}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="hijri_month">Hijri month</Label>
              <select
                id="hijri_month"
                name="hijri_month"
                defaultValue={override?.hijri_month ?? 1}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {Object.entries(hijriMonthNames).map(([value, name]) => (
                  <option key={value} value={value}>
                    {value}. {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hijri_day">Day</Label>
              <Input
                id="hijri_day"
                name="hijri_day"
                type="number"
                min={1}
                max={30}
                defaultValue={override?.hijri_day ?? 1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hijri_year">Hijri year</Label>
            <Input
              id="hijri_year"
              name="hijri_year"
              type="number"
              min={1}
              defaultValue={override?.hijri_year ?? 1447}
              required
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              name="note"
              placeholder="e.g. Eid moon sighted"
              defaultValue={override?.note ?? ""}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_published"
              name="is_published"
              defaultChecked={override ? override.is_published : true}
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
              {isEdit ? "Save changes" : "Add override"}
            </SubmitButton>
          </DialogFooter>
    </form>
  );
}

function OverrideDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const isEdit = state?.mode === "edit";
  const override = isEdit ? state.override : null;
  const action = isEdit ? updateHijriOverride : createHijriOverride;

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Hijri override" : "Add Hijri override"}</DialogTitle>
          <DialogDescription>
            Forces an exact Hijri date for one Gregorian day (a visible +1/-1 correction).
          </DialogDescription>
        </DialogHeader>

        <OverrideForm
          key={override?.gregorian_date ?? "create"}
          isEdit={isEdit}
          override={override}
          action={action}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export function HijriOverrideManager({
  overrides,
}: {
  overrides: HijriOverrideAdminItem[];
}) {
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Hijri overrides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Per-day corrections. When present, the override wins over the derived date.
          </p>
        </div>
        <Button variant="cta" onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon className="size-4" />
          Add override
        </Button>
      </div>

      {overrides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No overrides. Every day uses its derived Hijri date.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gregorian date</TableHead>
                <TableHead>Forced Hijri date</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map((override) => (
                <TableRow key={override.gregorian_date}>
                  <TableCell className="font-medium text-foreground">
                    {formatDate(override.gregorian_date)}
                  </TableCell>
                  <TableCell>
                    {override.hijri_day} {hijriMonthNames[override.hijri_month]}{" "}
                    {override.hijri_year}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {override.note ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={override.is_published} activeLabel="Published" inactiveLabel="Draft" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit override"
                        onClick={() => setDialog({ mode: "edit", override })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteHijriOverride}
                        id={override.gregorian_date}
                        entityLabel="override"
                        name={formatDate(override.gregorian_date)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <OverrideDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
