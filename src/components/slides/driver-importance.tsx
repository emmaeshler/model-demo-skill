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

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 7;

type CategoryKey = "customer" | "product" | "order" | "market";
const REVEAL_ORDER: CategoryKey[] = ["customer", "product", "order", "market"];

const CATEGORY_COLORS: Record<string, string> = {
  customer: NAVY,
  product: ORANGE,
  order: PURPLE,
  market: GREEN,
};

const CATEGORY_REMOVALS: Record<CategoryKey, Set<string>> = {
  customer: new Set(["Sales rep", "Customer tenure", "Region"]),
  product: new Set(["Cost to serve", "Willingness to pay", "Price sensitivity"]),
  order: new Set(["Lead time", "Contract type", "Seasonality"]),
  market: new Set([]),
};

const MARKET_ADD_FACTOR = "Competitive price point";

type ActionHint = { icon: string; color: string; headline: string; detail: string };
type CategoryHints = { keep: ActionHint; remove?: ActionHint; add?: ActionHint };

const CATEGORY_HINTS: CategoryHints[] = [
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "End market, size of customer, and channel are meaningful drivers." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Sales rep, tenure, and region don't move the needle — removing them." },
  },
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "Specialization, mix, and product family are the top product drivers." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Cost to serve, willingness to pay, and price sensitivity are too minor." },
  },
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "Frequency and order size matter most for this customer." },
    remove: { icon: "×", color: MUTED, headline: "Not considering", detail: "Lead time, contract type, and seasonality don't apply." },
  },
  {
    keep: { icon: "✓", color: TEAL, headline: "Keeping", detail: "Commodity index, share, trends, and competitor activity are core market signals." },
    add: { icon: "+", color: GREEN, headline: "Adding", detail: "Competitive price point is critical in this market — adding it to the model." },
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

const SKEL_LABEL_W = [80, 110, 95, 70, 85, 100, 90, 75, 65, 80, 70, 60, 55, 90, 100, 45, 85, 55, 75, 70, 80, 55, 65];

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
    if (isConsolidated || isDriverCards) {
      for (const cat of REVEAL_ORDER) CATEGORY_REMOVALS[cat].forEach(l => set.add(l));
    } else {
      for (let i = 0; i < categoryIndex; i++) {
        CATEGORY_REMOVALS[REVEAL_ORDER[i]].forEach(l => set.add(l));
      }
    }
    return set;
  }, [categoryIndex, isConsolidated, isDriverCards]);

  const revealedSet = useMemo(
    () => new Set(isIntro ? [] : (isConsolidated || isDriverCards) ? REVEAL_ORDER : REVEAL_ORDER.slice(0, categoryIndex + 1)),
    [isIntro, categoryIndex, isConsolidated, isDriverCards],
  );

  const visibleFactors = useMemo(() => {
    if (isIntro) return ALL_FACTORS;
    return ALL_FACTORS.filter(f => {
      if (!revealedSet.has(f.category)) return false;
      if (removedSet.has(f.label)) return false;
      if (f.label === MARKET_ADD_FACTOR && f.category === activeCategory && !actionRevealed) return false;
      return true;
    });
  }, [isIntro, revealedSet, removedSet, activeCategory, actionRevealed]);

  const [clickReady, setClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || isDriverCards) { setClickReady(false); return; }
    if (skipAnimation || shareMode) { setClickReady(true); return; }
    setClickReady(false);
    if (isIntro) {
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
  }, [isActive, isIntro, isChart, secondPhase, isDriverCards, isConsolidated, skipAnimation, step]);

  function getDisposition(f: { label: string; category: string }): Disposition | null {
    const catKey = f.category as CategoryKey;
    const catStep = REVEAL_ORDER.indexOf(catKey);
    if (catStep !== categoryIndex || !actionRevealed) return null;
    // Market: add is phase 1, keep is phase 2
    if (f.label === MARKET_ADD_FACTOR && catKey === "market") return "add";
    if (catKey === "market") return secondPhase ? "keep" : null;
    // All others: keep is phase 1, remove is phase 2
    if (CATEGORY_REMOVALS[catKey].has(f.label)) return secondPhase ? "remove" : null;
    return "keep";
  }

  const annotated = visibleFactors
    .map((f, i) => ({ ...f, index: i, disposition: getDisposition(f) }))
    .filter(t => t.disposition !== null);

  const keepTargets = annotated.filter(t => t.disposition === "keep");
  const removeTargets = annotated.filter(t => t.disposition === "remove");
  const addTargets = annotated.filter(t => t.disposition === "add");
  const hasAnnotations = annotated.length > 0;

  const centerY = (targets: typeof annotated) => {
    if (targets.length === 0) return 0;
    const first = targets[0].index;
    const last = targets[targets.length - 1].index;
    return HEADER_H + ((first + last) / 2) * ROW_H + ROW_H / 2;
  };

  const hints = categoryIndex >= 0 ? CATEGORY_HINTS[categoryIndex] : null;

  const CARD_H = 110;
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

  useEffect(() => {
    if (!driverClickReady || !onAutoAdvance) return;
    if (skipAnimation) { onAutoAdvance(); return; }
    const t = setTimeout(onAutoAdvance, 1500);
    return () => clearTimeout(t);
  }, [driverClickReady, onAutoAdvance, skipAnimation]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* Title */}
      <div
        className="relative w-full"
        style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <AnimatePresence mode="wait">
            {isConsolidated ? (
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
                  13 factors refined from 22 — tuned to your business.
                </p>
              </motion.div>
            ) : isIntro ? (
              <motion.div
                key="intro"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
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
                  13 factors grouped into 4 categories that drive your pricing model.
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
            <motion.div
              key="chart-content"
              className="absolute inset-0 flex justify-center"
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
            >
              <div className="w-full max-w-5xl flex gap-3 relative">
                {/* Bar chart column */}
                <motion.div
                  className="flex-1 min-w-0"
                  animate={{ opacity: driversDone ? 0 : 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ pointerEvents: driversDone ? "none" : "auto" }}
                >
                  <motion.div
                    className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTED, paddingLeft: 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: isIntro ? 0 : 0.5 }}
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
                        const isAnnotated = disposition !== null;

                        const isRemove = disposition === "remove";
                        const isAdd = disposition === "add";
                        const isKeep = disposition === "keep";

                        const catKey = f.category as CategoryKey;
                        const isActiveCategory = catKey === activeCategory && actionRevealed;
                        const willBeRemoved = isActiveCategory && CATEGORY_REMOVALS[catKey]?.has(f.label);
                        const willBeKept = isActiveCategory && !CATEGORY_REMOVALS[catKey]?.has(f.label) && f.label !== MARKET_ADD_FACTOR;

                        const skelBar = isIntro;
                        const barColor = skelBar ? `${MUTED}22` : isRemove ? `${MUTED}60` : (isKeep || willBeKept) ? GREEN : color;
                        const barW = (f.value / MAX_VALUE) * BAR_MAX_W;

                        const driverCatIdx = REVEAL_ORDER.indexOf(f.category as CategoryKey);
                        const opacity = skelBar ? 1
                          : isDriverCards
                          ? (driverHighlight === 0 ? 0.3
                            : driverCatIdx === driverHighlight - 1 ? 1
                            : driverCatIdx < driverHighlight ? 0.6
                            : 0.15)
                          : hasAnnotations
                          ? (isAnnotated ? 1 : willBeRemoved && secondPhase ? 0.12 : willBeRemoved ? 1 : 0.12)
                          : (isPast ? 0.25 : 1);

                        return (
                          <motion.div
                            key={f.label}
                            layoutId={`di-${f.label}`}
                            layout="position"
                            className="flex items-center"
                            style={{ height: 22, marginBottom: 2 }}
                            initial={skipAnimation ? false : { opacity: 0, x: skelBar ? 0 : -20 }}
                            animate={{ opacity, x: 0 }}
                            exit={{ opacity: 0, x: -10, transition: { duration: 0.3 } }}
                            transition={{
                              opacity: { duration: 0.4 },
                              x: { duration: 0.5, delay: skipAnimation ? 0 : i * 0.03, ease: EASE },
                              layout: { duration: 0.5, ease: EASE },
                            }}
                          >
                            {/* Label: placeholder block on intro, real text otherwise */}
                            {skelBar ? (
                              <span className="shrink-0 flex justify-end pr-3" style={{ width: 170 }}>
                                <motion.span
                                  className="rounded-sm overflow-hidden relative"
                                  style={{ height: 11, backgroundColor: `${MUTED}30` }}
                                  initial={skipAnimation ? { width: SKEL_LABEL_W[i] } : { width: 0, opacity: 0 }}
                                  animate={{ width: SKEL_LABEL_W[i], opacity: 1 }}
                                  transition={{
                                    width: { duration: 0.4, delay: 0.2 + i * 0.04, ease: EASE },
                                    opacity: { duration: 0.4, delay: 0.2 + i * 0.04 },
                                  }}
                                >
                                  <motion.span
                                    className="absolute inset-0 block"
                                    style={{ background: `linear-gradient(90deg, transparent 0%, ${MUTED}25 50%, transparent 100%)` }}
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.8, delay: 0.6 + i * 0.06, repeat: shareMode ? 0 : Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
                                  />
                                </motion.span>
                              </span>
                            ) : (
                              <motion.span
                                className="shrink-0 text-right text-[13px] pr-3 relative inline-flex justify-end"
                                style={{
                                  width: 170,
                                  color: (isRemove || (willBeRemoved && secondPhase)) ? RED : (isKeep || willBeKept) ? GREEN : isAdd ? GREEN : color,
                                  fontWeight: (isAnnotated || willBeKept || (willBeRemoved && secondPhase)) ? 700 : isPast ? 500 : 600,
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
                                    {isRemove && (
                                      <motion.span
                                        className="absolute left-0 right-0 top-1/2"
                                        style={{ height: 1, backgroundColor: `${MUTED}70`, transformOrigin: "left" }}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        transition={{ duration: 0.35, delay: 0.3, ease: EASE }}
                                      />
                                    )}
                                  </AnimatePresence>
                                </span>
                              </motion.span>
                            )}

                            <div className="relative flex items-center" style={{ flex: 1, height: "100%" }}>
                              <motion.div
                                className="rounded-r-sm overflow-hidden relative"
                                style={{ height: "100%" }}
                                initial={skipAnimation ? { width: barW, backgroundColor: barColor } : { width: 0, backgroundColor: barColor }}
                                animate={{ width: barW, backgroundColor: barColor }}
                                transition={{
                                  width: { duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : 0.15 + i * 0.03, ease: EASE },
                                  backgroundColor: { duration: 0.4, ease: EASE },
                                }}
                              >
                                {skelBar && (
                                  <motion.span
                                    className="absolute inset-0 block"
                                    style={{ background: `linear-gradient(90deg, transparent 0%, ${MUTED}20 50%, transparent 100%)` }}
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 2, delay: 0.8 + i * 0.08, repeat: shareMode ? 0 : Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
                                  />
                                )}
                              </motion.div>

                              {!skelBar && (
                                <motion.span
                                  className="ml-2 text-[12px] font-semibold shrink-0"
                                  style={{
                                    color: (isRemove || (willBeRemoved && secondPhase)) ? RED : (isKeep || willBeKept) ? GREEN : isAdd ? GREEN : color,
                                    transition: "color 0.4s",
                                  }}
                                  initial={skipAnimation ? false : { opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: skipAnimation ? 0 : 0.3 + i * 0.03 }}
                                >
                                  {f.value}
                                </motion.span>
                              )}

                              <AnimatePresence>
                                {!skelBar && (isAnnotated || isPast) && (
                                  <motion.span
                                    key={`icon-${f.label}-${disposition ?? "past"}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: 16, height: 16,
                                      backgroundColor:
                                        isPast && !isAnnotated ? `${GREEN}20`
                                        : isRemove ? `${RED}25`
                                        : `${GREEN}`,
                                      color:
                                        isPast && !isAnnotated ? GREEN
                                        : isRemove ? RED
                                        : "#fff",
                                      fontSize: 9, fontWeight: 900, lineHeight: 1,
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: isPast && !isAnnotated ? 0.6 : 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={
                                      isAnnotated
                                        ? { delay: 0.2, duration: 0.3, type: "spring", stiffness: 300 }
                                        : { duration: 0.3 }
                                    }
                                  >
                                    {isRemove ? "×" : isAdd ? "+" : "✓"}
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
                    className="mt-3 text-[11px] font-medium leading-relaxed"
                    style={{ color: `${MUTED}90`, paddingLeft: 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: isIntro ? 0 : 0.5 }}
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
                        4 driver categories powering your model
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
                  className="w-[260px] shrink-0 relative"
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

function CalloutCard({ hint }: { hint: ActionHint }) {
  return (
    <div>
      <div
        className="rounded-lg py-3 pl-4 pr-3"
        style={{
          borderLeft: `3px solid ${hint.icon === "✓" ? GREEN : hint.icon === "×" ? RED : hint.color}`,
          backgroundColor: hint.icon === "✓" ? `${GREEN}15` : hint.icon === "×" ? `${RED}15` : `${hint.color}08`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 22, height: 22,
              backgroundColor: hint.icon === "✓" ? GREEN : hint.icon === "×" ? `${RED}15` : `${hint.color}15`,
              color: hint.icon === "✓" ? "#fff" : hint.icon === "×" ? RED : hint.color,
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}
          >
            {hint.icon}
          </span>
          <span className="text-[14px] font-bold" style={{ color: hint.icon === "✓" ? "#15803d" : hint.icon === "×" ? RED : hint.color }}>
            {hint.headline}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed" style={{ color: MUTED }}>
          {hint.detail}
        </p>
      </div>
    </div>
  );
}
