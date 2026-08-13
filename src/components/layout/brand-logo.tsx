import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const logoVariants = {
  dark: siteConfig.assets.logoDark,
  light: siteConfig.assets.logoLight,
  compact: siteConfig.assets.logoCompact,
} as const;

type BrandLogoProps = {
  variant?: keyof typeof logoVariants;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "dark",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const logo = logoVariants[variant];

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-85",
        className,
      )}
    >
      <Image
        src={logo.src}
        alt={`${siteConfig.name} — ${siteConfig.legalName}`}
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={cn("h-14 w-auto lg:h-[82px]", imageClassName)}
      />
    </Link>
  );
}
