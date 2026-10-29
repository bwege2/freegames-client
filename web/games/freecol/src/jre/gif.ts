// A GIF decoder (the first frame), synchronous: the JDK's look-and-feel icons are GIFs. Pixels as
// non-premultiplied ARGB; the transparent colour index becomes alpha 0.
export function isGIF(b: Uint8Array): boolean {
  return b.length > 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
}

export function decodeGIF(b: Uint8Array): { width: number; height: number; argb: Int32Array } {
  const u16 = (i: number) => b[i] | (b[i + 1] << 8);
  const width = u16(6), height = u16(8);
  const flags = b[10];
  let pos = 13;
  let gct: Uint8Array | null = null;
  if (flags & 0x80) {
    const n = 3 * (1 << ((flags & 7) + 1));
    gct = b.subarray(pos, pos + n);
    pos += n;
  }
  let transparent = -1;
  const argb = new Int32Array(width * height);
  while (pos < b.length) {
    const block = b[pos++];
    if (block === 0x21) {
      const label = b[pos++];
      if (label === 0xf9 && b[pos + 1] & 1) transparent = b[pos + 4];
      // skip the extension's sub-blocks
      while (b[pos]) pos += b[pos] + 1;
      pos++;
    } else if (block === 0x2c) {
      const ix = u16(pos), iy = u16(pos + 2), iw = u16(pos + 4), ih = u16(pos + 6), f = b[pos + 8];
      pos += 9;
      let ct = gct;
      if (f & 0x80) {
        const n = 3 * (1 << ((f & 7) + 1));
        ct = b.subarray(pos, pos + n);
        pos += n;
      }
      const interlaced = (f & 0x40) !== 0;
      const minCode = b[pos++];
      const data: number[] = [];
      while (b[pos]) {
        const n = b[pos++];
        for (let i = 0; i < n; i++) data.push(b[pos + i]);
        pos += n;
      }
      pos++;
      const idx = lzw(data, minCode, iw * ih);
      const rows: number[] = [];
      if (interlaced) {
        for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]]) for (let y = start; y < ih; y += step) rows.push(y);
      } else for (let y = 0; y < ih; y++) rows.push(y);
      for (let r = 0; r < ih; r++) {
        const y = rows[r];
        for (let x = 0; x < iw; x++) {
          const k = idx[r * iw + x];
          if (k === undefined || k === transparent || !ct) continue;
          const px = ix + x, py = iy + y;
          if (px < width && py < height) argb[py * width + px] = (255 << 24) | (ct[3 * k] << 16) | (ct[3 * k + 1] << 8) | ct[3 * k + 2];
        }
      }
      break; // the first image
    } else break;
  }
  return { width, height, argb };
}

function lzw(data: number[], minCode: number, count: number): number[] {
  const clear = 1 << minCode, eoi = clear + 1;
  let size = minCode + 1, next = eoi + 1;
  const prefix = new Int32Array(4096), suffix = new Uint8Array(4096), first = new Uint8Array(4096);
  for (let i = 0; i < clear; i++) {
    suffix[i] = i;
    first[i] = i;
    prefix[i] = -1;
  }
  const out: number[] = [];
  let bits = 0, acc = 0, i = 0, prev = -1;
  const emit = (code: number) => {
    const stack: number[] = [];
    for (let c = code; c >= 0; c = prefix[c]) stack.push(suffix[c]);
    for (let j = stack.length - 1; j >= 0; j--) out.push(stack[j]);
  };
  while (out.length < count) {
    while (bits < size && i < data.length) {
      acc |= data[i++] << bits;
      bits += 8;
    }
    if (bits < size) break;
    const code = acc & ((1 << size) - 1);
    acc >>= size;
    bits -= size;
    if (code === clear) {
      size = minCode + 1;
      next = eoi + 1;
      prev = -1;
      continue;
    }
    if (code === eoi) break;
    if (prev < 0) {
      emit(code);
      prev = code;
      continue;
    }
    if (code < next) {
      emit(code);
      if (next < 4096) {
        prefix[next] = prev;
        suffix[next] = first[code];
        first[next] = first[prev];
        next++;
      }
    } else {
      if (next < 4096) {
        prefix[next] = prev;
        suffix[next] = first[prev];
        first[next] = first[prev];
        next++;
      }
      emit(code);
    }
    if (next === 1 << size && size < 12) size++;
    prev = code;
  }
  return out;
}
