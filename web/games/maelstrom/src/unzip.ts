// A tiny ZIP reader for Maelstrom mod packs. The original mounts .zip files and
// replaces files under Sprites/, Images/, Sounds/, UI/ and Fonts/; the browser
// uses the same layout and extracts entries into memory. Stored and deflated
// entries are supported (the common ZIP methods).
export async function unzip(data: Uint8Array): Promise<Map<string, Uint8Array>> {
  const out = new Map<string, Uint8Array>();
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const u16 = (p: number): number => view.getUint16(p, true);
  const u32 = (p: number): number => view.getUint32(p, true);
  let eocd = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 65557); i--) {
    if (u32(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return out;
  const count = u16(eocd + 10);
  let p = u32(eocd + 16);
  for (let n = 0; n < count && p + 46 <= data.length; n++) {
    if (u32(p) !== 0x02014b50) break;
    const method = u16(p + 10);
    const compressed = u32(p + 20);
    const uncompressed = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const local = u32(p + 42);
    const name = new TextDecoder().decode(data.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith('/') || name.startsWith('__MACOSX/')) continue;
    if (local + 30 > data.length || u32(local) !== 0x04034b50) continue;
    const lName = u16(local + 26), lExtra = u16(local + 28);
    const start = local + 30 + lName + lExtra;
    const raw = data.subarray(start, start + compressed);
    if (start + compressed > data.length) continue;
    let bytes: Uint8Array;
    if (method === 0) bytes = raw.slice();
    else if (method === 8) {
      try {
        const stream = new Blob([raw.slice().buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      } catch { continue; }
    } else continue;
    if (uncompressed && bytes.length !== uncompressed) continue;
    out.set(name, bytes);
  }
  return out;
}
