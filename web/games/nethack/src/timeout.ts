// @ts-nocheck
// NetHack 3.6.7 timeout.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { fmt_ptr } from './alloc.ts';
import { fig_transform } from './apply.ts';
import { artifact_light } from './artifact.ts';
import { exercise, stone_luck } from './attrib.ts';
import { is_ice, is_pool, is_pool_or_lava } from './dbridge.ts';
import { rot_corpse, rot_organic } from './dig.ts';
import { newsym, see_monsters, set_mimic_blocking } from './display.ts';
import { heal_legs, revive_mon } from './do.ts';
import { Monnam, a_monnam, hcolor, m_monnam, rndmonnam, x_monnam } from './do_name.ts';
import { find_ac } from './do_wear.ts';
import { tamedog } from './dog.ts';
import { on_level } from './dungeon.ts';
import { Hear_again, Popeye, morehungry, vomit } from './eat.ts';
import { dealloc_killer, done, find_delayed_killer, panic } from './end.ts';
import { surface } from './engrave.ts';
import { inv_weight, monst_to_any, nomul, obj_to_any, spoteffects } from './hack.ts';
import { highc, s_suffix, strstri, strsubst, upstart } from './hacklib.ts';
import { carrying, sobj_at, update_inventory, useup, useupall } from './invent.ts';
import { arti_light_radius, candle_light_range, del_light_source, new_light_source } from './light.ts';
import { makemon } from './makemon.ts';
import { obj_extract_self, weight } from './mkobj.ts';
import { wake_nearby } from './mon.ts';
import { big_to_little, cantvomit, little_to_big, locomotion, name_to_mon } from './mondata.ts';
import { Yname2, an, doname, makeplural, the, xname } from './objnam.ts';
import { Norep, You, You_feel, You_hear, You_see, Your, impossible, pline, verbalize } from './pline.ts';
import { body_part, polymon, rehumanize } from './polyself.ts';
import { incr_itimeout, make_blinded, make_confused, make_deaf, make_glib, make_hallucinated, make_slimed, make_stoned, make_stunned, make_vomiting, set_itimeout } from './potion.ts';
import { stuck_in_wall } from './pray.ts';
import { lookup_id_mapping, mread } from './restore.ts';
import { d, rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { Shk_Your, find_oid, obfree } from './shk.ts';
import { dismount_steed } from './steed.ts';
import { enexto } from './teleport.ts';
import { float_down, instapetrify, unconscious } from './trap.ts';
import { you_unwere } from './were.ts';
import { worm_known } from './worm.ts';
import { buzz, get_obj_location, melt_ice_away } from './zap.ts';
import { struct_fe, struct_kinfo, struct_monst, struct_nhcoord, struct_obj, struct_propname, struct_ttable, union_any } from './structs.ts';
import { $at2, $peq, $rd, $sadd, $sarrOf, $sat, $sdiff, $shl64, $sidx, $u64, $wr, G, P, S, free, memset, sprintf, strchr, strcpy, strlen } from './rt/index.ts';
import { ACID_RES, ADORNED, AGGRAVATE_MONSTER, AMULET_OF_STRANGULATION, ANTIMAGIC, ARTICLE_NONE, ARTICLE_THE, A_CON, A_DEX, A_STR, BLINDED, BRASS_LANTERN, BURIED_TOO, BURN_OBJECT, CANDELABRUM_OF_INVOCATION, CLAIRVOYANT, CLOUD, COLD_RES, COLNO, CONFLICT, CONFUSION, CONTAINED_TOO, CORPSE, DEAF, DETECT_MONSTERS, DIED, DISINT_RES, DISMOUNT_FELL, DISPLACED, DOOR, DRAIN_RES, ENERGY_REGENERATION, FAINTING, FALSE, FAST, FIG_TRANSFORM, FIRE_RES, FIXED_ABIL, FLYING, FOOT, FREE_ACTION, FROMOUTSIDE, FULL_MOON, FUMBLING, GENOCIDED, GLIB, G_EXTINCT, G_GENOD, G_UNIQ, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HATCH_EGG, HUNGER, INFRAVISION, INVIS, INVULNERABLE, I_SPECIAL, JUMPING, KILLED_BY, KILLED_BY_AN, LEVITATION, LIFESAVED, LOW_PM, LS_MONSTER, LS_OBJECT, LUCKSTONE, MAGICAL_BREATHING, MAGIC_LAMP, MAX_EGG_HATCH_TIME, MV_KNOWS_EGG, M_AP_MONSTER, NECK, NHW_MENU, NON_PM, NO_KILLER_PREFIX, NO_MINVENT, NUM_TIMER_KINDS, NUM_TIME_FUNCS, OBJ_INVENT, OBJ_MIGRATING, PASSES_WALLS, PLNMSG_OK_DONT_DIE, PLNMSG_ONE_ITEM_HERE, PM_GREEN_SLIME, POISONING, POISON_RES, POLYMORPH, POLYMORPH_CONTROL, POT_OIL, PROTECTION, PROT_FROM_SHAPE_CHANGERS, RANGE_GLOBAL, RANGE_LEVEL, REFLECTING, REGENERATION, ROCK, ROWNO, SEARCHING, SEE_INVIS, SHOCK_RES, SICK, SICK_RES, SLEEPY, SLEEP_RES, SLIMED, SLOW_DIGESTION, STEALTH, STONED, STONE_RES, STONING, STRANGLED, STUNNED, SUPPRESS_SADDLE, SWIMMING, S_DRAGON, S_LIGHT, TELEPAT, TELEPORT, TELEPORT_CONTROL, TIMEOUT, TIMER_GLOBAL, TIMER_LEVEL, TIMER_MONSTER, TIMER_OBJECT, TRUE, TURNED_SLIME, UNCHANGING, VOMITING, WARNING, WARN_OF_MON, WARN_UNDEAD, WIN_ERR, WOUNDED_LEGS, WWALKING } from './consts.ts';

let stoned_texts: any;
let vomiting_texts: any;
let choke_texts: any;
let choke_texts2: any;
let levi_texts: any;
let slime_texts: any;
let phaze_texts: any;
let timer_base: any;
let timer_id: any;
let timeout_funcs: any;

async function stoned_dialogue(): Promise<void> {
  let i = G.u.uprops[STONED].intrinsic & TIMEOUT;
  if (i > 0 && i <= (Math.trunc(40 / 8) | 0)) {
    let buf = new Int8Array(256);
    strcpy(P(buf), stoned_texts[(Math.trunc(40 / 8) | 0) - i]);
    if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576 && strstri(P(buf), S("limbs"))) {
      strsubst(P(buf), S("limbs"), S("extremities"));
    }
    await pline(S("%s"), P(buf));
  }
  switch (i | 0) {
  case 5:
    G.u.uprops[FAST].intrinsic = 0;
    if (G.multi > 0) {
      nomul(0);
    }
    break;
  case 4:
    if (!Popeye(STONED)) {
      await stop_occupation();
    }
    if (G.multi > 0) {
      nomul(0);
    }
    break;
  case 3:
    await stop_occupation();
    nomul(-3);
    G.multi_reason = S("getting stoned");
    G.nomovemsg = G.c_common_strings.c_You_can_move_again;
    if ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) && !G.u.usteed) {
      await heal_legs(2);
    }
    break;
  case 2:
    if ((G.u.uprops[DEAF].intrinsic & TIMEOUT) > 0 && (G.u.uprops[DEAF].intrinsic & TIMEOUT) < 5) {
      set_itimeout(P(G.u.uprops[DEAF], "intrinsic"), 5);
    }
    if (G.u.uprops[VOMITING].intrinsic) {
      await make_vomiting(0, FALSE);
    }
    if (G.u.uprops[SLIMED].intrinsic) {
      await make_slimed(0, null);
    }
    break;
  default:
    break;
  }
  await exercise(A_DEX, FALSE);
}

async function vomiting_dialogue(): Promise<void> {
  let txt = null;
  let v = G.u.uprops[VOMITING].intrinsic & TIMEOUT;
  switch (v - 1 | 0) {
  case 14:
    txt = vomiting_texts[0];
    break;
  case 11:
    txt = vomiting_texts[1];
    break;
  case 6:
    await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + d(2, 4), FALSE);
    if (!Popeye(VOMITING)) {
      await stop_occupation();
    }
  case 9:
    await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + d(2, 4), FALSE);
    if (G.multi > 0) {
      nomul(0);
    }
    break;
  case 8:
    txt = vomiting_texts[2];
    break;
  case 5:
    txt = vomiting_texts[3];
    break;
  case 2:
    txt = vomiting_texts[4];
    if (cantvomit(G.youmonst.data)) {
      txt = S("gag uncontrollably.");
    } else if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      txt = S("are about to hurl!");
    }
    break;
  case 0:
    await stop_occupation();
    if (!cantvomit(G.youmonst.data)) {
      await morehungry(20);
      if (G.u.uhs < FAINTING) {
        await You(S("%s!"), !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? S("vomit") : S("hurl chunks"));
      }
    }
    await vomit();
    break;
  default:
    break;
  }
  if (txt) {
    await You(S("%s"), txt);
  }
  await exercise(A_CON, FALSE);
}

async function choke_dialogue(): Promise<void> {
  let i = G.u.uprops[STRANGLED].intrinsic & TIMEOUT;
  if (i > 0 && i <= (Math.trunc(40 / 8) | 0)) {
    if (G.u.uprops[MAGICAL_BREATHING].intrinsic || G.u.uprops[MAGICAL_BREATHING].extrinsic || (G.youmonst.data.mflags1 & 1024) >>> 0 !== 0 || !rn2(50)) {
      await pline(choke_texts2[(Math.trunc(40 / 8) | 0) - i], body_part(NECK));
    } else {
      let str = choke_texts[(Math.trunc(40 / 8) | 0) - i];
      if (strchr(str, 37)) {
        await pline(str, hcolor(G.c_color_names.c_blue));
      } else {
        await pline(S("%s"), str);
      }
    }
  }
  await exercise(A_STR, FALSE);
}

async function levitation_dialogue(): Promise<void> {
  let i = Math.trunc(((G.u.uprops[LEVITATION].intrinsic & TIMEOUT) - 1) / 2);
  if (G.u.uprops[LEVITATION].extrinsic) {
    return;
  }
  if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ >= DOOR) && !is_pool_or_lava(G.u.ux, G.u.uy)) {
    return;
  }
  if ((G.u.uprops[LEVITATION].intrinsic & TIMEOUT) % 2 && i > 0 && i <= (Math.trunc(16 / 8) | 0)) {
    let s = levi_texts[(Math.trunc(16 / 8) | 0) - i];
    if (strchr(s, 37)) {
      let danger = (is_pool_or_lava(G.u.ux, G.u.uy) && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) ? 1 : 0) << 24 >> 24;
      await pline(s, danger ? S("over") : S("in"), danger ? surface(G.u.ux, G.u.uy) : S("air"));
    } else {
      await pline(S("%s"), s);
    }
  }
}

async function slime_dialogue(): Promise<void> {
  let i = Math.trunc((G.u.uprops[SLIMED].intrinsic & TIMEOUT) / 2);
  if (i === 1) {
    G.youmonst.m_ap_type = M_AP_MONSTER;
    G.youmonst.mappearance = PM_GREEN_SLIME;
  }
  if ((G.u.uprops[SLIMED].intrinsic & TIMEOUT) % 2 && i >= 0 && i < (Math.trunc(40 / 8) | 0)) {
    let buf = new Int8Array(256);
    strcpy(P(buf), slime_texts[(Math.trunc(40 / 8) | 0) - i - 1]);
    if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576 && strstri(P(buf), S("limbs"))) {
      strsubst(P(buf), S("limbs"), S("extremities"));
    }
    if (strchr(P(buf), 37)) {
      if (i === 4) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await pline(P(buf), hcolor(G.c_color_names.c_green));
        }
      } else {
        await pline(P(buf), await an(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("green slime")));
      }
    } else {
      await pline(S("%s"), P(buf));
    }
  }
  switch (i) {
  case 3:
    G.u.uprops[FAST].intrinsic = 0;
    if (!Popeye(SLIMED)) {
      await stop_occupation();
    }
    if (G.multi > 0) {
      nomul(0);
    }
    break;
  case 2:
    if ((G.u.uprops[DEAF].intrinsic & TIMEOUT) > 0 && (G.u.uprops[DEAF].intrinsic & TIMEOUT) < 5) {
      set_itimeout(P(G.u.uprops[DEAF], "intrinsic"), 5);
    }
    break;
  case 1:
    if (G.u.uprops[STONED].intrinsic) {
      await make_stoned(0, null, KILLED_BY_AN, null);
    }
    break;
  }
  await exercise(A_DEX, FALSE);
}

export async function burn_away_slime(): Promise<void> {
  if (G.u.uprops[SLIMED].intrinsic) {
    await make_slimed(0, S("The slime that covers you is burned away!"));
  }
}

async function slimed_to_death(kptr: struct_kinfo | null): Promise<void> {
  let save_mvflags = 0;
  if (G.u.umonnum !== G.u.umonster && G.youmonst.data === $sat(G.mons, PM_GREEN_SLIME)) {
    await dealloc_killer(kptr);
    return;
  }
  if (kptr && kptr.name[0]) {
    G.killer.format = kptr.format;
    strcpy(P(G.killer.name), P(kptr.name));
  } else {
    G.killer.format = NO_KILLER_PREFIX;
    strcpy(P(G.killer.name), S("turned into green slime"));
  }
  await dealloc_killer(kptr);
  if (G.youmonst.data.mlet === S_LIGHT || G.youmonst.data === $sat(G.mons, 30) || G.youmonst.data === $sat(G.mons, 31) || G.youmonst.data === $sat(G.mons, 110) ? 1 : G.youmonst.data === $sat(G.mons, 152) ? 1 : 0) {
    await del_light_source(LS_MONSTER, monst_to_any(G.youmonst));
  }
  save_mvflags = G.mvitals[PM_GREEN_SLIME].mvflags;
  G.mvitals[PM_GREEN_SLIME].mvflags = (save_mvflags & ~G_GENOD) & 0xff;
  await polymon(PM_GREEN_SLIME);
  G.mvitals[PM_GREEN_SLIME].mvflags = save_mvflags;
  await done_timeout(TURNED_SLIME, SLIMED);
  if ((G.mvitals[PM_GREEN_SLIME].mvflags & G_GENOD) !== 0) {
    let slimebuf = new Int8Array(256);
    G.killer.format = KILLED_BY;
    strcpy(P(G.killer.name), S("slimicide"));
    strcpy(P(slimebuf), S("green slime has been genocided..."));
    if (G.iflags.last_msg === PLNMSG_OK_DONT_DIE) {
      await pline(S("Yes, you do.  %s"), upstart(P(slimebuf)));
    } else {
      await pline(S("Unfortunately, %s"), P(slimebuf));
    }
    await done(GENOCIDED);
  }
  return;
}

async function phaze_dialogue(): Promise<void> {
  let i = Math.trunc((G.u.uprops[PASSES_WALLS].intrinsic & TIMEOUT) / 2);
  if (G.u.uprops[PASSES_WALLS].extrinsic || G.u.uprops[PASSES_WALLS].intrinsic & ~TIMEOUT) {
    return;
  }
  if ((G.u.uprops[PASSES_WALLS].intrinsic & TIMEOUT) % 2 && i > 0 && i <= (Math.trunc(16 / 8) | 0)) {
    await pline(S("%s"), phaze_texts[(Math.trunc(16 / 8) | 0) - i]);
  }
}

async function done_timeout(how: number, which: number): Promise<void> {
  let intrinsic_p = P(G.u.uprops[which], "intrinsic");
  intrinsic_p.a[intrinsic_p.o] = intrinsic_p.a[intrinsic_p.o] | I_SPECIAL;
  await done(how);
  intrinsic_p.a[intrinsic_p.o] = intrinsic_p.a[intrinsic_p.o] & ~I_SPECIAL;
  G.context.botl = TRUE;
}

export async function nh_timeout(): Promise<void> {
  let $t1: any;
  let upp = null;
  let kptr = null;
  let was_flying = 0;
  let sleeptime = 0;
  let m_idx = 0;
  let baseluck = G.flags.moonphase === FULL_MOON ? 1 : 0;
  if (G.flags.friday13) {
    baseluck -= 1;
  }
  if (G.u.uluck !== baseluck && G.moves % (G.u.uhave.amulet | 0 || G.u.ugangr ? 300 : 600) === 0) {
    let time_luck = stone_luck(FALSE);
    let nostone = (!carrying(LUCKSTONE) && !stone_luck(TRUE) ? 1 : 0) << 24 >> 24;
    if (G.u.uluck > baseluck && (nostone || time_luck < 0)) {
      G.u.uluck = G.u.uluck - 1 << 24 >> 24;
    } else if (G.u.uluck < baseluck && (nostone || time_luck > 0)) {
      G.u.uluck = G.u.uluck + 1 << 24 >> 24;
    }
  }
  if (G.u.uinvulnerable) {
    return;
  }
  if (G.u.uprops[STONED].intrinsic) {
    await stoned_dialogue();
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    await slime_dialogue();
  }
  if (G.u.uprops[VOMITING].intrinsic) {
    await vomiting_dialogue();
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    await choke_dialogue();
  }
  if (G.u.uprops[LEVITATION].intrinsic & TIMEOUT) {
    await levitation_dialogue();
  }
  if (G.u.uprops[PASSES_WALLS].intrinsic & TIMEOUT) {
    await phaze_dialogue();
  }
  if (G.u.mtimedone && !--G.u.mtimedone) {
    if (G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic) {
      G.u.mtimedone = rnd(100 * G.youmonst.data.mlevel + 1);
    } else if ((G.youmonst.data.mflags2 & 4) >>> 0 !== 0) {
      await you_unwere(FALSE);
    } else {
      await rehumanize();
    }
  }
  if (G.u.ucreamed) {
    G.u.ucreamed = G.u.ucreamed - 1 >>> 0;
  }
  if (G.u.usptime) {
    if ((G.u.usptime = G.u.usptime - 1 & 0xff) === 0 && G.u.uspellprot) {
      G.u.usptime = G.u.uspmtime;
      G.u.uspellprot = G.u.uspellprot - 1 & 0xff;
      find_ac();
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await Norep(S("The %s haze around you %s."), hcolor(G.c_color_names.c_golden), G.u.uspellprot ? S("becomes less dense") : S("disappears"));
      }
    }
  }
  if (G.u.ugallop) {
    if (--G.u.ugallop === 0 && G.u.usteed) {
      await pline(S("%s stops galloping."), await Monnam(G.u.usteed));
    }
  }
  was_flying = ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? 1 : 0) << 24 >> 24;
  for (upp = G.u.uprops[0]; $sidx(upp) < $sidx($sadd(G.u.uprops[0], Math.trunc(1632 / 24) | 0)); upp = $sadd(upp, 1)) {
    if (upp.intrinsic & TIMEOUT && !(--upp.intrinsic & TIMEOUT)) {
      kptr = find_delayed_killer($sdiff(upp, G.u.uprops[0]) | 0);
      switch ($sdiff(upp, G.u.uprops[0])) {
      case STONED:
        if (kptr && kptr.name[0]) {
          G.killer.format = kptr.format;
          strcpy(P(G.killer.name), P(kptr.name));
        } else {
          G.killer.format = NO_KILLER_PREFIX;
          strcpy(P(G.killer.name), S("killed by petrification"));
        }
        await dealloc_killer(kptr);
        await done_timeout(STONING, STONED);
        break;
      case SLIMED:
        await slimed_to_death(kptr);
        break;
      case VOMITING:
        await make_vomiting(0, TRUE);
        break;
      case SICK:
        await You(S("die from your illness."));
        if (kptr && kptr.name[0]) {
          G.killer.format = kptr.format;
          strcpy(P(G.killer.name), P(kptr.name));
        } else {
          G.killer.format = KILLED_BY_AN;
          G.killer.name[0] = 0;
        }
        await dealloc_killer(kptr);
        if ((m_idx = name_to_mon(P(G.killer.name))) >= LOW_PM) {
          if (($sat(G.mons, m_idx).mflags2 & 524288) >>> 0 !== 0) {
            G.killer.format = KILLED_BY;
          } else if (G.mons[m_idx].geno & G_UNIQ) {
            strcpy(P(G.killer.name), await the(P(G.killer.name)));
            G.killer.format = KILLED_BY;
          }
        }
        await done_timeout(POISONING, SICK);
        G.u.usick_type = 0;
        break;
      case FAST:
        if (!(G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic)) {
          await You_feel(S("yourself slowing down%s."), G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic ? S(" a bit") : S(""));
        }
        break;
      case CONFUSION:
        set_itimeout(P(G.u.uprops[CONFUSION], "intrinsic"), 1);
        await make_confused(0, TRUE);
        if (!G.u.uprops[CONFUSION].intrinsic) {
          await stop_occupation();
        }
        break;
      case STUNNED:
        set_itimeout(P(G.u.uprops[STUNNED], "intrinsic"), 1);
        await make_stunned(0, TRUE);
        if (!G.u.uprops[STUNNED].intrinsic) {
          await stop_occupation();
        }
        break;
      case BLINDED:
        set_itimeout(P(G.u.uprops[BLINDED], "intrinsic"), 1);
        await make_blinded(0, TRUE);
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await stop_occupation();
        }
        break;
      case DEAF:
        set_itimeout(P(G.u.uprops[DEAF], "intrinsic"), 1);
        await make_deaf(0, TRUE);
        G.context.botl = TRUE;
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await stop_occupation();
        }
        break;
      case INVIS:
        await newsym(G.u.ux, G.u.uy);
        if (!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) && !G.u.uprops[INVIS].blocked && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await You(!(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) ? S("are no longer invisible.") : S("can no longer see through yourself."));
          await stop_occupation();
        }
        break;
      case SEE_INVIS:
        set_mimic_blocking();
        await see_monsters();
        await newsym(G.u.ux, G.u.uy);
        await stop_occupation();
        break;
      case WOUNDED_LEGS:
        await heal_legs(0);
        await stop_occupation();
        break;
      case HALLUC:
        set_itimeout(P(G.u.uprops[HALLUC], "intrinsic"), 1);
        await make_hallucinated(0, TRUE, 0);
        if (!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic))) {
          await stop_occupation();
        }
        break;
      case SLEEPY:
        if (unconscious() || (G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
          incr_itimeout(P(G.u.uprops[SLEEPY], "intrinsic"), rnd(100));
        } else if (G.u.uprops[SLEEPY].intrinsic || G.u.uprops[SLEEPY].extrinsic) {
          await You(S("fall asleep."));
          sleeptime = rnd(20);
          await fall_asleep(-sleeptime, TRUE);
          incr_itimeout(P(G.u.uprops[SLEEPY], "intrinsic"), sleeptime + rnd(100));
        }
        break;
      case LEVITATION:
        await float_down(I_SPECIAL | TIMEOUT, 0);
        break;
      case FLYING:
        if (was_flying && !((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
          G.context.botl = 1;
          await You(S("land."));
          await spoteffects(TRUE);
        }
        break;
      case WARN_OF_MON:
        if (!(G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic)) {
          G.context.warntype.speciesidx = NON_PM;
          if (G.context.warntype.species) {
            await You(S("are no longer warned about %s."), await makeplural(G.context.warntype.species.mname));
            G.context.warntype.species = null;
          }
        }
        break;
      case PASSES_WALLS:
        if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic)) {
          if (stuck_in_wall()) {
            await You_feel(S("hemmed in again."));
          } else {
            await pline(S("You're back to your %s self again."), !(G.u.umonnum !== G.u.umonster) ? S("normal") : S("unusual"));
          }
        }
        break;
      case STRANGLED:
        G.killer.format = KILLED_BY;
        strcpy(P(G.killer.name), G.u.uburied | 0 ? S("suffocation") : S("strangulation"));
        await done_timeout(DIED, STRANGLED);
        if (G.uamul && G.uamul.otyp === AMULET_OF_STRANGULATION) {
          await Your(S("amulet vanishes!"));
          await useup(G.uamul);
        }
        break;
      case FUMBLING:
        if (G.u.umoved && !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked)) {
          await slip_or_trip();
          nomul(-2);
          G.multi_reason = S("fumbling");
          G.nomovemsg = S("");
          if (inv_weight() > -500) {
            await You(S("make a lot of noise!"));
            wake_nearby();
          }
        }
        ($t1 = G.u.uprops[FUMBLING], $t1.intrinsic = $t1.intrinsic & ~FROMOUTSIDE);
        if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
          incr_itimeout(P(G.u.uprops[FUMBLING], "intrinsic"), rnd(20));
        }
        break;
      case DETECT_MONSTERS:
        await see_monsters();
        break;
      case GLIB:
        make_glib(0);
        break;
      }
    }
  }
  await run_timers();
}

export async function fall_asleep(how_long: number, wakeup_msg: number): Promise<void> {
  await stop_occupation();
  nomul(how_long);
  G.multi_reason = S("sleeping");
  if (wakeup_msg && G.multi === how_long) {
    incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), how_long);
    G.context.botl = TRUE;
    G.afternmv = Hear_again;
  }
  G.u.usleep = G.monstermoves;
  G.nomovemsg = wakeup_msg ? S("You wake up.") : G.c_common_strings.c_You_can_move_again;
}

export async function attach_egg_hatch_timeout(egg: struct_obj | null, when: number): Promise<void> {
  let i = 0;
  await stop_timer(HATCH_EGG, obj_to_any(egg));
  if (!when) {
    for (i = MAX_EGG_HATCH_TIME - 50 + 1; i <= MAX_EGG_HATCH_TIME; ++i) {
      if (rnd(i) > 150) {
        when = i;
        break;
      }
    }
  }
  if (when) {
    await start_timer(when, TIMER_OBJECT, HATCH_EGG, obj_to_any(egg));
  }
}

export async function kill_egg(egg: struct_obj | null): Promise<void> {
  await stop_timer(HATCH_EGG, obj_to_any(egg));
}

export async function hatch_egg(arg: union_any | null, timeout: number): Promise<void> {
  let egg = null;
  let mon = null;
  let mon2 = null;
  let cc = new struct_nhcoord();
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let yours = 0;
  let silent = 0;
  let knows_egg = FALSE;
  let cansee_hatchspot = FALSE;
  let i = 0;
  let mnum = 0;
  let hatchcount = 0;
  egg = arg.a_obj;
  if (egg.corpsenm === NON_PM) {
    return;
  }
  mon = mon2 = null;
  mnum = big_to_little(egg.corpsenm);
  yours = (egg.spe || !G.flags.female && egg.where === 3 && !rn2(2) ? 1 : 0) << 24 >> 24;
  silent = (timeout !== G.monstermoves ? 1 : 0) << 24 >> 24;
  if (get_obj_location(egg, P(x, 0), P(y, 0), 0)) {
    hatchcount = rnd(egg.quan | 0);
    cansee_hatchspot = ($rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 && !silent ? 1 : 0) << 24 >> 24;
    if (!(G.mons[mnum].geno & G_UNIQ) && !(G.mvitals[mnum].mvflags & (G_GENOD | G_EXTINCT))) {
      for (i = hatchcount; i > 0; --i) {
        if (!await enexto(cc, x[0], y[0], $sat(G.mons, mnum)) || !(mon = await makemon($sat(G.mons, mnum), cc.x, cc.y, NO_MINVENT))) {
          break;
        }
        if (yours && !silent || egg.where === 3 && mon.data.mlet === S_DRAGON) {
          if (await tamedog(mon, null)) {
            if (egg.where === 3 && mon.data.mlet !== S_DRAGON) {
              mon.mtame = 20;
            }
          }
        }
        if (G.mvitals[mnum].mvflags & G_EXTINCT) {
          break;
        }
        mon2 = mon;
      }
      if (!mon) {
        mon = mon2;
      }
      hatchcount -= i;
      egg.quan -= hatchcount;
    }
  }
  if (mon) {
    let monnambuf = new Int8Array(256);
    let carriedby = new Int8Array(256);
    let siblings = (hatchcount > 1 ? 1 : 0) << 24 >> 24;
    let redraw = FALSE;
    if (cansee_hatchspot) {
      sprintf(P(monnambuf), S("%s%s"), siblings ? S("some ") : S(""), siblings ? await makeplural(await m_monnam(mon)) : await an(await m_monnam(mon)));
    }
    switch (egg.where) {
    case 3:
      knows_egg = TRUE;
      if (!cansee_hatchspot) {
        await You_feel(S("%s %s from your pack!"), G.c_common_strings.c_something, locomotion(mon.data, S("drop")));
      } else {
        await You_see(S("%s %s out of your pack!"), P(monnambuf), locomotion(mon.data, S("drop")));
      }
      if (yours) {
        await pline(S("%s cries sound like \"%s%s\""), siblings ? S("Their") : S("Its"), G.flags.female ? S("mommy") : S("daddy"), egg.spe ? S(".") : S("?"));
      } else if (mon.data.mlet === S_DRAGON && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await verbalize(S("Gleep!"));
      }
      break;
    case 1:
      if (cansee_hatchspot) {
        knows_egg = TRUE;
        await You_see(S("%s hatch."), P(monnambuf));
        redraw = TRUE;
      }
      break;
    case 4:
      if (cansee_hatchspot) {
        mon2 = egg.v.v_ocarry;
        if ((mon2.wormno | 0 ? worm_known(mon2) : $rd(G.viz_array.a[G.viz_array.o + mon2.my], mon2.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon2 && mon2.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon2.my], mon2.mx) & 1 ? 1 : 0) && ((!mon2.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon2.mundetected) && (!mon2.wormno || $rd(G.viz_array.a[G.viz_array.o + mon2.my], mon2.mx) & 2)) {
          sprintf(P(carriedby), S("%s pack"), s_suffix(await a_monnam(mon2)));
          knows_egg = TRUE;
        } else if (is_pool(mon.mx, mon.my)) {
          strcpy(P(carriedby), S("empty water"));
        } else {
          strcpy(P(carriedby), S("thin air"));
        }
        await You_see(S("%s %s out of %s!"), P(monnambuf), locomotion(mon.data, S("drop")), P(carriedby));
      }
      break;
    default:
      await impossible(S("egg hatched where? (%d)"), egg.where);
      break;
    }
    if (cansee_hatchspot && knows_egg) {
      learn_egg_type(mnum);
    }
    if (egg.quan > 0) {
      await attach_egg_hatch_timeout(egg, rnd(12));
    } else if (egg.where === 3) {
      await useup(egg);
    } else {
      await obj_extract_self(egg);
      await obfree(egg, null);
    }
    if (redraw) {
      await newsym(x[0], y[0]);
    }
  }
}

export function learn_egg_type(mnum: number): void {
  let $t1: any;
  mnum = little_to_big(mnum);
  ($t1 = G.mvitals[mnum], $t1.mvflags = ($t1.mvflags | MV_KNOWS_EGG) & 0xff);
  update_inventory();
}

export async function attach_fig_transform_timeout(figurine: struct_obj | null): Promise<void> {
  let i = 0;
  await stop_timer(FIG_TRANSFORM, obj_to_any(figurine));
  i = rnd(9000) + 200;
  await start_timer(i, TIMER_OBJECT, FIG_TRANSFORM, obj_to_any(figurine));
}

async function slip_or_trip(): Promise<void> {
  let otmp = G.level.objects[G.u.ux][G.u.uy];
  let otmp2 = null;
  let what = null;
  let buf = new Int8Array(256);
  let on_foot = TRUE;
  if (G.u.usteed) {
    on_foot = FALSE;
  }
  if (otmp && on_foot && !G.u.uinwater && is_pool(G.u.ux, G.u.uy)) {
    otmp = null;
  }
  if (otmp && on_foot) {
    what = G.iflags.last_msg === PLNMSG_ONE_ITEM_HERE ? otmp.quan === 1 ? S("it") : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("they") : S("them") : otmp.dknown | 0 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? await doname(otmp) : !(otmp2 = sobj_at(ROCK, G.u.ux, G.u.uy)) ? G.c_common_strings.c_something : otmp2.quan === 1 ? S("a rock") : S("some rocks");
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      what = strcpy(P(buf), what);
      buf[0] = highc(buf[0]);
      await pline(S("Egads!  %s bite%s your %s!"), what, !otmp || otmp.quan === 1 ? S("s") : S(""), body_part(FOOT));
    } else {
      await You(S("trip over %s."), what);
    }
    if (!G.uarmf && otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
      sprintf(P(G.killer.name), S("tripping over %s corpse"), await an(G.mons[otmp.corpsenm].mname));
      await instapetrify(P(G.killer.name));
    }
  } else if (rn2(3) && is_ice(G.u.ux, G.u.uy)) {
    await pline(S("%s %s%s on the ice."), G.u.usteed ? upstart(await x_monnam(G.u.usteed, G.u.usteed.mextra && G.u.usteed.mextra.mname ? ARTICLE_NONE : ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE)) : S("You"), rn2(2) ? S("slip") : S("slide"), on_foot ? S("") : S("s"));
  } else {
    if (on_foot) {
      switch (rn2(4)) {
      case 1:
        await You(S("trip over your own %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("elbow") : await makeplural(body_part(FOOT)));
        break;
      case 2:
        await You(S("slip %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("on a banana peel") : S("and nearly fall"));
        break;
      case 3:
        await You(S("flounder."));
        break;
      default:
        await You(S("stumble."));
        break;
      }
    } else {
      switch (rn2(4)) {
      case 1:
        await Your(S("%s slip out of the stirrups."), await makeplural(body_part(FOOT)));
        break;
      case 2:
        await You(S("let go of the reins."));
        break;
      case 3:
        await You(S("bang into the saddle-horn."));
        break;
      default:
        await You(S("slide to one side of the saddle."));
        break;
      }
      await dismount_steed(DISMOUNT_FELL);
    }
  }
}

async function see_lamp_flicker(obj: struct_obj | null, tailer: Ptr | null): Promise<void> {
  switch (obj.where) {
  case 3:
  case 4:
    await pline(S("%s flickers%s."), await Yname2(obj), tailer);
    break;
  case 1:
    await You_see(S("%s flicker%s."), await an(await xname(obj)), tailer);
    break;
  }
}

async function lantern_message(obj: struct_obj | null): Promise<void> {
  switch (obj.where) {
  case 3:
    await Your(S("lantern is getting dim."));
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await pline(S("Batteries have not been invented yet."));
    }
    break;
  case 1:
    await You_see(S("a lantern getting dim."));
    break;
  case 4:
    await pline(S("%s lantern is getting dim."), s_suffix(await Monnam(obj.v.v_ocarry)));
    break;
  }
}

export async function burn_object(arg: union_any | null, timeout: number): Promise<void> {
  let obj = arg.a_obj;
  let canseeit = 0;
  let many = 0;
  let menorah = 0;
  let need_newsym = 0;
  let need_invupdate = 0;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let whose = new Int8Array(256);
  menorah = (obj.otyp === CANDELABRUM_OF_INVOCATION ? 1 : 0) << 24 >> 24;
  many = (menorah ? obj.spe > 1 ? 1 : 0 : obj.quan > 1 ? 1 : 0) << 24 >> 24;
  if (timeout !== G.monstermoves) {
    let how_long = G.monstermoves - timeout;
    if (how_long >= obj.age) {
      obj.age = 0;
      await end_burn(obj, FALSE);
      if (menorah) {
        obj.spe = 0;
        obj.owt = await weight(obj) >>> 0;
      } else if (obj.otyp === 199 || obj.otyp === 200 || obj.otyp === POT_OIL) {
        await obj_extract_self(obj);
        await obfree(obj, null);
        obj = null;
      }
    } else {
      obj.age -= how_long;
      await begin_burn(obj, TRUE);
    }
    return;
  }
  if (get_obj_location(obj, P(x, 0), P(y, 0), 0)) {
    canseeit = (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && $rd(G.viz_array.a[G.viz_array.o + y[0]], x[0]) & 2 ? 1 : 0) << 24 >> 24;
    await Shk_Your(P(whose), obj);
  } else {
    canseeit = FALSE;
  }
  need_newsym = need_invupdate = FALSE;
  switch (obj.otyp) {
  case 296:
    if (canseeit) {
      switch (obj.where) {
      case 3:
        need_invupdate = TRUE;
      case 4:
        await pline(S("%spotion of oil has burnt away."), P(whose));
        break;
      case 1:
        await You_see(S("a burning potion of oil go out."));
        need_newsym = TRUE;
        break;
      }
    }
    await end_burn(obj, FALSE);
    if (obj.where === 3) {
      await useupall(obj);
    } else {
      if (obj.where === OBJ_MIGRATING) {
        obj.owornmask = 0;
      }
      await obj_extract_self(obj);
      await obfree(obj, null);
    }
    obj = null;
    break;
  case 201:
  case 202:
    switch (obj.age | 0) {
    case 150:
    case 100:
    case 50:
      if (canseeit) {
        if (obj.otyp === BRASS_LANTERN) {
          await lantern_message(obj);
        } else {
          await see_lamp_flicker(obj, obj.age === 50 ? S(" considerably") : S(""));
        }
      }
      break;
    case 25:
      if (canseeit) {
        if (obj.otyp === BRASS_LANTERN) {
          await lantern_message(obj);
        } else {
          switch (obj.where) {
          case 3:
          case 4:
            await pline(S("%s seems about to go out."), await Yname2(obj));
            break;
          case 1:
            await You_see(S("%s about to go out."), await an(await xname(obj)));
            break;
          }
        }
      }
      break;
    case 0:
      if (canseeit || obj.where === OBJ_INVENT) {
        switch (obj.where) {
        case 3:
          need_invupdate = TRUE;
        case 4:
          if (obj.otyp === BRASS_LANTERN) {
            await pline(S("%slantern has run out of power."), P(whose));
          } else {
            await pline(S("%s has gone out."), await Yname2(obj));
          }
          break;
        case 1:
          if (obj.otyp === BRASS_LANTERN) {
            await You_see(S("a lantern run out of power."));
          } else {
            await You_see(S("%s go out."), await an(await xname(obj)));
          }
          break;
        }
      }
      await end_burn(obj, FALSE);
      break;
    default:
      break;
    }
    if (obj.age) {
      await begin_burn(obj, TRUE);
    }
    break;
  case 237:
  case 199:
  case 200:
    switch (obj.age) {
    case 75:
      if (canseeit) {
        switch (obj.where) {
        case 3:
        case 4:
          await pline(S("%s%scandle%s getting short."), P(whose), menorah ? S("candelabrum's ") : S(""), many ? S("s are") : S(" is"));
          break;
        case 1:
          await You_see(S("%scandle%s getting short."), menorah ? S("a candelabrum's ") : many ? S("some ") : S("a "), many ? S("s") : S(""));
          break;
        }
      }
      break;
    case 15:
      if (canseeit) {
        switch (obj.where) {
        case 3:
        case 4:
          await pline(S("%s%scandle%s flame%s flicker%s low!"), P(whose), menorah ? S("candelabrum's ") : S(""), many ? S("s'") : S("'s"), many ? S("s") : S(""), many ? S("") : S("s"));
          break;
        case 1:
          await You_see(S("%scandle%s flame%s flicker low!"), menorah ? S("a candelabrum's ") : many ? S("some ") : S("a "), many ? S("s'") : S("'s"), many ? S("s") : S(""));
          break;
        }
      }
      break;
    case 0:
      if (canseeit || obj.where === OBJ_INVENT) {
        if (menorah) {
          switch (obj.where) {
          case 3:
            need_invupdate = TRUE;
          case 4:
            await pline(S("%scandelabrum's flame%s."), P(whose), many ? S("s die") : S(" dies"));
            break;
          case 1:
            await You_see(S("a candelabrum's flame%s die."), many ? S("s") : S(""));
            break;
          }
        } else {
          switch (obj.where) {
          case 3:
          case 4:
            await pline(S("%s %s consumed!"), await Yname2(obj), many ? S("are") : S("is"));
            break;
          case 1:
            await You_see(S("%s%s consumed!"), many ? S("some ") : S(""), many ? await xname(obj) : await an(await xname(obj)));
            need_newsym = TRUE;
            break;
          }
          await pline(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? many ? S("They shriek!") : S("It shrieks!") : (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("") : many ? S("Their flames die.") : S("Its flame dies."));
        }
      }
      await end_burn(obj, FALSE);
      if (menorah) {
        obj.spe = 0;
        obj.owt = await weight(obj) >>> 0;
      } else {
        if (obj.where === 3) {
          await useupall(obj);
        } else {
          if (obj.where === OBJ_MIGRATING) {
            obj.owornmask = 0;
          }
          await obj_extract_self(obj);
          await obfree(obj, null);
        }
        obj = null;
      }
      break;
    default:
      break;
    }
    if (obj && obj.age) {
      await begin_burn(obj, TRUE);
    }
    break;
  default:
    await impossible(S("burn_object: unexpected obj %s"), await xname(obj));
    break;
  }
  if (need_newsym) {
    await newsym(x[0], y[0]);
  }
  if (need_invupdate) {
    update_inventory();
  }
}

export async function begin_burn(obj: struct_obj | null, already_lit: number): Promise<void> {
  let radius = 3;
  let turns = 0;
  let do_timer = TRUE;
  if (obj.age === 0 && obj.otyp !== MAGIC_LAMP && !artifact_light(obj)) {
    return;
  }
  switch (obj.otyp) {
  case 203:
    obj.lamplit = 1;
    do_timer = FALSE;
    break;
  case 296:
    turns = obj.age;
    if (obj.oeroded) {
      turns = Math.trunc((3 * turns + 2) / 4);
    }
    radius = 1;
    break;
  case 201:
  case 202:
    if (obj.age > 150) {
      turns = obj.age - 150;
    } else if (obj.age > 100) {
      turns = obj.age - 100;
    } else if (obj.age > 50) {
      turns = obj.age - 50;
    } else if (obj.age > 25) {
      turns = obj.age - 25;
    } else {
      turns = obj.age;
    }
    break;
  case 237:
  case 199:
  case 200:
    if (obj.age > 75) {
      turns = obj.age - 75;
    } else if (obj.age > 15) {
      turns = obj.age - 15;
    } else {
      turns = obj.age;
    }
    radius = candle_light_range(obj);
    break;
  default:
    if (artifact_light(obj)) {
      obj.lamplit = 1;
      do_timer = FALSE;
      radius = arti_light_radius(obj);
    } else {
      await impossible(S("begin burn: unexpected %s"), await xname(obj));
      turns = obj.age;
    }
    break;
  }
  if (do_timer) {
    if (await start_timer(turns, TIMER_OBJECT, BURN_OBJECT, obj_to_any(obj))) {
      obj.lamplit = 1;
      obj.age -= turns;
      if (obj.where === 3 && !already_lit) {
        update_inventory();
      }
    } else {
      obj.lamplit = 0;
    }
  } else {
    if (obj.where === 3 && !already_lit) {
      update_inventory();
    }
  }
  if (obj.lamplit | 0 && !already_lit) {
    const x = new Int8Array(1);
    const y = new Int8Array(1);
    if (get_obj_location(obj, P(x, 0), P(y, 0), CONTAINED_TOO | BURIED_TOO)) {
      await new_light_source(x[0], y[0], radius, LS_OBJECT, obj_to_any(obj));
    } else {
      await impossible(S("begin_burn: can't get obj position"));
    }
  }
}

export async function end_burn(obj: struct_obj | null, timer_attached: number): Promise<void> {
  if (!obj.lamplit) {
    await impossible(S("end_burn: obj %s not lit"), await xname(obj));
    return;
  }
  if (obj.otyp === MAGIC_LAMP || artifact_light(obj)) {
    timer_attached = FALSE;
  }
  if (!timer_attached) {
    await del_light_source(LS_OBJECT, obj_to_any(obj));
    obj.lamplit = 0;
    if (obj.where === OBJ_INVENT) {
      update_inventory();
    }
  } else if (!await stop_timer(BURN_OBJECT, obj_to_any(obj))) {
    await impossible(S("end_burn: obj %s not timed!"), await xname(obj));
  }
}

async function cleanup_burn(arg: union_any | null, expire_time: number): Promise<void> {
  let obj = arg.a_obj;
  if (!obj.lamplit) {
    await impossible(S("cleanup_burn: obj %s not lit"), await xname(obj));
    return;
  }
  await del_light_source(LS_OBJECT, obj_to_any(obj));
  obj.age += expire_time - G.monstermoves;
  obj.lamplit = 0;
  if (obj.where === OBJ_INVENT) {
    update_inventory();
  }
}

export async function do_storms(): Promise<void> {
  let nstrike = 0;
  let x = 0;
  let y = 0;
  let dirx = 0;
  let diry = 0;
  let count = 0;
  if (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) || rn2(8)) {
    return;
  }
  for (nstrike = rnd(64); nstrike <= 64; nstrike = nstrike * 2) {
    count = 0;
    do {
      x = rnd(COLNO - 1);
      y = rn2(ROWNO);
    } while (++count < 100 && $at2(G.level.locations, x, y).typ !== CLOUD);
    if (count < 100) {
      dirx = rn2(3) - 1;
      diry = rn2(3) - 1;
      if (dirx !== 0 || diry !== 0) {
        await buzz(-15, 8, x, y, dirx, diry);
      }
    }
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === CLOUD) {
    await pline(S("Kaboom!!!  Boom!!  Boom!!"));
    incr_itimeout(P(G.u.uprops[DEAF], "intrinsic"), rn2(20) + 30);
    G.context.botl = TRUE;
    if (!G.u.uinvulnerable) {
      await stop_occupation();
      nomul(-3);
      G.multi_reason = S("hiding from thunderstorm");
      G.nomovemsg = null;
    }
  } else {
    await You_hear(S("a rumbling noise."));
  }
}

function kind_name(kind: number): Ptr | null {
  switch (kind) {
  case TIMER_LEVEL:
    return S("level");
  case TIMER_GLOBAL:
    return S("global");
  case TIMER_OBJECT:
    return S("object");
  case TIMER_MONSTER:
    return S("monster");
  }
  return S("unknown");
}

async function print_queue(win: number, base: struct_fe | null): Promise<void> {
  let curr = null;
  let buf = new Int8Array(256);
  if (!base) {
    await G.windowprocs.win_putstr(win, 0, S(" <empty>"));
  } else {
    await G.windowprocs.win_putstr(win, 0, S("timeout  id   kind   call"));
    for (curr = base; curr; curr = curr.next) {
      sprintf(P(buf), S(" %4ld   %4ld  %-6s %s(%s)"), curr.timeout, curr.tid, kind_name(curr.kind), timeout_funcs[curr.func_index].name, fmt_ptr(curr.arg.a_void));
      await G.windowprocs.win_putstr(win, 0, P(buf));
    }
  }
}

export async function wiz_timeout_queue(): Promise<number> {
  let win = 0;
  let buf = new Int8Array(256);
  let propname = null;
  let intrinsic = 0;
  let i = 0;
  let p = 0;
  let count = 0;
  let longestlen = 0;
  let ln = 0;
  let specindx = 0;
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  if (win === WIN_ERR) {
    return 0;
  }
  sprintf(P(buf), S("Current time = %ld."), G.monstermoves);
  await G.windowprocs.win_putstr(win, 0, P(buf));
  await G.windowprocs.win_putstr(win, 0, S(""));
  await G.windowprocs.win_putstr(win, 0, S("Active timeout queue:"));
  await G.windowprocs.win_putstr(win, 0, S(""));
  await print_queue(win, timer_base[0]);
  count = longestlen = 0;
  for (i = 0; !!(propname = G.propertynames[i].prop_name); ++i) {
    p = G.propertynames[i].prop_num;
    intrinsic = G.u.uprops[p].intrinsic;
    if (intrinsic & TIMEOUT) {
      ++count;
      if ((ln = strlen(propname) | 0) > longestlen) {
        longestlen = ln;
      }
    }
    if (specindx === 0 && p === FIRE_RES) {
      specindx = i;
    }
  }
  await G.windowprocs.win_putstr(win, 0, S(""));
  if (!count) {
    await G.windowprocs.win_putstr(win, 0, S("No timed properties."));
  } else {
    await G.windowprocs.win_putstr(win, 0, S("Timed properties:"));
    await G.windowprocs.win_putstr(win, 0, S(""));
    for (i = 0; !!(propname = G.propertynames[i].prop_name); ++i) {
      p = G.propertynames[i].prop_num;
      intrinsic = G.u.uprops[p].intrinsic;
      if (intrinsic & TIMEOUT) {
        if (specindx > 0 && i >= specindx) {
          await G.windowprocs.win_putstr(win, 0, S(" -- settable via #wizinstrinc only --"));
          specindx = 0;
        }
        sprintf(P(buf), S(" %*s %4ld"), -longestlen, propname, intrinsic & TIMEOUT);
        await G.windowprocs.win_putstr(win, 0, P(buf));
      }
    }
  }
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
  return 0;
}

export async function timer_sanity_check(): Promise<void> {
  let curr = null;
  for (curr = timer_base[0]; curr; curr = curr.next) {
    if (curr.kind === TIMER_OBJECT) {
      let obj = curr.arg.a_obj;
      if (obj.timed === 0) {
        await impossible(S("timer sanity: untimed obj %s, timer %ld"), fmt_ptr(obj), curr.tid);
      }
    }
  }
}

export async function run_timers(): Promise<void> {
  let curr = null;
  while (timer_base[0] && timer_base[0].timeout <= G.monstermoves) {
    curr = timer_base[0];
    timer_base[0] = curr.next;
    if (curr.kind === TIMER_OBJECT) {
      curr.arg.a_obj.timed = curr.arg.a_obj.timed - 1 << 24 >> 24;
    }
    await timeout_funcs[curr.func_index].f(curr.arg, curr.timeout);
    free(curr);
  }
}

export async function start_timer(when: number, kind: number, func_index: number, arg: union_any | null): Promise<number> {
  let $t1: any;
  let gnu = null;
  let dup = null;
  if (kind < 0 || kind >= NUM_TIMER_KINDS || func_index < 0 || func_index >= NUM_TIME_FUNCS) {
    await panic(S("start_timer (%s: %d)"), kind_name(kind), func_index);
  }
  for (dup = timer_base[0]; dup; dup = dup.next) {
    if (dup.kind === kind && dup.func_index === func_index && $peq(dup.arg.a_void, arg.a_void)) {
      break;
    }
  }
  if (dup) {
    let idbuf = new Int8Array(128);
    sprintf(P(idbuf), S("%s timer"), timeout_funcs[func_index].name);
    await impossible(S("Attempted to start duplicate %s, aborted."), P(idbuf));
    return FALSE;
  }
  gnu = new struct_fe();
  memset(gnu, 0, 48);
  gnu.next = null;
  gnu.tid = ($t1 = timer_id[0], timer_id[0] = $u64($t1 + 1), $t1);
  gnu.timeout = G.monstermoves + when;
  gnu.kind = kind;
  gnu.needs_fixup = 0;
  gnu.func_index = func_index;
  gnu.arg.$cp(arg);
  insert_timer(gnu);
  if (kind === TIMER_OBJECT) {
    arg.a_obj.timed = arg.a_obj.timed + 1 << 24 >> 24;
  }
  return TRUE;
}

export async function stop_timer(func_index: number, arg: union_any | null): Promise<number> {
  let doomed = null;
  let timeout = 0;
  doomed = remove_timer(P(timer_base, 0), func_index, arg);
  if (doomed) {
    timeout = doomed.timeout;
    if (doomed.kind === TIMER_OBJECT) {
      arg.a_obj.timed = arg.a_obj.timed - 1 << 24 >> 24;
    }
    if (timeout_funcs[doomed.func_index].cleanup) {
      await timeout_funcs[doomed.func_index].cleanup(arg, timeout);
    }
    free(doomed);
    return timeout - G.monstermoves;
  }
  return 0;
}

export function peek_timer(type: number, arg: union_any | null): number {
  let curr = null;
  for (curr = timer_base[0]; curr; curr = curr.next) {
    if (curr.func_index === type && $peq(curr.arg.a_void, arg.a_void)) {
      return curr.timeout;
    }
  }
  return 0;
}

export async function obj_move_timers(src: struct_obj | null, dest: struct_obj | null): Promise<void> {
  let count = 0;
  let curr = null;
  for (count = 0, curr = timer_base[0]; curr; curr = curr.next) {
    if (curr.kind === TIMER_OBJECT && curr.arg.a_obj === src) {
      curr.arg.a_obj = dest;
      dest.timed = dest.timed + 1 << 24 >> 24;
      ++count;
    }
  }
  if (count !== src.timed) {
    await panic(S("obj_move_timers"));
  }
  src.timed = 0;
}

export async function obj_split_timers(src: struct_obj | null, dest: struct_obj | null): Promise<void> {
  let curr = null;
  let next_timer = null;
  for (curr = timer_base[0]; curr; curr = next_timer) {
    next_timer = curr.next;
    if (curr.kind === TIMER_OBJECT && curr.arg.a_obj === src) {
      await start_timer(curr.timeout - G.monstermoves, TIMER_OBJECT, curr.func_index, obj_to_any(dest));
    }
  }
}

export async function obj_stop_timers(obj: struct_obj | null): Promise<void> {
  let curr = null;
  let prev = null;
  let next_timer = null;
  for (prev = null, curr = timer_base[0]; curr; curr = next_timer) {
    next_timer = curr.next;
    if (curr.kind === TIMER_OBJECT && curr.arg.a_obj === obj) {
      if (prev) {
        prev.next = curr.next;
      } else {
        timer_base[0] = curr.next;
      }
      if (timeout_funcs[curr.func_index].cleanup) {
        await timeout_funcs[curr.func_index].cleanup(curr.arg, curr.timeout);
      }
      free(curr);
    } else {
      prev = curr;
    }
  }
  obj.timed = 0;
}

export function obj_has_timer(object: struct_obj | null, timer_type: number): number {
  let timeout = peek_timer(timer_type, obj_to_any(object));
  return (timeout !== 0 ? 1 : 0) << 24 >> 24;
}

export async function spot_stop_timers(x: number, y: number, func_index: number): Promise<void> {
  let curr = null;
  let prev = null;
  let next_timer = null;
  let where = $shl64(x, 16) | y;
  for (prev = null, curr = timer_base[0]; curr; curr = next_timer) {
    next_timer = curr.next;
    if (curr.kind === TIMER_LEVEL && curr.func_index === func_index && curr.arg.a_long === where) {
      if (prev) {
        prev.next = curr.next;
      } else {
        timer_base[0] = curr.next;
      }
      if (timeout_funcs[curr.func_index].cleanup) {
        await timeout_funcs[curr.func_index].cleanup(curr.arg, curr.timeout);
      }
      free(curr);
    } else {
      prev = curr;
    }
  }
}

export function spot_time_expires(x: number, y: number, func_index: number): number {
  let curr = null;
  let where = $shl64(x, 16) | y;
  for (curr = timer_base[0]; curr; curr = curr.next) {
    if (curr.kind === TIMER_LEVEL && curr.func_index === func_index && curr.arg.a_long === where) {
      return curr.timeout;
    }
  }
  return 0;
}

export function spot_time_left(x: number, y: number, func_index: number): number {
  let expires = spot_time_expires(x, y, func_index);
  return expires > 0 ? expires - G.monstermoves : 0;
}

function insert_timer(gnu: struct_fe | null): void {
  let curr = null;
  let prev = null;
  for (prev = null, curr = timer_base[0]; curr; prev = curr, curr = curr.next) {
    if (curr.timeout >= gnu.timeout) {
      break;
    }
  }
  gnu.next = curr;
  if (prev) {
    prev.next = gnu;
  } else {
    timer_base[0] = gnu;
  }
}

function remove_timer(base: Ptr | null, func_index: number, arg: union_any | null): struct_fe | null {
  let prev = null;
  let curr = null;
  for (prev = null, curr = base.a[base.o]; curr; prev = curr, curr = curr.next) {
    if (curr.func_index === func_index && $peq(curr.arg.a_void, arg.a_void)) {
      break;
    }
  }
  if (curr) {
    if (prev) {
      prev.next = curr.next;
    } else {
      base.a[base.o] = curr.next;
    }
  }
  return curr;
}

async function write_timer(fd: number, timer: struct_fe | null): Promise<void> {
  let arg_save = new union_any();
  arg_save.$cp(G.zeroany);
  switch (timer.kind) {
  case TIMER_GLOBAL:
  case TIMER_LEVEL:
    await bwrite(fd, timer, 48);
    break;
  case TIMER_OBJECT:
    if (timer.needs_fixup) {
      await bwrite(fd, timer, 48);
    } else {
      arg_save.a_obj = timer.arg.a_obj;
      timer.arg.$cp(G.zeroany);
      timer.arg.a_uint = arg_save.a_obj.o_id;
      timer.needs_fixup = 1;
      await bwrite(fd, timer, 48);
      timer.arg.a_obj = arg_save.a_obj;
      timer.needs_fixup = 0;
    }
    break;
  case TIMER_MONSTER:
    if (timer.needs_fixup) {
      await bwrite(fd, timer, 48);
    } else {
      arg_save.a_monst = timer.arg.a_monst;
      timer.arg.$cp(G.zeroany);
      timer.arg.a_uint = arg_save.a_monst.m_id;
      timer.needs_fixup = 1;
      await bwrite(fd, timer, 48);
      timer.arg.a_monst = arg_save.a_monst;
      timer.needs_fixup = 0;
    }
    break;
  default:
    await panic(S("write_timer"));
    break;
  }
}

export async function obj_is_local(obj: struct_obj | null): Promise<number> {
  switch (obj.where) {
  case 3:
  case 5:
    return FALSE;
  case 1:
  case 6:
    return TRUE;
  case 2:
    return await obj_is_local(obj.v.v_ocontainer);
  case 4:
    return mon_is_local(obj.v.v_ocarry);
  }
  await panic(S("obj_is_local"));
  return FALSE;
}

function mon_is_local(mon: struct_monst | null): number {
  let curr = null;
  for (curr = G.migrating_mons; curr; curr = curr.nmon) {
    if (curr === mon) {
      return FALSE;
    }
  }
  for (curr = G.mydogs; curr; curr = curr.nmon) {
    if (curr === mon) {
      return FALSE;
    }
  }
  return TRUE;
}

async function timer_is_local(timer: struct_fe | null): Promise<number> {
  switch (timer.kind) {
  case TIMER_LEVEL:
    return TRUE;
  case TIMER_GLOBAL:
    return FALSE;
  case TIMER_OBJECT:
    return await obj_is_local(timer.arg.a_obj);
  case TIMER_MONSTER:
    return mon_is_local(timer.arg.a_monst);
  }
  await panic(S("timer_is_local"));
  return FALSE;
}

async function maybe_write_timer(fd: number, range: number, write_it: number): Promise<number> {
  let count = 0;
  let curr = null;
  for (curr = timer_base[0]; curr; curr = curr.next) {
    if (range === RANGE_GLOBAL) {
      if (!await timer_is_local(curr)) {
        ++count;
        if (write_it) {
          await write_timer(fd, curr);
        }
      }
    } else {
      if (await timer_is_local(curr)) {
        ++count;
        if (write_it) {
          await write_timer(fd, curr);
        }
      }
    }
  }
  return count;
}

export async function save_timers(fd: number, mode: number, range: number): Promise<void> {
  let curr = null;
  let prev = null;
  let next_timer = null;
  const count = new Int32Array(1);
  if (mode & (1 | 2)) {
    if (range === RANGE_GLOBAL) {
      await bwrite(fd, P(timer_id, 0), 8);
    }
    count[0] = await maybe_write_timer(fd, range, FALSE);
    await bwrite(fd, P(count, 0), 4);
    await maybe_write_timer(fd, range, TRUE);
  }
  if (mode & 4) {
    for (prev = null, curr = timer_base[0]; curr; curr = next_timer) {
      next_timer = curr.next;
      if (!((!!(range === RANGE_LEVEL) ? 1 : 0) ^ (!!await timer_is_local(curr) ? 1 : 0))) {
        if (prev) {
          prev.next = curr.next;
        } else {
          timer_base[0] = curr.next;
        }
        free(curr);
      } else {
        prev = curr;
      }
    }
  }
}

export async function restore_timers(fd: number, range: number, ghostly: number, adjust: number): Promise<void> {
  const count = new Int32Array(1);
  let curr = null;
  if (range === RANGE_GLOBAL) {
    await mread(fd, P(timer_id, 0), 8);
  }
  await mread(fd, P(count, 0), 4);
  while (count[0]-- > 0) {
    curr = new struct_fe();
    await mread(fd, curr, 48);
    if (ghostly) {
      curr.timeout += adjust;
    }
    insert_timer(curr);
  }
}

export function timer_stats(hdrfmt: Ptr | null, hdrbuf: Ptr | null, count: Ptr | null, size: Ptr | null): void {
  let te = null;
  sprintf(hdrbuf, hdrfmt, 48);
  count.a[count.o] = size.a[size.o] = 0;
  for (te = timer_base[0]; te; te = te.next) {
    ++count.a[count.o];
    size.a[size.o] += 48;
  }
}

export async function relink_timers(ghostly: number): Promise<void> {
  let curr = null;
  const nid = new Uint32Array(1);
  for (curr = timer_base[0]; curr; curr = curr.next) {
    if (curr.needs_fixup) {
      if (curr.kind === TIMER_OBJECT) {
        if (ghostly) {
          if (!lookup_id_mapping(curr.arg.a_uint, P(nid, 0))) {
            await panic(S("relink_timers 1"));
          }
        } else {
          nid[0] = curr.arg.a_uint;
        }
        curr.arg.a_obj = find_oid(nid[0]);
        if (!curr.arg.a_obj) {
          await panic(S("cant find o_id %d"), nid[0]);
        }
        curr.needs_fixup = 0;
      } else if (curr.kind === TIMER_MONSTER) {
        await panic(S("relink_timers: no monster timer implemented"));
      } else {
        await panic(S("relink_timers 2"));
      }
    }
  }
}

export function $init(): void {
  G.propertynames = $sarrOf([struct_propname.$of(INVULNERABLE, S("invulnerable")),
struct_propname.$of(STONED, S("petrifying")),
struct_propname.$of(SLIMED, S("becoming slime")),
struct_propname.$of(STRANGLED, S("strangling")),
struct_propname.$of(SICK, S("fatally sick")),
struct_propname.$of(STUNNED, S("stunned")),
struct_propname.$of(CONFUSION, S("confused")),
struct_propname.$of(HALLUC, S("hallucinating")),
struct_propname.$of(BLINDED, S("blinded")),
struct_propname.$of(DEAF, S("deafness")),
struct_propname.$of(VOMITING, S("vomiting")),
struct_propname.$of(GLIB, S("slippery fingers")),
struct_propname.$of(WOUNDED_LEGS, S("wounded legs")),
struct_propname.$of(SLEEPY, S("sleepy")),
struct_propname.$of(TELEPORT, S("teleporting")),
struct_propname.$of(POLYMORPH, S("polymorphing")),
struct_propname.$of(LEVITATION, S("levitating")),
struct_propname.$of(FAST, S("very fast")),
struct_propname.$of(CLAIRVOYANT, S("clairvoyant")),
struct_propname.$of(DETECT_MONSTERS, S("monster detection")),
struct_propname.$of(SEE_INVIS, S("see invisible")),
struct_propname.$of(INVIS, S("invisible")),
struct_propname.$of(FIRE_RES, S("fire resistance")),
struct_propname.$of(COLD_RES, S("cold resistance")),
struct_propname.$of(SLEEP_RES, S("sleep resistance")),
struct_propname.$of(DISINT_RES, S("disintegration resistance")),
struct_propname.$of(SHOCK_RES, S("shock resistance")),
struct_propname.$of(POISON_RES, S("poison resistance")),
struct_propname.$of(ACID_RES, S("acid resistance")),
struct_propname.$of(STONE_RES, S("stoning resistance")),
struct_propname.$of(DRAIN_RES, S("drain resistance")),
struct_propname.$of(SICK_RES, S("sickness resistance")),
struct_propname.$of(ANTIMAGIC, S("magic resistance")),
struct_propname.$of(HALLUC_RES, S("hallucination resistance")),
struct_propname.$of(FUMBLING, S("fumbling")),
struct_propname.$of(HUNGER, S("voracious hunger")),
struct_propname.$of(TELEPAT, S("telepathic")),
struct_propname.$of(WARNING, S("warning")),
struct_propname.$of(WARN_OF_MON, S("warn: monster type or class")),
struct_propname.$of(WARN_UNDEAD, S("warn: undead")),
struct_propname.$of(SEARCHING, S("searching")),
struct_propname.$of(INFRAVISION, S("infravision")),
struct_propname.$of(ADORNED, S("adorned (+/- Cha)")),
struct_propname.$of(DISPLACED, S("displaced")),
struct_propname.$of(STEALTH, S("stealthy")),
struct_propname.$of(AGGRAVATE_MONSTER, S("monster aggravation")),
struct_propname.$of(CONFLICT, S("conflict")),
struct_propname.$of(JUMPING, S("jumping")),
struct_propname.$of(TELEPORT_CONTROL, S("teleport control")),
struct_propname.$of(FLYING, S("flying")),
struct_propname.$of(WWALKING, S("water walking")),
struct_propname.$of(SWIMMING, S("swimming")),
struct_propname.$of(MAGICAL_BREATHING, S("magical breathing")),
struct_propname.$of(PASSES_WALLS, S("pass thru walls")),
struct_propname.$of(SLOW_DIGESTION, S("slow digestion")),
struct_propname.$of(HALF_SPDAM, S("half spell damage")),
struct_propname.$of(HALF_PHDAM, S("half physical damage")),
struct_propname.$of(REGENERATION, S("HP regeneration")),
struct_propname.$of(ENERGY_REGENERATION, S("energy regeneration")),
struct_propname.$of(PROTECTION, S("extra protection")),
struct_propname.$of(PROT_FROM_SHAPE_CHANGERS, S("protection from shape changers")),
struct_propname.$of(POLYMORPH_CONTROL, S("polymorph control")),
struct_propname.$of(UNCHANGING, S("unchanging")),
struct_propname.$of(REFLECTING, S("reflecting")),
struct_propname.$of(FREE_ACTION, S("free action")),
struct_propname.$of(FIXED_ABIL, S("fixed abilities")),
struct_propname.$of(LIFESAVED, S("life will be saved")),
struct_propname.$of()]);
  stoned_texts = [S("You are slowing down."),
S("Your limbs are stiffening."),
S("Your limbs have turned to stone."),
S("You have turned to stone."),
S("You are a statue.")];
  vomiting_texts = [S("are feeling mildly nauseated."),
S("feel slightly confused."),
S("can't seem to think straight."),
S("feel incredibly sick."),
S("are about to vomit.")];
  choke_texts = [S("You find it hard to breathe."),
S("You're gasping for air."),
S("You can no longer breathe."),
S("You're turning %s."),
S("You suffocate.")];
  choke_texts2 = [S("Your %s is becoming constricted."),
S("Your blood is having trouble reaching your brain."),
S("The pressure on your %s increases."),
S("Your consciousness is fading."),
S("You suffocate.")];
  levi_texts = [S("You float slightly lower."), S("You wobble unsteadily %s the %s.")];
  slime_texts = [S("You are turning a little %s."),
S("Your limbs are getting oozy."),
S("Your skin begins to peel away."),
S("You are turning into %s."),
S("You have become %s.")];
  phaze_texts = [S("You start to feel bloated."), S("You are feeling rather flabby.")];
  timer_base = [null];
  timer_base[0] = null;
  timer_id = new Float64Array(1);
  timer_id[0] = 1;
  timeout_funcs = $sarrOf([struct_ttable.$of(rot_organic, null, S("rot_organic")),
struct_ttable.$of(rot_corpse, null, S("rot_corpse")),
struct_ttable.$of(revive_mon, null, S("revive_mon")),
struct_ttable.$of(burn_object, cleanup_burn, S("burn_object")),
struct_ttable.$of(hatch_egg, null, S("hatch_egg")),
struct_ttable.$of(fig_transform, null, S("fig_transform")),
struct_ttable.$of(melt_ice_away, null, S("melt_ice_away"))]);
}
