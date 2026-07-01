"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const ORANGE = "#E56910";
const GREEN = "#2e7d32";
const PURPLE = "#7B5EA7";
const MUTED = "#5A6A78";

export const POWER_TOTAL_STEPS = 10;

const ML_GREEN = "#3A7D44";

const SOLID_TINTS: Record<string, string> = {
  [ORANGE]: "#FEF4EC",
  [NAVY]: "#E8F1F6",
  [PURPLE]: "#F0ECF6",
  [GREEN]: "#E8F5E9",
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

/* ─── Cluster spread (step 5: dots cluster into 4 groups) ─── */

const CLUSTER_SPREAD = [
  { cx: 280, cy: 110 },
  { cx: 730, cy: 110 },
  { cx: 280, cy: 340 },
  { cx: 730, cy: 340 },
];
const CLUSTER_R = 95;

/* ─── Square factor layout ─── */

const SQUARE_VERTS = {
  customer: { x: 280, y: 110, label: "CUSTOMER", color: NAVY },
  product: { x: 730, y: 110, label: "PRODUCT", color: ORANGE },
  market: { x: 280, y: 340, label: "MARKET", color: GREEN },
  order: { x: 730, y: 340, label: "ORDER", color: PURPLE },
};

const SQUARE_FACTORS: { label: string; category: "product" | "market" | "customer" | "order"; emphasis?: "highlight" | "crossoff" | "order-highlight" }[] = [
  { label: "Product mix", category: "product" },
  { label: "Product family", category: "product" },
  { label: "Product specialization", category: "product" },
  { label: "Cost to serve", category: "product" },
  { label: "Willingness to pay", category: "product" },
  { label: "Price sensitivity", category: "product" },
  { label: "Competitive price point", category: "market" },
  { label: "Market share", category: "market" },
  { label: "Commodity index", category: "market" },
  { label: "Regional pricing", category: "market" },
  { label: "Industry trends", category: "market" },
  { label: "Competitor activity", category: "market" },
  { label: "Customer channel", category: "customer" },
  { label: "End market", category: "customer", emphasis: "crossoff" },
  { label: "Sales rep", category: "customer", emphasis: "highlight" },
  { label: "Region", category: "customer" },
  { label: "Size of customer", category: "customer" },
  { label: "Customer tenure", category: "customer" },
  { label: "Order frequency", category: "order" },
  { label: "Order size", category: "order" },
  { label: "Lead time", category: "order" },
  { label: "Payment terms", category: "order" },
  { label: "Contract type", category: "order", emphasis: "order-highlight" },
  { label: "Seasonality", category: "order" },
];

const CATEGORY_LAYOUT = [
  { key: "customer" as const, x: 20, y: 0, w: 470, h: 190, color: NAVY, labelDelay: 0.2, baseDelay: 2.8 },
  { key: "product" as const, x: 530, y: 0, w: 470, h: 190, color: ORANGE, labelDelay: 0.25, baseDelay: 4.2 },
  { key: "market" as const, x: 20, y: 260, w: 470, h: 190, color: GREEN, labelDelay: 0.3, baseDelay: 5.6 },
  { key: "order" as const, x: 530, y: 260, w: 470, h: 190, color: PURPLE, labelDelay: 0.35, baseDelay: 7.0 },
];

const CUSTOMIZE_ACTIONS = [
  { headline: "Add a factor", detail: "Competitive intelligence is critical in this market — add it to the model." },
  { headline: "Remove a factor", detail: "End market isn’t a meaningful driver for this client — take it out." },
  { headline: "Elevate a driver", detail: "Sales rep relationships drive pricing power here — weight it higher." },
  { headline: "Elevate a driver", detail: "Contract type defines flexibility for this customer — weight it higher." },
];

const CUSTOMIZE_PILL_LAYOUT: Record<string, { x: number; y: number }> = {
  customer: { x: 10, y: 15 },
  product: { x: 10, y: 125 },
  market: { x: 10, y: 235 },
  order: { x: 10, y: 345 },
};

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
  "24 pricing factors identified",
  "Customized for your business",
  "Your factors feed the model",
  "One optimal price",
  "Tailored for every customer",
];

const SUBTITLES = [
  "That's 36 million unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "The model scans 14,200 transaction records to surface underlying cost trends.",
  "36 real-time market features reveal where you stand against competitors.",
  "2,400 accounts with distinct buying profiles show how demand responds to price.",
  "18 months of win/loss data uncover what drives customer decisions.",
  "Cost, competition, elasticity, and demand — isolated from the noise.",
  "The model identifies the variables that drive every price — grouped by customer, product, market, and order.",
  "Based on your data, certain factors matter more — and others fall away.",
  "Customer, product, market, and order dimensions each contribute unique signal to your price.",
  "All four dimensions converge into a single recommended price — for every account and SKU.",
  "The same list price becomes three different recommendations — each optimized for the customer.",
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

/* ─── Square-edge targets for dots ─── */

const sqRand = mulberry32(99);
const SQUARE_EDGES = [
  { fx: SQUARE_VERTS.product.x, fy: SQUARE_VERTS.product.y, tx: SQUARE_VERTS.market.x, ty: SQUARE_VERTS.market.y },
  { fx: SQUARE_VERTS.market.x, fy: SQUARE_VERTS.market.y, tx: SQUARE_VERTS.order.x, ty: SQUARE_VERTS.order.y },
  { fx: SQUARE_VERTS.order.x, fy: SQUARE_VERTS.order.y, tx: SQUARE_VERTS.customer.x, ty: SQUARE_VERTS.customer.y },
  { fx: SQUARE_VERTS.customer.x, fy: SQUARE_VERTS.customer.y, tx: SQUARE_VERTS.product.x, ty: SQUARE_VERTS.product.y },
];
const SQUARE_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const edgeIdx = i % 4;
  const edge = SQUARE_EDGES[edgeIdx];
  const t = Math.max(0.03, Math.min(0.97, (Math.floor(i / 4) + sqRand() * 0.3) / Math.ceil(DOT_COUNT / 4)));
  const dx = edge.tx - edge.fx;
  const dy = edge.ty - edge.fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len;
  const perpY = dx / len;
  const offset = (sqRand() - 0.5) * 12;
  return {
    x: edge.fx + dx * t + perpX * offset,
    y: edge.fy + dy * t + perpY * offset,
  };
});

/* ─── Cluster targets (intermediate step before square) ─── */

const CLUSTER_VERTS = [SQUARE_VERTS.customer, SQUARE_VERTS.product, SQUARE_VERTS.market, SQUARE_VERTS.order];
const CLUSTER_COLORS = [NAVY, ORANGE, GREEN, PURPLE];

const clusterRand = mulberry32(77);
const CLUSTER_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const target = SQUARE_TARGETS[i];
  const dists = CLUSTER_VERTS.map(v => Math.hypot(target.x - v.x, target.y - v.y));
  const minDist = Math.min(...dists);
  const ci = dists.indexOf(minDist);
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
const PILL_STAGGER_SPAN = 1.5;

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
  const chartStep = step;

  useEffect(() => {
    if (skipAnimation || !onAutoAdvance || chartStep < 1 || chartStep > 3) return;
    const spotlight = SPOTLIGHTS[chartStep - 1];
    const pillCount = spotlight.pills.length;
    const lastPillDelay = 0.5 + (pillCount - 1) * (PILL_STAGGER_SPAN / pillCount);
    const lastPillDone = lastPillDelay + 0.6;
    const cardEntranceDelay = chartStep === 1 ? 0.8 : 0;
    const totalMs = (cardEntranceDelay + lastPillDone + 0.4) * 1000;
    const timer = setTimeout(onAutoAdvance, totalMs);
    return () => clearTimeout(timer);
  }, [chartStep, onAutoAdvance, skipAnimation]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 5 : chartStep === 0 ? 0 : 4);
  const [customizePhase, setCustomizePhase] = useState(chartStep > 7 || (skipAnimation && chartStep >= 7) ? CUSTOMIZE_ACTIONS.length : -1);
  const [factorsPhase, setFactorsPhase] = useState(chartStep > 6 || (skipAnimation && chartStep >= 6) ? 1 : 0);
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
    if (chartStep < 6) { setFactorsPhase(0); return; }
    if (chartStep > 6 || skipAnimation) { setFactorsPhase(1); return; }
    setFactorsPhase(0);
    const t = setTimeout(() => setFactorsPhase(1), 600);
    return () => clearTimeout(t);
  }, [chartStep, skipAnimation]);

  useEffect(() => {
    if (chartStep < 7) { setCustomizePhase(-1); return; }
    if (chartStep > 7 || skipAnimation) { setCustomizePhase(CUSTOMIZE_ACTIONS.length); return; }
    setCustomizePhase(-1);
    const t0 = setTimeout(() => setCustomizePhase(0), 1800);
    const t1 = setTimeout(() => setCustomizePhase(1), 4000);
    const t2 = setTimeout(() => setCustomizePhase(2), 6200);
    const t3 = setTimeout(() => setCustomizePhase(3), 8400);
    const t4 = setTimeout(() => setCustomizePhase(4), 10600);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep, skipAnimation]);

  /* ── Chart flow ─────────────────────────────────────── */
  const clustered = chartStep >= 5;
  const factorsVisible = chartStep >= 6;
  const customized = chartStep >= 7;
  const feeding = chartStep >= 8;
  const converged = chartStep >= 9;
  const showCustomers = chartStep >= 10;
  const sweepActive = chartStep >= 1 && chartStep <= 4;

  function dotFill(dot: (typeof DOTS)[0]) {
    if (factorsVisible) return TEAL;
    if (clustered) return DRIVERS[dot.cluster].color;
    if (dot.cluster < chartStep) return DRIVERS[dot.cluster].color;
    return MUTED;
  }

  function dotOpacity(dot: (typeof DOTS)[0]) {
    if (customized) return 0;
    if (factorsVisible) return 0.35;
    if (clustered) return 0.65;
    if (dot.cluster === chartStep - 1) return 0.7;
    if (dot.cluster < chartStep - 1) return 0.45;
    return dot.scatterOpacity;
  }

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
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

          {/* ── Cluster circles + labels (step 5) ── */}
          {CLUSTER_SPREAD.map((sp, i) => (
            <g key={`cluster-ring-${i}`}>
              <motion.circle
                cx={sp.cx} cy={sp.cy} r={CLUSTER_R}
                fill="none" stroke={DRIVERS[i].color} strokeWidth={1.2} strokeDasharray="4 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: clustered && !factorsVisible ? 0.25 : 0 }}
                transition={{ delay: clustered && !factorsVisible ? 1.0 + i * 0.12 : 0, duration: 0.5 }}
              />
              <motion.text
                x={sp.cx} y={sp.cy + CLUSTER_R + 20}
                textAnchor="middle"
                style={{ fontSize: 13, fontWeight: 700, fill: DRIVERS[i].color, fontFamily: "inherit" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: clustered && !factorsVisible ? 0.8 : 0 }}
                transition={{ delay: clustered && !factorsVisible ? 1.2 + i * 0.12 : 0, duration: 0.4 }}
              >
                {DRIVERS[i].label}
              </motion.text>
            </g>
          ))}

          {/* ── Square outline (step 6+) ── */}
          <motion.polygon
            points={`${SQUARE_VERTS.customer.x},${SQUARE_VERTS.customer.y} ${SQUARE_VERTS.product.x},${SQUARE_VERTS.product.y} ${SQUARE_VERTS.order.x},${SQUARE_VERTS.order.y} ${SQUARE_VERTS.market.x},${SQUARE_VERTS.market.y}`}
            fill="none"
            stroke={TEAL}
            strokeWidth={customizePhase >= CUSTOMIZE_ACTIONS.length && !feeding ? 2.5 : 1.5}
            strokeDasharray={customizePhase >= CUSTOMIZE_ACTIONS.length && !feeding ? "none" : "5 4"}
            initial={{ opacity: 0 }}
            animate={{ opacity: factorsPhase >= 1 && !customized && !converged && !feeding ? 0.25 : 0 }}
            transition={{ delay: factorsPhase >= 1 && !customized && !converged ? 0.2 : 0, duration: 0.4 }}
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
            } else if (feeding) {
              const cl = CLUSTER_TARGETS[i];
              const feedDist = 12 + (i % 9) * 2.5;
              const feedAngle = convAngle;
              targetCx = PLOT_CX + Math.cos(feedAngle) * feedDist;
              targetCy = PLOT_CY + Math.sin(feedAngle) * feedDist;
              targetFill = CLUSTER_COLORS[cl.ci];
              targetOpacity = 0.2;
              targetR = dot.r * 0.5;
              cxTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.4 + 0.3;
            } else if (factorsVisible && factorsPhase >= 1) {
              const sq = SQUARE_TARGETS[i];
              targetCx = sq.x;
              targetCy = sq.y;
              targetFill = TEAL;
              targetOpacity = customized ? 0 : 0.35;
              targetR = customized ? 0 : dot.r * 0.7;
              cxTransition = { duration: 0.7, delay: dot.delay * 0.15, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 0.7, delay: dot.delay * 0.15, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.15;
            } else if (factorsVisible) {
              const cl = CLUSTER_TARGETS[i];
              targetCx = cl.x;
              targetCy = cl.y;
              targetFill = CLUSTER_COLORS[cl.ci];
              targetOpacity = 0.55;
              targetR = dot.r * 0.8;
              cxTransition = { duration: 0.6, delay: dot.delay * 0.1, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 0.6, delay: dot.delay * 0.1, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.1;
            } else if (clustered) {
              const sp = CLUSTER_SPREAD[dot.cluster];
              const origD = DRIVERS[dot.cluster];
              const spreadCx = sp.cx + (dot.cx - origD.cx) * (CLUSTER_R / 48);
              const spreadCy = sp.cy + (dot.cy - origD.cy) * (CLUSTER_R / 48);
              targetCx = Math.max(sp.cx - CLUSTER_R + 4, Math.min(sp.cx + CLUSTER_R - 4, spreadCx));
              targetCy = Math.max(sp.cy - CLUSTER_R + 4, Math.min(sp.cy + CLUSTER_R - 4, spreadCy));
              targetFill = DRIVERS[dot.cluster].color;
              targetOpacity = 0.65;
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
          {/* ── Factor pills (step 6+, slide left on customize) ── */}
          {factorsVisible && !converged && !feeding && CATEGORY_LAYOUT.map((cat, catIdx) => {
            const vert = SQUARE_VERTS[cat.key];
            const custPos = CUSTOMIZE_PILL_LAYOUT[cat.key];
            const tx = customized ? custPos.x : cat.x;
            const ty = customized ? custPos.y : cat.y;
            const tw = customized ? 460 : cat.w;
            const th = customized ? 100 : cat.h;
            return (
              <motion.foreignObject
                key={`cat-group-${cat.key}`}
                initial={{ x: cat.x, y: cat.y, width: cat.w, height: cat.h }}
                animate={{ x: tx, y: ty, width: tw, height: th }}
                transition={{ duration: 0.8, delay: customized ? catIdx * 0.08 : 0, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: customized ? "flex-start" : "center", gap: customized ? 4 : 6 }}>
                  <motion.div
                    style={{
                      fontSize: customized ? 11 : 14,
                      fontWeight: 800,
                      color: cat.color,
                      letterSpacing: "0.12em",
                      fontFamily: "inherit",
                      textAlign: customized ? "left" : "center",
                      backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                      borderRadius: 4,
                      padding: "2px 12px",
                      flexShrink: 0,
                      transition: "font-size 0.5s ease",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: cat.labelDelay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {vert.label}
                  </motion.div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: customized ? 4 : 5, justifyContent: customized ? "flex-start" : "center" }}>
                {SQUARE_FACTORS.filter(f => f.category === cat.key).map((f, fi) => {
                  const isCrossed = customizePhase >= 1 && f.emphasis === "crossoff";
                  const isHighlighted = (customizePhase >= 2 && f.emphasis === "highlight") || (customizePhase >= 3 && f.emphasis === "order-highlight");
                  const isActivePill = customized && (
                    (customizePhase === 1 && f.emphasis === "crossoff") ||
                    (customizePhase === 2 && f.emphasis === "highlight") ||
                    (customizePhase === 3 && f.emphasis === "order-highlight")
                  );
                  const isGreyed = customized && !isActivePill;
                  const pillColor = isGreyed ? MUTED : isHighlighted ? TEAL : isCrossed ? MUTED : cat.color;
                  const pillBorder = isGreyed ? `${MUTED}30` : isHighlighted ? TEAL : isCrossed ? `${MUTED}40` : `${cat.color}30`;
                  const pillBg = isGreyed ? "#F3F4F6" : isHighlighted ? "#E5F5FA" : isCrossed ? "#F3F4F5" : (SOLID_TINTS[cat.color] ?? "white");
                  return (
                    <motion.span
                      key={`${cat.key}-${f.label}`}
                      style={{
                        display: "inline-block",
                        borderRadius: 14,
                        border: `1.5px solid ${pillBorder}`,
                        padding: "5px 14px",
                        fontSize: 13,
                        fontWeight: isActivePill ? 700 : 500,
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        color: pillColor,
                        backgroundColor: pillBg,
                        textDecoration: isCrossed ? "line-through" : "none",
                        transition: "color 0.5s ease, border-color 0.5s ease, background-color 0.5s ease",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isCrossed && !isActivePill ? 0.35 : 1,
                        scale: isActivePill && isHighlighted ? [1, 1.25, 1.12] : isActivePill && isCrossed ? [1, 1.2, 0.95] : 1,
                        boxShadow: isActivePill && isHighlighted
                          ? ["0 0 0px transparent", `0 0 16px ${TEAL}60`, `0 0 8px ${TEAL}30`]
                          : isActivePill && isCrossed
                            ? ["0 0 0px transparent", `0 0 14px ${cat.color}60`, "0 0 0px transparent"]
                            : "0 0 0px transparent",
                      }}
                      transition={{
                        duration: isActivePill ? 1.0 : 0.5,
                        times: isActivePill ? [0, 0.3, 1] : undefined,
                        delay: !customized ? cat.baseDelay + fi * 0.12 : 0,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {f.label}
                    </motion.span>
                  );
                })}
                {cat.key === "market" && customizePhase >= 0 && (() => {
                  const ciActive = customized && customizePhase === 0;
                  const ciGreyed = customized && customizePhase !== 0;
                  return (
                    <motion.span
                      style={{
                        display: "inline-block",
                        borderRadius: 14,
                        border: `1.5px solid ${ciGreyed ? `${MUTED}30` : ML_GREEN}`,
                        padding: "5px 14px",
                        fontSize: 13,
                        fontWeight: ciActive ? 700 : ciGreyed ? 500 : 700,
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        color: ciGreyed ? MUTED : ML_GREEN,
                        backgroundColor: ciGreyed ? "#F3F4F6" : "#ECF4ED",
                        transition: "color 0.5s ease, border-color 0.5s ease, background-color 0.5s ease",
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: ciActive ? [1, 1.25, 1.12] : 1,
                        boxShadow: ciActive
                          ? ["0 0 0px transparent", `0 0 16px ${ML_GREEN}60`, `0 0 8px ${ML_GREEN}30`]
                          : "0 0 0px transparent",
                      }}
                      transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
                    >
                      + Competitive intelligence
                    </motion.span>
                  );
                })()}
                  </div>
                </div>
              </motion.foreignObject>
            );
          })}

          {/* action panel rendered outside SVG below */}

          {/* ── Feed the model (step 7) ── */}
          {feeding && !converged && (() => {
            const MODEL_R = 60;
            const FEED_SOURCES = [
              { vert: SQUARE_VERTS.product, color: ORANGE, label: "Product" },
              { vert: SQUARE_VERTS.market, color: GREEN, label: "Market" },
              { vert: SQUARE_VERTS.customer, color: NAVY, label: "Customer" },
              { vert: SQUARE_VERTS.order, color: PURPLE, label: "Order" },
            ];
            return (
              <>
                {FEED_SOURCES.map((src, si) => {
                  const steps = 25;
                  const flowCx: number[] = [];
                  const flowCy: number[] = [];
                  const cpX = src.vert.x + (PLOT_CX - src.vert.x) * 0.5 + (si === 0 ? 0 : si === 1 ? 30 : -30);
                  const cpY = src.vert.y + (PLOT_CY - src.vert.y) * 0.5 + (si === 0 ? -20 : 20);
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    const u = 1 - t;
                    flowCx.push(u * u * src.vert.x + 2 * u * t * cpX + t * t * PLOT_CX);
                    flowCy.push(u * u * src.vert.y + 2 * u * t * cpY + t * t * PLOT_CY);
                  }
                  const pathD = `M ${src.vert.x} ${src.vert.y} Q ${cpX} ${cpY}, ${PLOT_CX} ${PLOT_CY}`;
                  return (
                    <g key={`feed-src-${si}`}>
                      <motion.text
                        x={src.vert.x}
                        y={src.vert.y + (si === 0 || si === 2 ? -14 : 28)}
                        textAnchor="middle"
                        style={{ fontSize: 13, fontWeight: 700, fill: src.color, fontFamily: "inherit", letterSpacing: "0.08em" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ duration: 0.4, delay: 0.2 + si * 0.15 }}
                      >
                        {src.label.toUpperCase()}
                      </motion.text>
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke={src.color}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.5 + si * 0.2, ease: "easeOut" }}
                      />
                      {[0, 1.2, 2.4, 3.6].map((extraDelay, di) => (
                        <motion.circle
                          key={`feed-dot-${si}-${di}`}
                          r={3}
                          fill={src.color}
                          initial={{ opacity: 0 }}
                          animate={{
                            cx: flowCx,
                            cy: flowCy,
                            opacity: [0, 0.7, 0.7, 0.5, 0],
                          }}
                          transition={{
                            duration: 2.0,
                            delay: 0.8 + si * 0.2 + extraDelay,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ))}
                    </g>
                  );
                })}
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R}
                  fill="white" stroke={TEAL} strokeWidth={2.5}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R + 3}
                  fill="none" stroke={TEAL} strokeWidth={1.5}
                  animate={{ opacity: [0, 0.2, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.text
                  x={PLOT_CX} y={PLOT_CY - 10}
                  textAnchor="middle"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", fill: MUTED, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  YOUR
                </motion.text>
                <motion.text
                  x={PLOT_CX} y={PLOT_CY + 12}
                  textAnchor="middle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7, type: "spring", stiffness: 200 }}
                  style={{ fontSize: 22, fontWeight: 800, fill: NAVY, fontFamily: "inherit", transformOrigin: `${PLOT_CX}px ${PLOT_CY + 6}px` }}
                >
                  MODEL
                </motion.text>
              </>
            );
          })()}

          {/* ── Price reveal (step 8 — converged) ── */}
          {converged && (() => {
            const CR = 75;
            const DR = 55;
            const PRICE_DRIVERS = [
              { label: "Cost Trends", adj: "$14.20", subtitle: "Cost base", color: NAVY, x: 310, y: 130 },
              { label: "Volume & Elasticity", adj: "+$1.80", subtitle: "Volume lift", color: GREEN, x: 700, y: 100 },
              { label: "Win / Loss Patterns", adj: "−$0.90", subtitle: "Win-rate adj.", color: PURPLE, x: 370, y: 340 },
              { label: "Competitive Position", adj: "+$2.40", subtitle: "Market premium", color: ORANGE, x: 700, y: 330 },
            ];

            return (
              <>
                {/* ── Driver nodes with flow lines ── */}
                {!showCustomers && PRICE_DRIVERS.map((drv, si) => {
                  const flowSteps = 30;
                  const flowCx: number[] = [];
                  const flowCy: number[] = [];
                  const cpX = drv.x + (PLOT_CX - drv.x) * 0.5;
                  const cpY = drv.y + (PLOT_CY - drv.y) * 0.5;
                  for (let s = 0; s <= flowSteps; s++) {
                    const t = s / flowSteps;
                    const u = 1 - t;
                    flowCx.push(u * u * drv.x + 2 * u * t * cpX + t * t * PLOT_CX);
                    flowCy.push(u * u * drv.y + 2 * u * t * cpY + t * t * PLOT_CY);
                  }
                  const pathD = `M ${drv.x} ${drv.y} Q ${cpX} ${cpY}, ${PLOT_CX} ${PLOT_CY}`;
                  const baseDelay = 0.8 + si * 0.3;
                  return (
                    <g key={`drv-${si}`}>
                      <motion.path
                        d={pathD} fill="none" stroke={drv.color} strokeWidth={1.5} strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 0.8, delay: baseDelay + 0.3, ease: "easeOut" }}
                      />
                      {[0, 1.4, 2.8].map((extra, di) => (
                        <motion.circle
                          key={`dflow-${si}-${di}`}
                          r={2.5} fill={drv.color}
                          initial={{ opacity: 0 }}
                          animate={{ cx: flowCx, cy: flowCy, opacity: [0, 0.6, 0.6, 0.5, 0] }}
                          transition={{ duration: 2.4, delay: baseDelay + 0.8 + extra, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                      <motion.circle
                        cx={drv.x} cy={drv.y} r={DR}
                        fill="white" stroke={drv.color} strokeWidth={1.5}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: baseDelay, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: `${drv.x}px ${drv.y}px` }}
                      />
                      <motion.text
                        x={drv.x} y={drv.y - DR - 10}
                        textAnchor="middle"
                        style={{ fontSize: 12, fontWeight: 700, fill: drv.color, fontFamily: "inherit" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        transition={{ duration: 0.4, delay: baseDelay + 0.15 }}
                      >
                        {drv.label}
                      </motion.text>
                      <motion.text
                        x={drv.x} y={drv.y + 2}
                        textAnchor="middle"
                        style={{ fontSize: 22, fontWeight: 800, fill: drv.color, fontFamily: "inherit" }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: baseDelay + 0.2, type: "spring", stiffness: 200 }}
                      >
                        {drv.adj}
                      </motion.text>
                      <motion.text
                        x={drv.x} y={drv.y + 20}
                        textAnchor="middle"
                        style={{ fontSize: 10, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ duration: 0.4, delay: baseDelay + 0.3 }}
                      >
                        {drv.subtitle}
                      </motion.text>
                    </g>
                  );
                })}

                {/* ── Center circle — recommended price ── */}
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={CR}
                  fill="white" stroke={TEAL} strokeWidth={2.5}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY} r={CR}
                  fill="none" stroke={TEAL} strokeWidth={2}
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                {!showCustomers && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={CR + 2}
                    fill="none" stroke={TEAL} strokeWidth={1.5}
                    animate={{ opacity: [0, 0.2, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                  />
                )}
                <motion.text
                  x={PLOT_CX} y={PLOT_CY - 24}
                  textAnchor="middle"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", fill: MUTED, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  RECOMMENDED
                </motion.text>
                <motion.text
                  x={PLOT_CX} y={PLOT_CY + 12}
                  textAnchor="middle"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8, type: "spring", stiffness: 200 }}
                  style={{ fontSize: 36, fontWeight: 800, fill: NAVY, fontFamily: "inherit", transformOrigin: `${PLOT_CX}px ${PLOT_CY + 4}px` }}
                >
                  $17.50
                </motion.text>
                <motion.text
                  x={PLOT_CX} y={PLOT_CY + 32}
                  textAnchor="middle"
                  style={{ fontSize: 9.5, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                >
                  {"per unit · SKU #A-7200"}
                </motion.text>

                {/* ── Step 10: Customer nodes ── */}
                {showCustomers && [
                  { name: "Acme Industrial", price: "$19.24", delta: "+$1.74", color: NAVY, x: 230, y: 105 },
                  { name: "MedSupply Co", price: "$14.89", delta: "−$2.61", color: TEAL, x: 778, y: 105 },
                  { name: "QuickParts LLC", price: "$22.10", delta: "+$4.60", color: "#1B4F72" as string, x: 504, y: 420 },
                ].map((cust, i) => {
                  const dx = cust.x - PLOT_CX;
                  const dy = cust.y - PLOT_CY;
                  const ctrlX = PLOT_CX + dx * 0.5 + (i === 2 ? 0 : (i === 0 ? -40 : 40));
                  const ctrlY = PLOT_CY + dy * 0.5 + (i === 2 ? 30 : -30);
                  const pathD = `M ${PLOT_CX} ${PLOT_CY} Q ${ctrlX} ${ctrlY} ${cust.x} ${cust.y}`;
                  const lineDelay = 0.3 + i * 0.25;
                  const dotDelay = lineDelay + 0.3;
                  const cardDelay = lineDelay + 0.6;
                  const steps = 40;
                  const flowCx: number[] = [];
                  const flowCy: number[] = [];
                  for (let s = 0; s <= steps; s++) {
                    const t = s / steps;
                    flowCx.push((1 - t) * (1 - t) * PLOT_CX + 2 * (1 - t) * t * ctrlX + t * t * cust.x);
                    flowCy.push((1 - t) * (1 - t) * PLOT_CY + 2 * (1 - t) * t * ctrlY + t * t * cust.y);
                  }
                  const CARD_W = 130;
                  const CARD_H = 64;
                  const cardX = cust.x - CARD_W / 2;
                  const cardY = cust.y - CARD_H / 2;
                  return (
                    <g key={cust.name}>
                      <motion.path
                        d={pathD} fill="none" stroke={cust.color} strokeWidth={1.5} strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.35 }}
                        transition={{ duration: 0.7, delay: lineDelay, ease: "easeOut" }}
                      />
                      {[0, 1.5, 3].map((extraDelay, di) => (
                        <motion.circle
                          key={`cflow-${i}-${di}`}
                          r={2.5} fill={cust.color}
                          initial={{ opacity: 0 }}
                          animate={{ cx: flowCx, cy: flowCy, opacity: [0, 0.7, 0.7, 0.7, 0] }}
                          transition={{ duration: 2.5, delay: dotDelay + extraDelay, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                      <motion.rect
                        x={cardX} y={cardY} rx={10} ry={10}
                        width={CARD_W} height={CARD_H}
                        fill="white" stroke={cust.color} strokeWidth={1.5}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: cardDelay, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: `${cust.x}px ${cust.y}px` }}
                      />
                      <motion.text
                        x={cust.x} y={cardY + 16} textAnchor="middle"
                        style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em", fill: cust.color, fontFamily: "inherit" }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: cardDelay + 0.15 }}
                      >{cust.name}</motion.text>
                      <motion.text
                        x={cust.x} y={cardY + 38} textAnchor="middle"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: cardDelay + 0.3, type: "spring", stiffness: 200 }}
                        style={{ fontSize: 22, fontWeight: 800, fill: NAVY, fontFamily: "inherit", transformOrigin: `${cust.x}px ${cardY + 34}px` }}
                      >{cust.price}</motion.text>
                      <motion.text
                        x={cust.x} y={cardY + 54} textAnchor="middle"
                        style={{ fontSize: 9, fontWeight: 600, fill: MUTED, fontFamily: "inherit" }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: cardDelay + 0.45 }}
                      >{cust.delta} vs list</motion.text>
                    </g>
                  );
                })}
              </>
            );
          })()}


        </svg>
        </div>

        {/* ── Customize action panel (right side, step 7) ── */}
        {customized && !converged && !feeding && (
          <motion.div
            className="flex flex-col justify-center px-8"
            style={{ width: 420, flexShrink: 0 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={customizePhase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
              >
                {customizePhase < 0 && (
                  <p className="text-xl font-semibold leading-relaxed" style={{ color: MUTED }}>
                    Now let&apos;s tailor these factors for your specific business…
                  </p>
                )}
                {customizePhase >= 0 && customizePhase < CUSTOMIZE_ACTIONS.length && (
                  <>
                    <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                      {CUSTOMIZE_ACTIONS[customizePhase].headline}
                    </p>
                    <p className="text-2xl font-semibold leading-snug" style={{ color: NAVY }}>
                      {CUSTOMIZE_ACTIONS[customizePhase].detail}
                    </p>
                  </>
                )}
                {customizePhase >= CUSTOMIZE_ACTIONS.length && (
                  <p className="text-xl font-semibold leading-relaxed" style={{ color: NAVY }}>
                    Together, these factors uniquely configure your model.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

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
              const isActive = factorsVisible ? false : i === chartStep - 1;
              const isRevealed = factorsVisible || i < chartStep;
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
                    opacity: isActive ? 1 : factorsVisible ? 0.9 : 0.55,
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
                          animate={{ opacity: isActive ? 1 : factorsVisible ? 0.8 : 0.6, x: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: isActive ? 0.5 + pi * (PILL_STAGGER_SPAN / s.pills.length) : 0,
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
