"use client";

import { motion } from "framer-motion";
import {
  EASE, SQUARE_VERTS, PLOT_CX, PLOT_CY, CONVERGE_MODEL_R,
  DISSOLVE_DOTS, PRICE_SATELLITES, SELECTED_FACTORS,
  SOLID_TINTS, ORANGE, GREEN, NAVY, PURPLE, TEAL, MUTED, CATEGORY_TITLES,
} from "./power-slide-data";

interface ConvergenceModelProps {
  feeding: boolean;
  convergeReady: boolean;
  allAbsorbed: boolean;
  absorbedCount: number;
  skipAnimation?: boolean;
  shareMode: boolean;
}

export function ConvergenceModel({
  feeding, convergeReady, allAbsorbed, absorbedCount, skipAnimation, shareMode,
}: ConvergenceModelProps) {
  if (!feeding) return null;

  const MODEL_R = 80;
  const FEED_SOURCES = [
    { vert: SQUARE_VERTS.product, color: ORANGE, label: CATEGORY_TITLES[1].replace(/ factors$/i, "") },
    { vert: SQUARE_VERTS.market, color: GREEN, label: CATEGORY_TITLES[3].replace(/ factors$/i, "") },
    { vert: SQUARE_VERTS.customer, color: NAVY, label: CATEGORY_TITLES[0].replace(/ factors$/i, "") },
    { vert: SQUARE_VERTS.order, color: PURPLE, label: CATEGORY_TITLES[2].replace(/ factors$/i, "") },
  ];

  return (
    <>
      {!convergeReady && FEED_SOURCES.map((src, si) => {
        const steps = 25;
        const flowCx: number[] = [];
        const flowCy: number[] = [];
        const cpX = src.vert.x + (PLOT_CX - src.vert.x) * 0.5 + (si === 0 ? 0 : si === 1 ? 30 : -30);
        const cpY = src.vert.y + (PLOT_CY - src.vert.y) * 0.5 + (si === 0 ? -20 : 20);
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const u = 1 - t;
          flowCx.push(u * u * src.vert.x + 2 * u * t * cpX + t * t * PLOT_CX);
          flowCy.push(u * u * src.vert.y + 2 * u * t * cpY + t * t * PLOT_CY);
        }
        const pathD = `M ${src.vert.x} ${src.vert.y} Q ${cpX} ${cpY}, ${PLOT_CX} ${PLOT_CY}`;
        return (
          <g key={`feed-src-${si}`}>
            <motion.foreignObject
              x={src.vert.x - 70}
              y={src.vert.y + (si === 0 || si === 2 ? -42 : 14)}
              width={140}
              height={36}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.4, delay: 0.2 + si * 0.15 }}
            >
              <div style={{
                fontSize: 15,
                fontWeight: 800,
                color: src.color,
                letterSpacing: "0.12em",
                fontFamily: "inherit",
                textAlign: "center",
                backgroundColor: SOLID_TINTS[src.color] ?? "white",
                borderRadius: 6,
                padding: "6px 10px",
              }}>
                {src.label.toUpperCase()}
              </div>
            </motion.foreignObject>
            <motion.path
              d={pathD}
              fill="none"
              stroke={src.color}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 0.8, delay: 0.5 + si * 0.2, ease: "easeOut" }}
            />
            {[0, 1.2, 2.4, 3.6].map((extraDelay, di) => (
              <motion.circle
                key={`feed-dot-${si}-${di}`}
                r={3}
                fill={src.color}
                initial={{ opacity: 0 }}
                animate={{
                  cx: flowCx,
                  cy: flowCy,
                  opacity: [0, 0.7, 0.7, 0.5, 0],
                }}
                transition={{
                  duration: 2.0,
                  delay: 0.8 + si * 0.2 + extraDelay,
                  repeat: shareMode ? 0 : Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </g>
        );
      })}
      {!convergeReady && DISSOLVE_DOTS.map((dot, di) => (
        <motion.circle
          key={`dissolve-${di}`}
          fill={dot.color}
          initial={{ cx: dot.x, cy: dot.y, r: dot.r, opacity: 0 }}
          animate={{ cx: PLOT_CX, cy: PLOT_CY, r: 1, opacity: [0, 0.7, 0.5, 0] }}
          transition={{
            duration: 0.9,
            delay: dot.delay,
            ease: [0.4, 0, 0.1, 1],
            opacity: { duration: 0.9, delay: dot.delay, times: [0, 0.15, 0.6, 1] },
          }}
        />
      ))}
      {!convergeReady && (
        <motion.circle
          cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R + 15}
          fill="none" stroke={TEAL} strokeWidth={2}
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: [0, 0.4, 0], scale: [1.3, 1, 0.95] }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeIn" }}
          style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
        />
      )}
      {convergeReady && PRICE_SATELLITES.map((sat, si) => {
        const absorbed = si < absorbedCount;
        return (
          <motion.line
            key={`sat-line-${si}`}
            x1={PLOT_CX} y1={PLOT_CY}
            stroke="#C0C8D0"
            strokeWidth={1.2}
            initial={{ x2: sat.cx, y2: sat.cy, opacity: 0.35 }}
            animate={{
              x2: absorbed ? PLOT_CX : sat.cx,
              y2: absorbed ? PLOT_CY : sat.cy,
              opacity: absorbed ? 0 : 0.35,
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.1, 1] }}
          />
        );
      })}

      <motion.circle
        cx={PLOT_CX} cy={PLOT_CY}
        fill="white" stroke={TEAL} strokeWidth={2.5}
        initial={{ r: MODEL_R, opacity: 0, scale: 0.5 }}
        animate={{ r: convergeReady ? CONVERGE_MODEL_R : MODEL_R, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: convergeReady ? 0 : 0.3, ease: EASE }}
        style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
      />
      {!convergeReady && (
        <motion.circle
          cx={PLOT_CX} cy={PLOT_CY} r={MODEL_R + 3}
          fill="none" stroke={TEAL} strokeWidth={1.5}
          animate={{ opacity: [0, 0.2, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 3, repeat: shareMode ? 0 : Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
        />
      )}
      {convergeReady && (
        <motion.circle
          cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R + 8}
          fill="none" stroke={TEAL} strokeWidth={2}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 1.0, delay: 0.1, ease: "easeOut" }}
          style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
        />
      )}
      {convergeReady && (
        <motion.circle
          cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R + 4}
          fill="none" stroke={`${TEAL}20`} strokeWidth={8}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
      )}
      {allAbsorbed && (
        <motion.circle
          cx={PLOT_CX} cy={PLOT_CY} r={CONVERGE_MODEL_R}
          fill="none" stroke={TEAL} strokeWidth={3}
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY}px` }}
        />
      )}
      {convergeReady && (
        <g key="converge-text">
          <motion.circle
            cx={PLOT_CX} cy={PLOT_CY - 55}
            r={14}
            fill="none"
            stroke={`${TEAL}30`}
            strokeWidth={2.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: allAbsorbed ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx={PLOT_CX} cy={PLOT_CY - 55}
            r={14}
            fill="none"
            stroke={TEAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="22 66"
            initial={{ opacity: 0 }}
            animate={{ opacity: allAbsorbed ? 0 : 0.8, rotate: 360 }}
            transition={{
              opacity: { duration: 0.3 },
              rotate: { duration: 1.2, repeat: shareMode ? 0 : Infinity, ease: "linear" },
            }}
            style={{ transformOrigin: `${PLOT_CX}px ${PLOT_CY - 55}px` }}
          />
          <motion.text
            x={PLOT_CX} y={PLOT_CY - 48}
            textAnchor="middle"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", fill: TEAL, fontFamily: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: allAbsorbed ? 1 : 0 }}
            transition={{ duration: 0.4, delay: allAbsorbed ? 0.15 : 0 }}
          >
            OPTIMIZED
          </motion.text>
          <motion.text
            x={PLOT_CX} y={PLOT_CY + 18}
            textAnchor="middle"
            style={{ fontSize: 54, fontWeight: 800, fontFamily: "inherit" }}
            initial={{ opacity: 0, scale: 1, fill: "#9EAAB4" }}
            animate={allAbsorbed ? {
              opacity: 1,
              scale: [1.06, 1],
              fill: TEAL,
            } : {
              opacity: [0.45, 0.7, 0.45],
              scale: 1,
              fill: "#9EAAB4",
            }}
            transition={allAbsorbed ? {
              opacity: { duration: 0.4 },
              scale: { duration: 0.5, ease: EASE },
              fill: { duration: 0.4 },
            } : {
              opacity: { duration: 1.4, repeat: shareMode ? 0 : Infinity, ease: "easeInOut" },
            }}
          >
            PRICE
          </motion.text>
          <motion.text
            x={PLOT_CX} y={PLOT_CY + 50}
            textAnchor="middle"
            style={{ fontSize: 20, fontWeight: 500, fill: MUTED, fontFamily: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: allAbsorbed ? 0.85 : 0.35 }}
            transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.9 }}
          >
            per SKU
          </motion.text>
          {allAbsorbed && SELECTED_FACTORS.map((sf, si) => {
            const angle = -Math.PI / 2 + (si / SELECTED_FACTORS.length) * Math.PI * 2;
            const orbitR = CONVERGE_MODEL_R + 38;
            const px = PLOT_CX + Math.cos(angle) * orbitR;
            const py = PLOT_CY + Math.sin(angle) * orbitR;
            return (
              <motion.foreignObject
                key={`driver-pill-${si}`}
                x={px - 85}
                y={py - 14}
                width={170}
                height={28}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: skipAnimation ? 0 : 0.6 + si * 0.1, ease: EASE }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 14,
                  backgroundColor: "white",
                  border: `1.5px solid ${sf.color}30`,
                  boxShadow: `0 1px 4px ${sf.color}15`,
                  whiteSpace: "nowrap",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: sf.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: sf.color, fontFamily: "inherit" }}>{sf.label}</span>
                </div>
              </motion.foreignObject>
            );
          })}
          {allAbsorbed && SELECTED_FACTORS.map((sf, si) => {
            const angle = -Math.PI / 2 + (si / SELECTED_FACTORS.length) * Math.PI * 2;
            const orbitR = CONVERGE_MODEL_R + 38;
            const px = PLOT_CX + Math.cos(angle) * orbitR;
            const py = PLOT_CY + Math.sin(angle) * orbitR;
            const edgeX = PLOT_CX + Math.cos(angle) * (CONVERGE_MODEL_R + 6);
            const edgeY = PLOT_CY + Math.sin(angle) * (CONVERGE_MODEL_R + 6);
            return (
              <motion.line
                key={`driver-line-${si}`}
                x1={edgeX} y1={edgeY}
                x2={px} y2={py}
                stroke={`${sf.color}25`}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.5 + si * 0.1 }}
              />
            );
          })}
        </g>
      )}
      {!convergeReady && (
        <g key="model-text">
          <motion.text
            x={PLOT_CX} y={PLOT_CY - 6}
            textAnchor="middle"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", fill: MUTED, fontFamily: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: skipAnimation ? 0 : 0.6 }}
          >
            YOUR
          </motion.text>
          <motion.text
            x={PLOT_CX} y={PLOT_CY + 16}
            textAnchor="middle"
            style={{ fontSize: 24, fontWeight: 800, fill: NAVY, fontFamily: "inherit" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: skipAnimation ? 0 : 0.7 }}
          >
            MODEL
          </motion.text>
        </g>
      )}
      {convergeReady && PRICE_SATELLITES.map((sat, si) => {
        const absorbed = si < absorbedCount;
        return (
          <g key={`sat-${si}`}>
            <motion.circle
              fill="white" stroke={sat.color} strokeWidth={2.5}
              initial={{ cx: sat.cx, cy: sat.cy, r: sat.r, opacity: 1 }}
              animate={{
                cx: absorbed ? PLOT_CX : sat.cx,
                cy: absorbed ? PLOT_CY : sat.cy,
                r: absorbed ? 0 : sat.r,
                opacity: absorbed ? 0 : 1,
              }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.1, 1] }}
            />
            <motion.text
              textAnchor="middle"
              style={{ fontSize: 16, fontWeight: 700, fill: sat.color, fontFamily: "inherit" }}
              initial={{ x: sat.cx, y: sat.cy - sat.r - 10, opacity: 1 }}
              animate={{
                x: absorbed ? PLOT_CX : sat.cx,
                y: absorbed ? PLOT_CY - 20 : sat.cy - sat.r - 10,
                opacity: absorbed ? 0 : 1,
              }}
              transition={{ duration: 1.0, ease: [0.4, 0, 0.1, 1] }}
            >
              {sat.label}
            </motion.text>
            <motion.text
              textAnchor="middle"
              style={{ fontSize: 30, fontWeight: 800, fill: sat.color, fontFamily: "inherit" }}
              initial={{ x: sat.cx, y: sat.cy + 10, opacity: 1 }}
              animate={{
                x: absorbed ? PLOT_CX : sat.cx,
                y: absorbed ? PLOT_CY : sat.cy + 10,
                opacity: absorbed ? 0 : 1,
              }}
              transition={{ duration: 1.0, ease: [0.4, 0, 0.1, 1] }}
            >
              {sat.price}
            </motion.text>
          </g>
        );
      })}
    </>
  );
}
