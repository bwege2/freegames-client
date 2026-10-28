// @ts-nocheck
// NetHack 3.6.7 dokick.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_candle } from './apply.ts';
import { undiscovered_artifact } from './artifact.ts';
import { acurr, acurrstr, adjalign, change_luck, exercise } from './attrib.ts';
import { getdir, isok, yn_function } from './cmd.ts';
import { find_drawbridge, is_drawbridge_wall, is_ice, is_pool } from './dbridge.ts';
import { cvt_sdoor_to_door, find_trap } from './detect.ts';
import { feel_location, feel_newsym, glyph_at, map_invisible, newsym, show_glyph, unmap_invisible } from './display.ts';
import { flooreffects, set_wounded_legs } from './do.ts';
import { Monnam, a_monnam, christen_orc, free_oname, hcolor, hliquid, mon_nam } from './do_name.ts';
import { abuse_dog } from './dog.ts';
import { finish_meating } from './dogmove.ts';
import { breaks, breaktest, hero_breaks, hurtle, thitmonst } from './dothrow.ts';
import { In_mines, Is_botlevel, dunlev, dunlevs_in_dungeon, on_level } from './dungeon.ts';
import { del_engr_at, surface, u_wipe_engr } from './engrave.ts';
import { scatter } from './explode.ts';
import { in_rooms, in_town, inv_weight, losehp, money_cnt, near_capacity, overexertion, weight_cap } from './hack.ts';
import { dist2, eos, sgn, upstart } from './hacklib.ts';
import { currency, delobj, sobj_at, stackobj, useup } from './invent.ts';
import { breakchestlock } from './lock.ts';
import { makemon } from './makemon.ts';
import { add_to_migration, add_to_minv, dealloc_obj, mkgold, mkobj_at, mksobj, mksobj_at, obj_extract_self, place_object, rnd_treefruit_at, splitobj, weight } from './mkobj.ts';
import { angry_guards, killed, maybe_mnexto, seemimic, setmangry, wake_nearby, wakeup } from './mon.ts';
import { attacktype, poly_when_stoned, pronoun_gender } from './mondata.ts';
import { closed_door, mon_yells, monflee, set_apparxy } from './monmove.ts';
import { An, Doname2, The, Tobjnam, corpse_xname, distant_name, killer_xname, makeplural, otense, rnd_class, xname } from './objnam.ts';
import { There, You, You_cant, You_hear, You_see, Your, pline, pline_The, verbalize } from './pline.ts';
import { body_part, poly_gender, polymon } from './polyself.ts';
import { altar_wrath } from './pray.ts';
import { ok_to_quest } from './quest.ts';
import { m_in_out_region } from './region.ts';
import { rn2, rnd, rnl } from './rnd.ts';
import { add_damage, addtobill, costly_gold, costly_spot, hot_pursuit, inside_shop, is_unpaid, make_angry_shk, make_happy_shk, obfree, pay_for_damage, picked_container, shop_keeper, stolen_value, subfrombill } from './shk.ts';
import { mpickobj, remove_worn_item } from './steal.ts';
import { kick_steed, place_monster } from './steed.ts';
import { enexto, goodpos, rloco } from './teleport.ts';
import { activate_statue_trap, b_trapped, chest_trap, fall_through, instapetrify, mintrap, t_at, water_damage } from './trap.ts';
import { attack_checks, check_caitiff, damageum, find_roll_to_hit, missum, passive } from './uhitm.ts';
import { hidden_gold } from './vault.ts';
import { unblock_point } from './vision.ts';
import { special_dmgval, use_skill } from './weapon.ts';
import { worm_known } from './worm.ts';
import { bhit, miss, obj_resists } from './zap.ts';
import { struct_monst, struct_nhcoord, struct_obj, struct_rm } from './structs.ts';
import { $at2, $cs, $rd, $sat, $u64, $wr, G, P, S, sprintf, strcat, strchr, strcpy, strncpy } from './rt/index.ts';
import { AIR, ALTAR, ART_MJOLLNIR, AT_KICK, A_CHA, A_CON, A_DEX, A_LAWFUL, A_STR, A_WIS, BLINDED, BOTH_SIDES, BOULDER, CLOUD, COIN_CLASS, CORPSE, CORR, CXN_PFX_THE, DBWALL, DEAF, DETECT_MONSTERS, DF_ALL, DF_RANDOM, DILITHIUM_CRYSTAL, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_ISOPEN, D_LOCKED, D_NODOOR, D_TRAPPED, D_WARNED, EGG, ER_NOTHING, EXPENSIVE_CAMERA, FACE, FALSE, FOOT, FOUNTAIN, FUMBLING, GEM_CLASS, GLASS, GRAVE, G_GONE, HALF_PHDAM, HALLUC, HALLUC_RES, HOLE, INFRAVISION, IRONBARS, KICKED_WEAPON, KICKING_BOOTS, KILLED_BY, LADDER, LA_DOWN, LEFT_SIDE, LEG, LEVITATION, LOW_PM, LUCKSTONE, M2_ORC, MAY_HIT, MIGR_LADDER_UP, MIGR_NOBREAK, MIGR_NOSCATTER, MIGR_NOWHERE, MIGR_RANDOM, MIGR_SSTAIRS, MIGR_STAIRS_UP, MIGR_TO_SPECIES, MIGR_WITH_HERO, MIRROR, MM_ANGRY, M_AP_MONSTER, NATTK, NO_MM_FLAGS, OBJ_MIGRATING, OBJ_MINVENT, PASSES_WALLS, PIT, PL_NSIZ, PM_BLACK_PUDDING, PM_CAPTAIN, PM_INCUBUS, PM_KILLER_BEE, PM_LIEUTENANT, PM_SERGEANT, PM_SHADE, PM_SOLDIER, PM_STONE_GOLEM, PM_SUCCUBUS, POOL, P_BARE_HANDED_COMBAT, P_NONE, RIGHT_SIDE, RING_CLASS, ROCK, ROOM, SCORR, SDOOR, SEE_INVIS, SHOPBASE, SHOP_DOOR_COST, SINK, SLT_ENCUMBER, SPIKED_PIT, STAIRS, STATUE_TRAP, STONE, STONE_RES, S_EEL, S_EYE, S_LDWASHER, S_LIGHT, S_LIZARD, S_LPUDDING, S_LRING, TELEPAT, THRONE, TRAPDOOR, TREE, TREE_LOOTED, TREE_SWARM, TRUE, TT_BEARTRAP, TT_PIT, TT_WEB, T_LOOTED, VIS_EFFECTS, WARN_OF_MON, WEB, WOUNDED_LEGS, W_ARMF } from './consts.ts';

let maploc: struct_rm | null;
let nowhere: struct_rm;
let gate_str: Ptr | null;
let kick_passes_thru: any;
let really_kick_object$flyingcoinmsg: any;

async function kickdmg(mon: struct_monst | null, clumsy: number): Promise<void> {
  let mdx = 0;
  let mdy = 0;
  let dmg = (acurrstr() + acurr(A_DEX) + acurr(A_CON)) / 15 | 0;
  let specialdmg = 0;
  let kick_skill = P_NONE;
  let trapkilled = FALSE;
  if (G.uarmf && G.uarmf.otyp === KICKING_BOOTS) {
    dmg += 5;
  }
  if (clumsy) {
    dmg = dmg / 2 | 0;
  }
  if ((mon.data.mflags1 & 2097152) >>> 0 !== 0) {
    dmg = 0;
  }
  if (mon.data === $sat(G.mons, PM_SHADE)) {
    dmg = 0;
  }
  specialdmg = await special_dmgval(G.youmonst, mon, W_ARMF, null);
  if (mon.data === $sat(G.mons, PM_SHADE) && !specialdmg) {
    await pline_The(S("%s."), P(kick_passes_thru));
    return;
  }
  if (mon.m_ap_type & 7) {
    await seemimic(mon);
  }
  await check_caitiff(mon);
  if (mon.mtame) {
    await abuse_dog(mon);
    if (mon.mtame) {
      await monflee(mon, dmg ? rnd(dmg) : 1, FALSE, FALSE);
    } else {
      mon.mflee = 0;
    }
  }
  if (dmg > 0) {
    dmg = rnd(dmg);
    if (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) {
      if (dmg > 1) {
        kick_skill = P_BARE_HANDED_COMBAT;
      }
      dmg += rn2((acurr(A_DEX) / 2 | 0) + 1);
    }
    await exercise(A_DEX, TRUE);
  }
  dmg += specialdmg;
  if (G.uarmf) {
    dmg += G.uarmf.spe;
  }
  dmg += G.u.udaminc;
  if (dmg > 0) {
    mon.mhp -= dmg;
  }
  if (!(mon.mhp < 1) && (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) && !(mon.data.msize >= 3) && !rn2(3) && mon.mcanmove | 0 && mon !== G.u.ustuck && !mon.mtrapped) {
    mdx = mon.mx + G.u.dx;
    mdy = mon.my + G.u.dy;
    if (goodpos(mdx, mdy, mon, 0)) {
      await pline(S("%s reels from the blow."), await Monnam(mon));
      if (await m_in_out_region(mon, mdx, mdy)) {
        G.level.monsters[mon.mx][mon.my] = null;
        await newsym(mon.mx, mon.my);
        await place_monster(mon, mdx, mdy);
        await newsym(mon.mx, mon.my);
        set_apparxy(mon);
        if (await mintrap(mon) === 2) {
          trapkilled = TRUE;
        }
      }
    }
  }
  await passive(mon, G.uarmf, TRUE, !(mon.mhp < 1) ? 1 : 0, AT_KICK, FALSE);
  if (mon.mhp < 1 && !trapkilled) {
    await killed(mon);
  }
  if (kick_skill !== P_NONE) {
    await use_skill(kick_skill, 1);
  }
}

async function maybe_kick_monster(mon: struct_monst | null, x: number, y: number): Promise<number> {
  if (mon) {
    let save_forcefight = G.context.forcefight;
    G.bhitpos.x = x;
    G.bhitpos.y = y;
    if (!mon.mpeaceful || !((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
      G.context.forcefight = TRUE;
    }
    if (await attack_checks(mon, null) || await overexertion()) {
      mon = null;
    }
    G.context.forcefight = save_forcefight;
  }
  return (!!mon ? 1 : 0) << 24 >> 24;
}

async function kick_monster(mon: struct_monst | null, x: number, y: number): Promise<void> {
  let $g = 0;
  let clumsy = 0;
  let i = 0;
  let j = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      clumsy = FALSE;
      await setmangry(mon, TRUE);
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked && !rn2(3) && mon.data.msize < 1 && !((mon.data.mflags1 & 1) >>> 0 !== 0)) {
        await pline(S("Floating in the air, you miss wildly!"));
        await exercise(A_DEX, FALSE);
        await passive(mon, G.uarmf, FALSE, 1, AT_KICK, FALSE);
        return;
      }
      if (mon.mundetected | 0 || mon.m_ap_type & 7 && (mon.m_ap_type & 7) !== M_AP_MONSTER) {
        if (mon.m_ap_type & 7) {
          await seemimic(mon);
        }
        mon.mundetected = 0;
        if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
          await map_invisible(x, y);
        } else {
          await newsym(x, y);
        }
        await There(S("is %s here."), (mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)) ? await a_monnam(mon) : S("something hidden"));
      }
      if (G.u.umonnum !== G.u.umonster && attacktype(G.youmonst.data, AT_KICK)) {
        let uattk = null;
        let sum = 0;
        let kickdieroll = 0;
        const armorpenalty = new Int32Array(1);
        let specialdmg = 0;
        const attknum = new Int32Array(1);
        attknum[0] = 0;
        let tmp = await find_roll_to_hit(mon, AT_KICK, null, P(attknum, 0), P(armorpenalty, 0));
        for (i = 0; i < NATTK; ++i) {
          if (G.multi < 0) {
            break;
          }
          uattk = $sat(G.youmonst.data.mattk, i);
          if (uattk.aatyp !== AT_KICK) {
            continue;
          }
          kickdieroll = rnd(20);
          specialdmg = await special_dmgval(G.youmonst, mon, W_ARMF, null);
          if (mon.data === $sat(G.mons, PM_SHADE) && !specialdmg) {
            await Your(S("%s %s."), P(kick_passes_thru), await mon_nam(mon));
            break;
          } else if (tmp > kickdieroll) {
            await You(S("kick %s."), await mon_nam(mon));
            sum = await damageum(mon, uattk, specialdmg);
            await passive(mon, G.uarmf, (sum > 0 ? 1 : 0) << 24 >> 24, sum !== 2 ? 1 : 0, AT_KICK, FALSE);
            if (sum === 2) {
              break;
            }
          } else {
            await missum(mon, uattk, tmp + armorpenalty[0] > kickdieroll ? 1 : 0);
            await passive(mon, G.uarmf, FALSE, 1, AT_KICK, FALSE);
          }
        }
        return;
      }
      i = -inv_weight();
      j = weight_cap();
      if (i < (j * 3 / 10 | 0)) {
        if (!rn2(i < (j / 10 | 0) ? 2 : i < (j / 5 | 0) ? 3 : 4)) {
          if ((G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) && !rn2(2)) {
            { $g = 1; continue $L; }
          }
          await Your(S("clumsy kick does no damage."));
          await passive(mon, G.uarmf, FALSE, 1, AT_KICK, FALSE);
          return;
        }
        if (i < (j / 10 | 0)) {
          clumsy = TRUE;
        } else if (!rn2(i < (j / 5 | 0) ? 2 : 3)) {
          clumsy = TRUE;
        }
      }
      if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
        clumsy = TRUE;
      } else if (G.uarm && G.objects[G.uarm.otyp].oc_big | 0 && acurr(A_DEX) < rnd(25)) {
        clumsy = TRUE;
      }
    case 1: // doit
      await You(S("kick %s."), await mon_nam(mon));
      if (!rn2(clumsy ? 3 : 4) && (clumsy || !(mon.data.msize >= 3)) && mon.mcansee | 0 && !mon.mtrapped && !((mon.data.mflags1 & 2097152) >>> 0 !== 0) && mon.data.mlet !== S_EEL && (mon.data.mflags1 & 4096) >>> 0 === 0 && mon.mcanmove | 0 && !mon.mstun && !mon.mconf && !mon.msleeping && mon.data.mmove >= 12) {
        if (!((mon.data.mflags1 & 8192) >>> 0 !== 0) && !rn2(G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147 ? 5 : 3)) {
          await pline(S("%s blocks your %skick."), await Monnam(mon), clumsy ? S("clumsy ") : S(""));
          await passive(mon, G.uarmf, FALSE, 1, AT_KICK, FALSE);
          return;
        } else {
          await maybe_mnexto(mon);
          if (mon.mx !== x || mon.my !== y) {
            await unmap_invisible(x, y);
            await pline(S("%s %s, %s evading your %skick."), await Monnam(mon), !G.level.flags.noteleport && (mon.data.mflags1 & 33554432) >>> 0 !== 0 ? S("teleports") : mon.data.mlet === S_EYE || mon.data.mlet === S_LIGHT ? S("floats") : (mon.data.mflags1 & 1) >>> 0 !== 0 ? S("swoops") : (mon.data.mflags1 & 24576) >>> 0 === 24576 || (mon.data.mflags1 & 524288) >>> 0 !== 0 ? S("slides") : S("jumps"), clumsy ? S("easily") : S("nimbly"), clumsy ? S("clumsy ") : S(""));
            await passive(mon, G.uarmf, FALSE, 1, AT_KICK, FALSE);
            return;
          }
        }
      }
      await kickdmg(mon, clumsy);
    }
    break;
  }
}

export async function ghitm(mtmp: struct_monst | null, gold: struct_obj | null): Promise<number> {
  let msg_given = FALSE;
  if (!((mtmp.data.mflags2 & 268435456) >>> 0 !== 0) && !mtmp.isshk && !mtmp.ispriest && !mtmp.isgd && !((mtmp.data.mflags2 & 512) >>> 0 !== 0)) {
    await wakeup(mtmp, TRUE);
  } else if (!mtmp.mcanmove) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline_The(S("%s harmlessly %s %s."), await xname(gold), otense(gold, S("hit")), await mon_nam(mtmp));
      msg_given = TRUE;
    }
  } else {
    let umoney = 0;
    let value = gold.quan * G.objects[gold.otyp].oc_cost;
    mtmp.msleeping = 0;
    await finish_meating(mtmp);
    if (!mtmp.isgd && !rn2(4)) {
      await setmangry(mtmp, TRUE);
    }
    if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      await pline(S("%s catches the gold."), await Monnam(mtmp));
    }
    await mpickobj(mtmp, gold);
    gold = null;
    if (mtmp.isshk) {
      let robbed = mtmp.mextra.eshk.robbed;
      if (robbed) {
        robbed -= value;
        if (robbed < 0) {
          robbed = 0;
        }
        await pline_The(S("amount %scovers %s recent losses."), !robbed ? S("") : S("partially "), G.genders[pronoun_gender(mtmp, 0)].his);
        mtmp.mextra.eshk.robbed = robbed;
        if (!robbed) {
          await make_happy_shk(mtmp, FALSE);
        }
      } else {
        if (mtmp.mpeaceful) {
          mtmp.mextra.eshk.credit += value;
          await You(S("have %ld %s in credit."), mtmp.mextra.eshk.credit, await currency(mtmp.mextra.eshk.credit));
        } else {
          await verbalize(S("Thanks, scum!"));
        }
      }
    } else if (mtmp.ispriest) {
      if (mtmp.mpeaceful) {
        await verbalize(S("Thank you for your contribution."));
      } else {
        await verbalize(S("Thanks, scum!"));
      }
    } else if (mtmp.isgd) {
      umoney = money_cnt(G.invent);
      await verbalize(umoney ? S("Drop the rest and follow me.") : hidden_gold() ? S("You still have hidden gold.  Drop it now.") : mtmp.mpeaceful | 0 ? S("I'll take care of that; please move along.") : S("I'll take that; now get moving."));
    } else if ((mtmp.data.mflags2 & 512) >>> 0 !== 0) {
      let goldreqd = 0;
      if (rn2(3)) {
        if (mtmp.data === $sat(G.mons, PM_SOLDIER)) {
          goldreqd = 100;
        } else if (mtmp.data === $sat(G.mons, PM_SERGEANT)) {
          goldreqd = 250;
        } else if (mtmp.data === $sat(G.mons, PM_LIEUTENANT)) {
          goldreqd = 500;
        } else if (mtmp.data === $sat(G.mons, PM_CAPTAIN)) {
          goldreqd = 750;
        }
        if (goldreqd) {
          umoney = money_cnt(G.invent);
          if (value > goldreqd + Math.trunc((umoney + Math.imul(G.u.ulevel, rn2(5))) / acurr(A_CHA))) {
            mtmp.mpeaceful = (TRUE) & 1;
          }
        }
      }
      if (mtmp.mpeaceful) {
        await verbalize(S("That should do.  Now beat it!"));
      } else {
        await verbalize(S("That's not enough, coward!"));
      }
    }
    return TRUE;
  }
  if (!msg_given) {
    await miss(await xname(gold), mtmp);
  }
  return FALSE;
}

export async function container_impact_dmg(obj: struct_obj | null, x: number, y: number): Promise<void> {
  let shkp = null;
  let otmp = null;
  let otmp2 = null;
  let loss = 0;
  let costly = 0;
  let insider = 0;
  let frominv = 0;
  if (!(obj.otyp >= 189 && obj.otyp <= 195) || !!!obj.cobj || (obj.otyp === 194 || obj.otyp === 195)) {
    return;
  }
  costly = ((shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) && await costly_spot(x, y) ? 1 : 0) << 24 >> 24;
  insider = ($rd(P(G.u.ushops)) && inside_shop(G.u.ux, G.u.uy) && $rd(in_rooms(x, y, SHOPBASE)) === $rd(P(G.u.ushops)) ? 1 : 0) << 24 >> 24;
  frominv = (obj !== G.kickedobj ? 1 : 0) << 24 >> 24;
  for (otmp = obj.cobj; otmp; otmp = otmp2) {
    let result = null;
    otmp2 = otmp.nobj;
    if ((G.objects[otmp.otyp].oc_material | 0) === GLASS && otmp.oclass !== GEM_CLASS && !obj_resists(otmp, 33, 100)) {
      result = S("shatter");
    } else if (otmp.otyp === EGG && !rn2(3)) {
      result = S("cracking");
    }
    if (result) {
      if (otmp.otyp === MIRROR) {
        change_luck(-2);
      }
      if (otmp.otyp === EGG && otmp.spe && otmp.corpsenm >= LOW_PM) {
        change_luck(-1);
      }
      await You_hear(S("a muffled %s."), result);
      if (costly) {
        if (frominv && !otmp.unpaid) {
          otmp.no_charge = 1;
        }
        loss += await stolen_value(otmp, x, y, shkp.mpeaceful << 24 >> 24, TRUE);
      }
      if (otmp.quan > 1) {
        await useup(otmp);
      } else {
        await obj_extract_self(otmp);
        await obfree(otmp, null);
      }
      obj.cknown = 0;
    }
  }
  if (costly && loss) {
    if (!insider) {
      await You(S("caused %ld %s worth of damage!"), loss, await currency(loss));
      await make_angry_shk(shkp, x, y);
    } else {
      await You(S("owe %s %ld %s for objects destroyed."), await mon_nam(shkp), loss, await currency(loss));
    }
  }
}

async function kick_object(x: number, y: number, kickobjnam: Ptr | null): Promise<number> {
  let res = 0;
  kickobjnam.a[kickobjnam.o] = 0;
  G.kickedobj = G.level.objects[x][y];
  if (G.kickedobj) {
    strcpy(kickobjnam, await killer_xname(G.kickedobj));
    res = await really_kick_object(x, y);
    G.kickedobj = null;
  }
  return res;
}

async function really_kick_object(x: number, y: number): Promise<number> {
  let range = 0;
  let mon = null;
  let shkp = null;
  let trap = null;
  let bhitroom = 0;
  let costly = 0;
  let isgold = 0;
  let slide = FALSE;
  if (!G.kickedobj || G.kickedobj.otyp === BOULDER || G.kickedobj === G.uball || G.kickedobj === G.uchain) {
    return 0;
  }
  if (!!(trap = t_at(x, y))) {
    if (((trap.ttyp | 0) === PIT || (trap.ttyp | 0) === SPIKED_PIT) && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) || (trap.ttyp | 0) === WEB) {
      if (!trap.tseen) {
        await find_trap(trap);
      }
      await You_cant(S("kick %s that's in a %s!"), G.c_common_strings.c_something, G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("tizzy") : (trap.ttyp | 0) === WEB ? S("web") : S("pit"));
      return 1;
    }
    if ((trap.ttyp | 0) === STATUE_TRAP) {
      await activate_statue_trap(trap, x, y, FALSE);
      return 1;
    }
  }
  if ((G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) && !rn2(3)) {
    await Your(S("clumsy kick missed."));
    return 1;
  }
  if (!G.uarmf && G.kickedobj.otyp === CORPSE && ($sat(G.mons, G.kickedobj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, G.kickedobj.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await You(S("kick %s with your bare %s."), await corpse_xname(G.kickedobj, null, CXN_PFX_THE), await makeplural(body_part(FOOT)));
    if (poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)) {
      ;
    } else {
      sprintf(P(G.killer.name), S("kicking %s barefoot"), await killer_xname(G.kickedobj));
      await instapetrify(P(G.killer.name));
    }
  }
  isgold = (G.kickedobj.oclass === COIN_CLASS ? 1 : 0) << 24 >> 24;
  {
    let k_owt = G.kickedobj.owt | 0;
    if (G.kickedobj.quan > 1 && !isgold) {
      let save_quan = G.kickedobj.quan;
      G.kickedobj.quan = 1;
      k_owt = await weight(G.kickedobj);
      G.kickedobj.quan = save_quan;
    }
    range = (acurrstr() / 2 | 0) - (k_owt / 40 | 0);
  }
  if (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) {
    range += rnd(3);
  }
  if (is_pool(x, y)) {
    range = (range / 3 | 0) + 1;
  } else if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    range += rnd(3);
  } else {
    if (is_ice(x, y)) {
      range += rnd(3), slide = TRUE;
    }
    if (G.kickedobj.greased) {
      range += rnd(3), slide = TRUE;
    }
  }
  if (G.kickedobj.oartifact === ART_MJOLLNIR) {
    range = 1;
  }
  if (!($at2(G.level.locations, x + G.u.dx, y + G.u.dy).typ >= POOL) || closed_door(x + G.u.dx, y + G.u.dy)) {
    range = 1;
  }
  costly = (!(G.kickedobj.no_charge | 0 && !!!G.kickedobj.cobj) && !!(shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) && await costly_spot(x, y) ? 1 : 0) << 24 >> 24;
  if ($at2(G.level.locations, x, y).typ < POOL || closed_door(x, y)) {
    if (!(G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) && rn2(20) > acurr(A_DEX) || $at2(G.level.locations, G.u.ux, G.u.uy).typ < POOL || closed_door(G.u.ux, G.u.uy)) {
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("It doesn't come loose."));
      } else {
        await pline(S("%s %sn't come loose."), await The(await distant_name(G.kickedobj, xname)), otense(G.kickedobj, S("do")));
      }
      return !rn2(3) || (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) ? 1 : 0;
    }
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      await pline(S("It comes loose."));
    } else {
      await pline(S("%s %s loose."), await The(await distant_name(G.kickedobj, xname)), otense(G.kickedobj, S("come")));
    }
    await obj_extract_self(G.kickedobj);
    await newsym(x, y);
    if (costly && (!await costly_spot(G.u.ux, G.u.uy) || !strchr(P(G.u.urooms), $rd(in_rooms(x, y, SHOPBASE))))) {
      await addtobill(G.kickedobj, FALSE, FALSE, FALSE);
    }
    if (!await flooreffects(G.kickedobj, G.u.ux, G.u.uy, S("fall"))) {
      await place_object(G.kickedobj, G.u.ux, G.u.uy);
      await stackobj(G.kickedobj);
      await newsym(G.u.ux, G.u.uy);
    }
    return 1;
  }
  if (G.kickedobj.otyp === 189 || G.kickedobj.otyp === 190) {
    let otrp = G.kickedobj.otrapped << 24 >> 24;
    if (range < 2) {
      await pline(S("THUD!"));
    }
    await container_impact_dmg(G.kickedobj, x, y);
    if (G.kickedobj.olocked) {
      if (!rn2(5) || (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) && !rn2(2)) {
        await You(S("break open the lock!"));
        await breakchestlock(G.kickedobj, FALSE);
        if (otrp) {
          await chest_trap(G.kickedobj, LEG, FALSE);
        }
        return 1;
      }
    } else {
      if (!rn2(3) || (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) && !rn2(2)) {
        await pline_The(S("lid slams open, then falls shut."));
        G.kickedobj.lknown = 1;
        if (otrp) {
          await chest_trap(G.kickedobj, LEG, FALSE);
        }
        return 1;
      }
    }
    if (range < 2) {
      return 1;
    }
  }
  if (await hero_breaks(G.kickedobj, G.kickedobj.ox, G.kickedobj.oy, FALSE)) {
    return 1;
  }
  if (range < 2) {
    if (!(G.kickedobj.otyp === 189 || G.kickedobj.otyp === 190)) {
      await pline(S("Thump!"));
    }
    return !rn2(3) || (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) ? 1 : 0;
  }
  if (G.kickedobj.quan > 1) {
    if (!isgold) {
      G.kickedobj = await splitobj(G.kickedobj, 1);
    } else {
      if (rn2(20)) {
        await pline(S("Thwwpingg!"));
        await You(S("%s!"), really_kick_object$flyingcoinmsg[rn2(Math.trunc(24 / 8) | 0)]);
        await scatter(x, y, rn2(3) + 1, VIS_EFFECTS | MAY_HIT, G.kickedobj);
        await newsym(x, y);
        return 1;
      }
      if (G.kickedobj.quan > 300) {
        await pline(S("Thump!"));
        return !rn2(3) || (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) ? 1 : 0;
      }
    }
  }
  if (slide && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await pline(S("Whee!  %s %s across the %s."), await Doname2(G.kickedobj), otense(G.kickedobj, S("slide")), surface(x, y));
  }
  if (costly && !isgold) {
    await addtobill(G.kickedobj, FALSE, FALSE, TRUE);
  }
  await obj_extract_self(G.kickedobj);
  await snuff_candle(G.kickedobj);
  await newsym(x, y);
  mon = await bhit(G.u.dx, G.u.dy, range, KICKED_WEAPON, null, null, P(G, "kickedobj"));
  if (!G.kickedobj) {
    return 1;
  }
  if (mon) {
    if (mon.isshk | 0 && G.kickedobj.where === OBJ_MINVENT && G.kickedobj.v.v_ocarry === mon) {
      return 1;
    }
    G.notonhead = (mon.mx !== G.bhitpos.x || mon.my !== G.bhitpos.y ? 1 : 0) << 24 >> 24;
    if (isgold ? await ghitm(mon, G.kickedobj) : await thitmonst(mon, G.kickedobj)) {
      return 1;
    }
  }
  if (G.kickedobj.where === OBJ_MIGRATING) {
    return 1;
  }
  bhitroom = $rd(in_rooms(G.bhitpos.x, G.bhitpos.y, SHOPBASE));
  if (costly && (!await costly_spot(G.bhitpos.x, G.bhitpos.y) || $rd(in_rooms(x, y, SHOPBASE)) !== bhitroom)) {
    if (isgold) {
      await costly_gold(x, y, G.kickedobj.quan);
    } else {
      await stolen_value(G.kickedobj, x, y, shkp.mpeaceful << 24 >> 24, FALSE);
    }
  }
  if (await flooreffects(G.kickedobj, G.bhitpos.x, G.bhitpos.y, S("fall"))) {
    return 1;
  }
  if (G.kickedobj.unpaid) {
    await subfrombill(G.kickedobj, shkp);
  }
  await place_object(G.kickedobj, G.bhitpos.x, G.bhitpos.y);
  await stackobj(G.kickedobj);
  await newsym(G.kickedobj.ox, G.kickedobj.oy);
  return 1;
}

function kickstr(buf: Ptr | null, kickobjnam: Ptr | null): Ptr | null {
  let what = null;
  if (kickobjnam.a[kickobjnam.o]) {
    what = kickobjnam;
  } else if (maploc === nowhere) {
    what = S("nothing");
  } else if (maploc.typ === DOOR) {
    what = S("a door");
  } else if (maploc.typ === TREE || G.level.flags.arboreal | 0 && maploc.typ === STONE) {
    what = S("a tree");
  } else if (maploc.typ <= DBWALL) {
    what = S("a wall");
  } else if (maploc.typ < POOL) {
    what = S("a rock");
  } else if (maploc.typ === THRONE) {
    what = S("a throne");
  } else if (maploc.typ === FOUNTAIN) {
    what = S("a fountain");
  } else if (maploc.typ === GRAVE) {
    what = S("a headstone");
  } else if (maploc.typ === SINK) {
    what = S("a sink");
  } else if (maploc.typ === ALTAR) {
    what = S("an altar");
  } else if (maploc.typ === DRAWBRIDGE_UP || maploc.typ === DRAWBRIDGE_DOWN) {
    what = S("a drawbridge");
  } else if (maploc.typ === STAIRS) {
    what = S("the stairs");
  } else if (maploc.typ === LADDER) {
    what = S("a ladder");
  } else if (maploc.typ === IRONBARS) {
    what = S("an iron bar");
  } else {
    what = S("something weird");
  }
  return strcat(strcpy(buf, S("kicking ")), what);
}

export async function dokick(): Promise<number> {
  let $t1: any;
  let $g = 0;
  let x = new Int32Array(1);
  let y = new Int32Array(1);
  let avrg_attrib = 0;
  let dmg = 0;
  let glyph = 0;
  let oldglyph = 0;
  let mtmp = null;
  let no_kick = 0;
  let buf = new Int8Array(256);
  let kickobjnam = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      dmg = 0;
      oldglyph = -1;
      no_kick = FALSE;
      buf = new Int8Array(256);
      kickobjnam = new Int8Array(256);
      kickobjnam[0] = 0;
      if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576 || (G.youmonst.data.mflags1 & 524288) >>> 0 !== 0) {
        await You(S("have no legs to kick with."));
        no_kick = TRUE;
      } else if (G.youmonst.data.msize < 1) {
        await You(S("are too small to do any kicking."));
        no_kick = TRUE;
      } else if (G.u.usteed) {
        if (await yn_function(S("Kick your steed?"), P(G.ynchars), 121) === 121) {
          await You(S("kick %s."), await mon_nam(G.u.usteed));
          await kick_steed();
          return 1;
        } else {
          return 0;
        }
      } else if (G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) {
        let wl = G.u.uprops[WOUNDED_LEGS].extrinsic & BOTH_SIDES;
        let bp = body_part(LEG);
        if (wl === BOTH_SIDES) {
          bp = await makeplural(bp);
        }
        await Your(S("%s%s %s in no shape for kicking."), wl === LEFT_SIDE ? S("left ") : wl === RIGHT_SIDE ? S("right ") : S(""), bp, wl === BOTH_SIDES ? S("are") : S("is"));
        no_kick = TRUE;
      } else if (near_capacity() > SLT_ENCUMBER) {
        await Your(S("load is too heavy to balance yourself for a kick."));
        no_kick = TRUE;
      } else if (G.youmonst.data.mlet === S_LIZARD) {
        await Your(S("legs cannot kick effectively."));
        no_kick = TRUE;
      } else if (G.u.uinwater | 0 && !rn2(2)) {
        await Your(S("slow motion kick doesn't hit anything."));
        no_kick = TRUE;
      } else if (G.u.utrap) {
        no_kick = TRUE;
        switch (G.u.utraptype) {
        case TT_PIT:
          if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic)) {
            await pline(S("There's not enough room to kick down here."));
          } else {
            no_kick = FALSE;
          }
          break;
        case TT_WEB:
        case TT_BEARTRAP:
          await You_cant(S("move your %s!"), body_part(LEG));
          break;
        default:
          break;
        }
      }
      if (no_kick) {
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
        return 0;
      }
      if (!await getdir(null)) {
        return 0;
      }
      if (!G.u.dx && !G.u.dy) {
        return 0;
      }
      x[0] = G.u.ux + G.u.dx;
      y[0] = G.u.uy + G.u.dy;
      if (G.uarmf && G.uarmf.otyp === KICKING_BOOTS) {
        avrg_attrib = 99;
      } else {
        avrg_attrib = (acurrstr() + acurr(A_DEX) + acurr(A_CON)) / 3 | 0;
      }
      if (G.u.uswallow) {
        switch (rn2(3)) {
        case 0:
          await You_cant(S("move your %s!"), body_part(LEG));
          break;
        case 1:
          if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
            await pline(S("%s burps loudly."), await Monnam(G.u.ustuck));
            break;
          }
        default:
          await Your(S("feeble kick has no effect."));
          break;
        }
        return 1;
      } else if (G.u.utrap && G.u.utraptype === TT_PIT) {
        await You(S("kick at the side of the pit."));
        return 1;
      }
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
        let xx = 0;
        let yy = 0;
        xx = G.u.ux - G.u.dx;
        yy = G.u.uy - G.u.dy;
        if (isok(xx, yy) && !($at2(G.level.locations, xx, yy).typ < POOL) && !($at2(G.level.locations, xx, yy).typ === DOOR) && (!((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) || !!!G.level.objects[xx][yy])) {
          await You(S("have nothing to brace yourself against."));
          return 0;
        }
      }
      mtmp = isok(x[0], y[0]) ? !!G.level.monsters[x[0]][y[0]] ? G.level.monsters[x[0]][y[0]] : null : null;
      if (mtmp) {
        oldglyph = glyph_at(x[0], y[0]);
        if (!await maybe_kick_monster(mtmp, x[0], y[0])) {
          return G.context.move;
        }
      }
      wake_nearby();
      await u_wipe_engr(2);
      if (!isok(x[0], y[0])) {
        maploc = nowhere;
        { $g = 1; continue $L; }
      }
      maploc = $sat(G.level.locations[x[0]], y[0]);
      if (mtmp) {
        let mdat = mtmp.data;
        await kick_monster(mtmp, x[0], y[0]);
        glyph = glyph_at(x[0], y[0]);
        if (mtmp.mhp < 1) {
          if (glyph !== oldglyph && glyph === 382 + (382 + 0)) {
            await show_glyph(x[0], y[0], oldglyph);
          }
        } else if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) && mtmp.mx === x[0] && mtmp.my === y[0] && !(glyph === 382 + (382 + 0)) && !(G.u.uswallow | 0 && mtmp === G.u.ustuck)) {
          await map_invisible(x[0], y[0]);
        }
        if (((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && G.context.move) {
          let range = 0;
          range = G.youmonst.data.cwt + (weight_cap() + inv_weight());
          if (range < 1) {
            range = 1;
          }
          range = 3 * mdat.cwt / range | 0;
          if (range < 1) {
            range = 1;
          }
          await hurtle(-G.u.dx, -G.u.dy, range, TRUE);
        }
        return 1;
      }
      await unmap_invisible(x[0], y[0]);
      if (is_pool(x[0], y[0]) ^ (!!G.u.uinwater ? 1 : 0)) {
        await You(S("splash some %s around."), hliquid(S("water")));
        return 1;
      }
      if (!!G.level.objects[x[0]][y[0]] && (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) || (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || sobj_at(BOULDER, x[0], y[0]))) {
        if (await kick_object(x[0], y[0], P(kickobjnam))) {
          if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) {
            await hurtle(-G.u.dx, -G.u.dy, 1, TRUE);
          }
          return 1;
        }
        { $g = 1; continue $L; }
      }
      if (!!(maploc.typ === DOOR)) { $g = 3; continue $L; }
      if (maploc.typ === SDOOR) {
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && rn2(30) < avrg_attrib) {
          cvt_sdoor_to_door(maploc);
          await pline(S("Crash!  %s a secret door!"), ((maploc.flags | 0) & (D_LOCKED | D_TRAPPED)) === D_LOCKED ? S("Your kick uncovers") : S("You kick open"));
          await exercise(A_DEX, TRUE);
          if ((maploc.flags | 0) & D_TRAPPED) {
            maploc.flags = (D_NODOOR) & 31;
            await b_trapped(S("door"), FOOT);
          } else if ((maploc.flags | 0) !== D_NODOOR && !((maploc.flags | 0) & D_LOCKED)) {
            maploc.flags = (D_ISOPEN) & 31;
          }
          await feel_newsym(x[0], y[0]);
          if ((maploc.flags | 0) === D_ISOPEN || (maploc.flags | 0) === D_NODOOR) {
            unblock_point(x[0], y[0]);
          }
          return 1;
        } else {
          { $g = 1; continue $L; }
        }
      }
      if (maploc.typ === SCORR) {
        if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && rn2(30) < avrg_attrib) {
          await pline(S("Crash!  You kick open a secret passage!"));
          await exercise(A_DEX, TRUE);
          maploc.typ = CORR;
          await feel_newsym(x[0], y[0]);
          unblock_point(x[0], y[0]);
          return 1;
        } else {
          { $g = 1; continue $L; }
        }
      }
      if (maploc.typ === THRONE) {
        let i = 0;
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          { $g = 2; continue $L; }
        }
        if ((G.u.uluck + G.u.moreluck < 0 || maploc.flags | 0) && !rn2(3)) {
          maploc.typ = ROOM;
          maploc.flags = 0;
          await mkgold(rnd(200), x[0], y[0]);
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await pline(S("CRASH!  You destroy it."));
          } else {
            await pline(S("CRASH!  You destroy the throne."));
            await newsym(x[0], y[0]);
          }
          await exercise(A_DEX, TRUE);
          return 1;
        } else if (G.u.uluck + G.u.moreluck > 0 && !rn2(3) && !maploc.flags) {
          await mkgold(rn2(201) + 300, x[0], y[0]);
          i = G.u.uluck + G.u.moreluck + 1;
          if (i > 6) {
            i = 6;
          }
          while (i--) {
            await mksobj_at(rnd_class(DILITHIUM_CRYSTAL, LUCKSTONE - 1), x[0], y[0], FALSE, TRUE);
          }
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await You(S("kick %s loose!"), G.c_common_strings.c_something);
          } else {
            await You(S("kick loose some ornamental coins and gems!"));
            await newsym(x[0], y[0]);
          }
          maploc.flags = (T_LOOTED) & 31;
          return 1;
        } else if (!rn2(4)) {
          if (dunlev(G.u.uz) < dunlevs_in_dungeon(G.u.uz)) {
            await fall_through(FALSE, 0);
            return 1;
          } else {
            { $g = 1; continue $L; }
          }
        }
        { $g = 1; continue $L; }
      }
      if (maploc.typ === ALTAR) {
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          { $g = 2; continue $L; }
        }
        await You(S("kick %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.c_common_strings.c_something : S("the altar"));
        await altar_wrath(x[0], y[0]);
        if (!rn2(3)) {
          { $g = 1; continue $L; }
        }
        await exercise(A_DEX, TRUE);
        return 1;
      }
      if (maploc.typ === FOUNTAIN) {
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          { $g = 2; continue $L; }
        }
        await You(S("kick %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.c_common_strings.c_something : S("the fountain"));
        if (!rn2(3)) {
          { $g = 1; continue $L; }
        }
        if (G.uarmf && rn2(3)) {
          if (await water_damage(G.uarmf, S("metal boots"), TRUE) === ER_NOTHING) {
            await Your(S("boots get wet."));
          }
        }
        await exercise(A_DEX, TRUE);
        return 1;
      }
      if (maploc.typ === GRAVE) {
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          { $g = 2; continue $L; }
        }
        if (rn2(4)) {
          { $g = 1; continue $L; }
        }
        await exercise(A_WIS, FALSE);
        if (G.urole.malenum === 328 || G.urole.malenum === 339 || G.u.ualign.type === A_LAWFUL && G.u.ualign.record > -10) {
          adjalign(-sgn(G.u.ualign.type));
        }
        maploc.typ = ROOM;
        maploc.flags = 0;
        await mksobj_at(ROCK, x[0], y[0], TRUE, FALSE);
        await del_engr_at(x[0], y[0]);
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await pline(S("Crack!  %s broke!"), G.c_common_strings.c_Something);
        } else {
          await pline_The(S("headstone topples over and breaks!"));
          await newsym(x[0], y[0]);
        }
        return 1;
      }
      if (maploc.typ === IRONBARS) {
        { $g = 1; continue $L; }
      }
      if (maploc.typ === TREE || G.level.flags.arboreal | 0 && maploc.typ === STONE) {
        let treefruit = null;
        if (rn2(3)) {
          if (!rn2(6) && !(G.mvitals[PM_KILLER_BEE].mvflags & G_GONE)) {
            await You_hear(S("a low buzzing."));
          }
          { $g = 1; continue $L; }
        }
        if (rn2(15) && !((maploc.flags | 0) & TREE_LOOTED) && (treefruit = await rnd_treefruit_at(x[0], y[0]))) {
          let nfruit = 8 - rnl(7);
          let nfall = 0;
          let frtype = treefruit.otyp;
          treefruit.quan = nfruit;
          treefruit.owt = await weight(treefruit) >>> 0;
          if (treefruit.quan !== 1 || treefruit.oartifact === 26 && !undiscovered_artifact(26)) {
            await pline(S("Some %s fall from the tree!"), await xname(treefruit));
          } else {
            await pline(S("%s falls from the tree!"), await An(await xname(treefruit)));
          }
          nfall = await scatter(x[0], y[0], 2, MAY_HIT, treefruit);
          if (nfall !== nfruit) {
            treefruit = await mksobj(frtype, TRUE, FALSE);
            treefruit.quan = nfruit - nfall;
            await pline(S("%ld %s got caught in the branches."), nfruit - nfall, await xname(treefruit));
            await dealloc_obj(treefruit);
          }
          await exercise(A_DEX, TRUE);
          await exercise(A_WIS, TRUE);
          await newsym(x[0], y[0]);
          maploc.flags = ((maploc.flags | 0 | TREE_LOOTED) >>> 0) & 31;
          return 1;
        } else if (!((maploc.flags | 0) & TREE_SWARM)) {
          let cnt = rnl(4) + 2;
          let made = 0;
          let mm = new struct_nhcoord();
          mm.x = x[0] << 24 >> 24;
          mm.y = y[0] << 24 >> 24;
          while (cnt--) {
            if (await enexto(mm, mm.x, mm.y, $sat(G.mons, PM_KILLER_BEE)) && await makemon($sat(G.mons, PM_KILLER_BEE), mm.x, mm.y, MM_ANGRY)) {
              ++made;
            }
          }
          if (made) {
            await pline(S("You've attracted the tree's former occupants!"));
          } else {
            await You(S("smell stale honey."));
          }
          maploc.flags = ((maploc.flags | 0 | TREE_SWARM) >>> 0) & 31;
          return 1;
        }
        { $g = 1; continue $L; }
      }
      if (maploc.typ === SINK) {
        let gend = poly_gender();
        let washerndx = (gend === 1 || gend === 2 && rn2(2) ? PM_INCUBUS : PM_SUCCUBUS) << 16 >> 16;
        if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          { $g = 2; continue $L; }
        }
        if (rn2(5)) {
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            await pline(S("Klunk!  The pipes vibrate noisily."));
          } else {
            await pline(S("Klunk!"));
          }
          await exercise(A_DEX, TRUE);
          return 1;
        } else if (!((maploc.flags | 0) & S_LPUDDING) && !rn2(3) && !(G.mvitals[PM_BLACK_PUDDING].mvflags & G_GONE)) {
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
            await You_hear(S("a gushing sound."));
          } else {
            await pline(S("A %s ooze gushes up from the drain!"), hcolor(G.c_color_names.c_black));
          }
          await makemon($sat(G.mons, PM_BLACK_PUDDING), x[0], y[0], NO_MM_FLAGS);
          await exercise(A_DEX, TRUE);
          await newsym(x[0], y[0]);
          maploc.flags = ((maploc.flags | 0 | S_LPUDDING) >>> 0) & 31;
          return 1;
        } else if (!((maploc.flags | 0) & S_LDWASHER) && !rn2(3) && !(G.mvitals[washerndx].mvflags & G_GONE)) {
          await pline(S("%s returns!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.c_common_strings.c_Something : S("The dish washer"));
          if (await makemon($sat(G.mons, washerndx), x[0], y[0], NO_MM_FLAGS)) {
            await newsym(x[0], y[0]);
          }
          maploc.flags = ((maploc.flags | 0 | S_LDWASHER) >>> 0) & 31;
          await exercise(A_DEX, TRUE);
          return 1;
        } else if (!rn2(3)) {
          if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            sprintf(P(buf), S(" %s"), body_part(FACE));
          } else {
            buf[0] = 0;
          }
          await pline(S("%s%s%s."), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("Flupp! ") : S(""), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("Muddy waste pops up from the drain") : !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? S("You hear a sloshing sound") : S("Something splashes you in the"), P(buf));
          if (!((maploc.flags | 0) & S_LRING)) {
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await You_see(S("a ring shining in its midst."));
            }
            await mkobj_at(RING_CLASS, x[0], y[0], TRUE);
            await newsym(x[0], y[0]);
            await exercise(A_DEX, TRUE);
            await exercise(A_WIS, TRUE);
            maploc.flags = ((maploc.flags | 0 | S_LRING) >>> 0) & 31;
          }
          return 1;
        }
        { $g = 1; continue $L; }
      }
      if (!(maploc.typ === STAIRS || maploc.typ === LADDER || maploc.typ <= DBWALL)) { $g = 4; continue $L; }
      if (!(maploc.typ <= DBWALL) && (maploc.flags | 0) === LA_DOWN) {
        { $g = 2; continue $L; }
      }
    case 1: // ouch
      await pline(S("Ouch!  That hurts!"));
      await exercise(A_DEX, FALSE);
      await exercise(A_STR, FALSE);
      if (isok(x[0], y[0])) {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(x[0], y[0]);
        }
        if (is_drawbridge_wall(x[0], y[0]) >= 0) {
          await pline_The(S("drawbridge is unaffected."));
          find_drawbridge(P(x, 0), P(y, 0));
          maploc = $sat(G.level.locations[x[0]], y[0]);
        }
      }
      if (!rn2(3)) {
        await set_wounded_legs(RIGHT_SIDE, 5 + rnd(5));
      }
      dmg = rnd(acurr(A_CON) > 15 ? 3 : 5);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, kickstr(P(buf), P(kickobjnam)), KILLED_BY);
      if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
        await hurtle(-G.u.dx, -G.u.dy, rn2(2) + 4, TRUE);
      }
      return 1;
    case 4:
      { $g = 2; continue $L; }
    case 3:
      if (!((maploc.flags | 0) === D_ISOPEN || (maploc.flags | 0) === D_BROKEN || (maploc.flags | 0) === D_NODOOR)) { $g = 5; continue $L; }
    case 2: // dumb
      await exercise(A_DEX, FALSE);
      if (G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147 || acurr(A_DEX) >= 16 || rn2(3)) {
        await You(S("kick at empty space."));
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(x[0], y[0]);
        }
      } else {
        await pline(S("Dumb move!  You strain a muscle."));
        await exercise(A_STR, FALSE);
        await set_wounded_legs(RIGHT_SIDE, 5 + rnd(5));
      }
      if (((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) && rn2(2)) {
        await hurtle(-G.u.dx, -G.u.dy, 1, TRUE);
      }
      return 1;
    case 5:
      if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
        { $g = 1; continue $L; }
      }
      await exercise(A_DEX, TRUE);
      if (rnl(35) < avrg_attrib + (!(G.urole.malenum === 339 || G.urole.malenum === 334 || G.youmonst.data === $sat(G.mons, 234) || G.uarmf && G.uarmf.otyp === 147) ? 0 : acurr(A_DEX))) {
        let shopdoor = ($rd(in_rooms(x[0], y[0], SHOPBASE)) ? TRUE : FALSE) << 24 >> 24;
        if ((maploc.flags | 0) & D_TRAPPED) {
          if (G.flags.verbose) {
            await You(S("kick the door."));
          }
          await exercise(A_STR, FALSE);
          maploc.flags = (D_NODOOR) & 31;
          await b_trapped(S("door"), FOOT);
        } else if (acurr(A_STR) > 18 && !rn2(5) && !shopdoor) {
          await pline(S("As you kick the door, it shatters to pieces!"));
          await exercise(A_STR, TRUE);
          maploc.flags = (D_NODOOR) & 31;
        } else {
          await pline(S("As you kick the door, it crashes open!"));
          await exercise(A_STR, TRUE);
          maploc.flags = (D_BROKEN) & 31;
        }
        await feel_newsym(x[0], y[0]);
        unblock_point(x[0], y[0]);
        if (shopdoor) {
          await add_damage(x[0], y[0], SHOP_DOOR_COST);
          await pay_for_damage(S("break"), FALSE);
        }
        if (in_town(x[0], y[0])) {
          for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
            if (mtmp.mhp < 1) {
              continue;
            }
            if ((mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mpeaceful | 0) {
              await mon_yells(mtmp, S("Halt, thief!  You're under arrest!"));
              await angry_guards(FALSE);
              break;
            }
          }
        }
      } else {
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
          await feel_location(x[0], y[0]);
        }
        await exercise(A_STR, TRUE);
        await pline(S("WHAMMM!!!"));
        if (in_town(x[0], y[0])) {
          for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
            if (mtmp.mhp < 1) {
              continue;
            }
            if ((mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) && mtmp.mpeaceful | 0 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
              if (($at2(G.level.locations, x[0], y[0]).flags | 0) & D_WARNED) {
                await mon_yells(mtmp, S("Halt, vandal!  You're under arrest!"));
                await angry_guards(FALSE);
              } else {
                await mon_yells(mtmp, S("Hey, stop damaging that door!"));
                ($t1 = $at2(G.level.locations, x[0], y[0]), $t1.flags = (($t1.flags | 0 | D_WARNED) >>> 0) & 31);
              }
              break;
            }
          }
        }
      }
      return 1;
    }
    break;
  }
}

function drop_to(cc: struct_nhcoord | null, loc: number): void {
  switch (loc) {
  case 0:
    if ((G.dungeon_topology.d_stronghold_level.dlevel || G.dungeon_topology.d_stronghold_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_stronghold_level)) {
      cc.x = G.dungeon_topology.d_valley_level.dnum;
      cc.y = G.dungeon_topology.d_valley_level.dlevel;
      break;
    } else if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum || Is_botlevel(G.u.uz)) {
      cc.y = cc.x = 0;
      break;
    }
  case 3:
  case 5:
    cc.x = G.u.uz.dnum;
    cc.y = G.u.uz.dlevel + 1 << 24 >> 24;
    break;
  case 7:
    cc.x = G.sstairs.tolev.dnum;
    cc.y = G.sstairs.tolev.dlevel;
    break;
  default:
  case -1:
    cc.y = cc.x = 0;
    break;
  }
}

export async function impact_drop(missile: struct_obj | null, x: number, y: number, dlev: number): Promise<void> {
  let toloc = 0;
  let obj = null;
  let obj2 = null;
  let shkp = null;
  let oct = 0;
  let dct = 0;
  let price = 0;
  let debit = 0;
  let robbed = 0;
  let angry = 0;
  let costly = 0;
  let isrock = 0;
  let cc = new struct_nhcoord();
  if (!!!G.level.objects[x][y]) {
    return;
  }
  toloc = await down_gate(x, y);
  drop_to(cc, toloc);
  if (!cc.y) {
    return;
  }
  if (dlev) {
    toloc = MIGR_WITH_HERO;
    cc.y = dlev;
  }
  costly = await costly_spot(x, y);
  price = debit = robbed = 0;
  angry = FALSE;
  shkp = null;
  if (costly) {
    if (!!(shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE))))) {
      debit = shkp.mextra.eshk.debit;
      robbed = shkp.mextra.eshk.robbed;
      angry = (!shkp.mpeaceful ? 1 : 0) << 24 >> 24;
    }
  }
  isrock = (missile && missile.otyp === ROCK ? 1 : 0) << 24 >> 24;
  oct = dct = 0;
  for (obj = G.level.objects[x][y]; obj; obj = obj2) {
    obj2 = obj.v.v_nexthere;
    if (obj === missile) {
      continue;
    }
    oct += obj.quan;
    if (obj === G.uball || obj === G.uchain) {
      continue;
    }
    if (isrock && obj.otyp === BOULDER || rn2(obj.otyp === BOULDER ? 30 : 3)) {
      continue;
    }
    await obj_extract_self(obj);
    if (costly) {
      price += await stolen_value(obj, x, y, await costly_spot(G.u.ux, G.u.uy) && strchr(P(G.u.urooms), $rd(in_rooms(x, y, SHOPBASE))) ? 1 : 0, TRUE);
      if (!!obj.cobj) {
        picked_container(obj);
      }
      if (obj.oclass !== COIN_CLASS) {
        obj.no_charge = 0;
      }
    }
    await add_to_migration(obj);
    obj.ox = cc.x;
    obj.oy = cc.y;
    obj.owornmask = toloc;
    dct += obj.quan;
  }
  if (dct && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    let what = dct === 1 ? S("object falls") : S("objects fall");
    if (missile) {
      await pline(S("From the impact, %sother %s."), dct === oct ? S("the ") : dct === 1 ? S("an") : S(""), what);
    } else if (oct === dct) {
      await pline(S("%s adjacent %s %s."), dct === 1 ? S("The") : S("All the"), what, gate_str);
    } else {
      await pline(S("%s adjacent %s %s."), dct === 1 ? S("One of the") : S("Some of the"), dct === 1 ? S("objects falls") : what, gate_str);
    }
  }
  if (costly && shkp && price) {
    if (shkp.mextra.eshk.robbed > robbed) {
      await You(S("removed %ld %s worth of goods!"), price, await currency(price));
      if ($rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2) {
        if (shkp.mextra.eshk.customer[0] === 0) {
          strncpy(P(shkp.mextra.eshk.customer), P(G.plname), PL_NSIZ);
        }
        if (angry) {
          await pline(S("%s is infuriated!"), await Monnam(shkp));
        } else {
          await pline(S("\"%s, you are a thief!\""), P(G.plname));
        }
      } else {
        await You_hear(S("a scream, \"Thief!\""));
      }
      hot_pursuit(shkp);
      await angry_guards(FALSE);
      return;
    }
    if (shkp.mextra.eshk.debit > debit) {
      let amt = shkp.mextra.eshk.debit - debit;
      await You(S("owe %s %ld %s for goods lost."), await Monnam(shkp), amt, await currency(amt));
    }
  }
}

export async function ship_object(otmp: struct_obj | null, x: number, y: number, shop_floor_obj: number): Promise<number> {
  let toloc = 0;
  let ox = 0;
  let oy = 0;
  let cc = new struct_nhcoord();
  let obj = null;
  let t = null;
  let nodrop = 0;
  let unpaid = 0;
  let container = 0;
  let impact = FALSE;
  let n = 0;
  if (!otmp) {
    return FALSE;
  }
  if ((toloc = await down_gate(x, y)) === MIGR_NOWHERE) {
    return FALSE;
  }
  drop_to(cc, toloc);
  if (!cc.y) {
    return FALSE;
  }
  nodrop = (otmp === G.uball || otmp === G.uchain || toloc !== MIGR_LADDER_UP && rn2(3) ? 1 : 0) << 24 >> 24;
  container = (!!otmp.cobj ? 1 : 0) << 24 >> 24;
  unpaid = is_unpaid(otmp);
  if (!!G.level.objects[x][y]) {
    for (obj = G.level.objects[x][y]; obj; obj = obj.v.v_nexthere) {
      if (obj !== otmp) {
        n += obj.quan;
      }
    }
    if (n) {
      impact = TRUE;
    }
  }
  if (otmp.otyp === BOULDER && !!(t = t_at(x, y)) && ((t.ttyp | 0) === HOLE || (t.ttyp | 0) === TRAPDOOR)) {
    if (impact) {
      await impact_drop(otmp, x, y, 0);
    }
    return FALSE;
  }
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    await otransit_msg(otmp, nodrop, n);
  }
  if (nodrop) {
    if (impact) {
      await impact_drop(otmp, x, y, 0);
    }
    return FALSE;
  }
  if (unpaid || shop_floor_obj) {
    if (unpaid) {
      await stolen_value(otmp, G.u.ux, G.u.uy, TRUE, FALSE);
    } else {
      ox = otmp.ox;
      oy = otmp.oy;
      await stolen_value(otmp, ox, oy, await costly_spot(G.u.ux, G.u.uy) && strchr(P(G.u.urooms), $rd(in_rooms(ox, oy, SHOPBASE))) ? 1 : 0, FALSE);
    }
    if (container) {
      picked_container(otmp);
    }
    if (otmp.oclass !== COIN_CLASS) {
      otmp.no_charge = 0;
    }
  }
  if (otmp.owornmask) {
    await remove_worn_item(otmp, TRUE);
  }
  if (breaktest(otmp)) {
    let result = null;
    if ((G.objects[otmp.otyp].oc_material | 0) === GLASS || otmp.otyp === EXPENSIVE_CAMERA) {
      if (otmp.otyp === MIRROR) {
        change_luck(-2);
      }
      result = S("crash");
    } else {
      if (otmp.otyp === EGG && otmp.spe && otmp.corpsenm >= LOW_PM) {
        change_luck(-(otmp.quan < 5 ? otmp.quan : 5) << 24 >> 24);
      }
      result = S("splat");
    }
    await You_hear(S("a muffled %s."), result);
    await obj_extract_self(otmp);
    await obfree(otmp, null);
    return TRUE;
  }
  await add_to_migration(otmp);
  otmp.ox = cc.x;
  otmp.oy = cc.y;
  otmp.owornmask = toloc;
  if (otmp.otyp === BOULDER) {
    otmp.otrapped = 0;
  }
  if (impact) {
    await impact_drop(otmp, x, y, 0);
    await newsym(x, y);
  }
  return TRUE;
}

export async function obj_delivery(near_hero: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  let nx = 0;
  let ny = 0;
  let where = 0;
  let nobreak = 0;
  let noscatter = 0;
  for (otmp = G.migrating_objs; otmp; otmp = otmp2) {
    otmp2 = otmp.nobj;
    if (otmp.ox !== G.u.uz.dnum || otmp.oy !== G.u.uz.dlevel) {
      continue;
    }
    where = otmp.owornmask & 32767 | 0;
    if ((where & MIGR_TO_SPECIES) !== 0) {
      continue;
    }
    nobreak = ((where & MIGR_NOBREAK) !== 0 ? 1 : 0) << 24 >> 24;
    noscatter = ((where & MIGR_WITH_HERO) !== 0 ? 1 : 0) << 24 >> 24;
    where &= ~(MIGR_NOBREAK | MIGR_NOSCATTER);
    if ((!near_hero ? 1 : 0) ^ (where === MIGR_WITH_HERO ? 1 : 0)) {
      continue;
    }
    await obj_extract_self(otmp);
    otmp.owornmask = 0;
    switch (where) {
    case 3:
      nx = G.upstair.sx, ny = G.upstair.sy;
      break;
    case 5:
      nx = G.upladder.sx, ny = G.upladder.sy;
      break;
    case 7:
      nx = G.sstairs.sx, ny = G.sstairs.sy;
      break;
    case 9:
      nx = G.u.ux, ny = G.u.uy;
      break;
    default:
    case 0:
      nx = ny = 0;
      break;
    }
    if (nx > 0) {
      await place_object(otmp, nx, ny);
      if (!nobreak && !($at2(G.level.locations, nx, ny).typ === AIR || $at2(G.level.locations, nx, ny).typ === CLOUD || $at2(G.level.locations, nx, ny).typ >= POOL && $at2(G.level.locations, nx, ny).typ <= DRAWBRIDGE_UP)) {
        if (where === MIGR_WITH_HERO) {
          if (await breaks(otmp, nx, ny)) {
            continue;
          }
        } else if (breaktest(otmp)) {
          await delobj(otmp);
          continue;
        }
      }
      await stackobj(otmp);
      if (!noscatter) {
        await scatter(nx, ny, rnd(2), 0, otmp);
      } else {
        await newsym(nx, ny);
      }
    } else {
      otmp.ox = otmp.oy = 0;
      if (await rloco(otmp) && !nobreak && breaktest(otmp)) {
        await delobj(otmp);
      }
    }
  }
}

export async function deliver_obj_to_mon(mtmp: struct_monst | null, cnt: number, deliverflags: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  let where = 0;
  let maxobj = 1;
  let at_crime_scene = In_mines(G.u.uz);
  if ((deliverflags & DF_RANDOM) >>> 0 && cnt > 1) {
    maxobj = rnd(cnt);
  } else if ((deliverflags & DF_ALL) >>> 0) {
    maxobj = 0;
  } else {
    maxobj = 1;
  }
  cnt = 0;
  for (otmp = G.migrating_objs; otmp; otmp = otmp2) {
    otmp2 = otmp.nobj;
    where = otmp.owornmask & 32767 | 0;
    if ((where & MIGR_TO_SPECIES) === 0) {
      continue;
    }
    if ((mtmp.data.mflags2 & $u64(otmp.corpsenm)) >>> 0 !== 0) {
      await obj_extract_self(otmp);
      otmp.owornmask = 0;
      otmp.ox = otmp.oy = 0;
      if ((otmp.corpsenm & M2_ORC) !== 0 && (otmp.oextra && otmp.oextra.oname)) {
        if (!(mtmp.mextra && mtmp.mextra.mname)) {
          if (at_crime_scene || !rn2(2)) {
            mtmp = await christen_orc(mtmp, at_crime_scene ? otmp.oextra.oname : null, S(" the Fence"));
          }
        }
        free_oname(otmp);
      }
      otmp.corpsenm = 0;
      await add_to_minv(mtmp, otmp);
      ++cnt;
      if (maxobj && cnt >= maxobj) {
        break;
      }
    }
  }
}

async function otransit_msg(otmp: struct_obj | null, nodrop: number, num: number): Promise<void> {
  let optr = null;
  let obuf = new Int8Array(256);
  let xbuf = new Int8Array(256);
  if (otmp.otyp === CORPSE) {
    optr = upstart(await corpse_xname(otmp, null, CXN_PFX_THE));
  } else {
    optr = await Tobjnam(otmp, null);
  }
  strcpy(P(obuf), optr);
  if (num) {
    sprintf(P(xbuf), S(" %s %s object%s"), otense(otmp, S("hit")), num === 1 ? S("another") : S("other"), num > 1 ? S("s") : S(""));
    if (nodrop) {
      sprintf(eos(P(xbuf)), S("."));
    } else {
      sprintf(eos(P(xbuf)), S(" and %s %s."), otense(otmp, S("fall")), gate_str);
    }
    await pline(S("%s%s"), P(obuf), P(xbuf));
  } else if (!nodrop) {
    await pline(S("%s %s %s."), P(obuf), otense(otmp, S("fall")), gate_str);
  }
}

export async function down_gate(x: number, y: number): Promise<number> {
  let ttmp = null;
  gate_str = null;
  if (on_level(G.u.uz, G.dungeon_topology.d_qstart_level) && !await ok_to_quest()) {
    return MIGR_NOWHERE;
  }
  if (G.dnstair.sx === x && G.dnstair.sy === y || G.sstairs.sx === x && G.sstairs.sy === y && !G.sstairs.up) {
    gate_str = S("down the stairs");
    return (G.dnstair.sx === x && G.dnstair.sy === y ? MIGR_STAIRS_UP : MIGR_SSTAIRS) << 24 >> 24;
  }
  if (G.dnladder.sx === x && G.dnladder.sy === y) {
    gate_str = S("down the ladder");
    return MIGR_LADDER_UP;
  }
  if (!!(ttmp = t_at(x, y)) && ttmp.tseen | 0 && ((ttmp.ttyp | 0) === HOLE || (ttmp.ttyp | 0) === TRAPDOOR)) {
    gate_str = (ttmp.ttyp | 0) === TRAPDOOR ? S("through the trap door") : S("through the hole");
    return MIGR_RANDOM;
  }
  return MIGR_NOWHERE;
}

export function $init(): void {
  maploc = null;
  nowhere = new struct_rm();
  gate_str = null;
  kick_passes_thru = $cs("kick passes harmlessly through", 31);
  really_kick_object$flyingcoinmsg = [S("scatter the coins"), S("knock coins all over the place"), S("send coins flying in all directions")];
}
