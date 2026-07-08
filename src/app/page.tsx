"use client";

import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, X, LayoutGrid, ZoomIn, ZoomOut, Sun, Moon, Pause, Play, RotateCcw, FileDown } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { type NavGroup, SlideNav, AudienceTopBar } from "@/components/slide-nav";
import { useMode } from "@/lib/mode-context";
import { useShareMode } from "@/lib/share-context";
import { getPresenterNotes } from "@/lib/presenter-notes";
import { cn } from "@/lib/utils";
import { OverviewSlide, OVERVIEW_TOTAL_STEPS } from "@/components/slides/overview-slide";
import { OneModelSlide, ONE_MODEL_TOTAL_STEPS } from "@/components/slides/one-model";
import { PowerSlide, POWER_TOTAL_STEPS } from "@/components/slides/power-slide";
import { ExecuteSlide, EXECUTE_TOTAL_STEPS } from "@/components/slides/execute-slide";
import { RefineSlide, REFINE_TOTAL_STEPS } from "@/components/slides/refine-slide";
import { ClosingSummarySlide } from "@/components/slides/closing-summary";
import { AnimationGlossary } from "@/components/animation-glossary";

const MemoOverview = memo(OverviewSlide);
const MemoOneModel = memo(OneModelSlide);
const MemoPower = memo(PowerSlide);
const MemoExecute = memo(ExecuteSlide);
const MemoRefine = memo(RefineSlide);
const MemoClosing = memo(ClosingSummarySlide);

type SlideKind =
  | "intro"
  | "overview"
  | "one-model"
  | "power"
  | "execute"
  | "refine"
  | "closing-summary"
  | "end";

interface SlideConfig {
  kind: SlideKind;
}

const SLIDES: SlideConfig[] = [
  { kind: "intro" },
  // Overview
  { kind: "overview" },
  // Section 1: Design
  { kind: "one-model" },
  // Section 2: Power
  { kind: "power" },
  // Section 3: Execute
  { kind: "execute" },
  // Section 4: Refine
  { kind: "refine" },
  { kind: "closing-summary" },
  { kind: "end" },
];

const OVERVIEW_INDEX = 1;
const ONE_MODEL_INDEX = 2;
const POWER_INDEX = 3;
const EXECUTE_INDEX = 4;
const REFINE_INDEX = 5;

const SUB_STEP_CONFIG: Record<number, number> = {
  [OVERVIEW_INDEX]: OVERVIEW_TOTAL_STEPS,
  [ONE_MODEL_INDEX]: ONE_MODEL_TOTAL_STEPS,
  [POWER_INDEX]: POWER_TOTAL_STEPS,
  [EXECUTE_INDEX]: EXECUTE_TOTAL_STEPS,
  [REFINE_INDEX]: REFINE_TOTAL_STEPS,
};

const EXECUTE_PRESENTER_STEPS = 4;

type EngineFocus = "ml" | "strat" | "both" | null;

const ENGINE_FOCUS_MAP: Record<string, EngineFocus> = {
  // power
  [`${POWER_INDEX}-1`]: "ml",
  [`${POWER_INDEX}-2`]: "strat",
  [`${POWER_INDEX}-3`]: "strat",
  [`${POWER_INDEX}-4`]: "strat",
  [`${POWER_INDEX}-5`]: "strat",
  [`${POWER_INDEX}-6`]: "strat",
  [`${POWER_INDEX}-7`]: "strat",
  [`${POWER_INDEX}-8`]: "strat",
  [`${POWER_INDEX}-9`]: "both",
  // execute
  [`${EXECUTE_INDEX}-0`]: "both",
  [`${EXECUTE_INDEX}-1`]: "both",
  // refine
  [`${REFINE_INDEX}-1`]: "ml",
  [`${REFINE_INDEX}-2`]: "ml",
  [`${REFINE_INDEX}-3`]: "ml",
  [`${REFINE_INDEX}-4`]: "ml",
  [`${REFINE_INDEX}-5`]: "ml",
  [`${REFINE_INDEX}-6`]: "ml",
  [`${REFINE_INDEX}-7`]: "strat",
  [`${REFINE_INDEX}-8`]: "both",
};

const ML_GREEN = "#3A7D44";
const STRAT_BLUE = "#2A7BA5";

const ENGINE_INDICATOR_SLIDES = new Set([POWER_INDEX, EXECUTE_INDEX, REFINE_INDEX]);

type CategoryKey = "customer" | "product" | "market" | "order";

const FACTOR_CATEGORIES: { key: CategoryKey; label: string; color: string; tint: string }[] = [
  { key: "customer", label: "Customer", color: "#00446A", tint: "rgba(0,68,106,0.08)" },
  { key: "product", label: "Product", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
  { key: "market", label: "Market", color: "#2e7d32", tint: "rgba(46,125,50,0.08)" },
  { key: "order", label: "Order", color: "#7B5EA7", tint: "rgba(123,94,167,0.08)" },
];

const DRIVER_RAIL_ITEMS: { label: string; color: string; tint: string }[] = [
  { label: "Sales rep", color: "#00446A", tint: "rgba(0,68,106,0.08)" },
  { label: "Price sensitivity", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
  { label: "Competitive price point", color: "#2e7d32", tint: "rgba(46,125,50,0.08)" },
  { label: "Order frequency", color: "#7B5EA7", tint: "rgba(123,94,167,0.08)" },
  { label: "Cost to serve", color: "#E56910", tint: "rgba(229,105,16,0.08)" },
];


const ACTIVE_CATEGORIES_MAP: Record<string, CategoryKey[]> = {
  [`${POWER_INDEX}-0`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-1`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-2`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-3`]: ["customer"],
  [`${POWER_INDEX}-4`]: ["product"],
  [`${POWER_INDEX}-5`]: ["market"],
  [`${POWER_INDEX}-6`]: ["order"],
  [`${POWER_INDEX}-7`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-8`]: ["customer", "product", "market", "order"],
  [`${POWER_INDEX}-9`]: ["customer", "product", "market", "order"],
  [`${EXECUTE_INDEX}-0`]: ["customer", "order"],
  [`${EXECUTE_INDEX}-1`]: ["customer"],
  [`${REFINE_INDEX}-1`]: ["customer", "market"],
  [`${REFINE_INDEX}-2`]: ["customer"],
  [`${REFINE_INDEX}-3`]: ["customer"],
  [`${REFINE_INDEX}-4`]: ["customer"],
  [`${REFINE_INDEX}-5`]: ["customer"],
  [`${REFINE_INDEX}-6`]: ["customer", "market"],
  [`${REFINE_INDEX}-7`]: ["market"],
  [`${REFINE_INDEX}-8`]: ["customer", "product", "market", "order"],
};

const ENGINE_ITEMS: { key: "ml" | "strat"; label: string; color: string; tint: string }[] = [
  { key: "ml", label: "ML Prediction", color: ML_GREEN, tint: "rgba(58,125,68,0.08)" },
  { key: "strat", label: "Strategic Guidance", color: STRAT_BLUE, tint: "rgba(42,123,165,0.08)" },
];

function ModelStatusRail({
  activeCategories,
  drivers,
  engineFocus,
  showEngine = true,
  customerDotColor,
}: {
  activeCategories: CategoryKey[];
  drivers?: { label: string; color: string; tint: string }[];
  engineFocus: EngineFocus;
  showEngine?: boolean;
  customerDotColor?: string;
}) {
  const activeSet = useMemo(() => new Set(activeCategories), [activeCategories]);

  const mlActive = engineFocus === "both" || engineFocus === "ml";
  const stratActive = engineFocus === "both" || engineFocus === "strat";
  const R = 18;
  const CX = R + 2;
  const CY = R + 2;
  const svgSize = (R + 2) * 2;

  return (
    <motion.div
      className="fixed left-0 top-1/2 z-40 flex w-[130px] -translate-y-1/2 flex-col gap-3 rounded-r-xl bg-white/95 px-3 py-4 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
      initial={{ x: -140 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Engine section */}
      {showEngine && (<>
      <div className="flex flex-col items-center gap-1">
        <motion.span
          className="text-[8px] font-semibold uppercase tracking-[0.12em] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Model Engine
        </motion.span>

        <div className="flex items-center gap-2">
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            <motion.path
              d={`M ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX} ${CY + R} L ${CX} ${CY} Z`}
              fill={ML_GREEN}
              animate={{ opacity: mlActive ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d={`M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX} ${CY + R} L ${CX} ${CY} Z`}
              fill={STRAT_BLUE}
              animate={{ opacity: stratActive ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
            />
            <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="white" strokeWidth={1.5} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="white" strokeWidth={1.5} opacity={0.4} />
          </svg>

          <div className="flex flex-col gap-0.5">
            <motion.span
              className="text-[8px] font-semibold leading-tight"
              animate={{ color: mlActive ? ML_GREEN : "#D1D5DB" }}
              transition={{ duration: 0.3 }}
            >
              ML Prediction
            </motion.span>
            <motion.span
              className="text-[8px] font-semibold leading-tight"
              animate={{ color: stratActive ? STRAT_BLUE : "#D1D5DB" }}
              transition={{ duration: 0.3 }}
            >
              Strategic Guidance
            </motion.span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />
      </>)}

      {/* Factors section */}
      {(drivers || activeSet.size > 0) && <div className="flex flex-col gap-1.5">
        <motion.span
          className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {drivers ? (
            <span className="flex items-center gap-1.5">
              Model Drivers
              {customerDotColor && (
                <motion.span
                  className="size-[6px] shrink-0 rounded-full"
                  animate={{ backgroundColor: customerDotColor }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </span>
          ) : "Your Factors"}
        </motion.span>

        <AnimatePresence mode="wait">
          {drivers ? (
            <motion.div
              key="drivers"
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {drivers.map(({ label, color }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
                  initial={{ x: 60, opacity: 0, scale: 0.4, rotate: -20 }}
                  animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    x: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, delay: 0.1 + i * 0.1 },
                    scale: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                    rotate: { duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="flex-1 text-[11px] font-bold leading-tight"
                    style={{ color: "#374151" }}
                  >
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 40, rotate: 12, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {FACTOR_CATEGORIES.map(({ key, label, color, tint }, i) => {
                const active = activeSet.has(key);
                return (
                  <motion.div
                    key={key}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5"
                    initial={{ x: 120, opacity: 0, scale: 1.15 }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      backgroundColor: active ? tint : "#f3f4f6",
                      borderColor: active ? color : "transparent",
                    }}
                    transition={{
                      x: { duration: 0.45, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.3, delay: 0.35 + i * 0.09 },
                      scale: { duration: 0.4, delay: 0.35 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
                      backgroundColor: { duration: 0.2 },
                      borderColor: { duration: 0.2 },
                    }}
                  >
                    <div
                      className="size-2 shrink-0 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <motion.span
                      className="text-[11px] leading-tight"
                      animate={{
                        color: active ? "#374151" : "#9CA3AF",
                        fontWeight: active ? 700 : 500,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {label}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          className="mt-0.5 text-[8px] leading-tight text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.72 }}
        >
          {drivers ? "Tailored to your business" : "Tailored to your business"}
        </motion.span>
      </div>}
    </motion.div>
  );
}

const CUSTOMER_DOT_COLORS: Record<string, string> = {
  Acme: "#00446A",
  MedSupply: "#4A8FA8",
  QuickParts: "#C27A3A",
};

function MiniExecuteConnector() {
  const NAVY = "#00446A";
  const MUTED = "#8A9AAA";

  const customers = [
    { label: "Acme Industrial", price: "$19.24", dot: CUSTOMER_DOT_COLORS.Acme },
    { label: "MedSupply Co", price: "$14.89", dot: CUSTOMER_DOT_COLORS.MedSupply },
    { label: "QuickParts LLC", price: "$22.10", dot: CUSTOMER_DOT_COLORS.QuickParts },
  ];

  return (
    <motion.div
      className="fixed left-0 top-1/2 z-40 flex w-[130px] -translate-y-1/2 flex-col rounded-r-xl bg-white/95 px-3 py-4 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm"
      initial={{ x: -140 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="mb-2.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        Customer Prices
      </motion.span>

      <div className="flex flex-col gap-1.5">
        {customers.map((c, i) => (
          <motion.div
            key={c.label}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ backgroundColor: `${NAVY}05` }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="size-[5px] shrink-0 rounded-full" style={{ backgroundColor: c.dot }} />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold leading-none block" style={{ color: NAVY }}>
                {c.label}
              </span>
              <span className="text-[13px] font-bold tabular-nums leading-tight block mt-0.5" style={{ color: NAVY }}>
                {c.price}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    label: "Introduction",
    subtitle: "Overview of the five core pillars",
    slides: [
      { index: 0, label: "Welcome" },
      { index: OVERVIEW_INDEX, label: "Five core pillars", subStep: 0 },
    ],
  },
  {
    label: "1 | Design",
    subtitle: "One model built around your business",
    slides: [
      { index: ONE_MODEL_INDEX, label: "Model inputs", subStep: 0 },
      { index: ONE_MODEL_INDEX, label: "ML & strategic guidance", subStep: 1 },
    ],
  },
  {
    label: "2 | Power",
    subtitle: "How the ML model finds pricing patterns",
    slides: [
      { index: POWER_INDEX, label: "The problem", subStep: 0 },
      { index: POWER_INDEX, label: "Pattern scanning", subStep: 1 },
      { index: POWER_INDEX, label: "All factors", subStep: 2 },
      { index: POWER_INDEX, label: "Customer factors", subStep: 3 },
      { index: POWER_INDEX, label: "Product factors", subStep: 4 },
      { index: POWER_INDEX, label: "Market factors", subStep: 5 },
      { index: POWER_INDEX, label: "Order factors", subStep: 6 },
      { index: POWER_INDEX, label: "Final factors", subStep: 7 },
      { index: POWER_INDEX, label: "Model drivers", subStep: 8 },
      { index: POWER_INDEX, label: "SKU-level price", subStep: 9 },
    ],
  },
  {
    label: "3 | Execute",
    subtitle: "SKU-level prices tailored to each customer",
    slides: [
      { index: EXECUTE_INDEX, label: "Customer drivers", subStep: 0 },
      { index: EXECUTE_INDEX, label: "Customer examples", subStep: 1 },
    ],
  },
  {
    label: "4 | Refine",
    subtitle: "Optimizing prices along the demand curve",
    slides: [
      { index: REFINE_INDEX, label: "Market effects", subStep: 0 },
      { index: REFINE_INDEX, label: "Demand curve", subStep: 1 },
      { index: REFINE_INDEX, label: "Quickparts", subStep: 2 },
      { index: REFINE_INDEX, label: "Acme", subStep: 3 },
      { index: REFINE_INDEX, label: "Medsupply", subStep: 4 },
      { index: REFINE_INDEX, label: "Price optimization", subStep: 5 },
      { index: REFINE_INDEX, label: "Market changes", subStep: 6 },
      { index: REFINE_INDEX, label: "Full portfolio", subStep: 7 },
    ],
  },
  {
    label: "Closing",
    subtitle: "Summary and next steps",
    slides: [
      { index: 6, label: "Summary" },
      { index: 7, label: "Thank you" },
    ],
  },
];

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AUTO_ANIM_SLIDES = new Set<SlideKind>([]);

const DEFAULT_DONE_MS = 2000;

export function Home() {
  const { shareMode, toggleShareMode } = useShareMode();
  const [slide, setSlide] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [isAudience, setIsAudience] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [slideReplayKeys, setSlideReplayKeys] = useState<number[]>(() => SLIDES.map(() => 0));
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [slideSorterOpen, setSlideSorterOpen] = useState(false);
  const [sorterCols, setSorterCols] = useState(4);
  const [navGroups, setNavGroups] = useState(DEFAULT_NAV_GROUPS);
  const [darkMode, setDarkMode] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [presenterNavOpen, setPresenterNavOpen] = useState(false);
  const { mode } = useMode();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audienceWindowRef = useRef<Window | null>(null);
  const iframeSrcRef = useRef("");
  const [railEntering, setRailEntering] = useState(false);
  const [dynamicActiveCategories, setDynamicActiveCategories] = useState<CategoryKey[] | null>(null);
  const handleActiveCategoryChange = useCallback((cats: string[]) => setDynamicActiveCategories(cats as CategoryKey[]), []);
  const [executeCustomer, setExecuteCustomer] = useState("Acme");
  const handleExecuteCustomerChange = useCallback((c: string) => setExecuteCustomer(c), []);
  const [vortexDone, setVortexDone] = useState(false);
  const vortexTriggered = slide === POWER_INDEX && subStep === 8;

  useEffect(() => {
    if (!vortexTriggered) { setVortexDone(false); return; }
    const t = setTimeout(() => setVortexDone(true), 600);
    return () => clearTimeout(t);
  }, [vortexTriggered]);
  const prevRailVisibleRef = useRef(false);
  const [presentElapsed, setPresentElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const timerStartRef = useRef(0);
  const total = SLIDES.length;

  const presenterSkipped = useMemo(
    () => (mode === "presenter" ? new Set([OVERVIEW_INDEX]) : new Set<number>()),
    [mode],
  );

  const subStepConfig = useMemo(() => {
    if (mode !== "presenter") return SUB_STEP_CONFIG;
    return { ...SUB_STEP_CONFIG, [EXECUTE_INDEX]: EXECUTE_PRESENTER_STEPS };
  }, [mode]);

  const maxSteps = subStepConfig[slide] ?? 0;
  const hasSubSteps = maxSteps > 0;
  const config = SLIDES[slide];
  const notes = getPresenterNotes(config?.kind ?? "", subStep);
  const engineFocus = ENGINE_FOCUS_MAP[`${slide}-${subStep}`] ?? null;
  const railVisible = ENGINE_INDICATOR_SLIDES.has(slide) && !(slide === REFINE_INDEX && subStep === (REFINE_TOTAL_STEPS - 1));
  const showDrivers = (slide === POWER_INDEX && subStep >= 8 && (subStep > 8 || vortexDone)) || slide === EXECUTE_INDEX || slide === REFINE_INDEX;
  const staticActiveCategories = ACTIVE_CATEGORIES_MAP[`${slide}-${subStep}`] ?? [];
  const activeCategories = (slide === POWER_INDEX && dynamicActiveCategories && dynamicActiveCategories.length > 0)
    ? dynamicActiveCategories
    : staticActiveCategories;

  const displayNavGroups = useMemo(() => {
    if (presenterSkipped.size === 0) return navGroups;
    return navGroups
      .map((g) => ({
        ...g,
        slides: g.slides.filter((s) => !presenterSkipped.has(s.index)),
      }))
      .filter((g) => g.slides.length > 0);
  }, [navGroups, presenterSkipped]);

  const currentGroup =
    displayNavGroups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === slide &&
          (s.subStep === undefined || s.subStep === subStep),
      ),
    ) ?? displayNavGroups.find((g) => g.slides.some((s) => s.index === slide));

  const allClickSteps = useMemo(() => {
    const steps: { slideIndex: number; stepIndex: number; kind: SlideKind; label: string; groupLabel: string; groupSubtitle: string; groupIndex: number; slideInGroupIndex: number }[] = [];
    for (let i = 0; i < SLIDES.length; i++) {
      if (presenterSkipped.has(i)) continue;
      const kind = SLIDES[i].kind;
      const stepsCount = SUB_STEP_CONFIG[i] ?? 0;
      const gi = displayNavGroups.findIndex((g) => g.slides.some((s) => s.index === i));
      const group = gi >= 0 ? displayNavGroups[gi] : undefined;
      const groupLabel = group?.label ?? "";
      const groupSubtitle = group?.subtitle ?? "";
      if (stepsCount === 0) {
        const si = group?.slides.findIndex((s) => s.index === i) ?? -1;
        const navSlide = si >= 0 ? group!.slides[si] : undefined;
        steps.push({ slideIndex: i, stepIndex: 0, kind, label: navSlide?.label ?? kind, groupLabel, groupSubtitle, groupIndex: gi, slideInGroupIndex: si });
      } else {
        for (let s = 0; s < stepsCount; s++) {
          const si = group?.slides.findIndex((ns) => ns.index === i && ns.subStep === s) ?? -1;
          const navSlide = si >= 0 ? group!.slides[si] : undefined;
          const label = navSlide?.label ?? `Step ${s + 1}`;
          steps.push({ slideIndex: i, stepIndex: s, kind, label, groupLabel, groupSubtitle, groupIndex: gi, slideInGroupIndex: si });
        }
      }
    }
    return steps;
  }, [displayNavGroups, presenterSkipped]);

  const updateSlideLabel = useCallback((groupIndex: number, slideInGroupIndex: number, newLabel: string) => {
    setNavGroups((prev) => {
      const next = prev.map((g, gi) => {
        if (gi !== groupIndex) return g;
        return {
          ...g,
          slides: g.slides.map((s, si) => (si === slideInGroupIndex ? { ...s, label: newLabel } : s)),
        };
      });
      try {
        const labels: Record<string, string> = {};
        next.forEach((g, gi) => g.slides.forEach((s, si) => { labels[`${gi}-${si}`] = s.label; }));
        localStorage.setItem("ml-explainer-slide-labels", JSON.stringify(labels));
      } catch {}
      return next;
    });
  }, []);

  const exportSorterPdf = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const PAGE_W = 406.4;
    const PAGE_H = 304.8;
    const M = 16;
    const contentW = PAGE_W - M * 2;

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_H, PAGE_W] });

    const grouped: { label: string; subtitle: string; steps: typeof allClickSteps }[] = [];
    let curLabel = "";
    for (const cs of allClickSteps) {
      if (cs.groupLabel !== curLabel) {
        curLabel = cs.groupLabel;
        grouped.push({ label: cs.groupLabel, subtitle: cs.groupSubtitle, steps: [] });
      }
      grouped[grouped.length - 1].steps.push(cs);
    }

    const loadImage = (src: string): Promise<string> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          resolve(c.toDataURL("image/jpeg", 0.92));
        };
        img.onerror = () => resolve("");
        img.src = src;
      });

    const SECTION_COLORS: Record<string, [number, number, number]> = {
      "Introduction": [100, 116, 139],
      "1 | Design": [0, 68, 106],
      "2 | Power": [229, 105, 16],
      "3 | Execute": [46, 125, 50],
      "4 | Refine": [42, 123, 165],
      "Closing": [100, 116, 139],
    };

    // ── Page 1: Bird's eye flowchart (white background) ──
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(6, 40, 61);
    pdf.text("Inside Your Dynamic Model", PAGE_W / 2, 22, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(120, 130, 140);
    pdf.text("Presentation Flow", PAGE_W / 2, 30, { align: "center" });

    const BOX_GAP = 5;
    const BOX_H = 10;
    const SECTION_GAP = 10;
    let flowY = 40;

    for (let gi = 0; gi < grouped.length; gi++) {
      const group = grouped[gi];
      const rgb = SECTION_COLORS[group.label] ?? [100, 116, 139];

      // Section header bar
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      const headerW = pdf.getTextWidth(group.label.toUpperCase()) + 16;
      pdf.roundedRect(M, flowY, headerW, 9, 1.5, 1.5, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.text(group.label.toUpperCase(), M + 8, flowY + 6.2);

      if (group.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(140, 150, 160);
        pdf.text(group.subtitle, M + headerW + 5, flowY + 6.2);
      }
      flowY += 14;

      // Step boxes in wrapping rows
      const maxBoxW = 85;
      const boxesPerRow = Math.floor((contentW + BOX_GAP) / (maxBoxW + BOX_GAP));
      const boxW = (contentW - BOX_GAP * (boxesPerRow - 1)) / boxesPerRow;

      for (let i = 0; i < group.steps.length; i++) {
        const col = i % boxesPerRow;
        const bx = M + col * (boxW + BOX_GAP);

        if (col === 0 && i > 0) flowY += BOX_H + BOX_GAP;

        pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
        pdf.setLineWidth(0.4);
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.roundedRect(bx, flowY, boxW, BOX_H, 1.5, 1.5, "S");

        // Number badge
        pdf.roundedRect(bx + 1.5, flowY + 1.5, 5.5, BOX_H - 3, 1, 1, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        const numStr = String(i + 1);
        const numW = pdf.getTextWidth(numStr);
        pdf.text(numStr, bx + 1.5 + (5.5 - numW) / 2, flowY + BOX_H / 2 + 1.2);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(50, 50, 50);
        const truncated = pdf.splitTextToSize(group.steps[i].label, boxW - 14)[0];
        pdf.text(truncated, bx + 9, flowY + BOX_H / 2 + 1.2);

        // Arrow between boxes
        if (i < group.steps.length - 1 && col < boxesPerRow - 1) {
          const ax = bx + boxW;
          const ay = flowY + BOX_H / 2;
          pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
          pdf.setLineWidth(0.4);
          pdf.line(ax + 0.8, ay, ax + BOX_GAP - 0.8, ay);
          pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
          pdf.triangle(ax + BOX_GAP - 0.5, ay, ax + BOX_GAP - 2.5, ay - 1.2, ax + BOX_GAP - 2.5, ay + 1.2, "F");
        }
      }

      flowY += BOX_H + SECTION_GAP;

      // Arrow between sections
      if (gi < grouped.length - 1) {
        const ax = M + 10;
        pdf.setDrawColor(180, 190, 200);
        pdf.setLineWidth(0.4);
        pdf.line(ax, flowY - SECTION_GAP + 2, ax, flowY - 2);
        pdf.setFillColor(180, 190, 200);
        pdf.triangle(ax, flowY - 1, ax - 1.5, flowY - 4, ax + 1.5, flowY - 4, "F");
      }
    }

    // ── Slide detail pages ──
    let globalNum = 0;
    for (let gi = 0; gi < grouped.length; gi++) {
      const group = grouped[gi];
      const rgb = SECTION_COLORS[group.label] ?? [100, 116, 139];

      // Dark section divider page
      pdf.addPage();
      pdf.setFillColor(6, 40, 61);
      pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.text(group.label.toUpperCase(), PAGE_W / 2, PAGE_H / 2 - 8, { align: "center" });
      if (group.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(14);
        pdf.setTextColor(180, 200, 220);
        pdf.text(group.subtitle, PAGE_W / 2, PAGE_H / 2 + 6, { align: "center" });
      }
      pdf.setFontSize(11);
      pdf.setTextColor(130, 150, 170);
      pdf.text(`${group.steps.length} ${group.steps.length === 1 ? "step" : "steps"}`, PAGE_W / 2, PAGE_H / 2 + 18, { align: "center" });

      // One page per slide
      for (let si = 0; si < group.steps.length; si++) {
        const cs = group.steps[si];
        globalNum++;
        pdf.addPage();

        // Slim colored title line
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
        pdf.text(`${group.label}`, M, M + 5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(140, 140, 140);
        pdf.text(`  Slide ${si + 1} / ${group.steps.length}`, M + pdf.getTextWidth(`${group.label}`) + 2, M + 5);

        // Thin colored accent line
        pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
        pdf.setLineWidth(0.6);
        pdf.line(M, M + 9, M + contentW, M + 9);

        // Full-width slide image
        const imgTop = M + 14;
        const imgW = contentW;
        const imgH = imgW * (10 / 16);
        const thumbUrl = `/slide-thumbnails/slide-${cs.slideIndex}-${cs.stepIndex}.jpg`;
        const imgData = await loadImage(thumbUrl);

        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        pdf.roundedRect(M, imgTop, imgW, imgH, 1.5, 1.5, "S");
        if (imgData) {
          pdf.addImage(imgData, "JPEG", M + 0.3, imgTop + 0.3, imgW - 0.6, imgH - 0.6);
        }

        // Label below
        const labelY = imgTop + imgH + 7;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(30, 30, 30);
        const labelLines = pdf.splitTextToSize(cs.label, contentW);
        pdf.text(labelLines.slice(0, 2), M, labelY);
      }
    }

    pdf.save("Inside Your Dynamic Model — Slides.pdf");
  }, [allClickSteps]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setVisited(prev => {
      if (prev.has(slide)) return prev;
      const next = new Set(prev);
      next.add(slide);
      return next;
    });
  }, [slide]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    channelRef.current?.postMessage({ type: "theme", darkMode });
  }, [darkMode]);

  // Detect audience window mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("audience") === "true") {
      setIsAudience(true);
      const s = parseInt(params.get("slide") || "0", 10);
      const ss = parseInt(params.get("subStep") || "0", 10);
      setSlide(s);
      setSubStep(ss);
    }
    if (params.get("skipAnimation") === "true") {
      setSkipAnimation(true);
    }
  }, []);

  // BroadcastChannel: presenter broadcasts, audience listens
  useEffect(() => {
    if (isAudience) {
      const ch = new BroadcastChannel("ml-explainer-sync");
      ch.onmessage = (e: MessageEvent) => {
        if (e.data?.type === "navigate") {
          setSlide(e.data.slide);
          setSubStep(e.data.subStep);
        }
        if (e.data?.type === "theme") {
          document.documentElement.classList.toggle("dark", e.data.darkMode);
        }
      };
      return () => ch.close();
    }
    if (mode === "presenter") {
      const ch = new BroadcastChannel("ml-explainer-sync");
      channelRef.current = ch;
      return () => { ch.close(); channelRef.current = null; };
    }
  }, [isAudience, mode]);

  // Broadcast navigation state to audience window
  useEffect(() => {
    channelRef.current?.postMessage({ type: "navigate", slide, subStep });
  }, [slide, subStep]);

  const startPresenting = useCallback(() => {
    const base = window.location.origin + window.location.pathname;
    const qs = `?audience=true&mode=self&slide=${slide}&subStep=${subStep}`;
    audienceWindowRef.current = window.open(base + qs, "audience-view") ?? null;
    iframeSrcRef.current = base + qs;
    setPresenting(true);
    timerStartRef.current = Date.now();
    setPresentElapsed(0);
    setTimerRunning(true);
  }, [slide, subStep]);

  const endPresenting = useCallback(() => {
    audienceWindowRef.current?.close();
    audienceWindowRef.current = null;
    setPresenting(false);
    setTimerRunning(false);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setPresentElapsed(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (!presenting) return;
    const update = () =>
      setClockTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [presenting]);

  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      timerStartRef.current = Date.now() - presentElapsed * 1000;
      setTimerRunning(true);
    }
  }, [timerRunning, presentElapsed]);

  const resetTimer = useCallback(() => {
    timerStartRef.current = Date.now();
    setPresentElapsed(0);
  }, []);

  const nextPosition = useMemo(() => {
    const currentMax = subStepConfig[slide] ?? 0;
    if (currentMax > 0 && subStep < currentMax - 1) {
      return { slideIndex: slide, stepIndex: subStep + 1 };
    }
    let next = slide + 1;
    while (presenterSkipped.has(next) && next < total) next++;
    if (next >= total) return null;
    return { slideIndex: next, stepIndex: 0 };
  }, [slide, subStep, subStepConfig, presenterSkipped, total]);

  const currentClickIndex = useMemo(
    () => allClickSteps.findIndex((s) => s.slideIndex === slide && s.stepIndex === subStep),
    [allClickSteps, slide, subStep],
  );

  useEffect(() => {
    if (skipAnimation || isAudience || mode === "presenter") {
      const t = setTimeout(() => setAnimationDone(true));
      return () => clearTimeout(t);
    }
    const t0 = setTimeout(() => setAnimationDone(false));
    const kind = SLIDES[slide]?.kind;
    if (!AUTO_ANIM_SLIDES.has(kind)) {
      const t = setTimeout(() => setAnimationDone(true), DEFAULT_DONE_MS);
      return () => { clearTimeout(t0); clearTimeout(t); };
    }
    return () => clearTimeout(t0);
  }, [slide, subStep, mode, isAudience, skipAnimation]);

  useEffect(() => {
    if (railVisible && !prevRailVisibleRef.current && !skipAnimation) {
      setRailEntering(true);
      const t = setTimeout(() => setRailEntering(false), 700);
      prevRailVisibleRef.current = true;
      return () => clearTimeout(t);
    }
    prevRailVisibleRef.current = railVisible;
  }, [railVisible, skipAnimation]);

  const markAnimationDone = useCallback(() => setAnimationDone(true), []);

  const handleReplay = useCallback(() => {
    startTransition(() => {
      setSkipAnimation(false);
      setSlideReplayKeys(prev => prev.map((k, i) => i === slide ? k + 1 : k));
    });
  }, [slide]);

  const navigate = useCallback(
    (index: number, targetSubStep?: number) => {
      // Skip over presenter-hidden slides
      let target = index;
      if (targetSubStep === undefined && presenterSkipped.has(target)) {
        const forward = target > slide;
        while (presenterSkipped.has(target) && target >= 0 && target < total) {
          target += forward ? 1 : -1;
        }
        if (target < 0 || target >= total) return;
      }

      if (targetSubStep !== undefined) {
        const goingBack =
          target < slide || (target === slide && targetSubStep < subStep);
        if (target >= 0 && target < total) {
          startTransition(() => {
            setSkipAnimation(goingBack);
            setSlide(target);
            setSubStep(targetSubStep);
          });
        }
        return;
      }

      const currentMax = subStepConfig[slide] ?? 0;

      // Forward within sub-steps
      if (target === slide + 1 && currentMax > 0 && subStep < currentMax - 1) {
        startTransition(() => {
          setSkipAnimation(false);
          setSubStep((s) => s + 1);
        });
        return;
      }
      // Back within sub-steps
      if (target === slide - 1 && currentMax > 0 && subStep > 0) {
        startTransition(() => {
          setSkipAnimation(true);
          setSubStep((s) => s - 1);
        });
        return;
      }

      if (target >= 0 && target < total) {
        const goingBack = target < slide;

        // Going back into a sub-step slide from the next slide → land on last step
        const targetMax = subStepConfig[target] ?? 0;
        if (goingBack && targetMax > 0 && slide === target + 1) {
          startTransition(() => {
            setSkipAnimation(true);
            setSlide(target);
            setSubStep(targetMax - 1);
          });
          return;
        }

        startTransition(() => {
          setSkipAnimation(goingBack);
          setSlide(target);
          setSubStep(0);
        });
      }
    },
    [total, slide, subStep, subStepConfig, presenterSkipped],
  );

  useEffect(() => {
    if (isAudience) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(slide + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(slide - 1);
      } else if (e.key === "Escape" && glossaryOpen) {
        setGlossaryOpen(false);
      } else if (e.key === "Escape" && presenterNavOpen) {
        setPresenterNavOpen(false);
      } else if (e.key === "Escape" && slideSorterOpen) {
        setSlideSorterOpen(false);
      } else if (e.key === "Escape" && presenting) {
        endPresenting();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slide, navigate, isAudience, presenting, endPresenting, slideSorterOpen, presenterNavOpen, glossaryOpen]);

  return (
    <>
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--i2p-navy)]"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-white/70"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium tracking-[0.15em] text-white/40 uppercase">
                Preparing presentation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "flex min-h-[var(--slide-h,100vh)] flex-col items-center justify-start overflow-x-hidden pt-14 transition-[padding-left] duration-300",
          railVisible ? "pl-[140px]" : "",
          isAudience ? "" : "pb-16",
        )}
        style={{ "--rail-inset": railVisible ? "140px" : "0px" } as React.CSSProperties}
      >
        <div className="relative w-full">
        {SLIDES.map((sc, i) => {
          const isActive = i === slide;
          if (!isActive && !visited.has(i)) return null;
          const effectiveSkip = !isActive || skipAnimation;
          return (
            <div
              key={i}
              className={cn("w-full", !isActive && "absolute inset-0 overflow-hidden")}
              style={{
                visibility: isActive ? "visible" : "hidden",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <MotionConfig reducedMotion={isActive ? (skipAnimation ? "always" : "never") : "always"}>
                <div key={slideReplayKeys[i]}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: skipAnimation ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <motion.div
                      animate={{ opacity: railEntering ? 0 : 1 }}
                      transition={{ duration: railEntering ? 0.1 : 0.4 }}
                    >
                      {sc.kind === "intro" && <IntroSlide isActive={isActive} />}
                      {sc.kind === "overview" && <MemoOverview step={isActive ? subStep : 0} skipAnimation={effectiveSkip} isActive={isActive} />}
                      {sc.kind === "one-model" && (
                        <MemoOneModel
                          step={isActive ? subStep : 0}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onAutoAdvance={isActive && !skipAnimation ? () => navigate(slide + 1) : undefined}
                        />
                      )}
                      {sc.kind === "power" && (
                        <MemoPower
                          step={isActive ? subStep : 0}
                          onAutoAdvance={isActive && !skipAnimation ? () => navigate(slide + 1) : undefined}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                          onActiveCategoryChange={isActive ? handleActiveCategoryChange : undefined}
                        />
                      )}
                      {sc.kind === "refine" && (
                        <MemoRefine
                          step={isActive ? subStep : 0}
                          onAutoAdvance={isActive && !skipAnimation ? () => navigate(slide + 1) : undefined}
                          skipAnimation={effectiveSkip}
                          isActive={isActive}
                        />
                      )}
                      {sc.kind === "execute" && <MemoExecute step={isActive ? subStep : 0} skipAnimation={effectiveSkip} isActive={isActive} onCustomerChange={isActive ? handleExecuteCustomerChange : undefined} />}
                      {sc.kind === "closing-summary" && <MemoClosing isActive={isActive} />}
                      {sc.kind === "end" && <EndSlide onRestart={() => navigate(0)} />}
                    </motion.div>
                  </motion.div>
                </div>
              </MotionConfig>
            </div>
          );
        })}
        </div>
      </main>

      {railVisible && (
        slide === REFINE_INDEX ? (
          <MiniExecuteConnector />
        ) : (
          <ModelStatusRail
            activeCategories={activeCategories}
            drivers={showDrivers ? DRIVER_RAIL_ITEMS : undefined}
            engineFocus={engineFocus}
            showEngine={slide === POWER_INDEX}
            customerDotColor={slide === EXECUTE_INDEX ? CUSTOMER_DOT_COLORS[executeCustomer] : undefined}
          />
        )
      )}


      {isAudience ? (
        <AudienceTopBar
          groups={displayNavGroups}
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
        />
      ) : (
        <SlideNav
          current={slide}
          currentSubStep={hasSubSteps ? subStep : undefined}
          total={total}
          groups={displayNavGroups}
          onNavigate={navigate}
          animationDone={animationDone}
          onStartPresenting={mode === "presenter" ? startPresenting : undefined}
          onAnimationGlossary={() => setGlossaryOpen(true)}
          onSlideSorter={() => setSlideSorterOpen(true)}
          showReplay={skipAnimation}
          onReplay={handleReplay}
        />
      )}

      {/* Slide sorter overlay */}
      {slideSorterOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#f3f4f6]">
          <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-5 py-2.5 shadow-sm">
            <div className="flex items-center gap-3">
              <LayoutGrid className="size-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">
                Slide Sorter
              </span>
              <span className="text-xs text-gray-400">
                {allClickSteps.length} steps
              </span>
              <span className="text-[10px] text-gray-300">
                · Click any label to edit · Exports with your edits
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSorterCols((c) => Math.max(2, c - 1))}
                  disabled={sorterCols <= 2}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="size-4" />
                </button>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={sorterCols}
                  onChange={(e) => setSorterCols(Number(e.target.value))}
                  className="h-1 w-24 cursor-pointer accent-[#00446A]"
                />
                <button
                  onClick={() => setSorterCols((c) => Math.min(8, c + 1))}
                  disabled={sorterCols >= 8}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="size-4" />
                </button>
                <span className="min-w-[2.5rem] text-center text-[11px] text-gray-400">
                  {sorterCols} col
                </span>
              </div>
              <button
                onClick={exportSorterPdf}
                className="flex items-center gap-1.5 rounded-md border border-[#00446A]/20 bg-[#00446A]/5 px-3 py-1.5 text-xs font-medium text-[#00446A] transition-colors hover:bg-[#00446A]/10"
              >
                <FileDown className="size-3.5" />
                Export PDF
              </button>
              <button
                onClick={() => setSlideSorterOpen(false)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <X className="size-3.5" />
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto space-y-6" style={{ maxWidth: sorterCols <= 3 ? "56rem" : "90rem" }}>
              {(() => {
                const grouped: { groupLabel: string; groupSubtitle: string; steps: (typeof allClickSteps[number] & { globalIndex: number })[] }[] = [];
                let currentGroupLabel = "";
                let globalIdx = 0;
                for (const cs of allClickSteps) {
                  if (cs.groupLabel !== currentGroupLabel) {
                    currentGroupLabel = cs.groupLabel;
                    grouped.push({ groupLabel: cs.groupLabel, groupSubtitle: cs.groupSubtitle, steps: [] });
                  }
                  grouped[grouped.length - 1].steps.push({ ...cs, globalIndex: globalIdx++ });
                }
                return grouped.map((g, gi) => (
                  <div key={gi}>
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#06283D] px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <h3 className={cn(
                          "font-bold uppercase tracking-[0.12em] text-white",
                          sorterCols >= 6 ? "text-[10px]" : "text-xs",
                        )}>
                          {g.groupLabel}
                        </h3>
                        {g.groupSubtitle && (
                          <p className={cn(
                            "mt-0.5 font-medium text-white/50",
                            sorterCols >= 6 ? "text-[9px]" : "text-[11px]",
                          )}>
                            {g.groupSubtitle}
                          </p>
                        )}
                      </div>
                      <span className={cn(
                        "shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/50",
                        sorterCols >= 6 ? "text-[9px]" : "text-[10px]",
                      )}>
                        {g.steps.length} {g.steps.length === 1 ? "step" : "steps"}
                      </span>
                    </div>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${sorterCols}, 1fr)`,
                        gap: sorterCols >= 6 ? "8px" : "12px",
                      }}
                    >
                      {g.steps.map((cs) => {
                        const isActive = cs.slideIndex === slide && cs.stepIndex === subStep;
                        return (
                          <div
                            key={cs.globalIndex}
                            className={cn(
                              "group relative flex w-full flex-col rounded-lg border text-left transition-all hover:shadow-md",
                              isActive
                                ? "border-[#E56910] shadow-[0_0_12px_rgba(229,105,16,0.2)] ring-2 ring-[#E56910]/30"
                                : "border-gray-200 bg-white hover:border-gray-300",
                            )}
                          >
                            <div
                              className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-t-lg bg-gray-100"
                              onClick={() => {
                                navigate(cs.slideIndex, cs.stepIndex);
                                setSlideSorterOpen(false);
                              }}
                            >
                              <img
                                src={`/slide-thumbnails/slide-${cs.slideIndex}-${cs.stepIndex}.jpg`}
                                alt={cs.label}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className={cn(
                              "flex items-start gap-1.5 rounded-b-lg px-2 py-2",
                              isActive ? "bg-[#E56910]/10" : "bg-white",
                            )}>
                              <span className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                isActive
                                  ? "bg-[#E56910] text-white"
                                  : "bg-gray-100 text-gray-400",
                              )}>
                                {cs.globalIndex + 1}
                              </span>
                              <textarea
                                rows={2}
                                value={cs.label}
                                onChange={(e) => updateSlideLabel(cs.groupIndex, cs.slideInGroupIndex, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Click to add label…"
                                className={cn(
                                  "min-w-0 flex-1 resize-none rounded border border-transparent bg-transparent px-1 -mx-1 font-medium leading-snug outline-none transition-colors hover:border-gray-200 hover:bg-gray-50 focus:border-[#00446A]/30 focus:bg-white focus:ring-1 focus:ring-[#00446A]/30",
                                  sorterCols >= 6 ? "text-[10px]" : "text-xs",
                                  isActive ? "text-gray-900" : "text-gray-600",
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {glossaryOpen && <AnimationGlossary onClose={() => setGlossaryOpen(false)} />}

      {/* Presenter console overlay */}
      {presenting && !isAudience && (
        <div className={cn("fixed inset-0 z-[100] flex flex-col transition-colors", darkMode ? "bg-[#0a0a0a]" : "bg-gray-100")}>
          {/* Top bar */}
          <div className={cn("relative flex shrink-0 items-center border-b px-4 py-2 transition-colors", darkMode ? "border-white/10 bg-[#111]/90" : "border-black/10 bg-white")}>
            <div className="flex items-center gap-2">
              <button
                onClick={endPresenting}
                className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", darkMode ? "border-white/15 bg-white/5 text-white/70 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300" : "border-black/15 bg-black/5 text-gray-600 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600")}
              >
                <X className="size-3.5" />
                End Show
              </button>
              <span className={darkMode ? "text-white/15" : "text-black/15"}>|</span>
              <button
                onClick={() => setPresenterNavOpen((o) => !o)}
                className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors", darkMode ? "text-white/70 hover:bg-white/10" : "text-gray-600 hover:bg-black/5")}
              >
                {currentGroup?.label}
                <ChevronDown className={cn("size-3 transition-transform", darkMode ? "text-white/40" : "text-gray-400", presenterNavOpen && "rotate-180")} />
              </button>
            </div>

            {/* Center: Timer */}
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <span className={cn("font-mono text-xl font-semibold tabular-nums", darkMode ? "text-white" : "text-gray-900")}>
                {formatElapsed(presentElapsed)}
              </span>
              <button
                onClick={toggleTimer}
                className={cn("rounded-md p-1.5 transition-colors", darkMode ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-gray-700")}
                aria-label={timerRunning ? "Pause timer" : "Resume timer"}
              >
                {timerRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button
                onClick={resetTimer}
                className={cn("rounded-md p-1.5 transition-colors", darkMode ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-gray-700")}
                aria-label="Reset timer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>

            {/* Right: Clock + Dark mode */}
            <div className="ml-auto flex items-center gap-3">
              <span className={cn("text-lg font-medium", darkMode ? "text-white/60" : "text-gray-500")}>
                {clockTime}
              </span>
              <button
                onClick={toggleShareMode}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  darkMode
                    ? "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                    : "border-black/15 bg-black/5 text-gray-600 hover:border-black/30 hover:bg-black/10",
                )}
              >
                <span className={shareMode ? "text-teal-400" : ""}>I'm Sharing This On Teams</span>
                <div
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors duration-200",
                    shareMode ? "bg-teal-500" : darkMode ? "bg-white/20" : "bg-black/15",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-200",
                      shareMode ? "translate-x-3.5" : "translate-x-0.5",
                    )}
                  />
                </div>
              </button>
              <button
                onClick={() => setDarkMode((d) => !d)}
                className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors", darkMode ? "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white" : "border-black/15 bg-black/5 text-gray-600 hover:border-black/30 hover:bg-black/10 hover:text-gray-900")}
              >
                {darkMode ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>

            {/* Nav dropdown */}
            {presenterNavOpen && (
              <div className={cn("absolute left-0 right-0 top-full z-10 max-h-[50vh] overflow-y-auto border-b p-3 backdrop-blur-md", darkMode ? "border-white/10 bg-[#111]/95" : "border-black/10 bg-white/95")}>
                {displayNavGroups.map((group, gi) => (
                  <div key={gi} className="mb-2 last:mb-0">
                    <div className={cn("mb-1 px-2 text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-white/30" : "text-gray-400")}>
                      {group.label}
                    </div>
                    {group.slides.map((s, si) => {
                      const isActive = s.index === slide && (s.subStep === undefined || s.subStep === subStep);
                      return (
                        <button
                          key={si}
                          onClick={() => { navigate(s.index, s.subStep); setPresenterNavOpen(false); }}
                          className={cn(
                            "w-full rounded px-3 py-1.5 text-left text-xs transition-colors",
                            darkMode
                              ? isActive ? "bg-white/10 font-medium text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"
                              : isActive ? "bg-black/10 font-medium text-gray-900" : "text-gray-500 hover:bg-black/5 hover:text-gray-700",
                          )}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex min-h-0 flex-1">
            {/* Left: Current slide + progress */}
            <div className="flex flex-1 flex-col p-4">
              <div className={cn("relative flex-1 overflow-hidden rounded-xl border", darkMode ? "border-white/10 bg-[#06283D]" : "border-black/10 bg-[#06283D]")}>
                <iframe
                  src={iframeSrcRef.current}
                  className="pointer-events-none absolute inset-0 h-full w-full border-0"
                  title="Slide Preview"
                  onLoad={() => {
                    channelRef.current?.postMessage({ type: "navigate", slide, subStep });
                  }}
                />
              </div>
              {/* Slide counter + progress bar */}
              <div className="mt-3 flex items-center gap-4 px-1">
                <button
                  onClick={() => navigate(slide - 1)}
                  disabled={slide === 0 && subStep === 0}
                  className={cn("rounded-md p-1.5 transition-colors disabled:opacity-30", darkMode ? "text-white/50 hover:bg-white/10" : "text-gray-400 hover:bg-black/5")}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <span className={cn("text-sm font-medium", darkMode ? "text-white/70" : "text-gray-600")}>
                    Slide {currentClickIndex + 1} of {allClickSteps.length}
                  </span>
                  <div className={cn("h-1 w-full max-w-xs rounded-full", darkMode ? "bg-white/10" : "bg-black/10")}>
                    <div
                      className="h-full rounded-full bg-[#E56910] transition-all duration-300"
                      style={{ width: `${((currentClickIndex + 1) / allClickSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate(slide + 1)}
                  disabled={slide === total - 1}
                  className={cn("rounded-md p-1.5 transition-colors disabled:opacity-30", darkMode ? "text-white/50 hover:bg-white/10" : "text-gray-400 hover:bg-black/5")}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className={cn("flex w-[380px] shrink-0 flex-col border-l transition-colors", darkMode ? "border-white/10 bg-[#111]" : "border-black/10 bg-white")}>
              {/* Next slide preview */}
              <div className={cn("shrink-0 border-b p-4", darkMode ? "border-white/10" : "border-black/10")}>
                <h3 className={cn("mb-2 text-[10px] font-bold uppercase tracking-[0.15em]", darkMode ? "text-white/40" : "text-gray-400")}>
                  Next slide
                </h3>
                <div className={cn("relative aspect-[16/10] overflow-hidden rounded-lg border", darkMode ? "border-white/10 bg-[#06283D]" : "border-black/10 bg-gray-900")}>
                  <div className={cn("absolute inset-0 flex items-center justify-center text-sm", darkMode ? "text-white/30" : "text-white/40")}>
                    {nextPosition ? "Preview unavailable" : "End of presentation"}
                  </div>
                  {nextPosition && (
                    <img
                      src={`/slide-thumbnails/slide-${nextPosition.slideIndex}-${nextPosition.stepIndex}.jpg`}
                      alt="Next slide"
                      className="relative h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
              </div>

              {/* Speaker notes */}
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className={cn("mb-4 text-[10px] font-bold uppercase tracking-[0.15em]", darkMode ? "text-white/40" : "text-gray-400")}>
                  Speaker Notes
                </h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <p key={i} className={cn("text-[13px] leading-relaxed", darkMode ? "text-white/70" : "text-gray-600")}>
                        {note}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-[13px] italic", darkMode ? "text-white/30" : "text-gray-400")}>
                    No notes for this step.
                  </p>
                )}
              </div>

              {/* Bottom navigation */}
              <div className={cn("border-t px-4 py-3", darkMode ? "border-white/10" : "border-black/10")}>
                {currentGroup && currentGroup.slides.length > 1 && (
                  <div className="mb-3 flex items-center justify-center gap-1.5">
                    {currentGroup.slides.map((s) => {
                      const isActive = s.index === slide && (s.subStep === undefined || s.subStep === subStep);
                      return (
                        <button
                          key={`${s.index}-${s.subStep ?? ""}`}
                          onClick={() => navigate(s.index, s.subStep)}
                          className={cn(
                            "size-2 rounded-full transition-all",
                            darkMode
                              ? isActive ? "scale-125 bg-white" : "bg-white/30 hover:bg-white/50"
                              : isActive ? "scale-125 bg-gray-800" : "bg-gray-300 hover:bg-gray-400",
                          )}
                        />
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(slide - 1)}
                    disabled={slide === 0 && subStep === 0}
                    className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30", darkMode ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-black/5 hover:text-gray-800")}
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                  <button
                    onClick={() => navigate(slide + 1)}
                    disabled={slide === total - 1}
                    className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30", darkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/10 text-gray-800 hover:bg-black/15")}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Intro Slide ──────────────────────────────────────────────── */

function I2PLogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="0" y="0" width="15" height="15" rx="2" fill="#EF8B1D" />
      <rect x="19" y="0" width="15" height="15" rx="2" fill="#E56910" />
      <rect x="0" y="19" width="15" height="15" rx="2" fill="#00446A" />
      <rect x="19" y="19" width="15" height="15" rx="2" fill="#E56910" />
    </svg>
  );
}

function IntroBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 700"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="intro-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00446A" />
          <stop offset="100%" stopColor="#06283D" />
        </linearGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#intro-grad)" />

      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={100 * i}
          y1="0"
          x2={100 * i}
          y2="700"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={100 * i}
          x2="1200"
          y2={100 * i}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {[
        [180, 180, 3], [220, 260, 2], [310, 150, 2.5], [370, 310, 2],
        [440, 200, 3.5], [520, 280, 2], [560, 140, 2.5], [640, 240, 3],
        [710, 170, 2], [780, 300, 2.5], [830, 190, 2], [900, 260, 3],
        [960, 150, 2.5], [1020, 220, 2], [1060, 310, 2.5],
        [150, 450, 2], [250, 520, 2.5], [380, 480, 3], [490, 540, 2],
        [600, 460, 2.5], [720, 510, 2], [850, 470, 3], [950, 530, 2.5],
        [1050, 490, 2],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill={i % 5 === 0 ? "#E56910" : i % 3 === 0 ? "#21A5D5" : "white"}
          opacity={i % 5 === 0 ? 0.3 : 0.14}
        />
      ))}

      <path
        d="M80 520 C200 510, 300 480, 450 420 S700 300, 900 250 S1050 210, 1140 190"
        fill="none"
        stroke="rgba(229,105,16,0.22)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M80 540 C200 530, 300 500, 450 450 S700 340, 900 290 S1050 250, 1140 230"
        fill="none"
        stroke="rgba(33,165,213,0.15)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MODEL_WORDS = ["Design", "Power", "Execute", "Refine"];


function RotatingWord({ isActive }: { isActive: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    setIndex(0);
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MODEL_WORDS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <span className="relative inline-flex flex-col items-start overflow-hidden align-bottom" style={{ height: "1.15em" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={MODEL_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="inline-block whitespace-nowrap"
        >
          {MODEL_WORDS[index]}
        </motion.span>
      </AnimatePresence>
      <span className="absolute -bottom-0.5 left-0 h-1 w-full rounded-full bg-[#E56910]" />
    </span>
  );
}

function IntroSlide({ isActive }: { isActive: boolean }) {
  const { mode } = useMode();

  return (
    <div className="-mt-14 -mb-16 relative flex h-[var(--slide-h,100vh)] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <IntroBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <I2PLogoMark className="size-8" />
          <span className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase">
            Insight2Profit
          </span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="block">Inside Your</span>
          <span className="block">Dynamic Model</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/70">
          See how your pricing model turns data into decisions — and decisions into measurable profit.
        </p>

        {mode === "self" && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/40">
            <span>Tap Next or press → to walk through the story</span>
            <span className="inline-block animate-pulse">→</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── End Slide ────────────────────────────────────────────────── */

function EndSlide({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        End of Walkthrough
      </span>
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Thank You
      </h2>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Questions? Let&apos;s discuss how this model can work for your business.
      </p>
      <button
        onClick={onRestart}
        className="mt-10 rounded-lg bg-[#00446a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#00446a]/90"
      >
        ← Start Over
      </button>
    </div>
  );
}

export default Home;
