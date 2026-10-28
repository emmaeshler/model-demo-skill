"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  EASE, NAVY, MUTED, STRAT_BLUE, GREEN,
  CURVE_SLOT, BASE_Y,
  SCATTER_DOTS, STATUS_COLORS, SEGMENT_HIGHLIGHTS, LEGEND_ITEMS,
} from "./refine-slide-data";

interface CurveData {
  d: string;
  navyPts: { x: number; y: number }[];
  ghostCurvePts: { x: number; y: number }[][];
  ghostCurves: { d: string; sampleAt: (t: number) => { x: number; y: number }; customer: string; color: string }[];
  indexCurves: { d: string; pts: { x: number; y: number }[]; sampleAt: (t: number) => { x: number; y: number } }[];
  sampleAt: (t: number) => { x: number; y: number };
}

interface RefineChartProps {
  curve: CurveData;
  morphedIndexCurveD: string;
  ghostIndexCurveD: string;
  chartStep: number;
  showCurve: boolean;
  isAllToCurve: boolean;
  isIndexShift: boolean;
  isSpotlight: boolean;
  spotlightIdx: number;
  spotPhase: number;
  isLifted: boolean;
  dotOpacityBase: number;
  introPhase: number;
  activeIndexCurve: { sampleAt: (t: number) => { x: number; y: number } } | null;
  indexMorphFrom: number;
  indexMorphProgress: number;
  indexPhase: number;
  timelineTargetMonth: number;
  shareMode: boolean;
  isActive: boolean;
  skipAnimation?: boolean;
  onSpotClick: () => void;
}

export function RefineChart({
  curve, morphedIndexCurveD, ghostIndexCurveD,
  chartStep, showCurve, isAllToCurve, isIndexShift, isSpotlight, spotlightIdx,
  spotPhase, isLifted, dotOpacityBase, introPhase,
  activeIndexCurve, indexMorphFrom, indexMorphProgress, indexPhase,
  timelineTargetMonth, shareMode, isActive, skipAnimation,
  onSpotClick,
}: RefineChartProps) {
  return (
    <svg
      viewBox={`0 -6 ${CURVE_SLOT.x + CURVE_SLOT.w + 40} ${BASE_Y + 30}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Legend — bottom-left below chart (hidden during timeline) */}
      {!isIndexShift && <g>
        {LEGEND_ITEMS.map((item) => (
          <g key={item.label} transform={`translate(${CURVE_SLOT.x + item.x}, ${BASE_Y + 14})`}>
            <circle cx={0} cy={0} r={1.2} fill={item.color} opacity={0.7} />
            <text x={3.5} y={1.5} fontSize="4.5" fontWeight="500" fill={MUTED} style={{ fontFamily: "inherit" }}>{item.label}</text>
          </g>
        ))}
      </g>}

      {/* Subtle gridlines */}
      {Array.from({ length: 7 }, (_, i) => {
        const y = CURVE_SLOT.y + (i / 6) * CURVE_SLOT.h;
        return <line key={`gh${i}`} x1={CURVE_SLOT.x} y1={y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={y} stroke={`${NAVY}08`} strokeWidth={0.5} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const x = CURVE_SLOT.x + (i / 5) * CURVE_SLOT.w;
        return <line key={`gv${i}`} x1={x} y1={CURVE_SLOT.y} x2={x} y2={BASE_Y} stroke={`${NAVY}08`} strokeWidth={0.5} />;
      })}

      {/* Axes */}
      <line x1={CURVE_SLOT.x} y1={BASE_Y} x2={CURVE_SLOT.x + CURVE_SLOT.w} y2={BASE_Y} stroke={`${NAVY}30`} strokeWidth={1.2} />
      <line x1={CURVE_SLOT.x} y1={CURVE_SLOT.y} x2={CURVE_SLOT.x} y2={BASE_Y} stroke={`${NAVY}30`} strokeWidth={1.2} />
      <text x={30} y={CURVE_SLOT.y + CURVE_SLOT.h / 2} textAnchor="middle" transform={`rotate(-90, 30, ${CURVE_SLOT.y + CURVE_SLOT.h / 2})`} style={{ fill: MUTED, fontSize: 7, fontWeight: 500, fontFamily: "inherit" }}>
        Price
      </text>
      <text x={CURVE_SLOT.x + CURVE_SLOT.w / 2} y={BASE_Y + 14} textAnchor="middle" style={{ fill: MUTED, fontSize: 7, fontWeight: 500, fontFamily: "inherit" }}>
        Volume
      </text>

      {/* Fixed background demand curve — identical on all timeline slides */}
      {isIndexShift && (
        <motion.path d={curve.d} fill="none" stroke={`${NAVY}18`} strokeWidth={1.8} strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      )}

      {/* Timeline legend — top-right of chart */}
      {isIndexShift && indexPhase > 0 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <line x1={CURVE_SLOT.x + CURVE_SLOT.w - 90} y1={CURVE_SLOT.y + 8} x2={CURVE_SLOT.x + CURVE_SLOT.w - 76} y2={CURVE_SLOT.y + 8} stroke={NAVY} strokeWidth={2} strokeLinecap="round" />
          <text x={CURVE_SLOT.x + CURVE_SLOT.w - 72} y={CURVE_SLOT.y + 10.5} fontSize="5.5" fontWeight="700" fill={NAVY} style={{ fontFamily: "inherit" }}>Recommended price</text>
          <line x1={CURVE_SLOT.x + CURVE_SLOT.w - 90} y1={CURVE_SLOT.y + 19} x2={CURVE_SLOT.x + CURVE_SLOT.w - 76} y2={CURVE_SLOT.y + 19} stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />
          <text x={CURVE_SLOT.x + CURVE_SLOT.w - 72} y={CURVE_SLOT.y + 21.5} fontSize="5.5" fontWeight="600" fill={MUTED} style={{ fontFamily: "inherit" }}>Prior price</text>
          <line x1={CURVE_SLOT.x + CURVE_SLOT.w - 90} y1={CURVE_SLOT.y + 30} x2={CURVE_SLOT.x + CURVE_SLOT.w - 76} y2={CURVE_SLOT.y + 30} stroke={`${NAVY}30`} strokeWidth={1.8} strokeLinecap="round" />
          <text x={CURVE_SLOT.x + CURVE_SLOT.w - 72} y={CURVE_SLOT.y + 32.5} fontSize="5.5" fontWeight="600" fill={`${NAVY}40`} style={{ fontFamily: "inherit" }}>Day 1 baseline</text>
        </motion.g>
      )}

      {/* Ghost "old" curve — shows previous price schedule during index shifts */}
      {isIndexShift && indexPhase > 0 && (
        <motion.path
          key={`ghost-${indexPhase}`}
          d={ghostIndexCurveD}
          fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="6 4" strokeLinecap="round"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0.35 }}
          transition={{ opacity: { duration: 1.2, ease: "easeOut" } }}
        />
      )}

      {/* Recommended price line (Acme's curve = base) */}
      {showCurve && (
        <motion.path
          d={isIndexShift ? morphedIndexCurveD : curve.d}
          fill="none" stroke={NAVY} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: isSpotlight ? (spotlightIdx === 1 ? 1 : 0.15) : 1,
            strokeWidth: isSpotlight && spotlightIdx === 1 ? 3 : 2,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}

      {/* Calibrated curve label (step 1 only) */}
      {showCurve && (
        <motion.text
          x={curve.sampleAt(0.5).x} y={curve.sampleAt(0.5).y - 10}
          fontSize={isSpotlight && spotlightIdx === 1 ? 10 : 9}
          fontWeight="700" fill={NAVY} textAnchor="middle"
          style={{ fontFamily: "inherit" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: chartStep >= 2 ? 0 : 0.5 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Market curve
        </motion.text>
      )}

      {/* Scatter dots */}
      {SCATTER_DOTS.map((dot, i) => {
        if (shareMode && i % 6 !== 0) return null;
        const pt = curve.sampleAt(dot.t);
        const baseCx = Math.max(CURVE_SLOT.x + 4, Math.min(CURVE_SLOT.x + CURVE_SLOT.w - 4, pt.x + dot.jitterX));
        const scatterY = Math.max(CURVE_SLOT.y + 4, Math.min(BASE_Y - 4, pt.y + dot.offsetY));
        const isBelowCurve = scatterY > pt.y;

        const rawTargetY = isAllToCurve ? (isBelowCurve ? pt.y + dot.residualY : scatterY) : scatterY;
        const toShift = activeIndexCurve ? activeIndexCurve.sampleAt(dot.t).y - pt.y : 0;
        const fromShift = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].sampleAt(dot.t).y - pt.y : 0;
        const shiftOffset = isIndexShift ? fromShift + (toShift - fromShift) * indexMorphProgress : 0;
        const targetY = rawTargetY + shiftOffset;
        const dotColor = isAllToCurve && !isIndexShift ? STATUS_COLORS[dot.status] : MUTED;
        const dotVisible = !isIndexShift || dot.birthMonth <= timelineTargetMonth;
        const dotOpacity = dotVisible ? dotOpacityBase : 0;

        const settling = chartStep === 0;
        const normalizedDelay = dot.driftDelay / 5;
        const wavePhase = normalizedDelay < 0.15 ? 1 : normalizedDelay < 0.30 ? 2 : 3;
        const waveActive = !settling || introPhase >= wavePhase;
        const isPunch = settling && introPhase >= 3;
        const waveStagger = isPunch && wavePhase === 3 ? dot.t * 0.25 : dot.t * 0.6;
        const settlingOpacity = waveActive ? (isPunch ? dotOpacity : dotOpacity * 0.35) : 0;

        let animCx: number | number[];
        let animCy: number | number[];

        if (isAllToCurve) {
          animCx = baseCx;
          animCy = targetY;
        } else if (settling) {
          animCx = baseCx;
          animCy = waveActive ? scatterY : scatterY - 12;
        } else {
          animCx = [baseCx, baseCx + dot.driftDx, baseCx - dot.driftDx * 0.6, baseCx];
          animCy = [targetY, targetY + dot.driftDy, targetY - dot.driftDy * 0.6, targetY];
        }

        return (
          <motion.circle
            key={`dot-${i}`}
            r={dot.r}
            fill={dotColor}
            initial={{ cx: baseCx, cy: scatterY - 12, opacity: 0, scale: 0 }}
            animate={{
              cx: animCx,
              cy: animCy,
              opacity: settling ? settlingOpacity : (waveActive ? dotOpacity : 0),
              scale: waveActive ? 1 : 0,
            }}
            transition={{
              cx: settling
                  ? { duration: 0.01 }
                  : isAllToCurve
                    ? { duration: 0.7, delay: shareMode ? 0 : 0.5 + dot.t * 2.5, ease: EASE }
                    : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" },
              cy: settling
                  ? { duration: waveActive ? 0.8 : 0.01, delay: waveActive ? waveStagger : 0, ease: EASE }
                  : isAllToCurve
                    ? { duration: 0.6 + (Math.abs(dot.offsetY) / 36) * 0.3, delay: shareMode ? 0 : 0.5 + dot.t * 2.5, ease: EASE }
                    : { duration: dot.driftDuration, delay: dot.driftDelay, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" },
              opacity: {
                delay: settling ? (waveActive ? (isPunch && wavePhase < 3 ? 0 : waveStagger) : 0) : isIndexShift ? 0.15 + (i % 36) * 0.012 : 0.1,
                duration: isSpotlight ? 0.5 : isIndexShift ? 0.5 : settling ? (isPunch && wavePhase < 3 ? 0.3 : 0.6) : 0.3,
              },
              scale: shareMode
                ? { delay: settling ? (waveActive ? waveStagger : 0) : isIndexShift ? 0.15 + (i % 36) * 0.012 : 0.1, duration: 0.25 }
                : { delay: settling ? (waveActive ? waveStagger : 0) : isIndexShift ? 0.15 + (i % 36) * 0.012 : 0.1, type: "spring", stiffness: 300 },
            }}
          />
        );
      })}

      {/* Scan line — sweeps left-to-right as dots converge */}
      {isAllToCurve && !isIndexShift && !shareMode && (
        <motion.rect
          y={CURVE_SLOT.y - 4} width={1.5} height={CURVE_SLOT.h + 8}
          fill={STRAT_BLUE} rx={0.75}
          initial={{ x: CURVE_SLOT.x, opacity: 0 }}
          animate={{ x: CURVE_SLOT.x + CURVE_SLOT.w, opacity: [0, 0.5, 0.5, 0.5, 0] }}
          transition={{ duration: 3, delay: 0.4, ease: "linear" }}
        />
      )}

      {/* Highlight product dots — start below curve, auto-animate to curve */}
      {SEGMENT_HIGHLIGHTS.map((seg, si) => {
        const visible = isAllToCurve || (isSpotlight && si <= spotlightIdx);
        if (!visible) return null;

        const rawPt = curve.sampleAt(seg.t);
        const segToShift = activeIndexCurve ? activeIndexCurve.sampleAt(seg.t).y - curve.sampleAt(seg.t).y : 0;
        const segFromShift = indexMorphFrom > 0 ? curve.indexCurves[indexMorphFrom - 1].sampleAt(seg.t).y - curve.sampleAt(seg.t).y : 0;
        const segShiftOffset = isIndexShift ? segFromShift + (segToShift - segFromShift) * indexMorphProgress : 0;
        const pt = isIndexShift ? { x: rawPt.x, y: rawPt.y + segShiftOffset } : rawPt;
        const belowY = pt.y + seg.offsetY;
        const isActive = isSpotlight && si === spotlightIdx;
        const isPast = isSpotlight && si < spotlightIdx;
        const dotLifted = isAllToCurve || isPast || (isActive && isLifted);
        const targetCy = dotLifted ? pt.y : belowY;

        return (
          <g key={seg.label} onClick={isActive ? onSpotClick : undefined} style={{ cursor: isActive ? "pointer" : "default" }}>
            {/* Subtle horizontal price line to Y-axis */}
            {(isActive || isPast) && !isAllToCurve && (
              <motion.line
                x1={CURVE_SLOT.x} x2={pt.x - (isAllToCurve ? 4 : 8)}
                stroke={seg.dotColor} strokeWidth={1} strokeDasharray="3 3"
                initial={{ opacity: 0, y1: belowY, y2: belowY }}
                animate={{ opacity: isAllToCurve ? 0.2 : 0.35, y1: targetCy, y2: targetCy }}
                transition={{ opacity: { duration: 0.4, delay: 0.3 }, y1: { duration: 1.0, ease: EASE }, y2: { duration: 1.0, ease: EASE } }}
              />
            )}

            {/* Dashed line from dot to curve position */}
            {isActive && (
              <motion.line
                x1={pt.x} y1={pt.y} x2={pt.x} y2={belowY}
                stroke={seg.dotColor} strokeWidth={1} strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: dotLifted ? 0 : 0.3 }}
                transition={{ duration: 0.4, delay: dotLifted ? 0 : 0.5 }}
              />
            )}

            {/* Target ring on the curve */}
            {(isActive || isPast || isAllToCurve) && (
              <motion.circle
                cx={pt.x} cy={pt.y}
                r={isAllToCurve ? 4 : 10}
                fill="none" stroke={seg.dotColor}
                strokeWidth={isAllToCurve ? 0.8 : 1.5}
                strokeDasharray={dotLifted ? "0" : "4 3"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: isAllToCurve ? 0.2 : dotLifted ? 0.5 : 0.3, scale: 1 }}
                transition={{ duration: 0.5, delay: isActive ? 0.4 : 0.2 }}
                style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
              />
            )}

            {/* Main dot — starts at belowY, auto-lifts to curve */}
            <motion.circle
              cx={pt.x} r={isAllToCurve ? 2.5 : 6}
              fill={isAllToCurve ? seg.dotColor : "white"}
              stroke={seg.dotColor} strokeWidth={isAllToCurve ? 0.8 : 2.5}
              initial={{ cy: belowY, opacity: 0 }}
              animate={{ cy: targetCy, opacity: 1 }}
              transition={{
                cy: { duration: 1.0, ease: EASE },
                opacity: { duration: 0.3, delay: 0.1 },
              }}
              style={{ cursor: isActive ? "pointer" : "default" }}
            />

            {/* Label near dot (before lift) */}
            {isActive && !dotLifted && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
                <text x={pt.x} y={seg.offsetY < 0 ? belowY - 26 : belowY + 16} fontSize="9" fontWeight="600" fill={seg.dotColor} textAnchor="middle" style={{ fontFamily: "inherit" }}>
                  {seg.label}
                </text>
                <text x={pt.x} y={seg.offsetY < 0 ? belowY - 16 : belowY + 26} fontSize="11" fontWeight="800" fill={seg.dotColor} textAnchor="middle" style={{ fontFamily: "inherit" }}>
                  {seg.oldPrice}
                </text>
              </motion.g>
            )}

            {/* Label above dot (after lift to curve) */}
            {dotLifted && !isAllToCurve && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : isPast ? 0.5 : 0.7 }}
                transition={{ delay: isActive ? 0.6 : 0, duration: 0.4 }}
              >
                <text x={pt.x} y={pt.y - 26} fontSize="9" fontWeight="600" fill={seg.dotColor} textAnchor="middle" style={{ fontFamily: "inherit" }}>
                  {seg.label}
                </text>
                <text x={pt.x} y={pt.y - 16} fontSize="11" fontWeight="800" fill={seg.dotColor} textAnchor="middle" style={{ fontFamily: "inherit" }}>
                  {seg.newPrice}
                </text>
              </motion.g>
            )}

            {/* Info card — to the right of the dot */}
            <AnimatePresence>
              {isActive && (() => {
                const CARD_W = 135;
                const CARD_H = spotPhase >= 2 ? 42 : 28;
                const cardX = pt.x + 28;
                return (
                  <motion.g
                    key={`card-${si}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    style={{ cursor: "pointer" }}
                  >
                    <motion.g
                      initial={{ y: belowY }}
                      animate={{ y: dotLifted ? pt.y : belowY }}
                      transition={{ y: { duration: 1.0, ease: EASE } }}
                    >
                      <motion.rect
                        x={cardX} y={-CARD_H - 4}
                        width={CARD_W}
                        animate={{ height: CARD_H }}
                        transition={{ duration: 0.35, ease: EASE }}
                        rx={3} ry={3}
                        fill="white" fillOpacity={0.95}
                        stroke={seg.dotColor} strokeOpacity={0.2} strokeWidth={0.5}
                      />
                      <motion.rect
                        x={cardX} y={-CARD_H - 4}
                        width={1.5}
                        animate={{ height: CARD_H }}
                        transition={{ duration: 0.35, ease: EASE }}
                        rx={0.75} fill={seg.dotColor}
                      />
                      <AnimatePresence mode="wait">
                        {spotPhase < 2 ? (
                          <motion.g key="before" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            <text x={cardX + 6} y={-CARD_H - 4 + 12} fontSize="7" fontWeight="700" fill={seg.dotColor} style={{ fontFamily: "inherit" }}>
                              {seg.beforeTitle}
                            </text>
                            <text x={cardX + 6} y={-CARD_H - 4 + 22} fontSize="6" fontWeight="500" fill={MUTED} style={{ fontFamily: "inherit" }}>
                              {seg.shortReason}
                            </text>
                          </motion.g>
                        ) : (
                          <motion.g key="after" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                            <text x={cardX + 6} y={-CARD_H - 4 + 12} fontSize="5.5" fontWeight="600" fill={MUTED} style={{ fontFamily: "inherit" }}>
                              Order price {seg.oldPrice}
                            </text>
                            <text x={cardX + 6} y={-CARD_H - 4 + 23} fontSize="5" fontWeight="500" fill={`${MUTED}BB`} style={{ fontFamily: "inherit" }}>
                              {seg.marketSignal}
                            </text>
                            <text x={cardX + 6} y={-CARD_H - 4 + 36} fontSize="7" fontWeight="700" fill={GREEN} style={{ fontFamily: "inherit" }}>
                              Price is now {seg.newPrice}
                            </text>
                          </motion.g>
                        )}
                      </AnimatePresence>
                    </motion.g>
                  </motion.g>
                );
              })()}
            </AnimatePresence>
          </g>
        );
      })}
    </svg>
  );
}
