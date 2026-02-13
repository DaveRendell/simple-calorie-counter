import type { FoodEntry } from "../types";
import type { CrudStore } from "./CrudStore";

export interface FoodEntryStore extends CrudStore<FoodEntry> {
  getByDate(date: string): Promise<FoodEntry[]>;
  getRecent(): Promise<FoodEntry[]>;
}
