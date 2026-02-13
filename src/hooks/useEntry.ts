import { useState, useEffect } from "react";
import type { FoodEntry } from "../types";
import { useDataStore } from "./useDataStore";

export function useEntry(id: string | undefined) {
  const store = useDataStore();
  const [entry, setEntry] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    store.entries.getById(id).then((found) => {
      setEntry(found ?? null);
      setLoading(false);
    });
  }, [id, store]);

  const updateEntry = async (updated: FoodEntry) => {
    const result = await store.entries.update(updated);
    setEntry(result);
    return result;
  };

  const deleteEntry = async () => {
    if (!entry) return;
    await store.entries.delete(entry.id);
  };

  return { entry, loading, updateEntry, deleteEntry };
}
