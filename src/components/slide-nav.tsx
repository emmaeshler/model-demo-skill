"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Download, MonitorPlay, RotateCcw, Maximize, Minimize, PlayCircle, BookOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export interface NavGroup {
  label: string;
  slides: { index: number; label: string; subStep?: number }[];
}

interface SlideNavProps {
  current: number;
  currentSubStep?: number;
  total: number;
  groups: NavGroup[];
  onNavigate: (index: number, subStep?: number) => void;
  presentationTitle?: string;
  animationDone?: boolean;
  onStartPresenting?: () => void;
  showReplay?: boolean;
  onReplay?: () => void;
  onSlideSorter?: () => void;
  onAnimationGlossary?: () => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

function FullPageButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <button
      onClick={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }}
      className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
    >
      {isFullscreen ? (
        <>
          <Minimize className="size-3.5" />
          Exit Full Page
        </>
      ) : (
        <>
          <Maximize className="size-3.5" />
          Full Page
        </>
      )}
    </button>
  );
}

function DownloadLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(!document.getElementById("__export_root")));
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <a
      href="/Inside Your Dynamic Model - INSIGHT2PROFIT.html"
      download="Inside Your Dynamic Model - INSIGHT2PROFIT.html"
      className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
    >
      <Download className="size-3.5" />
      Download
    </a>
  );
}

export function TopBar({
  onNavigate,
  presentationTitle = "Inside Your Dynamic Model",
  onStartPresenting,
  onAnimationGlossary,
}: SlideNavProps) {
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);
  const kebabBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!kebabOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (
        kebabRef.current &&
        !kebabRef.current.contains(e.target as Node) &&
        kebabBtnRef.current &&
        !kebabBtnRef.current.contains(e.target as Node)
      ) {
        setKebabOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setKebabOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [kebabOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#06283D]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-2.5">
          <button
            onClick={() => onNavigate(0)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-bold tracking-tight text-white/90 transition-colors hover:bg-white/10"
            aria-label="Go to first slide"
          >
            <svg viewBox="0 0 36 36" className="size-5 shrink-0" aria-hidden="true">
              <rect x="0" y="0" width="15" height="15" rx="2" fill="#EF8B1D" />
              <rect x="19" y="0" width="15" height="15" rx="2" fill="#E56910" />
              <rect x="0" y="19" width="15" height="15" rx="2" fill="#00446A" />
              <rect x="19" y="19" width="15" height="15" rx="2" fill="#E56910" />
            </svg>
            {presentationTitle}
          </button>

          <div className="ml-auto flex items-center gap-3">
            {onStartPresenting && (
              <button
                onClick={onStartPresenting}
                className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <MonitorPlay className="size-3.5" />
                Present
              </button>
            )}
            <DownloadLink />
            <FullPageButton />
            <div className="relative">
              <button
                ref={kebabBtnRef}
                onClick={() => setKebabOpen(!kebabOpen)}
                className="group relative flex items-center rounded-md border border-white/15 p-1.5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="wip/ design"
              >
                <MoreVertical className="size-3.5" />
                <span className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] font-medium text-white/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  wip/ design
                </span>
              </button>
              {kebabOpen && (
                <div
                  ref={kebabRef}
                  className="absolute right-0 top-full mt-1.5 min-w-[180px] rounded-lg border border-white/10 bg-[#06283D]/95 py-1 shadow-xl backdrop-blur-md"
                >
                  <a
                    href="/walkthrough"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setKebabOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <PlayCircle className="size-3.5" />
                    Walk Through
                  </a>
                  {onAnimationGlossary && (
                    <button
                      onClick={() => { onAnimationGlossary(); setKebabOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <BookOpen className="size-3.5" />
                      Animation Glossary
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
}

export function BottomBar({
  current,
  currentSubStep,
  total,
  groups,
  onNavigate,
  animationDone,
  showReplay,
  onReplay,
}: SlideNavProps) {
  const currentGroup =
    groups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === current &&
          (s.subStep === undefined || s.subStep === currentSubStep),
      ),
    ) ?? groups.find((g) => g.slides.some((s) => s.index === current));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#06283D]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(current - 1)}
            disabled={current === 0}
            className="text-white/60 hover:bg-white/10 hover:text-white/90"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>

          {showReplay && onReplay && (
            <button
              onClick={onReplay}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
              aria-label="Replay animations"
            >
              <RotateCcw className="size-3.5" />
              Replay
            </button>
          )}
        </div>

        {currentGroup && currentGroup.slides.length > 1 && (
          <div className="flex items-center gap-2">
            {currentGroup.slides.map((slide) => {
              const isActive =
                slide.index === current &&
                (slide.subStep === undefined ||
                  slide.subStep === currentSubStep);
              return (
                <button
                  key={`${slide.index}-${slide.subStep ?? ""}`}
                  onClick={() => onNavigate(slide.index, slide.subStep)}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    isActive
                      ? "scale-125 bg-white"
                      : "bg-white/30 hover:bg-white/50",
                  )}
                  aria-label={slide.label}
                />
              );
            })}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(current + 1)}
          disabled={current === total - 1}
          className={cn(
            "shrink-0 transition-all duration-700",
            animationDone
              ? "bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
              : "text-white/60 hover:bg-white/10 hover:text-white/90",
          )}
        >
          Next
          <ChevronRight className={cn("size-4", animationDone && "animate-pulse")} />
        </Button>
      </div>
    </nav>
  );
}

export function AudienceTopBar({
  groups,
  current,
  currentSubStep,
  presentationTitle = "Inside Your Dynamic Model",
}: Pick<SlideNavProps, "groups" | "current" | "currentSubStep" | "presentationTitle">) {
  const currentGroup =
    groups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === current &&
          (s.subStep === undefined || s.subStep === currentSubStep),
      ),
    ) ?? groups.find((g) => g.slides.some((s) => s.index === current));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#06283D]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-2.5">
        <div className="flex items-center gap-2 px-2 py-1 text-sm font-bold tracking-tight text-white/90">
          <svg viewBox="0 0 36 36" className="size-5 shrink-0" aria-hidden="true">
            <rect x="0" y="0" width="15" height="15" rx="2" fill="#EF8B1D" />
            <rect x="19" y="0" width="15" height="15" rx="2" fill="#E56910" />
            <rect x="0" y="19" width="15" height="15" rx="2" fill="#00446A" />
            <rect x="19" y="19" width="15" height="15" rx="2" fill="#E56910" />
          </svg>
          {presentationTitle}
        </div>

        <span className="px-3 py-1.5 text-sm font-medium text-white/70">
          {currentGroup?.label ?? ""}
        </span>
      </div>
    </header>
  );
}

// Keep backward-compat export for easy migration
export function SlideNav(props: SlideNavProps) {
  return (
    <>
      <TopBar {...props} />
      <BottomBar {...props} />
    </>
  );
}
