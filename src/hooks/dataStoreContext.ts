import { createContext } from "react";
import type { DataStore } from "../store/DataStore";

export const DataStoreContext = createContext<DataStore | null>(null);
