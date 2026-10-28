// @ts-nocheck
// NetHack 3.6.7 potion.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { unfixable_trouble_count } from './apply.ts';
import { Sting_effects, defends, undiscovered_artifact } from './artifact.ts';
import { adjattrib, exercise, poisontell } from './attrib.ts';
import { set_bc } from './ball.ts';
import { enlightenment, yn_function } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { monster_detect, object_detect } from './detect.ts';
import { glyph_at, map_invisible, newsym, see_monsters, see_objects, see_traps, set_mimic_blocking, swallowed, tmp_at, unmap_object } from './display.ts';
import { doup, goto_level, heal_legs } from './do.ts';
import { Monnam, a_monnam, docall, hcolor, hliquid, mon_nam, rndmonnam, x_monnam } from './do_name.ts';
import { fingers_or_gloves, inaccessible_equipment } from './do_wear.ts';
import { tamedog } from './dog.ts';
import { Can_rise_up, depth, get_level, has_ceiling, ledger_no, on_level } from './dungeon.ts';
import { eatmupdate, fix_petrification, is_fainted, newuhs } from './eat.ts';
import { dealloc_killer, delayed_killer, find_delayed_killer } from './end.ts';
import { can_reach_floor, ceiling, surface } from './engrave.ts';
import { more_experienced, pluslvl, rndexp } from './exper.ts';
import { explode, explode_oil } from './explode.ts';
import { dipfountain, drinkfountain, drinksink, floating_above } from './fountain.ts';
import { in_rooms, losehp, nomul, spoteffects } from './hack.ts';
import { dist2, s_suffix, upstart } from './hacklib.ts';
import { freeinv, getobj, hold_another_object, learn_unseen_invent, prinv, update_inventory, useup, useupall } from './invent.ts';
import { clone_mon, makemon, set_malign } from './makemon.ts';
import { paralyze_monst, sleep_monst, slept_monst } from './mhitm.ts';
import { cloneu } from './mhitu.ts';
import { waterbody_name } from './mkmaze.ts';
import { bcsign, bless, costly_alteration, curse, mkobj, obj_extract_self, splitobj, unbless, uncurse } from './mkobj.ts';
import { killed, mongone, monkilled, wake_nearto, wakeup } from './mon.ts';
import { dmgtype, stagger } from './mondata.ts';
import { mcureblindness } from './muse.ts';
import { discover_object } from './o_init.ts';
import { The, Tobjnam, Yname2, Yobjnam2, an, aobjnam, cxname, doname, fruitname, makeplural, otense, short_oname, simpleonames, the, thesimpleoname, vtense, xname, yname } from './objnam.ts';
import { You, You_feel, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, float_vs_flight, polyself } from './polyself.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { alter_cost, check_unpaid, obfree, shop_keeper, stolen_value, subfrombill } from './shk.ts';
import { remove_worn_item } from './steal.ts';
import { rider_cant_reach } from './steed.ts';
import { fall_asleep } from './timeout.ts';
import { erode_obj, fire_damage, float_up, unconscious, water_damage } from './trap.ts';
import { vision_recalc } from './vision.ts';
import { new_were, set_ulycn, you_unwere, you_were } from './were.ts';
import { aggravate } from './wizard.ts';
import { worm_known } from './worm.ts';
import { mon_adjust_speed, mon_set_minvis, which_armor } from './worn.ts';
import { bhitm, makewish, obj_resists, poly_obj, resist } from './zap.ts';
import { struct_d_level, struct_monst, struct_obj } from './structs.ts';
import { $at2, $cs, $rd, $sat, $ta, $wr, G, P, S, sprintf, strcmp, strcpy } from './rt/index.ts';
import { ACID_RES, AD_ACID, AD_DISE, AD_PEST, ALL_CLASSES, AMETHYST, ANTIMAGIC, ARMOR_CLASS, ARM_BOOTS, ARM_GLOVES, ARTICLE_THE, A_CHAOTIC, A_CON, A_DEX, A_INT, A_LAWFUL, A_MAX, A_STR, A_WIS, BLINDED, BOLT_LIM, COLNO, CONFUSION, COPPER, CORPSE, COST_NUTRLZ, COST_UNBLSS, COST_UNCURS, COST_alter, COST_none, DEAF, DETECT_MONSTERS, DISP_ALWAYS, DISP_END, EF_GREASE, ENL_GAMEINPROGRESS, ERODE_CORRODE, ER_DESTROYED, ER_NOTHING, EXPL_FIERY, EYE, FACE, FALSE, FAST, FIRE_RES, FIXED_ABIL, FOOT, FOUNTAIN, FREE_ACTION, FROMOUTSIDE, GEM_CLASS, GLIB, GLYPH_INVISIBLE, G_GONE, HALF_PHDAM, HALLUC, HALLUC_RES, HEAD, INFRAVISION, INVIS, IRON, I_SPECIAL, KILLED_BY, KILLED_BY_AN, LEG, LEVITATION, LOW_PM, MAGICENLIGHTENMENT, MAGIC_LAMP, MITHRIL, MUMMY_WRAPPING, M_AP_MONSTER, M_AP_NOTHING, NON_PM, NOTELL, NO_MM_FLAGS, OIL_LAMP, PLNMSG_OBJ_GLOWS, PM_DJINNI, PM_GHOST, PM_GREEN_SLIME, PM_GREMLIN, PM_IRON_GOLEM, PM_LICHEN, PM_PESTILENCE, POISON_RES, POTHIT_HERO_THROW, POTHIT_OTHER_THROW, POTION_CLASS, POT_ACID, POT_BOOZE, POT_CONFUSION, POT_ENLIGHTENMENT, POT_EXTRA_HEALING, POT_FRUIT_JUICE, POT_FULL_HEALING, POT_GAIN_ABILITY, POT_GAIN_ENERGY, POT_GAIN_LEVEL, POT_HALLUCINATION, POT_HEALING, POT_OIL, POT_POLYMORPH, POT_RESTORE_ABILITY, POT_SEE_INVISIBLE, POT_SICKNESS, POT_SPEED, POT_WATER, PROT_FROM_SHAPE_CHANGERS, P_BASIC, P_BOW, P_CROSSBOW, P_NONE, P_RIDING, P_SHURIKEN, QBUFSZ, ROWNO, SEE_INVIS, SHOPBASE, SICK, SICK_ALL, SICK_RES, SINK, SLEEP_RES, SLIMED, SPE_POLYMORPH, STONED, STRANGE_OBJECT, STRANGLED, STUNNED, SUPPRESS_IT, SUPPRESS_SADDLE, TELEPAT, TIMEOUT, TOOL_CLASS, TOWEL, TRUE, UNCHANGING, UNICORN_HORN, VOMITING, WAN_POLYMORPH, WARN_OF_MON, WEAPON_CLASS, WOUNDED_LEGS, W_SADDLE, W_WEP } from './consts.ts';

let nothing: number;
let unkn: number;
let beverages: any;
let vismsg: any;
let eyemsg: any;
let dodip$Dip_: any;

function itimeout(val: number): number {
  if (val >= TIMEOUT) {
    val = TIMEOUT;
  } else if (val < 1) {
    val = 0;
  }
  return val;
}

function itimeout_incr(old: number, incr: number): number {
  return itimeout((old & TIMEOUT) + incr);
}

export function set_itimeout(which: Ptr | null, val: number): void {
  which.a[which.o] = which.a[which.o] & ~TIMEOUT;
  which.a[which.o] = which.a[which.o] | itimeout(val);
}

export function incr_itimeout(which: Ptr | null, incr: number): void {
  set_itimeout(which, itimeout_incr(which.a[which.o], incr));
}

export async function make_confused(xtime: number, talk: number): Promise<void> {
  let old = G.u.uprops[CONFUSION].intrinsic;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  if (!xtime && old) {
    if (talk) {
      await You_feel(S("less %s now."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("trippy") : S("confused"));
    }
  }
  if (xtime && !old || !xtime && old) {
    G.context.botl = TRUE;
  }
  set_itimeout(P(G.u.uprops[CONFUSION], "intrinsic"), xtime);
}

export async function make_stunned(xtime: number, talk: number): Promise<void> {
  let old = G.u.uprops[STUNNED].intrinsic;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  if (!xtime && old) {
    if (talk) {
      await You_feel(S("%s now."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("less wobbly") : S("a bit steadier"));
    }
  }
  if (xtime && !old) {
    if (talk) {
      if (G.u.usteed) {
        await You(S("wobble in the saddle."));
      } else {
        await You(S("%s..."), stagger(G.youmonst.data, S("stagger")));
      }
    }
  }
  if (!xtime && old || xtime && !old) {
    G.context.botl = TRUE;
  }
  set_itimeout(P(G.u.uprops[STUNNED], "intrinsic"), xtime);
}

export async function make_sick(xtime: number, cause: Ptr | null, talk: number, type: number): Promise<void> {
  let kptr = null;
  let old = G.u.uprops[SICK].intrinsic;
  if (xtime > 0) {
    if (G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep)) {
      return;
    }
    if (!old) {
      await You_feel(S("deathly sick."));
    } else {
      if (talk) {
        await You_feel(S("%s worse."), xtime <= Math.trunc(G.u.uprops[SICK].intrinsic / 2) ? S("much") : S("even"));
      }
    }
    set_itimeout(P(G.u.uprops[SICK], "intrinsic"), xtime);
    G.u.usick_type = ((G.u.usick_type | 0 | type) >>> 0) & 3;
    G.context.botl = TRUE;
  } else if (old && type & (G.u.usick_type | 0)) {
    G.u.usick_type = (((G.u.usick_type | 0) & ~type) >>> 0) & 3;
    if (G.u.usick_type) {
      if (talk) {
        await You_feel(S("somewhat better."));
      }
      set_itimeout(P(G.u.uprops[SICK], "intrinsic"), G.u.uprops[SICK].intrinsic * 2);
    } else {
      if (talk) {
        await You_feel(S("cured.  What a relief!"));
      }
      G.u.uprops[SICK].intrinsic = 0;
    }
    G.context.botl = TRUE;
  }
  kptr = find_delayed_killer(SICK);
  if (G.u.uprops[SICK].intrinsic) {
    await exercise(A_CON, FALSE);
    if (xtime || !old || !kptr) {
      let kpfx = cause && !strcmp(cause, S("#wizintrinsic")) ? KILLED_BY : KILLED_BY_AN;
      await delayed_killer(SICK, kpfx, cause);
    }
  } else {
    await dealloc_killer(kptr);
  }
}

export async function make_slimed(xtime: number, msg: Ptr | null): Promise<void> {
  let old = G.u.uprops[SLIMED].intrinsic;
  set_itimeout(P(G.u.uprops[SLIMED], "intrinsic"), xtime);
  if ((xtime !== 0 ? 1 : 0) ^ (old !== 0 ? 1 : 0)) {
    G.context.botl = TRUE;
    if (msg) {
      await pline(S("%s"), msg);
    }
  }
  if (!G.u.uprops[SLIMED].intrinsic) {
    await dealloc_killer(find_delayed_killer(SLIMED));
    if ((G.youmonst.m_ap_type & 7) === M_AP_MONSTER && G.youmonst.mappearance === PM_GREEN_SLIME) {
      G.youmonst.m_ap_type = M_AP_NOTHING;
      G.youmonst.mappearance = 0;
    }
  }
}

export async function make_stoned(xtime: number, msg: Ptr | null, killedby: number, killername: Ptr | null): Promise<void> {
  let old = G.u.uprops[STONED].intrinsic;
  set_itimeout(P(G.u.uprops[STONED], "intrinsic"), xtime);
  if ((xtime !== 0 ? 1 : 0) ^ (old !== 0 ? 1 : 0)) {
    G.context.botl = TRUE;
    if (msg) {
      await pline(S("%s"), msg);
    }
  }
  if (!G.u.uprops[STONED].intrinsic) {
    await dealloc_killer(find_delayed_killer(STONED));
  } else if (!old) {
    await delayed_killer(STONED, killedby, killername);
  }
}

export async function make_vomiting(xtime: number, talk: number): Promise<void> {
  let old = G.u.uprops[VOMITING].intrinsic;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  set_itimeout(P(G.u.uprops[VOMITING], "intrinsic"), xtime);
  G.context.botl = TRUE;
  if (!xtime && old) {
    if (talk) {
      await You_feel(S("much less nauseated now."));
    }
  }
}

export async function make_blinded(xtime: number, talk: number): Promise<void> {
  let old = G.u.uprops[BLINDED].intrinsic;
  let u_could_see = 0;
  let can_see_now = 0;
  let eyes = null;
  u_could_see = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  G.u.uprops[BLINDED].intrinsic = xtime ? 1 : 0;
  can_see_now = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  G.u.uprops[BLINDED].intrinsic = old;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  if (can_see_now && !u_could_see) {
    if (talk) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("Far out!  Everything is all cosmic again!"));
      } else {
        await You(S("can see again."));
      }
    }
  } else if (old && !xtime) {
    if (talk) {
      if (!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        await strange_feeling(null, null);
      } else if (G.ublindf && G.ublindf.otyp !== 207) {
        eyes = body_part(EYE);
        if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
          eyes = await makeplural(eyes);
        }
        await Your(P(eyemsg), eyes, vtense(eyes, S("itch")));
      } else {
        await Your(P(vismsg), S("brighten"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("sadder") : S("normal"));
      }
    }
  }
  if (u_could_see && !can_see_now) {
    if (talk) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("Oh, bummer!  Everything is dark!  Help!"));
      } else {
        await pline(S("A cloud of darkness falls upon you."));
      }
    }
    if (!!G.uball) {
      await set_bc(0);
    }
  } else if (!old && xtime) {
    if (talk) {
      if (!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        await strange_feeling(null, null);
      } else if (G.ublindf && G.ublindf.otyp !== 207) {
        eyes = body_part(EYE);
        if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
          eyes = await makeplural(eyes);
        }
        await Your(P(eyemsg), eyes, vtense(eyes, S("twitch")));
      } else {
        await Your(P(vismsg), S("dim"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("happier") : S("normal"));
      }
    }
  }
  set_itimeout(P(G.u.uprops[BLINDED], "intrinsic"), xtime);
  if (u_could_see ^ can_see_now) {
    await toggle_blindness();
  }
}

export async function toggle_blindness(): Promise<void> {
  let Stinging = (G.uwep && (G.u.uprops[WARN_OF_MON].extrinsic & W_WEP) !== 0 ? 1 : 0) << 24 >> 24;
  G.context.botl = TRUE;
  G.vision_full_recalc = 1;
  await vision_recalc(0);
  if (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) || Stinging) {
    await see_monsters();
  }
  if (Stinging) {
    await Sting_effects(-1);
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await learn_unseen_invent();
  }
}

export async function make_hallucinated(xtime: number, talk: number, mask: number): Promise<number> {
  let $t1: any, $t2: any;
  let old = G.u.uprops[HALLUC].intrinsic;
  let changed = 0;
  let message = null;
  let verb = null;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  message = !xtime ? S("Everything %s SO boring now.") : S("Oh wow!  Everything %s so cosmic!");
  verb = !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("looks") : S("feels");
  if (mask) {
    if (G.u.uprops[HALLUC].intrinsic) {
      changed = TRUE;
    }
    if (!xtime) {
      ($t1 = G.u.uprops[HALLUC_RES], $t1.extrinsic = $t1.extrinsic | mask);
    } else {
      ($t2 = G.u.uprops[HALLUC_RES], $t2.extrinsic = $t2.extrinsic & ~mask);
    }
  } else {
    if (!G.u.uprops[HALLUC_RES].extrinsic && (!!G.u.uprops[HALLUC].intrinsic ? 1 : 0) !== (!!xtime ? 1 : 0)) {
      changed = TRUE;
    }
    set_itimeout(P(G.u.uprops[HALLUC], "intrinsic"), xtime);
    if (!changed && !G.u.uprops[HALLUC].intrinsic && old && talk) {
      if (!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        await strange_feeling(null, null);
      } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        let eyes = body_part(EYE);
        if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
          eyes = await makeplural(eyes);
        }
        await Your(P(eyemsg), eyes, vtense(eyes, S("itch")));
      } else {
        await Your(P(vismsg), S("flatten"), S("normal"));
      }
    }
  }
  if (changed) {
    if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      await eatmupdate();
    }
    if (G.u.uswallow) {
      await swallowed(0);
    } else {
      await see_monsters();
      await see_objects();
      await see_traps();
    }
    update_inventory();
    G.context.botl = TRUE;
    if (talk) {
      await pline(message, verb);
    }
  }
  return changed;
}

export async function make_deaf(xtime: number, talk: number): Promise<void> {
  let old = G.u.uprops[DEAF].intrinsic;
  if (G.multi < 0 && (unconscious() || is_fainted())) {
    talk = FALSE;
  }
  set_itimeout(P(G.u.uprops[DEAF], "intrinsic"), xtime);
  if ((xtime !== 0 ? 1 : 0) ^ (old !== 0 ? 1 : 0)) {
    G.context.botl = TRUE;
    if (talk) {
      await You(old ? S("can hear again.") : S("are unable to hear anything."));
    }
  }
}

export function make_glib(xtime: number): void {
  set_itimeout(P(G.u.uprops[GLIB], "intrinsic"), xtime);
  if (G.uarmg) {
    update_inventory();
  }
}

export async function self_invis_message(): Promise<void> {
  await pline(S("%s %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("Far out, man!  You") : S("Gee!  All of a sudden, you"), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S("can see right through yourself") : S("can't see yourself"));
}

async function ghost_from_bottle(): Promise<void> {
  let mtmp = await makemon($sat(G.mons, PM_GHOST), G.u.ux, G.u.uy, NO_MM_FLAGS);
  if (!mtmp) {
    await pline(S("This bottle turns out to be empty."));
    return;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await pline(S("As you open the bottle, %s emerges."), G.c_common_strings.c_something);
    return;
  }
  await pline(S("As you open the bottle, an enormous %s emerges!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("ghost"));
  if (G.flags.verbose) {
    await You(S("are frightened to death, and unable to move."));
  }
  nomul(-3);
  G.multi_reason = S("being frightened to death");
  G.nomovemsg = S("You regain your composure.");
}

export async function dodrink(): Promise<number> {
  let otmp = null;
  let potion_descr = null;
  if (G.u.uprops[STRANGLED].intrinsic) {
    await pline(S("If you can't breathe air, how can you drink liquid?"));
    return 0;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === FOUNTAIN && can_reach_floor(FALSE)) {
    if (await yn_function(S("Drink from the fountain?"), P(G.ynchars), 110) === 121) {
      await drinkfountain();
      return 1;
    }
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === SINK && can_reach_floor(FALSE)) {
    if (await yn_function(S("Drink from the sink?"), P(G.ynchars), 110) === 121) {
      await drinksink();
      return 1;
    }
  }
  if (G.u.uinwater | 0 && !G.u.uswallow) {
    if (await yn_function(S("Drink the water around you?"), P(G.ynchars), 110) === 121) {
      await pline(S("Do you know what lives in this water?"));
      return 1;
    }
  }
  otmp = await getobj(P(beverages), S("drink"));
  if (!otmp) {
    return 0;
  }
  if (otmp.quan > 1) {
    otmp = await splitobj(otmp, 1);
    otmp.owornmask = 0;
  } else if (otmp.owornmask) {
    await remove_worn_item(otmp, FALSE);
  }
  otmp.in_use = (TRUE) & 1;
  potion_descr = G.obj_descr[G.objects[otmp.otyp].oc_descr_idx].oc_descr;
  if (potion_descr) {
    if (!strcmp(potion_descr, S("milky")) && !(G.mvitals[PM_GHOST].mvflags & G_GONE) && !rn2(13 + 2 * G.mvitals[283].born)) {
      await ghost_from_bottle();
      await useup(otmp);
      return 1;
    } else if (!strcmp(potion_descr, S("smoky")) && !(G.mvitals[PM_DJINNI].mvflags & G_GONE) && !rn2(13 + 2 * G.mvitals[312].born)) {
      await djinni_from_bottle(otmp);
      await useup(otmp);
      return 1;
    }
  }
  return await dopotion(otmp);
}

export async function dopotion(otmp: struct_obj | null): Promise<number> {
  let retval = 0;
  otmp.in_use = (TRUE) & 1;
  nothing = unkn = 0;
  if ((retval = await peffects(otmp)) >= 0) {
    return retval;
  }
  if (nothing) {
    ++unkn;
    await You(S("have a %s feeling for a moment, then it passes."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("peculiar"));
  }
  if (otmp.dknown | 0 && !G.objects[otmp.otyp].oc_name_known) {
    if (!unkn) {
      await discover_object(otmp.otyp, 1, 1);
      await more_experienced(0, 10);
    } else if (!G.objects[otmp.otyp].oc_uname) {
      await docall(otmp);
    }
  }
  await useup(otmp);
  return 1;
}

export async function peffects(otmp: struct_obj | null): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let i = 0;
  let ii = 0;
  let lim = 0;
  switch (otmp.otyp) {
  case 273:
  case 367:
    ++unkn;
    if (otmp.cursed) {
      await pline(S("Ulch!  This makes you feel mediocre!"));
      break;
    } else {
      await pline(S("Wow!  This makes you feel %s!"), otmp.blessed | 0 ? unfixable_trouble_count(FALSE) ? S("better") : S("great") : S("good"));
      i = rn2(A_MAX);
      for (ii = 0; ii < A_MAX; ++ii) {
        lim = G.u.amax.a[i];
        if (G.u.acurr.a[i] < lim) {
          G.u.acurr.a[i] = lim << 24 >> 24;
          G.context.botl = 1;
          if (!otmp.blessed) {
            break;
          }
        }
        if (++i >= A_MAX) {
          i = 0;
        }
      }
      if (otmp.otyp === POT_RESTORE_ABILITY && G.u.ulevel < G.u.ulevelmax) {
        do {
          await pluslvl(FALSE);
        } while (G.u.ulevel < G.u.ulevelmax && otmp.blessed | 0);
      }
    }
    break;
  case 279:
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || (G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      ++nothing;
    }
    await make_hallucinated(itimeout_incr(G.u.uprops[HALLUC].intrinsic, rn2(200) + (600 - 300 * bcsign(otmp))), TRUE, 0);
    break;
  case 297:
    if (!otmp.blessed && !otmp.cursed) {
      await pline(S("This tastes like %s."), hliquid(S("water")));
      G.u.uhunger += rnd(10);
      await newuhs(FALSE);
      break;
    }
    ++unkn;
    if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || (G.youmonst.data.mflags2 & 256) >>> 0 !== 0 || G.u.ualign.type === A_CHAOTIC) {
      if (otmp.blessed) {
        await pline(S("This burns like %s!"), hliquid(S("acid")));
        await exercise(A_CON, FALSE);
        if (G.u.ulycn >= LOW_PM) {
          await Your(S("affinity to %s disappears!"), await makeplural(G.mons[G.u.ulycn].mname));
          if (G.youmonst.data === $sat(G.mons, G.u.ulycn)) {
            await you_unwere(FALSE);
          }
          await set_ulycn(NON_PM);
        }
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (d(2, 6) + 1) / 2 | 0 : d(2, 6), S("potion of holy water"), KILLED_BY_AN);
      } else if (otmp.cursed) {
        await You_feel(S("quite proud of yourself."));
        await healup(d(2, 6), 0, 0, 0);
        if (G.u.ulycn >= LOW_PM && !(G.u.umonnum !== G.u.umonster)) {
          await you_were();
        }
        await exercise(A_CON, TRUE);
      }
    } else {
      if (otmp.blessed) {
        await You_feel(S("full of awe."));
        await make_sick(0, null, TRUE, SICK_ALL);
        await exercise(A_WIS, TRUE);
        await exercise(A_CON, TRUE);
        if (G.u.ulycn >= LOW_PM) {
          await you_unwere(TRUE);
        }
      } else {
        if (G.u.ualign.type === A_LAWFUL) {
          await pline(S("This burns like %s!"), hliquid(S("acid")));
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (d(2, 6) + 1) / 2 | 0 : d(2, 6), S("potion of unholy water"), KILLED_BY_AN);
        } else {
          await You_feel(S("full of dread."));
        }
        if (G.u.ulycn >= LOW_PM && !(G.u.umonnum !== G.u.umonster)) {
          await you_were();
        }
        await exercise(A_CON, FALSE);
      }
    }
    break;
  case 292:
    ++unkn;
    await pline(S("Ooph!  This tastes like %s%s!"), otmp.oeroded | 0 ? S("watered down ") : S(""), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("dandelion wine") : S("liquid fire"));
    if (!otmp.blessed) {
      await make_confused(itimeout_incr(G.u.uprops[CONFUSION].intrinsic, d(3, 8)), FALSE);
    }
    if (!otmp.oeroded) {
      await healup(1, 0, FALSE, FALSE);
    }
    G.u.uhunger += 10 * (2 + bcsign(otmp));
    await newuhs(FALSE);
    await exercise(A_WIS, FALSE);
    if (otmp.cursed) {
      await You(S("pass out."));
      G.multi = -rnd(15);
      G.nomovemsg = S("You awake with a headache.");
    }
    break;
  case 285:
    if (otmp.cursed) {
      ++unkn;
      await You(S("have an uneasy feeling..."));
      await exercise(A_WIS, FALSE);
    } else {
      if (otmp.blessed) {
        await adjattrib(A_INT, 1, FALSE);
        await adjattrib(A_WIS, 1, FALSE);
      }
      await You_feel(S("self-knowledgeable..."));
      await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      await enlightenment(MAGICENLIGHTENMENT, ENL_GAMEINPROGRESS);
      await pline_The(S("feeling subsides."));
      await exercise(A_WIS, TRUE);
    }
    break;
  case 368:
    if (G.u.uprops[INVIS].blocked && G.uarmc.otyp === MUMMY_WRAPPING) {
      await You_feel(S("rather itchy under %s."), await yname(G.uarmc));
      break;
    }
  case 280:
    if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[INVIS].blocked) {
      ++nothing;
    } else {
      await self_invis_message();
    }
    if (otmp.blessed) {
      ($t1 = G.u.uprops[INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
    } else {
      incr_itimeout(P(G.u.uprops[INVIS], "intrinsic"), rn2(15) + 31);
    }
    await newsym(G.u.ux, G.u.uy);
    if (otmp.cursed) {
      await pline(S("For some reason, you feel your presence is known."));
      await aggravate();
    }
    break;
  case 281:
  case 294:
    {
      let msg = (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0;
      ++unkn;
      if (otmp.cursed) {
        await pline(S("Yecch!  This tastes %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("overripe") : S("rotten"));
      } else {
        await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("This tastes like 10%% real %s%s all-natural beverage.") : S("This tastes like %s%s."), otmp.oeroded | 0 ? S("reconstituted ") : S(""), await fruitname(TRUE));
      }
      if (otmp.otyp === POT_FRUIT_JUICE) {
        G.u.uhunger += Math.imul(otmp.oeroded | 0 ? 5 : 10, 2 + bcsign(otmp));
        await newuhs(FALSE);
        break;
      }
      if (!otmp.cursed) {
        await make_blinded(0, TRUE);
      }
      if (otmp.blessed) {
        ($t2 = G.u.uprops[SEE_INVIS], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
      } else {
        incr_itimeout(P(G.u.uprops[SEE_INVIS], "intrinsic"), rn2(100) + 750);
      }
      set_mimic_blocking();
      await see_monsters();
      await newsym(G.u.ux, G.u.uy);
      if (msg && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await You(S("can see through yourself, but you are visible!"));
        --unkn;
      }
      break;
    }
  case 276:
    if (G.u.uprops[FREE_ACTION].extrinsic) {
      await You(S("stiffen momentarily."));
    } else {
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
        await You(S("are motionlessly suspended."));
      } else if (G.u.usteed) {
        await You(S("are frozen in place!"));
      } else {
        await Your(S("%s are frozen to the %s!"), await makeplural(body_part(FOOT)), surface(G.u.ux, G.u.uy));
      }
      nomul(-(rn2(10) + (25 - 12 * bcsign(otmp))));
      G.multi_reason = S("frozen by a potion");
      G.nomovemsg = G.c_common_strings.c_You_can_move_again;
      await exercise(A_DEX, FALSE);
    }
    break;
  case 289:
    if (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic || G.u.uprops[FREE_ACTION].extrinsic) {
      await You(S("yawn."));
    } else {
      await You(S("suddenly fall asleep!"));
      await fall_asleep(-(rn2(10) + (25 - 12 * bcsign(otmp))), TRUE);
    }
    break;
  case 286:
  case 348:
    if (otmp.blessed) {
      let x = 0;
      let y = 0;
      if (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) {
        ++nothing;
      }
      ++unkn;
      if ((G.u.uprops[DETECT_MONSTERS].intrinsic & TIMEOUT) >= 300) {
        i = 1;
      } else {
        i = rn2(40) + 21;
      }
      incr_itimeout(P(G.u.uprops[DETECT_MONSTERS], "intrinsic"), i);
      for (x = 1; x < COLNO; ++x) {
        for (y = 0; y < ROWNO; ++y) {
          if ($at2(G.level.locations, x, y).glyph === GLYPH_INVISIBLE) {
            await unmap_object(x, y);
            await newsym(x, y);
          }
          if (!!G.level.monsters[x][y]) {
            unkn = 0;
          }
        }
      }
      await see_monsters();
      if (unkn) {
        await You_feel(S("lonely."));
      }
      break;
    }
    if (await monster_detect(otmp, 0)) {
      return 1;
    }
    await exercise(A_WIS, TRUE);
    break;
  case 287:
  case 369:
    if (await object_detect(otmp, 0)) {
      return 1;
    }
    await exercise(A_WIS, TRUE);
    break;
  case 293:
    await pline(S("Yecch!  This stuff tastes like poison."));
    if (otmp.blessed) {
      await pline(S("(But in fact it was mildly stale %s.)"), await fruitname(TRUE));
      if (!(G.urole.malenum === 332)) {
        await losehp(1, S("mildly contaminated potion"), KILLED_BY_AN);
      }
    } else {
      if (G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) {
        await pline(S("(But in fact it was biologically contaminated %s.)"), await fruitname(TRUE));
      }
      if (G.urole.malenum === 332) {
        await pline(S("Fortunately, you have been immunized."));
      } else {
        let contaminant = new Int8Array(256);
        let typ = rn2(A_MAX);
        sprintf(P(contaminant), S("%s%s"), G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? S("mildly ") : S(""), otmp.corpsenm ? S("contaminated tap water") : S("contaminated potion"));
        if (!G.u.uprops[FIXED_ABIL].extrinsic) {
          await poisontell(typ, FALSE);
          await adjattrib(typ, G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? -1 : -(rn2(4) + 3), 1);
        }
        if (!(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic)) {
          if (otmp.corpsenm) {
            await losehp(rnd(10) + 5 * (!!otmp.cursed ? 1 : 0), P(contaminant), KILLED_BY);
          } else {
            await losehp(rnd(10) + 5 * (!!otmp.cursed ? 1 : 0), P(contaminant), KILLED_BY_AN);
          }
        } else {
          await losehp(1 + rn2(2), P(contaminant), otmp.corpsenm ? KILLED_BY : KILLED_BY_AN);
        }
        await exercise(A_CON, FALSE);
      }
    }
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await You(S("are shocked back to your senses!"));
      await make_hallucinated(0, FALSE, 0);
    }
    break;
  case 274:
    if (!G.u.uprops[CONFUSION].intrinsic) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("What a trippy feeling!"));
        ++unkn;
      } else {
        await pline(S("Huh, What?  Where am I?"));
      }
    } else {
      ++nothing;
    }
    await make_confused(itimeout_incr(G.u.uprops[CONFUSION].intrinsic, rn2(7) + (16 - 8 * bcsign(otmp))), FALSE);
    break;
  case 272:
    if (otmp.cursed) {
      await pline(S("Ulch!  That potion tasted foul!"));
      ++unkn;
    } else if (G.u.uprops[FIXED_ABIL].extrinsic) {
      ++nothing;
    } else {
      let itmp = 0;
      i = -1;
      for (ii = A_MAX; ii > 0; --ii) {
        i = otmp.blessed | 0 ? i + 1 : rn2(A_MAX);
        itmp = otmp.blessed | 0 || ii === 1 ? 0 : -1;
        if (await adjattrib(i, 1, itmp) && !otmp.blessed) {
          break;
        }
      }
    }
    break;
  case 277:
    if ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) && !otmp.cursed && !G.u.usteed) {
      await heal_legs(0);
      ++unkn;
      break;
    }
  case 363:
    if (!(G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic)) {
      await You(S("are suddenly moving %sfaster."), G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic ? S("") : S("much "));
    } else {
      await Your(S("%s get new energy."), await makeplural(body_part(LEG)));
      ++unkn;
    }
    await exercise(A_DEX, TRUE);
    incr_itimeout(P(G.u.uprops[FAST], "intrinsic"), rn2(10) + (100 + 60 * bcsign(otmp)));
    break;
  case 275:
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      ++nothing;
    }
    await make_blinded(itimeout_incr(G.u.uprops[BLINDED].intrinsic, rn2(200) + (250 - 125 * bcsign(otmp))), (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24);
    break;
  case 284:
    if (otmp.cursed) {
      ++unkn;
      if (ledger_no(G.u.uz) === 1 && G.u.uhave.amulet | 0 || await Can_rise_up(G.u.ux, G.u.uy, G.u.uz)) {
        let riseup = S("rise up, through the %s!");
        if (ledger_no(G.u.uz) === 1) {
          await You(riseup, ceiling(G.u.ux, G.u.uy));
          await goto_level(G.dungeon_topology.d_earth_level, FALSE, FALSE, FALSE);
        } else {
          let newlev = depth(G.u.uz) - 1;
          let newlevel = new struct_d_level();
          await get_level(newlevel, newlev);
          if (on_level(newlevel, G.u.uz)) {
            await pline(S("It tasted bad."));
            break;
          } else {
            await You(riseup, ceiling(G.u.ux, G.u.uy));
          }
          await goto_level(newlevel, FALSE, FALSE, FALSE);
        }
      } else {
        await You(S("have an uneasy feeling."));
      }
      break;
    }
    await pluslvl(FALSE);
    if (otmp.blessed) {
      G.u.uexp = rndexp(TRUE);
    }
    break;
  case 282:
    await You_feel(S("better."));
    await healup(d(6 + 2 * bcsign(otmp), 4), !otmp.cursed ? 1 : 0, !!otmp.blessed ? 1 : 0, !otmp.cursed ? 1 : 0);
    await exercise(A_CON, TRUE);
    break;
  case 283:
    await You_feel(S("much better."));
    await healup(d(6 + 2 * bcsign(otmp), 8), otmp.blessed | 0 ? 5 : !otmp.cursed ? 2 : 0, !otmp.cursed ? 1 : 0, TRUE);
    await make_hallucinated(0, TRUE, 0);
    await exercise(A_CON, TRUE);
    await exercise(A_STR, TRUE);
    break;
  case 290:
    await You_feel(S("completely healed."));
    await healup(400, 4 + 4 * bcsign(otmp), !otmp.cursed ? 1 : 0, TRUE);
    if (otmp.blessed | 0 && G.u.ulevel < G.u.ulevelmax) {
      G.u.ulevelmax -= 1;
      await pluslvl(FALSE);
    }
    await make_hallucinated(0, TRUE, 0);
    await exercise(A_STR, TRUE);
    await exercise(A_CON, TRUE);
    break;
  case 278:
  case 365:
    if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !G.u.uprops[LEVITATION].blocked) {
      set_itimeout(P(G.u.uprops[LEVITATION], "intrinsic"), 1);
      await float_up();
    } else {
      ++nothing;
    }
    if (otmp.cursed) {
      ($t3 = G.u.uprops[LEVITATION], $t3.intrinsic = $t3.intrinsic & ~I_SPECIAL);
      if (G.u.uprops[LEVITATION].blocked) {
        ;
      } else if (G.u.ux === G.upstair.sx && G.u.uy === G.upstair.sy || G.sstairs.up && G.u.ux === G.sstairs.sx && G.u.uy === G.sstairs.sy || G.upladder.sx && G.u.ux === G.upladder.sx && G.u.uy === G.upladder.sy) {
        await doup();
        nothing = 0;
      } else if (has_ceiling(G.u.uz)) {
        let dmg = rnd(!G.uarmh ? 10 : !((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) ? 6 : 3);
        await You(S("hit your %s on the %s."), body_part(HEAD), ceiling(G.u.ux, G.u.uy));
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("colliding with the ceiling"), KILLED_BY);
        nothing = 0;
      }
    } else if (otmp.blessed) {
      incr_itimeout(P(G.u.uprops[LEVITATION], "intrinsic"), rn2(50) + 250);
      ($t4 = G.u.uprops[LEVITATION], $t4.intrinsic = $t4.intrinsic | I_SPECIAL);
    } else {
      incr_itimeout(P(G.u.uprops[LEVITATION], "intrinsic"), rn2(140) + 10);
    }
    if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked && $at2(G.level.locations, G.u.ux, G.u.uy).typ === SINK) {
      await spoteffects(FALSE);
    }
    float_vs_flight();
    break;
  case 288:
    {
      let num = 0;
      if (otmp.cursed) {
        await You_feel(S("lackluster."));
      } else {
        await pline(S("Magical energies course through your body."));
      }
      num = d(otmp.blessed | 0 ? 3 : !otmp.cursed ? 2 : 1, 6);
      if (otmp.cursed) {
        num = -num;
      }
      G.u.uenmax += num;
      if (G.u.uenmax <= 0) {
        G.u.uenmax = 0;
      }
      G.u.uen += 3 * num;
      if (G.u.uen > G.u.uenmax) {
        G.u.uen = G.u.uenmax;
      } else if (G.u.uen <= 0) {
        G.u.uen = 0;
      }
      G.context.botl = 1;
      await exercise(A_WIS, TRUE);
      break;
    }
  case 296:
    {
      let good_for_you = FALSE;
      if (otmp.lamplit) {
        if (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || (G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326))) {
          await pline(S("Ahh, a refreshing drink."));
          good_for_you = TRUE;
        } else {
          await You(S("burn your %s."), body_part(FACE));
          await losehp(d(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 1 : 3, 4), S("burning potion of oil"), KILLED_BY_AN);
        }
      } else if (otmp.cursed) {
        await pline(S("This tastes like castor oil."));
      } else {
        await pline(S("That was smooth!"));
      }
      await exercise(A_WIS, good_for_you);
      break;
    }
  case 295:
    if (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) {
      await pline(S("This tastes %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("tangy") : S("sour"));
    } else {
      let dmg = 0;
      await pline(S("This burns%s!"), otmp.blessed | 0 ? S(" a little") : otmp.cursed | 0 ? S(" a lot") : S(" like acid"));
      dmg = d(otmp.cursed | 0 ? 2 : 1, otmp.blessed | 0 ? 4 : 8);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("potion of acid"), KILLED_BY_AN);
      await exercise(A_CON, FALSE);
    }
    if (G.u.uprops[STONED].intrinsic) {
      await fix_petrification();
    }
    ++unkn;
    break;
  case 291:
    await You_feel(S("a little %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
    if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
      await polyself(0);
    }
    break;
  default:
    await impossible(S("What a funny potion! (%u)"), otmp.otyp);
    return 0;
  }
  return -1;
}

export async function healup(nhp: number, nxtra: number, curesick: number, cureblind: number): Promise<void> {
  if (nhp) {
    if (G.u.umonnum !== G.u.umonster) {
      G.u.mh += nhp;
      if (G.u.mh > G.u.mhmax) {
        G.u.mh = G.u.mhmax += nxtra;
      }
    } else {
      G.u.uhp += nhp;
      if (G.u.uhp > G.u.uhpmax) {
        G.u.uhp = G.u.uhpmax += nxtra;
      }
    }
  }
  if (cureblind) {
    G.u.ucreamed = 0;
    await make_blinded(0, TRUE);
    await make_deaf(0, TRUE);
  }
  if (curesick) {
    await make_vomiting(0, TRUE);
    await make_sick(0, null, TRUE, SICK_ALL);
  }
  G.context.botl = 1;
  return;
}

export async function strange_feeling(obj: struct_obj | null, txt: Ptr | null): Promise<void> {
  if (G.flags.beginner || !txt) {
    await You(S("have a %s feeling for a moment, then it passes."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
  } else {
    await pline(S("%s"), txt);
  }
  if (!obj) {
    return;
  }
  if (obj.dknown | 0 && !G.objects[obj.otyp].oc_name_known && !G.objects[obj.otyp].oc_uname) {
    await docall(obj);
  }
  await useup(obj);
}

export function bottlename(): Ptr | null {
  return G.bottlenames[rn2(Math.trunc(56 / 8) | 0)];
}

async function H2Opotion_dip(potion: struct_obj | null, targobj: struct_obj | null, useeit: number, objphrase: Ptr | null): Promise<number> {
  let func = null;
  let glowcolor = null;
  let costchange = COST_none;
  let altfmt = FALSE;
  let res = FALSE;
  if (!potion || potion.otyp !== POT_WATER) {
    return FALSE;
  }
  if (potion.blessed) {
    if (targobj.cursed) {
      func = uncurse;
      glowcolor = G.c_color_names.c_amber;
      costchange = COST_UNCURS;
    } else if (!targobj.blessed) {
      func = bless;
      glowcolor = G.c_color_names.c_light_blue;
      costchange = COST_alter;
      altfmt = TRUE;
    }
  } else if (potion.cursed) {
    if (targobj.blessed) {
      func = unbless;
      glowcolor = S("brown");
      costchange = COST_UNBLSS;
    } else if (!targobj.cursed) {
      func = curse;
      glowcolor = G.c_color_names.c_black;
      costchange = COST_alter;
      altfmt = TRUE;
    }
  } else {
    if (targobj.where === 3) {
      if (await water_damage(targobj, null, TRUE) !== ER_NOTHING) {
        res = TRUE;
      }
    }
  }
  if (func) {
    if (useeit) {
      glowcolor = hcolor(glowcolor);
      if (altfmt) {
        await pline(S("%s with %s aura."), objphrase, await an(glowcolor));
      } else {
        await pline(S("%s %s."), objphrase, glowcolor);
      }
      G.iflags.last_msg = PLNMSG_OBJ_GLOWS;
      targobj.bknown = ((!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) >>> 0) & 1;
    } else {
      if (!potion.bknown || !potion.dknown) {
        targobj.bknown = 0;
      }
    }
    if (targobj.unpaid | 0 && targobj.otyp === POT_WATER) {
      if (costchange === COST_alter) {
        await alter_cost(targobj, 0);
      } else if (costchange !== COST_none) {
        await costly_alteration(targobj, costchange);
      }
    }
    await func(targobj);
    res = TRUE;
  }
  return res;
}

export async function potionhit(mon: struct_monst | null, obj: struct_obj | null, how: number): Promise<void> {
  let $g = 0;
  let botlnam = null;
  let isyou = 0;
  let distance = 0;
  let tx = 0;
  let ty = 0;
  let saddle = null;
  let hit_saddle = 0;
  let your_fault = 0;
  let angermon = 0;
  let cureblind = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      botlnam = bottlename();
      isyou = (mon === G.youmonst ? 1 : 0) << 24 >> 24;
      saddle = null;
      hit_saddle = FALSE;
      your_fault = (how <= POTHIT_HERO_THROW ? 1 : 0) << 24 >> 24;
      if (isyou) {
        tx = G.u.ux, ty = G.u.uy;
        distance = 0;
        await pline_The(S("%s crashes on your %s and breaks into shards."), botlnam, body_part(HEAD));
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (rnd(2) + 1) / 2 | 0 : rnd(2), how === POTHIT_OTHER_THROW ? S("propelled potion") : S("thrown potion"), KILLED_BY_AN);
      } else {
        tx = mon.mx, ty = mon.my;
        if (mon.misc_worn_check & W_SADDLE && (saddle = await which_armor(mon, W_SADDLE)) && (!rn2(10) || obj.otyp === POT_WATER && (rnl(10) > 7 && obj.cursed | 0 || rnl(10) < 4 && obj.blessed | 0 || !rn2(3)))) {
          hit_saddle = TRUE;
        }
        distance = dist2(tx, ty, G.u.ux, G.u.uy);
        if (!($rd(G.viz_array.a[G.viz_array.o + ty], tx) & 2)) {
          await pline(S("Crash!"));
        } else {
          let mnam = await mon_nam(mon);
          let buf = new Int8Array(256);
          if (hit_saddle && saddle) {
            sprintf(P(buf), S("%s saddle"), s_suffix(await x_monnam(mon, ARTICLE_THE, null, SUPPRESS_IT | SUPPRESS_SADDLE, FALSE)));
          } else if ((mon.data.mflags1 & 32768) >>> 0 === 0) {
            sprintf(P(buf), S("%s %s"), s_suffix(mnam), G.notonhead ? S("body") : S("head"));
          } else {
            strcpy(P(buf), mnam);
          }
          await pline_The(S("%s crashes on %s and breaks into shards."), botlnam, P(buf));
        }
        if (rn2(5) && mon.mhp > 1 && !hit_saddle) {
          --mon.mhp;
        }
      }
      if (obj.otyp !== POT_OIL && !hit_saddle && $rd(G.viz_array.a[G.viz_array.o + ty], tx) & 2) {
        await pline(S("%s."), await Tobjnam(obj, S("evaporate")));
      }
      if (!isyou) { $g = 4; continue $L; }
      {
        switch (obj.otyp) {
        case 296:
          if (obj.lamplit) {
            await explode_oil(obj, G.u.ux, G.u.uy);
          }
          break;
        case 291:
          await You_feel(S("a little %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
          if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && !(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic)) {
            await polyself(0);
          }
          break;
        case 295:
          if (!(G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic)) {
            let dmg = 0;
            await pline(S("This burns%s!"), obj.blessed | 0 ? S(" a little") : obj.cursed | 0 ? S(" a lot") : S(""));
            dmg = d(obj.cursed | 0 ? 2 : 1, obj.blessed | 0 ? 4 : 8);
            await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("potion of acid"), KILLED_BY_AN);
          }
          break;
        }
      }
      { $g = 3; continue $L; }
    case 4:
      if (!(hit_saddle && saddle)) { $g = 6; continue $L; }
      {
        let mnam = null;
        let buf = new Int8Array(256);
        let saddle_glows = new Int8Array(256);
        let affected = FALSE;
        let useeit = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) && $rd(G.viz_array.a[G.viz_array.o + ty], tx) & 2 ? 1 : 0) << 24 >> 24;
        mnam = await x_monnam(mon, ARTICLE_THE, null, SUPPRESS_IT | SUPPRESS_SADDLE, FALSE);
        sprintf(P(buf), S("%s"), upstart(s_suffix(mnam)));
        switch (obj.otyp) {
        case 297:
          sprintf(P(saddle_glows), S("%s %s"), P(buf), await aobjnam(saddle, S("glow")));
          affected = await H2Opotion_dip(obj, saddle, useeit, P(saddle_glows));
          break;
        case 291:
          break;
        }
        if (useeit && !affected) {
          await pline(S("%s %s wet."), P(buf), await aobjnam(saddle, S("get")));
        }
      }
      { $g = 5; continue $L; }
    case 6:
      angermon = your_fault;
      cureblind = FALSE;
      switch (obj.otyp) {
      case 290: { $g = 8; continue $L; }
      case 283: { $g = 9; continue $L; }
      case 282: { $g = 10; continue $L; }
      case 273: { $g = 11; continue $L; }
      case 272: { $g = 12; continue $L; }
      case 293: { $g = 13; continue $L; }
      case 274: { $g = 14; continue $L; }
      case 292: { $g = 15; continue $L; }
      case 280: { $g = 16; continue $L; }
      case 289: { $g = 17; continue $L; }
      case 276: { $g = 18; continue $L; }
      case 277: { $g = 19; continue $L; }
      case 275: { $g = 20; continue $L; }
      case 297: { $g = 21; continue $L; }
      case 296: { $g = 22; continue $L; }
      case 295: { $g = 23; continue $L; }
      case 291: { $g = 24; continue $L; }
      default: { $g = 7; continue $L; }
      }
    case 8:
      cureblind = TRUE;
    case 9:
      if (!obj.cursed) {
        cureblind = TRUE;
      }
    case 10:
      if (obj.blessed) {
        cureblind = TRUE;
      }
      if (mon.data === $sat(G.mons, PM_PESTILENCE)) {
        { $g = 1; continue $L; }
      }
    case 11:
    case 12:
    case 2: // do_healing
      angermon = FALSE;
      if (mon.mhp < mon.mhpmax) {
        mon.mhp = mon.mhpmax;
        if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          await pline(S("%s looks sound and hale again."), await Monnam(mon));
        }
      }
      if (cureblind) {
        await mcureblindness(mon, (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0);
      }
      { $g = 7; continue $L; };
    case 13:
      if (mon.data === $sat(G.mons, PM_PESTILENCE)) {
        { $g = 2; continue $L; }
      }
      if (dmgtype(mon.data, AD_DISE) || dmgtype(mon.data, AD_PEST) || ((mon.data.mresists | mon.mextrinsics) & 32) !== 0) {
        if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          await pline(S("%s looks unharmed."), await Monnam(mon));
        }
        { $g = 7; continue $L; };
      }
    case 1: // do_illness
      if (mon.mhpmax > 3 && !await resist(mon, POTION_CLASS, 0, NOTELL)) {
        mon.mhpmax = mon.mhpmax / 2 | 0;
      }
      if (mon.mhp > 2 && !await resist(mon, POTION_CLASS, 0, NOTELL)) {
        mon.mhp = mon.mhp / 2 | 0;
      }
      if (mon.mhp > mon.mhpmax) {
        mon.mhp = mon.mhpmax;
      }
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
        await pline(S("%s looks rather ill."), await Monnam(mon));
      }
      { $g = 7; continue $L; };
    case 14:
    case 15:
      if (!await resist(mon, POTION_CLASS, 0, NOTELL)) {
        mon.mconf = (TRUE) & 1;
      }
      { $g = 7; continue $L; };
    case 16:
      {
        let sawit = ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)) ? 1 : 0) << 24 >> 24;
        angermon = FALSE;
        await mon_set_minvis(mon);
        if (sawit && !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
          await map_invisible(mon.mx, mon.my);
        }
        { $g = 7; continue $L; };
      }
    case 17:
      if (await sleep_monst(mon, rnd(12), POTION_CLASS)) {
        await pline(S("%s falls asleep."), await Monnam(mon));
        await slept_monst(mon);
      }
      { $g = 7; continue $L; };
    case 18:
      if (mon.mcanmove) {
        paralyze_monst(mon, rnd(25));
      }
      { $g = 7; continue $L; };
    case 19:
      angermon = FALSE;
      await mon_adjust_speed(mon, 1, obj);
      { $g = 7; continue $L; };
    case 20:
      if ((mon.data.mflags1 & 4096) >>> 0 === 0) {
        let btmp = 64 + rn2(32) + Math.imul(rn2(32), !await resist(mon, POTION_CLASS, 0, NOTELL) ? 1 : 0);
        btmp += mon.mblinded | 0;
        mon.mblinded = ((btmp < 127 ? btmp : 127) >>> 0) & 127;
        mon.mcansee = 0;
      }
      { $g = 7; continue $L; };
    case 21:
      if ((mon.data.mflags2 & 2) >>> 0 !== 0 || (mon.data.mflags2 & 256) >>> 0 !== 0 || (mon.data.mflags2 & 4) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
        if (obj.blessed) {
          await pline(S("%s %s in pain!"), await Monnam(mon), mon.data.msound === 0 ? S("writhes") : S("shrieks"));
          if (!(mon.data.msound === 0)) {
            wake_nearto(tx, ty, mon.data.mlevel * 10);
          }
          mon.mhp -= d(2, 6);
          if (mon.mhp < 1) {
            await killed(mon);
          } else if ((mon.data.mflags2 & 4) >>> 0 !== 0 && !((mon.data.mflags2 & 8) >>> 0 !== 0)) {
            await new_were(mon);
          }
        } else if (obj.cursed) {
          angermon = FALSE;
          if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
            await pline(S("%s looks healthier."), await Monnam(mon));
          }
          mon.mhp += d(2, 6);
          if (mon.mhp > mon.mhpmax) {
            mon.mhp = mon.mhpmax;
          }
          if ((mon.data.mflags2 & 4) >>> 0 !== 0 && (mon.data.mflags2 & 8) >>> 0 !== 0 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
            await new_were(mon);
          }
        }
      } else if (mon.data === $sat(G.mons, PM_GREMLIN)) {
        angermon = FALSE;
        await split_mon(mon, null);
      } else if (mon.data === $sat(G.mons, PM_IRON_GOLEM)) {
        if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          await pline(S("%s rusts."), await Monnam(mon));
        }
        mon.mhp -= d(1, 6);
        if (mon.mhp < 1) {
          await killed(mon);
        }
      }
      { $g = 7; continue $L; };
    case 22:
      if (obj.lamplit) {
        await explode_oil(obj, tx, ty);
      }
      { $g = 7; continue $L; };
    case 23:
      if (!(((mon.data.mresists | mon.mextrinsics) & 64) !== 0) && !await resist(mon, POTION_CLASS, 0, NOTELL)) {
        await pline(S("%s %s in pain!"), await Monnam(mon), mon.data.msound === 0 ? S("writhes") : S("shrieks"));
        if (!(mon.data.msound === 0)) {
          wake_nearto(tx, ty, mon.data.mlevel * 10);
        }
        mon.mhp -= d(obj.cursed | 0 ? 2 : 1, obj.blessed | 0 ? 4 : 8);
        if (mon.mhp < 1) {
          if (your_fault) {
            await killed(mon);
          } else {
            await monkilled(mon, S(""), AD_ACID);
          }
        }
      }
      { $g = 7; continue $L; };
    case 24:
      await bhitm(mon, obj);
      { $g = 7; continue $L; };
    case 7:
      if (!(mon.mhp < 1)) {
        if (angermon) {
          await wakeup(mon, TRUE);
        } else {
          mon.msleeping = 0;
        }
      }
    case 5:
    case 3:
      if ((distance === 0 || distance < 3 && rn2(5)) && (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || (G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        await potionbreathe(obj);
      } else if (obj.dknown | 0 && !G.objects[obj.otyp].oc_name_known && !G.objects[obj.otyp].oc_uname && $rd(G.viz_array.a[G.viz_array.o + ty], tx) & 2) {
        await docall(obj);
      }
      if ($rd(P(G.u.ushops)) && obj.unpaid | 0) {
        let shkp = await shop_keeper($rd(in_rooms(G.u.ux, G.u.uy, SHOPBASE)));
        if (!shkp) {
          obj.unpaid = 0;
        } else if (G.context.mon_moving) {
          await subfrombill(obj, shkp);
        } else {
          await stolen_value(obj, G.u.ux, G.u.uy, shkp.mpeaceful << 24 >> 24, FALSE);
        }
      }
      await obfree(obj, null);
    }
    break;
  }
}

export async function potionbreathe(obj: struct_obj | null): Promise<void> {
  let i = 0;
  let ii = 0;
  let isdone = 0;
  let kn = 0;
  let cureblind = FALSE;
  obj.in_use = 1;
  switch (obj.otyp) {
  case 273:
  case 272:
    if (obj.cursed) {
      if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0)) {
        await pline(S("Ulch!  That potion smells terrible!"));
      } else if ((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
        let eyes = body_part(EYE);
        if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
          eyes = await makeplural(eyes);
        }
        await Your(S("%s %s!"), eyes, vtense(eyes, S("sting")));
      }
      break;
    } else {
      i = rn2(A_MAX);
      for (isdone = ii = 0; !isdone && ii < A_MAX; ++ii) {
        if (G.u.acurr.a[i] < G.u.amax.a[i]) {
          ++G.u.acurr.a[i];
          isdone = !obj.blessed ? 1 : 0;
          G.context.botl = 1;
        }
        if (++i >= A_MAX) {
          i = 0;
        }
      }
    }
    break;
  case 290:
    if (G.u.umonnum !== G.u.umonster && G.u.mh < G.u.mhmax) {
      ++G.u.mh, G.context.botl = 1;
    }
    if (G.u.uhp < G.u.uhpmax) {
      ++G.u.uhp, G.context.botl = 1;
    }
    cureblind = TRUE;
  case 283:
    if (G.u.umonnum !== G.u.umonster && G.u.mh < G.u.mhmax) {
      ++G.u.mh, G.context.botl = 1;
    }
    if (G.u.uhp < G.u.uhpmax) {
      ++G.u.uhp, G.context.botl = 1;
    }
    if (!obj.cursed) {
      cureblind = TRUE;
    }
  case 282:
    if (G.u.umonnum !== G.u.umonster && G.u.mh < G.u.mhmax) {
      ++G.u.mh, G.context.botl = 1;
    }
    if (G.u.uhp < G.u.uhpmax) {
      ++G.u.uhp, G.context.botl = 1;
    }
    if (obj.blessed) {
      cureblind = TRUE;
    }
    if (cureblind) {
      await make_blinded(0, !G.u.ucreamed ? 1 : 0);
      await make_deaf(0, TRUE);
    }
    await exercise(A_CON, TRUE);
    break;
  case 293:
    if (!(G.urole.malenum === 332)) {
      if (G.u.umonnum !== G.u.umonster) {
        if (G.u.mh <= 5) {
          G.u.mh = 1;
        } else {
          G.u.mh -= 5;
        }
      } else {
        if (G.u.uhp <= 5) {
          G.u.uhp = 1;
        } else {
          G.u.uhp -= 5;
        }
      }
      G.context.botl = 1;
      await exercise(A_CON, FALSE);
    }
    break;
  case 279:
    await You(S("have a momentary vision."));
    break;
  case 274:
  case 292:
    if (!G.u.uprops[CONFUSION].intrinsic) {
      await You_feel(S("somewhat dizzy."));
    }
    await make_confused(itimeout_incr(G.u.uprops[CONFUSION].intrinsic, rnd(5)), FALSE);
    break;
  case 280:
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked)) {
      ++kn;
      await pline(S("For an instant you %s!"), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S("could see right through yourself") : S("couldn't see yourself"));
    }
    break;
  case 276:
    ++kn;
    if (!G.u.uprops[FREE_ACTION].extrinsic) {
      await pline(S("%s seems to be holding you."), G.c_common_strings.c_Something);
      nomul(-rnd(5));
      G.multi_reason = S("frozen by a potion");
      G.nomovemsg = G.c_common_strings.c_You_can_move_again;
      await exercise(A_DEX, FALSE);
    } else {
      await You(S("stiffen momentarily."));
    }
    break;
  case 289:
    ++kn;
    if (!G.u.uprops[FREE_ACTION].extrinsic && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
      await You_feel(S("rather tired."));
      nomul(-rnd(5));
      G.multi_reason = S("sleeping off a magical draught");
      G.nomovemsg = G.c_common_strings.c_You_can_move_again;
      await exercise(A_DEX, FALSE);
    } else {
      await You(S("yawn."));
    }
    break;
  case 277:
    if (!(G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic)) {
      await Your(S("knees seem more flexible now."));
    }
    incr_itimeout(P(G.u.uprops[FAST], "intrinsic"), rnd(5));
    await exercise(A_DEX, TRUE);
    break;
  case 275:
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.multi < 0 && (unconscious() || is_fainted()))) {
      ++kn;
      await pline(S("It suddenly gets dark."));
    }
    await make_blinded(itimeout_incr(G.u.uprops[BLINDED].intrinsic, rnd(5)), FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.multi < 0 && (unconscious() || is_fainted()))) {
      await Your(S("%s"), G.c_common_strings.c_vision_clears);
    }
    break;
  case 297:
    if (G.u.umonnum === PM_GREMLIN) {
      await split_mon(G.youmonst, null);
    } else if (G.u.ulycn >= LOW_PM) {
      if (obj.blessed | 0 && G.youmonst.data === $sat(G.mons, G.u.ulycn)) {
        await you_unwere(FALSE);
      } else if (obj.cursed | 0 && !(G.u.umonnum !== G.u.umonster)) {
        await you_were();
      }
    }
    break;
  case 295:
  case 291:
    await exercise(A_CON, FALSE);
    break;
  }
  if (obj.dknown) {
    if (kn) {
      await discover_object(obj.otyp, 1, 1);
    } else if (!G.objects[obj.otyp].oc_name_known && !G.objects[obj.otyp].oc_uname) {
      await docall(obj);
    }
  }
}

function mixtype(o1: struct_obj | null, o2: struct_obj | null): number {
  let o1typ = o1.otyp;
  let o2typ = o2.otyp;
  if (o1.oclass === POTION_CLASS && (o2typ === POT_GAIN_LEVEL || o2typ === POT_GAIN_ENERGY || o2typ === POT_HEALING || o2typ === POT_EXTRA_HEALING || o2typ === POT_FULL_HEALING || o2typ === POT_ENLIGHTENMENT || o2typ === POT_FRUIT_JUICE)) {
    o1typ = o2.otyp;
    o2typ = o1.otyp;
  }
  switch (o1typ) {
  case 282:
    if (o2typ === POT_SPEED) {
      return POT_EXTRA_HEALING;
    }
  case 283:
  case 290:
    if (o2typ === POT_GAIN_LEVEL || o2typ === POT_GAIN_ENERGY) {
      return (o1typ === POT_HEALING ? POT_EXTRA_HEALING : o1typ === POT_EXTRA_HEALING ? POT_FULL_HEALING : POT_GAIN_ABILITY) << 16 >> 16;
    }
  case 236:
    switch (o2typ) {
    case 293:
      return POT_FRUIT_JUICE;
    case 279:
    case 275:
    case 274:
      return POT_WATER;
    }
    break;
  case 428:
    if (o2typ === POT_BOOZE) {
      return POT_FRUIT_JUICE;
    }
    break;
  case 284:
  case 288:
    switch (o2typ) {
    case 274:
      return (rn2(3) ? POT_BOOZE : POT_ENLIGHTENMENT) << 16 >> 16;
    case 282:
      return POT_EXTRA_HEALING;
    case 283:
      return POT_FULL_HEALING;
    case 290:
      return POT_GAIN_ABILITY;
    case 294:
      return POT_SEE_INVISIBLE;
    case 292:
      return POT_HALLUCINATION;
    }
    break;
  case 294:
    switch (o2typ) {
    case 293:
      return POT_SICKNESS;
    case 285:
    case 277:
      return POT_BOOZE;
    case 284:
    case 288:
      return POT_SEE_INVISIBLE;
    }
    break;
  case 285:
    switch (o2typ) {
    case 278:
      if (rn2(3)) {
        return POT_GAIN_LEVEL;
      }
      break;
    case 294:
      return POT_BOOZE;
    case 292:
      return POT_CONFUSION;
    }
    break;
  }
  return STRANGE_OBJECT;
}

export async function dodip(): Promise<number> {
  let $g = 0;
  let potion = null;
  let obj = null;
  let singlepotion = null;
  let here = 0;
  let allowall = new Int8Array(2);
  let mixture = 0;
  let qbuf = new Int8Array(128);
  let obuf = new Int8Array(128);
  let shortestname = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      allowall = new Int8Array(2);
      qbuf = new Int8Array(128);
      obuf = new Int8Array(128);
      allowall[0] = ALL_CLASSES;
      allowall[1] = 0;
      if (!(obj = await getobj(P(allowall), S("dip")))) {
        return 0;
      }
      if (await inaccessible_equipment(obj, S("dip"), FALSE)) {
        return 0;
      }
      shortestname = obj.quan !== 1 || obj.oartifact === 26 && !undiscovered_artifact(26) || (obj.otyp === 207 || obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES || obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS) ? S("them") : S("it");
      strcpy(P(obuf), await short_oname(obj, doname, thesimpleoname, QBUFSZ - 79));
      here = $at2(G.level.locations, G.u.ux, G.u.uy).typ & 0xff;
      if (here === FOUNTAIN) {
        sprintf(P(qbuf), S("%s%s into the fountain?"), P(dodip$Dip_), G.flags.verbose ? P(obuf) : shortestname);
        if (await yn_function(P(qbuf), P(G.ynchars), 110) === 121) {
          await dipfountain(obj);
          return 1;
        }
      } else if (is_pool(G.u.ux, G.u.uy)) {
        let pooltype = waterbody_name(G.u.ux, G.u.uy);
        sprintf(P(qbuf), S("%s%s into the %s?"), P(dodip$Dip_), G.flags.verbose ? P(obuf) : shortestname, pooltype);
        if (await yn_function(P(qbuf), P(G.ynchars), 110) === 121) {
          if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
            await floating_above(pooltype);
          } else if (G.u.usteed && !((G.u.usteed.data.mflags1 & 2) >>> 0 !== 0) && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
            await rider_cant_reach();
          } else {
            if (obj.otyp === POT_ACID) {
              obj.in_use = 1;
            }
            if (await water_damage(obj, null, TRUE) !== ER_DESTROYED && obj.in_use | 0) {
              await useup(obj);
            }
          }
          return 1;
        }
      }
      sprintf(P(qbuf), S("dip %s into"), G.flags.verbose ? P(obuf) : shortestname);
      potion = await getobj(P(beverages), P(qbuf));
      if (!potion) {
        return 0;
      }
      if (potion === obj && potion.quan === 1) {
        await pline(S("That is a potion bottle, not a Klein bottle!"));
        return 0;
      }
      potion.in_use = (TRUE) & 1;
      if (potion.otyp === POT_WATER) {
        let useeit = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || obj === G.ublindf && (G.ublindf && G.ublindf.otyp !== 207 && G.ublindf.oartifact !== 26 && !G.u.uroleplay.blind && !G.u.uprops[BLINDED].intrinsic && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 1 : 0) << 24 >> 24;
        let obj_glows = await Yobjnam2(obj, S("glow"));
        if (await H2Opotion_dip(potion, obj, useeit, obj_glows)) {
          { $g = 1; continue $L; }
        }
      } else if (obj.otyp === POT_POLYMORPH || potion.otyp === POT_POLYMORPH) {
        if (obj.otyp === potion.otyp || obj.otyp === WAN_POLYMORPH || obj.otyp === SPE_POLYMORPH || obj === G.uball || obj === G.uskin || obj_resists(obj.otyp === POT_POLYMORPH ? potion : obj, 5, 95)) {
          await pline(S("%s"), G.c_common_strings.c_nothing_happens);
        } else {
          let save_otyp = obj.otyp;
          ++G.u.uconduct.polypiles;
          obj = await poly_obj(obj, STRANGE_OBJECT);
          if (!obj) {
            await discover_object(291, 1, 1);
            return 1;
          } else if (obj.otyp !== save_otyp) {
            await discover_object(291, 1, 1);
            await useup(potion);
            await prinv(null, obj, 0);
            return 1;
          } else {
            await pline(S("Nothing seems to happen."));
            { $g = 1; continue $L; }
          }
        }
        potion.in_use = (FALSE) & 1;
        return 1;
      } else if (obj.oclass === POTION_CLASS && obj.otyp !== potion.otyp) {
        let amt = obj.quan | 0;
        let magic = 0;
        mixture = mixtype(obj, potion);
        magic = (mixture !== STRANGE_OBJECT ? G.objects[mixture].oc_magic | 0 : G.objects[obj.otyp].oc_magic | 0 || G.objects[potion.otyp].oc_magic | 0 ? 1 : 0) << 24 >> 24;
        strcpy(P(qbuf), S("The"));
        if (amt > (magic ? 3 : 7)) {
          if (magic) {
            amt = rnd((amt < 8 ? amt : 8) - (3 - 1)) + (3 - 1);
          } else {
            amt = rnd(amt - (7 - 1)) + (7 - 1);
          }
          if (amt < obj.quan) {
            obj = await splitobj(obj, amt);
            sprintf(P(qbuf), S("%ld of the"), obj.quan);
          }
        }
        await pline(S("%s %s %s with %s%s..."), P(qbuf), await simpleonames(obj), otense(obj, S("mix")), potion.quan > 1 ? S("one of ") : S(""), await thesimpleoname(potion));
        await useup(potion);
        if (obj.cursed | 0 || obj.otyp === POT_ACID || !rn2(10)) {
          obj.in_use = 1;
          await pline(S("%sThey explode!"), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("BOOM!  ") : S(""));
          wake_nearto(G.u.ux, G.u.uy, Math.imul(BOLT_LIM + 1, BOLT_LIM + 1));
          await exercise(A_STR, FALSE);
          if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
            await potionbreathe(obj);
          }
          await useupall(obj);
          await losehp(amt + rnd(9), S("alchemic blast"), KILLED_BY_AN);
          return 1;
        }
        obj.blessed = (obj.cursed = (obj.bknown = 0) & 1) & 1;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
          obj.dknown = 0;
        }
        if (mixture !== STRANGE_OBJECT) {
          obj.otyp = mixture;
        } else {
          let otmp = null;
          switch (obj.oeroded | 0 ? 1 : rnd(8)) {
          case 1:
            obj.otyp = POT_WATER;
            break;
          case 2:
          case 3:
            obj.otyp = POT_SICKNESS;
            break;
          case 4:
            otmp = await mkobj(POTION_CLASS, FALSE);
            obj.otyp = otmp.otyp;
            await obfree(otmp, null);
            break;
          default:
            await useupall(obj);
            await pline_The(S("mixture %sevaporates."), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("glows brightly and ") : S(""));
            return 1;
          }
        }
        obj.oeroded = ((obj.otyp !== POT_WATER ? 1 : 0) >>> 0) & 3;
        if (obj.otyp === POT_WATER && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await pline_The(S("mixture bubbles%s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S(", then clears"));
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline_The(S("mixture looks %s."), hcolor(G.obj_descr[G.objects[obj.otyp].oc_descr_idx].oc_descr));
        }
        await freeinv(obj);
        await hold_another_object(obj, S("You drop %s!"), await doname(obj), null);
        return 1;
      }
      if (potion.otyp === POT_ACID && obj.otyp === CORPSE && obj.corpsenm === PM_LICHEN) {
        await pline(S("%s %s %s around the edges."), await The(await cxname(obj)), otense(obj, S("turn")), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("wrinkled") : potion.oeroded | 0 ? hcolor(G.c_color_names.c_orange) : hcolor(G.c_color_names.c_red));
        potion.in_use = (FALSE) & 1;
        if (potion.dknown | 0 && !G.objects[potion.otyp].oc_name_known && !G.objects[potion.otyp].oc_uname) {
          await docall(potion);
        }
        return 1;
      }
      if (potion.otyp === POT_WATER && obj.otyp === TOWEL) {
        await pline_The(S("towel soaks it up!"));
        { $g = 1; continue $L; }
      }
      if (obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
        if (potion.otyp === POT_SICKNESS && !obj.otrapped) {
          let buf = new Int8Array(256);
          if (potion.quan > 1) {
            sprintf(P(buf), S("One of %s"), await the(await xname(potion)));
          } else {
            strcpy(P(buf), await The(await xname(potion)));
          }
          await pline(S("%s forms a coating on %s."), P(buf), await the(await xname(obj)));
          obj.otrapped = (TRUE) & 1;
          { $g = 1; continue $L; }
        } else if (obj.otrapped | 0 && (potion.otyp === POT_HEALING || potion.otyp === POT_EXTRA_HEALING || potion.otyp === POT_FULL_HEALING)) {
          await pline(S("A coating wears off %s."), await the(await xname(obj)));
          obj.otrapped = 0;
          { $g = 1; continue $L; }
        }
      }
      if (potion.otyp === POT_ACID) {
        if (await erode_obj(obj, null, ERODE_CORRODE, EF_GREASE) !== ER_NOTHING) {
          { $g = 1; continue $L; }
        }
      }
      if (potion.otyp === POT_OIL) {
        let wisx = FALSE;
        if (potion.lamplit) {
          await fire_damage(obj, TRUE, G.u.ux, G.u.uy);
        } else if (potion.cursed) {
          await pline_The(S("potion spills and covers your %s with oil."), await fingers_or_gloves(TRUE));
          make_glib((G.u.uprops[GLIB].intrinsic & TIMEOUT | 0) + d(2, 10));
        } else if (obj.oclass !== WEAPON_CLASS && !(obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE)) {
          { $g = 2; continue $L; }
        } else if (!((G.objects[obj.otyp].oc_material | 0) === IRON) && !((G.objects[obj.otyp].oc_material | 0) === COPPER || (G.objects[obj.otyp].oc_material | 0) === IRON) || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW || !obj.oeroded && !obj.oeroded2) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s %s with an oily sheen."), await Yname2(obj), otense(obj, S("gleam")));
          } else {
            await pline(S("%s %s oily."), await Yname2(obj), otense(obj, S("feel")));
          }
        } else {
          await pline(S("%s %s less %s."), await Yname2(obj), otense(obj, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("are") : S("feel")), obj.oeroded | 0 && obj.oeroded2 | 0 ? S("corroded and rusty") : obj.oeroded | 0 ? S("rusty") : S("corroded"));
          if ((obj.oeroded | 0) > 0) {
            obj.oeroded = (obj.oeroded - 1 >>> 0) & 3;
          }
          if ((obj.oeroded2 | 0) > 0) {
            obj.oeroded2 = (obj.oeroded2 - 1 >>> 0) & 3;
          }
          wisx = TRUE;
        }
        await exercise(A_WIS, wisx);
        if (potion.dknown) {
          await discover_object(potion.otyp, 1, 1);
        }
        await useup(potion);
        return 1;
      }
    case 2: // more_dips
      if ((obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP) && potion.otyp === POT_OIL) {
        if (obj.lamplit | 0 || potion.lamplit | 0) {
          await useup(potion);
          await explode(G.u.ux, G.u.uy, 11, d(6, 6), 0, EXPL_FIERY);
          await exercise(A_WIS, FALSE);
          return 1;
        }
        if (obj.otyp === MAGIC_LAMP && obj.spe === 0) {
          obj.otyp = OIL_LAMP;
          obj.age = 0;
        }
        if (obj.age > 1000) {
          await pline(S("%s %s full."), await Yname2(obj), otense(obj, S("are")));
          potion.in_use = (FALSE) & 1;
        } else {
          await You(S("fill %s with oil."), await yname(obj));
          await check_unpaid(potion);
          obj.age += Math.trunc((!potion.oeroded ? 4 : 3) * potion.age / 2);
          if (obj.age > 1500) {
            obj.age = 1500;
          }
          await useup(potion);
          await exercise(A_WIS, TRUE);
        }
        if (potion.dknown) {
          await discover_object(296, 1, 1);
        }
        obj.spe = 1;
        update_inventory();
        return 1;
      }
      potion.in_use = (FALSE) & 1;
      if ((obj.otyp === UNICORN_HORN || obj.otyp === AMETHYST) && (mixture = mixtype(obj, potion)) !== STRANGE_OBJECT) {
        let oldbuf = new Int8Array(256);
        let newbuf = new Int8Array(256);
        let old_otyp = potion.otyp;
        let old_dknown = FALSE;
        let more_than_one = (potion.quan > 1 ? 1 : 0) << 24 >> 24;
        oldbuf[0] = 0;
        if (potion.dknown) {
          old_dknown = TRUE;
          sprintf(P(oldbuf), S("%s "), hcolor(G.obj_descr[G.objects[potion.otyp].oc_descr_idx].oc_descr));
        }
        if (potion.quan > 1) {
          singlepotion = await splitobj(potion, 1);
        } else {
          singlepotion = potion;
        }
        await costly_alteration(singlepotion, COST_NUTRLZ);
        singlepotion.otyp = mixture;
        singlepotion.blessed = 0;
        if (mixture === POT_WATER) {
          singlepotion.cursed = (singlepotion.oeroded = 0) & 1;
        } else {
          singlepotion.cursed = (obj.cursed) & 1;
        }
        singlepotion.bknown = (FALSE) & 1;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          singlepotion.dknown = (FALSE) & 1;
        } else {
          singlepotion.dknown = ((!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) >>> 0) & 1;
          $wr(P(newbuf), 0, 0);
          if (mixture === POT_WATER && singlepotion.dknown | 0) {
            sprintf(P(newbuf), S("clears"));
          } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            sprintf(P(newbuf), S("turns %s"), hcolor(G.obj_descr[G.objects[mixture].oc_descr_idx].oc_descr));
          }
          if ($rd(P(newbuf))) {
            await pline_The(S("%spotion%s %s."), P(oldbuf), more_than_one ? S(" that you dipped into") : S(""), P(newbuf));
          } else {
            await pline(S("Something happens."));
          }
          if (old_dknown && !G.objects[old_otyp].oc_name_known && !G.objects[old_otyp].oc_uname) {
            let fakeobj = new struct_obj();
            fakeobj.$cp(G.zeroobj);
            fakeobj.dknown = 1;
            fakeobj.otyp = old_otyp;
            fakeobj.oclass = POTION_CLASS;
            await docall(fakeobj);
          }
        }
        await obj_extract_self(singlepotion);
        singlepotion = await hold_another_object(singlepotion, S("You juggle and drop %s!"), await doname(singlepotion), null);
        ;
        update_inventory();
        return 1;
      }
      await pline(S("Interesting..."));
      return 1;
    case 1: // poof
      if (potion.dknown | 0 && !G.objects[potion.otyp].oc_name_known && !G.objects[potion.otyp].oc_uname) {
        await docall(potion);
      }
      await useup(potion);
      return 1;
    }
    break;
  }
}

export async function mongrantswish(monp: Ptr | null): Promise<void> {
  let mon = monp.a[monp.o];
  let mx = mon.mx;
  let my = mon.my;
  let glyph = glyph_at(mx, my);
  await mongone(mon);
  monp.a[monp.o] = null;
  await tmp_at(DISP_ALWAYS, glyph);
  await tmp_at(mx, my);
  await makewish();
  await tmp_at(DISP_END, 0);
}

export async function djinni_from_bottle(obj: struct_obj | null): Promise<void> {
  const mtmp = [null];
  let chance = 0;
  if (!(mtmp[0] = await makemon($sat(G.mons, PM_DJINNI), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
    await pline(S("It turns out to be empty."));
    return;
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await pline(S("In a cloud of smoke, %s emerges!"), await a_monnam(mtmp[0]));
    await pline(S("%s speaks."), await Monnam(mtmp[0]));
  } else {
    await You(S("smell acrid fumes."));
    await pline(S("%s speaks."), G.c_common_strings.c_Something);
  }
  chance = rn2(5);
  if (obj.blessed) {
    chance = chance === 4 ? rnd(4) : 0;
  } else if (obj.cursed) {
    chance = chance === 0 ? rn2(4) : 4;
  }
  switch (chance) {
  case 0:
    await verbalize(S("I am in your debt.  I will grant one wish!"));
    await mongrantswish(P(mtmp, 0));
    break;
  case 1:
    await verbalize(S("Thank you for freeing me!"));
    await tamedog(mtmp[0], null);
    break;
  case 2:
    await verbalize(S("You freed me!"));
    mtmp[0].mpeaceful = (TRUE) & 1;
    set_malign(mtmp[0]);
    break;
  case 3:
    await verbalize(S("It is about time!"));
    if ((mtmp[0].wormno | 0 ? worm_known(mtmp[0]) : $rd(G.viz_array.a[G.viz_array.o + mtmp[0].my], mtmp[0].mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp[0] && mtmp[0].data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp[0].my], mtmp[0].mx) & 1 ? 1 : 0) && ((!mtmp[0].minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp[0].mundetected) || (!((mtmp[0].data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp[0].mx, mtmp[0].my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp[0].data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp[0].data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp[0].data))) {
      await pline(S("%s vanishes."), await Monnam(mtmp[0]));
    }
    await mongone(mtmp[0]);
    break;
  default:
    await verbalize(S("You disturbed me, fool!"));
    mtmp[0].mpeaceful = (FALSE) & 1;
    set_malign(mtmp[0]);
    break;
  }
}

export async function split_mon(mon: struct_monst | null, mtmp: struct_monst | null): Promise<struct_monst | null> {
  let mtmp2 = null;
  let reason = new Int8Array(256);
  reason[0] = 0;
  if (mtmp) {
    sprintf(P(reason), S(" from %s heat"), mtmp === G.youmonst ? G.c_common_strings.c_the_your[1] : s_suffix(await mon_nam(mtmp)));
  }
  if (mon === G.youmonst) {
    mtmp2 = await cloneu();
    if (mtmp2) {
      mtmp2.mhpmax = G.u.mhmax / 2 | 0;
      G.u.mhmax -= mtmp2.mhpmax;
      G.context.botl = 1;
      await You(S("multiply%s!"), P(reason));
    }
  } else {
    mtmp2 = await clone_mon(mon, 0, 0);
    if (mtmp2) {
      mtmp2.mhpmax = mon.mhpmax / 2 | 0;
      mon.mhpmax -= mtmp2.mhpmax;
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
        await pline(S("%s multiplies%s!"), await Monnam(mon), P(reason));
      }
    }
  }
  return mtmp2;
}

export function $init(): void {
  G.notonhead = 0;
  nothing = 0;
  unkn = 0;
  beverages = $ta(Int8Array, 2, [POTION_CLASS]);
  vismsg = $cs("vision seems to %s for a moment but is %s now.", 47);
  eyemsg = $cs("%s momentarily %s.", 19);
  G.bottlenames = [S("bottle"),
S("phial"),
S("flagon"),
S("carafe"),
S("flask"),
S("jar"),
S("vial")];
  dodip$Dip_ = $cs("Dip ", 5);
}
