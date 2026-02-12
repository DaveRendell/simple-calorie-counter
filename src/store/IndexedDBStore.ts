import { openDB, type IDBPDatabase } from "idb";
import type { Placeholder, Settings } from "../types";
import type { DataStore } from "./DataStore";
import { IndexedDBTable } from "./IndexedDBTable";
import { IndexedDBFoodEntryStore } from "./IndexedDBFoodEntryStore";

const DB_NAME = "calorie-counter";
const DB_VERSION = 2;
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
        const entryStore = db.createObjectStore("entries", {
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
    this.entries = new IndexedDBFoodEntryStore(this.dbPromise);
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
  }
}
