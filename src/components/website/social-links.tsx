import { MailIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/website/brand-icons";
import type { SocialKey, SocialLink } from "@/config/social";
import { cn } from "@/lib/utils";

const iconMap: Record<SocialKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  email: MailIcon,
};

type SocialLinksProps = {
  items: SocialLink[];
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
};

export function SocialLinks({
  items,
  className,
  itemClassName,
  iconClassName,
}: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {items.map((item) => {
        const Icon = iconMap[item.key];
        const isMail = item.key === "email";

        return (
          <li key={item.key}>
            <a
              href={item.href}
              target={isMail ? undefined : "_blank"}
              rel={isMail ? undefined : "noopener noreferrer"}
              aria-label={item.label}
              className={cn(
                "flex size-9 items-center justify-center rounded-md transition-colors duration-200 hover:text-brand-400",
                itemClassName,
              )}
            >
              <Icon className={cn("size-[1.15rem]", iconClassName)} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
