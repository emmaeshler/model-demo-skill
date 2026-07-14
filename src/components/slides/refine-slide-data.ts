import { makeCurve } from "../visuals/demand-curve";

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
export const BASELINE_KPI = { winRate: 62, priceAdoption: 71, marginImpact: 1.8 };
export const TOTAL_MONTHS = 18;
export const TIMELINE_EVENTS = [
  { month: 6, label: "Steel +8%", dotLabel: "Steel", factor: "Steel index rises — the model reprices upward to protect margin.", steepness: 5, shift: -12, kpi: { winRate: 59, priceAdoption: 76, marginImpact: 2.1 } },
  { month: 12, label: "Freight −6%", dotLabel: "Freight", factor: "Freight costs drop — the model splits the savings between price and margin.", steepness: 5, shift: -6, kpi: { winRate: 66, priceAdoption: 80, marginImpact: 2.4 } },
  { month: 18, label: "Industry +12%", dotLabel: "Industry", factor: "Industry-wide increase — the model reprices within hours, margin holds.", steepness: 5, shift: -30, kpi: { winRate: 63, priceAdoption: 84, marginImpact: 2.5 } },
];

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
export type Customer = "QuickParts" | "Acme" | "MedSupply";

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
    customer: (t < 0.25 ? "QuickParts" : t < 0.55 ? "Acme" : "MedSupply") as Customer,
    birthMonth: (() => { const r = rng(); if (r < 0.22) return 0; if (r < 0.38) return 4; if (r < 0.54) return 8; if (r < 0.70) return 12; if (r < 0.85) return 16; return 20; })(),
  };
});

export const SEGMENT_HIGHLIGHTS = [
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
    beforeBody: "No competition in this niche, but cost increases aren't reflected in the price.",
    afterTitle: "Adjusted +$2.10",
    afterBody: "Cost pressure passes through — price moves to the calibrated curve.",
    marketSignal: "Cost pressure, no competition",
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
    beforeBody: "Win rate is climbing — a pattern, not noise. There's room to price higher.",
    afterTitle: "Adjusted +$0.56",
    afterBody: "Price rises to capture margin the data says is available.",
    marketSignal: "Win rate climbing, margin available",
  },
  {
    t: 0.72,
    label: "MedSupply",
    offsetY: -22,
    oldPrice: "$14.89",
    newPrice: "$14.50",
    change: "−$0.39",
    dotColor: TEAL,
    beforeTitle: "At risk",
    shortReason: "New entrant undercutting",
    beforeBody: "A new entrant is undercutting — willingness to pay is dropping in this region.",
    afterTitle: "Adjusted −$0.39",
    afterBody: "Price drops to defend the deal against the competitive threat.",
    marketSignal: "New entrant undercutting",
  },
];

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
    title: "Now the model looks at all of them at once",
    body: "Thousands of transactions, seen together, reveal the shape of your market — and every price gets refined against it.",
  },
  1: {
    title: "Your calibrated curve",
    body: "The model builds a price–volume relationship from your historical win/loss data.",
  },
  2: {
    title: "QuickParts",
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  3: {
    title: "Acme",
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  4: {
    title: "MedSupply",
    body: "The model detects a pricing gap and adjusts to the recommended price.",
  },
  5: {
    title: "Every price, optimized",
    body: "Every transaction is now aligned to the model's recommended price — lifting underpriced deals while protecting wins.",
  },
  6: {
    title: "The market moves. The model moves with it.",
    body: "Price indices — published benchmarks for capacity, shortage, and industry trends — feed the model continuously. When costs shift, the model reprices, and every recommendation stays current.",
  },
  7: {
    title: "Every customer–market combination gets its own model",
    body: "Each with unique price sensitivities, calibrated independently.",
  },
  8: {
    title: "We do this across your entire portfolio",
    body: "Every customer–end market combination gets its own model — continuously recalibrated as the market shifts.",
  },
};

const MINI_SLOT = { x: 4, y: 2, w: 52, h: 24 };

export type PortfolioFeature = "scatter" | "delta" | "price-dot" | "live" | "plain";

export const PORTFOLIO_SEGMENTS = (() => {
  const pRng = mulberry32(42);
  const names = [
    "Acme Mfg – Industrial MRO", "BearingCo – Heavy Equipment", "AutoParts Direct – Automotive OEM",
    "SeaGuard – Marine Offshore", "ClimaTech – HVAC Systems", "MedSupply Co – Medical Devices",
    "AeroSpec – Aerospace Def.", "PetroChem Ltd – Oil & Gas", "CoastLine – Marine Coatings",
    "FlowTech – Comm. Plumbing", "NetWire Corp – Telecom", "ThermalPro – Commercial",
    "DriveLink – Auto Aftermkt.", "CircuitEdge – Electronics", "HomeFit – Furniture",
    "ArmorTech – Defense Sys.", "SteelRise – Construction", "SunBuild – Solar Energy",
    "SignCraft – Signage", "SkyFast – Aerospace Mfg.", "RailWorks – Rail Transport",
    "DeepCore – Mining Ops.", "PetroFlow – Petrochemical", "MicroPin – Electronics",
    "PackRight – Packaging", "PrecisionCo – Precision", "StructurePro – Structural",
    "HydraForce – Hydraulic", "WindPower – Wind Energy", "AgriChain – Agriculture",
    "VoltEdge – Power Dist.", "ClearCoat – Ind. Coatings", "TitanGrip – Fasteners",
    "AquaPure – Water Treat.", "FiberLink – Fiber Optics", "ChemFlow – Spec. Chem.",
    "ProWeld – Welding Supply", "GeoTech – Geotech Equip.", "BrightSteel – Steel Fab.",
    "CoolAir – Refrigeration", "SpectraLens – Optics MRO", "CoreDrill – Drilling Ops.",
    "AlphaValve – Valve Dist.", "NexGen Parts – Gen. Ind.",
    "SolidPipe – Pipeline Eng.", "LaserCut – CNC Fab.",
    "TrueGauge – Instruments", "IronClad – Metal Svcs.",
    "BlueWave – Marine Sys.", "VertexAir – Ventilation",
  ];
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
  const deltas = [
    "+1.8%", "-0.4%", "+3.2%", "+0.9%", "-1.1%", "+2.4%",
    "-0.7%", "+1.5%", "+0.3%", "-0.9%", "+2.7%", "+1.2%",
    "-0.5%", "+1.9%", "-0.2%", "+3.1%", "+0.8%", "-1.3%",
    "+2.0%", "-0.6%", "+1.4%", "+0.7%", "-0.3%", "+2.5%",
    "+1.1%", "-0.8%", "+1.6%", "+0.4%", "-1.0%", "+2.2%",
    "+0.5%", "-0.3%", "+2.8%", "+1.3%", "-0.9%", "+1.7%",
    "-0.6%", "+3.0%", "+0.2%", "-1.2%", "+2.1%", "-0.4%",
    "+1.5%", "+0.8%", "-0.7%", "+2.3%", "+0.6%", "-0.5%",
    "+1.9%", "-0.2%",
  ];
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
