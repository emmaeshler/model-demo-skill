"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const ORANGE = "#E56910";
const GREEN = "#2e7d32";
const PURPLE = "#7B5EA7";
const MUTED = "#5A6A78";

export const POWER_TOTAL_STEPS = 6;

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
  { cx: 180, cy: 60 },
  { cx: 830, cy: 60 },
  { cx: 180, cy: 400 },
  { cx: 830, cy: 400 },
];
const CLUSTER_R = 95;

/* ─── Square factor layout ─── */

const SQUARE_VERTS = {
  customer: { x: 180, y: 60, label: "CUSTOMER", color: NAVY },
  product: { x: 830, y: 60, label: "PRODUCT", color: ORANGE },
  market: { x: 180, y: 400, label: "MARKET", color: GREEN },
  order: { x: 830, y: 400, label: "ORDER", color: PURPLE },
};

const SQUARE_FACTORS: { label: string; category: "product" | "market" | "customer" | "order"; emphasis?: "highlight" | "crossoff" | "deemphasize" }[] = [
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
  { label: "Contract type", category: "order" },
  { label: "Seasonality", category: "order", emphasis: "deemphasize" },
];

const CATEGORY_LAYOUT = [
  { key: "customer" as const, x: 10, y: 0, w: 490, h: 210, color: NAVY, labelDelay: 0.2, baseDelay: 0.4 },
  { key: "product" as const, x: 520, y: 0, w: 490, h: 210, color: ORANGE, labelDelay: 0.25, baseDelay: 0.7 },
  { key: "market" as const, x: 10, y: 250, w: 490, h: 210, color: GREEN, labelDelay: 0.3, baseDelay: 1.0 },
  { key: "order" as const, x: 520, y: 250, w: 490, h: 210, color: PURPLE, labelDelay: 0.35, baseDelay: 1.3 },
];

const CATEGORY_TO_SPOTLIGHT: Record<string, number> = {
  customer: 2,
  product: 3,
  market: 1,
  order: 0,
};


const CATEGORY_TITLES = [
  "Customer factors",
  "Product factors",
  "Market factors",
  "Order factors",
];

const CATEGORY_NARRATION = [
  "Who is the customer — channel, region, size, tenure, and sales relationship.",
  "What's being sold — mix, family, specialization, cost, and price sensitivity.",
  "Where you compete — price points, share, commodities, and competitive dynamics.",
  "How orders behave — frequency, size, lead time, terms, and seasonality.",
];

const CUSTOMIZE_ACTIONS = [
  { headline: "Add a factor", detail: "Competitive intelligence is critical in this market — add it to the model." },
  { headline: "Remove a factor", detail: "End market isn’t a meaningful driver for this client — take it out." },
  { headline: "Weight it higher", detail: "Sales rep relationships drive pricing power here." },
  { headline: "Lower its weight", detail: "Seasonality has minimal impact for this customer — dial it down." },
];

const ACTION_META = [
  { icon: "+", color: ML_GREEN },
  { icon: "×", color: MUTED },
  { icon: "↑", color: TEAL },
  { icon: "↓", color: PURPLE },
];

const CUSTOMIZE_PILL_LAYOUT: Record<string, { x: number; y: number }> = {
  customer: { x: 10, y: 15 },
  product: { x: 10, y: 125 },
  market: { x: 10, y: 235 },
  order: { x: 10, y: 345 },
};

const FEED_NUDGE_Y = [130, 35, -75, -170];

const dissolveSeed = mulberry32(456);
const DISSOLVE_COLORS = [NAVY, ORANGE, GREEN, PURPLE];
const DISSOLVE_ROW_Y = [60, 170, 280, 390];
const DISSOLVE_DOTS = Array.from({ length: 48 }, (_, i) => {
  const catIdx = i % 4;
  const x = 120 + dissolveSeed() * 760;
  const y = DISSOLVE_ROW_Y[catIdx] + (dissolveSeed() - 0.5) * 70;
  return {
    x, y,
    color: DISSOLVE_COLORS[catIdx],
    delay: dissolveSeed() * 0.3 + catIdx * 0.04,
    r: 2 + dissolveSeed() * 2.5,
  };
});

const PRICE_SATELLITES = [
  { label: "Customer", price: "+$0.60", value: 0.60, color: NAVY, cx: 185, cy: 240, r: 65 },
  { label: "Product", price: "+$0.85", value: 0.85, color: ORANGE, cx: 810, cy: 90, r: 65 },
  { label: "Market", price: "−$0.30", value: -0.30, color: GREEN, cx: 250, cy: 410, r: 60 },
  { label: "Order", price: "+$0.45", value: 0.45, color: PURPLE, cx: 855, cy: 370, r: 68 },
];
const BASE_PRICE = 15.90;
const CONVERGE_MODEL_R = 170;

/* ─── Spotlight data (steps 1-4) ─── */

const SPOTLIGHTS = [
  {
    cluster: 0,
    icon: "grid",
    label: "ORDER",
    count: "14,200 records",
    pills: ["Acme Corp · $58.20", "Beta Mfg · $42.10", "Coastal · $64.50", "Delta · $31.75"],
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET",
    count: "36 features",
    pills: ["Resin ↑ 4.2%", "Comp avg $59.10", "Q3 peak", "+2.8% growth"],
  },
  {
    cluster: 2,
    icon: "people",
    label: "CUSTOMER",
    count: "2,400 accounts",
    pills: ["Strategic / Core / Opp", "Volume & contracts", "Tenure 3.2 yrs"],
  },
  {
    cluster: 3,
    icon: "chart",
    label: "PRODUCT",
    count: "18 months",
    pills: ["Win rate 87%", "Elasticity −0.34", "Discount 6.2%", "Lost gap $4.20"],
  },
];

const TITLES = [
  "2,400 accounts × 15,000 SKUs",
  "The model scans for patterns",
  "Pricing factors identified",
  "Your customized factors now feed the model",
  "Customized for your business",
  "All four factors converge into a single price",
];

const SUBTITLES = [
  "That's 36 million unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "Examining 36 million price points across four dimensions.",
  "The model identifies the variables that drive every price — grouped by customer, product, market, and order.",
  "Every business is different. We weigh each factor based on your data — adding what matters, removing what doesn't, and tuning the balance.",
  "Together, these factors uniquely configure your model.",
  "Cost, competition, volume, and demand combine into one recommended price for every SKU.",
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

const SWEEP_DURATION = 14;
const PILL_STAGGER_SPAN = 1.5;

const CARD_FLY_TARGETS = [
  { x: 400, y: -200 },
  { x: -120, y: -200 },
  { x: -350, y: -350 },
  { x: 0, y: -350 },
];

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

  const [preScan, setPreScan] = useState(false);
  useEffect(() => {
    if (step !== 1 || skipAnimation) { setPreScan(false); return; }
    setPreScan(true);
    const t = setTimeout(() => setPreScan(false), 2200);
    return () => clearTimeout(t);
  }, [step, skipAnimation]);

  const [introPhase, setIntroPhase] = useState(skipAnimation ? 5 : chartStep === 0 ? 0 : 4);
  const [customizePhase, setCustomizePhase] = useState(chartStep > 3 || (skipAnimation && chartStep >= 3) ? CUSTOMIZE_ACTIONS.length : -1);
  const [deemphasizeRevealed, setDeemphasizeRevealed] = useState(chartStep > 3 || (skipAnimation && chartStep >= 3));
  const [factorsPhase, setFactorsPhase] = useState(chartStep > 2 || (skipAnimation && chartStep >= 2) ? 7 : 0);
  const [morphPhase, setMorphPhase] = useState(chartStep > 2 || (skipAnimation && chartStep >= 2) ? 4 : -1);
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


  useEffect(() => {
    if (chartStep < 2) { setFactorsPhase(0); return; }
    if (chartStep > 2 || skipAnimation) { setFactorsPhase(7); return; }
    setFactorsPhase(0);
    const t1 = setTimeout(() => setFactorsPhase(1), 1000);
    return () => { clearTimeout(t1); };
  }, [chartStep, skipAnimation]);

  useEffect(() => {
    if (chartStep > 2 || skipAnimation) { setMorphPhase(4); return; }
    if (factorsPhase < 1) { setMorphPhase(-1); return; }
    if (factorsPhase > 1 && factorsPhase < 7) return;
    setMorphPhase(-1);
    const t0 = setTimeout(() => setMorphPhase(0), 2000);
    const t1 = setTimeout(() => setMorphPhase(1), 5000);
    const t2 = setTimeout(() => setMorphPhase(2), 8000);
    const t3 = setTimeout(() => setMorphPhase(3), 11000);
    const t4 = setTimeout(() => setFactorsPhase(7), 13000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [factorsPhase, chartStep, skipAnimation]);

  useEffect(() => {
    if (chartStep < 3) { setCustomizePhase(-1); return; }
    if (chartStep > 3 || skipAnimation) { setCustomizePhase(CUSTOMIZE_ACTIONS.length); return; }
    setCustomizePhase(-1);
    const t0 = setTimeout(() => setCustomizePhase(0), 2000);
    const t1 = setTimeout(() => setCustomizePhase(1), 5800);
    const t2 = setTimeout(() => setCustomizePhase(2), 8800);
    const t3 = setTimeout(() => setCustomizePhase(3), 11800);
    const t4 = setTimeout(() => setCustomizePhase(4), 14800);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [chartStep, skipAnimation]);

  useEffect(() => {
    if (customizePhase > 3 || skipAnimation) {
      setDeemphasizeRevealed(true);
      return;
    }
    if (customizePhase === 3) {
      const t = setTimeout(() => setDeemphasizeRevealed(true), 800);
      return () => clearTimeout(t);
    }
    setDeemphasizeRevealed(false);
  }, [customizePhase, skipAnimation]);

  const [reorganizing, setReorganizing] = useState(false);
  useEffect(() => {
    if (chartStep !== 3 || customizePhase < CUSTOMIZE_ACTIONS.length) {
      setReorganizing(false);
      return;
    }
    if (skipAnimation) { setReorganizing(true); return; }
    const t = setTimeout(() => setReorganizing(true), 600);
    return () => clearTimeout(t);
  }, [chartStep, customizePhase, skipAnimation]);

  useEffect(() => {
    if (chartStep !== 3 || skipAnimation || !onAutoAdvance) return;
    if (customizePhase >= CUSTOMIZE_ACTIONS.length) {
      const t = setTimeout(() => onAutoAdvance(), 3200);
      return () => clearTimeout(t);
    }
  }, [chartStep, customizePhase, skipAnimation, onAutoAdvance]);

  const [feedIntro, setFeedIntro] = useState(false);
  useEffect(() => {
    if (chartStep !== 5 || skipAnimation) { setFeedIntro(false); return; }
    setFeedIntro(true);
    const t = setTimeout(() => setFeedIntro(false), 2000);
    return () => clearTimeout(t);
  }, [chartStep, skipAnimation]);

  const [convergeReady, setConvergeReady] = useState(skipAnimation && chartStep >= 5);
  useEffect(() => {
    if (chartStep < 5) { setConvergeReady(false); return; }
    if (skipAnimation) { setConvergeReady(true); return; }
    const t = setTimeout(() => setConvergeReady(true), 300);
    return () => clearTimeout(t);
  }, [chartStep, skipAnimation]);

  const [absorbedCount, setAbsorbedCount] = useState(skipAnimation && chartStep >= 5 ? 4 : 0);
  useEffect(() => {
    if (chartStep < 5) { setAbsorbedCount(0); return; }
    if (skipAnimation) { setAbsorbedCount(4); return; }
    setAbsorbedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 4; i++) {
      timers.push(setTimeout(() => setAbsorbedCount(i + 1), 1800 + i * 1500));
    }
    return () => timers.forEach(clearTimeout);
  }, [chartStep, skipAnimation]);

  const allAbsorbed = absorbedCount >= 4;

  const convergingPrice = useMemo(() => {
    let total = BASE_PRICE;
    for (let i = 0; i < absorbedCount; i++) {
      total += PRICE_SATELLITES[i].value;
    }
    return `$${total.toFixed(2)}`;
  }, [absorbedCount]);

  const [scanCardCount, setScanCardCount] = useState(chartStep > 1 || skipAnimation ? 4 : 0);
  useEffect(() => {
    if (chartStep !== 1) { setScanCardCount(chartStep > 1 ? 4 : 0); return; }
    if (skipAnimation) { setScanCardCount(4); return; }
    setScanCardCount(0);
    const baseDelay = 3500;
    const s1 = setTimeout(() => setScanCardCount(1), baseDelay);
    const s2 = setTimeout(() => setScanCardCount(2), baseDelay + 1500);
    const s3 = setTimeout(() => setScanCardCount(3), baseDelay + 3000);
    const s4 = setTimeout(() => setScanCardCount(4), baseDelay + 4500);
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); clearTimeout(s4); };
  }, [chartStep, skipAnimation, onAutoAdvance]);

  /* ── Chart flow ─────────────────────────────────────── */
  const clustered = chartStep >= 2;
  const factorsVisible = chartStep >= 2;
  const customized = chartStep >= 3;
  const feeding = chartStep >= 4;
  const converging = chartStep >= 5;
  const sweepActive = chartStep === 1 && !preScan;

  function dotFill(dot: (typeof DOTS)[0]) {
    if (factorsVisible) return TEAL;
    if (chartStep >= 1 && dot.cluster < scanCardCount) return DRIVERS[dot.cluster].color;
    return MUTED;
  }

  function dotOpacity(dot: (typeof DOTS)[0]) {
    if (customized) return 0;
    if (factorsVisible) return factorsPhase >= 2 ? 0 : 0.12;
    if (chartStep === 1) {
      if (dot.cluster === scanCardCount - 1) return 0.7;
      if (dot.cluster < scanCardCount - 1) return 0.45;
      return dot.scatterOpacity;
    }
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
              key={preScan ? "pre-scan-title" : `step-title-${chartStep}`}
              className="absolute inset-0 flex flex-col items-center justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: preScan ? 0.2 : chartStep === 1 ? 0.2 : 0 }}
            >
              {chartStep === 3 ? (
                <>
                  <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                    {TITLES[chartStep]}
                  </h2>
                  <div className="mx-auto mt-2 max-w-3xl text-center" style={{ minHeight: 28 }}>
                    <AnimatePresence mode="wait">
                      {customizePhase >= 0 && customizePhase < CUSTOMIZE_ACTIONS.length ? (
                        <motion.div
                          key={`action-narr-${customizePhase}`}
                          className="flex items-center justify-center gap-2.5"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span
                            className="inline-flex items-center justify-center rounded-full"
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: `${ACTION_META[customizePhase].color}15`,
                              color: ACTION_META[customizePhase].color,
                              fontSize: 14,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {ACTION_META[customizePhase].icon}
                          </span>
                          <span className="text-[1.05rem] font-bold" style={{ color: ACTION_META[customizePhase].color }}>
                            {CUSTOMIZE_ACTIONS[customizePhase].headline}
                          </span>
                          <span className="text-[0.95rem] leading-relaxed" style={{ color: MUTED }}>
                            {CUSTOMIZE_ACTIONS[customizePhase].detail}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.p
                          key="final-sub"
                          className="text-[1.05rem] leading-relaxed"
                          style={{ color: MUTED }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {SUBTITLES[4]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : chartStep >= 5 ? (
                <>
                  <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                    {TITLES[chartStep]}
                  </h2>
                  <motion.p
                    className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                    style={{ color: MUTED }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    Cost, competition, volume, and demand combine into{" "}
                    <span style={{ color: TEAL, fontWeight: 600 }}>one recommended price</span>{" "}
                    for every SKU.
                  </motion.p>
                </>
              ) : (
                <>
                  {chartStep === 2 ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={factorsPhase >= 7 ? 'factors-final' : morphPhase >= 0 && morphPhase < 4 ? `factors-cat-${morphPhase}` : 'factors-transition'}
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2
                          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                          style={{ color: factorsPhase >= 7 ? NAVY : morphPhase >= 0 && morphPhase < 4 ? CATEGORY_LAYOUT[morphPhase].color : TEAL }}
                        >
                          {factorsPhase >= 7
                            ? "Pricing factors identified"
                            : morphPhase >= 0 && morphPhase < 4
                              ? CATEGORY_TITLES[morphPhase]
                              : "Each pattern becomes a pricing factor"}
                        </h2>
                        <p
                          className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                          style={{ color: MUTED }}
                        >
                          {factorsPhase >= 7
                            ? "The model identifies the variables that drive every price — grouped by customer, product, market, and order."
                            : morphPhase >= 0 && morphPhase < 4
                              ? CATEGORY_NARRATION[morphPhase]
                              : "The model transforms raw signals into the drivers behind every price."}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <>
                      <motion.h2
                        className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                        style={{ color: preScan ? TEAL : NAVY }}
                      >
                        {preScan ? (
                          <span className="relative inline-block">
                            The model scans for patterns
                            <motion.span
                              className="absolute bottom-0 left-0 h-[3px] rounded-full"
                              style={{ backgroundColor: TEAL }}
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            />
                          </span>
                        ) : TITLES[chartStep]}
                      </motion.h2>
                      <motion.p
                        className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed"
                        style={{ color: MUTED }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: preScan ? 0.4 : chartStep === 1 ? 0.4 : 0.15 }}
                      >
                        {preScan ? "Examining 36 million price points across four dimensions." : SUBTITLES[chartStep]}
                      </motion.p>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <motion.div
        className="relative w-full flex-1 min-h-0 mt-0 flex items-stretch gap-0"
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
          viewBox="0 -40 1020 570"
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
                style={{ fontSize: 18, fontWeight: 700, fill: DRIVERS[i].color, fontFamily: "inherit" }}
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
            animate={{ opacity: factorsPhase >= 1 && factorsPhase < 2 && !customized && !feeding ? 0.25 : 0 }}
            transition={{ delay: factorsPhase >= 1 && !customized ? 0.2 : 0, duration: 0.4 }}
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
                  <stop offset="0%" stopColor={TEAL} stopOpacity={0} />
                  <stop offset="40%" stopColor={TEAL} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
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
                stroke={TEAL}
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

            if (feeding) {
              const cl = CLUSTER_TARGETS[i];
              const feedDist = 12 + (i % 9) * 2.5;
              const feedAngle = convAngle;
              targetCx = PLOT_CX + Math.cos(feedAngle) * feedDist;
              targetCy = PLOT_CY + Math.sin(feedAngle) * feedDist;
              targetFill = CLUSTER_COLORS[cl.ci];
              targetOpacity = convergeReady ? 0 : 0.2;
              targetR = convergeReady ? 0 : dot.r * 0.5;
              cxTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
              cyTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
              opacityDelay = dot.delay * 0.4 + 0.3;
            } else if (factorsVisible && factorsPhase >= 1) {
              const sq = SQUARE_TARGETS[i];
              targetCx = sq.x;
              targetCy = sq.y;
              targetFill = TEAL;
              targetOpacity = customized ? 0 : morphPhase >= 0 ? 0.1 : 0.35;
              targetR = customized ? 0 : morphPhase >= 0 ? dot.r * 0.4 : dot.r * 0.7;
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
              opacityDelay = chartStep === 1 ? dot.delay * 0.3 : dotEntranceDelay + 0.2;
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
                  fill: { duration: 0.8, delay: chartStep === 1 ? dot.delay * 0.3 : 0.1 },
                }}
              />
            );
          })}

          {/* ── Highlight rings — dots "found" by the sweep ── */}
          {sweepActive && Array.from({ length: Math.max(0, scanCardCount) }, (_, ci) => ci).flatMap(ci =>
            highlightDotsForCluster(ci).map(hi => ({ ...hi, ci }))
          ).map((hi) => {
            const dot = DOTS[hi.index];
            const currentDriver = DRIVERS[hi.ci];
            const sweepDelay = hi.normalizedX * (SWEEP_DURATION / 2);
            return (
              <motion.circle
                key={`hl-${hi.ci}-${hi.index}`}
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

          {/* ── Factor pills (step 6 quadrants → step 7+ grid) ── */}
          {factorsVisible && !convergeReady && (
            <motion.foreignObject
              x={10} y={-25} width={1000} height={560}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <LayoutGroup>
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                position: "relative",
              }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {!customized ? (
                    <motion.div
                      key="quadrant-layout"
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gridTemplateRows: "1fr 1fr",
                        columnGap: 20,
                        rowGap: 20,
                        width: "100%",
                        height: 440,
                      }}
                    >
                      {CATEGORY_LAYOUT.map((cat, catIdx) => {
                        const vert = SQUARE_VERTS[cat.key];
                        const chipsVisible = factorsPhase >= 7 || morphPhase >= catIdx;
                        const isHighlighted = morphPhase >= 0 && morphPhase < 4 && morphPhase === catIdx;
                        const dimmed = morphPhase >= 0 && morphPhase < 4 && morphPhase !== catIdx && morphPhase > catIdx;
                        return (
                          <div key={cat.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <motion.div
                              layoutId={`cat-label-${cat.key}`}
                              layout
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: cat.color,
                                letterSpacing: "0.12em",
                                fontFamily: "inherit",
                                textAlign: "center",
                                backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                                borderRadius: 4,
                                padding: "2px 14px",
                                flexShrink: 0,
                              }}
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: factorsPhase >= 1 ? (dimmed ? 0.4 : 1) : 0,
                                scale: isHighlighted ? 1.08 : 1,
                              }}
                              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                            >
                              {vert.label}
                            </motion.div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", ...(cat.key === "market" || cat.key === "order" ? { maxWidth: 330 } : {}) }}>
                              {chipsVisible && SQUARE_FACTORS.filter(f => f.category === cat.key).map((f, fi) => (
                                  <motion.span
                                    key={f.label}
                                    layoutId={`factor-${f.label}`}
                                    layout
                                    style={{
                                      display: "inline-block",
                                      borderRadius: 16,
                                      border: `1.5px solid ${cat.color}25`,
                                      padding: "8px 14px",
                                      fontSize: 14,
                                      fontWeight: 500,
                                      fontFamily: "inherit",
                                      whiteSpace: "nowrap",
                                      color: cat.color,
                                      backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                                    }}
                                    initial={{ opacity: 0, scale: 0, y: 12 }}
                                    animate={{
                                      opacity: dimmed ? 0.4 : 1,
                                      scale: 1,
                                      y: 0,
                                    }}
                                    transition={{
                                      opacity: { duration: 0.4, delay: fi * 0.08 },
                                      scale: { type: "spring", stiffness: 380, damping: 22, delay: fi * 0.08 },
                                      y: { type: "spring", stiffness: 380, damping: 22, delay: fi * 0.08 },
                                      layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                                    }}
                                  >
                                    {f.label}
                                  </motion.span>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grid-layout"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: 960,
                        transformOrigin: "center center",
                      }}
                      animate={{ scale: 1, opacity: 1, gap: reorganizing ? 8 : 18 }}
                      transition={{ gap: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                    >
                      {CATEGORY_LAYOUT.map((cat, catIdx) => {
                        const vert = SQUARE_VERTS[cat.key];
                        const catFactors = SQUARE_FACTORS.filter(f => f.category === cat.key);
                        const isMarket = cat.key === "market";
                        const isActiveRow =
                          (customizePhase === 0 && isMarket) ||
                          (customizePhase === 1 && cat.key === "customer") ||
                          (customizePhase === 2 && cat.key === "customer") ||
                          (customizePhase === 3 && cat.key === "order");
                        return (
                          <motion.div
                            key={cat.key}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              borderRadius: 12,
                              padding: "8px 12px",
                            }}
                            initial={false}
                            animate={feeding ? {
                              backgroundColor: "transparent",
                            } : {
                              opacity: 1,
                              backgroundColor: isActiveRow ? `${cat.color}08` : "transparent",
                            }}
                            transition={feeding ? {
                              backgroundColor: { duration: 0.3 },
                            } : {
                              opacity: { duration: 0.5 },
                              backgroundColor: { duration: 0.5 },
                            }}
                          >
                            <motion.div
                              layoutId={`cat-label-${cat.key}`}
                              layout
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: cat.color,
                                letterSpacing: "0.1em",
                                fontFamily: "inherit",
                                minWidth: 96,
                                textAlign: "center",
                                padding: "12px 10px",
                                borderRadius: 6,
                                backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                              animate={feeding ? {
                                scale: 0,
                                opacity: 0,
                                x: 200,
                                y: FEED_NUDGE_Y[catIdx],
                              } : reorganizing ? {
                                scale: 0.85,
                                opacity: 0.5,
                                x: 0,
                                y: 0,
                                boxShadow: "0 0 0px transparent",
                              } : {
                                scale: isActiveRow ? [1, 1.06, 1] : 1,
                                opacity: 1,
                                x: 0,
                                y: 0,
                                boxShadow: isActiveRow
                                  ? [`0 0 0px transparent`, `0 0 14px ${cat.color}30`, `0 0 5px ${cat.color}15`]
                                  : "0 0 0px transparent",
                              }}
                              transition={feeding ? {
                                duration: 0.6,
                                delay: catIdx * 0.04,
                                ease: [0.4, 0, 0.1, 1],
                                opacity: { duration: 0.3, delay: catIdx * 0.04 + 0.15 },
                              } : reorganizing ? {
                                duration: 0.5,
                                delay: catIdx * 0.05,
                                ease: [0.22, 1, 0.36, 1],
                                layout: { duration: 0.5 },
                              } : { duration: 0.6, delay: 0.3, layout: { duration: 0.6, delay: 0, ease: [0.22, 1, 0.36, 1] } }}
                            >
                              {vert.label}
                            </motion.div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>
                              <AnimatePresence mode="popLayout">
                                {catFactors
                                  .filter(f => !(f.emphasis === "crossoff" && customizePhase >= 2))
                                  .map((f, fi, arr) => {
                                    const convergeX = ((arr.length - 1) / 2 - fi) * 40;
                                    const convergeY = FEED_NUDGE_Y[catIdx];
                                    const isRemoving = f.emphasis === "crossoff" && customizePhase === 1;
                                    const isActivelyElevating =
                                      customizePhase === 2 && f.emphasis === "highlight";
                                    const isElevated =
                                      customizePhase >= 2 && customizePhase !== 3 && f.emphasis === "highlight";
                                    const isActivelyDeemphasizing =
                                      customizePhase === 3 && f.emphasis === "deemphasize" && deemphasizeRevealed;
                                    const isDeemphasized =
                                      customizePhase >= 3 && f.emphasis === "deemphasize" && deemphasizeRevealed;
                                    const customizationActive = customizePhase >= 0 && customizePhase < CUSTOMIZE_ACTIONS.length;
                                    const shouldFade = customizationActive && !isElevated && !isDeemphasized && !isRemoving && !isActivelyElevating && !isActivelyDeemphasizing && !(customizePhase === 3 && !deemphasizeRevealed);
                                    return (
                                      <motion.span
                                        key={f.label}
                                        layoutId={`factor-${f.label}`}
                                        layout
                                        initial={false}
                                        exit={{ scale: 0, opacity: 0, x: -20, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          gap: 4,
                                          borderRadius: 8,
                                          border: isActivelyDeemphasizing
                                            ? `2px solid ${PURPLE}`
                                            : isDeemphasized
                                              ? `1.5px dashed ${cat.color}30`
                                              : `2px solid ${isRemoving ? `${MUTED}60` : isElevated ? TEAL : `${cat.color}25`}`,
                                          padding: isElevated ? "12px 20px" : (isDeemphasized && !isActivelyDeemphasizing) ? "8px 14px" : "10px 18px",
                                          fontSize: isElevated ? 17 : (isDeemphasized && !isActivelyDeemphasizing) ? 14 : 16,
                                          fontWeight: isElevated ? 700 : (isDeemphasized && !isActivelyDeemphasizing) ? 500 : 600,
                                          fontFamily: "inherit",
                                          whiteSpace: "nowrap",
                                          color: isRemoving ? MUTED : isActivelyDeemphasizing ? PURPLE : isElevated ? TEAL : isDeemphasized ? `${cat.color}90` : cat.color,
                                          backgroundColor: isRemoving ? "#F3F4F6" : isActivelyDeemphasizing ? `${PURPLE}12` : isElevated ? "#E5F5FA" : isDeemphasized ? `${cat.color}06` : (SOLID_TINTS[cat.color] ?? "white"),
                                          textDecoration: isRemoving ? "line-through" : "none",
                                          transition: "color 0.5s, background-color 0.5s, border 0.5s, padding 0.5s, font-size 0.5s",
                                        }}
                                        animate={feeding ? {
                                          x: convergeX,
                                          y: convergeY,
                                          scale: 0,
                                          opacity: 0,
                                        } : reorganizing ? {
                                          x: 0,
                                          y: 0,
                                          scale: [1, 1.06, 1],
                                          opacity: 1,
                                          boxShadow: [`0 0 0px transparent`, `0 0 14px ${TEAL}40`, `0 0 6px ${TEAL}20`],
                                        } : {
                                          x: isRemoving ? [0, -4, 5, -3, 3, -1, 0] : 0,
                                          y: 0,
                                          scale: isActivelyElevating ? [1, 1.18, 1.05]
                                            : isActivelyDeemphasizing ? [1, 1.12, 0.93]
                                            : isRemoving ? [1, 1.02, 0.95] : 1,
                                          opacity: shouldFade ? 0.35 : isDeemphasized && !isActivelyDeemphasizing ? 0.6 : 1,
                                          boxShadow: isActivelyElevating
                                            ? ["0 0 0px transparent", `0 0 24px ${TEAL}60`, `0 0 10px ${TEAL}30`]
                                            : isActivelyDeemphasizing
                                              ? ["0 0 0px transparent", `0 0 28px ${PURPLE}60`, `0 0 6px ${PURPLE}20`]
                                              : isRemoving
                                                ? ["0 0 0px transparent", `0 0 16px ${MUTED}40`, "0 0 0px transparent"]
                                                : isElevated
                                                  ? `0 0 8px ${TEAL}25`
                                                  : "0 0 0px transparent",
                                        }}
                                        transition={feeding ? {
                                          duration: 0.7,
                                          delay: catIdx * 0.04 + fi * 0.02,
                                          ease: [0.4, 0, 0.1, 1],
                                          opacity: { duration: 0.35, delay: catIdx * 0.04 + fi * 0.02 + 0.15 },
                                        } : reorganizing ? {
                                          duration: 0.8,
                                          delay: catIdx * 0.06 + fi * 0.03,
                                          ease: [0.22, 1, 0.36, 1],
                                          scale: { duration: 0.6, delay: catIdx * 0.06 + fi * 0.03, times: [0, 0.5, 1] },
                                        } : {
                                          x: isRemoving ? { duration: 0.5, delay: 0.5 } : { duration: 0 },
                                          opacity: { duration: 0.5, delay: isActivelyDeemphasizing ? 0.4 : 0.1 },
                                          scale: {
                                            duration: isActivelyElevating ? 0.8 : (isActivelyDeemphasizing || isRemoving) ? 0.6 : 0.3,
                                            delay: isActivelyDeemphasizing ? 0 : (isActivelyElevating || isRemoving) ? 0.8 : 0,
                                            times: (isActivelyElevating || isActivelyDeemphasizing || isRemoving) ? [0, 0.4, 1] : undefined,
                                            ease: [0.22, 1, 0.36, 1],
                                          },
                                          boxShadow: {
                                            duration: (isActivelyElevating || isActivelyDeemphasizing) ? 0.8 : isRemoving ? 0.6 : 0.3,
                                            delay: isActivelyDeemphasizing ? 0 : (isActivelyElevating || isRemoving) ? 0.8 : 0,
                                          },
                                          layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                                        }}
                                      >
                                        {f.label}
                                        {isElevated && (
                                          <motion.sup
                                            style={{ fontSize: 15, fontWeight: 800, color: TEAL, marginLeft: 3, lineHeight: 1 }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: isActivelyElevating ? 1.2 : 0, duration: 0.3, type: "spring", stiffness: 300 }}
                                          >
                                            +2
                                          </motion.sup>
                                        )}
                                        {isDeemphasized && (
                                          <motion.sup
                                            style={{ fontSize: 10, fontWeight: 700, color: PURPLE, marginLeft: 2, lineHeight: 1 }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: isActivelyDeemphasizing ? 0.4 : 0, duration: 0.3, type: "spring", stiffness: 300 }}
                                          >
                                            ↓
                                          </motion.sup>
                                        )}
                                      </motion.span>
                                    );
                                  })}
                                {isMarket && customizePhase >= 0 && (
                                  <motion.span
                                    key="comp-intel"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: 8,
                                      border: `2px solid ${customizePhase > 0 && customizePhase < CUSTOMIZE_ACTIONS.length ? `${ML_GREEN}25` : ML_GREEN}`,
                                      padding: "10px 18px",
                                      fontSize: 16,
                                      fontWeight: 700,
                                      fontFamily: "inherit",
                                      whiteSpace: "nowrap",
                                      color: ML_GREEN,
                                      backgroundColor: "#ECF4ED",
                                      transition: "border 0.5s",
                                    }}
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={feeding ? {
                                      opacity: 0,
                                      scale: 0,
                                      y: FEED_NUDGE_Y[2],
                                    } : reorganizing ? {
                                      opacity: 1,
                                      scale: [1, 1.06, 1],
                                      y: 0,
                                      boxShadow: [`0 0 0px transparent`, `0 0 14px ${TEAL}40`, `0 0 6px ${TEAL}20`],
                                    } : {
                                      opacity: customizePhase > 0 && customizePhase < CUSTOMIZE_ACTIONS.length ? 0.35 : 1,
                                      scale: 1,
                                      y: 0,
                                      boxShadow: customizePhase === 0
                                        ? `0 0 16px ${ML_GREEN}40`
                                        : "0 0 0px transparent",
                                    }}
                                    transition={feeding ? {
                                      duration: 0.7,
                                      delay: 0.1,
                                      ease: [0.4, 0, 0.1, 1],
                                      opacity: { duration: 0.35, delay: 0.25 },
                                    } : reorganizing ? {
                                      duration: 0.8,
                                      delay: 0.2,
                                      ease: [0.22, 1, 0.36, 1],
                                      scale: { duration: 0.6, delay: 0.2, times: [0, 0.5, 1] },
                                    } : {
                                      delay: customizePhase === 0 ? 0.8 : 0,
                                      duration: 0.6,
                                      scale: { type: "spring", stiffness: 280, damping: 20, delay: customizePhase === 0 ? 0.8 : 0 },
                                      opacity: { duration: 0.4, delay: customizePhase === 0 ? 0.8 : 0 },
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                  >
                                    Competitive intelligence
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </LayoutGroup>
            </motion.foreignObject>
          )}

          {/* ── Feed the model (step 7) ── */}
          {feeding && (() => {
            const MODEL_R = 80;
            const FEED_SOURCES = [
              { vert: SQUARE_VERTS.product, color: ORANGE, label: "Product" },
              { vert: SQUARE_VERTS.market, color: GREEN, label: "Market" },
              { vert: SQUARE_VERTS.customer, color: NAVY, label: "Customer" },
              { vert: SQUARE_VERTS.order, color: PURPLE, label: "Order" },
            ];
            return (
              <>
                {/* Step 4: feed-the-model flow lines + dissolve dots */}
                {!feedIntro && !convergeReady && FEED_SOURCES.map((src, si) => {
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
                      <motion.foreignObject
                        x={src.vert.x - 70}
                        y={src.vert.y + (si === 0 || si === 2 ? -42 : 14)}
                        width={140}
                        height={36}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ duration: 0.4, delay: 0.2 + si * 0.15 }}
                      >
                        <div style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: src.color,
                          letterSpacing: "0.12em",
                          fontFamily: "inherit",
                          textAlign: "center",
                          backgroundColor: SOLID_TINTS[src.color] ?? "white",
                          borderRadius: 6,
                          padding: "6px 10px",
                        }}>
                          {src.label.toUpperCase()}
                        </div>
                      </motion.foreignObject>
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
                {!convergeReady && DISSOLVE_DOTS.map((dot, di) => (
                  <motion.circle
                    key={`dissolve-${di}`}
                    fill={dot.color}
                    initial={{ cx: dot.x, cy: dot.y, r: dot.r, opacity: 0 }}
                    animate={{ cx: PLOT_CX, cy: PLOT_CY, r: 1, opacity: [0, 0.7, 0.5, 0] }}
                    transition={{
                      duration: 0.9,
                      delay: dot.delay,
                      ease: [0.4, 0, 0.1, 1],
                      opacity: { duration: 0.9, delay: dot.delay, times: [0, 0.15, 0.6, 1] },
                    }}
                  />
                ))}
                {!convergeReady && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R + 15}
                    fill="none" stroke={TEAL} strokeWidth={2}
                    initial={{ opacity: 0, scale: 1.3 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [1.3, 1, 0.95] }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeIn" }}
                    style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                  />
                )}
                {convergeReady && PRICE_SATELLITES.map((sat, si) => {
                  const absorbed = si < absorbedCount;
                  return (
                    <motion.line
                      key={`sat-line-${si}`}
                      x1={PLOT_CX} y1={PLOT_CY}
                      stroke="#C0C8D0"
                      strokeWidth={1.2}
                      initial={{ x2: sat.cx, y2: sat.cy, opacity: 0.35 }}
                      animate={{
                        x2: absorbed ? PLOT_CX : sat.cx,
                        y2: absorbed ? PLOT_CY : sat.cy,
                        opacity: absorbed ? 0 : 0.35,
                      }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.1, 1] }}
                    />
                  );
                })}

                <motion.circle
                  cx={PLOT_CX} cy={PLOT_CY}
                  fill="white" stroke={TEAL} strokeWidth={2.5}
                  initial={{ r: MODEL_R, opacity: 0, scale: 0.5 }}
                  animate={{ r: convergeReady ? CONVERGE_MODEL_R : MODEL_R, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: convergeReady ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                />
                {!convergeReady && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R + 3}
                    fill="none" stroke={TEAL} strokeWidth={1.5}
                    animate={{ opacity: [0, 0.2, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                  />
                )}
                {convergeReady && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R + 8}
                    fill="none" stroke={TEAL} strokeWidth={2}
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 1.0, delay: 0.1, ease: "easeOut" }}
                    style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                  />
                )}
                {convergeReady && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R + 4}
                    fill="none" stroke={`${TEAL}20`} strokeWidth={8}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  />
                )}
                {allAbsorbed && (
                  <motion.circle
                    cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R}
                    fill="none" stroke={TEAL} strokeWidth={3}
                    initial={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
                  />
                )}
                {convergeReady && (
                  <g key="converge-text">
                    {/* Spinning loader — visible while satellites are being absorbed */}
                    <motion.circle
                      cx={PLOT_CX} cy={PLOT_CY - 55}
                      r={14}
                      fill="none"
                      stroke={`${TEAL}30`}
                      strokeWidth={2.5}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: allAbsorbed ? 0 : 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.circle
                      cx={PLOT_CX} cy={PLOT_CY - 55}
                      r={14}
                      fill="none"
                      stroke={TEAL}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeDasharray="22 66"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: allAbsorbed ? 0 : 0.8, rotate: 360 }}
                      transition={{
                        opacity: { duration: 0.3 },
                        rotate: { duration: 1.2, repeat: Infinity, ease: "linear" },
                      }}
                      style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY - 55}px` }}
                    />
                    {/* "RECOMMENDED" label — replaces spinner when done */}
                    <motion.text
                      x={PLOT_CX} y={PLOT_CY - 48}
                      textAnchor="middle"
                      style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", fill: TEAL, fontFamily: "inherit" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: allAbsorbed ? 1 : 0 }}
                      transition={{ duration: 0.4, delay: allAbsorbed ? 0.15 : 0 }}
                    >
                      RECOMMENDED
                    </motion.text>
                    {/* Price — grey & flickering while calculating, snaps to bold TEAL when finalized */}
                    <motion.text
                      x={PLOT_CX} y={PLOT_CY + 18}
                      textAnchor="middle"
                      style={{ fontSize: 72, fontWeight: 800, fontFamily: "inherit" }}
                      initial={{ opacity: 0, scale: 1, fill: "#9EAAB4" }}
                      animate={allAbsorbed ? {
                        opacity: 1,
                        scale: [1.06, 1],
                        fill: TEAL,
                      } : {
                        opacity: [0.45, 0.7, 0.45],
                        scale: 1,
                        fill: "#9EAAB4",
                      }}
                      transition={allAbsorbed ? {
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                        fill: { duration: 0.4 },
                      } : {
                        opacity: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                      }}
                    >
                      {convergingPrice}
                    </motion.text>
                    <motion.text
                      x={PLOT_CX} y={PLOT_CY + 50}
                      textAnchor="middle"
                      style={{ fontSize: 20, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: allAbsorbed ? 0.85 : 0.35 }}
                      transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.9 }}
                    >
                      SKU #A-7200
                    </motion.text>
                  </g>
                )}
                {!convergeReady && (
                  <g key="model-text">
                    <motion.text
                      x={PLOT_CX} y={PLOT_CY - 6}
                      textAnchor="middle"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", fill: MUTED, fontFamily: "inherit" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.6 }}
                    >
                      YOUR
                    </motion.text>
                    <motion.text
                      x={PLOT_CX} y={PLOT_CY + 16}
                      textAnchor="middle"
                      style={{ fontSize: 24, fontWeight: 800, fill: NAVY, fontFamily: "inherit" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: skipAnimation ? 0 : 0.7 }}
                    >
                      MODEL
                    </motion.text>
                  </g>
                )}
                {convergeReady && PRICE_SATELLITES.map((sat, si) => {
                  const absorbed = si < absorbedCount;
                  return (
                    <g key={`sat-${si}`}>
                      <motion.circle
                        fill="white" stroke={sat.color} strokeWidth={2.5}
                        initial={{ cx: sat.cx, cy: sat.cy, r: sat.r, opacity: 1 }}
                        animate={{
                          cx: absorbed ? PLOT_CX : sat.cx,
                          cy: absorbed ? PLOT_CY : sat.cy,
                          r: absorbed ? 0 : sat.r,
                          opacity: absorbed ? 0 : 1,
                        }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.1, 1] }}
                      />
                      <motion.text
                        textAnchor="middle"
                        style={{ fontSize: 16, fontWeight: 700, fill: sat.color, fontFamily: "inherit" }}
                        initial={{ x: sat.cx, y: sat.cy - sat.r - 10, opacity: 1 }}
                        animate={{
                          x: absorbed ? PLOT_CX : sat.cx,
                          y: absorbed ? PLOT_CY - 20 : sat.cy - sat.r - 10,
                          opacity: absorbed ? 0 : 1,
                        }}
                        transition={{ duration: 1.0, ease: [0.4, 0, 0.1, 1] }}
                      >
                        {sat.label}
                      </motion.text>
                      <motion.text
                        textAnchor="middle"
                        style={{ fontSize: 30, fontWeight: 800, fill: sat.color, fontFamily: "inherit" }}
                        initial={{ x: sat.cx, y: sat.cy + 10, opacity: 1 }}
                        animate={{
                          x: absorbed ? PLOT_CX : sat.cx,
                          y: absorbed ? PLOT_CY : sat.cy + 10,
                          opacity: absorbed ? 0 : 1,
                        }}
                        transition={{ duration: 1.0, ease: [0.4, 0, 0.1, 1] }}
                      >
                        {sat.price}
                      </motion.text>
                    </g>
                  );
                })}
              </>
            );
          })()}



        </svg>
        </div>


      </motion.div>

      {/* ── Bottom cards (steps 1-4, hidden at cluster step) ── */}
      <AnimatePresence>
        {(chartStep === 1 && !preScan && scanCardCount > 0) && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 w-full px-4 overflow-hidden"
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {SPOTLIGHTS.map((s, i) => {
              const d = DRIVERS[s.cluster];
              const isActive = chartStep === 1 && i === scanCardCount - 1;
              const isRevealed = i < scanCardCount;
              if (!isRevealed) return null;
              return (
                <motion.div
                  key={s.label}
                  className="relative overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: d.color,
                    borderColor: `${d.color}20`,
                    minWidth: 200,
                    maxWidth: 260,
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{
                    opacity: isActive ? 1 : 0.55,
                    y: 0,
                    x: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
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
                        <div
                          className="text-[0.62rem]"
                          style={{ color: MUTED }}
                        >
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
                          animate={{ opacity: isActive ? 1 : 0.6, x: 0, scale: 1 }}
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
