export interface CrudStore<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  add(item: Omit<T, "id">): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: string): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
}
