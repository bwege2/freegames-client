// @ts-nocheck
// NetHack 3.6.7 mhitm.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_lit } from './apply.ts';
import { artifact_hit } from './artifact.ts';
import { flush_screen, map_invisible, newsym, shieldeff } from './display.ts';
import { Monnam, a_monnam, hliquid, mon_nam, mon_nam_too, noname_monnam, x_monnam } from './do_name.ts';
import { dog_nutrition, finish_meating } from './dogmove.ts';
import { eat_brains, is_fainted } from './eat.ts';
import { dist2, distmin, night, s_suffix, strNsubst, strsubst } from './hacklib.ts';
import { clone_mon, grow_up } from './makemon.ts';
import { could_seduce, getmattk, magic_negation, mpoisons_subj } from './mhitu.ts';
import { add_to_minv, dealloc_obj, mksobj, obj_extract_self, set_corpsenm } from './mkobj.ts';
import { corpse_chance, golemeffects, minliquid, mlifesaver, mon_to_stone, mondead, mondied, monkilled, monnear, monstone, newcham, seemimic, unstuck } from './mon.ts';
import { attacktype, can_blnd, dmgtype, mon_hates_silver, monsndx, on_fire, poly_when_stoned, pronoun_gender, resists_drli, stagger, sticks } from './mondata.ts';
import { closed_door, itsstuck } from './monmove.ts';
import { breamm, m_useup, spitmm, thrwmm } from './mthrowu.ts';
import { mon_reflects, munslime, munstone } from './muse.ts';
import { doname, makeplural, simpleonames, xname } from './objnam.ts';
import { You, You_hear, Your, pline, pline_The, verbalize } from './pline.ts';
import { split_mon } from './potion.ts';
import { d, rn2, rnd } from './rnd.ts';
import { findgold } from './steal.ts';
import { dismount_steed, place_monster } from './steed.ts';
import { rloc, tele_restrict } from './teleport.ts';
import { acid_damage, erode_obj, mintrap, mselftouch, t_at, unconscious } from './trap.ts';
import { erode_armor, shade_miss } from './uhitm.ts';
import { dmgval, hitval, mon_wield_item, mwepgone, possibly_unwield } from './weapon.ts';
import { were_change } from './were.ts';
import { worm_known } from './worm.ts';
import { find_mac, mon_adjust_speed, update_mon_intrinsics, which_armor } from './worn.ts';
import { destroy_mitem, drain_item, resist } from './zap.ts';
import { struct_attack, struct_monst, struct_obj } from './structs.ts';
import { $cs, $rd, $sat, $wr, G, P, S, sprintf, strcat, strcpy } from './rt/index.ts';
import { AD_COLD, AD_CORR, AD_DGST, AD_ELEC, AD_FIRE, AD_RUST, AD_STON, ARTICLE_NONE, ARTICLE_THE, AT_BREA, AT_CLAW, AT_ENGL, AT_EXPL, AT_KICK, AT_MAGC, AT_NONE, AT_WEAP, BLINDED, CONFLICT, CORPSE, DEAF, DETECT_MONSTERS, DISMOUNT_POLY, EF_GREASE, EF_VERBOSE, ERODE_BURN, ERODE_CORRODE, ERODE_RUST, FALSE, GAUNTLETS_OF_POWER, G_NOCORPSE, G_UNIQ, INFRAVISION, IRON, IRONBARS, I_SPECIAL, LOW_PM, METAL, MM_AGR_DIED, MM_DEF_DIED, MM_HIT, MM_MISS, MSLOW, MZ_HUGE, M_AP_MONSTER, M_AP_NOTHING, NATTK, NEED_HTH_WEAPON, NEED_WEAPON, NORMAL_SPEED, NOTELL, PASSES_WALLS, PIERCE, PM_BLACK_PUDDING, PM_BROWN_PUDDING, PM_CLAY_GOLEM, PM_FAMINE, PM_FLOATING_EYE, PM_GREEN_SLIME, PM_GREMLIN, PM_GRID_BUG, PM_IRON_GOLEM, PM_LEATHER_GOLEM, PM_MEDUSA, PM_NURSE, PM_PESTILENCE, PM_PURPLE_WORM, PM_SHADE, PM_SHRIEKER, PM_STEAM_VORTEX, PM_WOOD_GOLEM, PM_WRAITH, POOL, POTION_CLASS, RING_CLASS, SCROLL_CLASS, SEE_INVIS, SILVER, SPBOOK_CLASS, STONE, STRAT_WAITFORU, STRAT_WAITMASK, S_GHOST, S_HUMAN, S_MIMIC, S_NYMPH, S_VORTEX, TELEPAT, TREE, TRUE, WAND_CLASS, WARN_OF_MON, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_SADDLE, W_WEP } from './consts.ts';

let vis: number;
let far_noise: number;
let noisetime: number;
let otmp: struct_obj | null;
let brief_feeling: any;
let dieroll: number;

async function noises(magr: struct_monst | null, mattk: struct_attack | null): Promise<void> {
  let farq = (dist2(magr.mx, magr.my, G.u.ux, G.u.uy) > 15 ? 1 : 0) << 24 >> 24;
  if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && (farq !== far_noise || G.moves - noisetime > 10)) {
    far_noise = farq;
    noisetime = G.moves;
    await You_hear(S("%s%s."), mattk.aatyp === AT_EXPL ? S("an explosion") : S("some noises"), farq ? S(" in the distance") : S(""));
  }
}

async function missmm(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<void> {
  let fmt = null;
  let buf = new Int8Array(256);
  let showit = FALSE;
  if (mdef.m_ap_type & 7) {
    await seemimic(mdef);
    showit = (showit | vis) << 24 >> 24;
  } else if (mdef.mundetected) {
    mdef.mundetected = 0;
    showit = (showit | vis) << 24 >> 24;
  }
  if (magr.m_ap_type & 7) {
    await seemimic(magr);
    showit = (showit | vis) << 24 >> 24;
  } else if (magr.mundetected) {
    magr.mundetected = 0;
    showit = (showit | vis) << 24 >> 24;
  }
  if (vis) {
    if (!((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
      await map_invisible(magr.mx, magr.my);
    } else if (showit) {
      await newsym(magr.mx, magr.my);
    }
    if (!((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await map_invisible(mdef.mx, mdef.my);
    } else if (showit) {
      await newsym(mdef.mx, mdef.my);
    }
    fmt = could_seduce(magr, mdef, mattk) && !magr.mcan ? S("%s pretends to be friendly to") : S("%s misses");
    sprintf(P(buf), fmt, await Monnam(magr));
    await pline(S("%s %s."), P(buf), await mon_nam_too(mdef, magr));
  } else {
    await noises(magr, mattk);
  }
}

export async function fightm(mtmp: struct_monst | null): Promise<number> {
  let mon = null;
  let nmon = null;
  let result = 0;
  let has_u_swallowed = 0;
  if (await resist(mtmp, RING_CLASS, 0, 0)) {
    return 0;
  }
  if (G.u.ustuck === mtmp) {
    if (await itsstuck(mtmp)) {
      return 0;
    }
  }
  has_u_swallowed = G.u.uswallow | 0 && mtmp === G.u.ustuck ? 1 : 0;
  for (mon = G.level.monlist; mon; mon = nmon) {
    nmon = mon.nmon;
    if (nmon === mtmp) {
      nmon = mtmp.nmon;
    }
    if (mon !== mtmp && !(mon.mhp < 1)) {
      if (monnear(mtmp, mon.mx, mon.my)) {
        if (!G.u.uswallow && mtmp === G.u.ustuck) {
          if (!rn2(4)) {
            await pline(S("%s releases you!"), await Monnam(mtmp));
            G.u.ustuck = null;
          } else {
            break;
          }
        }
        G.bhitpos.x = mon.mx;
        G.bhitpos.y = mon.my;
        G.notonhead = 0;
        result = await mattackm(mtmp, mon);
        if (result & MM_AGR_DIED) {
          return 1;
        }
        if (has_u_swallowed) {
          return 0;
        }
        if (result & MM_HIT && !(result & MM_DEF_DIED) && rn2(4) && mon.movement >= NORMAL_SPEED) {
          mon.movement = mon.movement - NORMAL_SPEED << 16 >> 16;
          G.notonhead = 0;
          await mattackm(mon, mtmp);
        }
        return result & MM_HIT ? 1 : 0;
      }
    }
  }
  return 0;
}

export async function mdisplacem(magr: struct_monst | null, mdef: struct_monst | null, quietly: number): Promise<number> {
  let pa = null;
  let pd = null;
  let tx = 0;
  let ty = 0;
  let fx = 0;
  let fy = 0;
  if (!magr || !mdef || magr === mdef) {
    return MM_MISS;
  }
  pa = magr.data, pd = mdef.data;
  tx = mdef.mx, ty = mdef.my;
  fx = magr.mx, fy = magr.my;
  if ((!!G.level.monsters[fx][fy] ? G.level.monsters[fx][fy] : null) !== magr || (!!G.level.monsters[tx][ty] ? G.level.monsters[tx][ty] : null) !== mdef) {
    return MM_MISS;
  }
  if (!rn2(7)) {
    return MM_MISS;
  }
  if (pa === $sat(G.mons, PM_GRID_BUG) && magr.mx !== mdef.mx && magr.my !== mdef.my) {
    return MM_MISS;
  }
  if (mdef.mundetected) {
    mdef.mundetected = 0;
  }
  if (mdef.m_ap_type & 7 && (mdef.m_ap_type & 7) !== M_AP_MONSTER) {
    await seemimic(mdef);
  }
  mdef.msleeping = 0;
  mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
  await finish_meating(mdef);
  vis = (((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data))) && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) ? 1 : 0) << 24 >> 24;
  if ((pd === $sat(G.mons, 10) || pd === $sat(G.mons, 9)) && !(((magr.data.mresists | magr.mextrinsics) & 128) !== 0)) {
    if (!!await which_armor(magr, W_ARMG)) {
      if (poly_when_stoned(pa)) {
        await mon_to_stone(magr);
        return MM_HIT;
      }
      if (!quietly && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
        await pline(S("%s turns to stone!"), await Monnam(magr));
      }
      await monstone(magr);
      if (!(magr.mhp < 1)) {
        return MM_HIT;
      } else if (magr.mtame && !vis) {
        await You(P(brief_feeling), S("peculiarly sad"));
      }
      return MM_AGR_DIED;
    }
  }
  G.level.monsters[fx][fy] = null;
  G.level.monsters[tx][ty] = null;
  await place_monster(magr, tx, ty);
  await place_monster(mdef, fx, fy);
  if (vis && !quietly) {
    await pline(S("%s moves %s out of %s way!"), await Monnam(magr), await mon_nam(mdef), pa === $sat(G.mons, 308) || pa === $sat(G.mons, 310) || pa === $sat(G.mons, 309) ? S("the") : G.genders[pronoun_gender(magr, 0)].his);
  }
  await newsym(fx, fy);
  await newsym(tx, ty);
  await flush_screen(0);
  return MM_HIT;
}

export async function mattackm(magr: struct_monst | null, mdef: struct_monst | null): Promise<number> {
  let i = 0;
  let tmp = 0;
  let strike = 0;
  let attk = 0;
  let struck = 0;
  let res = new Int32Array(6);
  let mattk = null;
  let alt_attk = new struct_attack();
  let pa = null;
  let pd = null;
  if (!magr || !mdef) {
    return MM_MISS;
  }
  if (!magr.mcanmove || magr.msleeping | 0) {
    return MM_MISS;
  }
  pa = magr.data;
  pd = mdef.data;
  if (pa === $sat(G.mons, PM_GRID_BUG) && magr.mx !== mdef.mx && magr.my !== mdef.my) {
    return MM_MISS;
  }
  tmp = find_mac(mdef) + magr.m_lev;
  if (mdef.mconf | 0 || !mdef.mcanmove || mdef.msleeping | 0) {
    tmp += 4;
    mdef.msleeping = 0;
  }
  if (mdef.mundetected) {
    mdef.mundetected = 0;
    await newsym(mdef.mx, mdef.my);
    if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) && !(!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) {
      if (G.multi < 0 && (unconscious() || is_fainted())) {
        let justone = ((mdef.data.geno & G_UNIQ) !== 0 ? 1 : 0) << 24 >> 24;
        let montype = null;
        montype = await noname_monnam(mdef, justone ? ARTICLE_THE : ARTICLE_NONE);
        if (!justone) {
          montype = await makeplural(montype);
        }
        await You(S("dream of %s."), montype);
      } else {
        await pline(S("Suddenly, you notice %s."), await a_monnam(mdef));
      }
    }
  }
  if ((pa.mflags2 & 16) >>> 0 !== 0 && (pd.mflags2 & 128) >>> 0 !== 0) {
    ++tmp;
  }
  vis = ($rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)) || ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) ? 1 : 0) << 24 >> 24;
  magr.mlstmv = G.monstermoves;
  for (i = 0; i < NATTK; ++i) {
    res[i] = MM_MISS;
    mattk = getmattk(magr, mdef, i, P(res), alt_attk);
    otmp = null;
    attk = 1;
    switch (mattk.aatyp) {
    case 254:
      if (distmin(magr.mx, magr.my, mdef.mx, mdef.my) > 1) {
        strike = await thrwmm(magr, mdef);
        if (mdef.mhp < 1) {
          res[i] = MM_DEF_DIED;
        }
        if (magr.mhp < 1) {
          res[i] |= MM_AGR_DIED;
        }
        break;
      }
      if (magr.weapon_check === NEED_WEAPON || !magr.mw) {
        magr.weapon_check = NEED_HTH_WEAPON;
        if (await mon_wield_item(magr) !== 0) {
          return 0;
        }
      }
      await possibly_unwield(magr, FALSE);
      otmp = magr.mw;
      if (otmp) {
        if (vis) {
          await mswingsm(magr, mdef, otmp);
        }
        tmp += await hitval(otmp, mdef);
      }
    case 1:
    case 3:
    case 2:
    case 6:
    case 5:
    case 4:
    case 16:
      if (distmin(magr.mx, magr.my, mdef.mx, mdef.my) > 1) {
        continue;
      }
      if (!magr.mconf && !(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && otmp && mattk.aatyp !== AT_WEAP && (mdef.data === $sat(G.mons, 10) || mdef.data === $sat(G.mons, 9))) {
        strike = 0;
        break;
      }
      dieroll = rnd(20 + i);
      strike = tmp > dieroll ? 1 : 0;
      if (otmp) {
        tmp -= await hitval(otmp, mdef);
      }
      if (strike) {
        res[i] = await hitmm(magr, mdef, mattk);
        if ((mdef.data === $sat(G.mons, PM_BLACK_PUDDING) || mdef.data === $sat(G.mons, PM_BROWN_PUDDING)) && (otmp && ((G.objects[otmp.otyp].oc_material | 0) === IRON || (G.objects[otmp.otyp].oc_material | 0) === METAL)) && mdef.mhp > 1 && !mdef.mcan) {
          let mclone = null;
          if (!!(mclone = await clone_mon(mdef, 0, 0))) {
            if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
              let buf = new Int8Array(256);
              strcpy(P(buf), await Monnam(mdef));
              await pline(S("%s divides as %s hits it!"), P(buf), await mon_nam(magr));
            }
            await mintrap(mclone);
          }
        }
      } else {
        await missmm(magr, mdef, mattk);
      }
      break;
    case 7:
      strike = i >= 2 && res[i - 1] === MM_HIT && res[i - 2] === MM_HIT ? 1 : 0;
      if (strike) {
        res[i] = await hitmm(magr, mdef, mattk);
      }
      break;
    case 15:
      strike = 0;
      res[i] = await gazemm(magr, mdef, mattk);
      break;
    case 13:
      if (distmin(magr.mx, magr.my, mdef.mx, mdef.my) > 1) {
        continue;
      }
      res[i] = await explmm(magr, mdef, mattk);
      if (res[i] === MM_MISS) {
        strike = 0;
        attk = 0;
      } else {
        strike = 1;
      }
      break;
    case 11:
      if (mdef.data === $sat(G.mons, PM_SHADE)) {
        if (vis) {
          await pline(S("%s attempt to engulf %s is futile."), s_suffix(await Monnam(magr)), await mon_nam(mdef));
        }
        strike = 0;
        break;
      }
      if (G.u.usteed && mdef === G.u.usteed) {
        strike = 0;
        break;
      }
      if (distmin(magr.mx, magr.my, mdef.mx, mdef.my) > 1) {
        continue;
      }
      if (G.u.uswallow | 0 && magr === G.u.ustuck) {
        strike = 0;
      } else if ((strike = tmp > rnd(20 + i) ? 1 : 0) !== 0) {
        res[i] = await gulpmm(magr, mdef, mattk);
      } else {
        await missmm(magr, mdef, mattk);
      }
      break;
    case 12:
      if (!monnear(magr, mdef.mx, mdef.my)) {
        strike = await breamm(magr, mattk, mdef);
        if (strike) {
          res[i] |= MM_HIT;
        }
        if (mdef.mhp < 1) {
          res[i] = MM_DEF_DIED;
        }
        if (magr.mhp < 1) {
          res[i] |= MM_AGR_DIED;
        }
      } else {
        strike = 0;
      }
      break;
    case 10:
      if (!monnear(magr, mdef.mx, mdef.my)) {
        strike = await spitmm(magr, mattk, mdef);
        if (strike) {
          res[i] |= MM_HIT;
        }
        if (mdef.mhp < 1) {
          res[i] = MM_DEF_DIED;
        }
        if (magr.mhp < 1) {
          res[i] |= MM_AGR_DIED;
        }
      }
      break;
    default:
      strike = 0;
      attk = 0;
      break;
    }
    if (attk && !(res[i] & MM_AGR_DIED) && distmin(magr.mx, magr.my, mdef.mx, mdef.my) <= 1) {
      res[i] = await passivemm(magr, mdef, strike, res[i] & MM_DEF_DIED);
    }
    if (res[i] & MM_DEF_DIED) {
      return res[i];
    }
    if (res[i] & MM_AGR_DIED) {
      return res[i];
    }
    if (!magr.mcanmove || magr.msleeping | 0) {
      return res[i];
    }
    if (res[i] & MM_HIT) {
      struck = 1;
    }
  }
  return struck ? MM_HIT : MM_MISS;
}

async function hitmm(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let weaponhit = (mattk.aatyp === AT_WEAP || mattk.aatyp === AT_CLAW && otmp ? 1 : 0) << 24 >> 24;
  let silverhit = (weaponhit && otmp && (G.objects[otmp.otyp].oc_material | 0) === SILVER ? 1 : 0) << 24 >> 24;
  let showit = FALSE;
  if (mdef.m_ap_type & 7) {
    await seemimic(mdef);
    showit = (showit | vis) << 24 >> 24;
  } else if (mdef.mundetected) {
    mdef.mundetected = 0;
    showit = (showit | vis) << 24 >> 24;
  }
  if (magr.m_ap_type & 7) {
    await seemimic(magr);
    showit = (showit | vis) << 24 >> 24;
  } else if (magr.mundetected) {
    magr.mundetected = 0;
    showit = (showit | vis) << 24 >> 24;
  }
  if (vis) {
    let compat = 0;
    let buf = new Int8Array(256);
    if (!((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
      await map_invisible(magr.mx, magr.my);
    } else if (showit) {
      await newsym(magr.mx, magr.my);
    }
    if (!((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await map_invisible(mdef.mx, mdef.my);
    } else if (showit) {
      await newsym(mdef.mx, mdef.my);
    }
    if ((compat = could_seduce(magr, mdef, mattk)) && !magr.mcan) {
      sprintf(P(buf), S("%s %s"), await Monnam(magr), mdef.mcansee | 0 ? S("smiles at") : S("talks to"));
      await pline(S("%s %s %s."), P(buf), await mon_nam(mdef), compat === 2 ? S("engagingly") : S("seductively"));
    } else if (await shade_miss(magr, mdef, otmp, FALSE, TRUE)) {
      return MM_MISS;
    } else {
      let magr_name = new Int8Array(256);
      strcpy(P(magr_name), await Monnam(magr));
      switch (mattk.aatyp) {
      case 2:
        sprintf(P(buf), S("%s bites"), P(magr_name));
        break;
      case 6:
        sprintf(P(buf), S("%s stings"), P(magr_name));
        break;
      case 4:
        sprintf(P(buf), S("%s butts"), P(magr_name));
        break;
      case 5:
        sprintf(P(buf), S("%s touches"), P(magr_name));
        break;
      case 16:
        sprintf(P(buf), S("%s tentacles suck"), s_suffix(P(magr_name)));
        break;
      case 7:
        if (magr !== G.u.ustuck) {
          sprintf(P(buf), S("%s squeezes"), P(magr_name));
          break;
        }
      default:
        sprintf(P(buf), S("%s hits"), P(magr_name));
      }
      await pline(S("%s %s."), P(buf), await mon_nam_too(mdef, magr));
      if (mon_hates_silver(mdef) && silverhit) {
        let mdef_name = await mon_nam_too(mdef, magr);
        strcpy(P(magr_name), s_suffix(P(magr_name)));
        if (!(mdef.data.mlet === S_GHOST) && !((mdef.data.mflags1 & 4) >>> 0 !== 0)) {
          if (mdef !== magr) {
            mdef_name = s_suffix(mdef_name);
          } else {
            strsubst(mdef_name, S("himself"), S("his own"));
            strsubst(mdef_name, S("herself"), S("her own"));
            strsubst(mdef_name, S("itself"), S("its own"));
          }
          strcat(mdef_name, S(" flesh"));
        }
        await pline(S("%s %s sears %s!"), P(magr_name), await simpleonames(otmp), mdef_name);
      }
    }
  } else {
    await noises(magr, mattk);
  }
  return await mdamagem(magr, mdef, mattk);
}

async function gazemm(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let buf = new Int8Array(256);
  if (vis) {
    if (mdef.data.mlet === S_MIMIC && (mdef.m_ap_type & 7) !== M_AP_NOTHING) {
      await seemimic(mdef);
    }
    sprintf(P(buf), S("%s gazes at"), await Monnam(magr));
    await pline(S("%s %s..."), P(buf), (mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)) ? await mon_nam(mdef) : S("something"));
  }
  if (magr.mcan | 0 || !magr.mcansee || !mdef.mcansee || magr.minvis | 0 && !((mdef.data.mflags1 & 16777216) >>> 0 !== 0) || mdef.msleeping | 0) {
    if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await pline(S("but nothing happens."));
    }
    return MM_MISS;
  }
  if (magr.data === $sat(G.mons, PM_MEDUSA) && await mon_reflects(mdef, null)) {
    if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected)) {
      await mon_reflects(mdef, S("The gaze is reflected away by %s %s."));
    }
    if (mdef.mcansee) {
      if (await mon_reflects(magr, null)) {
        if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
          await mon_reflects(magr, S("The gaze is reflected away by %s %s."));
        }
        return MM_MISS;
      }
      if (mdef.minvis | 0 && !((magr.data.mflags1 & 16777216) >>> 0 !== 0)) {
        if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
          await pline(S("%s doesn't seem to notice that %s gaze was reflected."), await Monnam(magr), G.genders[pronoun_gender(magr, 0)].his);
        }
        return MM_MISS;
      }
      if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
        await pline(S("%s is turned to stone!"), await Monnam(magr));
      }
      await monstone(magr);
      if (!(magr.mhp < 1)) {
        return MM_MISS;
      }
      return MM_AGR_DIED;
    }
  }
  return await mdamagem(magr, mdef, mattk);
}

export function engulf_target(magr: struct_monst | null, mdef: struct_monst | null): number {
  let lev = null;
  let dx = 0;
  let dy = 0;
  if (mdef.data.msize >= MZ_HUGE) {
    return FALSE;
  }
  if (magr === G.youmonst ? G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic ? 1 : 0 : (magr.data.mflags1 & 8) >>> 0 !== 0 ? 1 : 0) {
    return TRUE;
  }
  dx = mdef.mx, dy = mdef.my;
  if (mdef === G.youmonst) {
    dx = G.u.ux, dy = G.u.uy;
  }
  lev = $sat(G.level.locations[dx], dy);
  if (lev.typ < POOL || closed_door(dx, dy) || (lev.typ === TREE || G.level.flags.arboreal | 0 && lev.typ === STONE) || lev.typ === IRONBARS && !(magr.data.mlet === S_VORTEX || magr.data === $sat(G.mons, 151))) {
    return FALSE;
  }
  return TRUE;
}

async function gulpmm(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let ax = 0;
  let ay = 0;
  let dx = 0;
  let dy = 0;
  let status = 0;
  let buf = new Int8Array(256);
  let obj = null;
  if (!engulf_target(magr, mdef)) {
    return MM_MISS;
  }
  if (vis) {
    sprintf(P(buf), S("%s swallows"), await Monnam(magr));
    await pline(S("%s %s."), P(buf), await mon_nam(mdef));
  }
  for (obj = mdef.minvent; obj; obj = obj.nobj) {
    await snuff_lit(obj);
  }
  if ((mdef.cham === 222 || mdef.cham === 223 || mdef.cham === 224) && await newcham(mdef, $sat(G.mons, mdef.cham), FALSE, FALSE)) {
    if (vis) {
      await pline(S("%s expels %s."), await Monnam(magr), (mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)) ? S("it") : G.c_common_strings.c_something);
      if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) {
        await pline(S("It turns into %s."), await a_monnam(mdef));
      }
    }
    return MM_HIT;
  }
  ax = magr.mx;
  ay = magr.my;
  dx = mdef.mx;
  dy = mdef.my;
  G.level.monsters[dx][dy] = null;
  G.level.monsters[ax][ay] = null;
  await place_monster(magr, dx, dy);
  await newsym(ax, ay);
  await newsym(dx, dy);
  status = await mdamagem(magr, mdef, mattk);
  if ((status & (MM_AGR_DIED | MM_DEF_DIED)) === (MM_AGR_DIED | MM_DEF_DIED)) {
    ;
  } else if (status & MM_DEF_DIED) {
    await place_monster(magr, dx, dy);
    await newsym(dx, dy);
    if (await minliquid(magr) || t_at(dx, dy) && await mintrap(magr) === 2) {
      status |= MM_AGR_DIED;
    }
  } else if (status & MM_AGR_DIED) {
    await place_monster(mdef, dx, dy);
    await newsym(dx, dy);
  } else {
    if ($rd(G.viz_array.a[G.viz_array.o + dy], dx) & 2) {
      await pline(S("%s is regurgitated!"), await Monnam(mdef));
    }
    G.level.monsters[dx][dy] = null;
    await place_monster(magr, ax, ay);
    await place_monster(mdef, dx, dy);
    await newsym(ax, ay);
    await newsym(dx, dy);
  }
  return status;
}

async function explmm(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let result = 0;
  if (magr.mcan) {
    return MM_MISS;
  }
  if ($rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2) {
    await pline(S("%s explodes!"), await Monnam(magr));
  } else {
    await noises(magr, mattk);
  }
  result = await mdamagem(magr, mdef, mattk);
  if (!(result & MM_AGR_DIED)) {
    let was_leashed = ((magr.mleashed | 0) !== 0 ? 1 : 0) << 24 >> 24;
    await mondead(magr);
    if (!(magr.mhp < 1)) {
      return result;
    }
    result |= MM_AGR_DIED;
    if (was_leashed) {
      await Your(S("leash falls slack."));
    }
  }
  if (magr.mtame) {
    await You(P(brief_feeling), S("melancholy"));
  }
  return result;
}

async function mdamagem(magr: struct_monst | null, mdef: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let $g = 0;
  let obj = null;
  let buf = new Int8Array(256);
  let pa = null;
  let pd = null;
  let armpro = 0;
  let num = 0;
  let tmp = new Int32Array(1);
  let res = 0;
  let cancelled = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      pa = magr.data;
      pd = mdef.data;
      tmp[0] = d(mattk.damn, mattk.damd);
      res = MM_MISS;
      if ((pd === $sat(G.mons, 10) || pd === $sat(G.mons, 9) || mattk.adtyp === AD_DGST && pd === $sat(G.mons, PM_MEDUSA)) && !(((magr.data.mresists | magr.mextrinsics) & 128) !== 0)) {
        let protector = attk_protection(mattk.aatyp);
        let wornitems = magr.misc_worn_check;
        if (!!otmp) {
          wornitems = wornitems | W_ARMG;
        }
        if (protector === 0 || protector !== ~0 && (wornitems & protector) !== protector) {
          if (poly_when_stoned(pa)) {
            await mon_to_stone(magr);
            return MM_HIT;
          }
          if (vis && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
            await pline(S("%s turns to stone!"), await Monnam(magr));
          }
          await monstone(magr);
          if (!(magr.mhp < 1)) {
            return MM_HIT;
          } else if (magr.mtame && !vis) {
            await You(P(brief_feeling), S("peculiarly sad"));
          }
          return MM_AGR_DIED;
        }
      }
      armpro = magic_negation(mdef);
      cancelled = (magr.mcan | 0 || !(rn2(10) >= 3 * armpro) ? 1 : 0) << 24 >> 24;
      switch (mattk.adtyp) {
      case 26: { $g = 5; continue $L; }
      case 12: { $g = 6; continue $L; }
      case 17: { $g = 7; continue $L; }
      case 29: { $g = 8; continue $L; }
      case 27: { $g = 9; continue $L; }
      case 0: { $g = 10; continue $L; }
      case 2: { $g = 11; continue $L; }
      case 3: { $g = 12; continue $L; }
      case 6: { $g = 13; continue $L; }
      case 8: { $g = 14; continue $L; }
      case 24: { $g = 15; continue $L; }
      case 42: { $g = 16; continue $L; }
      case 34: { $g = 17; continue $L; }
      case 18: { $g = 18; continue $L; }
      case 23: { $g = 19; continue $L; }
      case 4: { $g = 20; continue $L; }
      case 14: { $g = 21; continue $L; }
      case 13: { $g = 22; continue $L; }
      case 25: { $g = 23; continue $L; }
      case 11: { $g = 24; continue $L; }
      case 36: { $g = 25; continue $L; }
      case 253: { $g = 26; continue $L; }
      case 20: { $g = 27; continue $L; }
      case 15: { $g = 28; continue $L; }
      case 35: { $g = 29; continue $L; }
      case 21: { $g = 30; continue $L; }
      case 22: { $g = 31; continue $L; }
      case 16: { $g = 32; continue $L; }
      case 7: { $g = 33; continue $L; }
      case 30: { $g = 34; continue $L; }
      case 31: { $g = 35; continue $L; }
      case 32: { $g = 36; continue $L; }
      case 40: { $g = 37; continue $L; }
      case 19: { $g = 38; continue $L; }
      case 28: { $g = 39; continue $L; }
      case 41: { $g = 40; continue $L; }
      default: { $g = 41; continue $L; }
      }
    case 5:
      if (pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309)) {
        if (vis && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected))) {
          await pline(S("%s %s!"), await Monnam(magr), pd === $sat(G.mons, PM_FAMINE) ? S("belches feebly, shrivels up and dies") : pd === $sat(G.mons, PM_PESTILENCE) ? S("coughs spasmodically and collapses") : S("vomits violently and drops dead"));
        }
        await mondied(magr);
        if (!(magr.mhp < 1)) {
          return 0;
        } else if (magr.mtame && !vis) {
          await You(P(brief_feeling), S("queasy"));
        }
        return MM_AGR_DIED;
      }
      if (G.flags.verbose && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await verbalize(S("Burrrrp!"));
      }
      tmp[0] = mdef.mhp;
      if (!!(obj = await mlifesaver(mdef))) {
        await m_useup(mdef, obj);
      }
      if (!await corpse_chance(mdef, magr, TRUE) || magr.mhp < 1) {
        { $g = 4; continue $L; };
      }
      num = await monsndx(pd);
      if (magr.mtame && !magr.isminion && !(G.mvitals[num].mvflags & G_NOCORPSE)) {
        let virtualcorpse = await mksobj(CORPSE, FALSE, FALSE);
        let nutrit = 0;
        await set_corpsenm(virtualcorpse, num);
        nutrit = await dog_nutrition(magr, virtualcorpse);
        await dealloc_obj(virtualcorpse);
        if (magr.meating > 1) {
          magr.meating = (magr.meating + 3) / 4 | 0;
        }
        if (nutrit > 1) {
          nutrit = nutrit / 2 | 0;
        }
        magr.mextra.edog.hungrytime += nutrit;
      }
      { $g = 4; continue $L; };
    case 6:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected)) {
        await pline(S("%s %s for a moment."), await Monnam(mdef), await makeplural(stagger(pd, S("stagger"))));
      }
      mdef.mstun = 1;
      { $g = 1; continue $L; }
    case 7:
      if (magr.mcan) {
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      { $g = 1; continue $L; }
    case 8:
    case 9:
    case 10:
    case 1: // physical
      obj = mattk.aatyp === AT_WEAP || mattk.aatyp === AT_CLAW ? otmp : null;
      if (await shade_miss(magr, mdef, obj, FALSE, TRUE)) {
        tmp[0] = 0;
      } else if (mattk.aatyp === AT_KICK && (pd.mflags1 & 2097152) >>> 0 !== 0) {
        tmp[0] = 0;
      } else if (mattk.aatyp === AT_WEAP || mattk.aatyp === AT_CLAW && otmp) {
        if (otmp) {
          let marmg = null;
          if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9))) {
            { $g = 2; continue $L; }
          }
          tmp[0] += await dmgval(otmp, mdef);
          if (!!(marmg = await which_armor(magr, W_ARMG)) && marmg.otyp === GAUNTLETS_OF_POWER) {
            tmp[0] += rn2(4) + 3;
          }
          if (tmp[0] < 1) {
            tmp[0] = 1;
          }
          if (otmp.oartifact) {
            await artifact_hit(magr, mdef, otmp, P(tmp, 0), dieroll);
            if (mdef.mhp < 1) {
              return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
            }
          }
          if (tmp[0]) {
            await rustm(mdef, otmp);
          }
        }
      } else if (pa === $sat(G.mons, PM_PURPLE_WORM) && pd === $sat(G.mons, PM_SHRIEKER)) {
        if (tmp[0] >= mdef.mhp && mdef.mhp > 1) {
          tmp[0] = mdef.mhp - 1;
        }
      }
      { $g = 4; continue $L; };
    case 11:
      if (cancelled) {
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        await pline(S("%s is %s!"), await Monnam(mdef), await on_fire(pd, mattk));
      }
      if (pd === $sat(G.mons, 246) || pd === $sat(G.mons, 245)) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s burns completely!"), await Monnam(mdef));
        }
        await mondead(mdef);
        if (!(mdef.mhp < 1)) {
          return 0;
        } else if (mdef.mtame && !vis) {
          await pline(S("May %s roast in peace."), await mon_nam(mdef));
        }
        return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
      }
      tmp[0] += await destroy_mitem(mdef, SCROLL_CLASS, AD_FIRE);
      tmp[0] += await destroy_mitem(mdef, SPBOOK_CLASS, AD_FIRE);
      if (((mdef.data.mresists | mdef.mextrinsics) & 1) !== 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline_The(S("fire doesn't seem to burn %s!"), await mon_nam(mdef));
        }
        await shieldeff(mdef.mx, mdef.my);
        await golemeffects(mdef, AD_FIRE, tmp[0]);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, POTION_CLASS, AD_FIRE);
      { $g = 4; continue $L; };
    case 12:
      if (cancelled) {
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        await pline(S("%s is covered in frost!"), await Monnam(mdef));
      }
      if (((mdef.data.mresists | mdef.mextrinsics) & 2) !== 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline_The(S("frost doesn't seem to chill %s!"), await mon_nam(mdef));
        }
        await shieldeff(mdef.mx, mdef.my);
        await golemeffects(mdef, AD_COLD, tmp[0]);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, POTION_CLASS, AD_COLD);
      { $g = 4; continue $L; };
    case 13:
      if (cancelled) {
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        await pline(S("%s gets zapped!"), await Monnam(mdef));
      }
      tmp[0] += await destroy_mitem(mdef, WAND_CLASS, AD_ELEC);
      if (((mdef.data.mresists | mdef.mextrinsics) & 16) !== 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline_The(S("zap doesn't shock %s!"), await mon_nam(mdef));
        }
        await shieldeff(mdef.mx, mdef.my);
        await golemeffects(mdef, AD_ELEC, tmp[0]);
        tmp[0] = 0;
      }
      tmp[0] += await destroy_mitem(mdef, RING_CLASS, AD_ELEC);
      { $g = 4; continue $L; };
    case 14:
      if (magr.mcan) {
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (((mdef.data.mresists | mdef.mextrinsics) & 64) !== 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s is covered in %s, but it seems harmless."), await Monnam(mdef), hliquid(S("acid")));
        }
        tmp[0] = 0;
      } else if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        await pline(S("%s is covered in %s!"), await Monnam(mdef), hliquid(S("acid")));
        await pline(S("It burns %s!"), await mon_nam(mdef));
      }
      if (!rn2(30)) {
        await erode_armor(mdef, ERODE_CORRODE);
      }
      if (!rn2(6)) {
        await acid_damage(mdef.mw);
      }
      { $g = 4; continue $L; };
    case 15:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      if (pd === $sat(G.mons, PM_IRON_GOLEM)) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s falls to pieces!"), await Monnam(mdef));
        }
        await mondied(mdef);
        if (!(mdef.mhp < 1)) {
          return 0;
        } else if (mdef.mtame && !vis) {
          await pline(S("May %s rust in peace."), await mon_nam(mdef));
        }
        return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
      }
      await erode_armor(mdef, ERODE_RUST);
      mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 16:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      await erode_armor(mdef, ERODE_CORRODE);
      mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 17:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      if (pd === $sat(G.mons, PM_WOOD_GOLEM) || pd === $sat(G.mons, PM_LEATHER_GOLEM)) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s falls to pieces!"), await Monnam(mdef));
        }
        await mondied(mdef);
        if (!(mdef.mhp < 1)) {
          return 0;
        } else if (mdef.mtame && !vis) {
          await pline(S("May %s rot in peace."), await mon_nam(mdef));
        }
        return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
      }
      await erode_armor(mdef, ERODE_CORRODE);
      mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 18:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
    case 2: // do_stone
      if (await munstone(mdef, FALSE)) {
        { $g = 3; continue $L; }
      }
      if (poly_when_stoned(pd)) {
        await mon_to_stone(mdef);
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (!!(((mdef.data.mresists | mdef.mextrinsics) & 128) !== 0)) { $g = 42; continue $L; }
      if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        await pline(S("%s turns to stone!"), await Monnam(mdef));
      }
      await monstone(mdef);
    case 3: // post_stone
      if (!(mdef.mhp < 1)) {
        return 0;
      } else if (mdef.mtame && !vis) {
        await You(P(brief_feeling), S("peculiarly sad"));
      }
      return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
    case 42:
      tmp[0] = mattk.adtyp === AD_STON ? 0 : 1;
      { $g = 4; continue $L; };
    case 19:
      if (!cancelled && tmp[0] < mdef.mhp && !await tele_restrict(mdef)) {
        let mdef_Monnam = new Int8Array(256);
        let wasseen = ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)) ? 1 : 0) << 24 >> 24;
        if (vis && wasseen) {
          strcpy(P(mdef_Monnam), await Monnam(mdef));
        }
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
        await rloc(mdef, TRUE);
        if (vis && wasseen && !((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) && mdef !== G.u.usteed) {
          await pline(S("%s suddenly disappears!"), P(mdef_Monnam));
        }
        if (tmp[0] >= mdef.mhp) {
          if (mdef.mhp === 1) {
            ++mdef.mhp;
          }
          tmp[0] = mdef.mhp - 1;
        }
      }
      { $g = 4; continue $L; };
    case 20:
      if (!cancelled && !mdef.msleeping && await sleep_monst(mdef, rnd(10), -1)) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          strcpy(P(buf), await Monnam(mdef));
          await pline(S("%s is put to sleep by %s."), P(buf), await mon_nam(magr));
        }
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
        await slept_monst(mdef);
      }
      { $g = 4; continue $L; };
    case 21:
      if (!cancelled && mdef.mcanmove | 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          strcpy(P(buf), await Monnam(mdef));
          await pline(S("%s is frozen by %s."), P(buf), await mon_nam(magr));
        }
        paralyze_monst(mdef, rnd(10));
      }
      { $g = 4; continue $L; };
    case 22:
      if (!cancelled && (mdef.mspeed | 0) !== MSLOW) {
        let oldspeed = mdef.mspeed;
        await mon_adjust_speed(mdef, -1, null);
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
        if (mdef.mspeed !== oldspeed && vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          await pline(S("%s slows down."), await Monnam(mdef));
        }
      }
      { $g = 4; continue $L; };
    case 23:
      if (!magr.mcan && !mdef.mconf && !magr.mspec_used) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s looks confused."), await Monnam(mdef));
        }
        mdef.mconf = 1;
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      }
      { $g = 4; continue $L; };
    case 24:
      if (can_blnd(magr, mdef, mattk.aatyp, null)) {
        let rnd_tmp = 0;
        if (vis && mdef.mcansee | 0 && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          await pline(S("%s is blinded."), await Monnam(mdef));
        }
        rnd_tmp = d(mattk.damn, mattk.damd) >>> 0;
        if ((rnd_tmp = rnd_tmp + mdef.mblinded >>> 0) > 127) {
          rnd_tmp = 127;
        }
        mdef.mblinded = (rnd_tmp) & 127;
        mdef.mcansee = 0;
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      }
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 25:
      if (!magr.mcan && (pd.mflags1 & 4096) >>> 0 === 0 && mdef.mcansee | 0) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          await pline(S("%s looks %sconfused."), await Monnam(mdef), mdef.mconf | 0 ? S("more ") : S(""));
        }
        mdef.mconf = 1;
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      }
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 26:
      if (!night() && pa === $sat(G.mons, PM_GREMLIN)) {
        { $g = 4; continue $L; };
      }
      if (!magr.mcan && !rn2(10)) {
        mdef.mcan = 1;
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
        if ((pd.mflags2 & 4) >>> 0 !== 0 && pd.mlet !== S_HUMAN) {
          await were_change(mdef);
        }
        if (pd === $sat(G.mons, PM_CLAY_GOLEM)) {
          if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
            await pline(S("Some writing vanishes from %s head!"), s_suffix(await mon_nam(mdef)));
            await pline(S("%s is destroyed!"), await Monnam(mdef));
          }
          await mondied(mdef);
          if (!(mdef.mhp < 1)) {
            return 0;
          } else if (mdef.mtame && !vis) {
            await You(P(brief_feeling), S("strangely sad"));
          }
          return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
        }
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          if (!vis) {
            await You_hear(S("laughter."));
          } else if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s chuckles."), await Monnam(magr));
          }
        }
      }
      { $g = 4; continue $L; };
    case 27:
      tmp[0] = 0;
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      {
        let gold = findgold(mdef.minvent);
        if (!gold) {
          { $g = 4; continue $L; };
        }
        await obj_extract_self(gold);
        await add_to_minv(magr, gold);
      }
      mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
        strcpy(P(buf), await Monnam(magr));
        await pline(S("%s steals some gold from %s."), P(buf), await mon_nam(mdef));
      }
      if (!await tele_restrict(magr)) {
        let couldspot = ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)) ? 1 : 0) << 24 >> 24;
        await rloc(magr, TRUE);
        if (vis && couldspot && !((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
          await pline(S("%s suddenly disappears!"), P(buf));
        }
      }
      { $g = 4; continue $L; };
    case 28:
      if (!cancelled && !rn2(3) && !resists_drli(mdef)) {
        tmp[0] = d(2, 6);
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          await pline(S("%s suddenly seems weaker!"), await Monnam(mdef));
        }
        mdef.mhpmax -= tmp[0];
        if (mdef.m_lev === 0) {
          tmp[0] = mdef.mhp;
        } else {
          mdef.m_lev = mdef.m_lev - 1 & 0xff;
        }
      }
      { $g = 4; continue $L; };
    case 29:
    case 30:
    case 31:
      if (magr.mcan) {
        { $g = 4; continue $L; };
      }
      for (obj = mdef.minvent; obj; obj = obj.nobj) {
        if (!magr.mtame || !obj.cursed) {
          break;
        }
      }
      if (obj) {
        let onambuf = new Int8Array(256);
        let mdefnambuf = new Int8Array(256);
        strcpy(P(mdefnambuf), await x_monnam(mdef, ARTICLE_THE, null, 0, FALSE));
        otmp = obj;
        if (G.u.usteed === mdef && otmp === await which_armor(mdef, W_SADDLE)) {
          await dismount_steed(DISMOUNT_POLY);
        }
        await obj_extract_self(otmp);
        if (otmp.owornmask) {
          mdef.misc_worn_check = mdef.misc_worn_check & ~otmp.owornmask;
          if (otmp.owornmask & W_WEP) {
            await mwepgone(mdef);
          }
          otmp.owornmask = 0;
          await update_mon_intrinsics(mdef, otmp, FALSE, FALSE);
          mdef.misc_worn_check = mdef.misc_worn_check | I_SPECIAL;
        }
        if (vis) {
          strcpy(P(onambuf), await doname(otmp));
        }
        await add_to_minv(magr, otmp);
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          strcpy(P(buf), await Monnam(magr));
          await pline(S("%s steals %s from %s!"), P(buf), P(onambuf), P(mdefnambuf));
        }
        await possibly_unwield(mdef, FALSE);
        mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
        await mselftouch(mdef, null, FALSE);
        if (mdef.mhp < 1) {
          return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
        }
        if (pa.mlet === S_NYMPH && !await tele_restrict(magr)) {
          let couldspot = ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)) ? 1 : 0) << 24 >> 24;
          await rloc(magr, TRUE);
          if (vis && couldspot && !((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
            await pline(S("%s suddenly disappears!"), P(buf));
          }
        }
      }
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 32:
      if (!cancelled && !rn2(4)) {
        await xdrainenergym(mdef, (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) && mattk.aatyp !== AT_ENGL ? 1 : 0) << 24 >> 24);
      }
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 33:
    case 34:
    case 35:
      if (!cancelled && !rn2(8)) {
        if (vis && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
          await pline(S("%s %s was poisoned!"), s_suffix(await Monnam(magr)), mpoisons_subj(magr, mattk));
        }
        if (((mdef.data.mresists | mdef.mextrinsics) & 32) !== 0) {
          if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data))) && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data)))) {
            await pline_The(S("poison doesn't seem to affect %s."), await mon_nam(mdef));
          }
        } else {
          if (rn2(10)) {
            tmp[0] += rn2(10) + 6;
          } else {
            if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
              await pline_The(S("poison was deadly..."));
            }
            tmp[0] = mdef.mhp;
          }
        }
      }
      { $g = 4; continue $L; };
    case 36:
      if (G.notonhead || !((pd.mflags1 & 32768) >>> 0 === 0)) {
        if (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
          await pline(S("%s doesn't seem harmed."), await Monnam(mdef));
        }
        tmp[0] = 0;
        { $g = 4; continue $L; };
      }
      if (mdef.misc_worn_check & W_ARMH && rn2(8)) {
        if (vis && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data))) && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected))) {
          strcpy(P(buf), s_suffix(await Monnam(mdef)));
          await pline(S("%s helmet blocks %s attack to %s head."), P(buf), s_suffix(await mon_nam(magr)), G.genders[pronoun_gender(mdef, 0)].his);
        }
        { $g = 4; continue $L; };
      }
      res = await eat_brains(magr, mdef, vis, P(tmp, 0));
      { $g = 4; continue $L; };
    case 37:
      if (cancelled) {
        { $g = 4; continue $L; };
      }
      if (!rn2(4) && !(pd === $sat(G.mons, 205) || (pd === $sat(G.mons, 110) || pd === $sat(G.mons, 30) || pd === $sat(G.mons, 152) || pd === $sat(G.mons, 326)) || pd.mlet === S_GHOST)) {
        if (!await munslime(mdef, FALSE) && !(mdef.mhp < 1)) {
          if (await newcham(mdef, $sat(G.mons, PM_GREEN_SLIME), FALSE, (vis && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected)) ? 1 : 0) << 24 >> 24)) {
            pd = mdef.data;
          }
          mdef.mstrategy = (mdef.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
          res = MM_HIT;
        }
        if (magr.mhp < 1) {
          res |= MM_AGR_DIED;
        }
        if (mdef.mhp < 1) {
          res |= MM_DEF_DIED;
        }
        tmp[0] = 0;
      }
      { $g = 4; continue $L; };
    case 38:
      if (cancelled) {
        tmp[0] = 0;
      }
      { $g = 4; continue $L; };
    case 39:
      if (magr.mcan) {
        tmp[0] = 0;
      }
      { $g = 4; continue $L; };
    case 40:
      { $g = 4; continue $L; };
    case 41:
      tmp[0] = 0;
      { $g = 4; continue $L; };
    case 4:
      if (!tmp[0]) {
        return res;
      }
      if ((mdef.mhp -= tmp[0]) < 1) {
        if ((!!G.level.monsters[mdef.mx][mdef.my] ? G.level.monsters[mdef.mx][mdef.my] : null) === magr) {
          G.level.monsters[mdef.mx][mdef.my] = null;
          mdef.mhp = 1;
          await place_monster(mdef, mdef.mx, mdef.my);
          mdef.mhp = 0;
        }
        await monkilled(mdef, S(""), mattk.adtyp);
        if (!(mdef.mhp < 1)) {
          return res;
        } else if (res === MM_AGR_DIED) {
          return MM_DEF_DIED | MM_AGR_DIED;
        }
        if (mattk.adtyp === AD_DGST) {
          if (mdef.cham >= LOW_PM) {
            await newcham(magr, null, FALSE, TRUE);
          } else if (pd === $sat(G.mons, PM_GREEN_SLIME) && !(pa === $sat(G.mons, 205) || (pa === $sat(G.mons, 110) || pa === $sat(G.mons, 30) || pa === $sat(G.mons, 152) || pa === $sat(G.mons, 326)) || pa.mlet === S_GHOST)) {
            await newcham(magr, $sat(G.mons, PM_GREEN_SLIME), FALSE, TRUE);
          } else if (pd === $sat(G.mons, PM_WRAITH)) {
            await grow_up(magr, null);
            return MM_DEF_DIED | (!(magr.mhp < 1) ? 0 : MM_AGR_DIED);
          } else if (pd === $sat(G.mons, PM_NURSE)) {
            magr.mhp = magr.mhpmax;
          }
        }
        return MM_DEF_DIED | (await grow_up(magr, mdef) ? 0 : MM_AGR_DIED);
      }
      return res === MM_AGR_DIED ? MM_AGR_DIED : MM_HIT;
    }
    break;
  }
}

export function paralyze_monst(mon: struct_monst | null, amt: number): void {
  if (amt > 127) {
    amt = 127;
  }
  mon.mcanmove = 0;
  mon.mfrozen = (amt >>> 0) & 127;
  mon.meating = 0;
  mon.mstrategy = (mon.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
}

export async function sleep_monst(mon: struct_monst | null, amt: number, how: number): Promise<number> {
  if (((mon.data.mresists | mon.mextrinsics) & 4) !== 0 || how >= 0 && await resist(mon, how << 24 >> 24, 0, NOTELL)) {
    await shieldeff(mon.mx, mon.my);
  } else if (mon.mcanmove) {
    await finish_meating(mon);
    amt += mon.mfrozen | 0;
    if (amt > 0) {
      mon.mcanmove = 0;
      mon.mfrozen = ((amt < 127 ? amt : 127) >>> 0) & 127;
    } else {
      mon.msleeping = 1;
    }
    return 1;
  }
  return 0;
}

export async function slept_monst(mon: struct_monst | null): Promise<void> {
  if ((mon.msleeping | 0 || !mon.mcanmove) && mon === G.u.ustuck && !sticks(G.youmonst.data) && !G.u.uswallow) {
    await pline(S("%s grip relaxes."), s_suffix(await Monnam(mon)));
    await unstuck(mon);
  }
}

export async function rustm(mdef: struct_monst | null, obj: struct_obj | null): Promise<void> {
  let dmgtyp = -1;
  let chance = 1;
  if (!mdef || !obj) {
    return;
  }
  if (dmgtype(mdef.data, AD_CORR)) {
    dmgtyp = ERODE_CORRODE;
  } else if (dmgtype(mdef.data, AD_RUST)) {
    dmgtyp = ERODE_RUST;
  } else if (dmgtype(mdef.data, AD_FIRE) && mdef.data !== $sat(G.mons, PM_STEAM_VORTEX)) {
    dmgtyp = ERODE_BURN;
    chance = 6;
  }
  if (dmgtyp >= 0 && !rn2(chance)) {
    await erode_obj(obj, null, dmgtyp, EF_GREASE | EF_VERBOSE);
  }
}

async function mswingsm(magr: struct_monst | null, mdef: struct_monst | null, otemp: struct_obj | null): Promise<void> {
  if (G.flags.verbose && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
    await pline(S("%s %s %s%s %s at %s."), await Monnam(magr), (G.objects[otemp.otyp].oc_dir | 0) & PIERCE ? S("thrusts") : S("swings"), otemp.quan > 1 ? S("one of ") : S(""), G.genders[pronoun_gender(magr, 0)].his, await xname(otemp), await mon_nam(mdef));
  }
}

async function passivemm(magr: struct_monst | null, mdef: struct_monst | null, mhit: number, mdead: number): Promise<number> {
  let $g = 0;
  let mddat = null;
  let madat = null;
  let buf = new Int8Array(256);
  let i = 0;
  let tmp = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mddat = mdef.data;
      madat = magr.data;
      buf = new Int8Array(256);
      for (i = 0; ; ++i) {
        if (i >= NATTK) {
          return mdead | mhit;
        }
        if (mddat.mattk[i].aatyp === AT_NONE) {
          break;
        }
      }
      if (mddat.mattk[i].damn) {
        tmp = d(mddat.mattk[i].damn, mddat.mattk[i].damd);
      } else if (mddat.mattk[i].damd) {
        tmp = d(mddat.mlevel + 1, mddat.mattk[i].damd);
      } else {
        tmp = 0;
      }
      switch (mddat.mattk[i].adtyp) {
      case 8:
        if (mhit && !rn2(2)) {
          strcpy(P(buf), await Monnam(magr));
          if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s is splashed by %s %s!"), P(buf), s_suffix(await mon_nam(mdef)), hliquid(S("acid")));
          }
          if (((magr.data.mresists | magr.mextrinsics) & 64) !== 0) {
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s is not affected."), await Monnam(magr));
            }
            tmp = 0;
          }
        } else {
          tmp = 0;
        }
        if (!rn2(30)) {
          await erode_armor(magr, ERODE_CORRODE);
        }
        if (!rn2(6)) {
          await acid_damage(magr.mw);
        }
        { $g = 1; continue $L; }
      case 41:
        if (mhit && !mdef.mcan && otmp) {
          await drain_item(otmp, FALSE);
        }
        break;
      default:
        break;
      }
      if (mdead || mdef.mcan | 0) {
        return mdead | mhit;
      }
      if (rn2(3)) {
        switch (mddat.mattk[i].adtyp) {
        case 14:
          if (tmp > 127) {
            tmp = 127;
          }
          if (mddat === $sat(G.mons, PM_FLOATING_EYE)) {
            if (!rn2(4)) {
              tmp = 127;
            }
            if (magr.mcansee | 0 && (madat.mflags1 & 4096) >>> 0 === 0 && mdef.mcansee | 0 && ((madat.mflags1 & 16777216) >>> 0 !== 0 || !mdef.minvis)) {
              strcpy(P(buf), s_suffix(await Monnam(mdef)));
              strNsubst(P(buf), S("%"), S("%%"), 0);
              strcat(P(buf), S(" gaze is reflected by %s %s."));
              if (await mon_reflects(magr, (magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) ? P(buf) : null)) {
                return mdead | mhit;
              }
              strcpy(P(buf), await Monnam(magr));
              if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
                await pline(S("%s is frozen by %s gaze!"), P(buf), s_suffix(await mon_nam(mdef)));
              }
              paralyze_monst(magr, tmp);
              return mdead | mhit;
            }
          } else {
            strcpy(P(buf), await Monnam(magr));
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s is frozen by %s."), P(buf), await mon_nam(mdef));
            }
            paralyze_monst(magr, tmp);
            return mdead | mhit;
          }
          return 1;
        case 3:
          if (((magr.data.mresists | magr.mextrinsics) & 2) !== 0) {
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s is mildly chilly."), await Monnam(magr));
              await golemeffects(magr, AD_COLD, tmp);
            }
            tmp = 0;
            break;
          }
          if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s is suddenly very cold!"), await Monnam(magr));
          }
          mdef.mhp += tmp / 2 | 0;
          if (mdef.mhpmax < mdef.mhp) {
            mdef.mhpmax = mdef.mhp;
          }
          if (mdef.mhpmax > (mdef.m_lev + 1) * 8) {
            await split_mon(mdef, magr);
          }
          break;
        case 12:
          if (!magr.mstun) {
            magr.mstun = 1;
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s %s..."), await Monnam(magr), await makeplural(stagger(magr.data, S("stagger"))));
            }
          }
          tmp = 0;
          break;
        case 2:
          if (((magr.data.mresists | magr.mextrinsics) & 1) !== 0) {
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s is mildly warmed."), await Monnam(magr));
              await golemeffects(magr, AD_FIRE, tmp);
            }
            tmp = 0;
            break;
          }
          if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s is suddenly very hot!"), await Monnam(magr));
          }
          break;
        case 6:
          if (((magr.data.mresists | magr.mextrinsics) & 16) !== 0) {
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
              await pline(S("%s is mildly tingled."), await Monnam(magr));
              await golemeffects(magr, AD_ELEC, tmp);
            }
            tmp = 0;
            break;
          }
          if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s is jolted with electricity!"), await Monnam(magr));
          }
          break;
        default:
          tmp = 0;
          break;
        }
      } else {
        tmp = 0;
      }
    case 1: // assess_dmg
      if ((magr.mhp -= tmp) <= 0) {
        await monkilled(magr, S(""), mddat.mattk[i].adtyp);
        return mdead | mhit | MM_AGR_DIED;
      }
      return mdead | mhit;
    }
    break;
  }
}

export async function xdrainenergym(mon: struct_monst | null, givemsg: number): Promise<void> {
  if (mon.mspec_used < 20 && (attacktype(mon.data, AT_MAGC) || attacktype(mon.data, AT_BREA))) {
    mon.mspec_used += d(2, 2);
    if (givemsg) {
      await pline(S("%s seems lethargic."), await Monnam(mon));
    }
  }
}

export function attk_protection(aatyp: number): number {
  let w_mask = 0;
  switch (aatyp) {
  case 0:
  case 10:
  case 13:
  case 14:
  case 15:
  case 12:
  case 255:
    w_mask = ~0;
    break;
  case 1:
  case 5:
  case 254:
    w_mask = W_ARMG;
    break;
  case 3:
    w_mask = W_ARMF;
    break;
  case 4:
    w_mask = W_ARMH;
    break;
  case 7:
    w_mask = W_ARMC | W_ARMG;
    break;
  case 2:
  case 6:
  case 11:
  case 16:
  default:
    w_mask = 0;
    break;
  }
  return w_mask;
}

export function $init(): void {
  vis = 0;
  far_noise = 0;
  noisetime = 0;
  otmp = null;
  brief_feeling = $cs("have a %s feeling for a moment, then it passes.", 48);
  dieroll = 0;
}
