// @ts-nocheck
// NetHack 3.6.7 worm.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { newsym, show_glyph } from './display.ts';
import { Monnam, mon_nam } from './do_name.ts';
import { panic } from './end.ts';
import { dist2, distmin, s_suffix } from './hacklib.ts';
import { clone_mon } from './makemon.ts';
import { mattacku } from './mhitu.ts';
import { You, impossible, pline } from './pline.ts';
import { mread } from './restore.ts';
import { d, rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { goodpos } from './teleport.ts';
import { struct_monst, struct_wseg } from './structs.ts';
import { $rd, $u64, $wr, G, P, S, free, rn2_on_display_rng } from './rt/index.ts';
import { BLINDED, COLNO, DETECT_MONSTERS, FALSE, HALLUC, HALLUC_RES, INFRAVISION, MAX_NUM_WORMS, MHPMAX, ROWNO, SEE_INVIS, TELEPAT, TRUE, WARN_OF_MON } from './consts.ts';


export function get_wormno(): number {
  let new_wormno = 1;
  while (new_wormno < MAX_NUM_WORMS) {
    if (!G.wheads[new_wormno]) {
      return new_wormno;
    }
    ++new_wormno;
  }
  return 0;
}

export async function initworm(worm: struct_monst | null, wseg_count: number): Promise<void> {
  let seg = null;
  let new_tail = await create_worm_tail(wseg_count);
  let wnum = worm.wormno | 0;
  if (new_tail) {
    G.wtails[wnum] = new_tail;
    for (seg = new_tail; seg.nseg; seg = seg.nseg) {
      ;
    }
    G.wheads[wnum] = seg;
  } else {
    G.wtails[wnum] = G.wheads[wnum] = seg = new struct_wseg();
    seg.nseg = null;
    seg.wx = worm.mx;
    seg.wy = worm.my;
  }
  G.wgrowtime[wnum] = 0;
}

async function toss_wsegs(curr: struct_wseg | null, display_update: number): Promise<void> {
  let seg = null;
  while (curr) {
    seg = curr.nseg;
    if (curr.wx) {
      G.level.monsters[curr.wx][curr.wy] = null;
      if (display_update) {
        await newsym(curr.wx, curr.wy);
      }
    }
    free(curr);
    curr = seg;
  }
}

async function shrink_worm(wnum: number): Promise<void> {
  let seg = null;
  if (G.wtails[wnum] === G.wheads[wnum]) {
    return;
  }
  seg = G.wtails[wnum];
  G.wtails[wnum] = seg.nseg;
  seg.nseg = null;
  await toss_wsegs(seg, TRUE);
}

export async function worm_move(worm: struct_monst | null): Promise<void> {
  let seg = null;
  let new_seg = null;
  let wnum = worm.wormno | 0;
  seg = G.wheads[wnum];
  G.level.monsters[seg.wx][seg.wy] = worm;
  await newsym(seg.wx, seg.wy);
  new_seg = new struct_wseg();
  new_seg.wx = worm.mx;
  new_seg.wy = worm.my;
  new_seg.nseg = null;
  seg.nseg = new_seg;
  G.wheads[wnum] = new_seg;
  if (G.wgrowtime[wnum] <= G.moves) {
    if (!G.wgrowtime[wnum]) {
      G.wgrowtime[wnum] = G.moves + rnd(5);
    } else {
      G.wgrowtime[wnum] += rn2(15) + 3;
    }
    worm.mhp += 3;
    if (worm.mhp > MHPMAX) {
      worm.mhp = MHPMAX;
    }
    if (worm.mhp > worm.mhpmax) {
      worm.mhpmax = worm.mhp;
    }
  } else {
    await shrink_worm(wnum);
  }
}

export async function worm_nomove(worm: struct_monst | null): Promise<void> {
  await shrink_worm(worm.wormno | 0);
  if (worm.mhp > 3) {
    worm.mhp -= 3;
  } else {
    worm.mhp = 1;
  }
}

export async function wormgone(worm: struct_monst | null): Promise<void> {
  let wnum = worm.wormno | 0;
  worm.wormno = 0;
  await toss_wsegs(G.wtails[wnum], TRUE);
  G.wheads[wnum] = G.wtails[wnum] = null;
}

export async function wormhitu(worm: struct_monst | null): Promise<void> {
  let wnum = worm.wormno | 0;
  let seg = null;
  for (seg = G.wtails[wnum]; seg; seg = seg.nseg) {
    if (dist2(seg.wx, seg.wy, G.u.ux, G.u.uy) < 3) {
      if (await mattacku(worm)) {
        return;
      }
    }
  }
}

export async function cutworm(worm: struct_monst | null, x: number, y: number, cuttier: number): Promise<void> {
  let curr = null;
  let new_tail = null;
  let new_worm = null;
  let wnum = worm.wormno | 0;
  let cut_chance = 0;
  let new_wnum = 0;
  if (!wnum) {
    return;
  }
  if (x === worm.mx && y === worm.my) {
    return;
  }
  cut_chance = rnd(20);
  if (cuttier) {
    cut_chance += 10;
  }
  if (cut_chance < 17) {
    return;
  }
  curr = G.wtails[wnum];
  while (curr.wx !== x || curr.wy !== y) {
    curr = curr.nseg;
    if (!curr) {
      await impossible(S("cutworm: no segment at (%d,%d)"), x, y);
      return;
    }
  }
  if (curr === G.wtails[wnum]) {
    await shrink_worm(wnum);
    return;
  }
  new_tail = G.wtails[wnum];
  G.wtails[wnum] = curr.nseg;
  curr.nseg = null;
  new_worm = null;
  new_wnum = worm.m_lev >= 3 && !rn2(3) ? get_wormno() : 0;
  if (new_wnum) {
    G.level.monsters[x][y] = null;
    new_worm = await clone_mon(worm, x, y);
  }
  if (!new_worm) {
    G.level.monsters[x][y] = worm;
    if (G.context.mon_moving) {
      if ((worm.wormno | 0 ? worm_known(worm) : $rd(G.viz_array.a[G.viz_array.o + worm.my], worm.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && worm && worm.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + worm.my], worm.mx) & 1 ? 1 : 0) && ((!worm.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !worm.mundetected) || (!((worm.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(worm.mx, worm.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & worm.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & worm.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === worm.data))) {
        await pline(S("Part of %s tail has been cut off."), s_suffix(await mon_nam(worm)));
      }
    } else {
      await You(S("cut part of the tail off of %s."), await mon_nam(worm));
    }
    await toss_wsegs(new_tail, TRUE);
    if (worm.mhp > 1) {
      worm.mhp = worm.mhp / 2 | 0;
    }
    return;
  }
  new_worm.wormno = (new_wnum >>> 0) & 31;
  new_worm.mcloned = 0;
  worm.m_lev = (worm.m_lev - 2 >>> 0 > 3 ? worm.m_lev - 2 >>> 0 : 3) & 0xff;
  new_worm.m_lev = worm.m_lev;
  new_worm.mhpmax = new_worm.mhp = d(new_worm.m_lev, 8);
  worm.mhpmax = d(worm.m_lev, 8);
  if (worm.mhpmax < worm.mhp) {
    worm.mhp = worm.mhpmax;
  }
  G.wtails[new_wnum] = new_tail;
  G.wheads[new_wnum] = curr;
  G.wgrowtime[new_wnum] = 0;
  await place_wsegs(new_worm, worm);
  if (G.context.mon_moving) {
    await pline(S("%s is cut in half."), await Monnam(worm));
  } else {
    await You(S("cut %s in half."), await mon_nam(worm));
  }
}

export async function see_wsegs(worm: struct_monst | null): Promise<void> {
  let curr = G.wtails[worm.wormno];
  while (curr !== G.wheads[worm.wormno]) {
    await newsym(curr.wx, curr.wy);
    curr = curr.nseg;
  }
}

export async function detect_wsegs(worm: struct_monst | null, use_detection_glyph: number): Promise<void> {
  let num = 0;
  let curr = G.wtails[worm.wormno];
  let what_tail = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : 327;
  while (curr !== G.wheads[worm.wormno]) {
    num = use_detection_glyph ? what_tail + (1 + (382 + (382 + 0))) : worm.mtame ? what_tail + (382 + 0) : what_tail + 0;
    await show_glyph(curr.wx, curr.wy, num);
    curr = curr.nseg;
  }
}

export async function save_worm(fd: number, mode: number): Promise<void> {
  let i = 0;
  const count = new Int32Array(1);
  let curr = null;
  let temp = null;
  if (mode & (1 | 2)) {
    for (i = 1; i < MAX_NUM_WORMS; ++i) {
      for (count[0] = 0, curr = G.wtails[i]; curr; curr = curr.nseg) {
        ++count[0];
      }
      await bwrite(fd, P(count, 0), 4);
      if (count[0]) {
        for (curr = G.wtails[i]; curr; curr = curr.nseg) {
          await bwrite(fd, P(curr, "wx"), 1);
          await bwrite(fd, P(curr, "wy"), 1);
        }
      }
    }
    await bwrite(fd, P(G.wgrowtime), 256);
  }
  if (mode & 4) {
    for (i = 1; i < MAX_NUM_WORMS; ++i) {
      if (!(curr = G.wtails[i])) {
        continue;
      }
      while (curr) {
        temp = curr.nseg;
        free(curr);
        curr = temp;
      }
      G.wheads[i] = G.wtails[i] = null;
    }
  }
}

export async function rest_worm(fd: number): Promise<void> {
  let i = 0;
  let j = 0;
  const count = new Int32Array(1);
  let curr = null;
  let temp = null;
  for (i = 1; i < MAX_NUM_WORMS; ++i) {
    await mread(fd, P(count, 0), 4);
    if (!count[0]) {
      continue;
    }
    for (curr = null, j = 0; j < count[0]; ++j) {
      temp = new struct_wseg();
      temp.nseg = null;
      await mread(fd, P(temp, "wx"), 1);
      await mread(fd, P(temp, "wy"), 1);
      if (curr) {
        curr.nseg = temp;
      } else {
        G.wtails[i] = temp;
      }
      curr = temp;
    }
    G.wheads[i] = curr;
  }
  await mread(fd, P(G.wgrowtime), 256);
}

export async function place_wsegs(worm: struct_monst | null, oldworm: struct_monst | null): Promise<void> {
  let curr = G.wtails[worm.wormno];
  while (curr !== G.wheads[worm.wormno]) {
    let x = curr.wx;
    let y = curr.wy;
    if (oldworm) {
      if ((!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) === oldworm) {
        G.level.monsters[x][y] = null;
      } else {
        await impossible(S("placing worm seg <%i,%i> over another mon"), x, y);
      }
    }
    G.level.monsters[x][y] = worm;
    curr = curr.nseg;
  }
}

export async function sanity_check_worm(worm: struct_monst | null): Promise<void> {
  let curr = null;
  if (!worm) {
    await panic(S("no worm!"));
  }
  if (!worm.wormno) {
    await panic(S("not a worm?!"));
  }
  curr = G.wtails[worm.wormno];
  while (curr !== G.wheads[worm.wormno]) {
    if (curr.wx) {
      if (!isok(curr.wx, curr.wy)) {
        await panic(S("worm seg not isok"));
      }
      if (G.level.monsters[curr.wx][curr.wy] !== worm) {
        await panic(S("worm not at seg location"));
      }
    }
    curr = curr.nseg;
  }
}

export async function remove_worm(worm: struct_monst | null): Promise<void> {
  let curr = G.wtails[worm.wormno];
  while (curr) {
    if (curr.wx) {
      G.level.monsters[curr.wx][curr.wy] = null;
      await newsym(curr.wx, curr.wy);
      curr.wx = 0;
    }
    curr = curr.nseg;
  }
}

export async function place_worm_tail_randomly(worm: struct_monst | null, x: number, y: number): Promise<void> {
  let $t1: any, $t2: any;
  let wnum = worm.wormno | 0;
  let curr = G.wtails[wnum];
  let new_tail = null;
  let ox = x;
  let oy = y;
  if (wnum && (!G.wtails[wnum] || !G.wheads[wnum])) {
    await impossible(S("place_worm_tail_randomly: wormno is set without a tail!"));
    return;
  }
  G.wheads[wnum] = new_tail = curr;
  curr = curr.nseg;
  new_tail.nseg = null;
  new_tail.wx = x;
  new_tail.wy = y;
  while (curr) {
    const nx = new Int8Array(1);
    const ny = new Int8Array(1);
    let tryct = 0;
    do {
      random_dir(ox, oy, P(nx, 0), P(ny, 0));
    } while (!goodpos(nx[0], ny[0], worm, 0) && ($t2 = tryct, tryct = $t2 + 1 << 24 >> 24, $t2) < 50);
    if (tryct < 50) {
      G.level.monsters[nx[0]][ny[0]] = worm;
      curr.wx = ox = nx[0];
      curr.wy = oy = ny[0];
      G.wtails[wnum] = curr;
      curr = curr.nseg;
      G.wtails[wnum].nseg = new_tail;
      new_tail = G.wtails[wnum];
      await newsym(nx[0], ny[0]);
    } else {
      await toss_wsegs(curr, FALSE);
      curr = null;
    }
  }
}

function random_dir(x: number, y: number, nx: Ptr | null, ny: Ptr | null): void {
  nx.a[nx.o] = x + (x > 1 ? x < COLNO - 1 ? rn2(3) - 1 : -rn2(2) : rn2(2)) << 24 >> 24;
  if (nx.a[nx.o] !== x) {
    ny.a[ny.o] = y + (y > 0 ? y < ROWNO - 1 ? rn2(3) - 1 : -rn2(2) : rn2(2)) << 24 >> 24;
  } else {
    ny.a[ny.o] = y + (y > 0 ? y < ROWNO - 1 ? rn2(2) ? 1 : -1 : -1 : 1) << 24 >> 24;
  }
}

export function size_wseg(worm: struct_monst | null): number {
  return $u64(count_wsegs(worm)) * 16 | 0;
}

export function count_wsegs(mtmp: struct_monst | null): number {
  let i = 0;
  let curr = null;
  if (mtmp.wormno) {
    for (curr = G.wtails[mtmp.wormno].nseg; curr; curr = curr.nseg) {
      ++i;
    }
  }
  return i;
}

async function create_worm_tail(num_segs: number): Promise<struct_wseg | null> {
  let i = 0;
  let new_tail = null;
  let curr = null;
  if (!num_segs) {
    return null;
  }
  new_tail = curr = new struct_wseg();
  curr.nseg = null;
  curr.wx = 0;
  curr.wy = 0;
  while (i < num_segs) {
    curr.nseg = new struct_wseg();
    curr = curr.nseg;
    curr.nseg = null;
    curr.wx = 0;
    curr.wy = 0;
    ++i;
  }
  return new_tail;
}

export function worm_known(worm: struct_monst | null): number {
  let curr = G.wtails[worm.wormno];
  while (curr) {
    if ($rd(G.viz_array.a[G.viz_array.o + curr.wy], curr.wx) & 2) {
      return TRUE;
    }
    curr = curr.nseg;
  }
  return FALSE;
}

export async function worm_cross(x1: number, y1: number, x2: number, y2: number): Promise<number> {
  let worm = null;
  let curr = null;
  let wnxt = null;
  if (distmin(x1, y1, x2, y2) !== 1) {
    await impossible(S("worm_cross checking for non-adjacent location?"));
    return FALSE;
  }
  if (x1 === x2 || y1 === y2) {
    return FALSE;
  }
  worm = !!G.level.monsters[x1][y2] ? G.level.monsters[x1][y2] : null;
  if (!worm || (!!G.level.monsters[x2][y1] ? G.level.monsters[x2][y1] : null) !== worm) {
    return FALSE;
  }
  for (curr = G.wtails[worm.wormno]; curr; curr = wnxt) {
    wnxt = curr.nseg;
    if (!wnxt) {
      break;
    }
    if (curr.wx === x1 && curr.wy === y2) {
      return (wnxt.wx === x2 && wnxt.wy === y1 ? 1 : 0) << 24 >> 24;
    }
    if (curr.wx === x2 && curr.wy === y1) {
      return (wnxt.wx === x1 && wnxt.wy === y2 ? 1 : 0) << 24 >> 24;
    }
  }
  return FALSE;
}

export function wseg_at(worm: struct_monst | null, x: number, y: number): number {
  let res = 0;
  if (worm && worm.wormno | 0 && (!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) === worm) {
    let curr = null;
    let i = 0;
    let n = 0;
    let wx = x << 24 >> 24;
    let wy = y << 24 >> 24;
    for (i = 0, curr = G.wtails[worm.wormno]; curr; curr = curr.nseg) {
      if (curr.wx === wx && curr.wy === wy) {
        break;
      }
      ++i;
    }
    for (n = i; curr; curr = curr.nseg) {
      ++n;
    }
    res = n - i;
  }
  return res;
}

export function $init(): void {
  G.wheads = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  G.wtails = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  G.wgrowtime = new Float64Array(32);
}
