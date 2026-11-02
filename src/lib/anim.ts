"use client";

import { useState, useEffect, useRef } from "react";

export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ── Phase sequencer ──────────────────────────────────────
 *
 * Replaces the common pattern of 5-7 setTimeout calls + cleanup
 * inside a useEffect. Returns the current phase index (0-based).
 *
 * Usage:
 *   const phase = usePhaseSequence(
 *     [0, 400, 1600, 2800],       // ms delays for phases 0-3
 *     { active: isActive, skip: skipAnimation, enabled: chartStep === 0 }
 *   );
 *
 * - active=false  → resets to 0
 * - skip=true     → jumps to final phase
 * - enabled=false → jumps to final phase (for "only play on this step")
 *
 * The delays array should be defined outside the component or memoized.
 */
export function usePhaseSequence(
  delays: readonly number[],
  opts: {
    active: boolean;
    skip?: boolean;
    enabled?: boolean;
  },
): number {
  const finalPhase = delays.length - 1;
  const { active, skip, enabled = true } = opts;

  const [phase, setPhase] = useState(() => {
    if (!active) return 0;
    if (skip || !enabled) return finalPhase;
    return 0;
  });

  const delaysRef = useRef(delays);
  delaysRef.current = delays;

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    if (skip || !enabled) {
      const t = setTimeout(() => setPhase(finalPhase));
      return () => clearTimeout(t);
    }

    const raf = requestAnimationFrame(() => {
      timers.push(
        ...delaysRef.current.map((delay, i) =>
          setTimeout(() => setPhase(i), delay),
        ),
      );
    });
    const timers: ReturnType<typeof setTimeout>[] = [];
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [active, skip, enabled, finalPhase]);

  return phase;
}

/* ── Transition builders ──────────────────────────────────
 *
 * Small helpers that return Framer Motion transition objects.
 * Cuts the noise from JSX so the unique parts (duration, delay) stand out.
 *
 * Usage:
 *   <motion.div transition={smooth(0.5, 0.3)} />
 *   <motion.div transition={springIn(0.15)} />
 *   <motion.div transition={stagger(index)} />
 */

export function smooth(duration = 0.5, delay = 0) {
  return { duration, delay, ease: EASE } as const;
}

export function springIn(delay = 0, stiffness = 260, damping = 26) {
  return { type: "spring" as const, stiffness, damping, delay };
}

export function stagger(index: number, interval = 0.15, duration = 0.5) {
  return { duration, delay: index * interval, ease: EASE } as const;
}

export function fadeIn(duration = 0.4, delay = 0) {
  return { duration, delay } as const;
}
