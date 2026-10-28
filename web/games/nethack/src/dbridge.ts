// @ts-nocheck
// NetHack 3.6.7 dbridge.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { newsym } from './display.ts';
import { flooreffects } from './do.ts';
import { Monnam, hliquid, mon_nam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { is_fainted } from './eat.ts';
import { done } from './end.ts';
import { del_engr_at } from './engrave.ts';
import { scatter } from './explode.ts';
import { debugcore } from './files.ts';
import { revive_nasty, spoteffects } from './hack.ts';
import { dist2 } from './hacklib.ts';
import { delallobj, sobj_at } from './invent.ts';
import { mksobj_at, obj_extract_self } from './mkobj.ts';
import { minliquid, monkilled, wake_nearto, xkilled } from './mon.ts';
import { vtense } from './objnam.ts';
import { You, You_hear, You_see, impossible, pline, pline_The } from './pline.ts';
import { update_monster_region } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { place_monster } from './steed.ts';
import { enexto, teleds } from './teleport.ts';
import { deltrap, drown, lava_effects, t_at, unconscious } from './trap.ts';
import { block_point, does_block, unblock_point } from './vision.ts';
import { worm_known } from './worm.ts';
import { struct_entity, struct_monst, struct_nhcoord } from './structs.ts';
import { $at2, $rd, $sarr, $sat, $wr, G, P, S, strcat, strcpy } from './rt/index.ts';
import { BLINDED, BOULDER, BURNING, CONFUSION, CRUSHING, DBWALL, DB_DIR, DB_EAST, DB_ICE, DB_LAVA, DB_MOAT, DB_NORTH, DB_SOUTH, DB_UNDER, DB_WEST, DEAF, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, DROWNING, D_NODOOR, ENTITIES, FALSE, FLYING, FUMBLING, HALLUC, HALLUC_RES, ICE, ICED_MOAT, INFRAVISION, IRON_CHAIN, KILLED_BY_AN, LAVAPOOL, LEVITATION, MAGICAL_BREATHING, MAY_HIT, MOAT, NO_KILLER_PREFIX, PASSES_WALLS, PM_LONG_WORM_TAIL, POOL, ROOM, SEE_INVIS, STONE, STUNNED, SWIMMING, S_EYE, S_GHOST, S_LIGHT, TRUE, WATER, WWALKING, W_NONDIGGABLE, XKILL_GIVEMSG, XKILL_NOCORPSE, XKILL_NOMSG } from './consts.ts';

let occupants: any;
let E_phrase$wholebuf: any;

export function is_pool(x: number, y: number): number {
  let ltyp = 0;
  if (!isok(x, y)) {
    return FALSE;
  }
  ltyp = $at2(G.level.locations, x, y).typ;
  if (ltyp === POOL || ltyp === MOAT || ltyp === WATER || is_moat(x, y)) {
    return TRUE;
  }
  return FALSE;
}

export function is_lava(x: number, y: number): number {
  let ltyp = 0;
  if (!isok(x, y)) {
    return FALSE;
  }
  ltyp = $at2(G.level.locations, x, y).typ;
  if (ltyp === LAVAPOOL || ltyp === DRAWBRIDGE_UP && (($at2(G.level.locations, x, y).flags | 0) & DB_UNDER) === DB_LAVA) {
    return TRUE;
  }
  return FALSE;
}

export function is_pool_or_lava(x: number, y: number): number {
  if (is_pool(x, y) || is_lava(x, y)) {
    return TRUE;
  } else {
    return FALSE;
  }
}

export function is_ice(x: number, y: number): number {
  let ltyp = 0;
  if (!isok(x, y)) {
    return FALSE;
  }
  ltyp = $at2(G.level.locations, x, y).typ;
  if (ltyp === ICE || ltyp === DRAWBRIDGE_UP && (($at2(G.level.locations, x, y).flags | 0) & DB_UNDER) === DB_ICE) {
    return TRUE;
  }
  return FALSE;
}

export function is_moat(x: number, y: number): number {
  let ltyp = 0;
  if (!isok(x, y)) {
    return FALSE;
  }
  ltyp = $at2(G.level.locations, x, y).typ;
  if (!((G.dungeon_topology.d_juiblex_level.dlevel || G.dungeon_topology.d_juiblex_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_juiblex_level)) && (ltyp === MOAT || ltyp === DRAWBRIDGE_UP && (($at2(G.level.locations, x, y).flags | 0) & DB_UNDER) === DB_MOAT)) {
    return TRUE;
  }
  return FALSE;
}

export function db_under_typ(mask: number): number {
  switch (mask & DB_UNDER) {
  case 8:
    return ICE;
  case 4:
    return LAVAPOOL;
  case 0:
    return MOAT;
  default:
    return STONE;
  }
}

export function is_drawbridge_wall(x: number, y: number): number {
  let lev = null;
  lev = $sat(G.level.locations[x], y);
  if (lev.typ !== DOOR && lev.typ !== DBWALL) {
    return -1;
  }
  if (($at2(G.level.locations, x + 1, y).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x + 1, y).typ === DRAWBRIDGE_DOWN) && (($at2(G.level.locations, x + 1, y).flags | 0) & DB_DIR) === DB_WEST) {
    return DB_WEST;
  }
  if (($at2(G.level.locations, x - 1, y).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x - 1, y).typ === DRAWBRIDGE_DOWN) && (($at2(G.level.locations, x - 1, y).flags | 0) & DB_DIR) === DB_EAST) {
    return DB_EAST;
  }
  if (($at2(G.level.locations, x, y - 1).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x, y - 1).typ === DRAWBRIDGE_DOWN) && (($at2(G.level.locations, x, y - 1).flags | 0) & DB_DIR) === DB_SOUTH) {
    return DB_SOUTH;
  }
  if (($at2(G.level.locations, x, y + 1).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x, y + 1).typ === DRAWBRIDGE_DOWN) && (($at2(G.level.locations, x, y + 1).flags | 0) & DB_DIR) === DB_NORTH) {
    return DB_NORTH;
  }
  return -1;
}

export function is_db_wall(x: number, y: number): number {
  return ($at2(G.level.locations, x, y).typ === DBWALL ? 1 : 0) << 24 >> 24;
}

export function find_drawbridge(x: Ptr | null, y: Ptr | null): number {
  let dir = 0;
  if ($at2(G.level.locations, x.a[x.o], y.a[y.o]).typ === DRAWBRIDGE_UP || $at2(G.level.locations, x.a[x.o], y.a[y.o]).typ === DRAWBRIDGE_DOWN) {
    return TRUE;
  }
  dir = is_drawbridge_wall(x.a[x.o], y.a[y.o]);
  if (dir >= 0) {
    switch (dir) {
    case 0:
      ++y.a[y.o];
      break;
    case 1:
      --y.a[y.o];
      break;
    case 2:
      --x.a[x.o];
      break;
    case 3:
      ++x.a[x.o];
      break;
    }
    return TRUE;
  }
  return FALSE;
}

function get_wall_for_db(x: Ptr | null, y: Ptr | null): void {
  switch (($at2(G.level.locations, x.a[x.o], y.a[y.o]).flags | 0) & DB_DIR) {
  case 0:
    --y.a[y.o];
    break;
  case 1:
    ++y.a[y.o];
    break;
  case 2:
    ++x.a[x.o];
    break;
  case 3:
    --x.a[x.o];
    break;
  }
}

export async function create_drawbridge(x: number, y: number, dir: number, flag: number): Promise<number> {
  let $t1: any;
  let x2 = 0;
  let y2 = 0;
  let horiz = 0;
  let lava = ($at2(G.level.locations, x, y).typ === LAVAPOOL ? 1 : 0) << 24 >> 24;
  x2 = x;
  y2 = y;
  switch (dir) {
  case 0:
    horiz = TRUE;
    --y2;
    break;
  case 1:
    horiz = TRUE;
    ++y2;
    break;
  case 2:
    horiz = FALSE;
    ++x2;
    break;
  default:
    await impossible(S("bad direction in create_drawbridge"));
  case 3:
    horiz = FALSE;
    --x2;
    break;
  }
  if (!($at2(G.level.locations, x2, y2).typ && $at2(G.level.locations, x2, y2).typ <= DBWALL)) {
    return FALSE;
  }
  if (flag) {
    $at2(G.level.locations, x, y).typ = DRAWBRIDGE_DOWN;
    $at2(G.level.locations, x2, y2).typ = DOOR;
    $at2(G.level.locations, x2, y2).flags = (D_NODOOR) & 31;
  } else {
    $at2(G.level.locations, x, y).typ = DRAWBRIDGE_UP;
    $at2(G.level.locations, x2, y2).typ = DBWALL;
    $at2(G.level.locations, x2, y2).flags = (W_NONDIGGABLE) & 31;
  }
  $at2(G.level.locations, x, y).horizontal = ((!horiz ? 1 : 0) >>> 0) & 1;
  $at2(G.level.locations, x2, y2).horizontal = (horiz >>> 0) & 1;
  $at2(G.level.locations, x, y).flags = (dir >>> 0) & 31;
  if (lava) {
    ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | DB_LAVA) >>> 0) & 31);
  }
  return TRUE;
}

async function e_at(x: number, y: number): Promise<struct_entity | null> {
  let entitycnt = 0;
  for (entitycnt = 0; entitycnt < ENTITIES; ++entitycnt) {
    if (occupants[entitycnt].edata && occupants[entitycnt].ex === x && occupants[entitycnt].ey === y) {
      break;
    }
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("entitycnt = %d"), entitycnt);
    }
  } while (0);
  return entitycnt === ENTITIES ? null : $sat(occupants, entitycnt);
}

function m_to_e(mtmp: struct_monst | null, x: number, y: number, etmp: struct_entity | null): void {
  etmp.emon = mtmp;
  if (mtmp) {
    etmp.ex = x;
    etmp.ey = y;
    if (mtmp.wormno | 0 && (x !== mtmp.mx || y !== mtmp.my)) {
      etmp.edata = $sat(G.mons, PM_LONG_WORM_TAIL);
    } else {
      etmp.edata = mtmp.data;
    }
  } else {
    etmp.edata = null;
  }
}

function u_to_e(etmp: struct_entity | null): void {
  etmp.emon = G.youmonst;
  etmp.ex = G.u.ux;
  etmp.ey = G.u.uy;
  etmp.edata = G.youmonst.data;
}

function set_entity(x: number, y: number, etmp: struct_entity | null): void {
  if (x === G.u.ux && y === G.u.uy) {
    u_to_e(etmp);
  } else if (!!G.level.monsters[x][y]) {
    m_to_e(!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null, x, y, etmp);
  } else {
    etmp.edata = null;
  }
}

async function e_nam(etmp: struct_entity | null): Promise<Ptr | null> {
  return etmp.emon === G.youmonst ? S("you") : await mon_nam(etmp.emon);
}

async function E_phrase(etmp: struct_entity | null, verb: Ptr | null): Promise<Ptr | null> {
  strcpy(P(E_phrase$wholebuf), etmp.emon === G.youmonst ? S("You") : await Monnam(etmp.emon));
  if (!verb || !verb.a[verb.o]) {
    return P(E_phrase$wholebuf);
  }
  strcat(P(E_phrase$wholebuf), S(" "));
  if (etmp.emon === G.youmonst) {
    strcat(P(E_phrase$wholebuf), verb);
  } else {
    strcat(P(E_phrase$wholebuf), vtense(null, verb));
  }
  return P(E_phrase$wholebuf);
}

function e_survives_at(etmp: struct_entity | null, x: number, y: number): number {
  if (etmp.edata.mlet === S_GHOST) {
    return TRUE;
  }
  if (is_pool(x, y)) {
    return (etmp.emon === G.youmonst && (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) || (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) || (G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) || (etmp.edata.mflags1 & 2) >>> 0 !== 0 || (etmp.edata.mflags1 & 1) >>> 0 !== 0 || (etmp.edata.mlet === S_EYE || etmp.edata.mlet === S_LIGHT) ? 1 : 0) << 24 >> 24;
  }
  if (is_lava(x, y)) {
    return (etmp.emon === G.youmonst && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) || (etmp.edata === $sat(G.mons, 152) || etmp.edata === $sat(G.mons, 326)) || (etmp.edata.mflags1 & 1) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (is_db_wall(x, y)) {
    return (etmp.emon === G.youmonst ? G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic ? 1 : 0 : (etmp.edata.mflags1 & 8) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  return TRUE;
}

async function e_died(etmp: struct_entity | null, xkill_flags: number, how: number): Promise<void> {
  if (etmp.emon === G.youmonst) {
    if (how === DROWNING) {
      G.killer.name[0] = 0;
      await drown();
    } else if (how === BURNING) {
      G.killer.name[0] = 0;
      await lava_effects();
    } else {
      let xy = new struct_nhcoord();
      if (!G.killer.name[0]) {
        G.killer.format = KILLED_BY_AN;
        strcpy(P(G.killer.name), S("falling drawbridge"));
      }
      await done(how);
      if (!e_survives_at(etmp, etmp.ex, etmp.ey)) {
        if (await enexto(xy, etmp.ex, etmp.ey, etmp.edata)) {
          await pline(S("A %s force teleports you away..."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
          await teleds(xy.x, xy.y, FALSE);
        }
      }
    }
    etmp.ex = G.u.ux, etmp.ey = G.u.uy;
  } else {
    let entitycnt = 0;
    G.killer.name[0] = 0;
    if (G.context.mon_moving) {
      await monkilled(etmp.emon, (xkill_flags & 1) !== 0 ? null : S(""), (xkill_flags & 2) !== 0 ? 26 : 0);
    } else {
      await xkilled(etmp.emon, xkill_flags);
    }
    etmp.edata = null;
    for (entitycnt = 0; entitycnt < ENTITIES; ++entitycnt) {
      if (etmp !== $sat(occupants, entitycnt) && etmp.emon === occupants[entitycnt].emon) {
        occupants[entitycnt].edata = null;
      }
    }
  }
}

function automiss(etmp: struct_entity | null): number {
  return ((etmp.emon === G.youmonst ? G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic ? 1 : 0 : (etmp.edata.mflags1 & 8) >>> 0 !== 0 ? 1 : 0) || etmp.edata.mlet === S_GHOST ? 1 : 0) << 24 >> 24;
}

async function e_missed(etmp: struct_entity | null, chunks: number): Promise<number> {
  let misses = 0;
  if (chunks) {
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("Do chunks miss?"));
      }
    } while (0);
  }
  if (automiss(etmp)) {
    return TRUE;
  }
  if ((etmp.edata.mflags1 & 1) >>> 0 !== 0 && (etmp.emon === G.youmonst ? !(G.multi < 0 && (unconscious() || is_fainted())) ? 1 : 0 : etmp.emon.mcanmove | 0 && !etmp.emon.msleeping ? 1 : 0)) {
    misses = 5;
  } else if (etmp.edata.mlet === S_EYE || etmp.edata.mlet === S_LIGHT || etmp.emon === G.youmonst && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
    misses = 3;
  } else if (chunks && is_pool(etmp.ex, etmp.ey)) {
    misses = 2;
  } else {
    misses = 0;
  }
  if (is_db_wall(etmp.ex, etmp.ey)) {
    misses -= 3;
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("Miss chance = %d (out of 8)"), misses);
    }
  } while (0);
  return (misses >= rnd(8) ? TRUE : FALSE) << 24 >> 24;
}

async function e_jumps(etmp: struct_entity | null): Promise<number> {
  let tmp = 4;
  if (etmp.emon === G.youmonst ? G.multi < 0 && (unconscious() || is_fainted()) || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) ? 1 : 0 : !etmp.emon.mcanmove || etmp.emon.msleeping | 0 || !etmp.edata.mmove || etmp.emon.wormno | 0 ? 1 : 0) {
    return FALSE;
  }
  if (etmp.emon === G.youmonst ? G.u.uprops[CONFUSION].intrinsic : etmp.emon.mconf) {
    tmp -= 2;
  }
  if (etmp.emon === G.youmonst ? G.u.uprops[STUNNED].intrinsic : etmp.emon.mstun) {
    tmp -= 3;
  }
  if (is_db_wall(etmp.ex, etmp.ey)) {
    tmp -= 2;
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("%s to jump (%d chances in 10)"), await E_phrase(etmp, S("try")), tmp);
    }
  } while (0);
  return (tmp >= rnd(10) ? TRUE : FALSE) << 24 >> 24;
}

async function do_entity(etmp: struct_entity | null): Promise<void> {
  const newx = new Int32Array(1);
  const newy = new Int32Array(1);
  let at_portcullis = 0;
  let oldx = 0;
  let oldy = 0;
  let must_jump = FALSE;
  let relocates = FALSE;
  let e_inview = 0;
  let crm = null;
  if (!etmp.edata) {
    return;
  }
  e_inview = (etmp.emon === G.youmonst ? 1 : (etmp.emon.wormno | 0 ? worm_known(etmp.emon) : $rd(G.viz_array.a[G.viz_array.o + etmp.emon.my], etmp.emon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && etmp.emon && etmp.emon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + etmp.emon.my], etmp.emon.mx) & 1 ? 1 : 0) && ((!etmp.emon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !etmp.emon.mundetected) ? 1 : 0) << 24 >> 24;
  oldx = etmp.ex;
  oldy = etmp.ey;
  at_portcullis = is_db_wall(oldx, oldy);
  crm = $sat(G.level.locations[oldx], oldy);
  if (automiss(etmp) && e_survives_at(etmp, oldx, oldy)) {
    if (e_inview && (at_portcullis || (crm.typ === DRAWBRIDGE_UP || crm.typ === DRAWBRIDGE_DOWN))) {
      await pline_The(S("%s passes through %s!"), at_portcullis ? S("portcullis") : S("drawbridge"), await e_nam(etmp));
    }
    if (etmp.emon === G.youmonst) {
      await spoteffects(FALSE);
    }
    return;
  }
  if (await e_missed(etmp, FALSE)) {
    if (at_portcullis) {
      await pline_The(S("portcullis misses %s!"), await e_nam(etmp));
    } else {
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("The drawbridge misses %s!"), await e_nam(etmp));
        }
      } while (0);
    }
    if (e_survives_at(etmp, oldx, oldy)) {
      return;
    } else {
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("Mon can't survive here"));
        }
      } while (0);
      if (at_portcullis) {
        must_jump = TRUE;
      } else {
        relocates = TRUE;
      }
    }
  } else {
    if (crm.typ === DRAWBRIDGE_DOWN) {
      if (etmp.emon === G.youmonst) {
        G.killer.format = NO_KILLER_PREFIX;
        strcpy(P(G.killer.name), S("crushed to death underneath a drawbridge"));
      }
      await pline(S("%s crushed underneath the drawbridge."), await E_phrase(etmp, S("are")));
      await e_died(etmp, XKILL_NOCORPSE | (e_inview ? XKILL_GIVEMSG : XKILL_NOMSG), CRUSHING);
      return;
    }
    must_jump = TRUE;
  }
  if (must_jump) {
    if (at_portcullis) {
      if (await e_jumps(etmp)) {
        relocates = TRUE;
        do {
          if (await debugcore(S("dbridge.c"), 1)) {
            await pline(S("Jump succeeds!"));
          }
        } while (0);
      } else {
        if (e_inview) {
          await pline(S("%s crushed by the falling portcullis!"), await E_phrase(etmp, S("are")));
        } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await You_hear(S("a crushing sound."));
        }
        await e_died(etmp, XKILL_NOCORPSE | (e_inview ? XKILL_GIVEMSG : XKILL_NOMSG), CRUSHING);
        return;
      }
    } else {
      relocates = (!await e_jumps(etmp) ? 1 : 0) << 24 >> 24;
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("Jump %s!"), relocates ? S("fails") : S("succeeds"));
        }
      } while (0);
    }
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("Doing relocation."));
    }
  } while (0);
  newx[0] = oldx;
  newy[0] = oldy;
  find_drawbridge(P(newx, 0), P(newy, 0));
  if (newx[0] === oldx && newy[0] === oldy) {
    get_wall_for_db(P(newx, 0), P(newy, 0));
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("Checking new square for occupancy."));
    }
  } while (0);
  if (relocates && await e_at(newx[0], newy[0])) {
    let other = null;
    other = await e_at(newx[0], newy[0]);
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("New square is occupied by %s"), await e_nam(other));
      }
    } while (0);
    if (e_survives_at(other, newx[0], newy[0]) && automiss(other)) {
      relocates = FALSE;
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("%s suicide."), await E_phrase(etmp, S("commit")));
        }
      } while (0);
    } else {
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("Handling %s"), await e_nam(other));
        }
      } while (0);
      while (!!await e_at(newx[0], newy[0]) && await e_at(newx[0], newy[0]) !== etmp) {
        await do_entity(other);
      }
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("Checking existence of %s"), await e_nam(etmp));
        }
      } while (0);
      if (await e_at(oldx, oldy) !== etmp) {
        do {
          if (await debugcore(S("dbridge.c"), 1)) {
            await pline(S("%s moved or died in recursion somewhere"), await E_phrase(etmp, S("have")));
          }
        } while (0);
        return;
      }
    }
  }
  if (relocates && !await e_at(newx[0], newy[0])) {
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("Moving %s"), await e_nam(etmp));
      }
    } while (0);
    if (!(etmp.emon === G.youmonst)) {
      G.level.monsters[etmp.ex][etmp.ey] = null;
      await place_monster(etmp.emon, newx[0], newy[0]);
      await update_monster_region(etmp.emon);
    } else {
      G.u.ux = newx[0] << 24 >> 24;
      G.u.uy = newy[0] << 24 >> 24;
    }
    etmp.ex = newx[0];
    etmp.ey = newy[0];
    e_inview = (etmp.emon === G.youmonst ? 1 : (etmp.emon.wormno | 0 ? worm_known(etmp.emon) : $rd(G.viz_array.a[G.viz_array.o + etmp.emon.my], etmp.emon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && etmp.emon && etmp.emon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + etmp.emon.my], etmp.emon.mx) & 1 ? 1 : 0) && ((!etmp.emon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !etmp.emon.mundetected) ? 1 : 0) << 24 >> 24;
  }
  do {
    if (await debugcore(S("dbridge.c"), 1)) {
      await pline(S("Final disposition of %s"), await e_nam(etmp));
    }
  } while (0);
  if (is_db_wall(etmp.ex, etmp.ey)) {
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("%s in portcullis chamber"), await E_phrase(etmp, S("are")));
      }
    } while (0);
    if (e_inview) {
      if (etmp.emon === G.youmonst) {
        await You(S("tumble towards the closed portcullis!"));
        if (automiss(etmp)) {
          await You(S("pass through it!"));
        } else {
          await pline_The(S("drawbridge closes in..."));
        }
      } else {
        await pline(S("%s behind the drawbridge."), await E_phrase(etmp, S("disappear")));
      }
    }
    if (!e_survives_at(etmp, etmp.ex, etmp.ey)) {
      G.killer.format = KILLED_BY_AN;
      strcpy(P(G.killer.name), S("closing drawbridge"));
      await e_died(etmp, XKILL_NOMSG, CRUSHING);
      return;
    }
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("%s in here"), await E_phrase(etmp, S("survive")));
      }
    } while (0);
  } else {
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("%s on drawbridge square"), await E_phrase(etmp, S("are")));
      }
    } while (0);
    if (is_pool(etmp.ex, etmp.ey) && !e_inview) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You_hear(S("a splash."));
      }
    }
    if (e_survives_at(etmp, etmp.ex, etmp.ey)) {
      if (e_inview && !((etmp.edata.mflags1 & 1) >>> 0 !== 0) && !(etmp.edata.mlet === S_EYE || etmp.edata.mlet === S_LIGHT)) {
        await pline(S("%s from the bridge."), await E_phrase(etmp, S("fall")));
      }
      return;
    }
    do {
      if (await debugcore(S("dbridge.c"), 1)) {
        await pline(S("%s cannot survive on the drawbridge square"), await E_phrase(etmp, null));
      }
    } while (0);
    if (is_pool(etmp.ex, etmp.ey) || is_lava(etmp.ex, etmp.ey)) {
      if (e_inview && !(etmp.emon === G.youmonst)) {
        let lava = is_lava(etmp.ex, etmp.ey);
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          await pline(S("%s the %s and disappears."), await E_phrase(etmp, S("drink")), lava ? S("lava") : S("moat"));
        } else {
          await pline(S("%s into the %s."), await E_phrase(etmp, S("fall")), lava ? hliquid(S("lava")) : S("moat"));
        }
      }
    }
    G.killer.format = NO_KILLER_PREFIX;
    strcpy(P(G.killer.name), S("fell from a drawbridge"));
    await e_died(etmp, XKILL_NOCORPSE | (e_inview ? XKILL_GIVEMSG : XKILL_NOMSG), is_pool(etmp.ex, etmp.ey) ? DROWNING : is_lava(etmp.ex, etmp.ey) ? BURNING : CRUSHING);
    return;
  }
}

export async function close_drawbridge(x: number, y: number): Promise<void> {
  let lev1 = null;
  let lev2 = null;
  let t = null;
  const x2 = new Int32Array(1);
  const y2 = new Int32Array(1);
  lev1 = $sat(G.level.locations[x], y);
  if (lev1.typ !== DRAWBRIDGE_DOWN) {
    return;
  }
  x2[0] = x;
  y2[0] = y;
  get_wall_for_db(P(x2, 0), P(y2, 0));
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 || $rd(G.viz_array.a[G.viz_array.o + y2[0]], x2[0]) & 2) {
    await You_see(S("a drawbridge %s up!"), (G.u.ux === x || G.u.uy === y) && !G.u.uinwater || dist2(x2[0], y2[0], G.u.ux, G.u.uy) < dist2(x, y, G.u.ux, G.u.uy) ? S("coming") : S("going"));
  } else {
    await You_hear(S("chains rattling and gears turning."));
  }
  lev1.typ = DRAWBRIDGE_UP;
  lev2 = $sat(G.level.locations[x2[0]], y2[0]);
  lev2.typ = DBWALL;
  switch ((lev1.flags | 0) & DB_DIR) {
  case 0:
  case 1:
    lev2.horizontal = (TRUE) & 1;
    break;
  case 3:
  case 2:
    lev2.horizontal = (FALSE) & 1;
    break;
  }
  lev2.flags = (W_NONDIGGABLE) & 31;
  set_entity(x, y, occupants[0]);
  set_entity(x2[0], y2[0], occupants[1]);
  await do_entity(occupants[0]);
  set_entity(x2[0], y2[0], occupants[1]);
  await do_entity(occupants[1]);
  if (!!G.level.objects[x][y] && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    await You_hear(S("smashing and crushing."));
  }
  await revive_nasty(x, y, null);
  await revive_nasty(x2[0], y2[0], null);
  await delallobj(x, y);
  await delallobj(x2[0], y2[0]);
  if (!!(t = t_at(x, y))) {
    await deltrap(t);
  }
  if (!!(t = t_at(x2[0], y2[0]))) {
    await deltrap(t);
  }
  await del_engr_at(x, y);
  await del_engr_at(x2[0], y2[0]);
  await newsym(x, y);
  await newsym(x2[0], y2[0]);
  block_point(x2[0], y2[0]);
  G.killer.name[0] = 0, G.killer.format = 0;
}

export async function open_drawbridge(x: number, y: number): Promise<void> {
  let lev1 = null;
  let lev2 = null;
  let t = null;
  const x2 = new Int32Array(1);
  const y2 = new Int32Array(1);
  lev1 = $sat(G.level.locations[x], y);
  if (lev1.typ !== DRAWBRIDGE_UP) {
    return;
  }
  x2[0] = x;
  y2[0] = y;
  get_wall_for_db(P(x2, 0), P(y2, 0));
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 || $rd(G.viz_array.a[G.viz_array.o + y2[0]], x2[0]) & 2) {
    await You_see(S("a drawbridge %s down!"), dist2(x2[0], y2[0], G.u.ux, G.u.uy) < dist2(x, y, G.u.ux, G.u.uy) ? S("going") : S("coming"));
  } else {
    await You_hear(S("gears turning and chains rattling."));
  }
  lev1.typ = DRAWBRIDGE_DOWN;
  lev2 = $sat(G.level.locations[x2[0]], y2[0]);
  lev2.typ = DOOR;
  lev2.flags = (D_NODOOR) & 31;
  set_entity(x, y, occupants[0]);
  set_entity(x2[0], y2[0], occupants[1]);
  await do_entity(occupants[0]);
  set_entity(x2[0], y2[0], occupants[1]);
  await do_entity(occupants[1]);
  await revive_nasty(x, y, null);
  await delallobj(x, y);
  if (!!(t = t_at(x, y))) {
    await deltrap(t);
  }
  if (!!(t = t_at(x2[0], y2[0]))) {
    await deltrap(t);
  }
  await del_engr_at(x, y);
  await del_engr_at(x2[0], y2[0]);
  await newsym(x, y);
  await newsym(x2[0], y2[0]);
  unblock_point(x2[0], y2[0]);
  if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
    G.u.uevent.uopened_dbridge = (TRUE) & 1;
  }
  G.killer.name[0] = 0, G.killer.format = 0;
}

export async function destroy_drawbridge(x: number, y: number): Promise<void> {
  let lev1 = null;
  let lev2 = null;
  let t = null;
  let otmp = null;
  const x2 = new Int32Array(1);
  const y2 = new Int32Array(1);
  let i = 0;
  let e_inview = 0;
  let etmp1 = occupants[0];
  let etmp2 = occupants[1];
  lev1 = $sat(G.level.locations[x], y);
  if (!(lev1.typ === DRAWBRIDGE_UP || lev1.typ === DRAWBRIDGE_DOWN)) {
    return;
  }
  x2[0] = x;
  y2[0] = y;
  get_wall_for_db(P(x2, 0), P(y2, 0));
  lev2 = $sat(G.level.locations[x2[0]], y2[0]);
  if (((lev1.flags | 0) & DB_UNDER) === DB_MOAT || ((lev1.flags | 0) & DB_UNDER) === DB_LAVA) {
    let otmp2 = null;
    let lava = (((lev1.flags | 0) & DB_UNDER) === DB_LAVA ? 1 : 0) << 24 >> 24;
    if (lev1.typ === DRAWBRIDGE_UP) {
      if ($rd(G.viz_array.a[G.viz_array.o + y2[0]], x2[0]) & 2) {
        await pline_The(S("portcullis of the drawbridge falls into the %s!"), lava ? hliquid(S("lava")) : S("moat"));
      } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You_hear(S("a loud *SPLASH*!"));
      }
    } else {
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline_The(S("drawbridge collapses into the %s!"), lava ? hliquid(S("lava")) : S("moat"));
      } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You_hear(S("a loud *SPLASH*!"));
      }
    }
    lev1.typ = (lava ? LAVAPOOL : MOAT) << 24 >> 24;
    lev1.flags = 0;
    if (!!(otmp2 = sobj_at(BOULDER, x, y))) {
      await obj_extract_self(otmp2);
      await flooreffects(otmp2, x, y, S("fall"));
    }
  } else {
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await pline_The(S("drawbridge disintegrates!"));
    } else {
      await You_hear(S("a loud *CRASH*!"));
    }
    lev1.typ = ((lev1.flags | 0) & DB_ICE ? ICE : ROOM) << 24 >> 24;
    lev1.flags = (((lev1.flags | 0) & DB_ICE ? ICED_MOAT : 0) >>> 0) & 31;
  }
  wake_nearto(x, y, 500);
  lev2.typ = DOOR;
  lev2.flags = (D_NODOOR) & 31;
  if (!!(t = t_at(x, y))) {
    await deltrap(t);
  }
  if (!!(t = t_at(x2[0], y2[0]))) {
    await deltrap(t);
  }
  await del_engr_at(x, y);
  await del_engr_at(x2[0], y2[0]);
  for (i = rn2(6); i > 0; --i) {
    otmp = await mksobj_at(IRON_CHAIN, rn2(2) ? x : x2[0], rn2(2) ? y : y2[0], TRUE, FALSE);
    await scatter(otmp.ox, otmp.oy, 1, MAY_HIT, otmp);
  }
  await newsym(x, y);
  await newsym(x2[0], y2[0]);
  if (!does_block(x2[0], y2[0], lev2)) {
    unblock_point(x2[0], y2[0]);
  }
  if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
    G.u.uevent.uopened_dbridge = (TRUE) & 1;
  }
  set_entity(x2[0], y2[0], etmp2);
  if (etmp2.edata) {
    e_inview = (etmp2.emon === G.youmonst ? 1 : (etmp2.emon.wormno | 0 ? worm_known(etmp2.emon) : $rd(G.viz_array.a[G.viz_array.o + etmp2.emon.my], etmp2.emon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && etmp2.emon && etmp2.emon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + etmp2.emon.my], etmp2.emon.mx) & 1 ? 1 : 0) && ((!etmp2.emon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !etmp2.emon.mundetected) ? 1 : 0) << 24 >> 24;
    if (!automiss(etmp2)) {
      if (e_inview) {
        await pline(S("%s blown apart by flying debris."), await E_phrase(etmp2, S("are")));
      }
      G.killer.format = KILLED_BY_AN;
      strcpy(P(G.killer.name), S("exploding drawbridge"));
      await e_died(etmp2, XKILL_NOCORPSE | (e_inview ? XKILL_GIVEMSG : XKILL_NOMSG), CRUSHING);
    }
  }
  set_entity(x, y, etmp1);
  if (etmp1.edata) {
    e_inview = (etmp1.emon === G.youmonst ? 1 : (etmp1.emon.wormno | 0 ? worm_known(etmp1.emon) : $rd(G.viz_array.a[G.viz_array.o + etmp1.emon.my], etmp1.emon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && etmp1.emon && etmp1.emon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + etmp1.emon.my], etmp1.emon.mx) & 1 ? 1 : 0) && ((!etmp1.emon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !etmp1.emon.mundetected) ? 1 : 0) << 24 >> 24;
    if (await e_missed(etmp1, TRUE)) {
      do {
        if (await debugcore(S("dbridge.c"), 1)) {
          await pline(S("%s spared!"), await E_phrase(etmp1, S("are")));
        }
      } while (0);
      if (etmp1.emon === G.youmonst) {
        await spoteffects(FALSE);
      } else {
        await minliquid(etmp1.emon);
      }
    } else {
      if (e_inview) {
        if (!(etmp1.emon === G.youmonst) && (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await pline(S("%s into some heavy metal!"), await E_phrase(etmp1, S("get")));
        } else {
          await pline(S("%s hit by a huge chunk of metal!"), await E_phrase(etmp1, S("are")));
        }
      } else {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(etmp1.emon === G.youmonst) && !is_pool(x, y)) {
          await You_hear(S("a crushing sound."));
        } else {
          do {
            if (await debugcore(S("dbridge.c"), 1)) {
              await pline(S("%s from shrapnel"), await E_phrase(etmp1, S("die")));
            }
          } while (0);
        }
      }
      G.killer.format = KILLED_BY_AN;
      strcpy(P(G.killer.name), S("collapsing drawbridge"));
      await e_died(etmp1, XKILL_NOCORPSE | (e_inview ? XKILL_GIVEMSG : XKILL_NOMSG), CRUSHING);
      if ($at2(G.level.locations, etmp1.ex, etmp1.ey).typ === MOAT) {
        await do_entity(etmp1);
      }
    }
  }
  G.killer.name[0] = 0, G.killer.format = 0;
}

export function $init(): void {
  occupants = $sarr(struct_entity, 2);
  E_phrase$wholebuf = new Int8Array(80);
}
