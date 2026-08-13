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
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/features/calendar/actions";
import { eventCategories } from "@/features/calendar/config";
import type { CalendarEventAdminItem } from "@/features/calendar/types";
import { idleResult } from "@/lib/cms/validation";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; event: CalendarEventAdminItem }
  | null;

const MONTH_NAMES = [
  "All months",
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

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function EventDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const isEdit = state?.mode === "edit";
  const event = isEdit ? state.event : null;
  const action = isEdit ? updateCalendarEvent : createCalendarEvent;
  const [result, formAction] = useActionState(action, idleResult);

  useEffect(() => {
    if (result.status === "success") onClose();
  }, [result, onClose]);

  return (
    <Dialog open={state !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "Add event"}</DialogTitle>
          <DialogDescription>
            Islamic events. Several events can share the same day.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4" key={event?.id ?? "create"}>
          {isEdit ? <input type="hidden" name="id" value={event!.id} /> : null}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event?.title ?? ""}
              placeholder="e.g. Wiladat: Imam Ali (AS)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={event?.event_date ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                name="category"
                list="event-categories"
                defaultValue={event?.category ?? ""}
                placeholder="Wiladat, Martyrdom…"
              />
              <datalist id="event-categories">
                {eventCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={event?.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order (within the day)</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={event?.sort_order ?? 0}
              className="w-28"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={event ? event.is_active : true}
            />
            <Label htmlFor="is_active">Active (show on the website)</Label>
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
              {isEdit ? "Save changes" : "Add event"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EventManager({ events }: { events: CalendarEventAdminItem[] }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [month, setMonth] = useState(0); // 0 = all

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (month === 0) return true;
        return Number(event.event_date.split("-")[1]) === month;
      }),
    [events, month],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Islamic events</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wiladats, martyrdoms and other occasions. Multiple events per day are supported.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="event-month-filter" className="sr-only">
            Month
          </Label>
          <select
            id="event-month-filter"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
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
            Add event
          </Button>
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No events for this selection.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">
                    {formatDate(event.event_date)}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-md font-medium text-foreground">{event.title}</p>
                    {event.description ? (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.category ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={event.is_active} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit event"
                        onClick={() => setDialog({ mode: "edit", event })}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirm
                        action={deleteCalendarEvent}
                        id={event.id}
                        entityLabel="event"
                        name={event.title.slice(0, 40)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EventDialog state={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}
