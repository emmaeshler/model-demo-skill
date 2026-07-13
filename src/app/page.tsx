"use client";

import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, LayoutGrid, ZoomIn, ZoomOut, Sun, Moon, Pause, Play, RotateCcw, FileDown } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { type NavGroup, SlideNav, AudienceTopBar } from "@/components/slide-nav";
import { useMode } from "@/lib/mode-context";
import { useShareMode } from "@/lib/share-context";
import { getPresenterNotes } from "@/lib/presenter-notes";
import { cn } from "@/lib/utils";
import { OneModelSlide, ONE_MODEL_TOTAL_STEPS } from "@/components/slides/one-model";
import { PowerSlide, POWER_TOTAL_STEPS } from "@/components/slides/power-slide";
import { ExecuteSlide, EXECUTE_TOTAL_STEPS } from "@/components/slides/execute-slide";
import { RefineSlideV2, REFINE_V2_TOTAL_STEPS } from "@/components/slides/refine-slide-v2";
import { DriverImportanceSlide, DRIVER_IMPORTANCE_TOTAL_STEPS } from "@/components/slides/driver-importance";
import { AnimationGlossary } from "@/components/animation-glossary";
import { WalkthroughOverlay } from "@/components/walkthrough-overlay";

const MemoOneModel = memo(OneModelSlide);
const MemoPower = memo(PowerSlide);
const MemoDriverImportance = memo(DriverImportanceSlide);
const MemoExecute = memo(ExecuteSlide);
const MemoRefine = memo(RefineSlideV2);

type SlideKind =
  | "intro"
  | "one-model"
  | "power"
  | "driver-importance"
  | "execute"
  | "refine"
  | "end";

interface SlideConfig {
  kind: SlideKind;
}

const SLIDES: SlideConfig[] = [
  { kind: "intro" },
  // Section 1: Design
  { kind: "one-model" },
  // Section 2: Power
  { kind: "power" },
  // Section 2b: Driver Importance
  { kind: "driver-importance" },
  // Section 3: Execute
  { kind: "execute" },
  // Section 4: Refine
  { kind: "refine" },
  { kind: "end" },
];

const ONE_MODEL_INDEX = 1;
const POWER_INDEX = 2;
const DRIVER_IMP_INDEX = 3;
const EXECUTE_INDEX = 4;
const REFINE_INDEX = 5;

const SUB_STEP_CONFIG: Record<number, number> = {
  [ONE_MODEL_INDEX]: ONE_MODEL_TOTAL_STEPS,
  [POWER_INDEX]: POWER_TOTAL_STEPS,
  [DRIVER_IMP_INDEX]: DRIVER_IMPORTANCE_TOTAL_STEPS,
  [EXECUTE_INDEX]: EXECUTE_TOTAL_STEPS,
  [REFINE_INDEX]: REFINE_V2_TOTAL_STEPS,
};

const EXECUTE_PRESENTER_STEPS = 4;

type EngineFocus = "ml" | "strat" | "both" | null;

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

type CategoryKey = "customer" | "product" | "market" | "order";

const FACTOR_CATEGORIES: { key: CategoryKey; label: string; color: string; tint: string }[] = [
  { key: "customer", label: "Customer", color: "#00446A", tint: "rgba(0,68,106,0.08)" },
  { key: "product", label: "Product", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
  { key: "order", label: "Order", color: "#7B5EA7", tint: "rgba(123,94,167,0.08)" },
  { key: "market", label: "Market", color: "#2e7d32", tint: "rgba(46,125,50,0.08)" },
];

const DRIVER_RAIL_ITEMS: { label: string; color: string; tint: string }[] = [
  { label: "End market", color: "#00446A", tint: "rgba(0,68,106,0.08)" },
  { label: "Product specialization", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
  { label: "Competitive price point", color: "#2e7d32", tint: "rgba(46,125,50,0.08)" },
  { label: "Order frequency", color: "#7B5EA7", tint: "rgba(123,94,167,0.08)" },
  { label: "Product mix", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
];

const ENGINE_ITEMS: { key: "ml" | "strat"; label: string; color: string; tint: string }[] = [
  { key: "ml", label: "ML Prediction", color: ML_GREEN, tint: "rgba(58,125,68,0.08)" },
  { key: "strat", label: "Strategic Guidance", color: STRAT_BLUE, tint: "rgba(42,123,165,0.08)" },
];

type RailType = "model" | "mini-exec" | null;

/* ── Rail config (compiled from timeline) ──────────────────── */
interface RailStepConfig {
  rail: "model" | "mini-exec";
  engine: EngineFocus;
  categories: CategoryKey[];
  drivers: boolean;
  showEngine: boolean;
  showFactors: boolean;
  driversFlyIn: boolean;
  factorsFlyIn: boolean;
  activeCustomer?: number;
  refineStepForCustomer?: number;
}

const ALL_CATS: CategoryKey[] = ["customer", "product", "order", "market"];

/* ── Rail timeline ──────────────────────────────────────────
   Each slide maps to an ordered array of rail states (index = subStep).
   The discriminated `show` field determines which rail renders and
   which fields are relevant — impossible to set dead/contradictory fields.
   ──────────────────────────────────────────────────────────── */
type RailContent =
  | { show: "engine-only"; engine: EngineFocus }
  | { show: "factors"; engine: EngineFocus; active: CategoryKey[]; flyIn?: boolean }
  | { show: "drivers"; flyIn: boolean }
  | { show: "mini-exec"; activeCustomer?: number; refineStepForCustomer?: number }

const RAIL_TIMELINE: Partial<Record<number, (RailContent | null)[]>> = {
  [POWER_INDEX]: [
    /* 0  */ { show: "engine-only", engine: null },
    /* 1  */ { show: "engine-only", engine: "ml" },
    /* 2  transition */ { show: "factors", engine: "both", active: [], flyIn: true },
  ],
  [DRIVER_IMP_INDEX]: [
    /* 0  intro  */ { show: "factors", engine: "strat", active: [] },
    /* 1  cust   */ { show: "factors", engine: "strat", active: ["customer"] },
    /* 2  prod   */ { show: "factors", engine: "strat", active: ["product"] },
    /* 3  order  */ { show: "factors", engine: "strat", active: ["order"] },
    /* 4  mkt    */ { show: "factors", engine: "strat", active: ["market"] },
    /* 5  consolidated */ { show: "factors", engine: "strat", active: ["customer", "product", "order", "market"] },
    /* 6  driver cards */ { show: "factors", engine: "strat", active: ["customer", "product", "order", "market"] },
    /* 7  collapse → SKU */ { show: "drivers", flyIn: false },
  ],
  [EXECUTE_INDEX]: [
    /* 0  */ { show: "drivers", flyIn: false },
    /* 1  */ { show: "drivers", flyIn: false },
    /* 2  */ { show: "drivers", flyIn: false },
    /* 3  */ { show: "drivers", flyIn: false },
  ],
  [REFINE_INDEX]: [
    /* 0  */ { show: "mini-exec" },
    /* 1  */ { show: "mini-exec" },
    /* 2  */ { show: "mini-exec", activeCustomer: 0, refineStepForCustomer: 2 },
    /* 3  */ { show: "mini-exec", activeCustomer: 1, refineStepForCustomer: 3 },
    /* 4  */ { show: "mini-exec", activeCustomer: 2, refineStepForCustomer: 4 },
    /* 5  */ { show: "mini-exec" },
    /* 6  */ { show: "mini-exec" },
    null,
    null,
  ],
};

function compileRailTimeline(timeline: Partial<Record<number, (RailContent | null)[]>>): Record<string, RailStepConfig> {
  const out: Record<string, RailStepConfig> = {};
  for (const [slideStr, steps] of Object.entries(timeline)) {
    if (!steps) continue;
    const si = Number(slideStr);
    for (let sub = 0; sub < steps.length; sub++) {
      const c = steps[sub];
      if (!c) continue;
      const key = `${si}-${sub}`;
      switch (c.show) {
        case "engine-only":
          out[key] = { rail: "model", engine: c.engine, categories: [], drivers: false, showEngine: true, showFactors: false, driversFlyIn: false, factorsFlyIn: false };
          break;
        case "factors":
          out[key] = { rail: "model", engine: c.engine, categories: c.active, drivers: false, showEngine: true, showFactors: true, driversFlyIn: false, factorsFlyIn: c.flyIn ?? false };
          break;
        case "drivers":
          out[key] = { rail: "model", engine: null, categories: [], drivers: true, showEngine: false, showFactors: true, driversFlyIn: c.flyIn, factorsFlyIn: false };
          break;
        case "mini-exec":
          out[key] = { rail: "mini-exec", engine: null, categories: [], drivers: false, showEngine: false, showFactors: false, driversFlyIn: false, factorsFlyIn: false, activeCustomer: c.activeCustomer, refineStepForCustomer: c.refineStepForCustomer };
          break;
      }
    }
  }
  return out;
}

const RAIL_CONFIG = compileRailTimeline(RAIL_TIMELINE);

function ModelStatusRail({
  activeCategories,
  drivers,
  engineFocus,
  showEngine = true,
  customerDotColor,
  driversFlyIn = false,
  showFactors = false,
  factorsFlyIn = false,
}: {
  activeCategories: CategoryKey[];
  drivers?: { label: string; color: string; tint: string }[];
  engineFocus: EngineFocus;
  showEngine?: boolean;
  customerDotColor?: string;
  driversFlyIn?: boolean;
  showFactors?: boolean;
  factorsFlyIn?: boolean;
}) {
  const activeSet = useMemo(() => new Set(activeCategories), [activeCategories]);
  const [flyX] = useState(() => typeof window !== "undefined" ? window.innerWidth * 0.52 : 700);
  const [flyH] = useState(() => typeof window !== "undefined" ? window.innerHeight : 800);
  const driverFlyOffsets: { x: number; y: number }[] = useMemo(() => [
    { x: flyX * 1.55, y: -flyH * 0.20 },  // End market — top card
    { x: flyX * 1.55, y: -flyH * 0.10 },  // Product specialization
    { x: flyX * 1.55, y:  0 },             // Competitive price point — center card
    { x: flyX * 1.55, y:  flyH * 0.10 },  // Order frequency
    { x: flyX * 1.55, y:  flyH * 0.20 },  // Product mix — bottom card
  ], [flyX, flyH]);

  const mlActive = engineFocus === "both" || engineFocus === "ml";
  const stratActive = engineFocus === "both" || engineFocus === "strat";
  const R = 18;
  const CX = R + 2;
  const CY = R + 2;
  const svgSize = (R + 2) * 2;

  return (
    <motion.div
      className="fixed left-0 top-1/2 z-40 flex w-[130px] -translate-y-1/2 flex-col gap-3 rounded-r-xl bg-white/95 px-3 py-4 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
      initial={{ x: -140 }}
      animate={{ x: 0 }}
      exit={{ x: -140, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Engine section */}
      {showEngine && (<>
      <div className="flex flex-col items-center gap-1">
        <motion.span
          className="text-[8px] font-semibold uppercase tracking-[0.12em] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Model Engine
        </motion.span>

        <div className="flex flex-col items-center gap-0.5">
          <motion.span
            className="text-[8px] font-semibold leading-tight"
            animate={{ color: mlActive ? ML_GREEN : "#D1D5DB" }}
            transition={{ duration: 0.3 }}
          >
            ML Prediction
          </motion.span>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            <motion.path
              d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} L ${CX} ${CY} Z`}
              fill={ML_GREEN}
              animate={{ opacity: mlActive ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY} L ${CX} ${CY} Z`}
              fill={STRAT_BLUE}
              animate={{ opacity: stratActive ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            />
            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="white" strokeWidth={1.5} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="white" strokeWidth={1.5} opacity={0.4} />
          </svg>
          <motion.span
            className="text-[8px] font-semibold leading-tight"
            animate={{ color: stratActive ? STRAT_BLUE : "#D1D5DB" }}
            transition={{ duration: 0.3 }}
          >
            Strategic Guidance
          </motion.span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />
      </>)}

      {/* Factors section */}
      {(drivers || activeSet.size > 0 || showFactors) && <div className="flex flex-col gap-1.5">
        <motion.span
          className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {drivers ? (
            <span className="flex items-center gap-1.5">
              Model Drivers
              {customerDotColor && (
                <motion.span
                  className="size-[6px] shrink-0 rounded-full"
                  animate={{ backgroundColor: customerDotColor }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </span>
          ) : "Your Factors"}
        </motion.span>

        <AnimatePresence mode="wait">
          {drivers ? (
            <motion.div
              key="drivers"
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {drivers.map(({ label, color }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
                  initial={driversFlyIn
                    ? { opacity: 0, x: driverFlyOffsets[i]?.x ?? flyX, y: driverFlyOffsets[i]?.y ?? 0, scale: 0.3 }
                    : { x: 60, opacity: 0, scale: 0.4, rotate: -20 }
                  }
                  animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  transition={driversFlyIn
                    ? {
                        delay: 0.15 + i * 0.14,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                        scale: { duration: 0.6, delay: 0.15 + i * 0.14 },
                      }
                    : {
                        x: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.3, delay: 0.1 + i * 0.1 },
                        scale: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                        rotate: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                      }
                  }
                >
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="flex-1 text-[11px] font-bold leading-tight"
                    style={{ color: "#374151" }}
                  >
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 40, rotate: 12, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {FACTOR_CATEGORIES.map(({ key, label, color, tint }, i) => {
                const active = activeSet.has(key);
                const flyDelay = 0.15 + i * 0.12;
                return (
                  <motion.div
                    key={key}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                    initial={factorsFlyIn
                      ? { x: flyX * 0.8, y: flyH * 0.2, opacity: 0, scale: 0.4 }
                      : { x: 120, opacity: 0, scale: 1.15 }
                    }
                    animate={{
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      backgroundColor: active ? tint : "#f3f4f6",
                      borderColor: active ? color : "transparent",
                    }}
                    transition={factorsFlyIn
                      ? {
                          x: { duration: 0.7, delay: flyDelay, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: 0.7, delay: flyDelay, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.35, delay: flyDelay },
                          scale: { duration: 0.6, delay: flyDelay, ease: [0.22, 1, 0.36, 1] },
                          backgroundColor: { duration: 0.2 },
                          borderColor: { duration: 0.2 },
                        }
                      : {
                          x: { duration: 0.45, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3, delay: 0.35 + i * 0.09 },
                          scale: { duration: 0.4, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
                          backgroundColor: { duration: 0.2 },
                          borderColor: { duration: 0.2 },
                        }
                    }
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
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          className="mt-0.5 text-[8px] leading-tight text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.72 }}
        >
          {drivers ? "Tailored to your business" : "Tailored to your business"}
        </motion.span>
      </div>}
    </motion.div>
  );
}

const CUSTOMER_DOT_COLORS: Record<string, string> = {
  Acme: "#00446A",
  MedSupply: "#4A8FA8",
  QuickParts: "#C27A3A",
};

const RAIL_CUSTOMERS = [
  { label: "QuickParts LLC", price: "$22.10", newPrice: "$24.20", change: "+$2.10", dot: CUSTOMER_DOT_COLORS.QuickParts, reason: "No competition — cost pass-through",
    timelinePrices: ["$24.20", "$25.90", "$25.10", "$28.10"] },
  { label: "Acme Industrial", price: "$19.24", newPrice: "$19.80", change: "+$0.56", dot: CUSTOMER_DOT_COLORS.Acme, reason: "Win rate climbing — margin available",
    timelinePrices: ["$19.80", "$21.10", "$20.40", "$22.80"] },
  { label: "MedSupply Co", price: "$14.89", newPrice: "$14.50", change: "−$0.39", dot: CUSTOMER_DOT_COLORS.MedSupply, reason: "New entrant undercutting — defend deal",
    timelinePrices: ["$14.50", "$15.60", "$15.10", "$16.80"] },
];

const RAIL_CUSTOMER_TO_REFINE_STEP: Record<number, number> = Object.fromEntries(
  Object.entries(RAIL_CONFIG)
    .filter(([, v]) => v.activeCustomer !== undefined && v.refineStepForCustomer !== undefined)
    .map(([, v]) => [v.activeCustomer!, v.refineStepForCustomer!])
);

function MiniExecuteConnector({ refineStep, flyIn = false, onSelectCustomer, timelinePhase = 0 }: { refineStep?: number; flyIn?: boolean; onSelectCustomer?: (step: number) => void; timelinePhase?: number }) {
  const NAVY = "#00446A";
  const [flyX] = useState(() => typeof window !== "undefined" ? window.innerWidth * 0.72 : 1000);
  const [flyY] = useState(() => typeof window !== "undefined" ? -window.innerHeight * 0.04 : -30);

  const railCfg = refineStep !== undefined ? RAIL_CONFIG[`${REFINE_INDEX}-${refineStep}`] : undefined;
  const activeIdx = railCfg?.activeCustomer ?? -1;
  const adjustedSet = useMemo(() => {
    const s = new Set<number>();
    if (refineStep === undefined) return s;
    if (refineStep >= 2) s.add(0);
    if (refineStep >= 3) s.add(1);
    if (refineStep >= 4) s.add(2);
    return s;
  }, [refineStep]);

  const [showChange, setShowChange] = useState(false);
  useEffect(() => {
    if (activeIdx < 0) { setShowChange(false); return; }
    setShowChange(false);
    const t = setTimeout(() => setShowChange(true), 3200);
    return () => clearTimeout(t);
  }, [activeIdx]);

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-1/2 z-40 flex w-[130px] -translate-y-1/2 flex-col rounded-r-xl px-3 py-4",
        !flyIn && "bg-white/95 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm",
      )}
      initial={{ x: flyIn ? 0 : -140 }}
      animate={{ x: 0 }}
      exit={{ x: -140, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {flyIn && (
        <motion.div
          className="absolute inset-0 rounded-r-xl bg-white/95 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.5 }}
        />
      )}
      <motion.span
        className="relative z-10 mb-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: flyIn ? 0.7 : 0.2 }}
      >
        {refineStep !== undefined && refineStep >= 2 ? "Customer Order Price, Refined" : "Customer Order Prices"}
      </motion.span>

      <div className="relative z-10 flex flex-col gap-1.5">
        {RAIL_CUSTOMERS.map((c, i) => {
          const isActive = i === activeIdx;
          const isAdjusted = adjustedSet.has(i);
          const displayPrice = timelinePhase > 0
            ? c.timelinePrices[timelinePhase]
            : (isAdjusted && (showChange || !isActive)) ? c.newPrice : c.price;

          return (
            <motion.div
              key={c.label}
              className="rounded-md px-2 py-1.5"
              initial={flyIn
                ? { opacity: 0, x: flyX, y: flyY, scale: 1.15 }
                : { opacity: 0, x: -8 }
              }
              animate={{
                opacity: activeIdx >= 0 && !isActive ? 0.45 : 1,
                x: 0,
                y: 0,
                backgroundColor: isActive ? `${c.dot}14` : `${NAVY}05`,
              }}
              transition={flyIn
                ? { delay: 0.15 + i * 0.22, duration: 0.85, ease: [0.22, 1, 0.36, 1], scale: { duration: 0.5, delay: 0.15 + i * 0.22 } }
                : { delay: 0.3 + i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              }
              style={{ ...(isActive ? { border: `1.5px solid ${c.dot}40` } : { border: "1.5px solid transparent" }), cursor: onSelectCustomer ? "pointer" : undefined }}
              onClick={() => { if (onSelectCustomer && RAIL_CUSTOMER_TO_REFINE_STEP[i] !== undefined) onSelectCustomer(RAIL_CUSTOMER_TO_REFINE_STEP[i]); }}
            >
              <div className="flex items-center gap-2">
                <div className="size-[5px] shrink-0 rounded-full" style={{ backgroundColor: c.dot }} />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold leading-none block" style={{ color: NAVY }}>
                    {c.label}
                  </span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={displayPrice}
                      className="text-[13px] font-bold tabular-nums leading-tight block mt-0.5"
                      style={{ color: NAVY }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      {displayPrice}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence>
                {isActive && showChange && (
                  <motion.div
                    className="mt-1 flex flex-col gap-0.5 pl-[13px]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="text-[9px] font-bold tabular-nums" style={{ color: "#2e7d32" }}>
                      {c.price} → {c.newPrice}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}



const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    label: "Introduction",
    subtitle: "Welcome",
    slides: [
      { index: 0, label: "Welcome" },
    ],
  },
  {
    label: "1 | Design",
    subtitle: "One model built around your business",
    slides: [
      { index: ONE_MODEL_INDEX, label: "Four key inputs", subStep: 0 },
      { index: ONE_MODEL_INDEX, label: "One unified model", subStep: 1 },
      { index: ONE_MODEL_INDEX, label: "ML meets expertise", subStep: 2 },
    ],
  },
  {
    label: "2 | Power",
    subtitle: "How the ML model finds pricing patterns",
    slides: [
      { index: POWER_INDEX, label: "36M price points", subStep: 0 },
      { index: POWER_INDEX, label: "Finding patterns", subStep: 1 },
      { index: DRIVER_IMP_INDEX, label: "Pricing factors", subStep: 0 },
      { index: DRIVER_IMP_INDEX, label: "Customer", subStep: 1 },
      { index: DRIVER_IMP_INDEX, label: "Product", subStep: 2 },
      { index: DRIVER_IMP_INDEX, label: "Order", subStep: 3 },
      { index: DRIVER_IMP_INDEX, label: "Market", subStep: 4 },
      { index: DRIVER_IMP_INDEX, label: "5 model drivers", subStep: 6 },
      { index: DRIVER_IMP_INDEX, label: "One optimal price", subStep: 7 },
    ],
  },
  {
    label: "3 | Execute",
    subtitle: "SKU-level prices tailored to each customer",
    slides: [
      { index: EXECUTE_INDEX, label: "Optimized price per SKU", subStep: 0 },
      { index: EXECUTE_INDEX, label: "Acme walkthrough", subStep: 1 },
    ],
  },
  {
    label: "4 | Refine",
    subtitle: "Optimizing prices along the demand curve",
    slides: [
      { index: REFINE_INDEX, label: "Every product, priced right", subStep: 0 },
      { index: REFINE_INDEX, label: "Your demand curve", subStep: 1 },
      { index: REFINE_INDEX, label: "QuickParts: underpriced", subStep: 2 },
      { index: REFINE_INDEX, label: "Acme: rising win rate", subStep: 3 },
      { index: REFINE_INDEX, label: "MedSupply: at risk", subStep: 4 },
      { index: REFINE_INDEX, label: "Prices snap to the curve", subStep: 5 },
      { index: REFINE_INDEX, label: "The curve adapts", subStep: 6 },
      { index: REFINE_INDEX, label: "Segment models", subStep: 7 },
      { index: REFINE_INDEX, label: "Full portfolio", subStep: 8 },
    ],
  },
  {
    label: "Closing",
    subtitle: "Summary and next steps",
    slides: [
      { index: 6, label: "Thank you" },
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

const AUTO_ANIM_SLIDES = new Set<SlideKind>(["one-model"]);

const DEFAULT_DONE_MS = 2000;

export function Home() {
  const { shareMode, toggleShareMode } = useShareMode();
  const [slide, setSlide] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [isAudience, setIsAudience] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [slideReplayKeys, setSlideReplayKeys] = useState<number[]>(() => SLIDES.map(() => 0));
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [slideSorterOpen, setSlideSorterOpen] = useState(false);
  const [sorterCols, setSorterCols] = useState(4);
  const [navGroups, setNavGroups] = useState(DEFAULT_NAV_GROUPS);
  const [darkMode, setDarkMode] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [presenterNavOpen, setPresenterNavOpen] = useState(false);
  const { mode } = useMode();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audienceWindowRef = useRef<Window | null>(null);
  const iframeSrcRef = useRef("");
  const [railEntering, setRailEntering] = useState(false);
  const isReplayingRef = useRef(false);
  const collapseToExecuteRef = useRef(false);
  const spotlightRefinedRef = useRef(false);
  const [spotlightAdvanceReq, setSpotlightAdvanceReq] = useState(0);
  const handleSpotlightRefined = useCallback(() => { spotlightRefinedRef.current = true; }, []);
  const [dynamicActiveCategories, setDynamicActiveCategories] = useState<CategoryKey[] | null>(null);
  const handleActiveCategoryChange = useCallback((cats: string[]) => setDynamicActiveCategories(cats as CategoryKey[]), []);
  const [executeCustomer, setExecuteCustomer] = useState("Acme");
  const handleExecuteCustomerChange = useCallback((c: string) => setExecuteCustomer(c), []);
  const [refineTimelinePhase, setRefineTimelinePhase] = useState(0);
  const handleRefineTimelinePhase = useCallback((phase: number) => setRefineTimelinePhase(phase), []);
  const prevRailVisibleRef = useRef(false);
  const [presentElapsed, setPresentElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const timerStartRef = useRef(0);
  const total = SLIDES.length;

  const presenterSkipped = useMemo(
    () => new Set<number>(),
    [],
  );

  const subStepConfig = useMemo(() => {
    if (mode !== "presenter") return SUB_STEP_CONFIG;
    return { ...SUB_STEP_CONFIG, [EXECUTE_INDEX]: EXECUTE_PRESENTER_STEPS };
  }, [mode]);

  const maxSteps = subStepConfig[slide] ?? 0;
  const hasSubSteps = maxSteps > 0;
  const config = SLIDES[slide];
  const notes = getPresenterNotes(config?.kind ?? "", subStep);
  const railCfg = RAIL_CONFIG[`${slide}-${subStep}`] ?? null;
  const currentRailType: RailType = railCfg?.rail ?? null;
  const railVisible = currentRailType !== null;
  const engineFocus: EngineFocus = railCfg?.engine ?? null;
  const staticActiveCategories = railCfg?.categories ?? [];
  const activeCategories = (slide === POWER_INDEX && dynamicActiveCategories && dynamicActiveCategories.length > 0)
    ? dynamicActiveCategories
    : staticActiveCategories;

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
    const steps: { slideIndex: number; stepIndex: number; kind: SlideKind; label: string; groupLabel: string; groupSubtitle: string; groupIndex: number; slideInGroupIndex: number }[] = [];
    for (let i = 0; i < SLIDES.length; i++) {
      if (presenterSkipped.has(i)) continue;
      const kind = SLIDES[i].kind;
      const stepsCount = SUB_STEP_CONFIG[i] ?? 0;
      const gi = displayNavGroups.findIndex((g) => g.slides.some((s) => s.index === i));
      const group = gi >= 0 ? displayNavGroups[gi] : undefined;
      const groupLabel = group?.label ?? "";
      const groupSubtitle = group?.subtitle ?? "";
      if (stepsCount === 0) {
        const si = group?.slides.findIndex((s) => s.index === i) ?? -1;
        const navSlide = si >= 0 ? group!.slides[si] : undefined;
        steps.push({ slideIndex: i, stepIndex: 0, kind, label: navSlide?.label ?? kind, groupLabel, groupSubtitle, groupIndex: gi, slideInGroupIndex: si });
      } else {
        for (let s = 0; s < stepsCount; s++) {
          const si = group?.slides.findIndex((ns) => ns.index === i && ns.subStep === s) ?? -1;
          const navSlide = si >= 0 ? group!.slides[si] : undefined;
          const label = navSlide?.label ?? `Step ${s + 1}`;
          steps.push({ slideIndex: i, stepIndex: s, kind, label, groupLabel, groupSubtitle, groupIndex: gi, slideInGroupIndex: si });
        }
      }
    }
    return steps;
  }, [displayNavGroups, presenterSkipped]);

  const updateSlideLabel = useCallback((groupIndex: number, slideInGroupIndex: number, newLabel: string) => {
    setNavGroups((prev) => {
      const next = prev.map((g, gi) => {
        if (gi !== groupIndex) return g;
        return {
          ...g,
          slides: g.slides.map((s, si) => (si === slideInGroupIndex ? { ...s, label: newLabel } : s)),
        };
      });
      try {
        const labels: Record<string, string> = {};
        next.forEach((g, gi) => g.slides.forEach((s, si) => { labels[`${gi}-${si}`] = s.label; }));
        localStorage.setItem("ml-explainer-slide-labels", JSON.stringify(labels));
      } catch {}
      return next;
    });
  }, []);

  const exportSorterPdf = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const PAGE_W = 406.4;
    const PAGE_H = 304.8;
    const M = 16;
    const contentW = PAGE_W - M * 2;

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_H, PAGE_W] });

    const grouped: { label: string; subtitle: string; steps: typeof allClickSteps }[] = [];
    let curLabel = "";
    for (const cs of allClickSteps) {
      if (cs.groupLabel !== curLabel) {
        curLabel = cs.groupLabel;
        grouped.push({ label: cs.groupLabel, subtitle: cs.groupSubtitle, steps: [] });
      }
      grouped[grouped.length - 1].steps.push(cs);
    }

    const loadImage = (src: string): Promise<string> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.92));
        };
        img.onerror = () => resolve("");
        img.src = src;
      });

    const SECTION_COLORS: Record<string, [number, number, number]> = {
      "Introduction": [100, 116, 139],
      "1 | Design": [0, 68, 106],
      "2 | Power": [229, 105, 16],
      "3 | Execute": [46, 125, 50],
      "4 | Refine": [42, 123, 165],
      "Closing": [100, 116, 139],
    };

    // ── Page 1: Bird's eye flowchart (white background) ──
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(6, 40, 61);
    pdf.text("Inside Your Dynamic Model", PAGE_W / 2, 22, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(120, 130, 140);
    pdf.text("Presentation Flow", PAGE_W / 2, 30, { align: "center" });

    const BOX_GAP = 5;
    const BOX_H = 10;
    const SECTION_GAP = 10;
    let flowY = 40;

    for (let gi = 0; gi < grouped.length; gi++) {
      const group = grouped[gi];
      const rgb = SECTION_COLORS[group.label] ?? [100, 116, 139];

      // Section header bar
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      const headerW = pdf.getTextWidth(group.label.toUpperCase()) + 16;
      pdf.roundedRect(M, flowY, headerW, 9, 1.5, 1.5, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.text(group.label.toUpperCase(), M + 8, flowY + 6.2);

      if (group.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(140, 150, 160);
        pdf.text(group.subtitle, M + headerW + 5, flowY + 6.2);
      }
      flowY += 14;

      // Step boxes in wrapping rows
      const maxBoxW = 85;
      const boxesPerRow = Math.floor((contentW + BOX_GAP) / (maxBoxW + BOX_GAP));
      const boxW = (contentW - BOX_GAP * (boxesPerRow - 1)) / boxesPerRow;

      for (let i = 0; i < group.steps.length; i++) {
        const col = i % boxesPerRow;
        const bx = M + col * (boxW + BOX_GAP);

        if (col === 0 && i > 0) flowY += BOX_H + BOX_GAP;

        pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
        pdf.setLineWidth(0.4);
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.roundedRect(bx, flowY, boxW, BOX_H, 1.5, 1.5, "S");

        // Number badge
        pdf.roundedRect(bx + 1.5, flowY + 1.5, 5.5, BOX_H - 3, 1, 1, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        const numStr = String(i + 1);
        const numW = pdf.getTextWidth(numStr);
        pdf.text(numStr, bx + 1.5 + (5.5 - numW) / 2, flowY + BOX_H / 2 + 1.2);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(50, 50, 50);
        const truncated = pdf.splitTextToSize(group.steps[i].label, boxW - 14)[0];
        pdf.text(truncated, bx + 9, flowY + BOX_H / 2 + 1.2);

        // Arrow between boxes
        if (i < group.steps.length - 1 && col < boxesPerRow - 1) {
          const ax = bx + boxW;
          const ay = flowY + BOX_H / 2;
          pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
          pdf.setLineWidth(0.4);
          pdf.line(ax + 0.8, ay, ax + BOX_GAP - 0.8, ay);
          pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
          pdf.triangle(ax + BOX_GAP - 0.5, ay, ax + BOX_GAP - 2.5, ay - 1.2, ax + BOX_GAP - 2.5, ay + 1.2, "F");
        }
      }

      flowY += BOX_H + SECTION_GAP;

      // Arrow between sections
      if (gi < grouped.length - 1) {
        const ax = M + 10;
        pdf.setDrawColor(180, 190, 200);
        pdf.setLineWidth(0.4);
        pdf.line(ax, flowY - SECTION_GAP + 2, ax, flowY - 2);
        pdf.setFillColor(180, 190, 200);
        pdf.triangle(ax, flowY - 1, ax - 1.5, flowY - 4, ax + 1.5, flowY - 4, "F");
      }
    }

    // ── Slide detail pages ──
    let globalNum = 0;
    for (let gi = 0; gi < grouped.length; gi++) {
      const group = grouped[gi];
      const rgb = SECTION_COLORS[group.label] ?? [100, 116, 139];

      // Dark section divider page
      pdf.addPage();
      pdf.setFillColor(6, 40, 61);
      pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.text(group.label.toUpperCase(), PAGE_W / 2, PAGE_H / 2 - 8, { align: "center" });
      if (group.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(180, 200, 220);
        pdf.text(group.subtitle, PAGE_W / 2, PAGE_H / 2 + 6, { align: "center" });
      }
      pdf.setFontSize(11);
      pdf.setTextColor(130, 150, 170);
      pdf.text(`${group.steps.length} ${group.steps.length === 1 ? "step" : "steps"}`, PAGE_W / 2, PAGE_H / 2 + 18, { align: "center" });

      // One page per slide
      for (let si = 0; si < group.steps.length; si++) {
        const cs = group.steps[si];
        globalNum++;
        pdf.addPage();

        // Slim colored title line
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
        pdf.text(`${group.label}`, M, M + 5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(140, 140, 140);
        pdf.text(`  Slide ${si + 1} / ${group.steps.length}`, M + pdf.getTextWidth(`${group.label}`) + 2, M + 5);

        // Thin colored accent line
        pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
        pdf.setLineWidth(0.6);
        pdf.line(M, M + 9, M + contentW, M + 9);

        // Full-width slide image
        const imgTop = M + 14;
        const imgW = contentW;
        const imgH = imgW * (10 / 16);
        const thumbUrl = `/slide-thumbnails/slide-${cs.slideIndex}-${cs.stepIndex}.jpg`;
        const imgData = await loadImage(thumbUrl);

        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(M, imgTop, imgW, imgH, 1.5, 1.5, "S");
        if (imgData) {
          pdf.addImage(imgData, "JPEG", M + 0.3, imgTop + 0.3, imgW - 0.6, imgH - 0.6);
        }

        // Label below
        const labelY = imgTop + imgH + 7;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(30, 30, 30);
        const labelLines = pdf.splitTextToSize(cs.label, contentW);
        pdf.text(labelLines.slice(0, 2), M, labelY);
      }
    }

    pdf.save("Inside Your Dynamic Model — Slides.pdf");
  }, [allClickSteps]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setVisited(prev => {
      if (prev.has(slide)) return prev;
      const next = new Set(prev);
      next.add(slide);
      return next;
    });
    if (collapseToExecuteRef.current) {
      requestAnimationFrame(() => { collapseToExecuteRef.current = false; });
    }
  }, [slide]);

  useEffect(() => {
    if (mode === "presenter") {
      document.title = "Presenter Screen — Dynamic Model";
      const presenterIcon =
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">' +
        '<rect x="8" y="12" width="64" height="40" rx="4" fill="#003D5C"/>' +
        '<rect x="14" y="18" width="52" height="28" rx="2" fill="#FF6B00"/>' +
        '<polygon points="36,24 36,40 50,32" fill="white"/>' +
        '<rect x="38" y="52" width="4" height="10" fill="#003D5C"/>' +
        '<rect x="26" y="62" width="28" height="4" rx="2" fill="#003D5C"/>' +
        '</svg>';
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) {
        link.href = "data:image/svg+xml," + encodeURIComponent(presenterIcon);
      }
    } else {
      document.title = "Inside Your Dynamic Model | INSIGHT2PROFIT";
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) link.href = "/icon.svg";
    }
  }, [mode]);

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
    if (params.get("skipAnimation") === "true") {
      setSkipAnimation(true);
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
    if (mode === "presenter" || presenting) {
      const ch = new BroadcastChannel("ml-explainer-sync");
      channelRef.current = ch;
      return () => { ch.close(); channelRef.current = null; };
    }
  }, [isAudience, mode, presenting]);

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

  const currentClickIndex = useMemo(
    () => allClickSteps.findIndex((s) => s.slideIndex === slide && s.stepIndex === subStep),
    [allClickSteps, slide, subStep],
  );

  const nextPosition = useMemo(() => {
    if (currentClickIndex < 0 || currentClickIndex >= allClickSteps.length - 1) return null;
    const next = allClickSteps[currentClickIndex + 1];
    return { slideIndex: next.slideIndex, stepIndex: next.stepIndex };
  }, [allClickSteps, currentClickIndex]);

  useEffect(() => {
    spotlightRefinedRef.current = false;
    setSpotlightAdvanceReq(0);
  }, [subStep]);

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

  useEffect(() => {
    if (railVisible && !prevRailVisibleRef.current && !skipAnimation) {
      setRailEntering(true);
      const t = setTimeout(() => setRailEntering(false), 700);
      prevRailVisibleRef.current = true;
      return () => clearTimeout(t);
    }
    prevRailVisibleRef.current = railVisible;
  }, [railVisible, skipAnimation]);

  const markAnimationDone = useCallback(() => setAnimationDone(true), []);

  const handleReplay = useCallback(() => {
    isReplayingRef.current = true;
    startTransition(() => {
      setSkipAnimation(false);
      setSlideReplayKeys(prev => prev.map((k, i) => i === slide ? k + 1 : k));
    });
  }, [slide]);

  const navigate = useCallback(
    (index: number, targetSubStep?: number) => {
      isReplayingRef.current = false;
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
          startTransition(() => {
            setSkipAnimation(goingBack);
            setSlide(target);
            setSubStep(targetSubStep);
          });
        }
        return;
      }

      const currentMax = subStepConfig[slide] ?? 0;

      // Timeline phase navigation within the refine slide's timeline step
      if (slide === REFINE_INDEX && subStep === 6) {
        if (target === slide + 1 && refineTimelinePhase < 3) {
          setRefineTimelinePhase(prev => prev + 1);
          return;
        }
        if (target === slide - 1 && refineTimelinePhase > 0) {
          setRefineTimelinePhase(prev => prev - 1);
          return;
        }
      }

      // Forward within sub-steps
      if (target === slide + 1 && currentMax > 0 && subStep < currentMax - 1) {
        startTransition(() => {
          setSkipAnimation(false);
          setSubStep((s) => s + 1);
          if (slide === REFINE_INDEX && subStep === 5) setRefineTimelinePhase(0);
        });
        return;
      }
      // Back within sub-steps
      if (target === slide - 1 && currentMax > 0 && subStep > 0) {
        startTransition(() => {
          setSkipAnimation(true);
          setSubStep((s) => Math.max(0, s - 1));
          if (slide === REFINE_INDEX && subStep === 7) setRefineTimelinePhase(3);
        });
        return;
      }

      if (target >= 0 && target < total) {
        const goingBack = target < slide;

        // Going back into a sub-step slide from the next slide → land on last step
        // Skip the power slide's auto-advance transition step
        const targetMax = subStepConfig[target] ?? 0;
        if (goingBack && targetMax > 0 && slide === target + 1) {
          const landStep = target === POWER_INDEX ? targetMax - 2 : targetMax - 1;
          startTransition(() => {
            setSkipAnimation(true);
            setSlide(target);
            setSubStep(Math.max(0, landStep));
          });
          return;
        }

        const isCollapseToExecute = slide === DRIVER_IMP_INDEX && subStep >= 7 && target === EXECUTE_INDEX;
        collapseToExecuteRef.current = isCollapseToExecute;

        startTransition(() => {
          setSkipAnimation(goingBack);
          setSlide(target);
          setSubStep(0);
          setRefineTimelinePhase(0);
        });
      }
    },
    [total, slide, subStep, subStepConfig, presenterSkipped, refineTimelinePhase],
  );

  useEffect(() => {
    if (isAudience) return;
    function onKey(e: KeyboardEvent) {
      if (walkthroughOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const isRefineSpotlight = slide === REFINE_INDEX && subStep >= 2 && subStep <= 4;
        if (isRefineSpotlight && !spotlightRefinedRef.current) {
          setSpotlightAdvanceReq((r) => r + 1);
        } else {
          navigate(slide + 1);
        }
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
  }, [slide, navigate, isAudience, presenting, endPresenting, slideSorterOpen, presenterNavOpen, glossaryOpen, walkthroughOpen]);

  return (
    <>
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--i2p-navy)]"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-white/70"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium tracking-[0.15em] text-white/40 uppercase">
                Preparing presentation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "flex min-h-[var(--slide-h,100vh)] flex-col items-center justify-start overflow-x-hidden pt-14 transition-[padding-left] duration-300",
          railVisible ? "pl-[140px]" : "",
          isAudience ? "" : "pb-16",
        )}
        style={{ "--rail-inset": railVisible ? "140px" : "0px" } as React.CSSProperties}
      >
        <div className="relative w-full">
        {SLIDES.map((sc, i) => {
          const isActive = i === slide;
          if (!isActive && !visited.has(i)) return null;
          const effectiveSkip = !isActive || skipAnimation;
          return (
            <div
              key={i}
              className={cn("w-full", !isActive && "absolute inset-0 overflow-hidden")}
              style={{
                visibility: isActive ? "visible" : "hidden",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <MotionConfig reducedMotion={isActive ? (skipAnimation ? "always" : "never") : "always"}>
                <div key={slideReplayKeys[i]}>
                  <motion.div
                    initial={(collapseToExecuteRef.current && isActive) ? false : { opacity: 0, y: 10 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: (skipAnimation || collapseToExecuteRef.current) ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <motion.div
                      animate={{ opacity: railEntering ? 0 : 1 }}
                      transition={{ duration: railEntering ? 0.1 : 0.4 }}
                    >
                      {sc.kind === "intro" && <IntroSlide isActive={isActive} />}
                      {sc.kind === "one-model" && (
                        <MemoOneModel
                          step={isActive ? subStep : 0}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onAutoAdvance={isActive && !skipAnimation && !isReplayingRef.current ? () => navigate(slide + 1) : undefined}
                        />
                      )}
                      {sc.kind === "power" && (
                        <MemoPower
                          step={isActive ? subStep : 0}
                          onAutoAdvance={isActive && !skipAnimation && !isReplayingRef.current ? () => navigate(slide + 1) : undefined}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onActiveCategoryChange={isActive ? handleActiveCategoryChange : undefined}
                        />
                      )}
                      {sc.kind === "refine" && (
                        <MemoRefine
                          step={isActive ? subStep : 0}
                          onAutoAdvance={isActive && !skipAnimation && !isReplayingRef.current ? () => navigate(slide + 1) : undefined}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onTimelinePhase={isActive ? handleRefineTimelinePhase : undefined}
                          requestedPhase={isActive && subStep === 6 ? refineTimelinePhase : undefined}
                          advanceRequest={spotlightAdvanceReq}
                          onSpotlightRefined={handleSpotlightRefined}
                        />
                      )}
                      {sc.kind === "driver-importance" && (
                        <MemoDriverImportance
                          step={isActive ? subStep : 0}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onAutoAdvance={isActive && !skipAnimation && !isReplayingRef.current ? () => navigate(slide + 1) : undefined}
                        />
                      )}
                      {sc.kind === "execute" && <MemoExecute step={isActive ? subStep : 0} skipAnimation={effectiveSkip} isActive={isActive} onCustomerChange={isActive ? handleExecuteCustomerChange : undefined} fromCollapse={collapseToExecuteRef.current} />}
                      {sc.kind === "end" && <EndSlide onRestart={() => navigate(0)} />}
                    </motion.div>
                  </motion.div>
                </div>
              </MotionConfig>
            </div>
          );
        })}
        </div>


      </main>

      <AnimatePresence>
      {(() => {
        if (!railCfg) return null;
        if (railCfg.rail === "mini-exec") return (
          <MiniExecuteConnector
            key="mini-exec"
            refineStep={slide === REFINE_INDEX ? subStep : undefined}
            flyIn
            onSelectCustomer={slide === REFINE_INDEX ? (step: number) => setSubStep(step) : undefined}
            timelinePhase={slide === REFINE_INDEX ? refineTimelinePhase : 0}
          />
        );
        return (
          <ModelStatusRail
            key="model-rail"
            activeCategories={activeCategories}
            drivers={railCfg.drivers ? DRIVER_RAIL_ITEMS : undefined}
            engineFocus={engineFocus}
            showEngine={railCfg.showEngine}
            customerDotColor={slide === EXECUTE_INDEX ? CUSTOMER_DOT_COLORS[executeCustomer] : undefined}
            driversFlyIn={railCfg.driversFlyIn}
            showFactors={railCfg.showFactors}
            factorsFlyIn={railCfg.factorsFlyIn}
          />
        );
      })()}
      </AnimatePresence>


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
          onStartPresenting={startPresenting}
          onAnimationGlossary={() => setGlossaryOpen(true)}
          onSlideSorter={() => setSlideSorterOpen(true)}
          onHowItWorks={() => setWalkthroughOpen(true)}
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
              <span className="text-[10px] text-gray-300">
                · Click any label to edit · Exports with your edits
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
                onClick={exportSorterPdf}
                className="flex items-center gap-1.5 rounded-md border border-[#00446A]/20 bg-[#00446A]/5 px-3 py-1.5 text-xs font-medium text-[#00446A] transition-colors hover:bg-[#00446A]/10"
              >
                <FileDown className="size-3.5" />
                Export PDF
              </button>
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
                const grouped: { groupLabel: string; groupSubtitle: string; steps: (typeof allClickSteps[number] & { globalIndex: number })[] }[] = [];
                let currentGroupLabel = "";
                let globalIdx = 0;
                for (const cs of allClickSteps) {
                  if (cs.groupLabel !== currentGroupLabel) {
                    currentGroupLabel = cs.groupLabel;
                    grouped.push({ groupLabel: cs.groupLabel, groupSubtitle: cs.groupSubtitle, steps: [] });
                  }
                  grouped[grouped.length - 1].steps.push({ ...cs, globalIndex: globalIdx++ });
                }
                return grouped.map((g, gi) => (
                  <div key={gi}>
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#06283D] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <h3 className={cn(
                          "font-bold uppercase tracking-[0.12em] text-white",
                          sorterCols >= 6 ? "text-[10px]" : "text-xs",
                        )}>
                          {g.groupLabel}
                        </h3>
                        {g.groupSubtitle && (
                          <p className={cn(
                            "mt-0.5 font-medium text-white/50",
                            sorterCols >= 6 ? "text-[9px]" : "text-[11px]",
                          )}>
                            {g.groupSubtitle}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        "shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/50",
                        sorterCols >= 6 ? "text-[9px]" : "text-[10px]",
                      )}>
                        {g.steps.length} {g.steps.length === 1 ? "step" : "steps"}
                      </span>
                    </div>
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
                              "flex items-start gap-1.5 rounded-b-lg px-2 py-2",
                              isActive ? "bg-[#E56910]/10" : "bg-white",
                            )}>
                              <span className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                isActive
                                  ? "bg-[#E56910] text-white"
                                  : "bg-gray-100 text-gray-400",
                              )}>
                                {cs.globalIndex + 1}
                              </span>
                              <textarea
                                rows={2}
                                value={cs.label}
                                onChange={(e) => updateSlideLabel(cs.groupIndex, cs.slideInGroupIndex, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Click to add label…"
                                className={cn(
                                  "min-w-0 flex-1 resize-none rounded border border-transparent bg-transparent px-1 -mx-1 font-medium leading-snug outline-none transition-colors hover:border-gray-200 hover:bg-gray-50 focus:border-[#00446A]/30 focus:bg-white focus:ring-1 focus:ring-[#00446A]/30",
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
      {walkthroughOpen && (
        <WalkthroughOverlay
          onClose={() => setWalkthroughOpen(false)}
          onStartPresenting={startPresenting}
          onEndPresenting={endPresenting}
        />
      )}

      {/* Presenter console overlay */}
      {presenting && !isAudience && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col transition-colors", darkMode ? "bg-[#0a0a0a]" : "bg-gray-100")}>
          {/* Top bar */}
          <div className={cn("relative flex shrink-0 items-center border-b px-4 py-2 transition-colors", darkMode ? "border-white/10 bg-[#111]/90" : "border-black/10 bg-white")}>
            <div className="flex items-center gap-2">
              <button
                onClick={endPresenting}
                className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", darkMode ? "border-white/15 bg-white/5 text-white/70 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300" : "border-black/15 bg-black/5 text-gray-600 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600")}
                data-wt="p-end-show"
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
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2" data-wt="p-timer">
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
                onClick={toggleShareMode}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  darkMode
                    ? "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                    : "border-black/15 bg-black/5 text-gray-600 hover:border-black/30 hover:bg-black/10",
                )}
              >
                <span className={shareMode ? "text-teal-400" : ""}>I'm Sharing This On Teams</span>
                <div
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors duration-200",
                    shareMode ? "bg-teal-500" : darkMode ? "bg-white/20" : "bg-black/15",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-200",
                      shareMode ? "translate-x-3.5" : "translate-x-0.5",
                    )}
                  />
                </div>
              </button>
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
            <div className="flex flex-1 flex-col p-4" data-wt="p-slide-preview">
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
            <div className={cn("flex w-[380px] shrink-0 flex-col border-l transition-colors", darkMode ? "border-white/10 bg-[#111]" : "border-black/10 bg-white")} data-wt="p-notes-panel">
              {/* Next slide preview */}
              <div className={cn("shrink-0 border-b p-4", darkMode ? "border-white/10" : "border-black/10")}>
                <h3 className={cn("mb-2 text-[10px] font-bold uppercase tracking-[0.15em]", darkMode ? "text-white/40" : "text-gray-400")}>
                  Next slide
                </h3>
                <div className={cn("relative aspect-[16/10] overflow-hidden rounded-lg border", darkMode ? "border-white/10 bg-[#06283D]" : "border-black/10 bg-gray-900")}>
                  {nextPosition ? (
                    <iframe
                      key={`${nextPosition.slideIndex}-${nextPosition.stepIndex}`}
                      src={`${window.location.origin}${window.location.pathname}?audience=true&mode=self&slide=${nextPosition.slideIndex}&subStep=${nextPosition.stepIndex}&skipAnimation=true`}
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                      title="Next Slide Preview"
                    />
                  ) : (
                    <div className={cn("absolute inset-0 flex items-center justify-center text-sm", darkMode ? "text-white/30" : "text-white/40")}>
                      End of presentation
                    </div>
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

const MODEL_WORDS = ["Design", "Power", "Execute", "Refine"];


function RotatingWord({ isActive }: { isActive: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    setIndex(0);
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MODEL_WORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isActive]);

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

function IntroSlide({ isActive }: { isActive: boolean }) {
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

function DesignIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-10">
      <rect x="2" y="6" width="12" height="6" rx="2" fill="#3A7D44" opacity={0.7} />
      <rect x="2" y="15" width="12" height="6" rx="2" fill="#3A7D44" opacity={0.5} />
      <rect x="2" y="27" width="12" height="6" rx="2" fill="#2A7BA5" opacity={0.7} />
      <rect x="2" y="36" width="12" height="6" rx="2" fill="#2A7BA5" opacity={0.5} />
      <path d="M14 9 C22 9, 22 24, 26 24" stroke="#3A7D44" strokeWidth="1.2" fill="none" opacity={0.4} />
      <path d="M14 18 C22 18, 22 24, 26 24" stroke="#3A7D44" strokeWidth="1.2" fill="none" opacity={0.4} />
      <path d="M14 30 C22 30, 22 24, 26 24" stroke="#2A7BA5" strokeWidth="1.2" fill="none" opacity={0.4} />
      <path d="M14 39 C22 39, 22 24, 26 24" stroke="#2A7BA5" strokeWidth="1.2" fill="none" opacity={0.4} />
      <circle cx="36" cy="24" r="11" fill="none" stroke="#00446A" strokeWidth="2" />
      <path d="M25 24 h22" stroke="white" strokeWidth="1" strokeDasharray="2 1.5" />
      <circle cx="36" cy="19" r="4" fill="#4A9B6E" opacity={0.6} />
      <circle cx="36" cy="29" r="4" fill="#4A8DB8" opacity={0.6} />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-10">
      <line x1="6" y1="42" x2="6" y2="4" stroke="#00446A" strokeWidth="1.5" opacity={0.3} />
      <line x1="6" y1="42" x2="44" y2="42" stroke="#00446A" strokeWidth="1.5" opacity={0.3} />
      <circle cx="14" cy="14" r="2.5" fill="#00446A" opacity={0.7} />
      <circle cx="20" cy="20" r="2.5" fill="#00446A" opacity={0.5} />
      <circle cx="30" cy="12" r="2.5" fill="#E56910" opacity={0.7} />
      <circle cx="36" cy="18" r="2.5" fill="#E56910" opacity={0.5} />
      <circle cx="12" cy="30" r="2.5" fill="#2e7d32" opacity={0.7} />
      <circle cx="22" cy="34" r="2.5" fill="#2e7d32" opacity={0.5} />
      <circle cx="34" cy="30" r="2.5" fill="#7B5EA7" opacity={0.7} />
      <circle cx="40" cy="36" r="2.5" fill="#7B5EA7" opacity={0.5} />
      <circle cx="18" cy="26" r="1.8" fill="#00446A" opacity={0.3} />
      <circle cx="26" cy="24" r="1.8" fill="#E56910" opacity={0.3} />
      <circle cx="38" cy="10" r="1.8" fill="#2e7d32" opacity={0.3} />
      <circle cx="28" cy="38" r="1.8" fill="#7B5EA7" opacity={0.3} />
    </svg>
  );
}

function ExecuteIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-10">
      <rect x="2" y="14" width="13" height="20" rx="2.5" fill="#00446A" fillOpacity={0.1} stroke="#00446A" strokeWidth="1" strokeOpacity={0.3} />
      <rect x="5" y="19" width="7" height="1.5" rx="0.75" fill="#E56910" opacity={0.6} />
      <rect x="5" y="23" width="5" height="1.5" rx="0.75" fill="#E56910" opacity={0.4} />
      <rect x="5" y="27" width="8" height="1.5" rx="0.75" fill="#E56910" opacity={0.5} />
      <path d="M15 24 C20 24, 20 24, 22 24" stroke="#21A5D5" strokeWidth="1" fill="none" opacity={0.4} />
      <circle cx="27" cy="24" r="5" fill="none" stroke="#21A5D5" strokeWidth="1.5" opacity={0.6} />
      <circle cx="27" cy="24" r="2" fill="#21A5D5" opacity={0.3} />
      <path d="M32 24 C34 24, 34 24, 35 24" stroke="#21A5D5" strokeWidth="1" fill="none" opacity={0.4} />
      <rect x="35" y="16" width="11" height="16" rx="2.5" fill="#00446A" fillOpacity={0.1} stroke="#00446A" strokeWidth="1" strokeOpacity={0.3} />
      <text x="40.5" y="25" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#E56910" opacity={0.8}>$</text>
    </svg>
  );
}

function RefineIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-10">
      <line x1="6" y1="42" x2="6" y2="4" stroke="#00446A" strokeWidth="1.5" opacity={0.3} />
      <line x1="6" y1="42" x2="44" y2="42" stroke="#00446A" strokeWidth="1.5" opacity={0.3} />
      <path d="M8 12 C14 13, 20 22, 28 30 C32 34, 38 38, 42 39" stroke="#00446A" strokeWidth="2" fill="none" opacity={0.6} />
      <path d="M8 10 C14 11, 20 18, 28 26 C32 30, 38 34, 42 36" stroke="#21A5D5" strokeWidth="1.5" fill="none" strokeDasharray="3 2" opacity={0.4} />
      <circle cx="16" cy="16" r="2.5" fill="#C27A3A" opacity={0.7} />
      <circle cx="28" cy="28" r="2.5" fill="#4A8FA8" opacity={0.7} />
      <circle cx="38" cy="37" r="2.5" fill="#4A8A5C" opacity={0.7} />
    </svg>
  );
}

const END_RECAP = [
  { section: "Design", title: "Your Model", desc: "One model built around your business — your data, your factors, your rules.", Icon: DesignIcon },
  { section: "Power", title: "Searching Transactions", desc: "ML finds pricing patterns across millions of transactions humans can't see.", Icon: PowerIcon },
  { section: "Execute", title: "Pricing Decisions", desc: "SKU-level prices tailored to each customer, delivered where your team works.", Icon: ExecuteIcon },
  { section: "Refine", title: "Continuous Learning", desc: "The model continuously recalibrates as costs, competition, and markets shift.", Icon: RefineIcon },
];

function EndSlide({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        End of Walkthrough
      </span>
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Thank You
      </h2>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">
        Questions? Let&apos;s discuss how this model can work for your business.
      </p>

      <div className="mt-10 flex w-full max-w-4xl items-stretch justify-center">
        {END_RECAP.map((item, i) => (
          <div key={item.section} className="flex items-stretch">
            <div className="flex w-52 flex-col rounded-xl px-4 py-5 text-left" style={{ backgroundColor: "#00446A08", border: "1px solid #00446A0F" }}>
              <item.Icon />
              <span className="mt-3 text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#21A5D5" }}>{item.section}</span>
              <h3 className="mt-0.5 text-sm font-bold" style={{ color: "#00446A" }}>{item.title}</h3>
              <p className="mt-1.5 text-[0.8rem] font-medium leading-snug" style={{ color: "#5A6A78" }}>{item.desc}</p>
            </div>
            {i < END_RECAP.length - 1 && (
              <div className="flex shrink-0 items-center px-2">
                <svg viewBox="0 0 24 24" className="size-5 text-[#00446A]/20">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

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
