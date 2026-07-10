"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, ORANGE, GREEN, PURPLE, MUTED,
  SQUARE_FACTORS, CATEGORY_LAYOUT, CATEGORY_ACTIONS,
  CATEGORY_TITLES, CATEGORY_NARRATION,
} from "./power-slide-data";

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 5;

type CategoryKey = "customer" | "product" | "order" | "market";
const REVEAL_ORDER: CategoryKey[] = ["customer", "product", "order", "market"];

const CATEGORY_COLORS: Record<string, string> = {
  customer: NAVY,
  product: ORANGE,
  order: PURPLE,
  market: GREEN,
};

type ActionHint = { icon: string; color: string; headline: string; detail: string };

const LOCAL_ACTION_HINTS: (ActionHint | ActionHint[])[] = [
  [
    { icon: "×", color: TEAL, headline: "Removing", detail: "Sales rep doesn't seem like a meaningful driver — take it out." },
    { icon: "✓", color: TEAL, headline: "Key driver", detail: "End market is already heavily weighted — it's a big deal, we're keeping it." },
  ],
  { icon: "✓", color: TEAL, headline: "Key drivers", detail: "Product specialization and product mix are top contributors — keeping them." },
  { icon: "↓", color: PURPLE, headline: "Lower its weight", detail: "Seasonality has minimal impact for this customer — dial it down." },
  { icon: "+", color: GREEN, headline: "Add a factor", detail: "Competitive intelligence is critical in this market — add it to the model." },
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
  "Payment terms": 0.8,
  "Price sensitivity": 0.6,
  "Sales rep": 0.4,
  "Seasonality": 0.2,
};

const ALL_FACTORS = SQUARE_FACTORS
  .map(f => ({ label: f.label, category: f.category, value: IMPORTANCE[f.label] ?? 0 }))
  .sort((a, b) => b.value - a.value);

const MAX_VALUE = ALL_FACTORS[0].value;
const BAR_MAX_W = 340;
const ROW_H = 24;

export function DriverImportanceSlide({
  step = 0,
  skipAnimation,
  isActive = true,
}: {
  step: number;
  skipAnimation?: boolean;
  isActive?: boolean;
}) {
  const isIntro = step === 0;
  const categoryIndex = isIntro ? -1 : step - 1;
  const activeCategory = isIntro ? null : REVEAL_ORDER[categoryIndex];

  /* ── action reveal delay (600ms) ── */
  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || isIntro) { setActionRevealed(false); return; }
    if (skipAnimation) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 600);
    return () => clearTimeout(t);
  }, [isActive, step, skipAnimation, isIntro]);

  /* ── customer two-step (remove → keep, 2s gap) ── */
  const [customerActionStep, setCustomerActionStep] = useState(
    !!skipAnimation || step > 1 ? 1 : 0,
  );
  useEffect(() => {
    if (!isActive || categoryIndex !== 0) {
      if (step > 1) setCustomerActionStep(1);
      return;
    }
    if (skipAnimation) { setCustomerActionStep(1); return; }
    if (!actionRevealed) { setCustomerActionStep(0); return; }
    setCustomerActionStep(0);
    const t = setTimeout(() => setCustomerActionStep(1), 2000);
    return () => clearTimeout(t);
  }, [isActive, categoryIndex, actionRevealed, skipAnimation, step]);

  /* ── visible factors ── */
  const revealedSet = useMemo(
    () => new Set(isIntro ? [] : REVEAL_ORDER.slice(0, categoryIndex + 1)),
    [isIntro, categoryIndex],
  );

  const visibleFactors = useMemo(() => {
    return ALL_FACTORS.filter(f => {
      if (!revealedSet.has(f.category)) return false;
      const catActions = CATEGORY_ACTIONS[f.category] ?? [];
      const isAddTarget = catActions.some(a => a.label === f.label && a.action === "add");
      if (isAddTarget && f.category === activeCategory && !actionRevealed) return false;
      return true;
    });
  }, [revealedSet, activeCategory, actionRevealed]);

  /* ── resolve action state for a factor bar ── */
  function getBarAction(f: { label: string; category: string }): {
    action: "elevate" | "remove" | "lower" | "add";
    fresh: boolean;
    shake: boolean;
  } | null {
    const catActions = CATEGORY_ACTIONS[f.category] ?? [];
    const factorActions = catActions.filter(a => a.label === f.label);
    if (factorActions.length === 0) return null;

    const catStep = REVEAL_ORDER.indexOf(f.category as CategoryKey);
    const isPast = catStep < categoryIndex;
    const isCurrent = catStep === categoryIndex;

    if (isPast) {
      const last = factorActions[factorActions.length - 1];
      return { action: last.action, fresh: false, shake: false };
    }
    if (!isCurrent || !actionRevealed) return null;

    const hasSteps = factorActions.some(a => a.step !== undefined);
    if (hasSteps) {
      const applicable = factorActions.filter(
        a => a.step !== undefined && a.step <= customerActionStep,
      );
      if (applicable.length === 0) return null;
      const picked = applicable[applicable.length - 1];
      return {
        action: picked.action,
        fresh: true,
        shake: picked.action === "remove" && customerActionStep === (picked.step ?? 0),
      };
    }

    return { action: factorActions[0].action, fresh: true, shake: false };
  }

  /* ── compute fresh targets for callout ── */
  const freshTargets = visibleFactors
    .map((f, i) => ({ ...f, index: i, barAction: getBarAction(f) }))
    .filter(t => t.barAction?.fresh);

  const hasActiveAction = freshTargets.length > 0;

  const calloutCenterY = freshTargets.length > 0
    ? freshTargets.reduce((sum, t) => sum + t.index * ROW_H + ROW_H / 2, 0) / freshTargets.length
    : 0;

  /* ── callout hint ── */
  const rawHint = categoryIndex >= 0 ? LOCAL_ACTION_HINTS[categoryIndex] : null;
  const currentHint = rawHint
    ? (Array.isArray(rawHint)
      ? rawHint[categoryIndex === 0 ? customerActionStep : 0]
      : rawHint)
    : null;

  const hintColor = currentHint?.color ?? TEAL;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* ── Title area ── */}
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
                <h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                >
                  Which factors drive the most value?
                </h2>
                <p
                  className="mx-auto max-w-xl text-center text-[1.05rem] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  The model measures how much each factor contributes to pricing accuracy — here&rsquo;s what it found.
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
                <span
                  className="text-[0.95rem] leading-relaxed"
                  style={{ color: MUTED }}
                >
                  {CATEGORY_NARRATION[categoryIndex]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Chart area ── */}
      <div
        className="relative w-full flex-1 min-h-0 flex justify-center overflow-hidden pt-1"
        style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}
      >
        <div className="w-full max-w-5xl flex gap-3">
          {/* ── Bar chart column ── */}
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

            <LayoutGroup>
              <div className="flex flex-col">
                {visibleFactors.map((f, i) => {
                  const barAction = getBarAction(f);
                  const color = CATEGORY_COLORS[f.category] ?? MUTED;
                  const isPast = REVEAL_ORDER.indexOf(f.category as CategoryKey) < categoryIndex;

                  const isElevated = barAction?.action === "elevate";
                  const isRemoved = barAction?.action === "remove";
                  const isLowered = barAction?.action === "lower";
                  const isAdding = barAction?.action === "add";
                  const isShake = barAction?.shake;
                  const isFresh = barAction?.fresh;

                  const barColor = isRemoved
                    ? `${MUTED}60`
                    : (isElevated || isAdding)
                      ? TEAL
                      : isLowered
                        ? PURPLE
                        : color;

                  const barW = (f.value / MAX_VALUE) * BAR_MAX_W;

                  const opacity = hasActiveAction
                    ? (isFresh ? 1 : 0.15)
                    : (isPast ? (barAction ? 0.6 : 0.45) : 1);

                  return (
                    <motion.div
                      key={f.label}
                      layoutId={`di-${f.label}`}
                      layout="position"
                      className="flex items-center"
                      style={{ height: 22, marginBottom: 2 }}
                      initial={skipAnimation ? false : { opacity: 0, x: -20 }}
                      animate={{
                        opacity,
                        x: isShake ? [0, 0, -4, 5, -3, 2, -1, 0] : 0,
                      }}
                      transition={{
                        opacity: { duration: 0.4 },
                        x: isShake
                          ? { duration: 0.6, delay: 0.3, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] }
                          : { duration: 0.5, delay: skipAnimation ? 0 : i * 0.03, ease: EASE },
                        layout: { duration: 0.5, ease: EASE },
                      }}
                    >
                      {/* Label */}
                      <span
                        className="shrink-0 text-right text-[13px] pr-3"
                        style={{
                          width: 170,
                          color: isRemoved ? MUTED
                            : (isElevated || isAdding) ? TEAL
                            : isLowered ? PURPLE
                            : color,
                          fontWeight: barAction ? 700 : isPast ? 500 : 600,
                          textDecoration: isRemoved ? "line-through" : "none",
                          transition: "color 0.4s, font-weight 0.4s, text-decoration 0.4s",
                        }}
                      >
                        {f.label}
                      </span>

                      {/* Bar + value + icon + connector */}
                      <div className="relative flex items-center" style={{ flex: 1, height: "100%" }}>
                        <motion.div
                          className="rounded-r-sm"
                          style={{
                            height: "100%",
                            backgroundColor: barColor,
                            transition: "background-color 0.4s",
                          }}
                          initial={skipAnimation ? { width: barW } : { width: 0 }}
                          animate={{
                            width: barW,
                            boxShadow: isFresh && (isElevated || isAdding)
                              ? `0 0 12px ${TEAL}40`
                              : "0 0 0px transparent",
                          }}
                          transition={{
                            width: { duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : 0.15 + i * 0.03, ease: EASE },
                            boxShadow: { duration: 0.6 },
                          }}
                        />

                        {/* Value */}
                        <motion.span
                          className="ml-2 text-[12px] font-semibold shrink-0"
                          style={{
                            color: isRemoved ? MUTED
                              : (isElevated || isAdding) ? TEAL
                              : isLowered ? PURPLE
                              : color,
                            transition: "color 0.4s",
                          }}
                          initial={skipAnimation ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: skipAnimation ? 0 : 0.3 + i * 0.03 }}
                        >
                          {f.value}
                        </motion.span>

                        {/* Action icon */}
                        <AnimatePresence>
                          {barAction && (
                            <motion.span
                              key={`icon-${f.label}-${barAction.action}`}
                              className="ml-1.5 text-[13px] font-bold shrink-0"
                              style={{
                                color: isRemoved ? MUTED
                                  : (isElevated || isAdding) ? TEAL
                                  : isLowered ? PURPLE
                                  : color,
                              }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: isFresh ? 1 : 0.6, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              transition={
                                isFresh
                                  ? { delay: 0.2, duration: 0.3, type: "spring", stiffness: 300 }
                                  : { duration: 0.3 }
                              }
                            >
                              {isElevated && "✓"}
                              {isRemoved && "×"}
                              {isLowered && "↓"}
                              {isAdding && "+"}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Connector line for fresh targets */}
                        <AnimatePresence>
                          {isFresh && (
                            <motion.div
                              className="flex-1 ml-3 self-center"
                              style={{
                                height: 0,
                                borderTop: `1.5px dashed ${hintColor}50`,
                                minWidth: 20,
                              }}
                              initial={{ scaleX: 0, transformOrigin: "left" }}
                              animate={{ scaleX: 1 }}
                              exit={{ scaleX: 0 }}
                              transition={{ duration: 0.35, delay: 0.25, ease: EASE }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </LayoutGroup>

            {/* Footnote */}
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

          {/* ── Annotation column ── */}
          <div
            className="w-[260px] shrink-0 relative"
            style={{ minHeight: visibleFactors.length * ROW_H + 30 }}
          >
            <AnimatePresence mode="wait">
              {hasActiveAction && currentHint && (
                <motion.div
                  key={`callout-${categoryIndex}-${categoryIndex === 0 ? customerActionStep : ""}`}
                  className="absolute left-0 right-0"
                  style={{ top: Math.max(0, calloutCenterY - 38) }}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
                >
                  <div
                    className="rounded-lg py-3 pl-4 pr-3"
                    style={{
                      borderLeft: `3px solid ${hintColor}`,
                      backgroundColor: `${hintColor}08`,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center justify-center rounded-full"
                        style={{
                          width: 22,
                          height: 22,
                          backgroundColor: `${hintColor}15`,
                          color: hintColor,
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {currentHint.icon}
                      </span>
                      <span
                        className="text-[14px] font-bold"
                        style={{ color: hintColor }}
                      >
                        {currentHint.headline}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 text-[13px] font-medium leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {currentHint.detail}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
