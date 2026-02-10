import { describe, it, expect, beforeEach } from "vitest";
import { IndexedDBStore } from "../../src/store/IndexedDBStore";
import "fake-indexeddb/auto";

describe("IndexedDBStore", () => {
  let store: IndexedDBStore;

  beforeEach(() => {
    // Reset IndexedDB between tests
    indexedDB = new IDBFactory();
    store = new IndexedDBStore();
  });

  describe("entries", () => {
    it("should add and retrieve an entry by date", async () => {
      const entry = await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Lunch",
        createdAt: Date.now(),
      });

      expect(entry.id).toBeDefined();
      expect(entry.calories).toBe(500);
      expect(entry.description).toBe("Lunch");

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe(entry.id);
    });

    it("should return empty array for date with no entries", async () => {
      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries).toHaveLength(0);
    });

    it("should only return entries for the requested date", async () => {
      await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Day 1",
        createdAt: Date.now(),
      });
      await store.addEntry({
        date: "2024-01-16",
        calories: 300,
        description: "Day 2",
        createdAt: Date.now(),
      });

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries).toHaveLength(1);
      expect(entries[0].description).toBe("Day 1");
    });

    it("should get entry by id", async () => {
      const entry = await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Test",
        createdAt: Date.now(),
      });

      const found = await store.getEntryById(entry.id);
      expect(found).toBeDefined();
      expect(found!.calories).toBe(500);
    });

    it("should return undefined for non-existent entry id", async () => {
      const found = await store.getEntryById("non-existent");
      expect(found).toBeUndefined();
    });

    it("should update an entry", async () => {
      const entry = await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Lunch",
        createdAt: Date.now(),
      });

      await store.updateEntry({
        ...entry,
        calories: 600,
        description: "Big lunch",
      });

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries).toHaveLength(1);
      expect(entries[0].calories).toBe(600);
      expect(entries[0].description).toBe("Big lunch");
    });

    it("should return entries sorted by createdAt", async () => {
      await store.addEntry({
        date: "2024-01-15",
        calories: 200,
        description: "Snack",
        createdAt: 3000,
      });
      await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Breakfast",
        createdAt: 1000,
      });
      await store.addEntry({
        date: "2024-01-15",
        calories: 800,
        description: "Lunch",
        createdAt: 2000,
      });

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries.map((e) => e.description)).toEqual([
        "Breakfast",
        "Lunch",
        "Snack",
      ]);
    });

    it("should delete an entry", async () => {
      const entry = await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "Lunch",
        createdAt: Date.now(),
      });

      await store.deleteEntry(entry.id);

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries).toHaveLength(0);
    });
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
  });
});
