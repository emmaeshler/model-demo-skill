"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
const BASELINE_KPI = { winRate: 62, priceAdoption: 71, marginImpact: 1.8 };
const TOTAL_MONTHS = 20;
const TIMELINE_EVENTS = [
  { month: 4, label: "Steel +8%", factor: "Steel cost surge reshapes demand", steepness: 7.5, kpi: { winRate: 65, priceAdoption: 74, marginImpact: 2.4 } },
  { month: 8, label: "New Entrant", factor: "Competitor enters market", steepness: 3.5, kpi: { winRate: 67, priceAdoption: 78, marginImpact: 2.9 } },
  { month: 12, label: "Demand Shift", factor: "Seasonal demand surge", steepness: 9, kpi: { winRate: 69, priceAdoption: 81, marginImpact: 3.5 } },
  { month: 16, label: "Freight −5%", factor: "Freight costs drop", steepness: 4.5, kpi: { winRate: 72, priceAdoption: 84, marginImpact: 3.9 } },
  { month: 20, label: "Resin +12%", factor: "Raw material spike", steepness: 6.5, kpi: { winRate: 74, priceAdoption: 87, marginImpact: 4.5 } },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getMonthLabel(month: number): string {
  const m = Math.round(Math.max(0, month));
  return `${MONTH_NAMES[m % 12]} '${24 + Math.floor(m / 12)}`;
}

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
type Customer = "QuickParts" | "Acme" | "MedSupply";

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
  customer: Customer;
  birthMonth: number;
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
    customer: (t < 0.25 ? "QuickParts" : t < 0.55 ? "Acme" : "MedSupply") as Customer,
    birthMonth: (() => { const r = rng(); if (r < 0.22) return 0; if (r < 0.38) return 4; if (r < 0.54) return 8; if (r < 0.70) return 12; if (r < 0.85) return 16; return 20; })(),
  };
});

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
    shortReason: "No competition",
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
    shortReason: "Win rate climbing",
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
    title: "Now the model looks at all of them at once",
    body: "Thousands of transactions, seen together, reveal the shape of your market — and every price gets refined against it.",
  },
  1: {
    title: "Your optimal demand curve",
    body: "The model builds a price–volume relationship from your historical win/loss data.",
  },
  2: {
    title: "Your optimal demand curve",
    body: "Each customer gets its own curve.",
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
  7: {
    title: "The market moves. The curve moves with it.",
    body: "Price indices — published benchmarks for costs like steel, freight, or labor — feed the model continuously. When the market shifts, the curve shifts, and every price stays current.",
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
    const navyPts = Array.from({ length: n + 1 }, (_, i) => {
      const pt = raw.sampleAt(i / n);
      return { x: pt.x, y: flipY(pt.y) };
    });
    const ghostCurvePts: { x: number; y: number }[][] = [];
    const ghostCurves = [
      { steepness: 2, customer: "MedSupply", color: TEAL },
      { steepness: 14, customer: "QuickParts", color: ORANGE },
    ].map(({ steepness, customer, color }) => {
      const g = makeCurve(CURVE_SLOT, steepness);
      const gPts = Array.from({ length: n + 1 }, (_, i) => {
        const pt = g.sampleAt(i / n);
        return { x: pt.x, y: flipY(pt.y) };
      });
      ghostCurvePts.push(gPts);
      const d = "M " + gPts.map(p => `${p.x},${p.y}`).join(" L ");
      const ghostSample = (t: number) => {
        const pt = g.sampleAt(t);
        return { x: pt.x, y: flipY(pt.y) };
      };
      return { d, sampleAt: ghostSample, customer, color };
    });
    const indexCurves = TIMELINE_EVENTS.map(event => {
      const rawShifted = makeCurve(CURVE_SLOT, event.steepness);
      const pts = Array.from({ length: n + 1 }, (_, i) => {
        const pt = rawShifted.sampleAt(i / n);
        return { x: pt.x, y: flipY(pt.y) };
      });
      return {
        d: "M " + pts.map(p => `${p.x},${p.y}`).join(" L "),
        pts,
        sampleAt: (t: number) => {
          const pt = rawShifted.sampleAt(t);
          return { x: pt.x, y: flipY(pt.y) };
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
        return { x: pt.x, y: flipY(pt.y) };
      },
    };
  }, []);

  const chartStep = step;
  /* ── Intro phase for chartStep 0 animated title build ── */
  const [introPhase, setIntroPhase] = useState(skipAnimation ? 6 : chartStep === 0 ? 0 : 6);
  useEffect(() => {
    if (skipAnimation) {
      const t0 = setTimeout(() => setIntroPhase(6));
      return () => clearTimeout(t0);
    }
    if (chartStep !== 0) {
      const t0 = setTimeout(() => setIntroPhase(6));
      return () => clearTimeout(t0);
    }
    const t0 = setTimeout(() => setIntroPhase(0));
    const t1 = setTimeout(() => setIntroPhase(1), 400);
    const t2 = setTimeout(() => setIntroPhase(2), 1600);
    const t3 = setTimeout(() => setIntroPhase(3), 2800);
    const t4 = setTimeout(() => setIntroPhase(4), 3800);
    const t5 = setTimeout(() => setIntroPhase(5), 4700);
    const t6 = setTimeout(() => setIntroPhase(6), 5600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
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
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [chartStep, isSpotlight, skipAnimation, onAutoAdvance]);

  /* ── Timeline click-to-advance (step 7) ────────────── */
  const [indexPhase, setIndexPhase] = useState(0);
  useEffect(() => {
    if (chartStep !== 7) { setIndexPhase(0); return; }
    if (skipAnimation) { setIndexPhase(TIMELINE_EVENTS.length); return; }
  }, [chartStep, skipAnimation]);

  const advanceTimeline = () => {
    if (indexPhase < TIMELINE_EVENTS.length) setIndexPhase(prev => prev + 1);
  };
  const retreatTimeline = () => {
    if (indexPhase > 0) setIndexPhase(prev => prev - 1);
  };

  const [indexMorphFrom, setIndexMorphFrom] = useState(0);
  const [indexMorphProgress, setIndexMorphProgress] = useState(1);
  const prevIndexPhaseRef = useRef(0);
  useEffect(() => {
    const prev = prevIndexPhaseRef.current;
    prevIndexPhaseRef.current = indexPhase;
    if (indexPhase === prev) { setIndexMorphProgress(1); return; }
    setIndexMorphFrom(prev);
    setIndexMorphProgress(0);
    if (skipAnimation) { setIndexMorphProgress(1); return; }
    let start = 0;
    let frame: number;
    const tick = (now: number) => {
      if (!start) start = now;
      const raw = Math.min(1, (now - start) / 1400);
      setIndexMorphProgress(1 - Math.pow(1 - raw, 3));
      if (raw < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [indexPhase, skipAnimation]);

  /* ── Collapse animation (step 6, three-curves mode) ── */
  const isCollapseStep = chartStep === 6 && curveMode === "three";
  const [collapsePhase, setCollapsePhase] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const [showFinalSubtitle, setShowFinalSubtitle] = useState(false);

  useEffect(() => {
    if (!isCollapseStep) {
      setCollapsePhase(0);
      setMorphProgress(0);
      setShowFinalSubtitle(false);
      return;
    }
    if (skipAnimation) {
      setCollapsePhase(4);
      setMorphProgress(1);
      setShowFinalSubtitle(true);
      return;
    }
    setCollapsePhase(0);
    const t1 = setTimeout(() => setCollapsePhase(1), 200);
    const t2 = setTimeout(() => setCollapsePhase(2), 2200);
    const t3 = setTimeout(() => setCollapsePhase(3), 3200);
    const t4 = setTimeout(() => setCollapsePhase(4), 4700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep, curveMode, skipAnimation, isCollapseStep]);

  useEffect(() => {
    if (collapsePhase < 3) { setMorphProgress(0); return; }
    if (collapsePhase > 3) { setMorphProgress(1); return; }
    const startTime = performance.now();
    const duration = 1500;
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(1, elapsed / duration);
      setMorphProgress(1 - Math.pow(1 - raw, 3));
      if (raw < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [collapsePhase]);

  useEffect(() => {
    if (collapsePhase === 4) {
      const t = setTimeout(() => setShowFinalSubtitle(true), 300);
      return () => clearTimeout(t);
    }
    setShowFinalSubtitle(false);
  }, [collapsePhase]);

  const morphedGhostPaths = useMemo(() => {
    if (morphProgress <= 0) return null;
    return curve.ghostCurvePts.map((ghostPts) =>
      "M " + ghostPts.map((gp, i) => {
        const np = curve.navyPts[i];
        return `${gp.x},${gp.y + (np.y - gp.y) * morphProgress}`;
      }).join(" L ")
    );
  }, [morphProgress, curve]);

  /* ── Chart animation ────────────────────────────────── */

  const showCurve = chartStep >= 1;
  const showGhostCurves = chartStep === 2 && curveMode === "three";
  const isAllToCurve = chartStep >= 6;
  const isIndexShift = chartStep >= 7;
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

  const dotOpacityBase = (chartStep >= 1 && chartStep <= 2) ? 0.15 : isSpotlight ? 0 : isIndexShift ? 0.35 : 1;

  const heading = isIndexShift
    ? "The market moves. The curve moves with it."
    : isAllToCurve
      ? (curveMode === "three" ? "Every price, on its curve." : "Every price, aligned to the curve")
      : (chartStep >= 1 && chartStep <= 2)
        ? "Your optimal demand curve"
        : chartStep === 0
          ? "Now the model looks at all of them at once"
          : isSpotlight
            ? "Your optimal demand curve"
            : "Detect patterns, refine pricing guidance";

  const subtitle = isIndexShift
      ? null
      : isCollapseStep
        ? (showFinalSubtitle
          ? "The model manages the complexity — you see one answer."
          : "Each transaction moves to the optimal point for that customer — underpriced deals lifted, wins protected.")
      : isSpotlight
        ? (spotPhase >= 2 ? SEGMENT_HIGHLIGHTS[spotlightIdx].afterBody : SEGMENT_HIGHLIGHTS[spotlightIdx].beforeBody)
        : chartStep === 2 && curveMode === "one"
          ? STEP_CONTEXT[1]?.body
          : STEP_CONTEXT[chartStep]?.body || null;

  const activeHighlight = isSpotlight ? SEGMENT_HIGHLIGHTS[spotlightIdx] : null;
  const isLifted = spotPhase >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-2">

      {/* Title — fixed-height container so chart never resizes */}
      <div className="relative w-full" style={{ height: 90, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
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
                className="mx-auto mt-2 max-w-xl text-center text-[1.05rem] leading-relaxed"
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
          {chartStep > 0 && (
            <motion.div
              key={`step-title-${chartStep >= 1 && chartStep <= 2 ? 'curve-intro' : `step-${chartStep}`}`}
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
                {heading}
              </motion.h2>
              {subtitle && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={(chartStep >= 1 && chartStep <= 5) ? 'curve-subtitle' : isCollapseStep ? `collapse-${showFinalSubtitle ? 'final' : 'snap'}` : `step-${chartStep}`}
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                    style={{ color: MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    {chartStep === 2 && curveMode === "three" ? (
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
                    ) : isCollapseStep && showFinalSubtitle ? (
                      <span style={{ fontWeight: 700, color: NAVY, textDecoration: "underline", textDecorationColor: STRAT_BLUE, textUnderlineOffset: "4px", textDecorationThickness: "2px" }}>
                        {subtitle}
                      </span>
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

      {/* Timeline strip (step 7) — date/card + scrubber */}
      <AnimatePresence>
        {isIndexShift && (
          <motion.div
            key="timeline-strip"
            className="w-full flex-shrink-0"
            style={{ paddingRight: 175 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Date display / Event card */}
            <div className="relative flex items-center justify-center" style={{ height: 52 }}>
              {indexPhase > 0 && (
                <motion.button
                  className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${NAVY}08`, color: MUTED }}
                  onClick={retreatTimeline}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
              )}
              <AnimatePresence mode="wait">
                {indexPhase === 0 ? (
                  <motion.button
                    key="start-prompt"
                    onClick={advanceTimeline}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
                    style={{ backgroundColor: `${STRAT_BLUE}0A`, color: STRAT_BLUE, border: `1.5px solid ${STRAT_BLUE}20` }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    whileHover={{ backgroundColor: `${STRAT_BLUE}18` }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    Start timeline &#8250;
                  </motion.button>
                ) : currentEvent && indexMorphProgress >= 0.8 ? (
                  <motion.div
                    key={`event-${indexPhase}`}
                    className="rounded-xl px-5 py-2 shadow-md cursor-pointer"
                    style={{ backgroundColor: "white", border: `1.5px solid ${STRAT_BLUE}30` }}
                    onClick={advanceTimeline}
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: STRAT_BLUE }}>
                        {getMonthLabel(currentEvent.month)}
                      </span>
                      <span className="text-[15px] font-bold" style={{ color: NAVY }}>{currentEvent.label}</span>
                      {indexPhase < TIMELINE_EVENTS.length && <span className="text-[11px] font-medium" style={{ color: `${STRAT_BLUE}80` }}>Next &#8250;</span>}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>{currentEvent.factor}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="month-label"
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-[22px] font-bold tabular-nums" style={{ color: NAVY }}>
                      {getMonthLabel(currentMonth)}
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: `${MUTED}90` }}>
                      Month {Math.round(currentMonth)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {indexPhase > 0 && indexPhase < TIMELINE_EVENTS.length && (
                <motion.button
                  className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${STRAT_BLUE}10`, color: STRAT_BLUE }}
                  onClick={advanceTimeline}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
              )}
            </div>

            {/* Timeline scrubber */}
            <div className="relative mt-1" style={{ height: 32 }}>
              {/* Track bg */}
              <div className="absolute rounded-full" style={{ left: 0, right: 0, top: "50%", height: 3, transform: "translateY(-50%)", backgroundColor: `${NAVY}0D` }} />
              {/* Track fill */}
              <motion.div
                className="absolute rounded-full"
                style={{ left: 0, top: "50%", height: 3, transform: "translateY(-50%)", backgroundColor: `${STRAT_BLUE}80` }}
                animate={{ width: `${(currentMonth / TOTAL_MONTHS) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* Milestone dots — clickable */}
              {TIMELINE_EVENTS.map((event, i) => {
                const pos = (event.month / TOTAL_MONTHS) * 100;
                const isPast = currentMonth >= event.month;
                const isActive = indexPhase === i + 1 && indexMorphProgress >= 1;
                return (
                  <div
                    key={event.month}
                    className="absolute cursor-pointer"
                    style={{ left: `${pos}%`, top: "50%", transform: "translate(-50%, -50%)", padding: 8, zIndex: 2 }}
                    onClick={() => setIndexPhase(i + 1)}
                  >
                    <motion.div
                      className="rounded-full"
                      animate={{
                        width: isActive ? 14 : isPast ? 10 : 8,
                        height: isActive ? 14 : isPast ? 10 : 8,
                        backgroundColor: isActive ? STRAT_BLUE : isPast ? NAVY : `${NAVY}25`,
                      }}
                      whileHover={{ scale: 1.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                );
              })}
              {/* Start dot */}
              <div className="absolute rounded-full" style={{ left: 0, top: "50%", width: 6, height: 6, backgroundColor: NAVY, transform: "translate(-50%, -50%)", zIndex: 1 }} />
              {/* Big circle scrubber */}
              <motion.div
                className="absolute z-10 rounded-full"
                style={{
                  top: "50%",
                  width: 22, height: 22,
                  marginLeft: -11, marginTop: -11,
                  backgroundColor: STRAT_BLUE,
                  border: "3px solid white",
                  boxShadow: `0 2px 12px ${STRAT_BLUE}50`,
                }}
                animate={{ left: `${(currentMonth / TOTAL_MONTHS) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              {/* Month labels below track */}
              <div className="absolute w-full" style={{ top: "50%", marginTop: 14 }}>
                <span className="absolute text-[10px] font-medium" style={{ left: 0, transform: "translateX(-50%)", color: MUTED }}>0</span>
                {TIMELINE_EVENTS.map((event, i) => {
                  const pos = (event.month / TOTAL_MONTHS) * 100;
                  const isActive = indexPhase === i + 1 && indexMorphProgress >= 1;
                  return (
                    <span
                      key={event.month}
                      className="absolute text-[10px] font-medium transition-colors duration-300 cursor-pointer"
                      style={{ left: `${pos}%`, transform: "translateX(-50%)", color: isActive ? STRAT_BLUE : MUTED }}
                      onClick={() => setIndexPhase(i + 1)}
                    >
                      {event.month}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart area */}
      <div className="relative w-full flex-1 min-h-0 mt-0" style={{ maxHeight: "calc(100% - 120px)" }}>
        {/* Wireframe skeleton — visible while chart fades in */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: chartStep === 0 && introPhase < 5 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ pointerEvents: "none" }}
        >
          <svg viewBox={`0 -6 ${CURVE_SLOT.x + CURVE_SLOT.w + 40} ${BASE_Y + 30}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Axes */}
            <line x1={CURVE_SLOT.x} y1={CURVE_SLOT.y} x2={CURVE_SLOT.x} y2={BASE_Y} stroke={NAVY} strokeWidth={1} strokeDasharray="4 3" opacity={0.18} />
            <line x1={CURVE_SLOT.x} y1={BASE_Y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={BASE_Y} stroke={NAVY} strokeWidth={1} strokeDasharray="4 3" opacity={0.18} />
            {/* Grid */}
            {Array.from({ length: 5 }, (_, i) => {
              const y = CURVE_SLOT.y + ((i + 1) / 6) * CURVE_SLOT.h;
              return <line key={`rsg-h${i}`} x1={CURVE_SLOT.x} y1={y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={y} stroke={NAVY} strokeWidth={0.5} strokeDasharray="3 5" opacity={0.07} />;
            })}
            {/* Ghost demand curve */}
            <path
              d={`M ${CURVE_SLOT.x} ${CURVE_SLOT.y + 8} Q ${CURVE_SLOT.x + CURVE_SLOT.w * 0.25} ${CURVE_SLOT.y + CURVE_SLOT.h * 0.35} ${CURVE_SLOT.x + CURVE_SLOT.w * 0.5} ${CURVE_SLOT.y + CURVE_SLOT.h * 0.65} T ${CURVE_SLOT.x + CURVE_SLOT.w} ${BASE_Y - 8}`}
              fill="none" stroke={NAVY} strokeWidth={2} strokeDasharray="6 4" opacity={0.14}
            />
            {/* Ghost scatter dots */}
            {[
              [0.08, 0.15], [0.12, 0.22], [0.18, 0.35], [0.25, 0.30], [0.15, 0.50],
              [0.35, 0.48], [0.42, 0.55], [0.50, 0.62], [0.30, 0.70], [0.55, 0.58],
              [0.62, 0.72], [0.70, 0.78], [0.78, 0.82], [0.85, 0.88], [0.92, 0.90],
              [0.22, 0.60], [0.45, 0.45], [0.68, 0.68], [0.38, 0.80], [0.75, 0.75],
              [0.05, 0.40], [0.28, 0.55], [0.52, 0.50], [0.65, 0.85], [0.88, 0.82],
            ].map(([tx, ty], i) => (
              <circle key={`rsg-d${i}`} cx={CURVE_SLOT.x + tx * CURVE_SLOT.w} cy={CURVE_SLOT.y + ty * CURVE_SLOT.h} r={1.8} fill={NAVY} opacity={0.09} />
            ))}
          </svg>
        </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: chartStep === 0 && introPhase < 5 ? 0 : 1,
          y: chartStep === 0 && introPhase < 5 ? 20 : 0,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Chart */}
        <div className="relative min-w-0 flex-1 flex items-center justify-center" style={isIndexShift ? { paddingRight: 175 } : undefined}>
          {/* Curve mode toggle — internal review tool */}
          {!isIndexShift && <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm border border-gray-200/60">
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
          </div>}

          {/* Product–customer legend card (step 2) */}
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

            <svg
              viewBox={`0 -6 ${CURVE_SLOT.x + CURVE_SLOT.w + 40} ${BASE_Y + 30}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Legend — bottom-left below chart (hidden during timeline) */}
              {!isIndexShift && <g>
                {LEGEND_ITEMS.map((item) => (
                  <g key={item.label} transform={`translate(${CURVE_SLOT.x + item.x}, ${BASE_Y + 14})`}>
                    <circle cx={0} cy={0} r={1.2} fill={item.color} opacity={0.7} />
                    <text x={3.5} y={1.5} fontSize="4.5" fontWeight="500" fill={MUTED} style={{ fontFamily: "inherit" }}>{item.label}</text>
                  </g>
                ))}
              </g>}

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

              {/* Ghost "old" curve — shows previous shape during index shifts */}
              {isIndexShift && indexPhase > 0 && (
                <motion.path
                  d={ghostIndexCurveD}
                  fill="none"
                  stroke={MUTED}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  transition={{ opacity: { duration: 0.6 } }}
                />
              )}

              {/* Demand curve (Acme's curve = base) */}
              {showCurve && (
                <motion.path
                  d={isIndexShift ? morphedIndexCurveD : curve.d}
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

              {/* Ghost curves — all shown at step 2, then progressively during spotlights */}
              {curve.ghostCurves.map((ghost, gi) => {
                if (curveMode === "one") return null;
                const revealStep = ghost.customer === "QuickParts" ? 2 : ghost.customer === "MedSupply" ? 2 : -1;
                if (revealStep < 0 || chartStep < revealStep) return null;
                const isActiveGhost = isSpotlight && SEGMENT_HIGHLIGHTS[spotlightIdx]?.label === ghost.customer;
                const collapseD = isCollapseStep && morphedGhostPaths ? morphedGhostPaths[gi] : ghost.d;
                return (
                  <motion.path
                    key={`ghost-curve-${gi}`}
                    d={isCollapseStep ? collapseD : ghost.d}
                    fill="none"
                    stroke={ghost.color}
                    strokeWidth={isCollapseStep && collapsePhase >= 1 ? 2 : isActiveGhost ? 2.5 : 1.5}
                    strokeDasharray={isCollapseStep && collapsePhase >= 1 ? "6 4" : "4 3"}
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{
                      opacity: isCollapseStep
                        ? (collapsePhase >= 3 ? 0 : collapsePhase >= 1 ? 0.6 : 0)
                        : isAllToCurve ? 0 : showGhostCurves ? 0.45 : isActiveGhost ? 0.55 : 0.08,
                      pathLength: 1,
                    }}
                    transition={{
                      pathLength: { duration: 1, delay: showGhostCurves ? 0.3 + gi * 0.2 : 0, ease: "easeOut" },
                      opacity: isCollapseStep && collapsePhase >= 3
                        ? { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
                        : isCollapseStep && collapsePhase >= 1
                          ? { duration: 0.5 }
                          : { duration: 0.6, delay: showGhostCurves ? 0.3 + gi * 0.2 : 0 },
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
                    opacity: chartStep >= 2 ? 0 : 0.5,
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

                const customerSampleAt = dot.customer === "QuickParts"
                  ? curve.ghostCurves[1].sampleAt
                  : dot.customer === "MedSupply"
                    ? curve.ghostCurves[0].sampleAt
                    : curve.sampleAt;
                const customerPt = customerSampleAt(dot.t);
                const isBelowCustomer = scatterY > customerPt.y;
                const customerTargetY = isBelowCustomer
                  ? customerPt.y + dot.residualY
                  : scatterY + (customerPt.y - scatterY) * 0.15;

                const rawTargetY = isAllToCurve ? (isBelowCurve ? pt.y + dot.residualY : scatterY) : scatterY;
                const toShift = activeIndexCurve ? activeIndexCurve.sampleAt(dot.t).y - pt.y : 0;
                const fromShift = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].sampleAt(dot.t).y - pt.y : 0;
                const shiftOffset = isIndexShift ? fromShift + (toShift - fromShift) * indexMorphProgress : 0;
                const targetY = rawTargetY + shiftOffset;
                const dotColor = isIndexShift ? MUTED : STATUS_COLORS[dot.status];
                const dotVisible = !isIndexShift || dot.birthMonth <= timelineTargetMonth;
                const dotOpacity = dotVisible ? dotOpacityBase : 0;

                const inChaos = chartStep === 0 && introPhase < 5;
                const settling = chartStep === 0 && !inChaos;
                const settleDelay = (dot.driftDelay / 5) * 0.6;

                let animCx: number | number[] = dot.chaosX;
                let animCy: number | number[] = dot.chaosY;

                if (!inChaos) {
                  if (isCollapseStep) {
                    if (collapsePhase < 1) {
                      animCx = [baseCx, baseCx + dot.driftDx, baseCx - dot.driftDx * 0.6, baseCx];
                      animCy = [scatterY, scatterY + dot.driftDy, scatterY - dot.driftDy * 0.6, scatterY];
                    } else if (collapsePhase < 3) {
                      animCx = baseCx;
                      animCy = customerTargetY;
                    } else {
                      animCx = baseCx;
                      animCy = isBelowCurve ? pt.y + dot.residualY : scatterY;
                    }
                  } else if (isAllToCurve) {
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
                          : isCollapseStep
                            ? collapsePhase >= 3
                              ? { duration: 1.5, delay: i * 0.003, ease: [0.22, 1, 0.36, 1] }
                              : collapsePhase >= 1
                                ? { duration: 0.8, delay: i * 0.008, ease: [0, 0, 0.2, 1] }
                                : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" }
                          : isAllToCurve
                            ? { duration: 0.7, delay: i * 0.01, ease: "easeInOut" }
                            : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      cy: inChaos
                        ? { duration: 0 }
                        : settling
                          ? { duration: 1.2, delay: settleDelay, ease: [0.22, 1, 0.36, 1] }
                          : isCollapseStep
                            ? collapsePhase >= 3
                              ? { duration: 1.5, delay: i * 0.003, ease: [0.22, 1, 0.36, 1] }
                              : collapsePhase >= 1
                                ? { duration: 0.8, delay: i * 0.008, ease: [0, 0, 0.2, 1] }
                                : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" }
                          : isAllToCurve
                            ? { duration: 0.6 + (Math.abs(dot.offsetY) / 36) * 0.3, delay: i * 0.01, ease: "easeInOut" }
                            : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" },
                      opacity: {
                        delay: chartStep === 0 ? 0.1 + i * 0.007 : isIndexShift ? 0.15 + (i % 36) * 0.012 : 0.1,
                        duration: isSpotlight ? 0.5 : isIndexShift ? 0.5 : 0.3,
                      },
                      scale: {
                        delay: chartStep === 0 ? 0.1 + i * 0.007 : isIndexShift ? 0.15 + (i % 36) * 0.012 : 0.1,
                        type: "spring",
                        stiffness: 300,
                      },
                    }}
                  />
                );
              })}

              {/* Highlight product dots — start below curve, auto-animate to curve */}
              {SEGMENT_HIGHLIGHTS.map((seg, si) => {
                const visible = isCollapseStep
                  ? collapsePhase >= 1
                  : isAllToCurve || (isSpotlight && si <= spotlightIdx);
                if (!visible) return null;

                const ghost = curveMode === "three" ? curve.ghostCurves.find(g => g.customer === seg.label) : null;
                const segCustomerSample = ghost ? ghost.sampleAt : curve.sampleAt;
                let rawPt;
                if (isCollapseStep) {
                  rawPt = collapsePhase >= 3 ? curve.sampleAt(seg.t) : segCustomerSample(seg.t);
                } else {
                  rawPt = isAllToCurve ? curve.sampleAt(seg.t) : segCustomerSample(seg.t);
                }
                const segToShift = activeIndexCurve ? activeIndexCurve.sampleAt(seg.t).y - curve.sampleAt(seg.t).y : 0;
                const segFromShift = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].sampleAt(seg.t).y - curve.sampleAt(seg.t).y : 0;
                const segShiftOffset = isIndexShift ? segFromShift + (segToShift - segFromShift) * indexMorphProgress : 0;
                const pt = isIndexShift ? { x: rawPt.x, y: rawPt.y + segShiftOffset } : rawPt;
                const belowY = pt.y + seg.offsetY;
                const isActive = isSpotlight && si === spotlightIdx;
                const isPast = isSpotlight && si < spotlightIdx;
                const dotLifted = isCollapseStep ? collapsePhase >= 1 : (isAllToCurve || isPast || (isActive && isLifted));
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
                      r={isCollapseStep ? (collapsePhase >= 3 ? 2.5 : 4) : isAllToCurve ? 2.5 : 6}
                      fill={isCollapseStep ? seg.dotColor : isAllToCurve ? seg.dotColor : "white"}
                      stroke={seg.dotColor}
                      strokeWidth={isCollapseStep ? (collapsePhase >= 3 ? 0.8 : 1.2) : isAllToCurve ? 0.8 : 2.5}
                      initial={{ cy: belowY, opacity: 0 }}
                      animate={{ cy: targetCy, opacity: 1 }}
                      transition={{
                        cy: isCollapseStep && collapsePhase >= 3
                          ? { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
                          : { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.3, delay: 0.1 },
                      }}
                      onClick={() => { if (isActive) { if (spotPhase < 2) setSpotPhase(2); else onAutoAdvance?.(); } }}
                      style={{ cursor: isActive ? "pointer" : "default" }}
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
                          y={belowY + 16}
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
                          y={belowY + 26}
                          fontSize="11"
                          fontWeight="800"
                          fill={seg.dotColor}
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
                          y={pt.y - 26}
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
                          y={pt.y - 16}
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

                    {/* Info card — to the right of the dot */}
                    <AnimatePresence>
                      {isActive && (() => {
                        const CARD_W = 108;
                        const CARD_H = 28;
                        const cardX = pt.x + 28;
                        return (
                          <motion.g
                            key={`card-${si}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            onClick={() => { if (spotPhase < 2) setSpotPhase(2); else onAutoAdvance?.(); }}
                            style={{ cursor: "pointer" }}
                          >
                            <motion.g
                              initial={{ y: belowY }}
                              animate={{ y: dotLifted ? pt.y : belowY }}
                              transition={{ y: { duration: 1.0, ease: [0.22, 1, 0.36, 1] } }}
                            >
                              <rect
                                x={cardX}
                                y={-CARD_H - 4}
                                width={CARD_W}
                                height={CARD_H}
                                rx={3}
                                ry={3}
                                fill="white"
                                fillOpacity={0.95}
                                stroke={seg.dotColor}
                                strokeOpacity={0.2}
                                strokeWidth={0.5}
                              />
                              <rect
                                x={cardX}
                                y={-CARD_H - 4}
                                width={1.5}
                                height={CARD_H}
                                rx={0.75}
                                fill={seg.dotColor}
                              />
                              <AnimatePresence mode="wait">
                                {spotPhase < 2 ? (
                                  <motion.g key="before" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                                    <text
                                      x={cardX + 6}
                                      y={-CARD_H - 4 + 12}
                                      fontSize="7"
                                      fontWeight="700"
                                      fill={seg.dotColor}
                                      style={{ fontFamily: "inherit" }}
                                    >
                                      {seg.beforeTitle}
                                    </text>
                                    <text
                                      x={cardX + 6}
                                      y={-CARD_H - 4 + 22}
                                      fontSize="6"
                                      fontWeight="500"
                                      fill={MUTED}
                                      style={{ fontFamily: "inherit" }}
                                    >
                                      {seg.shortReason}
                                    </text>
                                  </motion.g>
                                ) : (
                                  <motion.g key="after" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                                    <text
                                      x={cardX + 6}
                                      y={-CARD_H - 4 + 12}
                                      fontSize="7"
                                      fontWeight="700"
                                      fill={GREEN}
                                      style={{ fontFamily: "inherit" }}
                                    >
                                      Adjusted {seg.change}
                                    </text>
                                    <text
                                      x={cardX + 6}
                                      y={-CARD_H - 4 + 22}
                                      fontSize="6"
                                      fill={MUTED}
                                      style={{ fontFamily: "inherit" }}
                                    >
                                      {seg.oldPrice} → {seg.newPrice}
                                    </text>
                                  </motion.g>
                                )}
                              </AnimatePresence>
                            </motion.g>
                          </motion.g>
                        );
                      })()}
                    </AnimatePresence>
                  </g>
                );
              })}

            </svg>
        </div>

      </motion.div>

      {/* KPI sidebar (step 7) */}
      <AnimatePresence>
        {isIndexShift && (
          <motion.div
            key="kpi-sidebar"
            className="absolute right-3 top-0 bottom-0 z-20 flex flex-col justify-center gap-4"
            style={{ width: 165 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Win rate */}
            <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: `${NAVY}05` }}>
              <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Win rate</div>
              <div className="text-[26px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: NAVY }}>
                {Math.round(currentKpi.winRate)}%
              </div>
              <AnimatePresence mode="wait">
                {indexPhase > 0 && indexMorphProgress >= 1 && kpiDelta.winRate !== 0 && (
                  <motion.div
                    key={`wr-${indexPhase}`}
                    className="text-[11px] font-medium mt-1"
                    style={{ color: TEAL }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    &#x2197; +{kpiDelta.winRate} pts this month
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price adoption */}
            <div className="rounded-xl px-3.5 py-3" style={{ backgroundColor: `${NAVY}05` }}>
              <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Price adoption</div>
              <div className="text-[26px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: NAVY }}>
                {Math.round(currentKpi.priceAdoption)}%
              </div>
              <AnimatePresence mode="wait">
                {indexPhase > 0 && indexMorphProgress >= 1 && (
                  <motion.div
                    key={`pa-${indexPhase}`}
                    className="text-[11px] font-medium mt-1"
                    style={{ color: kpiDelta.priceAdoption > 0 ? TEAL : MUTED }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    {kpiDelta.priceAdoption > 0 ? `↗ +${kpiDelta.priceAdoption} pts` : "— No change"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Margin impact */}
            <motion.div
              className="rounded-xl px-3.5 py-3"
              animate={{
                backgroundColor: indexPhase > 0 && indexMorphProgress >= 1 ? `${ORANGE}0A` : `${NAVY}05`,
                borderColor: indexPhase > 0 && indexMorphProgress >= 1 ? `${ORANGE}40` : "transparent",
              }}
              style={{ border: "1.5px solid transparent" }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Margin impact</div>
              <div className="text-[26px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: ORANGE }}>
                +{currentKpi.marginImpact.toFixed(1)}%
              </div>
              <AnimatePresence mode="wait">
                {indexPhase > 0 && indexMorphProgress >= 1 && kpiDelta.marginImpact > 0 && (
                  <motion.div
                    key={`mi-${indexPhase}`}
                    className="text-[11px] font-medium mt-1"
                    style={{ color: ORANGE }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    &#x2197; +{kpiDelta.marginImpact} after {kpiDelta.eventLabel.toLowerCase()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

