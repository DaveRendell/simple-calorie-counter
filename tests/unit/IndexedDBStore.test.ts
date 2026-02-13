import { describe, it, expect, beforeEach } from "vitest";
import { IndexedDBStore } from "../../src/store/IndexedDBStore";
import "fake-indexeddb/auto";

describe("IndexedDBStore", () => {
  let store: IndexedDBStore;

  beforeEach(() => {
    indexedDB = new IDBFactory();
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
  });
});
