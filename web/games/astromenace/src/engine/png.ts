// A PNG reader for the converted textures (8-bit RGB or RGBA, as re/astromenace/tools/convert.py writes
// them): the pixels exactly as stored, without the browser's colour management or premultiplication.
// freegames project, 2026 (GPL-3.0-or-later).

export interface Png { width: number; height: number; channels: number; pixels: Uint8Array }

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(ds));
  return new Uint8Array(await out.arrayBuffer());
}

export async function decodePng(buf: Uint8Array): Promise<Png> {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = 8;
  let width = 0, height = 0, type = 0;
  const idat: Uint8Array[] = [];
  while (p < buf.length) {
    const len = dv.getUint32(p);
    const name = String.fromCharCode(buf[p + 4], buf[p + 5], buf[p + 6], buf[p + 7]);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (name === 'IHDR') {
      width = dv.getUint32(p + 8);
      height = dv.getUint32(p + 12);
      if (buf[p + 16] !== 8) throw new Error('PNG: only 8 bit');
      type = buf[p + 17];
    } else if (name === 'IDAT') {
      idat.push(data);
    } else if (name === 'IEND') {
      break;
    }
    p += 12 + len;
  }
  const channels = type === 6 ? 4 : type === 2 ? 3 : type === 4 ? 2 : 1;
  const all = new Uint8Array(idat.reduce((n, d) => n + d.length, 0));
  let o = 0;
  for (const d of idat) {
    all.set(d, o);
    o += d.length;
  }
  const raw = await inflate(all);
  const stride = width * channels;
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? row[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = src[x];
      switch (f) {
        case 1: v += a; break;
        case 2: v += b; break;
        case 3: v += (a + b) >> 1; break;
        case 4: {
          const pp = a + b - c;
          const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
      }
      row[x] = v & 255;
    }
  }
  if (channels === 1 || channels === 2) {
    const out = new Uint8Array(width * height * (channels + 2));
    for (let i = 0; i < width * height; i++) {
      const g = px[i * channels];
      out.set(channels === 1 ? [g, g, g] : [g, g, g, px[i * 2 + 1]], i * (channels + 2));
    }
    return { width, height, channels: channels + 2, pixels: out };
  }
  return { width, height, channels, pixels: px };
}
