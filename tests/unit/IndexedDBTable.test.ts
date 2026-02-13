import { describe, it, expect, beforeEach } from "vitest";
import { openDB } from "idb";
import { IndexedDBTable } from "../../src/store/IndexedDBTable";
import "fake-indexeddb/auto";

interface TestItem {
  id: string;
  name: string;
  sortOrder?: number;
}

function createTestDB() {
  return openDB("test-db", 1, {
    upgrade(db) {
      db.createObjectStore("items", { keyPath: "id" });
    },
  });
}

describe("IndexedDBTable", () => {
  let table: IndexedDBTable<TestItem>;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    table = new IndexedDBTable<TestItem>(createTestDB(), "items");
  });

  describe("add", () => {
    it("should add an item and return it with a generated id", async () => {
      const item = await table.add({ name: "First" });

      expect(item.id).toBeDefined();
      expect(item.name).toBe("First");
    });

    it("should default sortOrder to current item count", async () => {
      const first = await table.add({ name: "First" });
      const second = await table.add({ name: "Second" });

      expect(first.sortOrder).toBe(0);
      expect(second.sortOrder).toBe(1);
    });

    it("should preserve explicit sortOrder", async () => {
      const item = await table.add({ name: "First", sortOrder: 42 });

      expect(item.sortOrder).toBe(42);
    });
  });

  describe("getById", () => {
    it("should retrieve an item by id", async () => {
      const added = await table.add({ name: "Test" });

      const found = await table.getById(added.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe("Test");
    });

    it("should return undefined for non-existent id", async () => {
      const found = await table.getById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should return all items", async () => {
      await table.add({ name: "A" });
      await table.add({ name: "B" });

      const all = await table.getAll();
      expect(all).toHaveLength(2);
    });

    it("should return empty array when no items exist", async () => {
      const all = await table.getAll();
      expect(all).toHaveLength(0);
    });

    it("should use constructor sortFn by default", async () => {
      const sorted = new IndexedDBTable<TestItem>(
        createTestDB(),
        "items",
        (a, b) => a.name.localeCompare(b.name),
      );
      await sorted.add({ name: "Banana" });
      await sorted.add({ name: "Apple" });
      await sorted.add({ name: "Cherry" });

      const all = await sorted.getAll();
      expect(all.map((i) => i.name)).toEqual(["Apple", "Banana", "Cherry"]);
    });

    it("should allow overriding sortFn per call", async () => {
      const sorted = new IndexedDBTable<TestItem>(
        createTestDB(),
        "items",
        (a, b) => a.name.localeCompare(b.name),
      );
      await sorted.add({ name: "Banana" });
      await sorted.add({ name: "Apple" });

      const reversed = await sorted.getAll((a, b) =>
        b.name.localeCompare(a.name),
      );
      expect(reversed.map((i) => i.name)).toEqual(["Banana", "Apple"]);
    });
  });

  describe("update", () => {
    it("should update an existing item", async () => {
      const item = await table.add({ name: "Original" });

      await table.update({ ...item, name: "Updated" });

      const found = await table.getById(item.id);
      expect(found!.name).toBe("Updated");
    });
  });

  describe("delete", () => {
    it("should remove an item", async () => {
      const item = await table.add({ name: "Doomed" });

      await table.delete(item.id);

      const found = await table.getById(item.id);
      expect(found).toBeUndefined();
    });
  });

  describe("reorder", () => {
    it("should update sortOrder based on array position", async () => {
      const a = await table.add({ name: "A", sortOrder: 0 });
      const b = await table.add({ name: "B", sortOrder: 1 });
      const c = await table.add({ name: "C", sortOrder: 2 });

      await table.reorder([c.id, a.id, b.id]);

      const sorted = new IndexedDBTable<TestItem>(
        createTestDB(),
        "items",
        (x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0),
      );
      const all = await sorted.getAll();
      expect(all.map((i) => i.name)).toEqual(["C", "A", "B"]);
    });

    it("should skip non-existent ids without error", async () => {
      const a = await table.add({ name: "A", sortOrder: 0 });

      await table.reorder(["non-existent", a.id]);

      const found = await table.getById(a.id);
      expect(found!.sortOrder).toBe(1);
    });
  });
});
