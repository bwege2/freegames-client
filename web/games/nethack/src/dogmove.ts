// @ts-nocheck
// NetHack 3.6.7 dogmove.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { m_unleash } from './apply.ts';
import { dtoxy, isok, xytod } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { Monnam, mon_nam, noit_Monnam, y_monnam } from './do_name.ts';
import { dogfood } from './dog.ts';
import { on_level } from './dungeon.ts';
import { eaten_stat } from './eat.ts';
import { may_dig } from './hack.ts';
import { dist2, distmin, sgn } from './hacklib.ts';
import { currency, delobj, sobj_at } from './invent.ts';
import { grow_up } from './makemon.ts';
import { mattackm, mdisplacem } from './mhitm.ts';
import { mattacku } from './mhitu.ts';
import { lose_guardian_angel } from './minion.ts';
import { costly_alteration, obj_extract_self, splitobj } from './mkobj.ts';
import { can_carry, mfndpos, mondied, monnear, newcham, pm_to_cham } from './mon.ts';
import { attacktype, locomotion, max_passive_dmg, monsndx, passes_bars, pronoun_gender } from './mondata.ts';
import { m_digweapon_check, monhaskey, onscary, set_apparxy, should_displace, undesirable_disp } from './monmove.ts';
import { mcureblindness } from './muse.ts';
import { an, distant_name, doname, vtense, xname } from './objnam.ts';
import { You, You_feel, Your, pline } from './pline.ts';
import { unpunish } from './read.ts';
import { m_in_out_region } from './region.ts';
import { rn2, rnd } from './rnd.ts';
import { unpaid_cost } from './shk.ts';
import { beg, whimper } from './sounds.ts';
import { mpickobj, relobj } from './steal.ts';
import { dismount_steed, place_monster } from './steed.ts';
import { goodpos } from './teleport.ts';
import { gettrack } from './track.ts';
import { t_at } from './trap.ts';
import { clear_path, do_clear_area } from './vision.ts';
import { mon_wield_item } from './weapon.ts';
import { worm_known } from './worm.ts';
import { m_dowear, which_armor } from './worn.ts';
import { resist } from './zap.ts';
import { struct_edog, struct_monst, struct_nhcoord, struct_obj, struct_qmchoices } from './structs.ts';
import { $at2, $rd, $sarr, $sarrOf, $sat, $ta, $wr, G, P, S, strchr, strcpy } from './rt/index.ts';
import { ACCFOOD, ALLOW_BARS, ALLOW_DIG, ALLOW_M, ALLOW_MDISP, ALLOW_ROCK, ALLOW_SANCT, ALLOW_SSM, ALLOW_TRAPS, ALLOW_U, ALLOW_WALL, APPORT, AT_NONE, AT_WEAP, A_NONE, BALL_CLASS, BLINDED, BOULDER, BUSTDOOR, CADAVER, CARROT, CHAIN_CLASS, COIN_CLASS, COLNO, CONFLICT, CORPSE, COST_DEGRD, CREDIT_CARD, DEAF, DETECT_MONSTERS, DISMOUNT_POLY, DISMOUNT_THROWN, DOGFOOD, DOOR, D_CLOSED, D_LOCKED, EXPL_MAX, FALSE, FARAWAY, FOOD_CLASS, GOLD_PIECE, HALLUC, HALLUC_RES, INFRAVISION, LOCK_PICK, MANFOOD, MAXPCHARS, MM_AGR_DIED, MM_DEF_DIED, MM_HIT, MS_GUARDIAN, MS_LEADER, MTSZ, M_AP_FURNITURE, M_AP_MONSTER, M_AP_OBJECT, NEED_HTH_WEAPON, NEED_WEAPON, NON_PM, OPENDOOR, PICK_AXE, PM_DOG, PM_FLOATING_EYE, PM_GELATINOUS_CUBE, PM_GIANT_MIMIC, PM_GIANT_RAT, PM_GREEN_SLIME, PM_HOUSECAT, PM_KITTEN, PM_LARGE_CAT, PM_LARGE_DOG, PM_LARGE_MIMIC, PM_LITTLE_DOG, PM_RUST_MONSTER, PM_SMALL_MIMIC, POOL, PROT_FROM_SHAPE_CHANGERS, P_PICK_AXE, RING_CLASS, ROCK_CLASS, ROOM, ROWNO, SCR_MAIL, SEE_INVIS, SINK, SQSRCHRADIUS, S_DOG, S_VAMPIRE, TELEPAT, TOOL_CLASS, TRIPE_RATION, TRUE, UNDEF, UNICORN_HORN, UNLOCKDOOR, WARN_OF_MON, WEAPON_CLASS, W_ARMS } from './consts.ts';

let nofetch: any;
let gtyp: number;
let gx: number;
let gy: number;
let qm: any;

export async function droppables(mon: struct_monst | null): Promise<struct_obj | null> {
  let obj = null;
  let wep = null;
  let dummy = new struct_obj();
  let pickaxe = null;
  let unihorn = null;
  let key = null;
  dummy.$cp(G.zeroobj);
  dummy.otyp = GOLD_PIECE;
  dummy.oartifact = 1;
  pickaxe = unihorn = key = null;
  wep = mon.mw;
  if ((mon.data.mflags1 & 262144) >>> 0 !== 0 || (mon.data.mflags1 & 65536) >>> 0 !== 0) {
    pickaxe = unihorn = key = dummy;
  } else {
    if (!((mon.data.mflags1 & 32) >>> 0 !== 0) || !((mon.data.mflags1 & 64) >>> 0 !== 0)) {
      pickaxe = dummy;
    }
    if ((mon.data.mflags1 & 8192) >>> 0 !== 0 || mon.data.msize < 1) {
      key = dummy;
    }
  }
  if (wep) {
    if ((wep.oclass === WEAPON_CLASS || wep.oclass === TOOL_CLASS) && G.objects[wep.otyp].oc_subtyp === P_PICK_AXE) {
      pickaxe = wep;
    }
    if (wep.otyp === UNICORN_HORN) {
      unihorn = wep;
    }
  }
  for (obj = mon.minvent; obj; obj = obj.nobj) {
    switch (obj.otyp) {
    case 50:
      if (await which_armor(mon, W_ARMS)) {
        break;
      }
      if (pickaxe && pickaxe.otyp === PICK_AXE && pickaxe !== wep && (!pickaxe.oartifact || obj.oartifact)) {
        return pickaxe;
      }
    case 234:
      if (!pickaxe || obj.oartifact && !pickaxe.oartifact) {
        if (pickaxe) {
          return pickaxe;
        }
        pickaxe = obj;
        continue;
      }
      break;
    case 236:
      if (obj.cursed) {
        break;
      }
      if (!unihorn || obj.oartifact && !unihorn.oartifact) {
        if (unihorn) {
          return unihorn;
        }
        unihorn = obj;
        continue;
      }
      break;
    case 196:
      if (key && key.otyp === LOCK_PICK && (!key.oartifact || obj.oartifact)) {
        return key;
      }
    case 197:
      if (key && key.otyp === CREDIT_CARD && (!key.oartifact || obj.oartifact)) {
        return key;
      }
    case 198:
      if (!key || obj.oartifact && !key.oartifact) {
        if (key) {
          return key;
        }
        key = obj;
        continue;
      }
      break;
    default:
      break;
    }
    if (!obj.owornmask && obj !== wep) {
      return obj;
    }
  }
  return null;
}

export function cursed_object_at(x: number, y: number): number {
  let otmp = null;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.cursed) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function dog_nutrition(mtmp: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let nutrit = 0;
  if (obj.oclass === FOOD_CLASS) {
    if (obj.otyp === CORPSE) {
      mtmp.meating = 3 + (G.mons[obj.corpsenm].cwt >> 6);
      nutrit = G.mons[obj.corpsenm].cnutrit;
    } else {
      mtmp.meating = G.objects[obj.otyp].oc_delay;
      nutrit = G.objects[obj.otyp].oc_nutrition;
    }
    switch (mtmp.data.msize) {
    case 0:
      nutrit = nutrit * 8;
      break;
    case 1:
      nutrit = nutrit * 6;
      break;
    default:
    case 2:
      nutrit = nutrit * 5;
      break;
    case 3:
      nutrit = nutrit * 4;
      break;
    case 4:
      nutrit = nutrit * 3;
      break;
    case 7:
      nutrit = nutrit * 2;
      break;
    }
    if (obj.oeaten) {
      mtmp.meating = await eaten_stat(mtmp.meating, obj);
      nutrit = await eaten_stat(nutrit, obj);
    }
  } else if (obj.oclass === COIN_CLASS) {
    mtmp.meating = (Math.trunc(obj.quan / 2000) | 0) + 1;
    if (mtmp.meating < 0) {
      mtmp.meating = 1;
    }
    nutrit = Math.trunc(obj.quan / 20) | 0;
    if (nutrit < 0) {
      nutrit = 0;
    }
  } else {
    mtmp.meating = (obj.owt / 20 >>> 0) + 1 >>> 0 | 0;
    nutrit = 5 * G.objects[obj.otyp].oc_nutrition;
  }
  return nutrit;
}

export async function dog_eat(mtmp: struct_monst | null, obj: struct_obj | null, x: number, y: number, devour: number): Promise<number> {
  let edog = mtmp.mextra.edog;
  let poly = 0;
  let grow = 0;
  let heal = 0;
  let eyes = 0;
  let slimer = 0;
  let deadmimic = 0;
  let nutrit = 0;
  let oprice = 0;
  let objnambuf = new Int8Array(256);
  objnambuf[0] = 0;
  if (edog.hungrytime < G.monstermoves) {
    edog.hungrytime = G.monstermoves;
  }
  nutrit = await dog_nutrition(mtmp, obj);
  deadmimic = (obj.otyp === CORPSE && (obj.corpsenm === PM_SMALL_MIMIC || obj.corpsenm === PM_LARGE_MIMIC || obj.corpsenm === PM_GIANT_MIMIC) ? 1 : 0) << 24 >> 24;
  slimer = (obj.otyp === CORPSE && obj.corpsenm === PM_GREEN_SLIME ? 1 : 0) << 24 >> 24;
  poly = ((obj.otyp === 240 || obj.otyp === 241 || obj.otyp === 271) && pm_to_cham(obj.corpsenm) !== -1 ? 1 : 0) << 24 >> 24;
  grow = ((obj.otyp === 240 || obj.otyp === 241 || obj.otyp === 271) && obj.corpsenm === 226 ? 1 : 0) << 24 >> 24;
  heal = ((obj.otyp === 240 || obj.otyp === 241 || obj.otyp === 271) && obj.corpsenm === 275 ? 1 : 0) << 24 >> 24;
  eyes = (obj.otyp === CARROT ? 1 : 0) << 24 >> 24;
  if (devour) {
    if (mtmp.meating > 1) {
      mtmp.meating = mtmp.meating / 2 | 0;
    }
    if (nutrit > 1) {
      nutrit = nutrit * 3 / 4 | 0;
    }
  }
  edog.hungrytime += nutrit;
  mtmp.mconf = 0;
  if (edog.mhpmax_penalty) {
    mtmp.mhpmax += edog.mhpmax_penalty;
    edog.mhpmax_penalty = 0;
  }
  if (mtmp.mflee | 0 && (mtmp.mfleetim | 0) > 1) {
    mtmp.mfleetim = (((mtmp.mfleetim | 0) / 2 | 0) >>> 0) & 127;
  }
  if (mtmp.mtame < 20) {
    mtmp.mtame = mtmp.mtame + 1 << 24 >> 24;
  }
  if (x !== mtmp.mx || y !== mtmp.my) {
    await newsym(x, y);
    await newsym(mtmp.mx, mtmp.my);
  }
  if (obj.quan > 1 && obj.oclass === FOOD_CLASS) {
    obj = await splitobj(obj, 1);
  }
  if (obj.unpaid) {
    ++G.iflags.suppress_price;
  }
  if (is_pool(x, y) && !G.u.uinwater) {
  } else {
    let seeobj = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) << 24 >> 24;
    let sawpet = ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
    if (sawpet || seeobj && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      if ((mtmp.data.mflags1 & 32) >>> 0 !== 0) {
        await pline(S("%s digs in."), await noit_Monnam(mtmp));
      } else {
        await pline(S("%s %s %s."), await noit_Monnam(mtmp), devour ? S("devours") : S("eats"), await distant_name(obj, doname));
      }
    } else if (seeobj) {
      await pline(S("It %s %s."), devour ? S("devours") : S("eats"), await distant_name(obj, doname));
    }
  }
  if (obj.unpaid) {
    strcpy(P(objnambuf), await xname(obj));
    --G.iflags.suppress_price;
  }
  if (await dogfood(mtmp, obj) === DOGFOOD && obj.invlet) {
    edog.apport += Math.trunc(200 / (edog.dropdist + G.monstermoves - edog.droptime)) | 0;
  }
  if (mtmp.data === $sat(G.mons, PM_RUST_MONSTER) && obj.oerodeproof | 0) {
    if (obj.unpaid) {
      await costly_alteration(obj, COST_DEGRD);
    }
    obj.oerodeproof = 0;
    mtmp.mstun = 1;
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && G.flags.verbose) {
      await pline(S("%s spits %s out in disgust!"), await Monnam(mtmp), await distant_name(obj, doname));
    }
  } else if (obj === G.uball) {
    await unpunish();
    await delobj(obj);
  } else if (obj === G.uchain) {
    await unpunish();
  } else {
    if (obj.unpaid) {
      oprice = await unpaid_cost(obj, TRUE);
      await pline(S("That %s will cost you %ld %s."), P(objnambuf), oprice, await currency(oprice));
    }
    await delobj(obj);
  }
  if (poly || slimer) {
    let ptr = slimer ? $sat(G.mons, PM_GREEN_SLIME) : null;
    await newcham(mtmp, ptr, FALSE, $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2);
  }
  if (grow && mtmp.m_lev < mtmp.data.mlevel + 15) {
    if (!await grow_up(mtmp, null)) {
      return 2;
    }
  }
  if (heal) {
    mtmp.mhp = mtmp.mhpmax;
  }
  if ((eyes || heal) && !mtmp.mcansee) {
    await mcureblindness(mtmp, (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0);
  }
  if (deadmimic) {
    await quickmimic(mtmp);
  }
  return 1;
}

async function dog_hunger(mtmp: struct_monst | null, edog: struct_edog | null): Promise<number> {
  let $g = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!(G.monstermoves > edog.hungrytime + 500)) { $g = 2; continue $L; }
      if (!(!((mtmp.data.mflags1 & 536870912) >>> 0 !== 0) && !((mtmp.data.mflags1 & 1073741824) >>> 0 !== 0))) { $g = 4; continue $L; }
      {
        edog.hungrytime = G.monstermoves + 500;
      }
      { $g = 3; continue $L; }
    case 4:
      if (!!edog.mhpmax_penalty) { $g = 6; continue $L; }
      {
        let newmhpmax = mtmp.mhpmax / 3 | 0;
        mtmp.mconf = 1;
        edog.mhpmax_penalty = mtmp.mhpmax - newmhpmax;
        mtmp.mhpmax = newmhpmax;
        if (mtmp.mhp > mtmp.mhpmax) {
          mtmp.mhp = mtmp.mhpmax;
        }
        if (mtmp.mhp < 1) {
          { $g = 1; continue $L; }
        }
        if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
          await pline(S("%s is confused from hunger."), await Monnam(mtmp));
        } else if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
          await beg(mtmp);
        } else {
          await You_feel(S("worried about %s."), await y_monnam(mtmp));
        }
        await stop_occupation();
      }
      { $g = 5; continue $L; }
    case 6:
      if (!(G.monstermoves > edog.hungrytime + 750 || mtmp.mhp < 1)) { $g = 7; continue $L; }
    case 1: // dog_died
      if (mtmp.mleashed | 0 && mtmp !== G.u.usteed) {
        await Your(S("leash goes slack."));
      } else if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline(S("%s starves."), await Monnam(mtmp));
      } else {
        await You_feel(S("%s for a moment."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("bummed") : S("sad"));
      }
      await mondied(mtmp);
      return TRUE;
    case 7:
    case 5:
    case 3:
    case 2:
      return FALSE;
    }
    break;
  }
}

async function dog_invent(mtmp: struct_monst | null, edog: struct_edog | null, udist: number): Promise<number> {
  let omx = 0;
  let omy = 0;
  let carryamt = 0;
  let obj = null;
  let otmp = null;
  if (mtmp.msleeping | 0 || !mtmp.mcanmove) {
    return 0;
  }
  omx = mtmp.mx;
  omy = mtmp.my;
  if (await droppables(mtmp)) {
    if (!rn2(udist + 1) || !rn2(edog.apport)) {
      if (rn2(10) < edog.apport) {
        await relobj(mtmp, mtmp.minvis | 0, TRUE);
        if (edog.apport > 1) {
          --edog.apport;
        }
        edog.dropdist = udist >>> 0;
        edog.droptime = G.monstermoves;
      }
    }
  } else {
    if (!!(obj = G.level.objects[omx][omy]) && !strchr(P(nofetch), obj.oclass) && obj.otyp !== SCR_MAIL) {
      let edible = await dogfood(mtmp, obj);
      if ((edible <= CADAVER || edog.mhpmax_penalty && edible === ACCFOOD) && could_reach_item(mtmp, obj.ox, obj.oy)) {
        return await dog_eat(mtmp, obj, omx, omy, FALSE);
      }
      carryamt = can_carry(mtmp, obj);
      if (carryamt > 0 && !obj.cursed && could_reach_item(mtmp, obj.ox, obj.oy)) {
        if (rn2(20) < edog.apport + 3) {
          if (rn2(udist) || !rn2(edog.apport)) {
            otmp = obj;
            if (carryamt !== obj.quan) {
              otmp = await splitobj(obj, carryamt);
            }
            if ($rd(G.viz_array.a[G.viz_array.o + omy], omx) & 2 && G.flags.verbose) {
              await pline(S("%s picks up %s."), await Monnam(mtmp), await distant_name(otmp, doname));
            }
            await obj_extract_self(otmp);
            await newsym(omx, omy);
            await mpickobj(mtmp, otmp);
            if (attacktype(mtmp.data, AT_WEAP) && mtmp.weapon_check === NEED_WEAPON) {
              mtmp.weapon_check = NEED_HTH_WEAPON;
              await mon_wield_item(mtmp);
            }
            await m_dowear(mtmp, FALSE);
          }
        }
      }
    }
  }
  return 0;
}

async function dog_goal(mtmp: struct_monst | null, edog: struct_edog | null, after: number, udist: number, whappr: number): Promise<number> {
  let omx = 0;
  let omy = 0;
  let in_masters_sight = 0;
  let dog_has_minvent = 0;
  let obj = null;
  let otyp = 0;
  let appr = 0;
  if (mtmp === G.u.usteed) {
    return -2;
  }
  omx = mtmp.mx;
  omy = mtmp.my;
  in_masters_sight = ($rd(G.viz_array.a[G.viz_array.o + omy], omx) & 1) << 24 >> 24;
  dog_has_minvent = (!!await droppables(mtmp) ? 1 : 0) << 24 >> 24;
  if (!edog || mtmp.mleashed | 0) {
    gtyp = APPORT;
    gx = G.u.ux;
    gy = G.u.uy;
  } else {
    let min_x = 0;
    let max_x = 0;
    let min_y = 0;
    let max_y = 0;
    let nx = 0;
    let ny = 0;
    gtyp = UNDEF;
    gx = gy = 0;
    if ((min_x = omx - SQSRCHRADIUS) < 1) {
      min_x = 1;
    }
    if ((max_x = omx + SQSRCHRADIUS) >= COLNO) {
      max_x = COLNO - 1;
    }
    if ((min_y = omy - SQSRCHRADIUS) < 0) {
      min_y = 0;
    }
    if ((max_y = omy + SQSRCHRADIUS) >= ROWNO) {
      max_y = ROWNO - 1;
    }
    for (obj = G.level.objlist; obj; obj = obj.nobj) {
      nx = obj.ox;
      ny = obj.oy;
      if (nx >= min_x && nx <= max_x && ny >= min_y && ny <= max_y) {
        otyp = await dogfood(mtmp, obj) << 24 >> 24;
        if (otyp > gtyp || otyp === UNDEF) {
          continue;
        }
        if (cursed_object_at(nx, ny) && !(edog.mhpmax_penalty && otyp < MANFOOD)) {
          continue;
        }
        if (!could_reach_item(mtmp, nx, ny) || !can_reach_location(mtmp, mtmp.mx, mtmp.my, nx, ny)) {
          continue;
        }
        if (otyp < MANFOOD) {
          if (otyp < gtyp || dist2(nx, ny, omx, omy) < dist2(gx, gy, omx, omy)) {
            gx = nx << 24 >> 24;
            gy = ny << 24 >> 24;
            gtyp = otyp;
          }
        } else if (gtyp === UNDEF && in_masters_sight && !dog_has_minvent && (!$at2(G.level.locations, omx, omy).lit || $at2(G.level.locations, G.u.ux, G.u.uy).lit | 0) && (otyp === MANFOOD || clear_path(mtmp.mx, mtmp.my, nx, ny)) && edog.apport > rn2(8) && can_carry(mtmp, obj) > 0) {
          gx = nx << 24 >> 24;
          gy = ny << 24 >> 24;
          gtyp = APPORT;
        }
      }
    }
  }
  if (gtyp === UNDEF || gtyp !== DOGFOOD && gtyp !== APPORT && G.monstermoves < edog.hungrytime) {
    gx = G.u.ux;
    gy = G.u.uy;
    if (after && udist <= 4 && gx === G.u.ux && gy === G.u.uy) {
      return -2;
    }
    appr = udist >= 9 ? 1 : mtmp.mflee | 0 ? -1 : 0;
    if (udist > 1) {
      if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ >= ROOM) || !rn2(4) || whappr || dog_has_minvent && rn2(edog.apport)) {
        appr = 1;
      }
    }
    if (appr === 0) {
      for (obj = G.invent; obj; obj = obj.nobj) {
        if (await dogfood(mtmp, obj) === DOGFOOD) {
          appr = 1;
          break;
        }
      }
    }
  } else {
    appr = 1;
  }
  if (mtmp.mconf) {
    appr = 0;
  }
  if (gx === G.u.ux && gy === G.u.uy && !in_masters_sight) {
    let cp = null;
    cp = gettrack(omx, omy);
    if (cp) {
      gx = cp.x;
      gy = cp.y;
      if (edog) {
        edog.ogoal.x = 0;
      }
    } else {
      if (edog && edog.ogoal.x && (edog.ogoal.x !== omx || edog.ogoal.y !== omy)) {
        gx = edog.ogoal.x;
        gy = edog.ogoal.y;
        edog.ogoal.x = 0;
      } else {
        const fardist = new Int32Array(1);
        fardist[0] = Math.imul(FARAWAY, FARAWAY);
        gx = gy = FARAWAY;
        await do_clear_area(omx, omy, 9, wantdoor, P(fardist, 0));
        if (gx === FARAWAY || gx === omx && gy === omy) {
          gx = G.u.ux;
          gy = G.u.uy;
        } else if (edog) {
          edog.ogoal.x = gx;
          edog.ogoal.y = gy;
        }
      }
    }
  } else if (edog) {
    edog.ogoal.x = 0;
  }
  return appr;
}

function find_targ(mtmp: struct_monst | null, dx: number, dy: number, maxdist: number): struct_monst | null {
  let targ = null;
  let curx = mtmp.mx;
  let cury = mtmp.my;
  let dist = 0;
  for (; dist < maxdist; ++dist) {
    curx += dx;
    cury += dy;
    if (!isok(curx, cury)) {
      break;
    }
    if (!clear_path(mtmp.mx, mtmp.my, curx, cury)) {
      break;
    }
    if (curx === mtmp.mux && cury === mtmp.muy) {
      return G.youmonst;
    }
    if (!!(targ = !!G.level.monsters[curx][cury] ? G.level.monsters[curx][cury] : null)) {
      if ((!targ.minvis || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && !targ.mundetected) {
        break;
      }
      targ = null;
    }
  }
  return targ;
}

function find_friends(mtmp: struct_monst | null, mtarg: struct_monst | null, maxdist: number): number {
  let pal = null;
  let dx = sgn(mtarg.mx - mtmp.mx);
  let dy = sgn(mtarg.my - mtmp.my);
  let curx = mtarg.mx;
  let cury = mtarg.my;
  let dist = distmin(mtarg.mx, mtarg.my, mtmp.mx, mtmp.my);
  for (; dist <= maxdist; ++dist) {
    curx += dx;
    cury += dy;
    if (!isok(curx, cury)) {
      return 0;
    }
    if (!clear_path(mtmp.mx, mtmp.my, curx, cury)) {
      return 0;
    }
    if (mtmp.mux === curx && mtmp.muy === cury) {
      return 1;
    }
    pal = !!G.level.monsters[curx][cury] ? G.level.monsters[curx][cury] : null;
    if (pal) {
      if (pal.mtame) {
        if (!pal.minvis || (mtmp.data.mflags1 & 16777216) >>> 0 !== 0) {
          return 1;
        }
      } else {
        if (pal.data.msound === MS_LEADER || pal.data.msound === MS_GUARDIAN) {
          return 1;
        }
      }
    }
  }
  return 0;
}

function score_targ(mtmp: struct_monst | null, mtarg: struct_monst | null): number {
  let score = 0;
  if (!mtmp.mconf || !rn2(3) || (G.dungeon_topology.d_qstart_level.dlevel || G.dungeon_topology.d_qstart_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level)) {
    let mtmp_lev = 0;
    let align1 = A_NONE;
    let align2 = A_NONE;
    let faith1 = TRUE;
    let faith2 = TRUE;
    if (mtmp.isminion) {
      align1 = mtmp.mextra.emin.min_align;
    } else if (mtmp.ispriest) {
      align1 = mtmp.mextra.epri.shralign;
    } else {
      faith1 = FALSE;
    }
    if (mtarg.isminion) {
      align2 = mtarg.mextra.emin.min_align;
    } else if (mtarg.ispriest) {
      align2 = mtarg.mextra.epri.shralign;
    } else {
      faith2 = FALSE;
    }
    if (mtarg.data.msound === MS_LEADER || mtarg.data.msound === MS_GUARDIAN) {
      return -5000;
    }
    if (faith1 && faith2 && align1 === align2 && mtarg.mpeaceful | 0) {
      score -= 5000;
      return score;
    }
    if (distmin(mtmp.mx, mtmp.my, mtarg.mx, mtarg.my) <= 1) {
      score -= 3000;
      return score;
    }
    if (mtarg.mtame || mtarg === G.youmonst) {
      score -= 3000;
      return score;
    }
    if (find_friends(mtmp, mtarg, 15)) {
      score -= 3000;
      return score;
    }
    if (!mtarg.mpeaceful) {
      score += 10;
    }
    if (mtarg.data.mattk[0].aatyp === AT_NONE) {
      score -= 1000;
    }
    if (mtarg.m_lev < 2 && mtmp.m_lev > 5 || mtmp.m_lev > 12 && mtarg.m_lev < mtmp.m_lev - 9 && G.u.ulevel > 8 && mtarg.m_lev < G.u.ulevel - 7) {
      score -= 25;
    }
    mtmp_lev = mtmp.m_lev;
    if ((mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) && mtmp.data.mlet !== S_VAMPIRE) {
      mtmp_lev = G.mons[mtmp.cham].mlevel;
      mtmp_lev += rn2((mtmp_lev / 2 | 0) + 1);
      if (mtmp.m_lev > mtmp_lev) {
        mtmp_lev = mtmp.m_lev;
      }
    }
    if (mtarg.m_lev > mtmp_lev + 4) {
      score -= (mtarg.m_lev - mtmp_lev) * 20;
    }
    score += mtarg.m_lev * 2 + (mtarg.mhp / 3 | 0);
  }
  score += rnd(5);
  if (mtmp.mconf | 0 && !rn2(3)) {
    score -= 1000;
  }
  return score;
}

function best_target(mtmp: struct_monst | null): struct_monst | null {
  let dx = 0;
  let dy = 0;
  let bestscore = -40000;
  let currscore = 0;
  let best_targ = null;
  let temp_targ = null;
  if (!mtmp) {
    return null;
  }
  if (!mtmp.mcansee) {
    return null;
  }
  for (dy = -1; dy < 2; ++dy) {
    for (dx = -1; dx < 2; ++dx) {
      if (!dx && !dy) {
        continue;
      }
      temp_targ = find_targ(mtmp, dx, dy, 7);
      if (!temp_targ) {
        continue;
      }
      currscore = score_targ(mtmp, temp_targ);
      if (currscore > bestscore) {
        bestscore = currscore;
        best_targ = temp_targ;
      }
    }
  }
  if (bestscore < 0) {
    best_targ = null;
  }
  return best_targ;
}

export async function dog_move(mtmp: struct_monst | null, after: number): Promise<number> {
  let $g = 0;
  let omx = 0;
  let omy = 0;
  let appr = 0;
  let whappr = 0;
  let udist = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let edog = null;
  let obj = null;
  let otyp = 0;
  let has_edog = 0;
  let cursemsg = new Int8Array(9);
  let do_eat = 0;
  let better_with_displacing = 0;
  let nix = 0;
  let niy = 0;
  let nx = 0;
  let ny = 0;
  let cnt = 0;
  let uncursedcnt = 0;
  let chcnt = 0;
  let chi = 0;
  let nidist = 0;
  let ndist = 0;
  let poss = $sarr(struct_nhcoord, 9);
  let info = new Float64Array(9);
  let allowflags = 0;
  let cc = new struct_nhcoord();
  $L: for (;;) {
    switch ($g) {
    case 0:
      edog = mtmp.mextra.edog;
      obj = null;
      cursemsg = new Int8Array(9);
      do_eat = FALSE;
      better_with_displacing = FALSE;
      chi = -1;
      poss = $sarr(struct_nhcoord, 9);
      info = new Float64Array(9);
      has_edog = (!mtmp.isminion ? 1 : 0) << 24 >> 24;
      omx = mtmp.mx;
      omy = mtmp.my;
      if (has_edog && await dog_hunger(mtmp, edog)) {
        return 2;
      }
      udist = dist2(omx, omy, G.u.ux, G.u.uy);
      if (mtmp === G.u.usteed) {
        if ((G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !await resist(mtmp, RING_CLASS, 0, 0)) {
          await dismount_steed(DISMOUNT_THROWN);
          return 1;
        }
        udist = 1;
      } else if (!udist) {
        return 0;
      }
      nix = omx << 24 >> 24;
      niy = omy << 24 >> 24;
      cursemsg[0] = FALSE;
      info[0] = 0;
      if (has_edog) {
        j = await dog_invent(mtmp, edog, udist);
        if (j === 2) {
          return 2;
        } else if (j === 1) {
          { $g = 1; continue $L; }
        }
        whappr = G.monstermoves - edog.whistletime < 5 ? 1 : 0;
      } else {
        whappr = 0;
      }
      appr = await dog_goal(mtmp, has_edog ? edog : null, after, udist, whappr);
      if (appr === -2) {
        return 0;
      }
      allowflags = ALLOW_M | ALLOW_TRAPS | ALLOW_SSM | ALLOW_SANCT;
      if ((mtmp.data.mflags1 & 8) >>> 0 !== 0) {
        allowflags = allowflags | (ALLOW_ROCK | ALLOW_WALL);
      }
      if (passes_bars(mtmp.data)) {
        allowflags = allowflags | ALLOW_BARS;
      }
      if ((mtmp.data.mflags2 & 134217728) >>> 0 !== 0) {
        allowflags = allowflags | ALLOW_ROCK;
      }
      if ((mtmp.data.mflags3 & 1024) !== 0) {
        allowflags = allowflags | ALLOW_MDISP;
      }
      if ((G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !await resist(mtmp, RING_CLASS, 0, 0)) {
        allowflags = allowflags | ALLOW_U;
        if (!has_edog) {
          await lose_guardian_angel(mtmp);
          return 2;
        }
      }
      if (!((mtmp.data.mflags1 & 8192) >>> 0 !== 0) && !(mtmp.data.msize < 1)) {
        allowflags = allowflags | OPENDOOR;
        if (monhaskey(mtmp, TRUE)) {
          allowflags = allowflags | UNLOCKDOOR;
        }
      }
      if ((mtmp.data.mflags2 & 8192) >>> 0 !== 0) {
        allowflags = allowflags | BUSTDOOR;
      }
      if ((mtmp.data.mflags1 & 32) >>> 0 !== 0 && !((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level))) {
        allowflags = allowflags | ALLOW_DIG;
      }
      cnt = await mfndpos(mtmp, poss[0], P(info), allowflags) << 24 >> 24;
      uncursedcnt = 0;
      for (i = 0; i < cnt; ++i) {
        nx = poss[i].x;
        ny = poss[i].y;
        if (!!G.level.monsters[nx][ny] && !(info[i] & ALLOW_M || info[i] & ALLOW_MDISP)) {
          continue;
        }
        if (cursed_object_at(nx, ny)) {
          continue;
        }
        uncursedcnt = uncursedcnt + 1 << 24 >> 24;
      }
      better_with_displacing = should_displace(mtmp, poss[0], P(info), cnt, gx, gy);
      chcnt = 0;
      chi = -1;
      nidist = dist2(nix, niy, gx, gy);
      i = 0;
    case 4:
      if (!(i < cnt)) { $g = 6; continue $L; }
      nx = poss[i].x;
      ny = poss[i].y;
      cursemsg[i] = FALSE;
      if (mtmp.mleashed | 0 && dist2(nx, ny, G.u.ux, G.u.uy) > 4) {
        { $g = 5; continue $L; };
      }
      if (!has_edog && (j = dist2(nx, ny, G.u.ux, G.u.uy)) > 16 && j >= udist) {
        { $g = 5; continue $L; };
      }
      if (info[i] & ALLOW_M && !!G.level.monsters[nx][ny]) {
        let mstatus = 0;
        let mtmp2 = !!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null;
        if (mtmp2.m_lev >= mtmp.m_lev + 2 || mtmp2.data === $sat(G.mons, PM_FLOATING_EYE) && rn2(10) && mtmp.mcansee | 0 && (mtmp.data.mflags1 & 4096) >>> 0 === 0 && mtmp2.mcansee | 0 && ((mtmp.data.mflags1 & 16777216) >>> 0 !== 0 || !mtmp2.minvis) || mtmp2.data === $sat(G.mons, PM_GELATINOUS_CUBE) && rn2(10) || max_passive_dmg(mtmp2, mtmp) >= mtmp.mhp || (mtmp.mhp * 4 < mtmp.mhpmax || mtmp2.data.msound === MS_GUARDIAN || mtmp2.data.msound === MS_LEADER) && mtmp2.mpeaceful | 0 && !(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) || (mtmp2.data === $sat(G.mons, 10) || mtmp2.data === $sat(G.mons, 9)) && !(((mtmp.data.mresists | mtmp.mextrinsics) & 128) !== 0)) {
          { $g = 5; continue $L; };
        }
        if (after) {
          return 0;
        }
        G.notonhead = 0;
        mstatus = await mattackm(mtmp, mtmp2);
        if (mstatus & MM_AGR_DIED) {
          return 2;
        }
        if (mstatus & MM_HIT && !(mstatus & MM_DEF_DIED) && rn2(4) && mtmp2.mlstmv !== G.monstermoves && !onscary(mtmp.mx, mtmp.my, mtmp2) && monnear(mtmp2, mtmp.mx, mtmp.my)) {
          mstatus = await mattackm(mtmp2, mtmp);
          if (mstatus & MM_DEF_DIED) {
            return 2;
          }
        }
        return 0;
      }
      if (info[i] & ALLOW_MDISP && !!G.level.monsters[nx][ny] && better_with_displacing && !undesirable_disp(mtmp, nx, ny)) {
        let mstatus = 0;
        let mtmp2 = !!G.level.monsters[nx][ny] ? G.level.monsters[nx][ny] : null;
        mstatus = await mdisplacem(mtmp, mtmp2, FALSE);
        if (mstatus & MM_DEF_DIED) {
          return 2;
        }
        return 0;
      }
      {
        let trap = null;
        if (info[i] & ALLOW_TRAPS && (trap = t_at(nx, ny))) {
          if (mtmp.mleashed) {
            if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
              await whimper(mtmp);
            }
          } else {
            if (trap.tseen | 0 && rn2(40)) {
              { $g = 5; continue $L; };
            }
          }
        }
      }
      if (has_edog) {
        for (obj = G.level.objects[nx][ny]; obj; obj = obj.v.v_nexthere) {
          if (obj.cursed) {
            cursemsg[i] = TRUE;
          } else if ((otyp = await dogfood(mtmp, obj) << 24 >> 24) < MANFOOD && (otyp < ACCFOOD || edog.hungrytime <= G.monstermoves)) {
            nix = nx << 24 >> 24;
            niy = ny << 24 >> 24;
            chi = i;
            do_eat = TRUE;
            cursemsg[i] = FALSE;
            { $g = 1; continue $L; }
          }
        }
      }
      if (cursemsg[i] && !mtmp.mleashed && uncursedcnt > 0 && rn2(13 * uncursedcnt)) {
        { $g = 5; continue $L; };
      }
      if (!mtmp.mleashed && distmin(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 5) {
        k = has_edog ? uncursedcnt : cnt;
        for (j = 0; j < MTSZ && j < k - 1; ++j) {
          if (nx === mtmp.mtrack[j].x && ny === mtmp.mtrack[j].y) {
            if (rn2(Math.imul(MTSZ, k - j))) {
              { $g = 2; continue $L; }
            }
          }
        }
      }
      j = Math.imul((ndist = dist2(nx, ny, gx, gy)) - nidist, appr);
      if (j === 0 && !rn2(chcnt = chcnt + 1 << 24 >> 24) || j < 0 || j > 0 && !whappr && (omx === nix && omy === niy && !rn2(3) || !rn2(12))) {
        nix = nx << 24 >> 24;
        niy = ny << 24 >> 24;
        nidist = ndist;
        if (j < 0) {
          chcnt = 0;
        }
        chi = i;
      }
    case 2: // nxti
      ;
    case 5:
      ++i;
      { $g = 4; continue $L; }
    case 6:
      {
        let mtarg = null;
        let hungry = 0;
        if (!mtmp.isminion) {
          let dog = mtmp.mextra.edog;
          hungry = G.monstermoves > dog.hungrytime + 300 ? 1 : 0;
        }
        mtarg = best_target(mtmp);
        if (mtarg && (!hungry || !rn2(5))) {
          let mstatus = 0;
          if (mtarg === G.youmonst) {
            if (await mattacku(mtmp)) {
              return 2;
            }
          } else {
            mstatus = await mattackm(mtmp, mtarg);
            if (mstatus & MM_AGR_DIED) {
              return 2;
            }
            if (mstatus & MM_HIT && !(mstatus & MM_DEF_DIED) && rn2(4) && mtarg !== G.youmonst) {
              if (mtarg.mcansee | 0 && (mtarg.data.mflags1 & 4096) >>> 0 === 0) {
                mstatus = await mattackm(mtarg, mtmp);
                if (mstatus & MM_DEF_DIED) {
                  return 2;
                }
              }
            }
          }
        }
      }
    case 1: // newdogpos
      if (!(nix !== omx || niy !== omy)) { $g = 8; continue $L; }
      {
        let wasseen = 0;
        if (info[chi] & ALLOW_U) {
          if (mtmp.mleashed) {
            await pline(S("%s breaks loose of %s leash!"), await Monnam(mtmp), G.genders[pronoun_gender(mtmp, 0)].his);
            await m_unleash(mtmp, FALSE);
          }
          await mattacku(mtmp);
          return 0;
        }
        if (!await m_in_out_region(mtmp, nix, niy)) {
          return 1;
        }
        if (await m_digweapon_check(mtmp, nix, niy)) {
          return 0;
        }
        wasseen = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? 1 : 0) << 24 >> 24;
        G.level.monsters[omx][omy] = null;
        await place_monster(mtmp, nix, niy);
        if (cursemsg[chi] && (wasseen || (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
          let o = !(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) && G.level.flags.hero_memory | 0 && ($at2(G.level.locations, nix, niy).glyph >= 382 + (382 + (382 + (1 + (382 + (382 + 0))))) && $at2(G.level.locations, nix, niy).glyph < 382 + (382 + (382 + (1 + (382 + (382 + 0))))) + 454 || $at2(G.level.locations, nix, niy).glyph >= 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) && $at2(G.level.locations, nix, niy).glyph < 6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))))))) + 382 || $at2(G.level.locations, nix, niy).glyph >= 382 + (1 + (382 + (382 + 0))) && $at2(G.level.locations, nix, niy).glyph < 382 + (1 + (382 + (382 + 0))) + 382) ? G.level.objects[nix][niy] : null;
          let what = o ? await distant_name(o, doname) : G.c_common_strings.c_something;
          await pline(S("%s %s reluctantly over %s."), await noit_Monnam(mtmp), vtense(null, locomotion(mtmp.data, S("step"))), what);
        }
        for (j = MTSZ - 1; j > 0; --j) {
          mtmp.mtrack[j].$cp(mtmp.mtrack[j - 1]);
        }
        mtmp.mtrack[0].x = omx << 24 >> 24;
        mtmp.mtrack[0].y = omy << 24 >> 24;
        if (do_eat) {
          if (await dog_eat(mtmp, obj, omx, omy, FALSE) === 2) {
            return 2;
          }
        }
      }
      { $g = 7; continue $L; }
    case 8:
      if (!(mtmp.mleashed | 0 && dist2(omx, omy, G.u.ux, G.u.uy) > 4)) { $g = 9; continue $L; }
      cc = new struct_nhcoord();
      nx = sgn(omx - G.u.ux);
      ny = sgn(omy - G.u.uy);
      cc.x = G.u.ux + nx << 24 >> 24;
      cc.y = G.u.uy + ny << 24 >> 24;
      if (goodpos(cc.x, cc.y, mtmp, 0)) {
        { $g = 3; continue $L; }
      }
      i = xytod(nx, ny);
      for (j = (i + 7) % 8; j < (i + 1) % 8; ++j) {
        dtoxy(cc, j);
        if (goodpos(cc.x, cc.y, mtmp, 0)) {
          { $g = 3; continue $L; }
        }
      }
      for (j = (i + 6) % 8; j < (i + 2) % 8; ++j) {
        dtoxy(cc, j);
        if (goodpos(cc.x, cc.y, mtmp, 0)) {
          { $g = 3; continue $L; }
        }
      }
      cc.x = mtmp.mx;
      cc.y = mtmp.my;
    case 3: // dognext
      if (!await m_in_out_region(mtmp, nix, niy)) {
        return 1;
      }
      G.level.monsters[mtmp.mx][mtmp.my] = null;
      await place_monster(mtmp, cc.x, cc.y);
      await newsym(cc.x, cc.y);
      set_apparxy(mtmp);
    case 9:
    case 7:
      return 1;
    }
    break;
  }
}

function could_reach_item(mon: struct_monst | null, nx: number, ny: number): number {
  if ((!is_pool(nx, ny) || (mon.data.mflags1 & 2) >>> 0 !== 0) && (!is_lava(nx, ny) || (mon.data === $sat(G.mons, 152) || mon.data === $sat(G.mons, 326))) && (!sobj_at(BOULDER, nx, ny) || (mon.data.mflags2 & 134217728) >>> 0 !== 0)) {
    return TRUE;
  }
  return FALSE;
}

function can_reach_location(mon: struct_monst | null, mx: number, my: number, fx: number, fy: number): number {
  let i = 0;
  let j = 0;
  let dist = 0;
  if (mx === fx && my === fy) {
    return TRUE;
  }
  if (!isok(mx, my)) {
    return FALSE;
  }
  dist = dist2(mx, my, fx, fy);
  for (i = mx - 1; i <= mx + 1; ++i) {
    for (j = my - 1; j <= my + 1; ++j) {
      if (!isok(i, j)) {
        continue;
      }
      if (dist2(i, j, fx, fy) >= dist) {
        continue;
      }
      if ($at2(G.level.locations, i, j).typ < POOL && !((mon.data.mflags1 & 8) >>> 0 !== 0) && (!may_dig(i, j) || !((mon.data.mflags1 & 32) >>> 0 !== 0))) {
        continue;
      }
      if ($at2(G.level.locations, i, j).typ === DOOR && ($at2(G.level.locations, i, j).flags | 0) & (D_CLOSED | D_LOCKED)) {
        continue;
      }
      if (!could_reach_item(mon, i, j)) {
        continue;
      }
      if (can_reach_location(mon, i, j, fx, fy)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

function wantdoor(x: number, y: number, distance: any): void {
  let ndist = 0;
  let dist_ptr = distance;
  if (dist_ptr.a[dist_ptr.o] > (ndist = dist2(x, y, G.u.ux, G.u.uy))) {
    gx = x << 24 >> 24;
    gy = y << 24 >> 24;
    dist_ptr.a[dist_ptr.o] = ndist;
  }
}

export async function finish_meating(mtmp: struct_monst | null): Promise<void> {
  mtmp.meating = 0;
  if (mtmp.m_ap_type & 7 && mtmp.mappearance && mtmp.cham === NON_PM) {
    mtmp.m_ap_type = 0;
    mtmp.mappearance = 0;
    await newsym(mtmp.mx, mtmp.my);
  }
}

async function quickmimic(mtmp: struct_monst | null): Promise<void> {
  let idx = 0;
  let trycnt = 5;
  let spotted = 0;
  let buf = new Int8Array(256);
  if (G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic || !mtmp.meating) {
    return;
  }
  if (mtmp === G.u.usteed) {
    await dismount_steed(DISMOUNT_POLY);
  }
  do {
    idx = rn2(Math.trunc(144 / 16) | 0);
    if (qm[idx].mndx !== 0 && await monsndx(mtmp.data) === qm[idx].mndx) {
      break;
    }
    if (qm[idx].mlet !== 0 && mtmp.data.mlet === qm[idx].mlet) {
      break;
    }
    if (qm[idx].mndx === 0 && qm[idx].mlet === 0) {
      break;
    }
  } while (--trycnt > 0);
  if (trycnt === 0) {
    idx = (Math.trunc(144 / 16) | 0) - 1;
  }
  strcpy(P(buf), await mon_nam(mtmp));
  spotted = (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0;
  mtmp.m_ap_type = qm[idx].m_ap_type;
  mtmp.mappearance = qm[idx].mappearance;
  if (spotted || $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
    await newsym(mtmp.mx, mtmp.my);
    await You(S("%s %s %sappear%s where %s was!"), $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 ? S("see") : S("sense that"), (mtmp.m_ap_type & 7) === M_AP_FURNITURE ? await an(G.defsyms[mtmp.mappearance].explanation) : (mtmp.m_ap_type & 7) === M_AP_OBJECT && G.obj_descr[G.objects[mtmp.mappearance].oc_descr_idx].oc_descr ? await an(G.obj_descr[G.objects[mtmp.mappearance].oc_descr_idx].oc_descr) : (mtmp.m_ap_type & 7) === M_AP_OBJECT && G.obj_descr[G.objects[mtmp.mappearance].oc_name_idx].oc_name ? await an(G.obj_descr[G.objects[mtmp.mappearance].oc_name_idx].oc_name) : (mtmp.m_ap_type & 7) === M_AP_MONSTER ? await an(G.mons[mtmp.mappearance].mname) : G.c_common_strings.c_something, $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 ? S("") : S("has "), $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 ? S("") : S("ed"), P(buf));
    await G.windowprocs.win_display_nhwindow(G.WIN_MAP, TRUE);
  }
}

export function $init(): void {
  nofetch = $ta(Int8Array, 4, [BALL_CLASS, CHAIN_CLASS, ROCK_CLASS]);
  gtyp = 0;
  gx = 0;
  gy = 0;
  qm = $sarrOf([struct_qmchoices.$of(PM_LITTLE_DOG, 0, PM_KITTEN, M_AP_MONSTER),
struct_qmchoices.$of(PM_DOG, 0, PM_HOUSECAT, M_AP_MONSTER),
struct_qmchoices.$of(PM_LARGE_DOG, 0, PM_LARGE_CAT, M_AP_MONSTER),
struct_qmchoices.$of(PM_KITTEN, 0, PM_LITTLE_DOG, M_AP_MONSTER),
struct_qmchoices.$of(PM_HOUSECAT, 0, PM_DOG, M_AP_MONSTER),
struct_qmchoices.$of(PM_LARGE_CAT, 0, PM_LARGE_DOG, M_AP_MONSTER),
struct_qmchoices.$of(PM_HOUSECAT, 0, PM_GIANT_RAT, M_AP_MONSTER),
struct_qmchoices.$of(0, S_DOG, SINK, M_AP_FURNITURE),
struct_qmchoices.$of(0, 0, TRIPE_RATION, M_AP_OBJECT)]);
}
