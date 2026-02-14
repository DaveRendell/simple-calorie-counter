import { useState, useEffect } from "react";
import type { Placeholder } from "../types";
import { useDataStore } from "./useDataStore";

export function usePlaceholders() {
  const store = useDataStore();
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.placeholders.getAll().then((result) => {
      const sorted = result.sort((a, b) =>
        a.timeOfDay.localeCompare(b.timeOfDay),
      );
      setPlaceholders(sorted);
      setLoading(false);
    });
  }, [store]);

  return {
    placeholders,
    loading,
  };
}
