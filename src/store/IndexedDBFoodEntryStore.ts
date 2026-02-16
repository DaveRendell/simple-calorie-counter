import type { IDBPDatabase } from "idb";
import type { FoodEntry } from "../types";
import type { FoodEntryStore } from "./FoodEntryStore";
import { IndexedDBTable } from "./IndexedDBTable";

const entrySortFn = (a: FoodEntry, b: FoodEntry) =>
  (a.sortOrder ?? a.createdAt) - (b.sortOrder ?? b.createdAt);

export class IndexedDBFoodEntryStore
  extends IndexedDBTable<FoodEntry>
  implements FoodEntryStore
{
  constructor(dbPromise: Promise<IDBPDatabase>, storeName: string) {
    super(dbPromise, storeName, entrySortFn);
  }

  async getByDate(date: string): Promise<FoodEntry[]> {
    return this.getAllFromIndex("date", date);
  }

  async getRecent(): Promise<FoodEntry[]> {
    const all = await this.getAll();
    const withDesc = all.filter(
      (e) => e.description && e.description.trim() && !e.isFromPlaceholder,
    );
    const deduped = new Map<string, FoodEntry>();
    for (const entry of withDesc) {
      const key = `${entry.description.toLowerCase()}\0${entry.calories}`;
      const existing = deduped.get(key);
      if (!existing || entry.createdAt > existing.createdAt) {
        deduped.set(key, entry);
      }
    }
    return [...deduped.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100);
  }

  async getFirstOnOrAfterDate(date: string): Promise<FoodEntry | undefined> {
    const all = await this.getAll();
    return all
      .filter((e) => e.date >= date && e.calorieGoal !== undefined)
      .sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt,
      )
      .at(0);
  }
}
