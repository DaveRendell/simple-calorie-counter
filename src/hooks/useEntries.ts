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

  const addEntry = async (entry: Omit<FoodEntry, "id">) => {
    const newEntry = await store.entries.add(entry);
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = async (entry: FoodEntry) => {
    const updated = await store.entries.update(entry);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    return updated;
  };

  const deleteEntry = async (id: string) => {
    await store.entries.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

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
    addEntry,
    updateEntry,
    deleteEntry,
    reorderEntries,
    refresh,
  };
}
