"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  NAVY, MUTED, STRAT_BLUE, ORANGE, TOTAL_MONTHS,
  TIMELINE_EVENTS, getMonthLabel,
} from "./refine-slide-data";

interface TimelineStripProps {
  indexPhase: number;
  indexMorphProgress: number;
  currentMonth: number;
  currentEvent: (typeof TIMELINE_EVENTS)[0] | null;
  advanceTimeline: () => void;
  retreatTimeline: () => void;
  setIndexPhase: (phase: number) => void;
}

export function TimelineStrip({
  indexPhase, indexMorphProgress, currentMonth, currentEvent,
  advanceTimeline, retreatTimeline, setIndexPhase,
}: TimelineStripProps) {
  return (
    <div className="absolute inset-x-0 top-0 pl-6 pr-[200px] pt-3 pb-2">
      {/* Date display / Event card */}
      <div className="relative flex items-center justify-center" style={{ height: 70, marginBottom: 4 }}>
        <motion.button
          className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${NAVY}08`, color: MUTED, pointerEvents: indexPhase > 0 ? "auto" as const : "none" as const }}
          onClick={retreatTimeline}
          initial={{ opacity: 0 }}
          animate={{ opacity: indexPhase > 0 ? 0.7 : 0.25 }}
          whileHover={{ opacity: indexPhase > 0 ? 1 : 0.25, scale: indexPhase > 0 ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
        <div style={{ transform: "translateX(calc((200px - 24px) / 2 + var(--rail-inset, 0px) * -0.5))" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`event-${indexPhase}`}
              className="flex flex-col items-center cursor-pointer"
              onClick={advanceTimeline}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentEvent ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: `${STRAT_BLUE}12`, color: STRAT_BLUE }}
                    >
                      {getMonthLabel(currentEvent.month)}
                    </span>
                    <span className="text-[22px] font-bold leading-tight" style={{ color: NAVY }}>
                      {currentEvent.label}
                    </span>
                  </div>
                  <span className="mt-1 text-[13px] font-medium" style={{ color: MUTED }}>
                    {currentEvent.factor}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: `${STRAT_BLUE}12`, color: STRAT_BLUE }}
                    >
                      {getMonthLabel(0)}
                    </span>
                    <span className="text-[22px] font-bold leading-tight" style={{ color: ORANGE }}>
                      Your market, day 1
                    </span>
                  </div>
                  <span className="mt-1 text-[13px] font-medium" style={{ color: MUTED }}>
                    Baseline win rate, adoption, and margin — the starting signals the model learns from.
                  </span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.button
          className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${STRAT_BLUE}10`, color: STRAT_BLUE, pointerEvents: indexPhase < TIMELINE_EVENTS.length ? "auto" as const : "none" as const }}
          onClick={advanceTimeline}
          initial={{ opacity: 0 }}
          animate={{ opacity: indexPhase < TIMELINE_EVENTS.length ? 1 : 0.3 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>

      {/* Timeline scrubber */}
      <div className="relative mt-1 cursor-pointer" style={{ height: 32 }} onClick={advanceTimeline}>
        <div className="absolute rounded-full" style={{ left: 0, right: 0, top: "50%", height: 3, transform: "translateY(-50%)", backgroundColor: `${NAVY}0D` }} />
        <motion.div
          className="absolute rounded-full"
          style={{ left: 0, top: "50%", height: 3, transform: "translateY(-50%)", backgroundColor: `${STRAT_BLUE}80` }}
          animate={{ width: `${(currentMonth / TOTAL_MONTHS) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {TIMELINE_EVENTS.map((event, i) => {
          const pos = (event.month / TOTAL_MONTHS) * 100;
          const isPast = currentMonth >= event.month;
          const isActive = indexPhase === i + 1 && indexMorphProgress >= 1;
          return (
            <div
              key={event.month}
              className="absolute cursor-pointer"
              style={{ left: `${pos}%`, top: "50%", transform: "translate(-50%, -50%)", padding: 8, zIndex: 2 }}
              onClick={(e) => { e.stopPropagation(); setIndexPhase(i + 1); }}
            >
              <motion.div
                className="rounded-full"
                animate={{
                  width: isActive ? 14 : isPast ? 10 : 8,
                  height: isActive ? 14 : isPast ? 10 : 8,
                  backgroundColor: isActive ? STRAT_BLUE : isPast ? NAVY : `${NAVY}25`,
                }}
                whileHover={{ scale: 1.3 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          );
        })}
        <div className="absolute rounded-full" style={{ left: 0, top: "50%", width: 6, height: 6, backgroundColor: NAVY, transform: "translate(-50%, -50%)", zIndex: 1 }} />
        <motion.div
          className="absolute z-10 rounded-full pointer-events-none"
          style={{
            top: "50%",
            width: 22, height: 22,
            marginLeft: -11, marginTop: -11,
            backgroundColor: STRAT_BLUE,
            border: "3px solid white",
            boxShadow: `0 2px 12px ${STRAT_BLUE}50`,
          }}
          animate={{ left: `${(currentMonth / TOTAL_MONTHS) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute" style={{ top: "50%", marginTop: 14, left: 0, right: 0 }}>
          <span className="absolute text-[10px] font-medium" style={{ left: 0, color: indexPhase === 0 ? STRAT_BLUE : MUTED }}>Starting</span>
          {TIMELINE_EVENTS.map((event, i) => {
            const pos = (event.month / TOTAL_MONTHS) * 100;
            const isActive = indexPhase === i + 1 && indexMorphProgress >= 1;
            return (
              <span
                key={event.month}
                className="absolute text-[10px] font-medium transition-colors duration-300 cursor-pointer"
                style={{ left: `${pos}%`, transform: "translateX(-50%)", color: isActive ? STRAT_BLUE : MUTED }}
                onClick={(e) => { e.stopPropagation(); setIndexPhase(i + 1); }}
              >
                {event.dotLabel}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
