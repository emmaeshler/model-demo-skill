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

export const REFINE_TOTAL_STEPS = 7;

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
  chaosX: number;
  chaosY: number;
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
const SCATTER_DOTS: ScatterDot[] = Array.from({ length: DOT_COUNT }, () => {
  const zone = rng();
  let t: number;
  let offsetY: number;

  if (zone < 0.28) {
    // Upper-left cluster: low volume, above curve (higher prices)
    t = 0.02 + rng() * 0.22 + (rng() - 0.5) * 0.06;
    offsetY = -(rng() * 35 + 3);
  } else if (zone < 0.52) {
    // Lower-left cluster: low volume, below curve (lower prices)
    t = 0.04 + rng() * 0.24 + (rng() - 0.5) * 0.08;
    offsetY = rng() * 60 + 10;
  } else if (zone < 0.66) {
    // Bridge between upper and lower left clusters
    t = 0.06 + rng() * 0.20;
    offsetY = (rng() - 0.5) * 50;
  } else if (zone < 0.88) {
    // Trail sweeping right from lower cluster
    const progress = rng();
    t = 0.22 + progress * 0.58;
    offsetY = rng() * 45 + progress * 25;
  } else {
    // Sparse fill (avoid upper right)
    t = rng() * 0.85;
    let off = (rng() - 0.5) * 80;
    if (t > 0.45 && off < -15) {
      off = rng() * 40 + 5;
    }
    offsetY = off;
  }

  t = Math.max(0.03, Math.min(0.97, t));

  return {
    t,
    offsetY,
    jitterX: (rng() - 0.5) * 14,
    status: pickStatus(),
    r: (() => { const s = rng(); return s < 0.5 ? 0.4 + rng() * 0.4 : s < 0.85 ? 0.7 + rng() * 0.6 : 1.1 + rng() * 0.7; })(),
    driftDx: (rng() - 0.5) * 4,
    driftDy: (rng() - 0.5) * 3,
    driftDuration: 4 + rng() * 4,
    driftDelay: rng() * 5,
    chaosX: CURVE_SLOT.x + 10 + rng() * (CURVE_SLOT.w - 20),
    chaosY: CURVE_SLOT.y + 5 + rng() * (CURVE_SLOT.h - 10),
  };
});

const SEGMENT_ZONES = [
  { tStart: 0.0, tEnd: 0.36, label: "High win rate", color: GREEN, why: "Low competition — customers are willing to pay more here." },
  { tStart: 0.48, tEnd: 0.74, label: "Competitive pressure", color: RED, why: "Multiple bidders are driving prices down in this region." },
  { tStart: 0.71, tEnd: 0.83, label: "Cost ↑", color: ORANGE, why: "Rising input costs are squeezing margins on these products." },
  { tStart: 0.81, tEnd: 1.0, label: "Price sensitive", color: TEAL, why: "Customers will switch vendors over small price differences." },
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
    title: "Your optimal demand curve",
    body: "The model fits a demand curve across every product and customer — the price each deal should hit.",
  },
  3: {
    title: "QuickParts",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  4: {
    title: "Acme",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  5: {
    title: "MedSupply",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  6: {
    title: "Every price, optimized",
    body: "Every transaction is now aligned to the demand curve — lifting underpriced deals while protecting wins.",
  },
};

export function RefineSlide({ step, onAutoAdvance, skipAnimation }: { step: number; onAutoAdvance?: () => void; skipAnimation?: boolean }) {
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

  const chartStep = step;
  /* ── Intro phase for chartStep 0 animated title build ── */
  const [introPhase, setIntroPhase] = useState(skipAnimation ? 4 : chartStep === 0 ? 0 : 4);
  useEffect(() => {
    if (skipAnimation) {
      const t0 = setTimeout(() => setIntroPhase(4));
      return () => clearTimeout(t0);
    }
    if (chartStep !== 0) {
      const t0 = setTimeout(() => setIntroPhase(4));
      return () => clearTimeout(t0);
    }
    const t0 = setTimeout(() => setIntroPhase(0));
    const t1 = setTimeout(() => setIntroPhase(1), 400);
    const t2 = setTimeout(() => setIntroPhase(2), 2200);
    const t3 = setTimeout(() => setIntroPhase(3), 3600);
    const t4 = setTimeout(() => setIntroPhase(4), 4600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep, skipAnimation]);

  /* ── Sequential segment reveal for chartStep 1 ──── */
  const [segPhase, setSegPhase] = useState(-1);
  useEffect(() => {
    if (chartStep !== 1) {
      const t0 = setTimeout(() => setSegPhase(-1));
      return () => clearTimeout(t0);
    }
    if (skipAnimation) {
      const t0 = setTimeout(() => setSegPhase(3));
      return () => clearTimeout(t0);
    }
    const timers = [
      setTimeout(() => setSegPhase(-1)),
      setTimeout(() => setSegPhase(0), 800),
      setTimeout(() => setSegPhase(1), 3200),
      setTimeout(() => setSegPhase(2), 5400),
      setTimeout(() => setSegPhase(3), 7400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [chartStep, skipAnimation]);

  /* ── Spotlight auto-animation (steps 3-5) ────────────── */
  const isSpotlight = chartStep >= 3 && chartStep <= 5;
  const spotlightIdx = isSpotlight ? chartStep - 3 : -1;

  const [spotPhase, setSpotPhase] = useState(0);
  useEffect(() => {
    if (!isSpotlight) {
      const t0 = setTimeout(() => setSpotPhase(0));
      return () => clearTimeout(t0);
    }
    if (skipAnimation) {
      const t0 = setTimeout(() => setSpotPhase(3));
      return () => clearTimeout(t0);
    }
    const t0 = setTimeout(() => setSpotPhase(0));
    const t1 = setTimeout(() => setSpotPhase(1), 2200);
    const t2 = setTimeout(() => setSpotPhase(2), 3400);
    const t3 = setTimeout(() => setSpotPhase(3), 5200);
    const t4 = setTimeout(() => { onAutoAdvance?.(); }, 6800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep, isSpotlight, skipAnimation, onAutoAdvance]);

  /* ── Chart animation ────────────────────────────────── */

  const showSegments = chartStep === 1 || chartStep === 2;
  const showCurve = chartStep >= 2;
  const dotOpacityBase = chartStep === 1 ? 0.2 : chartStep === 2 ? 0.15 : isSpotlight ? 0 : 1;
  const isAllToCurve = chartStep >= 6;

  const activeSegZone = chartStep === 1 && segPhase >= 0 && segPhase < SEGMENT_ZONES.length ? SEGMENT_ZONES[segPhase] : null;

  const heading = isAllToCurve
    ? "Every price, aligned to the curve"
    : chartStep === 1
      ? "The model detects market segmentation"
      : chartStep === 2
        ? "Your optimal demand curve"
        : chartStep === 0
          ? "Prices are scattered across the board"
          : isSpotlight
            ? SEGMENT_HIGHLIGHTS[spotlightIdx].label
            : "Detect patterns, refine pricing guidance";

  const subtitle = chartStep === 1 && activeSegZone
    ? activeSegZone.why
    : isSpotlight
      ? (spotPhase >= 2 ? SEGMENT_HIGHLIGHTS[spotlightIdx].afterBody : SEGMENT_HIGHLIGHTS[spotlightIdx].beforeBody)
      : STEP_CONTEXT[chartStep]?.body || null;

  const activeHighlight = isSpotlight ? SEGMENT_HIGHLIGHTS[spotlightIdx] : null;
  const isLifted = spotPhase >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">

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
                    opacity: introPhase >= 1 && introPhase < 2 ? 1 : 0,
                    y: introPhase >= 1 && introPhase < 2 ? 0 : introPhase >= 2 ? -12 : 8,
                    height: introPhase >= 2 ? 0 : "auto",
                    marginBottom: introPhase >= 2 ? 0 : 4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  Every price, set on its own
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
              {subtitle && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={chartStep === 1 ? `seg-why-${segPhase}` : isSpotlight ? `spot-${chartStep}-${spotPhase >= 2 ? 'after' : 'before'}` : `step-${chartStep}`}
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                    style={{ color: activeSegZone ? activeSegZone.color : MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, delay: chartStep === 1 ? 0.1 : 0.15 }}
                  >
                    {subtitle}
                  </motion.p>
                </AnimatePresence>
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
          opacity: chartStep === 0 && introPhase < 1 ? 0 : 1,
          y: chartStep === 0 && introPhase < 1 ? 20 : 0,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Chart */}
        <div className="relative min-w-0 flex-1 flex items-center justify-center">
          {/* Spotlight card — auto-animating beside the highlighted dot */}
          <AnimatePresence mode="wait">
            {isSpotlight && activeHighlight && (
              <motion.div
                key={`overlay-${spotlightIdx}`}
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
                <AnimatePresence mode="wait">
                  {spotPhase < 2 ? (
                    <motion.div key="before" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                      <p className="text-sm font-bold leading-snug" style={{ color: activeHighlight.dotColor }}>
                        {activeHighlight.beforeTitle}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>
                        {activeHighlight.beforeBody}
                      </p>
                      <motion.div
                        className="mt-1.5 flex items-center gap-1.5 text-xs"
                        style={{ color: MUTED }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                      >
                        <span className="font-semibold">{activeHighlight.oldPrice}</span>
                        <span style={{ color: activeHighlight.dotColor }}>→ adjusting…</span>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div key="after" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                      <p className="text-sm font-bold leading-snug" style={{ color: GREEN }}>
                        {activeHighlight.afterTitle}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: MUTED }}>
                        {activeHighlight.afterBody}
                      </p>
                      <motion.div
                        className="mt-1.5 flex items-baseline gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        <span className="text-base font-extrabold" style={{ color: GREEN }}>{activeHighlight.change}</span>
                        <span className="text-[11px]" style={{ color: MUTED }}>{activeHighlight.oldPrice} → {activeHighlight.newPrice}</span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  <g key={item.label} transform={`translate(${CURVE_SLOT.x + CURVE_SLOT.w - 132 + li * 42}, 0)`}>
                    <circle cx={0} cy={0} r={1.2} fill={item.color} opacity={0.7} />
                    <text x={3.5} y={1.5} fontSize="4.5" fontWeight="500" fill={MUTED} style={{ fontFamily: "inherit" }}>{item.label}</text>
                  </g>
                ))}
              </g>

              {/* Subtle gridlines */}
              {Array.from({ length: 7 }, (_, i) => {
                const y = CURVE_SLOT.y + (i / 6) * CURVE_SLOT.h;
                return (
                  <line key={`gh${i}`} x1={CURVE_SLOT.x} y1={y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={y} stroke={`${NAVY}08`} strokeWidth={0.5} />
                );
              })}
              {Array.from({ length: 6 }, (_, i) => {
                const x = CURVE_SLOT.x + (i / 5) * CURVE_SLOT.w;
                return (
                  <line key={`gv${i}`} x1={x} y1={CURVE_SLOT.y} x2={x} y2={BASE_Y} stroke={`${NAVY}08`} strokeWidth={0.5} />
                );
              })}

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

              {/* Segmentation — glowing region highlights */}
              {showSegments && (() => {
                const GLOW_OFFSETS = [18, 28, 22, 18];
                const GLOW_RY = [52, 42, 36, 36];
                const isStep1 = chartStep === 1;
                return (
                  <>
                    <defs>
                      {SEGMENT_ZONES.map((zone, zi) => (
                        <radialGradient key={`seg-glow-${zi}`} id={`seg-glow-${zi}`}>
                          <stop offset="0%" stopColor={zone.color} stopOpacity={0.14} />
                          <stop offset="55%" stopColor={zone.color} stopOpacity={0.06} />
                          <stop offset="100%" stopColor={zone.color} stopOpacity={0} />
                        </radialGradient>
                      ))}
                    </defs>
                    {SEGMENT_ZONES.map((zone, zi) => {
                      const tMid = (zone.tStart + zone.tEnd) / 2;
                      const ptStart = curve.sampleAt(zone.tStart);
                      const ptEnd = curve.sampleAt(zone.tEnd);
                      const ptMid = curve.sampleAt(tMid);
                      const cx = ptMid.x;
                      const cy = ptMid.y + GLOW_OFFSETS[zi];
                      const rx = Math.abs(ptEnd.x - ptStart.x) / 2 + 12;
                      const ry = GLOW_RY[zi];
                      const visible = isStep1 ? segPhase >= zi : true;
                      const isActive = isStep1 && segPhase === zi;
                      const isPast = isStep1 && segPhase > zi;
                      return (
                        <motion.g key={`seg-region-${zi}`}>
                          <motion.ellipse
                            cx={cx}
                            cy={cy}
                            rx={rx}
                            ry={ry}
                            fill={`url(#seg-glow-${zi})`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                              opacity: visible ? (isActive ? 1 : isPast ? 0.5 : 0.25) : 0,
                              scale: visible ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          />
                          <motion.ellipse
                            cx={cx}
                            cy={cy}
                            rx={rx * 0.85}
                            ry={ry * 0.85}
                            fill="none"
                            stroke={zone.color}
                            strokeWidth={isActive ? 0.8 : 0.6}
                            strokeDasharray="4 3"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                              opacity: visible ? (isActive ? 0.35 : isPast ? 0.12 : 0.06) : 0,
                              scale: visible ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          />
                          <motion.text
                            x={cx}
                            y={cy + 4}
                            fontSize="9"
                            fontWeight="700"
                            fill={zone.color}
                            textAnchor="middle"
                            style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const, fontFamily: "inherit" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: visible ? (isActive ? 0.95 : isPast ? 0.5 : 0.1) : 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            {zone.label}
                          </motion.text>
                        </motion.g>
                      );
                    })}
                  </>
                );
              })()}

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
                    fontFamily: "inherit",
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

                const inChaos = chartStep === 0 && introPhase < 2;
                const settling = chartStep === 0 && !inChaos;
                const settleDelay = (dot.driftDelay / 5) * 0.6;

                let animCx: number | number[] = dot.chaosX;
                let animCy: number | number[] = dot.chaosY;

                if (!inChaos) {
                  if (isAllToCurve) {
                    animCx = baseCx;
                    animCy = targetY;
                  } else if (settling) {
                    animCx = baseCx;
                    animCy = scatterY;
                  } else {
                    animCx = [baseCx, baseCx + dot.driftDx, baseCx - dot.driftDx * 0.6, baseCx];
                    animCy = [targetY, targetY + dot.driftDy, targetY - dot.driftDy * 0.6, targetY];
                  }
                }

                return (
                  <motion.circle
                    key={`dot-${i}`}
                    r={dot.r}
                    fill={dotColor}
                    initial={{ cx: dot.chaosX, cy: dot.chaosY, opacity: 0, scale: 0 }}
                    animate={{
                      cx: animCx,
                      cy: animCy,
                      opacity: dotOpacity,
                      scale: 1,
                    }}
                    transition={{
                      cx: inChaos
                        ? { duration: 0 }
                        : settling
                          ? { duration: 1.2, delay: settleDelay, ease: [0.22, 1, 0.36, 1] }
                          : isAllToCurve
                            ? { duration: 0.7, delay: i * 0.01, ease: "easeInOut" }
                            : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      cy: inChaos
                        ? { duration: 0 }
                        : settling
                          ? { duration: 1.2, delay: settleDelay, ease: [0.22, 1, 0.36, 1] }
                          : isAllToCurve
                            ? { duration: 0.6 + (Math.abs(dot.offsetY) / 36) * 0.3, delay: i * 0.01, ease: "easeInOut" }
                            : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      opacity: {
                        delay: chartStep === 0 ? 0.1 + i * 0.007 : 0.1,
                        duration: isSpotlight ? 0.5 : 0.3,
                      },
                      scale: {
                        delay: chartStep === 0 ? 0.1 + i * 0.007 : 0.1,
                        type: "spring",
                        stiffness: 300,
                      },
                    }}
                  />
                );
              })}

              {/* Highlight product dots — start below curve, auto-animate to curve */}
              {SEGMENT_HIGHLIGHTS.map((seg, si) => {
                const visible =
                  isAllToCurve || (isSpotlight && si <= spotlightIdx);
                if (!visible) return null;

                const pt = curve.sampleAt(seg.t);
                const belowY = pt.y + seg.offsetY;
                const isActive = isSpotlight && si === spotlightIdx;
                const isPast = isSpotlight && si < spotlightIdx;
                const dotLifted = isAllToCurve || isPast || (isActive && isLifted);
                const targetCy = dotLifted ? pt.y : belowY;

                return (
                  <g key={seg.label}>
                    {/* Dashed line from dot to curve position */}
                    {isActive && (
                      <motion.line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={belowY}
                        stroke={seg.dotColor}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: dotLifted ? 0 : 0.3 }}
                        transition={{ duration: 0.4, delay: dotLifted ? 0 : 0.5 }}
                      />
                    )}

                    {/* Target ring on the curve */}
                    {(isActive || isPast || isAllToCurve) && (
                      <motion.circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isAllToCurve ? 4 : 10}
                        fill="none"
                        stroke={seg.dotColor}
                        strokeWidth={isAllToCurve ? 0.8 : 1.5}
                        strokeDasharray={dotLifted ? "0" : "4 3"}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                          opacity: isAllToCurve ? 0.2 : dotLifted ? 0.5 : 0.3,
                          scale: 1,
                        }}
                        transition={{ duration: 0.5, delay: isActive ? 0.4 : 0.2 }}
                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                      />
                    )}

                    {/* Main dot — starts at belowY, auto-lifts to curve */}
                    <motion.circle
                      cx={pt.x}
                      r={isAllToCurve ? 2.5 : 6}
                      fill={isAllToCurve ? seg.dotColor : "white"}
                      stroke={seg.dotColor}
                      strokeWidth={isAllToCurve ? 0.8 : 2.5}
                      initial={{ cy: belowY, opacity: 0 }}
                      animate={{ cy: targetCy, opacity: 1 }}
                      transition={{
                        cy: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
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
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const, fontFamily: "inherit" }}
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
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const, fontFamily: "inherit" }}
                        >
                          {seg.oldPrice}
                        </text>
                      </motion.g>
                    )}

                    {/* Label above dot (after lift to curve) */}
                    {dotLifted && !isAllToCurve && (
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
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const, fontFamily: "inherit" }}
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
                          style={{ stroke: "white", strokeWidth: 3, paintOrder: "stroke" as const, fontFamily: "inherit" }}
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

