"use client";

import { useEffect, useRef } from "react";

type ThemePreference = "system" | "light" | "dark";
const preferenceKey = "aptora-theme";

function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeControl() {
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(preferenceKey); } catch { /* Continue with the system preference when storage is unavailable. */ }
    const initial: ThemePreference = stored === "dark" || stored === "light" ? stored : "system";
    if (selectRef.current) selectRef.current.value = initial;
    applyTheme(initial);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateForSystem = () => { if (initial === "system") applyTheme("system"); };
    media.addEventListener("change", updateForSystem);
    return () => media.removeEventListener("change", updateForSystem);
  }, []);

  function changeTheme(value: string) {
    const next: ThemePreference = value === "dark" || value === "light" ? value : "system";
    try { localStorage.setItem(preferenceKey, next); } catch { /* Theme still applies for the current page. */ }
    applyTheme(next);
  }

  return <label className="theme-control"><span className="sr-only">Color theme</span><select ref={selectRef} defaultValue="system" onChange={(event) => changeTheme(event.target.value)} aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
