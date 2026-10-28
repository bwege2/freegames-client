// The worm files the original saved on its disk ("@0:NAME.WRM": a program file, the load address and
// the 64 moves of the worm's table) are the player's files on the server, in the same format. A
// name's four characters may be anything the C64's name entry accepts; the server's file names take
// [A-Za-z0-9._-], so other characters are written _XX (hex).

/** "@0:AB  .WRM" → "AB_20_20.WRM" */
export function storageName(c64Name: string): string {
  const base = c64Name.replace(/^@/, '').replace(/^[0-9]?:/, '');
  const dot = base.lastIndexOf('.');
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const ext = dot >= 0 ? base.slice(dot + 1) : '';
  const enc = (s: string) => [...s].map((ch) => /[A-Z0-9]/.test(ch) ? ch : `_${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`).join('');
  return `${enc(stem)}.${enc(ext)}`;
}

export interface FileStore {
  get(name: string): Promise<Uint8Array | null>;
  put(name: string, data: Uint8Array): Promise<unknown>;
}

/** the disk Worms? reads and writes, on a store (ctx.storage) */
export function wormDisk(store: FileStore) {
  return {
    read: (name: string) => store.get(storageName(name)),
    write: async (name: string, data: Uint8Array) => { await store.put(storageName(name), data); },
  };
}
