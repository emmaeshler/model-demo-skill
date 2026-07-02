"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, LayoutGrid, ZoomIn, ZoomOut, Sun, Moon } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { type NavGroup, SlideNav, AudienceTopBar } from "@/components/slide-nav";
import { useMode } from "@/lib/mode-context";
import { getPresenterNotes } from "@/lib/presenter-notes";
import { cn } from "@/lib/utils";
import { OverviewSlide, OVERVIEW_TOTAL_STEPS } from "@/components/slides/overview-slide";
import { OneModelSlide, ONE_MODEL_TOTAL_STEPS } from "@/components/slides/one-model";
import { PowerSlide, POWER_TOTAL_STEPS } from "@/components/slides/power-slide";
import { ExecuteSlide, EXECUTE_TOTAL_STEPS } from "@/components/slides/execute-slide";
import { RefineSlide, REFINE_TOTAL_STEPS } from "@/components/slides/refine-slide";
import { ProfitGrowthSlide, PROFIT_GROWTH_TOTAL_STEPS } from "@/components/slides/profit-growth-slide";
import { ClosingSummarySlide } from "@/components/slides/closing-summary";

type SlideKind =
  | "intro"
  | "overview"
  | "one-model"
  | "power"
  | "execute"
  | "refine"
  | "profit-growth"
  | "closing-summary"
  | "end";

interface SlideConfig {
  kind: SlideKind;
}

const SLIDES: SlideConfig[] = [
  { kind: "intro" },
  // Overview
  { kind: "overview" },
  // Section 1: Design
  { kind: "one-model" },
  // Section 2: Power
  { kind: "power" },
  // Section 3: Execute
  { kind: "execute" },
  // Section 4: Refine
  { kind: "refine" },
  // Section 5: Profit Growth
  { kind: "profit-growth" },
  { kind: "closing-summary" },
  { kind: "end" },
];

const OVERVIEW_INDEX = 1;
const ONE_MODEL_INDEX = 2;
const POWER_INDEX = 3;
const EXECUTE_INDEX = 4;
const REFINE_INDEX = 5;
const PROFIT_GROWTH_INDEX = 6;

const SUB_STEP_CONFIG: Record<number, number> = {
  [OVERVIEW_INDEX]: OVERVIEW_TOTAL_STEPS,
  [ONE_MODEL_INDEX]: ONE_MODEL_TOTAL_STEPS,
  [POWER_INDEX]: POWER_TOTAL_STEPS,
  [EXECUTE_INDEX]: EXECUTE_TOTAL_STEPS,
  [REFINE_INDEX]: REFINE_TOTAL_STEPS,
  [PROFIT_GROWTH_INDEX]: PROFIT_GROWTH_TOTAL_STEPS,
};

const EXECUTE_PRESENTER_STEPS = 4;

const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    label: "Introduction",
    slides: [
      { index: 0, label: "Welcome" },
      { index: OVERVIEW_INDEX, label: "Overview", subStep: 0 },
      { index: OVERVIEW_INDEX, label: "The Model", subStep: 1 },
    ],
  },
  {
    label: "1 | Design",
    slides: [
      { index: ONE_MODEL_INDEX, label: "Inputs", subStep: 0 },
      { index: ONE_MODEL_INDEX, label: "Two Engines", subStep: 1 },
    ],
  },
  {
    label: "2 | Power",
    slides: [
      { index: POWER_INDEX, label: "Price Points", subStep: 0 },
      { index: POWER_INDEX, label: "Data Scan", subStep: 1 },
      { index: POWER_INDEX, label: "Factors", subStep: 2 },
      { index: POWER_INDEX, label: "Customize", subStep: 3 },
      { index: POWER_INDEX, label: "Feed", subStep: 4 },
    ],
  },
  {
    label: "3 | Execute",
    slides: [
      { index: EXECUTE_INDEX, label: "Customer Pricing", subStep: 0 },
    ],
  },
  {
    label: "4 | Refine",
    slides: [
      { index: REFINE_INDEX, label: "Scattered", subStep: 0 },
      { index: REFINE_INDEX, label: "Segmentation", subStep: 1 },
      { index: REFINE_INDEX, label: "Optimal Curve", subStep: 2 },
      { index: REFINE_INDEX, label: "QuickParts", subStep: 3 },
      { index: REFINE_INDEX, label: "Acme", subStep: 5 },
      { index: REFINE_INDEX, label: "MedSupply", subStep: 7 },
      { index: REFINE_INDEX, label: "Optimized", subStep: 9 },
    ],
  },
  {
    label: "5 | Profit Growth",
    slides: [
      { index: PROFIT_GROWTH_INDEX, label: "The Scale", subStep: 0 },
      { index: PROFIT_GROWTH_INDEX, label: "Status Quo", subStep: 1 },
      { index: PROFIT_GROWTH_INDEX, label: "Dynamic Model", subStep: 2 },
      { index: PROFIT_GROWTH_INDEX, label: "Model Scan", subStep: 3 },
      { index: PROFIT_GROWTH_INDEX, label: "Optimized", subStep: 4 },
    ],
  },
  {
    label: "Closing",
    slides: [
      { index: 7, label: "Summary" },
      { index: 8, label: "Thank You" },
    ],
  },
];

const AUTO_ANIM_SLIDES = new Set<SlideKind>([]);

const DEFAULT_DONE_MS = 2000;

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [isAudience, setIsAudience] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [slideSorterOpen, setSlideSorterOpen] = useState(false);
  const [sorterCols, setSorterCols] = useState(4);
  const [navGroups, setNavGroups] = useState(DEFAULT_NAV_GROUPS);
  const [darkMode, setDarkMode] = useState(false);
  const [presenterNavOpen, setPresenterNavOpen] = useState(false);
  const { mode } = useMode();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audienceWindowRef = useRef<Window | null>(null);
  const iframeSrcRef = useRef("");
  const total = SLIDES.length;

  const subStepConfig = useMemo(() => {
    if (mode !== "presenter") return SUB_STEP_CONFIG;
    return { ...SUB_STEP_CONFIG, [EXECUTE_INDEX]: EXECUTE_PRESENTER_STEPS };
  }, [mode]);

  const maxSteps = subStepConfig[slide] ?? 0;
  const hasSubSteps = maxSteps > 0;
  const config = SLIDES[slide];
  const notes = getPresenterNotes(config?.kind ?? "", subStep);

  const currentGroup =
    navGroups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === slide &&
          (s.subStep === undefined || s.subStep === subStep),
      ),
    ) ?? navGroups.find((g) => g.slides.some((s) => s.index === slide));

  const allClickSteps = useMemo(() => {
    const steps: { slideIndex: number; stepIndex: number; kind: SlideKind; label: string; groupLabel: string; groupIndex: number; slideInGroupIndex: number }[] = [];
    for (let i = 0; i < SLIDES.length; i++) {
      const kind = SLIDES[i].kind;
      const stepsCount = subStepConfig[i] ?? 0;
      const gi = navGroups.findIndex((g) => g.slides.some((s) => s.index === i));
      const group = gi >= 0 ? navGroups[gi] : undefined;
      const groupLabel = group?.label ?? "";
      if (stepsCount === 0) {
        const si = group?.slides.findIndex((s) => s.index === i) ?? -1;
        const navSlide = si >= 0 ? group!.slides[si] : undefined;
        steps.push({ slideIndex: i, stepIndex: 0, kind, label: navSlide?.label ?? kind, groupLabel, groupIndex: gi, slideInGroupIndex: si });
      } else {
        for (let s = 0; s < stepsCount; s++) {
          const si = group?.slides.findIndex((ns) => ns.index === i && ns.subStep === s) ?? -1;
          const navSlide = si >= 0 ? group!.slides[si] : undefined;
          const label = navSlide?.label ?? `Step ${s + 1}`;
          steps.push({ slideIndex: i, stepIndex: s, kind, label, groupLabel, groupIndex: gi, slideInGroupIndex: si });
        }
      }
    }
    return steps;
  }, [navGroups, subStepConfig]);

  const updateSlideLabel = useCallback((groupIndex: number, slideInGroupIndex: number, newLabel: string) => {
    setNavGroups((prev) => {
      const next = prev.map((g, gi) => {
        if (gi !== groupIndex) return g;
        return {
          ...g,
          slides: g.slides.map((s, si) => (si === slideInGroupIndex ? { ...s, label: newLabel } : s)),
        };
      });
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    channelRef.current?.postMessage({ type: "theme", darkMode });
  }, [darkMode]);

  // Detect audience window mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("audience") === "true") {
      setIsAudience(true);
      const s = parseInt(params.get("slide") || "0", 10);
      const ss = parseInt(params.get("subStep") || "0", 10);
      setSlide(s);
      setSubStep(ss);
    }
  }, []);

  // BroadcastChannel: presenter broadcasts, audience listens
  useEffect(() => {
    if (isAudience) {
      const ch = new BroadcastChannel("ml-explainer-sync");
      ch.onmessage = (e: MessageEvent) => {
        if (e.data?.type === "navigate") {
          setSlide(e.data.slide);
          setSubStep(e.data.subStep);
        }
        if (e.data?.type === "theme") {
          document.documentElement.classList.toggle("dark", e.data.darkMode);
        }
      };
      return () => ch.close();
    }
    if (mode === "presenter") {
      const ch = new BroadcastChannel("ml-explainer-sync");
      channelRef.current = ch;
      return () => { ch.close(); channelRef.current = null; };
    }
  }, [isAudience, mode]);

  // Broadcast navigation state to audience window
  useEffect(() => {
    channelRef.current?.postMessage({ type: "navigate", slide, subStep });
  }, [slide, subStep]);

  const startPresenting = useCallback(() => {
    const base = window.location.origin + window.location.pathname;
    const qs = `?audience=true&mode=self&slide=${slide}&subStep=${subStep}`;
    audienceWindowRef.current = window.open(base + qs, "audience-view") ?? null;
    iframeSrcRef.current = base + qs;
    setPresenting(true);
  }, [slide, subStep]);

  const endPresenting = useCallback(() => {
    audienceWindowRef.current?.close();
    audienceWindowRef.current = null;
    setPresenting(false);
  }, []);

  useEffect(() => {
    if (skipAnimation || isAudience || mode === "presenter") {
      const t = setTimeout(() => setAnimationDone(true));
      return () => clearTimeout(t);
    }
    const t0 = setTimeout(() => setAnimationDone(false));
    const kind = SLIDES[slide]?.kind;
    if (!AUTO_ANIM_SLIDES.has(kind)) {
      const t = setTimeout(() => setAnimationDone(true), DEFAULT_DONE_MS);
      return () => { clearTimeout(t0); clearTimeout(t); };
    }
    return () => clearTimeout(t0);
  }, [slide, subStep, mode, isAudience, skipAnimation]);

  const markAnimationDone = useCallback(() => setAnimationDone(true), []);

  const handleReplay = useCallback(() => {
    setSkipAnimation(false);
    setReplayKey((k) => k + 1);
  }, []);

  const navigate = useCallback(
    (index: number, targetSubStep?: number) => {
      if (targetSubStep !== undefined) {
        const goingBack =
          index < slide || (index === slide && targetSubStep < subStep);
        if (index >= 0 && index < total) {
          setSkipAnimation(goingBack);
          setSlide(index);
          setSubStep(targetSubStep);
        }
        return;
      }

      const currentMax = subStepConfig[slide] ?? 0;

      // Forward within sub-steps
      if (index === slide + 1 && currentMax > 0 && subStep < currentMax - 1) {
        setSkipAnimation(false);
        setSubStep((s) => s + 1);
        return;
      }
      // Back within sub-steps
      if (index === slide - 1 && currentMax > 0 && subStep > 0) {
        setSkipAnimation(true);
        setSubStep((s) => s - 1);
        return;
      }

      if (index >= 0 && index < total) {
        const goingBack = index < slide;

        // Going back into a sub-step slide from the next slide → land on last step
        const targetMax = subStepConfig[index] ?? 0;
        if (goingBack && targetMax > 0 && slide === index + 1) {
          setSkipAnimation(true);
          setSlide(index);
          setSubStep(targetMax - 1);
          return;
        }

        setSkipAnimation(goingBack);
        setSlide(index);
        setSubStep(0);
      }
    },
    [total, slide, subStep, subStepConfig],
  );

  useEffect(() => {
    if (isAudience) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(slide + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(slide - 1);
      } else if (e.key === "Escape" && presenterNavOpen) {
        setPresenterNavOpen(false);
      } else if (e.key === "Escape" && slideSorterOpen) {
        setSlideSorterOpen(false);
      } else if (e.key === "Escape" && presenting) {
        endPresenting();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slide, navigate, isAudience, presenting, endPresenting, slideSorterOpen, presenterNavOpen]);

  return (
    <>
      <main
        className={cn(
          "flex min-h-[var(--slide-h,100vh)] flex-col items-center justify-start overflow-x-hidden pt-14",
          isAudience ? "" : "pb-16",
        )}
      >
        <MotionConfig reducedMotion={skipAnimation ? "always" : "never"}>
        <AnimatePresence mode="wait">
        <motion.div
          key={`${slide}-${replayKey}`}
          initial={skipAnimation ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: skipAnimation ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {config.kind === "intro" && <IntroSlide />}
          {config.kind === "overview" && <OverviewSlide step={subStep} skipAnimation={skipAnimation} />}
          {config.kind === "one-model" && (
            <OneModelSlide
              step={subStep}
              skipAnimation={skipAnimation}
              onAutoAdvance={skipAnimation ? undefined : () => navigate(slide + 1)}
            />
          )}
          {config.kind === "power" && (
            <PowerSlide
              step={subStep}
              onAutoAdvance={skipAnimation ? undefined : () => navigate(slide + 1)}
              skipAnimation={skipAnimation}
            />
          )}
          {config.kind === "refine" && (
            <RefineSlide
              step={subStep}
              onAutoAdvance={skipAnimation ? undefined : () => navigate(slide + 1)}
              skipAnimation={skipAnimation}
            />
          )}
          {config.kind === "execute" && <ExecuteSlide step={subStep} skipAnimation={skipAnimation} />}
          {config.kind === "profit-growth" && (
            <ProfitGrowthSlide
              step={subStep}
              onAutoAdvance={skipAnimation ? undefined : () => navigate(slide + 1)}
              skipAnimation={skipAnimation}
            />
          )}
          {config.kind === "closing-summary" && <ClosingSummarySlide />}
          {config.kind === "end" && <EndSlide onRestart={() => navigate(0)} />}
        </motion.div>
        </AnimatePresence>
        </MotionConfig>
      </main>

      {isAudience ? (
        <AudienceTopBar
          groups={navGroups}
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
        />
      ) : (
        <SlideNav
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
          total={total}
          groups={navGroups}
          onNavigate={navigate}
          animationDone={animationDone}
          onStartPresenting={startPresenting}
          showReplay={skipAnimation}
          onReplay={handleReplay}
        />
      )}

      {/* Slide sorter overlay */}
      {slideSorterOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#f3f4f6]">
          <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-5 py-2.5 shadow-sm">
            <div className="flex items-center gap-3">
              <LayoutGrid className="size-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">
                Slide Sorter
              </span>
              <span className="text-xs text-gray-400">
                {allClickSteps.length} steps
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSorterCols((c) => Math.max(2, c - 1))}
                  disabled={sorterCols <= 2}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="size-4" />
                </button>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={sorterCols}
                  onChange={(e) => setSorterCols(Number(e.target.value))}
                  className="h-1 w-24 cursor-pointer accent-[#00446A]"
                />
                <button
                  onClick={() => setSorterCols((c) => Math.min(8, c + 1))}
                  disabled={sorterCols >= 8}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="size-4" />
                </button>
                <span className="min-w-[2.5rem] text-center text-[11px] text-gray-400">
                  {sorterCols} col
                </span>
              </div>
              <button
                onClick={() => setSlideSorterOpen(false)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <X className="size-3.5" />
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto space-y-6" style={{ maxWidth: sorterCols <= 3 ? "56rem" : "90rem" }}>
              {(() => {
                const grouped: { groupLabel: string; steps: (typeof allClickSteps[number] & { globalIndex: number })[] }[] = [];
                let currentGroupLabel = "";
                let globalIdx = 0;
                for (const cs of allClickSteps) {
                  if (cs.groupLabel !== currentGroupLabel) {
                    currentGroupLabel = cs.groupLabel;
                    grouped.push({ groupLabel: cs.groupLabel, steps: [] });
                  }
                  grouped[grouped.length - 1].steps.push({ ...cs, globalIndex: globalIdx++ });
                }
                return grouped.map((g, gi) => (
                  <div key={gi}>
                    <h3 className={cn(
                      "mb-2 font-bold uppercase tracking-[0.12em] text-gray-400",
                      sorterCols >= 6 ? "text-[9px]" : "text-[11px]",
                    )}>
                      {g.groupLabel}
                    </h3>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${sorterCols}, 1fr)`,
                        gap: sorterCols >= 6 ? "8px" : "12px",
                      }}
                    >
                      {g.steps.map((cs) => {
                        const isActive = cs.slideIndex === slide && cs.stepIndex === subStep;
                        return (
                          <div
                            key={cs.globalIndex}
                            className={cn(
                              "group relative flex w-full flex-col rounded-lg border text-left transition-all hover:shadow-md",
                              isActive
                                ? "border-[#E56910] shadow-[0_0_12px_rgba(229,105,16,0.2)] ring-2 ring-[#E56910]/30"
                                : "border-gray-200 bg-white hover:border-gray-300",
                            )}
                          >
                            <div
                              className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-t-lg bg-gray-100"
                              onClick={() => {
                                navigate(cs.slideIndex, cs.stepIndex);
                                setSlideSorterOpen(false);
                              }}
                            >
                              <img
                                src={`/slide-thumbnails/slide-${cs.slideIndex}-${cs.stepIndex}.jpg`}
                                alt={cs.label}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className={cn(
                              "flex items-center gap-1.5 rounded-b-lg px-2 py-1.5",
                              isActive ? "bg-[#E56910]/10" : "bg-white",
                            )}>
                              <span className={cn(
                                "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                isActive
                                  ? "bg-[#E56910] text-white"
                                  : "bg-gray-100 text-gray-400",
                              )}>
                                {cs.globalIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={cs.label}
                                onChange={(e) => updateSlideLabel(cs.groupIndex, cs.slideInGroupIndex, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "min-w-0 flex-1 truncate border-0 bg-transparent font-medium outline-none focus:ring-1 focus:ring-[#00446A]/30 rounded px-1 -mx-1",
                                  sorterCols >= 6 ? "text-[10px]" : "text-xs",
                                  isActive ? "text-gray-900" : "text-gray-600",
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Presenter console overlay */}
      {presenting && !isAudience && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a]">
          <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-[#111]/90 px-5 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                Presenter Console
              </span>
              <span className="text-white/15">|</span>
              <button
                onClick={() => setPresenterNavOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
              >
                {currentGroup?.label}
                <ChevronDown
                  className={cn(
                    "size-3 text-white/40 transition-transform",
                    presenterNavOpen && "rotate-180",
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={endPresenting}
                className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
              >
                <X className="size-3.5" />
                End Presenting
              </button>
            </div>

            {presenterNavOpen && (
              <div className="absolute left-0 right-0 top-full z-10 max-h-[50vh] overflow-y-auto border-b border-white/10 bg-[#111]/95 p-3 backdrop-blur-md">
                {navGroups.map((group, gi) => {
                  return (
                    <div key={gi} className="mb-2 last:mb-0">
                      <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
                        {group.label}
                      </div>
                      {group.slides.map((s, si) => {
                        const isActive =
                          s.index === slide &&
                          (s.subStep === undefined || s.subStep === subStep);
                        return (
                          <button
                            key={si}
                            onClick={() => {
                              navigate(s.index, s.subStep);
                              setPresenterNavOpen(false);
                            }}
                            className={cn(
                              "w-full rounded px-3 py-1.5 text-left text-xs transition-colors",
                              isActive
                                ? "bg-white/10 font-medium text-white"
                                : "text-white/50 hover:bg-white/5 hover:text-white/70",
                            )}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="flex flex-1 flex-col p-4">
              <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#06283D]">
                <iframe
                  src={iframeSrcRef.current}
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
                  title="Slide Preview"
                  onLoad={() => {
                    channelRef.current?.postMessage({
                      type: "navigate",
                      slide,
                      subStep,
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex w-[360px] shrink-0 flex-col border-l border-white/10 bg-[#111]">
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                  Speaker Notes
                </h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <p
                        key={i}
                        className="text-[13px] leading-relaxed text-white/70"
                      >
                        {note}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] italic text-white/30">
                    No notes for this step.
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                {currentGroup && currentGroup.slides.length > 1 && (
                  <div className="mb-3 flex items-center justify-center gap-1.5">
                    {currentGroup.slides.map((s) => {
                      const isActive =
                        s.index === slide &&
                        (s.subStep === undefined || s.subStep === subStep);
                      return (
                        <button
                          key={`${s.index}-${s.subStep ?? ""}`}
                          onClick={() => navigate(s.index, s.subStep)}
                          className={cn(
                            "size-2 rounded-full transition-all",
                            isActive
                              ? "scale-125 bg-white"
                              : "bg-white/30 hover:bg-white/50",
                          )}
                        />
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(slide - 1)}
                    disabled={slide === 0 && subStep === 0}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                  <button
                    onClick={() => navigate(slide + 1)}
                    disabled={slide === total - 1}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Intro Slide ──────────────────────────────────────────────── */

function I2PLogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="0" y="0" width="15" height="15" rx="2" fill="#EF8B1D" />
      <rect x="19" y="0" width="15" height="15" rx="2" fill="#E56910" />
      <rect x="0" y="19" width="15" height="15" rx="2" fill="#00446A" />
      <rect x="19" y="19" width="15" height="15" rx="2" fill="#E56910" />
    </svg>
  );
}

function IntroBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 700"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="intro-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00446A" />
          <stop offset="100%" stopColor="#06283D" />
        </linearGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#intro-grad)" />

      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={100 * i}
          y1="0"
          x2={100 * i}
          y2="700"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={100 * i}
          x2="1200"
          y2={100 * i}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {[
        [180, 180, 3], [220, 260, 2], [310, 150, 2.5], [370, 310, 2],
        [440, 200, 3.5], [520, 280, 2], [560, 140, 2.5], [640, 240, 3],
        [710, 170, 2], [780, 300, 2.5], [830, 190, 2], [900, 260, 3],
        [960, 150, 2.5], [1020, 220, 2], [1060, 310, 2.5],
        [150, 450, 2], [250, 520, 2.5], [380, 480, 3], [490, 540, 2],
        [600, 460, 2.5], [720, 510, 2], [850, 470, 3], [950, 530, 2.5],
        [1050, 490, 2],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={i % 5 === 0 ? "#E56910" : i % 3 === 0 ? "#21A5D5" : "white"}
          opacity={i % 5 === 0 ? 0.3 : 0.14}
        />
      ))}

      <path
        d="M80 520 C200 510, 300 480, 450 420 S700 300, 900 250 S1050 210, 1140 190"
        fill="none"
        stroke="rgba(229,105,16,0.22)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M80 540 C200 530, 300 500, 450 450 S700 340, 900 290 S1050 250, 1140 230"
        fill="none"
        stroke="rgba(33,165,213,0.15)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MODEL_WORDS = ["Design", "Power", "Execute", "Refine", "Grow"];


function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MODEL_WORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-flex flex-col items-start overflow-hidden align-bottom" style={{ height: "1.15em" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={MODEL_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="inline-block whitespace-nowrap"
        >
          {MODEL_WORDS[index]}
        </motion.span>
      </AnimatePresence>
      <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-full bg-[#E56910]" />
    </span>
  );
}

function IntroSlide() {
  const { mode } = useMode();

  return (
    <div className="-mt-14 -mb-16 relative flex h-[var(--slide-h,100vh)] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <IntroBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <I2PLogoMark className="size-8" />
          <span className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase">
            Insight2Profit
          </span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="block">Inside Your</span>
          <span className="block">Dynamic Model</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/70">
          See how your pricing model turns data into decisions — and decisions into measurable profit.
        </p>

        {mode === "self" && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/40">
            <span>Tap Next or press → to walk through the story</span>
            <span className="inline-block animate-pulse">→</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── End Slide ────────────────────────────────────────────────── */

function EndSlide({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        End of Walkthrough
      </span>
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Thank You
      </h2>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Questions? Let&apos;s discuss how this model can work for your business.
      </p>
      <button
        onClick={onRestart}
        className="mt-10 rounded-lg bg-[#00446a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#00446a]/90"
      >
        ← Start Over
      </button>
    </div>
  );
}
