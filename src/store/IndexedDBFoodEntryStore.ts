import type { IDBPDatabase } from "idb";
import type { FoodEntry } from "../types";
import type { FoodEntryStore } from "./DataStore";
import { IndexedDBTable } from "./IndexedDBTable";

const ENTRIES_STORE = "entries";

const entrySortFn = (a: FoodEntry, b: FoodEntry) =>
  (a.sortOrder ?? a.createdAt) - (b.sortOrder ?? b.createdAt);

export class IndexedDBFoodEntryStore
  extends IndexedDBTable<FoodEntry>
  implements FoodEntryStore
{
  constructor(dbPromise: Promise<IDBPDatabase>) {
    super(dbPromise, ENTRIES_STORE, entrySortFn);
  }

  override async add(item: Omit<FoodEntry, "id">): Promise<FoodEntry> {
    return super.add({
      ...item,
      sortOrder: item.sortOrder ?? item.createdAt,
    });
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
}
