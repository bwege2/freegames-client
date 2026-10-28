// @ts-nocheck
// NetHack 3.6.7 read.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_lit } from './apply.ts';
import { artifact_light } from './artifact.ts';
import { adjalign, exercise } from './attrib.ts';
import { move_bc, placebc, set_bc } from './ball.ts';
import { isok, yn_function } from './cmd.ts';
import { is_pool } from './dbridge.ts';
import { cvt_sdoor_to_door, do_mapping, food_detect, gold_detect, trap_detect } from './detect.ts';
import { buried_ball_to_freedom } from './dig.ts';
import { docrt, flash_glyph_at, map_invisible, newsym, shieldeff, tmp_at } from './display.ts';
import { dropy, flooreffects } from './do.ts';
import { Monnam, docall, getpos, getpos_sethilite, hcolor, hliquid, mon_nam } from './do_name.ts';
import { Ring_gone, Ring_off, Ring_on, adj_abon, destroy_arm, some_armor } from './do_wear.ts';
import { tamedog } from './dog.ts';
import { forget_mapseen, has_ceiling, ledger_no, ledger_to_dnum, maxledgerno, on_level } from './dungeon.ts';
import { delayed_killer, done } from './end.ts';
import { ceiling, wipeout_text } from './engrave.ts';
import { more_experienced } from './exper.ts';
import { explode } from './explode.ts';
import { check_capacity, losehp } from './hack.ts';
import { dist2, lowc, mungspaces, s_suffix, sgn, strncmpi, strstri } from './hacklib.ts';
import { getobj, identify_pack, stackobj, update_inventory, useup } from './invent.ts';
import { snuff_light_source } from './light.ts';
import { readmail } from './mail.ts';
import { create_critters, makemon, mkclass, reset_rndmonst, rndmonst, set_malign } from './makemon.ts';
import { monster_census } from './minion.ts';
import { bcsign, bless, blessorcurse, costly_alteration, curse, dealloc_obj, mkobj, mksobj, obj_extract_self, place_object, uncurse, weight } from './mkobj.ts';
import { kill_genocided_monsters, killed, mondied, mongone, newcham, setmangry, wake_nearto, wakeup } from './mon.ts';
import { can_chant, monsndx, name_to_mon, name_to_monclass, pronoun_gender } from './mondata.ts';
import { closed_door, monflee } from './monmove.ts';
import { discover_object, undiscover_object } from './o_init.ts';
import { Tobjnam, Yname2, Yobjnam2, an, doname, erosion_matters, makeplural, otense, singular, suit_simple_name, the, xname } from './objnam.ts';
import { You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart, rehumanize, udeadinside } from './polyself.ts';
import { make_confused, make_stunned, strange_feeling } from './potion.ts';
import { quest_info } from './questpgr.ts';
import { create_gas_cloud } from './region.ts';
import { d, rn2, rnd } from './rnd.ts';
import { outrumor } from './rumors.ts';
import { alter_cost, make_happy_shk, obfree, shk_your } from './shk.ts';
import { losespells, study_book } from './spell.ts';
import { remove_worn_item } from './steal.ts';
import { can_saddle, put_saddle_on_mon } from './steed.ts';
import { level_tele, scrolltele } from './teleport.ts';
import { burn_away_slime, end_burn } from './timeout.ts';
import { sokoban_guilt } from './trap.ts';
import { light_hits_gremlin } from './uhitm.ts';
import { block_point, do_clear_area, does_block, unblock_point, vision_recalc } from './vision.ts';
import { dmgval } from './weapon.ts';
import { chwepon } from './wield.ts';
import { worm_known } from './worm.ts';
import { mon_set_minvis, setworn, which_armor } from './worn.ts';
import { lightdamage, resist } from './zap.ts';
import { struct__create_particular_data, struct_litmon, struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $ta, $u64, $wr, G, P, S, free, memset, rn2_on_display_rng, sprintf, strchr, strcmp, strcpy, strlen } from './rt/index.ts';
import { AIR, ALCHEMY_SMOCK, ALLOW_COUNT, ALL_CLASSES, ALL_MAP, ALL_SPELLS, ARMOR_CLASS, ARM_SHIELD, ART_ORB_OF_FATE, A_CON, A_STR, A_WIS, BALL_CLASS, BLACK_DRAGON_SCALES, BLACK_DRAGON_SCALE_MAIL, BLINDED, BOULDER, BRASS_LANTERN, BY_COOKIE, CANDY_BAR, CAN_OF_GREASE, CHAIN_CLASS, CLOUD, COIN_CLASS, COLNO, CONFUSION, CORNUTHAUM, COST_DECHNT, COST_DEGRD, COST_UNCHRG, COST_UNCURS, COULD_SEE, CREDIT_CARD, DEAF, DETECT_MONSTERS, DISP_BEAM, DISP_END, DOOR, EXPL_FIERY, FALSE, FIRE_RES, FORGOTTEN, FORTUNE_COOKIE, GEM_CLASS, GENOCIDED, GRAY_DRAGON_SCALES, GRAY_DRAGON_SCALE_MAIL, G_EXTINCT, G_GENO, G_GENOD, G_NOCORPSE, G_UNIQ, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, HEAD, HEAVY_IRON_BALL, HOLE, INFRAVISION, IN_SIGHT, IRON, IRON_BALL_W_INCR, KILLED_BY, KILLED_BY_AN, LEASH, LEFT_RING, LEG, LOADSTONE, LOW_PM, MAGIC_MARKER, MAXMCLASSES, MAX_ERODE, MITHRIL, MS_GUARDIAN, MS_LEADER, MS_NEMESIS, NODIR, NON_PM, NOTELL, NO_MINVENT, NO_MM_FLAGS, NUMMONS, NUM_OBJECTS, OIL_LAMP, ONTHRONE, PASSES_WALLS, PLAYER, PLNMSG_TOWER_OF_FLAME, PM_ACID_BLOB, PM_ALIGNED_PRIEST, PM_ANGEL, PM_BLACK_LIGHT, PM_DOPPELGANGER, PM_GREMLIN, PM_GUARD, PM_HIGH_PRIEST, PM_HUMAN_ZOMBIE, PM_LONG_WORM, PM_LONG_WORM_TAIL, PM_NINJA, PM_SHOPKEEPER, PM_STALKER, PM_YELLOW_LIGHT, POLYMORPH, POOL, POT_WATER, P_NONE, P_SLING, REALLY, RIGHT_RING, RING_CLASS, ROCK, ROOMOFFSET, ROWNO, SADDLE, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_FIRE, SCR_IDENTIFY, SCR_MAIL, SCR_REMOVE_CURSE, SCR_SCARE_MONSTER, SDOOR, SEE_INVIS, SHIELD_OF_REFLECTION, SILVER_DRAGON_SCALES, SILVER_DRAGON_SCALE_MAIL, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_IDENTIFY, SPE_NOVEL, STOMACH, STONE, STUNNED, S_EEL, S_GHOST, S_HUMAN, S_MIMIC, S_VORTEX, S_WORM_TAIL, S_goodpos, S_invisible, S_stone, TELEPAT, TIMEOUT, TOOL_CLASS, TRUE, TT_BURIEDBALL, T_SHIRT, UNCHANGING, VISITED, WAND_CLASS, WAN_WISHING, WARN_OF_MON, WEAPON_CLASS, W_ARM, W_ARMH, W_ART, W_ARTI, W_BALL, W_CHAIN, W_SADDLE } from './consts.ts';

let readable: any;
let all_count: any;
let gremlins: struct_litmon | null;
let tshirt_text$shirt_msgs: any;
let apron_text$apron_msgs: any;
let doread$card_msgs: any;
let doread$wrapper_msgs: any;

async function learnscrolltyp(scrolltyp: number): Promise<number> {
  if (!G.objects[scrolltyp].oc_name_known) {
    await discover_object(scrolltyp, 1, 1);
    await more_experienced(0, 10);
    return TRUE;
  } else {
    return FALSE;
  }
}

export async function learnscroll(sobj: struct_obj | null): Promise<void> {
  if (sobj.oclass !== SPBOOK_CLASS) {
    await learnscrolltyp(sobj.otyp);
  }
}

function erode_obj_text(otmp: struct_obj | null, buf: Ptr | null): Ptr | null {
  let erosion = (otmp.oeroded | 0) > (otmp.oeroded2 | 0) ? otmp.oeroded | 0 : otmp.oeroded2 | 0;
  if (erosion) {
    wipeout_text(buf, Math.trunc(strlen(buf) * $u64(erosion) / (2 * MAX_ERODE)) | 0, (otmp.o_id ^ G.ubirthday >>> 0) >>> 0);
  }
  return buf;
}

export function tshirt_text(tshirt: struct_obj | null, buf: Ptr | null): Ptr | null {
  strcpy(buf, tshirt_text$shirt_msgs[tshirt.o_id % ((Math.trunc(560 / 8) | 0) >>> 0)]);
  return erode_obj_text(tshirt, buf);
}

function apron_text(apron: struct_obj | null, buf: Ptr | null): Ptr | null {
  strcpy(buf, apron_text$apron_msgs[apron.o_id % ((Math.trunc(72 / 8) | 0) >>> 0)]);
  return erode_obj_text(apron, buf);
}

export async function doread(): Promise<number> {
  let scroll = null;
  let confused = 0;
  let nodisappear = 0;
  G.known = FALSE;
  if (await check_capacity(null)) {
    return 0;
  }
  scroll = await getobj(P(readable), S("read"));
  if (!scroll) {
    return 0;
  }
  if (scroll.otyp === FORTUNE_COOKIE) {
    if (G.flags.verbose) {
      await You(S("break up the cookie and throw away the pieces."));
    }
    await outrumor(bcsign(scroll), BY_COOKIE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      ++G.u.uconduct.literate;
    }
    await useup(scroll);
    return 1;
  } else if (scroll.otyp === T_SHIRT || scroll.otyp === ALCHEMY_SMOCK) {
    let buf = new Int8Array(256);
    let mesg = null;
    let endpunct = null;
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You_cant(S("feel any Braille writing."));
      return 0;
    }
    if (scroll.otyp === T_SHIRT && G.uarm && scroll === G.uarmu) {
      await pline(S("%s shirt is obscured by %s%s."), scroll.unpaid | 0 ? S("That") : S("Your"), await shk_your(P(buf), G.uarm), suit_simple_name(G.uarm));
      return 0;
    }
    ++G.u.uconduct.literate;
    mesg = scroll.otyp === T_SHIRT ? tshirt_text(scroll, P(buf)) : apron_text(scroll, P(buf));
    endpunct = S("");
    if (G.flags.verbose) {
      let ln = strlen(mesg) | 0;
      if (ln > 0 && !strchr(S(".!?"), mesg.a[mesg.o + (ln - 1)])) {
        endpunct = S(".");
      }
      await pline(S("It reads:"));
    }
    await pline(S("\"%s\"%s"), mesg, endpunct);
    return 1;
  } else if (scroll.otyp === CREDIT_CARD) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You(S("feel the embossed numbers:"));
    } else {
      if (G.flags.verbose) {
        await pline(S("It reads:"));
      }
      await pline(S("\"%s\""), scroll.oartifact ? doread$card_msgs[(Math.trunc(112 / 8) | 0) - 1] : doread$card_msgs[scroll.o_id % ((Math.trunc(112 / 8) | 0) - 1 >>> 0)]);
    }
    await pline(S("\"%d0%d %ld%d1 0%d%d0\"%s"), (scroll.o_id | 0) % 89 + 10, (scroll.o_id | 0) % 4, scroll.o_id * 499 % 899999 + 100000, (scroll.o_id | 0) % 10, !((scroll.o_id | 0) % 3) ? 1 : 0, (scroll.o_id | 0) * 7 % 10, G.flags.verbose || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S(".") : S(""));
    ++G.u.uconduct.literate;
    return 1;
  } else if (scroll.otyp === CAN_OF_GREASE) {
    await pline(S("This %s has no label."), await singular(scroll, xname));
    return 0;
  } else if (scroll.otyp === MAGIC_MARKER) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You_cant(S("feel any Braille writing."));
      return 0;
    }
    if (G.flags.verbose) {
      await pline(S("It reads:"));
    }
    await pline(S("\"Magic Marker(TM) Red Ink Marker Pen.  Water Soluble.\""));
    ++G.u.uconduct.literate;
    return 1;
  } else if (scroll.oclass === COIN_CLASS) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You(S("feel the embossed words:"));
    } else if (G.flags.verbose) {
      await You(S("read:"));
    }
    await pline(S("\"1 Zorkmid.  857 GUE.  In Frobs We Trust.\""));
    ++G.u.uconduct.literate;
    return 1;
  } else if (scroll.oartifact === ART_ORB_OF_FATE) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You(S("feel the engraved signature:"));
    } else {
      await pline(S("It is signed:"));
    }
    await pline(S("\"Odin.\""));
    ++G.u.uconduct.literate;
    return 1;
  } else if (scroll.otyp === CANDY_BAR) {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You_cant(S("feel any Braille writing."));
      return 0;
    }
    await pline(S("The wrapper reads: \"%s\"."), doread$wrapper_msgs[scroll.o_id % ((Math.trunc(96 / 8) | 0) >>> 0)]);
    ++G.u.uconduct.literate;
    return 1;
  } else if (scroll.oclass !== SCROLL_CLASS && scroll.oclass !== SPBOOK_CLASS) {
    await pline(G.c_common_strings.c_silly_thing_to, S("read"));
    return 0;
  } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && scroll.otyp !== SPE_BOOK_OF_THE_DEAD) {
    let what = null;
    if (scroll.oclass === SPBOOK_CLASS) {
      what = S("mystic runes");
    } else if (!scroll.dknown) {
      what = S("formula on the scroll");
    }
    if (what) {
      await pline(S("Being blind, you cannot read the %s."), what);
      return 0;
    }
  }
  confused = (G.u.uprops[CONFUSION].intrinsic !== 0 ? 1 : 0) << 24 >> 24;
  if (scroll.otyp === SCR_MAIL) {
    confused = FALSE;
    if (!G.u.uconduct.literate) {
      if (!scroll.spe && await yn_function(S("Reading mail will violate \"illiterate\" conduct.  Read anyway?"), P(G.ynchars), 110) !== 121) {
        return 0;
      }
    }
  }
  if (scroll.otyp !== SPE_BOOK_OF_THE_DEAD && scroll.otyp !== SPE_BLANK_PAPER && scroll.otyp !== SCR_BLANK_PAPER && scroll.otyp !== SPE_NOVEL) {
    ++G.u.uconduct.literate;
  }
  if (scroll.oclass === SPBOOK_CLASS) {
    return await study_book(scroll);
  }
  scroll.in_use = (TRUE) & 1;
  if (scroll.otyp !== SCR_BLANK_PAPER) {
    let silently = (!can_chant(G.youmonst) ? 1 : 0) << 24 >> 24;
    nodisappear = (scroll.otyp === SCR_FIRE || scroll.otyp === SCR_REMOVE_CURSE && scroll.cursed | 0 ? 1 : 0) << 24 >> 24;
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await pline(nodisappear ? S("You %s the formula on the scroll.") : S("As you %s the formula on it, the scroll disappears."), silently ? S("cogitate") : S("pronounce"));
    } else {
      await pline(nodisappear ? S("You read the scroll.") : S("As you read the scroll, it disappears."));
    }
    if (confused) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("Being so trippy, you screw up..."));
      } else {
        await pline(S("Being confused, you %s the magic words..."), silently ? S("misunderstand") : S("mispronounce"));
      }
    }
  }
  if (!await seffects(scroll)) {
    if (!G.objects[scroll.otyp].oc_name_known) {
      if (G.known) {
        await learnscroll(scroll);
      } else if (!G.objects[scroll.otyp].oc_uname) {
        await docall(scroll);
      }
    }
    scroll.in_use = (FALSE) & 1;
    if (scroll.otyp !== SCR_BLANK_PAPER) {
      await useup(scroll);
    }
  }
  return 1;
}

async function stripspe(obj: struct_obj | null): Promise<void> {
  if (obj.blessed | 0 || obj.spe <= 0) {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  } else {
    await pline(S("%s briefly."), await Yobjnam2(obj, S("vibrate")));
    await costly_alteration(obj, COST_UNCHRG);
    obj.spe = 0;
    if (obj.otyp === OIL_LAMP || obj.otyp === BRASS_LANTERN) {
      obj.age = 0;
    }
  }
}

async function p_glow1(otmp: struct_obj | null): Promise<void> {
  await pline(S("%s briefly."), await Yobjnam2(otmp, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("vibrate") : S("glow")));
}

async function p_glow2(otmp: struct_obj | null, color: Ptr | null): Promise<void> {
  await pline(S("%s%s%s for a moment."), await Yobjnam2(otmp, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("vibrate") : S("glow")), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S(" "), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : hcolor(color));
}

export function is_chargeable(obj: struct_obj | null): number {
  if (obj.oclass === WAND_CLASS) {
    return TRUE;
  }
  if (obj.oclass === RING_CLASS) {
    return (G.objects[obj.otyp].oc_charged | 0 && (obj.known | 0 || obj.dknown | 0 && G.objects[obj.otyp].oc_name_known | 0) ? 1 : 0) << 24 >> 24;
  }
  if (obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE) {
    return FALSE;
  }
  if (obj.oclass === TOOL_CLASS) {
    return G.objects[obj.otyp].oc_charged << 24 >> 24;
  }
  return FALSE;
}

export async function recharge(obj: struct_obj | null, curse_bless: number): Promise<void> {
  let $g = 0;
  let n = 0;
  let is_cursed = 0;
  let is_blessed = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      is_cursed = (curse_bless < 0 ? 1 : 0) << 24 >> 24;
      is_blessed = (curse_bless > 0 ? 1 : 0) << 24 >> 24;
      if (!(obj.oclass === WAND_CLASS)) { $g = 3; continue $L; }
      {
        let lim = obj.otyp === WAN_WISHING ? 3 : (G.objects[obj.otyp].oc_dir | 0) !== NODIR ? 8 : 15;
        if (obj.spe === -1) {
          obj.spe = 0;
        }
        n = obj.recharged | 0;
        if (n > 0 && (obj.otyp === WAN_WISHING || Math.imul(Math.imul(n, n), n) > rn2(7 * 7 * 7))) {
          await wand_explode(obj, rnd(lim));
          return;
        }
        obj.recharged = (n + 1 >>> 0) & 7;
        if (is_cursed) {
          await stripspe(obj);
        } else {
          n = lim === 3 ? 3 : rn2(5) + (lim + 1 - 5);
          if (!is_blessed) {
            n = rnd(n);
          }
          if (obj.spe < n) {
            obj.spe = n << 24 >> 24;
          } else {
            obj.spe = obj.spe + 1 << 24 >> 24;
          }
          if (obj.otyp === WAN_WISHING && obj.spe > 3) {
            await wand_explode(obj, 1);
            return;
          }
          if (obj.spe >= lim) {
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            await p_glow1(obj);
          }
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(obj.oclass === RING_CLASS && G.objects[obj.otyp].oc_charged | 0)) { $g = 5; continue $L; }
      {
        let s = is_blessed ? rnd(3) : is_cursed ? -rnd(2) : 1;
        let is_on = (obj === G.uleft || obj === G.uright ? 1 : 0) << 24 >> 24;
        if (obj.spe > rn2(7) || obj.spe <= -5) {
          await pline(S("%s momentarily, then %s!"), await Yobjnam2(obj, S("pulsate")), otense(obj, S("explode")));
          if (is_on) {
            await Ring_gone(obj);
          }
          s = rnd(3 * Math.abs(obj.spe));
          await useup(obj);
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (s + 1) / 2 | 0 : s, S("exploding ring"), KILLED_BY_AN);
        } else {
          let mask = is_on ? obj === G.uleft ? LEFT_RING : RIGHT_RING : 0;
          await pline(S("%s spins %sclockwise for a moment."), await Yname2(obj), s < 0 ? S("counter") : S(""));
          if (s < 0) {
            await costly_alteration(obj, COST_DECHNT);
          }
          if (is_on) {
            await Ring_off(obj);
          }
          obj.spe = obj.spe + s << 24 >> 24;
          if (is_on) {
            await setworn(obj, mask), await Ring_on(obj);
          }
          if (s > 0 && obj.unpaid | 0) {
            await alter_cost(obj, 0);
          }
        }
      }
      { $g = 4; continue $L; }
    case 5:
      if (!(obj.oclass === TOOL_CLASS)) { $g = 7; continue $L; }
      {
        let rechrg = obj.recharged | 0;
        if (G.objects[obj.otyp].oc_charged) {
          if (rechrg < 7) {
            obj.recharged = (obj.recharged + 1 >>> 0) & 7;
          }
        }
        switch (obj.otyp) {
        case 238:
          if (is_cursed) {
            await stripspe(obj);
          } else if (is_blessed) {
            obj.spe = obj.spe + rnd(3) << 24 >> 24;
          } else {
            obj.spe = obj.spe + 1 << 24 >> 24;
          }
          if (obj.spe > 5) {
            obj.spe = 5;
          }
          break;
        case 217:
        case 213:
        case 204:
          if (is_cursed) {
            await stripspe(obj);
          } else if (rechrg && obj.otyp === MAGIC_MARKER) {
            obj.recharged = 1;
            if (obj.spe < 3) {
              await Your(S("marker seems permanently dried out."));
            } else {
              await pline(S("%s"), G.c_common_strings.c_nothing_happens);
            }
          } else if (is_blessed) {
            n = rn2(16) + 15;
            if (obj.spe + n <= 50) {
              obj.spe = 50;
            } else if (obj.spe + n <= 75) {
              obj.spe = 75;
            } else {
              let chrg = obj.spe;
              if (chrg + n > 127) {
                obj.spe = 127;
              } else {
                obj.spe = obj.spe + n << 24 >> 24;
              }
            }
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            n = rn2(11) + 10;
            if (obj.spe + n <= 50) {
              obj.spe = 50;
            } else {
              let chrg = obj.spe;
              if (chrg + n > 127) {
                obj.spe = 127;
              } else {
                obj.spe = obj.spe + n << 24 >> 24;
              }
            }
            await p_glow2(obj, G.c_color_names.c_white);
          }
          break;
        case 202:
        case 201:
          if (is_cursed) {
            await stripspe(obj);
            if (obj.lamplit) {
              if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
                await pline(S("%s out!"), await Tobjnam(obj, S("go")));
              }
              await end_burn(obj, TRUE);
            }
          } else if (is_blessed) {
            obj.spe = 1;
            obj.age = 1500;
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            obj.spe = 1;
            obj.age += 750;
            if (obj.age > 1500) {
              obj.age = 1500;
            }
            await p_glow1(obj);
          }
          break;
        case 206:
          if (is_cursed) {
            await stripspe(obj);
          } else if (is_blessed) {
            obj.spe = 6;
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            if (obj.spe < 5) {
              obj.spe = obj.spe + 1 << 24 >> 24;
              await p_glow1(obj);
            } else {
              await pline(S("%s"), G.c_common_strings.c_nothing_happens);
            }
          }
          break;
        case 227:
        case 195:
        case 215:
          if (is_cursed) {
            await stripspe(obj);
          } else if (is_blessed) {
            if (obj.spe <= 10) {
              obj.spe = obj.spe + (rn2(10) + 6) << 24 >> 24;
            } else {
              obj.spe = obj.spe + (rn2(5) + 6) << 24 >> 24;
            }
            if (obj.spe > 50) {
              obj.spe = 50;
            }
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            obj.spe = obj.spe + rnd(5) << 24 >> 24;
            if (obj.spe > 50) {
              obj.spe = 50;
            }
            await p_glow1(obj);
          }
          break;
        case 223:
        case 229:
        case 225:
        case 226:
        case 233:
          if (is_cursed) {
            await stripspe(obj);
          } else if (is_blessed) {
            obj.spe = obj.spe + d(2, 4) << 24 >> 24;
            if (obj.spe > 20) {
              obj.spe = 20;
            }
            await p_glow2(obj, G.c_color_names.c_blue);
          } else {
            obj.spe = obj.spe + rnd(4) << 24 >> 24;
            if (obj.spe > 20) {
              obj.spe = 20;
            }
            await p_glow1(obj);
          }
          break;
        default:
          { $g = 1; continue $L; }
          break;
        }
      }
      { $g = 6; continue $L; }
    case 7:
    case 1: // not_chargable
      await You(S("have a feeling of loss."));
    case 6:
    case 4:
    case 2:
    }
    break;
  }
}

async function forget_single_object(obj_id: number): Promise<void> {
  G.objects[obj_id].oc_name_known = 0;
  G.objects[obj_id].oc_pre_discovered = 0;
  if (G.objects[obj_id].oc_uname) {
    free(G.objects[obj_id].oc_uname);
    G.objects[obj_id].oc_uname = null;
  }
  await undiscover_object(obj_id);
}

function randomize(indices: Ptr | null, count: number): void {
  let i = 0;
  let iswap = 0;
  let temp = 0;
  for (i = count - 1; i > 0; --i) {
    if ((iswap = rn2(i + 1)) === i) {
      continue;
    }
    temp = indices.a[indices.o + i];
    indices.a[indices.o + i] = indices.a[indices.o + iswap];
    indices.a[indices.o + iswap] = temp;
  }
}

export async function forget_objects(percent: number): Promise<void> {
  let i = 0;
  let count = 0;
  let indices = new Int32Array(454);
  if (percent === 0) {
    return;
  }
  if (percent <= 0 || percent > 100) {
    await impossible(S("forget_objects: bad percent %d"), percent);
    return;
  }
  indices[0] = 0;
  for (count = 0, i = 1; i < NUM_OBJECTS; ++i) {
    if (G.obj_descr[G.objects[i].oc_descr_idx].oc_descr && (G.objects[i].oc_name_known | 0 || G.objects[i].oc_uname)) {
      indices[count++] = i;
    }
  }
  if (count > 0) {
    randomize(P(indices), count);
    count = (Math.imul(count, percent) + rn2(100)) / 100 | 0;
    for (i = 0; i < count; ++i) {
      await forget_single_object(indices[i]);
    }
  }
}

export function forget_map(howmuch: number): void {
  let zx = 0;
  let zy = 0;
  if (G.level.flags.sokoban_rules) {
    return;
  }
  G.known = TRUE;
  for (zx = 0; zx < COLNO; ++zx) {
    for (zy = 0; zy < ROWNO; ++zy) {
      if (howmuch & ALL_MAP || rn2(7)) {
        $at2(G.level.locations, zx, zy).seenv = 0;
        $at2(G.level.locations, zx, zy).waslit = 0;
        $at2(G.level.locations, zx, zy).glyph = S_stone + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        G.lastseentyp[zx][zy] = STONE;
      }
    }
  }
  forget_mapseen(ledger_no(G.u.uz));
}

export function forget_traps(): void {
  let trap = null;
  for (trap = G.ftrap; trap; trap = trap.ntrap) {
    if ((trap.tx !== G.u.ux || trap.ty !== G.u.uy) && (trap.ttyp | 0) !== HOLE) {
      trap.tseen = 0;
    }
  }
}

export async function forget_levels(percent: number): Promise<void> {
  let $t1: any;
  let i = 0;
  let count = 0;
  let maxl = 0;
  let this_lev = 0;
  let indices = new Int32Array(512);
  if (percent === 0) {
    return;
  }
  if (percent <= 0 || percent > 100) {
    await impossible(S("forget_levels: bad percent %d"), percent);
    return;
  }
  this_lev = ledger_no(G.u.uz);
  maxl = maxledgerno();
  indices[0] = 0;
  for (count = 0, i = 0; i <= maxl; ++i) {
    if (G.level_info[i].flags & VISITED && !(G.level_info[i].flags & FORGOTTEN) && i !== this_lev) {
      if (await ledger_to_dnum(i) === G.dungeon_topology.d_sokoban_dnum) {
        percent += 2;
      } else {
        indices[count++] = i;
      }
    }
  }
  if (percent > 100) {
    percent = 100;
  }
  if (count > 0) {
    randomize(P(indices), count);
    count = (Math.imul(count, percent) + 50) / 100 | 0;
    for (i = 0; i < count; ++i) {
      ($t1 = G.level_info[indices[i]], $t1.flags = ($t1.flags | FORGOTTEN) & 0xff);
      forget_mapseen(indices[i]);
    }
  }
}

async function forget(howmuch: number): Promise<void> {
  if (!!G.uball) {
    G.u.bc_felt = 0;
  }
  forget_map(howmuch);
  forget_traps();
  if (!rn2(3)) {
    await forget_levels(rn2(25));
  }
  if (!rn2(3)) {
    await forget_objects(rn2(25));
  }
  if (howmuch & ALL_SPELLS) {
    await losespells();
  }
  await docrt();
}

async function maybe_tame(mtmp: struct_monst | null, sobj: struct_obj | null): Promise<number> {
  let was_tame = mtmp.mtame;
  let was_peaceful = mtmp.mpeaceful;
  if (sobj.cursed) {
    await setmangry(mtmp, FALSE);
    if (was_peaceful && !mtmp.mpeaceful) {
      return -1;
    }
  } else {
    if (mtmp.isshk) {
      await make_happy_shk(mtmp, FALSE);
    } else if (!await resist(mtmp, sobj.oclass, 0, NOTELL)) {
      await tamedog(mtmp, null);
    }
    if (!was_peaceful && mtmp.mpeaceful | 0 || !was_tame && mtmp.mtame) {
      return 1;
    }
  }
  return 0;
}

function get_valid_stinking_cloud_pos(x: number, y: number): number {
  return (!(!isok(x, y) || !($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) || !($at2(G.level.locations, x, y).typ >= DOOR) || dist2(x, y, G.u.ux, G.u.uy) >= 32) ? 1 : 0) << 24 >> 24;
}

async function is_valid_stinking_cloud_pos(x: number, y: number, showmsg: number): Promise<number> {
  if (!get_valid_stinking_cloud_pos(x, y)) {
    if (showmsg) {
      await You(S("smell rotten eggs."));
    }
    return FALSE;
  }
  return TRUE;
}

async function display_stinking_cloud_positions(state: number): Promise<void> {
  if (state === 0) {
    await tmp_at(DISP_BEAM, S_goodpos + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
  } else if (state === 1) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    let dist = 6;
    for (dx = -dist; dx <= dist; ++dx) {
      for (dy = -dist; dy <= dist; ++dy) {
        x = G.u.ux + dx;
        y = G.u.uy + dy;
        if (get_valid_stinking_cloud_pos(x, y)) {
          await tmp_at(x, y);
        }
      }
    }
  } else {
    await tmp_at(DISP_END, 0);
  }
}

export async function seffects(sobj: struct_obj | null): Promise<number> {
  let cval = 0;
  let otyp = sobj.otyp;
  let confused = (G.u.uprops[CONFUSION].intrinsic !== 0 ? 1 : 0) << 24 >> 24;
  let sblessed = sobj.blessed << 24 >> 24;
  let scursed = sobj.cursed << 24 >> 24;
  let already_known = 0;
  let old_erodeproof = 0;
  let new_erodeproof = 0;
  let otmp = null;
  if (G.objects[otyp].oc_magic) {
    await exercise(A_WIS, TRUE);
  }
  already_known = (sobj.oclass === SPBOOK_CLASS || G.objects[otyp].oc_name_known | 0 ? 1 : 0) << 24 >> 24;
  switch (otyp) {
  case 339:
    G.known = TRUE;
    if (sobj.spe === 2) {
      await pline(S("This scroll is marked \"postage due\"."));
    } else if (sobj.spe) {
      await pline(S("This seems to be junk mail addressed to the finder of the Eye of Larn."));
    } else {
      await readmail(sobj);
    }
    break;
  case 298:
    {
      let s = 0;
      let special_armor = 0;
      let same_color = 0;
      otmp = await some_armor(G.youmonst);
      if (!otmp) {
        await strange_feeling(sobj, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("Your skin glows then fades.") : S("Your skin feels warm for a moment."));
        sobj = null;
        await exercise(A_CON, !scursed ? 1 : 0);
        await exercise(A_STR, !scursed ? 1 : 0);
        break;
      }
      if (confused) {
        old_erodeproof = ((otmp.oerodeproof | 0) !== 0 ? 1 : 0) << 24 >> 24;
        new_erodeproof = (!scursed ? 1 : 0) << 24 >> 24;
        otmp.oerodeproof = 0;
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          otmp.rknown = (FALSE) & 1;
          await pline(S("%s warm for a moment."), await Yobjnam2(otmp, S("feel")));
        } else {
          otmp.rknown = (TRUE) & 1;
          await pline(S("%s covered by a %s %s %s!"), await Yobjnam2(otmp, S("are")), scursed ? S("mottled") : S("shimmering"), hcolor(scursed ? G.c_color_names.c_black : G.c_color_names.c_golden), scursed ? S("glow") : otmp.oclass === ARMOR_CLASS && G.objects[otmp.otyp].oc_subtyp === ARM_SHIELD ? S("layer") : S("shield"));
        }
        if (new_erodeproof && (otmp.oeroded | 0 || otmp.oeroded2 | 0)) {
          otmp.oeroded = (otmp.oeroded2 = 0) & 3;
          await pline(S("%s as good as new!"), await Yobjnam2(otmp, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("look")));
        }
        if (old_erodeproof && !new_erodeproof) {
          otmp.oerodeproof = 1;
          await costly_alteration(otmp, COST_DEGRD);
        }
        otmp.oerodeproof = ((new_erodeproof ? 1 : 0) >>> 0) & 1;
        break;
      }
      special_armor = (otmp.otyp === 71 || otmp.otyp === 106 || otmp.otyp === 118 || otmp.otyp === 130 || otmp.otyp === 146 || G.urole.malenum === 342 && otmp.otyp === CORNUTHAUM ? 1 : 0) << 24 >> 24;
      if (scursed) {
        same_color = (otmp.otyp === BLACK_DRAGON_SCALE_MAIL || otmp.otyp === BLACK_DRAGON_SCALES ? 1 : 0) << 24 >> 24;
      } else {
        same_color = (otmp.otyp === SILVER_DRAGON_SCALE_MAIL || otmp.otyp === SILVER_DRAGON_SCALES || otmp.otyp === SHIELD_OF_REFLECTION ? 1 : 0) << 24 >> 24;
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        same_color = FALSE;
      }
      s = (scursed ? -otmp.spe : otmp.spe) << 24 >> 24;
      if (s > (special_armor ? 5 : 3) && rn2(s)) {
        otmp.in_use = (TRUE) & 1;
        await pline(S("%s violently %s%s%s for a while, then %s."), await Yname2(otmp), otense(otmp, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("vibrate") : S("glow")), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !same_color ? S(" ") : S(""), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || same_color ? S("") : hcolor(scursed ? G.c_color_names.c_black : G.c_color_names.c_silver), otense(otmp, S("evaporate")));
        await remove_worn_item(otmp, FALSE);
        await useup(otmp);
        break;
      }
      s = (scursed ? -1 : otmp.spe >= 9 ? rn2(otmp.spe) === 0 ? 1 : 0 : sblessed ? rnd(3 - (otmp.spe / 3 | 0)) : 1) << 24 >> 24;
      if (s >= 0 && (otmp.otyp >= 91 && otmp.otyp <= 99)) {
        await pline(S("%s merges and hardens!"), await Yname2(otmp));
        await setworn(null, W_ARM);
        otmp.otyp = otmp.otyp + (GRAY_DRAGON_SCALE_MAIL - GRAY_DRAGON_SCALES) << 16 >> 16;
        if (sblessed) {
          otmp.spe = otmp.spe + 1 << 24 >> 24;
          if (!otmp.blessed) {
            await bless(otmp);
          }
        } else if (otmp.cursed) {
          await uncurse(otmp);
        }
        otmp.known = 1;
        await setworn(otmp, W_ARM);
        if (otmp.unpaid) {
          await alter_cost(otmp, 0);
        }
        break;
      }
      await pline(S("%s %s%s%s%s for a %s."), await Yname2(otmp), s === 0 ? S("violently ") : S(""), otense(otmp, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("vibrate") : S("glow")), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !same_color ? S(" ") : S(""), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || same_color ? S("") : hcolor(scursed ? G.c_color_names.c_black : G.c_color_names.c_silver), Math.imul(s, s) > 1 ? S("while") : S("moment"));
      if (s < 0) {
        await costly_alteration(otmp, COST_DECHNT);
      }
      if (scursed && !otmp.cursed) {
        await curse(otmp);
      } else if (sblessed && !otmp.blessed) {
        await bless(otmp);
      } else if (!scursed && otmp.cursed | 0) {
        await uncurse(otmp);
      }
      if (s) {
        otmp.spe = otmp.spe + s << 24 >> 24;
        await adj_abon(otmp, s);
        G.known = otmp.known << 24 >> 24;
        if (s > 0 && otmp.unpaid | 0) {
          await alter_cost(otmp, 0);
        }
      }
      if (otmp.spe > (special_armor ? 5 : 3) && (special_armor || !rn2(7))) {
        await pline(S("%s %s."), await Yobjnam2(otmp, S("suddenly vibrate")), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("again") : S("unexpectedly"));
      }
      break;
    }
  case 299:
    {
      otmp = await some_armor(G.youmonst);
      if (confused) {
        if (!otmp) {
          await strange_feeling(sobj, S("Your bones itch."));
          sobj = null;
          await exercise(A_STR, FALSE);
          await exercise(A_CON, FALSE);
          break;
        }
        old_erodeproof = ((otmp.oerodeproof | 0) !== 0 ? 1 : 0) << 24 >> 24;
        new_erodeproof = scursed;
        otmp.oerodeproof = 0;
        await p_glow2(otmp, G.c_color_names.c_purple);
        if (old_erodeproof && !new_erodeproof) {
          otmp.oerodeproof = 1;
          await costly_alteration(otmp, COST_DEGRD);
        }
        otmp.oerodeproof = ((new_erodeproof ? 1 : 0) >>> 0) & 1;
        break;
      }
      if (!scursed || !otmp || !otmp.cursed) {
        if (!await destroy_arm(otmp)) {
          await strange_feeling(sobj, S("Your skin itches."));
          sobj = null;
          await exercise(A_STR, FALSE);
          await exercise(A_CON, FALSE);
          break;
        } else {
          G.known = TRUE;
        }
      } else {
        await pline(S("%s."), await Yobjnam2(otmp, S("vibrate")));
        if (otmp.spe >= -6) {
          otmp.spe = otmp.spe + -1 << 24 >> 24;
          await adj_abon(otmp, -1);
        }
        await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + (rn2(10) + 10), TRUE);
      }
    }
    break;
  case 300:
  case 352:
    if (G.youmonst.data.mlet !== S_HUMAN || scursed) {
      if (!G.u.uprops[CONFUSION].intrinsic) {
        await You_feel(S("confused."));
      }
      await make_confused(G.u.uprops[CONFUSION].intrinsic + rnd(100), FALSE);
    } else if (confused) {
      if (!sblessed) {
        await Your(S("%s begin to %s%s."), await makeplural(body_part(HAND)), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("tingle") : S("glow "), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : hcolor(G.c_color_names.c_purple));
        await make_confused(G.u.uprops[CONFUSION].intrinsic + rnd(100), FALSE);
      } else {
        await pline(S("A %s%s surrounds your %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : hcolor(G.c_color_names.c_red), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("faint buzz") : S(" glow"), body_part(HEAD));
        await make_confused(0, TRUE);
      }
    } else {
      if (!sblessed) {
        await Your(S("%s%s %s%s."), await makeplural(body_part(HAND)), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : S(" begin to glow"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("tingle") : hcolor(G.c_color_names.c_red), G.u.umconf ? S(" even more") : S(""));
        G.u.umconf = G.u.umconf + 1 >>> 0;
      } else {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await Your(S("%s tingle %s sharply."), await makeplural(body_part(HAND)), G.u.umconf ? S("even more") : S("very"));
        } else {
          await Your(S("%s glow a%s brilliant %s."), await makeplural(body_part(HAND)), G.u.umconf ? S("n even more") : S(""), hcolor(G.c_color_names.c_red));
        }
        if (G.u.umconf >= 40) {
          G.u.umconf = G.u.umconf + 1 >>> 0;
        } else {
          G.u.umconf = G.u.umconf + (rn2(8) + 2 >>> 0) >>> 0;
        }
      }
    }
    break;
  case 301:
  case 359:
    {
      let ct = 0;
      let mtmp = null;
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
          if (confused || scursed) {
            mtmp.mflee = (mtmp.mfrozen = (mtmp.msleeping = 0) & 127) & 1;
            mtmp.mcanmove = 1;
          } else if (!await resist(mtmp, sobj.oclass, 0, NOTELL)) {
            await monflee(mtmp, 0, FALSE, FALSE);
          }
          if (!mtmp.mtame) {
            ++ct;
          }
        }
      }
      if (otyp === SCR_SCARE_MONSTER || !ct) {
        await You_hear(S("%s %s."), confused || scursed ? S("sad wailing") : S("maniacal laughter"), !ct ? S("in the distance") : S("close by"));
      }
      break;
    }
  case 340:
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await You(S("don't remember there being any magic words on this scroll."));
    } else {
      await pline(S("This scroll seems to be blank."));
    }
    G.known = TRUE;
    break;
  case 302:
  case 370:
    {
      let obj = null;
      await You_feel(!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? !confused ? S("like someone is helping you.") : S("like you need some help.") : !confused ? S("in touch with the Universal Oneness.") : S("the power of the Force against you!"));
      if (scursed) {
        await pline_The(S("scroll disintegrates."));
      } else {
        for (obj = G.invent; obj; obj = obj.nobj) {
          let wornmask = 0;
          if (obj.oclass === COIN_CLASS) {
            continue;
          }
          if (obj === sobj && obj.quan === 1) {
            continue;
          }
          wornmask = obj.owornmask & ~(W_BALL | W_ART | W_ARTI);
          if (wornmask && !sblessed) {
            if (obj === G.uswapwep) {
              if (!G.u.twoweap) {
                wornmask = 0;
              }
            } else if (obj === G.uquiver) {
              if (obj.oclass === WEAPON_CLASS) {
                if (!G.objects[obj.otyp].oc_merge) {
                  wornmask = 0;
                }
              } else if (obj.oclass === GEM_CLASS) {
                if (!(G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_SLING)) {
                  wornmask = 0;
                }
              } else {
                wornmask = 0;
              }
            }
          }
          if (sblessed || wornmask || obj.otyp === LOADSTONE || obj.otyp === LEASH && obj.corpsenm) {
            let shop_h2o = (obj.unpaid | 0 && obj.otyp === POT_WATER ? 1 : 0) << 24 >> 24;
            if (confused) {
              await blessorcurse(obj, 2);
              obj.bknown = 0;
              if (shop_h2o && (obj.cursed | 0 || obj.blessed | 0)) {
                await alter_cost(obj, 0);
              }
            } else if (obj.cursed) {
              if (shop_h2o) {
                await costly_alteration(obj, COST_UNCURS);
              }
              await uncurse(obj);
            }
          }
        }
      }
      if (!!G.uball && !confused) {
        await unpunish();
      }
      if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
        await buried_ball_to_freedom();
        await pline_The(S("clasp on your %s vanishes."), body_part(LEG));
      }
      update_inventory();
      break;
    }
  case 304:
  case 357:
    if (await create_critters(1 + (confused || scursed ? 12 : 0) + (sblessed || rn2(73) ? 0 : rnd(4)), confused ? $sat(G.mons, PM_ACID_BLOB) : null, FALSE)) {
      G.known = TRUE;
    }
    break;
  case 303:
    if (confused && G.uwep && erosion_matters(G.uwep) && G.uwep.oclass !== ARMOR_CLASS) {
      old_erodeproof = ((G.uwep.oerodeproof | 0) !== 0 ? 1 : 0) << 24 >> 24;
      new_erodeproof = (!scursed ? 1 : 0) << 24 >> 24;
      G.uwep.oerodeproof = 0;
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        G.uwep.rknown = (FALSE) & 1;
        await Your(S("weapon feels warm for a moment."));
      } else {
        G.uwep.rknown = (TRUE) & 1;
        await pline(S("%s covered by a %s %s %s!"), await Yobjnam2(G.uwep, S("are")), scursed ? S("mottled") : S("shimmering"), hcolor(scursed ? G.c_color_names.c_purple : G.c_color_names.c_golden), scursed ? S("glow") : S("shield"));
      }
      if (new_erodeproof && (G.uwep.oeroded | 0 || G.uwep.oeroded2 | 0)) {
        G.uwep.oeroded = (G.uwep.oeroded2 = 0) & 3;
        await pline(S("%s as good as new!"), await Yobjnam2(G.uwep, (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("look")));
      }
      if (old_erodeproof && !new_erodeproof) {
        G.uwep.oerodeproof = 1;
        await costly_alteration(G.uwep, COST_DEGRD);
      }
      G.uwep.oerodeproof = ((new_erodeproof ? 1 : 0) >>> 0) & 1;
      break;
    }
    if (!await chwepon(sobj, scursed ? -1 : !G.uwep ? 1 : G.uwep.spe >= 9 ? !rn2(G.uwep.spe) ? 1 : 0 : sblessed ? rnd(3 - (G.uwep.spe / 3 | 0)) : 1)) {
      sobj = null;
    }
    break;
  case 305:
  case 362:
    {
      let candidates = 0;
      let res = 0;
      let results = 0;
      let vis_results = 0;
      if (G.u.uswallow) {
        candidates = 1;
        results = vis_results = await maybe_tame(G.u.ustuck, sobj);
      } else {
        let i = 0;
        let j = 0;
        let bd = confused ? 5 : 1;
        let mtmp = null;
        candidates = results = vis_results = 0;
        for (i = -bd; i <= bd; ++i) {
          for (j = -bd; j <= bd; ++j) {
            if (!isok(G.u.ux + i, G.u.uy + j)) {
              continue;
            }
            if (!!(mtmp = !!G.level.monsters[G.u.ux + i][G.u.uy + j] ? G.level.monsters[G.u.ux + i][G.u.uy + j] : null) || !i && !j && !!(mtmp = G.u.usteed)) {
              ++candidates;
              res = await maybe_tame(mtmp, sobj);
              results += res;
              if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
                vis_results += res;
              }
            }
          }
        }
      }
      if (!results) {
        await pline(S("Nothing interesting %s."), !candidates ? S("happens") : S("seems to happen"));
      } else {
        await pline_The(S("neighborhood %s %sfriendlier."), vis_results ? S("is") : S("seems"), results < 0 ? S("un") : S(""));
        if (vis_results > 0) {
          G.known = TRUE;
        }
      }
      break;
    }
  case 306:
    if (!already_known) {
      await You(S("have found a scroll of genocide!"));
    }
    G.known = TRUE;
    if (sblessed) {
      await do_class_genocide();
    } else {
      await do_genocide((!scursed ? 1 : 0) | 2 * (!!G.u.uprops[CONFUSION].intrinsic ? 1 : 0));
    }
    break;
  case 307:
    if (!confused || rn2(5)) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        G.known = TRUE;
      }
      await litroom(!confused && !scursed ? 1 : 0, sobj);
      if (!confused && !scursed) {
        if (await lightdamage(sobj, TRUE, 5)) {
          G.known = TRUE;
        }
      }
    } else {
      await create_critters(1, !scursed ? $sat(G.mons, PM_YELLOW_LIGHT) : $sat(G.mons, PM_BLACK_LIGHT), TRUE);
    }
    break;
  case 308:
    if (confused || scursed) {
      await level_tele();
    } else {
      G.known = await scrolltele(sobj);
    }
    break;
  case 309:
    if (confused || scursed ? await trap_detect(sobj) : await gold_detect(sobj)) {
      sobj = null;
    }
    break;
  case 310:
  case 358:
    if (await food_detect(sobj)) {
      sobj = null;
    }
    break;
  case 311:
    await useup(sobj);
    sobj = null;
    if (confused) {
      await You(S("identify this as an identify scroll."));
    } else if (!already_known || !G.invent) {
      await pline(S("This is an identify scroll."));
    }
    if (!already_known) {
      await learnscrolltyp(SCR_IDENTIFY);
    }
  case 372:
    cval = 1;
    if (sblessed || !scursed && !rn2(5)) {
      cval = rn2(5);
      if (cval === 1 && sblessed && G.u.uluck + G.u.moreluck > 0) {
        ++cval;
      }
    }
    if (G.invent && !confused) {
      await identify_pack(cval, !already_known ? 1 : 0);
    } else if (otyp === SPE_IDENTIFY) {
      await pline(S("You're not carrying anything to be identified."));
    }
    break;
  case 317:
    if (confused) {
      if (scursed) {
        await You_feel(S("discharged."));
        G.u.uen = 0;
      } else {
        await You_feel(S("charged up!"));
        G.u.uen += d(sblessed ? 6 : 4, 4);
        if (G.u.uen > G.u.uenmax) {
          G.u.uenmax = G.u.uen;
        } else {
          G.u.uen = G.u.uenmax;
        }
      }
      G.context.botl = 1;
      break;
    }
    if (!already_known) {
      await pline(S("This is a charging scroll."));
      await learnscroll(sobj);
    }
    await useup(sobj);
    sobj = null;
    otmp = await getobj(P(all_count), S("charge"));
    if (otmp) {
      await recharge(otmp, scursed ? -1 : sblessed ? 1 : 0);
    }
    break;
  case 312:
    if (G.level.flags.nommap) {
      await Your(S("mind is filled with crazy lines!"));
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await pline(S("Wow!  Modern art."));
      } else {
        await Your(S("%s spins in bewilderment."), body_part(HEAD));
      }
      await make_confused(G.u.uprops[CONFUSION].intrinsic + rnd(30), FALSE);
      break;
    }
    if (sblessed) {
      let x = 0;
      let y = 0;
      for (x = 1; x < COLNO; ++x) {
        for (y = 0; y < ROWNO; ++y) {
          if ($at2(G.level.locations, x, y).typ === SDOOR) {
            cvt_sdoor_to_door($sat(G.level.locations[x], y));
          }
        }
      }
    }
    G.known = TRUE;
  case 371:
    if (G.level.flags.nommap) {
      await Your(S("%s spins as %s blocks the spell!"), body_part(HEAD), G.c_common_strings.c_something);
      await make_confused(G.u.uprops[CONFUSION].intrinsic + rnd(30), FALSE);
      break;
    }
    await pline(S("A map coalesces in your mind!"));
    cval = scursed && !confused ? 1 : 0;
    if (cval) {
      G.u.uprops[CONFUSION].intrinsic = 1;
    }
    await do_mapping();
    if (cval) {
      G.u.uprops[CONFUSION].intrinsic = 0;
      await pline(S("Unfortunately, you can't grasp the details."));
    }
    break;
  case 313:
    G.known = TRUE;
    await forget((!sblessed ? ALL_SPELLS : 0) | (!confused || scursed ? ALL_MAP : 0));
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await Your(S("mind releases itself from mundane concerns."));
    } else if (!strncmpi(P(G.plname), S("Maud"), 4)) {
      await pline(S("As your mind turns inward on itself, you forget everything else."));
    } else if (rn2(2)) {
      await pline(S("Who was that Maud person anyway?"));
    } else {
      await pline(S("Thinking of Maud you forget everything else."));
    }
    await exercise(A_WIS, FALSE);
    break;
  case 314:
    {
      let cc = new struct_nhcoord();
      let dam = 0;
      cc.x = G.u.ux;
      cc.y = G.u.uy;
      cval = bcsign(sobj);
      dam = (2 * (rn2(3) + 3 + 2 * cval) + 1) / 3 | 0;
      await useup(sobj);
      sobj = null;
      if (!already_known) {
        await learnscrolltyp(SCR_FIRE);
      }
      if (confused) {
        if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
          await shieldeff(G.u.ux, G.u.uy);
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("Oh, look, what a pretty fire in your %s."), await makeplural(body_part(HAND)));
          } else {
            await You_feel(S("a pleasant warmth in your %s."), await makeplural(body_part(HAND)));
          }
        } else {
          await pline_The(S("scroll catches fire and you burn your %s."), await makeplural(body_part(HAND)));
          await losehp(1, S("scroll of fire"), KILLED_BY_AN);
        }
        break;
      }
      if (G.u.uinwater) {
        await pline_The(S("%s around you vaporizes violently!"), hliquid(S("water")));
      } else {
        if (sblessed) {
          if (!already_known) {
            await pline(S("This is a scroll of fire!"));
          }
          dam = dam * 5;
          await pline(S("Where do you want to center the explosion?"));
          getpos_sethilite(display_stinking_cloud_positions, get_valid_stinking_cloud_pos);
          await getpos(cc, TRUE, S("the desired position"));
          if (!await is_valid_stinking_cloud_pos(cc.x, cc.y, FALSE)) {
            cc.x = G.u.ux;
            cc.y = G.u.uy;
          }
        }
        if (cc.x === G.u.ux && cc.y === G.u.uy) {
          await pline_The(S("scroll erupts in a tower of flame!"));
          G.iflags.last_msg = PLNMSG_TOWER_OF_FLAME;
          await burn_away_slime();
        }
      }
      await explode(cc.x, cc.y, 11, dam, SCROLL_CLASS, EXPL_FIERY);
      break;
    }
  case 315:
    if (!((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) && has_ceiling(G.u.uz) && (!(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) || (G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level))) {
      let x = 0;
      let y = 0;
      let nboulders = 0;
      if (G.u.uswallow) {
        await You_hear(S("rumbling."));
      } else {
        await pline_The(S("%s rumbles %s you!"), ceiling(G.u.ux, G.u.uy), sblessed ? S("around") : S("above"));
      }
      G.known = 1;
      sokoban_guilt();
      if (!scursed) {
        for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
          for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
            if (isok(x, y) && !closed_door(x, y) && !($at2(G.level.locations, x, y).typ < POOL) && !($at2(G.level.locations, x, y).typ === AIR || $at2(G.level.locations, x, y).typ === CLOUD) && (x !== G.u.ux || y !== G.u.uy)) {
              nboulders += await drop_boulder_on_monster(x, y, confused, TRUE);
            }
          }
        }
      }
      if (!sblessed) {
        await drop_boulder_on_player(confused, !scursed ? 1 : 0, TRUE, FALSE);
      } else if (!nboulders) {
        await pline(S("But nothing else happens."));
      }
    }
    break;
  case 316:
    G.known = TRUE;
    if (confused || sblessed) {
      await You_feel(S("guilty."));
      break;
    }
    await punish(sobj);
    break;
  case 318:
    {
      let cc = new struct_nhcoord();
      if (!already_known) {
        await You(S("have found a scroll of stinking cloud!"));
      }
      G.known = TRUE;
      await pline(S("Where do you want to center the %scloud?"), already_known ? S("stinking ") : S(""));
      cc.x = G.u.ux;
      cc.y = G.u.uy;
      getpos_sethilite(display_stinking_cloud_positions, get_valid_stinking_cloud_pos);
      if (await getpos(cc, TRUE, S("the desired position")) < 0) {
        await pline(S("%s"), G.c_common_strings.c_Never_mind);
        break;
      }
      if (!await is_valid_stinking_cloud_pos(cc.x, cc.y, TRUE)) {
        break;
      }
      await create_gas_cloud(cc.x, cc.y, 3 + bcsign(sobj), 8 + 4 * bcsign(sobj));
      break;
    }
  default:
    await impossible(S("What weird effect is this? (%u)"), otyp);
  }
  if (!sobj) {
    update_inventory();
  }
  return sobj ? 0 : 1;
}

export async function drop_boulder_on_player(confused: number, helmet_protects: number, byu: number, skip_uswallow: number): Promise<void> {
  let dmg = 0;
  let otmp2 = null;
  if (G.u.uswallow | 0 && !skip_uswallow) {
    await drop_boulder_on_monster(G.u.ux, G.u.uy, confused, byu);
    return;
  }
  otmp2 = await mksobj(confused ? ROCK : BOULDER, FALSE, FALSE);
  if (!otmp2) {
    return;
  }
  otmp2.quan = confused ? rn2(5) + 2 : 1;
  otmp2.owt = await weight(otmp2) >>> 0;
  if (!((G.youmonst.data.mflags1 & 4) >>> 0 !== 0) && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && !(G.youmonst.data.mlet === S_GHOST) && !((G.youmonst.data.mflags1 & 1048576) >>> 0 !== 0)) {
    await You(S("are hit by %s!"), await doname(otmp2));
    dmg = await dmgval(otmp2, G.youmonst) * otmp2.quan | 0;
    if (G.uarmh && helmet_protects) {
      if ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) {
        await pline(S("Fortunately, you are wearing a hard helmet."));
        if (dmg > 2) {
          dmg = 2;
        }
      } else if (G.flags.verbose) {
        await pline(S("%s does not protect you."), await Yname2(G.uarmh));
      }
    }
  } else {
    dmg = 0;
  }
  wake_nearto(G.u.ux, G.u.uy, 4 * 4);
  if (!await flooreffects(otmp2, G.u.ux, G.u.uy, S("fall"))) {
    await place_object(otmp2, G.u.ux, G.u.uy);
    await stackobj(otmp2);
    await newsym(G.u.ux, G.u.uy);
  }
  if (dmg) {
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("scroll of earth"), KILLED_BY_AN);
  }
}

export async function drop_boulder_on_monster(x: number, y: number, confused: number, byu: number): Promise<number> {
  let otmp2 = null;
  let mtmp = null;
  otmp2 = await mksobj(confused ? ROCK : BOULDER, FALSE, FALSE);
  if (!otmp2) {
    return FALSE;
  }
  otmp2.quan = confused ? rn2(5) + 2 : 1;
  otmp2.owt = await weight(otmp2) >>> 0;
  mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
  if (mtmp && !((mtmp.data.mflags1 & 4) >>> 0 !== 0) && !((mtmp.data.mflags1 & 8) >>> 0 !== 0) && !(mtmp.data.mlet === S_GHOST) && !((mtmp.data.mflags1 & 1048576) >>> 0 !== 0)) {
    let helmet = await which_armor(mtmp, W_ARMH);
    let mdmg = 0;
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await pline(S("%s is hit by %s!"), await Monnam(mtmp), await doname(otmp2));
      if (mtmp.minvis | 0 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await map_invisible(mtmp.mx, mtmp.my);
      }
    } else if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
      await You_hear(S("something hit %s %s over your %s!"), s_suffix(await mon_nam(mtmp)), mbodypart(mtmp, STOMACH), body_part(HEAD));
    }
    mdmg = await dmgval(otmp2, mtmp) * otmp2.quan | 0;
    if (helmet) {
      if ((G.objects[helmet.otyp].oc_material | 0) >= IRON && (G.objects[helmet.otyp].oc_material | 0) <= MITHRIL) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
          await pline(S("Fortunately, %s is wearing a hard helmet."), await mon_nam(mtmp));
        } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await You_hear(S("a clanging sound."));
        }
        if (mdmg > 2) {
          mdmg = 2;
        }
      } else {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
          await pline(S("%s's %s does not protect %s."), await Monnam(mtmp), await xname(helmet), G.genders[pronoun_gender(mtmp, 0)].him);
        }
      }
    }
    mtmp.mhp -= mdmg;
    if (mtmp.mhp < 1) {
      if (byu) {
        await killed(mtmp);
      } else {
        await pline(S("%s is killed."), await Monnam(mtmp));
        await mondied(mtmp);
      }
    } else {
      await wakeup(mtmp, byu);
    }
    wake_nearto(x, y, 4 * 4);
  } else if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
    await obfree(otmp2, null);
    await drop_boulder_on_player(confused, TRUE, FALSE, TRUE);
    return 1;
  }
  if (!await flooreffects(otmp2, x, y, S("fall"))) {
    await place_object(otmp2, x, y);
    await stackobj(otmp2);
    await newsym(x, y);
  }
  return TRUE;
}

export async function wand_explode(obj: struct_obj | null, chg: number): Promise<void> {
  let expl = !chg ? S("suddenly") : S("vibrates violently and");
  let dmg = 0;
  let n = 0;
  let k = 0;
  if (!chg) {
    chg = 2;
  }
  n = obj.spe + chg;
  if (n < 2) {
    n = 2;
  }
  switch (obj.otyp) {
  case 388:
    k = 12;
    break;
  case 396:
  case 406:
  case 395:
  case 394:
    k = 10;
    break;
  case 404:
  case 403:
  case 407:
  case 402:
    k = 8;
    break;
  case 389:
    k = 4;
    break;
  default:
    k = 6;
    break;
  }
  dmg = d(n, k);
  obj.in_use = (TRUE) & 1;
  await pline(S("%s %s explodes!"), await Yname2(obj), expl);
  await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("exploding wand"), KILLED_BY_AN);
  await useup(obj);
  await exercise(A_STR, FALSE);
}

async function set_lit(x: number, y: number, val: any): Promise<void> {
  let mtmp = null;
  let gremlin = null;
  if (val) {
    $at2(G.level.locations, x, y).lit = 1;
    if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && mtmp.data === $sat(G.mons, PM_GREMLIN)) {
      gremlin = new struct_litmon();
      gremlin.mon = mtmp;
      gremlin.nxt = gremlins;
      gremlins = gremlin;
    }
  } else {
    $at2(G.level.locations, x, y).lit = 0;
    await snuff_light_source(x, y);
  }
}

export async function litroom(on: number, obj: struct_obj | null): Promise<void> {
  const is_lit = new Int8Array(1);
  if (!on) {
    let otmp = null;
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      if (G.u.uswallow) {
        await pline(S("It seems even darker in here than before."));
      } else {
        if (G.uwep && artifact_light(G.uwep) && G.uwep.lamplit | 0) {
          await pline(S("Suddenly, the only light left comes from %s!"), await the(await xname(G.uwep)));
        } else {
          await You(S("are surrounded by darkness!"));
        }
      }
    }
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (otmp.lamplit) {
        await snuff_lit(otmp);
      }
    }
  } else {
    if (G.u.uswallow) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        ;
      } else if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
        await pline(S("%s %s is lit."), s_suffix(await Monnam(G.u.ustuck)), mbodypart(G.u.ustuck, STOMACH));
      } else if (G.u.ustuck.data.mlet === S_VORTEX || G.u.ustuck.data === $sat(G.mons, 151)) {
        await pline(S("%s shines briefly."), await Monnam(G.u.ustuck));
      } else {
        await pline(S("%s glistens."), await Monnam(G.u.ustuck));
      }
    } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("A lit field surrounds you!"));
    }
  }
  if (G.u.uswallow | 0 || G.u.uinwater | 0 || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    return;
  }
  if (!!G.uball && !on && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await move_bc(1, 0, G.uball.ox, G.uball.oy, G.uchain.ox, G.uchain.oy);
  }
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    let rnum = ($at2(G.level.locations, G.u.ux, G.u.uy).roomno | 0) - ROOMOFFSET;
    let rx = 0;
    let ry = 0;
    if (rnum >= 0) {
      for (rx = G.rooms[rnum].lx - 1; rx <= G.rooms[rnum].hx + 1; ++rx) {
        for (ry = G.rooms[rnum].ly - 1; ry <= G.rooms[rnum].hy + 1; ++ry) {
          await set_lit(rx, ry, on ? P(is_lit, 0) : null);
        }
      }
      G.rooms[rnum].rlit = on;
    }
  } else {
    await do_clear_area(G.u.ux, G.u.uy, obj && obj.oclass === SCROLL_CLASS && obj.blessed | 0 ? 9 : 5, set_lit, on ? P(is_lit, 0) : null);
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await vision_recalc(2);
    if (!!G.uball && !on) {
      await move_bc(0, 0, G.uball.ox, G.uball.oy, G.uchain.ox, G.uchain.oy);
    }
  }
  G.vision_full_recalc = 1;
  if (gremlins) {
    let gremlin = null;
    await vision_recalc(0);
    do {
      gremlin = gremlins;
      gremlins = gremlin.nxt;
      await light_hits_gremlin(gremlin.mon, rnd(5));
      free(gremlin);
    } while (gremlins);
  }
}

async function do_class_genocide(): Promise<void> {
  let $t1: any;
  let i = 0;
  let j = 0;
  let immunecnt = 0;
  let gonecnt = 0;
  let goodcnt = 0;
  let class_ = 0;
  let feel_dead = 0;
  let buf = new Int8Array(256);
  let gameover = FALSE;
  for (j = 0; ; ++j) {
    if (j >= 5) {
      await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
      return;
    }
    do {
      await G.windowprocs.win_getlin(S("What class of monsters do you wish to genocide?"), P(buf));
      mungspaces(P(buf));
    } while (!$rd(P(buf)));
    if ($rd(P(buf)) === 27 || !strncmpi(P(buf), S("none"), -1) || !strncmpi(P(buf), S("nothing"), -1)) {
      return;
    }
    class_ = await name_to_monclass(P(buf), null);
    if (class_ === 0 && (i = name_to_mon(P(buf))) !== NON_PM) {
      class_ = G.mons[i].mlet;
    }
    immunecnt = gonecnt = goodcnt = 0;
    for (i = LOW_PM; i < NUMMONS; ++i) {
      if (G.mons[i].mlet === class_) {
        if (!(G.mons[i].geno & G_GENO)) {
          ++immunecnt;
        } else if (G.mvitals[i].mvflags & G_GENOD) {
          ++gonecnt;
        } else {
          ++goodcnt;
        }
      }
    }
    if (!goodcnt && class_ !== G.mons[G.urole.malenum].mlet && class_ !== G.mons[G.urace.malenum].mlet) {
      if (gonecnt) {
        await pline(S("All such monsters are already nonexistent."));
      } else if (immunecnt || class_ === S_invisible) {
        await You(S("aren't permitted to genocide such monsters."));
      } else if (G.flags.debug && buf[0] === 42) {
        let mtmp = null;
        let mtmp2 = null;
        gonecnt = 0;
        for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
          mtmp2 = mtmp.nmon;
          if (mtmp.mhp < 1) {
            continue;
          }
          await mongone(mtmp);
          ++gonecnt;
        }
        await pline(S("Eliminated %d monster%s."), gonecnt, gonecnt === 1 ? S("") : S("s"));
        return;
      } else {
        await pline(S("That %s does not represent any monster."), strlen(P(buf)) === 1 ? S("symbol") : S("response"));
      }
      continue;
    }
    for (i = LOW_PM; i < NUMMONS; ++i) {
      if (G.mons[i].mlet === class_) {
        let nam = new Int8Array(256);
        strcpy(P(nam), await makeplural(G.mons[i].mname));
        if (i === G.urole.malenum || G.urole.femalenum !== -1 && i === G.urole.femalenum || (i === G.urace.malenum || G.urace.femalenum !== -1 && i === G.urace.femalenum) || G.mons[i].geno & G_GENO && !(G.mvitals[i].mvflags & G_GENOD)) {
          ($t1 = G.mvitals[i], $t1.mvflags = ($t1.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
          reset_rndmonst(i);
          await kill_genocided_monsters();
          update_inventory();
          await pline(S("Wiped out all %s."), P(nam));
          if (G.u.umonnum !== G.u.umonster && i === G.u.umonnum) {
            G.u.mh = -1;
            if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
              if (!feel_dead++) {
                await You(S("die."));
              }
              gameover = TRUE;
            } else {
              await rehumanize();
            }
          }
          if (i === G.urole.malenum || i === G.urace.malenum) {
            G.u.uhp = -1;
            if (G.u.umonnum !== G.u.umonster) {
              if (!feel_dead++) {
                await You_feel(S("%s inside."), udeadinside());
              }
            } else {
              if (!feel_dead++) {
                await You(S("die."));
              }
              gameover = TRUE;
            }
          }
        } else if (G.mvitals[i].mvflags & G_GENOD) {
          if (!gameover) {
            await pline(S("All %s are already nonexistent."), P(nam));
          }
        } else if (!gameover) {
          if ((G.mons[i].msound !== MS_LEADER || await quest_info(MS_LEADER) === i) && (G.mons[i].msound !== MS_NEMESIS || await quest_info(MS_NEMESIS) === i) && (G.mons[i].msound !== MS_GUARDIAN || await quest_info(MS_GUARDIAN) === i) && (i !== PM_NINJA || G.urole.malenum === 339)) {
            let named = 0;
            let uniq = 0;
            named = (($sat(G.mons, i).mflags2 & 524288) >>> 0 !== 0 ? TRUE : FALSE) << 24 >> 24;
            uniq = (G.mons[i].geno & G_UNIQ ? TRUE : FALSE) << 24 >> 24;
            if (i === PM_HIGH_PRIEST) {
              uniq = FALSE;
            }
            await You(S("aren't permitted to genocide %s%s."), uniq && !named ? S("the ") : S(""), uniq || named ? G.mons[i].mname : P(nam));
          }
        }
      }
    }
    if (gameover || G.u.uhp === -1) {
      G.killer.format = KILLED_BY_AN;
      strcpy(P(G.killer.name), S("scroll of genocide"));
      if (gameover) {
        await done(GENOCIDED);
      }
    }
    return;
  }
}

export async function do_genocide(how: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any;
  let buf = new Int8Array(256);
  let i = 0;
  let killplayer = 0;
  let mndx = 0;
  let ptr = null;
  let which = null;
  if (how & PLAYER) {
    mndx = G.u.umonster;
    ptr = $sat(G.mons, mndx);
    strcpy(P(buf), ptr.mname);
    ++killplayer;
  } else {
    for (i = 0; ; ++i) {
      if (i >= 5) {
        if (!(how & REALLY) && !!(ptr = await rndmonst())) {
          break;
        }
        await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
        return;
      }
      await G.windowprocs.win_getlin(S("What monster do you want to genocide? [type the name]"), P(buf));
      mungspaces(P(buf));
      if ($rd(P(buf)) === 27 || !strncmpi(P(buf), S("none"), -1) || !strncmpi(P(buf), S("nothing"), -1)) {
        if (!(how & REALLY) && !!(ptr = await rndmonst())) {
          break;
        }
        return;
      }
      mndx = name_to_mon(P(buf));
      if (mndx === NON_PM || G.mvitals[mndx].mvflags & G_GENOD) {
        await pline(S("Such creatures %s exist in this world."), mndx === NON_PM ? S("do not") : S("no longer"));
        continue;
      }
      ptr = $sat(G.mons, mndx);
      if (mndx === G.urole.malenum || G.urole.femalenum !== -1 && mndx === G.urole.femalenum || (mndx === G.urace.malenum || G.urace.femalenum !== -1 && mndx === G.urace.femalenum)) {
        ++killplayer;
        break;
      }
      if ((ptr.mflags2 & 8) >>> 0 !== 0) {
        adjalign(-sgn(G.u.ualign.type));
      }
      if ((ptr.mflags2 & 256) >>> 0 !== 0) {
        adjalign(sgn(G.u.ualign.type));
      }
      if (!(ptr.geno & G_GENO)) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          if (G.flags.verbose) {
            await pline(S("A thunderous voice booms through the caverns:"));
          }
          await verbalize(S("No, mortal!  That will not be done."));
        }
        continue;
      }
      if ((G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) && ptr === G.youmonst.data) {
        ++killplayer;
      }
      break;
    }
    mndx = await monsndx(ptr);
  }
  which = S("all ");
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    if (G.u.umonnum !== G.u.umonster) {
      strcpy(P(buf), G.youmonst.data.mname);
    } else {
      strcpy(P(buf), G.flags.female && G.urole.name.f ? G.urole.name.f : G.urole.name.m);
      buf[0] = lowc(buf[0]);
    }
  } else {
    strcpy(P(buf), ptr.mname);
    if (ptr.geno & G_UNIQ && ptr !== $sat(G.mons, PM_HIGH_PRIEST)) {
      which = !((ptr.mflags2 & 524288) >>> 0 !== 0) ? S("the ") : S("");
    }
  }
  if (how & REALLY) {
    ($t1 = G.mvitals[mndx], $t1.mvflags = ($t1.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
    await pline(S("Wiped out %s%s."), which, which.a[which.o] !== 97 ? P(buf) : await makeplural(P(buf)));
    if (killplayer) {
      if (G.urole.femalenum !== NON_PM && mndx === G.urole.malenum) {
        ($t2 = G.mvitals[G.urole.femalenum], $t2.mvflags = ($t2.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
      }
      if (G.urole.femalenum !== NON_PM && mndx === G.urole.femalenum) {
        ($t3 = G.mvitals[G.urole.malenum], $t3.mvflags = ($t3.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
      }
      if (G.urace.femalenum !== NON_PM && mndx === G.urace.malenum) {
        ($t4 = G.mvitals[G.urace.femalenum], $t4.mvflags = ($t4.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
      }
      if (G.urace.femalenum !== NON_PM && mndx === G.urace.femalenum) {
        ($t5 = G.mvitals[G.urace.malenum], $t5.mvflags = ($t5.mvflags | (G_GENOD | G_NOCORPSE)) & 0xff);
      }
      G.u.uhp = -1;
      if (how & PLAYER) {
        G.killer.format = KILLED_BY;
        strcpy(P(G.killer.name), S("genocidal confusion"));
      } else if (how & ONTHRONE) {
        G.killer.format = KILLED_BY_AN;
        strcpy(P(G.killer.name), S("imperious order"));
      } else {
        G.killer.format = KILLED_BY_AN;
        strcpy(P(G.killer.name), S("scroll of genocide"));
      }
      if (G.u.umonnum !== G.u.umonster && ptr !== G.youmonst.data) {
        await delayed_killer(POLYMORPH, G.killer.format, P(G.killer.name));
        await You_feel(S("%s inside."), udeadinside());
      } else {
        await done(GENOCIDED);
      }
    } else if (ptr === G.youmonst.data) {
      await rehumanize();
    }
    reset_rndmonst(mndx);
    await kill_genocided_monsters();
    update_inventory();
  } else {
    let cnt = 0;
    let census = monster_census(FALSE);
    if (!(G.mons[mndx].geno & G_UNIQ) && !(G.mvitals[mndx].mvflags & (G_GENOD | G_EXTINCT))) {
      for (i = rn2(3) + 4; i > 0; --i) {
        if (!await makemon(ptr, G.u.ux, G.u.uy, NO_MINVENT)) {
          break;
        }
        ++cnt;
        if (G.mvitals[mndx].mvflags & G_EXTINCT) {
          break;
        }
      }
    }
    if (cnt) {
      cnt = monster_census(FALSE) - census;
      await pline(S("Sent in %s%s."), cnt > 1 ? S("some ") : S(""), cnt > 1 ? await makeplural(P(buf)) : await an(P(buf)));
    } else {
      await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    }
  }
}

export async function punish(sobj: struct_obj | null): Promise<void> {
  let reuse_ball = sobj && sobj.otyp === HEAVY_IRON_BALL ? sobj : null;
  if (!reuse_ball) {
    await You(S("are being punished for your misbehavior!"));
  }
  if (!!G.uball) {
    await Your(S("iron ball gets heavier."));
    G.uball.owt = G.uball.owt + (Math.imul(IRON_BALL_W_INCR, 1 + (sobj.cursed | 0)) >>> 0) >>> 0;
    return;
  }
  if ((G.youmonst.data.mflags1 & 4) >>> 0 !== 0 || (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) || (G.youmonst.data.mflags1 & 1048576) >>> 0 !== 0) {
    if (!reuse_ball) {
      await pline(S("A ball and chain appears, then falls away."));
      await dropy(await mkobj(BALL_CLASS, TRUE));
    } else {
      await dropy(reuse_ball);
    }
    return;
  }
  await setworn(await mkobj(CHAIN_CLASS, TRUE), W_CHAIN);
  if (!reuse_ball) {
    await setworn(await mkobj(BALL_CLASS, TRUE), W_BALL);
  } else {
    await setworn(reuse_ball, W_BALL);
  }
  G.uball.spe = 1;
  if (!G.u.uswallow) {
    await placebc();
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await set_bc(1);
    }
    await newsym(G.u.ux, G.u.uy);
  }
}

export async function unpunish(): Promise<void> {
  let savechain = G.uchain;
  await obj_extract_self(G.uchain);
  await newsym(G.uchain.ox, G.uchain.oy);
  await setworn(null, W_CHAIN);
  await dealloc_obj(savechain);
  G.uball.spe = 0;
  await setworn(null, W_BALL);
}

export function cant_revive(mtype: Ptr | null, revival: number, from_obj: struct_obj | null): number {
  if (mtype.a[mtype.o] === PM_GUARD || mtype.a[mtype.o] === PM_SHOPKEEPER && !revival || mtype.a[mtype.o] === PM_HIGH_PRIEST || mtype.a[mtype.o] === PM_ALIGNED_PRIEST || mtype.a[mtype.o] === PM_ANGEL) {
    mtype.a[mtype.o] = PM_HUMAN_ZOMBIE;
    return TRUE;
  } else if (mtype.a[mtype.o] === PM_LONG_WORM_TAIL) {
    mtype.a[mtype.o] = PM_LONG_WORM;
    return TRUE;
  } else if (($sat(G.mons, mtype.a[mtype.o]).geno & 4096) !== 0 && (!from_obj || !(from_obj.oextra && from_obj.oextra.omonst))) {
    mtype.a[mtype.o] = PM_DOPPELGANGER;
    return TRUE;
  }
  return FALSE;
}

export async function create_particular_parse(str: Ptr | null, d: struct__create_particular_data | null): Promise<number> {
  let bufp = str;
  let tmpp = null;
  d.monclass = MAXMCLASSES;
  d.which = G.urole.malenum;
  d.fem = -1;
  d.randmonst = FALSE;
  d.maketame = d.makepeaceful = d.makehostile = FALSE;
  d.sleeping = d.saddled = d.invisible = d.hidden = FALSE;
  if (!!(tmpp = strstri(bufp, S("saddled ")))) {
    d.saddled = TRUE;
    memset(tmpp, 32, 9 - 1);
  }
  if (!!(tmpp = strstri(bufp, S("sleeping ")))) {
    d.sleeping = TRUE;
    memset(tmpp, 32, 10 - 1);
  }
  if (!!(tmpp = strstri(bufp, S("invisible ")))) {
    d.invisible = TRUE;
    memset(tmpp, 32, 11 - 1);
  }
  if (!!(tmpp = strstri(bufp, S("hidden ")))) {
    d.hidden = TRUE;
    memset(tmpp, 32, 8 - 1);
  }
  if (!!(tmpp = strstri(bufp, S("female ")))) {
    d.fem = 1;
    memset(tmpp, 32, 8 - 1);
  }
  if (!!(tmpp = strstri(bufp, S("male ")))) {
    d.fem = 0;
    memset(tmpp, 32, 6 - 1);
  }
  bufp = mungspaces(bufp);
  if (!strncmpi(bufp, S("tame "), 5)) {
    bufp = bufp.add(5);
    d.maketame = TRUE;
  } else if (!strncmpi(bufp, S("peaceful "), 9)) {
    bufp = bufp.add(9);
    d.makepeaceful = TRUE;
  } else if (!strncmpi(bufp, S("hostile "), 8)) {
    bufp = bufp.add(8);
    d.makehostile = TRUE;
  }
  if (G.flags.debug && (!strcmp(bufp, S("*")) || !strcmp(bufp, S("random")))) {
    d.randmonst = TRUE;
    return TRUE;
  }
  d.which = name_to_mon(bufp);
  if (d.which >= LOW_PM) {
    return TRUE;
  }
  d.monclass = await name_to_monclass(bufp, P(d, "which")) << 24 >> 24;
  if (d.which >= LOW_PM) {
    d.monclass = MAXMCLASSES;
    return TRUE;
  } else if (d.monclass === S_invisible) {
    d.which = PM_STALKER;
    d.monclass = MAXMCLASSES;
    return TRUE;
  } else if (d.monclass === S_WORM_TAIL) {
    d.which = PM_LONG_WORM;
    d.monclass = MAXMCLASSES;
    return TRUE;
  } else if (d.monclass > 0) {
    d.which = G.urole.malenum;
    return TRUE;
  }
  return FALSE;
}

export async function create_particular_creation(d: struct__create_particular_data | null): Promise<number> {
  let $t1: any, $t2: any;
  let whichpm = null;
  let i = 0;
  let mx = 0;
  let my = 0;
  let firstchoice = NON_PM;
  let mtmp = null;
  let madeany = FALSE;
  if (!d.randmonst) {
    firstchoice = d.which;
    if (cant_revive(P(d, "which"), FALSE, null) && firstchoice !== PM_LONG_WORM_TAIL) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("Creating %s instead; force %s?"), G.mons[d.which].mname, G.mons[firstchoice].mname);
      if (await yn_function(P(buf), P(G.ynchars), 110) === 121) {
        d.which = firstchoice;
      }
    }
    whichpm = $sat(G.mons, d.which);
  }
  for (i = 0; i <= G.multi; ++i) {
    if (d.monclass !== MAXMCLASSES) {
      whichpm = await mkclass(d.monclass, 0);
    } else if (d.randmonst) {
      whichpm = await rndmonst();
    }
    mtmp = await makemon(whichpm, G.u.ux, G.u.uy, NO_MM_FLAGS);
    if (!mtmp) {
      if (d.monclass === MAXMCLASSES && !d.randmonst) {
        break;
      }
      continue;
    }
    mx = mtmp.mx, my = mtmp.my;
    if (d.fem !== -1 && !((mtmp.data.mflags2 & 65536) >>> 0 !== 0) && !((mtmp.data.mflags2 & 131072) >>> 0 !== 0)) {
      mtmp.female = (d.fem >>> 0) & 1;
    }
    if (d.maketame) {
      await tamedog(mtmp, null);
    } else if (d.makepeaceful || d.makehostile) {
      mtmp.mtame = 0;
      mtmp.mpeaceful = ((d.makepeaceful ? 1 : 0) >>> 0) & 1;
      set_malign(mtmp);
    }
    if (d.saddled && can_saddle(mtmp) && !await which_armor(mtmp, W_SADDLE)) {
      let otmp = await mksobj(SADDLE, TRUE, FALSE);
      await put_saddle_on_mon(otmp, mtmp);
    }
    if (d.invisible) {
      await mon_set_minvis(mtmp);
      if (does_block(mx, my, $sat(G.level.locations[mx], my))) {
        block_point(mx, my);
      } else {
        unblock_point(mx, my);
      }
    }
    if (d.hidden && ((mtmp.data.mflags1 & 256) >>> 0 !== 0 && mtmp.data.mlet !== S_MIMIC || (mtmp.data.mflags1 & 128) >>> 0 !== 0 && !!G.level.objects[mx][my] || mtmp.data.mlet === S_EEL && is_pool(mx, my))) {
      mtmp.mundetected = 1;
    }
    if (d.sleeping) {
      mtmp.msleeping = 1;
    }
    if (d.hidden && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      let count = $rd(G.viz_array.a[G.viz_array.o + my], mx) & 1 ? 8 : 4;
      let saveviz = $rd(G.viz_array.a[G.viz_array.o + my], mx);
      if (!G.flags.sparkle) {
        count = count / 2 | 0;
      }
      ($t1 = G.viz_array.a[G.viz_array.o + my], $t2 = mx, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] | (IN_SIGHT | COULD_SEE)) << 24 >> 24);
      await flash_glyph_at(mx, my, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mtmp.data)) + 0, count);
      $wr(G.viz_array.a[G.viz_array.o + my], mx, saveviz);
      await newsym(mx, my);
    }
    madeany = TRUE;
    if (mtmp.cham !== NON_PM && firstchoice !== NON_PM && mtmp.cham !== firstchoice) {
      await newcham(mtmp, $sat(G.mons, firstchoice), FALSE, FALSE);
    }
  }
  return madeany;
}

export async function create_particular(): Promise<number> {
  let buf = new Int8Array(256);
  let bufp = null;
  let tryct = 5;
  let d = new struct__create_particular_data();
  do {
    await G.windowprocs.win_getlin(S("Create what kind of monster? [type the name or symbol]"), P(buf));
    bufp = mungspaces(P(buf));
    if (bufp.a[bufp.o] === 27) {
      return FALSE;
    }
    if (await create_particular_parse(bufp, d)) {
      break;
    }
    await pline(S("I've never heard of such monsters."));
  } while (--tryct > 0);
  if (!tryct) {
    await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
  } else {
    return await create_particular_creation(d);
  }
  return FALSE;
}

export function $init(): void {
  G.known = 0;
  readable = $ta(Int8Array, 4, [ALL_CLASSES, SCROLL_CLASS, SPBOOK_CLASS]);
  all_count = $ta(Int8Array, 3, [ALLOW_COUNT, ALL_CLASSES]);
  gremlins = null;
  tshirt_text$shirt_msgs = [S("I explored the Dungeons of Doom and all I got was this lousy T-shirt!"),
S("Is that Mjollnir in your pocket or are you just happy to see me?"),
S("It's not the size of your sword, it's how #enhance'd you are with it."),
S("Madame Elvira's House O' Succubi Lifetime Customer"),
S("Madame Elvira's House O' Succubi Employee of the Month"),
S("Ludios Vault Guards Do It In Small, Dark Rooms"),
S("Yendor Military Soldiers Do It In Large Groups"),
S("I survived Yendor Military Boot Camp"),
S("Ludios Accounting School Intra-Mural Lacrosse Team"),
S("Oracle(TM) Fountains 10th Annual Wet T-Shirt Contest"),
S("Hey, black dragon!  Disintegrate THIS!"),
S("I'm With Stupid -->"),
S("Don't blame me, I voted for Izchak!"),
S("Don't Panic"),
S("Furinkan High School Athletic Dept."),
S("Hel-LOOO, Nurse!"),
S("=^.^="),
S("100% goblin hair - do not wash"),
S("Aberzombie and Fitch"),
S("cK -- Cockatrice touches the Kop"),
S("Don't ask me, I only adventure here"),
S("Down with pants!"),
S("d, your dog or a killer?"),
S("FREE PUG AND NEWT!"),
S("Go team ant!"),
S("Got newt?"),
S("Hello, my darlings!"),
S("Hey!  Nymphs!  Steal This T-Shirt!"),
S("I <3 Dungeon of Doom"),
S("I <3 Maud"),
S("I am a Valkyrie.  If you see me running, try to keep up."),
S("I am not a pack rat - I am a collector"),
S("I bounced off a rubber tree"),
S("Plunder Island Brimstone Beach Club"),
S("If you can read this, I can hit you with my polearm"),
S("I'm confused!"),
S("I scored with the princess"),
S("I want to live forever or die in the attempt."),
S("Lichen Park"),
S("LOST IN THOUGHT - please send search party"),
S("Meat is Mordor"),
S("Minetown Better Business Bureau"),
S("Minetown Watch"),
S("Ms. Palm's House of Negotiable Affection -- A Very Reputable House Of Disrepute"),
S("Protection Racketeer"),
S("Real men love Crom"),
S("Somebody stole my Mojo!"),
S("The Hellhound Gang"),
S("The Werewolves"),
S("They Might Be Storm Giants"),
S("Weapons don't kill people, I kill people"),
S("White Zombie"),
S("You're killing me!"),
S("Anhur State University - Home of the Fighting Fire Ants!"),
S("FREE HUGS"),
S("Serial Ascender"),
S("Real men are valkyries"),
S("Young Men's Cavedigging Association"),
S("Occupy Fort Ludios"),
S("I couldn't afford this T-shirt so I stole it!"),
S("Mind flayers suck"),
S("I'm not wearing any pants"),
S("Down with the living!"),
S("Pudding farmer"),
S("Vegetarian"),
S("Hello, I'm War!"),
S("It is better to light a candle than to curse the darkness"),
S("It is easier to curse the darkness than to light a candle"),
S("rock--paper--scissors--lizard--Spock!"),
S("/Valar morghulis/ -- /Valar dohaeris/")];
  apron_text$apron_msgs = [S("Kiss the cook"),
S("I'm making SCIENCE!"),
S("Don't mess with the chef"),
S("Don't make me poison you"),
S("Gehennom's Kitchen"),
S("Rat: The other white meat"),
S("If you can't stand the heat, get out of Gehennom!"),
S("If we weren't meant to eat animals, why are they made out of meat?"),
S("If you don't like the food, I'll stab you")];
  doread$card_msgs = [S("Leprechaun Gold Tru$t - Shamrock Card"),
S("Magic Memory Vault Charge Card"),
S("Larn National Bank"),
S("First Bank of Omega"),
S("Bank of Zork - Frobozz Magic Card"),
S("Ankh-Morpork Merchant's Guild Barter Card"),
S("Ankh-Morpork Thieves' Guild Unlimited Transaction Card"),
S("Ransmannsby Moneylenders Association"),
S("Bank of Gehennom - 99% Interest Card"),
S("Yendorian Express - Copper Card"),
S("Yendorian Express - Silver Card"),
S("Yendorian Express - Gold Card"),
S("Yendorian Express - Mithril Card"),
S("Yendorian Express - Platinum Card")];
  doread$wrapper_msgs = [S("Apollo"),
S("Moon Crunchy"),
S("Snacky Cake"),
S("Chocolate Nuggie"),
S("The Small Bar"),
S("Crispy Yum Yum"),
S("Nilla Crunchie"),
S("Berry Bar"),
S("Choco Nummer"),
S("Om-nom"),
S("Fruity Oaty"),
S("Wonka Bar")];
}
