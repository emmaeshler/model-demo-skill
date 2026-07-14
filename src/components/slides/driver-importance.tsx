"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, ORANGE, GREEN, PURPLE, MUTED,
  SQUARE_FACTORS,
} from "./power-slide-data";
import { useShareMode } from "@/lib/share-context";

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 7;

type CategoryKey = "customer" | "product" | "order" | "market";

const CATEGORY_COLORS: Record<string, string> = {
  customer: NAVY,
  product: ORANGE,
  order: PURPLE,
  market: GREEN,
};

type ExampleAction = "remove" | "elevate" | "add";

interface ExampleStep {
  supertitle: string;
  headline: string;
  detail: string;
  dismissLine: string;
  color: string;
  action: ExampleAction;
  highlight: string[];
  remove: Set<string>;
  add: string[];
  icon: string;
}

const EXAMPLE_STEPS: ExampleStep[] = [
  {
    supertitle: "Removing a factor",
    headline: "Sales Rep",
    detail: "Behavioral, not a pricing driver — removing it keeps the model focused on structural patterns.",
    dismissLine: "Variance explained by who sells, not what's sold.",
    color: NAVY,
    action: "remove",
    highlight: ["Sales Rep"],
    remove: new Set(["Sales Rep"]),
    add: [],
    icon: "✕",
  },
  {
    supertitle: "Elevating a factor",
    headline: "Product Importance",
    detail: "Captures how price-sensitive a product is within a customer — a hidden signal worth surfacing.",
    dismissLine: "Adds precision to the product dimension of the model.",
    color: TEAL,
    action: "elevate",
    highlight: ["Product Importance"],
    remove: new Set(),
    add: ["Product Importance"],
    icon: "↑",
  },
  {
    supertitle: "Adding a factor",
    headline: "Competitor Pricing",
    detail: "Low variance, but acts as a final positioning check — keeping the model's price in a competitive range.",
    dismissLine: "A market guardrail that sharpens the final price.",
    color: GREEN,
    action: "add",
    highlight: ["Competitor Pricing"],
    remove: new Set(),
    add: ["Competitor Pricing"],
    icon: "+",
  },
];

const IMPORTANCE: Record<string, number> = {
  "Product Category": 15.2,
  "Geography": 13.6,
  "Sales Rep": 11.8,
  "End Market": 10.4,
  "Order Frequency": 8.8,
  "Customer Tenure": 7.6,
  "Product Specialization": 6.4,
  "Seasonality": 5.8,
  "Order size": 5.0,
  "Product family": 4.6,
  "Customer size": 4.0,
  "Customer channel": 3.4,
  "Cost to serve": 3.0,
  "Market share": 2.6,
  "Willingness to pay": 2.2,
  "Industry trends": 1.8,
  "Commodity index": 1.6,
  "Lead time": 1.4,
  "Contract type": 1.2,
  "Payment terms": 1.0,
  "Price sensitivity": 0.8,
  "Competitor activity": 0.6,
  "Product Importance": 0.4,
  "Competitor Pricing": 0.2,
};

const FACTOR_ORDER = [
  "Product Category",
  "Geography",
  "Sales Rep",
  "End Market",
  "Order Frequency",
  "Customer Tenure",
  "Product Specialization",
  "Seasonality",
  "Order size",
  "Product family",
  "Customer size",
  "Customer channel",
  "Cost to serve",
  "Market share",
  "Willingness to pay",
  "Industry trends",
  "Commodity index",
  "Lead time",
  "Contract type",
  "Payment terms",
  "Price sensitivity",
  "Competitor activity",
  "Product Importance",
  "Competitor Pricing",
];

const ALL_FACTORS = SQUARE_FACTORS
  .filter(f => f.label in IMPORTANCE)
  .map(f => ({ label: f.label, category: f.category, value: IMPORTANCE[f.label] ?? 0 }))
  .sort((a, b) => {
    const ai = FACTOR_ORDER.indexOf(a.label);
    const bi = FACTOR_ORDER.indexOf(b.label);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

const MAX_VALUE = Math.max(...ALL_FACTORS.map(f => f.value));
const FINAL_DRIVERS = [
  { label: "Product Category", category: "product", value: 15.2 },
  { label: "Geography", category: "customer", value: 13.6 },
  { label: "End Market", category: "customer", value: 10.4 },
  { label: "Product Importance", category: "product", value: 0.4 },
  { label: "Order Frequency", category: "order", value: 8.8 },
  { label: "Customer Tenure", category: "customer", value: 7.6 },
  { label: "Competitor Pricing", category: "market", value: 0.2 },
];

const BAR_MAX_W = 480;

type Disposition = "keep" | "remove" | "add";

export function DriverImportanceSlide({
  step = 0,
  skipAnimation,
  isActive = true,
  onAutoAdvance,
}: {
  step: number;
  skipAnimation?: boolean;
  isActive?: boolean;
  onAutoAdvance?: () => void;
}) {
  const { shareMode } = useShareMode();
  const autoAdvanceRef = useRef(onAutoAdvance);
  autoAdvanceRef.current = onAutoAdvance;
  const isCollapse = step === 6;
  const isConsolidated = step === 4 || step === 5;
  const isDrivers = step === 5;
  const isIntro = step === 0;
  const isChart = step >= 1 && step <= 3;
  const exampleIndex = isChart ? step - 1 : -1;
  const activeExample = isChart ? EXAMPLE_STEPS[exampleIndex] : null;

  /* Auto-phase 1: after bars animate in, reveal keep/add annotations */
  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation && isChart);
  useEffect(() => {
    if (!isActive || !isChart) { setActionRevealed(false); return; }
    if (skipAnimation || shareMode) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 1200);
    return () => clearTimeout(t);
  }, [isActive, step, skipAnimation, isChart]);

  /* Phase 2: secondPhase (900ms after phase 1) → apply action */
  const [secondPhase, setSecondPhase] = useState(!!skipAnimation);
  useEffect(() => {
    if (!actionRevealed) { setSecondPhase(false); return; }
    if (skipAnimation || shareMode) { setSecondPhase(true); return; }
    setSecondPhase(false);
    const t = setTimeout(() => setSecondPhase(true), 900);
    return () => clearTimeout(t);
  }, [actionRevealed, skipAnimation]);

  /* Phase 3: storedPhase (800ms after phase 2) → factor slides to right panel */
  const [storedPhase, setStoredPhase] = useState(!!skipAnimation);
  useEffect(() => {
    if (!secondPhase) { setStoredPhase(false); return; }
    if (skipAnimation || shareMode) { setStoredPhase(true); return; }
    setStoredPhase(false);
    const t = setTimeout(() => setStoredPhase(true), 800);
    return () => clearTimeout(t);
  }, [secondPhase, skipAnimation]);

  const removedSet = useMemo(() => {
    const set = new Set<string>();
    if (isConsolidated || isCollapse) {
      for (const ex of EXAMPLE_STEPS) ex.remove.forEach(l => set.add(l));
    } else {
      for (let i = 0; i < exampleIndex; i++) {
        EXAMPLE_STEPS[i].remove.forEach(l => set.add(l));
      }
    }
    return set;
  }, [exampleIndex, isConsolidated, isCollapse]);

  const pastKeptSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < exampleIndex; i++) {
      for (const l of EXAMPLE_STEPS[i].add) set.add(l);
    }
    return set;
  }, [exampleIndex]);

  const visibleFactors = useMemo(() => {
    if (isConsolidated || isCollapse) {
      const allRemovals = new Set<string>();
      for (const ex of EXAMPLE_STEPS) ex.remove.forEach(l => allRemovals.add(l));
      return ALL_FACTORS.filter(f => !allRemovals.has(f.label));
    }
    const productRevealed = exampleIndex >= 1 && (exampleIndex > 1 || actionRevealed);
    const competitorRevealed = exampleIndex >= 2 && (exampleIndex > 2 || actionRevealed);
    return ALL_FACTORS.filter(f => {
      if (f.label === "Product Importance" && !productRevealed) return false;
      if (f.label === "Competitor Pricing" && !competitorRevealed) return false;
      return true;
    });
  }, [isConsolidated, isCollapse, exampleIndex, actionRevealed]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 3 : 0);
  useEffect(() => {
    if (!isActive || !isIntro) { setIntroPhase(skipAnimation ? 3 : 0); return; }
    if (skipAnimation || shareMode) { setIntroPhase(3); return; }
    setIntroPhase(0);
    const timers = [
      setTimeout(() => setIntroPhase(1), 800),
      setTimeout(() => setIntroPhase(2), 2000),
      setTimeout(() => setIntroPhase(3), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isActive, isIntro, skipAnimation, shareMode]);

  const [clickReady, setClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || isDrivers || isCollapse) { setClickReady(false); return; }
    if (skipAnimation || shareMode) { setClickReady(true); return; }
    setClickReady(false);
    if (isIntro) {
      if (introPhase < 3) return;
      const t = setTimeout(() => setClickReady(true), 800);
      return () => clearTimeout(t);
    }
    if (isChart) {
      if (!storedPhase) return;
      const t = setTimeout(() => setClickReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [isActive, isIntro, introPhase, isChart, storedPhase, isDrivers, isCollapse, skipAnimation, step]);

  /* Auto-advance through example steps (1→2→3→4) and consolidated (4→5) */
  useEffect(() => {
    if (!isActive || !onAutoAdvance) return;
    if (isChart && storedPhase) {
      const t = setTimeout(() => onAutoAdvance(), 1200);
      return () => clearTimeout(t);
    }
    if (step === 4) {
      const t = setTimeout(() => onAutoAdvance(), 600);
      return () => clearTimeout(t);
    }
  }, [isActive, isChart, secondPhase, step, onAutoAdvance]);

  function getDisposition(f: { label: string; category: string }): Disposition | null {
    if (!activeExample || !actionRevealed) return null;
    if (activeExample.remove.has(f.label)) return secondPhase ? "remove" : null;
    if (activeExample.add.includes(f.label)) return "add";
    if (activeExample.highlight.includes(f.label) && !activeExample.remove.has(f.label)) return "keep";
    return null;
  }

  const annotated = visibleFactors
    .map((f, i) => ({ ...f, index: i, disposition: getDisposition(f) }))
    .filter(t => t.disposition !== null);

  const hasAnnotations = annotated.length > 0;

  const narrative = exampleIndex >= 0 ? EXAMPLE_STEPS[exampleIndex] : null;

  // Driver cards animation — runs as auto-phase of consolidated step
  // 0 = waiting, 1 = customer, 2 = product, 3 = order, 4 = market (all shown)
  const [driverHighlight, setDriverHighlight] = useState(0);
  const [driversDone, setDriversDone] = useState(!!skipAnimation);
  const [driversExpanded, setDriversExpanded] = useState(!!skipAnimation);
  const [driverClickReady, setDriverClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || !isDrivers) { setDriverHighlight(0); setDriversDone(false); setDriversExpanded(false); setDriverClickReady(false); return; }
    if (skipAnimation || shareMode) { setDriverHighlight(4); setDriversDone(true); setDriversExpanded(true); setDriverClickReady(true); return; }
    setDriverHighlight(0);
    setDriversDone(false);
    setDriversExpanded(false);
    setDriverClickReady(false);
    const START = 600;
    const timers = [
      setTimeout(() => setDriverHighlight(1), START + 800),
      setTimeout(() => setDriverHighlight(2), START + 2400),
      setTimeout(() => setDriverHighlight(3), START + 4000),
      setTimeout(() => setDriverHighlight(4), START + 5600),
      setTimeout(() => setDriversDone(true), START + 6800),
      setTimeout(() => setDriversExpanded(true), START + 8800),
      setTimeout(() => setDriverClickReady(true), START + 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isActive, isDrivers, skipAnimation, shareMode]);

  const [collapsePhase, setCollapsePhase] = useState(0);
  useEffect(() => {
    if (!isCollapse) { setCollapsePhase(0); return; }
    if (!isActive) return;
    if (skipAnimation) { autoAdvanceRef.current?.(); return; }
    if (shareMode) { setCollapsePhase(3); autoAdvanceRef.current?.(); return; }
    setCollapsePhase(0);
    const t1 = setTimeout(() => setCollapsePhase(1), 400);
    const t2 = setTimeout(() => setCollapsePhase(2), 1200);
    const t3 = setTimeout(() => {
      setCollapsePhase(3);
      autoAdvanceRef.current?.();
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive, isCollapse, skipAnimation, shareMode]);

  const showDriverCards = isDrivers && driverHighlight >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pl-16 pt-4">
      {/* Title */}
      <div
        className="relative w-full"
        style={{ height: isChart ? 130 : 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))", transition: "height 0.4s ease" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <AnimatePresence mode="wait">
            {isCollapse && collapsePhase >= 2 ? (
              <motion.div
                key="collapse"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                  One optimal price per SKU
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  All your drivers, one answer.
                </p>
              </motion.div>
            ) : isCollapse || isConsolidated ? (
              <motion.div
                key={(isCollapse || showDriverCards) ? "driver-cards" : "consolidated"}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                  {(isCollapse || showDriverCards) ? "Your model drivers" : "Your model factors"}
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  {(isCollapse || showDriverCards)
                    ? "7 drivers across 4 dimensions powering your pricing model."
                    : "7 drivers refined from 22 — tuned to your business."}
                </p>
              </motion.div>
            ) : isIntro ? (
              <motion.div
                key="intro"
                className="absolute inset-0"
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="relative w-full" style={{ height: 80 }}>
                  {/* Lines 1 & 2 — reveal then crossfade out */}
                  <div
                    className="absolute inset-x-0 top-0 flex flex-col items-center gap-1"
                    style={{
                      opacity: introPhase >= 2 ? 0 : 1,
                      transform: introPhase >= 2 ? "translateY(-12px)" : "translateY(0)",
                      transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
                      pointerEvents: introPhase >= 2 ? "none" : "auto",
                    }}
                  >
                    <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                      We look across{" "}
                      <span style={{ color: TEAL }}>22 pricing factors</span>
                    </h2>
                    <h2
                      className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                      style={{
                        color: NAVY,
                        opacity: introPhase >= 1 ? 1 : 0,
                        transform: introPhase >= 1 ? "translateY(0)" : "translateY(8px)",
                        transition: "opacity 0.5s, transform 0.5s",
                      }}
                    >
                      and{" "}
                      <span
                        style={{
                          borderBottom: `2px solid ${TEAL}`,
                          paddingBottom: 2,
                        }}
                      >
                        tune the model
                      </span>
                      {" "}to your business
                    </h2>
                  </div>
                  {/* Chart title — fades in at phase 2 */}
                  <div
                    className="absolute inset-x-0 top-0 flex flex-col items-center gap-2"
                    style={{
                      opacity: introPhase >= 2 ? 1 : 0,
                      transform: introPhase >= 2 ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                      pointerEvents: introPhase >= 2 ? "auto" : "none",
                    }}
                  >
                    <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                      Pricing factors across four dimensions
                    </h2>
                    <p
                      className="mx-auto max-w-2xl text-center text-[1.05rem] leading-relaxed whitespace-nowrap"
                      style={{
                        color: MUTED,
                        opacity: introPhase >= 2 ? 1 : 0,
                        transform: introPhase >= 2 ? "translateY(0)" : "translateY(6px)",
                        transition: introPhase >= 2 ? "opacity 0.4s 0.15s, transform 0.4s 0.15s" : "opacity 0.3s, transform 0.3s",
                      }}
                    >
                      Elevating what matters, removing what doesn&rsquo;t.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`example-${exampleIndex}`}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {narrative && (
                  <>
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: `${narrative.color}90` }}
                    >
                      {narrative.supertitle}
                    </span>
                    <h2
                      className="text-center text-[22px] font-bold leading-snug sm:text-2xl"
                      style={{ color: narrative.color }}
                    >
                      <span style={{ borderBottom: `2.5px solid ${narrative.color}`, paddingBottom: 2 }}>
                        {narrative.headline}
                      </span>
                    </h2>
                    <p className="mx-auto max-w-xl text-center text-[15px] font-medium leading-relaxed" style={{ color: NAVY, opacity: 0.7 }}>
                      {narrative.detail}
                    </p>
                    <AnimatePresence>
                      {secondPhase && (
                        <motion.p
                          className="mx-auto max-w-lg text-center text-[13px] font-medium leading-relaxed"
                          style={{ color: MUTED, borderTop: `1px dashed ${MUTED}30`, paddingTop: 8, marginTop: 4 }}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 0.55, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {narrative.dismissLine}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content area */}
      <div
        className="relative w-full flex-1 min-h-0 overflow-hidden pt-1"
        style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
      >
        <AnimatePresence mode="wait">
          {isCollapse ? (
            <motion.div
              key="collapse-content"
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
            >
              {/* Driver cards converging to center */}
              <motion.div
                className="absolute inset-0 flex justify-center pt-4"
                animate={collapsePhase >= 1
                  ? { scale: 0.12, opacity: 0 }
                  : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.8, ease: EASE }}
                style={{ transformOrigin: "center 45%" }}
              >
                <div style={{ width: 500 }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 block"
                    style={{ color: MUTED, opacity: 0.7 }}
                  >
                    7 drivers across 4 categories
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {FINAL_DRIVERS.map((d) => (
                      <div key={d.label}>
                        <DriverCard
                          label={d.label}
                          category={d.category}
                          color={CATEGORY_COLORS[d.category]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Circle grows after cards converge */}
              {collapsePhase >= 2 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CollapseView
                    phase={collapsePhase}
                    skipAnimation={skipAnimation}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chart-content"
              className={`absolute inset-0 flex justify-center ${isConsolidated ? "items-start pt-4" : ""}`}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {/* Skeleton overlay during intro */}
              {isIntro && !skipAnimation && (
                <div
                  className="absolute inset-0 flex justify-center"
                  style={{
                    opacity: introPhase >= 3 ? 0 : introPhase >= 1 ? 1 : 0,
                    transform: introPhase < 1 ? "translateY(12px)" : "translateY(0)",
                    transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                    pointerEvents: introPhase >= 3 ? "none" : "auto",
                  }}
                >
                  <div className="w-full max-w-5xl">
                    <div className="mb-2" style={{ height: 14, paddingLeft: 178 }}>
                      <div className="rounded" style={{ width: 120, height: 8, backgroundColor: `${MUTED}15`, marginTop: 3 }} />
                    </div>
                    {ALL_FACTORS.map((f, i) => (
                      <div key={f.label} className="flex items-center" style={{ height: 22, marginBottom: 2 }}>
                        <div className="shrink-0 flex justify-end pr-3" style={{ width: 170 }}>
                          <div className="rounded" style={{ width: 60 + (i % 5) * 18, height: 10, backgroundColor: `${MUTED}12` }} />
                        </div>
                        <div className="rounded-r-sm" style={{ height: 16, width: (f.value / MAX_VALUE) * BAR_MAX_W, backgroundColor: `${MUTED}10` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real chart content — fades in at intro phase 3 */}
              <div
                className={`w-full max-w-5xl flex relative ${isConsolidated ? "pl-12 gap-8" : "gap-3"}`}
                style={isIntro && !skipAnimation ? {
                  opacity: introPhase >= 3 ? 1 : 0,
                  transition: "opacity 0.5s ease-out",
                } : undefined}
              >
                {/* Bar chart column */}
                <motion.div
                  className="flex-1 min-w-0"
                  animate={{ opacity: driversDone ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ pointerEvents: driversDone ? "none" : "auto" }}
                >
                  <LayoutGroup>
                    <div className="flex flex-col relative">
                      <motion.div
                        className="flex items-center mb-1"
                        style={{ paddingLeft: isConsolidated ? 220 : 170 }}
                        initial={skipAnimation ? { opacity: 0.4 } : { opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.5 }}
                      >
                        <span
                          className="font-semibold uppercase"
                          style={{ color: MUTED, fontSize: 9, letterSpacing: "0.1em" }}
                        >
                          Variance %
                        </span>
                      </motion.div>
                      <AnimatePresence>
                      {visibleFactors.map((f, i) => {
                        const disposition = getDisposition(f);
                        const color = CATEGORY_COLORS[f.category] ?? MUTED;
                        const isPastRemoved = removedSet.has(f.label);
                        const isPastKept = pastKeptSet.has(f.label);
                        const isAnnotated = disposition !== null;

                        const isRemove = disposition === "remove";
                        const isKeep = disposition === "keep";
                        const isAdd = disposition === "add";

                        const isHighlighted = isChart && activeExample && actionRevealed &&
                          (activeExample.highlight.includes(f.label) || activeExample.add.includes(f.label));
                        const willBeRemoved = isChart && activeExample && actionRevealed && activeExample.remove.has(f.label);
                        const willBeKept = isHighlighted && !isAdd;
                        const showColor = isHighlighted || isConsolidated;

                        const barColor = isRemove ? `${MUTED}60`
                          : isPastRemoved ? `${MUTED}30`
                          : isAdd ? TEAL
                          : (isKeep || willBeKept) ? GREEN
                          : showColor ? color
                          : `${MUTED}40`;
                        const effectiveBarMax = showDriverCards ? BAR_MAX_W : isConsolidated ? 520 : BAR_MAX_W;
                        const barW = (f.value / MAX_VALUE) * effectiveBarMax;

                        const DRIVER_CAT_ORDER: CategoryKey[] = ["customer", "product", "order", "market"];
                        const driverCatIdx = DRIVER_CAT_ORDER.indexOf(f.category as CategoryKey);
                        const opacity = showDriverCards
                          ? (driverCatIdx === driverHighlight - 1 ? 1
                            : driverCatIdx < driverHighlight ? 0.6
                            : 0.15)
                          : isPastRemoved ? 0.15
                          : isAnnotated ? 1
                          : willBeRemoved && secondPhase ? 0.12
                          : willBeRemoved ? 1
                          : hasAnnotations ? 0.12
                          : 1;

                        return (
                          <motion.div
                            key={f.label}
                            layoutId={`di-${f.label}`}
                            layout="position"
                            className="flex items-center"
                            style={{ height: isConsolidated ? 40 : 18, marginBottom: isConsolidated ? 8 : 1 }}
                            initial={skipAnimation ? false : { opacity: 0, x: -20 }}
                            animate={{ opacity, x: 0 }}
                            exit={{ opacity: 0, x: -10, transition: { duration: 0.3 } }}
                            transition={{
                              opacity: { duration: 0.4 },
                              x: { duration: 0.5, delay: skipAnimation ? 0 : i * 0.03, ease: EASE },
                              layout: { duration: 0.5, ease: EASE },
                            }}
                          >
                            <motion.span
                              className={`shrink-0 text-right pr-3 relative inline-flex justify-end ${isConsolidated ? "text-[17px]" : "text-[13px]"}`}
                              style={{
                                width: isConsolidated ? 220 : 170,
                                color: isPastRemoved ? `${MUTED}60`
                                  : (isRemove || (willBeRemoved && secondPhase)) ? `${MUTED}80`
                                  : isAdd ? TEAL
                                  : (isKeep || willBeKept) ? GREEN
                                  : showColor ? color
                                  : MUTED,
                                fontWeight: (isAnnotated || willBeKept || (willBeRemoved && secondPhase)) ? 700 : isHighlighted ? 600 : 500,
                                transition: "color 0.4s, font-weight 0.4s",
                              }}
                            >
                              <span className="relative inline-block">
                                {f.label}
                                <AnimatePresence>
                                  {(isRemove || isPastRemoved) && (
                                    <motion.span
                                      className="absolute left-0 right-0 top-1/2"
                                      style={{
                                        height: 0,
                                        borderTop: `1px dashed ${MUTED}60`,
                                        transformOrigin: "left",
                                      }}
                                      initial={isPastRemoved ? { scaleX: 1 } : { scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      exit={{ scaleX: 0 }}
                                      transition={{ duration: isPastRemoved ? 0 : 0.35, delay: isPastRemoved ? 0 : 0.3, ease: EASE }}
                                    />
                                  )}
                                </AnimatePresence>
                              </span>
                            </motion.span>

                            <div className="relative flex items-center" style={{ flex: 1, height: "100%" }}>
                              <motion.div
                                className={isConsolidated ? "rounded-r-md overflow-hidden relative" : "rounded-r-sm overflow-hidden relative"}
                                style={{ height: "100%" }}
                                initial={skipAnimation ? { width: barW, backgroundColor: barColor } : { width: 0, backgroundColor: barColor }}
                                animate={{ width: barW, backgroundColor: barColor }}
                                transition={{
                                  width: { duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : 0.15 + i * 0.03, ease: EASE },
                                  backgroundColor: { duration: 0.4, ease: EASE },
                                }}
                              />

                              <AnimatePresence>
                                {((isKeep || isAdd) || isPastKept) && (
                                  <motion.span
                                    key={`icon-${f.label}-${disposition ?? "past"}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: isAdd ? 20 : 16, height: isAdd ? 20 : 16,
                                      backgroundColor:
                                        isPastKept && !isAnnotated ? `${GREEN}20`
                                        : isAdd ? TEAL
                                        : `${GREEN}`,
                                      color:
                                        isPastKept && !isAnnotated ? GREEN
                                        : "#fff",
                                      fontSize: isAdd ? 13 : 9, fontWeight: 900, lineHeight: 1,
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: (isPastKept && !isAnnotated) ? 0.6 : 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={
                                      isAnnotated
                                        ? { delay: 0.2, duration: 0.3, type: "spring", stiffness: 300 }
                                        : { duration: 0.3 }
                                    }
                                  >
                                    {isAdd ? "+" : "✓"}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                      </AnimatePresence>
                    </div>
                  </LayoutGroup>

                  <motion.p
                    className={`mt-3 font-medium leading-relaxed ${isConsolidated ? "text-[12px]" : "text-[11px]"}`}
                    style={{ color: isConsolidated ? `${NAVY}90` : `${MUTED}90`, paddingLeft: isConsolidated ? 228 : 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: isConsolidated ? 0.7 : 0.5 }}
                    transition={{ duration: 0.5, delay: skipAnimation ? 0 : 0.8 }}
                  >
                    * Percentage of explainable variance — how much each factor contributes to the model&rsquo;s pricing accuracy.
                  </motion.p>
                </motion.div>

                {/* Right column: stored examples (chart steps) or driver category cards (consolidated) */}
                {(isChart || isConsolidated) && !showDriverCards && (
                  <div className="shrink-0 flex flex-col pt-6" style={{ width: 260 }}>
                    <AnimatePresence>
                      {(isChart ? exampleIndex > 0 || storedPhase : true) && (
                        <motion.span
                          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 block"
                          style={{ color: MUTED }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          Model adjustments
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <div className="flex flex-col gap-2.5">
                      {EXAMPLE_STEPS.map((ex, ei) => {
                        const isPrior = ei < exampleIndex;
                        const isCurrent = ei === exampleIndex && storedPhase;
                        const show = isConsolidated || isPrior || isCurrent;
                        if (!show) return null;
                        return (
                          <motion.div
                            key={ex.headline}
                            initial={{ opacity: 0, x: 30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            <ExampleCard example={ex} />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {showDriverCards ? (<>
                {/* Arrow */}
                <motion.div
                  className="shrink-0 flex items-center justify-center self-center"
                  animate={{ opacity: driversDone ? 0 : driverHighlight >= 1 ? 0.6 : 0, scale: driverHighlight >= 1 ? 1 : 0.5 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14h14m0 0l-5-5m5 5l-5 5" stroke={TEAL} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <motion.div
                  className="shrink-0 flex flex-col gap-2"
                  animate={driversDone
                    ? { position: "absolute" as const, left: "50%", x: "-50%", top: 0, width: 500 }
                    : { width: 220 }
                  }
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ paddingTop: driversDone ? 0 : 16 }}
                >
                  <AnimatePresence>
                    {driversDone && (
                      <motion.span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 block"
                        style={{ color: MUTED }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        7 drivers across 4 categories
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    {driversExpanded ? (
                      <motion.div
                        key="expanded-drivers"
                        className="grid grid-cols-2 gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {FINAL_DRIVERS.map((d, i) => (
                          <motion.div
                            key={d.label}
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                          >
                            <DriverCard
                              label={d.label}
                              category={d.category}
                              color={CATEGORY_COLORS[d.category]}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="category-cards"
                        className="flex flex-col gap-2"
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                      >
                        {(["customer", "product", "order", "market"] as CategoryKey[]).map((cat, ci) => {
                          if (ci >= driverHighlight) return null;
                          const catFactors = visibleFactors.filter(f => f.category === cat);
                          return (
                            <motion.div
                              key={cat}
                              initial={{ opacity: 0, x: 16, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{ duration: 0.45, ease: EASE }}
                            >
                              <DriverCategoryCard
                                cat={cat}
                                factors={catFactors}
                                color={CATEGORY_COLORS[cat]}
                                expanded={false}
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                </>) : null}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {((clickReady && !isChart && step !== 4) || driverClickReady) && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
              style={{ transform: "translateX(calc(-50% + var(--rail-inset, 0px) * -0.5))" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 0.5, 0.35], y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8m0 0l-3-3m3 3l3-3" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: `${MUTED}70` }}>
                Click to continue
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


function DriverCategoryCard({ cat, factors, color, expanded }: { cat: string; factors: { label: string }[]; color: string; expanded?: boolean }) {
  return (
    <div
      className={expanded ? "rounded-lg py-4 pl-5 pr-4 h-full" : "rounded-md py-2 pl-3 pr-2"}
      style={{ borderLeft: `3px solid ${color}`, backgroundColor: `${color}08` }}
    >
      <div className={`flex items-center ${expanded ? "gap-2 mb-2" : "gap-1.5 mb-1"}`}>
        <span className={`${expanded ? "w-3 h-3" : "w-2 h-2"} rounded-full shrink-0`} style={{ backgroundColor: color }} />
        <span className={`${expanded ? "text-[15px]" : "text-[12px]"} font-bold capitalize`} style={{ color: NAVY }}>
          {cat}
        </span>
      </div>
      <div className={`flex flex-col ${expanded ? "pl-5 gap-0.5" : "pl-[14px]"}`}>
        {factors.map(f => (
          <span key={f.label} className={`${expanded ? "text-[13px]" : "text-[11px]"} font-medium leading-[1.4]`} style={{ color: MUTED }}>
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DriverCard({ label, category, color }: { label: string; category: string; color: string }) {
  return (
    <div
      className="rounded-lg py-4 pl-5 pr-4"
      style={{ borderLeft: `3px solid ${color}`, backgroundColor: `${color}08` }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] capitalize" style={{ color: MUTED }}>
          {category}
        </span>
      </div>
      <span className="text-[15px] font-bold block" style={{ color: NAVY }}>
        {label}
      </span>
    </div>
  );
}

const ACTION_LABELS: Record<ExampleAction, string> = {
  remove: "Removed",
  elevate: "Elevated",
  add: "Added",
};

function ExampleCard({ example }: { example: ExampleStep }) {
  const bgColor = example.action === "remove" ? `${MUTED}08`
    : `${example.color}08`;
  const borderColor = example.action === "remove" ? `${MUTED}40`
    : example.color;
  const iconBg = example.action === "remove" ? `${MUTED}20`
    : `${example.color}18`;
  const iconColor = example.action === "remove" ? MUTED
    : example.color;

  return (
    <div
      className="rounded-lg py-3 pl-4 pr-3"
      style={{ borderLeft: `3px solid ${borderColor}`, backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="shrink-0 inline-flex items-center justify-center rounded-full text-[11px] font-bold"
          style={{ width: 22, height: 22, backgroundColor: iconBg, color: iconColor }}
        >
          {example.icon}
        </span>
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] block" style={{
            color: example.action === "remove" ? MUTED : example.color,
          }}>
            {ACTION_LABELS[example.action]}
          </span>
          <span className="text-[14px] font-bold block leading-tight" style={{
            color: example.action === "remove" ? MUTED : NAVY,
            textDecoration: example.action === "remove" ? "line-through" : "none",
          }}>
            {example.headline}
          </span>
        </div>
      </div>
    </div>
  );
}

const CIRCLE_R = 195;
const CIRCLE_D = CIRCLE_R * 2;

function CollapseView({ phase, skipAnimation }: { phase: number; skipAnimation?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: CIRCLE_D + 80, height: CIRCLE_D + 80 }}>
      {/* Pulse rings */}
      {phase >= 2 && !skipAnimation && [0, 1].map(i => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full"
          style={{
            width: CIRCLE_D,
            height: CIRCLE_D,
            border: `2px solid ${TEAL}`,
          }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 1.2, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}

      {/* Main circle */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: CIRCLE_D,
          height: CIRCLE_D,
          backgroundColor: "white",
          border: `2.5px solid ${TEAL}`,
        }}
        initial={skipAnimation ? { scale: 1 } : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 16 }}
      >
        <div className="flex flex-col items-center">
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", color: "#5A6A78" }}>
            OPTIMIZED
          </span>
          <span style={{ fontSize: 56, fontWeight: 800, color: NAVY, lineHeight: 1.1 }}>
            PRICE
          </span>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#5A6A78" }}>
            per SKU
          </span>
        </div>
      </motion.div>
    </div>
  );
}

