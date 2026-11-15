// Compares two state dumps (dump.ts / re/lincity/oracle/dump.c) and describes the first differences.
const FIELDS = ['population', 'flags', 'reserves', 'int_1', 'int_2', 'int_3', 'int_4', 'int_5', 'int_6', 'int_7'];

export function compareDumps(a: Uint8Array, b: Uint8Array, max = 6): string[] {
  const out: string[] = [];
  const dva = new DataView(a.buffer, a.byteOffset, a.byteLength);
  const dvb = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const wa = dva.getInt32(4, true), ha = dva.getInt32(8, true);
  const wb = dvb.getInt32(4, true), hb = dvb.getInt32(8, true);
  if (wa !== wb || ha !== hb) return [`window ${wa}x${ha} (original) vs ${wb}x${hb} (port)`];
  let o = 12;
  // the screen
  let n = 0;
  for (let i = 0; i < wa * ha; i++) {
    if (a[o + i] !== b[o + i]) {
      if (n < max) out.push(`pixel ${i % wa},${Math.floor(i / wa)}: original ${a[o + i]}, port ${b[o + i]}`);
      n++;
    }
  }
  if (n) out.push(`${n} pixels differ`);
  o += wa * ha;
  // the map
  n = 0;
  const names = ['type', 'group', 'pollution', 'info'];
  for (let i = 0; i < 480000; i++) {
    if (a[o + i] !== b[o + i]) {
      if (n < max) {
        let what: string;
        if (i < 20000) what = `type[${Math.floor(i / 2 / 100)}][${(i / 2 | 0) % 100}]`;
        else if (i < 40000) what = `group[${Math.floor((i - 20000) / 2 / 100)}][${((i - 20000) / 2 | 0) % 100}]`;
        else if (i < 80000) what = `pollution[${Math.floor((i - 40000) / 4 / 100)}][${((i - 40000) / 4 | 0) % 100}]`;
        else {
          const k = (i - 80000) >> 2;
          const p = Math.floor(k / 10);
          what = `info[${Math.floor(p / 100)}][${p % 100}].${FIELDS[k % 10]}`;
        }
        const ia = o + (i & ~3), ib = ia;
        out.push(`map ${what}: original ${dva.getInt32(ia, true)}, port ${dvb.getInt32(ib, true)} (bytes ${a[o + i]} vs ${b[o + i]})`);
      }
      n++;
    }
  }
  void names;
  if (n) out.push(`${n} map bytes differ`);
  o += 480000;
  // the rest: ints (and the palette at the end)
  const len = Math.min(a.length, b.length);
  n = 0;
  for (let i = o; i + 4 <= len; i += 4) {
    const x = dva.getInt32(i, true), y = dvb.getInt32(i, true);
    if (x !== y) {
      if (n < max) out.push(`global word ${(i - o) / 4}: original ${x}, port ${y}`);
      n++;
    }
  }
  if (a.length !== b.length) out.push(`dump sizes ${a.length} (original) vs ${b.length} (port)`);
  if (n) out.push(`${n} global words differ`);
  return out;
}
