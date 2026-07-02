"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, LayoutGrid, ZoomIn, ZoomOut, Sun, Moon, Pause, Play, RotateCcw } from "lucide-react";
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
import { AnimationGlossary } from "@/components/animation-glossary";

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

type EngineFocus = "ml" | "strat" | "both" | null;

const ENGINE_FOCUS_MAP: Record<string, EngineFocus> = {
  // power
  [`${POWER_INDEX}-1`]: "ml",
  [`${POWER_INDEX}-2`]: "strat",
  [`${POWER_INDEX}-3`]: "both",
  // execute
  [`${EXECUTE_INDEX}-0`]: "both",
  [`${EXECUTE_INDEX}-1`]: "both",
  // refine
  [`${REFINE_INDEX}-1`]: "ml",
  [`${REFINE_INDEX}-2`]: "ml",
  [`${REFINE_INDEX}-3`]: "ml",
  [`${REFINE_INDEX}-4`]: "ml",
  [`${REFINE_INDEX}-5`]: "ml",
  [`${REFINE_INDEX}-6`]: "ml",
  [`${REFINE_INDEX}-7`]: "strat",
  // profit-growth
  [`${PROFIT_GROWTH_INDEX}-2`]: "both",
  [`${PROFIT_GROWTH_INDEX}-3`]: "ml",
  [`${PROFIT_GROWTH_INDEX}-4`]: "both",
};

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

const ENGINE_INDICATOR_SLIDES = new Set([POWER_INDEX, EXECUTE_INDEX, REFINE_INDEX, PROFIT_GROWTH_INDEX]);

type CategoryKey = "customer" | "product" | "market" | "order";

const FACTOR_CATEGORIES: { key: CategoryKey; label: string; color: string; tint: string }[] = [
  { key: "customer", label: "Customer", color: "#00446A", tint: "rgba(0,68,106,0.08)" },
  { key: "product", label: "Product", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
  { key: "market", label: "Market", color: "#2e7d32", tint: "rgba(46,125,50,0.08)" },
  { key: "order", label: "Order", color: "#7B5EA7", tint: "rgba(123,94,167,0.08)" },
];

const ACTIVE_CATEGORIES_MAP: Record<string, CategoryKey[]> = {
  [`${POWER_INDEX}-2`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-3`]: ["customer", "product", "market", "order"],
  [`${EXECUTE_INDEX}-0`]: ["customer", "order"],
  [`${EXECUTE_INDEX}-1`]: ["customer"],
  [`${REFINE_INDEX}-1`]: ["customer", "market"],
  [`${REFINE_INDEX}-2`]: ["customer"],
  [`${REFINE_INDEX}-3`]: ["customer"],
  [`${REFINE_INDEX}-4`]: ["customer"],
  [`${REFINE_INDEX}-5`]: ["customer"],
  [`${REFINE_INDEX}-6`]: ["customer", "market"],
  [`${REFINE_INDEX}-7`]: ["market"],
  [`${PROFIT_GROWTH_INDEX}-2`]: ["customer", "product", "market", "order"],
  [`${PROFIT_GROWTH_INDEX}-3`]: ["customer", "product", "market", "order"],
  [`${PROFIT_GROWTH_INDEX}-4`]: ["customer", "product", "market", "order"],
};

function EngineIndicator({ focus, visible }: { focus: EngineFocus; visible: boolean }) {
  const mlActive = focus === "ml" || focus === "both";
  const stratActive = focus === "strat" || focus === "both";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-[80px] left-4 z-50 flex items-center gap-2.5 rounded-lg bg-white/95 px-3 py-2 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
            <motion.path
              d="M 14 2 A 12 12 0 0 1 14 26 Z"
              animate={{ fill: mlActive ? ML_GREEN : "#D1D5DB" }}
              transition={{ duration: 0.35 }}
            />
            <motion.path
              d="M 14 26 A 12 12 0 0 1 14 2 Z"
              animate={{ fill: stratActive ? STRAT_BLUE : "#D1D5DB" }}
              transition={{ duration: 0.35 }}
            />
          </svg>
          <div className="flex flex-col gap-0.5">
            <motion.span
              className="text-[11px] font-semibold leading-tight"
              animate={{ color: mlActive ? ML_GREEN : "#9CA3AF", opacity: mlActive ? 1 : 0.6 }}
              transition={{ duration: 0.35 }}
            >
              ML Prediction
            </motion.span>
            <motion.span
              className="text-[11px] font-semibold leading-tight"
              animate={{ color: stratActive ? STRAT_BLUE : "#9CA3AF", opacity: stratActive ? 1 : 0.6 }}
              transition={{ duration: 0.35 }}
            >
              Strategic Guidance
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FactorCategoryRail({
  activeCategories,
}: {
  activeCategories: CategoryKey[];
}) {
  const activeSet = useMemo(() => new Set(activeCategories), [activeCategories]);

  return (
    <motion.div
      className="fixed left-0 top-1/2 z-40 flex w-[120px] -translate-y-1/2 flex-col gap-1.5 rounded-r-xl bg-white/95 px-3 py-4 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
      initial={{ x: -130 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        Your Factors
      </motion.span>

      {FACTOR_CATEGORIES.map(({ key, label, color, tint }, i) => {
        const active = activeSet.has(key);
        return (
          <motion.div
            key={key}
            className="flex items-center gap-2 rounded-md border px-2 py-1.5"
            initial={{ x: 120, opacity: 0, scale: 1.15 }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
              backgroundColor: active ? tint : "#f3f4f6",
              borderColor: active ? color : "transparent",
            }}
            transition={{
              x: { duration: 0.45, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3, delay: 0.35 + i * 0.09 },
              scale: { duration: 0.4, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
              backgroundColor: { duration: 0.2 },
              borderColor: { duration: 0.2 },
            }}
          >
            <div
              className="size-2 shrink-0 rounded"
              style={{ backgroundColor: color }}
            />
            <motion.span
              className="text-[11px] leading-tight"
              animate={{
                color: active ? "#374151" : "#9CA3AF",
                fontWeight: active ? 700 : 500,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          </motion.div>
        );
      })}

      <motion.span
        className="mt-1 text-[8px] leading-tight text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.72 }}
      >
        31 factors tuned to your business
      </motion.span>
    </motion.div>
  );
}

const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    label: "Introduction",
    slides: [
      { index: 0, label: "Welcome" },
      { index: OVERVIEW_INDEX, label: "Five core pillars", subStep: 0 },
    ],
  },
  {
    label: "1 | Design",
    slides: [
      { index: ONE_MODEL_INDEX, label: "Intro to pricing model", subStep: 0 },
      { index: ONE_MODEL_INDEX, label: "Pricing model with ML and strat. guidance", subStep: 1 },
    ],
  },
  {
    label: "2 | Power",
    slides: [
      { index: POWER_INDEX, label: "Too many prices to manually set", subStep: 0 },
      { index: POWER_INDEX, label: "The model scans for patterns", subStep: 1 },
      { index: POWER_INDEX, label: "Customize factors for the model", subStep: 2 },
      { index: POWER_INDEX, label: "A single SKU-level price", subStep: 3 },
    ],
  },
  {
    label: "3 | Execute",
    slides: [
      { index: EXECUTE_INDEX, label: "Acme walkthrough", subStep: 0 },
      { index: EXECUTE_INDEX, label: "Price adjusted for each customer", subStep: 1 },
    ],
  },
  {
    label: "4 | Refine",
    slides: [
      { index: REFINE_INDEX, label: "Refine section intro", subStep: 0 },
      { index: REFINE_INDEX, label: "Your optimal demand curve", subStep: 1 },
      { index: REFINE_INDEX, label: "Each customer gets their own curve", subStep: 2 },
      { index: REFINE_INDEX, label: "Quickparts curve adjustment", subStep: 3 },
      { index: REFINE_INDEX, label: "Acme curve adjustment", subStep: 4 },
      { index: REFINE_INDEX, label: "Medsupply curve adjustment", subStep: 5 },
      { index: REFINE_INDEX, label: "Every price optimized to the curve", subStep: 6 },
      { index: REFINE_INDEX, label: "The market moves the curve", subStep: 7 },
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

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AUTO_ANIM_SLIDES = new Set<SlideKind>([]);

const DEFAULT_DONE_MS = 2000;

export function Home() {
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
  const [refineCurveMode, setRefineCurveMode] = useState<"one" | "three">("three");
  const [darkMode, setDarkMode] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [presenterNavOpen, setPresenterNavOpen] = useState(false);
  const { mode } = useMode();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audienceWindowRef = useRef<Window | null>(null);
  const iframeSrcRef = useRef("");
  const [presentElapsed, setPresentElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const timerStartRef = useRef(0);
  const total = SLIDES.length;

  const presenterSkipped = useMemo(
    () => (mode === "presenter" ? new Set([OVERVIEW_INDEX]) : new Set<number>()),
    [mode],
  );

  const subStepConfig = useMemo(() => {
    if (mode !== "presenter") return SUB_STEP_CONFIG;
    return { ...SUB_STEP_CONFIG, [EXECUTE_INDEX]: EXECUTE_PRESENTER_STEPS };
  }, [mode]);

  const maxSteps = subStepConfig[slide] ?? 0;
  const hasSubSteps = maxSteps > 0;
  const config = SLIDES[slide];
  const notes = getPresenterNotes(config?.kind ?? "", subStep);
  const engineFocus = ENGINE_FOCUS_MAP[`${slide}-${subStep}`] ?? null;
  const railVisible = ENGINE_INDICATOR_SLIDES.has(slide) && (slide !== POWER_INDEX || subStep >= 2);
  const activeCategories = ACTIVE_CATEGORIES_MAP[`${slide}-${subStep}`] ?? [];

  const displayNavGroups = useMemo(() => {
    if (presenterSkipped.size === 0) return navGroups;
    return navGroups
      .map((g) => ({
        ...g,
        slides: g.slides.filter((s) => !presenterSkipped.has(s.index)),
      }))
      .filter((g) => g.slides.length > 0);
  }, [navGroups, presenterSkipped]);

  const currentGroup =
    displayNavGroups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === slide &&
          (s.subStep === undefined || s.subStep === subStep),
      ),
    ) ?? displayNavGroups.find((g) => g.slides.some((s) => s.index === slide));

  const allClickSteps = useMemo(() => {
    const steps: { slideIndex: number; stepIndex: number; kind: SlideKind; label: string; groupLabel: string; groupIndex: number; slideInGroupIndex: number }[] = [];
    for (let i = 0; i < SLIDES.length; i++) {
      if (presenterSkipped.has(i)) continue;
      const kind = SLIDES[i].kind;
      const stepsCount = subStepConfig[i] ?? 0;
      const gi = displayNavGroups.findIndex((g) => g.slides.some((s) => s.index === i));
      const group = gi >= 0 ? displayNavGroups[gi] : undefined;
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
  }, [displayNavGroups, subStepConfig, presenterSkipped]);

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
    setNavGroups((prev) =>
      prev.map((g) => {
        if (g.label !== "4 | Refine") return g;
        const allSlides = DEFAULT_NAV_GROUPS.find((dg) => dg.label === "4 | Refine")!.slides;
        return {
          ...g,
          slides: refineCurveMode === "one"
            ? allSlides.filter((s) => s.subStep !== 2)
            : allSlides,
        };
      }),
    );
  }, [refineCurveMode]);

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
    timerStartRef.current = Date.now();
    setPresentElapsed(0);
    setTimerRunning(true);
  }, [slide, subStep]);

  const endPresenting = useCallback(() => {
    audienceWindowRef.current?.close();
    audienceWindowRef.current = null;
    setPresenting(false);
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setPresentElapsed(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (!presenting) return;
    const update = () =>
      setClockTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [presenting]);

  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      timerStartRef.current = Date.now() - presentElapsed * 1000;
      setTimerRunning(true);
    }
  }, [timerRunning, presentElapsed]);

  const resetTimer = useCallback(() => {
    timerStartRef.current = Date.now();
    setPresentElapsed(0);
  }, []);

  const nextPosition = useMemo(() => {
    const currentMax = subStepConfig[slide] ?? 0;
    if (currentMax > 0 && subStep < currentMax - 1) {
      return { slideIndex: slide, stepIndex: subStep + 1 };
    }
    let next = slide + 1;
    while (presenterSkipped.has(next) && next < total) next++;
    if (next >= total) return null;
    return { slideIndex: next, stepIndex: 0 };
  }, [slide, subStep, subStepConfig, presenterSkipped, total]);

  const currentClickIndex = useMemo(
    () => allClickSteps.findIndex((s) => s.slideIndex === slide && s.stepIndex === subStep),
    [allClickSteps, slide, subStep],
  );

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
      // Skip over presenter-hidden slides
      let target = index;
      if (targetSubStep === undefined && presenterSkipped.has(target)) {
        const forward = target > slide;
        while (presenterSkipped.has(target) && target >= 0 && target < total) {
          target += forward ? 1 : -1;
        }
        if (target < 0 || target >= total) return;
      }

      if (targetSubStep !== undefined) {
        const goingBack =
          target < slide || (target === slide && targetSubStep < subStep);
        if (target >= 0 && target < total) {
          setSkipAnimation(goingBack);
          setSlide(target);
          setSubStep(targetSubStep);
        }
        return;
      }

      const currentMax = subStepConfig[slide] ?? 0;

      // Forward within sub-steps
      if (target === slide + 1 && currentMax > 0 && subStep < currentMax - 1) {
        setSkipAnimation(false);
        setSubStep((s) => s + 1);
        return;
      }
      // Back within sub-steps
      if (target === slide - 1 && currentMax > 0 && subStep > 0) {
        setSkipAnimation(true);
        setSubStep((s) => s - 1);
        return;
      }

      if (target >= 0 && target < total) {
        const goingBack = target < slide;

        // Going back into a sub-step slide from the next slide → land on last step
        const targetMax = subStepConfig[target] ?? 0;
        if (goingBack && targetMax > 0 && slide === target + 1) {
          setSkipAnimation(true);
          setSlide(target);
          setSubStep(targetMax - 1);
          return;
        }

        setSkipAnimation(goingBack);
        setSlide(target);
        setSubStep(0);
      }
    },
    [total, slide, subStep, subStepConfig, presenterSkipped],
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
      } else if (e.key === "Escape" && glossaryOpen) {
        setGlossaryOpen(false);
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
  }, [slide, navigate, isAudience, presenting, endPresenting, slideSorterOpen, presenterNavOpen, glossaryOpen]);

  return (
    <>
      <main
        className={cn(
          "flex min-h-[var(--slide-h,100vh)] flex-col items-center justify-start overflow-x-hidden pt-14 transition-[padding-left] duration-300",
          railVisible ? "pl-[140px]" : "",
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
              onCurveModeChange={setRefineCurveMode}
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

      <EngineIndicator focus={engineFocus} visible={ENGINE_INDICATOR_SLIDES.has(slide)} />

      {railVisible && (
        <FactorCategoryRail activeCategories={activeCategories} />
      )}

      {isAudience ? (
        <AudienceTopBar
          groups={displayNavGroups}
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
        />
      ) : (
        <SlideNav
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
          total={total}
          groups={displayNavGroups}
          onNavigate={navigate}
          animationDone={animationDone}
          onStartPresenting={mode === "presenter" ? startPresenting : undefined}
          onAnimationGlossary={() => setGlossaryOpen(true)}
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

      {glossaryOpen && <AnimationGlossary onClose={() => setGlossaryOpen(false)} />}

      {/* Presenter console overlay */}
      {presenting && !isAudience && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col transition-colors", darkMode ? "bg-[#0a0a0a]" : "bg-gray-100")}>
          {/* Top bar */}
          <div className={cn("relative flex shrink-0 items-center border-b px-4 py-2 transition-colors", darkMode ? "border-white/10 bg-[#111]/90" : "border-black/10 bg-white")}>
            <div className="flex items-center gap-2">
              <button
                onClick={endPresenting}
                className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", darkMode ? "border-white/15 bg-white/5 text-white/70 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300" : "border-black/15 bg-black/5 text-gray-600 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600")}
              >
                <X className="size-3.5" />
                End Show
              </button>
              <span className={darkMode ? "text-white/15" : "text-black/15"}>|</span>
              <button
                onClick={() => setPresenterNavOpen((o) => !o)}
                className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors", darkMode ? "text-white/70 hover:bg-white/10" : "text-gray-600 hover:bg-black/5")}
              >
                {currentGroup?.label}
                <ChevronDown className={cn("size-3 transition-transform", darkMode ? "text-white/40" : "text-gray-400", presenterNavOpen && "rotate-180")} />
              </button>
            </div>

            {/* Center: Timer */}
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <span className={cn("font-mono text-xl font-semibold tabular-nums", darkMode ? "text-white" : "text-gray-900")}>
                {formatElapsed(presentElapsed)}
              </span>
              <button
                onClick={toggleTimer}
                className={cn("rounded-md p-1.5 transition-colors", darkMode ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-gray-700")}
                aria-label={timerRunning ? "Pause timer" : "Resume timer"}
              >
                {timerRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button
                onClick={resetTimer}
                className={cn("rounded-md p-1.5 transition-colors", darkMode ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-gray-700")}
                aria-label="Reset timer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>

            {/* Right: Clock + Dark mode */}
            <div className="ml-auto flex items-center gap-3">
              <span className={cn("text-lg font-medium", darkMode ? "text-white/60" : "text-gray-500")}>
                {clockTime}
              </span>
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors", darkMode ? "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white" : "border-black/15 bg-black/5 text-gray-600 hover:border-black/30 hover:bg-black/10 hover:text-gray-900")}
              >
                {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>

            {/* Nav dropdown */}
            {presenterNavOpen && (
              <div className={cn("absolute left-0 right-0 top-full z-10 max-h-[50vh] overflow-y-auto border-b p-3 backdrop-blur-md", darkMode ? "border-white/10 bg-[#111]/95" : "border-black/10 bg-white/95")}>
                {displayNavGroups.map((group, gi) => (
                  <div key={gi} className="mb-2 last:mb-0">
                    <div className={cn("mb-1 px-2 text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-white/30" : "text-gray-400")}>
                      {group.label}
                    </div>
                    {group.slides.map((s, si) => {
                      const isActive = s.index === slide && (s.subStep === undefined || s.subStep === subStep);
                      return (
                        <button
                          key={si}
                          onClick={() => { navigate(s.index, s.subStep); setPresenterNavOpen(false); }}
                          className={cn(
                            "w-full rounded px-3 py-1.5 text-left text-xs transition-colors",
                            darkMode
                              ? isActive ? "bg-white/10 font-medium text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
                              : isActive ? "bg-black/10 font-medium text-gray-900" : "text-gray-500 hover:bg-black/5 hover:text-gray-700",
                          )}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex min-h-0 flex-1">
            {/* Left: Current slide + progress */}
            <div className="flex flex-1 flex-col p-4">
              <div className={cn("relative flex-1 overflow-hidden rounded-xl border", darkMode ? "border-white/10 bg-[#06283D]" : "border-black/10 bg-[#06283D]")}>
                <iframe
                  src={iframeSrcRef.current}
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
                  title="Slide Preview"
                  onLoad={() => {
                    channelRef.current?.postMessage({ type: "navigate", slide, subStep });
                  }}
                />
              </div>
              {/* Slide counter + progress bar */}
              <div className="mt-3 flex items-center gap-4 px-1">
                <button
                  onClick={() => navigate(slide - 1)}
                  disabled={slide === 0 && subStep === 0}
                  className={cn("rounded-md p-1.5 transition-colors disabled:opacity-30", darkMode ? "text-white/50 hover:bg-white/10" : "text-gray-400 hover:bg-black/5")}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <span className={cn("text-sm font-medium", darkMode ? "text-white/70" : "text-gray-600")}>
                    Slide {currentClickIndex + 1} of {allClickSteps.length}
                  </span>
                  <div className={cn("h-1 w-full max-w-xs rounded-full", darkMode ? "bg-white/10" : "bg-black/10")}>
                    <div
                      className="h-full rounded-full bg-[#E56910] transition-all duration-300"
                      style={{ width: `${((currentClickIndex + 1) / allClickSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate(slide + 1)}
                  disabled={slide === total - 1}
                  className={cn("rounded-md p-1.5 transition-colors disabled:opacity-30", darkMode ? "text-white/50 hover:bg-white/10" : "text-gray-400 hover:bg-black/5")}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className={cn("flex w-[380px] shrink-0 flex-col border-l transition-colors", darkMode ? "border-white/10 bg-[#111]" : "border-black/10 bg-white")}>
              {/* Next slide preview */}
              <div className={cn("shrink-0 border-b p-4", darkMode ? "border-white/10" : "border-black/10")}>
                <h3 className={cn("mb-2 text-[10px] font-bold uppercase tracking-[0.15em]", darkMode ? "text-white/40" : "text-gray-400")}>
                  Next slide
                </h3>
                <div className={cn("relative aspect-[16/10] overflow-hidden rounded-lg border", darkMode ? "border-white/10 bg-[#06283D]" : "border-black/10 bg-gray-900")}>
                  <div className={cn("absolute inset-0 flex items-center justify-center text-sm", darkMode ? "text-white/30" : "text-white/40")}>
                    {nextPosition ? "Preview unavailable" : "End of presentation"}
                  </div>
                  {nextPosition && (
                    <img
                      src={`/slide-thumbnails/slide-${nextPosition.slideIndex}-${nextPosition.stepIndex}.jpg`}
                      alt="Next slide"
                      className="relative h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
              </div>

              {/* Speaker notes */}
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className={cn("mb-4 text-[10px] font-bold uppercase tracking-[0.15em]", darkMode ? "text-white/40" : "text-gray-400")}>
                  Speaker Notes
                </h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <p key={i} className={cn("text-[13px] leading-relaxed", darkMode ? "text-white/70" : "text-gray-600")}>
                        {note}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-[13px] italic", darkMode ? "text-white/30" : "text-gray-400")}>
                    No notes for this step.
                  </p>
                )}
              </div>

              {/* Bottom navigation */}
              <div className={cn("border-t px-4 py-3", darkMode ? "border-white/10" : "border-black/10")}>
                {currentGroup && currentGroup.slides.length > 1 && (
                  <div className="mb-3 flex items-center justify-center gap-1.5">
                    {currentGroup.slides.map((s) => {
                      const isActive = s.index === slide && (s.subStep === undefined || s.subStep === subStep);
                      return (
                        <button
                          key={`${s.index}-${s.subStep ?? ""}`}
                          onClick={() => navigate(s.index, s.subStep)}
                          className={cn(
                            "size-2 rounded-full transition-all",
                            darkMode
                              ? isActive ? "scale-125 bg-white" : "bg-white/30 hover:bg-white/50"
                              : isActive ? "scale-125 bg-gray-800" : "bg-gray-300 hover:bg-gray-400",
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
                    className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30", darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-black/5 hover:text-gray-800")}
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                  <button
                    onClick={() => navigate(slide + 1)}
                    disabled={slide === total - 1}
                    className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30", darkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/10 text-gray-800 hover:bg-black/15")}
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

export default Home;
