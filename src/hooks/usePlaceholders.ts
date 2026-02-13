import { useState, useEffect } from "react";
import type { Placeholder } from "../types";
import { useDataStore } from "./useDataStore";

export function usePlaceholders() {
  const store = useDataStore();
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.placeholders.getAll().then((result) => {
      setPlaceholders(result);
      setLoading(false);
    });
  }, [store]);

  const reorderPlaceholders = async (orderedIds: string[]) => {
    await store.placeholders.reorder(orderedIds);
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
    reorderPlaceholders,
  };
}
