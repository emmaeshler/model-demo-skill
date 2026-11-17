import { makeCurve } from "../visuals/demand-curve";
import {
  baselineKpi, dataCounts, timelineEvents as cfgTimelineEvents, segmentHighlights,
  portfolioSegmentNames, portfolioSegmentDeltas, customers, slideText,
} from "@/lib/prospect-config";

export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const NAVY = "#00446A";
export const ORANGE = "#C27A3A";
export const TEAL = "#4A8FA8";
export const MUTED = "#8A9AAA";
export const STRAT_BLUE = "#21A5D5";
export const GREEN = "#4A8A5C";
export const RED = "#A65A52";

export const CURVE_SLOT = { x: 50, y: 20, w: 460, h: 140 };
export const BASE_Y = CURVE_SLOT.y + CURVE_SLOT.h;
export const BASELINE_KPI = baselineKpi;
export const TOTAL_MONTHS = dataCounts.monthsOfData;
export const TIMELINE_EVENTS = cfgTimelineEvents.map((e, i) => ({
  ...e,
  steepness: 5,
  shift: [-12, -6, -30][i] ?? -12,
}));

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function getMonthLabel(month: number): string {
  const m = Math.round(Math.max(0, month));
  return `${MONTH_NAMES[m % 12]} '${24 + Math.floor(m / 12)}`;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type DotStatus = "won" | "lost" | "overridden" | "adjusted";
export type Customer = string;

export const STATUS_COLORS: Record<DotStatus, string> = {
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

export interface ScatterDot {
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

export const DOT_COUNT = 180;
export const SCATTER_DOTS: ScatterDot[] = Array.from({ length: DOT_COUNT }, () => {
  const zone = rng();
  let t: number;
  let offsetY: number;

  if (zone < 0.28) {
    t = 0.02 + rng() * 0.22 + (rng() - 0.5) * 0.06;
    offsetY = -(rng() * 35 + 3);
  } else if (zone < 0.52) {
    t = 0.04 + rng() * 0.24 + (rng() - 0.5) * 0.08;
    offsetY = rng() * 60 + 10;
  } else if (zone < 0.66) {
    t = 0.06 + rng() * 0.20;
    offsetY = (rng() - 0.5) * 50;
  } else if (zone < 0.88) {
    const progress = rng();
    t = 0.22 + progress * 0.58;
    offsetY = rng() * 45 + progress * 25;
  } else {
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
    r: (() => { rng(); rng(); return 1.4; })(),
    driftDx: (rng() - 0.5) * 4,
    driftDy: (rng() - 0.5) * 3,
    driftDuration: 4 + rng() * 4,
    driftDelay: rng() * 5,
    chaosX: CURVE_SLOT.x + 10 + rng() * (CURVE_SLOT.w - 20),
    chaosY: CURVE_SLOT.y + 5 + rng() * (CURVE_SLOT.h - 10),
    residualY: (() => { const r = rng(); return r < 0.55 ? 0 : r < 0.8 ? 2 + rng() * 6 : 6 + rng() * 10; })(),
    customer: (t < 0.25 ? customers[2].name.split(" ")[0] : t < 0.55 ? customers[0].name.split(" ")[0] : customers[1].name.split(" ")[0]) as Customer,
    birthMonth: (() => { const r = rng(); if (r < 0.22) return 0; if (r < 0.38) return 4; if (r < 0.54) return 8; if (r < 0.70) return 12; if (r < 0.85) return 16; return 20; })(),
  };
});

export const SEGMENT_HIGHLIGHTS = segmentHighlights.map((h, i) => ({
  ...h,
  offsetY: [22, 6, -18][i] ?? 0,
  dotColor: [ORANGE, NAVY, TEAL][i] ?? NAVY,
}));

export const LEGEND_ITEMS = (() => {
  const items = [
    { label: "Won", color: GREEN },
    { label: "Lost", color: RED },
    { label: "Overridden", color: ORANGE },
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

export const STEP_CONTEXT: Record<number, { title: string; body: string }> = {
  0: {
    title: "Now we look across all your transactions",
    body: "Together, they form a market curve — and every price gets refined against it.",
  },
  1: {
    title: customers[2].name.split(" ")[0],
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  2: {
    title: customers[0].name.split(" ")[0],
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  3: {
    title: customers[1].name.split(" ")[0],
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  4: {
    title: "Every price, optimized",
    body: "Every transaction is now aligned to the model's recommended price — lifting underpriced deals while protecting wins.",
  },
  5: {
    title: "The market moves. The model moves with it.",
    body: "External indices, win rates, price adoption, and margin — the model reads all four signals to decide when and how to reprice.",
  },
  6: {
    title: "Every customer–market combination gets its own model",
    body: "Each with unique price sensitivities, calibrated independently.",
  },
  7: {
    title: "We do this across your entire portfolio",
    body: "Every customer–end market combination gets its own model — continuously recalibrated as the market shifts.",
  },
};

const MINI_SLOT = { x: 4, y: 2, w: 52, h: 24 };

export type PortfolioFeature = "scatter" | "delta" | "price-dot" | "live" | "plain";

export const PORTFOLIO_SEGMENTS = (() => {
  const pRng = mulberry32(42);
  const names = portfolioSegmentNames;
  const features: PortfolioFeature[] = [
    "scatter", "delta", "price-dot", "live", "plain", "scatter",
    "delta", "plain", "price-dot", "scatter", "live", "delta",
    "plain", "scatter", "price-dot", "delta", "live", "scatter",
    "delta", "price-dot", "plain", "scatter", "live", "price-dot",
    "plain", "scatter", "delta", "live", "price-dot", "plain",
    "live", "scatter", "delta", "price-dot", "plain", "delta",
    "scatter", "live", "plain", "price-dot", "delta", "scatter",
    "price-dot", "plain", "live", "scatter", "delta", "live",
    "plain", "scatter",
  ];
  const deltas = portfolioSegmentDeltas;
  return names.map((name, i) => {
    const steepness = 2 + pRng() * 10;
    const raw = makeCurve(MINI_SLOT, steepness);
    const n = 32;
    const pts = Array.from({ length: n + 1 }, (_, j) => {
      const pt = raw.sampleAt(j / n);
      return { x: pt.x, y: pt.y };
    });
    const d = "M " + pts.map(p => `${p.x},${p.y}`).join(" L ");
    const feature = features[i];
    const col = i % 10;
    const row = Math.floor(i / 10);
    const dist = Math.sqrt(Math.pow(col - 4.5, 2) + Math.pow(row - 1, 2));

    const scatterDots = feature === "scatter" ? Array.from({ length: 5 }, () => {
      const t = 0.05 + pRng() * 0.9;
      const curvePt = raw.sampleAt(t);
      const cy = curvePt.y + (pRng() - 0.5) * 12;
      pRng();
      return { cx: curvePt.x, cy: Math.max(3, Math.min(25, cy)), r: 1.0 };
    }) : undefined;

    const priceDotPt = feature === "price-dot" ? (() => {
      const t = 0.15 + pRng() * 0.5;
      const curvePt = raw.sampleAt(t);
      return { x: curvePt.x, y: curvePt.y };
    })() : undefined;

    return { name, d, feature, dist, delta: deltas[i], scatterDots, priceDotPt };
  });
})();

export const HERO_SEGMENT_INDICES = [0, 1, 2, 3];

const HERO_SLOT = { x: 30, y: 10, w: 200, h: 90 };
export const HERO_VIEWBOX = "0 0 260 120";

export const HERO_SEGMENTS = (() => {
  const hRng = mulberry32(99);
  const steepnesses = [4, 8, 3, 10];
  return HERO_SEGMENT_INDICES.map((idx, hi) => {
    const seg = PORTFOLIO_SEGMENTS[idx];
    const raw = makeCurve(HERO_SLOT, steepnesses[hi]);
    const n = 64;
    const pts = Array.from({ length: n + 1 }, (_, j) => {
      const pt = raw.sampleAt(j / n);
      return { x: pt.x, y: pt.y };
    });
    const d = "M " + pts.map(p => `${p.x},${p.y}`).join(" L ");
    const fillD = d + ` L ${HERO_SLOT.x + HERO_SLOT.w},${HERO_SLOT.y + HERO_SLOT.h} L ${HERO_SLOT.x},${HERO_SLOT.y + HERO_SLOT.h} Z`;

    const scatterDots = Array.from({ length: 28 }, () => {
      const t = 0.03 + hRng() * 0.94;
      const curvePt = raw.sampleAt(t);
      const spread = 20 + t * 30;
      const cy = curvePt.y + (hRng() - 0.5) * spread;
      const r = 1.8 + hRng() * 1.8;
      const opacity = 0.15 + hRng() * 0.3;
      return {
        cx: curvePt.x + (hRng() - 0.5) * 10,
        cy: Math.max(HERO_SLOT.y + 2, Math.min(HERO_SLOT.y + HERO_SLOT.h - 2, cy)),
        r, opacity,
      };
    });

    const priceT = 0.2 + hRng() * 0.35;
    const pricePt = raw.sampleAt(priceT);

    return {
      name: seg.name,
      feature: seg.feature,
      delta: seg.delta,
      d,
      fillD,
      scatterDots,
      pricePt: { x: pricePt.x, y: pricePt.y },
      slot: HERO_SLOT,
    };
  });
})();

export const PORTFOLIO_REVEAL_ORDER = (() => {
  const indexed = PORTFOLIO_SEGMENTS.map((seg, i) => ({ i, dist: seg.dist }));
  indexed.sort((a, b) => a.dist - b.dist);
  const order = new Array<number>(PORTFOLIO_SEGMENTS.length);
  indexed.forEach((item, ri) => { order[item.i] = ri; });
  return order;
})();
