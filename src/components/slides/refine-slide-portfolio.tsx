"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NAVY, MUTED, GREEN, RED, STRAT_BLUE,
  PORTFOLIO_SEGMENTS,
  HERO_SEGMENTS, HERO_VIEWBOX,
} from "./refine-slide-data";

interface PortfolioGridProps {
  isPortfolio: boolean;
  isPortfolioHero: boolean;
  isActive: boolean;
  shareMode: boolean;
  portfolioPhase: number;
}

function HeroCardContent({ seg, delay, isActive, shareMode }: {
  seg: typeof HERO_SEGMENTS[number];
  delay: number;
  isActive: boolean;
  shareMode: boolean;
}) {
  const curveDelay = delay + 0.3;
  const detailDelay = curveDelay + 0.4;
  const isPositive = seg.delta.startsWith("+");
  const slot = seg.slot;

  return (
    <>
      {seg.feature === "delta" && (
        <motion.div
          className="absolute top-3 right-3 rounded-md px-2 py-1"
          style={{ fontSize: 12, fontWeight: 700, color: isPositive ? GREEN : RED, backgroundColor: isPositive ? `${GREEN}10` : `${RED}10` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: detailDelay + 0.3, duration: 0.3 }}
        >
          {seg.delta}
        </motion.div>
      )}
      {seg.feature === "live" && (
        <motion.div
          className="absolute top-3.5 right-3.5 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: detailDelay + 0.3, duration: 0.3 }}
        >
          <motion.div
            className="rounded-full"
            style={{ width: 7, height: 7, backgroundColor: GREEN }}
            animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 2, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" }}
          />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: GREEN, textTransform: "uppercase" as const }}>Live</span>
        </motion.div>
      )}
      <svg viewBox={HERO_VIEWBOX} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0.25, 0.5, 0.75].map((frac) => (
          <motion.line key={`h-${frac}`} x1={slot.x} y1={slot.y + slot.h * frac} x2={slot.x + slot.w} y2={slot.y + slot.h * frac} stroke={NAVY} strokeWidth={0.5} strokeDasharray="3 4" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ delay: detailDelay, duration: 0.4 }} />
        ))}
        {[0.25, 0.5, 0.75].map((frac) => (
          <motion.line key={`v-${frac}`} x1={slot.x + slot.w * frac} y1={slot.y} x2={slot.x + slot.w * frac} y2={slot.y + slot.h} stroke={NAVY} strokeWidth={0.5} strokeDasharray="3 4" initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} transition={{ delay: detailDelay, duration: 0.4 }} />
        ))}
        <line x1={slot.x} y1={slot.y} x2={slot.x} y2={slot.y + slot.h} stroke={`${NAVY}20`} strokeWidth={1} />
        <line x1={slot.x} y1={slot.y + slot.h} x2={slot.x + slot.w} y2={slot.y + slot.h} stroke={`${NAVY}20`} strokeWidth={1} />
        <motion.text x={slot.x - 6} y={slot.y + slot.h / 2} textAnchor="middle" transform={`rotate(-90, ${slot.x - 6}, ${slot.y + slot.h / 2})`} style={{ fontSize: 8, fontWeight: 600, fill: MUTED, letterSpacing: "0.08em" }} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: detailDelay + 0.1, duration: 0.4 }}>PRICE</motion.text>
        <motion.text x={slot.x + slot.w / 2} y={slot.y + slot.h + 13} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: MUTED, letterSpacing: "0.08em" }} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: detailDelay + 0.1, duration: 0.4 }}>VOLUME</motion.text>
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={`yt-${frac}`} x1={slot.x - 3} y1={slot.y + slot.h * frac} x2={slot.x} y2={slot.y + slot.h * frac} stroke={`${NAVY}25`} strokeWidth={0.8} />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={`xt-${frac}`} x1={slot.x + slot.w * frac} y1={slot.y + slot.h} x2={slot.x + slot.w * frac} y2={slot.y + slot.h + 3} stroke={`${NAVY}25`} strokeWidth={0.8} />
        ))}
        <motion.path d={seg.fillD} fill={`${NAVY}06`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: curveDelay + 0.3, duration: 0.5 }} />
        {seg.scatterDots.map((dot, di) => (
          <motion.circle key={di} cx={dot.cx} cy={dot.cy} r={dot.r} fill={NAVY} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: dot.opacity, scale: 1 }} transition={{ delay: detailDelay + di * 0.025, duration: 0.3 }} />
        ))}
        <motion.path d={seg.d} fill="none" stroke={NAVY} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: curveDelay, ease: "easeOut" }} />
        <motion.line x1={seg.pricePt.x} y1={slot.y} x2={seg.pricePt.x} y2={slot.y + slot.h} stroke={STRAT_BLUE} strokeWidth={0.8} strokeDasharray="4 3" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: detailDelay + 0.5, duration: 0.4 }} />
        <motion.line x1={slot.x} y1={seg.pricePt.y} x2={slot.x + slot.w} y2={seg.pricePt.y} stroke={STRAT_BLUE} strokeWidth={0.8} strokeDasharray="4 3" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: detailDelay + 0.5, duration: 0.4 }} />
        <motion.circle cx={seg.pricePt.x} cy={seg.pricePt.y} r={6} fill={STRAT_BLUE} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isActive ? [0.15, 0.3, 0.15] : 0.2, scale: 1 }} transition={{ delay: detailDelay + 0.6, duration: isActive && !shareMode ? 2.5 : 0.4, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" }} />
        <motion.circle cx={seg.pricePt.x} cy={seg.pricePt.y} r={3} fill={STRAT_BLUE} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.8, scale: 1 }} transition={{ delay: detailDelay + 0.6, duration: 0.3 }} />
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: detailDelay + 0.7, duration: 0.3 }}>
          <rect x={seg.pricePt.x + 6} y={seg.pricePt.y - 10} width={46} height={16} rx={3} fill={STRAT_BLUE} opacity={0.12} />
          <text x={seg.pricePt.x + 29} y={seg.pricePt.y + 1} textAnchor="middle" style={{ fontSize: 8, fontWeight: 700, fill: STRAT_BLUE }}>Optimal</text>
        </motion.g>
      </svg>
      <div className="text-xs font-semibold mt-0.5" style={{ color: `${NAVY}CC` }}>
        {seg.name}
      </div>
    </>
  );
}

function GridCardContent({ seg, cols }: { seg: typeof PORTFOLIO_SEGMENTS[number]; cols: number }) {
  const isLarge = cols <= 4;
  const isMedium = cols <= 5;
  const isPositive = seg.delta.startsWith("+");

  return (
    <>
      {seg.feature === "delta" && (
        <div
          className={`absolute ${isLarge ? "top-2 right-2.5 rounded-md px-1.5 py-0.5" : "top-1 right-1.5 rounded px-1 py-0.5"}`}
          style={{ fontSize: isLarge ? 11 : isMedium ? 9 : 7, fontWeight: 700, color: isPositive ? GREEN : RED, backgroundColor: isPositive ? `${GREEN}10` : `${RED}10` }}
        >
          {seg.delta}
        </div>
      )}
      {seg.feature === "live" && (
        <div className={`absolute ${isLarge ? "top-2.5 right-3" : "top-1.5 right-2"} flex items-center gap-1`}>
          <div className="rounded-full" style={{ width: isLarge ? 6 : 4, height: isLarge ? 6 : 4, backgroundColor: GREEN }} />
          <span style={{ fontSize: isLarge ? 9 : 6, fontWeight: 600, letterSpacing: "0.08em", color: GREEN, textTransform: "uppercase" as const }}>Live</span>
        </div>
      )}
      <svg viewBox="0 0 60 28" className="w-full" preserveAspectRatio="xMidYMid meet">
        <path d={`${seg.d} L 56,26 L 4,26 Z`} fill={`${NAVY}06`} />
        <line x1={4} y1={26} x2={56} y2={26} stroke={`${NAVY}15`} strokeWidth={0.5} />
        <line x1={4} y1={2} x2={4} y2={26} stroke={`${NAVY}15`} strokeWidth={0.5} />
        <path d={seg.d} fill="none" stroke={NAVY} strokeWidth={1.5} strokeLinecap="round" opacity={0.65} />
        {seg.scatterDots?.map((dot, di) => (
          <circle key={di} cx={dot.cx} cy={dot.cy} r={dot.r} fill={NAVY} opacity={0.35} />
        ))}
        {seg.priceDotPt && (
          <circle cx={seg.priceDotPt.x} cy={seg.priceDotPt.y} r={1.5} fill={STRAT_BLUE} opacity={0.7} />
        )}
      </svg>
      <div className={`${isLarge ? "text-xs" : isMedium ? "text-[10px]" : "text-[9px]"} font-medium truncate mt-0.5`} style={{ color: MUTED }}>
        {seg.name}
      </div>
    </>
  );
}

export function PortfolioGrid({ isPortfolio, isPortfolioHero, isActive, shareMode, portfolioPhase }: PortfolioGridProps) {
  const isVisible = isPortfolioHero || isPortfolio;

  const cols = isPortfolioHero ? 2
    : portfolioPhase >= 3 ? 10
    : portfolioPhase >= 2 ? 5
    : 4;
  const visibleCount = isPortfolioHero ? 4
    : portfolioPhase >= 3 ? 30
    : portfolioPhase >= 2 ? 15
    : 8;
  const isHero = isPortfolioHero;
  const isLarge = isHero;
  const showHeroContent = isPortfolioHero;

  const visibleSegments = useMemo(
    () => PORTFOLIO_SEGMENTS.slice(0, visibleCount),
    [visibleCount],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="portfolio-unified"
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <div
            className="grid px-4"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              maxWidth: isHero ? 780 : 1100,
              width: "100%",
              gap: isLarge ? 16 : 8,
              transition: "max-width 0.8s cubic-bezier(0.22, 1, 0.36, 1), gap 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <AnimatePresence>
              {visibleSegments.map((seg, i) => {
                const heroSeg = isPortfolioHero && i < 4 ? HERO_SEGMENTS[i] : null;
                const isMedium = cols <= 5;
                const cardPad = isLarge ? "12px 16px 10px" : isMedium ? "8px 10px 6px" : "8px 10px 6px";
                return (
                  <motion.div
                    key={seg.name}
                    layout
                    className={`${isLarge ? "rounded-xl" : "rounded-lg"} relative overflow-hidden`}
                    style={{
                      backgroundColor: `${NAVY}04`,
                      border: `1px solid ${NAVY}0A`,
                      padding: cardPad,
                    }}
                    initial={{ opacity: 0, scale: isPortfolioHero ? 0.75 : 0.6, y: isPortfolioHero ? 30 : 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: isPortfolioHero ? 0.6 : 0.35, delay: isPortfolioHero ? 0.2 + i * 0.18 : 0 },
                      scale: { duration: isPortfolioHero ? 0.6 : 0.35, delay: isPortfolioHero ? 0.2 + i * 0.18 : 0 },
                      y: { duration: isPortfolioHero ? 0.6 : 0.35, delay: isPortfolioHero ? 0.2 + i * 0.18 : 0 },
                    }}
                  >
                    <motion.div
                      animate={{ opacity: heroSeg && showHeroContent ? 0 : 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <GridCardContent seg={seg} cols={cols} />
                    </motion.div>
                    {heroSeg && !(isPortfolio && portfolioPhase >= 2) && (
                      <motion.div
                        className="absolute inset-0 overflow-hidden"
                        style={{ padding: cardPad, pointerEvents: "none" }}
                        animate={{ opacity: showHeroContent ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <HeroCardContent seg={heroSeg} delay={0.2 + i * 0.18} isActive={isActive} shareMode={shareMode} />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.p
            className="mt-4 text-center text-sm"
            style={{ color: MUTED }}
            animate={{ opacity: portfolioPhase >= 4 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            Showing 30 of <span style={{ color: NAVY, fontWeight: 700 }}>247 segments</span> monitored continuously
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
