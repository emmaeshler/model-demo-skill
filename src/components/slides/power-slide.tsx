"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { usePhaseSequence } from "@/lib/anim";
import {
  EASE, NAVY, TEAL, MUTED, PLOT, PLOT_W, PLOT_H, PLOT_CX, PLOT_CY,
  Y_TICKS, X_TICKS, yForTick, xForTick, DRIVERS,
  SPOTLIGHTS, TITLES, SUBTITLES, SWEEP_DURATION,
  CATEGORY_LAYOUT, CATEGORY_TITLES, CATEGORY_NARRATION, CATEGORY_ACTION_HINTS,
  DOTS, BASE_PRICE, PRICE_SATELLITES,
} from "./power-slide-data";
import { DotField } from "./power-slide-dots";
import { FactorGrid } from "./power-slide-factors";
import { ConvergenceModel } from "./power-slide-convergence";
import { BottomCards } from "./power-slide-bottom";

export const POWER_TOTAL_STEPS = 3;

export function PowerSlide({ step = 0, onAutoAdvance, skipAnimation, onActiveCategoryChange, isActive = true }: { step: number; onAutoAdvance?: () => void; skipAnimation?: boolean; onActiveCategoryChange?: (categories: string[]) => void; isActive?: boolean }) {
  const { shareMode } = useShareMode();
  const chartStep = step;

  const stepSelectionPhase = step < 2 ? -1 : step === 2 ? -1 : step <= 6 ? step - 3 : 5;

  const INTRO_DELAYS = [0, 1600, 2500, 3700, 4200, 5100] as const;
  const introPhase = usePhaseSequence(INTRO_DELAYS, { active: isActive, skip: !!skipAnimation, enabled: chartStep === 0 });

  const [selectionPhase, setSelectionPhase] = useState(chartStep > 5 || (skipAnimation && chartStep > 5) ? 5 : stepSelectionPhase);
  const [factorsPhase, setFactorsPhase] = useState(chartStep >= 2 ? 7 : 0);
  const [morphPhase, setMorphPhase] = useState(!!skipAnimation || chartStep > 2 ? 4 : chartStep === 2 ? -1 : -1);

  useEffect(() => {
    if (!isActive) { setFactorsPhase(0); return; }
    if (chartStep < 2) { setFactorsPhase(0); return; }
    if (chartStep > 2 || skipAnimation || selectionPhase >= 0) { setFactorsPhase(7); return; }
    setFactorsPhase(0);
  }, [isActive, chartStep, skipAnimation, selectionPhase]);

  useEffect(() => {
    if (!isActive) { setMorphPhase(-1); return; }
    if (chartStep < 2) { setMorphPhase(-1); return; }
    const t0 = setTimeout(() => setMorphPhase(4), 400);
    return () => clearTimeout(t0);
  }, [isActive, chartStep, skipAnimation, selectionPhase]);

  useEffect(() => {
    if (!isActive) { setSelectionPhase(-1); return; }
    if (chartStep < 2) { setSelectionPhase(-1); return; }
    if (chartStep > 5) { setSelectionPhase(5); return; }
    if (skipAnimation) { setSelectionPhase(stepSelectionPhase); return; }
    setSelectionPhase(stepSelectionPhase);
  }, [isActive, chartStep, skipAnimation, stepSelectionPhase]);

  const [actionRevealed, setActionRevealed] = useState(!!skipAnimation || chartStep > 2);
  useEffect(() => {
    if (!isActive) { setActionRevealed(false); return; }
    if (selectionPhase < 0 || selectionPhase > 3) { setActionRevealed(false); return; }
    if (skipAnimation) { setActionRevealed(true); return; }
    setActionRevealed(false);
    const t = setTimeout(() => setActionRevealed(true), 600);
    return () => clearTimeout(t);
  }, [isActive, selectionPhase, skipAnimation]);

  const [customerActionStep, setCustomerActionStep] = useState(!!skipAnimation || stepSelectionPhase > 0 ? 1 : 0);
  useEffect(() => {
    if (!isActive || selectionPhase !== 0) {
      if (selectionPhase > 0) setCustomerActionStep(1);
      return;
    }
    if (skipAnimation) { setCustomerActionStep(1); return; }
    if (!actionRevealed) { setCustomerActionStep(0); return; }
    setCustomerActionStep(0);
    const t = setTimeout(() => setCustomerActionStep(1), 2000);
    return () => clearTimeout(t);
  }, [isActive, selectionPhase, actionRevealed, skipAnimation]);

  const rawHint = CATEGORY_ACTION_HINTS[selectionPhase];
  const currentHint = rawHint ? (Array.isArray(rawHint) ? rawHint[0] : rawHint) : null;

  useEffect(() => {
    if (!onActiveCategoryChange) return;
    if (!isActive) { onActiveCategoryChange([]); return; }
    if (chartStep !== 2) { onActiveCategoryChange([]); return; }
    const cats = ["customer", "product", "order", "market"] as const;
    if (selectionPhase >= 0 && selectionPhase <= 3) {
      onActiveCategoryChange([cats[selectionPhase]]);
    } else if (selectionPhase < 0) {
      onActiveCategoryChange([...cats]);
    } else {
      onActiveCategoryChange([...cats]);
    }
  }, [isActive, chartStep, selectionPhase, morphPhase, onActiveCategoryChange]);

  const convergeReady = chartStep >= 3;
  const allAbsorbed = chartStep >= 3;
  const absorbedCount = chartStep >= 3 ? 4 : 0;

  const convergingPrice = useMemo(() => {
    let total = BASE_PRICE;
    for (let i = 0; i < absorbedCount; i++) {
      total += PRICE_SATELLITES[i].value;
    }
    return `$${total.toFixed(2)}`;
  }, [absorbedCount]);

  const [scanCardCount, setScanCardCount] = useState(chartStep > 1 || !!skipAnimation ? 4 : 0);
  const [driversRevealed, setDriversRevealed] = useState(chartStep > 2 || !!skipAnimation);
  useEffect(() => {
    if (!isActive) { setScanCardCount(0); setDriversRevealed(false); return; }
    if (chartStep !== 1) { setScanCardCount(chartStep > 1 ? 4 : 0); setDriversRevealed(chartStep > 2); return; }
    if (skipAnimation) { setScanCardCount(4); setDriversRevealed(false); return; }
    setScanCardCount(0);
    setDriversRevealed(false);
    const s1 = setTimeout(() => setScanCardCount(1), 600);
    const s2 = setTimeout(() => setScanCardCount(2), 2000);
    const s3 = setTimeout(() => setScanCardCount(3), 3400);
    const s4 = setTimeout(() => setScanCardCount(4), 4800);
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); clearTimeout(s4); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, chartStep, skipAnimation]);

  useEffect(() => {
    if (!isActive || chartStep !== 2) return;
    if (skipAnimation || shareMode) { onAutoAdvance?.(); return; }
    const t = setTimeout(() => onAutoAdvance?.(), 900);
    return () => clearTimeout(t);
  }, [isActive, chartStep, skipAnimation, shareMode, onAutoAdvance]);

  const clustered = chartStep >= 3;
  const factorsVisible = false;
  const customized = chartStep >= 3;
  const feeding = chartStep >= 3;
  const sweepActive = chartStep === 1 && !driversRevealed;

  const revealedClusters = new Set(SPOTLIGHTS.slice(0, scanCardCount).map(s => s.cluster));

  function dotFill(dot: (typeof DOTS)[0]) {
    if (factorsVisible) return TEAL;
    if (chartStep >= 1 && driversRevealed) return DRIVERS[dot.cluster].color;
    if (chartStep >= 1 && revealedClusters.has(dot.cluster)) return DRIVERS[dot.cluster].color;
    return MUTED;
  }

  function dotOpacity(dot: (typeof DOTS)[0]) {
    if (customized) return 0;
    if (factorsVisible) return factorsPhase >= 2 ? 0 : 0.12;
    if (chartStep === 1 || chartStep === 2) {
      if (driversRevealed) return 0.7;
      if (revealedClusters.has(dot.cluster)) return 0.7;
      return dot.scatterOpacity;
    }
    return dot.scatterOpacity;
  }

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      {/* Title */}
      <div className="relative w-full" style={{ height: 116, flexShrink: 0, transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
        <AnimatePresence mode="wait">
          {chartStep === 0 && (
            <motion.div
              key="intro-title"
              className="absolute inset-0 flex flex-col items-center justify-start"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="relative w-full" style={{ height: 80 }}>
                <div
                  className="absolute inset-x-0 top-0 flex flex-col items-center gap-1"
                  style={{
                    opacity: introPhase >= 3 ? 0 : 1,
                    transform: introPhase >= 3 ? "translateY(-12px)" : "translateY(0)",
                    transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
                    pointerEvents: introPhase >= 3 ? "none" : "auto",
                  }}
                >
                  <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>
                    You have 2,400 accounts
                  </h2>
                  <h2
                    className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
                    style={{
                      color: NAVY,
                      opacity: introPhase >= 1 ? 1 : 0,
                      transform: introPhase >= 1 ? "translateY(0)" : "translateY(8px)",
                      transition: "opacity 0.5s, transform 0.5s",
                    }}
                  >
                    each with up to 15,000 SKUs
                  </h2>
                </div>
                <div
                  className="absolute inset-x-0 top-0 flex flex-col items-center gap-2"
                  style={{
                    opacity: introPhase >= 3 ? 1 : 0,
                    transform: introPhase >= 3 ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                    pointerEvents: introPhase >= 3 ? "auto" : "none",
                  }}
                >
                  <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: TEAL }}>
                    36 million unique price points
                  </h2>
                  <p
                    className="mx-auto max-w-lg text-center text-[1.05rem] leading-relaxed"
                    style={{
                      color: MUTED,
                      opacity: introPhase >= 3 ? 1 : 0,
                      transform: introPhase >= 3 ? "translateY(0)" : "translateY(6px)",
                      transition: introPhase >= 3 ? "opacity 0.4s 0.15s, transform 0.4s 0.15s" : "opacity 0.3s, transform 0.3s",
                    }}
                  >
                    Far too many for any team to set manually&nbsp;— the&nbsp;model finds&nbsp;the&nbsp;patterns.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {chartStep > 0 && (
            <motion.div
              key={`step-title-${chartStep === 2 ? 1 : chartStep}`}
              className="absolute inset-0 flex flex-col items-center justify-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, delay: chartStep === 1 ? 0.2 : 0.15 }}
            >
              {chartStep >= 3 ? (
                <>
                  <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.3em" }}>
                    {(TITLES[chartStep] ?? "").split(" ").map((word, wi) => (
                      <motion.span key={wi} initial={skipAnimation ? false : { opacity: 0, y: 14, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, delay: skipAnimation ? 0 : wi * 0.08, ease: EASE }}>
                        {word}
                      </motion.span>
                    ))}
                  </h2>
                  <motion.p className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }} initial={skipAnimation ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: skipAnimation ? 0.15 : 0.7 }}>
                    Seven tailored drivers — drawn from the factors that matter most to you — feed the model to arrive at{" "}
                    <motion.span style={{ fontWeight: 600 }} initial={skipAnimation ? { color: TEAL } : { color: MUTED }} animate={{ color: TEAL }} transition={{ duration: 0.6, delay: skipAnimation ? 0 : 1.2 }}>
                      the right price
                    </motion.span>
                    .
                  </motion.p>
                </>
              ) : (
                <>
                  <motion.h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: NAVY }}>{TITLES[chartStep === 2 ? 1 : chartStep]}</motion.h2>
                  <motion.p className="mx-auto mt-1 max-w-2xl text-center text-[1.05rem] leading-relaxed" style={{ color: MUTED }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: chartStep === 1 ? 0.4 : 0.15 }}>
                    {SUBTITLES[chartStep === 2 ? 1 : chartStep]}
                  </motion.p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart area */}
      <div className="relative w-full flex-1 min-h-0 mt-0" style={{ transform: "translateX(calc(var(--rail-inset, 0px) * -0.5))" }}>
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ pointerEvents: "none" }}>
          <svg viewBox="0 -40 1020 570" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke={NAVY} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.2} />
            <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke={NAVY} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.2} />
            {Y_TICKS.map((_, i) => <line key={`sg-y${i}`} x1={PLOT.left} y1={yForTick(i)} x2={PLOT.right} y2={yForTick(i)} stroke={NAVY} strokeWidth={0.7} strokeDasharray="4 6" opacity={0.08} />)}
            {X_TICKS.map((_, i) => <line key={`sg-x${i}`} x1={xForTick(i)} y1={PLOT.top} x2={xForTick(i)} y2={PLOT.bottom} stroke={NAVY} strokeWidth={0.7} strokeDasharray="4 6" opacity={0.08} />)}
            {Y_TICKS.map((label, i) => <text key={`sg-yl${i}`} x={PLOT.left - 8} y={yForTick(i) + 3.5} textAnchor="end" style={{ fill: NAVY, fontSize: 10, opacity: 0.15 }}>{label}</text>)}
            {X_TICKS.map((label, i) => <text key={`sg-xl${i}`} x={xForTick(i)} y={PLOT.bottom + 16} textAnchor="middle" style={{ fill: NAVY, fontSize: 10, opacity: 0.15 }}>{label}</text>)}
            {[[180,120],[250,200],[350,160],[420,280],[500,220],[300,340],[600,300],[700,260],[150,310],[550,150],[450,370],[200,250],[650,180],[380,100],[800,320],[280,80],[520,350],[750,140],[160,380],[620,240],[230,150],[470,310],[580,200],[340,250],[720,350],[140,220],[680,130],[400,400],[560,280],[850,250]].map(([cx, cy], i) => (
              <circle key={`sg-d${i}`} cx={cx} cy={cy} r={3.5} fill={TEAL} opacity={0.12} />
            ))}
            <text x={PLOT.left + PLOT_W / 2} y={PLOT.bottom + 38} textAnchor="middle" style={{ fill: NAVY, fontSize: 11, fontWeight: 600, opacity: 0.15 }}>Monthly Transaction Volume</text>
            <text textAnchor="middle" style={{ fill: NAVY, fontSize: 11, fontWeight: 600, opacity: 0.15 }} transform={`translate(28, ${PLOT.top + PLOT_H / 2}) rotate(-90)`}>Selling Price ($)</text>
          </svg>
        </motion.div>

        <motion.div className="absolute inset-0 flex items-stretch gap-0" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: convergeReady ? 25 : 0 }} transition={{ duration: 1.0, ease: EASE }}>
          <div className="relative flex-1 min-w-0 flex items-center justify-center">
            <svg viewBox="0 -40 1020 570" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <motion.g animate={{ opacity: clustered ? 0 : 1 }} transition={{ duration: 0.5, delay: clustered ? 0 : 0.3 }}>
                {Y_TICKS.map((_, i) => <line key={`gy${i}`} x1={PLOT.left} y1={yForTick(i)} x2={PLOT.right} y2={yForTick(i)} stroke={`${NAVY}0A`} strokeWidth={0.7} />)}
                {X_TICKS.map((_, i) => <line key={`gx${i}`} x1={xForTick(i)} y1={PLOT.top} x2={xForTick(i)} y2={PLOT.bottom} stroke={`${NAVY}0A`} strokeWidth={0.7} />)}
                <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke={`${NAVY}30`} strokeWidth={1.2} />
                <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke={`${NAVY}30`} strokeWidth={1.2} />
                {Y_TICKS.map((label, i) => { const y = yForTick(i); return (<g key={`yt${i}`}><line x1={PLOT.left - 4} y1={y} x2={PLOT.left} y2={y} stroke={`${NAVY}40`} strokeWidth={1} /><text x={PLOT.left - 8} y={y + 3.5} textAnchor="end" style={{ fill: MUTED, fontSize: 10, fontFamily: "inherit" }}>{label}</text></g>); })}
                {X_TICKS.map((label, i) => { const x = xForTick(i); return (<g key={`xt${i}`}><line x1={x} y1={PLOT.bottom} x2={x} y2={PLOT.bottom + 4} stroke={`${NAVY}40`} strokeWidth={1} /><text x={x} y={PLOT.bottom + 16} textAnchor="middle" style={{ fill: MUTED, fontSize: 10, fontFamily: "inherit" }}>{label}</text></g>); })}
                <text x={PLOT.left + PLOT_W / 2} y={PLOT.bottom + 38} textAnchor="middle" style={{ fill: NAVY, fontSize: 11, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.03em" }}>Monthly Transaction Volume</text>
                <text textAnchor="middle" style={{ fill: NAVY, fontSize: 11, fontWeight: 600, fontFamily: "inherit", letterSpacing: "0.03em" }} transform={`translate(28, ${PLOT.top + PLOT_H / 2}) rotate(-90)`}>Selling Price ($)</text>
              </motion.g>

              {sweepActive && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0 }}>
                  <defs>
                    <linearGradient id="sweep-glow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={TEAL} stopOpacity={0} />
                      <stop offset="40%" stopColor={TEAL} stopOpacity={0.08} />
                      <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <motion.rect y={PLOT.top} width={60} height={PLOT_H} fill="url(#sweep-glow)" animate={{ x: [PLOT.left - 60, PLOT.right, PLOT.left - 60] }} transition={{ duration: SWEEP_DURATION, repeat: shareMode ? 0 : Infinity, ease: "linear" }} />
                  <motion.line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke={TEAL} strokeWidth={1.2} opacity={0.25} animate={{ x1: [PLOT.left, PLOT.right, PLOT.left], x2: [PLOT.left, PLOT.right, PLOT.left] }} transition={{ duration: SWEEP_DURATION, repeat: shareMode ? 0 : Infinity, ease: "linear" }} />
                </motion.g>
              )}

              <DotField
                shareMode={shareMode}
                chartStep={chartStep}
                introPhase={introPhase}
                feeding={feeding}
                factorsVisible={factorsVisible}
                factorsPhase={factorsPhase}
                customized={customized}
                morphPhase={morphPhase}
                convergeReady={convergeReady}
                clustered={clustered}
                sweepActive={sweepActive}
                scanCardCount={scanCardCount}
                selectionPhase={selectionPhase}
                skipAnimation={skipAnimation}
                dotFill={dotFill}
                dotOpacity={dotOpacity}
                revealedClusters={revealedClusters}
              />

              <ConvergenceModel
                feeding={feeding}
                convergeReady={convergeReady}
                allAbsorbed={allAbsorbed}
                absorbedCount={absorbedCount}
                skipAnimation={skipAnimation}
                shareMode={shareMode}
              />
            </svg>
          </div>
        </motion.div>

        <FactorGrid
          factorsVisible={factorsVisible}
          convergeReady={convergeReady}
          customized={customized}
          selectionPhase={selectionPhase}
          factorsPhase={factorsPhase}
          morphPhase={morphPhase}
          actionRevealed={actionRevealed}
          feeding={feeding}
          shareMode={shareMode}
          customerActionStep={customerActionStep}
        />
      </div>

      <BottomCards chartStep={chartStep} scanCardCount={scanCardCount} driversRevealed={driversRevealed} />
    </div>
  );
}
