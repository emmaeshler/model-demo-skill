"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, Download, MonitorPlay, RotateCcw, Maximize, Minimize, PlayCircle, BookOpen, MoreVertical, LayoutGrid, HelpCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export interface NavGroup {
  label: string;
  subtitle?: string;
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
  onHowItWorks?: () => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

function FullPageButton({ isFullscreen, compact }: { isFullscreen: boolean; compact?: boolean }) {
  return (
    <button
      onClick={() => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-white/15 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white",
        compact ? "p-1.5" : "px-2.5 py-1",
      )}
      title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
      data-wt="fullscreen"
    >
      {isFullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
      {!compact && (isFullscreen ? "Exit Full Screen" : "Enter Full Screen")}
    </button>
  );
}

function DownloadLink({ compact }: { compact?: boolean }) {
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
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-white/15 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white",
        compact ? "p-1.5" : "px-2.5 py-1",
      )}
      title="Download"
      data-wt="download"
    >
      <Download className="size-3.5" />
      {!compact && "Download"}
    </a>
  );
}

export function TopBar({
  groups,
  current,
  currentSubStep,
  onNavigate,
  presentationTitle = "Inside Your Dynamic Model",
  onStartPresenting,
  onAnimationGlossary,
  onSlideSorter,
  onHowItWorks,
}: SlideNavProps) {
  const { shareMode, toggleShareMode } = useShareMode();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [kebabOpen, setKebabOpen] = useState(false);
  const kebabRef = useRef<HTMLDivElement>(null);
  const kebabBtnRef = useRef<HTMLButtonElement>(null);

  const currentGroup =
    groups.find((g) =>
      g.slides.some(
        (s) =>
          s.index === current &&
          (s.subStep === undefined || s.subStep === currentSubStep),
      ),
    ) ?? groups.find((g) => g.slides.some((s) => s.index === current));

  const currentGroupIndex = groups.indexOf(currentGroup!);
  const activeGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setExpandedGroups(new Set());
      requestAnimationFrame(() => {
        activeGroupRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    }
  }, [open]);

  const handleNavigate = useCallback(
    (index: number, subStep?: number) => {
      onNavigate(index, subStep);
      setOpen(false);
    },
    [onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

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
        <div className="flex items-center px-4 py-2.5">
          <button
            onClick={() => onNavigate(0)}
            className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-sm font-bold tracking-tight text-white/90 transition-colors hover:bg-white/10"
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

          <button
            ref={triggerRef}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
            data-wt="nav-dropdown"
          >
            {currentGroup?.label ?? ""}
            <ChevronDown
              className={cn(
                "size-3.5 text-white/40 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              onClick={toggleShareMode}
              className="flex items-center gap-2 whitespace-nowrap rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10"
              data-wt="teams-toggle"
            >
              <span className={shareMode ? "text-teal-200" : ""}>{isFullscreen ? "Teams" : "I'm Sharing This On Teams"}</span>
              <div
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors duration-200",
                  shareMode ? "bg-teal-500" : "bg-white/20",
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
            {onStartPresenting && (
              <button
                onClick={onStartPresenting}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/15 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white",
                  isFullscreen ? "p-1.5" : "px-2.5 py-1",
                )}
                title="Open Presenter Mode"
                data-wt="presenter-mode"
              >
                <MonitorPlay className="size-3.5" />
                {!isFullscreen && "Open Presenter Mode"}
              </button>
            )}
            <FullPageButton isFullscreen={isFullscreen} compact={isFullscreen} />
            <DownloadLink compact={isFullscreen} />
            <div className="relative" data-wt="kebab">
              <button
                ref={kebabBtnRef}
                onClick={() => setKebabOpen(!kebabOpen)}
                className="group relative flex items-center rounded-md border border-white/15 p-1.5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                aria-label="More options"
              >
                <MoreVertical className="size-3.5" />
              </button>
              {kebabOpen && (
                <div
                  ref={kebabRef}
                  className="absolute right-0 top-full mt-1.5 min-w-[180px] rounded-lg border border-white/10 bg-[#06283D]/95 py-1 shadow-xl backdrop-blur-md"
                >
                  {onSlideSorter && (
                    <button
                      onClick={() => { onSlideSorter(); setKebabOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <LayoutGrid className="size-3.5" />
                      Slide Sorter
                    </button>
                  )}
                  <div className="group/wt relative">
                    <button
                      disabled
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/30 cursor-not-allowed"
                    >
                      <PlayCircle className="size-3.5" />
                      Self Walkthrough
                    </button>
                    <div className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#06283D] px-3 py-2 text-[11px] font-medium leading-relaxed text-white/60 opacity-0 shadow-xl transition-opacity group-hover/wt:opacity-100 w-52">
                      A self-paced version for clients to walk through on their own. Will also be available as a download. Currently under construction.
                    </div>
                  </div>
                  {onHowItWorks && (
                    <button
                      onClick={() => { onHowItWorks(); setKebabOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <HelpCircle className="size-3.5" />
                      How It Works
                    </button>
                  )}
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

      {open && (
        <div
          ref={panelRef}
          className="fixed top-[49px] left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-b-xl border border-t-0 border-white/10 bg-[#06283D]/95 shadow-lg backdrop-blur-md"
        >
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-3">
            {groups.map((group, gi) => {
              const groupDone = group.slides.every(
                (s) =>
                  s.index < current ||
                  (s.index === current &&
                    s.subStep !== undefined &&
                    currentSubStep !== undefined &&
                    s.subStep < currentSubStep),
              );
              const groupActive = gi === currentGroupIndex;

              const isExpanded = expandedGroups.size > 0 ? expandedGroups.has(gi) : groupActive;

              return (
                <div key={gi} ref={groupActive ? activeGroupRef : undefined} className="mb-1.5 last:mb-0">
                  <button
                    onClick={() => {
                      if (group.slides.length <= 1) {
                        handleNavigate(
                          group.slides[0].index,
                          group.slides[0].subStep ?? 0,
                        );
                      } else {
                        setExpandedGroups((prev) => {
                          if (prev.has(gi)) {
                            return new Set();
                          } else {
                            return new Set([gi]);
                          }
                        });
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors",
                      groupActive
                        ? "bg-white/15 text-white"
                        : groupDone
                          ? "text-white/50 hover:bg-white/10"
                          : "text-white/70 hover:bg-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                        groupActive
                          ? "bg-white text-[#06283D]"
                          : groupDone
                            ? "bg-white/20 text-white/60"
                            : "bg-white/10 text-white/40",
                      )}
                    >
                      {groupDone ? <Check className="size-3" /> : gi + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-bold">{group.label}</span>
                      {group.subtitle && (
                        <span className={cn(
                          "text-[11px] font-medium leading-tight",
                          groupActive ? "text-white/60" : groupDone ? "text-white/30" : "text-white/40",
                        )}>
                          {group.subtitle}
                        </span>
                      )}
                    </div>
                    {group.slides.length > 1 && (
                      <ChevronDown
                        className={cn(
                          "ml-auto size-3 shrink-0 text-white/30 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && group.slides.length > 1 && (
                      <motion.div
                        key={`sub-${gi}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="ml-7 overflow-hidden"
                      >
                        <div className="mt-0.5 space-y-0.5">
                          {group.slides.map((s, si) => {
                            const isSlideActive =
                              s.index === current &&
                              (s.subStep === undefined || s.subStep === currentSubStep);
                            return (
                              <button
                                key={si}
                                onClick={() => handleNavigate(s.index, s.subStep)}
                                className={cn(
                                  "w-full rounded px-2.5 py-1 text-left text-xs font-semibold transition-colors",
                                  isSlideActive
                                    ? "border-l-2 border-white/80 bg-white/10 pl-2 text-white"
                                    : "text-white/60 hover:bg-white/5 hover:text-white/80",
                                )}
                              >
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#06283D]/90 backdrop-blur-md" data-wt="bottom-nav">
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
