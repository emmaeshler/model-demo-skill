"use client";

import { useState, useEffect, useCallback } from "react";
import { Monitor, X } from "lucide-react";

const BASE_WIDTH = 1280;
const MAX_ZOOM = 2;
const FRAME_PAD = 48;
const LABEL_H = 36;

const PRESETS = [
  { label: "Auto", width: 0, height: 0, desc: "Scales with viewport" },
  { label: "Desktop", width: 1920, height: 1080, desc: "1920 × 1080" },
  { label: "QHD 27″", width: 2560, height: 1440, desc: "2560 × 1440" },
  { label: "Ultrawide", width: 3440, height: 1440, desc: "3440 × 1440" },
] as const;

type Preset = (typeof PRESETS)[number];

function getFrame() {
  return document.getElementById("preview-frame");
}

function autoZoomFor(w: number) {
  return w > BASE_WIDTH ? Math.min(w / BASE_WIDTH, MAX_ZOOM) : 1;
}

function clearFrameStyles() {
  const frame = getFrame();
  if (!frame) return;
  frame.style.position = "";
  frame.style.left = "";
  frame.style.top = "";
  frame.style.width = "";
  frame.style.height = "";
  frame.style.transform = "";
  frame.style.transformOrigin = "";
  frame.style.overflow = "";
  frame.style.borderRadius = "";
  frame.style.boxShadow = "";
  frame.style.zIndex = "";
  frame.style.background = "";
}

function restoreAuto() {
  const root = document.documentElement;
  delete root.dataset.viewportOverride;
  root.style.overflow = "";
  clearFrameStyles();
  root.style.zoom = "";
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const zoom = autoZoomFor(vw);
  root.style.zoom = `${zoom}`;
  root.style.setProperty("--slide-h", `${vh / zoom}px`);
}

function applyPreset(preset: Preset) {
  const root = document.documentElement;
  const frame = getFrame();
  if (!frame || preset.width === 0) {
    restoreAuto();
    return;
  }

  root.dataset.viewportOverride = "true";
  root.style.zoom = "";
  root.style.overflow = "hidden";

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const az = autoZoomFor(preset.width);
  const designW = preset.width / az;
  const designH = preset.height / az;

  const availW = vw - FRAME_PAD * 2;
  const availH = vh - FRAME_PAD * 2 - LABEL_H;
  const scale = Math.min(availW / designW, availH / designH);
  const visW = designW * scale;
  const visH = designH * scale;
  const left = (vw - visW) / 2;
  const top = (vh - visH - LABEL_H) / 2;

  root.style.setProperty("--slide-h", `${designH}px`);

  frame.style.position = "fixed";
  frame.style.left = `${left}px`;
  frame.style.top = `${top}px`;
  frame.style.width = `${designW}px`;
  frame.style.height = `${designH}px`;
  frame.style.transform = `scale(${scale})`;
  frame.style.transformOrigin = "top left";
  frame.style.overflow = "hidden";
  frame.style.borderRadius = "8px";
  frame.style.boxShadow = "0 8px 60px rgba(0,0,0,0.5)";
  frame.style.zIndex = "91";
  frame.style.background = "#F5F8FA";
}

export function DevViewportPreview() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(0);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      const prev = document.documentElement.style.zoom;
      document.documentElement.style.zoom = "";
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      document.documentElement.style.zoom = prev;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const apply = useCallback((preset: Preset) => {
    setTarget(preset.width);
    applyPreset(preset);
  }, []);

  useEffect(() => {
    if (viewport.w === 0) return;
    const preset = PRESETS.find((p) => p.width === target);
    if (!preset) return;
    applyPreset(preset);
  }, [viewport, target]);

  useEffect(() => {
    return () => {
      restoreAuto();
    };
  }, []);

  const activePreset = PRESETS.find((p) => p.width === target) ?? PRESETS[0];
  const isPreview = target !== 0 && activePreset.width !== 0;

  const scalePercent = (() => {
    if (!isPreview || viewport.w === 0) return 100;
    const az = autoZoomFor(activePreset.width);
    const dW = activePreset.width / az;
    const dH = activePreset.height / az;
    const aW = viewport.w - FRAME_PAD * 2;
    const aH = viewport.h - FRAME_PAD * 2 - LABEL_H;
    return Math.round(Math.min(aW / dW, aH / dH) * 100);
  })();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-14 right-3 z-[100] flex size-8 items-center justify-center rounded-full border border-white/20 bg-[#06283D]/90 text-white/60 shadow-lg backdrop-blur transition-colors hover:bg-[#06283D] hover:text-white"
        title="Screen preview"
      >
        <Monitor className="size-3.5" />
      </button>
    );
  }

  return (
    <>
      {isPreview && (
        <div className="fixed inset-0 z-[90] bg-black/70" />
      )}

      <div className="fixed bottom-14 right-3 z-[100] w-52 rounded-lg border border-white/15 bg-[#06283D]/95 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">
            Preview
          </span>
          <button
            onClick={() => {
              apply(PRESETS[0]);
              setOpen(false);
            }}
            className="text-white/40 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="p-1.5">
          {PRESETS.map((preset) => {
            const isActive = preset.width === target;
            return (
              <button
                key={preset.width}
                onClick={() => apply(preset)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white/90"
                }`}
              >
                <span className="text-xs font-medium">{preset.label}</span>
                <span className="text-[10px] text-white/40">{preset.desc}</span>
              </button>
            );
          })}
        </div>
        {isPreview && (
          <div className="border-t border-white/10 px-3 py-1.5 text-center text-[10px] text-white/40">
            {activePreset.label} · {scalePercent}% fit
          </div>
        )}
      </div>
    </>
  );
}
