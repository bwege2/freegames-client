// @ts-nocheck
// NetHack 3.6.7 do_wear.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { retouch_object } from './artifact.ts';
import { acurr, extremeattr, uchangealign } from './attrib.ts';
import { set_bc } from './ball.ts';
import { set_occupation, yn_function } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { newsym, see_monsters, set_mimic_blocking } from './display.ts';
import { canletgo, dropx } from './do.ts';
import { docall, hcolor, hliquid } from './do_name.ts';
import { panic } from './end.ts';
import { surface } from './engrave.ts';
import { nomul, spoteffects, unmul } from './hack.ts';
import { getobj, ggetobj, is_worn, prinv, silly_thing, update_inventory, useup, wearing_armor } from './invent.ts';
import { gulp_blnd_check } from './mhitu.ts';
import { curse, set_bknown } from './mkobj.ts';
import { rescham, restartcham } from './mon.ts';
import { breakarm, can_be_strangled, num_horns, sliparm } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { Tobjnam, an, cloak_simple_name, corpse_xname, doname, gloves_simple_name, helm_simple_name, killer_xname, makeplural, makesingular, obj_is_pname, otense, suit_simple_name, the, thesimpleoname, xname, yname } from './objnam.ts';
import { add_valid_menu_class, encumber_msg, is_worn_by_type, menu_class_present, query_category, query_objlist } from './pickup.ts';
import { There, You, You_cant, You_feel, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, change_sex, float_vs_flight, poly_gender } from './polyself.ts';
import { incr_itimeout, make_glib, make_slimed, self_invis_message, toggle_blindness } from './potion.ts';
import { rn2, rnd } from './rnd.ts';
import { shk_your } from './shk.ts';
import { remove_worn_item } from './steal.ts';
import { drown, float_down, float_up, instapetrify, selftouch } from './trap.ts';
import { weapon_descr } from './weapon.ts';
import { setuqwep, setuswapwep, setuwep, welded } from './wield.ts';
import { racial_exception, setnotworn, setworn, which_armor } from './worn.ts';
import { obj_resists } from './zap.ts';
import { struct_monst, struct_obj } from './structs.ts';
import { $cs, $peq, $rd, $sadd, $sat, $ta, $wr, G, P, S, free, sprintf, strcat, strcmp, strcpy, strncmp, strncpy } from './rt/index.ts';
import { ACID_RES, ALL_FINISHED, ALL_TYPES, ALL_TYPES_SELECTED, AMULET_CLASS, AMULET_OF_CHANGE, AMULET_OF_UNCHANGING, ARMOR_CLASS, ARM_BOOTS, ARM_CLOAK, ARM_GLOVES, ARM_HELM, ARM_SHIELD, ARM_SHIRT, ARM_SUIT, A_CHA, A_CHAOTIC, A_CON, A_CURRENT, A_DEX, A_INT, A_LAWFUL, A_NEUTRAL, A_ORIGINAL, A_STR, A_WIS, BATTLE_AXE, BLINDED, BLINDFOLD, BUCX_TYPES, CONTEXTVERBSZ, CORPSE, CXN_ARTICLE, DETECT_MONSTERS, DISPLACED, DUNCE_CAP, FACE, FALSE, FAST, FINGER, FLYING, FOOD_CLASS, FOOT, FROMOUTSIDE, FUMBLING, GAUNTLETS_OF_DEXTERITY, GLIB, GRAY_DRAGON_SCALES, HALLUC, HALLUC_RES, HAND, HANDED, HEAD, HELM_OF_BRILLIANCE, HELM_OF_OPPOSITE_ALIGNMENT, INTRINSIC, INVIS, INVORDER_SORT, I_SPECIAL, LEATHER, LEFT_RING, LEG, LENSES, LEVITATION, MAGICAL_BREATHING, MEAT_RING, MENU_COMBINATION, MENU_FULL, MENU_TRADITIONAL, MZ_SMALL, NECK, PICK_ANY, PROTECTION, P_SABER, P_SHORT_SWORD, RIGHT_RING, RING_CLASS, RIN_PROTECTION, RIN_STEALTH, SEE_INVIS, SIGNAL_NOMENU, SLEEPY, SLIMED, STEALTH, STONE_RES, STRANGLED, SWIMMING, S_CENTAUR, TELEPAT, TIMEOUT, TOOL_CLASS, TOWEL, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, UNCHANGING, UNPAID_TYPES, USE_INVLET, WEAPON_CLASS, WORN_AMUL, WORN_ARMOR, WORN_BLINDF, WORN_BOOTS, WORN_CLOAK, WORN_GLOVES, WORN_HELMET, WORN_SHIELD, WORN_SHIRT, WORN_TYPES, W_ACCESSORY, W_AMUL, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMOR, W_ARMS, W_ARMU, W_QUIVER, W_RING, W_SWAPWEP, W_TOOL, W_WEAPONS, W_WEP } from './consts.ts';

let see_yourself: any;
let unknown_type: any;
let c_armor: any;
let c_suit: any;
let c_shirt: any;
let c_cloak: any;
let c_gloves: any;
let c_boots: any;
let c_helmet: any;
let c_shield: any;
let c_weapon: any;
let c_sword: any;
let c_axe: any;
let c_that_: any;
let takeoff_order: any;
let initial_don: number;
let clothes: any;
let accessories: any;
let Narmorpieces: number;
let Naccessories: number;
let armoroff$offdelaybuf: any;
let inaccessible_equipment$need_to_take_off_outer_armor: any;

export async function fingers_or_gloves(check_gloves: number): Promise<Ptr | null> {
  return check_gloves && G.uarmg ? gloves_simple_name(G.uarmg) : await makeplural(body_part(FINGER));
}

export async function off_msg(otmp: struct_obj | null): Promise<void> {
  if (G.flags.verbose) {
    await You(S("were wearing %s."), await doname(otmp));
  }
}

async function on_msg(otmp: struct_obj | null): Promise<void> {
  if (G.flags.verbose) {
    let how = new Int8Array(256);
    let otmp_name = await xname(otmp);
    how[0] = 0;
    if (otmp.otyp === TOWEL) {
      sprintf(P(how), S(" around your %s"), body_part(HEAD));
    }
    await You(S("are now wearing %s%s."), obj_is_pname(otmp) ? await the(otmp_name) : await an(otmp_name), P(how));
  }
}

async function toggle_stealth(obj: struct_obj | null, oldprop: number, on: number): Promise<void> {
  if (on ? initial_don : G.context.takeoff.cancelled_don) {
    return;
  }
  if (!oldprop && !G.u.uprops[STEALTH].intrinsic && !G.u.uprops[STEALTH].blocked) {
    if (obj.otyp === RIN_STEALTH) {
      await learnring(obj, TRUE);
    } else {
      await discover_object(obj.otyp, 1, 1);
    }
    if (on) {
      if (!(obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS)) {
        await You(S("move very quietly."));
      } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
        await You(S("float imperceptibly."));
      } else {
        await You(S("walk very quietly."));
      }
    } else {
      await You(S("sure are noisy."));
    }
  }
}

async function toggle_displacement(obj: struct_obj | null, oldprop: number, on: number): Promise<void> {
  if (on ? initial_don : G.context.takeoff.cancelled_don) {
    return;
  }
  if (!oldprop && !G.u.uprops[DISPLACED].intrinsic && !G.u.uprops[DISPLACED].blocked && (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !G.u.uswallow && !((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) || (G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic)))) {
    await discover_object(obj.otyp, 1, 1);
    await You_feel(S("that monsters%s have difficulty pinpointing your location."), on ? S("") : S(" no longer"));
  }
}

export async function Boots_on(): Promise<number> {
  let oldprop = G.u.uprops[G.objects[G.uarmf.otyp].oc_oprop].extrinsic & ~WORN_BOOTS;
  switch (G.uarmf.otyp) {
  case 140:
  case 141:
  case 142:
  case 145:
  case 147:
    break;
  case 144:
    if (G.u.uinwater) {
      await spoteffects(TRUE);
    }
    break;
  case 143:
    if (!oldprop && !(G.u.uprops[FAST].intrinsic & TIMEOUT)) {
      await discover_object(G.uarmf.otyp, 1, 1);
      await You_feel(S("yourself speed up%s."), oldprop || G.u.uprops[FAST].intrinsic ? S(" a bit more") : S(""));
    }
    break;
  case 146:
    await toggle_stealth(G.uarmf, oldprop, TRUE);
    break;
  case 148:
    if (!oldprop && !(G.u.uprops[FUMBLING].intrinsic & ~TIMEOUT)) {
      incr_itimeout(P(G.u.uprops[FUMBLING], "intrinsic"), rnd(20));
    }
    break;
  case 149:
    if (!oldprop && !G.u.uprops[LEVITATION].intrinsic && !(G.u.uprops[LEVITATION].blocked & FROMOUTSIDE)) {
      G.uarmf.known = 1;
      G.context.botl = 1;
      await discover_object(G.uarmf.otyp, 1, 1);
      await float_up();
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
        await spoteffects(FALSE);
      }
    } else {
      float_vs_flight();
    }
    break;
  default:
    await impossible(P(unknown_type), P(c_boots), G.uarmf.otyp);
  }
  if (G.uarmf) {
    G.uarmf.known = 1;
  }
  return 0;
}

export async function Boots_off(): Promise<number> {
  let otmp = G.uarmf;
  let otyp = otmp.otyp;
  let oldprop = G.u.uprops[G.objects[otyp].oc_oprop].extrinsic & ~WORN_BOOTS;
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMF;
  await setworn(null, W_ARMF);
  switch (otyp) {
  case 143:
    if (!(G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic) && !G.context.takeoff.cancelled_don) {
      await discover_object(otyp, 1, 1);
      await You_feel(S("yourself slow down%s."), G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic ? S(" a bit") : S(""));
    }
    break;
  case 144:
    if ((is_pool(G.u.ux, G.u.uy) || is_lava(G.u.ux, G.u.uy)) && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && !((G.youmonst.data.mflags1 & 16) >>> 0 !== 0) && !G.context.takeoff.cancelled_don && !G.iflags.in_lava_effects) {
      await discover_object(otyp, 1, 1);
      await spoteffects(TRUE);
    }
    break;
  case 146:
    await toggle_stealth(otmp, oldprop, FALSE);
    break;
  case 148:
    if (!oldprop && !(G.u.uprops[FUMBLING].intrinsic & ~TIMEOUT)) {
      G.u.uprops[FUMBLING].intrinsic = G.u.uprops[FUMBLING].extrinsic = 0;
    }
    break;
  case 149:
    if (!oldprop && !G.u.uprops[LEVITATION].intrinsic && !(G.u.uprops[LEVITATION].blocked & FROMOUTSIDE) && !G.context.takeoff.cancelled_don) {
      await float_down(0, 0);
      await discover_object(otyp, 1, 1);
    } else {
      float_vs_flight();
    }
    break;
  case 140:
  case 141:
  case 142:
  case 145:
  case 147:
    break;
  default:
    await impossible(P(unknown_type), P(c_boots), otyp);
  }
  G.context.takeoff.cancelled_don = FALSE;
  return 0;
}

async function Cloak_on(): Promise<number> {
  let $t1: any;
  let oldprop = G.u.uprops[G.objects[G.uarmc.otyp].oc_oprop].extrinsic & ~WORN_CLOAK;
  switch (G.uarmc.otyp) {
  case 119:
  case 120:
  case 127:
  case 122:
  case 124:
    break;
  case 125:
    await discover_object(G.uarmc.otyp, 1, 1);
    break;
  case 118:
    await toggle_stealth(G.uarmc, oldprop, TRUE);
    break;
  case 128:
    await toggle_displacement(G.uarmc, oldprop, TRUE);
    break;
  case 117:
    if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await newsym(G.u.ux, G.u.uy);
      await You(S("can %s!"), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S("no longer see through yourself") : P(see_yourself));
    }
    break;
  case 126:
    if (!oldprop && !G.u.uprops[INVIS].intrinsic && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await discover_object(G.uarmc.otyp, 1, 1);
      await newsym(G.u.ux, G.u.uy);
      await pline(S("Suddenly you can%s yourself."), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S(" see through") : S("not see"));
    }
    break;
  case 121:
    await pline(S("%s very tightly."), await Tobjnam(G.uarmc, S("fit")));
    break;
  case 123:
    ($t1 = G.u.uprops[ACID_RES], $t1.extrinsic = $t1.extrinsic | WORN_CLOAK);
    break;
  default:
    await impossible(P(unknown_type), P(c_cloak), G.uarmc.otyp);
  }
  if (G.uarmc) {
    G.uarmc.known = 1;
  }
  return 0;
}

export async function Cloak_off(): Promise<number> {
  let $t1: any;
  let otmp = G.uarmc;
  let otyp = otmp.otyp;
  let oldprop = G.u.uprops[G.objects[otyp].oc_oprop].extrinsic & ~WORN_CLOAK;
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMC;
  await setworn(null, W_ARMC);
  switch (otyp) {
  case 119:
  case 120:
  case 125:
  case 127:
  case 121:
  case 122:
  case 124:
    break;
  case 118:
    await toggle_stealth(otmp, oldprop, FALSE);
    break;
  case 128:
    await toggle_displacement(otmp, oldprop, FALSE);
    break;
  case 117:
    if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await newsym(G.u.ux, G.u.uy);
      await You(S("can %s."), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S("see through yourself") : S("no longer see yourself"));
    }
    break;
  case 126:
    if (!oldprop && !G.u.uprops[INVIS].intrinsic && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await discover_object(126, 1, 1);
      await newsym(G.u.ux, G.u.uy);
      await pline(S("Suddenly you can %s."), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S("no longer see through yourself") : P(see_yourself));
    }
    break;
  case 123:
    ($t1 = G.u.uprops[ACID_RES], $t1.extrinsic = $t1.extrinsic & ~WORN_CLOAK);
    break;
  default:
    await impossible(P(unknown_type), P(c_cloak), otyp);
  }
  return 0;
}

async function Helmet_on(): Promise<number> {
  switch (G.uarmh.otyp) {
  case 74:
  case 78:
  case 77:
  case 71:
  case 73:
  case 72:
  case 81:
    break;
  case 79:
    await adj_abon(G.uarmh, G.uarmh.spe);
    break;
  case 75:
    G.u.abon.a[A_CHA] += G.urole.malenum === 342 ? 1 : -1;
    G.context.botl = 1;
    await discover_object(G.uarmh.otyp, 1, 1);
    break;
  case 80:
    G.uarmh.known = 1;
    await uchangealign(G.u.ualign.type !== A_NEUTRAL ? -G.u.ualign.type : G.uarmh.o_id % 2 ? A_CHAOTIC : A_LAWFUL, 1);
  case 76:
    if (G.uarmh && !G.uarmh.cursed) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("%s for a moment."), await Tobjnam(G.uarmh, S("vibrate")));
      } else {
        await pline(S("%s %s for a moment."), await Tobjnam(G.uarmh, S("glow")), hcolor(G.c_color_names.c_black));
      }
      await curse(G.uarmh);
    }
    G.context.botl = 1;
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await pline(S("My brain hurts!"));
    } else if (G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
      await You_feel(S("%s."), acurr(A_INT) <= G.u.acurr.a[A_INT] + G.u.abon.a[A_INT] + G.u.atemp.a[A_INT] ? S("like sitting in a corner") : S("giddy"));
    } else {
      await discover_object(80, 1, 1);
    }
    break;
  default:
    await impossible(P(unknown_type), P(c_helmet), G.uarmh.otyp);
  }
  if (G.uarmh) {
    G.uarmh.known = 1;
  }
  return 0;
}

export async function Helmet_off(): Promise<number> {
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMH;
  switch (G.uarmh.otyp) {
  case 74:
  case 78:
  case 77:
  case 71:
  case 73:
  case 72:
    break;
  case 76:
    G.context.botl = 1;
    break;
  case 75:
    if (!G.context.takeoff.cancelled_don) {
      G.u.abon.a[A_CHA] += G.urole.malenum === 342 ? -1 : 1;
      G.context.botl = 1;
    }
    break;
  case 81:
    await setworn(null, W_ARMH);
    await see_monsters();
    return 0;
  case 79:
    if (!G.context.takeoff.cancelled_don) {
      await adj_abon(G.uarmh, -G.uarmh.spe);
    }
    break;
  case 80:
    await uchangealign(G.u.ualignbase[A_CURRENT], 2);
    break;
  default:
    await impossible(P(unknown_type), P(c_helmet), G.uarmh.otyp);
  }
  await setworn(null, W_ARMH);
  G.context.takeoff.cancelled_don = FALSE;
  return 0;
}

async function Gloves_on(): Promise<number> {
  let oldprop = G.u.uprops[G.objects[G.uarmg.otyp].oc_oprop].extrinsic & ~WORN_GLOVES;
  switch (G.uarmg.otyp) {
  case 136:
    break;
  case 137:
    if (!oldprop && !(G.u.uprops[FUMBLING].intrinsic & ~TIMEOUT)) {
      incr_itimeout(P(G.u.uprops[FUMBLING], "intrinsic"), rnd(20));
    }
    break;
  case 138:
    await discover_object(G.uarmg.otyp, 1, 1);
    G.context.botl = 1;
    break;
  case 139:
    await adj_abon(G.uarmg, G.uarmg.spe);
    break;
  default:
    await impossible(P(unknown_type), P(c_gloves), G.uarmg.otyp);
  }
  if (G.uarmg) {
    G.uarmg.known = 1;
  }
  return 0;
}

async function wielding_corpse(obj: struct_obj | null, voluntary: number): Promise<void> {
  let kbuf = new Int8Array(256);
  if (!obj || obj.otyp !== CORPSE) {
    return;
  }
  if (obj !== G.uwep && (obj !== G.uswapwep || !G.u.twoweap)) {
    return;
  }
  if (($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await You(S("now wield %s in your bare %s."), await corpse_xname(obj, null, CXN_ARTICLE), await makeplural(body_part(HAND)));
    sprintf(P(kbuf), S("%s gloves while wielding %s"), voluntary ? S("removing") : S("losing"), await killer_xname(obj));
    await instapetrify(P(kbuf));
    await remove_worn_item(obj, FALSE);
  }
}

export async function Gloves_off(): Promise<number> {
  let oldprop = G.u.uprops[G.objects[G.uarmg.otyp].oc_oprop].extrinsic & ~WORN_GLOVES;
  let on_purpose = (!G.context.mon_moving && !G.uarmg.in_use ? 1 : 0) << 24 >> 24;
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMG;
  switch (G.uarmg.otyp) {
  case 136:
    break;
  case 137:
    if (!oldprop && !(G.u.uprops[FUMBLING].intrinsic & ~TIMEOUT)) {
      G.u.uprops[FUMBLING].intrinsic = G.u.uprops[FUMBLING].extrinsic = 0;
    }
    break;
  case 138:
    await discover_object(G.uarmg.otyp, 1, 1);
    G.context.botl = 1;
    break;
  case 139:
    if (!G.context.takeoff.cancelled_don) {
      await adj_abon(G.uarmg, -G.uarmg.spe);
    }
    break;
  default:
    await impossible(P(unknown_type), P(c_gloves), G.uarmg.otyp);
  }
  await setworn(null, W_ARMG);
  G.context.takeoff.cancelled_don = FALSE;
  await encumber_msg();
  if (G.u.uprops[GLIB].intrinsic) {
    make_glib(0);
  }
  if (G.uwep && G.uwep.otyp === CORPSE) {
    await wielding_corpse(G.uwep, on_purpose);
  }
  if (G.u.twoweap && G.uswapwep && G.uswapwep.otyp === CORPSE) {
    await wielding_corpse(G.uswapwep, on_purpose);
  }
  return 0;
}

async function Shield_on(): Promise<number> {
  switch (G.uarms.otyp) {
  case 129:
  case 130:
  case 131:
  case 132:
  case 134:
  case 133:
  case 135:
    break;
  default:
    await impossible(P(unknown_type), P(c_shield), G.uarms.otyp);
  }
  if (G.uarms) {
    G.uarms.known = 1;
  }
  return 0;
}

export async function Shield_off(): Promise<number> {
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMS;
  switch (G.uarms.otyp) {
  case 129:
  case 130:
  case 131:
  case 132:
  case 134:
  case 133:
  case 135:
    break;
  default:
    await impossible(P(unknown_type), P(c_shield), G.uarms.otyp);
  }
  await setworn(null, W_ARMS);
  return 0;
}

async function Shirt_on(): Promise<number> {
  switch (G.uarmu.otyp) {
  case 115:
  case 116:
    break;
  default:
    await impossible(P(unknown_type), P(c_shirt), G.uarmu.otyp);
  }
  if (G.uarmu) {
    G.uarmu.known = 1;
  }
  return 0;
}

export async function Shirt_off(): Promise<number> {
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARMU;
  switch (G.uarmu.otyp) {
  case 115:
  case 116:
    break;
  default:
    await impossible(P(unknown_type), P(c_shirt), G.uarmu.otyp);
  }
  await setworn(null, W_ARMU);
  return 0;
}

function Armor_on(): number {
  if (G.uarm) {
    G.uarm.known = 1;
  }
  return 0;
}

export async function Armor_off(): Promise<number> {
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARM;
  await setworn(null, W_ARM);
  G.context.takeoff.cancelled_don = FALSE;
  return 0;
}

export async function Armor_gone(): Promise<number> {
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_ARM;
  await setnotworn(G.uarm);
  G.context.takeoff.cancelled_don = FALSE;
  return 0;
}

async function Amulet_on(): Promise<void> {
  if (G.uamul === G.uwep) {
    await setuwep(null);
  } else if (G.uamul === G.uswapwep) {
    await setuswapwep(null);
  } else if (G.uamul === G.uquiver) {
    await setuqwep(null);
  }
  switch (G.uamul.otyp) {
  case 178:
  case 179:
  case 182:
  case 185:
  case 186:
  case 187:
    break;
  case 184:
    if (G.u.uprops[SLIMED].intrinsic) {
      await make_slimed(0, null);
    }
    break;
  case 183:
    {
      let orig_sex = poly_gender();
      if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
        break;
      }
      await change_sex();
      if (orig_sex !== poly_gender()) {
        await discover_object(183, 1, 1);
        await You(S("are suddenly very %s!"), G.flags.female ? S("feminine") : S("masculine"));
        G.context.botl = 1;
      } else {
        await You(S("don't feel like yourself."));
      }
      await pline_The(S("amulet disintegrates!"));
      if (orig_sex === poly_gender() && G.uamul.dknown | 0 && !G.objects[AMULET_OF_CHANGE].oc_name_known && !G.objects[AMULET_OF_CHANGE].oc_uname) {
        await docall(G.uamul);
      }
      await useup(G.uamul);
      break;
    }
  case 180:
    if (await can_be_strangled(G.youmonst)) {
      await discover_object(180, 1, 1);
      G.u.uprops[STRANGLED].intrinsic = 6;
      G.context.botl = TRUE;
      await pline(S("It constricts your throat!"));
    }
    break;
  case 181:
    {
      let newnap = rnd(100);
      let oldnap = G.u.uprops[SLEEPY].intrinsic & TIMEOUT;
      if (newnap < oldnap || oldnap === 0) {
        G.u.uprops[SLEEPY].intrinsic = G.u.uprops[SLEEPY].intrinsic & ~TIMEOUT | newnap;
      }
    }
    break;
  case 188:
    break;
  }
}

export async function Amulet_off(): Promise<void> {
  let $t1: any;
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_AMUL;
  switch (G.uamul.otyp) {
  case 178:
    await setworn(null, W_AMUL);
    await see_monsters();
    return;
  case 179:
  case 182:
  case 185:
  case 183:
  case 184:
  case 187:
    break;
  case 186:
    if (G.u.uinwater) {
      await setworn(null, W_AMUL);
      if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) && !((G.youmonst.data.mflags1 & (512 | 1024)) >>> 0 !== 0) && !(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0)) {
        await You(S("suddenly inhale an unhealthy amount of %s!"), hliquid(S("water")));
        await drown();
      }
      return;
    }
    break;
  case 180:
    if (G.u.uprops[STRANGLED].intrinsic) {
      G.u.uprops[STRANGLED].intrinsic = 0;
      G.context.botl = TRUE;
      if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) {
        await Your(S("%s is no longer constricted!"), body_part(NECK));
      } else {
        await You(S("can breathe more easily!"));
      }
    }
    break;
  case 181:
    await setworn(null, W_AMUL);
    if (!G.u.uprops[SLEEPY].extrinsic && !(G.u.uprops[SLEEPY].intrinsic & ~TIMEOUT)) {
      ($t1 = G.u.uprops[SLEEPY], $t1.intrinsic = $t1.intrinsic & ~TIMEOUT);
    }
    return;
  case 188:
    break;
  }
  await setworn(null, W_AMUL);
  return;
}

async function learnring(ring: struct_obj | null, observed: number): Promise<void> {
  let ringtype = ring.otyp;
  if (observed) {
    if (G.objects[ringtype].oc_name_known) {
      ring.dknown = 1;
    } else if (ring.dknown) {
      await discover_object(ringtype, 1, 1);
    }
  }
  if (ring.dknown | 0 && G.objects[ringtype].oc_name_known | 0) {
    if (G.objects[ringtype].oc_charged) {
      ring.known = 1;
    }
    update_inventory();
  }
}

export async function Ring_on(obj: struct_obj | null): Promise<void> {
  let $g = 0;
  let oldprop = 0;
  let old_attrib = 0;
  let which = 0;
  let observable = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      oldprop = G.u.uprops[G.objects[obj.otyp].oc_oprop].extrinsic;
      if (obj === G.uwep) {
        await setuwep(null);
      } else if (obj === G.uswapwep) {
        await setuswapwep(null);
      } else if (obj === G.uquiver) {
        await setuqwep(null);
      }
      if ((oldprop & W_RING) !== W_RING) {
        oldprop = oldprop & ~W_RING;
      }
      switch (obj.otyp) {
      case 171: { $g = 3; continue $L; }
      case 156: { $g = 4; continue $L; }
      case 157: { $g = 5; continue $L; }
      case 161: { $g = 6; continue $L; }
      case 162: { $g = 7; continue $L; }
      case 165: { $g = 8; continue $L; }
      case 166: { $g = 9; continue $L; }
      case 167: { $g = 10; continue $L; }
      case 168: { $g = 11; continue $L; }
      case 163: { $g = 12; continue $L; }
      case 172: { $g = 13; continue $L; }
      case 173: { $g = 14; continue $L; }
      case 174: { $g = 15; continue $L; }
      case 169: { $g = 16; continue $L; }
      case 170: { $g = 17; continue $L; }
      case 159: { $g = 18; continue $L; }
      case 245: { $g = 19; continue $L; }
      case 158: { $g = 20; continue $L; }
      case 164: { $g = 21; continue $L; }
      case 176: { $g = 22; continue $L; }
      case 175: { $g = 23; continue $L; }
      case 160: { $g = 24; continue $L; }
      case 151: { $g = 25; continue $L; }
      case 152: { $g = 26; continue $L; }
      case 150: { $g = 27; continue $L; }
      case 153: { $g = 28; continue $L; }
      case 154: { $g = 29; continue $L; }
      case 177: { $g = 30; continue $L; }
      case 155: { $g = 31; continue $L; }
      default: { $g = 2; continue $L; }
      }
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
      { $g = 2; continue $L; };
    case 20:
      await toggle_stealth(obj, oldprop, TRUE);
      { $g = 2; continue $L; };
    case 21:
      await see_monsters();
      { $g = 2; continue $L; };
    case 22:
      set_mimic_blocking();
      await see_monsters();
      if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !oldprop && !G.u.uprops[SEE_INVIS].intrinsic && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await newsym(G.u.ux, G.u.uy);
        await pline(S("Suddenly you are transparent, but there!"));
        await learnring(obj, TRUE);
      }
      { $g = 2; continue $L; };
    case 23:
      if (!oldprop && !G.u.uprops[INVIS].intrinsic && !G.u.uprops[INVIS].blocked && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await learnring(obj, TRUE);
        await newsym(G.u.ux, G.u.uy);
        await self_invis_message();
      }
      { $g = 2; continue $L; };
    case 24:
      if (!oldprop && !G.u.uprops[LEVITATION].intrinsic && !(G.u.uprops[LEVITATION].blocked & FROMOUTSIDE)) {
        await float_up();
        await learnring(obj, TRUE);
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          await spoteffects(FALSE);
        }
      } else {
        float_vs_flight();
      }
      { $g = 2; continue $L; };
    case 25:
      which = A_STR;
      { $g = 1; continue $L; }
    case 26:
      which = A_CON;
      { $g = 1; continue $L; }
    case 27:
      which = A_CHA;
    case 1: // adjust_attrib
      old_attrib = acurr(which);
      G.u.abon.a[which] += obj.spe;
      observable = (old_attrib !== acurr(which) ? 1 : 0) << 24 >> 24;
      if (observable || !extremeattr(which)) {
        await learnring(obj, observable);
      }
      G.context.botl = 1;
      { $g = 2; continue $L; };
    case 28:
      G.u.uhitinc = G.u.uhitinc + obj.spe << 24 >> 24;
      { $g = 2; continue $L; };
    case 29:
      G.u.udaminc = G.u.udaminc + obj.spe << 24 >> 24;
      { $g = 2; continue $L; };
    case 30:
      await rescham();
      { $g = 2; continue $L; };
    case 31:
      observable = (obj.spe !== 0 ? 1 : 0) << 24 >> 24;
      await learnring(obj, observable);
      if (obj.spe) {
        find_ac();
      }
      { $g = 2; continue $L; };
    case 2:
    }
    break;
  }
}

async function Ring_off_or_gone(obj: struct_obj | null, gone: number): Promise<void> {
  let $g = 0;
  let mask = 0;
  let old_attrib = 0;
  let which = 0;
  let observable = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mask = obj.owornmask & W_RING;
      G.context.takeoff.mask = G.context.takeoff.mask & ~mask;
      if (!(G.u.uprops[G.objects[obj.otyp].oc_oprop].extrinsic & mask)) {
        await impossible(S("Strange... I didn't know you had that ring."));
      }
      if (gone) {
        await setnotworn(obj);
      } else {
        await setworn(null, obj.owornmask);
      }
      switch (obj.otyp) {
      case 171: { $g = 3; continue $L; }
      case 156: { $g = 4; continue $L; }
      case 157: { $g = 5; continue $L; }
      case 161: { $g = 6; continue $L; }
      case 162: { $g = 7; continue $L; }
      case 165: { $g = 8; continue $L; }
      case 166: { $g = 9; continue $L; }
      case 167: { $g = 10; continue $L; }
      case 168: { $g = 11; continue $L; }
      case 163: { $g = 12; continue $L; }
      case 172: { $g = 13; continue $L; }
      case 173: { $g = 14; continue $L; }
      case 174: { $g = 15; continue $L; }
      case 169: { $g = 16; continue $L; }
      case 170: { $g = 17; continue $L; }
      case 159: { $g = 18; continue $L; }
      case 245: { $g = 19; continue $L; }
      case 158: { $g = 20; continue $L; }
      case 164: { $g = 21; continue $L; }
      case 176: { $g = 22; continue $L; }
      case 175: { $g = 23; continue $L; }
      case 160: { $g = 24; continue $L; }
      case 151: { $g = 25; continue $L; }
      case 152: { $g = 26; continue $L; }
      case 150: { $g = 27; continue $L; }
      case 153: { $g = 28; continue $L; }
      case 154: { $g = 29; continue $L; }
      case 155: { $g = 30; continue $L; }
      case 177: { $g = 31; continue $L; }
      default: { $g = 2; continue $L; }
      }
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
      { $g = 2; continue $L; };
    case 20:
      await toggle_stealth(obj, G.u.uprops[STEALTH].extrinsic & ~mask, FALSE);
      { $g = 2; continue $L; };
    case 21:
      await see_monsters();
      { $g = 2; continue $L; };
    case 22:
      if (!(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
        set_mimic_blocking();
        await see_monsters();
      }
      if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await newsym(G.u.ux, G.u.uy);
        await pline(S("Suddenly you cannot see yourself."));
        await learnring(obj, TRUE);
      }
      { $g = 2; continue $L; };
    case 23:
      if (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) && !G.u.uprops[INVIS].blocked && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await newsym(G.u.ux, G.u.uy);
        await Your(S("body seems to unfade%s."), G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic ? S(" completely") : S(".."));
        await learnring(obj, TRUE);
      }
      { $g = 2; continue $L; };
    case 24:
      if (!(G.u.uprops[LEVITATION].blocked & FROMOUTSIDE)) {
        await float_down(0, 0);
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
          await learnring(obj, TRUE);
        }
      } else {
        float_vs_flight();
      }
      { $g = 2; continue $L; };
    case 25:
      which = A_STR;
      { $g = 1; continue $L; }
    case 26:
      which = A_CON;
      { $g = 1; continue $L; }
    case 27:
      which = A_CHA;
    case 1: // adjust_attrib
      old_attrib = acurr(which);
      G.u.abon.a[which] -= obj.spe;
      observable = (old_attrib !== acurr(which) ? 1 : 0) << 24 >> 24;
      if (observable || !extremeattr(which)) {
        await learnring(obj, observable);
      }
      G.context.botl = 1;
      { $g = 2; continue $L; };
    case 28:
      G.u.uhitinc = G.u.uhitinc - obj.spe << 24 >> 24;
      { $g = 2; continue $L; };
    case 29:
      G.u.udaminc = G.u.udaminc - obj.spe << 24 >> 24;
      { $g = 2; continue $L; };
    case 30:
      observable = (obj.spe !== 0 ? 1 : 0) << 24 >> 24;
      await learnring(obj, observable);
      if (obj.spe) {
        find_ac();
      }
      { $g = 2; continue $L; };
    case 31:
      await restartcham();
      { $g = 2; continue $L; };
    case 2:
    }
    break;
  }
}

export async function Ring_off(obj: struct_obj | null): Promise<void> {
  await Ring_off_or_gone(obj, FALSE);
}

export async function Ring_gone(obj: struct_obj | null): Promise<void> {
  await Ring_off_or_gone(obj, TRUE);
}

export async function Blindf_on(otmp: struct_obj | null): Promise<void> {
  let already_blind = ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 1 : 0) << 24 >> 24;
  let changed = FALSE;
  if (otmp.owornmask & W_WEAPONS) {
    await remove_worn_item(otmp, FALSE);
  }
  await setworn(otmp, W_TOOL);
  await on_msg(otmp);
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !already_blind) {
    changed = TRUE;
    if (G.flags.verbose) {
      await You_cant(S("see any more."));
    }
    if (!!G.uball) {
      await set_bc(0);
    }
  } else if (already_blind && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    changed = TRUE;
    if (G.u.uroleplay.blind) {
      await pline(S("For the first time in your life, you can see!"));
      G.u.uroleplay.blind = FALSE;
    } else {
      await You(S("can see!"));
    }
  }
  if (changed) {
    await toggle_blindness();
  }
}

export async function Blindf_off(otmp: struct_obj | null): Promise<void> {
  let was_blind = ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 1 : 0) << 24 >> 24;
  let changed = FALSE;
  if (!otmp) {
    await impossible(S("Blindf_off without otmp"));
    return;
  }
  G.context.takeoff.mask = G.context.takeoff.mask & ~W_TOOL;
  await setworn(null, otmp.owornmask);
  await off_msg(otmp);
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    if (was_blind) {
      if (otmp.otyp !== LENSES) {
        await You(S("still cannot see."));
      }
    } else {
      changed = TRUE;
      await You_cant(S("see anything now!"));
      if (!!G.uball) {
        await set_bc(0);
      }
    }
  } else if (was_blind) {
    if (!await gulp_blnd_check()) {
      changed = TRUE;
      await You(S("can see again."));
    }
  }
  if (changed) {
    await toggle_blindness();
  }
}

export async function set_wear(obj: struct_obj | null): Promise<void> {
  initial_don = (!obj ? 1 : 0) << 24 >> 24;
  if (!obj ? !!G.ublindf ? 1 : 0 : obj === G.ublindf ? 1 : 0) {
    await Blindf_on(G.ublindf);
  }
  if (!obj ? !!G.uright ? 1 : 0 : obj === G.uright ? 1 : 0) {
    await Ring_on(G.uright);
  }
  if (!obj ? !!G.uleft ? 1 : 0 : obj === G.uleft ? 1 : 0) {
    await Ring_on(G.uleft);
  }
  if (!obj ? !!G.uamul ? 1 : 0 : obj === G.uamul ? 1 : 0) {
    await Amulet_on();
  }
  if (!obj ? !!G.uarmu ? 1 : 0 : obj === G.uarmu ? 1 : 0) {
    await Shirt_on();
  }
  if (!obj ? !!G.uarm ? 1 : 0 : obj === G.uarm ? 1 : 0) {
    Armor_on();
  }
  if (!obj ? !!G.uarmc ? 1 : 0 : obj === G.uarmc ? 1 : 0) {
    await Cloak_on();
  }
  if (!obj ? !!G.uarmf ? 1 : 0 : obj === G.uarmf ? 1 : 0) {
    await Boots_on();
  }
  if (!obj ? !!G.uarmg ? 1 : 0 : obj === G.uarmg ? 1 : 0) {
    await Gloves_on();
  }
  if (!obj ? !!G.uarmh ? 1 : 0 : obj === G.uarmh ? 1 : 0) {
    await Helmet_on();
  }
  if (!obj ? !!G.uarms ? 1 : 0 : obj === G.uarms ? 1 : 0) {
    await Shield_on();
  }
  initial_don = FALSE;
}

export function donning(otmp: struct_obj | null): number {
  let result = FALSE;
  if (doffing(otmp)) {
    result = TRUE;
  } else if (otmp === G.uarm) {
    result = (G.afternmv === Armor_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmu) {
    result = (G.afternmv === Shirt_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmc) {
    result = (G.afternmv === Cloak_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmf) {
    result = (G.afternmv === Boots_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmh) {
    result = (G.afternmv === Helmet_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmg) {
    result = (G.afternmv === Gloves_on ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarms) {
    result = (G.afternmv === Shield_on ? 1 : 0) << 24 >> 24;
  }
  return result;
}

export function doffing(otmp: struct_obj | null): number {
  let what = G.context.takeoff.what;
  let result = FALSE;
  if (otmp === G.uarm) {
    result = (G.afternmv === Armor_off || what === WORN_ARMOR ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmu) {
    result = (G.afternmv === Shirt_off || what === WORN_SHIRT ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmc) {
    result = (G.afternmv === Cloak_off || what === WORN_CLOAK ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmf) {
    result = (G.afternmv === Boots_off || what === WORN_BOOTS ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmh) {
    result = (G.afternmv === Helmet_off || what === WORN_HELMET ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarmg) {
    result = (G.afternmv === Gloves_off || what === WORN_GLOVES ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uarms) {
    result = (G.afternmv === Shield_off || what === WORN_SHIELD ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uamul) {
    result = (what === WORN_AMUL ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uleft) {
    result = (what === LEFT_RING ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uright) {
    result = (what === RIGHT_RING ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.ublindf) {
    result = (what === WORN_BLINDF ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uwep) {
    result = (what === W_WEP ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uswapwep) {
    result = (what === W_SWAPWEP ? 1 : 0) << 24 >> 24;
  } else if (otmp === G.uquiver) {
    result = (what === W_QUIVER ? 1 : 0) << 24 >> 24;
  }
  return result;
}

export function cancel_doff(obj: struct_obj | null, slotmask: number): void {
  if (!(G.context.takeoff.mask & I_SPECIAL) && donning(obj)) {
    cancel_don();
  }
  G.context.takeoff.mask = G.context.takeoff.mask & ~slotmask;
}

export function cancel_don(): void {
  G.context.takeoff.cancelled_don = (G.afternmv === Boots_on || G.afternmv === Helmet_on || G.afternmv === Gloves_on || G.afternmv === Armor_on ? 1 : 0) << 24 >> 24;
  G.afternmv = null;
  G.nomovemsg = null;
  G.multi = 0;
  G.context.takeoff.delay = 0;
  G.context.takeoff.what = 0;
}

export async function stop_donning(stolenobj: struct_obj | null): Promise<number> {
  let buf = new Int8Array(256);
  let otmp = null;
  let putting_on = 0;
  let result = 0;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.owornmask & W_ARMOR && donning(otmp)) {
      break;
    }
  }
  if (!otmp) {
    return 0;
  }
  putting_on = (!doffing(otmp) ? 1 : 0) << 24 >> 24;
  cancel_don();
  G.afternmv = null;
  if (putting_on || otmp !== stolenobj) {
    sprintf(P(buf), S("You stop %s %s."), putting_on ? S("putting on") : S("taking off"), await thesimpleoname(otmp));
  } else {
    buf[0] = 0;
    result = -G.multi;
  }
  await unmul(P(buf));
  if (putting_on) {
    await remove_worn_item(otmp, FALSE);
  }
  return result;
}

function count_worn_stuff(which: Ptr | null, accessorizing: number): void {
  let otmp = null;
  Narmorpieces = Naccessories = 0;
  otmp = null;
  do {
    if (G.uarmh) {
      ++Narmorpieces;
      otmp = G.uarmh;
    }
  } while (0);
  do {
    if (G.uarms) {
      ++Narmorpieces;
      otmp = G.uarms;
    }
  } while (0);
  do {
    if (G.uarmg) {
      ++Narmorpieces;
      otmp = G.uarmg;
    }
  } while (0);
  do {
    if (G.uarmf) {
      ++Narmorpieces;
      otmp = G.uarmf;
    }
  } while (0);
  if (G.uarmc) {
    do {
      if (G.uarmc) {
        ++Narmorpieces;
        otmp = G.uarmc;
      }
    } while (0);
  } else if (G.uarm) {
    do {
      if (G.uarm) {
        ++Narmorpieces;
        otmp = G.uarm;
      }
    } while (0);
  } else if (G.uarmu) {
    do {
      if (G.uarmu) {
        ++Narmorpieces;
        otmp = G.uarmu;
      }
    } while (0);
  }
  if (!accessorizing) {
    which.a[which.o] = otmp;
  }
  otmp = null;
  do {
    if (G.uleft) {
      ++Naccessories;
      otmp = G.uleft;
    }
  } while (0);
  do {
    if (G.uright) {
      ++Naccessories;
      otmp = G.uright;
    }
  } while (0);
  do {
    if (G.uamul) {
      ++Naccessories;
      otmp = G.uamul;
    }
  } while (0);
  do {
    if (G.ublindf) {
      ++Naccessories;
      otmp = G.ublindf;
    }
  } while (0);
  if (accessorizing) {
    which.a[which.o] = otmp;
  }
}

async function armor_or_accessory_off(obj: struct_obj | null): Promise<number> {
  if (!(obj.owornmask & (W_ARMOR | W_ACCESSORY))) {
    await You(S("are not wearing that."));
    return 0;
  }
  if (obj === G.uskin || obj === G.uarm && G.uarmc || obj === G.uarmu && (G.uarmc || G.uarm)) {
    let why = new Int8Array(128);
    let what = new Int8Array(128);
    why[0] = what[0] = 0;
    if (obj !== G.uskin) {
      if (G.uarmc) {
        strcat(P(what), cloak_simple_name(G.uarmc));
      }
      if (obj === G.uarmu && G.uarm) {
        if (G.uarmc) {
          strcat(P(what), S(" and "));
        }
        strcat(P(what), suit_simple_name(G.uarm));
      }
      sprintf(P(why), S(" without taking off your %s first"), P(what));
    } else {
      strcpy(P(why), S("; it's embedded"));
    }
    await You_cant(S("take that off%s."), P(why));
    return 0;
  }
  reset_remarm();
  await select_off(obj);
  if (!G.context.takeoff.mask) {
    return 0;
  }
  reset_remarm();
  if (obj.owornmask & W_ARMOR) {
    await armoroff(obj);
  } else if (obj === G.uright || obj === G.uleft) {
    await off_msg(obj);
    await Ring_off(obj);
  } else if (obj === G.uamul) {
    await Amulet_off();
    await off_msg(obj);
  } else if (obj === G.ublindf) {
    await Blindf_off(obj);
  } else {
    await impossible(S("removing strange accessory?"));
    if (obj.owornmask) {
      await remove_worn_item(obj, FALSE);
    }
  }
  return 1;
}

export async function dotakeoff(): Promise<number> {
  const otmp = [null];
  otmp[0] = null;
  count_worn_stuff(P(otmp, 0), FALSE);
  if (!Narmorpieces && !Naccessories) {
    if (G.uskin) {
      await pline_The(S("%s merged with your skin!"), G.uskin.otyp >= GRAY_DRAGON_SCALES ? S("dragon scales are") : S("dragon scale mail is"));
    } else {
      await pline(S("Not wearing any armor or accessories."));
    }
    return 0;
  }
  if (Narmorpieces !== 1 || (G.flags.paranoia_bits & 64) >>> 0 !== 0) {
    otmp[0] = await getobj(P(clothes), S("take off"));
  }
  if (!otmp[0]) {
    return 0;
  }
  return await armor_or_accessory_off(otmp[0]);
}

export async function doremring(): Promise<number> {
  const otmp = [null];
  otmp[0] = null;
  count_worn_stuff(P(otmp, 0), TRUE);
  if (!Naccessories && !Narmorpieces) {
    await pline(S("Not wearing any accessories or armor."));
    return 0;
  }
  if (Naccessories !== 1 || (G.flags.paranoia_bits & 64) >>> 0 !== 0) {
    otmp[0] = await getobj(P(accessories), S("remove"));
  }
  if (!otmp[0]) {
    return 0;
  }
  return await armor_or_accessory_off(otmp[0]);
}

export async function cursed(otmp: struct_obj | null): Promise<number> {
  if (!otmp) {
    await impossible(S("cursed without otmp"));
    return 0;
  }
  if (otmp === G.uwep ? welded(otmp) : otmp.cursed | 0) {
    let use_plural = (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_BOOTS || otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_GLOVES || otmp.otyp === LENSES || otmp.quan > 1 ? 1 : 0) << 24 >> 24;
    if (G.u.uprops[GLIB].intrinsic && otmp.bknown | 0 && (G.uarmg ? otmp === G.uwep ? 1 : 0 : (otmp.owornmask & (W_WEP | W_RING)) !== 0 ? 1 : 0)) {
      await pline(S("Despite your slippery %s, you can't."), await fingers_or_gloves(TRUE));
    } else {
      await You(S("can't.  %s cursed."), use_plural ? S("They are") : S("It is"));
    }
    set_bknown(otmp, 1);
    return 1;
  }
  return 0;
}

export async function armoroff(otmp: struct_obj | null): Promise<number> {
  let delay = -G.objects[otmp.otyp].oc_delay;
  let what = null;
  if (await cursed(otmp)) {
    return 0;
  }
  if (delay) {
    nomul(delay);
    G.multi_reason = S("disrobing");
    if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_HELM) {
      what = helm_simple_name(otmp);
      G.afternmv = Helmet_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_GLOVES) {
      what = gloves_simple_name(otmp);
      G.afternmv = Gloves_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_BOOTS) {
      what = P(c_boots);
      G.afternmv = Boots_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SUIT) {
      what = suit_simple_name(otmp);
      G.afternmv = Armor_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_CLOAK) {
      what = cloak_simple_name(otmp);
      G.afternmv = Cloak_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIELD) {
      what = P(c_shield);
      G.afternmv = Shield_off;
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIRT) {
      what = P(c_shirt);
      G.afternmv = Shirt_off;
    } else {
      await impossible(S("Taking off unknown armor (%d: %d), delay %d"), otmp.otyp, G.objects[otmp.otyp].oc_subtyp, delay);
    }
    if (what) {
      sprintf(P(armoroff$offdelaybuf), S("You finish taking off your %s."), what);
      G.nomovemsg = P(armoroff$offdelaybuf);
    }
  } else {
    if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_CLOAK) {
      await Cloak_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIELD) {
      await Shield_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_HELM) {
      await Helmet_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_GLOVES) {
      await Gloves_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_BOOTS) {
      await Boots_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIRT) {
      await Shirt_off();
    } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SUIT) {
      await Armor_off();
    } else {
      await impossible(S("Taking off unknown armor (%d: %d), no delay"), otmp.otyp, G.objects[otmp.otyp].oc_subtyp);
    }
    await off_msg(otmp);
  }
  G.context.takeoff.mask = G.context.takeoff.what = 0;
  return 1;
}

async function already_wearing(cc: Ptr | null): Promise<void> {
  await You(S("are already wearing %s%c"), cc, $peq(cc, P(c_that_)) ? 33 : 46);
}

async function already_wearing2(cc1: Ptr | null, cc2: Ptr | null): Promise<void> {
  await You_cant(S("wear %s because you're wearing %s there already."), cc1, cc2);
}

export async function canwearobj(otmp: struct_obj | null, mask: Ptr | null, noisy: number): Promise<number> {
  let err = 0;
  let which = null;
  if (G.youmonst.data.msize < 1 || (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    if (noisy) {
      await You(S("can't wear any armor in your current form."));
    }
    return 0;
  }
  which = otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_CLOAK ? P(c_cloak) : otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIRT ? P(c_shirt) : otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SUIT ? P(c_suit) : null;
  if (which && (breakarm(G.youmonst.data) || sliparm(G.youmonst.data)) && (!$peq(which, P(c_cloak)) || G.youmonst.data.msize !== MZ_SMALL) && racial_exception(G.youmonst, otmp) < 1) {
    if (noisy) {
      await pline_The(S("%s will not fit on your body."), which);
    }
    return 0;
  } else if (otmp.owornmask & W_ARMOR) {
    if (noisy) {
      await already_wearing(P(c_that_));
    }
    return 0;
  }
  if (welded(G.uwep) && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) && (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SUIT || otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIRT)) {
    if (noisy) {
      await You(S("cannot do that while holding your %s."), G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? P(c_sword) : P(c_weapon));
    }
    return 0;
  }
  if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_HELM) {
    if (G.uarmh) {
      if (noisy) {
        await already_wearing(await an(helm_simple_name(G.uarmh)));
      }
      ++err;
    } else if (G.u.umonnum !== G.u.umonster && await num_horns(G.youmonst.data) > 0 && !((G.objects[otmp.otyp].oc_material | 0) <= LEATHER || otmp.otyp === 60)) {
      if (noisy) {
        await pline_The(S("%s won't fit over your horn%s."), helm_simple_name(otmp), await num_horns(G.youmonst.data) === 1 ? S("") : S("s"));
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMH;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIELD) {
    if (G.uarms) {
      if (noisy) {
        await already_wearing(await an(P(c_shield)));
      }
      ++err;
    } else if (G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
      if (noisy) {
        await You(S("cannot wear a shield while wielding a two-handed %s."), G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? P(c_sword) : G.uwep.otyp === BATTLE_AXE ? P(c_axe) : P(c_weapon));
      }
      ++err;
    } else if (G.u.twoweap) {
      if (noisy) {
        await You(S("cannot wear a shield while wielding two weapons."));
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMS;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_BOOTS) {
    if (G.uarmf) {
      if (noisy) {
        await already_wearing(P(c_boots));
      }
      ++err;
    } else if (G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags1 & 524288) >>> 0 !== 0) {
      if (noisy) {
        await You(S("have no feet..."));
      }
      ++err;
    } else if (G.u.umonnum !== G.u.umonster && G.youmonst.data.mlet === S_CENTAUR) {
      if (noisy) {
        await pline(S("You have too many hooves to wear %s."), P(c_boots));
      }
      ++err;
    } else if (G.u.utrap && (G.u.utraptype === TT_BEARTRAP || G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_LAVA || G.u.utraptype === TT_BURIEDBALL)) {
      if (G.u.utraptype === TT_BEARTRAP) {
        if (noisy) {
          await Your(S("%s is trapped!"), body_part(FOOT));
        }
      } else if (G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_LAVA) {
        if (noisy) {
          await Your(S("%s are stuck in the %s!"), await makeplural(body_part(FOOT)), surface(G.u.ux, G.u.uy));
        }
      } else {
        if (noisy) {
          await Your(S("%s is attached to the buried ball!"), body_part(LEG));
        }
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMF;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_GLOVES) {
    if (G.uarmg) {
      if (noisy) {
        await already_wearing(P(c_gloves));
      }
      ++err;
    } else if (welded(G.uwep)) {
      if (noisy) {
        await You(S("cannot wear gloves over your %s."), G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? P(c_sword) : P(c_weapon));
      }
      ++err;
    } else if (G.u.uprops[GLIB].intrinsic) {
      if (noisy) {
        await Your(S("%s are too slippery to pull on %s."), await fingers_or_gloves(FALSE), gloves_simple_name(otmp));
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMG;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIRT) {
    if (G.uarm || G.uarmc || G.uarmu) {
      if (G.uarmu) {
        if (noisy) {
          await already_wearing(await an(P(c_shirt)));
        }
      } else {
        if (noisy) {
          await You_cant(S("wear that over your %s."), G.uarm && !G.uarmc ? P(c_armor) : cloak_simple_name(G.uarmc));
        }
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMU;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_CLOAK) {
    if (G.uarmc) {
      if (noisy) {
        await already_wearing(await an(cloak_simple_name(G.uarmc)));
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARMC;
    }
  } else if (otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SUIT) {
    if (G.uarmc) {
      if (noisy) {
        await You(S("cannot wear armor over a %s."), cloak_simple_name(G.uarmc));
      }
      ++err;
    } else if (G.uarm) {
      if (noisy) {
        await already_wearing(S("some armor"));
      }
      ++err;
    } else {
      mask.a[mask.o] = W_ARM;
    }
  } else {
    if (noisy) {
      await silly_thing(S("wear"), otmp);
    }
    ++err;
  }
  return !err ? 1 : 0;
}

async function accessory_or_armor_on(obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  const mask = new Float64Array(1);
  mask[0] = 0;
  let armor = 0;
  let ring = 0;
  let eyewear = 0;
  if (obj[0].owornmask & (W_ACCESSORY | W_ARMOR)) {
    await already_wearing(P(c_that_));
    return 0;
  }
  armor = (obj[0].oclass === ARMOR_CLASS ? 1 : 0) << 24 >> 24;
  ring = (obj[0].oclass === RING_CLASS || obj[0].otyp === MEAT_RING ? 1 : 0) << 24 >> 24;
  eyewear = (obj[0].otyp === BLINDFOLD || obj[0].otyp === TOWEL || obj[0].otyp === LENSES ? 1 : 0) << 24 >> 24;
  if (armor) {
    if (!await canwearobj(obj[0], P(mask, 0), TRUE)) {
      return 0;
    }
    if (obj[0].otyp === HELM_OF_OPPOSITE_ALIGNMENT && G.dungeon_topology.d_qstart_level.dnum === G.u.uz.dnum) {
      if (G.u.ualignbase[A_CURRENT] === G.u.ualignbase[A_ORIGINAL]) {
        await You(S("narrowly avoid losing all chance at your goal."));
      } else {
        await You(S("are suddenly overcome with shame and change your mind."));
      }
      G.u.ublessed = 0;
      await discover_object(obj[0].otyp, 1, 1);
      G.context.botl = 1;
      return 1;
    }
  } else {
    if (ring) {
      let answer = 0;
      let qbuf = new Int8Array(128);
      let res = 0;
      if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576) {
        await You(S("cannot make the ring stick to your body."));
        return 0;
      }
      if (G.uleft && G.uright) {
        await There(S("are no more %s%s to fill."), (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 ? S("ring-") : S(""), await fingers_or_gloves(FALSE));
        return 0;
      }
      if (G.uleft) {
        mask[0] = RIGHT_RING;
      } else if (G.uright) {
        mask[0] = LEFT_RING;
      } else {
        do {
          sprintf(P(qbuf), S("Which %s%s, Right or Left?"), (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 ? S("ring-") : S(""), body_part(FINGER));
          answer = await yn_function(P(qbuf), S("rl"), 0);
          switch (answer) {
          case 0:
            return 0;
          case 108:
          case 76:
            mask[0] = LEFT_RING;
            break;
          case 114:
          case 82:
            mask[0] = RIGHT_RING;
            break;
          }
        } while (!mask[0]);
      }
      if (G.uarmg && G.u.uprops[GLIB].intrinsic) {
        await Your(S("%s are too slippery to remove, so you cannot put on the ring."), gloves_simple_name(G.uarmg));
        return 1;
      }
      if (G.uarmg && G.uarmg.cursed | 0) {
        res = !G.uarmg.bknown ? 1 : 0;
        set_bknown(G.uarmg, 1);
        await You(S("cannot remove your %s to put on the ring."), P(c_gloves));
        return res;
      }
      if (G.uwep) {
        res = !G.uwep.bknown ? 1 : 0;
        if ((mask[0] === RIGHT_RING || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) && welded(G.uwep)) {
          let hand = body_part(HAND);
          if ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) {
            hand = await makeplural(hand);
          }
          await You(S("cannot free your weapon %s to put on the ring."), hand);
          return res;
        }
      }
    } else if (obj[0].oclass === AMULET_CLASS) {
      if (G.uamul) {
        await already_wearing(S("an amulet"));
        return 0;
      }
    } else if (eyewear) {
      if (G.ublindf) {
        if (G.ublindf.otyp === TOWEL) {
          await Your(S("%s is already covered by a towel."), body_part(FACE));
        } else if (G.ublindf.otyp === BLINDFOLD) {
          if (obj[0].otyp === LENSES) {
            await already_wearing2(S("lenses"), S("a blindfold"));
          } else {
            await already_wearing(S("a blindfold"));
          }
        } else if (G.ublindf.otyp === LENSES) {
          if (obj[0].otyp === BLINDFOLD) {
            await already_wearing2(S("a blindfold"), S("some lenses"));
          } else {
            await already_wearing(S("some lenses"));
          }
        } else {
          await already_wearing(G.c_common_strings.c_something);
        }
        return 0;
      }
    } else {
      await You_cant(S("wear that!"));
      return 0;
    }
  }
  if (!await retouch_object(P(obj, 0), FALSE)) {
    return 1;
  }
  if (armor) {
    let delay = 0;
    if (obj[0].owornmask & W_WEAPONS) {
      await remove_worn_item(obj[0], FALSE);
    }
    await setworn(obj[0], mask[0]);
    if (obj[0] === G.uarm) {
      G.afternmv = Armor_on;
    } else if (obj[0] === G.uarmh) {
      G.afternmv = Helmet_on;
    } else if (obj[0] === G.uarmg) {
      G.afternmv = Gloves_on;
    } else if (obj[0] === G.uarmf) {
      G.afternmv = Boots_on;
    } else if (obj[0] === G.uarms) {
      G.afternmv = Shield_on;
    } else if (obj[0] === G.uarmc) {
      G.afternmv = Cloak_on;
    } else if (obj[0] === G.uarmu) {
      G.afternmv = Shirt_on;
    } else {
      await panic(S("wearing armor not worn as armor? [%08lx]"), obj[0].owornmask);
    }
    delay = -G.objects[obj[0].otyp].oc_delay;
    if (delay) {
      nomul(delay);
      G.multi_reason = S("dressing up");
      G.nomovemsg = S("You finish your dressing maneuver.");
    } else {
      await unmul(S(""));
      await on_msg(obj[0]);
    }
    G.context.takeoff.mask = G.context.takeoff.what = 0;
  } else {
    let give_feedback = FALSE;
    if (ring) {
      await setworn(obj[0], mask[0]);
      await Ring_on(obj[0]);
      give_feedback = TRUE;
    } else if (obj[0].oclass === AMULET_CLASS) {
      await setworn(obj[0], W_AMUL);
      await Amulet_on();
      give_feedback = (!!G.uamul ? 1 : 0) << 24 >> 24;
    } else if (eyewear) {
      await Blindf_on(obj[0]);
    }
    if (give_feedback && is_worn(obj[0])) {
      await prinv(null, obj[0], 0);
    }
  }
  return 1;
}

export async function dowear(): Promise<number> {
  let otmp = null;
  if (G.youmonst.data.msize < 1 || (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await pline(S("Don't even bother."));
    return 0;
  }
  if (G.uarm && G.uarmu && G.uarmc && G.uarmh && G.uarms && G.uarmg && G.uarmf && G.uleft && G.uright && G.uamul && G.ublindf) {
    await You(S("are already wearing a full complement of armor."));
    return 0;
  }
  otmp = await getobj(P(clothes), S("wear"));
  return otmp ? await accessory_or_armor_on(otmp) : 0;
}

export async function doputon(): Promise<number> {
  let otmp = null;
  if (G.uleft && G.uright && G.uamul && G.ublindf && G.uarm && G.uarmu && G.uarmc && G.uarmh && G.uarms && G.uarmg && G.uarmf) {
    await Your(S("%s%s are full, and you're already wearing an amulet and %s."), (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 ? S("ring-") : S(""), await fingers_or_gloves(FALSE), G.ublindf.otyp === LENSES ? S("some lenses") : S("a blindfold"));
    return 0;
  }
  otmp = await getobj(P(accessories), S("put on"));
  return otmp ? await accessory_or_armor_on(otmp) : 0;
}

export function find_ac(): void {
  let uac = G.mons[G.u.umonnum].ac;
  if (G.uarm) {
    uac -= G.objects[G.uarm.otyp].oc_oc1 + G.uarm.spe - (((G.uarm.oeroded | 0) > (G.uarm.oeroded2 | 0) ? G.uarm.oeroded | 0 : G.uarm.oeroded2 | 0) < G.objects[G.uarm.otyp].oc_oc1 ? (G.uarm.oeroded | 0) > (G.uarm.oeroded2 | 0) ? G.uarm.oeroded | 0 : G.uarm.oeroded2 | 0 : G.objects[G.uarm.otyp].oc_oc1);
  }
  if (G.uarmc) {
    uac -= G.objects[G.uarmc.otyp].oc_oc1 + G.uarmc.spe - (((G.uarmc.oeroded | 0) > (G.uarmc.oeroded2 | 0) ? G.uarmc.oeroded | 0 : G.uarmc.oeroded2 | 0) < G.objects[G.uarmc.otyp].oc_oc1 ? (G.uarmc.oeroded | 0) > (G.uarmc.oeroded2 | 0) ? G.uarmc.oeroded | 0 : G.uarmc.oeroded2 | 0 : G.objects[G.uarmc.otyp].oc_oc1);
  }
  if (G.uarmh) {
    uac -= G.objects[G.uarmh.otyp].oc_oc1 + G.uarmh.spe - (((G.uarmh.oeroded | 0) > (G.uarmh.oeroded2 | 0) ? G.uarmh.oeroded | 0 : G.uarmh.oeroded2 | 0) < G.objects[G.uarmh.otyp].oc_oc1 ? (G.uarmh.oeroded | 0) > (G.uarmh.oeroded2 | 0) ? G.uarmh.oeroded | 0 : G.uarmh.oeroded2 | 0 : G.objects[G.uarmh.otyp].oc_oc1);
  }
  if (G.uarmf) {
    uac -= G.objects[G.uarmf.otyp].oc_oc1 + G.uarmf.spe - (((G.uarmf.oeroded | 0) > (G.uarmf.oeroded2 | 0) ? G.uarmf.oeroded | 0 : G.uarmf.oeroded2 | 0) < G.objects[G.uarmf.otyp].oc_oc1 ? (G.uarmf.oeroded | 0) > (G.uarmf.oeroded2 | 0) ? G.uarmf.oeroded | 0 : G.uarmf.oeroded2 | 0 : G.objects[G.uarmf.otyp].oc_oc1);
  }
  if (G.uarms) {
    uac -= G.objects[G.uarms.otyp].oc_oc1 + G.uarms.spe - (((G.uarms.oeroded | 0) > (G.uarms.oeroded2 | 0) ? G.uarms.oeroded | 0 : G.uarms.oeroded2 | 0) < G.objects[G.uarms.otyp].oc_oc1 ? (G.uarms.oeroded | 0) > (G.uarms.oeroded2 | 0) ? G.uarms.oeroded | 0 : G.uarms.oeroded2 | 0 : G.objects[G.uarms.otyp].oc_oc1);
  }
  if (G.uarmg) {
    uac -= G.objects[G.uarmg.otyp].oc_oc1 + G.uarmg.spe - (((G.uarmg.oeroded | 0) > (G.uarmg.oeroded2 | 0) ? G.uarmg.oeroded | 0 : G.uarmg.oeroded2 | 0) < G.objects[G.uarmg.otyp].oc_oc1 ? (G.uarmg.oeroded | 0) > (G.uarmg.oeroded2 | 0) ? G.uarmg.oeroded | 0 : G.uarmg.oeroded2 | 0 : G.objects[G.uarmg.otyp].oc_oc1);
  }
  if (G.uarmu) {
    uac -= G.objects[G.uarmu.otyp].oc_oc1 + G.uarmu.spe - (((G.uarmu.oeroded | 0) > (G.uarmu.oeroded2 | 0) ? G.uarmu.oeroded | 0 : G.uarmu.oeroded2 | 0) < G.objects[G.uarmu.otyp].oc_oc1 ? (G.uarmu.oeroded | 0) > (G.uarmu.oeroded2 | 0) ? G.uarmu.oeroded | 0 : G.uarmu.oeroded2 | 0 : G.objects[G.uarmu.otyp].oc_oc1);
  }
  if (G.uleft && G.uleft.otyp === RIN_PROTECTION) {
    uac -= G.uleft.spe;
  }
  if (G.uright && G.uright.otyp === RIN_PROTECTION) {
    uac -= G.uright.spe;
  }
  if (G.u.uprops[PROTECTION].intrinsic & INTRINSIC) {
    uac -= G.u.ublessed;
  }
  uac -= G.u.uspellprot;
  if (uac < -128) {
    uac = -128;
  } else if (uac > 127) {
    uac = 127;
  }
  if (uac !== G.u.uac) {
    G.u.uac = uac << 24 >> 24;
    G.context.botl = 1;
  }
}

export async function glibr(): Promise<void> {
  let otmp = null;
  let xfl = 0;
  let leftfall = 0;
  let rightfall = 0;
  let wastwoweap = FALSE;
  let otherwep = null;
  let thiswep = null;
  let which = null;
  let hand = null;
  leftfall = (G.uleft && !G.uleft.cursed && (!G.uwep || !welded(G.uwep) || !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) ? 1 : 0) << 24 >> 24;
  rightfall = (G.uright && !G.uright.cursed && !welded(G.uwep) ? 1 : 0) << 24 >> 24;
  if (!G.uarmg && (leftfall || rightfall) && !((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576)) {
    await Your(S("%s off your %s."), leftfall && rightfall ? S("rings slip") : S("ring slips"), leftfall && rightfall ? await fingers_or_gloves(FALSE) : body_part(FINGER));
    ++xfl;
    if (leftfall) {
      otmp = G.uleft;
      await Ring_off(G.uleft);
      await dropx(otmp);
    }
    if (rightfall) {
      otmp = G.uright;
      await Ring_off(G.uright);
      await dropx(otmp);
    }
  }
  otmp = G.uswapwep;
  if (G.u.twoweap && otmp) {
    otherwep = otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[otmp.otyp].oc_subtyp <= P_SABER ? P(c_sword) : await weapon_descr(otmp);
    if (otmp.quan > 1) {
      otherwep = await makeplural(otherwep);
    }
    hand = body_part(HAND);
    which = S("left ");
    await Your(S("%s %s%s from your %s%s."), otherwep, xfl ? S("also ") : S(""), otense(otmp, S("slip")), which, hand);
    ++xfl;
    wastwoweap = TRUE;
    await setuswapwep(null);
    if (await canletgo(otmp, S(""))) {
      await dropx(otmp);
    }
  }
  otmp = G.uwep;
  if (otmp && !welded(otmp)) {
    let savequan = otmp.quan;
    thiswep = otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[otmp.otyp].oc_subtyp <= P_SABER ? P(c_sword) : await weapon_descr(otmp);
    if (otherwep && strcmp(thiswep, await makesingular(otherwep))) {
      otherwep = null;
    }
    if (otmp.quan > 1) {
      if (!strcmp(thiswep, S("food"))) {
        otmp.quan = 1;
      } else {
        thiswep = await makeplural(thiswep);
      }
    }
    hand = body_part(HAND);
    which = S("");
    if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_big | 0) {
      hand = await makeplural(hand);
    } else if (wastwoweap) {
      which = S("right ");
    }
    await pline(S("%s %s%s %s%s from your %s%s."), !strncmp(thiswep, S("corpse"), 6) ? S("The") : S("Your"), otherwep ? S("other ") : S(""), thiswep, xfl ? S("also ") : S(""), otense(otmp, S("slip")), which, hand);
    otmp.quan = savequan;
    await setuwep(null);
    if (await canletgo(otmp, S(""))) {
      await dropx(otmp);
    }
  }
}

export async function some_armor(victim: struct_monst | null): Promise<struct_obj | null> {
  let otmph = null;
  let otmp = null;
  otmph = victim === G.youmonst ? G.uarmc : await which_armor(victim, W_ARMC);
  if (!otmph) {
    otmph = victim === G.youmonst ? G.uarm : await which_armor(victim, W_ARM);
  }
  if (!otmph) {
    otmph = victim === G.youmonst ? G.uarmu : await which_armor(victim, W_ARMU);
  }
  otmp = victim === G.youmonst ? G.uarmh : await which_armor(victim, W_ARMH);
  if (otmp && (!otmph || !rn2(4))) {
    otmph = otmp;
  }
  otmp = victim === G.youmonst ? G.uarmg : await which_armor(victim, W_ARMG);
  if (otmp && (!otmph || !rn2(4))) {
    otmph = otmp;
  }
  otmp = victim === G.youmonst ? G.uarmf : await which_armor(victim, W_ARMF);
  if (otmp && (!otmph || !rn2(4))) {
    otmph = otmp;
  }
  otmp = victim === G.youmonst ? G.uarms : await which_armor(victim, W_ARMS);
  if (otmp && (!otmph || !rn2(4))) {
    otmph = otmp;
  }
  return otmph;
}

export async function stuck_ring(ring: struct_obj | null, otyp: number): Promise<struct_obj | null> {
  if (ring !== G.uleft && ring !== G.uright) {
    await impossible(S("stuck_ring: neither left nor right?"));
    return null;
  }
  if (ring && ring.otyp === otyp) {
    if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576 && G.uamul && G.uamul.otyp === AMULET_OF_UNCHANGING && G.uamul.cursed | 0) {
      return G.uamul;
    }
    if (welded(G.uwep) && (ring === G.uright || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
      return G.uwep;
    }
    if (G.uarmg && G.uarmg.cursed | 0) {
      return G.uarmg;
    }
    if (ring.cursed) {
      return ring;
    }
    if (G.uarmg && G.u.uprops[GLIB].intrinsic) {
      return G.uarmg;
    }
  }
  return null;
}

export function unchanger(): struct_obj | null {
  if (G.uamul && G.uamul.otyp === AMULET_OF_UNCHANGING) {
    return G.uamul;
  }
  return null;
}

async function select_off(otmp: struct_obj | null): Promise<number> {
  let why = null;
  let buf = new Int8Array(256);
  if (!otmp) {
    return 0;
  }
  $wr(P(buf), 0, 0);
  if (otmp === G.uright || otmp === G.uleft) {
    let glibdummy = new struct_obj();
    if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576) {
      await pline_The(S("ring is stuck."));
      return 0;
    }
    glibdummy.$cp(G.zeroobj);
    why = null;
    if (welded(G.uwep) && (otmp === G.uright || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
      sprintf(P(buf), S("free a weapon %s"), body_part(HAND));
      why = G.uwep;
    } else if (G.uarmg && (G.uarmg.cursed | 0 || G.u.uprops[GLIB].intrinsic)) {
      sprintf(P(buf), S("take off your %s%s"), G.u.uprops[GLIB].intrinsic ? S("slippery ") : S(""), gloves_simple_name(G.uarmg));
      why = !G.u.uprops[GLIB].intrinsic ? G.uarmg : glibdummy;
    }
    if (why) {
      await You(S("cannot %s to remove the ring."), P(buf));
      set_bknown(why, 1);
      return 0;
    }
  }
  if (otmp === G.uarmg) {
    if (welded(G.uwep)) {
      await You(S("are unable to take off your %s while wielding that %s."), P(c_gloves), G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? P(c_sword) : P(c_weapon));
      set_bknown(G.uwep, 1);
      return 0;
    } else if (G.u.uprops[GLIB].intrinsic) {
      await pline(S("%s %s are too slippery to take off."), G.uarmg.unpaid | 0 ? S("The") : S("Your"), gloves_simple_name(G.uarmg));
      return 0;
    }
  }
  if (otmp === G.uarmf) {
    if (G.u.utrap && G.u.utraptype === TT_BEARTRAP) {
      await pline_The(S("bear trap prevents you from pulling your %s out."), body_part(FOOT));
      return 0;
    } else if (G.u.utrap && G.u.utraptype === TT_INFLOOR) {
      await You(S("are stuck in the %s, and cannot pull your %s out."), surface(G.u.ux, G.u.uy), await makeplural(body_part(FOOT)));
      return 0;
    }
  }
  if (otmp === G.uarm || otmp === G.uarmu) {
    why = null;
    if (G.uarmc && G.uarmc.cursed | 0) {
      sprintf(P(buf), S("remove your %s"), cloak_simple_name(G.uarmc));
      why = G.uarmc;
    } else if (otmp === G.uarmu && G.uarm && G.uarm.cursed | 0) {
      sprintf(P(buf), S("remove your %s"), P(c_suit));
      why = G.uarm;
    } else if (welded(G.uwep) && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
      sprintf(P(buf), S("release your %s"), G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? P(c_sword) : G.uwep.otyp === BATTLE_AXE ? P(c_axe) : P(c_weapon));
      why = G.uwep;
    }
    if (why) {
      await You(S("cannot %s to take off %s."), P(buf), await the(await xname(otmp)));
      set_bknown(why, 1);
      return 0;
    }
  }
  if (otmp === G.uquiver || otmp === G.uswapwep && !G.u.twoweap) {
    ;
  } else {
    if (await cursed(otmp)) {
      return 0;
    }
  }
  if (otmp === G.uarm) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_ARMOR;
  } else if (otmp === G.uarmc) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_CLOAK;
  } else if (otmp === G.uarmf) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_BOOTS;
  } else if (otmp === G.uarmg) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_GLOVES;
  } else if (otmp === G.uarmh) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_HELMET;
  } else if (otmp === G.uarms) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_SHIELD;
  } else if (otmp === G.uarmu) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_SHIRT;
  } else if (otmp === G.uleft) {
    G.context.takeoff.mask = G.context.takeoff.mask | LEFT_RING;
  } else if (otmp === G.uright) {
    G.context.takeoff.mask = G.context.takeoff.mask | RIGHT_RING;
  } else if (otmp === G.uamul) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_AMUL;
  } else if (otmp === G.ublindf) {
    G.context.takeoff.mask = G.context.takeoff.mask | WORN_BLINDF;
  } else if (otmp === G.uwep) {
    G.context.takeoff.mask = G.context.takeoff.mask | W_WEP;
  } else if (otmp === G.uswapwep) {
    G.context.takeoff.mask = G.context.takeoff.mask | W_SWAPWEP;
  } else if (otmp === G.uquiver) {
    G.context.takeoff.mask = G.context.takeoff.mask | W_QUIVER;
  } else {
    await impossible(S("select_off: %s???"), await doname(otmp));
  }
  return 0;
}

async function do_takeoff(): Promise<struct_obj | null> {
  let otmp = null;
  let doff = G.context.takeoff;
  G.context.takeoff.mask = G.context.takeoff.mask | I_SPECIAL;
  if (doff.what === W_WEP) {
    if (!await cursed(G.uwep)) {
      await setuwep(null);
      await You(S("are empty %s."), body_part(HANDED));
      G.u.twoweap = FALSE;
    }
  } else if (doff.what === W_SWAPWEP) {
    await setuswapwep(null);
    await You(S("no longer have a second weapon readied."));
    G.u.twoweap = FALSE;
  } else if (doff.what === W_QUIVER) {
    await setuqwep(null);
    await You(S("no longer have ammunition readied."));
  } else if (doff.what === WORN_ARMOR) {
    otmp = G.uarm;
    if (!await cursed(otmp)) {
      await Armor_off();
    }
  } else if (doff.what === WORN_CLOAK) {
    otmp = G.uarmc;
    if (!await cursed(otmp)) {
      await Cloak_off();
    }
  } else if (doff.what === WORN_BOOTS) {
    otmp = G.uarmf;
    if (!await cursed(otmp)) {
      await Boots_off();
    }
  } else if (doff.what === WORN_GLOVES) {
    otmp = G.uarmg;
    if (!await cursed(otmp)) {
      await Gloves_off();
    }
  } else if (doff.what === WORN_HELMET) {
    otmp = G.uarmh;
    if (!await cursed(otmp)) {
      await Helmet_off();
    }
  } else if (doff.what === WORN_SHIELD) {
    otmp = G.uarms;
    if (!await cursed(otmp)) {
      await Shield_off();
    }
  } else if (doff.what === WORN_SHIRT) {
    otmp = G.uarmu;
    if (!await cursed(otmp)) {
      await Shirt_off();
    }
  } else if (doff.what === WORN_AMUL) {
    otmp = G.uamul;
    if (!await cursed(otmp)) {
      await Amulet_off();
    }
  } else if (doff.what === LEFT_RING) {
    otmp = G.uleft;
    if (!await cursed(otmp)) {
      await Ring_off(G.uleft);
    }
  } else if (doff.what === RIGHT_RING) {
    otmp = G.uright;
    if (!await cursed(otmp)) {
      await Ring_off(G.uright);
    }
  } else if (doff.what === WORN_BLINDF) {
    if (!await cursed(G.ublindf)) {
      await Blindf_off(G.ublindf);
    }
  } else {
    await impossible(S("do_takeoff: taking off %lx"), doff.what);
  }
  G.context.takeoff.mask = G.context.takeoff.mask & ~I_SPECIAL;
  return otmp;
}

async function take_off(): Promise<number> {
  let i = 0;
  let otmp = null;
  let doff = G.context.takeoff;
  if (doff.what) {
    if (doff.delay > 0) {
      --doff.delay;
      return 1;
    }
    if (!!(otmp = await do_takeoff())) {
      await off_msg(otmp);
    }
    doff.mask = doff.mask & ~doff.what;
    doff.what = 0;
  }
  for (i = 0; takeoff_order[i]; ++i) {
    if (doff.mask & takeoff_order[i]) {
      doff.what = takeoff_order[i];
      break;
    }
  }
  otmp = null;
  doff.delay = 0;
  if (doff.what === 0) {
    await You(S("finish %s."), P(doff.disrobing));
    return 0;
  } else if (doff.what === W_WEP) {
    doff.delay = 1;
  } else if (doff.what === W_SWAPWEP) {
    doff.delay = 1;
  } else if (doff.what === W_QUIVER) {
    doff.delay = 1;
  } else if (doff.what === WORN_ARMOR) {
    otmp = G.uarm;
    if (G.uarmc) {
      doff.delay += 2 * G.objects[G.uarmc.otyp].oc_delay + 1;
    }
  } else if (doff.what === WORN_CLOAK) {
    otmp = G.uarmc;
  } else if (doff.what === WORN_BOOTS) {
    otmp = G.uarmf;
  } else if (doff.what === WORN_GLOVES) {
    otmp = G.uarmg;
  } else if (doff.what === WORN_HELMET) {
    otmp = G.uarmh;
  } else if (doff.what === WORN_SHIELD) {
    otmp = G.uarms;
  } else if (doff.what === WORN_SHIRT) {
    otmp = G.uarmu;
    if (G.uarm) {
      doff.delay += 2 * G.objects[G.uarm.otyp].oc_delay;
    }
    if (G.uarmc) {
      doff.delay += 2 * G.objects[G.uarmc.otyp].oc_delay + 1;
    }
  } else if (doff.what === WORN_AMUL) {
    doff.delay = 1;
  } else if (doff.what === LEFT_RING) {
    doff.delay = 1;
  } else if (doff.what === RIGHT_RING) {
    doff.delay = 1;
  } else if (doff.what === WORN_BLINDF) {
    doff.delay = 1;
  } else {
    await impossible(S("take_off: taking off %lx"), doff.what);
    return 0;
  }
  if (otmp) {
    doff.delay += G.objects[otmp.otyp].oc_delay;
  }
  if (doff.delay > 0) {
    --doff.delay;
  }
  set_occupation(take_off, P(doff.disrobing), 0);
  return 1;
}

export function reset_remarm(): void {
  G.context.takeoff.what = G.context.takeoff.mask = 0;
  G.context.takeoff.disrobing[0] = 0;
}

export async function doddoremarm(): Promise<number> {
  let result = 0;
  if (G.context.takeoff.what || G.context.takeoff.mask) {
    await You(S("continue %s."), P(G.context.takeoff.disrobing));
    set_occupation(take_off, P(G.context.takeoff.disrobing), 0);
    return 0;
  } else if (!G.uwep && !G.uswapwep && !G.uquiver && !G.uamul && !G.ublindf && !G.uleft && !G.uright && !wearing_armor()) {
    await You(S("are not wearing anything."));
    return 0;
  }
  add_valid_menu_class(0);
  if (G.flags.menu_style !== MENU_TRADITIONAL || (result = await ggetobj(S("take off"), select_off, 0, FALSE, null)) < -1) {
    result = await menu_remarm(result);
  }
  if (G.context.takeoff.mask) {
    strncpy(P(G.context.takeoff.disrobing), S("disrobing"), CONTEXTVERBSZ);
    if (!(G.context.takeoff.mask & ~W_WEAPONS)) {
      strncpy(P(G.context.takeoff.disrobing), S("disarming"), CONTEXTVERBSZ);
    }
    await take_off();
  }
  return 0;
}

async function menu_remarm(retry: number): Promise<number> {
  let n = 0;
  let i = 0;
  const pick_list = [null];
  let all_worn_categories = TRUE;
  if (retry) {
    all_worn_categories = (retry === -2 ? 1 : 0) << 24 >> 24;
  } else if (G.flags.menu_style === MENU_FULL) {
    all_worn_categories = FALSE;
    n = await query_category(S("What type of things do you want to take off?"), G.invent, WORN_TYPES | ALL_TYPES | UNPAID_TYPES | BUCX_TYPES, P(pick_list, 0), PICK_ANY);
    if (!n) {
      return 0;
    }
    for (i = 0; i < n; ++i) {
      if ($sadd(pick_list[0], i).item.a_int === ALL_TYPES_SELECTED) {
        all_worn_categories = TRUE;
      } else {
        add_valid_menu_class($sadd(pick_list[0], i).item.a_int);
      }
    }
    free(pick_list[0]);
  } else if (G.flags.menu_style === MENU_COMBINATION) {
    const ggofeedback = new Uint32Array(1);
    ggofeedback[0] = 0;
    i = await ggetobj(S("take off"), select_off, 0, TRUE, P(ggofeedback, 0));
    if ((ggofeedback[0] & ALL_FINISHED) >>> 0) {
      return 0;
    }
    all_worn_categories = (i === -2 ? 1 : 0) << 24 >> 24;
  }
  if (menu_class_present(117) || menu_class_present(66) || menu_class_present(85) || menu_class_present(67) || menu_class_present(88)) {
    all_worn_categories = FALSE;
  }
  n = await query_objlist(S("What do you want to take off?"), P(G, "invent"), SIGNAL_NOMENU | USE_INVLET | INVORDER_SORT, P(pick_list, 0), PICK_ANY, all_worn_categories ? is_worn : is_worn_by_type);
  if (n > 0) {
    for (i = 0; i < n; ++i) {
      await select_off($sadd(pick_list[0], i).item.a_obj);
    }
    free(pick_list[0]);
  } else if (n < 0 && G.flags.menu_style !== MENU_COMBINATION) {
    await There(S("is nothing else you can remove or unwield."));
  }
  return 0;
}

export async function destroy_arm(atmp: struct_obj | null): Promise<number> {
  let otmp = null;
  if (!!(otmp = G.uarmc) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("%s crumbles and turns to dust!"), cloak_simple_name(G.uarmc));
    await Cloak_off();
    await useup(otmp);
  } else if (!!(otmp = G.uarm) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("armor turns to dust and falls to the %s!"), surface(G.u.ux, G.u.uy));
    await Armor_gone();
    await useup(otmp);
  } else if (!!(otmp = G.uarmu) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("shirt crumbles into tiny threads and falls apart!"));
    await Shirt_off();
    await useup(otmp);
  } else if (!!(otmp = G.uarmh) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("%s turns to dust and is blown away!"), helm_simple_name(G.uarmh));
    await Helmet_off();
    await useup(otmp);
  } else if (!!(otmp = G.uarmg) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("gloves vanish!"));
    await Gloves_off();
    await useup(otmp);
    await selftouch(S("You"));
  } else if (!!(otmp = G.uarmf) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("boots disintegrate!"));
    await Boots_off();
    await useup(otmp);
  } else if (!!(otmp = G.uarms) && (!atmp || atmp === otmp) && !obj_resists(otmp, 0, 90) ? (otmp.in_use = 1) | 0 : 0) {
    if (donning(otmp)) {
      cancel_don();
    }
    await Your(S("shield crumbles away!"));
    await Shield_off();
    await useup(otmp);
  } else {
    return 0;
  }
  await stop_occupation();
  return 1;
}

export async function adj_abon(otmp: struct_obj | null, delta: number): Promise<void> {
  if (G.uarmg && G.uarmg === otmp && otmp.otyp === GAUNTLETS_OF_DEXTERITY) {
    if (delta) {
      await discover_object(G.uarmg.otyp, 1, 1);
      G.u.abon.a[A_DEX] += delta;
    }
    G.context.botl = 1;
  }
  if (G.uarmh && G.uarmh === otmp && otmp.otyp === HELM_OF_BRILLIANCE) {
    if (delta) {
      await discover_object(G.uarmh.otyp, 1, 1);
      G.u.abon.a[A_INT] += delta;
      G.u.abon.a[A_WIS] += delta;
    }
    G.context.botl = 1;
  }
}

export async function inaccessible_equipment(obj: struct_obj | null, verb: Ptr | null, only_if_known_cursed: number): Promise<number> {
  let buf = new Int8Array(256);
  let anycovering = (!only_if_known_cursed ? 1 : 0) << 24 >> 24;
  if (!obj || !obj.owornmask) {
    return FALSE;
  }
  if (obj === G.uarm && G.uarmc && (anycovering || G.uarmc.cursed | 0 && G.uarmc.bknown | 0)) {
    if (verb) {
      strcpy(P(buf), await yname(G.uarmc));
      await You(P(inaccessible_equipment$need_to_take_off_outer_armor), P(buf), verb, await yname(obj));
    }
    return TRUE;
  }
  if (obj === G.uarmu && (G.uarm && (anycovering || G.uarm.cursed | 0 && G.uarm.bknown | 0) || G.uarmc && (anycovering || G.uarmc.cursed | 0 && G.uarmc.bknown | 0))) {
    if (verb) {
      let cloaktmp = new Int8Array(128);
      let suittmp = new Int8Array(128);
      let sameprefix = (G.uarm && G.uarmc && !strcmp(await shk_your(P(cloaktmp), G.uarmc), await shk_your(P(suittmp), G.uarm)) ? 1 : 0) << 24 >> 24;
      $wr(P(buf), 0, 0);
      if (G.uarmc) {
        strcat(P(buf), await yname(G.uarmc));
      }
      if (G.uarm && G.uarmc) {
        strcat(P(buf), S(" and "));
      }
      if (G.uarm) {
        strcat(P(buf), sameprefix ? await xname(G.uarm) : await yname(G.uarm));
      }
      await You(P(inaccessible_equipment$need_to_take_off_outer_armor), P(buf), verb, await yname(obj));
    }
    return TRUE;
  }
  if ((obj === G.uleft || obj === G.uright) && G.uarmg && (anycovering || G.uarmg.cursed | 0 && G.uarmg.bknown | 0)) {
    if (verb) {
      strcpy(P(buf), await yname(G.uarmg));
      await You(P(inaccessible_equipment$need_to_take_off_outer_armor), P(buf), verb, await yname(obj));
    }
    return TRUE;
  }
  return FALSE;
}

export function $init(): void {
  see_yourself = $cs("see yourself", 13);
  unknown_type = $cs("Unknown type of %s (%d)", 24);
  c_armor = $cs("armor", 6);
  c_suit = $cs("suit", 5);
  c_shirt = $cs("shirt", 6);
  c_cloak = $cs("cloak", 6);
  c_gloves = $cs("gloves", 7);
  c_boots = $cs("boots", 6);
  c_helmet = $cs("helmet", 7);
  c_shield = $cs("shield", 7);
  c_weapon = $cs("weapon", 7);
  c_sword = $cs("sword", 6);
  c_axe = $cs("axe", 4);
  c_that_ = $cs("that", 5);
  takeoff_order = $ta(Float64Array, 15, [WORN_BLINDF, W_WEP, WORN_SHIELD, WORN_GLOVES, LEFT_RING, RIGHT_RING, WORN_CLOAK, WORN_HELMET, WORN_AMUL, WORN_ARMOR, WORN_SHIRT, WORN_BOOTS, W_SWAPWEP, W_QUIVER]);
  initial_don = 0;
  clothes = $ta(Int8Array, 6, [ARMOR_CLASS, RING_CLASS, AMULET_CLASS, TOOL_CLASS, FOOD_CLASS]);
  accessories = $ta(Int8Array, 6, [RING_CLASS, AMULET_CLASS, TOOL_CLASS, FOOD_CLASS, ARMOR_CLASS]);
  Narmorpieces = 0;
  Naccessories = 0;
  armoroff$offdelaybuf = new Int8Array(60);
  inaccessible_equipment$need_to_take_off_outer_armor = $cs("need to take off %s to %s %s.", 30);
}
