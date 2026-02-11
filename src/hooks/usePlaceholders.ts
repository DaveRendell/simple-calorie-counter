import { useState, useEffect, useCallback } from "react";
import type { Placeholder } from "../types";
import { useDataStore } from "./useDataStore";

export function usePlaceholders() {
  const store = useDataStore();
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await store.getPlaceholders();
    setPlaceholders(result);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlaceholder = async (placeholder: Omit<Placeholder, "id">) => {
    const newPlaceholder = await store.addPlaceholder(placeholder);
    setPlaceholders((prev) => [...prev, newPlaceholder]);
    return newPlaceholder;
  };

  const updatePlaceholder = async (placeholder: Placeholder) => {
    const updated = await store.updatePlaceholder(placeholder);
    setPlaceholders((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
    return updated;
  };

  const deletePlaceholder = async (id: string) => {
    await store.deletePlaceholder(id);
    setPlaceholders((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderPlaceholders = async (orderedIds: string[]) => {
    await store.reorderPlaceholders(orderedIds);
    setPlaceholders((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      return orderedIds
        .map((id) => map.get(id))
        .filter((p): p is Placeholder => p !== undefined);
    });
  };

  return {
    placeholders,
    loading,
    addPlaceholder,
    updatePlaceholder,
    deletePlaceholder,
    reorderPlaceholders,
    refresh,
  };
}
