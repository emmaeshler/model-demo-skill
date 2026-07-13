"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, ORANGE, GREEN, PURPLE, MUTED,
  SQUARE_FACTORS, CATEGORY_LAYOUT,
  CATEGORY_TITLES, CATEGORY_NARRATION,
} from "./power-slide-data";
import { useShareMode } from "@/lib/share-context";

const RED = "#DC2626";

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
  customer: new Set(["Customer channel", "Sales rep", "Region", "Size of customer", "Customer tenure"]),
  product: new Set(["Product family", "Cost to serve", "Willingness to pay", "Price sensitivity"]),
  order: new Set(["Order size", "Lead time", "Contract type", "Seasonality"]),
  market: new Set(["Market share", "Commodity index", "Industry trends", "Competitor activity"]),
};

type ActionHint = { icon: string; color: string; headline: string; detail: string };
type CategoryHints = { keep?: ActionHint; remove?: ActionHint; add?: ActionHint };

const CATEGORY_HINTS: CategoryHints[] = [
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "End market drives pricing here." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Too minor to move the needle." },
  },
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "Key profitability drivers." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Minimal impact on pricing." },
  },
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "Strongest order-level signal." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Not relevant for this customer." },
  },
  {
    add: { icon: "+", color: GREEN, headline: "Adding", detail: "Critical competitive signal." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Too minor for this model." },
  },
];

const IMPORTANCE: Record<string, number> = {
  "End market": 16.2,
  "Product specialization": 12.1,
  "Competitive price point": 10.4,
  "Order frequency": 8.8,
  "Product mix": 7.6,
  "Size of customer": 6.2,
  "Customer channel": 5.4,
  "Commodity index": 4.8,
  "Market share": 4.2,
  "Product family": 3.6,
  "Cost to serve": 3.0,
  "Industry trends": 2.6,
  "Order size": 2.4,
  "Customer tenure": 2.0,
  "Willingness to pay": 1.8,
  "Region": 1.6,
  "Competitor activity": 1.4,
  "Lead time": 1.2,
  "Contract type": 1.0,
  "Price sensitivity": 0.6,
  "Sales rep": 0.4,
  "Seasonality": 0.2,
};

const ALL_FACTORS = SQUARE_FACTORS
  .filter(f => f.label in IMPORTANCE)
  .map(f => ({ label: f.label, category: f.category, value: IMPORTANCE[f.label] ?? 0 }))
  .sort((a, b) => b.value - a.value);

const MAX_VALUE = ALL_FACTORS[0].value;
const BAR_MAX_W = 340;
const ROW_H = 24;
const HEADER_H = 26;

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
  const isCollapse = step === 7;
  const isDriverCards = step === 6;
  const isConsolidated = step === 5;
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
    if (isConsolidated || isDriverCards || isCollapse) {
      for (const cat of REVEAL_ORDER) CATEGORY_REMOVALS[cat].forEach(l => set.add(l));
    } else {
      for (let i = 0; i < categoryIndex; i++) {
        CATEGORY_REMOVALS[REVEAL_ORDER[i]].forEach(l => set.add(l));
      }
    }
    return set;
  }, [categoryIndex, isConsolidated, isDriverCards, isCollapse]);

  const visibleFactors = useMemo(() => {
    if (isConsolidated || isDriverCards || isCollapse) {
      const allRemovals = new Set<string>();
      for (const cat of REVEAL_ORDER) CATEGORY_REMOVALS[cat].forEach(l => allRemovals.add(l));
      return ALL_FACTORS.filter(f => !allRemovals.has(f.label));
    }
    const marketRevealed = categoryIndex === 3 && actionRevealed;
    return ALL_FACTORS.filter(f => {
      if (f.label === "Competitive price point" && !marketRevealed) return false;
      return true;
    });
  }, [isConsolidated, isDriverCards, isCollapse, categoryIndex, actionRevealed]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 1 : 0);
  useEffect(() => {
    if (!isActive || !isIntro) { setIntroPhase(skipAnimation ? 1 : 0); return; }
    if (skipAnimation || shareMode) { setIntroPhase(1); return; }
    setIntroPhase(0);
    const t = setTimeout(() => setIntroPhase(1), 2200);
    return () => clearTimeout(t);
  }, [isActive, isIntro, skipAnimation, shareMode]);

  const [clickReady, setClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || isDriverCards || isCollapse) { setClickReady(false); return; }
    if (skipAnimation || shareMode) { setClickReady(true); return; }
    setClickReady(false);
    if (isIntro) {
      if (introPhase < 1) return;
      const t = setTimeout(() => setClickReady(true), 800);
      return () => clearTimeout(t);
    }
    if (isChart) {
      if (!secondPhase) return;
      const t = setTimeout(() => setClickReady(true), 600);
      return () => clearTimeout(t);
    }
    if (isConsolidated) {
      const t = setTimeout(() => setClickReady(true), 800);
      return () => clearTimeout(t);
    }
  }, [isActive, isIntro, introPhase, isChart, secondPhase, isDriverCards, isConsolidated, skipAnimation, step]);

  useEffect(() => {
    if (!isActive || !isChart || !secondPhase) return;
    if (skipAnimation || shareMode) { onAutoAdvance?.(); return; }
    const t = setTimeout(() => onAutoAdvance?.(), 1800);
    return () => clearTimeout(t);
  }, [isActive, isChart, secondPhase, skipAnimation, shareMode, onAutoAdvance]);

  function getDisposition(f: { label: string; category: string }): Disposition | null {
    const catKey = f.category as CategoryKey;
    const catStep = REVEAL_ORDER.indexOf(catKey);
    if (catStep !== categoryIndex || !actionRevealed) return null;
    if (CATEGORY_REMOVALS[catKey].has(f.label)) return secondPhase ? "remove" : null;
    if (catKey === "market" && f.label === "Competitive price point") return "add";
    return "keep";
  }

  const annotated = visibleFactors
    .map((f, i) => ({ ...f, index: i, disposition: getDisposition(f) }))
    .filter(t => t.disposition !== null);

  const keepTargets = annotated.filter(t => t.disposition === "keep");
  const removeTargets = annotated.filter(t => t.disposition === "remove");
  const addTargets = annotated.filter(t => t.disposition === "add");
  const hasAnnotations = annotated.length > 0;

  const hints = categoryIndex >= 0 ? CATEGORY_HINTS[categoryIndex] : null;

  const CARD_H = 130;
  const CARD_GAP = 12;

  const chartH = HEADER_H + visibleFactors.length * ROW_H;

  const cards: { key: string; hint: ActionHint | undefined; top: number; targets: typeof annotated }[] = [];

  if (hints?.add && addTargets.length > 0)
    cards.push({ key: `add-${categoryIndex}`, hint: hints.add, top: 0, targets: addTargets });
  if (hints?.keep && keepTargets.length > 0)
    cards.push({ key: `keep-${categoryIndex}`, hint: hints.keep, top: 0, targets: keepTargets });
  if (hints?.remove && removeTargets.length > 0)
    cards.push({ key: `remove-${categoryIndex}`, hint: hints.remove, top: 0, targets: removeTargets });

  const totalCardsH = cards.length * CARD_H + Math.max(0, cards.length - 1) * CARD_GAP;
  const startY = Math.max(0, (chartH - totalCardsH) / 2);
  cards.forEach((c, i) => {
    c.top = startY + i * (CARD_H + CARD_GAP);
  });

  // 0 = waiting, 1 = customer, 2 = product, 3 = order, 4 = market (all shown)
  const [driverHighlight, setDriverHighlight] = useState(0);
  const [driversDone, setDriversDone] = useState(!!skipAnimation);
  const [driverClickReady, setDriverClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || !isDriverCards) { setDriverHighlight(0); setDriversDone(false); setDriverClickReady(false); return; }
    if (skipAnimation || shareMode) { setDriverHighlight(4); setDriversDone(true); setDriverClickReady(true); return; }
    setDriverHighlight(0);
    setDriversDone(false);
    setDriverClickReady(false);
    const timers = [
      setTimeout(() => setDriverHighlight(1), 500),
      setTimeout(() => setDriverHighlight(2), 1300),
      setTimeout(() => setDriverHighlight(3), 2100),
      setTimeout(() => setDriverHighlight(4), 2900),
      setTimeout(() => setDriversDone(true), 3600),
      setTimeout(() => setDriverClickReady(true), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isActive, isDriverCards, skipAnimation, shareMode]);

  const [collapsePhase, setCollapsePhase] = useState(0);
  useEffect(() => {
    if (!isActive || !isCollapse) { setCollapsePhase(0); return; }
    if (skipAnimation && onAutoAdvance) { onAutoAdvance(); return; }
    if (shareMode) { setCollapsePhase(3); onAutoAdvance?.(); return; }
    setCollapsePhase(0);
    const t1 = setTimeout(() => setCollapsePhase(1), 50);
    const t2 = setTimeout(() => setCollapsePhase(2), 800);
    const t3 = setTimeout(() => {
      setCollapsePhase(3);
      onAutoAdvance?.();
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive, isCollapse, skipAnimation, onAutoAdvance, shareMode]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pl-16 pt-4 relative">
      {/* Title */}
      <div
        className="relative w-full"
        style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <AnimatePresence mode="wait">
            {isCollapse ? (
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
            ) : isConsolidated ? (
              <motion.div
                key="consolidated"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                  Your model factors
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  5 drivers refined from 22 — tuned to your business.
                </p>
              </motion.div>
            ) : isIntro ? (
              <motion.div
                key="intro"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: introPhase >= 1 ? 1 : 0, y: introPhase >= 1 ? 0 : 10 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                  Pricing factors across four dimensions
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  We analyze what matters most to you — elevating key factors, removing what doesn&rsquo;t apply, and tuning the balance.
                </p>
              </motion.div>
            ) : isDriverCards ? (
              <motion.div
                key="driver-cards"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                  Your model drivers
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  5 drivers across 4 dimensions powering your pricing model.
                </p>
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
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.3 } }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <CollapseView
                phase={collapsePhase}
                skipAnimation={skipAnimation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chart-content"
              className={`absolute inset-0 flex justify-center ${isConsolidated ? "items-start pt-4" : ""}`}
              initial={isIntro && !skipAnimation ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: isIntro && introPhase < 1 ? 0 : 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className={`w-full max-w-5xl flex gap-3 relative ${isConsolidated ? "pl-12" : ""}`}>
                {/* Bar chart column */}
                <motion.div
                  className="flex-1 min-w-0"
                  animate={{ opacity: driversDone ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ pointerEvents: driversDone ? "none" : "auto" }}
                >
                  <motion.div
                    className={`mb-2 font-semibold uppercase ${isConsolidated ? "text-[11px] tracking-[0.12em]" : "text-[10px] tracking-[0.1em]"}`}
                    style={{ color: MUTED, paddingLeft: isConsolidated ? 228 : 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    Variance contribution (%)
                  </motion.div>

                  <LayoutGroup>
                    <div className="flex flex-col">
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
                        const showColor = isCurrentCat || isConsolidated || isDriverCards;

                        const barColor = isRemove ? `${MUTED}60`
                          : isPastRemoved ? `${MUTED}30`
                          : (isKeep || isAdd || willBeKept) ? GREEN
                          : showColor ? color
                          : `${MUTED}40`;
                        const effectiveBarMax = isConsolidated ? 520 : BAR_MAX_W;
                        const barW = (f.value / MAX_VALUE) * effectiveBarMax;

                        const driverCatIdx = REVEAL_ORDER.indexOf(f.category as CategoryKey);
                        const opacity = isDriverCards
                          ? (driverHighlight === 0 ? 0.3
                            : driverCatIdx === driverHighlight - 1 ? 1
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
                            style={{ height: isConsolidated ? 40 : 22, marginBottom: isConsolidated ? 8 : 2 }}
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
                                  : (isRemove || (willBeRemoved && secondPhase)) ? RED
                                  : (isKeep || isAdd || willBeKept) ? GREEN
                                  : showColor ? color
                                  : MUTED,
                                fontWeight: (isAnnotated || willBeKept || (willBeRemoved && secondPhase)) ? 700 : isCurrentCat ? 600 : 500,
                                transition: "color 0.4s, font-weight 0.4s",
                              }}
                              animate={isRemove ? { x: [0, -3, 4, -2, 1, 0] } : { x: 0 }}
                              transition={isRemove
                                ? { duration: 0.4, delay: 0.05, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                                : { duration: 0.3 }
                              }
                            >
                              <span className="relative inline-block">
                                {f.label}
                                <AnimatePresence>
                                  {(isRemove || isPastRemoved) && (
                                    <motion.span
                                      className="absolute left-0 right-0 top-1/2"
                                      style={{ height: 1, backgroundColor: `${MUTED}70`, transformOrigin: "left" }}
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
                                    : (isRemove || (willBeRemoved && secondPhase)) ? RED
                                    : (isKeep || isAdd || willBeKept) ? GREEN
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
                                {(isAnnotated || isPast) && (
                                  <motion.span
                                    key={`icon-${f.label}-${disposition ?? (isPastRemoved ? "past-rm" : "past")}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: 16, height: 16,
                                      backgroundColor:
                                        isPastRemoved ? `${RED}15`
                                        : isPast && !isAnnotated ? `${GREEN}20`
                                        : isRemove ? `${RED}25`
                                        : `${GREEN}`,
                                      color:
                                        isPastRemoved ? RED
                                        : isPast && !isAnnotated ? GREEN
                                        : isRemove ? RED
                                        : "#fff",
                                      fontSize: 9, fontWeight: 900, lineHeight: 1,
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
                                    {(isRemove || isPastRemoved) ? "×" : isAdd ? "+" : "✓"}
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

                {/* Right column: annotation cards (steps 1-4) or driver category cards (step 6) */}
                {isDriverCards ? (<>
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
                        5 drivers across 4 categories
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className={driversDone ? "grid grid-cols-2 gap-3 auto-rows-fr" : "flex flex-col gap-2"}>
                    {REVEAL_ORDER.map((cat, ci) => {
                      if (ci >= driverHighlight) return null;
                      const catFactors = visibleFactors.filter(f => f.category === cat);
                      return (
                        <motion.div
                          key={cat}
                          layout
                          className={driversDone ? "h-full" : ""}
                          initial={{ opacity: 0, x: 16, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ duration: 0.45, ease: EASE, layout: { duration: 0.5, ease: EASE } }}
                        >
                          <DriverCategoryCard
                            cat={cat}
                            factors={catFactors}
                            color={CATEGORY_COLORS[cat]}
                            expanded={driversDone}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
                </>) : !isConsolidated ? (
                <div
                  className="w-[300px] shrink-0 relative"
                  style={{ minHeight: visibleFactors.length * ROW_H + 30 }}
                >
                  <AnimatePresence>
                    {hasAnnotations && cards.map((c) => c.hint && (
                      <motion.div
                        key={c.key}
                        className="absolute left-0 right-0"
                        style={{ top: Math.max(0, c.top) }}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
                      >
                        <CalloutCard hint={c.hint} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                ) : null}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(clickReady || driverClickReady) && (
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

      {/* Main circle — matches execute slide exactly */}
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

function CalloutCard({ hint }: { hint: ActionHint }) {
  return (
    <div>
      <div
        className="rounded-xl py-5 pl-5 pr-4"
        style={{
          borderLeft: `4px solid ${hint.icon === "✓" ? GREEN : hint.icon === "×" ? RED : hint.color}`,
          backgroundColor: hint.icon === "✓" ? `${GREEN}15` : hint.icon === "×" ? `${RED}15` : `${hint.color}08`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 28, height: 28,
              backgroundColor: hint.icon === "✓" ? GREEN : hint.icon === "×" ? `${RED}15` : `${hint.color}15`,
              color: hint.icon === "✓" ? "#fff" : hint.icon === "×" ? RED : hint.color,
              fontSize: 15, fontWeight: 800, flexShrink: 0,
            }}
          >
            {hint.icon}
          </span>
          <span className="text-[17px] font-bold" style={{ color: hint.icon === "✓" ? "#15803d" : hint.icon === "×" ? RED : hint.color }}>
            {hint.headline}
          </span>
        </div>
        <p className="mt-2 text-[15px] font-medium leading-relaxed" style={{ color: MUTED }}>
          {hint.detail}
        </p>
      </div>
    </div>
  );
}
