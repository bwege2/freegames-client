// dev.cpp scale_put, scale_put_trans: an image scaled into another (save game thumbnails, the end, the status bar)
import type { image } from './imlib/image.ts';

function put(im: image, screen: image, x: number, y: number, new_width: number, new_height: number, trans: boolean): void {
  new_width = (new_width << 16) >> 16;
  new_height = (new_height << 16) >> 16;
  const xstep = ((im.w << 16) / new_width) | 0, ystep = ((im.h << 16) / new_height) | 0;
  screen.AddDirty(x, y, x + new_width, y + new_height);
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  if (cx1 > cx2 || cy1 > cy2 || x > cx2 - 1 || y > cy2 - 1 || x + new_width <= cx1 || y + new_height <= cy1) return;
  let ix_start: number, iy_start: number;
  if (x < cx1) {
    ix_start = Math.imul(cx1 - x, xstep);
    new_width = ((new_width - (cx1 - x)) << 16) >> 16;
    x = cx1;
  } else ix_start = 0;
  if (x + new_width > cx2) new_width = ((new_width - (x + new_width - cx2)) << 16) >> 16;
  if (y < cy1) {
    iy_start = Math.imul(cy1 - y, ystep);
    new_height = ((new_height - (cy1 - y)) << 16) >> 16;
    y = cy1;
  } else iy_start = 0;
  if (y + new_height > cy2) new_height = ((new_height - (y + new_height - cy2)) << 16) >> 16;
  for (let iy = iy_start; new_height > 0; new_height--, y++, iy = (iy + ystep) | 0) {
    const sl1 = (iy >> 16) * im.w;
    let sl2 = y * screen.w + x;
    for (let ix = ix_start, sx = 0; sx < new_width; sx++, ix = (ix + xstep) | 0, sl2++) {
      const d = im.m_data[sl1 + (ix >> 16)];
      if (!trans || d) screen.m_data[sl2] = d;
    }
  }
}

export function scale_put(im: image, screen: image, x: number, y: number, w: number, h: number): void {
  put(im, screen, x, y, w, h, false);
}

export function scale_put_trans(im: image, screen: image, x: number, y: number, w: number, h: number): void {
  put(im, screen, x, y, w, h, true);
}
