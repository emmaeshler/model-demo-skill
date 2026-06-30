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

const SOLID_TINTS: Record<string, string> = {
  [ORANGE]: "#FEF4EC",
  [NAVY]: "#E8F1F6",
  [PURPLE]: "#F0ECF6",
};

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

/* ─── Triangle factor layout ─── */

const TRIANGLE_VERTS = {
  product: { x: 504, y: 55, label: "PRODUCT", color: ORANGE },
  customer: { x: 195, y: 395, label: "CUSTOMER", color: NAVY },
  order: { x: 813, y: 395, label: "ORDER", color: PURPLE },
};

const TRIANGLE_FACTORS: { label: string; category: "product" | "customer" | "order"; emphasis?: "highlight" | "crossoff" }[] = [
  { label: "Product mix", category: "product" },
  { label: "Product family", category: "product" },
  { label: "Price sensitivity", category: "product" },
  { label: "Product specialization", category: "product" },
  { label: "Competitive price point", category: "product" },
  { label: "Willingness to pay", category: "product" },
  { label: "Cost to serve", category: "product" },
  { label: "Customer channel", category: "customer" },
  { label: "End market", category: "customer", emphasis: "crossoff" },
  { label: "Sales rep", category: "customer", emphasis: "highlight" },
  { label: "Region", category: "customer" },
  { label: "Size of customer", category: "customer" },
  { label: "Customer tenure", category: "customer" },
  { label: "Product mix", category: "customer" },
  { label: "Order frequency", category: "order" },
  { label: "Order size", category: "order" },
  { label: "Lead time", category: "order" },
  { label: "Payment terms", category: "order" },
  { label: "Contract type", category: "order" },
  { label: "Seasonality", category: "order" },
  { label: "Delivery method", category: "order" },
];

const CATEGORY_LAYOUT = [
  { key: "product" as const, x: 310, y: 55, w: 388, h: 180, color: ORANGE, labelDelay: 0.2, baseDelay: 3.8 },
  { key: "customer" as const, x: 0, y: 330, w: 340, h: 165, color: NAVY, labelDelay: 0.3, baseDelay: 5.6 },
  { key: "order" as const, x: 680, y: 330, w: 340, h: 165, color: PURPLE, labelDelay: 0.4, baseDelay: 7.4 },
];

const CUSTOMIZE_ACTIONS = [
  { text: "For this market, competitive intelligence is a key factor" },
  { text: "For this client, end market isn’t a relevant factor" },
  { text: "Sales rep is a key pricing driver for this business" },
];

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
  "21 pricing factors identified",
  "Customized for your business",
  "One optimal price",
];

const SUBTITLES = [
  "That's 36 million unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "The model scans 14,200 transaction records to surface underlying cost trends.",
  "36 real-time market features reveal where you stand against competitors.",
  "2,400 accounts with distinct buying profiles show how demand responds to price.",
  "18 months of win/loss data uncover what drives customer decisions.",
  "The model identifies the variables that drive every price — grouped by product, customer, and order.",
  "Based on your data, certain factors matter more — and others fall away.",
  "All three dimensions converge into a single recommended price — for every account and SKU.",
];

/* ─── Pre-compute dot positions ─── */

const DOT_COUNT = 420;
const rand = mulberry32(42);

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const cluster = i % 4;
  const d = DRIVERS[cluster];
  const angle = rand() * Math.PI * 2;
  const dist = rand() * 48 + 10;

  let sx: number;
  let sy: number;

  const zone = rand();
  if (zone < 0.28) {
    // Upper-left cluster: high price, low volume
    const rawX = 0.10 + (rand() - 0.5) * 0.16 + (rand() - 0.5) * 0.08;
    const rawY = 0.15 + (rand() - 0.5) * 0.20 + (rand() - 0.5) * 0.08;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.56) {
    // Lower-left cluster: low price, low volume
    const rawX = 0.13 + (rand() - 0.5) * 0.20 + (rand() - 0.5) * 0.08;
    const rawY = 0.73 + (rand() - 0.5) * 0.24 + (rand() - 0.5) * 0.08;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.72) {
    // Bridge between clusters (the bend of the boomerang)
    const rawX = 0.08 + rand() * 0.16;
    const rawY = 0.30 + rand() * 0.30;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.90) {
    // Trail sweeping right from lower cluster
    const t = rand();
    const rawX = 0.25 + t * 0.45;
    const rawY = 0.55 + t * 0.20 + (rand() - 0.5) * 0.18;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else {
    // Sparse fill (avoid upper right)
    const rawX = rand() * 0.80;
    let rawY = rand() * 0.85 + 0.05;
    if (rawX > 0.45 && rawY < 0.35) {
      rawY = 0.40 + rand() * 0.50;
    }
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
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

/* ─── Triangle-edge targets for dots ─── */

const triRand = mulberry32(99);
const TRI_EDGES = [
  { fx: TRIANGLE_VERTS.product.x, fy: TRIANGLE_VERTS.product.y, tx: TRIANGLE_VERTS.customer.x, ty: TRIANGLE_VERTS.customer.y },
  { fx: TRIANGLE_VERTS.product.x, fy: TRIANGLE_VERTS.product.y, tx: TRIANGLE_VERTS.order.x, ty: TRIANGLE_VERTS.order.y },
  { fx: TRIANGLE_VERTS.customer.x, fy: TRIANGLE_VERTS.customer.y, tx: TRIANGLE_VERTS.order.x, ty: TRIANGLE_VERTS.order.y },
];
const TRI_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const edgeIdx = i % 3;
  const edge = TRI_EDGES[edgeIdx];
  const t = Math.max(0.03, Math.min(0.97, (Math.floor(i / 3) + triRand() * 0.3) / Math.ceil(DOT_COUNT / 3)));
  const dx = edge.tx - edge.fx;
  const dy = edge.ty - edge.fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len;
  const perpY = dx / len;
  const offset = (triRand() - 0.5) * 12;
  return {
    x: edge.fx + dx * t + perpX * offset,
    y: edge.fy + dy * t + perpY * offset,
  };
});

/* ─── Cluster targets (intermediate step before triangle) ─── */

const CLUSTER_VERTS = [TRIANGLE_VERTS.product, TRIANGLE_VERTS.customer, TRIANGLE_VERTS.order];
const CLUSTER_COLORS = [ORANGE, NAVY, PURPLE];

const clusterRand = mulberry32(77);
const CLUSTER_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const target = TRI_TARGETS[i];
  const dProd = Math.hypot(target.x - TRIANGLE_VERTS.product.x, target.y - TRIANGLE_VERTS.product.y);
  const dCust = Math.hypot(target.x - TRIANGLE_VERTS.customer.x, target.y - TRIANGLE_VERTS.customer.y);
  const dOrd = Math.hypot(target.x - TRIANGLE_VERTS.order.x, target.y - TRIANGLE_VERTS.order.y);
  const ci = dProd <= dCust && dProd <= dOrd ? 0 : dCust <= dOrd ? 1 : 2;
  const vert = CLUSTER_VERTS[ci];
  const angle = clusterRand() * Math.PI * 2;
  const dist = clusterRand() * 30 + 5;
  return {
    x: vert.x + Math.cos(angle) * dist,
    y: vert.y + Math.sin(angle) * dist,
    ci,
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

export function PowerSlide({ step = 0, onAutoAdvance, skipAnimation }: { step: number; onAutoAdvance?: () => void; skipAnimation?: boolean }) {
  const chartStep = step - 1;

  useEffect(() => {
    if (skipAnimation || !onAutoAdvance || chartStep < 1 || chartStep > 4) return;
    const spotlight = SPOTLIGHTS[chartStep - 1];
    const pillCount = spotlight.pills.length;
    const lastPillDelay = 0.5 + (pillCount - 1) * (SWEEP_DURATION / 2 / pillCount);
    const lastPillDone = lastPillDelay + 0.6;
    const cardEntranceDelay = chartStep === 1 ? 1.2 : 0;
    const totalMs = (cardEntranceDelay + lastPillDone + 1.5) * 1000;
    const timer = setTimeout(onAutoAdvance, totalMs);
    return () => clearTimeout(timer);
  }, [chartStep, onAutoAdvance, skipAnimation]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 5 : chartStep === 0 ? 0 : 4);
  const [customizePhase, setCustomizePhase] = useState(chartStep > 6 || (skipAnimation && chartStep >= 6) ? 2 : -1);
  const [trianglePhase, setTrianglePhase] = useState(chartStep > 5 || (skipAnimation && chartStep >= 5) ? 1 : 0);
  useEffect(() => {
    if (skipAnimation) { setIntroPhase(5); return; }
    if (chartStep !== 0) {
      const t0 = setTimeout(() => setIntroPhase(5));
      return () => clearTimeout(t0);
    }
    const settle = 700;
    const t0 = setTimeout(() => setIntroPhase(0));
    const t1 = setTimeout(() => setIntroPhase(1), settle + 800);
    const t2 = setTimeout(() => setIntroPhase(2), settle + 1800);
    const t3 = setTimeout(() => setIntroPhase(3), settle + 3200);
    const t4 = setTimeout(() => setIntroPhase(4), settle + 5000);
    const t5 = setTimeout(() => setIntroPhase(5), settle + 5800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [chartStep, skipAnimation]);

  /* ── Step 0: Brief section label ────────────────────── */
  useEffect(() => {
    if (skipAnimation || step !== 0 || !onAutoAdvance) return;
    const t = setTimeout(onAutoAdvance, 2800);
    return () => clearTimeout(t);
  }, [step, onAutoAdvance, skipAnimation]);

  useEffect(() => {
    if (chartStep < 5) { setTrianglePhase(0); return; }
    if (chartStep > 5 || skipAnimation) { setTrianglePhase(1); return; }
    setTrianglePhase(0);
    const t = setTimeout(() => setTrianglePhase(1), 2000);
    return () => clearTimeout(t);
  }, [chartStep, skipAnimation]);

  useEffect(() => {
    if (chartStep < 6) { setCustomizePhase(-1); return; }
    if (chartStep > 6 || skipAnimation) { setCustomizePhase(2); return; }
    setCustomizePhase(-1);
    const t0 = setTimeout(() => setCustomizePhase(0), 800);
    const t1 = setTimeout(() => setCustomizePhase(1), 3000);
    const t2 = setTimeout(() => setCustomizePhase(2), 5200);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [chartStep, skipAnimation]);

  if (step === 0) {
    return (
      <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-5xl flex-col items-center justify-center px-6">
        <motion.span
          className="inline-block rounded-full px-5 py-1.5 text-sm font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${ML_GREEN}12`, color: ML_GREEN }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.95] }}
          transition={{ duration: 2.0, times: [0, 0.15, 0.6, 1], ease: "easeOut" }}
        >
          ML Prediction
        </motion.span>
      </div>
    );
  }

  /* ── Chart flow ─────────────────────────────────────── */
  const triangleVisible = chartStep >= 5;
  const customized = chartStep >= 6;
  const converged = chartStep >= 7;
  const sweepActive = chartStep >= 1 && chartStep <= 4;

  function dotFill(dot: (typeof DOTS)[0]) {
    if (triangleVisible) return TEAL;
    if (dot.cluster < chartStep) return DRIVERS[dot.cluster].color;
    return MUTED;
  }

  function dotOpacity(dot: (typeof DOTS)[0]) {
    if (triangleVisible) return 0.35;
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
        <AnimatePresence mode="wait">
          {chartStep === 0 && (
            <motion.div
              key="intro-title"
              className="absolute inset-0 flex flex-col items-center justify-start"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: chartStep === 1 ? 1.0 : 0 }}
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
            animate={{ opacity: triangleVisible ? 0 : 1 }}
            transition={{ duration: 0.5, delay: triangleVisible ? 0 : 0.3 }}
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

          {/* ── Triangle outline (step 5+) ── */}
          <motion.polygon
            points={`${TRIANGLE_VERTS.product.x},${TRIANGLE_VERTS.product.y} ${TRIANGLE_VERTS.customer.x},${TRIANGLE_VERTS.customer.y} ${TRIANGLE_VERTS.order.x},${TRIANGLE_VERTS.order.y}`}
            fill="none"
            stroke={TEAL}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: trianglePhase >= 1 && !converged ? 0.25 : 0 }}
            transition={{ delay: trianglePhase >= 1 && !converged ? 0.5 : 0, duration: 0.6 }}
          />

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
            const convAngle = (i / DOT_COUNT) * Math.PI * 2;
            const convDist = 4 + (i % 7) * 1.5;
            const dotEntranceDelay = chartStep === 0 ? dot.delay * 1.6 + (i % 40) * 0.012 : 0;

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
            } else if (triangleVisible && trianglePhase >= 1) {
              const tri = TRI_TARGETS[i];
              targetCx = tri.x;
              targetCy = tri.y;
              targetFill = TEAL;
              targetOpacity = 0.35;
              targetR = dot.r * 0.7;
              cxTransition = { duration: 1.4, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.4, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.3;
            } else if (triangleVisible) {
              const cl = CLUSTER_TARGETS[i];
              targetCx = cl.x;
              targetCy = cl.y;
              targetFill = CLUSTER_COLORS[cl.ci];
              targetOpacity = 0.55;
              targetR = dot.r * 0.8;
              cxTransition = { duration: 1.2, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.2, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.3;
            } else if (chartStep === 0 && introPhase < 4) {
              targetCx = dot.sx;
              targetCy = dot.sy - 18;
              targetR = 0;
              targetOpacity = 0;
              cxTransition = { duration: 0.01 };
              cyTransition = { duration: 0.01 };
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
              cxTransition = { duration: 0.5, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 0.6, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dotEntranceDelay;
            }

            return (
              <motion.circle
                key={i}
                fill={targetFill}
                initial={{ cx: dot.sx, cy: dot.sy - 18, r: 0, fillOpacity: 0 }}
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

          {/* ── Triangle labels + factor pills (step 5+, sequential) ── */}
          {triangleVisible && !converged && CATEGORY_LAYOUT.map((cat) => {
            const vert = TRIANGLE_VERTS[cat.key];
            return (
              <foreignObject key={`cat-group-${cat.key}`} x={cat.x} y={cat.y} width={cat.w} height={cat.h}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <motion.div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: cat.color,
                      letterSpacing: "0.12em",
                      fontFamily: "inherit",
                      textAlign: "center",
                      backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                      borderRadius: 4,
                      padding: "2px 12px",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: cat.labelDelay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {vert.label}
                  </motion.div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
                {TRIANGLE_FACTORS.filter(f => f.category === cat.key).map((f, fi) => {
                  const isCrossed = customizePhase >= 1 && f.emphasis === "crossoff";
                  const isHighlighted = customizePhase >= 2 && f.emphasis === "highlight";
                  return (
                    <motion.span
                      key={`${cat.key}-${f.label}`}
                      style={{
                        display: "inline-block",
                        borderRadius: 12,
                        border: `1.5px solid ${isHighlighted ? TEAL : isCrossed ? `${MUTED}40` : `${cat.color}30`}`,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: isHighlighted ? 700 : 500,
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        color: isCrossed ? MUTED : isHighlighted ? TEAL : cat.color,
                        backgroundColor: isHighlighted ? "#E5F5FA" : isCrossed ? "#F3F4F5" : (SOLID_TINTS[cat.color] ?? "white"),
                        textDecoration: isCrossed ? "line-through" : "none",
                        transition: "color 0.5s ease, border-color 0.5s ease, background-color 0.5s ease",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isCrossed ? [1, 1, 0.35] : 1,
                        scale: isHighlighted ? [1, 1.25, 1.12] : isCrossed ? [1, 1.2, 0.95] : 1,
                        boxShadow: isHighlighted
                          ? ["0 0 0px transparent", `0 0 16px ${TEAL}60`, `0 0 8px ${TEAL}30`]
                          : isCrossed
                            ? ["0 0 0px transparent", `0 0 14px ${cat.color}60`, "0 0 0px transparent"]
                            : "0 0 0px transparent",
                      }}
                      transition={{
                        duration: (isCrossed || isHighlighted) ? 1.0 : 0.5,
                        times: (isCrossed || isHighlighted) ? [0, 0.3, 1] : undefined,
                        delay: !customized ? cat.baseDelay + fi * 0.12 : 0,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {f.label}
                    </motion.span>
                  );
                })}
                {cat.key === "product" && customizePhase >= 0 && (
                  <motion.span
                    style={{
                      display: "inline-block",
                      borderRadius: 12,
                      border: `1.5px solid ${ML_GREEN}`,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      color: ML_GREEN,
                      backgroundColor: "#ECF4ED",
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    + Competitive intelligence
                  </motion.span>
                )}
                  </div>
                </div>
              </foreignObject>
            );
          })}

          {/* ── Customize action text (step 6) ── */}
          {customized && !converged && customizePhase >= 0 && customizePhase < CUSTOMIZE_ACTIONS.length && (
            <foreignObject x={210} y={270} width={600} height={50}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={customizePhase}
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: NAVY,
                    fontStyle: "italic",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  {CUSTOMIZE_ACTIONS[customizePhase].text}
                </motion.div>
              </AnimatePresence>
            </foreignObject>
          )}

          {/* ── Price reveal (step 7 — converged) ── */}
          {converged && (() => {
            const CR = 70;
            const CONV_NODES = [
              { label: "Product", color: ORANGE, angle: Math.PI * 0.3, contribution: "+$3.80", detail: "Product factors" },
              { label: "Customer", color: NAVY, angle: Math.PI * 1.2, contribution: "$11.30", detail: "Customer base" },
              { label: "Order", color: PURPLE, angle: Math.PI * 0.7, contribution: "+$2.40", detail: "Order patterns" },
            ];
            const NODE_DIST = 210;
            const NODE_R = 46;
            return (
              <>
                {CONV_NODES.map((dn, i) => {
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
                    <g key={`conv-node-${i}`}>
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
        {chartStep >= 1 && !triangleVisible && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 w-full px-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.6, delay: chartStep === 1 ? 1.2 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {SPOTLIGHTS.map((s, i) => {
              const d = DRIVERS[s.cluster];
              const isActive = triangleVisible ? false : i === chartStep - 1;
              const isRevealed = triangleVisible || i < chartStep;
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
                    opacity: isActive ? 1 : triangleVisible ? 0.9 : 0.55,
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
                          animate={{ opacity: isActive ? 1 : triangleVisible ? 0.8 : 0.6, x: 0, scale: 1 }}
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
