"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useShareMode } from "@/lib/share-context";

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";
const NAVY = "#00446A";

const R = 70;
const SIZE = R * 2 + 10;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function ModelTransitionSlide({ onDone }: { onDone: () => void }) {
  const { shareMode } = useShareMode();
  // 0=circle visible, 1=halves split apart, 2=halves morph to sidebar
  const [phase, setPhase] = useState(shareMode ? 2 : 0);

  useEffect(() => {
    if (shareMode) { onDone(); return; }
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 700),
      setTimeout(onDone, 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone, shareMode]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] w-full items-center justify-center relative overflow-hidden">
      {/* Divider line + labels — fade out as halves split */}
      <motion.div
        className="absolute z-20 pointer-events-none"
        animate={{ opacity: phase >= 1 ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <line x1={CX - R + 16} y1={CY} x2={CX + R - 16} y2={CY} stroke={`${NAVY}18`} strokeWidth={1.5} />
          <text x={CX} y={CY - R + 18} fontSize="8" fontWeight="700" letterSpacing="0.14em" fill={`${NAVY}45`} textAnchor="middle">PRICING MODEL</text>
          <text x={CX} y={CY - 8} fontSize="13" fontWeight="700" fill={ML_GREEN} textAnchor="middle">ML Prediction</text>
          <text x={CX} y={CY + 22} fontSize="13" fontWeight="700" fill={STRAT_BLUE} textAnchor="middle">Strategic Guidance</text>
        </svg>
      </motion.div>

      {/* TOP HALF — splits up, then morphs to sidebar */}
      <motion.div
        className="fixed z-40 overflow-hidden"
        style={{ backgroundColor: `${ML_GREEN}0C`, border: `1px solid ${NAVY}12` }}
        initial={{
          left: "calc(50% - 75px)",
          top: "calc(50% - 75px)",
          width: 150,
          height: 75,
          borderRadius: "75px 75px 0 0",
          opacity: 1,
        }}
        animate={
          phase === 0
            ? {
                left: "calc(50% - 75px)",
                top: "calc(50% - 75px)",
                width: 150,
                height: 75,
                borderRadius: "75px 75px 0 0",
                opacity: 1,
              }
            : phase === 1
              ? {
                  left: "calc(50% - 75px)",
                  top: "calc(50% - 135px)",
                  width: 150,
                  height: 75,
                  borderRadius: "75px 75px 4px 4px",
                  opacity: 1,
                }
              : {
                  left: 0,
                  top: 49,
                  width: 42,
                  height: "calc(50% - 49px)",
                  borderRadius: "0 4px 4px 0",
                  opacity: 1,
                }
        }
        transition={
          phase === 2
            ? {
                borderRadius: { duration: 0.35, ease },
                left: { duration: 0.8, delay: 0.1, ease },
                top: { duration: 0.8, delay: 0.1, ease },
                width: { duration: 0.7, delay: 0.15, ease },
                height: { duration: 0.7, delay: 0.15, ease },
              }
            : { duration: 0.6, ease }
        }
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: ML_GREEN }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center pl-4 pr-3"
          style={{ writingMode: "vertical-lr" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <span className="text-[10px] font-bold tracking-wide whitespace-nowrap rotate-180" style={{ color: ML_GREEN }}>
            ML Prediction
          </span>
        </motion.div>
      </motion.div>

      {/* BOTTOM HALF — splits down, then morphs to sidebar */}
      <motion.div
        className="fixed z-40 overflow-hidden"
        style={{ backgroundColor: `${STRAT_BLUE}0C`, border: `1px solid ${NAVY}12` }}
        initial={{
          left: "calc(50% - 75px)",
          top: "50%",
          width: 150,
          height: 75,
          borderRadius: "0 0 75px 75px",
          opacity: 1,
        }}
        animate={
          phase === 0
            ? {
                left: "calc(50% - 75px)",
                top: "50%",
                width: 150,
                height: 75,
                borderRadius: "0 0 75px 75px",
                opacity: 1,
              }
            : phase === 1
              ? {
                  left: "calc(50% - 75px)",
                  top: "calc(50% + 60px)",
                  width: 150,
                  height: 75,
                  borderRadius: "4px 4px 75px 75px",
                  opacity: 1,
                }
              : {
                  left: 0,
                  top: "50%",
                  width: 42,
                  height: "calc(50% - 45px)",
                  borderRadius: "0 4px 4px 0",
                  opacity: 1,
                }
        }
        transition={
          phase === 2
            ? {
                borderRadius: { duration: 0.35, ease },
                left: { duration: 0.8, delay: 0.15, ease },
                top: { duration: 0.8, delay: 0.15, ease },
                width: { duration: 0.7, delay: 0.2, ease },
                height: { duration: 0.7, delay: 0.2, ease },
              }
            : { duration: 0.6, ease }
        }
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: 2, backgroundColor: `${NAVY}18` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center pl-4 pr-3"
          style={{ writingMode: "vertical-lr" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.65 }}
        >
          <span className="text-[10px] font-bold tracking-wide whitespace-nowrap rotate-180" style={{ color: `${NAVY}55` }}>
            Strategic Guidance
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
