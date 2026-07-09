"use client";

import { motion } from "framer-motion";

const NAVY = "#00446A";

export function ClosingSummarySlide({ isActive }: { isActive: boolean }) {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-4xl flex-col items-center justify-center px-6">
      <motion.div
        className="rounded-xl border border-dashed px-12 py-16 text-center"
        style={{ borderColor: `${NAVY}30` }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.4, delay: isActive ? 0.15 : 0 }}
      >
        <p className="text-lg font-medium leading-relaxed" style={{ color: NAVY }}>
          Need to still land ML vs. status quo.
        </p>
        <p className="mt-2 text-lg font-medium leading-relaxed" style={{ color: NAVY }}>
          Value of dif. pricing model vs. static at a high level.
        </p>
      </motion.div>
    </div>
  );
}
