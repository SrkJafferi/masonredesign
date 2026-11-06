"use client";

import { CalendarDaysIcon, PencilIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
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
import {
  createProgram,
  deleteProgram,
  getProgramOccurrencePreview,
  updateProgram,
} from "@/features/programs/actions";
import type { ProgramAdminItem } from "@/features/programs/types";
import { idleResult } from "@/lib/cms/validation";

import { ProgramPosterField } from "./program-poster-field";
import { ProgramListControls } from "./program-list-controls";
import { adminProgramsUrl } from "../admin-list";
import type { AdminProgramFilters } from "../admin-list";
import type { getAdminProgramPage } from "../queries";
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
  onSuccess,
}: {
  isEdit: boolean;
  program: ProgramAdminItem | null;
  action: ProgramAction;
  onClose: () => void;
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
  const previewKey = recurrenceDates.join(",");
  const [preview, setPreview] = useState<{ dates: string; keys: string[] | null } | null>(
    null,
  );
  useEffect(() => {
    if (!previewKey) return;
    let active = true;
    const timer = setTimeout(() => {
      void getProgramOccurrencePreview(previewKey.split(","))
        .then((keys) => {
          if (active) setPreview({ dates: previewKey, keys });
        })
        .catch(() => {
          if (active) setPreview({ dates: previewKey, keys: null });
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [previewKey]);
  const previewResult = preview?.dates === previewKey ? preview : null;
  const existingOccurrenceKeys = useMemo(
    () => new Set(previewResult?.keys ?? []),
    [previewResult],
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
                            {previewResult?.keys
                              ? item.exists
                                ? "Already exists — skip"
                                : "Will create"
                              : "Scheduled date"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                      {previewResult?.keys ? (
                        <p>
                          {newPreviewCount} new{" "}
                          {newPreviewCount === 1 ? "program" : "programs"} will be created
                          {skippedPreviewCount > 0
                            ? ` · ${skippedPreviewCount} existing ${skippedPreviewCount === 1 ? "occurrence" : "occurrences"} will be skipped`
                            : ""}
                        </p>
                      ) : (
                        <p>
                          {previewResult
                            ? "Preview unavailable. Duplicates will still be checked on save."
                            : "Checking existing occurrences…"}
                        </p>
                      )}
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
  onSuccess,
}: {
  state: DialogState;
  onClose: () => void;
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
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ProgramManager({
  listing,
  filters,
  currentMonth,
  openCreate,
}: {
  listing: Awaited<ReturnType<typeof getAdminProgramPage>>;
  filters: AdminProgramFilters;
  currentMonth: string;
  openCreate: boolean;
}) {
  const { programs, summary, count, page, pages, offset, failed } = listing;
  const [dialog, setDialog] = useState<DialogState>(
    openCreate ? { mode: "create" } : null,
  );
  useEffect(() => {
    if (openCreate) setDialog({ mode: "create" });
  }, [openCreate]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const url = (patch: Partial<AdminProgramFilters>) =>
    adminProgramsUrl({ ...filters, page: 1, ...patch });
  const firstPageLink = Math.max(1, Math.min(page - 1, pages - 2));
  const pageLinks = Array.from(
    { length: Math.min(pages, 3) },
    (_, index) => firstPageLink + index,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Programs"
        description="Manage upcoming and historical MASOM programs."
      >
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

      <ProgramListControls filters={filters} currentMonth={currentMonth} />
      {!failed && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Selected month
            {filters.query || filters.status !== "all"
              ? " · matching search and status filters"
              : ""}{" "}
            · Chicago time
          </p>
          <dl className="grid grid-cols-3 gap-2">
            {(
              [
                ["Programs", summary.total],
                ["Upcoming", summary.upcoming],
                ["Completed", summary.past],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-lg border border-border/60 bg-card px-3 py-2"
              >
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {failed ? (
        <p role="alert" className="rounded-xl border border-border bg-card p-4 text-sm">
          Could not load programs. Refresh the page to try again.
        </p>
      ) : count === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <p role="status" className="text-sm text-muted-foreground">
            {filters.query
              ? "No matching programs found."
              : filters.view === "upcoming"
                ? "No upcoming programs scheduled for this month."
                : filters.view === "past"
                  ? "No past programs found for this month."
                  : "No programs found for this month."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {filters.view !== "all" && (
              <Button asChild variant="outline" size="sm">
                <Link href={url({ view: "all" })} prefetch={false} scroll={false}>
                  View All Programs
                </Link>
              </Button>
            )}
            {filters.query && (
              <Button asChild variant="ghost" size="sm">
                <Link href={url({ query: "" })} prefetch={false} scroll={false}>
                  Clear search
                </Link>
              </Button>
            )}
            {filters.status !== "all" && (
              <Button asChild variant="ghost" size="sm">
                <Link href={url({ status: "all" })} prefetch={false} scroll={false}>
                  Clear publication filter
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground sm:hidden">
            Scroll the table to see more columns.
          </p>
          <div
            role="region"
            aria-label="Programs table"
            tabIndex={0}
            className="overflow-x-auto rounded-xl border border-border/60 bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&_[data-slot=table-container]]:overflow-visible"
          >
            <Table className="min-w-[640px]">
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
                        className="h-12 w-9"
                      />
                    </TableCell>
                    <TableCell>
                      <p className="max-w-sm font-medium break-words whitespace-normal text-foreground">
                        {program.title}
                      </p>
                      {program.location ? (
                        <p
                          className="max-w-52 truncate text-xs text-muted-foreground"
                          title={program.location}
                        >
                          {program.location}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(program.start_date)}
                      {program.end_date && program.end_date !== program.start_date && (
                        <span className="block text-xs">
                          to {formatDate(program.end_date)}
                        </span>
                      )}
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
                      {filters.view === "all" && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {program.past ? "Completed" : "Upcoming"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${program.title}`}
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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p role="status" className="text-sm text-muted-foreground">
              Showing {offset + 1}–{offset + programs.length} of {count}{" "}
              {count === 1 ? "program" : "programs"}
            </p>
            {pages > 1 && (
              <nav
                aria-label="Program pages"
                className="flex flex-wrap items-center gap-1"
              >
                {page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={url({ page: page - 1 })} prefetch={false} scroll={false}>
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                )}
                {pageLinks.map((number) => (
                  <Button
                    key={number}
                    asChild
                    variant={number === page ? "default" : "outline"}
                    size="sm"
                  >
                    <Link
                      href={url({ page: number })}
                      aria-label={`Page ${number}`}
                      aria-current={number === page ? "page" : undefined}
                      prefetch={false}
                      scroll={false}
                    >
                      {number}
                    </Link>
                  </Button>
                ))}
                {page < pages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={url({ page: page + 1 })} prefetch={false} scroll={false}>
                      Next
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                )}
              </nav>
            )}
          </div>
        </div>
      )}

      <ProgramDialog
        state={dialog}
        onClose={() => setDialog(null)}
        onSuccess={setSuccessMessage}
      />
    </div>
  );
}
