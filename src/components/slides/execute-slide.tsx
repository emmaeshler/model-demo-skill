"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const SLATE = "#1B4F72";
const TEAL = "#21A5D5";
const STEEL = "#4A7DAA";
const GREY = "#B8BFC6";

export const EXECUTE_TOTAL_STEPS = 1;

/* ── Layout ──────────────────────────────────────────── */

const SVG_W = 960;
const SVG_H = 380;

const BOX_H = 200;

const MODEL_W = 230;
const MODEL_X = 365;
const MODEL_Y = 25;
const MODEL_CX = MODEL_X + MODEL_W / 2;
const MODEL_CY = MODEL_Y + BOX_H / 2;

const PROFILE_W = 260;
const PROFILE_X = 18;

const RESULT_CARD_W = 220;
const RESULT_CARD_X = MODEL_X + MODEL_W + 70;

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
      { label: "Order volume", value: 0.82 },
      { label: "Product specificity", value: 0.88 },
      { label: "Price sensitivity", value: 0.30 },
      { label: "Relationship depth", value: 0.90 },
    ],
    color: NAVY,
    price: "$19.24",
    delta: "+$1.74 above list",
    winProb: "68%",
    margin: "+9.9%",
    narrative: "Same product, but now the model layers in the customer — volume commitment, relationship depth, and win history push the price above list.",
  },
  {
    label: "MedSupply Co",
    segment: "Price-sensitive · contested",
    sliders: [
      { label: "Order volume", value: 0.45 },
      { label: "Product specificity", value: 0.20 },
      { label: "Price sensitivity", value: 0.75 },
      { label: "Relationship depth", value: 0.40 },
    ],
    color: TEAL,
    price: "$14.89",
    delta: "−$2.61 below list",
    winProb: "74%",
    margin: "+3.2%",
    narrative: "Different customer, different answer — high price sensitivity and competitive pressure pull the price below list to protect win rate.",
  },
  {
    label: "QuickParts LLC",
    segment: "Niche need · captive",
    sliders: [
      { label: "Order volume", value: 0.22 },
      { label: "Product specificity", value: 0.55 },
      { label: "Price sensitivity", value: 0.85 },
      { label: "Relationship depth", value: 0.15 },
    ],
    color: SLATE,
    price: "$22.10",
    delta: "+$4.60 above list",
    winProb: "81%",
    margin: "+5.7%",
    narrative: "Same bearing, highest price — this buyer's niche application has few alternatives, so willingness to pay is the strongest of the three.",
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
  const { cxArr, cyArr } = sampleCubicBezier(
    path.sx, path.sy, path.cp1x, path.cp1y, path.cp2x, path.cp2y, path.ex, path.ey, 50,
  );

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

/* ── Profile card with sliders (SVG) ─────────────────── */

function ProfileCard({ cust }: { cust: CustomerScenario }) {
  const y = MODEL_CY - BOX_H / 2;
  const cx = PROFILE_X + PROFILE_W / 2;
  const SLIDER_X = PROFILE_X + 16;
  const SLIDER_W = PROFILE_W - 32;

  return (
    <motion.g
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <rect
        x={PROFILE_X} y={y} width={PROFILE_W} height={BOX_H}
        rx={14} fill="white" stroke={cust.color} strokeWidth={1.5}
      />
      <rect x={PROFILE_X} y={y} width={PROFILE_W} height={34} rx={14} fill={cust.color} />
      <rect x={PROFILE_X} y={y + 20} width={PROFILE_W} height={14} fill={cust.color} />
      <text x={cx} y={y + 16} fontSize="13" fontWeight="700" fill="white" textAnchor="middle">
        {cust.label}
      </text>
      <text x={cx} y={y + 28} fontSize="9" fontWeight="500" fill="rgba(255,255,255,0.7)" textAnchor="middle">
        {cust.segment}
      </text>

      {cust.sliders.map((s, si) => {
        const sy = y + 52 + si * 38;
        return (
          <g key={s.label}>
            <text x={SLIDER_X} y={sy} fontSize="9.5" fontWeight="600" fill="#4A5568">
              {s.label}
            </text>
            <rect x={SLIDER_X} y={sy + 6} width={SLIDER_W} height={6} rx={3} fill="#E8ECF0" />
            <motion.rect
              x={SLIDER_X} y={sy + 6} height={6} rx={3} fill={cust.color}
              initial={{ width: 0 }}
              animate={{ width: SLIDER_W * s.value }}
              transition={{ duration: 0.6, delay: 0.15 + si * 0.08, ease: "easeOut" }}
            />
            <motion.circle
              cy={sy + 9} r={5} fill="white" stroke={cust.color} strokeWidth={2}
              initial={{ cx: SLIDER_X }}
              animate={{ cx: SLIDER_X + SLIDER_W * s.value }}
              transition={{ duration: 0.6, delay: 0.15 + si * 0.08, ease: "easeOut" }}
            />
          </g>
        );
      })}
    </motion.g>
  );
}

/* ── Result card ─────────────────────────────────────── */

function ResultCard({ cust }: { cust: CustomerScenario }) {
  const y = MODEL_CY - BOX_H / 2;
  const cx = RESULT_CARD_X + RESULT_CARD_W / 2;
  return (
    <motion.g
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
    >
      <rect
        x={RESULT_CARD_X} y={y} width={RESULT_CARD_W} height={BOX_H}
        rx={14} fill="white" stroke={STEEL} strokeWidth={1.5}
      />
      <text x={cx} y={y + 24} fontSize="8.5" fontWeight="700" fill="#4A5568" textAnchor="middle" letterSpacing="0.1em">
        RECOMMENDED PRICE
      </text>
      <motion.text
        x={cx} y={y + 68} fontSize="34" fontWeight="800" fill={cust.color} textAnchor="middle"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.35, type: "spring", stiffness: 200 }}
      >
        {cust.price}
      </motion.text>
      <motion.text
        x={cx} y={y + 90} fontSize="11" fontWeight="600" textAnchor="middle"
        fill={cust.price > LIST_PRICE ? "#2e7d32" : "#c62828"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {cust.delta}
      </motion.text>

      <line x1={RESULT_CARD_X + 20} y1={y + 106} x2={RESULT_CARD_X + RESULT_CARD_W - 20} y2={y + 106} stroke="#E8ECF0" strokeWidth={1} />

      <text x={RESULT_CARD_X + 24} y={y + 130} fontSize="10" fill="#4A5568">
        Win probability
      </text>
      <text x={RESULT_CARD_X + RESULT_CARD_W - 24} y={y + 130} fontSize="12" fontWeight="700" fill={cust.color} textAnchor="end">
        {cust.winProb}
      </text>

      <text x={RESULT_CARD_X + 24} y={y + 154} fontSize="10" fill="#4A5568">
        Margin impact
      </text>
      <text x={RESULT_CARD_X + RESULT_CARD_W - 24} y={y + 154} fontSize="12" fontWeight="700" fill={cust.color} textAnchor="end">
        {cust.margin}
      </text>

      {/* List price reference */}
      <line x1={RESULT_CARD_X + 20} y1={y + 168} x2={RESULT_CARD_X + RESULT_CARD_W - 20} y2={y + 168} stroke="#E8ECF0" strokeWidth={1} />
      <text x={cx} y={y + 186} fontSize="9" fill={GREY} textAnchor="middle">
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
  { label: "Internal Historical Data", sub: "The 36M transactions scanned for patterns", section: 0, color: ML_GREEN },
  { label: "In-House Knowledge", sub: "Business rules that shape strategic guidance", section: 0, color: STRAT_BLUE },
  { label: "External Environmental Data", sub: "Market signals driving competitive position", section: 1, color: ML_GREEN },
  { label: "Industry Expertise", sub: "Benchmarks behind the pricing drivers", section: 1, color: STRAT_BLUE },
];

const OV_OUTPUTS = [
  { label: "Optimal Price", sub: "Scenario-specific guidance" },
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
  const showOutputs = step >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 relative">
      <div className="mb-1 relative h-5 flex items-center justify-center overflow-hidden">
        <motion.span
          className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${TEAL}12`, color: TEAL }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          3 · Execute
        </motion.span>
      </div>
      <motion.h2
        className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: NAVY }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        What the model produces
      </motion.h2>

      <div className="flex min-h-[3.5rem] items-center justify-center px-4 mb-1">
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
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
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
}: {
  step: number;
  onAnimationDone?: () => void;
  skipAnimation?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [settled, setSettled] = useState(!!skipAnimation);
  const cust = CUSTOMERS[selected];

  useEffect(() => {
    if (skipAnimation) { setSettled(true); return; }
    const t = setTimeout(() => setSettled(true), 3500);
    return () => clearTimeout(t);
  }, [skipAnimation]);

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 pt-8 relative"
        >
          <div className="relative mb-1 flex h-5 shrink-0 items-center justify-center overflow-hidden">
            <motion.span
              className="absolute inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
              animate={{ opacity: [0, 0.4, 0.4, 0], y: [8, 0, 0, -12] }}
              transition={{ duration: 0.9, times: [0, 0.2, 0.6, 1] }}
            >
              2 · Power
            </motion.span>
            <motion.span
              className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.7 }}
            >
              3 · Execute
            </motion.span>
          </div>
          <motion.h2
            className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: NAVY }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            The ideal price, adjusted for each customer
          </motion.h2>

          {/* Narrative area */}
          <motion.div
            className="flex min-h-[3rem] items-center justify-center px-4 mb-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.4 }}
          >
            <AnimatePresence mode="wait">
              {!settled ? (
                <motion.p
                  key="intro-narrative"
                  className="max-w-2xl text-center text-[1.05rem] leading-relaxed"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  The model produced{" "}
                  <span style={{ fontWeight: 700, color: TEAL }}>one optimal list price</span> for
                  every product — now see how it adjusts for each customer.
                </motion.p>
              ) : (
                <motion.p
                  key={`cust-${selected}`}
                  className="max-w-2xl text-center text-[1.05rem] leading-relaxed"
                  style={{ color: NAVY }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {cust.narrative}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Diagram */}
          <div className="relative w-full max-w-5xl flex-1 min-h-0 overflow-hidden">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">

                  {/* Intro: prominent $17.50 price circle */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: !settled ? 1 : undefined }}
                    transition={{ duration: 0.3, delay: 1.5 }}
                  >
                    {/* Impact burst ring — fires right as circle lands */}
                    <motion.circle
                      cx={MODEL_CX} cy={MODEL_CY} r={70}
                      fill="none" stroke={TEAL} strokeWidth={3}
                      initial={{ opacity: 0.7, scale: 0.85 }}
                      animate={{ opacity: 0, scale: 1.45 }}
                      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />
                    {/* Secondary burst ring */}
                    <motion.circle
                      cx={MODEL_CX} cy={MODEL_CY} r={70}
                      fill="none" stroke={NAVY} strokeWidth={1.5}
                      initial={{ opacity: 0.4, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.25 }}
                      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />
                    {/* Main circle — shrinks into model box when settled */}
                    <motion.circle
                      cx={MODEL_CX} cy={MODEL_CY} r={70}
                      fill="white" stroke={TEAL} strokeWidth={2.5}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={settled
                        ? { scale: 0.12, opacity: 0, y: 35 }
                        : { scale: 1, opacity: 1, y: 0 }}
                      transition={settled
                        ? { duration: 0.5, ease: [0.55, 0, 1, 0.45] }
                        : { duration: 0.45, delay: 0.05, type: "spring", stiffness: 300, damping: 15 }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />
                    {/* Breathing ring after landing */}
                    <motion.circle
                      cx={MODEL_CX} cy={MODEL_CY} r={72}
                      fill="none" stroke={TEAL} strokeWidth={1.5}
                      initial={{ opacity: 0 }}
                      animate={settled
                        ? { opacity: 0, scale: 1 }
                        : { opacity: [0, 0.3, 0], scale: [1, 1.12, 1] }}
                      transition={settled
                        ? { duration: 0.3 }
                        : { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />
                    <motion.text
                      x={MODEL_CX} y={MODEL_CY - 22}
                      textAnchor="middle"
                      style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", fill: GREY }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: settled ? 0 : 1 }}
                      transition={settled
                        ? { duration: 0.2 }
                        : { delay: 0.35, duration: 0.25 }}
                    >
                      OPTIMAL PRICE
                    </motion.text>
                    {/* Price text — shrinks toward list-price chip position */}
                    <motion.text
                      x={MODEL_CX} y={MODEL_CY + 12}
                      textAnchor="middle"
                      style={{ fontSize: 34, fontWeight: 800, fill: NAVY, transformOrigin: `${MODEL_CX}px ${MODEL_CY + 4}px` }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={settled
                        ? { opacity: 0, scale: 0.28, y: 30 }
                        : { opacity: 1, scale: 1, y: 0 }}
                      transition={settled
                        ? { duration: 0.45, ease: [0.55, 0, 1, 0.45] }
                        : { delay: 0.15, duration: 0.35, type: "spring", stiffness: 400, damping: 12 }}
                    >
                      $17.50
                    </motion.text>
                    <motion.text
                      x={MODEL_CX} y={MODEL_CY + 32}
                      textAnchor="middle"
                      style={{ fontSize: 10.5, fontWeight: 500, fill: GREY }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: settled ? 0 : 1, y: 0 }}
                      transition={settled
                        ? { duration: 0.2 }
                        : { delay: 0.5, duration: 0.3 }}
                    >
                      per unit · SKU #A-7200
                    </motion.text>
                  </motion.g>

                  {/* Full interactive diagram — mounts when settled */}
                  {settled && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Flow curves */}
                    <AnimatePresence mode="wait">
                      <motion.g key={selected}>
                        <motion.path
                          d={inCurvePath()}
                          fill="none" stroke={cust.color} strokeWidth={1.5} strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.35 }}
                          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        />
                        <motion.path
                          d={outCurvePath()}
                          fill="none" stroke={STEEL} strokeWidth={1.5} strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.35 }}
                          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        />
                        <FlowDot path={inPathObj} color={cust.color} delay={0.3} />
                        <FlowDot path={outPathObj} color={STEEL} delay={0.6} />
                      </motion.g>
                    </AnimatePresence>

                    {/* Profile card (left) */}
                    <AnimatePresence mode="wait">
                      <ProfileCard key={selected} cust={cust} />
                    </AnimatePresence>

                    {/* Result card (right) */}
                    <AnimatePresence mode="wait">
                      <ResultCard key={selected} cust={cust} />
                    </AnimatePresence>

                    {/* Model processing pulse */}
                    <AnimatePresence mode="wait">
                      <motion.rect
                        key={selected}
                        x={MODEL_X - 4} y={MODEL_Y - 4}
                        width={MODEL_W + 8} height={BOX_H + 8}
                        rx={20} fill="none" stroke={cust.color} strokeWidth={2}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.35, 0.1, 0] }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                      />
                    </AnimatePresence>

                    {/* Absorption glow — price landing pulse */}
                    <motion.rect
                      x={MODEL_X - 10} y={MODEL_Y - 10}
                      width={MODEL_W + 20} height={BOX_H + 20}
                      rx={22} fill="none" stroke={NAVY} strokeWidth={2.5}
                      initial={{ opacity: 0.6, scale: 0.92 }}
                      animate={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />
                    <motion.rect
                      x={MODEL_X - 4} y={MODEL_Y - 4}
                      width={MODEL_W + 8} height={BOX_H + 8}
                      rx={18} fill="none" stroke={NAVY} strokeWidth={1.5}
                      initial={{ opacity: 0.4, scale: 0.96 }}
                      animate={{ opacity: 0, scale: 1.06 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    />

                    {/* Center model box */}
                    <motion.g
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY}px` }}
                    >
                      <rect x={MODEL_X} y={MODEL_Y} width={MODEL_W} height={BOX_H} rx={16} fill={NAVY} />

                      {/* Product tag */}
                      <rect x={MODEL_CX - 70} y={MODEL_Y + 16} width={140} height={20} rx={10} fill="rgba(255,255,255,0.08)" />
                      <text x={MODEL_CX} y={MODEL_Y + 30} fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.45)" textAnchor="middle" letterSpacing="0.06em">
                        {PRODUCT_NAME}
                      </text>

                      <text x={MODEL_CX} y={MODEL_CY - 8} fontSize="18" fontWeight="700" fill="white" textAnchor="middle">
                        Pricing Model
                      </text>
                      <text x={MODEL_CX} y={MODEL_CY + 12} fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle">
                        ML-powered optimization
                      </text>

                      {/* List price reference — glows as price lands */}
                      <motion.rect
                        x={MODEL_CX - 50} y={MODEL_CY + 28} width={100} height={20} rx={10}
                        initial={{ fill: "rgba(33,165,213,0.35)" }}
                        animate={{ fill: "rgba(255,255,255,0.08)" }}
                        transition={{ duration: 0.9, delay: 0.05, ease: "easeOut" }}
                      />
                      <motion.text
                        x={MODEL_CX} y={MODEL_CY + 42} fontSize="10" fontWeight="600" textAnchor="middle"
                        initial={{ fill: "rgba(255,255,255,1)", scale: 1.5 }}
                        animate={{ fill: "rgba(255,255,255,0.5)", scale: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                        style={{ transformOrigin: `${MODEL_CX}px ${MODEL_CY + 38}px` }}
                      >
                        List: {LIST_PRICE} / unit
                      </motion.text>

                      {/* Processing bar */}
                      <motion.rect
                        x={MODEL_CX - 30} y={MODEL_CY + 58} height={3} rx={1.5} fill="rgba(255,255,255,0.2)"
                        animate={{ width: [40, 55, 30, 50, 40] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Feature indicators at bottom */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.rect
                          key={i}
                          x={MODEL_CX - 50 + i * 22} y={MODEL_CY + 72}
                          width={16} height={4} rx={2}
                          fill="rgba(255,255,255,0.1)"
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </motion.g>

                    {/* Connector line */}
                    <line
                      x1={MODEL_CX} y1={MODEL_Y + BOX_H}
                      x2={MODEL_CX} y2={MODEL_Y + BOX_H + 24}
                      stroke={GREY} strokeWidth={1} strokeDasharray="3 3" opacity={0.4}
                    />

                    {/* Customer chips */}
                    {CUSTOMERS.map((c, ci) => {
                      const isSelected = ci === selected;
                      const chipW = 120;
                      const chipH = 30;
                      const chipGap = 12;
                      const totalW = CUSTOMERS.length * chipW + (CUSTOMERS.length - 1) * chipGap;
                      const chipX = MODEL_CX - totalW / 2 + ci * (chipW + chipGap);
                      const chipY = MODEL_Y + BOX_H + 24;
                      return (
                        <motion.g
                          key={c.label}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelected(ci)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + ci * 0.08 }}
                        >
                          <motion.rect
                            x={chipX} y={chipY}
                            width={chipW} height={chipH}
                            rx={chipH / 2}
                            animate={{
                              fill: isSelected ? c.color : "white",
                              stroke: c.color,
                            }}
                            strokeWidth={isSelected ? 2 : 1.2}
                            transition={{ duration: 0.25 }}
                          />
                          <text
                            x={chipX + chipW / 2}
                            y={chipY + chipH / 2 + 1}
                            fontSize="10.5"
                            fontWeight="600"
                            fill={isSelected ? "white" : c.color}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{ pointerEvents: "none" }}
                          >
                            {c.label}
                          </text>
                        </motion.g>
                      );
                    })}
                  </motion.g>
                  )}

            </svg>
          </div>
        </motion.div>
  );
}
