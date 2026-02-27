"use client";

import * as React from "react";

const SIDEBAR_WIDTH_KEY = "taskboard_sidebar_width";
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 256;

type SidebarResizeContextValue = {
  width: number;
  setWidth: (value: number | ((prev: number) => number)) => void;
  minWidth: number;
  maxWidth: number;
};

const SidebarResizeContext = React.createContext<SidebarResizeContextValue | null>(null);

export function getStoredSidebarWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_WIDTH;
}

export function SidebarResizeProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidthState] = React.useState(DEFAULT_WIDTH);

  React.useEffect(() => {
    setWidthState(getStoredSidebarWidth());
  }, []);

  const setWidth = React.useCallback((value: number | ((prev: number) => number)) => {
    setWidthState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next));
      try {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped));
      } catch {
        /* ignore */
      }
      return clamped;
    });
  }, []);

  const value = React.useMemo(
    () => ({ width, setWidth, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }),
    [width, setWidth]
  );

  return (
    <SidebarResizeContext.Provider value={value}>
      {children}
    </SidebarResizeContext.Provider>
  );
}

export function useSidebarResize() {
  const ctx = React.useContext(SidebarResizeContext);
  if (!ctx) return null;
  return ctx;
}
