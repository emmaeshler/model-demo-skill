"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface ShareContextValue {
  shareMode: boolean;
  toggleShareMode: () => void;
  setShareMode: (on: boolean) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

const CHANNEL_NAME = "ml-explainer-share";

export function ShareProvider({ children }: { children: ReactNode }) {
  const [shareMode, setShareModeState] = useState(false);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("share");
    if (param === "true") {
      setShareModeState(true);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (shareMode) {
      url.searchParams.set("share", "true");
    } else {
      url.searchParams.delete("share");
    }
    window.history.replaceState({}, "", url.toString());
  }, [shareMode]);

  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e) => {
      if (typeof e.data?.shareMode === "boolean") {
        setShareModeState(e.data.shareMode);
      }
    };
    return () => bc.close();
  }, []);

  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ shareMode });
    bc.close();
  }, [shareMode]);

  const setShareMode = useCallback((on: boolean) => setShareModeState(on), []);
  const toggleShareMode = useCallback(
    () => setShareModeState((prev) => !prev),
    [],
  );

  return (
    <ShareContext.Provider value={{ shareMode, toggleShareMode, setShareMode }}>
      {children}
    </ShareContext.Provider>
  );
}

export function useShareMode() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error("useShareMode must be used within ShareProvider");
  return ctx;
}
