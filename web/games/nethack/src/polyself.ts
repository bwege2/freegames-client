// @ts-nocheck
// NetHack 3.6.7 polyself.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { defends, retouch_equipment } from './artifact.ts';
import { acurr, adjabil, exercise, newhp, redist_attr } from './attrib.ts';
import { max_rank_sz, status_initialize } from './botl.ts';
import { getdir, yn_function, youhiding } from './cmd.ts';
import { is_pool, is_pool_or_lava } from './dbridge.ts';
import { buried_ball_to_freedom, bury_objs } from './dig.ts';
import { newsym, see_monsters } from './display.ts';
import { canletgo, dropx } from './do.ts';
import { Monnam, hliquid, l_monnam, mon_nam, y_monnam } from './do_name.ts';
import { Armor_gone, Boots_off, Cloak_off, Gloves_off, Helmet_off, Shield_off, cancel_don, donning, find_ac } from './do_wear.ts';
import { throwit } from './dothrow.ts';
import { On_stairs, has_ceiling, on_level } from './dungeon.ts';
import { is_fainted, newuhs } from './eat.ts';
import { dealloc_killer, done, find_delayed_killer } from './end.ts';
import { surface } from './engrave.ts';
import { newpw, rndexp } from './exper.ts';
import { losehp, monst_to_any, nomul, spoteffects, unmul } from './hack.ts';
import { dist2, mungspaces, rounddiv, s_suffix, strstri } from './hacklib.ts';
import { update_inventory, useup } from './invent.ts';
import { del_light_source, new_light_source } from './light.ts';
import { golemhp, is_home_elemental, mkclass_poly, reset_rndmonst } from './makemon.ts';
import { expels } from './mhitu.ts';
import { mksobj } from './mkobj.ts';
import { egg_type_from_parent, hideunder, killed, setmangry } from './mon.ts';
import { attacktype, attacktype_fordmg, breakarm, can_be_strangled, dmgtype, name_to_mon, name_to_monclass, num_horns, poly_when_stoned, resists_drli, set_mon_data, sliparm, sticks } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { The, an, cloak_simple_name, helm_simple_name, makeplural, otense, simpleonames, the, the_unique_pm, vtense, yname } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { There, You, You_cant, You_feel, Your, impossible, pline, pline_The } from './pline.ts';
import { make_blinded, make_glib, make_sick, make_slimed, make_stoned } from './potion.ts';
import { unpunish } from './read.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { can_ride, dismount_steed } from './steed.ts';
import { learn_egg_type } from './timeout.ts';
import { deltrap, dotrap, feeltrap, instapetrify, maketrap, reset_utrap, selftouch, set_utrap, t_at, unconscious } from './trap.ts';
import { weapon_descr } from './weapon.ts';
import { counter_were, were_beastie, were_summon } from './were.ts';
import { untwoweapon, uswapwepgone, uwepgone } from './wield.ts';
import { worm_known } from './worm.ts';
import { racial_exception, setworn } from './worn.ts';
import { buzz, destroy_mitem, ubreatheu } from './zap.ts';
import { struct_monst, struct_obj } from './structs.ts';
import { $at2, $cs, $rd, $sat, $ta, $u64, $wr, G, P, S, sprintf, strcat, strchr, strcmp, strcpy, strncmp } from './rt/index.ts';
import { ACID_RES, ACID_VENOM, AD_ANY, AD_CONF, AD_FIRE, AMULET_OF_STRANGULATION, AMULET_OF_UNCHANGING, ANTIMAGIC, ANTI_MAGIC, ARM, ARROW_TRAP, AT_BREA, AT_CLAW, AT_ENGL, AT_GAZE, AT_SPIT, A_CON, A_DEX, A_STR, A_WIS, BEAR_TRAP, BLINDED, BLINDING_VENOM, BOLT_LIM, COLD_RES, CONFUSION, DART_TRAP, DIED, DISINT_RES, DISMOUNT_POLY, DRAIN_RES, EYE, FALSE, FINGER, FINGERTIP, FIRE_RES, FIRE_TRAP, FLYING, FOOT, FOUNTAIN, FREE_ACTION, FROMRACE, GENOCIDED, GRAY_DRAGON_SCALES, GRAY_DRAGON_SCALE_MAIL, G_GENOD, G_UNIQ, HAIR, HALLUC, HALLUC_RES, HAND, HANDED, HEAD, HOLE, INFRAVISION, INVIS, I_SPECIAL, KILLED_BY, KILLED_BY_AN, LANDMINE, LEATHER, LEG, LEVEL_TELEP, LEVITATION, LOW_PM, LS_MONSTER, M2_ELF, M2_HUMAN, MAGIC_PORTAL, MAGIC_TRAP, MAXULEV, MS_SHRIEK, MZ_SMALL, M_AP_FURNITURE, M_AP_NOTHING, M_AP_OBJECT, NATTK, NECK, NON_PM, NOSE, NO_KILLER_PREFIX, PASSES_WALLS, PIT, PM_BLACK_DRAGON, PM_BLUE_DRAGON, PM_ELECTRIC_EEL, PM_FLESH_GOLEM, PM_FLOATING_EYE, PM_FOG_CLOUD, PM_GIANT_EEL, PM_GRAY_DRAGON, PM_GREEN_DRAGON, PM_GREEN_SLIME, PM_GREMLIN, PM_HUMAN, PM_INCUBUS, PM_IRON_GOLEM, PM_JELLYFISH, PM_KRAKEN, PM_MASTODON, PM_MEDUSA, PM_MUMAK, PM_ORANGE_DRAGON, PM_OWLBEAR, PM_RAVEN, PM_RED_DRAGON, PM_ROTHE, PM_SHARK, PM_SHRIEKER, PM_SILVER_DRAGON, PM_STALKER, PM_STONE_GOLEM, PM_SUCCUBUS, PM_VAMPIRE, PM_VAMPIRE_BAT, PM_WHITE_DRAGON, PM_WOLF, PM_YELLOW_DRAGON, POISON_RES, POLYMORPH, POLYMORPH_CONTROL, POLY_TRAP, POTION_CLASS, P_SABER, P_SHORT_SWORD, REASSESS_ONLY, REFLECTING, REGENERATION, ROCKTRAP, ROLLING_BOULDER_TRAP, RUST_TRAP, SCROLL_CLASS, SEE_INVIS, SHOCK_RES, SICK, SICK_ALL, SICK_RES, SLEEP_RES, SLIMED, SLP_GAS_TRAP, SPBOOK_CLASS, SPIKED_PIT, SQKY_BOARD, STAIRS, STONED, STONE_RES, STONING, STRANGE_OBJECT, STRANGLED, STUNNED, SWIMMING, S_ANGEL, S_BLOB, S_CENTAUR, S_DOG, S_DRAGON, S_EEL, S_ELEMENTAL, S_EYE, S_FELINE, S_FUNGUS, S_GIANT, S_GOLEM, S_HUMAN, S_JELLY, S_LEPRECHAUN, S_LIGHT, S_MIMIC, S_MUMMY, S_NYMPH, S_ORC, S_PUDDING, S_QUANTMECH, S_RODENT, S_UNICORN, S_VAMPIRE, S_VORTEX, S_WORM, S_YETI, S_ZOMBIE, TELEPAT, TELEPORT, TELEPORT_CONTROL, TELEP_TRAP, TOE, TRAPDOOR, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, UNCHANGING, VIBRATING_SQUARE, WARN_OF_MON, WEAPON_CLASS, WEB, W_ARMU } from './consts.ts';

let no_longer_petrify_resistant: any;
let sex_change_ok: number;
let polymon$use_thec: any;
let polymon$monsterc: any;
let mbodypart$humanoid_parts: any;
let mbodypart$jelly_parts: any;
let mbodypart$animal_parts: any;
let mbodypart$bird_parts: any;
let mbodypart$horse_parts: any;
let mbodypart$sphere_parts: any;
let mbodypart$fungus_parts: any;
let mbodypart$vortex_parts: any;
let mbodypart$snake_parts: any;
let mbodypart$worm_parts: any;
let mbodypart$fish_parts: any;
let mbodypart$not_claws: any;

export async function set_uasmon(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any, $t15: any, $t16: any, $t17: any, $t18: any, $t19: any, $t20: any, $t21: any, $t22: any, $t23: any, $t24: any, $t25: any, $t26: any, $t27: any, $t28: any, $t29: any, $t30: any, $t31: any, $t32: any, $t33: any, $t34: any, $t35: any, $t36: any, $t37: any, $t38: any, $t39: any, $t40: any, $t41: any, $t42: any, $t43: any, $t44: any, $t45: any, $t46: any, $t47: any, $t48: any, $t49: any, $t50: any;
  let mdat = $sat(G.mons, G.u.umonnum);
  await set_mon_data(G.youmonst, mdat);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 1) !== 0) {
      ($t1 = G.u.uprops[FIRE_RES], $t1.intrinsic = $t1.intrinsic | 268435456);
    } else {
      ($t2 = G.u.uprops[FIRE_RES], $t2.intrinsic = $t2.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 2) !== 0) {
      ($t3 = G.u.uprops[COLD_RES], $t3.intrinsic = $t3.intrinsic | 268435456);
    } else {
      ($t4 = G.u.uprops[COLD_RES], $t4.intrinsic = $t4.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 4) !== 0) {
      ($t5 = G.u.uprops[SLEEP_RES], $t5.intrinsic = $t5.intrinsic | 268435456);
    } else {
      ($t6 = G.u.uprops[SLEEP_RES], $t6.intrinsic = $t6.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 8) !== 0) {
      ($t7 = G.u.uprops[DISINT_RES], $t7.intrinsic = $t7.intrinsic | 268435456);
    } else {
      ($t8 = G.u.uprops[DISINT_RES], $t8.intrinsic = $t8.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 16) !== 0) {
      ($t9 = G.u.uprops[SHOCK_RES], $t9.intrinsic = $t9.intrinsic | 268435456);
    } else {
      ($t10 = G.u.uprops[SHOCK_RES], $t10.intrinsic = $t10.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 32) !== 0) {
      ($t11 = G.u.uprops[POISON_RES], $t11.intrinsic = $t11.intrinsic | 268435456);
    } else {
      ($t12 = G.u.uprops[POISON_RES], $t12.intrinsic = $t12.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 64) !== 0) {
      ($t13 = G.u.uprops[ACID_RES], $t13.intrinsic = $t13.intrinsic | 268435456);
    } else {
      ($t14 = G.u.uprops[ACID_RES], $t14.intrinsic = $t14.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (((G.youmonst.data.mresists | G.youmonst.mextrinsics) & 128) !== 0) {
      ($t15 = G.u.uprops[STONE_RES], $t15.intrinsic = $t15.intrinsic | 268435456);
    } else {
      ($t16 = G.u.uprops[STONE_RES], $t16.intrinsic = $t16.intrinsic & ~268435456);
    }
  } while (0);
  {
    let save_uwep = G.uwep;
    G.uwep = null;
    do {
      if (resists_drli(G.youmonst)) {
        ($t17 = G.u.uprops[DRAIN_RES], $t17.intrinsic = $t17.intrinsic | 268435456);
      } else {
        ($t18 = G.u.uprops[DRAIN_RES], $t18.intrinsic = $t18.intrinsic & ~268435456);
      }
    } while (0);
    G.uwep = save_uwep;
  }
  do {
    if (dmgtype(mdat, 1) || mdat === $sat(G.mons, 132) || dmgtype(mdat, 242)) {
      ($t19 = G.u.uprops[ANTIMAGIC], $t19.intrinsic = $t19.intrinsic | 268435456);
    } else {
      ($t20 = G.u.uprops[ANTIMAGIC], $t20.intrinsic = $t20.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat.mlet === S_FUNGUS || mdat === $sat(G.mons, 242)) {
      ($t21 = G.u.uprops[SICK_RES], $t21.intrinsic = $t21.intrinsic | 268435456);
    } else {
      ($t22 = G.u.uprops[SICK_RES], $t22.intrinsic = $t22.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat === $sat(G.mons, 150) || (mdat === $sat(G.mons, 125) || mdat === $sat(G.mons, 126) || mdat === $sat(G.mons, 128))) {
      ($t23 = G.u.uprops[STUNNED], $t23.intrinsic = $t23.intrinsic | 268435456);
    } else {
      ($t24 = G.u.uprops[STUNNED], $t24.intrinsic = $t24.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (dmgtype(mdat, 36)) {
      ($t25 = G.u.uprops[HALLUC_RES], $t25.intrinsic = $t25.intrinsic | 268435456);
    } else {
      ($t26 = G.u.uprops[HALLUC_RES], $t26.intrinsic = $t26.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 16777216) >>> 0 !== 0) {
      ($t27 = G.u.uprops[SEE_INVIS], $t27.intrinsic = $t27.intrinsic | 268435456);
    } else {
      ($t28 = G.u.uprops[SEE_INVIS], $t28.intrinsic = $t28.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat === $sat(G.mons, 28) || mdat === $sat(G.mons, 47) || mdat === $sat(G.mons, 48)) {
      ($t29 = G.u.uprops[TELEPAT], $t29.intrinsic = $t29.intrinsic | 268435456);
    } else {
      ($t30 = G.u.uprops[TELEPAT], $t30.intrinsic = $t30.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((G.u.umonnum !== G.u.umonster ? mdat : $sat(G.mons, G.urace.malenum)).mflags3 & 256) {
      ($t31 = G.u.uprops[INFRAVISION], $t31.intrinsic = $t31.intrinsic | 268435456);
    } else {
      ($t32 = G.u.uprops[INFRAVISION], $t32.intrinsic = $t32.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat === $sat(G.mons, 150) || mdat === $sat(G.mons, 118)) {
      ($t33 = G.u.uprops[INVIS], $t33.intrinsic = $t33.intrinsic | 268435456);
    } else {
      ($t34 = G.u.uprops[INVIS], $t34.intrinsic = $t34.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 33554432) >>> 0 !== 0) {
      ($t35 = G.u.uprops[TELEPORT], $t35.intrinsic = $t35.intrinsic | 268435456);
    } else {
      ($t36 = G.u.uprops[TELEPORT], $t36.intrinsic = $t36.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 67108864) >>> 0 !== 0) {
      ($t37 = G.u.uprops[TELEPORT_CONTROL], $t37.intrinsic = $t37.intrinsic | 268435456);
    } else {
      ($t38 = G.u.uprops[TELEPORT_CONTROL], $t38.intrinsic = $t38.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat.mlet === S_EYE || mdat.mlet === S_LIGHT) {
      ($t39 = G.u.uprops[LEVITATION], $t39.intrinsic = $t39.intrinsic | 268435456);
    } else {
      ($t40 = G.u.uprops[LEVITATION], $t40.intrinsic = $t40.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 1) >>> 0 !== 0 && !(mdat.mlet === S_EYE || mdat.mlet === S_LIGHT)) {
      ($t41 = G.u.uprops[FLYING], $t41.intrinsic = $t41.intrinsic | 268435456);
    } else {
      ($t42 = G.u.uprops[FLYING], $t42.intrinsic = $t42.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 2) >>> 0 !== 0) {
      ($t43 = G.u.uprops[SWIMMING], $t43.intrinsic = $t43.intrinsic | 268435456);
    } else {
      ($t44 = G.u.uprops[SWIMMING], $t44.intrinsic = $t44.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 8) >>> 0 !== 0) {
      ($t45 = G.u.uprops[PASSES_WALLS], $t45.intrinsic = $t45.intrinsic | 268435456);
    } else {
      ($t46 = G.u.uprops[PASSES_WALLS], $t46.intrinsic = $t46.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if ((mdat.mflags1 & 8388608) >>> 0 !== 0) {
      ($t47 = G.u.uprops[REGENERATION], $t47.intrinsic = $t47.intrinsic | 268435456);
    } else {
      ($t48 = G.u.uprops[REGENERATION], $t48.intrinsic = $t48.intrinsic & ~268435456);
    }
  } while (0);
  do {
    if (mdat === $sat(G.mons, 142)) {
      ($t49 = G.u.uprops[REFLECTING], $t49.intrinsic = $t49.intrinsic | 268435456);
    } else {
      ($t50 = G.u.uprops[REFLECTING], $t50.intrinsic = $t50.intrinsic & ~268435456);
    }
  } while (0);
  float_vs_flight();
  polysense();
  if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
    await status_initialize(REASSESS_ONLY);
  }
}

export function float_vs_flight(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let stuck_in_floor = (G.u.utrap && G.u.utraptype !== TT_PIT ? 1 : 0) << 24 >> 24;
  if (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic) && stuck_in_floor) {
    ($t1 = G.u.uprops[FLYING], $t1.blocked = $t1.blocked | I_SPECIAL);
  } else {
    ($t2 = G.u.uprops[FLYING], $t2.blocked = $t2.blocked & ~I_SPECIAL);
  }
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && stuck_in_floor) {
    ($t3 = G.u.uprops[LEVITATION], $t3.blocked = $t3.blocked | I_SPECIAL);
  } else {
    ($t4 = G.u.uprops[LEVITATION], $t4.blocked = $t4.blocked & ~I_SPECIAL);
  }
  G.context.botl = TRUE;
}

async function check_strangling(on: number): Promise<void> {
  if (on) {
    if (G.uamul && G.uamul.otyp === AMULET_OF_STRANGULATION && await can_be_strangled(G.youmonst)) {
      G.u.uprops[STRANGLED].intrinsic = 6;
      G.context.botl = TRUE;
      await Your(S("%s %s your %s!"), await simpleonames(G.uamul), G.u.uprops[STRANGLED].intrinsic ? S("still constricts") : S("begins constricting"), body_part(NECK));
      await discover_object(180, 1, 1);
    }
  } else {
    if (G.u.uprops[STRANGLED].intrinsic && !await can_be_strangled(G.youmonst)) {
      G.u.uprops[STRANGLED].intrinsic = 0;
      G.context.botl = TRUE;
      await You(S("are no longer being strangled."));
    }
  }
}

async function polyman(fmt: Ptr | null, arg: Ptr | null): Promise<void> {
  let sticky = (sticks(G.youmonst.data) && G.u.ustuck && !G.u.uswallow ? 1 : 0) << 24 >> 24;
  let was_mimicking = ((G.youmonst.m_ap_type & 7) !== M_AP_NOTHING ? 1 : 0) << 24 >> 24;
  let was_blind = (!!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  if (G.u.umonnum !== G.u.umonster) {
    G.u.acurr.$cp(G.u.macurr);
    G.u.amax.$cp(G.u.mamax);
    G.u.umonnum = G.u.umonster;
    G.flags.female = G.u.mfemale << 24 >> 24;
  }
  await set_uasmon();
  G.u.mh = G.u.mhmax = 0;
  G.u.mtimedone = 0;
  await skinback(FALSE);
  G.u.uundetected = 0;
  if (sticky) {
    await uunstick();
  }
  find_ac();
  if (was_mimicking) {
    if (G.multi < 0) {
      await unmul(S(""));
    }
    G.youmonst.m_ap_type = M_AP_NOTHING;
    G.youmonst.mappearance = 0;
  }
  await newsym(G.u.ux, G.u.uy);
  await You(fmt, arg);
  if (ugenocided()) {
    let kptr = find_delayed_killer(POLYMORPH);
    if (!!kptr && kptr.name[0]) {
      G.killer.format = kptr.format;
      strcpy(P(G.killer.name), P(kptr.name));
    } else {
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), S("self-genocide"));
    }
    await dealloc_killer(kptr);
    await done(GENOCIDED);
  }
  if (G.u.twoweap && !(G.youmonst.data.mattk[1].aatyp === 254)) {
    await untwoweapon();
  }
  if (G.u.utrap && G.u.utraptype === TT_PIT) {
    set_utrap(rn2(6) + 2 >>> 0, TT_PIT);
  }
  if (was_blind && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    G.u.uprops[BLINDED].intrinsic = 1;
    await make_blinded(0, TRUE);
  }
  await check_strangling(TRUE);
  if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !G.u.ustuck && is_pool_or_lava(G.u.ux, G.u.uy)) {
    await spoteffects(TRUE);
  }
  await see_monsters();
}

export async function change_sex(): Promise<void> {
  let already_polyd = (G.u.umonnum !== G.u.umonster ? 1 : 0) << 24 >> 24;
  if (!already_polyd || !((G.youmonst.data.mflags2 & 65536) >>> 0 !== 0) && !((G.youmonst.data.mflags2 & 131072) >>> 0 !== 0) && !((G.youmonst.data.mflags2 & 262144) >>> 0 !== 0)) {
    G.flags.female = (!G.flags.female ? 1 : 0) << 24 >> 24;
  }
  if (already_polyd) {
    G.u.mfemale = ((!G.u.mfemale ? 1 : 0) >>> 0) & 1;
  }
  max_rank_sz();
  if ((already_polyd ? G.u.mfemale | 0 : G.flags.female) && G.urole.name.f) {
    strcpy(P(G.pl_character), G.urole.name.f);
  } else {
    strcpy(P(G.pl_character), G.urole.name.m);
  }
  G.u.umonster = (already_polyd ? G.u.mfemale | 0 : G.flags.female) && G.urole.femalenum !== NON_PM ? G.urole.femalenum : G.urole.malenum;
  if (!already_polyd) {
    G.u.umonnum = G.u.umonster;
  } else if (G.u.umonnum === PM_SUCCUBUS || G.u.umonnum === PM_INCUBUS) {
    G.flags.female = (!G.flags.female ? 1 : 0) << 24 >> 24;
    G.u.umonnum = G.u.umonnum === PM_SUCCUBUS ? PM_INCUBUS : PM_SUCCUBUS;
    await set_uasmon();
  }
}

async function newman(): Promise<void> {
  let $g = 0;
  let i = 0;
  let oldlvl = 0;
  let newlvl = 0;
  let hpmax = 0;
  let enmax = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      oldlvl = G.u.ulevel;
      newlvl = oldlvl + (rn2(5) + -2);
      if (newlvl > 127 || newlvl < 1) {
        { $g = 1; continue $L; }
      }
      if (newlvl > MAXULEV) {
        newlvl = MAXULEV;
      }
      if (newlvl < oldlvl) {
        G.u.ulevelmax -= oldlvl - newlvl;
      }
      if (G.u.ulevelmax < newlvl) {
        G.u.ulevelmax = newlvl;
      }
      G.u.ulevel = newlvl;
      if (sex_change_ok && !rn2(10)) {
        await change_sex();
      }
      await adjabil(oldlvl, G.u.ulevel);
      reset_rndmonst(NON_PM);
      G.u.uexp = rndexp(FALSE);
      await redist_attr();
      hpmax = G.u.uhpmax;
      for (i = 0; i < oldlvl; ++i) {
        hpmax -= G.u.uhpinc[i];
      }
      hpmax = await rounddiv(hpmax * (rn2(4) + 8), 10);
      for (i = 0; (G.u.ulevel = i) < newlvl; ++i) {
        hpmax += newhp();
      }
      if (hpmax < G.u.ulevel) {
        hpmax = G.u.ulevel;
      }
      G.u.uhp = await rounddiv(G.u.uhp * hpmax, G.u.uhpmax);
      G.u.uhpmax = hpmax;
      enmax = G.u.uenmax;
      for (i = 0; i < oldlvl; ++i) {
        enmax -= G.u.ueninc[i];
      }
      enmax = await rounddiv(enmax * (rn2(4) + 8), 10);
      for (i = 0; (G.u.ulevel = i) < newlvl; ++i) {
        enmax += newpw();
      }
      if (enmax < G.u.ulevel) {
        enmax = G.u.ulevel;
      }
      G.u.uen = await rounddiv(G.u.uen * enmax, G.u.uenmax < 1 ? 1 : G.u.uenmax);
      G.u.uenmax = enmax;
      G.u.uhunger = rn2(500) + 500;
      if (G.u.uprops[SICK].intrinsic) {
        await make_sick(0, null, FALSE, SICK_ALL);
      }
      if (G.u.uprops[STONED].intrinsic) {
        await make_stoned(0, null, 0, null);
      }
      if (!(G.u.uhp <= 0)) { $g = 2; continue $L; }
      if (!(G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic)) { $g = 4; continue $L; }
      {
        if (G.u.uhp <= 0) {
          G.u.uhp = 1;
        }
      }
      { $g = 3; continue $L; }
    case 4:
    case 1: // dead
      await Your(S("new form doesn't seem healthy enough to survive."));
      G.killer.format = KILLED_BY_AN;
      strcpy(P(G.killer.name), S("unsuccessful polymorph"));
      await done(DIED);
      await newuhs(FALSE);
      return;
    case 3:
    case 2:
      await newuhs(FALSE);
      await polyman(S("feel like a new %s!"), (G.u.umonnum !== G.u.umonster ? G.u.mfemale | 0 : G.flags.female) && G.urace.individual.f ? G.urace.individual.f : G.urace.individual.m ? G.urace.individual.m : G.urace.noun);
      if (G.u.uprops[SLIMED].intrinsic) {
        await Your(S("body transforms, but there is still slime on you."));
        await make_slimed(10, null);
      }
      G.context.botl = 1;
      await see_monsters();
      await encumber_msg();
      await retouch_equipment(2);
      if (!G.uarmg) {
        await selftouch(P(no_longer_petrify_resistant));
      }
    }
    break;
  }
}

export async function polyself(psflags: number): Promise<void> {
  let $g = 0;
  let buf = new Int8Array(256);
  let old_light = 0;
  let new_light = 0;
  let mntmp = new Int32Array(1);
  let class_ = 0;
  let tryct = 0;
  let forcecontrol = 0;
  let monsterpoly = 0;
  let draconian = 0;
  let iswere = 0;
  let isvamp = 0;
  let controllable_poly = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      forcecontrol = (psflags === 1 ? 1 : 0) << 24 >> 24;
      monsterpoly = (psflags === 2 ? 1 : 0) << 24 >> 24;
      draconian = (G.uarm && (G.uarm.otyp >= 91 && G.uarm.otyp <= 99 || G.uarm.otyp >= 82 && G.uarm.otyp <= 90) ? 1 : 0) << 24 >> 24;
      iswere = (G.u.ulycn >= LOW_PM ? 1 : 0) << 24 >> 24;
      isvamp = (G.youmonst.data.mlet === S_VAMPIRE ? 1 : 0) << 24 >> 24;
      controllable_poly = ((G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic) && !(G.u.uprops[STUNNED].intrinsic || G.multi < 0 && (unconscious() || is_fainted())) ? 1 : 0) << 24 >> 24;
      if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
        await pline(S("You fail to transform!"));
        return;
      }
      if (!(G.u.uprops[POLYMORPH_CONTROL].intrinsic || G.u.uprops[POLYMORPH_CONTROL].extrinsic) && !forcecontrol && !draconian && !iswere && !isvamp) {
        if (rn2(20) > acurr(A_CON)) {
          await You(S("%s"), G.c_common_strings.c_shudder_for_moment);
          await losehp(rnd(30), S("system shock"), KILLED_BY_AN);
          await exercise(A_CON, FALSE);
          return;
        }
      }
      old_light = G.youmonst.data.mlet === S_LIGHT || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 31) || G.youmonst.data === $sat(G.mons, 110) ? 1 : G.youmonst.data === $sat(G.mons, 152) ? 1 : 0;
      mntmp[0] = NON_PM;
      if (monsterpoly && isvamp) {
        { $g = 1; continue $L; }
      }
      if (!(controllable_poly || forcecontrol)) { $g = 7; continue $L; }
      tryct = 5;
    case 8:
      mntmp[0] = NON_PM;
      await G.windowprocs.win_getlin(S("Become what kind of monster? [type the name]"), P(buf));
      mungspaces(P(buf));
      if ($rd(P(buf)) === 27) {
        if (forcecontrol) {
          await pline(S("%s"), G.c_common_strings.c_Never_mind);
          return;
        }
        strcpy(P(buf), S("*"));
      }
      if (!strcmp(P(buf), S("*")) || !strcmp(P(buf), S("random"))) {
        tryct = 0;
        { $g = 9; continue $L; };
      }
      class_ = 0;
      mntmp[0] = name_to_mon(P(buf));
      if (!(mntmp[0] < LOW_PM)) { $g = 11; continue $L; }
    case 2: // by_class
      class_ = await name_to_monclass(P(buf), P(mntmp, 0));
      if (class_ && mntmp[0] === NON_PM) {
        mntmp[0] = mkclass_poly(class_);
      }
    case 11:
      if (mntmp[0] < LOW_PM) {
        if (!class_) {
          await pline(S("I've never heard of such monsters."));
        } else {
          await You_cant(S("polymorph into any of those."));
        }
      } else if (iswere && (were_beastie(mntmp[0]) === G.u.ulycn || mntmp[0] === counter_were(G.u.ulycn) || G.u.umonnum !== G.u.umonster && mntmp[0] === PM_HUMAN)) {
        { $g = 3; continue $L; }
      } else if (!(($sat(G.mons, mntmp[0]).mflags2 & 1) >>> 0 === 0) && !(mntmp[0] === PM_HUMAN || ($sat(G.mons, mntmp[0]).mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0 || mntmp[0] === G.urole.malenum || mntmp[0] === G.urole.femalenum)) {
        let pm_name = null;
        if (class_) {
          if (rn2(3) || --tryct > 0) {
            { $g = 2; continue $L; }
          }
          ++tryct;
        }
        pm_name = G.mons[mntmp[0]].mname;
        if (the_unique_pm($sat(G.mons, mntmp[0]))) {
          pm_name = await the(pm_name);
        } else if (!(($sat(G.mons, mntmp[0]).mflags2 & 524288) >>> 0 !== 0)) {
          pm_name = await an(pm_name);
        }
        await You_cant(S("polymorph into %s."), pm_name);
      } else {
        { $g = 10; continue $L; };
      }
    case 9:
      if (--tryct > 0) { $g = 8; continue $L; }
    case 10:
      if (!tryct) {
        await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
      }
      if (draconian && (tryct <= 0 || mntmp[0] === armor_to_dragon(G.uarm.otyp))) {
        { $g = 4; continue $L; }
      }
      if (isvamp && (tryct <= 0 || mntmp[0] === PM_WOLF || mntmp[0] === PM_FOG_CLOUD || ($sat(G.mons, mntmp[0]) === $sat(G.mons, 125) || $sat(G.mons, mntmp[0]) === $sat(G.mons, 126) || $sat(G.mons, mntmp[0]) === $sat(G.mons, 128)))) {
        { $g = 1; continue $L; }
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(draconian || iswere || isvamp)) { $g = 12; continue $L; }
      if (!draconian) { $g = 14; continue $L; }
    case 4: // do_merge
      mntmp[0] = armor_to_dragon(G.uarm.otyp);
      if (!(G.mvitals[mntmp[0]].mvflags & G_GENOD)) {
        if (G.uarm.otyp >= 91 && G.uarm.otyp <= 99) {
          await You(S("merge with your scaly armor."));
        } else {
          let p = null;
          let dsmail = null;
          dsmail = strcpy(P(buf), await simpleonames(G.uarm));
          if (!!(p = strstri(dsmail, S(" dragon ")))) {
            while ((p.a[p.o + 1] = p.a[p.o + 8]) !== 0) {
              p = p.add(1);
            }
          }
          await Your(S("%s reverts to scales as you merge with them."), dsmail);
          G.uarm.otyp = G.uarm.otyp + (GRAY_DRAGON_SCALES - GRAY_DRAGON_SCALE_MAIL) << 16 >> 16;
          G.uarm.dknown = 1;
          G.context.botl = 1;
        }
        G.uskin = G.uarm;
        G.uarm = null;
        G.uskin.owornmask = G.uskin.owornmask | I_SPECIAL;
        update_inventory();
      }
      { $g = 13; continue $L; }
    case 14:
      if (!iswere) { $g = 16; continue $L; }
    case 3: // do_shift
      if (G.u.umonnum !== G.u.umonster && were_beastie(mntmp[0]) !== G.u.ulycn) {
        mntmp[0] = PM_HUMAN;
      } else {
        mntmp[0] = G.u.ulycn;
      }
      { $g = 15; continue $L; }
    case 16:
      if (!isvamp) { $g = 17; continue $L; }
    case 1: // do_vampyr
      if (mntmp[0] < LOW_PM || G.mons[mntmp[0]].geno & G_UNIQ) {
        mntmp[0] = G.youmonst.data !== $sat(G.mons, PM_VAMPIRE) && !rn2(10) ? PM_WOLF : !rn2(4) ? PM_FOG_CLOUD : PM_VAMPIRE_BAT;
      }
      if (controllable_poly) {
        sprintf(P(buf), S("Become %s?"), await an(G.mons[mntmp[0]].mname));
        if (await yn_function(P(buf), P(G.ynchars), 110) !== 121) {
          return;
        }
      }
    case 17:
    case 15:
    case 13:
      if (mntmp[0] === PM_HUMAN) {
        await newman();
      } else {
        await polymon(mntmp[0]);
      }
      { $g = 5; continue $L; }
    case 12:
    case 6:
      if (mntmp[0] < LOW_PM) {
        tryct = 200;
        do {
          mntmp[0] = rn2(327 - (-1 + 1)) + (-1 + 1);
          if (($sat(G.mons, mntmp[0]).mflags2 & 1) >>> 0 === 0 && !($sat(G.mons, mntmp[0]) === $sat(G.mons, 71) || $sat(G.mons, mntmp[0]) === $sat(G.mons, 166) || $sat(G.mons, mntmp[0]) === $sat(G.mons, 260) || $sat(G.mons, mntmp[0]) === $sat(G.mons, 256))) {
            break;
          }
        } while (--tryct > 0);
      }
      ++sex_change_ok;
      if (!(($sat(G.mons, mntmp[0]).mflags2 & 1) >>> 0 === 0) || !forcecontrol && !rn2(5) || ($sat(G.mons, mntmp[0]).mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0) {
        await newman();
      } else {
        await polymon(mntmp[0]);
      }
      --sex_change_ok;
    case 5: // made_change
      new_light = G.youmonst.data.mlet === S_LIGHT || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 31) || G.youmonst.data === $sat(G.mons, 110) ? 1 : G.youmonst.data === $sat(G.mons, 152) ? 1 : 0;
      if (old_light !== new_light) {
        if (old_light) {
          await del_light_source(LS_MONSTER, monst_to_any(G.youmonst));
        }
        if (new_light === 1) {
          ++new_light;
        }
        if (new_light) {
          await new_light_source(G.u.ux, G.u.uy, new_light, LS_MONSTER, monst_to_any(G.youmonst));
        }
      }
    }
    break;
  }
}

export async function polymon(mntmp: number): Promise<number> {
  let buf = new Int8Array(256);
  let sticky = (sticks(G.youmonst.data) && G.u.ustuck && !G.u.uswallow ? 1 : 0) << 24 >> 24;
  let was_blind = (!!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0) << 24 >> 24;
  let dochange = FALSE;
  let mlvl = 0;
  if (G.mvitals[mntmp].mvflags & G_GENOD) {
    await You_feel(S("rather %s-ish."), G.mons[mntmp].mname);
    await exercise(A_WIS, TRUE);
    return 0;
  }
  ++G.u.uconduct.polyselfs;
  await exercise(A_CON, FALSE);
  await exercise(A_WIS, TRUE);
  if (!(G.u.umonnum !== G.u.umonster)) {
    G.u.macurr.$cp(G.u.acurr);
    G.u.mamax.$cp(G.u.amax);
    G.u.mfemale = (G.flags.female >>> 0) & 1;
  } else {
    G.u.acurr.$cp(G.u.macurr);
    G.u.amax.$cp(G.u.mamax);
    G.flags.female = G.u.mfemale << 24 >> 24;
  }
  if (G.multi < 0 && (G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.data.mlet !== S_MIMIC) {
    await unmul(S(""));
  }
  if (G.mons[mntmp].mlet !== S_MIMIC) {
    G.youmonst.m_ap_type = M_AP_NOTHING;
    G.youmonst.mappearance = 0;
  }
  if (($sat(G.mons, mntmp).mflags2 & 65536) >>> 0 !== 0) {
    if (G.flags.female) {
      dochange = TRUE;
    }
  } else if (($sat(G.mons, mntmp).mflags2 & 131072) >>> 0 !== 0) {
    if (!G.flags.female) {
      dochange = TRUE;
    }
  } else if (!(($sat(G.mons, mntmp).mflags2 & 262144) >>> 0 !== 0) && mntmp !== G.u.ulycn) {
    if (sex_change_ok && !rn2(10)) {
      dochange = TRUE;
    }
  }
  strcpy(P(buf), G.u.umonnum !== mntmp ? S("") : S("new "));
  if (dochange) {
    G.flags.female = (!G.flags.female ? 1 : 0) << 24 >> 24;
    strcat(P(buf), ($sat(G.mons, mntmp).mflags2 & 65536) >>> 0 !== 0 || ($sat(G.mons, mntmp).mflags2 & 131072) >>> 0 !== 0 ? S("") : G.flags.female ? S("female ") : S("male "));
  }
  strcat(P(buf), G.mons[mntmp].mname);
  await You(S("%s %s!"), G.u.umonnum !== mntmp ? S("turn into") : S("feel like"), await an(P(buf)));
  if (G.u.uprops[STONED].intrinsic && poly_when_stoned($sat(G.mons, mntmp))) {
    mntmp = PM_STONE_GOLEM;
    await make_stoned(0, S("You turn to stone!"), 0, null);
  }
  G.u.mtimedone = rn2(500) + 500;
  G.u.umonnum = mntmp;
  await set_uasmon();
  if (($sat(G.mons, mntmp).mflags2 & 67108864) >>> 0 !== 0) {
    G.u.acurr.a[A_STR] = G.u.amax.a[A_STR] = 18 + 100;
  }
  if ((G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && G.u.uprops[STONED].intrinsic) {
    await make_stoned(0, S("You no longer seem to be petrifying."), 0, null);
  }
  if ((G.u.uprops[SICK_RES].intrinsic || defends(33, G.uwep)) && G.u.uprops[SICK].intrinsic) {
    await make_sick(0, null, FALSE, SICK_ALL);
    await You(S("no longer feel sick."));
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    if (G.youmonst.data === $sat(G.mons, 110) || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) {
      await make_slimed(0, S("The slime burns away!"));
    } else if (mntmp === PM_GREEN_SLIME) {
      await make_slimed(0, null);
    }
  }
  await check_strangling(FALSE);
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    make_glib(0);
  }
  mlvl = G.mons[mntmp].mlevel;
  if (G.youmonst.data.mlet === S_DRAGON && mntmp >= PM_GRAY_DRAGON) {
    G.u.mhmax = G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum ? 8 * mlvl : 4 * mlvl + d(mlvl, 4);
  } else if (G.youmonst.data.mlet === S_GOLEM) {
    G.u.mhmax = golemhp(mntmp);
  } else {
    if (!mlvl) {
      G.u.mhmax = rnd(4);
    } else {
      G.u.mhmax = d(mlvl, 8);
    }
    if (await is_home_elemental($sat(G.mons, mntmp))) {
      G.u.mhmax = G.u.mhmax * 3;
    }
  }
  G.u.mh = G.u.mhmax;
  if (G.u.ulevel < mlvl) {
    G.u.mtimedone = Math.imul(G.u.mtimedone, G.u.ulevel) / mlvl | 0;
  }
  if (G.uskin && mntmp !== armor_to_dragon(G.uskin.otyp)) {
    await skinback(FALSE);
  }
  await break_armor();
  await drop_weapon(1);
  hideunder(G.youmonst);
  if (G.u.utrap && G.u.utraptype === TT_PIT) {
    set_utrap(rn2(6) + 2 >>> 0, TT_PIT);
  }
  if (was_blind && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    G.u.uprops[BLINDED].intrinsic = 1;
    await make_blinded(0, TRUE);
  }
  await newsym(G.u.ux, G.u.uy);
  if (!sticky && !G.u.uswallow && G.u.ustuck && sticks(G.youmonst.data)) {
    G.u.ustuck = null;
  } else if (sticky && !sticks(G.youmonst.data)) {
    await uunstick();
  }
  if (G.u.usteed) {
    if ((G.u.usteed.data === $sat(G.mons, 10) || G.u.usteed.data === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && rnl(3)) {
      await pline(S("%s touch %s."), P(no_longer_petrify_resistant), await mon_nam(G.u.usteed));
      sprintf(P(buf), S("riding %s"), await an(G.u.usteed.data.mname));
      await instapetrify(P(buf));
    }
    if (!can_ride(G.u.usteed)) {
      await dismount_steed(DISMOUNT_POLY);
    }
  }
  if (G.flags.verbose) {
    if (attacktype(G.youmonst.data, 12)) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("use your breath weapon"));
    }
    if (attacktype(G.youmonst.data, AT_SPIT)) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("spit venom"));
    }
    if (G.youmonst.data.mlet === S_NYMPH) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("remove an iron ball"));
    }
    if (attacktype(G.youmonst.data, AT_GAZE)) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("gaze at monsters"));
    }
    if ((G.youmonst.data.mflags1 & 256) >>> 0 !== 0) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("hide"));
    }
    if ((G.youmonst.data.mflags2 & 4) >>> 0 !== 0) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("summon help"));
    }
    if (G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95)) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("spin a web"));
    }
    if (G.u.umonnum === PM_GREMLIN) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("multiply in a fountain"));
    }
    if (G.youmonst.data.mlet === S_UNICORN && (G.youmonst.data.mflags2 & 536870912) >>> 0 !== 0) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("use your horn"));
    }
    if (G.youmonst.data === $sat(G.mons, 47) || G.youmonst.data === $sat(G.mons, 48)) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("emit a mental blast"));
    }
    if (G.youmonst.data.msound === MS_SHRIEK) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("shriek"));
    }
    if (G.youmonst.data.mlet === S_VAMPIRE) {
      await pline(P(polymon$use_thec), P(polymon$monsterc), S("change shape"));
    }
    if ((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.flags.female && !(G.youmonst.data === $sat(G.mons, PM_GIANT_EEL) || G.youmonst.data === $sat(G.mons, PM_ELECTRIC_EEL))) {
      await pline(P(polymon$use_thec), S("sit"), (G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.youmonst.data.mlet === S_EEL && (G.youmonst.data.mflags1 & 2) >>> 0 !== 0 ? S("spawn in the water") : S("lay an egg"));
    }
  }
  if ((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0) {
    learn_egg_type(G.u.umonnum);
    learn_egg_type(egg_type_from_parent(G.u.umonnum, TRUE));
  }
  find_ac();
  if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && !G.u.ustuck && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && is_pool_or_lava(G.u.ux, G.u.uy) || G.u.uinwater | 0 && !(G.u.uprops[SWIMMING].intrinsic || G.u.uprops[SWIMMING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 2) >>> 0 !== 0)) {
    await spoteffects(TRUE);
  }
  if ((G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) && G.u.utrap && (G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_BURIEDBALL)) {
    if (G.u.utraptype === TT_INFLOOR) {
      await pline_The(S("rock seems to no longer trap you."));
    } else {
      await pline_The(S("buried ball is no longer bound to you."));
      await buried_ball_to_freedom();
    }
    await reset_utrap(TRUE);
  } else if ((G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) && G.u.utrap && G.u.utraptype === TT_LAVA) {
    await pline_The(S("%s now feels soothing."), hliquid(S("lava")));
    await reset_utrap(TRUE);
  }
  if ((G.youmonst.data.mflags1 & 4) >>> 0 !== 0 || (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) || (G.youmonst.data.mflags1 & 1048576) >>> 0 !== 0) {
    if (!!G.uball) {
      await You(S("slip out of the iron chain."));
      await unpunish();
    } else if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
      await You(S("slip free of the buried ball and chain."));
      await buried_ball_to_freedom();
    }
  }
  if (G.u.utrap && (G.u.utraptype === TT_WEB || G.u.utraptype === TT_BEARTRAP) && ((G.youmonst.data.mflags1 & 4) >>> 0 !== 0 || (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) || (G.youmonst.data.mflags1 & 1048576) >>> 0 !== 0 || G.youmonst.data.msize <= MZ_SMALL && G.u.utraptype === TT_BEARTRAP)) {
    await You(S("are no longer stuck in the %s."), G.u.utraptype === TT_WEB ? S("web") : S("bear trap"));
    await reset_utrap(TRUE);
  }
  if ((G.youmonst.data === $sat(G.mons, 93) || G.youmonst.data === $sat(G.mons, 95)) && G.u.utrap && G.u.utraptype === TT_WEB) {
    await You(S("orient yourself on the web."));
    await reset_utrap(TRUE);
  }
  await check_strangling(TRUE);
  G.context.botl = 1;
  G.vision_full_recalc = 1;
  await see_monsters();
  await encumber_msg();
  await retouch_equipment(2);
  if (!G.uarmg) {
    await selftouch(P(no_longer_petrify_resistant));
  }
  return 1;
}

async function dropp(obj: struct_obj | null): Promise<void> {
  let otmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp === obj) {
      await dropx(obj);
      break;
    }
  }
}

async function break_armor(): Promise<void> {
  let otmp = null;
  if (breakarm(G.youmonst.data)) {
    if (!!(otmp = G.uarm)) {
      if (donning(otmp)) {
        cancel_don();
      }
      await You(S("break out of your armor!"));
      await exercise(A_STR, FALSE);
      await Armor_gone();
      await useup(otmp);
    }
    if (!!(otmp = G.uarmc)) {
      if (otmp.oartifact) {
        await Your(S("%s falls off!"), cloak_simple_name(otmp));
        await Cloak_off();
        await dropp(otmp);
      } else {
        await Your(S("%s tears apart!"), cloak_simple_name(otmp));
        await Cloak_off();
        await useup(otmp);
      }
    }
    if (G.uarmu) {
      await Your(S("shirt rips to shreds!"));
      await useup(G.uarmu);
    }
  } else if (sliparm(G.youmonst.data)) {
    if (!!(otmp = G.uarm) && racial_exception(G.youmonst, otmp) < 1) {
      if (donning(otmp)) {
        cancel_don();
      }
      await Your(S("armor falls around you!"));
      await Armor_gone();
      await dropp(otmp);
    }
    if (!!(otmp = G.uarmc)) {
      if (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) {
        await Your(S("%s falls, unsupported!"), cloak_simple_name(otmp));
      } else {
        await You(S("shrink out of your %s!"), cloak_simple_name(otmp));
      }
      await Cloak_off();
      await dropp(otmp);
    }
    if (!!(otmp = G.uarmu)) {
      if (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) {
        await You(S("seep right through your shirt!"));
      } else {
        await You(S("become much too small for your shirt!"));
      }
      await setworn(null, otmp.owornmask & W_ARMU);
      await dropp(otmp);
    }
  }
  if (await num_horns(G.youmonst.data) > 0) {
    if (!!(otmp = G.uarmh)) {
      if (((G.objects[otmp.otyp].oc_material | 0) <= LEATHER || otmp.otyp === 60) && !donning(otmp)) {
        let hornbuf = new Int8Array(256);
        sprintf(P(hornbuf), S("horn%s"), await num_horns(G.youmonst.data) === 1 ? S("") : S("s"));
        await Your(S("%s %s through %s."), P(hornbuf), vtense(P(hornbuf), S("pierce")), await yname(otmp));
      } else {
        if (donning(otmp)) {
          cancel_don();
        }
        await Your(S("%s falls to the %s!"), helm_simple_name(otmp), surface(G.u.ux, G.u.uy));
        await Helmet_off();
        await dropp(otmp);
      }
    }
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) {
    if (!!(otmp = G.uarmg)) {
      if (donning(otmp)) {
        cancel_don();
      }
      await You(S("drop your gloves%s!"), G.uwep ? S(" and weapon") : S(""));
      await drop_weapon(0);
      await Gloves_off();
      await dropp(otmp);
    }
    if (!!(otmp = G.uarms)) {
      await You(S("can no longer hold your shield!"));
      await Shield_off();
      await dropp(otmp);
    }
    if (!!(otmp = G.uarmh)) {
      if (donning(otmp)) {
        cancel_don();
      }
      await Your(S("%s falls to the %s!"), helm_simple_name(otmp), surface(G.u.ux, G.u.uy));
      await Helmet_off();
      await dropp(otmp);
    }
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1 || (G.youmonst.data.mflags1 & 524288) >>> 0 !== 0 || G.youmonst.data.mlet === S_CENTAUR) {
    if (!!(otmp = G.uarmf)) {
      if (donning(otmp)) {
        cancel_don();
      }
      if (G.youmonst.data.mlet === S_VORTEX || G.youmonst.data === $sat(G.mons, 151)) {
        await Your(S("boots fall away!"));
      } else {
        await Your(S("boots %s off your feet!"), G.youmonst.data.msize < 1 ? S("slide") : S("are pushed"));
      }
      await Boots_off();
      await dropp(otmp);
    }
  }
}

async function drop_weapon(alone: number): Promise<void> {
  let otmp = null;
  let what = null;
  let which = null;
  let whichtoo = null;
  let candropwep = 0;
  let candropswapwep = 0;
  let updateinv = TRUE;
  if (G.uwep) {
    if (!alone || ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1)) {
      candropwep = await canletgo(G.uwep, S(""));
      candropswapwep = (!G.u.twoweap || await canletgo(G.uswapwep, S("")) ? 1 : 0) << 24 >> 24;
      if (alone) {
        what = candropwep && candropswapwep ? S("drop") : S("release");
        which = G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER ? S("sword") : await weapon_descr(G.uwep);
        if (G.u.twoweap) {
          whichtoo = G.uswapwep.oclass === WEAPON_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[G.uswapwep.otyp].oc_subtyp <= P_SABER ? S("sword") : await weapon_descr(G.uswapwep);
          if (strcmp(which, whichtoo)) {
            which = S("weapon");
          }
        }
        if (G.uwep.quan !== 1 || G.u.twoweap) {
          which = await makeplural(which);
        }
        await You(S("find you must %s %s %s!"), what, G.c_common_strings.c_the_your[!!strncmp(which, S("corpse"), 6) ? 1 : 0], which);
      }
      if (G.u.twoweap) {
        otmp = G.uswapwep;
        await uswapwepgone();
        if (otmp.in_use) {
          updateinv = FALSE;
        } else if (candropswapwep) {
          await dropx(otmp);
        }
      }
      otmp = G.uwep;
      await uwepgone();
      if (otmp.in_use) {
        updateinv = FALSE;
      } else if (candropwep) {
        await dropx(otmp);
      }
      if (updateinv) {
        update_inventory();
      }
    } else if (!(G.youmonst.data.mattk[1].aatyp === 254)) {
      await untwoweapon();
    }
  }
}

export async function rehumanize(): Promise<void> {
  let was_flying = (((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? 1 : 0) !== 0 ? 1 : 0) << 24 >> 24;
  if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
    if (G.u.mh < 1) {
      G.killer.format = NO_KILLER_PREFIX;
      strcpy(P(G.killer.name), S("killed while stuck in creature form"));
      await done(DIED);
    } else if (G.uamul && G.uamul.otyp === AMULET_OF_UNCHANGING) {
      await Your(S("%s %s!"), await simpleonames(G.uamul), otense(G.uamul, S("fail")));
      G.uamul.dknown = 1;
      await discover_object(184, 1, 1);
    }
  }
  if (G.youmonst.data.mlet === S_LIGHT || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 31) || G.youmonst.data === $sat(G.mons, 110) ? 1 : G.youmonst.data === $sat(G.mons, 152) ? 1 : 0) {
    await del_light_source(LS_MONSTER, monst_to_any(G.youmonst));
  }
  await polyman(S("return to %s form!"), G.urace.adj);
  if (G.u.uhp < 1) {
    await Your(S("old form was not healthy enough to survive."));
    sprintf(P(G.killer.name), S("reverting to unhealthy %s form"), G.urace.adj);
    G.killer.format = KILLED_BY;
    await done(DIED);
  }
  nomul(0);
  G.context.botl = 1;
  G.vision_full_recalc = 1;
  await encumber_msg();
  if (was_flying && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && G.u.usteed) {
    await You(S("and %s return gently to the %s."), await mon_nam(G.u.usteed), surface(G.u.ux, G.u.uy));
  }
  await retouch_equipment(2);
  if (!G.uarmg) {
    await selftouch(P(no_longer_petrify_resistant));
  }
}

export async function dobreathe(): Promise<number> {
  let mattk = null;
  if (G.u.uprops[STRANGLED].intrinsic) {
    await You_cant(S("breathe.  Sorry."));
    return 0;
  }
  if (G.u.uen < 15) {
    await You(S("don't have enough energy to breathe!"));
    return 0;
  }
  G.u.uen -= 15;
  G.context.botl = 1;
  if (!await getdir(null)) {
    return 0;
  }
  mattk = attacktype_fordmg(G.youmonst.data, AT_BREA, AD_ANY);
  if (!mattk) {
    await impossible(S("bad breath attack?"));
  } else if (!G.u.dx && !G.u.dy && !G.u.dz) {
    await ubreatheu(mattk);
  } else {
    await buzz(20 + mattk.adtyp - 1, mattk.damn, G.u.ux, G.u.uy, G.u.dx, G.u.dy);
  }
  return 1;
}

export async function dospit(): Promise<number> {
  let otmp = null;
  let mattk = null;
  if (!await getdir(null)) {
    return 0;
  }
  mattk = attacktype_fordmg(G.youmonst.data, AT_SPIT, AD_ANY);
  if (!mattk) {
    await impossible(S("bad spit attack?"));
  } else {
    switch (mattk.adtyp) {
    case 11:
    case 7:
      otmp = await mksobj(BLINDING_VENOM, TRUE, FALSE);
      break;
    default:
      await impossible(S("bad attack type in dospit"));
    case 8:
      otmp = await mksobj(ACID_VENOM, TRUE, FALSE);
      break;
    }
    otmp.spe = 1;
    await throwit(otmp, 0, FALSE);
  }
  return 1;
}

export async function doremove(): Promise<number> {
  if (!!!G.uball) {
    if (G.u.utrap && G.u.utraptype === TT_BURIEDBALL) {
      await pline_The(S("ball and chain are buried firmly in the %s."), surface(G.u.ux, G.u.uy));
      return 0;
    }
    await You(S("are not chained to anything!"));
    return 0;
  }
  await unpunish();
  return 1;
}

export async function dospinweb(): Promise<number> {
  let ttmp = t_at(G.u.ux, G.u.uy);
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || G.u.uinwater | 0 || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    await You(S("must be on the ground to spin a web."));
    return 0;
  }
  if (G.u.uswallow) {
    await You(S("release web fluid inside %s."), await mon_nam(G.u.ustuck));
    if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
      await expels(G.u.ustuck, G.u.ustuck.data, TRUE);
      return 0;
    }
    if (G.u.ustuck.data.mlet === S_VORTEX || G.u.ustuck.data === $sat(G.mons, 151)) {
      let i = 0;
      for (i = 0; i < NATTK; ++i) {
        if (G.u.ustuck.data.mattk[i].aatyp === AT_ENGL) {
          break;
        }
      }
      if (i === NATTK) {
        await impossible(S("Swallower has no engulfing attack?"));
      } else {
        let sweep = new Int8Array(30);
        sweep[0] = 0;
        switch (G.u.ustuck.data.mattk[i].adtyp) {
        case 2:
          strcpy(P(sweep), S("ignites and "));
          break;
        case 6:
          strcpy(P(sweep), S("fries and "));
          break;
        case 3:
          strcpy(P(sweep), S("freezes, shatters and "));
          break;
        }
        await pline_The(S("web %sis swept away!"), P(sweep));
      }
      return 0;
    }
    await pline_The(S("web dissolves into %s."), await mon_nam(G.u.ustuck));
    return 0;
  }
  if (G.u.utrap) {
    await You(S("cannot spin webs while stuck in a trap."));
    return 0;
  }
  await exercise(A_DEX, TRUE);
  if (ttmp) {
    switch (ttmp.ttyp | 0) {
    case PIT:
    case SPIKED_PIT:
      await You(S("spin a web, covering up the pit."));
      await deltrap(ttmp);
      await bury_objs(G.u.ux, G.u.uy);
      await newsym(G.u.ux, G.u.uy);
      return 1;
    case SQKY_BOARD:
      await pline_The(S("squeaky board is muffled."));
      await deltrap(ttmp);
      await newsym(G.u.ux, G.u.uy);
      return 1;
    case TELEP_TRAP:
    case LEVEL_TELEP:
    case MAGIC_PORTAL:
    case VIBRATING_SQUARE:
      await Your(S("webbing vanishes!"));
      return 0;
    case WEB:
      await You(S("make the web thicker."));
      return 1;
    case HOLE:
    case TRAPDOOR:
      await You(S("web over the %s."), (ttmp.ttyp | 0) === TRAPDOOR ? S("trap door") : S("hole"));
      await deltrap(ttmp);
      await newsym(G.u.ux, G.u.uy);
      return 1;
    case ROLLING_BOULDER_TRAP:
      await You(S("spin a web, jamming the trigger."));
      await deltrap(ttmp);
      await newsym(G.u.ux, G.u.uy);
      return 1;
    case ARROW_TRAP:
    case DART_TRAP:
    case BEAR_TRAP:
    case ROCKTRAP:
    case FIRE_TRAP:
    case LANDMINE:
    case SLP_GAS_TRAP:
    case RUST_TRAP:
    case MAGIC_TRAP:
    case ANTI_MAGIC:
    case POLY_TRAP:
      await You(S("have triggered a trap!"));
      await dotrap(ttmp, 0);
      return 1;
    default:
      await impossible(S("Webbing over trap type %d?"), ttmp.ttyp | 0);
      return 0;
    }
  } else if (On_stairs(G.u.ux, G.u.uy)) {
    await Your(S("web fails to impede access to the %s."), $at2(G.level.locations, G.u.ux, G.u.uy).typ === STAIRS ? S("stairs") : S("ladder"));
    return 1;
  }
  ttmp = await maketrap(G.u.ux, G.u.uy, WEB);
  if (ttmp) {
    ttmp.madeby_u = 1;
    await feeltrap(ttmp);
  }
  return 1;
}

export async function dosummon(): Promise<number> {
  const placeholder = new Int32Array(1);
  if (G.u.uen < 10) {
    await You(S("lack the energy to send forth a call for help!"));
    return 0;
  }
  G.u.uen -= 10;
  G.context.botl = 1;
  await You(S("call upon your brethren for help!"));
  await exercise(A_WIS, TRUE);
  if (!await were_summon(G.youmonst.data, TRUE, P(placeholder, 0), null)) {
    await pline(S("But none arrive."));
  }
  return 1;
}

export async function dogaze(): Promise<number> {
  let mtmp = null;
  let looked = 0;
  let qbuf = new Int8Array(128);
  let i = 0;
  let adtyp = 0;
  for (i = 0; i < NATTK; ++i) {
    if (G.youmonst.data.mattk[i].aatyp === AT_GAZE) {
      adtyp = G.youmonst.data.mattk[i].adtyp;
      break;
    }
  }
  if (adtyp !== AD_CONF && adtyp !== AD_FIRE) {
    await impossible(S("gaze attack %d?"), adtyp);
    return 0;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    await You_cant(S("see anything to gaze at."));
    return 0;
  } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    await You_cant(S("gaze at anything you can see."));
    return 0;
  }
  if (G.u.uen < 15) {
    await You(S("lack the energy to use your special gaze!"));
    return 0;
  }
  G.u.uen -= 15;
  G.context.botl = 1;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
      ++looked;
      if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0)) {
        await pline(S("%s seems not to notice your gaze."), await Monnam(mtmp));
      } else if (mtmp.minvis | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
        await You_cant(S("see where to gaze at %s."), await Monnam(mtmp));
      } else if ((mtmp.m_ap_type & 7) === M_AP_FURNITURE || (mtmp.m_ap_type & 7) === M_AP_OBJECT) {
        --looked;
        continue;
      } else if (G.flags.safe_dog && mtmp.mtame && !G.u.uprops[CONFUSION].intrinsic) {
        await You(S("avoid gazing at %s."), await y_monnam(mtmp));
      } else {
        if (G.flags.confirm && mtmp.mpeaceful | 0 && !G.u.uprops[CONFUSION].intrinsic) {
          sprintf(P(qbuf), S("Really %s %s?"), adtyp === AD_CONF ? S("confuse") : S("attack"), await mon_nam(mtmp));
          if (await yn_function(P(qbuf), P(G.ynchars), 110) !== 121) {
            continue;
          }
        }
        await setmangry(mtmp, TRUE);
        if (!mtmp.mcanmove || mtmp.mstun | 0 || mtmp.msleeping | 0 || !mtmp.mcansee || !((mtmp.data.mflags1 & 4096) >>> 0 === 0)) {
          --looked;
          continue;
        }
        if (adtyp === AD_CONF) {
          if (!mtmp.mconf) {
            await Your(S("gaze confuses %s!"), await mon_nam(mtmp));
          } else {
            await pline(S("%s is getting more and more confused."), await Monnam(mtmp));
          }
          mtmp.mconf = 1;
        } else if (adtyp === AD_FIRE) {
          let dmg = d(2, 6);
          let lev = G.u.ulevel;
          await You(S("attack %s with a fiery gaze!"), await mon_nam(mtmp));
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0) {
            await pline_The(S("fire doesn't burn %s!"), await mon_nam(mtmp));
            dmg = 0;
          }
          if (lev > rn2(20)) {
            await destroy_mitem(mtmp, SCROLL_CLASS, AD_FIRE);
          }
          if (lev > rn2(20)) {
            await destroy_mitem(mtmp, POTION_CLASS, AD_FIRE);
          }
          if (lev > rn2(25)) {
            await destroy_mitem(mtmp, SPBOOK_CLASS, AD_FIRE);
          }
          if (dmg) {
            mtmp.mhp -= dmg;
          }
          if (mtmp.mhp < 1) {
            await killed(mtmp);
          }
        }
        if (mtmp.mhp < 1) {
          continue;
        }
        if (mtmp.data === $sat(G.mons, PM_FLOATING_EYE) && !mtmp.mcan) {
          if (!G.u.uprops[FREE_ACTION].extrinsic) {
            await You(S("are frozen by %s gaze!"), s_suffix(await mon_nam(mtmp)));
            nomul(G.u.ulevel > 6 || rn2(4) ? -d(mtmp.m_lev + 1, mtmp.data.mattk[0].damd) : -200);
            G.multi_reason = S("frozen by a monster's gaze");
            G.nomovemsg = null;
            return 1;
          } else {
            await You(S("stiffen momentarily under %s gaze."), s_suffix(await mon_nam(mtmp)));
          }
        }
        if (mtmp.data === $sat(G.mons, PM_MEDUSA) && !mtmp.mcan) {
          await pline(S("Gazing at the awake %s is not a very good idea."), await l_monnam(mtmp));
          await You(S("turn to stone..."));
          G.killer.format = KILLED_BY;
          strcpy(P(G.killer.name), S("deliberately meeting Medusa's gaze"));
          await done(STONING);
        }
      }
    }
  }
  if (!looked) {
    await You(S("gaze at no place in particular."));
  }
  return 1;
}

export async function dohide(): Promise<number> {
  let ismimic = (G.youmonst.data.mlet === S_MIMIC ? 1 : 0) << 24 >> 24;
  let on_ceiling = ((G.youmonst.data.mflags1 & 16) >>> 0 !== 0 || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? 1 : 0) << 24 >> 24;
  if (G.u.ustuck || G.u.utrap && (G.u.utraptype !== TT_PIT || on_ceiling)) {
    await You_cant(S("hide while you're %s."), !G.u.ustuck ? S("trapped") : G.u.uswallow | 0 ? (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("swallowed") : S("engulfed") : !sticks(G.youmonst.data) ? S("being held") : (G.u.ustuck.data.mflags1 & 131072) >>> 0 !== 0 ? S("holding someone") : S("holding that creature"));
    if (G.u.uundetected | 0 || ismimic && (G.youmonst.m_ap_type & 7) !== M_AP_NOTHING) {
      G.u.uundetected = 0;
      G.youmonst.m_ap_type = M_AP_NOTHING;
      await newsym(G.u.ux, G.u.uy);
    }
    return 0;
  }
  if (G.youmonst.data.mlet === S_EEL && !is_pool(G.u.ux, G.u.uy)) {
    if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === FOUNTAIN) {
      await The(S("fountain is not deep enough to hide in."));
    } else {
      await There(S("is no %s to hide in here."), hliquid(S("water")));
    }
    G.u.uundetected = 0;
    return 0;
  }
  if ((G.youmonst.data.mflags1 & 128) >>> 0 !== 0 && !G.level.objects[G.u.ux][G.u.uy]) {
    await There(S("is nothing to hide under here."));
    G.u.uundetected = 0;
    return 0;
  }
  if (on_ceiling && !has_ceiling(G.u.uz)) {
    await There(S("is nowhere to hide above you."));
    G.u.uundetected = 0;
    return 0;
  }
  if ((G.youmonst.data.mflags1 & 256) >>> 0 !== 0 && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) && ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
    await There(S("is nowhere to hide beneath you."));
    G.u.uundetected = 0;
    return 0;
  }
  if (G.u.uundetected | 0 || ismimic && (G.youmonst.m_ap_type & 7) !== M_AP_NOTHING) {
    await youhiding(FALSE, 1);
    return 0;
  }
  if (ismimic) {
    G.youmonst.m_ap_type = M_AP_OBJECT;
    G.youmonst.mappearance = STRANGE_OBJECT;
  } else {
    G.u.uundetected = 1;
  }
  await newsym(G.u.ux, G.u.uy);
  await youhiding(FALSE, 0);
  return 1;
}

export async function dopoly(): Promise<number> {
  let savedat = G.youmonst.data;
  if (G.youmonst.data.mlet === S_VAMPIRE) {
    await polyself(2);
    if (savedat !== G.youmonst.data) {
      await You(S("transform into %s."), await an(G.youmonst.data.mname));
      await newsym(G.u.ux, G.u.uy);
    }
  }
  return 1;
}

export async function domindblast(): Promise<number> {
  let mtmp = null;
  let nmon = null;
  if (G.u.uen < 10) {
    await You(S("concentrate but lack the energy to maintain doing so."));
    return 0;
  }
  G.u.uen -= 10;
  G.context.botl = 1;
  await You(S("concentrate."));
  await pline(S("A wave of psychic energy pours out."));
  for (mtmp = G.level.monlist; mtmp; mtmp = nmon) {
    let u_sen = 0;
    nmon = mtmp.nmon;
    if (mtmp.mhp < 1) {
      continue;
    }
    if (dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > Math.imul(BOLT_LIM, BOLT_LIM)) {
      continue;
    }
    if (mtmp.mpeaceful) {
      continue;
    }
    u_sen = (mtmp.data === $sat(G.mons, 28) || mtmp.data === $sat(G.mons, 47) || mtmp.data === $sat(G.mons, 48)) && !mtmp.mcansee ? 1 : 0;
    if (u_sen || (mtmp.data === $sat(G.mons, 28) || mtmp.data === $sat(G.mons, 47) || mtmp.data === $sat(G.mons, 48)) && rn2(2) || !rn2(10)) {
      await You(S("lock in on %s %s."), s_suffix(await mon_nam(mtmp)), u_sen ? S("telepathy") : mtmp.data === $sat(G.mons, 28) || mtmp.data === $sat(G.mons, 47) || mtmp.data === $sat(G.mons, 48) ? S("latent telepathy") : S("mind"));
      mtmp.mhp -= rnd(15);
      if (mtmp.mhp < 1) {
        await killed(mtmp);
      }
    }
  }
  return 1;
}

export async function uunstick(): Promise<void> {
  if (!G.u.ustuck) {
    await impossible(S("uunstick: no ustuck?"));
    return;
  }
  await pline(S("%s is no longer in your clutches."), await Monnam(G.u.ustuck));
  G.u.ustuck = null;
}

export async function skinback(silently: number): Promise<void> {
  if (G.uskin) {
    if (!silently) {
      await Your(S("skin returns to its original form."));
    }
    G.uarm = G.uskin;
    G.uskin = null;
    G.uarm.owornmask = G.uarm.owornmask & ~I_SPECIAL;
  }
}

export function mbodypart(mon: struct_monst | null, part: number): Ptr | null {
  let mptr = mon.data;
  if (mptr.mlet === S_DOG || mptr.mlet === S_FELINE || mptr.mlet === S_RODENT || mptr === $sat(G.mons, PM_OWLBEAR)) {
    switch (part) {
    case HAND:
      return S("paw");
    case HANDED:
      return S("pawed");
    case FOOT:
      return S("rear paw");
    case ARM:
    case LEG:
      return mbodypart$horse_parts[part];
    default:
      break;
    }
  } else if (mptr.mlet === S_YETI) {
    return mbodypart$humanoid_parts[part];
  }
  if ((part === HAND || part === HANDED) && ((mptr.mflags1 & 131072) >>> 0 !== 0 && attacktype(mptr, AT_CLAW) && !strchr(P(mbodypart$not_claws), mptr.mlet) && mptr !== $sat(G.mons, PM_STONE_GOLEM) && mptr !== $sat(G.mons, PM_INCUBUS) && mptr !== $sat(G.mons, PM_SUCCUBUS))) {
    return part === HAND ? S("claw") : S("clawed");
  }
  if ((mptr === $sat(G.mons, PM_MUMAK) || mptr === $sat(G.mons, PM_MASTODON)) && part === NOSE) {
    return S("trunk");
  }
  if (mptr === $sat(G.mons, PM_SHARK) && part === HAIR) {
    return S("skin");
  }
  if ((mptr === $sat(G.mons, PM_JELLYFISH) || mptr === $sat(G.mons, PM_KRAKEN)) && (part === ARM || part === FINGER || part === HAND || part === FOOT || part === TOE)) {
    return S("tentacle");
  }
  if (mptr === $sat(G.mons, PM_FLOATING_EYE) && part === EYE) {
    return S("cornea");
  }
  if ((mptr.mflags1 & 131072) >>> 0 !== 0 && (part === ARM || part === FINGER || part === FINGERTIP || part === HAND || part === HANDED)) {
    return mbodypart$humanoid_parts[part];
  }
  if (mptr === $sat(G.mons, PM_RAVEN)) {
    return mbodypart$bird_parts[part];
  }
  if (mptr.mlet === S_CENTAUR || mptr.mlet === S_UNICORN || mptr === $sat(G.mons, PM_ROTHE) && part !== HAIR) {
    return mbodypart$horse_parts[part];
  }
  if (mptr.mlet === S_LIGHT) {
    if (part === HANDED) {
      return S("rayed");
    } else if (part === ARM || part === FINGER || part === FINGERTIP || part === HAND) {
      return S("ray");
    } else {
      return S("beam");
    }
  }
  if (mptr === $sat(G.mons, PM_STALKER) && part === HEAD) {
    return S("head");
  }
  if (mptr.mlet === S_EEL && mptr !== $sat(G.mons, PM_JELLYFISH)) {
    return mbodypart$fish_parts[part];
  }
  if (mptr.mlet === S_WORM) {
    return mbodypart$worm_parts[part];
  }
  if ((mptr.mflags1 & 524288) >>> 0 !== 0 || mptr.mlet === S_DRAGON && part === HAIR) {
    return mbodypart$snake_parts[part];
  }
  if (mptr.mlet === S_EYE) {
    return mbodypart$sphere_parts[part];
  }
  if (mptr.mlet === S_JELLY || mptr.mlet === S_PUDDING || mptr.mlet === S_BLOB || mptr === $sat(G.mons, PM_JELLYFISH)) {
    return mbodypart$jelly_parts[part];
  }
  if (mptr.mlet === S_VORTEX || mptr.mlet === S_ELEMENTAL) {
    return mbodypart$vortex_parts[part];
  }
  if (mptr.mlet === S_FUNGUS) {
    return mbodypart$fungus_parts[part];
  }
  if ((mptr.mflags1 & 131072) >>> 0 !== 0) {
    return mbodypart$humanoid_parts[part];
  }
  return mbodypart$animal_parts[part];
}

export function body_part(part: number): Ptr | null {
  return mbodypart(G.youmonst, part);
}

export function poly_gender(): number {
  if ((G.youmonst.data.mflags2 & 262144) >>> 0 !== 0 || !((G.youmonst.data.mflags1 & 131072) >>> 0 !== 0)) {
    return 2;
  }
  return G.flags.female;
}

export async function ugolemeffects(damtype: number, dam: number): Promise<void> {
  let heal = 0;
  if (G.u.umonnum !== PM_FLESH_GOLEM && G.u.umonnum !== PM_IRON_GOLEM) {
    return;
  }
  switch (damtype) {
  case 6:
    if (G.u.umonnum === PM_FLESH_GOLEM) {
      heal = (dam + 5) / 6 | 0;
    }
    break;
  case 2:
    if (G.u.umonnum === PM_IRON_GOLEM) {
      heal = dam;
    }
    break;
  }
  if (heal && G.u.mh < G.u.mhmax) {
    G.u.mh += heal;
    if (G.u.mh > G.u.mhmax) {
      G.u.mh = G.u.mhmax;
    }
    G.context.botl = 1;
    await pline(S("Strangely, you feel better than before."));
    await exercise(A_STR, TRUE);
  }
}

function armor_to_dragon(atyp: number): number {
  switch (atyp) {
  case 82:
  case 91:
    return PM_GRAY_DRAGON;
  case 83:
  case 92:
    return PM_SILVER_DRAGON;
  case 84:
  case 93:
    return PM_RED_DRAGON;
  case 86:
  case 95:
    return PM_ORANGE_DRAGON;
  case 85:
  case 94:
    return PM_WHITE_DRAGON;
  case 87:
  case 96:
    return PM_BLACK_DRAGON;
  case 88:
  case 97:
    return PM_BLUE_DRAGON;
  case 89:
  case 98:
    return PM_GREEN_DRAGON;
  case 90:
  case 99:
    return PM_YELLOW_DRAGON;
  default:
    return -1;
  }
}

function polysense(): void {
  let $t1: any, $t2: any, $t3: any;
  let warnidx = NON_PM;
  G.context.warntype.speciesidx = NON_PM;
  G.context.warntype.species = null;
  G.context.warntype.polyd = 0;
  ($t1 = G.u.uprops[WARN_OF_MON], $t1.intrinsic = $t1.intrinsic & ~FROMRACE);
  switch (G.u.umonnum) {
  case 114:
    warnidx = PM_SHRIEKER;
    break;
  case 222:
  case 223:
    G.context.warntype.polyd = M2_HUMAN | M2_ELF;
    ($t2 = G.u.uprops[WARN_OF_MON], $t2.intrinsic = $t2.intrinsic | FROMRACE);
    return;
  }
  if (warnidx >= LOW_PM) {
    G.context.warntype.speciesidx = warnidx;
    G.context.warntype.species = $sat(G.mons, warnidx);
    ($t3 = G.u.uprops[WARN_OF_MON], $t3.intrinsic = $t3.intrinsic | FROMRACE);
  }
}

export function ugenocided(): number {
  return (G.mvitals[G.urole.malenum].mvflags & G_GENOD || G.urole.femalenum !== NON_PM && G.mvitals[G.urole.femalenum].mvflags & G_GENOD || G.mvitals[G.urace.malenum].mvflags & G_GENOD || G.urace.femalenum !== NON_PM && G.mvitals[G.urace.femalenum].mvflags & G_GENOD ? 1 : 0) << 24 >> 24;
}

export function udeadinside(): Ptr | null {
  return !((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX)) ? S("dead") : !(G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) ? S("condemned") : S("empty");
}

export function $init(): void {
  no_longer_petrify_resistant = $cs("No longer petrify-resistant, you", 33);
  sex_change_ok = 0;
  polymon$use_thec = $cs("Use the command #%s to %s.", 27);
  polymon$monsterc = $cs("monster", 8);
  mbodypart$humanoid_parts = [S("arm"),
S("eye"),
S("face"),
S("finger"),
S("fingertip"),
S("foot"),
S("hand"),
S("handed"),
S("head"),
S("leg"),
S("light headed"),
S("neck"),
S("spine"),
S("toe"),
S("hair"),
S("blood"),
S("lung"),
S("nose"),
S("stomach")];
  mbodypart$jelly_parts = [S("pseudopod"),
S("dark spot"),
S("front"),
S("pseudopod extension"),
S("pseudopod extremity"),
S("pseudopod root"),
S("grasp"),
S("grasped"),
S("cerebral area"),
S("lower pseudopod"),
S("viscous"),
S("middle"),
S("surface"),
S("pseudopod extremity"),
S("ripples"),
S("juices"),
S("surface"),
S("sensor"),
S("stomach")];
  mbodypart$animal_parts = [S("forelimb"),
S("eye"),
S("face"),
S("foreclaw"),
S("claw tip"),
S("rear claw"),
S("foreclaw"),
S("clawed"),
S("head"),
S("rear limb"),
S("light headed"),
S("neck"),
S("spine"),
S("rear claw tip"),
S("fur"),
S("blood"),
S("lung"),
S("nose"),
S("stomach")];
  mbodypart$bird_parts = [S("wing"),
S("eye"),
S("face"),
S("wing"),
S("wing tip"),
S("foot"),
S("wing"),
S("winged"),
S("head"),
S("leg"),
S("light headed"),
S("neck"),
S("spine"),
S("toe"),
S("feathers"),
S("blood"),
S("lung"),
S("bill"),
S("stomach")];
  mbodypart$horse_parts = [S("foreleg"),
S("eye"),
S("face"),
S("forehoof"),
S("hoof tip"),
S("rear hoof"),
S("forehoof"),
S("hooved"),
S("head"),
S("rear leg"),
S("light headed"),
S("neck"),
S("backbone"),
S("rear hoof tip"),
S("mane"),
S("blood"),
S("lung"),
S("nose"),
S("stomach")];
  mbodypart$sphere_parts = [S("appendage"),
S("optic nerve"),
S("body"),
S("tentacle"),
S("tentacle tip"),
S("lower appendage"),
S("tentacle"),
S("tentacled"),
S("body"),
S("lower tentacle"),
S("rotational"),
S("equator"),
S("body"),
S("lower tentacle tip"),
S("cilia"),
S("life force"),
S("retina"),
S("olfactory nerve"),
S("interior")];
  mbodypart$fungus_parts = [S("mycelium"),
S("visual area"),
S("front"),
S("hypha"),
S("hypha"),
S("root"),
S("strand"),
S("stranded"),
S("cap area"),
S("rhizome"),
S("sporulated"),
S("stalk"),
S("root"),
S("rhizome tip"),
S("spores"),
S("juices"),
S("gill"),
S("gill"),
S("interior")];
  mbodypart$vortex_parts = [S("region"),
S("eye"),
S("front"),
S("minor current"),
S("minor current"),
S("lower current"),
S("swirl"),
S("swirled"),
S("central core"),
S("lower current"),
S("addled"),
S("center"),
S("currents"),
S("edge"),
S("currents"),
S("life force"),
S("center"),
S("leading edge"),
S("interior")];
  mbodypart$snake_parts = [S("vestigial limb"),
S("eye"),
S("face"),
S("large scale"),
S("large scale tip"),
S("rear region"),
S("scale gap"),
S("scale gapped"),
S("head"),
S("rear region"),
S("light headed"),
S("neck"),
S("length"),
S("rear scale"),
S("scales"),
S("blood"),
S("lung"),
S("forked tongue"),
S("stomach")];
  mbodypart$worm_parts = [S("anterior segment"),
S("light sensitive cell"),
S("clitellum"),
S("setae"),
S("setae"),
S("posterior segment"),
S("segment"),
S("segmented"),
S("anterior segment"),
S("posterior"),
S("over stretched"),
S("clitellum"),
S("length"),
S("posterior setae"),
S("setae"),
S("blood"),
S("skin"),
S("prostomium"),
S("stomach")];
  mbodypart$fish_parts = [S("fin"),
S("eye"),
S("premaxillary"),
S("pelvic axillary"),
S("pelvic fin"),
S("anal fin"),
S("pectoral fin"),
S("finned"),
S("head"),
S("peduncle"),
S("played out"),
S("gills"),
S("dorsal fin"),
S("caudal fin"),
S("scales"),
S("blood"),
S("gill"),
S("nostril"),
S("stomach")];
  mbodypart$not_claws = $ta(Int8Array, 11, [S_HUMAN, S_MUMMY, S_ZOMBIE, S_ANGEL, S_NYMPH, S_LEPRECHAUN, S_QUANTMECH, S_VAMPIRE, S_ORC, S_GIANT]);
}
