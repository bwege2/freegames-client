// @ts-nocheck
// NetHack 3.6.7 mkmaze.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { lift_covet_and_placebc, unplacebc_and_covet_placebc } from './ball.ts';
import { isok } from './cmd.ts';
import { db_under_typ, is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { christen_monst, christen_orc, hliquid, new_oname, rndorcname } from './do_name.ts';
import { migrate_to_level } from './dog.ts';
import { In_quest, Invocation_lev, Is_branchlev, Is_special, depth, dunlev, dunlevs_in_dungeon, find_level, get_level, ledger_no, on_level, u_on_newpos } from './dungeon.ts';
import { panic } from './end.ts';
import { debugcore } from './files.ts';
import { dist2, distmin, sgn, upstart } from './hacklib.ts';
import { stackobj } from './invent.ts';
import { makemon } from './makemon.ts';
import { mkstairs, mktrap, occupied, place_branch } from './mklev.ts';
import { add_to_minv, dealloc_obj, mk_tt_object, mkcorpstat, mkgold, mkobj, mkobj_at, mksobj, mksobj_at, mksobj_migr_to_species, place_object, remove_object, rndmonnum, set_corpsenm, weight } from './mkobj.ts';
import { search_special, somex, somey } from './mkroom.ts';
import { dmonsfree, elemental_clog, m_into_limbo, mnearto, mnexto, mongone } from './mon.ts';
import { poly_when_stoned } from './mondata.ts';
import { shiny_obj } from './objnam.ts';
import { fruitadd } from './options.ts';
import { Norep, impossible, pline } from './pline.ts';
import { create_gas_cloud } from './region.ts';
import { mread } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { create_secret_door, load_special } from './sp_lev.ts';
import { goodpos, rloc } from './teleport.ts';
import { deltrap, maketrap, t_at } from './trap.ts';
import { block_point, unblock_point, vision_recalc } from './vision.ts';
import { remove_worm } from './worm.ts';
import { anon_sp_lev_h_405, anon_sp_lev_h_408, struct_bubble, struct_container, struct_d_level, struct_lev_region, struct_monst, struct_nhcoord, struct_rm, struct_trap, union_str_or_len } from './structs.ts';
import { $arr, $at2, $rd, $sadd, $sat, $ta, $u64, $wr, G, P, S, atoi, free, getenv, memcpy, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp, strrchr } from './rt/index.ts';
import { AIR, BLCORNER, BOULDER, BRCORNER, CLOUD, COLNO, CONS_HERO, CONS_MON, CONS_OBJ, CONS_TRAP, CORPSE, CORPSTAT_NONE, CORR, CROSSWALL, DBWALL, DEAF, DOOR, DRAWBRIDGE_UP, FALSE, GAUNTLETS_OF_DEXTERITY, GEM_CLASS, GLOB_OF_BLACK_PUDDING, GLOB_OF_BROWN_PUDDING, GLOB_OF_GRAY_OOZE, GLOB_OF_GREEN_SLIME, GOLD_PIECE, HUGE_CHUNK_OF_MEAT, HWALL, ICE, INVPOS_DISTANCE, INVPOS_X_MARGIN, INVPOS_Y_MARGIN, IRONBARS, LANDMINE, LAVAPOOL, LEATHER_GLOVES, LEMBAS_WAFER, LONG_SWORD, LR_BRANCH, LR_DOWNSTAIR, LR_DOWNTELE, LR_PORTAL, LR_TELE, LR_UPSTAIR, LR_UPTELE, M2_ORC, MAGIC_PORTAL, MAX_BMASK, MEATBALL, MEAT_RING, MEAT_STICK, MIGR_LEFTOVERS, MIGR_RANDOM, MM_NONAME, MOAT, MON_BUBBLEMOVE, MORGUE, NO_MM_FLAGS, ORC_LEADER, OROOM, PM_MINOTAUR, PM_ORC, PM_ORC_CAPTAIN, PM_ORC_SHAMAN, POOL, RING_CLASS, ROCK, ROOM, ROWNO, SDOOR, SILVER_SABER, SKELETON_KEY, SLIME_MOLD, SPIKED_PIT, STATUE, STONE, STRANGE_OBJECT, SWIMMING, S_air, S_cloud, S_water, TALLOW_CANDLE, TDWALL, TEMPLE, TIN, TLCORNER, TLWALL, TRCORNER, TRIPE_RATION, TRUE, TRWALL, TUWALL, VIBRATING_SQUARE, VWALL, WATER, WAX_CANDLE, W_ANY, W_EAST, W_NONDIGGABLE, W_SOUTH, W_WEST, x_maze_min, y_maze_min } from './consts.ts';

let bughack: struct_lev_region;
let orcfruit: any;
let bbubbles: struct_bubble | null;
let ebubbles: struct_bubble | null;
let wportal: struct_trap | null;
let xmin: any;
let ymin: any;
let xmax: any;
let ymax: any;
let fix_wall_spines$spine_array: any;
let movebubbles$water_pos: struct_rm;
let movebubbles$air_pos: struct_rm;
let movebubbles$up: number;
let mk_bubble$bm2: any;
let mk_bubble$bm3: any;
let mk_bubble$bm4: any;
let mk_bubble$bm5: any;
let mk_bubble$bm6: any;
let mk_bubble$bm7: any;
let mk_bubble$bm8: any;
let mk_bubble$bmask: any;

function iswall(x: number, y: number): number {
  let type = 0;
  if (!isok(x, y)) {
    return 0;
  }
  type = $at2(G.level.locations, x, y).typ;
  return type && type <= DBWALL || type === DOOR || type === SDOOR || type === IRONBARS ? 1 : 0;
}

function iswall_or_stone(x: number, y: number): number {
  if (!isok(x, y)) {
    return 1;
  }
  return $at2(G.level.locations, x, y).typ === STONE || iswall(x, y) ? 1 : 0;
}

function is_solid(x: number, y: number): number {
  return (!isok(x, y) || $at2(G.level.locations, x, y).typ <= DBWALL ? 1 : 0) << 24 >> 24;
}

function extend_spine(locale: Ptr | null, wall_there: number, dx: number, dy: number): number {
  let spine = 0;
  let nx = 0;
  let ny = 0;
  nx = 1 + dx;
  ny = 1 + dy;
  if (wall_there) {
    if (dx) {
      if (locale.a[locale.o + 1][0] && locale.a[locale.o + 1][2] && locale.a[locale.o + nx][0] && locale.a[locale.o + nx][2]) {
        spine = 0;
      } else {
        spine = 1;
      }
    } else {
      if (locale.a[locale.o][1] && locale.a[locale.o + 2][1] && locale.a[locale.o][ny] && locale.a[locale.o + 2][ny]) {
        spine = 0;
      } else {
        spine = 1;
      }
    }
  } else {
    spine = 0;
  }
  return spine;
}

export async function wall_cleanup(x1: number, y1: number, x2: number, y2: number): Promise<void> {
  let type = 0;
  let x = 0;
  let y = 0;
  let lev = null;
  if (x1 < 0 || x2 >= COLNO || x1 > x2 || y1 < 0 || y2 >= ROWNO || y1 > y2) {
    await panic(S("wall_cleanup: bad bounds (%d,%d) to (%d,%d)"), x1, y1, x2, y2);
  }
  for (x = x1; x <= x2; ++x) {
    for (y = y1; y <= y2; ++y) {
      if (x >= bughack.inarea.x1 && x <= bughack.inarea.x2 && y >= bughack.inarea.y1 && y <= bughack.inarea.y2) {
        continue;
      }
      lev = $sat(G.level.locations[x], y);
      type = lev.typ & 0xff;
      if (type && type <= DBWALL && type !== DBWALL) {
        if (is_solid(x - 1, y - 1) && is_solid(x - 1, y) && is_solid(x - 1, y + 1) && is_solid(x, y - 1) && is_solid(x, y + 1) && is_solid(x + 1, y - 1) && is_solid(x + 1, y) && is_solid(x + 1, y + 1)) {
          lev.typ = STONE;
        }
      }
    }
  }
}

export async function fix_wall_spines(x1: number, y1: number, x2: number, y2: number): Promise<void> {
  let type = 0;
  let x = 0;
  let y = 0;
  let lev = null;
  let loc_f = null;
  let bits = 0;
  let locale = $arr(3, () => new Int32Array(3));
  if (x1 < 0 || x2 >= COLNO || x1 > x2 || y1 < 0 || y2 >= ROWNO || y1 > y2) {
    await panic(S("wall_extends: bad bounds (%d,%d) to (%d,%d)"), x1, y1, x2, y2);
  }
  for (x = x1; x <= x2; ++x) {
    for (y = y1; y <= y2; ++y) {
      lev = $sat(G.level.locations[x], y);
      type = lev.typ & 0xff;
      if (!(type && type <= DBWALL && type !== DBWALL)) {
        continue;
      }
      loc_f = x >= bughack.inarea.x1 && x <= bughack.inarea.x2 && y >= bughack.inarea.y1 && y <= bughack.inarea.y2 ? iswall : iswall_or_stone;
      locale[0][0] = await loc_f(x - 1, y - 1);
      locale[1][0] = await loc_f(x, y - 1);
      locale[2][0] = await loc_f(x + 1, y - 1);
      locale[0][1] = await loc_f(x - 1, y);
      locale[2][1] = await loc_f(x + 1, y);
      locale[0][2] = await loc_f(x - 1, y + 1);
      locale[1][2] = await loc_f(x, y + 1);
      locale[2][2] = await loc_f(x + 1, y + 1);
      bits = extend_spine(P(locale), iswall(x, y - 1), 0, -1) << 3 | extend_spine(P(locale), iswall(x, y + 1), 0, 1) << 2 | extend_spine(P(locale), iswall(x + 1, y), 1, 0) << 1 | extend_spine(P(locale), iswall(x - 1, y), -1, 0);
      if (bits) {
        lev.typ = fix_wall_spines$spine_array[bits];
      }
    }
  }
}

export async function wallification(x1: number, y1: number, x2: number, y2: number): Promise<void> {
  await wall_cleanup(x1, y1, x2, y2);
  await fix_wall_spines(x1, y1, x2, y2);
}

async function okay(x: number, y: number, dir: number): Promise<number> {
  do {
    switch (dir) {
    case 0:
      --y;
      break;
    case 1:
      ++x;
      break;
    case 2:
      ++y;
      break;
    case 3:
      --x;
      break;
    default:
      await panic(S("mz_move: bad direction %d"), dir);
    }
  } while (0);
  do {
    switch (dir) {
    case 0:
      --y;
      break;
    case 1:
      ++x;
      break;
    case 2:
      ++y;
      break;
    case 3:
      --x;
      break;
    default:
      await panic(S("mz_move: bad direction %d"), dir);
    }
  } while (0);
  if (x < 3 || y < 3 || x > G.x_maze_max || y > G.y_maze_max || $at2(G.level.locations, x, y).typ !== STONE) {
    return FALSE;
  }
  return TRUE;
}

function maze0xy(cc: struct_nhcoord | null): void {
  cc.x = 3 + 2 * rn2((G.x_maze_max >> 1) - 1) << 24 >> 24;
  cc.y = 3 + 2 * rn2((G.y_maze_max >> 1) - 1) << 24 >> 24;
  return;
}

export function bad_location(x: number, y: number, lx: number, ly: number, hx: number, hy: number): number {
  return (occupied(x, y) || x >= lx && x <= hx && y >= ly && y <= hy || !($at2(G.level.locations, x, y).typ === CORR && G.level.flags.is_maze_lev | 0 || $at2(G.level.locations, x, y).typ === ROOM || $at2(G.level.locations, x, y).typ === AIR) ? 1 : 0) << 24 >> 24;
}

export async function place_lregion(lx: number, ly: number, hx: number, hy: number, nlx: number, nly: number, nhx: number, nhy: number, rtype: number, lev: struct_d_level | null): Promise<void> {
  let trycnt = 0;
  let oneshot = 0;
  let x = 0;
  let y = 0;
  if (!lx) {
    if (rtype === LR_BRANCH && G.nroom) {
      await place_branch(Is_branchlev(G.u.uz), 0, 0);
      return;
    }
    lx = 1;
    hx = COLNO - 1;
    ly = 0;
    hy = ROWNO - 1;
  }
  oneshot = (lx === hx && ly === hy ? 1 : 0) << 24 >> 24;
  for (trycnt = 0; trycnt < 200; ++trycnt) {
    x = rn2(hx - lx + 1) + lx << 24 >> 24;
    y = rn2(hy - ly + 1) + ly << 24 >> 24;
    if (await put_lregion_here(x, y, nlx, nly, nhx, nhy, rtype, oneshot, lev)) {
      return;
    }
  }
  for (x = lx; x <= hx; x = x + 1 << 24 >> 24) {
    for (y = ly; y <= hy; y = y + 1 << 24 >> 24) {
      if (await put_lregion_here(x, y, nlx, nly, nhx, nhy, rtype, TRUE, lev)) {
        return;
      }
    }
  }
  await impossible(S("Couldn't place lregion type %d!"), rtype);
}

async function put_lregion_here(x: number, y: number, nlx: number, nly: number, nhx: number, nhy: number, rtype: number, oneshot: number, lev: struct_d_level | null): Promise<number> {
  let mtmp = null;
  if (bad_location(x, y, nlx, nly, nhx, nhy)) {
    if (!oneshot) {
      return FALSE;
    } else {
      let t = t_at(x, y);
      if (t && (t.ttyp | 0) !== MAGIC_PORTAL && (t.ttyp | 0) !== VIBRATING_SQUARE) {
        await deltrap(t);
      }
      if (bad_location(x, y, nlx, nly, nhx, nhy)) {
        return FALSE;
      }
    }
  }
  switch (rtype) {
  case LR_TELE:
  case LR_UPTELE:
  case LR_DOWNTELE:
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
      if (oneshot) {
        if (!await rloc(mtmp, TRUE)) {
          await m_into_limbo(mtmp);
        }
      } else {
        return FALSE;
      }
    }
    await u_on_newpos(x, y);
    break;
  case LR_PORTAL:
    await mkportal(x, y, lev.dnum, lev.dlevel);
    break;
  case LR_DOWNSTAIR:
  case LR_UPSTAIR:
    await mkstairs(x, y, rtype, null);
    break;
  case LR_BRANCH:
    await place_branch(Is_branchlev(G.u.uz), x, y);
    break;
  }
  return TRUE;
}

async function baalz_fixup(): Promise<void> {
  let $t1: any, $t2: any;
  let mtmp = null;
  let x = 0;
  let y = 0;
  let lastx = 0;
  let lasty = 0;
  y = ROWNO / 2 | 0;
  for (lastx = x = 0; x < COLNO; ++x) {
    if ((($at2(G.level.locations, x, y).flags | 0) & W_NONDIGGABLE) !== 0) {
      if (!lastx) {
        bughack.inarea.x1 = x + 1 << 24 >> 24;
      }
      lastx = x;
    }
  }
  bughack.inarea.x2 = (lastx > bughack.inarea.x1 ? lastx : x) - 1 << 24 >> 24;
  x = bughack.inarea.x1;
  for (lasty = y = 0; y < ROWNO; ++y) {
    if ((($at2(G.level.locations, x, y).flags | 0) & W_NONDIGGABLE) !== 0) {
      if (!lasty) {
        bughack.inarea.y1 = y + 1 << 24 >> 24;
      }
      lasty = y;
    }
  }
  bughack.inarea.y2 = (lasty > bughack.inarea.y1 ? lasty : y) - 1 << 24 >> 24;
  for (x = bughack.inarea.x1; x <= bughack.inarea.x2; ++x) {
    for (y = bughack.inarea.y1; y <= bughack.inarea.y2; ++y) {
      if ($at2(G.level.locations, x, y).typ === POOL) {
        $at2(G.level.locations, x, y).typ = HWALL;
        if (bughack.delarea.x1 === COLNO) {
          bughack.delarea.x1 = x << 24 >> 24, bughack.delarea.y1 = y << 24 >> 24;
        } else {
          bughack.delarea.x2 = x << 24 >> 24, bughack.delarea.y2 = y << 24 >> 24;
        }
      } else if ($at2(G.level.locations, x, y).typ === IRONBARS) {
        ($t1 = $at2(G.level.locations, x - 1, y), $t1.flags = ((($t1.flags | 0) & ~W_NONDIGGABLE) >>> 0) & 31);
        if (isok(x - 2, y)) {
          ($t2 = $at2(G.level.locations, x - 2, y), $t2.flags = ((($t2.flags | 0) & ~W_NONDIGGABLE) >>> 0) & 31);
        }
      }
    }
  }
  await wallification(bughack.inarea.x1 - 2 > 1 ? bughack.inarea.x1 - 2 : 1, bughack.inarea.y1 - 2 > 0 ? bughack.inarea.y1 - 2 : 0, bughack.inarea.x2 + 2 < 80 - 1 ? bughack.inarea.x2 + 2 : 80 - 1, bughack.inarea.y2 + 2 < 21 - 1 ? bughack.inarea.y2 + 2 : 21 - 1);
  x = bughack.delarea.x1, y = bughack.delarea.y1;
  if (isok(x, y) && $at2(G.level.locations, x, y).typ === TLWALL && isok(x, y + 1) && $at2(G.level.locations, x, y + 1).typ === TUWALL) {
    $at2(G.level.locations, x, y).typ = BRCORNER;
    $at2(G.level.locations, x, y + 1).typ = HWALL;
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
      await rloc(mtmp, FALSE);
    }
  }
  x = bughack.delarea.x2, y = bughack.delarea.y2;
  if (isok(x, y) && $at2(G.level.locations, x, y).typ === TLWALL && isok(x, y - 1) && $at2(G.level.locations, x, y - 1).typ === TDWALL) {
    $at2(G.level.locations, x, y).typ = TRCORNER;
    $at2(G.level.locations, x, y - 1).typ = HWALL;
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
      await rloc(mtmp, FALSE);
    }
  }
  bughack.inarea.x1 = bughack.delarea.x1 = COLNO;
  bughack.inarea.y1 = bughack.delarea.y1 = ROWNO;
  bughack.inarea.x2 = bughack.delarea.x2 = 0;
  bughack.inarea.y2 = bughack.delarea.y2 = 0;
}

export async function fixup_special(): Promise<void> {
  let $g = 0;
  let r = null;
  let lev = new struct_d_level();
  let x = 0;
  let y = 0;
  let croom = null;
  let added_branch = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      r = G.lregions;
      lev = new struct_d_level();
      added_branch = FALSE;
      if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
        G.level.flags.hero_memory = 0;
        await setup_waterlevel();
      }
      x = 0;
    case 2:
      if (!(x < G.num_lregions)) { $g = 4; continue $L; }
      switch (r.rtype) {
      case LR_BRANCH: { $g = 6; continue $L; }
      case LR_PORTAL: { $g = 7; continue $L; }
      case LR_UPSTAIR: { $g = 8; continue $L; }
      case LR_DOWNSTAIR: { $g = 9; continue $L; }
      case LR_TELE: { $g = 10; continue $L; }
      case LR_UPTELE: { $g = 11; continue $L; }
      case LR_DOWNTELE: { $g = 12; continue $L; }
      default: { $g = 5; continue $L; }
      }
    case 6:
      added_branch = TRUE;
      { $g = 1; continue $L; }
    case 7:
      if (r.rname.str.a[r.rname.str.o] >= 48 && r.rname.str.a[r.rname.str.o] <= 57) {
        lev.$cp(G.u.uz);
        lev.dlevel = atoi(r.rname.str) << 24 >> 24;
      } else {
        let sp = find_level(r.rname.str);
        lev.$cp(sp.dlevel);
      }
    case 8:
    case 9:
    case 1: // place_it
      await place_lregion(r.inarea.x1, r.inarea.y1, r.inarea.x2, r.inarea.y2, r.delarea.x1, r.delarea.y1, r.delarea.x2, r.delarea.y2, r.rtype, lev);
      { $g = 5; continue $L; };
    case 10:
    case 11:
    case 12:
      if (r.rtype === LR_TELE || r.rtype === LR_UPTELE) {
        G.updest.lx = r.inarea.x1;
        G.updest.ly = r.inarea.y1;
        G.updest.hx = r.inarea.x2;
        G.updest.hy = r.inarea.y2;
        G.updest.nlx = r.delarea.x1;
        G.updest.nly = r.delarea.y1;
        G.updest.nhx = r.delarea.x2;
        G.updest.nhy = r.delarea.y2;
      }
      if (r.rtype === LR_TELE || r.rtype === LR_DOWNTELE) {
        G.dndest.lx = r.inarea.x1;
        G.dndest.ly = r.inarea.y1;
        G.dndest.hx = r.inarea.x2;
        G.dndest.hy = r.inarea.y2;
        G.dndest.nlx = r.delarea.x1;
        G.dndest.nly = r.delarea.y1;
        G.dndest.nhx = r.delarea.x2;
        G.dndest.nhy = r.delarea.y2;
      }
      { $g = 5; continue $L; };
    case 5:
      if (r.rname.str) {
        free(r.rname.str), r.rname.str = null;
      }
    case 3:
      ++x, r = $sadd(r, 1);
      { $g = 2; continue $L; }
    case 4:
      if (!added_branch && Is_branchlev(G.u.uz)) {
        await place_lregion(0, 0, 0, 0, 0, 0, 0, 0, LR_BRANCH, null);
      }
      if ((G.dungeon_topology.d_medusa_level.dlevel || G.dungeon_topology.d_medusa_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_medusa_level)) {
        let otmp = null;
        let tryct = 0;
        croom = G.rooms[0];
        for (tryct = rnd(4); tryct; --tryct) {
          x = somex(croom);
          y = somey(croom);
          if (goodpos(x, y, null, 0)) {
            otmp = await mk_tt_object(STATUE, x, y);
            while (otmp && (poly_when_stoned($sat(G.mons, otmp.corpsenm)) || ($sat(G.mons, otmp.corpsenm).mresists & 128) !== 0)) {
              await set_corpsenm(otmp, await rndmonnum());
            }
          }
        }
        if (rn2(2)) {
          otmp = await mk_tt_object(STATUE, somex(croom), somey(croom));
        } else {
          otmp = await mkcorpstat(STATUE, null, null, somex(croom), somey(croom), CORPSTAT_NONE);
        }
        if (otmp) {
          while (($sat(G.mons, otmp.corpsenm).mresists & 128) !== 0 || poly_when_stoned($sat(G.mons, otmp.corpsenm))) {
            await set_corpsenm(otmp, await rndmonnum());
          }
        }
      } else if ((G.dungeon_topology.d_wiz1_level.dlevel || G.dungeon_topology.d_wiz1_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_wiz1_level)) {
        croom = search_special(MORGUE);
        await create_secret_door(croom, W_SOUTH | W_EAST | W_WEST);
      } else if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
        croom = search_special(MORGUE);
        G.level.flags.graveyard = (G.level.flags.has_morgue = 0) & 1;
        croom.rtype = OROOM;
        for (x = croom.lx; x <= croom.hx; ++x) {
          for (y = croom.ly; y <= croom.hy; ++y) {
            await mkgold(rn2(300) + 600, x, y);
            if (!rn2(3) && !is_pool(x, y)) {
              await maketrap(x, y, rn2(3) ? LANDMINE : SPIKED_PIT);
            }
          }
        }
      } else if (G.urole.malenum === 335 && In_quest(G.u.uz)) {
        G.level.flags.graveyard = 1;
      } else if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
        G.level.flags.graveyard = 1;
      } else if ((G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) {
        croom = search_special(TEMPLE);
        await create_secret_door(croom, W_ANY);
      } else if (on_level(G.u.uz, G.dungeon_topology.d_orcus_level)) {
        let mtmp = null;
        let mtmp2 = null;
        for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
          mtmp2 = mtmp.nmon;
          if (mtmp.isshk) {
            await mongone(mtmp);
          }
        }
      } else if (on_level(G.u.uz, G.dungeon_topology.d_baalzebub_level)) {
        await baalz_fixup();
      } else if (G.u.uz.dnum === G.dungeon_topology.d_mines_dnum && G.ransacked) {
        await stolen_booty();
      }
      if (G.lregions) {
        free(G.lregions), G.lregions = null;
      }
      G.num_lregions = 0;
    }
    break;
  }
}

function check_ransacked(s: Ptr | null): void {
  G.ransacked = (G.u.uz.dnum === G.dungeon_topology.d_mines_dnum && !strcmp(s, S("minetn-1")) ? 1 : 0) << 24 >> 24;
}

async function migrate_orc(mtmp: struct_monst | null, mflags: number): Promise<void> {
  let nlev = 0;
  let max_depth = 0;
  let cur_depth = 0;
  let dest = new struct_d_level();
  cur_depth = depth(G.u.uz);
  max_depth = dunlevs_in_dungeon(G.u.uz) + (G.dungeons[G.u.uz.dnum].depth_start - 1);
  if (mflags === ORC_LEADER) {
    nlev = max_depth;
    if (!rn2(40)) {
      --nlev;
    }
    mtmp.mspare1 = mtmp.mspare1 | MIGR_LEFTOVERS;
  } else {
    nlev = rn2(max_depth - cur_depth + 1) + cur_depth;
    if (nlev === cur_depth) {
      ++nlev;
    }
    if (nlev > max_depth) {
      nlev = max_depth;
    }
    mtmp.mspare1 = mtmp.mspare1 & ~MIGR_LEFTOVERS;
  }
  await get_level(dest, nlev);
  await migrate_to_level(mtmp, ledger_no(dest), MIGR_RANDOM, null);
}

export async function shiny_orc_stuff(mtmp: struct_monst | null): Promise<void> {
  let gemprob = 0;
  let goldprob = 0;
  let otyp = 0;
  let otmp = null;
  let is_captain = (mtmp.data === $sat(G.mons, PM_ORC_CAPTAIN) ? 1 : 0) << 24 >> 24;
  goldprob = is_captain ? 600 : 300;
  gemprob = goldprob / 4 | 0;
  if (rn2(1000) < goldprob) {
    if (!!(otmp = await mksobj(GOLD_PIECE, TRUE, FALSE))) {
      otmp.quan = 1 + rnd(goldprob);
      otmp.owt = await weight(otmp) >>> 0;
      await add_to_minv(mtmp, otmp);
    }
  }
  if (rn2(1000) < gemprob) {
    if (!!(otmp = await mkobj(GEM_CLASS, FALSE))) {
      if (otmp.otyp === ROCK) {
        await dealloc_obj(otmp);
      } else {
        await add_to_minv(mtmp, otmp);
      }
    }
  }
  if (is_captain || !rn2(8)) {
    otyp = await shiny_obj(RING_CLASS);
    if (otyp !== STRANGE_OBJECT && !!(otmp = await mksobj(otyp, TRUE, FALSE))) {
      await add_to_minv(mtmp, otmp);
    }
  }
}

async function migr_booty_item(otyp: number, gang: Ptr | null): Promise<void> {
  let otmp = null;
  otmp = await mksobj_migr_to_species(otyp, M2_ORC, TRUE, FALSE);
  if (otmp && gang) {
    await new_oname(otmp, strlen(gang) + 1 | 0);
    strcpy(otmp.oextra.oname, gang);
    if (otyp >= TRIPE_RATION && otyp <= TIN) {
      if (otyp === SLIME_MOLD) {
        otmp.spe = await fruitadd(orcfruit[rn2(Math.trunc(16 / 8) | 0)], null) << 24 >> 24;
      }
      otmp.quan += rn2(3);
      otmp.owt = await weight(otmp) >>> 0;
    }
  }
}

async function stolen_booty(): Promise<void> {
  let gang = null;
  let gang_name = new Int8Array(256);
  let mtmp = null;
  let cnt = 0;
  let i = 0;
  let otyp = 0;
  gang = rndorcname(P(gang_name));
  cnt = rnd(4);
  for (i = 0; i < cnt; ++i) {
    await migr_booty_item(rn2(4) ? TALLOW_CANDLE : WAX_CANDLE, gang);
  }
  cnt = rnd(3);
  for (i = 0; i < cnt; ++i) {
    await migr_booty_item(SKELETON_KEY, gang);
  }
  otyp = rn2(GAUNTLETS_OF_DEXTERITY - LEATHER_GLOVES + 1) + LEATHER_GLOVES;
  await migr_booty_item(otyp, gang);
  cnt = rnd(10);
  for (i = 0; i < cnt; ++i) {
    otyp = rn2(TIN - TRIPE_RATION + 1) + TRIPE_RATION;
    if (otyp !== LEMBAS_WAFER && otyp !== GLOB_OF_GRAY_OOZE && otyp !== GLOB_OF_BROWN_PUDDING && otyp !== GLOB_OF_GREEN_SLIME && otyp !== GLOB_OF_BLACK_PUDDING && otyp !== MEAT_STICK && otyp !== MEATBALL && otyp !== MEAT_STICK && otyp !== MEAT_RING && otyp !== HUGE_CHUNK_OF_MEAT && otyp !== CORPSE) {
      await migr_booty_item(otyp, gang);
    }
  }
  await migr_booty_item(rn2(2) ? LONG_SWORD : SILVER_SABER, gang);
  mtmp = await makemon($sat(G.mons, PM_ORC_CAPTAIN), 0, 0, MM_NONAME);
  if (mtmp) {
    mtmp = await christen_monst(mtmp, upstart(gang));
    mtmp.mpeaceful = 0;
    await shiny_orc_stuff(mtmp);
    await migrate_orc(mtmp, ORC_LEADER);
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if ((mtmp.data.mflags2 & 128) >>> 0 !== 0 && !(mtmp.mextra && mtmp.mextra.mname) && rn2(10)) {
      if (mtmp.data !== $sat(G.mons, PM_ORC_CAPTAIN)) {
        mtmp = await christen_orc(mtmp, upstart(gang), S(""));
      }
    }
  }
  cnt = rn2(10) + 5;
  for (i = 0; i < cnt; ++i) {
    let mtyp = 0;
    mtyp = rn2(PM_ORC_SHAMAN - PM_ORC + 1) + PM_ORC;
    mtmp = await makemon($sat(G.mons, mtyp), 0, 0, MM_NONAME);
    if (mtmp) {
      await shiny_orc_stuff(mtmp);
      await migrate_orc(mtmp, 0);
    }
  }
  G.ransacked = 0;
}

export function maze_inbounds(x: number, y: number): number {
  return (x >= 2 && y >= 2 && x < G.x_maze_max && y < G.y_maze_max && isok(x, y) ? 1 : 0) << 24 >> 24;
}

export async function maze_remove_deadends(typ: number): Promise<void> {
  let dirok = new Int8Array(4);
  let x = 0;
  let y = 0;
  let dir = 0;
  let idx = 0;
  let idx2 = 0;
  let dx = 0;
  let dy = 0;
  let dx2 = 0;
  let dy2 = 0;
  dirok[0] = 0;
  for (x = 2; x < G.x_maze_max; ++x) {
    for (y = 2; y < G.y_maze_max; ++y) {
      if ($at2(G.level.locations, x, y).typ >= DOOR && x % 2 && y % 2) {
        idx = idx2 = 0;
        for (dir = 0; dir < 4; ++dir) {
          dx = dx2 = x;
          dy = dy2 = y;
          do {
            switch (dir) {
            case 0:
              --dy;
              break;
            case 1:
              ++dx;
              break;
            case 2:
              ++dy;
              break;
            case 3:
              --dx;
              break;
            default:
              await panic(S("mz_move: bad direction %d"), dir);
            }
          } while (0);
          if (!maze_inbounds(dx, dy)) {
            ++idx2;
            continue;
          }
          do {
            switch (dir) {
            case 0:
              --dy2;
              break;
            case 1:
              ++dx2;
              break;
            case 2:
              ++dy2;
              break;
            case 3:
              --dx2;
              break;
            default:
              await panic(S("mz_move: bad direction %d"), dir);
            }
          } while (0);
          do {
            switch (dir) {
            case 0:
              --dy2;
              break;
            case 1:
              ++dx2;
              break;
            case 2:
              ++dy2;
              break;
            case 3:
              --dx2;
              break;
            default:
              await panic(S("mz_move: bad direction %d"), dir);
            }
          } while (0);
          if (!maze_inbounds(dx2, dy2)) {
            ++idx2;
            continue;
          }
          if (!($at2(G.level.locations, dx, dy).typ >= DOOR) && $at2(G.level.locations, dx2, dy2).typ >= DOOR) {
            dirok[idx++] = dir << 24 >> 24;
            ++idx2;
          }
        }
        if (idx2 >= 3 && idx > 0) {
          dx = x;
          dy = y;
          dir = dirok[rn2(idx)];
          do {
            switch (dir) {
            case 0:
              --dy;
              break;
            case 1:
              ++dx;
              break;
            case 2:
              ++dy;
              break;
            case 3:
              --dx;
              break;
            default:
              await panic(S("mz_move: bad direction %d"), dir);
            }
          } while (0);
          $at2(G.level.locations, dx, dy).typ = typ;
        }
      }
    }
  }
}

export async function create_maze(corrwid: number, wallthick: number): Promise<void> {
  let x = 0;
  let y = 0;
  let mm = new struct_nhcoord();
  let tmp_xmax = G.x_maze_max;
  let tmp_ymax = G.y_maze_max;
  let rdx = 0;
  let rdy = 0;
  let scale = 0;
  if (wallthick < 1) {
    wallthick = 1;
  } else if (wallthick > 5) {
    wallthick = 5;
  }
  if (corrwid < 1) {
    corrwid = 1;
  } else if (corrwid > 5) {
    corrwid = 5;
  }
  scale = corrwid + wallthick;
  rdx = G.x_maze_max / scale | 0;
  rdy = G.y_maze_max / scale | 0;
  if (G.level.flags.corrmaze) {
    for (x = 2; x < rdx * 2; ++x) {
      for (y = 2; y < rdy * 2; ++y) {
        $at2(G.level.locations, x, y).typ = STONE;
      }
    }
  } else {
    for (x = 2; x <= rdx * 2; ++x) {
      for (y = 2; y <= rdy * 2; ++y) {
        $at2(G.level.locations, x, y).typ = (x % 2 && y % 2 ? STONE : HWALL) << 24 >> 24;
      }
    }
  }
  G.x_maze_max = rdx * 2;
  G.y_maze_max = rdy * 2;
  maze0xy(mm);
  await walkfrom(mm.x, mm.y, 0);
  if (!rn2(5)) {
    await maze_remove_deadends(G.level.flags.corrmaze | 0 ? CORR : ROOM);
  }
  G.x_maze_max = tmp_xmax;
  G.y_maze_max = tmp_ymax;
  if (scale > 2) {
    let tmpmap = $arr(80, () => new Int8Array(21));
    let rx = 1;
    let ry = 1;
    for (x = 1; x < G.x_maze_max; ++x) {
      for (y = 1; y < G.y_maze_max; ++y) {
        tmpmap[x][y] = $at2(G.level.locations, x, y).typ;
      }
    }
    rx = x = 2;
    while (rx < G.x_maze_max) {
      let mx = x % 2 ? corrwid : x === 2 || x === rdx * 2 ? 1 : wallthick;
      ry = y = 2;
      while (ry < G.y_maze_max) {
        let dx = 0;
        let dy = 0;
        let my = y % 2 ? corrwid : y === 2 || y === rdy * 2 ? 1 : wallthick;
        for (dx = 0; dx < mx; ++dx) {
          for (dy = 0; dy < my; ++dy) {
            if (rx + dx >= G.x_maze_max || ry + dy >= G.y_maze_max) {
              break;
            }
            $at2(G.level.locations, rx + dx, ry + dy).typ = tmpmap[x][y];
          }
        }
        ry += my;
        ++y;
      }
      rx += mx;
      ++x;
    }
  }
}

export async function makemaz(s: Ptr | null): Promise<void> {
  let x = 0;
  let y = 0;
  let protofile = new Int8Array(20);
  let sp = Is_special(G.u.uz);
  let mm = new struct_nhcoord();
  if (s.a[s.o]) {
    if (sp && sp.rndlevs) {
      sprintf(P(protofile), S("%s-%d"), s, rnd(sp.rndlevs));
    } else {
      strcpy(P(protofile), s);
    }
  } else if ($rd(P(G.dungeons[G.u.uz.dnum].proto))) {
    if (dunlevs_in_dungeon(G.u.uz) > 1) {
      if (sp && sp.rndlevs) {
        sprintf(P(protofile), S("%s%d-%d"), P(G.dungeons[G.u.uz.dnum].proto), dunlev(G.u.uz), rnd(sp.rndlevs));
      } else {
        sprintf(P(protofile), S("%s%d"), P(G.dungeons[G.u.uz.dnum].proto), dunlev(G.u.uz));
      }
    } else if (sp && sp.rndlevs) {
      sprintf(P(protofile), S("%s-%d"), P(G.dungeons[G.u.uz.dnum].proto), rnd(sp.rndlevs));
    } else {
      strcpy(P(protofile), P(G.dungeons[G.u.uz.dnum].proto));
    }
  } else {
    strcpy(P(protofile), S(""));
  }
  if (G.flags.debug && $rd(P(protofile)) && sp && sp.rndlevs) {
    let ep = getenv(S("SPLEVTYPE"));
    if (ep) {
      let len = strrchr(P(protofile), 45).o - P(protofile).o + 1 | 0;
      while (ep && ep.a[ep.o]) {
        if (!strncmp(ep, P(protofile), $u64(len))) {
          let pick = atoi(ep.add(len));
          if (pick > 0 && pick <= sp.rndlevs) {
            sprintf(P(protofile).add(len), S("%d"), pick);
          }
          break;
        } else {
          ep = strchr(ep, 44);
          if (ep) {
            ep = ep.add(1);
          }
        }
      }
    }
  }
  if ($rd(P(protofile))) {
    check_ransacked(P(protofile));
    strcat(P(protofile), S(".lev"));
    if (await load_special(P(protofile))) {
      await dmonsfree();
      return;
    }
    await impossible(S("Couldn't load \"%s\" - making a maze."), P(protofile));
  }
  G.level.flags.is_maze_lev = (TRUE) & 1;
  G.level.flags.corrmaze = ((!rn2(3) ? 1 : 0) >>> 0) & 1;
  if (!Invocation_lev(G.u.uz) && rn2(2)) {
    let corrscale = rnd(4);
    await create_maze(corrscale, rnd(4) - corrscale);
  } else {
    await create_maze(1, 1);
  }
  if (!G.level.flags.corrmaze) {
    await wallification(2, 2, G.x_maze_max, G.y_maze_max);
  }
  await mazexy(mm);
  await mkstairs(mm.x, mm.y, 1, null);
  if (!Invocation_lev(G.u.uz)) {
    await mazexy(mm);
    await mkstairs(mm.x, mm.y, 0, null);
  } else {
    let x_range = G.x_maze_max - x_maze_min - 2 * INVPOS_X_MARGIN - 1;
    let y_range = G.y_maze_max - y_maze_min - 2 * INVPOS_Y_MARGIN - 1;
    if (x_range <= INVPOS_X_MARGIN || y_range <= INVPOS_Y_MARGIN || Math.imul(x_range, y_range) <= Math.imul(INVPOS_DISTANCE, INVPOS_DISTANCE)) {
      do {
        if (await debugcore(S("mkmaze.c"), 1)) {
          await pline(S("inv_pos: maze is too small! (%d x %d)"), G.x_maze_max, G.y_maze_max);
        }
      } while (0);
    }
    G.inv_pos.x = G.inv_pos.y = 0;
    do {
      x = rn2(x_range) + (2 + (6 - 2) + 1);
      y = rn2(y_range) + (2 + (5 - 2) + 1);
    } while (x === G.upstair.sx || y === G.upstair.sy || Math.abs(x - G.upstair.sx) === Math.abs(y - G.upstair.sy) || distmin(x, y, G.upstair.sx, G.upstair.sy) <= INVPOS_DISTANCE || !($at2(G.level.locations, x, y).typ > DOOR) || occupied(x, y));
    G.inv_pos.x = x << 24 >> 24;
    G.inv_pos.y = y << 24 >> 24;
    await maketrap(G.inv_pos.x, G.inv_pos.y, VIBRATING_SQUARE);
  }
  await place_branch(Is_branchlev(G.u.uz), 0, 0);
  for (x = rn2(8) + 11; x; --x) {
    await mazexy(mm);
    await mkobj_at(rn2(2) ? GEM_CLASS : 0, mm.x, mm.y, TRUE);
  }
  for (x = rn2(10) + 2; x; --x) {
    await mazexy(mm);
    await mksobj_at(BOULDER, mm.x, mm.y, TRUE, FALSE);
  }
  for (x = rn2(3); x; --x) {
    await mazexy(mm);
    await makemon($sat(G.mons, PM_MINOTAUR), mm.x, mm.y, NO_MM_FLAGS);
  }
  for (x = rn2(5) + 7; x; --x) {
    await mazexy(mm);
    await makemon(null, mm.x, mm.y, NO_MM_FLAGS);
  }
  for (x = rn2(6) + 7; x; --x) {
    await mazexy(mm);
    await mkgold(0, mm.x, mm.y);
  }
  for (x = rn2(6) + 7; x; --x) {
    await mktrap(0, 1, null, null);
  }
}

export async function walkfrom(x: number, y: number, typ: number): Promise<void> {
  let q = 0;
  let a = 0;
  let dir = 0;
  let dirs = new Int32Array(4);
  if (!typ) {
    if (G.level.flags.corrmaze) {
      typ = CORR;
    } else {
      typ = ROOM;
    }
  }
  if (!($at2(G.level.locations, x, y).typ === DOOR)) {
    $at2(G.level.locations, x, y).typ = typ;
    $at2(G.level.locations, x, y).flags = 0;
  }
  while (1) {
    q = 0;
    for (a = 0; a < 4; ++a) {
      if (await okay(x, y, a)) {
        dirs[q++] = a;
      }
    }
    if (!q) {
      return;
    }
    dir = dirs[rn2(q)];
    do {
      switch (dir) {
      case 0:
        --y;
        break;
      case 1:
        ++x;
        break;
      case 2:
        ++y;
        break;
      case 3:
        --x;
        break;
      default:
        await panic(S("mz_move: bad direction %d"), dir);
      }
    } while (0);
    $at2(G.level.locations, x, y).typ = typ;
    do {
      switch (dir) {
      case 0:
        --y;
        break;
      case 1:
        ++x;
        break;
      case 2:
        ++y;
        break;
      case 3:
        --x;
        break;
      default:
        await panic(S("mz_move: bad direction %d"), dir);
      }
    } while (0);
    await walkfrom(x, y, typ);
  }
}

export async function mazexy(cc: struct_nhcoord | null): Promise<void> {
  let cpt = 0;
  do {
    cc.x = 1 + rn2(G.x_maze_max) << 24 >> 24;
    cc.y = 1 + rn2(G.y_maze_max) << 24 >> 24;
    ++cpt;
  } while (cpt < 100 && $at2(G.level.locations, cc.x, cc.y).typ !== (G.level.flags.corrmaze | 0 ? CORR : ROOM));
  if (cpt >= 100) {
    let x = 0;
    let y = 0;
    for (x = 1; x < G.x_maze_max; ++x) {
      for (y = 1; y < G.y_maze_max; ++y) {
        cc.x = x << 24 >> 24;
        cc.y = y << 24 >> 24;
        if ($at2(G.level.locations, cc.x, cc.y).typ === (G.level.flags.corrmaze | 0 ? CORR : ROOM)) {
          return;
        }
      }
    }
    await panic(S("mazexy: can't find a place!"));
  }
  return;
}

export function bound_digging(): void {
  let $t1: any;
  let x = 0;
  let y = 0;
  let typ = 0;
  let lev = null;
  let found = 0;
  let nonwall = 0;
  let xmin = 0;
  let xmax = 0;
  let ymin = 0;
  let ymax = 0;
  if ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) {
    return;
  }
  found = nonwall = FALSE;
  for (xmin = 0; !found && xmin <= COLNO; ++xmin) {
    lev = $at2(G.level.locations, xmin, 0);
    for (y = 0; y <= ROWNO - 1; ++y, lev = $sadd(lev, 1)) {
      typ = lev.typ >>> 0;
      if (typ !== STONE) {
        found = TRUE;
        if (!(typ && typ <= DBWALL)) {
          nonwall = TRUE;
        }
      }
    }
  }
  xmin -= nonwall || !G.level.flags.is_maze_lev ? 2 : 1;
  if (xmin < 0) {
    xmin = 0;
  }
  found = nonwall = FALSE;
  for (xmax = COLNO - 1; !found && xmax >= 0; --xmax) {
    lev = $at2(G.level.locations, xmax, 0);
    for (y = 0; y <= ROWNO - 1; ++y, lev = $sadd(lev, 1)) {
      typ = lev.typ >>> 0;
      if (typ !== STONE) {
        found = TRUE;
        if (!(typ && typ <= DBWALL)) {
          nonwall = TRUE;
        }
      }
    }
  }
  xmax += nonwall || !G.level.flags.is_maze_lev ? 2 : 1;
  if (xmax >= COLNO) {
    xmax = COLNO - 1;
  }
  found = nonwall = FALSE;
  for (ymin = 0; !found && ymin <= ROWNO; ++ymin) {
    lev = $sat(G.level.locations[xmin], ymin);
    for (x = xmin; x <= xmax; ++x, lev = $sadd(lev, ROWNO)) {
      typ = lev.typ >>> 0;
      if (typ !== STONE) {
        found = TRUE;
        if (!(typ && typ <= DBWALL)) {
          nonwall = TRUE;
        }
      }
    }
  }
  ymin -= nonwall || !G.level.flags.is_maze_lev ? 2 : 1;
  found = nonwall = FALSE;
  for (ymax = ROWNO - 1; !found && ymax >= 0; --ymax) {
    lev = $sat(G.level.locations[xmin], ymax);
    for (x = xmin; x <= xmax; ++x, lev = $sadd(lev, ROWNO)) {
      typ = lev.typ >>> 0;
      if (typ !== STONE) {
        found = TRUE;
        if (!(typ && typ <= DBWALL)) {
          nonwall = TRUE;
        }
      }
    }
  }
  ymax += nonwall || !G.level.flags.is_maze_lev ? 2 : 1;
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (y <= ymin || y >= ymax || x <= xmin || x >= xmax) {
        ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | W_NONDIGGABLE) >>> 0) & 31);
      }
    }
  }
}

export async function mkportal(x: number, y: number, todnum: number, todlevel: number): Promise<void> {
  let ttmp = await maketrap(x, y, MAGIC_PORTAL);
  if (!ttmp) {
    await impossible(S("portal on top of portal??"));
    return;
  }
  do {
    if (await debugcore(S("mkmaze.c"), 1)) {
      await pline(S("mkportal: at <%d,%d>, to %s, level %d"), x, y, P(G.dungeons[todnum].dname), todlevel);
    }
  } while (0);
  ttmp.dst.dnum = todnum;
  ttmp.dst.dlevel = todlevel;
  return;
}

export async function fumaroles(): Promise<void> {
  let n = 0;
  let snd = FALSE;
  let loud = FALSE;
  for (n = rn2(3) + 2 << 24 >> 24; n; n = n - 1 << 24 >> 24) {
    let x = rn2(80 - 4) + 3 << 24 >> 24;
    let y = rn2(21 - 4) + 3 << 24 >> 24;
    if ($at2(G.level.locations, x, y).typ === LAVAPOOL) {
      let r = await create_gas_cloud(x, y, 4 + rn2(5), rn2(10) + 5);
      r.player_flags = (r.player_flags | 2) >>> 0;
      snd = TRUE;
      if (dist2(x, y, G.u.ux, G.u.uy) < 15) {
        loud = TRUE;
      }
    }
  }
  if (snd && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    await Norep(S("You hear a %swhoosh!"), loud ? S("loud ") : S(""));
  }
}

export async function movebubbles(): Promise<void> {
  let b = null;
  let cons = null;
  let btrap = null;
  let x = 0;
  let y = 0;
  let i = 0;
  let j = 0;
  let bcpin = 0;
  if (!wportal) {
    await set_wportal();
  }
  await vision_recalc(2);
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    if (!!G.uball) {
      bcpin = await unplacebc_and_covet_placebc();
    }
    for (b = movebubbles$up ? bbubbles : ebubbles; b; b = movebubbles$up ? b.next : b.prev) {
      if (b.cons) {
        await panic(S("movebubbles: cons != null"));
      }
      for (i = 0, x = b.x; i < b.bm[0]; ++i, ++x) {
        for (j = 0, y = b.y; j < b.bm[1]; ++j, ++y) {
          if (b.bm[j + 2] & 1 << i) {
            if (!isok(x, y)) {
              await impossible(S("movebubbles: bad pos (%d,%d)"), x, y);
              continue;
            }
            if (!!G.level.objects[x][y]) {
              let olist = null;
              let otmp = null;
              while (!!(otmp = G.level.objects[x][y])) {
                await remove_object(otmp);
                otmp.ox = otmp.oy = 0;
                otmp.v.v_nexthere = olist;
                olist = otmp;
              }
              cons = new struct_container();
              cons.x = x << 24 >> 24;
              cons.y = y << 24 >> 24;
              cons.what = CONS_OBJ;
              cons.list = olist;
              cons.next = b.cons;
              b.cons = cons;
            }
            if (!!G.level.monsters[x][y]) {
              let mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
              cons = new struct_container();
              cons.x = x << 24 >> 24;
              cons.y = y << 24 >> 24;
              cons.what = CONS_MON;
              cons.list = mon;
              cons.next = b.cons;
              b.cons = cons;
              if (mon.wormno) {
                await remove_worm(mon);
              } else {
                G.level.monsters[x][y] = null;
              }
              await newsym(x, y);
              mon.mx = mon.my = 0;
              mon.mspare1 = mon.mspare1 | MON_BUBBLEMOVE;
            }
            if (!G.u.uswallow && x === G.u.ux && y === G.u.uy) {
              cons = new struct_container();
              cons.x = x << 24 >> 24;
              cons.y = y << 24 >> 24;
              cons.what = CONS_HERO;
              cons.list = null;
              cons.next = b.cons;
              b.cons = cons;
            }
            if (!!(btrap = t_at(x, y))) {
              cons = new struct_container();
              cons.x = x << 24 >> 24;
              cons.y = y << 24 >> 24;
              cons.what = CONS_TRAP;
              cons.list = btrap;
              cons.next = b.cons;
              b.cons = cons;
            }
            $at2(G.level.locations, x, y).$cp(movebubbles$water_pos);
            block_point(x, y);
          }
        }
      }
    }
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    let xedge = 0;
    let yedge = 0;
    for (x = 1; x <= COLNO - 1; ++x) {
      for (y = 0; y <= ROWNO - 1; ++y) {
        $at2(G.level.locations, x, y).$cp(movebubbles$air_pos);
        unblock_point(x, y);
        xedge = (x < xmin[0] + 1 || x > xmax[0] - 1 ? 1 : 0) << 24 >> 24;
        yedge = (y < ymin[0] + 1 || y > ymax[0] - 1 ? 1 : 0) << 24 >> 24;
        if (xedge || yedge) {
          if (!rn2(xedge ? 3 : 5)) {
            $at2(G.level.locations, x, y).typ = CLOUD;
            block_point(x, y);
          }
        }
      }
    }
  }
  movebubbles$up = (!movebubbles$up ? 1 : 0) << 24 >> 24;
  for (b = movebubbles$up ? bbubbles : ebubbles; b; b = movebubbles$up ? b.next : b.prev) {
    let rx = rn2(3);
    let ry = rn2(3);
    await mv_bubble(b, b.dx + 1 - (!b.dx ? rx : rx ? 1 : 0), b.dy + 1 - (!b.dy ? ry : ry ? 1 : 0), FALSE);
  }
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) && !!G.uball) {
    await lift_covet_and_placebc(bcpin);
  }
  G.vision_full_recalc = 1;
}

export async function water_friction(): Promise<void> {
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = 0;
  let eff = FALSE;
  if ((G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && rn2(4)) {
    return;
  }
  if (G.u.dx && !rn2(!G.u.dy ? 3 : 6)) {
    x = G.u.ux;
    do {
      dy = rn2(3) - 1;
      y = G.u.uy + dy;
    } while (dy && (!isok(x, y) || !is_pool(x, y)));
    G.u.dx = 0;
    G.u.dy = dy << 24 >> 24;
    eff = TRUE;
  } else if (G.u.dy && !rn2(!G.u.dx ? 3 : 5)) {
    y = G.u.uy;
    do {
      dx = rn2(3) - 1;
      x = G.u.ux + dx;
    } while (dx && (!isok(x, y) || !is_pool(x, y)));
    G.u.dy = 0;
    G.u.dx = dx << 24 >> 24;
    eff = TRUE;
  }
  if (eff) {
    await pline(S("Water turbulence affects your movements."));
  }
}

export async function save_waterlevel(fd: number, mode: number): Promise<void> {
  let b = null;
  if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
    return;
  }
  if (mode & (1 | 2)) {
    const n = new Int32Array(1);
    n[0] = 0;
    for (b = bbubbles; b; b = b.next) {
      ++n[0];
    }
    await bwrite(fd, P(n, 0), 4);
    await bwrite(fd, P(xmin, 0), 4);
    await bwrite(fd, P(ymin, 0), 4);
    await bwrite(fd, P(xmax, 0), 4);
    await bwrite(fd, P(ymax, 0), 4);
    for (b = bbubbles; b; b = b.next) {
      await bwrite(fd, b, 40);
    }
  }
  if (mode & 4) {
    unsetup_waterlevel();
  }
}

export async function restore_waterlevel(fd: number): Promise<void> {
  let b = null;
  let btmp = null;
  let i = 0;
  const n = new Int32Array(1);
  if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
    return;
  }
  if (fd === -1) {
    if (!G.flags.debug) {
      await impossible(S("restore_waterlevel: returning to %s?"), (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? S("Water") : S("Air"));
    }
    await setup_waterlevel();
    return;
  }
  await set_wportal();
  await mread(fd, P(n, 0), 4);
  await mread(fd, P(xmin, 0), 4);
  await mread(fd, P(ymin, 0), 4);
  await mread(fd, P(xmax, 0), 4);
  await mread(fd, P(ymax, 0), 4);
  for (i = 0; i < n[0]; ++i) {
    btmp = b;
    b = new struct_bubble();
    await mread(fd, b, 40);
    if (bbubbles) {
      btmp.next = b;
      b.prev = btmp;
    } else {
      bbubbles = b;
      b.prev = null;
    }
    await mv_bubble(b, 0, 0, TRUE);
  }
  ebubbles = b;
  b.next = null;
}

export function waterbody_name(x: number, y: number): Ptr | null {
  let lev = null;
  let ltyp = 0;
  if (!isok(x, y)) {
    return S("drink");
  }
  lev = $sat(G.level.locations[x], y);
  ltyp = lev.typ;
  if (ltyp === DRAWBRIDGE_UP) {
    ltyp = db_under_typ(lev.flags | 0);
  }
  if (ltyp === LAVAPOOL) {
    return hliquid(S("lava"));
  } else if (ltyp === ICE) {
    return S("ice");
  } else if (ltyp === POOL) {
    return S("pool of water");
  } else if (ltyp === WATER || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    ;
  } else if ((G.dungeon_topology.d_juiblex_level.dlevel || G.dungeon_topology.d_juiblex_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_juiblex_level)) {
    return S("swamp");
  } else if (ltyp === MOAT && !((G.dungeon_topology.d_medusa_level.dlevel || G.dungeon_topology.d_medusa_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_medusa_level))) {
    return S("moat");
  }
  return hliquid(S("water"));
}

async function set_wportal(): Promise<void> {
  for (wportal = G.ftrap; wportal; wportal = wportal.ntrap) {
    if ((wportal.ttyp | 0) === MAGIC_PORTAL) {
      return;
    }
  }
  await impossible(S("set_wportal(): no portal!"));
}

async function setup_waterlevel(): Promise<void> {
  let x = 0;
  let y = 0;
  let xskip = 0;
  let yskip = 0;
  let typ = 0;
  let glyph = 0;
  if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
    await panic(S("setup_waterlevel(): [%d:%d] neither 'Water' nor 'Air'"), G.u.uz.dnum, G.u.uz.dlevel);
  }
  xmin[0] = 3;
  ymin[0] = 1;
  xmax[0] = 78;
  xmax[0] = xmax[0] < 80 - 1 - 1 ? xmax[0] : 80 - 1 - 1;
  ymax[0] = 20;
  ymax[0] = ymax[0] < 21 - 1 ? ymax[0] : 21 - 1;
  glyph = ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? S_water : S_air) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  typ = (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? WATER : AIR;
  for (x = 1; x <= COLNO - 1; ++x) {
    for (y = 0; y <= ROWNO - 1; ++y) {
      $at2(G.level.locations, x, y).glyph = glyph;
      if ($at2(G.level.locations, x, y).typ === STONE) {
        $at2(G.level.locations, x, y).typ = typ << 24 >> 24;
      }
    }
  }
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    xskip = 10 + rn2(10);
    yskip = 4 + rn2(4);
  } else {
    xskip = 6 + rn2(4);
    yskip = 3 + rn2(3);
  }
  for (x = xmin[0] + 1; x <= xmax[0] - 1; x += xskip) {
    for (y = ymin[0] + 1; y <= ymax[0] - 1; y += yskip) {
      await mk_bubble(x, y, rn2(7));
    }
  }
}

function unsetup_waterlevel(): void {
  let b = null;
  let bb = null;
  for (b = bbubbles; b; b = bb) {
    bb = b.next;
    free(b);
  }
  bbubbles = ebubbles = null;
}

async function mk_bubble(x: number, y: number, n: number): Promise<void> {
  let b = null;
  if (x >= xmax[0] - 1 || y >= ymax[0] - 1) {
    return;
  }
  if (n >= (Math.trunc(56 / 8) | 0)) {
    await impossible(S("n too large (mk_bubble)"));
    n = (Math.trunc(56 / 8) | 0) - 1;
  }
  if ($rd(mk_bubble$bmask[n], 1) > MAX_BMASK) {
    await panic(S("bmask size is larger than MAX_BMASK"));
  }
  b = new struct_bubble();
  if (x + $rd(mk_bubble$bmask[n]) - 1 > xmax[0] - 1) {
    x = xmax[0] - 1 - $rd(mk_bubble$bmask[n]) + 1;
  }
  if (y + $rd(mk_bubble$bmask[n], 1) - 1 > ymax[0] - 1) {
    y = ymax[0] - 1 - $rd(mk_bubble$bmask[n], 1) + 1;
  }
  b.x = x << 24 >> 24;
  b.y = y << 24 >> 24;
  b.dx = 1 - rn2(3) << 24 >> 24;
  b.dy = 1 - rn2(3) << 24 >> 24;
  memcpy(P(b.bm), mk_bubble$bmask[n], $u64($rd(mk_bubble$bmask[n], 1) + 2) * 1);
  b.cons = null;
  if (!bbubbles) {
    bbubbles = b;
  }
  if (ebubbles) {
    ebubbles.next = b;
    b.prev = ebubbles;
  } else {
    b.prev = null;
  }
  b.next = null;
  ebubbles = b;
  await mv_bubble(b, 0, 0, TRUE);
}

async function mv_bubble(b: struct_bubble | null, dx: number, dy: number, ini: number): Promise<void> {
  let x = 0;
  let y = 0;
  let i = 0;
  let j = 0;
  let colli = 0;
  let cons = null;
  let ctemp = null;
  if (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) || !rn2(6)) {
    if (dx < -1 || dx > 1 || dy < -1 || dy > 1) {
      dx = sgn(dx);
      dy = sgn(dy);
    }
    if (b.x <= xmin[0] + 1) {
      colli |= 2;
    }
    if (b.y <= ymin[0] + 1) {
      colli |= 1;
    }
    if (b.x + b.bm[0] - 1 >= xmax[0] - 1) {
      colli |= 2;
    }
    if (b.y + b.bm[1] - 1 >= ymax[0] - 1) {
      colli |= 1;
    }
    if (b.x < xmin[0] + 1) {
      await pline(S("bubble xmin: x = %d, xmin = %d"), b.x, xmin[0] + 1);
      b.x = xmin[0] + 1 << 24 >> 24;
    }
    if (b.y < ymin[0] + 1) {
      await pline(S("bubble ymin: y = %d, ymin = %d"), b.y, ymin[0] + 1);
      b.y = ymin[0] + 1 << 24 >> 24;
    }
    if (b.x + b.bm[0] - 1 > xmax[0] - 1) {
      await pline(S("bubble xmax: x = %d, xmax = %d"), b.x + b.bm[0] - 1, xmax[0] - 1);
      b.x = xmax[0] - 1 - b.bm[0] + 1 << 24 >> 24;
    }
    if (b.y + b.bm[1] - 1 > ymax[0] - 1) {
      await pline(S("bubble ymax: y = %d, ymax = %d"), b.y + b.bm[1] - 1, ymax[0] - 1);
      b.y = ymax[0] - 1 - b.bm[1] + 1 << 24 >> 24;
    }
    if (b.x === xmin[0] + 1 && dx < 0) {
      dx = -dx;
    }
    if (b.x + b.bm[0] - 1 === xmax[0] - 1 && dx > 0) {
      dx = -dx;
    }
    if (b.y === ymin[0] + 1 && dy < 0) {
      dy = -dy;
    }
    if (b.y + b.bm[1] - 1 === ymax[0] - 1 && dy > 0) {
      dy = -dy;
    }
    b.x = b.x + dx << 24 >> 24;
    b.y = b.y + dy << 24 >> 24;
  }
  for (i = 0, x = b.x; i < b.bm[0]; ++i, ++x) {
    for (j = 0, y = b.y; j < b.bm[1]; ++j, ++y) {
      if (b.bm[j + 2] & 1 << i) {
        if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
          $at2(G.level.locations, x, y).typ = AIR;
          $at2(G.level.locations, x, y).lit = 1;
          unblock_point(x, y);
        } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
          $at2(G.level.locations, x, y).typ = CLOUD;
          $at2(G.level.locations, x, y).lit = 1;
          block_point(x, y);
        }
      }
    }
  }
  if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    for (cons = b.cons; cons; cons = ctemp) {
      ctemp = cons.next;
      cons.x = cons.x + dx << 24 >> 24;
      cons.y = cons.y + dy << 24 >> 24;
      switch (cons.what) {
      case CONS_OBJ:
        {
          let olist = null;
          let otmp = null;
          for (olist = cons.list; olist; olist = otmp) {
            otmp = olist.v.v_nexthere;
            await place_object(olist, cons.x, cons.y);
            await stackobj(olist);
          }
          break;
        }
      case CONS_MON:
        {
          let mon = cons.list;
          if (!await mnearto(mon, cons.x, cons.y, TRUE)) {
            await elemental_clog(mon);
          }
          break;
        }
      case CONS_HERO:
        {
          let mtmp = !!G.level.monsters[cons.x][cons.y] ? G.level.monsters[cons.x][cons.y] : null;
          let ux0 = G.u.ux;
          let uy0 = G.u.uy;
          await u_on_newpos(cons.x, cons.y);
          await newsym(ux0, uy0);
          if (mtmp) {
            await mnexto(mtmp);
          }
          break;
        }
      case CONS_TRAP:
        {
          let btrap = cons.list;
          btrap.tx = cons.x;
          btrap.ty = cons.y;
          break;
        }
      default:
        await impossible(S("mv_bubble: unknown bubble contents"));
        break;
      }
      free(cons);
    }
    b.cons = null;
  }
  switch (colli) {
  case 1:
    b.dy = -b.dy << 24 >> 24;
    break;
  case 3:
    b.dy = -b.dy << 24 >> 24;
  case 2:
    b.dx = -b.dx << 24 >> 24;
    break;
  default:
    if (!ini && (b.dx || b.dy ? !rn2(20) ? 1 : 0 : !rn2(5) ? 1 : 0)) {
      b.dx = 1 - rn2(3) << 24 >> 24;
      b.dy = 1 - rn2(3) << 24 >> 24;
    }
  }
}

export function $init(): void {
  bughack = struct_lev_region.$of(anon_sp_lev_h_405.$of(COLNO, ROWNO), anon_sp_lev_h_408.$of(COLNO, ROWNO), 0, 0, 0, 0, new union_str_or_len());
  orcfruit = [S("paddle cactus"), S("dwarven root")];
  bbubbles = null;
  ebubbles = null;
  wportal = null;
  xmin = new Int32Array(1);
  xmin[0] = 0;
  ymin = new Int32Array(1);
  ymin[0] = 0;
  xmax = new Int32Array(1);
  xmax[0] = 0;
  ymax = new Int32Array(1);
  ymax[0] = 0;
  fix_wall_spines$spine_array = $ta(Int8Array, 16, [VWALL, HWALL, HWALL, HWALL, VWALL, TRCORNER, TLCORNER, TDWALL, VWALL, BRCORNER, BLCORNER, TUWALL, VWALL, TLWALL, TRWALL, CROSSWALL]);
  movebubbles$water_pos = struct_rm.$of(S_water + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))), WATER);
  movebubbles$air_pos = struct_rm.$of(S_cloud + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))), AIR, 0, 0, 0, 1);
  movebubbles$up = 0;
  mk_bubble$bm2 = $ta(Uint8Array, 3, [2, 1, 3]);
  mk_bubble$bm3 = $ta(Uint8Array, 4, [3, 2, 7, 7]);
  mk_bubble$bm4 = $ta(Uint8Array, 5, [4, 3, 6, 15, 6]);
  mk_bubble$bm5 = $ta(Uint8Array, 5, [5, 3, 14, 31, 14]);
  mk_bubble$bm6 = $ta(Uint8Array, 6, [6, 4, 30, 63, 63, 30]);
  mk_bubble$bm7 = $ta(Uint8Array, 6, [7, 4, 62, 127, 127, 62]);
  mk_bubble$bm8 = $ta(Uint8Array, 6, [8, 4, 126, 255, 255, 126]);
  mk_bubble$bmask = [P(mk_bubble$bm2),
P(mk_bubble$bm3),
P(mk_bubble$bm4),
P(mk_bubble$bm5),
P(mk_bubble$bm6),
P(mk_bubble$bm7),
P(mk_bubble$bm8)];
}
