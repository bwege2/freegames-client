// @ts-nocheck
// NetHack 3.6.7 monmove.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { um_dist } from './apply.ts';
import { artifact_light, has_magic_key, touch_artifact } from './artifact.ts';
import { acurrstr } from './attrib.ts';
import { isok } from './cmd.ts';
import { db_under_typ, is_lava, is_pool } from './dbridge.ts';
import { is_digging, mdig_tunnel, watch_dig } from './dig.ts';
import { newsym, swallowed } from './display.ts';
import { Adjmonnam, Amonnam, Monnam, mon_nam, noname_monnam } from './do_name.ts';
import { cursed_object_at, dog_move, finish_meating } from './dogmove.ts';
import { In_hell, Is_special, on_level } from './dungeon.ts';
import { is_fainted } from './eat.ts';
import { sengr_at, wipe_engr_at } from './engrave.ts';
import { in_rooms, in_town, losehp, may_dig, money_cnt } from './hack.ts';
import { dist2, distmin } from './hacklib.ts';
import { g_at, sobj_at } from './invent.ts';
import { picking_lock } from './lock.ts';
import { set_malign } from './makemon.ts';
import { castmu } from './mcastu.ts';
import { mattackm, mdisplacem } from './mhitm.ts';
import { expels, mattacku } from './mhitu.ts';
import { demon_talk } from './minion.ts';
import { angry_guards, can_carry, curr_mon_load, hideunder, m_respond, max_mon_load, meatmetal, meatobj, mfndpos, mnexto, mondied, mongone, monkilled, monnear, mpickgold, mpickstuff, newcham, unstuck, wake_nearto } from './mon.ts';
import { attacktype, can_track, dmgtype, locomotion, monsndx, noattacks, passes_bars, pronoun_gender, ranged_attk, sticks } from './mondata.ts';
import { lined_up, m_carrying } from './mthrowu.ts';
import { find_defensive, find_misc, find_offensive, searches_for_item, use_defensive, use_misc } from './muse.ts';
import { bare_artifactname, makeplural } from './objnam.ts';
import { Norep, You, You_hear, You_see, pline, verbalize } from './pline.ts';
import { mbodypart } from './polyself.ts';
import { in_your_sanctuary, inhistemple, mon_aligntyp, pri_move } from './priest.ts';
import { quest_stat_check, quest_talk } from './quest.ts';
import { m_in_out_region } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { add_damage, after_shk_move, inhishop, shk_move } from './shk.ts';
import { findgold } from './steal.ts';
import { place_monster } from './steed.ts';
import { rloc, tele_restrict } from './teleport.ts';
import { gettrack } from './track.ts';
import { mintrap, t_at, unconscious } from './trap.ts';
import { gd_move } from './vault.ts';
import { unblock_point } from './vision.ts';
import { mon_wield_item, select_rwep } from './weapon.ts';
import { mwelded } from './wield.ts';
import { cuss, tactics } from './wizard.ts';
import { see_wsegs, worm_known, worm_move, worm_nomove, wormhitu } from './worm.ts';
import { resist } from './zap.ts';
import { struct_monst, struct_nhcoord, struct_permonst } from './structs.ts';
import { $at2, $rd, $sadd, $sarr, $sat, $shr64, $sidx, $ta, $u64, $wr, G, P, S, memset, strchr, strcpy } from './rt/index.ts';
import { AD_CLRC, AD_CORR, AD_DRIN, AD_RUST, AD_SPEL, AGGRAVATE_MONSTER, ALLOW_BARS, ALLOW_DIG, ALLOW_M, ALLOW_MDISP, ALLOW_ROCK, ALLOW_SANCT, ALLOW_SSM, ALLOW_U, ALLOW_WALL, ALTAR, AMULET_CLASS, ARM, ARMOR_CLASS, ARM_CLOAK, ARM_GLOVES, ARM_SHIRT, ARROW, ARTICLE_A, ARTICLE_THE, AT_MAGC, AT_WEAP, BAG_OF_HOLDING, BAG_OF_TRICKS, BALL_CLASS, BLINDED, BLINDFOLD, BOLT_LIM, BOOMERANG, BOULDER, BUSTDOOR, CANDY_BAR, COIN_CLASS, CONFLICT, CONFUSION, CORPSE, CORR, CREDIT_CARD, CRYSKNIFE, DAGGER, DBWALL, DEAF, DETECT_MONSTERS, DISPLACED, DOOR, DRAWBRIDGE_UP, D_BROKEN, D_CLOSED, D_ISOPEN, D_LOCKED, D_NODOOR, D_TRAPPED, D_WARNED, FALSE, FEDORA, FOOD_CLASS, FORTUNE_COOKIE, GEMSTONE, GEM_CLASS, G_GENOD, HALF_SPDAM, HALLUC, HALLUC_RES, HEAD, INFRAVISION, INVIS, IRONBARS, KILLED_BY_AN, LEASH, LEATHER_JACKET, LEMBAS_WAFER, LOCK_PICK, LUMP_OF_ROYAL_JELLY, MAGIC_MARKER, MAGIC_WHISTLE, MINERAL, MM_AGR_DIED, MM_DEF_DIED, MM_HIT, MS_BRIBE, MS_CUSS, MS_SHRIEK, MTSZ, M_AP_FURNITURE, M_AP_OBJECT, NATTK, NEED_AXE, NEED_HTH_WEAPON, NEED_PICK_AXE, NEED_PICK_OR_AXE, NEED_WEAPON, NOGARLIC, NORMAL_SPEED, NOTONL, OILSKIN_SACK, OPENDOOR, PANCAKE, PM_ANGEL, PM_ETTIN, PM_FOG_CLOUD, PM_GELATINOUS_CUBE, PM_JABBERWOCK, PM_LEPRECHAUN, PM_MAIL_DAEMON, PM_MEDUSA, PM_MINOTAUR, PM_STALKER, PM_TENGU, PM_XORN, POTION_CLASS, PROT_FROM_SHAPE_CHANGERS, P_AXE, P_PICK_AXE, RING_CLASS, ROCK, ROCK_CLASS, ROOM, SACK, SCROLL_CLASS, SCR_SCARE_MONSTER, SEE_INVIS, SHOPBASE, SKELETON_KEY, SLING, SPBOOK_CLASS, SQSRCHRADIUS, STEALTH, STETHOSCOPE, STONE, STRAT_ARRIVE, STRAT_CLOSE, STRAT_WAITFORU, STRAT_WAITMASK, S_BAT, S_DOG, S_EEL, S_GHOST, S_HUMAN, S_LEPRECHAUN, S_LIGHT, S_NYMPH, S_UNICORN, S_VAMPIRE, TELEPAT, TIN_OPENER, TIN_WHISTLE, TOOL_CLASS, TOWEL, TREE, TRUE, UNLOCKDOOR, VENOM_CLASS, WAND_CLASS, WARN_OF_MON, WEAPON_CLASS, W_NONDIGGABLE } from './consts.ts';

let practical: any;
let magical: any;
let indigestion: any;
let boulder_class: any;
let gem_class: any;

export async function mb_trapped(mtmp: struct_monst | null): Promise<number> {
  if (G.flags.verbose) {
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && !(G.multi < 0 && (unconscious() || is_fainted()))) {
      await pline(S("KABOOM!!  You see a door explode."));
    } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await You_hear(S("a distant explosion."));
    }
  }
  wake_nearto(mtmp.mx, mtmp.my, 7 * 7);
  mtmp.mstun = 1;
  mtmp.mhp -= rnd(15);
  if (mtmp.mhp < 1) {
    await mondied(mtmp);
    if (!(mtmp.mhp < 1)) {
      return FALSE;
    } else {
      return TRUE;
    }
  }
  return FALSE;
}

export function monhaskey(mon: struct_monst | null, for_unlocking: number): number {
  if (for_unlocking && m_carrying(mon, CREDIT_CARD)) {
    return TRUE;
  }
  return (m_carrying(mon, SKELETON_KEY) || m_carrying(mon, LOCK_PICK) ? 1 : 0) << 24 >> 24;
}

export async function mon_yells(mon: struct_monst | null, shout: Ptr | null): Promise<void> {
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      await pline(S("%s angrily %s %s %s!"), await Amonnam(mon), (mon.data.mflags1 & 24576) >>> 0 === 24576 ? S("shakes") : S("waves"), G.genders[pronoun_gender(mon, 0)].his, (mon.data.mflags1 & 24576) >>> 0 === 24576 ? mbodypart(mon, HEAD) : await makeplural(mbodypart(mon, ARM)));
    }
  } else {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      await pline(S("%s yells:"), await Amonnam(mon));
    } else {
      await You_hear(S("someone yell:"));
    }
    await verbalize(S("%s"), shout);
  }
}

async function watch_on_duty(mtmp: struct_monst | null): Promise<void> {
  let $t1: any;
  const x = new Int32Array(1);
  const y = new Int32Array(1);
  if (mtmp.mpeaceful | 0 && in_town(G.u.ux + G.u.dx, G.u.uy + G.u.dy) && mtmp.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) && !rn2(3)) {
    if (picking_lock(P(x, 0), P(y, 0)) && $at2(G.level.locations, x[0], y[0]).typ === DOOR && ($at2(G.level.locations, x[0], y[0]).flags | 0) & D_LOCKED) {
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
        if (($at2(G.level.locations, x[0], y[0]).flags | 0) & D_WARNED) {
          await mon_yells(mtmp, S("Halt, thief!  You're under arrest!"));
          await angry_guards(!!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0);
        } else {
          await mon_yells(mtmp, S("Hey, stop picking that lock!"));
          ($t1 = $at2(G.level.locations, x[0], y[0]), $t1.flags = (($t1.flags | 0 | D_WARNED) >>> 0) & 31);
        }
        await stop_occupation();
      }
    } else if (is_digging()) {
      await watch_dig(mtmp, G.context.digging.pos.x, G.context.digging.pos.y, FALSE);
    }
  }
}

export async function dochugw(mtmp: struct_monst | null): Promise<number> {
  let x = mtmp.mx;
  let y = mtmp.my;
  let already_saw_mon = (!G.occupation ? 0 : (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0) << 24 >> 24;
  let rd = await dochug(mtmp);
  if (G.occupation && !rd && !G.u.uprops[CONFUSION].intrinsic && (!mtmp.mpeaceful || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && dist2(x, y, G.u.ux, G.u.uy) <= Math.imul(BOLT_LIM + 1, BOLT_LIM + 1) && (!already_saw_mon || !($rd(G.viz_array.a[G.viz_array.o + y], x) & 1) || dist2(x, y, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM + 1, BOLT_LIM + 1)) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) && $rd(G.viz_array.a[G.viz_array.o + y], x) & 1) && mtmp.mcanmove | 0 && !noattacks(mtmp.data) && !onscary(G.u.ux, G.u.uy, mtmp)) {
    await stop_occupation();
  }
  return rd;
}

export function onscary(x: number, y: number, mtmp: struct_monst | null): number {
  if (mtmp.iswiz | 0 || (mtmp.data.mflags2 & 4096) >>> 0 !== 0 && mon_aligntyp(mtmp) === 1 || mtmp.data === $sat(G.mons, PM_ANGEL) || (mtmp.data === $sat(G.mons, 308) || mtmp.data === $sat(G.mons, 310) || mtmp.data === $sat(G.mons, 309)) || mtmp.isshk | 0 && inhishop(mtmp) || mtmp.ispriest | 0 && inhistemple(mtmp)) {
    return FALSE;
  }
  if (x === 0 && y === 0) {
    return TRUE;
  }
  if ($at2(G.level.locations, x, y).typ === ALTAR && (mtmp.data.mlet === S_VAMPIRE || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224))) {
    return TRUE;
  }
  if (sobj_at(SCR_SCARE_MONSTER, x, y)) {
    return TRUE;
  }
  return (sengr_at(S("Elbereth"), x, y, TRUE) && (G.u.ux === x && G.u.uy === y || G.u.uprops[DISPLACED].extrinsic && mtmp.mux === x && mtmp.muy === y) && !(mtmp.isshk | 0 || mtmp.isgd | 0 || !mtmp.mcansee || mtmp.mpeaceful | 0 || mtmp.data.mlet === S_HUMAN || mtmp.data === $sat(G.mons, PM_MINOTAUR) || In_hell(G.u.uz) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) ? 1 : 0) << 24 >> 24;
}

export async function mon_regen(mon: struct_monst | null, digest_meal: number): Promise<void> {
  if (mon.mhp < mon.mhpmax && (G.moves % 20 === 0 || (mon.data.mflags1 & 8388608) >>> 0 !== 0)) {
    ++mon.mhp;
  }
  if (mon.mspec_used) {
    --mon.mspec_used;
  }
  if (digest_meal) {
    if (mon.meating) {
      --mon.meating;
      if (mon.meating <= 0) {
        await finish_meating(mon);
      }
    }
  }
}

function disturb(mtmp: struct_monst | null): number {
  if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 100 && (!((G.u.uprops[STEALTH].intrinsic || G.u.uprops[STEALTH].extrinsic) && !G.u.uprops[STEALTH].blocked) || mtmp.data === $sat(G.mons, PM_ETTIN) && rn2(10)) && (!(mtmp.data.mlet === S_NYMPH || mtmp.data === $sat(G.mons, PM_JABBERWOCK) || mtmp.data.mlet === S_LEPRECHAUN) || !rn2(50)) && (G.u.uprops[AGGRAVATE_MONSTER].intrinsic || G.u.uprops[AGGRAVATE_MONSTER].extrinsic || (mtmp.data.mlet === S_DOG || mtmp.data.mlet === S_HUMAN) || !rn2(7) && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT)) {
    mtmp.msleeping = 0;
    return 1;
  }
  return 0;
}

async function release_hero(mon: struct_monst | null): Promise<void> {
  if (mon === G.u.ustuck) {
    if (G.u.uswallow) {
      await expels(mon, mon.data, TRUE);
    } else if (!sticks(G.youmonst.data)) {
      await unstuck(mon);
      await You(S("get released!"));
    }
  }
}

export async function monflee(mtmp: struct_monst | null, fleetime: number, first: number, fleemsg: number): Promise<void> {
  if (mtmp.mhp < 1) {
    return;
  }
  if (mtmp === G.u.ustuck) {
    await release_hero(mtmp);
  }
  if (!first || !mtmp.mflee) {
    if (!fleetime) {
      mtmp.mfleetim = 0;
    } else if (!mtmp.mflee || mtmp.mfleetim | 0) {
      fleetime += mtmp.mfleetim | 0;
      if (fleetime === 1) {
        ++fleetime;
      }
      mtmp.mfleetim = ((fleetime < 127 ? fleetime : 127) >>> 0) & 127;
    }
    if (!mtmp.mflee && fleemsg && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT) {
      if (!mtmp.mcanmove || !mtmp.data.mmove) {
        await pline(S("%s seems to flinch."), await Adjmonnam(mtmp, S("immobile")));
      } else if (mtmp.data === $sat(G.mons, 39) && (G.uwep && artifact_light(G.uwep) && G.uwep.lamplit | 0)) {
        if (rn2(10) || (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await pline(S("%s flees from the painful light of %s."), await Monnam(mtmp), await bare_artifactname(G.uwep));
        } else {
          await verbalize(S("Bright light!"));
        }
      } else {
        await pline(S("%s turns to flee."), await Monnam(mtmp));
      }
    }
    mtmp.mflee = 1;
  }
  memset(mtmp.mtrack[0], 0, 8);
}

async function distfleeck(mtmp: struct_monst | null, inrange: Ptr | null, nearby: Ptr | null, scared: Ptr | null): Promise<void> {
  let seescaryx = 0;
  let seescaryy = 0;
  let sawscary = FALSE;
  let bravegremlin = (rn2(5) === 0 ? 1 : 0) << 24 >> 24;
  inrange.a[inrange.o] = dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= Math.imul(BOLT_LIM, BOLT_LIM) ? 1 : 0;
  nearby.a[nearby.o] = inrange.a[inrange.o] && monnear(mtmp, mtmp.mux, mtmp.muy) ? 1 : 0;
  if (!mtmp.mcansee || (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0)) {
    seescaryx = mtmp.mux;
    seescaryy = mtmp.muy;
  } else {
    seescaryx = G.u.ux;
    seescaryy = G.u.uy;
  }
  sawscary = onscary(seescaryx, seescaryy, mtmp);
  if (nearby.a[nearby.o] && (sawscary || mtmp.data === $sat(G.mons, 39) && (G.uwep && artifact_light(G.uwep) && G.uwep.lamplit | 0) && !bravegremlin || !mtmp.mpeaceful && in_your_sanctuary(mtmp, 0, 0))) {
    scared.a[scared.o] = 1;
    await monflee(mtmp, rnd(rn2(7) ? 10 : 100), TRUE, TRUE);
  } else {
    scared.a[scared.o] = 0;
  }
}

function m_arrival(mon: struct_monst | null): number {
  mon.mstrategy = (mon.mstrategy & ~STRAT_ARRIVE >>> 0) >>> 0;
  return -1;
}

export async function dochug(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let mdat = null;
  let tmp = 0;
  let inrange = new Int32Array(1);
  let nearby = new Int32Array(1);
  let scared = new Int32Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      tmp = 0;
      mdat = mtmp.data;
      if ((mtmp.mstrategy & STRAT_ARRIVE) >>> 0) {
        let res = m_arrival(mtmp);
        if (res >= 0) {
          return res;
        }
      }
      if ((mtmp.mstrategy & STRAT_WAITFORU) >>> 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 || mtmp.mhp < mtmp.mhpmax)) {
        mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
      }
      quest_stat_check(mtmp);
      if (!mtmp.mcanmove || (mtmp.mstrategy & STRAT_WAITMASK) >>> 0) {
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          await newsym(mtmp.mx, mtmp.my);
        }
        if (mtmp.mcanmove | 0 && (mtmp.mstrategy & STRAT_CLOSE) >>> 0 && !mtmp.msleeping && monnear(mtmp, G.u.ux, G.u.uy)) {
          await quest_talk(mtmp);
        }
        return 0;
      }
      if (mtmp.msleeping | 0 && !disturb(mtmp)) {
        if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          await newsym(mtmp.mx, mtmp.my);
        }
        return 0;
      }
      await wipe_engr_at(mtmp.mx, mtmp.my, 1, FALSE);
      if (mtmp.mconf | 0 && !rn2(50)) {
        mtmp.mconf = 0;
      }
      if (mtmp.mstun | 0 && !rn2(10)) {
        mtmp.mstun = 0;
      }
      if (mtmp.mflee | 0 && !rn2(40) && (mdat.mflags1 & 33554432) >>> 0 !== 0 && !mtmp.iswiz && !G.level.flags.noteleport) {
        await rloc(mtmp, TRUE);
        return 0;
      }
      if (mdat.msound === MS_SHRIEK && !um_dist(mtmp.mx, mtmp.my, 1)) {
        await m_respond(mtmp);
      }
      if (mdat === $sat(G.mons, PM_MEDUSA) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
        await m_respond(mtmp);
      }
      if (mtmp.mhp < 1) {
        return 1;
      }
      if (mtmp.mflee | 0 && !mtmp.mfleetim && mtmp.mhp === mtmp.mhpmax && !rn2(25)) {
        mtmp.mflee = 0;
      }
      if (mtmp === G.u.ustuck && mtmp.mpeaceful | 0 && !mtmp.mconf && !(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic)) {
        await release_hero(mtmp);
        return 0;
      }
      set_apparxy(mtmp);
      if (mdat.mflags3 & 31) {
        await tactics(mtmp);
      }
      await distfleeck(mtmp, P(inrange, 0), P(nearby, 0), P(scared, 0));
      if (await find_defensive(mtmp)) {
        if (await use_defensive(mtmp) !== 0) {
          return 1;
        }
      } else if (await find_misc(mtmp)) {
        if (await use_misc(mtmp) !== 0) {
          return 1;
        }
      }
      if (nearby[0] && mdat.msound === MS_BRIBE && mtmp.mpeaceful | 0 && !mtmp.mtame && !G.u.uswallow) {
        if (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy) {
          await pline(S("%s whispers at thin air."), $rd(G.viz_array.a[G.viz_array.o + mtmp.muy], mtmp.mux) & 2 ? await Monnam(mtmp) : S("It"));
          if ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0) {
            if (!await tele_restrict(mtmp)) {
              await rloc(mtmp, TRUE);
            }
          } else {
            mtmp.minvis = (mtmp.perminvis = 0) & 1;
            await pline(S("%s gets angry!"), await Amonnam(mtmp));
            mtmp.mpeaceful = 0;
            set_malign(mtmp);
          }
        } else if (await demon_talk(mtmp)) {
          return 1;
        }
      }
      if (mdat === $sat(G.mons, 278) || mdat === $sat(G.mons, 279)) {
        await watch_on_duty(mtmp);
      } else if ((mdat === $sat(G.mons, 47) || mdat === $sat(G.mons, 48)) && !rn2(20)) {
        let m2 = null;
        let nmon = null;
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s concentrates."), await Monnam(mtmp));
        }
        if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM, BOLT_LIM)) {
          await You(S("sense a faint wave of psychic energy."));
          { $g = 1; continue $L; }
        }
        await pline(S("A wave of psychic energy pours over you!"));
        if (mtmp.mpeaceful | 0 && (!(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) || await resist(mtmp, RING_CLASS, 0, 0))) {
          await pline(S("It feels quite soothing."));
        } else if (!G.u.uinvulnerable) {
          let m_sen = (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data) ? 1 : 0) << 24 >> 24;
          if (m_sen || (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) && rn2(2) || !rn2(10)) {
            let dmg = 0;
            await pline(S("It locks on to your %s!"), m_sen ? S("telepathy") : G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic ? S("latent telepathy") : S("mind"));
            dmg = rnd(15);
            if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
              dmg = (dmg + 1) / 2 | 0;
            }
            await losehp(dmg, S("psychic blast"), KILLED_BY_AN);
          }
        }
        for (m2 = G.level.monlist; m2; m2 = nmon) {
          nmon = m2.nmon;
          if (m2.mhp < 1) {
            continue;
          }
          if ((m2.mpeaceful | 0) === (mtmp.mpeaceful | 0)) {
            continue;
          }
          if ((m2.data.mflags1 & 65536) >>> 0 !== 0) {
            continue;
          }
          if (m2 === mtmp) {
            continue;
          }
          if ((m2.data === $sat(G.mons, 28) || m2.data === $sat(G.mons, 47) || m2.data === $sat(G.mons, 48)) && (rn2(2) || m2.mblinded | 0) || !rn2(10)) {
            if ($rd(G.viz_array.a[G.viz_array.o + m2.my], m2.mx) & 2) {
              await pline(S("It locks on to %s."), await mon_nam(m2));
            }
            m2.mhp -= rnd(15);
            if (m2.mhp < 1) {
              await monkilled(m2, S(""), AD_DRIN);
            } else {
              m2.msleeping = 0;
            }
          }
        }
      }
    case 1: // toofar
      if ((!mtmp.mpeaceful || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic)) && inrange[0] && dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= 8 && attacktype(mdat, AT_WEAP)) {
        let mw_tmp = null;
        mw_tmp = mtmp.mw;
        if (!(scared[0] && mw_tmp && ((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_PICK_AXE)) && mtmp.weapon_check === NEED_WEAPON && !(mtmp.mtrapped | 0 && !nearby[0] && await select_rwep(mtmp))) {
          mtmp.weapon_check = NEED_HTH_WEAPON;
          if (await mon_wield_item(mtmp) !== 0) {
            return 0;
          }
        }
      }
      if (!nearby[0] || mtmp.mflee | 0 || scared[0] || mtmp.mconf | 0 || mtmp.mstun | 0 || mtmp.minvis | 0 && !rn2(3) || mdat.mlet === S_LEPRECHAUN && !findgold(G.invent) && (findgold(mtmp.minvent) || rn2(2)) || (mdat.mflags2 & 8388608) >>> 0 !== 0 && !rn2(4) || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !mtmp.iswiz || !mtmp.mcansee && !rn2(4) || mtmp.mpeaceful | 0) {
        if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 49 && !mtmp.mspec_used) {
          let a = null;
          for (a = mdat.mattk[0]; $sidx(a) < $sidx($sat(mdat.mattk, NATTK)); a = $sadd(a, 1)) {
            if (a.aatyp === AT_MAGC && (a.adtyp === AD_SPEL || a.adtyp === AD_CLRC)) {
              if (await castmu(mtmp, a, FALSE, FALSE)) {
                tmp = 3;
                break;
              }
            }
          }
        }
        tmp = await m_move(mtmp, 0);
        if (tmp !== 2) {
          await distfleeck(mtmp, P(inrange, 0), P(nearby, 0), P(scared, 0));
        }
        switch (tmp) {
        case 0:
        case 3:
          if (mtmp.isgd | 0 && (mtmp.mhp < 1 || mtmp.mx === 0)) {
            return 1;
          }
          if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
            await newsym(mtmp.mx, mtmp.my);
          }
          break;
        case 1:
          if (mtmp.msleeping | 0 || !mtmp.mcanmove) {
            return 0;
          }
          if (!nearby[0] && (ranged_attk(mdat) || await find_offensive(mtmp))) {
            break;
          }
          if (mtmp === G.u.ustuck) {
            if (G.u.uswallow) {
              return await mattacku(mtmp);
            }
            if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
              await unstuck(mtmp);
            }
          }
          return 0;
        case 2:
          return 1;
        }
      }
      if (!mtmp.mpeaceful || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !await resist(mtmp, RING_CLASS, 0, 0)) {
        if (inrange[0] && !noattacks(mdat) && (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) > 0 && !scared[0] && tmp !== 3) {
          if (await mattacku(mtmp)) {
            return 1;
          }
        }
        if (mtmp.wormno) {
          await wormhitu(mtmp);
        }
      }
      if (!mtmp.msleeping && mtmp.mcanmove | 0 && nearby[0]) {
        await quest_talk(mtmp);
      }
      if (inrange[0] && mtmp.data.msound === MS_CUSS && !mtmp.mpeaceful && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && !mtmp.minvis && !rn2(5)) {
        await cuss(mtmp);
      }
      return tmp === 2 ? 1 : 0;
    }
    break;
  }
}

export async function itsstuck(mtmp: struct_monst | null): Promise<number> {
  if (sticks(G.youmonst.data) && mtmp === G.u.ustuck && !G.u.uswallow) {
    await pline(S("%s cannot escape from you!"), await Monnam(mtmp));
    return TRUE;
  }
  return FALSE;
}

export function should_displace(mtmp: struct_monst | null, poss: struct_nhcoord | null, info: Ptr | null, cnt: number, gx: number, gy: number): number {
  let shortest_with_displacing = -1;
  let shortest_without_displacing = -1;
  let count_without_displacing = 0;
  let i = 0;
  let nx = 0;
  let ny = 0;
  let ndist = 0;
  for (i = 0; i < cnt; ++i) {
    nx = $sadd(poss, i).x;
    ny = $sadd(poss, i).y;
    ndist = dist2(nx, ny, gx, gy);
    if (!!G.level.monsters[nx][ny] && info.a[info.o + i] & ALLOW_MDISP && !(info.a[info.o + i] & ALLOW_M) && !undesirable_disp(mtmp, nx, ny)) {
      if (shortest_with_displacing === -1 || ndist < shortest_with_displacing) {
        shortest_with_displacing = ndist;
      }
    } else {
      if (shortest_without_displacing === -1 || ndist < shortest_without_displacing) {
        shortest_without_displacing = ndist;
      }
      ++count_without_displacing;
    }
  }
  if (shortest_with_displacing > -1 && (shortest_with_displacing < shortest_without_displacing || !count_without_displacing)) {
    return TRUE;
  }
  return FALSE;
}

export async function m_digweapon_check(mtmp: struct_monst | null, nix: number, niy: number): Promise<number> {
  let can_tunnel = 0;
  let mw_tmp = mtmp.mw;
  if (!((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
    can_tunnel = ((mtmp.data.mflags1 & 32) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  }
  if (can_tunnel && (mtmp.data.mflags1 & 64) >>> 0 !== 0 && !mwelded(mw_tmp) && (may_dig(nix, niy) || closed_door(nix, niy))) {
    if (closed_door(nix, niy)) {
      if (!mw_tmp || !((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_PICK_AXE) || !((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_AXE)) {
        mtmp.weapon_check = NEED_PICK_OR_AXE;
      }
    } else if ($at2(G.level.locations, nix, niy).typ === TREE || G.level.flags.arboreal | 0 && $at2(G.level.locations, nix, niy).typ === STONE) {
      if (!(mw_tmp = mtmp.mw) || !((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_AXE)) {
        mtmp.weapon_check = NEED_AXE;
      }
    } else if ($at2(G.level.locations, nix, niy).typ <= DBWALL) {
      if (!(mw_tmp = mtmp.mw) || !((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_PICK_AXE)) {
        mtmp.weapon_check = NEED_PICK_AXE;
      }
    }
    if (mtmp.weapon_check >= NEED_PICK_AXE && await mon_wield_item(mtmp)) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function m_move(mtmp: struct_monst | null, after: number): Promise<number> {
  let $g = 0;
  let appr = 0;
  let gx = 0;
  let gy = 0;
  let nix = 0;
  let niy = 0;
  let chcnt = 0;
  let chi = 0;
  let likegold = 0;
  let likegems = 0;
  let likeobjs = 0;
  let likemagic = 0;
  let conceals = 0;
  let likerock = 0;
  let can_tunnel = 0;
  let can_open = 0;
  let can_unlock = 0;
  let doorbuster = 0;
  let uses_items = 0;
  let setlikes = 0;
  let avoid = 0;
  let better_with_displacing = 0;
  let sawmon = 0;
  let ptr = null;
  let mtoo = null;
  let mmoved = 0;
  let info = new Float64Array(9);
  let flag = 0;
  let omx = 0;
  let omy = 0;
  let minr = 0;
  let otmp = null;
  let xx = 0;
  let yy = 0;
  let oomx = 0;
  let oomy = 0;
  let lmx = 0;
  let lmy = 0;
  let i$2 = 0;
  let j = 0;
  let nx = 0;
  let ny = 0;
  let nearer = 0;
  let jcnt = 0;
  let cnt = 0;
  let ndist = 0;
  let nidist = 0;
  let mtrk = null;
  let poss = $sarr(struct_nhcoord, 9);
  $L: for (;;) {
    switch ($g) {
    case 0:
      likegold = 0;
      likegems = 0;
      likeobjs = 0;
      likemagic = 0;
      conceals = 0;
      likerock = 0;
      can_tunnel = 0;
      can_open = 0;
      can_unlock = 0;
      doorbuster = 0;
      uses_items = 0;
      setlikes = 0;
      avoid = FALSE;
      better_with_displacing = FALSE;
      sawmon = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0) << 24 >> 24;
      mmoved = 0;
      info = new Float64Array(9);
      omx = mtmp.mx;
      omy = mtmp.my;
      if (mtmp.mtrapped) {
        let i = await mintrap(mtmp);
        if (i >= 2) {
          await newsym(mtmp.mx, mtmp.my);
          return 2;
        }
        if (i === 1) {
          return 0;
        }
      }
      ptr = mtmp.data;
      if (mtmp.meating) {
        --mtmp.meating;
        if (mtmp.meating <= 0) {
          await finish_meating(mtmp);
        }
        return 3;
      }
      if ((ptr.mflags1 & 128) >>> 0 !== 0 && !!G.level.objects[mtmp.mx][mtmp.my] && rn2(10)) {
        return 0;
      }
      set_apparxy(mtmp);
      if (!((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
        can_tunnel = ((ptr.mflags1 & 32) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      }
      can_open = (!((ptr.mflags1 & 8192) >>> 0 !== 0 || ptr.msize < 1) ? 1 : 0) << 24 >> 24;
      can_unlock = (can_open && monhaskey(mtmp, TRUE) || mtmp.iswiz | 0 || (ptr === $sat(G.mons, 308) || ptr === $sat(G.mons, 310) || ptr === $sat(G.mons, 309)) ? 1 : 0) << 24 >> 24;
      doorbuster = ((ptr.mflags2 & 8192) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      if (mtmp.wormno) {
        { $g = 1; continue $L; }
      }
      if (mtmp.mtame) {
        mmoved = await dog_move(mtmp, after) << 24 >> 24;
        { $g = 2; continue $L; }
      }
      if (mtmp.isshk) {
        mmoved = await shk_move(mtmp) << 24 >> 24;
        if (mmoved === -2) {
          return 2;
        }
        if (mmoved >= 0) {
          { $g = 2; continue $L; }
        }
        mmoved = 0;
      }
      if (mtmp.isgd) {
        mmoved = await gd_move(mtmp) << 24 >> 24;
        if (mmoved === -2) {
          return 2;
        }
        if (mmoved >= 0) {
          { $g = 2; continue $L; }
        }
        mmoved = 0;
      }
      if (ptr.mflags3 & 31) {
        let tx = $shr64((mtmp.mstrategy & 16711680) >>> 0, 16) << 24 >> 24;
        let ty = $shr64((mtmp.mstrategy & 65280) >>> 0, 8) << 24 >> 24;
        let intruder = !!G.level.monsters[tx][ty] ? G.level.monsters[tx][ty] : null;
        if (dist2(mtmp.mx, mtmp.my, tx, ty) < 2 && intruder && intruder !== mtmp) {
          G.notonhead = (intruder.mx !== tx || intruder.my !== ty ? 1 : 0) << 24 >> 24;
          if (await mattackm(mtmp, intruder) === 2) {
            return 2;
          }
          mmoved = 1;
        } else {
          mmoved = 0;
        }
        { $g = 2; continue $L; }
      }
      if (mtmp.ispriest) {
        mmoved = await pri_move(mtmp) << 24 >> 24;
        if (mmoved === -2) {
          return 2;
        }
        if (mmoved >= 0) {
          { $g = 2; continue $L; }
        }
        mmoved = 0;
      }
      if (ptr === $sat(G.mons, PM_MAIL_DAEMON)) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
          await verbalize(S("I'm late!"));
        }
        await mongone(mtmp);
        return 2;
      }
      if (ptr === $sat(G.mons, PM_TENGU) && !rn2(5) && !mtmp.mcan && !await tele_restrict(mtmp)) {
        if (mtmp.mhp < 7 || mtmp.mpeaceful | 0 || rn2(2)) {
          await rloc(mtmp, TRUE);
        } else {
          await mnexto(mtmp);
        }
        mmoved = 1;
        { $g = 2; continue $L; }
      }
    case 1: // not_special
      if (G.u.uswallow | 0 && !mtmp.mflee && G.u.ustuck !== mtmp) {
        return 1;
      }
      omx = mtmp.mx;
      omy = mtmp.my;
      gx = mtmp.mux;
      gy = mtmp.muy;
      appr = mtmp.mflee | 0 ? -1 : 1;
      if (mtmp.mconf | 0 || G.u.uswallow | 0 && mtmp === G.u.ustuck) {
        appr = 0;
      } else {
        let lepgold = null;
        let ygold = null;
        let should_see = ($rd(G.viz_array.a[G.viz_array.o + omy], omx) & 1 && ($at2(G.level.locations, gx, gy).lit | 0 || !$at2(G.level.locations, omx, omy).lit) && dist2(omx, omy, gx, gy) <= 36 ? 1 : 0) << 24 >> 24;
        if (!mtmp.mcansee || should_see && ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) && !((ptr.mflags1 & 16777216) >>> 0 !== 0) && rn2(11) || (G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance === 0 || G.u.uundetected | 0 || (G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance === 411 && !((ptr.mflags2 & 268435456) >>> 0 !== 0) || mtmp.mpeaceful | 0 && !mtmp.isshk || (await monsndx(ptr) === PM_STALKER || ptr.mlet === S_BAT || ptr.mlet === S_LIGHT) && !rn2(3)) {
          appr = 0;
        }
        if (await monsndx(ptr) === PM_LEPRECHAUN && appr === 1 && ((lepgold = findgold(mtmp.minvent)) && lepgold.quan > ((ygold = findgold(G.invent)) ? ygold.quan : 0))) {
          appr = -1;
        }
        if (!should_see && can_track(ptr)) {
          let cp = null;
          cp = gettrack(omx, omy);
          if (cp) {
            gx = cp.x;
            gy = cp.y;
          }
        }
      }
      if ((!mtmp.mpeaceful || !rn2(10)) && !((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
        let in_line = (lined_up(mtmp) && distmin(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= ((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0 ? 20 : (acurrstr() / 2 | 0) + 1) ? 1 : 0) << 24 >> 24;
        if (appr !== 1 || !in_line) {
          let pctload = curr_mon_load(mtmp) * 100 / max_mon_load(mtmp) | 0;
          likegold = ((ptr.mflags2 & 268435456) >>> 0 !== 0 && pctload < 95 ? 1 : 0) << 24 >> 24;
          likegems = ((ptr.mflags2 & 536870912) >>> 0 !== 0 && pctload < 85 ? 1 : 0) << 24 >> 24;
          uses_items = (!((ptr.mflags1 & 65536) >>> 0 !== 0) && !((ptr.mflags1 & 262144) >>> 0 !== 0) && pctload < 75 ? 1 : 0) << 24 >> 24;
          likeobjs = (((ptr.mflags2 & 1073741824) >>> 0 !== 0 || attacktype(ptr, 254)) && pctload < 75 ? 1 : 0) << 24 >> 24;
          likemagic = ((ptr.mflags2 & 2147483648) >>> 0 !== 0 && pctload < 85 ? 1 : 0) << 24 >> 24;
          likerock = ((ptr.mflags2 & 134217728) >>> 0 !== 0 && pctload < 50 && !G.level.flags.sokoban_rules ? 1 : 0) << 24 >> 24;
          conceals = ((ptr.mflags1 & 128) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
          setlikes = TRUE;
        }
      }
      minr = SQSRCHRADIUS;
      if (distmin(mtmp.mux, mtmp.muy, omx, omy) < SQSRCHRADIUS && !mtmp.mpeaceful) {
        --minr;
      }
      if (!mtmp.mpeaceful && (ptr.mflags2 & 512) >>> 0 !== 0) {
        minr = 1;
      }
      if (!((likegold || likegems || likeobjs || likemagic || likerock || conceals) && (!$rd(in_rooms(omx, omy, SHOPBASE)) || !rn2(25) && !mtmp.isshk))) { $g = 6; continue $L; }
    case 3: // look_for_obj
      oomx = 80 - 1 < omx + minr ? 80 - 1 : omx + minr;
      oomy = 21 - 1 < omy + minr ? 21 - 1 : omy + minr;
      lmx = 1 > omx - minr ? 1 : omx - minr;
      lmy = 0 > omy - minr ? 0 : omy - minr;
      for (otmp = G.level.objlist; otmp; otmp = otmp.nobj) {
        if (otmp.otyp === ROCK) {
          continue;
        }
        xx = otmp.ox;
        yy = otmp.oy;
        if (xx >= lmx && xx <= oomx && yy >= lmy && yy <= oomy) {
          if (!!(mtoo = !!G.level.monsters[xx][yy] ? G.level.monsters[xx][yy] : null) && (mtoo.msleeping | 0 || mtoo.mundetected | 0 || mtoo.mappearance && !mtoo.iswiz || !mtoo.data.mmove)) {
            continue;
          }
          if (is_pool(xx, yy) && !((ptr.mflags1 & 2) >>> 0 !== 0) || is_lava(xx, yy) && !(ptr === $sat(G.mons, 152) || ptr === $sat(G.mons, 326))) {
            continue;
          }
          if ((likegold && otmp.oclass === COIN_CLASS || likeobjs && strchr(P(practical), otmp.oclass) && (otmp.otyp !== CORPSE || ptr.mlet === S_NYMPH && !($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309))) || likemagic && strchr(P(magical), otmp.oclass) || uses_items && await searches_for_item(mtmp, otmp) || likerock && otmp.otyp === BOULDER || likegems && otmp.oclass === GEM_CLASS && (G.objects[otmp.otyp].oc_material | 0) !== MINERAL || conceals && !($rd(G.viz_array.a[G.viz_array.o + otmp.oy], otmp.ox) & 2) || ptr === $sat(G.mons, PM_GELATINOUS_CUBE) && !strchr(P(indigestion), otmp.oclass) && !(otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)))) && await touch_artifact(otmp, mtmp)) {
            if (can_carry(mtmp, otmp) > 0 && ((ptr.mflags2 & 134217728) >>> 0 !== 0 || !sobj_at(BOULDER, xx, yy)) && (!(ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0) || (G.objects[otmp.otyp].oc_material | 0) === GEMSTONE) && !onscary(xx, yy, mtmp)) {
              minr = distmin(omx, omy, xx, yy);
              oomx = 80 - 1 < omx + minr ? 80 - 1 : omx + minr;
              oomy = 21 - 1 < omy + minr ? 21 - 1 : omy + minr;
              lmx = 1 > omx - minr ? 1 : omx - minr;
              lmy = 0 > omy - minr ? 0 : omy - minr;
              gx = otmp.ox;
              gy = otmp.oy;
              if (gx === omx && gy === omy) {
                mmoved = 3;
                { $g = 2; continue $L; }
              }
            }
          }
        }
      }
      { $g = 5; continue $L; }
    case 6:
      if (likegold) {
        uses_items = 0;
        likegems = likeobjs = likemagic = likerock = conceals = 0;
        { $g = 3; continue $L; }
      }
    case 5:
      if (minr < SQSRCHRADIUS && appr === -1) {
        if (distmin(omx, omy, mtmp.mux, mtmp.muy) <= 3) {
          gx = mtmp.mux;
          gy = mtmp.muy;
        } else {
          appr = 1;
        }
      }
      if (can_tunnel && (ptr.mflags1 & 64) >>> 0 !== 0 && ((!mtmp.mpeaceful || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic)) && dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= 8)) {
        can_tunnel = FALSE;
      }
      nix = omx << 24 >> 24;
      niy = omy << 24 >> 24;
      flag = 0;
      if (mtmp.mpeaceful | 0 && (!(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) || await resist(mtmp, RING_CLASS, 0, 0))) {
        flag = flag | (ALLOW_SANCT | ALLOW_SSM);
      } else {
        flag = flag | ALLOW_U;
      }
      if ((ptr.mflags2 & 4096) >>> 0 !== 0 || (ptr === $sat(G.mons, 308) || ptr === $sat(G.mons, 310) || ptr === $sat(G.mons, 309))) {
        flag = flag | ALLOW_SANCT;
      }
      if (ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0 && !G.level.flags.noteleport) {
        flag = flag | NOTONL;
      }
      if ((ptr.mflags1 & 8) >>> 0 !== 0) {
        flag = flag | (ALLOW_WALL | ALLOW_ROCK);
      }
      if (passes_bars(ptr)) {
        flag = flag | ALLOW_BARS;
      }
      if (can_tunnel) {
        flag = flag | ALLOW_DIG;
      }
      if ((ptr.mflags2 & 8) >>> 0 !== 0 || ptr === $sat(G.mons, PM_MINOTAUR)) {
        flag = flag | ALLOW_SSM;
      }
      if ((ptr.mflags2 & 2) >>> 0 !== 0 && ptr.mlet !== S_GHOST || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) {
        flag = ($u64(flag) | NOGARLIC) >>> 0;
      }
      if ((ptr.mflags2 & 134217728) >>> 0 !== 0) {
        flag = flag | ALLOW_ROCK;
      }
      if (can_open) {
        flag = flag | OPENDOOR;
      }
      if (can_unlock) {
        flag = flag | UNLOCKDOOR;
      }
      if (doorbuster) {
        flag = flag | BUSTDOOR;
      }
      poss = $sarr(struct_nhcoord, 9);
      cnt = await mfndpos(mtmp, poss[0], P(info), flag);
      chcnt = 0;
      jcnt = 4 < cnt - 1 ? 4 : cnt - 1;
      chi = -1;
      nidist = dist2(nix, niy, gx, gy);
      if (!mtmp.mpeaceful && G.level.flags.shortsighted | 0 && nidist > ($rd(G.viz_array.a[G.viz_array.o + niy], nix) & 1 ? 144 : 36) && appr === 1) {
        appr = 0;
      }
      if (ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0 && G.level.flags.noteleport | 0) {
        for (i$2 = 0; i$2 < cnt; ++i$2) {
          if (!(info[i$2] & NOTONL)) {
            avoid = TRUE;
          }
        }
      }
      better_with_displacing = should_displace(mtmp, poss[0], P(info), cnt, gx, gy);
      i$2 = 0;
    case 7:
      if (!(i$2 < cnt)) { $g = 9; continue $L; }
      if (avoid && info[i$2] & NOTONL) {
        { $g = 8; continue $L; };
      }
      nx = poss[i$2].x;
      ny = poss[i$2].y;
      if (!!G.level.monsters[nx][ny] && info[i$2] & ALLOW_MDISP && !(info[i$2] & ALLOW_M) && !better_with_displacing) {
        { $g = 8; continue $L; };
      }
      if (appr !== 0) {
        mtrk = mtmp.mtrack[0];
        for (j = 0; j < jcnt; mtrk = $sadd(mtrk, 1), ++j) {
          if (nx === mtrk.x && ny === mtrk.y) {
            if (rn2(4 * (cnt - j))) {
              { $g = 4; continue $L; }
            }
          }
        }
      }
      nearer = (ndist = dist2(nx, ny, gx, gy)) < nidist ? 1 : 0;
      if (appr === 1 && nearer || appr === -1 && !nearer || !appr && !rn2(chcnt = chcnt + 1 << 24 >> 24) || !mmoved) {
        nix = nx << 24 >> 24;
        niy = ny << 24 >> 24;
        nidist = ndist;
        chi = i$2;
        mmoved = 1;
      }
    case 4: // nxti
      ;
    case 8:
      ++i$2;
      { $g = 7; continue $L; }
    case 9:
      if (mmoved) {
        let j = 0;
        if (mmoved === 1 && (G.u.ux !== nix || G.u.uy !== niy) && await itsstuck(mtmp)) {
          return 3;
        }
        if (mmoved === 1 && await m_digweapon_check(mtmp, nix, niy)) {
          return 3;
        }
        if (info[chi] & ALLOW_U) {
          nix = mtmp.mux;
          niy = mtmp.muy;
        }
        if (nix === G.u.ux && niy === G.u.uy) {
          mtmp.mux = G.u.ux;
          mtmp.muy = G.u.uy;
          return 0;
        }
        if (info[chi] & ALLOW_M || nix === mtmp.mux && niy === mtmp.muy) {
          let mtmp2 = null;
          let mstatus = 0;
          mtmp2 = !!G.level.monsters[nix][niy] ? G.level.monsters[nix][niy] : null;
          G.notonhead = (mtmp2 && (nix !== mtmp2.mx || niy !== mtmp2.my) ? 1 : 0) << 24 >> 24;
          mstatus = await mattackm(mtmp, mtmp2);
          if (mstatus & MM_AGR_DIED) {
            return 2;
          }
          if (mstatus & MM_HIT && !(mstatus & MM_DEF_DIED) && rn2(4) && mtmp2.movement >= NORMAL_SPEED) {
            mtmp2.movement = mtmp2.movement - NORMAL_SPEED << 16 >> 16;
            G.notonhead = 0;
            mstatus = await mattackm(mtmp2, mtmp);
            if (mstatus & MM_DEF_DIED) {
              return 2;
            }
          }
          return 3;
        }
        if (info[chi] & ALLOW_MDISP) {
          let mtmp2 = null;
          let mstatus = 0;
          mtmp2 = !!G.level.monsters[nix][niy] ? G.level.monsters[nix][niy] : null;
          mstatus = await mdisplacem(mtmp, mtmp2, FALSE);
          if (mstatus & MM_AGR_DIED || mstatus & MM_DEF_DIED) {
            return 2;
          }
          if (mstatus & MM_HIT) {
            return 1;
          }
          return 3;
        }
        if (!await m_in_out_region(mtmp, nix, niy)) {
          return 3;
        }
        G.level.monsters[omx][omy] = null;
        await place_monster(mtmp, nix, niy);
        for (j = MTSZ - 1; j > 0; --j) {
          mtmp.mtrack[j].$cp(mtmp.mtrack[j - 1]);
        }
        mtmp.mtrack[0].x = omx << 24 >> 24;
        mtmp.mtrack[0].y = omy << 24 >> 24;
        if (mtmp.wormno) {
          await worm_move(mtmp);
        }
      } else {
        if (ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0 && rn2(2) && !await tele_restrict(mtmp)) {
          await rloc(mtmp, TRUE);
          return 1;
        }
        if (mtmp.wormno) {
          await worm_nomove(mtmp);
        }
      }
    case 2: // postmov
      if (mmoved === 1 || mmoved === 3) {
        let canseeit = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) << 24 >> 24;
        if (mmoved === 1) {
          nix = mtmp.mx, niy = mtmp.my;
          if ((mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) && !((mtmp.data.mflags1 & 4) >>> 0 !== 0) && $at2(G.level.locations, nix, niy).typ === DOOR && (($at2(G.level.locations, nix, niy).flags | 0) & (D_LOCKED | D_CLOSED)) !== 0 && can_fog(mtmp)) {
            if (sawmon) {
              G.level.monsters[nix][niy] = null;
              await place_monster(mtmp, omx, omy);
              await newsym(nix, niy), await newsym(omx, omy);
            }
            if (await vamp_shift(mtmp, $sat(G.mons, PM_FOG_CLOUD), sawmon)) {
              ptr = mtmp.data;
            }
            if (sawmon) {
              G.level.monsters[omx][omy] = null;
              await place_monster(mtmp, nix, niy);
              await newsym(omx, omy), await newsym(nix, niy);
            }
          }
          await newsym(omx, omy);
          if (await mintrap(mtmp) >= 2) {
            if (mtmp.mx) {
              await newsym(mtmp.mx, mtmp.my);
            }
            return 2;
          }
          ptr = mtmp.data;
          if ($at2(G.level.locations, mtmp.mx, mtmp.my).typ === DOOR && !((ptr.mflags1 & 8) >>> 0 !== 0) && !can_tunnel) {
            let here = $sat(G.level.locations[mtmp.mx], mtmp.my);
            let btrapped = (((here.flags | 0) & D_TRAPPED) !== 0 ? 1 : 0) << 24 >> 24;
            let observeit = (canseeit && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? 1 : 0) << 24 >> 24;
            if (btrapped && has_magic_key(mtmp)) {
              here.flags = (((here.flags | 0) & ~D_TRAPPED) >>> 0) & 31;
              btrapped = FALSE;
            }
            if (((here.flags | 0) & (D_LOCKED | D_CLOSED)) !== 0 && (ptr.mflags1 & 4) >>> 0 !== 0) {
              if (G.flags.verbose && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
                await pline(S("%s %s under the door."), await Monnam(mtmp), ptr === $sat(G.mons, PM_FOG_CLOUD) || ptr.mlet === S_LIGHT ? S("flows") : S("oozes"));
              }
            } else if ((here.flags | 0) & D_LOCKED && can_unlock) {
              if (btrapped) {
                here.flags = (D_NODOOR) & 31;
                await newsym(mtmp.mx, mtmp.my);
                unblock_point(mtmp.mx, mtmp.my);
                if (await mb_trapped(mtmp)) {
                  return 2;
                }
              } else {
                if (G.flags.verbose) {
                  if (observeit) {
                    await pline(S("%s unlocks and opens a door."), await Monnam(mtmp));
                  } else if (canseeit) {
                    await You_see(S("a door unlock and open."));
                  } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
                    await You_hear(S("a door unlock and open."));
                  }
                }
                here.flags = (D_ISOPEN) & 31;
                unblock_point(mtmp.mx, mtmp.my);
              }
            } else if ((here.flags | 0) === D_CLOSED && can_open) {
              if (btrapped) {
                here.flags = (D_NODOOR) & 31;
                await newsym(mtmp.mx, mtmp.my);
                unblock_point(mtmp.mx, mtmp.my);
                if (await mb_trapped(mtmp)) {
                  return 2;
                }
              } else {
                if (G.flags.verbose) {
                  if (observeit) {
                    await pline(S("%s opens a door."), await Monnam(mtmp));
                  } else if (canseeit) {
                    await You_see(S("a door open."));
                  } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
                    await You_hear(S("a door open."));
                  }
                }
                here.flags = (D_ISOPEN) & 31;
                unblock_point(mtmp.mx, mtmp.my);
              }
            } else if ((here.flags | 0) & (D_LOCKED | D_CLOSED)) {
              if (btrapped) {
                here.flags = (D_NODOOR) & 31;
                await newsym(mtmp.mx, mtmp.my);
                unblock_point(mtmp.mx, mtmp.my);
                if (await mb_trapped(mtmp)) {
                  return 2;
                }
              } else {
                if (G.flags.verbose) {
                  if (observeit) {
                    await pline(S("%s smashes down a door."), await Monnam(mtmp));
                  } else if (canseeit) {
                    await You_see(S("a door crash open."));
                  } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
                    await You_hear(S("a door crash open."));
                  }
                }
                if (((here.flags | 0) & D_LOCKED) !== 0 && !rn2(2)) {
                  here.flags = (D_NODOOR) & 31;
                } else {
                  here.flags = (D_BROKEN) & 31;
                }
                unblock_point(mtmp.mx, mtmp.my);
              }
              if ($rd(in_rooms(mtmp.mx, mtmp.my, SHOPBASE))) {
                await add_damage(mtmp.mx, mtmp.my, 0);
              }
            }
          } else if ($at2(G.level.locations, mtmp.mx, mtmp.my).typ === IRONBARS) {
            if (!(($at2(G.level.locations, mtmp.mx, mtmp.my).flags | 0) & W_NONDIGGABLE) && (dmgtype(ptr, AD_RUST) || dmgtype(ptr, AD_CORR))) {
              if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
                await pline(S("%s eats through the iron bars."), await Monnam(mtmp));
              }
              await dissolve_bars(mtmp.mx, mtmp.my);
              return 3;
            } else if (G.flags.verbose && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
              await Norep(S("%s %s %s the iron bars."), await Monnam(mtmp), await makeplural(locomotion(ptr, S("pass"))), (ptr.mflags1 & 8) >>> 0 !== 0 ? S("through") : S("between"));
            }
          }
          if (can_tunnel && await mdig_tunnel(mtmp)) {
            return 2;
          }
          if (G.u.uswallow | 0 && mtmp === G.u.ustuck && (mtmp.mx !== omx || mtmp.my !== omy)) {
            G.u.ux0 = G.u.ux;
            G.u.uy0 = G.u.uy;
            G.u.ux = mtmp.mx;
            G.u.uy = mtmp.my;
            await swallowed(0);
          } else {
            await newsym(mtmp.mx, mtmp.my);
          }
        }
        if (!!G.level.objects[mtmp.mx][mtmp.my] && mtmp.mcanmove | 0) {
          if (setlikes) {
            let pctload = curr_mon_load(mtmp) * 100 / max_mon_load(mtmp) | 0;
            likegold = ((ptr.mflags2 & 268435456) >>> 0 !== 0 && pctload < 95 ? 1 : 0) << 24 >> 24;
            likegems = ((ptr.mflags2 & 536870912) >>> 0 !== 0 && pctload < 85 ? 1 : 0) << 24 >> 24;
            uses_items = (!((ptr.mflags1 & 65536) >>> 0 !== 0) && !((ptr.mflags1 & 262144) >>> 0 !== 0) && pctload < 75 ? 1 : 0) << 24 >> 24;
            likeobjs = (((ptr.mflags2 & 1073741824) >>> 0 !== 0 || attacktype(ptr, 254)) && pctload < 75 ? 1 : 0) << 24 >> 24;
            likemagic = ((ptr.mflags2 & 2147483648) >>> 0 !== 0 && pctload < 85 ? 1 : 0) << 24 >> 24;
            likerock = ((ptr.mflags2 & 134217728) >>> 0 !== 0 && pctload < 50 && !G.level.flags.sokoban_rules ? 1 : 0) << 24 >> 24;
            conceals = ((ptr.mflags1 & 128) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
          }
          if ((ptr.mflags1 & 2147483648) >>> 0 !== 0) {
            if (await meatmetal(mtmp) === 2) {
              return 2;
            }
          }
          if (g_at(mtmp.mx, mtmp.my) && likegold) {
            await mpickgold(mtmp);
          }
          if (ptr === $sat(G.mons, PM_GELATINOUS_CUBE)) {
            if (await meatobj(mtmp) === 2) {
              return 2;
            }
          }
          if (!$rd(in_rooms(mtmp.mx, mtmp.my, SHOPBASE)) || !rn2(25)) {
            let picked = FALSE;
            if (likeobjs) {
              picked = (picked | await mpickstuff(mtmp, P(practical))) << 24 >> 24;
            }
            if (likemagic) {
              picked = (picked | await mpickstuff(mtmp, P(magical))) << 24 >> 24;
            }
            if (likerock) {
              picked = (picked | await mpickstuff(mtmp, P(boulder_class))) << 24 >> 24;
            }
            if (likegems) {
              picked = (picked | await mpickstuff(mtmp, P(gem_class))) << 24 >> 24;
            }
            if (uses_items) {
              picked = (picked | await mpickstuff(mtmp, null)) << 24 >> 24;
            }
            if (picked) {
              mmoved = 3;
            }
          }
          if (mtmp.minvis) {
            await newsym(mtmp.mx, mtmp.my);
            if (mtmp.wormno) {
              await see_wsegs(mtmp);
            }
          }
        }
        if ((ptr.mflags1 & 128) >>> 0 !== 0 || ptr.mlet === S_EEL) {
          if (mtmp.mundetected | 0 || mtmp.mcanmove | 0 && !mtmp.msleeping && rn2(5)) {
            hideunder(mtmp);
          }
          await newsym(mtmp.mx, mtmp.my);
        }
        if (mtmp.isshk) {
          await after_shk_move(mtmp);
        }
      }
      return mmoved;
    }
    break;
  }
}

export async function dissolve_bars(x: number, y: number): Promise<void> {
  $at2(G.level.locations, x, y).typ = (Is_special(G.u.uz) || $rd(in_rooms(x, y, 0)) ? ROOM : CORR) << 24 >> 24;
  $at2(G.level.locations, x, y).flags = 0;
  await newsym(x, y);
}

export function closed_door(x: number, y: number): number {
  return ($at2(G.level.locations, x, y).typ === DOOR && ($at2(G.level.locations, x, y).flags | 0) & (D_LOCKED | D_CLOSED) ? 1 : 0) << 24 >> 24;
}

export function accessible(x: number, y: number): number {
  let levtyp = $at2(G.level.locations, x, y).typ;
  if (levtyp === DRAWBRIDGE_UP) {
    levtyp = db_under_typ($at2(G.level.locations, x, y).flags | 0);
  }
  return (levtyp >= DOOR && !closed_door(x, y) ? 1 : 0) << 24 >> 24;
}

export function set_apparxy(mtmp: struct_monst | null): void {
  let $g = 0;
  let notseen = 0;
  let gotu = 0;
  let disp = 0;
  let mx = 0;
  let my = 0;
  let umoney = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mx = mtmp.mux;
      my = mtmp.muy;
      umoney = money_cnt(G.invent);
      if (mtmp.mtame || mtmp === G.u.ustuck) {
        { $g = 1; continue $L; }
      }
      if (mx === G.u.ux && my === G.u.uy) {
        { $g = 1; continue $L; }
      }
      notseen = (!mtmp.mcansee || (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
      if (notseen || G.u.uinwater | 0) {
        if (mtmp.data === $sat(G.mons, PM_XORN) && umoney && !G.u.uinwater) {
          disp = 0;
        } else {
          disp = 1;
        }
      } else if (G.u.uprops[DISPLACED].extrinsic) {
        disp = $rd(G.viz_array.a[G.viz_array.o + my], mx) & 1 ? 2 : 1;
      } else {
        disp = 0;
      }
      if (!disp) {
        { $g = 1; continue $L; }
      }
      gotu = (notseen ? !rn2(3) ? 1 : 0 : G.u.uprops[DISPLACED].extrinsic ? !rn2(4) ? 1 : 0 : FALSE) << 24 >> 24;
      if (!!gotu) { $g = 3; continue $L; }
      {
        let try_cnt = 0;
        do {
          if (++try_cnt > 200) {
            { $g = 1; continue $L; }
          }
          mx = G.u.ux - disp + rn2(2 * disp + 1);
          my = G.u.uy - disp + rn2(2 * disp + 1);
        } while (!isok(mx, my) || disp !== 2 && mx === mtmp.mx && my === mtmp.my || (mx !== G.u.ux || my !== G.u.uy) && !((mtmp.data.mflags1 & 8) >>> 0 !== 0) && !(accessible(mx, my) || closed_door(mx, my) && (can_ooze(mtmp) || can_fog(mtmp))) || !($rd(G.viz_array.a[G.viz_array.o + my], mx) & 1));
      }
      { $g = 2; continue $L; }
    case 3:
    case 1: // found_you
      mx = G.u.ux;
      my = G.u.uy;
    case 2:
      mtmp.mux = mx << 24 >> 24;
      mtmp.muy = my << 24 >> 24;
    }
    break;
  }
}

export function undesirable_disp(mtmp: struct_monst | null, x: number, y: number): number {
  let is_pet = (mtmp && mtmp.mtame && !mtmp.isminion ? 1 : 0) << 24 >> 24;
  let trap = t_at(x, y);
  if (is_pet) {
    if (trap && trap.tseen | 0 && rn2(40)) {
      return TRUE;
    }
    if (cursed_object_at(x, y)) {
      return TRUE;
    }
  } else if (trap && rn2(40) && (mtmp.mtrapseen & 1 << (trap.ttyp | 0) - 1) !== 0) {
    return TRUE;
  }
  if (!accessible(x, y) && !(is_pool(x, y) && is_pool(mtmp.mx, mtmp.my))) {
    return TRUE;
  }
  return FALSE;
}

function stuff_prevents_passage(mtmp: struct_monst | null): number {
  let chain = null;
  let obj = null;
  if (mtmp === G.youmonst) {
    chain = G.invent;
  } else {
    chain = mtmp.minvent;
  }
  for (obj = chain; obj; obj = obj.nobj) {
    let typ = obj.otyp;
    if (typ === COIN_CLASS && obj.quan > 100) {
      return TRUE;
    }
    if (obj.oclass !== GEM_CLASS && !(typ >= ARROW && typ <= BOOMERANG) && !(typ >= DAGGER && typ <= CRYSKNIFE) && typ !== SLING && !(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_CLOAK) && typ !== FEDORA && !(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES) && typ !== LEATHER_JACKET && typ !== CREDIT_CARD && !(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIRT) && !(typ === CORPSE && $sat(G.mons, obj.corpsenm).msize < 1) && typ !== FORTUNE_COOKIE && typ !== CANDY_BAR && typ !== PANCAKE && typ !== LEMBAS_WAFER && typ !== LUMP_OF_ROYAL_JELLY && obj.oclass !== AMULET_CLASS && obj.oclass !== RING_CLASS && obj.oclass !== VENOM_CLASS && typ !== SACK && typ !== BAG_OF_HOLDING && typ !== BAG_OF_TRICKS && !(obj.otyp === 199 || obj.otyp === 200) && typ !== OILSKIN_SACK && typ !== LEASH && typ !== STETHOSCOPE && typ !== BLINDFOLD && typ !== TOWEL && typ !== TIN_WHISTLE && typ !== MAGIC_WHISTLE && typ !== MAGIC_MARKER && typ !== TIN_OPENER && typ !== SKELETON_KEY && typ !== LOCK_PICK) {
      return TRUE;
    }
    if (obj.otyp >= 189 && obj.otyp <= 195 && obj.cobj) {
      return TRUE;
    }
  }
  return FALSE;
}

export function can_ooze(mtmp: struct_monst | null): number {
  if (!((mtmp.data.mflags1 & 4) >>> 0 !== 0) || stuff_prevents_passage(mtmp)) {
    return FALSE;
  }
  return TRUE;
}

export function can_fog(mtmp: struct_monst | null): number {
  if (!(G.mvitals[PM_FOG_CLOUD].mvflags & G_GENOD) && (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && !stuff_prevents_passage(mtmp)) {
    return TRUE;
  }
  return FALSE;
}

async function vamp_shift(mon: struct_monst | null, ptr: struct_permonst | null, domsg: number): Promise<number> {
  let reslt = 0;
  let oldmtype = new Int8Array(256);
  strcpy(P(oldmtype), domsg ? await noname_monnam(mon, ARTICLE_THE) : S(""));
  if (mon.data === ptr) {
    reslt = 1;
    domsg = FALSE;
  } else if (mon.cham === 222 || mon.cham === 223 || mon.cham === 224) {
    reslt = await newcham(mon, ptr, FALSE, FALSE);
  }
  if (reslt && domsg) {
    await pline(S("You %s %s where %s was."), !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) ? S("now detect") : S("observe"), await noname_monnam(mon, ARTICLE_A), P(oldmtype));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  }
  return reslt;
}

export function $init(): void {
  practical = $ta(Int8Array, 5, [WEAPON_CLASS, ARMOR_CLASS, GEM_CLASS, FOOD_CLASS]);
  magical = $ta(Int8Array, 7, [AMULET_CLASS, POTION_CLASS, SCROLL_CLASS, WAND_CLASS, RING_CLASS, SPBOOK_CLASS]);
  indigestion = $ta(Int8Array, 3, [BALL_CLASS, ROCK_CLASS]);
  boulder_class = $ta(Int8Array, 2, [ROCK_CLASS]);
  gem_class = $ta(Int8Array, 2, [GEM_CLASS]);
}
