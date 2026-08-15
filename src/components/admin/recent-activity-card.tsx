import {
  ActivityIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ImageIcon,
  MegaphoneIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import type { ActivityModule, ActivityRecord } from "@/lib/cms/activity";
import { formatRelativeTime } from "@/lib/format/relative-time";

const MODULE_META: Record<
  ActivityModule,
  { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  banner: { label: "Banner", icon: ImageIcon },
  program: { label: "Program", icon: CalendarDaysIcon },
  announcement: { label: "Announcement", icon: MegaphoneIcon },
  calendar: { label: "Calendar", icon: CalendarIcon },
};

type RecentActivityCardProps = {
  records: ActivityRecord[];
  /** Server-side \"now\" so all relative times share one clock. */
  now: number;
};

/** Timeline of the latest admin actions — compact, never a raw table. */
export function RecentActivityCard({ records, now }: RecentActivityCardProps) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="rounded-2xl border border-border/60 bg-card shadow-card"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <h2
          id="recent-activity-heading"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase"
        >
          <ActivityIcon aria-hidden="true" className="size-4" />
          Recent Activity
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[0.6875rem] font-semibold text-muted-foreground">
          Latest {Math.min(records.length, 5)}
        </span>
      </header>

      {records.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No recent activity yet — changes you make in the admin panel will
            appear here.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-border/40">
          {records.map((record) => {
            const meta = MODULE_META[record.module] ?? MODULE_META.calendar;
            const Icon = meta.icon;
            const action = record.action.charAt(0).toUpperCase() + record.action.slice(1);
            return (
              <li key={record.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-500/20">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{meta.label}</span>{" "}
                    <span className="font-medium text-muted-foreground">{action}</span>
                  </p>
                  {record.description ? (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {record.description}
                    </p>
                  ) : null}
                  {record.admin_email ? (
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {record.admin_email}
                    </p>
                  ) : null}
                </div>
                <time
                  dateTime={record.created_at}
                  className="shrink-0 pt-0.5 text-xs font-semibold text-muted-foreground tabular-nums"
                >
                  {formatRelativeTime(record.created_at, now)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
