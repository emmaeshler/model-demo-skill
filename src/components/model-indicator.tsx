"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";
const NAVY = "#00446A";

const SECTION_HIGHLIGHTS: Record<string, "ml" | "strat" | "both"> = {
  power: "ml",
  execute: "ml",
  refine: "strat",
  "profit-growth": "both",
  "closing-summary": "both",
};

function Segment({
  label,
  color,
  active,
  position,
  animate: shouldAnimate,
  shifting = false,
}: {
  label: string;
  color: string;
  active: boolean;
  position: "top" | "bottom";
  animate: boolean;
  shifting?: boolean;
}) {
  const baseDelay = position === "top" ? 0 : 0.1;

  return (
    <motion.div
      className="relative flex flex-1 items-center overflow-hidden"
      style={{
        transformOrigin: position === "top" ? "bottom center" : "top center",
      }}
      initial={shouldAnimate ? { scaleY: 0 } : false}
      animate={{
        scaleY: 1,
        backgroundColor: active ? `${color}0C` : "transparent",
      }}
      transition={{
        scaleY: {
          duration: 0.6,
          delay: shouldAnimate ? baseDelay : 0,
          ease: [0.22, 1, 0.36, 1],
        },
        backgroundColor: { duration: shifting ? 0.6 : 0.4, delay: shifting ? 0.15 : 0 },
      }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{
          opacity: 1,
          width: shifting && active ? [2, 6, 4] : active ? 4 : 2,
          backgroundColor: active ? color : `${NAVY}18`,
        }}
        transition={{
          opacity: { duration: 0.3, delay: shouldAnimate ? baseDelay + 0.35 : 0 },
          width: { duration: shifting ? 0.7 : 0.35, delay: shifting ? 0.1 : 0 },
          backgroundColor: { duration: shifting ? 0.5 : 0.35, delay: shifting ? 0.1 : 0 },
        }}
      />

      {/* Sweep glow — plays once on shift */}
      <AnimatePresence>
        {shifting && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: color }}
            initial={{ opacity: 0, y: position === "top" ? "100%" : "-100%" }}
            animate={{ opacity: [0, 0.25, 0.25, 0], y: [position === "top" ? "100%" : "-100%", "0%", "0%", "0%"] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.25, 0.65, 1] }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="flex items-center pl-4 pr-3"
        style={{ writingMode: "vertical-lr" }}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: shouldAnimate ? baseDelay + 0.4 : 0 }}
      >
        <motion.span
          className="text-[10px] font-bold tracking-wide whitespace-nowrap rotate-180"
          animate={{
            color: active ? color : `${NAVY}55`,
            scale: shifting && active ? [1, 1.2, 1] : 1,
          }}
          transition={{
            color: { duration: shifting ? 0.5 : 0.35, delay: shifting ? 0.1 : 0 },
            scale: { duration: 0.6, delay: 0.15 },
          }}
        >
          {label}
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="absolute left-1/2 bottom-3 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: shifting ? 0.4 : 0.1 }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ModelIndicator({ slideKind }: { slideKind: string }) {
  const highlight = SECTION_HIGHLIGHTS[slideKind] ?? "both";
  const show = slideKind in SECTION_HIGHLIGHTS;

  const mlActive = highlight === "ml" || highlight === "both";
  const stratActive = highlight === "strat" || highlight === "both";

  const prevHighlightRef = useRef(highlight);
  const [shifting, setShifting] = useState(false);

  const prevShowRef = useRef(false);
  const skipAnimation = true;

  useEffect(() => {
    if (show) prevShowRef.current = true;
  }, [show]);

  useEffect(() => {
    const prev = prevHighlightRef.current;
    prevHighlightRef.current = highlight;
    if (prev !== highlight) {
      setShifting(true);
      const t = setTimeout(() => setShifting(false), 1400);
      return () => clearTimeout(t);
    }
  }, [highlight]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed left-0 z-40 flex flex-col"
          style={{ top: 49, bottom: 45 }}
          initial={skipAnimation ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -32, transition: { duration: 0.3 } }}
          transition={{ duration: 0.25 }}
        >
          <Segment
            label="ML Prediction"
            color={ML_GREEN}
            active={mlActive}
            position="top"
            animate={!skipAnimation}
            shifting={shifting}
          />

          <div
            className="h-px"
            style={{
              marginLeft: 2,
              marginRight: 0,
              backgroundColor: `${NAVY}12`,
            }}
          />

          <Segment
            label="Strategic Guidance"
            color={STRAT_BLUE}
            active={stratActive}
            position="bottom"
            animate={!skipAnimation}
            shifting={shifting}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
