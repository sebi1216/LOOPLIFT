import Storage from 'expo-sqlite/kv-store';

// Where the app's data lives on the phone: one key in expo-sqlite's key-value store, only on
// this device (no account, no server). What is stored is listed in docs/data-inventory.md.
// The web preview uses persist.web.ts (localStorage), because SQLite on web needs extra setup.

// Read at startup, before the first frame, so Today never flashes empty data.
export function loadRaw(key: string): string | null {
  try {
    return Storage.getItemSync(key);
  } catch {
    return null;
  }
}

// Writes run in the background in order; a failed write keeps the data in memory.
export function saveRaw(key: string, value: string): void {
  Storage.setItem(key, value).catch(() => {});
}
