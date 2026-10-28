// @ts-nocheck
// NetHack 3.6.7 mon.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { fmt_ptr } from './alloc.ts';
import { leashable, m_unleash } from './apply.ts';
import { touch_artifact } from './artifact.ts';
import { adjalign, change_luck } from './attrib.ts';
import { placebc } from './ball.ts';
import { describe_level } from './botl.ts';
import { isok } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { bury_an_obj } from './dig.ts';
import { docrt, newsym, see_monsters, swallowed, unmap_object } from './display.ts';
import { deferred_goto, flooreffects, obj_no_longer_held, revive_corpse } from './do.ts';
import { Amonnam, Monnam, a_monnam, coord_desc, free_mname, hliquid, m_monnam, mon_nam, new_mname, noit_mon_nam, noname_monnam, oname, x_monnam } from './do_name.ts';
import { migrate_to_level, newedog, wary_dog } from './dog.ts';
import { finish_meating } from './dogmove.ts';
import { ledger_no, on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { del_engr_at, sengr_at, surface } from './engrave.ts';
import { experience, more_experienced, newexplevel } from './exper.ts';
import { explode } from './explode.ts';
import { debugcore } from './files.ts';
import { dryup } from './fountain.ts';
import { bad_rock, cant_squeeze_thru, in_rooms, losehp, may_dig, may_passwall, monst_to_any, spoteffects } from './hack.ts';
import { dist2, eos, highc, mungspaces, online2, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { delobj, g_at, sobj_at, stackobj } from './invent.ts';
import { any_light_source, del_light_source, new_light_source } from './light.ts';
import { freemcorpsenm, grow_up, is_home_elemental, makemon, mbirth_limit, mkclass_poly, newmextra, newmonhp, set_mimic_sym } from './makemon.ts';
import { fightm } from './mhitm.ts';
import { expels, gazemu } from './mhitu.ts';
import { newemin } from './minion.ts';
import { add_to_container, add_to_minv, clear_splitobjs, discard_minvent, mkcorpstat, mkgold, mkobj, mksobj_at, obj_extract_self, obj_meld, obj_nexto, place_object, pudding_merge_message, splitobj, start_corpse_timeout, weight } from './mkobj.ts';
import { attacktype, big_little_match, big_to_little, dmgtype, little_to_big, locomotion, mon_hates_silver, monsndx, name_to_mon, name_to_monclass, olfaction, on_fire, poly_when_stoned, resists_magm, set_mon_data, sticks } from './mondata.ts';
import { accessible, can_fog, closed_door, dochugw, mon_regen, monflee, onscary } from './monmove.ts';
import { m_carrying, m_useup } from './mthrowu.ts';
import { mcureblindness, searches_for_item } from './muse.ts';
import { discover_object } from './o_init.ts';
import { The, an, distant_name, doname, makeplural, simple_typename, vtense, xname } from './objnam.ts';
import { There, You, You_feel, You_hear, You_see, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, uunstick } from './polyself.ts';
import { split_mon } from './potion.ts';
import { in_your_sanctuary, newepri, p_coaligned } from './priest.ts';
import { nemdead } from './quest.ts';
import { quest_info } from './questpgr.ts';
import { unpunish } from './read.ts';
import { visible_region_at } from './region.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { inhishop, replshk, shkgone } from './shk.ts';
import { neweshk } from './shknam.ts';
import { growl } from './sounds.ts';
import { mdrop_special_objs, mpickobj, relobj } from './steal.ts';
import { dismount_steed, place_monster } from './steed.ts';
import { enexto, goodpos, rloc, rloc_to, tele_restrict } from './teleport.ts';
import { end_burn, kill_egg } from './timeout.ts';
import { fill_pit, fire_damage_chain, mselftouch, t_at, water_damage_chain } from './trap.ts';
import { gd_move, grddead, newegd } from './vault.ts';
import { does_block, unblock_point, vision_recalc } from './vision.ts';
import { possibly_unwield, setmnotwielded } from './weapon.ts';
import { new_were, were_change } from './were.ts';
import { aggravate, mon_has_amulet, mon_has_special, pick_nasty, wizdead } from './wizard.ts';
import { count_wsegs, get_wormno, initworm, place_worm_tail_randomly, place_wsegs, remove_worm, sanity_check_worm, worm_cross, worm_known, wormgone } from './worm.ts';
import { bypass_obj, clear_bypasses, m_dowear, mon_adjust_speed, mon_break_armor, update_mon_intrinsics, which_armor } from './worn.ts';
import { obj_resists } from './zap.ts';
import { struct_d_level, struct_monst, struct_nhcoord, struct_obj, struct_permonst } from './structs.ts';
import { $at2, $rd, $sadd, $sat, $sdiff, $shl64, $sidx, $u64, $wr, G, P, S, free, isupper, memcpy, memset, sprintf, strcat, strchr, strcmp, strcpy, strlen, strstr } from './rt/index.ts';
import { AD_COLD, AD_CORR, AD_DGST, AD_ELEC, AD_FIRE, AD_RBRE, AD_RUST, ALLOW_ALL, ALLOW_BARS, ALLOW_DIG, ALLOW_M, ALLOW_MDISP, ALLOW_ROCK, ALLOW_SANCT, ALLOW_SSM, ALLOW_TM, ALLOW_TRAPS, ALLOW_U, ALLOW_WALL, AMULET_OF_LIFE_SAVING, AMULET_OF_STRANGULATION, ANTI_MAGIC, ARTICLE_A, ARTICLE_NONE, ARTICLE_THE, AT_BOOM, AT_ENGL, AT_EXPL, AT_GAZE, AXE, A_CHAOTIC, A_NONE, BATTLE_AXE, BEAR_TRAP, BELL_OF_OPENING, BLINDED, BOLT_LIM, BOULDER, BUSTDOOR, CARROT, CLOVE_OF_GARLIC, COIN_CLASS, COLNO, CONFLICT, CORPSE, CORPSTAT_BURIED, CORPSTAT_INIT, CORPSTAT_NONE, COULD_SEE, DEAF, DETECT_MONSTERS, DISMOUNT_GENERIC, DISPLACED, DOOR, DWARVISH_MATTOCK, D_BROKEN, D_CLOSED, D_LOCKED, EGG, EXPL_NOXIOUS, FALSE, FIGURINE, FIRE_TRAP, FLYING, FOUNTAIN, GEM_CLASS, GLOB_OF_BLACK_PUDDING, GOLD, GPCOORDS_MAP, GPCOORDS_NONE, GRAY_DRAGON_SCALES, G_FREQ, G_GENOD, G_NOCORPSE, G_UNIQ, HALF_PHDAM, HALLUC, HALLUC_RES, HOLE, ICE_BOX, INFRAVISION, INTRINSIC, INVIS, IN_SIGHT, IRON, IRONBARS, IRON_CHAIN, I_SPECIAL, KILLED_BY_AN, LARGEST_INT, LAST_GEM, LEATHER_ARMOR, LEVITATION, LOW_PM, LS_MONSTER, M1_NOHANDS, M3_DISPLACES, MAXMONNO, MAX_CARR_CAP, MFAST, MIGR_APPROX_XY, MIGR_RANDOM, MITHRIL, MON_DETACH, MON_ENDGAME_FREE, MON_ENDGAME_MIGR, MON_EXPLODE, MON_LIMBO, MON_MIGRATING, MON_OBLITERATE, MON_OFFMAP, MR_STONE, MSLOW, MS_GUARDIAN, MS_LEADER, MS_NEMESIS, MS_SHRIEK, MZ_HUMAN, MZ_SMALL, MZ_TINY, M_AP_FURNITURE, M_AP_MONSTER, M_AP_NOTHING, M_AP_OBJECT, NATTK, NOGARLIC, NON_PM, NORMAL_SPEED, NOTONL, NO_MM_FLAGS, NO_WEAPON_WANTED, NUMMONS, OBJ_BURIED, OBJ_FLOOR, OBJ_MINVENT, OPENDOOR, PICK_AXE, PIT, PM_ARCHEOLOGIST, PM_BARBARIAN, PM_BLACK_PUDDING, PM_CAVEMAN, PM_DWARF, PM_ELF, PM_ETTIN, PM_FLESH_GOLEM, PM_FLOATING_EYE, PM_FOG_CLOUD, PM_GARGOYLE, PM_GIANT, PM_GNOME, PM_GRAY_DRAGON, PM_GREEN_SLIME, PM_GREMLIN, PM_HEALER, PM_HUMAN, PM_HUMAN_WEREJACKAL, PM_HUMAN_WERERAT, PM_HUMAN_WEREWOLF, PM_IRON_GOLEM, PM_KILLER_BEE, PM_KNIGHT, PM_KOBOLD, PM_LIZARD, PM_LONG_WORM, PM_MAIL_DAEMON, PM_MEDUSA, PM_MONK, PM_ORC, PM_PONY, PM_PRIEST, PM_PURPLE_WORM, PM_QUEEN_BEE, PM_RANGER, PM_ROGUE, PM_RUST_MONSTER, PM_SAMURAI, PM_SCORPION, PM_SCORPIUS, PM_SHRIEKER, PM_STONE_GOLEM, PM_TOURIST, PM_VALKYRIE, PM_VAMPIRE, PM_VAMPIRE_BAT, PM_VLAD_THE_IMPALER, PM_WEREJACKAL, PM_WERERAT, PM_WEREWOLF, PM_WINGED_GARGOYLE, PM_WIZARD, PM_WIZARD_OF_YENDOR, PM_WOLF, PM_YELLOW_LIGHT, POOL, PROT_FROM_SHAPE_CHANGERS, P_AXE, P_PICK_AXE, QBUFSZ, QUARTERSTAFF, RANDOM_CLASS, RIN_SLOW_DIGESTION, ROCK, ROCK_CLASS, ROOM, ROWNO, RUST_TRAP, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_MAIL, SCR_SCARE_MONSTER, SEE_INVIS, SHIFT_MSG, SHIFT_SEENMSG, SILVER, SLP_GAS_TRAP, SPECIAL_PM, SPE_EXTRA_HEALING, SPE_HEALING, SPIKED_PIT, SQKY_BOARD, STATUE, STATUE_TRAP, STOMACH, STONE, STONE_RES, STRAT_APPEARMSG, STRAT_WAITMASK, SUPPRESS_HALLUCINATION, SUPPRESS_INVISIBLE, SUPPRESS_IT, SUPPRESS_NAME, SUPPRESS_SADDLE, S_BAT, S_DOG, S_DRAGON, S_EEL, S_ELEMENTAL, S_EYE, S_FUNGUS, S_GHOST, S_GOLEM, S_HUMAN, S_KOP, S_LICH, S_LIGHT, S_MIMIC, S_NYMPH, S_ORC, S_TROLL, S_UNICORN, S_VAMPIRE, S_VORTEX, S_ZOMBIE, S_hcdoor, S_ndoor, S_poisoncloud, S_tree, S_vcdoor, TELEPAT, TEMPLE, TOOL_CLASS, TRAPDOOR, TRAPNUM, TREE, TRUE, TRYLIMIT, TT_PIT, UNICORN_HORN, UNLOCKDOOR, VIBRATING_SQUARE, WARN_OF_MON, WEAPON_CLASS, WEB, WOOD, WORM_TOOTH, WT_HUMAN, W_AMUL, W_ARM, W_ARMG, W_ARMS, W_NONDIGGABLE, W_WEP, XKILL_GIVEMSG, XKILL_NOCONDUCT, XKILL_NOCORPSE, XKILL_NOMSG } from './consts.ts';

let vamp_rise_msg: number;
let disintegested: number;
let animal_list: Ptr | null;
let animal_list_count: number;
let elemental_clog$msgmv: number;
let setmangry$Exclam: any;

async function sanity_check_single_mon(mtmp: struct_monst | null, chk_geno: number, msg: Ptr | null): Promise<void> {
  if ($sidx(mtmp.data) < $sidx($sat(G.mons, LOW_PM)) || $sidx(mtmp.data) >= $sidx($sat(G.mons, NUMMONS))) {
    await impossible(S("illegal mon data %s; mnum=%d (%s)"), fmt_ptr(mtmp.data), mtmp.mnum, msg);
  } else {
    let mndx = await monsndx(mtmp.data);
    if (mtmp.mnum !== mndx) {
      await impossible(S("monster mnum=%d, monsndx=%d (%s)"), mtmp.mnum, mndx, msg);
      mtmp.mnum = mndx << 16 >> 16;
    }
    if (mtmp.mhp < 1) {
      return;
    }
    if (chk_geno && (G.mvitals[mndx].mvflags & G_GENOD) !== 0) {
      await impossible(S("genocided %s in play (%s)"), G.mons[mndx].mname, msg);
    }
  }
  if (mtmp.isshk | 0 && !(mtmp.mextra && mtmp.mextra.eshk)) {
    await impossible(S("shk without eshk (%s)"), msg);
  }
  if (mtmp.ispriest | 0 && !(mtmp.mextra && mtmp.mextra.epri)) {
    await impossible(S("priest without epri (%s)"), msg);
  }
  if (mtmp.isgd | 0 && !(mtmp.mextra && mtmp.mextra.egd)) {
    await impossible(S("guard without egd (%s)"), msg);
  }
  if (mtmp.isminion | 0 && !(mtmp.mextra && mtmp.mextra.emin)) {
    await impossible(S("minion without emin (%s)"), msg);
  }
  if (mtmp.mtame && !(mtmp.mextra && mtmp.mextra.edog) && !mtmp.isminion) {
    await impossible(S("pet without edog (%s)"), msg);
  }
}

export async function mon_sanity_check(): Promise<void> {
  let x = 0;
  let y = 0;
  let mtmp = null;
  let m = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    await sanity_check_single_mon(mtmp, TRUE, S("fmon"));
    if (mtmp.mhp < 1 && !mtmp.isgd) {
      continue;
    }
    x = mtmp.mx, y = mtmp.my;
    if (!isok(x, y) && !(mtmp.isgd | 0 && x === 0 && y === 0)) {
      await impossible(S("mon (%s) claims to be at <%d,%d>?"), fmt_ptr(mtmp), x, y);
    } else if (mtmp === G.u.usteed) {
      if (x !== G.u.ux || y !== G.u.uy) {
        await impossible(S("steed (%s) claims to be at <%d,%d>?"), fmt_ptr(mtmp), x, y);
      }
    } else if (G.level.monsters[x][y] !== mtmp) {
      await impossible(S("mon (%s) at <%d,%d> is not there!"), fmt_ptr(mtmp), x, y);
    } else if (mtmp.wormno) {
      await sanity_check_worm(mtmp);
    }
  }
  for (x = 1; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      if (!!(mtmp = G.level.monsters[x][y])) {
        for (m = G.level.monlist; m; m = m.nmon) {
          if (m === mtmp) {
            break;
          }
        }
        if (!m) {
          await impossible(S("map mon (%s) at <%d,%d> not in fmon list!"), fmt_ptr(mtmp), x, y);
        } else if (mtmp === G.u.usteed) {
          await impossible(S("steed (%s) is on the map at <%d,%d>!"), fmt_ptr(mtmp), x, y);
        } else if ((mtmp.mx !== x || mtmp.my !== y) && mtmp.data !== $sat(G.mons, PM_LONG_WORM)) {
          await impossible(S("map mon (%s) at <%d,%d> is found at <%d,%d>?"), fmt_ptr(mtmp), mtmp.mx, mtmp.my, x, y);
        }
      }
    }
  }
  for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
    await sanity_check_single_mon(mtmp, FALSE, S("migr"));
  }
}

export function undead_to_corpse(mndx: number): number {
  switch (mndx) {
  case 235:
  case 184:
    mndx = PM_KOBOLD;
    break;
  case 238:
  case 187:
    mndx = PM_DWARF;
    break;
  case 236:
  case 185:
    mndx = PM_GNOME;
    break;
  case 237:
  case 186:
    mndx = PM_ORC;
    break;
  case 239:
  case 188:
    mndx = PM_ELF;
    break;
  case 222:
  case 223:
  case 240:
  case 189:
    mndx = PM_HUMAN;
    break;
  case 243:
  case 191:
    mndx = PM_GIANT;
    break;
  case 241:
  case 190:
    mndx = PM_ETTIN;
    break;
  default:
    break;
  }
  return mndx;
}

export function genus(mndx: number, mode: number): number {
  switch (mndx) {
  case 368:
    mndx = mode ? PM_ARCHEOLOGIST : PM_HUMAN;
    break;
  case 369:
    mndx = mode ? PM_BARBARIAN : PM_HUMAN;
    break;
  case 370:
    mndx = mode ? PM_CAVEMAN : PM_HUMAN;
    break;
  case 371:
    mndx = mode ? PM_HEALER : PM_HUMAN;
    break;
  case 372:
    mndx = mode ? PM_KNIGHT : PM_HUMAN;
    break;
  case 373:
    mndx = mode ? PM_MONK : PM_HUMAN;
    break;
  case 374:
    mndx = mode ? PM_PRIEST : PM_HUMAN;
    break;
  case 375:
    mndx = mode ? PM_RANGER : PM_HUMAN;
    break;
  case 376:
    mndx = mode ? PM_ROGUE : PM_HUMAN;
    break;
  case 378:
    mndx = mode ? PM_SAMURAI : PM_HUMAN;
    break;
  case 379:
    mndx = mode ? PM_TOURIST : PM_HUMAN;
    break;
  case 381:
    mndx = mode ? PM_WIZARD : PM_HUMAN;
    break;
  case 380:
    mndx = mode ? PM_VALKYRIE : PM_HUMAN;
    break;
  default:
    if (mndx >= LOW_PM && mndx < NUMMONS) {
      let ptr = $sat(G.mons, mndx);
      if ((ptr.mflags2 & 8) >>> 0 !== 0) {
        mndx = PM_HUMAN;
      } else if ((ptr.mflags2 & 16) >>> 0 !== 0) {
        mndx = PM_ELF;
      } else if ((ptr.mflags2 & 32) >>> 0 !== 0) {
        mndx = PM_DWARF;
      } else if ((ptr.mflags2 & 64) >>> 0 !== 0) {
        mndx = PM_GNOME;
      } else if ((ptr.mflags2 & 128) >>> 0 !== 0) {
        mndx = PM_ORC;
      }
    }
    break;
  }
  return mndx;
}

export function pm_to_cham(mndx: number): number {
  let mcham = NON_PM;
  if (mndx >= LOW_PM && ($sat(G.mons, mndx).mflags2 & 16384) >>> 0 !== 0) {
    mcham = mndx;
  }
  return mcham;
}

async function make_corpse(mtmp: struct_monst | null, corpseflags: number): Promise<struct_obj | null> {
  let $g = 0;
  let mdat = null;
  let num = 0;
  let obj = [null];
  let otmp = [null];
  let x = 0;
  let y = 0;
  let mndx = 0;
  let corpstatflags = 0;
  let burythem = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mdat = mtmp.data;
      obj[0] = null;
      otmp[0] = null;
      x = mtmp.mx;
      y = mtmp.my;
      mndx = await monsndx(mdat);
      corpstatflags = corpseflags;
      burythem = ((corpstatflags & CORPSTAT_BURIED) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      switch (mndx) {
      case 141: { $g = 3; continue $L; }
      case 142: { $g = 4; continue $L; }
      case 143: { $g = 5; continue $L; }
      case 145: { $g = 6; continue $L; }
      case 144: { $g = 7; continue $L; }
      case 146: { $g = 8; continue $L; }
      case 147: { $g = 9; continue $L; }
      case 148: { $g = 10; continue $L; }
      case 149: { $g = 11; continue $L; }
      case 100: { $g = 12; continue $L; }
      case 101: { $g = 13; continue $L; }
      case 102: { $g = 14; continue $L; }
      case 113: { $g = 15; continue $L; }
      case 222: { $g = 16; continue $L; }
      case 223: { $g = 17; continue $L; }
      case 184: { $g = 18; continue $L; }
      case 187: { $g = 19; continue $L; }
      case 185: { $g = 20; continue $L; }
      case 186: { $g = 21; continue $L; }
      case 188: { $g = 22; continue $L; }
      case 189: { $g = 23; continue $L; }
      case 191: { $g = 24; continue $L; }
      case 190: { $g = 25; continue $L; }
      case 235: { $g = 26; continue $L; }
      case 238: { $g = 27; continue $L; }
      case 236: { $g = 28; continue $L; }
      case 237: { $g = 29; continue $L; }
      case 239: { $g = 30; continue $L; }
      case 240: { $g = 31; continue $L; }
      case 243: { $g = 32; continue $L; }
      case 241: { $g = 33; continue $L; }
      case 255: { $g = 34; continue $L; }
      case 254: { $g = 35; continue $L; }
      case 252: { $g = 36; continue $L; }
      case 253: { $g = 37; continue $L; }
      case 250: { $g = 38; continue $L; }
      case 249: { $g = 39; continue $L; }
      case 248: { $g = 40; continue $L; }
      case 246: { $g = 41; continue $L; }
      case 203: { $g = 42; continue $L; }
      case 204: { $g = 43; continue $L; }
      case 205: { $g = 44; continue $L; }
      case 206: { $g = 45; continue $L; }
      default: { $g = 46; continue $L; }
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
      if (!rn2(mtmp.mrevived | 0 ? 20 : 3)) {
        num = GRAY_DRAGON_SCALES + await monsndx(mdat) - PM_GRAY_DRAGON;
        obj[0] = await mksobj_at(num, x, y, FALSE, FALSE);
        obj[0].spe = 0;
        obj[0].cursed = (obj[0].blessed = (FALSE) & 1) & 1;
      }
      { $g = 1; continue $L; }
    case 12:
    case 13:
    case 14:
      if (mtmp.mrevived | 0 && rn2(2)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s recently regrown horn crumbles to dust."), s_suffix(await Monnam(mtmp)));
        }
      } else {
        obj[0] = await mksobj_at(UNICORN_HORN, x, y, TRUE, FALSE);
        if (obj[0] && mtmp.mrevived | 0) {
          obj[0].obroken = 1;
        }
      }
      { $g = 1; continue $L; }
    case 15:
      await mksobj_at(WORM_TOOTH, x, y, TRUE, FALSE);
      { $g = 1; continue $L; }
    case 16:
    case 17:
      num = undead_to_corpse(mndx);
      corpstatflags = (corpstatflags | CORPSTAT_INIT) >>> 0;
      obj[0] = await mkcorpstat(CORPSE, mtmp, $sat(G.mons, num), x, y, corpstatflags);
      obj[0].age -= 100;
      { $g = 2; continue $L; };
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
    case 31:
    case 32:
    case 33:
      num = undead_to_corpse(mndx);
      corpstatflags = (corpstatflags | CORPSTAT_INIT) >>> 0;
      obj[0] = await mkcorpstat(CORPSE, mtmp, $sat(G.mons, num), x, y, corpstatflags);
      obj[0].age -= 100;
      { $g = 2; continue $L; };
    case 34:
      num = d(2, 6);
      while (num--) {
        obj[0] = await mksobj_at(IRON_CHAIN, x, y, TRUE, FALSE);
      }
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 35:
      num = d(2, 4);
      while (num--) {
        obj[0] = await mksobj_at(LAST_GEM + rnd(9), x, y, TRUE, FALSE);
      }
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 36:
      obj[0] = await mksobj_at(ROCK, x, y, FALSE, FALSE);
      obj[0].quan = rn2(20) + 50;
      obj[0].owt = await weight(obj[0]) >>> 0;
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 37:
      corpstatflags = (corpstatflags & 4294967294) >>> 0;
      obj[0] = await mkcorpstat(STATUE, null, mdat, x, y, corpstatflags);
      { $g = 2; continue $L; };
    case 38:
      num = d(2, 4);
      while (num--) {
        obj[0] = await mksobj_at(QUARTERSTAFF, x, y, TRUE, FALSE);
      }
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 39:
      num = d(2, 4);
      while (num--) {
        obj[0] = await mksobj_at(LEATHER_ARMOR, x, y, TRUE, FALSE);
      }
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 40:
      obj[0] = await mkgold(200 - rnl(101), x, y);
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 41:
      num = rnd(4);
      while (num--) {
        obj[0] = await mksobj_at(SCR_BLANK_PAPER, x, y, TRUE, FALSE);
      }
      free_mname(mtmp);
      { $g = 2; continue $L; };
    case 42:
    case 43:
    case 44:
    case 45:
      obj[0] = await mksobj_at(GLOB_OF_BLACK_PUDDING - (PM_BLACK_PUDDING - mndx), x, y, TRUE, FALSE);
      while (obj[0] && !!(otmp[0] = await obj_nexto(obj[0]))) {
        await pudding_merge_message(obj[0], otmp[0]);
        obj[0] = await obj_meld(P(obj, 0), P(otmp, 0));
      }
      free_mname(mtmp);
      return obj[0];
    case 1: // default_1
    case 46:
      if (G.mvitals[mndx].mvflags & G_NOCORPSE) {
        return null;
      } else {
        corpstatflags = (corpstatflags | CORPSTAT_INIT) >>> 0;
        obj[0] = await mkcorpstat(CORPSE, mtmp.isshk | 0 || mtmp.mtame || (mtmp.data.geno & 4096) !== 0 || (mtmp.data === $sat(G.mons, 308) || mtmp.data === $sat(G.mons, 310) || mtmp.data === $sat(G.mons, 309) || mtmp.data.mlet === S_TROLL) || mtmp.m_id === G.quest_status.leader_m_id || (dmgtype(mtmp.data, 22) || dmgtype(mtmp.data, 35)) ? mtmp : null, mdat, x, y, corpstatflags);
        if (burythem) {
          const dealloc = new Int8Array(1);
          await bury_an_obj(obj[0], P(dealloc, 0));
          await newsym(x, y);
          return dealloc[0] ? null : obj[0];
        }
      }
      { $g = 2; continue $L; };
    case 2:
      if (!obj[0]) {
        return null;
      }
      if (G.context.bypasses) {
        bypass_obj(obj[0]);
      }
      if (mtmp.mextra && mtmp.mextra.mname) {
        obj[0] = await oname(obj[0], mtmp.mextra.mname);
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        obj[0].dknown = 0;
      }
      await stackobj(obj[0]);
      await newsym(x, y);
      return obj[0];
    }
    break;
  }
}

export async function minliquid(mtmp: struct_monst | null): Promise<number> {
  let inpool = 0;
  let inlava = 0;
  let infountain = 0;
  inpool = (is_pool(mtmp.mx, mtmp.my) && (!((mtmp.data.mflags1 & 1) >>> 0 !== 0 || (mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
  inlava = (is_lava(mtmp.mx, mtmp.my) && !((mtmp.data.mflags1 & 1) >>> 0 !== 0 || (mtmp.data.mlet === S_EYE || mtmp.data.mlet === S_LIGHT)) ? 1 : 0) << 24 >> 24;
  infountain = ($at2(G.level.locations, mtmp.mx, mtmp.my).typ === FOUNTAIN ? 1 : 0) << 24 >> 24;
  if (mtmp === G.u.usteed && ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
    return 0;
  }
  if (mtmp.data === $sat(G.mons, PM_GREMLIN) && (inpool || infountain) && rn2(3)) {
    if (await split_mon(mtmp, null)) {
      await dryup(mtmp.mx, mtmp.my, FALSE);
    }
    if (inpool) {
      await water_damage_chain(mtmp.minvent, FALSE);
    }
    return 0;
  } else if (mtmp.data === $sat(G.mons, PM_IRON_GOLEM) && inpool && !rn2(5)) {
    let dam = d(2, 6);
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await pline(S("%s rusts."), await Monnam(mtmp));
    }
    mtmp.mhp -= dam;
    if (mtmp.mhpmax > dam) {
      mtmp.mhpmax -= dam;
    }
    if (mtmp.mhp < 1) {
      await mondead(mtmp);
      if (mtmp.mhp < 1) {
        return 1;
      }
    }
    await water_damage_chain(mtmp.minvent, FALSE);
    return 0;
  }
  if (inlava) {
    if (!((mtmp.data.mflags1 & 16) >>> 0 !== 0) && !(mtmp.data === $sat(G.mons, 152) || mtmp.data === $sat(G.mons, 326))) {
      if ((mtmp.data.mflags1 & 33554432) >>> 0 !== 0 && !await tele_restrict(mtmp)) {
        if (await rloc(mtmp, TRUE)) {
          return 0;
        }
      }
      if (!(((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0)) {
        if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
          let dummy = mtmp.data.mattk[0];
          let how = await on_fire(mtmp.data, dummy);
          await pline(S("%s %s."), await Monnam(mtmp), !strcmp(how, S("boiling")) ? S("boils away") : !strcmp(how, S("melting")) ? S("melts away") : S("burns to a crisp"));
        }
        if (G.context.mon_moving) {
          await mondead(mtmp);
        } else {
          await xkilled(mtmp, XKILL_NOMSG);
        }
      } else {
        mtmp.mhp -= 1;
        if (mtmp.mhp < 1) {
          if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
            await pline(S("%s surrenders to the fire."), await Monnam(mtmp));
          }
          await mondead(mtmp);
        } else if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
          await pline(S("%s burns slightly."), await Monnam(mtmp));
        }
      }
      if (!(mtmp.mhp < 1)) {
        await fire_damage_chain(mtmp.minvent, FALSE, FALSE, mtmp.mx, mtmp.my);
        await rloc(mtmp, FALSE);
        return 0;
      }
      return 1;
    }
  } else if (inpool) {
    if (!((mtmp.data.mflags1 & 16) >>> 0 !== 0) && !((mtmp.data.mflags1 & 2) >>> 0 !== 0) && !((mtmp.data.mflags1 & (512 | 1024)) >>> 0 !== 0)) {
      if ((mtmp.data.mflags1 & 33554432) >>> 0 !== 0 && !await tele_restrict(mtmp)) {
        if (await rloc(mtmp, TRUE)) {
          return 0;
        }
      }
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        if (G.context.mon_moving) {
          await pline(S("%s drowns."), await Monnam(mtmp));
        } else {
          await You(S("drown %s."), await mon_nam(mtmp));
        }
      }
      if (G.u.ustuck && G.u.uswallow | 0 && G.u.ustuck === mtmp) {
        await pline(S("%s sinks as %s rushes in and flushes you out."), await Monnam(mtmp), hliquid(S("water")));
      }
      if (G.context.mon_moving) {
        await mondead(mtmp);
      } else {
        await xkilled(mtmp, XKILL_NOMSG);
      }
      if (!(mtmp.mhp < 1)) {
        await water_damage_chain(mtmp.minvent, FALSE);
        if (!await rloc(mtmp, TRUE)) {
          await deal_with_overcrowding(mtmp);
        }
        return 0;
      }
      return 1;
    }
  } else {
    if (mtmp.data.mlet === S_EEL && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
      if (mtmp.mhp > 1 && rn2(mtmp.mhp) > rn2(8)) {
        --mtmp.mhp;
      }
      await monflee(mtmp, 2, FALSE, FALSE);
    }
  }
  return 0;
}

export function mcalcmove(mon: struct_monst | null): number {
  let mmove = mon.data.mmove;
  let mmove_adj = 0;
  if ((mon.mspeed | 0) === MSLOW) {
    mmove = (2 * mmove + 1) / 3 | 0;
  } else if ((mon.mspeed | 0) === MFAST) {
    mmove = (4 * mmove + 2) / 3 | 0;
  }
  if (mon === G.u.usteed && G.u.ugallop && G.context.mv) {
    mmove = Math.imul(rn2(2) ? 4 : 5, mmove) / 3 | 0;
  }
  mmove_adj = mmove % NORMAL_SPEED;
  mmove -= mmove_adj;
  if (rn2(NORMAL_SPEED) < mmove_adj) {
    mmove += NORMAL_SPEED;
  }
  return mmove;
}

export async function mcalcdistress(): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.data.mmove === 0) {
      if (G.vision_full_recalc) {
        await vision_recalc(0);
      }
      if (await minliquid(mtmp)) {
        continue;
      }
    }
    await mon_regen(mtmp, FALSE);
    if (mtmp.cham >= LOW_PM) {
      await decide_to_shapeshift(mtmp, (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) || G.u.uswallow | 0 && mtmp === G.u.ustuck ? SHIFT_MSG : 0);
    }
    await were_change(mtmp);
    if (mtmp.mblinded | 0 && !(mtmp.mblinded = (mtmp.mblinded - 1 >>> 0) & 127)) {
      mtmp.mcansee = 1;
    }
    if (mtmp.mfrozen | 0 && !(mtmp.mfrozen = (mtmp.mfrozen - 1 >>> 0) & 127)) {
      mtmp.mcanmove = 1;
    }
    if (mtmp.mfleetim | 0 && !(mtmp.mfleetim = (mtmp.mfleetim - 1 >>> 0) & 127)) {
      mtmp.mflee = 0;
    }
  }
}

export async function movemon(): Promise<number> {
  let mtmp = null;
  let nmtmp = null;
  let somebody_can_move = FALSE;
  for (mtmp = G.level.monlist; mtmp; mtmp = nmtmp) {
    if (G.u.utotype || G.program_state.done_hup) {
      somebody_can_move = FALSE;
      break;
    }
    nmtmp = mtmp.nmon;
    if (mtmp.isgd | 0 && !mtmp.mx) {
      if (G.monstermoves > mtmp.mlstmv) {
        await gd_move(mtmp);
        mtmp.mlstmv = G.monstermoves;
      }
      continue;
    }
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.movement < NORMAL_SPEED) {
      continue;
    }
    mtmp.movement = mtmp.movement - NORMAL_SPEED << 16 >> 16;
    if (mtmp.movement >= NORMAL_SPEED) {
      somebody_can_move = TRUE;
    }
    if (G.vision_full_recalc) {
      await vision_recalc(0);
    }
    if (G.context.bypasses) {
      clear_bypasses();
    }
    clear_splitobjs();
    if (await minliquid(mtmp)) {
      continue;
    }
    if (mtmp.misc_worn_check & I_SPECIAL) {
      let oldworn = 0;
      mtmp.misc_worn_check = mtmp.misc_worn_check & ~I_SPECIAL;
      oldworn = mtmp.misc_worn_check;
      await m_dowear(mtmp, FALSE);
      if (mtmp.misc_worn_check !== oldworn || !mtmp.mcanmove) {
        continue;
      }
    }
    if ((mtmp.data.mflags1 & 256) >>> 0 !== 0) {
      if (await restrap(mtmp)) {
        continue;
      }
      if ((mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT) {
        continue;
      }
      if (mtmp.mundetected) {
        continue;
      }
    } else if (mtmp.data.mlet === S_EEL && !mtmp.mundetected && (mtmp.mflee | 0 || dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) && !rn2(4)) {
      if (hideunder(mtmp)) {
        continue;
      }
    }
    if ((G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !mtmp.iswiz && mtmp.mcansee | 0) {
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= Math.imul(BOLT_LIM, BOLT_LIM) && await fightm(mtmp)) {
        continue;
      }
    }
    if (await dochugw(mtmp)) {
      continue;
    }
  }
  if (any_light_source()) {
    G.vision_full_recalc = 1;
  }
  if (G.context.bypasses) {
    clear_bypasses();
  }
  clear_splitobjs();
  await dmonsfree();
  if (G.u.utotype) {
    await deferred_goto();
    somebody_can_move = FALSE;
  }
  return somebody_can_move;
}

export async function meatmetal(mtmp: struct_monst | null): Promise<number> {
  let otmp = null;
  let ptr = null;
  let poly = 0;
  let grow = 0;
  let heal = 0;
  let mstone = 0;
  if (mtmp.mtame) {
    return 0;
  }
  for (otmp = G.level.objects[mtmp.mx][mtmp.my]; otmp; otmp = otmp.v.v_nexthere) {
    if (mtmp.data === $sat(G.mons, PM_RUST_MONSTER) && !((G.objects[otmp.otyp].oc_material | 0) === IRON) || otmp.otyp === AMULET_OF_STRANGULATION || otmp.otyp === RIN_SLOW_DIGESTION) {
      continue;
    }
    if ((G.objects[otmp.otyp].oc_material | 0) >= IRON && (G.objects[otmp.otyp].oc_material | 0) <= MITHRIL && !obj_resists(otmp, 5, 95) && await touch_artifact(otmp, mtmp)) {
      if (mtmp.data === $sat(G.mons, PM_RUST_MONSTER) && otmp.oerodeproof | 0) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && G.flags.verbose) {
          await pline(S("%s eats %s!"), await Monnam(mtmp), await distant_name(otmp, doname));
        }
        otmp.oerodeproof = 0;
        mtmp.mstun = 1;
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && G.flags.verbose) {
          await pline(S("%s spits %s out in disgust!"), await Monnam(mtmp), await distant_name(otmp, doname));
        }
      } else {
        if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && G.flags.verbose) {
          await pline(S("%s eats %s!"), await Monnam(mtmp), await distant_name(otmp, doname));
        } else if (G.flags.verbose) {
          await You_hear(S("a crunching sound."));
        }
        mtmp.meating = (otmp.owt / 2 >>> 0) + 1 >>> 0 | 0;
        if (mtmp.mhp < mtmp.mhpmax) {
          mtmp.mhp += G.objects[otmp.otyp].oc_weight;
          if (mtmp.mhp > mtmp.mhpmax) {
            mtmp.mhp = mtmp.mhpmax;
          }
        }
        if (otmp === G.uball) {
          await unpunish();
          await delobj(otmp);
        } else if (otmp === G.uchain) {
          await unpunish();
        } else {
          poly = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && pm_to_cham(otmp.corpsenm) !== -1 ? 1 : 0;
          grow = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && otmp.corpsenm === 226 ? 1 : 0;
          heal = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && otmp.corpsenm === 275 ? 1 : 0;
          mstone = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9) || otmp.corpsenm === 280) ? 1 : 0;
          await delobj(otmp);
          ptr = mtmp.data;
          if (poly) {
            if (await newcham(mtmp, null, FALSE, FALSE)) {
              ptr = mtmp.data;
            }
          } else if (grow) {
            ptr = await grow_up(mtmp, null);
          } else if (mstone) {
            if (poly_when_stoned(ptr)) {
              await mon_to_stone(mtmp);
              ptr = mtmp.data;
            } else if (!(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
              if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
                await pline(S("%s turns to stone!"), await Monnam(mtmp));
              }
              await monstone(mtmp);
              ptr = null;
            }
          } else if (heal) {
            mtmp.mhp = mtmp.mhpmax;
          }
          if (!ptr) {
            return 2;
          }
        }
        if (rnd(25) < 3) {
          await mksobj_at(ROCK, mtmp.mx, mtmp.my, TRUE, FALSE);
        }
        await newsym(mtmp.mx, mtmp.my);
        return 1;
      }
    }
  }
  return 0;
}

export async function meatobj(mtmp: struct_monst | null): Promise<number> {
  let otmp = null;
  let otmp2 = null;
  let ptr = null;
  let original_ptr = mtmp.data;
  let poly = 0;
  let grow = 0;
  let heal = 0;
  let eyes = 0;
  let count = 0;
  let ecount = 0;
  let buf = new Int8Array(256);
  buf[0] = 0;
  if (mtmp.mtame) {
    return 0;
  }
  for (otmp = G.level.objects[mtmp.mx][mtmp.my]; otmp; otmp = otmp2) {
    otmp2 = otmp.v.v_nexthere;
    if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309))) {
      await revive_corpse(otmp);
    } else if (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0) || otmp.oclass === ROCK_CLASS || otmp === G.uball || otmp === G.uchain || otmp.otyp === SCR_SCARE_MONSTER) {
      continue;
    } else if (!((G.objects[otmp.otyp].oc_material | 0) <= WOOD) || obj_resists(otmp, 5, 95) || !await touch_artifact(otmp, mtmp) || (otmp.otyp === AMULET_OF_STRANGULATION || otmp.otyp === RIN_SLOW_DIGESTION) || (otmp.otyp === CORPSE || otmp.otyp === EGG || otmp.globby | 0) && (($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0) || otmp.corpsenm === PM_GREEN_SLIME && !(mtmp.data === $sat(G.mons, 205) || (mtmp.data === $sat(G.mons, 110) || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 152) || mtmp.data === $sat(G.mons, 326)) || mtmp.data.mlet === S_GHOST))) {
      ++ecount;
      if (ecount === 1) {
        sprintf(P(buf), S("%s engulfs %s."), await Monnam(mtmp), await distant_name(otmp, doname));
      } else if (ecount === 2) {
        sprintf(P(buf), S("%s engulfs several objects."), await Monnam(mtmp));
      }
      await obj_extract_self(otmp);
      await mpickobj(mtmp, otmp);
    } else {
      ++count;
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        if (G.flags.verbose) {
          await pline(S("%s eats %s!"), await Monnam(mtmp), await distant_name(otmp, doname));
        }
        if (otmp.oclass === SCROLL_CLASS && !strncmpi(G.obj_descr[G.objects[otmp.otyp].oc_descr_idx].oc_descr, S("YUM YUM"), -1)) {
          await pline(S("Yum%c"), otmp.blessed | 0 ? 33 : 46);
        }
      } else {
        if (G.flags.verbose) {
          await You_hear(S("a slurping sound."));
        }
      }
      if (mtmp.mhp < mtmp.mhpmax) {
        mtmp.mhp += G.objects[otmp.otyp].oc_weight;
        if (mtmp.mhp > mtmp.mhpmax) {
          mtmp.mhp = mtmp.mhpmax;
        }
      }
      if (!!otmp.cobj) {
        let otmp3 = null;
        while (!!(otmp3 = otmp.cobj)) {
          await obj_extract_self(otmp3);
          if (otmp.otyp === ICE_BOX && otmp3.otyp === CORPSE) {
            otmp3.age = G.monstermoves - otmp3.age;
            await start_corpse_timeout(otmp3);
          }
          await mpickobj(mtmp, otmp3);
        }
      }
      poly = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && pm_to_cham(otmp.corpsenm) !== -1 ? 1 : 0;
      grow = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && otmp.corpsenm === 226 ? 1 : 0;
      heal = (otmp.otyp === 240 || otmp.otyp === 241 || otmp.otyp === 271) && otmp.corpsenm === 275 ? 1 : 0;
      eyes = otmp.otyp === CARROT ? 1 : 0;
      await delobj(otmp);
      ptr = mtmp.data;
      if (poly) {
        if (await newcham(mtmp, null, FALSE, FALSE)) {
          ptr = mtmp.data;
        }
      } else if (grow) {
        ptr = await grow_up(mtmp, null);
      } else if (heal) {
        mtmp.mhp = mtmp.mhpmax;
      }
      if ((eyes || heal) && !mtmp.mcansee) {
        await mcureblindness(mtmp, (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0);
      }
      if (ptr !== original_ptr) {
        return !ptr ? 2 : 1;
      }
    }
    if (mtmp.minvis) {
      await newsym(mtmp.mx, mtmp.my);
    }
  }
  if (ecount > 0) {
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && G.flags.verbose && buf[0]) {
      await pline(S("%s"), P(buf));
    } else if (G.flags.verbose) {
      await You_hear(S("%s slurping sound%s."), ecount === 1 ? S("a") : S("several"), ecount === 1 ? S("") : S("s"));
    }
  }
  return count > 0 || ecount > 0 ? 1 : 0;
}

export async function mpickgold(mtmp: struct_monst | null): Promise<void> {
  let gold = null;
  let mat_idx = 0;
  if (!!(gold = g_at(mtmp.mx, mtmp.my))) {
    mat_idx = G.objects[gold.otyp].oc_material | 0;
    await obj_extract_self(gold);
    await add_to_minv(mtmp, gold);
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      if (G.flags.verbose && !mtmp.isgd) {
        await pline(S("%s picks up some %s."), await Monnam(mtmp), mat_idx === GOLD ? S("gold") : S("money"));
      }
      await newsym(mtmp.mx, mtmp.my);
    }
  }
}

export async function mpickstuff(mtmp: struct_monst | null, str: Ptr | null): Promise<number> {
  let otmp = null;
  let otmp2 = null;
  let otmp3 = null;
  let carryamt = 0;
  if (mtmp.isshk | 0 && inhishop(mtmp)) {
    return FALSE;
  }
  for (otmp = G.level.objects[mtmp.mx][mtmp.my]; otmp; otmp = otmp2) {
    otmp2 = otmp.v.v_nexthere;
    if (!str ? await searches_for_item(mtmp, otmp) : !!strchr(str, otmp.oclass) ? 1 : 0) {
      if (otmp.otyp === CORPSE && mtmp.data.mlet !== S_NYMPH && !($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && otmp.corpsenm !== PM_LIZARD && !(($sat(G.mons, otmp.corpsenm).mflags1 & 134217728) >>> 0 !== 0)) {
        continue;
      }
      if (!await touch_artifact(otmp, mtmp)) {
        continue;
      }
      carryamt = can_carry(mtmp, otmp);
      if (carryamt === 0) {
        continue;
      }
      if (is_pool(mtmp.mx, mtmp.my)) {
        continue;
      }
      otmp3 = otmp;
      if (carryamt !== otmp.quan) {
        otmp3 = await splitobj(otmp, carryamt);
      }
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && G.flags.verbose) {
        await pline(S("%s picks up %s."), await Monnam(mtmp), dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 5 ? await doname(otmp3) : await distant_name(otmp3, doname));
      }
      await obj_extract_self(otmp3);
      await mpickobj(mtmp, otmp3);
      await m_dowear(mtmp, FALSE);
      await newsym(mtmp.mx, mtmp.my);
      return TRUE;
    }
  }
  return FALSE;
}

export function curr_mon_load(mtmp: struct_monst | null): number {
  let curload = 0;
  let obj = null;
  for (obj = mtmp.minvent; obj; obj = obj.nobj) {
    if (obj.otyp !== BOULDER || !((mtmp.data.mflags2 & 134217728) >>> 0 !== 0)) {
      curload += obj.owt;
    }
  }
  return curload;
}

export function max_mon_load(mtmp: struct_monst | null): number {
  let maxload = 0;
  if (!mtmp.data.cwt) {
    maxload = Math.trunc(MAX_CARR_CAP * mtmp.data.msize / MZ_HUMAN);
  } else if (!((mtmp.data.mflags2 & 67108864) >>> 0 !== 0) || (mtmp.data.mflags2 & 67108864) >>> 0 !== 0 && mtmp.data.cwt > WT_HUMAN) {
    maxload = Math.trunc(MAX_CARR_CAP * mtmp.data.cwt / WT_HUMAN);
  } else {
    maxload = MAX_CARR_CAP;
  }
  if (!((mtmp.data.mflags2 & 67108864) >>> 0 !== 0)) {
    maxload = Math.trunc(maxload / 2);
  }
  if (maxload < 1) {
    maxload = 1;
  }
  return maxload | 0;
}

export function can_carry(mtmp: struct_monst | null, otmp: struct_obj | null): number {
  let iquan = 0;
  let otyp = otmp.otyp;
  let newload = otmp.owt | 0;
  let mdat = mtmp.data;
  let nattk = 0;
  if ((mdat.mflags1 & 2048) >>> 0 !== 0) {
    return 0;
  }
  if (otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && !(mtmp.misc_worn_check & W_ARMG) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
    return 0;
  }
  if (otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309))) {
    return 0;
  }
  if ((G.objects[otyp].oc_material | 0) === SILVER && mon_hates_silver(mtmp) && (otyp !== BELL_OF_OPENING || !(mdat.mflags3 & 31))) {
    return 0;
  }
  iquan = otmp.quan > LARGEST_INT ? 20000 + rn2(LARGEST_INT - 20000 + 1) : otmp.quan | 0;
  if (iquan > 1) {
    let glomper = FALSE;
    if (mtmp.data.mlet === S_DRAGON && (otmp.oclass === COIN_CLASS || otmp.oclass === GEM_CLASS)) {
      glomper = TRUE;
    } else {
      for (nattk = 0; nattk < NATTK; nattk = nattk + 1 << 16 >> 16) {
        if (mtmp.data.mattk[nattk].aatyp === AT_ENGL) {
          glomper = TRUE;
          break;
        }
      }
    }
    if ((mtmp.data.mflags1 & M1_NOHANDS) >>> 0 && !glomper) {
      return 1;
    }
  }
  if (mtmp === G.u.usteed) {
    return 0;
  }
  if (mtmp.isshk) {
    return iquan;
  }
  if (mtmp.mpeaceful | 0 && !mtmp.mtame) {
    return 0;
  }
  if ((mdat.mflags2 & 134217728) >>> 0 !== 0 && otyp === BOULDER) {
    return iquan;
  }
  if (mdat.mlet === S_NYMPH) {
    return otmp.oclass === ROCK_CLASS ? 0 : iquan;
  }
  if (curr_mon_load(mtmp) + newload > max_mon_load(mtmp)) {
    return 0;
  }
  return iquan;
}

export async function mfndpos(mon: struct_monst | null, poss: struct_nhcoord | null, info: Ptr | null, flag: number): Promise<number> {
  let $g = 0;
  let mdat = null;
  let ttmp = null;
  let x = 0;
  let y = 0;
  let nx = 0;
  let ny = 0;
  let cnt = 0;
  let ntyp = 0;
  let nowtyp = 0;
  let wantpool = 0;
  let poolok = 0;
  let lavaok = 0;
  let nodiag = 0;
  let rockok = 0;
  let treeok = 0;
  let thrudoor = 0;
  let maxx = 0;
  let maxy = 0;
  let poisongas_ok = 0;
  let in_poisongas = 0;
  let gas_reg = null;
  let gas_glyph = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mdat = mon.data;
      cnt = 0;
      rockok = FALSE;
      treeok = FALSE;
      gas_glyph = S_poisoncloud + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
      x = mon.mx;
      y = mon.my;
      nowtyp = $at2(G.level.locations, x, y).typ & 0xff;
      nodiag = ($sdiff(mdat, G.mons[0]) === 115 ? 1 : 0) << 24 >> 24;
      wantpool = (mdat.mlet === S_EEL ? 1 : 0) << 24 >> 24;
      poolok = (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && ((mdat.mflags1 & 1) >>> 0 !== 0 || (mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) || (mdat.mflags1 & 16) >>> 0 !== 0) || (mdat.mflags1 & 2) >>> 0 !== 0 && !wantpool ? 1 : 0) << 24 >> 24;
      lavaok = ((mdat.mflags1 & 1) >>> 0 !== 0 || (mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) || (mdat.mflags1 & 16) >>> 0 !== 0 || (mdat === $sat(G.mons, 152) || mdat === $sat(G.mons, 326)) ? 1 : 0) << 24 >> 24;
      if (mdat === $sat(G.mons, PM_FLOATING_EYE)) {
        lavaok = FALSE;
      }
      thrudoor = ((flag & (ALLOW_WALL | BUSTDOOR)) !== 0 ? 1 : 0) << 24 >> 24;
      poisongas_ok = ((mdat.mflags2 & 2) >>> 0 !== 0 || mdat === $sat(G.mons, 49) || (mdat.mlet === S_GOLEM || mdat.mlet === S_VORTEX) || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224) || (mdat.mflags1 & 1024) >>> 0 !== 0 || ((mon.data.mresists | mon.mextrinsics) & 32) !== 0 ? 1 : 0) << 24 >> 24;
      in_poisongas = (!!(gas_reg = visible_region_at(x, y)) && gas_reg.glyph === gas_glyph ? 1 : 0) << 24 >> 24;
      if (flag & ALLOW_DIG) {
        let mw_tmp = null;
        if (!((mdat.mflags1 & 64) >>> 0 !== 0)) {
          rockok = treeok = TRUE;
        } else if ((mw_tmp = mon.mw) && mw_tmp.cursed | 0 && mon.weapon_check === NO_WEAPON_WANTED) {
          rockok = ((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_PICK_AXE ? 1 : 0) << 24 >> 24;
          treeok = ((mw_tmp.oclass === WEAPON_CLASS || mw_tmp.oclass === TOOL_CLASS) && G.objects[mw_tmp.otyp].oc_subtyp === P_AXE ? 1 : 0) << 24 >> 24;
        } else {
          rockok = (m_carrying(mon, PICK_AXE) || m_carrying(mon, DWARVISH_MATTOCK) && !await which_armor(mon, W_ARMS) ? 1 : 0) << 24 >> 24;
          treeok = (m_carrying(mon, AXE) || m_carrying(mon, BATTLE_AXE) && !await which_armor(mon, W_ARMS) ? 1 : 0) << 24 >> 24;
        }
        if (rockok || treeok) {
          thrudoor = TRUE;
        }
      }
    case 1: // nexttry
      if (mon.mconf) {
        flag = flag | ALLOW_ALL;
        flag = flag & ~NOTONL;
      }
      if (!mon.mcansee) {
        flag = flag | ALLOW_SSM;
      }
      maxx = x + 1 < 80 - 1 ? x + 1 : 80 - 1;
      maxy = y + 1 < 21 - 1 ? y + 1 : 21 - 1;
      for (nx = (1 > x - 1 ? 1 : x - 1) << 24 >> 24; nx <= maxx; nx = nx + 1 << 24 >> 24) {
        for (ny = (0 > y - 1 ? 0 : y - 1) << 24 >> 24; ny <= maxy; ny = ny + 1 << 24 >> 24) {
          if (nx === x && ny === y) {
            continue;
          }
          ntyp = $at2(G.level.locations, nx, ny).typ & 0xff;
          if (ntyp < POOL && !(flag & ALLOW_WALL && may_passwall(nx, ny)) && !((ntyp === TREE || G.level.flags.arboreal | 0 && ntyp === STONE ? treeok : rockok) && may_dig(nx, ny))) {
            continue;
          }
          if (ntyp === IRONBARS && (!(flag & ALLOW_BARS) || ($at2(G.level.locations, nx, ny).flags | 0) & W_NONDIGGABLE && (dmgtype(mdat, AD_RUST) || dmgtype(mdat, AD_CORR)))) {
            continue;
          }
          if (ntyp === DOOR && !((mdat.mflags1 & 4) >>> 0 !== 0 || can_fog(mon)) && (($at2(G.level.locations, nx, ny).flags | 0) & D_CLOSED && !(flag & OPENDOOR) || ($at2(G.level.locations, nx, ny).flags | 0) & D_LOCKED && !(flag & UNLOCKDOOR)) && !thrudoor) {
            continue;
          }
          if (!poisongas_ok && !in_poisongas && !!(gas_reg = visible_region_at(nx, ny)) && gas_reg.glyph === gas_glyph) {
            continue;
          }
          if (nx !== x && ny !== y && (nodiag || nowtyp === DOOR && ($at2(G.level.locations, x, y).flags | 0) & ~D_BROKEN || ntyp === DOOR && ($at2(G.level.locations, nx, ny).flags | 0) & ~D_BROKEN || (nowtyp === DOOR || ntyp === DOOR) && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) || (!!G.level.monsters[x][ny] ? G.level.monsters[x][ny] : null) && (!!G.level.monsters[nx][y] ? G.level.monsters[nx][y] : null) && await worm_cross(x, y, nx, ny) && !(!!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null) && (nx !== G.u.ux || ny !== G.u.uy))) {
            continue;
          }
          if ((is_pool(nx, ny) === wantpool || poolok) && (lavaok || !is_lava(nx, ny))) {
            let dispx = 0;
            let dispy = 0;
            let monseeu = (mon.mcansee | 0 && (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mdat.mflags1 & 16777216) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
            let checkobj = (!!G.level.objects[nx][ny] ? 1 : 0) << 24 >> 24;
            if (G.u.uprops[DISPLACED].extrinsic && monseeu && mon.mux === nx && mon.muy === ny) {
              dispx = G.u.ux;
              dispy = G.u.uy;
            } else {
              dispx = nx;
              dispy = ny;
            }
            info.a[info.o + cnt] = 0;
            if (onscary(dispx, dispy, mon)) {
              if (!(flag & ALLOW_SSM)) {
                continue;
              }
              info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_SSM;
            }
            if (nx === G.u.ux && ny === G.u.uy || nx === mon.mux && ny === mon.muy) {
              if (nx === G.u.ux && ny === G.u.uy) {
                mon.mux = G.u.ux;
                mon.muy = G.u.uy;
              }
              if (!(flag & ALLOW_U)) {
                continue;
              }
              info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_U;
            } else {
              if (!!G.level.monsters[nx][ny]) {
                let mtmp2 = !!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null;
                let mmflag = flag | mm_aggression(mon, mtmp2);
                if (mmflag & ALLOW_M) {
                  info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_M;
                  if (mtmp2.mtame) {
                    if (!(mmflag & ALLOW_TM)) {
                      continue;
                    }
                    info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_TM;
                  }
                } else {
                  mmflag = flag | await mm_displacement(mon, mtmp2);
                  if (!(mmflag & ALLOW_MDISP)) {
                    continue;
                  }
                  info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_MDISP;
                }
              }
              if (G.level.flags.has_temple | 0 && $rd(in_rooms(nx, ny, TEMPLE)) && !$rd(in_rooms(x, y, TEMPLE)) && in_your_sanctuary(null, nx, ny)) {
                if (!(flag & ALLOW_SANCT)) {
                  continue;
                }
                info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_SANCT;
              }
            }
            if (checkobj && sobj_at(CLOVE_OF_GARLIC, nx, ny)) {
              if (($u64(flag) & NOGARLIC) >>> 0) {
                continue;
              }
              info.a[info.o + cnt] = ($u64(info.a[info.o + cnt]) | NOGARLIC) >>> 0;
            }
            if (checkobj && sobj_at(BOULDER, nx, ny)) {
              if (!(flag & ALLOW_ROCK)) {
                continue;
              }
              info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_ROCK;
            }
            if (monseeu && online2(nx, ny, G.u.ux, G.u.uy)) {
              if (flag & NOTONL) {
                continue;
              }
              info.a[info.o + cnt] = info.a[info.o + cnt] | NOTONL;
            }
            if (nx !== x && ny !== y && bad_rock(mdat, x, ny) && bad_rock(mdat, nx, y) && cant_squeeze_thru(mon)) {
              continue;
            }
            if (!!(ttmp = t_at(nx, ny))) {
              if ((ttmp.ttyp | 0) >= TRAPNUM || (ttmp.ttyp | 0) === 0) {
                await impossible(S("A monster looked at a very strange trap of type %d."), ttmp.ttyp | 0);
                continue;
              }
              if (((ttmp.ttyp | 0) !== RUST_TRAP || mdat === $sat(G.mons, PM_IRON_GOLEM)) && (ttmp.ttyp | 0) !== STATUE_TRAP && (ttmp.ttyp | 0) !== VIBRATING_SQUARE && (!((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT) && !((ttmp.ttyp | 0) === HOLE || (ttmp.ttyp | 0) === TRAPDOOR) || !((mdat.mflags1 & 1) >>> 0 !== 0) && !(mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) && !((mdat.mflags1 & 16) >>> 0 !== 0) || G.level.flags.sokoban_rules | 0) && ((ttmp.ttyp | 0) !== SLP_GAS_TRAP || !(((mon.data.mresists | mon.mextrinsics) & 4) !== 0)) && ((ttmp.ttyp | 0) !== BEAR_TRAP || mdat.msize > MZ_SMALL && !((mdat.mflags1 & 4) >>> 0 !== 0) && !((mdat.mflags1 & 1) >>> 0 !== 0) && !(mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) && !(mdat.mlet === S_VORTEX || mdat === $sat(G.mons, 151)) && !((mdat.mflags1 & 1048576) >>> 0 !== 0)) && ((ttmp.ttyp | 0) !== FIRE_TRAP || !(((mon.data.mresists | mon.mextrinsics) & 1) !== 0)) && ((ttmp.ttyp | 0) !== SQKY_BOARD || !((mdat.mflags1 & 1) >>> 0 !== 0)) && ((ttmp.ttyp | 0) !== WEB || !((mdat.mflags1 & 4) >>> 0 !== 0) && !(mdat === $sat(G.mons, 93) || mdat === $sat(G.mons, 95)) && !(mdat.mlet === S_VORTEX || mdat === $sat(G.mons, 151)) && !((mdat.mflags1 & 1048576) >>> 0 !== 0)) && ((ttmp.ttyp | 0) !== ANTI_MAGIC || !resists_magm(mon))) {
                if (!(flag & ALLOW_TRAPS)) {
                  if (mon.mtrapseen & $shl64(1, (ttmp.ttyp | 0) - 1)) {
                    continue;
                  }
                }
                info.a[info.o + cnt] = info.a[info.o + cnt] | ALLOW_TRAPS;
              }
            }
            $sadd(poss, cnt).x = nx;
            $sadd(poss, cnt).y = ny;
            ++cnt;
          }
        }
      }
      if (!cnt && wantpool && !is_pool(x, y)) {
        wantpool = FALSE;
        { $g = 1; continue $L; }
      }
      return cnt;
    }
    break;
  }
}

function mm_aggression(magr: struct_monst | null, mdef: struct_monst | null): number {
  if (magr.data === $sat(G.mons, PM_PURPLE_WORM) && mdef.data === $sat(G.mons, PM_SHRIEKER)) {
    return ALLOW_M | ALLOW_TM;
  }
  return 0;
}

async function mm_displacement(magr: struct_monst | null, mdef: struct_monst | null): Promise<number> {
  let pa = magr.data;
  let pd = mdef.data;
  if ((pa.mflags3 & M3_DISPLACES) !== 0 && (pd.mflags3 & M3_DISPLACES) === 0 && !(magr.mx !== mdef.mx && magr.my !== mdef.my && await monsndx(pd) === 115) && !mdef.mtrapped && (!mdef.wormno || !count_wsegs(mdef)) && (pa === $sat(G.mons, 308) || pa === $sat(G.mons, 310) || pa === $sat(G.mons, 309) || pa.msize >= pd.msize)) {
    return ALLOW_MDISP;
  }
  return 0;
}

export function monnear(mon: struct_monst | null, x: number, y: number): number {
  let distance = dist2(mon.mx, mon.my, x, y);
  if (distance === 2 && $sdiff(mon.data, G.mons[0]) === 115) {
    return 0;
  }
  return (distance < 3 ? 1 : 0) << 24 >> 24;
}

export async function dmonsfree(): Promise<void> {
  let mtmp = null;
  let freetmp = null;
  let count = 0;
  let buf = new Int8Array(128);
  buf[0] = 0;
  for (mtmp = P(G.level, "monlist"); mtmp.a[mtmp.o]; ) {
    freetmp = mtmp.a[mtmp.o];
    if (freetmp.mhp < 1 && !freetmp.isgd) {
      mtmp.a[mtmp.o] = freetmp.nmon;
      freetmp.nmon = null;
      await dealloc_monst(freetmp);
      ++count;
    } else {
      mtmp = P(freetmp, "nmon");
    }
  }
  if (count !== G.iflags.purge_monsters) {
    describe_level(P(buf));
    await impossible(S("dmonsfree: %d removed doesn't match %d pending on %s"), count, G.iflags.purge_monsters, P(buf));
  }
  G.iflags.purge_monsters = 0;
}

export async function replmon(mtmp: struct_monst | null, mtmp2: struct_monst | null): Promise<void> {
  let otmp = null;
  for (otmp = mtmp2.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.where !== OBJ_MINVENT || otmp.v.v_ocarry !== mtmp) {
      await impossible(S("replmon: minvent inconsistency"));
    }
    otmp.v.v_ocarry = mtmp2;
  }
  mtmp.minvent = null;
  await relmon(mtmp, null);
  if (mtmp !== G.u.usteed) {
    await place_monster(mtmp2, mtmp2.mx, mtmp2.my);
  }
  if (mtmp2.wormno) {
    await place_wsegs(mtmp2, null);
  }
  if (mtmp2.data.mlet === S_LIGHT || mtmp2.data === $sat(G.mons, 30) || mtmp2.data === $sat(G.mons, 31) || mtmp2.data === $sat(G.mons, 110) ? 1 : mtmp2.data === $sat(G.mons, 152) ? 1 : 0) {
    await new_light_source(mtmp2.mx, mtmp2.my, mtmp2.data.mlet === S_LIGHT || mtmp2.data === $sat(G.mons, 30) || mtmp2.data === $sat(G.mons, 31) || mtmp2.data === $sat(G.mons, 110) ? 1 : mtmp2.data === $sat(G.mons, 152) ? 1 : 0, LS_MONSTER, monst_to_any(mtmp2));
    await del_light_source(LS_MONSTER, monst_to_any(mtmp));
  }
  mtmp2.nmon = G.level.monlist;
  G.level.monlist = mtmp2;
  if (G.u.ustuck === mtmp) {
    G.u.ustuck = mtmp2;
  }
  if (G.u.usteed === mtmp) {
    G.u.usteed = mtmp2;
  }
  if (mtmp2.isshk) {
    replshk(mtmp, mtmp2);
  }
  await dealloc_monst(mtmp);
}

export async function relmon(mon: struct_monst | null, monst_list: Ptr | null): Promise<void> {
  let mtmp = null;
  let mx = mon.mx;
  let my = mon.my;
  let on_map = ((!!G.level.monsters[mx][my] ? G.level.monsters[mx][my] : null) === mon ? 1 : 0) << 24 >> 24;
  let unhide = (!!monst_list ? 1 : 0) << 24 >> 24;
  if (!G.level.monlist) {
    await panic(S("relmon: no fmon available."));
  }
  if (unhide) {
    mon.mundetected = 0;
    if (mon.m_ap_type & 7 && (mon.m_ap_type & 7) !== M_AP_MONSTER) {
      await seemimic(mon);
    }
  }
  if (on_map) {
    mon.mtrapped = 0;
    if (mon.wormno) {
      await remove_worm(mon);
    } else {
      G.level.monsters[mx][my] = null;
    }
  }
  if (mon === G.level.monlist) {
    G.level.monlist = G.level.monlist.nmon;
  } else {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.nmon === mon) {
        break;
      }
    }
    if (mtmp) {
      mtmp.nmon = mon.nmon;
    } else {
      await panic(S("relmon: mon not in list."));
    }
  }
  if (unhide) {
    if (on_map) {
      await newsym(mx, my);
    }
    mon.nmon = monst_list.a[monst_list.o];
    monst_list.a[monst_list.o] = mon;
  } else {
    mon.nmon = null;
  }
}

export async function copy_mextra(mtmp2: struct_monst | null, mtmp1: struct_monst | null): Promise<void> {
  if (!mtmp2 || !mtmp1 || !mtmp1.mextra) {
    return;
  }
  if (!mtmp2.mextra) {
    mtmp2.mextra = await newmextra();
  }
  if (mtmp1.mextra.mname) {
    await new_mname(mtmp2, (strlen(mtmp1.mextra.mname) | 0) + 1);
    strcpy(mtmp2.mextra.mname, mtmp1.mextra.mname);
  }
  if (mtmp1.mextra.egd) {
    if (!mtmp2.mextra.egd) {
      await newegd(mtmp2);
    }
    mtmp2.mextra.egd.$cp(mtmp1.mextra.egd);
  }
  if (mtmp1.mextra.epri) {
    if (!mtmp2.mextra.epri) {
      await newepri(mtmp2);
    }
    mtmp2.mextra.epri.$cp(mtmp1.mextra.epri);
  }
  if (mtmp1.mextra.eshk) {
    if (!mtmp2.mextra.eshk) {
      await neweshk(mtmp2);
    }
    mtmp2.mextra.eshk.$cp(mtmp1.mextra.eshk);
  }
  if (mtmp1.mextra.emin) {
    if (!mtmp2.mextra.emin) {
      await newemin(mtmp2);
    }
    mtmp2.mextra.emin.$cp(mtmp1.mextra.emin);
  }
  if (mtmp1.mextra.edog) {
    if (!mtmp2.mextra.edog) {
      await newedog(mtmp2);
    }
    mtmp2.mextra.edog.$cp(mtmp1.mextra.edog);
  }
  if (mtmp1.mextra && mtmp1.mextra.mcorpsenm !== -1) {
    mtmp2.mextra.mcorpsenm = mtmp1.mextra.mcorpsenm;
  }
}

export function dealloc_mextra(m: struct_monst | null): void {
  let x = m.mextra;
  if (x) {
    if (x.mname) {
      free(x.mname);
    }
    if (x.egd) {
      free(x.egd);
    }
    if (x.epri) {
      free(x.epri);
    }
    if (x.eshk) {
      free(x.eshk);
    }
    if (x.emin) {
      free(x.emin);
    }
    if (x.edog) {
      free(x.edog);
    }
    free(x);
    m.mextra = null;
  }
}

export async function dealloc_monst(mon: struct_monst | null): Promise<void> {
  let buf = new Int8Array(128);
  buf[0] = 0;
  if (mon.nmon) {
    describe_level(P(buf));
    await panic(S("dealloc_monst with nmon on %s"), P(buf));
  }
  if (mon.mextra) {
    dealloc_mextra(mon);
  }
  free(mon);
}

async function m_detach(mtmp: struct_monst | null, mptr: struct_permonst | null): Promise<void> {
  let onmap = (mtmp.mx > 0 ? 1 : 0) << 24 >> 24;
  if (mtmp === G.context.polearm.hitmon) {
    G.context.polearm.hitmon = null;
  }
  if (mtmp.mleashed) {
    await m_unleash(mtmp, FALSE);
  }
  mtmp.mtrapped = 0;
  mtmp.mhp = 0;
  await relobj(mtmp, 0, FALSE);
  if (onmap || mtmp === G.level.monsters[0][0]) {
    if (mtmp.wormno) {
      await remove_worm(mtmp);
    } else {
      G.level.monsters[mtmp.mx][mtmp.my] = null;
    }
  }
  if (mptr.mlet === S_LIGHT || mptr === $sat(G.mons, 30) || mptr === $sat(G.mons, 31) || mptr === $sat(G.mons, 110) ? 1 : mptr === $sat(G.mons, 152) ? 1 : 0) {
    await del_light_source(LS_MONSTER, monst_to_any(mtmp));
  }
  if (mtmp.m_ap_type & 7) {
    await seemimic(mtmp);
  }
  if (onmap) {
    await newsym(mtmp.mx, mtmp.my);
  }
  await unstuck(mtmp);
  if (onmap) {
    await fill_pit(mtmp.mx, mtmp.my);
  }
  if (mtmp.isshk) {
    await shkgone(mtmp);
  }
  if (mtmp.wormno) {
    await wormgone(mtmp);
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    mtmp.mspare1 = mtmp.mspare1 | MON_ENDGAME_FREE;
  }
  mtmp.mspare1 = mtmp.mspare1 | MON_DETACH;
  ++G.iflags.purge_monsters;
}

export async function mlifesaver(mon: struct_monst | null): Promise<struct_obj | null> {
  if (!((mon.data.mflags2 & 2) >>> 0 !== 0 || mon.data === $sat(G.mons, 49) || (mon.data.mlet === S_GOLEM || mon.data.mlet === S_VORTEX)) || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
    let otmp = await which_armor(mon, W_AMUL);
    if (otmp && otmp.otyp === AMULET_OF_LIFE_SAVING) {
      return otmp;
    }
  }
  return null;
}

async function lifesaved_monster(mtmp: struct_monst | null): Promise<void> {
  let surviver = 0;
  let lifesave = await mlifesaver(mtmp);
  if (lifesave) {
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await pline(S("But wait..."));
      await pline(S("%s medallion begins to glow!"), s_suffix(await Monnam(mtmp)));
      await discover_object(179, 1, 1);
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        if (attacktype(mtmp.data, AT_EXPL) || attacktype(mtmp.data, AT_BOOM)) {
          await pline(S("%s reconstitutes!"), await Monnam(mtmp));
        } else {
          await pline(S("%s looks much better!"), await Monnam(mtmp));
        }
      }
      await pline_The(S("medallion crumbles to dust!"));
    }
    await m_useup(mtmp, lifesave);
    mtmp.misc_worn_check = mtmp.misc_worn_check | I_SPECIAL;
    surviver = (!(G.mvitals[await monsndx(mtmp.data)].mvflags & G_GENOD) ? 1 : 0) << 24 >> 24;
    mtmp.mcanmove = 1;
    mtmp.mfrozen = 0;
    if (mtmp.mtame && !mtmp.isminion) {
      await wary_dog(mtmp, !surviver ? 1 : 0);
    }
    if (mtmp.mhpmax <= 0) {
      mtmp.mhpmax = 10;
    }
    mtmp.mhp = mtmp.mhpmax;
    if (!surviver) {
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline(S("Unfortunately, %s is still genocided..."), await mon_nam(mtmp));
      }
      mtmp.mhp = 0;
    }
  }
}

export async function mondead(mtmp: struct_monst | null): Promise<void> {
  let $t1: any, $t2: any;
  let mptr = null;
  let tmp = 0;
  mtmp.mhp = 0;
  await lifesaved_monster(mtmp);
  if (!(mtmp.mhp < 1)) {
    return;
  }
  if (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) {
    let mndx = mtmp.cham;
    let x = mtmp.mx;
    let y = mtmp.my;
    if (mndx >= LOW_PM && mndx !== await monsndx(mtmp.data) && !(G.mvitals[mndx].mvflags & G_GENOD)) {
      let buf = new Int8Array(256);
      let in_door = ((mtmp.data.mflags1 & 4) >>> 0 !== 0 && closed_door(mtmp.mx, mtmp.my) ? 1 : 0) << 24 >> 24;
      let spec_mon = ((mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) || mtmp.data.mlet === S_GHOST || (mtmp.data.mflags1 & 4) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      let spec_death = (disintegested || mtmp.data.mlet === S_GHOST || (mtmp.data.mflags1 & 4) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      sprintf(P(buf), S("%s suddenly %s and rises as %%s!"), await x_monnam(mtmp, ARTICLE_THE, spec_mon ? null : S("seemingly dead"), SUPPRESS_INVISIBLE | SUPPRESS_IT, FALSE), spec_death ? S("reconstitutes") : S("transforms"));
      mtmp.mcanmove = 1;
      mtmp.mfrozen = 0;
      if (mtmp.mhpmax <= 0) {
        mtmp.mhpmax = 10;
      }
      mtmp.mhp = mtmp.mhpmax;
      if (mtmp === G.u.ustuck) {
        if (G.u.uswallow) {
          await expels(mtmp, mtmp.data, FALSE);
        } else {
          await uunstick();
        }
      }
      if (in_door) {
        let new_xy = new struct_nhcoord();
        if (await enexto(new_xy, mtmp.mx, mtmp.my, $sat(G.mons, mndx))) {
          await rloc_to(mtmp, new_xy.x, new_xy.y);
        }
      }
      await newcham(mtmp, $sat(G.mons, mndx), FALSE, FALSE);
      if (mtmp.data === $sat(G.mons, mndx)) {
        mtmp.cham = NON_PM;
      } else {
        mtmp.cham = mndx << 16 >> 16;
      }
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(upstart(P(buf)), await x_monnam(mtmp, ARTICLE_A, null, SUPPRESS_NAME | SUPPRESS_IT | SUPPRESS_INVISIBLE, FALSE));
        vamp_rise_msg = TRUE;
      }
      await newsym(x, y);
      return;
    }
  }
  if (mtmp.isgd | 0 && !await grddead(mtmp)) {
    return;
  }
  if (mtmp === G.u.usteed) {
    await dismount_steed(DISMOUNT_GENERIC);
  }
  mptr = mtmp.data;
  if (mtmp.cham >= LOW_PM) {
    await set_mon_data(mtmp, $sat(G.mons, mtmp.cham));
    mtmp.cham = NON_PM;
  } else if (mtmp.data === $sat(G.mons, PM_WEREJACKAL)) {
    await set_mon_data(mtmp, $sat(G.mons, PM_HUMAN_WEREJACKAL));
  } else if (mtmp.data === $sat(G.mons, PM_WEREWOLF)) {
    await set_mon_data(mtmp, $sat(G.mons, PM_HUMAN_WEREWOLF));
  } else if (mtmp.data === $sat(G.mons, PM_WERERAT)) {
    await set_mon_data(mtmp, $sat(G.mons, PM_HUMAN_WERERAT));
  }
  tmp = await monsndx(mtmp.data);
  if (G.mvitals[tmp].died < 255) {
    ($t1 = G.mvitals[tmp], $t1.died = $t1.died + 1 & 0xff);
  }
  if (mtmp.m_id === G.quest_status.leader_m_id) {
    G.quest_status.leader_is_dead = (TRUE) & 1;
  }
  if (tmp === PM_MAIL_DAEMON) {
    ($t2 = G.mvitals[tmp], $t2.mvflags = ($t2.mvflags | G_GENOD) & 0xff);
  }
  if (mtmp.data.mlet === S_KOP) {
    switch (rnd(5)) {
    case 1:
      await makemon(mtmp.data, G.dnstair.sx, G.dnstair.sy, NO_MM_FLAGS);
      break;
    case 2:
      await makemon(mtmp.data, 0, 0, NO_MM_FLAGS);
      break;
    default:
      break;
    }
  }
  if (mtmp.iswiz) {
    wizdead();
  }
  if (mtmp.data.msound === MS_NEMESIS) {
    await nemdead();
  }
  if (mtmp.data === $sat(G.mons, PM_MEDUSA)) {
    G.u.uachieve.killed_medusa = 1;
  }
  if ($at2(G.level.locations, mtmp.mx, mtmp.my).glyph === 382 + (382 + 0)) {
    await unmap_object(mtmp.mx, mtmp.my);
  }
  await m_detach(mtmp, mptr);
}

export async function corpse_chance(mon: struct_monst | null, magr: struct_monst | null, was_swallowed: number): Promise<number> {
  let mdat = mon.data;
  let i = 0;
  let tmp = 0;
  if (mdat === $sat(G.mons, PM_VLAD_THE_IMPALER) || mdat.mlet === S_LICH) {
    if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 && !was_swallowed) {
      await pline(S("%s body crumbles into dust."), s_suffix(await Monnam(mon)));
    }
    return FALSE;
  }
  for (i = 0; i < NATTK; ++i) {
    if (mdat.mattk[i].aatyp === AT_BOOM) {
      if (mdat.mattk[i].damn) {
        tmp = d(mdat.mattk[i].damn, mdat.mattk[i].damd);
      } else if (mdat.mattk[i].damd) {
        tmp = d(mdat.mlevel + 1, mdat.mattk[i].damd);
      } else {
        tmp = 0;
      }
      if (was_swallowed && magr) {
        if (magr === G.youmonst) {
          await There(S("is an explosion in your %s!"), body_part(STOMACH));
          sprintf(P(G.killer.name), S("%s explosion"), s_suffix(mdat.mname));
          await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp, P(G.killer.name), KILLED_BY_AN);
        } else {
          await You_hear(S("an explosion."));
          magr.mhp -= tmp;
          if (magr.mhp < 1) {
            await mondied(magr);
          }
          if (magr.mhp < 1) {
            if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected) || (!((magr.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(magr.mx, magr.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & magr.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & magr.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === magr.data))) {
              await pline(S("%s rips open!"), await Monnam(magr));
            }
          } else if ((magr.wormno | 0 ? worm_known(magr) : $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && magr && magr.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + magr.my], magr.mx) & 1 ? 1 : 0) && ((!magr.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !magr.mundetected)) {
            await pline(S("%s seems to have indigestion."), await Monnam(magr));
          }
        }
        return FALSE;
      }
      sprintf(P(G.killer.name), S("%s explosion"), s_suffix(mdat.mname));
      G.killer.format = KILLED_BY_AN;
      await explode(mon.mx, mon.my, -1, tmp, MON_EXPLODE, EXPL_NOXIOUS);
      G.killer.name[0] = 0;
      G.killer.format = 0;
      return FALSE;
    }
  }
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) || G.level.flags.graveyard | 0 && (mdat.mflags2 & 2) >>> 0 !== 0 && rn2(3)) {
    return FALSE;
  }
  if ((mdat.msize >= 3 || mdat === $sat(G.mons, PM_LIZARD)) && !mon.mcloned || mdat.mlet === S_GOLEM || $sidx(mdat) >= $sidx($sat(G.mons, 328)) && $sidx(mdat) <= $sidx($sat(G.mons, 342)) || (mdat === $sat(G.mons, 308) || mdat === $sat(G.mons, 310) || mdat === $sat(G.mons, 309)) || mon.isshk | 0) {
    return TRUE;
  }
  tmp = 2 + ((mdat.geno & G_FREQ) < 2 ? 1 : 0) + (mdat.msize < 1 ? 1 : 0);
  return (!rn2(tmp) ? 1 : 0) << 24 >> 24;
}

export async function mondied(mdef: struct_monst | null): Promise<void> {
  await mondead(mdef);
  if (!(mdef.mhp < 1)) {
    return;
  }
  if (await corpse_chance(mdef, null, FALSE) && (accessible(mdef.mx, mdef.my) || is_pool(mdef.mx, mdef.my))) {
    await make_corpse(mdef, CORPSTAT_NONE);
  }
}

export async function mongone(mdef: struct_monst | null): Promise<void> {
  mdef.mhp = 0;
  if (mdef.isgd | 0 && !await grddead(mdef)) {
    return;
  }
  if (mdef === G.u.usteed) {
    await dismount_steed(DISMOUNT_GENERIC);
  }
  await unstuck(mdef);
  await mdrop_special_objs(mdef);
  await discard_minvent(mdef);
  await m_detach(mdef, mdef.data);
}

export async function monstone(mdef: struct_monst | null): Promise<void> {
  let otmp = null;
  let obj = null;
  let oldminvent = null;
  let x = mdef.mx;
  let y = mdef.my;
  let wasinside = FALSE;
  if (!await vamp_stone(mdef)) {
    return;
  }
  mdef.mhp = 0;
  await lifesaved_monster(mdef);
  if (!(mdef.mhp < 1)) {
    return;
  }
  mdef.mtrapped = 0;
  if (mdef.data.msize > MZ_TINY || !rn2(2 + ((mdef.data.geno & G_FREQ) > 2 ? 1 : 0))) {
    oldminvent = null;
    while (!!(obj = mdef.minvent)) {
      await obj_extract_self(obj);
      if (obj.owornmask) {
        await update_mon_intrinsics(mdef, obj, FALSE, TRUE);
      }
      await obj_no_longer_held(obj);
      if (obj.owornmask & W_WEP) {
        await setmnotwielded(mdef, obj);
      }
      obj.owornmask = 0;
      if (obj.otyp === BOULDER || obj_resists(obj, 0, 0)) {
        if (await flooreffects(obj, x, y, S("fall"))) {
          continue;
        }
        await place_object(obj, x, y);
      } else {
        if (obj.lamplit) {
          await end_burn(obj, TRUE);
        }
        obj.nobj = oldminvent;
        oldminvent = obj;
      }
    }
    otmp = await mkcorpstat(STATUE, mdef, mdef.data, x, y, CORPSTAT_NONE);
    if (mdef.mextra && mdef.mextra.mname) {
      otmp = await oname(otmp, mdef.mextra.mname);
    }
    while (!!(obj = oldminvent)) {
      oldminvent = obj.nobj;
      obj.nobj = null;
      await add_to_container(otmp, obj);
    }
    if (mdef.data.geno & G_UNIQ) {
      otmp.spe = 1;
    }
    otmp.owt = await weight(otmp) >>> 0;
  } else {
    otmp = await mksobj_at(ROCK, x, y, TRUE, FALSE);
  }
  await stackobj(otmp);
  if ($at2(G.level.locations, x, y).glyph === 382 + (382 + 0)) {
    await unmap_object(x, y);
  }
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    await newsym(x, y);
  }
  if (G.u.uswallow | 0 && G.u.ustuck === mdef) {
    wasinside = TRUE;
  }
  await mondead(mdef);
  if (wasinside) {
    if ((mdef.data.mflags1 & 262144) >>> 0 !== 0) {
      await You(S("%s through an opening in the new %s."), locomotion(G.youmonst.data, S("jump")), await xname(otmp));
    }
  }
}

export async function monkilled(mdef: struct_monst | null, fltxt: Ptr | null, how: number): Promise<void> {
  let be_sad = FALSE;
  if ((mdef.wormno | 0 ? worm_known(mdef) : $rd(G.viz_array.a[G.viz_array.o + mdef.my], mdef.mx) & 2) && fltxt) {
    await pline(S("%s is %s%s%s!"), await Monnam(mdef), (mdef.data.mflags2 & 2) >>> 0 !== 0 || mdef.data === $sat(G.mons, 49) || (mdef.data.mlet === S_GOLEM || mdef.data.mlet === S_VORTEX) ? S("destroyed") : S("killed"), fltxt.a[fltxt.o] ? S(" by the ") : S(""), fltxt);
  } else {
    be_sad = (mdef.mtame !== 0 ? 1 : 0) << 24 >> 24;
  }
  disintegested = (how === AD_DGST || how === -AD_RBRE ? 1 : 0) << 24 >> 24;
  if (disintegested) {
    await mondead(mdef);
  } else {
    await mondied(mdef);
  }
  if (be_sad && mdef.mhp < 1) {
    await You(S("have a sad feeling for a moment, then it passes."));
  }
}

export async function unstuck(mtmp: struct_monst | null): Promise<void> {
  if (G.u.ustuck === mtmp) {
    if (G.u.uswallow) {
      G.u.ux = mtmp.mx;
      G.u.uy = mtmp.my;
      G.u.uswallow = 0;
      G.u.uswldtim = 0;
      if (!!G.uball && G.uchain.where !== OBJ_FLOOR) {
        await placebc();
      }
      G.vision_full_recalc = 1;
      await docrt();
      if (attacktype(mtmp.data, AT_ENGL) && !mtmp.mspec_used) {
        mtmp.mspec_used = rnd(2);
      }
    }
    G.u.ustuck = null;
  }
}

export async function killed(mtmp: struct_monst | null): Promise<void> {
  await xkilled(mtmp, XKILL_GIVEMSG);
}

export async function xkilled(mtmp: struct_monst | null, xkill_flags: number): Promise<void> {
  let $t1: any;
  let $g = 0;
  let tmp = 0;
  let mndx = 0;
  let x = 0;
  let y = 0;
  let mdat = null;
  let otmp = null;
  let t = null;
  let wasinside = 0;
  let burycorpse = 0;
  let nomsg = 0;
  let nocorpse = 0;
  let noconduct = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      x = mtmp.mx;
      y = mtmp.my;
      wasinside = (G.u.uswallow | 0 && G.u.ustuck === mtmp ? 1 : 0) << 24 >> 24;
      burycorpse = FALSE;
      nomsg = ((xkill_flags & XKILL_NOMSG) !== 0 ? 1 : 0) << 24 >> 24;
      nocorpse = ((xkill_flags & XKILL_NOCORPSE) !== 0 ? 1 : 0) << 24 >> 24;
      noconduct = ((xkill_flags & XKILL_NOCONDUCT) !== 0 ? 1 : 0) << 24 >> 24;
      mtmp.mhp = 0;
      if (!noconduct) {
        ++G.u.uconduct.killer;
      }
      if (!nomsg) {
        let namedpet = (mtmp.mextra && mtmp.mextra.mname && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) << 24 >> 24;
        await You(S("%s %s!"), (mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) ? S("destroy") : S("kill"), !(wasinside || ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) ? S("it") : !mtmp.mtame ? await mon_nam(mtmp) : await x_monnam(mtmp, namedpet ? ARTICLE_NONE : ARTICLE_THE, S("poor"), namedpet ? SUPPRESS_SADDLE : 0, FALSE));
      }
      if (mtmp.mtrapped | 0 && !!(t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT)) {
        if (sobj_at(BOULDER, x, y)) {
          nocorpse = TRUE;
        }
        if (m_carrying(mtmp, BOULDER)) {
          burycorpse = TRUE;
        }
      }
      if (mtmp.mtame && !mtmp.isminion) {
        mtmp.mextra.edog.killed_by_u = 1;
      }
      if (wasinside && G.thrownobj && G.thrownobj !== G.uball && G.thrownobj !== G.iflags.returning_missile) {
        await mpickobj(mtmp, G.thrownobj);
        G.thrownobj = null;
      }
      vamp_rise_msg = FALSE;
      disintegested = nocorpse;
      if (G.stoned) {
        await monstone(mtmp);
      } else {
        await mondead(mtmp);
      }
      disintegested = FALSE;
      if (!(mtmp.mhp < 1)) {
        G.stoned = FALSE;
        if (!($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) && !vamp_rise_msg) {
          await pline(S("Maybe not..."));
        }
        return;
      }
      mdat = mtmp.data;
      mndx = await monsndx(mdat);
      if (G.stoned) {
        G.stoned = FALSE;
        { $g = 1; continue $L; }
      }
      if (nocorpse || ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) || G.level.flags.graveyard | 0 && (mdat.mflags2 & 2) >>> 0 !== 0 && rn2(3))) {
        { $g = 1; continue $L; }
      }
      if (mdat === $sat(G.mons, PM_MAIL_DAEMON)) {
        await stackobj(await mksobj_at(SCR_MAIL, x, y, FALSE, FALSE));
      }
      if (accessible(x, y) || is_pool(x, y)) {
        let cadaver = null;
        let otyp = 0;
        if (!rn2(6) && !(G.mvitals[mndx].mvflags & G_NOCORPSE) && (x !== G.u.ux || y !== G.u.uy) && mdat.mlet !== S_KOP && !mtmp.mcloned) {
          otmp = await mkobj(RANDOM_CLASS, TRUE);
          otyp = otmp.otyp;
          if (mdat.msize < MZ_HUMAN && otyp !== FIGURINE && (otmp.owt > 30 || G.objects[otyp].oc_big | 0)) {
            await delobj(otmp);
          } else if (!await flooreffects(otmp, x, y, nomsg ? S("") : S("fall"))) {
            await place_object(otmp, x, y);
            await stackobj(otmp);
          }
        }
        if (!wasinside && await corpse_chance(mtmp, null, FALSE)) {
          cadaver = await make_corpse(mtmp, (burycorpse ? CORPSTAT_BURIED : CORPSTAT_NONE) >>> 0);
          if (burycorpse && cadaver && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2 && !mtmp.minvis && cadaver.where === OBJ_BURIED && !nomsg) {
            await pline(S("%s corpse ends up buried."), s_suffix(await Monnam(mtmp)));
          }
        }
      }
      if (wasinside) {
        await spoteffects(TRUE);
      }
      await newsym(x, y);
    case 1: // cleanup
      if ((mdat.mflags2 & 8) >>> 0 !== 0 && (!((mdat.mflags2 & 1048576) >>> 0 !== 0) && mtmp.malign <= 0) && (mndx < PM_ARCHEOLOGIST || mndx > PM_WIZARD) && G.u.ualign.type !== A_CHAOTIC) {
        ($t1 = G.u.uprops[TELEPAT], $t1.intrinsic = $t1.intrinsic & ~INTRINSIC);
        change_luck(-2);
        await You(S("murderer!"));
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic)) {
          await see_monsters();
        }
      }
      if (mtmp.mpeaceful | 0 && !rn2(2) || mtmp.mtame) {
        change_luck(-1);
      }
      if (mdat.mlet === S_UNICORN && (mdat.mflags2 & 536870912) >>> 0 !== 0 && sgn(G.u.ualign.type) === sgn(mdat.maligntyp)) {
        change_luck(-5);
        await You_feel(S("guilty..."));
      }
      tmp = experience(mtmp, G.mvitals[mndx].died);
      await more_experienced(tmp, 0);
      await newexplevel();
      if (mtmp.m_id === G.quest_status.leader_m_id) {
        adjalign(-(G.u.ualign.record + ((10 + Math.trunc(G.moves / 200) | 0) / 2 | 0)));
        await pline(S("That was %sa bad idea..."), G.u.uevent.qcompleted | 0 ? S("probably ") : S(""));
      } else if (mdat.msound === MS_NEMESIS) {
        adjalign(Math.trunc((10 + Math.trunc(G.moves / 200)) / 4) | 0);
      } else if (mdat.msound === MS_GUARDIAN) {
        adjalign(-(Math.trunc((10 + Math.trunc(G.moves / 200)) / 8) | 0));
        if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await pline(S("That was probably a bad idea..."));
        } else {
          await pline(S("Whoopsie-daisy!"));
        }
      } else if (mtmp.ispriest) {
        adjalign(p_coaligned(mtmp) ? -2 : 2);
        if (p_coaligned(mtmp)) {
          G.u.ublessed = 0;
        }
        if (mdat.maligntyp === A_NONE) {
          adjalign(Math.trunc((10 + Math.trunc(G.moves / 200)) / 4) | 0);
        }
      } else if (mtmp.mtame) {
        adjalign(-15);
        if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await You_hear(S("the rumble of distant thunder..."));
        } else {
          await You_hear(S("the studio audience applaud!"));
        }
      } else if (mtmp.mpeaceful) {
        adjalign(-5);
      }
      adjalign(mtmp.malign);
    }
    break;
  }
}

export async function mon_to_stone(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.data.mlet === S_GOLEM) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s solidifies..."), await Monnam(mtmp));
    }
    if (await newcham(mtmp, $sat(G.mons, PM_STONE_GOLEM), FALSE, FALSE)) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("Now it's %s."), await an(mtmp.data.mname));
      }
    } else {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("... and returns to normal."));
      }
    }
  } else {
    await impossible(S("Can't polystone %s!"), await a_monnam(mtmp));
  }
}

export async function vamp_stone(mtmp: struct_monst | null): Promise<number> {
  if (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) {
    let mndx = mtmp.cham;
    let x = mtmp.mx;
    let y = mtmp.my;
    if (mndx >= LOW_PM && mndx !== await monsndx(mtmp.data) && !(G.mvitals[mndx].mvflags & G_GENOD)) {
      let buf = new Int8Array(256);
      let in_door = ((mtmp.data.mflags1 & 4) >>> 0 !== 0 && closed_door(mtmp.mx, mtmp.my) ? 1 : 0) << 24 >> 24;
      sprintf(P(buf), S("The lapidifying %s %s %s"), await x_monnam(mtmp, ARTICLE_NONE, null, SUPPRESS_SADDLE | SUPPRESS_HALLUCINATION | SUPPRESS_INVISIBLE | SUPPRESS_IT, FALSE), (mtmp.data.mflags1 & 4) >>> 0 !== 0 ? S("coalesces on the") : (mtmp.data.mflags1 & 1) >>> 0 !== 0 ? S("drops to the") : S("writhes on the"), surface(x, y));
      mtmp.mcanmove = 1;
      mtmp.mfrozen = 0;
      if (mtmp.mhpmax <= 0) {
        mtmp.mhpmax = 10;
      }
      mtmp.mhp = mtmp.mhpmax;
      if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
        await expels(mtmp, mtmp.data, FALSE);
      }
      if (in_door) {
        let new_xy = new struct_nhcoord();
        if (await enexto(new_xy, mtmp.mx, mtmp.my, $sat(G.mons, mndx))) {
          await rloc_to(mtmp, new_xy.x, new_xy.y);
        }
      }
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("%s!"), P(buf));
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      }
      await newcham(mtmp, $sat(G.mons, mndx), FALSE, FALSE);
      if (mtmp.data === $sat(G.mons, mndx)) {
        mtmp.cham = NON_PM;
      } else {
        mtmp.cham = mndx << 16 >> 16;
      }
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        await pline(S("%s rises from the %s with renewed agility!"), await Amonnam(mtmp), surface(mtmp.mx, mtmp.my));
      }
      await newsym(mtmp.mx, mtmp.my);
      return FALSE;
    }
  } else if (mtmp.cham >= LOW_PM && G.mons[mtmp.cham].mresists & MR_STONE) {
    mtmp.mcanmove = 1;
    mtmp.mfrozen = 0;
    if (mtmp.mhpmax <= 0) {
      mtmp.mhpmax = 10;
    }
    mtmp.mhp = mtmp.mhpmax;
    await newcham(mtmp, $sat(G.mons, mtmp.cham), FALSE, TRUE);
    await newsym(mtmp.mx, mtmp.my);
    return FALSE;
  }
  return TRUE;
}

export async function m_into_limbo(mtmp: struct_monst | null): Promise<void> {
  let target_lev = ledger_no(G.u.uz);
  let xyloc = MIGR_APPROX_XY;
  mtmp.mspare1 = mtmp.mspare1 | MON_LIMBO;
  await migrate_mon(mtmp, target_lev, xyloc);
}

async function migrate_mon(mtmp: struct_monst | null, target_lev: number, xyloc: number): Promise<void> {
  await unstuck(mtmp);
  await mdrop_special_objs(mtmp);
  await migrate_to_level(mtmp, target_lev, xyloc, null);
  mtmp.mspare1 = mtmp.mspare1 | MON_MIGRATING;
}

function ok_to_obliterate(mtmp: struct_monst | null): number {
  if (mtmp.data === $sat(G.mons, PM_WIZARD_OF_YENDOR) || (mtmp.data === $sat(G.mons, 308) || mtmp.data === $sat(G.mons, 310) || mtmp.data === $sat(G.mons, 309)) || mtmp.mextra && mtmp.mextra.emin || mtmp.mextra && mtmp.mextra.epri || mtmp.mextra && mtmp.mextra.eshk || G.u.ustuck === mtmp || G.u.usteed === mtmp) {
    return FALSE;
  }
  return TRUE;
}

export async function elemental_clog(mon: struct_monst | null): Promise<void> {
  let m_lev = 0;
  let mtmp = null;
  let m1 = null;
  let m2 = null;
  let m3 = null;
  let m4 = null;
  let m5 = null;
  let zm = null;
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    m1 = m2 = m3 = m4 = m5 = zm = null;
    if (!elemental_clog$msgmv || G.moves - elemental_clog$msgmv > 200) {
      if (!elemental_clog$msgmv || rn2(2)) {
        await You_feel(S("besieged."));
      }
      elemental_clog$msgmv = G.moves;
    }
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1 || mtmp === mon) {
        continue;
      }
      if (mtmp.mx === 0 && mtmp.my === 0) {
        continue;
      }
      if (mon_has_amulet(mtmp) || !ok_to_obliterate(mtmp)) {
        continue;
      }
      if (mtmp.data.mlet === S_ELEMENTAL) {
        if (!await is_home_elemental(mtmp.data)) {
          if (!m1) {
            m1 = mtmp;
          }
        } else {
          if (!m2) {
            m2 = mtmp;
          }
        }
      } else {
        if (!mtmp.mtame) {
          if (!m_lev || mtmp.m_lev < m_lev) {
            m_lev = mtmp.m_lev;
            m3 = mtmp;
          } else if (!m4) {
            m4 = mtmp;
          }
        } else {
          if (!m5) {
            m5 = mtmp;
          }
          break;
        }
      }
    }
    mtmp = m1 ? m1 : m2 ? m2 : m3 ? m3 : m4 ? m4 : m5 ? m5 : zm;
    if (mtmp) {
      let mx = mtmp.mx;
      let my = mtmp.my;
      mtmp.mspare1 = mtmp.mspare1 | MON_OBLITERATE;
      await mongone(mtmp);
      await rloc_to(mon, mx, my);
    } else if (!((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level))) {
      let dest = new struct_d_level();
      let target_lev = 0;
      dest.$cp(G.u.uz);
      dest.dlevel = dest.dlevel - 1 << 24 >> 24;
      target_lev = ledger_no(dest);
      mon.mspare1 = mon.mspare1 | MON_ENDGAME_MIGR;
      await migrate_mon(mon, target_lev, MIGR_RANDOM);
    }
  }
}

export async function mnexto(mtmp: struct_monst | null): Promise<void> {
  let mm = new struct_nhcoord();
  let couldspot = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0) << 24 >> 24;
  if (mtmp === G.u.usteed) {
    mtmp.mx = G.u.ux;
    mtmp.my = G.u.uy;
    return;
  }
  if (!await enexto(mm, G.u.ux, G.u.uy, mtmp.data) || !isok(mm.x, mm.y)) {
    await deal_with_overcrowding(mtmp);
    return;
  }
  await rloc_to(mtmp, mm.x, mm.y);
  if (!G.in_mklev && (mtmp.mstrategy & STRAT_APPEARMSG) >>> 0) {
    mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_APPEARMSG >>> 0) >>> 0;
    if (!couldspot && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await pline(S("%s suddenly %s!"), await Amonnam(mtmp), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("appears") : S("arrives"));
    }
  }
  return;
}

async function deal_with_overcrowding(mtmp: struct_monst | null): Promise<void> {
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    do {
      if (await debugcore(S("mon.c"), 1)) {
        await pline(S("overcrowding: elemental_clog on %s"), await m_monnam(mtmp));
      }
    } while (0);
    await elemental_clog(mtmp);
  } else {
    do {
      if (await debugcore(S("mon.c"), 1)) {
        await pline(S("overcrowding: sending %s into limbo"), await m_monnam(mtmp));
      }
    } while (0);
    await m_into_limbo(mtmp);
  }
}

export async function maybe_mnexto(mtmp: struct_monst | null): Promise<void> {
  let mm = new struct_nhcoord();
  let ptr = mtmp.data;
  let diagok = (!($sdiff(ptr, G.mons[0]) === 115) ? 1 : 0) << 24 >> 24;
  let tryct = 20;
  do {
    if (!await enexto(mm, G.u.ux, G.u.uy, ptr)) {
      return;
    }
    if ($rd(G.viz_array.a[G.viz_array.o + mm.y], mm.x) & 1 && (diagok || mm.x === mtmp.mx || mm.y === mtmp.my)) {
      await rloc_to(mtmp, mm.x, mm.y);
      return;
    }
  } while (--tryct > 0);
}

export async function mnearto(mtmp: struct_monst | null, x: number, y: number, move_other: number): Promise<number> {
  let othermon = null;
  let newx = 0;
  let newy = 0;
  let mm = new struct_nhcoord();
  let res = 1;
  if (mtmp.mx === x && mtmp.my === y && (!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) === mtmp) {
    return res;
  }
  if (move_other && !!(othermon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    if (othermon.wormno) {
      await remove_worm(othermon);
    } else {
      G.level.monsters[x][y] = null;
    }
    othermon.mx = othermon.my = 0;
    othermon.mspare1 = othermon.mspare1 | MON_OFFMAP;
  }
  newx = x;
  newy = y;
  if (!goodpos(newx, newy, mtmp, 0)) {
    if (!await enexto(mm, newx, newy, mtmp.data) || !isok(mm.x, mm.y)) {
      if (othermon) {
        await deal_with_overcrowding(othermon);
      }
      return 0;
    }
    newx = mm.x;
    newy = mm.y;
  }
  await rloc_to(mtmp, newx, newy);
  if (move_other && othermon) {
    res = 2;
    if (!await mnearto(othermon, x, y, FALSE)) {
      await deal_with_overcrowding(othermon);
    }
  }
  return res;
}

export async function m_respond(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.data.msound === MS_SHRIEK) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s shrieks."), await Monnam(mtmp));
      await stop_occupation();
    }
    if (!rn2(10)) {
      if (!rn2(13)) {
        await makemon($sat(G.mons, PM_PURPLE_WORM), 0, 0, NO_MM_FLAGS);
      } else {
        await makemon(null, 0, 0, NO_MM_FLAGS);
      }
    }
    await aggravate();
  }
  if (mtmp.data === $sat(G.mons, PM_MEDUSA)) {
    let i = 0;
    for (i = 0; i < NATTK; ++i) {
      if (mtmp.data.mattk[i].aatyp === AT_GAZE) {
        await gazemu(mtmp, $sat(mtmp.data.mattk, i));
        break;
      }
    }
  }
}

export async function setmangry(mtmp: struct_monst | null, via_attack: number): Promise<void> {
  if (via_attack && sengr_at(S("Elbereth"), G.u.ux, G.u.uy, TRUE) && (onscary(G.u.ux, G.u.uy, mtmp) || mtmp.mpeaceful | 0)) {
    await You_feel(S("like a hypocrite."));
    adjalign(G.u.ualign.record > 5 ? -5 : -rnd(5));
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("The engraving beneath you fades."));
    }
    await del_engr_at(G.u.ux, G.u.uy);
  }
  mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
  if (!mtmp.mpeaceful) {
    return;
  }
  if (mtmp.mtame) {
    return;
  }
  mtmp.mpeaceful = 0;
  if (mtmp.ispriest) {
    if (p_coaligned(mtmp)) {
      adjalign(-5);
    } else {
      adjalign(2);
    }
  } else {
    adjalign(-1);
  }
  if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
    if ((mtmp.data.mflags1 & 131072) >>> 0 !== 0 || mtmp.isshk | 0 || mtmp.isgd | 0) {
      await pline(S("%s gets angry!"), await Monnam(mtmp));
    } else if (G.flags.verbose && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await growl(mtmp);
    }
  }
  if (!G.context.mon_moving && mtmp.data === $sat(G.mons, await quest_info(MS_LEADER))) {
    let mon = null;
    let q_guardian = $sat(G.mons, await quest_info(MS_GUARDIAN));
    let got_mad = 0;
    for (mon = G.level.monlist; mon; mon = mon.nmon) {
      if (mon.mhp < 1) {
        continue;
      }
      if (mon.data === q_guardian && mon.mpeaceful | 0) {
        mon.mpeaceful = 0;
        if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
          ++got_mad;
        }
      }
    }
    if (got_mad && !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
      let who = q_guardian.mname;
      if (got_mad > 1) {
        who = await makeplural(who);
      }
      await pline_The(S("%s %s to be angry too..."), who, vtense(who, S("appear")));
    }
  }
  if (!G.context.mon_moving) {
    let mon = null;
    let mndx = await monsndx(mtmp.data);
    for (mon = G.level.monlist; mon; mon = mon.nmon) {
      if (mon.mhp < 1) {
        continue;
      }
      if (mon === mtmp) {
        continue;
      }
      if (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && mon.mpeaceful | 0 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 && !mon.msleeping && mon.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (mon.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1)) {
        let exclaimed = FALSE;
        if ((mon.data.mflags1 & 131072) >>> 0 !== 0 || mon.isshk | 0 || mon.ispriest | 0) {
          if (mon.data === $sat(G.mons, 278) || mon.data === $sat(G.mons, 279)) {
            await verbalize(S("Halt!  You're under arrest!"));
            await angry_guards(!!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0);
          } else {
            if (!rn2(5)) {
              await verbalize(S("%s"), setmangry$Exclam[mon.m_id % ((Math.trunc(40 / 8) | 0) >>> 0)]);
              exclaimed = TRUE;
            }
            if (mon.isshk | 0 || mon.ispriest | 0) {
              continue;
            }
            if (mon.data.mlevel < rn2(10)) {
              await monflee(mon, rn2(50) + 25, TRUE, !exclaimed ? 1 : 0);
              exclaimed = TRUE;
            }
            if (mon.mtame) {
            } else {
              mon.mpeaceful = 0;
              adjalign(-1);
              if (!exclaimed) {
                await pline(S("%s gets angry!"), await Monnam(mon));
              }
            }
          }
        } else if (mon.data.mlet === mtmp.data.mlet && big_little_match(mndx, await monsndx(mon.data)) && !rn2(3)) {
          if (!rn2(4)) {
            await growl(mon);
            exclaimed = TRUE;
          }
          if (rn2(6)) {
            await monflee(mon, rn2(25) + 15, TRUE, !exclaimed ? 1 : 0);
          }
        }
      }
    }
  }
}

export async function wakeup(mtmp: struct_monst | null, via_attack: number): Promise<void> {
  mtmp.msleeping = 0;
  if (mtmp.m_ap_type & 7) {
    await seemimic(mtmp);
  } else if (G.context.forcefight && !G.context.mon_moving && mtmp.mundetected | 0) {
    mtmp.mundetected = 0;
    await newsym(mtmp.mx, mtmp.my);
  }
  await finish_meating(mtmp);
  if (via_attack) {
    await setmangry(mtmp, TRUE);
  }
}

export function wake_nearby(): void {
  wake_nearto(G.u.ux, G.u.uy, G.u.ulevel * 20);
}

export function wake_nearto(x: number, y: number, distance: number): void {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (distance === 0 || dist2(mtmp.mx, mtmp.my, x, y) < distance) {
      mtmp.msleeping = 0;
      if (!(mtmp.data.geno & G_UNIQ)) {
        mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
      }
      if (G.context.mon_moving) {
        continue;
      }
      if (mtmp.mtame) {
        if (!mtmp.isminion) {
          mtmp.mextra.edog.whistletime = G.moves;
        }
        memset(mtmp.mtrack[0], 0, 8);
      }
    }
  }
}

export async function seemimic(mtmp: struct_monst | null): Promise<void> {
  let is_blocker_appear = ((mtmp.m_ap_type & 7) === M_AP_OBJECT && mtmp.mappearance === 448 || (mtmp.m_ap_type & 7) === M_AP_FURNITURE && (mtmp.mappearance === S_hcdoor || mtmp.mappearance === S_vcdoor || mtmp.mappearance < S_ndoor || mtmp.mappearance === S_tree) ? 1 : 0) << 24 >> 24;
  if (mtmp.mextra && mtmp.mextra.mcorpsenm !== -1) {
    freemcorpsenm(mtmp);
  }
  mtmp.m_ap_type = M_AP_NOTHING;
  mtmp.mappearance = 0;
  if (is_blocker_appear && !does_block(mtmp.mx, mtmp.my, $sat(G.level.locations[mtmp.mx], mtmp.my))) {
    unblock_point(mtmp.mx, mtmp.my);
  }
  await newsym(mtmp.mx, mtmp.my);
}

export async function rescham(): Promise<void> {
  let mtmp = null;
  let mcham = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    mcham = mtmp.cham;
    if (mcham >= LOW_PM) {
      await newcham(mtmp, $sat(G.mons, mcham), FALSE, FALSE);
      mtmp.cham = NON_PM;
    }
    if ((mtmp.data.mflags2 & 4) >>> 0 !== 0 && mtmp.data.mlet !== S_HUMAN) {
      await new_were(mtmp);
    }
    if (mtmp.m_ap_type & 7 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await seemimic(mtmp);
      mtmp.msleeping = 1;
    }
  }
}

export async function restartcham(): Promise<void> {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (!mtmp.mcan) {
      mtmp.cham = pm_to_cham(await monsndx(mtmp.data)) << 16 >> 16;
    }
    if (mtmp.data.mlet === S_MIMIC && mtmp.msleeping | 0 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await set_mimic_sym(mtmp);
      await newsym(mtmp.mx, mtmp.my);
    }
  }
}

export async function restore_cham(mon: struct_monst | null): Promise<void> {
  let mcham = 0;
  if (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic) {
    mcham = mon.cham;
    if (mcham >= LOW_PM) {
      mon.cham = NON_PM;
      await newcham(mon, $sat(G.mons, mcham), FALSE, FALSE);
    } else if ((mon.data.mflags2 & 4) >>> 0 !== 0 && !((mon.data.mflags2 & 8) >>> 0 !== 0)) {
      await new_were(mon);
    }
  } else if (mon.cham === NON_PM) {
    mon.cham = pm_to_cham(await monsndx(mon.data)) << 16 >> 16;
  }
}

async function restrap(mtmp: struct_monst | null): Promise<number> {
  let t = null;
  if (mtmp.mcan | 0 || mtmp.m_ap_type & 7 || $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || rn2(3) || mtmp === G.u.ustuck || mtmp.mtrapped | 0 && !!(t = t_at(mtmp.mx, mtmp.my)) && !((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 2) {
    return FALSE;
  }
  if (mtmp.data.mlet === S_MIMIC) {
    await set_mimic_sym(mtmp);
    return TRUE;
  } else if ($at2(G.level.locations, mtmp.mx, mtmp.my).typ === ROOM) {
    mtmp.mundetected = 1;
    return TRUE;
  }
  return FALSE;
}

export function hideunder(mtmp: struct_monst | null): number {
  let t = null;
  let undetected = FALSE;
  let is_u = (mtmp === G.youmonst ? 1 : 0) << 24 >> 24;
  let x = (is_u ? G.u.ux : mtmp.mx) << 24 >> 24;
  let y = (is_u ? G.u.uy : mtmp.my) << 24 >> 24;
  if (mtmp === G.u.ustuck) {
    ;
  } else if (is_u ? G.u.utrap && G.u.utraptype !== TT_PIT ? 1 : 0 : mtmp.mtrapped | 0 && !!(t = t_at(x, y)) && !((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT) ? 1 : 0) {
    ;
  } else if (mtmp.data.mlet === S_EEL) {
    undetected = (is_pool(x, y) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
  } else if ((mtmp.data.mflags1 & 128) >>> 0 !== 0 && !!G.level.objects[x][y]) {
    let otmp = G.level.objects[x][y];
    if (otmp.v.v_nexthere || otmp.otyp !== CORPSE || (mtmp === G.youmonst ? G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0 ? 1 : 0) || !($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9))) {
      undetected = TRUE;
    }
  }
  if (is_u) {
    G.u.uundetected = (undetected >>> 0) & 1;
  } else {
    mtmp.mundetected = (undetected >>> 0) & 1;
  }
  return undetected;
}

export async function hide_monst(mon: struct_monst | null): Promise<void> {
  let $t1: any, $t2: any;
  let hider_under = ((mon.data.mflags1 & 128) >>> 0 !== 0 || mon.data.mlet === S_EEL ? 1 : 0) << 24 >> 24;
  if (((mon.data.mflags1 & 256) >>> 0 !== 0 || hider_under) && !(mon.mundetected | 0 || mon.m_ap_type & 7)) {
    let x = mon.mx;
    let y = mon.my;
    let save_viz = $rd(G.viz_array.a[G.viz_array.o + y], x);
    ($t1 = G.viz_array.a[G.viz_array.o + y], $t2 = x, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] & ~(IN_SIGHT | COULD_SEE)) << 24 >> 24);
    if ((mon.data.mflags1 & 256) >>> 0 !== 0) {
      await restrap(mon);
    }
    if (mon.data.mlet === S_MIMIC && !(mon.m_ap_type & 7)) {
      await restrap(mon);
    }
    if (hider_under) {
      hideunder(mon);
    }
    $wr(G.viz_array.a[G.viz_array.o + y], x, save_viz);
  }
}

export async function mon_animal_list(construct: number): Promise<void> {
  if (construct) {
    let animal_temp = new Int16Array(327);
    let i = 0;
    let n = 0;
    for (n = 0, i = LOW_PM; i < SPECIAL_PM; ++i) {
      if (($sat(G.mons, i).mflags1 & 262144) >>> 0 !== 0) {
        animal_temp[n++] = i << 16 >> 16;
      }
    }
    animal_list = P(new Int16Array(($u64(n) * 2 >>> 0) / 2));
    memcpy(animal_list, P(animal_temp), $u64(n) * 2);
    animal_list_count = n;
  } else {
    if (animal_list) {
      free(animal_list), animal_list = null;
    }
    animal_list_count = 0;
  }
}

async function pick_animal(): Promise<number> {
  let res = 0;
  if (!animal_list) {
    await mon_animal_list(TRUE);
  }
  res = animal_list.a[animal_list.o + rn2(animal_list_count)];
  if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) && !isupper(G.mons[res].mlet & 0xff)) {
    res = animal_list.a[animal_list.o + rn2(animal_list_count)];
  }
  return res;
}

export async function decide_to_shapeshift(mon: struct_monst | null, shiftflags: number): Promise<void> {
  let ptr = null;
  let mndx = 0;
  let was_female = mon.female;
  let msg = FALSE;
  let dochng = FALSE;
  if (shiftflags & SHIFT_MSG || shiftflags & SHIFT_SEENMSG && (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
    msg = TRUE;
  }
  if (!(mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
    if (!rn2(6)) {
      dochng = TRUE;
    }
  } else {
    if (mon.data.mlet !== S_VAMPIRE) {
      if (mon.mhp <= ((mon.mhpmax + 5) / 6 | 0) && rn2(4) && mon.cham >= LOW_PM) {
        ptr = $sat(G.mons, mon.cham);
        dochng = TRUE;
      } else if (mon.data === $sat(G.mons, PM_FOG_CLOUD) && mon.mhp === mon.mhpmax && !rn2(4) && (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM, BOLT_LIM))) {
        mndx = pickvampshape(mon);
        if (mndx >= LOW_PM) {
          ptr = $sat(G.mons, mndx);
          dochng = (ptr !== mon.data ? 1 : 0) << 24 >> 24;
        }
      }
    } else {
      if (mon.mhp >= (9 * mon.mhpmax / 10 | 0) && !rn2(6) && (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) || dist2(mon.mx, mon.my, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM, BOLT_LIM))) {
        dochng = TRUE;
      }
    }
  }
  if (dochng) {
    if (await newcham(mon, ptr, FALSE, msg) && (mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
      ptr = mon.data;
      if (!((ptr.mflags2 & 65536) >>> 0 !== 0) && !((ptr.mflags2 & 131072) >>> 0 !== 0) && !((ptr.mflags2 & 262144) >>> 0 !== 0)) {
        mon.female = (was_female) & 1;
      }
    }
  }
}

function pickvampshape(mon: struct_monst | null): number {
  let mndx = mon.cham;
  let wolfchance = 10;
  let uppercase_only = ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? 1 : 0) << 24 >> 24;
  switch (mndx) {
  case 224:
    if (mon_has_special(mon)) {
      break;
    }
    wolfchance = 3;
  case 223:
    if (!rn2(wolfchance) && !uppercase_only) {
      mndx = PM_WOLF;
      break;
    }
  case 222:
    mndx = !rn2(4) && !uppercase_only ? PM_FOG_CLOUD : PM_VAMPIRE_BAT;
    break;
  }
  return mndx;
}

function isspecmon(mon: struct_monst | null): number {
  return (mon.isshk | 0 || mon.ispriest | 0 || mon.isgd | 0 || mon.m_id === G.quest_status.leader_m_id ? 1 : 0) << 24 >> 24;
}

function validspecmon(mon: struct_monst | null, mndx: number): number {
  if (mndx === NON_PM) {
    return TRUE;
  }
  if (!accept_newcham_form(mon, mndx)) {
    return FALSE;
  }
  if (isspecmon(mon)) {
    let ptr = $sat(G.mons, mndx);
    if ((ptr.mflags1 & 2048) >>> 0 !== 0 || !((ptr.mflags1 & 32768) >>> 0 === 0)) {
      return FALSE;
    }
  }
  return TRUE;
}

export function validvamp(mon: struct_monst | null, mndx_p: Ptr | null, monclass: number): number {
  if (!(mon.cham === 222 || mon.cham === 223 || mon.cham === 224)) {
    return validspecmon(mon, mndx_p.a[mndx_p.o]);
  }
  if (mon.cham === PM_VLAD_THE_IMPALER && mon_has_special(mon)) {
    mndx_p.a[mndx_p.o] = PM_VLAD_THE_IMPALER;
    return TRUE;
  }
  if (mndx_p.a[mndx_p.o] >= LOW_PM && ($sat(G.mons, mndx_p.a[mndx_p.o]).mflags2 & 16384) >>> 0 !== 0) {
    mndx_p.a[mndx_p.o] = mon.cham;
    return TRUE;
  }
  if (mndx_p.a[mndx_p.o] === PM_WOLF) {
    return (mon.cham !== PM_VAMPIRE ? 1 : 0) << 24 >> 24;
  }
  if (mndx_p.a[mndx_p.o] === PM_FOG_CLOUD || mndx_p.a[mndx_p.o] === PM_VAMPIRE_BAT) {
    return TRUE;
  }
  switch (monclass) {
  case S_VAMPIRE:
    mndx_p.a[mndx_p.o] = mon.cham;
    break;
  case S_BAT:
    mndx_p.a[mndx_p.o] = PM_VAMPIRE_BAT;
    break;
  case S_VORTEX:
    mndx_p.a[mndx_p.o] = PM_FOG_CLOUD;
    break;
  case S_DOG:
    if (mon.cham !== PM_VAMPIRE) {
      mndx_p.a[mndx_p.o] = PM_WOLF;
      break;
    }
  default:
    mndx_p.a[mndx_p.o] = NON_PM;
    break;
  }
  return (mndx_p.a[mndx_p.o] !== NON_PM ? 1 : 0) << 24 >> 24;
}

export async function select_newcham_form(mon: struct_monst | null): Promise<number> {
  const mndx = new Int32Array(1);
  mndx[0] = NON_PM;
  let tryct = 0;
  switch (mon.cham) {
  case 298:
    if (rn2(7)) {
      mndx[0] = pick_nasty();
    }
    break;
  case 266:
    if (!rn2(7)) {
      mndx[0] = pick_nasty();
    } else if (rn2(3)) {
      mndx[0] = rn2(342 - 328 + 1) + 328;
    } else if (!rn2(3)) {
      mndx[0] = rn2(381 - 368 + 1) + 368;
      if (mndx[0] === G.urole.guardnum) {
        mndx[0] = NON_PM;
      }
    } else {
      tryct = 5;
      do {
        mndx[0] = rn2(327 - (-1 + 1)) + (-1 + 1);
        if (($sat(G.mons, mndx[0]).mflags1 & 131072) >>> 0 !== 0 && ($sat(G.mons, mndx[0]).mflags2 & 1) >>> 0 === 0) {
          break;
        }
      } while (--tryct > 0);
      if (!tryct) {
        mndx[0] = NON_PM;
      }
    }
    break;
  case 324:
    if (!rn2(3)) {
      mndx[0] = await pick_animal();
    }
    break;
  case 224:
  case 223:
  case 222:
    mndx[0] = pickvampshape(mon);
    break;
  case -1:
    {
      let m_armr = await which_armor(mon, W_ARM);
      if (m_armr && (m_armr.otyp >= 91 && m_armr.otyp <= 99)) {
        mndx[0] = $sdiff($sat(G.mons, 141 + m_armr.otyp - 91), G.mons[0]) | 0;
      } else if (m_armr && (m_armr.otyp >= 82 && m_armr.otyp <= 90)) {
        mndx[0] = $sdiff($sat(G.mons, 141 + m_armr.otyp - 82), G.mons[0]) | 0;
      }
    }
    break;
  }
  if (G.flags.debug && G.iflags.mon_polycontrol) {
    let pprompt = new Int8Array(256);
    let parttwo = new Int8Array(128);
    let buf = new Int8Array(256);
    let monclass = 0;
    let len = 0;
    sprintf(P(pprompt), S("Change %s"), await noit_mon_nam(mon));
    sprintf(P(parttwo), S(" @ %s into what?"), coord_desc(mon.mx, mon.my, P(buf), G.iflags.getpos_coords !== GPCOORDS_NONE ? G.iflags.getpos_coords : GPCOORDS_MAP));
    if ((len = (strlen(P(pprompt)) | 0) + (strlen(P(parttwo)) | 0)) >= QBUFSZ) {
      $wr(eos(P(pprompt)).add(-(len - (QBUFSZ - 1))), 0, 0);
    }
    strcat(P(pprompt), P(parttwo));
    buf[0] = 0;
    tryct = TRYLIMIT;
    do {
      if (tryct === TRYLIMIT - 1) {
        if (strlen(P(pprompt)) + 17 - 1 < QBUFSZ) {
          strcpy(eos(P(pprompt)).add(-1), S(" kind of monster?"));
        }
      }
      monclass = 0;
      await G.windowprocs.win_getlin(P(pprompt), P(buf));
      mungspaces(P(buf));
      if ($rd(P(buf)) === 27) {
        break;
      }
      if (!strcmp(P(buf), S("*")) || !strncmpi(P(buf), S("random"), -1)) {
        mndx[0] = NON_PM;
        break;
      }
      mndx[0] = name_to_mon(P(buf));
      if (mndx[0] === NON_PM) {
        monclass = await name_to_monclass(P(buf), P(mndx, 0));
        if (monclass && mndx[0] === NON_PM) {
          mndx[0] = mkclass_poly(monclass);
        }
      }
      if (mndx[0] >= LOW_PM) {
        if (validvamp(mon, P(mndx, 0), monclass)) {
          break;
        }
        mndx[0] = NON_PM;
      }
      await pline(S("It can't become that."));
    } while (--tryct > 0);
    if (!tryct) {
      await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
    }
    if ((mon.cham === 222 || mon.cham === 223 || mon.cham === 224) && !validvamp(mon, P(mndx, 0), monclass)) {
      mndx[0] = pickvampshape(mon);
    }
  }
  if (mndx[0] === NON_PM) {
    tryct = 50;
    do {
      mndx[0] = rn2(327 - (-1 + 1)) + (-1 + 1);
    } while (--tryct > 0 && !validspecmon(mon, mndx[0]) && (tryct > 40 && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) && !isupper(G.mons[mndx[0]].mlet & 0xff)));
  }
  return mndx[0];
}

function accept_newcham_form(mon: struct_monst | null, mndx: number): struct_permonst | null {
  let mdat = null;
  if (mndx === NON_PM) {
    return null;
  }
  mdat = $sat(G.mons, mndx);
  if ((G.mvitals[mndx].mvflags & G_GENOD) !== 0) {
    return null;
  }
  if (mdat === $sat(G.mons, 71) || mdat === $sat(G.mons, 166) || mdat === $sat(G.mons, 260) || mdat === $sat(G.mons, 256)) {
    return null;
  }
  if ($sidx(mdat) >= $sidx($sat(G.mons, 328)) && $sidx(mdat) <= $sidx($sat(G.mons, 342))) {
    return mdat;
  }
  if ((mdat.mflags2 & 16384) >>> 0 !== 0 && mon.cham >= LOW_PM && mdat === $sat(G.mons, mon.cham)) {
    return mdat;
  }
  return (mdat.mflags2 & 1) >>> 0 === 0 ? mdat : null;
}

export function mgender_from_permonst(mtmp: struct_monst | null, mdat: struct_permonst | null): void {
  if ((mdat.mflags2 & 65536) >>> 0 !== 0) {
    if (mtmp.female) {
      mtmp.female = (FALSE) & 1;
    }
  } else if ((mdat.mflags2 & 131072) >>> 0 !== 0) {
    if (!mtmp.female) {
      mtmp.female = (TRUE) & 1;
    }
  } else if (!((mdat.mflags2 & 262144) >>> 0 !== 0)) {
    if (!rn2(10)) {
      mtmp.female = ((!mtmp.female ? 1 : 0) >>> 0) & 1;
    }
  }
}

export async function newcham(mtmp: struct_monst | null, mdat: struct_permonst | null, polyspot: number, msg: number): Promise<number> {
  let hpn = 0;
  let hpd = 0;
  let mndx = 0;
  let tryct = 0;
  let olddata = mtmp.data;
  let p = null;
  let oldname = new Int8Array(256);
  let l_oldname = new Int8Array(256);
  let newname = new Int8Array(256);
  if (mtmp.cham === NON_PM) {
    if (olddata === $sat(G.mons, 308) || olddata === $sat(G.mons, 310) || olddata === $sat(G.mons, 309)) {
      return 0;
    }
    if (mbirth_limit(await monsndx(olddata)) < MAXMONNO) {
      return 0;
    }
    if (mtmp.mcan | 0 && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
      mtmp.cham = pm_to_cham(await monsndx(mtmp.data)) << 16 >> 16;
      if (mtmp.cham !== NON_PM) {
        mtmp.mcan = 0;
      }
    }
  }
  if (msg) {
    strcpy(P(oldname), await x_monnam(mtmp, ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE));
    oldname[0] = highc(oldname[0]);
  }
  strcpy(P(l_oldname), await x_monnam(mtmp, ARTICLE_THE, null, mtmp.mextra && mtmp.mextra.mname ? SUPPRESS_SADDLE : 0, FALSE));
  if (!mdat) {
    tryct = 20;
    do {
      mndx = await select_newcham_form(mtmp);
      mdat = accept_newcham_form(mtmp, mndx);
      if (tryct > 15 && ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) && mdat && !isupper(mdat.mlet & 0xff)) {
        mdat = null;
      }
      if (mdat) {
        break;
      }
    } while (--tryct > 0);
    if (!tryct) {
      return 0;
    }
  } else if (G.mvitals[await monsndx(mdat)].mvflags & G_GENOD) {
    return 0;
  }
  if (mdat === olddata) {
    return 0;
  }
  mgender_from_permonst(mtmp, mdat);
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum && ($sidx(olddata) >= $sidx($sat(G.mons, 328)) && $sidx(olddata) <= $sidx($sat(G.mons, 342))) && (mtmp.mextra && mtmp.mextra.mname) && !!(p = strstr(mtmp.mextra.mname, S(" the ")))) {
    p.a[p.o] = 0;
  }
  if (mtmp.wormno) {
    await wormgone(mtmp);
    await place_monster(mtmp, mtmp.mx, mtmp.my);
  }
  if (mtmp.m_ap_type & 7 && mdat.mlet !== S_MIMIC) {
    await seemimic(mtmp);
  }
  hpn = mtmp.mhp;
  hpd = mtmp.mhpmax;
  await newmonhp(mtmp, await monsndx(mdat));
  mtmp.mhp = Math.trunc(hpn * mtmp.mhp / hpd) | 0;
  if (mtmp.mhp < 0 || mtmp.mhp > mtmp.mhpmax) {
    mtmp.mhp = mtmp.mhpmax;
  }
  if (!mtmp.mhp) {
    mtmp.mhp = 1;
  }
  await set_mon_data(mtmp, mdat);
  if (mtmp.mleashed | 0 && !leashable(mtmp)) {
    await m_unleash(mtmp, TRUE);
  }
  if ((olddata.mlet === S_LIGHT || olddata === $sat(G.mons, 30) || olddata === $sat(G.mons, 31) || olddata === $sat(G.mons, 110) ? 1 : olddata === $sat(G.mons, 152) ? 1 : 0) !== (mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0)) {
    if (olddata.mlet === S_LIGHT || olddata === $sat(G.mons, 30) || olddata === $sat(G.mons, 31) || olddata === $sat(G.mons, 110) ? 1 : olddata === $sat(G.mons, 152) ? 1 : 0) {
      await del_light_source(LS_MONSTER, monst_to_any(mtmp));
    }
    if (mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0) {
      await new_light_source(mtmp.mx, mtmp.my, mtmp.data.mlet === S_LIGHT || mtmp.data === $sat(G.mons, 30) || mtmp.data === $sat(G.mons, 31) || mtmp.data === $sat(G.mons, 110) ? 1 : mtmp.data === $sat(G.mons, 152) ? 1 : 0, LS_MONSTER, monst_to_any(mtmp));
    }
  }
  if (!mtmp.perminvis || (olddata === $sat(G.mons, 150) || olddata === $sat(G.mons, 118))) {
    mtmp.perminvis = ((mdat === $sat(G.mons, 150) || mdat === $sat(G.mons, 118) ? 1 : 0) >>> 0) & 1;
  }
  mtmp.minvis = ((mtmp.invis_blkd | 0 ? 0 : mtmp.perminvis | 0) >>> 0) & 1;
  if (mtmp.mundetected) {
    hideunder(mtmp);
  }
  if (G.u.ustuck === mtmp) {
    if (G.u.uswallow) {
      if (!attacktype(mdat, AT_ENGL)) {
        if (!(mdat.mlet === S_GHOST) && !((mdat.mflags1 & 4) >>> 0 !== 0) && !(mdat.mlet === S_VORTEX || mdat === $sat(G.mons, 151)) && mdat !== $sat(G.mons, PM_YELLOW_LIGHT)) {
          let msgtrail = new Int8Array(256);
          if (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) {
            sprintf(P(msgtrail), S(" which was a shapeshifted %s"), await noname_monnam(mtmp, ARTICLE_NONE));
          } else if ((mdat.mflags1 & 262144) >>> 0 !== 0) {
            strcpy(P(msgtrail), S("'s stomach"));
          } else {
            msgtrail[0] = 0;
          }
          await You(S("%s %s%s!"), (olddata.mflags1 & 4) >>> 0 !== 0 || (olddata.mlet === S_VORTEX || olddata === $sat(G.mons, 151)) ? S("emerge from") : S("break out of"), P(l_oldname), P(msgtrail));
          msg = FALSE;
          mtmp.mhp = 1;
        }
        await expels(mtmp, olddata, FALSE);
      } else {
        await swallowed(0);
      }
    } else if (!sticks(mdat) && !sticks(G.youmonst.data)) {
      await unstuck(mtmp);
    }
  }
  if (mdat === $sat(G.mons, PM_LONG_WORM) && ((mtmp.wormno = (get_wormno() >>> 0) & 31) | 0) !== 0) {
    await initworm(mtmp, rn2(5));
    await place_worm_tail_randomly(mtmp, mtmp.mx, mtmp.my);
  }
  await newsym(mtmp.mx, mtmp.my);
  if (msg) {
    strcpy(P(newname), await noname_monnam(mtmp, ARTICLE_A));
    if (!strncmpi(P(newname), S("it"), -1)) {
      if (!!strncmpi(P(oldname), S("it"), -1)) {
        await pline(S("%s disappears!"), P(oldname));
      }
      await usmellmon(mdat);
    } else {
      if (!strncmpi(P(oldname), S("it"), -1)) {
        await pline(S("%s appears!"), upstart(P(newname)));
      } else {
        await pline(S("%s turns into %s!"), P(oldname), P(newname));
      }
    }
  }
  if (mtmp.cham === NON_PM && mdat.mlet === S_VAMPIRE && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
    mtmp.cham = pm_to_cham(await monsndx(mdat)) << 16 >> 16;
  }
  await possibly_unwield(mtmp, polyspot);
  await mon_break_armor(mtmp, polyspot);
  if (!(mtmp.misc_worn_check & W_ARMG)) {
    await mselftouch(mtmp, S("No longer petrify-resistant, "), !G.context.mon_moving ? 1 : 0);
  }
  await m_dowear(mtmp, FALSE);
  if (mtmp.minvent && !((mdat.mflags2 & 134217728) >>> 0 !== 0)) {
    let otmp = null;
    let otmp2 = null;
    for (otmp = mtmp.minvent; otmp; otmp = otmp2) {
      otmp2 = otmp.nobj;
      if (otmp.otyp === BOULDER) {
        if (polyspot) {
          bypass_obj(otmp);
        }
        await obj_extract_self(otmp);
        if (await flooreffects(otmp, mtmp.mx, mtmp.my, S(""))) {
          continue;
        }
        await place_object(otmp, mtmp.mx, mtmp.my);
      }
    }
  }
  return 1;
}

export function can_be_hatched(mnum: number): number {
  if (mnum === PM_SCORPIUS) {
    mnum = PM_SCORPION;
  }
  mnum = little_to_big(mnum);
  if (mnum === PM_KILLER_BEE || mnum === PM_GARGOYLE || ($sat(G.mons, mnum).mflags1 & 4194304) >>> 0 !== 0 && (!rn2(77) || mnum !== PM_QUEEN_BEE && mnum !== PM_WINGED_GARGOYLE)) {
    return mnum;
  }
  return NON_PM;
}

export function egg_type_from_parent(mnum: number, force_ordinary: number): number {
  if (force_ordinary || !!rn2(77)) {
    if (mnum === PM_QUEEN_BEE) {
      mnum = PM_KILLER_BEE;
    } else if (mnum === PM_WINGED_GARGOYLE) {
      mnum = PM_GARGOYLE;
    }
  }
  return mnum;
}

export function dead_species(m_idx: number, egg: number): number {
  let alt_idx = 0;
  if (m_idx < LOW_PM) {
    return TRUE;
  }
  alt_idx = egg ? big_to_little(m_idx) : m_idx;
  return ((G.mvitals[m_idx].mvflags & G_GENOD) !== 0 || (G.mvitals[alt_idx].mvflags & G_GENOD) !== 0 ? 1 : 0) << 24 >> 24;
}

async function kill_eggs(obj_list: struct_obj | null): Promise<void> {
  let otmp = null;
  for (otmp = obj_list; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === EGG) {
      if (dead_species(otmp.corpsenm, TRUE)) {
        await kill_egg(otmp);
      }
    } else if (!!otmp.cobj) {
      await kill_eggs(otmp.cobj);
    }
  }
}

export async function kill_genocided_monsters(): Promise<void> {
  let mtmp = null;
  let mtmp2 = null;
  let kill_cham = 0;
  let mndx = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
    mtmp2 = mtmp.nmon;
    if (mtmp.mhp < 1) {
      continue;
    }
    mndx = await monsndx(mtmp.data);
    kill_cham = (mtmp.cham >= LOW_PM && G.mvitals[mtmp.cham].mvflags & G_GENOD ? 1 : 0) << 24 >> 24;
    if (G.mvitals[mndx].mvflags & G_GENOD || kill_cham) {
      if (mtmp.cham >= LOW_PM && !kill_cham) {
        await newcham(mtmp, null, FALSE, FALSE);
      } else {
        await mondead(mtmp);
      }
    }
    if (mtmp.minvent) {
      await kill_eggs(mtmp.minvent);
    }
  }
  await kill_eggs(G.invent);
  await kill_eggs(G.level.objlist);
  await kill_eggs(G.migrating_objs);
  await kill_eggs(G.level.buriedobjlist);
}

export async function golemeffects(mon: struct_monst | null, damtype: number, dam: number): Promise<void> {
  let heal = 0;
  let slow = 0;
  if (mon.data === $sat(G.mons, PM_FLESH_GOLEM)) {
    if (damtype === AD_ELEC) {
      heal = (dam + 5) / 6 | 0;
    } else if (damtype === AD_FIRE || damtype === AD_COLD) {
      slow = 1;
    }
  } else if (mon.data === $sat(G.mons, PM_IRON_GOLEM)) {
    if (damtype === AD_ELEC) {
      slow = 1;
    } else if (damtype === AD_FIRE) {
      heal = dam;
    }
  } else {
    return;
  }
  if (slow) {
    if ((mon.mspeed | 0) !== MSLOW) {
      await mon_adjust_speed(mon, -1, null);
    }
  }
  if (heal) {
    if (mon.mhp < mon.mhpmax) {
      mon.mhp += heal;
      if (mon.mhp > mon.mhpmax) {
        mon.mhp = mon.mhpmax;
      }
      if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
        await pline(S("%s seems healthier."), await Monnam(mon));
      }
    }
  }
}

export async function angry_guards(silent: number): Promise<number> {
  let mtmp = null;
  let ct = 0;
  let nct = 0;
  let sct = 0;
  let slct = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if ((mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) && mtmp.mpeaceful | 0) {
      ++ct;
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && mtmp.mcanmove | 0) {
        if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) === 2) {
          ++nct;
        } else {
          ++sct;
        }
      }
      if (mtmp.msleeping | 0 || mtmp.mfrozen | 0) {
        ++slct;
        mtmp.msleeping = (mtmp.mfrozen = 0) & 1;
      }
      mtmp.mpeaceful = 0;
    }
  }
  if (ct) {
    if (!silent) {
      if (slct) {
        await pline_The(S("guard%s wake%s up!"), slct > 1 ? S("s") : S(""), slct === 1 ? S("s") : S(""));
      }
      if (nct || sct) {
        if (nct) {
          await pline_The(S("guard%s get%s angry!"), nct === 1 ? S("") : S("s"), nct === 1 ? S("s") : S(""));
        } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await You_see(S("%sangry guard%s approaching!"), sct === 1 ? S("an ") : S(""), sct > 1 ? S("s") : S(""));
        }
      } else {
        await You_hear(S("the shrill sound of a guard's whistle."));
      }
    }
    return TRUE;
  }
  return FALSE;
}

export function pacify_guards(): void {
  let mtmp = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) {
      mtmp.mpeaceful = 1;
    }
  }
}

export async function mimic_hit_msg(mtmp: struct_monst | null, otyp: number): Promise<void> {
  let ap = mtmp.mappearance << 16 >> 16;
  switch (mtmp.m_ap_type & 7) {
  case M_AP_NOTHING:
  case M_AP_FURNITURE:
  case M_AP_MONSTER:
    break;
  case M_AP_OBJECT:
    if (otyp === SPE_HEALING || otyp === SPE_EXTRA_HEALING) {
      await pline(S("%s seems a more vivid %s than before."), await The(await simple_typename(ap)), G.c_obj_colors[G.objects[ap].oc_color]);
    }
    break;
  }
}

export async function usmellmon(mdat: struct_permonst | null): Promise<number> {
  let mndx = 0;
  let nonspecific = FALSE;
  let msg_given = FALSE;
  if (mdat) {
    if (!olfaction(G.youmonst.data)) {
      return FALSE;
    }
    mndx = await monsndx(mdat);
    switch (mndx) {
    case 80:
    case 174:
      await You(S("notice a bovine smell."));
      msg_given = TRUE;
      break;
    case 330:
    case 331:
    case 329:
    case 370:
      await You(S("smell body odor."));
      msg_given = TRUE;
      break;
    case 287:
    case 299:
    case 306:
    case 304:
    case 301:
    case 302:
      break;
    case 258:
    case 257:
    case 259:
    case 15:
    case 90:
    case 21:
    case 231:
      await You(S("detect an odor reminiscent of an animal's den."));
      msg_given = TRUE;
      break;
    case 109:
      await You(S("smell steam."));
      msg_given = TRUE;
      break;
    case 205:
      await pline(S("%s stinks."), G.c_common_strings.c_Something);
      msg_given = TRUE;
      break;
    case 161:
    case 160:
      await You(S("smell mushrooms."));
      msg_given = TRUE;
      break;
    case 100:
    case 101:
    case 102:
    case 313:
      break;
    default:
      nonspecific = TRUE;
      break;
    }
    if (nonspecific) {
      switch (mdat.mlet) {
      case S_DOG:
        await You(S("notice a dog smell."));
        msg_given = TRUE;
        break;
      case S_DRAGON:
        await You(S("smell a dragon!"));
        msg_given = TRUE;
        break;
      case S_FUNGUS:
        await pline(S("%s smells moldy."), G.c_common_strings.c_Something);
        msg_given = TRUE;
        break;
      case S_UNICORN:
        await You(S("detect a%s odor reminiscent of a stable."), mndx === PM_PONY ? S("n") : S(" strong"));
        msg_given = TRUE;
        break;
      case S_ZOMBIE:
        await You(S("smell rotting flesh."));
        msg_given = TRUE;
        break;
      case S_EEL:
        await You(S("smell fish."));
        msg_given = TRUE;
        break;
      case S_ORC:
        if (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 128) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 71 ? 1 : 0) {
          await You(S("notice an attractive smell."));
        } else {
          await pline(S("A foul stench makes you feel a little nauseated."));
        }
        msg_given = TRUE;
        break;
      default:
        break;
      }
    }
  }
  return (msg_given ? TRUE : FALSE) << 24 >> 24;
}

export function $init(): void {
  vamp_rise_msg = 0;
  disintegested = 0;
  animal_list = null;
  animal_list_count = 0;
  elemental_clog$msgmv = 0;
  setmangry$Exclam = [S("Gasp!"),
S("Uh-oh."),
S("Oh my!"),
S("What?"),
S("Why?")];
}
