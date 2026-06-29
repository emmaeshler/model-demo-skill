"use client";

import { useEffect } from "react";

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const MAX_ZOOM = 2;

export function ViewportAutoZoom() {
  useEffect(() => {
    function update() {
      if (document.documentElement.dataset.viewportOverride) return;

      const root = document.documentElement;
      root.style.zoom = "";
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const zoomW = vw / BASE_WIDTH;
      const zoomH = vh / BASE_HEIGHT;
      const zoom = Math.max(1, Math.min(zoomW, zoomH, MAX_ZOOM));
      root.style.zoom = `${zoom}`;
      root.style.setProperty("--slide-h", `${vh / zoom}px`);
    }
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (!document.documentElement.dataset.viewportOverride) {
        document.documentElement.style.zoom = "";
        document.documentElement.style.removeProperty("--slide-h");
      }
    };
  }, []);

  return null;
}
