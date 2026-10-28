// @ts-nocheck
// NetHack 3.6.7 steed.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { m_unleash } from './apply.ts';
import { acurr, adjalign, exercise } from './attrib.ts';
import { describe_level } from './botl.ts';
import { getdir, isok, yn_function } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { heal_legs, set_wounded_legs } from './do.ts';
import { Monnam, a_monnam, hliquid, minimal_monnam, mon_nam, x_monnam, y_monnam } from './do_name.ts';
import { finish_meating } from './dogmove.ts';
import { panic } from './end.ts';
import { surface } from './engrave.ts';
import { losehp, near_capacity, test_move } from './hack.ts';
import { dist2, highc, upstart } from './hacklib.ts';
import { freeinv, sobj_at } from './invent.ts';
import { killed, monkilled } from './mon.ts';
import { poly_when_stoned, pronoun_gender } from './mondata.ts';
import { accessible } from './monmove.ts';
import { an, makeplural } from './objnam.ts';
import { encumber_msg, u_handsy } from './pickup.ts';
import { You, You_cant, Your, impossible, pline } from './pline.ts';
import { body_part, polymon } from './polyself.ts';
import { rn2, rnd } from './rnd.ts';
import { mpickobj, remove_worn_item } from './steal.ts';
import { enexto, rloc, rloc_to, teleds } from './teleport.ts';
import { float_down, instapetrify, mintrap, t_at } from './trap.ts';
import { use_skill } from './weapon.ts';
import { worm_known } from './worm.ts';
import { update_mon_intrinsics, which_armor } from './worn.ts';
import { struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $rd, $sat, $ta, $wr, G, P, S, sprintf, strchr, strcpy, strncmp } from './rt/index.ts';
import { AD_PHYS, ARTICLE_A, A_CHA, A_DEX, A_WIS, BLINDED, BOTH_SIDES, BOULDER, CONFUSION, DETECT_MONSTERS, DISMOUNT_BONES, DISMOUNT_BYCHOICE, DISMOUNT_ENGULFED, DISMOUNT_FELL, DISMOUNT_GENERIC, DISMOUNT_POLY, DISMOUNT_THROWN, FALSE, FLYING, FUMBLING, GLIB, HALF_PHDAM, HALLUC, HALLUC_RES, INFRAVISION, IRON, KILLED_BY_AN, LEG, LEVITATION, MAXULEV, MITHRIL, MON_BUBBLEMOVE, MON_ENDGAME_FREE, MON_ENDGAME_MIGR, MON_LIMBO, MON_MIGRATING, MON_OFFMAP, MZ_MEDIUM, M_AP_FURNITURE, M_AP_OBJECT, NO_KILLER_PREFIX, PM_BAT, PM_GHOST, PM_INCUBUS, PM_LONG_WORM, PM_STONE_GOLEM, PM_SUCCUBUS, P_BASIC, P_EXPERT, P_ISRESTRICTED, P_LANCE, P_POLEARMS, P_RIDING, P_SKILLED, P_UNSKILLED, SEE_INVIS, SLT_ENCUMBER, STONE_RES, STUNNED, SUPPRESS_HALLUCINATION, SUPPRESS_INVISIBLE, SUPPRESS_IT, S_ANGEL, S_CENTAUR, S_DRAGON, S_EYE, S_GHOST, S_JABBERWOCK, S_LIGHT, S_QUADRUPED, S_UNICORN, S_VORTEX, S_arrow_trap, TELEPAT, TEST_MOVE, TOOL_CLASS, TRUE, WARN_OF_MON, WEAPON_CLASS, WOUNDED_LEGS, W_SADDLE } from './consts.ts';

let steeds: any;

export async function rider_cant_reach(): Promise<void> {
  await You(S("aren't skilled enough to reach from %s."), await y_monnam(G.u.usteed));
}

export function can_saddle(mtmp: struct_monst | null): number {
  let ptr = mtmp.data;
  return (strchr(P(steeds), ptr.mlet) && ptr.msize >= MZ_MEDIUM && (!((ptr.mflags1 & 131072) >>> 0 !== 0) || ptr.mlet === S_CENTAUR) && !((ptr.mflags1 & 4) >>> 0 !== 0) && !(ptr.mlet === S_GHOST) && !(ptr.mlet === S_VORTEX || ptr === $sat(G.mons, 151)) && !((ptr.mflags1 & 1048576) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
}

export async function use_saddle(otmp: struct_obj | null): Promise<number> {
  let mtmp = null;
  let ptr = null;
  let chance = 0;
  let s = null;
  if (!await u_handsy()) {
    return 0;
  }
  if (G.u.uswallow | 0 || G.u.uinwater | 0 || !await getdir(null)) {
    await pline(S("%s"), G.c_common_strings.c_Never_mind);
    return 0;
  }
  if (!G.u.dx && !G.u.dy) {
    await pline(S("Saddle yourself?  Very funny..."));
    return 0;
  }
  if (!isok(G.u.ux + G.u.dx, G.u.uy + G.u.dy) || !(mtmp = !!G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] ? G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] : null) || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    await pline(S("I see nobody there."));
    return 1;
  }
  if (mtmp.misc_worn_check & W_SADDLE || await which_armor(mtmp, W_SADDLE)) {
    await pline(S("%s doesn't need another one."), await Monnam(mtmp));
    return 1;
  }
  ptr = mtmp.data;
  if ((ptr === $sat(G.mons, 10) || ptr === $sat(G.mons, 9)) && !G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    let kbuf = new Int8Array(256);
    await You(S("touch %s."), await mon_nam(mtmp));
    if (!(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
      sprintf(P(kbuf), S("attempting to saddle %s"), await an(mtmp.data.mname));
      await instapetrify(P(kbuf));
    }
  }
  if (ptr === $sat(G.mons, PM_INCUBUS) || ptr === $sat(G.mons, PM_SUCCUBUS)) {
    await pline(S("Shame on you!"));
    await exercise(A_WIS, FALSE);
    return 1;
  }
  if (mtmp.isminion | 0 || mtmp.isshk | 0 || mtmp.ispriest | 0 || mtmp.isgd | 0 || mtmp.iswiz | 0) {
    await pline(S("I think %s would mind."), await mon_nam(mtmp));
    return 1;
  }
  if (!can_saddle(mtmp)) {
    await You_cant(S("saddle such a creature."));
    return 1;
  }
  chance = acurr(A_DEX) + (acurr(A_CHA) / 2 | 0) + 2 * mtmp.mtame;
  chance += Math.imul(G.u.ulevel, mtmp.mtame ? 20 : 5);
  if (!mtmp.mtame) {
    chance -= 10 * mtmp.m_lev;
  }
  if (G.urole.malenum === 333) {
    chance += 20;
  }
  switch (G.u.weapon_skills[P_RIDING].skill) {
  case P_ISRESTRICTED:
  case P_UNSKILLED:
  default:
    chance -= 20;
    break;
  case P_BASIC:
    break;
  case P_SKILLED:
    chance += 15;
    break;
  case P_EXPERT:
    chance += 30;
    break;
  }
  if (G.u.uprops[CONFUSION].intrinsic || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || G.u.uprops[GLIB].intrinsic) {
    chance -= 20;
  } else if (G.uarmg && !!(s = G.obj_descr[G.objects[G.uarmg.otyp].oc_descr_idx].oc_descr) && !strncmp(s, S("riding "), 7)) {
    chance += 10;
  } else if (G.uarmf && !!(s = G.obj_descr[G.objects[G.uarmf.otyp].oc_descr_idx].oc_descr) && !strncmp(s, S("riding "), 7)) {
    chance += 10;
  }
  if (otmp.cursed) {
    chance -= 50;
  }
  await maybewakesteed(mtmp);
  if (rn2(100) < chance) {
    await You(S("put the saddle on %s."), await mon_nam(mtmp));
    if (otmp.owornmask) {
      await remove_worn_item(otmp, FALSE);
    }
    await freeinv(otmp);
    await put_saddle_on_mon(otmp, mtmp);
  } else {
    await pline(S("%s resists!"), await Monnam(mtmp));
  }
  return 1;
}

export async function put_saddle_on_mon(saddle: struct_obj | null, mtmp: struct_monst | null): Promise<void> {
  if (!can_saddle(mtmp) || await which_armor(mtmp, W_SADDLE)) {
    return;
  }
  if (await mpickobj(mtmp, saddle)) {
    await panic(S("merged saddle?"));
  }
  mtmp.misc_worn_check = mtmp.misc_worn_check | W_SADDLE;
  saddle.owornmask = W_SADDLE;
  saddle.corpsenm = mtmp.m_id | 0;
  await update_mon_intrinsics(mtmp, saddle, TRUE, FALSE);
}

export function can_ride(mtmp: struct_monst | null): number {
  return (mtmp.mtame && (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 && !(G.youmonst.data.msize < 1) && !(G.youmonst.data.msize >= 3) && (!G.u.uinwater || (mtmp.data.mflags1 & 2) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
}

export async function doride(): Promise<number> {
  let forcemount = FALSE;
  if (G.u.usteed) {
    await dismount_steed(DISMOUNT_BYCHOICE);
  } else if (await getdir(null) && isok(G.u.ux + G.u.dx, G.u.uy + G.u.dy)) {
    if (G.flags.debug && await yn_function(S("Force the mount to succeed?"), P(G.ynchars), 110) === 121) {
      forcemount = TRUE;
    }
    return await mount_steed(!!G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] ? G.level.monsters[G.u.ux + G.u.dx][G.u.uy + G.u.dy] : null, forcemount);
  } else {
    return 0;
  }
  return 1;
}

export async function mount_steed(mtmp: struct_monst | null, force: number): Promise<number> {
  let otmp = null;
  let buf = new Int8Array(256);
  let ptr = null;
  if (G.u.usteed) {
    await You(S("are already riding %s."), await mon_nam(G.u.usteed));
    return FALSE;
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !force) {
    await pline(S("Maybe you should find a designated driver."));
    return FALSE;
  }
  if (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) {
    await Your(S("%s are in no shape for riding."), await makeplural(body_part(LEG)));
    if (force && G.flags.debug && await yn_function(S("Heal your legs?"), P(G.ynchars), 110) === 121) {
      G.u.uprops[WOUNDED_LEGS].intrinsic = G.u.uprops[WOUNDED_LEGS].extrinsic = 0;
    } else {
      return FALSE;
    }
  }
  if (G.u.umonnum !== G.u.umonster && (!((G.youmonst.data.mflags1 & 131072) >>> 0 !== 0) || G.youmonst.data.msize < 1 || G.youmonst.data.msize >= 3 || (G.youmonst.data.mflags1 & 524288) >>> 0 !== 0)) {
    await You(S("won't fit on a saddle."));
    return FALSE;
  }
  if (!force && near_capacity() > SLT_ENCUMBER) {
    await You_cant(S("do that while carrying so much stuff."));
    return FALSE;
  }
  if (!mtmp || !force && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || mtmp.mundetected | 0 || (mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT)) {
    await pline(S("I see nobody there."));
    return FALSE;
  }
  if (mtmp.data === $sat(G.mons, PM_LONG_WORM) && (G.u.ux + G.u.dx !== mtmp.mx || G.u.uy + G.u.dy !== mtmp.my)) {
    await You(S("couldn't ride %s, let alone its tail."), await a_monnam(mtmp));
    return FALSE;
  }
  if (G.u.uswallow | 0 || G.u.ustuck || G.u.utrap || !!G.uball || !await test_move(G.u.ux, G.u.uy, mtmp.mx - G.u.ux, mtmp.my - G.u.uy, TEST_MOVE)) {
    if (!!G.uball || !(G.u.uswallow | 0 || G.u.ustuck || G.u.utrap)) {
      await You(S("are unable to swing your %s over."), body_part(LEG));
    } else {
      await You(S("are stuck here for now."));
    }
    return FALSE;
  }
  otmp = await which_armor(mtmp, W_SADDLE);
  if (!otmp) {
    await pline(S("%s is not saddled."), await Monnam(mtmp));
    return FALSE;
  }
  ptr = mtmp.data;
  if ((ptr === $sat(G.mons, 10) || ptr === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    let kbuf = new Int8Array(256);
    await You(S("touch %s."), await mon_nam(mtmp));
    sprintf(P(kbuf), S("attempting to ride %s"), await an(mtmp.data.mname));
    await instapetrify(P(kbuf));
  }
  if (!mtmp.mtame || mtmp.isminion | 0) {
    await pline(S("I think %s would mind."), await mon_nam(mtmp));
    return FALSE;
  }
  if (mtmp.mtrapped) {
    let t = t_at(mtmp.mx, mtmp.my);
    await You_cant(S("mount %s while %s's trapped in %s."), await mon_nam(mtmp), G.genders[pronoun_gender(mtmp, 0)].he, await an(G.defsyms[S_arrow_trap + (t.ttyp | 0) - 1].explanation));
    return FALSE;
  }
  if (!force && !(G.urole.malenum === 333) && !(mtmp.mtame = mtmp.mtame - 1 << 24 >> 24)) {
    await newsym(mtmp.mx, mtmp.my);
    await pline(S("%s resists%s!"), await Monnam(mtmp), mtmp.mleashed | 0 ? S(" and its leash comes off") : S(""));
    if (mtmp.mleashed) {
      await m_unleash(mtmp, FALSE);
    }
    return FALSE;
  }
  if (!force && G.u.uinwater | 0 && !((ptr.mflags1 & 2) >>> 0 !== 0)) {
    await You_cant(S("ride that creature while under %s."), hliquid(S("water")));
    return FALSE;
  }
  if (!can_saddle(mtmp) || !can_ride(mtmp)) {
    await You_cant(S("ride such a creature."));
    return FALSE;
  }
  if (!force && !(ptr.mlet === S_EYE || ptr.mlet === S_LIGHT) && !((ptr.mflags1 & 1) >>> 0 !== 0) && ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !(((G.u.uprops[LEVITATION].intrinsic & 536870912) !== 0 || (G.u.uprops[LEVITATION].extrinsic & 8192) !== 0) && (G.u.uprops[LEVITATION].intrinsic & ~(536870912 | 16777215)) === 0 && (G.u.uprops[LEVITATION].extrinsic & ~8192) === 0)) {
    await You(S("cannot reach %s."), await mon_nam(mtmp));
    return FALSE;
  }
  if (!force && G.uarm && ((G.objects[G.uarm.otyp].oc_material | 0) >= IRON && (G.objects[G.uarm.otyp].oc_material | 0) <= MITHRIL) && ((G.uarm.oeroded | 0) > (G.uarm.oeroded2 | 0) ? G.uarm.oeroded | 0 : G.uarm.oeroded2 | 0)) {
    await Your(S("%s armor is too stiff to be able to mount %s."), G.uarm.oeroded | 0 ? S("rusty") : S("corroded"), await mon_nam(mtmp));
    return FALSE;
  }
  if (!force && (G.u.uprops[CONFUSION].intrinsic || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || G.u.uprops[GLIB].intrinsic || (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) || otmp.cursed | 0 || G.u.ulevel + mtmp.mtame < rnd((MAXULEV / 2 | 0) + 5))) {
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
      await pline(S("%s slips away from you."), await Monnam(mtmp));
      return FALSE;
    }
    await You(S("slip while trying to get on %s."), await mon_nam(mtmp));
    sprintf(P(buf), S("slipped while mounting %s"), await x_monnam(mtmp, ARTICLE_A, null, SUPPRESS_IT | SUPPRESS_INVISIBLE | SUPPRESS_HALLUCINATION, TRUE));
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rn2(5) + 10 + 1) / 2 | 0 : rn2(5) + 10, P(buf), NO_KILLER_PREFIX);
    return FALSE;
  }
  await maybewakesteed(mtmp);
  if (!force) {
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked && !(ptr.mlet === S_EYE || ptr.mlet === S_LIGHT) && !((ptr.mflags1 & 1) >>> 0 !== 0)) {
      await pline(S("%s magically floats up!"), await Monnam(mtmp));
    }
    await You(S("mount %s."), await mon_nam(mtmp));
    if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
      await You(S("and %s take flight together."), await mon_nam(mtmp));
    }
  }
  if (G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && (G.objects[G.uwep.otyp].oc_subtyp === P_POLEARMS || G.objects[G.uwep.otyp].oc_subtyp === P_LANCE))) {
    G.unweapon = FALSE;
  }
  G.u.usteed = mtmp;
  G.level.monsters[mtmp.mx][mtmp.my] = null;
  await teleds(mtmp.mx, mtmp.my, TRUE);
  G.context.botl = TRUE;
  return TRUE;
}

export async function exercise_steed(): Promise<void> {
  if (!G.u.usteed) {
    return;
  }
  if (++G.u.urideturns >= 100) {
    G.u.urideturns = 0;
    await use_skill(P_RIDING, 1);
  }
  return;
}

export async function kick_steed(): Promise<void> {
  let He = new Int8Array(4);
  if (!G.u.usteed) {
    return;
  }
  if (G.u.usteed.msleeping | 0 || !G.u.usteed.mcanmove) {
    strcpy(P(He), G.genders[pronoun_gender(G.u.usteed, 0)].he);
    $wr(P(He), 0, highc($rd(P(He))));
    if ((G.u.usteed.mcanmove | 0 || G.u.usteed.mfrozen | 0) && !rn2(2)) {
      if (G.u.usteed.mcanmove) {
        G.u.usteed.msleeping = 0;
      } else if ((G.u.usteed.mfrozen | 0) > 2) {
        G.u.usteed.mfrozen = ((G.u.usteed.mfrozen | 0) - 2 >>> 0) & 127;
      } else {
        G.u.usteed.mfrozen = 0;
        G.u.usteed.mcanmove = 1;
      }
      if (G.u.usteed.msleeping | 0 || !G.u.usteed.mcanmove) {
        await pline(S("%s stirs."), P(He));
      } else {
        await pline(S("%s rouses %sself!"), P(He), G.genders[pronoun_gender(G.u.usteed, 0)].him);
      }
    } else {
      await pline(S("%s does not respond."), P(He));
    }
    return;
  }
  if (G.u.usteed.mtame) {
    G.u.usteed.mtame = G.u.usteed.mtame - 1 << 24 >> 24;
  }
  if (!G.u.usteed.mtame && G.u.usteed.mleashed | 0) {
    await m_unleash(G.u.usteed, TRUE);
  }
  if (!G.u.usteed.mtame || G.u.ulevel + G.u.usteed.mtame < rnd((MAXULEV / 2 | 0) + 5)) {
    await newsym(G.u.usteed.mx, G.u.usteed.my);
    await dismount_steed(DISMOUNT_THROWN);
    return;
  }
  await pline(S("%s gallops!"), await Monnam(G.u.usteed));
  G.u.ugallop += rn2(20) + 30;
  return;
}

async function landing_spot(spot: struct_nhcoord | null, reason: number, forceit: number): Promise<number> {
  let i = 0;
  let x = 0;
  let y = 0;
  let distance = 0;
  let min_distance = -1;
  let found = FALSE;
  let t = null;
  if (reason !== DISMOUNT_BYCHOICE || G.u.uprops[STUNNED].intrinsic || G.u.uprops[CONFUSION].intrinsic || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic)) {
    i = 1;
  }
  for (; !found && i < 2; ++i) {
    for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
      for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
        if (!isok(x, y) || x === G.u.ux && y === G.u.uy) {
          continue;
        }
        if (accessible(x, y) && !!!G.level.monsters[x][y]) {
          distance = dist2(x, y, G.u.ux, G.u.uy);
          if (min_distance < 0 || distance < min_distance || distance === min_distance && rn2(2)) {
            if (i > 0 || (!(t = t_at(x, y)) || !t.tseen) && (!sobj_at(BOULDER, x, y) || (G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
              spot.x = x << 24 >> 24;
              spot.y = y << 24 >> 24;
              min_distance = distance;
              found = TRUE;
            }
          }
        }
      }
    }
  }
  if (forceit && min_distance < 0 && !await enexto(spot, G.u.ux, G.u.uy, G.youmonst.data)) {
    return FALSE;
  }
  return found;
}

export async function dismount_steed(reason: number): Promise<void> {
  let mtmp = null;
  let otmp = null;
  let cc = new struct_nhcoord();
  let steedcc = new struct_nhcoord();
  let verb = S("fall");
  let repair_leg_damage = ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
  let save_utrap = G.u.utrap;
  let have_spot = await landing_spot(cc, reason, 0);
  mtmp = G.u.usteed;
  if (!mtmp) {
    return;
  }
  otmp = await which_armor(mtmp, W_SADDLE);
  switch (reason) {
  case DISMOUNT_THROWN:
    verb = S("are thrown");
  case DISMOUNT_FELL:
    await You(S("%s off of %s!"), verb, await mon_nam(mtmp));
    if (!have_spot) {
      have_spot = await landing_spot(cc, reason, 1);
    }
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rn2(10) + 10 + 1) / 2 | 0 : rn2(10) + 10, S("riding accident"), KILLED_BY_AN);
    await set_wounded_legs(BOTH_SIDES, (G.u.uprops[WOUNDED_LEGS].intrinsic | 0) + (rn2(5) + 5));
    repair_leg_damage = FALSE;
    break;
  case DISMOUNT_POLY:
    await You(S("can no longer ride %s."), await mon_nam(G.u.usteed));
    if (!have_spot) {
      have_spot = await landing_spot(cc, reason, 1);
    }
    break;
  case DISMOUNT_ENGULFED:
    break;
  case DISMOUNT_BONES:
    break;
  case DISMOUNT_GENERIC:
    break;
  case DISMOUNT_BYCHOICE:
  default:
    if (otmp && otmp.cursed | 0) {
      await You(S("can't.  The saddle %s cursed."), otmp.bknown | 0 ? S("is") : S("seems to be"));
      otmp.bknown = 1;
      return;
    }
    if (!have_spot) {
      await You(S("can't.  There isn't anywhere for you to stand."));
      return;
    }
    if (!(mtmp.mextra && mtmp.mextra.mname)) {
      await pline(S("You've been through the dungeon on %s with no name."), await an(mtmp.data.mname));
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("It felt good to get out of the rain."));
      }
    } else {
      await You(S("dismount %s."), await mon_nam(mtmp));
    }
  }
  if (repair_leg_damage) {
    await heal_legs(1);
  }
  G.u.usteed = null;
  G.u.ugallop = 0;
  steedcc.x = G.u.ux, steedcc.y = G.u.uy;
  if (!!G.level.monsters[G.u.ux][G.u.uy] ? G.level.monsters[G.u.ux][G.u.uy] : null) {
    if (!await enexto(steedcc, G.u.ux, G.u.uy, mtmp.data) && !await enexto(steedcc, G.u.ux, G.u.uy, $sat(G.mons, PM_BAT))) {
      await enexto(steedcc, G.u.ux, G.u.uy, $sat(G.mons, PM_GHOST));
    }
  }
  if (!(!!G.level.monsters[steedcc.x][steedcc.y] ? G.level.monsters[steedcc.x][steedcc.y] : null)) {
    if (mtmp.mhp < 1) {
      mtmp.mhp = 0;
    }
    ++mtmp.mhp;
    await place_monster(mtmp, steedcc.x, steedcc.y);
    --mtmp.mhp;
  } else {
    await impossible(S("Dismounting: can't place former steed on map."));
  }
  if (!(mtmp.mhp < 1)) {
    if (reason === DISMOUNT_BONES) {
      if (await enexto(cc, G.u.ux, G.u.uy, mtmp.data)) {
        await rloc_to(mtmp, cc.x, cc.y);
      } else {
        await rloc(mtmp, FALSE);
      }
      return;
    }
    if (!G.u.uswallow && !G.u.ustuck && have_spot) {
      let mdat = mtmp.data;
      if (!((mdat.mflags1 & 1) >>> 0 !== 0) && !(mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) && !((mdat.mflags1 & 16) >>> 0 !== 0)) {
        if (is_pool(G.u.ux, G.u.uy)) {
          if (!G.u.uinwater) {
            await pline(S("%s falls into the %s!"), await Monnam(mtmp), surface(G.u.ux, G.u.uy));
          }
          if (!((mdat.mflags1 & 2) >>> 0 !== 0) && !((mdat.mflags1 & (512 | 1024)) >>> 0 !== 0)) {
            await killed(mtmp);
            adjalign(-1);
          }
        } else if (is_lava(G.u.ux, G.u.uy)) {
          await pline(S("%s is pulled into the %s!"), await Monnam(mtmp), hliquid(S("lava")));
          if (!(mdat === $sat(G.mons, 152) || mdat === $sat(G.mons, 326))) {
            await killed(mtmp);
            adjalign(-1);
          }
        }
      }
      if (!(mtmp.mhp < 1)) {
        G.in_steed_dismounting = TRUE;
        await teleds(cc.x, cc.y, TRUE);
        G.in_steed_dismounting = FALSE;
        if (save_utrap) {
          await mintrap(mtmp);
        }
      }
    } else if (await enexto(cc, G.u.ux, G.u.uy, mtmp.data)) {
      await rloc_to(mtmp, cc.x, cc.y);
    } else {
      if (reason === DISMOUNT_BYCHOICE) {
        await killed(mtmp);
        adjalign(-1);
      } else {
        await monkilled(mtmp, S(""), -AD_PHYS);
      }
    }
  }
  if (reason !== DISMOUNT_ENGULFED && reason !== DISMOUNT_BONES) {
    G.in_steed_dismounting = TRUE;
    await float_down(0, W_SADDLE);
    G.in_steed_dismounting = FALSE;
    G.context.botl = TRUE;
    await encumber_msg();
    G.vision_full_recalc = 1;
  } else {
    G.context.botl = TRUE;
  }
  if (G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && (G.objects[G.uwep.otyp].oc_subtyp === P_POLEARMS || G.objects[G.uwep.otyp].oc_subtyp === P_LANCE))) {
    G.unweapon = TRUE;
  }
  return;
}

async function maybewakesteed(steed: struct_monst | null): Promise<void> {
  let frozen = steed.mfrozen | 0;
  let wasimmobile = (steed.msleeping | 0 || !steed.mcanmove ? 1 : 0) << 24 >> 24;
  steed.msleeping = 0;
  if (frozen) {
    frozen = (frozen + 1) / 2 | 0;
    if (!rn2(frozen)) {
      steed.mfrozen = 0;
      steed.mcanmove = 1;
    } else {
      steed.mfrozen = (frozen >>> 0) & 127;
    }
  }
  if (wasimmobile && !steed.msleeping && steed.mcanmove | 0) {
    await pline(S("%s wakes up."), await Monnam(steed));
  }
  await finish_meating(steed);
}

export async function stucksteed(checkfeeding: number): Promise<number> {
  let steed = G.u.usteed;
  if (steed) {
    if (steed.msleeping | 0 || !steed.mcanmove) {
      await pline(S("%s won't move!"), upstart(await y_monnam(steed)));
      return TRUE;
    }
    if (checkfeeding && steed.meating) {
      await pline(S("%s is still eating."), upstart(await y_monnam(steed)));
      return TRUE;
    }
  }
  return FALSE;
}

export async function place_monster(mon: struct_monst | null, x: number, y: number): Promise<void> {
  let othermon = null;
  let monnm = null;
  let othnm = null;
  let buf = new Int8Array(128);
  buf[0] = 0;
  if (!isok(x, y) && (x !== 0 || y !== 0 || !mon.isgd)) {
    describe_level(P(buf));
    await impossible(S("trying to place %s at <%d,%d> mstate:%lx on %s"), minimal_monnam(mon, TRUE), x, y, mon.mspare1, P(buf));
    x = y = 0;
  }
  if (mon === G.u.usteed || mon.mhp < 1 && !(mon.isgd | 0 && x === 0 && y === 0)) {
    describe_level(P(buf));
    await impossible(S("placing %s onto map, mstate:%lx, on %s?"), mon === G.u.usteed ? S("steed") : S("defunct monster"), mon.mspare1, P(buf));
    return;
  }
  if (!!(othermon = G.level.monsters[x][y])) {
    describe_level(P(buf));
    monnm = minimal_monnam(mon, FALSE);
    othnm = mon !== othermon ? minimal_monnam(othermon, TRUE) : S("itself");
    await impossible(S("placing %s over %s at <%d,%d>, mstates:%lx %lx on %s?"), monnm, othnm, x, y, othermon.mspare1, mon.mspare1, P(buf));
  }
  mon.mx = x << 24 >> 24, mon.my = y << 24 >> 24;
  G.level.monsters[x][y] = mon;
  mon.mspare1 = mon.mspare1 & ~(MON_OFFMAP | MON_MIGRATING | MON_LIMBO | MON_BUBBLEMOVE | MON_ENDGAME_FREE | MON_ENDGAME_MIGR);
}

export function $init(): void {
  steeds = $ta(Int8Array, 7, [S_QUADRUPED, S_UNICORN, S_ANGEL, S_CENTAUR, S_DRAGON, S_JABBERWOCK]);
}
