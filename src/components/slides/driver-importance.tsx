"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, ORANGE, GREEN, PURPLE, MUTED,
  SQUARE_FACTORS, CATEGORY_LAYOUT,
  CATEGORY_TITLES, CATEGORY_NARRATION,
  SELECTED_FACTORS,
} from "./power-slide-data";

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 12;

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

const SKELETON_WIDTHS = [
  0.95, 0.78, 0.65, 0.58, 0.50, 0.44, 0.39, 0.34, 0.30, 0.26,
  0.22, 0.19, 0.17, 0.15, 0.13, 0.11, 0.10, 0.08, 0.07, 0.06,
  0.05, 0.04, 0.03,
];
const SKELETON_LABEL_W = [80, 110, 95, 70, 85, 100, 90, 75, 65, 80, 70, 60, 55, 90, 100, 45, 85, 55, 75, 70, 80, 55, 65];

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
  const isVortex = step === 11;
  const isSummary = step >= 9 && step <= 10;
  const summaryStep = isSummary ? step - 9 : (isVortex ? 1 : -1);
  const isIntro = step === 0;
  const isChart = !isIntro && !isSummary && !isVortex;
  const categoryIndex = isChart ? Math.floor((step - 1) / 2) : -1;
  const isActionPhase = isChart && (step - 1) % 2 === 1;
  const activeCategory = isChart ? REVEAL_ORDER[categoryIndex] : null;

  /* Phase 1: actionRevealed (600ms) → keep/add items appear */
  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation && isActionPhase);
  useEffect(() => {
    if (!isActive || !isActionPhase) { setActionRevealed(false); return; }
    if (skipAnimation) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 600);
    return () => clearTimeout(t);
  }, [isActive, step, skipAnimation, isActionPhase]);

  /* Phase 2: secondPhase (1s after phase 1) → remove items (or market keep) */
  const [secondPhase, setSecondPhase] = useState(!!skipAnimation);
  useEffect(() => {
    if (!actionRevealed) { setSecondPhase(false); return; }
    if (skipAnimation) { setSecondPhase(true); return; }
    setSecondPhase(false);
    const t = setTimeout(() => setSecondPhase(true), 2000);
    return () => clearTimeout(t);
  }, [actionRevealed, skipAnimation]);

  const removedSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < categoryIndex; i++) {
      CATEGORY_REMOVALS[REVEAL_ORDER[i]].forEach(l => set.add(l));
    }
    return set;
  }, [categoryIndex]);

  const revealedSet = useMemo(
    () => new Set(isIntro ? [] : REVEAL_ORDER.slice(0, categoryIndex + 1)),
    [isIntro, categoryIndex],
  );

  const visibleFactors = useMemo(() => {
    return ALL_FACTORS.filter(f => {
      if (!revealedSet.has(f.category)) return false;
      if (removedSet.has(f.label)) return false;
      if (f.label === MARKET_ADD_FACTOR && f.category === activeCategory && !actionRevealed) return false;
      return true;
    });
  }, [revealedSet, removedSet, activeCategory, actionRevealed]);

  function getDisposition(f: { label: string; category: string }): Disposition | null {
    const catKey = f.category as CategoryKey;
    const catStep = REVEAL_ORDER.indexOf(catKey);
    if (catStep !== categoryIndex || !isActionPhase || !actionRevealed) return null;
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

  const selectedSet = useMemo(() => new Set(SELECTED_FACTORS.map(f => f.label)), []);

  const allChipFactors = useMemo(() => {
    const allRemoved = new Set<string>();
    REVEAL_ORDER.forEach(cat => CATEGORY_REMOVALS[cat].forEach(l => allRemoved.add(l)));
    return SQUARE_FACTORS
      .filter(f => !allRemoved.has(f.label))
      .concat(
        SQUARE_FACTORS.some(f => f.label === MARKET_ADD_FACTOR) ? [] : [{ label: MARKET_ADD_FACTOR, category: "market" as const }]
      );
  }, []);

  const [chipsReady, setChipsReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || !(isSummary || isVortex)) { setChipsReady(false); return; }
    if (skipAnimation) { setChipsReady(true); return; }
    setChipsReady(false);
    const t = setTimeout(() => setChipsReady(true), 300);
    return () => clearTimeout(t);
  }, [isActive, isSummary, isVortex, skipAnimation]);

  const [vortexPhase, setVortexPhase] = useState(0);
  useEffect(() => {
    if (!isActive || !isVortex) { setVortexPhase(0); return; }
    if (skipAnimation && onAutoAdvance) { onAutoAdvance(); return; }
    setVortexPhase(0);
    const t1 = setTimeout(() => setVortexPhase(1), 50);
    const t2 = setTimeout(() => setVortexPhase(2), 350);
    const t3 = setTimeout(() => {
      setVortexPhase(3);
      onAutoAdvance?.();
    }, 850);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive, isVortex, skipAnimation, onAutoAdvance]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* Title */}
      <div
        className="relative w-full"
        style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <AnimatePresence mode="wait">
            {isIntro ? (
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
            ) : isSummary || isVortex ? (
              <motion.div
                key="summary"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                  Your customized factors now feed the model
                </h2>
                <p className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }}>
                  Every business is different. We analyze what matters to you — adding key factors, removing what doesn&rsquo;t apply, and tuning the balance.
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
          {isSummary || isVortex ? (
            <motion.div
              key="summary-content"
              className="absolute inset-0 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <SummaryView
                chipFactors={allChipFactors}
                selectedSet={selectedSet}
                chipsReady={chipsReady}
                showDrivers={summaryStep >= 1}
                skipAnimation={skipAnimation}
              />
              {isVortex && <VortexOverlay phase={vortexPhase} />}
            </motion.div>
          ) : (
            <motion.div
              key="chart-content"
              className="absolute inset-0 flex justify-center"
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
            >
              <div className="w-full max-w-5xl flex gap-3">
                {/* Bar chart column */}
                <div className="flex-1 min-w-0">
                  <motion.div
                    className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTED, paddingLeft: 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: isIntro ? 0 : 0.5 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    Variance contribution (%)
                  </motion.div>

                  <AnimatePresence>
                    {isIntro && (
                      <motion.div
                        key="skeleton"
                        className="flex flex-col"
                        exit={{ opacity: 0, transition: { duration: 0.25 } }}
                      >
                        {SKELETON_WIDTHS.map((w, i) => (
                          <div key={i} className="flex items-center" style={{ height: 22, marginBottom: 2 }}>
                            <div className="shrink-0 flex justify-end pr-3" style={{ width: 170 }}>
                              <motion.div
                                className="rounded-sm overflow-hidden relative"
                                style={{ height: 11, backgroundColor: `${MUTED}30` }}
                                initial={skipAnimation ? { width: SKELETON_LABEL_W[i] } : { width: 0, opacity: 0 }}
                                animate={{
                                  width: SKELETON_LABEL_W[i],
                                  opacity: 1,
                                }}
                                transition={{
                                  width: { duration: 0.4, delay: 0.2 + i * 0.04, ease: EASE },
                                  opacity: { duration: 0.4, delay: 0.2 + i * 0.04 },
                                }}
                              >
                                <motion.div
                                  className="absolute inset-0"
                                  style={{
                                    background: `linear-gradient(90deg, transparent 0%, ${MUTED}25 50%, transparent 100%)`,
                                  }}
                                  animate={{ x: ["-100%", "200%"] }}
                                  transition={{
                                    duration: 1.8,
                                    delay: 0.6 + i * 0.06,
                                    repeat: Infinity,
                                    repeatDelay: 0.8,
                                    ease: "easeInOut",
                                  }}
                                />
                              </motion.div>
                            </div>
                            <motion.div
                              className="rounded-r-sm overflow-hidden relative"
                              style={{ height: "100%", backgroundColor: `${MUTED}22` }}
                              initial={skipAnimation ? { width: w * BAR_MAX_W } : { width: 0 }}
                              animate={{ width: w * BAR_MAX_W }}
                              transition={{
                                width: { duration: 0.5, delay: 0.3 + i * 0.04, ease: EASE },
                              }}
                            >
                              <motion.div
                                className="absolute inset-0"
                                style={{
                                  background: `linear-gradient(90deg, transparent 0%, ${MUTED}20 50%, transparent 100%)`,
                                }}
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{
                                  duration: 2,
                                  delay: 0.8 + i * 0.08,
                                  repeat: Infinity,
                                  repeatDelay: 0.6,
                                  ease: "easeInOut",
                                }}
                              />
                            </motion.div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <LayoutGroup>
                    <div className="flex flex-col">
                      {visibleFactors.map((f, i) => {
                        const disposition = getDisposition(f);
                        const color = CATEGORY_COLORS[f.category] ?? MUTED;
                        const catStep = REVEAL_ORDER.indexOf(f.category as CategoryKey);
                        const isPast = catStep < categoryIndex;
                        const isAnnotated = disposition !== null;

                        const isRemove = disposition === "remove";
                        const isAdd = disposition === "add";

                        const barColor = isRemove ? `${MUTED}60` : color;
                        const barW = (f.value / MAX_VALUE) * BAR_MAX_W;

                        const opacity = hasAnnotations
                          ? (isAnnotated ? 1 : 0.12)
                          : (isPast ? 0.25 : 1);

                        return (
                          <motion.div
                            key={f.label}
                            layoutId={`di-${f.label}`}
                            layout="position"
                            className="flex items-center"
                            style={{ height: 22, marginBottom: 2 }}
                            initial={skipAnimation ? false : { opacity: 0, x: -20 }}
                            animate={{ opacity, x: 0 }}
                            transition={{
                              opacity: { duration: 0.4 },
                              x: { duration: 0.5, delay: skipAnimation ? 0 : i * 0.03, ease: EASE },
                              layout: { duration: 0.5, ease: EASE },
                            }}
                          >
                            <motion.span
                              className="shrink-0 text-right text-[13px] pr-3 relative inline-flex justify-end"
                              style={{
                                width: 170,
                                color: isRemove ? `${MUTED}90` : isAdd ? GREEN : color,
                                fontWeight: isAnnotated ? 700 : isPast ? 500 : 600,
                                transition: "color 0.4s, font-weight 0.4s",
                              }}
                              animate={
                                isRemove
                                  ? { x: [0, -3, 4, -2, 1, 0] }
                                  : { x: 0 }
                              }
                              transition={
                                isRemove
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

                            <div className="relative flex items-center" style={{ flex: 1, height: "100%" }}>
                              <motion.div
                                className="rounded-r-sm"
                                style={{
                                  height: "100%",
                                  backgroundColor: barColor,
                                  transition: "background-color 0.4s",
                                }}
                                initial={skipAnimation ? { width: barW } : { width: 0 }}
                                animate={{ width: barW }}
                                transition={{
                                  width: { duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : 0.15 + i * 0.03, ease: EASE },
                                }}
                              />

                              <motion.span
                                className="ml-2 text-[12px] font-semibold shrink-0"
                                style={{
                                  color: isRemove ? MUTED : isAdd ? GREEN : color,
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
                                    key={`icon-${f.label}-${disposition ?? "past"}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: 16, height: 16,
                                      backgroundColor:
                                        isPast && !isAnnotated ? `${GREEN}20`
                                        : isRemove ? `${MUTED}25`
                                        : `${GREEN}`,
                                      color:
                                        isPast && !isAnnotated ? GREEN
                                        : isRemove ? MUTED
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
                </div>

                {/* Annotation column */}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VortexOverlay({ phase }: { phase: number }) {
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const ring = i % 3;
      const radius = 140 + ring * 80;
      items.push({
        startX: Math.cos(angle) * radius,
        startY: Math.sin(angle) * radius,
        midX: Math.cos(angle + 2.5) * radius * 0.4,
        midY: Math.sin(angle + 2.5) * radius * 0.4,
        size: 3 + ring * 2,
        color: [NAVY, TEAL, ORANGE, GREEN, PURPLE][i % 5],
        delay: i * 0.012,
      });
    }
    return items;
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 50 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--i2p-bg, #EDF1F5)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 0.9 : 0 }}
        transition={{ duration: 0.25 }}
      />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: p.startX, y: p.startY, opacity: 0 }}
          animate={
            phase >= 2
              ? { x: [p.midX, 0], y: [p.midY, 0], opacity: [0.9, 0], scale: [0.6, 0], rotate: [180, 720] }
              : phase >= 1
              ? { x: p.midX, y: p.midY, opacity: 0.85, scale: 0.8, rotate: 270 }
              : {}
          }
          transition={
            phase >= 2
              ? { duration: 0.35, delay: p.delay, ease: [0.7, 0, 0.2, 1] }
              : { duration: 0.25, delay: p.delay, ease: [0.4, 0, 0.2, 1] }
          }
        />
      ))}

      <motion.div
        className="absolute rounded-full"
        style={{ backgroundColor: TEAL }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={
          phase >= 3
            ? { width: 60, height: 60, opacity: [1, 0], scale: [1, 2.5] }
            : phase >= 2
            ? { width: 10, height: 10, opacity: 1 }
            : {}
        }
        transition={
          phase >= 3
            ? { duration: 0.3, ease: EASE }
            : { duration: 0.2 }
        }
      />
    </motion.div>
  );
}

function SummaryView({
  chipFactors,
  selectedSet,
  chipsReady,
  showDrivers,
  skipAnimation,
}: {
  chipFactors: { label: string; category: string }[];
  selectedSet: Set<string>;
  chipsReady: boolean;
  showDrivers: boolean;
  skipAnimation?: boolean;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, { label: string; category: string }[]> = {};
    for (const f of chipFactors) {
      (map[f.category] ??= []).push(f);
    }
    let gi = 0;
    return REVEAL_ORDER.map(cat => ({
      cat,
      factors: (map[cat] ?? []).map(f => ({ ...f, gi: gi++ })),
    }));
  }, [chipFactors]);

  return (
    <div className="w-full max-w-4xl flex gap-6 items-start pt-10">
      {/* Left: chip grid */}
      <div className="flex-1 min-w-0 max-w-[540px]">
        <motion.span
          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 block"
          style={{ color: MUTED }}
          initial={skipAnimation ? false : { opacity: 0 }}
          animate={{ opacity: chipsReady ? 0.7 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Selected from
        </motion.span>
        <div className="flex flex-col gap-4">
          {grouped.map(({ cat, factors }, catIdx) => (
            <div key={cat}>
              <motion.span
                className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5 block"
                style={{ color: CATEGORY_COLORS[cat] }}
                initial={skipAnimation ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: chipsReady ? 1 : 0, x: chipsReady ? 0 : -20 }}
                transition={{
                  duration: 0.35,
                  delay: skipAnimation ? 0 : catIdx * 0.12,
                  ease: EASE,
                }}
              >
                {cat}
              </motion.span>
              <div className="flex flex-wrap gap-1.5">
                {factors.map((f) => {
                  const isSelected = selectedSet.has(f.label);
                  const color = CATEGORY_COLORS[f.category] ?? MUTED;
                  return (
                    <motion.span
                      key={f.label}
                      className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold"
                      style={{
                        border: `1.5px solid ${isSelected ? color : `${MUTED}30`}`,
                        color: isSelected ? color : `${MUTED}70`,
                        backgroundColor: isSelected ? `${color}10` : "transparent",
                      }}
                      initial={skipAnimation ? false : { opacity: 0, x: -60 - f.gi * 8, scaleX: 1.3, scaleY: 0.7 }}
                      animate={{
                        opacity: chipsReady ? 1 : 0,
                        x: chipsReady ? 0 : -60 - f.gi * 8,
                        scaleX: chipsReady ? 1 : 1.3,
                        scaleY: chipsReady ? 1 : 0.7,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: skipAnimation ? 0 : 0.04 * f.gi,
                        ease: EASE,
                      }}
                    >
                      {f.label}
                    </motion.span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <motion.div
        className="flex flex-col items-center justify-center self-center"
        initial={skipAnimation ? false : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: showDrivers ? 1 : 0, scale: showDrivers ? 1 : 0.5 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M8 16h12m0 0l-5-5m5 5l-5 5"
            stroke={TEAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Right: 5 driver pills */}
      <motion.div
        className="w-[220px] shrink-0"
        initial={skipAnimation ? false : { opacity: 0 }}
        animate={{ opacity: showDrivers ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 block"
          style={{ color: NAVY }}
        >
          5 Model Drivers
        </span>
        <div className="flex flex-col gap-2">
          {SELECTED_FACTORS.map((f, i) => (
            <motion.div
              key={f.label}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3"
              style={{
                border: `2px solid ${NAVY}`,
                backgroundColor: `${NAVY}08`,
              }}
              initial={skipAnimation ? false : { opacity: 0, x: 30, scale: 0.9 }}
              animate={{
                opacity: showDrivers ? 1 : 0,
                x: showDrivers ? 0 : 30,
                scale: showDrivers ? 1 : 0.9,
              }}
              transition={{
                duration: 0.45,
                delay: skipAnimation ? 0 : 0.08 * i,
                ease: EASE,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: NAVY }}
              />
              <span
                className="text-[13px] font-bold"
                style={{ color: NAVY }}
              >
                {f.label}
              </span>
              {f.note && (
                <span
                  className="ml-auto text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: `${NAVY}90` }}
                >
                  {f.note}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CalloutCard({ hint }: { hint: ActionHint }) {
  return (
    <div>
      <div
        className="rounded-lg py-3 pl-4 pr-3"
        style={{
          borderLeft: `3px solid ${hint.color}`,
          backgroundColor: `${hint.color}08`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 22, height: 22,
              backgroundColor: hint.icon === "✓" ? GREEN : `${hint.color}15`,
              color: hint.icon === "✓" ? "#fff" : hint.color,
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}
          >
            {hint.icon}
          </span>
          <span className="text-[14px] font-bold" style={{ color: hint.color }}>
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
