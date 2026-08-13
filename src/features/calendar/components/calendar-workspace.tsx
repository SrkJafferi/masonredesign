"use client";

import { CalendarIcon, ClockIcon, MoonIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

import { DayManager } from "@/features/calendar/components/day-manager";
import { EventManager } from "@/features/calendar/components/event-manager";
import { HijriMonthManager } from "@/features/calendar/components/hijri-month-manager";
import { HijriOverrideManager } from "@/features/calendar/components/hijri-override-manager";
import type {
  CalendarDayAdminItem,
  CalendarEventAdminItem,
  HijriMonthAdminItem,
  HijriOverrideAdminItem,
} from "@/features/calendar/types";
import { cn } from "@/lib/utils";

type Tab = "timings" | "months" | "overrides" | "events";

const TABS: { key: Tab; label: string; icon: typeof ClockIcon }[] = [
  { key: "timings", label: "Prayer timings", icon: ClockIcon },
  { key: "months", label: "Hijri months", icon: MoonIcon },
  { key: "overrides", label: "Hijri overrides", icon: SparklesIcon },
  { key: "events", label: "Events", icon: CalendarIcon },
];

export function CalendarWorkspace({
  year,
  days,
  months,
  overrides,
  events,
}: {
  year: number;
  days: CalendarDayAdminItem[];
  months: HijriMonthAdminItem[];
  overrides: HijriOverrideAdminItem[];
  events: CalendarEventAdminItem[];
}) {
  const [tab, setTab] = useState<Tab>("timings");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the {year} prayer timings, Hijri dates and Islamic events shown on the
          public Hijri calendar.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border/60">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-brand-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "timings" ? <DayManager days={days} year={year} /> : null}
      {tab === "months" ? <HijriMonthManager months={months} /> : null}
      {tab === "overrides" ? <HijriOverrideManager overrides={overrides} /> : null}
      {tab === "events" ? <EventManager events={events} /> : null}
    </div>
  );
}
