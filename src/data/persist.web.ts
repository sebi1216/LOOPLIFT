// Web preview only: the browser's localStorage stands in for expo-sqlite (persist.ts).
// Private windows or blocked storage just mean nothing is kept.

export function loadRaw(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function saveRaw(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Storage full or blocked: keep running with the data in memory.
  }
}
