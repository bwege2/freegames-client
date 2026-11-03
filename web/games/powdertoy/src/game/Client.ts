// client/Client.cpp (the offline parts: stamps, local saves, authorship info), client/SaveFile.cpp,
// prefs/Prefs.cpp + GlobalPrefs (powder.pref), common/clipboard (the in-memory save clipboard).
//
// The original keeps these as files in its data folder: powder.pref, stamps/<id>.stm, stamps/stamps.json,
// Saves/<name>.cps. The port keeps them as files in the player's account storage (ctx.storage), with the same
// contents (OPS saves, JSON prefs):
//   powder.pref          -> powder.pref
//   stamps/stamps.json   -> stamps.json
//   stamps/<id>.stm      -> stamp-<id>.stm
//   Saves/<name>.cps     -> save-<name>.cps   (characters outside [A-Za-z0-9._-] become '_')
// Account storage is asynchronous; Client reads every file once at start (Init) and keeps them in memory, so the
// game reads them synchronously as the original does. Writes go out in the background; a failed write shows an
// error message.
import { GameSave } from '../save/gameSave.ts';
import type { JsonValue } from '../save/gameSave.ts';

/** what Client needs of the SDK's Storage (web/src/sdk/storage.ts) */
export interface StorageLike {
  get(name: string): Promise<Uint8Array | null>;
  put(name: string, data: Uint8Array): Promise<unknown>;
  delete(name: string): Promise<boolean>;
  list(prefix?: string): Promise<{ name: string; size: number; modified: number }[]>;
}

export const LOCAL_SAVE_DIR = 'Saves';
export const STAMPS_DIR = 'stamps';
export const SAVE_PREFIX = 'save-';
export const SAVE_EXT = '.cps';
export const STAMP_PREFIX = 'stamp-';
export const STAMP_EXT = '.stm';
export const PREFS_FILE = 'powder.pref';
export const STAMPS_FILE = 'stamps.json';
/** account storage limits (docs/GAME-INTEGRATION.md) */
export const STORAGE_MAX_FILE = 512 * 1024, STORAGE_MAX_FILES = 64, STORAGE_MAX_TOTAL = 4 * 1024 * 1024;
const NAME_RE = /^[A-Za-z0-9._-]{1,64}$/;

/** a local save's display name -> its storage file name (save-<name>.cps), or null if it cannot be one */
export function SaveFileName(displayName: string): string | null {
  const clean = displayName.replace(/[^A-Za-z0-9._-]/g, '_');
  const name = SAVE_PREFIX + clean + SAVE_EXT;
  return clean.length && NAME_RE.test(name) ? name : null;
}
/** storage file name -> display name (the original shows the file name without folder and extension) */
export function SaveDisplayName(fileName: string): string {
  let n = fileName;
  if (n.startsWith(SAVE_PREFIX)) n = n.slice(SAVE_PREFIX.length);
  else if (n.startsWith(STAMP_PREFIX)) n = n.slice(STAMP_PREFIX.length);
  if (n.endsWith(SAVE_EXT) || n.endsWith(STAMP_EXT)) n = n.slice(0, -4);
  return n;
}
export function StampFileName(stampID: string): string {
  return STAMP_PREFIX + stampID + STAMP_EXT;
}
export function IsValidStorageName(name: string): boolean {
  return NAME_RE.test(name);
}

// ---------------------------------------------------------------------------------------------------------------
// SaveFile

export class SaveFile {
  private gameSave: GameSave | null = null;
  private filename: string;
  private displayName: string;
  private loadingError = '';
  private lazyLoad: boolean;

  constructor(filename: string, newLazyLoad = false) {
    this.filename = filename;
    this.displayName = SaveDisplayName(filename);
    this.lazyLoad = newLazyLoad;
  }
  LazyGetGameSave(): GameSave | null {
    if (this.lazyLoad && !this.gameSave) {
      const file = Client.Ref().LoadSaveFile(this.filename);
      if (file) {
        this.gameSave = file.TakeGameSave();
        this.loadingError = file.GetError();
      }
    }
    return this.gameSave;
  }
  LazyUnload(): void {
    if (this.lazyLoad) this.gameSave = null;
  }
  GetGameSave(): GameSave | null { return this.gameSave; }
  TakeGameSave(): GameSave | null {
    const g = this.gameSave;
    this.gameSave = null;
    return g;
  }
  SetGameSave(newGameSave: GameSave | null): void { this.gameSave = newGameSave; }
  GetDisplayName(): string { return this.displayName; }
  SetDisplayName(displayName: string): void { this.displayName = displayName; }
  GetName(): string { return this.filename; }
  SetFileName(fileName: string): void { this.filename = fileName; }
  GetError(): string { return this.loadingError; }
  SetLoadingError(error: string): void { this.loadingError = error; }
}

// ---------------------------------------------------------------------------------------------------------------
// Prefs

type Json = JsonValue;

export class Prefs {
  root: Record<string, Json> = {};
  private path: string;
  private deferWriteLevel = 0;
  private shouldWrite = false;
  private client: Client;

  constructor(client: Client, path: string) {
    this.client = client;
    this.path = path;
  }
  Read(data: Uint8Array | null): void {
    if (!data || !data.length) return;
    try {
      const v = JSON.parse(new TextDecoder().decode(data));
      if (v && typeof v === 'object' && !Array.isArray(v)) this.root = v;
    } catch {
      console.warn('powder.pref: bad json');
    }
  }
  private static GetJson(node: Json, path: string): Json {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
    const dot = path.indexOf('.');
    const obj = node as Record<string, Json>;
    if (dot === -1) return obj[path] ?? null;
    return Prefs.GetJson(obj[path.slice(0, dot)] ?? null, path.slice(dot + 1));
  }
  private static SetJson(node: Record<string, Json>, path: string, value: Json): void {
    const dot = path.indexOf('.');
    if (dot === -1) {
      node[path] = value;
      return;
    }
    const key = path.slice(0, dot);
    let child = node[key];
    if (!child || typeof child !== 'object' || Array.isArray(child)) node[key] = child = {};
    Prefs.SetJson(child as Record<string, Json>, path.slice(dot + 1), value);
  }
  /** Get<Type>(path): undefined if missing */
  GetOpt<T>(path: string): T | undefined {
    const v = Prefs.GetJson(this.root, path);
    return v === null ? undefined : (v as unknown as T);
  }
  /** Get(path, defaultValue): the stored value if it has the default's type */
  Get<T extends Json>(path: string, defaultValue: T): T {
    const v = Prefs.GetJson(this.root, path);
    if (v === null || v === undefined) return defaultValue;
    if (typeof defaultValue === 'number') return (typeof v === 'number' ? v : typeof v === 'boolean' ? Number(v) : defaultValue) as T;
    if (typeof defaultValue === 'boolean') return (typeof v === 'boolean' ? v : typeof v === 'number' ? v !== 0 : defaultValue) as T;
    if (typeof defaultValue === 'string') return (typeof v === 'string' ? v : defaultValue) as T;
    if (Array.isArray(defaultValue)) return (Array.isArray(v) ? v : defaultValue) as T;
    return v as T;
  }
  /** Get(path, numValues, defaultValue) for enums */
  GetEnum(path: string, numValues: number, defaultValue: number): number {
    let value = this.Get(path, defaultValue);
    if (value < 0 || value >= numValues) value = defaultValue;
    return value | 0;
  }
  Set(path: string, value: Json | undefined): void {
    if (value === undefined) Prefs.SetJson(this.root, path, null);
    else Prefs.SetJson(this.root, path, value);
    this.ShouldWrite();
  }
  Clear(path: string): void {
    Prefs.SetJson(this.root, path, null);
    this.ShouldWrite();
  }
  private ShouldWrite(): void {
    this.shouldWrite = true;
    this.Write();
  }
  private Write(): void {
    if (this.deferWriteLevel) return;
    if (!this.shouldWrite) return;
    this.shouldWrite = false;
    this.client.WriteFile(this.path, new TextEncoder().encode(JSON.stringify(this.root, null, '\t')), true);
  }
  /** Prefs::DeferWrite: run f with writes deferred */
  DeferWrite(f: () => void): void {
    this.deferWriteLevel += 1;
    try {
      f();
    } finally {
      this.deferWriteLevel -= 1;
      this.Write();
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Client

export interface User {
  Username: string;
}

export class Client {
  private static instance: Client | null = null;
  static Ref(): Client {
    if (!Client.instance) Client.instance = new Client(null);
    return Client.instance;
  }
  static Create(storage: StorageLike | null): Client {
    Client.instance = new Client(storage);
    return Client.instance;
  }

  private storage: StorageLike | null;
  /** file name -> contents, everything in storage (read at Init) and written since */
  private files = new Map<string, Uint8Array>();
  private stampIDs: string[] = [];
  private lastStampTime = 0;
  private lastStampName = 0;
  private authors: Record<string, Json> = {};
  private pendingWrites = new Map<string, Uint8Array | null>();
  private flushing = false;
  prefs: Prefs;
  private stamps: Prefs;
  /** called when a background write fails (index.ts shows an ErrorMessage) */
  onStorageError: ((message: string) => void) | null = null;

  private constructor(storage: StorageLike | null) {
    this.storage = storage;
    this.prefs = new Prefs(this, PREFS_FILE);
    this.stamps = new Prefs(this, STAMPS_FILE);
  }

  /** read every file of the player's storage (the original reads its folder when it lists it) */
  async Init(): Promise<void> {
    if (this.storage) {
      try {
        const list = await this.storage.list('');
        await Promise.all(list.map(async (fi) => {
          const data = await this.storage!.get(fi.name);
          if (data) this.files.set(fi.name, data);
        }));
      } catch (e) {
        console.warn('powdertoy: storage unavailable', e);
      }
    }
    this.prefs.Read(this.files.get(PREFS_FILE) ?? null);
    this.stamps.Read(this.files.get(STAMPS_FILE) ?? null);
    this.stampIDs = this.stamps.Get('MostRecentlyUsedFirst', [] as Json[]).filter((s): s is string => typeof s === 'string');
    this.RescanStamps();
  }

  /** Platform::WriteFile into storage (in memory at once, to the server in the background) */
  WriteFile(name: string, data: Uint8Array, quiet = false): boolean {
    if (!IsValidStorageName(name)) return false;
    if (data.length > STORAGE_MAX_FILE) {
      if (!quiet) this.onStorageError?.('The file is larger than the 512 KiB a file may have.');
      return false;
    }
    const isNew = !this.files.has(name);
    if (isNew && this.files.size >= STORAGE_MAX_FILES) {
      if (!quiet) this.onStorageError?.('Your storage holds 64 files already; delete a save or stamp first.');
      return false;
    }
    let total = data.length;
    for (const [n, d] of this.files) if (n !== name) total += d.length;
    if (total > STORAGE_MAX_TOTAL) {
      if (!quiet) this.onStorageError?.('Your storage is full (4 MiB); delete a save or stamp first.');
      return false;
    }
    this.files.set(name, data);
    this.queue(name, data);
    return true;
  }
  /** Platform::ReadFile */
  ReadFile(name: string): Uint8Array | null {
    return this.files.get(name) ?? null;
  }
  FileExists(name: string): boolean {
    return this.files.has(name);
  }
  RemoveFile(name: string): boolean {
    if (!this.files.delete(name)) return false;
    this.queue(name, null);
    return true;
  }
  RenameFile(oldName: string, newName: string): boolean {
    const d = this.files.get(oldName);
    if (!d || this.files.has(newName) || !IsValidStorageName(newName)) return false;
    this.files.delete(oldName);
    this.files.set(newName, d);
    this.queue(oldName, null);
    this.queue(newName, d);
    return true;
  }
  /** Platform::DirectorySearch over storage: names with the prefix and one of the extensions */
  DirectorySearch(prefix: string, search: string, extensions: string[]): string[] {
    const out: string[] = [];
    for (const n of this.files.keys()) {
      if (!n.startsWith(prefix)) continue;
      if (extensions.length && !extensions.some((e) => n.endsWith(e))) continue;
      if (search && !n.toLowerCase().includes(search.toLowerCase())) continue;
      out.push(n);
    }
    return out.sort();
  }
  private queue(name: string, data: Uint8Array | null): void {
    this.pendingWrites.set(name, data);
    void this.flush();
  }
  private flushDone: Promise<void> = Promise.resolve();
  /** resolves when every queued write has reached the storage (the game's stop() waits for it) */
  async Flush(): Promise<void> {
    while (this.flushing || this.pendingWrites.size) {
      if (!this.flushing) void this.flush();
      await this.flushDone;
    }
  }
  private flush(): Promise<void> {
    if (this.flushing || !this.storage) return this.flushDone;
    this.flushDone = this.flushWrites();
    return this.flushDone;
  }
  private async flushWrites(): Promise<void> {
    if (!this.storage) return;
    this.flushing = true;
    try {
      while (this.pendingWrites.size) {
        const [name, data] = this.pendingWrites.entries().next().value as [string, Uint8Array | null];
        this.pendingWrites.delete(name);
        try {
          if (data) await this.storage.put(name, data);
          else await this.storage.delete(name);
        } catch (e) {
          console.warn('powdertoy: storage write failed', name, e);
          this.onStorageError?.('Could not write ' + name + ' to your storage: ' + String((e as Error)?.message ?? e));
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  GetAuthUser(): User | null { return null; }

  // ---- stamps ----

  private WriteStamps(): void {
    if (this.stampIDs.length) this.stamps.Set('MostRecentlyUsedFirst', this.stampIDs.slice());
  }
  RescanStamps(): void {
    const stampFilesSet = new Set<string>();
    for (const n of this.DirectorySearch(STAMP_PREFIX, '', [STAMP_EXT])) stampFilesSet.add(SaveDisplayName(n));
    const newStampIDs: string[] = [];
    let changed = false;
    for (const stampID of this.stampIDs) {
      if (!stampFilesSet.has(stampID)) changed = true;
      else newStampIDs.push(stampID);
    }
    const stampIDsSet = new Set(this.stampIDs);
    for (const stampID of [...stampFilesSet].sort()) {
      if (!stampIDsSet.has(stampID)) {
        newStampIDs.push(stampID);
        changed = true;
      }
    }
    if (changed) {
      this.stampIDs = newStampIDs;
      this.WriteStamps();
    }
  }
  GetStamps(): string[] { return this.stampIDs; }
  MoveStampToFront(stampID: string): void {
    const it = this.stampIDs.indexOf(stampID);
    if (it === -1) {
      this.stampIDs.unshift(stampID);
      this.WriteStamps();
    } else if (it !== 0) {
      this.stampIDs.splice(it, 1);
      this.stampIDs.unshift(stampID);
      this.WriteStamps();
    }
  }
  GetStamp(stampID: string): SaveFile | null {
    const saveFile = this.LoadSaveFile(StampFileName(stampID));
    if (saveFile) saveFile.SetDisplayName(stampID);
    return saveFile;
  }
  DeleteStamp(stampID: string): void {
    const it = this.stampIDs.indexOf(stampID);
    if (it !== -1) {
      this.stampIDs = this.stampIDs.filter((s) => s !== stampID);
      this.RemoveFile(StampFileName(stampID));
      this.WriteStamps();
    }
  }
  /** returns an error message or '' */
  RenameStamp(stampID: string, newName: string): string {
    if (this.FileExists(StampFileName(newName))) return 'A stamp with this name already exists.';
    if (!this.RenameFile(StampFileName(stampID), StampFileName(newName))) return 'Could not rename the stamp.';
    this.stampIDs = this.stampIDs.map((s) => (s === stampID ? newName : s));
    this.WriteStamps();
    return '';
  }
  AddStamp(saveData: GameSave): string {
    const now = Math.floor(Date.now() / 1000);
    if (this.lastStampTime !== now) {
      this.lastStampTime = now;
      this.lastStampName = 0;
    } else {
      this.lastStampName += 1;
    }
    let saveID: string;
    while (true) {
      saveID = (this.lastStampTime >>> 0).toString(16).padStart(8, '0') + (this.lastStampName & 0xFF).toString(16).padStart(2, '0');
      if (!this.FileExists(StampFileName(saveID))) break;
      this.lastStampName += 1;
    }
    const stampInfo: Record<string, Json> = { type: 'stamp', username: '', name: STAMPS_DIR + '/' + saveID + STAMP_EXT, date: now };
    if (Object.keys(this.authors).length !== 0) stampInfo.links = [this.authors];
    saveData.authors = stampInfo;
    let gameData: Uint8Array;
    try {
      [, gameData] = saveData.Serialise();
    } catch {
      return '';
    }
    if (!gameData.length) return '';
    if (!this.WriteFile(StampFileName(saveID), gameData)) return '';
    this.MoveStampToFront(saveID);
    return saveID;
  }

  LoadSaveFile(filename: string): SaveFile | null {
    let err = '';
    let file: SaveFile | null = null;
    const data = this.files.get(filename);
    if (data) {
      file = new SaveFile(filename);
      try {
        file.SetGameSave(new GameSave(data));
      } catch (e) {
        err = String((e as Error)?.message ?? e);
      }
    } else {
      err = 'does not exist';
    }
    if (err.length) {
      console.warn('Client: ' + filename + ': ' + err);
      if (file) file.SetLoadingError(err);
    }
    return file;
  }

  // ---- authorship info ----

  GetAuthorInfo(): Record<string, Json> { return structuredClone(this.authors); }
  OverwriteAuthorInfo(overwrite: Json): void {
    if (overwrite && typeof overwrite === 'object' && !Array.isArray(overwrite)) this.authors = structuredClone(overwrite) as Record<string, Json>;
    else this.authors = {};
  }
  ClearAuthorInfo(): void { this.authors = {}; }
  IsAuthorsEmpty(): boolean { return Object.keys(this.authors).length === 0; }
  MergeStampAuthorInfo(stampAuthors: Json): void {
    if (!stampAuthors || typeof stampAuthors !== 'object' || Array.isArray(stampAuthors)) return;
    const sa = stampAuthors as Record<string, Json>;
    if (!Object.keys(sa).length) return;
    if (Object.keys(this.authors).length) {
      const links = Array.isArray(sa.links) ? sa.links : [];
      if (links.length === 1 && JSON.stringify(links[0]) === JSON.stringify(this.authors)) return;
      if (JSON.stringify(this.authors.username ?? null) !== JSON.stringify(sa.username ?? null)) this.MergeAuthorInfo([sa]);
      else if (links.length) this.MergeAuthorInfo(links);
    } else {
      this.authors = structuredClone(sa);
    }
  }
  private MergeAuthorInfo(linksToAdd: Json[]): void {
    for (const l of linksToAdd) {
      if (JSON.stringify(l) === JSON.stringify(this.authors)) return;
      const links = Array.isArray(this.authors.links) ? this.authors.links : (this.authors.links = []);
      if (!links.some((x) => JSON.stringify(x) === JSON.stringify(l))) links.push(l);
    }
  }
  SaveAuthorInfo(saveInto: Record<string, Json>): void {
    if (Object.keys(this.authors).length !== 0) {
      if (JSON.stringify(this.authors.username ?? null) !== JSON.stringify(saveInto.username ?? null)) {
        const links = Array.isArray(saveInto.links) ? saveInto.links : (saveInto.links = []);
        links.push(this.authors);
      } else if (Array.isArray(this.authors.links) && this.authors.links.length) {
        saveInto.links = this.authors.links;
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// common/clipboard/Clipboard.cpp: the in-memory save clipboard (the original can also put it on the system
// clipboard as text; the browser port keeps it in memory, see README)

let clipboardData: GameSave | null = null;
export const Clipboard = {
  SetClipboardData(data: GameSave | null): void {
    clipboardData = data;
  },
  GetClipboardData(): GameSave | null {
    return clipboardData;
  },
};

/** GlobalPrefs::Ref() */
export function GlobalPrefs(): Prefs {
  return Client.Ref().prefs;
}
