"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";

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
  createCalendarDay,
  deleteCalendarDay,
  updateCalendarDay,
} from "@/features/calendar/actions";
import type { CalendarDayAdminItem } from "@/features/calendar/types";
import { idleResult } from "@/lib/cms/validation";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; day: CalendarDayAdminItem }
  | null;

type DayAction = typeof createCalendarDay;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** The six public fields plus imsaak (stored, admin-editable, not shown publicly). */
const TIMING_FIELDS: { name: keyof CalendarDayAdminItem; label: string; hint?: string }[] = [
  { name: "imsaak", label: "Imsaak", hint: "stored, not shown publicly" },
  { name: "fajr", label: "Fajr" },
  { name: "sunrise", label: "Sunrise" },
  { name: "zohar", label: "Zohar" },
  { name: "sunset", label: "Sunset" },
  { name: "maghrib", label: "Maghrib" },
  { name: "midnight", label: "Midnight" },
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function DayForm({
  isEdit,
  day,
  action,
  onClose,
}: {
  isEdit: boolean;
  day: CalendarDayAdminItem | null;
  action: DayAction;
  onClose: () => void;
}) {
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") onClose();
  }, [result, onClose]);

  return (
    <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gregorian_date">Date</Label>
            <Input
              id="gregorian_date"
              name="gregorian_date"
              type="date"
              defaultValue={day?.gregorian_date ?? ""}
              required
              readOnly={isEdit}
              className={isEdit ? "bg-muted" : undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TIMING_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.hint ? (
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({field.hint})
                    </span>
                  ) : null}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="5:55a"
                  defaultValue={(day?.[field.name] as string | null) ?? ""}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_published"
              name="is_published"
              defaultChecked={day ? day.is_published : true}
            />
            <Label htmlFor="is_published">Published (visible on the website)</Label>
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
              {isEdit ? "Save changes" : "Add day"}
            </SubmitButton>
          </DialogFooter>
    </form>
  );
}

function DayDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const isEdit = state?.mode === "edit";
  const day = isEdit ? state.day : null;
  const action = isEdit ? updateCalendarDay : createCalendarDay;

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit day timings" : "Add a day"}</DialogTitle>
          <DialogDescription>
            Enter times exactly as printed, e.g. “5:55a” or “1:01p”.
          </DialogDescription>
        </DialogHeader>

        <DayForm
          key={day?.gregorian_date ?? "create"}
          isEdit={isEdit}
          day={day}
          action={action}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export function DayManager({
  days,
  year,
}: {
  days: CalendarDayAdminItem[];
  year: number;
}) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [month, setMonth] = useState(0); // 0 = January

  const visibleDays = useMemo(
    () =>
      days.filter((day) => {
        const m = Number(day.gregorian_date.split("-")[1]) - 1;
        return m === month;
      }),
    [days, month],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Prayer timings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Six daily timings for {year}. Times are entered manually — no API is used.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="month-filter" className="sr-only">
            Month
          </Label>
          <select
            id="month-filter"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <Button variant="cta" onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="size-4" />
            Add day
          </Button>
        </div>
      </div>

      {visibleDays.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No days recorded for {MONTH_NAMES[month]} {year}. Use “Add day” to create one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Date</TableHead>
                <TableHead>Fajr</TableHead>
                <TableHead>Sunrise</TableHead>
                <TableHead>Zohar</TableHead>
                <TableHead>Sunset</TableHead>
                <TableHead>Maghrib</TableHead>
                <TableHead>Midnight</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleDays.map((day) => (
                <TableRow key={day.gregorian_date}>
                  <TableCell className="font-medium text-foreground">
                    {formatDate(day.gregorian_date)}
                  </TableCell>
                  <TableCell className="tabular-nums">{day.fajr ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{day.sunrise ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{day.zohar ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{day.sunset ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{day.maghrib ?? "—"}</TableCell>
                  <TableCell className="tabular-nums">{day.midnight ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge active={day.is_published} activeLabel="Published" inactiveLabel="Draft" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit day"
                        onClick={() => setDialog({ mode: "edit", day })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteCalendarDay}
                        id={day.gregorian_date}
                        entityLabel="day"
                        name={formatDate(day.gregorian_date)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DayDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
