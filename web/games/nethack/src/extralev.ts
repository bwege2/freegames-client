// @ts-nocheck
// NetHack 3.6.7 extralev.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { christen_monst, roguename } from './do_name.ts';
import { makemon } from './makemon.ts';
import { add_room, dodoor } from './mklev.ts';
import { curse, mksobj_at, weight } from './mkobj.ts';
import { somex, somey } from './mkroom.ts';
import { impossible } from './pline.ts';
import { rn2, rnd } from './rnd.ts';
import { struct_rogueroom } from './structs.ts';
import { $arr, $at2, $sarr, $sat, G, S } from './rt/index.ts';
import { ARROW, BOW, CORR, DBWALL, DOWN, D_NODOOR, FAKE_AMULET_OF_YENDOR, FALSE, FOOD_RATION, LEFT, MACE, NO_MM_FLAGS, OROOM, PLATE_MAIL, PM_GHOST, RIGHT, RING_MAIL, SCORR, TRUE, TWO_HANDED_SWORD, UP } from './consts.ts';

let r: any;

function roguejoin(x1: number, y1: number, x2: number, y2: number, horiz: number): void {
  let x = 0;
  let y = 0;
  let middle = 0;
  if (horiz) {
    middle = x1 + rn2(x2 - x1 + 1);
    for (x = x1 < middle ? x1 : middle; x <= (x1 > middle ? x1 : middle); ++x) {
      corr(x, y1);
    }
    for (y = y1 < y2 ? y1 : y2; y <= (y1 > y2 ? y1 : y2); ++y) {
      corr(middle, y);
    }
    for (x = middle < x2 ? middle : x2; x <= (middle > x2 ? middle : x2); ++x) {
      corr(x, y2);
    }
  } else {
    middle = y1 + rn2(y2 - y1 + 1);
    for (y = y1 < middle ? y1 : middle; y <= (y1 > middle ? y1 : middle); ++y) {
      corr(x1, y);
    }
    for (x = x1 < x2 ? x1 : x2; x <= (x1 > x2 ? x1 : x2); ++x) {
      corr(x, middle);
    }
    for (y = middle < y2 ? middle : y2; y <= (middle > y2 ? middle : y2); ++y) {
      corr(x2, y);
    }
  }
}

async function roguecorr(x: number, y: number, dir: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let fromx = 0;
  let fromy = 0;
  let tox = 0;
  let toy = 0;
  if (dir === DOWN) {
    ($t1 = $at2(r, x, y), $t1.doortable = ($t1.doortable & ~DOWN) & 0xff);
    if (!$at2(r, x, y).real) {
      fromx = $at2(r, x, y).rlx;
      fromy = $at2(r, x, y).rly;
      fromx += 1 + 26 * x;
      fromy += 7 * y;
    } else {
      fromx = $at2(r, x, y).rlx + rn2($at2(r, x, y).dx);
      fromy = $at2(r, x, y).rly + $at2(r, x, y).dy;
      fromx += 1 + 26 * x;
      fromy += 7 * y;
      if (!($at2(G.level.locations, fromx, fromy).typ && $at2(G.level.locations, fromx, fromy).typ <= DBWALL)) {
        await impossible(S("down: no wall at %d,%d?"), fromx, fromy);
      }
      await dodoor(fromx, fromy, $sat(G.rooms, $at2(r, x, y).nroom));
      $at2(G.level.locations, fromx, fromy).flags = (D_NODOOR) & 31;
      ++fromy;
    }
    if (y >= 2) {
      await impossible(S("down door from %d,%d going nowhere?"), x, y);
      return;
    }
    ++y;
    ($t2 = $at2(r, x, y), $t2.doortable = ($t2.doortable & ~UP) & 0xff);
    if (!$at2(r, x, y).real) {
      tox = $at2(r, x, y).rlx;
      toy = $at2(r, x, y).rly;
      tox += 1 + 26 * x;
      toy += 7 * y;
    } else {
      tox = $at2(r, x, y).rlx + rn2($at2(r, x, y).dx);
      toy = $at2(r, x, y).rly - 1;
      tox += 1 + 26 * x;
      toy += 7 * y;
      if (!($at2(G.level.locations, tox, toy).typ && $at2(G.level.locations, tox, toy).typ <= DBWALL)) {
        await impossible(S("up: no wall at %d,%d?"), tox, toy);
      }
      await dodoor(tox, toy, $sat(G.rooms, $at2(r, x, y).nroom));
      $at2(G.level.locations, tox, toy).flags = (D_NODOOR) & 31;
      --toy;
    }
    roguejoin(fromx, fromy, tox, toy, FALSE);
    return;
  } else if (dir === RIGHT) {
    ($t3 = $at2(r, x, y), $t3.doortable = ($t3.doortable & ~RIGHT) & 0xff);
    if (!$at2(r, x, y).real) {
      fromx = $at2(r, x, y).rlx;
      fromy = $at2(r, x, y).rly;
      fromx += 1 + 26 * x;
      fromy += 7 * y;
    } else {
      fromx = $at2(r, x, y).rlx + $at2(r, x, y).dx;
      fromy = $at2(r, x, y).rly + rn2($at2(r, x, y).dy);
      fromx += 1 + 26 * x;
      fromy += 7 * y;
      if (!($at2(G.level.locations, fromx, fromy).typ && $at2(G.level.locations, fromx, fromy).typ <= DBWALL)) {
        await impossible(S("down: no wall at %d,%d?"), fromx, fromy);
      }
      await dodoor(fromx, fromy, $sat(G.rooms, $at2(r, x, y).nroom));
      $at2(G.level.locations, fromx, fromy).flags = (D_NODOOR) & 31;
      ++fromx;
    }
    if (x >= 2) {
      await impossible(S("right door from %d,%d going nowhere?"), x, y);
      return;
    }
    ++x;
    ($t4 = $at2(r, x, y), $t4.doortable = ($t4.doortable & ~LEFT) & 0xff);
    if (!$at2(r, x, y).real) {
      tox = $at2(r, x, y).rlx;
      toy = $at2(r, x, y).rly;
      tox += 1 + 26 * x;
      toy += 7 * y;
    } else {
      tox = $at2(r, x, y).rlx - 1;
      toy = $at2(r, x, y).rly + rn2($at2(r, x, y).dy);
      tox += 1 + 26 * x;
      toy += 7 * y;
      if (!($at2(G.level.locations, tox, toy).typ && $at2(G.level.locations, tox, toy).typ <= DBWALL)) {
        await impossible(S("left: no wall at %d,%d?"), tox, toy);
      }
      await dodoor(tox, toy, $sat(G.rooms, $at2(r, x, y).nroom));
      $at2(G.level.locations, tox, toy).flags = (D_NODOOR) & 31;
      --tox;
    }
    roguejoin(fromx, fromy, tox, toy, TRUE);
    return;
  } else {
    await impossible(S("corridor in direction %d?"), dir);
  }
}

function miniwalk(x: number, y: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any;
  let q = 0;
  let dir = 0;
  let dirs = new Int32Array(4);
  while (1) {
    q = 0;
    if (x > 0 && !($at2(r, x, y).doortable & LEFT) && (!$at2(r, x - 1, y).doortable || !rn2(10))) {
      dirs[q++] = 0;
    }
    if (x < 2 && !($at2(r, x, y).doortable & RIGHT) && (!$at2(r, x + 1, y).doortable || !rn2(10))) {
      dirs[q++] = 1;
    }
    if (y > 0 && !($at2(r, x, y).doortable & UP) && (!$at2(r, x, y - 1).doortable || !rn2(10))) {
      dirs[q++] = 2;
    }
    if (y < 2 && !($at2(r, x, y).doortable & DOWN) && (!$at2(r, x, y + 1).doortable || !rn2(10))) {
      dirs[q++] = 3;
    }
    if (!q) {
      return;
    }
    dir = dirs[rn2(q)];
    switch (dir) {
    case 0:
      ($t1 = $at2(r, x, y), $t1.doortable = ($t1.doortable | LEFT) & 0xff);
      --x;
      ($t2 = $at2(r, x, y), $t2.doortable = ($t2.doortable | RIGHT) & 0xff);
      break;
    case 1:
      ($t3 = $at2(r, x, y), $t3.doortable = ($t3.doortable | RIGHT) & 0xff);
      ++x;
      ($t4 = $at2(r, x, y), $t4.doortable = ($t4.doortable | LEFT) & 0xff);
      break;
    case 2:
      ($t5 = $at2(r, x, y), $t5.doortable = ($t5.doortable | UP) & 0xff);
      --y;
      ($t6 = $at2(r, x, y), $t6.doortable = ($t6.doortable | DOWN) & 0xff);
      break;
    case 3:
      ($t7 = $at2(r, x, y), $t7.doortable = ($t7.doortable | DOWN) & 0xff);
      ++y;
      ($t8 = $at2(r, x, y), $t8.doortable = ($t8.doortable | UP) & 0xff);
      break;
    }
    miniwalk(x, y);
  }
}

export async function makeroguerooms(): Promise<void> {
  let x = 0;
  let y = 0;
  G.nroom = 0;
  for (y = 0; y < 3; ++y) {
    for (x = 0; x < 3; ++x) {
      if (!rn2(5) && (G.nroom || x < 2 && y < 2)) {
        $at2(r, x, y).real = FALSE;
        $at2(r, x, y).rlx = rn2(22) + 2 << 24 >> 24;
        $at2(r, x, y).rly = rn2(y === 2 ? 4 : 3) + 2 << 24 >> 24;
      } else {
        $at2(r, x, y).real = TRUE;
        $at2(r, x, y).dx = rn2(22) + 2 << 24 >> 24;
        $at2(r, x, y).dy = rn2(y === 2 ? 4 : 3) + 2 << 24 >> 24;
        $at2(r, x, y).rlx = rnd(23 - $at2(r, x, y).dx + 1) << 24 >> 24;
        $at2(r, x, y).rly = rnd((y === 2 ? 5 : 4) - $at2(r, x, y).dy + 1) << 24 >> 24;
        ++G.nroom;
      }
      $at2(r, x, y).doortable = 0;
    }
  }
  miniwalk(rn2(3), rn2(3));
  G.nroom = 0;
  for (y = 0; y < 3; ++y) {
    for (x = 0; x < 3; ++x) {
      if ($at2(r, x, y).real) {
        let lowx = 0;
        let lowy = 0;
        let hix = 0;
        let hiy = 0;
        $at2(r, x, y).nroom = G.nroom;
        G.smeq[G.nroom] = G.nroom;
        lowx = 1 + 26 * x + $at2(r, x, y).rlx;
        lowy = 7 * y + $at2(r, x, y).rly;
        hix = 1 + 26 * x + $at2(r, x, y).rlx + $at2(r, x, y).dx - 1;
        hiy = 7 * y + $at2(r, x, y).rly + $at2(r, x, y).dy - 1;
        await add_room(lowx, lowy, hix, hiy, (!rn2(7) ? 1 : 0) << 24 >> 24, OROOM, FALSE);
      }
    }
  }
  for (y = 0; y < 3; ++y) {
    for (x = 0; x < 3; ++x) {
      if ($at2(r, x, y).doortable & DOWN) {
        await roguecorr(x, y, DOWN);
      }
      if ($at2(r, x, y).doortable & RIGHT) {
        await roguecorr(x, y, RIGHT);
      }
      if ($at2(r, x, y).doortable & LEFT) {
        await impossible(S("left end of %d, %d never connected?"), x, y);
      }
      if ($at2(r, x, y).doortable & UP) {
        await impossible(S("up end of %d, %d never connected?"), x, y);
      }
    }
  }
}

export function corr(x: number, y: number): void {
  if (rn2(50)) {
    $at2(G.level.locations, x, y).typ = CORR;
  } else {
    $at2(G.level.locations, x, y).typ = SCORR;
  }
}

export async function makerogueghost(): Promise<void> {
  let ghost = null;
  let ghostobj = null;
  let croom = null;
  let x = 0;
  let y = 0;
  if (!G.nroom) {
    return;
  }
  croom = $sat(G.rooms, rn2(G.nroom));
  x = somex(croom);
  y = somey(croom);
  if (!(ghost = await makemon($sat(G.mons, PM_GHOST), x, y, NO_MM_FLAGS))) {
    return;
  }
  ghost.msleeping = 1;
  ghost = await christen_monst(ghost, roguename());
  if (rn2(4)) {
    ghostobj = await mksobj_at(FOOD_RATION, x, y, FALSE, FALSE);
    ghostobj.quan = rnd(7);
    ghostobj.owt = await weight(ghostobj) >>> 0;
  }
  if (rn2(2)) {
    ghostobj = await mksobj_at(MACE, x, y, FALSE, FALSE);
    ghostobj.spe = rnd(3) << 24 >> 24;
    if (rn2(4)) {
      await curse(ghostobj);
    }
  } else {
    ghostobj = await mksobj_at(TWO_HANDED_SWORD, x, y, FALSE, FALSE);
    ghostobj.spe = rnd(5) - 2 << 24 >> 24;
    if (rn2(4)) {
      await curse(ghostobj);
    }
  }
  ghostobj = await mksobj_at(BOW, x, y, FALSE, FALSE);
  ghostobj.spe = 1;
  if (rn2(4)) {
    await curse(ghostobj);
  }
  ghostobj = await mksobj_at(ARROW, x, y, FALSE, FALSE);
  ghostobj.spe = 0;
  ghostobj.quan = rn2(10) + 25;
  ghostobj.owt = await weight(ghostobj) >>> 0;
  if (rn2(4)) {
    await curse(ghostobj);
  }
  if (rn2(2)) {
    ghostobj = await mksobj_at(RING_MAIL, x, y, FALSE, FALSE);
    ghostobj.spe = rn2(3) << 24 >> 24;
    if (!rn2(3)) {
      ghostobj.oerodeproof = (TRUE) & 1;
    }
    if (rn2(4)) {
      await curse(ghostobj);
    }
  } else {
    ghostobj = await mksobj_at(PLATE_MAIL, x, y, FALSE, FALSE);
    ghostobj.spe = rnd(5) - 2 << 24 >> 24;
    if (!rn2(3)) {
      ghostobj.oerodeproof = (TRUE) & 1;
    }
    if (rn2(4)) {
      await curse(ghostobj);
    }
  }
  if (rn2(2)) {
    ghostobj = await mksobj_at(FAKE_AMULET_OF_YENDOR, x, y, TRUE, FALSE);
    ghostobj.known = (TRUE) & 1;
  }
}

export function $init(): void {
  r = $arr(3, () => $sarr(struct_rogueroom, 3));
}
