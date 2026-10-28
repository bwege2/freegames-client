// @ts-nocheck
// NetHack 3.6.7 mkobj.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr, fmt_ptr } from './alloc.ts';
import { confers_luck, mk_artifact } from './artifact.ts';
import { set_moreluck } from './attrib.ts';
import { isok } from './cmd.ts';
import { is_ice } from './dbridge.ts';
import { newsym } from './display.ts';
import { doaltarobj, dropy, obj_no_longer_held } from './do.ts';
import { noveltitle, oname, x_monnam } from './do_name.ts';
import { reset_remarm } from './do_wear.ts';
import { hitfloor } from './dothrow.ts';
import { In_hell, In_quest, depth, level_difficulty, on_level } from './dungeon.ts';
import { eaten_stat, set_tin_variety } from './eat.ts';
import { panic } from './end.ts';
import { can_reach_floor, surface } from './engrave.ts';
import { debugcore } from './files.ts';
import { in_rooms, obj_to_any } from './hack.ts';
import { copynchars, eos, s_suffix, strstri, strsubst } from './hacklib.ts';
import { consume_obj_charge, freeinv, g_at, hold_another_object, mergable, merged, nxtobj, sobj_at, update_inventory } from './invent.ts';
import { arti_light_radius, del_light_source, obj_adjust_light_radius, obj_sheds_light, obj_split_light_source } from './light.ts';
import { maybe_reset_pick } from './lock.ts';
import { rndmonst } from './makemon.ts';
import { can_be_hatched, copy_mextra, dead_species, dealloc_mextra, undead_to_corpse } from './mon.ts';
import { monsndx } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { Doname2, The, Yname2, aobjnam, doname, makeplural, makesingular, obj_typename, otense, rnd_class, safe_typename, simpleonames, vtense, xname } from './objnam.ts';
import { You_hear, You_see, Your, impossible, pline, verbalize } from './pline.ts';
import { forget_temple_entry } from './priest.ts';
import { rn2, rnd, rne, rnz } from './rnd.ts';
import { addtobill, alter_cost, billable, costly_spot, globby_bill_fixup, obfree, oid_price_adjustment, shop_keeper, splitbill, stolen_value, subfrombill, unpaid_cost } from './shk.ts';
import { book_cursed } from './spell.ts';
import { rloco } from './teleport.ts';
import { attach_egg_hatch_timeout, attach_fig_transform_timeout, obj_split_timers, obj_stop_timers, start_timer, stop_timer } from './timeout.ts';
import { tt_oname } from './topten.ts';
import { block_point, unblock_point } from './vision.ts';
import { mwepgone } from './weapon.ts';
import { drop_uswapwep } from './wield.ts';
import { update_mon_intrinsics } from './worn.ts';
import { get_obj_location } from './zap.ts';
import { struct_icp, struct_monst, struct_obj, struct_oextra, struct_permonst } from './structs.ts';
import { $at2, $cs, $rd, $sadd, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, free, memcpy, memset, sprintf, strcat, strchr, strcpy, strlen } from './rt/index.ts';
import { ALTAR, AMULET_CLASS, AMULET_OF_CHANGE, AMULET_OF_RESTFUL_SLEEP, AMULET_OF_STRANGULATION, AMULET_OF_YENDOR, APPLE, ARMOR_CLASS, ARTICLE_A, A_NONE, BAG_OF_HOLDING, BALL_CLASS, BANANA, BLINDED, BLINDFOLD, BOULDER, CANDELABRUM_OF_INVOCATION, CHAIN_CLASS, COIN_CLASS, COLNO, CONTAINED_TOO, CORPSE, CORPSTAT_INIT, CORPSTAT_NONE, COST_UNBLSS, COST_UNCURS, DILITHIUM_CRYSTAL, EGG, ELVEN_SHIELD, EUCALYPTUS_LEAF, EXACT_NAME, FALSE, FIGURINE, FIG_TRANSFORM, FIRE_RES, FOOD_CLASS, FOOD_RATION, FUMBLE_BOOTS, GAUNTLETS_OF_FUMBLING, GEM_CLASS, GLOB_OF_GRAY_OOZE, GOLD_PIECE, G_GONE, G_HELL, G_NOCORPSE, G_NOGEN, G_NOHELL, G_UNIQ, HALLUC, HALLUC_RES, HATCH_EGG, HEAVY_IRON_BALL, HELM_OF_OPPOSITE_ALIGNMENT, HIGHEST_GLOB, HORN_OF_PLENTY, ICE, ICE_BOX, IRONBARS, I_SPECIAL, KELP_FROND, LARGEST_INT, LENSES, LEVITATION_BOOTS, LIQUID, LOADSTONE, LOWEST_GLOB, LOW_PM, LS_OBJECT, LUCKSTONE, LUMP_OF_ROYAL_JELLY, MAX_OIL_IN_FLASK, MEAT_RING, MIGR_TO_SPECIES, NOBJ_STATES, NON_PM, OBJ_BURIED, OBJ_CONTAINED, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, OBJ_MIGRATING, OBJ_MINVENT, OBJ_ONBILL, ORANGE, ORCISH_SHIELD, PEAR, PLASTIC, PLNMSG_OBJ_GLOWS, PM_GRAY_OOZE, PM_HUMAN, PM_LICHEN, PM_LIZARD, POTION_CLASS, POT_BOOZE, POT_OIL, POT_SICKNESS, POT_WATER, P_BOW, P_SHURIKEN, RANDOM_CLASS, RANDOM_TIN, REVIVE_MON, RING_CLASS, RIN_AGGRAVATE_MONSTER, RIN_HUNGER, RIN_POLYMORPH, RIN_TELEPORTATION, ROCK, ROCK_CLASS, ROT_AGE, ROT_CORPSE, ROT_ICE_ADJUSTMENT, ROWNO, SACK, SADDLE, SCROLL_CLASS, SCR_MAIL, SHIELD_OF_REFLECTION, SHOPBASE, SLIME_MOLD, SPBOOK_CLASS, SPINACH_TIN, SPLINT_MAIL, STATUE, S_TROLL, TAINT_AGE, TALLOW_CANDLE, TIMER_OBJECT, TOOL_CLASS, TOWEL, TROLL_REVIVE_CHANCE, TRUE, VENOM_CLASS, WAND_CLASS, WAN_CANCELLATION, WAN_FIRE, WAN_LIGHT, WAN_LIGHTNING, WAN_WISHING, WEAPON_CLASS, WOOD, W_AMUL, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMOR, W_ARMS, W_ARMU, W_BALL, W_CHAIN, W_QUIVER, W_RING, W_RINGL, W_RINGR, W_SADDLE, W_SWAPWEP, W_TOOL, W_WEAPONS, W_WEP } from './consts.ts';

let mkobjprobs: any;
let boxiprobs: any;
let rogueprobs: any;
let hellprobs: any;
let alteration_verbs: any;
let dknowns: any;
let treefruits: any;
let ofmt0: any;
let ofmt3: any;
let mfmt1: any;
let mfmt2: any;
let obj_state_names: any;
let where_name$unknown: any;
let sanity_check_worn$wearbits: any;

export async function newoextra(): Promise<struct_oextra | null> {
  let oextra = null;
  oextra = new struct_oextra();
  oextra.oname = null;
  oextra.omonst = null;
  oextra.omid = null;
  oextra.olong = null;
  oextra.omailcmd = null;
  return oextra;
}

export function dealloc_oextra(o: struct_obj | null): void {
  let x = o.oextra;
  if (x) {
    if (x.oname) {
      free(x.oname);
    }
    if (x.omonst) {
      free_omonst(o);
    }
    if (x.omid) {
      free(x.omid);
    }
    if (x.olong) {
      free(x.olong);
    }
    if (x.omailcmd) {
      free(x.omailcmd);
    }
    free(x);
    o.oextra = null;
  }
}

export async function newomonst(otmp: struct_obj | null): Promise<void> {
  if (!otmp.oextra) {
    otmp.oextra = await newoextra();
  }
  if (!otmp.oextra.omonst) {
    let m = new struct_monst();
    m.$cp(G.zeromonst);
    otmp.oextra.omonst = m;
  }
}

export function free_omonst(otmp: struct_obj | null): void {
  if (otmp.oextra) {
    let m = otmp.oextra.omonst;
    if (m) {
      if (m.mextra) {
        dealloc_mextra(m);
      }
      free(m);
      otmp.oextra.omonst = null;
    }
  }
}

export async function newomid(otmp: struct_obj | null): Promise<void> {
  if (!otmp.oextra) {
    otmp.oextra = await newoextra();
  }
  if (!otmp.oextra.omid) {
    otmp.oextra.omid = P(new Uint32Array(4 / 4));
    memset(otmp.oextra.omid, 0, 4);
  }
}

export function free_omid(otmp: struct_obj | null): void {
  if (otmp.oextra && otmp.oextra.omid) {
    free(otmp.oextra.omid);
    otmp.oextra.omid = null;
  }
}

export async function newolong(otmp: struct_obj | null): Promise<void> {
  if (!otmp.oextra) {
    otmp.oextra = await newoextra();
  }
  if (!otmp.oextra.olong) {
    otmp.oextra.olong = P(new Int8Array(8));
    memset(otmp.oextra.olong, 0, 8);
  }
}

export function free_olong(otmp: struct_obj | null): void {
  if (otmp.oextra && otmp.oextra.olong) {
    free(otmp.oextra.olong);
    otmp.oextra.olong = null;
  }
}

export async function new_omailcmd(otmp: struct_obj | null, response_cmd: Ptr | null): Promise<void> {
  if (!otmp.oextra) {
    otmp.oextra = await newoextra();
  }
  if (otmp.oextra.omailcmd) {
    free_omailcmd(otmp);
  }
  otmp.oextra.omailcmd = await dupstr(response_cmd);
}

export function free_omailcmd(otmp: struct_obj | null): void {
  if (otmp.oextra && otmp.oextra.omailcmd) {
    free(otmp.oextra.omailcmd);
    otmp.oextra.omailcmd = null;
  }
}

export async function mkobj_at(let_: number, x: number, y: number, artif: number): Promise<struct_obj | null> {
  let otmp = null;
  otmp = await mkobj(let_, artif);
  await place_object(otmp, x, y);
  return otmp;
}

export async function mksobj_at(otyp: number, x: number, y: number, init: number, artif: number): Promise<struct_obj | null> {
  let otmp = null;
  otmp = await mksobj(otyp, init, artif);
  await place_object(otmp, x, y);
  return otmp;
}

export async function mksobj_migr_to_species(otyp: number, mflags2: number, init: number, artif: number): Promise<struct_obj | null> {
  let otmp = null;
  otmp = await mksobj(otyp, init, artif);
  await add_to_migration(otmp);
  otmp.owornmask = MIGR_TO_SPECIES;
  otmp.corpsenm = mflags2 | 0;
  return otmp;
}

export async function mkobj(oclass: number, artif: number): Promise<struct_obj | null> {
  let tprob = 0;
  let i = 0;
  let prob = rnd(1000);
  if (oclass === RANDOM_CLASS) {
    let iprobs = (G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level) ? rogueprobs[0] : In_hell(G.u.uz) ? hellprobs[0] : mkobjprobs[0];
    for (tprob = rnd(100); (tprob -= iprobs.iprob) > 0; iprobs = $sadd(iprobs, 1)) {
      ;
    }
    oclass = iprobs.iclass;
  }
  i = G.bases[oclass];
  while ((prob -= G.objects[i].oc_prob) > 0) {
    ++i;
  }
  if (G.objects[i].oc_class !== oclass || !G.obj_descr[G.objects[i].oc_name_idx].oc_name) {
    await panic(S("probtype error, oclass=%d i=%d"), oclass, i);
  }
  return await mksobj(i, TRUE, artif);
}

async function mkbox_cnts(box: struct_obj | null): Promise<void> {
  let n = 0;
  let otmp = null;
  box.cobj = null;
  switch (box.otyp) {
  case 191:
    n = 20;
    break;
  case 190:
    n = box.olocked | 0 ? 7 : 5;
    break;
  case 189:
    n = box.olocked | 0 ? 5 : 3;
    break;
  case 192:
  case 193:
    if (G.moves <= 1 && !G.in_mklev) {
      n = 0;
      break;
    }
  case 194:
    n = 1;
    break;
  default:
    n = 0;
    break;
  }
  for (n = rn2(n + 1); n > 0; --n) {
    if (box.otyp === ICE_BOX) {
      otmp = await mksobj(CORPSE, TRUE, TRUE);
      otmp.age = 0;
      if (otmp.timed) {
        await stop_timer(ROT_CORPSE, obj_to_any(otmp));
        await stop_timer(REVIVE_MON, obj_to_any(otmp));
      }
    } else {
      let tprob = 0;
      let iprobs = boxiprobs[0];
      for (tprob = rnd(100); (tprob -= iprobs.iprob) > 0; iprobs = $sadd(iprobs, 1)) {
        ;
      }
      if (!(otmp = await mkobj(iprobs.iclass, TRUE))) {
        continue;
      }
      if (otmp.oclass === COIN_CLASS) {
        otmp.quan = Math.imul(rnd(level_difficulty() + 2), rnd(75));
        otmp.owt = await weight(otmp) >>> 0;
      } else {
        while (otmp.otyp === ROCK) {
          otmp.otyp = rnd_class(DILITHIUM_CRYSTAL, LOADSTONE) << 16 >> 16;
          if (otmp.quan > 2) {
            otmp.quan = 1;
          }
          otmp.owt = await weight(otmp) >>> 0;
        }
      }
      if (box.otyp === BAG_OF_HOLDING) {
        if (otmp.otyp === 194 || otmp.otyp === 195) {
          otmp.otyp = SACK;
          otmp.spe = 0;
          otmp.owt = await weight(otmp) >>> 0;
        } else {
          while (otmp.otyp === WAN_CANCELLATION) {
            otmp.otyp = rnd_class(WAN_LIGHT, WAN_LIGHTNING) << 16 >> 16;
          }
        }
      }
    }
    await add_to_container(box, otmp);
  }
}

export async function rndmonnum(): Promise<number> {
  let ptr = null;
  let i = 0;
  let excludeflags = 0;
  ptr = await rndmonst();
  if (ptr) {
    return await monsndx(ptr);
  }
  excludeflags = (G_UNIQ | G_NOGEN | (In_hell(G.u.uz) ? G_NOHELL : G_HELL)) & 0xffff;
  do {
    i = rn2(327 - (-1 + 1)) + (-1 + 1);
    ptr = $sat(G.mons, i);
  } while ((ptr.geno & excludeflags) !== 0);
  return i;
}

export async function copy_oextra(obj2: struct_obj | null, obj1: struct_obj | null): Promise<void> {
  if (!obj2 || !obj1 || !obj1.oextra) {
    return;
  }
  if (!obj2.oextra) {
    obj2.oextra = await newoextra();
  }
  if (obj1.oextra && obj1.oextra.oname) {
    await oname(obj2, obj1.oextra.oname);
  }
  if (obj1.oextra && obj1.oextra.omonst) {
    if (!obj2.oextra.omonst) {
      await newomonst(obj2);
    }
    memcpy(obj2.oextra.omonst, obj1.oextra.omonst, 144);
    obj2.oextra.omonst.mextra = null;
    obj2.oextra.omonst.nmon = null;
    if (obj1.oextra.omonst.mextra) {
      await copy_mextra(obj2.oextra.omonst, obj1.oextra.omonst);
    }
  }
  if (obj1.oextra && obj1.oextra.omid) {
    if (!obj2.oextra.omid) {
      await newomid(obj2);
    }
    memcpy(obj2.oextra.omid, obj1.oextra.omid, 4);
  }
  if (obj1.oextra && obj1.oextra.olong) {
    if (!obj2.oextra.olong) {
      await newolong(obj2);
    }
    memcpy(obj2.oextra.olong, obj1.oextra.olong, 8);
  }
  if (obj1.oextra && obj1.oextra.omailcmd) {
    await new_omailcmd(obj2, obj1.oextra.omailcmd);
  }
}

export async function splitobj(obj: struct_obj | null, num: number): Promise<struct_obj | null> {
  let otmp = null;
  if (obj.cobj || num <= 0 || obj.quan <= num) {
    await panic(S("splitobj"));
  }
  otmp = new struct_obj();
  otmp.$cp(obj);
  otmp.oextra = null;
  otmp.o_id = nextoid(obj, otmp);
  otmp.timed = 0;
  otmp.lamplit = 0;
  otmp.owornmask = 0;
  obj.quan -= num;
  obj.owt = await weight(obj) >>> 0;
  otmp.quan = num;
  otmp.owt = await weight(otmp) >>> 0;
  G.context.objsplit.parent_oid = obj.o_id;
  G.context.objsplit.child_oid = otmp.o_id;
  obj.nobj = otmp;
  if (obj.where === OBJ_FLOOR) {
    obj.v.v_nexthere = otmp;
  }
  await copy_oextra(otmp, obj);
  if (otmp.oextra && otmp.oextra.omid) {
    free_omid(otmp);
  }
  if (obj.unpaid) {
    await splitbill(obj, otmp);
  }
  if (obj.timed) {
    await obj_split_timers(obj, otmp);
  }
  if (obj_sheds_light(obj)) {
    await obj_split_light_source(obj, otmp);
  }
  return otmp;
}

function nextoid(oldobj: struct_obj | null, newobj: struct_obj | null): number {
  let olddif = 0;
  let newdif = 0;
  let trylimit = 256;
  let oid = G.context.ident - 1 >>> 0;
  olddif = oid_price_adjustment(oldobj, oldobj.o_id);
  do {
    oid = oid + 1 >>> 0;
    if (!oid) {
      oid = oid + 1 >>> 0;
    }
    newdif = oid_price_adjustment(newobj, oid);
  } while (newdif !== olddif && --trylimit >= 0);
  G.context.ident = oid + 1 >>> 0;
  return oid;
}

export async function unsplitobj(obj: struct_obj | null): Promise<struct_obj | null> {
  let target_oid = 0;
  const oparent = [null];
  oparent[0] = null;
  const ochild = [null];
  ochild[0] = null;
  let list = null;
  switch (obj.where) {
  case 0:
  case 1:
  case 7:
  case 5:
  case 6:
  default:
    return null;
  case 3:
    list = G.invent;
    break;
  case 4:
    list = obj.v.v_ocarry.minvent;
    break;
  case 2:
    list = obj.v.v_ocontainer.cobj;
    break;
  }
  if (obj.o_id === G.context.objsplit.child_oid) {
    ochild[0] = obj;
    target_oid = G.context.objsplit.parent_oid;
    if (obj.nobj && obj.nobj.o_id === target_oid) {
      oparent[0] = obj.nobj;
    }
  } else if (obj.o_id === G.context.objsplit.parent_oid) {
    oparent[0] = obj;
    target_oid = G.context.objsplit.child_oid;
    if (obj.nobj && obj.nobj.o_id === target_oid) {
      ochild[0] = obj.nobj;
    }
  }
  if (ochild[0] && !oparent[0]) {
    for (obj = list; obj; obj = obj.nobj) {
      if (obj.o_id === target_oid) {
        oparent[0] = obj;
        break;
      }
    }
  } else if (oparent[0] && !ochild[0]) {
    for (obj = list; obj; obj = obj.nobj) {
      if (obj.o_id === target_oid) {
        ochild[0] = obj;
        break;
      }
    }
  }
  return oparent[0] && ochild[0] && await merged(P(oparent, 0), P(ochild, 0)) ? oparent[0] : null;
}

export function clear_splitobjs(): void {
  G.context.objsplit.parent_oid = G.context.objsplit.child_oid = 0;
}

export async function replace_object(obj: struct_obj | null, otmp: struct_obj | null): Promise<void> {
  otmp.where = obj.where;
  switch (obj.where) {
  case 0:
    break;
  case 3:
    otmp.nobj = obj.nobj;
    obj.nobj = otmp;
    await extract_nobj(obj, P(G, "invent"));
    break;
  case 2:
    otmp.nobj = obj.nobj;
    otmp.v.v_ocontainer = obj.v.v_ocontainer;
    obj.nobj = otmp;
    await extract_nobj(obj, P(obj.v.v_ocontainer, "cobj"));
    break;
  case 4:
    otmp.nobj = obj.nobj;
    otmp.v.v_ocarry = obj.v.v_ocarry;
    obj.nobj = otmp;
    await extract_nobj(obj, P(obj.v.v_ocarry, "minvent"));
    break;
  case 1:
    otmp.nobj = obj.nobj;
    otmp.v.v_nexthere = obj.v.v_nexthere;
    otmp.ox = obj.ox;
    otmp.oy = obj.oy;
    obj.nobj = otmp;
    obj.v.v_nexthere = otmp;
    await extract_nobj(obj, P(G.level, "objlist"));
    await extract_nexthere(obj, P(G.level.objects[obj.ox], obj.oy));
    break;
  default:
    await panic(S("replace_object: obj position"));
    break;
  }
}

export function unknwn_contnr_contents(obj: struct_obj | null): struct_obj | null {
  let result = null;
  let parent = null;
  while (obj.where === OBJ_CONTAINED) {
    parent = obj.v.v_ocontainer;
    if (!parent.cknown) {
      result = parent;
    }
    obj = parent;
  }
  return result;
}

export async function bill_dummy_object(otmp: struct_obj | null): Promise<void> {
  let $t1: any, $t2: any;
  let dummy = null;
  let cost = 0;
  if (otmp.unpaid) {
    cost = await unpaid_cost(otmp, FALSE);
    await subfrombill(otmp, await shop_keeper($rd(P(G.u.ushops))));
  }
  dummy = new struct_obj();
  dummy.$cp(otmp);
  dummy.oextra = null;
  dummy.where = OBJ_FREE;
  dummy.o_id = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
  if (!dummy.o_id) {
    dummy.o_id = ($t2 = G.context.ident, G.context.ident = $t2 + 1 >>> 0, $t2);
  }
  dummy.timed = 0;
  await copy_oextra(dummy, otmp);
  if (dummy.oextra && dummy.oextra.omid) {
    free_omid(dummy);
  }
  if (dummy.otyp === 199 || dummy.otyp === 200) {
    dummy.lamplit = 0;
  }
  dummy.owornmask = 0;
  await addtobill(dummy, FALSE, TRUE, TRUE);
  if (cost) {
    await alter_cost(dummy, -cost);
  }
  otmp.no_charge = ((otmp.where === OBJ_FLOOR || otmp.where === OBJ_CONTAINED ? 1 : 0) >>> 0) & 1;
  otmp.unpaid = 0;
  return;
}

export async function costly_alteration(obj: struct_obj | null, alter_type: number): Promise<void> {
  const ox = new Int8Array(1);
  const oy = new Int8Array(1);
  let objroom = 0;
  let learn_bknown = 0;
  let those = null;
  let them = null;
  const shkp = [null];
  shkp[0] = null;
  if (alter_type < 0 || alter_type >= (Math.trunc(152 / 8) | 0)) {
    await impossible(S("invalid alteration type (%d)"), alter_type);
    alter_type = 0;
  }
  ox[0] = oy[0] = 0;
  objroom = 0;
  if (obj.where === 3 || obj.where === OBJ_FREE) {
    if (!obj.unpaid) {
      return;
    }
  } else {
    if (!get_obj_location(obj, P(ox, 0), P(oy, 0), CONTAINED_TOO)) {
      ox[0] = G.u.ux, oy[0] = G.u.uy;
    }
    if (!await costly_spot(ox[0], oy[0])) {
      return;
    }
    objroom = $rd(in_rooms(ox[0], oy[0], SHOPBASE));
    if (!await billable(P(shkp, 0), obj, objroom, FALSE)) {
      return;
    }
  }
  if (obj.quan === 1) {
    those = S("that"), them = S("it");
  } else {
    those = S("those"), them = S("them");
  }
  learn_bknown = (alter_type === COST_UNCURS || alter_type === COST_UNBLSS ? 1 : 0) << 24 >> 24;
  switch (obj.where) {
  case 0:
  case 3:
    if (learn_bknown) {
      set_bknown(obj, 1);
    }
    await verbalize(S("You %s %s %s, you pay for %s!"), alteration_verbs[alter_type], those, await simpleonames(obj), them);
    await bill_dummy_object(obj);
    break;
  case 1:
    if (learn_bknown) {
      obj.bknown = 1;
    }
    if (await costly_spot(G.u.ux, G.u.uy) && objroom === $rd(P(G.u.ushops))) {
      await verbalize(S("You %s %s, you pay for %s!"), alteration_verbs[alter_type], those, them);
      await bill_dummy_object(obj);
    } else {
      await stolen_value(obj, ox[0], oy[0], FALSE, FALSE);
    }
    break;
  }
}

export async function mksobj(otyp: number, init: number, artif: number): Promise<struct_obj | null> {
  let $t1: any, $t2: any;
  let mndx = 0;
  let tryct = 0;
  let otmp = null;
  let let_ = G.objects[otyp].oc_class;
  otmp = new struct_obj();
  otmp.$cp(G.zeroobj);
  otmp.age = G.monstermoves;
  otmp.o_id = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
  if (!otmp.o_id) {
    otmp.o_id = ($t2 = G.context.ident, G.context.ident = $t2 + 1 >>> 0, $t2);
  }
  otmp.quan = 1;
  otmp.oclass = let_;
  otmp.otyp = otyp << 16 >> 16;
  otmp.where = OBJ_FREE;
  otmp.dknown = ((strchr(P(dknowns), let_) ? 0 : 1) >>> 0) & 1;
  if (otmp.otyp >= ELVEN_SHIELD && otmp.otyp <= ORCISH_SHIELD || otmp.otyp === SHIELD_OF_REFLECTION || G.objects[otmp.otyp].oc_merge | 0) {
    otmp.dknown = 0;
  }
  if (!G.objects[otmp.otyp].oc_uses_known) {
    otmp.known = 1;
  }
  otmp.lknown = 0;
  otmp.cknown = 0;
  otmp.corpsenm = NON_PM;
  if (init) {
    switch (let_) {
    case WEAPON_CLASS:
      otmp.quan = otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[otmp.otyp].oc_subtyp <= -P_BOW ? rn2(6) + 6 : 1;
      if (!rn2(11)) {
        otmp.spe = rne(3) << 24 >> 24;
        otmp.blessed = (rn2(2) >>> 0) & 1;
      } else if (!rn2(10)) {
        await curse(otmp);
        otmp.spe = -rne(3) << 24 >> 24;
      } else {
        await blessorcurse(otmp, 10);
      }
      if (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && !rn2(100)) {
        otmp.otrapped = 1;
      }
      if (artif && !rn2(20)) {
        otmp = await mk_artifact(otmp, A_NONE);
      }
      break;
    case FOOD_CLASS:
      otmp.oeaten = 0;
      switch (otmp.otyp) {
      case 240:
        tryct = 50;
        do {
          otmp.corpsenm = undead_to_corpse(await rndmonnum());
        } while (G.mvitals[otmp.corpsenm].mvflags & G_NOCORPSE && --tryct > 0);
        if (tryct === 0) {
          otmp.corpsenm = PM_HUMAN;
        }
        break;
      case 241:
        otmp.corpsenm = NON_PM;
        if (!rn2(3)) {
          for (tryct = 200; tryct > 0; --tryct) {
            mndx = can_be_hatched(await rndmonnum());
            if (mndx !== NON_PM && !dead_species(mndx, TRUE)) {
              otmp.corpsenm = mndx;
              break;
            }
          }
        }
        break;
      case 271:
        otmp.corpsenm = NON_PM;
        if (!rn2(6)) {
          set_tin_variety(otmp, SPINACH_TIN);
        } else {
          for (tryct = 200; tryct > 0; --tryct) {
            mndx = undead_to_corpse(await rndmonnum());
            if (G.mons[mndx].cnutrit && !(G.mvitals[mndx].mvflags & G_NOCORPSE)) {
              otmp.corpsenm = mndx;
              set_tin_variety(otmp, RANDOM_TIN);
              break;
            }
          }
        }
        await blessorcurse(otmp, 10);
        break;
      case 260:
        otmp.spe = G.context.current_fruit << 24 >> 24;
        G.flags.made_fruit = TRUE;
        break;
      case 250:
        otmp.quan = rnd(2);
        break;
      }
      if (otmp.otyp === 246 || otmp.otyp === 247 || otmp.otyp === 248 || otmp.otyp === 249) {
        otmp.quan = 1;
        otmp.globby = 1;
        otmp.known = (otmp.dknown = 1) & 1;
        otmp.corpsenm = PM_GRAY_OOZE + (otmp.otyp - GLOB_OF_GRAY_OOZE);
      } else {
        if (otmp.otyp !== CORPSE && otmp.otyp !== MEAT_RING && otmp.otyp !== KELP_FROND && !rn2(6)) {
          otmp.quan = 2;
        }
      }
      break;
    case GEM_CLASS:
      otmp.corpsenm = 0;
      if (otmp.otyp === LOADSTONE) {
        await curse(otmp);
      } else if (otmp.otyp === ROCK) {
        otmp.quan = rn2(6) + 6;
      } else if (otmp.otyp !== LUCKSTONE && !rn2(6)) {
        otmp.quan = 2;
      } else {
        otmp.quan = 1;
      }
      break;
    case TOOL_CLASS:
      switch (otmp.otyp) {
      case 199:
      case 200:
        otmp.spe = 1;
        otmp.age = 20 * G.objects[otmp.otyp].oc_cost;
        otmp.lamplit = 0;
        otmp.quan = 1 + (rn2(2) ? rn2(7) : 0);
        await blessorcurse(otmp, 5);
        break;
      case 201:
      case 202:
        otmp.spe = 1;
        otmp.age = rn2(500) + 1000;
        otmp.lamplit = 0;
        await blessorcurse(otmp, 5);
        break;
      case 203:
        otmp.spe = 1;
        otmp.lamplit = 0;
        await blessorcurse(otmp, 2);
        break;
      case 190:
      case 189:
        otmp.olocked = ((!!rn2(5) ? 1 : 0) >>> 0) & 1;
        otmp.otrapped = ((!rn2(10) ? 1 : 0) >>> 0) & 1;
      case 191:
      case 192:
      case 193:
      case 194:
        await mkbox_cnts(otmp);
        break;
      case 204:
      case 213:
      case 217:
        otmp.spe = rn2(70) + 30 << 24 >> 24;
        break;
      case 215:
        otmp.spe = rnd(25) << 24 >> 24;
        await blessorcurse(otmp, 10);
        break;
      case 206:
        otmp.spe = rnd(5) << 24 >> 24;
        await blessorcurse(otmp, 2);
        break;
      case 227:
      case 195:
        otmp.spe = rnd(20) << 24 >> 24;
        break;
      case 216:
        tryct = 0;
        do {
          otmp.corpsenm = await rndmonnum();
        } while (($sat(G.mons, otmp.corpsenm).mflags2 & 8) >>> 0 !== 0 && tryct++ < 30);
        await blessorcurse(otmp, 4);
        break;
      case 238:
        otmp.spe = 3;
        break;
      case 223:
      case 229:
      case 225:
      case 226:
      case 233:
        otmp.spe = rn2(5) + 4 << 24 >> 24;
        break;
      }
      break;
    case AMULET_CLASS:
      if (otmp.otyp === AMULET_OF_YENDOR) {
        G.context.made_amulet = TRUE;
      }
      if (rn2(10) && (otmp.otyp === AMULET_OF_STRANGULATION || otmp.otyp === AMULET_OF_CHANGE || otmp.otyp === AMULET_OF_RESTFUL_SLEEP)) {
        await curse(otmp);
      } else {
        await blessorcurse(otmp, 10);
      }
      break;
    case VENOM_CLASS:
    case CHAIN_CLASS:
    case BALL_CLASS:
      break;
    case POTION_CLASS:
    case SCROLL_CLASS:
      if (otmp.otyp !== SCR_MAIL) {
        await blessorcurse(otmp, 4);
      }
      break;
    case SPBOOK_CLASS:
      otmp.usecount = 0;
      await blessorcurse(otmp, 17);
      break;
    case ARMOR_CLASS:
      if (rn2(10) && (otmp.otyp === FUMBLE_BOOTS || otmp.otyp === LEVITATION_BOOTS || otmp.otyp === HELM_OF_OPPOSITE_ALIGNMENT || otmp.otyp === GAUNTLETS_OF_FUMBLING || !rn2(11))) {
        await curse(otmp);
        otmp.spe = -rne(3) << 24 >> 24;
      } else if (!rn2(10)) {
        otmp.blessed = (rn2(2) >>> 0) & 1;
        otmp.spe = rne(3) << 24 >> 24;
      } else {
        await blessorcurse(otmp, 10);
      }
      if (artif && !rn2(40)) {
        otmp = await mk_artifact(otmp, A_NONE);
      }
      if (G.urole.malenum === 339 && otmp.otyp === SPLINT_MAIL && (G.moves <= 1 || In_quest(G.u.uz))) {
        otmp.oerodeproof = (otmp.rknown = 1) & 1;
      }
      break;
    case WAND_CLASS:
      if (otmp.otyp === WAN_WISHING) {
        otmp.spe = rnd(3) << 24 >> 24;
      } else {
        otmp.spe = rn2(5) + ((G.objects[otmp.otyp].oc_dir | 0) === 1 ? 11 : 4) << 24 >> 24;
      }
      await blessorcurse(otmp, 17);
      otmp.recharged = 0;
      break;
    case RING_CLASS:
      if (G.objects[otmp.otyp].oc_charged) {
        await blessorcurse(otmp, 3);
        if (rn2(10)) {
          if (rn2(10) && bcsign(otmp)) {
            otmp.spe = Math.imul(bcsign(otmp), rne(3)) << 24 >> 24;
          } else {
            otmp.spe = (rn2(2) ? rne(3) : -rne(3)) << 24 >> 24;
          }
        }
        if (otmp.spe === 0) {
          otmp.spe = rn2(4) - rn2(3) << 24 >> 24;
        }
        if (otmp.spe < 0 && rn2(5)) {
          await curse(otmp);
        }
      } else if (rn2(10) && (otmp.otyp === RIN_TELEPORTATION || otmp.otyp === RIN_POLYMORPH || otmp.otyp === RIN_AGGRAVATE_MONSTER || otmp.otyp === RIN_HUNGER || !rn2(9))) {
        await curse(otmp);
      }
      break;
    case ROCK_CLASS:
      switch (otmp.otyp) {
      case 449:
        otmp.corpsenm = await rndmonnum();
        if (!($sat(G.mons, otmp.corpsenm).msize < 1) && rn2((level_difficulty() / 2 | 0) + 10) > 10) {
          await add_to_container(otmp, await mkobj(SPBOOK_CLASS, FALSE));
        }
      }
      break;
    case COIN_CLASS:
      break;
    default:
      await panic(S("mksobj tried to make type %d, class %d."), otmp.otyp, G.objects[otmp.otyp].oc_class);
    }
  }
  switch (otmp.oclass === POTION_CLASS && otmp.otyp !== POT_OIL ? POT_WATER : otmp.otyp) {
  case 240:
    if (otmp.corpsenm === NON_PM) {
      otmp.corpsenm = undead_to_corpse(await rndmonnum());
      if (G.mvitals[otmp.corpsenm].mvflags & (G_NOCORPSE | G_GONE)) {
        otmp.corpsenm = G.urole.malenum;
      }
    }
  case 449:
  case 216:
    if (otmp.corpsenm === NON_PM) {
      otmp.corpsenm = await rndmonnum();
    }
  case 241:
    await set_corpsenm(otmp, otmp.corpsenm);
    break;
  case 296:
    otmp.age = MAX_OIL_IN_FLASK;
  case 297:
    otmp.corpsenm = 0;
    break;
  case 211:
    otmp.corpsenm = 0;
    break;
  case 382:
    otmp.corpsenm = -1;
    otmp = await oname(otmp, noveltitle(P(otmp, "corpsenm")));
    break;
  }
  if (G.objects[otyp].oc_unique | 0 && !otmp.oartifact) {
    otmp = await mk_artifact(otmp, A_NONE);
  }
  otmp.owt = await weight(otmp) >>> 0;
  return otmp;
}

export async function set_corpsenm(obj: struct_obj | null, id: number): Promise<void> {
  let when = 0;
  if (obj.timed) {
    if (obj.otyp === EGG) {
      when = await stop_timer(HATCH_EGG, obj_to_any(obj));
    } else {
      when = 0;
      await obj_stop_timers(obj);
    }
  }
  obj.corpsenm = id;
  switch (obj.otyp) {
  case 240:
    await start_corpse_timeout(obj);
    obj.owt = await weight(obj) >>> 0;
    break;
  case 216:
    if (obj.corpsenm !== NON_PM && !dead_species(obj.corpsenm, TRUE) && (obj.where === 3 || obj.where === 4)) {
      await attach_fig_transform_timeout(obj);
    }
    obj.owt = await weight(obj) >>> 0;
    break;
  case 241:
    if (obj.corpsenm !== NON_PM && !dead_species(obj.corpsenm, TRUE)) {
      await attach_egg_hatch_timeout(obj, when);
    }
    break;
  default:
    obj.owt = await weight(obj) >>> 0;
    break;
  }
}

export async function start_corpse_timeout(body: struct_obj | null): Promise<void> {
  let when = 0;
  let corpse_age = 0;
  let rot_adjust = 0;
  let action = 0;
  if (body.corpsenm === PM_LIZARD || body.corpsenm === PM_LICHEN) {
    return;
  }
  action = ROT_CORPSE;
  rot_adjust = G.in_mklev ? 25 : 10;
  corpse_age = G.monstermoves - body.age;
  if (corpse_age > ROT_AGE) {
    when = rot_adjust;
  } else {
    when = ROT_AGE - corpse_age;
  }
  when += rnz(rot_adjust) - rot_adjust;
  if ($sat(G.mons, body.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, body.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, body.corpsenm) === $sat(G.mons, 309)) {
    action = REVIVE_MON;
    for (when = 12; when < 500; ++when) {
      if (!rn2(3)) {
        break;
      }
    }
  } else if (G.mons[body.corpsenm].mlet === S_TROLL && !body.oeroded2) {
    let age = 0;
    for (age = 2; age <= TAINT_AGE; ++age) {
      if (!rn2(TROLL_REVIVE_CHANCE)) {
        action = REVIVE_MON;
        when = age;
        break;
      }
    }
  }
  if (body.oeroded2) {
    body.oeroded2 = 0;
  }
  await start_timer(when, TIMER_OBJECT, action, obj_to_any(body));
}

async function maybe_adjust_light(obj: struct_obj | null, old_range: number): Promise<void> {
  let buf = new Int8Array(256);
  const ox = new Int8Array(1);
  const oy = new Int8Array(1);
  let new_range = arti_light_radius(obj);
  let delta = new_range - old_range;
  if (delta) {
    await obj_adjust_light_radius(obj, new_range);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && get_obj_location(obj, P(ox, 0), P(oy, 0), 0)) {
      $wr(P(buf), 0, 0);
      if (G.iflags.last_msg === PLNMSG_OBJ_GLOWS) {
        strcpy(P(buf), obj.quan === 1 ? S("It") : S("They"));
      } else if (obj.where === 3 || $rd(G.viz_array.a[G.viz_array.o + oy[0]], ox[0]) & 2) {
        strcpy(P(buf), await Yname2(obj));
      }
      if ($rd(P(buf))) {
        await pline(S("%s %s %s%s."), P(buf), otense(obj, S("shine")), Math.abs(delta) > 1 ? S("much ") : S(""), delta > 0 ? S("brighter") : S("less brightly"));
      }
    }
  }
}

export async function bless(otmp: struct_obj | null): Promise<void> {
  let old_light = 0;
  if (otmp.oclass === COIN_CLASS) {
    return;
  }
  if (otmp.lamplit) {
    old_light = arti_light_radius(otmp);
  }
  otmp.cursed = 0;
  otmp.blessed = 1;
  if (otmp.where === 3 && confers_luck(otmp)) {
    set_moreluck();
  } else if (otmp.otyp === BAG_OF_HOLDING) {
    otmp.owt = await weight(otmp) >>> 0;
  } else if (otmp.otyp === FIGURINE && otmp.timed) {
    await stop_timer(FIG_TRANSFORM, obj_to_any(otmp));
  }
  if (otmp.lamplit) {
    await maybe_adjust_light(otmp, old_light);
  }
  return;
}

export async function unbless(otmp: struct_obj | null): Promise<void> {
  let old_light = 0;
  if (otmp.lamplit) {
    old_light = arti_light_radius(otmp);
  }
  otmp.blessed = 0;
  if (otmp.where === 3 && confers_luck(otmp)) {
    set_moreluck();
  } else if (otmp.otyp === BAG_OF_HOLDING) {
    otmp.owt = await weight(otmp) >>> 0;
  }
  if (otmp.lamplit) {
    await maybe_adjust_light(otmp, old_light);
  }
}

export async function curse(otmp: struct_obj | null): Promise<void> {
  let already_cursed = 0;
  let old_light = 0;
  if (otmp.oclass === COIN_CLASS) {
    return;
  }
  if (otmp.lamplit) {
    old_light = arti_light_radius(otmp);
  }
  already_cursed = otmp.cursed;
  otmp.blessed = 0;
  otmp.cursed = 1;
  if (otmp === G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0)) {
    reset_remarm();
  }
  if (otmp === G.uswapwep && G.u.twoweap) {
    await drop_uswapwep();
  }
  if (otmp.where === 3 && confers_luck(otmp)) {
    set_moreluck();
  } else if (otmp.otyp === BAG_OF_HOLDING) {
    otmp.owt = await weight(otmp) >>> 0;
  } else if (otmp.otyp === FIGURINE) {
    if (otmp.corpsenm !== NON_PM && !dead_species(otmp.corpsenm, TRUE) && (otmp.where === 3 || otmp.where === 4)) {
      await attach_fig_transform_timeout(otmp);
    }
  } else if (otmp.oclass === SPBOOK_CLASS) {
    if (!already_cursed) {
      await book_cursed(otmp);
    }
  }
  if (otmp.lamplit) {
    await maybe_adjust_light(otmp, old_light);
  }
  return;
}

export async function uncurse(otmp: struct_obj | null): Promise<void> {
  let old_light = 0;
  if (otmp.lamplit) {
    old_light = arti_light_radius(otmp);
  }
  otmp.cursed = 0;
  if (otmp.where === 3 && confers_luck(otmp)) {
    set_moreluck();
  } else if (otmp.otyp === BAG_OF_HOLDING) {
    otmp.owt = await weight(otmp) >>> 0;
  } else if (otmp.otyp === FIGURINE && otmp.timed) {
    await stop_timer(FIG_TRANSFORM, obj_to_any(otmp));
  }
  if (otmp.lamplit) {
    await maybe_adjust_light(otmp, old_light);
  }
  return;
}

export async function blessorcurse(otmp: struct_obj | null, chance: number): Promise<void> {
  if (otmp.blessed | 0 || otmp.cursed | 0) {
    return;
  }
  if (!rn2(chance)) {
    if (!rn2(2)) {
      await curse(otmp);
    } else {
      await bless(otmp);
    }
  }
  return;
}

export function bcsign(otmp: struct_obj | null): number {
  return (!!otmp.blessed ? 1 : 0) - (!!otmp.cursed ? 1 : 0);
}

export function set_bknown(obj: struct_obj | null, onoff: number): void {
  if (obj.bknown !== onoff) {
    obj.bknown = (onoff) & 1;
    if (obj.where === OBJ_INVENT && G.moves > 1) {
      update_inventory();
    }
  }
}

export async function weight(obj: struct_obj | null): Promise<number> {
  let wt = G.objects[obj.otyp].oc_weight;
  if (obj.globby | 0 && obj.owt > 0) {
    wt = obj.owt | 0;
  }
  if (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) {
    let contents = null;
    let cwt = 0;
    if (obj.otyp === STATUE && obj.corpsenm >= LOW_PM) {
      wt = Math.imul(obj.quan | 0, G.mons[obj.corpsenm].cwt * 3 / 2 | 0);
    }
    for (contents = obj.cobj; contents; contents = contents.nobj) {
      cwt += await weight(contents);
    }
    if (obj.otyp === BAG_OF_HOLDING) {
      cwt = obj.cursed | 0 ? cwt * 2 : obj.blessed | 0 ? (cwt + 3) / 4 | 0 : (cwt + 1) / 2 | 0;
    }
    return wt + cwt;
  }
  if (obj.otyp === CORPSE && obj.corpsenm >= LOW_PM) {
    let long_wt = obj.quan * G.mons[obj.corpsenm].cwt;
    wt = long_wt > LARGEST_INT ? LARGEST_INT : long_wt | 0;
    if (obj.oeaten) {
      wt = await eaten_stat(wt, obj);
    }
    return wt;
  } else if (obj.oclass === FOOD_CLASS && obj.oeaten) {
    return await eaten_stat(Math.imul(obj.quan | 0, wt), obj);
  } else if (obj.oclass === COIN_CLASS) {
    return Math.trunc((obj.quan + 50) / 100) | 0;
  } else if (obj.otyp === HEAVY_IRON_BALL && obj.owt !== 0) {
    return obj.owt | 0;
  } else if (obj.otyp === CANDELABRUM_OF_INVOCATION && obj.spe) {
    return wt + Math.imul(obj.spe, G.objects[TALLOW_CANDLE].oc_weight);
  }
  return wt ? Math.imul(wt, obj.quan | 0) : (obj.quan | 0) + 1 >> 1;
}

export async function rnd_treefruit_at(x: number, y: number): Promise<struct_obj | null> {
  return await mksobj_at(treefruits[rn2(Math.trunc(20 / 4) | 0)], x, y, TRUE, FALSE);
}

export async function mkgold(amount: number, x: number, y: number): Promise<struct_obj | null> {
  let gold = g_at(x, y);
  if (amount <= 0) {
    let mul = rnd(30 / (12 - depth(G.u.uz) > 2 ? 12 - depth(G.u.uz) : 2) | 0);
    amount = 1 + rnd(level_difficulty() + 2) * mul;
  }
  if (gold) {
    gold.quan += amount;
  } else {
    gold = await mksobj_at(GOLD_PIECE, x, y, TRUE, FALSE);
    gold.quan = amount;
  }
  gold.owt = await weight(gold) >>> 0;
  return gold;
}

export async function mkcorpstat(objtype: number, mtmp: struct_monst | null, ptr: struct_permonst | null, x: number, y: number, corpstatflags: number): Promise<struct_obj | null> {
  let otmp = null;
  let init = ((corpstatflags & CORPSTAT_INIT) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  if (objtype !== CORPSE && objtype !== STATUE) {
    await impossible(S("making corpstat type %d"), objtype);
  }
  if (x === 0 && y === 0) {
    otmp = await mksobj(objtype, init, FALSE);
    await rloco(otmp);
  } else {
    otmp = await mksobj_at(objtype, x, y, init, FALSE);
  }
  if (mtmp) {
    await save_mtraits(otmp, mtmp);
    if (!ptr) {
      ptr = mtmp.data;
    }
  }
  if (ptr) {
    let old_corpsenm = otmp.corpsenm;
    otmp.corpsenm = await monsndx(ptr);
    otmp.owt = await weight(otmp) >>> 0;
    if (otmp.otyp === CORPSE && (old_corpsenm === 323 || old_corpsenm === 155 || (G.mons[old_corpsenm].mlet === S_TROLL || ($sat(G.mons, old_corpsenm) === $sat(G.mons, 308) || $sat(G.mons, old_corpsenm) === $sat(G.mons, 310) || $sat(G.mons, old_corpsenm) === $sat(G.mons, 309))) || (otmp.corpsenm === 323 || otmp.corpsenm === 155 || (G.mons[otmp.corpsenm].mlet === S_TROLL || ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309)))))) {
      await obj_stop_timers(otmp);
      await start_corpse_timeout(otmp);
    }
  }
  return otmp;
}

export async function corpse_revive_type(obj: struct_obj | null): Promise<number> {
  let revivetype = obj.corpsenm;
  let mtmp = null;
  if (obj.oextra && obj.oextra.omonst && !!(mtmp = await get_mtraits(obj, FALSE))) {
    revivetype = mtmp.mnum;
  }
  return revivetype;
}

export async function obj_attach_mid(obj: struct_obj | null, mid: number): Promise<struct_obj | null> {
  if (!mid || !obj) {
    return null;
  }
  await newomid(obj);
  obj.oextra.omid.a[obj.oextra.omid.o] = mid;
  return obj;
}

async function save_mtraits(obj: struct_obj | null, mtmp: struct_monst | null): Promise<struct_obj | null> {
  if (mtmp.ispriest) {
    await forget_temple_entry(mtmp);
  }
  if (!(obj.oextra && obj.oextra.omonst)) {
    await newomonst(obj);
  }
  if (obj.oextra && obj.oextra.omonst) {
    let mtmp2 = obj.oextra.omonst;
    mtmp2.$cp(mtmp);
    mtmp2.mextra = null;
    if (mtmp.data) {
      mtmp2.mnum = await monsndx(mtmp.data) << 16 >> 16;
    }
    mtmp2.nmon = null;
    mtmp2.data = null;
    mtmp2.minvent = null;
    if (mtmp.mextra) {
      await copy_mextra(mtmp2, mtmp);
    }
  }
  return obj;
}

export async function get_mtraits(obj: struct_obj | null, copyof: number): Promise<struct_monst | null> {
  let mtmp = null;
  let mnew = null;
  if (obj.oextra && obj.oextra.omonst) {
    mtmp = obj.oextra.omonst;
  }
  if (mtmp) {
    if (copyof) {
      mnew = new struct_monst();
      mnew.$cp(mtmp);
      mnew.mextra = null;
      if (mtmp.mextra) {
        await copy_mextra(mnew, mtmp);
      }
    } else {
      mnew = mtmp;
    }
  }
  return mnew;
}

export async function mk_tt_object(objtype: number, x: number, y: number): Promise<struct_obj | null> {
  let otmp = null;
  let initialize_it = 0;
  initialize_it = (objtype !== STATUE ? 1 : 0) << 24 >> 24;
  otmp = await mksobj_at(objtype, x, y, initialize_it, FALSE);
  await tt_oname(otmp);
  return otmp;
}

export async function mk_named_object(objtype: number, ptr: struct_permonst | null, x: number, y: number, nm: Ptr | null): Promise<struct_obj | null> {
  let otmp = null;
  let corpstatflags = (objtype !== STATUE ? CORPSTAT_INIT : CORPSTAT_NONE) >>> 0;
  otmp = await mkcorpstat(objtype, null, ptr, x, y, corpstatflags);
  if (nm) {
    otmp = await oname(otmp, nm);
  }
  return otmp;
}

export function is_flammable(otmp: struct_obj | null): number {
  let otyp = otmp.otyp;
  let omat = G.objects[otyp].oc_material | 0;
  if (otmp.otyp === 199 || otmp.otyp === 200) {
    return FALSE;
  }
  if (G.objects[otyp].oc_oprop === FIRE_RES || otyp === WAN_FIRE) {
    return FALSE;
  }
  return (omat <= WOOD && omat !== LIQUID || omat === PLASTIC ? 1 : 0) << 24 >> 24;
}

export function is_rottable(otmp: struct_obj | null): number {
  let otyp = otmp.otyp;
  return ((G.objects[otyp].oc_material | 0) <= WOOD && (G.objects[otyp].oc_material | 0) !== LIQUID ? 1 : 0) << 24 >> 24;
}

export async function place_object(otmp: struct_obj | null, x: number, y: number): Promise<void> {
  let otmp2 = G.level.objects[x][y];
  if (!isok(x, y)) {
    let func = null;
    func = x < 0 || y < 0 || x > COLNO - 1 || y > ROWNO - 1 ? panic : impossible;
    await func(S("place_object: \"%s\" [%d] off map <%d,%d>"), await safe_typename(otmp.otyp), otmp.where, x, y);
  }
  if (otmp.where !== OBJ_FREE) {
    await panic(S("place_object: obj \"%s\" [%d] not free"), await safe_typename(otmp.otyp), otmp.where);
  }
  await obj_no_longer_held(otmp);
  if (otmp.otyp === BOULDER) {
    if (!otmp2 || otmp2.otyp !== BOULDER) {
      block_point(x, y);
    }
  }
  if (otmp2 && otmp2.otyp === BOULDER && otmp.otyp !== BOULDER) {
    while (otmp2.v.v_nexthere && otmp2.v.v_nexthere.otyp === BOULDER) {
      otmp2 = otmp2.v.v_nexthere;
    }
    otmp.v.v_nexthere = otmp2.v.v_nexthere;
    otmp2.v.v_nexthere = otmp;
  } else {
    otmp.v.v_nexthere = otmp2;
    G.level.objects[x][y] = otmp;
  }
  otmp.ox = x << 24 >> 24;
  otmp.oy = y << 24 >> 24;
  otmp.where = OBJ_FLOOR;
  otmp.nobj = G.level.objlist;
  G.level.objlist = otmp;
  if (otmp.timed) {
    await obj_timer_checks(otmp, x, y, 0);
  }
}

export async function obj_ice_effects(x: number, y: number, do_buried: number): Promise<void> {
  let otmp = null;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.timed) {
      await obj_timer_checks(otmp, x, y, 0);
    }
  }
  if (do_buried) {
    for (otmp = G.level.buriedobjlist; otmp; otmp = otmp.nobj) {
      if (otmp.ox === x && otmp.oy === y) {
        if (otmp.timed) {
          await obj_timer_checks(otmp, x, y, 0);
        }
      }
    }
  }
}

export async function peek_at_iced_corpse_age(otmp: struct_obj | null): Promise<number> {
  let age = 0;
  let retval = otmp.age;
  if (otmp.otyp === CORPSE && otmp.recharged | 0) {
    age = G.monstermoves - otmp.age;
    retval += Math.trunc(age * (ROT_ICE_ADJUSTMENT - 1) / ROT_ICE_ADJUSTMENT);
    do {
      if (await debugcore(S("mkobj.c"), 1)) {
        await pline(S("The %s age has ice modifications: otmp->age = %ld, returning %ld."), s_suffix(await doname(otmp)), otmp.age, retval);
      }
    } while (0);
    do {
      if (await debugcore(S("mkobj.c"), 1)) {
        await pline(S("Effective age of corpse: %ld."), G.monstermoves - retval);
      }
    } while (0);
  }
  return retval;
}

async function obj_timer_checks(otmp: struct_obj | null, x: number, y: number, force: number): Promise<void> {
  let tleft = 0;
  let action = ROT_CORPSE;
  let restart_timer = FALSE;
  let on_floor = (otmp.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24;
  let buried = (otmp.where === OBJ_BURIED ? 1 : 0) << 24 >> 24;
  if (otmp.otyp === CORPSE && (on_floor || buried) && is_ice(x, y)) {
    tleft = await stop_timer(action, obj_to_any(otmp));
    if (tleft === 0) {
      action = REVIVE_MON;
      tleft = await stop_timer(action, obj_to_any(otmp));
    }
    if (tleft !== 0) {
      let age = 0;
      otmp.recharged = 1;
      do {
        if (await debugcore(S("mkobj.c"), 1)) {
          await pline(S("%s is now on ice at <%d,%d>."), await The(await xname(otmp)), x, y);
        }
      } while (0);
      tleft = tleft * ROT_ICE_ADJUSTMENT;
      restart_timer = TRUE;
      age = G.monstermoves - otmp.age;
      otmp.age = G.monstermoves - age * ROT_ICE_ADJUSTMENT;
    }
  } else if (force < 0 || otmp.otyp === CORPSE && otmp.recharged | 0 && !((on_floor || buried) && is_ice(x, y))) {
    tleft = await stop_timer(action, obj_to_any(otmp));
    if (tleft === 0) {
      action = REVIVE_MON;
      tleft = await stop_timer(action, obj_to_any(otmp));
    }
    if (tleft !== 0) {
      let age = 0;
      otmp.recharged = 0;
      do {
        if (await debugcore(S("mkobj.c"), 1)) {
          await pline(S("%s is no longer on ice at <%d,%d>."), await The(await xname(otmp)), x, y);
        }
      } while (0);
      tleft = Math.trunc(tleft / ROT_ICE_ADJUSTMENT);
      restart_timer = TRUE;
      age = G.monstermoves - otmp.age;
      otmp.age += Math.trunc(age * (ROT_ICE_ADJUSTMENT - 1) / ROT_ICE_ADJUSTMENT);
    }
  }
  if (restart_timer) {
    await start_timer(tleft, TIMER_OBJECT, action, obj_to_any(otmp));
  }
}

export async function remove_object(otmp: struct_obj | null): Promise<void> {
  let x = otmp.ox;
  let y = otmp.oy;
  if (otmp.where !== OBJ_FLOOR) {
    await panic(S("remove_object: obj not on floor"));
  }
  await extract_nexthere(otmp, P(G.level.objects[x], y));
  await extract_nobj(otmp, P(G.level, "objlist"));
  if (otmp.otyp === BOULDER && !sobj_at(BOULDER, x, y)) {
    unblock_point(x, y);
  }
  if (otmp.timed) {
    await obj_timer_checks(otmp, x, y, 0);
  }
}

export async function discard_minvent(mtmp: struct_monst | null): Promise<void> {
  let otmp = null;
  let mwep = mtmp.mw;
  let keeping_mon = (!(mtmp.mhp < 1) ? 1 : 0) << 24 >> 24;
  while (!!(otmp = mtmp.minvent)) {
    await obj_extract_self(otmp);
    if (otmp.owornmask) {
      if (keeping_mon) {
        if (otmp === mwep) {
          await mwepgone(mtmp), mwep = null;
        }
        mtmp.misc_worn_check = mtmp.misc_worn_check & ~otmp.owornmask;
        await update_mon_intrinsics(mtmp, otmp, FALSE, TRUE);
      }
      otmp.owornmask = 0;
    }
    await obfree(otmp, null);
  }
}

export async function obj_extract_self(obj: struct_obj | null): Promise<void> {
  switch (obj.where) {
  case 0:
    break;
  case 1:
    await remove_object(obj);
    break;
  case 2:
    await extract_nobj(obj, P(obj.v.v_ocontainer, "cobj"));
    await container_weight(obj.v.v_ocontainer);
    obj.v.v_ocontainer = null;
    break;
  case 3:
    await freeinv(obj);
    break;
  case 4:
    await extract_nobj(obj, P(obj.v.v_ocarry, "minvent"));
    obj.v.v_ocarry = null;
    break;
  case 5:
    await extract_nobj(obj, P(G, "migrating_objs"));
    break;
  case 6:
    await extract_nobj(obj, P(G.level, "buriedobjlist"));
    break;
  case 7:
    await extract_nobj(obj, P(G, "billobjs"));
    break;
  default:
    await panic(S("obj_extract_self"));
    break;
  }
}

export async function extract_nobj(obj: struct_obj | null, head_ptr: Ptr | null): Promise<void> {
  let curr = null;
  let prev = null;
  curr = head_ptr.a[head_ptr.o];
  for (prev = null; curr; prev = curr, curr = curr.nobj) {
    if (curr === obj) {
      if (prev) {
        prev.nobj = curr.nobj;
      } else {
        head_ptr.a[head_ptr.o] = curr.nobj;
      }
      break;
    }
  }
  if (!curr) {
    await panic(S("extract_nobj: object lost"));
  }
  obj.where = OBJ_FREE;
  obj.nobj = null;
}

export async function extract_nexthere(obj: struct_obj | null, head_ptr: Ptr | null): Promise<void> {
  let curr = null;
  let prev = null;
  curr = head_ptr.a[head_ptr.o];
  for (prev = null; curr; prev = curr, curr = curr.v.v_nexthere) {
    if (curr === obj) {
      if (prev) {
        prev.v.v_nexthere = curr.v.v_nexthere;
      } else {
        head_ptr.a[head_ptr.o] = curr.v.v_nexthere;
      }
      break;
    }
  }
  if (!curr) {
    await panic(S("extract_nexthere: object lost"));
  }
  obj.v.v_nexthere = null;
}

export async function add_to_minv(mon: struct_monst | null, obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  const otmp = [null];
  if (obj[0].where !== OBJ_FREE) {
    await panic(S("add_to_minv: obj not free"));
  }
  for (otmp[0] = mon.minvent; otmp[0]; otmp[0] = otmp[0].nobj) {
    if (await merged(P(otmp, 0), P(obj, 0))) {
      return 1;
    }
  }
  obj[0].where = OBJ_MINVENT;
  obj[0].v.v_ocarry = mon;
  obj[0].nobj = mon.minvent;
  mon.minvent = obj[0];
  return 0;
}

export async function add_to_container(container: struct_obj | null, obj$: struct_obj | null): Promise<struct_obj | null> {
  const obj = [null];
  obj[0] = obj$;
  const otmp = [null];
  if (obj[0].where !== OBJ_FREE) {
    await panic(S("add_to_container: obj not free"));
  }
  if (container.where !== OBJ_INVENT && container.where !== OBJ_MINVENT) {
    await obj_no_longer_held(obj[0]);
  }
  for (otmp[0] = container.cobj; otmp[0]; otmp[0] = otmp[0].nobj) {
    if (await merged(P(otmp, 0), P(obj, 0))) {
      return otmp[0];
    }
  }
  obj[0].where = OBJ_CONTAINED;
  obj[0].v.v_ocontainer = container;
  obj[0].nobj = container.cobj;
  container.cobj = obj[0];
  return obj[0];
}

export async function add_to_migration(obj: struct_obj | null): Promise<void> {
  if (obj.where !== OBJ_FREE) {
    await panic(S("add_to_migration: obj not free"));
  }
  if (obj.otyp >= 189 && obj.otyp <= 195) {
    maybe_reset_pick(obj);
  }
  obj.where = OBJ_MIGRATING;
  obj.nobj = G.migrating_objs;
  G.migrating_objs = obj;
}

export async function add_to_buried(obj: struct_obj | null): Promise<void> {
  if (obj.where !== OBJ_FREE) {
    await panic(S("add_to_buried: obj not free"));
  }
  obj.where = OBJ_BURIED;
  obj.nobj = G.level.buriedobjlist;
  G.level.buriedobjlist = obj;
}

async function container_weight(container: struct_obj | null): Promise<void> {
  container.owt = await weight(container) >>> 0;
  if (container.where === OBJ_CONTAINED) {
    await container_weight(container.v.v_ocontainer);
  }
}

export async function dealloc_obj(obj: struct_obj | null): Promise<void> {
  if (obj.where !== OBJ_FREE) {
    await panic(S("dealloc_obj: obj not free"));
  }
  if (obj.nobj) {
    await panic(S("dealloc_obj with nobj"));
  }
  if (obj.cobj) {
    await panic(S("dealloc_obj with cobj"));
  }
  if (obj.timed) {
    await obj_stop_timers(obj);
  }
  if (obj_sheds_light(obj)) {
    await del_light_source(LS_OBJECT, obj_to_any(obj));
  }
  if (obj === G.thrownobj) {
    G.thrownobj = null;
  }
  if (obj === G.kickedobj) {
    G.kickedobj = null;
  }
  if (obj.oextra) {
    dealloc_oextra(obj);
  }
  free(obj);
}

export async function hornoplenty(horn: struct_obj | null, tipping: number): Promise<number> {
  let objcount = 0;
  if (!horn || horn.otyp !== HORN_OF_PLENTY) {
    await impossible(S("bad horn o' plenty"));
  } else if (horn.spe < 1) {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  } else {
    let obj = null;
    let what = null;
    await consume_obj_charge(horn, !tipping ? 1 : 0);
    if (!rn2(13)) {
      obj = await mkobj(POTION_CLASS, FALSE);
      if (G.objects[obj.otyp].oc_magic) {
        do {
          obj.otyp = rnd_class(POT_BOOZE, POT_WATER) << 16 >> 16;
        } while (obj.otyp === POT_SICKNESS);
      }
      what = obj.quan > 1 ? S("Some potions") : S("A potion");
    } else {
      obj = await mkobj(FOOD_CLASS, FALSE);
      if (obj.otyp === FOOD_RATION && !rn2(7)) {
        obj.otyp = LUMP_OF_ROYAL_JELLY;
      }
      what = S("Some food");
    }
    ++objcount;
    await pline(S("%s %s out."), what, vtense(what, S("spill")));
    obj.blessed = (horn.blessed) & 1;
    obj.cursed = (horn.cursed) & 1;
    obj.owt = await weight(obj) >>> 0;
    if (horn.unpaid) {
      await addtobill(obj, FALSE, FALSE, tipping);
    }
    ++G.iflags.suppress_price;
    if (!tipping) {
      obj = await hold_another_object(obj, G.u.uswallow | 0 ? S("Oops!  %s out of your reach!") : (G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) || $at2(G.level.locations, G.u.ux, G.u.uy).typ < IRONBARS || $at2(G.level.locations, G.u.ux, G.u.uy).typ >= ICE ? S("Oops!  %s away from you!") : S("Oops!  %s to the floor!"), await The(await aobjnam(obj, S("slip"))), null);
      ;
    } else {
      if (!can_reach_floor(TRUE)) {
        await hitfloor(obj, TRUE);
      } else {
        if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) {
          await doaltarobj(obj);
        } else {
          await pline(S("%s %s to the %s."), await Doname2(obj), otense(obj, S("drop")), surface(G.u.ux, G.u.uy));
        }
        await dropy(obj);
      }
    }
    --G.iflags.suppress_price;
    if (horn.dknown) {
      await discover_object(227, 1, 1);
    }
  }
  return objcount;
}

export async function obj_sanity_check(): Promise<void> {
  let x = 0;
  let y = 0;
  let obj = null;
  await objlist_sanity(G.level.objlist, OBJ_FLOOR, S("floor sanity"));
  for (x = 0; x < COLNO; ++x) {
    for (y = 0; y < ROWNO; ++y) {
      for (obj = G.level.objects[x][y]; obj; obj = obj.v.v_nexthere) {
        if (obj.where !== OBJ_FLOOR || x === 0 || obj.ox !== x || obj.oy !== y) {
          let at_fmt = new Int8Array(256);
          sprintf(P(at_fmt), S("%%s obj@<%d,%d> %%s %%s: %%s@<%d,%d>"), x, y, obj.ox, obj.oy);
          await insane_object(obj, P(at_fmt), S("location sanity"), null);
        }
      }
    }
  }
  await objlist_sanity(G.invent, OBJ_INVENT, S("invent sanity"));
  await objlist_sanity(G.migrating_objs, OBJ_MIGRATING, S("migrating sanity"));
  await objlist_sanity(G.level.buriedobjlist, OBJ_BURIED, S("buried sanity"));
  await objlist_sanity(G.billobjs, OBJ_ONBILL, S("bill sanity"));
  await mon_obj_sanity(G.level.monlist, S("minvent sanity"));
  await mon_obj_sanity(G.migrating_mons, S("migrating minvent sanity"));
  if (G.mydogs) {
    await impossible(S("mydogs sanity [not empty]"));
    await mon_obj_sanity(G.mydogs, S("mydogs minvent sanity"));
  }
  if (G.thrownobj) {
    await insane_object(G.thrownobj, P(ofmt3), S("thrownobj sanity"), null);
  }
  if (G.kickedobj) {
    await insane_object(G.kickedobj, P(ofmt3), S("kickedobj sanity"), null);
  }
  if (G.current_wand) {
    await insane_object(G.current_wand, P(ofmt3), S("current_wand sanity"), null);
  }
}

async function objlist_sanity(objlist: struct_obj | null, wheretype: number, mesg: Ptr | null): Promise<void> {
  let obj = null;
  for (obj = objlist; obj; obj = obj.nobj) {
    if (obj.where !== wheretype) {
      await insane_object(obj, P(ofmt0), mesg, null);
    }
    if (!!obj.cobj) {
      if (wheretype === OBJ_ONBILL) {
        await insane_object(obj, S("%s obj contains something! %s %s: %s"), mesg, null);
      }
      await check_contained(obj, mesg);
    }
    if (obj.owornmask) {
      let maskbuf = new Int8Array(40);
      let bc_ok = FALSE;
      switch (obj.where) {
      case 3:
      case 4:
        await sanity_check_worn(obj);
        break;
      case 5:
        break;
      case 1:
        bc_ok = TRUE;
      default:
        if (obj !== G.uchain && obj !== G.uball || !bc_ok) {
          sprintf(P(maskbuf), S("worn mask 0x%08lx"), obj.owornmask);
          await insane_object(obj, P(ofmt0), P(maskbuf), null);
        }
        break;
      }
      if (obj.globby) {
        await check_glob(obj, mesg);
      }
    }
  }
}

async function mon_obj_sanity(monlist: struct_monst | null, mesg: Ptr | null): Promise<void> {
  let mon = null;
  let obj = null;
  let mwep = null;
  for (mon = monlist; mon; mon = mon.nmon) {
    if (mon.mhp < 1) {
      continue;
    }
    mwep = mon.mw;
    if (mwep) {
      if (!(mwep.where === 4)) {
        await insane_object(mwep, P(mfmt1), mesg, mon);
      }
      if (mwep.v.v_ocarry !== mon) {
        await insane_object(mwep, P(mfmt2), mesg, mon);
      }
    }
    for (obj = mon.minvent; obj; obj = obj.nobj) {
      if (obj.where !== OBJ_MINVENT) {
        await insane_object(obj, P(mfmt1), mesg, mon);
      }
      if (obj.v.v_ocarry !== mon) {
        await insane_object(obj, P(mfmt2), mesg, mon);
      }
      if (obj.globby) {
        await check_glob(obj, mesg);
      }
      await check_contained(obj, mesg);
    }
  }
}

function where_name(obj: struct_obj | null): Ptr | null {
  let where = 0;
  if (!obj) {
    return S("nowhere");
  }
  where = obj.where;
  if (where < 0 || where >= NOBJ_STATES || !obj_state_names[where]) {
    sprintf(P(where_name$unknown), S("unknown[%d]"), where);
    return P(where_name$unknown);
  }
  return obj_state_names[where];
}

async function insane_object(obj: struct_obj | null, fmt: Ptr | null, mesg: Ptr | null, mon: struct_monst | null): Promise<void> {
  let objnm = null;
  let monnm = null;
  let altfmt = new Int8Array(256);
  objnm = monnm = S("null!");
  if (obj) {
    ++G.iflags.override_ID;
    objnm = await doname(obj);
    --G.iflags.override_ID;
  }
  if (mon || strstri(mesg, S("minvent")) && !strstri(mesg, S("contained"))) {
    strcat(strcpy(P(altfmt), fmt), S(" held by mon %s (%s)"));
    if (mon) {
      monnm = await x_monnam(mon, ARTICLE_A, null, EXACT_NAME, TRUE);
    }
    await impossible(P(altfmt), mesg, fmt_ptr(obj), where_name(obj), objnm, fmt_ptr(mon), monnm);
  } else {
    await impossible(fmt, mesg, fmt_ptr(obj), where_name(obj), objnm);
  }
}

export function init_dummyobj(obj: struct_obj | null, otyp: number, oquan: number): struct_obj | null {
  if (obj) {
    obj.$cp(G.zeroobj);
    obj.otyp = otyp;
    obj.oclass = G.objects[otyp].oc_class;
    obj.known = ((obj.oclass === AMULET_CLASS ? obj.known | 0 : !G.objects[otyp].oc_uses_known ? 1 : 0) >>> 0) & 1;
    obj.quan = oquan ? oquan : 1;
    obj.corpsenm = NON_PM;
    if (obj.otyp === SLIME_MOLD) {
      obj.spe = G.context.current_fruit << 24 >> 24;
    }
  }
  return obj;
}

async function check_contained(container: struct_obj | null, mesg: Ptr | null): Promise<void> {
  let obj = null;
  let mesgbuf = new Int8Array(40);
  let nestedmesg = new Int8Array(120);
  if (!!!container.cobj) {
    return;
  }
  if (!strstri(mesg, S("contained"))) {
    mesg = strcat(strcpy(P(mesgbuf), S("contained ")), mesg);
  }
  for (obj = container.cobj; obj; obj = obj.nobj) {
    if (obj === container) {
      await panic(S("failed sanity check: container holds itself"));
    }
    if (obj.where !== OBJ_CONTAINED) {
      await insane_object(obj, S("%s obj %s %s: %s"), mesg, null);
    } else if (obj.v.v_ocontainer !== container) {
      await impossible(S("%s obj %s in container %s, not %s"), mesg, fmt_ptr(obj), fmt_ptr(obj.v.v_ocontainer), fmt_ptr(container));
    }
    if (obj.globby) {
      await check_glob(obj, mesg);
    }
    if (!!obj.cobj) {
      if (obj.cobj === container) {
        await panic(S("failed sanity check: container holds its parent"));
      }
      strcpy(P(nestedmesg), S("nested "));
      copynchars(eos(P(nestedmesg)), mesg, 120 - (strlen(P(nestedmesg)) | 0) - 1);
      await check_contained(obj, P(nestedmesg));
    }
  }
}

async function check_glob(obj: struct_obj | null, mesg: Ptr | null): Promise<void> {
  if (obj.quan !== 1 || obj.owt === 0 || obj.otyp < LOWEST_GLOB || obj.otyp > HIGHEST_GLOB || obj.owt % G.objects[obj.otyp].oc_weight !== 0 && !obj.oeaten) {
    let mesgbuf = new Int8Array(256);
    let globbuf = new Int8Array(128);
    sprintf(P(globbuf), S(" glob %d,quan=%ld,owt=%u "), obj.otyp, obj.quan, obj.owt);
    mesg = strsubst(strcpy(P(mesgbuf), mesg), S(" obj "), P(globbuf));
    await insane_object(obj, P(ofmt0), mesg, obj.where === OBJ_MINVENT ? obj.v.v_ocarry : null);
  }
}

async function sanity_check_worn(obj: struct_obj | null): Promise<void> {
  let maskbuf = new Int8Array(60);
  let what = null;
  let owornmask = 0;
  let allmask = 0;
  let embedded = FALSE;
  let i = 0;
  let n = 0;
  owornmask = $u64(obj.owornmask);
  for (i = 0; sanity_check_worn$wearbits[i]; ++i) {
    if ((owornmask & sanity_check_worn$wearbits[i]) >>> 0 !== 0) {
      ++n;
    }
    allmask = (allmask | sanity_check_worn$wearbits[i]) >>> 0;
  }
  if (obj === G.uskin) {
    embedded = TRUE;
    if ((owornmask & (W_ARM | I_SPECIAL)) >>> 0 === (W_ARM | I_SPECIAL)) {
      owornmask = (owornmask & ~I_SPECIAL >>> 0) >>> 0;
    } else {
      n = 0, owornmask = ~0 >>> 0;
    }
  }
  if (n === 2 && obj.where === 3 && obj === G.uball && (owornmask & W_BALL) >>> 0 !== 0 && (owornmask & W_WEAPONS) >>> 0 !== 0) {
    owornmask = (owornmask & ~W_BALL >>> 0) >>> 0;
    n = 1;
  }
  if (n > 1) {
    sprintf(P(maskbuf), S("worn mask (multiple) 0x%08lx"), obj.owornmask);
    await insane_object(obj, P(ofmt0), P(maskbuf), null);
  }
  if ((owornmask & ~allmask >>> 0) >>> 0 !== 0 || obj.where === 3 && (owornmask & W_SADDLE) >>> 0 !== 0) {
    sprintf(P(maskbuf), S("worn mask (bogus)) 0x%08lx"), obj.owornmask);
    await insane_object(obj, P(ofmt0), P(maskbuf), null);
  }
  if (n === 1 && (obj.where === 3 || (owornmask & (W_BALL | W_CHAIN)) >>> 0 !== 0)) {
    what = null;
    switch (owornmask) {
    case 1:
      if (obj !== (embedded ? G.uskin : G.uarm)) {
        what = embedded ? S("skin") : S("suit");
      }
      break;
    case 2:
      if (obj !== G.uarmc) {
        what = S("cloak");
      }
      break;
    case 4:
      if (obj !== G.uarmh) {
        what = S("helm");
      }
      break;
    case 8:
      if (obj !== G.uarms) {
        what = S("shield");
      }
      break;
    case 16:
      if (obj !== G.uarmg) {
        what = S("gloves");
      }
      break;
    case 32:
      if (obj !== G.uarmf) {
        what = S("boots");
      }
      break;
    case 64:
      if (obj !== G.uarmu) {
        what = S("shirt");
      }
      break;
    case 256:
      if (obj !== G.uwep) {
        what = S("primary weapon");
      }
      break;
    case 512:
      if (obj !== G.uquiver) {
        what = S("quiver");
      }
      break;
    case 1024:
      if (obj !== G.uswapwep) {
        what = G.u.twoweap ? S("secondary weapon") : S("alternate weapon");
      }
      break;
    case 65536:
      if (obj !== G.uamul) {
        what = S("amulet");
      }
      break;
    case 131072:
      if (obj !== G.uleft) {
        what = S("left ring");
      }
      break;
    case 262144:
      if (obj !== G.uright) {
        what = S("right ring");
      }
      break;
    case 524288:
      if (obj !== G.ublindf) {
        what = S("blindfold");
      }
      break;
    case 2097152:
      if (obj !== G.uball) {
        what = S("ball");
      }
      break;
    case 4194304:
      if (obj !== G.uchain) {
        what = S("chain");
      }
      break;
    default:
      break;
    }
    if (what) {
      sprintf(P(maskbuf), S("worn mask 0x%08lx != %s"), obj.owornmask, what);
      await insane_object(obj, P(ofmt0), P(maskbuf), null);
    }
  }
  if (n === 1 && (obj.where === 3 || (owornmask & (W_BALL | W_CHAIN)) >>> 0 !== 0 || obj.where === 4)) {
    what = null;
    if ((owornmask & W_ARMOR) >>> 0) {
      if (obj.oclass !== ARMOR_CLASS) {
        what = S("armor");
      }
      if (embedded && !(obj.otyp >= 91 && obj.otyp <= 99)) {
        what = S("skin");
      }
    } else if ((owornmask & W_WEAPONS) >>> 0) {
      if (obj.where === 4 && (owornmask & (W_SWAPWEP | W_QUIVER)) >>> 0 !== 0) {
        what = (owornmask & W_SWAPWEP) >>> 0 !== 0 ? S("monst alt weapon?") : S("monst quiver?");
      } else if (obj.oclass === COIN_CLASS && (owornmask & (W_WEP | W_SWAPWEP)) >>> 0 !== 0) {
        what = (owornmask & W_WEP) >>> 0 !== 0 ? S("weapon") : S("alt weapon");
      }
    } else if ((owornmask & W_AMUL) >>> 0) {
      if (obj.oclass !== AMULET_CLASS) {
        what = S("amulet");
      }
    } else if ((owornmask & W_RING) >>> 0) {
      if (obj.oclass !== RING_CLASS && obj.otyp !== MEAT_RING) {
        what = S("ring");
      }
    } else if ((owornmask & W_TOOL) >>> 0) {
      if (obj.otyp !== BLINDFOLD && obj.otyp !== TOWEL && obj.otyp !== LENSES) {
        what = S("blindfold");
      }
    } else if ((owornmask & W_BALL) >>> 0) {
      if (obj.oclass !== BALL_CLASS) {
        what = S("chained ball");
      }
    } else if ((owornmask & W_CHAIN) >>> 0) {
      if (obj.oclass !== CHAIN_CLASS) {
        what = S("chain");
      }
    } else if ((owornmask & W_SADDLE) >>> 0) {
      if (obj.otyp !== SADDLE) {
        what = S("saddle");
      }
    }
    if (what) {
      let oclassname = new Int8Array(30);
      let mon = obj.where === 4 ? obj.v.v_ocarry : null;
      strcpy(P(oclassname), G.def_oc_syms[obj.oclass & 0xff].name);
      sprintf(P(maskbuf), S("worn (%s %s)"), await makesingular(P(oclassname)), what);
      await insane_object(obj, P(ofmt0), P(maskbuf), mon);
    }
  }
}

export async function obj_nexto(otmp: struct_obj | null): Promise<struct_obj | null> {
  if (!otmp) {
    await impossible(S("obj_nexto: wasn't given an object to check"));
    return null;
  }
  return await obj_nexto_xy(otmp, otmp.ox, otmp.oy, TRUE);
}

export async function obj_nexto_xy(obj: struct_obj | null, x: number, y: number, recurs: number): Promise<struct_obj | null> {
  let otmp = null;
  let fx = 0;
  let fy = 0;
  let ex = 0;
  let ey = 0;
  let otyp = obj.otyp;
  let dx = 0;
  let dy = 0;
  otmp = sobj_at(otyp, x, y);
  while (otmp) {
    if (otmp !== obj && await mergable(otmp, obj)) {
      return otmp;
    }
    otmp = nxtobj(otmp, otyp, TRUE);
  }
  if (!recurs) {
    return null;
  }
  dx = (rn2(2) ? -1 : 1) << 16 >> 16;
  dy = (rn2(2) ? -1 : 1) << 16 >> 16;
  ex = x - dx;
  ey = y - dy;
  for (fx = ex; Math.abs(fx - ex) < 3; fx += dx) {
    for (fy = ey; Math.abs(fy - ey) < 3; fy += dy) {
      if (isok(fx, fy) && (fx !== x || fy !== y)) {
        if (!!(otmp = await obj_nexto_xy(obj, fx, fy, FALSE))) {
          return otmp;
        }
      }
    }
  }
  return null;
}

export async function obj_absorb(obj1: Ptr | null, obj2: Ptr | null): Promise<struct_obj | null> {
  let otmp1 = null;
  let otmp2 = null;
  let o1wt = 0;
  let o2wt = 0;
  let agetmp = 0;
  if (obj1 && obj2) {
    otmp1 = obj1.a[obj1.o];
    otmp2 = obj2.a[obj2.o];
    if (otmp1 && otmp2 && otmp1 !== otmp2) {
      await globby_bill_fixup(otmp1, otmp2);
      if ((otmp1.bknown | 0) !== (otmp2.bknown | 0)) {
        otmp1.bknown = (otmp2.bknown = 0) & 1;
      }
      if ((otmp1.rknown | 0) !== (otmp2.rknown | 0)) {
        otmp1.rknown = (otmp2.rknown = 0) & 1;
      }
      if ((otmp1.greased | 0) !== (otmp2.greased | 0)) {
        otmp1.greased = (otmp2.greased = 0) & 1;
      }
      if (otmp1.oeroded | 0 || otmp2.oeroded | 0) {
        otmp1.oeroded = (otmp2.oeroded = 1) & 3;
      }
      o1wt = (otmp1.oeaten ? otmp1.oeaten : otmp1.owt) | 0;
      o2wt = (otmp2.oeaten ? otmp2.oeaten : otmp2.owt) | 0;
      agetmp = Math.trunc(((G.moves - otmp1.age) * o1wt + (G.moves - otmp2.age) * o2wt) / (o1wt + o2wt));
      otmp1.age = G.moves - agetmp;
      otmp1.owt = otmp1.owt + (o2wt >>> 0) >>> 0;
      if (otmp1.oeaten || otmp2.oeaten) {
        otmp1.oeaten = o1wt + o2wt >>> 0;
      }
      otmp1.quan = 1;
      await obj_extract_self(otmp2);
      await dealloc_obj(otmp2);
      obj2.a[obj2.o] = null;
      return otmp1;
    }
  }
  await impossible(S("obj_absorb: not called with two actual objects"));
  return null;
}

export async function obj_meld(obj1: Ptr | null, obj2: Ptr | null): Promise<struct_obj | null> {
  let otmp1 = null;
  let otmp2 = null;
  let result = null;
  let ox = 0;
  let oy = 0;
  if (obj1 && obj2) {
    otmp1 = obj1.a[obj1.o];
    otmp2 = obj2.a[obj2.o];
    if (otmp1 && otmp2 && otmp1 !== otmp2) {
      ox = oy = 0;
      if (!(otmp2.where === OBJ_FLOOR && otmp1.where === OBJ_FREE) && (otmp1.owt > otmp2.owt || otmp1.owt === otmp2.owt && rn2(2))) {
        if (otmp2.where === OBJ_FLOOR) {
          ox = otmp2.ox, oy = otmp2.oy;
        }
        result = await obj_absorb(obj1, obj2);
      } else {
        if (otmp1.where === OBJ_FLOOR) {
          ox = otmp1.ox, oy = otmp1.oy;
        }
        result = await obj_absorb(obj2, obj1);
      }
      if (ox && $rd(G.viz_array.a[G.viz_array.o + oy], ox) & 2) {
        await newsym(ox, oy);
      }
    }
  } else {
    await impossible(S("obj_meld: not called with two actual objects"));
  }
  return result;
}

export async function pudding_merge_message(otmp: struct_obj | null, otmp2: struct_obj | null): Promise<void> {
  let visible = ($rd(G.viz_array.a[G.viz_array.o + otmp.oy], otmp.ox) & 2 || $rd(G.viz_array.a[G.viz_array.o + otmp2.oy], otmp2.ox) & 2 ? 1 : 0) << 24 >> 24;
  let onfloor = (otmp.where === OBJ_FLOOR || otmp2.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24;
  let inpack = (otmp.where === 3 || otmp2.where === 3 ? 1 : 0) << 24 >> 24;
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && visible || inpack) {
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      if (onfloor) {
        await You_see(S("parts of the floor melting!"));
      } else if (inpack) {
        await Your(S("pack reaches out and grabs something!"));
      }
    } else if (onfloor || inpack) {
      let adj = ((otmp.ox !== G.u.ux || otmp.oy !== G.u.uy) && (otmp2.ox !== G.u.ux || otmp2.oy !== G.u.uy) ? 1 : 0) << 24 >> 24;
      await pline(S("The %s%s coalesce%s."), onfloor && adj ? S("adjacent ") : S(""), await makeplural(await obj_typename(otmp.otyp)), inpack ? S(" inside your pack") : S(""));
    }
  } else {
    await You_hear(S("a faint sloshing sound."));
  }
}

export function $init(): void {
  mkobjprobs = $sarrOf([struct_icp.$of(10, WEAPON_CLASS),
struct_icp.$of(10, ARMOR_CLASS),
struct_icp.$of(20, FOOD_CLASS),
struct_icp.$of(8, TOOL_CLASS),
struct_icp.$of(8, GEM_CLASS),
struct_icp.$of(16, POTION_CLASS),
struct_icp.$of(16, SCROLL_CLASS),
struct_icp.$of(4, SPBOOK_CLASS),
struct_icp.$of(4, WAND_CLASS),
struct_icp.$of(3, RING_CLASS),
struct_icp.$of(1, AMULET_CLASS)]);
  boxiprobs = $sarrOf([struct_icp.$of(18, GEM_CLASS),
struct_icp.$of(15, FOOD_CLASS),
struct_icp.$of(18, POTION_CLASS),
struct_icp.$of(18, SCROLL_CLASS),
struct_icp.$of(12, SPBOOK_CLASS),
struct_icp.$of(7, COIN_CLASS),
struct_icp.$of(6, WAND_CLASS),
struct_icp.$of(5, RING_CLASS),
struct_icp.$of(1, AMULET_CLASS)]);
  rogueprobs = $sarrOf([struct_icp.$of(12, WEAPON_CLASS),
struct_icp.$of(12, ARMOR_CLASS),
struct_icp.$of(22, FOOD_CLASS),
struct_icp.$of(22, POTION_CLASS),
struct_icp.$of(22, SCROLL_CLASS),
struct_icp.$of(5, WAND_CLASS),
struct_icp.$of(5, RING_CLASS)]);
  hellprobs = $sarrOf([struct_icp.$of(20, WEAPON_CLASS),
struct_icp.$of(20, ARMOR_CLASS),
struct_icp.$of(16, FOOD_CLASS),
struct_icp.$of(12, TOOL_CLASS),
struct_icp.$of(10, GEM_CLASS),
struct_icp.$of(1, POTION_CLASS),
struct_icp.$of(1, SCROLL_CLASS),
struct_icp.$of(8, WAND_CLASS),
struct_icp.$of(8, RING_CLASS),
struct_icp.$of(4, AMULET_CLASS)]);
  alteration_verbs = [S("cancel"),
S("drain"),
S("uncharge"),
S("unbless"),
S("uncurse"),
S("disenchant"),
S("degrade"),
S("dilute"),
S("erase"),
S("burn"),
S("neutralize"),
S("destroy"),
S("splatter"),
S("bite"),
S("open"),
S("break the lock on"),
S("rust"),
S("rot"),
S("tarnish")];
  dknowns = $ta(Int8Array, 9, [WAND_CLASS, RING_CLASS, POTION_CLASS, SCROLL_CLASS, GEM_CLASS, SPBOOK_CLASS, WEAPON_CLASS, TOOL_CLASS]);
  treefruits = $ta(Int32Array, 5, [APPLE, ORANGE, PEAR, BANANA, EUCALYPTUS_LEAF]);
  ofmt0 = $cs("%s obj %s %s: %s", 17);
  ofmt3 = $cs("%s [not null] %s %s: %s", 24);
  mfmt1 = $cs("%s obj %s %s (%s)", 18);
  mfmt2 = $cs("%s obj %s %s (%s) *not*", 24);
  obj_state_names = [S("free"),
S("floor"),
S("contained"),
S("invent"),
S("minvent"),
S("migrating"),
S("buried"),
S("onbill")];
  where_name$unknown = new Int8Array(32);
  sanity_check_worn$wearbits = $ta(Float64Array, 18, [W_ARM, W_ARMC, W_ARMH, W_ARMS, W_ARMG, W_ARMF, W_ARMU, W_WEP, W_QUIVER, W_SWAPWEP, W_AMUL, W_RINGL, W_RINGR, W_TOOL, W_SADDLE, W_BALL, W_CHAIN]);
}
