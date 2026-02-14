import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../../src/hooks/useTheme";

// Mock useSettings
const mockSettings = { dailyCalorieTarget: 2000, theme: "system" as const };
vi.mock("../../src/hooks/useSettings", () => ({
  useSettings: () => ({ settings: mockSettings, loading: false }),
}));

describe("useTheme", () => {
  let matchMediaListeners: Array<(e: { matches: boolean }) => void>;
  let matchMediaMatches: boolean;

  beforeEach(() => {
    matchMediaListeners = [];
    matchMediaMatches = false;
    mockSettings.theme = "system";

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");

    const store: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
      writable: true,
    });

    // Add theme-color meta if not present
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      meta.setAttribute("content", "#4a9eed");
      document.head.appendChild(meta);
    }

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: matchMediaMatches,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        matchMediaListeners.push(cb);
      },
      removeEventListener: (
        _: string,
        cb: (e: { matches: boolean }) => void,
      ) => {
        matchMediaListeners = matchMediaListeners.filter((l) => l !== cb);
      },
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should apply dark theme when setting is dark", () => {
    mockSettings.theme = "dark";
    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should remove dark theme when setting is light", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    mockSettings.theme = "light";
    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("should follow system preference when set to system", () => {
    matchMediaMatches = true;
    mockSettings.theme = "system";
    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should use light when system prefers light", () => {
    matchMediaMatches = false;
    mockSettings.theme = "system";
    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("should update theme-color meta tag", () => {
    mockSettings.theme = "dark";
    renderHook(() => useTheme());

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#121212");
  });

  it("should respond to system preference changes when in system mode", () => {
    matchMediaMatches = false;
    mockSettings.theme = "system";
    renderHook(() => useTheme());

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();

    // Update the mock's return value before firing the listener
    matchMediaMatches = true;
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    act(() => {
      matchMediaListeners.forEach((cb) => cb({ matches: true }));
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should sync theme to localStorage", () => {
    mockSettings.theme = "dark";
    renderHook(() => useTheme());
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
