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

    it("should reorder entries", async () => {
      const e1 = await store.addEntry({
        date: "2024-01-15",
        calories: 200,
        description: "First",
        createdAt: 1000,
        sortOrder: 1000,
      });
      const e2 = await store.addEntry({
        date: "2024-01-15",
        calories: 400,
        description: "Second",
        createdAt: 2000,
        sortOrder: 2000,
      });
      const e3 = await store.addEntry({
        date: "2024-01-15",
        calories: 600,
        description: "Third",
        createdAt: 3000,
        sortOrder: 3000,
      });

      // Reorder: Third, First, Second
      await store.reorderEntries("2024-01-15", [e3.id, e1.id, e2.id]);

      const entries = await store.getEntriesByDate("2024-01-15");
      expect(entries.map((e) => e.description)).toEqual([
        "Third",
        "First",
        "Second",
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

  describe("getRecentEntries", () => {
    it("should return entries sorted by most recent first", async () => {
      await store.addEntry({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.addEntry({
        date: "2024-01-16",
        calories: 500,
        description: "Salad",
        createdAt: 3000,
      });
      await store.addEntry({
        date: "2024-01-15",
        calories: 400,
        description: "Sandwich",
        createdAt: 2000,
      });

      const recent = await store.getRecentEntries();
      expect(recent.map((e) => e.description)).toEqual([
        "Salad",
        "Sandwich",
        "Oatmeal",
      ]);
    });

    it("should exclude entries with empty description", async () => {
      await store.addEntry({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.addEntry({
        date: "2024-01-15",
        calories: 500,
        description: "",
        createdAt: 2000,
      });
      await store.addEntry({
        date: "2024-01-15",
        calories: 400,
        description: "   ",
        createdAt: 3000,
      });

      const recent = await store.getRecentEntries();
      expect(recent).toHaveLength(1);
      expect(recent[0].description).toBe("Oatmeal");
    });

    it("should deduplicate by (description, calories) keeping most recent", async () => {
      await store.addEntry({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.addEntry({
        date: "2024-01-16",
        calories: 300,
        description: "oatmeal",
        createdAt: 3000,
      });
      await store.addEntry({
        date: "2024-01-17",
        calories: 500,
        description: "Oatmeal",
        createdAt: 2000,
      });

      const recent = await store.getRecentEntries();
      // "oatmeal" 300 cal at 3000 and "Oatmeal" 500 cal at 2000
      expect(recent).toHaveLength(2);
      expect(recent[0].createdAt).toBe(3000);
      expect(recent[0].calories).toBe(300);
      expect(recent[1].createdAt).toBe(2000);
      expect(recent[1].calories).toBe(500);
    });

    it("should respect the 100-entry limit", async () => {
      for (let i = 0; i < 110; i++) {
        await store.addEntry({
          date: "2024-01-15",
          calories: i,
          description: `Item ${i}`,
          createdAt: i,
        });
      }

      const recent = await store.getRecentEntries();
      expect(recent).toHaveLength(100);
    });

    it("should return empty array when no entries exist", async () => {
      const recent = await store.getRecentEntries();
      expect(recent).toHaveLength(0);
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
