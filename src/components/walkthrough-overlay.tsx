"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
}

const STEPS: WalkthroughStep[] = [
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
    description: "Toggle this on when screen-sharing via Teams. It disables looping animations so they don't distract your audience.",
    target: "[data-wt='teams-toggle']",
    position: "bottom",
  },
  {
    id: "presenter-mode",
    title: "Presenter Mode",
    description: "Opens a synced audience window you can share on Teams while keeping presenter notes and controls on your screen.",
    target: "[data-wt='presenter-mode']",
    position: "bottom",
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

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el?.getBoundingClientRect() ?? null;
}

const PAD = 6;
const CARD_W = 340;
const CARD_GAP = 14;

export function WalkthroughOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step];

  const measure = useCallback(() => {
    const r = getRect(current.target);
    setRect(r);
  }, [current.target]);

  useEffect(() => {
    measure();
    const id = setInterval(measure, 200);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else onClose();
      }
      if (e.key === "ArrowLeft" && step > 0) setStep(s => s - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onClose]);

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
      style.top = Math.max(12, rect.top);
      style.left = rect.right + CARD_GAP;
    } else {
      style.top = Math.max(12, rect.top);
      style.left = rect.left - CARD_GAP - CARD_W;
    }
    return style;
  })();

  const cardBottom = current.position === "top" && rect
    ? { bottom: window.innerHeight - rect.top + CARD_GAP }
    : undefined;

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

      {/* Clickable backdrop to close */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 202 }}
        onClick={onClose}
      />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
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
              {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="rounded p-0.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-white">{current.title}</h3>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-white/60">
            {current.description}
          </p>

          {/* Progress dots + nav */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setStep(i); }}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === step ? "scale-125 bg-[#21A5D5]" : i < step ? "bg-white/30" : "bg-white/15",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setStep(s => s - 1); }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="size-3" />
                  Back
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (step < STEPS.length - 1) setStep(s => s + 1);
                  else onClose();
                }}
                className="flex items-center gap-1 rounded-md bg-[#21A5D5] px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-[#21A5D5]/80"
              >
                {step < STEPS.length - 1 ? "Next" : "Done"}
                {step < STEPS.length - 1 && <ChevronRight className="size-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
