// The original's images (graphics/*.tga, music/music.tga), converted losslessly by re/passage/fetch.sh
// into raw files: u16 width, u16 height (little-endian), then RGB rows from the top.
export interface Image { w: number; h: number; rgb: Uint8Array }

export const NAMES = ['tileSet', 'chest', 'characterSprite', 'characterSpriteSad', 'spouseSprite', 'chestPrize',
  'chestDust', 'heart', 'numerals', 'title', 'music'] as const;
export type AssetName = typeof NAMES[number];

export function parseImage(data: Uint8Array): Image {
  const v = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const w = v.getUint16(0, true), h = v.getUint16(2, true);
  if (data.length !== 4 + w * h * 3) throw new Error('bad image file');
  return { w, h, rgb: data.subarray(4) };
}
