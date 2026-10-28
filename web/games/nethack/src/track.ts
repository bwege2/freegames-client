// @ts-nocheck
// NetHack 3.6.7 track.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { distmin } from './hacklib.ts';
import { struct_nhcoord } from './structs.ts';
import { $sadd, $sarr, $sat, $sidx, G } from './rt/index.ts';
import { UTSZ } from './consts.ts';

let utcnt: number;
let utpnt: number;
let utrack: any;

export function initrack(): void {
  utcnt = utpnt = 0;
}

export function settrack(): void {
  if (utcnt < UTSZ) {
    ++utcnt;
  }
  if (utpnt === UTSZ) {
    utpnt = 0;
  }
  utrack[utpnt].x = G.u.ux;
  utrack[utpnt].y = G.u.uy;
  ++utpnt;
}

export function gettrack(x: number, y: number): struct_nhcoord | null {
  let cnt = 0;
  let ndist = 0;
  let tc = null;
  cnt = utcnt;
  for (tc = $sat(utrack, utpnt); cnt--; ) {
    if (tc === utrack[0]) {
      tc = utrack[UTSZ - 1];
    } else {
      tc = $sadd(tc, -1);
    }
    ndist = distmin(x, y, tc.x, tc.y);
    if (ndist > 2) {
      ndist -= 2;
      cnt -= ndist;
      if (cnt <= 0) {
        return null;
      }
      if ($sidx(tc) < $sidx($sat(utrack, ndist))) {
        tc = $sadd(tc, UTSZ - ndist);
      } else {
        tc = $sadd(tc, -ndist);
      }
    } else if (ndist <= 1) {
      return ndist ? tc : null;
    }
  }
  return null;
}

export function $init(): void {
  utcnt = 0;
  utpnt = 0;
  utrack = $sarr(struct_nhcoord, 50);
}
