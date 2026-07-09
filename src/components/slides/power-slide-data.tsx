export const NAVY = "#00446A";
export const TEAL = "#21A5D5";
export const ORANGE = "#E56910";
export const GREEN = "#2e7d32";
export const PURPLE = "#7B5EA7";
export const MUTED = "#5A6A78";

export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const SOLID_TINTS: Record<string, string> = {
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

export const PLOT = { left: 88, right: 920, top: 30, bottom: 420 };
export const PLOT_W = PLOT.right - PLOT.left;
export const PLOT_H = PLOT.bottom - PLOT.top;
export const PLOT_CX = PLOT.left + PLOT_W / 2;
export const PLOT_CY = PLOT.top + PLOT_H / 2;

export const Y_TICKS = ["$80", "$70", "$60", "$50", "$40", "$30", "$20"];
export const X_TICKS = ["0", "100", "200", "300", "400", "500"];

export function yForTick(i: number) {
  return PLOT.top + (i / (Y_TICKS.length - 1)) * PLOT_H;
}
export function xForTick(i: number) {
  return PLOT.left + (i / (X_TICKS.length - 1)) * PLOT_W;
}

/* ─── Driver clusters ─── */

export const DRIVERS = [
  { label: "Cost Trends", color: NAVY, cx: 230, cy: 135 },
  { label: "Competitive Position", color: ORANGE, cx: 620, cy: 150 },
  { label: "Volume & Elasticity", color: GREEN, cx: 250, cy: 330 },
  { label: "Win / Loss Patterns", color: PURPLE, cx: 610, cy: 315 },
];

export const MODEL_DRIVERS = [
  { label: "Cost Trends", color: NAVY },
  { label: "Competitive Position", color: ORANGE },
  { label: "Volume & Elasticity", color: GREEN },
  { label: "Win / Loss Patterns", color: PURPLE },
  { label: "Customer Value", color: TEAL },
];

/* ─── Cluster spread (step 5: dots cluster into 4 groups) ─── */

export const CLUSTER_SPREAD = [
  { cx: 180, cy: 60 },
  { cx: 830, cy: 60 },
  { cx: 180, cy: 400 },
  { cx: 830, cy: 400 },
];
export const CLUSTER_R = 95;

/* ─── Square factor layout ─── */

export const SQUARE_VERTS = {
  customer: { x: 180, y: 60, label: "CUSTOMER", color: NAVY },
  product: { x: 830, y: 60, label: "PRODUCT", color: ORANGE },
  market: { x: 180, y: 400, label: "MARKET", color: GREEN },
  order: { x: 830, y: 400, label: "ORDER", color: PURPLE },
};

export const SQUARE_FACTORS: { label: string; category: "product" | "market" | "customer" | "order"; emphasis?: "highlight" | "crossoff" | "deemphasize" }[] = [
  { label: "Product mix", category: "product" },
  { label: "Product family", category: "product" },
  { label: "Product specialization", category: "product" },
  { label: "Cost to serve", category: "product" },
  { label: "Willingness to pay", category: "product" },
  { label: "Price sensitivity", category: "product" },
  { label: "Market share", category: "market" },
  { label: "Commodity index", category: "market" },
  { label: "Industry trends", category: "market" },
  { label: "Competitor activity", category: "market" },
  { label: "Competitive price point", category: "market" },
  { label: "Customer channel", category: "customer" },
  { label: "End market", category: "customer" },
  { label: "Sales rep", category: "customer" },
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

export const CATEGORY_LAYOUT = [
  { key: "customer" as const, x: 10, y: 0, w: 490, h: 210, color: NAVY, labelDelay: 0.2, baseDelay: 0.4 },
  { key: "product" as const, x: 520, y: 0, w: 490, h: 210, color: ORANGE, labelDelay: 0.25, baseDelay: 0.7 },
  { key: "order" as const, x: 10, y: 250, w: 490, h: 210, color: PURPLE, labelDelay: 0.3, baseDelay: 1.0 },
  { key: "market" as const, x: 520, y: 250, w: 490, h: 210, color: GREEN, labelDelay: 0.35, baseDelay: 1.3 },
];

export const CATEGORY_TO_SPOTLIGHT: Record<string, number> = {
  customer: 2,
  product: 3,
  market: 1,
  order: 0,
};

export const CATEGORY_TITLES = [
  "Customer factors",
  "Product factors",
  "Order factors",
  "Market factors",
];

export const CATEGORY_NARRATION = [
  "Who is the customer — channel, region, size, tenure, and sales relationship.",
  "What's being sold — mix, family, specialization, cost, and price sensitivity.",
  "How orders behave — frequency, size, lead time, terms, and seasonality.",
  "Where you compete — price points, share, commodities, and competitive dynamics.",
];

export const SELECTED_FACTORS = [
  { label: "End market", color: NAVY, weight: 4, note: "Weighted ↑" },
  { label: "Product specialization", color: ORANGE, weight: 3, note: "" },
  { label: "Competitive price point", color: GREEN, weight: 3, note: "Added" },
  { label: "Order frequency", color: PURPLE, weight: 2, note: "" },
  { label: "Product mix", color: ORANGE, weight: 3, note: "" },
];

export const CATEGORY_ACTIONS: Record<string, { label: string; action: "elevate" | "remove" | "lower" | "add"; step?: number }[]> = {
  customer: [
    { label: "Sales rep", action: "remove", step: 0 },
    { label: "End market", action: "elevate", step: 1 },
  ],
  product: [
    { label: "Product specialization", action: "elevate" },
    { label: "Product mix", action: "elevate" },
  ],
  market: [
    { label: "Competitive price point", action: "add" },
  ],
  order: [
    { label: "Seasonality", action: "lower" },
  ],
};

type ActionHint = { icon: string; color: string; headline: string; detail: string };
export const CATEGORY_ACTION_HINTS: (ActionHint | ActionHint[])[] = [
  [
    { icon: "×", color: TEAL, headline: "Remove a factor", detail: "Sales rep doesn't seem like a meaningful driver — take it out." },
    { icon: "↑", color: TEAL, headline: "Weight it higher", detail: "End market is a key driver for this client — weight it higher." },
  ],
  { icon: "↑", color: TEAL, headline: "Emphasize key factors", detail: "Product specialization and product mix are key profitability drivers — weight them higher." },
  { icon: "↓", color: PURPLE, headline: "Lower its weight", detail: "Seasonality has minimal impact for this customer — dial it down." },
  { icon: "+", color: GREEN, headline: "Add a factor", detail: "Competitive intelligence is critical in this market — add it to the model." },
];

export const FEED_NUDGE_Y = [130, 35, -170, -75];

const dissolveSeed = mulberry32(456);
const DISSOLVE_COLORS = [NAVY, ORANGE, PURPLE, GREEN];
const DISSOLVE_ROW_Y = [60, 170, 280, 390];
export const DISSOLVE_DOTS = Array.from({ length: 16 }, (_, i) => {
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

export const PRICE_SATELLITES = [
  { label: "Customer", price: "+$0.60", value: 0.60, color: NAVY, cx: 185, cy: 240, r: 65 },
  { label: "Product", price: "+$0.85", value: 0.85, color: ORANGE, cx: 810, cy: 90, r: 65 },
  { label: "Market", price: "−$0.30", value: -0.30, color: GREEN, cx: 250, cy: 410, r: 60 },
  { label: "Order", price: "+$0.45", value: 0.45, color: PURPLE, cx: 855, cy: 370, r: 68 },
];
export const BASE_PRICE = 15.90;
export const CONVERGE_MODEL_R = 170;

/* ─── Spotlight data (steps 1-4) ─── */

export const SPOTLIGHTS = [
  {
    cluster: 2,
    icon: "people",
    label: "CUSTOMER",
    count: "Found 2,400 customer accounts",
  },
  {
    cluster: 3,
    icon: "chart",
    label: "PRODUCT",
    count: "Found 18 months of product data",
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET",
    count: "Found 36 market features",
  },
  {
    cluster: 0,
    icon: "grid",
    label: "ORDER",
    count: "Found 14,200 order records",
  },
];

export const TITLES = [
  "2,400 accounts × 15,000 SKUs",
  "The model scans for patterns",
  "Your customized factors now feed the model",
  "Your model drivers produce one optimized price per SKU",
];

export const SUBTITLES = [
  "That's 36 million unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "We look at pricing factors across four dimensions — tailored to what matters for your business.",
  "Every business is different. We analyze what matters to you — adding key factors, removing what doesn't apply, and tuning the balance.",
  "Five tailored drivers — drawn from the factors that matter most to you — feed the model to arrive at the right price for every SKU.",
];

/* ─── Pre-compute dot positions ─── */

export const DOT_COUNT = 120;
const rand = mulberry32(42);

export const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const cluster = i % 4;
  const d = DRIVERS[cluster];
  const angle = rand() * Math.PI * 2;
  const dist = rand() * 48 + 10;

  let sx: number;
  let sy: number;

  const zone = rand();
  if (zone < 0.28) {
    const rawX = 0.10 + (rand() - 0.5) * 0.16 + (rand() - 0.5) * 0.08;
    const rawY = 0.15 + (rand() - 0.5) * 0.20 + (rand() - 0.5) * 0.08;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.56) {
    const rawX = 0.13 + (rand() - 0.5) * 0.20 + (rand() - 0.5) * 0.08;
    const rawY = 0.73 + (rand() - 0.5) * 0.24 + (rand() - 0.5) * 0.08;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.72) {
    const rawX = 0.08 + rand() * 0.16;
    const rawY = 0.30 + rand() * 0.30;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else if (zone < 0.90) {
    const t = rand();
    const rawX = 0.25 + t * 0.45;
    const rawY = 0.55 + t * 0.20 + (rand() - 0.5) * 0.18;
    sx = PLOT.left + rawX * PLOT_W;
    sy = PLOT.top + rawY * PLOT_H;
  } else {
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

  const r = 2.8;

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
    scatterOpacity: 0.3,
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
export const SQUARE_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
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
export const CLUSTER_COLORS = [NAVY, ORANGE, GREEN, PURPLE];

const clusterRand = mulberry32(77);
export const CLUSTER_TARGETS = Array.from({ length: DOT_COUNT }, (_, i) => {
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

export const SWEEP_DURATION = 12;
export const PILL_STAGGER_SPAN = 1.5;

export function highlightDotsForCluster(cluster: number) {
  return DOTS
    .map((dot, index) => ({
      index,
      cluster: dot.cluster,
      normalizedY: (dot.sy - PLOT.top) / PLOT_H,
    }))
    .filter((d) => d.cluster === cluster)
    .filter((_, i) => i % 5 === 0)
    .sort((a, b) => a.normalizedY - b.normalizedY);
}

/* ─── Callout dots ─── */

export const CALLOUTS = [
  { label: "Acme Industrial", price: "$58.20", x: 245, y: 105, anchor: "start" as const, labelDx: 14, labelDy: -12, color: NAVY, cluster: 0 },
  { label: "QuickParts LLC", price: "$34.50", x: 620, y: 280, anchor: "start" as const, labelDx: 14, labelDy: 4, color: ORANGE, cluster: 1 },
  { label: "MedSupply Co", price: "$47.10", x: 420, y: 185, anchor: "end" as const, labelDx: -14, labelDy: -12, color: TEAL, cluster: 3 },
  { label: "Coastal Dist.", price: "$62.80", x: 780, y: 72, anchor: "start" as const, labelDx: 14, labelDy: 14, color: GREEN, cluster: 2 },
  { label: "Delta Mfg", price: "$29.40", x: 150, y: 345, anchor: "start" as const, labelDx: 14, labelDy: 2, color: PURPLE, cluster: 2 },
];

/* ─── Icons ─── */

export function CategoryIcon({ type, color, size = 18 }: { type: string; color: string; size?: number }) {
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
