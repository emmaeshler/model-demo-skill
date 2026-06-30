"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const ORANGE = "#E56910";
const GREEN = "#2e7d32";
const PURPLE = "#7B5EA7";
const MUTED = "#5A6A78";

export const POWER_TOTAL_STEPS = 8;

const ML_GREEN = "#3A7D44";

/* ─── Seeded PRNG ─── */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Chart geometry ─── */

const PLOT = { left: 88, right: 920, top: 30, bottom: 420 };
const PLOT_W = PLOT.right - PLOT.left;
const PLOT_H = PLOT.bottom - PLOT.top;
const PLOT_CX = PLOT.left + PLOT_W / 2;
const PLOT_CY = PLOT.top + PLOT_H / 2;

const Y_TICKS = ["$80", "$70", "$60", "$50", "$40", "$30", "$20"];
const X_TICKS = ["0", "100", "200", "300", "400", "500"];

function yForTick(i: number) {
  return PLOT.top + (i / (Y_TICKS.length - 1)) * PLOT_H;
}
function xForTick(i: number) {
  return PLOT.left + (i / (X_TICKS.length - 1)) * PLOT_W;
}

/* ─── Driver clusters ─── */

const DRIVERS = [
  { label: "Cost Trends", color: NAVY, cx: 230, cy: 135 },
  { label: "Competitive Position", color: ORANGE, cx: 620, cy: 150 },
  { label: "Volume & Elasticity", color: GREEN, cx: 250, cy: 330 },
  { label: "Win / Loss Patterns", color: PURPLE, cx: 610, cy: 315 },
];

const CLUSTER_SPREAD = [
  { cx: 280, cy: 110 },
  { cx: 730, cy: 110 },
  { cx: 280, cy: 340 },
  { cx: 730, cy: 340 },
];
const CLUSTER_R = 95;

/* ─── Spotlight data (steps 1-4) ─── */

const SPOTLIGHTS = [
  {
    cluster: 0,
    icon: "grid",
    label: "TRANSACTION HISTORY",
    count: "14,200 records",
    pills: ["Acme Corp · $58.20", "Beta Mfg · $42.10", "Coastal · $64.50", "Delta · $31.75"],
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET SIGNALS",
    count: "36 features",
    pills: ["Resin ↑ 4.2%", "Comp avg $59.10", "Q3 peak", "+2.8% growth"],
  },
  {
    cluster: 2,
    icon: "people",
    label: "CUSTOMER ATTRIBUTES",
    count: "2,400 accounts",
    pills: ["Strategic / Core / Opp", "Volume & contracts", "Tenure 3.2 yrs"],
  },
  {
    cluster: 3,
    icon: "chart",
    label: "WIN / LOSS PATTERNS",
    count: "18 months",
    pills: ["Win rate 87%", "Elasticity −0.34", "Discount 6.2%", "Lost gap $4.20"],
  },
];

const TITLES = [
  "2,400 accounts × 15,000 SKUs",
  "Finding cost patterns…",
  "Reading competitive signals…",
  "Mapping volume & elasticity…",
  "Learning win/loss patterns…",
  "Four pricing drivers emerge",
  "One optimal price",
];

const SUBTITLES = [
  "That's 36 million unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "The model scans 14,200 transaction records to surface underlying cost trends.",
  "36 real-time market features reveal where you stand against competitors.",
  "2,400 accounts with distinct buying profiles show how demand responds to price.",
  "18 months of win/loss data uncover what drives customer decisions.",
  "Cost, competition, elasticity, and demand — isolated from the noise.",
  "All four drivers converge into a single recommended price — for every account and SKU.",
];

/* ─── Pre-compute dot positions ─── */

const DOT_COUNT = 420;
const rand = mulberry32(42);

const HOTSPOTS = [
  { x: 160, y: 280 },
  { x: 350, y: 130 },
  { x: 500, y: 200 },
  { x: 280, y: 360 },
  { x: 650, y: 300 },
  { x: 450, y: 380 },
  { x: 200, y: 100 },
];

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const cluster = i % 4;
  const d = DRIVERS[cluster];
  const angle = rand() * Math.PI * 2;
  const dist = rand() * 48 + 10;

  let sx: number;
  let sy: number;

  if (rand() < 0.4) {
    const hs = HOTSPOTS[Math.floor(rand() * HOTSPOTS.length)];
    const spread = 60 + rand() * 80;
    const a = rand() * Math.PI * 2;
    sx = hs.x + Math.cos(a) * rand() * spread;
    sy = hs.y + Math.sin(a) * rand() * spread;
  } else {
    sx = PLOT.left + 10 + rand() * (PLOT_W - 20);
    sy = PLOT.top + 10 + rand() * (PLOT_H - 20);
  }

  sx = Math.max(PLOT.left + 4, Math.min(PLOT.right - 4, sx));
  sy = Math.max(PLOT.top + 4, Math.min(PLOT.bottom - 4, sy));

  const sizeRoll = rand();
  const r = sizeRoll < 0.5 ? rand() * 0.8 + 0.8
          : sizeRoll < 0.85 ? rand() * 1.2 + 1.4
          : rand() * 1.5 + 2.2;

  const driftAngle = rand() * Math.PI * 2;
  const driftRadius = rand() * 3 + 1.5;
  const driftDuration = rand() * 4 + 6;
  const driftDelay = rand() * 5;

  return {
    sx,
    sy,
    cx: Math.max(PLOT.left + 8, Math.min(PLOT.right - 8, d.cx + Math.cos(angle) * dist)),
    cy: Math.max(PLOT.top + 8, Math.min(PLOT.bottom - 8, d.cy + Math.sin(angle) * dist)),
    cluster,
    r,
    delay: rand() * 0.9,
    scatterOpacity: rand() * 0.35 + 0.12,
    driftDx: Math.cos(driftAngle) * driftRadius,
    driftDy: Math.sin(driftAngle) * driftRadius,
    driftDuration,
    driftDelay,
  };
});

/* ─── Sweep config ─── */

const SWEEP_DURATION = 10;

function highlightDotsForCluster(cluster: number) {
  return DOTS
    .map((dot, index) => ({
      index,
      cluster: dot.cluster,
      normalizedX: (dot.sx - PLOT.left) / PLOT_W,
    }))
    .filter((d) => d.cluster === cluster)
    .filter((_, i) => i % 3 === 0)
    .sort((a, b) => a.normalizedX - b.normalizedX);
}

/* ─── Callout dots ─── */

const CALLOUTS = [
  { label: "Acme Industrial", price: "$58.20", x: 245, y: 105, anchor: "start" as const, labelDx: 14, labelDy: -12, color: NAVY, cluster: 0 },
  { label: "QuickParts LLC", price: "$34.50", x: 620, y: 280, anchor: "start" as const, labelDx: 14, labelDy: 4, color: ORANGE, cluster: 1 },
  { label: "MedSupply Co", price: "$47.10", x: 420, y: 185, anchor: "end" as const, labelDx: -14, labelDy: -12, color: TEAL, cluster: 3 },
  { label: "Coastal Dist.", price: "$62.80", x: 780, y: 72, anchor: "start" as const, labelDx: 14, labelDy: 14, color: GREEN, cluster: 2 },
  { label: "Delta Mfg", price: "$29.40", x: 150, y: 345, anchor: "start" as const, labelDx: 14, labelDy: 2, color: PURPLE, cluster: 2 },
];

/* ─── Icons ─── */

function CategoryIcon({ type, color, size = 18 }: { type: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {type === "grid" && (
        <>
          <rect x="2" y="2" width="7" height="7" rx="1.5" fill={color} opacity={0.7} />
          <rect x="11" y="2" width="7" height="7" rx="1.5" fill={color} opacity={0.5} />
          <rect x="2" y="11" width="7" height="7" rx="1.5" fill={color} opacity={0.5} />
          <rect x="11" y="11" width="7" height="7" rx="1.5" fill={color} opacity={0.7} />
        </>
      )}
      {type === "trend" && (
        <path d="M2 15 L7 9 L11 12 L18 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      )}
      {type === "people" && (
        <>
          <circle cx="10" cy="7" r="3.5" fill={color} opacity={0.6} />
          <path d="M3 17.5 C3 13.5 7 12 10 12 C13 12 17 13.5 17 17.5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.5} />
        </>
      )}
      {type === "chart" && (
        <>
          <rect x="3" y="10" width="3" height="7" rx="1" fill={color} opacity={0.5} />
          <rect x="8.5" y="6" width="3" height="11" rx="1" fill={color} opacity={0.65} />
          <rect x="14" y="3" width="3" height="14" rx="1" fill={color} opacity={0.8} />
        </>
      )}
    </svg>
  );
}

/* ─── Main slide ─── */

export function PowerSlide({ step = 0, onAutoAdvance }: { step: number; onAutoAdvance?: () => void }) {
  const chartStep = step - 1;

  useEffect(() => {
    if (!onAutoAdvance || chartStep < 1 || chartStep > 4) return;
    const spotlight = SPOTLIGHTS[chartStep - 1];
    const pillCount = spotlight.pills.length;
    const lastPillDelay = 0.5 + (pillCount - 1) * (SWEEP_DURATION / 2 / pillCount);
    const lastPillDone = lastPillDelay + 0.6;
    const cardEntranceDelay = chartStep === 1 ? 1.2 : 0;
    const totalMs = (cardEntranceDelay + lastPillDone + 1.5) * 1000;
    const timer = setTimeout(onAutoAdvance, totalMs);
    return () => clearTimeout(timer);
  }, [chartStep, onAutoAdvance]);

  const [introPhase, setIntroPhase] = useState(chartStep === 0 ? 0 : 4);
  useEffect(() => {
    if (chartStep !== 0) {
      const t0 = setTimeout(() => setIntroPhase(5));
      return () => clearTimeout(t0);
    }
    const t0 = setTimeout(() => setIntroPhase(0));
    const t1 = setTimeout(() => setIntroPhase(1), 800);
    const t2 = setTimeout(() => setIntroPhase(2), 1800);
    const t3 = setTimeout(() => setIntroPhase(3), 3200);
    const t4 = setTimeout(() => setIntroPhase(4), 5000);
    const t5 = setTimeout(() => setIntroPhase(5), 5800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [chartStep]);

  /* ── Step 0: Full-screen transition moment ─────────── */
  if (step === 0) {
    return (
      <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-5xl flex-col items-center justify-center px-6">
        <motion.span
          className="relative mb-4 inline-block rounded-full px-4 py-1 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${ML_GREEN}15`, color: ML_GREEN }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ border: `1.5px solid ${ML_GREEN}` }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          />
          ML Prediction
        </motion.span>

        <motion.h2
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: ML_GREEN }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          Your data becomes the engine.
        </motion.h2>

        <motion.p
          className="mt-4 max-w-md text-center text-base leading-relaxed"
          style={{ color: `${NAVY}99` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          The ML prediction layer ingests millions of signals to find
          the patterns that drive every price.
        </motion.p>
      </div>
    );
  }

  /* ── Steps 1-7: Chart flow ─────────────────────────── */
  const converged = chartStep >= 6;
  const clustered = chartStep >= 5;
  const sweepActive = chartStep >= 1 && !clustered;

  function dotFill(dot: (typeof DOTS)[0]) {
    if (clustered) return DRIVERS[dot.cluster].color;
    if (dot.cluster < chartStep) return DRIVERS[dot.cluster].color;
    return MUTED;
  }

  function dotOpacity(dot: (typeof DOTS)[0]) {
    if (clustered) return 0.65;
    if (dot.cluster === chartStep - 1) return 0.7;
    if (dot.cluster < chartStep - 1) return 0.45;
    return dot.scatterOpacity;
  }

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* Badge */}
      <motion.span
        className="mb-3 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        2 · Power
      </motion.span>

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
                  You have 2,400 accounts
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
                  each with up to 15,000 SKUs
                </motion.h2>
                <AnimatePresence>
                  {introPhase >= 2 && (
                    <motion.h2
                      className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                      style={{ color: TEAL }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      36 million unique price points
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
                Far too many for any team to set manually&nbsp;— the&nbsp;model finds&nbsp;the&nbsp;patterns.
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
              transition={{ duration: 0.5, delay: chartStep === 1 ? 1.0 : 0 }}
            >
              <motion.h2
                className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: NAVY }}
              >
                {TITLES[chartStep]}
              </motion.h2>
              <motion.p
                className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                style={{ color: MUTED }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: chartStep === 1 ? 1.2 : 0.15 }}
              >
                {SUBTITLES[chartStep]}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <motion.div
        className="relative w-full flex-1 min-h-0 mt-2 flex items-stretch gap-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: chartStep === 0 && introPhase < 4 ? 0 : 1,
          y: chartStep === 0 && introPhase < 4 ? 20 : 0,
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Scatter plot */}
        <div className="relative flex-1 min-w-0 flex items-center justify-center">
        <svg
          viewBox="0 -40 1020 530"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Chart chrome (fades out on cluster step) ── */}
          <motion.g
            animate={{ opacity: clustered ? 0 : 1 }}
            transition={{ duration: 0.5, delay: clustered ? 0 : 0.3 }}
          >
            {Y_TICKS.map((_, i) => (
              <line
                key={`gy${i}`}
                x1={PLOT.left} y1={yForTick(i)}
                x2={PLOT.right} y2={yForTick(i)}
                stroke={`${NAVY}0A`} strokeWidth={0.7}
              />
            ))}
            {X_TICKS.map((_, i) => (
              <line
                key={`gx${i}`}
                x1={xForTick(i)} y1={PLOT.top}
                x2={xForTick(i)} y2={PLOT.bottom}
                stroke={`${NAVY}0A`} strokeWidth={0.7}
              />
            ))}
            <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke={`${NAVY}30`} strokeWidth={1.2} />
            <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke={`${NAVY}30`} strokeWidth={1.2} />

            {Y_TICKS.map((label, i) => {
              const y = yForTick(i);
              return (
                <g key={`yt${i}`}>
                  <line x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} stroke={`${NAVY}40`} strokeWidth={1} />
                  <text x={PLOT.left - 8} y={y + 3.5} textAnchor="end" style={{ fill: MUTED, fontSize: 10, fontFamily: "inherit" }}>{label}</text>
                </g>
              );
            })}
            {X_TICKS.map((label, i) => {
              const x = xForTick(i);
              return (
                <g key={`xt${i}`}>
                  <line x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} stroke={`${NAVY}40`} strokeWidth={1} />
                  <text x={x} y={PLOT.bottom + 16} textAnchor="middle" style={{ fill: MUTED, fontSize: 10, fontFamily: "inherit" }}>{label}</text>
                </g>
              );
            })}

            <text x={PLOT.left + PLOT_W / 2} y={PLOT.bottom + 38} textAnchor="middle"
              style={{ fill: NAVY, fontSize: 11, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.03em" }}>
              Monthly Transaction Volume
            </text>
            <text textAnchor="middle"
              style={{ fill: NAVY, fontSize: 11, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.03em" }}
              transform={`translate(28, ${PLOT.top + PLOT_H / 2}) rotate(-90)`}>
              Selling Price ($)
            </text>
          </motion.g>

          {/* ── Cluster outlines (step 5) ── */}
          {DRIVERS.map((d, i) => (
            <motion.circle
              key={`ring-${i}`}
              cx={CLUSTER_SPREAD[i].cx} cy={CLUSTER_SPREAD[i].cy} r={CLUSTER_R}
              fill="none" stroke={d.color} strokeWidth={1.5} strokeDasharray="5 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: clustered && !converged ? 0.25 : 0 }}
              transition={{ delay: clustered && !converged ? 1.0 + i * 0.12 : 0, duration: 0.5 }}
            />
          ))}

          {/* ── Scanning sweep line (steps 1-4 only) ── */}
          {sweepActive && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: chartStep === 1 ? 1.5 : 0.3 }}
            >
              <defs>
                <linearGradient id="sweep-glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={DRIVERS[chartStep - 1]?.color ?? TEAL} stopOpacity={0} />
                  <stop offset="40%" stopColor={DRIVERS[chartStep - 1]?.color ?? TEAL} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={DRIVERS[chartStep - 1]?.color ?? TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Faint glow trailing the line */}
              <motion.rect
                y={PLOT.top} width={60} height={PLOT_H}
                fill="url(#sweep-glow)"
                animate={{ x: [PLOT.left - 60, PLOT.right, PLOT.left - 60] }}
                transition={{ duration: SWEEP_DURATION, repeat: Infinity, ease: "linear" }}
              />
              {/* The sweep line itself */}
              <motion.line
                x1={PLOT.left} y1={PLOT.top}
                x2={PLOT.left} y2={PLOT.bottom}
                stroke={DRIVERS[chartStep - 1]?.color ?? TEAL}
                strokeWidth={1.2}
                opacity={0.25}
                animate={{ x1: [PLOT.left, PLOT.right, PLOT.left], x2: [PLOT.left, PLOT.right, PLOT.left] }}
                transition={{ duration: SWEEP_DURATION, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          )}

          {/* ── Data dots ── */}
          {DOTS.map((dot, i) => {
            const sp = CLUSTER_SPREAD[dot.cluster];
            const origD = DRIVERS[dot.cluster];
            const spreadCx = sp.cx + (dot.cx - origD.cx) * (CLUSTER_R / 48);
            const spreadCy = sp.cy + (dot.cy - origD.cy) * (CLUSTER_R / 48);
            const convAngle = (i / DOT_COUNT) * Math.PI * 2;
            const convDist = 4 + (i % 7) * 1.5;
            const dotEntranceDelay = chartStep === 0 ? dot.delay * 0.8 + (i % 30) * 0.008 : 0;

            let targetCx: number | number[];
            let targetCy: number | number[];
            let targetFill = dotFill(dot);
            let targetOpacity = dotOpacity(dot);
            let targetR = dot.r;
            let cxTransition: Record<string, unknown>;
            let cyTransition: Record<string, unknown>;
            let opacityDelay = 0.1;

            if (converged) {
              targetCx = PLOT_CX + Math.cos(convAngle) * convDist;
              targetCy = PLOT_CY + Math.sin(convAngle) * convDist;
              targetFill = TEAL;
              targetOpacity = 0.3;
              cxTransition = { duration: 1.0, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.0, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.3 + 0.5;
            } else if (clustered) {
              targetCx = spreadCx;
              targetCy = spreadCy;
              targetOpacity = 0.65;
              cxTransition = { duration: 1.4, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.4, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.3;
            } else if (chartStep === 0 && introPhase < 4) {
              targetCx = PLOT_CX;
              targetCy = PLOT_CY;
              targetR = 0;
              targetOpacity = 0;
              cxTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
            } else if (introPhase >= 5 || chartStep > 0) {
              targetCx = chartStep > 0
                ? dot.sx
                : [dot.sx, dot.sx + dot.driftDx, dot.sx - dot.driftDx * 0.6, dot.sx];
              targetCy = chartStep > 0
                ? dot.sy
                : [dot.sy, dot.sy + dot.driftDy, dot.sy - dot.driftDy * 0.6, dot.sy];
              if (chartStep === 1) {
                const settleDelay = 0.3 + dot.delay * 0.5;
                cxTransition = { duration: 2.0, delay: settleDelay, ease: "easeInOut" };
                cyTransition = { duration: 2.0, delay: settleDelay, ease: "easeInOut" };
              } else if (chartStep > 1) {
                cxTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
                cyTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              } else {
                cxTransition = { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" };
                cyTransition = { duration: dot.driftDuration, delay: dot.driftDelay, repeat: Infinity, ease: "easeInOut" };
              }
              opacityDelay = chartStep === 1 ? 1.3 + dot.delay * 0.4 : dotEntranceDelay + 0.2;
            } else {
              targetCx = dot.sx;
              targetCy = dot.sy;
              cxTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dotEntranceDelay + 0.2;
            }

            return (
              <motion.circle
                key={i}
                fill={targetFill}
                initial={{ cx: PLOT_CX, cy: PLOT_CY, r: 0, fillOpacity: 0 }}
                animate={{
                  cx: targetCx,
                  cy: targetCy,
                  r: targetR,
                  fillOpacity: targetOpacity,
                }}
                transition={{
                  cx: cxTransition,
                  cy: cyTransition,
                  r: { duration: 0.5, delay: dotEntranceDelay, ease: "easeOut" },
                  fillOpacity: { duration: 0.8, delay: opacityDelay },
                  fill: { duration: 1.0, delay: chartStep === 1 ? 1.3 + dot.delay * 0.4 : 0.1 },
                }}
              />
            );
          })}

          {/* ── Highlight rings — dots "found" by the sweep ── */}
          {sweepActive && highlightDotsForCluster(chartStep - 1).map((hi) => {
            const dot = DOTS[hi.index];
            const currentDriver = DRIVERS[chartStep - 1];
            const sweepDelay = hi.normalizedX * (SWEEP_DURATION / 2);
            return (
              <motion.circle
                key={`hl-${chartStep}-${hi.index}`}
                cx={dot.sx}
                cy={dot.sy}
                fill="none"
                stroke={currentDriver.color}
                strokeWidth={1.2}
                initial={{ r: dot.r + 1, opacity: 0 }}
                animate={{
                  r: [dot.r + 1, dot.r + 7, dot.r + 10],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: sweepDelay + 0.3,
                  repeat: Infinity,
                  repeatDelay: SWEEP_DURATION - 1.2,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* ── Callout annotations (step 0 only) ── */}
          {CALLOUTS.map((c, i) => {
            const showCallout = chartStep === 0 && introPhase >= 5;
            const enterDelay = 0.3 + i * 0.25;
            const exitDelay = 0.1 + i * 0.15;
            return (
              <motion.g key={`callout-${i}`}>
                <motion.circle
                  r={8} fill="none" strokeWidth={2}
                  cx={c.x} cy={c.y} stroke={c.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showCallout ? 0.5 : 0 }}
                  transition={{ duration: showCallout ? 0.5 : 0.7, delay: showCallout ? enterDelay : exitDelay, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  r={4} cx={c.x} cy={c.y} fill={c.color}
                  initial={{ fillOpacity: 0 }}
                  animate={{ fillOpacity: showCallout ? 0.7 : 0 }}
                  transition={{ duration: showCallout ? 0.4 : 0.7, delay: showCallout ? enterDelay : exitDelay }}
                />
                {showCallout && (
                  <motion.circle
                    cx={c.x} cy={c.y} r={8}
                    fill="none" stroke={c.color} strokeWidth={1.5}
                    initial={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    transition={{ duration: 0.8, delay: enterDelay + 0.1, ease: "easeOut" }}
                    style={{ transformOrigin: `${c.x}px ${c.y}px` }}
                  />
                )}
                <motion.text
                  x={c.x + c.labelDx} y={c.y + c.labelDy}
                  textAnchor={c.anchor}
                  style={{ fill: c.color, fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showCallout ? 1 : 0 }}
                  transition={{ duration: showCallout ? 0.4 : 0.6, delay: showCallout ? enterDelay + 0.15 : exitDelay }}
                >
                  {c.label}
                </motion.text>
                <motion.text
                  x={c.x + c.labelDx} y={c.y + c.labelDy + 18}
                  textAnchor={c.anchor}
                  style={{ fill: c.color, fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showCallout ? 1 : 0 }}
                  transition={{ duration: showCallout ? 0.4 : 0.6, delay: showCallout ? enterDelay + 0.3 : exitDelay }}
                >
                  {c.price}
                </motion.text>
              </motion.g>
            );
          })}

          {/* ── Cluster labels (step 5) ── */}
          {DRIVERS.map((d, i) => {
            const sp = CLUSTER_SPREAD[i];
            return (
              <motion.g key={`label-${i}`}>
                <motion.rect
                  x={sp.cx - 95} y={sp.cy + CLUSTER_R + 8} width={190} height={32} rx={16} fill="white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: clustered && !converged ? 0.92 : 0 }}
                  transition={{ delay: clustered && !converged ? 1.15 + i * 0.12 : 0, duration: 0.4 }}
                />
                <motion.text
                  x={sp.cx} y={sp.cy + CLUSTER_R + 30} textAnchor="middle"
                  style={{ fill: d.color, fontSize: 19, fontWeight: 700, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: clustered && !converged ? 1 : 0 }}
                  transition={{ delay: clustered && !converged ? 1.2 + i * 0.12 : 0, duration: 0.4 }}
                >
                  {d.label}
                </motion.text>
              </motion.g>
            );
          })}

          {/* ── Connecting lines (step 5) ── */}
          {clustered && !converged && (
            <>
              {[
                [CLUSTER_SPREAD[0], CLUSTER_SPREAD[1]],
                [CLUSTER_SPREAD[2], CLUSTER_SPREAD[3]],
                [CLUSTER_SPREAD[0], CLUSTER_SPREAD[2]],
                [CLUSTER_SPREAD[1], CLUSTER_SPREAD[3]],
              ].map(([a, b], i) => (
                <motion.line
                  key={`conn-${i}`}
                  x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
                  stroke={TEAL} strokeWidth={1} strokeDasharray="3 4"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 0.15, pathLength: 1 }}
                  transition={{ delay: 1.5 + i * 0.1, duration: 0.6 }}
                />
              ))}
            </>
          )}
          {/* ── Price reveal (step 6 — converged) ── */}
          {converged && (() => {
            const CR = 70;
            const DRIVER_NODES = [
              { ...DRIVERS[0], angle: Math.PI * 1.2, contribution: "$14.20", detail: "Cost base", sign: "" },
              { ...DRIVERS[1], angle: Math.PI * 0.3, contribution: "+$2.40", detail: "Market premium", sign: "+" },
              { ...DRIVERS[2], angle: Math.PI * 1.7, contribution: "+$1.80", detail: "Volume lift", sign: "+" },
              { ...DRIVERS[3], angle: Math.PI * 0.7, contribution: "−$0.90", detail: "Win-rate adj.", sign: "−" },
            ];
            const NODE_DIST = 210;
            const NODE_R = 46;
            return (
              <>
                {DRIVER_NODES.map((dn, i) => {
                  const nx = PLOT_CX + Math.cos(dn.angle) * NODE_DIST;
                  const ny = PLOT_CY + Math.sin(dn.angle) * NODE_DIST;
                  const edgeX = PLOT_CX + Math.cos(dn.angle) * (CR + 6);
                  const edgeY = PLOT_CY + Math.sin(dn.angle) * (CR + 6);
                  const cpDist = NODE_DIST * 0.45;
                  const cpX = PLOT_CX + Math.cos(dn.angle) * cpDist;
                  const cpY = PLOT_CY + Math.sin(dn.angle) * cpDist;
                  const pathD = `M ${nx} ${ny} Q ${cpX} ${cpY}, ${edgeX} ${edgeY}`;
                  const flowSteps = 30;
                  const flowCx: number[] = [];
                  const flowCy: number[] = [];
                  for (let s = 0; s <= flowSteps; s++) {
                    const t = s / flowSteps;
                    const u = 1 - t;
                    flowCx.push(u * u * nx + 2 * u * t * cpX + t * t * edgeX);
                    flowCy.push(u * u * ny + 2 * u * t * cpY + t * t * edgeY);
                  }
                  const nodeDelay = 0.3 + i * 0.2;
                  const lineDelay = nodeDelay + 0.4;
                  const dotDelay = lineDelay + 0.3;

                  return (
                    <g key={`conv-driver-${i}`}>
                      <motion.g
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: nodeDelay, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: `${nx}px ${ny}px` }}
                      >
                        <circle cx={nx} cy={ny} r={NODE_R} fill={`${dn.color}08`} stroke={dn.color} strokeWidth={1.5} opacity={0.3} />
                        <text x={nx} y={ny - NODE_R - 8} textAnchor="middle"
                          style={{ fontSize: 11, fontWeight: 700, fill: dn.color, fontFamily: "inherit" }}>
                          {dn.label}
                        </text>
                        <text x={nx} y={ny + 4} textAnchor="middle"
                          style={{ fontSize: 20, fontWeight: 800, fill: dn.color, fontFamily: "inherit" }}>
                          {dn.contribution}
                        </text>
                        <text x={nx} y={ny + 20} textAnchor="middle"
                          style={{ fontSize: 10, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}>
                          {dn.detail}
                        </text>
                      </motion.g>

                      <motion.path
                        d={pathD} fill="none" stroke={dn.color} strokeWidth={1.5} strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 0.7, delay: lineDelay, ease: "easeOut" }}
                      />

                      {[0, 1.5, 3].map((extraDelay, di) => (
                        <motion.circle
                          key={`flow-${i}-${di}`}
                          r={2.5} fill={dn.color}
                          initial={{ opacity: 0 }}
                          animate={{
                            cx: flowCx,
                            cy: flowCy,
                            opacity: [0, 0.6, 0.6, 0.6, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            delay: dotDelay + extraDelay,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ))}
                    </g>
                  );
                })}

                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={CR}
                  fill="white" stroke={TEAL} strokeWidth={2.5}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={CR}
                  fill="none" stroke={TEAL} strokeWidth={2}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={CR + 2}
                  fill="none" stroke={TEAL} strokeWidth={1.5}
                  animate={{ opacity: [0, 0.2, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.text
                  x={PLOT_CX} y={PLOT_CY - 20}
                  textAnchor="middle"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", fill: MUTED, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  RECOMMENDED
                </motion.text>
                <motion.text
                  x={PLOT_CX} y={PLOT_CY + 14}
                  textAnchor="middle"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.0, type: "spring", stiffness: 200 }}
                  style={{ fontSize: 36, fontWeight: 800, fill: NAVY, fontFamily: "inherit", transformOrigin: `${PLOT_CX}px ${PLOT_CY + 6}px` }}
                >
                  $17.50
                </motion.text>
                <motion.text
                  x={PLOT_CX} y={PLOT_CY + 32}
                  textAnchor="middle"
                  style={{ fontSize: 10.5, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                >
                  per unit · SKU #A-7200
                </motion.text>
              </>
            );
          })()}

        </svg>
        </div>

      </motion.div>

      {/* ── Bottom cards (steps 1-4, hidden at cluster step) ── */}
      <AnimatePresence>
        {chartStep >= 1 && !clustered && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 w-full px-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, delay: chartStep === 1 ? 1.2 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {SPOTLIGHTS.map((s, i) => {
              const d = DRIVERS[s.cluster];
              const isActive = clustered ? false : i === chartStep - 1;
              const isRevealed = clustered || i < chartStep;
              if (!isRevealed) return null;
              return (
                <motion.div
                  key={s.label}
                  className="relative overflow-hidden rounded-xl border bg-white/95 shadow-sm backdrop-blur-sm"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: d.color,
                    borderColor: `${d.color}20`,
                    minWidth: 200,
                    maxWidth: 260,
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{
                    opacity: isActive ? 1 : clustered ? 0.9 : 0.55,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  layout
                >
                  {isActive && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${d.color}40, ${d.color}, ${d.color}40, transparent)`,
                        backgroundSize: "200% 100%",
                      }}
                      animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <div className="px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="relative flex-shrink-0">
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: d.color }}
                            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        <div className="relative">
                          <CategoryIcon type={s.icon} color={d.color} size={20} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.68rem] font-bold tracking-[0.06em] uppercase truncate" style={{ color: d.color }}>
                          {s.label}
                        </div>
                        <div className="text-[0.62rem]" style={{ color: MUTED }}>
                          {s.count}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.pills.map((pill, pi) => (
                        <motion.span
                          key={pill}
                          className="rounded-full border px-2 py-px text-[0.62rem] font-medium whitespace-nowrap"
                          style={{
                            borderColor: `${d.color}25`,
                            color: d.color,
                            backgroundColor: `${d.color}06`,
                          }}
                          initial={{ opacity: 0, x: -20, scale: 0.8 }}
                          animate={{ opacity: isActive ? 1 : clustered ? 0.8 : 0.6, x: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: isActive ? 0.5 + pi * (SWEEP_DURATION / 2 / s.pills.length) : 0,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {pill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
