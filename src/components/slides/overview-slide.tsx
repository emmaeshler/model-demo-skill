"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const ORANGE = "#E56910";
const SLATE = "#2E5A88";

const MODULES = [
  { number: 1, label: "Design", subtitle: "Architecting the", subtitle2: "right model", color: NAVY },
  { number: 2, label: "Power", subtitle: "Intelligence behind", subtitle2: "recommendations", color: TEAL },
  { number: 3, label: "Execute", subtitle: "From model", subtitle2: "to market", color: ORANGE },
  { number: 4, label: "Refine", subtitle: "Learning from", subtitle2: "every response", color: SLATE },
];

const SVG_W = 1050;
const SVG_H = 340;
const R = 32;
const LINE_Y = 130;
const CX = SVG_W / 2;

const LINE = MODULES.map((_, i) => ({
  x: 105 + i * 210,
  y: LINE_Y,
}));

const SVG_DELAY = 2.2;
const STEP_STAGGER = 0.9;
const TOTAL_ANIM = MODULES.length * STEP_STAGGER;
const COLLAPSE_DELAY = SVG_DELAY + TOTAL_ANIM + 1.2;

const CARD_W = 220;
const CARD_H = 120;
const CARD_R = 16;

const MINI_R = 16;
const MINI_Y = LINE_Y + CARD_H / 2 + 50;
const MINI_SPACING = 160;
const MINI_START = CX - (MODULES.length - 1) * MINI_SPACING / 2;

export const OVERVIEW_TOTAL_STEPS = 1;

export function OverviewSlide({ step, skipAnimation, isActive }: { step: number; skipAnimation?: boolean; isActive: boolean }) {
  const [collapsed, setCollapsed] = useState(!!skipAnimation);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [showWireframe, setShowWireframe] = useState(false);

  useEffect(() => {
    if (!isActive || skipAnimation) {
      setCollapsed(true);
      return;
    }
    setCollapsed(false);
    timerRef.current = setTimeout(
      () => setCollapsed(true),
      COLLAPSE_DELAY * 1000,
    );
    return () => clearTimeout(timerRef.current);
  }, [isActive, skipAnimation]);

  useEffect(() => {
    if (!isActive || skipAnimation) { setShowWireframe(false); return; }
    setShowWireframe(true);
    const t = setTimeout(() => setShowWireframe(false), 2000);
    return () => clearTimeout(t);
  }, [isActive, skipAnimation]);

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-5xl flex-col items-center justify-center px-6 pt-8">
      <motion.h2
        className="text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        style={{ color: NAVY }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, delay: (isActive && !skipAnimation) ? 0.6 : 0, ease: "easeOut" }}
      >
        Five core pillars of a dynamic pricing model
      </motion.h2>

      <div className="flex min-h-[2rem] items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={collapsed ? "done" : "intro"}
            className="max-w-2xl text-center text-base text-muted-foreground"
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: (isActive && !skipAnimation) ? (collapsed ? 0 : 1.1) : 0 }}
          >
            {collapsed
              ? "Each builds on the last — together they form our formula for a dynamic pricing model."
              : "Each one builds on the last. We'll walk through how they add up to our formula for a dynamic model."}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative w-full flex-1 min-h-0 mt-1">
        {/* Wireframe skeleton — visible while real SVG fades in */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: showWireframe ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ pointerEvents: "none" }}
        >
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
            {/* Dashed connecting line */}
            <line
              x1={LINE[0].x} y1={LINE_Y}
              x2={LINE[MODULES.length - 1].x} y2={LINE_Y}
              stroke={NAVY} strokeWidth={1.5} strokeDasharray="8 6" opacity={0.15}
            />
            {/* Arrow hints between circles */}
            {MODULES.slice(0, -1).map((m, i) => {
              const x2 = LINE[i + 1].x - R - 6;
              return (
                <polygon key={`skel-arr-${i}`} points={`${x2},${LINE_Y} ${x2 - 7},${LINE_Y - 4} ${x2 - 7},${LINE_Y + 4}`} fill={m.color} opacity={0.1} />
              );
            })}
            {/* Circle outlines + label placeholders */}
            {MODULES.map((m, i) => (
              <g key={`skel-${i}`}>
                <circle
                  cx={LINE[i].x} cy={LINE_Y} r={R}
                  fill={m.color} fillOpacity={0.04}
                  stroke={m.color} strokeWidth={1.5} strokeDasharray="6 4"
                  opacity={0.25}
                />
                <text
                  x={LINE[i].x} y={LINE_Y + 1}
                  fontSize="18" fontWeight="700" fill={m.color}
                  textAnchor="middle" dominantBaseline="central" opacity={0.18}
                >
                  {m.number}
                </text>
                <rect
                  x={LINE[i].x - 35} y={LINE_Y + R + 16}
                  width={70} height={8} rx={4}
                  fill={m.color} opacity={0.12}
                />
                <rect
                  x={LINE[i].x - 50} y={LINE_Y + R + 32}
                  width={100} height={6} rx={3}
                  fill={NAVY} opacity={0.07}
                />
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Real content */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.8, delay: (isActive && !skipAnimation) ? 2.2 : 0 }}
        >
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
          {/* Connecting arrows between adjacent steps */}
          {MODULES.slice(0, -1).map((m, i) => {
            const x1 = LINE[i].x + R + 6;
            const x2 = LINE[i + 1].x - R - 6;
            const arrowDelay = SVG_DELAY + i * STEP_STAGGER + 0.7;
            return (
              <motion.g key={`arrow-${i}`}>
                <motion.line
                  x1={x1}
                  y1={LINE_Y}
                  x2={x2}
                  y2={LINE_Y}
                  stroke={m.color}
                  strokeWidth={2}
                  animate={{
                    opacity: (isActive && !collapsed) ? 0.5 : 0,
                    pathLength: (isActive && !collapsed) ? 1 : 0,
                  }}
                  transition={collapsed
                    ? { duration: 0.4 }
                    : { duration: 0.6, delay: arrowDelay }
                  }
                />
                <motion.polygon
                  points={`${x2},${LINE_Y} ${x2 - 8},${LINE_Y - 5} ${x2 - 8},${LINE_Y + 5}`}
                  fill={m.color}
                  animate={{ opacity: (isActive && !collapsed) ? 0.5 : 0 }}
                  transition={collapsed
                    ? { duration: 0.3 }
                    : { duration: 0.3, delay: arrowDelay + 0.4 }
                  }
                />
              </motion.g>
            );
          })}

          {/* Module circles, numbers, labels, subtitles — collapse to center */}
          {MODULES.map((m, i) => {
            const pos = LINE[i];
            const delay = SVG_DELAY + i * STEP_STAGGER;
            return (
              <motion.g key={m.label}>
                <motion.circle
                  r={R}
                  fill={m.color}
                  animate={{
                    cx: collapsed ? CX : pos.x,
                    cy: collapsed ? LINE_Y : pos.y,
                    opacity: (isActive && !collapsed) ? 1 : 0,
                    scale: (isActive && !collapsed) ? 1 : (collapsed ? 0.3 : 0),
                  }}
                  transition={collapsed
                    ? { duration: 0.7, delay: i * 0.04, ease: "easeInOut" }
                    : { duration: 0.5, delay, ease: "easeOut" }
                  }
                />
                <motion.text
                  fontSize="18"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                  animate={{
                    x: collapsed ? CX : pos.x,
                    y: collapsed ? LINE_Y : pos.y,
                    opacity: (isActive && !collapsed) ? 1 : 0,
                  }}
                  transition={collapsed
                    ? { duration: 0.5 }
                    : { duration: 0.4, delay: delay + 0.15 }
                  }
                >
                  {m.number}
                </motion.text>

                <motion.text
                  fontSize="14"
                  fontWeight="700"
                  fill={m.color}
                  textAnchor="middle"
                  x={pos.x}
                  y={pos.y + R + 20}
                  animate={{ opacity: (isActive && !collapsed) ? 1 : 0 }}
                  transition={collapsed
                    ? { duration: 0.3 }
                    : { duration: 0.4, delay: delay + 0.3 }
                  }
                >
                  {m.label}
                </motion.text>

                <motion.text
                  fontSize="14"
                  fontWeight="400"
                  fill="#666"
                  textAnchor="middle"
                  x={pos.x}
                  y={pos.y + R + 38}
                  animate={{ opacity: (isActive && !collapsed) ? 0.75 : 0 }}
                  transition={collapsed
                    ? { duration: 0.3 }
                    : { duration: 0.4, delay: delay + 0.5 }
                  }
                >
                  {m.subtitle}
                </motion.text>
                <motion.text
                  fontSize="14"
                  fontWeight="400"
                  fill="#666"
                  textAnchor="middle"
                  x={pos.x}
                  y={pos.y + R + 54}
                  animate={{ opacity: (isActive && !collapsed) ? 0.75 : 0 }}
                  transition={collapsed
                    ? { duration: 0.3 }
                    : { duration: 0.4, delay: delay + 0.5 }
                  }
                >
                  {m.subtitle2}
                </motion.text>
              </motion.g>
            );
          })}

          {/* Central card — appears after collapse */}
          <motion.g
            animate={{
              opacity: (isActive && collapsed) ? 1 : 0,
              scale: (isActive && collapsed) ? 1 : 0.5,
            }}
            transition={{ duration: 0.6, delay: (isActive && collapsed) ? 0.5 : 0, ease: "easeOut" }}
            style={{ transformOrigin: `${CX}px ${LINE_Y}px` }}
          >
            <rect
              x={CX - CARD_W / 2}
              y={LINE_Y - CARD_H / 2}
              width={CARD_W}
              height={CARD_H}
              rx={CARD_R}
              fill={NAVY}
            />
            <text
              x={CX}
              y={LINE_Y - 12}
              fontSize="17"
              fontWeight="700"
              fill="white"
              textAnchor="middle"
            >
              Evidence-Based
            </text>
            <text
              x={CX}
              y={LINE_Y + 12}
              fontSize="17"
              fontWeight="700"
              fill="white"
              textAnchor="middle"
            >
              Pricing Model
            </text>
          </motion.g>

          {/* Static mini stepper — appears after collapse */}
          {MODULES.map((m, i) => {
            const mx = MINI_START + i * MINI_SPACING;
            return (
              <motion.g
                key={`mini-${i}`}
                animate={{
                  opacity: (isActive && collapsed) ? 1 : 0,
                  y: (isActive && collapsed) ? 0 : 12,
                }}
                transition={{ duration: 0.4, delay: (isActive && collapsed) ? 0.8 + i * 0.08 : 0 }}
              >
                <circle cx={mx} cy={MINI_Y} r={MINI_R} fill={m.color} />
                <text
                  x={mx}
                  y={MINI_Y + 1}
                  fontSize="11"
                  fontWeight="700"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {m.number}
                </text>
                <text
                  x={mx}
                  y={MINI_Y + MINI_R + 14}
                  fontSize="11"
                  fontWeight="600"
                  fill={m.color}
                  textAnchor="middle"
                >
                  {m.label}
                </text>
                {i < MODULES.length - 1 && (
                  <line
                    x1={mx + MINI_R + 4}
                    y1={MINI_Y}
                    x2={mx + MINI_SPACING - MINI_R - 4}
                    y2={MINI_Y}
                    stroke={m.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.35}
                  />
                )}
              </motion.g>
            );
          })}
        </svg>
        </motion.div>
      </div>
    </div>
  );
}
