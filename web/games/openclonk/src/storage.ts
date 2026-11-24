// The player's files of the original in the site's storage (AGENTS.md server principle 6: account scope for a player's
// files; docs/GAME-INTEGRATION.md "Storage").
//
// On Linux the original keeps them in its user folder `~/.clonk/openclonk/` (Config.General.UserDataPath):
//
// | Path below the user folder | What | Written by |
// | --- | --- | --- |
// | `config` | the configuration, with `MissionAccess` (the missions a player unlocked) | C4Config::Save (on quit, after a round, by the options) |
// | `<name>.ocp` | a player file, a packed group (Player.txt, its picture, its crew) | the player selection (C4StartupPlrSelDlg), C4Player::Save after a round |
// | `Savegames.ocf/Title.txt`, `Savegames.ocf/<scenario>.ocf/Title.txt` | the savegame folders' titles | C4ConfigGeneral::CreateSaveFolder |
// | `Savegames.ocf/<scenario>.ocf/<scenario><n>.ocs` | a savegame, a packed group | C4GameSave (the in-game menu's "Save game") |
//
// Everything else there stays in the page's memory: the log (`OpenClonk.log`), records (`Records.ocf`, written only
// when asked for), screenshots. Each kept file is one file of the storage, with the original's bytes; its name is its
// path, with `/` written `__` and every byte outside [A-Za-z0-9.-] written `_` and two hex digits.
//
// A group the original writes as a folder is stored packed, as the original's own C4Group packs a folder
// (C4Group_PackDirectoryTo: the entries gzipped in one file, which the original reads as it reads the folder). The
// original writes a savegame as a copy of its scenario (C4GameSave::SaveCreateGroup: C4Group_CopyItem), and the page's
// content is unpacked into folders (src/app.ts), so a savegame is a folder until it is stored; the players the page puts
// on the command line are folders too.
//
// The page loads the files into the engine's file system before the engine starts (UserFiles.load) and, after every
// frame, writes back what the engine changed (UserFiles.sync): the original writes its files synchronously, the
// storage answers later, so the page keeps the order of the writes and reports what the storage refused.

/** the storage of the site (ctx.storage) or a stand-in (tests) */
export interface FileStore {
  get(name: string): Promise<Uint8Array | null>;
  put(name: string, data: Uint8Array): Promise<unknown>;
  delete(name: string): Promise<boolean>;
  list(prefix?: string): Promise<{ name: string; size: number }[]>;
}

/** the storage's limits per player and game (docs/GAME-INTEGRATION.md, docs/SERVER.md) */
export const LIMITS = { files: 64, fileSize: 512 * 1024, total: 4 * 1024 * 1024, name: 64 };

/** the engine's file system as far as this module needs it (rt/fs.ts) */
export interface UserFs {
  readFile(path: string): Uint8Array | null;
  addFile(path: string, data: Uint8Array): void;
  isDir(path: string): boolean;
  listDir(path: string): string[] | null;
  /** a folder packed into a group's bytes (the original's C4Group_PackDirectoryTo), or null */
  pack?(path: string): Uint8Array | null;
}

/** whether a path below the user folder is one of the player's files that last (the table above) */
export function kept(rel: string): boolean {
  if (rel === 'config') return true;
  if (/^[^/]+\.ocp$/i.test(rel)) return true;
  return /^Savegames\.ocf\/(Title\.txt|[^/]+\.ocf\/(Title\.txt|[^/]+\.ocs))$/i.test(rel);
}

const SAFE = /^[A-Za-z0-9.-]$/;

/** the storage name of a path below the user folder, or null if it is longer than the storage allows */
export function storageName(rel: string): string | null {
  let out = '';
  for (const part of rel.split('/')) {
    if (out) out += '__';
    for (const b of new TextEncoder().encode(part)) {
      const c = String.fromCharCode(b);
      out += b < 0x80 && SAFE.test(c) ? c : '_' + b.toString(16).toUpperCase().padStart(2, '0');
    }
  }
  return out.length >= 1 && out.length <= LIMITS.name ? out : null;
}

/** the path below the user folder of a storage name (storageName's inverse), or null for a name it never writes */
export function pathOf(name: string): string | null {
  const bytes: number[] = [];
  for (let i = 0; i < name.length; i++) {
    const c = name[i];
    if (c !== '_') {
      if (!SAFE.test(c)) return null;
      bytes.push(c.charCodeAt(0));
    } else if (name[i + 1] === '_') {
      bytes.push(0x2f);
      i++;
    } else {
      const h = name.slice(i + 1, i + 3);
      if (!/^[0-9A-F]{2}$/.test(h)) return null;
      bytes.push(parseInt(h, 16));
      i += 2;
    }
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export interface SyncReport {
  /** files written to the storage, removed from it */
  put: string[];
  removed: string[];
  /** files the storage could not keep, and why */
  refused: { path: string; why: string }[];
}

/** the player's files of one user folder, kept in a FileStore */
export class UserFiles {
  /** the files as the storage has them: path below the user folder -> bytes */
  readonly stored = new Map<string, Uint8Array>();
  private chain: Promise<unknown> = Promise.resolve();
  private readonly store: FileStore;
  private readonly dir: string;
  private readonly fs: UserFs;
  /** told about every write the storage refused or failed (the page shows it) */
  onRefused: (path: string, why: string) => void = () => {};

  /** dir: the user folder, with its trailing slash */
  constructor(store: FileStore, dir: string, fs: UserFs) {
    this.store = store;
    this.dir = dir;
    this.fs = fs;
  }

  /** the storage's files into the user folder (before the engine starts); answers the paths loaded */
  async load(): Promise<string[]> {
    const files = await this.store.list('');
    const out: string[] = [];
    await Promise.all(files.map(async (f) => {
      const rel = pathOf(f.name);
      if (rel === null || !kept(rel)) return;
      const data = await this.store.get(f.name);
      if (!data) return;
      this.stored.set(rel, data.slice());
      this.fs.addFile(this.dir + rel, data);
      out.push(rel);
    }));
    return out.sort();
  }

  /** the storage's use: files and bytes */
  usage(): { files: number; bytes: number } {
    let bytes = 0;
    for (const d of this.stored.values()) bytes += d.length;
    return { files: this.stored.size, bytes };
  }

  /**
   * writes back what the engine changed (rt/fs.ts takeChanges: absolute paths): every kept file at or below a changed
   * path is put if its bytes differ from the storage's, removed if it is gone. The writes go out in order; the promise
   * settles when they are done.
   */
  sync(changed: string[]): Promise<SyncReport> {
    const report: SyncReport = { put: [], removed: [], refused: [] };
    const rels = new Set<string>();
    for (const p of changed) {
      if (!p.startsWith(this.dir)) continue;
      const rel = p.slice(this.dir.length).replace(/\/+$/, '');
      if (!rel) continue;
      if (kept(rel)) rels.add(rel);
      // a file inside a kept group that is a folder (a savegame being written)
      const parts = rel.split('/');
      for (let i = 1; i < parts.length; i++) {
        const up = parts.slice(0, i).join('/');
        if (kept(up)) rels.add(up);
      }
      // a folder made, removed or renamed: the kept files below it
      for (const s of this.stored.keys()) if (s.startsWith(rel + '/')) rels.add(s);
      if (this.fs.isDir(this.dir + rel)) this.walk(rel, rels);
    }
    const ops: (() => Promise<void>)[] = [];
    for (const rel of [...rels].sort()) {
      const now = this.fs.isDir(this.dir + rel) ? (this.fs.pack?.(this.dir + rel) ?? null) : this.fs.readFile(this.dir + rel);
      const was = this.stored.get(rel);
      if (now === null) {
        if (was === undefined) continue;
        const name = storageName(rel)!;
        this.stored.delete(rel);
        report.removed.push(rel);
        ops.push(async () => { await this.store.delete(name); });
        continue;
      }
      if (was !== undefined && equal(was, now)) continue;
      const why = this.refusal(rel, now.length);
      if (why) {
        report.refused.push({ path: rel, why });
        this.onRefused(rel, why);
        continue;
      }
      const data = now.slice();
      this.stored.set(rel, data);
      report.put.push(rel);
      ops.push(async () => { await this.store.put(storageName(rel)!, data); });
    }
    const done = this.chain.then(async () => {
      for (const op of ops) {
        try {
          await op();
        } catch (e) {
          const why = String((e as Error)?.message ?? e);
          report.refused.push({ path: '', why });
          this.onRefused('', why);
        }
      }
      return report;
    });
    this.chain = done;
    return done;
  }

  /** why the storage cannot keep a file of this size, or '' */
  private refusal(rel: string, size: number): string {
    if (storageName(rel) === null) return `the name is longer than the storage allows (${LIMITS.name} characters)`;
    if (size > LIMITS.fileSize) return `${size} bytes, more than the storage keeps per file (${LIMITS.fileSize})`;
    const u = this.usage();
    const was = this.stored.get(rel);
    const files = u.files + (was ? 0 : 1);
    const bytes = u.bytes - (was?.length ?? 0) + size;
    if (files > LIMITS.files) return `more files than the storage keeps (${LIMITS.files})`;
    if (bytes > LIMITS.total) return `${bytes} bytes in all, more than the storage keeps (${LIMITS.total})`;
    return '';
  }

  private walk(rel: string, out: Set<string>): void {
    const stack = [rel];
    while (stack.length) {
      const r = stack.pop()!;
      if (this.fs.isDir(this.dir + r)) {
        for (const name of this.fs.listDir(this.dir + r) ?? []) stack.push(r + '/' + name);
      } else if (kept(r)) {
        out.add(r);
      }
    }
  }
}
