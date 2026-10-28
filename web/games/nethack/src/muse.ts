// @ts-nocheck
// NetHack 3.6.7 muse.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { arti_reflects, undiscovered_artifact } from './artifact.ts';
import { isok } from './cmd.ts';
import { destroy_drawbridge, find_drawbridge, is_drawbridge_wall, is_ice, is_lava, is_pool } from './dbridge.ts';
import { cls, docrt, map_invisible, newsym, shieldeff, show_glyph } from './display.ts';
import { canletgo, dropy } from './do.ts';
import { Monnam, a_monnam, docall, hcolor, mon_nam, mon_nam_too, noit_mon_nam, rndmonnam, x_monnam } from './do_name.ts';
import { migrate_to_level } from './dog.ts';
import { dog_nutrition } from './dogmove.ts';
import { Can_dig_down, Can_fall_thru, Can_rise_up, In_V_tower, In_hell, Is_botlevel, On_W_tower_level, depth, dunlev, dunlevs_in_dungeon, get_level, ledger_no, on_level } from './dungeon.ts';
import { ceiling, surface } from './engrave.ts';
import { explode } from './explode.ts';
import { in_rooms, losehp, nomul } from './hack.ts';
import { dist2, distmin, s_suffix, sgn, strstri, upstart } from './hacklib.ts';
import { freeinv, sobj_at } from './invent.ts';
import { doorlock } from './lock.ts';
import { grow_up, makemon, rndmonst, set_malign } from './makemon.ts';
import { paralyze_monst } from './mhitm.ts';
import { bcsign, place_object, unbless } from './mkobj.ts';
import { mondead, mongone, monkilled, newcham, seemimic, xkilled } from './mon.ts';
import { attacktype, attacktype_fordmg, can_blow, dmgtype, locomotion, mon_hates_silver, monsndx, pronoun_gender, resists_magm } from './mondata.ts';
import { accessible, closed_door, monflee, onscary } from './monmove.ts';
import { lined_up, m_carrying, m_throw, m_useup } from './mthrowu.ts';
import { awaken_soldiers } from './music.ts';
import { discover_object } from './o_init.ts';
import { an, distant_name, doname, makeplural, singular, the, vtense, xname } from './objnam.ts';
import { You_feel, You_hear, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part } from './polyself.ts';
import { in_your_sanctuary } from './priest.ts';
import { drop_boulder_on_monster, drop_boulder_on_player } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { add_damage, inhishop } from './shk.ts';
import { mpickobj, remove_worn_item } from './steal.ts';
import { place_monster } from './steed.ts';
import { enexto, random_teleport_level, rloc, tele_restrict } from './teleport.ts';
import { maketrap, mintrap, seetrap, t_at, unconscious } from './trap.ts';
import { unblock_point } from './vision.ts';
import { mwelded, welded } from './wield.ts';
import { mon_has_amulet, mon_has_special } from './wizard.ts';
import { worm_known, worm_move } from './worm.ts';
import { find_mac, mon_adjust_speed, mon_set_minvis, which_armor } from './worn.ts';
import { bhito, buzz, cancel_monst, exclam, hit, miss, resist, zhitm } from './zap.ts';
import { struct_d_level, struct_monst, struct_musable, struct_nhcoord, struct_obj, struct_permonst, struct_trap } from './structs.ts';
import { $arr, $at2, $rd, $sat, $wr, G, P, S, rn2_on_display_rng, strcmp, strcpy } from './rt/index.ts';
import { AD_COLD, AD_FIRE, AD_HEAL, AD_RBRE, AIR, ALTAR, AMULET_CLASS, AMULET_OF_LIFE_SAVING, AMULET_OF_REFLECTION, ANTIMAGIC, ARTICLE_A, AT_BREA, AT_EXPL, AT_GAZE, BEAR_TRAP, BLINDED, BOLT_LIM, BOULDER, BUGLE, BULLWHIP, CLOUD, CLR_BRIGHT_GREEN, CLR_GREEN, CORPSE, CORR, DEAF, DETECT_MONSTERS, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_CLOSED, D_LOCKED, EGG, EXPL_FIERY, FALSE, FIRE_HORN, FIRE_TRAP, FOOD_CLASS, FROST_HORN, G_GONE, HALF_SPDAM, HALLUC, HALLUC_RES, HAND, HEAVY_IRON_BALL, HOLE, INFRAVISION, IRON, KILLED_BY_AN, LADDER, MFAST, MIGR_LADDER_DOWN, MIGR_LADDER_UP, MIGR_RANDOM, MIGR_SSTAIRS, MIGR_STAIRS_DOWN, MIGR_STAIRS_UP, MITHRIL, MUSE_BUGLE, MUSE_BULLWHIP, MUSE_DN_LADDER, MUSE_DOWNSTAIRS, MUSE_FIRE_HORN, MUSE_FROST_HORN, MUSE_LIZARD_CORPSE, MUSE_POLY_TRAP, MUSE_POT_ACID, MUSE_POT_BLINDNESS, MUSE_POT_CONFUSION, MUSE_POT_EXTRA_HEALING, MUSE_POT_FULL_HEALING, MUSE_POT_GAIN_LEVEL, MUSE_POT_HEALING, MUSE_POT_INVISIBILITY, MUSE_POT_PARALYSIS, MUSE_POT_POLYMORPH, MUSE_POT_SLEEPING, MUSE_POT_SPEED, MUSE_SCR_CREATE_MONSTER, MUSE_SCR_EARTH, MUSE_SCR_TELEPORTATION, MUSE_SSTAIRS, MUSE_TELEPORT_TRAP, MUSE_TRAPDOOR, MUSE_UNICORN_HORN, MUSE_UPSTAIRS, MUSE_UP_LADDER, MUSE_WAN_COLD, MUSE_WAN_CREATE_MONSTER, MUSE_WAN_DEATH, MUSE_WAN_DIGGING, MUSE_WAN_FIRE, MUSE_WAN_LIGHTNING, MUSE_WAN_MAGIC_MISSILE, MUSE_WAN_MAKE_INVISIBLE, MUSE_WAN_POLYMORPH, MUSE_WAN_SLEEP, MUSE_WAN_SPEED_MONSTER, MUSE_WAN_STRIKING, MUSE_WAN_TELEPORTATION, MUSE_WAN_TELEPORTATION_SELF, M_AP_FURNITURE, M_AP_NOTHING, M_AP_OBJECT, NON_PM, NORMAL_SPEED, NO_MM_FLAGS, PICK_AXE, PIT, PM_ACID_BLOB, PM_CHROMATIC_DRAGON, PM_CROCODILE, PM_DJINNI, PM_GHOST, PM_GIANT_EEL, PM_GREEN_SLIME, PM_GREY_ELF, PM_GUARD, PM_LIZARD, PM_PESTILENCE, PM_SILVER_DRAGON, PM_STALKER, PM_VLAD_THE_IMPALER, POLY_TRAP, POOL, POTION_CLASS, POT_ACID, POT_BLINDNESS, POT_CONFUSION, POT_EXTRA_HEALING, POT_FULL_HEALING, POT_GAIN_LEVEL, POT_HEALING, POT_INVISIBILITY, POT_PARALYSIS, POT_POLYMORPH, POT_SICKNESS, POT_SLEEPING, POT_SPEED, P_DAGGER, P_KNIFE, RAY, REFLECTING, SCORR, SCROLL_CLASS, SCR_CREATE_MONSTER, SCR_EARTH, SCR_FIRE, SCR_TELEPORTATION, SDOOR, SEE_INVIS, SHIELD_OF_REFLECTION, SHOPBASE, SILVER, SILVER_DRAGON_SCALES, SILVER_DRAGON_SCALE_MAIL, SPIKED_PIT, STAIRS, STRANGE_OBJECT, STRAT_WAITFORU, SUPPRESS_INVISIBLE, SUPPRESS_IT, SUPPRESS_SADDLE, S_EYE, S_GHOST, S_GOLEM, S_KOP, S_LIGHT, S_UNICORN, S_VORTEX, TELEPAT, TELEP_TRAP, TELL, TIN, TIN_OPENER, TOOL_CLASS, TRAPDOOR, TRUE, UNICORN_HORN, WAND_BACKFIRE_CHANCE, WAND_CLASS, WAN_COLD, WAN_CREATE_MONSTER, WAN_DEATH, WAN_DIGGING, WAN_FIRE, WAN_LIGHTNING, WAN_MAGIC_MISSILE, WAN_MAKE_INVISIBLE, WAN_POLYMORPH, WAN_SLEEP, WAN_SPEED_MONSTER, WAN_STRIKING, WAN_TELEPORTATION, WARN_OF_MON, WEAPON_CLASS, WEB, W_AMUL, W_ARM, W_ARMG, W_ARMH, W_ARMS, W_NONDIGGABLE, W_WEP, XKILL_NOCONDUCT, XKILL_NOMSG } from './consts.ts';

let m: struct_musable;
let trapx: number;
let trapy: number;
let zap_oseen: number;
let precheck$empty: Ptr | null;

async function precheck(mon: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let vis = 0;
  if (!obj) {
    return 0;
  }
  vis = ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) << 24 >> 24;
  if (obj.oclass === POTION_CLASS) {
    let cc = new struct_nhcoord();
    let potion_descr = null;
    let mtmp = null;
    potion_descr = G.obj_descr[G.objects[obj.otyp].oc_descr_idx].oc_descr;
    if (potion_descr && !strcmp(potion_descr, S("milky"))) {
      if (!(G.mvitals[PM_GHOST].mvflags & G_GONE) && !rn2(13 + 2 * G.mvitals[283].born)) {
        if (!await enexto(cc, mon.mx, mon.my, $sat(G.mons, PM_GHOST))) {
          return 0;
        }
        await mquaffmsg(mon, obj);
        await m_useup(mon, obj);
        mtmp = await makemon($sat(G.mons, PM_GHOST), cc.x, cc.y, NO_MM_FLAGS);
        if (!mtmp) {
          if (vis) {
            await pline(S("%s"), precheck$empty);
          }
        } else {
          if (vis) {
            await pline(S("As %s opens the bottle, an enormous %s emerges!"), await mon_nam(mon), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("ghost"));
            await pline(S("%s is frightened to death, and unable to move."), await Monnam(mon));
          }
          paralyze_monst(mon, 3);
        }
        return 2;
      }
    }
    if (potion_descr && !strcmp(potion_descr, S("smoky")) && !(G.mvitals[PM_DJINNI].mvflags & G_GONE) && !rn2(13 + 2 * G.mvitals[312].born)) {
      if (!await enexto(cc, mon.mx, mon.my, $sat(G.mons, PM_DJINNI))) {
        return 0;
      }
      await mquaffmsg(mon, obj);
      await m_useup(mon, obj);
      mtmp = await makemon($sat(G.mons, PM_DJINNI), cc.x, cc.y, NO_MM_FLAGS);
      if (!mtmp) {
        if (vis) {
          await pline(S("%s"), precheck$empty);
        }
      } else {
        if (vis) {
          await pline(S("In a cloud of smoke, %s emerges!"), await a_monnam(mtmp));
        }
        await pline(S("%s speaks."), vis ? await Monnam(mtmp) : G.c_common_strings.c_Something);
        if (rn2(2)) {
          await verbalize(S("You freed me!"));
          mtmp.mpeaceful = 1;
          set_malign(mtmp);
        } else {
          await verbalize(S("It is about time."));
          if (vis) {
            await pline(S("%s vanishes."), await Monnam(mtmp));
          }
          await mongone(mtmp);
        }
      }
      return 2;
    }
  }
  if (obj.oclass === WAND_CLASS && obj.cursed | 0 && !rn2(WAND_BACKFIRE_CHANCE)) {
    let dam = d(obj.spe + 2, 6);
    if (vis) {
      await pline(S("%s zaps %s, which suddenly explodes!"), await Monnam(mon), await an(await xname(obj)));
    } else {
      let range = $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? BOLT_LIM + 1 : BOLT_LIM - 3;
      await You_hear(S("a zap and an explosion %s."), dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= Math.imul(range, range) ? S("nearby") : S("in the distance"));
    }
    await m_useup(mon, obj);
    mon.mhp -= dam;
    if (mon.mhp < 1) {
      await monkilled(mon, S(""), AD_RBRE);
      return 1;
    }
    m.has_defense = m.has_offense = m.has_misc = 0;
  }
  return 0;
}

async function mzapwand(mtmp: struct_monst | null, otmp: struct_obj | null, self: number): Promise<void> {
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
    let range = $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? BOLT_LIM + 1 : BOLT_LIM - 3;
    await You_hear(S("a %s zap."), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= Math.imul(range, range) ? S("nearby") : S("distant"));
    otmp.known = 0;
  } else if (self) {
    await pline(S("%s zaps %sself with %s!"), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].him, await doname(otmp));
  } else {
    await pline(S("%s zaps %s!"), await Monnam(mtmp), await an(await xname(otmp)));
    await stop_occupation();
  }
  otmp.spe = otmp.spe - 1 << 24 >> 24;
}

async function mplayhorn(mtmp: struct_monst | null, otmp: struct_obj | null, self: number): Promise<void> {
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
    let range = $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? BOLT_LIM + 1 : BOLT_LIM - 3;
    await You_hear(S("a horn being played %s."), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= Math.imul(range, range) ? S("nearby") : S("in the distance"));
    otmp.known = 0;
  } else {
    otmp.dknown = 1;
    await pline(S("%s plays a %s directed at %s!"), await Monnam(mtmp), await xname(otmp), self ? await mon_nam_too(mtmp, mtmp) : S("you"));
    await discover_object(otmp.otyp, 1, 1);
    if (!self) {
      await stop_occupation();
    }
  }
  otmp.spe = otmp.spe - 1 << 24 >> 24;
}

async function mreadmsg(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<void> {
  let vismon = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
  let onambuf = new Int8Array(256);
  let saverole = 0;
  let savebknown = 0;
  if (!vismon && (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    return;
  }
  otmp.dknown = 1;
  savebknown = otmp.bknown;
  saverole = G.urole.malenum;
  if (!vismon) {
    otmp.bknown = 0;
    if (G.urole.malenum === 335) {
      G.urole.malenum = 0;
    }
  }
  strcpy(P(onambuf), await singular(otmp, doname));
  G.urole.malenum = saverole;
  otmp.bknown = (savebknown) & 1;
  if (vismon) {
    await pline(S("%s reads %s!"), await Monnam(mtmp), P(onambuf));
  } else {
    await You_hear(S("%s reading %s."), await x_monnam(mtmp, ARTICLE_A, null, SUPPRESS_IT | SUPPRESS_INVISIBLE | SUPPRESS_SADDLE, FALSE), P(onambuf));
  }
  if (mtmp.mconf) {
    await pline(S("Being confused, %s mispronounces the magic words..."), vismon ? await mon_nam(mtmp) : G.genders[pronoun_gender(mtmp, 0)].he);
  }
}

async function mquaffmsg(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<void> {
  if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
    otmp.dknown = 1;
    await pline(S("%s drinks %s!"), await Monnam(mtmp), await singular(otmp, doname));
  } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    await You_hear(S("a chugging sound."));
  }
}

function m_use_healing(mtmp: struct_monst | null): number {
  let obj = null;
  if (!!(obj = m_carrying(mtmp, POT_FULL_HEALING))) {
    m.defensive = obj;
    m.has_defense = MUSE_POT_FULL_HEALING;
    return TRUE;
  }
  if (!!(obj = m_carrying(mtmp, POT_EXTRA_HEALING))) {
    m.defensive = obj;
    m.has_defense = MUSE_POT_EXTRA_HEALING;
    return TRUE;
  }
  if (!!(obj = m_carrying(mtmp, POT_HEALING))) {
    m.defensive = obj;
    m.has_defense = MUSE_POT_HEALING;
    return TRUE;
  }
  return FALSE;
}

export async function find_defensive(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let obj = null;
  let t = null;
  let x = 0;
  let y = 0;
  let stuck = 0;
  let immobile = 0;
  let fraction = 0;
  let xx$2 = 0;
  let yy$2 = 0;
  let mon = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      obj = null;
      x = mtmp.mx;
      y = mtmp.my;
      stuck = (mtmp === G.u.ustuck ? 1 : 0) << 24 >> 24;
      immobile = (mtmp.data.mmove === 0 ? 1 : 0) << 24 >> 24;
      if ((mtmp.data.mflags1 & 262144) >>> 0 !== 0 || (mtmp.data.mflags1 & 65536) >>> 0 !== 0) {
        return FALSE;
      }
      if (dist2(x, y, mtmp.mux, mtmp.muy) > 25) {
        return FALSE;
      }
      if (G.u.uswallow | 0 && stuck) {
        return FALSE;
      }
      m.defensive = null;
      m.has_defense = 0;
      if (mtmp.mconf | 0 || mtmp.mstun | 0 || !mtmp.mcansee) {
        if (!(mtmp.data.mlet === S_UNICORN && (mtmp.data.mflags2 & 536870912) >>> 0 !== 0) && !((mtmp.data.mflags1 & 8192) >>> 0 !== 0)) {
          for (obj = mtmp.minvent; obj; obj = obj.nobj) {
            if (obj.otyp === UNICORN_HORN && !obj.cursed) {
              break;
            }
          }
        }
        if (obj || mtmp.data.mlet === S_UNICORN && (mtmp.data.mflags2 & 536870912) >>> 0 !== 0) {
          m.defensive = obj;
          m.has_defense = MUSE_UNICORN_HORN;
          return TRUE;
        }
      }
      if (mtmp.mconf | 0 || mtmp.mstun | 0) {
        let liztin = null;
        for (obj = mtmp.minvent; obj; obj = obj.nobj) {
          if (obj.otyp === CORPSE && obj.corpsenm === PM_LIZARD) {
            m.defensive = obj;
            m.has_defense = MUSE_LIZARD_CORPSE;
            return TRUE;
          } else if (obj.otyp === TIN && obj.corpsenm === PM_LIZARD) {
            liztin = obj;
          }
        }
        if (liztin && mcould_eat_tin(mtmp) && rn2(3)) {
          m.defensive = liztin;
          m.has_defense = MUSE_LIZARD_CORPSE;
          return TRUE;
        }
      }
      if (!mtmp.mcansee && !((mtmp.data.mflags1 & 8192) >>> 0 !== 0) && mtmp.data !== $sat(G.mons, PM_PESTILENCE)) {
        if (m_use_healing(mtmp)) {
          return TRUE;
        }
      }
      fraction = G.u.ulevel < 10 ? 5 : G.u.ulevel < 14 ? 4 : 3;
      if (mtmp.mhp >= mtmp.mhpmax || mtmp.mhp >= 10 && Math.imul(mtmp.mhp, fraction) >= mtmp.mhpmax) {
        return FALSE;
      }
      if (mtmp.mpeaceful) {
        if (!((mtmp.data.mflags1 & 8192) >>> 0 !== 0)) {
          if (m_use_healing(mtmp)) {
            return TRUE;
          }
        }
        return FALSE;
      }
      if (stuck || immobile) {
        ;
      } else if ($at2(G.level.locations, x, y).typ === STAIRS) {
        if (x === G.dnstair.sx && y === G.dnstair.sy) {
          if (!(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) {
            m.has_defense = MUSE_DOWNSTAIRS;
          }
        } else if (x === G.upstair.sx && y === G.upstair.sy) {
          m.has_defense = MUSE_UPSTAIRS;
        } else if (G.sstairs.sx && x === G.sstairs.sx && y === G.sstairs.sy) {
          if (G.sstairs.up || !(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) {
            m.has_defense = MUSE_SSTAIRS;
          }
        }
      } else if ($at2(G.level.locations, x, y).typ === LADDER) {
        if (x === G.upladder.sx && y === G.upladder.sy) {
          m.has_defense = MUSE_UP_LADDER;
        } else if (x === G.dnladder.sx && y === G.dnladder.sy) {
          if (!(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) {
            m.has_defense = MUSE_DN_LADDER;
          }
        } else if (G.sstairs.sx && x === G.sstairs.sx && y === G.sstairs.sy) {
          if (G.sstairs.up || !(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) {
            m.has_defense = MUSE_SSTAIRS;
          }
        }
      } else {
        let xx = 0;
        let yy = 0;
        let i = 0;
        let locs = $arr(10, () => new Int32Array(2));
        let ignore_boulders = (mtmp.data.msize < 1 || (mtmp.data.mflags2 & 134217728) >>> 0 !== 0 || (mtmp.data.mflags1 & 8) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
        let diag_ok = (!(await monsndx(mtmp.data) === 115) ? 1 : 0) << 24 >> 24;
        for (i = 0; i < 10; ++i) {
          locs[i][0] = locs[i][1] = 0;
        }
        locs[0][0] = x, locs[0][1] = y;
        i = 1;
        for (xx = x - 1; xx <= x + 1; ++xx) {
          for (yy = y - 1; yy <= y + 1; ++yy) {
            if (isok(xx, yy) && (xx !== x || yy !== y)) {
              locs[i][0] = xx, locs[i][1] = yy;
              ++i;
            }
          }
        }
        for (i = 0; i < 10; ++i) {
          xx = locs[i][0], yy = locs[i][1];
          if (!xx) {
            break;
          }
          if (xx === G.u.ux && yy === G.u.uy || xx !== x && yy !== y && !diag_ok || G.level.monsters[xx][yy] && !(xx === x && yy === y)) {
            continue;
          }
          if (!(t = t_at(xx, yy)) || !ignore_boulders && sobj_at(BOULDER, xx, yy) || onscary(xx, yy, mtmp)) {
            continue;
          }
          if (((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR) && !(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT) && !mtmp.isshk && !mtmp.isgd && !mtmp.ispriest && Can_fall_thru(G.u.uz)) {
            trapx = xx;
            trapy = yy;
            m.has_defense = MUSE_TRAPDOOR;
            break;
          } else if ((t.ttyp | 0) === TELEP_TRAP) {
            trapx = xx;
            trapy = yy;
            m.has_defense = MUSE_TELEPORT_TRAP;
          }
        }
      }
      if ((mtmp.data.mflags1 & 8192) >>> 0 !== 0) {
        { $g = 1; continue $L; }
      }
      if (!((mtmp.data.mflags2 & 512) >>> 0 !== 0 && !!(obj = m_carrying(mtmp, BUGLE)))) { $g = 3; continue $L; }
      for (xx$2 = x - 3; xx$2 <= x + 3; ++xx$2) {
        for (yy$2 = y - 3; yy$2 <= y + 3; ++yy$2) {
          if (!isok(xx$2, yy$2) || xx$2 === x && yy$2 === y) {
            continue;
          }
          if (!!(mon = !!G.level.monsters[xx$2][yy$2] ? G.level.monsters[xx$2][yy$2] : null) && (mon.data.mflags2 & 512) >>> 0 !== 0 && mon.data !== $sat(G.mons, PM_GUARD) && (mon.msleeping | 0 || !mon.mcanmove)) {
            m.defensive = obj;
            m.has_defense = MUSE_BUGLE;
            { $g = 2; continue $L; }
          }
        }
      }
    case 2: // toot
      ;
    case 3:
      if (m.has_defense) {
        { $g = 1; continue $L; }
      }
      t = t_at(x, y);
      if (t && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT || (t.ttyp | 0) === WEB || (t.ttyp | 0) === BEAR_TRAP)) {
        t = null;
      }
      for (obj = mtmp.minvent; obj; obj = obj.nobj) {
        if (m.has_defense && !rn2(3)) {
          break;
        }
        if (m.has_defense === MUSE_WAN_DIGGING) {
          break;
        }
        if (obj.otyp === WAN_DIGGING && obj.spe > 0 && !stuck && !t && !mtmp.isshk && !mtmp.isgd && !mtmp.ispriest && !(mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT) && !G.level.flags.sokoban_rules && !(($at2(G.level.locations, x, y).flags | 0) & W_NONDIGGABLE) && !(Is_botlevel(G.u.uz) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) && !(is_ice(x, y) || is_pool(x, y) || is_lava(x, y)) && !(mtmp.data === $sat(G.mons, PM_VLAD_THE_IMPALER) && In_V_tower(G.u.uz))) {
          m.defensive = obj;
          m.has_defense = MUSE_WAN_DIGGING;
        }
        if (m.has_defense === 2) {
          continue;
        }
        ;
        if (m.has_defense === 15) {
          continue;
        }
        ;
        if (obj.otyp === WAN_TELEPORTATION && obj.spe > 0) {
          if (!G.level.flags.noteleport || !(mtmp.mtrapseen & 1 << TELEP_TRAP - 1)) {
            m.defensive = obj;
            m.has_defense = mon_has_amulet(mtmp) ? MUSE_WAN_TELEPORTATION : MUSE_WAN_TELEPORTATION_SELF;
          }
        }
        if (m.has_defense === 1) {
          continue;
        }
        ;
        if (obj.otyp === SCR_TELEPORTATION && mtmp.mcansee | 0 && (mtmp.data.mflags1 & 4096) >>> 0 === 0 && (!obj.cursed || !(mtmp.isshk | 0 && inhishop(mtmp)) && !mtmp.isgd && !mtmp.ispriest)) {
          if (!G.level.flags.noteleport || !(mtmp.mtrapseen & 1 << TELEP_TRAP - 1)) {
            m.defensive = obj;
            m.has_defense = MUSE_SCR_TELEPORTATION;
          }
        }
        if (mtmp.data !== $sat(G.mons, PM_PESTILENCE)) {
          if (m.has_defense === 18) {
            continue;
          }
          ;
          if (obj.otyp === POT_FULL_HEALING) {
            m.defensive = obj;
            m.has_defense = MUSE_POT_FULL_HEALING;
          }
          if (m.has_defense === 4) {
            continue;
          }
          ;
          if (obj.otyp === POT_EXTRA_HEALING) {
            m.defensive = obj;
            m.has_defense = MUSE_POT_EXTRA_HEALING;
          }
          if (m.has_defense === 10) {
            continue;
          }
          ;
          if (obj.otyp === WAN_CREATE_MONSTER && obj.spe > 0) {
            m.defensive = obj;
            m.has_defense = MUSE_WAN_CREATE_MONSTER;
          }
          if (m.has_defense === 3) {
            continue;
          }
          ;
          if (obj.otyp === POT_HEALING) {
            m.defensive = obj;
            m.has_defense = MUSE_POT_HEALING;
          }
        } else {
          if (m.has_defense === 18) {
            continue;
          }
          ;
          if (obj.otyp === POT_SICKNESS) {
            m.defensive = obj;
            m.has_defense = MUSE_POT_FULL_HEALING;
          }
          if (m.has_defense === 10) {
            continue;
          }
          ;
          if (obj.otyp === WAN_CREATE_MONSTER && obj.spe > 0) {
            m.defensive = obj;
            m.has_defense = MUSE_WAN_CREATE_MONSTER;
          }
        }
        if (m.has_defense === 11) {
          continue;
        }
        ;
        if (obj.otyp === SCR_CREATE_MONSTER) {
          m.defensive = obj;
          m.has_defense = MUSE_SCR_CREATE_MONSTER;
        }
      }
    case 1: // botm
      return (!!m.has_defense ? 1 : 0) << 24 >> 24;
    }
    break;
  }
}

export async function use_defensive(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let i = 0;
  let fleetim = 0;
  let how = 0;
  let otmp = null;
  let vis = 0;
  let vismon = 0;
  let oseen = 0;
  let Mnam = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      how = 0;
      otmp = m.defensive;
      if ((i = await precheck(mtmp, otmp)) !== 0) {
        return i;
      }
      vis = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) << 24 >> 24;
      vismon = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
      oseen = (otmp && vismon ? 1 : 0) << 24 >> 24;
      fleetim = !mtmp.mflee ? 33 - (30 * mtmp.mhp / mtmp.mhpmax | 0) : 0;
      switch (m.has_defense) {
      case 17: { $g = 4; continue $L; }
      case 16: { $g = 5; continue $L; }
      case 2: { $g = 6; continue $L; }
      case 15: { $g = 7; continue $L; }
      case 1: { $g = 8; continue $L; }
      case 5: { $g = 9; continue $L; }
      case 10: { $g = 10; continue $L; }
      case 11: { $g = 11; continue $L; }
      case 6: { $g = 12; continue $L; }
      case 8: { $g = 13; continue $L; }
      case 9: { $g = 14; continue $L; }
      case 12: { $g = 15; continue $L; }
      case 13: { $g = 16; continue $L; }
      case 14: { $g = 17; continue $L; }
      case 7: { $g = 18; continue $L; }
      case 3: { $g = 19; continue $L; }
      case 4: { $g = 20; continue $L; }
      case 18: { $g = 21; continue $L; }
      case 19: { $g = 22; continue $L; }
      case 0: { $g = 23; continue $L; }
      default: { $g = 24; continue $L; }
      }
    case 4:
      if (vismon) {
        if (otmp) {
          await pline(S("%s uses a unicorn horn!"), await Monnam(mtmp));
        } else {
          await pline_The(S("tip of %s's horn glows!"), await mon_nam(mtmp));
        }
      }
      if (!mtmp.mcansee) {
        await mcureblindness(mtmp, vismon);
      } else if (mtmp.mconf | 0 || mtmp.mstun | 0) {
        mtmp.mconf = (mtmp.mstun = 0) & 1;
        if (vismon) {
          await pline(S("%s seems steadier now."), await Monnam(mtmp));
        }
      } else {
        await impossible(S("No need for unicorn horn?"));
      }
      return 2;
    case 5:
      if (vismon) {
        await pline(S("%s plays %s!"), await Monnam(mtmp), await doname(otmp));
      } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await You_hear(S("a bugle playing reveille!"));
      }
      await awaken_soldiers(mtmp);
      return 2;
    case 6:
      if (mtmp.isshk | 0 && inhishop(mtmp) || mtmp.isgd | 0 || mtmp.ispriest | 0) {
        return 2;
      }
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      await mzapwand(mtmp, otmp, TRUE);
      how = WAN_TELEPORTATION;
    case 1: // mon_tele
      if (await tele_restrict(mtmp)) {
        if (vismon && how) {
          await discover_object(how, 1, 1);
        }
        if (G.level.flags.noteleport) {
          mtmp.mtrapseen = mtmp.mtrapseen | 1 << TELEP_TRAP - 1;
        }
        return 2;
      }
      if ((mon_has_amulet(mtmp) || On_W_tower_level(G.u.uz)) && !rn2(3)) {
        if (vismon) {
          await pline(S("%s seems disoriented for a moment."), await Monnam(mtmp));
        }
        return 2;
      }
      if (oseen && how) {
        await discover_object(how, 1, 1);
      }
      await rloc(mtmp, TRUE);
      return 2;
    case 7:
      zap_oseen = oseen;
      await mzapwand(mtmp, otmp, FALSE);
      G.m_using = TRUE;
      await mbhit(mtmp, rn2(8) + 6, mbhitm, bhito, otmp);
      if (G.level.flags.noteleport) {
        mtmp.mtrapseen = mtmp.mtrapseen | 1 << TELEP_TRAP - 1;
      }
      G.m_using = FALSE;
      return 2;
    case 8:
      {
        let obj_is_cursed = otmp.cursed | 0;
        if (mtmp.isshk | 0 || mtmp.isgd | 0 || mtmp.ispriest | 0) {
          return 2;
        }
        if (fleetim && !mtmp.iswiz) {
          await monflee(mtmp, fleetim, 0, 0);
        }
        ;
        await mreadmsg(mtmp, otmp);
        await m_useup(mtmp, otmp);
        how = SCR_TELEPORTATION;
        if (obj_is_cursed || mtmp.mconf | 0) {
          let nlev = 0;
          let flev = new struct_d_level();
          if (mon_has_amulet(mtmp) || G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
            if (vismon) {
              await pline(S("%s seems very disoriented for a moment."), await Monnam(mtmp));
            }
            return 2;
          }
          nlev = random_teleport_level();
          if (nlev === depth(G.u.uz)) {
            if (vismon) {
              await pline(S("%s shudders for a moment."), await Monnam(mtmp));
            }
            return 2;
          }
          await get_level(flev, nlev);
          await migrate_to_level(mtmp, ledger_no(flev), MIGR_RANDOM, null);
          if (oseen) {
            await discover_object(308, 1, 1);
          }
        } else {
          { $g = 1; continue $L; }
        }
        return 2;
      }
    case 9:
      {
        let ttmp = null;
        if (fleetim && !mtmp.iswiz) {
          await monflee(mtmp, fleetim, 0, 0);
        }
        ;
        await mzapwand(mtmp, otmp, FALSE);
        if (oseen) {
          await discover_object(401, 1, 1);
        }
        if ($at2(G.level.locations, mtmp.mx, mtmp.my).typ >= STAIRS && $at2(G.level.locations, mtmp.mx, mtmp.my).typ <= ALTAR || ($at2(G.level.locations, mtmp.mx, mtmp.my).typ === DRAWBRIDGE_UP || $at2(G.level.locations, mtmp.mx, mtmp.my).typ === DRAWBRIDGE_DOWN) || is_drawbridge_wall(mtmp.mx, mtmp.my) >= 0 || G.sstairs.sx && G.sstairs.sx === mtmp.mx && G.sstairs.sy === mtmp.my) {
          await pline_The(S("digging ray is ineffective."));
          return 2;
        }
        if (!Can_dig_down(G.u.uz) && !$at2(G.level.locations, mtmp.mx, mtmp.my).candig) {
          if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
            await pline_The(S("%s here is too hard to dig in."), surface(mtmp.mx, mtmp.my));
          }
          return 2;
        }
        ttmp = await maketrap(mtmp.mx, mtmp.my, HOLE);
        if (!ttmp) {
          return 2;
        }
        await seetrap(ttmp);
        if (vis) {
          await pline(S("%s has made a hole in the %s."), await Monnam(mtmp), surface(mtmp.mx, mtmp.my));
          await pline(S("%s %s through..."), await Monnam(mtmp), (mtmp.data.mflags1 & 1) >>> 0 !== 0 ? S("dives") : S("falls"));
        } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await You_hear(S("%s crash through the %s."), G.c_common_strings.c_something, surface(mtmp.mx, mtmp.my));
        }
        await migrate_to_level(mtmp, ledger_no(G.u.uz) + 1, MIGR_RANDOM, null);
        return 2;
      }
    case 10:
      {
        let cc = new struct_nhcoord();
        let pm = !is_pool(mtmp.mx, mtmp.my) ? null : $sat(G.mons, G.u.uinwater | 0 ? PM_GIANT_EEL : PM_CROCODILE);
        let mon = null;
        if (!await enexto(cc, mtmp.mx, mtmp.my, pm)) {
          return 0;
        }
        await mzapwand(mtmp, otmp, FALSE);
        mon = await makemon(null, cc.x, cc.y, NO_MM_FLAGS);
        if (mon && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) && oseen) {
          await discover_object(387, 1, 1);
        }
        return 2;
      }
    case 11:
      {
        let cc = new struct_nhcoord();
        let pm = null;
        let fish = null;
        let cnt = 1;
        let mon = null;
        let known = FALSE;
        if (!rn2(73)) {
          cnt += rnd(4);
        }
        if (mtmp.mconf | 0 || otmp.cursed | 0) {
          cnt += 12;
        }
        if (mtmp.mconf) {
          pm = fish = $sat(G.mons, PM_ACID_BLOB);
        } else if (is_pool(mtmp.mx, mtmp.my)) {
          fish = $sat(G.mons, G.u.uinwater | 0 ? PM_GIANT_EEL : PM_CROCODILE);
        }
        await mreadmsg(mtmp, otmp);
        while (cnt--) {
          if (!await enexto(cc, mtmp.mx, mtmp.my, fish)) {
            break;
          }
          mon = await makemon(pm, cc.x, cc.y, NO_MM_FLAGS);
          if (mon && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
            known = TRUE;
          }
        }
        if (known) {
          await discover_object(304, 1, 1);
        } else if (!G.objects[SCR_CREATE_MONSTER].oc_name_known && !G.objects[SCR_CREATE_MONSTER].oc_uname) {
          await docall(otmp);
        }
        await m_useup(mtmp, otmp);
        return 2;
      }
    case 12:
      if (Is_botlevel(G.u.uz)) {
        return 0;
      }
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (vis) {
        let t = t_at(trapx, trapy);
        Mnam = await Monnam(mtmp);
        await pline(S("%s %s into a %s!"), Mnam, vtense(G.c_common_strings.c_fakename[0], locomotion(mtmp.data, S("jump"))), (t.ttyp | 0) === TRAPDOOR ? S("trap door") : S("hole"));
        if ($at2(G.level.locations, trapx, trapy).typ === SCORR) {
          $at2(G.level.locations, trapx, trapy).typ = CORR;
          unblock_point(trapx, trapy);
        }
        await seetrap(t_at(trapx, trapy));
      }
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      await newsym(mtmp.mx, mtmp.my);
      await place_monster(mtmp, trapx, trapy);
      if (mtmp.wormno) {
        await worm_move(mtmp);
      }
      await newsym(trapx, trapy);
      await migrate_to_level(mtmp, ledger_no(G.u.uz) + 1, MIGR_RANDOM, null);
      return 2;
    case 13:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (ledger_no(G.u.uz) === 1) {
        { $g = 2; continue $L; }
      }
      if (In_hell(G.u.uz) && mon_has_amulet(mtmp) && !rn2(4) && dunlev(G.u.uz) < dunlevs_in_dungeon(G.u.uz) - 3) {
        if (vismon) {
          await pline(S("As %s climbs the stairs, a mysterious force momentarily surrounds %s..."), await mon_nam(mtmp), G.genders[pronoun_gender(mtmp, 0)].him);
        }
        await migrate_to_level(mtmp, ledger_no(G.u.uz) + 1, MIGR_RANDOM, null);
      } else {
        if (vismon) {
          await pline(S("%s escapes upstairs!"), await Monnam(mtmp));
        }
        await migrate_to_level(mtmp, ledger_no(G.u.uz) - 1, MIGR_STAIRS_DOWN, null);
      }
      return 2;
    case 14:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (vismon) {
        await pline(S("%s escapes downstairs!"), await Monnam(mtmp));
      }
      await migrate_to_level(mtmp, ledger_no(G.u.uz) + 1, MIGR_STAIRS_UP, null);
      return 2;
    case 15:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (vismon) {
        await pline(S("%s escapes up the ladder!"), await Monnam(mtmp));
      }
      await migrate_to_level(mtmp, ledger_no(G.u.uz) - 1, MIGR_LADDER_DOWN, null);
      return 2;
    case 16:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (vismon) {
        await pline(S("%s escapes down the ladder!"), await Monnam(mtmp));
      }
      await migrate_to_level(mtmp, ledger_no(G.u.uz) + 1, MIGR_LADDER_UP, null);
      return 2;
    case 17:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (!(ledger_no(G.u.uz) === 1)) { $g = 25; continue $L; }
    case 2: // escape
      if (mon_has_special(mtmp)) {
        return 0;
      }
      if (vismon) {
        await pline(S("%s escapes the dungeon!"), await Monnam(mtmp));
      }
      await mongone(mtmp);
      return 2;
    case 25:
      if (vismon) {
        await pline(S("%s escapes %sstairs!"), await Monnam(mtmp), G.sstairs.up ? S("up") : S("down"));
      }
      await migrate_to_level(mtmp, ledger_no(G.sstairs.tolev), MIGR_SSTAIRS, null);
      return 2;
    case 18:
      if (fleetim && !mtmp.iswiz) {
        await monflee(mtmp, fleetim, 0, 0);
      }
      ;
      if (vis) {
        Mnam = await Monnam(mtmp);
        await pline(S("%s %s onto a teleport trap!"), Mnam, vtense(G.c_common_strings.c_fakename[0], locomotion(mtmp.data, S("jump"))));
        await seetrap(t_at(trapx, trapy));
      }
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      await newsym(mtmp.mx, mtmp.my);
      await place_monster(mtmp, trapx, trapy);
      if (mtmp.wormno) {
        await worm_move(mtmp);
      }
      await newsym(trapx, trapy);
      { $g = 1; continue $L; }
    case 19:
      await mquaffmsg(mtmp, otmp);
      i = d(6 + 2 * bcsign(otmp), 4);
      mtmp.mhp += i;
      if (mtmp.mhp > mtmp.mhpmax) {
        mtmp.mhp = ++mtmp.mhpmax;
      }
      if (!otmp.cursed && !mtmp.mcansee) {
        await mcureblindness(mtmp, vismon);
      }
      if (vismon) {
        await pline(S("%s looks better."), await Monnam(mtmp));
      }
      if (oseen) {
        await discover_object(282, 1, 1);
      }
      await m_useup(mtmp, otmp);
      return 2;
    case 20:
      await mquaffmsg(mtmp, otmp);
      i = d(6 + 2 * bcsign(otmp), 8);
      mtmp.mhp += i;
      if (mtmp.mhp > mtmp.mhpmax) {
        mtmp.mhp = mtmp.mhpmax += otmp.blessed | 0 ? 5 : 2;
      }
      if (!mtmp.mcansee) {
        await mcureblindness(mtmp, vismon);
      }
      if (vismon) {
        await pline(S("%s looks much better."), await Monnam(mtmp));
      }
      if (oseen) {
        await discover_object(283, 1, 1);
      }
      await m_useup(mtmp, otmp);
      return 2;
    case 21:
      await mquaffmsg(mtmp, otmp);
      if (otmp.otyp === POT_SICKNESS) {
        await unbless(otmp);
      }
      mtmp.mhp = mtmp.mhpmax += otmp.blessed | 0 ? 8 : 4;
      if (!mtmp.mcansee && otmp.otyp !== POT_SICKNESS) {
        await mcureblindness(mtmp, vismon);
      }
      if (vismon) {
        await pline(S("%s looks completely healed."), await Monnam(mtmp));
      }
      if (oseen) {
        await discover_object(otmp.otyp, 1, 1);
      }
      await m_useup(mtmp, otmp);
      return 2;
    case 22:
      await mon_consume_unstone(mtmp, otmp, FALSE, FALSE);
      return 2;
    case 23:
      return 0;
    case 24:
      await impossible(S("%s wanted to perform action %d?"), await Monnam(mtmp), m.has_defense);
      { $g = 3; continue $L; };
    case 3:
      return 0;
    }
    break;
  }
}

export async function rnd_defensive_item(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let pm = null;
  let difficulty = 0;
  let trycnt = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      pm = mtmp.data;
      difficulty = G.mons[await monsndx(pm)].difficulty;
      trycnt = 0;
      if ((pm.mflags1 & 262144) >>> 0 !== 0 || attacktype(pm, AT_EXPL) || (mtmp.data.mflags1 & 65536) >>> 0 !== 0 || pm.mlet === S_GHOST || pm.mlet === S_KOP) {
        return 0;
      }
    case 1: // try_again
      switch (rn2(8 + (difficulty > 3 ? 1 : 0) + (difficulty > 6 ? 1 : 0) + (difficulty > 8 ? 1 : 0))) {
      case 6:
      case 9:
        if (G.level.flags.noteleport | 0 && ++trycnt < 2) {
          { $g = 1; continue $L; }
        }
        if (!rn2(3)) {
          return WAN_TELEPORTATION;
        }
      case 0:
      case 1:
        return SCR_TELEPORTATION;
      case 8:
      case 10:
        if (!rn2(3)) {
          return WAN_CREATE_MONSTER;
        }
      case 2:
        return SCR_CREATE_MONSTER;
      case 3:
        return POT_HEALING;
      case 4:
        return POT_EXTRA_HEALING;
      case 5:
        return mtmp.data !== $sat(G.mons, PM_PESTILENCE) ? POT_FULL_HEALING : POT_SICKNESS;
      case 7:
        if (pm.mlet === S_EYE || pm.mlet === S_LIGHT || mtmp.isshk | 0 || mtmp.isgd | 0 || mtmp.ispriest | 0) {
          return 0;
        } else {
          return WAN_DIGGING;
        }
      }
      return 0;
    }
    break;
  }
}

export async function find_offensive(mtmp: struct_monst | null): Promise<number> {
  let obj = null;
  let reflection_skip = ((G.u.uprops[REFLECTING].intrinsic || G.u.uprops[REFLECTING].extrinsic) && rn2(2) ? 1 : 0) << 24 >> 24;
  let helmet = await which_armor(mtmp, W_ARMH);
  m.offensive = null;
  m.has_offense = 0;
  if (mtmp.mpeaceful | 0 || (mtmp.data.mflags1 & 262144) >>> 0 !== 0 || (mtmp.data.mflags1 & 65536) >>> 0 !== 0 || (mtmp.data.mflags1 & 8192) >>> 0 !== 0) {
    return FALSE;
  }
  if (G.u.uswallow) {
    return FALSE;
  }
  if (in_your_sanctuary(mtmp, 0, 0)) {
    return FALSE;
  }
  if (dmgtype(mtmp.data, AD_HEAL) && !G.uwep && !G.uarmu && !G.uarm && !G.uarmh && !G.uarms && !G.uarmg && !G.uarmc && !G.uarmf) {
    return FALSE;
  }
  if (!lined_up(mtmp)) {
    return FALSE;
  }
  for (obj = mtmp.minvent; obj; obj = obj.nobj) {
    if (!reflection_skip) {
      if (m.has_offense === 1) {
        continue;
      }
      ;
      if (obj.otyp === WAN_DEATH && obj.spe > 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_DEATH;
      }
      if (m.has_offense === 2) {
        continue;
      }
      ;
      if (obj.otyp === WAN_SLEEP && obj.spe > 0 && G.multi >= 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_SLEEP;
      }
      if (m.has_offense === 3) {
        continue;
      }
      ;
      if (obj.otyp === WAN_FIRE && obj.spe > 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_FIRE;
      }
      if (m.has_offense === 13) {
        continue;
      }
      ;
      if (obj.otyp === FIRE_HORN && obj.spe > 0 && can_blow(mtmp)) {
        m.offensive = obj;
        m.has_offense = MUSE_FIRE_HORN;
      }
      if (m.has_offense === 4) {
        continue;
      }
      ;
      if (obj.otyp === WAN_COLD && obj.spe > 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_COLD;
      }
      if (m.has_offense === 12) {
        continue;
      }
      ;
      if (obj.otyp === FROST_HORN && obj.spe > 0 && can_blow(mtmp)) {
        m.offensive = obj;
        m.has_offense = MUSE_FROST_HORN;
      }
      if (m.has_offense === 5) {
        continue;
      }
      ;
      if (obj.otyp === WAN_LIGHTNING && obj.spe > 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_LIGHTNING;
      }
      if (m.has_offense === 6) {
        continue;
      }
      ;
      if (obj.otyp === WAN_MAGIC_MISSILE && obj.spe > 0) {
        m.offensive = obj;
        m.has_offense = MUSE_WAN_MAGIC_MISSILE;
      }
    }
    if (m.has_offense === 7) {
      continue;
    }
    ;
    if (obj.otyp === WAN_STRIKING && obj.spe > 0) {
      m.offensive = obj;
      m.has_offense = MUSE_WAN_STRIKING;
    }
    if (m.has_offense === 9) {
      continue;
    }
    ;
    if (obj.otyp === POT_PARALYSIS && G.multi >= 0) {
      m.offensive = obj;
      m.has_offense = MUSE_POT_PARALYSIS;
    }
    if (m.has_offense === 10) {
      continue;
    }
    ;
    if (obj.otyp === POT_BLINDNESS && !attacktype(mtmp.data, AT_GAZE)) {
      m.offensive = obj;
      m.has_offense = MUSE_POT_BLINDNESS;
    }
    if (m.has_offense === 11) {
      continue;
    }
    ;
    if (obj.otyp === POT_CONFUSION) {
      m.offensive = obj;
      m.has_offense = MUSE_POT_CONFUSION;
    }
    if (m.has_offense === 16) {
      continue;
    }
    ;
    if (obj.otyp === POT_SLEEPING) {
      m.offensive = obj;
      m.has_offense = MUSE_POT_SLEEPING;
    }
    if (m.has_offense === 14) {
      continue;
    }
    ;
    if (obj.otyp === POT_ACID) {
      m.offensive = obj;
      m.has_offense = MUSE_POT_ACID;
    }
    if (m.has_offense === 17) {
      continue;
    }
    ;
    if (obj.otyp === SCR_EARTH && (helmet && ((G.objects[helmet.otyp].oc_material | 0) >= IRON && (G.objects[helmet.otyp].oc_material | 0) <= MITHRIL) || mtmp.mconf | 0 || (mtmp.data.mflags1 & 4) >>> 0 !== 0 || (mtmp.data.mflags1 & 8) >>> 0 !== 0 || mtmp.data.mlet === S_GHOST || (mtmp.data.mflags1 & 1048576) >>> 0 !== 0 || !rn2(10)) && dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) <= 2 && mtmp.mcansee | 0 && (mtmp.data.mflags1 & 4096) >>> 0 === 0 && !((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) && (!(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) || (G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level))) {
      m.offensive = obj;
      m.has_offense = MUSE_SCR_EARTH;
    }
  }
  return (!!m.has_offense ? 1 : 0) << 24 >> 24;
}

async function mbhitm(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<number> {
  let tmp = 0;
  let reveal_invis = FALSE;
  if (mtmp !== G.youmonst) {
    mtmp.msleeping = 0;
    if (mtmp.m_ap_type) {
      await seemimic(mtmp);
    }
  }
  switch (otmp.otyp) {
  case 390:
    reveal_invis = TRUE;
    if (mtmp === G.youmonst) {
      if (zap_oseen) {
        await discover_object(390, 1, 1);
      }
      if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
        await pline(S("Boing!"));
      } else if (rnd(20) < 10 + G.u.uac) {
        await pline_The(S("wand hits you!"));
        tmp = d(2, 12);
        if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
          tmp = (tmp + 1) / 2 | 0;
        }
        await losehp(tmp, S("wand"), KILLED_BY_AN);
      } else {
        await pline_The(S("wand misses you."));
      }
      await stop_occupation();
      nomul(0);
    } else if (resists_magm(mtmp)) {
      await shieldeff(mtmp.mx, mtmp.my);
      await pline(S("Boing!"));
    } else if (rnd(20) < 10 + find_mac(mtmp)) {
      tmp = d(2, 12);
      await hit(S("wand"), mtmp, exclam(tmp));
      await resist(mtmp, otmp.oclass, tmp, TELL);
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && zap_oseen) {
        await discover_object(390, 1, 1);
      }
    } else {
      await miss(S("wand"), mtmp);
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && zap_oseen) {
        await discover_object(390, 1, 1);
      }
    }
    break;
  case 396:
  case 377:
    await cancel_monst(mtmp, otmp, FALSE, TRUE, FALSE);
    break;
  }
  if (reveal_invis) {
    if (!(mtmp.mhp < 1) && $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await map_invisible(G.bhitpos.x, G.bhitpos.y);
    }
  }
  return 0;
}

async function mbhit(mon: struct_monst | null, range: number, fhitm: Function | null, fhito: Function | null, obj: struct_obj | null): Promise<void> {
  let mtmp = null;
  let otmp = null;
  let typ = 0;
  let ddx = 0;
  let ddy = 0;
  G.bhitpos.x = mon.mx;
  G.bhitpos.y = mon.my;
  ddx = sgn(mon.mux - mon.mx);
  ddy = sgn(mon.muy - mon.my);
  while (range-- > 0) {
    const x = new Int32Array(1);
    const y = new Int32Array(1);
    G.bhitpos.x = G.bhitpos.x + ddx << 24 >> 24;
    G.bhitpos.y = G.bhitpos.y + ddy << 24 >> 24;
    x[0] = G.bhitpos.x;
    y[0] = G.bhitpos.y;
    if (!isok(x[0], y[0])) {
      G.bhitpos.x = G.bhitpos.x - ddx << 24 >> 24;
      G.bhitpos.y = G.bhitpos.y - ddy << 24 >> 24;
      break;
    }
    if (find_drawbridge(P(x, 0), P(y, 0))) {
      switch (obj.otyp) {
      case 390:
        await destroy_drawbridge(x[0], y[0]);
      }
    }
    if (G.bhitpos.x === G.u.ux && G.bhitpos.y === G.u.uy) {
      await fhitm(G.youmonst, obj);
      range -= 3;
    } else if (!!(mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null)) {
      if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await map_invisible(G.bhitpos.x, G.bhitpos.y);
      }
      await fhitm(mtmp, obj);
      range -= 3;
    }
    if (fhito) {
      let hitanything = 0;
      let next_obj = null;
      for (otmp = G.level.objects[G.bhitpos.x][G.bhitpos.y]; otmp; otmp = next_obj) {
        next_obj = otmp.v.v_nexthere;
        hitanything += await fhito(otmp, obj);
      }
      if (hitanything) {
        --range;
      }
    }
    typ = $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ & 0xff;
    if (typ === DOOR || typ === SDOOR) {
      switch (obj.otyp) {
      case 398:
      case 399:
      case 390:
        if (await doorlock(obj, G.bhitpos.x, G.bhitpos.y)) {
          if (zap_oseen) {
            await discover_object(obj.otyp, 1, 1);
          }
          if (($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).flags | 0) === D_BROKEN && $rd(in_rooms(G.bhitpos.x, G.bhitpos.y, SHOPBASE))) {
            await add_damage(G.bhitpos.x, G.bhitpos.y, 0);
          }
        }
        break;
      }
    }
    if (!(typ >= POOL) || typ === DOOR && ($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).flags | 0) & (D_LOCKED | D_CLOSED)) {
      G.bhitpos.x = G.bhitpos.x - ddx << 24 >> 24;
      G.bhitpos.y = G.bhitpos.y - ddy << 24 >> 24;
      break;
    }
  }
}

export async function use_offensive(mtmp: struct_monst | null): Promise<number> {
  let i = 0;
  let otmp = m.offensive;
  let oseen = 0;
  if (otmp.oclass !== POTION_CLASS && (i = await precheck(mtmp, otmp)) !== 0) {
    return i;
  }
  oseen = (otmp && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) ? 1 : 0) << 24 >> 24;
  switch (m.has_offense) {
  case 1:
  case 2:
  case 3:
  case 4:
  case 5:
  case 6:
    await mzapwand(mtmp, otmp, FALSE);
    if (oseen) {
      await discover_object(otmp.otyp, 1, 1);
    }
    G.m_using = TRUE;
    await buzz(-30 - (otmp.otyp - WAN_MAGIC_MISSILE), otmp.otyp === WAN_MAGIC_MISSILE ? 2 : 6, mtmp.mx, mtmp.my, sgn(mtmp.mux - mtmp.mx), sgn(mtmp.muy - mtmp.my));
    G.m_using = FALSE;
    return mtmp.mhp < 1 ? 1 : 2;
  case 13:
  case 12:
    await mplayhorn(mtmp, otmp, FALSE);
    G.m_using = TRUE;
    await buzz(-30 - (otmp.otyp === FROST_HORN ? AD_COLD - 1 : AD_FIRE - 1), rn2(6) + 6, mtmp.mx, mtmp.my, sgn(mtmp.mux - mtmp.mx), sgn(mtmp.muy - mtmp.my));
    G.m_using = FALSE;
    return mtmp.mhp < 1 ? 1 : 2;
  case 15:
  case 7:
    zap_oseen = oseen;
    await mzapwand(mtmp, otmp, FALSE);
    G.m_using = TRUE;
    await mbhit(mtmp, rn2(8) + 6, mbhitm, bhito, otmp);
    G.m_using = FALSE;
    return 2;
  case 17:
    {
      let x = 0;
      let y = 0;
      let confused = (mtmp.mconf | 0 ? TRUE : FALSE) << 24 >> 24;
      let mmx = mtmp.mx;
      let mmy = mtmp.my;
      let is_cursed = otmp.cursed << 24 >> 24;
      await mreadmsg(mtmp, otmp);
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline_The(S("%s rumbles %s %s!"), ceiling(mtmp.mx, mtmp.my), otmp.blessed | 0 ? S("around") : S("above"), await mon_nam(mtmp));
        if (oseen) {
          await discover_object(otmp.otyp, 1, 1);
        }
      } else if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline_The(S("%s rumbles in the middle of nowhere!"), ceiling(mtmp.mx, mtmp.my));
        if (mtmp.minvis) {
          await map_invisible(mtmp.mx, mtmp.my);
        }
        if (oseen) {
          await discover_object(otmp.otyp, 1, 1);
        }
      }
      for (x = mmx - 1; x <= mmx + 1; ++x) {
        for (y = mmy - 1; y <= mmy + 1; ++y) {
          if (isok(x, y) && !closed_door(x, y) && !($at2(G.level.locations, x, y).typ < POOL) && !($at2(G.level.locations, x, y).typ === AIR || $at2(G.level.locations, x, y).typ === CLOUD) && (x === mmx && y === mmy ? !otmp.blessed ? 1 : 0 : !otmp.cursed ? 1 : 0) && (x !== G.u.ux || y !== G.u.uy)) {
            await drop_boulder_on_monster(x, y, confused, FALSE);
          }
        }
      }
      await m_useup(mtmp, otmp);
      if (distmin(mmx, mmy, G.u.ux, G.u.uy) === 1 && !is_cursed) {
        await drop_boulder_on_player(confused, !is_cursed ? 1 : 0, FALSE, TRUE);
      }
      return mtmp.mhp < 1 ? 1 : 2;
    }
  case 9:
  case 10:
  case 11:
  case 16:
  case 14:
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      otmp.dknown = 1;
      await pline(S("%s hurls %s!"), await Monnam(mtmp), await singular(otmp, doname));
    }
    await m_throw(mtmp, mtmp.mx, mtmp.my, sgn(mtmp.mux - mtmp.mx), sgn(mtmp.muy - mtmp.my), distmin(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy), otmp);
    return 2;
  case 0:
    return 0;
  default:
    await impossible(S("%s wanted to perform action %d?"), await Monnam(mtmp), m.has_offense);
    break;
  }
  return 0;
}

export async function rnd_offensive_item(mtmp: struct_monst | null): Promise<number> {
  let pm = mtmp.data;
  let difficulty = G.mons[await monsndx(pm)].difficulty;
  if ((pm.mflags1 & 262144) >>> 0 !== 0 || attacktype(pm, AT_EXPL) || (mtmp.data.mflags1 & 65536) >>> 0 !== 0 || pm.mlet === S_GHOST || pm.mlet === S_KOP) {
    return 0;
  }
  if (difficulty > 7 && !rn2(35)) {
    return WAN_DEATH;
  }
  switch (rn2(9 - (difficulty < 4 ? 1 : 0) + 4 * (difficulty > 6 ? 1 : 0))) {
  case 0:
    {
      let helmet = await which_armor(mtmp, W_ARMH);
      if (helmet && ((G.objects[helmet.otyp].oc_material | 0) >= IRON && (G.objects[helmet.otyp].oc_material | 0) <= MITHRIL) || (pm.mflags1 & 4) >>> 0 !== 0 || (pm.mflags1 & 8) >>> 0 !== 0 || pm.mlet === S_GHOST || (pm.mflags1 & 1048576) >>> 0 !== 0) {
        return SCR_EARTH;
      }
    }
  case 1:
    return WAN_STRIKING;
  case 2:
    return POT_ACID;
  case 3:
    return POT_CONFUSION;
  case 4:
    return POT_BLINDNESS;
  case 5:
    return POT_SLEEPING;
  case 6:
    return POT_PARALYSIS;
  case 7:
  case 8:
    return WAN_MAGIC_MISSILE;
  case 9:
    return WAN_SLEEP;
  case 10:
    return WAN_FIRE;
  case 11:
    return WAN_COLD;
  case 12:
    return WAN_LIGHTNING;
  }
  return 0;
}

export async function find_misc(mtmp: struct_monst | null): Promise<number> {
  let obj = null;
  let mdat = mtmp.data;
  let x = mtmp.mx;
  let y = mtmp.my;
  let t = null;
  let xx = 0;
  let yy = 0;
  let pmidx = NON_PM;
  let immobile = (mdat.mmove === 0 ? 1 : 0) << 24 >> 24;
  let stuck = (mtmp === G.u.ustuck ? 1 : 0) << 24 >> 24;
  m.misc = null;
  m.has_misc = 0;
  if ((mdat.mflags1 & 262144) >>> 0 !== 0 || (mdat.mflags1 & 65536) >>> 0 !== 0) {
    return 0;
  }
  if (G.u.uswallow | 0 && stuck) {
    return FALSE;
  }
  if (dist2(x, y, mtmp.mux, mtmp.muy) > 36) {
    return FALSE;
  }
  if (!stuck && !immobile && mtmp.cham === NON_PM && G.mons[pmidx = await monsndx(mdat)].difficulty < 6) {
    let ignore_boulders = (mdat.msize < 1 || (mdat.mflags2 & 134217728) >>> 0 !== 0 || (mdat.mflags1 & 8) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    let diag_ok = (!(pmidx === 115) ? 1 : 0) << 24 >> 24;
    for (xx = x - 1; xx <= x + 1; ++xx) {
      for (yy = y - 1; yy <= y + 1; ++yy) {
        if (isok(xx, yy) && (xx !== G.u.ux || yy !== G.u.uy) && (diag_ok || xx === x || yy === y) && (xx === x && yy === y || !G.level.monsters[xx][yy])) {
          if (!!(t = t_at(xx, yy)) && (ignore_boulders || !sobj_at(BOULDER, xx, yy)) && !onscary(xx, yy, mtmp)) {
            if ((t.ttyp | 0) === POLY_TRAP) {
              trapx = xx;
              trapy = yy;
              m.has_misc = MUSE_POLY_TRAP;
              return TRUE;
            }
          }
        }
      }
    }
  }
  if ((mdat.mflags1 & 8192) >>> 0 !== 0) {
    return 0;
  }
  for (obj = mtmp.minvent; obj; obj = obj.nobj) {
    if (obj.otyp === POT_GAIN_LEVEL && (!obj.cursed || !mtmp.isgd && !mtmp.isshk && !mtmp.ispriest)) {
      m.misc = obj;
      m.has_misc = MUSE_POT_GAIN_LEVEL;
    }
    if (m.has_misc === 8) {
      continue;
    }
    if (obj.otyp === BULLWHIP && !mtmp.mpeaceful && G.uwep && !rn2(5) && obj === mtmp.mw && mtmp.mux === G.u.ux && mtmp.muy === G.u.uy && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 2 && (await canletgo(G.uwep, S("")) || G.u.twoweap && await canletgo(G.uswapwep, S("")))) {
      m.misc = obj;
      m.has_misc = MUSE_BULLWHIP;
    }
    if (m.has_misc === 2) {
      continue;
    }
    if (obj.otyp === WAN_MAKE_INVISIBLE && obj.spe > 0 && !mtmp.minvis && !mtmp.invis_blkd && (!mtmp.mpeaceful || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && (!attacktype(mtmp.data, AT_GAZE) || mtmp.mcan | 0)) {
      m.misc = obj;
      m.has_misc = MUSE_WAN_MAKE_INVISIBLE;
    }
    if (m.has_misc === 3) {
      continue;
    }
    if (obj.otyp === POT_INVISIBILITY && !mtmp.minvis && !mtmp.invis_blkd && (!mtmp.mpeaceful || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && (!attacktype(mtmp.data, AT_GAZE) || mtmp.mcan | 0)) {
      m.misc = obj;
      m.has_misc = MUSE_POT_INVISIBILITY;
    }
    if (m.has_misc === 7) {
      continue;
    }
    if (obj.otyp === WAN_SPEED_MONSTER && obj.spe > 0 && (mtmp.mspeed | 0) !== MFAST && !mtmp.isgd) {
      m.misc = obj;
      m.has_misc = MUSE_WAN_SPEED_MONSTER;
    }
    if (m.has_misc === 6) {
      continue;
    }
    if (obj.otyp === POT_SPEED && (mtmp.mspeed | 0) !== MFAST && !mtmp.isgd) {
      m.misc = obj;
      m.has_misc = MUSE_POT_SPEED;
    }
    if (m.has_misc === 5) {
      continue;
    }
    if (obj.otyp === WAN_POLYMORPH && obj.spe > 0 && mtmp.cham === NON_PM && G.mons[await monsndx(mdat)].difficulty < 6) {
      m.misc = obj;
      m.has_misc = MUSE_WAN_POLYMORPH;
    }
    if (m.has_misc === 9) {
      continue;
    }
    if (obj.otyp === POT_POLYMORPH && mtmp.cham === NON_PM && G.mons[await monsndx(mdat)].difficulty < 6) {
      m.misc = obj;
      m.has_misc = MUSE_POT_POLYMORPH;
    }
  }
  return (!!m.has_misc ? 1 : 0) << 24 >> 24;
}

async function muse_newcham_mon(mon: struct_monst | null): Promise<struct_permonst | null> {
  let m_armr = null;
  if (!!(m_armr = await which_armor(mon, W_ARM))) {
    if (m_armr.otyp >= 91 && m_armr.otyp <= 99) {
      return $sat(G.mons, 141 + m_armr.otyp - 91);
    } else if (m_armr.otyp >= 82 && m_armr.otyp <= 90) {
      return $sat(G.mons, 141 + m_armr.otyp - 82);
    }
  }
  return await rndmonst();
}

export async function use_misc(mtmp: struct_monst | null): Promise<number> {
  let $g = 0;
  let i = 0;
  let otmp = null;
  let vis = 0;
  let vismon = 0;
  let oseen = 0;
  let nambuf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      otmp = m.misc;
      nambuf = new Int8Array(256);
      if ((i = await precheck(mtmp, otmp)) !== 0) {
        return i;
      }
      vis = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) << 24 >> 24;
      vismon = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
      oseen = (otmp && vismon ? 1 : 0) << 24 >> 24;
      switch (m.has_misc) {
      case 1: { $g = 3; continue $L; }
      case 2: { $g = 4; continue $L; }
      case 3: { $g = 5; continue $L; }
      case 7: { $g = 6; continue $L; }
      case 6: { $g = 7; continue $L; }
      case 5: { $g = 8; continue $L; }
      case 9: { $g = 9; continue $L; }
      case 4: { $g = 10; continue $L; }
      case 8: { $g = 11; continue $L; }
      case 0: { $g = 12; continue $L; }
      default: { $g = 13; continue $L; }
      }
    case 3:
      await mquaffmsg(mtmp, otmp);
      if (!otmp.cursed) { $g = 14; continue $L; }
      if (!await Can_rise_up(mtmp.mx, mtmp.my, G.u.uz)) { $g = 16; continue $L; }
      {
        let tolev = depth(G.u.uz) - 1;
        let tolevel = new struct_d_level();
        await get_level(tolevel, tolev);
        if (on_level(tolevel, G.u.uz)) {
          { $g = 1; continue $L; }
        }
        if (vismon) {
          await pline(S("%s rises up, through the %s!"), await Monnam(mtmp), ceiling(mtmp.mx, mtmp.my));
          if (!G.objects[POT_GAIN_LEVEL].oc_name_known && !G.objects[POT_GAIN_LEVEL].oc_uname) {
            await docall(otmp);
          }
        }
        await m_useup(mtmp, otmp);
        await migrate_to_level(mtmp, ledger_no(tolevel), MIGR_RANDOM, null);
        return 2;
      }
      { $g = 15; continue $L; }
    case 16:
    case 1: // skipmsg
      if (vismon) {
        await pline(S("%s looks uneasy."), await Monnam(mtmp));
        if (!G.objects[POT_GAIN_LEVEL].oc_name_known && !G.objects[POT_GAIN_LEVEL].oc_uname) {
          await docall(otmp);
        }
      }
      await m_useup(mtmp, otmp);
      return 2;
    case 15:
    case 14:
      if (vismon) {
        await pline(S("%s seems more experienced."), await Monnam(mtmp));
      }
      if (oseen) {
        await discover_object(284, 1, 1);
      }
      await m_useup(mtmp, otmp);
      if (!await grow_up(mtmp, null)) {
        return 1;
      }
      return 2;
    case 4:
    case 5:
      if (otmp.otyp === WAN_MAKE_INVISIBLE) {
        await mzapwand(mtmp, otmp, TRUE);
      } else {
        await mquaffmsg(mtmp, otmp);
      }
      strcpy(P(nambuf), await mon_nam(mtmp));
      await mon_set_minvis(mtmp);
      if (vismon && mtmp.minvis | 0) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
          await pline(S("%s body takes on a %s transparency."), upstart(s_suffix(P(nambuf))), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("normal") : S("strange"));
        } else {
          await pline(S("Suddenly you cannot see %s."), P(nambuf));
          if (vis) {
            await map_invisible(mtmp.mx, mtmp.my);
          }
        }
        if (oseen) {
          await discover_object(otmp.otyp, 1, 1);
        }
      }
      if (otmp.otyp === POT_INVISIBILITY) {
        if (otmp.cursed) {
          await you_aggravate(mtmp);
        }
        await m_useup(mtmp, otmp);
      }
      return 2;
    case 6:
      await mzapwand(mtmp, otmp, TRUE);
      await mon_adjust_speed(mtmp, 1, otmp);
      return 2;
    case 7:
      await mquaffmsg(mtmp, otmp);
      await mon_adjust_speed(mtmp, 1, otmp);
      await m_useup(mtmp, otmp);
      return 2;
    case 8:
      await mzapwand(mtmp, otmp, TRUE);
      await newcham(mtmp, await muse_newcham_mon(mtmp), TRUE, FALSE);
      if (oseen) {
        await discover_object(395, 1, 1);
      }
      return 2;
    case 9:
      await mquaffmsg(mtmp, otmp);
      if (vismon) {
        await pline(S("%s suddenly mutates!"), await Monnam(mtmp));
      }
      await newcham(mtmp, await muse_newcham_mon(mtmp), FALSE, FALSE);
      if (oseen) {
        await discover_object(291, 1, 1);
      }
      await m_useup(mtmp, otmp);
      return 2;
    case 10:
      if (vismon) {
        let Mnam = await Monnam(mtmp);
        await pline(S("%s deliberately %s onto a polymorph trap!"), Mnam, vtense(G.c_common_strings.c_fakename[0], locomotion(mtmp.data, S("jump"))));
      }
      if (vis) {
        await seetrap(t_at(trapx, trapy));
      }
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      await newsym(mtmp.mx, mtmp.my);
      await place_monster(mtmp, trapx, trapy);
      if (mtmp.wormno) {
        await worm_move(mtmp);
      }
      await newsym(trapx, trapy);
      await newcham(mtmp, null, FALSE, FALSE);
      return 2;
    case 11:
      {
        let The_whip = vismon ? S("The bullwhip") : S("A whip");
        let where_to = rn2(4);
        let obj = G.uwep;
        let hand = null;
        let the_weapon = new Int8Array(256);
        if (!obj || !await canletgo(obj, S("")) || G.u.twoweap && await canletgo(G.uswapwep, S("")) && rn2(2)) {
          obj = G.uswapwep;
        }
        if (!obj) {
          { $g = 2; continue $L; };
        }
        strcpy(P(the_weapon), await the(await xname(obj)));
        hand = body_part(HAND);
        if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0) {
          hand = await makeplural(hand);
        }
        if (vismon) {
          await pline(S("%s flicks a bullwhip towards your %s!"), await Monnam(mtmp), hand);
        }
        if (obj.otyp === HEAVY_IRON_BALL) {
          await pline(S("%s fails to wrap around %s."), The_whip, P(the_weapon));
          return 1;
        }
        await pline(S("%s wraps around %s you're wielding!"), The_whip, P(the_weapon));
        if (welded(obj)) {
          await pline(S("%s welded to your %s%c"), !(obj.quan !== 1 || obj.oartifact === 26 && !undiscovered_artifact(26)) ? S("It is") : S("They are"), hand, !obj.bknown ? 33 : 46);
          where_to = 0;
        }
        if (!where_to) {
          await pline_The(S("whip slips free."));
          return 1;
        } else if (where_to === 3 && mon_hates_silver(mtmp) && (G.objects[obj.otyp].oc_material | 0) === SILVER) {
          where_to = 2;
        }
        await remove_worn_item(obj, FALSE);
        await freeinv(obj);
        switch (where_to) {
        case 1:
          await pline(S("%s yanks %s from your %s!"), await Monnam(mtmp), P(the_weapon), hand);
          await place_object(obj, mtmp.mx, mtmp.my);
          break;
        case 2:
          await pline(S("%s yanks %s to the %s!"), await Monnam(mtmp), P(the_weapon), surface(G.u.ux, G.u.uy));
          await dropy(obj);
          break;
        case 3:
          await pline(S("%s snatches %s!"), await Monnam(mtmp), P(the_weapon));
          await mpickobj(mtmp, obj);
          break;
        }
        return 1;
      }
      return 0;
    case 12:
      return 0;
    case 13:
      await impossible(S("%s wanted to perform action %d?"), await Monnam(mtmp), m.has_misc);
      { $g = 2; continue $L; };
    case 2:
      return 0;
    }
    break;
  }
}

async function you_aggravate(mtmp: struct_monst | null): Promise<void> {
  await pline(S("For some reason, %s presence is known to you."), s_suffix(await noit_mon_nam(mtmp)));
  await cls();
  await G.windowprocs.win_cliparound(mtmp.mx, mtmp.my);
  await show_glyph(mtmp.mx, mtmp.my, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(mtmp.data)) + 0);
  await show_glyph(G.u.ux, G.u.uy, G.u.usteed && ((!G.u.usteed.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !G.u.usteed.mundetected) ? (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.u.usteed.data)) + (382 + (382 + (1 + (382 + (382 + 0))))) : (G.youmonst.m_ap_type & 7) === M_AP_NOTHING ? (G.u.umonnum !== G.u.umonster || !G.flags.showrace ? G.u.umonnum : G.flags.female && G.urace.femalenum !== -1 ? G.urace.femalenum : G.urace.malenum) + 0 : (G.youmonst.m_ap_type & 7) === M_AP_FURNITURE ? (G.youmonst.mappearance | 0) + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))) : (G.youmonst.m_ap_type & 7) === M_AP_OBJECT ? (G.youmonst.mappearance | 0) + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : (G.youmonst.mappearance | 0) + 0);
  await You_feel(S("aggravated at %s."), await noit_mon_nam(mtmp));
  await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
  await docrt();
  if (unconscious()) {
    G.multi = -1;
    G.nomovemsg = S("Aggravated, you are jolted into full consciousness.");
  }
  await newsym(mtmp.mx, mtmp.my);
  if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    await map_invisible(mtmp.mx, mtmp.my);
  }
}

export async function rnd_misc_item(mtmp: struct_monst | null): Promise<number> {
  let pm = mtmp.data;
  let difficulty = G.mons[await monsndx(pm)].difficulty;
  if ((pm.mflags1 & 262144) >>> 0 !== 0 || attacktype(pm, AT_EXPL) || (mtmp.data.mflags1 & 65536) >>> 0 !== 0 || pm.mlet === S_GHOST || pm.mlet === S_KOP) {
    return 0;
  }
  if (difficulty < 6 && !rn2(30)) {
    return rn2(6) ? POT_POLYMORPH : WAN_POLYMORPH;
  }
  if (!rn2(40) && !((pm.mflags2 & 2) >>> 0 !== 0 || pm === $sat(G.mons, 49) || (pm.mlet === S_GOLEM || pm.mlet === S_VORTEX)) && !(mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) {
    return AMULET_OF_LIFE_SAVING;
  }
  switch (rn2(3)) {
  case 0:
    if (mtmp.isgd) {
      return 0;
    }
    return rn2(6) ? POT_SPEED : WAN_SPEED_MONSTER;
  case 1:
    if (mtmp.mpeaceful | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
      return 0;
    }
    return rn2(6) ? POT_INVISIBILITY : WAN_MAKE_INVISIBLE;
  case 2:
    return POT_GAIN_LEVEL;
  }
  return 0;
}

export async function searches_for_item(mon: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let typ = obj.otyp;
  if ((mon.data.mflags1 & 262144) >>> 0 !== 0 || (mon.data.mflags1 & 65536) >>> 0 !== 0 || mon.data === $sat(G.mons, PM_GHOST)) {
    return FALSE;
  }
  if (typ === WAN_MAKE_INVISIBLE || typ === POT_INVISIBILITY) {
    return (!mon.minvis && !mon.invis_blkd && !attacktype(mon.data, AT_GAZE) ? 1 : 0) << 24 >> 24;
  }
  if (typ === WAN_SPEED_MONSTER || typ === POT_SPEED) {
    return ((mon.mspeed | 0) !== MFAST ? 1 : 0) << 24 >> 24;
  }
  switch (obj.oclass) {
  case WAND_CLASS:
    if (obj.spe <= 0) {
      return FALSE;
    }
    if (typ === WAN_DIGGING) {
      return (!(mon.data.mlet === S_EYE || mon.data.mlet === S_LIGHT) ? 1 : 0) << 24 >> 24;
    }
    if (typ === WAN_POLYMORPH) {
      return (G.mons[await monsndx(mon.data)].difficulty < 6 ? 1 : 0) << 24 >> 24;
    }
    if ((G.objects[typ].oc_dir | 0) === RAY || typ === WAN_STRIKING || typ === WAN_TELEPORTATION || typ === WAN_CREATE_MONSTER) {
      return TRUE;
    }
    break;
  case POTION_CLASS:
    if (typ === POT_HEALING || typ === POT_EXTRA_HEALING || typ === POT_FULL_HEALING || typ === POT_POLYMORPH || typ === POT_GAIN_LEVEL || typ === POT_PARALYSIS || typ === POT_SLEEPING || typ === POT_ACID || typ === POT_CONFUSION) {
      return TRUE;
    }
    if (typ === POT_BLINDNESS && !attacktype(mon.data, AT_GAZE)) {
      return TRUE;
    }
    break;
  case SCROLL_CLASS:
    if (typ === SCR_TELEPORTATION || typ === SCR_CREATE_MONSTER || typ === SCR_EARTH || typ === SCR_FIRE) {
      return TRUE;
    }
    break;
  case AMULET_CLASS:
    if (typ === AMULET_OF_LIFE_SAVING) {
      return (!((mon.data.mflags2 & 2) >>> 0 !== 0 || mon.data === $sat(G.mons, 49) || (mon.data.mlet === S_GOLEM || mon.data.mlet === S_VORTEX) || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) ? 1 : 0) << 24 >> 24;
    }
    if (typ === AMULET_OF_REFLECTION) {
      return TRUE;
    }
    break;
  case TOOL_CLASS:
    if (typ === PICK_AXE) {
      return ((mon.data.mflags1 & 64) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
    }
    if (typ === UNICORN_HORN) {
      return (!obj.cursed && !(mon.data.mlet === S_UNICORN && (mon.data.mflags2 & 536870912) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
    }
    if (typ === FROST_HORN || typ === FIRE_HORN) {
      return (obj.spe > 0 && can_blow(mon) ? 1 : 0) << 24 >> 24;
    }
    break;
  case FOOD_CLASS:
    if (typ === CORPSE) {
      return ((mon.misc_worn_check & W_ARMG) !== 0 && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) || !(((mon.data.mresists | mon.mextrinsics) & 128) !== 0) && cures_stoning(mon, obj, FALSE) ? 1 : 0) << 24 >> 24;
    }
    if (typ === TIN) {
      return (mcould_eat_tin(mon) && (!(((mon.data.mresists | mon.mextrinsics) & 128) !== 0) && cures_stoning(mon, obj, TRUE)) ? 1 : 0) << 24 >> 24;
    }
    if (typ === EGG) {
      return ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9) ? 1 : 0) << 24 >> 24;
    }
    break;
  default:
    break;
  }
  return FALSE;
}

export async function mon_reflects(mon: struct_monst | null, str: Ptr | null): Promise<number> {
  let orefl = await which_armor(mon, W_ARMS);
  if (orefl && orefl.otyp === SHIELD_OF_REFLECTION) {
    if (str) {
      await pline(str, s_suffix(await mon_nam(mon)), S("shield"));
      await discover_object(135, 1, 1);
    }
    return TRUE;
  } else if (arti_reflects(mon.mw)) {
    if (str) {
      await pline(str, s_suffix(await mon_nam(mon)), S("weapon"));
    }
    return TRUE;
  } else if ((orefl = await which_armor(mon, W_AMUL)) && orefl.otyp === AMULET_OF_REFLECTION) {
    if (str) {
      await pline(str, s_suffix(await mon_nam(mon)), S("amulet"));
      await discover_object(185, 1, 1);
    }
    return TRUE;
  } else if ((orefl = await which_armor(mon, W_ARM)) && (orefl.otyp === SILVER_DRAGON_SCALES || orefl.otyp === SILVER_DRAGON_SCALE_MAIL)) {
    if (str) {
      await pline(str, s_suffix(await mon_nam(mon)), S("armor"));
    }
    return TRUE;
  } else if (mon.data === $sat(G.mons, PM_SILVER_DRAGON) || mon.data === $sat(G.mons, PM_CHROMATIC_DRAGON)) {
    if (str) {
      await pline(str, s_suffix(await mon_nam(mon)), S("scales"));
    }
    return TRUE;
  }
  return FALSE;
}

export async function ureflects(fmt: Ptr | null, str: Ptr | null): Promise<number> {
  if (G.u.uprops[REFLECTING].extrinsic & W_ARMS) {
    if (fmt && str) {
      await pline(fmt, str, S("shield"));
      await discover_object(135, 1, 1);
    }
    return TRUE;
  } else if (G.u.uprops[REFLECTING].extrinsic & W_WEP) {
    if (fmt && str) {
      await pline(fmt, str, S("weapon"));
    }
    return TRUE;
  } else if (G.u.uprops[REFLECTING].extrinsic & W_AMUL) {
    if (fmt && str) {
      await pline(fmt, str, S("medallion"));
      await discover_object(185, 1, 1);
    }
    return TRUE;
  } else if (G.u.uprops[REFLECTING].extrinsic & W_ARM) {
    if (fmt && str) {
      await pline(fmt, str, G.uskin ? S("luster") : S("armor"));
    }
    return TRUE;
  } else if (G.youmonst.data === $sat(G.mons, PM_SILVER_DRAGON)) {
    if (fmt && str) {
      await pline(fmt, str, S("scales"));
    }
    return TRUE;
  }
  return FALSE;
}

export async function mcureblindness(mon: struct_monst | null, verbos: number): Promise<void> {
  if (!mon.mcansee) {
    mon.mcansee = 1;
    mon.mblinded = 0;
    if (verbos && (mon.data.mflags1 & 4096) >>> 0 === 0) {
      await pline(S("%s can see again."), await Monnam(mon));
    }
  }
}

export async function munstone(mon: struct_monst | null, by_you: number): Promise<number> {
  let obj = null;
  let tinok = 0;
  if (((mon.data.mresists | mon.mextrinsics) & 128) !== 0) {
    return FALSE;
  }
  if (mon.meating || !mon.mcanmove || mon.msleeping | 0) {
    return FALSE;
  }
  mon.mstrategy = (mon.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
  tinok = mcould_eat_tin(mon);
  for (obj = mon.minvent; obj; obj = obj.nobj) {
    if (cures_stoning(mon, obj, tinok)) {
      await mon_consume_unstone(mon, obj, by_you, TRUE);
      return TRUE;
    }
  }
  return FALSE;
}

async function mon_consume_unstone(mon: struct_monst | null, obj: struct_obj | null, by_you: number, stoning: number): Promise<void> {
  let vis = ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) << 24 >> 24;
  let tinned = (obj.otyp === TIN ? 1 : 0) << 24 >> 24;
  let food = (obj.otyp === CORPSE || tinned ? 1 : 0) << 24 >> 24;
  let acid = (obj.otyp === POT_ACID || food && ($sat(G.mons, obj.corpsenm).mflags1 & 134217728) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let lizard = (food && obj.corpsenm === PM_LIZARD ? 1 : 0) << 24 >> 24;
  let nutrit = food ? await dog_nutrition(mon, obj) : 0;
  if (stoning) {
    await mon_adjust_speed(mon, -3, null);
  }
  if (vis) {
    let save_quan = obj.quan;
    obj.quan = 1;
    await pline(S("%s %s %s."), await Monnam(mon), obj.oclass === POTION_CLASS ? S("quaffs") : obj.otyp === TIN ? S("opens and eats the contents of") : S("eats"), await distant_name(obj, doname));
    obj.quan = save_quan;
  } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    await You_hear(S("%s."), obj.oclass === POTION_CLASS ? S("drinking") : S("chewing"));
  }
  await m_useup(mon, obj);
  if (acid && !tinned && !(((mon.data.mresists | mon.mextrinsics) & 64) !== 0)) {
    mon.mhp -= rnd(15);
    if (vis) {
      await pline(S("%s has a very bad case of stomach acid."), await Monnam(mon));
    }
    if (mon.mhp < 1) {
      await pline(S("%s dies!"), await Monnam(mon));
      if (by_you) {
        await xkilled(mon, XKILL_NOMSG | XKILL_NOCONDUCT);
      } else {
        await mondead(mon);
      }
      return;
    }
  }
  if (stoning && vis) {
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await pline(S("What a pity - %s just ruined a future piece of art!"), await mon_nam(mon));
    } else {
      await pline(S("%s seems limber!"), await Monnam(mon));
    }
  }
  if (lizard && (mon.mconf | 0 || mon.mstun | 0)) {
    mon.mconf = 0;
    mon.mstun = 0;
    if (vis && !(mon.data === $sat(G.mons, 125) || mon.data === $sat(G.mons, 126) || mon.data === $sat(G.mons, 128)) && mon.data !== $sat(G.mons, PM_STALKER)) {
      await pline(S("%s seems steadier now."), await Monnam(mon));
    }
  }
  if (mon.mtame && !mon.isminion && nutrit > 0) {
    let edog = mon.mextra.edog;
    if (edog.hungrytime < G.monstermoves) {
      edog.hungrytime = G.monstermoves;
    }
    edog.hungrytime += nutrit;
    mon.mconf = 0;
  }
  mon.movement = mon.movement - NORMAL_SPEED << 16 >> 16;
  mon.mlstmv = G.monstermoves;
}

function cures_stoning(mon: struct_monst | null, obj: struct_obj | null, tinok: number): number {
  if (obj.otyp === POT_ACID) {
    return TRUE;
  }
  if (obj.otyp !== CORPSE && (obj.otyp !== TIN || !tinok)) {
    return FALSE;
  }
  if (obj.corpsenm === NON_PM) {
    return FALSE;
  }
  return (obj.corpsenm === PM_LIZARD || ($sat(G.mons, obj.corpsenm).mflags1 & 134217728) >>> 0 !== 0 && (obj.corpsenm !== PM_GREEN_SLIME || (mon.data === $sat(G.mons, 205) || (mon.data === $sat(G.mons, 110) || mon.data === $sat(G.mons, 30) || mon.data === $sat(G.mons, 152) || mon.data === $sat(G.mons, 326)) || mon.data.mlet === S_GHOST)) ? 1 : 0) << 24 >> 24;
}

function mcould_eat_tin(mon: struct_monst | null): number {
  let obj = null;
  let mwep = null;
  let welded_wep = 0;
  if ((mon.data.mflags1 & 262144) >>> 0 !== 0) {
    return FALSE;
  }
  mwep = mon.mw;
  welded_wep = (mwep && mwelded(mwep) ? 1 : 0) << 24 >> 24;
  for (obj = mon.minvent; obj; obj = obj.nobj) {
    if (welded_wep && obj !== mwep) {
      continue;
    }
    if (obj.otyp === TIN_OPENER || obj.oclass === WEAPON_CLASS && (G.objects[obj.otyp].oc_subtyp === P_DAGGER || G.objects[obj.otyp].oc_subtyp === P_KNIFE)) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function munslime(mon: struct_monst | null, by_you: number): Promise<number> {
  let obj = null;
  let odummy = new struct_obj();
  let mptr = mon.data;
  if (mptr === $sat(G.mons, 205) || (mptr === $sat(G.mons, 110) || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 152) || mptr === $sat(G.mons, 326)) || mptr.mlet === S_GHOST) {
    return FALSE;
  }
  if (mon.meating || !mon.mcanmove || mon.msleeping | 0) {
    return FALSE;
  }
  mon.mstrategy = (mon.mstrategy & ~STRAT_WAITFORU >>> 0) >>> 0;
  if (!mon.mcan && !mon.mspec_used && attacktype_fordmg(mptr, AT_BREA, AD_FIRE)) {
    odummy.$cp(G.zeroobj);
    return await muse_unslime(mon, odummy, null, by_you);
  }
  if (!((mptr.mflags1 & 262144) >>> 0 !== 0) && !((mptr.mflags1 & 65536) >>> 0 !== 0)) {
    let t = null;
    for (obj = mon.minvent; obj; obj = obj.nobj) {
      if (cures_sliming(mon, obj)) {
        return await muse_unslime(mon, obj, null, by_you);
      }
    }
    if ((!(t = t_at(mon.mx, mon.my)) || (t.ttyp | 0) !== FIRE_TRAP) && mptr.mmove && !mon.mtrapped) {
      let xy = $arr(2, () => new Int32Array(8));
      let x = 0;
      let y = 0;
      let idx = 0;
      let ridx = 0;
      let nxy = 0;
      for (x = mon.mx - 1; x <= mon.mx + 1; ++x) {
        for (y = mon.my - 1; y <= mon.my + 1; ++y) {
          if (isok(x, y) && accessible(x, y) && !(!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && (x !== G.u.ux || y !== G.u.uy)) {
            xy[0][nxy] = x, xy[1][nxy] = y;
            ++nxy;
          }
        }
      }
      for (idx = 0; idx < nxy; ++idx) {
        ridx = rn2(nxy - idx) + idx;
        if (ridx !== idx) {
          x = xy[0][idx];
          xy[0][idx] = xy[0][ridx];
          xy[0][ridx] = x;
          y = xy[1][idx];
          xy[1][idx] = xy[1][ridx];
          xy[1][ridx] = y;
        }
        if (!!(t = t_at(xy[0][idx], xy[1][idx])) && (t.ttyp | 0) === FIRE_TRAP) {
          break;
        }
      }
    }
    if (t && (t.ttyp | 0) === FIRE_TRAP) {
      return await muse_unslime(mon, G.zeroobj, t, by_you);
    }
  }
  return FALSE;
}

async function muse_unslime(mon: struct_monst | null, obj: struct_obj | null, trap: struct_trap | null, by_you: number): Promise<number> {
  const odummyp = [null];
  let otyp = obj.otyp;
  let dmg = 0;
  let vis = ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) ? 1 : 0) << 24 >> 24;
  let res = TRUE;
  if (vis) {
    await pline(S("%s starts turning %s."), await Monnam(mon), await green_mon(mon) ? S("into ooze") : hcolor(G.c_color_names.c_green));
  }
  await mon_adjust_speed(mon, -4, null);
  if (trap) {
    let Mnam = vis ? await Monnam(mon) : null;
    if (mon.mx === trap.tx && mon.my === trap.ty) {
      if (vis) {
        await pline(S("%s triggers %s fire trap!"), Mnam, trap.tseen | 0 ? S("the") : S("a"));
      }
    } else {
      G.level.monsters[mon.mx][mon.my] = null;
      await newsym(mon.mx, mon.my);
      await place_monster(mon, trap.tx, trap.ty);
      if (mon.wormno) {
        await worm_move(mon);
      }
      await newsym(mon.mx, mon.my);
      if (vis) {
        await pline(S("%s %s %s %s fire trap!"), Mnam, vtense(G.c_common_strings.c_fakename[0], locomotion(mon.data, S("move"))), mon.data.mlet === S_EYE || mon.data.mlet === S_LIGHT ? S("over") : S("onto"), trap.tseen | 0 ? S("the") : S("a"));
      }
    }
    mon.mtrapseen = mon.mtrapseen & ~(1 << FIRE_TRAP - 1);
    await mintrap(mon);
  } else if (otyp === STRANGE_OBJECT) {
    if (vis) {
      await pline(S("%s breathes fire on %sself."), await Monnam(mon), G.genders[pronoun_gender(mon, 0)].him);
    }
    if (!rn2(3)) {
      mon.mspec_used = rn2(10) + 5;
    }
    dmg = await zhitm(mon, by_you ? 21 : -21, 1, P(odummyp, 0));
  } else if (otyp === SCR_FIRE) {
    await mreadmsg(mon, obj);
    if (mon.mconf) {
      if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
        await pline(S("Oh, what a pretty fire!"));
      }
      if (vis && !G.objects[otyp].oc_name_known && !G.objects[otyp].oc_uname) {
        await docall(obj);
      }
      await m_useup(mon, obj);
      vis = FALSE;
      res = FALSE;
    } else {
      dmg = (2 * (rn2(3) + 3 + 2 * bcsign(obj)) + 1) / 3 | 0;
      await m_useup(mon, obj);
      await explode(mon.mx, mon.my, -11, dmg, SCROLL_CLASS, by_you ? -EXPL_FIERY : EXPL_FIERY);
      dmg = 0;
    }
  } else {
    if (obj.otyp === FIRE_HORN) {
      await mplayhorn(mon, obj, TRUE);
    } else {
      await mzapwand(mon, obj, TRUE);
    }
    dmg = await zhitm(mon, by_you ? 1 : -1, 2, P(odummyp, 0));
  }
  if (dmg) {
    if (mon.mhp < 1) {
      if (by_you) {
        if (vis) {
          await pline(S("%s is %s by the fire!"), await Monnam(mon), (mon.data.mflags2 & 2) >>> 0 !== 0 || mon.data === $sat(G.mons, 49) || (mon.data.mlet === S_GOLEM || mon.data.mlet === S_VORTEX) ? S("destroyed") : S("killed"));
        }
        await xkilled(mon, XKILL_NOMSG | XKILL_NOCONDUCT);
      } else {
        await monkilled(mon, S("fire"), AD_FIRE);
      }
    } else {
      if (vis) {
        await pline(S("%s is burned%s"), await Monnam(mon), exclam(dmg));
      }
    }
  }
  if (vis) {
    if (res && !(mon.mhp < 1)) {
      await pline(S("%s slime is burned away!"), s_suffix(await Monnam(mon)));
    }
    if (otyp !== STRANGE_OBJECT) {
      await discover_object(otyp, 1, 1);
    }
  }
  mon.movement = mon.movement - NORMAL_SPEED << 16 >> 16;
  mon.mlstmv = G.monstermoves;
  return res;
}

function cures_sliming(mon: struct_monst | null, obj: struct_obj | null): number {
  if (obj.otyp === SCR_FIRE) {
    return (mon.data.mflags1 & 4096) >>> 0 === 0 && mon.mcansee | 0 ? 1 : 0;
  }
  return (obj.otyp === WAN_FIRE || obj.otyp === FIRE_HORN && can_blow(mon)) && obj.spe > 0 ? 1 : 0;
}

async function green_mon(mon: struct_monst | null): Promise<number> {
  let ptr = mon.data;
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    return FALSE;
  }
  if (G.iflags.wc_color) {
    return (ptr.mcolor === CLR_GREEN || ptr.mcolor === CLR_BRIGHT_GREEN ? 1 : 0) << 24 >> 24;
  }
  if (strstri(ptr.mname, S("green"))) {
    return TRUE;
  }
  switch (await monsndx(ptr)) {
  case 130:
  case 210:
  case 320:
  case 39:
  case 50:
  case 300:
  case 62:
  case 155:
  case 323:
  case 66:
    return TRUE;
  default:
    if ((ptr.mflags2 & 16) >>> 0 !== 0 && !((ptr.mflags2 & 2048) >>> 0 !== 0) && !((ptr.mflags2 & 1024) >>> 0 !== 0) && ptr !== $sat(G.mons, PM_GREY_ELF)) {
      return TRUE;
    }
    break;
  }
  return FALSE;
}

export function $init(): void {
  G.m_using = 0;
  m = new struct_musable();
  trapx = 0;
  trapy = 0;
  zap_oseen = 0;
  precheck$empty = S("The potion turns out to be empty.");
}
