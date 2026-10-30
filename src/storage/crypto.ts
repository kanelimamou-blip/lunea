import nacl from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { DEFAULT_DATA, type AppData } from '../domain/types';

export function seal(data: AppData, key: Uint8Array): string {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const box = nacl.secretbox(decodeUTF8(JSON.stringify(data)), nonce, key);
  return JSON.stringify({ v: 1, n: encodeBase64(nonce), c: encodeBase64(box) });
}

export function open(payload: string, key: Uint8Array): AppData {
  const { n, c } = JSON.parse(payload);
  const plain = nacl.secretbox.open(decodeBase64(c), decodeBase64(n), key);
  if (!plain) throw new Error('Données illisibles : clé invalide ou fichier corrompu.');
  return migrate(JSON.parse(encodeUTF8(plain)));
}

/** Fills in fields added in later versions so old vaults keep working. */
export function migrate(raw: Partial<AppData>): AppData {
  return {
    version: 1,
    days: raw.days ?? {},
    settings: {
      ...DEFAULT_DATA.settings,
      ...raw.settings,
      reminders: { ...DEFAULT_DATA.settings.reminders, ...raw.settings?.reminders },
    },
  };
}

