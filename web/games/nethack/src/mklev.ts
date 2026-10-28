// @ts-nocheck
// NetHack 3.6.7 mklev.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { getbones } from './bones.ts';
import { isok } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { buried_ball_to_punishment } from './dig.ts';
import { flush_screen, newsym, set_wall_state } from './display.ts';
import { Can_fall_thru, In_V_tower, In_hell, In_mines, In_quest, Is_botlevel, Is_branchlev, Is_special, assign_level, at_dgn_entrance, depth, dungeon_branch, dunlev, dunlevs_in_dungeon, find_level, init_dungeons, init_mapseen, insert_branch, level_difficulty, on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { make_engr_at, make_grave, random_engraving, wipe_engr_at } from './engrave.ts';
import { makerogueghost, makeroguerooms } from './extralev.ts';
import { debugcore } from './files.ts';
import { in_rooms, invocation_pos } from './hack.ts';
import { reseed_random } from './hacklib.ts';
import { sobj_at } from './invent.ts';
import { makemon, mkclass, set_mimic_sym } from './makemon.ts';
import { bound_digging, makemaz, mazexy, mkportal, wallification } from './mkmaze.ts';
import { add_to_buried, curse, dealloc_obj, mkcorpstat, mkgold, mkobj, mkobj_at, mksobj, mksobj_at, obj_extract_self, place_object, weight } from './mkobj.ts';
import { antholemon, inside_room, mkroom, somex, somexy, somey } from './mkroom.ts';
import { minliquid, seemimic } from './mon.ts';
import { oinit } from './o_init.ts';
import { nh_getenv } from './options.ts';
import { You, impossible, pline, pline_The } from './pline.ts';
import { init_rect, rnd_rect } from './rect.ts';
import { clear_regions } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { obfree } from './shk.ts';
import { check_room, create_room, dig_corridor, fill_room } from './sp_lev.ts';
import { deltrap, maketrap, mintrap, reset_utrap, t_at } from './trap.ts';
import { does_block, unblock_point } from './vision.ts';
import { fracture_rock } from './zap.ts';
import { struct_branch, struct_mkroom, struct_nhcoord, struct_rm } from './structs.ts';
import { $at2, $rd, $sadd, $sat, $sdiff, $wr, G, P, S, qsort, rn2_on_display_rng, sprintf, strcat } from './rt/index.ts';
import { ALTAR, ANTHOLE, ARROW, ARROW_TRAP, A_LAWFUL, BARRACKS, BEAR_TRAP, BEEHIVE, BELL, BLCORNER, BOULDER, BRCORNER, BR_NO_END1, BR_NO_END2, BR_PORTAL, CHEST, COCKNEST, COLNO, CORPSE, CORPSTAT_INIT, CORR, COULD_SEE, COURT, DART, DART_TRAP, DBWALL, DOOR, DOORMAX, DRAWBRIDGE_UP, DUST, D_CLOSED, D_ISOPEN, D_LOCKED, D_NODOOR, D_TRAPPED, FALSE, FIRE_TRAP, FOOD_CLASS, FOUNTAIN, GEM_CLASS, GOLD_PIECE, G_GONE, HOLE, HWALL, IN_SIGHT, IRONBARS, KELP_FROND, LANDMINE, LARGE_BOX, LA_DOWN, LA_UP, LEPREHALL, LEVEL_TELEP, MAGIC_PORTAL, MARK, MAXNROFROOMS, MM_NOGRP, MOAT, MORGUE, NO_MM_FLAGS, NO_TRAP, OROOM, PIT, PM_COCKATRICE, PM_DWARF, PM_ELF, PM_GIANT_MIMIC, PM_GIANT_SPIDER, PM_GNOME, PM_HUMAN, PM_KILLER_BEE, PM_LARGE_MIMIC, PM_LEPRECHAUN, PM_ORC, PM_SMALL_MIMIC, PM_SOLDIER, POLY_TRAP, POOL, RANDOM_CLASS, ROCK, ROCKTRAP, ROLLING_BOULDER_TRAP, ROOM, ROOMOFFSET, ROWNO, RUST_TRAP, SCORR, SCR_TELEPORTATION, SDOOR, SHARED, SHOPBASE, SINK, SLP_GAS_TRAP, SPIKED_PIT, SQKY_BOARD, STAIRS, STATUE, STATUE_TRAP, STONE, SWAMP, S_HUMAN, S_MIMIC, S_stone, TALLOW_CANDLE, TELEP_TRAP, TEMPLE, TLCORNER, TOOL_CLASS, TRAPDOOR, TRAPNUM, TRCORNER, TRUE, TT_BURIEDBALL, VAULT, VIBRATING_SQUARE, VWALL, WAX_CANDLE, WEAPON_CLASS, WEB, W_NONDIGGABLE, ZOO } from './consts.ts';

let vault_x: any;
let vault_y: any;
let made_branch: number;
let trap_engravings: any;
let clear_level_structures$zerorm: struct_rm;

function do_comp(vx: any, vy: any): number {
  let x = null;
  let y = null;
  x = vx;
  y = vy;
  if (x.lx < y.lx) {
    return -1;
  }
  return x.lx > y.lx ? 1 : 0;
}

function finddpos(cc: struct_nhcoord | null, xl: number, yl: number, xh: number, yh: number): void {
  let $g = 0;
  let x = 0;
  let y = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x = rn2(xh - xl + 1) + xl << 24 >> 24;
      y = rn2(yh - yl + 1) + yl << 24 >> 24;
      if (okdoor(x, y)) {
        { $g = 1; continue $L; }
      }
      for (x = xl; x <= xh; x = x + 1 << 24 >> 24) {
        for (y = yl; y <= yh; y = y + 1 << 24 >> 24) {
          if (okdoor(x, y)) {
            { $g = 1; continue $L; }
          }
        }
      }
      for (x = xl; x <= xh; x = x + 1 << 24 >> 24) {
        for (y = yl; y <= yh; y = y + 1 << 24 >> 24) {
          if ($at2(G.level.locations, x, y).typ === DOOR || $at2(G.level.locations, x, y).typ === SDOOR) {
            { $g = 1; continue $L; }
          }
        }
      }
      x = xl;
      y = yh;
    case 1: // gotit
      cc.x = x;
      cc.y = y;
      return;
    }
    break;
  }
}

export async function sort_rooms(): Promise<void> {
  await qsort(G.rooms[0], G.nroom >>> 0, 216, do_comp);
}

async function do_room_or_subroom(croom: struct_mkroom | null, lowx: number, lowy: number, hix: number, hiy: number, lit: number, rtype: number, special: number, is_room: number): Promise<void> {
  let $t1: any, $t2: any;
  let x = 0;
  let y = 0;
  let lev = null;
  if (!lowx) {
    ++lowx;
  }
  if (!lowy) {
    ++lowy;
  }
  if (hix >= COLNO - 1) {
    hix = COLNO - 2;
  }
  if (hiy >= ROWNO - 1) {
    hiy = ROWNO - 2;
  }
  if (lit) {
    for (x = lowx - 1; x <= hix + 1; ++x) {
      lev = $sat(G.level.locations[x], lowy - 1 > 0 ? lowy - 1 : 0);
      for (y = lowy - 1; y <= hiy + 1; ++y) {
        ($t1 = lev, lev = $sadd($t1, 1), $t1).lit = 1;
      }
    }
    croom.rlit = 1;
  } else {
    croom.rlit = 0;
  }
  croom.lx = lowx << 24 >> 24;
  croom.hx = hix << 24 >> 24;
  croom.ly = lowy << 24 >> 24;
  croom.hy = hiy << 24 >> 24;
  croom.rtype = rtype;
  croom.doorct = 0;
  croom.fdoor = G.doorindex << 24 >> 24;
  croom.irregular = FALSE;
  croom.nsubrooms = 0;
  croom.sbrooms[0] = null;
  if (!special) {
    for (x = lowx - 1; x <= hix + 1; ++x) {
      for (y = lowy - 1; y <= hiy + 1; y += hiy - lowy + 2) {
        $at2(G.level.locations, x, y).typ = HWALL;
        $at2(G.level.locations, x, y).horizontal = 1;
      }
    }
    for (x = lowx - 1; x <= hix + 1; x += hix - lowx + 2) {
      for (y = lowy; y <= hiy; ++y) {
        $at2(G.level.locations, x, y).typ = VWALL;
        $at2(G.level.locations, x, y).horizontal = 0;
      }
    }
    for (x = lowx; x <= hix; ++x) {
      lev = $sat(G.level.locations[x], lowy);
      for (y = lowy; y <= hiy; ++y) {
        ($t2 = lev, lev = $sadd($t2, 1), $t2).typ = ROOM;
      }
    }
    if (is_room) {
      $at2(G.level.locations, lowx - 1, lowy - 1).typ = TLCORNER;
      $at2(G.level.locations, hix + 1, lowy - 1).typ = TRCORNER;
      $at2(G.level.locations, lowx - 1, hiy + 1).typ = BLCORNER;
      $at2(G.level.locations, hix + 1, hiy + 1).typ = BRCORNER;
    } else {
      await wallification(lowx - 1, lowy - 1, hix + 1, hiy + 1);
    }
  }
}

export async function add_room(lowx: number, lowy: number, hix: number, hiy: number, lit: number, rtype: number, special: number): Promise<void> {
  let croom = null;
  croom = $sat(G.rooms, G.nroom);
  await do_room_or_subroom(croom, lowx, lowy, hix, hiy, lit, rtype, special, TRUE);
  croom = $sadd(croom, 1);
  croom.hx = -1;
  ++G.nroom;
}

export async function add_subroom(proom: struct_mkroom | null, lowx: number, lowy: number, hix: number, hiy: number, lit: number, rtype: number, special: number): Promise<void> {
  let $t1: any, $t2: any;
  let croom = null;
  croom = $sadd(G.subrooms, G.nsubroom);
  await do_room_or_subroom(croom, lowx, lowy, hix, hiy, lit, rtype, special, FALSE);
  proom.sbrooms[($t2 = proom.nsubrooms, proom.nsubrooms = $t2 + 1 << 24 >> 24, $t2)] = croom;
  croom = $sadd(croom, 1);
  croom.hx = -1;
  ++G.nsubroom;
}

async function makerooms(): Promise<void> {
  let tried_vault = FALSE;
  while (G.nroom < MAXNROFROOMS && rnd_rect()) {
    if (G.nroom >= (MAXNROFROOMS / 6 | 0) && rn2(2) && !tried_vault) {
      tried_vault = TRUE;
      if (await create_room(-1, -1, 2, 2, -1, -1, VAULT, 1)) {
        vault_x[0] = G.rooms[G.nroom].lx;
        vault_y[0] = G.rooms[G.nroom].ly;
        G.rooms[G.nroom].hx = -1;
      }
    } else if (!await create_room(-1, -1, -1, -1, -1, -1, OROOM, -1)) {
      return;
    }
  }
  return;
}

async function join(a: number, b: number, nxcor: number): Promise<void> {
  let cc = new struct_nhcoord();
  let tt = new struct_nhcoord();
  let org = new struct_nhcoord();
  let dest = new struct_nhcoord();
  let tx = 0;
  let ty = 0;
  let xx = 0;
  let yy = 0;
  let croom = null;
  let troom = null;
  let dx = 0;
  let dy = 0;
  croom = $sat(G.rooms, a);
  troom = $sat(G.rooms, b);
  if (troom.hx < 0 || croom.hx < 0 || G.doorindex >= DOORMAX) {
    return;
  }
  if (troom.lx > croom.hx) {
    dx = 1;
    dy = 0;
    xx = croom.hx + 1 << 24 >> 24;
    tx = troom.lx - 1 << 24 >> 24;
    finddpos(cc, xx, croom.ly, xx, croom.hy);
    finddpos(tt, tx, troom.ly, tx, troom.hy);
  } else if (troom.hy < croom.ly) {
    dy = -1;
    dx = 0;
    yy = croom.ly - 1 << 24 >> 24;
    finddpos(cc, croom.lx, yy, croom.hx, yy);
    ty = troom.hy + 1 << 24 >> 24;
    finddpos(tt, troom.lx, ty, troom.hx, ty);
  } else if (troom.hx < croom.lx) {
    dx = -1;
    dy = 0;
    xx = croom.lx - 1 << 24 >> 24;
    tx = troom.hx + 1 << 24 >> 24;
    finddpos(cc, xx, croom.ly, xx, croom.hy);
    finddpos(tt, tx, troom.ly, tx, troom.hy);
  } else {
    dy = 1;
    dx = 0;
    yy = croom.hy + 1 << 24 >> 24;
    ty = troom.ly - 1 << 24 >> 24;
    finddpos(cc, croom.lx, yy, croom.hx, yy);
    finddpos(tt, troom.lx, ty, troom.hx, ty);
  }
  xx = cc.x;
  yy = cc.y;
  tx = tt.x - dx << 24 >> 24;
  ty = tt.y - dy << 24 >> 24;
  if (nxcor && $at2(G.level.locations, xx + dx, yy + dy).typ) {
    return;
  }
  if (okdoor(xx, yy) || !nxcor) {
    await dodoor(xx, yy, croom);
  }
  org.x = xx + dx << 24 >> 24;
  org.y = yy + dy << 24 >> 24;
  dest.x = tx;
  dest.y = ty;
  if (!await dig_corridor(org, dest, nxcor, G.level.flags.arboreal | 0 ? ROOM : CORR, STONE)) {
    return;
  }
  if (okdoor(tt.x, tt.y) || !nxcor) {
    await dodoor(tt.x, tt.y, troom);
  }
  if (G.smeq[a] < G.smeq[b]) {
    G.smeq[b] = G.smeq[a];
  } else {
    G.smeq[a] = G.smeq[b];
  }
}

export async function makecorridors(): Promise<void> {
  let a = 0;
  let b = 0;
  let i = 0;
  let any = TRUE;
  for (a = 0; a < G.nroom - 1; ++a) {
    await join(a, a + 1, FALSE);
    if (!rn2(50)) {
      break;
    }
  }
  for (a = 0; a < G.nroom - 2; ++a) {
    if (G.smeq[a] !== G.smeq[a + 2]) {
      await join(a, a + 2, FALSE);
    }
  }
  for (a = 0; any && a < G.nroom; ++a) {
    any = FALSE;
    for (b = 0; b < G.nroom; ++b) {
      if (G.smeq[a] !== G.smeq[b]) {
        await join(a, b, FALSE);
        any = TRUE;
      }
    }
  }
  if (G.nroom > 2) {
    for (i = rn2(G.nroom) + 4; i; --i) {
      a = rn2(G.nroom);
      b = rn2(G.nroom - 2);
      if (b >= a) {
        b += 2;
      }
      await join(a, b, TRUE);
    }
  }
}

export function add_door(x: number, y: number, aroom: struct_mkroom | null): void {
  let broom = null;
  let tmp = 0;
  let i = 0;
  if (aroom.doorct === 0) {
    aroom.fdoor = G.doorindex << 24 >> 24;
  }
  aroom.doorct = aroom.doorct + 1 << 24 >> 24;
  for (tmp = G.doorindex; tmp > aroom.fdoor; --tmp) {
    G.doors[tmp].$cp(G.doors[tmp - 1]);
  }
  for (i = 0; i < G.nroom; ++i) {
    broom = $sat(G.rooms, i);
    if (broom !== aroom && broom.doorct && broom.fdoor >= aroom.fdoor) {
      broom.fdoor = broom.fdoor + 1 << 24 >> 24;
    }
  }
  for (i = 0; i < G.nsubroom; ++i) {
    broom = $sadd(G.subrooms, i);
    if (broom !== aroom && broom.doorct && broom.fdoor >= aroom.fdoor) {
      broom.fdoor = broom.fdoor + 1 << 24 >> 24;
    }
  }
  ++G.doorindex;
  G.doors[aroom.fdoor].x = x << 24 >> 24;
  G.doors[aroom.fdoor].y = y << 24 >> 24;
}

async function dosdoor(x: number, y: number, aroom: struct_mkroom | null, type: number): Promise<void> {
  let $t1: any, $t2: any;
  let shdoor = ($rd(in_rooms(x, y, SHOPBASE)) ? TRUE : FALSE) << 24 >> 24;
  if (!($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL)) {
    type = DOOR;
  }
  $at2(G.level.locations, x, y).typ = type << 24 >> 24;
  if (type === DOOR) {
    if (!rn2(3)) {
      if (!rn2(5)) {
        $at2(G.level.locations, x, y).flags = (D_ISOPEN) & 31;
      } else if (!rn2(6)) {
        $at2(G.level.locations, x, y).flags = (D_LOCKED) & 31;
      } else {
        $at2(G.level.locations, x, y).flags = (D_CLOSED) & 31;
      }
      if (($at2(G.level.locations, x, y).flags | 0) !== D_ISOPEN && !shdoor && level_difficulty() >= 5 && !rn2(25)) {
        ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | D_TRAPPED) >>> 0) & 31);
      }
    } else {
      $at2(G.level.locations, x, y).flags = ((shdoor ? D_ISOPEN : D_NODOOR) >>> 0) & 31;
    }
    if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
      $at2(G.level.locations, x, y).flags = (D_NODOOR) & 31;
    }
    if (($at2(G.level.locations, x, y).flags | 0) & D_TRAPPED) {
      let mtmp = null;
      if (level_difficulty() >= 9 && !rn2(5) && !(G.mvitals[PM_SMALL_MIMIC].mvflags & G_GONE && G.mvitals[PM_LARGE_MIMIC].mvflags & G_GONE && G.mvitals[PM_GIANT_MIMIC].mvflags & G_GONE)) {
        $at2(G.level.locations, x, y).flags = (D_NODOOR) & 31;
        mtmp = await makemon(await mkclass(S_MIMIC, 0), x, y, NO_MM_FLAGS);
        if (mtmp) {
          await set_mimic_sym(mtmp);
        }
      }
    }
  } else {
    if (shdoor || !rn2(5)) {
      $at2(G.level.locations, x, y).flags = (D_LOCKED) & 31;
    } else {
      $at2(G.level.locations, x, y).flags = (D_CLOSED) & 31;
    }
    if (!shdoor && level_difficulty() >= 4 && !rn2(20)) {
      ($t2 = $at2(G.level.locations, x, y), $t2.flags = (($t2.flags | 0 | D_TRAPPED) >>> 0) & 31);
    }
  }
  add_door(x, y, aroom);
}

function place_niche(aroom: struct_mkroom | null, dy: Ptr | null, xx: Ptr | null, yy: Ptr | null): number {
  let dd = new struct_nhcoord();
  if (rn2(2)) {
    dy.a[dy.o] = 1;
    finddpos(dd, aroom.lx, aroom.hy + 1, aroom.hx, aroom.hy + 1);
  } else {
    dy.a[dy.o] = -1;
    finddpos(dd, aroom.lx, aroom.ly - 1, aroom.hx, aroom.ly - 1);
  }
  xx.a[xx.o] = dd.x;
  yy.a[yy.o] = dd.y;
  return (isok(xx.a[xx.o], yy.a[yy.o] + dy.a[dy.o]) && $at2(G.level.locations, xx.a[xx.o], yy.a[yy.o] + dy.a[dy.o]).typ === STONE && (isok(xx.a[xx.o], yy.a[yy.o] - dy.a[dy.o]) && !($at2(G.level.locations, xx.a[xx.o], yy.a[yy.o] - dy.a[dy.o]).typ >= POOL && $at2(G.level.locations, xx.a[xx.o], yy.a[yy.o] - dy.a[dy.o]).typ <= DRAWBRIDGE_UP) && !($at2(G.level.locations, xx.a[xx.o], yy.a[yy.o] - dy.a[dy.o]).typ >= STAIRS && $at2(G.level.locations, xx.a[xx.o], yy.a[yy.o] - dy.a[dy.o]).typ <= ALTAR)) ? 1 : 0) << 24 >> 24;
}

async function makeniche(trap_type: number): Promise<void> {
  let aroom = null;
  let rm = null;
  let vct = 8;
  const dy = new Int32Array(1);
  const xx = new Int32Array(1);
  const yy = new Int32Array(1);
  let ttmp = null;
  if (G.doorindex < DOORMAX) {
    while (vct--) {
      aroom = $sat(G.rooms, rn2(G.nroom));
      if (aroom.rtype !== OROOM) {
        continue;
      }
      if (aroom.doorct === 1 && rn2(5)) {
        continue;
      }
      if (!place_niche(aroom, P(dy, 0), P(xx, 0), P(yy, 0))) {
        continue;
      }
      rm = $sat(G.level.locations[xx[0]], yy[0] + dy[0]);
      if (trap_type || !rn2(4)) {
        rm.typ = SCORR;
        if (trap_type) {
          if ((trap_type === HOLE || trap_type === TRAPDOOR) && !Can_fall_thru(G.u.uz)) {
            trap_type = ROCKTRAP;
          }
          ttmp = await maketrap(xx[0], yy[0] + dy[0], trap_type);
          if (ttmp) {
            if (trap_type !== ROCKTRAP) {
              ttmp.once = 1;
            }
            if (trap_engravings[trap_type]) {
              await make_engr_at(xx[0], yy[0] - dy[0], trap_engravings[trap_type], 0, DUST);
              await wipe_engr_at(xx[0], yy[0] - dy[0], 5, FALSE);
            }
          }
        }
        await dosdoor(xx[0], yy[0], aroom, SDOOR);
      } else {
        rm.typ = CORR;
        if (rn2(7)) {
          await dosdoor(xx[0], yy[0], aroom, rn2(5) ? SDOOR : DOOR);
        } else {
          if (!rn2(5) && ($at2(G.level.locations, xx[0], yy[0]).typ && $at2(G.level.locations, xx[0], yy[0]).typ <= DBWALL)) {
            $at2(G.level.locations, xx[0], yy[0]).typ = IRONBARS;
            if (rn2(3)) {
              await mkcorpstat(CORPSE, null, await mkclass(S_HUMAN, 0), xx[0], yy[0] + dy[0], TRUE);
            }
          }
          if (!G.level.flags.noteleport) {
            await mksobj_at(SCR_TELEPORTATION, xx[0], yy[0] + dy[0], TRUE, FALSE);
          }
          if (!rn2(3)) {
            await mkobj_at(0, xx[0], yy[0] + dy[0], TRUE);
          }
        }
      }
      return;
    }
  }
}

async function make_niches(): Promise<void> {
  let ct = rnd((G.nroom >> 1) + 1);
  let dep = depth(G.u.uz);
  let ltptr = (!G.level.flags.noteleport && dep > 15 ? 1 : 0) << 24 >> 24;
  let vamp = (dep > 5 && dep < 25 ? 1 : 0) << 24 >> 24;
  while (ct--) {
    if (ltptr && !rn2(6)) {
      ltptr = FALSE;
      await makeniche(LEVEL_TELEP);
    } else if (vamp && !rn2(6)) {
      vamp = FALSE;
      await makeniche(TRAPDOOR);
    } else {
      await makeniche(NO_TRAP);
    }
  }
}

async function makevtele(): Promise<void> {
  await makeniche(TELEP_TRAP);
}

function clear_level_structures(): void {
  let $t1: any;
  let x = 0;
  let y = 0;
  let lev = null;
  for (x = 0; x < COLNO; ++x) {
    lev = $at2(G.level.locations, x, 0);
    for (y = 0; y < ROWNO; ++y) {
      ($t1 = lev, lev = $sadd($t1, 1), $t1).$cp(clear_level_structures$zerorm);
      G.level.objects[x][y] = null;
      G.level.monsters[x][y] = null;
    }
  }
  G.level.objlist = null;
  G.level.buriedobjlist = null;
  G.level.monlist = null;
  G.level.damagelist = null;
  G.level.bonesinfo = null;
  G.level.flags.nfountains = 0;
  G.level.flags.nsinks = 0;
  G.level.flags.has_shop = 0;
  G.level.flags.has_vault = 0;
  G.level.flags.has_zoo = 0;
  G.level.flags.has_court = 0;
  G.level.flags.has_morgue = (G.level.flags.graveyard = 0) & 1;
  G.level.flags.has_beehive = 0;
  G.level.flags.has_barracks = 0;
  G.level.flags.has_temple = 0;
  G.level.flags.has_swamp = 0;
  G.level.flags.noteleport = 0;
  G.level.flags.hardfloor = 0;
  G.level.flags.nommap = 0;
  G.level.flags.hero_memory = 1;
  G.level.flags.shortsighted = 0;
  G.level.flags.sokoban_rules = 0;
  G.level.flags.is_maze_lev = 0;
  G.level.flags.is_cavernous_lev = 0;
  G.level.flags.arboreal = 0;
  G.level.flags.wizard_bones = 0;
  G.level.flags.corrmaze = 0;
  G.nroom = 0;
  G.rooms[0].hx = -1;
  G.nsubroom = 0;
  G.subrooms.hx = -1;
  G.doorindex = 0;
  init_rect();
  vault_x[0] = -1;
  G.dnstair.sx = G.dnstair.sy = G.upstair.sx = G.upstair.sy = 0;
  G.sstairs.sx = G.sstairs.sy = 0;
  G.dnladder.sx = G.dnladder.sy = G.upladder.sx = G.upladder.sy = 0;
  G.dnstairs_room = G.upstairs_room = G.sstairs_room = null;
  made_branch = FALSE;
  clear_regions();
}

async function makelevel(): Promise<void> {
  let $g = 0;
  let croom = null;
  let troom = null;
  let tryct = 0;
  let x = 0;
  let y = 0;
  let tmonst = null;
  let branchp = null;
  let room_threshold = 0;
  let w = new Int8Array(1);
  let h = new Int8Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (G.dungeon_topology.d_wiz1_level.dlevel === 0) {
        await init_dungeons();
      }
      await oinit();
      clear_level_structures();
      {
        let slev = Is_special(G.u.uz);
        if (slev && !((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
          await makemaz(P(slev.proto));
          return;
        } else if (G.dungeons[G.u.uz.dnum].proto[0]) {
          await makemaz(S(""));
          return;
        } else if (In_mines(G.u.uz)) {
          await makemaz(S("minefill"));
          return;
        } else if (In_quest(G.u.uz)) {
          let fillname = new Int8Array(9);
          let loc_lev = null;
          sprintf(P(fillname), S("%s-loca"), G.urole.filecode);
          loc_lev = find_level(P(fillname));
          sprintf(P(fillname), S("%s-fil"), G.urole.filecode);
          strcat(P(fillname), G.u.uz.dlevel < loc_lev.dlevel.dlevel ? S("a") : S("b"));
          await makemaz(P(fillname));
          return;
        } else if (In_hell(G.u.uz) || rn2(5) && G.u.uz.dnum === G.dungeon_topology.d_medusa_level.dnum && depth(G.u.uz) > depth(G.dungeon_topology.d_medusa_level)) {
          await makemaz(S(""));
          return;
        }
      }
      if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
        await makeroguerooms();
        await makerogueghost();
      } else {
        await makerooms();
      }
      await sort_rooms();
      croom = $sat(G.rooms, rn2(G.nroom));
      if (!Is_botlevel(G.u.uz)) {
        await mkstairs(somex(croom), somey(croom), 0, croom);
      }
      if (G.nroom > 1) {
        troom = croom;
        croom = $sat(G.rooms, rn2(G.nroom - 1));
        if (croom === troom) {
          croom = $sadd(croom, 1);
        }
      }
      if (G.u.uz.dlevel !== 1) {
        let sx = 0;
        let sy = 0;
        do {
          sx = somex(croom) << 24 >> 24;
          sy = somey(croom) << 24 >> 24;
        } while (occupied(sx, sy));
        await mkstairs(sx, sy, 1, croom);
      }
      branchp = Is_branchlev(G.u.uz);
      room_threshold = branchp ? 4 : 3;
      if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
        { $g = 1; continue $L; }
      }
      await makecorridors();
      await make_niches();
      if (!(vault_x[0] !== -1)) { $g = 4; continue $L; }
      do {
        if (await debugcore(S("mklev.c"), 1)) {
          await pline(S("trying to make a vault..."));
        }
      } while (0);
      w[0] = 1;
      h[0] = 1;
      if (!await check_room(P(vault_x, 0), P(w, 0), P(vault_y, 0), P(h, 0), TRUE)) { $g = 6; continue $L; }
    case 2: // fill_vault
      await add_room(vault_x[0], vault_y[0], vault_x[0] + w[0], vault_y[0] + h[0], TRUE, VAULT, FALSE);
      G.level.flags.has_vault = 1;
      ++room_threshold;
      await fill_room($sat(G.rooms, G.nroom - 1), FALSE);
      await mk_knox_portal(vault_x[0] + w[0], vault_y[0] + h[0]);
      if (!G.level.flags.noteleport && !rn2(3)) {
        await makevtele();
      }
      { $g = 5; continue $L; }
    case 6:
      if (rnd_rect() && await create_room(-1, -1, 2, 2, -1, -1, VAULT, 1)) {
        vault_x[0] = G.rooms[G.nroom].lx;
        vault_y[0] = G.rooms[G.nroom].ly;
        if (await check_room(P(vault_x, 0), P(w, 0), P(vault_y, 0), P(h, 0), TRUE)) {
          { $g = 2; continue $L; }
        } else {
          G.rooms[G.nroom].hx = -1;
        }
      }
    case 5:
    case 4:
      {
        let u_depth = depth(G.u.uz);
        if (G.flags.debug && nh_getenv(S("SHOPTYPE"))) {
          await mkroom(SHOPBASE);
        } else if (u_depth > 1 && u_depth < depth(G.dungeon_topology.d_medusa_level) && G.nroom >= room_threshold && rn2(u_depth) < 3) {
          await mkroom(SHOPBASE);
        } else if (u_depth > 4 && !rn2(6)) {
          await mkroom(COURT);
        } else if (u_depth > 5 && !rn2(8) && !(G.mvitals[PM_LEPRECHAUN].mvflags & G_GONE)) {
          await mkroom(LEPREHALL);
        } else if (u_depth > 6 && !rn2(7)) {
          await mkroom(ZOO);
        } else if (u_depth > 8 && !rn2(5)) {
          await mkroom(TEMPLE);
        } else if (u_depth > 9 && !rn2(5) && !(G.mvitals[PM_KILLER_BEE].mvflags & G_GONE)) {
          await mkroom(BEEHIVE);
        } else if (u_depth > 11 && !rn2(6)) {
          await mkroom(MORGUE);
        } else if (u_depth > 12 && !rn2(8) && antholemon()) {
          await mkroom(ANTHOLE);
        } else if (u_depth > 14 && !rn2(4) && !(G.mvitals[PM_SOLDIER].mvflags & G_GONE)) {
          await mkroom(BARRACKS);
        } else if (u_depth > 15 && !rn2(6)) {
          await mkroom(SWAMP);
        } else if (u_depth > 16 && !rn2(8) && !(G.mvitals[PM_COCKATRICE].mvflags & G_GONE)) {
          await mkroom(COCKNEST);
        }
      }
    case 1: // skip0
      await place_branch(branchp, 0, 0);
      croom = G.rooms[0];
    case 7:
      if (!(croom.hx > 0)) { $g = 9; continue $L; }
      if (croom.rtype !== OROOM) {
        { $g = 8; continue $L; };
      }
      if (G.u.uhave.amulet | 0 || !rn2(3)) {
        x = somex(croom);
        y = somey(croom);
        tmonst = await makemon(null, x, y, MM_NOGRP);
        if (tmonst && tmonst.data === $sat(G.mons, PM_GIANT_SPIDER) && !occupied(x, y)) {
          await maketrap(x, y, WEB);
        }
      }
      x = 8 - (level_difficulty() / 6 | 0);
      if (x <= 1) {
        x = 2;
      }
      while (!rn2(x)) {
        await mktrap(0, 0, croom, null);
      }
      if (!rn2(3)) {
        await mkgold(0, somex(croom), somey(croom));
      }
      if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
        { $g = 3; continue $L; }
      }
      if (!rn2(10)) {
        await mkfount(0, croom);
      }
      if (!rn2(60)) {
        mksink(croom);
      }
      if (!rn2(60)) {
        mkaltar(croom);
      }
      x = 80 - depth(G.u.uz) * 2;
      if (x < 2) {
        x = 2;
      }
      if (!rn2(x)) {
        await mkgrave(croom);
      }
      if (!rn2(20)) {
        await mkcorpstat(STATUE, null, null, somex(croom), somey(croom), CORPSTAT_INIT);
      }
      if (!rn2(G.nroom * 5 / 2 | 0)) {
        await mksobj_at(rn2(3) ? LARGE_BOX : CHEST, somex(croom), somey(croom), TRUE, FALSE);
      }
      if (!rn2(27 + 3 * Math.abs(depth(G.u.uz)))) {
        let buf = new Int8Array(256);
        let mesg = await random_engraving(P(buf));
        if (mesg) {
          do {
            x = somex(croom);
            y = somey(croom);
          } while ($at2(G.level.locations, x, y).typ !== ROOM && !rn2(40));
          if (!($at2(G.level.locations, x, y).typ >= POOL && $at2(G.level.locations, x, y).typ <= DRAWBRIDGE_UP || $at2(G.level.locations, x, y).typ >= STAIRS && $at2(G.level.locations, x, y).typ <= ALTAR)) {
            await make_engr_at(x, y, mesg, 0, MARK);
          }
        }
      }
    case 3: // skip_nonrogue
      if (!rn2(3)) {
        await mkobj_at(0, somex(croom), somey(croom), TRUE);
        tryct = 0;
        while (!rn2(5)) {
          if (++tryct > 100) {
            await impossible(S("tryct overflow4"));
            break;
          }
          await mkobj_at(0, somex(croom), somey(croom), TRUE);
        }
      }
    case 8:
      croom = $sadd(croom, 1);
      { $g = 7; continue $L; }
    case 9:
    }
    break;
  }
}

export async function mineralize(kelp_pool: number, kelp_moat: number, goldprob: number, gemprob: number, skip_lvl_checks: number): Promise<void> {
  let sp = null;
  let otmp = null;
  let x = 0;
  let y = 0;
  let cnt = 0;
  if (kelp_pool < 0) {
    kelp_pool = 10;
  }
  if (kelp_moat < 0) {
    kelp_moat = 30;
  }
  if (!skip_lvl_checks && G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    return;
  }
  for (x = 2; x < COLNO - 2; ++x) {
    for (y = 1; y < ROWNO - 1; ++y) {
      if (kelp_pool && $at2(G.level.locations, x, y).typ === POOL && !rn2(kelp_pool) || kelp_moat && $at2(G.level.locations, x, y).typ === MOAT && !rn2(kelp_moat)) {
        await mksobj_at(KELP_FROND, x, y, TRUE, FALSE);
      }
    }
  }
  if (!skip_lvl_checks && (In_hell(G.u.uz) || In_V_tower(G.u.uz) || (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) || G.level.flags.arboreal | 0 || !!(sp = Is_special(G.u.uz)) && !((G.dungeon_topology.d_oracle_level.dlevel || G.dungeon_topology.d_oracle_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_oracle_level)) && (!In_mines(G.u.uz) || sp.flags.town | 0))) {
    return;
  }
  if (goldprob < 0) {
    goldprob = 20 + (depth(G.u.uz) / 3 | 0);
  }
  if (gemprob < 0) {
    gemprob = goldprob / 4 | 0;
  }
  if (!skip_lvl_checks) {
    if (In_mines(G.u.uz)) {
      goldprob = goldprob * 2;
      gemprob = gemprob * 3;
    } else if (In_quest(G.u.uz)) {
      goldprob = goldprob / 4 | 0;
      gemprob = gemprob / 6 | 0;
    }
  }
  for (x = 2; x < COLNO - 2; ++x) {
    for (y = 1; y < ROWNO - 1; ++y) {
      if ($at2(G.level.locations, x, y + 1).typ !== STONE) {
        y += 2;
      } else if ($at2(G.level.locations, x, y).typ !== STONE) {
        y += 1;
      } else if (!(($at2(G.level.locations, x, y).flags | 0) & W_NONDIGGABLE) && $at2(G.level.locations, x, y - 1).typ === STONE && $at2(G.level.locations, x + 1, y - 1).typ === STONE && $at2(G.level.locations, x - 1, y - 1).typ === STONE && $at2(G.level.locations, x + 1, y).typ === STONE && $at2(G.level.locations, x - 1, y).typ === STONE && $at2(G.level.locations, x + 1, y + 1).typ === STONE && $at2(G.level.locations, x - 1, y + 1).typ === STONE) {
        if (rn2(1000) < goldprob) {
          if (!!(otmp = await mksobj(GOLD_PIECE, FALSE, FALSE))) {
            otmp.ox = x << 24 >> 24, otmp.oy = y << 24 >> 24;
            otmp.quan = 1 + rnd(goldprob * 3);
            otmp.owt = await weight(otmp) >>> 0;
            if (!rn2(3)) {
              await add_to_buried(otmp);
            } else {
              await place_object(otmp, x, y);
            }
          }
        }
        if (rn2(1000) < gemprob) {
          for (cnt = rnd(2 + (dunlev(G.u.uz) / 3 | 0)); cnt > 0; --cnt) {
            if (!!(otmp = await mkobj(GEM_CLASS, FALSE))) {
              if (otmp.otyp === ROCK) {
                await dealloc_obj(otmp);
              } else {
                otmp.ox = x << 24 >> 24, otmp.oy = y << 24 >> 24;
                if (!rn2(3)) {
                  await add_to_buried(otmp);
                } else {
                  await place_object(otmp, x, y);
                }
              }
            }
          }
        }
      }
    }
  }
}

export async function mklev(): Promise<void> {
  let croom = null;
  let ridx = 0;
  reseed_random(rn2);
  reseed_random(rn2_on_display_rng);
  await init_mapseen(G.u.uz);
  if (await getbones()) {
    return;
  }
  G.in_mklev = TRUE;
  await makelevel();
  bound_digging();
  await mineralize(-1, -1, -1, -1, FALSE);
  G.in_mklev = FALSE;
  if (G.level.flags.has_morgue) {
    G.level.flags.graveyard = 1;
  }
  if (!G.level.flags.is_maze_lev) {
    for (croom = G.rooms[0]; croom !== $sat(G.rooms, G.nroom); croom = $sadd(croom, 1)) {
      topologize(croom);
    }
  }
  set_wall_state();
  for (ridx = 0; ridx < (Math.trunc(17712 / 216) | 0); ++ridx) {
    G.rooms[ridx].orig_rtype = G.rooms[ridx].rtype;
  }
  G.dnstairs_room = G.upstairs_room = G.sstairs_room = null;
  reseed_random(rn2);
  reseed_random(rn2_on_display_rng);
}

export function topologize(croom: struct_mkroom | null): void {
  let x = 0;
  let y = 0;
  let roomno = $sdiff(croom, G.rooms[0]) + ROOMOFFSET | 0;
  let lowx = croom.lx;
  let lowy = croom.ly;
  let hix = croom.hx;
  let hiy = croom.hy;
  let subindex = 0;
  let nsubrooms = croom.nsubrooms;
  if (($at2(G.level.locations, lowx, lowy).roomno | 0) === roomno || croom.irregular) {
    return;
  }
  {
    for (x = lowx; x <= hix; ++x) {
      for (y = lowy; y <= hiy; ++y) {
        $at2(G.level.locations, x, y).roomno = (roomno >>> 0) & 63;
      }
    }
    for (x = lowx - 1; x <= hix + 1; ++x) {
      for (y = lowy - 1; y <= hiy + 1; y += hiy - lowy + 2) {
        $at2(G.level.locations, x, y).edge = 1;
        if ($at2(G.level.locations, x, y).roomno) {
          $at2(G.level.locations, x, y).roomno = (SHARED) & 63;
        } else {
          $at2(G.level.locations, x, y).roomno = (roomno >>> 0) & 63;
        }
      }
    }
    for (x = lowx - 1; x <= hix + 1; x += hix - lowx + 2) {
      for (y = lowy; y <= hiy; ++y) {
        $at2(G.level.locations, x, y).edge = 1;
        if ($at2(G.level.locations, x, y).roomno) {
          $at2(G.level.locations, x, y).roomno = (SHARED) & 63;
        } else {
          $at2(G.level.locations, x, y).roomno = (roomno >>> 0) & 63;
        }
      }
    }
  }
  for (subindex = 0; subindex < nsubrooms; ++subindex) {
    topologize(croom.sbrooms[subindex]);
  }
}

async function find_branch_room(mp: struct_nhcoord | null): Promise<struct_mkroom | null> {
  let croom = null;
  if (G.nroom === 0) {
    await mazexy(mp);
  } else {
    if (G.nroom > 2) {
      let tryct = 0;
      do {
        croom = $sat(G.rooms, rn2(G.nroom));
      } while ((croom === G.dnstairs_room || croom === G.upstairs_room || croom.rtype !== OROOM) && ++tryct < 100);
    } else {
      croom = $sat(G.rooms, rn2(G.nroom));
    }
    do {
      if (!somexy(croom, mp)) {
        await impossible(S("Can't place branch!"));
      }
    } while (occupied(mp.x, mp.y) || $at2(G.level.locations, mp.x, mp.y).typ !== CORR && $at2(G.level.locations, mp.x, mp.y).typ !== ROOM);
  }
  return croom;
}

function pos_to_room(x: number, y: number): struct_mkroom | null {
  let i = 0;
  let curr = null;
  for (curr = G.rooms[0], i = 0; i < G.nroom; curr = $sadd(curr, 1), ++i) {
    if (inside_room(curr, x, y)) {
      return curr;
    }
  }
  ;
  return null;
}

export async function place_branch(br: struct_branch | null, x: number, y: number): Promise<void> {
  let m = new struct_nhcoord();
  let dest = null;
  let make_stairs = 0;
  let br_room = null;
  if (!br || made_branch) {
    return;
  }
  if (!x) {
    br_room = await find_branch_room(m);
    x = m.x;
    y = m.y;
  } else {
    br_room = pos_to_room(x, y);
  }
  if (on_level(br.end1, G.u.uz)) {
    make_stairs = (br.type !== BR_NO_END1 ? 1 : 0) << 24 >> 24;
    dest = br.end2;
  } else {
    make_stairs = (br.type !== BR_NO_END2 ? 1 : 0) << 24 >> 24;
    dest = br.end1;
  }
  if (br.type === BR_PORTAL) {
    await mkportal(x, y, dest.dnum, dest.dlevel);
  } else if (make_stairs) {
    G.sstairs.sx = x;
    G.sstairs.sy = y;
    G.sstairs.up = (on_level(br.end1, G.u.uz) ? br.end1_up : !br.end1_up ? 1 : 0) << 24 >> 24;
    assign_level(G.sstairs.tolev, dest);
    G.sstairs_room = br_room;
    $at2(G.level.locations, x, y).flags = ((G.sstairs.up ? LA_UP : LA_DOWN) >>> 0) & 31;
    $at2(G.level.locations, x, y).typ = STAIRS;
  }
  made_branch = TRUE;
}

function bydoor(x: number, y: number): number {
  let typ = 0;
  if (isok(x + 1, y)) {
    typ = $at2(G.level.locations, x + 1, y).typ;
    if (typ === DOOR || typ === SDOOR) {
      return TRUE;
    }
  }
  if (isok(x - 1, y)) {
    typ = $at2(G.level.locations, x - 1, y).typ;
    if (typ === DOOR || typ === SDOOR) {
      return TRUE;
    }
  }
  if (isok(x, y + 1)) {
    typ = $at2(G.level.locations, x, y + 1).typ;
    if (typ === DOOR || typ === SDOOR) {
      return TRUE;
    }
  }
  if (isok(x, y - 1)) {
    typ = $at2(G.level.locations, x, y - 1).typ;
    if (typ === DOOR || typ === SDOOR) {
      return TRUE;
    }
  }
  return FALSE;
}

export function okdoor(x: number, y: number): number {
  let near_door = bydoor(x, y);
  return ($at2(G.level.locations, x, y).typ === HWALL || $at2(G.level.locations, x, y).typ === VWALL) && G.doorindex < DOORMAX && !near_door ? 1 : 0;
}

export async function dodoor(x: number, y: number, aroom: struct_mkroom | null): Promise<void> {
  if (G.doorindex >= DOORMAX) {
    await impossible(S("DOORMAX exceeded?"));
    return;
  }
  await dosdoor(x, y, aroom, rn2(8) ? DOOR : SDOOR);
}

export function occupied(x: number, y: number): number {
  return (t_at(x, y) || $at2(G.level.locations, x, y).typ >= STAIRS && $at2(G.level.locations, x, y).typ <= ALTAR || is_lava(x, y) || is_pool(x, y) || invocation_pos(x, y) ? 1 : 0) << 24 >> 24;
}

export async function mktrap(num: number, mazeflag: number, croom: struct_mkroom | null, tm: struct_nhcoord | null): Promise<void> {
  let kind = 0;
  let t = null;
  let lvl = level_difficulty() >>> 0;
  let m = new struct_nhcoord();
  if (tm && is_pool(tm.x, tm.y)) {
    return;
  }
  if (num > 0 && num < TRAPNUM) {
    kind = num;
  } else if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    switch (rn2(7)) {
    default:
      kind = BEAR_TRAP;
      break;
    case 1:
      kind = ARROW_TRAP;
      break;
    case 2:
      kind = DART_TRAP;
      break;
    case 3:
      kind = TRAPDOOR;
      break;
    case 4:
      kind = PIT;
      break;
    case 5:
      kind = SLP_GAS_TRAP;
      break;
    case 6:
      kind = RUST_TRAP;
      break;
    }
  } else if (In_hell(G.u.uz) && !rn2(5)) {
    kind = FIRE_TRAP;
  } else {
    do {
      kind = rnd(TRAPNUM - 1);
      switch (kind) {
      case MAGIC_PORTAL:
      case VIBRATING_SQUARE:
        kind = NO_TRAP;
        break;
      case ROLLING_BOULDER_TRAP:
      case SLP_GAS_TRAP:
        if (lvl < 2) {
          kind = NO_TRAP;
        }
        break;
      case LEVEL_TELEP:
        if (lvl < 5 || G.level.flags.noteleport | 0) {
          kind = NO_TRAP;
        }
        break;
      case SPIKED_PIT:
        if (lvl < 5) {
          kind = NO_TRAP;
        }
        break;
      case LANDMINE:
        if (lvl < 6) {
          kind = NO_TRAP;
        }
        break;
      case WEB:
        if (lvl < 7) {
          kind = NO_TRAP;
        }
        break;
      case STATUE_TRAP:
      case POLY_TRAP:
        if (lvl < 8) {
          kind = NO_TRAP;
        }
        break;
      case FIRE_TRAP:
        if (!In_hell(G.u.uz)) {
          kind = NO_TRAP;
        }
        break;
      case TELEP_TRAP:
        if (G.level.flags.noteleport) {
          kind = NO_TRAP;
        }
        break;
      case HOLE:
        if (rn2(7)) {
          kind = NO_TRAP;
        }
        break;
      }
    } while (kind === NO_TRAP);
  }
  if ((kind === HOLE || kind === TRAPDOOR) && !Can_fall_thru(G.u.uz)) {
    kind = ROCKTRAP;
  }
  if (tm) {
    m.$cp(tm);
  } else {
    let tryct = 0;
    let avoid_boulder = (kind === PIT || kind === SPIKED_PIT || (kind === HOLE || kind === TRAPDOOR) ? 1 : 0) << 24 >> 24;
    do {
      if (++tryct > 200) {
        return;
      }
      if (mazeflag) {
        await mazexy(m);
      } else if (!somexy(croom, m)) {
        return;
      }
    } while (occupied(m.x, m.y) || avoid_boulder && sobj_at(BOULDER, m.x, m.y));
  }
  t = await maketrap(m.x, m.y, kind);
  kind = t ? t.ttyp | 0 : NO_TRAP;
  if (kind === WEB) {
    await makemon($sat(G.mons, PM_GIANT_SPIDER), m.x, m.y, NO_MM_FLAGS);
  }
  if (kind !== NO_TRAP && lvl <= rnd(4) >>> 0 && kind !== SQKY_BOARD && kind !== RUST_TRAP && !(kind === ROLLING_BOULDER_TRAP && t.launch.x === t.tx && t.launch.y === t.ty) && !(kind === PIT || kind === SPIKED_PIT) && kind < HOLE) {
    let otmp = null;
    let victim_mnum = 0;
    switch (kind) {
    case ARROW_TRAP:
      otmp = await mksobj(ARROW, TRUE, FALSE);
      otmp.otrapped = 0;
      break;
    case DART_TRAP:
      otmp = await mksobj(DART, TRUE, FALSE);
      break;
    case ROCKTRAP:
      otmp = await mksobj(ROCK, TRUE, FALSE);
      break;
    default:
      break;
    }
    if (otmp) {
      await place_object(otmp, m.x, m.y);
    }
    do {
      let poss_class = RANDOM_CLASS;
      switch (rn2(4)) {
      case 0:
        poss_class = WEAPON_CLASS;
        break;
      case 1:
        poss_class = TOOL_CLASS;
        break;
      case 2:
        poss_class = FOOD_CLASS;
        break;
      case 3:
        poss_class = GEM_CLASS;
        break;
      }
      otmp = await mkobj(poss_class, FALSE);
      if (otmp) {
        otmp.blessed = 0;
        otmp.cursed = 1;
        otmp.owt = await weight(otmp) >>> 0;
        await place_object(otmp, m.x, m.y);
      }
    } while (!rn2(5));
    switch (rn2(15)) {
    case 0:
      victim_mnum = PM_ELF;
      if (kind === SLP_GAS_TRAP && !(lvl <= 2 && rn2(2))) {
        victim_mnum = PM_HUMAN;
      }
      break;
    case 1:
    case 2:
      victim_mnum = PM_DWARF;
      break;
    case 3:
    case 4:
    case 5:
      victim_mnum = PM_ORC;
      break;
    case 6:
    case 7:
    case 8:
    case 9:
      victim_mnum = PM_GNOME;
      if (!rn2(10)) {
        otmp = await mksobj(rn2(4) ? TALLOW_CANDLE : WAX_CANDLE, TRUE, FALSE);
        otmp.quan = 1;
        otmp.blessed = 0;
        otmp.cursed = 1;
        otmp.owt = await weight(otmp) >>> 0;
        await place_object(otmp, m.x, m.y);
      }
      break;
    default:
      victim_mnum = PM_HUMAN;
      break;
    }
    otmp = await mkcorpstat(CORPSE, null, $sat(G.mons, victim_mnum), m.x, m.y, CORPSTAT_INIT);
    if (otmp) {
      otmp.age -= 51;
    }
  }
}

export async function mkstairs(x: number, y: number, up: number, croom: struct_mkroom | null): Promise<void> {
  if (!x) {
    await impossible(S("mkstairs:  bogus stair attempt at <%d,%d>"), x, y);
    return;
  }
  if (dunlev(G.u.uz) === 1 && up || dunlev(G.u.uz) === dunlevs_in_dungeon(G.u.uz) && !up) {
    return;
  }
  if (up) {
    G.upstair.sx = x;
    G.upstair.sy = y;
    G.upstairs_room = croom;
  } else {
    G.dnstair.sx = x;
    G.dnstair.sy = y;
    G.dnstairs_room = croom;
  }
  $at2(G.level.locations, x, y).typ = STAIRS;
  $at2(G.level.locations, x, y).flags = ((up ? LA_UP : LA_DOWN) >>> 0) & 31;
}

async function mkfount(mazeflag: number, croom: struct_mkroom | null): Promise<void> {
  let m = new struct_nhcoord();
  let tryct = 0;
  do {
    if (++tryct > 200) {
      return;
    }
    if (mazeflag) {
      await mazexy(m);
    } else if (!somexy(croom, m)) {
      return;
    }
  } while (occupied(m.x, m.y) || bydoor(m.x, m.y));
  $at2(G.level.locations, m.x, m.y).typ = FOUNTAIN;
  if (!rn2(7)) {
    $at2(G.level.locations, m.x, m.y).horizontal = 1;
  }
  G.level.flags.nfountains = G.level.flags.nfountains + 1 & 0xff;
}

function mksink(croom: struct_mkroom | null): void {
  let m = new struct_nhcoord();
  let tryct = 0;
  do {
    if (++tryct > 200) {
      return;
    }
    if (!somexy(croom, m)) {
      return;
    }
  } while (occupied(m.x, m.y) || bydoor(m.x, m.y));
  $at2(G.level.locations, m.x, m.y).typ = SINK;
  G.level.flags.nsinks = G.level.flags.nsinks + 1 & 0xff;
}

function mkaltar(croom: struct_mkroom | null): void {
  let m = new struct_nhcoord();
  let tryct = 0;
  let al = 0;
  if (croom.rtype !== OROOM) {
    return;
  }
  do {
    if (++tryct > 200) {
      return;
    }
    if (!somexy(croom, m)) {
      return;
    }
  } while (occupied(m.x, m.y) || bydoor(m.x, m.y));
  $at2(G.level.locations, m.x, m.y).typ = ALTAR;
  al = rn2(A_LAWFUL + 2) - 1 << 24 >> 24;
  $at2(G.level.locations, m.x, m.y).flags = ((al === -128 ? 0 : al === 1 ? 4 : al + 2) >>> 0) & 31;
}

async function mkgrave(croom: struct_mkroom | null): Promise<void> {
  let m = new struct_nhcoord();
  let tryct = 0;
  let otmp = null;
  let dobell = (!rn2(10) ? 1 : 0) << 24 >> 24;
  if (croom.rtype !== OROOM) {
    return;
  }
  do {
    if (++tryct > 200) {
      return;
    }
    if (!somexy(croom, m)) {
      return;
    }
  } while (occupied(m.x, m.y) || bydoor(m.x, m.y));
  await make_grave(m.x, m.y, dobell ? S("Saved by the bell!") : null);
  if (!rn2(3)) {
    let gold = await mksobj(GOLD_PIECE, TRUE, FALSE);
    gold.quan = rnd(20) + Math.imul(level_difficulty(), rnd(5));
    gold.owt = await weight(gold) >>> 0;
    gold.ox = m.x, gold.oy = m.y;
    await add_to_buried(gold);
  }
  for (tryct = rn2(5); tryct; --tryct) {
    otmp = await mkobj(RANDOM_CLASS, TRUE);
    if (!otmp) {
      return;
    }
    await curse(otmp);
    otmp.ox = m.x;
    otmp.oy = m.y;
    await add_to_buried(otmp);
  }
  if (dobell) {
    await mksobj_at(BELL, m.x, m.y, TRUE, FALSE);
  }
  return;
}

export async function mkinvokearea(): Promise<void> {
  let dist = 0;
  let xmin = G.inv_pos.x;
  let xmax = G.inv_pos.x;
  let ymin = G.inv_pos.y;
  let ymax = G.inv_pos.y;
  let i = 0;
  await pline_The(S("floor shakes violently under you!"));
  await pline_The(S("walls around you begin to bend and crumble!"));
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
  if (G.u.utrap) {
    if (G.u.utraptype === TT_BURIEDBALL) {
      await buried_ball_to_punishment();
    }
    await reset_utrap(FALSE);
  }
  await mkinvpos(xmin, ymin, 0);
  for (dist = 1; dist < 7; ++dist) {
    xmin = xmin - 1 << 24 >> 24;
    xmax = xmax + 1 << 24 >> 24;
    if (dist !== 3) {
      ymin = ymin - 1 << 24 >> 24;
      ymax = ymax + 1 << 24 >> 24;
      for (i = xmin + 1 << 24 >> 24; i < xmax; i = i + 1 << 24 >> 24) {
        await mkinvpos(i, ymin, dist);
        await mkinvpos(i, ymax, dist);
      }
    }
    for (i = ymin; i <= ymax; i = i + 1 << 24 >> 24) {
      await mkinvpos(xmin, i, dist);
      await mkinvpos(xmax, i, dist);
    }
    await flush_screen(1);
    await G.windowprocs.win_delay_output();
  }
  await You(S("are standing at the top of a stairwell leading down!"));
  await mkstairs(G.u.ux, G.u.uy, 0, null);
  await newsym(G.u.ux, G.u.uy);
  G.vision_full_recalc = 1;
}

async function mkinvpos(x: number, y: number, dist: number): Promise<void> {
  let ttmp = null;
  let otmp = null;
  let make_rocks = 0;
  let lev = $sat(G.level.locations[x], y);
  let mon = null;
  if (!(x >= 2 + 1 && x <= G.x_maze_max - 1 && y >= 2 + 1 && y <= G.y_maze_max - 1)) {
    if (dist < 7 - 2) {
      await panic(S("mkinvpos: <%d,%d> (%d) off map edge!"), x, y, dist);
    }
    return;
  }
  if (!!(ttmp = t_at(x, y))) {
    await deltrap(ttmp);
  }
  make_rocks = (dist !== 1 && dist !== 4 && dist !== 5 ? TRUE : FALSE) << 24 >> 24;
  while (!!(otmp = sobj_at(BOULDER, x, y))) {
    if (make_rocks) {
      await fracture_rock(otmp);
      make_rocks = FALSE;
    } else {
      await obj_extract_self(otmp);
      await obfree(otmp, null);
    }
  }
  lev.seenv = 0;
  lev.flags = 0;
  if (dist < 6) {
    lev.lit = (TRUE) & 1;
  }
  lev.waslit = (TRUE) & 1;
  lev.horizontal = (FALSE) & 1;
  $wr(G.viz_array.a[G.viz_array.o + y], x, (dist < 6 ? IN_SIGHT | COULD_SEE : COULD_SEE) << 24 >> 24);
  switch (dist) {
  case 1:
    if (is_pool(x, y)) {
      break;
    }
    lev.typ = ROOM;
    ttmp = await maketrap(x, y, FIRE_TRAP);
    if (ttmp) {
      ttmp.tseen = (TRUE) & 1;
    }
    break;
  case 0:
  case 2:
  case 3:
  case 6:
    lev.typ = ROOM;
    break;
  case 4:
  case 5:
    lev.typ = MOAT;
    break;
  default:
    await impossible(S("mkinvpos called with dist %d"), dist);
    break;
  }
  if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    if (mon.m_ap_type) {
      await seemimic(mon);
    }
    if (!!(ttmp = t_at(x, y))) {
      await mintrap(mon);
    } else {
      await minliquid(mon);
    }
  }
  if (!does_block(x, y, lev)) {
    unblock_point(x, y);
  }
  await newsym(x, y);
}

async function mk_knox_portal(x: number, y: number): Promise<void> {
  let source = null;
  let br = null;
  let u_depth = 0;
  br = await dungeon_branch(S("Fort Ludios"));
  if (on_level(G.dungeon_topology.d_knox_level, br.end1)) {
    source = br.end2;
  } else {
    if (Is_branchlev(G.u.uz)) {
      return;
    }
    source = br.end1;
  }
  if (source.dnum < G.n_dgns || rn2(3) && !G.flags.debug) {
    return;
  }
  if (!(G.u.uz.dnum === G.dungeon_topology.d_oracle_level.dnum && !await at_dgn_entrance(S("The Quest")) && (u_depth = depth(G.u.uz)) > 10 && u_depth < depth(G.dungeon_topology.d_medusa_level))) {
    return;
  }
  source.$cp(G.u.uz);
  await insert_branch(br, TRUE);
  do {
    if (await debugcore(S("mklev.c"), 1)) {
      await pline(S("Made knox portal."));
    }
  } while (0);
  await place_branch(br, x, y);
}

export function $init(): void {
  vault_x = new Int8Array(1);
  vault_x[0] = 0;
  vault_y = new Int8Array(1);
  vault_y[0] = 0;
  made_branch = 0;
  trap_engravings = [null,
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
S("Vlad was here"),
S("ad aerarium"),
S("ad aerarium"),
null,
null,
null,
null,
null,
null,
null];
  clear_level_structures$zerorm = struct_rm.$of(S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
}
