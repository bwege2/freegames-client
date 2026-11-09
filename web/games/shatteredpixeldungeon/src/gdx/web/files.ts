// @ts-nocheck
// The game's files in the browser (src/gdx/files.ts: StoreFiles over FileStores):
//
// Internal files (AssetStore) are the original's assets (web/games/<id>/assets), served by the site under
// hashed names. libGDX reads them synchronously (textures, .properties, fonts), so the ones the game needs are
// fetched before it starts (preload) and kept in memory: everything but the music (streamed when played,
// audio.ts) and the texts of the other languages (fetched when the language is chosen: index.ts).
//
// Local files (PersistentStore, FileUtils' default file type in WebLauncher) are the files the desktop game
// writes into its folder: the settings (settings.xml, the LWJGL3 backend's Preferences file), the games in
// progress (game1/game.dat, game1/depth3.dat, ...), rankings.dat, badges.dat, journal.dat, bones.dat,
// keybinds.dat. They live in memory and are written to the site's storage (ctx.storage) soon after they
// change (debounced) and when the game pauses or stops, with the original's contents (the gzip'd JSON
// bundles of FileUtils, the Properties XML of the settings). Storage keeps 64 files per player and names of
// [A-Za-z0-9._-]{1,64}, and a game in progress is one file per depth, so:
// - a file of the top folder is one stored file "f.<name>" (characters outside [A-Za-z0-9.-] written as _xx,
//   their hex code: "f.settings.xml", "f.rankings.dat");
// - a folder (a game slot) is one stored file "d.<name>.zip": a zip archive (stored, not compressed: the files
//   are gzip already) of its files, byte for byte, with their times;
// - FileUtils' temporary "*.spdtmp" files (written and renamed in one go) are not stored.
import { zipSync, unzipSync } from 'fflate';
import { MemoryFileStore, normalPath } from '../files.ts';
import type { FileStore } from '../files.ts';
import { MemoryPreferences } from '../core.ts';

/* ------------------------------------------------------------------ internal files */

export class AssetStore implements FileStore {
  /** path (relative to the assets folder) -> URL */
  urls = new Map<string, string>();
  data = new Map<string, Uint8Array>();
  dirs = new Map<string, Set<string>>();
  constructor(urls: Record<string, string>) {
    for (const [p, u] of Object.entries(urls)) {
      const path = normalPath(p);
      this.urls.set(path, u);
      const parts = path.split('/');
      for (let i = 0; i < parts.length; i++) {
        const dir = parts.slice(0, i).join('/');
        if (!this.dirs.has(dir)) this.dirs.set(dir, new Set());
        this.dirs.get(dir).add(parts[i]);
      }
    }
  }
  static clean(p: string) { return normalPath(p).replace(/^\.?\//, ''); }
  url(path: string) { return this.urls.get(AssetStore.clean(path)) ?? null; }
  has(path: string) { return this.data.has(AssetStore.clean(path)); }
  read(path: string) { return this.data.get(AssetStore.clean(path)) ?? null; }
  list(path: string) { const d = this.dirs.get(AssetStore.clean(path)); return d ? [...d] : null; }
  isDirectory(path: string) { return this.dirs.has(AssetStore.clean(path)); }
  /** Fetches the files `want` selects that are not loaded yet; `progress(done, total)` as they arrive. */
  async load(want: (path: string) => boolean, signal: AbortSignal, progress?: (done: number, total: number) => void) {
    const todo = [...this.urls.keys()].filter((p) => !this.data.has(p) && want(p));
    let done = 0;
    let next = 0;
    const worker = async () => {
      while (next < todo.length) {
        const p = todo[next++];
        const r = await fetch(this.urls.get(p), { signal });
        if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
        this.data.set(p, new Uint8Array(await r.arrayBuffer()));
        progress?.(++done, todo.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(8, todo.length) }, worker));
  }
}

/* ------------------------------------------------------------------ the player's files */

export interface StorageLike {
  get(name: string): Promise<Uint8Array | null>;
  put(name: string, data: Uint8Array): Promise<unknown>;
  delete(name: string): Promise<boolean>;
  list(prefix?: string): Promise<{ name: string; size: number; modified: number }[]>;
}

/** A name of the site's storage for a name of the game ([A-Za-z0-9.-] stay, others become _xx). */
export function escapeName(s: string): string {
  let out = '';
  for (const ch of new TextEncoder().encode(s)) {
    const c = String.fromCharCode(ch);
    out += /[A-Za-z0-9.-]/.test(c) ? c : '_' + ch.toString(16).padStart(2, '0');
  }
  return out;
}
export function unescapeName(s: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '_' && i + 2 < s.length + 0) { bytes.push(parseInt(s.substring(i + 1, i + 3), 16)); i += 2; }
    else bytes.push(s.charCodeAt(i));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/** The stored file a path belongs to: "f.<file>" for a file of the top folder, "d.<folder>.zip" for a folder. */
export function storageName(path: string): string {
  const p = AssetStore.clean(path);
  const i = p.indexOf('/');
  return i < 0 ? 'f.' + escapeName(p) : 'd.' + escapeName(p.substring(0, i)) + '.zip';
}

export class PersistentStore extends MemoryFileStore {
  storage: StorageLike;
  dirty = new Set<string>();
  timer: any = null;
  saving: Promise<void> = Promise.resolve();
  delay = 400;
  failed = false;
  constructor(storage: StorageLike) {
    super();
    this.storage = storage;
  }
  key(p: string) { return AssetStore.clean(p); }
  read(path: string) { return super.read(this.key(path)); }
  list(path: string) { return super.list(this.key(path)); }
  isDirectory(path: string) { const k = this.key(path); return k === '' ? true : super.isDirectory(k); }
  lastModified(path: string) { return super.lastModified(this.key(path)); }
  write(path: string, data: Uint8Array, append: boolean) {
    super.write(this.key(path), data, append);
    this.changed(path);
  }
  delete(path: string) {
    const r = super.delete(this.key(path));
    if (r) this.changed(path);
    return r;
  }
  changed(path: string) {
    if (path.endsWith('.spdtmp')) return;
    this.dirty.add(storageName(path));
    if (this.timer == null) this.timer = setTimeout(() => { this.timer = null; void this.flush(); }, this.delay);
  }

  /** Reads every stored file of the player into memory (before the game starts). */
  async loadAll() {
    for (const f of await this.storage.list('')) {
      const data = await this.storage.get(f.name);
      if (!data) continue;
      if (f.name.startsWith('f.')) {
        this.files.set(unescapeName(f.name.substring(2)), { data, time: f.modified });
      } else if (f.name.startsWith('d.') && f.name.endsWith('.zip')) {
        const dir = unescapeName(f.name.substring(2, f.name.length - 4));
        try {
          const entries = unzipSync(data);
          for (const [n, d] of Object.entries(entries)) this.files.set(dir + '/' + n, { data: d, time: f.modified });
        } catch (e) {
          console.warn('Shattered Pixel Dungeon: cannot read ' + f.name + ': ' + e);
        }
      }
    }
  }

  /** The bytes of one stored file now (null: it is to be deleted). */
  pack(name: string): Uint8Array | null {
    if (name.startsWith('f.')) {
      const f = this.files.get(unescapeName(name.substring(2)));
      return f ? f.data : null;
    }
    const dir = unescapeName(name.substring(2, name.length - 4));
    const entries: Record<string, [Uint8Array, any]> = {};
    let any = false;
    for (const [p, f] of this.files) {
      if (!p.startsWith(dir + '/') || p.endsWith('.spdtmp')) continue;
      entries[p.substring(dir.length + 1)] = [f.data, { level: 0, mtime: new Date(Math.max(f.time, 315532800000 + 86400000)) }];
      any = true;
    }
    return any ? zipSync(entries) : null;
  }

  /** Writes what changed to the site's storage (in order, one write after another). */
  flush(): Promise<void> {
    if (this.timer != null) { clearTimeout(this.timer); this.timer = null; }
    const names = [...this.dirty];
    this.dirty.clear();
    if (names.length === 0) return this.saving;
    const jobs = names.map((n) => [n, this.pack(n)] as const);
    this.saving = this.saving.then(async () => {
      for (const [n, data] of jobs) {
        try {
          if (data) await this.storage.put(n, data);
          else await this.storage.delete(n);
        } catch (e) {
          if (!this.failed) console.warn('Shattered Pixel Dungeon: could not store ' + n + ': ' + e);
          this.failed = true;
        }
      }
    });
    return this.saving;
  }
}

/* ------------------------------------------------------------------ preferences */

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/[\u0000-\u001f]/g, (c) => (c === '\n' || c === '\t' || c === '\r' ? c : '&#' + c.charCodeAt(0) + ';'));
}
function xmlUnescape(s: string) {
  return s.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (_m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.substring(2), 16) : parseInt(e.substring(1), 10));
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" } as any)[e];
  });
}

/** java.util.Properties.storeToXML's text (what Lwjgl3Preferences.flush writes). */
export function propertiesToXML(values: Map<string, string>): string {
  let s = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n';
  for (const [k, v] of values) s += `<entry key="${xmlEscape(k)}">${xmlEscape(v)}</entry>\n`;
  return s + '</properties>\n';
}
export function propertiesFromXML(xml: string): Map<string, string> {
  const m = new Map<string, string>();
  const re = /<entry\s+key="([^"]*)"\s*(?:\/>|>([\s\S]*?)<\/entry>)/g;
  let e: RegExpExecArray | null;
  while ((e = re.exec(xml))) m.set(xmlUnescape(e[1]), xmlUnescape(e[2] ?? ''));
  return m;
}

/** Preferences in a file of the player's files, in the LWJGL3 backend's format (Lwjgl3Preferences). */
export class FilePreferences extends MemoryPreferences {
  store: FileStore;
  path: string;
  constructor(store: FileStore, path: string) {
    super();
    this.store = store;
    this.path = path;
    const d = store.read(path);
    if (d) {
      try { this.values = propertiesFromXML(new TextDecoder().decode(d)); } catch { /* as libGDX: start empty */ }
    }
  }
  flush() { this.store.write(this.path, new TextEncoder().encode(propertiesToXML(this.values)), false); }
}
