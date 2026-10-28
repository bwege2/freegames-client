// @ts-nocheck
// NetHack 3.6.7 rnd.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { sgn } from './hacklib.ts';
import { struct_isaac64_ctx, struct_rnglist_t } from './structs.ts';
import { $sarrOf, G, RND, rn2_on_display_rng } from './rt/index.ts';


let rnglist: any;

export function rn2(x: number): number {
  return RND(x);
}

export function rnl(x: number): number {
  let i = 0;
  let adjustment = 0;
  adjustment = G.u.uluck + G.u.moreluck;
  if (x <= 15) {
    adjustment = Math.imul((Math.abs(adjustment) + 1) / 3 | 0, sgn(adjustment));
  }
  i = RND(x);
  if (adjustment && rn2(37 + Math.abs(adjustment))) {
    i -= adjustment;
    if (i < 0) {
      i = 0;
    } else if (i >= x) {
      i = x - 1;
    }
  }
  return i;
}

export function rnd(x: number): number {
  x = RND(x) + 1;
  return x;
}

export function d(n: number, x: number): number {
  let tmp = n;
  while (n--) {
    tmp += RND(x);
  }
  return tmp;
}

export function rne(x: number): number {
  let tmp = 0;
  let utmp = 0;
  utmp = G.u.ulevel < 15 ? 5 : G.u.ulevel / 3 | 0;
  tmp = 1;
  while (tmp < utmp && !rn2(x)) {
    ++tmp;
  }
  return tmp;
}

export function rnz(i: number): number {
  let x = i;
  let tmp = 1000;
  tmp += rn2(1000);
  tmp = tmp * rne(4);
  if (rn2(2)) {
    x = x * tmp;
    x = Math.trunc(x / 1000);
  } else {
    x = x * 1000;
    x = Math.trunc(x / tmp);
  }
  return x | 0;
}

export function $init(): void {
  rnglist = $sarrOf([struct_rnglist_t.$of(rn2, 0, struct_isaac64_ctx.$of(0, new Float64Array(256), new Float64Array(256))), struct_rnglist_t.$of(rn2_on_display_rng, 0, struct_isaac64_ctx.$of(0, new Float64Array(256), new Float64Array(256)))]);
}
