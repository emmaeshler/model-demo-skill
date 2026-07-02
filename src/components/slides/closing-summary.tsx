"use client";

import { motion } from "framer-motion";

const NAVY = "#00446A";
const ORANGE = "#E56910";
const TEAL = "#21A5D5";
const GREEN = "#2e7d32";

const STAGES = [
  {
    number: 1,
    label: "Design",
    color: NAVY,
    takeaway: "Four integrated data sources build the model's foundation",
  },
  {
    number: 2,
    label: "Power",
    color: TEAL,
    takeaway: "ML and AI translate millions of signals into defensible guidance",
  },
  {
    number: 3,
    label: "Execute",
    color: ORANGE,
    takeaway: "Customer context and business rules shape every price",
  },
  {
    number: 4,
    label: "Refine",
    color: NAVY,
    takeaway: "Every market outcome teaches the model to sharpen precision",
  },
];

const OUTCOMES = [
  { metric: "Margin Uplift", value: "+6pp", color: GREEN },
  { metric: "Win Rate", value: "+6pp", color: TEAL },
  { metric: "Price Consistency", value: "High", color: NAVY },
  { metric: "Override Rate", value: "−26pp", color: ORANGE },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { delay, duration: 0.3 },
});

export function ClosingSummarySlide() {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-6xl flex-col items-center justify-center gap-3 px-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          className="mt-1 text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: NAVY }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          An evidence-based pricing model, end to end
        </motion.h2>
        <motion.p
          className="mx-auto mt-1.5 max-w-2xl text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          Five interconnected stages turn raw data into measurable profit — and every cycle makes the next one sharper.
        </motion.p>
      </div>

      {/* Journey recap — 5 connected stages */}
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <div className="grid grid-cols-5 gap-0">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.number}
              className="relative flex flex-col items-center text-center"
              {...fadeUp(0.08 + i * 0.06)}
            >
              {/* Connector line to next stage */}
              {i < STAGES.length - 1 && (
                <motion.div
                  className="absolute top-[18px] h-[2px]"
                  style={{
                    left: "calc(50% + 18px)",
                    right: "calc(-50% + 18px)",
                    backgroundColor: stage.color,
                    opacity: 0.25,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                />
              )}

              {/* Number circle */}
              <motion.div
                className="relative z-10 flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: stage.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1 + i * 0.06,
                  duration: 0.3,
                  type: "spring",
                  damping: 14,
                }}
              >
                {stage.number}
              </motion.div>

              {/* Label */}
              <span
                className="mt-2 text-xs font-bold tracking-wide uppercase"
                style={{ color: stage.color }}
              >
                {stage.label}
              </span>

              {/* Takeaway */}
              <p
                className="mt-1.5 max-w-[160px] text-[11px] leading-snug text-muted-foreground"
              >
                {stage.takeaway}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Outcome KPIs */}
      <motion.div className="w-full max-w-3xl" {...fadeUp(0.35)}>
        <div
          className="rounded-xl border px-6 py-3.5"
          style={{ borderColor: `${NAVY}15`, backgroundColor: `${NAVY}04` }}
        >
          <p
            className="mb-2.5 text-center text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: NAVY }}
          >
            Illustrative Business Impact
          </p>
          <div className="grid grid-cols-4 gap-4">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.metric}
                className="flex flex-col items-center gap-0.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.25 }}
              >
                <span
                  className="text-xl font-bold"
                  style={{ color: o.color }}
                >
                  {o.value}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {o.metric}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Closing line */}
      <motion.p
        className="max-w-xl text-center text-sm leading-relaxed"
        style={{ color: NAVY }}
        {...fadeUp(0.5)}
      >
        <span className="font-semibold" style={{ color: NAVY }}>
          The model doesn&apos;t just set prices
        </span>
        <span className="text-muted-foreground">
          {" — it learns, adapts, and compounds value with every transaction."}
        </span>
      </motion.p>
    </div>
  );
}
