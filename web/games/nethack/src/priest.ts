// @ts-nocheck
// NetHack 3.6.7 priest.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { adjalign, exercise } from './attrib.ts';
import { newsym } from './display.ts';
import { Monnam, bogon_is_pname, mon_nam, rndmonnam, x_monnam } from './do_name.ts';
import { assign_level, mapseen_temple, on_level } from './dungeon.ts';
import { check_special_room, in_rooms, money_cnt, nomul } from './hack.ts';
import { dist2, eos, online2, ordin, s_suffix, sgn, strncmpi } from './hacklib.ts';
import { makemon, mongets, newmextra, set_malign } from './makemon.ts';
import { mattacku } from './mhitu.ts';
import { bribe, newemin } from './minion.ts';
import { curse, mkobj, uncurse } from './mkobj.ts';
import { mfndpos, mongone, monnear, setmangry, wakeup } from './mon.ts';
import { attacktype_fordmg, pronoun_gender, sticks } from './mondata.ts';
import { monhaskey } from './monmove.ts';
import { linedup } from './mthrowu.ts';
import { makeplural } from './objnam.ts';
import { mhidden_description } from './pager.ts';
import { You, You_feel, Your, impossible, pline, verbalize } from './pline.ts';
import { body_part } from './polyself.ts';
import { incr_itimeout } from './potion.ts';
import { a_gname_at, halu_gname } from './pray.ts';
import { d, rn2 } from './rnd.ts';
import { inhishop, money2u } from './shk.ts';
import { mpickobj } from './steal.ts';
import { place_monster } from './steed.ts';
import { rloc } from './teleport.ts';
import { count_wsegs, worm_known, wseg_at } from './worm.ts';
import { find_mac, which_armor } from './worn.ts';
import { buzz, resist } from './zap.ts';
import { struct_d_level, struct_epri, struct_mkroom, struct_monst, struct_nhcoord, struct_permonst } from './structs.ts';
import { $at2, $rd, $sarr, $sat, $sdiff, $wr, G, P, S, free, memset, sprintf, strcat, strchr, strcpy } from './rt/index.ts';
import { AD_DGST, AD_ELEC, ALGN_PIOUS, ALGN_SINNED, ALLOW_DIG, ALLOW_ROCK, ALLOW_SANCT, ALLOW_SSM, ALLOW_WALL, ALTAR, AMULET_OF_YENDOR, AM_SHRINE, ARTICLE_THE, AT_ENGL, A_CHAOTIC, A_LAWFUL, A_NEUTRAL, A_NONE, A_WIS, BLINDED, BOTH_SIDES, BUSTDOOR, CLAIRVOYANT, CONFLICT, CONFUSION, DEAF, DETECT_MONSTERS, DISPLACED, DOOR, FALSE, FAST, FROMOUTSIDE, GLIB, HALLUC, HALLUC_RES, HAND, INFRAVISION, INTRINSIC, INVIS, LEG, LOW_PM, MFAST, MM_ADJACENTOK, MM_EMIN, MM_EPRI, MSLOW, NOTONL, NO_MM_FLAGS, OPENDOOR, PM_ALIGNED_PRIEST, PM_ANGEL, PM_GHOST, PM_HIGH_PRIEST, PM_LONG_WORM, PROTECTION, RING_CLASS, ROOM, ROOMOFFSET, SEE_INVIS, SICK, SICK_NONVOMITABLE, SICK_VOMITABLE, SLIMED, SPBOOK_CLASS, SPINE, STONED, STRANGLED, STRAT_WAITMASK, STUNNED, SUPPRESS_INVISIBLE, SUPPRESS_IT, TELEPAT, TEMPLE, TRUE, UNLOCKDOOR, VOMITING, WARN_OF_MON, WOUNDED_LEGS, W_ARMC } from './consts.ts';

let priest_talk$cranky_msg: any;
let piousness$buf: any;

export async function newepri(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  if (!mtmp.mextra.epri) {
    mtmp.mextra.epri = new struct_epri();
    memset(mtmp.mextra.epri, 0, 40);
  }
}

export function free_epri(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.epri) {
    free(mtmp.mextra.epri);
    mtmp.mextra.epri = null;
  }
  mtmp.ispriest = 0;
}

export async function move_special(mtmp: struct_monst | null, in_his_shop: number, appr: number, uondoor: number, avoid: number, omx: number, omy: number, gx: number, gy: number): Promise<number> {
  let $g = 0;
  let nx = 0;
  let ny = 0;
  let nix = 0;
  let niy = 0;
  let i = 0;
  let chcnt = 0;
  let cnt = 0;
  let poss = $sarr(struct_nhcoord, 9);
  let info = new Float64Array(9);
  let allowflags = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      poss = $sarr(struct_nhcoord, 9);
      info = new Float64Array(9);
      if (omx === gx && omy === gy) {
        return 0;
      }
      if (mtmp.mconf) {
        avoid = FALSE;
        appr = 0;
      }
      nix = omx;
      niy = omy;
      if (mtmp.isshk) {
        allowflags = ALLOW_SSM;
      } else {
        allowflags = ALLOW_SSM | ALLOW_SANCT;
      }
      if ((mtmp.data.mflags1 & 8) >>> 0 !== 0) {
        allowflags = allowflags | (ALLOW_ROCK | ALLOW_WALL);
      }
      if ((mtmp.data.mflags2 & 134217728) >>> 0 !== 0) {
        allowflags = allowflags | ALLOW_ROCK;
      }
      if ((mtmp.data.mflags1 & 32) >>> 0 !== 0) {
        allowflags = allowflags | ALLOW_DIG;
      }
      if (!((mtmp.data.mflags1 & 8192) >>> 0 !== 0) && !(mtmp.data.msize < 1)) {
        allowflags = allowflags | OPENDOOR;
        if (monhaskey(mtmp, TRUE)) {
          allowflags = allowflags | UNLOCKDOOR;
        }
      }
      if ((mtmp.data.mflags2 & 8192) >>> 0 !== 0) {
        allowflags = allowflags | BUSTDOOR;
      }
      cnt = await mfndpos(mtmp, poss[0], P(info), allowflags) << 24 >> 24;
      if (mtmp.isshk | 0 && avoid && uondoor) {
        for (i = 0; i < cnt; i = i + 1 << 24 >> 24) {
          if (!(info[i] & NOTONL)) {
            { $g = 1; continue $L; }
          }
        }
        avoid = FALSE;
      }
    case 1: // pick_move
      chcnt = 0;
      for (i = 0; i < cnt; i = i + 1 << 24 >> 24) {
        nx = poss[i].x;
        ny = poss[i].y;
        if ($at2(G.level.locations, nx, ny).typ >= ROOM || mtmp.isshk | 0 && (!in_his_shop || mtmp.mextra.eshk.following)) {
          if (avoid && info[i] & NOTONL) {
            continue;
          }
          if (!appr && !rn2(chcnt = chcnt + 1 << 24 >> 24) || appr && dist2(nx, ny, gx, gy) < dist2(nix, niy, gx, gy)) {
            nix = nx;
            niy = ny;
          }
        }
      }
      if (mtmp.ispriest | 0 && avoid && nix === omx && niy === omy && online2(omx, omy, G.u.ux, G.u.uy)) {
        avoid = FALSE;
        { $g = 1; continue $L; }
      }
      if (nix !== omx || niy !== omy) {
        if (!!G.level.monsters[nix][niy]) {
          return 0;
        }
        G.level.monsters[omx][omy] = null;
        await place_monster(mtmp, nix, niy);
        await newsym(nix, niy);
        if (mtmp.isshk | 0 && !in_his_shop && inhishop(mtmp)) {
          await check_special_room(FALSE);
        }
        return 1;
      }
      return 0;
    }
    break;
  }
}

export function temple_occupied(array: Ptr | null): number {
  let ptr = null;
  for (ptr = array; ptr.a[ptr.o]; ptr = ptr.add(1)) {
    if (G.rooms[ptr.a[ptr.o] - ROOMOFFSET].rtype === TEMPLE) {
      return ptr.a[ptr.o];
    }
  }
  return 0;
}

function histemple_at(priest: struct_monst | null, x: number, y: number): number {
  return (priest && priest.ispriest | 0 && priest.mextra.epri.shroom === $rd(in_rooms(x, y, TEMPLE)) && on_level(priest.mextra.epri.shrlevel, G.u.uz) ? 1 : 0) << 24 >> 24;
}

export function inhistemple(priest: struct_monst | null): number {
  if (!priest || !priest.ispriest) {
    return FALSE;
  }
  if (!histemple_at(priest, priest.mx, priest.my)) {
    return FALSE;
  }
  return has_shrine(priest);
}

export async function pri_move(priest: struct_monst | null): Promise<number> {
  let gx = 0;
  let gy = 0;
  let omx = 0;
  let omy = 0;
  let temple = 0;
  let avoid = TRUE;
  omx = priest.mx;
  omy = priest.my;
  if (!histemple_at(priest, omx, omy)) {
    return -1;
  }
  temple = priest.mextra.epri.shroom;
  gx = priest.mextra.epri.shrpos.x;
  gy = priest.mextra.epri.shrpos.y;
  gx = gx + (rn2(3) + -1) << 24 >> 24;
  gy = gy + (rn2(3) + -1) << 24 >> 24;
  if (!priest.mpeaceful || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !await resist(priest, RING_CLASS, 0, 0)) {
    if (monnear(priest, G.u.ux, G.u.uy)) {
      if (G.u.uprops[DISPLACED].extrinsic) {
        await Your(S("displaced image doesn't fool %s!"), await mon_nam(priest));
      }
      await mattacku(priest);
      return 0;
    } else if (strchr(P(G.u.urooms), temple)) {
      if (priest.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (priest.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + priest.my], priest.mx) & 1)) {
        gx = G.u.ux;
        gy = G.u.uy;
      }
      avoid = FALSE;
    }
  } else if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) {
    avoid = FALSE;
  }
  return await move_special(priest, FALSE, TRUE, FALSE, avoid, omx, omy, gx, gy);
}

export async function priestini(lvl: struct_d_level | null, sroom: struct_mkroom | null, sx: number, sy: number, sanctum: number): Promise<void> {
  let priest = null;
  let otmp = null;
  let cnt = 0;
  if (!!G.level.monsters[sx + 1][sy]) {
    await rloc(!!G.level.monsters[sx + 1][sy] ? G.level.monsters[sx + 1][sy] : null, FALSE);
  }
  priest = await makemon($sat(G.mons, sanctum ? PM_HIGH_PRIEST : PM_ALIGNED_PRIEST), sx + 1, sy, MM_EPRI);
  if (priest) {
    priest.mextra.epri.shroom = $sdiff(sroom, G.rooms[0]) + ROOMOFFSET << 24 >> 24;
    priest.mextra.epri.shralign = (!$at2(G.level.locations, sx, sy).flags ? -128 : ($at2(G.level.locations, sx, sy).flags | 0) === 4 ? 1 : ($at2(G.level.locations, sx, sy).flags | 0) - 2) << 24 >> 24;
    priest.mextra.epri.shrpos.x = sx << 24 >> 24;
    priest.mextra.epri.shrpos.y = sy << 24 >> 24;
    assign_level(priest.mextra.epri.shrlevel, lvl);
    priest.mtrapseen = ~0;
    priest.mpeaceful = 1;
    priest.ispriest = 1;
    priest.isminion = 0;
    priest.msleeping = 0;
    set_malign(priest);
    if (sanctum && priest.mextra.epri.shralign === A_NONE && on_level(G.dungeon_topology.d_sanctum_level, G.u.uz)) {
      await mongets(priest, AMULET_OF_YENDOR);
    }
    for (cnt = rn2(3) + 2; cnt > 0; --cnt) {
      await mpickobj(priest, await mkobj(SPBOOK_CLASS, FALSE));
    }
    if (rn2(2) && !!(otmp = await which_armor(priest, W_ARMC))) {
      if (p_coaligned(priest)) {
        await uncurse(otmp);
      } else {
        await curse(otmp);
      }
    }
  }
}

export function mon_aligntyp(mon: struct_monst | null): number {
  let algn = (mon.ispriest | 0 ? mon.mextra.epri.shralign : mon.isminion | 0 ? mon.mextra.emin.min_align : mon.data.maligntyp) << 24 >> 24;
  if (algn === A_NONE) {
    return A_NONE;
  }
  return (algn > 0 ? A_LAWFUL : algn < 0 ? A_CHAOTIC : A_NEUTRAL) << 24 >> 24;
}

export async function priestname(mon: struct_monst | null, pname: Ptr | null): Promise<Ptr | null> {
  let do_hallu = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? 1 : 0) << 24 >> 24;
  let aligned_priest = (mon.data === $sat(G.mons, PM_ALIGNED_PRIEST) ? 1 : 0) << 24 >> 24;
  let high_priest = (mon.data === $sat(G.mons, PM_HIGH_PRIEST) ? 1 : 0) << 24 >> 24;
  const whatcode = new Int8Array(1);
  whatcode[0] = 0;
  let what = do_hallu ? await rndmonnam(P(whatcode, 0)) : mon.data.mname;
  if (!mon.ispriest && !mon.isminion) {
    return strcpy(pname, what);
  }
  pname.a[pname.o] = 0;
  if (!do_hallu || !bogon_is_pname(whatcode[0])) {
    strcat(pname, S("the "));
  }
  if (mon.minvis) {
    strcat(pname, S("invisible "));
  }
  if (mon.isminion | 0 && mon.mextra.emin.renegade) {
    strcat(pname, S("renegade "));
  }
  if (mon.ispriest | 0 || aligned_priest) {
    if (!aligned_priest && !high_priest) {
      ;
    } else {
      if (high_priest) {
        strcat(pname, S("high "));
      }
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        what = S("poohbah");
      } else if (mon.female) {
        what = S("priestess");
      } else {
        what = S("priest");
      }
    }
  } else {
    if (mon.mtame && !strncmpi(what, S("Angel"), -1)) {
      strcat(pname, S("guardian "));
    }
  }
  strcat(pname, what);
  if (do_hallu || !high_priest || !((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 2 || G.program_state.gameover) {
    strcat(pname, S(" of "));
    strcat(pname, await halu_gname(mon_aligntyp(mon)));
  }
  return pname;
}

export function p_coaligned(priest: struct_monst | null): number {
  return (G.u.ualign.type === mon_aligntyp(priest) ? 1 : 0) << 24 >> 24;
}

function has_shrine(pri: struct_monst | null): number {
  let lev = null;
  let epri_p = null;
  if (!pri || !pri.ispriest) {
    return FALSE;
  }
  epri_p = pri.mextra.epri;
  lev = $sat(G.level.locations[epri_p.shrpos.x], epri_p.shrpos.y);
  if (!(lev.typ === ALTAR) || !((lev.flags | 0) & AM_SHRINE)) {
    return FALSE;
  }
  return (epri_p.shralign === (!((lev.flags | 0) & ~8) ? -128 : ((lev.flags | 0) & ~8) === 4 ? 1 : ((lev.flags | 0) & ~8) - 2) << 24 >> 24 ? 1 : 0) << 24 >> 24;
}

export function findpriest(roomno: number): struct_monst | null {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.ispriest | 0 && mtmp.mextra.epri.shroom === roomno && histemple_at(mtmp, mtmp.mx, mtmp.my)) {
      return mtmp;
    }
  }
  return null;
}

export async function intemple(roomno: number): Promise<void> {
  let priest = null;
  let mtmp = null;
  let epri_p = null;
  let shrined = 0;
  let sanctum = 0;
  let can_speak = 0;
  let this_time = null;
  let other_time = null;
  let msg1 = null;
  let msg2 = null;
  let buf = new Int8Array(256);
  if (temple_occupied(P(G.u.urooms0))) {
    return;
  }
  if (!!(priest = findpriest(roomno << 24 >> 24))) {
    epri_p = priest.mextra.epri;
    shrined = has_shrine(priest);
    sanctum = (priest.data === $sat(G.mons, PM_HIGH_PRIEST) && ((G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) ? 1 : 0) << 24 >> 24;
    can_speak = (priest.mcanmove | 0 && !priest.msleeping ? 1 : 0) << 24 >> 24;
    if (can_speak && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && G.moves >= epri_p.intone_time) {
      let save_priest = priest.ispriest;
      if (sanctum && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
        priest.ispriest = 0;
      }
      await pline(S("%s intones:"), (priest.wormno | 0 ? worm_known(priest) : $rd(G.viz_array.a[G.viz_array.o + priest.my], priest.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && priest && priest.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + priest.my], priest.mx) & 1 ? 1 : 0) && ((!priest.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !priest.mundetected) ? await Monnam(priest) : S("A nearby voice"));
      priest.ispriest = (save_priest) & 1;
      epri_p.intone_time = G.moves + d(10, 500);
      epri_p.enter_time = 0;
    }
    msg1 = msg2 = null;
    if (sanctum && ((G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level))) {
      if (priest.mpeaceful) {
        msg1 = S("Infidel, you have entered Moloch's Sanctum!");
        msg2 = S("Be gone!");
        priest.mpeaceful = 0;
        set_malign(priest);
      } else {
        msg1 = S("You desecrate this place by your presence!");
      }
    } else if (G.moves >= epri_p.enter_time) {
      sprintf(P(buf), S("Pilgrim, you enter a %s place!"), !shrined ? S("desecrated") : S("sacred"));
      msg1 = P(buf);
    }
    if (msg1 && can_speak && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await verbalize(S("%s"), msg1);
      if (msg2) {
        await verbalize(S("%s"), msg2);
      }
      epri_p.enter_time = G.moves + d(10, 100);
    }
    if (!sanctum) {
      if (!shrined || !p_coaligned(priest) || G.u.ualign.record <= ALGN_SINNED) {
        msg1 = S("have a%s forbidding feeling...");
        msg2 = !shrined || !p_coaligned(priest) ? S("") : S(" strange");
        this_time = P(epri_p, "hostile_time");
        other_time = P(epri_p, "peaceful_time");
      } else {
        msg1 = S("experience %s sense of peace.");
        msg2 = G.u.ualign.record >= ALGN_PIOUS ? S("a") : S("an unusual");
        this_time = P(epri_p, "peaceful_time");
        other_time = P(epri_p, "hostile_time");
      }
      if (G.moves >= this_time.a[this_time.o] || other_time.a[other_time.o] >= this_time.a[this_time.o]) {
        await You(msg1, msg2);
        this_time.a[this_time.o] = G.moves + d(10, 20);
        if (this_time.a[this_time.o] <= other_time.a[other_time.o]) {
          other_time.a[other_time.o] = this_time.a[this_time.o] - 1;
        }
      }
    }
    mapseen_temple(priest);
  } else {
    switch (rn2(4)) {
    case 0:
      await You(S("have an eerie feeling..."));
      break;
    case 1:
      await You_feel(S("like you are being watched."));
      break;
    case 2:
      await pline(S("A shiver runs down your %s."), body_part(SPINE));
      break;
    default:
      break;
    }
    if (!rn2(5) && !!(mtmp = await makemon($sat(G.mons, PM_GHOST), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
      let ngen = G.mvitals[PM_GHOST].born;
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("A%s ghost appears next to you%c"), ngen < 5 ? S("n enormous") : S(""), ngen < 10 ? 33 : 46);
      } else {
        await You(S("sense a presence close by!"));
      }
      mtmp.mpeaceful = 0;
      set_malign(mtmp);
      if (G.flags.verbose) {
        await You(S("are frightened to death, and unable to move."));
      }
      nomul(-3);
      G.multi_reason = S("being terrified of a ghost");
      G.nomovemsg = S("You regain your composure.");
    }
  }
}

export async function forget_temple_entry(priest: struct_monst | null): Promise<void> {
  let epri_p = priest.ispriest | 0 ? priest.mextra.epri : null;
  if (!epri_p) {
    await impossible(S("attempting to manipulate shrine data for non-priest?"));
    return;
  }
  epri_p.intone_time = epri_p.enter_time = epri_p.peaceful_time = epri_p.hostile_time = 0;
}

export async function priest_talk(priest: struct_monst | null): Promise<void> {
  let $t1: any;
  let coaligned = p_coaligned(priest);
  let strayed = (G.u.ualign.record < 0 ? 1 : 0) << 24 >> 24;
  ++G.u.uconduct.gnostic;
  if (priest.mflee | 0 || !priest.ispriest && coaligned && strayed) {
    await pline(S("%s doesn't want anything to do with you!"), await Monnam(priest));
    priest.mpeaceful = 0;
    return;
  }
  if (!inhistemple(priest) || !priest.mpeaceful || !priest.mcanmove || priest.msleeping | 0) {
    if (!priest.mcanmove || priest.msleeping | 0) {
      await pline(S("%s breaks out of %s reverie!"), await Monnam(priest), G.genders[pronoun_gender(priest, 0)].his);
      priest.mfrozen = (priest.msleeping = 0) & 127;
      priest.mcanmove = 1;
    }
    priest.mpeaceful = 0;
    await verbalize(S("%s"), priest_talk$cranky_msg[rn2(3)]);
    return;
  }
  if (priest.mpeaceful | 0 && $rd(in_rooms(priest.mx, priest.my, TEMPLE)) && !has_shrine(priest)) {
    await verbalize(S("Begone!  Thou desecratest this holy place with thy presence."));
    priest.mpeaceful = 0;
    return;
  }
  if (!money_cnt(G.invent)) {
    if (coaligned && !strayed) {
      let pmoney = money_cnt(priest.minvent);
      if (pmoney > 0) {
        await pline(S("%s gives you %s for an ale."), await Monnam(priest), pmoney === 1 ? S("one bit") : S("two bits"));
        await money2u(priest, pmoney > 1 ? 2 : 1);
      } else {
        await pline(S("%s preaches the virtues of poverty."), await Monnam(priest));
      }
      await exercise(A_WIS, TRUE);
    } else {
      await pline(S("%s is not interested."), await Monnam(priest));
    }
    return;
  } else {
    let offer = 0;
    await pline(S("%s asks you for a contribution for the temple."), await Monnam(priest));
    if ((offer = await bribe(priest)) === 0) {
      await verbalize(S("Thou shalt regret thine action!"));
      if (coaligned) {
        adjalign(-1);
      }
    } else if (offer < G.u.ulevel * 200) {
      if (money_cnt(G.invent) > offer * 2) {
        await verbalize(S("Cheapskate."));
      } else {
        await verbalize(S("I thank thee for thy contribution."));
        await exercise(A_WIS, TRUE);
      }
    } else if (offer < G.u.ulevel * 400) {
      await verbalize(S("Thou art indeed a pious individual."));
      if (money_cnt(G.invent) < offer * 2) {
        if (coaligned && G.u.ualign.record <= ALGN_SINNED) {
          adjalign(1);
        }
        await verbalize(S("I bestow upon thee a blessing."));
        incr_itimeout(P(G.u.uprops[CLAIRVOYANT], "intrinsic"), rn2(500) + 500);
      }
    } else if (offer < G.u.ulevel * 600 && (!(G.u.uprops[PROTECTION].intrinsic & INTRINSIC) || G.u.ublessed < 20 && (G.u.ublessed < 9 || !rn2(G.u.ublessed)))) {
      await verbalize(S("Thou hast been rewarded for thy devotion."));
      if (!(G.u.uprops[PROTECTION].intrinsic & INTRINSIC)) {
        ($t1 = G.u.uprops[PROTECTION], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
        if (!G.u.ublessed) {
          G.u.ublessed = rn2(3) + 2;
        }
      } else {
        ++G.u.ublessed;
      }
    } else {
      await verbalize(S("Thy selfless generosity is deeply appreciated."));
      if (money_cnt(G.invent) < offer * 2 && coaligned) {
        if (strayed && G.moves - G.u.ucleansed > 5000) {
          G.u.ualign.record = 0;
          G.u.ucleansed = G.moves;
        } else {
          adjalign(2);
        }
      }
    }
  }
}

export async function mk_roamer(ptr: struct_permonst | null, alignment: number, x: number, y: number, peaceful: number): Promise<struct_monst | null> {
  let roamer = null;
  let coaligned = (G.u.ualign.type === alignment ? 1 : 0) << 24 >> 24;
  if (!!G.level.monsters[x][y]) {
    await rloc(!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null, FALSE);
  }
  if (!(roamer = await makemon(ptr, x, y, MM_ADJACENTOK | MM_EMIN))) {
    return null;
  }
  roamer.mextra.emin.min_align = alignment;
  roamer.mextra.emin.renegade = (coaligned && !peaceful ? 1 : 0) << 24 >> 24;
  roamer.ispriest = 0;
  roamer.isminion = 1;
  roamer.mtrapseen = ~0;
  roamer.mpeaceful = (peaceful >>> 0) & 1;
  roamer.msleeping = 0;
  set_malign(roamer);
  return roamer;
}

export async function reset_hostility(roamer: struct_monst | null): Promise<void> {
  if (!roamer.isminion) {
    return;
  }
  if (roamer.data !== $sat(G.mons, PM_ALIGNED_PRIEST) && roamer.data !== $sat(G.mons, PM_ANGEL)) {
    return;
  }
  if (roamer.mextra.emin.min_align !== G.u.ualign.type) {
    roamer.mpeaceful = ((roamer.mtame = 0) >>> 0) & 1;
    set_malign(roamer);
  }
  await newsym(roamer.mx, roamer.my);
}

export function in_your_sanctuary(mon: struct_monst | null, x: number, y: number): number {
  let roomno = 0;
  let priest = null;
  if (mon) {
    if ((mon.data.mflags2 & 4096) >>> 0 !== 0 || (mon.data === $sat(G.mons, 308) || mon.data === $sat(G.mons, 310) || mon.data === $sat(G.mons, 309))) {
      return FALSE;
    }
    x = mon.mx, y = mon.my;
  }
  if (G.u.ualign.record <= ALGN_SINNED) {
    return FALSE;
  }
  if ((roomno = temple_occupied(P(G.u.urooms))) === 0 || roomno !== $rd(in_rooms(x, y, TEMPLE))) {
    return FALSE;
  }
  if (!(priest = findpriest(roomno))) {
    return FALSE;
  }
  return (has_shrine(priest) && p_coaligned(priest) && priest.mpeaceful | 0 ? 1 : 0) << 24 >> 24;
}

export async function ghod_hitsu(priest: struct_monst | null): Promise<void> {
  let x = 0;
  let y = 0;
  let ax = 0;
  let ay = 0;
  let roomno = temple_occupied(P(G.u.urooms));
  let troom = null;
  if (!roomno || !has_shrine(priest)) {
    return;
  }
  ax = x = priest.mextra.epri.shrpos.x;
  ay = y = priest.mextra.epri.shrpos.y;
  troom = $sat(G.rooms, roomno - ROOMOFFSET);
  if (G.u.ux === x && G.u.uy === y || !linedup(G.u.ux, G.u.uy, x, y, 1)) {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR) {
      if (G.u.ux === troom.lx - 1) {
        x = troom.hx;
        y = G.u.uy;
      } else if (G.u.ux === troom.hx + 1) {
        x = troom.lx;
        y = G.u.uy;
      } else if (G.u.uy === troom.ly - 1) {
        x = G.u.ux;
        y = troom.hy;
      } else if (G.u.uy === troom.hy + 1) {
        x = G.u.ux;
        y = troom.ly;
      }
    } else {
      switch (rn2(4)) {
      case 0:
        x = G.u.ux;
        y = troom.ly;
        break;
      case 1:
        x = G.u.ux;
        y = troom.hy;
        break;
      case 2:
        x = troom.lx;
        y = G.u.uy;
        break;
      default:
        x = troom.hx;
        y = G.u.uy;
        break;
      }
    }
    if (!linedup(G.u.ux, G.u.uy, x, y, 1)) {
      return;
    }
  }
  switch (rn2(3)) {
  case 0:
    await pline(S("%s roars in anger:  \"Thou shalt suffer!\""), await a_gname_at(ax, ay));
    break;
  case 1:
    await pline(S("%s voice booms:  \"How darest thou harm my servant!\""), s_suffix(await a_gname_at(ax, ay)));
    break;
  default:
    await pline(S("%s roars:  \"Thou dost profane my shrine!\""), await a_gname_at(ax, ay));
    break;
  }
  await buzz(-10 - (AD_ELEC - 1), 6, x, y, sgn(G.tbx), sgn(G.tby));
  await exercise(A_WIS, FALSE);
}

export async function angry_priest(): Promise<void> {
  let priest = null;
  let lev = null;
  if (!!(priest = findpriest(temple_occupied(P(G.u.urooms))))) {
    let eprip = priest.mextra.epri;
    await wakeup(priest, FALSE);
    await setmangry(priest, FALSE);
    lev = $sat(G.level.locations[eprip.shrpos.x], eprip.shrpos.y);
    if (!(lev.typ === ALTAR) || (!((lev.flags | 0) & 7) ? -128 : ((lev.flags | 0) & 7) === 4 ? 1 : ((lev.flags | 0) & 7) - 2) << 24 >> 24 !== eprip.shralign) {
      if (!priest.mextra.emin) {
        await newemin(priest);
      }
      priest.ispriest = 0;
      priest.isminion = 1;
      priest.mextra.emin.min_align = eprip.shralign;
      priest.mextra.emin.renegade = FALSE;
      free_epri(priest);
    }
  }
}

export async function clearpriests(): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.ispriest | 0 && !on_level(mtmp.mextra.epri.shrlevel, G.u.uz)) {
      await mongone(mtmp);
    }
  }
}

export function restpriest(mtmp: struct_monst | null, ghostly: number): void {
  if (G.u.uz.dlevel) {
    if (ghostly) {
      assign_level(mtmp.mextra.epri.shrlevel, G.u.uz);
    }
  }
}

export function align_str(alignment: number): Ptr | null {
  switch (alignment) {
  case -1:
    return S("chaotic");
  case 0:
    return S("neutral");
  case 1:
    return S("lawful");
  case -128:
    return S("unaligned");
  }
  return S("unknown");
}

export function piousness(showneg: number, suffix: Ptr | null): Ptr | null {
  let pio = null;
  if (G.u.ualign.record >= 20) {
    pio = S("piously");
  } else if (G.u.ualign.record > 13) {
    pio = S("devoutly");
  } else if (G.u.ualign.record > 8) {
    pio = S("fervently");
  } else if (G.u.ualign.record > 3) {
    pio = S("stridently");
  } else if (G.u.ualign.record === 3) {
    pio = S("");
  } else if (G.u.ualign.record > 0) {
    pio = S("haltingly");
  } else if (G.u.ualign.record === 0) {
    pio = S("nominally");
  } else if (!showneg) {
    pio = S("insufficiently");
  } else if (G.u.ualign.record >= -3) {
    pio = S("strayed");
  } else if (G.u.ualign.record >= -8) {
    pio = S("sinned");
  } else {
    pio = S("transgressed");
  }
  sprintf(P(piousness$buf), S("%s"), pio);
  if (suffix && (!showneg || G.u.ualign.record >= 0)) {
    if (G.u.ualign.record !== 3) {
      strcat(P(piousness$buf), S(" "));
    }
    strcat(P(piousness$buf), suffix);
  }
  return P(piousness$buf);
}

export async function mstatusline(mtmp: struct_monst | null): Promise<void> {
  let alignment = mon_aligntyp(mtmp);
  let info = new Int8Array(256);
  let monnambuf = new Int8Array(256);
  info[0] = 0;
  if (mtmp.mtame) {
    strcat(P(info), S(", tame"));
    if (G.flags.debug) {
      sprintf(eos(P(info)), S(" (%d"), mtmp.mtame);
      if (!mtmp.isminion) {
        sprintf(eos(P(info)), S("; hungry %ld; apport %d"), mtmp.mextra.edog.hungrytime, mtmp.mextra.edog.apport);
      }
      strcat(P(info), S(")"));
    }
  } else if (mtmp.mpeaceful) {
    strcat(P(info), S(", peaceful"));
  }
  if (mtmp.data === $sat(G.mons, PM_LONG_WORM)) {
    let segndx = 0;
    let nsegs = count_wsegs(mtmp);
    if (!nsegs) {
      strcat(P(info), S(", single segment"));
    } else {
      ++nsegs;
      segndx = wseg_at(mtmp, G.bhitpos.x, G.bhitpos.y);
      sprintf(eos(P(info)), S(", %d%s of %d segments"), segndx, ordin(segndx), nsegs);
    }
  }
  if (mtmp.cham >= LOW_PM && mtmp.data !== $sat(G.mons, mtmp.cham)) {
    strcat(P(info), S(", shapechanger"));
  }
  if (mtmp.meating) {
    strcat(P(info), S(", eating"));
  }
  if (mtmp.mundetected | 0 || mtmp.m_ap_type) {
    await mhidden_description(mtmp, TRUE, eos(P(info)));
  }
  if (mtmp.mcan) {
    strcat(P(info), S(", cancelled"));
  }
  if (mtmp.mconf) {
    strcat(P(info), S(", confused"));
  }
  if (mtmp.mblinded | 0 || !mtmp.mcansee) {
    strcat(P(info), S(", blind"));
  }
  if (mtmp.mstun) {
    strcat(P(info), S(", stunned"));
  }
  if (mtmp.msleeping) {
    strcat(P(info), S(", asleep"));
  } else if (mtmp.mfrozen | 0 || !mtmp.mcanmove) {
    strcat(P(info), S(", can't move"));
  } else if ((mtmp.mstrategy & STRAT_WAITMASK) >>> 0) {
    strcat(P(info), S(", meditating"));
  }
  if (mtmp.mflee) {
    strcat(P(info), S(", scared"));
  }
  if (mtmp.mtrapped) {
    strcat(P(info), S(", trapped"));
  }
  if (mtmp.mspeed) {
    strcat(P(info), (mtmp.mspeed | 0) === MFAST ? S(", fast") : (mtmp.mspeed | 0) === MSLOW ? S(", slow") : S(", [? speed]"));
  }
  if (mtmp.minvis) {
    strcat(P(info), S(", invisible"));
  }
  if (mtmp === G.u.ustuck) {
    strcat(P(info), sticks(G.youmonst.data) ? S(", held by you") : !G.u.uswallow ? S(", holding you") : attacktype_fordmg(G.u.ustuck.data, AT_ENGL, AD_DGST) ? S(", digesting you") : (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S(", swallowing you") : S(", engulfing you"));
  }
  if (mtmp === G.u.usteed) {
    strcat(P(info), S(", carrying you"));
  }
  strcpy(P(monnambuf), await x_monnam(mtmp, ARTICLE_THE, null, SUPPRESS_IT | SUPPRESS_INVISIBLE, FALSE));
  await pline(S("Status of %s (%s):  Level %d  HP %d(%d)  AC %d%s."), P(monnambuf), align_str(alignment), mtmp.m_lev, mtmp.mhp, mtmp.mhpmax, find_mac(mtmp), P(info));
}

export async function ustatusline(): Promise<void> {
  let info = new Int8Array(256);
  info[0] = 0;
  if (G.u.uprops[SICK].intrinsic) {
    strcat(P(info), S(", dying from"));
    if ((G.u.usick_type | 0) & SICK_VOMITABLE) {
      strcat(P(info), S(" food poisoning"));
    }
    if ((G.u.usick_type | 0) & SICK_NONVOMITABLE) {
      if ((G.u.usick_type | 0) & SICK_VOMITABLE) {
        strcat(P(info), S(" and"));
      }
      strcat(P(info), S(" illness"));
    }
  }
  if (G.u.uprops[STONED].intrinsic) {
    strcat(P(info), S(", solidifying"));
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    strcat(P(info), S(", becoming slimy"));
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    strcat(P(info), S(", being strangled"));
  }
  if (G.u.uprops[VOMITING].intrinsic) {
    strcat(P(info), S(", nauseated"));
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    strcat(P(info), S(", confused"));
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    strcat(P(info), S(", blind"));
    if (G.u.ucreamed) {
      if (G.u.ucreamed < G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        strcat(P(info), S(", cover"));
      }
      strcat(P(info), S("ed by sticky goop"));
    }
  }
  if (G.u.uprops[STUNNED].intrinsic) {
    strcat(P(info), S(", stunned"));
  }
  if (!G.u.usteed && (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic)) {
    let what = body_part(LEG);
    if (((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic ? 1 : 0) & BOTH_SIDES) === BOTH_SIDES) {
      what = await makeplural(what);
    }
    sprintf(eos(P(info)), S(", injured %s"), what);
  }
  if (G.u.uprops[GLIB].intrinsic) {
    sprintf(eos(P(info)), S(", slippery %s"), await makeplural(body_part(HAND)));
  }
  if (G.u.utrap) {
    strcat(P(info), S(", trapped"));
  }
  if (G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic) {
    strcat(P(info), G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic ? S(", very fast") : S(", fast"));
  }
  if (G.u.uundetected) {
    strcat(P(info), S(", concealed"));
  }
  if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) {
    strcat(P(info), S(", invisible"));
  }
  if (G.u.ustuck) {
    if (sticks(G.youmonst.data)) {
      strcat(P(info), S(", holding "));
    } else {
      strcat(P(info), S(", held by "));
    }
    strcat(P(info), await mon_nam(G.u.ustuck));
  }
  await pline(S("Status of %s (%s):  Level %d  HP %d(%d)  AC %d%s."), P(G.plname), piousness(FALSE, align_str(G.u.ualign.type)), G.u.umonnum !== G.u.umonster ? G.mons[G.u.umonnum].mlevel : G.u.ulevel, G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp, G.u.umonnum !== G.u.umonster ? G.u.mhmax : G.u.uhpmax, G.u.uac, P(info));
}

export function $init(): void {
  priest_talk$cranky_msg = [S("Thou wouldst have words, eh?  I'll give thee a word or two!"), S("Talk?  Here is what I have to say!"), S("Pilgrim, I would speak no longer with thee.")];
  piousness$buf = new Int8Array(32);
}
