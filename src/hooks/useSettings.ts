import { useState, useEffect, useCallback } from "react";
import type { Settings } from "../types";
import { useDataStore } from "./useDataStore";

export function useSettings() {
  const store = useDataStore();
  const [settings, setSettings] = useState<Settings>({
    dailyCalorieTarget: 2000,
  });
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

  return { settings, loading, updateSettings };
}
