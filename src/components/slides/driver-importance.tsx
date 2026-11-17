"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, NAVY, TEAL, GREEN, MUTED,
  SQUARE_FACTORS, SELECTED_FACTORS, CATEGORY_ACTIONS, CATEGORY_ACTION_HINTS, CATEGORY_TITLES,
} from "./power-slide-data";
import { driverImportance as DI_CONFIG } from "@/lib/prospect-config";
import { useShareMode } from "@/lib/share-context";

export const DRIVER_IMPORTANCE_TOTAL_STEPS = 5;

const DRIVER_HIGHLIGHT = NAVY;

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

const EXAMPLE_STEPS: ExampleStep[] = (() => {
  const actionMap: Record<string, { supertitle: string; dismissLine: string }> = {
    remove: { supertitle: "Removing a factor", dismissLine: "Variance explained by behavior, not structure." },
    add: { supertitle: "Adding a factor", dismissLine: "A market guardrail that sharpens the final price." },
    elevate: { supertitle: "Elevating a factor", dismissLine: "Adds precision to the model." },
    lower: { supertitle: "Lowering a factor", dismissLine: "Minimal impact for this customer." },
  };
  const iconMap: Record<string, string> = { remove: "✕", add: "+", elevate: "↑", lower: "↓" };
  const steps: ExampleStep[] = [];
  for (const [, actions] of Object.entries(CATEGORY_ACTIONS)) {
    for (const a of actions) {
      const hint = CATEGORY_ACTION_HINTS.find(h => {
        const flat = Array.isArray(h) ? h : [h];
        return flat.some(hh => hh.detail.includes(a.label));
      });
      const flatHint = hint && (Array.isArray(hint) ? hint[0] : hint);
      const mapping = actionMap[a.action] ?? actionMap.add;
      steps.push({
        supertitle: mapping.supertitle,
        headline: a.label,
        detail: flatHint?.detail ?? "",
        dismissLine: mapping.dismissLine,
        color: TEAL,
        action: a.action === "lower" ? "remove" : a.action as ExampleAction,
        highlight: [a.label],
        remove: a.action === "remove" ? new Set([a.label]) : new Set(),
        add: a.action === "add" || a.action === "elevate" ? [a.label] : [],
        icon: iconMap[a.action] ?? "+",
      });
    }
  }
  return steps;
})();

const IMPORTANCE: Record<string, number> = DI_CONFIG.importance;

const FACTOR_ORDER = DI_CONFIG.factorOrder;

const ALL_FACTORS = SQUARE_FACTORS
  .filter(f => f.label in IMPORTANCE)
  .map(f => ({ label: f.label, category: f.category, value: IMPORTANCE[f.label] ?? 0 }))
  .sort((a, b) => {
    const ai = FACTOR_ORDER.indexOf(a.label);
    const bi = FACTOR_ORDER.indexOf(b.label);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

const MAX_VALUE = Math.max(...ALL_FACTORS.map(f => f.value));


type DriverAdjustment = {
  label: string;
  action: ExampleAction | "emphasized";
  color: string;
  icon: string;
  reason: string;
  category: string;
};

const DRIVER_ADJUSTMENTS: DriverAdjustment[] = (() => {
  const catLabel: Record<string, string> = { customer: CATEGORY_TITLES[0].replace(/ factors$/i, ""), product: CATEGORY_TITLES[1].replace(/ factors$/i, ""), market: CATEGORY_TITLES[3].replace(/ factors$/i, ""), order: CATEGORY_TITLES[2].replace(/ factors$/i, "") };
  const actionFactors = new Set<string>();
  for (const actions of Object.values(CATEGORY_ACTIONS)) {
    for (const a of actions) actionFactors.add(a.label);
  }
  const adjustments: DriverAdjustment[] = [];
  for (const [cat, actions] of Object.entries(CATEGORY_ACTIONS)) {
    for (const a of actions) {
      const iconMap: Record<string, string> = { remove: "✕", add: "+", elevate: "↑", lower: "↓" };
      adjustments.push({
        label: a.label,
        action: a.action === "lower" ? "remove" : a.action === "elevate" ? "emphasized" : a.action as DriverAdjustment["action"],
        color: a.action === "remove" ? MUTED : DRIVER_HIGHLIGHT,
        icon: iconMap[a.action] ?? "★",
        reason: CATEGORY_ACTION_HINTS.map(h => Array.isArray(h) ? h[0] : h).find(h => h.detail.includes(a.label))?.detail ?? "",
        category: catLabel[cat] ?? cat,
      });
    }
  }
  for (const d of SELECTED_FACTORS) {
    if (!actionFactors.has(d.label)) {
      const factor = SQUARE_FACTORS.find(f => f.label === d.label);
      const cat = factor?.category ?? "customer";
      adjustments.push({
        label: d.label,
        action: "emphasized",
        color: DRIVER_HIGHLIGHT,
        icon: "★",
        reason: `Key ${catLabel[cat]?.toLowerCase() ?? cat}-level pricing signal`,
        category: catLabel[cat] ?? cat,
      });
    }
  }
  return adjustments;
})();

type BeforeRisk = { icon: string; title: string; detail: React.ReactNode };

const BEFORE_RISKS: BeforeRisk[] = (() => {
  const removed = EXAMPLE_STEPS.find(e => e.action === "remove");
  const elevated = EXAMPLE_STEPS.find(e => e.action === "elevate");
  const added = EXAMPLE_STEPS.find(e => e.action === "add");
  return [
    { icon: "👤", title: `${removed?.headline ?? "Noise"} drives pricing`, detail: <>{removed?.detail ?? "Behavioral factors dominate"} — <b>prices shift with noise, not market reality.</b></> },
    { icon: "📉", title: "Hidden signals stay buried", detail: <>{elevated?.headline ?? "Key factors"} sits near the bottom — <b>a key sensitivity signal the model doesn&rsquo;t surface.</b></> },
    { icon: "🔇", title: "No competitive check", detail: <>Without {added?.headline ?? "market data"}, <b>the model sets prices blind to the market.</b></> },
    { icon: "⚖️", title: "Noise outweighs signal", detail: <>{SQUARE_FACTORS.length} untuned factors dilute the drivers that actually explain <b>price variation.</b></> },
  ];
})();

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
  const removedFactorLabel = EXAMPLE_STEPS.find(e => e.action === "remove")?.headline ?? "";
  const elevatedFactorLabel = EXAMPLE_STEPS.find(e => e.action === "elevate")?.headline ?? "";
  const addedFactorLabel = EXAMPLE_STEPS.find(e => e.action === "add")?.headline ?? "";

  const isCollapse = step === 5;
  const isIntro = step === 0;
  const isChart = step >= 1 && step <= 4;
  const isDriverSummary = step === 4;
  const exampleIndex = isChart ? Math.min(step - 1, 2) : -1;
  const activeExample = isChart && !isDriverSummary ? EXAMPLE_STEPS[exampleIndex] : null;

  /* Auto-phase 1: after bars animate in, reveal keep/add annotations */
  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation && isChart);
  useEffect(() => {
    if (!isActive || !isChart) { setActionRevealed(false); return; }
    if (skipAnimation || shareMode || isDriverSummary) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 1200);
    return () => clearTimeout(t);
  }, [isActive, step, skipAnimation, isChart, isDriverSummary]);

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
    if (isCollapse) {
      for (const ex of EXAMPLE_STEPS) ex.remove.forEach(l => set.add(l));
    } else {
      for (let i = 0; i < exampleIndex; i++) {
        EXAMPLE_STEPS[i].remove.forEach(l => set.add(l));
      }
    }
    return set;
  }, [exampleIndex, isCollapse]);

  const pastKeptSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < exampleIndex; i++) {
      for (const l of EXAMPLE_STEPS[i].add) set.add(l);
    }
    return set;
  }, [exampleIndex]);

  const ELEVATED_VALUE = 5.0;
  const ELEVATED_POSITION = 8; // after Product Specialization

  const productValueGrown = exampleIndex > 1 || (exampleIndex === 1 && secondPhase);

  const [elevatedMoved, setElevatedMoved] = useState(!!skipAnimation);
  useEffect(() => {
    if (!secondPhase || exampleIndex !== 1) { setElevatedMoved(exampleIndex > 1); return; }
    if (skipAnimation || shareMode) { setElevatedMoved(true); return; }
    setElevatedMoved(false);
    const t = setTimeout(() => setElevatedMoved(true), 1600);
    return () => clearTimeout(t);
  }, [secondPhase, exampleIndex, skipAnimation, shareMode]);

  const productElevated = exampleIndex > 1 || (exampleIndex === 1 && elevatedMoved);

  const [competitorOvershoot, setCompetitorOvershoot] = useState(false);
  useEffect(() => {
    if (step !== 3 || !actionRevealed) { setCompetitorOvershoot(false); return; }
    if (skipAnimation || shareMode) return;
    setCompetitorOvershoot(true);
    const t = setTimeout(() => setCompetitorOvershoot(false), 1200);
    return () => clearTimeout(t);
  }, [step, actionRevealed, skipAnimation, shareMode]);

  const showToggle = isDriverSummary;
  const [compareMode, setCompareMode] = useState<"after" | "before">("after");
  useEffect(() => {
    if (!isDriverSummary) setCompareMode("after");
  }, [isDriverSummary]);
  const showBefore = showToggle && compareMode === "before";

  const visibleFactors = useMemo(() => {
    if (showBefore) return ALL_FACTORS.filter(f => f.label !== addedFactorLabel);
    if (isCollapse) {
      const allRemovals = new Set<string>();
      for (const ex of EXAMPLE_STEPS) ex.remove.forEach(l => allRemovals.add(l));
      const factors = ALL_FACTORS.filter(f => !allRemovals.has(f.label));
      return factors.map(f =>
        f.label === elevatedFactorLabel ? { ...f, value: ELEVATED_VALUE } : f
      );
    }
    const elevatedRevealed = exampleIndex >= 1 && (exampleIndex > 1 || actionRevealed);
    const addedRevealed = exampleIndex >= 2;
    let factors = ALL_FACTORS.filter(f => {
      if (f.label === elevatedFactorLabel && !elevatedRevealed) return false;
      if (f.label === addedFactorLabel && !addedRevealed) return false;
      return true;
    });
    if (productValueGrown) {
      factors = factors.map(f =>
        f.label === elevatedFactorLabel ? { ...f, value: ELEVATED_VALUE } : f
      );
    }
    if (productElevated) {
      const pi = factors.find(f => f.label === elevatedFactorLabel);
      if (pi) {
        factors = factors.filter(f => f.label !== elevatedFactorLabel);
        factors.splice(ELEVATED_POSITION, 0, pi);
      }
    }
    return factors;
  }, [isCollapse, exampleIndex, actionRevealed, productValueGrown, productElevated, showBefore]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 5 : 0);
  const introEffectRanRef = useRef(false);
  useEffect(() => {
    if (!isActive || !isIntro) { setIntroPhase(0); introEffectRanRef.current = false; return; }
    if (skipAnimation || shareMode) { setIntroPhase(5); introEffectRanRef.current = true; autoAdvanceRef.current?.(); return; }
    introEffectRanRef.current = true;
    setIntroPhase(0);
    const timers = [
      setTimeout(() => setIntroPhase(1), 400),
      setTimeout(() => setIntroPhase(2), 800),
      setTimeout(() => setIntroPhase(3), 1200),
      setTimeout(() => setIntroPhase(4), 1600),
      setTimeout(() => setIntroPhase(5), 2200),
    ];
    return () => { introEffectRanRef.current = false; timers.forEach(clearTimeout); };
  }, [isActive, isIntro, skipAnimation, shareMode]);

  const barsSettled = useRef(!!skipAnimation);
  useEffect(() => {
    if (!isChart) { barsSettled.current = !!skipAnimation; return; }
    if (skipAnimation) { barsSettled.current = true; return; }
    barsSettled.current = false;
    const t = setTimeout(() => { barsSettled.current = true; }, 1200);
    return () => clearTimeout(t);
  }, [step, isChart, skipAnimation]);

  const [clickReady, setClickReady] = useState(!!skipAnimation);
  useEffect(() => {
    if (!isActive || isCollapse) { setClickReady(false); return; }
    if (skipAnimation || shareMode) { setClickReady(true); return; }
    setClickReady(false);
    if (isIntro) return;
    if (isChart) {
      if (!storedPhase) return;
      const t = setTimeout(() => setClickReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [isActive, isIntro, introPhase, isChart, storedPhase, isCollapse, skipAnimation, step]);


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

  const [collapsePhase, setCollapsePhase] = useState(0);
  useEffect(() => {
    if (!isCollapse) { setCollapsePhase(0); return; }
    if (!isActive) return;
    if (skipAnimation || shareMode) { setCollapsePhase(3); return; }
    setCollapsePhase(0);
    const t1 = setTimeout(() => setCollapsePhase(1), 400);
    const t2 = setTimeout(() => setCollapsePhase(2), 1200);
    const t3 = setTimeout(() => setCollapsePhase(3), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive, isCollapse, skipAnimation, shareMode]);

  return (
    <div
      className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pl-16 pt-4"
      style={isActive && isIntro && !skipAnimation && !introEffectRanRef.current ? { visibility: "hidden" } : undefined}
    >
      {/* Title */}
      <div
        className="relative w-full"
        style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))", transition: "height 0.4s ease" }}
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
            ) : isIntro ? (
              <motion.div
                key="intro"
                className="absolute inset-0"
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex flex-col items-center gap-2">
                  <h2
                    className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                    style={{
                      color: NAVY,
                      opacity: introPhase >= 1 ? 1 : 0,
                      transform: introPhase >= 1 ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                    }}
                  >
                    Pricing factors across four dimensions
                  </h2>
                  <p
                    className="mx-auto max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed"
                    style={{
                      color: MUTED,
                      opacity: introPhase >= 1 ? 1 : 0,
                      transform: introPhase >= 1 ? "translateY(0)" : "translateY(6px)",
                      transition: introPhase >= 1 ? "opacity 0.4s 0.15s, transform 0.4s 0.15s" : "opacity 0.3s, transform 0.3s",
                    }}
                  >
                    Tuned to your business — elevating what matters, removing what doesn&rsquo;t.
                  </p>
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
                {(narrative || isDriverSummary) && (
                  <>
                    <h2
                      className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                      style={{ color: showBefore ? NAVY : showToggle ? NAVY : narrative?.color ?? NAVY, transition: "color 0.3s" }}
                    >
                      {showBefore ? "Pricing factors across four dimensions" : showToggle ? "Your model drivers" : narrative?.supertitle ?? ""}
                    </h2>
                    <motion.p
                      className="mx-auto max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed whitespace-nowrap"
                      style={{
                        color: showBefore ? MUTED
                          : showToggle ? MUTED
                          : storedPhase ? (narrative?.color ?? MUTED)
                          : MUTED,
                        transition: "color 0.4s",
                      }}
                      initial={skipAnimation ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: isDriverSummary ? 0.7 : actionRevealed ? (storedPhase && !showToggle ? 0.9 : 0.7) : 0, y: isDriverSummary ? 0 : actionRevealed ? 0 : 4 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      {showBefore ? "22 factors before model tuning."
                        : showToggle ? "7 drivers refined from 22 — tuned to your business."
                        : narrative?.detail ?? ""}
                    </motion.p>
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
              {/* Adjustment cards converging to center */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={collapsePhase >= 1
                  ? { scale: 0.15, opacity: 0 }
                  : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.8, ease: EASE }}
                style={{ transformOrigin: "center 50%" }}
              >
                <div style={{ width: 380 }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block"
                    style={{ color: MUTED, opacity: 0.7 }}
                  >
                    Model adjustments
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {DRIVER_ADJUSTMENTS.map((adj) => (
                      <AdjustmentCard key={adj.label} adj={adj} />
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
              className="absolute inset-0 flex justify-center"
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
                className="w-full max-w-5xl flex relative gap-3"
                style={isIntro && !skipAnimation ? {
                  opacity: introPhase >= 3 ? 1 : 0,
                  transition: "opacity 0.5s ease-out",
                } : undefined}
              >
                {/* Bar chart column */}
                <motion.div
                  className="flex-1 min-w-0"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <LayoutGroup>
                    <div className="flex flex-col relative">
                      <motion.div
                        className="flex items-center mb-1"
                        style={{ paddingLeft: 170 }}
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
                        const isPastRemoved = removedSet.has(f.label);
                        const isPastKept = pastKeptSet.has(f.label);
                        const isAnnotated = disposition !== null;

                        const isRemove = disposition === "remove";
                        const isKeep = disposition === "keep";
                        const isAdd = disposition === "add";

                        const isHighlighted = isChart && activeExample && actionRevealed && !showBefore &&
                          (activeExample.highlight.includes(f.label) || activeExample.add.includes(f.label));
                        const willBeRemoved = isChart && activeExample && actionRevealed && !showBefore && activeExample.remove.has(f.label);
                        const willBeKept = isHighlighted && !isAdd;
                        const showColor = isHighlighted;

                        const adjEntry = DRIVER_ADJUSTMENTS.find(a => a.label === f.label);
                        const isAfterHighlight = showToggle && compareMode === "after" && adjEntry;

                        const isAfterRemoved = showToggle && compareMode === "after" && adjEntry?.action === "remove";
                        const isAfterUnused = showToggle && compareMode === "after" && !adjEntry;

                        const barColor = showBefore ? `${MUTED}40`
                          : isAfterRemoved ? `${MUTED}50`
                          : isAfterHighlight ? adjEntry.color
                          : isAfterUnused ? `${MUTED}30`
                          : isRemove ? `${MUTED}60`
                          : isPastRemoved ? `${MUTED}30`
                          : (isAdd || isKeep || willBeKept || showColor) ? TEAL
                          : `${MUTED}40`;
                        const effectiveBarMax = BAR_MAX_W;
                        const tunedValue = f.label === addedFactorLabel && competitorOvershoot ? 12.0 : f.value;
                        const barW = (tunedValue / MAX_VALUE) * effectiveBarMax;

                        const opacity = showBefore ? 1
                          : isAfterRemoved ? 0.55
                          : isAfterHighlight ? 1
                          : isAfterUnused ? 0.4
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
                            className="flex items-center relative"
                            style={{ height: 18, marginBottom: 1 }}
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
                              className="shrink-0 text-right pr-3 relative inline-flex justify-end text-[13px]"
                              style={{
                                width: 170,
                                color: showBefore ? MUTED
                                  : isAfterRemoved ? `${MUTED}80`
                                  : isAfterHighlight ? adjEntry.color
                                  : isAfterUnused ? `${MUTED}70`
                                  : isPastRemoved ? `${MUTED}60`
                                  : (isRemove || (willBeRemoved && secondPhase)) ? `${MUTED}80`
                                  : (isAdd || isKeep || willBeKept || showColor) ? TEAL
                                  : MUTED,
                                fontWeight: showBefore ? 500
                                  : isAfterHighlight ? 700
                                  : (isAnnotated || willBeKept || (willBeRemoved && secondPhase)) ? 700 : isHighlighted ? 600 : 500,
                                transition: "color 0.4s, font-weight 0.4s",
                              }}
                            >
                              {f.label}
                            </motion.span>

                            <div className="relative flex items-center" style={{ flex: 1, height: "100%" }}>
                              <motion.div
                                className="rounded-r-sm overflow-hidden relative"
                                style={{ height: "100%" }}
                                initial={skipAnimation ? { width: barW, backgroundColor: barColor } : { width: 0, backgroundColor: barColor }}
                                animate={{ width: barW, backgroundColor: barColor }}
                                transition={{
                                  width: { duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : barsSettled.current ? 0 : 0.15 + i * 0.03, ease: EASE },
                                  backgroundColor: { duration: 0.4, ease: EASE },
                                }}
                              />

                              <AnimatePresence>
                                {!showBefore && !isAfterHighlight && ((isKeep || isAdd) || isPastKept) && (
                                  <motion.span
                                    key={`icon-${f.label}-${disposition ?? "past"}`}
                                    className="ml-1.5 inline-flex items-center justify-center rounded-full shrink-0"
                                    style={{
                                      width: isAdd ? 28 : 16, height: isAdd ? 28 : 16,
                                      backgroundColor:
                                        isPastKept && !isAnnotated ? `${GREEN}20`
                                        : isAdd ? TEAL
                                        : `${GREEN}`,
                                      color:
                                        isPastKept && !isAnnotated ? GREEN
                                        : "#fff",
                                      fontSize: isAdd ? 18 : 9, fontWeight: 900, lineHeight: 1,
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
                            <AnimatePresence>
                              {!showBefore && (isRemove || isPastRemoved || isAfterRemoved) && (
                                <motion.span
                                  className="absolute top-1/2 pointer-events-none"
                                  style={{
                                    left: 40,
                                    right: 0,
                                    height: 0,
                                    borderTop: `1.5px dashed ${MUTED}60`,
                                    transformOrigin: "left",
                                    zIndex: 10,
                                  }}
                                  initial={isPastRemoved || isAfterRemoved ? { scaleX: 1 } : { scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  exit={{ scaleX: 0 }}
                                  transition={{ duration: isPastRemoved || isAfterRemoved ? 0 : 0.5, delay: isPastRemoved || isAfterRemoved ? 0 : 0.3, ease: EASE }}
                                />
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                      </AnimatePresence>
                    </div>
                  </LayoutGroup>

                  <motion.p
                    className="mt-3 font-medium leading-relaxed text-[11px]"
                    style={{ color: `${MUTED}90`, paddingLeft: 178 }}
                    initial={skipAnimation ? false : { opacity: 0 }}
                    animate={{ opacity: showToggle ? 0 : 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    * Percentage of explainable variance — how much each factor contributes to the model&rsquo;s pricing accuracy.
                  </motion.p>
                </motion.div>

                {/* Right column: crossfade between before risks / after adjustments / example cards */}
                <AnimatePresence mode="wait">
                {isChart && showToggle ? (
                  showBefore ? (
                    <motion.div
                      key="before-risks"
                      className="shrink-0 flex flex-col pt-6"
                      style={{ width: 310 }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block"
                        style={{ color: `${MUTED}80` }}
                      >
                        Without tuning
                      </span>
                      <div className="flex flex-col gap-2">
                        {BEFORE_RISKS.map((risk, i) => (
                          <motion.div
                            key={risk.title}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
                          >
                            <BeforeRiskCard risk={risk} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="after-adjustments"
                      className="shrink-0 flex flex-col pt-6"
                      style={{ width: 310 }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block"
                        style={{ color: MUTED, opacity: 0.5 }}
                      >
                        Model adjustments
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {DRIVER_ADJUSTMENTS.map((adj, i) => (
                          <motion.div
                            key={adj.label}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                          >
                            <AdjustmentCard adj={adj} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                ) : isChart && !showBefore ? (
                  <motion.div
                    key="example-cards"
                    className="shrink-0 flex flex-col pt-6"
                    style={{ width: 310 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <AnimatePresence>
                      {(exampleIndex > 0 || storedPhase) && (
                        <motion.span
                          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 block shrink-0"
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
                        const show = isPrior || isCurrent;
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
                  </motion.div>
                ) : null}
                </AnimatePresence>

              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {showToggle && (
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center"
              style={{ transform: "translateX(calc(-50% + var(--rail-inset, 0px) * -0.5))" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div
                className="flex items-center rounded-full p-0.5"
                style={{ backgroundColor: `${MUTED}12`, border: `1px solid ${MUTED}20` }}
              >
                <button
                  className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: compareMode === "before" ? "#fff" : "transparent",
                    color: compareMode === "before" ? NAVY : MUTED,
                    boxShadow: compareMode === "before" ? `0 1px 3px ${MUTED}30` : "none",
                  }}
                  onClick={(e) => { e.stopPropagation(); setCompareMode("before"); }}
                >
                  Before
                </button>
                <button
                  className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: compareMode === "after" ? "#fff" : "transparent",
                    color: compareMode === "after" ? TEAL : MUTED,
                    boxShadow: compareMode === "after" ? `0 1px 3px ${MUTED}30` : "none",
                  }}
                  onClick={(e) => { e.stopPropagation(); setCompareMode("after"); }}
                >
                  After
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {clickReady && (
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



const ALL_ACTION_LABELS: Record<ExampleAction | "emphasized", string> = {
  remove: "Removed",
  elevate: "Elevated",
  add: "Added",
  emphasized: "Emphasized",
};

function ExampleCard({ example }: { example: ExampleStep }) {
  const isRemove = example.action === "remove";
  const borderColor = isRemove ? `${MUTED}40` : TEAL;
  const bgColor = isRemove ? `${MUTED}08` : `${TEAL}08`;
  const iconBg = isRemove ? `${MUTED}20` : `${TEAL}18`;
  const iconColor = isRemove ? MUTED : TEAL;

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
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] block" style={{ color: iconColor }}>
            {ALL_ACTION_LABELS[example.action]}
          </span>
          <span className="text-[14px] font-bold block leading-tight" style={{
            color: isRemove ? MUTED : NAVY,
            textDecoration: isRemove ? "line-through" : "none",
          }}>
            {example.headline}
          </span>
        </div>
      </div>
    </div>
  );
}

function AdjustmentCard({ adj }: { adj: DriverAdjustment }) {
  return (
    <div
      className="rounded-md py-1.5 pl-3 pr-2.5 relative"
      style={{ borderLeft: `3px solid ${adj.color}`, backgroundColor: `${adj.color}06` }}
    >
      <span
        className="absolute top-1.5 right-2 rounded-full px-2 py-[1px] text-[9px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: `${MUTED}12`, color: MUTED }}
      >
        {adj.category}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: adj.color }}>
          {ALL_ACTION_LABELS[adj.action]}
        </span>
        <span className="text-[11px] font-medium" style={{ color: `${MUTED}50` }}>|</span>
        <span className="text-[13px] font-bold whitespace-nowrap" style={{ color: NAVY, textDecoration: adj.action === "remove" ? "line-through" : "none" }}>
          {adj.label}
        </span>
      </div>
      <p className="text-[10px] font-medium leading-tight mt-0.5" style={{ color: MUTED }}>
        {adj.reason}
      </p>
    </div>
  );
}

function BeforeRiskCard({ risk }: { risk: BeforeRisk }) {
  const WARN = "#C0392B";
  return (
    <div
      className="rounded-md py-2 pl-3 pr-2.5"
      style={{ backgroundColor: `${WARN}06`, borderLeft: `3px solid ${WARN}40` }}
    >
      <div className="flex items-start gap-2">
        <span className="text-[13px] leading-none mt-0.5">{risk.icon}</span>
        <div className="min-w-0">
          <span className="text-[12px] font-bold block leading-tight" style={{ color: NAVY }}>
            {risk.title}
          </span>
          <span className="text-[10px] font-medium block leading-snug mt-0.5 [&_b]:font-semibold [&_b]:text-[var(--b-color)]" style={{ color: MUTED, "--b-color": NAVY } as React.CSSProperties}>
            {risk.detail}
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

