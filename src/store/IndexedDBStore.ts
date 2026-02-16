import { openDB, type IDBPDatabase } from "idb";
import type { FoodEntry, Placeholder, Settings } from "../types";
import type { DataStore } from "./DataStore";
import { IndexedDBTable } from "./IndexedDBTable";
import { IndexedDBFoodEntryStore } from "./IndexedDBFoodEntryStore";
import { toDateStr } from "../dateFormat";

const DB_NAME = "calorie-counter";
const DB_VERSION = 3;
const ENTRIES_STORE = "entries";
const SETTINGS_STORE = "settings";
const PLACEHOLDERS_STORE = "placeholders";
const SETTINGS_KEY = "user-settings";

const DEFAULT_SETTINGS: Settings = {
  dailyCalorieTarget: 2000,
  theme: "system",
};

function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, transaction) {
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
      if (oldVersion < 3) {
        const settingsStore = transaction.objectStore(SETTINGS_STORE);
        const settings = await settingsStore.get(SETTINGS_KEY);
        const goal =
          settings?.dailyCalorieTarget ?? DEFAULT_SETTINGS.dailyCalorieTarget;
        const entriesStore = transaction.objectStore(ENTRIES_STORE);
        let cursor = await entriesStore.openCursor();
        while (cursor) {
          const entry = cursor.value as FoodEntry;
          await cursor.update({ ...entry, calorieGoal: goal });
          cursor = await cursor.continue();
        }
      }
    },
    blocked() {
      window.location.reload();
    },
    blocking(_currentVersion, _blockedVersion, event) {
      (event.target as IDBDatabase).close();
    },
  });
}

export class IndexedDBStore implements DataStore {
  readonly entries: IndexedDBFoodEntryStore;
  readonly placeholders: IndexedDBTable<Placeholder>;
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = initDB();
    this.entries = new IndexedDBFoodEntryStore(this.dbPromise, ENTRIES_STORE);
    this.placeholders = new IndexedDBTable<Placeholder>(
      this.dbPromise,
      PLACEHOLDERS_STORE,
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
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

    if (settings.dailyCalorieTarget !== undefined) {
      const today = toDateStr(new Date());
      const allEntries = await db.getAll(ENTRIES_STORE);
      const tx = db.transaction(ENTRIES_STORE, "readwrite");
      for (const entry of allEntries) {
        if (entry.date >= today) {
          await tx.store.put({
            ...entry,
            calorieGoal: settings.dailyCalorieTarget,
          });
        }
      }
      await tx.done;
    }
  }
}
