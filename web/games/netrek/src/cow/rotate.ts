// @ts-nocheck
// COW 3.3.3 rotate.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { atan2, cos, hypot, sin } from '../rt/index.ts';



export function rotate_dir(d: Ptr | null, r: number): void {
  d.a[d.o] = d.a[d.o] + r & 0xff;
}

export function rotate_coord(x: Ptr | null, y: Ptr | null, d: number, cx: number, cy: number): void {
  let ox = 0;
  let oy = 0;
  ox = x.a[x.o];
  oy = y.a[y.o];
  switch (d) {
  case 0:
    return;
  case 64:
  case -192:
    x.a[x.o] = cy - oy + cx;
    y.a[y.o] = ox - cx + cy;
    break;
  case 128:
  case -128:
    x.a[x.o] = cx - ox + cx;
    y.a[y.o] = cy - oy + cy;
    break;
  case 192:
  case -64:
    x.a[x.o] = oy - cy + cx;
    y.a[y.o] = cx - ox + cy;
    break;
  default:
    {
      let dir = 0;
      let r = 0;
      let dx = 0;
      let dy = 0;
      let rd = d * 3.1415926999999999 / 128;
      if (x.a[x.o] !== cx || y.a[y.o] !== cy) {
        dx = x.a[x.o] - cx;
        dy = cy - y.a[y.o];
        dir = atan2(dx, dy) - 3.1415926999999999 / 2;
        r = hypot(dx, dy);
        dir = dir + rd;
        x.a[x.o] = Math.trunc(r * cos(dir) + cx) | 0;
        y.a[y.o] = Math.trunc(r * sin(dir) + cy) | 0;
      }
    }
  }
}

export function $init(): void {
}
