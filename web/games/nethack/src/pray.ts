// @ts-nocheck
// NetHack 3.6.7 pray.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artiname, confers_luck, discover_artifact, exist_artifact, mk_artifact, nartifact_exist } from './artifact.ts';
import { adjalign, adjattrib, change_luck, exercise, uchangealign } from './attrib.ts';
import { xlev_to_rank } from './botl.ts';
import { isok, yn_function } from './cmd.ts';
import { is_pool_or_lava } from './dbridge.ts';
import { buried_ball_to_freedom } from './dig.ts';
import { newsym, see_monsters, shieldeff } from './display.ts';
import { dropy, heal_legs } from './do.ts';
import { Monnam, a_monnam, hcolor, mon_nam, oname } from './do_name.ts';
import { Amulet_off, destroy_arm, stuck_ring, unchanger } from './do_wear.ts';
import { In_hell, on_level } from './dungeon.ts';
import { eaten_stat, floorfood, init_uhunger } from './eat.ts';
import { done } from './end.ts';
import { freehand } from './engrave.ts';
import { losexp, pluslvl } from './exper.ts';
import { losehp, near_capacity, nomul } from './hack.ts';
import { dist2, eos, s_suffix, sgn, strncmpi } from './hacklib.ts';
import { carrying, feel_cockatrice, sobj_at, update_inventory, useup, useupf } from './invent.ts';
import { makemon, set_malign } from './makemon.ts';
import { dlord, summon_minion } from './minion.ts';
import { bless, get_mtraits, mkobj, mksobj, peek_at_iced_corpse_age, place_object, set_bknown, uncurse } from './mkobj.ts';
import { killed, xkilled } from './mon.ts';
import { attacktype_fordmg, can_chant } from './mondata.ts';
import { monflee } from './monmove.ts';
import { ureflects } from './muse.ts';
import { discover_object } from './o_init.ts';
import { An, Yobjnam2, an, gloves_simple_name, makeplural, otense, rnd_class, vtense, xname, yname } from './objnam.ts';
import { encumber_msg, rider_corpse_revival } from './pickup.ts';
import { You, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart, rehumanize } from './polyself.ts';
import { make_blinded, make_confused, make_deaf, make_glib, make_hallucinated, make_sick, make_slimed, make_stoned, make_stunned, set_itimeout } from './potion.ts';
import { align_str, angry_priest, findpriest, p_coaligned, temple_occupied } from './priest.ts';
import { punish, unpunish } from './read.ts';
import { region_danger, region_safety } from './region.ts';
import { d, rn2, rnd, rnl, rnz } from './rnd.ts';
import { randrole } from './role.ts';
import { rndcurse } from './sit.ts';
import { spell_skilltype, spelleffects } from './spell.ts';
import { safe_teleds } from './teleport.ts';
import { reset_utrap } from './trap.ts';
import { add_weapon_skill, unrestrict_weapon_skill, weapon_type } from './weapon.ts';
import { you_unwere } from './were.ts';
import { welded } from './wield.ts';
import { aggravate } from './wizard.ts';
import { which_armor } from './worn.ts';
import { resist } from './zap.ts';
import { struct_obj } from './structs.ts';
import { $at2, $cs, $rd, $sat, $u64, $wr, G, P, S, rn2_on_display_rng, sprintf, strcmp, strcpy } from './rt/index.ts';
import { AD_BLND, AGGRAVATE_MONSTER, ALTAR, AMULET_OF_STRANGULATION, AMULET_OF_YENDOR, AM_CHAOTIC, AM_SHRINE, ANTIMAGIC, ART_EXCALIBUR, ART_STORMBRINGER, ART_VORPAL_BLADE, ASCENDED, AT_ENGL, A_CHAOTIC, A_CON, A_CURRENT, A_LAWFUL, A_MAX, A_NEUTRAL, A_NONE, A_ORIGINAL, A_STR, A_WIS, BLINDED, BOLT_LIM, BOULDER, COLD_RES, CONFUSION, CORPSE, DEAF, DEVOUT, DIED, DISINT_RES, ESCAPED, EXT_ENCUMBER, EYE, FAKE_AMULET_OF_YENDOR, FALSE, FAST, FIRE_RES, FIXED_ABIL, FOOT, FROMOUTSIDE, GLIB, HALLUC, HALLUC_RES, HELM_OF_OPPOSITE_ALIGNMENT, HUNGRY, HVY_ENCUMBER, INTRINSIC, KILLED_BY, KILLED_BY_AN, LEVITATION, LOADSTONE, LONG_SWORD, LOW_PM, LUCKMAX, MAGIC_MARKER, MAXSPELL, MAXULEV, MAXVALUE, NON_PM, NOTELL, NO_MM_FLAGS, NO_SPELL, PASSES_WALLS, PIOUS, PLNMSG_OBJ_GLOWS, PM_ACID_BLOB, POISON_RES, POOL, POTION_CLASS, POT_WATER, PROTECTION, P_BROAD_SWORD, P_ISRESTRICTED, P_LONG_SWORD, P_NONE, REFLECTING, RIN_LEVITATION, RIN_SUSTAIN_ABILITY, ROOM, RUNESWORD, SCORR, SDOOR, SEE_INVIS, SHOCK_RES, SICK, SICK_ALL, SLEEP_RES, SLIMED, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_FINGER_OF_DEATH, SPE_RESTORE_ABILITY, SPE_TURN_UNDEAD, STEALTH, STOMACH, STONED, STRANGE_OBJECT, STRANGLED, STRAT_APPEARMSG, STRIDENT, STUNNED, S_GHOST, S_HUMAN, S_LICH, S_MUMMY, S_UNICORN, S_VAMPIRE, S_WRAITH, S_ZOMBIE, TELEPAT, TELL, TIMEOUT, TOOL_CLASS, TROUBLE_BLIND, TROUBLE_COLLAPSING, TROUBLE_CONFUSED, TROUBLE_CURSED_BLINDFOLD, TROUBLE_CURSED_ITEMS, TROUBLE_CURSED_LEVITATION, TROUBLE_FUMBLING, TROUBLE_HALLUCINATION, TROUBLE_HIT, TROUBLE_HUNGRY, TROUBLE_LAVA, TROUBLE_LYCANTHROPE, TROUBLE_POISONED, TROUBLE_PUNISHED, TROUBLE_REGION, TROUBLE_SADDLE, TROUBLE_SICK, TROUBLE_SLIMED, TROUBLE_STARVING, TROUBLE_STONED, TROUBLE_STRANGLED, TROUBLE_STUCK_IN_WALL, TROUBLE_STUNNED, TROUBLE_UNUSEABLE_HANDS, TROUBLE_WOUNDED_LEGS, TRUE, TT_BURIEDBALL, TT_LAVA, UNCHANGING, WEAK, WEAPON_CLASS, WOUNDED_LEGS, W_ARM, W_ARMC, W_ARMS, W_SADDLE, XKILL_NOCONDUCT, XKILL_NOCORPSE, XKILL_NOMSG } from './consts.ts';

let Moloch: Ptr | null;
let godvoices: any;
let p_aligntyp: number;
let p_trouble: number;
let p_type: number;
let hallu_gods: any;
let fix_worst_trouble$leftglow: any;
let fix_worst_trouble$rightglow: any;
let pleased$msg: any;
let dosacrifice$cloud_of_smoke: any;

export function critically_low_hp(only_if_injured: number): number {
  let divisor = 0;
  let hplim = 0;
  let curhp = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp;
  let maxhp = G.u.umonnum !== G.u.umonster ? G.u.mhmax : G.u.uhpmax;
  if (only_if_injured && !(curhp < maxhp)) {
    return FALSE;
  }
  hplim = 15 * G.u.ulevel;
  if (maxhp > hplim) {
    maxhp = hplim;
  }
  switch (xlev_to_rank(G.u.ulevel)) {
  case 0:
  case 1:
    divisor = 5;
    break;
  case 2:
  case 3:
    divisor = 6;
    break;
  case 4:
  case 5:
    divisor = 7;
    break;
  case 6:
  case 7:
    divisor = 8;
    break;
  default:
    divisor = 9;
    break;
  }
  return (curhp <= 5 || Math.imul(curhp, divisor) <= maxhp ? 1 : 0) << 24 >> 24;
}

export function stuck_in_wall(): number {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let count = 0;
  if (G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) {
    return FALSE;
  }
  for (i = -1; i <= 1; ++i) {
    x = G.u.ux + i;
    for (j = -1; j <= 1; ++j) {
      if (!i && !j) {
        continue;
      }
      y = G.u.uy + j;
      if (!isok(x, y) || $at2(G.level.locations, x, y).typ < POOL && ($at2(G.level.locations, x, y).typ !== SDOOR && $at2(G.level.locations, x, y).typ !== SCORR) || blocked_boulder(i, j) && !((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
        ++count;
      }
    }
  }
  return (count === 8 ? TRUE : FALSE) << 24 >> 24;
}

async function in_trouble(): Promise<number> {
  let otmp = null;
  let i = 0;
  if (G.u.uprops[STONED].intrinsic) {
    return TROUBLE_STONED;
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    return TROUBLE_SLIMED;
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    return TROUBLE_STRANGLED;
  }
  if (G.u.utrap && G.u.utraptype === TT_LAVA) {
    return TROUBLE_LAVA;
  }
  if (G.u.uprops[SICK].intrinsic) {
    return TROUBLE_SICK;
  }
  if (G.u.uhs >= WEAK) {
    return TROUBLE_STARVING;
  }
  if (region_danger()) {
    return TROUBLE_REGION;
  }
  if (critically_low_hp(FALSE)) {
    return TROUBLE_HIT;
  }
  if (G.u.ulycn >= LOW_PM) {
    return TROUBLE_LYCANTHROPE;
  }
  if (near_capacity() >= EXT_ENCUMBER && G.u.amax.a[A_STR] - G.u.acurr.a[A_STR] > 3) {
    return TROUBLE_COLLAPSING;
  }
  if (stuck_in_wall()) {
    return TROUBLE_STUCK_IN_WALL;
  }
  if (G.uarmf && G.uarmf.otyp === 149 && G.uarmf.cursed | 0 || await stuck_ring(G.uleft, RIN_LEVITATION) || await stuck_ring(G.uright, RIN_LEVITATION)) {
    return TROUBLE_CURSED_LEVITATION;
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || !freehand()) {
    if (welded(G.uwep)) {
      return TROUBLE_UNUSEABLE_HANDS;
    }
    if (G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 && (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) || !!(otmp = unchanger()) && otmp.cursed | 0)) {
      return TROUBLE_UNUSEABLE_HANDS;
    }
  }
  if (G.ublindf && G.ublindf.otyp !== 207 && G.ublindf.cursed | 0) {
    return TROUBLE_CURSED_BLINDFOLD;
  }
  if (!!G.uball || G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
    return TROUBLE_PUNISHED;
  }
  if (G.uarmg && G.uarmg.otyp === 137 && G.uarmg.cursed | 0 || G.uarmf && G.uarmf.otyp === 148 && G.uarmf.cursed | 0) {
    return TROUBLE_FUMBLING;
  }
  if (worst_cursed_item()) {
    return TROUBLE_CURSED_ITEMS;
  }
  if (G.u.usteed) {
    otmp = await which_armor(G.u.usteed, W_SADDLE);
    if (otmp && otmp.otyp === 210 && otmp.cursed | 0) {
      return TROUBLE_SADDLE;
    }
  }
  if (G.u.uprops[BLINDED].intrinsic > 1 && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0 && (!G.u.uswallow || !attacktype_fordmg(G.u.ustuck.data, AT_ENGL, AD_BLND))) {
    return TROUBLE_BLIND;
  }
  if ((G.u.uprops[DEAF].intrinsic & TIMEOUT) > 1) {
    return TROUBLE_BLIND;
  }
  for (i = 0; i < A_MAX; ++i) {
    if (G.u.acurr.a[i] < G.u.amax.a[i]) {
      return TROUBLE_POISONED;
    }
  }
  if ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) && !G.u.usteed) {
    return TROUBLE_WOUNDED_LEGS;
  }
  if (G.u.uhs >= HUNGRY) {
    return TROUBLE_HUNGRY;
  }
  if (G.u.uprops[STUNNED].intrinsic & TIMEOUT) {
    return TROUBLE_STUNNED;
  }
  if (G.u.uprops[CONFUSION].intrinsic & TIMEOUT) {
    return TROUBLE_CONFUSED;
  }
  if (G.u.uprops[HALLUC].intrinsic & TIMEOUT) {
    return TROUBLE_HALLUCINATION;
  }
  return 0;
}

function worst_cursed_item(): struct_obj | null {
  let otmp = null;
  if (near_capacity() >= HVY_ENCUMBER) {
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (otmp && otmp.otyp === 444 && otmp.cursed | 0) {
        return otmp;
      }
    }
  }
  if (welded(G.uwep) && (G.uright || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
    otmp = G.uwep;
  } else if (G.uarmg && G.uarmg.cursed | 0) {
    otmp = G.uarmg;
  } else if (G.uarms && G.uarms.cursed | 0) {
    otmp = G.uarms;
  } else if (G.uarmc && G.uarmc.cursed | 0) {
    otmp = G.uarmc;
  } else if (G.uarm && G.uarm.cursed | 0) {
    otmp = G.uarm;
  } else if (G.uarmh && G.uarmh.cursed | 0 && G.uarmh.otyp !== HELM_OF_OPPOSITE_ALIGNMENT) {
    otmp = G.uarmh;
  } else if (G.uarmf && G.uarmf.cursed | 0) {
    otmp = G.uarmf;
  } else if (G.uarmu && G.uarmu.cursed | 0) {
    otmp = G.uarmu;
  } else if (G.uamul && G.uamul.cursed | 0) {
    otmp = G.uamul;
  } else if (G.uleft && G.uleft.cursed | 0) {
    otmp = G.uleft;
  } else if (G.uright && G.uright.cursed | 0) {
    otmp = G.uright;
  } else if (G.ublindf && G.ublindf.cursed | 0) {
    otmp = G.ublindf;
  } else if (welded(G.uwep)) {
    otmp = G.uwep;
  } else if (G.uswapwep && G.uswapwep.cursed | 0 && G.u.twoweap) {
    otmp = G.uswapwep;
  } else {
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (!otmp.cursed) {
        continue;
      }
      if (otmp.otyp === LOADSTONE || confers_luck(otmp)) {
        break;
      }
    }
  }
  return otmp;
}

async function fix_worst_trouble(trouble: number): Promise<void> {
  let $g = 0;
  let i = 0;
  let otmp = null;
  let what = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      otmp = null;
      what = null;
      switch (trouble) {
      case 14: { $g = 3; continue $L; }
      case 13: { $g = 4; continue $L; }
      case 12: { $g = 5; continue $L; }
      case 11: { $g = 6; continue $L; }
      case 9: { $g = 7; continue $L; }
      case -8: { $g = 8; continue $L; }
      case 10: { $g = 9; continue $L; }
      case 8: { $g = 10; continue $L; }
      case 7: { $g = 11; continue $L; }
      case 5: { $g = 12; continue $L; }
      case 4: { $g = 13; continue $L; }
      case 3: { $g = 14; continue $L; }
      case 2: { $g = 15; continue $L; }
      case 1: { $g = 16; continue $L; }
      case 6: { $g = 17; continue $L; }
      case -1: { $g = 18; continue $L; }
      case -2: { $g = 19; continue $L; }
      case -3: { $g = 20; continue $L; }
      case -6: { $g = 21; continue $L; }
      case -5: { $g = 22; continue $L; }
      case -7: { $g = 23; continue $L; }
      case -9: { $g = 24; continue $L; }
      case -10: { $g = 25; continue $L; }
      case -11: { $g = 26; continue $L; }
      case -4: { $g = 27; continue $L; }
      default: { $g = 2; continue $L; }
      }
    case 3:
      await make_stoned(0, S("You feel more limber."), 0, null);
      { $g = 2; continue $L; };
    case 4:
      await make_slimed(0, S("The slime disappears."));
      { $g = 2; continue $L; };
    case 5:
      if (G.uamul && G.uamul.otyp === AMULET_OF_STRANGULATION) {
        await Your(S("amulet vanishes!"));
        await useup(G.uamul);
      }
      await You(S("can breathe again."));
      G.u.uprops[STRANGLED].intrinsic = 0;
      G.context.botl = 1;
      { $g = 2; continue $L; };
    case 6:
      await You(S("are back on solid ground."));
      if (!await safe_teleds(FALSE)) {
        await reset_utrap(TRUE);
      }
      { $g = 2; continue $L; };
    case 7:
    case 8:
      await Your(S("%s feels content."), body_part(STOMACH));
      await init_uhunger();
      G.context.botl = 1;
      { $g = 2; continue $L; };
    case 9:
      await You_feel(S("better."));
      await make_sick(0, null, FALSE, SICK_ALL);
      { $g = 2; continue $L; };
    case 10:
      await region_safety();
      { $g = 2; continue $L; };
    case 11:
      await You_feel(S("much better."));
      if (G.u.umonnum !== G.u.umonster) {
        G.u.mhmax += rnd(5);
        if (G.u.mhmax <= 5) {
          G.u.mhmax = 5 + 1;
        }
        G.u.mh = G.u.mhmax;
      }
      if (G.u.uhpmax < G.u.ulevel * 5 + 11) {
        G.u.uhpmax += rnd(5);
      }
      if (G.u.uhpmax <= 5) {
        G.u.uhpmax = 5 + 1;
      }
      G.u.uhp = G.u.uhpmax;
      G.context.botl = 1;
      { $g = 2; continue $L; };
    case 12:
      await You_feel(S("%sstronger."), G.u.amax.a[A_STR] - G.u.acurr.a[A_STR] > 6 ? S("much ") : S(""));
      G.u.acurr.a[A_STR] = G.u.amax.a[A_STR];
      G.context.botl = 1;
      if (G.u.uprops[FIXED_ABIL].extrinsic) {
        if (!!(otmp = await stuck_ring(G.uleft, RIN_SUSTAIN_ABILITY))) {
          if (otmp === G.uleft) {
            what = P(fix_worst_trouble$leftglow);
          }
        } else if (!!(otmp = await stuck_ring(G.uright, RIN_SUSTAIN_ABILITY))) {
          if (otmp === G.uright) {
            what = P(fix_worst_trouble$rightglow);
          }
        }
        if (otmp) {
          { $g = 1; continue $L; }
        }
      }
      { $g = 2; continue $L; };
    case 13:
      if (await safe_teleds(FALSE)) {
        await Your(S("surroundings change."));
      } else {
        set_itimeout(P(G.u.uprops[PASSES_WALLS], "intrinsic"), d(4, 4) + 4);
        await You_feel(S("much slimmer."));
      }
      { $g = 2; continue $L; };
    case 14:
      if (G.uarmf && G.uarmf.otyp === 149 && G.uarmf.cursed | 0) {
        otmp = G.uarmf;
      } else if (!!(otmp = await stuck_ring(G.uleft, RIN_LEVITATION))) {
        if (otmp === G.uleft) {
          what = P(fix_worst_trouble$leftglow);
        }
      } else if (!!(otmp = await stuck_ring(G.uright, RIN_LEVITATION))) {
        if (otmp === G.uright) {
          what = P(fix_worst_trouble$rightglow);
        }
      }
      { $g = 1; continue $L; }
    case 15:
      if (welded(G.uwep)) {
        otmp = G.uwep;
        { $g = 1; continue $L; }
      }
      if (G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
        if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
          await Your(S("shape becomes uncertain."));
          await rehumanize();
        } else if (!!(otmp = unchanger()) && otmp.cursed | 0) {
          { $g = 1; continue $L; }
        }
      }
      if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || !freehand()) {
        await impossible(S("fix_worst_trouble: couldn't cure hands."));
      }
      { $g = 2; continue $L; };
    case 16:
      otmp = G.ublindf;
      { $g = 1; continue $L; }
    case 17:
      await you_unwere(TRUE);
      { $g = 2; continue $L; };
    case 18:
      await Your(S("chain disappears."));
      if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
        await buried_ball_to_freedom();
      } else {
        await unpunish();
      }
      { $g = 2; continue $L; };
    case 19:
      if (G.uarmg && G.uarmg.otyp === 137 && G.uarmg.cursed | 0) {
        otmp = G.uarmg;
      } else if (G.uarmf && G.uarmf.otyp === 148 && G.uarmf.cursed | 0) {
        otmp = G.uarmf;
      }
      { $g = 1; continue $L; }
      { $g = 2; continue $L; };
    case 20:
      otmp = worst_cursed_item();
      if (otmp === G.uright) {
        what = P(fix_worst_trouble$rightglow);
      } else if (otmp === G.uleft) {
        what = P(fix_worst_trouble$leftglow);
      }
    case 1: // decurse
      if (!otmp) {
        await impossible(S("fix_worst_trouble: nothing to uncurse."));
        return;
      }
      if (otmp === G.uarmg && G.u.uprops[GLIB].intrinsic) {
        make_glib(0);
        await Your(S("%s are no longer slippery."), gloves_simple_name(G.uarmg));
        if (!otmp.cursed) {
          { $g = 2; continue $L; };
        }
      }
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || otmp === G.ublindf && (G.ublindf && G.ublindf.otyp !== 207 && G.ublindf.oartifact !== 26 && !G.u.uroleplay.blind && !G.u.uprops[BLINDED].intrinsic && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        await pline(S("%s %s."), what ? what : await Yobjnam2(otmp, S("softly glow")), hcolor(G.c_color_names.c_amber));
        G.iflags.last_msg = PLNMSG_OBJ_GLOWS;
        otmp.bknown = ((!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) >>> 0) & 1;
      }
      await uncurse(otmp);
      update_inventory();
      { $g = 2; continue $L; };
    case 21:
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("There's a tiger in your tank."));
      } else {
        await You_feel(S("in good health again."));
      }
      for (i = 0; i < A_MAX; ++i) {
        if (G.u.acurr.a[i] < G.u.amax.a[i]) {
          G.u.acurr.a[i] = G.u.amax.a[i];
          G.context.botl = 1;
        }
      }
      await encumber_msg();
      { $g = 2; continue $L; };
    case 22:
      {
        let msgbuf = new Int8Array(256);
        let eyes = body_part(EYE);
        let cure_deaf = (G.u.uprops[DEAF].intrinsic & TIMEOUT ? TRUE : FALSE) << 24 >> 24;
        msgbuf[0] = 0;
        if (G.u.uprops[BLINDED].intrinsic) {
          if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
            eyes = await makeplural(eyes);
          }
          sprintf(P(msgbuf), S("Your %s %s better"), eyes, vtense(eyes, S("feel")));
          G.u.ucreamed = 0;
          await make_blinded(0, FALSE);
        }
        if (cure_deaf) {
          await make_deaf(0, FALSE);
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            sprintf(eos(P(msgbuf)), S("%s can hear again"), !$rd(P(msgbuf)) ? S("You") : S(" and you"));
          }
        }
        if ($rd(P(msgbuf))) {
          await pline(S("%s."), P(msgbuf));
        }
        { $g = 2; continue $L; };
      }
    case 23:
      await heal_legs(0);
      { $g = 2; continue $L; };
    case 24:
      await make_stunned(0, TRUE);
      { $g = 2; continue $L; };
    case 25:
      await make_confused(0, TRUE);
      { $g = 2; continue $L; };
    case 26:
      await pline(S("Looks like you are back in Kansas."));
      await make_hallucinated(0, FALSE, 0);
      { $g = 2; continue $L; };
    case 27:
      otmp = await which_armor(G.u.usteed, W_SADDLE);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s %s."), await Yobjnam2(otmp, S("softly glow")), hcolor(G.c_color_names.c_amber));
        set_bknown(otmp, 1);
      }
      await uncurse(otmp);
      { $g = 2; continue $L; };
    case 2:
    }
    break;
  }
}

async function god_zaps_you(resp_god: number): Promise<void> {
  if (G.u.uswallow) {
    await pline(S("Suddenly a bolt of lightning comes down at you from the heavens!"));
    await pline(S("It strikes %s!"), await mon_nam(G.u.ustuck));
    if (!(((G.u.ustuck.data.mresists | G.u.ustuck.mextrinsics) & 16) !== 0)) {
      await pline(S("%s fries to a crisp!"), await Monnam(G.u.ustuck));
      await xkilled(G.u.ustuck, XKILL_NOMSG | XKILL_NOCONDUCT);
    } else {
      await pline(S("%s seems unaffected."), await Monnam(G.u.ustuck));
    }
  } else {
    await pline(S("Suddenly, a bolt of lightning strikes you!"));
    if (G.u.uprops[REFLECTING].intrinsic || G.u.uprops[REFLECTING].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("For some reason you're unaffected."));
      } else {
        await ureflects(S("%s reflects from your %s."), S("It"));
      }
    } else if (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("It seems not to affect you."));
    } else {
      await fry_by_god(resp_god, FALSE);
    }
  }
  await pline(S("%s is not deterred..."), await align_gname(resp_god));
  if (G.u.uswallow) {
    await pline(S("A wide-angle disintegration beam aimed at you hits %s!"), await mon_nam(G.u.ustuck));
    if (!(((G.u.ustuck.data.mresists | G.u.ustuck.mextrinsics) & 8) !== 0)) {
      await pline(S("%s disintegrates into a pile of dust!"), await Monnam(G.u.ustuck));
      await xkilled(G.u.ustuck, XKILL_NOMSG | XKILL_NOCORPSE | XKILL_NOCONDUCT);
    } else {
      await pline(S("%s seems unaffected."), await Monnam(G.u.ustuck));
    }
  } else {
    await pline(S("A wide-angle disintegration beam hits you!"));
    if (G.uarms && !(G.u.uprops[REFLECTING].extrinsic & W_ARMS) && !(G.u.uprops[DISINT_RES].extrinsic & W_ARMS)) {
      await destroy_arm(G.uarms);
    }
    if (G.uarmc && !(G.u.uprops[REFLECTING].extrinsic & W_ARMC) && !(G.u.uprops[DISINT_RES].extrinsic & W_ARMC)) {
      await destroy_arm(G.uarmc);
    }
    if (G.uarm && !(G.u.uprops[REFLECTING].extrinsic & W_ARM) && !(G.u.uprops[DISINT_RES].extrinsic & W_ARM) && !G.uarmc) {
      await destroy_arm(G.uarm);
    }
    if (G.uarmu && !G.uarm && !G.uarmc) {
      await destroy_arm(G.uarmu);
    }
    if (!(G.u.uprops[DISINT_RES].intrinsic || G.u.uprops[DISINT_RES].extrinsic)) {
      await fry_by_god(resp_god, TRUE);
    } else {
      await You(S("bask in its %s glow for a minute..."), G.c_color_names.c_black);
      await godvoice(resp_god, S("I believe it not!"));
    }
    if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) {
      await verbalize(S("Thou cannot escape my wrath, mortal!"));
      await summon_minion(resp_god, FALSE);
      await summon_minion(resp_god, FALSE);
      await summon_minion(resp_god, FALSE);
      await verbalize(S("Destroy %s, my servants!"), G.genders[G.flags.female ? 1 : 0].him);
    }
  }
}

async function fry_by_god(resp_god: number, via_disintegration: number): Promise<void> {
  await You(S("%s!"), !via_disintegration ? S("fry to a crisp") : S("disintegrate into a pile of dust"));
  G.killer.format = KILLED_BY;
  sprintf(P(G.killer.name), S("the wrath of %s"), await align_gname(resp_god));
  await done(DIED);
}

async function angrygods(resp_god: number): Promise<void> {
  let maxanger = 0;
  if (In_hell(G.u.uz)) {
    resp_god = A_NONE;
  }
  G.u.ublessed = 0;
  if (resp_god !== G.u.ualign.type) {
    maxanger = (G.u.ualign.record / 2 | 0) + (G.u.uluck + G.u.moreluck > 0 ? -(G.u.uluck + G.u.moreluck) / 3 | 0 : -(G.u.uluck + G.u.moreluck));
  } else {
    maxanger = 3 * G.u.ugangr + (G.u.uluck + G.u.moreluck > 0 || G.u.ualign.record >= STRIDENT ? -(G.u.uluck + G.u.moreluck) / 3 | 0 : -(G.u.uluck + G.u.moreluck));
  }
  if (maxanger < 1) {
    maxanger = 1;
  } else if (maxanger > 15) {
    maxanger = 15;
  }
  switch (rn2(maxanger)) {
  case 0:
  case 1:
    await You_feel(S("that %s is %s."), await align_gname(resp_god), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("bummed") : S("displeased"));
    break;
  case 2:
  case 3:
    await godvoice(resp_god, null);
    await pline(S("\"Thou %s, %s.\""), G.u.ualign.record < 0 && resp_god === G.u.ualign.type ? S("hast strayed from the path") : S("art arrogant"), G.youmonst.data.mlet === S_HUMAN ? S("mortal") : S("creature"));
    await verbalize(S("Thou must relearn thy lessons!"));
    await adjattrib(A_WIS, -1, FALSE);
    await losexp(null);
    break;
  case 6:
    if (!!!G.uball) {
      await gods_angry(resp_god);
      await punish(null);
      break;
    }
  case 4:
  case 5:
    await gods_angry(resp_god);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic)) {
      await pline(S("%s glow surrounds you."), await An(hcolor(G.c_color_names.c_black)));
    }
    await rndcurse();
    break;
  case 7:
  case 8:
    await godvoice(resp_god, null);
    await verbalize(S("Thou durst %s me?"), $at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR && (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) ? -128 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) - 2) << 24 >> 24 !== resp_god ? S("scorn") : S("call upon"));
    await pline(S("\"Then die, %s!\""), G.youmonst.data.mlet === S_HUMAN ? S("mortal") : S("creature"));
    await summon_minion(resp_god, FALSE);
    break;
  default:
    await gods_angry(resp_god);
    await god_zaps_you(resp_god);
    break;
  }
  G.u.ublesscnt = rnz(300);
  return;
}

async function at_your_feet(str: Ptr | null): Promise<void> {
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    str = G.c_common_strings.c_Something;
  }
  if (G.u.uswallow) {
    await pline(S("%s %s into %s %s."), str, vtense(str, S("drop")), s_suffix(await mon_nam(G.u.ustuck)), mbodypart(G.u.ustuck, STOMACH));
  } else {
    await pline(S("%s %s %s your %s!"), str, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("lands") : vtense(str, S("appear")), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("beneath") : S("at"), await makeplural(body_part(FOOT)));
  }
}

async function gcrownu(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let obj = null;
  let already_exists = 0;
  let in_hand = 0;
  let class_gift = 0;
  let sp_no = 0;
  ($t1 = G.u.uprops[SEE_INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
  ($t2 = G.u.uprops[FIRE_RES], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
  ($t3 = G.u.uprops[COLD_RES], $t3.intrinsic = $t3.intrinsic | FROMOUTSIDE);
  ($t4 = G.u.uprops[SHOCK_RES], $t4.intrinsic = $t4.intrinsic | FROMOUTSIDE);
  ($t5 = G.u.uprops[SLEEP_RES], $t5.intrinsic = $t5.intrinsic | FROMOUTSIDE);
  ($t6 = G.u.uprops[POISON_RES], $t6.intrinsic = $t6.intrinsic | FROMOUTSIDE);
  await godvoice(G.u.ualign.type, null);
  class_gift = STRANGE_OBJECT;
  if (G.urole.malenum === 342 && (!G.uwep || G.uwep.oartifact !== ART_VORPAL_BLADE && G.uwep.oartifact !== ART_STORMBRINGER) && !carrying(SPE_FINGER_OF_DEATH)) {
    class_gift = SPE_FINGER_OF_DEATH;
  } else if (G.urole.malenum === 334 && (!G.uwep || !G.uwep.oartifact) && !carrying(SPE_RESTORE_ABILITY)) {
    class_gift = SPE_RESTORE_ABILITY;
  }
  obj = G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE) ? G.uwep : null;
  already_exists = in_hand = FALSE;
  switch (G.u.ualign.type) {
  case 1:
    G.u.uevent.uhand_of_elbereth = 1;
    await verbalize(S("I crown thee...  The Hand of Elbereth!"));
    break;
  case 0:
    G.u.uevent.uhand_of_elbereth = 2;
    in_hand = (G.uwep && G.uwep.oartifact === ART_VORPAL_BLADE ? 1 : 0) << 24 >> 24;
    already_exists = exist_artifact(LONG_SWORD, artiname(ART_VORPAL_BLADE));
    await verbalize(S("Thou shalt be my Envoy of Balance!"));
    break;
  case -1:
    G.u.uevent.uhand_of_elbereth = 3;
    in_hand = (G.uwep && G.uwep.oartifact === ART_STORMBRINGER ? 1 : 0) << 24 >> 24;
    already_exists = exist_artifact(RUNESWORD, artiname(ART_STORMBRINGER));
    await verbalize(S("Thou art chosen to %s for My Glory!"), already_exists && !in_hand || class_gift !== STRANGE_OBJECT ? S("take lives") : S("steal souls"));
    break;
  }
  if (G.objects[class_gift].oc_class === SPBOOK_CLASS) {
    obj = await mksobj(class_gift, TRUE, FALSE);
    await bless(obj);
    obj.bknown = 1;
    await at_your_feet(S("A spellbook"));
    await dropy(obj);
    ++G.u.ugifts;
    for (sp_no = 0; sp_no < MAXSPELL; ++sp_no) {
      if (G.spl_book[sp_no].sp_id === class_gift) {
        if (G.uwep && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
          obj = G.uwep;
        }
        break;
      }
    }
  }
  switch (G.u.ualign.type) {
  case 1:
    if (class_gift !== STRANGE_OBJECT) {
      ;
    } else if (obj && obj.otyp === LONG_SWORD && !obj.oartifact) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await Your(S("sword shines brightly for a moment."));
      }
      obj = await oname(obj, artiname(ART_EXCALIBUR));
      if (obj && obj.oartifact === ART_EXCALIBUR) {
        ++G.u.ugifts;
      }
    }
    unrestrict_weapon_skill(P_LONG_SWORD);
    if (obj && obj.oartifact === ART_EXCALIBUR) {
      await discover_artifact(ART_EXCALIBUR);
    }
    break;
  case 0:
    if (class_gift !== STRANGE_OBJECT) {
      ;
    } else if (obj && in_hand) {
      await Your(S("%s goes snicker-snack!"), await xname(obj));
      obj.dknown = (TRUE) & 1;
    } else if (!already_exists) {
      obj = await mksobj(LONG_SWORD, FALSE, FALSE);
      obj = await oname(obj, artiname(ART_VORPAL_BLADE));
      obj.spe = 1;
      await at_your_feet(S("A sword"));
      await dropy(obj);
      ++G.u.ugifts;
    }
    unrestrict_weapon_skill(P_LONG_SWORD);
    if (obj && obj.oartifact === ART_VORPAL_BLADE) {
      await discover_artifact(ART_VORPAL_BLADE);
    }
    break;
  case -1:
    {
      let swordbuf = new Int8Array(256);
      sprintf(P(swordbuf), S("%s sword"), hcolor(G.c_color_names.c_black));
      if (class_gift !== STRANGE_OBJECT) {
        ;
      } else if (obj && in_hand) {
        await Your(S("%s hums ominously!"), P(swordbuf));
        obj.dknown = (TRUE) & 1;
      } else if (!already_exists) {
        obj = await mksobj(RUNESWORD, FALSE, FALSE);
        obj = await oname(obj, artiname(ART_STORMBRINGER));
        obj.spe = 1;
        await at_your_feet(await An(P(swordbuf)));
        await dropy(obj);
        ++G.u.ugifts;
      }
      unrestrict_weapon_skill(P_BROAD_SWORD);
      if (obj && obj.oartifact === ART_STORMBRINGER) {
        await discover_artifact(ART_STORMBRINGER);
      }
      break;
    }
  default:
    obj = null;
    break;
  }
  if (obj && (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE)) {
    await bless(obj);
    obj.oeroded = (obj.oeroded2 = 0) & 3;
    obj.oerodeproof = (TRUE) & 1;
    obj.bknown = (obj.rknown = 1) & 1;
    if (obj.spe < 1) {
      obj.spe = 1;
    }
    unrestrict_weapon_skill(weapon_type(obj));
  } else if (class_gift === STRANGE_OBJECT) {
    await You_feel(S("unworthy."));
  }
  update_inventory();
  await add_weapon_skill(1);
  return;
}

async function pleased(g_align: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let trouble = await in_trouble();
  let pat_on_head = 0;
  let kick_on_butt = 0;
  await You_feel(S("that %s is %s."), await align_gname(g_align), G.u.ualign.record >= DEVOUT ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("pleased as punch") : S("well-pleased") : G.u.ualign.record >= STRIDENT ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("ticklish") : S("pleased") : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("full") : S("satisfied"));
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR && p_aligntyp !== G.u.ualign.type) {
    adjalign(-1);
    return;
  } else if (G.u.ualign.record < 2 && trouble <= 0) {
    adjalign(1);
  }
  if (!trouble && G.u.ualign.record >= DEVOUT) {
    if (p_trouble === 0) {
      pat_on_head = 1;
    }
  } else {
    let action = 0;
    let prayer_luck = 0;
    let tryct = 0;
    prayer_luck = G.u.uluck + G.u.moreluck > -1 ? G.u.uluck + G.u.moreluck : -1;
    action = rn2(prayer_luck + ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR ? 3 + ((($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 8) !== 0 ? 1 : 0) : 2)) + 1;
    if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR)) {
      action = action < 3 ? action : 3;
    }
    if (G.u.ualign.record < STRIDENT) {
      action = G.u.ualign.record > 0 || !rnl(2) ? 1 : 0;
    }
    switch (action < 5 ? action : 5) {
    case 5:
      pat_on_head = 1;
    case 4:
      do {
        await fix_worst_trouble(trouble);
      } while ((trouble = await in_trouble()) !== 0);
      break;
    case 3:
      await fix_worst_trouble(trouble);
    case 2:
      while ((trouble = await in_trouble()) > 0 && ++tryct < 10) {
        await fix_worst_trouble(trouble);
      }
      break;
    case 1:
      if (trouble > 0) {
        await fix_worst_trouble(trouble);
      }
    case 0:
      break;
    }
  }
  if (pat_on_head) {
    switch (rn2(G.u.uluck + G.u.moreluck + 6 >> 1)) {
    case 0:
      break;
    case 1:
      if (G.uwep && (welded(G.uwep) || G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
        let repair_buf = new Int8Array(256);
        $wr(P(repair_buf), 0, 0);
        if (G.uwep.oeroded | 0 || G.uwep.oeroded2 | 0) {
          sprintf(P(repair_buf), S(" and %s now as good as new"), otense(G.uwep, S("are")));
        }
        if (G.uwep.cursed) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s %s%s."), await Yobjnam2(G.uwep, S("softly glow")), hcolor(G.c_color_names.c_amber), P(repair_buf));
            G.iflags.last_msg = PLNMSG_OBJ_GLOWS;
          } else {
            await You_feel(S("the power of %s over %s."), await u_gname(), await yname(G.uwep));
          }
          await uncurse(G.uwep);
          G.uwep.bknown = 1;
          $wr(P(repair_buf), 0, 0);
        } else if (!G.uwep.blessed) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("%s with %s aura%s."), await Yobjnam2(G.uwep, S("softly glow")), await an(hcolor(G.c_color_names.c_light_blue)), P(repair_buf));
            G.iflags.last_msg = PLNMSG_OBJ_GLOWS;
          } else {
            await You_feel(S("the blessing of %s over %s."), await u_gname(), await yname(G.uwep));
          }
          await bless(G.uwep);
          G.uwep.bknown = 1;
          $wr(P(repair_buf), 0, 0);
        }
        if (G.uwep.oeroded | 0 || G.uwep.oeroded2 | 0) {
          G.uwep.oeroded = (G.uwep.oeroded2 = 0) & 3;
          if ($rd(P(repair_buf))) {
            await pline(S("%s as good as new!"), await Yobjnam2(G.uwep, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("look")));
          }
        }
        update_inventory();
      }
      break;
    case 3:
      if (!G.u.uevent.uopened_dbridge && !G.u.uevent.gehennom_entered) {
        if ((G.u.uevent.uheard_tune | 0) < 1) {
          await godvoice(g_align, null);
          await verbalize(S("Hark, %s!"), G.youmonst.data.mlet === S_HUMAN ? S("mortal") : S("creature"));
          await verbalize(S("To enter the castle, thou must play the right tune!"));
          G.u.uevent.uheard_tune = (G.u.uevent.uheard_tune + 1 >>> 0) & 3;
          break;
        } else if ((G.u.uevent.uheard_tune | 0) < 2) {
          await You_hear(S("a divine music..."));
          await pline(S("It sounds like:  \"%s\"."), P(G.tune));
          G.u.uevent.uheard_tune = (G.u.uevent.uheard_tune + 1 >>> 0) & 3;
          break;
        }
      }
    case 2:
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await You(S("are surrounded by %s glow."), await an(hcolor(G.c_color_names.c_golden)));
      }
      if (G.u.ulevel < G.u.ulevelmax) {
        G.u.ulevelmax -= 1;
        await pluslvl(FALSE);
      } else {
        G.u.uhpmax += 5;
        if (G.u.umonnum !== G.u.umonster) {
          G.u.mhmax += 5;
        }
      }
      G.u.uhp = G.u.uhpmax;
      if (G.u.umonnum !== G.u.umonster) {
        G.u.mh = G.u.mhmax;
      }
      if (G.u.acurr.a[A_STR] < G.u.amax.a[A_STR]) {
        G.u.acurr.a[A_STR] = G.u.amax.a[A_STR];
        G.context.botl = 1;
        await encumber_msg();
      }
      if (G.u.uhunger < 900) {
        await init_uhunger();
      }
      if (G.u.uluck < 0) {
        G.u.uluck = 0;
      }
      G.u.ucreamed = 0;
      await make_blinded(0, TRUE);
      G.context.botl = 1;
      break;
    case 4:
      {
        let otmp = null;
        let any = 0;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await You_feel(S("the power of %s."), await u_gname());
        } else {
          await You(S("are surrounded by %s aura."), await an(hcolor(G.c_color_names.c_light_blue)));
        }
        for (otmp = G.invent; otmp; otmp = otmp.nobj) {
          if (otmp.cursed | 0 && (otmp !== G.uarmh || G.uarmh.otyp !== HELM_OF_OPPOSITE_ALIGNMENT)) {
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await pline(S("%s %s."), await Yobjnam2(otmp, S("softly glow")), hcolor(G.c_color_names.c_amber));
              G.iflags.last_msg = PLNMSG_OBJ_GLOWS;
              otmp.bknown = 1;
              ++any;
            }
            await uncurse(otmp);
          }
        }
        if (any) {
          update_inventory();
        }
        break;
      }
    case 5:
      {
        await godvoice(G.u.ualign.type, S("Thou hast pleased me with thy progress,"));
        if (!(G.u.uprops[TELEPAT].intrinsic & INTRINSIC)) {
          ($t1 = G.u.uprops[TELEPAT], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
          await pline(P(pleased$msg), S("Telepathy"));
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await see_monsters();
          }
        } else if (!(G.u.uprops[FAST].intrinsic & INTRINSIC)) {
          ($t2 = G.u.uprops[FAST], $t2.intrinsic = $t2.intrinsic | FROMOUTSIDE);
          await pline(P(pleased$msg), S("Speed"));
        } else if (!(G.u.uprops[STEALTH].intrinsic & INTRINSIC)) {
          ($t3 = G.u.uprops[STEALTH], $t3.intrinsic = $t3.intrinsic | FROMOUTSIDE);
          await pline(P(pleased$msg), S("Stealth"));
        } else {
          if (!(G.u.uprops[PROTECTION].intrinsic & INTRINSIC)) {
            ($t4 = G.u.uprops[PROTECTION], $t4.intrinsic = $t4.intrinsic | FROMOUTSIDE);
            if (!G.u.ublessed) {
              G.u.ublessed = rn2(3) + 2;
            }
          } else {
            ++G.u.ublessed;
          }
          await pline(P(pleased$msg), S("my protection"));
        }
        await verbalize(S("Use it wisely in my name!"));
        break;
      }
    case 7:
    case 8:
      if (G.u.ualign.record >= PIOUS && !G.u.uevent.uhand_of_elbereth) {
        await gcrownu();
        break;
      }
    case 6:
      {
        let otmp = null;
        let sp_no = 0;
        let trycnt = G.u.ulevel + 1;
        otmp = await mkobj(SPBOOK_CLASS, TRUE);
        while (--trycnt > 0) {
          if (otmp.otyp !== SPE_BLANK_PAPER) {
            for (sp_no = 0; sp_no < MAXSPELL; ++sp_no) {
              if (G.spl_book[sp_no].sp_id === otmp.otyp) {
                break;
              }
            }
            if (sp_no === MAXSPELL && !(G.u.weapon_skills[spell_skilltype(otmp.otyp)].skill === P_ISRESTRICTED)) {
              break;
            }
          } else {
            if (!G.objects[SPE_BLANK_PAPER].oc_name_known || carrying(MAGIC_MARKER)) {
              break;
            }
          }
          otmp.otyp = rnd_class(G.bases[SPBOOK_CLASS], SPE_BLANK_PAPER) << 16 >> 16;
        }
        await bless(otmp);
        await at_your_feet(S("A spellbook"));
        await place_object(otmp, G.u.ux, G.u.uy);
        await newsym(G.u.ux, G.u.uy);
        break;
      }
    default:
      await impossible(S("Confused deity!"));
      break;
    }
  }
  G.u.ublesscnt = rnz(350);
  kick_on_butt = G.u.uevent.udemigod | 0 ? 1 : 0;
  if (G.u.uevent.uhand_of_elbereth) {
    ++kick_on_butt;
  }
  if (kick_on_butt) {
    G.u.ublesscnt += Math.imul(kick_on_butt, rnz(1000));
  }
  return;
}

async function water_prayer(bless_water: number): Promise<number> {
  let otmp = null;
  let changed = 0;
  let other = FALSE;
  let bc_known = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) << 24 >> 24;
  for (otmp = G.level.objects[G.u.ux][G.u.uy]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.otyp === POT_WATER && (bless_water ? !otmp.blessed ? 1 : 0 : !otmp.cursed ? 1 : 0)) {
      otmp.blessed = (bless_water >>> 0) & 1;
      otmp.cursed = ((!bless_water ? 1 : 0) >>> 0) & 1;
      otmp.bknown = (bc_known >>> 0) & 1;
      changed += otmp.quan;
    } else if (otmp.oclass === POTION_CLASS) {
      other = TRUE;
    }
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && changed) {
    await pline(S("%s potion%s on the altar glow%s %s for a moment."), other && changed > 1 ? S("Some of the") : other ? S("One of the") : S("The"), other || changed > 1 ? S("s") : S(""), changed > 1 ? S("") : S("s"), bless_water ? hcolor(G.c_color_names.c_light_blue) : hcolor(G.c_color_names.c_black));
  }
  return (changed > 0 ? 1 : 0) << 24 >> 24;
}

async function godvoice(g_align: number, words: Ptr | null): Promise<void> {
  let quot = S("");
  if (words) {
    quot = S("\"");
  } else {
    words = S("");
  }
  await pline_The(S("voice of %s %s: %s%s%s"), await align_gname(g_align), godvoices[rn2(Math.trunc(32 / 8) | 0)], quot, words, quot);
}

async function gods_angry(g_align: number): Promise<void> {
  await godvoice(g_align, S("Thou hast angered me."));
}

async function gods_upset(g_align: number): Promise<void> {
  if (g_align === G.u.ualign.type) {
    ++G.u.ugangr;
  } else if (G.u.ugangr) {
    --G.u.ugangr;
  }
  await angrygods(g_align);
}

async function consume_offering(otmp: struct_obj | null): Promise<void> {
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    switch (rn2(3)) {
    case 0:
      await Your(S("sacrifice sprouts wings and a propeller and roars away!"));
      break;
    case 1:
      await Your(S("sacrifice puffs up, swelling bigger and bigger, and pops!"));
      break;
    case 2:
      await Your(S("sacrifice collapses into a cloud of dancing particles and fades away!"));
      break;
    }
  } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && G.u.ualign.type === A_LAWFUL) {
    await Your(S("sacrifice disappears!"));
  } else {
    await Your(S("sacrifice is consumed in a %s!"), G.u.ualign.type === A_LAWFUL ? S("flash of light") : S("burst of flame"));
  }
  if (otmp.where === 3) {
    await useup(otmp);
  } else {
    await useupf(otmp, 1);
  }
  await exercise(A_WIS, TRUE);
}

export async function dosacrifice(): Promise<number> {
  let $t1: any, $t2: any;
  let $g = 0;
  let otmp = null;
  let value = 0;
  let pm = 0;
  let highaltar = 0;
  let altaralign = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      value = 0;
      altaralign = (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) ? -128 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) - 2) << 24 >> 24;
      if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) || G.u.uswallow | 0) {
        await You(S("are not standing on an altar."));
        return 0;
      }
      highaltar = (((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) && ($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & AM_SHRINE ? 1 : 0) << 24 >> 24;
      otmp = await floorfood(S("sacrifice"), 1);
      if (!otmp) {
        return 0;
      }
      if (otmp.otyp === CORPSE) {
        let ptr = $sat(G.mons, otmp.corpsenm);
        let mtmp = null;
        ++G.u.uconduct.gnostic;
        await feel_cockatrice(otmp, TRUE);
        if (await rider_corpse_revival(otmp, FALSE)) {
          return 1;
        }
        if (otmp.corpsenm === PM_ACID_BLOB || G.monstermoves <= await peek_at_iced_corpse_age(otmp) + 50) {
          value = G.mons[otmp.corpsenm].difficulty + 1;
          if (otmp.oeaten) {
            value = await eaten_stat(value, otmp);
          }
        }
        if ((ptr.mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0) {
          if ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0) {
            await You(S("find the idea very satisfying."));
            await exercise(A_WIS, TRUE);
          } else if (G.u.ualign.type !== A_CHAOTIC) {
            await pline(S("You'll regret this infamous offense!"));
            await exercise(A_WIS, FALSE);
          }
          if (highaltar && (altaralign !== A_CHAOTIC || G.u.ualign.type !== A_CHAOTIC)) {
            { $g = 1; continue $L; }
          } else if (altaralign !== A_CHAOTIC && altaralign !== A_NONE) {
            await pline_The(S("altar is stained with %s blood."), G.urace.adj);
            $at2(G.level.locations, G.u.ux, G.u.uy).flags = (AM_CHAOTIC) & 31;
            await angry_priest();
          } else {
            let dmon = null;
            let demonless_msg = null;
            if (altaralign === A_CHAOTIC && G.u.ualign.type !== A_CHAOTIC) {
              await pline(S("The blood floods the altar, which vanishes in %s cloud!"), await an(hcolor(G.c_color_names.c_black)));
              $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM;
              $at2(G.level.locations, G.u.ux, G.u.uy).flags = 0;
              await newsym(G.u.ux, G.u.uy);
              await angry_priest();
              demonless_msg = S("cloud dissipates");
            } else {
              await pline_The(S("blood covers the altar!"));
              change_luck(altaralign === A_NONE ? -2 : 2);
              demonless_msg = S("blood coagulates");
            }
            if ((pm = await dlord(altaralign)) !== NON_PM && !!(dmon = await makemon($sat(G.mons, pm), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
              let dbuf = new Int8Array(256);
              strcpy(P(dbuf), await a_monnam(dmon));
              if (!strncmpi(P(dbuf), S("it"), -1)) {
                strcpy(P(dbuf), S("something dreadful"));
              } else {
                dmon.mstrategy = (dmon.mstrategy & ~STRAT_APPEARMSG >>> 0) >>> 0;
              }
              await You(S("have summoned %s!"), P(dbuf));
              if (sgn(G.u.ualign.type) === sgn(dmon.data.maligntyp)) {
                dmon.mpeaceful = (TRUE) & 1;
              }
              await You(S("are terrified, and unable to move."));
              nomul(-3);
              G.multi_reason = S("being terrified of a demon");
              G.nomovemsg = null;
            } else {
              await pline_The(S("%s."), demonless_msg);
            }
          }
          if (G.u.ualign.type !== A_CHAOTIC) {
            adjalign(-5);
            G.u.ugangr += 3;
            await adjattrib(A_WIS, -1, TRUE);
            if (!In_hell(G.u.uz)) {
              await angrygods(G.u.ualign.type);
            }
            change_luck(-5);
          } else {
            adjalign(5);
          }
          if (otmp.where === 3) {
            await useup(otmp);
          } else {
            await useupf(otmp, 1);
          }
          return 1;
        } else if (otmp.oextra && otmp.oextra.omonst && !!(mtmp = await get_mtraits(otmp, FALSE)) && mtmp.mtame) {
          await pline(S("So this is how you repay loyalty?"));
          adjalign(-3);
          value = -1;
          ($t1 = G.u.uprops[AGGRAVATE_MONSTER], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
        } else if ((ptr.mflags2 & 2) >>> 0 !== 0) {
          if (G.u.ualign.type !== A_CHAOTIC) {
            value += 1;
          }
        } else if (ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0) {
          let unicalign = sgn(ptr.maligntyp);
          if (unicalign === altaralign) {
            await pline(S("Such an action is an insult to %s!"), unicalign === A_CHAOTIC ? S("chaos") : unicalign ? S("law") : S("balance"));
            await adjattrib(A_WIS, -1, TRUE);
            value = -5;
          } else if (G.u.ualign.type === altaralign) {
            if (G.u.ualign.record < 10 + Math.trunc(G.moves / 200)) {
              await You_feel(S("appropriately %s."), align_str(G.u.ualign.type));
            } else {
              await You_feel(S("you are thoroughly on the right path."));
            }
            adjalign(5);
            value += 3;
          } else if (unicalign === G.u.ualign.type) {
            G.u.ualign.record = -1;
            value = 1;
          } else {
            value += 3;
          }
        }
      }
      if (!(otmp.otyp === AMULET_OF_YENDOR)) { $g = 3; continue $L; }
      if (!!highaltar) { $g = 5; continue $L; }
    case 2: // too_soon
      if (altaralign === A_NONE && In_hell(G.u.uz)) {
        await gods_upset(A_NONE);
      } else {
        await You_feel(S("%s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("homesick") : altaralign === G.u.ualign.type ? S("an urge to return to the surface") : S("ashamed"));
      }
      return 1;
      { $g = 4; continue $L; }
    case 5:
      {
        if (G.uamul === otmp) {
          await Amulet_off();
        }
        G.u.uevent.ascended = 1;
        if (otmp.where === 3) {
          await useup(otmp);
        } else {
          await useupf(otmp, 1);
        }
        await You(S("offer the Amulet of Yendor to %s..."), await a_gname());
        if (altaralign === A_NONE) {
          if (G.u.ualign.record > -99) {
            G.u.ualign.record = -99;
          }
          await pline(S("%s shrugs and retains dominion over %s,"), Moloch, await u_gname());
          await pline(S("then mercilessly snuffs out your life."));
          sprintf(P(G.killer.name), S("%s indifference"), s_suffix(Moloch));
          G.killer.format = KILLED_BY;
          await done(DIED);
          await pline(S("%s snarls and tries again..."), Moloch);
          await fry_by_god(A_NONE, TRUE);
          await pline(P(dosacrifice$cloud_of_smoke), hcolor(G.c_color_names.c_black));
          await done(ESCAPED);
        } else if (G.u.ualign.type !== altaralign) {
          adjalign(-99);
          await pline(S("%s accepts your gift, and gains dominion over %s..."), await a_gname(), await u_gname());
          await pline(S("%s is enraged..."), await u_gname());
          await pline(S("Fortunately, %s permits you to live..."), await a_gname());
          await pline(P(dosacrifice$cloud_of_smoke), hcolor(G.c_color_names.c_orange));
          await done(ESCAPED);
        } else {
          adjalign(10);
          G.u.uachieve.ascended = 1;
          await pline(S("An invisible choir sings, and you are bathed in radiance..."));
          await godvoice(altaralign, S("Mortal, thou hast done well!"));
          await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
          await verbalize(S("In return for thy service, I grant thee the gift of Immortality!"));
          await You(S("ascend to the status of Demigod%s..."), G.flags.female ? S("dess") : S(""));
          await done(ASCENDED);
        }
      }
    case 4:
    case 3:
      if (otmp.otyp === FAKE_AMULET_OF_YENDOR) {
        if (!highaltar && !otmp.known) {
          { $g = 2; continue $L; }
        }
        await You_hear(S("a nearby thunderclap."));
        if (!otmp.known) {
          await You(S("realize you have made a %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("boo-boo") : S("mistake"));
          otmp.known = (TRUE) & 1;
          change_luck(-1);
          return 1;
        } else {
          if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
            await pline(S("Oh, no."));
          }
          change_luck(-3);
          adjalign(-1);
          G.u.ugangr += 3;
          value = -3;
        }
      }
      if (value === 0) {
        await pline(S("%s"), G.c_common_strings.c_nothing_happens);
        return 1;
      }
      if (!(altaralign !== G.u.ualign.type && highaltar)) { $g = 7; continue $L; }
    case 1: // desecrate_high_altar
      await You_feel(S("the air around you grow charged..."));
      await pline(S("Suddenly, you realize that %s has noticed you..."), await a_gname());
      await godvoice(altaralign, S("So, mortal!  You dare desecrate my High Temple!"));
      await god_zaps_you(altaralign);
      { $g = 6; continue $L; }
    case 7:
      if (value < 0) {
        await gods_upset(altaralign);
      } else {
        let saved_anger = G.u.ugangr;
        let saved_cnt = G.u.ublesscnt;
        let saved_luck = G.u.uluck;
        if (G.u.ualign.type !== altaralign) {
          if (G.u.ualign.record < 0 || altaralign === A_NONE && In_hell(G.u.uz)) {
            if (G.u.ualignbase[A_CURRENT] === G.u.ualignbase[A_ORIGINAL] && altaralign !== A_NONE) {
              await You(S("have a strong feeling that %s is angry..."), await u_gname());
              await consume_offering(otmp);
              await pline(S("%s accepts your allegiance."), await a_gname());
              await uchangealign(altaralign, 0);
              change_luck(-3);
              G.u.ublesscnt += 300;
            } else {
              G.u.ugangr += 3;
              adjalign(-5);
              await pline(S("%s rejects your sacrifice!"), await a_gname());
              await godvoice(altaralign, S("Suffer, infidel!"));
              change_luck(-5);
              await adjattrib(A_WIS, -2, TRUE);
              if (!In_hell(G.u.uz)) {
                await angrygods(G.u.ualign.type);
              }
            }
            return 1;
          } else {
            await consume_offering(otmp);
            await You(S("sense a conflict between %s and %s."), await u_gname(), await a_gname());
            if (rn2(8 + G.u.ulevel) > 5) {
              let pri = null;
              await You_feel(S("the power of %s increase."), await u_gname());
              await exercise(A_WIS, TRUE);
              change_luck(1);
              ($t2 = $at2(G.level.locations, G.u.ux, G.u.uy), $t2.flags = ((($t2.flags | 0) & AM_SHRINE) >>> 0) & 31);
              $at2(G.level.locations, G.u.ux, G.u.uy).flags = (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0 | (G.u.ualign.type === -128 ? 0 : G.u.ualign.type === 1 ? 4 : G.u.ualign.type + 2)) >>> 0) & 31;
              if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                await pline_The(S("altar glows %s."), hcolor(G.u.ualign.type === A_LAWFUL ? G.c_color_names.c_white : G.u.ualign.type ? G.c_color_names.c_black : S("gray")));
              }
              if (rnl(G.u.ulevel) > 6 && G.u.ualign.record > 0 && rnd(G.u.ualign.record) > Math.trunc(3 * (10 + Math.trunc(G.moves / 200)) / 4)) {
                await summon_minion(altaralign, TRUE);
              }
              if ((pri = findpriest(temple_occupied(P(G.u.urooms)))) && !p_coaligned(pri)) {
                await angry_priest();
              }
            } else {
              await pline(S("Unluckily, you feel the power of %s decrease."), await u_gname());
              change_luck(-1);
              await exercise(A_WIS, FALSE);
              if (rnl(G.u.ulevel) > 6 && G.u.ualign.record > 0 && rnd(G.u.ualign.record) > Math.trunc(7 * (10 + Math.trunc(G.moves / 200)) / 8)) {
                await summon_minion(altaralign, TRUE);
              }
            }
            return 1;
          }
        }
        await consume_offering(otmp);
        if (G.u.ugangr) {
          G.u.ugangr -= Math.imul(value, G.u.ualign.type === A_CHAOTIC ? 2 : 3) / MAXVALUE | 0;
          if (G.u.ugangr < 0) {
            G.u.ugangr = 0;
          }
          if (G.u.ugangr !== saved_anger) {
            if (G.u.ugangr) {
              await pline(S("%s seems %s."), await u_gname(), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("groovy") : S("slightly mollified"));
              if (G.u.uluck < 0) {
                change_luck(1);
              }
            } else {
              await pline(S("%s seems %s."), await u_gname(), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("cosmic (not a new fact)") : S("mollified"));
              if (G.u.uluck < 0) {
                G.u.uluck = 0;
              }
            }
          } else {
            if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
              await pline_The(S("gods seem tall."));
            } else {
              await You(S("have a feeling of inadequacy."));
            }
          }
        } else if (G.u.ualign.record < 0) {
          if (value > MAXVALUE) {
            value = MAXVALUE;
          }
          if (value > -G.u.ualign.record) {
            value = -G.u.ualign.record;
          }
          adjalign(value);
          await You_feel(S("partially absolved."));
        } else if (G.u.ublesscnt > 0) {
          G.u.ublesscnt -= Math.imul(value, G.u.ualign.type === A_CHAOTIC ? 500 : 300) / MAXVALUE | 0;
          if (G.u.ublesscnt < 0) {
            G.u.ublesscnt = 0;
          }
          if (G.u.ublesscnt !== saved_cnt) {
            if (G.u.ublesscnt) {
              if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
                await You(S("realize that the gods are not like you and I."));
              } else {
                await You(S("have a hopeful feeling."));
              }
              if (G.u.uluck < 0) {
                change_luck(1);
              }
            } else {
              if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
                await pline(S("Overall, there is a smell of fried onions."));
              } else {
                await You(S("have a feeling of reconciliation."));
              }
              if (G.u.uluck < 0) {
                G.u.uluck = 0;
              }
            }
          }
        } else {
          let nartifacts = nartifact_exist();
          if (G.u.ulevel > 2 && G.u.uluck >= 0 && !rn2(10 + Math.imul(2 * G.u.ugifts, nartifacts))) {
            otmp = await mk_artifact(null, (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) ? -128 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) - 2) << 24 >> 24);
            if (otmp) {
              if (otmp.spe < 0) {
                otmp.spe = 0;
              }
              if (otmp.cursed) {
                await uncurse(otmp);
              }
              otmp.oerodeproof = (TRUE) & 1;
              await at_your_feet(S("An object"));
              await dropy(otmp);
              await godvoice(G.u.ualign.type, S("Use my gift wisely!"));
              ++G.u.ugifts;
              G.u.ublesscnt = rnz(300 + 50 * nartifacts);
              await exercise(A_WIS, TRUE);
              unrestrict_weapon_skill(weapon_type(otmp));
              if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                otmp.dknown = 1;
                await discover_object(otmp.otyp, 1, 1);
                await discover_artifact(otmp.oartifact);
              }
              return 1;
            }
          }
          change_luck(Math.imul(value, LUCKMAX) / (MAXVALUE * 2) | 0);
          if (G.u.uluck < 0) {
            G.u.uluck = 0;
          }
          if (G.u.uluck !== saved_luck) {
            if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
              await You(S("think %s brushed your %s."), G.c_common_strings.c_something, body_part(FOOT));
            } else {
              await You(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("see crabgrass at your %s.  A funny thing in a dungeon.") : S("glimpse a four-leaf clover at your %s."), await makeplural(body_part(FOOT)));
            }
          }
        }
      }
    case 6:
      return 1;
    }
    break;
  }
}

export async function can_pray(praying: number): Promise<number> {
  let alignment = 0;
  p_aligntyp = ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR ? (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) ? -128 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 7) - 2) << 24 >> 24 : G.u.ualign.type) << 24 >> 24;
  p_trouble = await in_trouble();
  if ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0 && p_aligntyp !== A_CHAOTIC) {
    if (praying) {
      await pline_The(S("very idea of praying to a %s god is repugnant to you."), p_aligntyp ? S("lawful") : S("neutral"));
    }
    return FALSE;
  }
  if (praying) {
    await You(S("begin praying to %s."), await align_gname(p_aligntyp));
  }
  if (G.u.ualign.type && G.u.ualign.type === -p_aligntyp) {
    alignment = -G.u.ualign.record;
  } else if (G.u.ualign.type !== p_aligntyp) {
    alignment = G.u.ualign.record / 2 | 0;
  } else {
    alignment = G.u.ualign.record;
  }
  if (p_trouble > 0 ? G.u.ublesscnt > 200 ? 1 : 0 : p_trouble < 0 ? G.u.ublesscnt > 100 ? 1 : 0 : G.u.ublesscnt > 0 ? 1 : 0) {
    p_type = 0;
  } else if (G.u.uluck + G.u.moreluck < 0 || G.u.ugangr || alignment < 0) {
    p_type = 1;
  } else {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR && G.u.ualign.type !== p_aligntyp) {
      p_type = 2;
    } else {
      p_type = 3;
    }
  }
  if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 && !In_hell(G.u.uz) && (p_aligntyp === A_LAWFUL || p_aligntyp === A_NEUTRAL && !rn2(10))) {
    p_type = -1;
  }
  return (!praying ? (p_type === 3 && !In_hell(G.u.uz) ? 1 : 0) << 24 >> 24 : TRUE) << 24 >> 24;
}

export async function dopray(): Promise<number> {
  if ((G.flags.paranoia_bits & 32) >>> 0 !== 0 && await yn_function(S("Are you sure you want to pray?"), P(G.ynchars), 110) !== 121) {
    return 0;
  }
  ++G.u.uconduct.gnostic;
  if (!await can_pray(TRUE)) {
    return 0;
  }
  if (G.flags.debug && p_type >= 0) {
    if (await yn_function(S("Force the gods to be pleased?"), P(G.ynchars), 110) === 121) {
      G.u.ublesscnt = 0;
      if (G.u.uluck < 0) {
        G.u.uluck = 0;
      }
      if (G.u.ualign.record <= 0) {
        G.u.ualign.record = 1;
      }
      G.u.ugangr = 0;
      if (p_type < 2) {
        p_type = 3;
      }
    }
  }
  nomul(-3);
  G.multi_reason = S("praying");
  G.nomovemsg = S("You finish your prayer.");
  G.afternmv = prayer_done;
  if (p_type === 3 && !In_hell(G.u.uz)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await You(S("are surrounded by a shimmering light."));
    }
    G.u.uinvulnerable = (TRUE) & 1;
  }
  return 1;
}

async function prayer_done(): Promise<number> {
  let alignment = p_aligntyp;
  G.u.uinvulnerable = (FALSE) & 1;
  if (p_type === -1) {
    await godvoice(alignment, alignment === A_LAWFUL ? S("Vile creature, thou durst call upon me?") : S("Walk no more, perversion of nature!"));
    await You_feel(S("like you are falling apart."));
    await rehumanize();
    await losehp(rnd(20), S("residual undead turning effect"), KILLED_BY_AN);
    await exercise(A_CON, FALSE);
    return 1;
  }
  if (In_hell(G.u.uz)) {
    await pline(S("Since you are in Gehennom, %s can't help you."), await align_gname(alignment));
    if (G.u.ualign.record <= 0 || rnl(G.u.ualign.record)) {
      await angrygods(G.u.ualign.type);
    }
    return 0;
  }
  if (p_type === 0) {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR && G.u.ualign.type !== alignment) {
      await water_prayer(FALSE);
    }
    G.u.ublesscnt += rnz(250);
    change_luck(-3);
    await gods_upset(G.u.ualign.type);
  } else if (p_type === 1) {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR && G.u.ualign.type !== alignment) {
      await water_prayer(FALSE);
    }
    await angrygods(G.u.ualign.type);
  } else if (p_type === 2) {
    if (await water_prayer(FALSE)) {
      G.u.ublesscnt += rnz(250);
      change_luck(-3);
      await gods_upset(G.u.ualign.type);
    } else {
      await pleased(alignment);
    }
  } else {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) {
      await water_prayer(TRUE);
    }
    await pleased(alignment);
  }
  return 1;
}

export async function doturn(): Promise<number> {
  let mtmp = null;
  let mtmp2 = null;
  let Gname = null;
  let once = 0;
  let range = 0;
  let xlev = 0;
  if (!(G.urole.malenum === 335) && !(G.urole.malenum === 333)) {
    let sp_no = 0;
    for (sp_no = 0; sp_no < MAXSPELL; ++sp_no) {
      if (G.spl_book[sp_no].sp_id === NO_SPELL) {
        break;
      } else if (G.spl_book[sp_no].sp_id === SPE_TURN_UNDEAD) {
        return await spelleffects(sp_no, FALSE);
      }
    }
    await You(S("don't know how to turn undead!"));
    return 0;
  }
  ++G.u.uconduct.gnostic;
  Gname = await halu_gname(G.u.ualign.type);
  if (!can_chant(G.youmonst)) {
    await You(S("are %s upon %s to turn aside evilness."), G.u.uprops[STRANGLED].intrinsic ? S("not able to call") : S("incapable of calling"), Gname);
    return G.u.uconduct.gnostic === 1 ? 1 : 0;
  }
  if (G.u.ualign.type !== A_CHAOTIC && ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0 || (G.youmonst.data.mflags2 & 2) >>> 0 !== 0) || G.u.ugangr > 6) {
    await pline(S("For some reason, %s seems to ignore you."), Gname);
    await aggravate();
    await exercise(A_WIS, FALSE);
    return 1;
  }
  if (In_hell(G.u.uz)) {
    await pline(S("Since you are in Gehennom, %s %s help you."), Gname, !strcmp(Gname, Moloch) ? S("won't") : S("can't"));
    await aggravate();
    return 1;
  }
  await pline(S("Calling upon %s, you chant an arcane formula."), Gname);
  await exercise(A_WIS, TRUE);
  range = BOLT_LIM + (G.u.ulevel / 5 | 0);
  range = Math.imul(range, range);
  once = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
    mtmp2 = mtmp.nmon;
    if (mtmp.mhp < 1) {
      continue;
    }
    if (!($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) || dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > range) {
      continue;
    }
    if (!mtmp.mpeaceful && ((mtmp.data.mflags2 & 2) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) || (mtmp.data.mflags2 & 256) >>> 0 !== 0 && G.u.ulevel > (MAXULEV / 2 | 0))) {
      mtmp.msleeping = 0;
      if (G.u.uprops[CONFUSION].intrinsic) {
        if (!once++) {
          await pline(S("Unfortunately, your voice falters."));
        }
        mtmp.mflee = 0;
        mtmp.mfrozen = 0;
        mtmp.mcanmove = 1;
      } else if (!await resist(mtmp, 0, 0, TELL)) {
        xlev = 6;
        switch (mtmp.data.mlet) {
        case S_LICH:
          xlev += 2;
        case S_GHOST:
          xlev += 2;
        case S_VAMPIRE:
          xlev += 2;
        case S_WRAITH:
          xlev += 2;
        case S_MUMMY:
          xlev += 2;
        case S_ZOMBIE:
          if (G.u.ulevel >= xlev && !await resist(mtmp, 0, 0, NOTELL)) {
            if (G.u.ualign.type === A_CHAOTIC) {
              mtmp.mpeaceful = 1;
              set_malign(mtmp);
            } else {
              await killed(mtmp);
            }
            break;
          }
        default:
          await monflee(mtmp, 0, FALSE, TRUE);
          break;
        }
      }
    }
  }
  nomul(-(5 - ((G.u.ulevel - 1) / 6 | 0)));
  G.multi_reason = S("trying to turn the monsters");
  G.nomovemsg = G.c_common_strings.c_You_can_move_again;
  return 1;
}

export async function a_gname(): Promise<Ptr | null> {
  return await a_gname_at(G.u.ux, G.u.uy);
}

export async function a_gname_at(x: number, y: number): Promise<Ptr | null> {
  if (!($at2(G.level.locations, x, y).typ === ALTAR)) {
    return null;
  }
  return await align_gname((!(($at2(G.level.locations, x, y).flags | 0) & 7) ? -128 : (($at2(G.level.locations, x, y).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, x, y).flags | 0) & 7) - 2) << 24 >> 24);
}

export async function u_gname(): Promise<Ptr | null> {
  return await align_gname(G.u.ualign.type);
}

export async function align_gname(alignment: number): Promise<Ptr | null> {
  let gnam = null;
  switch (alignment) {
  case -128:
    gnam = Moloch;
    break;
  case 1:
    gnam = G.urole.lgod;
    break;
  case 0:
    gnam = G.urole.ngod;
    break;
  case -1:
    gnam = G.urole.cgod;
    break;
  default:
    await impossible(S("unknown alignment."));
    gnam = S("someone");
    break;
  }
  if (gnam.a[gnam.o] === 95) {
    gnam = gnam.add(1);
  }
  return gnam;
}

export async function halu_gname(alignment: number): Promise<Ptr | null> {
  let gnam = null;
  let which = 0;
  if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
    return await align_gname(alignment);
  }
  do {
    which = randrole(TRUE);
  } while (!G.roles[which].lgod);
  switch (rn2_on_display_rng(9)) {
  case 0:
  case 1:
    gnam = G.roles[which].lgod;
    break;
  case 2:
  case 3:
    gnam = G.roles[which].ngod;
    break;
  case 4:
  case 5:
    gnam = G.roles[which].cgod;
    break;
  case 6:
  case 7:
    gnam = hallu_gods[rn2_on_display_rng(Math.trunc(112 / 8) | 0)];
    break;
  case 8:
    gnam = Moloch;
    break;
  default:
    await impossible(S("rn2 broken in halu_gname?!?"));
  }
  if (!gnam) {
    await impossible(S("No random god name?"));
    gnam = S("your Friend the Computer");
  }
  if (gnam.a[gnam.o] === 95) {
    gnam = gnam.add(1);
  }
  return gnam;
}

export function align_gtitle(alignment: number): Ptr | null {
  let gnam = null;
  let result = S("god");
  switch (alignment) {
  case 1:
    gnam = G.urole.lgod;
    break;
  case 0:
    gnam = G.urole.ngod;
    break;
  case -1:
    gnam = G.urole.cgod;
    break;
  default:
    gnam = null;
    break;
  }
  if (gnam && gnam.a[gnam.o] === 95) {
    result = S("goddess");
  }
  return result;
}

export async function altar_wrath(x: number, y: number): Promise<void> {
  let altaralign = (!(($at2(G.level.locations, x, y).flags | 0) & 7) ? -128 : (($at2(G.level.locations, x, y).flags | 0) & 7) === 4 ? 1 : (($at2(G.level.locations, x, y).flags | 0) & 7) - 2) << 24 >> 24;
  if (G.u.ualign.type === altaralign && G.u.ualign.record > -rn2(4)) {
    await godvoice(altaralign, S("How darest thou desecrate my altar!"));
    await adjattrib(A_WIS, -1, FALSE);
    --G.u.ualign.record;
  } else {
    await pline(S("%s %s%s:"), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("A voice (could it be") : S("Despite your deafness, you seem to hear"), await align_gname(altaralign), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("?) whispers") : S(" say"));
    await verbalize(S("Thou shalt pay, infidel!"));
    if (G.u.uluck + G.u.moreluck > -5 && rn2(G.u.uluck + G.u.moreluck + 6)) {
      change_luck(rn2(20) ? -1 : -2);
    }
  }
}

function blocked_boulder(dx: number, dy: number): number {
  let otmp = null;
  let nx = 0;
  let ny = 0;
  let count = 0;
  for (otmp = G.level.objects[G.u.ux + dx][G.u.uy + dy]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.otyp === BOULDER) {
      count += otmp.quan;
    }
  }
  nx = G.u.ux + 2 * dx, ny = G.u.uy + 2 * dy;
  switch (count) {
  case 0:
    return FALSE;
  case 1:
    break;
  case 2:
    if (is_pool_or_lava(nx, ny)) {
      break;
    }
  default:
    return TRUE;
  }
  if (dx && dy && G.level.flags.sokoban_rules | 0) {
    return TRUE;
  }
  if (!isok(nx, ny)) {
    return TRUE;
  }
  if ($at2(G.level.locations, nx, ny).typ < POOL) {
    return TRUE;
  }
  if (sobj_at(BOULDER, nx, ny)) {
    return TRUE;
  }
  return FALSE;
}

export function $init(): void {
  Moloch = S("Moloch");
  godvoices = [S("booms out"),
S("thunders"),
S("rings out"),
S("booms")];
  p_aligntyp = 0;
  p_trouble = 0;
  p_type = 0;
  hallu_gods = [S("the Flying Spaghetti Monster"),
S("Eris"),
S("the Martians"),
S("Xom"),
S("AnDoR dRaKoN"),
S("the Central Bank of Yendor"),
S("Tooth Fairy"),
S("Om"),
S("Yawgmoth"),
S("Morgoth"),
S("Cthulhu"),
S("the Ori"),
S("destiny"),
S("your Friend the Computer")];
  fix_worst_trouble$leftglow = $cs("Your left ring softly glows", 28);
  fix_worst_trouble$rightglow = $cs("Your right ring softly glows", 29);
  pleased$msg = $cs("\"and thus I grant thee the gift of %s!\"", 40);
  dosacrifice$cloud_of_smoke = $cs("A cloud of %s smoke surrounds you...", 37);
}
