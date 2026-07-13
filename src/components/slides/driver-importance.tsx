"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, ORANGE, GREEN, PURPLE, MUTED,
  SQUARE_FACTORS, CATEGORY_LAYOUT,
  CATEGORY_TITLES, CATEGORY_NARRATION,
} from "./power-slide-data";
import { useShareMode } from "@/lib/share-context";

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 8;

type CategoryKey = "customer" | "product" | "order" | "market";
const REVEAL_ORDER: CategoryKey[] = ["customer", "product", "order", "market"];

const CATEGORY_COLORS: Record<string, string> = {
  customer: NAVY,
  product: ORANGE,
  order: PURPLE,
  market: GREEN,
};

const CATEGORY_REMOVALS: Record<CategoryKey, Set<string>> = {
  customer: new Set(["Sales Rep", "Customer size", "Customer channel"]),
  product: new Set(["Product family", "Product Specialization", "Cost to serve", "Willingness to pay", "Price sensitivity"]),
  order: new Set(["Order size", "Lead time", "Contract type", "Seasonality", "Payment terms"]),
  market: new Set(["Market share", "Commodity index", "Industry trends", "Competitor activity"]),
};

interface CategoryNarrative {
  supertitle: string;
  headline: string;
  detail: string;
  color: string;
  dismissLine: string;
}

const CATEGORY_NARRATIVES: CategoryNarrative[] = [
  {
    supertitle: "Keeping these factors",
    headline: "End Market, Geography & Customer Tenure",
    detail: "These attributes explain price variance — they stay to drive segmentation.",
    color: NAVY,
    dismissLine: "Sales Rep is behavioral — not a pricing driver. Removing the rest.",
  },
  {
    supertitle: "Adding a factor",
    headline: "Product Importance",
    detail: "Captures how price-sensitive a product is within a customer. Product Category also stays.",
    color: TEAL,
    dismissLine: "The remaining product factors add noise, not signal.",
  },
  {
    supertitle: "Keeping this factor",
    headline: "Order Frequency",
    detail: "How often a customer orders correlates with loyalty and price tolerance — the strongest order-level signal.",
    color: PURPLE,
    dismissLine: "Other order attributes are too noisy for this model.",
  },
  {
    supertitle: "Adding a factor",
    headline: "Competitor Pricing",
    detail: "Low variance, but acts as a final positioning check — keeping the model's price in a competitive range.",
    color: GREEN,
    dismissLine: "The remaining market factors don't move the needle here.",
  },
];

const IMPORTANCE: Record<string, number> = {
  "Sales Rep": 15.2,
  "End Market": 13.6,
  "Product Category": 11.8,
  "Geography": 10.4,
  "Customer Tenure": 8.8,
  "Order Frequency": 7.6,
  "Product Specialization": 6.4,
  "Customer size": 5.8,
  "Customer channel": 5.0,
  "Product Importance": 4.6,
  "Seasonality": 4.0,
  "Product family": 3.4,
  "Order size": 3.0,
  "Cost to serve": 2.6,
  "Market share": 2.2,
  "Willingness to pay": 1.8,
  "Competitor Pricing": 1.6,
  "Industry trends": 1.4,
  "Commodity index": 1.2,
  "Lead time": 1.0,
  "Contract type": 0.8,
  "Payment terms": 0.6,
  "Price sensitivity": 0.4,
  "Competitor activity": 0.2,
};

const ALL_FACTORS = SQUARE_FACTORS
  .filter(f => f.label in IMPORTANCE)
  .map(f => ({ label: f.label, category: f.category, value: IMPORTANCE[f.label] ?? 0 }))
  .sort((a, b) => b.value - a.value);

const MAX_VALUE = ALL_FACTORS[0].value;
const FINAL_DRIVERS = [
  { label: "Product Category", category: "product", value: 11.8 },
  { label: "Geography", category: "customer", value: 10.4 },
  { label: "End Market", category: "customer", value: 13.6 },
  { label: "Product Importance", category: "product", value: 4.6 },
  { label: "Order Frequency", category: "order", value: 7.6 },
  { label: "Customer Tenure", category: "customer", value: 8.8 },
  { label: "Competitor Pricing", category: "market", value: 1.6 },
];

const BAR_MAX_W = 340;
const ROW_H = 20;
const HEADER_H = 10;

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
  const isCollapse = step === 7;
  const isConsolidated = step === 5 || step === 6;
  const isDrivers = step === 6;
  const isIntro = step === 0;
  const isChart = step >= 1 && step <= 4;
  const categoryIndex = isChart ? step - 1 : -1;
  const activeCategory = isChart ? REVEAL_ORDER[categoryIndex] : null;

  /* Auto-phase 1: after bars animate in, reveal keep/add annotations */
  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation && isChart);
  useEffect(() => {
    if (!isActive || !isChart) { setActionRevealed(false); return; }
    if (skipAnimation || shareMode) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 1200);
    return () => clearTimeout(t);
  }, [isActive, step, skipAnimation, isChart]);

  /* Phase 2: secondPhase (900ms after phase 1) → remove items (or market keep) */
  const [secondPhase, setSecondPhase] = useState(!!skipAnimation);
  useEffect(() => {
    if (!actionRevealed) { setSecondPhase(false); return; }
    if (skipAnimation || shareMode) { setSecondPhase(true); return; }
    setSecondPhase(false);
    const t = setTimeout(() => setSecondPhase(true), 900);
    return () => clearTimeout(t);
  }, [actionRevealed, skipAnimation]);

  const removedSet = useMemo(() => {
    const set = new Set<string>();
    if (isConsolidated || isCollapse) {
      for (const cat of REVEAL_ORDER) CATEGORY_REMOVALS[cat].forEach(l => set.add(l));
    } else {
      for (let i = 0; i < categoryIndex; i++) {
        CATEGORY_REMOVALS[REVEAL_ORDER[i]].forEach(l => set.add(l));
      }
    }
    return set;
  }, [categoryIndex, isConsolidated, isCollapse]);

  const visibleFactors = useMemo(() => {
    if (isConsolidated || isCollapse) {
      const allRemovals = new Set<string>();
      for (const cat of REVEAL_ORDER) CATEGORY_REMOVALS[cat].forEach(l => allRemovals.add(l));
      return ALL_FACTORS.filter(f => !allRemovals.has(f.label));
    }
    const productRevealed = categoryIndex >= 1 && (categoryIndex > 1 || actionRevealed);
    const marketRevealed = categoryIndex === 3 && actionRevealed;
    return ALL_FACTORS.filter(f => {
      if (f.label === "Product Importance" && !productRevealed) return false;
      if (f.label === "Competitor Pricing" && !marketRevealed) return false;
      return true;
    });
  }, [isConsolidated, isCollapse, categoryIndex, actionRevealed]);

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
      if (!secondPhase) return;
      const t = setTimeout(() => setClickReady(true), 600);
      return () => clearTimeout(t);
    }
    if (step === 5) {
      const t = setTimeout(() => setClickReady(true), 800);
      return () => clearTimeout(t);
    }
  }, [isActive, isIntro, introPhase, isChart, secondPhase, isDrivers, isCollapse, skipAnimation, step]);

  /* Auto-advance through category steps (1→2→3→4→5) */
  useEffect(() => {
    if (!isActive || !isChart || !onAutoAdvance) return;
    if (!secondPhase) return;
    const t = setTimeout(() => onAutoAdvance(), 3200);
    return () => clearTimeout(t);
  }, [isActive, isChart, secondPhase, onAutoAdvance]);

  function getDisposition(f: { label: string; category: string }): Disposition | null {
    const catKey = f.category as CategoryKey;
    const catStep = REVEAL_ORDER.indexOf(catKey);
    if (catStep !== categoryIndex || !actionRevealed) return null;
    if (CATEGORY_REMOVALS[catKey].has(f.label)) return secondPhase ? "remove" : null;
    if (catKey === "product" && f.label === "Product Importance") return "add";
    if (catKey === "market" && f.label === "Competitor Pricing") return "add";
    return "keep";
  }

  const annotated = visibleFactors
    .map((f, i) => ({ ...f, index: i, disposition: getDisposition(f) }))
    .filter(t => t.disposition !== null);

  const hasAnnotations = annotated.length > 0;

  const narrative = categoryIndex >= 0 ? CATEGORY_NARRATIVES[categoryIndex] : null;

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
        style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
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
                key={`cat-${categoryIndex}`}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: CATEGORY_LAYOUT[categoryIndex].color }}
                >
                  {CATEGORY_TITLES[categoryIndex]}
                </h2>
                <span className="text-[0.95rem] leading-relaxed" style={{ color: MUTED }}>
                  {CATEGORY_NARRATION[categoryIndex]}
                </span>
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
                      <motion.span
                        className="absolute font-semibold uppercase"
                        style={{
                          color: MUTED,
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          left: isConsolidated ? 210 : 162,
                          top: 4,
                          opacity: 0,
                        }}
                        initial={skipAnimation ? { opacity: 0.35 } : { opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        Variance %
                      </motion.span>
                      <AnimatePresence>
                      {visibleFactors.map((f, i) => {
                        const disposition = getDisposition(f);
                        const color = CATEGORY_COLORS[f.category] ?? MUTED;
                        const catStep = REVEAL_ORDER.indexOf(f.category as CategoryKey);
                        const isPast = catStep < categoryIndex;
                        const isFuture = isChart && catStep > categoryIndex;
                        const isPastRemoved = isPast && removedSet.has(f.label);
                        const isAnnotated = disposition !== null;

                        const isRemove = disposition === "remove";
                        const isKeep = disposition === "keep";
                        const isAdd = disposition === "add";

                        const catKey = f.category as CategoryKey;
                        const isCurrentCat = isChart && catStep === categoryIndex;
                        const isActiveCategory = catKey === activeCategory && actionRevealed;
                        const willBeRemoved = isActiveCategory && CATEGORY_REMOVALS[catKey]?.has(f.label);
                        const willBeKept = isActiveCategory && !CATEGORY_REMOVALS[catKey]?.has(f.label) && !isAdd;
                        const showColor = isCurrentCat || isConsolidated;

                        const barColor = isRemove ? `${MUTED}60`
                          : isPastRemoved ? `${MUTED}30`
                          : isAdd ? TEAL
                          : (isKeep || willBeKept) ? GREEN
                          : showColor ? color
                          : `${MUTED}40`;
                        const effectiveBarMax = showDriverCards ? BAR_MAX_W : isConsolidated ? 520 : BAR_MAX_W;
                        const barW = (f.value / MAX_VALUE) * effectiveBarMax;

                        const driverCatIdx = REVEAL_ORDER.indexOf(f.category as CategoryKey);
                        const opacity = showDriverCards
                          ? (driverCatIdx === driverHighlight - 1 ? 1
                            : driverCatIdx < driverHighlight ? 0.6
                            : 0.15)
                          : isPastRemoved ? 0.15
                          : isPast ? 0.5
                          : isFuture ? 0.2
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
                                fontWeight: (isAnnotated || willBeKept || (willBeRemoved && secondPhase)) ? 700 : isCurrentCat ? 600 : 500,
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

                              <motion.span
                                className={`ml-2 font-semibold shrink-0 ${isConsolidated ? "text-[15px]" : "text-[12px]"}`}
                                style={{
                                  color: isPastRemoved ? `${MUTED}60`
                                    : (isRemove || (willBeRemoved && secondPhase)) ? `${MUTED}80`
                                    : isAdd ? TEAL
                                    : (isKeep || willBeKept) ? GREEN
                                    : showColor ? color
                                    : MUTED,
                                  transition: "color 0.4s",
                                }}
                                initial={skipAnimation ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: skipAnimation ? 0 : 0.3 + i * 0.03 }}
                              >
                                {f.value}
                              </motion.span>

                              <AnimatePresence>
                                {((isKeep || isAdd) || (isPast && !isPastRemoved)) && (
                                  <motion.span
                                    key={`icon-${f.label}-${disposition ?? "past"}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: isAdd ? 20 : 16, height: isAdd ? 20 : 16,
                                      backgroundColor:
                                        isPast && !isAnnotated ? `${GREEN}20`
                                        : isAdd ? TEAL
                                        : `${GREEN}`,
                                      color:
                                        isPast && !isAnnotated ? GREEN
                                        : "#fff",
                                      fontSize: isAdd ? 13 : 9, fontWeight: 900, lineHeight: 1,
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: (isPast && !isAnnotated) ? 0.6 : 1, scale: 1 }}
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

                {/* Right column: annotation cards (steps 1-4) or driver category cards (consolidated auto-phase) */}
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
                        {REVEAL_ORDER.map((cat, ci) => {
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
                </>) : !isConsolidated ? (
                <div
                  className="w-[320px] shrink-0 flex flex-col justify-center"
                  style={{ minHeight: visibleFactors.length * ROW_H + 30 }}
                >
                  <AnimatePresence mode="wait">
                    {hasAnnotations && narrative && (
                      <motion.div
                        key={`narrative-${categoryIndex}`}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.45, delay: 0.3, ease: EASE }}
                      >
                        <NarrativeBlock narrative={narrative} showDismiss={secondPhase} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                ) : null}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {((clickReady && !isChart) || driverClickReady) && (
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

function NarrativeBlock({ narrative, showDismiss }: { narrative: CategoryNarrative; showDismiss: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2 block"
          style={{ color: `${narrative.color}90` }}
        >
          {narrative.supertitle}
        </span>
        <h3 className="text-[20px] font-bold leading-snug mb-3" style={{ color: narrative.color }}>
          {narrative.headline}
        </h3>
        <p className="text-[15px] font-medium leading-relaxed" style={{ color: NAVY, opacity: 0.7 }}>
          {narrative.detail}
        </p>
      </div>
      {showDismiss && (
        <motion.p
          className="text-[13px] font-medium leading-relaxed"
          style={{ color: MUTED, borderTop: `1px dashed ${MUTED}30`, paddingTop: 12 }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {narrative.dismissLine}
        </motion.p>
      )}
    </div>
  );
}
