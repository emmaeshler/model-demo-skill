"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  EASE, SQUARE_FACTORS, CATEGORY_LAYOUT, CATEGORY_ACTIONS,
  SELECTED_FACTORS, SOLID_TINTS, FEED_NUDGE_Y,
  TEAL, PURPLE, MUTED,
} from "./power-slide-data";

interface FactorGridProps {
  factorsVisible: boolean;
  convergeReady: boolean;
  customized: boolean;
  selectionPhase: number;
  factorsPhase: number;
  morphPhase: number;
  actionRevealed: boolean;
  feeding: boolean;
  shareMode: boolean;
  customerActionStep: number;
}

export function FactorGrid({
  factorsVisible, convergeReady, customized, selectionPhase,
  factorsPhase, morphPhase, actionRevealed, feeding, shareMode,
  customerActionStep,
}: FactorGridProps) {
  if (!factorsVisible || convergeReady) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="factor-pills-overlay"
        className="absolute inset-0"
        style={{ zIndex: 5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ x: "-25%", scale: 0.6, opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        transition={{ duration: 0.4 }}
      >
        <LayoutGroup>
        <div style={{
          width: "100%",
          height: "100%",
          padding: "0 3%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: selectionPhase >= 4 ? "flex-start" : "center",
          fontFamily: "inherit",
          position: "relative",
        }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {!customized ? (
              <motion.div
                key="quadrant-layout"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  columnGap: 24,
                  rowGap: 24,
                  width: "100%",
                  flex: 1,
                }}
              >
                {CATEGORY_LAYOUT.map((cat, catIdx) => {
                  const chipsVisible = factorsPhase >= 7 || morphPhase >= catIdx;
                  const isHighlighted = morphPhase >= 0 && morphPhase < 4 && morphPhase === catIdx;
                  const dimmed = morphPhase >= 0 && morphPhase < 4 && morphPhase !== catIdx && morphPhase > catIdx;
                  return (
                    <div key={cat.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: chipsVisible ? 1 : 0, transition: "opacity 0.4s" }}>
                      {false && chipsVisible && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: isHighlighted ? 1 : dimmed ? 0.4 : 0.7, y: 0 }}
                          transition={{ duration: 0.35 }}
                          style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: cat.color }}
                        >
                          {cat.key}
                        </motion.span>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", ...(cat.key === "market" || cat.key === "order" ? { maxWidth: 380 } : {}) }}>
                        {chipsVisible && SQUARE_FACTORS.filter(f => f.category === cat.key).map((f, fi) => (
                            <motion.span
                              key={f.label}
                              layoutId={`factor-${f.label}`}
                              layout
                              style={{
                                display: "inline-block",
                                borderRadius: 16,
                                border: `1.5px solid ${cat.color}25`,
                                padding: "8px 14px",
                                fontSize: 14,
                                fontWeight: 500,
                                fontFamily: "inherit",
                                whiteSpace: "nowrap",
                                color: cat.color,
                                backgroundColor: SOLID_TINTS[cat.color] ?? "white",
                              }}
                              initial={{ opacity: 0, scale: 0, y: 12 }}
                              animate={{
                                opacity: dimmed ? 0.4 : 1,
                                scale: 1,
                                y: 0,
                              }}
                              transition={{
                                opacity: { duration: 0.6, delay: fi * 0.15 },
                                scale: shareMode ? { duration: 0.25, delay: fi * 0.15 } : { type: "spring", stiffness: 260, damping: 26, delay: fi * 0.15 },
                                y: shareMode ? { duration: 0.25, delay: fi * 0.15 } : { type: "spring", stiffness: 260, damping: 26, delay: fi * 0.15 },
                                layout: { duration: 0.6, ease: EASE },
                              }}
                            >
                              {f.label}
                            </motion.span>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="grid-layout"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%",
                  transformOrigin: "center center",
                }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  {selectionPhase < 4 ? (
                  <motion.div
                    key="cat-rows"
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", width: "100%", flex: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.92, filter: "blur(2px)" }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                  {CATEGORY_LAYOUT.map((cat, catIdx) => {
                    const catFactors = SQUARE_FACTORS.filter(f => f.category === cat.key);
                    const isActive = selectionPhase === catIdx;
                    const isPast = selectionPhase > catIdx;
                    const catActions = CATEGORY_ACTIONS[cat.key] ?? [];
                    return (
                      <motion.div
                        key={cat.key}
                        layout
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          borderRadius: 12,
                          padding: "10px 14px",
                        }}
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : isPast ? 0.3 : 0.2,
                          backgroundColor: isActive ? `${cat.color}08` : "transparent",
                        }}
                        transition={{
                          opacity: { duration: 0.5 },
                          backgroundColor: { duration: 0.5 },
                          layout: { duration: 0.5, ease: EASE },
                        }}
                      >
                        <motion.div
                          layout
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            minWidth: 0,
                            paddingTop: 11,
                            flexShrink: 0,
                          }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                        </motion.div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
                          <AnimatePresence>
                          {catFactors.map((f, fi) => {
                            const allChipActions = catActions.filter(a => a.label === f.label);
                            const hasSteps = allChipActions.some(a => a.step !== undefined);
                            const chipAction = hasSteps
                              ? allChipActions.filter(a => a.step !== undefined && a.step <= customerActionStep).pop()
                              : allChipActions[0];
                            const showAction = isActive && actionRevealed && !!chipAction;
                            const isElevated = showAction && chipAction?.action === "elevate";
                            const isAdding = showAction && chipAction?.action === "add";
                            const isLowered = showAction && chipAction?.action === "lower";
                            const noAction = isActive && actionRevealed && !chipAction;
                            const isAddTarget = chipAction?.action === "add";
                            const isRemoveTarget = chipAction?.action === "remove";
                            const isCrossoff = hasSteps && chipAction?.action === "remove" && showAction;
                            const isCrossoffShake = isCrossoff && customerActionStep === (chipAction?.step ?? 0);
                            if (isAddTarget && !showAction && !isPast) return null;
                            if (isRemoveTarget && showAction && !hasSteps) return (
                              <motion.span
                                key={f.label}
                                layoutId={`factor-${f.label}`}
                                layout
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4, ease: EASE } }}
                                style={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 8,
                                  padding: "12px 20px", fontSize: 17, fontWeight: 700,
                                  fontFamily: "inherit", whiteSpace: "nowrap" as const,
                                }}
                                initial={{
                                  border: `2px solid ${TEAL}`,
                                  color: TEAL,
                                  backgroundColor: "#E5F5FA",
                                  textDecorationLine: "none",
                                }}
                                animate={feeding ? {
                                  x: ((catFactors.length - 1) / 2 - fi) * 40, y: FEED_NUDGE_Y[catIdx], scale: 0, opacity: 0,
                                  border: `2px solid ${MUTED}60`, color: MUTED, backgroundColor: "#F3F4F6",
                                } : {
                                  x: [0, 0, -5, 6, -4, 3, -1, 0], y: 0,
                                  scale: [1, 1.02, 1.02, 0.97, 0.97, 0.95],
                                  opacity: 1,
                                  border: [`2px solid ${TEAL}`, `2px solid ${TEAL}`, `2px solid ${MUTED}60`],
                                  color: [TEAL, TEAL, MUTED],
                                  backgroundColor: ["#E5F5FA", "#E5F5FA", "#F3F4F6"],
                                  textDecorationLine: ["none", "none", "line-through"],
                                  boxShadow: [`0 0 12px ${TEAL}30`, `0 0 12px ${TEAL}30`, "0 0 0px transparent"],
                                }}
                                transition={feeding ? {
                                  duration: 0.7, delay: catIdx * 0.04 + fi * 0.02, ease: [0.4, 0, 0.1, 1],
                                } : {
                                  x: { duration: 0.6, delay: 0.4, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] },
                                  scale: { duration: 1.0, times: [0, 0.15, 0.4, 0.55, 0.7, 1], ease: EASE },
                                  border: { duration: 0.8, delay: 0.5, times: [0, 0.4, 1] },
                                  color: { duration: 0.8, delay: 0.5, times: [0, 0.4, 1] },
                                  backgroundColor: { duration: 0.8, delay: 0.5, times: [0, 0.4, 1] },
                                  textDecorationLine: { duration: 0.8, delay: 0.5, times: [0, 0.4, 1] },
                                  boxShadow: { duration: 1.0, delay: 0.2, times: [0, 0.3, 1] },
                                  opacity: { duration: 0.3 },
                                  layout: { duration: 0.5, ease: EASE },
                                }}
                              >
                                {f.label}
                                <span style={{ marginLeft: 4, fontSize: 13 }}>×</span>
                              </motion.span>
                            );
                            return (
                              <motion.span
                                key={f.label}
                                layoutId={`factor-${f.label}`}
                                layout
                                initial={isAddTarget ? { opacity: 0, x: -15 } : false}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  borderRadius: 8,
                                  border: isCrossoff ? `2px solid ${MUTED}60`
                                    : (isElevated || isAdding) ? `2px solid ${TEAL}`
                                    : isLowered ? `2px solid ${PURPLE}`
                                    : `2px solid ${cat.color}25`,
                                  padding: (isElevated || isLowered || isCrossoff) ? "12px 20px" : "10px 18px",
                                  fontSize: (isElevated || isLowered || isCrossoff) ? 17 : 16,
                                  fontWeight: (isElevated || isLowered || isCrossoff) ? 700 : 600,
                                  fontFamily: "inherit",
                                  whiteSpace: "nowrap",
                                  color: isCrossoff ? MUTED
                                    : (isElevated || isAdding) ? TEAL
                                    : isLowered ? PURPLE
                                    : cat.color,
                                  backgroundColor: isCrossoff ? "#F3F4F6"
                                    : (isElevated || isAdding) ? "#E5F5FA"
                                    : isLowered ? `${PURPLE}12`
                                    : (SOLID_TINTS[cat.color] ?? "white"),
                                  textDecoration: isCrossoff ? "line-through" : "none",
                                  transition: "color 0.5s, background-color 0.5s, border 0.5s, padding 0.5s, font-size 0.5s, text-decoration 0.5s",
                                }}
                                animate={feeding ? {
                                  x: ((catFactors.length - 1) / 2 - fi) * 40,
                                  y: FEED_NUDGE_Y[catIdx],
                                  scale: 0,
                                  opacity: 0,
                                } : {
                                  x: isCrossoffShake ? [0, 0, -5, 6, -4, 3, -1, 0] : 0,
                                  y: 0,
                                  scale: isCrossoffShake ? [1, 1.02, 0.97, 0.95]
                                    : isCrossoff ? 0.95
                                    : (isElevated || isLowered) ? [1, 1.15, 1.05]
                                    : 1,
                                  opacity: noAction ? 0.35 : 1,
                                  boxShadow: isCrossoffShake
                                    ? [`0 0 12px ${TEAL}30`, `0 0 12px ${TEAL}30`, "0 0 0px transparent"]
                                    : (isElevated || isAdding)
                                      ? ["0 0 0px transparent", `0 0 20px ${TEAL}50`, `0 0 8px ${TEAL}25`]
                                      : isLowered
                                        ? ["0 0 0px transparent", `0 0 20px ${PURPLE}50`, `0 0 8px ${PURPLE}25`]
                                        : "0 0 0px transparent",
                                }}
                                transition={feeding ? {
                                  duration: 0.7,
                                  delay: catIdx * 0.04 + fi * 0.02,
                                  ease: [0.4, 0, 0.1, 1],
                                } : {
                                  opacity: { duration: 0.4 },
                                  x: isCrossoffShake
                                    ? { duration: 0.6, delay: 0.4, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] }
                                    : { duration: 0.3 },
                                  scale: isCrossoffShake
                                    ? { duration: 1.0, times: [0, 0.15, 0.55, 1], ease: EASE }
                                    : {
                                        duration: (isElevated || isLowered) ? 0.7 : 0.3,
                                        times: (isElevated || isLowered) ? [0, 0.4, 1] : undefined,
                                        ease: EASE,
                                      },
                                  boxShadow: isCrossoffShake
                                    ? { duration: 1.0, delay: 0.2, times: [0, 0.3, 1] }
                                    : { duration: showAction ? 0.7 : 0.3 },
                                  layout: { duration: 0.5, ease: EASE },
                                }}
                              >
                                {f.label}
                                {isCrossoff && (
                                  <motion.span
                                    key="crossoff-x"
                                    style={{ marginLeft: 4, fontSize: 13, color: MUTED }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 0.3 }}
                                  >
                                    ×
                                  </motion.span>
                                )}
                                {isElevated && (
                                  <motion.sup
                                    key="elevate-arrow"
                                    style={{ fontSize: 14, fontWeight: 800, color: TEAL, marginLeft: 3, lineHeight: 1 }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={shareMode ? { delay: 0.3, duration: 0.25 } : { delay: 0.3, duration: 0.3, type: "spring", stiffness: 300 }}
                                  >
                                    ↑
                                  </motion.sup>
                                )}
                                {isAdding && (
                                  <motion.sup
                                    style={{ fontSize: 14, fontWeight: 800, color: TEAL, marginLeft: 3, lineHeight: 1 }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={shareMode ? { delay: 0.3, duration: 0.25 } : { delay: 0.3, duration: 0.3, type: "spring", stiffness: 300 }}
                                  >
                                    +
                                  </motion.sup>
                                )}
                                {isLowered && (
                                  <motion.sup
                                    style={{ fontSize: 14, fontWeight: 800, color: PURPLE, marginLeft: 3, lineHeight: 1 }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={shareMode ? { delay: 0.3, duration: 0.25 } : { delay: 0.3, duration: 0.3, type: "spring", stiffness: 300 }}
                                  >
                                    ↓
                                  </motion.sup>
                                )}
                              </motion.span>
                            );
                          })}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                  </motion.div>
                  ) : (
                    <motion.div
                      key="selected-factors"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                        padding: "4px 12px",
                        width: "100%",
                        maxWidth: 1100,
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", width: "100%", gap: 0 }}>
                        {/* Left: All factors */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}
                        >
                          <motion.span
                            style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, fontFamily: "inherit", textTransform: "uppercase" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                          >
                            Selected From
                          </motion.span>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 10, justifyContent: "start", alignContent: "start" }}
                        >
                          {SQUARE_FACTORS.map((f) => {
                            const isSelected = SELECTED_FACTORS.some(sf => sf.label === f.label);
                            const catColor = CATEGORY_LAYOUT.find(c => c.key === f.category)?.color ?? MUTED;
                            return (
                              <motion.span
                                key={f.label}
                                layoutId={`factor-${f.label}`}
                                layout
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  borderRadius: 8,
                                  border: isSelected ? `1.5px solid ${TEAL}60` : `1px solid ${catColor}20`,
                                  padding: "6px 12px",
                                  fontSize: 13,
                                  fontWeight: isSelected ? 700 : 500,
                                  fontFamily: "inherit",
                                  whiteSpace: "nowrap",
                                  color: isSelected ? TEAL : `${catColor}90`,
                                  backgroundColor: isSelected ? `${TEAL}08` : `${catColor}06`,
                                }}
                                initial={false}
                                animate={{ opacity: isSelected ? 1 : 0.55 }}
                                transition={{ opacity: { duration: 0.4, delay: 0.1 }, layout: { duration: 0.8, ease: EASE } }}
                              >
                                {f.label}
                              </motion.span>
                            );
                          })}
                        </div>
                        </motion.div>

                        {/* Vertical line divider */}
                        <motion.div
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.25, ease: EASE }}
                          style={{ alignSelf: "stretch", width: 1, backgroundColor: "#D1D5DB", margin: "0 18px", flexShrink: 0, transformOrigin: "center" }}
                        />

                        {/* Right: Model Drivers */}
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: "0 0 auto", minWidth: 0 }}
                        >
                          <motion.span
                            style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", color: TEAL, fontFamily: "inherit", textTransform: "uppercase" }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
                          >
                            7 Model Drivers
                          </motion.span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {SELECTED_FACTORS.map((sf, si) => (
                              <motion.span
                                key={sf.label}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 12,
                                  border: `2.5px solid ${TEAL}`,
                                  padding: "10px 22px",
                                  fontSize: 16,
                                  fontWeight: 700,
                                  fontFamily: "inherit",
                                  whiteSpace: "nowrap",
                                  color: TEAL,
                                  backgroundColor: "#E5F5FA",
                                }}
                                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1, boxShadow: `0 0 16px ${TEAL}30` }}
                                transition={{ duration: 0.55, delay: 0.4 + si * 0.1, ease: EASE }}
                              >
                                {sf.label}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </LayoutGroup>
      </motion.div>
    </AnimatePresence>
  );
}
