import { describe, it, expect, beforeEach } from "vitest";
import { openDB } from "idb";
import { IndexedDBFoodEntryStore } from "../../src/store/IndexedDBFoodEntryStore";
import "fake-indexeddb/auto";

function createTestDB() {
  return openDB("test-entry-db", 1, {
    upgrade(db) {
      const store = db.createObjectStore("entries", { keyPath: "id" });
      store.createIndex("date", "date", { unique: false });
    },
  });
}

describe("IndexedDBFoodEntryStore", () => {
  let store: IndexedDBFoodEntryStore;

  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    store = new IndexedDBFoodEntryStore(createTestDB(), "entries");
  });

  describe("getByDate", () => {
    it("should return entries for the given date", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 500,
        description: "Day 1",
        createdAt: 1000,
      });
      await store.add({
        date: "2024-01-16",
        calories: 300,
        description: "Day 2",
        createdAt: 2000,
      });

      const entries = await store.getByDate("2024-01-15");
      expect(entries).toHaveLength(1);
      expect(entries[0].description).toBe("Day 1");
    });

    it("should return empty array for date with no entries", async () => {
      const entries = await store.getByDate("2024-01-15");
      expect(entries).toHaveLength(0);
    });

    it("should sort entries by sortOrder", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 200,
        description: "Snack",
        createdAt: 3000,
        sortOrder: 3000,
      });
      await store.add({
        date: "2024-01-15",
        calories: 500,
        description: "Breakfast",
        createdAt: 1000,
        sortOrder: 1000,
      });
      await store.add({
        date: "2024-01-15",
        calories: 800,
        description: "Lunch",
        createdAt: 2000,
        sortOrder: 2000,
      });

      const entries = await store.getByDate("2024-01-15");
      expect(entries.map((e) => e.description)).toEqual([
        "Breakfast",
        "Lunch",
        "Snack",
      ]);
    });
  });

  describe("getRecent", () => {
    it("should return entries sorted by most recent first", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.add({
        date: "2024-01-16",
        calories: 500,
        description: "Salad",
        createdAt: 3000,
      });
      await store.add({
        date: "2024-01-15",
        calories: 400,
        description: "Sandwich",
        createdAt: 2000,
      });

      const recent = await store.getRecent();
      expect(recent.map((e) => e.description)).toEqual([
        "Salad",
        "Sandwich",
        "Oatmeal",
      ]);
    });

    it("should exclude entries with empty description", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.add({
        date: "2024-01-15",
        calories: 500,
        description: "",
        createdAt: 2000,
      });
      await store.add({
        date: "2024-01-15",
        calories: 400,
        description: "   ",
        createdAt: 3000,
      });

      const recent = await store.getRecent();
      expect(recent).toHaveLength(1);
      expect(recent[0].description).toBe("Oatmeal");
    });

    it("should deduplicate by (description, calories) keeping most recent", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
      });
      await store.add({
        date: "2024-01-16",
        calories: 300,
        description: "oatmeal",
        createdAt: 3000,
      });
      await store.add({
        date: "2024-01-17",
        calories: 500,
        description: "Oatmeal",
        createdAt: 2000,
      });

      const recent = await store.getRecent();
      expect(recent).toHaveLength(2);
      expect(recent[0].createdAt).toBe(3000);
      expect(recent[0].calories).toBe(300);
      expect(recent[1].createdAt).toBe(2000);
      expect(recent[1].calories).toBe(500);
    });

    it("should exclude placeholder-generated entries", async () => {
      await store.add({
        date: "2024-01-15",
        calories: 300,
        description: "Oatmeal",
        createdAt: 1000,
        isFromPlaceholder: false,
      });
      await store.add({
        date: "2024-01-15",
        calories: 400,
        description: "Breakfast Placeholder",
        createdAt: 2000,
        isFromPlaceholder: true,
      });

      const recent = await store.getRecent();
      expect(recent).toHaveLength(1);
      expect(recent[0].description).toBe("Oatmeal");
    });

    it("should respect the 100-entry limit", async () => {
      for (let i = 0; i < 110; i++) {
        await store.add({
          date: "2024-01-15",
          calories: i,
          description: `Item ${i}`,
          createdAt: i,
        });
      }

      const recent = await store.getRecent();
      expect(recent).toHaveLength(100);
    });

    it("should return empty array when no entries exist", async () => {
      const recent = await store.getRecent();
      expect(recent).toHaveLength(0);
    });
  });
});
