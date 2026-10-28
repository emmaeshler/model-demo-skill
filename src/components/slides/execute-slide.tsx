"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { useMode } from "@/lib/mode-context";

const NAVY = "#00446A";
const SLATE = "#1B4F72";
const TEAL = "#21A5D5";
const STEEL = "#4A7DAA";
const GREY = "#B8BFC6";
const ORANGE = "#E56910";

export const EXECUTE_TOTAL_STEPS = 4;

/* ── Layout ──────────────────────────────────────────── */

const SVG_W = 1120;
const SVG_H = 440;

const BOX_H = 230;
const PROFILE_BOX_H = 290;

const MODEL_W = BOX_H;
const MODEL_X = 445;
const MODEL_Y = 50;
const MODEL_CX = MODEL_X + MODEL_W / 2;
const MODEL_CY = MODEL_Y + BOX_H / 2;

const PROFILE_W = 265;
const PROFILE_X = 80;

const RESULT_CARD_W = 265;
const RESULT_CARD_X = MODEL_X + MODEL_W + 100;

/* ── Product ─────────────────────────────────────────── */

const PRODUCT_NAME = "Precision Bearing SKU #A-7200";
const LIST_PRICE = "$17.50";

/* ── Customer scenarios ──────────────────────────────── */

interface SliderAttribute {
  label: string;
  value: number;
}

interface CustomerScenario {
  label: string;
  segment: string;
  sliders: SliderAttribute[];
  color: string;
  price: string;
  delta: string;
  winProb: string;
  margin: string;
  narrative: string;
}

const CUSTOMERS: CustomerScenario[] = [
  {
    label: "Acme Industrial",
    segment: "High volume · loyal",
    sliders: [
      { label: "Product Category", value: 0.75 },
      { label: "Geography", value: 0.60 },
      { label: "End Market", value: 0.85 },
      { label: "Product Importance", value: 0.70 },
      { label: "Order Frequency", value: 0.82 },
      { label: "Customer Tenure", value: 0.90 },
      { label: "Competitor Pricing", value: 0.55 },
    ],
    color: NAVY,
    price: "$19.24",
    delta: "+$1.74 above Historical Average",
    winProb: "68%",
    margin: "+9.9%",
    narrative: "Same product, but now the model layers in the customer — high order frequency, long tenure, and strong end market positioning push the price above Historical Average.",
  },
  {
    label: "MedSupply Co",
    segment: "Price-sensitive · contested",
    sliders: [
      { label: "Product Category", value: 0.65 },
      { label: "Geography", value: 0.50 },
      { label: "End Market", value: 0.55 },
      { label: "Product Importance", value: 0.80 },
      { label: "Order Frequency", value: 0.45 },
      { label: "Customer Tenure", value: 0.40 },
      { label: "Competitor Pricing", value: 0.70 },
    ],
    color: TEAL,
    price: "$16.60",
    delta: "−$0.90 below Historical Average",
    winProb: "74%",
    margin: "−1.2%",
    narrative: "Different customer, different answer — high product importance and competitive pressure push the price below Historical Average to protect win rate.",
  },
  {
    label: "QuickParts LLC",
    segment: "Niche need · captive",
    sliders: [
      { label: "Product Category", value: 0.80 },
      { label: "Geography", value: 0.35 },
      { label: "End Market", value: 0.70 },
      { label: "Product Importance", value: 0.90 },
      { label: "Order Frequency", value: 0.22 },
      { label: "Customer Tenure", value: 0.15 },
      { label: "Competitor Pricing", value: 0.20 },
    ],
    color: SLATE,
    price: "$22.10",
    delta: "+$4.60 above Historical Average",
    winProb: "81%",
    margin: "+5.7%",
    narrative: "Same bearing, highest price — this buyer's niche application and high product importance mean few alternatives, driving the price up.",
  },
];

/* ── Bezier helpers ──────────────────────────────────── */

function sampleCubicBezier(
  sx: number, sy: number,
  cp1x: number, cp1y: number,
  cp2x: number, cp2y: number,
  ex: number, ey: number,
  steps: number,
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

function FlowDot({
  path,
  color,
  delay,
}: {
  path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
  color: string;
  delay: number;
}) {
  const { shareMode } = useShareMode();
  const { cxArr, cyArr } = sampleCubicBezier(
    path.sx, path.sy, path.cp1x, path.cp1y, path.cp2x, path.cp2y, path.ex, path.ey, 50,
  );

  if (shareMode) {
    const mid = Math.floor(cxArr.length / 2);
    return <circle r={4} fill={color} cx={cxArr[mid]} cy={cyArr[mid]} opacity={0.5} />;
  }

  return (
    <motion.circle
      r={4}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{
        cx: cxArr,
        cy: cyArr,
        opacity: [0, 0.7, 0.7, 0.7, 0],
      }}
      transition={{ duration: 4.5, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

function factorLabel(label: string, value: number): string {
  const prefix = value >= 0.7 ? "high" : value <= 0.35 ? "low" : "moderate";
  const name = label.toLowerCase();
  return `${prefix} ${name}`;
}

function FlowLabel({
  text,
  path,
  delay,
  duration,
  repeatDelay,
}: {
  text: string;
  path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
  delay: number;
  duration: number;
  repeatDelay: number;
}) {
  const { shareMode } = useShareMode();
  const lifted = { ...path, sy: path.sy - 18, cp1y: path.cp1y - 18, cp2y: path.cp2y - 18, ey: path.ey - 18 };
  const { cxArr, cyArr } = sampleCubicBezier(
    lifted.sx, lifted.sy, lifted.cp1x, lifted.cp1y, lifted.cp2x, lifted.cp2y, lifted.ex, lifted.ey, 40,
  );

  if (shareMode) {
    const mid = Math.floor(cxArr.length / 2);
    return (
      <text fontSize="8.5" fontWeight="500" fontStyle="italic" fill={STEEL} textAnchor="middle" dominantBaseline="auto" x={cxArr[mid]} y={cyArr[mid]} opacity={0.4}>
        {text}
      </text>
    );
  }

  return (
    <motion.text
      fontSize="8.5"
      fontWeight="500"
      fontStyle="italic"
      fill={STEEL}
      textAnchor="middle"
      dominantBaseline="auto"
      initial={{ opacity: 0 }}
      animate={{
        x: cxArr,
        y: cyArr,
        opacity: [0, 0, 0.5, 0.5, 0.5, 0.3, 0.1, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay, ease: "linear" }}
    >
      {text}
    </motion.text>
  );
}

function FlowLabels({
  cust,
  path,
}: {
  cust: CustomerScenario;
  path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
}) {
  const labels = cust.sliders.map(s => factorLabel(s.label, s.value));
  const oneDuration = 4;
  const gap = 2;
  const stagger = oneDuration + gap;
  const totalCycle = stagger * labels.length;
  const perLabelRepeatDelay = totalCycle - oneDuration;

  return (
    <g>
      {labels.map((text, i) => (
        <FlowLabel key={text} text={text} path={path} delay={0.5 + i * stagger} duration={oneDuration} repeatDelay={perLabelRepeatDelay} />
      ))}
    </g>
  );
}

/* ── Slider ↔ Driver color mapping ──────────────────── */

const SLIDER_DRIVER_DOT: Record<string, string> = {
  "Product Category": "#E56910",
  "Geography": "#00446A",
  "End Market": "#00446A",
  "Product Importance": "#E56910",
  "Order Frequency": "#7B5EA7",
  "Customer Tenure": "#00446A",
  "Competitor Pricing": "#2e7d32",
};

const RAIL_DRIVER_LABELS = new Set([
  "Product Category", "Geography", "End Market",
  "Product Importance", "Order Frequency", "Customer Tenure",
  "Competitor Pricing",
]);

/* ── Profile card with sliders (SVG) ─────────────────── */

function ProfileCard({ cust, flyFromRail }: { cust: CustomerScenario; flyFromRail?: boolean }) {
  const { shareMode } = useShareMode();
  const y = MODEL_CY - PROFILE_BOX_H / 2;
  const cx = PROFILE_X + PROFILE_W / 2;
  const SLIDER_X = PROFILE_X + 16;
  const SLIDER_W = PROFILE_W - 32;
  const SPACING = 32;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card frame + header */}
      <motion.g
        initial={shareMode ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <rect
          x={PROFILE_X} y={y} width={PROFILE_W} height={PROFILE_BOX_H}
          rx={14} fill="white" stroke={GREY} strokeWidth={1.5}
        />
        <rect x={PROFILE_X} y={y} width={PROFILE_W} height={34} rx={14} fill={cust.color} />
        <rect x={PROFILE_X} y={y + 20} width={PROFILE_W} height={14} fill={cust.color} />
        <text x={cx} y={y + 16} fontSize="13" fontWeight="700" fill="white" textAnchor="middle">
          {cust.label}
        </text>
        <text x={cx} y={y + 28} fontSize="9" fontWeight="500" fill="rgba(255,255,255,0.7)" textAnchor="middle">
          {cust.segment}
        </text>
      </motion.g>

      {/* Driver rows */}
      {cust.sliders.map((s, si) => {
        const sy = y + 50 + si * SPACING;
        const dotColor = SLIDER_DRIVER_DOT[s.label];
        const isRailDriver = RAIL_DRIVER_LABELS.has(s.label);
        const shouldFlyIn = flyFromRail && isRailDriver && !shareMode;
        const isExtraDriver = flyFromRail && !isRailDriver && !shareMode;
        const isCompetitor = s.label === "Competitor Pricing";

        const flyDelay = 0.12 + si * 0.08;
        const normalDelay = 0.15 + si * 0.06;
        const extraDelay = 0.75;
        const barDelay = shouldFlyIn ? flyDelay + 0.45 : isExtraDriver ? extraDelay + 0.15 : normalDelay + 0.1;

        return (
          <motion.g
            key={s.label}
            initial={
              shareMode ? false
              : shouldFlyIn ? { x: -380, opacity: 0 }
              : isExtraDriver ? { opacity: 0, y: 8 }
              : { opacity: 0, x: -20 }
            }
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={
              shouldFlyIn
                ? { duration: 0.65, delay: flyDelay, ease: [0.22, 1, 0.36, 1] }
                : isExtraDriver
                  ? { duration: 0.4, delay: extraDelay, ease: "easeOut" }
                  : { duration: 0.4, delay: normalDelay, ease: "easeOut" }
            }
          >
            {dotColor && (
              <circle cx={SLIDER_X - 8} cy={sy - 3.5} r={3} fill={dotColor} />
            )}
            <text x={SLIDER_X} y={sy} fontSize="11.5" fontWeight="600" fill="#4A5568">
              {s.label}
            </text>
            <rect x={SLIDER_X} y={sy + 6} width={SLIDER_W} height={6} rx={3} fill="#E8ECF0" />
            <motion.rect
              x={SLIDER_X} y={sy + 6} height={6} rx={3} fill={dotColor || ORANGE}
              initial={shareMode ? false : { width: isCompetitor ? SLIDER_W : 0 }}
              animate={{ width: SLIDER_W * s.value }}
              transition={{
                duration: isCompetitor ? 0.7 : 0.5,
                delay: barDelay,
                ease: "easeOut",
              }}
            />
            <motion.circle
              cy={sy + 9} r={5} fill="white" stroke={dotColor || ORANGE} strokeWidth={2}
              initial={shareMode ? false : { cx: isCompetitor ? SLIDER_X + SLIDER_W : SLIDER_X }}
              animate={{ cx: SLIDER_X + SLIDER_W * s.value }}
              transition={{
                duration: isCompetitor ? 0.7 : 0.5,
                delay: barDelay,
                ease: "easeOut",
              }}
            />
          </motion.g>
        );
      })}
    </motion.g>
  );
}

/* ── Result card ─────────────────────────────────────── */

function ResultCard({ cust }: { cust: CustomerScenario }) {
  const { shareMode } = useShareMode();
  const y = MODEL_CY - PROFILE_BOX_H / 2;
  const cx = RESULT_CARD_X + RESULT_CARD_W / 2;
  return (
    <motion.g
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
    >
      <rect
        x={RESULT_CARD_X} y={y} width={RESULT_CARD_W} height={PROFILE_BOX_H}
        rx={14} fill="white" stroke={STEEL} strokeWidth={1.5}
      />
      <text x={cx} y={y + 30} fontSize="12" fontWeight="600" fill="#4A5568" textAnchor="middle">
        Recommended price
      </text>
      <motion.text
        x={cx} y={y + 88} fontSize="42" fontWeight="800" fill={ORANGE} textAnchor="middle"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shareMode ? { duration: 0.25, delay: 0.35 } : { duration: 0.4, delay: 0.35, type: "spring", stiffness: 200 }}
      >
        {cust.price}
      </motion.text>
      <motion.text
        x={cx} y={y + 116} fontSize="13" fontWeight="600" textAnchor="middle"
        fill={cust.price > LIST_PRICE ? "#2e7d32" : "#c62828"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {cust.delta}
      </motion.text>

      <line x1={RESULT_CARD_X + 20} y1={y + 140} x2={RESULT_CARD_X + RESULT_CARD_W - 20} y2={y + 140} stroke="#E8ECF0" strokeWidth={1} />

      <text x={RESULT_CARD_X + 24} y={y + 172} fontSize="12" fontWeight="500" fill="#4A5568">
        Win probability
      </text>
      <text x={RESULT_CARD_X + RESULT_CARD_W - 24} y={y + 172} fontSize="15" fontWeight="700" fill={cust.color} textAnchor="end">
        {cust.winProb}
      </text>

      <text x={RESULT_CARD_X + 24} y={y + 206} fontSize="12" fontWeight="500" fill="#4A5568">
        Margin impact
      </text>
      <text x={RESULT_CARD_X + RESULT_CARD_W - 24} y={y + 206} fontSize="15" fontWeight="700" fill={cust.color} textAnchor="end">
        {cust.margin}
      </text>

      {/* List price reference */}
      <line x1={RESULT_CARD_X + 20} y1={y + 234} x2={RESULT_CARD_X + RESULT_CARD_W - 20} y2={y + 234} stroke="#E8ECF0" strokeWidth={1} />
      <text x={cx} y={y + 258} fontSize="10" fontWeight="500" fill={GREY} textAnchor="middle">
        List: {LIST_PRICE} / unit
      </text>
    </motion.g>
  );
}

/* ── Model overview with animated input→output flow (step 0) ── */

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

const OV_W = 960;
const OV_H = 340;
const OV_R = 68;
const OV_CY = 170;
const OV_CX = 460;
const OV_IN_W = 210;
const OV_IN_H = 50;
const OV_OUT_W = 195;
const OV_OUT_H = 52;
const OV_OUT_X = 600;

const OV_INPUTS = [
  { label: "Internal Data", sub: "Millions of transactions scanned for patterns", section: 0, color: ML_GREEN },
  { label: "Business Objectives", sub: "Business rules that shape strategic guidance", section: 0, color: STRAT_BLUE },
  { label: "External Data", sub: "Market signals driving competitive position", section: 1, color: ML_GREEN },
  { label: "Industry Expertise", sub: "Benchmarks behind the pricing drivers", section: 1, color: STRAT_BLUE },
];

const OV_OUTPUTS = [
  { label: "Calibrated Price", sub: "Scenario-specific guidance" },
  { label: "Win Probability", sub: "Likelihood at recommended price" },
  { label: "Margin Impact", sub: "Projected uplift vs. current" },
  { label: "Confidence Score", sub: "Statistical certainty range" },
];

const OV_INPUT_POS = [
  { x: 40, y: 26 },
  { x: 40, y: 94 },
  { x: 40, y: 178 },
  { x: 40, y: 246 },
];

const OV_OUT_POS = [
  { y: 15 },
  { y: 82 },
  { y: 149 },
  { y: 216 },
];

const GHOST_OPACITY = 0.1;

export function ModelOutputsOverview({ step }: { step: number }) {
  const { shareMode } = useShareMode();
  const showOutputs = step >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 relative">
      <div style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
        <motion.h2
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: NAVY }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          What the model produces
        </motion.h2>
      </div>

      <div className="flex min-h-[3.5rem] items-center justify-center px-4 mb-1" style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
        <AnimatePresence mode="wait">
          {!showOutputs ? (
            <motion.p
              key="inputs"
              className="max-w-2xl text-center text-[1.05rem] leading-relaxed"
              style={{ color: NAVY }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              The data patterns, business rules, and market signals we&#39;ve explored all{" "}
              <span style={{ fontWeight: 600, color: STEEL }}>feed directly into the pricing model</span>.
            </motion.p>
          ) : (
            <motion.p
              key="outputs"
              className="max-w-2xl text-center text-[1.05rem] leading-relaxed"
              style={{ color: NAVY }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              Through <span style={{ fontWeight: 600, color: ML_GREEN }}>ML prediction</span> and{" "}
              <span style={{ fontWeight: 600, color: STRAT_BLUE }}>strategic guidance</span>, these inputs become{" "}
              <span style={{ fontWeight: 700, color: STEEL }}>evidence-based pricing outputs</span>
              {" "}— not just a number, but the conviction behind it.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="relative w-full max-w-5xl flex-1 min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <svg viewBox={`0 0 ${OV_W} ${OV_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <clipPath id="ov-clip-top">
              <rect x={0} y={0} width={OV_W} height={OV_CY} />
            </clipPath>
            <clipPath id="ov-clip-bottom">
              <rect x={0} y={OV_CY} width={OV_W} height={OV_H} />
            </clipPath>
          </defs>

          {/* ── Input section (ghosts when showOutputs) ── */}
          {/* Section headers */}
          <motion.text
            x={40} y={18} fontSize="10" fontWeight="600" letterSpacing="0.12em" fill={NAVY}
            initial={{ opacity: 0 }}
            animate={{ opacity: showOutputs ? GHOST_OPACITY : 1 }}
            transition={{ duration: 0.6, delay: showOutputs ? 0 : 0.1 }}
          >
            INTERNAL
          </motion.text>
          <motion.text
            x={40} y={170} fontSize="10" fontWeight="600" letterSpacing="0.12em" fill={TEAL}
            initial={{ opacity: 0 }}
            animate={{ opacity: showOutputs ? GHOST_OPACITY : 1 }}
            transition={{ duration: 0.6, delay: showOutputs ? 0 : 0.3 }}
          >
            ENVIRONMENTAL
          </motion.text>

          {/* Input cards */}
          {OV_INPUTS.map((inp, i) => {
            const pos = OV_INPUT_POS[i];
            return (
              <g key={inp.label} transform={`translate(${pos.x}, ${pos.y})`}>
                <motion.g
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: showOutputs ? GHOST_OPACITY : 1, x: 0 }}
                  transition={{ duration: 0.6, delay: showOutputs ? 0 : 0.15 + i * 0.1, ease: "easeOut" }}
                >
                  <rect x={0} y={0} width={OV_IN_W} height={OV_IN_H} rx={10} fill="white" stroke={inp.color} strokeWidth={1.2} />
                  <text x={OV_IN_W / 2} y={18} fontSize="11" fontWeight="700" fill={inp.color} textAnchor="middle">{inp.label}</text>
                  <foreignObject x={8} y={23} width={OV_IN_W - 16} height={24}>
                    <p style={{ fontSize: 9, lineHeight: 1.4, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.sub}</p>
                  </foreignObject>
                </motion.g>
              </g>
            );
          })}

          {/* Input curves */}
          {OV_INPUT_POS.map((pos, i) => {
            const sx = pos.x + OV_IN_W;
            const sy = pos.y + OV_IN_H / 2;
            const ex = OV_CX - OV_R;
            const d = `M ${sx} ${sy} C ${sx + 50} ${sy}, ${ex - 50} ${OV_CY}, ${ex} ${OV_CY}`;
            const pathObj = { sx, sy, cp1x: sx + 50, cp1y: sy, cp2x: ex - 50, cp2y: OV_CY, ex, ey: OV_CY };
            return (
              <g key={`in-curve-${i}`}>
                <motion.path
                  d={d} fill="none" stroke={OV_INPUTS[i].color} strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: showOutputs ? GHOST_OPACITY * 0.5 : 0.3 }}
                  transition={{ duration: showOutputs ? 0.6 : 1, delay: showOutputs ? 0 : 0.6 + i * 0.12, ease: "easeOut" }}
                />
                {!showOutputs && <FlowDot path={pathObj} color={OV_INPUTS[i].color} delay={1.4 + i * 0.7} />}
              </g>
            );
          })}

          {/* ── Model circle (always visible) ── */}
          <motion.circle
            cx={OV_CX} cy={OV_CY} r={OV_R + 5}
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3.5, repeat: shareMode ? 0 : Infinity, ease: "easeInOut", delay: 0.8 }}
          />

          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: `${OV_CX}px ${OV_CY}px` }}
          >
            <circle cx={OV_CX} cy={OV_CY} r={OV_R} fill="#E8EEE8" stroke="rgba(0,0,0,0.08)" strokeWidth={1.5} />
            <circle cx={OV_CX} cy={OV_CY} r={OV_R - 1} fill="#D5E6D0" clipPath="url(#ov-clip-top)" />
            <circle cx={OV_CX} cy={OV_CY} r={OV_R - 1} fill="#D4E8F0" clipPath="url(#ov-clip-bottom)" />
            <text x={OV_CX} y={OV_CY - 42} fontSize="9" fontWeight="700" letterSpacing="0.14em" fill="rgba(0,0,0,0.35)" textAnchor="middle">PRICING MODEL</text>
            <line x1={OV_CX - OV_R + 18} y1={OV_CY} x2={OV_CX + OV_R - 18} y2={OV_CY} stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} />
            <text x={OV_CX} y={OV_CY - 14} fontSize="13" fontWeight="700" fill={ML_GREEN} textAnchor="middle">ML Prediction</text>
            <text x={OV_CX} y={OV_CY + 26} fontSize="13" fontWeight="700" fill={STRAT_BLUE} textAnchor="middle">Strategic Guidance</text>
          </motion.g>

          {/* ── Output section (fades in when showOutputs) ── */}
          <motion.text
            x={OV_OUT_X + OV_OUT_W} y={7}
            fontSize="10" fontWeight="600" letterSpacing="0.12em" fill={GREY} textAnchor="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: showOutputs ? 1 : 0 }}
            transition={{ duration: 0.4, delay: showOutputs ? 0.2 : 0 }}
          >
            MODEL OUTPUTS
          </motion.text>

          {OV_OUTPUTS.map((out, i) => {
            const oy = OV_OUT_POS[i].y;
            const sx = OV_CX + OV_R;
            const ey = oy + OV_OUT_H / 2;
            const d = `M ${sx} ${OV_CY} C ${sx + 50} ${OV_CY}, ${OV_OUT_X - 50} ${ey}, ${OV_OUT_X} ${ey}`;
            const pathObj = { sx, sy: OV_CY, cp1x: sx + 50, cp1y: OV_CY, cp2x: OV_OUT_X - 50, cp2y: ey, ex: OV_OUT_X, ey };
            const stagger = 0.3 + i * 0.15;
            return (
              <g key={out.label}>
                <motion.path
                  d={d} fill="none" stroke={STEEL} strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: showOutputs ? 1 : 0, opacity: showOutputs ? 0.35 : 0 }}
                  transition={{ duration: 0.8, delay: showOutputs ? stagger : 0, ease: "easeOut" }}
                />
                {showOutputs && <FlowDot path={pathObj} color={STEEL} delay={stagger + 1.0} />}
                <motion.g
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: showOutputs ? 1 : 0, x: showOutputs ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: showOutputs ? stagger + 0.2 : 0, ease: "easeOut" }}
                >
                  <rect x={OV_OUT_X} y={oy} width={OV_OUT_W} height={OV_OUT_H} rx={10} fill="white" stroke={STEEL} strokeWidth={1.2} />
                  <text x={OV_OUT_X + OV_OUT_W / 2} y={oy + OV_OUT_H / 2 - 6} fontSize="13" fontWeight="700" fill={STEEL} textAnchor="middle">{out.label}</text>
                  <foreignObject x={OV_OUT_X + 10} y={oy + OV_OUT_H / 2 + 2} width={OV_OUT_W - 20} height={OV_OUT_H / 2 - 4}>
                    <p style={{ fontSize: 10, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{out.sub}</p>
                  </foreignObject>
                </motion.g>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}

/* ── Main slide ──────────────────────────────────────── */

export function ExecuteSlide({
  step,
  skipAnimation,
  onCustomerChange,
  hideRailRef,
  isActive,
  fromCollapse,
}: {
  step: number;
  onAnimationDone?: () => void;
  skipAnimation?: boolean;
  onCustomerChange?: (customer: string) => void;
  hideRailRef?: { current: () => void };
  isActive: boolean;
  fromCollapse?: boolean;
}) {
  const { mode } = useMode();
  const { shareMode } = useShareMode();
  const isPresenter = mode === "presenter";
  const [selected, setSelected] = useState(0);
  const [revealPhase, setRevealPhase] = useState(skipAnimation ? 4 : 1);
  const hasInteracted = useRef(false);
  const initialRevealDone = useRef(skipAnimation);
  const didCollapse = useRef(!!fromCollapse);
  if (fromCollapse) didCollapse.current = true;
  const cust = CUSTOMERS[selected];

  useEffect(() => {
    if (!isActive) return;
    onCustomerChange?.(cust.label.split(" ")[0]);
  }, [selected, cust.label, onCustomerChange, isActive]);

  const selfMaxPhase = step === 0 ? 3 : 4;

  useEffect(() => {
    if (!isActive) {
      setRevealPhase(1);
      setSelected(0);
      hasInteracted.current = false;
      initialRevealDone.current = false;
      didCollapse.current = false;
      return;
    }
    if (step >= 1) {
      setRevealPhase(4);
    } else {
      setRevealPhase(skipAnimation ? selfMaxPhase : 1);
    }
  }, [step, skipAnimation, isPresenter, selfMaxPhase, isActive]);

  useEffect(() => {
    if (revealPhase >= 2 && !initialRevealDone.current) {
      initialRevealDone.current = true;
    }
    if (isActive && revealPhase >= 2 && hideRailRef) {
      hideRailRef.current();
    }
  }, [revealPhase, isActive, hideRailRef]);

  useEffect(() => {
    if (!isActive) return;
    if (step >= 1 && step <= CUSTOMERS.length) {
      setSelected(step - 1);
    }
  }, [step, isActive]);

  useEffect(() => {
    if (!isActive) return;
    if (step > 0 || revealPhase >= selfMaxPhase) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setRevealPhase(p => Math.min(p + 1, selfMaxPhase));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (revealPhase <= 1) return;
        e.preventDefault();
        e.stopPropagation();
        setRevealPhase(p => p - 1);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [revealPhase, step, isActive]);

  const inCurvePath = () => {
    const sy = MODEL_CY;
    const sx = PROFILE_X + PROFILE_W;
    return `M ${sx} ${sy} C ${sx + 40} ${sy}, ${MODEL_X - 40} ${MODEL_CY}, ${MODEL_X} ${MODEL_CY}`;
  };

  const outCurvePath = () => {
    return `M ${MODEL_X + MODEL_W} ${MODEL_CY} C ${MODEL_X + MODEL_W + 40} ${MODEL_CY}, ${RESULT_CARD_X - 40} ${MODEL_CY}, ${RESULT_CARD_X} ${MODEL_CY}`;
  };

  const inPathObj = {
    sx: PROFILE_X + PROFILE_W, sy: MODEL_CY,
    cp1x: PROFILE_X + PROFILE_W + 40, cp1y: MODEL_CY,
    cp2x: MODEL_X - 40, cp2y: MODEL_CY,
    ex: MODEL_X, ey: MODEL_CY,
  };

  const outPathObj = {
    sx: MODEL_X + MODEL_W, sy: MODEL_CY,
    cp1x: MODEL_X + MODEL_W + 40, cp1y: MODEL_CY,
    cp2x: RESULT_CARD_X - 40, cp2y: MODEL_CY,
    ex: RESULT_CARD_X, ey: MODEL_CY,
  };

  return (
        <motion.div
          key="action"
          initial={(skipAnimation || didCollapse.current) ? false : { opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: didCollapse.current ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 relative ${isPresenter ? "pt-2" : "pt-8"}`}
        >
          {/* Title */}
          <div style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`reveal-title-${revealPhase <= 1 ? 1 : revealPhase >= 4 ? 4 : revealPhase}`}
                className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: NAVY }}
                initial={skipAnimation ? false : { opacity: 0, y: didCollapse.current ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: didCollapse.current ? 0.5 : 0.4, delay: didCollapse.current ? 0.35 : 0 }}
              >
                {revealPhase <= 1
                  ? "Applying the optimized price at the customer order level"
                  : revealPhase === 2
                    ? "Acme’s drivers feed the pricing model"
                    : revealPhase === 3
                      ? "A price tailored to Acme emerges"
                      : "The ideal price, adjusted for each customer"}
              </motion.h2>
            </AnimatePresence>
          </div>

          {/* Narrative area */}
          <div style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
            <motion.div
              className={`flex min-h-[3rem] items-center justify-center px-4 ${isPresenter ? "mb-1" : "mb-4"}`}
              initial={skipAnimation ? false : { opacity: 0, y: didCollapse.current ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: didCollapse.current ? 0.5 : 0.4, delay: didCollapse.current ? 0.45 : 0.5 }}
            >
            <AnimatePresence mode="wait">
              <motion.p
                key={revealPhase >= 4 ? `cust-${selected}` : `reveal-sub-${revealPhase <= 1 ? 1 : revealPhase}`}
                className="max-w-2xl text-center text-[1.05rem] leading-relaxed"
                style={{ color: NAVY }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {revealPhase <= 1
                  ? "The model starts with one optimized price per SKU — then adjusts for each customer order's unique factors."
                  : revealPhase === 2
                    ? "The model weighs each factor to calculate Acme’s calibrated price."
                    : revealPhase === 3
                      ? <>{cust.price} — sales relationship, order frequency, and tenure push the price{" "}<span style={{ fontWeight: 700, color: cust.price > LIST_PRICE ? "#2e7d32" : "#c62828", whiteSpace: "nowrap" }}>{cust.delta}</span>.</>
                      : cust.narrative}
              </motion.p>
            </AnimatePresence>
            </motion.div>
          </div>

          {/* Diagram + chips wrapper */}
          <div className="flex w-full flex-1 min-h-0 flex-col items-center" style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
          <div className="relative w-full flex-1 min-h-0 overflow-hidden">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">

                  {/* Pricing model circle */}
                  <g>
                    {/* Shrink-in pulse ring (converge echo) — plays when drivers arrive */}
                    {!skipAnimation && revealPhase >= 2 && (
                      <motion.circle
                        cx={MODEL_CX} cy={MODEL_CY} r={155}
                        fill="none" stroke={TEAL} strokeWidth={2}
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: 0, scale: 0.65 }}
                        transition={{ duration: 0.9, ease: "easeIn" }}
                        style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                      />
                    )}

                    <motion.g
                      initial={didCollapse.current ? { scale: 1.15, y: 12 } : false}
                      animate={{ scale: 1, y: 0 }}
                      transition={didCollapse.current ? { duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    >
                      <motion.circle
                        cx={MODEL_CX} cy={MODEL_CY}
                        fill="white" stroke={TEAL} strokeWidth={2.5}
                        initial={{ r: BOX_H / 2 }}
                        animate={{ r: BOX_H / 2 }}
                      />

                      {/* Converge echo — stays until Acme drivers arrive */}
                      <motion.g
                        initial={{ opacity: (skipAnimation && !didCollapse.current) ? 0 : 0.9 }}
                        animate={{ opacity: revealPhase >= 2 ? 0 : 1 }}
                        transition={{ duration: revealPhase >= 2 ? 0.35 : 0.4 }}
                      >
                        <text x={MODEL_CX} y={MODEL_CY - 28} textAnchor="middle"
                          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fill: "#5A6A78" }}>
                          OPTIMIZED
                        </text>
                        <text x={MODEL_CX} y={MODEL_CY + 14} textAnchor="middle"
                          style={{ fontSize: 38, fontWeight: 800, fill: NAVY }}>
                          PRICE
                        </text>
                        <text x={MODEL_CX} y={MODEL_CY + 36} textAnchor="middle"
                          style={{ fontSize: 13, fontWeight: 500, fill: "#5A6A78" }}>
                          per SKU
                        </text>
                      </motion.g>

                      <motion.g
                        initial={false}
                        animate={isActive && revealPhase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.4, delay: isActive && revealPhase >= 2 ? 0.25 : 0 }}
                      >
                        {/* Chip above circle */}
                        <rect x={MODEL_CX - 58} y={MODEL_CY - 82} width={116} height={26} rx={13} fill={NAVY} />
                        <text x={MODEL_CX} y={MODEL_CY - 64} fontSize="12" fontWeight="700" fill="white" textAnchor="middle">
                          Pricing model
                        </text>

                        <text x={MODEL_CX} y={MODEL_CY - 28} textAnchor="middle"
                          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fill: "#5A6A78" }}>
                          OPTIMIZED SKU
                        </text>
                        <text x={MODEL_CX} y={MODEL_CY + 14} textAnchor="middle"
                          style={{ fontSize: 38, fontWeight: 800, fill: NAVY }}>
                          PRICE
                        </text>
                        <text x={MODEL_CX} y={MODEL_CY + 36} textAnchor="middle"
                          style={{ fontSize: 12, fontWeight: 500, fill: "#5A6A78" }}>
                          SKU #A-7200
                        </text>

                      </motion.g>

                      {/* Subtitle below outer circle */}
                      <motion.text
                        x={MODEL_CX} y={MODEL_CY + BOX_H / 2 + 18}
                        fontSize="10" fontWeight="500" fill={TEAL} textAnchor="middle"
                        initial={false}
                        animate={isActive && revealPhase >= 2 ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.4, delay: isActive ? (skipAnimation ? 0.3 : 0.8) : 0 }}
                      >
                        ML-powered optimization
                      </motion.text>
                    </motion.g>

                  </g>

                  {/* Skeleton layout — frames the flow before data arrives */}
                  <AnimatePresence>
                    {revealPhase < 2 && (
                      <motion.g
                        key="skeleton"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Left: Customer drivers ghost card */}
                        <motion.g
                          initial={skipAnimation ? false : { opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: didCollapse.current ? 0.55 : 0.3 }}
                        >
                          <rect x={PROFILE_X} y={MODEL_CY - PROFILE_BOX_H / 2} width={PROFILE_W} height={PROFILE_BOX_H}
                            rx={14} fill="white" stroke={GREY} strokeWidth={1.2} strokeDasharray="6 4" opacity={0.6} />
                          <text x={PROFILE_X + PROFILE_W / 2} y={MODEL_CY - PROFILE_BOX_H / 2 + 24}
                            fontSize="10" fontWeight="700" letterSpacing="0.1em" fill={GREY} textAnchor="middle">
                            CUSTOMER DRIVERS
                          </text>
                          {[0, 1, 2, 3, 4, 5].map(i => {
                            const sy = MODEL_CY - PROFILE_BOX_H / 2 + 48 + i * 38;
                            return (
                              <g key={`skel-row-${i}`}>
                                <rect x={PROFILE_X + 20} y={sy} width={65 + (i % 3) * 20} height={8} rx={4} fill={GREY} opacity={0.12} />
                                <rect x={PROFILE_X + 20} y={sy + 14} width={PROFILE_W - 40} height={5} rx={2.5} fill={GREY} opacity={0.08} />
                              </g>
                            );
                          })}
                        </motion.g>

                        {/* Connector left */}
                        <motion.path
                          d={inCurvePath()}
                          fill="none" stroke={GREY} strokeWidth={1.2} strokeDasharray="4 4"
                          initial={skipAnimation ? false : { opacity: 0 }}
                          animate={{ opacity: 0.25 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                        />
                        <motion.text
                          x={(PROFILE_X + PROFILE_W + MODEL_X) / 2} y={MODEL_CY + 5}
                          fontSize="16" fill={GREY} textAnchor="middle"
                          initial={skipAnimation ? false : { opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          transition={{ delay: 0.6 }}
                        >
                          →
                        </motion.text>

                        {/* Right: Outcome price ghost card */}
                        <motion.g
                          initial={skipAnimation ? false : { opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: didCollapse.current ? 0.65 : 0.4 }}
                        >
                          <rect x={RESULT_CARD_X} y={MODEL_CY - PROFILE_BOX_H / 2} width={RESULT_CARD_W} height={PROFILE_BOX_H}
                            rx={14} fill="white" stroke={GREY} strokeWidth={1.2} strokeDasharray="6 4" opacity={0.6} />
                          <text x={RESULT_CARD_X + RESULT_CARD_W / 2} y={MODEL_CY - PROFILE_BOX_H / 2 + 24}
                            fontSize="10" fontWeight="700" letterSpacing="0.1em" fill={GREY} textAnchor="middle">
                            OUTCOME PRICE
                          </text>
                          <rect x={RESULT_CARD_X + 50} y={MODEL_CY - 14} width={RESULT_CARD_W - 100} height={24} rx={6} fill={GREY} opacity={0.08} />
                          <rect x={RESULT_CARD_X + 70} y={MODEL_CY + 22} width={RESULT_CARD_W - 140} height={8} rx={4} fill={GREY} opacity={0.08} />
                          <line x1={RESULT_CARD_X + 20} y1={MODEL_CY + 50} x2={RESULT_CARD_X + RESULT_CARD_W - 20} y2={MODEL_CY + 50} stroke={GREY} strokeWidth={0.5} opacity={0.2} />
                          <rect x={RESULT_CARD_X + 24} y={MODEL_CY + 64} width={80} height={7} rx={3.5} fill={GREY} opacity={0.08} />
                          <rect x={RESULT_CARD_X + 24} y={MODEL_CY + 84} width={65} height={7} rx={3.5} fill={GREY} opacity={0.08} />
                        </motion.g>

                        {/* Connector right */}
                        <motion.path
                          d={outCurvePath()}
                          fill="none" stroke={GREY} strokeWidth={1.2} strokeDasharray="4 4"
                          initial={skipAnimation ? false : { opacity: 0 }}
                          animate={{ opacity: 0.25 }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                        />
                        <motion.text
                          x={(MODEL_X + MODEL_W + RESULT_CARD_X) / 2} y={MODEL_CY + 5}
                          fontSize="16" fill={GREY} textAnchor="middle"
                          initial={skipAnimation ? false : { opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          transition={{ delay: 0.7 }}
                        >
                          →
                        </motion.text>
                      </motion.g>
                    )}
                  </AnimatePresence>

                  {/* Interactive elements — staged reveal */}
                  <>
                    {/* Phase 2: Profile card (left) + flow into model + spinning ring */}
                    {revealPhase >= 2 && (
                      <>
                        <AnimatePresence mode="wait">
                          <ProfileCard key={selected} cust={cust} flyFromRail={!initialRevealDone.current} />
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                          <motion.g key={`flow-${selected}`}>
                            <motion.path
                              d={inCurvePath()}
                              fill="none" stroke={cust.color} strokeWidth={1.5} strokeLinecap="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.35 }}
                              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                            />
                            {/* Stream of dots flowing from profile into model */}
                            {[0, 0.8, 1.6, 2.4, 3.2].map((d, i) => (
                              <FlowDot key={`in-dot-${i}`} path={inPathObj} color={ORANGE} delay={0.3 + d} />
                            ))}
                            <FlowLabels cust={cust} path={inPathObj} />
                          </motion.g>
                        </AnimatePresence>
                        {/* Absorption pulse on the model circle */}
                        {(revealPhase === 2 || revealPhase === 3) && (
                          <motion.circle
                            cx={MODEL_CX} cy={MODEL_CY}
                            r={BOX_H / 2}
                            fill="none" stroke={ORANGE} strokeWidth={3}
                            animate={{ r: [BOX_H / 2, BOX_H / 2 - 4, BOX_H / 2], opacity: [0.15, 0.4, 0.15] }}
                            transition={{ duration: 1.8, repeat: shareMode ? 0 : Infinity, ease: "easeInOut" }}
                          />
                        )}
                      </>
                    )}

                    {/* Phase 3: Result card + out-flow */}
                    {revealPhase >= 3 && (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.g key={`outflow-${selected}`}>
                            <motion.path
                              d={outCurvePath()}
                              fill="none" stroke={STEEL} strokeWidth={1.5} strokeLinecap="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 0.35 }}
                              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            />
                            <FlowDot path={outPathObj} color={ORANGE} delay={0.5} />
                          </motion.g>
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                          <ResultCard key={selected} cust={cust} />
                        </AnimatePresence>
                      </>
                    )}

                    {/* Connector line — phase 4 */}
                    {revealPhase >= 4 && (
                      <motion.line
                        x1={MODEL_CX} y1={MODEL_Y + BOX_H}
                        x2={MODEL_CX} y2={MODEL_Y + BOX_H + 24}
                        stroke={GREY} strokeWidth={1} strokeDasharray="3 3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}

                    {/* Customer chips inside SVG */}
                    {revealPhase >= 4 && (
                      <foreignObject x={MODEL_CX - 200} y={MODEL_Y + BOX_H + 26} width={400} height={40}>
                        <motion.div
                          className="flex items-center justify-center gap-3"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                          {CUSTOMERS.map((c, ci) => {
                            const isSelected = ci === selected;
                            return (
                              <motion.button
                                key={c.label}
                                onClick={() => { hasInteracted.current = true; setSelected(ci); }}
                                style={{
                                  borderRadius: 9999,
                                  padding: "4px 14px",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  background: isSelected ? c.color : "white",
                                  border: `${isSelected ? 2 : 1.2}px solid ${c.color}`,
                                  color: isSelected ? "white" : c.color,
                                }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                              >
                                {c.label}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </foreignObject>
                    )}
                  </>

            </svg>
          </div>


          </div>
        </motion.div>
  );
}
