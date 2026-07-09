"use client";

import { motion } from "framer-motion";
import {
  DOTS, DOT_COUNT, CLUSTER_TARGETS, SQUARE_TARGETS, CLUSTER_SPREAD,
  CLUSTER_COLORS, CLUSTER_R, DRIVERS, PLOT, PLOT_CX, PLOT_CY, PLOT_H,
  TEAL, MUTED, SWEEP_DURATION, highlightDotsForCluster, CALLOUTS,
} from "./power-slide-data";

interface DotFieldProps {
  shareMode: boolean;
  chartStep: number;
  introPhase: number;
  feeding: boolean;
  factorsVisible: boolean;
  factorsPhase: number;
  customized: boolean;
  morphPhase: number;
  convergeReady: boolean;
  clustered: boolean;
  sweepActive: boolean;
  scanCardCount: number;
  selectionPhase: number;
  skipAnimation?: boolean;
  dotFill: (dot: (typeof DOTS)[0]) => string;
  dotOpacity: (dot: (typeof DOTS)[0]) => number;
  revealedClusters: Set<number>;
}

export function DotField({
  shareMode, chartStep, introPhase, feeding, factorsVisible, factorsPhase,
  customized, morphPhase, convergeReady, clustered, sweepActive, scanCardCount,
  selectionPhase, skipAnimation, dotFill, dotOpacity, revealedClusters,
}: DotFieldProps) {
  return (
    <>
      {/* ── Cluster circles + labels (step 5) ── */}
      {CLUSTER_SPREAD.map((sp, i) => (
        <g key={`cluster-ring-${i}`}>
          <motion.circle
            cx={sp.cx} cy={sp.cy} r={CLUSTER_R}
            fill="none" stroke={DRIVERS[i].color} strokeWidth={1.2} strokeDasharray="4 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: clustered && !factorsVisible ? 0.25 : 0 }}
            transition={{ delay: clustered && !factorsVisible ? 1.0 + i * 0.12 : 0, duration: 0.5 }}
          />
          <motion.text
            x={sp.cx} y={sp.cy + CLUSTER_R + 20}
            textAnchor="middle"
            style={{ fontSize: 18, fontWeight: 700, fill: DRIVERS[i].color, fontFamily: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: clustered && !factorsVisible ? 0.8 : 0 }}
            transition={{ delay: clustered && !factorsVisible ? 1.2 + i * 0.12 : 0, duration: 0.4 }}
          >
            {DRIVERS[i].label}
          </motion.text>
        </g>
      ))}

      {/* ── Square outline (step 6+) ── */}
      <motion.polygon
        points={`180,60 830,60 830,400 180,400`}
        fill="none"
        stroke={TEAL}
        strokeWidth={selectionPhase >= 5 && !feeding ? 2.5 : 1.5}
        strokeDasharray={selectionPhase >= 5 && !feeding ? "none" : "5 4"}
        initial={{ opacity: 0 }}
        animate={{ opacity: factorsPhase >= 1 && factorsPhase < 2 && !customized && !feeding ? 0.25 : 0 }}
        transition={{ delay: factorsPhase >= 1 && !customized ? 0.2 : 0, duration: 0.4 }}
      />

      {/* ── Data dots ── */}
      {DOTS.map((dot, i) => {
        if (shareMode && i % 4 !== 0) return null;
        const convAngle = (i / DOT_COUNT) * Math.PI * 2;
        let dotEntranceDelay = chartStep === 0 ? dot.delay * 1.6 + (i % 40) * 0.012 : 0;

        let targetCx: number | number[];
        let targetCy: number | number[];
        let targetFill = dotFill(dot);
        let targetOpacity = dotOpacity(dot);
        let targetR = dot.r;
        let cxTransition: Record<string, unknown>;
        let cyTransition: Record<string, unknown>;
        let opacityDelay = 0.1;

        if (feeding) {
          const cl = CLUSTER_TARGETS[i];
          const feedDist = 12 + (i % 9) * 2.5;
          const feedAngle = convAngle;
          targetCx = PLOT_CX + Math.cos(feedAngle) * feedDist;
          targetCy = PLOT_CY + Math.sin(feedAngle) * feedDist;
          targetFill = CLUSTER_COLORS[cl.ci];
          targetOpacity = convergeReady ? 0 : 0.2;
          targetR = convergeReady ? 0 : dot.r * 0.5;
          cxTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: 1.2, delay: dot.delay * 0.4, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = dot.delay * 0.4 + 0.3;
        } else if (factorsVisible && factorsPhase >= 1) {
          const sq = SQUARE_TARGETS[i];
          targetCx = sq.x;
          targetCy = sq.y;
          targetFill = TEAL;
          targetOpacity = customized ? 0 : morphPhase >= 0 ? 0.1 : 0.35;
          targetR = customized ? 0 : morphPhase >= 0 ? dot.r * 0.4 : dot.r * 0.7;
          cxTransition = { duration: 0.7, delay: dot.delay * 0.15, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: 0.7, delay: dot.delay * 0.15, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = dot.delay * 0.15;
        } else if (factorsVisible) {
          const cl = CLUSTER_TARGETS[i];
          targetCx = cl.x;
          targetCy = cl.y;
          targetFill = CLUSTER_COLORS[cl.ci];
          targetOpacity = customized ? 0 : 0.55;
          targetR = customized ? 0 : dot.r * 0.8;
          cxTransition = { duration: 0.6, delay: dot.delay * 0.1, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: 0.6, delay: dot.delay * 0.1, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = dot.delay * 0.1;
        } else if (clustered) {
          const sp = CLUSTER_SPREAD[dot.cluster];
          const origD = DRIVERS[dot.cluster];
          const spreadCx = sp.cx + (dot.cx - origD.cx) * (CLUSTER_R / 48);
          const spreadCy = sp.cy + (dot.cy - origD.cy) * (CLUSTER_R / 48);
          targetCx = Math.max(sp.cx - CLUSTER_R + 4, Math.min(sp.cx + CLUSTER_R - 4, spreadCx));
          targetCy = Math.max(sp.cy - CLUSTER_R + 4, Math.min(sp.cy + CLUSTER_R - 4, spreadCy));
          targetFill = DRIVERS[dot.cluster].color;
          targetOpacity = 0.65;
          cxTransition = { duration: 1.2, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: 1.2, delay: dot.delay * 0.3, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = dot.delay * 0.3;
        } else if (chartStep === 0 && introPhase < 5) {
          const wavePhase = dot.delay < 0.14 ? 0 : dot.delay < 0.27 ? 1 : 3;
          const waveActive = introPhase >= wavePhase;
          const isPunch = introPhase >= 3;
          const waveStagger = (dot.driftDelay / 5) * (isPunch && wavePhase === 3 ? 0.3 : 0.7);
          dotEntranceDelay = waveActive ? waveStagger : 0;
          targetCx = dot.sx;
          targetCy = waveActive ? dot.sy : dot.sy - 18;
          targetR = waveActive ? dot.r : 0;
          targetOpacity = waveActive ? (isPunch ? dot.scatterOpacity : dot.scatterOpacity * 0.5) : 0;
          cxTransition = { duration: waveActive ? 0.8 : 0.01, delay: waveActive ? waveStagger : 0, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: waveActive ? 0.8 : 0.01, delay: waveActive ? waveStagger : 0, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = waveActive ? (isPunch && wavePhase < 3 ? 0 : waveStagger) : 0;
        } else if (introPhase >= 5 || chartStep > 0) {
          targetCx = chartStep > 0
            ? dot.sx
            : [dot.sx, dot.sx + dot.driftDx, dot.sx - dot.driftDx * 0.6, dot.sx];
          targetCy = chartStep > 0
            ? dot.sy
            : [dot.sy, dot.sy + dot.driftDy, dot.sy - dot.driftDy * 0.6, dot.sy];
          if (chartStep === 1) {
            cxTransition = { duration: 0.4, ease: "easeOut" };
            cyTransition = { duration: 0.4, ease: "easeOut" };
          } else if (chartStep > 1) {
            cxTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
            cyTransition = { duration: 0.9, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
          } else {
            cxTransition = { duration: dot.driftDuration, delay: dot.driftDelay, repeat: shareMode ? 0 : Infinity, ease: "easeInOut" };
            cyTransition = { duration: dot.driftDuration, delay: dot.driftDelay, repeat: shareMode ? 0 : Infinity, ease: "easeInOut" };
          }
          opacityDelay = chartStep === 1 ? dot.delay * 0.3 : dotEntranceDelay + 0.2;
        } else {
          targetCx = dot.sx;
          targetCy = dot.sy;
          cxTransition = { duration: 0.5, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
          cyTransition = { duration: 0.6, delay: dotEntranceDelay, ease: [0.22, 1, 0.36, 1] };
          opacityDelay = dotEntranceDelay;
        }

        return (
          <motion.circle
            key={i}
            fill={targetFill}
            initial={{ cx: dot.sx, cy: dot.sy - 18, r: 0, fillOpacity: 0 }}
            animate={{
              cx: targetCx,
              cy: targetCy,
              r: targetR,
              fillOpacity: targetOpacity,
            }}
            transition={{
              cx: cxTransition,
              cy: cyTransition,
              r: { duration: 0.5, delay: dotEntranceDelay, ease: "easeOut" },
              fillOpacity: { duration: 0.8, delay: opacityDelay },
              fill: { duration: 0.8, delay: chartStep === 1 ? dot.delay * 0.3 : 0.1 },
            }}
          />
        );
      })}

      {/* ── Highlight rings — dots "found" by the sweep ── */}
      {sweepActive && scanCardCount > 0 && Array.from(revealedClusters).flatMap(ci =>
        highlightDotsForCluster(ci).map(hi => ({ ...hi, ci }))
      ).map((hi) => {
        const dot = DOTS[hi.index];
        const currentDriver = DRIVERS[hi.ci];
        const sweepDelay = hi.normalizedY * (SWEEP_DURATION / 2);
        return (
          <motion.circle
            key={`hl-${hi.ci}-${hi.index}`}
            cx={dot.sx}
            cy={dot.sy}
            fill="none"
            stroke={currentDriver.color}
            strokeWidth={1.2}
            initial={{ r: dot.r + 1, opacity: 0 }}
            animate={{
              r: [dot.r + 1, dot.r + 7, dot.r + 10],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.2,
              delay: sweepDelay + 0.3,
              repeat: shareMode ? 0 : Infinity,
              repeatDelay: SWEEP_DURATION - 1.2,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* ── Callout annotations (step 0 only) ── */}
      {CALLOUTS.map((c, i) => {
        const showCallout = chartStep === 0 && introPhase >= 5;
        const enterDelay = 0.3 + i * 0.25;
        const exitDelay = 0.1 + i * 0.15;
        return (
          <motion.g key={`callout-${i}`}>
            <motion.circle
              r={8} fill="none" strokeWidth={2}
              cx={c.x} cy={c.y} stroke={c.color}
              initial={{ opacity: 0 }}
              animate={{ opacity: showCallout ? 0.5 : 0 }}
              transition={{ duration: showCallout ? 0.5 : 0.7, delay: showCallout ? enterDelay : exitDelay, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.circle
              r={4} cx={c.x} cy={c.y} fill={c.color}
              initial={{ fillOpacity: 0 }}
              animate={{ fillOpacity: showCallout ? 0.7 : 0 }}
              transition={{ duration: showCallout ? 0.4 : 0.7, delay: showCallout ? enterDelay : exitDelay }}
            />
            {showCallout && (
              <motion.circle
                cx={c.x} cy={c.y} r={8}
                fill="none" stroke={c.color} strokeWidth={1.5}
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 0.8, delay: enterDelay + 0.1, ease: "easeOut" }}
                style={{ transformOrigin: `${c.x}px ${c.y}px` }}
              />
            )}
            <motion.text
              x={c.x + c.labelDx} y={c.y + c.labelDy}
              textAnchor={c.anchor}
              style={{ fill: c.color, fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showCallout ? 1 : 0 }}
              transition={{ duration: showCallout ? 0.4 : 0.6, delay: showCallout ? enterDelay + 0.15 : exitDelay }}
            >
              {c.label}
            </motion.text>
            <motion.text
              x={c.x + c.labelDx} y={c.y + c.labelDy + 18}
              textAnchor={c.anchor}
              style={{ fill: c.color, fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showCallout ? 1 : 0 }}
              transition={{ duration: showCallout ? 0.4 : 0.6, delay: showCallout ? enterDelay + 0.3 : exitDelay }}
            >
              {c.price}
            </motion.text>
          </motion.g>
        );
      })}
    </>
  );
}
