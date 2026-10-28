// @ts-nocheck
// NetHack 3.6.7 makemon.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artiname } from './artifact.ts';
import { isok } from './cmd.ts';
import { newsym } from './display.ts';
import { christen_monst, mon_nam, oname, rndghostname, y_monnam } from './do_name.ts';
import { newedog, tamedog } from './dog.ts';
import { deliver_obj_to_mon } from './dokick.ts';
import { In_hell, In_mines, Is_special, level_difficulty, on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { debugcore } from './files.ts';
import { monst_to_any, obj_to_any } from './hack.ts';
import { dist2, sgn, upstart } from './hacklib.ts';
import { consume_obj_charge } from './invent.ts';
import { new_light_source } from './light.ts';
import { newemin } from './minion.ts';
import { add_to_container, add_to_minv, bless, curse, discard_minvent, mkobj, mkobj_at, mksobj, rndmonnum, set_corpsenm, weight } from './mkobj.ts';
import { can_be_hatched, hideunder, mondied, newcham, pm_to_cham } from './mon.ts';
import { attacktype, little_to_big, monsndx, pronoun_gender, set_mon_data } from './mondata.ts';
import { set_apparxy } from './monmove.ts';
import { rnd_defensive_item, rnd_misc_item, rnd_offensive_item } from './muse.ts';
import { discover_object } from './o_init.ts';
import { an, makeplural, rnd_class } from './objnam.ts';
import { impossible, pline } from './pline.ts';
import { mon_aligntyp, newepri } from './priest.ts';
import { qt_montype, quest_info } from './questpgr.ts';
import { create_particular } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { obfree } from './shk.ts';
import { get_shop_item, neweshk, shkname } from './shknam.ts';
import { findgold, mpickobj } from './steal.ts';
import { can_saddle, place_monster, put_saddle_on_mon } from './steed.ts';
import { enexto, enexto_core, goodpos } from './teleport.ts';
import { begin_burn, stop_timer } from './timeout.ts';
import { t_at } from './trap.ts';
import { newegd } from './vault.ts';
import { block_point, does_block } from './vision.ts';
import { count_wsegs, get_wormno, initworm, place_worm_tail_randomly, worm_known } from './worm.ts';
import { m_dowear, mon_adjust_speed, which_armor } from './worn.ts';
import { anon_makemon_c_1514, struct_mextra, struct_monst, struct_nhcoord, struct_obj, struct_permonst, struct_s_level } from './structs.ts';
import { $at2, $rd, $sat, $shl64, $sidx, $ta, $u64, $wr, G, P, S, isupper, memset, sprintf } from './rt/index.ts';
import { AKLYS, ALIGNWEIGHT, AMULET_CLASS, AM_NONE, ARMOR_CLASS, ARROW, ART_DEMONBANE, ART_EXCALIBUR, ART_SUNSWORD, ATHAME, AXE, A_NEUTRAL, A_NONE, BAG_OF_TRICKS, BANDED_MAIL, BATTLE_AXE, BELL_OF_OPENING, BLCORNER, BLINDED, BOULDER, BOW, BROADSWORD, BUGLE, BULLWHIP, CANDELABRUM_OF_INVOCATION, CHAIN_MAIL, CLOAK_OF_MAGIC_RESISTANCE, CLOAK_OF_PROTECTION, CLUB, COIN_CLASS, COLNO, CORPSE, CREAM_PIE, CROSSBOW, CROSSBOW_BOLT, CROSSWALL, CRYSTAL_BALL, CRYSTAL_PLATE_MAIL, C_RATION, DAGGER, DART, DBWALL, DELPHI, DENTED_POT, DETECT_MONSTERS, DF_NONE, DILITHIUM_CRYSTAL, DOOR, DWARVISH_CLOAK, DWARVISH_IRON_HELM, DWARVISH_MATTOCK, DWARVISH_MITHRIL_COAT, DWARVISH_ROUNDSHIELD, DWARVISH_SHORT_SWORD, DWARVISH_SPEAR, EGG, ELVEN_ARROW, ELVEN_BOOTS, ELVEN_BOW, ELVEN_BROADSWORD, ELVEN_CLOAK, ELVEN_DAGGER, ELVEN_LEATHER_HELM, ELVEN_MITHRIL_COAT, ELVEN_SHIELD, ELVEN_SHORT_SWORD, ELVEN_SPEAR, FALSE, FIGURINE, FLAIL, FOOD_CLASS, GEM_CLASS, GLAIVE, GOLD_PIECE, G_EXTINCT, G_FREQ, G_GENOD, G_GONE, G_HELL, G_LGROUP, G_NOCORPSE, G_NOGEN, G_NOHELL, G_SGROUP, G_UNIQ, HELMET, HIGH_BOOTS, HOLE, HWALL, INFRAVISION, IRON_SHOES, KNIFE, K_RATION, LARGE_BOX, LARGE_SHIELD, LEATHER_ARMOR, LEATHER_CLOAK, LEATHER_GLOVES, LEATHER_JACKET, LONG_SWORD, LOW_BOOTS, LOW_PM, LS_MONSTER, LUCERN_HAMMER, LUCKSTONE, M3_CLOSE, M3_COVETOUS, M3_WAITFORU, M3_WAITMASK, MACE, MAXMCLASSES, MAXMONNO, MAXOCLASSES, MIRROR, MM_ADJACENTOK, MM_ANGRY, MM_ASLEEP, MM_EDOG, MM_EGD, MM_EMIN, MM_EPRI, MM_ESHK, MM_IGNOREWATER, MM_NOCOUNTBIRTH, MM_NOGRP, MM_NONAME, MM_NOWAIT, MS_BRIBE, MS_GUARDIAN, MS_LEADER, MS_NEMESIS, MS_PRIEST, MUMMY_WRAPPING, M_AP_FURNITURE, M_AP_OBJECT, NON_PM, NO_MINVENT, NO_MM_FLAGS, ORCISH_ARROW, ORCISH_BOW, ORCISH_CHAIN_MAIL, ORCISH_CLOAK, ORCISH_DAGGER, ORCISH_HELM, ORCISH_SHIELD, ORCISH_SHORT_SWORD, PARTISAN, PICK_AXE, PIT, PLATE_MAIL, PM_ALIGNED_PRIEST, PM_ANGEL, PM_ARCH_LICH, PM_ASMODEUS, PM_BLACK_LIGHT, PM_CROESUS, PM_ELVENKING, PM_ERINYS, PM_ETTIN, PM_FOREST_CENTAUR, PM_GHOST, PM_GIANT_EEL, PM_GOBLIN, PM_GRAY_DRAGON, PM_GUARD, PM_HIGH_PRIEST, PM_HOBBIT, PM_HOUSECAT, PM_ICE_DEVIL, PM_LONG_WORM, PM_MAIL_DAEMON, PM_MASTER_LICH, PM_MINOTAUR, PM_MORDOR_ORC, PM_NAZGUL, PM_NINJA, PM_OGRE_KING, PM_OGRE_LORD, PM_ORC_CAPTAIN, PM_ORC_SHAMAN, PM_PESTILENCE, PM_PRIEST, PM_PRIESTESS, PM_SALAMANDER, PM_SHOPKEEPER, PM_SOLDIER, PM_STALKER, PM_URUK_HAI, PM_VLAD_THE_IMPALER, PM_WATCHMAN, PM_WATCH_CAPTAIN, PM_WIZARD_OF_YENDOR, PM_WUMPUS, POTION_CLASS, POT_EXTRA_HEALING, POT_HEALING, POT_OBJECT_DETECTION, POT_SICKNESS, PROT_FROM_SHAPE_CHANGERS, P_SABER, P_SHORT_SWORD, QUARTERSTAFF, RANDOM_CLASS, RANSEUR, RING_CLASS, RING_MAIL, RIN_INVISIBILITY, ROBE, ROCK_CLASS, ROOMOFFSET, ROT_CORPSE, ROWNO, RUBBER_HOSE, SADDLE, SCIMITAR, SCORR, SCROLL_CLASS, SDOOR, SEE_INVIS, SHIELD_OF_REFLECTION, SHOPBASE, SHORT_SWORD, SHURIKEN, SILVER_SABER, SKELETON_KEY, SLIME_MOLD, SLING, SMALL_SHIELD, SPBOOK_CLASS, SPEAR, SPECIAL_PM, SPETUM, SPE_BOOK_OF_THE_DEAD, SPE_DIG, SPLINT_MAIL, STATUE, STILETTO, STRANGE_OBJECT, STRAT_APPEARMSG, STRAT_CLOSE, STRAT_WAITFORU, STUDDED_LEATHER_ARMOR, S_ANGEL, S_BAT, S_CENTAUR, S_DEMON, S_DRAGON, S_EEL, S_ELEMENTAL, S_EYE, S_GHOST, S_GIANT, S_GNOME, S_GOLEM, S_HUMAN, S_HUMANOID, S_JABBERWOCK, S_KOBOLD, S_KOP, S_LEPRECHAUN, S_LICH, S_LIGHT, S_LIZARD, S_MIMIC, S_MIMIC_DEF, S_MUMMY, S_NYMPH, S_OGRE, S_ORC, S_QUANTMECH, S_SNAKE, S_SPIDER, S_TRAPPER, S_TROLL, S_UNICORN, S_VORTEX, S_WRAITH, S_ZOMBIE, S_altar, S_dnstair, S_fountain, S_hcdoor, S_hwall, S_upstair, S_vcdoor, S_vwall, TALLOW_CANDLE, TDWALL, TELEPAT, TEMPLE, TIN, TIN_WHISTLE, TLCORNER, TOOL_CLASS, TRIDENT, TRUE, TRWALL, TUWALL, TWO_HANDED_SWORD, URUK_HAI_SHIELD, VAULT, WAND_CLASS, WAN_COLD, WAN_DEATH, WAN_DIGGING, WAN_FIRE, WAN_MAGIC_MISSILE, WAN_NOTHING, WAN_STRIKING, WARN_OF_MON, WAX_CANDLE, WEAPON_CLASS, W_SADDLE, ZOO } from './consts.ts';

let rndmonst_state: anon_makemon_c_1514;
let syms: any;
let align_shift$oldmoves: number;
let align_shift$lev: struct_s_level | null;

export async function is_home_elemental(ptr: struct_permonst | null): Promise<number> {
  if (ptr.mlet === S_ELEMENTAL) {
    switch (await monsndx(ptr)) {
    case 151:
      return ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) ? 1 : 0) << 24 >> 24;
    case 152:
      return ((G.dungeon_topology.d_fire_level.dlevel || G.dungeon_topology.d_fire_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_fire_level) ? 1 : 0) << 24 >> 24;
    case 153:
      return ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level) ? 1 : 0) << 24 >> 24;
    case 154:
      return ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? 1 : 0) << 24 >> 24;
    }
  }
  return FALSE;
}

async function wrong_elem_type(ptr: struct_permonst | null): Promise<number> {
  if (ptr.mlet === S_ELEMENTAL) {
    return (!await is_home_elemental(ptr) ? 1 : 0) << 24 >> 24;
  } else if ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level)) {
  } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    if (!((ptr.mflags1 & 2) >>> 0 !== 0)) {
      return TRUE;
    }
  } else if ((G.dungeon_topology.d_fire_level.dlevel || G.dungeon_topology.d_fire_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_fire_level)) {
    if (!((ptr.mresists & 1) !== 0)) {
      return TRUE;
    }
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
    if (!((ptr.mflags1 & 1) >>> 0 !== 0 && ptr.mlet !== S_TRAPPER) && !(ptr.mlet === S_EYE || ptr.mlet === S_LIGHT) && !((ptr.mflags1 & 4) >>> 0 !== 0) && !(ptr.mlet === S_GHOST) && !(ptr.mlet === S_VORTEX || ptr === $sat(G.mons, 151))) {
      return TRUE;
    }
  }
  return FALSE;
}

async function m_initgrp(mtmp: struct_monst | null, x: number, y: number, n: number, mmflags: number): Promise<void> {
  let mm = new struct_nhcoord();
  let cnt = rnd(n);
  let mon = null;
  cnt = cnt / (G.u.ulevel < 3 ? 4 : G.u.ulevel < 5 ? 2 : 1) | 0;
  if (!cnt) {
    ++cnt;
  }
  mm.x = x << 24 >> 24;
  mm.y = y << 24 >> 24;
  while (cnt--) {
    if (peace_minded(mtmp.data)) {
      continue;
    }
    if (await enexto(mm, mm.x, mm.y, mtmp.data)) {
      mon = await makemon(mtmp.data, mm.x, mm.y, mmflags | MM_NOGRP);
      if (mon) {
        mon.mpeaceful = (FALSE) & 1;
        mon.mavenge = 0;
        set_malign(mon);
      }
    }
  }
}

async function m_initthrow(mtmp: struct_monst | null, otyp: number, oquan: number): Promise<void> {
  let otmp = null;
  otmp = await mksobj(otyp, TRUE, FALSE);
  otmp.quan = rn2(oquan) + 3;
  otmp.owt = await weight(otmp) >>> 0;
  if (otyp === ORCISH_ARROW) {
    otmp.otrapped = (TRUE) & 1;
  }
  await mpickobj(mtmp, otmp);
}

async function m_initweap(mtmp: struct_monst | null): Promise<void> {
  let ptr = mtmp.data;
  let mm = await monsndx(ptr);
  let otmp = null;
  let bias = 0;
  let w1 = 0;
  let w2 = 0;
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    return;
  }
  switch (ptr.mlet) {
  case S_GIANT:
    if (rn2(2)) {
      await mongets(mtmp, mm !== PM_ETTIN ? BOULDER : CLUB);
    }
    break;
  case S_HUMAN:
    if ((ptr.mflags2 & 512) >>> 0 !== 0) {
      w1 = w2 = 0;
      switch (mm) {
      case 278:
      case 273:
        if (!rn2(3)) {
          w1 = rn2(55 - 42 + 1) + 42;
          w2 = rn2(2) ? DAGGER : KNIFE;
        } else {
          w1 = rn2(2) ? SPEAR : SHORT_SWORD;
        }
        break;
      case 274:
        w1 = rn2(2) ? FLAIL : MACE;
        break;
      case 276:
        w1 = rn2(2) ? BROADSWORD : LONG_SWORD;
        break;
      case 277:
      case 279:
        w1 = rn2(2) ? LONG_SWORD : SILVER_SABER;
        break;
      default:
        if (!rn2(4)) {
          w1 = DAGGER;
        }
        if (!rn2(7)) {
          w2 = SPEAR;
        }
        break;
      }
      if (w1) {
        await mongets(mtmp, w1);
      }
      if (!w2 && w1 !== DAGGER && !rn2(4)) {
        w2 = KNIFE;
      }
      if (w2) {
        await mongets(mtmp, w2);
      }
    } else if ((ptr.mflags2 & 16) >>> 0 !== 0) {
      if (rn2(2)) {
        await mongets(mtmp, rn2(2) ? ELVEN_MITHRIL_COAT : ELVEN_CLOAK);
      }
      if (rn2(2)) {
        await mongets(mtmp, ELVEN_LEATHER_HELM);
      } else if (!rn2(4)) {
        await mongets(mtmp, ELVEN_BOOTS);
      }
      if (rn2(2)) {
        await mongets(mtmp, ELVEN_DAGGER);
      }
      switch (rn2(3)) {
      case 0:
        if (!rn2(4)) {
          await mongets(mtmp, ELVEN_SHIELD);
        }
        if (rn2(3)) {
          await mongets(mtmp, ELVEN_SHORT_SWORD);
        }
        await mongets(mtmp, ELVEN_BOW);
        await m_initthrow(mtmp, ELVEN_ARROW, 12);
        break;
      case 1:
        await mongets(mtmp, ELVEN_BROADSWORD);
        if (rn2(2)) {
          await mongets(mtmp, ELVEN_SHIELD);
        }
        break;
      case 2:
        if (rn2(2)) {
          await mongets(mtmp, ELVEN_SPEAR);
          await mongets(mtmp, ELVEN_SHIELD);
        }
        break;
      }
      if (mm === PM_ELVENKING) {
        if (rn2(3) || G.in_mklev && ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level))) {
          await mongets(mtmp, PICK_AXE);
        }
        if (!rn2(50)) {
          await mongets(mtmp, CRYSTAL_BALL);
        }
      }
    } else if (ptr.msound === MS_PRIEST || ptr.mlet === S_HUMAN && G.urole.malenum === 335 && (ptr.msound === 31 || ptr.msound === 32)) {
      otmp = await mksobj(MACE, FALSE, FALSE);
      otmp.spe = rnd(3) << 24 >> 24;
      if (!rn2(2)) {
        await curse(otmp);
      }
      await mpickobj(mtmp, otmp);
    } else if (mm === PM_NINJA) {
      await mongets(mtmp, rn2(4) ? SHURIKEN : DART);
      await mongets(mtmp, rn2(4) ? SHORT_SWORD : AXE);
    } else if (ptr.msound === MS_GUARDIAN) {
      switch (mm) {
      case 368:
      case 371:
      case 373:
      case 374:
      case 379:
      case 381:
        if (rn2(2)) {
          await mongets(mtmp, rn2(3) ? DAGGER : KNIFE);
        }
        if (rn2(5)) {
          await mongets(mtmp, rn2(3) ? LEATHER_JACKET : LEATHER_CLOAK);
        }
        if (rn2(3)) {
          await mongets(mtmp, rn2(3) ? LOW_BOOTS : HIGH_BOOTS);
        }
        if (rn2(3)) {
          await mongets(mtmp, POT_HEALING);
        }
        break;
      case 369:
      case 372:
      case 378:
      case 380:
        await mongets(mtmp, rn2(3) ? LONG_SWORD : SHORT_SWORD);
        await mongets(mtmp, rn2(3) ? CHAIN_MAIL : LEATHER_ARMOR);
        if (rn2(2)) {
          await mongets(mtmp, rn2(2) ? LOW_BOOTS : HIGH_BOOTS);
        }
        if (!rn2(3)) {
          await mongets(mtmp, LEATHER_CLOAK);
        }
        if (!rn2(3)) {
          await mongets(mtmp, BOW);
          await m_initthrow(mtmp, ARROW, 12);
        }
        break;
      case 375:
        await mongets(mtmp, rn2(3) ? SHORT_SWORD : DAGGER);
        if (rn2(2)) {
          await mongets(mtmp, rn2(2) ? LEATHER_JACKET : LEATHER_ARMOR);
        }
        await mongets(mtmp, BOW);
        await m_initthrow(mtmp, ARROW, 12);
        break;
      case 376:
        await mongets(mtmp, CLUB);
        await mongets(mtmp, rn2(3) ? DAGGER : KNIFE);
        if (rn2(2)) {
          await mongets(mtmp, LEATHER_GLOVES);
        }
        await mongets(mtmp, rn2(2) ? LEATHER_JACKET : LEATHER_ARMOR);
        break;
      case 370:
        await mongets(mtmp, CLUB);
        await mongets(mtmp, LEATHER_ARMOR);
        break;
      }
    }
    break;
  case S_ANGEL:
    if ((ptr.mflags1 & 131072) >>> 0 !== 0) {
      otmp = await mksobj(LONG_SWORD, FALSE, FALSE);
      if (!rn2(20) || (ptr.mflags2 & 1024) >>> 0 !== 0) {
        otmp = await oname(otmp, artiname(rn2(2) ? ART_DEMONBANE : ART_SUNSWORD));
      }
      await bless(otmp);
      otmp.oerodeproof = (TRUE) & 1;
      otmp.spe = rn2(4) << 24 >> 24;
      await mpickobj(mtmp, otmp);
      otmp = await mksobj(!rn2(4) || (ptr.mflags2 & 1024) >>> 0 !== 0 ? SHIELD_OF_REFLECTION : LARGE_SHIELD, FALSE, FALSE);
      otmp.oerodeproof = (TRUE) & 1;
      otmp.spe = 0;
      await mpickobj(mtmp, otmp);
    }
    break;
  case S_HUMANOID:
    if (mm === PM_HOBBIT) {
      switch (rn2(3)) {
      case 0:
        await mongets(mtmp, DAGGER);
        break;
      case 1:
        await mongets(mtmp, ELVEN_DAGGER);
        break;
      case 2:
        await mongets(mtmp, SLING);
        break;
      }
      if (!rn2(10)) {
        await mongets(mtmp, ELVEN_MITHRIL_COAT);
      }
      if (!rn2(10)) {
        await mongets(mtmp, DWARVISH_CLOAK);
      }
    } else if ((ptr.mflags2 & 32) >>> 0 !== 0) {
      if (rn2(7)) {
        await mongets(mtmp, DWARVISH_CLOAK);
      }
      if (rn2(7)) {
        await mongets(mtmp, IRON_SHOES);
      }
      if (!rn2(4)) {
        await mongets(mtmp, DWARVISH_SHORT_SWORD);
        if (rn2(2)) {
          await mongets(mtmp, DWARVISH_MATTOCK);
        } else {
          await mongets(mtmp, rn2(2) ? AXE : DWARVISH_SPEAR);
          await mongets(mtmp, DWARVISH_ROUNDSHIELD);
        }
        await mongets(mtmp, DWARVISH_IRON_HELM);
        if (!rn2(3)) {
          await mongets(mtmp, DWARVISH_MITHRIL_COAT);
        }
      } else {
        await mongets(mtmp, !rn2(3) ? PICK_AXE : DAGGER);
      }
    }
    break;
  case S_KOP:
    if (!rn2(4)) {
      await m_initthrow(mtmp, CREAM_PIE, 2);
    }
    if (!rn2(3)) {
      await mongets(mtmp, rn2(2) ? CLUB : RUBBER_HOSE);
    }
    break;
  case S_ORC:
    if (rn2(2)) {
      await mongets(mtmp, ORCISH_HELM);
    }
    switch (mm !== PM_ORC_CAPTAIN ? mm : rn2(2) ? PM_MORDOR_ORC : PM_URUK_HAI) {
    case 73:
      if (!rn2(3)) {
        await mongets(mtmp, SCIMITAR);
      }
      if (!rn2(3)) {
        await mongets(mtmp, ORCISH_SHIELD);
      }
      if (!rn2(3)) {
        await mongets(mtmp, KNIFE);
      }
      if (!rn2(3)) {
        await mongets(mtmp, ORCISH_CHAIN_MAIL);
      }
      break;
    case 74:
      if (!rn2(3)) {
        await mongets(mtmp, ORCISH_CLOAK);
      }
      if (!rn2(3)) {
        await mongets(mtmp, ORCISH_SHORT_SWORD);
      }
      if (!rn2(3)) {
        await mongets(mtmp, IRON_SHOES);
      }
      if (!rn2(3)) {
        await mongets(mtmp, ORCISH_BOW);
        await m_initthrow(mtmp, ORCISH_ARROW, 12);
      }
      if (!rn2(3)) {
        await mongets(mtmp, URUK_HAI_SHIELD);
      }
      break;
    default:
      if (mm !== PM_ORC_SHAMAN && rn2(2)) {
        await mongets(mtmp, mm === PM_GOBLIN || rn2(2) === 0 ? ORCISH_DAGGER : SCIMITAR);
      }
    }
    break;
  case S_OGRE:
    if (!rn2(mm === PM_OGRE_KING ? 3 : mm === PM_OGRE_LORD ? 6 : 12)) {
      await mongets(mtmp, BATTLE_AXE);
    } else {
      await mongets(mtmp, CLUB);
    }
    break;
  case S_TROLL:
    if (!rn2(2)) {
      switch (rn2(4)) {
      case 0:
        await mongets(mtmp, RANSEUR);
        break;
      case 1:
        await mongets(mtmp, PARTISAN);
        break;
      case 2:
        await mongets(mtmp, GLAIVE);
        break;
      case 3:
        await mongets(mtmp, SPETUM);
        break;
      }
    }
    break;
  case S_KOBOLD:
    if (!rn2(4)) {
      await m_initthrow(mtmp, DART, 12);
    }
    break;
  case S_CENTAUR:
    if (rn2(2)) {
      if (ptr === $sat(G.mons, PM_FOREST_CENTAUR)) {
        await mongets(mtmp, BOW);
        await m_initthrow(mtmp, ARROW, 12);
      } else {
        await mongets(mtmp, CROSSBOW);
        await m_initthrow(mtmp, CROSSBOW_BOLT, 12);
      }
    }
    break;
  case S_WRAITH:
    await mongets(mtmp, KNIFE);
    await mongets(mtmp, LONG_SWORD);
    break;
  case S_ZOMBIE:
    if (!rn2(4)) {
      await mongets(mtmp, LEATHER_ARMOR);
    }
    if (!rn2(4)) {
      await mongets(mtmp, rn2(3) ? KNIFE : SHORT_SWORD);
    }
    break;
  case S_LIZARD:
    if (mm === PM_SALAMANDER) {
      await mongets(mtmp, rn2(7) ? SPEAR : rn2(3) ? TRIDENT : STILETTO);
    }
    break;
  case S_DEMON:
    switch (mm) {
    case 299:
      await mongets(mtmp, BULLWHIP);
      await mongets(mtmp, BROADSWORD);
      break;
    case 302:
      await mongets(mtmp, WAN_DEATH);
      break;
    case 287:
      await mongets(mtmp, rn2(4) ? TRIDENT : BULLWHIP);
      break;
    case 304:
      await mongets(mtmp, WAN_STRIKING);
      break;
    case 301:
      await mongets(mtmp, FLAIL);
      break;
    }
    if (!((ptr.mflags2 & 256) >>> 0 !== 0)) {
      break;
    }
  default:
    bias = ((ptr.mflags2 & 1024) >>> 0 !== 0 ? 1 : 0) + ((ptr.mflags2 & 2048) >>> 0 !== 0 ? 1 : 0) * 2 + ((ptr.mflags2 & 33554432) >>> 0 !== 0 ? 1 : 0);
    switch (rnd(14 - 2 * bias)) {
    case 1:
      if ((ptr.mflags2 & 67108864) >>> 0 !== 0) {
        await mongets(mtmp, BATTLE_AXE);
      } else {
        await m_initthrow(mtmp, DART, 12);
      }
      break;
    case 2:
      if ((ptr.mflags2 & 67108864) >>> 0 !== 0) {
        await mongets(mtmp, TWO_HANDED_SWORD);
      } else {
        await mongets(mtmp, CROSSBOW);
        await m_initthrow(mtmp, CROSSBOW_BOLT, 12);
      }
      break;
    case 3:
      await mongets(mtmp, BOW);
      await m_initthrow(mtmp, ARROW, 12);
      break;
    case 4:
      if ((ptr.mflags2 & 67108864) >>> 0 !== 0) {
        await mongets(mtmp, LONG_SWORD);
      } else {
        await m_initthrow(mtmp, DAGGER, 3);
      }
      break;
    case 5:
      if ((ptr.mflags2 & 67108864) >>> 0 !== 0) {
        await mongets(mtmp, LUCERN_HAMMER);
      } else {
        await mongets(mtmp, AKLYS);
      }
      break;
    default:
      break;
    }
    break;
  }
  if (mtmp.m_lev > rn2(75)) {
    await mongets(mtmp, await rnd_offensive_item(mtmp));
  }
}

export async function mkmonmoney(mtmp: struct_monst | null, amount: number): Promise<void> {
  let gold = await mksobj(GOLD_PIECE, FALSE, FALSE);
  gold.quan = amount;
  await add_to_minv(mtmp, gold);
}

async function m_initinv(mtmp: struct_monst | null): Promise<void> {
  let cnt = 0;
  let otmp = null;
  let ptr = mtmp.data;
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
    return;
  }
  switch (ptr.mlet) {
  case S_HUMAN:
    if ((ptr.mflags2 & 512) >>> 0 !== 0) {
      let mac = 0;
      switch (await monsndx(ptr)) {
      case 268:
        mac = -1;
        break;
      case 273:
        mac = 3;
        break;
      case 274:
        mac = 0;
        break;
      case 276:
        mac = -2;
        break;
      case 277:
        mac = -3;
        break;
      case 278:
        mac = 3;
        break;
      case 279:
        mac = -2;
        break;
      default:
        await impossible(S("odd mercenary %d?"), await monsndx(ptr));
        mac = 0;
        break;
      }
      if (mac < -1 && rn2(5)) {
        mac += 7 + await mongets(mtmp, rn2(5) ? PLATE_MAIL : CRYSTAL_PLATE_MAIL);
      } else if (mac < 3 && rn2(5)) {
        mac += 6 + await mongets(mtmp, rn2(3) ? SPLINT_MAIL : BANDED_MAIL);
      } else if (rn2(5)) {
        mac += 3 + await mongets(mtmp, rn2(3) ? RING_MAIL : STUDDED_LEATHER_ARMOR);
      } else {
        mac += 2 + await mongets(mtmp, LEATHER_ARMOR);
      }
      if (mac < 10 && rn2(3)) {
        mac += 1 + await mongets(mtmp, HELMET);
      } else if (mac < 10 && rn2(2)) {
        mac += 1 + await mongets(mtmp, DENTED_POT);
      }
      if (mac < 10 && rn2(3)) {
        mac += 1 + await mongets(mtmp, SMALL_SHIELD);
      } else if (mac < 10 && rn2(2)) {
        mac += 2 + await mongets(mtmp, LARGE_SHIELD);
      }
      if (mac < 10 && rn2(3)) {
        mac += 1 + await mongets(mtmp, LOW_BOOTS);
      } else if (mac < 10 && rn2(2)) {
        mac += 2 + await mongets(mtmp, HIGH_BOOTS);
      }
      if (mac < 10 && rn2(3)) {
        mac += 1 + await mongets(mtmp, LEATHER_GLOVES);
      } else if (mac < 10 && rn2(2)) {
        mac += 1 + await mongets(mtmp, LEATHER_CLOAK);
      }
      ;
      if (ptr === $sat(G.mons, PM_WATCH_CAPTAIN)) {
        ;
      } else if (ptr === $sat(G.mons, PM_WATCHMAN)) {
        if (rn2(3)) {
          await mongets(mtmp, TIN_WHISTLE);
        }
      } else if (ptr === $sat(G.mons, PM_GUARD)) {
        otmp = await mksobj(TIN_WHISTLE, TRUE, FALSE);
        await curse(otmp);
        await mpickobj(mtmp, otmp);
      } else {
        if (!rn2(3)) {
          await mongets(mtmp, K_RATION);
        }
        if (!rn2(2)) {
          await mongets(mtmp, C_RATION);
        }
        if (ptr !== $sat(G.mons, PM_SOLDIER) && !rn2(3)) {
          await mongets(mtmp, BUGLE);
        }
      }
    } else if (ptr === $sat(G.mons, PM_SHOPKEEPER)) {
      await mongets(mtmp, SKELETON_KEY);
      switch (rn2(4)) {
      case 0:
        await mongets(mtmp, WAN_MAGIC_MISSILE);
      case 1:
        await mongets(mtmp, POT_EXTRA_HEALING);
      case 2:
        await mongets(mtmp, POT_HEALING);
      case 3:
        await mongets(mtmp, WAN_STRIKING);
      }
    } else if (ptr.msound === MS_PRIEST || ptr.mlet === S_HUMAN && G.urole.malenum === 335 && (ptr.msound === 31 || ptr.msound === 32)) {
      await mongets(mtmp, rn2(7) ? ROBE : rn2(3) ? CLOAK_OF_PROTECTION : CLOAK_OF_MAGIC_RESISTANCE);
      await mongets(mtmp, SMALL_SHIELD);
      await mkmonmoney(mtmp, rn2(10) + 20);
    } else if (ptr.mlet === S_HUMAN && G.urole.malenum === 334 && (ptr.msound === 31 || ptr.msound === 32)) {
      await mongets(mtmp, rn2(11) ? ROBE : CLOAK_OF_MAGIC_RESISTANCE);
    }
    break;
  case S_NYMPH:
    if (!rn2(2)) {
      await mongets(mtmp, MIRROR);
    }
    if (!rn2(2)) {
      await mongets(mtmp, POT_OBJECT_DETECTION);
    }
    break;
  case S_GIANT:
    if (ptr === $sat(G.mons, PM_MINOTAUR)) {
      if (!rn2(3) || G.in_mklev && ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level))) {
        await mongets(mtmp, WAN_DIGGING);
      }
    } else if ((ptr.mflags2 & 8192) >>> 0 !== 0) {
      for (cnt = rn2(mtmp.m_lev / 2 | 0); cnt; --cnt) {
        otmp = await mksobj(rnd_class(DILITHIUM_CRYSTAL, LUCKSTONE - 1), FALSE, FALSE);
        otmp.quan = rn2(2) + 3;
        otmp.owt = await weight(otmp) >>> 0;
        await mpickobj(mtmp, otmp);
      }
    }
    break;
  case S_WRAITH:
    if (ptr === $sat(G.mons, PM_NAZGUL)) {
      otmp = await mksobj(RIN_INVISIBILITY, FALSE, FALSE);
      await curse(otmp);
      await mpickobj(mtmp, otmp);
    }
    break;
  case S_LICH:
    if (ptr === $sat(G.mons, PM_MASTER_LICH) && !rn2(13)) {
      await mongets(mtmp, rn2(7) ? ATHAME : WAN_NOTHING);
    } else if (ptr === $sat(G.mons, PM_ARCH_LICH) && !rn2(3)) {
      otmp = await mksobj(rn2(3) ? ATHAME : QUARTERSTAFF, TRUE, rn2(13) ? FALSE : TRUE);
      if (otmp.spe < 2) {
        otmp.spe = rnd(3) << 24 >> 24;
      }
      if (!rn2(4)) {
        otmp.oerodeproof = 1;
      }
      await mpickobj(mtmp, otmp);
    }
    break;
  case S_MUMMY:
    if (rn2(7)) {
      await mongets(mtmp, MUMMY_WRAPPING);
    }
    break;
  case S_QUANTMECH:
    if (!rn2(20)) {
      let catcorpse = null;
      otmp = await mksobj(LARGE_BOX, FALSE, FALSE);
      if (!!(catcorpse = await mksobj(CORPSE, TRUE, FALSE))) {
        otmp.spe = 1;
        await set_corpsenm(catcorpse, PM_HOUSECAT);
        await stop_timer(ROT_CORPSE, obj_to_any(catcorpse));
        await add_to_container(otmp, catcorpse);
        otmp.owt = await weight(otmp) >>> 0;
      }
      await mpickobj(mtmp, otmp);
    }
    break;
  case S_LEPRECHAUN:
    await mkmonmoney(mtmp, d(level_difficulty(), 30));
    break;
  case S_DEMON:
    if (ptr === $sat(G.mons, PM_ICE_DEVIL) && !rn2(4)) {
      await mongets(mtmp, SPEAR);
    } else if (ptr === $sat(G.mons, PM_ASMODEUS)) {
      await mongets(mtmp, WAN_COLD);
      await mongets(mtmp, WAN_FIRE);
    }
    break;
  case S_GNOME:
    if (!rn2(In_mines(G.u.uz) && G.in_mklev ? 20 : 60)) {
      otmp = await mksobj(rn2(4) ? TALLOW_CANDLE : WAX_CANDLE, TRUE, FALSE);
      otmp.quan = 1;
      otmp.owt = await weight(otmp) >>> 0;
      if (!await mpickobj(mtmp, otmp) && !$at2(G.level.locations, mtmp.mx, mtmp.my).lit) {
        await begin_burn(otmp, FALSE);
      }
    }
    break;
  default:
    break;
  }
  if (ptr === $sat(G.mons, PM_SOLDIER) && rn2(13)) {
    return;
  }
  if (mtmp.m_lev > rn2(50)) {
    await mongets(mtmp, await rnd_defensive_item(mtmp));
  }
  if (mtmp.m_lev > rn2(100)) {
    await mongets(mtmp, await rnd_misc_item(mtmp));
  }
  if ((ptr.mflags2 & 268435456) >>> 0 !== 0 && !findgold(mtmp.minvent) && !rn2(5)) {
    await mkmonmoney(mtmp, d(level_difficulty(), mtmp.minvent ? 5 : 10));
  }
}

export async function clone_mon(mon: struct_monst | null, x: number, y: number): Promise<struct_monst | null> {
  let $t1: any, $t2: any;
  let mm = new struct_nhcoord();
  let m2 = null;
  if (mon.mhp <= 1 || G.mvitals[await monsndx(mon.data)].mvflags & G_EXTINCT) {
    return null;
  }
  if (x === 0) {
    mm.x = mon.mx;
    mm.y = mon.my;
  } else {
    mm.x = x;
    mm.y = y;
  }
  if (!isok(mm.x, mm.y)) {
    await impossible(S("clone_mon trying to create a monster at <%d,%d>?"), mm.x, mm.y);
    return null;
  }
  if (!!G.level.monsters[mm.x][mm.y]) {
    if (!await enexto(mm, mm.x, mm.y, mon.data) || !!G.level.monsters[mm.x][mm.y]) {
      return null;
    }
  }
  m2 = new struct_monst();
  m2.$cp(mon);
  m2.mextra = null;
  m2.nmon = G.level.monlist;
  G.level.monlist = m2;
  m2.m_id = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
  if (!m2.m_id) {
    m2.m_id = ($t2 = G.context.ident, G.context.ident = $t2 + 1 >>> 0, $t2);
  }
  m2.mx = mm.x;
  m2.my = mm.y;
  m2.mundetected = 0;
  m2.mtrapped = 0;
  m2.mcloned = 1;
  m2.minvent = null;
  m2.mleashed = 0;
  m2.mhpmax = mon.mhpmax;
  m2.mhp = mon.mhp / 2 | 0;
  mon.mhp -= m2.mhp;
  m2.isshk = 0;
  m2.isgd = 0;
  m2.ispriest = 0;
  memset(m2.mtrack[0], 0, 8);
  await place_monster(m2, m2.mx, m2.my);
  if (m2.data.mlet === S_LIGHT || m2.data === $sat(G.mons, 30) || m2.data === $sat(G.mons, 31) || m2.data === $sat(G.mons, 110) ? 1 : m2.data === $sat(G.mons, 152) ? 1 : 0) {
    await new_light_source(m2.mx, m2.my, m2.data.mlet === S_LIGHT || m2.data === $sat(G.mons, 30) || m2.data === $sat(G.mons, 31) || m2.data === $sat(G.mons, 110) ? 1 : m2.data === $sat(G.mons, 152) ? 1 : 0, LS_MONSTER, monst_to_any(m2));
  }
  if (mon.mextra && mon.mextra.mname) {
    m2 = await christen_monst(m2, mon.mextra.mname);
  } else if (mon.isshk) {
    m2 = await christen_monst(m2, await shkname(mon));
  }
  if (!G.context.mon_moving && mon.mpeaceful | 0) {
    if (mon.mtame) {
      m2.mtame = (rn2(2 + G.u.uluck > 2 ? 2 + G.u.uluck : 2) ? mon.mtame : 0) << 24 >> 24;
    } else if (mon.mpeaceful) {
      m2.mpeaceful = ((rn2(2 + G.u.uluck > 2 ? 2 + G.u.uluck : 2) ? 1 : 0) >>> 0) & 1;
    }
  }
  if (m2.isminion) {
    let atyp = 0;
    await newemin(m2);
    m2.mextra.emin.$cp(mon.mextra.emin);
    atyp = m2.mextra.emin.min_align;
    m2.mextra.emin.renegade = ((atyp !== G.u.ualign.type ? 1 : 0) ^ (!m2.mpeaceful ? 1 : 0)) << 24 >> 24;
  } else if (m2.mtame) {
    m2.mtame = 0;
    if (await tamedog(m2, null)) {
      m2.mextra.edog.$cp(mon.mextra.edog);
    }
  }
  set_malign(m2);
  await newsym(m2.mx, m2.my);
  return m2;
}

export async function propagate(mndx: number, tally: number, ghostly: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let result = 0;
  let lim = mbirth_limit(mndx) & 0xff;
  let gone = ((G.mvitals[mndx].mvflags & G_GONE) !== 0 ? 1 : 0) << 24 >> 24;
  result = (G.mvitals[mndx].born < lim && !gone ? TRUE : FALSE) << 24 >> 24;
  if (G.mons[mndx].geno & G_UNIQ && mndx !== PM_HIGH_PRIEST) {
    ($t1 = G.mvitals[mndx], $t1.mvflags = ($t1.mvflags | G_EXTINCT) & 0xff);
  }
  if (G.mvitals[mndx].born < 255 && tally && (!ghostly || ghostly && result)) {
    ($t2 = G.mvitals[mndx], $t2.born = $t2.born + 1 & 0xff);
  }
  if (G.mvitals[mndx].born >= lim && !(G.mons[mndx].geno & G_NOGEN) && !(G.mvitals[mndx].mvflags & G_EXTINCT)) {
    if (G.flags.debug) {
      do {
        if (await debugcore(S("makemon.c"), 1)) {
          await pline(S("Automatically extinguished %s."), await makeplural(G.mons[mndx].mname));
        }
      } while (0);
    }
    ($t3 = G.mvitals[mndx], $t3.mvflags = ($t3.mvflags | G_EXTINCT) & 0xff);
    reset_rndmonst(mndx);
  }
  return result;
}

export async function monhp_per_lvl(mon: struct_monst | null): Promise<number> {
  let ptr = mon.data;
  let hp = rnd(8);
  if (ptr.mlet === S_GOLEM) {
    hp = golemhp(await monsndx(ptr)) / ptr.mlevel | 0;
  } else if (ptr.mlevel > 49) {
    hp = 4 + rnd(4);
  } else if (ptr.mlet === S_DRAGON && await monsndx(ptr) >= PM_GRAY_DRAGON) {
    hp = 4 + rn2(5);
  } else if (!mon.m_lev) {
    hp = rnd(4);
  }
  return hp;
}

export async function newmonhp(mon: struct_monst | null, mndx: number): Promise<void> {
  let ptr = $sat(G.mons, mndx);
  mon.m_lev = adj_lev(ptr) & 0xff;
  if (ptr.mlet === S_GOLEM) {
    mon.mhpmax = mon.mhp = golemhp(mndx);
  } else if (ptr === $sat(G.mons, 308) || ptr === $sat(G.mons, 310) || ptr === $sat(G.mons, 309)) {
    mon.mhpmax = mon.mhp = d(10, 8);
  } else if (ptr.mlevel > 49) {
    mon.mhpmax = mon.mhp = 2 * (ptr.mlevel - 6);
    mon.m_lev = (mon.mhp / 4 | 0) & 0xff;
  } else if (ptr.mlet === S_DRAGON && mndx >= PM_GRAY_DRAGON) {
    mon.mhpmax = mon.mhp = G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum ? 8 * mon.m_lev : 4 * mon.m_lev + d(mon.m_lev, 4);
  } else if (!mon.m_lev) {
    mon.mhpmax = mon.mhp = rnd(4);
  } else {
    mon.mhpmax = mon.mhp = d(mon.m_lev, 8);
    if (await is_home_elemental(ptr)) {
      mon.mhpmax = mon.mhp = mon.mhp * 3;
    }
  }
}

export async function newmextra(): Promise<struct_mextra | null> {
  let mextra = null;
  mextra = new struct_mextra();
  mextra.mname = null;
  mextra.egd = null;
  mextra.epri = null;
  mextra.eshk = null;
  mextra.emin = null;
  mextra.edog = null;
  mextra.mcorpsenm = NON_PM;
  return mextra;
}

function makemon_rnd_goodpos(mon: struct_monst | null, gpflags: number, cc: struct_nhcoord | null): number {
  let $g = 0;
  let tryct = 0;
  let nx = 0;
  let ny = 0;
  let good = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      tryct = 0;
      do {
        nx = rn2(80 - 3) + 2;
        ny = rn2(ROWNO);
        good = (!G.in_mklev && $rd(G.viz_array.a[G.viz_array.o + ny], nx) & 2 ? FALSE : goodpos(nx, ny, mon, gpflags)) << 24 >> 24;
      } while (++tryct < 50 && !good);
      if (!!good) { $g = 3; continue $L; }
      {
        let xofs = nx;
        let yofs = ny;
        let dx = 0;
        let dy = 0;
        let bl = G.in_mklev || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? 1 : 0;
        for (; bl < 2; ++bl) {
          for (dx = 0; dx < COLNO; ++dx) {
            for (dy = 0; dy < ROWNO; ++dy) {
              nx = (dx + xofs) % (COLNO - 1) + 1;
              ny = (dy + yofs) % (ROWNO - 1) + 1;
              if (bl === 0 && $rd(G.viz_array.a[G.viz_array.o + ny], nx) & 2) {
                continue;
              }
              if (goodpos(nx, ny, mon, gpflags)) {
                { $g = 1; continue $L; }
              }
            }
          }
          if (bl === 0 && (!mon || mon.data.mmove)) {
            if (G.dnstair.sx && !rn2(2)) {
              nx = G.dnstair.sx;
              ny = G.dnstair.sy;
            } else if (G.upstair.sx && !rn2(2)) {
              nx = G.upstair.sx;
              ny = G.upstair.sy;
            } else if (G.dnladder.sx && !rn2(2)) {
              nx = G.dnladder.sx;
              ny = G.dnladder.sy;
            } else if (G.upladder.sx && !rn2(2)) {
              nx = G.upladder.sx;
              ny = G.upladder.sy;
            }
            if (goodpos(nx, ny, mon, gpflags)) {
              { $g = 1; continue $L; }
            }
          }
        }
      }
      { $g = 2; continue $L; }
    case 3:
    case 1: // gotgood
      cc.x = nx << 24 >> 24;
      cc.y = ny << 24 >> 24;
      return TRUE;
    case 2:
      return FALSE;
    }
    break;
  }
}

export async function makemon(ptr: struct_permonst | null, x: number, y: number, mmflags: number): Promise<struct_monst | null> {
  let $t1: any, $t2: any;
  let mtmp = null;
  let fakemon = new struct_monst();
  let cc = new struct_nhcoord();
  let mndx = 0;
  let mcham = 0;
  let ct = 0;
  let mitem = 0;
  let anymon = (!ptr ? 1 : 0) << 24 >> 24;
  let byyou = (x === G.u.ux && y === G.u.uy ? 1 : 0) << 24 >> 24;
  let allow_minvent = ((mmflags & NO_MINVENT) === 0 ? 1 : 0) << 24 >> 24;
  let countbirth = ((mmflags & MM_NOCOUNTBIRTH) === 0 ? 1 : 0) << 24 >> 24;
  let gpflags = (mmflags & MM_IGNOREWATER ? MM_IGNOREWATER : 0) >>> 0;
  fakemon.$cp(G.zeromonst);
  cc.x = cc.y = 0;
  if (x === 0 && y === 0) {
    fakemon.data = ptr;
    if (!makemon_rnd_goodpos(ptr ? fakemon : null, gpflags, cc)) {
      return null;
    }
    x = cc.x;
    y = cc.y;
  } else if (byyou && !G.in_mklev) {
    if (!await enexto_core(cc, G.u.ux, G.u.uy, ptr, gpflags)) {
      return null;
    }
    x = cc.x;
    y = cc.y;
  }
  if (!isok(x, y)) {
    await impossible(S("makemon trying to create a monster at <%d,%d>?"), x, y);
    return null;
  }
  if (!!G.level.monsters[x][y]) {
    if (!(mmflags & MM_ADJACENTOK) || !await enexto_core(cc, x, y, ptr, gpflags)) {
      return null;
    }
    x = cc.x;
    y = cc.y;
  }
  if (ptr) {
    mndx = await monsndx(ptr);
    if (G.mvitals[mndx].mvflags & G_GENOD) {
      return null;
    }
    if (G.flags.debug && G.mvitals[mndx].mvflags & G_EXTINCT) {
      do {
        if (await debugcore(S("makemon.c"), 1)) {
          await pline(S("Explicitly creating extinct monster %s."), G.mons[mndx].mname);
        }
      } while (0);
    }
  } else {
    let tryct = 0;
    do {
      if (!(ptr = await rndmonst())) {
        do {
          if (await debugcore(S("makemon.c"), 1)) {
            await pline(S("Warning: no monster."));
          }
        } while (0);
        return null;
      }
      fakemon.data = ptr;
    } while (++tryct <= 50 && (tryct === 1 && (ptr.mflags2 & 134217728) >>> 0 !== 0 && G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum || !goodpos(x, y, fakemon, gpflags)));
    mndx = await monsndx(ptr);
  }
  await propagate(mndx, countbirth, FALSE);
  mtmp = new struct_monst();
  mtmp.$cp(G.zeromonst);
  if (mmflags & MM_EGD) {
    await newegd(mtmp);
  }
  if (mmflags & MM_EPRI) {
    await newepri(mtmp);
  }
  if (mmflags & MM_ESHK) {
    await neweshk(mtmp);
  }
  if (mmflags & MM_EMIN) {
    await newemin(mtmp);
  }
  if (mmflags & MM_EDOG) {
    await newedog(mtmp);
  }
  if (mmflags & MM_ASLEEP) {
    mtmp.msleeping = 1;
  }
  mtmp.nmon = G.level.monlist;
  G.level.monlist = mtmp;
  mtmp.m_id = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
  if (!mtmp.m_id) {
    mtmp.m_id = ($t2 = G.context.ident, G.context.ident = $t2 + 1 >>> 0, $t2);
  }
  await set_mon_data(mtmp, ptr);
  if (ptr.msound === MS_LEADER && await quest_info(MS_LEADER) === mndx) {
    G.quest_status.leader_m_id = mtmp.m_id;
  }
  mtmp.mnum = mndx << 16 >> 16;
  await newmonhp(mtmp, mndx);
  if ((ptr.mflags2 & 131072) >>> 0 !== 0) {
    mtmp.female = (TRUE) & 1;
  } else if ((ptr.mflags2 & 65536) >>> 0 !== 0) {
    mtmp.female = (FALSE) & 1;
  } else if (ptr.msound === MS_LEADER && await quest_info(MS_LEADER) === mndx) {
    mtmp.female = (G.quest_status.ldrgend) & 1;
  } else if (ptr.msound === MS_NEMESIS && await quest_info(MS_NEMESIS) === mndx) {
    mtmp.female = (G.quest_status.nemgend) & 1;
  } else {
    mtmp.female = (rn2(2) >>> 0) & 1;
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum && !((ptr.mflags1 & 65536) >>> 0 !== 0)) {
    mtmp.mtrapseen = $shl64(1, PIT - 1) | $shl64(1, HOLE - 1);
  }
  if (ptr.msound === MS_LEADER || ptr.msound === MS_NEMESIS) {
    mtmp.mtrapseen = ~0;
  }
  await place_monster(mtmp, x, y);
  mtmp.mcansee = (mtmp.mcanmove = (TRUE) & 1) & 1;
  mtmp.mpeaceful = ((mmflags & MM_ANGRY ? FALSE : peace_minded(ptr)) >>> 0) & 1;
  switch (ptr.mlet) {
  case S_MIMIC:
    await set_mimic_sym(mtmp);
    break;
  case S_SPIDER:
  case S_SNAKE:
    if (G.in_mklev) {
      if (x && y) {
        await mkobj_at(0, x, y, TRUE);
      }
    }
    hideunder(mtmp);
    break;
  case S_LIGHT:
  case S_ELEMENTAL:
    if (mndx === PM_STALKER || mndx === PM_BLACK_LIGHT) {
      mtmp.perminvis = (TRUE) & 1;
      mtmp.minvis = (TRUE) & 1;
    }
    break;
  case S_EEL:
    hideunder(mtmp);
    break;
  case S_LEPRECHAUN:
    mtmp.msleeping = 1;
    break;
  case S_JABBERWOCK:
  case S_NYMPH:
    if (rn2(5) && !G.u.uhave.amulet) {
      mtmp.msleeping = 1;
    }
    break;
  case S_ORC:
    if (G.urace.malenum === 260) {
      mtmp.mpeaceful = (FALSE) & 1;
    }
    break;
  case S_UNICORN:
    if (ptr.mlet === S_UNICORN && (ptr.mflags2 & 536870912) >>> 0 !== 0 && sgn(G.u.ualign.type) === sgn(ptr.maligntyp)) {
      mtmp.mpeaceful = (TRUE) & 1;
    }
    break;
  case S_BAT:
    if (In_hell(G.u.uz) && (ptr === $sat(G.mons, 125) || ptr === $sat(G.mons, 126) || ptr === $sat(G.mons, 128))) {
      await mon_adjust_speed(mtmp, 2, null);
    }
    break;
  }
  if ((ct = mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0) > 0) {
    await new_light_source(mtmp.mx, mtmp.my, ct, LS_MONSTER, monst_to_any(mtmp));
  }
  mitem = 0;
  if (mndx === PM_VLAD_THE_IMPALER) {
    mitem = CANDELABRUM_OF_INVOCATION;
  }
  mtmp.cham = NON_PM;
  if (!(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) && (mcham = pm_to_cham(mndx)) !== NON_PM) {
    mtmp.cham = mcham << 16 >> 16;
    if (mndx !== PM_VLAD_THE_IMPALER && await newcham(mtmp, null, FALSE, FALSE)) {
      allow_minvent = FALSE;
    }
  } else if (mndx === PM_WIZARD_OF_YENDOR) {
    mtmp.iswiz = (TRUE) & 1;
    G.context.no_of_wizards = G.context.no_of_wizards + 1 >>> 0;
    if (G.context.no_of_wizards === 1 && ((G.dungeon_topology.d_earth_level.dlevel || G.dungeon_topology.d_earth_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_earth_level))) {
      mitem = SPE_DIG;
    }
  } else if (mndx === PM_GHOST && !(mmflags & MM_NONAME)) {
    mtmp = await christen_monst(mtmp, rndghostname());
  } else if (mndx === PM_CROESUS) {
    mitem = TWO_HANDED_SWORD;
  } else if (ptr.msound === MS_NEMESIS) {
    mitem = BELL_OF_OPENING;
  } else if (mndx === PM_PESTILENCE) {
    mitem = POT_SICKNESS;
  }
  if (mitem && allow_minvent) {
    await mongets(mtmp, mitem);
  }
  if (G.in_mklev) {
    if (((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & (1024 | 2048)) >>> 0 === 0 || mndx === PM_WUMPUS || mndx === PM_LONG_WORM || mndx === PM_GIANT_EEL) && !G.u.uhave.amulet && rn2(5)) {
      mtmp.msleeping = (TRUE) & 1;
    }
  } else {
    if (byyou) {
      await newsym(mtmp.mx, mtmp.my);
      set_apparxy(mtmp);
    }
  }
  if ((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & 2048) >>> 0 !== 0 && ptr.msound === MS_BRIBE) {
    mtmp.mpeaceful = (mtmp.minvis = (mtmp.perminvis = 1) & 1) & 1;
    mtmp.mavenge = 0;
    if (G.uwep && G.uwep.oartifact === ART_EXCALIBUR) {
      mtmp.mpeaceful = ((mtmp.mtame = FALSE) >>> 0) & 1;
    }
  }
  if (mndx === PM_LONG_WORM && ((mtmp.wormno = (get_wormno() >>> 0) & 31) | 0) !== 0) {
    await initworm(mtmp, rn2(5));
    if (count_wsegs(mtmp)) {
      await place_worm_tail_randomly(mtmp, x, y);
    }
  }
  if (mndx === PM_ALIGNED_PRIEST || mndx === PM_HIGH_PRIEST ? !(mmflags & (MM_EPRI | MM_EMIN)) ? 1 : 0 : mndx === PM_ANGEL && !(mmflags & MM_EMIN) && !rn2(3) ? 1 : 0) {
    let eminp = null;
    await newemin(mtmp);
    eminp = mtmp.mextra.emin;
    mtmp.isminion = 1;
    eminp.min_align = rn2(3) - 1 << 24 >> 24;
    eminp.renegade = (mmflags & MM_ANGRY ? 1 : !rn2(3) ? 1 : 0) << 24 >> 24;
    mtmp.mpeaceful = ((eminp.min_align === G.u.ualign.type ? !eminp.renegade ? 1 : 0 : eminp.renegade) >>> 0) & 1;
  }
  set_malign(mtmp);
  if (anymon && !(mmflags & MM_NOGRP)) {
    if (ptr.geno & G_SGROUP && rn2(2)) {
      await m_initgrp(mtmp, mtmp.mx, mtmp.my, 3, mmflags);
    } else if (ptr.geno & G_LGROUP) {
      if (rn2(3)) {
        await m_initgrp(mtmp, mtmp.mx, mtmp.my, 10, mmflags);
      } else {
        await m_initgrp(mtmp, mtmp.mx, mtmp.my, 3, mmflags);
      }
    }
  }
  if (allow_minvent) {
    if (attacktype(ptr, 254)) {
      await m_initweap(mtmp);
    }
    await m_initinv(mtmp);
    await m_dowear(mtmp, TRUE);
    if (!rn2(100) && (ptr.mflags2 & 4194304) >>> 0 !== 0 && can_saddle(mtmp) && !await which_armor(mtmp, W_SADDLE)) {
      let otmp = await mksobj(SADDLE, TRUE, FALSE);
      await put_saddle_on_mon(otmp, mtmp);
    }
  } else {
    if (mtmp.minvent) {
      await discard_minvent(mtmp);
    }
    mtmp.minvent = null;
  }
  if (ptr.mflags3 && !(mmflags & MM_NOWAIT)) {
    if (ptr.mflags3 & M3_WAITFORU) {
      mtmp.mstrategy = (mtmp.mstrategy | STRAT_WAITFORU) >>> 0;
    }
    if (ptr.mflags3 & M3_CLOSE) {
      mtmp.mstrategy = (mtmp.mstrategy | STRAT_CLOSE) >>> 0;
    }
    if (ptr.mflags3 & (M3_WAITMASK | M3_COVETOUS)) {
      mtmp.mstrategy = (mtmp.mstrategy | STRAT_APPEARMSG) >>> 0;
    }
  }
  if (allow_minvent && G.migrating_objs) {
    await deliver_obj_to_mon(mtmp, 1, DF_NONE);
  }
  if (!G.in_mklev) {
    await newsym(mtmp.mx, mtmp.my);
  }
  return mtmp;
}

export function mbirth_limit(mndx: number): number {
  return mndx === PM_NAZGUL ? 9 : mndx === PM_ERINYS ? 3 : MAXMONNO;
}

export async function create_critters(cnt: number, mptr: struct_permonst | null, neverask: number): Promise<number> {
  let c = new struct_nhcoord();
  let x = 0;
  let y = 0;
  let mon = null;
  let known = FALSE;
  let ask = (G.flags.debug && !neverask ? 1 : 0) << 24 >> 24;
  while (cnt--) {
    if (ask) {
      if (await create_particular()) {
        known = TRUE;
        continue;
      } else {
        ask = FALSE;
      }
    }
    x = G.u.ux, y = G.u.uy;
    if (!mptr && G.u.uinwater | 0 && await enexto(c, x, y, $sat(G.mons, PM_GIANT_EEL))) {
      x = c.x, y = c.y;
    }
    mon = await makemon(mptr, x, y, NO_MM_FLAGS);
    if (mon && ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
      known = TRUE;
    }
  }
  return known;
}

function uncommon(mndx: number): number {
  if (G.mons[mndx].geno & (G_NOGEN | G_UNIQ)) {
    return TRUE;
  }
  if (G.mvitals[mndx].mvflags & G_GONE) {
    return TRUE;
  }
  if (In_hell(G.u.uz)) {
    return (G.mons[mndx].maligntyp > A_NEUTRAL ? 1 : 0) << 24 >> 24;
  } else {
    return ((G.mons[mndx].geno & G_HELL) !== 0 ? 1 : 0) << 24 >> 24;
  }
}

function align_shift(ptr: struct_permonst | null): number {
  let alshift = 0;
  if (align_shift$oldmoves !== G.moves) {
    align_shift$lev = Is_special(G.u.uz);
    align_shift$oldmoves = G.moves;
  }
  switch (align_shift$lev ? align_shift$lev.flags.align | 0 : G.dungeons[G.u.uz.dnum].flags.align | 0) {
  default:
  case 0:
    alshift = 0;
    break;
  case 4:
    alshift = (ptr.maligntyp + 20) / (2 * ALIGNWEIGHT) | 0;
    break;
  case 2:
    alshift = (20 - Math.abs(ptr.maligntyp)) / ALIGNWEIGHT | 0;
    break;
  case 1:
    alshift = -(ptr.maligntyp - 20) / (2 * ALIGNWEIGHT) | 0;
    break;
  }
  return alshift;
}

export async function rndmonst(): Promise<struct_permonst | null> {
  let ptr = null;
  let mndx = 0;
  let ct = 0;
  if (G.u.uz.dnum === G.dungeon_topology.d_quest_dnum && rn2(7) && !!(ptr = await qt_montype())) {
    return ptr;
  }
  if (rndmonst_state.choice_count < 0) {
    let zlevel = 0;
    let minmlev = 0;
    let maxmlev = 0;
    let elemlevel = 0;
    let upper = 0;
    rndmonst_state.choice_count = 0;
    for (mndx = LOW_PM; mndx < SPECIAL_PM; ++mndx) {
      if (!uncommon(mndx)) {
        break;
      }
      rndmonst_state.mchoices[mndx] = 0;
    }
    if (mndx === SPECIAL_PM) {
      do {
        if (await debugcore(S("makemon.c"), 1)) {
          await pline(S("rndmonst: no common mons!"));
        }
      } while (0);
      return null;
    }
    zlevel = level_difficulty();
    minmlev = zlevel / 6 | 0;
    maxmlev = (zlevel + G.u.ulevel) / 2 | 0;
    upper = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? 1 : 0) << 24 >> 24;
    elemlevel = (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && !((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) ? 1 : 0) << 24 >> 24;
    for (; mndx < SPECIAL_PM; ++mndx) {
      ptr = $sat(G.mons, mndx);
      rndmonst_state.mchoices[mndx] = 0;
      if (G.mons[mndx].difficulty < minmlev || G.mons[mndx].difficulty > maxmlev) {
        continue;
      }
      if (upper && !isupper(G.def_monsyms[ptr.mlet].sym & 0xff)) {
        continue;
      }
      if (elemlevel && await wrong_elem_type(ptr)) {
        continue;
      }
      if (uncommon(mndx)) {
        continue;
      }
      if (In_hell(G.u.uz) && ptr.geno & G_NOHELL) {
        continue;
      }
      ct = (ptr.geno & G_FREQ) + align_shift(ptr);
      if (ct < 0 || ct > 127) {
        await panic(S("rndmonst: bad count [#%d: %d]"), mndx, ct);
      }
      rndmonst_state.choice_count += ct;
      rndmonst_state.mchoices[mndx] = ct << 24 >> 24;
    }
  }
  if (rndmonst_state.choice_count <= 0) {
    do {
      if (await debugcore(S("makemon.c"), 1)) {
        await pline(S("rndmonst: choice_count=%d"), rndmonst_state.choice_count);
      }
    } while (0);
    return null;
  }
  ct = rnd(rndmonst_state.choice_count);
  for (mndx = LOW_PM; mndx < SPECIAL_PM; ++mndx) {
    if ((ct -= rndmonst_state.mchoices[mndx]) <= 0) {
      break;
    }
  }
  if (mndx === SPECIAL_PM || uncommon(mndx)) {
    await impossible(S("rndmonst: bad `mndx' [#%d]"), mndx);
    return null;
  }
  return $sat(G.mons, mndx);
}

export function reset_rndmonst(mndx: number): void {
  if (mndx === NON_PM) {
    rndmonst_state.choice_count = -1;
  } else if (mndx < SPECIAL_PM) {
    rndmonst_state.choice_count -= rndmonst_state.mchoices[mndx];
    rndmonst_state.mchoices[mndx] = 0;
  }
}

function mk_gen_ok(mndx: number, mvflagsmask: number, genomask: number): number {
  let ptr = $sat(G.mons, mndx);
  if (G.mvitals[mndx].mvflags & mvflagsmask) {
    return FALSE;
  }
  if (ptr.geno & genomask) {
    return FALSE;
  }
  if (ptr === $sat(G.mons, 71) || ptr === $sat(G.mons, 166) || ptr === $sat(G.mons, 260) || ptr === $sat(G.mons, 256)) {
    return FALSE;
  }
  if (ptr === $sat(G.mons, PM_MAIL_DAEMON)) {
    return FALSE;
  }
  return TRUE;
}

export async function mkclass(class_: number, spc: number): Promise<struct_permonst | null> {
  return await mkclass_aligned(class_, spc, A_NONE);
}

export async function mkclass_aligned(class_: number, spc: number, atyp: number): Promise<struct_permonst | null> {
  let first = 0;
  let last = 0;
  let num = 0;
  let k = 0;
  let nums = new Int32Array(328);
  let maxmlev = 0;
  let mask = (G_NOGEN | G_UNIQ) & ~spc;
  memset(P(nums), 0, 1312);
  maxmlev = level_difficulty() >> 1;
  if (class_ < 1 || class_ >= MAXMCLASSES) {
    await impossible(S("mkclass called with bad class!"));
    return null;
  }
  for (first = LOW_PM; first < SPECIAL_PM; ++first) {
    if (G.mons[first].mlet === class_) {
      break;
    }
  }
  if (first === SPECIAL_PM) {
    await impossible(S("mkclass found no class %d monsters"), class_);
    return null;
  }
  for (last = first; last < SPECIAL_PM && G.mons[last].mlet === class_; ++last) {
    if (atyp !== A_NONE && sgn(G.mons[last].maligntyp) !== sgn(atyp)) {
      continue;
    }
    if (mk_gen_ok(last, G_GONE, mask)) {
      if (num && G.mons[last].difficulty > maxmlev && G.mons[last].difficulty > G.mons[last - 1].difficulty && rn2(2)) {
        break;
      }
      if ((k = G.mons[last].geno & G_FREQ) > 0) {
        nums[last] = k + 1 - (adj_lev($sat(G.mons, last)) > G.u.ulevel * 2 ? 1 : 0);
        num += nums[last];
      }
    }
  }
  if (!num) {
    return null;
  }
  for (num = rnd(num); first < last; ++first) {
    if ((num -= nums[first]) <= 0) {
      break;
    }
  }
  return nums[first] ? $sat(G.mons, first) : null;
}

export function mkclass_poly(class_: number): number {
  let first = 0;
  let last = 0;
  let num = 0;
  for (first = LOW_PM; first < SPECIAL_PM; ++first) {
    if (G.mons[first].mlet === class_) {
      break;
    }
  }
  if (first === SPECIAL_PM) {
    return NON_PM;
  }
  for (last = first; last < SPECIAL_PM && G.mons[last].mlet === class_; ++last) {
    if (mk_gen_ok(last, G_GENOD, G_NOGEN | G_UNIQ)) {
      num += G.mons[last].geno & G_FREQ;
    }
  }
  if (!num) {
    return NON_PM;
  }
  for (num = rnd(num); num > 0; ++first) {
    if (mk_gen_ok(first, G_GENOD, G_NOGEN | G_UNIQ)) {
      num -= G.mons[first].geno & G_FREQ;
    }
  }
  --first;
  return first;
}

export function adj_lev(ptr: struct_permonst | null): number {
  let tmp = 0;
  let tmp2 = 0;
  if (ptr === $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
    tmp = ptr.mlevel + G.mvitals[PM_WIZARD_OF_YENDOR].died;
    if (tmp > 49) {
      tmp = 49;
    }
    return tmp;
  }
  if ((tmp = ptr.mlevel) > 49) {
    return 50;
  }
  tmp2 = level_difficulty() - tmp;
  if (tmp2 < 0) {
    --tmp;
  } else {
    tmp += tmp2 / 5 | 0;
  }
  tmp2 = G.u.ulevel - ptr.mlevel;
  if (tmp2 > 0) {
    tmp += tmp2 / 4 | 0;
  }
  tmp2 = 3 * ptr.mlevel / 2 | 0;
  if (tmp2 > 49) {
    tmp2 = 49;
  }
  return tmp > tmp2 ? tmp2 : tmp > 0 ? tmp : 0;
}

export async function grow_up(mtmp: struct_monst | null, victim: struct_monst | null): Promise<struct_permonst | null> {
  let oldtype = 0;
  let newtype = 0;
  let max_increase = 0;
  let cur_increase = 0;
  let lev_limit = 0;
  let hp_threshold = 0;
  let fem = 0;
  let ptr = mtmp.data;
  if (mtmp.mhp < 1) {
    return null;
  }
  oldtype = await monsndx(ptr);
  newtype = little_to_big(oldtype);
  if (newtype === PM_PRIEST && mtmp.female | 0) {
    newtype = PM_PRIESTESS;
  }
  if (victim) {
    hp_threshold = mtmp.m_lev * 8;
    if (!mtmp.m_lev) {
      hp_threshold = 4;
    } else if (ptr.mlet === S_GOLEM) {
      hp_threshold = ((mtmp.mhpmax / 10 | 0) + 1) * 10 - 1;
    } else if (await is_home_elemental(ptr)) {
      hp_threshold = hp_threshold * 3;
    }
    lev_limit = 3 * ptr.mlevel / 2 | 0;
    if (oldtype !== newtype && G.mons[newtype].mlevel > lev_limit) {
      lev_limit = G.mons[newtype].mlevel;
    }
    max_increase = rnd(victim.m_lev + 1);
    if (mtmp.mhpmax + max_increase > hp_threshold + 1) {
      max_increase = hp_threshold + 1 - mtmp.mhpmax > 0 ? hp_threshold + 1 - mtmp.mhpmax : 0;
    }
    cur_increase = max_increase > 1 ? rn2(max_increase) : 0;
  } else {
    max_increase = cur_increase = rnd(8);
    hp_threshold = 0;
    lev_limit = 50;
  }
  mtmp.mhpmax += max_increase;
  mtmp.mhp += cur_increase;
  if (mtmp.mhpmax <= hp_threshold) {
    return ptr;
  }
  if ($sidx(ptr) >= $sidx($sat(G.mons, 328)) && $sidx(ptr) <= $sidx($sat(G.mons, 342))) {
    lev_limit = 30;
  } else if (lev_limit < 5) {
    lev_limit = 5;
  } else if (lev_limit > 49) {
    lev_limit = ptr.mlevel > 49 ? 50 : 49;
  }
  if ((mtmp.m_lev = mtmp.m_lev + 1 & 0xff) >= G.mons[newtype].mlevel && newtype !== oldtype) {
    ptr = $sat(G.mons, newtype);
    fem = ((ptr.mflags2 & 65536) >>> 0 !== 0 ? 0 : (ptr.mflags2 & 131072) >>> 0 !== 0 ? 1 : mtmp.female | 0) >>> 0;
    if (G.mvitals[newtype].mvflags & G_GENOD) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("As %s grows up into %s, %s %s!"), await mon_nam(mtmp), await an(ptr.mname), G.genders[pronoun_gender(mtmp, 0)].he, (ptr.mflags2 & 2) >>> 0 !== 0 || ptr === $sat(G.mons, 49) || (ptr.mlet === S_GOLEM || ptr.mlet === S_VORTEX) ? S("expires") : S("dies"));
      }
      await set_mon_data(mtmp, ptr);
      await mondied(mtmp);
      return null;
    } else if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      let buf = new Int8Array(256);
      sprintf(P(buf), S("%s%s"), mtmp.female | 0 && !fem ? S("male ") : fem && !mtmp.female ? S("female ") : S(""), ptr.mname);
      await pline(S("%s %s %s."), upstart(await y_monnam(mtmp)), fem !== mtmp.female ? S("changes into") : (ptr.mflags1 & 131072) >>> 0 !== 0 ? S("becomes") : S("grows up into"), await an(P(buf)));
    }
    await set_mon_data(mtmp, ptr);
    await newsym(mtmp.mx, mtmp.my);
    lev_limit = mtmp.m_lev;
    mtmp.female = (fem) & 1;
  }
  if (mtmp.m_lev > lev_limit) {
    mtmp.m_lev = mtmp.m_lev - 1 & 0xff;
    if (mtmp.mhpmax === hp_threshold + 1) {
      --mtmp.mhpmax;
    }
  }
  if (mtmp.mhpmax > 50 * 8) {
    mtmp.mhpmax = 50 * 8;
  }
  if (mtmp.mhp > mtmp.mhpmax) {
    mtmp.mhp = mtmp.mhpmax;
  }
  return ptr;
}

export async function mongets(mtmp: struct_monst | null, otyp: number): Promise<number> {
  let otmp = null;
  let spe = 0;
  if (!otyp) {
    return 0;
  }
  otmp = await mksobj(otyp, TRUE, FALSE);
  if (otmp) {
    if (mtmp.data.mlet === S_DEMON) {
      if (otmp.blessed) {
        await curse(otmp);
      }
    } else if ((mtmp.data.mflags2 & 4096) >>> 0 !== 0 && mon_aligntyp(mtmp) === 1) {
      otmp.cursed = (FALSE) & 1;
      if (otmp.spe < 0) {
        otmp.spe = 0;
      }
      otmp.oerodeproof = (TRUE) & 1;
    } else if ($sidx(mtmp.data) >= $sidx($sat(G.mons, 328)) && $sidx(mtmp.data) <= $sidx($sat(G.mons, 342)) && (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[otmp.otyp].oc_subtyp <= P_SABER)) {
      otmp.spe = 3 + rn2(4) << 24 >> 24;
    }
    if (otmp.otyp === CANDELABRUM_OF_INVOCATION) {
      otmp.spe = 0;
      otmp.age = 0;
      otmp.lamplit = (FALSE) & 1;
      otmp.blessed = (otmp.cursed = (FALSE) & 1) & 1;
    } else if (otmp.otyp === BELL_OF_OPENING) {
      otmp.blessed = (otmp.cursed = (FALSE) & 1) & 1;
    } else if (otmp.otyp === SPE_BOOK_OF_THE_DEAD) {
      otmp.blessed = (FALSE) & 1;
      otmp.cursed = (TRUE) & 1;
    }
    if ((mtmp.data.mflags2 & 2048) >>> 0 !== 0) {
      if (otmp.oclass === WEAPON_CLASS && otmp.spe < 1) {
        otmp.spe = 1;
      } else if (otmp.oclass === ARMOR_CLASS && otmp.spe < 0) {
        otmp.spe = 0;
      }
    }
    spe = otmp.spe;
    await mpickobj(mtmp, otmp);
    return spe;
  }
  return 0;
}

export function golemhp(type: number): number {
  switch (type) {
  case 245:
    return 20;
  case 246:
    return 20;
  case 247:
    return 30;
  case 249:
    return 40;
  case 248:
    return 40;
  case 250:
    return 50;
  case 251:
    return 40;
  case 252:
    return 50;
  case 253:
    return 60;
  case 254:
    return 60;
  case 255:
    return 80;
  default:
    return 0;
  }
}

export function peace_minded(ptr: struct_permonst | null): number {
  let mal = ptr.maligntyp;
  let ual = G.u.ualign.type;
  if ((ptr.mflags2 & 2097152) >>> 0 !== 0) {
    return TRUE;
  }
  if ((ptr.mflags2 & 1048576) >>> 0 !== 0) {
    return FALSE;
  }
  if (ptr.msound === MS_LEADER || ptr.msound === MS_GUARDIAN) {
    return TRUE;
  }
  if (ptr.msound === MS_NEMESIS) {
    return FALSE;
  }
  if ((ptr.mflags2 & $u64(G.urace.lovemask)) >>> 0 !== 0) {
    return TRUE;
  }
  if ((ptr.mflags2 & $u64(G.urace.hatemask)) >>> 0 !== 0) {
    return FALSE;
  }
  if (sgn(mal) !== sgn(ual)) {
    return FALSE;
  }
  if (mal < A_NEUTRAL && G.u.uhave.amulet | 0) {
    return FALSE;
  }
  if ((ptr.mflags2 & 4096) >>> 0 !== 0) {
    return (G.u.ualign.record >= 0 ? 1 : 0) << 24 >> 24;
  }
  return (!!rn2(16 + (G.u.ualign.record < -15 ? -15 : G.u.ualign.record)) && !!rn2(2 + Math.abs(mal)) ? 1 : 0) << 24 >> 24;
}

export function set_malign(mtmp: struct_monst | null): void {
  let mal = mtmp.data.maligntyp;
  let coaligned = 0;
  if (mtmp.ispriest | 0 || mtmp.isminion | 0) {
    if (mtmp.ispriest | 0 && mtmp.mextra.epri) {
      mal = mtmp.mextra.epri.shralign;
    } else if (mtmp.isminion | 0 && mtmp.mextra.emin) {
      mal = mtmp.mextra.emin.min_align;
    }
    if (mal !== A_NONE) {
      mal = mal * 5 << 24 >> 24;
    }
  }
  coaligned = (sgn(mal) === sgn(G.u.ualign.type) ? 1 : 0) << 24 >> 24;
  if (mtmp.data.msound === MS_LEADER) {
    mtmp.malign = -20;
  } else if (mal === A_NONE) {
    if (mtmp.mpeaceful) {
      mtmp.malign = 0;
    } else {
      mtmp.malign = 20;
    }
  } else if ((mtmp.data.mflags2 & 2097152) >>> 0 !== 0) {
    let absmal = Math.abs(mal);
    if (mtmp.mpeaceful) {
      mtmp.malign = -3 * (5 > absmal ? 5 : absmal) << 24 >> 24;
    } else {
      mtmp.malign = 3 * (5 > absmal ? 5 : absmal) << 24 >> 24;
    }
  } else if ((mtmp.data.mflags2 & 1048576) >>> 0 !== 0) {
    let absmal = Math.abs(mal);
    if (coaligned) {
      mtmp.malign = 0;
    } else {
      mtmp.malign = (5 > absmal ? 5 : absmal) << 24 >> 24;
    }
  } else if (coaligned) {
    let absmal = Math.abs(mal);
    if (mtmp.mpeaceful) {
      mtmp.malign = -3 * (3 > absmal ? 3 : absmal) << 24 >> 24;
    } else {
      mtmp.malign = (3 > absmal ? 3 : absmal) << 24 >> 24;
    }
  } else {
    mtmp.malign = Math.abs(mal) << 24 >> 24;
  }
}

export async function newmcorpsenm(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  mtmp.mextra.mcorpsenm = NON_PM;
}

export function freemcorpsenm(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1) {
    mtmp.mextra.mcorpsenm = NON_PM;
  }
}

export async function set_mimic_sym(mtmp: struct_monst | null): Promise<void> {
  let $g = 0;
  let typ = 0;
  let roomno = 0;
  let rt = 0;
  let appear = 0;
  let ap_type = 0;
  let s_sym = 0;
  let otmp = null;
  let mx = 0;
  let my = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!mtmp || (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
        return;
      }
      mx = mtmp.mx;
      my = mtmp.my;
      typ = $at2(G.level.locations, mx, my).typ;
      roomno = ($at2(G.level.locations, mx, my).roomno | 0) - ROOMOFFSET;
      if (roomno >= 0) {
        rt = G.rooms[roomno].rtype;
      } else {
        rt = 0;
      }
      if (!!!G.level.objects[mx][my]) { $g = 3; continue $L; }
      {
        ap_type = M_AP_OBJECT;
        appear = G.level.objects[mx][my].otyp >>> 0;
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(typ === DOOR || typ && typ <= DBWALL || typ === SDOOR || typ === SCORR)) { $g = 5; continue $L; }
      {
        ap_type = M_AP_FURNITURE;
        if (mx !== 0 && ($at2(G.level.locations, mx - 1, my).typ === HWALL || $at2(G.level.locations, mx - 1, my).typ === TLCORNER || $at2(G.level.locations, mx - 1, my).typ === TRWALL || $at2(G.level.locations, mx - 1, my).typ === BLCORNER || $at2(G.level.locations, mx - 1, my).typ === TDWALL || $at2(G.level.locations, mx - 1, my).typ === CROSSWALL || $at2(G.level.locations, mx - 1, my).typ === TUWALL)) {
          appear = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? S_hwall : S_hcdoor) >>> 0;
        } else {
          appear = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? S_vwall : S_vcdoor) >>> 0;
        }
      }
      { $g = 4; continue $L; }
    case 5:
      if (!(G.level.flags.is_maze_lev | 0 && !(G.u.uz.dnum === G.dungeon_topology.d_sokoban_dnum) && rn2(2))) { $g = 7; continue $L; }
      {
        ap_type = M_AP_OBJECT;
        appear = STATUE;
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(roomno < 0 && !t_at(mx, my))) { $g = 9; continue $L; }
      {
        ap_type = M_AP_OBJECT;
        appear = BOULDER;
      }
      { $g = 8; continue $L; }
    case 9:
      if (!(rt === ZOO || rt === VAULT)) { $g = 11; continue $L; }
      {
        ap_type = M_AP_OBJECT;
        appear = GOLD_PIECE;
      }
      { $g = 10; continue $L; }
    case 11:
      if (!(rt === DELPHI)) { $g = 13; continue $L; }
      {
        if (rn2(2)) {
          ap_type = M_AP_OBJECT;
          appear = STATUE;
        } else {
          ap_type = M_AP_FURNITURE;
          appear = S_fountain;
        }
      }
      { $g = 12; continue $L; }
    case 13:
      if (!(rt === TEMPLE)) { $g = 15; continue $L; }
      {
        ap_type = M_AP_FURNITURE;
        appear = S_altar;
      }
      { $g = 14; continue $L; }
    case 15:
      if (!(rt >= SHOPBASE)) { $g = 17; continue $L; }
      {
        s_sym = get_shop_item(rt - SHOPBASE);
        if (s_sym < 0) {
          ap_type = M_AP_OBJECT;
          appear = -s_sym >>> 0;
        } else {
          if (s_sym === RANDOM_CLASS) {
            s_sym = syms[rn2(17 - 2) + 2];
          }
          { $g = 1; continue $L; }
        }
      }
      { $g = 16; continue $L; }
    case 17:
      s_sym = syms[rn2(17)];
    case 1: // assign_sym
      if (s_sym === MAXOCLASSES || s_sym === MAXOCLASSES + 1) {
        ap_type = M_AP_FURNITURE;
        appear = (s_sym === MAXOCLASSES ? S_upstair : S_dnstair) >>> 0;
      } else {
        ap_type = M_AP_OBJECT;
        if (s_sym === S_MIMIC_DEF) {
          appear = STRANGE_OBJECT;
        } else if (s_sym === COIN_CLASS) {
          appear = GOLD_PIECE;
        } else {
          otmp = await mkobj(s_sym << 24 >> 24, FALSE);
          appear = otmp.otyp >>> 0;
          await obfree(otmp, null);
        }
      }
    case 16:
    case 14:
    case 12:
    case 10:
    case 8:
    case 6:
    case 4:
    case 2:
      mtmp.m_ap_type = ap_type & 0xff;
      mtmp.mappearance = appear;
      if (ap_type === M_AP_OBJECT && (appear === STATUE || appear === FIGURINE || appear === CORPSE || appear === EGG || appear === TIN)) {
        let mndx = await rndmonnum();
        let nocorpse_ndx = (G.mvitals[mndx].mvflags & G_NOCORPSE) !== 0 ? 1 : 0;
        if (appear === CORPSE && nocorpse_ndx) {
          mndx = rn2(342 - 328 + 1) + 328;
        } else if (appear === EGG && !can_be_hatched(mndx) || appear === TIN && nocorpse_ndx) {
          mndx = NON_PM;
        }
        await newmcorpsenm(mtmp);
        mtmp.mextra.mcorpsenm = mndx;
      } else if (ap_type === M_AP_OBJECT && appear === SLIME_MOLD) {
        await newmcorpsenm(mtmp);
        mtmp.mextra.mcorpsenm = G.context.current_fruit;
        G.flags.made_fruit = TRUE;
      } else if (ap_type === M_AP_FURNITURE && appear === S_altar) {
        let algn = rn2(3) - 1;
        await newmcorpsenm(mtmp);
        mtmp.mextra.mcorpsenm = In_hell(G.u.uz) && rn2(3) ? AM_NONE : algn === -128 ? 0 : algn === 1 ? 4 : algn + 2;
      } else if (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1) {
        mtmp.mextra.mcorpsenm = NON_PM;
      }
      if (does_block(mx, my, $sat(G.level.locations[mx], my))) {
        block_point(mx, my);
      }
    }
    break;
  }
}

export async function bagotricks(bag: struct_obj | null, tipping: number, seencount: Ptr | null): Promise<number> {
  let moncount = 0;
  if (!bag || bag.otyp !== BAG_OF_TRICKS) {
    await impossible(S("bad bag o' tricks"));
  } else if (bag.spe < 1) {
    await pline(S("%s"), tipping && bag.cknown | 0 ? S("It's empty.") : G.c_common_strings.c_nothing_happens);
    if (bag.dknown | 0 && G.objects[bag.otyp].oc_name_known | 0) {
      bag.cknown = 1;
    }
  } else {
    let mtmp = null;
    let creatcnt = 1;
    let seecount = 0;
    await consume_obj_charge(bag, !tipping ? 1 : 0);
    if (!rn2(23)) {
      creatcnt += rnd(7);
    }
    do {
      mtmp = await makemon(null, G.u.ux, G.u.uy, NO_MM_FLAGS);
      if (mtmp) {
        ++moncount;
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
          ++seecount;
        }
      }
    } while (--creatcnt > 0);
    if (seecount) {
      if (seencount) {
        seencount.a[seencount.o] += seecount;
      }
      if (bag.dknown) {
        await discover_object(195, 1, 1);
      }
    } else if (!tipping) {
      await pline(S("%s"), !moncount ? G.c_common_strings.c_nothing_happens : S("Nothing seems to happen."));
    }
  }
  return moncount;
}

export function $init(): void {
  rndmonst_state = anon_makemon_c_1514.$of(-1, new Int8Array(327));
  syms = $ta(Int8Array, 17, [MAXOCLASSES, MAXOCLASSES + 1, RING_CLASS, WAND_CLASS, WEAPON_CLASS, FOOD_CLASS, COIN_CLASS, SCROLL_CLASS, POTION_CLASS, ARMOR_CLASS, AMULET_CLASS, TOOL_CLASS, ROCK_CLASS, GEM_CLASS, SPBOOK_CLASS, S_MIMIC_DEF, S_MIMIC_DEF]);
  align_shift$oldmoves = 0;
  align_shift$lev = null;
}
