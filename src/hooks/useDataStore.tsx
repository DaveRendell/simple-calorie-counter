import { createContext, useContext, type ReactNode } from "react";
import type { DataStore } from "../store/DataStore";

const DataStoreContext = createContext<DataStore | null>(null);

export function DataStoreProvider({
  store,
  children,
}: {
  store: DataStore;
  children: ReactNode;
}) {
  return (
    <DataStoreContext.Provider value={store}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore(): DataStore {
  const store = useContext(DataStoreContext);
  if (!store) {
    throw new Error("useDataStore must be used within a DataStoreProvider");
  }
  return store;
}
