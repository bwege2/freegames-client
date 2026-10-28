// @ts-nocheck
// NetHack 3.6.7 mthrowu.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { spec_abon } from './artifact.ts';
import { exercise, poisoned } from './attrib.ts';
import { isok } from './cmd.ts';
import { tmp_at } from './display.ts';
import { dropy, flooreffects } from './do.ts';
import { Monnam, hliquid, mon_nam } from './do_name.ts';
import { down_gate, ship_object } from './dokick.ts';
import { breaks, hero_breaks, omon_adj } from './dothrow.ts';
import { panic } from './end.ts';
import { losehp, nomul } from './hack.ts';
import { dist2, distmin, rounddiv, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { hold_another_object, sobj_at, stackobj } from './invent.ts';
import { mksobj, obj_extract_self, place_object, splitobj, weight } from './mkobj.ts';
import { mondied, seemimic, xkilled } from './mon.ts';
import { can_blnd, hates_silver, mon_hates_silver, monsndx, poly_when_stoned } from './mondata.ts';
import { closed_door, dissolve_bars } from './monmove.ts';
import { munstone } from './muse.ts';
import { discover_object } from './o_init.ts';
import { The, Tobjnam, an, distant_name, doname, killer_xname, makeplural, mshot_xname, obj_is_pname, singular, the, vtense, xname } from './objnam.ts';
import { You, You_hear, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, polymon } from './polyself.ts';
import { make_blinded, make_stoned, potionhit } from './potion.ts';
import { rn2, rnd } from './rnd.ts';
import { obfree } from './shk.ts';
import { minstapetrify, t_at } from './trap.ts';
import { passive_obj, shade_miss } from './uhitm.ts';
import { clear_path } from './vision.ts';
import { dmgval, mon_wield_item, mwepgone, select_rwep, setmnotwielded } from './weapon.ts';
import { worm_known } from './worm.ts';
import { find_mac, update_mon_intrinsics } from './worn.ts';
import { buzz, dobuzz, exclam, hit, miss } from './zap.ts';
import { struct_attack, struct_monst, struct_obj } from './structs.ts';
import { $at2, $peq, $rd, $sat, $sidx, $wr, G, P, S, rn2_on_display_rng, sprintf, strcat, strcmp, strcpy } from './rt/index.ts';
import { ACID_RES, ACID_VENOM, AD_ACID, AD_MAGM, AD_RBRE, AD_SLEE, ARMOR_CLASS, ARM_GLOVES, AT_SPIT, AT_WEAP, A_CON, A_STR, BALL_CLASS, BLINDED, BLINDING_VENOM, BOLT_LIM, BOULDER, CHAIN_CLASS, COIN_CLASS, CORPSE, CREAM_PIE, CREDIT_CARD, CROSSBOW, CROSSBOW_BOLT, DEAF, DETECT_MONSTERS, DISP_END, DISP_FLASH, EGG, ELVEN_ARROW, ELVEN_BOW, EXPL_MAX, EYE, FACE, FALSE, FOOD_CLASS, GEM_CLASS, GOLD, HALLUC, HALLUC_RES, HEAVY_IRON_BALL, HUGE_CHUNK_OF_MEAT, INFRAVISION, IRONBARS, KILLED_BY, KILLED_BY_AN, LAST_GEM, LENSES, LOCK_PICK, MAGIC_WHISTLE, MAXPCHARS, MEAT_STICK, MZ_TINY, M_AP_MONSTER, M_AP_NOTHING, NEED_RANGED_WEAPON, NEED_WEAPON, ORCISH_ARROW, ORCISH_BOW, PET_MISSILE_RANGE2, PIT, PM_STONE_GOLEM, POLE_LIM, POOL, POTHIT_MONST_THROW, POTHIT_OTHER_THROW, POTION_CLASS, POT_ACID, P_BOW, P_CROSSBOW, P_DAGGER, P_DART, P_KNIFE, P_LANCE, P_POLEARMS, P_SHURIKEN, P_SLING, P_SPEAR, ROCK, ROCK_CLASS, SEE_INVIS, SILVER, SINK, SKELETON_KEY, SLEEP_RES, SPBOOK_CLASS, SPIKED_PIT, STATUE, STONED, STONE_RES, STRANGE_OBJECT, S_GHOST, S_GOLEM, S_UNICORN, S_VORTEX, TALLOW_CANDLE, TELEPAT, TIN_WHISTLE, TOOL_CLASS, TRUE, VENOM_CLASS, WAND_CLASS, WAN_STRIKING, WARN_OF_MON, WAX_CANDLE, WEAPON_CLASS, W_NONDIGGABLE, XKILL_NOMSG, YA, YUMI } from './consts.ts';

let breathwep: any;
let mesg_given: number;
let target: struct_monst | null;
let archer: struct_monst | null;

export async function thitu(tlev: number, dam: number, objp: Ptr | null, name: Ptr | null): Promise<number> {
  let obj = objp ? objp.a[objp.o] : null;
  let onm = null;
  let knm = null;
  let is_acid = 0;
  let kprefix = KILLED_BY_AN;
  let dieroll = 0;
  let onmbuf = new Int8Array(256);
  let knmbuf = new Int8Array(256);
  if (!name) {
    if (!obj) {
      await panic(S("thitu: name & obj both null?"));
    }
    name = strcpy(P(onmbuf), obj.quan > 1 ? await doname(obj) : await mshot_xname(obj));
    knm = strcpy(P(knmbuf), await killer_xname(obj));
    kprefix = KILLED_BY;
  } else {
    knm = name;
    if (!strncmpi(name, S("the "), 4) || !strncmpi(name, S("an "), 3) || !strncmpi(name, S("a "), 2)) {
      kprefix = KILLED_BY;
    }
  }
  onm = obj && obj_is_pname(obj) ? await the(name) : obj && obj.quan > 1 ? name : await an(name);
  is_acid = (obj && obj.otyp === ACID_VENOM ? 1 : 0) << 24 >> 24;
  if (G.u.uac + tlev <= (dieroll = rnd(20))) {
    ++mesg_given;
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !G.flags.verbose) {
      await pline(S("It misses."));
    } else if (G.u.uac + tlev <= dieroll - 2) {
      if (!$peq(onm, P(onmbuf))) {
        strcpy(P(onmbuf), onm);
      }
      await pline(S("%s %s you."), upstart(P(onmbuf)), vtense(P(onmbuf), S("miss")));
    } else {
      await You(S("are almost hit by %s."), onm);
    }
    return 0;
  } else {
    if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !G.flags.verbose) {
      await You(S("are hit%s"), exclam(dam));
    } else {
      await You(S("are hit by %s%s"), onm, exclam(dam));
    }
    if (is_acid && (G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic)) {
      await pline(S("It doesn't seem to hurt you."));
    } else if (obj && obj.oclass === POTION_CLASS) {
      await potionhit(G.youmonst, obj, POTHIT_OTHER_THROW);
      objp.a[objp.o] = obj = null;
    } else {
      if (obj && (G.objects[obj.otyp].oc_material | 0) === SILVER && (G.u.ulycn >= -1 + 1 || hates_silver(G.youmonst.data))) {
        await pline_The(S("silver sears your flesh!"));
        await exercise(A_CON, FALSE);
      }
      if (is_acid) {
        await pline(S("It burns!"));
      }
      await losehp(dam, knm, kprefix);
      await exercise(A_STR, FALSE);
    }
    return 1;
  }
}

async function drop_throw(obj: struct_obj | null, ohit: number, x: number, y: number): Promise<number> {
  let retvalu = 1;
  let create = 0;
  let mtmp = null;
  let t = null;
  if (obj.otyp === CREAM_PIE || obj.oclass === VENOM_CLASS || ohit && obj.otyp === EGG) {
    create = 0;
  } else if (ohit && (obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[obj.otyp].oc_subtyp <= -P_BOW || obj.otyp === ROCK)) {
    create = !rn2(3) ? 1 : 0;
  } else {
    create = 1;
  }
  if (create && !(!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && mtmp.mtrapped | 0 && !!(t = t_at(x, y)) && ((t.ttyp | 0) === PIT || (t.ttyp | 0) === SPIKED_PIT))) {
    let objgone = 0;
    if (await down_gate(x, y) !== -1) {
      objgone = await ship_object(obj, x, y, FALSE);
    }
    if (!objgone) {
      if (!await flooreffects(obj, x, y, S("fall"))) {
        await place_object(obj, x, y);
        if (!mtmp && x === G.u.ux && y === G.u.uy) {
          mtmp = G.youmonst;
        }
        if (mtmp && ohit) {
          await passive_obj(mtmp, obj, null);
        }
        await stackobj(obj);
        retvalu = 0;
      }
    }
  } else {
    await obfree(obj, null);
  }
  return retvalu;
}

async function monmulti(mtmp: struct_monst | null, otmp: struct_obj | null, mwep: struct_obj | null): Promise<number> {
  let skill = G.objects[otmp.otyp].oc_subtyp;
  let multishot = 1;
  if (otmp.quan > 1 && ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW ? mwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[mwep.otyp].oc_subtyp ? 1 : 0 : otmp.oclass === WEAPON_CLASS ? 1 : 0) && !mtmp.mconf) {
    if ((mtmp.data.mflags2 & 2048) >>> 0 !== 0) {
      multishot += 2;
    } else if ((mtmp.data.mflags2 & 1024) >>> 0 !== 0) {
      ++multishot;
    } else if ($sidx(mtmp.data) >= $sidx($sat(G.mons, 328)) && $sidx(mtmp.data) <= $sidx($sat(G.mons, 342))) {
      ++multishot;
    }
    if (otmp.otyp === ELVEN_ARROW && !otmp.cursed) {
      ++multishot;
    }
    if (mwep && mwep.otyp === ELVEN_BOW && ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (mwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[mwep.otyp].oc_subtyp)) && !mwep.cursed) {
      ++multishot;
    }
    if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (mwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[mwep.otyp].oc_subtyp) && mwep.spe > 1) {
      multishot += await rounddiv(mwep.spe, 3);
    }
    multishot = rnd(multishot) | 0;
    switch (await monsndx(mtmp.data)) {
    case 330:
      if (skill === -P_SLING || skill === P_SPEAR) {
        ++multishot;
      }
      break;
    case 334:
      if (skill === -P_SHURIKEN) {
        ++multishot;
      }
      break;
    case 337:
      if (skill !== P_DAGGER) {
        ++multishot;
      }
      break;
    case 338:
      if (skill === P_DAGGER) {
        ++multishot;
      }
      break;
    case 377:
      if (skill === -P_SHURIKEN || skill === -P_DART) {
        ++multishot;
      }
    case 339:
      if (otmp.otyp === YA && mwep.otyp === YUMI) {
        ++multishot;
      }
      break;
    default:
      break;
    }
    if ((mtmp.data.mflags2 & 16) >>> 0 !== 0 && otmp.otyp === ELVEN_ARROW && mwep.otyp === ELVEN_BOW || (mtmp.data.mflags2 & 128) >>> 0 !== 0 && otmp.otyp === ORCISH_ARROW && mwep.otyp === ORCISH_BOW || (mtmp.data.mflags2 & 64) >>> 0 !== 0 && otmp.otyp === CROSSBOW_BOLT && mwep.otyp === CROSSBOW) {
      ++multishot;
    }
  }
  if (otmp.quan < multishot) {
    multishot = otmp.quan | 0;
  }
  if (multishot < 1) {
    multishot = 1;
  }
  return multishot;
}

async function monshoot(mtmp: struct_monst | null, otmp: struct_obj | null, mwep: struct_obj | null): Promise<void> {
  let mtarg = target;
  let dm = distmin(mtmp.mx, mtmp.my, mtarg ? mtarg.mx : mtmp.mux, mtarg ? mtarg.my : mtmp.muy);
  let multishot = await monmulti(mtmp, otmp, mwep);
  if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
    let onm = null;
    let onmbuf = new Int8Array(256);
    let trgbuf = new Int8Array(256);
    if (multishot > 1) {
      sprintf(P(onmbuf), S("%d %s"), multishot, await xname(otmp));
      onm = P(onmbuf);
    } else {
      onm = await singular(otmp, xname);
      onm = obj_is_pname(otmp) ? await the(onm) : await an(onm);
    }
    G.m_shot.s = ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (mwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[mwep.otyp].oc_subtyp) ? TRUE : FALSE) << 24 >> 24;
    strcpy(P(trgbuf), mtarg ? await mon_nam(mtarg) : S(""));
    if (!strcmp(P(trgbuf), S("it"))) {
      strcpy(P(trgbuf), (mtmp.data.mflags1 & 131072) >>> 0 !== 0 ? S("someone") : G.c_common_strings.c_something);
    }
    await pline(S("%s %s %s%s%s!"), await Monnam(mtmp), G.m_shot.s ? S("shoots") : S("throws"), onm, mtarg ? S(" at ") : S(""), P(trgbuf));
    G.m_shot.o = otmp.otyp;
  } else {
    G.m_shot.o = STRANGE_OBJECT;
  }
  G.m_shot.n = multishot;
  for (G.m_shot.i = 1; G.m_shot.i <= G.m_shot.n; ++G.m_shot.i) {
    await m_throw(mtmp, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby), dm, otmp);
    if (mtmp.mhp < 1 && G.m_shot.i < G.m_shot.n) {
      break;
    }
  }
  G.m_shot.n = G.m_shot.i = 0;
  G.m_shot.o = STRANGE_OBJECT;
  G.m_shot.s = FALSE;
}

export async function ohitmon(mtmp: struct_monst | null, otmp: struct_obj | null, range: number, verbose: number): Promise<number> {
  let damage = 0;
  let tmp = 0;
  let vis = 0;
  let ismimic = 0;
  let objgone = 1;
  let mon_launcher = archer ? archer.mw : null;
  G.notonhead = (G.bhitpos.x !== mtmp.mx || G.bhitpos.y !== mtmp.my ? 1 : 0) << 24 >> 24;
  ismimic = (mtmp.m_ap_type & 7 && (mtmp.m_ap_type & 7) !== M_AP_MONSTER ? 1 : 0) << 24 >> 24;
  vis = ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) << 24 >> 24;
  tmp = 5 + find_mac(mtmp) + await omon_adj(mtmp, otmp, FALSE);
  if (archer && target === mtmp) {
    if (archer.m_lev > 5) {
      tmp += archer.m_lev - 5;
    }
    if (mon_launcher && mon_launcher.oartifact) {
      tmp += await spec_abon(mon_launcher, mtmp);
    }
  }
  if (tmp < rnd(20)) {
    if (!ismimic) {
      if (vis) {
        await miss(await distant_name(otmp, mshot_xname), mtmp);
      } else if (verbose && !target) {
        await pline(S("It is missed."));
      }
    }
    if (!range) {
      await drop_throw(otmp, 0, mtmp.mx, mtmp.my);
      return 1;
    }
  } else if (otmp.oclass === POTION_CLASS) {
    if (ismimic) {
      await seemimic(mtmp);
    }
    mtmp.msleeping = 0;
    if (vis) {
      otmp.dknown = 1;
    }
    await potionhit(mtmp, otmp, POTHIT_OTHER_THROW);
    return 1;
  } else {
    damage = await dmgval(otmp, mtmp);
    if (otmp.otyp === ACID_VENOM && ((mtmp.data.mresists | mtmp.mextrinsics) & 64) !== 0) {
      damage = 0;
    }
    if (ismimic) {
      await seemimic(mtmp);
    }
    mtmp.msleeping = 0;
    if (vis) {
      if (otmp.otyp === EGG) {
        await pline(S("Splat!  %s is hit with %s egg!"), await Monnam(mtmp), otmp.known | 0 ? await an(G.mons[otmp.corpsenm].mname) : S("an"));
      } else {
        await hit(await distant_name(otmp, mshot_xname), mtmp, exclam(damage));
      }
    } else if (verbose && !target) {
      await pline(S("%s%s is hit%s"), otmp.otyp === EGG ? S("Splat!  ") : S(""), await Monnam(mtmp), exclam(damage));
    }
    if (otmp.otrapped | 0 && (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[otmp.otyp].oc_subtyp <= -P_BOW)) {
      if (((mtmp.data.mresists | mtmp.mextrinsics) & 32) !== 0) {
        if (vis) {
          await pline_The(S("poison doesn't seem to affect %s."), await mon_nam(mtmp));
        }
      } else {
        if (rn2(30)) {
          damage += rnd(6);
        } else {
          if (vis) {
            await pline_The(S("poison was deadly..."));
          }
          damage = mtmp.mhp;
        }
      }
    }
    if ((G.objects[otmp.otyp].oc_material | 0) === SILVER && mon_hates_silver(mtmp)) {
      let flesh = (!(mtmp.data.mlet === S_GHOST) && !((mtmp.data.mflags1 & 4) >>> 0 !== 0) ? 1 : 0) << 24 >> 24;
      if (vis) {
        let m_name = await mon_nam(mtmp);
        if (flesh) {
          m_name = strcat(s_suffix(m_name), S(" flesh"));
        }
        await pline_The(S("silver sears %s!"), m_name);
      } else if (verbose && !target) {
        await pline(S("%s is seared!"), flesh ? S("Its flesh") : S("It"));
      }
    }
    if (otmp.otyp === ACID_VENOM && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      if (((mtmp.data.mresists | mtmp.mextrinsics) & 64) !== 0) {
        if (vis || verbose && !target) {
          await pline(S("%s is unaffected."), await Monnam(mtmp));
        }
      } else {
        if (vis) {
          await pline_The(S("%s burns %s!"), hliquid(S("acid")), await mon_nam(mtmp));
        } else if (verbose && !target) {
          await pline(S("It is burned!"));
        }
      }
    }
    if (otmp.otyp === EGG && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9))) {
      if (!await munstone(mtmp, TRUE)) {
        await minstapetrify(mtmp, TRUE);
      }
      if (((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0) {
        damage = 0;
      }
    }
    if (!(mtmp.mhp < 1)) {
      mtmp.mhp -= damage;
      if (mtmp.mhp < 1) {
        if (vis || verbose && !target) {
          await pline(S("%s is %s!"), await Monnam(mtmp), (mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? S("destroyed") : S("killed"));
        }
        if (!G.context.mon_moving && (otmp.otyp !== BOULDER || range >= 0 || otmp.otrapped | 0)) {
          await xkilled(mtmp, XKILL_NOMSG);
        } else {
          await mondied(mtmp);
        }
      }
    }
    if (!(mtmp.mhp < 1) && can_blnd(null, mtmp, (otmp.otyp === BLINDING_VENOM ? AT_SPIT : AT_WEAP) & 0xff, otmp)) {
      if (vis && mtmp.mcansee | 0) {
        await pline(S("%s is blinded by %s."), await Monnam(mtmp), await the(await xname(otmp)));
      }
      mtmp.mcansee = 0;
      tmp = (mtmp.mblinded | 0) + rnd(25) + 20;
      if (tmp > 127) {
        tmp = 127;
      }
      mtmp.mblinded = (tmp >>> 0) & 127;
    }
    objgone = await drop_throw(otmp, 1, G.bhitpos.x, G.bhitpos.y);
    if (!objgone && range === -1) {
      await obj_extract_self(otmp);
      return 0;
    }
    return 1;
  }
  return 0;
}

export async function m_throw(mon: struct_monst | null, x: number, y: number, dx: number, dy: number, range: number, obj: struct_obj | null): Promise<void> {
  let mtmp = null;
  const singleobj = [null];
  let sym = obj.oclass;
  let hitu = 0;
  let oldumort = 0;
  let blindinc = 0;
  G.bhitpos.x = x << 24 >> 24;
  G.bhitpos.y = y << 24 >> 24;
  G.notonhead = FALSE;
  if (obj.quan === 1) {
    if (mon.mw === obj) {
      await setmnotwielded(mon, obj);
    }
    await obj_extract_self(obj);
    singleobj[0] = obj;
    obj = null;
  } else {
    singleobj[0] = await splitobj(obj, 1);
    await obj_extract_self(singleobj[0]);
  }
  singleobj[0].owornmask = 0;
  if ((singleobj[0].cursed | 0 || singleobj[0].greased | 0) && (dx || dy) && !rn2(7)) {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) && G.flags.verbose) {
      if ((singleobj[0].oclass === WEAPON_CLASS || singleobj[0].oclass === GEM_CLASS) && G.objects[singleobj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[singleobj[0].otyp].oc_subtyp <= -P_BOW) {
        await pline(S("%s misfires!"), await Monnam(mon));
      } else {
        await pline(S("%s as %s throws it!"), await Tobjnam(singleobj[0], S("slip")), await mon_nam(mon));
      }
    }
    dx = rn2(3) - 1;
    dy = rn2(3) - 1;
    if (!dx && !dy) {
      await drop_throw(singleobj[0], 0, G.bhitpos.x, G.bhitpos.y);
      return;
    }
  }
  if (!isok(G.bhitpos.x + dx, G.bhitpos.y + dy) || $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ < POOL || closed_door(G.bhitpos.x + dx, G.bhitpos.y + dy) || $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ === IRONBARS && await hits_bars(P(singleobj, 0), G.bhitpos.x, G.bhitpos.y, G.bhitpos.x + dx, G.bhitpos.y + dy, 1 ? 0 : !rn2(5) ? 1 : 0, 0) || !1 && $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === SINK) {
    await drop_throw(singleobj[0], 0, G.bhitpos.x, G.bhitpos.y);
    return;
  }
  mesg_given = 0;
  if (sym) {
    await tmp_at(DISP_FLASH, singleobj[0].otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : singleobj[0].corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : singleobj[0].otyp === 240 ? singleobj[0].corpsenm + (382 + (1 + (382 + (382 + 0)))) : singleobj[0].otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
  }
  while (range-- > 0) {
    G.bhitpos.x = G.bhitpos.x + dx << 24 >> 24;
    G.bhitpos.y = G.bhitpos.y + dy << 24 >> 24;
    mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null;
    if (mtmp && await shade_miss(mon, mtmp, singleobj[0], TRUE, TRUE)) {
      mtmp = null;
    } else if (mtmp) {
      if (await ohitmon(mtmp, singleobj[0], range, TRUE)) {
        break;
      }
    } else if (G.bhitpos.x === G.u.ux && G.bhitpos.y === G.u.uy) {
      if (G.multi) {
        nomul(0);
      }
      if (singleobj[0].oclass === GEM_CLASS && singleobj[0].otyp <= LAST_GEM + 9 && (G.youmonst.data.mlet === S_UNICORN && (G.youmonst.data.mflags2 & 536870912) >>> 0 !== 0)) {
        if (singleobj[0].otyp > LAST_GEM) {
          await You(S("catch the %s."), await xname(singleobj[0]));
          await You(S("are not interested in %s junk."), s_suffix(await mon_nam(mon)));
          await discover_object(singleobj[0].otyp, 1, 1);
          await dropy(singleobj[0]);
        } else {
          await You(S("accept %s gift in the spirit in which it was intended."), s_suffix(await mon_nam(mon)));
          await hold_another_object(singleobj[0], S("You catch, but drop, %s."), await xname(singleobj[0]), S("You catch:"));
        }
        break;
      }
      if (singleobj[0].oclass === POTION_CLASS) {
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          singleobj[0].dknown = 1;
        }
        await potionhit(G.youmonst, singleobj[0], POTHIT_MONST_THROW);
        break;
      }
      oldumort = G.u.umortality;
      let dam = 0;
      let hitv = 0;
      switch (singleobj[0].otyp) {
      case 241:
        if (!($sat(G.mons, singleobj[0].corpsenm) === $sat(G.mons, 10) || $sat(G.mons, singleobj[0].corpsenm) === $sat(G.mons, 9))) {
          await impossible(S("monster throwing egg type %d"), singleobj[0].corpsenm);
          hitu = 0;
          break;
        }
      case 262:
      case 452:
        hitu = await thitu(8, 0, P(singleobj, 0), null);
        break;
      default:
        dam = await dmgval(singleobj[0], G.youmonst);
        hitv = 3 - distmin(G.u.ux, G.u.uy, mon.mx, mon.my);
        if (hitv < -4) {
          hitv = -4;
        }
        if ((mon.data.mflags2 & 16) >>> 0 !== 0 && G.objects[singleobj[0].otyp].oc_subtyp === P_BOW) {
          ++hitv;
          if (mon.mw && mon.mw.otyp === ELVEN_BOW) {
            ++hitv;
          }
          if (singleobj[0].otyp === ELVEN_ARROW) {
            ++dam;
          }
        }
        if (G.youmonst.data.msize >= 3) {
          ++hitv;
        }
        hitv += 8 + singleobj[0].spe;
        if (dam < 1) {
          dam = 1;
        }
        hitu = await thitu(hitv, dam, P(singleobj, 0), null);
      }
      if (hitu && singleobj[0].otrapped | 0 && (singleobj[0].oclass === WEAPON_CLASS && G.objects[singleobj[0].otyp].oc_subtyp >= -P_SHURIKEN && G.objects[singleobj[0].otyp].oc_subtyp <= -P_BOW)) {
        let onmbuf = new Int8Array(256);
        let knmbuf = new Int8Array(256);
        strcpy(P(onmbuf), await xname(singleobj[0]));
        strcpy(P(knmbuf), await killer_xname(singleobj[0]));
        await poisoned(P(onmbuf), A_STR, P(knmbuf), G.u.umortality > oldumort ? 0 : 10, TRUE);
      }
      if (hitu && can_blnd(null, G.youmonst, (singleobj[0].otyp === BLINDING_VENOM ? AT_SPIT : AT_WEAP) & 0xff, singleobj[0])) {
        blindinc = rnd(25);
        if (singleobj[0].otyp === CREAM_PIE) {
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline(S("Yecch!  You've been creamed."));
          } else {
            await pline(S("There's %s sticky all over your %s."), G.c_common_strings.c_something, body_part(FACE));
          }
        } else if (singleobj[0].otyp === BLINDING_VENOM) {
          let eyes = body_part(EYE);
          if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
            eyes = await makeplural(eyes);
          }
          if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
            await pline_The(S("venom blinds you."));
          } else {
            await Your(S("%s %s."), eyes, vtense(eyes, S("sting")));
          }
        }
      }
      if (hitu && singleobj[0].otyp === EGG) {
        if (!G.u.uprops[STONED].intrinsic && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
          await make_stoned(5, null, KILLED_BY, S(""));
        }
      }
      await stop_occupation();
      if (hitu) {
        await drop_throw(singleobj[0], hitu, G.u.ux, G.u.uy);
        break;
      }
    }
    if (!range || (!isok(G.bhitpos.x + dx, G.bhitpos.y + dy) || $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ < POOL || closed_door(G.bhitpos.x + dx, G.bhitpos.y + dy) || $at2(G.level.locations, G.bhitpos.x + dx, G.bhitpos.y + dy).typ === IRONBARS && await hits_bars(P(singleobj, 0), G.bhitpos.x, G.bhitpos.y, G.bhitpos.x + dx, G.bhitpos.y + dy, 0 ? 0 : !rn2(5) ? 1 : 0, 0) || !0 && $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === SINK)) {
      if (singleobj[0]) {
        if (G.m_shot.n > 1 && (!mesg_given || G.bhitpos.x !== G.u.ux || G.bhitpos.y !== G.u.uy) && ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2 || archer && ((archer.wormno | 0 ? worm_known(archer) : $rd(G.viz_array.a[G.viz_array.o + archer.my], archer.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && archer && archer.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + archer.my], archer.mx) & 1 ? 1 : 0) && ((!archer.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !archer.mundetected)))) {
          await pline(S("%s misses."), await The(await mshot_xname(singleobj[0])));
        }
        await drop_throw(singleobj[0], 0, G.bhitpos.x, G.bhitpos.y);
      }
      break;
    }
    await tmp_at(G.bhitpos.x, G.bhitpos.y);
    await G.windowprocs.win_delay_output();
  }
  await tmp_at(G.bhitpos.x, G.bhitpos.y);
  await G.windowprocs.win_delay_output();
  await tmp_at(DISP_END, 0);
  mesg_given = 0;
  if (blindinc) {
    G.u.ucreamed = G.u.ucreamed + (blindinc >>> 0) >>> 0;
    await make_blinded(G.u.uprops[BLINDED].intrinsic + blindinc, FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await Your(S("%s"), G.c_common_strings.c_vision_clears);
    }
  }
}

export async function thrwmm(mtmp: struct_monst | null, mtarg: struct_monst | null): Promise<number> {
  let otmp = null;
  let mwep = null;
  let x = 0;
  let y = 0;
  let ispole = 0;
  if (mtmp.weapon_check === NEED_WEAPON || !mtmp.mw) {
    mtmp.weapon_check = NEED_RANGED_WEAPON;
    if (await mon_wield_item(mtmp) !== 0) {
      return 0;
    }
  }
  otmp = await select_rwep(mtmp);
  if (!otmp) {
    return 0;
  }
  ispole = ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && (G.objects[otmp.otyp].oc_subtyp === P_POLEARMS || G.objects[otmp.otyp].oc_subtyp === P_LANCE) ? 1 : 0) << 24 >> 24;
  x = mtmp.mx;
  y = mtmp.my;
  mwep = mtmp.mw;
  if (!ispole && m_lined_up(mtarg, mtmp)) {
    let chance = 8 - distmin(x, y, mtarg.mx, mtarg.my) > 1 ? 8 - distmin(x, y, mtarg.mx, mtarg.my) : 1;
    if (!mtarg.mflee || !rn2(chance)) {
      if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (mwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[mwep.otyp].oc_subtyp) && dist2(mtmp.mx, mtmp.my, mtarg.mx, mtarg.my) > PET_MISSILE_RANGE2) {
        return 0;
      }
      target = mtarg;
      archer = mtmp;
      await monshoot(mtmp, otmp, mwep);
      archer = target = null;
      nomul(0);
      return 1;
    }
  }
  return 0;
}

export async function spitmm(mtmp: struct_monst | null, mattk: struct_attack | null, mtarg: struct_monst | null): Promise<number> {
  let otmp = null;
  if (mtmp.mcan) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("A dry rattle comes from %s throat."), s_suffix(await mon_nam(mtmp)));
    }
    return 0;
  }
  if (m_lined_up(mtarg, mtmp)) {
    switch (mattk.adtyp) {
    case 11:
    case 7:
      otmp = await mksobj(BLINDING_VENOM, TRUE, FALSE);
      break;
    default:
      await impossible(S("bad attack type in spitmu"));
    case 8:
      otmp = await mksobj(ACID_VENOM, TRUE, FALSE);
      break;
    }
    if (!rn2(BOLT_LIM - distmin(mtmp.mx, mtmp.my, mtarg.mx, mtarg.my))) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s spits venom!"), await Monnam(mtmp));
      }
      target = mtarg;
      await m_throw(mtmp, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby), distmin(mtmp.mx, mtmp.my, mtarg.mx, mtarg.my), otmp);
      target = null;
      nomul(0);
      if (mtmp.mtame && !mtmp.isminion) {
        let dog = mtmp.mextra.edog;
        if (dog.hungrytime > 1) {
          dog.hungrytime -= 5;
        }
      }
      return 1;
    }
  }
  return 0;
}

export async function breamm(mtmp: struct_monst | null, mattk: struct_attack | null, mtarg: struct_monst | null): Promise<number> {
  let typ = mattk.adtyp === AD_RBRE ? rnd(AD_ACID) : mattk.adtyp;
  if (m_lined_up(mtarg, mtmp)) {
    if (mtmp.mcan) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s coughs."), await Monnam(mtmp));
        } else {
          await You_hear(S("a cough."));
        }
      }
      return 0;
    }
    if (!mtmp.mspec_used && rn2(3)) {
      if (typ >= AD_MAGM && typ <= AD_ACID) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s breathes %s!"), await Monnam(mtmp), breathwep[typ - 1]);
        }
        await dobuzz(-20 - (typ - 1), mattk.damn, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby), FALSE);
        nomul(0);
        mtmp.mspec_used = 6 + rn2(18);
        if (mtmp.mtame && !mtmp.isminion) {
          let dog = mtmp.mextra.edog;
          if (dog.hungrytime >= 10) {
            dog.hungrytime -= 10;
          }
        }
      } else {
        await impossible(S("Breath weapon %d used"), typ - 1);
      }
    } else {
      return 0;
    }
  }
  return 1;
}

export async function m_useupall(mon: struct_monst | null, obj: struct_obj | null): Promise<void> {
  await obj_extract_self(obj);
  if (obj.owornmask) {
    if (obj === mon.mw) {
      await mwepgone(mon);
    }
    mon.misc_worn_check = mon.misc_worn_check & ~obj.owornmask;
    await update_mon_intrinsics(mon, obj, FALSE, FALSE);
    obj.owornmask = 0;
  }
  await obfree(obj, null);
}

export async function m_useup(mon: struct_monst | null, obj: struct_obj | null): Promise<void> {
  if (obj.quan > 1) {
    --obj.quan;
    obj.owt = await weight(obj) >>> 0;
  } else {
    await m_useupall(mon, obj);
  }
}

export async function thrwmu(mtmp: struct_monst | null): Promise<void> {
  const otmp = [null];
  let mwep = null;
  let x = 0;
  let y = 0;
  let onm = null;
  if (mtmp.weapon_check === NEED_WEAPON || !mtmp.mw) {
    mtmp.weapon_check = NEED_RANGED_WEAPON;
    if (await mon_wield_item(mtmp) !== 0) {
      return;
    }
  }
  otmp[0] = await select_rwep(mtmp);
  if (!otmp[0]) {
    return;
  }
  if ((otmp[0].oclass === WEAPON_CLASS || otmp[0].oclass === TOOL_CLASS) && (G.objects[otmp[0].otyp].oc_subtyp === P_POLEARMS || G.objects[otmp[0].otyp].oc_subtyp === P_LANCE)) {
    let dam = 0;
    let hitv = 0;
    if (otmp[0] !== mtmp.mw) {
      return;
    }
    if (dist2(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy) > POLE_LIM || !($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1)) {
      return;
    }
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      onm = await xname(otmp[0]);
      await pline(S("%s thrusts %s."), await Monnam(mtmp), obj_is_pname(otmp[0]) ? await the(onm) : await an(onm));
    }
    dam = await dmgval(otmp[0], G.youmonst);
    hitv = 3 - distmin(G.u.ux, G.u.uy, mtmp.mx, mtmp.my);
    if (hitv < -4) {
      hitv = -4;
    }
    if (G.youmonst.data.msize >= 3) {
      ++hitv;
    }
    hitv += 8 + otmp[0].spe;
    if (dam < 1) {
      dam = 1;
    }
    await thitu(hitv, dam, P(otmp, 0), null);
    await stop_occupation();
    return;
  }
  x = mtmp.mx;
  y = mtmp.my;
  if (!lined_up(mtmp) || distmin(G.u.ux, G.u.uy, x, y) > distmin(G.u.ux0, G.u.uy0, x, y) && rn2(BOLT_LIM - distmin(x, y, mtmp.mux, mtmp.muy))) {
    return;
  }
  mwep = mtmp.mw;
  await monshoot(mtmp, otmp[0], mwep);
  nomul(0);
}

export async function spitmu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let otmp = null;
  if (mtmp.mcan) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("A dry rattle comes from %s throat."), s_suffix(await mon_nam(mtmp)));
    }
    return 0;
  }
  if (lined_up(mtmp)) {
    switch (mattk.adtyp) {
    case 11:
    case 7:
      otmp = await mksobj(BLINDING_VENOM, TRUE, FALSE);
      break;
    default:
      await impossible(S("bad attack type in spitmu"));
    case 8:
      otmp = await mksobj(ACID_VENOM, TRUE, FALSE);
      break;
    }
    if (!rn2(BOLT_LIM - distmin(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy))) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s spits venom!"), await Monnam(mtmp));
      }
      await m_throw(mtmp, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby), distmin(mtmp.mx, mtmp.my, mtmp.mux, mtmp.muy), otmp);
      nomul(0);
      return 0;
    } else {
      await obj_extract_self(otmp);
      await obfree(otmp, null);
    }
  }
  return 0;
}

export async function breamu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  let typ = mattk.adtyp === AD_RBRE ? rnd(AD_ACID) : mattk.adtyp;
  if (lined_up(mtmp)) {
    if (mtmp.mcan) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s coughs."), await Monnam(mtmp));
        } else {
          await You_hear(S("a cough."));
        }
      }
      return 0;
    }
    if (!mtmp.mspec_used && rn2(3)) {
      if (typ >= AD_MAGM && typ <= AD_ACID) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s breathes %s!"), await Monnam(mtmp), breathwep[typ - 1]);
        }
        await buzz(-20 - (typ - 1), mattk.damn, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby));
        nomul(0);
        if (!rn2(3)) {
          mtmp.mspec_used = 10 + rn2(20);
        }
        if (typ === AD_SLEE && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic)) {
          mtmp.mspec_used += rnd(20);
        }
      } else {
        await impossible(S("Breath weapon %d used"), typ - 1);
      }
    }
  }
  return 1;
}

export function linedup(ax: number, ay: number, bx: number, by: number, boulderhandling: number): number {
  let dx = 0;
  let dy = 0;
  let boulderspots = 0;
  G.tbx = ax - bx << 24 >> 24;
  G.tby = ay - by << 24 >> 24;
  if (!G.tbx && !G.tby) {
    return FALSE;
  }
  if ((!G.tbx || !G.tby || Math.abs(G.tbx) === Math.abs(G.tby)) && distmin(G.tbx, G.tby, 0, 0) < BOLT_LIM) {
    if (ax === G.u.ux && ay === G.u.uy ? ($rd(G.viz_array.a[G.viz_array.o + by], bx) & 1) << 24 >> 24 : clear_path(ax, ay, bx, by)) {
      return TRUE;
    }
    if (boulderhandling === 0) {
      return FALSE;
    }
    dx = sgn(ax - bx), dy = sgn(ay - by);
    boulderspots = 0;
    do {
      bx = bx + dx << 24 >> 24, by = by + dy << 24 >> 24;
      if ($at2(G.level.locations, bx, by).typ < POOL || closed_door(bx, by)) {
        return FALSE;
      }
      if (sobj_at(BOULDER, bx, by)) {
        ++boulderspots;
      }
    } while (bx !== ax || by !== ay);
    if (boulderhandling === 1 || rn2(2 + boulderspots) < 2) {
      return TRUE;
    }
  }
  return FALSE;
}

function m_lined_up(mtarg: struct_monst | null, mtmp: struct_monst | null): number {
  return linedup(mtarg.mx, mtarg.my, mtmp.mx, mtmp.my, 0);
}

export function lined_up(mtmp: struct_monst | null): number {
  let ignore_boulders = 0;
  if (G.u.umonnum !== G.u.umonster && rn2(25) && (G.u.uundetected | 0 || (G.youmonst.m_ap_type & 7) !== M_AP_NOTHING && (G.youmonst.m_ap_type & 7) !== M_AP_MONSTER)) {
    return FALSE;
  }
  ignore_boulders = ((mtmp.data.mflags2 & 134217728) >>> 0 !== 0 || m_carrying(mtmp, WAN_STRIKING) ? 1 : 0) << 24 >> 24;
  return linedup(mtmp.mux, mtmp.muy, mtmp.mx, mtmp.my, ignore_boulders ? 1 : 2);
}

export function m_carrying(mtmp: struct_monst | null, type: number): struct_obj | null {
  let otmp = null;
  for (otmp = mtmp.minvent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === type) {
      return otmp;
    }
  }
  return null;
}

export async function hit_bars(objp: Ptr | null, objx: number, objy: number, barsx: number, barsy: number, your_fault: number, from_invent: number): Promise<void> {
  let otmp = objp.a[objp.o];
  let obj_type = otmp.otyp;
  let unbreakable = ((($at2(G.level.locations, barsx, barsy).flags | 0) & W_NONDIGGABLE) !== 0 ? 1 : 0) << 24 >> 24;
  if (your_fault ? await hero_breaks(otmp, objx, objy, from_invent) : await breaks(otmp, objx, objy)) {
    objp.a[objp.o] = null;
    if (obj_type === POT_ACID) {
      if ($rd(G.viz_array.a[G.viz_array.o + barsy], barsx) & 2 && !unbreakable) {
        await pline_The(S("iron bars are dissolved!"));
      } else {
        await You_hear(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("angry snakes!") : S("a hissing noise."));
      }
      if (!unbreakable) {
        await dissolve_bars(barsx, barsy);
      }
    }
  } else if (obj_type === BOULDER || obj_type === HEAVY_IRON_BALL) {
    await pline(S("Whang!"));
  } else if (otmp.oclass === COIN_CLASS || (G.objects[obj_type].oc_material | 0) === GOLD || (G.objects[obj_type].oc_material | 0) === SILVER) {
    await pline(S("Clink!"));
  } else {
    await pline(S("Clonk!"));
  }
}

export async function hits_bars(obj_p: Ptr | null, x: number, y: number, barsx: number, barsy: number, always_hit: number, whodidit: number): Promise<number> {
  let otmp = obj_p.a[obj_p.o];
  let obj_type = otmp.otyp;
  let hits = always_hit << 24 >> 24;
  if (!hits) {
    switch (otmp.oclass) {
    case WEAPON_CLASS:
      {
        let oskill = G.objects[obj_type].oc_subtyp;
        hits = (oskill !== -P_BOW && oskill !== -P_CROSSBOW && oskill !== -P_DART && oskill !== -P_SHURIKEN && oskill !== P_SPEAR && oskill !== P_KNIFE ? 1 : 0) << 24 >> 24;
        break;
      }
    case ARMOR_CLASS:
      hits = (G.objects[obj_type].oc_subtyp !== ARM_GLOVES ? 1 : 0) << 24 >> 24;
      break;
    case TOOL_CLASS:
      hits = (obj_type !== SKELETON_KEY && obj_type !== LOCK_PICK && obj_type !== CREDIT_CARD && obj_type !== TALLOW_CANDLE && obj_type !== WAX_CANDLE && obj_type !== LENSES && obj_type !== TIN_WHISTLE && obj_type !== MAGIC_WHISTLE ? 1 : 0) << 24 >> 24;
      break;
    case ROCK_CLASS:
      if (obj_type !== STATUE || G.mons[otmp.corpsenm].msize > MZ_TINY) {
        hits = TRUE;
      }
      break;
    case FOOD_CLASS:
      if (obj_type === CORPSE && G.mons[otmp.corpsenm].msize > MZ_TINY) {
        hits = TRUE;
      } else {
        hits = (obj_type === MEAT_STICK || obj_type === HUGE_CHUNK_OF_MEAT ? 1 : 0) << 24 >> 24;
      }
      break;
    case SPBOOK_CLASS:
    case WAND_CLASS:
    case BALL_CLASS:
    case CHAIN_CLASS:
      hits = TRUE;
      break;
    default:
      break;
    }
  }
  if (hits && whodidit !== -1) {
    await hit_bars(obj_p, x, y, barsx, barsy, whodidit, FALSE);
  }
  return hits;
}

export function $init(): void {
  breathwep = [S("fragments"),
S("fire"),
S("frost"),
S("sleep gas"),
S("a disintegration blast"),
S("lightning"),
S("poison gas"),
S("acid"),
S("strange breath #8"),
S("strange breath #9")];
  mesg_given = 0;
  target = null;
  archer = null;
}
