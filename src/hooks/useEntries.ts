import { useState, useEffect, useCallback } from "react";
import type { FoodEntry } from "../types";
import { useDataStore } from "./useDataStore";

export function useEntries(date: string) {
  const store = useDataStore();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.entries.getByDate(date).then((result) => {
      setEntries(result);
      setLoading(false);
    });
  }, [store, date]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await store.entries.getByDate(date);
    setEntries(result);
    setLoading(false);
  }, [store, date]);

  const reorderEntries = async (orderedIds: string[]) => {
    await store.entries.reorder(orderedIds);
    setEntries((prev) => {
      const entryMap = new Map(prev.map((e) => [e.id, e]));
      return orderedIds
        .map((id) => entryMap.get(id))
        .filter((e): e is FoodEntry => e !== undefined);
    });
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  return {
    entries,
    loading,
    totalCalories,
    reorderEntries,
    refresh,
  };
}
