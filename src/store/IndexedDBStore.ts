import { openDB, type IDBPDatabase } from "idb";
import type { FoodEntry, Settings } from "../types";
import type { DataStore } from "./DataStore";

const DB_NAME = "calorie-counter";
const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const SETTINGS_STORE = "settings";
const SETTINGS_KEY = "user-settings";

const DEFAULT_SETTINGS: Settings = {
  dailyCalorieTarget: 2000,
};

function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const entryStore = db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
      entryStore.createIndex("date", "date", { unique: false });
      db.createObjectStore(SETTINGS_STORE);
    },
  });
}

export class IndexedDBStore implements DataStore {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = initDB();
  }

  async getEntriesByDate(date: string): Promise<FoodEntry[]> {
    const db = await this.dbPromise;
    const entries = await db.getAllFromIndex(ENTRIES_STORE, "date", date);
    return entries.sort(
      (a, b) => (a.sortOrder ?? a.createdAt) - (b.sortOrder ?? b.createdAt),
    );
  }

  async getEntryById(id: string): Promise<FoodEntry | undefined> {
    const db = await this.dbPromise;
    return db.get(ENTRIES_STORE, id);
  }

  async addEntry(entry: Omit<FoodEntry, "id">): Promise<FoodEntry> {
    const db = await this.dbPromise;
    const id = crypto.randomUUID();
    const fullEntry: FoodEntry = {
      ...entry,
      id,
      sortOrder: entry.sortOrder ?? entry.createdAt,
    };
    await db.add(ENTRIES_STORE, fullEntry);
    return fullEntry;
  }

  async updateEntry(entry: FoodEntry): Promise<FoodEntry> {
    const db = await this.dbPromise;
    await db.put(ENTRIES_STORE, entry);
    return entry;
  }

  async deleteEntry(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(ENTRIES_STORE, id);
  }

  async reorderEntries(date: string, orderedIds: string[]): Promise<void> {
    const db = await this.dbPromise;
    const entries = await db.getAllFromIndex(ENTRIES_STORE, "date", date);
    const entryMap = new Map(entries.map((e) => [e.id, e]));
    const tx = db.transaction(ENTRIES_STORE, "readwrite");
    for (let i = 0; i < orderedIds.length; i++) {
      const entry = entryMap.get(orderedIds[i]);
      if (entry) {
        entry.sortOrder = i;
        tx.store.put(entry);
      }
    }
    await tx.done;
  }

  async getRecentEntries(): Promise<FoodEntry[]> {
    const db = await this.dbPromise;
    const all = await db.getAll(ENTRIES_STORE);
    const withDesc = all.filter((e) => e.description && e.description.trim());
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

  async getSettings(): Promise<Settings> {
    const db = await this.dbPromise;
    const settings = await db.get(SETTINGS_STORE, SETTINGS_KEY);
    return settings ?? { ...DEFAULT_SETTINGS };
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const db = await this.dbPromise;
    const current = await this.getSettings();
    await db.put(SETTINGS_STORE, { ...current, ...settings }, SETTINGS_KEY);
  }
}
