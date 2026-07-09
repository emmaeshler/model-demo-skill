"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  EASE, NAVY, MUTED, GREEN, RED, STRAT_BLUE,
  PORTFOLIO_SEGMENTS, PORTFOLIO_REVEAL_ORDER,
} from "./refine-slide-data";

interface PortfolioGridProps {
  isPortfolio: boolean;
  isActive: boolean;
  shareMode: boolean;
}

export function PortfolioGrid({ isPortfolio, isActive, shareMode }: PortfolioGridProps) {
  return (
    <AnimatePresence>
      {isPortfolio && (
        <motion.div
          key="portfolio-grid"
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-10 gap-2 px-4" style={{ maxWidth: 1100, width: "100%" }}>
            {PORTFOLIO_SEGMENTS.map((seg, i) => {
              const revealIdx = PORTFOLIO_REVEAL_ORDER[i];
              const enterDelay = revealIdx === 0 ? 0.15 : 0.5 + Math.sqrt(revealIdx - 1) * 0.38;
              const curveDelay = enterDelay + 0.2;
              const isPositive = seg.delta.startsWith("+");

              return (
                <motion.div
                  key={seg.name}
                  className="rounded-lg px-2.5 pt-2 pb-1.5 relative overflow-hidden"
                  style={{ backgroundColor: `${NAVY}04`, border: `1px solid ${NAVY}0A` }}
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, delay: enterDelay, ease: EASE }}
                >
                  {seg.feature === "delta" && (
                    <motion.div
                      className="absolute top-1 right-1.5 rounded px-1 py-0.5"
                      style={{
                        fontSize: 7, fontWeight: 700,
                        color: isPositive ? GREEN : RED,
                        backgroundColor: isPositive ? `${GREEN}10` : `${RED}10`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: curveDelay + 0.5, duration: 0.3 }}
                    >
                      {seg.delta}
                    </motion.div>
                  )}

                  {seg.feature === "live" && (
                    <motion.div
                      className="absolute top-1.5 right-2 flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: curveDelay + 0.6, duration: 0.3 }}
                    >
                      <motion.div
                        className="rounded-full"
                        style={{ width: 4, height: 4, backgroundColor: GREEN }}
                        animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
                        transition={{ duration: 2, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut", delay: isActive ? curveDelay + 0.8 : 0 }}
                      />
                      <span style={{ fontSize: 6, fontWeight: 600, letterSpacing: "0.08em", color: GREEN, textTransform: "uppercase" as const }}>Live</span>
                    </motion.div>
                  )}

                  <svg viewBox="0 0 60 28" className="w-full" preserveAspectRatio="xMidYMid meet">
                    <motion.path
                      d={`${seg.d} L 56,26 L 4,26 Z`}
                      fill={`${NAVY}06`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: curveDelay + 0.3, duration: 0.5 }}
                    />
                    <line x1={4} y1={26} x2={56} y2={26} stroke={`${NAVY}15`} strokeWidth={0.5} />
                    <line x1={4} y1={2} x2={4} y2={26} stroke={`${NAVY}15`} strokeWidth={0.5} />
                    <motion.path
                      d={seg.d}
                      fill="none"
                      stroke={NAVY}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      opacity={0.65}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: curveDelay, ease: "easeOut" }}
                    />

                    {seg.scatterDots?.map((dot, di) => (
                      <motion.circle
                        key={di}
                        cx={dot.cx}
                        cy={dot.cy}
                        r={dot.r}
                        fill={NAVY}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        transition={{ delay: curveDelay + 0.4 + di * 0.06, duration: 0.3 }}
                      />
                    ))}

                    {seg.priceDotPt && (
                      <>
                        <motion.circle
                          cx={seg.priceDotPt.x}
                          cy={seg.priceDotPt.y}
                          r={3.5}
                          fill={STRAT_BLUE}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isActive ? [0, 0.2, 0.08, 0.2] : 0 }}
                          transition={{ delay: isActive ? curveDelay + 0.5 : 0, duration: 3, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" }}
                        />
                        <motion.circle
                          cx={seg.priceDotPt.x}
                          cy={seg.priceDotPt.y}
                          r={1.5}
                          fill={STRAT_BLUE}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                          transition={{ delay: curveDelay + 0.5, duration: 0.3 }}
                        />
                      </>
                    )}
                  </svg>

                  <div className="text-[9px] font-medium truncate mt-0.5" style={{ color: MUTED }}>
                    {seg.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.p
            className="mt-4 text-center text-sm"
            style={{ color: MUTED }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 0.5 }}
          >
            Showing 30 of <span style={{ color: NAVY, fontWeight: 700 }}>247 segments</span> monitored continuously
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
