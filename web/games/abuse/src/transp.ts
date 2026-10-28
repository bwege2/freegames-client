// transp.cpp: an image put over the screen, its colour 0 pixels darkening (remapping) what is below
import type { image } from './imlib/image.ts';

/** table: 256 bytes, the remap for the screen pixels under the image's transparent pixels */
export function transp_put(im: image, screen: image, table: Uint8Array, x: number, y: number): void {
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  let xs = 0, ys = 0, xl = im.Size().x, yl = im.Size().y;
  if (x < cx1) {
    const chop = cx1 - x;
    xs += chop;
    xl -= chop;
    x += chop;
  }
  if (y < cy1) {
    const chop = cy1 - y;
    ys += chop;
    yl -= chop;
    y += chop;
  }
  if (x + xl >= cx2) xl = cx2 - 1 - x;
  if (y + yl >= cy2) yl = cy2 - 1 - y;

  if (xl < 0 || yl < 0) return;
  screen.AddDirty(x, y, x + xl, y + yl);

  const ye = ys + yl;
  const xe = xs + xl;

  const id = im.m_data, sd = screen.m_data;
  const iw = im.Size().x, sw = screen.Size().x;
  let isl = im.scan_line(ys) + xs;
  let ssl = screen.scan_line(y) + x;

  for (let iy = ys; iy < ye; iy++, y++, isl += iw, ssl += sw) {
    let s = ssl, i = isl;
    for (let ix = xs; ix < xe; ix++, s++, i++) {
      if (id[i]) sd[s] = id[i];
      else sd[s] = table[sd[s]];
    }
  }
}
