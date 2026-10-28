// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/snapshot.{h,cpp} of Teeworlds 0.7.5 in TypeScript.
//
// A CSnapshot is an Int32Array in the original's memory layout: m_DataSize (bytes), m_NumItems, the sorted keys,
// the offsets (bytes), then the items (each its key, (type<<16)|id, then its data ints).

export const MAX_PARTS = 64;
export const MAX_SIZE = MAX_PARTS * 1024;
export const MAX_ITEMS = 1024;

export class CSnapshot {
  d: Int32Array;
  constructor(d: Int32Array) { this.d = d; }
  static empty(): CSnapshot { return new CSnapshot(new Int32Array(2)); }
  DataSize(): number { return this.d[0]; }
  NumItems(): number { return this.d[1]; }
  private keysAt(): number { return 2; }
  private offsetsAt(): number { return 2 + this.d[1]; }
  private dataAt(): number { return 2 + 2 * this.d[1]; }
  /** the int index of item i's key; its data follows */
  ItemAt(i: number): number { return this.dataAt() + (this.d[this.offsetsAt() + i] >> 2); }
  ItemKey(i: number): number { return this.d[this.ItemAt(i)]; }
  ItemType(i: number): number { return this.d[this.ItemAt(i)] >> 16; }
  ItemID(i: number): number { return this.d[this.ItemAt(i)] & 0xffff; }
  ItemData(i: number): number { return this.ItemAt(i) + 1; }
  /** a view of item i's data ints */
  ItemDataView(i: number): Int32Array {
    const o = this.ItemData(i);
    return this.d.subarray(o, o + (this.GetItemSize(i) >> 2));
  }
  GetItemSize(i: number): number {
    if (i === this.d[1] - 1) return this.d[0] - this.d[this.offsetsAt() + i] - 4;
    return this.d[this.offsetsAt() + i + 1] - this.d[this.offsetsAt() + i] - 4;
  }
  private at(i: number): number { return i >= 0 && i < this.d.length ? this.d[i] : 0; }
  /**
   * GetItemIndex: find_binary over the sorted keys as the original runs it (plain_range_sorted::slice takes a
   * count, so a step to the right reaches past the range's end, into the offsets that follow the keys).
   */
  GetItemIndex(Key: number): number {
    const n = this.d[1];
    let begin = this.keysAt(), end = this.keysAt() + n;
    if (begin >= end) return -1;
    if (this.at(end - 1) < Key) return -1;
    while (end - begin > 1) {
      const size = end - begin;
      const pivot = (size - 1) >> 1;
      if (this.at(begin + pivot) < Key) {
        const nb = begin + pivot + 1;
        end = nb + (size - 1);
        begin = nb;
      } else end = begin + pivot + 1;
    }
    if (begin >= end || this.at(begin) !== Key) return -1;
    const Index = begin - this.keysAt();
    const off = this.at(this.offsetsAt() + Index);
    if (this.at(this.dataAt() + (off >> 2)) !== Key) return -1;
    return Index;
  }
  InvalidateItem(i: number): void { this.d[this.ItemAt(i)] = -1; }
  Crc(): number {
    let crc = 0;
    for (let i = 0; i < this.d[1]; i++) {
      const p = this.ItemData(i);
      const n = this.GetItemSize(i) >> 2;
      for (let b = 0; b < n; b++) crc = (crc + this.d[p + b]) | 0;
    }
    return crc;
  }
  Size(): number { return 8 + 8 * this.d[1] + this.d[0]; }
}

const HASHLIST_SIZE = 256;

interface CItemList { num: number; keys: Int32Array; index: Int32Array }

function makeHashlist(): CItemList[] {
  const l: CItemList[] = [];
  for (let i = 0; i < HASHLIST_SIZE; i++) l.push({ num: 0, keys: new Int32Array(64), index: new Int32Array(64) });
  return l;
}

function GenerateHash(h: CItemList[], s: CSnapshot): void {
  for (let i = 0; i < HASHLIST_SIZE; i++) h[i].num = 0;
  for (let i = 0; i < s.NumItems(); i++) {
    const Key = s.ItemKey(i);
    const id = ((Key >> 12) & 0xf0) | (Key & 0xf);
    if (h[id].num !== 64) {
      h[id].index[h[id].num] = i;
      h[id].keys[h[id].num] = Key;
      h[id].num++;
    }
  }
}

function GetItemIndexHashed(Key: number, h: CItemList[]): number {
  const id = ((Key >> 12) & 0xf0) | (Key & 0xf);
  for (let i = 0; i < h[id].num; i++) if (h[id].keys[i] === Key) return h[id].index[i];
  return -1;
}

export class CSnapshotDelta {
  readonly m_aItemSizes = new Int16Array(64);
  /** m_aSnapshotDataRate / m_aSnapshotDataUpdates (the debug graph of the original) */
  readonly m_aSnapshotDataRate = new Int32Array(0xffff);
  readonly m_aSnapshotDataUpdates = new Int32Array(0xffff);
  private readonly hashlist = makeHashlist();

  SetStaticsize(ItemType: number, Size: number): void { this.m_aItemSizes[ItemType] = Size; }

  /** CreateDelta into out (ints): its size in bytes (0: no change) */
  CreateDelta(from: CSnapshot, to: CSnapshot, out: Int32Array): number {
    let p = 3;
    let numDeleted = 0, numUpdate = 0;
    GenerateHash(this.hashlist, to);
    for (let i = 0; i < from.NumItems(); i++) {
      const key = from.ItemKey(i);
      if (GetItemIndexHashed(key, this.hashlist) === -1) {
        numDeleted++;
        out[p++] = key;
      }
    }
    GenerateHash(this.hashlist, from);
    const n = to.NumItems();
    const past = new Int32Array(n);
    for (let i = 0; i < n; i++) past[i] = GetItemIndexHashed(to.ItemKey(i), this.hashlist);
    for (let i = 0; i < n; i++) {
      const size = to.GetItemSize(i);
      const type = to.ItemType(i), id = to.ItemID(i);
      const cur = to.ItemData(i);
      const pi = past[i];
      if (pi !== -1) {
        let dst = p + 3;
        const pp = from.ItemData(pi);
        if (this.m_aItemSizes[type]) dst = p + 2;
        let needed = 0;
        for (let k = 0; k < size >> 2; k++) {
          const v = (to.d[cur + k] - from.d[pp + k]) | 0;
          out[dst + k] = v;
          needed |= v;
        }
        if (needed) {
          out[p++] = type;
          out[p++] = id;
          if (!this.m_aItemSizes[type]) out[p++] = size >> 2;
          p += size >> 2;
          numUpdate++;
        }
      } else {
        out[p++] = type;
        out[p++] = id;
        if (!this.m_aItemSizes[type]) out[p++] = size >> 2;
        out.set(to.d.subarray(cur, cur + (size >> 2)), p);
        p += size >> 2;
        numUpdate++;
      }
    }
    out[0] = numDeleted;
    out[1] = numUpdate;
    out[2] = 0;
    if (!numDeleted && !numUpdate) return 0;
    return p * 4;
  }

  private undiff(past: Int32Array, pp: number, diff: Int32Array, dp: number, out: Int32Array, op: number, n: number, cur: number): void {
    for (let k = 0; k < n; k++) {
      out[op + k] = (past[pp + k] + diff[dp + k]) | 0;
      const dv = diff[dp + k];
      if (dv === 0) this.m_aSnapshotDataRate[cur] += 1;
      else {
        // the bits of the packed int
        let bytes = 1;
        let i = dv ^ (dv >> 31);
        i >>>= 6;
        while (i) {
          bytes++;
          i >>>= 7;
        }
        this.m_aSnapshotDataRate[cur] += bytes * 8;
      }
    }
  }

  /** UnpackDelta: the new snapshot, or a negative error */
  UnpackDelta(from: CSnapshot, src: Int32Array, DataSize: number): CSnapshot | number {
    const b = new CSnapshotBuilder();
    b.Init();
    const end = DataSize >> 2;
    const numDeleted = src[0], numUpdate = src[1];
    let p = 3;
    const deleted = p;
    p += numDeleted;
    if (p > end) return -1;
    for (let i = 0; i < from.NumItems(); i++) {
      const key = from.ItemKey(i);
      const size = from.GetItemSize(i);
      let keep = true;
      for (let d = 0; d < numDeleted; d++) {
        if (src[deleted + d] === key) {
          keep = false;
          break;
        }
      }
      if (keep) {
        const o = b.NewItem(key >> 16, key & 0xffff, size);
        if (o >= 0) b.m_aData.set(from.d.subarray(from.ItemData(i), from.ItemData(i) + (size >> 2)), o);
      }
    }
    for (let i = 0; i < numUpdate; i++) {
      if (p + 2 > end) return -1;
      const Type = src[p++];
      if (Type < 0) return -1;
      const ID = src[p++];
      let size: number;
      if (Type < 64 && this.m_aItemSizes[Type]) size = this.m_aItemSizes[Type];
      else {
        if (p + 1 > end) return -2;
        size = src[p++] * 4;
      }
      const cur = Type & 0xffff;
      if (p * 4 + size > end * 4 || size < 0) return -3;
      const Key = (Type << 16) | (ID & 0xffff);
      let nd = b.GetItemData(Key);
      if (nd < 0) nd = b.NewItem(Key >> 16, Key & 0xffff, size);
      if (nd < 0) return -4;
      const fi = from.GetItemIndex(Key);
      if (fi !== -1) {
        this.undiff(from.d, from.ItemData(fi), src, p, b.m_aData, nd, size >> 2, cur);
        this.m_aSnapshotDataUpdates[cur]++;
      } else {
        b.m_aData.set(src.subarray(p, p + (size >> 2)), nd);
        this.m_aSnapshotDataRate[cur] += size * 8;
        this.m_aSnapshotDataUpdates[cur]++;
      }
      p += size >> 2;
    }
    return b.Finish();
  }
}

export interface CSnapshotHolder {
  m_Tagtime: number;
  m_Tick: number;
  m_SnapSize: number;
  m_pSnap: CSnapshot;
  m_pAltSnap: CSnapshot | null;
}

export class CSnapshotStorage {
  readonly list: CSnapshotHolder[] = [];
  Init(): void { this.list.length = 0; }
  PurgeAll(): void { this.list.length = 0; }
  PurgeUntil(Tick: number): void {
    let n = 0;
    while (n < this.list.length && this.list[n].m_Tick < Tick) n++;
    if (n === this.list.length) this.list.length = 0;
    else this.list.splice(0, n);
  }
  Add(Tick: number, Tagtime: number, DataSize: number, s: CSnapshot, CreateAlt: boolean): CSnapshotHolder {
    const h: CSnapshotHolder = { m_Tick: Tick, m_Tagtime: Tagtime, m_SnapSize: DataSize, m_pSnap: new CSnapshot(s.d.slice()), m_pAltSnap: CreateAlt ? new CSnapshot(s.d.slice()) : null };
    this.list.push(h);
    return h;
  }
  Get(Tick: number): CSnapshotHolder | null {
    for (const h of this.list) if (h.m_Tick === Tick) return h;
    return null;
  }
  First(): CSnapshotHolder | null { return this.list[0] ?? null; }
  Last(): CSnapshotHolder | null { return this.list[this.list.length - 1] ?? null; }
}

export class CSnapshotBuilder {
  readonly m_aData = new Int32Array(MAX_SIZE / 4);
  m_DataSize = 0;
  readonly m_aOffsets = new Int32Array(MAX_ITEMS);
  m_NumItems = 0;

  Init(): void {
    this.m_DataSize = 0;
    this.m_NumItems = 0;
  }
  GetItemData(Key: number): number {
    for (let i = 0; i < this.m_NumItems; i++) if (this.m_aData[this.m_aOffsets[i] >> 2] === Key) return (this.m_aOffsets[i] >> 2) + 1;
    return -1;
  }
  /** the int index of the new item's data (zeroed), or -1 */
  NewItem(Type: number, ID: number, Size: number): number {
    if (this.m_DataSize + 8 + 4 + Size + (this.m_NumItems + 1) * 8 >= MAX_SIZE || this.m_NumItems + 1 >= MAX_ITEMS) return -1;
    const o = this.m_DataSize >> 2;
    this.m_aData.fill(0, o, o + 1 + (Size >> 2));
    this.m_aData[o] = (Type << 16) | (ID & 0xffff);
    this.m_aOffsets[this.m_NumItems] = this.m_DataSize;
    this.m_DataSize += 4 + Size;
    this.m_NumItems++;
    return o + 1;
  }
  Finish(): CSnapshot {
    const n = this.m_NumItems;
    const keys = new Int32Array(n);
    for (let i = 0; i < n; i++) keys[i] = this.m_aData[this.m_aOffsets[i] >> 2];
    const sizes = new Int32Array(n);
    for (let i = 0; i < n - 1; i++) sizes[i] = this.m_aOffsets[i + 1] - this.m_aOffsets[i];
    if (n > 0) sizes[n - 1] = this.m_DataSize - this.m_aOffsets[n - 1];
    const offs = this.m_aOffsets.slice(0, n);
    let sorting = true;
    while (sorting) {
      sorting = false;
      for (let i = 1; i < n; i++) {
        if (keys[i - 1] > keys[i]) {
          sorting = true;
          let t = keys[i]; keys[i] = keys[i - 1]; keys[i - 1] = t;
          t = offs[i]; offs[i] = offs[i - 1]; offs[i - 1] = t;
          t = sizes[i]; sizes[i] = sizes[i - 1]; sizes[i - 1] = t;
        }
      }
    }
    const d = new Int32Array(2 + 2 * n + (this.m_DataSize >> 2));
    d[0] = this.m_DataSize;
    d[1] = n;
    d.set(keys, 2);
    let cur = 0;
    const base = 2 + 2 * n;
    for (let i = 0; i < n; i++) {
      d[2 + n + i] = cur;
      d.set(this.m_aData.subarray(offs[i] >> 2, (offs[i] + sizes[i]) >> 2), base + (cur >> 2));
      cur += sizes[i];
    }
    return new CSnapshot(d);
  }
}
