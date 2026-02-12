import type { FoodEntry, Placeholder, Settings } from "../types";

export interface CrudStore<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  add(item: Omit<T, "id">): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: string): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
}

export interface FoodEntryStore extends CrudStore<FoodEntry> {
  getByDate(date: string): Promise<FoodEntry[]>;
  getRecent(): Promise<FoodEntry[]>;
}

export interface DataStore {
  entries: FoodEntryStore;
  placeholders: CrudStore<Placeholder>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
