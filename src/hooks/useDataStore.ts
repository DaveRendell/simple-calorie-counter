import { useContext } from "react";
import type { DataStore } from "../store/DataStore";
import { DataStoreContext } from "./dataStoreContext";

export function useDataStore(): DataStore {
  const store = useContext(DataStoreContext);
  if (!store) {
    throw new Error("useDataStore must be used within a DataStoreProvider");
  }
  return store;
}
