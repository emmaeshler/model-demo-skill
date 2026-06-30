"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { makeCurve } from "../visuals/demand-curve";

const NAVY = "#00446A";
const ORANGE = "#C27A3A";
const TEAL = "#4A8FA8";
const MUTED = "#8A9AAA";
const STRAT_BLUE = "#2A7BA5";
const GREEN = "#4A8A5C";
const RED = "#A65A52";

export const REFINE_TOTAL_STEPS = 8;

const CURVE_SLOT = { x: 50, y: 20, w: 460, h: 140 };
const BASE_Y = CURVE_SLOT.y + CURVE_SLOT.h;

/* ── Seeded PRNG (same as power-slide) ─────────────────── */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Dot status types and colors ─────────────────────────── */

type DotStatus = "won" | "lost" | "overridden" | "adjusted";

const STATUS_COLORS: Record<DotStatus, string> = {
  won: GREEN,
  lost: RED,
  overridden: ORANGE,
  adjusted: TEAL,
};

const STATUS_WEIGHTS: { status: DotStatus; weight: number }[] = [
  { status: "won", weight: 0.4 },
  { status: "adjusted", weight: 0.25 },
  { status: "overridden", weight: 0.2 },
  { status: "lost", weight: 0.15 },
];

interface ScatterDot {
  t: number;
  offsetY: number;
  jitterX: number;
  status: DotStatus;
  r: number;
  driftDx: number;
  driftDy: number;
  driftDuration: number;
  driftDelay: number;
}

const rng = mulberry32(73);

function pickStatus(): DotStatus {
  const roll = rng();
  let cumulative = 0;
  for (const { status, weight } of STATUS_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return status;
  }
  return "won";
}

const DOT_COUNT = 180;
const SCATTER_DOTS: ScatterDot[] = Array.from({ length: DOT_COUNT }, () => ({
  t: 0.03 + rng() * 0.94,
  offsetY: (rng() - 0.35) * 120,
  jitterX: (rng() - 0.5) * 14,
  status: pickStatus(),
  r: (() => { const s = rng(); return s < 0.5 ? 0.4 + rng() * 0.4 : s < 0.85 ? 0.7 + rng() * 0.6 : 1.1 + rng() * 0.7; })(),
  driftDx: (rng() - 0.5) * 4,
  driftDy: (rng() - 0.5) * 3,
  driftDuration: 4 + rng() * 4,
  driftDelay: rng() * 5,
}));

const SEGMENT_ZONES = [
  { tStart: 0.0, tEnd: 0.36, label: "High win rate", color: GREEN },
  { tStart: 0.48, tEnd: 0.74, label: "Competitive pressure", color: RED },
  { tStart: 0.71, tEnd: 0.83, label: "Cost ↑", color: ORANGE },
  { tStart: 0.81, tEnd: 1.0, label: "Price sensitive", color: TEAL },
];

const SEGMENT_HIGHLIGHTS = [
  {
    t: 0.12,
    label: "QuickParts",
    offsetY: 28,
    oldPrice: "$22.10",
    newPrice: "$24.20",
    change: "+$2.10",
    dotColor: ORANGE,
    beforeTitle: "Priced too low",
    beforeBody: "No competition in this niche, but cost increases aren’t reflected in the price.",
    afterTitle: "Adjusted +$2.10",
    afterBody: "Cost pressure passes through — price moves to the optimal curve.",
  },
  {
    t: 0.35,
    label: "Acme",
    offsetY: 24,
    oldPrice: "$19.24",
    newPrice: "$19.80",
    change: "+$0.56",
    dotColor: NAVY,
    beforeTitle: "Underpriced",
    beforeBody: "Win rate is climbing — a pattern, not noise. There’s room to price higher.",
    afterTitle: "Adjusted +$0.56",
    afterBody: "Price rises to capture margin the data says is available.",
  },
  {
    t: 0.72,
    label: "MedSupply",
    offsetY: 22,
    oldPrice: "$14.89",
    newPrice: "$14.50",
    change: "−$0.39",
    dotColor: TEAL,
    beforeTitle: "At risk",
    beforeBody: "A new entrant is undercutting — willingness to pay is dropping in this region.",
    afterTitle: "Adjusted −$0.39",
    afterBody: "Price drops to defend the deal against the competitive threat.",
  },
];

const LEGEND_ITEMS = [
  { label: "Won", color: GREEN },
  { label: "Lost", color: RED },
  { label: "Overridden", color: ORANGE },
  { label: "Adjusted", color: TEAL },
];

const STEP_CONTEXT: Record<number, { title: string; body: string }> = {
  0: {
    title: "Prices are scattered",
    body: "Every transaction is priced independently — most too low. There’s no guiding strategy.",
  },
  1: {
    title: "Segmentation detected",
    body: "Patterns emerge in specific segments — each signals a different refinement.",
  },
  2: {
    title: "The optimal demand curve",
    body: "The model fits a demand curve to the data — the price each deal should hit.",
  },
  3: {
    title: "QuickParts",
    body: "Let’s examine how the model adjusts pricing for specific deals relative to the curve.",
  },
  4: {
    title: "Acme",
    body: "Let’s examine how the model adjusts pricing for specific deals relative to the curve.",
  },
  5: {
    title: "MedSupply",
    body: "Let’s examine how the model adjusts pricing for specific deals relative to the curve.",
  },
  6: {
    title: "Every price, optimized",
    body: "Every transaction is now aligned to the demand curve — lifting underpriced deals while protecting wins.",
  },
};

export function RefineSlide({ step }: { step: number }) {
  const curve = useMemo(() => {
    const raw = makeCurve(CURVE_SLOT, 5);
    const flipY = (y: number) => 2 * CURVE_SLOT.y + CURVE_SLOT.h - y;
    const n = 64;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const pt = raw.sampleAt(i / n);
      return `${pt.x},${flipY(pt.y)}`;
    });
    return {
      d: "M " + pts.join(" L "),
      sampleAt: (t: number) => {
        const pt = raw.sampleAt(t);
        return { x: pt.x, y: flipY(pt.y) };
      },
    };
  }, []);

  const chartStep = step - 1;
  const [chipReady, setChipReady] = useState(chartStep > 0);
  useEffect(() => {
    if (chartStep === 0 && !chipReady) {
      const t = setTimeout(() => setChipReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [chartStep, chipReady]);

  const [liftedDots, setLiftedDots] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (chartStep >= 3 && chartStep <= 5) {
      const idx = chartStep - 3;
      const t = setTimeout(() => setLiftedDots((prev) => {
        const next = new Set(prev);
        for (let i = 0; i < idx; i++) next.add(i);
        return next;
      }));
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setLiftedDots(new Set()));
      return () => clearTimeout(t);
    }
  }, [chartStep]);

  /* ── Intro phase for chartStep 0 animated title build ── */
  const [introPhase, setIntroPhase] = useState(chartStep === 0 ? 0 : 4);
  useEffect(() => {
    if (chartStep !== 0) {
      const t0 = setTimeout(() => setIntroPhase(4));
      return () => clearTimeout(t0);
    }
    const t0 = setTimeout(() => setIntroPhase(0));
    const t1 = setTimeout(() => setIntroPhase(1), 800);
    const t2 = setTimeout(() => setIntroPhase(2), 1800);
    const t3 = setTimeout(() => setIntroPhase(3), 3200);
    const t4 = setTimeout(() => setIntroPhase(4), 4200);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep]);

  /* ── Step 0: Full-screen transition moment ─────────── */
  if (step === 0) {
    return (
      <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-5xl flex-col items-center justify-center px-6">
        <motion.span
          className="relative mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${STRAT_BLUE}15`, color: STRAT_BLUE }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ border: `1.5px solid ${STRAT_BLUE}` }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
          Strategic Guidance
        </motion.span>

        <motion.h2
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: STRAT_BLUE }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
        >
          The prediction set the price.
          <br />
          Now strategy shapes the outcome.
        </motion.h2>

        <motion.p
          className="mt-4 max-w-md text-center text-base leading-relaxed"
          style={{ color: `${NAVY}99` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
        >
          The strategic guidance layer takes over — aligning prices with your
          business rules, goals, and market position.
        </motion.p>
      </div>
    );
  }

  /* ── Steps 1-6: Chart animation ────────────────────── */

  const showSegments = chartStep === 1 || chartStep === 2;
  const segmentOpacity = chartStep === 1 ? 0.15 : 0.04;
  const showCurve = chartStep >= 2;
  const isSpotlight = chartStep >= 3 && chartStep <= 5;
  const dotOpacityBase = chartStep === 1 ? 0.2 : chartStep === 2 ? 0.15 : isSpotlight ? 0 : 1;
  const spotlightIdx = isSpotlight ? chartStep - 3 : -1;
  const isAllToCurve = chartStep >= 6;

  const heading = isAllToCurve
    ? "Every price, aligned to the curve"
    : chartStep === 1
      ? "The model detects market segmentation"
      : chartStep === 2
        ? "The optimal demand curve"
        : chartStep === 0
          ? "Prices are scattered across the board"
          : isSpotlight
            ? "How the model adjusts specific deals"
            : "Detect patterns, refine pricing guidance";

  const activeHighlight = isSpotlight ? SEGMENT_HIGHLIGHTS[spotlightIdx] : null;
  const isLifted = isSpotlight && liftedDots.has(spotlightIdx);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* Badge */}
      <div className="relative mb-3 flex h-5 shrink-0 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!chipReady ? (
            <motion.span
              key="execute-chip"
              className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.4, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              3 · Execute
            </motion.span>
          ) : (
            <motion.span
              key="refine-chip"
              className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ backgroundColor: `${TEAL}12`, color: TEAL }}
              initial={chartStep === 0 ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              Refine
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Title — fixed-height container so chart never resizes */}
      <div className="relative w-full" style={{ height: 100, flexShrink: 0 }}>
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
                    opacity: introPhase >= 3 ? 0 : 1,
                    y: introPhase >= 3 ? -12 : 0,
                    height: introPhase >= 3 ? 0 : "auto",
                    marginBottom: introPhase >= 3 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Execute priced one deal at a time
                </motion.h2>
                <motion.h2
                  className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: introPhase >= 1 && introPhase < 3 ? 1 : 0,
                    y: introPhase >= 1 && introPhase < 3 ? 0 : introPhase >= 3 ? -12 : 8,
                    height: introPhase >= 3 ? 0 : "auto",
                    marginBottom: introPhase >= 3 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Now step back and look at all of them
                </motion.h2>
                <AnimatePresence>
                  {introPhase >= 2 && (
                    <motion.h2
                      className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
                      style={{ color: STRAT_BLUE }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      Every price, refined together
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>
              <motion.p
                className="mx-auto mt-2 max-w-lg text-center text-[1.05rem] leading-relaxed"
                style={{ color: MUTED }}
                initial={{ opacity: 0 }}
                animate={{ opacity: introPhase >= 3 ? 1 : 0, y: introPhase >= 3 ? 0 : 6 }}
                transition={{ duration: 0.4 }}
              >
                The strategic layer looks across your entire portfolio&nbsp;— aligning
                each price to the optimal demand&nbsp;curve.
              </motion.p>
            </motion.div>
          )}
          {chartStep > 0 && (
            <motion.div
              key={`step-title-${chartStep}`}
              className="absolute inset-0 flex flex-col items-center justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: chartStep === 1 ? 0.5 : 0 }}
            >
              <motion.h2
                className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: NAVY }}
              >
                {heading}
              </motion.h2>
              {STEP_CONTEXT[chartStep] && (
                <motion.p
                  className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                  style={{ color: MUTED }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: chartStep === 1 ? 0.7 : 0.15 }}
                >
                  {STEP_CONTEXT[chartStep].body}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <motion.div
        className="w-full flex-1 min-h-0 mt-1 flex flex-col"
        style={{ maxHeight: "calc(100% - 160px)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: chartStep === 0 && introPhase < 3 ? 0 : 1,
          y: chartStep === 0 && introPhase < 3 ? 20 : 0,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Chart */}
        <div className="relative min-w-0 flex-1 flex items-center justify-center">
          {/* Spotlight card — beside the highlighted dot */}
          <AnimatePresence mode="wait">
            {isSpotlight && activeHighlight && (
              <motion.div
                key={`overlay-${spotlightIdx}-${isLifted ? "after" : "before"}`}
                className="absolute z-10 w-52 rounded-xl border-l-4 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
                style={{
                  borderLeftColor: activeHighlight.dotColor,
                  ...(spotlightIdx === 2
                    ? { right: "4%", top: "18%" }
                    : spotlightIdx === 1
                      ? { left: "48%", top: "14%" }
                      : { left: "22%", top: "14%" }),
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: activeHighlight.dotColor }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: activeHighlight.dotColor }}>
                    {activeHighlight.label}
                  </span>
                </div>
                <p className="text-sm font-bold leading-snug" style={{ color: isLifted ? GREEN : activeHighlight.dotColor }}>
                  {isLifted ? activeHighlight.afterTitle : activeHighlight.beforeTitle}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>
                  {isLifted ? activeHighlight.afterBody : activeHighlight.beforeBody}
                </p>
                {isLifted ? (
                  <motion.div
                    className="mt-1.5 flex items-baseline gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <span className="text-base font-extrabold" style={{ color: GREEN }}>{activeHighlight.change}</span>
                    <span className="text-[11px]" style={{ color: MUTED }}>{activeHighlight.oldPrice} → {activeHighlight.newPrice}</span>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setLiftedDots((prev) => new Set([...prev, spotlightIdx]))}
                    className="mt-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: activeHighlight.dotColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  >
                    Apply adjustment →
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
            <svg
              viewBox={`0 -6 ${CURVE_SLOT.x + CURVE_SLOT.w + 40} ${BASE_Y + 30}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Legend — top-right inside chart */}
              <g>
                {LEGEND_ITEMS.map((item, li) => (
                  <g key={item.label} transform={`translate(${CURVE_SLOT.x + CURVE_SLOT.w - 168 + li * 56}, 0)`}>
                    <circle cx={0} cy={0} r={2.5} fill={item.color} />
                    <text x={5} y={3} fontSize="7" fontWeight="600" fill={NAVY}>{item.label}</text>
                  </g>
                ))}
              </g>

              {/* Axes */}
              <line
                x1={CURVE_SLOT.x}
                y1={BASE_Y}
                x2={CURVE_SLOT.x + CURVE_SLOT.w}
                y2={BASE_Y}
                stroke={`${NAVY}30`}
                strokeWidth={1.2}
              />
              <line
                x1={CURVE_SLOT.x}
                y1={CURVE_SLOT.y}
                x2={CURVE_SLOT.x}
                y2={BASE_Y}
                stroke={`${NAVY}30`}
                strokeWidth={1.2}
              />
              <text
                x={30}
                y={CURVE_SLOT.y + CURVE_SLOT.h / 2}
                textAnchor="middle"
                transform={`rotate(-90, 30, ${CURVE_SLOT.y + CURVE_SLOT.h / 2})`}
                style={{ fill: MUTED, fontSize: 7, fontWeight: 500, fontFamily: "inherit" }}
              >
                Price
              </text>

              <text
                x={CURVE_SLOT.x + CURVE_SLOT.w / 2}
                y={BASE_Y + 14}
                textAnchor="middle"
                style={{ fill: MUTED, fontSize: 7, fontWeight: 500, fontFamily: "inherit" }}
              >
                Volume
              </text>

              {/* Segmentation zones */}
              {showSegments &&
                SEGMENT_ZONES.map((zone, zi) => {
                  const x1 = curve.sampleAt(Math.max(0, zone.tStart)).x;
                  const x2 = curve.sampleAt(Math.min(1, zone.tEnd)).x;
                  const zoneH = CURVE_SLOT.h;
                  return (
                    <motion.g
                      key={zone.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: zi * 0.12 }}
                    >
                      <motion.rect
                        x={x1}
                        y={CURVE_SLOT.y}
                        width={x2 - x1}
                        height={zoneH}
                        fill={zone.color}
                        rx={4}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: segmentOpacity }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.text
                        x={(x1 + x2) / 2}
                        y={CURVE_SLOT.y + CURVE_SLOT.h / 2 + 4}
                        fontSize="10"
                        fontWeight="700"
                        fill={zone.color}
                        textAnchor="middle"
                        style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: chartStep === 1 ? 1 : 0.12 }}
                        transition={{ duration: 0.5, delay: chartStep === 1 ? 0.2 + zi * 0.12 : 0 }}
                      >
                        {zone.label}
                      </motion.text>
                    </motion.g>
                  );
                })}

              {/* Demand curve */}
              {showCurve && (
                <motion.path
                  d={curve.d}
                  fill="none"
                  stroke={NAVY}
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )}

              {/* Optimal demand curve label */}
              {showCurve && (
                <motion.text
                  x={curve.sampleAt(0.5).x}
                  y={curve.sampleAt(0.5).y - 10}
                  fontSize="9"
                  fontWeight="700"
                  fill={NAVY}
                  textAnchor="middle"
                  style={{
                    stroke: "white",
                    strokeWidth: 3,
                    paintOrder: "stroke" as const,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isSpotlight ? 0.2 : isAllToCurve ? 0.3 : 0.5,
                  }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Optimal demand curve
                </motion.text>
              )}

              {/* Scatter dots */}
              {SCATTER_DOTS.map((dot, i) => {
                const pt = curve.sampleAt(dot.t);
                const baseCx = Math.max(CURVE_SLOT.x + 4, Math.min(CURVE_SLOT.x + CURVE_SLOT.w - 4, pt.x + dot.jitterX));
                const scatterY = Math.max(CURVE_SLOT.y + 4, Math.min(BASE_Y - 4, pt.y + dot.offsetY));
                const isBelowCurve = scatterY > pt.y;
                const targetY = isAllToCurve ? (isBelowCurve ? pt.y : scatterY) : scatterY;
                const dotColor = STATUS_COLORS[dot.status];
                const dotOpacity = dotOpacityBase;

                const driftCx = isAllToCurve
                  ? baseCx
                  : [baseCx, baseCx + dot.driftDx, baseCx - dot.driftDx * 0.6, baseCx];
                const driftCy = isAllToCurve
                  ? targetY
                  : [targetY, targetY + dot.driftDy, targetY - dot.driftDy * 0.6, targetY];

                return (
                  <motion.circle
                    key={`dot-${i}`}
                    r={dot.r}
                    fill={dotColor}
                    initial={{ cx: baseCx, cy: scatterY, opacity: 0, scale: 0 }}
                    animate={{
                      cx: driftCx,
                      cy: driftCy,
                      opacity: dotOpacity,
                      scale: 1,
                    }}
                    transition={{
                      cx: isAllToCurve
                        ? { duration: 0.7, delay: i * 0.01, ease: "easeInOut" }
                        : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      cy: isAllToCurve
                        ? { duration: 0.6 + (Math.abs(dot.offsetY) / 36) * 0.3, delay: i * 0.01, ease: "easeInOut" }
                        : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      opacity: {
                        delay: chartStep === 0 ? 0.3 + i * 0.012 : 0.1,
                        duration: isSpotlight ? 0.5 : 0.3,
                      },
                      scale: {
                        delay: chartStep === 0 ? 0.3 + i * 0.012 : 0.1,
                        type: "spring",
                        stiffness: 300,
                      },
                    }}
                  />
                );
              })}

              {/* Highlight product dots — start below curve, animate to curve */}
              {SEGMENT_HIGHLIGHTS.map((seg, si) => {
                const visible =
                  isAllToCurve || (isSpotlight && si <= spotlightIdx);
                if (!visible) return null;

                const pt = curve.sampleAt(seg.t);
                const belowY = pt.y + seg.offsetY;
                const isActive = isSpotlight && si === spotlightIdx;
                const isPast = isSpotlight && si < spotlightIdx;
                const dotLifted = isAllToCurve || liftedDots.has(si);
                const targetCy = dotLifted ? pt.y : belowY;

                return (
                  <g key={seg.label}>
                    {/* Dashed line from dot to curve position (before lift) */}
                    {isActive && !dotLifted && (
                      <motion.line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={belowY}
                        stroke={seg.dotColor}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      />
                    )}

                    {/* Target ring on the curve */}
                    {(isActive || isPast || isAllToCurve) && (
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r={10}
                        fill="none"
                        stroke={seg.dotColor}
                        strokeWidth={1.5}
                        strokeDasharray={dotLifted ? "0" : "4 3"}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                          opacity: dotLifted ? 0.5 : 0.3,
                          scale: 1,
                        }}
                        transition={{ duration: 0.5, delay: isActive ? 0.4 : 0.2 }}
                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                      />
                    )}

                    {/* Pulsing ring — click cue */}
                    {isActive && !dotLifted && (
                      <motion.circle
                        cx={pt.x}
                        cy={belowY}
                        r={12}
                        fill="none"
                        stroke={seg.dotColor}
                        strokeWidth={1}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        style={{ transformOrigin: `${pt.x}px ${belowY}px`, pointerEvents: "none" }}
                      />
                    )}

                    {/* Main dot — starts at belowY, lifts to curve */}
                    <motion.circle
                      cx={pt.x}
                      r={6}
                      fill="white"
                      stroke={seg.dotColor}
                      strokeWidth={2.5}
                      style={{ cursor: isActive && !dotLifted ? "pointer" : "default" }}
                      onClick={() => {
                        if (isActive && !dotLifted) {
                          setLiftedDots((prev) => new Set([...prev, si]));
                        }
                      }}
                      initial={{ cy: belowY, opacity: 0 }}
                      animate={{ cy: targetCy, opacity: 1 }}
                      transition={{
                        cy: { duration: 0.8, ease: "easeInOut" },
                        opacity: { duration: 0.3, delay: 0.1 },
                      }}
                    />

                    {/* Label below dot (before lift) */}
                    {isActive && !dotLifted && (
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <text
                          x={pt.x}
                          y={belowY + 18}
                          fontSize="9"
                          fontWeight="600"
                          fill={seg.dotColor}
                          textAnchor="middle"
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const }}
                        >
                          {seg.label}
                        </text>
                        <text
                          x={pt.x}
                          y={belowY + 28}
                          fontSize="10"
                          fontWeight="700"
                          fill={MUTED}
                          textAnchor="middle"
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const }}
                        >
                          {seg.oldPrice}
                        </text>
                      </motion.g>
                    )}

                    {/* Label above dot (after lift to curve) */}
                    {dotLifted && (
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : isPast ? 0.5 : 0.7 }}
                        transition={{ delay: isActive ? 0.6 : 0, duration: 0.4 }}
                      >
                        <text
                          x={pt.x}
                          y={pt.y - 20}
                          fontSize="9"
                          fontWeight="600"
                          fill={seg.dotColor}
                          textAnchor="middle"
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const }}
                        >
                          {seg.label}
                        </text>
                        <text
                          x={pt.x}
                          y={pt.y - 11}
                          fontSize="11"
                          fontWeight="800"
                          fill={seg.dotColor}
                          textAnchor="middle"
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const }}
                        >
                          {seg.newPrice}
                        </text>
                      </motion.g>
                    )}
                  </g>
                );
              })}
            </svg>
        </div>

      </motion.div>
    </div>
  );
}

