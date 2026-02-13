import { useState, useEffect } from "react";
import type { Placeholder } from "../types";
import { useDataStore } from "./useDataStore";

export function usePlaceholder(id: string | undefined) {
  const store = useDataStore();
  const [placeholder, setPlaceholder] = useState<Placeholder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    store.placeholders.getById(id).then((found) => {
      setPlaceholder(found ?? null);
      setLoading(false);
    });
  }, [id, store]);

  const updatePlaceholder = async (updated: Placeholder) => {
    const result = await store.placeholders.update(updated);
    setPlaceholder(result);
    return result;
  };

  const deletePlaceholder = async () => {
    if (!placeholder) return;
    await store.placeholders.delete(placeholder.id);
  };

  return { placeholder, loading, updatePlaceholder, deletePlaceholder };
}
