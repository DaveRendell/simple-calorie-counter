import { openDB, type IDBPDatabase } from "idb";
import type { FoodEntry, Placeholder, Settings } from "../types";
import type { DataStore } from "./DataStore";

const DB_NAME = "calorie-counter";
const DB_VERSION = 2;
const ENTRIES_STORE = "entries";
const SETTINGS_STORE = "settings";
const PLACEHOLDERS_STORE = "placeholders";
const SETTINGS_KEY = "user-settings";

const DEFAULT_SETTINGS: Settings = {
  dailyCalorieTarget: 2000,
};

function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const entryStore = db.createObjectStore(ENTRIES_STORE, {
          keyPath: "id",
        });
        entryStore.createIndex("date", "date", { unique: false });
        db.createObjectStore(SETTINGS_STORE);
      }
      if (oldVersion < 2) {
        db.createObjectStore(PLACEHOLDERS_STORE, { keyPath: "id" });
      }
    },
    blocked() {
      // Old connections are preventing the upgrade — reload to clear them.
      // This can happen when another tab or a stale HMR connection holds the
      // v1 database open and won't close it. A reload drops all connections.
      window.location.reload();
    },
    blocking(_currentVersion, _blockedVersion, event) {
      // This connection is blocking a newer version from opening.
      // Close it so the upgrade can proceed.
      (event.target as IDBDatabase).close();
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

  async getPlaceholders(): Promise<Placeholder[]> {
    const db = await this.dbPromise;
    const all = await db.getAll(PLACEHOLDERS_STORE);
    return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  async getPlaceholderById(id: string): Promise<Placeholder | undefined> {
    const db = await this.dbPromise;
    return db.get(PLACEHOLDERS_STORE, id);
  }

  async addPlaceholder(
    placeholder: Omit<Placeholder, "id">,
  ): Promise<Placeholder> {
    const db = await this.dbPromise;
    const id = crypto.randomUUID();
    const all = await db.getAll(PLACEHOLDERS_STORE);
    const full: Placeholder = {
      ...placeholder,
      id,
      sortOrder: placeholder.sortOrder ?? all.length,
    };
    await db.add(PLACEHOLDERS_STORE, full);
    return full;
  }

  async updatePlaceholder(placeholder: Placeholder): Promise<Placeholder> {
    const db = await this.dbPromise;
    await db.put(PLACEHOLDERS_STORE, placeholder);
    return placeholder;
  }

  async deletePlaceholder(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(PLACEHOLDERS_STORE, id);
  }

  async reorderPlaceholders(orderedIds: string[]): Promise<void> {
    const db = await this.dbPromise;
    const all = await db.getAll(PLACEHOLDERS_STORE);
    const map = new Map(all.map((p) => [p.id, p]));
    const tx = db.transaction(PLACEHOLDERS_STORE, "readwrite");
    for (let i = 0; i < orderedIds.length; i++) {
      const placeholder = map.get(orderedIds[i]);
      if (placeholder) {
        placeholder.sortOrder = i;
        tx.store.put(placeholder);
      }
    }
    await tx.done;
  }
}
