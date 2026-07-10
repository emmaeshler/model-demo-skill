"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  detour?: string;
  detourNote?: string;
}

const MAIN_STEPS: WalkthroughStep[] = [
  {
    id: "nav-dropdown",
    title: "Section Navigator",
    description: "Jump to any section or sub-step in the presentation. Click to open, then select where you want to go.",
    target: "[data-wt='nav-dropdown']",
    position: "bottom",
  },
  {
    id: "teams-toggle",
    title: "Teams Sharing Mode",
    description: "Teams compresses your screen share, which can make animations look laggy. Toggle this on to limit motion so your presentation stays smooth for viewers.",
    target: "[data-wt='teams-toggle']",
    position: "bottom",
  },
  {
    id: "presenter-mode",
    title: "Presenter Mode",
    description: "Opens a synced audience window you can share on Teams while keeping presenter notes and controls on your screen.",
    target: "[data-wt='presenter-mode']",
    position: "bottom",
    detour: "presenter",
    detourNote: "This will open a new browser tab for the audience view. Switch back to this tab to continue the tour.",
  },
  {
    id: "fullscreen",
    title: "Full Screen",
    description: "Enter full-screen mode for a clean, distraction-free presentation. The toolbar buttons collapse to icons to save space.",
    target: "[data-wt='fullscreen']",
    position: "bottom",
  },
  {
    id: "download",
    title: "Download",
    description: "Download a standalone HTML file of the presentation that works offline — no server needed.",
    target: "[data-wt='download']",
    position: "bottom",
  },
  {
    id: "kebab",
    title: "More Options",
    description: "Access the Slide Sorter for a bird's-eye view, the Walk Through guide, and the Animation Glossary.",
    target: "[data-wt='kebab']",
    position: "bottom",
  },
  {
    id: "bottom-nav",
    title: "Slide Navigation",
    description: "Use Back and Next to move through slides. The dots show your progress within the current section. Keyboard arrows work too.",
    target: "[data-wt='bottom-nav']",
    position: "top",
  },
];

const PRESENTER_STEPS: WalkthroughStep[] = [
  {
    id: "p-slide-preview",
    title: "Slide Preview",
    description: "This is what your audience sees. A synced window opens on your second monitor (or for screen-sharing) showing the same content full screen.",
    target: "[data-wt='p-slide-preview']",
    position: "right",
  },
  {
    id: "p-notes-panel",
    title: "Speaker Notes & Next Slide",
    description: "Your speaker notes for the current step appear here, along with a preview of the next slide so you always know what's coming.",
    target: "[data-wt='p-notes-panel']",
    position: "left",
  },
  {
    id: "p-timer",
    title: "Presentation Timer",
    description: "A running timer to help you pace your talk. Pause or reset it with the controls on either side.",
    target: "[data-wt='p-timer']",
    position: "bottom",
  },
  {
    id: "p-end-show",
    title: "End Show",
    description: "Closes the audience window and returns you to the normal editing view.",
    target: "[data-wt='p-end-show']",
    position: "bottom",
  },
];

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el?.getBoundingClientRect() ?? null;
}

const PAD = 6;
const CARD_W = 340;
const CARD_GAP = 14;

interface WalkthroughOverlayProps {
  onClose: () => void;
  onStartPresenting?: () => void;
  onEndPresenting?: () => void;
}

export function WalkthroughOverlay({ onClose, onStartPresenting, onEndPresenting }: WalkthroughOverlayProps) {
  const [mainStep, setMainStep] = useState(0);
  const [detour, setDetour] = useState<string | null>(null);
  const [detourStep, setDetourStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [waitingForTarget, setWaitingForTarget] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const inDetour = detour !== null;
  const steps = inDetour ? PRESENTER_STEPS : MAIN_STEPS;
  const step = inDetour ? detourStep : mainStep;
  const totalSteps = steps.length;
  const current = steps[step];

  const measure = useCallback(() => {
    const r = getRect(current.target);
    setRect(r);
    if (r && waitingForTarget) setWaitingForTarget(false);
  }, [current.target, waitingForTarget]);

  useEffect(() => {
    measure();
    const id = setInterval(measure, 150);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  const enterDetour = useCallback(() => {
    if (!onStartPresenting) return;
    setWaitingForTarget(true);
    onStartPresenting();
    setTimeout(() => {
      setDetour("presenter");
      setDetourStep(0);
    }, 600);
  }, [onStartPresenting]);

  const exitDetour = useCallback(() => {
    onEndPresenting?.();
    setDetour(null);
    setDetourStep(0);
    setWaitingForTarget(false);
    setMainStep(s => s + 1);
  }, [onEndPresenting]);

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) {
      if (inDetour) setDetourStep(s => s + 1);
      else setMainStep(s => s + 1);
    } else if (inDetour) {
      exitDetour();
    } else {
      onClose();
    }
  }, [step, totalSteps, inDetour, exitDetour, onClose]);

  const goBack = useCallback(() => {
    if (step > 0) {
      if (inDetour) setDetourStep(s => s - 1);
      else setMainStep(s => s - 1);
    } else if (inDetour) {
      exitDetour();
    }
  }, [step, inDetour, exitDetour]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (waitingForTarget) return;
      if (e.key === "Escape") {
        if (inDetour) exitDetour();
        else onClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goBack, onClose, inDetour, exitDetour, waitingForTarget]);

  if (waitingForTarget) {
    return (
      <div className="fixed inset-0 z-[200]">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 203 }}>
          <div className="rounded-xl border border-white/10 bg-[#06283D] px-8 py-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 size-6 animate-spin rounded-full border-2 border-white/20 border-t-[#21A5D5]" />
            <p className="text-sm font-medium text-white/70">Opening Presenter Mode...</p>
          </div>
        </div>
      </div>
    );
  }

  const cardStyle = (() => {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;
    const pos = current.position;
    const style: Record<string, string | number> = { position: "fixed" as const };

    if (pos === "bottom") {
      style.top = rect.bottom + CARD_GAP;
      style.left = Math.max(12, Math.min(rect.left + rect.width / 2 - CARD_W / 2, window.innerWidth - CARD_W - 12));
    } else if (pos === "top") {
      style.left = Math.max(12, Math.min(rect.left + rect.width / 2 - CARD_W / 2, window.innerWidth - CARD_W - 12));
    } else if (pos === "right") {
      style.top = Math.max(12, Math.min(rect.top + rect.height / 2 - 100, window.innerHeight - 220));
      style.left = Math.min(rect.right + CARD_GAP, window.innerWidth - CARD_W - 12);
    } else {
      style.top = Math.max(12, Math.min(rect.top + rect.height / 2 - 100, window.innerHeight - 220));
      style.left = Math.max(12, rect.left - CARD_GAP - CARD_W);
    }
    return style;
  })();

  const cardBottom = current.position === "top" && rect
    ? { bottom: window.innerHeight - rect.top + CARD_GAP }
    : undefined;

  const hasDetour = !inDetour && current.detour && onStartPresenting;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Overlay with SVG mask cutout */}
      <svg className="fixed inset-0 size-full" style={{ zIndex: 200, pointerEvents: "none" }}>
        <defs>
          <mask id="wt-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PAD}
                y={rect.top - PAD}
                width={rect.width + PAD * 2}
                height={rect.height + PAD * 2}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#wt-mask)" />
      </svg>

      {/* Highlight border */}
      {rect && (
        <div
          className="fixed rounded-lg border-2 border-[#21A5D5] pointer-events-none"
          style={{
            zIndex: 201,
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 2px rgba(33,165,213,0.25), 0 0 20px rgba(33,165,213,0.15)",
          }}
        />
      )}

      {/* Clickable backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 202 }}
        onClick={() => { if (inDetour) exitDetour(); else onClose(); }}
      />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${detour ?? "main"}-${current.id}`}
          ref={cardRef}
          className="fixed rounded-xl border border-white/10 bg-[#06283D] p-5 shadow-2xl"
          style={{
            zIndex: 203,
            width: CARD_W,
            ...cardStyle,
            ...(cardBottom ?? {}),
          }}
          initial={{ opacity: 0, y: current.position === "top" ? 8 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: current.position === "top" ? 8 : -8 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step counter */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide text-white/40">
              {inDetour ? (
                <>Presenter Mode — {step + 1} of {totalSteps}</>
              ) : (
                <>{step + 1} of {totalSteps}</>
              )}
            </span>
            <button
              onClick={() => { if (inDetour) exitDetour(); else onClose(); }}
              className="rounded p-0.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-white">{current.title}</h3>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/60">
            {current.description}
          </p>

          {/* Detour button */}
          {hasDetour && (
            <div className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); enterDetour(); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#21A5D5]/30 bg-[#21A5D5]/10 px-3 py-2 text-xs font-bold text-[#21A5D5] transition-colors hover:bg-[#21A5D5]/20"
              >
                <MonitorPlay className="size-3.5" />
                Tour Presenter Mode
              </button>
              {current.detourNote && (
                <p className="mt-2 text-[11px] font-medium leading-snug text-white/35">
                  {current.detourNote}
                </p>
              )}
            </div>
          )}

          {/* Progress dots + nav */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inDetour) setDetourStep(i);
                    else setMainStep(i);
                  }}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === step ? "scale-125 bg-[#21A5D5]" : i < step ? "bg-white/30" : "bg-white/15",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {(step > 0 || inDetour) && (
                <button
                  onClick={(e) => { e.stopPropagation(); goBack(); }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="size-3" />
                  {inDetour && step === 0 ? "Exit Tour" : "Back"}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="flex items-center gap-1 rounded-md bg-[#21A5D5] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[#21A5D5]/80"
              >
                {inDetour && step === totalSteps - 1 ? "Back to Tour" : step === totalSteps - 1 && !inDetour ? "Done" : "Next"}
                {(step < totalSteps - 1 || inDetour) && <ChevronRight className="size-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
