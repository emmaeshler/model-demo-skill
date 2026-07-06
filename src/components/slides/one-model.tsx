"use client";

import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

export const ONE_MODEL_TOTAL_STEPS = 2;

interface NarrativeSegment {
  text: string;
  bold?: boolean;
  color?: string;
  underline?: boolean;
}

const STEP_NARRATIVES: Record<number, NarrativeSegment[]> = {
  0: [
    { text: "Four key inputs converge into one " },
    { text: "unified pricing model", bold: true, underline: true, color: NAVY },
    { text: "." },
  ],
  1: [
    { text: "AI enables both: " },
    { text: "machine learning", bold: true, underline: true, color: ML_GREEN },
    { text: " finds patterns in data, " },
    { text: "strategic guidance", bold: true, underline: true, color: STRAT_BLUE },
    { text: " encodes expertise." },
  ],
};

function HighlightNarrative({ segments }: { segments: NarrativeSegment[] }) {
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

/* ── Input data ── */

interface InputCard {
  label: string;
  subtitle: string;
  engine: "ml" | "strat";
}

const INPUTS: InputCard[] = [
  { label: "Internal Historical Data", subtitle: "Transaction & customer history", engine: "ml" },
  { label: "External Environmental Data", subtitle: "Market sentiment & macro signals", engine: "ml" },
  { label: "In-House Knowledge", subtitle: "Business realities & objectives", engine: "strat" },
  { label: "Industry Expertise", subtitle: "Benchmarks, drivers & paradigms", engine: "strat" },
];

/* ── Main visualization ── */

function ModelVisualization({ step }: { step: number }) {
  const W = 920;
  const H = 360;
  const CX = 660;
  const CY = 180;
  const R = 105;
  const R_OUTER = 125;
  const R_INNER = 85;
  const INNER_BLUE = "#3B7EAE";

  const showSplit = step >= 1;

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
      {/* ── Outer navy circle (AI Execution Layer) ── */}
      <motion.circle cx={CX} cy={CY} r={R_OUTER} fill={NAVY}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: showSplit ? 1 : R / R_OUTER, opacity: 1 }}
        transition={{
          scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.5 },
        }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />

      {/* ── Inner blue circle (appears at step 1) ── */}
      <motion.circle cx={CX} cy={CY} r={R_INNER} fill={INNER_BLUE}
        animate={{ opacity: showSplit ? 1 : 0, scale: showSplit ? 1 : 0.85 }}
        transition={{
          opacity: { duration: 0.6, delay: showSplit ? 0.15 : 0 },
          scale: { duration: 0.7, delay: showSplit ? 0.15 : 0, ease: [0.22, 1, 0.36, 1] },
        }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />

      {/* ── Dashed divider line between halves (step 1) ── */}
      <motion.line
        x1={CX - R_INNER + 15} y1={CY}
        x2={CX + R_INNER - 15} y2={CY}
        stroke="white" strokeWidth={1} strokeDasharray="6 4"
        animate={{ opacity: showSplit ? 0.45 : 0 }}
        transition={{ duration: 0.4, delay: showSplit ? 0.5 : 0 }}
      />

      {/* ── Step 0 labels (Pricing Model / One unified engine) ── */}
      <motion.text x={CX} y={CY - 4} fontSize="16" fontWeight="700" fill="white" textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplit ? 0 : 1 }}
        transition={{ duration: showSplit ? 0.15 : 0.4, delay: showSplit ? 0 : 0.3 }}>
        Pricing Model
      </motion.text>
      <motion.text x={CX} y={CY + 16} fontSize="10.5" fill="rgba(255,255,255,0.7)" textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplit ? 0 : 0.8 }}
        transition={{ duration: showSplit ? 0.15 : 0.4, delay: showSplit ? 0 : 0.4 }}>
        One unified engine
      </motion.text>

      {/* ── ML Prediction label + icon (step 1, top half of inner circle) ── */}
      <motion.g
        animate={{ opacity: showSplit ? 1 : 0 }}
        transition={{ duration: 0.5, delay: showSplit ? 0.45 : 0 }}
      >
        <g transform={`translate(${CX - 10}, ${CY - 72}) scale(1.0)`}>
          <circle cx={10} cy={4} r={3} fill={ML_GREEN} />
          <circle cx={3} cy={16} r={3} fill={ML_GREEN} />
          <circle cx={17} cy={16} r={3} fill={ML_GREEN} />
          <circle cx={10} cy={14} r={2.5} fill={ML_GREEN} opacity={0.6} />
          <line x1={10} y1={4} x2={3} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.6} />
          <line x1={10} y1={4} x2={17} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.6} />
          <line x1={3} y1={16} x2={17} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.6} />
          <line x1={10} y1={4} x2={10} y2={14} stroke={ML_GREEN} strokeWidth={1} opacity={0.5} />
        </g>
        <text x={CX} y={CY - 26} fontSize="17" fontWeight="700" fill="white" textAnchor="middle">
          ML Prediction
        </text>
      </motion.g>

      {/* ── Strategic Guidance label + icon (step 1, bottom half of inner circle) ── */}
      <motion.g
        animate={{ opacity: showSplit ? 1 : 0 }}
        transition={{ duration: 0.5, delay: showSplit ? 0.45 : 0 }}
      >
        <text x={CX} y={CY + 36} fontSize="17" fontWeight="700" fill="white" textAnchor="middle">
          Strategic Guidance
        </text>
        <g transform={`translate(${CX - 10}, ${CY + 46}) scale(1.0)`}>
          <circle cx={10} cy={10} r={9} fill="none" stroke={STRAT_BLUE} strokeWidth={1.4} />
          <polygon points="10,2 12,9 10,11 8,9" fill={STRAT_BLUE} />
          <polygon points="10,18 8,11 10,9 12,11" fill={STRAT_BLUE} opacity={0.4} />
          <circle cx={10} cy={10} r={1.5} fill={STRAT_BLUE} />
        </g>
      </motion.g>

      {/* ── "AI Execution Layer" label (in navy ring at bottom, italic) ── */}
      <motion.text
        x={CX} y={CY + R_INNER + (R_OUTER - R_INNER) / 2 + 5}
        fontSize="13" fontWeight="600" fill="white" textAnchor="middle"
        fontStyle="italic" letterSpacing="0.05em"
        animate={{ opacity: showSplit ? 0.9 : 0 }}
        transition={{ duration: 0.5, delay: showSplit ? 0.7 : 0 }}>
        AI Execution Layer
      </motion.text>

      {/* ── Input cards & connections ── */}
      {/* Category labels */}
      <motion.text x={LEFT_X} y={label1Y} fontSize="10" fontWeight="600" letterSpacing="0.12em"
        fill={showSplit ? ML_GREEN : NAVY}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}>
        DATA INPUTS
      </motion.text>
      <motion.text x={LEFT_X} y={label2Y} fontSize="10" fontWeight="600" letterSpacing="0.12em"
        fill={showSplit ? STRAT_BLUE : NAVY}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}>
        EXPERTISE INPUTS
      </motion.text>

      {INPUTS.map((inp, i) => {
        const cardY = cardYs[i];
        const centerY = cardCenterYs[i];
        const sx = LEFT_X + CARD_W + 2;
        const sy = centerY;

        const isML = inp.engine === "ml";
        const splitColor = isML ? ML_GREEN : STRAT_BLUE;
        const cardColor = showSplit ? splitColor : NAVY;

        // Step 0: all connections go to circle left edge at CY
        const unifiedEX = CX - R;
        const unifiedEY = CY;
        const unifiedD = `M ${sx} ${sy} C ${sx + 80} ${sy}, ${unifiedEX - 60} ${unifiedEY}, ${unifiedEX} ${unifiedEY}`;
        const unifiedPath = { sx, sy, cp1x: sx + 80, cp1y: sy, cp2x: unifiedEX - 60, cp2y: unifiedEY, ex: unifiedEX, ey: unifiedEY };

        // Step 1: connections re-route to their engine half
        const splitTargetY = isML ? CY - ML_OFFSET : CY + STRAT_OFFSET;
        const edgeX = isML ? EDGE_LEFT_ML : EDGE_LEFT_STRAT;
        const splitEY = splitTargetY;
        const splitD = `M ${sx} ${sy} C ${sx + 80} ${sy}, ${edgeX - 60} ${splitEY}, ${edgeX} ${splitEY}`;
        const splitPath = { sx, sy, cp1x: sx + 80, cp1y: sy, cp2x: edgeX - 60, cp2y: splitEY, ex: edgeX, ey: splitEY };

        const cardDelay = 0.2 + i * 0.12;
        const lineDelay = 0.7 + i * 0.1;

        return (
          <Fragment key={inp.label}>
            {/* Card */}
            <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: cardDelay, ease: "easeOut" }}>
              <motion.rect x={LEFT_X} y={cardY} width={CARD_W} height={CARD_H} rx={10}
                fill="white"
                animate={{ stroke: cardColor }}
                transition={{ duration: 0.5 }}
                strokeWidth={1.2}
              />
              <motion.text x={LEFT_X + CARD_W / 2} y={cardY + 20} fontSize="11.5" fontWeight="700" textAnchor="middle"
                animate={{ fill: cardColor }}
                transition={{ duration: 0.5 }}>
                {inp.label}
              </motion.text>
              <foreignObject x={LEFT_X + 10} y={cardY + 24} width={CARD_W - 20} height={CARD_H - 28}>
                <p style={{ fontSize: 9.5, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
              </foreignObject>
            </motion.g>

            {/* Step 0 connection (fades out when split) */}
            <motion.path d={unifiedD} fill="none" stroke={NAVY} strokeWidth={1.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: showSplit ? 0 : 0.35 }}
              transition={{
                pathLength: { duration: 0.7, delay: lineDelay, ease: "easeOut" },
                opacity: { duration: showSplit ? 0.3 : 0.7, delay: showSplit ? 0 : lineDelay },
              }}
            />
            {!showSplit && (
              <FlowDot path={unifiedPath} color={NAVY} delay={1.4 + i * 0.3} />
            )}

            {/* Step 1 connection (draws in when split) */}
            <motion.path d={splitD} fill="none" strokeWidth={1.5} strokeLinecap="round"
              stroke={splitColor}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: showSplit ? 1 : 0, opacity: showSplit ? 0.45 : 0 }}
              transition={{
                pathLength: { duration: 0.8, delay: showSplit ? 0.4 + i * 0.1 : 0, ease: "easeOut" },
                opacity: { duration: 0.4, delay: showSplit ? 0.3 : 0 },
              }}
            />
            {showSplit && (
              <FlowDot path={splitPath} color={splitColor} delay={1.2 + i * 0.3} />
            )}
          </Fragment>
        );
      })}
    </svg>
  );
}

interface OneModelSlideProps {
  step: number;
  skipAnimation?: boolean;
  onAutoAdvance?: () => void;
}

/* ── Slide shell ── */

export function OneModelSlide({ step }: OneModelSlideProps) {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 pt-8 relative">
      <motion.h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: step === 0 ? 0.6 : 0, ease: "easeOut" }}>
        Core components of the ideal pricing model
      </motion.h2>

      <div className="flex min-h-[3rem] items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p key={step} className="max-w-2xl text-center leading-relaxed"
            style={{ color: NAVY, fontSize: "1.15rem" }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, delay: step === 0 ? 0.6 : 0 }}>
            <HighlightNarrative segments={STEP_NARRATIVES[step]} />
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        className="relative w-full max-w-5xl flex-1 min-h-0 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: { duration: 0.8, delay: step === 0 ? 1.0 : 0 } }}
      >
        <ModelVisualization step={step} />
      </motion.div>
    </div>
  );
}
