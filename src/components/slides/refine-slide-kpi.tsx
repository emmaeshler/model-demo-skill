"use client";

import { motion, AnimatePresence } from "framer-motion";
import { NAVY, MUTED, GREEN, RED } from "./refine-slide-data";

interface KpiSidebarProps {
  indexPhase: number;
  currentKpi: { winRate: number; priceAdoption: number; marginImpact: number };
  kpiDelta: { winRate: number; priceAdoption: number; marginImpact: number; eventLabel: string };
  kpiRevealed: boolean;
}

export function KpiSidebar({ indexPhase, currentKpi, kpiDelta, kpiRevealed }: KpiSidebarProps) {
  return (
    <div className="flex flex-col justify-center gap-3 px-3 pt-3 h-full">
      {/* Win rate */}
      <div className="rounded-xl px-3.5 py-2.5" style={{ backgroundColor: `${NAVY}05` }}>
        <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Win rate</div>
        <div className="text-[22px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: NAVY }}>
          {Math.round(currentKpi.winRate)}%
        </div>
        <AnimatePresence mode="wait">
          {indexPhase === 0 ? (
            <motion.div
              key="wr-baseline"
              className="text-[11px] font-semibold mt-1"
              style={{ color: MUTED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              Baseline
            </motion.div>
          ) : kpiRevealed && kpiDelta.winRate !== 0 ? (
            <motion.div
              key={`wr-${indexPhase}`}
              className="text-[11px] font-semibold mt-1"
              style={{ color: kpiDelta.winRate > 0 ? GREEN : RED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {kpiDelta.winRate > 0 ? "↗" : "↘"} {kpiDelta.winRate > 0 ? "+" : ""}{kpiDelta.winRate} pts vs. last checkpoint
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Price adoption */}
      <div className="rounded-xl px-3.5 py-2.5" style={{ backgroundColor: `${NAVY}05` }}>
        <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Price adoption</div>
        <div className="text-[22px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: NAVY }}>
          {Math.round(currentKpi.priceAdoption)}%
        </div>
        <AnimatePresence mode="wait">
          {indexPhase === 0 ? (
            <motion.div
              key="pa-baseline"
              className="text-[11px] font-semibold mt-1"
              style={{ color: MUTED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              Baseline
            </motion.div>
          ) : kpiRevealed ? (
            <motion.div
              key={`pa-${indexPhase}`}
              className="text-[11px] font-semibold mt-1"
              style={{ color: kpiDelta.priceAdoption > 0 ? GREEN : kpiDelta.priceAdoption < 0 ? RED : MUTED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {kpiDelta.priceAdoption > 0 ? `↗ +${kpiDelta.priceAdoption} pts` : kpiDelta.priceAdoption < 0 ? `↘ ${kpiDelta.priceAdoption} pts` : "— No change"}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Margin impact */}
      <motion.div
        className="rounded-xl px-3.5 py-2.5"
        animate={{
          backgroundColor: kpiRevealed && indexPhase > 0 ? (kpiDelta.marginImpact >= 0 ? `${GREEN}0A` : `${RED}0A`) : `${NAVY}05`,
          borderColor: kpiRevealed && indexPhase > 0 ? (kpiDelta.marginImpact >= 0 ? `${GREEN}40` : `${RED}40`) : "transparent",
        }}
        style={{ border: "1.5px solid transparent" }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-baseline gap-1.5">
          <div className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>Margin impact</div>
          <div className="text-[8px] font-medium" style={{ color: `${MUTED}90` }}>vs. no-model repricing</div>
        </div>
        <div className="text-[22px] font-bold tabular-nums leading-tight mt-0.5" style={{ color: kpiRevealed && indexPhase > 0 ? (kpiDelta.marginImpact >= 0 ? GREEN : RED) : NAVY }}>
          +{currentKpi.marginImpact.toFixed(1)}%
        </div>
        <AnimatePresence mode="wait">
          {indexPhase === 0 ? (
            <motion.div
              key="mi-baseline"
              className="text-[11px] font-semibold mt-1"
              style={{ color: MUTED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              Baseline
            </motion.div>
          ) : kpiRevealed && kpiDelta.marginImpact !== 0 ? (
            <motion.div
              key={`mi-${indexPhase}`}
              className="text-[11px] font-semibold mt-1"
              style={{ color: kpiDelta.marginImpact > 0 ? GREEN : RED }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {kpiDelta.marginImpact > 0 ? "↗" : "↘"} {kpiDelta.marginImpact > 0 ? "+" : ""}{kpiDelta.marginImpact} vs. last checkpoint
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
