// @ts-nocheck
// NetHack 3.6.7 vault.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { um_dist } from './apply.ts';
import { adjalign } from './attrib.ts';
import { isok } from './cmd.ts';
import { map_location, newsym, unset_seenv } from './display.ts';
import { Monnam, noit_Monnam, noit_mon_nam, x_monnam } from './do_name.ts';
import { assign_level, on_level } from './dungeon.ts';
import { is_fainted, reset_faint } from './eat.ts';
import { panic } from './end.ts';
import { make_grave } from './engrave.ts';
import { debugcore } from './files.ts';
import { in_rooms, money_cnt, nomul, unmul } from './hack.ts';
import { dist2, mungspaces, strncmpi } from './hacklib.ts';
import { currency, freeinv, g_at, stackobj } from './invent.ts';
import { makemon, newmextra, set_malign } from './makemon.ts';
import { add_to_minv, obj_extract_self, place_object, remove_object } from './mkobj.ts';
import { m_into_limbo, mnexto, mongone, mpickgold, setmangry } from './mon.ts';
import { pronoun_gender, sticks } from './mondata.ts';
import { m_carrying } from './mthrowu.ts';
import { makeplural, mimic_obj_name } from './objnam.ts';
import { You, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { rn2 } from './rnd.ts';
import { contained_gold } from './shk.ts';
import { yelp } from './sounds.ts';
import { relobj } from './steal.ts';
import { place_monster } from './steed.ts';
import { enexto, rloc, tele } from './teleport.ts';
import { deltrap, t_at } from './trap.ts';
import { block_point, unblock_point } from './vision.ts';
import { mon_wield_item } from './weapon.ts';
import { worm_known } from './worm.ts';
import { struct_egd, struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, free, memset, sprintf, strcpy, strlen } from './rt/index.ts';
import { ARTICLE_A, A_LAWFUL, BLCORNER, BLINDED, BRCORNER, COIN_CLASS, COLNO, CORR, COULD_SEE, DBWALL, DEAF, DETECT_MONSTERS, DOOR, DRAWBRIDGE_UP, D_NODOOR, FALSE, FCSIZ, GD_DESTROYGOLD, GD_EATGOLD, GOLD_PIECE, HWALL, INFRAVISION, INVIS, IN_SIGHT, MM_EGD, M_AP_OBJECT, NEED_HTH_WEAPON, PM_CROESUS, PM_GUARD, POOL, ROOM, ROOMOFFSET, ROWNO, SCORR, SEE_INVIS, STONE, STRANGLED, TELEPAT, TIN_WHISTLE, TLCORNER, TRCORNER, TRUE, VAULT, VAULT_GUARD_TIME, VWALL, WARN_OF_MON } from './consts.ts';


export async function newegd(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  if (!mtmp.mextra.egd) {
    mtmp.mextra.egd = new struct_egd();
    memset(mtmp.mextra.egd, 0, 324);
  }
}

export function free_egd(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.egd) {
    free(mtmp.mextra.egd);
    mtmp.mextra.egd = null;
  }
  mtmp.isgd = 0;
}

async function clear_fcorr(grd: struct_monst | null, forceshow: number): Promise<number> {
  let fcx = 0;
  let fcy = 0;
  let fcbeg = 0;
  let mtmp = null;
  let sawcorridor = FALSE;
  let silently = (G.program_state.stopprint ? TRUE : FALSE) << 24 >> 24;
  let egrd = grd.mextra.egd;
  let trap = null;
  let lev = null;
  if (!on_level(egrd.gdlevel, G.u.uz)) {
    return TRUE;
  }
  while ((fcbeg = egrd.fcbeg) < egrd.fcend) {
    fcx = egrd.fakecorr[fcbeg].fx;
    fcy = egrd.fakecorr[fcbeg].fy;
    if ((grd.mhp < 1 || !in_fcorridor(grd, G.u.ux, G.u.uy)) && egrd.gddone | 0) {
      forceshow = TRUE;
    }
    if (G.u.ux === fcx && G.u.uy === fcy && !(grd.mhp < 1) || !forceshow && $rd(G.viz_array.a[G.viz_array.o + fcy], fcx) & 1 || !!G.uball && !(G.uball.where === 3) && G.uball.ox === fcx && G.uball.oy === fcy) {
      return FALSE;
    }
    if (!!(mtmp = !!G.level.monsters[fcx][fcy] ? G.level.monsters[fcx][fcy] : null)) {
      if (mtmp.isgd) {
        return FALSE;
      } else if (!in_fcorridor(grd, G.u.ux, G.u.uy)) {
        if (mtmp.mtame) {
          await yelp(mtmp);
        }
        if (!await rloc(mtmp, TRUE)) {
          await m_into_limbo(mtmp);
        }
      }
    }
    lev = $sat(G.level.locations[fcx], fcy);
    if (lev.typ === CORR && $rd(G.viz_array.a[G.viz_array.o + fcy], fcx) & 2) {
      sawcorridor = TRUE;
    }
    lev.typ = egrd.fakecorr[fcbeg].ftyp;
    if (lev.typ <= DBWALL) {
      if (!!(trap = t_at(fcx, fcy))) {
        await deltrap(trap);
      }
      if (lev.typ === STONE) {
        blackout(fcx, fcy);
      }
    }
    await map_location(fcx, fcy, 1);
    if (!(lev.typ >= DOOR)) {
      block_point(fcx, fcy);
    }
    G.vision_full_recalc = 1;
    ++egrd.fcbeg;
  }
  if (sawcorridor && !silently) {
    await pline_The(S("corridor disappears."));
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ < POOL && (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) > 0 && !silently) {
    await You(S("are encased in rock."));
  }
  return TRUE;
}

function blackout(x: number, y: number): void {
  let lev = null;
  let i = 0;
  let j = 0;
  for (i = x - 1; i <= x + 1; ++i) {
    for (j = y - 1; j <= y + 1; ++j) {
      if (!isok(i, j)) {
        continue;
      }
      lev = $sat(G.level.locations[i], j);
      if (lev.typ === STONE) {
        lev.lit = (lev.waslit = 0) & 1;
      }
      unset_seenv(lev, x, y, i, j);
    }
  }
}

async function restfakecorr(grd: struct_monst | null): Promise<void> {
  if (await clear_fcorr(grd, FALSE)) {
    grd.isgd = 0;
    await mongone(grd);
  }
}

async function parkguard(grd: struct_monst | null): Promise<void> {
  if (grd === G.context.polearm.hitmon) {
    G.context.polearm.hitmon = null;
  }
  if (grd.mx) {
    G.level.monsters[grd.mx][grd.my] = null;
    await newsym(grd.mx, grd.my);
    await place_monster(grd, 0, 0);
    grd.mextra.egd.ogx = grd.mx;
    grd.mextra.egd.ogy = grd.my;
  }
}

export async function grddead(grd: struct_monst | null): Promise<number> {
  let dispose = await clear_fcorr(grd, TRUE);
  if (!dispose) {
    await relobj(grd, 0, FALSE);
    grd.mhp = 0;
    await parkguard(grd);
    dispose = await clear_fcorr(grd, TRUE);
  }
  if (dispose) {
    grd.isgd = 0;
  }
  return dispose;
}

function in_fcorridor(grd: struct_monst | null, x: number, y: number): number {
  let fci = 0;
  let egrd = grd.mextra.egd;
  for (fci = egrd.fcbeg; fci < egrd.fcend; ++fci) {
    if (x === egrd.fakecorr[fci].fx && y === egrd.fakecorr[fci].fy) {
      return TRUE;
    }
  }
  return FALSE;
}

export function findgd(): struct_monst | null {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.isgd | 0 && on_level(mtmp.mextra.egd.gdlevel, G.u.uz)) {
      return mtmp;
    }
  }
  return null;
}

export function vault_summon_gd(): void {
  if (vault_occupied(P(G.u.urooms)) && !findgd()) {
    G.u.uinvault = VAULT_GUARD_TIME - 1;
  }
}

export function vault_occupied(array: Ptr | null): number {
  let ptr = null;
  for (ptr = array; ptr.a[ptr.o]; ptr = ptr.add(1)) {
    if (G.rooms[ptr.a[ptr.o] - ROOMOFFSET].rtype === VAULT) {
      return ptr.a[ptr.o];
    }
  }
  return 0;
}

export async function uleftvault(grd: struct_monst | null): Promise<void> {
  if (!grd || !grd.isgd || grd.mhp < 1) {
    await impossible(S("escaping vault without guard?"));
    return;
  }
  if ((money_cnt(G.invent) || hidden_gold()) && um_dist(grd.mx, grd.my, 1)) {
    if (grd.mpeaceful) {
      if ((grd.wormno | 0 ? worm_known(grd) : $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && grd && grd.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 1 ? 1 : 0) && ((!grd.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !grd.mundetected) || (!((grd.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(grd.mx, grd.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & grd.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & grd.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === grd.data))) {
        await pline(S("%s becomes irate."), await Monnam(grd));
      }
      grd.mpeaceful = 0;
    }
    if (!in_fcorridor(grd, G.u.ux, G.u.uy)) {
      await gd_move(grd);
    }
  }
}

async function find_guard_dest(guard: struct_monst | null, rx: Ptr | null, ry: Ptr | null): Promise<number> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let dd = 0;
  let lx = 0;
  let ly = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      lx = 0;
      ly = 0;
      dd = 2;
    case 2:
      if (!(dd < ROWNO || dd < COLNO)) { $g = 4; continue $L; }
      for (y = G.u.uy - dd; y <= G.u.uy + dd; ly = y, ++y) {
        if (y < 0 || y > ROWNO - 1) {
          continue;
        }
        for (x = G.u.ux - dd; x <= G.u.ux + dd; lx = x, ++x) {
          if (y !== G.u.uy - dd && y !== G.u.uy + dd && x !== G.u.ux - dd) {
            x = G.u.ux + dd;
          }
          if (x < 1 || x > COLNO - 1) {
            continue;
          }
          if (guard && (x === guard.mx && y === guard.my || guard.isgd | 0 && in_fcorridor(guard, x, y))) {
            continue;
          }
          if ($at2(G.level.locations, x, y).typ === CORR) {
            lx = x < G.u.ux ? x + 1 : x > G.u.ux ? x - 1 : x;
            ly = y < G.u.uy ? y + 1 : y > G.u.uy ? y - 1 : y;
            if ($at2(G.level.locations, lx, ly).typ !== STONE && $at2(G.level.locations, lx, ly).typ !== CORR) {
              { $g = 1; continue $L; }
            }
            rx.a[rx.o] = x << 24 >> 24;
            ry.a[ry.o] = y << 24 >> 24;
            return TRUE;
          }
        }
      }
    case 1: // incr_radius
      ;
    case 3:
      ++dd;
      { $g = 2; continue $L; }
    case 4:
      await impossible(S("Not a single corridor on this level?"));
      await tele();
      return FALSE;
    }
    break;
  }
}

export async function invault(): Promise<void> {
  let guard = null;
  let gsensed = 0;
  let trycount = 0;
  let vaultroom = vault_occupied(P(G.u.urooms));
  if (!vaultroom) {
    G.u.uinvault = 0;
    return;
  }
  vaultroom -= ROOMOFFSET;
  guard = findgd();
  if (++G.u.uinvault % VAULT_GUARD_TIME === 0 && !guard) {
    let buf = new Int8Array(256);
    let x = 0;
    let y = 0;
    let gx = 0;
    let gy = 0;
    const rx = new Int8Array(1);
    const ry = new Int8Array(1);
    let umoney = 0;
    if (!await find_guard_dest(null, P(rx, 0), P(ry, 0))) {
      return;
    }
    gx = rx[0], gy = ry[0];
    x = G.u.ux;
    y = G.u.uy;
    if ($at2(G.level.locations, x, y).typ !== ROOM) {
      if ($at2(G.level.locations, x + 1, y).typ === ROOM) {
        x = x + 1;
      } else if ($at2(G.level.locations, x, y + 1).typ === ROOM) {
        y = y + 1;
      } else if ($at2(G.level.locations, x - 1, y).typ === ROOM) {
        x = x - 1;
      } else if ($at2(G.level.locations, x, y - 1).typ === ROOM) {
        y = y - 1;
      } else if ($at2(G.level.locations, x + 1, y + 1).typ === ROOM) {
        x = x + 1;
        y = y + 1;
      } else if ($at2(G.level.locations, x - 1, y - 1).typ === ROOM) {
        x = x - 1;
        y = y - 1;
      } else if ($at2(G.level.locations, x + 1, y - 1).typ === ROOM) {
        x = x + 1;
        y = y - 1;
      } else if ($at2(G.level.locations, x - 1, y + 1).typ === ROOM) {
        x = x - 1;
        y = y + 1;
      }
    }
    while ($at2(G.level.locations, x, y).typ === ROOM) {
      let dx = 0;
      let dy = 0;
      dx = gx > x ? 1 : gx < x ? -1 : 0;
      dy = gy > y ? 1 : gy < y ? -1 : 0;
      if (Math.abs(gx - x) >= Math.abs(gy - y)) {
        x += dx;
      } else {
        y += dy;
      }
    }
    if (x === G.u.ux && y === G.u.uy) {
      if ($at2(G.level.locations, x + 1, y).typ === HWALL || $at2(G.level.locations, x + 1, y).typ === DOOR) {
        x = x + 1;
      } else if ($at2(G.level.locations, x - 1, y).typ === HWALL || $at2(G.level.locations, x - 1, y).typ === DOOR) {
        x = x - 1;
      } else if ($at2(G.level.locations, x, y + 1).typ === VWALL || $at2(G.level.locations, x, y + 1).typ === DOOR) {
        y = y + 1;
      } else if ($at2(G.level.locations, x, y - 1).typ === VWALL || $at2(G.level.locations, x, y - 1).typ === DOOR) {
        y = y - 1;
      } else {
        return;
      }
    }
    if (!(guard = await makemon($sat(G.mons, PM_GUARD), x, y, MM_EGD))) {
      return;
    }
    guard.isgd = 1;
    guard.mpeaceful = 1;
    set_malign(guard);
    guard.mextra.egd.gddone = 0;
    guard.mextra.egd.ogx = x << 24 >> 24;
    guard.mextra.egd.ogy = y << 24 >> 24;
    assign_level(guard.mextra.egd.gdlevel, G.u.uz);
    guard.mextra.egd.vroom = vaultroom;
    guard.mextra.egd.warncnt = 0;
    await reset_faint();
    gsensed = (!((guard.wormno | 0 ? worm_known(guard) : $rd(G.viz_array.a[G.viz_array.o + guard.my], guard.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && guard && guard.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + guard.my], guard.mx) & 1 ? 1 : 0) && ((!guard.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !guard.mundetected) || (!((guard.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(guard.mx, guard.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & guard.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & guard.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === guard.data))) ? 1 : 0) << 24 >> 24;
    if (!gsensed) {
      await pline(S("Suddenly one of the Vault's %s enters!"), await makeplural(guard.data.mname));
    } else {
      await pline(S("Someone else has entered the Vault."));
    }
    await newsym(guard.mx, guard.my);
    if (G.u.uswallow) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await verbalize(S("What's going on here?"));
      }
      if (gsensed) {
        await pline_The(S("other presence vanishes."));
      }
      await mongone(guard);
      return;
    }
    if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT || G.u.uundetected | 0) {
      if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance !== GOLD_PIECE) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await verbalize(S("Hey!  Who left that %s in here?"), await mimic_obj_name(G.youmonst));
        }
      }
      await pline(S("Puzzled, %s turns around and leaves."), G.genders[pronoun_gender(guard, 0)].he);
      await mongone(guard);
      return;
    }
    if (G.u.uprops[STRANGLED].intrinsic || G.youmonst.data.msound === 0 || G.multi < 0) {
      if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
        await pline(S("%s huffs and turns to leave."), await noit_Monnam(guard));
      } else {
        await verbalize(S("I'll be back when you're ready to speak to me!"));
      }
      await mongone(guard);
      return;
    }
    await stop_occupation();
    if (G.multi > 0) {
      nomul(0);
      await unmul(null);
    }
    buf[0] = 0;
    trycount = 5;
    do {
      await G.windowprocs.win_getlin(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic ? S("You are required to supply your name. -") : S("\"Hello stranger, who are you?\" -"), P(buf));
      mungspaces(P(buf));
    } while (!buf[0] && --trycount > 0);
    if (G.u.ualign.type === A_LAWFUL && strncmpi(P(buf), P(G.plname), strlen(P(G.plname)) | 0) !== 0) {
      adjalign(-1);
    }
    if (!strncmpi(P(buf), S("Croesus"), -1) || !strncmpi(P(buf), S("Kroisos"), -1) || !strncmpi(P(buf), S("Creosote"), -1)) {
      if (!G.mvitals[PM_CROESUS].died) {
        if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s waves goodbye."), await noit_Monnam(guard));
          }
        } else {
          await verbalize(S("Oh, yes, of course.  Sorry to have disturbed you."));
        }
        await mongone(guard);
      } else {
        await setmangry(guard, FALSE);
        if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s mouths something and looks very angry!"), await noit_Monnam(guard));
          }
        } else {
          await verbalize(S("Back from the dead, are you?  I'll remedy that!"));
        }
        if (!guard.mw) {
          guard.weapon_check = NEED_HTH_WEAPON;
          await mon_wield_item(guard);
        }
      }
      return;
    }
    if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
      await pline(S("%s doesn't %srecognize you."), await noit_Monnam(guard), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S("appear to "));
    } else {
      await verbalize(S("I don't know you."));
    }
    umoney = money_cnt(G.invent);
    if (!umoney && !hidden_gold()) {
      if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
        await pline(S("%s stomps%s."), await noit_Monnam(guard), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S(" and beckons"));
      } else {
        await verbalize(S("Please follow me."));
      }
    } else {
      if (!umoney) {
        if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s glares at you%s."), await noit_Monnam(guard), G.invent ? S("r stuff") : S(""));
          }
        } else {
          await verbalize(S("You have hidden gold."));
        }
      }
      if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(S("%s holds out %s palm and beckons with %s other hand."), await noit_Monnam(guard), G.genders[pronoun_gender(guard, 1)].his, G.genders[pronoun_gender(guard, 1)].his);
        }
      } else {
        await verbalize(S("Most likely all your gold was stolen from this vault."));
        await verbalize(S("Please drop that gold and follow me."));
      }
    }
    guard.mextra.egd.gdx = gx << 24 >> 24;
    guard.mextra.egd.gdy = gy << 24 >> 24;
    guard.mextra.egd.fcbeg = 0;
    guard.mextra.egd.fakecorr[0].fx = x << 24 >> 24;
    guard.mextra.egd.fakecorr[0].fy = y << 24 >> 24;
    if ($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL) {
      guard.mextra.egd.fakecorr[0].ftyp = $at2(G.level.locations, x, y).typ;
    } else {
      let vlt = guard.mextra.egd.vroom;
      let lowx = G.rooms[vlt].lx;
      let hix = G.rooms[vlt].hx;
      let lowy = G.rooms[vlt].ly;
      let hiy = G.rooms[vlt].hy;
      if (x === lowx - 1 && y === lowy - 1) {
        guard.mextra.egd.fakecorr[0].ftyp = TLCORNER;
      } else if (x === hix + 1 && y === lowy - 1) {
        guard.mextra.egd.fakecorr[0].ftyp = TRCORNER;
      } else if (x === lowx - 1 && y === hiy + 1) {
        guard.mextra.egd.fakecorr[0].ftyp = BLCORNER;
      } else if (x === hix + 1 && y === hiy + 1) {
        guard.mextra.egd.fakecorr[0].ftyp = BRCORNER;
      } else if (y === lowy - 1 || y === hiy + 1) {
        guard.mextra.egd.fakecorr[0].ftyp = HWALL;
      } else if (x === lowx - 1 || x === hix + 1) {
        guard.mextra.egd.fakecorr[0].ftyp = VWALL;
      }
    }
    $at2(G.level.locations, x, y).typ = DOOR;
    $at2(G.level.locations, x, y).flags = (D_NODOOR) & 31;
    unblock_point(x, y);
    guard.mextra.egd.fcend = 1;
    guard.mextra.egd.warncnt = 1;
  }
}

async function move_gold(gold: struct_obj | null, vroom: number): Promise<void> {
  let nx = 0;
  let ny = 0;
  await remove_object(gold);
  await newsym(gold.ox, gold.oy);
  nx = G.rooms[vroom].lx + rn2(2) << 24 >> 24;
  ny = G.rooms[vroom].ly + rn2(2) << 24 >> 24;
  await place_object(gold, nx, ny);
  await stackobj(gold);
  await newsym(nx, ny);
}

async function wallify_vault(grd: struct_monst | null): Promise<void> {
  let x = 0;
  let y = 0;
  let typ = 0;
  let vlt = grd.mextra.egd.vroom;
  let tmp_viz = 0;
  let lox = G.rooms[vlt].lx - 1 << 24 >> 24;
  let hix = G.rooms[vlt].hx + 1 << 24 >> 24;
  let loy = G.rooms[vlt].ly - 1 << 24 >> 24;
  let hiy = G.rooms[vlt].hy + 1 << 24 >> 24;
  let mon = null;
  let gold = null;
  let trap = null;
  let fixed = FALSE;
  let movedgold = FALSE;
  for (x = lox; x <= hix; ++x) {
    for (y = loy; y <= hiy; ++y) {
      if (x !== lox && x !== hix && y !== loy && y !== hiy) {
        continue;
      }
      if (!($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL) && !in_fcorridor(grd, x, y)) {
        if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && mon !== grd) {
          if (mon.mtame) {
            await yelp(mon);
          }
          await rloc(mon, FALSE);
        }
        if (!!(gold = g_at(x, y))) {
          await move_gold(gold, grd.mextra.egd.vroom);
          movedgold = TRUE;
        }
        if (!!(trap = t_at(x, y))) {
          await deltrap(trap);
        }
        if (x === lox) {
          typ = y === loy ? TLCORNER : y === hiy ? BLCORNER : VWALL;
        } else if (x === hix) {
          typ = y === loy ? TRCORNER : y === hiy ? BRCORNER : VWALL;
        } else {
          typ = HWALL;
        }
        $at2(G.level.locations, x, y).typ = typ << 24 >> 24;
        $at2(G.level.locations, x, y).flags = 0;
        tmp_viz = $rd(G.viz_array.a[G.viz_array.o + y], x);
        $wr(G.viz_array.a[G.viz_array.o + y], x, IN_SIGHT | COULD_SEE);
        await newsym(x, y);
        $wr(G.viz_array.a[G.viz_array.o + y], x, tmp_viz);
        block_point(x, y);
        fixed = TRUE;
      }
    }
  }
  if (movedgold || fixed) {
    if (in_fcorridor(grd, grd.mx, grd.my) || $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 2) {
      await pline(S("%s whispers an incantation."), await noit_Monnam(grd));
    } else {
      await You_hear(S("a distant chant."));
    }
    if (movedgold) {
      await pline(S("A mysterious force moves the gold into the vault."));
    }
    if (fixed) {
      await pline_The(S("damaged vault's walls are magically restored!"));
    }
  }
}

async function gd_mv_monaway(grd: struct_monst | null, nx: number, ny: number): Promise<void> {
  if (!!G.level.monsters[nx][ny] && !(nx === grd.mx && ny === grd.my)) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await verbalize(S("Out of my way, scum!"));
    }
    if (!await rloc(!!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null, FALSE) || !!G.level.monsters[nx][ny]) {
      await m_into_limbo(!!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null);
    }
  }
}

async function gd_pick_corridor_gold(grd: struct_monst | null, goldx: number, goldy: number): Promise<void> {
  let gold = null;
  let newcc = new struct_nhcoord();
  let bestcc = new struct_nhcoord();
  let gdelta = 0;
  let newdelta = 0;
  let bestdelta = 0;
  let tryct = 0;
  let guardx = grd.mx;
  let guardy = grd.my;
  let under_u = (goldx === G.u.ux && goldy === G.u.uy ? 1 : 0) << 24 >> 24;
  let see_it = ($rd(G.viz_array.a[G.viz_array.o + goldy], goldx) & 2) << 24 >> 24;
  if (under_u) {
    gold = g_at(goldx, goldy);
    if (!gold) {
      await impossible(S("vault guard: no gold at hero's feet?"));
      return;
    }
    gdelta = dist2(guardx, guardy, G.u.ux, G.u.uy);
    if (gdelta > 2 && see_it) {
      bestdelta = gdelta;
      bestcc.x = guardx << 24 >> 24, bestcc.y = guardy << 24 >> 24;
      tryct = 9;
      do {
        if (await enexto(newcc, goldx, goldy, grd.data)) {
          if ((newdelta = dist2(newcc.x, newcc.y, G.u.ux, G.u.uy)) < bestdelta || newdelta === bestdelta && dist2(newcc.x, newcc.y, guardx, guardy) < dist2(bestcc.x, bestcc.y, guardx, guardy)) {
            bestdelta = newdelta;
            bestcc.$cp(newcc);
          }
        }
      } while (--tryct >= 0);
      if (bestdelta < gdelta) {
        G.level.monsters[guardx][guardy] = null;
        await newsym(guardx, guardy);
        await place_monster(grd, bestcc.x, bestcc.y);
        await newsym(grd.mx, grd.my);
      }
    }
    await obj_extract_self(gold);
    await add_to_minv(grd, gold);
    await newsym(goldx, goldy);
  } else if (goldx === guardx && goldy === guardy) {
    await mpickgold(grd);
  } else {
    await gd_mv_monaway(grd, goldx, goldy);
    if (see_it) {
      G.level.monsters[grd.mx][grd.my] = null;
      await newsym(grd.mx, grd.my);
      await place_monster(grd, goldx, goldy);
    }
    await mpickgold(grd);
  }
  if (see_it) {
    let monnambuf = new Int8Array(256);
    strcpy(P(monnambuf), await Monnam(grd));
    if (!strncmpi(P(monnambuf), S("It"), -1)) {
      strcpy(P(monnambuf), S("Someone"));
    }
    await pline(S("%s%s picks up the gold%s."), P(monnambuf), grd.mpeaceful | 0 && grd.mextra.egd.warncnt > 5 ? S(" calms down and") : S(""), under_u ? S(" from beneath you") : S(""));
  }
  if (grd.mx !== guardx || grd.my !== guardy) {
    G.level.monsters[grd.mx][grd.my] = null;
    await newsym(grd.mx, grd.my);
    await place_monster(grd, guardx, guardy);
    await newsym(guardx, guardy);
  }
  return;
}

export async function gd_move(grd: struct_monst | null): Promise<number> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let nx = 0;
  let ny = 0;
  let m = 0;
  let n = 0;
  let dx = 0;
  let dy = 0;
  let gx = 0;
  let gy = 0;
  let fci = 0;
  let typ = 0;
  let crm = null;
  let fcp = null;
  let egrd = null;
  let umoney = 0;
  let goldincorridor = 0;
  let u_in_vault = 0;
  let grd_in_vault = 0;
  let disappear_msg_seen = 0;
  let semi_dead = 0;
  let u_carry_gold = 0;
  let newspot = 0;
  let see_guard = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      gx = 0;
      gy = 0;
      egrd = grd.mextra.egd;
      umoney = 0;
      goldincorridor = FALSE;
      u_in_vault = FALSE;
      grd_in_vault = FALSE;
      disappear_msg_seen = FALSE;
      semi_dead = (grd.mhp < 1 ? 1 : 0) << 24 >> 24;
      u_carry_gold = FALSE;
      newspot = FALSE;
      if (!on_level(egrd.gdlevel, G.u.uz)) {
        return -1;
      }
      nx = ny = m = n = 0;
      if (semi_dead || !grd.mx || egrd.gddone | 0) {
        egrd.gddone = 1;
        { $g = 1; continue $L; }
      }
      do {
        if (await debugcore(S("vault.c"), 1)) {
          await pline(S("gd_move: %s guard"), grd.mpeaceful | 0 ? S("peaceful") : S("hostile"));
        }
      } while (0);
      u_in_vault = (vault_occupied(P(G.u.urooms)) ? TRUE : FALSE) << 24 >> 24;
      grd_in_vault = ($rd(in_rooms(grd.mx, grd.my, VAULT)) ? TRUE : FALSE) << 24 >> 24;
      if (!u_in_vault && !grd_in_vault) {
        await wallify_vault(grd);
      }
      if (!grd.mpeaceful) {
        if (!u_in_vault && (grd_in_vault || in_fcorridor(grd, grd.mx, grd.my) && !in_fcorridor(grd, G.u.ux, G.u.uy))) {
          await rloc(grd, TRUE);
          await wallify_vault(grd);
          if (!in_fcorridor(grd, grd.mx, grd.my)) {
            await clear_fcorr(grd, TRUE);
          }
          { $g = 2; continue $L; }
        }
        if (!in_fcorridor(grd, grd.mx, grd.my)) {
          await clear_fcorr(grd, TRUE);
        }
        return -1;
      }
      if (Math.abs(egrd.ogx - grd.mx) > 1 || Math.abs(egrd.ogy - grd.my) > 1) {
        return -1;
      }
      if (egrd.witness) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await verbalize(S("How dare you %s that gold, scoundrel!"), (egrd.witness | 0) & GD_EATGOLD ? S("consume") : S("destroy"));
        }
        egrd.witness = 0;
        grd.mpeaceful = 0;
        return -1;
      }
      umoney = money_cnt(G.invent);
      u_carry_gold = (umoney > 0 || hidden_gold() > 0 ? 1 : 0) << 24 >> 24;
      if (!(egrd.fcend === 1)) { $g = 7; continue $L; }
      if (u_in_vault && (u_carry_gold || um_dist(grd.mx, grd.my, 1))) {
        if (egrd.warncnt === 3 && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await verbalize(S("I repeat, %sfollow me!"), u_carry_gold ? !umoney ? S("drop that hidden money and ") : S("drop that money and ") : S(""));
        }
        if (egrd.warncnt === 7) {
          m = grd.mx;
          n = grd.my;
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            await verbalize(S("You've been warned, knave!"));
          }
          await mnexto(grd);
          $at2(G.level.locations, m, n).typ = egrd.fakecorr[0].ftyp;
          await newsym(m, n);
          grd.mpeaceful = 0;
          return -1;
        }
        if (!is_fainted() && G.multi >= 0) {
          egrd.warncnt = egrd.warncnt + 1 << 24 >> 24;
        }
        return 0;
      }
      if (!!u_in_vault) { $g = 8; continue $L; }
      if (!u_carry_gold) { $g = 10; continue $L; }
      m = grd.mx;
      n = grd.my;
      await rloc(grd, TRUE);
      $at2(G.level.locations, m, n).typ = egrd.fakecorr[0].ftyp;
      await newsym(m, n);
      grd.mpeaceful = 0;
    case 2: // letknow
      if (!($rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 2) || !((!grd.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !grd.mundetected)) {
        await You_hear(S("%s."), m_carrying(grd, TIN_WHISTLE) ? S("the shrill sound of a guard's whistle") : S("angry shouting"));
      } else {
        await You(um_dist(grd.mx, grd.my, 2) ? S("see %s approaching.") : S("are confronted by %s."), await x_monnam(grd, ARTICLE_A, S("angry"), 0, FALSE));
      }
      return -1;
      { $g = 9; continue $L; }
    case 10:
      {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await verbalize(S("Well, begone."));
        }
        egrd.gddone = 1;
        { $g = 1; continue $L; }
      }
    case 9:
    case 8:
    case 7:
      if (egrd.fcend > 1) {
        if (egrd.fcend > 2 && in_fcorridor(grd, grd.mx, grd.my) && !egrd.gddone && !in_fcorridor(grd, G.u.ux, G.u.uy) && $at2(G.level.locations, egrd.fakecorr[0].fx, egrd.fakecorr[0].fy).typ === egrd.fakecorr[0].ftyp) {
          await pline(S("%s, confused, disappears."), await noit_Monnam(grd));
          disappear_msg_seen = TRUE;
          { $g = 1; continue $L; }
        }
        if (u_carry_gold && (in_fcorridor(grd, G.u.ux, G.u.uy) || egrd.fcend > 1 && u_in_vault)) {
          if (!grd.mx) {
            await restfakecorr(grd);
            return -2;
          }
          if (egrd.warncnt < 6) {
            egrd.warncnt = 6;
            if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
              if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                await pline(S("%s holds out %s palm demandingly!"), await noit_Monnam(grd), G.genders[pronoun_gender(grd, 1)].his);
              }
            } else {
              await verbalize(S("Drop all your gold, scoundrel!"));
            }
            return 0;
          } else {
            if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
              if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                await pline(S("%s rubs %s hands with enraged delight!"), await noit_Monnam(grd), G.genders[pronoun_gender(grd, 1)].his);
              }
            } else {
              await verbalize(S("So be it, rogue!"));
            }
            grd.mpeaceful = 0;
            return -1;
          }
        }
      }
      for (fci = egrd.fcbeg; fci < egrd.fcend; ++fci) {
        if (g_at(egrd.fakecorr[fci].fx, egrd.fakecorr[fci].fy)) {
          m = egrd.fakecorr[fci].fx;
          n = egrd.fakecorr[fci].fy;
          goldincorridor = TRUE;
          break;
        }
      }
      if (goldincorridor && !egrd.gddone) {
        await gd_pick_corridor_gold(grd, m, n);
        if (!grd.mpeaceful) {
          return -1;
        }
        egrd.warncnt = 5;
        return 0;
      }
      if (um_dist(grd.mx, grd.my, 1) || egrd.gddone | 0) {
        if (!egrd.gddone && !rn2(10) && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !G.u.uswallow && !(G.u.ustuck && !sticks(G.youmonst.data))) {
          await verbalize(S("Move along!"));
        }
        await restfakecorr(grd);
        return 0;
      }
      x = grd.mx;
      y = grd.my;
      if (u_in_vault) {
        { $g = 3; continue $L; }
      }
      nx = x - 1;
    case 11:
      if (!(nx <= x + 1)) { $g = 13; continue $L; }
      ny = y - 1;
    case 14:
      if (!(ny <= y + 1)) { $g = 16; continue $L; }
      if ((nx === x || ny === y) && (nx !== x || ny !== y) && isok(nx, ny)) {
        typ = (crm = $sat(G.level.locations[nx], ny)).typ & 0xff;
        if (!(typ <= DBWALL) && !(typ >= POOL && typ <= DRAWBRIDGE_UP)) {
          if (in_fcorridor(grd, nx, ny)) {
            { $g = 4; continue $L; }
          }
          if ($rd(in_rooms(nx, ny, VAULT))) {
            { $g = 15; continue $L; };
          }
          egrd.gddone = 1;
          if (typ >= DOOR) {
            { $g = 5; continue $L; }
          }
          crm.typ = (typ === SCORR ? CORR : DOOR) << 24 >> 24;
          if (crm.typ === DOOR) {
            crm.flags = (D_NODOOR) & 31;
          }
          { $g = 6; continue $L; }
        }
      }
    case 4: // nextnxy
      ;
    case 15:
      ++ny;
      { $g = 14; continue $L; }
    case 16:
    case 12:
      ++nx;
      { $g = 11; continue $L; }
    case 13:
    case 3: // nextpos
      nx = x;
      ny = y;
      gx = egrd.gdx;
      gy = egrd.gdy;
      dx = gx > x ? 1 : gx < x ? -1 : 0;
      dy = gy > y ? 1 : gy < y ? -1 : 0;
      if (Math.abs(gx - x) >= Math.abs(gy - y)) {
        nx += dx;
      } else {
        ny += dy;
      }
      while ((typ = (crm = $sat(G.level.locations[nx], ny)).typ & 0xff) !== STONE) {
        if (isok(nx + nx - x, ny + ny - y) && !(typ >= POOL && typ <= DRAWBRIDGE_UP) && $at2(G.level.locations, nx + nx - x, ny + ny - y).typ >= ROOM) {
          crm.typ = DOOR;
          crm.flags = (D_NODOOR) & 31;
          { $g = 6; continue $L; }
        }
        if (dy && nx !== x) {
          nx = x;
          ny = y + dy;
          continue;
        }
        if (dx && ny !== y) {
          ny = y;
          nx = x + dx;
          dy = 0;
          continue;
        }
        if (typ >= ROOM) {
          crm.typ = DOOR;
          crm.flags = (D_NODOOR) & 31;
          { $g = 6; continue $L; }
        }
        break;
      }
      crm.typ = CORR;
    case 6: // proceed
      newspot = TRUE;
      unblock_point(nx, ny);
      if ($rd(G.viz_array.a[G.viz_array.o + ny], nx) & 2) {
        await newsym(nx, ny);
      }
      if (nx !== gx || ny !== gy || (grd.mx !== gx || grd.my !== gy)) {
        fcp = $sat(egrd.fakecorr, egrd.fcend);
        if (egrd.fcend++ === FCSIZ) {
          await panic(S("fakecorr overflow"));
        }
        fcp.fx = nx << 24 >> 24;
        fcp.fy = ny << 24 >> 24;
        fcp.ftyp = typ << 24 >> 24;
      } else if (!egrd.gddone) {
        if (!await find_guard_dest(grd, P(egrd, "gdx"), P(egrd, "gdy")) || egrd.gdx === gx && egrd.gdy === gy) {
          await pline(S("%s, confused, disappears."), await Monnam(grd));
          disappear_msg_seen = TRUE;
          { $g = 1; continue $L; }
        } else {
          { $g = 3; continue $L; }
        }
      }
    case 5: // newpos
      await gd_mv_monaway(grd, nx, ny);
      if (!egrd.gddone) { $g = 17; continue $L; }
    case 1: // cleanup
      x = grd.mx, y = grd.my;
      see_guard = ((grd.wormno | 0 ? worm_known(grd) : $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && grd && grd.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 1 ? 1 : 0) && ((!grd.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !grd.mundetected) || (!((grd.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(grd.mx, grd.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & grd.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & grd.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === grd.data)) ? 1 : 0) << 24 >> 24;
      await parkguard(grd);
      await wallify_vault(grd);
      await restfakecorr(grd);
      do {
        if (await debugcore(S("vault.c"), 1)) {
          await pline(S("gd_move: %scleanup%s"), grd.isgd | 0 ? S("") : S("final "), grd.isgd | 0 ? S(" attempt") : S(""));
        }
      } while (0);
      if (!semi_dead && (in_fcorridor(grd, G.u.ux, G.u.uy) || $rd(G.viz_array.a[G.viz_array.o + y], x) & 2)) {
        if (!disappear_msg_seen && see_guard) {
          await pline(S("Suddenly, %s disappears."), await noit_mon_nam(grd));
        }
        return 1;
      }
      return -2;
    case 17:
      egrd.ogx = grd.mx;
      egrd.ogy = grd.my;
      G.level.monsters[grd.mx][grd.my] = null;
      await place_monster(grd, nx, ny);
      if (newspot && g_at(nx, ny)) {
        await mpickgold(grd);
        if ((grd.wormno | 0 ? worm_known(grd) : $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && grd && grd.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + grd.my], grd.mx) & 1 ? 1 : 0) && ((!grd.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !grd.mundetected) || (!((grd.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(grd.mx, grd.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & grd.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & grd.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === grd.data))) {
          await pline(S("%s picks up some gold."), await Monnam(grd));
        }
      } else {
        await newsym(grd.mx, grd.my);
      }
      await restfakecorr(grd);
      return 1;
    }
    break;
  }
}

export async function paygd(silently: number): Promise<void> {
  let $g = 0;
  let grd = null;
  let umoney = 0;
  let coins = null;
  let nextcoins = null;
  let gx = 0;
  let gy = 0;
  let buf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      grd = findgd();
      umoney = money_cnt(G.invent);
      buf = new Int8Array(256);
      if (!umoney || !grd) {
        return;
      }
      if (G.u.uinvault) {
        if (!silently) {
          await Your(S("%ld %s goes into the Magic Memory Vault."), umoney, await currency(umoney));
        }
        gx = G.u.ux;
        gy = G.u.uy;
      } else {
        if (grd.mpeaceful) {
          { $g = 1; continue $L; }
        }
        await mnexto(grd);
        if (!silently) {
          await pline(S("%s remits your gold to the vault."), await Monnam(grd));
        }
        gx = G.rooms[grd.mextra.egd.vroom].lx + rn2(2);
        gy = G.rooms[grd.mextra.egd.vroom].ly + rn2(2);
        sprintf(P(buf), S("To Croesus: here's the gold recovered from %s the %s."), P(G.plname), G.mons[G.u.umonster].mname);
        await make_grave(gx, gy, P(buf));
      }
      for (coins = G.invent; coins; coins = nextcoins) {
        nextcoins = coins.nobj;
        if (G.objects[coins.otyp].oc_class === COIN_CLASS) {
          await freeinv(coins);
          await place_object(coins, gx, gy);
          await stackobj(coins);
        }
      }
    case 1: // remove_guard
      await mongone(grd);
      return;
    }
    break;
  }
}

export function hidden_gold(): number {
  let value = 0;
  let obj = null;
  for (obj = G.invent; obj; obj = obj.nobj) {
    if (!!obj.cobj) {
      value += contained_gold(obj);
    }
  }
  return value;
}

export function gd_sound(): number {
  let grd = findgd();
  if (vault_occupied(P(G.u.urooms))) {
    return FALSE;
  } else {
    return (!grd ? 1 : 0) << 24 >> 24;
  }
}

export function vault_gd_watching(activity: number): void {
  let guard = findgd();
  if (guard && guard.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (guard.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + guard.my], guard.mx) & 1)) {
    if (activity === GD_EATGOLD || activity === GD_DESTROYGOLD) {
      guard.mextra.egd.witness = (activity) & 3;
    }
  }
}

export function $init(): void {
}
