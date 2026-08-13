"use client";

import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

const CLOSE_DELAY_MS = 120;
const easeBrand: [number, number, number, number] = [0.22, 1, 0.36, 1];

function isPlaceholder(href: string) {
  return href === "#";
}

function matchesHref(pathname: string, href: string) {
  if (isPlaceholder(href) || href.startsWith("http")) return false;
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isCurrent(pathname: string, item: NavItem) {
  return (
    matchesHref(pathname, item.href) ||
    (item.children?.some((child) => matchesHref(pathname, child.href)) ?? false)
  );
}

type MainNavProps = {
  items: NavItem[];
  className?: string;
};

export function MainNav({ items, className }: MainNavProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b border-black/5 bg-primary shadow-nav",
        className,
      )}
    >
      <Container>
        <nav aria-label="Main">
          <ul
            className="flex flex-wrap items-center justify-center"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancelClose();
                setOpenIndex(null);
              }
            }}
          >
            {items.map((item, index) => {
              const children = item.children ?? [];
              const hasChildren = children.length > 0;
              const isOpen = hasChildren && openIndex === index;
              const current = isCurrent(pathname, item);

              const triggerClassName = cn(
                "relative flex items-center gap-1.5 px-4 py-3.5 text-[0.8125rem] font-bold tracking-[0.06em] text-white uppercase transition-colors duration-200",
                "after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-250 after:content-['']",
                "hover:after:scale-x-100 focus-visible:after:scale-x-100",
                (current || isOpen) && "after:scale-x-100",
              );

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => {
                    if (!hasChildren) return;
                    cancelClose();
                    setOpenIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (!hasChildren) return;
                    scheduleClose();
                  }}
                  onFocus={() => {
                    if (!hasChildren) return;
                    cancelClose();
                    setOpenIndex(index);
                  }}
                  onBlur={(event) => {
                    if (!hasChildren) return;
                    if (
                      !event.currentTarget.contains(event.relatedTarget as Node | null)
                    ) {
                      scheduleClose();
                    }
                  }}
                >
                  {hasChildren && isPlaceholder(item.href) ? (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={triggerClassName}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                      className={triggerClassName}
                    >
                      {item.label}
                      {hasChildren ? (
                        <ChevronDownIcon
                          className={cn(
                            "size-3.5 transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                  )}

                  <AnimatePresence>
                    {isOpen ? (
                      <motion.ul
                        initial={
                          shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                        }
                        animate={
                          shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                        }
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: easeBrand }}
                        className="absolute top-full left-0 z-50 min-w-64 overflow-hidden rounded-b-lg border border-black/5 bg-white py-1.5 shadow-elevated"
                      >
                        {children.map((child) => (
                          <li key={child.label}>
                            {isPlaceholder(child.href) ? (
                              <span
                                aria-disabled="true"
                                className="block px-5 py-2.5 text-sm text-muted-foreground/70"
                              >
                                {child.label}
                              </span>
                            ) : (
                              <Link
                                href={child.href}
                                target={
                                  child.external || child.href.startsWith("http")
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  child.external || child.href.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                aria-current={
                                  matchesHref(pathname, child.href) ? "page" : undefined
                                }
                                className={cn(
                                  "border-l-[3px] border-transparent px-5 py-2.5 text-sm font-bold transition-all duration-200",
                                  "block hover:border-sand-400 hover:bg-brand-50 hover:pl-6 hover:text-primary",
                                  matchesHref(pathname, child.href) &&
                                    "border-sand-400 text-primary",
                                )}
                              >
                                {child.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
