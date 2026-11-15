// The X cursor the original shows while the bulldozer is selected (XC_pirate, module_buttons.c): the
// glyphs "pirate" and "pirate_mask" of the X.Org cursor font (font-cursor-misc 1.0.4, cursor.bdf;
// "These \"glyphs\" are unencumbered"), black on white, hot spot at the glyph's origin.
const PIRATE = [0x0780, 0x0fc0, 0x1fe0, 0x3330, 0x3330, 0x1fe0, 0x0fc0, 0x0780, 0x8784, 0x8786, 0x4308, 0x3870,
  0x0780, 0x1fe2, 0xf03e, 0x8004];
const MASK = [0x0fc0, 0x1fe0, 0x3ff0, 0x7ff8, 0x7ff8, 0x3ff0, 0x1fe0, 0x8fc1, 0x8fc7, 0xcfcf, 0xf79c, 0x7878,
  0x0780, 0x7fe3, 0xffff, 0xf03e];
/** BBX 16 16 -7 -4: the origin is 7 pixels in from the left, 12 down from the top */
const HOT_X = 7, HOT_Y = 12;

let url = '';
export function pirateCursor(): string {
  if (!url) {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const g = c.getContext('2d')!;
    const img = g.createImageData(16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const bit = 0x8000 >> x;
        const o = (y * 16 + x) * 4;
        if (MASK[y] & bit) {
          const v = PIRATE[y] & bit ? 0 : 255;
          img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
          img.data[o + 3] = 255;
        }
      }
    }
    g.putImageData(img, 0, 0);
    url = `url(${c.toDataURL()}) ${HOT_X} ${HOT_Y}, crosshair`;
  }
  return url;
}
