// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: what CGraphics_Threaded::LoadPNG (engine/client/graphics_threaded.cpp) reads with pnglite, in
// TypeScript: 8-bit truecolor PNGs with or without alpha, not interlaced, at most 8192 pixels wide and high;
// anything else is refused, as there. The browser's decoders are not used: they may premultiply alpha or
// convert colours, and the client needs the exact pixels (skins, map images).

export const FORMAT_AUTO = -1, FORMAT_RGB = 0, FORMAT_RGBA = 1, FORMAT_ALPHA = 2;

export interface CImageInfo { m_Width: number; m_Height: number; m_Format: number; m_pData: Uint8Array }

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const out = new Blob([data as BlobPart]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** decodes a PNG file as pnglite does for the client, or null (invalid format) */
export async function decodePNG(file: Uint8Array): Promise<CImageInfo | null> {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (file[i] !== sig[i]) return null;
  const dv = new DataView(file.buffer, file.byteOffset, file.byteLength);
  let p = 8;
  let w = 0, h = 0, depth = 0, ct = 0, interlace = 0;
  const idat: Uint8Array[] = [];
  while (p + 8 <= file.length) {
    const len = dv.getUint32(p);
    const type = String.fromCharCode(file[p + 4], file[p + 5], file[p + 6], file[p + 7]);
    const body = file.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = dv.getUint32(p + 8);
      h = dv.getUint32(p + 12);
      depth = body[8];
      ct = body[9];
      interlace = body[12];
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || (ct !== 2 && ct !== 6) || w > 2 << 12 || h > 2 << 12 || interlace || !w || !h) return null;
  const bpp = ct === 6 ? 4 : 3;
  const total = idat.reduce((n, b) => n + b.length, 0);
  const z = new Uint8Array(total);
  let o = 0;
  for (const b of idat) {
    z.set(b, o);
    o += b.length;
  }
  const raw = await inflate(z);
  const stride = w * bpp;
  if (raw.length < h * (stride + 1)) return null;
  const out = new Uint8Array(w * h * bpp);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1, dst = y * stride, prev = dst - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x >= bpp && y > 0 ? out[prev + x - bpp] : 0;
      const v = raw[src + x];
      let r: number;
      switch (ft) {
        case 0: r = v; break;
        case 1: r = v + a; break;
        case 2: r = v + b; break;
        case 3: r = v + ((a + b) >> 1); break;
        case 4: r = v + paeth(a, b, c); break;
        default: return null;
      }
      out[dst + x] = r & 0xff;
    }
  }
  return { m_Width: w, m_Height: h, m_Format: ct === 6 ? FORMAT_RGBA : FORMAT_RGB, m_pData: out };
}
