import { useState, useEffect, useCallback } from "react";
import type { FoodEntry } from "../types";
import { useDataStore } from "./useDataStore";

async function resolveGoal(
  entries: FoodEntry[],
  date: string,
  getFirstOnOrAfterDate: (date: string) => Promise<FoodEntry | undefined>,
): Promise<number | null> {
  const dayGoal = entries.find((e) => e.calorieGoal !== undefined)?.calorieGoal;
  if (dayGoal !== undefined) return dayGoal;
  const futureEntry = await getFirstOnOrAfterDate(date);
  return futureEntry?.calorieGoal ?? null;
}

export function useEntries(date: string) {
  const store = useDataStore();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [effectiveGoal, setEffectiveGoal] = useState<number | null>(null);

  useEffect(() => {
    store.entries.getByDate(date).then(async (result) => {
      setEntries(result);
      setEffectiveGoal(
        await resolveGoal(
          result,
          date,
          store.entries.getFirstOnOrAfterDate.bind(store.entries),
        ),
      );
      setLoading(false);
    });
  }, [store, date]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await store.entries.getByDate(date);
    setEntries(result);
    setEffectiveGoal(
      await resolveGoal(
        result,
        date,
        store.entries.getFirstOnOrAfterDate.bind(store.entries),
      ),
    );
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
    effectiveGoal,
  };
}
