// @ts-nocheck
// NetHack 3.6.7 eat.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { dupstr, fmt_ptr } from './alloc.ts';
import { o_unleash, tinnable } from './apply.ts';
import { defends, retouch_equipment, retouch_object, touch_artifact } from './artifact.ts';
import { acurr, acurrstr, adjalign, adjattrib, change_luck, exercise, gainstr, losestr } from './attrib.ts';
import { bot } from './botl.ts';
import { paranoid_query, set_occupation, yn_function } from './cmd.ts';
import { is_pool_or_lava } from './dbridge.ts';
import { curs_on_u, newsym, see_monsters, set_mimic_blocking } from './display.ts';
import { dropx, dropy, heal_legs, revive_corpse } from './do.ts';
import { Monnam, docall, hcolor, mon_nam, rndmonnam } from './do_name.ts';
import { Ring_gone, fingers_or_gloves } from './do_wear.ts';
import { on_level } from './dungeon.ts';
import { delayed_killer, done } from './end.ts';
import { can_reach_floor, surface } from './engrave.ts';
import { more_experienced, newexplevel, pluslvl } from './exper.ts';
import { debugcore } from './files.ts';
import { check_capacity, inv_cnt, losehp, near_capacity, nomul, unmul } from './hack.ts';
import { dist2, eos, rounddiv, s_suffix, sgn, strncmpi } from './hacklib.ts';
import { addinv, carrying, feel_cockatrice, freeinv, g_at, getobj, obj_here, stackobj, useup, useupall, useupf, will_feel_cockatrice } from './invent.ts';
import { bcsign, costly_alteration, mksobj, peek_at_iced_corpse_age, set_bknown, splitobj, weight } from './mkobj.ts';
import { mondied, monstone, rescham } from './mon.ts';
import { attacktype_fordmg, cantvomit, dmgtype, monsndx, poly_when_stoned, same_race } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { Tobjnam, an, ansimpleoname, corpse_xname, doname, killer_xname, makeplural, obj_is_pname, otense, safe_qbuf, singular, the, the_unique_pm, thesimpleoname, xname, yobjnam } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, change_sex, polymon, polyself, rehumanize } from './polyself.ts';
import { dopotion, incr_itimeout, make_blinded, make_confused, make_deaf, make_glib, make_hallucinated, make_sick, make_slimed, make_stoned, make_stunned, make_vomiting, self_invis_message, set_itimeout } from './potion.ts';
import { unpunish } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { outrumor } from './rumors.ts';
import { costly_spot, sellobj_state } from './shk.ts';
import { attrcurse } from './sit.ts';
import { remove_worn_item } from './steal.ts';
import { dismount_steed } from './steed.ts';
import { fall_asleep, obj_stop_timers } from './timeout.ts';
import { b_trapped, deltrap, float_up, reset_utrap, selftouch, t_at, unconscious } from './trap.ts';
import { vault_gd_watching } from './vault.ts';
import { set_ulycn, were_beastie, you_unwere } from './were.ts';
import { uqwepgone, uswapwepgone, uwepgone, welded, wield_tool } from './wield.ts';
import { worm_known } from './worm.ts';
import { anon_eat_c_128, struct_monst, struct_obj, struct_permonst } from './structs.ts';
import { $cs, $peq, $rd, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, free, sprintf, strcat, strcmp, strcpy, strlen } from './rt/index.ts';
import { ACID_RES, AD_BLND, AD_HALU, AD_STUN, AGGRAVATE_MONSTER, AMULET_CLASS, AMULET_OF_STRANGULATION, APPLE, ARMOR_CLASS, ART_ORB_OF_DETECTION, AT_ENGL, A_CHA, A_CON, A_DEX, A_INT, A_LAWFUL, A_STR, A_WIS, BALL_CLASS, BEARTRAP, BEAR_TRAP, BLINDED, BONE, BY_COOKIE, CANDY_BAR, CHAIN_CLASS, CHOKING, COIN_CLASS, COLD_RES, CONFLICT, CONFUSION, CORPSE, COST_BITE, COST_DSTROY, COST_OPEN, CRAM_RATION, CREAM_PIE, CXN_NORMAL, CXN_PFX_THE, CXN_SINGULAR, C_RATION, DEAF, DETECT_MONSTERS, DIED, DISINT_RES, DISMOUNT_FELL, DRAGON_HIDE, EGG, FAINTED, FAINTING, FALSE, FAST, FIRE_RES, FIXED_ABIL, FLESH, FLINT, FLYING, FOOD_CLASS, FORTUNE_COOKIE, FROMFORM, FROMOUTSIDE, GD_EATGOLD, GEM_CLASS, GLASS, GLIB, GLOB_OF_GREEN_SLIME, GOLD_PIECE, HALLUC, HALLUC_RES, HEALTHY_TIN, HOMEMADE_TIN, HUNGER, HUNGRY, INFRAVISION, INTRINSIC, INVIS, IRON, KILLED_BY, KILLED_BY_AN, K_RATION, LAST_PROP, LEASH, LEATHER, LEMBAS_WAFER, LEVITATION, LIFESAVED, LIGHT_HEADED, LOW_PM, LUMP_OF_ROYAL_JELLY, MAGICAL_BREATHING, MITHRIL, MM_AGR_DIED, MM_HIT, MM_MISS, MR_COLD, MR_DISINT, MR_ELEC, MR_FIRE, MR_POISON, MR_SLEEP, M_AP_NOTHING, M_AP_OBJECT, NON_PM, NOSE, NOT_HUNGRY, NO_KILLER_PREFIX, ORANGE, PANCAKE, PAPER, PEAR, PM_ACID_BLOB, PM_CHICKATRICE, PM_COCKATRICE, PM_FLOATING_EYE, PM_GELATINOUS_CUBE, PM_GHOUL, PM_GREEN_SLIME, PM_KILLER_BEE, PM_LIZARD, PM_RAVEN, PM_RUST_MONSTER, PM_SCORPION, PM_STONE_GOLEM, PM_TIGER, PM_VIOLET_FUNGUS, PM_WEREJACKAL, PM_WERERAT, PM_WEREWOLF, POISONING, POISON_RES, POTION_CLASS, PROTECTION, REGENERATION, RING_CLASS, RIN_INCREASE_ACCURACY, RIN_INCREASE_DAMAGE, RIN_PROTECTION, RIN_SLOW_DIGESTION, ROCK_CLASS, ROTTEN_TIN, SATIATED, SCROLL_CLASS, SCR_MAIL, SCR_SCARE_MONSTER, SEE_INVIS, SELL_DONTSELL, SELL_NORMAL, SHOCK_RES, SICK, SICK_ALL, SICK_RES, SICK_VOMITABLE, SLEEPY, SLEEP_RES, SLIMED, SLIME_MOLD, SLOW_DIGESTION, SLT_ENCUMBER, SPBOOK_CLASS, SPINACH_TIN, STARVED, STARVING, STOMACH, STONED, STONE_RES, STONING, STRANGLED, STUNNED, S_BLOB, S_ELEMENTAL, S_FUNGUS, S_GHOST, S_GOLEM, S_JELLY, S_LIGHT, S_MIMIC, S_PUDDING, S_VORTEX, TELEPAT, TELEPORT, TELEPORT_CONTROL, TIMEOUT, TIN, TIN_OPENER, TOOL_CLASS, TRIDENT, TRUE, TT_BEARTRAP, UNCHANGING, VOMITING, WAND_CLASS, WARN_OF_MON, WAX, WEAK, WEAPON_CLASS, WOOD, WWALKING, W_AMUL, W_ARMOR, W_ARTI, W_RING, W_SADDLE, W_TOOL, W_WEP } from './consts.ts';

let comestibles: any;
let offerfodder: any;
let allobj: any;
let force_save_hs: number;
let tintxts: any;
let eatmbuf: Ptr | null;
let foodwords: any;
let eat_brains$brainlessness: any;
let maybe_cannibal$ate_brains: number;
let newuhs$save_hs: number;
let newuhs$saved_hs: number;

export function is_edible(obj: struct_obj | null): number {
  if (G.objects[obj.otyp].oc_unique) {
    return FALSE;
  }
  if ((G.youmonst.data.mflags1 & 2147483648) >>> 0 !== 0 && ((G.objects[obj.otyp].oc_material | 0) >= IRON && (G.objects[obj.otyp].oc_material | 0) <= MITHRIL) && (G.youmonst.data !== $sat(G.mons, PM_RUST_MONSTER) || (G.objects[obj.otyp].oc_material | 0) === IRON)) {
    return TRUE;
  }
  if (G.u.umonnum === PM_GHOUL) {
    return (obj.otyp === CORPSE && !($sat(G.mons, obj.corpsenm).mlet === S_BLOB || $sat(G.mons, obj.corpsenm).mlet === S_JELLY || $sat(G.mons, obj.corpsenm).mlet === S_FUNGUS || $sat(G.mons, obj.corpsenm).mlet === S_VORTEX || $sat(G.mons, obj.corpsenm).mlet === S_LIGHT || $sat(G.mons, obj.corpsenm).mlet === S_ELEMENTAL && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 150) || $sat(G.mons, obj.corpsenm).mlet === S_GOLEM && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 251) && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 249) || $sat(G.mons, obj.corpsenm).mlet === S_GHOST) || obj.otyp === EGG ? 1 : 0) << 24 >> 24;
  }
  if (G.u.umonnum === PM_GELATINOUS_CUBE && (G.objects[obj.otyp].oc_material | 0) <= WOOD && !!!obj.cobj) {
    return TRUE;
  }
  return (obj.oclass === FOOD_CLASS ? 1 : 0) << 24 >> 24;
}

export async function init_uhunger(): Promise<void> {
  G.context.botl = (G.u.uhs !== NOT_HUNGRY || G.u.atemp.a[A_STR] < 0 ? 1 : 0) << 24 >> 24;
  G.u.uhunger = 900;
  G.u.uhs = NOT_HUNGRY;
  if (G.u.atemp.a[A_STR] < 0) {
    G.u.atemp.a[A_STR] = 0;
    await encumber_msg();
  }
}

async function eatmdone(): Promise<number> {
  if (eatmbuf) {
    if ($peq(G.nomovemsg, eatmbuf)) {
      G.nomovemsg = null;
    }
    free(eatmbuf), eatmbuf = null;
  }
  if (G.youmonst.m_ap_type & 7) {
    G.youmonst.m_ap_type = M_AP_NOTHING;
    await newsym(G.u.ux, G.u.uy);
  }
  return 0;
}

export async function eatmupdate(): Promise<void> {
  let altmsg = null;
  let altapp = 0;
  if (!eatmbuf || !$peq(G.nomovemsg, eatmbuf)) {
    return;
  }
  if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance === 253 && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    altmsg = S("You now prefer mimicking yourself.");
    altapp = GOLD_PIECE;
  } else if ((G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance === 411 && (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    altmsg = S("Your rind escaped intact.");
    altapp = ORANGE;
  }
  if (altmsg) {
    if (strlen(altmsg) > strlen(eatmbuf)) {
      free(eatmbuf);
      eatmbuf = P(new Int8Array((strlen(altmsg) + 1 >>> 0)));
    }
    G.nomovemsg = strcpy(eatmbuf, altmsg);
    G.youmonst.mappearance = altapp >>> 0;
    await newsym(G.u.ux, G.u.uy);
  }
}

async function food_xname(food: struct_obj | null, the_pfx: number): Promise<Ptr | null> {
  let result = null;
  if (food.otyp === CORPSE) {
    result = await corpse_xname(food, null, (CXN_SINGULAR | (the_pfx ? CXN_PFX_THE : 0)) >>> 0);
    if (($sat(G.mons, food.corpsenm).mflags2 & 524288) >>> 0 !== 0) {
      the_pfx = FALSE;
    }
  } else {
    result = await singular(food, xname);
  }
  if (the_pfx) {
    result = await the(result);
  }
  return result;
}

async function choke(food: struct_obj | null): Promise<void> {
  if (G.u.uhs !== SATIATED) {
    if (!food || food.otyp !== AMULET_OF_STRANGULATION) {
      return;
    }
  } else if (G.urole.malenum === 333 && G.u.ualign.type === A_LAWFUL) {
    adjalign(-1);
    await You_feel(S("like a glutton!"));
  }
  await exercise(A_CON, FALSE);
  if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0 || !G.u.uprops[STRANGLED].intrinsic && !rn2(20)) {
    if (food && food.otyp === AMULET_OF_STRANGULATION) {
      await You(S("choke, but recover your composure."));
      return;
    }
    await You(S("stuff yourself and then vomit voluminously."));
    await morehungry(1000);
    await vomit();
  } else {
    G.killer.format = KILLED_BY_AN;
    if (food) {
      await You(S("choke over your %s."), await foodword(food));
      if (food.oclass === COIN_CLASS) {
        strcpy(P(G.killer.name), S("very rich meal"));
      } else {
        G.killer.format = KILLED_BY;
        strcpy(P(G.killer.name), await killer_xname(food));
      }
    } else {
      await You(S("choke over it."));
      strcpy(P(G.killer.name), S("quick snack"));
    }
    await You(S("die..."));
    await done(CHOKING);
  }
}

async function recalc_wt(): Promise<void> {
  let piece = G.context.victual.piece;
  if (!piece) {
    await impossible(S("recalc_wt without piece"));
    return;
  }
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("Old weight = %d"), piece.owt);
    }
  } while (0);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("Used time = %d, Req'd time = %d"), G.context.victual.usedtime, G.context.victual.reqtime);
    }
  } while (0);
  piece.owt = await weight(piece) >>> 0;
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("New weight = %d"), piece.owt);
    }
  } while (0);
}

export async function reset_eat(): Promise<void> {
  if (G.context.victual.eating | 0 && !G.context.victual.doreset) {
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("reset_eat..."));
      }
    } while (0);
    G.context.victual.doreset = (TRUE) & 1;
  }
  return;
}

function obj_nutrition(otmp: struct_obj | null): number {
  let nut = otmp.otyp === CORPSE ? G.mons[otmp.corpsenm].cnutrit : otmp.globby | 0 ? otmp.owt : G.objects[otmp.otyp].oc_nutrition;
  if (otmp.otyp === LEMBAS_WAFER) {
    if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 16) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 260 ? 1 : 0) {
      nut = nut + (nut / 4 >>> 0) >>> 0;
    } else if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 128) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 71 ? 1 : 0) {
      nut = nut - (nut / 4 >>> 0) >>> 0;
    }
    if (otmp.oeaten >= nut) {
      otmp.oeaten = otmp.oeaten < G.objects[LEMBAS_WAFER].oc_nutrition ? nut - 1 >>> 0 : nut;
    }
  } else if (otmp.otyp === CRAM_RATION) {
    if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 32) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 43 ? 1 : 0) {
      nut = nut + (nut / 6 >>> 0) >>> 0;
    }
  }
  return nut;
}

async function touchfood(otmp: struct_obj | null): Promise<struct_obj | null> {
  if (otmp.quan > 1) {
    if (!(otmp.where === 3)) {
      await splitobj(otmp, otmp.quan - 1);
    } else {
      otmp = await splitobj(otmp, 1);
    }
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("split object,"));
      }
    } while (0);
  }
  if (!otmp.oeaten) {
    await costly_alteration(otmp, COST_BITE);
    otmp.oeaten = obj_nutrition(otmp);
  }
  if (otmp.where === 3) {
    await freeinv(otmp);
    if (inv_cnt(FALSE) >= 52) {
      sellobj_state(SELL_DONTSELL);
      await dropy(otmp);
      sellobj_state(SELL_NORMAL);
    } else {
      otmp.nomerge = 1;
      otmp = await addinv(otmp);
      otmp.nomerge = 0;
    }
  }
  return otmp;
}

export async function food_disappears(obj: struct_obj | null): Promise<void> {
  if (obj === G.context.victual.piece) {
    G.context.victual.piece = null;
    G.context.victual.o_id = 0;
  }
  if (obj.timed) {
    await obj_stop_timers(obj);
  }
}

export function food_substitution(old_obj: struct_obj | null, new_obj: struct_obj | null): void {
  if (old_obj === G.context.victual.piece) {
    G.context.victual.piece = new_obj;
    G.context.victual.o_id = new_obj.o_id;
  }
  if (old_obj === G.context.tin.tin) {
    G.context.tin.tin = new_obj;
    G.context.tin.o_id = new_obj.o_id;
  }
}

async function do_reset_eat(): Promise<void> {
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("do_reset_eat..."));
    }
  } while (0);
  if (G.context.victual.piece) {
    G.context.victual.o_id = 0;
    G.context.victual.piece = await touchfood(G.context.victual.piece);
    if (G.context.victual.piece) {
      G.context.victual.o_id = G.context.victual.piece.o_id;
    }
    await recalc_wt();
  }
  G.context.victual.fullwarn = (G.context.victual.eating = (G.context.victual.doreset = (FALSE) & 1) & 1) & 1;
  await stop_occupation();
  await newuhs(FALSE);
}

async function eatfood(): Promise<number> {
  if (!G.context.victual.piece || !(G.context.victual.piece.where === 3) && !obj_here(G.context.victual.piece, G.u.ux, G.u.uy)) {
    await do_reset_eat();
    return 0;
  }
  if (!G.context.victual.eating) {
    return 0;
  }
  if (++G.context.victual.usedtime <= G.context.victual.reqtime) {
    if (await bite()) {
      return 0;
    }
    return 1;
  } else {
    await done_eating(TRUE);
    return 0;
  }
}

async function done_eating(message: number): Promise<void> {
  let piece = G.context.victual.piece;
  piece.in_use = (TRUE) & 1;
  G.occupation = null;
  await newuhs(FALSE);
  if (G.nomovemsg) {
    if (message) {
      await pline(S("%s"), G.nomovemsg);
    }
    G.nomovemsg = null;
  } else if (message) {
    await You(S("finish eating %s."), await food_xname(piece, TRUE));
  }
  if (piece.otyp === CORPSE || piece.globby | 0) {
    await cpostfx(piece.corpsenm);
  } else {
    await fpostfx(piece);
  }
  if (piece.where === 3) {
    await useup(piece);
  } else {
    await useupf(piece, 1);
  }
  G.context.victual.piece = null;
  G.context.victual.o_id = 0;
  G.context.victual.fullwarn = (G.context.victual.eating = (G.context.victual.doreset = (FALSE) & 1) & 1) & 1;
}

export async function eating_conducts(pd: struct_permonst | null): Promise<void> {
  ++G.u.uconduct.food;
  if (!(pd.mlet === S_BLOB || pd.mlet === S_JELLY || pd.mlet === S_FUNGUS || pd.mlet === S_VORTEX || pd.mlet === S_LIGHT || pd.mlet === S_ELEMENTAL && pd !== $sat(G.mons, 150) || pd.mlet === S_GOLEM && pd !== $sat(G.mons, 251) && pd !== $sat(G.mons, 249) || pd.mlet === S_GHOST)) {
    ++G.u.uconduct.unvegan;
  }
  if (!(pd.mlet === S_BLOB || pd.mlet === S_JELLY || pd.mlet === S_FUNGUS || pd.mlet === S_VORTEX || pd.mlet === S_LIGHT || pd.mlet === S_ELEMENTAL && pd !== $sat(G.mons, 150) || pd.mlet === S_GOLEM && pd !== $sat(G.mons, 251) && pd !== $sat(G.mons, 249) || pd.mlet === S_GHOST || pd.mlet === S_PUDDING && pd !== $sat(G.mons, 206))) {
    await violated_vegetarian();
  }
}

export async function eat_brains(magr: struct_monst | null, mdef: struct_monst | null, visflag: number, dmg_p: Ptr | null): Promise<number> {
  let pd = mdef.data;
  let give_nutrit = FALSE;
  let result = MM_HIT;
  let xtra_dmg = rnd(10);
  if (pd.mlet === S_GHOST) {
    if (visflag) {
      await pline(S("%s brain is unharmed."), mdef === G.youmonst ? S("Your") : s_suffix(await Monnam(mdef)));
    }
    return MM_MISS;
  } else if (magr === G.youmonst) {
    await You(S("eat %s brain!"), s_suffix(await mon_nam(mdef)));
  } else if (mdef === G.youmonst) {
    await Your(S("brain is eaten!"));
  } else {
    if (visflag && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
      await pline(S("%s brain is eaten!"), s_suffix(await Monnam(mdef)));
    }
  }
  if (pd === $sat(G.mons, 10) || pd === $sat(G.mons, 9) || pd === $sat(G.mons, 280)) {
    if (magr === G.youmonst) {
      if (!(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !G.u.uprops[STONED].intrinsic) {
        await make_stoned(5, null, KILLED_BY_AN, pd.mname);
      }
    } else {
      if (visflag && ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected))) {
        await pline(S("%s turns to stone!"), await Monnam(magr));
      }
      await monstone(magr);
      if (!(magr.mhp < 1)) {
        return MM_MISS;
      } else {
        if (magr.mtame && !visflag) {
          await You(S("have a sad thought for a moment, then it passes."));
        }
        return MM_AGR_DIED;
      }
    }
  }
  if (magr === G.youmonst) {
    await eating_conducts(pd);
    if ((pd.mflags1 & 65536) >>> 0 !== 0) {
      await pline(S("%s doesn't notice."), await Monnam(mdef));
      return MM_MISS;
    } else if (pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309)) {
      await pline(S("Ingesting that is fatal."));
      sprintf(P(G.killer.name), S("unwisely ate the brain of %s"), pd.mname);
      G.killer.format = NO_KILLER_PREFIX;
      await done(DIED);
      await exercise(A_WIS, FALSE);
      dmg_p.a[dmg_p.o] += xtra_dmg;
    } else {
      await morehungry(-rnd(30));
      if (G.u.acurr.a[A_INT] < G.u.amax.a[A_INT]) {
        G.u.acurr.a[A_INT] += rnd(4);
        if (G.u.acurr.a[A_INT] > G.u.amax.a[A_INT]) {
          G.u.acurr.a[A_INT] = G.u.amax.a[A_INT];
        }
        G.context.botl = 1;
      }
      await exercise(A_WIS, TRUE);
      dmg_p.a[dmg_p.o] += xtra_dmg;
    }
    await maybe_cannibal(await monsndx(pd), TRUE);
  } else if (mdef === G.youmonst) {
    if (G.u.acurr.a[A_INT] <= G.urace.attrmin[A_INT]) {
      if (G.u.uprops[LIFESAVED].extrinsic) {
        strcpy(P(G.killer.name), P(eat_brains$brainlessness));
        G.killer.format = KILLED_BY;
        await done(DIED);
        await pline(S("Unfortunately your brain is still gone."));
        G.u.uprops[LIFESAVED].extrinsic = G.u.uprops[LIFESAVED].intrinsic = 0;
      } else {
        await Your(S("last thought fades away."));
      }
      strcpy(P(G.killer.name), P(eat_brains$brainlessness));
      G.killer.format = KILLED_BY;
      await done(DIED);
      G.u.acurr.a[A_INT] = G.urace.attrmin[A_INT] + 2 << 24 >> 24;
      await You_feel(S("like a scarecrow."));
    }
    give_nutrit = TRUE;
    await exercise(A_WIS, FALSE);
  } else {
    if ((pd.mflags1 & 65536) >>> 0 !== 0) {
      if (visflag && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
        await pline(S("%s doesn't notice."), await Monnam(mdef));
      }
      return MM_MISS;
    } else if (pd === $sat(G.mons, 308) || pd === $sat(G.mons, 310) || pd === $sat(G.mons, 309)) {
      await mondied(magr);
      if (magr.mhp < 1) {
        result = MM_AGR_DIED;
      }
      dmg_p.a[dmg_p.o] += xtra_dmg;
    } else {
      dmg_p.a[dmg_p.o] += xtra_dmg;
      give_nutrit = TRUE;
      if (dmg_p.a[dmg_p.o] >= mdef.mhp && visflag && ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mdef && mdef.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 1 ? 1 : 0) && ((!mdef.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mdef.mundetected) || (!((mdef.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mdef.mx, mdef.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mdef.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mdef.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mdef.data)))) {
        await pline(S("%s last thought fades away..."), s_suffix(await Monnam(mdef)));
      }
    }
  }
  if (give_nutrit && magr.mtame && !magr.isminion) {
    magr.mextra.edog.hungrytime += rnd(60);
    magr.mconf = 0;
  }
  return result;
}

async function maybe_cannibal(pm: number, allowmsg: number): Promise<number> {
  let $t1: any;
  let fptr = $sat(G.mons, pm);
  if (G.moves === maybe_cannibal$ate_brains) {
    return FALSE;
  }
  maybe_cannibal$ate_brains = G.moves;
  if (!(G.urole.malenum === 330 || G.urace.malenum === 71) && ((fptr.mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0 || G.u.umonnum !== G.u.umonster && await same_race(G.youmonst.data, fptr) || G.u.ulycn >= LOW_PM && were_beastie(pm) === G.u.ulycn)) {
    if (allowmsg) {
      if (G.u.umonnum !== G.u.umonster && (fptr.mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0) {
        await You(S("have a bad feeling deep inside."));
      }
      await You(S("cannibal!  You will regret this!"));
    }
    ($t1 = G.u.uprops[AGGRAVATE_MONSTER], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
    change_luck(-(rn2(4) + 2));
    return TRUE;
  }
  return FALSE;
}

async function cprefx(pm: number): Promise<void> {
  let $t1: any;
  await maybe_cannibal(pm, TRUE);
  if ($sat(G.mons, pm) === $sat(G.mons, 10) || $sat(G.mons, pm) === $sat(G.mons, 9) || $sat(G.mons, pm) === $sat(G.mons, 280)) {
    if (!(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
      sprintf(P(G.killer.name), S("tasting %s meat"), G.mons[pm].mname);
      G.killer.format = KILLED_BY;
      await You(S("turn to stone."));
      await done(STONING);
      if (G.context.victual.piece) {
        G.context.victual.eating = (FALSE) & 1;
      }
      return;
    }
  }
  switch (pm) {
  case 16:
  case 18:
  case 19:
  case 32:
  case 33:
  case 37:
    if (!(G.urole.malenum === 330 || G.urace.malenum === 71)) {
      await You_feel(S("that eating the %s was a bad idea."), G.mons[pm].mname);
      ($t1 = G.u.uprops[AGGRAVATE_MONSTER], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
    }
    break;
  case 323:
    if (G.u.uprops[STONED].intrinsic) {
      await fix_petrification();
    }
    break;
  case 308:
  case 309:
  case 310:
    {
      await pline(S("Eating that is instantly fatal."));
      sprintf(P(G.killer.name), S("unwisely ate the body of %s"), G.mons[pm].mname);
      G.killer.format = NO_KILLER_PREFIX;
      await done(DIED);
      await exercise(A_WIS, FALSE);
      if (await revive_corpse(G.context.victual.piece)) {
        G.context.victual.piece = null;
        G.context.victual.o_id = 0;
      }
      return;
    }
  case 205:
    if (!G.u.uprops[SLIMED].intrinsic && !(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && !(G.youmonst.data === $sat(G.mons, 205) || (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) || G.youmonst.data.mlet === S_GHOST)) {
      await You(S("don't feel very well."));
      await make_slimed(10, null);
      await delayed_killer(SLIMED, KILLED_BY_AN, S(""));
    }
  default:
    if (($sat(G.mons, pm).mflags1 & 134217728) >>> 0 !== 0 && G.u.uprops[STONED].intrinsic) {
      await fix_petrification();
    }
    break;
  }
}

export async function fix_petrification(): Promise<void> {
  let buf = new Int8Array(256);
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    sprintf(P(buf), S("What a pity--you just ruined a future piece of %sart!"), acurr(A_CHA) > 15 ? S("fine ") : S(""));
  } else {
    strcpy(P(buf), S("You feel limber!"));
  }
  await make_stoned(0, P(buf), 0, null);
}

async function intrinsic_possible(type: number, ptr: struct_permonst | null): Promise<number> {
  let res = 0;
  switch (type) {
  case FIRE_RES:
    res = (ptr.mconveys & MR_FIRE) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get fire resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case SLEEP_RES:
    res = (ptr.mconveys & MR_SLEEP) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get sleep resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case COLD_RES:
    res = (ptr.mconveys & MR_COLD) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get cold resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case DISINT_RES:
    res = (ptr.mconveys & MR_DISINT) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get disintegration resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case SHOCK_RES:
    res = (ptr.mconveys & MR_ELEC) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get shock resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case POISON_RES:
    res = (ptr.mconveys & MR_POISON) !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get poison resistance"));
          }
        } while (0);
      }
    } while (0);
    break;
  case TELEPORT:
    res = (ptr.mflags1 & 33554432) >>> 0 !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get teleport"));
          }
        } while (0);
      }
    } while (0);
    break;
  case TELEPORT_CONTROL:
    res = (ptr.mflags1 & 67108864) >>> 0 !== 0 ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get teleport control"));
          }
        } while (0);
      }
    } while (0);
    break;
  case TELEPAT:
    res = ptr === $sat(G.mons, 28) || ptr === $sat(G.mons, 47) || ptr === $sat(G.mons, 48) ? 1 : 0;
    do {
      if (res) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("can get telepathy"));
          }
        } while (0);
      }
    } while (0);
    break;
  default:
    break;
  }
  return res;
}

async function givit(type: number, ptr: struct_permonst | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any;
  let chance = 0;
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("Attempting to give intrinsic %d"), type);
    }
  } while (0);
  switch (type) {
  case POISON_RES:
    if ((ptr === $sat(G.mons, PM_KILLER_BEE) || ptr === $sat(G.mons, PM_SCORPION)) && !rn2(4)) {
      chance = 1;
    } else {
      chance = 15;
    }
    break;
  case TELEPORT:
    chance = 10;
    break;
  case TELEPORT_CONTROL:
    chance = 12;
    break;
  case TELEPAT:
    chance = 1;
    break;
  default:
    chance = 15;
    break;
  }
  if (ptr.mlevel <= rn2(chance)) {
    return;
  }
  switch (type) {
  case FIRE_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give fire resistance"));
      }
    } while (0);
    if (!(G.u.uprops[FIRE_RES].intrinsic & FROMOUTSIDE)) {
      await You(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("be chillin'.") : S("feel a momentary chill."));
      ($t1 = G.u.uprops[FIRE_RES], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
    }
    break;
  case SLEEP_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give sleep resistance"));
      }
    } while (0);
    if (!(G.u.uprops[SLEEP_RES].intrinsic & FROMOUTSIDE)) {
      await You_feel(S("wide awake."));
      ($t2 = G.u.uprops[SLEEP_RES], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
    }
    break;
  case COLD_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give cold resistance"));
      }
    } while (0);
    if (!(G.u.uprops[COLD_RES].intrinsic & FROMOUTSIDE)) {
      await You_feel(S("full of hot air."));
      ($t3 = G.u.uprops[COLD_RES], $t3.intrinsic = $t3.intrinsic | FROMOUTSIDE);
    }
    break;
  case DISINT_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give disintegration resistance"));
      }
    } while (0);
    if (!(G.u.uprops[DISINT_RES].intrinsic & FROMOUTSIDE)) {
      await You_feel(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("totally together, man.") : S("very firm."));
      ($t4 = G.u.uprops[DISINT_RES], $t4.intrinsic = $t4.intrinsic | FROMOUTSIDE);
    }
    break;
  case SHOCK_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give shock resistance"));
      }
    } while (0);
    if (!(G.u.uprops[SHOCK_RES].intrinsic & FROMOUTSIDE)) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await You_feel(S("grounded in reality."));
      } else {
        await Your(S("health currently feels amplified!"));
      }
      ($t5 = G.u.uprops[SHOCK_RES], $t5.intrinsic = $t5.intrinsic | FROMOUTSIDE);
    }
    break;
  case POISON_RES:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give poison resistance"));
      }
    } while (0);
    if (!(G.u.uprops[POISON_RES].intrinsic & FROMOUTSIDE)) {
      await You_feel(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? S("especially healthy.") : S("healthy."));
      ($t6 = G.u.uprops[POISON_RES], $t6.intrinsic = $t6.intrinsic | FROMOUTSIDE);
    }
    break;
  case TELEPORT:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give teleport"));
      }
    } while (0);
    if (!(G.u.uprops[TELEPORT].intrinsic & FROMOUTSIDE)) {
      await You_feel(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("diffuse.") : S("very jumpy."));
      ($t7 = G.u.uprops[TELEPORT], $t7.intrinsic = $t7.intrinsic | FROMOUTSIDE);
    }
    break;
  case TELEPORT_CONTROL:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give teleport control"));
      }
    } while (0);
    if (!(G.u.uprops[TELEPORT_CONTROL].intrinsic & FROMOUTSIDE)) {
      await You_feel(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("centered in your personal space.") : S("in control of yourself."));
      ($t8 = G.u.uprops[TELEPORT_CONTROL], $t8.intrinsic = $t8.intrinsic | FROMOUTSIDE);
    }
    break;
  case TELEPAT:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Trying to give telepathy"));
      }
    } while (0);
    if (!(G.u.uprops[TELEPAT].intrinsic & FROMOUTSIDE)) {
      await You_feel(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("in touch with the cosmos.") : S("a strange mental acuity."));
      ($t9 = G.u.uprops[TELEPAT], $t9.intrinsic = $t9.intrinsic | FROMOUTSIDE);
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await see_monsters();
      }
    }
    break;
  default:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("Tried to give an impossible intrinsic"));
      }
    } while (0);
    break;
  }
}

async function cpostfx(pm: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let tmp = 0;
  let catch_lycanthropy = NON_PM;
  let check_intrinsics = FALSE;
  if (eatmbuf) {
    await eatmdone();
  }
  switch (pm) {
  case 319:
    if (rn2(3) || 3 * G.u.uen <= 2 * G.u.uenmax) {
      let old_uen = G.u.uen;
      G.u.uen += rnd(3);
      if (G.u.uen > G.u.uenmax) {
        if (!rn2(3)) {
          ++G.u.uenmax;
        }
        G.u.uen = G.u.uenmax;
      }
      if (old_uen !== G.u.uen) {
        await You_feel(S("a mild buzz."));
        G.context.botl = 1;
      }
    }
    break;
  case 226:
    await pluslvl(FALSE);
    break;
  case 257:
    catch_lycanthropy = PM_WERERAT;
    break;
  case 258:
    catch_lycanthropy = PM_WEREJACKAL;
    break;
  case 259:
    catch_lycanthropy = PM_WEREWOLF;
    break;
  case 275:
    if (G.u.umonnum !== G.u.umonster) {
      G.u.mh = G.u.mhmax;
    } else {
      G.u.uhp = G.u.uhpmax;
    }
    await make_blinded(0, !G.u.ucreamed ? 1 : 0);
    G.context.botl = 1;
    check_intrinsics = TRUE;
    break;
  case 150:
    if (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked)) {
      set_itimeout(P(G.u.uprops[INVIS], "intrinsic"), rn2(100) + 50);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !G.u.uprops[INVIS].blocked) {
        await self_invis_message();
      }
    } else {
      if (!(G.u.uprops[INVIS].intrinsic & INTRINSIC)) {
        await You_feel(S("hidden!"));
      }
      ($t1 = G.u.uprops[INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
      ($t2 = G.u.uprops[SEE_INVIS], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
    }
    await newsym(G.u.ux, G.u.uy);
  case 117:
  case 126:
    await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + 30, FALSE);
  case 125:
    await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + 30, FALSE);
    break;
  case 65:
    tmp += 10;
  case 64:
    tmp += 20;
  case 63:
    tmp += 20;
    if (G.youmonst.data.mlet !== S_MIMIC && !(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
      let buf = new Int8Array(256);
      ++G.u.uconduct.polyselfs;
      await You_cant(S("resist the temptation to mimic %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("an orange") : S("a pile of gold"));
      if (G.u.usteed) {
        await dismount_steed(DISMOUNT_FELL);
      }
      nomul(-tmp);
      G.multi_reason = S("pretending to be a pile of gold");
      sprintf(P(buf), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("You suddenly dread being peeled and mimic %s again!") : S("You now prefer mimicking %s again."), await an(G.u.umonnum !== G.u.umonster ? G.youmonst.data.mname : G.urace.noun));
      eatmbuf = await dupstr(P(buf));
      G.nomovemsg = eatmbuf;
      G.afternmv = eatmdone;
      G.youmonst.m_ap_type = M_AP_OBJECT;
      G.youmonst.mappearance = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? ORANGE : GOLD_PIECE) >>> 0;
      await newsym(G.u.ux, G.u.uy);
      await curs_on_u();
      await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
    }
    break;
  case 207:
    await Your(S("velocity suddenly seems very uncertain!"));
    if (G.u.uprops[FAST].intrinsic & INTRINSIC) {
      ($t3 = G.u.uprops[FAST], $t3.intrinsic = $t3.intrinsic & ~INTRINSIC);
      await You(S("seem slower."));
    } else {
      ($t4 = G.u.uprops[FAST], $t4.intrinsic = $t4.intrinsic | FROMOUTSIDE);
      await You(S("seem faster."));
    }
    break;
  case 323:
    if ((G.u.uprops[STUNNED].intrinsic & TIMEOUT) > 2) {
      await make_stunned(2, FALSE);
    }
    if ((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) > 2) {
      await make_confused(2, FALSE);
    }
    break;
  case 324:
  case 266:
  case 298:
    if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
      await You_feel(S("momentarily different."));
    } else {
      await You_feel(S("a change coming over you."));
      await polyself(0);
    }
    break;
  case 209:
    do {
      if (await debugcore(S("eat.c"), 1)) {
        await pline(S("using attrcurse to strip an intrinsic"));
      }
    } while (0);
    await attrcurse();
    break;
  case 47:
  case 48:
    if (G.u.acurr.a[A_INT] < (A_INT === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[A_INT])) {
      if (!rn2(2)) {
        await pline(S("Yum!  That was real brain food!"));
        await adjattrib(A_INT, 1, FALSE);
        break;
      }
    } else {
      await pline(S("For some reason, that tasted bland."));
    }
  default:
    check_intrinsics = TRUE;
    break;
  }
  if (check_intrinsics) {
    let ptr = $sat(G.mons, pm);
    let conveys_STR = ((ptr.mflags2 & 8192) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    let i = 0;
    let count = 0;
    if (dmgtype(ptr, AD_STUN) || dmgtype(ptr, AD_HALU) || pm === PM_VIOLET_FUNGUS) {
      await pline(S("Oh wow!  Great stuff!"));
      await make_hallucinated((G.u.uprops[HALLUC].intrinsic & TIMEOUT) + 200, FALSE, 0);
    }
    count = 0;
    tmp = 0;
    if (conveys_STR) {
      count = 1;
      tmp = -1;
      do {
        if (await debugcore(S("eat.c"), 1)) {
          await pline(S("\"Intrinsic\" strength, %d"), tmp);
        }
      } while (0);
    }
    for (i = 1; i <= LAST_PROP; ++i) {
      if (!await intrinsic_possible(i, ptr)) {
        continue;
      }
      ++count;
      if (!rn2(count)) {
        do {
          if (await debugcore(S("eat.c"), 1)) {
            await pline(S("Intrinsic %d replacing %d"), i, tmp);
          }
        } while (0);
        tmp = i;
      }
    }
    if (conveys_STR && count === 1 && !rn2(2)) {
      tmp = 0;
    }
    if (tmp === -1) {
      await gainstr(null, 0, TRUE);
    } else if (tmp > 0) {
      await givit(tmp, ptr);
    }
  }
  if (catch_lycanthropy >= LOW_PM) {
    await set_ulycn(catch_lycanthropy);
    await retouch_equipment(2);
  }
  return;
}

export async function violated_vegetarian(): Promise<void> {
  ++G.u.uconduct.unvegetarian;
  if (G.urole.malenum === 334) {
    await You_feel(S("guilty."));
    adjalign(-1);
  }
  return;
}

async function costly_tin(alter_type: number): Promise<struct_obj | null> {
  let tin = G.context.tin.tin;
  if (tin.where === 3 ? tin.unpaid | 0 : await costly_spot(tin.ox, tin.oy) && !tin.no_charge ? 1 : 0) {
    if (tin.quan > 1) {
      tin = G.context.tin.tin = await splitobj(tin, 1);
      G.context.tin.o_id = tin.o_id;
    }
    await costly_alteration(tin, alter_type);
  }
  return tin;
}

export function tin_variety_txt(s: Ptr | null, tinvariety: Ptr | null): number {
  let k = 0;
  let l = 0;
  if (s && tinvariety) {
    tinvariety.a[tinvariety.o] = -1;
    for (k = 0; k < (Math.trunc(256 / 16) | 0) - 1; ++k) {
      l = strlen(tintxts[k].txt) | 0;
      if (!strncmpi(s, tintxts[k].txt, l) && (strlen(s) | 0) > l && s.a[s.o + l] === 32) {
        tinvariety.a[tinvariety.o] = k;
        return l + 1;
      }
    }
  }
  return 0;
}

export function tin_details(obj: struct_obj | null, mnum: number, buf: Ptr | null): void {
  let buf2 = new Int8Array(256);
  let r = tin_variety(obj, TRUE);
  if (obj && buf) {
    if (r === SPINACH_TIN) {
      strcat(buf, S(" of spinach"));
    } else if (mnum === NON_PM) {
      strcpy(buf, S("empty tin"));
    } else {
      if ((obj.cknown | 0 || G.iflags.override_ID) && obj.spe < 0) {
        if (r === ROTTEN_TIN || r === HOMEMADE_TIN) {
          sprintf(P(buf2), S("%s %s of "), tintxts[r].txt, buf);
          strcpy(buf, P(buf2));
        } else {
          sprintf(eos(buf), S(" of %s "), tintxts[r].txt);
        }
      } else {
        strcpy(eos(buf), S(" of "));
      }
      if ($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206)) {
        sprintf(eos(buf), S("%s"), G.mons[mnum].mname);
      } else {
        sprintf(eos(buf), S("%s meat"), G.mons[mnum].mname);
      }
    }
  }
}

export function set_tin_variety(obj: struct_obj | null, forcetype: number): void {
  let r = 0;
  if (forcetype === SPINACH_TIN || forcetype === HEALTHY_TIN && (obj.corpsenm === NON_PM || !($sat(G.mons, obj.corpsenm).mlet === S_BLOB || $sat(G.mons, obj.corpsenm).mlet === S_JELLY || $sat(G.mons, obj.corpsenm).mlet === S_FUNGUS || $sat(G.mons, obj.corpsenm).mlet === S_VORTEX || $sat(G.mons, obj.corpsenm).mlet === S_LIGHT || $sat(G.mons, obj.corpsenm).mlet === S_ELEMENTAL && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 150) || $sat(G.mons, obj.corpsenm).mlet === S_GOLEM && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 251) && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 249) || $sat(G.mons, obj.corpsenm).mlet === S_GHOST || $sat(G.mons, obj.corpsenm).mlet === S_PUDDING && $sat(G.mons, obj.corpsenm) !== $sat(G.mons, 206)))) {
    obj.corpsenm = NON_PM;
    obj.spe = 1;
    return;
  } else if (forcetype === HEALTHY_TIN) {
    r = tin_variety(obj, FALSE);
    if (r < 0 || r >= (Math.trunc(256 / 16) | 0)) {
      r = ROTTEN_TIN;
    }
    while (r === ROTTEN_TIN && !obj.cursed || !tintxts[r].fodder) {
      r = rn2((Math.trunc(256 / 16) | 0) - 1);
    }
  } else if (forcetype >= 0 && forcetype < (Math.trunc(256 / 16) | 0) - 1) {
    r = forcetype;
  } else {
    r = rn2((Math.trunc(256 / 16) | 0) - 1);
    if (r === ROTTEN_TIN && (obj.corpsenm === 323 || obj.corpsenm === 155 || ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 309)))) {
      r = HOMEMADE_TIN;
    }
  }
  obj.spe = -(r + 1) << 24 >> 24;
}

function tin_variety(obj: struct_obj | null, disp: number): number {
  let r = 0;
  if (obj.spe === 1) {
    r = SPINACH_TIN;
  } else if (obj.cursed) {
    r = ROTTEN_TIN;
  } else if (obj.spe < 0) {
    r = -obj.spe;
    --r;
  } else {
    r = rn2((Math.trunc(256 / 16) | 0) - 1);
  }
  if (!disp && r === HOMEMADE_TIN && !obj.blessed && !rn2(7)) {
    r = ROTTEN_TIN;
  }
  if (r === ROTTEN_TIN && (obj.corpsenm === 323 || obj.corpsenm === 155 || ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 309)))) {
    r = HOMEMADE_TIN;
  }
  return r;
}

async function consume_tin(mesg: Ptr | null): Promise<void> {
  let $g = 0;
  let what = null;
  let which = 0;
  let mnum = 0;
  let r = 0;
  let tin = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      tin = G.context.tin.tin;
      r = tin_variety(tin, FALSE);
      if (tin.otrapped | 0 || tin.cursed | 0 && r !== HOMEMADE_TIN && !rn2(8)) {
        await b_trapped(S("tin"), 0);
        tin = await costly_tin(COST_DSTROY);
        { $g = 1; continue $L; }
      }
      await pline(S("%s"), mesg);
      if (r !== SPINACH_TIN) {
        mnum = tin.corpsenm;
        if (mnum === NON_PM) {
          await pline(S("It turns out to be empty."));
          tin.dknown = (tin.known = 1) & 1;
          tin = await costly_tin(COST_OPEN);
          { $g = 1; continue $L; }
        }
        which = 0;
        if ((mnum === PM_COCKATRICE || mnum === PM_CHICKATRICE) && (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          what = S("chicken");
          which = 1;
        } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          what = await rndmonnam(null);
        } else {
          what = G.mons[mnum].mname;
          if (the_unique_pm($sat(G.mons, mnum))) {
            which = 2;
          } else if (($sat(G.mons, mnum).mflags2 & 524288) >>> 0 !== 0) {
            which = 1;
          }
        }
        if (which === 0) {
          what = await makeplural(what);
        } else if (which === 2) {
          what = await the(what);
        }
        await pline(S("It smells like %s."), what);
        if (await yn_function(S("Eat it?"), P(G.ynchars), 110) === 110) {
          if (G.flags.verbose) {
            await You(S("discard the open tin."));
          }
          if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
            tin.dknown = (tin.known = 1) & 1;
          }
          tin = await costly_tin(COST_OPEN);
          { $g = 1; continue $L; }
        }
        G.context.victual.piece = null;
        G.context.victual.o_id = 0;
        G.context.victual.fullwarn = (G.context.victual.eating = (G.context.victual.doreset = (FALSE) & 1) & 1) & 1;
        await You(S("consume %s %s."), tintxts[r].txt, G.mons[mnum].mname);
        await eating_conducts($sat(G.mons, mnum));
        tin.dknown = (tin.known = 1) & 1;
        await cprefx(mnum);
        await cpostfx(mnum);
        tin = await costly_tin(COST_OPEN);
        if (tintxts[r].nut < 0) {
          await make_vomiting(rn2(15) + 10, FALSE);
        } else {
          await lesshungry(tintxts[r].nut);
        }
        if (tintxts[r].greasy) {
          make_glib(rn2(11) + 5);
          await pline(S("Eating %s food made your %s very slippery."), tintxts[r].txt, await fingers_or_gloves(TRUE));
        }
      } else {
        if (tin.cursed) {
          await pline(S("It contains some decaying%s%s substance."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S(" "), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : hcolor(G.c_color_names.c_green));
        } else {
          await pline(S("It contains spinach."));
          tin.dknown = (tin.known = 1) & 1;
        }
        if (await yn_function(S("Eat it?"), P(G.ynchars), 110) === 110) {
          if (G.flags.verbose) {
            await You(S("discard the open tin."));
          }
          tin = await costly_tin(COST_OPEN);
          { $g = 1; continue $L; }
        }
        ++G.u.uconduct.food;
        if (!tin.cursed) {
          await pline(S("This makes you feel like %s!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Swee'pea") : !G.u.uprops[FIXED_ABIL].extrinsic ? S("Popeye") : G.flags.female ? S("Olive Oyl") : S("Bluto"));
        }
        await gainstr(tin, 0, FALSE);
        tin = await costly_tin(COST_OPEN);
        await lesshungry(tin.blessed | 0 ? 600 : !tin.cursed ? 400 + rnd(200) : 200 + rnd(400));
      }
    case 1: // use_up_tin
      if (tin.where === 3) {
        await useup(tin);
      } else {
        await useupf(tin, 1);
      }
      G.context.tin.tin = null;
      G.context.tin.o_id = 0;
    }
    break;
  }
}

async function opentin(): Promise<number> {
  if (!(G.context.tin.tin.where === 3) && (!obj_here(G.context.tin.tin, G.u.ux, G.u.uy) || !can_reach_floor(TRUE))) {
    return 0;
  }
  if (G.context.tin.usedtime++ >= 50) {
    await You(S("give up your attempt to open the tin."));
    return 0;
  }
  if (G.context.tin.usedtime < G.context.tin.reqtime) {
    return 1;
  }
  await consume_tin(S("You succeed in opening the tin."));
  return 0;
}

async function start_tin(otmp: struct_obj | null): Promise<void> {
  let $g = 0;
  let mesg = null;
  let tmp = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mesg = null;
      if (!((G.youmonst.data.mflags1 & 2147483648) >>> 0 !== 0)) { $g = 3; continue $L; }
      {
        mesg = S("You bite right into the metal tin...");
        tmp = 0;
      }
      { $g = 2; continue $L; }
    case 3:
      if (!((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1)) { $g = 5; continue $L; }
      {
        await You(S("cannot handle the tin properly to open it."));
        return;
      }
      { $g = 4; continue $L; }
    case 5:
      if (!otmp.blessed) { $g = 7; continue $L; }
      {
        tmp = G.uwep && G.uwep.blessed | 0 && G.uwep.otyp === TIN_OPENER ? 0 : rn2(2);
        if (!tmp) {
          mesg = S("The tin opens like magic!");
        } else {
          await pline_The(S("tin seems easy to open."));
        }
      }
      { $g = 6; continue $L; }
    case 7:
      if (!G.uwep) { $g = 9; continue $L; }
      {
        switch (G.uwep.otyp) {
        case 214:
          mesg = S("You easily open the tin.");
          tmp = rn2(G.uwep.cursed | 0 ? 3 : !G.uwep.blessed ? 2 : 1);
          break;
        case 17:
        case 20:
        case 18:
        case 19:
        case 21:
        case 23:
        case 24:
        case 26:
          tmp = 3;
          break;
        case 234:
        case 27:
          tmp = 6;
          break;
        default:
          { $g = 1; continue $L; }
        }
        await pline(S("Using %s you try to open the tin."), await yobjnam(G.uwep, null));
      }
      { $g = 8; continue $L; }
    case 9:
    case 1: // no_opener
      await pline(S("It is not so easy to open this tin."));
      if (G.u.uprops[GLIB].intrinsic) {
        await pline_The(S("tin slips from your %s."), await fingers_or_gloves(FALSE));
        if (otmp.quan > 1) {
          otmp = await splitobj(otmp, 1);
        }
        if (otmp.where === 3) {
          await dropx(otmp);
        } else {
          await stackobj(otmp);
        }
        return;
      }
      tmp = rn2(1 + (500 / (acurr(A_DEX) + acurrstr()) | 0)) + 10;
    case 8:
    case 6:
    case 4:
    case 2:
      G.context.tin.tin = otmp;
      G.context.tin.o_id = otmp.o_id;
      if (!tmp) {
        await consume_tin(mesg);
      } else {
        G.context.tin.reqtime = tmp;
        G.context.tin.usedtime = 0;
        set_occupation(opentin, S("opening the tin"), 0);
      }
      return;
    }
    break;
  }
}

export async function Hear_again(): Promise<number> {
  if (!rn2(2)) {
    await make_deaf(0, FALSE);
    G.context.botl = TRUE;
  }
  return 0;
}

async function rottenfood(obj: struct_obj | null): Promise<number> {
  await pline(S("Blecch!  Rotten %s!"), await foodword(obj));
  if (!rn2(4)) {
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await You_feel(S("rather trippy."));
    } else {
      await You_feel(S("rather %s."), body_part(LIGHT_HEADED));
    }
    await make_confused(G.u.uprops[CONFUSION].intrinsic + d(2, 4), FALSE);
  } else if (!rn2(4) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await pline(S("Everything suddenly goes dark."));
    await make_blinded((G.u.uprops[BLINDED].intrinsic & TIMEOUT) + d(2, 10), FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await Your(S("%s"), G.c_common_strings.c_vision_clears);
    }
  } else if (!rn2(3)) {
    let what = null;
    let where = null;
    let duration = rnd(10);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      what = S("goes"), where = S("dark");
    } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
      what = S("you lose control of"), where = S("yourself");
    } else {
      what = S("you slap against the"), where = G.u.usteed ? S("saddle") : surface(G.u.ux, G.u.uy);
    }
    await pline_The(S("world spins and %s %s."), what, where);
    incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), duration);
    G.context.botl = TRUE;
    nomul(-duration);
    G.multi_reason = S("unconscious from rotten food");
    G.nomovemsg = S("You are conscious again.");
    G.afternmv = Hear_again;
    return 1;
  }
  return 0;
}

async function eatcorpse(otmp: struct_obj | null): Promise<number> {
  let retcode = 0;
  let tp = 0;
  let mnum = otmp.corpsenm;
  let rotted = 0;
  let stoneable = (($sat(G.mons, mnum) === $sat(G.mons, 10) || $sat(G.mons, mnum) === $sat(G.mons, 9) || $sat(G.mons, mnum) === $sat(G.mons, 280)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !poly_when_stoned(G.youmonst.data) ? 1 : 0) << 24 >> 24;
  let slimeable = (mnum === PM_GREEN_SLIME && !G.u.uprops[SLIMED].intrinsic && !(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && !(G.youmonst.data === $sat(G.mons, 205) || (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) || G.youmonst.data.mlet === S_GHOST) ? 1 : 0) << 24 >> 24;
  let glob = (otmp.globby | 0 ? TRUE : FALSE) << 24 >> 24;
  if (!($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST)) {
    ++G.u.uconduct.unvegan;
  }
  if (!($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206))) {
    await violated_vegetarian();
  }
  if (!(mnum === 323 || mnum === 155 || ($sat(G.mons, mnum) === $sat(G.mons, 308) || $sat(G.mons, mnum) === $sat(G.mons, 310) || $sat(G.mons, mnum) === $sat(G.mons, 309)))) {
    let age = await peek_at_iced_corpse_age(otmp);
    rotted = Math.trunc((G.monstermoves - age) / (10 + rn2(20)));
    if (otmp.cursed) {
      rotted += 2;
    } else if (otmp.blessed) {
      rotted -= 2;
    }
  }
  if (mnum !== PM_ACID_BLOB && !stoneable && !slimeable && rotted > 5) {
    let cannibal = await maybe_cannibal(mnum, FALSE);
    await pline(S("Ulch - that %s was tainted%s!"), G.mons[mnum].mlet === S_FUNGUS ? S("fungoid vegetation") : glob ? S("glob") : $sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206) ? S("protoplasm") : S("meat"), cannibal ? S(", you cannibal") : S(""));
    if (G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep)) {
      await pline(S("It doesn't seem at all sickening, though..."));
    } else {
      let sick_time = 0;
      sick_time = rn2(10) + 10;
      if (G.u.uprops[SICK].intrinsic && sick_time > G.u.uprops[SICK].intrinsic) {
        sick_time = G.u.uprops[SICK].intrinsic > 1 ? G.u.uprops[SICK].intrinsic - 1 : 1;
      }
      await make_sick(sick_time, await corpse_xname(otmp, S("rotted"), CXN_NORMAL), TRUE, SICK_VOMITABLE);
      await pline(S("(It must have died too long ago to be safe to eat.)"));
    }
    if (otmp.where === 3) {
      await useup(otmp);
    } else {
      await useupf(otmp, 1);
    }
    return 2;
  } else if (($sat(G.mons, mnum).mflags1 & 134217728) >>> 0 !== 0 && !(G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic)) {
    ++tp;
    await You(S("have a very bad case of stomach acid."));
    await losehp(rnd(15), !glob ? S("acidic corpse") : S("acidic glob"), KILLED_BY_AN);
  } else if (($sat(G.mons, mnum).mflags1 & 268435456) >>> 0 !== 0 && rn2(5)) {
    ++tp;
    await pline(S("Ecch - that must have been poisonous!"));
    if (!(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic)) {
      await losestr(rnd(4));
      await losehp(rnd(15), !glob ? S("poisonous corpse") : S("poisonous glob"), KILLED_BY_AN);
    } else {
      await You(S("seem unaffected by the poison."));
    }
  } else if ((rotted > 5 || rotted > 3 && rn2(5)) && !(G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep))) {
    ++tp;
    await You_feel(S("%ssick."), G.u.uprops[SICK].intrinsic ? S("very ") : S(""));
    await losehp(rnd(8), !glob ? S("cadaver") : S("rotted glob"), KILLED_BY_AN);
  }
  G.context.victual.reqtime = 3 + ((!glob ? G.mons[mnum].cwt : otmp.owt) >>> 6) >>> 0 | 0;
  if (!tp && !(mnum === 323 || mnum === 155 || ($sat(G.mons, mnum) === $sat(G.mons, 308) || $sat(G.mons, mnum) === $sat(G.mons, 310) || $sat(G.mons, mnum) === $sat(G.mons, 309))) && (otmp.oeroded | 0 || !rn2(7))) {
    if (await rottenfood(otmp)) {
      otmp.oeroded = (TRUE) & 3;
      await touchfood(otmp);
      retcode = 1;
    }
    if (!G.mons[otmp.corpsenm].cnutrit) {
      if (!retcode) {
        await pline_The(S("corpse rots away completely."));
      }
      if (otmp.where === 3) {
        await useup(otmp);
      } else {
        await useupf(otmp, 1);
      }
      retcode = 2;
    }
    if (!retcode) {
      consume_oeaten(otmp, 2);
    }
  } else if ((mnum === PM_COCKATRICE || mnum === PM_CHICKATRICE) && (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    await pline(S("This tastes just like chicken!"));
  } else if (mnum === PM_FLOATING_EYE && G.u.umonnum === PM_RAVEN) {
    await You(S("peck the eyeball with delight."));
  } else {
    let yummy = ($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST ? !((G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0) && (G.youmonst.data.mflags1 & 1073741824) >>> 0 !== 0 ? 1 : 0 : (G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 1073741824) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
    let palatable = (($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206) ? (G.youmonst.data.mflags1 & 1073741824) >>> 0 !== 0 ? 1 : 0 : (G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0 ? 1 : 0) && rn2(10) && (rotted < 1 ? TRUE : !rn2(rotted + 1 | 0) ? 1 : 0) ? 1 : 0) << 24 >> 24;
    let pmxnam = await food_xname(otmp, FALSE);
    if (!strncmpi(pmxnam, S("the "), 4)) {
      pmxnam = pmxnam.add(4);
    }
    await pline(S("%s%s %s %s%c"), ($sat(G.mons, mnum).mflags2 & 524288) >>> 0 !== 0 ? S("") : the_unique_pm($sat(G.mons, mnum)) ? S("The ") : S("This "), pmxnam, G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("is") : S("tastes"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? yummy ? G.u.umonnum === PM_TIGER ? S("gr-r-reat") : S("gnarly") : palatable ? S("copacetic") : S("grody") : yummy ? S("delicious") : palatable ? S("okay") : S("terrible"), yummy || !palatable ? 33 : 46);
  }
  return retcode;
}

async function start_eating(otmp: struct_obj | null, already_partly_eaten: number): Promise<void> {
  let old_nomovemsg = null;
  let save_nomovemsg = null;
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("start_eating: %s (victual = %s)"), fmt_ptr(otmp), fmt_ptr(G.context.victual.piece));
    }
  } while (0);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("reqtime = %d"), G.context.victual.reqtime);
    }
  } while (0);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("(original reqtime = %d)"), G.objects[otmp.otyp].oc_delay);
    }
  } while (0);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("nmod = %d"), G.context.victual.nmod);
    }
  } while (0);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("oeaten = %d"), otmp.oeaten);
    }
  } while (0);
  G.context.victual.fullwarn = (G.context.victual.doreset = (FALSE) & 1) & 1;
  G.context.victual.eating = (TRUE) & 1;
  if (otmp.otyp === CORPSE || otmp.globby | 0) {
    await cprefx(G.context.victual.piece.corpsenm);
    if (!G.context.victual.piece || !G.context.victual.eating) {
      return;
    }
  }
  old_nomovemsg = G.nomovemsg;
  if (await bite()) {
    if (++G.context.victual.usedtime >= G.context.victual.reqtime) {
      save_nomovemsg = G.nomovemsg;
      if (!old_nomovemsg) {
        G.nomovemsg = null;
      }
      await done_eating(FALSE);
      if (!old_nomovemsg) {
        G.nomovemsg = save_nomovemsg;
      }
    }
    return;
  }
  if (++G.context.victual.usedtime >= G.context.victual.reqtime) {
    await done_eating(G.context.victual.reqtime > 1 || already_partly_eaten ? TRUE : FALSE);
    return;
  }
  sprintf(P(G.msgbuf), S("eating %s"), await food_xname(otmp, TRUE));
  set_occupation(eatfood, P(G.msgbuf), 0);
}

async function fprefx(otmp: struct_obj | null): Promise<void> {
  let $g = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      switch (otmp.otyp) {
      case 268: { $g = 3; continue $L; }
      case 239: { $g = 4; continue $L; }
      case 266: { $g = 5; continue $L; }
      case 242: { $g = 6; continue $L; }
      case 243: { $g = 7; continue $L; }
      case 244: { $g = 8; continue $L; }
      case 245: { $g = 9; continue $L; }
      case 259: { $g = 10; continue $L; }
      default: { $g = 11; continue $L; }
      }
    case 3:
      if (G.u.uhunger <= 200) {
        await pline(S("%s!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Oh wow, like, superior, man") : S("This food really hits the spot"));
      } else if (G.u.uhunger < 700) {
        await pline(S("This satiates your %s!"), body_part(STOMACH));
      }
      { $g = 2; continue $L; };
    case 4:
      if ((G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0 && !((G.youmonst.data.mflags1 & 131072) >>> 0 !== 0)) {
        await pline(S("This tripe ration is surprisingly good!"));
      } else if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 128) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 71 ? 1 : 0) {
        await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Tastes great!  Less filling!") : S("Mmm, tripe... not bad!"));
      } else {
        await pline(S("Yak - dog food!"));
        await more_experienced(1, 0);
        await newexplevel();
        if (rn2(2) && !(G.urole.malenum === 330 || G.urace.malenum === 71)) {
          await make_vomiting(rn2(G.context.victual.reqtime) + 14, FALSE);
        }
      }
      { $g = 2; continue $L; };
    case 5:
      if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 128) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 71 ? 1 : 0) {
        await pline(S("%s"), S("!#?&* elf kibble!"));
        { $g = 2; continue $L; };
      } else if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 16) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 260 ? 1 : 0) {
        await pline(S("A little goes a long way."));
        { $g = 2; continue $L; };
      }
      { $g = 1; continue $L; }
    case 6:
    case 7:
    case 8:
    case 9:
      { $g = 1; continue $L; }
    case 10:
      if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0) {
        await make_vomiting(rn2(G.context.victual.reqtime) + 5, FALSE);
        { $g = 2; continue $L; };
      }
    case 11:
      if (!(otmp.otyp === SLIME_MOLD && !otmp.cursed && otmp.spe === G.context.current_fruit)) { $g = 13; continue $L; }
      {
        await pline(S("My, this is a %s %s!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("primo") : S("yummy"), await singular(otmp, xname));
      }
      { $g = 12; continue $L; }
    case 13:
      if (!(otmp.otyp === APPLE && otmp.cursed | 0 && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic))) { $g = 15; continue $L; }
      {
        ;
      }
      { $g = 14; continue $L; }
    case 15:
      if (!(otmp.otyp === APPLE || otmp.otyp === PEAR)) { $g = 17; continue $L; }
      {
        if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await pline(S("Core dumped."));
        } else {
          let x = rnd(100);
          await pline(S("%s -- core dumped."), x <= 75 ? S("Segmentation fault") : x <= 99 ? S("Bus error") : S("Yo' mama"));
        }
      }
      { $g = 16; continue $L; }
    case 17:
      if (!(otmp.otyp === EGG && G.monstermoves - otmp.age > 2 * 200)) { $g = 19; continue $L; }
      {
        await pline(S("Ugh.  Rotten egg."));
        await make_vomiting((G.u.uprops[VOMITING].intrinsic & TIMEOUT) + d(10, 4), TRUE);
      }
      { $g = 18; continue $L; }
    case 19:
    case 1: // give_feedback
      await pline(S("This %s is %s"), await singular(otmp, xname), otmp.cursed | 0 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("grody!") : S("terrible!") : otmp.otyp === CRAM_RATION || otmp.otyp === K_RATION || otmp.otyp === C_RATION ? S("bland.") : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("gnarly!") : S("delicious!"));
    case 18:
    case 16:
    case 14:
    case 12:
      { $g = 2; continue $L; };
    case 2:
    }
    break;
  }
}

function bounded_increase(old: number, inc: number, typ: number): number {
  let absold = 0;
  let absinc = 0;
  let sgnold = 0;
  let sgninc = 0;
  if (G.uright && G.uright.otyp === typ && typ !== RIN_PROTECTION) {
    old -= G.uright.spe;
  }
  if (G.uleft && G.uleft.otyp === typ && typ !== RIN_PROTECTION) {
    old -= G.uleft.spe;
  }
  absold = Math.abs(old), absinc = Math.abs(inc);
  sgnold = sgn(old), sgninc = sgn(inc);
  if (absinc === 0 || sgnold !== sgninc || absold + absinc < 10) {
    ;
  } else if (absold + absinc < 20) {
    absinc = rnd(absinc);
    if (absold + absinc < 10) {
      absinc = 10 - absold;
    }
    inc = Math.imul(sgninc, absinc);
  } else if (absold + absinc < 40) {
    absinc = rn2(absinc) ? 1 : 0;
    if (absold + absinc < 20) {
      absinc = rnd(20 - absold);
    }
    inc = Math.imul(sgninc, absinc);
  } else {
    inc = 0;
  }
  if (G.uright && G.uright.otyp === typ && typ !== RIN_PROTECTION) {
    old += G.uright.spe;
  }
  if (G.uleft && G.uleft.otyp === typ && typ !== RIN_PROTECTION) {
    old += G.uleft.spe;
  }
  return old + inc;
}

async function accessory_has_effect(otmp: struct_obj | null): Promise<void> {
  await pline(S("Magic spreads through your body as you digest the %s."), otmp.oclass === RING_CLASS ? S("ring") : S("amulet"));
}

async function eataccessory(otmp: struct_obj | null): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let typ = otmp.otyp;
  let oldprop = 0;
  oldprop = G.u.uprops[G.objects[typ].oc_oprop].intrinsic;
  if (otmp === G.uleft || otmp === G.uright) {
    await Ring_gone(otmp);
    if (G.u.uhp <= 0) {
      return;
    }
  }
  otmp.known = (otmp.dknown = 1) & 1;
  if (!rn2(otmp.oclass === RING_CLASS ? 3 : 5)) {
    switch (otmp.otyp) {
    default:
      if (!G.objects[typ].oc_oprop) {
        break;
      }
      if (!(G.u.uprops[G.objects[typ].oc_oprop].intrinsic & FROMOUTSIDE)) {
        await accessory_has_effect(otmp);
      }
      ($t1 = G.u.uprops[G.objects[typ].oc_oprop], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
      switch (typ) {
      case 176:
        set_mimic_blocking();
        await see_monsters();
        if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !oldprop && !G.u.uprops[SEE_INVIS].extrinsic && !((G.youmonst.data.mflags1 & 16777216) >>> 0 !== 0) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await newsym(G.u.ux, G.u.uy);
          await pline(S("Suddenly you can see yourself."));
          await discover_object(typ, 1, 1);
        }
        break;
      case 175:
        if (!oldprop && !G.u.uprops[INVIS].extrinsic && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await newsym(G.u.ux, G.u.uy);
          await Your(S("body takes on a %s transparency..."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
          await discover_object(typ, 1, 1);
        }
        break;
      case 177:
        await rescham();
        break;
      case 160:
        G.u.uprops[LEVITATION].intrinsic = oldprop;
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
          await float_up();
          incr_itimeout(P(G.u.uprops[LEVITATION], "intrinsic"), d(10, 20));
          await discover_object(typ, 1, 1);
        }
        break;
      }
      break;
    case 150:
      await accessory_has_effect(otmp);
      if (await adjattrib(A_CHA, otmp.spe, -1)) {
        await discover_object(typ, 1, 1);
      }
      break;
    case 151:
      await accessory_has_effect(otmp);
      if (await adjattrib(A_STR, otmp.spe, -1)) {
        await discover_object(typ, 1, 1);
      }
      break;
    case 152:
      await accessory_has_effect(otmp);
      if (await adjattrib(A_CON, otmp.spe, -1)) {
        await discover_object(typ, 1, 1);
      }
      break;
    case 153:
      await accessory_has_effect(otmp);
      G.u.uhitinc = bounded_increase(G.u.uhitinc, otmp.spe, RIN_INCREASE_ACCURACY) << 24 >> 24;
      break;
    case 154:
      await accessory_has_effect(otmp);
      G.u.udaminc = bounded_increase(G.u.udaminc, otmp.spe, RIN_INCREASE_DAMAGE) << 24 >> 24;
      break;
    case 155:
      await accessory_has_effect(otmp);
      ($t2 = G.u.uprops[PROTECTION], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
      G.u.ublessed = bounded_increase(G.u.ublessed, otmp.spe, RIN_PROTECTION);
      G.context.botl = 1;
      break;
    case 169:
      if (!(G.u.uprops[SLEEP_RES].intrinsic & FROMOUTSIDE)) {
        await accessory_has_effect(otmp);
      }
      if (!(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
        await You_feel(S("wide awake."));
      }
      ($t3 = G.u.uprops[SLEEP_RES], $t3.intrinsic = $t3.intrinsic | FROMOUTSIDE);
      break;
    case 183:
      await accessory_has_effect(otmp);
      await discover_object(typ, 1, 1);
      await change_sex();
      await You(S("are suddenly very %s!"), G.flags.female ? S("feminine") : S("masculine"));
      G.context.botl = 1;
      break;
    case 184:
      if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && G.u.umonnum !== G.u.umonster) {
        await accessory_has_effect(otmp);
        await discover_object(typ, 1, 1);
        await rehumanize();
      }
      break;
    case 180:
      await choke(otmp);
      break;
    case 181:
      {
        let newnap = rnd(100);
        let oldnap = G.u.uprops[SLEEPY].intrinsic & TIMEOUT;
        if (!(G.u.uprops[SLEEPY].intrinsic & FROMOUTSIDE)) {
          await accessory_has_effect(otmp);
        }
        ($t4 = G.u.uprops[SLEEPY], $t4.intrinsic = $t4.intrinsic | FROMOUTSIDE);
        if (newnap < oldnap || oldnap === 0) {
          G.u.uprops[SLEEPY].intrinsic = G.u.uprops[SLEEPY].intrinsic & ~TIMEOUT | newnap;
        }
        break;
      }
    case 159:
    case 179:
    case 185:
      break;
    }
  }
}

async function eatspecial(): Promise<void> {
  let otmp = G.context.victual.piece;
  set_occupation(eatfood, S("eating non-food"), 0);
  await lesshungry(G.context.victual.nmod);
  G.occupation = null;
  G.context.victual.piece = null;
  G.context.victual.o_id = 0;
  G.context.victual.eating = 0;
  if (otmp.oclass === COIN_CLASS) {
    if (otmp.where === 3) {
      await useupall(otmp);
    } else {
      await useupf(otmp, otmp.quan);
    }
    vault_gd_watching(GD_EATGOLD);
    return;
  }
  if ((G.objects[otmp.otyp].oc_material | 0) === PAPER) {
    if (otmp.otyp === SCR_MAIL) {
      await pline(S("This junk mail is less than satisfying."));
    } else if (otmp.otyp === SCR_SCARE_MONSTER) {
      await pline(S("Yuck%c"), otmp.blessed | 0 ? 33 : 46);
    } else if (otmp.oclass === SCROLL_CLASS && !strncmpi(G.obj_descr[G.objects[otmp.otyp].oc_descr_idx].oc_descr, S("YUM YUM"), -1)) {
      await pline(S("Yum%c"), otmp.blessed | 0 ? 33 : 46);
    } else {
      await pline(S("Needs salt..."));
    }
  }
  if (otmp.oclass === POTION_CLASS) {
    ++otmp.quan;
    await dopotion(otmp);
  } else if (otmp.oclass === RING_CLASS || otmp.oclass === AMULET_CLASS) {
    await eataccessory(otmp);
  } else if (otmp.otyp === LEASH && otmp.corpsenm) {
    o_unleash(otmp);
  }
  if (otmp.otyp === TRIDENT && !otmp.cursed) {
    await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Four out of five dentists agree.") : S("That was pure chewing satisfaction!"));
    await exercise(A_WIS, TRUE);
  }
  if (otmp.otyp === FLINT && !otmp.cursed) {
    await pline(S("Yabba-dabba delicious!"));
    await exercise(A_CON, TRUE);
  }
  if (otmp === G.uwep && otmp.quan === 1) {
    await uwepgone();
  }
  if (otmp === G.uquiver && otmp.quan === 1) {
    await uqwepgone();
  }
  if (otmp === G.uswapwep && otmp.quan === 1) {
    await uswapwepgone();
  }
  if (otmp === G.uball) {
    await unpunish();
  }
  if (otmp === G.uchain) {
    await unpunish();
  } else if (otmp.where === 3) {
    await useup(otmp);
  } else {
    await useupf(otmp, 1);
  }
}

async function foodword(otmp: struct_obj | null): Promise<Ptr | null> {
  if (otmp.oclass === FOOD_CLASS) {
    return S("food");
  }
  if (otmp.oclass === GEM_CLASS && (G.objects[otmp.otyp].oc_material | 0) === GLASS && otmp.dknown | 0) {
    await discover_object(otmp.otyp, 1, 1);
  }
  return foodwords[G.objects[otmp.otyp].oc_material];
}

async function fpostfx(otmp: struct_obj | null): Promise<void> {
  switch (otmp.otyp) {
  case 258:
    if (G.u.ulycn >= LOW_PM || (G.youmonst.data.mflags2 & 4) >>> 0 !== 0) {
      await you_unwere(TRUE);
    }
    break;
  case 257:
    if (!G.u.uswallow || !attacktype_fordmg(G.u.ustuck.data, AT_ENGL, AD_BLND)) {
      await make_blinded(G.u.ucreamed, TRUE);
    }
    break;
  case 264:
    await outrumor(bcsign(otmp), BY_COOKIE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      ++G.u.uconduct.literate;
    }
    break;
  case 261:
    await gainstr(otmp, 1, TRUE);
    if (G.u.umonnum !== G.u.umonster) {
      G.u.mh += otmp.cursed | 0 ? -rnd(20) : rnd(20);
      if (G.u.mh > G.u.mhmax) {
        if (!rn2(17)) {
          ++G.u.mhmax;
        }
        G.u.mh = G.u.mhmax;
      } else if (G.u.mh <= 0) {
        await rehumanize();
      }
    } else {
      G.u.uhp += otmp.cursed | 0 ? -rnd(20) : rnd(20);
      if (G.u.uhp > G.u.uhpmax) {
        if (!rn2(17)) {
          ++G.u.uhpmax;
        }
        G.u.uhp = G.u.uhpmax;
      } else if (G.u.uhp <= 0) {
        G.killer.format = KILLED_BY_AN;
        strcpy(P(G.killer.name), S("rotten lump of royal jelly"));
        await done(POISONING);
      }
    }
    if (!otmp.cursed) {
      await heal_legs(0);
    }
    break;
  case 241:
    if ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 280)) {
      if (!(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
        if (!G.u.uprops[STONED].intrinsic) {
          sprintf(P(G.killer.name), S("%s egg"), G.mons[otmp.corpsenm].mname);
          await make_stoned(5, null, KILLED_BY_AN, P(G.killer.name));
        }
      }
    }
    break;
  case 251:
    if (G.u.uprops[SICK].intrinsic && !otmp.cursed) {
      await make_sick(0, null, TRUE, SICK_ALL);
    }
    if (G.u.uprops[VOMITING].intrinsic && !otmp.cursed) {
      await make_vomiting(0, TRUE);
    }
    break;
  case 252:
    if (otmp.cursed | 0 && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
      if (G.urace.malenum === 43 && (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
        await verbalize(S("Heigh-ho, ho-hum, I think I'll skip work today."));
      } else if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic || !G.flags.acoustics) {
        await You(S("fall asleep."));
      } else {
        await You_hear(S("sinister laughter as you fall asleep..."));
      }
      await fall_asleep(-(rn2(11) + 20), TRUE);
    }
    break;
  }
  return;
}

async function edibility_prompts(otmp: struct_obj | null): Promise<number> {
  let buf = new Int8Array(256);
  let foodsmell = new Int8Array(256);
  let it_or_they = new Int8Array(128);
  let eat_it_anyway = new Int8Array(128);
  let cadaver = (otmp.otyp === CORPSE || otmp.globby | 0 ? 1 : 0) << 24 >> 24;
  let stoneorslime = FALSE;
  let material = G.objects[otmp.otyp].oc_material | 0;
  let mnum = otmp.corpsenm;
  let rotted = 0;
  strcpy(P(foodsmell), await Tobjnam(otmp, S("smell")));
  strcpy(P(it_or_they), otmp.quan === 1 ? S("it") : S("they"));
  sprintf(P(eat_it_anyway), S("Eat %s anyway?"), otmp.quan === 1 ? S("it") : S("one"));
  if (cadaver || otmp.otyp === EGG || otmp.otyp === TIN) {
    stoneorslime = (($sat(G.mons, mnum) === $sat(G.mons, 10) || $sat(G.mons, mnum) === $sat(G.mons, 9) || $sat(G.mons, mnum) === $sat(G.mons, 280)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !poly_when_stoned(G.youmonst.data) ? 1 : 0) << 24 >> 24;
    if (mnum === PM_GREEN_SLIME || otmp.otyp === GLOB_OF_GREEN_SLIME) {
      stoneorslime = (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && !(G.youmonst.data === $sat(G.mons, 205) || (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) || G.youmonst.data.mlet === S_GHOST) ? 1 : 0) << 24 >> 24;
    }
    if (cadaver && !(mnum === 323 || mnum === 155 || ($sat(G.mons, mnum) === $sat(G.mons, 308) || $sat(G.mons, mnum) === $sat(G.mons, 310) || $sat(G.mons, mnum) === $sat(G.mons, 309)))) {
      let age = await peek_at_iced_corpse_age(otmp);
      rotted = Math.trunc((G.monstermoves - age) / (10 + 0));
      if (otmp.cursed) {
        rotted += 2;
      } else if (otmp.blessed) {
        rotted -= 2;
      }
    }
  }
  if (cadaver && mnum !== PM_ACID_BLOB && rotted > 5 && !(G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep))) {
    sprintf(P(buf), S("%s like %s could be tainted!  %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (stoneorslime) {
    sprintf(P(buf), S("%s like %s could be something very dangerous!  %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (otmp.oeroded | 0 || cadaver && rotted > 3) {
    sprintf(P(buf), S("%s like %s could be rotten! %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (cadaver && ($sat(G.mons, mnum).mflags1 & 268435456) >>> 0 !== 0 && !(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic)) {
    sprintf(P(buf), S("%s like %s might be poisonous!  %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (otmp.otyp === APPLE && otmp.cursed | 0 && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
    sprintf(P(buf), S("%s like %s might have been poisoned.  %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    return await yn_function(P(buf), P(G.ynchars), 110) === 110 ? 1 : 2;
  }
  if (cadaver && !($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206)) && !G.u.uconduct.unvegetarian && G.urole.malenum === 334) {
    sprintf(P(buf), S("%s unhealthy.  %s"), P(foodsmell), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (cadaver && ($sat(G.mons, mnum).mflags1 & 134217728) >>> 0 !== 0 && !(G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic)) {
    sprintf(P(buf), S("%s rather acidic.  %s"), P(foodsmell), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (G.u.umonnum !== G.u.umonster && G.u.umonnum === PM_RUST_MONSTER && ((G.objects[otmp.otyp].oc_material | 0) >= IRON && (G.objects[otmp.otyp].oc_material | 0) <= MITHRIL) && otmp.oerodeproof | 0) {
    sprintf(P(buf), S("%s disgusting to you right now.  %s"), P(foodsmell), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (!G.u.uconduct.unvegan && (material === LEATHER || material === BONE || material === DRAGON_HIDE || material === WAX || cadaver && !($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST))) {
    sprintf(P(buf), S("%s foul and unfamiliar to you.  %s"), P(foodsmell), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (!G.u.uconduct.unvegetarian && (material === LEATHER || material === BONE || material === DRAGON_HIDE || cadaver && !($sat(G.mons, mnum).mlet === S_BLOB || $sat(G.mons, mnum).mlet === S_JELLY || $sat(G.mons, mnum).mlet === S_FUNGUS || $sat(G.mons, mnum).mlet === S_VORTEX || $sat(G.mons, mnum).mlet === S_LIGHT || $sat(G.mons, mnum).mlet === S_ELEMENTAL && $sat(G.mons, mnum) !== $sat(G.mons, 150) || $sat(G.mons, mnum).mlet === S_GOLEM && $sat(G.mons, mnum) !== $sat(G.mons, 251) && $sat(G.mons, mnum) !== $sat(G.mons, 249) || $sat(G.mons, mnum).mlet === S_GHOST || $sat(G.mons, mnum).mlet === S_PUDDING && $sat(G.mons, mnum) !== $sat(G.mons, 206)))) {
    sprintf(P(buf), S("%s unfamiliar to you.  %s"), P(foodsmell), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  if (cadaver && mnum !== PM_ACID_BLOB && rotted > 5 && (G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep))) {
    sprintf(P(buf), S("%s like %s could be tainted!  %s"), P(foodsmell), P(it_or_they), P(eat_it_anyway));
    if (await yn_function(P(buf), P(G.ynchars), 110) === 110) {
      return 1;
    } else {
      return 2;
    }
  }
  return 0;
}

export async function doeat(): Promise<number> {
  const otmp = [null];
  let basenutrit = 0;
  let dont_start = FALSE;
  let nodelicious = FALSE;
  let already_partly_eaten = 0;
  if (G.u.uprops[STRANGLED].intrinsic) {
    await pline(S("If you can't breathe air, how can you consume solids?"));
    return 0;
  }
  if (!(otmp[0] = await floorfood(S("eat"), 0))) {
    return 0;
  }
  if (await check_capacity(null)) {
    return 0;
  }
  if (G.u.uedibility) {
    let res = await edibility_prompts(otmp[0]);
    if (res) {
      await Your(S("%s stops tingling and your sense of smell returns to normal."), body_part(NOSE));
      G.u.uedibility = 0;
      if (res === 1) {
        return 0;
      }
    }
  }
  if (!is_edible(otmp[0])) {
    await You(S("cannot eat that!"));
    return 0;
  } else if ((otmp[0].owornmask & (W_ARMOR | W_TOOL | W_AMUL | W_SADDLE)) !== 0) {
    await You_cant(S("eat %s you're wearing."), G.c_common_strings.c_something);
    return 0;
  } else if (!(otmp[0].where === 3 ? await retouch_object(P(otmp, 0), FALSE) : await touch_artifact(otmp[0], G.youmonst))) {
    return 1;
  }
  if ((G.objects[otmp[0].otyp].oc_material | 0) >= IRON && (G.objects[otmp[0].otyp].oc_material | 0) <= MITHRIL && G.u.umonnum === PM_RUST_MONSTER && otmp[0].oerodeproof | 0) {
    otmp[0].rknown = (TRUE) & 1;
    if (otmp[0].quan > 1) {
      if (!(otmp[0].where === 3)) {
        await splitobj(otmp[0], otmp[0].quan - 1);
      } else {
        otmp[0] = await splitobj(otmp[0], 1);
      }
    }
    await pline(S("Ulch - that %s was rustproofed!"), await xname(otmp[0]));
    otmp[0].oerodeproof = 0;
    await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + rn2(10), TRUE);
    if (welded(otmp[0]) || otmp[0].cursed | 0 && otmp[0].owornmask & W_RING) {
      set_bknown(otmp[0], 1);
      await You(S("spit out %s."), await the(await xname(otmp[0])));
    } else {
      await You(S("spit %s out onto the %s."), await the(await xname(otmp[0])), surface(G.u.ux, G.u.uy));
      if (otmp[0].where === 3) {
        if (otmp[0].owornmask) {
          await remove_worn_item(otmp[0], FALSE);
        }
        await freeinv(otmp[0]);
        await dropy(otmp[0]);
      }
      await stackobj(otmp[0]);
    }
    return 1;
  }
  if (otmp[0].otyp === RIN_SLOW_DIGESTION) {
    await pline(S("This ring is indigestible!"));
    await rottenfood(otmp[0]);
    if (otmp[0].dknown | 0 && !G.objects[otmp[0].otyp].oc_name_known && !G.objects[otmp[0].otyp].oc_uname) {
      await docall(otmp[0]);
    }
    return 1;
  }
  if (otmp[0].oclass !== FOOD_CLASS) {
    let material = 0;
    G.context.victual.reqtime = 1;
    G.context.victual.piece = otmp[0];
    G.context.victual.o_id = otmp[0].o_id;
    G.context.victual.usedtime = 0;
    G.context.victual.canchoke = ((G.u.uhs === SATIATED ? 1 : 0) >>> 0) & 1;
    if (otmp[0].oclass === COIN_CLASS) {
      basenutrit = otmp[0].quan > 200000 ? 2000 : Math.trunc(otmp[0].quan / 100) | 0;
    } else if (otmp[0].oclass === BALL_CLASS || otmp[0].oclass === CHAIN_CLASS) {
      basenutrit = await weight(otmp[0]);
    } else {
      basenutrit = G.objects[otmp[0].otyp].oc_nutrition;
    }
    if (otmp[0].otyp === SCR_MAIL) {
      basenutrit = 0;
      nodelicious = TRUE;
    }
    G.context.victual.nmod = basenutrit;
    G.context.victual.eating = (TRUE) & 1;
    material = G.objects[otmp[0].otyp].oc_material | 0;
    if (material === LEATHER || material === BONE || material === DRAGON_HIDE) {
      ++G.u.uconduct.unvegan;
      await violated_vegetarian();
    } else if (material === WAX) {
      ++G.u.uconduct.unvegan;
    }
    ++G.u.uconduct.food;
    if (otmp[0].cursed) {
      await rottenfood(otmp[0]);
      nodelicious = TRUE;
    } else if ((G.objects[otmp[0].otyp].oc_material | 0) === PAPER) {
      nodelicious = TRUE;
    }
    if (otmp[0].oclass === WEAPON_CLASS && otmp[0].otrapped | 0) {
      await pline(S("Ecch - that must have been poisonous!"));
      if (!(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic)) {
        await losestr(rnd(4));
        await losehp(rnd(15), await xname(otmp[0]), KILLED_BY_AN);
      } else {
        await You(S("seem unaffected by the poison."));
      }
    } else if (!nodelicious) {
      await pline(S("%s%s is delicious!"), obj_is_pname(otmp[0]) && otmp[0].oartifact < ART_ORB_OF_DETECTION ? S("") : S("This "), otmp[0].oclass === COIN_CLASS ? await foodword(otmp[0]) : await singular(otmp[0], xname));
    }
    await eatspecial();
    return 1;
  }
  if (otmp[0] === G.context.victual.piece) {
    if (G.u.uhs !== SATIATED) {
      G.context.victual.canchoke = (FALSE) & 1;
    }
    G.context.victual.o_id = 0;
    G.context.victual.piece = await touchfood(otmp[0]);
    if (G.context.victual.piece) {
      G.context.victual.o_id = G.context.victual.piece.o_id;
    }
    await You(S("resume %syour meal."), G.context.victual.usedtime + 1 >= G.context.victual.reqtime ? S("the last bite of ") : S(""));
    await start_eating(G.context.victual.piece, FALSE);
    return 1;
  }
  if (otmp[0].otyp === TIN) {
    await start_tin(otmp[0]);
    return 1;
  }
  ++G.u.uconduct.food;
  already_partly_eaten = (otmp[0].oeaten ? TRUE : FALSE) << 24 >> 24;
  G.context.victual.o_id = 0;
  G.context.victual.piece = otmp[0] = await touchfood(otmp[0]);
  if (G.context.victual.piece) {
    G.context.victual.o_id = G.context.victual.piece.o_id;
  }
  G.context.victual.usedtime = 0;
  if (otmp[0].otyp === CORPSE || otmp[0].globby | 0) {
    let tmp = await eatcorpse(otmp[0]);
    if (tmp === 2) {
      G.context.victual.piece = null;
      G.context.victual.o_id = 0;
      return 1;
    } else if (tmp) {
      dont_start = TRUE;
    }
  } else {
    switch (G.objects[otmp[0].otyp].oc_material | 0) {
    case FLESH:
      ++G.u.uconduct.unvegan;
      if (otmp[0].otyp !== EGG) {
        await violated_vegetarian();
      }
      break;
    default:
      if (otmp[0].otyp === PANCAKE || otmp[0].otyp === FORTUNE_COOKIE || otmp[0].otyp === CREAM_PIE || otmp[0].otyp === CANDY_BAR || otmp[0].otyp === LUMP_OF_ROYAL_JELLY) {
        ++G.u.uconduct.unvegan;
      }
      break;
    }
    G.context.victual.reqtime = G.objects[otmp[0].otyp].oc_delay;
    if (otmp[0].otyp !== FORTUNE_COOKIE && (otmp[0].cursed | 0 || !(otmp[0].otyp === 266 || otmp[0].otyp === 267) && G.monstermoves - otmp[0].age > (otmp[0].blessed | 0 ? 50 : 30) && (otmp[0].oeroded | 0 || !rn2(7)))) {
      if (await rottenfood(otmp[0])) {
        otmp[0].oeroded = (TRUE) & 3;
        dont_start = TRUE;
      }
      consume_oeaten(otmp[0], 1);
    } else if (!already_partly_eaten) {
      await fprefx(otmp[0]);
    } else {
      await You(S("%s %s."), G.context.victual.reqtime === 1 ? S("eat") : S("begin eating"), await doname(otmp[0]));
    }
  }
  basenutrit = obj_nutrition(otmp[0]) | 0;
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("before rounddiv: victual.reqtime == %d, oeaten == %d, basenutrit == %d"), G.context.victual.reqtime, otmp[0].oeaten, basenutrit);
    }
  } while (0);
  G.context.victual.reqtime = basenutrit === 0 ? 0 : await rounddiv(G.context.victual.reqtime * otmp[0].oeaten, basenutrit);
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("after rounddiv: victual.reqtime == %d"), G.context.victual.reqtime);
    }
  } while (0);
  if (G.context.victual.reqtime === 0 || otmp[0].oeaten === 0) {
    G.context.victual.nmod = 0;
  } else if ((otmp[0].oeaten | 0) >= G.context.victual.reqtime) {
    G.context.victual.nmod = -((otmp[0].oeaten | 0) / G.context.victual.reqtime | 0);
  } else {
    G.context.victual.nmod = (G.context.victual.reqtime >>> 0) % otmp[0].oeaten | 0;
  }
  G.context.victual.canchoke = ((G.u.uhs === SATIATED ? 1 : 0) >>> 0) & 1;
  if (!dont_start) {
    await start_eating(otmp[0], already_partly_eaten);
  }
  return 1;
}

export async function use_tin_opener(obj: struct_obj | null): Promise<number> {
  let otmp = null;
  let res = 0;
  if (!carrying(TIN)) {
    await You(S("have no tin to open."));
    return 0;
  }
  if (obj !== G.uwep) {
    if (obj.cursed | 0 && obj.bknown | 0) {
      let qbuf = new Int8Array(128);
      if (await yn_function(await safe_qbuf(P(qbuf), S("Really wield "), S("?"), obj, doname, thesimpleoname, S("that")), P(G.ynqchars), 113) !== 121) {
        return 0;
      }
    }
    if (!await wield_tool(obj, S("use"))) {
      return 0;
    }
    res = 1;
  }
  otmp = await getobj(P(comestibles), S("open"));
  if (!otmp) {
    return res;
  }
  await start_tin(otmp);
  return 1;
}

async function bite(): Promise<number> {
  if (G.context.victual.canchoke | 0 && G.u.uhunger >= 2000) {
    await choke(G.context.victual.piece);
    return 1;
  }
  if (G.context.victual.doreset) {
    await do_reset_eat();
    return 0;
  }
  force_save_hs = TRUE;
  if (G.context.victual.nmod < 0) {
    await lesshungry(-G.context.victual.nmod);
    consume_oeaten(G.context.victual.piece, G.context.victual.nmod);
  } else if (G.context.victual.nmod > 0 && G.context.victual.usedtime % G.context.victual.nmod) {
    await lesshungry(1);
    consume_oeaten(G.context.victual.piece, -1);
  }
  force_save_hs = FALSE;
  await recalc_wt();
  return 0;
}

export async function gethungry(): Promise<void> {
  if (G.u.uinvulnerable) {
    return;
  }
  if ((!(G.multi < 0 && (unconscious() || is_fainted())) || !rn2(10)) && ((G.youmonst.data.mflags1 & 536870912) >>> 0 !== 0 || (G.youmonst.data.mflags1 & 1073741824) >>> 0 !== 0 || (G.youmonst.data.mflags1 & 2147483648) >>> 0 !== 0) && !(G.u.uprops[SLOW_DIGESTION].intrinsic || G.u.uprops[SLOW_DIGESTION].extrinsic)) {
    --G.u.uhunger;
  }
  if (G.moves % 2) {
    if (G.u.uprops[REGENERATION].intrinsic & ~FROMFORM || G.u.uprops[REGENERATION].extrinsic & ~(W_ARTI | W_WEP)) {
      --G.u.uhunger;
    }
    if (near_capacity() > SLT_ENCUMBER) {
      --G.u.uhunger;
    }
  } else {
    if (G.u.uprops[HUNGER].intrinsic || G.u.uprops[HUNGER].extrinsic) {
      --G.u.uhunger;
    }
    if (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic & ~W_ARTI) {
      --G.u.uhunger;
    }
    switch (G.moves % 20 | 0) {
    case 4:
      if (G.uleft && (G.uleft.spe || !G.objects[G.uleft.otyp].oc_charged)) {
        --G.u.uhunger;
      }
      break;
    case 8:
      if (G.uamul) {
        --G.u.uhunger;
      }
      break;
    case 12:
      if (G.uright && (G.uright.spe || !G.objects[G.uright.otyp].oc_charged)) {
        --G.u.uhunger;
      }
      break;
    case 16:
      if (G.u.uhave.amulet) {
        --G.u.uhunger;
      }
      break;
    default:
      break;
    }
  }
  await newuhs(TRUE);
}

export async function morehungry(num: number): Promise<void> {
  G.u.uhunger -= num;
  await newuhs(TRUE);
}

export async function lesshungry(num: number): Promise<void> {
  let iseating = (G.occupation === eatfood || force_save_hs ? 1 : 0) << 24 >> 24;
  do {
    if (await debugcore(S("eat.c"), 1)) {
      await pline(S("lesshungry(%d)"), num);
    }
  } while (0);
  G.u.uhunger += num;
  if (G.u.uhunger >= 2000) {
    if (!iseating || G.context.victual.canchoke | 0) {
      if (iseating) {
        await choke(G.context.victual.piece);
        await reset_eat();
      } else {
        await choke(G.occupation === opentin ? G.context.tin.tin : null);
      }
    }
  } else {
    if (G.u.uhunger >= 1500 && (!G.context.victual.eating || G.context.victual.eating | 0 && !G.context.victual.fullwarn)) {
      await pline(S("You're having a hard time getting all of it down."));
      G.nomovemsg = S("You're finally finished.");
      if (!G.context.victual.eating) {
        G.multi = -2;
      } else {
        G.context.victual.fullwarn = (TRUE) & 1;
        if (G.context.victual.canchoke | 0 && G.context.victual.reqtime > 1) {
          if (!await paranoid_query((G.flags.paranoia_bits & 512) >>> 0 !== 0 ? 1 : 0, S("Continue eating?"))) {
            await reset_eat();
            G.nomovemsg = null;
          }
        }
      }
    }
  }
  await newuhs(FALSE);
}

async function unfaint(): Promise<number> {
  await Hear_again();
  if (G.u.uhs > FAINTING) {
    G.u.uhs = FAINTING;
  }
  await stop_occupation();
  G.context.botl = 1;
  return 0;
}

export function is_fainted(): number {
  return (G.u.uhs === FAINTED ? 1 : 0) << 24 >> 24;
}

export async function reset_faint(): Promise<void> {
  if (G.afternmv === unfaint) {
    await unmul(S("You revive."));
  }
}

export async function newuhs(incr: number): Promise<void> {
  let newhs = 0;
  let h = G.u.uhunger;
  newhs = (h > 1000 ? SATIATED : h > 150 ? NOT_HUNGRY : h > 50 ? HUNGRY : h > 0 ? WEAK : FAINTING) >>> 0;
  if (G.occupation === eatfood || force_save_hs) {
    if (!newuhs$saved_hs) {
      newuhs$save_hs = G.u.uhs;
      newuhs$saved_hs = TRUE;
    }
    G.u.uhs = newhs;
    return;
  } else {
    if (newuhs$saved_hs) {
      G.u.uhs = newuhs$save_hs;
      newuhs$saved_hs = FALSE;
    }
  }
  if (newhs === FAINTING) {
    let uhunger_div_by_10 = Math.imul(sgn(G.u.uhunger), (Math.abs(G.u.uhunger) + 5) / 10 | 0);
    if (is_fainted()) {
      newhs = FAINTED;
    }
    if (G.u.uhs <= WEAK || rn2(20 - uhunger_div_by_10) >= 19) {
      if (!is_fainted() && G.multi >= 0) {
        let duration = 10 - uhunger_div_by_10;
        await stop_occupation();
        await You(S("faint from lack of food."));
        incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), duration);
        G.context.botl = TRUE;
        nomul(-duration);
        G.multi_reason = S("fainted from lack of food");
        G.nomovemsg = S("You regain consciousness.");
        G.afternmv = unfaint;
        newhs = FAINTED;
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
          await selftouch(S("Falling, you"));
        }
      }
    } else if (G.u.uhunger < -(100 + 10 * acurr(A_CON))) {
      G.u.uhs = STARVED;
      G.context.botl = 1;
      await bot();
      await You(S("die from starvation."));
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), S("starvation"));
      await done(STARVING);
      return;
    }
  }
  if (newhs !== G.u.uhs) {
    if (newhs >= WEAK && G.u.uhs < WEAK) {
      G.u.atemp.a[A_STR] = -1;
    } else if (newhs < WEAK && G.u.uhs >= WEAK) {
      G.u.atemp.a[A_STR] = 0;
    }
    switch (newhs) {
    case HUNGRY:
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await You(!incr ? S("now have a lesser case of the munchies.") : S("are getting the munchies."));
      } else {
        await You(!incr ? S("only feel hungry now.") : G.u.uhunger < 145 ? S("feel hungry.") : S("are beginning to feel hungry."));
      }
      if (incr && G.occupation && (G.occupation !== eatfood && G.occupation !== opentin)) {
        await stop_occupation();
      }
      G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
      break;
    case WEAK:
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(!incr ? S("You still have the munchies.") : S("The munchies are interfering with your motor capabilities."));
      } else if (incr && (G.urole.malenum === 342 || G.urace.malenum === 260 || G.urole.malenum === 341)) {
        await pline(S("%s needs food, badly!"), G.urole.malenum === 342 || G.urole.malenum === 341 ? G.urole.name.m : S("Elf"));
      } else {
        await You(!incr ? S("feel weak now.") : G.u.uhunger < 45 ? S("feel weak.") : S("are beginning to feel weak."));
      }
      if (incr && G.occupation && (G.occupation !== eatfood && G.occupation !== opentin)) {
        await stop_occupation();
      }
      G.context.travel = G.context.travel1 = G.context.mv = (G.context.run = 0) << 24 >> 24;
      break;
    }
    G.u.uhs = newhs;
    G.context.botl = 1;
    await bot();
    if ((G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) < 1) {
      await You(S("die from hunger and exhaustion."));
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), S("exhaustion"));
      await done(STARVING);
      return;
    }
  }
}

export async function floorfood(verb: Ptr | null, corpsecheck: number): Promise<struct_obj | null> {
  let $g = 0;
  let otmp = null;
  let qbuf = new Int8Array(128);
  let c = 0;
  let feeding = 0;
  let offering = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      qbuf = new Int8Array(128);
      feeding = (!strcmp(verb, S("eat")) ? 1 : 0) << 24 >> 24;
      offering = (!strcmp(verb, S("sacrifice")) ? 1 : 0) << 24 >> 24;
      if (G.iflags.menu_requested || !can_reach_floor(TRUE) || feeding && G.u.usteed || is_pool_or_lava(G.u.ux, G.u.uy) && (G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) || (G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked && !(G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0))) {
        { $g = 1; continue $L; }
      }
      if (feeding && (G.youmonst.data.mflags1 & 2147483648) >>> 0 !== 0) {
        let gold = null;
        let ttmp = t_at(G.u.ux, G.u.uy);
        if (ttmp && ttmp.tseen | 0 && (ttmp.ttyp | 0) === BEAR_TRAP) {
          let u_in_beartrap = (G.u.utrap && G.u.utraptype === TT_BEARTRAP ? 1 : 0) << 24 >> 24;
          sprintf(P(qbuf), S("There is a bear trap here (%s); eat it?"), u_in_beartrap ? S("holding you") : S("armed"));
          if ((c = await yn_function(P(qbuf), P(G.ynqchars), 110)) === 121) {
            await deltrap(ttmp);
            if (u_in_beartrap) {
              await reset_utrap(TRUE);
            }
            return await mksobj(BEARTRAP, TRUE, FALSE);
          } else if (c === 113) {
            return null;
          }
        }
        if (G.youmonst.data !== $sat(G.mons, PM_RUST_MONSTER) && !!(gold = g_at(G.u.ux, G.u.uy))) {
          if (gold.quan === 1) {
            sprintf(P(qbuf), S("There is 1 gold piece here; eat it?"));
          } else {
            sprintf(P(qbuf), S("There are %ld gold pieces here; eat them?"), gold.quan);
          }
          if ((c = await yn_function(P(qbuf), P(G.ynqchars), 110)) === 121) {
            return gold;
          } else if (c === 113) {
            return null;
          }
        }
      }
      for (otmp = G.level.objects[G.u.ux][G.u.uy]; otmp; otmp = otmp.v.v_nexthere) {
        if (corpsecheck ? otmp.otyp === CORPSE && (corpsecheck === 1 || tinnable(otmp)) ? 1 : 0 : feeding ? otmp.oclass !== COIN_CLASS && is_edible(otmp) ? 1 : 0 : otmp.oclass === FOOD_CLASS ? 1 : 0) {
          let qsfx = new Int8Array(128);
          let one = (otmp.quan === 1 ? 1 : 0) << 24 >> 24;
          if (otmp.otyp === CORPSE && will_feel_cockatrice(otmp, FALSE)) {
            await feel_cockatrice(otmp, FALSE);
            return null;
          }
          sprintf(P(qbuf), S("There %s "), otense(otmp, S("are")));
          sprintf(P(qsfx), S(" here; %s %s?"), verb, one ? S("it") : S("one"));
          await safe_qbuf(P(qbuf), P(qbuf), P(qsfx), otmp, doname, ansimpleoname, one ? G.c_common_strings.c_something : S("things"));
          if ((c = await yn_function(P(qbuf), P(G.ynqchars), 110)) === 121) {
            return otmp;
          } else if (c === 113) {
            return null;
          }
        }
      }
    case 1: // skipfloor
      otmp = await getobj(feeding ? P(allobj) : offering ? P(offerfodder) : P(comestibles), verb);
      if (corpsecheck && otmp && !(offering && otmp.oclass === AMULET_CLASS)) {
        if (otmp.otyp !== CORPSE || corpsecheck === 2 && !tinnable(otmp)) {
          await You_cant(S("%s that!"), verb);
          return null;
        }
      }
      return otmp;
    }
    break;
  }
}

export async function vomit(): Promise<void> {
  if (cantvomit(G.youmonst.data)) {
    await Your(S("jaw gapes convulsively."));
  } else {
    if (G.u.uprops[SICK].intrinsic && ((G.u.usick_type | 0) & SICK_VOMITABLE) !== 0) {
      await make_sick(0, null, TRUE, SICK_VOMITABLE);
    }
    if (G.u.uhs >= FAINTING) {
      await Your(S("%s heaves convulsively!"), body_part(STOMACH));
    }
  }
  if (G.multi >= -2) {
    nomul(-2);
    G.multi_reason = S("vomiting");
    G.nomovemsg = G.c_common_strings.c_You_can_move_again;
  }
}

export async function eaten_stat(base: number, obj: struct_obj | null): Promise<number> {
  let uneaten_amt = 0;
  let full_amount = 0;
  full_amount = obj_nutrition(obj);
  uneaten_amt = obj.oeaten;
  if (uneaten_amt > full_amount) {
    await impossible(S("partly eaten food (%ld) more nutritious than untouched food (%ld)"), uneaten_amt, full_amount);
    uneaten_amt = full_amount;
  }
  base = (full_amount ? Math.trunc(base * uneaten_amt / full_amount) : 0) | 0;
  return base < 1 ? 1 : base;
}

export function consume_oeaten(obj: struct_obj | null, amt: number): void {
  if (amt > 0) {
    obj.oeaten = obj.oeaten >>> amt;
  } else {
    if ((obj.oeaten | 0) > -amt) {
      obj.oeaten = obj.oeaten + (amt >>> 0) >>> 0;
    } else {
      obj.oeaten = 0;
    }
  }
  if (obj.oeaten === 0) {
    if (obj === G.context.victual.piece) {
      G.context.victual.reqtime = G.context.victual.usedtime;
    }
    obj.oeaten = 1;
  }
}

export async function maybe_finished_meal(stopping: number): Promise<number> {
  if (G.occupation === eatfood && G.context.victual.usedtime >= G.context.victual.reqtime) {
    if (stopping) {
      G.occupation = null;
    }
    await eatfood();
    return TRUE;
  }
  return FALSE;
}

export function Popeye(threat: number): number {
  let otin = null;
  let mndx = 0;
  if (G.occupation !== opentin) {
    return FALSE;
  }
  otin = G.context.tin.tin;
  if (!(otin.where === 3) && (!obj_here(otin, G.u.ux, G.u.uy) || !can_reach_floor(TRUE))) {
    return FALSE;
  }
  if (!otin.known) {
    return TRUE;
  }
  mndx = otin.corpsenm;
  switch (threat) {
  case HUNGER:
    return (mndx !== NON_PM || otin.spe === 1 ? 1 : 0) << 24 >> 24;
  case STONED:
    return (mndx >= LOW_PM && (mndx === PM_LIZARD || ($sat(G.mons, mndx).mflags1 & 134217728) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
  case SLIMED:
  case SICK:
  case VOMITING:
    break;
  default:
    break;
  }
  return FALSE;
}

export function $init(): void {
  G.msgbuf = new Int8Array(256);
  comestibles = $ta(Int8Array, 2, [FOOD_CLASS]);
  offerfodder = $ta(Int8Array, 3, [FOOD_CLASS, AMULET_CLASS]);
  allobj = $ta(Int8Array, 16, [COIN_CLASS, WEAPON_CLASS, ARMOR_CLASS, POTION_CLASS, SCROLL_CLASS, WAND_CLASS, RING_CLASS, AMULET_CLASS, FOOD_CLASS, TOOL_CLASS, GEM_CLASS, ROCK_CLASS, BALL_CLASS, CHAIN_CLASS, SPBOOK_CLASS]);
  force_save_hs = 0;
  G.hu_stat = [S("Satiated"),
S("        "),
S("Hungry  "),
S("Weak    "),
S("Fainting"),
S("Fainted "),
S("Starved ")];
  tintxts = $sarrOf([anon_eat_c_128.$of(S("rotten"), -50),
anon_eat_c_128.$of(S("homemade"), 50, 1),
anon_eat_c_128.$of(S("soup made from"), 20, 1),
anon_eat_c_128.$of(S("french fried"), 40, 0, 1),
anon_eat_c_128.$of(S("pickled"), 40, 1),
anon_eat_c_128.$of(S("boiled"), 50, 1),
anon_eat_c_128.$of(S("smoked"), 50, 1),
anon_eat_c_128.$of(S("dried"), 55, 1),
anon_eat_c_128.$of(S("deep fried"), 60, 0, 1),
anon_eat_c_128.$of(S("szechuan"), 70, 1),
anon_eat_c_128.$of(S("broiled"), 80),
anon_eat_c_128.$of(S("stir fried"), 80, 0, 1),
anon_eat_c_128.$of(S("sauteed"), 95),
anon_eat_c_128.$of(S("candied"), 100, 1),
anon_eat_c_128.$of(S("pureed"), 500, 1),
anon_eat_c_128.$of(S(""))]);
  eatmbuf = null;
  foodwords = [S("meal"),
S("liquid"),
S("wax"),
S("food"),
S("meat"),
S("paper"),
S("cloth"),
S("leather"),
S("wood"),
S("bone"),
S("scale"),
S("metal"),
S("metal"),
S("metal"),
S("silver"),
S("gold"),
S("platinum"),
S("mithril"),
S("plastic"),
S("glass"),
S("rich food"),
S("stone")];
  eat_brains$brainlessness = $cs("brainlessness", 14);
  maybe_cannibal$ate_brains = 0;
  newuhs$save_hs = 0;
  newuhs$saved_hs = 0;
}
