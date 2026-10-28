// Compares two screenshots of the same scene (the original client's, re/teeworlds/golden/render/<scene>.png,
// and the port's): the mean absolute difference per channel, the share of pixels within a tolerance on every
// channel, and a side-by-side image (original | port | difference, the difference scaled x4).
//   node compare.mjs <original.png> <port.png> [side-by-side.png] [--tolerance 24]
// Prints one JSON line. PNGs are read and written with node:zlib (8-bit gray, RGB, RGBA, palette; no
// interlacing), so no dependencies are needed. Images of different sizes: the port's is cropped or padded
// (black) to the original's size, from the top left, and the report says so.
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

function readPng(file) {
  const b = readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file}: not a PNG`);
  let p = 8, w = 0, h = 0, depth = 0, type = 0, interlace = 0, plte = null, trns = null;
  const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), t = b.toString('latin1', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; interlace = d[12]; }
    else if (t === 'PLTE') plte = d;
    else if (t === 'tRNS') trns = d;
    else if (t === 'IDAT') idat.push(d);
    else if (t === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error(`${file}: only 8-bit, non-interlaced PNGs`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch, out = new Uint8Array(w * h * 4);
  let prev = new Uint8Array(stride), cur = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, up = prev[i], c = i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, s = x * ch;
      if (type === 2) { out[o] = cur[s]; out[o + 1] = cur[s + 1]; out[o + 2] = cur[s + 2]; out[o + 3] = 255; }
      else if (type === 6) { out[o] = cur[s]; out[o + 1] = cur[s + 1]; out[o + 2] = cur[s + 2]; out[o + 3] = cur[s + 3]; }
      else if (type === 0) { out[o] = out[o + 1] = out[o + 2] = cur[s]; out[o + 3] = 255; }
      else if (type === 4) { out[o] = out[o + 1] = out[o + 2] = cur[s]; out[o + 3] = cur[s + 1]; }
      else { const k = cur[s]; out[o] = plte[k * 3]; out[o + 1] = plte[k * 3 + 1]; out[o + 2] = plte[k * 3 + 2]; out[o + 3] = trns && k < trns.length ? trns[k] : 255; }
    }
    [prev, cur] = [cur, prev];
  }
  return { w, h, rgba: out };
}

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function chunk(type, data) {
  const t = Buffer.from(type, 'latin1'), len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  let c = 0xffffffff;
  for (const x of Buffer.concat([t, data])) c = CRC[(c ^ x) & 255] ^ (c >>> 8);
  crc.writeUInt32BE((c ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, t, data, crc]);
}
function writePng(file, w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  writeFileSync(file, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
}

const args = process.argv.slice(2);
const ti = args.indexOf('--tolerance');
const tol = ti >= 0 ? Number(args.splice(ti, 2)[1]) : 24;
const [fa, fb, fout] = args;
if (!fa || !fb) { console.error('usage: node compare.mjs <original.png> <port.png> [side-by-side.png] [--tolerance 24]'); process.exit(2); }
const A = readPng(fa), B = readPng(fb);
const w = A.w, h = A.h;
const sum = [0, 0, 0];
let within = 0;
const side = new Uint8Array(w * 3 * h * 3);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const oa = (y * w + x) * 4, inB = x < B.w && y < B.h, ob = (y * B.w + x) * 4;
    let ok = true;
    for (let c = 0; c < 3; c++) {
      const va = A.rgba[oa + c], vb = inB ? B.rgba[ob + c] : 0, d = Math.abs(va - vb);
      sum[c] += d;
      if (d > tol) ok = false;
      const row = (y * w * 3) * 3;
      side[row + x * 3 + c] = va;
      side[row + (w + x) * 3 + c] = vb;
      side[row + (2 * w + x) * 3 + c] = Math.min(255, d * 4);
    }
    if (ok) within++;
  }
}
const n = w * h;
const report = {
  original: fa, port: fb, size: [w, h], portSize: [B.w, B.h], sameSize: A.w === B.w && A.h === B.h,
  meanAbsDiff: sum.map((s) => +(s / n).toFixed(2)), tolerance: tol, withinTolerance: +(100 * within / n).toFixed(2),
};
if (fout) { writePng(fout, w * 3, h, side); report.sideBySide = fout; }
console.log(JSON.stringify(report));
