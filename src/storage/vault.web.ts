import nacl from 'tweetnacl';
import { DEFAULT_DATA, type AppData } from '../domain/types';
import { open, seal } from './crypto';

// Web version: the encrypted vault lives in localStorage and its key in
// IndexedDB, both scoped to this site and this browser. Nothing is sent anywhere.

const DATA_KEY = 'lunea.vault';
const DB = 'lunea';
const STORE = 'keys';

function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE, mode);
      const r = run(tx.objectStore(STORE));
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    };
  });
}

async function getKey(): Promise<Uint8Array> {
  const existing = await idb<Uint8Array | undefined>('readonly', (s) => s.get('vault'));
  if (existing) return new Uint8Array(existing);
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  await idb('readwrite', (s) => s.put(key, 'vault'));
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  return key;
}

export async function loadData(): Promise<AppData> {
  const payload = localStorage.getItem(DATA_KEY);
  if (!payload) return DEFAULT_DATA;
  return open(payload, await getKey());
}

export async function saveData(data: AppData): Promise<void> {
  localStorage.setItem(DATA_KEY, seal(data, await getKey()));
}

export async function wipeData(): Promise<void> {
  localStorage.removeItem(DATA_KEY);
  await idb('readwrite', (s) => s.delete('vault'));
}
