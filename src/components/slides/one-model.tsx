"use client";

import { Fragment, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

export const ONE_MODEL_TOTAL_STEPS = 5;

interface NarrativeSegment {
  text: string;
  bold?: boolean;
  color?: string;
  underline?: boolean;
}

const STEP_NARRATIVES: Record<number, NarrativeSegment[]> = {
  0: [
    { text: "It starts with " },
    { text: "machine learning", bold: true, underline: true, color: ML_GREEN },
    { text: " — learning patterns from your data." },
  ],
  1: [
    { text: "Then layer in " },
    { text: "strategic guidance", bold: true, underline: true, color: STRAT_BLUE },
    { text: " — your expertise encoded as rules." },
  ],
  2: [
    { text: "Together, they form a " },
    { text: "single unified pricing engine", bold: true, underline: true, color: NAVY },
    { text: "." },
  ],
  3: [
    { text: "We integrate " },
    { text: "internal knowledge", bold: true, underline: true, color: NAVY },
    { text: " with " },
    { text: "environmental signals", bold: true, underline: true, color: TEAL },
    { text: "." },
  ],
  4: [
    { text: "We integrate " },
    { text: "internal knowledge", bold: true, underline: true, color: NAVY },
    { text: " with " },
    { text: "environmental signals", bold: true, underline: true, color: TEAL },
    { text: "." },
  ],
};

function HighlightNarrative({ segments, isActive }: { segments: NarrativeSegment[]; isActive: boolean }) {
  return (
    <span>
      {segments.map((seg, si) => {
        if (!seg.bold) return <span key={si}>{seg.text}</span>;
        return (
          <span key={si} className="relative inline">
            <span style={{ fontWeight: 700, color: seg.color || NAVY }}>{seg.text}</span>
            {seg.underline && isActive && (
              <motion.span
                className="absolute bottom-0 left-0 h-[2px] rounded-full"
                style={{ backgroundColor: seg.color || NAVY }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

function ChartIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="18" width="6" height="10" rx="1.5" fill={ML_GREEN} opacity={0.3} />
      <rect x="13" y="10" width="6" height="18" rx="1.5" fill={ML_GREEN} opacity={0.5} />
      <rect x="22" y="4" width="6" height="24" rx="1.5" fill={ML_GREEN} opacity={0.8} />
    </svg>
  );
}

function CompassIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke={STRAT_BLUE} strokeWidth="1.8" fill={STRAT_BLUE} fillOpacity={0.06} />
      <polygon points="16,6 18.5,14.5 16,13 13.5,14.5" fill={STRAT_BLUE} opacity={0.7} />
      <polygon points="16,26 13.5,17.5 16,19 18.5,17.5" fill={STRAT_BLUE} opacity={0.3} />
      <circle cx="16" cy="16" r="2" fill={STRAT_BLUE} opacity={0.5} />
    </svg>
  );
}

const BAR_DATA = [
  { h: 45, delay: 0.3 },
  { h: 72, delay: 0.45 },
  { h: 58, delay: 0.6 },
  { h: 90, delay: 0.75 },
  { h: 65, delay: 0.9 },
  { h: 82, delay: 1.05 },
  { h: 50, delay: 1.2 },
];

function MLVisualization() {
  const chartH = 110;
  const barW = 16;
  const gap = 7;
  const totalW = BAR_DATA.length * (barW + gap) - gap;

  return (
    <svg width={totalW + 20} height={chartH + 25} viewBox={`0 0 ${totalW + 20} ${chartH + 25}`} className="mx-auto">
      <motion.line
        x1={8} y1={chartH + 5} x2={totalW + 12} y2={chartH + 5}
        stroke={ML_GREEN} strokeWidth={1.5} opacity={0.3}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      {BAR_DATA.map((bar, i) => (
        <motion.rect
          key={i} x={10 + i * (barW + gap)} width={barW} rx={3} fill={ML_GREEN}
          initial={{ y: chartH + 5, height: 0, opacity: 0 }}
          animate={{ y: chartH + 5 - bar.h, height: bar.h, opacity: [0, 0.3, 0.5, 0.7] }}
          transition={{ duration: 0.6, delay: bar.delay, ease: "easeOut" }}
        />
      ))}
      <motion.path
        d={`M 18 ${chartH + 5 - 38} C 55 ${chartH + 5 - 52}, 95 ${chartH + 5 - 70}, ${totalW} ${chartH + 5 - 76}`}
        fill="none" stroke={ML_GREEN} strokeWidth={2.5} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
      />
      {[
        { cx: 18, cy: chartH + 5 - 38, d: 1.6 },
        { cx: 55, cy: chartH + 5 - 52, d: 1.8 },
        { cx: 95, cy: chartH + 5 - 65, d: 2.0 },
        { cx: totalW, cy: chartH + 5 - 76, d: 2.2 },
      ].map((dot, i) => (
        <motion.circle
          key={i} cx={dot.cx} cy={dot.cy} r={3}
          fill="white" stroke={ML_GREEN} strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: dot.d }}
        />
      ))}
    </svg>
  );
}

function StratVisualization() {
  const W = 190;
  const H = 140;
  const nodeR = 6;
  const root = { x: W / 2, y: 16 };
  const L1 = [{ x: 48, y: 58 }, { x: W - 48, y: 58 }];
  const L2 = [{ x: 20, y: 100 }, { x: 72, y: 100 }, { x: W - 72, y: 100 }, { x: W - 20, y: 100 }];

  const branches = [
    { from: root, to: L1[0], delay: 0.5 }, { from: root, to: L1[1], delay: 0.65 },
    { from: L1[0], to: L2[0], delay: 0.9 }, { from: L1[0], to: L2[1], delay: 1.0 },
    { from: L1[1], to: L2[2], delay: 1.1 }, { from: L1[1], to: L2[3], delay: 1.2 },
  ];

  const allNodes = [
    { ...root, delay: 0.3, size: 8 },
    { ...L1[0], delay: 0.7, size: nodeR }, { ...L1[1], delay: 0.85, size: nodeR },
    { ...L2[0], delay: 1.1, size: 5 }, { ...L2[1], delay: 1.2, size: 5 },
    { ...L2[2], delay: 1.3, size: 5 }, { ...L2[3], delay: 1.4, size: 5 },
  ];

  return (
    <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`} className="mx-auto">
      {branches.map((b, i) => (
        <motion.path
          key={i}
          d={`M ${b.from.x} ${b.from.y + nodeR} Q ${b.from.x} ${(b.from.y + b.to.y) / 2 + 4}, ${b.to.x} ${b.to.y - nodeR}`}
          fill="none" stroke={STRAT_BLUE} strokeWidth={1.5} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }}
          transition={{ duration: 0.45, delay: b.delay, ease: "easeOut" }}
        />
      ))}
      {allNodes.map((n, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: n.delay, ease: "easeOut" }}>
          <circle cx={n.x} cy={n.y} r={n.size} fill={`${STRAT_BLUE}15`} stroke={STRAT_BLUE} strokeWidth={1.5} />
          <circle cx={n.x} cy={n.y} r={n.size * 0.4} fill={STRAT_BLUE} opacity={0.5} />
        </motion.g>
      ))}
      <motion.path
        d={`M ${root.x} ${root.y + 8} Q ${root.x} ${(root.y + L1[1].y) / 2 + 4}, ${L1[1].x} ${L1[1].y - nodeR}`}
        fill="none" stroke={STRAT_BLUE} strokeWidth={2.5} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
      />
      <motion.path
        d={`M ${L1[1].x} ${L1[1].y + nodeR} Q ${L1[1].x} ${(L1[1].y + L2[2].y) / 2 + 4}, ${L2[2].x} ${L2[2].y - 5}`}
        fill="none" stroke={STRAT_BLUE} strokeWidth={2.5} strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 2.0, ease: "easeOut" }}
      />
      <motion.circle cx={L2[2].x} cy={L2[2].y} r={9} fill="none" stroke={STRAT_BLUE} strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 0.5, 0.3], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 2.3, ease: "easeOut" }}
      />
    </svg>
  );
}

function BulletList({ items, color, baseDelay }: { items: string[]; color: string; baseDelay: number }) {
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {items.map((point, i) => (
        <motion.div key={i} className="flex items-center gap-2 text-[13px]" style={{ color: "#4A5568" }}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: baseDelay + i * 0.18 }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color, opacity: 0.5 }} />
          {point}
        </motion.div>
      ))}
    </div>
  );
}

function ConceptPanel({ title, subtitle, color, icon, bullets, visualization, bulletDelay }: {
  title: string; subtitle: string; color: string; icon: React.ReactNode;
  bullets: string[]; visualization: React.ReactNode; bulletDelay: number;
}) {
  return (
    <div className="flex flex-col items-center text-center h-full">
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-bold" style={{ color }}>{title}</h3>
      <p className="text-xs mt-0.5 mb-3" style={{ color: "#6B7280" }}>{subtitle}</p>
      <div className="h-[140px] flex items-center justify-center">{visualization}</div>
      <BulletList items={bullets} color={color} baseDelay={bulletDelay} />
    </div>
  );
}

const ML_BULLETS = [
  "Learns from historical win/loss patterns",
  "Models price elasticity across segments",
  "Generates probability-weighted forecasts",
];

const STRAT_BULLETS = [
  "Encodes competitive positioning rules",
  "Applies business objectives and constraints",
  "Adjusts for market-specific dynamics",
];

/* ── Bezier helpers for flow dots ── */

function sampleCubicBezier(
  sx: number, sy: number, cp1x: number, cp1y: number,
  cp2x: number, cp2y: number, ex: number, ey: number, steps: number,
) {
  const cxArr: number[] = [];
  const cyArr: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    cxArr.push(u * u * u * sx + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * ex);
    cyArr.push(u * u * u * sy + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * ey);
  }
  return { cxArr, cyArr };
}

function FlowDot({ path, color, delay }: {
  path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
  color: string; delay: number;
}) {
  const { cxArr, cyArr } = sampleCubicBezier(
    path.sx, path.sy, path.cp1x, path.cp1y, path.cp2x, path.cp2y, path.ex, path.ey, 50,
  );
  return (
    <motion.circle r={3} fill={color} initial={{ opacity: 0 }}
      animate={{ cx: cxArr, cy: cyArr, opacity: [0, 0.5, 0.5, 0.5, 0] }}
      transition={{ duration: 4.5, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function UnifiedModelVisualization({ showInputs }: { showInputs: boolean }) {
  const W = 920;
  const H = 340;
  const CX = W / 2;
  const CY = 170;
  const R = 85;
  const GAP = 4;

  const animate = !showInputs;
  const split = 2.4;
  const settle = split + 0.8;

  const CARD_W = 210;
  const CARD_H = 54;
  const LEFT_X = 30;
  const RIGHT_X = W - 30 - CARD_W;
  const CARD_1_Y = CY - CARD_H - 14;
  const CARD_2_Y = CY + 14;
  const ML_OFFSET = 50;
  const STRAT_OFFSET = 50;
  const EDGE_LEFT_ML = CX - Math.round(Math.sqrt(R * R - ML_OFFSET * ML_OFFSET));
  const EDGE_LEFT_STRAT = CX - Math.round(Math.sqrt(R * R - STRAT_OFFSET * STRAT_OFFSET));
  const EDGE_RIGHT_ML = CX + Math.round(Math.sqrt(R * R - ML_OFFSET * ML_OFFSET));
  const EDGE_RIGHT_STRAT = CX + Math.round(Math.sqrt(R * R - STRAT_OFFSET * STRAT_OFFSET));

  const INTERNAL = [
    { label: "Internal Historical Data", subtitle: "Transaction, customer, and offering history", y: CARD_1_Y, targetY: CY - ML_OFFSET, edgeX: EDGE_LEFT_ML },
    { label: "In-House Knowledge", subtitle: "Business realities and strategic objectives", y: CARD_2_Y, targetY: CY + STRAT_OFFSET, edgeX: EDGE_LEFT_STRAT },
  ];

  const ENVIRONMENTAL = [
    { label: "External Environmental Data", subtitle: "Market sentiment and macro signals", y: CARD_1_Y, targetY: CY - ML_OFFSET, edgeX: EDGE_RIGHT_ML },
    { label: "Industry Expertise", subtitle: "Benchmarks, key drivers, and paradigms", y: CARD_2_Y, targetY: CY + STRAT_OFFSET, edgeX: EDGE_RIGHT_STRAT },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[400px]">
      <defs>
        <clipPath id="m-top"><circle cx={CX} cy={CY - GAP / 2} r={R} /></clipPath>
        <clipPath id="m-bot"><circle cx={CX} cy={CY + GAP / 2} r={R} /></clipPath>
        <clipPath id="m-top-half"><rect x={0} y={0} width={W} height={CY} /></clipPath>
        <clipPath id="m-bot-half"><rect x={0} y={CY} width={W} height={H} /></clipPath>
      </defs>

      {/* Dark navy circle — initial state (only during merge animation) */}
      {animate && (
        <>
          <motion.circle cx={CX} cy={CY} r={R} fill={NAVY}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: split, times: [0, 0.15, 0.8, 1], ease: "easeOut" }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          <motion.text x={CX} y={CY - 4} fontSize="16" fontWeight="700" fill="white" textAnchor="middle"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: split, times: [0, 0.2, 0.8, 1] }}>
            Pricing Model
          </motion.text>
          <motion.text x={CX} y={CY + 16} fontSize="10.5" fill="rgba(255,255,255,0.7)" textAnchor="middle"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: split, times: [0, 0.25, 0.8, 1] }}>
            One unified engine
          </motion.text>

          {/* ML flies in from left */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.4, delay: 0.8, times: [0, 0.15, 0.7, 1] }}>
            <motion.g initial={{ x: -140 }} animate={{ x: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <foreignObject x={CX - R - 80} y={CY - 18} width={36} height={36}>
                <ChartIcon size={36} />
              </foreignObject>
              <text x={CX - R - 62} y={CY + 28} fontSize="11" fontWeight="700" fill={ML_GREEN} textAnchor="middle">
                ML Prediction
              </text>
            </motion.g>
          </motion.g>

          {/* Strategy flies in from right */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.4, delay: 1.0, times: [0, 0.15, 0.7, 1] }}>
            <motion.g initial={{ x: 140 }} animate={{ x: 0 }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}>
              <foreignObject x={CX + R + 44} y={CY - 18} width={36} height={36}>
                <CompassIcon size={36} />
              </foreignObject>
              <text x={CX + R + 62} y={CY + 28} fontSize="11" fontWeight="700" fill={STRAT_BLUE} textAnchor="middle">
                Strategic Guidance
              </text>
            </motion.g>
          </motion.g>
        </>
      )}

      {/* Top half — green (ML) */}
      <g clipPath="url(#m-top-half)">
        <g clipPath="url(#m-top)">
          <motion.circle cx={CX} cy={CY - GAP / 2} r={R} fill="#D5E6D0"
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: animate ? split : 0 }}
          />
        </g>
      </g>

      {/* Bottom half — blue (Strategic) */}
      <g clipPath="url(#m-bot-half)">
        <g clipPath="url(#m-bot)">
          <motion.circle cx={CX} cy={CY + GAP / 2} r={R} fill="#D4E8F0"
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: animate ? split : 0 }}
          />
        </g>
      </g>

      {/* Half labels */}
      <motion.text x={CX} y={CY - 24} fontSize="14" fontWeight="700" fill={ML_GREEN} textAnchor="middle"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animate ? settle : 0, duration: 0.4 }}>
        ML Prediction
      </motion.text>
      <motion.text x={CX} y={CY + 34} fontSize="14" fontWeight="700" fill={STRAT_BLUE} textAnchor="middle"
        initial={animate ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animate ? settle + 0.1 : 0, duration: 0.4 }}>
        Strategic Guidance
      </motion.text>

      {/* "PRICING MODEL" below */}
      <motion.text x={CX} y={CY + R + 28} fontSize="11" fontWeight="700" letterSpacing="0.14em"
        fill={NAVY} textAnchor="middle"
        initial={animate ? { opacity: 0, y: CY + R + 20 } : { opacity: 1, y: CY + R + 28 }}
        animate={{ opacity: 1, y: CY + R + 28 }}
        transition={{ delay: animate ? settle + 0.15 : 0, duration: 0.4, ease: "easeOut" }}>
        PRICING MODEL
      </motion.text>

      {/* Pulsing glow */}
      <motion.circle cx={CX} cy={CY - GAP / 2} r={R + 4} fill="none" stroke={ML_GREEN} strokeWidth={1.5}
        clipPath="url(#m-top-half)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: animate ? settle + 0.5 : 0.5 }}
      />
      <motion.circle cx={CX} cy={CY + GAP / 2} r={R + 4} fill="none" stroke={STRAT_BLUE} strokeWidth={1.5}
        clipPath="url(#m-bot-half)"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: animate ? settle + 0.5 : 0.5 }}
      />

      {/* ── Input cards (only when showInputs) ── */}
      {showInputs && (
        <>
          {/* Left side — INTERNAL (appears first) */}
          <motion.text x={LEFT_X} y={CARD_1_Y - 10} fontSize="10" fontWeight="600" letterSpacing="0.12em" fill={NAVY}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }}>
            INTERNAL
          </motion.text>
          {INTERNAL.map((inp, i) => {
            const sx = LEFT_X + CARD_W + 2;
            const sy = inp.y + CARD_H / 2;
            const tx = inp.edgeX;
            const ty = inp.targetY;
            const cardColor = i === 0 ? ML_GREEN : STRAT_BLUE;
            const lineColor = i === 0 ? ML_GREEN : STRAT_BLUE;
            const d = `M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 40} ${ty}, ${tx} ${ty}`;
            const pathParams = { sx, sy, cp1x: sx + 50, cp1y: sy, cp2x: tx - 40, cp2y: ty, ex: tx, ey: ty };
            return (
              <Fragment key={inp.label}>
                <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}>
                  <rect x={LEFT_X} y={inp.y} width={CARD_W} height={CARD_H} rx={10} fill="white" stroke={cardColor} strokeWidth={1.2} />
                  <text x={LEFT_X + CARD_W / 2} y={inp.y + 22} fontSize="12" fontWeight="700" fill={cardColor} textAnchor="middle">{inp.label}</text>
                  <foreignObject x={LEFT_X + 10} y={inp.y + 27} width={CARD_W - 20} height={CARD_H - 30}>
                    <p style={{ fontSize: 10, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
                  </foreignObject>
                </motion.g>
                <motion.path d={d} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }}
                  transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
                />
                <FlowDot path={pathParams} color={lineColor} delay={1.4} />
              </Fragment>
            );
          })}

          {/* Right side — ENVIRONMENTAL (appears second) */}
          <motion.text x={RIGHT_X + CARD_W} y={CARD_1_Y - 10} fontSize="10" fontWeight="600" letterSpacing="0.12em" fill={TEAL} textAnchor="end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}>
            ENVIRONMENTAL
          </motion.text>
          {ENVIRONMENTAL.map((inp, i) => {
            const sx = RIGHT_X - 2;
            const sy = inp.y + CARD_H / 2;
            const tx = inp.edgeX;
            const ty = inp.targetY;
            const cardColor = i === 0 ? ML_GREEN : STRAT_BLUE;
            const lineColor = i === 0 ? ML_GREEN : STRAT_BLUE;
            const d = `M ${sx} ${sy} C ${sx - 50} ${sy}, ${tx + 40} ${ty}, ${tx} ${ty}`;
            const pathParams = { sx, sy, cp1x: sx - 50, cp1y: sy, cp2x: tx + 40, cp2y: ty, ex: tx, ey: ty };
            return (
              <Fragment key={inp.label}>
                <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}>
                  <rect x={RIGHT_X} y={inp.y} width={CARD_W} height={CARD_H} rx={10} fill="white" stroke={cardColor} strokeWidth={1.2} />
                  <text x={RIGHT_X + CARD_W / 2} y={inp.y + 22} fontSize="12" fontWeight="700" fill={cardColor} textAnchor="middle">{inp.label}</text>
                  <foreignObject x={RIGHT_X + 10} y={inp.y + 27} width={CARD_W - 20} height={CARD_H - 30}>
                    <p style={{ fontSize: 10, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
                  </foreignObject>
                </motion.g>
                <motion.path d={d} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }}
                  transition={{ duration: 0.7, delay: 1.8, ease: "easeOut" }}
                />
                <FlowDot path={pathParams} color={lineColor} delay={2.5} />
              </Fragment>
            );
          })}
        </>
      )}
    </svg>
  );
}

interface OneModelSlideProps {
  step: number;
  onAutoAdvance?: () => void;
}

function SplitTransition({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 600),
      setTimeout(onDone, 900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      {/* Top half — splits up then fades */}
      <motion.div
        className="fixed z-50 overflow-hidden"
        style={{ backgroundColor: `${ML_GREEN}0C`, border: `1px solid ${NAVY}12` }}
        initial={{
          left: "calc(50% - 75px)",
          top: "calc(50% - 75px)",
          width: 150,
          height: 75,
          borderRadius: "75px 75px 0 0",
          opacity: 1,
        }}
        animate={
          phase === 0
            ? {
                left: "calc(50% - 75px)",
                top: "calc(50% - 75px)",
                width: 150,
                height: 75,
                borderRadius: "75px 75px 0 0",
                opacity: 1,
              }
            : phase === 1
              ? {
                  left: "calc(50% - 75px)",
                  top: "calc(50% - 135px)",
                  width: 150,
                  height: 75,
                  borderRadius: "75px 75px 4px 4px",
                  opacity: 1,
                }
              : {
                  left: "calc(50% - 75px)",
                  top: "calc(50% - 135px)",
                  width: 150,
                  height: 75,
                  borderRadius: "75px 75px 4px 4px",
                  opacity: 0,
                }
        }
        transition={phase === 2 ? { opacity: { duration: 0.25, ease: "easeOut" } } : { duration: 0.35, ease }}
      />

      {/* Bottom half — splits down then fades */}
      <motion.div
        className="fixed z-50 overflow-hidden"
        style={{ backgroundColor: `${STRAT_BLUE}0C`, border: `1px solid ${NAVY}12` }}
        initial={{
          left: "calc(50% - 75px)",
          top: "50%",
          width: 150,
          height: 75,
          borderRadius: "0 0 75px 75px",
          opacity: 1,
        }}
        animate={
          phase === 0
            ? {
                left: "calc(50% - 75px)",
                top: "50%",
                width: 150,
                height: 75,
                borderRadius: "0 0 75px 75px",
                opacity: 1,
              }
            : phase === 1
              ? {
                  left: "calc(50% - 75px)",
                  top: "calc(50% + 60px)",
                  width: 150,
                  height: 75,
                  borderRadius: "4px 4px 75px 75px",
                  opacity: 1,
                }
              : {
                  left: "calc(50% - 75px)",
                  top: "calc(50% + 60px)",
                  width: 150,
                  height: 75,
                  borderRadius: "4px 4px 75px 75px",
                  opacity: 0,
                }
        }
        transition={phase === 2 ? { opacity: { duration: 0.25, ease: "easeOut" } } : { duration: 0.35, ease }}
      />
    </>
  );
}

export function OneModelSlide({ step, onAutoAdvance }: OneModelSlideProps) {
  const showML = step >= 0;
  const showStrat = step >= 1;
  const showUnified = step >= 2;
  const showInputs = step >= 3;
  const showSplit = step >= 4;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 pt-8 relative">
      <div className="relative mb-1 flex h-5 shrink-0 items-center justify-center overflow-hidden">
        {step === 0 && (
          <motion.span
            className="absolute inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
            animate={{ opacity: [0, 0.4, 0.4, 0], y: [8, 0, 0, -12] }}
            transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }}
          >
            Overview
          </motion.span>
        )}
        <motion.span
          className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
          initial={step === 0 ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: showSplit ? 0 : 1, y: 0 }}
          transition={{ duration: 0.35, delay: step === 0 ? 0.7 : 0 }}
        >
          1 · Design
        </motion.span>
      </div>
      <motion.h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: showSplit ? 0 : 1, y: showSplit ? -8 : 0 }}
        transition={{ duration: showSplit ? 0.3 : 0.6, delay: step === 0 ? 1.1 : 0, ease: "easeOut" }}>
        Core components of the ideal pricing model
      </motion.h2>

      <motion.div
        className="flex min-h-[3rem] items-center justify-center px-4"
        animate={{ opacity: showSplit ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.p key={step >= 4 ? 3 : step} className="max-w-2xl text-center leading-relaxed"
            style={{ color: NAVY, fontSize: "1.15rem" }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, delay: step === 0 ? 1.1 : 0 }}>
            <HighlightNarrative segments={STEP_NARRATIVES[step]} isActive />
          </motion.p>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="relative w-full max-w-5xl flex-1 min-h-0 flex items-start justify-center overflow-hidden pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplit ? 0 : 1 }}
        transition={{ duration: showSplit ? 0.3 : 0.8, delay: step === 0 ? 2.2 : 0 }}
      >
        <AnimatePresence mode="wait">
          {!showUnified && (
            <motion.div key="columns" className="flex w-full items-start justify-center gap-10"
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }}>
              <motion.div className="max-w-[340px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: showML ? 1 : 0, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}>
                <ConceptPanel title="ML Prediction" subtitle="Data-driven statistical analysis"
                  color={ML_GREEN} icon={<ChartIcon />} bullets={ML_BULLETS}
                  visualization={<MLVisualization />} bulletDelay={1.5} />
              </motion.div>
              <motion.div className="max-w-[340px]"
                initial={{ opacity: 0, x: 60, width: 0 }}
                animate={{ opacity: showStrat ? 1 : 0, x: showStrat ? 0 : 60, width: showStrat ? 340 : 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}>
                {showStrat && (
                  <ConceptPanel title="Strategic Guidance" subtitle="Expert knowledge & market intelligence"
                    color={STRAT_BLUE} icon={<CompassIcon />} bullets={STRAT_BULLETS}
                    visualization={<StratVisualization />} bulletDelay={1.3} />
                )}
              </motion.div>
            </motion.div>
          )}
          {showUnified && (
            <motion.div key="unified" className="flex items-center justify-center w-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}>
              <UnifiedModelVisualization showInputs={showInputs} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showSplit && onAutoAdvance && (
        <SplitTransition onDone={onAutoAdvance} />
      )}
    </div>
  );
}
