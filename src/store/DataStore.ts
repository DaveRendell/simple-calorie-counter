import type { Placeholder, Settings } from "../types";
import type { CrudStore } from "./CrudStore";
import type { FoodEntryStore } from "./FoodEntryStore";

export interface DataStore {
  entries: FoodEntryStore;
  placeholders: CrudStore<Placeholder>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
