// The original's data/ (BMPs converted losslessly by re/biniax/fetch.sh into u16 w, u16 h, RGB rows;
// the WAVs as they are).
export interface Image { w: number; h: number; rgb: Uint8Array }

export function parseImage(data: Uint8Array): Image {
  const v = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const w = v.getUint16(0, true), h = v.getUint16(2, true);
  if (data.length !== 4 + w * h * 3) throw new Error('bad image file');
  return { w, h, rgb: data.subarray(4) };
}
