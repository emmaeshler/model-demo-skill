"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Helpers ──

function useLoop(durationMs: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), durationMs);
    return () => clearInterval(id);
  }, [durationMs]);
  return tick;
}

function PreviewBox({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="relative h-[130px] w-full overflow-hidden rounded-t-xl border-b border-gray-100 bg-gray-50">
      {children}
      {label && (
        <span className="absolute bottom-1.5 right-2 text-[9px] font-medium text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}

// ── Preview Components ──

function SweepPreview() {
  const tick = useLoop(3000);
  const dots = [
    [25, 50], [45, 35], [65, 60], [85, 30], [105, 55],
    [125, 40], [145, 65], [165, 25], [185, 45], [205, 58],
    [225, 33], [245, 50],
  ];
  return (
    <PreviewBox label="power / profit-growth">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {dots.map(([cx, cy], i) => (
          <motion.circle
            key={`${i}-${tick}`}
            cx={cx}
            cy={cy}
            r={4}
            initial={{ fill: "#CBD5E1", opacity: 0.5 }}
            animate={{ fill: "#E56910", opacity: 0.9 }}
            transition={{ delay: (cx / 270) * 1.8, duration: 0.3 }}
          />
        ))}
        {dots.map(([cx, cy], i) => (
          <motion.circle
            key={`ring-${i}-${tick}`}
            cx={cx}
            cy={cy}
            r={4}
            fill="none"
            stroke="#E56910"
            strokeWidth={1}
            initial={{ r: 4, opacity: 0 }}
            animate={{ r: 12, opacity: [0, 0.5, 0] }}
            transition={{ delay: (cx / 270) * 1.8, duration: 0.6 }}
          />
        ))}
        <motion.line
          key={tick}
          x1={0} y1={0} x2={0} y2={130}
          stroke="#E56910"
          strokeWidth={2}
          initial={{ x1: 0, x2: 0 }}
          animate={{ x1: 270, x2: 270 }}
          transition={{ duration: 2, ease: "linear" }}
        />
        <motion.rect
          key={`glow-${tick}`}
          x={0} y={0} width={30} height={130}
          fill="url(#sweepGrad)"
          initial={{ x: -30 }}
          animate={{ x: 240 }}
          transition={{ duration: 2, ease: "linear" }}
        />
        <defs>
          <linearGradient id="sweepGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#E56910" stopOpacity="0" />
            <stop offset="100%" stopColor="#E56910" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
    </PreviewBox>
  );
}

function SnapPreview() {
  const tick = useLoop(4000);
  const scattered = [
    [40, 25], [180, 90], [90, 100], [220, 20], [60, 70],
    [200, 55], [130, 15], [160, 105], [30, 85], [240, 70],
    [110, 45], [75, 110],
  ];
  const aligned = [
    [30, 95], [55, 85], [80, 75], [105, 65], [130, 57],
    [155, 50], [180, 44], [205, 39], [230, 35], [245, 32],
    [140, 52], [170, 46],
  ];
  return (
    <PreviewBox label="refine / profit-growth">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <motion.path
          key={`curve-${tick}`}
          d="M 20 100 Q 100 80 140 55 T 260 25"
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        />
        {scattered.map(([sx, sy], i) => (
          <motion.circle
            key={`${i}-${tick}`}
            r={3.5}
            fill="#21A5D5"
            initial={{ cx: sx, cy: sy, opacity: 0.3 }}
            animate={{
              cx: aligned[i][0],
              cy: aligned[i][1],
              opacity: 0.85,
            }}
            transition={{
              delay: 1.6 + i * 0.08,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>
    </PreviewBox>
  );
}

function MorphPreview() {
  const tick = useLoop(4000);
  const phase = tick % 2;
  const curveA = "M 20 100 Q 80 85 135 55 T 255 20";
  const curveB = "M 20 80 Q 100 50 160 40 T 255 30";
  return (
    <PreviewBox label="refine / market-evolution">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <motion.path
          d={phase === 0 ? curveA : curveB}
          fill="none"
          stroke="#334155"
          strokeWidth={2}
          strokeOpacity={0.6}
          initial={false}
          animate={{ d: phase === 0 ? curveA : curveB }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d={phase === 0 ? curveB : curveA}
          fill="none"
          stroke="#334155"
          strokeWidth={1}
          strokeOpacity={0.12}
          strokeDasharray="4 3"
          initial={false}
          animate={{ d: phase === 0 ? curveB : curveA }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        {[
          { a: [60, 92], b: [70, 72] },
          { a: [120, 62], b: [140, 46] },
          { a: [180, 40], b: [195, 36] },
          { a: [230, 25], b: [240, 30] },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            r={4}
            fill="#E56910"
            opacity={0.8}
            initial={false}
            animate={{
              cx: phase === 0 ? dot.a[0] : dot.b[0],
              cy: phase === 0 ? dot.a[1] : dot.b[1],
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </PreviewBox>
  );
}

function DrawPreview() {
  const tick = useLoop(3500);
  return (
    <PreviewBox label="overview / refine">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`c-${i}-${tick}`}
            cx={35 + i * 52}
            cy={65}
            r={12}
            fill="none"
            stroke="#334155"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ delay: i * 0.25, duration: 0.4, type: "spring", damping: 14 }}
            style={{ transformOrigin: `${35 + i * 52}px 65px` }}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.text
            key={`t-${i}-${tick}`}
            x={35 + i * 52}
            y={69}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="#334155"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: i * 0.25 + 0.1, duration: 0.3 }}
          >
            {i + 1}
          </motion.text>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <motion.line
            key={`l-${i}-${tick}`}
            x1={47 + i * 52}
            y1={65}
            x2={83 + i * 52}
            y2={65}
            stroke="#E56910"
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: (i + 1) * 0.25 + 0.15, duration: 0.3, ease: "easeOut" }}
          />
        ))}
        <motion.path
          key={`curve-${tick}`}
          d="M 20 110 Q 80 100 135 95 Q 200 90 255 105"
          fill="none"
          stroke="#21A5D5"
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </PreviewBox>
  );
}

function CascadePreview() {
  const tick = useLoop(3500);
  const items = [
    { w: 100, color: "#E56910" },
    { w: 85, color: "#21A5D5" },
    { w: 110, color: "#3A7D44" },
    { w: 75, color: "#2A7BA5" },
    { w: 95, color: "#E56910" },
  ];
  return (
    <PreviewBox label="power / closing / execute">
      <div className="flex h-full flex-col justify-center gap-2 px-6 py-3">
        {items.map((item, i) => (
          <motion.div
            key={`${i}-${tick}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="h-3 rounded-full"
              style={{ backgroundColor: item.color, width: 0 }}
              animate={{ width: item.w }}
              transition={{ delay: i * 0.15 + 0.2, duration: 0.5, ease: "easeOut" }}
            />
            <motion.span
              className="text-[10px] font-semibold text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.4, duration: 0.3 }}
            >
              {Math.round(item.w * 1.2)}%
            </motion.span>
          </motion.div>
        ))}
      </div>
    </PreviewBox>
  );
}

function PulsePreview() {
  return (
    <PreviewBox label="one-model / execute">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <circle cx={135} cy={65} r={20} fill="#00446A" opacity={0.8} />
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={135}
            cy={65}
            r={20}
            fill="none"
            stroke="#21A5D5"
            strokeWidth={1.5}
            animate={{
              r: [20, 35 + i * 8],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.circle
          cx={135}
          cy={65}
          r={20}
          fill="none"
          stroke="#E56910"
          strokeWidth={2}
          animate={{
            r: [18, 22, 18],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x={135} y={69} textAnchor="middle" fontSize={10} fontWeight={700} fill="white" opacity={0.8}>
          MODEL
        </text>
      </svg>
    </PreviewBox>
  );
}

function FlowPreview() {
  return (
    <PreviewBox label="one-model / execute">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <rect x={15} y={40} width={55} height={50} rx={6} fill="#334155" fillOpacity={0.06} stroke="#334155" strokeOpacity={0.25} strokeWidth={1} />
        <text x={42} y={69} textAnchor="middle" fontSize={8} fill="#334155" opacity={0.5}>DATA</text>
        <circle cx={220} cy={65} r={22} fill="#00446A" stroke="#334155" strokeOpacity={0.25} strokeWidth={1} />
        <text x={220} y={69} textAnchor="middle" fontSize={7} fontWeight={700} fill="white" opacity={0.9}>MODEL</text>
        <path d="M 70 65 C 110 65 140 40 180 50 Q 195 55 198 65" fill="none" stroke="#334155" strokeOpacity={0.25} strokeWidth={1} />
        <path d="M 70 65 C 110 65 140 90 180 80 Q 195 75 198 65" fill="none" stroke="#334155" strokeOpacity={0.25} strokeWidth={1} />
        {[0, 1, 2].map((i) => {
          const pts = Array.from({ length: 20 }, (_, t) => {
            const p = t / 19;
            const x = 70 + p * 128;
            const cp = i % 2 === 0 ? -25 : 25;
            const y = 65 + Math.sin(p * Math.PI) * cp * (1 - p * 0.5);
            return [x, y];
          });
          return (
            <motion.circle
              key={i}
              r={2.5}
              fill="#E56910"
              animate={{
                cx: pts.map((p) => p[0]),
                cy: pts.map((p) => p[1]),
                opacity: [0, 0.8, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "linear",
              }}
            />
          );
        })}
      </svg>
    </PreviewBox>
  );
}

function CollapsePreview() {
  const tick = useLoop(4000);
  const positions = [
    [55, 35], [215, 35], [55, 95], [215, 95], [135, 25],
  ];
  return (
    <PreviewBox label="overview / power">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {positions.map(([cx, cy], i) => (
          <motion.circle
            key={`${i}-${tick}`}
            r={8}
            fill={i % 2 === 0 ? "#E56910" : "#21A5D5"}
            initial={{ cx, cy, opacity: 0.7 }}
            animate={{ cx: 135, cy: 65, opacity: 0 }}
            transition={{
              delay: 1.5 + i * 0.1,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        {positions.map(([cx, cy], i) => (
          <motion.line
            key={`line-${i}-${tick}`}
            x1={cx}
            y1={cy}
            stroke="#334155"
            strokeWidth={0.5}
            strokeOpacity={0.25}
            initial={{ x2: cx, y2: cy }}
            animate={{ x2: 135, y2: 65 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeInOut" }}
          />
        ))}
        <motion.circle
          key={`center-${tick}`}
          cx={135}
          cy={65}
          r={0}
          fill="#334155"
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: 18, opacity: 0.15 }}
          transition={{ delay: 2.2, duration: 0.5, type: "spring", damping: 12 }}
        />
        <motion.text
          key={`txt-${tick}`}
          x={135}
          y={69}
          textAnchor="middle"
          fontSize={8}
          fontWeight={700}
          fill="#334155"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.3 }}
          style={{ transformOrigin: "135px 69px" }}
        >
          UNIFIED
        </motion.text>
      </svg>
    </PreviewBox>
  );
}

function SplitPreview() {
  const tick = useLoop(4000);
  return (
    <PreviewBox label="one-model">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <motion.path
          key={`top-${tick}`}
          d="M 135 40 A 25 25 0 0 1 135 90"
          fill="none"
          stroke="#3A7D44"
          strokeWidth={2.5}
          initial={{ d: "M 135 40 A 25 25 0 0 1 135 90", y: 0, opacity: 0.3 }}
          animate={{
            d: "M 135 30 A 25 25 0 0 1 135 80",
            y: -12,
            opacity: 1,
          }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          key={`bot-${tick}`}
          d="M 135 90 A 25 25 0 0 1 135 40"
          fill="none"
          stroke="#2A7BA5"
          strokeWidth={2.5}
          initial={{ d: "M 135 90 A 25 25 0 0 1 135 40", y: 0, opacity: 0.3 }}
          animate={{
            d: "M 135 50 A 25 25 0 0 1 135 100",
            y: 12,
            opacity: 1,
          }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          key={`ring-${tick}`}
          cx={135}
          cy={65}
          r={25}
          fill="none"
          stroke="#334155"
          strokeWidth={1.5}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0, r: 40 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
        <motion.text key={`ml-${tick}`} x={135} y={48} textAnchor="middle" fontSize={7} fontWeight={700} fill="#3A7D44"
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 2.2, duration: 0.4 }}>
          ML
        </motion.text>
        <motion.text key={`st-${tick}`} x={135} y={92} textAnchor="middle" fontSize={7} fontWeight={700} fill="#2A7BA5"
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 2.4, duration: 0.4 }}>
          STRAT
        </motion.text>
      </svg>
    </PreviewBox>
  );
}

function FillPreview() {
  const tick = useLoop(3000);
  const bars = [
    { label: "Volume", value: 72, color: "#E56910" },
    { label: "Margin", value: 55, color: "#21A5D5" },
    { label: "History", value: 88, color: "#3A7D44" },
    { label: "Region", value: 40, color: "#2A7BA5" },
  ];
  return (
    <PreviewBox label="execute">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {bars.map((bar, i) => {
          const y = 18 + i * 28;
          return (
            <g key={`${i}-${tick}`}>
              <text x={15} y={y + 10} fontSize={8} fill="#334155" opacity={0.5}>{bar.label}</text>
              <rect x={65} y={y} width={180} height={14} rx={7} fill="#334155" fillOpacity={0.06} />
              <motion.rect
                x={65}
                y={y}
                height={14}
                rx={7}
                fill={bar.color}
                initial={{ width: 0 }}
                animate={{ width: (bar.value / 100) * 180 }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              />
              <motion.circle
                cy={y + 7}
                r={5}
                fill="white"
                stroke="#00000020"
                strokeWidth={1}
                initial={{ cx: 65, opacity: 0 }}
                animate={{ cx: 65 + (bar.value / 100) * 180, opacity: 1 }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </svg>
    </PreviewBox>
  );
}

function SpinPreview() {
  const tick = useLoop(4000);
  const words = ["Design", "Power", "Execute", "Refine", "Grow"];
  const wordIdx = tick % words.length;
  return (
    <PreviewBox label="intro / power">
      <div className="flex h-full items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex size-12 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-[#E56910] border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              key={`price-${tick}`}
              className="text-[10px] font-bold text-gray-800"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.3, type: "spring" }}
            >
              $4.82
            </motion.span>
          </div>
          <span className="text-[8px] text-gray-300">Spinner</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-8 items-end overflow-hidden text-lg font-bold text-gray-800">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[wordIdx]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="inline-block"
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#E56910]" />
          </div>
          <span className="text-[8px] text-gray-300">Carousel</span>
        </div>
      </div>
    </PreviewBox>
  );
}

function ShakePreview() {
  const tick = useLoop(2500);
  return (
    <PreviewBox label="power">
      <div className="flex h-full items-center justify-center gap-4 px-6">
        <motion.div
          key={`shake-${tick}`}
          className="rounded-full border border-gray-300 bg-gray-200 px-3 py-1.5 text-[10px] font-medium text-gray-600 line-through decoration-red-400"
          animate={{ x: [0, -4, 5, -3, 3, -1, 0] }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Cost Region
        </motion.div>
        <motion.div
          key={`glow-${tick}`}
          className="rounded-full border border-[#E56910]/40 bg-[#E56910]/10 px-3 py-1.5 text-[10px] font-semibold text-[#E56910]"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(229,105,16,0)",
              "0 0 12px 4px rgba(229,105,16,0.3)",
              "0 0 4px 1px rgba(229,105,16,0.1)",
            ],
          }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Win Rate
        </motion.div>
        <motion.div
          key={`dim-${tick}`}
          className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-[10px] text-gray-300"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0.25, scale: 0.95 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          Ship Mode
        </motion.div>
      </div>
    </PreviewBox>
  );
}

function BlurPreview() {
  const tick = useLoop(4000);
  const words = ["Dynamic", "Pricing", "Model"];
  return (
    <PreviewBox label="profit-growth">
      <div className="flex h-full flex-col items-center justify-center gap-1">
        <div className="flex gap-2">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${tick}`}
              className="text-lg font-bold text-gray-800"
              initial={{ filter: "blur(8px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
            >
              {word}
            </motion.span>
          ))}
        </div>
        <motion.div
          key={`line-${tick}`}
          className="h-0.5 rounded-full bg-[#E56910]"
          initial={{ width: 0 }}
          animate={{ width: 140 }}
          transition={{ delay: 2, duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </PreviewBox>
  );
}

function DriftPreview() {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    cx: 20 + (i % 10) * 25 + ((i * 7) % 13),
    cy: 15 + Math.floor(i / 10) * 38 + ((i * 11) % 17),
    size: 2 + (i % 3),
    dx: ((i * 7) % 11) - 5,
    dy: ((i * 13) % 9) - 4,
    dur: 3 + (i % 4),
  }));
  return (
    <PreviewBox label="power / refine">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {dots.map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.size}
            fill={i % 5 === 0 ? "#E56910" : i % 3 === 0 ? "#21A5D5" : "#94A3B8"}
            opacity={i % 5 === 0 ? 0.5 : 0.2}
            animate={{
              cx: [d.cx, d.cx + d.dx, d.cx],
              cy: [d.cy, d.cy + d.dy, d.cy],
            }}
            transition={{
              duration: d.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </PreviewBox>
  );
}

function GhostPreview() {
  const tick = useLoop(5000);
  const curves = [
    { d: "M 20 100 Q 80 75 140 55 T 255 25", color: "#E56910", label: "A" },
    { d: "M 20 95 Q 90 60 150 50 T 255 35", color: "#21A5D5", label: "B" },
    { d: "M 20 90 Q 70 80 130 60 T 255 40", color: "#3A7D44", label: "C" },
  ];
  return (
    <PreviewBox label="refine">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {curves.map((c, i) => (
          <motion.path
            key={`${i}-${tick}`}
            d={c.d}
            fill="none"
            stroke={c.color}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ delay: 0.3 + i * 0.4, duration: 0.8, ease: "easeOut" }}
          />
        ))}
        {curves.map((c, i) => (
          <motion.text
            key={`lbl-${i}-${tick}`}
            x={255}
            y={i === 0 ? 22 : i === 1 ? 34 : 42}
            fontSize={8}
            fontWeight={600}
            fill={c.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.8 + i * 0.4, duration: 0.3 }}
          >
            {c.label}
          </motion.text>
        ))}
        <motion.path
          key={`merged-${tick}`}
          d="M 20 95 Q 80 70 140 55 T 255 30"
          fill="none"
          stroke="#334155"
          strokeWidth={2.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </PreviewBox>
  );
}

function FlyAwayPreview() {
  const tick = useLoop(4000);
  const cards = [
    { x: 95, y: 45, toX: -80, toY: -60, color: "#E56910", label: "ORDER" },
    { x: 175, y: 45, toX: 80, toY: -60, color: "#21A5D5", label: "MARKET" },
    { x: 95, y: 85, toX: -80, toY: 60, color: "#3A7D44", label: "CUST" },
    { x: 175, y: 85, toX: 80, toY: 60, color: "#2A7BA5", label: "PROD" },
  ];
  return (
    <PreviewBox label="power (removed)">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {cards.map((c, i) => (
          <motion.g
            key={`${i}-${tick}`}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: c.toX, y: c.toY, opacity: 0 }}
            transition={{ delay: 1.2 + i * 0.12, duration: 0.7, ease: [0.55, 0, 1, 0.45] }}
          >
            <motion.rect
              x={c.x - 30}
              y={c.y - 14}
              width={60}
              height={28}
              rx={5}
              fill={c.color}
              fillOpacity={0.15}
              stroke={c.color}
              strokeWidth={1}
              strokeOpacity={0.4}
              initial={{ scale: 1 }}
              animate={{ scale: 0.85 }}
              transition={{ delay: 1.2 + i * 0.12, duration: 0.7 }}
              style={{ transformOrigin: `${c.x}px ${c.y}px` }}
            />
            <text x={c.x} y={c.y + 3} textAnchor="middle" fontSize={7} fontWeight={700} fill={c.color} opacity={0.7}>
              {c.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </PreviewBox>
  );
}

function ShapeMorphPreview() {
  const tick = useLoop(4000);
  return (
    <PreviewBox label="execute (removed)">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <motion.rect
          key={`shape-${tick}`}
          fill="none"
          stroke="#E56910"
          strokeWidth={2}
          initial={{ x: 110, y: 40, width: 50, height: 50, rx: 25 }}
          animate={{ x: 75, y: 45, width: 120, height: 40, rx: 8 }}
          transition={{ delay: 1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.text
          key={`price-${tick}`}
          x={135}
          y={69}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#334155"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          $17.50
        </motion.text>
        <motion.text
          key={`label-${tick}`}
          x={135}
          y={58}
          textAnchor="middle"
          fontSize={6}
          fill="#334155"
          opacity={0.4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.8, duration: 0.3 }}
        >
          RECOMMENDED
        </motion.text>
        <motion.circle
          key={`burst-${tick}`}
          cx={135}
          cy={65}
          fill="none"
          stroke="#E56910"
          strokeWidth={1}
          initial={{ r: 25, opacity: 0.5 }}
          animate={{ r: 50, opacity: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </PreviewBox>
  );
}

function SpinRingPreview() {
  return (
    <PreviewBox label="execute (removed)">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        <circle cx={135} cy={65} r={28} fill="#00446A" opacity={0.5} />
        <motion.circle
          cx={135}
          cy={65}
          r={36}
          fill="none"
          stroke="#21A5D5"
          strokeWidth={1.5}
          strokeDasharray="12 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "135px 65px" }}
        />
        <motion.circle
          cx={135}
          cy={65}
          r={28}
          fill="none"
          stroke="#E56910"
          strokeWidth={1}
          animate={{
            r: [28, 31, 28],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x={135} y={63} textAnchor="middle" fontSize={6} fill="#334155" opacity={0.4}>LEARNING</text>
        <motion.text
          x={135}
          y={73}
          textAnchor="middle"
          fontSize={8}
          fontWeight={700}
          fill="#334155"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          ● ● ●
        </motion.text>
      </svg>
    </PreviewBox>
  );
}

function WordBuildPreview() {
  const tick = useLoop(4000);
  const words = ["Every", "price,", "refined", "together"];
  return (
    <PreviewBox label="power / refine (removed)">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 px-6">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${tick}`}
              className="text-base font-bold text-gray-800"
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.5 + i * 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </PreviewBox>
  );
}

function SkeletonPreview() {
  const tick = useLoop(5000);
  return (
    <PreviewBox label="overview / power / refine / profit-growth">
      <svg viewBox="0 0 270 130" className="h-full w-full">
        {/* Skeleton phase — dashed axes, ghost curve, faint dots */}
        <motion.g
          key={`skel-${tick}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
        >
          <line x1={30} y1={15} x2={30} y2={110} stroke="#334155" strokeWidth={1.2} strokeDasharray="5 4" opacity={0.25} />
          <line x1={30} y1={110} x2={250} y2={110} stroke="#334155" strokeWidth={1.2} strokeDasharray="5 4" opacity={0.25} />
          {[0, 1, 2, 3].map((i) => (
            <line key={`gh${i}`} x1={30} y1={30 + i * 22} x2={250} y2={30 + i * 22} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 5" opacity={0.1} />
          ))}
          <path d="M 30 25 Q 100 45 150 70 T 250 105" fill="none" stroke="#334155" strokeWidth={1.8} strokeDasharray="6 4" opacity={0.18} />
          {[[55, 35], [80, 50], [110, 55], [140, 70], [170, 75], [200, 85], [230, 95], [65, 60], [150, 80], [195, 65]].map(([cx, cy], i) => (
            <circle key={`gd${i}`} cx={cx} cy={cy} r={2.5} fill="#334155" opacity={0.12} />
          ))}
        </motion.g>
        {/* Real content fades in */}
        <motion.g
          key={`real-${tick}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <line x1={30} y1={15} x2={30} y2={110} stroke="#334155" strokeWidth={1} opacity={0.3} />
          <line x1={30} y1={110} x2={250} y2={110} stroke="#334155" strokeWidth={1} opacity={0.3} />
          <motion.path
            key={`rc-${tick}`}
            d="M 30 25 Q 100 45 150 70 T 250 105"
            fill="none" stroke="#E56910" strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 2.8, duration: 0.8, ease: "easeOut" }}
          />
          {[[55, 35], [80, 50], [110, 55], [140, 70], [170, 75], [200, 85], [230, 95], [65, 60], [150, 80], [195, 65]].map(([cx, cy], i) => (
            <motion.circle
              key={`rd${i}-${tick}`}
              cx={cx} cy={cy} r={3}
              fill="#21A5D5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: 3.0 + i * 0.06, duration: 0.3 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
        </motion.g>
      </svg>
    </PreviewBox>
  );
}

// ── Composition Previews ──

function CompPreviewBox({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="relative h-[220px] w-full overflow-hidden rounded-lg bg-gray-50">
      {children}
      {label && (
        <span className="absolute bottom-2 right-3 text-[9px] font-medium text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}

function ChipCustomizeComp() {
  const tick = useLoop(7000);
  const pills = [
    { label: "Win rate", action: "highlight" as const, delay: 1.5 },
    { label: "Lead time", action: "none" as const, delay: 0.4 },
    { label: "Region", action: "crossoff" as const, delay: 2.5 },
    { label: "Order size", action: "none" as const, delay: 0.6 },
    { label: "Seasonality", action: "deemph" as const, delay: 3.5 },
    { label: "Cost to serve", action: "highlight" as const, delay: 4.2 },
    { label: "Market share", action: "none" as const, delay: 0.8 },
    { label: "Ship mode", action: "crossoff" as const, delay: 4.8 },
  ];
  const colors = ["#21A5D5", "#E56910", "#3A7D44", "#8B6CC1"];
  return (
    <CompPreviewBox label="power-slide step 2">
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5">
        <motion.p
          key={`title-${tick}`}
          className="text-[10px] font-semibold uppercase tracking-widest text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          Customize your model
        </motion.p>
        <div className="flex flex-wrap justify-center gap-2">
          {pills.map((pill, i) => {
            const color = colors[i % colors.length];
            if (pill.action === "crossoff") {
              return (
                <motion.div
                  key={`${i}-${tick}`}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0.3], x: [0, 0, 0, -4, 5, -3, 3, -1, 0, 0] }}
                  transition={{ delay: pill.delay, duration: 1.2, times: [0, 0.15, 0.5, 1] }}
                >
                  {pill.label}
                </motion.div>
              );
            }
            if (pill.action === "highlight") {
              return (
                <motion.div
                  key={`${i}-${tick}`}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                  style={{ borderColor: `${color}60`, color, backgroundColor: `${color}15` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, boxShadow: [`0 0 0 0 ${color}00`, `0 0 10px 3px ${color}40`, `0 0 4px 1px ${color}20`] }}
                  transition={{ delay: pill.delay, duration: 0.8 }}
                >
                  {pill.label}
                </motion.div>
              );
            }
            if (pill.action === "deemph") {
              return (
                <motion.div
                  key={`${i}-${tick}`}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0.25], scale: [0.8, 1, 1, 0.92] }}
                  transition={{ delay: pill.delay, duration: 0.8, times: [0, 0.15, 0.5, 1] }}
                >
                  {pill.label}
                </motion.div>
              );
            }
            return (
              <motion.div
                key={`${i}-${tick}`}
                className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
                style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3, type: "spring", stiffness: 380, damping: 22 }}
              >
                {pill.label}
              </motion.div>
            );
          })}
        </div>
        <motion.p
          key={`sub-${tick}`}
          className="text-[9px] text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.5, duration: 0.4 }}
        >
          cascade + shake + glow + deemph
        </motion.p>
      </div>
    </CompPreviewBox>
  );
}

function FlowToCenterComp() {
  const tick = useLoop(5000);
  const sources = [
    { x: 30, y: 35, color: "#21A5D5", label: "CUST" },
    { x: 30, y: 145, color: "#3A7D44", label: "MARKET" },
    { x: 350, y: 35, color: "#E56910", label: "PROD" },
    { x: 350, y: 145, color: "#8B6CC1", label: "ORDER" },
  ];
  const ctrX = 190;
  const ctrY = 90;
  return (
    <CompPreviewBox label="one-model / execute">
      <svg viewBox="0 0 380 180" className="h-full w-full">
        <circle cx={ctrX} cy={ctrY} r={28} fill="#00446A" opacity={0.6} />
        <text x={ctrX} y={ctrY + 4} textAnchor="middle" fontSize={8} fontWeight={700} fill="white" opacity={0.6}>MODEL</text>
        {sources.map((s, si) => {
          const pts = Array.from({ length: 25 }, (_, t) => {
            const p = t / 24;
            const cpx = (s.x + ctrX) / 2 + (si % 2 === 0 ? -30 : 30);
            const cpy = (s.y + ctrY) / 2 + (si < 2 ? 20 : -20);
            const x = (1 - p) * (1 - p) * s.x + 2 * (1 - p) * p * cpx + p * p * ctrX;
            const y = (1 - p) * (1 - p) * s.y + 2 * (1 - p) * p * cpy + p * p * ctrY;
            return [x, y];
          });
          return (
            <g key={si}>
              <rect x={s.x - 25} y={s.y - 12} width={50} height={24} rx={4} fill={s.color} fillOpacity={0.12} stroke={s.color} strokeOpacity={0.25} strokeWidth={1} />
              <text x={s.x} y={s.y + 3} textAnchor="middle" fontSize={7} fontWeight={600} fill={s.color} opacity={0.7}>{s.label}</text>
              <path
                d={`M ${s.x} ${s.y} Q ${(s.x + ctrX) / 2 + (si % 2 === 0 ? -30 : 30)} ${(s.y + ctrY) / 2 + (si < 2 ? 20 : -20)} ${ctrX} ${ctrY}`}
                fill="none" stroke={s.color} strokeOpacity={0.12} strokeWidth={1}
              />
              {[0, 1].map((di) => (
                <motion.circle
                  key={`${si}-${di}-${tick}`}
                  r={2.5}
                  fill={s.color}
                  animate={{
                    cx: pts.map((p) => p[0]),
                    cy: pts.map((p) => p[1]),
                    opacity: [0, 0.7, 0.7, 0.7, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: si * 0.3 + di * 1, ease: "linear" }}
                />
              ))}
            </g>
          );
        })}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx={ctrX} cy={ctrY} r={28}
            fill="none" stroke="#21A5D5" strokeWidth={1}
            animate={{ r: [28, 40 + i * 6], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
          />
        ))}
      </svg>
    </CompPreviewBox>
  );
}

function ConvergeToPriceComp() {
  const tick = useLoop(8000);
  const satellites = [
    { angle: 0, color: "#21A5D5", price: "$4.20" },
    { angle: 90, color: "#E56910", price: "$5.10" },
    { angle: 180, color: "#3A7D44", price: "$4.65" },
    { angle: 270, color: "#8B6CC1", price: "$4.80" },
  ];
  const ctrX = 190;
  const ctrY = 105;
  const orbitR = 60;
  return (
    <CompPreviewBox label="power-slide step 4">
      <svg viewBox="0 0 380 210" className="h-full w-full">
        {satellites.map((sat, i) => {
          const rad = (sat.angle * Math.PI) / 180;
          const sx = ctrX + Math.cos(rad) * orbitR;
          const sy = ctrY + Math.sin(rad) * orbitR;
          return (
            <g key={i}>
              <motion.line
                key={`line-${i}-${tick}`}
                x1={ctrX} y1={ctrY}
                stroke={sat.color} strokeWidth={1} strokeOpacity={0.3}
                initial={{ x2: sx, y2: sy }}
                animate={{ x2: ctrX, y2: ctrY }}
                transition={{ delay: 2 + i * 0.15, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                key={`sat-${i}-${tick}`}
                r={16}
                fill={sat.color} fillOpacity={0.15}
                stroke={sat.color} strokeWidth={1.5}
                initial={{ cx: sx, cy: sy, opacity: 1 }}
                animate={{ cx: ctrX, cy: ctrY, opacity: 0, r: 6 }}
                transition={{ delay: 2 + i * 0.15, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.text
                key={`price-${i}-${tick}`}
                textAnchor="middle" fontSize={8} fontWeight={600} fill={sat.color}
                initial={{ x: sx, y: sy + 3, opacity: 0.8 }}
                animate={{ x: ctrX, y: ctrY + 3, opacity: 0 }}
                transition={{ delay: 2 + i * 0.15, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {sat.price}
              </motion.text>
            </g>
          );
        })}
        <circle cx={ctrX} cy={ctrY} r={24} fill="#00446A" />
        <motion.circle
          key={`spin-${tick}`}
          cx={ctrX} cy={ctrY} r={30}
          fill="none" stroke="#E56910" strokeWidth={1.5} strokeDasharray="10 6"
          initial={{ opacity: 0.5 }}
          animate={{ rotate: 720, opacity: [0.5, 0.5, 0.5, 0] }}
          transition={{ delay: 3.5, duration: 2.5, ease: "linear" }}
          style={{ transformOrigin: `${ctrX}px ${ctrY}px` }}
        />
        <motion.text
          key={`dots-${tick}`}
          x={ctrX} y={ctrY + 3}
          textAnchor="middle" fontSize={7} fill="white"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5, 0.8, 0] }}
          transition={{ delay: 3.5, duration: 2, ease: "easeInOut" }}
        >
          ● ● ●
        </motion.text>
        <motion.g
          key={`final-${tick}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 6, duration: 0.5, type: "spring", damping: 10 }}
          style={{ transformOrigin: `${ctrX}px ${ctrY}px` }}
        >
          <text x={ctrX} y={ctrY - 4} textAnchor="middle" fontSize={6} fill="white" opacity={0.5}>RECOMMENDED</text>
          <text x={ctrX} y={ctrY + 8} textAnchor="middle" fontSize={13} fontWeight={800} fill="white">$4.82</text>
        </motion.g>
        <motion.circle
          key={`burst-${tick}`}
          cx={ctrX} cy={ctrY} r={24}
          fill="none" stroke="#E56910" strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ r: [24, 55], opacity: [0, 0.5, 0] }}
          transition={{ delay: 6.2, duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </CompPreviewBox>
  );
}

function ScanOptimizeComp() {
  const tick = useLoop(6000);
  const dots = Array.from({ length: 24 }, (_, i) => ({
    x: 25 + (i % 8) * 42,
    y: 30 + Math.floor(i / 8) * 50 + ((i * 7) % 20),
    optY: 30 + Math.floor(i / 8) * 50 + ((i * 7) % 20) - 8 + ((i * 3) % 12),
    color: ["#E56910", "#21A5D5", "#3A7D44", "#8B6CC1"][i % 4],
  }));
  return (
    <CompPreviewBox label="profit-growth">
      <svg viewBox="0 0 380 180" className="h-full w-full">
        {dots.map((d, i) => (
          <motion.circle
            key={`${i}-${tick}`}
            cx={d.x} r={4}
            initial={{ cy: d.y, fill: "#4B5563", opacity: 0.25 }}
            animate={{ cy: d.optY, fill: d.color, opacity: 0.8 }}
            transition={{ delay: (d.x / 360) * 2.5 + 1.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {dots.map((d, i) => (
          <motion.circle
            key={`ring-${i}-${tick}`}
            cx={d.x} cy={d.optY} r={4}
            fill="none" stroke={d.color} strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ r: [4, 10], opacity: [0, 0.4, 0] }}
            transition={{ delay: (d.x / 360) * 2.5 + 1.5, duration: 0.5 }}
          />
        ))}
        <motion.line
          key={`sweep-${tick}`}
          y1={10} y2={170} stroke="#3A7D44" strokeWidth={2}
          initial={{ x1: 10, x2: 10 }}
          animate={{ x1: 370, x2: 370 }}
          transition={{ delay: 1.5, duration: 3, ease: "linear" }}
        />
        <motion.g
          key={`kpi-${tick}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect x={290} y={25} width={80} height={55} rx={6} fill="white" stroke="#CBD5E1" strokeWidth={1} />
          <text x={330} y={42} textAnchor="middle" fontSize={6} fill="#64748B">MARGIN LIFT</text>
          <text x={330} y={60} textAnchor="middle" fontSize={16} fontWeight={800} fill="#3A7D44">+3.2%</text>
        </motion.g>
      </svg>
    </CompPreviewBox>
  );
}

function ScatterToCurveComp() {
  const tick = useLoop(7000);
  const count = 28;
  const dots = Array.from({ length: count }, (_, i) => {
    const scatterX = 30 + ((i * 47) % 310);
    const scatterY = 20 + ((i * 31) % 140);
    const t = i / (count - 1);
    const curveX = 30 + t * 310;
    const curveY = 150 - (140 * Math.pow(1 - t, 0.6)) + ((i * 13) % 16) - 8;
    return { scatterX, scatterY, curveX, curveY };
  });
  return (
    <CompPreviewBox label="refine-slide">
      <svg viewBox="0 0 380 180" className="h-full w-full">
        <motion.path
          key={`curve-${tick}`}
          d="M 30 150 Q 100 120 160 80 Q 220 45 280 30 Q 320 22 340 18"
          fill="none" stroke="#334155" strokeWidth={2} strokeOpacity={0.4}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.5, duration: 1, ease: "easeOut" }}
        />
        {dots.map((d, i) => (
          <motion.circle
            key={`${i}-${tick}`}
            r={3} fill="#21A5D5"
            initial={{ cx: d.scatterX, cy: d.scatterY, opacity: 0.2 }}
            animate={{ cx: d.curveX, cy: d.curveY, opacity: 0.75 }}
            transition={{ delay: 3.5 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {[
          { x: 100, y: 110, label: "QuickParts", color: "#E56910" },
          { x: 200, y: 55, label: "Acme", color: "#3A7D44" },
          { x: 300, y: 25, label: "MedSupply", color: "#8B6CC1" },
        ].map((cust, i) => (
          <motion.g
            key={`cust-${i}-${tick}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.2 + i * 0.3, duration: 0.4 }}
          >
            <motion.circle
              cx={cust.x} r={5} fill={cust.color}
              initial={{ cy: cust.y + 20 }}
              animate={{ cy: cust.y }}
              transition={{ delay: 5.2 + i * 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1={cust.x} x2={cust.x} y1={165}
              stroke={cust.color} strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.4}
              initial={{ y2: 165 }}
              animate={{ y2: cust.y + 6 }}
              transition={{ delay: 5.2 + i * 0.3, duration: 0.5, ease: "easeOut" }}
            />
            <motion.text
              x={cust.x} y={cust.y - 10}
              textAnchor="middle" fontSize={7} fontWeight={600} fill={cust.color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 5.5 + i * 0.3, duration: 0.3 }}
            >
              {cust.label}
            </motion.text>
          </motion.g>
        ))}
      </svg>
    </CompPreviewBox>
  );
}

interface Composition {
  name: string;
  description: string;
  pieces: string[];
  preview: React.ComponentType;
}

const COMPOSITIONS: Composition[] = [
  {
    name: "Converge to Single Price",
    description: "Four satellite prices orbit, converge inward along connection lines, spinner processes, then reveals the final recommended price with a burst",
    pieces: ["Collapses", "Spinning Rings", "Pulses"],
    preview: ConvergeToPriceComp,
  },
  {
    name: "Chip Customization",
    description: "Factor pills cascade in with springs, then respond to actions: shake on crossoff, glow ring on highlight, dim on deemphasize",
    pieces: ["Cascades", "Shakes & Glows"],
    preview: ChipCustomizeComp,
  },
  {
    name: "Data Flow to Model",
    description: "Four data source cards send particles along Bezier curves into the central model circle, which pulses as it absorbs",
    pieces: ["Flows", "Pulses"],
    preview: FlowToCenterComp,
  },
  {
    name: "Scan & Optimize",
    description: "A sweep line scans across scattered dots, snapping each to its optimized position with color change and ring burst, then a KPI card slides in",
    pieces: ["Sweeps", "Snaps", "Cascades"],
    preview: ScanOptimizeComp,
  },
  {
    name: "Scatter to Demand Curve",
    description: "Dots drift in chaos, a demand curve draws, dots snap to alignment, then customer spotlights lift into position with drop lines",
    pieces: ["Drifts", "Draws", "Snaps"],
    preview: ScatterToCurveComp,
  },
];

// ── Category definitions ──

interface Category {
  name: string;
  description: string;
  usedIn: string[];
  preview: React.ComponentType;
}

const CATEGORIES: Category[] = [
  {
    name: "Sweeps",
    description: "A line scans across the chart, activating elements as it passes",
    usedIn: ["Power — scanning for patterns", "Profit Growth — model scan waves", "Profit Growth — green sweep line", "⊘ Model Indicator — vertical sweep glow"],
    preview: SweepPreview,
  },
  {
    name: "Snaps",
    description: "Elements jump from scattered positions to aligned target positions",
    usedIn: ["Refine — chaos to curve alignment", "Profit Growth — dots snap to optimized", "Power — scatter to clusters", "⊘ Power — cluster convergence through intermediate positions"],
    preview: SnapPreview,
  },
  {
    name: "Morphs",
    description: "Shapes smoothly transform between different forms",
    usedIn: ["Refine — curve collapse (3 → 1)", "Refine — market index shift", "Market Evolution — demand curve reshaping", "Model Transition — circle to sidebar strips"],
    preview: MorphPreview,
  },
  {
    name: "Draws",
    description: "Paths and lines draw progressively using pathLength animation",
    usedIn: ["Overview — connecting arrows between circles", "Refine — demand curve drawing", "Static vs Dynamic — curve + revenue area", "Intelligent Resolution — connector arrows"],
    preview: DrawPreview,
  },
  {
    name: "Cascades",
    description: "Elements appear sequentially with staggered delays",
    usedIn: ["Power — 24 factor pills in quadrants", "Closing — circle pop sequence", "Execute — slider bar fills", "Overview — numbered circle reveal", "Profit Growth — KPI sidebar"],
    preview: CascadePreview,
  },
  {
    name: "Pulses",
    description: "Concentric rings expand and fade for glowing, breathing effects",
    usedIn: ["One Model — glow rings around split halves", "Execute — absorption ring on model", "Dynamic Overview — active card glow", "Module Intro — active spoke pulse", "⊘ Execute — breathing ring around convergence circle", "⊘ Refine — radial-gradient segment zone ellipses with cycling highlight"],
    preview: PulsePreview,
  },
  {
    name: "Flows",
    description: "Particles travel along Bezier curves between elements",
    usedIn: ["One Model — dots from inputs to model circle", "Execute — labeled flow along curves", "Dynamic Overview — arrow flow dots", "Module Intro — spoke to center dot"],
    preview: FlowPreview,
  },
  {
    name: "Collapses",
    description: "Multiple elements converge to a single center point",
    usedIn: ["Overview — five circles merge to center card", "Power — 48 dots dissolve into model", "Power — satellite price absorption", "⊘ Execute — four drivers fly along curves into center"],
    preview: CollapsePreview,
  },
  {
    name: "Splits",
    description: "A unified element divides into separate parts",
    usedIn: ["One Model — circle splits into ML + Strategic halves", "Model Transition — halves morph to sidebar strips"],
    preview: SplitPreview,
  },
  {
    name: "Fills",
    description: "Bars fill from zero to a target width with sliding knobs",
    usedIn: ["Execute — customer attribute slider bars", "Dynamic Overview — processing bars breathing"],
    preview: FillPreview,
  },
  {
    name: "Spins",
    description: "Rotating elements and cycling text carousels",
    usedIn: ["Power — loading spinner → final price", "Intro — rotating word carousel", "Resolution Algorithm — confidence wheel"],
    preview: SpinPreview,
  },
  {
    name: "Shakes & Glows",
    description: "Quick shake on rejection, glow on highlight, dim on deemphasize",
    usedIn: ["Power — crossoff pill shake", "Power — highlight pill glow ring", "Power — deemphasize dim + shrink"],
    preview: ShakePreview,
  },
  {
    name: "Blur Reveals",
    description: "Text appears by transitioning from blurred to sharp",
    usedIn: ["Profit Growth — announcement overlay words"],
    preview: BlurPreview,
  },
  {
    name: "Drifts",
    description: "Ambient slow movement of scattered elements",
    usedIn: ["Power — 420-dot boomerang scatter plot", "Refine — 180-dot scatter with drift", "Intro — grid backdrop dots"],
    preview: DriftPreview,
  },
  {
    name: "Ghosts",
    description: "Dashed outlines show previous state or alternative curves",
    usedIn: ["Refine — customer-specific ghost curves", "Refine — previous curve after market shift", "Market Evolution — ghost of prior state"],
    preview: GhostPreview,
  },
  {
    name: "Fly-Aways",
    description: "Elements scatter outward in different directions with scale reduction",
    usedIn: ["⊘ Power — spotlight cards fly off while pills morph into factors", "⊘ Power — pill-to-factor morph across component boundaries"],
    preview: FlyAwayPreview,
  },
  {
    name: "Shape Morphs",
    description: "Geometric properties (rx, width, height) animate to transform one shape into another",
    usedIn: ["⊘ Execute — circle badge morphs into rounded-rect pricing box", "Model Transition — circle halves morph to sidebar strips"],
    preview: ShapeMorphPreview,
  },
  {
    name: "Spinning Rings",
    description: "Dashed-stroke rings rotate continuously to show processing or loading",
    usedIn: ["⊘ Execute — dashed ring spins while model learns", "Power — loading spinner before final price", "Resolution Algorithm — confidence wheel"],
    preview: SpinRingPreview,
  },
  {
    name: "Word Builds",
    description: "Title text splits into words, each fading in with blur and upward motion",
    usedIn: ["⊘ Power — word-by-word title with blur(4px) → blur(0px)", "⊘ Refine — three-title animated sequence"],
    preview: WordBuildPreview,
  },
  {
    name: "Skeletons",
    description: "Dashed wireframe outlines preview the upcoming visual during text-only intros, then fade as real content appears",
    usedIn: ["Overview — 5-circle timeline outline", "Power — scatter plot axes + ghost dots", "Refine — demand curve wireframe", "Profit Growth — chart preview"],
    preview: SkeletonPreview,
  },
];

// ── Main Component ──

export function AnimationGlossary({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"pieces" | "compositions">("pieces");

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#f5f6f8]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#E56910] to-[#EF8B1D]">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Animation Glossary</h2>
            <p className="text-[11px] text-gray-400">
              {tab === "pieces"
                ? `${CATEGORIES.length} animation types`
                : `${COMPOSITIONS.length} full sequences`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => setTab("pieces")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
                tab === "pieces"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Pieces
            </button>
            <button
              onClick={() => setTab("compositions")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors",
                tab === "compositions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              Compositions
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <X className="size-3.5" />
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === "pieces" ? (
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Preview = cat.preview;
              return (
                <div
                  key={cat.name}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-gray-300 hover:shadow-md"
                >
                  <Preview />
                  <div className="px-4 pb-3.5 pt-3">
                    <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{cat.description}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {cat.usedIn.map((u) => (
                        <span
                          key={u}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            u.startsWith("⊘")
                              ? "bg-amber-50 text-amber-600/70"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">
            {COMPOSITIONS.map((comp) => {
              const Preview = comp.preview;
              return (
                <div
                  key={comp.name}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-gray-300 hover:shadow-md"
                >
                  <Preview />
                  <div className="px-5 pb-4 pt-3">
                    <h3 className="text-sm font-bold text-gray-900">{comp.name}</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{comp.description}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {comp.pieces.map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-[#00446A]/8 px-2 py-0.5 text-[10px] font-medium text-[#00446A]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
