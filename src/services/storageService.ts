/**
 * Generic LocalStorage persistence layer. Entity services (authService,
 * projectService, ...) build on top of these functions instead of touching
 * `localStorage` directly, per the Programming Rules.
 */
export const STORAGE_KEYS = {
  USERS: 'trazo:users',
  PROJECTS: 'trazo:projects',
  SPRINTS: 'trazo:sprints',
  TASKS: 'trazo:tasks',
  SESSION: 'trazo:session',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function readCollection<T>(key: StorageKey): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch (error) {
    console.error(`Failed to read "${key}" from LocalStorage`, error);
    return [];
  }
}

function writeCollection<T>(key: StorageKey, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Failed to write "${key}" to LocalStorage`, error);
  }
}

/** Returns every record stored under `key`, or an empty array if none exist. */
export function getAll<T>(key: StorageKey): T[] {
  return readCollection<T>(key);
}

/** Returns the record with the given id, or `undefined` if it doesn't exist. */
export function getById<T extends { id: string }>(key: StorageKey, id: string): T | undefined {
  return readCollection<T>(key).find((item) => item.id === id);
}

/** Appends a record. Throws if a record with the same id already exists. */
export function create<T extends { id: string }>(key: StorageKey, item: T): T {
  const items = readCollection<T>(key);
  if (items.some((existing) => existing.id === item.id)) {
    throw new Error(`An item with id "${item.id}" already exists in "${key}".`);
  }
  writeCollection(key, [...items, item]);
  return item;
}

/** Merges `changes` into the record with the given id. Returns `undefined` if it doesn't exist. */
export function update<T extends { id: string }>(
  key: StorageKey,
  id: string,
  changes: Partial<T>,
): T | undefined {
  const items = readCollection<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return undefined;

  const updated = { ...items[index], ...changes } as T;
  items[index] = updated;
  writeCollection(key, items);
  return updated;
}

/** Removes the record with the given id. Returns whether a record was actually removed. */
export function remove(key: StorageKey, id: string): boolean {
  const items = readCollection<{ id: string }>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;

  writeCollection(key, filtered);
  return true;
}

/** Writes `seedData` under `key` only if it's currently empty, so re-runs don't duplicate data. */
export function seedIfEmpty<T>(key: StorageKey, seedData: T[]): void {
  if (readCollection<T>(key).length === 0) {
    writeCollection(key, seedData);
  }
}

/** Reads a single, non-collection value (e.g. the active session). */
export function getItem<T>(key: StorageKey): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch (error) {
    console.error(`Failed to read "${key}" from LocalStorage`, error);
    return undefined;
  }
}

/** Writes a single, non-collection value (e.g. the active session). */
export function setItem<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write "${key}" to LocalStorage`, error);
  }
}

/** Removes a single, non-collection value (e.g. clearing the session on logout). */
export function removeItem(key: StorageKey): void {
  localStorage.removeItem(key);
}
