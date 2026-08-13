"use client";

import { MapPinIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SocialLinks } from "@/components/website/social-links";
import { siteConfig } from "@/config/site";
import { footerSocialLinks } from "@/config/social";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

type MobileNavProps = {
  items: NavItem[];
  className?: string;
};

const linkClassName =
  "block rounded-md px-3 py-2.5 text-[0.9375rem] text-white/85 transition-colors duration-200 hover:bg-white/5 hover:text-white";

export function MobileNav({ items, className }: MobileNavProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open menu"
          className={cn("text-foreground hover:bg-muted", className)}
        >
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[min(92vw,24rem)]! max-w-none! flex-col gap-0 border-white/10 bg-ink-900 p-0 text-white"
      >
        <SheetTitle className="sr-only">Site menu</SheetTitle>

        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <BrandLogo variant="light" imageClassName="h-10 w-auto lg:h-10" />
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Close menu"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <XIcon className="size-5" />
            </Button>
          </SheetClose>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
          <Accordion type="multiple" className="gap-0">
            <ul>
              {items.map((item, index) => {
                const children = item.children ?? [];

                return (
                  <motion.li
                    key={item.label}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 14 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: shouldReduceMotion ? 0 : index * 0.035,
                    }}
                  >
                    {children.length > 0 ? (
                      <AccordionItem
                        value={item.label}
                        className="border-b border-white/10"
                      >
                        <AccordionTrigger className="px-3 text-[0.9375rem] font-bold text-white hover:no-underline **:data-[slot=accordion-trigger-icon]:text-brand-400">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 [&_a]:no-underline">
                          <ul className="ml-3 border-l border-brand-500/40 pl-2">
                            {children.map((child) => (
                              <li key={child.label}>
                                {child.href === "#" ? (
                                  <span
                                    aria-disabled="true"
                                    className="block px-3 py-2.5 text-[0.9375rem] text-white/40"
                                  >
                                    {child.label}
                                  </span>
                                ) : (
                                  <Link
                                    href={child.href}
                                    target={child.external ? "_blank" : undefined}
                                    rel={
                                      child.external ? "noopener noreferrer" : undefined
                                    }
                                    onClick={() => setOpen(false)}
                                    className={linkClassName}
                                  >
                                    {child.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={cn(
                          linkClassName,
                          "border-b border-white/10 py-3.5 font-bold text-white",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </Accordion>
        </nav>

        <div className="space-y-4 border-t border-white/10 px-5 py-5">
          <Button asChild variant="cta" size="pill" className="w-full">
            <Link href={siteConfig.links.donate} onClick={() => setOpen(false)}>
              Donate Now
            </Link>
          </Button>

          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <a
                href={siteConfig.contact.phoneHref}
                className="inline-flex items-center gap-2 transition-colors hover:text-brand-400"
              >
                <PhoneIcon className="size-4 text-brand-400" aria-hidden="true" />
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.contact.address.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 transition-colors hover:text-brand-400"
              >
                <MapPinIcon
                  className="mt-0.5 size-4 shrink-0 text-brand-400"
                  aria-hidden="true"
                />
                <span>
                  {siteConfig.contact.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </a>
            </li>
          </ul>

          <SocialLinks
            items={footerSocialLinks}
            className="gap-1"
            itemClassName="bg-white/5 text-white/80 hover:bg-white/10"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
