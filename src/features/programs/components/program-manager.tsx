"use client";

import { CalendarDaysIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminThumb } from "@/components/admin/admin-thumb";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createProgram, deleteProgram, updateProgram } from "@/features/programs/actions";
import type { ProgramAdminItem } from "@/features/programs/types";
import { idleResult } from "@/lib/cms/validation";

import { ProgramPosterField } from "./program-poster-field";
import {
  addCalendarDays,
  generateDailyOccurrenceDates,
  generateWeeklyOccurrenceDates,
  MAX_DAILY_OCCURRENCES,
  programOccurrenceKey,
  weekdayName,
} from "../recurrence";

type DialogState =
  { mode: "create" } | { mode: "edit"; program: ProgramAdminItem } | null;

type ProgramAction = typeof createProgram;

/** UTC-safe "Friday, Sep 4, 2026" for an ISO date string. */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** UTC-safe recurrence preview label: "Thursday, October 1". */
function formatRecurrenceDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Owns the action state so it can be remounted (via the dialog's key) per open.
 * Without the remount, useActionState keeps the previous "success" result and a
 * stale effect immediately closes the next dialog before it is visible.
 */
function ProgramForm({
  isEdit,
  program,
  action,
  onClose,
  existingPrograms,
  onSuccess,
}: {
  isEdit: boolean;
  program: ProgramAdminItem | null;
  action: ProgramAction;
  onClose: () => void;
  existingPrograms: ProgramAdminItem[];
  onSuccess: (message: string) => void;
}) {
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") {
      onSuccess(result.message);
      onClose();
    }
  }, [result, onClose, onSuccess]);

  const [values, setValues] = useState(() => ({
    title: program?.title ?? "",
    description: program?.description ?? "",
    start_date: program?.start_date ?? "",
    end_date: program?.end_date ?? "",
    start_time: program?.start_time?.slice(0, 5) ?? "",
    end_time: program?.end_time?.slice(0, 5) ?? "",
    location: program?.location ?? "",
    link_url: program?.link_url ?? "",
    sort_order: String(program?.sort_order ?? 0),
    is_published: program ? program.is_published : true,
  }));

  const set = (key: keyof typeof values) => (value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  // Recurrence is create-only. It stays outside the base value echo so a
  // validation error cannot reset the admin's repeat settings.
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"weekly" | "daily">(
    "weekly",
  );
  const [recurrenceMonth, setRecurrenceMonth] = useState("");
  const [recurrenceLastDate, setRecurrenceLastDate] = useState("");

  useEffect(() => {
    if (repeatEnabled && values.start_date && !recurrenceMonth) {
      setRecurrenceMonth(values.start_date.slice(0, 7));
    }
  }, [repeatEnabled, recurrenceMonth, values.start_date]);

  const recurrenceDates = useMemo(
    () =>
      repeatEnabled
        ? recurrenceFrequency === "daily"
          ? generateDailyOccurrenceDates(values.start_date, recurrenceLastDate)
          : generateWeeklyOccurrenceDates(values.start_date, recurrenceMonth)
        : [],
    [
      repeatEnabled,
      recurrenceFrequency,
      recurrenceMonth,
      recurrenceLastDate,
      values.start_date,
    ],
  );
  const existingOccurrenceKeys = useMemo(
    () =>
      new Set(
        existingPrograms.map((item) =>
          programOccurrenceKey(item.title, item.start_date, item.start_time),
        ),
      ),
    [existingPrograms],
  );
  const recurrencePreview = useMemo(
    () =>
      recurrenceDates.map((date) => ({
        date,
        exists: existingOccurrenceKeys.has(
          programOccurrenceKey(values.title, date, values.start_time || null),
        ),
      })),
    [existingOccurrenceKeys, recurrenceDates, values.start_time, values.title],
  );
  const skippedPreviewCount = recurrencePreview.filter((item) => item.exists).length;
  const newPreviewCount = recurrencePreview.length - skippedPreviewCount;

  return (
    <form action={formAction} className="space-y-4">
      {isEdit ? <input type="hidden" name="id" value={program!.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={values.title}
          onChange={(event) => set("title")(event.target.value)}
          placeholder="e.g. Alwidai Majalis"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={(event) => set("description")(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={values.start_date}
            onChange={(event) => set("start_date")(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">
            {repeatEnabled && recurrenceFrequency === "daily"
              ? "Occurrence end date (optional)"
              : "End date (optional)"}
          </Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={values.end_date}
            onChange={(event) => set("end_date")(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time">Start time (optional)</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            value={values.start_time}
            onChange={(event) => set("start_time")(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End time (optional)</Label>
          <Input
            id="end_time"
            name="end_time"
            type="time"
            value={values.end_time}
            onChange={(event) => set("end_time")(event.target.value)}
          />
        </div>
      </div>

      {!isEdit ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/25 p-4">
          <input
            type="hidden"
            name="repeat_enabled"
            value={repeatEnabled ? "true" : "false"}
          />
          <div className="flex items-center gap-3">
            <Switch
              id="repeat_enabled"
              checked={repeatEnabled}
              onCheckedChange={setRepeatEnabled}
            />
            <div>
              <Label htmlFor="repeat_enabled">Repeat this program</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create weekly or daily occurrences of the same program.
              </p>
            </div>
          </div>

          {repeatEnabled ? (
            <div className="space-y-4 border-t border-border/70 pt-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="recurrence_frequency"
                    className="text-xs text-muted-foreground"
                  >
                    Repeat
                  </Label>
                  <select
                    id="recurrence_frequency"
                    name="recurrence_frequency"
                    value={recurrenceFrequency}
                    onChange={(event) =>
                      setRecurrenceFrequency(
                        event.target.value === "daily" ? "daily" : "weekly",
                      )
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Repeats on</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {recurrenceFrequency === "daily"
                      ? "Every day"
                      : (weekdayName(values.start_date) ?? "Select a start date")}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor={
                      recurrenceFrequency === "daily"
                        ? "recurrence_last_date"
                        : "recurrence_month"
                    }
                    className="text-xs text-muted-foreground"
                  >
                    {recurrenceFrequency === "daily"
                      ? "Last repeat date"
                      : "Generate for"}
                  </Label>
                  {recurrenceFrequency === "daily" ? (
                    <Input
                      id="recurrence_last_date"
                      name="recurrence_last_date"
                      type="date"
                      value={recurrenceLastDate}
                      onChange={(event) => setRecurrenceLastDate(event.target.value)}
                      min={values.start_date || undefined}
                      max={
                        addCalendarDays(values.start_date, MAX_DAILY_OCCURRENCES - 1) ??
                        undefined
                      }
                      required
                      className="h-9"
                    />
                  ) : (
                    <Input
                      id="recurrence_month"
                      name="recurrence_month"
                      type="month"
                      value={recurrenceMonth}
                      onChange={(event) => setRecurrenceMonth(event.target.value)}
                      required={repeatEnabled}
                      className="h-9"
                    />
                  )}
                </div>
              </div>

              {recurrenceFrequency === "daily" ? (
                <p className="text-xs text-muted-foreground">
                  Includes the start date and last repeat date, with the same time and
                  poster each day. The occurrence end date above sets each program&apos;s
                  duration. You can generate up to {MAX_DAILY_OCCURRENCES} dates.
                </p>
              ) : null}

              <div className="rounded-lg border border-brand-500/20 bg-card p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarDaysIcon
                    className="size-4 text-brand-600"
                    aria-hidden="true"
                  />
                  Repeat preview
                </div>
                {recurrencePreview.length > 0 ? (
                  <>
                    <ul className="mt-3 space-y-2">
                      {recurrencePreview.map((item) => (
                        <li
                          key={item.date}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-foreground">
                            {formatRecurrenceDate(item.date)}
                          </span>
                          <span
                            className={
                              item.exists
                                ? "shrink-0 text-xs font-medium text-sand-500"
                                : "shrink-0 text-xs font-medium text-brand-700"
                            }
                          >
                            {item.exists ? "Already exists — skip" : "Will create"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                      <p>
                        {newPreviewCount} new{" "}
                        {newPreviewCount === 1 ? "program" : "programs"} will be created
                        {skippedPreviewCount > 0
                          ? ` · ${skippedPreviewCount} existing ${skippedPreviewCount === 1 ? "occurrence" : "occurrences"} will be skipped`
                          : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {recurrenceFrequency === "daily"
                      ? `Choose a valid start and last repeat date (up to ${MAX_DAILY_OCCURRENCES} dates) to preview the exact dates.`
                      : "Select a valid start date and month to preview the exact dates."}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          name="location"
          value={values.location}
          onChange={(event) => set("location")(event.target.value)}
        />
      </div>

      <ProgramPosterField
        isEdit={isEdit}
        hasCurrentPoster={Boolean(program?.poster_path)}
        currentPosterUrl={program?.previewUrl ?? null}
        currentPosterAlt={program?.title ?? "Current poster"}
      />

      <div className="space-y-2">
        <Label htmlFor="link_url">Link URL (optional)</Label>
        <Input
          id="link_url"
          name="link_url"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={values.link_url}
          onChange={(event) => set("link_url")(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort order</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          min={0}
          value={values.sort_order}
          onChange={(event) => set("sort_order")(event.target.value)}
          className="w-28"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="hidden"
          name="is_published"
          value={values.is_published ? "true" : "false"}
        />
        <Switch
          id="is_published"
          checked={values.is_published}
          onCheckedChange={(checked) => set("is_published")(checked)}
        />
        <Label htmlFor="is_published">Published (show on the website)</Label>
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
          {isEdit ? "Save changes" : "Add program"}
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

function ProgramDialog({
  state,
  onClose,
  existingPrograms,
  onSuccess,
}: {
  state: DialogState;
  onClose: () => void;
  existingPrograms: ProgramAdminItem[];
  onSuccess: (message: string) => void;
}) {
  const isEdit = state?.mode === "edit";
  const program = isEdit ? state.program : null;
  const action = isEdit ? updateProgram : createProgram;

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit program" : "Add program"}</DialogTitle>
          <DialogDescription>
            Programs shown in the homepage “Upcoming Programs” grid.
          </DialogDescription>
        </DialogHeader>

        <ProgramForm
          key={program?.id ?? "create"}
          isEdit={isEdit}
          program={program}
          action={action}
          onClose={onClose}
          existingPrograms={existingPrograms}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ProgramManager({ programs }: { programs: ProgramAdminItem[] }) {
  const [successMessage, setSuccessMessage] = useState("");
  // "?create=1" (from the dashboard Create-new dropdown / quick actions) opens
  // the create dialog immediately — the existing form, no duplicated CRUD logic.
  const [dialog, setDialog] = useState<DialogState>(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("create")
      ? { mode: "create" }
      : null,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Programs" description="Upcoming events and majalis.">
        <Button variant="cta" onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon className="size-4" />
          Add program
        </Button>
      </AdminPageHeader>

      {successMessage ? (
        <p role="status" className="text-sm font-medium text-brand-700">
          {successMessage}
        </p>
      ) : null}

      {programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No programs yet. The homepage is showing the built-in default programs. Add
            one to take over the Upcoming Programs section.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Poster</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="w-44">Date</TableHead>
                <TableHead className="w-44">Time</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <AdminThumb
                      src={program.previewUrl}
                      alt={program.title}
                      className="h-16 w-12"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{program.title}</p>
                    {program.location ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {program.location}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(program.start_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {program.timeLabel ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      active={program.is_published}
                      activeLabel="Published"
                      inactiveLabel="Draft"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit program"
                        onClick={() => setDialog({ mode: "edit", program })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteProgram}
                        id={program.id}
                        entityLabel="program"
                        name={program.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProgramDialog
        state={dialog}
        onClose={() => setDialog(null)}
        existingPrograms={programs}
        onSuccess={setSuccessMessage}
      />
    </div>
  );
}
