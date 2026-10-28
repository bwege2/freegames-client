// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/datafile.cpp (the reader) and engine/shared/map.cpp of Teeworlds 0.7.5 in TypeScript.
// The data blocks are inflated when the file is opened (the browser's DecompressionStream is asynchronous);
// the original inflates each on first use, with the same result.
import * as MI from '../../game/mapitems.ts';

async function inflate(data: Uint8Array, size: number): Promise<Uint8Array> {
  const out = new Uint8Array(size);
  try {
    const ds = new DecompressionStream('deflate');
    const w = ds.writable.getWriter();
    void w.write(data as unknown as BufferSource).catch(() => {});
    void w.close().catch(() => {});
    const r = ds.readable.getReader();
    let n = 0;
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      const take = Math.min(value.length, size - n);
      out.set(value.subarray(0, take), n);
      n += take;
    }
  } catch {
    // uncompress() fails: the original keeps what it got
  }
  return out;
}

/** crc32 (zlib's) of the whole file */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export class CDataFileReader {
  readonly file: Uint8Array;
  version = 0;
  numItemTypes = 0;
  numItems = 0;
  numRawData = 0;
  itemSize = 0;
  dataSize = 0;
  itemTypes: Int32Array = new Int32Array(0);
  itemOffsets: Int32Array = new Int32Array(0);
  dataOffsets: Int32Array = new Int32Array(0);
  dataSizes: Int32Array = new Int32Array(0);
  /** the item area as ints (items are ints; an item is the int index of its data here) */
  items: Int32Array = new Int32Array(0);
  dataStart = 0;
  data: Uint8Array[] = [];
  crc = 0;

  private constructor(file: Uint8Array) { this.file = file; }

  /** CDataFileReader::Open, with every data block inflated; null if it is not a datafile */
  static async open(file: Uint8Array): Promise<CDataFileReader | null> {
    const r = new CDataFileReader(file);
    if (!r.parse()) return null;
    for (let i = 0; i < r.numRawData; i++) {
      const size = r.GetFileDataSize(i);
      const off = r.dataStart + r.dataOffsets[i];
      if (off < 0 || off + size > file.length) return null;
      r.data[i] = r.version === 4 ? await inflate(file.subarray(off, off + size), r.dataSizes[i]) : file.slice(off, off + size);
    }
    return r;
  }

  private parse(): boolean {
    const f = this.file;
    if (f.length < 36) return false;
    const dv = new DataView(f.buffer, f.byteOffset, f.byteLength);
    const id = String.fromCharCode(f[0], f[1], f[2], f[3]);
    if (id !== 'ATAD' && id !== 'DATA') return false;
    this.version = dv.getInt32(4, true);
    if (this.version !== 3 && this.version !== 4) return false;
    this.numItemTypes = dv.getInt32(16, true);
    this.numItems = dv.getInt32(20, true);
    this.numRawData = dv.getInt32(24, true);
    this.itemSize = dv.getInt32(28, true);
    this.dataSize = dv.getInt32(32, true);
    if (this.numItemTypes < 0 || this.numItems < 0 || this.numRawData < 0 || this.itemSize < 0) return false;
    let p = 36;
    const ints = (n: number): Int32Array => {
      const a = new Int32Array(n);
      for (let i = 0; i < n; i++, p += 4) a[i] = dv.getInt32(p, true);
      return a;
    };
    const need = 36 + this.numItemTypes * 12 + (this.numItems + this.numRawData * (this.version === 4 ? 2 : 1)) * 4 + this.itemSize;
    if (need > f.length) return false;
    this.itemTypes = ints(this.numItemTypes * 3);
    this.itemOffsets = ints(this.numItems);
    this.dataOffsets = ints(this.numRawData);
    this.dataSizes = this.version === 4 ? ints(this.numRawData) : new Int32Array(this.numRawData);
    this.items = ints(this.itemSize >> 2);
    this.dataStart = p;
    this.crc = crc32(f);
    return true;
  }

  GetFileDataSize(i: number): number {
    if (i === this.numRawData - 1) return this.dataSize - this.dataOffsets[i];
    return this.dataOffsets[i + 1] - this.dataOffsets[i];
  }
  GetData(i: number): Uint8Array | null { return i >= 0 && i < this.numRawData ? this.data[i] : null; }
  GetDataSize(i: number): number { return i >= 0 && i < this.numRawData ? this.data[i].length : 0; }
  /** the data block as little-endian ints */
  GetDataInts(i: number): Int32Array | null {
    const d = this.GetData(i);
    if (!d) return null;
    const a = new Int32Array(d.length >> 2);
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    for (let k = 0; k < a.length; k++) a[k] = dv.getInt32(4 * k, true);
    return a;
  }
  ReplaceData(i: number, d: Uint8Array): void {
    if (i >= 0 && i < this.numRawData) this.data[i] = d;
  }
  GetItemSize(i: number): number {
    const s = i === this.numItems - 1 ? this.itemSize - this.itemOffsets[i] : this.itemOffsets[i + 1] - this.itemOffsets[i];
    return s === 0 ? 0 : s - 8;
  }
  /** the int index of the item's data in items, or -1; type and id in t */
  GetItem(i: number, t?: { type: number; id: number }): number {
    if (i < 0 || i >= this.numItems) {
      if (t) { t.type = 0; t.id = 0; }
      return -1;
    }
    const o = this.itemOffsets[i] >> 2;
    const ti = this.items[o];
    if (t) {
      t.type = (ti >> 16) & 0xffff;
      t.id = ti & 0xffff;
    }
    return o + 2;
  }
  GetType(Type: number): { start: number; num: number } {
    for (let i = 0; i < this.numItemTypes; i++) if (this.itemTypes[3 * i] === Type) return { start: this.itemTypes[3 * i + 1], num: this.itemTypes[3 * i + 2] };
    return { start: 0, num: 0 };
  }
  FindItem(Type: number, ID: number): number {
    const { start, num } = this.GetType(Type);
    const t = { type: 0, id: 0 };
    for (let i = 0; i < num; i++) {
      const it = this.GetItem(start + i, t);
      if (ID === t.id) return it;
    }
    return -1;
  }
  NumItems(): number { return this.numItems; }

  /** CMap::Load's checks and the expansion of skip-compressed tile layers */
  loadMap(): boolean {
    const v = this.FindItem(MI.MAPITEMTYPE_VERSION, 0);
    if (v < 0 || this.items[v] !== 1) return false;
    const g = this.GetType(MI.MAPITEMTYPE_GROUP), l = this.GetType(MI.MAPITEMTYPE_LAYER);
    const it = this.items;
    for (let gi = 0; gi < g.num; gi++) {
      const group = this.GetItem(g.start + gi);
      for (let li = 0; li < it[group + MI.GROUP_NUM_LAYERS]; li++) {
        const layer = this.GetItem(l.start + it[group + MI.GROUP_START_LAYER] + li);
        if (layer < 0 || it[layer + MI.LAYER_TYPE] !== MI.LAYERTYPE_TILES) continue;
        if (it[layer + MI.TILEMAP_VERSION] > 3) {
          const w = it[layer + MI.TILEMAP_WIDTH], h = it[layer + MI.TILEMAP_HEIGHT];
          const n = w * h;
          if (n > 1 << 28 || n < 0) return false;
          const tiles = new Uint8Array(n * 4);
          const saved = this.GetData(it[layer + MI.TILEMAP_DATA]);
          if (!saved) return false;
          let i = 0, s = 0;
          while (i < n) {
            if (s * 4 + 3 >= saved.length) break;
            const skip = saved[s * 4 + 2];
            for (let k = 0; k <= skip && i < n; k++) {
              tiles[i * 4] = saved[s * 4];
              tiles[i * 4 + 1] = saved[s * 4 + 1];
              tiles[i * 4 + 2] = 0;
              tiles[i * 4 + 3] = saved[s * 4 + 3];
              i++;
            }
            s++;
          }
          this.ReplaceData(it[layer + MI.TILEMAP_DATA], tiles);
        }
      }
    }
    return true;
  }
}
