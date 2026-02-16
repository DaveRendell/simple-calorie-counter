import { describe, it, expect, beforeEach } from "vitest";
import { openDB } from "idb";
import { IndexedDBStore } from "../../src/store/IndexedDBStore";
import { toDateStr } from "../../src/dateFormat";
import "fake-indexeddb/auto";

describe("IndexedDBStore", () => {
  let store: IndexedDBStore;

  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    store = new IndexedDBStore();
  });

  describe("settings", () => {
    it("should return default settings initially", async () => {
      const settings = await store.getSettings();
      expect(settings.dailyCalorieTarget).toBe(2000);
    });

    it("should update settings", async () => {
      await store.updateSettings({ dailyCalorieTarget: 1500 });
      const settings = await store.getSettings();
      expect(settings.dailyCalorieTarget).toBe(1500);
    });

    it("should partially update settings", async () => {
      await store.updateSettings({ dailyCalorieTarget: 1800 });
      const settings = await store.getSettings();
      expect(settings.dailyCalorieTarget).toBe(1800);
    });

    it("should update calorieGoal on today and future entries when changing target", async () => {
      const today = toDateStr(new Date());
      const tomorrow = toDateStr(new Date(Date.now() + 86400000));
      const yesterday = toDateStr(new Date(Date.now() - 86400000));

      await store.entries.add({
        date: yesterday,
        calories: 500,
        description: "Past",
        createdAt: 1000,
        calorieGoal: 2000,
      });
      await store.entries.add({
        date: today,
        calories: 300,
        description: "Today",
        createdAt: 2000,
        calorieGoal: 2000,
      });
      await store.entries.add({
        date: tomorrow,
        calories: 400,
        description: "Future",
        createdAt: 3000,
        calorieGoal: 2000,
      });

      await store.updateSettings({ dailyCalorieTarget: 1500 });

      const allEntries = await store.entries.getAll();
      const pastEntry = allEntries.find((e) => e.date === yesterday)!;
      const todayEntry = allEntries.find((e) => e.date === today)!;
      const futureEntry = allEntries.find((e) => e.date === tomorrow)!;

      expect(pastEntry.calorieGoal).toBe(2000);
      expect(todayEntry.calorieGoal).toBe(1500);
      expect(futureEntry.calorieGoal).toBe(1500);
    });
  });

  describe("migration", () => {
    it("should backfill calorieGoal on existing entries during v2 to v3 migration", async () => {
      // Use a fresh IDBFactory so we can create a v2 DB first
      globalThis.indexedDB = new IDBFactory();

      // Create a v2 database with entries and settings but no calorieGoal
      const dbName = "calorie-counter";
      const db = await openDB(dbName, 2, {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            const entryStore = db.createObjectStore("entries", {
              keyPath: "id",
            });
            entryStore.createIndex("date", "date", { unique: false });
            db.createObjectStore("settings");
          }
          if (oldVersion < 2) {
            db.createObjectStore("placeholders", { keyPath: "id" });
          }
        },
      });

      // Add settings and entries to the v2 database
      await db.put(
        "settings",
        { dailyCalorieTarget: 1800, theme: "system" },
        "user-settings",
      );
      await db.add("entries", {
        id: "entry-1",
        date: "2024-01-15",
        calories: 500,
        description: "Lunch",
        createdAt: 1000,
        sortOrder: 0,
      });
      await db.add("entries", {
        id: "entry-2",
        date: "2024-01-16",
        calories: 300,
        description: "Snack",
        createdAt: 2000,
        sortOrder: 1,
      });
      db.close();

      // Now open with v3 (IndexedDBStore triggers migration)
      const migratedStore = new IndexedDBStore();
      const entries = await migratedStore.entries.getAll();

      expect(entries).toHaveLength(2);
      expect(entries[0].calorieGoal).toBe(1800);
      expect(entries[1].calorieGoal).toBe(1800);
    });
  });
});
