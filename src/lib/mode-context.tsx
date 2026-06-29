"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type PresentationMode = "self" | "presenter";

interface ModeContextValue {
  mode: PresentationMode;
  toggleMode: () => void;
  setMode: (m: PresentationMode) => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PresentationMode>("presenter");

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("mode");
    if (param === "presenter" || param === "self") {
      setModeState(param);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (mode === "self") {
      url.searchParams.delete("mode");
    } else {
      url.searchParams.set("mode", mode);
    }
    window.history.replaceState({}, "", url.toString());
  }, [mode]);

  const setMode = useCallback((m: PresentationMode) => setModeState(m), []);
  const toggleMode = useCallback(
    () => setModeState((prev) => (prev === "self" ? "presenter" : "self")),
    [],
  );

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
