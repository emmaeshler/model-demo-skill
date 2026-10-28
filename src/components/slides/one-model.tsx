"use client";

import { Fragment, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { EASE } from "@/lib/anim";

const NAVY = "#00446A";
const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

export const ONE_MODEL_TOTAL_STEPS = 3;

interface NarrativeSegment {
  text: string;
  bold?: boolean;
  color?: string;
  underline?: boolean;
}

const STEP_NARRATIVES: Record<number, NarrativeSegment[]> = {
  0: [
    { text: "Four key inputs power the ideal pricing model." },
  ],
  1: [
    { text: "They converge into two complementary engines within one " },
    { text: "pricing model", bold: true, underline: true, color: NAVY },
    { text: "." },
  ],
  2: [
    { text: "AI enables both: " },
    { text: "machine learning", bold: true, underline: true, color: ML_GREEN },
    { text: " finds patterns in data, " },
    { text: "strategic guidance", bold: true, underline: true, color: STRAT_BLUE },
    { text: " encodes expertise." },
  ],
};

function HighlightNarrative({ segments, isActive }: { segments: NarrativeSegment[]; isActive: boolean }) {
  return (
    <span>
      {segments.map((seg, si) => {
        if (!seg.bold) return <span key={si}>{seg.text}</span>;
        return (
          <span key={si} className="relative inline" style={{ whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 700, color: seg.color || NAVY }}>{seg.text}</span>
            {seg.underline && (
              <motion.span
                className="absolute bottom-0 left-0 h-[2px] rounded-full"
                style={{ backgroundColor: seg.color || NAVY }}
                initial={false}
                animate={isActive ? { width: "100%" } : { width: "0%" }}
                transition={{ duration: 0.6, delay: isActive ? 0.4 : 0, ease: "easeOut" }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

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

function FlowDot({ path, color, delay, isActive }: {
  path: { sx: number; sy: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number };
  color: string; delay: number; isActive: boolean;
}) {
  const { shareMode } = useShareMode();
  const { cxArr, cyArr } = sampleCubicBezier(
    path.sx, path.sy, path.cp1x, path.cp1y, path.cp2x, path.cp2y, path.ex, path.ey, 50,
  );

  if (shareMode) {
    const mid = Math.floor(cxArr.length / 2);
    return <circle r={3} fill={color} cx={cxArr[mid]} cy={cyArr[mid]} opacity={isActive ? 0.4 : 0} />;
  }

  return (
    <motion.circle r={3} fill={color} initial={false}
      animate={isActive ? { cx: cxArr, cy: cyArr, opacity: [0, 0.5, 0.5, 0.5, 0] } : { opacity: 0 }}
      transition={isActive ? { duration: 4.5, delay, repeat: Infinity, ease: "linear" } : { duration: 0 }}
    />
  );
}

/* ── Input data ── */

interface InputCard {
  label: string;
  subtitle: string;
  engine: "ml" | "strat";
}

const INPUTS: InputCard[] = [
  { label: "Internal Data", subtitle: "Transaction & customer history", engine: "ml" },
  { label: "External Data", subtitle: "Market sentiment & macro signals", engine: "ml" },
  { label: "Business Objectives", subtitle: "Business realities & objectives", engine: "strat" },
  { label: "Industry Expertise", subtitle: "Benchmarks, drivers & paradigms", engine: "strat" },
];

/* ── Main visualization ── */

function ModelVisualization({ step, isActive }: { step: number; isActive: boolean }) {
  const W = 920;
  const H = 360;
  const CX = 660;
  const CY = 180;
  const R_OUTER = 125;
  const R_INNER = 85;
  const ML_BG = "#4A9B6E";
  const STRAT_BG = "#4A8DB8";
  const NAVY_INNER = "#1A6090";
  const R_ARC = R_INNER + (R_OUTER - R_INNER) * 0.75;

  const showCircle = step >= 1;
  const showColors = step >= 2;

  const CARD_W = 220;
  const CARD_H = 48;
  const CARD_GAP = 10;
  const GROUP_GAP = 38;
  const LABEL_H = 16;
  const LEFT_X = 20;
  const GROUP_1_H = 2 * CARD_H + CARD_GAP + LABEL_H;
  const GROUP_2_H = 2 * CARD_H + CARD_GAP + LABEL_H;
  const TOTAL_H = GROUP_1_H + GROUP_GAP + GROUP_2_H;
  const START_Y = CY - TOTAL_H / 2;

  const ML_OFFSET = 50;
  const STRAT_OFFSET = 50;
  const EDGE_LEFT_ML = CX - Math.round(Math.sqrt(R_OUTER * R_OUTER - ML_OFFSET * ML_OFFSET));
  const EDGE_LEFT_STRAT = CX - Math.round(Math.sqrt(R_OUTER * R_OUTER - STRAT_OFFSET * STRAT_OFFSET));

  const label1Y = START_Y + LABEL_H;
  const card0Y = label1Y + 4;
  const card1Y = card0Y + CARD_H + CARD_GAP;
  const label2Y = card1Y + CARD_H + GROUP_GAP;
  const card2Y = label2Y + 4;
  const card3Y = card2Y + CARD_H + CARD_GAP;

  const cardYs = [card0Y, card1Y, card2Y, card3Y];
  const cardCenterYs = cardYs.map((y) => y + CARD_H / 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[420px]">
      <defs>
        <path id="ai-text-arc" d={`M ${CX - R_ARC},${CY} A ${R_ARC},${R_ARC} 0 0,0 ${CX + R_ARC},${CY}`} />
      </defs>

      {/* ── Outer navy circle (AI Execution Layer) ── */}
      <motion.circle cx={CX} cy={CY} r={R_OUTER} fill={NAVY}
        initial={false}
        animate={isActive && showCircle ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{
          scale: { duration: 0.8, ease: EASE },
          opacity: { duration: 0.5 },
        }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />

      {/* ── Inner circle — ML half (top) ── */}
      <motion.path
        d={`M ${CX - R_INNER},${CY} A ${R_INNER},${R_INNER} 0 0,1 ${CX + R_INNER},${CY} Z`}
        initial={false}
        animate={isActive && showCircle
          ? { opacity: 1, scale: 1, fill: showColors ? ML_BG : NAVY_INNER }
          : { opacity: 0, scale: 0.85, fill: NAVY_INNER }}
        transition={{
          opacity: { duration: 0.6, delay: showCircle ? 0.15 : 0 },
          scale: { duration: 0.7, delay: showCircle ? 0.15 : 0, ease: EASE },
          fill: { duration: 0.7, ease: "easeInOut" },
        }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />
      {/* ── Inner circle — Strategic half (bottom) ── */}
      <motion.path
        d={`M ${CX - R_INNER},${CY} A ${R_INNER},${R_INNER} 0 0,0 ${CX + R_INNER},${CY} Z`}
        initial={false}
        animate={isActive && showCircle
          ? { opacity: 1, scale: 1, fill: showColors ? STRAT_BG : NAVY_INNER }
          : { opacity: 0, scale: 0.85, fill: NAVY_INNER }}
        transition={{
          opacity: { duration: 0.6, delay: showCircle ? 0.15 : 0 },
          scale: { duration: 0.7, delay: showCircle ? 0.15 : 0, ease: EASE },
          fill: { duration: 0.7, ease: "easeInOut" },
        }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />

      {/* ── Dashed divider line between halves ── */}
      <motion.line
        x1={CX - R_INNER + 15} y1={CY}
        x2={CX + R_INNER - 15} y2={CY}
        stroke="white" strokeWidth={1} strokeDasharray="6 4"
        initial={false}
        animate={isActive && showCircle ? { opacity: 0.45 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: showCircle ? 0.5 : 0 }}
      />

      {/* ── ML Prediction label + icon (top half) ── */}
      <motion.g
        initial={false}
        animate={isActive && showCircle ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: showCircle ? 0.45 : 0 }}
      >
        <g transform={`translate(${CX - 10}, ${CY - 72}) scale(1.0)`}>
          <circle cx={10} cy={4} r={3} fill="white" />
          <circle cx={3} cy={16} r={3} fill="white" />
          <circle cx={17} cy={16} r={3} fill="white" />
          <circle cx={10} cy={14} r={2.5} fill="white" opacity={0.7} />
          <line x1={10} y1={4} x2={3} y2={16} stroke="white" strokeWidth={1.2} opacity={0.7} />
          <line x1={10} y1={4} x2={17} y2={16} stroke="white" strokeWidth={1.2} opacity={0.7} />
          <line x1={3} y1={16} x2={17} y2={16} stroke="white" strokeWidth={1.2} opacity={0.7} />
          <line x1={10} y1={4} x2={10} y2={14} stroke="white" strokeWidth={1} opacity={0.6} />
        </g>
        <text x={CX} y={CY - 26} fontSize="15" fontWeight="700" fill="white" textAnchor="middle">
          ML Prediction
        </text>
      </motion.g>

      {/* ── Strategic Guidance label + icon (bottom half) ── */}
      <motion.g
        initial={false}
        animate={isActive && showCircle ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: showCircle ? 0.45 : 0 }}
      >
        <text x={CX} y={CY + 36} fontSize="15" fontWeight="700" fill="white" textAnchor="middle">
          Strategic Guidance
        </text>
        <g transform={`translate(${CX - 10}, ${CY + 46}) scale(1.0)`}>
          <circle cx={10} cy={10} r={9} fill="none" stroke="white" strokeWidth={1.4} opacity={0.85} />
          <polygon points="10,2 12,9 10,11 8,9" fill="white" />
          <polygon points="10,18 8,11 10,9 12,11" fill="white" opacity={0.5} />
          <circle cx={10} cy={10} r={1.5} fill="white" />
        </g>
      </motion.g>

      {/* ── "AI Execution Layer" label (curved along bottom of navy ring) ── */}
      <motion.text
        fontSize="11.5" fontWeight="600" fill="white"
        fontStyle="italic" letterSpacing="0.08em"
        initial={false}
        animate={isActive && showCircle ? { opacity: 0.9 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: showCircle ? 0.7 : 0 }}>
        <textPath href="#ai-text-arc" startOffset="50%" textAnchor="middle">
          AI Execution Layer
        </textPath>
      </motion.text>

      {/* ── Input cards & connections ── */}
      {/* Category labels */}
      <motion.text x={LEFT_X} y={label1Y} fontSize="10" fontWeight="600" letterSpacing="0.12em"
        initial={false}
        animate={isActive
          ? { opacity: 1, x: 0, fill: showColors ? ML_GREEN : NAVY }
          : { opacity: 0, x: -30, fill: NAVY }}
        transition={{
          x: { duration: 0.6, delay: isActive ? 0.1 : 0, ease: EASE },
          opacity: { duration: 0.4, delay: isActive ? 0.1 : 0 },
          fill: { duration: 0.5 },
        }}>
        DATA INPUTS
      </motion.text>
      <motion.text x={LEFT_X} y={label2Y} fontSize="10" fontWeight="600" letterSpacing="0.12em"
        initial={false}
        animate={isActive
          ? { opacity: 1, x: 0, fill: showColors ? STRAT_BLUE : NAVY }
          : { opacity: 0, x: -30, fill: NAVY }}
        transition={{
          x: { duration: 0.6, delay: isActive ? 0.55 : 0, ease: EASE },
          opacity: { duration: 0.4, delay: isActive ? 0.55 : 0 },
          fill: { duration: 0.5 },
        }}>
        EXPERTISE INPUTS
      </motion.text>

      {INPUTS.map((inp, i) => {
        const cardY = cardYs[i];
        const centerY = cardCenterYs[i];
        const sx = LEFT_X + CARD_W + 2;
        const sy = centerY;

        const isML = inp.engine === "ml";
        const splitColor = isML ? ML_GREEN : STRAT_BLUE;
        const cardColor = showColors ? splitColor : NAVY;

        const splitTargetY = isML ? CY - ML_OFFSET : CY + STRAT_OFFSET;
        const edgeX = isML ? EDGE_LEFT_ML : EDGE_LEFT_STRAT;
        const splitEY = splitTargetY;
        const splitD = `M ${sx} ${sy} C ${sx + 80} ${sy}, ${edgeX - 60} ${splitEY}, ${edgeX} ${splitEY}`;
        const splitPath = { sx, sy, cp1x: sx + 80, cp1y: sy, cp2x: edgeX - 60, cp2y: splitEY, ex: edgeX, ey: splitEY };

        const groupOffset = i < 2 ? 0 : 0.45;
        const withinGroup = i % 2;
        const cardDelay = 0.2 + groupOffset + withinGroup * 0.15;
        const lineDelay = 0.7 + i * 0.1;

        return (
          <Fragment key={inp.label}>
            {/* Card */}
            <motion.g
              initial={false}
              animate={isActive
                ? { opacity: 1, x: 0, y: 0 }
                : { opacity: 0, x: -50, y: 8 }}
              transition={{
                x: { duration: 0.7, delay: isActive ? cardDelay : 0, ease: EASE },
                y: { duration: 0.7, delay: isActive ? cardDelay : 0, ease: EASE },
                opacity: { duration: 0.45, delay: isActive ? cardDelay : 0 },
              }}
            >
              <motion.rect x={LEFT_X} y={cardY} width={CARD_W} height={CARD_H} rx={10}
                fill="white"
                initial={false}
                animate={{ stroke: cardColor }}
                transition={{ duration: 0.5 }}
                strokeWidth={1.2}
              />
              <motion.text x={LEFT_X + CARD_W / 2} y={cardY + 20} fontSize="11.5" fontWeight="700" textAnchor="middle"
                initial={false}
                animate={{ fill: cardColor }}
                transition={{ duration: 0.5 }}>
                {inp.label}
              </motion.text>
              <foreignObject x={LEFT_X + 10} y={cardY + 24} width={CARD_W - 20} height={CARD_H - 28}>
                <p style={{ fontSize: 9.5, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
              </foreignObject>
            </motion.g>

            {/* Connection to engine half */}
            <motion.path d={splitD} fill="none" strokeWidth={1.5} strokeLinecap="round"
              initial={false}
              animate={isActive && showCircle
                ? { pathLength: 1, opacity: 0.4, stroke: showColors ? splitColor : NAVY }
                : { pathLength: 0, opacity: 0, stroke: NAVY }}
              transition={{
                pathLength: { duration: 0.7, delay: isActive && showCircle ? lineDelay : 0, ease: "easeOut" },
                opacity: { duration: 0.5, delay: isActive && showCircle ? lineDelay : 0 },
                stroke: { duration: 0.5 },
              }}
            />
            {showCircle && (
              <FlowDot path={splitPath} color={showColors ? splitColor : NAVY} delay={1.2 + i * 0.3} isActive={isActive} />
            )}
          </Fragment>
        );
      })}
    </svg>
  );
}

interface OneModelSlideProps {
  step: number;
  isActive: boolean;
  skipAnimation?: boolean;
  onAutoAdvance?: () => void;
}

const STEP_DELAYS: Record<number, number> = {
  0: 2000,
  1: 1500,
};

/* ── Slide shell ── */

export function OneModelSlide({ step, isActive, skipAnimation, onAutoAdvance }: OneModelSlideProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advanceRef = useRef(onAutoAdvance);
  advanceRef.current = onAutoAdvance;

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!isActive || skipAnimation || !advanceRef.current) return;
    const delay = STEP_DELAYS[step];
    if (delay == null) return;
    timerRef.current = setTimeout(() => advanceRef.current?.(), delay);
    return () => clearTimeout(timerRef.current);
  }, [step, isActive, skipAnimation]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 pt-8 relative">
      <motion.h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}
        initial={false}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, delay: isActive && step === 0 ? 0.3 : 0, ease: "easeOut" }}>
        Core components of the ideal pricing model
      </motion.h2>

      <div className="flex min-h-[3rem] items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p key={step} className="max-w-2xl text-center leading-relaxed"
            style={{ color: NAVY, fontSize: "1.15rem" }}
            initial={{ opacity: 0, y: 6 }} animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, delay: isActive && step === 0 ? 0.4 : 0 }}>
            <HighlightNarrative segments={STEP_NARRATIVES[step]} isActive={isActive} />
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        className="relative w-full max-w-5xl flex-1 min-h-0 flex items-center justify-center overflow-hidden"
        initial={false}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ opacity: { duration: 0.8, delay: isActive && step === 0 ? 0.6 : 0 } }}
      >
        <ModelVisualization step={step} isActive={isActive} />
      </motion.div>
    </div>
  );
}
