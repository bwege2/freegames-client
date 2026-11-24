// OpenClonk port: reading the engine's groups (.ocg, .ocd, .ocf, .ocs, .ocp), as src/c4group/C4Group.cpp reads
// packed groups. The port's content is the original's own packed groups (re/openclonk/tools/pack.sh packs
// planet/ with the original's c4group tool); this reads them from bytes instead of files.
//
// A packed group is one gzip stream (with the magic bytes 1e 8c instead of 1f 8b, src/zlib/gzio.c) holding
// the header (C4GroupHeader, 204 bytes, scrambled by MemScramble), the entries (C4GroupEntryCore, 316 bytes
// each) and the entries' data one after another; a child group is stored in it unpacked, as header, entries
// and data again.
import { gunzipSync } from 'fflate';
import { StdStrBuf, WildcardMatch } from './StdBuf.ts';

export const C4GroupFileID = 'RedWolf Design GrpFolder';
export const C4GroupFileVer1 = 1;
export const C4GroupFileVer2 = 2;
const HEADER_SIZE = 204;
const ENTRY_SIZE = 316;

/** MemScramble: the header's obfuscation (its own inverse up to the byte order: xor 237, swap bytes i and i+2) */
export function MemScramble(b: Uint8Array): void {
  for (let i = 0; i < b.length; i++) b[i] ^= 237;
  for (let i = 0; i + 2 < b.length; i += 3) {
    const t = b[i];
    b[i] = b[i + 2];
    b[i + 2] = t;
  }
}

export interface C4GroupHeader {
  Id: string;
  Ver1: number;
  Ver2: number;
  Entries: number;
}

export class C4GroupEntry {
  /** the name as stored (bytes up to NUL; UTF-8 in new groups) */
  FileName: Uint8Array = new Uint8Array(0);
  Packed = 0;
  ChildGroup = false;
  Size = 0;
  /** where the data starts, counted from the end of the entry table (AddEntry: the sizes before it) */
  Offset = 0;
  Executable = false;
  deleted = false;

  get name(): string {
    return new StdStrBuf(this.FileName).toString();
  }
}

/** the uncompressed contents of a packed group file */
export function unpackGroupFile(file: Uint8Array): Uint8Array {
  if (file.length < 2) throw new Error('C4Group: not a group');
  const b = file.slice();
  if (b[0] === 0x1e && b[1] === 0x8c) { b[0] = 0x1f; b[1] = 0x8b; }
  if (b[0] !== 0x1f || b[1] !== 0x8b) throw new Error('C4Group: not a packed group');
  return gunzipSync(b);
}

export class C4Group {
  Head: C4GroupHeader = { Id: '', Ver1: 0, Ver2: 0, Entries: 0 };
  /** the entries in the group's order (the order the engine finds them in) */
  entries: C4GroupEntry[] = [];
  name: string;
  private searchPtr = 0;
  private data: Uint8Array;
  private dataStart = 0;

  /** the group in raw (unpacked) bytes: header, entries, data */
  constructor(name: string, raw: Uint8Array) {
    this.name = name;
    this.data = raw;
    if (raw.length < HEADER_SIZE) throw new Error(`C4Group ${name}: too small`);
    const h = raw.slice(0, HEADER_SIZE);
    MemScramble(h);
    const dv = new DataView(h.buffer);
    const id = new StdStrBuf(h.subarray(0, 28)).toString();
    this.Head = { Id: id, Ver1: dv.getInt32(28, true), Ver2: dv.getInt32(32, true), Entries: dv.getInt32(36, true) };
    if (id !== C4GroupFileID || this.Head.Ver1 !== C4GroupFileVer1 || this.Head.Ver2 > C4GroupFileVer2) {
      throw new Error(`C4Group ${name}: invalid header`);
    }
    const n = this.Head.Entries;
    this.Head.Entries = 0;
    let pos = HEADER_SIZE;
    for (let i = 0; i < n; i++) {
      if (pos + ENTRY_SIZE > raw.length) throw new Error(`C4Group ${name}: entry table cut off`);
      const e = raw.subarray(pos, pos + ENTRY_SIZE);
      const edv = new DataView(raw.buffer, raw.byteOffset + pos, ENTRY_SIZE);
      const fn = e.subarray(0, 260);
      const z = fn.indexOf(0);
      this.AddEntry(fn.slice(0, z < 0 ? 260 : z), edv.getInt32(264, true) !== 0, edv.getInt32(268, true), edv.getInt32(260, true), e[289] !== 0);
      pos += ENTRY_SIZE;
    }
    this.dataStart = pos;
  }

  /** OpenRealGrpFile for a packed group file's bytes */
  static open(name: string, file: Uint8Array): C4Group {
    return new C4Group(name, unpackGroupFile(file));
  }

  /** C4Group::AddEntry for an entry of the file: an older entry of the same name is deleted */
  private AddEntry(fileName: Uint8Array, child: boolean, size: number, packed: number, exe: boolean): void {
    const old = this.GetEntry(fileName);
    if (old) { old.deleted = true; this.Head.Entries--; }
    const e = new C4GroupEntry();
    e.FileName = fileName;
    e.ChildGroup = child;
    e.Size = size;
    e.Packed = packed;
    e.Executable = exe;
    const last = this.entries[this.entries.length - 1];
    e.Offset = last ? last.Offset + last.Size : 0;
    this.entries.push(e);
    this.Head.Entries++;
  }

  GetName(): string {
    return this.name;
  }

  /** GetEntry: the (not deleted) entry matching the wildcard */
  GetEntry(wildcard: string | Uint8Array): C4GroupEntry | null {
    for (const e of this.entries) if (!e.deleted && WildcardMatch(wildcard, e.FileName)) return e;
    return null;
  }

  ResetSearch(): void {
    this.searchPtr = 0;
  }

  /** SearchNextEntry: "*.*" finds everything, as "*" */
  private SearchNextEntry(wildcard: string): C4GroupEntry | null {
    if (wildcard === '*.*') wildcard = '*';
    for (let i = this.searchPtr; i < this.entries.length; i++) {
      const e = this.entries[i];
      if (!e.deleted && WildcardMatch(wildcard, e.FileName)) {
        this.searchPtr = i + 1;
        return e;
      }
    }
    this.searchPtr = this.entries.length;
    return null;
  }

  /** FindEntry: the first entry matching the wildcard; its name and size into the out-parameters */
  FindEntry(wildcard: string, out?: { name?: StdStrBuf; size?: number }): boolean {
    this.ResetSearch();
    return this.FindNextEntry(wildcard, out);
  }

  FindNextEntry(wildcard: string, out?: { name?: StdStrBuf; size?: number }): boolean {
    const e = this.SearchNextEntry(wildcard);
    if (!e) return false;
    if (out) {
      if (out.name) out.name.Copy(e.FileName);
      out.size = e.Size;
    }
    return true;
  }

  EntryCount(wildcard = '*'): number {
    let n = 0;
    this.ResetSearch();
    while (this.SearchNextEntry(wildcard)) n++;
    return n;
  }

  /** the data of the entry with this name (wildcards allowed, as in AccessEntry), or null */
  entryData(wildcard: string): Uint8Array | null {
    const e = this.GetEntry(wildcard);
    if (!e) return null;
    const start = this.dataStart + e.Offset;
    if (start + e.Size > this.data.length) throw new Error(`C4Group ${this.name}: entry ${e.name} cut off`);
    return this.data.subarray(start, start + e.Size);
  }

  /** LoadEntry: a copy of the entry's data */
  LoadEntry(wildcard: string): Uint8Array | null {
    const d = this.entryData(wildcard);
    return d ? d.slice() : null;
  }

  /** LoadEntryString: the entry as text (a StdStrBuf) */
  LoadEntryString(wildcard: string): StdStrBuf | null {
    const d = this.entryData(wildcard);
    return d ? new StdStrBuf(d.slice()) : null;
  }

  /** OpenAsChild: the child group stored in an entry */
  OpenAsChild(wildcard: string): C4Group | null {
    const e = this.GetEntry(wildcard);
    if (!e || !e.ChildGroup) return null;
    return new C4Group(`${this.name}/${e.name}`, this.entryData(wildcard)!);
  }
}
