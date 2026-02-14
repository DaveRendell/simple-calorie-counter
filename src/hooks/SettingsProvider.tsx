import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { Settings } from "../types";
import { useDataStore } from "./useDataStore";
import { SettingsContext } from "./settingsContext";

const DEFAULT_SETTINGS: Settings = {
  dailyCalorieTarget: 2000,
  theme: "system",
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const store = useDataStore();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [store]);

  const updateSettings = useCallback(
    async (updates: Partial<Settings>) => {
      await store.updateSettings(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [store],
  );

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
