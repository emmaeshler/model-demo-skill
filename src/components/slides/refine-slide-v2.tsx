"use client";

import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { usePhaseSequence } from "@/lib/anim";
import { makeCurve } from "../visuals/demand-curve";
import {
  EASE, NAVY, MUTED, STRAT_BLUE,
  CURVE_SLOT, BASE_Y, BASELINE_KPI, TIMELINE_EVENTS,
  SEGMENT_HIGHLIGHTS, STEP_CONTEXT,
} from "./refine-slide-data";
import { TimelineStrip } from "./refine-slide-timeline";
import { RefineChart } from "./refine-slide-chart";
import { KpiSidebar } from "./refine-slide-kpi";
import { PortfolioGrid } from "./refine-slide-portfolio";

export const REFINE_V2_TOTAL_STEPS = 9;

export function RefineSlideV2({ step, onAutoAdvance, skipAnimation, isActive, onTimelinePhase, requestedPhase, advanceRequest, onSpotlightRefined }: { step: number; onAutoAdvance?: () => void; skipAnimation?: boolean; isActive: boolean; onTimelinePhase?: (phase: number) => void; requestedPhase?: number; advanceRequest?: number; onSpotlightRefined?: () => void }) {
  const { shareMode } = useShareMode();

  const curve = useMemo(() => {
    const raw = makeCurve(CURVE_SLOT, 8);
    const n = 64;
    const navyPts = Array.from({ length: n + 1 }, (_, i) => {
      const pt = raw.sampleAt(i / n);
      return { x: pt.x, y: pt.y };
    });
    const ghostCurvePts: { x: number; y: number }[][] = [];
    const ghostCurves = [
      { steepness: 2, customer: "MedSupply", color: "#4A8FA8" },
      { steepness: 14, customer: "QuickParts", color: "#C27A3A" },
    ].map(({ steepness, customer, color }) => {
      const g = makeCurve(CURVE_SLOT, steepness);
      const gPts = Array.from({ length: n + 1 }, (_, i) => {
        const pt = g.sampleAt(i / n);
        return { x: pt.x, y: pt.y };
      });
      ghostCurvePts.push(gPts);
      const d = "M " + gPts.map(p => `${p.x},${p.y}`).join(" L ");
      const ghostSample = (t: number) => {
        const pt = g.sampleAt(t);
        return { x: pt.x, y: pt.y };
      };
      return { d, sampleAt: ghostSample, customer, color };
    });
    const indexCurves = TIMELINE_EVENTS.map(event => {
      const rawShifted = makeCurve(CURVE_SLOT, event.steepness);
      const dy = event.shift ?? 0;
      const pts = Array.from({ length: n + 1 }, (_, i) => {
        const pt = rawShifted.sampleAt(i / n);
        return { x: pt.x, y: Math.max(CURVE_SLOT.y, pt.y + dy) };
      });
      return {
        d: "M " + pts.map(p => `${p.x},${p.y}`).join(" L "),
        pts,
        sampleAt: (t: number) => {
          const pt = rawShifted.sampleAt(t);
          return { x: pt.x, y: Math.max(CURVE_SLOT.y, pt.y + dy) };
        },
      };
    });

    return {
      d: "M " + navyPts.map(p => `${p.x},${p.y}`).join(" L "),
      navyPts,
      ghostCurvePts,
      ghostCurves,
      indexCurves,
      sampleAt: (t: number) => {
        const pt = raw.sampleAt(t);
        return { x: pt.x, y: pt.y };
      },
    };
  }, []);

  const chartStep = step;

  const INTRO_DELAYS = [0, 400, 1600, 2800, 3800, 4700, 5600] as const;
  const introPhase = usePhaseSequence(INTRO_DELAYS, { active: isActive, skip: !!skipAnimation, enabled: chartStep === 0 });

  /* ── Spotlight auto-animation (steps 3-5) ── */
  const isSpotlight = chartStep >= 2 && chartStep <= 4;
  const spotlightIdx = isSpotlight ? chartStep - 2 : -1;

  const [spotPhase, setSpotPhase] = useState(0);
  const spotRefinedForStep = useRef(-1);
  useEffect(() => {
    if (!isActive) { setSpotPhase(0); return; }
    if (!isSpotlight) {
      const t0 = setTimeout(() => setSpotPhase(0));
      return () => clearTimeout(t0);
    }
    if (skipAnimation) {
      spotRefinedForStep.current = chartStep;
      onSpotlightRefined?.();
      const t0 = setTimeout(() => setSpotPhase(3));
      return () => clearTimeout(t0);
    }
    spotRefinedForStep.current = -1;
    setSpotPhase(0);
  }, [chartStep, isSpotlight, skipAnimation, isActive]);

  useEffect(() => {
    if (!advanceRequest || !isSpotlight) return;
    if (spotRefinedForStep.current !== chartStep) {
      spotRefinedForStep.current = chartStep;
      setSpotPhase(2);
      onSpotlightRefined?.();
    } else {
      onAutoAdvance?.();
    }
  }, [advanceRequest]);

  /* ── Timeline intro + click-to-advance (step 6) ── */
  const [indexIntroPhase, setIndexIntroPhase] = useState(0);
  const [indexPhase, setIndexPhase] = useState(0);
  useEffect(() => {
    if (!isActive) { setIndexPhase(0); setIndexIntroPhase(0); return; }
    if (chartStep !== 6) { setIndexPhase(0); setIndexIntroPhase(0); return; }
    if (skipAnimation) { setIndexPhase(TIMELINE_EVENTS.length); setIndexIntroPhase(2); return; }
    setIndexIntroPhase(0);
    const t1 = setTimeout(() => setIndexIntroPhase(1), 600);
    const t2 = setTimeout(() => setIndexIntroPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [chartStep, skipAnimation, isActive]);

  useEffect(() => {
    if (requestedPhase !== undefined && requestedPhase !== indexPhase) {
      setIndexPhase(requestedPhase);
    }
  }, [requestedPhase]);

  const advanceTimeline = () => {
    if (indexPhase < TIMELINE_EVENTS.length) setIndexPhase(prev => prev + 1);
  };
  const retreatTimeline = () => {
    if (indexPhase > 0) setIndexPhase(prev => prev - 1);
  };

  useEffect(() => {
    onTimelinePhase?.(indexPhase);
  }, [indexPhase, onTimelinePhase]);

  const [indexMorphFrom, setIndexMorphFrom] = useState(0);
  const [indexMorphProgress, setIndexMorphProgress] = useState(1);
  const [kpiRevealed, setKpiRevealed] = useState(false);
  const prevIndexPhaseRef = useRef(0);
  useLayoutEffect(() => {
    if (!isActive) { setIndexMorphProgress(0); setKpiRevealed(false); return; }
    const prev = prevIndexPhaseRef.current;
    prevIndexPhaseRef.current = indexPhase;
    if (indexPhase === prev) { setIndexMorphProgress(1); return; }
    setIndexMorphFrom(prev);
    setIndexMorphProgress(0);
    setKpiRevealed(false);
    if (skipAnimation || shareMode) { setIndexMorphProgress(1); setKpiRevealed(true); return; }
    const isFirstEvent = prev === 0;
    const CARD_DELAY = isFirstEvent ? 400 : 200;
    const MORPH_DURATION = isFirstEvent ? 1200 : 900;
    const KPI_DELAY = isFirstEvent ? 500 : 300;
    const c1 = 1.70158;
    const c3 = c1 + 1;
    let frame: number;
    const delayTimer = setTimeout(() => {
      let start = 0;
      const tick = (now: number) => {
        if (!start) start = now;
        const raw = Math.min(1, (now - start) / MORPH_DURATION);
        const eased = isFirstEvent
          ? 1 - Math.pow(1 - raw, 3)
          : 1 + c3 * Math.pow(raw - 1, 3) + c1 * Math.pow(raw - 1, 2);
        setIndexMorphProgress(Math.max(0, eased));
        if (raw < 1) frame = requestAnimationFrame(tick);
        else setIndexMorphProgress(1);
      };
      frame = requestAnimationFrame(tick);
    }, CARD_DELAY);
    const kpiTimer = setTimeout(() => setKpiRevealed(true), CARD_DELAY + MORPH_DURATION + KPI_DELAY);
    return () => { clearTimeout(delayTimer); clearTimeout(kpiTimer); cancelAnimationFrame(frame); };
  }, [indexPhase, skipAnimation, isActive]);

  const PORTFOLIO_DELAYS = [0, 600, 2200, 3800, 4500] as const;
  const portfolioPhase = usePhaseSequence(PORTFOLIO_DELAYS, { active: isActive, skip: !!skipAnimation, enabled: chartStep === 8 });

  /* ── Derived state ── */
  const showCurve = chartStep >= 1;
  const isAllToCurve = chartStep >= 5;
  const isIndexShift = chartStep === 6;
  const isPortfolioHero = chartStep === 7;
  const isPortfolio = chartStep === 8;
  const activeIndexCurve = isIndexShift && indexPhase > 0 ? curve.indexCurves[indexPhase - 1] : null;
  const currentEvent = indexPhase > 0 ? TIMELINE_EVENTS[indexPhase - 1] : null;

  const morphedIndexCurveD = useMemo(() => {
    if (!isIndexShift) return curve.d;
    if (indexPhase === 0 && indexMorphProgress >= 1) return curve.d;
    const fromPts = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].pts : curve.navyPts;
    const toPts = indexPhase > 0 ? curve.indexCurves[indexPhase - 1].pts : curve.navyPts;
    if (indexMorphProgress >= 1) return "M " + toPts.map(p => `${p.x},${p.y}`).join(" L ");
    return "M " + fromPts.map((fp, i) => {
      const tp = toPts[i];
      return `${fp.x + (tp.x - fp.x) * indexMorphProgress},${fp.y + (tp.y - fp.y) * indexMorphProgress}`;
    }).join(" L ");
  }, [isIndexShift, indexPhase, indexMorphFrom, indexMorphProgress, curve]);

  const ghostIndexCurveD = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].d : curve.d;

  const currentKpi = useMemo(() => {
    if (!isIndexShift) return BASELINE_KPI;
    if (indexPhase === 0 && indexMorphProgress >= 1) return BASELINE_KPI;
    const targetKpi = indexPhase > 0 ? TIMELINE_EVENTS[indexPhase - 1].kpi : BASELINE_KPI;
    const fromKpi = indexMorphFrom > 0 ? TIMELINE_EVENTS[indexMorphFrom - 1].kpi : BASELINE_KPI;
    if (indexMorphProgress >= 1) return targetKpi;
    return {
      winRate: fromKpi.winRate + (targetKpi.winRate - fromKpi.winRate) * indexMorphProgress,
      priceAdoption: fromKpi.priceAdoption + (targetKpi.priceAdoption - fromKpi.priceAdoption) * indexMorphProgress,
      marginImpact: fromKpi.marginImpact + (targetKpi.marginImpact - fromKpi.marginImpact) * indexMorphProgress,
    };
  }, [isIndexShift, indexPhase, indexMorphFrom, indexMorphProgress]);

  const currentMonth = useMemo(() => {
    if (!isIndexShift) return 0;
    if (indexPhase === 0 && indexMorphProgress >= 1) return 0;
    const targetMo = indexPhase > 0 ? TIMELINE_EVENTS[indexPhase - 1].month : 0;
    const fromMo = indexMorphFrom > 0 ? TIMELINE_EVENTS[indexMorphFrom - 1].month : 0;
    if (indexMorphProgress >= 1) return targetMo;
    return fromMo + (targetMo - fromMo) * indexMorphProgress;
  }, [isIndexShift, indexPhase, indexMorphFrom, indexMorphProgress]);

  const timelineTargetMonth = useMemo(() => {
    if (!isIndexShift || indexPhase === 0) return 0;
    return TIMELINE_EVENTS[indexPhase - 1].month;
  }, [isIndexShift, indexPhase]);

  const kpiDelta = useMemo(() => {
    if (!isIndexShift || indexPhase === 0) return { winRate: 0, priceAdoption: 0, marginImpact: 0, eventLabel: "" };
    const current = TIMELINE_EVENTS[indexPhase - 1].kpi;
    const prev = indexPhase > 1 ? TIMELINE_EVENTS[indexPhase - 2].kpi : BASELINE_KPI;
    return {
      winRate: Math.round(current.winRate - prev.winRate),
      priceAdoption: Math.round(current.priceAdoption - prev.priceAdoption),
      marginImpact: +(current.marginImpact - prev.marginImpact).toFixed(1),
      eventLabel: TIMELINE_EVENTS[indexPhase - 1].label,
    };
  }, [isIndexShift, indexPhase]);

  const dotOpacityBase = chartStep === 1 ? 0.15 : isSpotlight ? 0 : isIndexShift ? 0.35 : 1;
  const isLifted = spotPhase >= 1;

  const heading = isPortfolio
    ? "We do this across your entire portfolio"
    : isPortfolioHero
    ? STEP_CONTEXT[7]?.title || ""
    : isIndexShift
    ? "The market moves. The model moves with it."
    : isAllToCurve
      ? "Every price, aligned to the model"
      : isSpotlight
        ? SEGMENT_HIGHLIGHTS[spotlightIdx].label
        : STEP_CONTEXT[chartStep]?.title || "Detect patterns, refine pricing guidance";

  const subtitle = isPortfolio
      ? "Every customer–end market combination gets its own model — continuously recalibrated as the market shifts."
      : isPortfolioHero
      ? STEP_CONTEXT[7]?.body || null
      : isIndexShift
      ? null
      : isSpotlight
        ? SEGMENT_HIGHLIGHTS[spotlightIdx].beforeBody
        : STEP_CONTEXT[chartStep]?.body || null;

  const spotlightAfterLine = isSpotlight && spotPhase >= 1 ? SEGMENT_HIGHLIGHTS[spotlightIdx].afterBody : null;

  const handleSpotClick = () => {
    if (!isSpotlight) return;
    if (spotRefinedForStep.current !== chartStep) {
      spotRefinedForStep.current = chartStep;
      setSpotPhase(2);
      onSpotlightRefined?.();
    } else {
      onAutoAdvance?.();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-2">

      {/* Title — fixed-height container so chart never resizes */}
      <div className="relative w-full" style={{ height: 76, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
        <AnimatePresence>
          {chartStep === 0 && (
            <motion.div
              key="intro-title"
              className="absolute inset-0 flex flex-col items-center justify-start"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center gap-1">
                <motion.h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: introPhase >= 1 && introPhase < 3 ? 1 : 0,
                    y: introPhase >= 1 && introPhase < 3 ? 0 : introPhase >= 3 ? -12 : 8,
                    height: introPhase >= 3 ? 0 : "auto",
                    marginBottom: introPhase >= 3 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Every product, priced right
                </motion.h2>
                <motion.h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: introPhase >= 2 && introPhase < 3 ? 1 : 0,
                    y: introPhase >= 2 && introPhase < 3 ? 0 : introPhase >= 3 ? -12 : 8,
                    height: introPhase < 2 || introPhase >= 3 ? 0 : "auto",
                    marginBottom: introPhase < 2 || introPhase >= 3 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  But each price was set on its own
                </motion.h2>
                <AnimatePresence>
                  {introPhase >= 3 && (
                    <motion.h2
                      className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
                      style={{ color: STRAT_BLUE }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      Now the model looks at all of them at once
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>
              <motion.p
                className="mx-auto mt-2 max-w-xl text-center text-[1.05rem] font-medium leading-relaxed"
                style={{ color: MUTED }}
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 4 ? 1 : 0, y: introPhase >= 4 ? 0 : 6 }}
                transition={{ duration: 0.4 }}
              >
                Thousands of transactions, seen together,{" "}
                <span className="font-bold" style={{ color: NAVY, whiteSpace: "nowrap", textDecoration: "underline", textDecorationColor: STRAT_BLUE, textUnderlineOffset: "4px", textDecorationThickness: "2px" }}>reveal the shape of your market</span>
                &nbsp;— and every price gets refined against&nbsp;it.
              </motion.p>
            </motion.div>
          )}
          {isPortfolio && (
            <motion.div
              key="portfolio-title"
              className="absolute inset-0 flex flex-col items-center justify-start"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center gap-1">
                <motion.h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{
                    opacity: portfolioPhase < 2 ? 1 : 0,
                    y: portfolioPhase >= 2 ? -12 : 0,
                    height: portfolioPhase >= 2 ? 0 : "auto",
                    marginBottom: portfolioPhase >= 2 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Every customer–market combination gets its own model
                </motion.h2>
                <motion.h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: portfolioPhase >= 1 && portfolioPhase < 3 ? 1 : 0,
                    y: portfolioPhase >= 1 && portfolioPhase < 3 ? 0 : portfolioPhase >= 3 ? -12 : 8,
                    height: portfolioPhase < 1 || portfolioPhase >= 3 ? 0 : "auto",
                    marginBottom: portfolioPhase < 1 || portfolioPhase >= 3 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Then another. And another.
                </motion.h2>
                <AnimatePresence>
                  {portfolioPhase >= 3 && (
                    <motion.h2
                      className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
                      style={{ color: STRAT_BLUE }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      We do this across your entire portfolio
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>
              <motion.p
                className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed"
                style={{ color: MUTED }}
                initial={{ opacity: 1, y: 0 }}
                animate={{
                  opacity: portfolioPhase < 1 || portfolioPhase >= 4 ? 1 : 0,
                  y: portfolioPhase < 1 || portfolioPhase >= 4 ? 0 : 6,
                }}
                transition={{ duration: 0.4 }}
              >
                {portfolioPhase < 1
                  ? "Each with unique price sensitivities, calibrated independently."
                  : <>Every customer–end market combination gets its own model — continuously{" "}
                    <span className="font-bold" style={{ color: NAVY, whiteSpace: "nowrap", textDecoration: "underline", textDecorationColor: STRAT_BLUE, textUnderlineOffset: "4px", textDecorationThickness: "2px" }}>recalibrated as the market shifts</span>.</>
                }
              </motion.p>
            </motion.div>
          )}
          {isPortfolioHero && (
            <motion.div
              key="hero-title"
              className="absolute inset-0 flex flex-col items-center justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: NAVY }}
              >
                {heading}
              </motion.h2>
              {subtitle && (
                <motion.p
                  className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed"
                  style={{ color: MUTED }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
          )}
          {chartStep > 0 && !isPortfolio && !isPortfolioHero && (
            <motion.div
              key={`step-title-${chartStep === 1 ? 'curve-intro' : `step-${chartStep}`}`}
              className="absolute inset-0 flex flex-col items-center justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: NAVY }}
              >
                {isIndexShift ? (
                  <>
                    The market moves.{" "}
                    <span className="relative inline-block">
                      The model moves with it.
                      <motion.span
                        className="absolute left-0 right-0 h-[2.5px] rounded-full"
                        style={{ backgroundColor: STRAT_BLUE, bottom: -3, transformOrigin: "left" }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: indexIntroPhase >= 1 ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    </span>
                  </>
                ) : heading}
              </motion.h2>
              {subtitle && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={chartStep === 1 ? 'curve-subtitle' : `step-${chartStep}`}
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed"
                    style={{ color: MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    {subtitle}
                  </motion.p>
                </AnimatePresence>
              )}
              <AnimatePresence>
                {spotlightAfterLine && (
                  <motion.p
                    key={`after-${spotlightIdx}`}
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] font-medium leading-relaxed"
                    style={{ color: MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {spotlightAfterLine}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified chart region */}
      <div className={`relative w-full flex-1 min-h-0 flex flex-col overflow-hidden${isIndexShift ? ' rounded-2xl mt-2' : ''}`} style={isIndexShift ? { border: `1px solid ${NAVY}0F` } : undefined}>

      {/* Timeline area — animated height prevents layout jumps */}
      <motion.div
        className="relative w-full flex-shrink-0"
        initial={false}
        animate={{ height: isIndexShift && indexIntroPhase >= 2 ? 140 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <AnimatePresence>
          {isIndexShift && indexIntroPhase >= 2 && (
            <motion.div
              key="timeline-strip"
              className="absolute inset-x-0 top-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TimelineStrip
                indexPhase={indexPhase}
                indexMorphProgress={indexMorphProgress}
                currentMonth={currentMonth}
                currentEvent={currentEvent}
                advanceTimeline={advanceTimeline}
                retreatTimeline={retreatTimeline}
                setIndexPhase={setIndexPhase}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chart area */}
      <div className="relative w-full flex-1 min-h-0 mt-0">
        {/* Wireframe skeleton — visible during timeline intro */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: isIndexShift && indexIntroPhase < 2 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ pointerEvents: "none" }}
        >
          <svg viewBox={`0 -6 ${CURVE_SLOT.x + CURVE_SLOT.w + 40} ${BASE_Y + 30}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <line x1={CURVE_SLOT.x} y1={CURVE_SLOT.y} x2={CURVE_SLOT.x} y2={BASE_Y} stroke={NAVY} strokeWidth={1} strokeDasharray="4 3" opacity={0.18} />
            <line x1={CURVE_SLOT.x} y1={BASE_Y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={BASE_Y} stroke={NAVY} strokeWidth={1} strokeDasharray="4 3" opacity={0.18} />
            {Array.from({ length: 5 }, (_, i) => {
              const y = CURVE_SLOT.y + ((i + 1) / 6) * CURVE_SLOT.h;
              return <line key={`rsg-h${i}`} x1={CURVE_SLOT.x} y1={y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={y} stroke={NAVY} strokeWidth={0.5} strokeDasharray="3 5" opacity={0.07} />;
            })}
            <path
              d={curve.d}
              fill="none" stroke={NAVY} strokeWidth={2} strokeDasharray="6 4" opacity={0.14}
            />
            {[
              [0.03, -4], [0.05, 12], [0.08, -10], [0.10, 20], [0.06, 35],
              [0.14, -8], [0.12, 28], [0.18, 15], [0.16, -5], [0.20, 32],
              [0.25, 8], [0.22, -12], [0.30, 18], [0.35, -6], [0.28, 25],
              [0.42, 12], [0.50, -4], [0.45, 20], [0.55, 8], [0.60, 15],
              [0.65, -8], [0.70, 10], [0.75, 5], [0.82, -5], [0.90, 8],
            ].map(([t, offsetY], i) => {
              const pt = curve.sampleAt(t);
              return <circle key={`rsg-d${i}`} cx={pt.x} cy={Math.max(CURVE_SLOT.y + 2, Math.min(BASE_Y - 2, pt.y + offsetY))} r={1.8} fill={NAVY} opacity={0.09} />;
            })}
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col"
          initial={{ opacity: 1, y: 0 }}
          animate={{
            opacity: isPortfolio || isPortfolioHero ? 0 : isIndexShift && indexIntroPhase < 2 ? 0 : 1,
            y: 0,
          }}
          transition={{ duration: 1.0, ease: EASE }}
          style={isPortfolio || isPortfolioHero ? { pointerEvents: "none" as const } : undefined}
        >
          <div className="relative min-w-0 flex-1 flex items-center justify-center" style={isIndexShift ? { paddingRight: 175 } : undefined}>
            <RefineChart
              curve={curve}
              morphedIndexCurveD={morphedIndexCurveD}
              ghostIndexCurveD={ghostIndexCurveD}
              chartStep={chartStep}
              showCurve={showCurve}
              isAllToCurve={isAllToCurve}
              isIndexShift={isIndexShift}
              isSpotlight={isSpotlight}
              spotlightIdx={spotlightIdx}
              spotPhase={spotPhase}
              isLifted={isLifted}
              dotOpacityBase={dotOpacityBase}
              introPhase={introPhase}
              activeIndexCurve={activeIndexCurve}
              indexMorphFrom={indexMorphFrom}
              indexMorphProgress={indexMorphProgress}
              indexPhase={indexPhase}
              timelineTargetMonth={timelineTargetMonth}
              shareMode={shareMode}
              isActive={isActive}
              skipAnimation={skipAnimation}
              onSpotClick={handleSpotClick}
            />
          </div>
        </motion.div>

        <PortfolioGrid isPortfolio={isPortfolio} isPortfolioHero={isPortfolioHero} isActive={isActive} shareMode={shareMode} portfolioPhase={portfolioPhase} />
      </div>

      {/* KPI sidebar — spans full chart region height (timeline + chart) */}
      <AnimatePresence>
        {isIndexShift && indexIntroPhase >= 2 && (
          <motion.div
            key="kpi-sidebar"
            className="absolute right-0 top-0 bottom-0 z-20"
            style={{ width: 175, borderLeft: `1px solid ${NAVY}0A` }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <KpiSidebar
              indexPhase={indexPhase}
              currentKpi={currentKpi}
              kpiDelta={kpiDelta}
              kpiRevealed={kpiRevealed}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* end unified chart region */}
    </div>
  );
}
