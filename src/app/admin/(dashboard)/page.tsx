import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ImageIcon,
  MegaphoneIcon,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { getAllAnnouncements } from "@/features/announcements/queries";
import { getAllBanners } from "@/features/banners/queries";
import { getAllCalendarEvents } from "@/features/calendar/queries";
import { getAllPrograms } from "@/features/programs/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCard = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  total: number;
  liveCount: number;
  liveLabel: string;
};

export default async function AdminDashboardPage() {
  const [banners, programs, announcements, calendarEvents] = await Promise.all([
    getAllBanners(),
    getAllPrograms(),
    getAllAnnouncements(),
    getAllCalendarEvents(),
  ]);

  const stats: StatCard[] = [
    {
      label: "Banners",
      href: "/admin/banners",
      icon: ImageIcon,
      total: banners.length,
      liveCount: banners.filter((banner) => banner.is_active).length,
      liveLabel: "active",
    },
    {
      label: "Programs",
      href: "/admin/programs",
      icon: CalendarDaysIcon,
      total: programs.length,
      liveCount: programs.filter((program) => program.is_published).length,
      liveLabel: "published",
    },
    {
      label: "Announcements",
      href: "/admin/announcements",
      icon: MegaphoneIcon,
      total: announcements.length,
      liveCount: announcements.filter((announcement) => announcement.is_active).length,
      liveLabel: "active",
    },
    {
      label: "Calendar",
      href: "/admin/calendar",
      icon: CalendarIcon,
      total: calendarEvents.length,
      liveCount: calendarEvents.filter((event) => event.is_active).length,
      liveLabel: "active events",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage what appears on the MASOM homepage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href} className="group">
              <Card className="h-full transition-all duration-200 group-hover:border-brand-500/40 group-hover:shadow-elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <Icon className="size-5" />
                    </span>
                    <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </div>
                  <CardTitle className="mt-3 text-base">{stat.label}</CardTitle>
                  <CardDescription>
                    {stat.total} total · {stat.liveCount} {stat.liveLabel}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Banners</span> and{" "}
            <span className="font-medium text-foreground">Programs</span> you publish here
            replace the website&apos;s built-in defaults. Until you add your own, the
            homepage keeps showing the existing MASOM content, so it is never empty.
          </p>
          <p>
            <span className="font-medium text-foreground">Announcements</span> appear in
            the news ticker at the top of the homepage. When there are none, the ticker is
            hidden automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
