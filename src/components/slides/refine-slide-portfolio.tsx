"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  EASE, NAVY, MUTED, GREEN, RED, STRAT_BLUE,
  PORTFOLIO_SEGMENTS, PORTFOLIO_REVEAL_ORDER,
  HERO_SEGMENTS, HERO_VIEWBOX,
} from "./refine-slide-data";

interface PortfolioGridProps {
  isPortfolio: boolean;
  isPortfolioHero: boolean;
  isActive: boolean;
  shareMode: boolean;
}

function HeroCard({ seg, delay, isActive, shareMode }: {
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
    <motion.div
      className="rounded-2xl relative overflow-hidden"
      style={{ backgroundColor: `${NAVY}04`, border: `1.5px solid ${NAVY}0D`, padding: "20px 20px 14px" }}
      initial={{ opacity: 0, scale: 0.75, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {seg.feature === "delta" && (
        <motion.div
          className="absolute top-3 right-3 rounded-md px-2 py-1"
          style={{
            fontSize: 12, fontWeight: 700,
            color: isPositive ? GREEN : RED,
            backgroundColor: isPositive ? `${GREEN}10` : `${RED}10`,
          }}
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
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <motion.line
            key={`h-${frac}`}
            x1={slot.x}
            y1={slot.y + slot.h * frac}
            x2={slot.x + slot.w}
            y2={slot.y + slot.h * frac}
            stroke={NAVY}
            strokeWidth={0.5}
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ delay: detailDelay, duration: 0.4 }}
          />
        ))}
        {[0.25, 0.5, 0.75].map((frac) => (
          <motion.line
            key={`v-${frac}`}
            x1={slot.x + slot.w * frac}
            y1={slot.y}
            x2={slot.x + slot.w * frac}
            y2={slot.y + slot.h}
            stroke={NAVY}
            strokeWidth={0.5}
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            transition={{ delay: detailDelay, duration: 0.4 }}
          />
        ))}

        {/* Axes */}
        <line x1={slot.x} y1={slot.y} x2={slot.x} y2={slot.y + slot.h} stroke={`${NAVY}20`} strokeWidth={1} />
        <line x1={slot.x} y1={slot.y + slot.h} x2={slot.x + slot.w} y2={slot.y + slot.h} stroke={`${NAVY}20`} strokeWidth={1} />

        {/* Axis labels */}
        <motion.text
          x={slot.x - 6}
          y={slot.y + slot.h / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${slot.x - 6}, ${slot.y + slot.h / 2})`}
          style={{ fontSize: 8, fontWeight: 600, fill: MUTED, letterSpacing: "0.08em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: detailDelay + 0.1, duration: 0.4 }}
        >
          PRICE
        </motion.text>
        <motion.text
          x={slot.x + slot.w / 2}
          y={slot.y + slot.h + 13}
          textAnchor="middle"
          style={{ fontSize: 8, fontWeight: 600, fill: MUTED, letterSpacing: "0.08em" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: detailDelay + 0.1, duration: 0.4 }}
        >
          VOLUME
        </motion.text>

        {/* Axis tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={`yt-${frac}`} x1={slot.x - 3} y1={slot.y + slot.h * frac} x2={slot.x} y2={slot.y + slot.h * frac} stroke={`${NAVY}25`} strokeWidth={0.8} />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <line key={`xt-${frac}`} x1={slot.x + slot.w * frac} y1={slot.y + slot.h} x2={slot.x + slot.w * frac} y2={slot.y + slot.h + 3} stroke={`${NAVY}25`} strokeWidth={0.8} />
        ))}

        {/* Area fill under curve */}
        <motion.path
          d={seg.fillD}
          fill={`${NAVY}06`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: curveDelay + 0.3, duration: 0.5 }}
        />

        {/* Scatter dots */}
        {seg.scatterDots.map((dot, di) => (
          <motion.circle
            key={di}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={NAVY}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: dot.opacity, scale: 1 }}
            transition={{ delay: detailDelay + di * 0.025, duration: 0.3 }}
          />
        ))}

        {/* Main curve */}
        <motion.path
          d={seg.d}
          fill="none"
          stroke={NAVY}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.7}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: curveDelay, ease: "easeOut" }}
        />

        {/* Highlighted price point with crosshairs */}
        <motion.line
          x1={seg.pricePt.x}
          y1={slot.y}
          x2={seg.pricePt.x}
          y2={slot.y + slot.h}
          stroke={STRAT_BLUE}
          strokeWidth={0.8}
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: detailDelay + 0.5, duration: 0.4 }}
        />
        <motion.line
          x1={slot.x}
          y1={seg.pricePt.y}
          x2={slot.x + slot.w}
          y2={seg.pricePt.y}
          stroke={STRAT_BLUE}
          strokeWidth={0.8}
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: detailDelay + 0.5, duration: 0.4 }}
        />
        <motion.circle
          cx={seg.pricePt.x}
          cy={seg.pricePt.y}
          r={6}
          fill={STRAT_BLUE}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isActive ? [0.15, 0.3, 0.15] : 0.2, scale: 1 }}
          transition={{ delay: detailDelay + 0.6, duration: isActive && !shareMode ? 2.5 : 0.4, repeat: isActive && !shareMode ? Infinity : 0, ease: "easeInOut" }}
        />
        <motion.circle
          cx={seg.pricePt.x}
          cy={seg.pricePt.y}
          r={3}
          fill={STRAT_BLUE}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ delay: detailDelay + 0.6, duration: 0.3 }}
        />

        {/* Price label */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: detailDelay + 0.7, duration: 0.3 }}
        >
          <rect
            x={seg.pricePt.x + 6}
            y={seg.pricePt.y - 10}
            width={46}
            height={16}
            rx={3}
            fill={STRAT_BLUE}
            opacity={0.12}
          />
          <text
            x={seg.pricePt.x + 29}
            y={seg.pricePt.y + 1}
            textAnchor="middle"
            style={{ fontSize: 8, fontWeight: 700, fill: STRAT_BLUE }}
          >
            Optimal
          </text>
        </motion.g>
      </svg>

      <div className="text-sm font-semibold mt-1" style={{ color: `${NAVY}CC` }}>
        {seg.name}
      </div>
    </motion.div>
  );
}

function MiniCard({ seg, enterDelay, isActive, shareMode }: {
  seg: typeof PORTFOLIO_SEGMENTS[number];
  enterDelay: number;
  isActive: boolean;
  shareMode: boolean;
}) {
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
}

export function PortfolioGrid({ isPortfolio, isPortfolioHero, isActive, shareMode }: PortfolioGridProps) {
  return (
    <AnimatePresence>
      {isPortfolioHero && (
        <motion.div
          key="portfolio-hero"
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.5, ease: EASE } }}
        >
          <div className="grid grid-cols-2 gap-6 px-8" style={{ maxWidth: 820, width: "100%" }}>
            {HERO_SEGMENTS.map((seg, i) => (
              <HeroCard
                key={seg.name}
                seg={seg}
                delay={0.2 + i * 0.18}
                isActive={isActive}
                shareMode={shareMode}
              />
            ))}
          </div>
        </motion.div>
      )}

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
              return (
                <MiniCard key={seg.name} seg={seg} enterDelay={enterDelay} isActive={isActive} shareMode={shareMode} />
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
