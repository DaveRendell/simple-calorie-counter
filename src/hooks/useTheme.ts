import { useEffect, useRef } from "react";
import { useSettings } from "./useSettings";

function resolveTheme(mode: string): "light" | "dark" {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const el = document.documentElement;
  if (resolved === "dark") {
    el.setAttribute("data-theme", "dark");
  } else {
    el.removeAttribute("data-theme");
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#121212" : "#4a9eed");
  }
}

export function useTheme() {
  const { settings, loading } = useSettings();
  const prevResolved = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const resolved = resolveTheme(settings.theme);

    if (prevResolved.current !== null && prevResolved.current !== resolved) {
      document.documentElement.classList.add("theme-transitioning");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 350);
    }
    prevResolved.current = resolved;

    applyTheme(resolved);
    localStorage.setItem("theme", settings.theme);
  }, [settings.theme, loading]);

  useEffect(() => {
    if (loading || settings.theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(resolveTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.theme, loading]);
}
