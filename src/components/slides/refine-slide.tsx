"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { makeCurve } from "../visuals/demand-curve";

const NAVY = "#00446A";
const ORANGE = "#C27A3A";
const TEAL = "#4A8FA8";
const MUTED = "#8A9AAA";
const STRAT_BLUE = "#21A5D5";
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
  chaosX: number;
  chaosY: number;
  residualY: number;
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
    r: (() => { const s = rng(); return s < 0.4 ? 0.8 + rng() * 0.6 : s < 0.75 ? 1.2 + rng() * 0.8 : 1.8 + rng() * 1.0; })(),
    driftDx: (rng() - 0.5) * 4,
    driftDy: (rng() - 0.5) * 3,
    driftDuration: 4 + rng() * 4,
    driftDelay: rng() * 5,
    chaosX: CURVE_SLOT.x + 10 + rng() * (CURVE_SLOT.w - 20),
    chaosY: CURVE_SLOT.y + 5 + rng() * (CURVE_SLOT.h - 10),
    residualY: (() => { const r = rng(); return r < 0.55 ? 0 : r < 0.8 ? 2 + rng() * 6 : 6 + rng() * 10; })(),
  };
});

const SEGMENT_ZONES = [
  { tStart: 0.0, tEnd: 0.36, label: "High win rate", color: GREEN, why: "Low competition — room to price higher", labelDy: 0 },
  { tStart: 0.48, tEnd: 0.74, label: "Competitive pressure", color: RED, why: "Multiple bidders driving prices down", labelDy: 0 },
  { tStart: 0.71, tEnd: 0.83, label: "Cost ↑", color: ORANGE, why: "Rising input costs squeezing margins", labelDy: 0 },
  { tStart: 0.81, tEnd: 1.0, label: "Price sensitive", color: TEAL, why: "Customers switch over small differences", labelDy: 0 },
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
    shortReason: "Costs rising, no competition",
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
    shortReason: "Win rate climbing — room to raise",
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
    shortReason: "New entrant undercutting",
    beforeBody: "A new entrant is undercutting — willingness to pay is dropping in this region.",
    afterTitle: "Adjusted −$0.39",
    afterBody: "Price drops to defend the deal against the competitive threat.",
  },
];

const LEGEND_ITEMS = (() => {
  const items = [
    { label: "Won", color: GREEN },
    { label: "Lost", color: RED },
    { label: "Overridden", color: ORANGE },
    { label: "Adjusted", color: TEAL },
  ];
  const CHAR_W = 2.6;
  const DOT_PLUS_GAP = 5;
  const AFTER_LABEL_GAP = 7;
  let x = 0;
  return items.map((item) => {
    const out = { ...item, x };
    x += DOT_PLUS_GAP + item.label.length * CHAR_W + AFTER_LABEL_GAP;
    return out;
  });
})();

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
    body: "The model builds a price–volume relationship from your historical win/loss data.",
  },
  3: {
    title: "Your optimal demand curve",
    body: "Each customer gets its own curve.",
  },
  4: {
    title: "QuickParts",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  5: {
    title: "Acme",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  6: {
    title: "MedSupply",
    body: "The model detects a pricing gap and adjusts to the optimal curve.",
  },
  7: {
    title: "Every price, optimized",
    body: "Every transaction is now aligned to the demand curve — lifting underpriced deals while protecting wins.",
  },
};

export function RefineSlide({ step, onAutoAdvance, skipAnimation, onCurveModeChange }: { step: number; onAutoAdvance?: () => void; skipAnimation?: boolean; onCurveModeChange?: (mode: "one" | "three") => void }) {
  const [curveMode, setCurveMode] = useState<"one" | "three">("three");

  useEffect(() => {
    onCurveModeChange?.(curveMode);
  }, [curveMode, onCurveModeChange]);

  const curve = useMemo(() => {
    const flipY = (y: number) => 2 * CURVE_SLOT.y + CURVE_SLOT.h - y;
    const raw = makeCurve(CURVE_SLOT, 5);
    const n = 64;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const pt = raw.sampleAt(i / n);
      return `${pt.x},${flipY(pt.y)}`;
    });
    const ghostCurves = [
      { steepness: 2, customer: "MedSupply", color: TEAL },
      { steepness: 14, customer: "QuickParts", color: ORANGE },
    ].map(({ steepness, customer, color }) => {
      const g = makeCurve(CURVE_SLOT, steepness);
      const d = "M " + Array.from({ length: n + 1 }, (_, i) => {
        const pt = g.sampleAt(i / n);
        return `${pt.x},${flipY(pt.y)}`;
      }).join(" L ");
      const ghostSample = (t: number) => {
        const pt = g.sampleAt(t);
        return { x: pt.x, y: flipY(pt.y) };
      };
      return { d, sampleAt: ghostSample, customer, color };
    });
    return {
      d: "M " + pts.join(" L "),
      ghostCurves,
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

  /* ── Spotlight auto-animation (steps 4-6) ────────────── */
  const isSpotlight = chartStep >= 4 && chartStep <= 6;
  const spotlightIdx = isSpotlight ? chartStep - 4 : -1;

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
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [chartStep, isSpotlight, skipAnimation, onAutoAdvance]);

  /* ── Segment highlight cycle (step 1) ────────────────── */
  const [highlightedSeg, setHighlightedSeg] = useState(-1);
  useEffect(() => {
    if (chartStep !== 1) { setHighlightedSeg(-1); return; }
    if (skipAnimation) { setHighlightedSeg(-1); return; }
    const DELAY = 1200;
    const HOLD = 2400;
    const timers: ReturnType<typeof setTimeout>[] = [];
    SEGMENT_ZONES.forEach((_, i) => {
      timers.push(setTimeout(() => setHighlightedSeg(i), DELAY + i * HOLD));
    });
    timers.push(setTimeout(() => setHighlightedSeg(-1), DELAY + SEGMENT_ZONES.length * HOLD));
    return () => timers.forEach(clearTimeout);
  }, [chartStep, skipAnimation]);

  /* ── Chart animation ────────────────────────────────── */

  const showSegments = chartStep === 1 || chartStep === 2;
  const showCurve = chartStep >= 2;
  const showGhostCurves = chartStep === 3 && curveMode === "three";
  const dotOpacityBase = chartStep === 1 ? 0.2 : (chartStep >= 2 && chartStep <= 3) ? 0.15 : isSpotlight ? 0 : 1;
  const isAllToCurve = chartStep >= 7;

  const heading = isAllToCurve
    ? (curveMode === "three" ? "One curve. Every price, optimized." : "Every price, aligned to the curve")
    : chartStep === 1
      ? "The model detects market segmentation"
      : (chartStep >= 2 && chartStep <= 3)
        ? "Your optimal demand curve"
        : chartStep === 0
          ? "Prices are scattered across the board"
          : isSpotlight
            ? "Your optimal demand curve"
            : "Detect patterns, refine pricing guidance";

  const segZone = chartStep === 1 && highlightedSeg >= 0 ? SEGMENT_ZONES[highlightedSeg] : null;
  const subtitle = isSpotlight
      ? (spotPhase >= 2 ? SEGMENT_HIGHLIGHTS[spotlightIdx].afterBody : SEGMENT_HIGHLIGHTS[spotlightIdx].beforeBody)
      : segZone
        ? segZone.why
        : chartStep === 3 && curveMode === "one"
          ? STEP_CONTEXT[2]?.body
          : STEP_CONTEXT[chartStep]?.body || null;

  const activeHighlight = isSpotlight ? SEGMENT_HIGHLIGHTS[spotlightIdx] : null;
  const isLifted = spotPhase >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-2">

      {/* Title — fixed-height container so chart never resizes */}
      <div className="relative w-full" style={{ height: 90, flexShrink: 0 }}>
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
              key={`step-title-${chartStep >= 2 && chartStep <= 3 ? 'curve-intro' : `step-${chartStep}`}`}
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
                    key={chartStep === 1 ? `seg-${highlightedSeg}` : (chartStep >= 2 && chartStep <= 6) ? 'curve-subtitle' : `step-${chartStep}`}
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                    style={{ color: MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, delay: chartStep === 1 ? 0.1 : 0.15 }}
                  >
                    {chartStep === 3 && curveMode === "three" ? (
                      <>Each{" "}
                        <span className="relative inline" style={{ whiteSpace: "nowrap" }}>
                          <span style={{ fontWeight: 700, color: NAVY }}>customer</span>
                          <motion.span
                            className="absolute bottom-0 left-0 h-[2px] rounded-full"
                            style={{ backgroundColor: STRAT_BLUE }}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                          />
                        </span>{" "}
                        gets its own curve.
                      </>
                    ) : segZone ? (
                      <><span style={{ fontWeight: 700, color: segZone.color }}>{segZone.label}</span>{" — "}{segZone.why}</>
                    ) : (
                      subtitle
                    )}
                  </motion.p>
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <motion.div
        className="w-full flex-1 min-h-0 mt-0 flex flex-col"
        style={{ maxHeight: "calc(100% - 120px)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: chartStep === 0 && introPhase < 1 ? 0 : 1,
          y: chartStep === 0 && introPhase < 1 ? 20 : 0,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Chart */}
        <div className="relative min-w-0 flex-1 flex items-center justify-center">
          {/* Curve mode toggle — internal review tool */}
          <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm border border-gray-200/60">
            <button
              onClick={() => setCurveMode("one")}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: curveMode === "one" ? NAVY : "transparent",
                color: curveMode === "one" ? "white" : MUTED,
              }}
            >
              1 Curve
            </button>
            <button
              onClick={() => setCurveMode("three")}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: curveMode === "three" ? NAVY : "transparent",
                color: curveMode === "three" ? "white" : MUTED,
              }}
            >
              3 Curves
            </button>
          </div>

          {/* Product–customer legend card (step 3) */}
          <AnimatePresence>
            {showGhostCurves && (
              <motion.div
                key="curve-legend"
                className="absolute z-10 rounded-xl bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm"
                style={{ right: "3%", top: "5%" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <svg width="20" height="4" className="shrink-0"><line x1="0" y1="2" x2="20" y2="2" stroke={ORANGE} strokeWidth={2} strokeDasharray="3 2" strokeLinecap="round" /></svg>
                      <span className="text-[13px] font-semibold" style={{ color: ORANGE }}>QuickParts</span>
                    </div>
                    <p className="ml-[28px] mt-0.5 text-[11px] leading-snug" style={{ color: MUTED }}>Niche buyer, low competition</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <svg width="20" height="4" className="shrink-0"><line x1="0" y1="2" x2="20" y2="2" stroke={NAVY} strokeWidth={2} strokeLinecap="round" /></svg>
                      <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Acme</span>
                    </div>
                    <p className="ml-[28px] mt-0.5 text-[11px] leading-snug" style={{ color: MUTED }}>Loyal, high-volume buyer</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <svg width="20" height="4" className="shrink-0"><line x1="0" y1="2" x2="20" y2="2" stroke={TEAL} strokeWidth={2} strokeDasharray="3 2" strokeLinecap="round" /></svg>
                      <span className="text-[13px] font-semibold" style={{ color: TEAL }}>MedSupply</span>
                    </div>
                    <p className="ml-[28px] mt-0.5 text-[11px] leading-snug" style={{ color: MUTED }}>Price-sensitive, competitive market</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isSpotlight && activeHighlight && (
              <motion.div
                key={`overlay-${spotlightIdx}`}
                className="absolute z-10 w-48 rounded-xl border-l-4 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
                style={{
                  borderLeftColor: activeHighlight.dotColor,
                  ...(spotlightIdx === 2
                    ? { right: "4%", top: "10%" }
                    : spotlightIdx === 1
                      ? { left: "48%", top: "8%" }
                      : { left: "36%", top: "8%" }),
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
                      <p className="text-[13px] font-bold leading-snug" style={{ color: activeHighlight.dotColor }}>
                        {activeHighlight.beforeTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug" style={{ color: MUTED }}>
                        {activeHighlight.shortReason}
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
                      <p className="text-[13px] font-bold leading-snug" style={{ color: GREEN }}>
                        {activeHighlight.afterTitle}
                      </p>
                      <motion.div
                        className="mt-1 flex items-baseline gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
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
              {/* Legend — bottom-left below chart */}
              <g>
                {LEGEND_ITEMS.map((item) => (
                  <g key={item.label} transform={`translate(${CURVE_SLOT.x + item.x}, ${BASE_Y + 14})`}>
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
                      const isActive = highlightedSeg === zi;
                      const isDimmed = highlightedSeg >= 0 && !isActive;
                      return (
                        <motion.g key={`seg-region-${zi}`}>
                          <motion.ellipse
                            cx={cx}
                            cy={cy}
                            rx={rx}
                            ry={ry}
                            fill={`url(#seg-glow-${zi})`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: isDimmed ? 0.25 : 0.7, scale: isActive ? 1.04 : 1 }}
                            transition={{ duration: 0.5, delay: isDimmed || isActive ? 0 : zi * 0.12 }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          />
                          <motion.ellipse
                            cx={cx}
                            cy={cy}
                            rx={rx * 0.85}
                            ry={ry * 0.85}
                            fill="none"
                            stroke={zone.color}
                            strokeWidth={isActive ? 1 : 0.6}
                            strokeDasharray="4 3"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: isDimmed ? 0.08 : isActive ? 0.4 : 0.2, scale: isActive ? 1.04 : 1 }}
                            transition={{ duration: 0.5, delay: isDimmed || isActive ? 0 : zi * 0.12 }}
                            style={{ transformOrigin: `${cx}px ${cy}px` }}
                          />
                          <motion.text
                            x={cx}
                            y={cy + zone.labelDy}
                            fontSize="9"
                            fontWeight="700"
                            fill={zone.color}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{ fontFamily: "inherit" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: chartStep === 1 ? (isDimmed ? 0.3 : 0.9) : 0 }}
                            transition={{ duration: 0.4, delay: chartStep === 1 && !isDimmed && !isActive ? zi * 0.12 + 0.2 : 0 }}
                          >
                            {zone.label}
                          </motion.text>
                        </motion.g>
                      );
                    })}
                  </>
                );
              })()}

              {/* Demand curve (Acme's curve = base) */}
              {showCurve && (
                <motion.path
                  d={curve.d}
                  fill="none"
                  stroke={NAVY}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: showGhostCurves ? 0.6 : isSpotlight ? (spotlightIdx === 1 ? 1 : 0.15) : 1,
                    strokeWidth: isSpotlight && spotlightIdx === 1 ? 3 : 2,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )}

              {/* Ghost curves — all shown at step 3, then progressively during spotlights */}
              {curve.ghostCurves.map((ghost, gi) => {
                if (curveMode === "one") return null;
                const revealStep = ghost.customer === "QuickParts" ? 3 : ghost.customer === "MedSupply" ? 3 : -1;
                if (revealStep < 0 || chartStep < revealStep) return null;
                const isActiveGhost = isSpotlight && SEGMENT_HIGHLIGHTS[spotlightIdx]?.label === ghost.customer;
                return (
                  <motion.path
                    key={`ghost-curve-${gi}`}
                    d={ghost.d}
                    fill="none"
                    stroke={ghost.color}
                    strokeWidth={isActiveGhost ? 2.5 : 1.5}
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{
                      opacity: isAllToCurve ? 0 : showGhostCurves ? 0.45 : isActiveGhost ? 0.55 : 0.08,
                      pathLength: 1,
                    }}
                    transition={{
                      pathLength: { duration: 1, delay: showGhostCurves ? 0.3 + gi * 0.2 : 0, ease: "easeOut" },
                      opacity: { duration: 0.6, delay: showGhostCurves ? 0.3 + gi * 0.2 : 0 },
                    }}
                  />
                );
              })}


              {/* Optimal demand curve label */}
              {showCurve && (
                <motion.text
                  x={curve.sampleAt(0.5).x}
                  y={curve.sampleAt(0.5).y - 10}
                  fontSize={isSpotlight && spotlightIdx === 1 ? 10 : 9}
                  fontWeight="700"
                  fill={NAVY}
                  textAnchor="middle"
                  style={{ fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: chartStep >= 3 ? 0 : 0.5,
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
                const targetY = isAllToCurve ? (isBelowCurve ? pt.y + dot.residualY : scatterY) : scatterY;
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

                const ghost = curveMode === "three" ? curve.ghostCurves.find(g => g.customer === seg.label) : null;
                const customerSample = ghost ? ghost.sampleAt : curve.sampleAt;
                const pt = isAllToCurve ? curve.sampleAt(seg.t) : customerSample(seg.t);
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
                          style={{ fontFamily: "inherit" }}
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
                          style={{ fontFamily: "inherit" }}
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
                          style={{ fontFamily: "inherit" }}
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
                          style={{ fontFamily: "inherit" }}
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

