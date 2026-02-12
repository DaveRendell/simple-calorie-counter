import type { IDBPDatabase } from "idb";

export class IndexedDBTable<T extends { id: string; sortOrder?: number }> {
  #dbPromise: Promise<IDBPDatabase>;
  #storeName: string;

  constructor(dbPromise: Promise<IDBPDatabase>, storeName: string) {
    this.#dbPromise = dbPromise;
    this.#storeName = storeName;
  }

  async getById(id: string): Promise<T | undefined> {
    const db = await this.#dbPromise;
    return db.get(this.#storeName, id);
  }

  async getAll(sortFn?: (a: T, b: T) => number): Promise<T[]> {
    const db = await this.#dbPromise;
    const all = await db.getAll(this.#storeName);
    return sortFn ? all.sort(sortFn) : all;
  }

  async getAllFromIndex(
    indexName: string,
    key: IDBValidKey,
    sortFn?: (a: T, b: T) => number,
  ): Promise<T[]> {
    const db = await this.#dbPromise;
    const all = await db.getAllFromIndex(this.#storeName, indexName, key);
    return sortFn ? all.sort(sortFn) : all;
  }

  async add(item: Omit<T, "id">): Promise<T> {
    const db = await this.#dbPromise;
    const id = crypto.randomUUID();
    const full = { ...item, id } as T;
    await db.add(this.#storeName, full);
    return full;
  }

  async update(item: T): Promise<T> {
    const db = await this.#dbPromise;
    await db.put(this.#storeName, item);
    return item;
  }

  async delete(id: string): Promise<void> {
    const db = await this.#dbPromise;
    await db.delete(this.#storeName, id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const db = await this.#dbPromise;
    const tx = db.transaction(this.#storeName, "readwrite");
    for (let i = 0; i < orderedIds.length; i++) {
      const item = await tx.store.get(orderedIds[i]);
      if (item) {
        item.sortOrder = i;
        tx.store.put(item);
      }
    }
    await tx.done;
  }
}
