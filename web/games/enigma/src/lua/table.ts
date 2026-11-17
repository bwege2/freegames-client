// Lua 5.1.4's tables (ltable.c), node for node: the array part, the hash part with its main positions,
// collision chains and free pointer, and the same rehash sizes. So `next`/`pairs` visit keys in the same
// order as the original's Lua, which levels depend on (random placement, group order).
// Keys of reference type (tables, functions, userdata) hash by a counter instead of their address.

export type LuaValue = undefined | boolean | number | string | object;

const MAXBITS = 26;
const MAXASIZE = 1 << MAXBITS;

let nextRefId = 1;
const refIds = new WeakMap<object, number>();
export function refId(o: object): number {
  let id = refIds.get(o);
  if (id === undefined) { id = nextRefId++ * 8; refIds.set(o, id); }
  return id;
}

const strHashes = new Map<string, number>();
/** luaS_hash of lstring.c (luaS_newlstr) */
export function strHash(s: string): number {
  let h = strHashes.get(s);
  if (h !== undefined) return h;
  const l = s.length;
  h = l >>> 0;
  const step = (l >> 5) + 1;
  for (let l1 = l; l1 >= step; l1 -= step) h = (h ^ (((h << 5) >>> 0) + (h >>> 2) + (s.charCodeAt(l1 - 1) & 0xff))) >>> 0;
  if (strHashes.size > 200000) strHashes.clear();
  strHashes.set(s, h);
  return h;
}

const f64 = new Float64Array(1);
const u32 = new Uint32Array(f64.buffer);

function ceillog2(x: number): number { // ceil(log2(x)) for x >= 1
  let l = 0; x--;
  while (x >= 256) { l += 8; x = Math.floor(x / 256); }
  while (x > 0) { l++; x >>= 1; }
  return l;
}

interface Node { key: LuaValue; val: LuaValue; next: number }

function arrayindex(key: LuaValue): number {
  if (typeof key === 'number') {
    const k = key | 0;
    if (k === key) return k;
  }
  return -1;
}

export class LuaTable {
  array: LuaValue[] = [];
  sizearray = 0;
  node: Node[];
  lsizenode = 0;
  lastfree: number;
  isDummy = true;
  metatable: LuaTable | null = null;

  constructor(narray = 0, nhash = 0) {
    this.node = [{ key: undefined, val: undefined, next: -1 }];
    this.lastfree = 0;
    if (narray > 0) this.setarrayvector(narray);
    this.setnodevector(nhash);
  }

  private sizenode() { return 1 << this.lsizenode; }

  private setarrayvector(size: number) {
    for (let i = this.sizearray; i < size; i++) this.array[i] = undefined;
    this.sizearray = size;
  }

  private setnodevector(size: number) {
    if (size === 0) {
      this.node = [{ key: undefined, val: undefined, next: -1 }];
      this.lsizenode = 0;
      this.isDummy = true;
    } else {
      const lsize = ceillog2(size);
      if (lsize > MAXBITS) throw new Error('table overflow');
      size = 1 << lsize;
      this.node = new Array(size);
      for (let i = 0; i < size; i++) this.node[i] = { key: undefined, val: undefined, next: -1 };
      this.lsizenode = lsize;
      this.isDummy = false;
    }
    this.lastfree = this.sizenode();
  }

  private mainposition(key: LuaValue): number {
    const size = this.sizenode();
    switch (typeof key) {
      case 'number': {
        if (key === 0) return 0;
        f64[0] = key;
        const a = (u32[0] + u32[1]) >>> 0;
        return a % ((size - 1) | 1);
      }
      case 'string': return strHash(key) & (size - 1);
      case 'boolean': return (key ? 1 : 0) & (size - 1);
      default: return refId(key as object) % ((size - 1) | 1);
    }
  }

  /** index of the node holding key, or -1 */
  private findnode(key: LuaValue): number {
    if (this.isDummy) return -1;
    let n = this.mainposition(key);
    do {
      const nd = this.node[n];
      if (nd.key === key || (typeof key === 'number' && typeof nd.key === 'number' && nd.key === key)) return n;
      n = nd.next;
    } while (n >= 0);
    return -1;
  }

  get(key: LuaValue): LuaValue {
    if (key === undefined) return undefined;
    if (typeof key === 'number') {
      const k = arrayindex(key);
      if (k >= 1 && k <= this.sizearray) return this.array[k - 1];
      if (key !== key) return undefined;
    }
    const n = this.findnode(key);
    return n >= 0 ? this.node[n].val : undefined;
  }

  getStr(key: string): LuaValue {
    if (this.isDummy) return undefined;
    let n = strHash(key) & (this.sizenode() - 1);
    do {
      const nd = this.node[n];
      if (nd.key === key) return nd.val;
      n = nd.next;
    } while (n >= 0);
    return undefined;
  }

  getInt(k: number): LuaValue {
    if (k >= 1 && k <= this.sizearray) return this.array[k - 1];
    return this.get(k);
  }

  set(key: LuaValue, val: LuaValue) {
    if (typeof key === 'number') {
      const k = arrayindex(key);
      if (k >= 1 && k <= this.sizearray) { this.array[k - 1] = val; return; }
      if (key !== key) throw new Error('table index is NaN');
    } else if (key === undefined) throw new Error('table index is nil');
    const n = this.findnode(key);
    if (n >= 0) { this.node[n].val = val; return; }
    this.newkey(key).val = val; // as luaH_set: a missing key gets a node even when val is nil
  }

  /** luaH_set for luaV_settable with a __newindex metamethod: the slot is created first */
  slot(key: LuaValue): { val: LuaValue } {
    if (key === undefined) throw new Error('table index is nil');
    if (typeof key === 'number' && key !== key) throw new Error('table index is NaN');
    return this.setslot(key);
  }

  private getfreepos(): number {
    while (this.lastfree-- > 0) {
      if (this.node[this.lastfree].key === undefined) return this.lastfree;
    }
    return -1;
  }

  private newkey(key: LuaValue): Node {
    let mp = this.mainposition(key);
    if (this.node[mp].val !== undefined || this.isDummy) {
      const n = this.isDummy ? -1 : this.getfreepos();
      if (n < 0) {
        this.rehash(key);
        return this.setslot(key);
      }
      const mpn = this.node[mp];
      let othern = this.mainposition(mpn.key);
      if (othern !== mp) {
        while (this.node[othern].next !== mp) othern = this.node[othern].next;
        this.node[othern].next = n;
        const nn = this.node[n];
        nn.key = mpn.key; nn.val = mpn.val; nn.next = mpn.next;
        mpn.next = -1; mpn.val = undefined;
      } else {
        this.node[n].next = mpn.next;
        mpn.next = n;
        mp = n;
      }
    }
    const nd = this.node[mp];
    nd.key = key;
    return nd;
  }

  /** luaH_set: the slot for key (existing or new) */
  private setslot(key: LuaValue): Node {
    if (typeof key === 'number') {
      const k = arrayindex(key);
      if (k >= 1 && k <= this.sizearray) {
        const arr = this.array;
        return { set val(v: LuaValue) { arr[k - 1] = v; }, get val() { return arr[k - 1]; } } as Node;
      }
    }
    const n = this.findnode(key);
    if (n >= 0) return this.node[n];
    return this.newkey(key);
  }

  private numusearray(nums: number[]): number {
    let ause = 0, i = 1;
    for (let lg = 0, ttlg = 1; lg <= MAXBITS; lg++, ttlg *= 2) {
      let lc = 0;
      let lim = ttlg;
      if (lim > this.sizearray) { lim = this.sizearray; if (i > lim) break; }
      for (; i <= lim; i++) if (this.array[i - 1] !== undefined) lc++;
      nums[lg] += lc;
      ause += lc;
    }
    return ause;
  }

  private static countint(key: LuaValue, nums: number[]): number {
    const k = arrayindex(key);
    if (k > 0 && k <= MAXASIZE) { nums[ceillog2(k)]++; return 1; }
    return 0;
  }

  private rehash(ek: LuaValue) {
    const nums = new Array(MAXBITS + 1).fill(0);
    let nasize = this.numusearray(nums);
    let totaluse = nasize;
    // numusehash
    let ause = 0, tu = 0;
    for (let i = this.sizenode() - 1; i >= 0; i--) {
      const n = this.node[i];
      if (n.val !== undefined) { ause += LuaTable.countint(n.key, nums); tu++; }
    }
    nasize += ause;
    totaluse += tu;
    nasize += LuaTable.countint(ek, nums);
    totaluse++;
    // computesizes
    let a = 0, na = 0, nn = 0;
    for (let i = 0, twotoi = 1; Math.floor(twotoi / 2) < nasize; i++, twotoi *= 2) {
      if (nums[i] > 0) { a += nums[i]; if (a > Math.floor(twotoi / 2)) { nn = twotoi; na = a; } }
      if (a === nasize) break;
    }
    this.resize(nn, totaluse - na);
  }

  resize(nasize: number, nhsize: number) {
    const oldasize = this.sizearray;
    const oldhsize = this.lsizenode;
    const nold = this.node;
    if (nasize > oldasize) this.setarrayvector(nasize);
    this.setnodevector(nhsize);
    if (nasize < oldasize) {
      this.sizearray = nasize;
      const old = this.array;
      this.array = old.slice(0, nasize);
      for (let i = nasize; i < oldasize; i++) if (old[i] !== undefined) this.setslot(i + 1).val = old[i];
    }
    for (let i = (1 << oldhsize) - 1; i >= 0; i--) {
      const old = nold[i];
      if (old.val !== undefined) this.setslot(old.key).val = old.val;
    }
  }

  /** luaH_resizearray */
  resizearray(nasize: number) {
    this.resize(nasize, this.isDummy ? 0 : this.sizenode());
  }

  /** luaH_next: returns [key, value] after key, or null at the end */
  next(key: LuaValue): [LuaValue, LuaValue] | null {
    let i: number;
    if (key === undefined) i = -1;
    else {
      const k = arrayindex(key);
      if (k > 0 && k <= this.sizearray) i = k - 1;
      else {
        const n = this.findnode(key);
        if (n < 0) throw new Error("invalid key to 'next'");
        i = n + this.sizearray;
      }
    }
    for (i++; i < this.sizearray; i++) {
      if (this.array[i] !== undefined) return [i + 1, this.array[i]];
    }
    for (i -= this.sizearray; i < this.sizenode(); i++) {
      const n = this.node[i];
      if (n.val !== undefined) return [n.key, n.val];
    }
    return null;
  }

  /** luaH_getn: the border (#t) */
  length(): number {
    let j = this.sizearray;
    if (j > 0 && this.array[j - 1] === undefined) {
      let i = 0;
      while (j - i > 1) {
        const m = (i + j) >>> 1;
        if (this.array[m - 1] === undefined) j = m; else i = m;
      }
      return i;
    }
    if (this.isDummy) return j;
    // unbound_search
    let i = j; j++;
    while (this.get(j) !== undefined) {
      i = j; j *= 2;
      if (j > 2147483647) {
        i = 1;
        while (this.get(i) !== undefined) i++;
        return i - 1;
      }
    }
    while (j - i > 1) {
      const m = Math.floor((i + j) / 2);
      if (this.get(m) === undefined) j = m; else i = m;
    }
    return i;
  }
}

/** luaO_fb2int / luaO_int2fb: table constructor sizes are stored as "floating point bytes" */
export function int2fb(x: number): number {
  let e = 0;
  while (x >= 16) { x = (x + 1) >> 1; e++; }
  if (x < 8) return x;
  return ((e + 1) << 3) | (x - 8);
}
export function fb2int(x: number): number {
  const e = (x >> 3) & 31;
  if (e === 0) return x;
  return ((x & 7) + 8) << (e - 1);
}
