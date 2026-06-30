"use client";

import { Fragment, useEffect } from "react";
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
    { text: "Four key inputs converge into one " },
    { text: "unified pricing model", bold: true, underline: true, color: NAVY },
    { text: "." },
  ],
  1: [
    { text: "Let's look " },
    { text: "inside the model", bold: true, underline: true, color: NAVY },
    { text: " to see how it works." },
  ],
  2: [
    { text: "The model combines " },
    { text: "two distinct engines", bold: true, underline: true, color: NAVY },
    { text: "." },
  ],
  3: [
    { text: "Two engines: " },
    { text: "machine learning", bold: true, underline: true, color: ML_GREEN },
    { text: " finds patterns in data, " },
    { text: "strategic guidance", bold: true, underline: true, color: STRAT_BLUE },
    { text: " encodes expertise." },
  ],
  4: [
    { text: "Each input feeds the right engine — " },
    { text: "data drives ML", bold: true, underline: true, color: ML_GREEN },
    { text: ", " },
    { text: "expertise guides strategy", bold: true, underline: true, color: STRAT_BLUE },
    { text: "." },
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

/* ── Main visualization ── */

function ModelVisualization({ step }: { step: number }) {
  const W = 920;
  const H = 340;
  const CX = W / 2;
  const CY = 170;
  const R = 105;
  const GAP = 4;

  const showInputs = step === 0 || step >= 4;
  const showNavy = step <= 1;
  const showLabels = step >= 2;
  const showSegments = step >= 3;
  const isZoomed = step >= 1 && step <= 3;
  const coloredConnections = step >= 4;

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

      {/* ── Navy circle (steps 0–1, fades at step 2) ── */}
      <motion.circle cx={CX} cy={CY} r={R} fill={NAVY}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: showNavy ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />
      <motion.text x={CX} y={CY - 4} fontSize="16" fontWeight="700" fill="white" textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: showNavy ? 1 : 0 }}
        transition={{ duration: 0.4, delay: showNavy && step === 0 ? 0.3 : 0 }}>
        Pricing Model
      </motion.text>
      <motion.text x={CX} y={CY + 16} fontSize="10.5" fill="rgba(255,255,255,0.7)" textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: showNavy ? 0.8 : 0 }}
        transition={{ duration: 0.4, delay: showNavy && step === 0 ? 0.4 : 0 }}>
        One unified engine
      </motion.text>

      {/* ── Segmented halves (fade in at step 3) ── */}
      <g clipPath="url(#m-top-half)">
        <g clipPath="url(#m-top)">
          <motion.circle cx={CX} cy={CY - GAP / 2} r={R} fill="#D5E6D0"
            animate={{ opacity: showSegments ? 1 : 0 }}
            transition={{ duration: 1.0, delay: showSegments ? 0.3 : 0 }}
          />
        </g>
      </g>
      <g clipPath="url(#m-bot-half)">
        <g clipPath="url(#m-bot)">
          <motion.circle cx={CX} cy={CY + GAP / 2} r={R} fill="#D4E8F0"
            animate={{ opacity: showSegments ? 1 : 0 }}
            transition={{ duration: 1.0, delay: showSegments ? 0.5 : 0 }}
          />
        </g>
      </g>

      {/* ── ML icon (independent position) ── */}
      <motion.g
        animate={{ opacity: showLabels && !showSegments ? 0.8 : 0 }}
        transition={{ opacity: { duration: 0.8, delay: showLabels && !showSegments ? 0.1 : 0 } }}
      >
        <motion.g
          animate={{ x: showSegments ? CX - 18 : CX - 150 - 18, y: showSegments ? CY - 66 : CY - 50 }}
          transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1] }}
        >
          <g transform="scale(1.8)">
            <circle cx={10} cy={4} r={3} fill={ML_GREEN} />
            <circle cx={3} cy={16} r={3} fill={ML_GREEN} />
            <circle cx={17} cy={16} r={3} fill={ML_GREEN} />
            <circle cx={10} cy={14} r={2.5} fill={ML_GREEN} opacity={0.5} />
            <line x1={10} y1={4} x2={3} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.5} />
            <line x1={10} y1={4} x2={17} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.5} />
            <line x1={3} y1={16} x2={17} y2={16} stroke={ML_GREEN} strokeWidth={1.2} opacity={0.5} />
            <line x1={10} y1={4} x2={10} y2={14} stroke={ML_GREEN} strokeWidth={1} opacity={0.4} />
          </g>
        </motion.g>
      </motion.g>

      {/* ── Strategic icon (independent position) ── */}
      <motion.g
        animate={{ opacity: showLabels && !showSegments ? 0.8 : 0 }}
        transition={{ opacity: { duration: 0.8, delay: showLabels && !showSegments ? 0.25 : 0 } }}
      >
        <motion.g
          animate={{ x: showSegments ? CX - 18 : CX + 150 - 18, y: showSegments ? CY + 38 : CY - 50 }}
          transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1] }}
        >
          <g transform="scale(1.8)">
            <circle cx={10} cy={10} r={9} fill="none" stroke={STRAT_BLUE} strokeWidth={1.4} />
            <polygon points="10,2 12,9 10,11 8,9" fill={STRAT_BLUE} />
            <polygon points="10,18 8,11 10,9 12,11" fill={STRAT_BLUE} opacity={0.4} />
            <circle cx={10} cy={10} r={1.5} fill={STRAT_BLUE} />
          </g>
        </motion.g>
      </motion.g>

      {/* ── ML text labels ── */}
      <motion.text fontSize="14" fontWeight="700" fill={ML_GREEN} textAnchor="middle"
        animate={{ x: showSegments ? CX : CX - 150, y: showSegments ? CY - 24 : CY + 4, opacity: showLabels ? 1 : 0 }}
        transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1], opacity: { duration: 0.5, delay: showLabels ? 0.15 : 0 } }}>
        ML Prediction
      </motion.text>
      <motion.text fontSize="9.5" fill={ML_GREEN} textAnchor="middle"
        animate={{ x: showSegments ? CX : CX - 150, y: showSegments ? CY - 10 : CY + 18, opacity: showLabels ? 0.6 : 0 }}
        transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1], opacity: { duration: 0.5, delay: showLabels ? 0.2 : 0 } }}>
        Data-driven pattern recognition
      </motion.text>

      {/* ── Strategic text labels ── */}
      <motion.text fontSize="14" fontWeight="700" fill={STRAT_BLUE} textAnchor="middle"
        animate={{ x: showSegments ? CX : CX + 150, y: showSegments ? CY + 34 : CY + 4, opacity: showLabels ? 1 : 0 }}
        transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1], opacity: { duration: 0.5, delay: showLabels ? 0.3 : 0 } }}>
        Strategic Guidance
      </motion.text>
      <motion.text fontSize="9.5" fill={STRAT_BLUE} textAnchor="middle"
        animate={{ x: showSegments ? CX : CX + 150, y: showSegments ? CY + 48 : CY + 18, opacity: showLabels ? 0.6 : 0 }}
        transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1], opacity: { duration: 0.5, delay: showLabels ? 0.35 : 0 } }}>
        Expert knowledge & market rules
      </motion.text>

      {/* "PRICING MODEL" below circle (visible when segmented + not zoomed) */}
      <motion.text x={CX} y={CY + R + 28} fontSize="11" fontWeight="700" letterSpacing="0.14em"
        fill={NAVY} textAnchor="middle"
        animate={{ opacity: showSegments && !isZoomed ? 1 : 0 }}
        transition={{ duration: 0.4, delay: showSegments && !isZoomed ? 0.3 : 0 }}>
        PRICING MODEL
      </motion.text>

      {/* Pulsing glow */}
      <motion.circle cx={CX} cy={CY - GAP / 2} r={R + 4} fill="none" stroke={ML_GREEN} strokeWidth={1.5}
        clipPath="url(#m-top-half)"
        animate={{ opacity: showSegments ? [0, 0.15, 0.3, 0.15] : [0] }}
        transition={showSegments ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 } : { duration: 0.3 }}
      />
      <motion.circle cx={CX} cy={CY + GAP / 2} r={R + 4} fill="none" stroke={STRAT_BLUE} strokeWidth={1.5}
        clipPath="url(#m-bot-half)"
        animate={{ opacity: showSegments ? [0, 0.15, 0.3, 0.15] : [0] }}
        transition={showSegments ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 } : { duration: 0.3 }}
      />

      {/* ── Input cards and connections ── */}
      <AnimatePresence>
        {showInputs && (
          <motion.g key="inputs" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {/* Left — INTERNAL */}
            <motion.text x={LEFT_X} y={CARD_1_Y - 10} fontSize="10" fontWeight="600" letterSpacing="0.12em"
              fill={NAVY}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: step === 0 ? 0.15 : 0.5, duration: 0.4 }}>
              INTERNAL
            </motion.text>
            {INTERNAL.map((inp, i) => {
              const sx = LEFT_X + CARD_W + 2;
              const sy = inp.y + CARD_H / 2;
              const tx = inp.edgeX;
              const ty = inp.targetY;
              const cardColor = coloredConnections ? (i === 0 ? ML_GREEN : STRAT_BLUE) : NAVY;
              const lineColor = coloredConnections ? (i === 0 ? ML_GREEN : STRAT_BLUE) : NAVY;
              const d = `M ${sx} ${sy} C ${sx + 50} ${sy}, ${tx - 40} ${ty}, ${tx} ${ty}`;
              const pathParams = { sx, sy, cp1x: sx + 50, cp1y: sy, cp2x: tx - 40, cp2y: ty, ex: tx, ey: ty };
              const cardDelay = step === 0 ? 0.2 : 0.8;
              const lineDelay = step === 0 ? 0.7 : 1.3;
              const dotDelay = step === 0 ? 1.4 : 1.8;
              return (
                <Fragment key={inp.label}>
                  <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: cardDelay, ease: "easeOut" }}>
                    <rect x={LEFT_X} y={inp.y} width={CARD_W} height={CARD_H} rx={10} fill="white" stroke={cardColor} strokeWidth={1.2} />
                    <text x={LEFT_X + CARD_W / 2} y={inp.y + 22} fontSize="12" fontWeight="700" fill={cardColor} textAnchor="middle">{inp.label}</text>
                    <foreignObject x={LEFT_X + 10} y={inp.y + 27} width={CARD_W - 20} height={CARD_H - 30}>
                      <p style={{ fontSize: 10, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
                    </foreignObject>
                  </motion.g>
                  <motion.path d={d} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }}
                    transition={{ duration: 0.7, delay: lineDelay, ease: "easeOut" }}
                  />
                  <FlowDot path={pathParams} color={lineColor} delay={dotDelay} />
                </Fragment>
              );
            })}

            {/* Right — ENVIRONMENTAL */}
            <motion.text x={RIGHT_X + CARD_W} y={CARD_1_Y - 10} fontSize="10" fontWeight="600" letterSpacing="0.12em"
              fill={coloredConnections ? TEAL : NAVY} textAnchor="end"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: step === 0 ? 1.2 : 0.7, duration: 0.4 }}>
              ENVIRONMENTAL
            </motion.text>
            {ENVIRONMENTAL.map((inp, i) => {
              const sx = RIGHT_X - 2;
              const sy = inp.y + CARD_H / 2;
              const tx = inp.edgeX;
              const ty = inp.targetY;
              const cardColor = coloredConnections ? (i === 0 ? ML_GREEN : STRAT_BLUE) : NAVY;
              const lineColor = coloredConnections ? (i === 0 ? ML_GREEN : STRAT_BLUE) : NAVY;
              const d = `M ${sx} ${sy} C ${sx - 50} ${sy}, ${tx + 40} ${ty}, ${tx} ${ty}`;
              const pathParams = { sx, sy, cp1x: sx - 50, cp1y: sy, cp2x: tx + 40, cp2y: ty, ex: tx, ey: ty };
              const cardDelay = step === 0 ? 1.3 : 1.0;
              const lineDelay = step === 0 ? 1.8 : 1.5;
              const dotDelay = step === 0 ? 2.5 : 2.0;
              return (
                <Fragment key={inp.label}>
                  <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: cardDelay, ease: "easeOut" }}>
                    <rect x={RIGHT_X} y={inp.y} width={CARD_W} height={CARD_H} rx={10} fill="white" stroke={cardColor} strokeWidth={1.2} />
                    <text x={RIGHT_X + CARD_W / 2} y={inp.y + 22} fontSize="12" fontWeight="700" fill={cardColor} textAnchor="middle">{inp.label}</text>
                    <foreignObject x={RIGHT_X + 10} y={inp.y + 27} width={CARD_W - 20} height={CARD_H - 30}>
                      <p style={{ fontSize: 10, lineHeight: 1.3, color: "#4A5568", margin: 0, textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>{inp.subtitle}</p>
                    </foreignObject>
                  </motion.g>
                  <motion.path d={d} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.35 }}
                    transition={{ duration: 0.7, delay: lineDelay, ease: "easeOut" }}
                  />
                  <FlowDot path={pathParams} color={lineColor} delay={dotDelay} />
                </Fragment>
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

interface OneModelSlideProps {
  step: number;
  skipAnimation?: boolean;
  onAutoAdvance?: () => void;
}

/* ── Slide shell ── */

export function OneModelSlide({ step, onAutoAdvance }: OneModelSlideProps) {
  const isZoomed = step >= 1 && step <= 3;

  useEffect(() => {
    if (step === 3 && onAutoAdvance) {
      const timer = setTimeout(onAutoAdvance, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, onAutoAdvance]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center px-6 pt-8 relative">
      <div className="relative mb-1 flex h-5 shrink-0 items-center justify-center overflow-hidden">
        <motion.span
          className="inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ backgroundColor: `${NAVY}10`, color: NAVY }}
          initial={step === 0 ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: step === 0 ? 0.3 : 0 }}
        >
          1 · Design
        </motion.span>
      </div>
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
            <HighlightNarrative segments={STEP_NARRATIVES[step]} isActive />
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        className="relative w-full max-w-5xl flex-1 min-h-0 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: isZoomed ? 1.5 : 1,
        }}
        transition={{
          opacity: { duration: 0.8, delay: step === 0 ? 1.0 : 0 },
          scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        }}
        style={{ transformOrigin: "center center" }}
      >
        <ModelVisualization step={step} />
      </motion.div>
    </div>
  );
}
