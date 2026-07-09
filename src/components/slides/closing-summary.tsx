"use client";

import { motion, AnimatePresence } from "framer-motion";

export const CLOSING_SUMMARY_TOTAL_STEPS = 1;

const NAVY = "#00446A";
const TEAL = "#21A5D5";
const MUTED_BORDER = "#CBD5E1";
const MUTED_TEXT = "#64748B";
const MUTED_BG = "#F1F5F9";

const STATIC_POINTS = [
  "Same price regardless of customer or context",
  "Slow, manual adjustments that lag the market",
  "Margin leakage on every transaction",
];

const DYNAMIC_POINTS = [
  "Every price shaped by 24 real-time factors",
  "Continuously learns and adapts to market shifts",
  "Maximizes margin across the full portfolio",
];

const SUBTITLE_BY_STEP = [
  "Your pricing model should work as hard as your team does.",
  "Differentiated pricing captures value that static models leave behind.",
];

export function ClosingSummarySlide({
  step = 0,
  isActive,
}: {
  step?: number;
  isActive: boolean;
}) {
  const showImpact = step >= 1;

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-5xl flex-col items-center justify-center px-6 pt-8">
      {/* Title */}
      <motion.h2
        className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: NAVY }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5 }}
      >
        From Static to Dynamic
      </motion.h2>

      {/* Subtitle */}
      <div className="mt-3 min-h-[2.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="max-w-2xl text-center text-base font-medium"
            style={{ color: MUTED_TEXT }}
            initial={{ opacity: 0, y: 8 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            {SUBTITLE_BY_STEP[step] ?? SUBTITLE_BY_STEP[0]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Two-column comparison */}
      <div className="mt-10 flex w-full max-w-4xl flex-1 items-start justify-center gap-8 min-h-0">
        {/* Static pricing card */}
        <motion.div
          className="flex-1 rounded-2xl border-2 px-8 py-8"
          style={{
            borderColor: MUTED_BORDER,
            backgroundColor: MUTED_BG,
          }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.5, delay: isActive ? 0.2 : 0 }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${MUTED_TEXT}18` }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="2.5" rx="1" fill={MUTED_TEXT} opacity="0.6" />
                <rect x="3" y="8.75" width="14" height="2.5" rx="1" fill={MUTED_TEXT} opacity="0.6" />
                <rect x="3" y="13.5" width="14" height="2.5" rx="1" fill={MUTED_TEXT} opacity="0.6" />
              </svg>
            </div>
            <h3
              className="text-lg font-bold tracking-tight"
              style={{ color: MUTED_TEXT }}
            >
              Status Quo
            </h3>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4">
            {STATIC_POINTS.map((point, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                transition={{
                  duration: 0.4,
                  delay: isActive ? 0.35 + i * 0.1 : 0,
                }}
              >
                <span
                  className="mt-1.5 block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: MUTED_BORDER }}
                />
                <span
                  className="text-[0.95rem] font-medium leading-snug"
                  style={{ color: MUTED_TEXT }}
                >
                  {point}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Dynamic pricing card */}
        <motion.div
          className="flex-1 rounded-2xl border-2 px-8 py-8"
          style={{
            borderColor: TEAL,
            backgroundColor: "white",
            boxShadow: `0 4px 24px ${TEAL}18`,
          }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
          transition={{ duration: 0.5, delay: isActive ? 0.25 : 0 }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${TEAL}18` }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 14L7 8L11 11L17 4"
                  stroke={TEAL}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 4H17V7"
                  stroke={TEAL}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="text-lg font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              ML-Powered Dynamic Model
            </h3>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4">
            {DYNAMIC_POINTS.map((point, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{
                  duration: 0.4,
                  delay: isActive ? 0.4 + i * 0.1 : 0,
                }}
              >
                <span
                  className="mt-1.5 block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: TEAL }}
                />
                <span
                  className="text-[0.95rem] font-medium leading-snug"
                  style={{ color: NAVY }}
                >
                  {point}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Impact statement — step 1 */}
      <motion.div
        className="mb-4 mt-8 w-full max-w-3xl rounded-xl px-8 py-5 text-center"
        style={{
          backgroundColor: `${NAVY}0A`,
          border: `1px solid ${NAVY}15`,
        }}
        animate={
          isActive && showImpact
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 16 }
        }
        transition={{ duration: 0.5, delay: isActive && showImpact ? 0.15 : 0 }}
      >
        <p
          className="text-lg font-semibold leading-relaxed"
          style={{ color: NAVY }}
        >
          Differentiated pricing means every transaction is optimized —{" "}
          <span style={{ color: TEAL }}>more margin captured</span>,{" "}
          <span style={{ color: TEAL }}>less revenue left behind</span>.
        </p>
      </motion.div>
    </div>
  );
}
