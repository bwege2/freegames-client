// @ts-nocheck
// NetHack 3.6.7 mkroom.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { In_hell, induced_align, level_difficulty } from './dungeon.ts';
import { make_grave } from './engrave.ts';
import { dist2, distmin } from './hacklib.ts';
import { sobj_at } from './invent.ts';
import { makemon, mkclass, mongets, set_malign } from './makemon.ts';
import { ndemon } from './minion.ts';
import { occupied, topologize } from './mklev.ts';
import { add_to_container, mk_tt_object, mkgold, mkobj, mkobj_at, mksobj, mksobj_at, weight } from './mkobj.ts';
import { nh_getenv } from './options.ts';
import { impossible, pline } from './pline.ts';
import { priestini } from './priest.ts';
import { mread } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { stock_room } from './shknam.ts';
import { enexto } from './teleport.ts';
import { t_at } from './trap.ts';
import { revive } from './zap.ts';
import { anon_mkroom_c_762, struct_mkroom, struct_nhcoord, struct_permonst } from './structs.ts';
import { $at2, $sadd, $sarrOf, $sat, $sdiff, G, P, S } from './rt/index.ts';
import { AIR, ALTAR, AM_SHRINE, ANTHOLE, ANY_SHOP, ANY_TYPE, A_NONE, BARRACKS, BEEHIVE, BLCORNER, BRCORNER, CHEST, CLOUD, COCKNEST, CORPSE, CORR, COURT, CROSSWALL, DBWALL, DOOR, DRAWBRIDGE_DOWN, FALSE, FODDERSHOP, FOOD_CLASS, FOUNTAIN, GOLD_PIECE, GRAVE, G_GONE, HWALL, ICE, IRONBARS, LADDER, LARGE_BOX, LAVAPOOL, LEPREHALL, LUMP_OF_ROYAL_JELLY, MACE, MM_ASLEEP, MORGUE, NON_PM, NO_MM_FLAGS, NSTYPES, OROOM, PM_BUGBEAR, PM_CAPTAIN, PM_COCKATRICE, PM_DWARF_KING, PM_ELECTRIC_EEL, PM_ELVENKING, PM_FIRE_ANT, PM_GHOST, PM_GIANT_ANT, PM_GIANT_EEL, PM_GNOME_KING, PM_HOBGOBLIN, PM_KILLER_BEE, PM_LEPRECHAUN, PM_LIEUTENANT, PM_OGRE_KING, PM_PIRANHA, PM_QUEEN_BEE, PM_SERGEANT, PM_SOLDIER, PM_SOLDIER_ANT, PM_WRAITH, POOL, RANDOM_CLASS, ROOM, ROOMOFFSET, SDOOR, SHOPBASE, SINK, SPBOOK_CLASS, STAIRS, STATUE, STONE, SWAMP, S_CENTAUR, S_DEMON, S_DRAGON, S_FUNGUS, S_GIANT, S_GNOME, S_KOBOLD, S_ORC, S_TROLL, S_VAMPIRE, S_ZOMBIE, S_air, S_altar, S_bars, S_blcorn, S_brcorn, S_cloud, S_corr, S_crwall, S_dnladder, S_dnstair, S_fountain, S_grave, S_hcdbridge, S_hcdoor, S_hodbridge, S_hodoor, S_hwall, S_ice, S_lava, S_litcorr, S_ndoor, S_pool, S_room, S_sink, S_stone, S_tdwall, S_throne, S_tlcorn, S_tlwall, S_trcorn, S_tree, S_trwall, S_tuwall, S_upladder, S_upstair, S_vcdbridge, S_vcdoor, S_vodbridge, S_vodoor, S_vwall, S_water, TDWALL, TEMPLE, THRONE, TLCORNER, TLWALL, TRCORNER, TREE, TRUE, TRWALL, TUWALL, VWALL, WAND_CLASS, WATER, ZOO } from './consts.ts';

let squadprob: any;
let shrine_pos$buf: struct_nhcoord;

function isbig(sroom: struct_mkroom | null): number {
  let area = Math.imul(sroom.hx - sroom.lx + 1, sroom.hy - sroom.ly + 1);
  return (area > 20 ? 1 : 0) << 24 >> 24;
}

export async function mkroom(roomtype: number): Promise<void> {
  if (roomtype >= SHOPBASE) {
    await mkshop();
  } else {
    switch (roomtype) {
    case COURT:
      await mkzoo(COURT);
      break;
    case ZOO:
      await mkzoo(ZOO);
      break;
    case BEEHIVE:
      await mkzoo(BEEHIVE);
      break;
    case MORGUE:
      await mkzoo(MORGUE);
      break;
    case BARRACKS:
      await mkzoo(BARRACKS);
      break;
    case SWAMP:
      await mkswamp();
      break;
    case TEMPLE:
      await mktemple();
      break;
    case LEPREHALL:
      await mkzoo(LEPREHALL);
      break;
    case COCKNEST:
      await mkzoo(COCKNEST);
      break;
    case ANTHOLE:
      await mkzoo(ANTHOLE);
      break;
    default:
      await impossible(S("Tried to make a room of type %d."), roomtype);
    }
  }
}

async function mkshop(): Promise<void> {
  let $g = 0;
  let sroom = null;
  let i = 0;
  let ep = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      i = -1;
      ep = null;
      if (G.flags.debug) {
        ep = nh_getenv(S("SHOPTYPE"));
        if (ep) {
          if (ep.a[ep.o] === 122 || ep.a[ep.o] === 90) {
            await mkzoo(ZOO);
            return;
          }
          if (ep.a[ep.o] === 109 || ep.a[ep.o] === 77) {
            await mkzoo(MORGUE);
            return;
          }
          if (ep.a[ep.o] === 98 || ep.a[ep.o] === 66) {
            await mkzoo(BEEHIVE);
            return;
          }
          if (ep.a[ep.o] === 116 || ep.a[ep.o] === 84 || ep.a[ep.o] === 92) {
            await mkzoo(COURT);
            return;
          }
          if (ep.a[ep.o] === 115 || ep.a[ep.o] === 83) {
            await mkzoo(BARRACKS);
            return;
          }
          if (ep.a[ep.o] === 97 || ep.a[ep.o] === 65) {
            await mkzoo(ANTHOLE);
            return;
          }
          if (ep.a[ep.o] === 99 || ep.a[ep.o] === 67) {
            await mkzoo(COCKNEST);
            return;
          }
          if (ep.a[ep.o] === 108 || ep.a[ep.o] === 76) {
            await mkzoo(LEPREHALL);
            return;
          }
          if (ep.a[ep.o] === 95) {
            await mktemple();
            return;
          }
          if (ep.a[ep.o] === 125) {
            await mkswamp();
            return;
          }
          for (i = 0; G.shtypes[i].name; ++i) {
            if (ep.a[ep.o] === G.def_oc_syms[G.shtypes[i].symb].sym) {
              { $g = 1; continue $L; }
            }
          }
          if (ep.a[ep.o] === 103 || ep.a[ep.o] === 71) {
            i = 0;
          } else if (ep.a[ep.o] === 118 || ep.a[ep.o] === 86) {
            i = FODDERSHOP - SHOPBASE;
          } else {
            i = -1;
          }
        }
      }
    case 1: // gottype
      for (sroom = G.rooms[0]; ; sroom = $sadd(sroom, 1)) {
        if (sroom.hx < 0) {
          return;
        }
        if ($sdiff(sroom, G.rooms[0]) >= G.nroom) {
          await pline(S("rooms not closed by -1?"));
          return;
        }
        if (sroom.rtype !== OROOM) {
          continue;
        }
        if (has_dnstairs(sroom) || has_upstairs(sroom)) {
          continue;
        }
        if (G.flags.debug && ep && sroom.doorct !== 0 || sroom.doorct === 1) {
          break;
        }
      }
      if (!sroom.rlit) {
        let x = 0;
        let y = 0;
        for (x = sroom.lx - 1; x <= sroom.hx + 1; ++x) {
          for (y = sroom.ly - 1; y <= sroom.hy + 1; ++y) {
            $at2(G.level.locations, x, y).lit = 1;
          }
        }
        sroom.rlit = 1;
      }
      if (i < 0) {
        let j = 0;
        for (j = rnd(100), i = 0; (j -= G.shtypes[i].prob) > 0; ++i) {
          continue;
        }
        if (isbig(sroom) && (G.shtypes[i].symb === WAND_CLASS || G.shtypes[i].symb === SPBOOK_CLASS)) {
          i = 0;
        }
      }
      sroom.rtype = SHOPBASE + i << 24 >> 24;
      topologize(sroom);
      await stock_room(i, sroom);
    }
    break;
  }
}

function pick_room(strict: number): struct_mkroom | null {
  let sroom = null;
  let i = G.nroom;
  for (sroom = $sat(G.rooms, rn2(G.nroom)); i--; sroom = $sadd(sroom, 1)) {
    if (sroom === $sat(G.rooms, G.nroom)) {
      sroom = G.rooms[0];
    }
    if (sroom.hx < 0) {
      return null;
    }
    if (sroom.rtype !== OROOM) {
      continue;
    }
    if (!strict) {
      if (has_upstairs(sroom) || has_dnstairs(sroom) && rn2(3)) {
        continue;
      }
    } else if (has_upstairs(sroom) || has_dnstairs(sroom)) {
      continue;
    }
    if (sroom.doorct === 1 || !rn2(5) || G.flags.debug) {
      return sroom;
    }
  }
  return null;
}

async function mkzoo(type: number): Promise<void> {
  let sroom = null;
  if (!!(sroom = pick_room(FALSE))) {
    sroom.rtype = type << 24 >> 24;
    await fill_zoo(sroom);
  }
}

export async function mk_zoo_thronemon(x: number, y: number): Promise<void> {
  let i = rnd(level_difficulty());
  let pm = i > 9 ? PM_OGRE_KING : i > 5 ? PM_ELVENKING : i > 2 ? PM_DWARF_KING : PM_GNOME_KING;
  let mon = await makemon($sat(G.mons, pm), x, y, NO_MM_FLAGS);
  if (mon) {
    mon.msleeping = 1;
    mon.mpeaceful = 0;
    set_malign(mon);
    await mongets(mon, MACE);
  }
}

export async function fill_zoo(sroom: struct_mkroom | null): Promise<void> {
  let $g = 0;
  let mon = null;
  let sx = 0;
  let sy = 0;
  let i = 0;
  let sh = 0;
  let tx = 0;
  let ty = 0;
  let goldlim = 0;
  let type = 0;
  let rmno = 0;
  let mm = new struct_nhcoord();
  $L: for (;;) {
    switch ($g) {
    case 0:
      tx = 0;
      ty = 0;
      goldlim = 0;
      type = sroom.rtype;
      rmno = $sdiff(sroom, G.rooms[0]) + ROOMOFFSET | 0;
      mm = new struct_nhcoord();
      sh = sroom.fdoor;
      switch (type) {
      case COURT: { $g = 3; continue $L; }
      case BEEHIVE: { $g = 4; continue $L; }
      case ZOO: { $g = 5; continue $L; }
      case LEPREHALL: { $g = 6; continue $L; }
      default: { $g = 2; continue $L; }
      }
    case 3:
      if (G.level.flags.is_maze_lev) {
        for (tx = sroom.lx; tx <= sroom.hx; ++tx) {
          for (ty = sroom.ly; ty <= sroom.hy; ++ty) {
            if ($at2(G.level.locations, tx, ty).typ === THRONE) {
              { $g = 1; continue $L; }
            }
          }
        }
      }
      i = 100;
      do {
        somexy(sroom, mm);
        tx = mm.x;
        ty = mm.y;
      } while (occupied(tx << 24 >> 24, ty << 24 >> 24) && --i > 0);
    case 1: // throne_placed
      await mk_zoo_thronemon(tx, ty);
      { $g = 2; continue $L; };
    case 4:
      tx = sroom.lx + ((sroom.hx - sroom.lx + 1) / 2 | 0);
      ty = sroom.ly + ((sroom.hy - sroom.ly + 1) / 2 | 0);
      if (sroom.irregular) {
        if (($at2(G.level.locations, tx, ty).roomno | 0) !== rmno || $at2(G.level.locations, tx, ty).edge | 0) {
          somexy(sroom, mm);
          tx = mm.x;
          ty = mm.y;
        }
      }
      { $g = 2; continue $L; };
    case 5:
    case 6:
      goldlim = 500 * level_difficulty();
      { $g = 2; continue $L; };
    case 2:
      for (sx = sroom.lx; sx <= sroom.hx; ++sx) {
        for (sy = sroom.ly; sy <= sroom.hy; ++sy) {
          if (sroom.irregular) {
            if (($at2(G.level.locations, sx, sy).roomno | 0) !== rmno || $at2(G.level.locations, sx, sy).edge | 0 || sroom.doorct && distmin(sx, sy, G.doors[sh].x, G.doors[sh].y) <= 1) {
              continue;
            }
          } else if (!($at2(G.level.locations, sx, sy).typ > DOOR) || sroom.doorct && (sx === sroom.lx && G.doors[sh].x === sx - 1 || sx === sroom.hx && G.doors[sh].x === sx + 1 || sy === sroom.ly && G.doors[sh].y === sy - 1 || sy === sroom.hy && G.doors[sh].y === sy + 1)) {
            continue;
          }
          if (type === COURT && $at2(G.level.locations, sx, sy).typ === THRONE) {
            continue;
          }
          mon = await makemon(type === COURT ? await courtmon() : type === BARRACKS ? squadmon() : type === MORGUE ? await morguemon() : type === BEEHIVE ? sx === tx && sy === ty ? $sat(G.mons, PM_QUEEN_BEE) : $sat(G.mons, PM_KILLER_BEE) : type === LEPREHALL ? $sat(G.mons, PM_LEPRECHAUN) : type === COCKNEST ? $sat(G.mons, PM_COCKATRICE) : type === ANTHOLE ? antholemon() : null, sx, sy, MM_ASLEEP);
          if (mon) {
            mon.msleeping = 1;
            if (type === COURT && mon.mpeaceful | 0) {
              mon.mpeaceful = 0;
              set_malign(mon);
            }
          }
          switch (type) {
          case ZOO:
          case LEPREHALL:
            if (sroom.doorct) {
              let distval = dist2(sx, sy, G.doors[sh].x, G.doors[sh].y);
              i = Math.imul(distval, distval);
            } else {
              i = goldlim;
            }
            if (i >= goldlim) {
              i = 5 * level_difficulty();
            }
            goldlim -= i;
            await mkgold(rn2(i) + 10, sx, sy);
            break;
          case MORGUE:
            if (!rn2(5)) {
              await mk_tt_object(CORPSE, sx, sy);
            }
            if (!rn2(10)) {
              await mksobj_at(rn2(3) ? LARGE_BOX : CHEST, sx, sy, TRUE, FALSE);
            }
            if (!rn2(5)) {
              await make_grave(sx, sy, null);
            }
            break;
          case BEEHIVE:
            if (!rn2(3)) {
              await mksobj_at(LUMP_OF_ROYAL_JELLY, sx, sy, TRUE, FALSE);
            }
            break;
          case BARRACKS:
            if (!rn2(20)) {
              await mksobj_at(rn2(3) ? LARGE_BOX : CHEST, sx, sy, TRUE, FALSE);
            }
            break;
          case COCKNEST:
            if (!rn2(3)) {
              let sobj = await mk_tt_object(STATUE, sx, sy);
              if (sobj) {
                for (i = rn2(5); i; --i) {
                  await add_to_container(sobj, await mkobj(RANDOM_CLASS, FALSE));
                }
                sobj.owt = await weight(sobj) >>> 0;
              }
            }
            break;
          case ANTHOLE:
            if (!rn2(3)) {
              await mkobj_at(FOOD_CLASS, sx, sy, FALSE);
            }
            break;
          }
        }
      }
      switch (type) {
      case COURT:
        {
          let chest = null;
          let gold = null;
          $at2(G.level.locations, tx, ty).typ = THRONE;
          somexy(sroom, mm);
          gold = await mksobj(GOLD_PIECE, TRUE, FALSE);
          gold.quan = rn2(50 * level_difficulty()) + 10;
          gold.owt = await weight(gold) >>> 0;
          chest = await mksobj_at(CHEST, mm.x, mm.y, TRUE, FALSE);
          await add_to_container(chest, gold);
          chest.owt = await weight(chest) >>> 0;
          chest.spe = 2;
          G.level.flags.has_court = 1;
          break;
        }
      case BARRACKS:
        G.level.flags.has_barracks = 1;
        break;
      case ZOO:
        G.level.flags.has_zoo = 1;
        break;
      case MORGUE:
        G.level.flags.has_morgue = 1;
        break;
      case SWAMP:
        G.level.flags.has_swamp = 1;
        break;
      case BEEHIVE:
        G.level.flags.has_beehive = 1;
        break;
      }
    }
    break;
  }
}

export async function mkundead(mm: struct_nhcoord | null, revive_corpses: number, mm_flags: number): Promise<void> {
  let cnt = ((level_difficulty() + 1) / 10 | 0) + rnd(5);
  let mdat = null;
  let otmp = null;
  let cc = new struct_nhcoord();
  while (cnt--) {
    mdat = await morguemon();
    if (mdat && await enexto(cc, mm.x, mm.y, mdat) && (!revive_corpses || !(otmp = sobj_at(CORPSE, cc.x, cc.y)) || !await revive(otmp, FALSE))) {
      await makemon(mdat, cc.x, cc.y, mm_flags);
    }
  }
  G.level.flags.graveyard = (TRUE) & 1;
}

async function morguemon(): Promise<struct_permonst | null> {
  let i = rn2(100);
  let hd = rn2(level_difficulty());
  if (hd > 10 && i < 10) {
    if (In_hell(G.u.uz) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
      return await mkclass(S_DEMON, 0);
    } else {
      let ndemon_res = await ndemon(A_NONE);
      if (ndemon_res !== NON_PM) {
        return $sat(G.mons, ndemon_res);
      }
    }
  }
  if (hd > 8 && i > 85) {
    return await mkclass(S_VAMPIRE, 0);
  }
  return i < 20 ? $sat(G.mons, PM_GHOST) : i < 40 ? $sat(G.mons, PM_WRAITH) : await mkclass(S_ZOMBIE, 0);
}

export function antholemon(): struct_permonst | null {
  let mtyp = 0;
  let indx = 0;
  let trycnt = 0;
  indx = G.ubirthday % 3 | 0;
  indx += level_difficulty();
  do {
    switch ((indx + trycnt) % 3) {
    case 0:
      mtyp = PM_SOLDIER_ANT;
      break;
    case 1:
      mtyp = PM_FIRE_ANT;
      break;
    default:
      mtyp = PM_GIANT_ANT;
      break;
    }
  } while (++trycnt < 3 && G.mvitals[mtyp].mvflags & G_GONE);
  return G.mvitals[mtyp].mvflags & G_GONE ? null : $sat(G.mons, mtyp);
}

async function mkswamp(): Promise<void> {
  let sroom = null;
  let sx = 0;
  let sy = 0;
  let i = 0;
  let eelct = 0;
  for (i = 0; i < 5; ++i) {
    sroom = $sat(G.rooms, rn2(G.nroom));
    if (sroom.hx < 0 || sroom.rtype !== OROOM || has_upstairs(sroom) || has_dnstairs(sroom)) {
      continue;
    }
    sroom.rtype = SWAMP;
    for (sx = sroom.lx; sx <= sroom.hx; ++sx) {
      for (sy = sroom.ly; sy <= sroom.hy; ++sy) {
        if (!!!G.level.objects[sx][sy] && !!!G.level.monsters[sx][sy] && !t_at(sx, sy) && !nexttodoor(sx, sy)) {
          if ((sx + sy) % 2) {
            $at2(G.level.locations, sx, sy).typ = POOL;
            if (!eelct || !rn2(4)) {
              await makemon(rn2(5) ? $sat(G.mons, PM_GIANT_EEL) : rn2(2) ? $sat(G.mons, PM_PIRANHA) : $sat(G.mons, PM_ELECTRIC_EEL), sx, sy, NO_MM_FLAGS);
              ++eelct;
            }
          } else if (!rn2(4)) {
            await makemon(await mkclass(S_FUNGUS, 0), sx, sy, NO_MM_FLAGS);
          }
        }
      }
    }
    G.level.flags.has_swamp = 1;
  }
}

function shrine_pos(roomno: number): struct_nhcoord | null {
  let delta = 0;
  let troom = $sat(G.rooms, roomno - ROOMOFFSET);
  delta = troom.hx - troom.lx;
  shrine_pos$buf.x = troom.lx + (delta / 2 | 0) << 24 >> 24;
  if (delta % 2 && rn2(2)) {
    shrine_pos$buf.x = shrine_pos$buf.x + 1 << 24 >> 24;
  }
  delta = troom.hy - troom.ly;
  shrine_pos$buf.y = troom.ly + (delta / 2 | 0) << 24 >> 24;
  if (delta % 2 && rn2(2)) {
    shrine_pos$buf.y = shrine_pos$buf.y + 1 << 24 >> 24;
  }
  return shrine_pos$buf;
}

async function mktemple(): Promise<void> {
  let sroom = null;
  let shrine_spot = null;
  let lev = null;
  if (!(sroom = pick_room(TRUE))) {
    return;
  }
  sroom.rtype = TEMPLE;
  shrine_spot = shrine_pos($sdiff(sroom, G.rooms[0]) + ROOMOFFSET | 0);
  lev = $sat(G.level.locations[shrine_spot.x], shrine_spot.y);
  lev.typ = ALTAR;
  lev.flags = (induced_align(80) >>> 0) & 31;
  await priestini(G.u.uz, sroom, shrine_spot.x, shrine_spot.y, FALSE);
  lev.flags = ((lev.flags | 0 | AM_SHRINE) >>> 0) & 31;
  G.level.flags.has_temple = 1;
}

export function nexttodoor(sx: number, sy: number): number {
  let dx = 0;
  let dy = 0;
  let lev = null;
  for (dx = -1; dx <= 1; ++dx) {
    for (dy = -1; dy <= 1; ++dy) {
      if (!isok(sx + dx, sy + dy)) {
        continue;
      }
      lev = $sat(G.level.locations[sx + dx], sy + dy);
      if (lev.typ === DOOR || lev.typ === SDOOR) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function has_dnstairs(sroom: struct_mkroom | null): number {
  if (sroom === G.dnstairs_room) {
    return TRUE;
  }
  if (G.sstairs.sx && !G.sstairs.up) {
    return (sroom === G.sstairs_room ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function has_upstairs(sroom: struct_mkroom | null): number {
  if (sroom === G.upstairs_room) {
    return TRUE;
  }
  if (G.sstairs.sx && G.sstairs.up) {
    return (sroom === G.sstairs_room ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function somex(croom: struct_mkroom | null): number {
  return rn2(croom.hx - croom.lx + 1) + croom.lx;
}

export function somey(croom: struct_mkroom | null): number {
  return rn2(croom.hy - croom.ly + 1) + croom.ly;
}

export function inside_room(croom: struct_mkroom | null, x: number, y: number): number {
  return (x >= croom.lx - 1 && x <= croom.hx + 1 && y >= croom.ly - 1 && y <= croom.hy + 1 ? 1 : 0) << 24 >> 24;
}

export function somexy(croom: struct_mkroom | null, c: struct_nhcoord | null): number {
  let $g = 0;
  let try_cnt = 0;
  let i = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      try_cnt = 0;
      if (croom.irregular) {
        i = $sdiff(croom, G.rooms[0]) + ROOMOFFSET | 0;
        while (try_cnt++ < 100) {
          c.x = somex(croom) << 24 >> 24;
          c.y = somey(croom) << 24 >> 24;
          if (!$at2(G.level.locations, c.x, c.y).edge && ($at2(G.level.locations, c.x, c.y).roomno | 0) === i) {
            return TRUE;
          }
        }
        for (c.x = croom.lx; c.x <= croom.hx; c.x = c.x + 1 << 24 >> 24) {
          for (c.y = croom.ly; c.y <= croom.hy; c.y = c.y + 1 << 24 >> 24) {
            if (!$at2(G.level.locations, c.x, c.y).edge && ($at2(G.level.locations, c.x, c.y).roomno | 0) === i) {
              return TRUE;
            }
          }
        }
        return FALSE;
      }
      if (!croom.nsubrooms) {
        c.x = somex(croom) << 24 >> 24;
        c.y = somey(croom) << 24 >> 24;
        return TRUE;
      }
    case 2:
      if (!(try_cnt++ < 100)) { $g = 3; continue $L; }
      c.x = somex(croom) << 24 >> 24;
      c.y = somey(croom) << 24 >> 24;
      if ($at2(G.level.locations, c.x, c.y).typ && $at2(G.level.locations, c.x, c.y).typ <= DBWALL) {
        { $g = 2; continue $L; };
      }
      for (i = 0; i < croom.nsubrooms; ++i) {
        if (inside_room(croom.sbrooms[i], c.x, c.y)) {
          { $g = 1; continue $L; }
        }
      }
      { $g = 3; continue $L; };
    case 1: // you_lose
      ;
      { $g = 2; continue $L; }
    case 3:
      if (try_cnt >= 100) {
        return FALSE;
      }
      return TRUE;
    }
    break;
  }
}

export function search_special(type: number): struct_mkroom | null {
  let croom = null;
  for (croom = G.rooms[0]; croom.hx >= 0; croom = $sadd(croom, 1)) {
    if (type === ANY_TYPE && croom.rtype !== OROOM || type === ANY_SHOP && croom.rtype >= SHOPBASE || croom.rtype === type) {
      return croom;
    }
  }
  for (croom = G.subrooms; croom.hx >= 0; croom = $sadd(croom, 1)) {
    if (type === ANY_TYPE && croom.rtype !== OROOM || type === ANY_SHOP && croom.rtype >= SHOPBASE || croom.rtype === type) {
      return croom;
    }
  }
  return null;
}

export async function courtmon(): Promise<struct_permonst | null> {
  let i = rn2(60) + rn2(3 * level_difficulty());
  if (i > 100) {
    return await mkclass(S_DRAGON, 0);
  } else if (i > 95) {
    return await mkclass(S_GIANT, 0);
  } else if (i > 85) {
    return await mkclass(S_TROLL, 0);
  } else if (i > 75) {
    return await mkclass(S_CENTAUR, 0);
  } else if (i > 60) {
    return await mkclass(S_ORC, 0);
  } else if (i > 45) {
    return $sat(G.mons, PM_BUGBEAR);
  } else if (i > 30) {
    return $sat(G.mons, PM_HOBGOBLIN);
  } else if (i > 15) {
    return await mkclass(S_GNOME, 0);
  } else {
    return await mkclass(S_KOBOLD, 0);
  }
}

function squadmon(): struct_permonst | null {
  let $g = 0;
  let sel_prob = 0;
  let i = 0;
  let cpro = 0;
  let mndx = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      sel_prob = rnd(80 + level_difficulty());
      cpro = 0;
      for (i = 0; i < NSTYPES; ++i) {
        cpro += squadprob[i].prob;
        if (cpro > sel_prob) {
          mndx = squadprob[i].pm | 0;
          { $g = 1; continue $L; }
        }
      }
      mndx = squadprob[rn2(NSTYPES)].pm | 0;
    case 1: // gotone
      if (!(G.mvitals[mndx].mvflags & G_GONE)) {
        return $sat(G.mons, mndx);
      } else {
        return null;
      }
    }
    break;
  }
}

async function save_room(fd: number, r: struct_mkroom | null): Promise<void> {
  let i = 0;
  await bwrite(fd, r, 216);
  for (i = 0; i < r.nsubrooms; i = i + 1 << 16 >> 16) {
    await save_room(fd, r.sbrooms[i]);
  }
}

export async function save_rooms(fd: number): Promise<void> {
  let i = 0;
  await bwrite(fd, P(G, "nroom"), 4);
  for (i = 0; i < G.nroom; i = i + 1 << 16 >> 16) {
    await save_room(fd, $sat(G.rooms, i));
  }
}

async function rest_room(fd: number, r: struct_mkroom | null): Promise<void> {
  let i = 0;
  await mread(fd, r, 216);
  for (i = 0; i < r.nsubrooms; i = i + 1 << 16 >> 16) {
    r.sbrooms[i] = $sadd(G.subrooms, G.nsubroom);
    await rest_room(fd, $sadd(G.subrooms, G.nsubroom));
    $sadd(G.subrooms, G.nsubroom++).resident = null;
  }
}

export async function rest_rooms(fd: number): Promise<void> {
  let i = 0;
  await mread(fd, P(G, "nroom"), 4);
  G.nsubroom = 0;
  for (i = 0; i < G.nroom; i = i + 1 << 16 >> 16) {
    await rest_room(fd, $sat(G.rooms, i));
    G.rooms[i].resident = null;
  }
  G.rooms[G.nroom].hx = -1;
  $sadd(G.subrooms, G.nsubroom).hx = -1;
}

export function cmap_to_type(sym: number): number {
  let typ = STONE;
  switch (sym) {
  case S_stone:
    typ = STONE;
    break;
  case S_vwall:
    typ = VWALL;
    break;
  case S_hwall:
    typ = HWALL;
    break;
  case S_tlcorn:
    typ = TLCORNER;
    break;
  case S_trcorn:
    typ = TRCORNER;
    break;
  case S_blcorn:
    typ = BLCORNER;
    break;
  case S_brcorn:
    typ = BRCORNER;
    break;
  case S_crwall:
    typ = CROSSWALL;
    break;
  case S_tuwall:
    typ = TUWALL;
    break;
  case S_tdwall:
    typ = TDWALL;
    break;
  case S_tlwall:
    typ = TLWALL;
    break;
  case S_trwall:
    typ = TRWALL;
    break;
  case S_ndoor:
  case S_vodoor:
  case S_hodoor:
  case S_vcdoor:
  case S_hcdoor:
    typ = DOOR;
    break;
  case S_bars:
    typ = IRONBARS;
    break;
  case S_tree:
    typ = TREE;
    break;
  case S_room:
    typ = ROOM;
    break;
  case S_corr:
  case S_litcorr:
    typ = CORR;
    break;
  case S_upstair:
  case S_dnstair:
    typ = STAIRS;
    break;
  case S_upladder:
  case S_dnladder:
    typ = LADDER;
    break;
  case S_altar:
    typ = ALTAR;
    break;
  case S_grave:
    typ = GRAVE;
    break;
  case S_throne:
    typ = THRONE;
    break;
  case S_sink:
    typ = SINK;
    break;
  case S_fountain:
    typ = FOUNTAIN;
    break;
  case S_pool:
    typ = POOL;
    break;
  case S_ice:
    typ = ICE;
    break;
  case S_lava:
    typ = LAVAPOOL;
    break;
  case S_vodbridge:
  case S_hodbridge:
    typ = DRAWBRIDGE_DOWN;
    break;
  case S_vcdbridge:
  case S_hcdbridge:
    typ = DBWALL;
    break;
  case S_air:
    typ = AIR;
    break;
  case S_cloud:
    typ = CLOUD;
    break;
  case S_water:
    typ = WATER;
    break;
  default:
    break;
  }
  return typ;
}

export function $init(): void {
  squadprob = $sarrOf([anon_mkroom_c_762.$of(PM_SOLDIER, 80),
anon_mkroom_c_762.$of(PM_SERGEANT, 15),
anon_mkroom_c_762.$of(PM_LIEUTENANT, 4),
anon_mkroom_c_762.$of(PM_CAPTAIN, 1),
new anon_mkroom_c_762()]);
  shrine_pos$buf = new struct_nhcoord();
}
