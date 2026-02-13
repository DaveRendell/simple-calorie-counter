import type { ReactNode } from "react";
import type { DataStore } from "../store/DataStore";
import { DataStoreContext } from "./dataStoreContext";

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
