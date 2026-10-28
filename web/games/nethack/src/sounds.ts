// @ts-nocheck
// NetHack 3.6.7 sounds.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { getdir, isok } from './cmd.ts';
import { glyph_at, map_invisible } from './display.ts';
import { Monnam, noveltitle, rndmonnam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { Death_quote } from './files.ts';
import { money_cnt, nomul } from './hack.ts';
import { dist2, letter, midnight, night, strncmpi, ucase } from './hacklib.ts';
import { currency, g_at, u_have_novel } from './invent.ts';
import { could_seduce, doseduce } from './mhitu.ts';
import { demon_talk } from './minion.ts';
import { search_special } from './mkroom.ts';
import { genus, wake_nearto } from './mon.ts';
import { monsndx, pronoun_gender, same_race } from './mondata.ts';
import { mplayer_talk } from './mplayer.ts';
import { an, vtense } from './objnam.ts';
import { You, You_cant, You_hear, Your, pline, pline_The, verbalize } from './pline.ts';
import { body_part, poly_gender } from './polyself.ts';
import { halu_gname } from './pray.ts';
import { inhistemple, mon_aligntyp, priest_talk, temple_occupied } from './priest.ts';
import { quest_chat } from './quest.ts';
import { rn2 } from './rnd.ts';
import { doconsult } from './rumors.ts';
import { price_quote, shk_chat, shop_object, tended_shop } from './shk.ts';
import { t_at } from './trap.ts';
import { gd_sound, vault_occupied } from './vault.ts';
import { aggravate, cuss } from './wizard.ts';
import { worm_known } from './worm.ts';
import { struct_monst } from './structs.ts';
import { $at2, $rd, $sat, $sdiff, $sidx, $wr, G, P, S, sprintf, strcat, strchr, strcpy } from './rt/index.ts';
import { ANY_SHOP, BARRACKS, BEEHIVE, BLINDED, BLOOD, COURT, DEAF, DETECT_MONSTERS, EXPL_MAX, FALSE, FULL_MOON, HAIR, HALLUC, HALLUC_RES, HEAD, INFRAVISION, MAXPCHARS, MORGUE, MS_ANIMAL, MS_GUARDIAN, MS_HUMANOID, MS_LEADER, MS_ORC, MS_SELL, M_AP_FURNITURE, M_AP_OBJECT, NECK, PM_BABY_SILVER_DRAGON, PM_DEATH, PM_DINGO, PM_GECKO, PM_HUMAN_WERERAT, PM_LONG_WORM, PM_ORACLE, PM_PRISONER, PM_RAVEN, PM_SILVER_DRAGON, PM_VAMPIRE, PM_VAMPIRE_LORD, PM_WATER_DEMON, PM_WINTER_WOLF, PM_WINTER_WOLF_CUB, PM_WOLF, P_NONE, ROOMOFFSET, SEE_INVIS, STATUE, STRANGLED, STRAT_WAITMASK, S_ANT, S_CENTAUR, S_NYMPH, TELEPAT, TOOL_CLASS, TRUE, VAULT, WARN_OF_MON, WEAPON_CLASS, ZOO } from './consts.ts';

let h_sounds: any;
let dosounds$fountain_msg: any;
let dosounds$sink_msg: any;
let dosounds$throne_msg: any;
let dosounds$swamp_msg: any;
let dosounds$barracks_msg: any;
let dosounds$zoo_msg: any;
let dosounds$shop_msg: any;
let dosounds$temple_msg: any;
let dosounds$ora_msg: any;
let domonnoise$vampmsg: any;
let domonnoise$laugh_msg: any;
let domonnoise$arrest_msg: any;
let domonnoise$soldier_foe_msg: any;
let domonnoise$soldier_pax_msg: any;

function mon_in_room(mon: struct_monst | null, rmtyp: number): number {
  let rno = $at2(G.level.locations, mon.mx, mon.my).roomno | 0;
  if (rno >= ROOMOFFSET) {
    return G.rooms[rno - ROOMOFFSET].rtype === rmtyp ? 1 : 0;
  }
  return FALSE;
}

export async function dosounds(): Promise<void> {
  let sroom = null;
  let hallu = 0;
  let vx = 0;
  let vy = 0;
  let mtmp = null;
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic || !G.flags.acoustics || G.u.uswallow | 0 || G.u.uinwater | 0) {
    return;
  }
  hallu = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? 1 : 0;
  if (G.level.flags.nfountains && !rn2(400)) {
    await You_hear(S("%s"), dosounds$fountain_msg[rn2(3) + hallu]);
  }
  if (G.level.flags.nsinks && !rn2(300)) {
    await You_hear(S("%s"), dosounds$sink_msg[rn2(2) + hallu]);
  }
  if (G.level.flags.has_court | 0 && !rn2(200)) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if ((mtmp.msleeping | 0 || (mtmp.data.mflags2 & 1024) >>> 0 !== 0 || (mtmp.data.mflags2 & 2048) >>> 0 !== 0) && !((mtmp.data.mflags1 & 262144) >>> 0 !== 0) && mon_in_room(mtmp, COURT)) {
        let which = rn2(3) + hallu;
        if (which !== 2) {
          await You_hear(S("%s"), dosounds$throne_msg[which]);
        } else {
          await pline(dosounds$throne_msg[2], G.genders[G.flags.female ? 1 : 0].his);
        }
        return;
      }
    }
  }
  if (G.level.flags.has_swamp | 0 && !rn2(200)) {
    await You(S("%s"), dosounds$swamp_msg[rn2(2) + hallu]);
    return;
  }
  if (G.level.flags.has_vault | 0 && !rn2(200)) {
    if (!(sroom = search_special(VAULT))) {
      G.level.flags.has_vault = 0;
      return;
    }
    if (gd_sound()) {
      switch (rn2(2) + hallu) {
      case 1:
        {
          let gold_in_vault = FALSE;
          for (vx = sroom.lx; vx <= sroom.hx; ++vx) {
            for (vy = sroom.ly; vy <= sroom.hy; ++vy) {
              if (g_at(vx, vy)) {
                gold_in_vault = TRUE;
              }
            }
          }
          if (vault_occupied(P(G.u.urooms)) !== $sdiff(sroom, G.rooms[0]) + ROOMOFFSET) {
            if (gold_in_vault) {
              await You_hear(!hallu ? S("someone counting money.") : S("the quarterback calling the play."));
            } else {
              await You_hear(S("someone searching."));
            }
            break;
          }
        }
      case 0:
        await You_hear(S("the footsteps of a guard on patrol."));
        break;
      case 2:
        await You_hear(S("Ebenezer Scrooge!"));
        break;
      }
    }
    return;
  }
  if (G.level.flags.has_beehive | 0 && !rn2(200)) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (mtmp.data.mlet === S_ANT && (mtmp.data.mflags1 & 1) >>> 0 !== 0 && mon_in_room(mtmp, BEEHIVE)) {
        switch (rn2(2) + hallu) {
        case 0:
          await You_hear(S("a low buzzing."));
          break;
        case 1:
          await You_hear(S("an angry drone."));
          break;
        case 2:
          await You_hear(S("bees in your %sbonnet!"), G.uarmh ? S("") : S("(nonexistent) "));
          break;
        }
        return;
      }
    }
  }
  if (G.level.flags.has_morgue | 0 && !rn2(200)) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (((mtmp.data.mflags2 & 2) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) && mon_in_room(mtmp, MORGUE)) {
        let hair = body_part(HAIR);
        switch (rn2(2) + hallu) {
        case 0:
          await You(S("suddenly realize it is unnaturally quiet."));
          break;
        case 1:
          await pline_The(S("%s on the back of your %s %s up."), hair, body_part(NECK), vtense(hair, S("stand")));
          break;
        case 2:
          await pline_The(S("%s on your %s %s to stand up."), hair, body_part(HEAD), vtense(hair, S("seem")));
          break;
        }
        return;
      }
    }
  }
  if (G.level.flags.has_barracks | 0 && !rn2(200)) {
    let count = 0;
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if ((mtmp.data.mflags2 & 512) >>> 0 !== 0 && mon_in_room(mtmp, BARRACKS) && (mtmp.msleeping | 0 || ++count > 5)) {
        await You_hear(S("%s"), dosounds$barracks_msg[rn2(3) + hallu]);
        return;
      }
    }
  }
  if (G.level.flags.has_zoo | 0 && !rn2(200)) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if ((mtmp.msleeping | 0 || (mtmp.data.mflags1 & 262144) >>> 0 !== 0) && mon_in_room(mtmp, ZOO)) {
        await You_hear(S("%s"), dosounds$zoo_msg[rn2(2) + hallu]);
        return;
      }
    }
  }
  if (G.level.flags.has_shop | 0 && !rn2(200)) {
    if (!(sroom = search_special(ANY_SHOP))) {
      G.level.flags.has_shop = 0;
      return;
    }
    if (tended_shop(sroom) && !strchr(P(G.u.ushops), $sdiff(sroom, G.rooms[0]) + 3 | 0)) {
      await You_hear(S("%s"), dosounds$shop_msg[rn2(2) + hallu]);
    }
    return;
  }
  if (G.level.flags.has_temple | 0 && !rn2(200) && !((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level))) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (mtmp.ispriest | 0 && inhistemple(mtmp) && mtmp.mcanmove | 0 && !mtmp.msleeping && temple_occupied(P(G.u.urooms)) !== mtmp.mextra.epri.shroom) {
        break;
      }
    }
    if (mtmp) {
      let msg = null;
      let trycount = 0;
      let ax = mtmp.mextra.epri.shrpos.x;
      let ay = mtmp.mextra.epri.shrpos.y;
      let speechless = (mtmp.data.msound <= MS_ANIMAL ? 1 : 0) << 24 >> 24;
      let in_sight = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || $rd(G.viz_array.a[G.viz_array.o + ay], ax) & 2 ? 1 : 0) << 24 >> 24;
      do {
        msg = dosounds$temple_msg[rn2((Math.trunc(32 / 8) | 0) - 1 + hallu)];
        if (strchr(msg, 42) && speechless) {
          continue;
        }
        if (strchr(msg, 35) && in_sight) {
          continue;
        }
        break;
      } while (++trycount < 50);
      while (!letter(msg.a[msg.o])) {
        msg = msg.add(1);
      }
      if (strchr(msg, 37)) {
        await You_hear(msg, await halu_gname(mtmp.mextra.epri.shralign));
      } else {
        await You_hear(S("%s"), msg);
      }
      return;
    }
  }
  if ((G.dungeon_topology.d_oracle_level.dlevel || G.dungeon_topology.d_oracle_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_oracle_level) && !rn2(400)) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (mtmp.data === $sat(G.mons, PM_ORACLE)) {
        break;
      }
    }
    if (mtmp && (hallu || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)))) {
      await You_hear(S("%s"), dosounds$ora_msg[rn2(3) + hallu * 2]);
    }
    return;
  }
}

export function growl_sound(mtmp: struct_monst | null): Ptr | null {
  let ret = null;
  switch (mtmp.data.msound) {
  case 2:
  case 7:
    ret = S("hiss");
    break;
  case 1:
  case 4:
    ret = S("growl");
    break;
  case 3:
    ret = S("roar");
    break;
  case 8:
    ret = S("buzz");
    break;
  case 5:
    ret = S("squeal");
    break;
  case 6:
    ret = S("screech");
    break;
  case 10:
    ret = S("neigh");
    break;
  case 11:
    ret = S("wail");
    break;
  case 0:
    ret = S("commotion");
    break;
  default:
    ret = S("scream");
  }
  return ret;
}

export async function growl(mtmp: struct_monst | null): Promise<void> {
  let growl_verb = null;
  if (mtmp.msleeping | 0 || !mtmp.mcanmove || !mtmp.data.msound) {
    return;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    growl_verb = h_sounds[rn2(Math.trunc(288 / 8) | 0)];
  } else {
    growl_verb = growl_sound(mtmp);
  }
  if (growl_verb) {
    await pline(S("%s %s!"), await Monnam(mtmp), vtense(null, growl_verb));
    if (G.context.run) {
      nomul(0);
    }
    wake_nearto(mtmp.mx, mtmp.my, mtmp.data.mlevel * 18);
  }
}

export async function yelp(mtmp: struct_monst | null): Promise<void> {
  let yelp_verb = null;
  if (mtmp.msleeping | 0 || !mtmp.mcanmove || !mtmp.data.msound) {
    return;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    yelp_verb = h_sounds[rn2(Math.trunc(288 / 8) | 0)];
  } else {
    switch (mtmp.data.msound) {
    case 2:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("yowl") : S("arch");
      break;
    case 1:
    case 4:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("yelp") : S("recoil");
      break;
    case 3:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("snarl") : S("bluff");
      break;
    case 5:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("squeal") : S("quiver");
      break;
    case 6:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("screak") : S("thrash");
      break;
    case 11:
      yelp_verb = !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("wail") : S("cringe");
      break;
    }
  }
  if (yelp_verb) {
    await pline(S("%s %s!"), await Monnam(mtmp), vtense(null, yelp_verb));
    if (G.context.run) {
      nomul(0);
    }
    wake_nearto(mtmp.mx, mtmp.my, mtmp.data.mlevel * 12);
  }
}

export async function whimper(mtmp: struct_monst | null): Promise<void> {
  let whimper_verb = null;
  if (mtmp.msleeping | 0 || !mtmp.mcanmove || !mtmp.data.msound) {
    return;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    whimper_verb = h_sounds[rn2(Math.trunc(288 / 8) | 0)];
  } else {
    switch (mtmp.data.msound) {
    case 2:
    case 4:
      whimper_verb = S("whimper");
      break;
    case 1:
      whimper_verb = S("whine");
      break;
    case 5:
      whimper_verb = S("squeal");
      break;
    }
  }
  if (whimper_verb) {
    await pline(S("%s %s."), await Monnam(mtmp), vtense(null, whimper_verb));
    if (G.context.run) {
      nomul(0);
    }
    wake_nearto(mtmp.mx, mtmp.my, mtmp.data.mlevel * 6);
  }
}

export async function beg(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.msleeping | 0 || !mtmp.mcanmove || !((mtmp.data.mflags1 & 536870912) >>> 0 !== 0 || (mtmp.data.mflags1 & 1073741824) >>> 0 !== 0)) {
    return;
  }
  if (!(mtmp.data.msound === 0) && mtmp.data.msound <= MS_ANIMAL) {
    await domonnoise(mtmp);
  } else if (mtmp.data.msound >= MS_HUMANOID) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(mtmp.mx, mtmp.my);
    }
    await verbalize(S("I'm hungry."));
  }
}

function mon_is_gecko(mon: struct_monst | null): number {
  let glyph = 0;
  if (mon.data === $sat(G.mons, PM_GECKO)) {
    return TRUE;
  }
  if (mon.data === $sat(G.mons, PM_LONG_WORM)) {
    return FALSE;
  }
  glyph = glyph_at(mon.mx, mon.my);
  return ((glyph >= 0 && glyph < 0 + 382 ? glyph - 0 : glyph >= 382 + 0 && glyph < 382 + 0 + 382 ? glyph - (382 + 0) : glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382 ? glyph - (1 + (382 + (382 + 0))) : glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 ? glyph - (382 + (382 + (1 + (382 + (382 + 0))))) : glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 ? glyph - (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : 382 + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))))) === PM_GECKO ? 1 : 0) << 24 >> 24;
}

async function domonnoise(mtmp: struct_monst | null): Promise<number> {
  let verbuf = new Int8Array(256);
  let pline_msg = null;
  let verbl_msg = null;
  let verbl_msg_mcan = null;
  let ptr = mtmp.data;
  let msound = ptr.msound;
  let gnomeplan = 0;
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    return 0;
  }
  if (ptr.msound === 0) {
    return 0;
  }
  if (mtmp.m_id === G.quest_status.leader_m_id && msound > MS_ANIMAL) {
    msound = MS_LEADER;
  } else if (msound === MS_GUARDIAN && ptr !== $sat(G.mons, G.urole.guardnum)) {
    msound = G.mons[genus(await monsndx(ptr), 1)].msound;
  } else if (msound === MS_ORC && (await same_race(ptr, G.youmonst.data) || await same_race(ptr, $sat(G.mons, G.urace.malenum)) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    msound = MS_HUMANOID;
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && mon_is_gecko(mtmp)) {
    msound = MS_SELL;
  }
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    await map_invisible(mtmp.mx, mtmp.my);
  }
  switch (msound) {
  case 35:
    return await doconsult(mtmp);
  case 36:
    await priest_talk(mtmp);
    break;
  case 31:
  case 32:
  case 33:
    await quest_chat(mtmp);
    break;
  case 34:
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) || mtmp.isshk | 0 && !rn2(2)) {
      await shk_chat(mtmp);
    } else {
      sprintf(P(verbuf), S("15 minutes could save you 15 %s."), await currency(15));
      verbl_msg = P(verbuf);
    }
    break;
  case 27:
    {
      let isnight = night() << 24 >> 24;
      let kindred = (G.u.umonnum !== G.u.umonster && (G.u.umonnum === PM_VAMPIRE || G.u.umonnum === PM_VAMPIRE_LORD) ? 1 : 0) << 24 >> 24;
      let nightchild = (G.u.umonnum !== G.u.umonster && (G.u.umonnum === PM_WOLF || G.u.umonnum === PM_WINTER_WOLF || G.u.umonnum === PM_WINTER_WOLF_CUB) ? 1 : 0) << 24 >> 24;
      let racenoun = G.flags.female && G.urace.individual.f ? G.urace.individual.f : G.urace.individual.m ? G.urace.individual.m : G.urace.noun;
      if (mtmp.mtame) {
        if (kindred) {
          sprintf(P(verbuf), S("Good %s to you Master%s"), isnight ? S("evening") : S("day"), isnight ? S("!") : S(".  Why do we not rest?"));
          verbl_msg = P(verbuf);
        } else {
          sprintf(P(verbuf), S("%s%s"), nightchild ? S("Child of the night, ") : S(""), midnight() ? S("I can stand this craving no longer!") : isnight ? S("I beg you, help me satisfy this growing craving!") : S("I find myself growing a little weary."));
          verbl_msg = P(verbuf);
        }
      } else if (mtmp.mpeaceful) {
        if (kindred && isnight) {
          sprintf(P(verbuf), S("Good feeding %s!"), G.flags.female ? S("sister") : S("brother"));
          verbl_msg = P(verbuf);
        } else if (nightchild && isnight) {
          sprintf(P(verbuf), S("How nice to hear you, child of the night!"));
          verbl_msg = P(verbuf);
        } else {
          verbl_msg = S("I only drink... potions.");
        }
      } else {
        let vampindex = 0;
        if (kindred) {
          verbl_msg = S("This is my hunting ground that you dare to prowl!");
        } else if (G.youmonst.data === $sat(G.mons, PM_SILVER_DRAGON) || G.youmonst.data === $sat(G.mons, PM_BABY_SILVER_DRAGON)) {
          sprintf(P(verbuf), S("%s!  Your silver sheen does not frighten me!"), G.youmonst.data === $sat(G.mons, PM_SILVER_DRAGON) ? S("Fool") : S("Young Fool"));
          verbl_msg = P(verbuf);
        } else {
          vampindex = rn2(Math.trunc(16 / 8) | 0);
          if (vampindex === 0) {
            sprintf(P(verbuf), domonnoise$vampmsg[vampindex], body_part(BLOOD));
            verbl_msg = P(verbuf);
          } else if (vampindex === 1) {
            sprintf(P(verbuf), domonnoise$vampmsg[vampindex], G.u.umonnum !== G.u.umonster ? await an(G.mons[G.u.umonnum].mname) : await an(racenoun));
            verbl_msg = P(verbuf);
          } else {
            verbl_msg = domonnoise$vampmsg[vampindex];
          }
        }
      }
    }
    break;
  case 38:
    if (G.flags.moonphase === FULL_MOON && night() ^ (!rn2(13) ? 1 : 0)) {
      await pline(S("%s throws back %s head and lets out a blood curdling %s!"), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his, ptr === $sat(G.mons, PM_HUMAN_WERERAT) ? S("shriek") : S("howl"));
      wake_nearto(mtmp.mx, mtmp.my, 11 * 11);
    } else {
      pline_msg = S("whispers inaudibly.  All you can make out is \"moon\".");
    }
    break;
  case 1:
    if (G.flags.moonphase === FULL_MOON && night()) {
      pline_msg = S("howls.");
    } else if (mtmp.mpeaceful) {
      if (mtmp.mtame && (mtmp.mconf | 0 || mtmp.mflee | 0 || mtmp.mtrapped | 0 || G.moves > mtmp.mextra.edog.hungrytime || mtmp.mtame < 5)) {
        pline_msg = S("whines.");
      } else if (mtmp.mtame && mtmp.mextra.edog.hungrytime > G.moves + 1000) {
        pline_msg = S("yips.");
      } else {
        if (mtmp.data !== $sat(G.mons, PM_DINGO)) {
          pline_msg = S("barks.");
        }
      }
    } else {
      pline_msg = S("growls.");
    }
    break;
  case 2:
    if (mtmp.mtame) {
      if (mtmp.mconf | 0 || mtmp.mflee | 0 || mtmp.mtrapped | 0 || mtmp.mtame < 5) {
        pline_msg = S("yowls.");
      } else if (G.moves > mtmp.mextra.edog.hungrytime) {
        pline_msg = S("meows.");
      } else if (mtmp.mextra.edog.hungrytime > G.moves + 1000) {
        pline_msg = S("purrs.");
      } else {
        pline_msg = S("mews.");
      }
      break;
    }
  case 4:
    pline_msg = mtmp.mpeaceful | 0 ? S("snarls.") : S("growls!");
    break;
  case 3:
    pline_msg = mtmp.mpeaceful | 0 ? S("snarls.") : S("roars!");
    break;
  case 5:
    pline_msg = S("squeaks.");
    break;
  case 6:
    if (ptr === $sat(G.mons, PM_RAVEN) && !mtmp.mpeaceful) {
      verbl_msg = S("Nevermore!");
    } else {
      pline_msg = S("squawks.");
    }
    break;
  case 7:
    if (!mtmp.mpeaceful) {
      pline_msg = S("hisses!");
    } else {
      return 0;
    }
    break;
  case 8:
    pline_msg = mtmp.mpeaceful | 0 ? S("drones.") : S("buzzes angrily.");
    break;
  case 9:
    pline_msg = S("grunts.");
    break;
  case 10:
    if (mtmp.mtame < 5) {
      pline_msg = S("neighs.");
    } else if (G.moves > mtmp.mextra.edog.hungrytime) {
      pline_msg = S("whinnies.");
    } else {
      pline_msg = S("whickers.");
    }
    break;
  case 11:
    pline_msg = S("wails mournfully.");
    break;
  case 12:
    pline_msg = S("gurgles.");
    break;
  case 13:
    pline_msg = S("burbles.");
    break;
  case 15:
    pline_msg = S("shrieks.");
    await aggravate();
    break;
  case 19:
    pline_msg = S("imitates you.");
    break;
  case 16:
    await pline(S("%s rattles noisily."), await Monnam(mtmp));
    await You(S("freeze for a moment."));
    nomul(-2);
    G.multi_reason = S("scared by rattling");
    G.nomovemsg = null;
    break;
  case 17:
    {
      pline_msg = domonnoise$laugh_msg[rn2(4)];
    }
    break;
  case 18:
    pline_msg = S("mumbles incomprehensibly.");
    break;
  case 24:
    if (mtmp.mtame) {
      verbl_msg = S("Sorry, I'm all out of wishes.");
    } else if (mtmp.mpeaceful) {
      if (ptr === $sat(G.mons, PM_WATER_DEMON)) {
        pline_msg = S("gurgles.");
      } else {
        verbl_msg = S("I'm free!");
      }
    } else {
      if (ptr !== $sat(G.mons, PM_PRISONER)) {
        verbl_msg = S("This will teach you not to disturb me!");
      }
    }
    break;
  case 39:
    if (!mtmp.mpeaceful) {
      switch (rn2(4)) {
      case 0:
        await pline(S("%s boasts about %s gem collection."), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
        break;
      case 1:
        pline_msg = S("complains about a diet of mutton.");
        break;
      default:
        pline_msg = S("shouts \"Fee Fie Foe Foo!\" and guffaws.");
        wake_nearto(mtmp.mx, mtmp.my, 7 * 7);
        break;
      }
      break;
    }
  case 20:
    if (!mtmp.mpeaceful) {
      if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && ($sidx(ptr) >= $sidx($sat(G.mons, 328)) && $sidx(ptr) <= $sidx($sat(G.mons, 342)))) {
        await mplayer_talk(mtmp);
      } else {
        pline_msg = S("threatens you.");
      }
      break;
    }
    if (mtmp.mflee) {
      pline_msg = S("wants nothing to do with you.");
    } else if (mtmp.mhp < (mtmp.mhpmax / 4 | 0)) {
      pline_msg = S("moans.");
    } else if (mtmp.mconf | 0 || mtmp.mstun | 0) {
      verbl_msg = !rn2(3) ? S("Huh?") : rn2(2) ? S("What?") : S("Eh?");
    } else if (!mtmp.mcansee) {
      verbl_msg = S("I can't see!");
    } else if (mtmp.mtrapped) {
      let t = t_at(mtmp.mx, mtmp.my);
      if (t) {
        t.tseen = 1;
      }
      verbl_msg = S("I'm trapped!");
    } else if (mtmp.mhp < (mtmp.mhpmax / 2 | 0)) {
      pline_msg = S("asks for a potion of healing.");
    } else if (mtmp.mtame && !mtmp.isminion && G.moves > mtmp.mextra.edog.hungrytime) {
      verbl_msg = S("I'm hungry.");
    } else if ((ptr.mflags2 & 16) >>> 0 !== 0) {
      pline_msg = S("curses orcs.");
    } else if ((ptr.mflags2 & 32) >>> 0 !== 0) {
      pline_msg = S("talks about mining.");
    } else if ((ptr.mflags2 & 2147483648) >>> 0 !== 0) {
      pline_msg = S("talks about spellcraft.");
    } else if (ptr.mlet === S_CENTAUR) {
      pline_msg = S("discusses hunting.");
    } else if ((ptr.mflags2 & 64) >>> 0 !== 0 && (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && (gnomeplan = rn2(4)) % 2) {
      verbl_msg = gnomeplan === 1 ? S("Phase one, collect underpants.") : S("Phase three, profit!");
    } else {
      switch (await monsndx(ptr)) {
      case 42:
        pline_msg = mtmp.mhpmax - mtmp.mhp >= 10 ? S("complains about unpleasant dungeon conditions.") : S("asks you about the One Ring.");
        break;
      case 328:
        pline_msg = S("describes a recent article in \"Spelunker Today\" magazine.");
        break;
      case 340:
        verbl_msg = S("Aloha.");
        break;
      default:
        pline_msg = S("discusses dungeon exploration.");
        break;
      }
    }
    break;
  case 26:
    {
      let swval = 0;
      if (G.sysopt.seduce) {
        if (ptr.mlet !== S_NYMPH && could_seduce(mtmp, G.youmonst, null) === 1) {
          await doseduce(mtmp);
          break;
        }
        swval = poly_gender() !== (mtmp.female | 0) ? rn2(3) : 0;
      } else {
        swval = poly_gender() === 0 ? rn2(3) : 0;
      }
      switch (swval) {
      case 2:
        verbl_msg = S("Hello, sailor.");
        break;
      case 1:
        pline_msg = S("comes on to you.");
        break;
      default:
        pline_msg = S("cajoles you.");
      }
    }
    break;
  case 21:
    if (mtmp.mpeaceful) {
      await verbalize(S("Just the facts, %s."), G.flags.female ? S("Ma'am") : S("Sir"));
    } else {
      verbl_msg = domonnoise$arrest_msg[rn2(3)];
    }
    break;
  case 28:
    if (mtmp.mpeaceful | 0 && !mtmp.mtame) {
      await demon_talk(mtmp);
      break;
    }
  case 29:
    if (!mtmp.mpeaceful) {
      await cuss(mtmp);
    } else if ((mtmp.data.mflags2 & 4096) >>> 0 !== 0 && mon_aligntyp(mtmp) === 1) {
      verbl_msg = S("It's not too late.");
    } else {
      verbl_msg = S("We're all doomed.");
    }
    break;
  case 37:
    pline_msg = S("seems to mutter a cantrip.");
    break;
  case 25:
    verbl_msg_mcan = S("I hate this job!");
    if (G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
      verbl_msg = S("Put that weapon away before you hurt someone!");
    } else if (G.uarmc || G.uarm || G.uarmh || G.uarms || G.uarmg || G.uarmf) {
      verbl_msg = G.urole.malenum === 332 ? S("Doc, I can't help you unless you cooperate.") : S("Please undress so I can examine you.");
    } else if (G.uarmu) {
      verbl_msg = S("Take off your shirt, please.");
    } else {
      verbl_msg = S("Relax, this won't hurt a bit.");
    }
    break;
  case 23:
    if (money_cnt(G.invent)) {
      verbl_msg = S("Please drop that gold and follow me.");
    } else {
      verbl_msg = S("Please follow me.");
    }
    break;
  case 22:
    {
      verbl_msg = mtmp.mpeaceful | 0 ? domonnoise$soldier_pax_msg[rn2(3)] : domonnoise$soldier_foe_msg[rn2(3)];
      break;
    }
  case 30:
    {
      let tribtitle = null;
      let book = null;
      let ms_Death = (ptr === $sat(G.mons, PM_DEATH) ? 1 : 0) << 24 >> 24;
      if (ms_Death && !G.context.tribute.Deathnotice && !!(book = u_have_novel())) {
        if (!!(tribtitle = noveltitle(P(book, "corpsenm")))) {
          sprintf(P(verbuf), S("Ah, so you have a copy of /%s/."), tribtitle);
          if (strncmpi(tribtitle, S("Snuff"), -1) && strncmpi(tribtitle, S("The Wee Free Men"), -1)) {
            strcat(P(verbuf), S("  I may have been misquoted there."));
          }
          verbl_msg = P(verbuf);
        }
        G.context.tribute.Deathnotice = 1;
      } else if (ms_Death && rn2(3) && await Death_quote(P(verbuf), 256)) {
        verbl_msg = P(verbuf);
      } else if (ms_Death && !rn2(10)) {
        pline_msg = S("is busy reading a copy of Sandman #8.");
      } else {
        verbl_msg = S("Who do you think you are, War?");
      }
      break;
    }
  }
  if (pline_msg) {
    await pline(S("%s %s"), await Monnam(mtmp), pline_msg);
  } else if (mtmp.mcan | 0 && verbl_msg_mcan) {
    await verbalize(S("%s"), verbl_msg_mcan);
  } else if (verbl_msg) {
    if (ptr === $sat(G.mons, PM_DEATH)) {
      let tmpbuf = new Int8Array(256);
      await pline(S("%s"), ucase(strcpy(P(tmpbuf), verbl_msg)));
    } else {
      await verbalize(S("%s"), verbl_msg);
    }
  }
  return 1;
}

export async function dotalk(): Promise<number> {
  let result = 0;
  result = await dochat();
  return result;
}

async function dochat(): Promise<number> {
  let mtmp = null;
  let tx = 0;
  let ty = 0;
  let otmp = null;
  if (G.youmonst.data.msound === 0) {
    await pline(S("As %s, you cannot speak."), await an(G.youmonst.data.mname));
    return 0;
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    await You_cant(S("speak.  You're choking!"));
    return 0;
  }
  if (G.u.uswallow) {
    await pline(S("They won't hear you out there."));
    return 0;
  }
  if (G.u.uinwater) {
    await Your(S("speech is unintelligible underwater."));
    return 0;
  }
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    await pline(S("How can you hold a conversation when you cannot hear?"));
    return 0;
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !!(otmp = await shop_object(G.u.ux, G.u.uy))) {
    await price_quote(otmp);
    return 1;
  }
  if (!await getdir(S("Talk to whom? (in what direction)"))) {
    return 0;
  }
  if (G.u.usteed && G.u.dz > 0) {
    if (!G.u.usteed.mcanmove || G.u.usteed.msleeping | 0) {
      await pline(S("%s seems not to notice you."), await Monnam(G.u.usteed));
      return 1;
    } else {
      return await domonnoise(G.u.usteed);
    }
  }
  if (G.u.dz) {
    await pline(S("They won't hear you %s there."), G.u.dz < 0 ? S("up") : S("down"));
    return 0;
  }
  if (G.u.dx === 0 && G.u.dy === 0) {
    await pline(S("Talking to yourself is a bad habit for a dungeoneer."));
    return 0;
  }
  tx = G.u.ux + G.u.dx;
  ty = G.u.uy + G.u.dy;
  if (!isok(tx, ty)) {
    return 0;
  }
  mtmp = !!G.level.monsters[tx][ty] ? G.level.monsters[tx][ty] : null;
  if ((!mtmp || mtmp.mundetected | 0) && !!(otmp = G.level.objects[tx][ty]) && otmp.otyp === STATUE) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline_The(S("%s seems not to notice you."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("statue"));
    }
    return 0;
  }
  if (!mtmp || mtmp.mundetected | 0 || (mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT) {
    return 0;
  }
  if ((!mtmp.mcanmove || mtmp.msleeping | 0) && !mtmp.ispriest) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      await pline(S("%s seems not to notice you."), await Monnam(mtmp));
    }
    return 0;
  }
  mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
  if (mtmp.mtame && mtmp.meating) {
    if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(mtmp.mx, mtmp.my);
    }
    await pline(S("%s is eating noisily."), await Monnam(mtmp));
    return 0;
  }
  return await domonnoise(mtmp);
}

export function $init(): void {
  h_sounds = [S("beep"),
S("boing"),
S("sing"),
S("belche"),
S("creak"),
S("cough"),
S("rattle"),
S("ululate"),
S("pop"),
S("jingle"),
S("sniffle"),
S("tinkle"),
S("eep"),
S("clatter"),
S("hum"),
S("sizzle"),
S("twitter"),
S("wheeze"),
S("rustle"),
S("honk"),
S("lisp"),
S("yodel"),
S("coo"),
S("burp"),
S("moo"),
S("boom"),
S("murmur"),
S("oink"),
S("quack"),
S("rumble"),
S("twang"),
S("bellow"),
S("toot"),
S("gargle"),
S("hoot"),
S("warble")];
  dosounds$fountain_msg = [S("bubbling water."),
S("water falling on coins."),
S("the splashing of a naiad."),
S("a soda fountain!")];
  dosounds$sink_msg = [S("a slow drip."), S("a gurgling noise."), S("dishes being washed!")];
  dosounds$throne_msg = [S("the tones of courtly conversation."),
S("a sceptre pounded in judgment."),
S("Someone shouts \"Off with %s head!\""),
S("Queen Beruthiel's cats!")];
  dosounds$swamp_msg = [S("hear mosquitoes!"), S("smell marsh gas!"), S("hear Donald Duck!")];
  dosounds$barracks_msg = [S("blades being honed."),
S("loud snoring."),
S("dice being thrown."),
S("General MacArthur!")];
  dosounds$zoo_msg = [S("a sound reminiscent of an elephant stepping on a peanut."), S("a sound reminiscent of a seal barking."), S("Doctor Dolittle!")];
  dosounds$shop_msg = [S("someone cursing shoplifters."), S("the chime of a cash register."), S("Neiman and Marcus arguing!")];
  dosounds$temple_msg = [S("*someone praising %s."),
S("*someone beseeching %s."),
S("#an animal carcass being offered in sacrifice."),
S("*a strident plea for donations.")];
  dosounds$ora_msg = [S("a strange wind."),
S("convulsive ravings."),
S("snoring snakes."),
S("someone say \"No more woodchucks!\""),
S("a loud ZOT!")];
  domonnoise$vampmsg = [S("I vant to suck your %s!"), S("I vill come after %s without regret!")];
  domonnoise$laugh_msg = [S("giggles."),
S("chuckles."),
S("snickers."),
S("laughs.")];
  domonnoise$arrest_msg = [S("Anything you say can be used against you."), S("You're under arrest!"), S("Stop in the name of the Law!")];
  domonnoise$soldier_foe_msg = [S("Resistance is useless!"), S("You're dog meat!"), S("Surrender!")];
  domonnoise$soldier_pax_msg = [S("What lousy pay we're getting here!"), S("The food's not fit for Orcs!"), S("My feet hurt, I've been on them all day!")];
}
