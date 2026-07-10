"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EASE, SPOTLIGHTS, DRIVERS, MODEL_DRIVERS, CategoryIcon, MUTED,
} from "./power-slide-data";
import { useShareMode } from "@/lib/share-context";

const RAIL_ORDER: Record<string, number> = { CUSTOMER: 0, PRODUCT: 1, MARKET: 3, ORDER: 2 };

interface BottomCardsProps {
  chartStep: number;
  scanCardCount: number;
  driversRevealed: boolean;
}

export function BottomCards({ chartStep, scanCardCount, driversRevealed }: BottomCardsProps) {
  const { shareMode } = useShareMode();

  const [flyTargets] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1400;
    const h = typeof window !== "undefined" ? window.innerHeight : 900;
    return SPOTLIGHTS.map((s) => {
      const railIdx = RAIL_ORDER[s.label] ?? 0;
      return {
        x: -(w * 0.38),
        y: -(h * 0.22) + railIdx * 46,
      };
    });
  });

  const showScanCards =
    (chartStep === 1 && scanCardCount > 0 && !driversRevealed) || chartStep === 2;
  const isFlying = chartStep === 2;

  return (
    <AnimatePresence mode="wait">
      {showScanCards && (
        <motion.div
          key="scan-cards"
          className={`flex flex-col items-center gap-1.5 w-full ${isFlying ? "overflow-visible" : "overflow-hidden"} -mt-10`}
          style={{ maxWidth: "calc(100% - 2rem)", paddingLeft: "5%", paddingRight: "10%" }}
          initial={{ opacity: 0, y: 16, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <motion.div
            className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase"
            style={{ color: MUTED }}
            animate={{ opacity: isFlying ? 0 : 1 }}
            transition={{ duration: isFlying ? 0.2 : 0.4 }}
          >
            Dimensions identified
          </motion.div>
          <div className="flex justify-center gap-2 w-full">
          {SPOTLIGHTS.map((s, i) => {
            const d = DRIVERS[s.cluster];
            const isActive = i === scanCardCount - 1;
            const isRevealed = i < scanCardCount;
            const allDone = scanCardCount >= 4;
            if (!isRevealed && !isFlying) return null;
            return (
              <motion.div
                key={s.label}
                className="relative overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm flex-1"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: d.color,
                  borderColor: `${d.color}20`,
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
                initial={isFlying ? false : { opacity: 0, y: 12, scale: 0.95 }}
                animate={isFlying ? {
                  opacity: 0,
                  x: flyTargets[i].x,
                  y: flyTargets[i].y,
                  scale: 0.3,
                } : {
                  opacity: allDone || isActive ? 1 : 0.55,
                  y: 0,
                  scale: 1,
                }}
                transition={isFlying ? {
                  duration: 0.65,
                  delay: 0.05 + i * 0.08,
                  ease: EASE,
                } : { duration: 0.5, ease: EASE }}
              >
                {isActive && !allDone && !isFlying && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${d.color}40, ${d.color}, ${d.color}40, transparent)`,
                      backgroundSize: "200% 100%",
                    }}
                    animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                    transition={{ duration: 3, repeat: shareMode ? 0 : Infinity, ease: "linear" }}
                  />
                )}
                <div className="px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-shrink-0">
                      {isActive && !allDone && !isFlying && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: d.color }}
                          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: shareMode ? 0 : Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <div className="relative">
                        <CategoryIcon type={s.icon} color={d.color} size={20} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.68rem] font-bold tracking-[0.06em] uppercase truncate" style={{ color: d.color }}>
                        {s.label}
                      </div>
                      <div className="text-[0.62rem]" style={{ color: MUTED }}>
                        {s.count}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </motion.div>
      )}
      {chartStep === 1 && driversRevealed && (
        <motion.div
          key="drivers-reveal"
          className="flex justify-center gap-3 w-full overflow-hidden -mt-10"
          style={{ maxWidth: "calc(100% - 2rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {MODEL_DRIVERS.map((d, i) => (
            <motion.div
              key={d.label}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{
                borderColor: `${d.color}30`,
                backgroundColor: `${d.color}08`,
              }}
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12, ease: EASE }}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[0.75rem] font-semibold whitespace-nowrap" style={{ color: d.color }}>
                {d.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
