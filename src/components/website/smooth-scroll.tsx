"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import styles from "./smooth-scroll.module.css";

const ScrollToTopContext = createContext<(() => void) | null>(null);
const nativeScrollToTop = () =>
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });

/** Matches Wen Africa's Team page without changing the CMS's native scrolling. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const lenis = useRef<Lenis | null>(null);
  const scrollToTop = useCallback(() => {
    if (lenis.current) lenis.current.scrollTo(0);
    else nativeScrollToTop();
  }, []);

  useEffect(() => {
    if (isAdmin) return;

    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let restoreFocus: (() => void) | undefined;
    root.classList.add(styles.root);

    const destroy = () => {
      lenis.current?.destroy();
      lenis.current = null;
    };
    const syncScrollLock = () => {
      const instance = lenis.current;
      if (!instance) return;
      // Radix portals lock the document while their own content stays scrollable.
      const locked =
        document.body.hasAttribute("data-scroll-locked") ||
        document.body.style.overflow === "hidden";
      if (locked && !instance.isStopped) instance.stop();
      else if (!locked && instance.isStopped) instance.start();
    };
    const syncMotion = () => {
      destroy();
      if (!motion.matches) {
        lenis.current = new Lenis({
          autoRaf: true,
          smoothWheel: true,
          syncTouch: false,
          duration: 0.85,
          easing: (progress) => 1 - Math.pow(1 - progress, 3),
          anchors: false,
          stopInertiaOnNavigate: true,
          allowNestedScroll: true,
        });
        syncScrollLock();
      }
    };

    const focusTarget = (target: HTMLElement) => {
      restoreFocus?.();
      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        const restore = () => {
          target.removeEventListener("blur", restore);
          target.removeAttribute("tabindex");
          restoreFocus = undefined;
        };
        restoreFocus = restore;
        target.addEventListener("blur", restore, { once: true });
      }
      target.focus({ preventScroll: true });
    };
    const onAnchorClick = (event: MouseEvent) => {
      if (
        !lenis.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (url.hash !== location.hash) {
        window.history.pushState(window.history.state, "", url);
      }
      lenis.current.scrollTo(target, { onComplete: () => focusTarget(target) });
    };
    const stopForHistory = () => {
      lenis.current?.scrollTo(window.scrollY, { immediate: true });
    };

    const scrollLockObserver = new MutationObserver(syncScrollLock);
    syncMotion();
    scrollLockObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    });
    motion.addEventListener("change", syncMotion);
    document.addEventListener("click", onAnchorClick);
    window.addEventListener("popstate", stopForHistory);
    return () => {
      scrollLockObserver.disconnect();
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("popstate", stopForHistory);
      restoreFocus?.();
      destroy();
      root.classList.remove(styles.root);
    };
  }, [isAdmin]);

  useEffect(() => {
    // Programmatic route changes must not inherit the previous page's inertia.
    lenis.current?.scrollTo(window.scrollY, { immediate: true });
  }, [pathname]);

  return (
    <ScrollToTopContext.Provider value={scrollToTop}>
      {children}
    </ScrollToTopContext.Provider>
  );
}

export function useSmoothScrollToTop() {
  return useContext(ScrollToTopContext) ?? nativeScrollToTop;
}
