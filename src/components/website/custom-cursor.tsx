"use client";

import { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]';

/**
 * Premium custom cursor: a small instant dot with a smooth trailing ring.
 * Active only on fine-pointer (mouse) devices, never on touch/coarse pointers,
 * and fully disabled under prefers-reduced-motion (native cursor stays on).
 * Both layers are pointer-events-none, so clicks, drags and text selection are
 * never affected.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const dot = document.createElement("div");
    const ring = document.createElement("div");
    for (const el of [dot, ring]) {
      el.setAttribute("aria-hidden", "true");
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.pointerEvents = "none";
      el.style.zIndex = "9999";
      el.style.mixBlendMode = "difference";
      el.style.willChange = "transform";
      el.style.borderRadius = "9999px";
      el.style.backgroundColor = "rgb(255 255 255)";
    }
    dot.style.width = "6px";
    dot.style.height = "6px";
    dot.style.opacity = "0";
    ring.style.width = "34px";
    ring.style.height = "34px";
    ring.style.border = "1.5px solid rgb(255 255 255)";
    ring.style.backgroundColor = "transparent";
    // IMPORTANT: no CSS transition on transform — the loop writes a fresh
    // transform every frame, so a transition would stack ~240ms of lag on top
    // of the lerp and make the ring drag behind the dot.
    ring.style.transition = "opacity 240ms ease";
    document.body.append(dot, ring);

    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let targetX = -100;
    let targetY = -100;
    let hovering = false;
    let pressing = false;
    let overIframe = false;
    let scale = 1;
    let raf = 0;

    const syncVisibility = () => {
      const shown = !overIframe;
      dot.style.opacity = shown ? "1" : "0";
      ring.style.opacity = shown ? "1" : "0";
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      syncVisibility();
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      hovering = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));
      // Iframes (map, YouTube embed) keep their own native cursor — hide ours
      // over them so the user never sees a doubled cursor.
      overIframe = Boolean(target?.closest?.("iframe"));
      syncVisibility();
    };

    const onDown = () => {
      pressing = true;
    };
    const onUp = () => {
      pressing = false;
    };
    const onLeave = () => {
      overIframe = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      dotX = targetX;
      dotY = targetY;
      // Fast follow — the ring stays visually glued to the dot with just a
      // whisper of smoothing, so there is no trailing streak.
      ringX += (targetX - ringX) * 0.45;
      ringY += (targetY - ringY) * 0.45;

      // Smooth the scale separately (the position is written raw every frame).
      const targetScale = pressing ? 0.85 : hovering ? 1.55 : 1;
      scale += (targetScale - scale) * 0.25;

      dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
      ring.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };

    document.documentElement.classList.add("custom-cursor-active");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    setEnabled(true);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      dot.remove();
      ring.remove();
    };
  }, []);

  // Rendered host is empty — the cursor elements are created imperatively so
  // they never interfere with React re-renders or the accessibility tree.
  return enabled ? <span className="hidden" /> : null;
}
