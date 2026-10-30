import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { decodeBase64, encodeBase64 } from 'tweetnacl-util';
import { DEFAULT_DATA, type AppData } from '../domain/types';
import { open, seal } from './crypto';

// Local-first storage: everything stays on the device, encrypted with
// XSalsa20-Poly1305 (NaCl secretbox). The 256-bit key never leaves the
// iOS Keychain / Android Keystore and is not included in device backups.

nacl.setPRNG((out, n) => out.set(Crypto.getRandomBytes(n)));

const KEY_NAME = 'lunea.vault.key';
const keyOptions: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const dataFile = () => new File(Paths.document, 'lunea.vault');

async function getKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(KEY_NAME, keyOptions);
  if (existing) return decodeBase64(existing);
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  await SecureStore.setItemAsync(KEY_NAME, encodeBase64(key), keyOptions);
  return key;
}

export async function loadData(): Promise<AppData> {
  const file = dataFile();
  if (!file.exists) return DEFAULT_DATA;
  return open(await file.text(), await getKey());
}

export async function saveData(data: AppData): Promise<void> {
  const file = dataFile();
  if (!file.exists) file.create();
  file.write(seal(data, await getKey()));
}

/** Irreversibly removes the data and its key. */
export async function wipeData(): Promise<void> {
  const file = dataFile();
  if (file.exists) file.delete();
  await SecureStore.deleteItemAsync(KEY_NAME, keyOptions);
}
