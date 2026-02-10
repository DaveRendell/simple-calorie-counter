import type { FoodEntry, Settings } from "../types";

export interface DataStore {
  getEntriesByDate(date: string): Promise<FoodEntry[]>;
  getEntryById(id: string): Promise<FoodEntry | undefined>;
  addEntry(entry: Omit<FoodEntry, "id">): Promise<FoodEntry>;
  updateEntry(entry: FoodEntry): Promise<FoodEntry>;
  deleteEntry(id: string): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
