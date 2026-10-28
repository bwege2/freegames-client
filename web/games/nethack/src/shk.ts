// @ts-nocheck
// NetHack 3.6.7 shk.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { o_unleash, um_dist, unleash_all } from './apply.ts';
import { arti_cost } from './artifact.ts';
import { acurr, adjalign, exercise } from './attrib.ts';
import { placebc, unplacebc } from './ball.ts';
import { drop_upon_death } from './bones.ts';
import { bot } from './botl.ts';
import { isok, yn_function } from './cmd.ts';
import { holetime } from './dig.ts';
import { map_invisible, newsym } from './display.ts';
import { dropy } from './do.ts';
import { Monnam, a_monnam, getpos, mon_nam, x_monnam, y_monnam } from './do_name.ts';
import { migrate_to_level } from './dog.ts';
import { assign_level, depth, ledger_no, on_level } from './dungeon.ts';
import { food_disappears } from './eat.ts';
import { panic } from './end.ts';
import { debugcore } from './files.ts';
import { check_special_room, in_rooms, inv_cnt, money_cnt } from './hack.ts';
import { dist2, eos, highc, online2, s_suffix, sgn, strncmpi, upstart } from './hacklib.ts';
import { addinv, carrying, count_contents, count_unpaid, currency, freeinv, merge_choice, o_on, sobj_at, update_inventory, xprname } from './invent.ts';
import { maybe_reset_pick, picking_at } from './lock.ts';
import { makemon } from './makemon.ts';
import { mattacku } from './mhitu.ts';
import { add_to_minv, bill_dummy_object, dealloc_obj, mksobj, obj_extract_self, place_object, remove_object, splitobj, weight } from './mkobj.ts';
import { search_special } from './mkroom.ts';
import { angry_guards, mnearto, mnexto, mongone, pacify_guards } from './mon.ts';
import { locomotion, pronoun_gender } from './mondata.ts';
import { closed_door, dochug } from './monmove.ts';
import { discover_object } from './o_init.ts';
import { Doname2, The, ansimpleoname, doname, makeplural, obj_typename, safe_qbuf, simpleonames, the, thesimpleoname, vtense, xname } from './objnam.ts';
import { Norep, There, You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart, poly_gender } from './polyself.ts';
import { move_special } from './priest.ts';
import { rn2, rnd } from './rnd.ts';
import { Hello } from './role.ts';
import { Shknam, is_izchak, saleable, shkname } from './shknam.ts';
import { growl, yelp } from './sounds.ts';
import { book_disappears } from './spell.ts';
import { findgold, mdrop_special_objs, mpickobj, remove_worn_item } from './steal.ts';
import { enexto } from './teleport.ts';
import { obj_stop_timers } from './timeout.ts';
import { deltrap, t_at } from './trap.ts';
import { hidden_gold } from './vault.ts';
import { block_point } from './vision.ts';
import { worm_known } from './worm.ts';
import { setnotworn } from './worn.ts';
import { get_obj_location, resist } from './zap.ts';
import { struct_bill_x, struct_damage, struct_eshk, struct_mkroom, struct_monst, struct_nhcoord, struct_obj, struct_repo } from './structs.ts';
import { $at2, $cs, $peq, $rd, $sadd, $sat, $sidx, $ta, $wr, G, P, S, free, memset, sleep, sprintf, strcat, strchr, strcmp, strcpy, strncmp, strncpy } from './rt/index.ts';
import { AGATE, AMBER, AMETHYST, AMULET_CLASS, ANY_SHOP, AQUAMARINE, ARM, ARMOR_CLASS, ARTICLE_THE, A_CHA, A_WIS, BAG_OF_TRICKS, BALL_CLASS, BEARTRAP, BEAR_TRAP, BILLSZ, BLACK_OPAL, BLINDED, BOLT_LIM, BOULDER, BRASS_LANTERN, BURIED_TOO, CANDELABRUM_OF_INVOCATION, CANDLESHOP, CAN_OF_GREASE, CHAIN_CLASS, CHRYSOBERYL, CITRINE, COIN_CLASS, COLNO, CONFLICT, CONTAINED_TOO, CRYSTAL_BALL, DBWALL, DEAF, DETECT_MONSTERS, DIAMOND, DISPLACED, DOOR, DRUM_OF_EARTHQUAKE, DUNCE_CAP, DWARVISH_MATTOCK, D_BROKEN, D_CLOSED, D_ISOPEN, EMERALD, EXPENSIVE_CAMERA, FALSE, FAST, FLUORITE, FOOD_CLASS, GEMSTONE, GEM_CLASS, GLASS, GOLD_SYM, G_GONE, HAND, HEAD, HORN_OF_PLENTY, HUNGRY, INFRAVISION, INSHOP, INVIS, JACINTH, JADE, JASPER, JET, LANDMINE, LAND_MINE, LAST_GEM, LEASH, LOW_PM, MAGIC_FLUTE, MAGIC_LAMP, MAGIC_MARKER, MAXULEV, MIGR_APPROX_XY, MIRROR, MS_ANIMAL, MS_HUMANOID, M_AP_MONSTER, M_AP_NOTHING, NECK, NEED_UPDATE, NHW_MENU, NO_MM_FLAGS, NO_ROOM, OBJ_CONTAINED, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, OBJ_MINVENT, OBJ_ONBILL, OIL_LAMP, OPAL, OPEN, PASSES_WALLS, PAY_BROKE, PAY_BUY, PAY_CANT, PAY_SKIP, PAY_SOME, PICK_AXE, PL_NSIZ, PM_GRID_BUG, PM_KEYSTONE_KOP, PM_KOP_KAPTAIN, PM_KOP_LIEUTENANT, PM_KOP_SERGEANT, POOL, POTION_CLASS, POT_OIL, POT_WATER, P_PICK_AXE, REPAIR_DELAY, RING_CLASS, ROCK, ROOM, ROOMOFFSET, ROWNO, RUBY, SAPPHIRE, SCROLL_CLASS, SEE_INVIS, SELL_DONTSELL, SELL_NORMAL, SHOPBASE, SPBOOK_CLASS, STRANGE_OBJECT, SVALL, S_KOP, S_VAMPIRE, TELEPAT, TINNING_KIT, TOOL_CLASS, TOPAZ, TRUE, TT_PIT, WAND_CLASS, WARN_OF_MON, WEAPON_CLASS, W_QUIVER, W_SWAPWEP } from './consts.ts';

let followmsg: number;
let and_its_contents: any;
let the_contents_of: any;
let angrytexts: any;
let no_money: any;
let not_enough_money: any;
let repo: struct_repo;
let sell_response: number;
let sell_how: number;
let auto_credit: number;
let u_entered_shop$empty_shops: any;
let pick_pick$pickmovetime: number;
let append_honorific$honored: any;
let makekops$k_mndx: any;

export async function money2mon(mon: struct_monst | null, amount: number): Promise<number> {
  let ygold = findgold(G.invent);
  if (amount <= 0) {
    await impossible(S("%s payment in money2mon!"), amount ? S("negative") : S("zero"));
    return 0;
  }
  if (!ygold || ygold.quan < amount) {
    await impossible(S("Paying without %s money?"), ygold ? S("enough") : S(""));
    return 0;
  }
  if (ygold.quan > amount) {
    ygold = await splitobj(ygold, amount);
  } else if (ygold.owornmask) {
    await remove_worn_item(ygold, FALSE);
  }
  await freeinv(ygold);
  await add_to_minv(mon, ygold);
  G.context.botl = 1;
  return amount;
}

export async function money2u(mon: struct_monst | null, amount: number): Promise<void> {
  let mongold = findgold(mon.minvent);
  if (amount <= 0) {
    await impossible(S("%s payment in money2u!"), amount ? S("negative") : S("zero"));
    return;
  }
  if (!mongold || mongold.quan < amount) {
    await impossible(S("%s paying without %s money?"), await a_monnam(mon), mongold ? S("enough") : S(""));
    return;
  }
  if (mongold.quan > amount) {
    mongold = await splitobj(mongold, amount);
  }
  await obj_extract_self(mongold);
  if (!await merge_choice(G.invent, mongold) && inv_cnt(FALSE) >= 52) {
    await You(S("have no room for the money!"));
    await dropy(mongold);
  } else {
    await addinv(mongold);
    G.context.botl = 1;
  }
}

function next_shkp(shkp: struct_monst | null, withbill: number): struct_monst | null {
  for (; shkp; shkp = shkp.nmon) {
    if (shkp.mhp < 1) {
      continue;
    }
    if (shkp.isshk | 0 && (shkp.mextra.eshk.billct || !withbill)) {
      break;
    }
  }
  if (shkp) {
    if (shkp.mpeaceful) {
      if (shkp.mextra.eshk.surcharge) {
        pacify_shk(shkp);
      }
    } else {
      if (!shkp.mextra.eshk.surcharge) {
        rile_shk(shkp);
      }
    }
  }
  return shkp;
}

export async function shkgone(mtmp: struct_monst | null): Promise<void> {
  let eshk = mtmp.mextra.eshk;
  let sroom = $sat(G.rooms, eshk.shoproom - ROOMOFFSET);
  let otmp = null;
  let p = null;
  let sx = 0;
  let sy = 0;
  if (on_level(eshk.shoplevel, G.u.uz)) {
    await remove_damage(mtmp, TRUE);
    sroom.resident = null;
    if (!search_special(ANY_SHOP)) {
      G.level.flags.has_shop = 0;
    }
    for (sx = sroom.lx; sx <= sroom.hx; ++sx) {
      for (sy = sroom.ly; sy <= sroom.hy; ++sy) {
        for (otmp = G.level.objects[sx][sy]; otmp; otmp = otmp.v.v_nexthere) {
          otmp.no_charge = 0;
        }
      }
    }
    if (!!(p = strchr(P(G.u.ushops), eshk.shoproom))) {
      await setpaid(mtmp);
      eshk.bill_p = null;
      do {
        p.a[p.o] = $rd(p.add(1));
      } while ($rd((p = p.add(1))));
    }
  }
}

export function set_residency(shkp: struct_monst | null, zero_out: number): void {
  if (on_level(shkp.mextra.eshk.shoplevel, G.u.uz)) {
    G.rooms[shkp.mextra.eshk.shoproom - ROOMOFFSET].resident = zero_out ? null : shkp;
  }
}

export function replshk(mtmp: struct_monst | null, mtmp2: struct_monst | null): void {
  G.rooms[mtmp2.mextra.eshk.shoproom - ROOMOFFSET].resident = mtmp2;
  if (inhishop(mtmp) && $rd(P(G.u.ushops)) === mtmp.mextra.eshk.shoproom) {
    mtmp2.mextra.eshk.bill_p = mtmp2.mextra.eshk.bill[0];
  }
}

export function restshk(shkp: struct_monst | null, ghostly: number): void {
  if (G.u.uz.dlevel) {
    let eshkp = shkp.mextra.eshk;
    if (eshkp.bill_p !== -1000) {
      eshkp.bill_p = eshkp.bill[0];
    }
    if (ghostly) {
      assign_level(eshkp.shoplevel, G.u.uz);
      if (!shkp.mpeaceful && strncmpi(P(eshkp.customer), P(G.plname), PL_NSIZ)) {
        pacify_shk(shkp);
      }
    }
  }
}

async function clear_unpaid_obj(shkp: struct_monst | null, otmp: struct_obj | null): Promise<void> {
  if (!!otmp.cobj) {
    await clear_unpaid(shkp, otmp.cobj);
  }
  if (await onbill(otmp, shkp, TRUE)) {
    otmp.unpaid = 0;
  }
}

async function clear_unpaid(shkp: struct_monst | null, list: struct_obj | null): Promise<void> {
  while (list) {
    await clear_unpaid_obj(shkp, list);
    list = list.nobj;
  }
}

export async function setpaid(shkp: struct_monst | null): Promise<void> {
  let obj = null;
  let mtmp = null;
  await clear_unpaid(shkp, G.invent);
  await clear_unpaid(shkp, G.level.objlist);
  await clear_unpaid(shkp, G.level.buriedobjlist);
  if (G.thrownobj) {
    await clear_unpaid_obj(shkp, G.thrownobj);
  }
  if (G.kickedobj) {
    await clear_unpaid_obj(shkp, G.kickedobj);
  }
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    await clear_unpaid(shkp, mtmp.minvent);
  }
  for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
    await clear_unpaid(shkp, mtmp.minvent);
  }
  while (!!(obj = G.billobjs)) {
    await obj_extract_self(obj);
    await dealloc_obj(obj);
  }
  if (shkp) {
    shkp.mextra.eshk.billct = 0;
    shkp.mextra.eshk.credit = 0;
    shkp.mextra.eshk.debit = 0;
    shkp.mextra.eshk.loan = 0;
  }
}

function addupbill(shkp: struct_monst | null): number {
  let ct = shkp.mextra.eshk.billct;
  let bp = shkp.mextra.eshk.bill_p;
  let total = 0;
  while (ct--) {
    total += bp.price * bp.bquan;
    bp = $sadd(bp, 1);
  }
  return total;
}

async function call_kops(shkp: struct_monst | null, nearshop: number): Promise<void> {
  let nokops = 0;
  if (!shkp) {
    return;
  }
  if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
    await pline(S("An alarm sounds!"));
  }
  nokops = (G.mvitals[PM_KEYSTONE_KOP].mvflags & G_GONE && G.mvitals[PM_KOP_SERGEANT].mvflags & G_GONE && G.mvitals[PM_KOP_LIEUTENANT].mvflags & G_GONE && G.mvitals[PM_KOP_KAPTAIN].mvflags & G_GONE ? 1 : 0) << 24 >> 24;
  if (!await angry_guards(!!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) ? 1 : 0) && nokops) {
    if (G.flags.verbose && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("But no one seems to respond to it."));
    }
    return;
  }
  if (nokops) {
    return;
  }
  {
    let mm = new struct_nhcoord();
    if (nearshop) {
      if (G.flags.verbose) {
        await pline_The(S("Keystone Kops appear!"));
      }
      mm.x = G.u.ux;
      mm.y = G.u.uy;
      await makekops(mm);
      return;
    }
    if (G.flags.verbose) {
      await pline_The(S("Keystone Kops are after you!"));
    }
    mm.x = G.dnstair.sx;
    mm.y = G.dnstair.sy;
    await makekops(mm);
    mm.x = shkp.mx;
    mm.y = shkp.my;
    await makekops(mm);
  }
}

export function inside_shop(x: number, y: number): number {
  let rno = 0;
  rno = $at2(G.level.locations, x, y).roomno << 24 >> 24;
  if (rno < ROOMOFFSET || $at2(G.level.locations, x, y).edge | 0 || !(G.rooms[rno - 3].rtype >= SHOPBASE)) {
    rno = NO_ROOM;
  }
  return rno;
}

export async function u_left_shop(leavestring: Ptr | null, newlev: number): Promise<void> {
  let shkp = null;
  let eshkp = null;
  if (!leavestring.a[leavestring.o] && (!$at2(G.level.locations, G.u.ux, G.u.uy).edge || $at2(G.level.locations, G.u.ux0, G.u.uy0).edge | 0)) {
    return;
  }
  shkp = await shop_keeper($rd(P(G.u.ushops0)));
  if (!shkp || !inhishop(shkp)) {
    return;
  }
  eshkp = shkp.mextra.eshk;
  if (!eshkp.billct && !eshkp.debit) {
    return;
  }
  if (!leavestring.a[leavestring.o] && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(shkp.mpeaceful | 0 ? S("%s!  Please pay before leaving.") : S("%s!  Don't you leave without paying!"), P(G.plname));
    } else {
      await pline(S("%s %s that you need to pay before leaving%s"), await Shknam(shkp), shkp.mpeaceful | 0 ? S("points out") : S("makes it clear"), shkp.mpeaceful | 0 ? S(".") : S("!"));
    }
    return;
  }
  if (await rob_shop(shkp)) {
    await call_kops(shkp, !newlev && $at2(G.level.locations, G.u.ux0, G.u.uy0).edge | 0 ? 1 : 0);
  }
}

export async function remote_burglary(x: number, y: number): Promise<void> {
  let shkp = null;
  let eshkp = null;
  shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)));
  if (!shkp || !inhishop(shkp)) {
    return;
  }
  eshkp = shkp.mextra.eshk;
  if (!eshkp.billct && !eshkp.debit) {
    return;
  }
  if (await rob_shop(shkp)) {
    await call_kops(shkp, FALSE);
  }
}

async function rob_shop(shkp: struct_monst | null): Promise<number> {
  let eshkp = null;
  let total = 0;
  eshkp = shkp.mextra.eshk;
  await rouse_shk(shkp, TRUE);
  total = addupbill(shkp) + eshkp.debit;
  if (eshkp.credit >= total) {
    await Your(S("credit of %ld %s is used to cover your shopping bill."), eshkp.credit, await currency(eshkp.credit));
    total = 0;
  } else {
    await You(S("escaped the shop without paying!"));
    total -= eshkp.credit;
  }
  await setpaid(shkp);
  if (!total) {
    return FALSE;
  }
  eshkp.robbed += total;
  await You(S("stole %ld %s worth of merchandise."), total, await currency(total));
  if (!(G.urole.malenum === 338)) {
    adjalign(-sgn(G.u.ualign.type));
  }
  hot_pursuit(shkp);
  return TRUE;
}

async function deserted_shop(enterstring: Ptr | null): Promise<void> {
  let mtmp = null;
  let r = $sat(G.rooms, enterstring.a[enterstring.o] - ROOMOFFSET);
  let x = 0;
  let y = 0;
  let m = 0;
  let n = 0;
  for (x = r.lx; x <= r.hx; ++x) {
    for (y = r.ly; y <= r.hy; ++y) {
      if (x === G.u.ux && y === G.u.uy) {
        continue;
      }
      if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
        ++n;
        if (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data) || ((mtmp.m_ap_type & 7) === M_AP_NOTHING || (mtmp.m_ap_type & 7) === M_AP_MONSTER) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
          ++m;
        }
      }
    }
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic))) {
    ++n;
  }
  await pline(S("This shop %s %s."), m < n ? S("seems to be") : S("is"), !n ? S("deserted") : S("untended"));
}

export async function u_entered_shop(enterstring: Ptr | null): Promise<void> {
  let rt = 0;
  let shkp = null;
  let eshkp = null;
  if (!enterstring.a[enterstring.o]) {
    return;
  }
  if (!(shkp = await shop_keeper(enterstring.a[enterstring.o]))) {
    if (!strchr(P(u_entered_shop$empty_shops), enterstring.a[enterstring.o]) && !$peq(in_rooms(G.u.ux, G.u.uy, SHOPBASE), in_rooms(G.u.ux0, G.u.uy0, SHOPBASE))) {
      await deserted_shop(enterstring);
    }
    strcpy(P(u_entered_shop$empty_shops), P(G.u.ushops));
    G.u.ushops[0] = 0;
    return;
  }
  eshkp = shkp.mextra.eshk;
  if (!inhishop(shkp)) {
    eshkp.bill_p = -1000;
    if (!strchr(P(u_entered_shop$empty_shops), enterstring.a[enterstring.o])) {
      await deserted_shop(enterstring);
    }
    strcpy(P(u_entered_shop$empty_shops), P(G.u.ushops));
    G.u.ushops[0] = 0;
    return;
  }
  eshkp.bill_p = eshkp.bill[0];
  if ((!eshkp.visitct || $rd(P(eshkp.customer))) && strncmpi(P(eshkp.customer), P(G.plname), PL_NSIZ)) {
    eshkp.visitct = 0;
    eshkp.following = 0;
    strncpy(P(eshkp.customer), P(G.plname), PL_NSIZ);
    pacify_shk(shkp);
  }
  if (shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13 || eshkp.following) {
    return;
  }
  if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) {
    await pline(S("%s senses your presence."), await Shknam(shkp));
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("Invisible customers are not welcome!"));
    } else {
      await pline(S("%s stands firm as if %s knows you are there."), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].he);
    }
    return;
  }
  rt = G.rooms[enterstring.a[enterstring.o] - ROOMOFFSET].rtype;
  if (!shkp.mpeaceful) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("So, %s, you dare return to %s %s?!"), P(G.plname), s_suffix(await shkname(shkp)), G.shtypes[rt - SHOPBASE].name);
    } else {
      await pline(S("%s seems %s over your return to %s %s!"), await Shknam(shkp), angrytexts[rn2(Math.trunc(24 / 8) | 0)], G.genders[pronoun_gender(shkp, 1)].his, G.shtypes[rt - SHOPBASE].name);
    }
  } else if (eshkp.robbed) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s mutters imprecations against shoplifters."), await Shknam(shkp));
    } else {
      await pline(S("%s is combing through %s inventory list."), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].his);
    }
  } else {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("%s, %s!  Welcome%s to %s %s!"), Hello(shkp), P(G.plname), eshkp.visitct++ ? S(" again") : S(""), s_suffix(await shkname(shkp)), G.shtypes[rt - SHOPBASE].name);
    } else {
      await You(S("enter %s %s%s!"), s_suffix(await shkname(shkp)), G.shtypes[rt - SHOPBASE].name, eshkp.visitct++ ? S(" again") : S(""));
    }
  }
  if (!inside_shop(G.u.ux, G.u.uy)) {
    let should_block = 0;
    let cnt = 0;
    let tool = null;
    let pick = carrying(PICK_AXE);
    let mattock = carrying(DWARVISH_MATTOCK);
    if (pick || mattock) {
      cnt = 1;
      if (pick && mattock) {
        tool = S("digging tool");
        cnt = 2;
      } else if (pick) {
        tool = S("pick-axe");
        while (!!(pick = pick.nobj)) {
          if (pick.otyp === PICK_AXE) {
            ++cnt;
          }
        }
      } else {
        tool = S("mattock");
        while (!!(mattock = mattock.nobj)) {
          if (mattock.otyp === DWARVISH_MATTOCK) {
            ++cnt;
          }
        }
        if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
          await discover_object(50, 1, 1);
        }
      }
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(shkp.mpeaceful | 0 ? S("Will you please leave your %s%s outside?") : S("Leave the %s%s outside."), tool, cnt === 1 ? S("") : S("s"));
      } else {
        await pline(S("%s %s to let you in with your %s%s."), await Shknam(shkp), shkp.mpeaceful | 0 ? S("is hesitant") : S("refuses"), tool, cnt === 1 ? S("") : S("s"));
      }
      should_block = TRUE;
    } else if (G.u.usteed) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(shkp.mpeaceful | 0 ? S("Will you please leave %s outside?") : S("Leave %s outside."), await y_monnam(G.u.usteed));
      } else {
        await pline(S("%s %s to let you in while you're riding %s."), await Shknam(shkp), shkp.mpeaceful | 0 ? S("doesn't want") : S("refuses"), await y_monnam(G.u.usteed));
      }
      should_block = TRUE;
    } else {
      should_block = ((G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic) && (sobj_at(PICK_AXE, G.u.ux, G.u.uy) || sobj_at(DWARVISH_MATTOCK, G.u.ux, G.u.uy)) ? 1 : 0) << 24 >> 24;
    }
    if (should_block) {
      await dochug(shkp);
    }
  }
  return;
}

export async function pick_pick(obj: struct_obj | null): Promise<void> {
  let shkp = null;
  if (obj.unpaid | 0 || !((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_PICK_AXE)) {
    return;
  }
  shkp = await shop_keeper($rd(P(G.u.ushops)));
  if (shkp && inhishop(shkp)) {
    if (G.moves !== pick_pick$pickmovetime) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(S("You sneaky %s!  Get out of here with that pick!"), await cad(FALSE));
      } else {
        await pline(S("%s %s your pick!"), await Shknam(shkp), (shkp.data.mflags1 & 4096) >>> 0 === 0 ? S("glares at") : S("is dismayed because of"));
      }
    }
    pick_pick$pickmovetime = G.moves;
  }
}

export async function same_price(obj1: struct_obj | null, obj2: struct_obj | null): Promise<number> {
  let shkp1 = null;
  let shkp2 = null;
  let bp1 = null;
  let bp2 = null;
  let are_mergable = FALSE;
  for (shkp1 = next_shkp(G.level.monlist, TRUE); shkp1; shkp1 = next_shkp(shkp1.nmon, TRUE)) {
    if (!!(bp1 = await onbill(obj1, shkp1, TRUE))) {
      break;
    }
  }
  if (shkp1 && !!(bp2 = await onbill(obj2, shkp1, TRUE))) {
    shkp2 = shkp1;
  } else {
    for (shkp2 = next_shkp(G.level.monlist, TRUE); shkp2; shkp2 = next_shkp(shkp2.nmon, TRUE)) {
      if (!!(bp2 = await onbill(obj2, shkp2, TRUE))) {
        break;
      }
    }
  }
  if (!bp1 || !bp2) {
    await impossible(S("same_price: object wasn't on any bill!"));
  } else {
    are_mergable = (shkp1 === shkp2 && bp1.price === bp2.price ? 1 : 0) << 24 >> 24;
  }
  return are_mergable;
}

function shop_debt(eshkp: struct_eshk | null): number {
  let bp = null;
  let ct = 0;
  let debt = eshkp.debit;
  for (bp = eshkp.bill_p, ct = eshkp.billct; ct > 0; bp = $sadd(bp, 1), --ct) {
    debt += bp.price * bp.bquan;
  }
  return debt;
}

export async function shopper_financial_report(): Promise<void> {
  let shkp = null;
  let this_shkp = await shop_keeper(inside_shop(G.u.ux, G.u.uy));
  let eshkp = null;
  let amt = 0;
  let pass = 0;
  eshkp = this_shkp ? this_shkp.mextra.eshk : null;
  if (eshkp && !(eshkp.credit || shop_debt(eshkp))) {
    await You(S("have no credit or debt in here."));
    this_shkp = null;
  }
  for (pass = this_shkp ? 0 : 1; pass <= 1; ++pass) {
    for (shkp = next_shkp(G.level.monlist, FALSE); shkp; shkp = next_shkp(shkp.nmon, FALSE)) {
      if ((shkp !== this_shkp ? 1 : 0) ^ pass) {
        continue;
      }
      eshkp = shkp.mextra.eshk;
      if ((amt = eshkp.credit) !== 0) {
        await You(S("have %ld %s credit at %s %s."), amt, await currency(amt), s_suffix(await shkname(shkp)), G.shtypes[eshkp.shoptype - SHOPBASE].name);
      } else if (shkp === this_shkp) {
        await You(S("have no credit in here."));
      }
      if ((amt = shop_debt(eshkp)) !== 0) {
        await You(S("owe %s %ld %s."), await shkname(shkp), amt, await currency(amt));
      } else if (shkp === this_shkp) {
        await You(S("don't owe any money here."));
      }
    }
  }
}

export function inhishop(mtmp: struct_monst | null): number {
  let eshkp = mtmp.mextra.eshk;
  return strchr(in_rooms(mtmp.mx, mtmp.my, SHOPBASE), eshkp.shoproom) && on_level(eshkp.shoplevel, G.u.uz) ? 1 : 0;
}

export async function shop_keeper(rmno: number): Promise<struct_monst | null> {
  let shkp = null;
  shkp = rmno >= ROOMOFFSET ? G.rooms[rmno - ROOMOFFSET].resident : null;
  if (shkp) {
    if (shkp.mextra && shkp.mextra.eshk) {
      if (shkp.mpeaceful) {
        if (shkp.mextra.eshk.surcharge) {
          pacify_shk(shkp);
        }
      } else {
        if (!shkp.mextra.eshk.surcharge) {
          rile_shk(shkp);
        }
      }
    } else {
      await impossible(S("%s? (rmno=%d, rtype=%d, mnum=%d, \"%s\")"), shkp.isshk | 0 ? S("shopkeeper career change") : S("shop resident not shopkeeper"), rmno, G.rooms[rmno - ROOMOFFSET].rtype, shkp.mnum, shkp.mextra && shkp.mextra.mname ? shkp.mextra.mname : S("anonymous"));
      return null;
    }
  }
  return shkp;
}

export function tended_shop(sroom: struct_mkroom | null): number {
  let mtmp = sroom.resident;
  return (!mtmp ? FALSE : inhishop(mtmp) << 24 >> 24) << 24 >> 24;
}

async function onbill(obj: struct_obj | null, shkp: struct_monst | null, silent: number): Promise<struct_bill_x | null> {
  if (shkp) {
    let bp = shkp.mextra.eshk.bill_p;
    let ct = shkp.mextra.eshk.billct;
    while (--ct >= 0) {
      if (bp.bo_id === obj.o_id) {
        if (!obj.unpaid) {
          await pline(S("onbill: paid obj on bill?"));
        }
        return bp;
      } else {
        bp = $sadd(bp, 1);
      }
    }
  }
  if (obj.unpaid | 0 && !silent) {
    await pline(S("onbill: unpaid obj not on bill?"));
  }
  return null;
}

export function is_unpaid(obj: struct_obj | null): number {
  return (obj.unpaid | 0 || !!obj.cobj && count_unpaid(obj.cobj) ? 1 : 0) << 24 >> 24;
}

export async function delete_contents(obj: struct_obj | null): Promise<void> {
  let curr = null;
  while (!!(curr = obj.cobj)) {
    await obj_extract_self(curr);
    await obfree(curr, null);
  }
}

export async function obfree(obj: struct_obj | null, merge: struct_obj | null): Promise<void> {
  let bp = null;
  let bpm = null;
  let shkp = null;
  if (obj.otyp === LEASH && obj.corpsenm) {
    o_unleash(obj);
  }
  if (obj.oclass === FOOD_CLASS) {
    await food_disappears(obj);
  }
  if (obj.oclass === SPBOOK_CLASS) {
    book_disappears(obj);
  }
  if (!!obj.cobj) {
    await delete_contents(obj);
  }
  if (obj.otyp >= 189 && obj.otyp <= 195) {
    maybe_reset_pick(obj);
  }
  shkp = null;
  if (obj.unpaid) {
    for (shkp = next_shkp(G.level.monlist, TRUE); shkp; shkp = next_shkp(shkp.nmon, TRUE)) {
      if (await onbill(obj, shkp, TRUE)) {
        break;
      }
    }
  }
  if (!shkp) {
    shkp = await shop_keeper($rd(P(G.u.ushops)));
  }
  if (!!(bp = await onbill(obj, shkp, FALSE))) {
    if (!merge) {
      bp.useup = 1;
      obj.unpaid = 0;
      await add_to_billobjs(obj);
      return;
    }
    bpm = await onbill(merge, shkp, FALSE);
    if (!bpm) {
      await impossible(S("obfree: not on bill, %s = (%d,%d,%ld,%d) (%d,%d,%ld,%d)??"), S("otyp,where,quan,unpaid"), obj.otyp, obj.where, obj.quan, obj.unpaid | 0 ? 1 : 0, merge.otyp, merge.where, merge.quan, merge.unpaid | 0 ? 1 : 0);
      return;
    } else {
      bpm.bquan += bp.bquan;
      --shkp.mextra.eshk.billct;
      bp.$cp($sadd(shkp.mextra.eshk.bill_p, shkp.mextra.eshk.billct));
    }
  } else {
    if (merge && oid_price_adjustment(obj, obj.o_id) > oid_price_adjustment(merge, merge.o_id)) {
      merge.o_id = obj.o_id;
    }
  }
  if (obj.owornmask) {
    await impossible(S("obfree: deleting worn obj (%d: %ld)"), obj.otyp, obj.owornmask);
    await setnotworn(obj);
  }
  await dealloc_obj(obj);
}

async function check_credit(tmp: number, shkp: struct_monst | null): Promise<number> {
  let credit = shkp.mextra.eshk.credit;
  if (credit === 0) {
    ;
  } else if (credit >= tmp) {
    await pline_The(S("price is deducted from your credit."));
    shkp.mextra.eshk.credit -= tmp;
    tmp = 0;
  } else {
    await pline_The(S("price is partially covered by your credit."));
    shkp.mextra.eshk.credit = 0;
    tmp -= credit;
  }
  return tmp;
}

async function pay(tmp: number, shkp: struct_monst | null): Promise<void> {
  let robbed = shkp.mextra.eshk.robbed;
  let balance = tmp <= 0 ? tmp : await check_credit(tmp, shkp);
  if (balance > 0) {
    await money2mon(shkp, balance);
  } else if (balance < 0) {
    await money2u(shkp, -balance);
  }
  G.context.botl = 1;
  if (robbed) {
    robbed -= tmp;
    if (robbed < 0) {
      robbed = 0;
    }
    shkp.mextra.eshk.robbed = robbed;
  }
}

export async function home_shk(shkp: struct_monst | null, killkops: number): Promise<void> {
  let x = shkp.mextra.eshk.shk.x;
  let y = shkp.mextra.eshk.shk.y;
  await mnearto(shkp, x, y, TRUE);
  G.level.flags.has_shop = 1;
  if (killkops) {
    await kops_gone(TRUE);
    pacify_guards();
  }
  await after_shk_move(shkp);
}

function angry_shk_exists(): number {
  let shkp = null;
  for (shkp = next_shkp(G.level.monlist, FALSE); shkp; shkp = next_shkp(shkp.nmon, FALSE)) {
    if (!shkp.mpeaceful) {
      return TRUE;
    }
  }
  return FALSE;
}

function pacify_shk(shkp: struct_monst | null): void {
  shkp.mpeaceful = (TRUE) & 1;
  if (shkp.mextra.eshk.surcharge) {
    let bp = shkp.mextra.eshk.bill_p;
    let ct = shkp.mextra.eshk.billct;
    shkp.mextra.eshk.surcharge = FALSE;
    while (ct-- > 0) {
      let reduction = Math.trunc((bp.price + 3) / 4);
      bp.price -= reduction;
      bp = $sadd(bp, 1);
    }
  }
}

function rile_shk(shkp: struct_monst | null): void {
  shkp.mpeaceful = (FALSE) & 1;
  if (!shkp.mextra.eshk.surcharge) {
    let bp = shkp.mextra.eshk.bill_p;
    let ct = shkp.mextra.eshk.billct;
    shkp.mextra.eshk.surcharge = TRUE;
    while (ct-- > 0) {
      let surcharge = Math.trunc((bp.price + 2) / 3);
      bp.price += surcharge;
      bp = $sadd(bp, 1);
    }
  }
}

async function rouse_shk(shkp: struct_monst | null, verbosely: number): Promise<void> {
  if (!shkp.mcanmove || shkp.msleeping | 0) {
    if (verbosely && ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) || (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data)))) {
      await pline(S("%s %s."), await Shknam(shkp), shkp.msleeping | 0 ? S("wakes up") : S("can move again"));
    }
    shkp.msleeping = 0;
    shkp.mfrozen = 0;
    shkp.mcanmove = 1;
  }
}

export async function make_happy_shk(shkp: struct_monst | null, silentkops: number): Promise<void> {
  let wasmad = (!shkp.mpeaceful ? 1 : 0) << 24 >> 24;
  let eshkp = shkp.mextra.eshk;
  pacify_shk(shkp);
  eshkp.following = 0;
  eshkp.robbed = 0;
  if (!(G.urole.malenum === 338)) {
    adjalign(sgn(G.u.ualign.type));
  }
  if (!inhishop(shkp)) {
    let shk_nam = new Int8Array(256);
    let vanished = ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) ? 1 : 0) << 24 >> 24;
    strcpy(P(shk_nam), await shkname(shkp));
    if (on_level(eshkp.shoplevel, G.u.uz)) {
      await home_shk(shkp, FALSE);
      if ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected)) {
        vanished = FALSE;
      }
    } else {
      if (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data)) {
        vanished = TRUE;
      }
      await mdrop_special_objs(shkp);
      await migrate_to_level(shkp, ledger_no(eshkp.shoplevel), MIGR_APPROX_XY, eshkp.shd);
      eshkp.dismiss_kops = TRUE;
    }
    if (vanished) {
      await pline(S("Satisfied, %s suddenly disappears!"), P(shk_nam));
    }
  } else if (wasmad) {
    await pline(S("%s calms down."), await Shknam(shkp));
  }
  await make_happy_shoppers(silentkops);
}

export async function make_happy_shoppers(silentkops: number): Promise<void> {
  if (!angry_shk_exists()) {
    await kops_gone(silentkops);
    pacify_guards();
  }
}

export function hot_pursuit(shkp: struct_monst | null): void {
  if (!shkp.isshk) {
    return;
  }
  rile_shk(shkp);
  strncpy(P(shkp.mextra.eshk.customer), P(G.plname), PL_NSIZ);
  shkp.mextra.eshk.following = 1;
}

export async function make_angry_shk(shkp: struct_monst | null, ox: number, oy: number): Promise<void> {
  let eshkp = shkp.mextra.eshk;
  if (eshkp.billct || eshkp.debit || eshkp.loan || eshkp.credit) {
    eshkp.robbed += addupbill(shkp) + eshkp.debit + eshkp.loan;
    eshkp.robbed -= eshkp.credit;
    if (eshkp.robbed < 0) {
      eshkp.robbed = 0;
    }
    await setpaid(shkp);
  }
  await pline(S("%s %s!"), await Shknam(shkp), !!shkp.mpeaceful ? S("gets angry") : S("is furious"));
  hot_pursuit(shkp);
}

function cheapest_item(shkp: struct_monst | null): number {
  let ct = shkp.mextra.eshk.billct;
  let bp = shkp.mextra.eshk.bill_p;
  let gmin = bp.price * bp.bquan;
  while (ct--) {
    if (bp.price * bp.bquan < gmin) {
      gmin = bp.price * bp.bquan;
    }
    bp = $sadd(bp, 1);
  }
  return gmin;
}

export async function dopay(): Promise<number> {
  let $g = 0;
  let eshkp = null;
  let shkp = null;
  let nxtm = null;
  let resident = null;
  let ltmp = 0;
  let umoney = 0;
  let pass = 0;
  let tmp = 0;
  let sk = 0;
  let seensk = 0;
  let paid = 0;
  let stashed_gold = 0;
  let itemize = 0;
  let iprompt = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      sk = 0;
      seensk = 0;
      paid = FALSE;
      stashed_gold = (hidden_gold() > 0 ? 1 : 0) << 24 >> 24;
      G.multi = 0;
      nxtm = resident = null;
      for (shkp = next_shkp(G.level.monlist, FALSE); shkp; shkp = next_shkp(shkp.nmon, FALSE)) {
        ++sk;
        if (!shkp.mpeaceful && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 2) {
          nxtm = shkp;
        }
        if ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) || (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data))) {
          ++seensk;
        }
        if (inhishop(shkp) && $rd(P(G.u.ushops)) === shkp.mextra.eshk.shoproom) {
          resident = shkp;
        }
      }
      if (nxtm) {
        shkp = nxtm;
        { $g = 1; continue $L; }
      }
      if (!sk && (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) || (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic)) || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !seensk) {
        await There(S("appears to be no shopkeeper here to receive your payment."));
        return 0;
      }
      if (!seensk) {
        await You_cant(S("see..."));
        return 0;
      }
      if (sk === 1 && resident) {
        shkp = resident;
        { $g = 1; continue $L; }
      }
      if (seensk === 1) {
        for (shkp = next_shkp(G.level.monlist, FALSE); shkp; shkp = next_shkp(shkp.nmon, FALSE)) {
          if ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) || (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data))) {
            break;
          }
        }
        if (shkp !== resident && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) > 2) {
          await pline(S("%s is not near enough to receive your payment."), await Shknam(shkp));
          return 0;
        }
      } else {
        let mtmp = null;
        let cc = new struct_nhcoord();
        let cx = 0;
        let cy = 0;
        await pline(S("Pay whom?"));
        cc.x = G.u.ux;
        cc.y = G.u.uy;
        if (await getpos(cc, TRUE, S("the creature you want to pay")) < 0) {
          return 0;
        }
        cx = cc.x;
        cy = cc.y;
        if (cx < 0) {
          await pline(S("Try again..."));
          return 0;
        }
        if (G.u.ux === cx && G.u.uy === cy) {
          await You(S("are generous to yourself."));
          return 0;
        }
        mtmp = !!G.level.monsters[cx][cy] ? G.level.monsters[cx][cy] : null;
        if (!($rd(G.viz_array.a[G.viz_array.o + cy], cx) & 2) && (!mtmp || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))))) {
          await You(S("can't %s anyone there."), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("see") : S("sense"));
          return 0;
        }
        if (!mtmp) {
          await There(S("is no one there to receive your payment."));
          return 0;
        }
        if (!mtmp.isshk) {
          await pline(S("%s is not interested in your payment."), await Monnam(mtmp));
          return 0;
        }
        if (mtmp !== resident && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) > 2) {
          await pline(S("%s is too far to receive your payment."), await Shknam(mtmp));
          return 0;
        }
        shkp = mtmp;
      }
      if (!shkp) {
        do {
          if (await debugcore(S("shk.c"), 1)) {
            await pline(S("dopay: null shkp."));
          }
        } while (0);
        return 0;
      }
    case 1: // proceed
      eshkp = shkp.mextra.eshk;
      ltmp = eshkp.robbed;
      if (ltmp || eshkp.billct || eshkp.debit) {
        await rouse_shk(shkp, TRUE);
      }
      if (!shkp.mcanmove || shkp.msleeping | 0) {
        await pline(S("%s %s."), await Shknam(shkp), rn2(2) ? S("seems to be napping") : S("doesn't respond"));
        return 0;
      }
      if (shkp !== resident && shkp.mpeaceful | 0) {
        umoney = money_cnt(G.invent);
        if (!ltmp) {
          await You(S("do not owe %s anything."), await shkname(shkp));
        } else if (!umoney) {
          await You(S("%shave no money."), stashed_gold ? S("seem to ") : S(""));
          if (stashed_gold) {
            await pline(S("But you have some gold stashed away."));
          }
        } else {
          if (umoney > ltmp) {
            await You(S("give %s the %ld gold piece%s %s asked for."), await shkname(shkp), ltmp, ltmp === 1 ? S("") : S("s"), G.genders[pronoun_gender(shkp, 1)].he);
            await pay(ltmp, shkp);
          } else {
            await You(S("give %s all your%s gold."), await shkname(shkp), stashed_gold ? S(" openly kept") : S(""));
            await pay(umoney, shkp);
            if (stashed_gold) {
              await pline(S("But you have hidden gold!"));
            }
          }
          if (umoney < Math.trunc(ltmp / 2) || umoney < ltmp && stashed_gold) {
            await pline(S("Unfortunately, %s doesn't look satisfied."), G.genders[pronoun_gender(shkp, 1)].he);
          } else {
            await make_happy_shk(shkp, FALSE);
          }
        }
        return 1;
      }
      if (!eshkp.billct && !eshkp.debit) {
        umoney = money_cnt(G.invent);
        if (!ltmp && shkp.mpeaceful | 0) {
          await You(S("do not owe %s anything."), await shkname(shkp));
          if (!umoney) {
            await pline(P(no_money), stashed_gold ? S(" seem to") : S(""));
          }
        } else if (ltmp) {
          await pline(S("%s is after blood, not money!"), await shkname(shkp));
          if (umoney < Math.trunc(ltmp / 2) || umoney < ltmp && stashed_gold) {
            if (!umoney) {
              await pline(P(no_money), stashed_gold ? S(" seem to") : S(""));
            } else {
              await pline(P(not_enough_money), G.genders[pronoun_gender(shkp, 1)].him);
            }
            return 1;
          }
          await pline(S("But since %s shop has been robbed recently,"), G.genders[pronoun_gender(shkp, 1)].his);
          await pline(S("you %scompensate %s for %s losses."), umoney < ltmp ? S("partially ") : S(""), await shkname(shkp), G.genders[pronoun_gender(shkp, 1)].his);
          await pay(umoney < ltmp ? umoney : ltmp, shkp);
          await make_happy_shk(shkp, FALSE);
        } else {
          await pline(S("%s is after your hide, not your money!"), await Shknam(shkp));
          if (umoney < 1000) {
            if (!umoney) {
              await pline(P(no_money), stashed_gold ? S(" seem to") : S(""));
            } else {
              await pline(P(not_enough_money), G.genders[pronoun_gender(shkp, 1)].him);
            }
            return 1;
          }
          await You(S("try to appease %s by giving %s 1000 gold pieces."), (shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) || (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data)) ? await x_monnam(shkp, ARTICLE_THE, S("angry"), 0, FALSE) : await shkname(shkp), G.genders[pronoun_gender(shkp, 1)].him);
          await pay(1000, shkp);
          if (strncmp(P(eshkp.customer), P(G.plname), PL_NSIZ) || rn2(3)) {
            await make_happy_shk(shkp, FALSE);
          } else {
            await pline(S("But %s is as angry as ever."), await shkname(shkp));
          }
        }
        return 1;
      }
      if (shkp !== resident) {
        await impossible(S("dopay: not to shopkeeper?"));
        if (resident) {
          await setpaid(resident);
        }
        return 0;
      }
      if (eshkp.debit) {
        let dtmp = eshkp.debit;
        let loan = eshkp.loan;
        let sbuf = new Int8Array(256);
        umoney = money_cnt(G.invent);
        sprintf(P(sbuf), S("You owe %s %ld %s "), await shkname(shkp), dtmp, await currency(dtmp));
        if (loan) {
          if (loan === dtmp) {
            strcat(P(sbuf), S("you picked up in the store."));
          } else {
            strcat(P(sbuf), S("for gold picked up and the use of merchandise."));
          }
        } else {
          strcat(P(sbuf), S("for the use of merchandise."));
        }
        await pline(S("%s"), P(sbuf));
        if (umoney + eshkp.credit < dtmp) {
          await pline(S("But you don't%s have enough gold%s."), stashed_gold ? S(" seem to") : S(""), eshkp.credit ? S(" or credit") : S(""));
          return 1;
        } else {
          if (eshkp.credit >= dtmp) {
            eshkp.credit -= dtmp;
            eshkp.debit = 0;
            eshkp.loan = 0;
            await Your(S("debt is covered by your credit."));
          } else if (!eshkp.credit) {
            await money2mon(shkp, dtmp);
            eshkp.debit = 0;
            eshkp.loan = 0;
            await You(S("pay that debt."));
            G.context.botl = 1;
          } else {
            dtmp -= eshkp.credit;
            eshkp.credit = 0;
            await money2mon(shkp, dtmp);
            eshkp.debit = 0;
            eshkp.loan = 0;
            await pline(S("That debt is partially offset by your credit."));
            await You(S("pay the remainder."));
            G.context.botl = 1;
          }
          paid = TRUE;
        }
      }
      if (!eshkp.billct) { $g = 3; continue $L; }
      umoney = money_cnt(G.invent);
      if (!umoney && !eshkp.credit) {
        await You(S("%shave no money or credit%s."), stashed_gold ? S("seem to ") : S(""), paid ? S(" left") : S(""));
        return 0;
      }
      if (umoney + eshkp.credit < cheapest_item(shkp)) {
        await You(S("don't have enough money to buy%s the item%s you picked."), eshkp.billct > 1 ? S(" any of") : S(""), eshkp.billct === 1 ? S("") : S("s"));
        if (stashed_gold) {
          await pline(S("Maybe you have some gold stashed away?"));
        }
        return 0;
      }
      iprompt = eshkp.billct > 1 ? await yn_function(S("Itemized billing?"), P(G.ynqchars), 113) : 121;
      itemize = (iprompt === 121 ? 1 : 0) << 24 >> 24;
      if (iprompt === 113) {
        { $g = 2; continue $L; }
      }
      for (pass = 0; pass <= 1; ++pass) {
        tmp = 0;
        while (tmp < eshkp.billct) {
          const otmp = [null];
          let bp = $sadd(eshkp.bill_p, tmp);
          if (!!(otmp[0] = bp_to_obj(bp))) {
            if (bp.useup) {
              otmp[0].quan = bp.bquan;
            }
          } else {
            await impossible(S("Shopkeeper administration out of order."));
            await setpaid(shkp);
            return 1;
          }
          if (pass === bp.useup && otmp[0].quan === bp.bquan) {
            ++tmp;
          } else {
            switch (await dopayobj(shkp, bp, P(otmp, 0), pass, itemize)) {
            case 0:
              return 1;
            case -2:
              paid = TRUE;
              { $g = 2; continue $L; }
            case -1:
              ++tmp;
              continue;
            case 2:
              paid = TRUE;
              if (itemize) {
                await bot();
              }
              continue;
            case 1:
              paid = TRUE;
              break;
            }
            if (itemize) {
              await bot();
            }
            bp.$cp($sadd(eshkp.bill_p, --eshkp.billct));
          }
        }
      }
    case 2: // thanks
      if (!itemize) {
        update_inventory();
      }
    case 3:
      if (!!shkp.mpeaceful && paid) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
          await verbalize(S("Thank you for shopping in %s %s!"), s_suffix(await shkname(shkp)), G.shtypes[eshkp.shoptype - SHOPBASE].name);
        } else {
          await pline(S("%s nods appreciatively at you for shopping in %s %s!"), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].his, G.shtypes[eshkp.shoptype - SHOPBASE].name);
        }
      }
      return 1;
    }
    break;
  }
}

async function dopayobj(shkp: struct_monst | null, bp: struct_bill_x | null, obj_p: Ptr | null, which: number, itemize: number): Promise<number> {
  let obj = obj_p.a[obj_p.o];
  let ltmp = 0;
  let quan = 0;
  let save_quan = 0;
  let umoney = money_cnt(G.invent);
  let buy = 0;
  let stashed_gold = (hidden_gold() > 0 ? 1 : 0) << 24 >> 24;
  let consumed = (which === 0 ? 1 : 0) << 24 >> 24;
  if (!obj.unpaid && !bp.useup) {
    await impossible(S("Paid object on bill??"));
    return PAY_BUY;
  }
  if (itemize && umoney + shkp.mextra.eshk.credit === 0) {
    await You(S("%shave no money or credit left."), stashed_gold ? S("seem to ") : S(""));
    return PAY_BROKE;
  }
  save_quan = obj.quan;
  if (consumed) {
    quan = bp.bquan;
    if (quan > obj.quan) {
      quan -= obj.quan;
    }
  } else {
    quan = obj.quan;
  }
  obj.quan = quan;
  obj.unpaid = 0;
  ++G.iflags.suppress_price;
  ltmp = bp.price * quan;
  buy = PAY_BUY;
  if (itemize) {
    let qbuf = new Int8Array(256);
    let qsfx = new Int8Array(256);
    sprintf(P(qsfx), S(" for %ld %s.  Pay?"), ltmp, await currency(ltmp));
    await safe_qbuf(P(qbuf), null, P(qsfx), obj, quan === 1 ? Doname2 : doname, ansimpleoname, quan === 1 ? S("that") : S("those"));
    if (await yn_function(P(qbuf), P(G.ynchars), 110) === 110) {
      buy = PAY_SKIP;
    } else if (quan < bp.bquan && !consumed) {
      obj.quan = bp.bquan - save_quan;
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(S("%s for the other %s before buying %s."), !shkp.mpeaceful ? S("Pay") : S("Please pay"), await simpleonames(obj), save_quan > 1 ? S("these") : S("this one"));
      } else {
        await pline(S("%s %s%s your bill for the other %s first."), await Shknam(shkp), !shkp.mpeaceful ? S("angrily ") : S(""), (shkp.data.mflags1 & 24576) >>> 0 === 24576 ? S("motions to") : S("points out"), await simpleonames(obj));
      }
      buy = PAY_SKIP;
    }
  }
  if (buy === PAY_BUY && umoney + shkp.mextra.eshk.credit < ltmp) {
    await You(S("don't%s have gold%s enough to pay for %s."), stashed_gold ? S(" seem to") : S(""), shkp.mextra.eshk.credit > 0 ? S(" or credit") : S(""), await thesimpleoname(obj));
    buy = itemize ? PAY_SKIP : PAY_CANT;
  }
  if (buy !== PAY_BUY) {
    obj.quan = save_quan;
    obj.unpaid = 1;
    --G.iflags.suppress_price;
    return buy;
  }
  await pay(ltmp, shkp);
  await shk_names_obj(shkp, obj, consumed ? S("paid for %s at a cost of %ld gold piece%s.%s") : S("bought %s for %ld gold piece%s.%s"), ltmp, S(""));
  obj.quan = save_quan;
  if (consumed) {
    if (quan !== bp.bquan) {
      bp.bquan = obj.quan;
      obj.unpaid = 1;
      bp.useup = 0;
      buy = PAY_SOME;
    } else {
      await obj_extract_self(obj);
      await dealloc_obj(obj);
      obj_p.a[obj_p.o] = null;
    }
  } else if (itemize) {
    update_inventory();
  }
  --G.iflags.suppress_price;
  return buy;
}

export async function paybill(croaked: number, silently: number): Promise<number> {
  let mtmp = null;
  let mtmp2 = null;
  let firstshk = null;
  let resident = null;
  let creditor = null;
  let hostile = null;
  let localshk = null;
  let eshkp = null;
  let taken = FALSE;
  let local = 0;
  let numsk = 0;
  if (croaked < 0) {
    return FALSE;
  }
  repo.location.x = repo.location.y = 0;
  repo.shopkeeper = null;
  resident = creditor = hostile = localshk = null;
  for (mtmp = next_shkp(G.level.monlist, FALSE); mtmp; mtmp = next_shkp(mtmp2, FALSE)) {
    mtmp2 = mtmp.nmon;
    eshkp = mtmp.mextra.eshk;
    local = on_level(eshkp.shoplevel, G.u.uz);
    if (local && strchr(P(G.u.ushops), eshkp.shoproom)) {
      if (!resident || eshkp.billct || eshkp.debit || eshkp.robbed) {
        resident = mtmp;
      }
    } else if (eshkp.billct || eshkp.debit || eshkp.robbed) {
      if (!creditor) {
        creditor = mtmp;
      }
    } else if (eshkp.following || !mtmp.mpeaceful) {
      if (!hostile) {
        hostile = mtmp;
      }
    } else if (local) {
      if (!localshk) {
        localshk = mtmp;
      }
    }
  }
  firstshk = resident ? resident : creditor ? creditor : hostile ? hostile : localshk;
  if (firstshk) {
    ++numsk;
    taken = await inherits(firstshk, numsk, croaked, silently);
  }
  for (mtmp = next_shkp(G.level.monlist, FALSE); mtmp; mtmp = next_shkp(mtmp2, FALSE)) {
    mtmp2 = mtmp.nmon;
    eshkp = mtmp.mextra.eshk;
    local = on_level(eshkp.shoplevel, G.u.uz);
    if (mtmp !== firstshk) {
      ++numsk;
      taken = (taken | await inherits(mtmp, numsk, croaked, silently)) << 24 >> 24;
    }
    if (!local) {
      await mongone(mtmp);
    }
  }
  return taken;
}

async function inherits(shkp: struct_monst | null, numsk: number, croaked: number, silently: number): Promise<number> {
  let $g = 0;
  let loss = 0;
  let umoney = 0;
  let eshkp = null;
  let take = 0;
  let taken = 0;
  let save_minvis = 0;
  let roomno = 0;
  let takes = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      loss = 0;
      eshkp = shkp.mextra.eshk;
      take = FALSE;
      taken = FALSE;
      save_minvis = shkp.minvis;
      roomno = $rd(P(G.u.ushops));
      takes = new Int8Array(256);
      shkp.minvis = 0;
      if (numsk > 1) {
        if ($rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 && croaked && !silently) {
          takes[0] = 0;
          if ((shkp.data.mflags1 & 32768) >>> 0 === 0 && !rn2(2)) {
            sprintf(P(takes), S(", shakes %s %s,"), G.genders[pronoun_gender(shkp, 1)].his, mbodypart(shkp, HEAD));
          }
          await pline(S("%s %slooks at your corpse%s and %s."), await Shknam(shkp), !shkp.mcanmove || shkp.msleeping | 0 ? S("wakes up, ") : S(""), P(takes), !inhishop(shkp) ? S("disappears") : S("sighs"));
        }
        await rouse_shk(shkp, FALSE);
        taken = (roomno === eshkp.shoproom ? 1 : 0) << 24 >> 24;
        { $g = 1; continue $L; }
      }
      if (roomno === eshkp.shoproom && inhishop(shkp) && !eshkp.billct && !eshkp.robbed && !eshkp.debit && shkp.mpeaceful | 0 && !eshkp.following && G.u.ugrave_arise < LOW_PM) {
        taken = (!!G.invent ? 1 : 0) << 24 >> 24;
        if (taken && !silently) {
          await pline(S("%s gratefully inherits all your possessions."), await Shknam(shkp));
        }
        set_repo_loc(shkp);
        { $g = 2; continue $L; }
      }
      if (eshkp.billct || eshkp.debit || eshkp.robbed) {
        if (roomno === eshkp.shoproom && inhishop(shkp)) {
          loss = addupbill(shkp) + eshkp.debit;
        }
        if (loss < eshkp.robbed) {
          loss = eshkp.robbed;
        }
        take = TRUE;
      }
      if (!(eshkp.following || !shkp.mpeaceful || take)) { $g = 3; continue $L; }
      if (!G.invent) {
        { $g = 1; continue $L; }
      }
      umoney = money_cnt(G.invent);
      takes[0] = 0;
      if (!shkp.mcanmove || shkp.msleeping | 0) {
        strcat(P(takes), S("wakes up and "));
      }
      if (dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) > 2) {
        strcat(P(takes), S("comes and "));
      }
      strcat(P(takes), S("takes"));
      if (loss > umoney || !loss || roomno === eshkp.shoproom) {
        eshkp.robbed -= umoney;
        if (eshkp.robbed < 0) {
          eshkp.robbed = 0;
        }
        if (umoney > 0) {
          await money2mon(shkp, umoney);
          G.context.botl = 1;
        }
        if (!silently) {
          await pline(S("%s %s all your possessions."), await Shknam(shkp), P(takes));
        }
        taken = TRUE;
        set_repo_loc(shkp);
      } else {
        await money2mon(shkp, loss);
        G.context.botl = 1;
        if (!silently) {
          await pline(S("%s %s the %ld %s %sowed %s."), await Shknam(shkp), P(takes), loss, await currency(loss), strncmp(P(eshkp.customer), P(G.plname), PL_NSIZ) ? S("") : S("you "), G.genders[pronoun_gender(shkp, 1)].him);
        }
        pacify_shk(shkp);
        eshkp.following = 0;
        eshkp.robbed = 0;
      }
    case 1: // skip
      await rouse_shk(shkp, FALSE);
      if (!inhishop(shkp)) {
        await home_shk(shkp, FALSE);
      }
    case 3:
    case 2: // clear
      shkp.minvis = (save_minvis) & 1;
      await setpaid(shkp);
      return taken;
    }
    break;
  }
}

function set_repo_loc(shkp: struct_monst | null): void {
  let ox = 0;
  let oy = 0;
  let eshkp = shkp.mextra.eshk;
  if ($rd(P(G.u.ushops)) !== eshkp.shoproom || $at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR || G.u.ux === eshkp.shk.x && G.u.uy === eshkp.shk.y) {
    ox = eshkp.shk.x;
    oy = eshkp.shk.y;
    ox = ox + sgn(ox - eshkp.shd.x) << 24 >> 24;
    oy = oy + sgn(oy - eshkp.shd.y) << 24 >> 24;
  } else {
    ox = G.u.ux;
    oy = G.u.uy;
  }
  repo.location.x = ox;
  repo.location.y = oy;
  repo.shopkeeper = shkp;
}

export async function finish_paybill(): Promise<void> {
  let shkp = repo.shopkeeper;
  let ox = repo.location.x;
  let oy = repo.location.y;
  unleash_all();
  if (shkp) {
    let umoney = money_cnt(G.invent);
    if (umoney) {
      await money2mon(shkp, umoney);
    }
  }
  await drop_upon_death(null, null, ox, oy);
}

function bp_to_obj(bp: struct_bill_x | null): struct_obj | null {
  let obj = null;
  let id = bp.bo_id;
  if (bp.useup) {
    obj = o_on(id, G.billobjs);
  } else {
    obj = find_oid(id);
  }
  return obj;
}

export function find_oid(id: number): struct_obj | null {
  let obj = null;
  let mon = null;
  let mmtmp = new Array(3).fill(null);
  let i = 0;
  if (!!(obj = o_on(id, G.invent))) {
    return obj;
  }
  if (!!(obj = o_on(id, G.level.objlist))) {
    return obj;
  }
  if (!!(obj = o_on(id, G.level.buriedobjlist))) {
    return obj;
  }
  if (!!(obj = o_on(id, G.migrating_objs))) {
    return obj;
  }
  mmtmp[0] = G.level.monlist;
  mmtmp[1] = G.migrating_mons;
  mmtmp[2] = G.mydogs;
  for (i = 0; i < 3; ++i) {
    for (mon = mmtmp[i]; mon; mon = mon.nmon) {
      if (!!(obj = o_on(id, mon.minvent))) {
        return obj;
      }
    }
  }
  return null;
}

export async function get_cost_of_shop_item(obj: struct_obj | null, nochrg: Ptr | null): Promise<number> {
  let shkp = null;
  let top = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let freespot = 0;
  let cost = 0;
  nochrg.a[nochrg.o] = -1;
  if ($rd(P(G.u.ushops)) && obj.oclass !== COIN_CLASS && obj !== G.uball && obj !== G.uchain && get_obj_location(obj, P(x, 0), P(y, 0), CONTAINED_TOO) && $rd(in_rooms(x[0], y[0], SHOPBASE)) === $rd(P(G.u.ushops)) && !!(shkp = await shop_keeper(inside_shop(x[0], y[0]))) && inhishop(shkp)) {
    for (top = obj; top.where === OBJ_CONTAINED; top = top.v.v_ocontainer) {
      continue;
    }
    freespot = (top.where === OBJ_FLOOR && x[0] === shkp.mextra.eshk.shk.x && y[0] === shkp.mextra.eshk.shk.y ? 1 : 0) << 24 >> 24;
    nochrg.a[nochrg.o] = top.where === OBJ_FLOOR && (obj.no_charge | 0 || freespot) ? 1 : 0;
    if (top.where === 3 ? obj.unpaid | 0 : !nochrg.a[nochrg.o] ? 1 : 0) {
      let per_unit_cost = await get_cost(obj, shkp);
      cost = await get_pricing_units(obj) * per_unit_cost;
    }
    if (!!obj.cobj && !freespot) {
      cost += await contained_cost(obj, shkp, 0, FALSE, TRUE);
    }
  }
  return cost;
}

async function get_pricing_units(obj: struct_obj | null): Promise<number> {
  let units = obj.quan;
  if (obj.globby) {
    let unit_weight = G.objects[obj.otyp].oc_weight;
    let wt = obj.owt > 0 ? obj.owt : await weight(obj);
    if (unit_weight) {
      units = Math.trunc((wt + unit_weight - 1) / unit_weight);
    }
  }
  return units;
}

export function oid_price_adjustment(obj: struct_obj | null, oid: number): number {
  let res = 0;
  let otyp = obj.otyp;
  if (!(obj.dknown | 0 && G.objects[otyp].oc_name_known | 0) && (obj.oclass !== GEM_CLASS || (G.objects[otyp].oc_material | 0) !== GLASS)) {
    res = oid % 4 === 0 ? 1 : 0;
  }
  return res;
}

async function get_cost(obj: struct_obj | null, shkp: struct_monst | null): Promise<number> {
  let tmp = getprice(obj, FALSE);
  let multiplier = 1;
  let divisor = 1;
  if (!tmp) {
    tmp = 5;
  }
  if (!obj.dknown || !G.objects[obj.otyp].oc_name_known) {
    if (obj.oclass === GEM_CLASS && (G.objects[obj.otyp].oc_material | 0) === GLASS) {
      let i = 0;
      let pseudorand = ((G.ubirthday | 0) % obj.otyp >= (obj.otyp / 2 | 0) ? 1 : 0) << 24 >> 24;
      switch (obj.otyp - LAST_GEM) {
      case 1:
        i = pseudorand ? DIAMOND : OPAL;
        break;
      case 2:
        i = pseudorand ? SAPPHIRE : AQUAMARINE;
        break;
      case 3:
        i = pseudorand ? RUBY : JASPER;
        break;
      case 4:
        i = pseudorand ? AMBER : TOPAZ;
        break;
      case 5:
        i = pseudorand ? JACINTH : AGATE;
        break;
      case 6:
        i = pseudorand ? CITRINE : CHRYSOBERYL;
        break;
      case 7:
        i = pseudorand ? BLACK_OPAL : JET;
        break;
      case 8:
        i = pseudorand ? EMERALD : JADE;
        break;
      case 9:
        i = pseudorand ? AMETHYST : FLUORITE;
        break;
      default:
        await impossible(S("bad glass gem %d?"), obj.otyp);
        i = STRANGE_OBJECT;
        break;
      }
      tmp = G.objects[i].oc_cost;
    } else if (oid_price_adjustment(obj, obj.o_id) > 0) {
      multiplier = multiplier * 4;
      divisor = divisor * 3;
    }
  }
  if (G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
    multiplier = multiplier * 4, divisor = divisor * 3;
  } else if (G.urole.malenum === 340 && G.u.ulevel < (MAXULEV / 2 | 0) || G.uarmu && !G.uarm && !G.uarmc) {
    multiplier = multiplier * 4, divisor = divisor * 3;
  }
  if (acurr(A_CHA) > 18) {
    divisor = divisor * 2;
  } else if (acurr(A_CHA) === 18) {
    multiplier = multiplier * 2, divisor = divisor * 3;
  } else if (acurr(A_CHA) >= 16) {
    multiplier = multiplier * 3, divisor = divisor * 4;
  } else if (acurr(A_CHA) <= 5) {
    multiplier = multiplier * 2;
  } else if (acurr(A_CHA) <= 7) {
    multiplier = multiplier * 3, divisor = divisor * 2;
  } else if (acurr(A_CHA) <= 10) {
    multiplier = multiplier * 4, divisor = divisor * 3;
  }
  tmp = tmp * multiplier;
  if (divisor > 1) {
    tmp = tmp * 10;
    tmp = Math.trunc(tmp / divisor);
    tmp += 5;
    tmp = Math.trunc(tmp / 10);
  }
  if (tmp <= 0) {
    tmp = 1;
  }
  if (obj.oartifact) {
    tmp = tmp * 4;
  }
  if (shkp && shkp.mextra.eshk.surcharge) {
    tmp += Math.trunc((tmp + 2) / 3);
  }
  return tmp;
}

export async function contained_cost(obj: struct_obj | null, shkp: struct_monst | null, price: number, usell: number, unpaid_only: number): Promise<number> {
  let otmp = null;
  let top = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  let on_floor = 0;
  let freespot = 0;
  for (top = obj; top.where === OBJ_CONTAINED; top = top.v.v_ocontainer) {
    continue;
  }
  on_floor = (top.where === OBJ_FLOOR || top.where === OBJ_FREE ? 1 : 0) << 24 >> 24;
  if (top.where === OBJ_FREE || !get_obj_location(top, P(x, 0), P(y, 0), 0)) {
    x[0] = G.u.ux, y[0] = G.u.uy;
  }
  freespot = (on_floor && x[0] === shkp.mextra.eshk.shk.x && y[0] === shkp.mextra.eshk.shk.y ? 1 : 0) << 24 >> 24;
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    if (usell) {
      if (saleable(shkp, otmp) && !otmp.unpaid && otmp.oclass !== BALL_CLASS && !(otmp.oclass === FOOD_CLASS && otmp.oeaten) && !((otmp.otyp === 199 || otmp.otyp === 200) && otmp.age < 20 * G.objects[otmp.otyp].oc_cost)) {
        price += await set_cost(otmp, shkp);
      }
    } else {
      if (on_floor ? !otmp.no_charge && !freespot ? 1 : 0 : otmp.unpaid | 0 || !unpaid_only ? 1 : 0) {
        price += await get_cost(otmp, shkp) * await get_pricing_units(otmp);
      }
    }
    if (!!otmp.cobj) {
      price = await contained_cost(otmp, shkp, price, usell, unpaid_only);
    }
  }
  return price;
}

export function contained_gold(obj: struct_obj | null): number {
  let otmp = null;
  let value = 0;
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      value += otmp.quan;
    } else if (!!otmp.cobj) {
      value += contained_gold(otmp);
    }
  }
  return value;
}

function dropped_container(obj: struct_obj | null, shkp: struct_monst | null, sale: number): void {
  let otmp = null;
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    if (!otmp.unpaid && !(sale && saleable(shkp, otmp))) {
      otmp.no_charge = 1;
    }
    if (!!otmp.cobj) {
      dropped_container(otmp, shkp, sale);
    }
  }
}

export function picked_container(obj: struct_obj | null): void {
  let otmp = null;
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    if (otmp.no_charge) {
      otmp.no_charge = 0;
    }
    if (!!otmp.cobj) {
      picked_container(otmp);
    }
  }
}

async function special_stock(obj: struct_obj | null, shkp: struct_monst | null, quietly: number): Promise<number> {
  if (shkp.mextra.eshk.shoptype === CANDLESHOP && obj.otyp === CANDELABRUM_OF_INVOCATION) {
    if (!quietly) {
      if (is_izchak(shkp, TRUE) && !G.u.uevent.invoked) {
        if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic || (shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
          await pline(S("%s seems %s that you want to sell that."), await Shknam(shkp), obj.spe < 7 ? S("horrified") : S("concerned"));
        } else {
          await verbalize(S("No thanks, I'd hang onto that if I were you."));
          if (obj.spe < 7) {
            await verbalize(S("You'll need %d%s candle%s to go along with it."), 7 - obj.spe, obj.spe > 0 ? S(" more") : S(""), 7 - obj.spe === 1 ? S("") : S("s"));
          }
        }
      } else {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
          await verbalize(S("I won't stock that.  Take it out of here!"));
        } else {
          await pline(S("%s shakes %s %s in refusal."), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].his, mbodypart(shkp, HEAD));
        }
      }
    }
    return TRUE;
  }
  return FALSE;
}

async function set_cost(obj: struct_obj | null, shkp: struct_monst | null): Promise<number> {
  let tmp = 0;
  let unit_price = getprice(obj, TRUE);
  let multiplier = 1;
  let divisor = 1;
  tmp = await get_pricing_units(obj) * unit_price;
  if (G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
    divisor = divisor * 3;
  } else if (G.urole.malenum === 340 && G.u.ulevel < (MAXULEV / 2 | 0) || G.uarmu && !G.uarm && !G.uarmc) {
    divisor = divisor * 3;
  } else {
    divisor = divisor * 2;
  }
  if (!obj.dknown || !G.objects[obj.otyp].oc_name_known) {
    if (obj.oclass === GEM_CLASS) {
      if ((G.objects[obj.otyp].oc_material | 0) === GEMSTONE || (G.objects[obj.otyp].oc_material | 0) === GLASS) {
        tmp = (obj.otyp >>> 0) % (6 - shkp.m_id % 3 >>> 0);
        tmp = (tmp + 3) * obj.quan;
      }
    } else if (tmp > 1 && !(shkp.m_id % 4)) {
      multiplier = multiplier * 3, divisor = divisor * 4;
    }
  }
  if (tmp >= 1) {
    tmp = tmp * multiplier;
    if (divisor > 1) {
      tmp = tmp * 10;
      tmp = Math.trunc(tmp / divisor);
      tmp += 5;
      tmp = Math.trunc(tmp / 10);
    }
    if (tmp < 1) {
      tmp = 1;
    }
  }
  return tmp;
}

export async function gem_learned(oindx: number): Promise<void> {
  let obj = null;
  let shkp = null;
  let bp = null;
  let ct = 0;
  for (shkp = next_shkp(G.level.monlist, TRUE); shkp; shkp = next_shkp(shkp.nmon, TRUE)) {
    ct = shkp.mextra.eshk.billct;
    bp = shkp.mextra.eshk.bill[0];
    while (--ct >= 0) {
      obj = find_oid(bp.bo_id);
      if (!obj) {
        continue;
      }
      if (oindx !== STRANGE_OBJECT ? obj.otyp === oindx ? 1 : 0 : obj.oclass === GEM_CLASS ? 1 : 0) {
        bp.price = await get_cost(obj, shkp);
      }
      bp = $sadd(bp, 1);
    }
  }
}

export async function alter_cost(obj: struct_obj | null, amt: number): Promise<void> {
  let bp = null;
  let shkp = null;
  let new_price = 0;
  for (shkp = next_shkp(G.level.monlist, TRUE); shkp; shkp = next_shkp(shkp, TRUE)) {
    if (!!(bp = await onbill(obj, shkp, TRUE))) {
      new_price = !amt ? await get_cost(obj, shkp) : amt < 0 ? -amt : amt;
      if (new_price > bp.price || amt < 0) {
        bp.price = new_price;
        update_inventory();
      }
      break;
    }
  }
  return;
}

export async function unpaid_cost(unp_obj: struct_obj | null, include_contents: number): Promise<number> {
  let bp = null;
  let shkp = null;
  let amt = 0;
  const ox = new Int8Array(1);
  const oy = new Int8Array(1);
  if (!get_obj_location(unp_obj, P(ox, 0), P(oy, 0), BURIED_TOO | CONTAINED_TOO)) {
    ox[0] = G.u.ux, oy[0] = G.u.uy;
  }
  if (!!(shkp = await shop_keeper($rd(in_rooms(ox[0], oy[0], SHOPBASE))))) {
    bp = await onbill(unp_obj, shkp, TRUE);
  } else {
    for (shkp = next_shkp(G.level.monlist, TRUE); shkp; shkp = next_shkp(shkp.nmon, TRUE)) {
      if (!!(bp = await onbill(unp_obj, shkp, TRUE))) {
        break;
      }
    }
  }
  if (!shkp || unp_obj.unpaid | 0 && !bp) {
    await impossible(S("unpaid_cost: object wasn't on any bill."));
  } else {
    if (bp) {
      amt = unp_obj.quan * bp.price;
    }
    if (include_contents && !!unp_obj.cobj) {
      amt = await contained_cost(unp_obj, shkp, amt, FALSE, TRUE);
    }
  }
  return amt;
}

async function add_one_tobill(obj: struct_obj | null, dummy: number, shkp$: struct_monst | null): Promise<void> {
  const shkp = [null];
  shkp[0] = shkp$;
  let eshkp = null;
  let bp = null;
  let bct = 0;
  if (!await billable(P(shkp, 0), obj, $rd(P(G.u.ushops)), TRUE)) {
    return;
  }
  eshkp = shkp[0].mextra.eshk;
  if (eshkp.billct === BILLSZ) {
    await You(S("got that for free!"));
    return;
  }
  if (!eshkp.bill_p) {
    eshkp.bill_p = eshkp.bill[0];
  }
  bct = eshkp.billct;
  bp = $sadd(eshkp.bill_p, bct);
  bp.bo_id = obj.o_id;
  bp.bquan = obj.quan;
  if (dummy) {
    bp.useup = 1;
    await add_to_billobjs(obj);
  } else {
    bp.useup = 0;
  }
  bp.price = await get_cost(obj, shkp[0]);
  if (obj.globby) {
    bp.price = bp.price * await get_pricing_units(obj);
  }
  ++eshkp.billct;
  obj.unpaid = 1;
}

async function add_to_billobjs(obj: struct_obj | null): Promise<void> {
  if (obj.where !== OBJ_FREE) {
    await panic(S("add_to_billobjs: obj not free"));
  }
  if (obj.timed) {
    await obj_stop_timers(obj);
  }
  obj.nobj = G.billobjs;
  G.billobjs = obj;
  obj.where = OBJ_ONBILL;
}

async function bill_box_content(obj: struct_obj | null, ininv: number, dummy: number, shkp: struct_monst | null): Promise<void> {
  let otmp = null;
  if (obj.otyp === 189 && obj.spe === 1) {
    return;
  }
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    if (!otmp.no_charge) {
      await add_one_tobill(otmp, dummy, shkp);
    }
    if (!!otmp.cobj) {
      await bill_box_content(otmp, ininv, dummy, shkp);
    }
  }
}

async function shk_names_obj(shkp: struct_monst | null, obj: struct_obj | null, fmt: Ptr | null, amt: number, arg: Ptr | null): Promise<void> {
  let obj_name = null;
  let fmtbuf = new Int8Array(256);
  let was_unknown = (!obj.dknown ? 1 : 0) << 24 >> 24;
  obj.dknown = (TRUE) & 1;
  if (!G.objects[obj.otyp].oc_magic && saleable(shkp, obj) && (obj.oclass === WEAPON_CLASS || obj.oclass === ARMOR_CLASS || obj.oclass === SCROLL_CLASS || obj.oclass === SPBOOK_CLASS || obj.otyp === MIRROR)) {
    was_unknown = (was_unknown | (!G.objects[obj.otyp].oc_name_known ? 1 : 0)) << 24 >> 24;
    await discover_object(obj.otyp, 1, 1);
  }
  obj_name = await doname(obj);
  if (was_unknown) {
    sprintf(P(fmtbuf), S("%%s; you %s"), fmt);
    obj_name.a[obj_name.o] = highc(obj_name.a[obj_name.o]);
    await pline(P(fmtbuf), obj_name, obj.quan > 1 ? S("them") : S("it"), amt, amt === 1 ? S("") : S("s"), arg);
  } else {
    await You(fmt, obj_name, amt, amt === 1 ? S("") : S("s"), arg);
  }
}

export async function billable(shkpp: Ptr | null, obj: struct_obj | null, roomno: number, reset_nocharge: number): Promise<number> {
  let shkp = shkpp.a[shkpp.o];
  if (!shkp) {
    if (!roomno) {
      return FALSE;
    }
    shkp = await shop_keeper(roomno);
    if (!shkp || !inhishop(shkp)) {
      return FALSE;
    }
    shkpp.a[shkpp.o] = shkp;
  }
  if (await onbill(obj, shkp, FALSE) || obj.oclass === FOOD_CLASS && obj.oeaten) {
    return FALSE;
  }
  if (obj.no_charge) {
    if (!!!obj.cobj || contained_gold(obj) === 0 && await contained_cost(obj, shkp, 0, FALSE, !reset_nocharge ? 1 : 0) === 0) {
      shkp = null;
    }
    if (reset_nocharge && !shkp && obj.oclass !== COIN_CLASS) {
      obj.no_charge = 0;
      if (!!obj.cobj) {
        picked_container(obj);
      }
    }
  }
  return (shkp ? TRUE : FALSE) << 24 >> 24;
}

export async function addtobill(obj: struct_obj | null, ininv: number, dummy: number, silent: number): Promise<void> {
  const shkp = [null];
  shkp[0] = null;
  let ltmp = 0;
  let cltmp = 0;
  let gltmp = 0;
  let contentscount = 0;
  let container = 0;
  if (!await billable(P(shkp, 0), obj, $rd(P(G.u.ushops)), TRUE)) {
    return;
  }
  if (obj.oclass === COIN_CLASS) {
    await costly_gold(obj.ox, obj.oy, obj.quan);
    return;
  } else if (shkp[0].mextra.eshk.billct === BILLSZ) {
    if (!silent) {
      await You(S("got that for free!"));
    }
    return;
  }
  ltmp = cltmp = gltmp = 0;
  container = (!!obj.cobj ? 1 : 0) << 24 >> 24;
  if (!obj.no_charge) {
    ltmp = await get_cost(obj, shkp[0]);
    if (obj.globby) {
      ltmp = ltmp * await get_pricing_units(obj);
    }
  }
  if (obj.no_charge | 0 && !container) {
    obj.no_charge = 0;
    return;
  }
  if (container) {
    cltmp = await contained_cost(obj, shkp[0], cltmp, FALSE, FALSE);
    gltmp = contained_gold(obj);
    if (ltmp) {
      await add_one_tobill(obj, dummy, shkp[0]);
    }
    if (cltmp) {
      await bill_box_content(obj, ininv, dummy, shkp[0]);
    }
    picked_container(obj);
    ltmp += cltmp;
    if (gltmp) {
      await costly_gold(obj.ox, obj.oy, gltmp);
      if (!ltmp) {
        return;
      }
    }
    if (obj.no_charge) {
      obj.no_charge = 0;
    }
    contentscount = count_unpaid(obj.cobj);
  } else {
    await add_one_tobill(obj, dummy, shkp[0]);
    contentscount = 0;
  }
  if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp[0].msleeping | 0 || !shkp[0].mcanmove || shkp[0].data.msound <= 13) && !silent) {
    let buf = new Int8Array(256);
    if (!ltmp) {
      await pline(S("%s has no interest in %s."), await Shknam(shkp[0]), await the(await xname(obj)));
      return;
    }
    if (!ininv) {
      await pline(S("%s will cost you %ld %s%s."), await The(await xname(obj)), ltmp, await currency(ltmp), obj.quan > 1 ? S(" each") : S(""));
    } else {
      let save_quan = obj.quan;
      strcpy(P(buf), S("\"For you, "));
      if (!shkp[0].mpeaceful) {
        strcat(P(buf), S("scum;"));
      } else {
        append_honorific(P(buf));
        strcat(P(buf), S("; only"));
      }
      obj.quan = 1;
      await pline(S("%s %ld %s %s %s%s.\""), P(buf), ltmp, await currency(ltmp), save_quan > 1 ? S("per") : contentscount && !obj.unpaid ? S("for the contents of this") : S("for this"), await xname(obj), contentscount && obj.unpaid | 0 ? P(and_its_contents) : S(""));
      obj.quan = save_quan;
    }
  } else if (!silent) {
    if (ltmp) {
      await pline_The(S("list price of %s%s%s is %ld %s%s."), contentscount && !obj.unpaid ? P(the_contents_of) : S(""), await the(await xname(obj)), contentscount && obj.unpaid | 0 ? P(and_its_contents) : S(""), ltmp, await currency(ltmp), obj.quan > 1 ? S(" each") : S(""));
    } else {
      await pline(S("%s does not notice."), await Shknam(shkp[0]));
    }
  }
}

function append_honorific(buf: Ptr | null): void {
  strcat(buf, append_honorific$honored[rn2((Math.trunc(40 / 8) | 0) - 1) + (G.u.uevent.udemigod | 0)]);
  if (G.youmonst.data.mlet === S_VAMPIRE) {
    strcat(buf, G.flags.female ? S(" dark lady") : S(" dark lord"));
  } else if ((G.youmonst.data.mflags2 & 16) >>> 0 !== 0) {
    strcat(buf, G.flags.female ? S(" hiril") : S(" hir"));
  } else {
    strcat(buf, !((G.youmonst.data.mflags2 & 8) >>> 0 !== 0) ? S(" creature") : G.flags.female ? S(" lady") : S(" sir"));
  }
}

export async function splitbill(obj: struct_obj | null, otmp: struct_obj | null): Promise<void> {
  let bp = null;
  let tmp = 0;
  let shkp = await shop_keeper($rd(P(G.u.ushops)));
  if (!shkp || !inhishop(shkp)) {
    await impossible(S("splitbill: no resident shopkeeper??"));
    return;
  }
  bp = await onbill(obj, shkp, FALSE);
  if (!bp) {
    await impossible(S("splitbill: not on bill?"));
    return;
  }
  if (bp.bquan < otmp.quan) {
    await impossible(S("Negative quantity on bill??"));
  }
  if (bp.bquan === otmp.quan) {
    await impossible(S("Zero quantity on bill??"));
  }
  bp.bquan -= otmp.quan;
  if (shkp.mextra.eshk.billct === BILLSZ) {
    otmp.unpaid = 0;
  } else {
    tmp = bp.price;
    bp = $sadd(shkp.mextra.eshk.bill_p, shkp.mextra.eshk.billct);
    bp.bo_id = otmp.o_id;
    bp.bquan = otmp.quan;
    bp.useup = 0;
    bp.price = tmp;
    ++shkp.mextra.eshk.billct;
  }
}

async function sub_one_frombill(obj: struct_obj | null, shkp: struct_monst | null): Promise<void> {
  let $t1: any;
  let bp = null;
  if (!!(bp = await onbill(obj, shkp, FALSE))) {
    let otmp = null;
    obj.unpaid = 0;
    if (bp.bquan > obj.quan) {
      otmp = new struct_obj();
      otmp.$cp(obj);
      otmp.oextra = null;
      bp.bo_id = otmp.o_id = ($t1 = G.context.ident, G.context.ident = $t1 + 1 >>> 0, $t1);
      otmp.where = OBJ_FREE;
      otmp.quan = bp.bquan -= obj.quan;
      otmp.owt = 0;
      bp.useup = 1;
      await add_to_billobjs(otmp);
      return;
    }
    --shkp.mextra.eshk.billct;
    bp.$cp($sadd(shkp.mextra.eshk.bill_p, shkp.mextra.eshk.billct));
    return;
  } else if (obj.unpaid) {
    await impossible(S("sub_one_frombill: unpaid object not on bill"));
    obj.unpaid = 0;
  }
}

export async function subfrombill(obj: struct_obj | null, shkp: struct_monst | null): Promise<void> {
  let otmp = null;
  await sub_one_frombill(obj, shkp);
  if (!!obj.cobj) {
    for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
      if (otmp.oclass === COIN_CLASS) {
        continue;
      }
      if (!!otmp.cobj) {
        await subfrombill(otmp, shkp);
      } else {
        await sub_one_frombill(otmp, shkp);
      }
    }
  }
}

async function stolen_container(obj: struct_obj | null, shkp$: struct_monst | null, price: number, ininv: number): Promise<number> {
  const shkp = [null];
  shkp[0] = shkp$;
  let otmp = null;
  let bp = null;
  let billamt = 0;
  for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    billamt = 0;
    if (!await billable(P(shkp, 0), otmp, shkp[0].mextra.eshk.shoproom, TRUE)) {
      if (!(bp = await onbill(otmp, shkp[0], FALSE))) {
        continue;
      }
      billamt = bp.bquan * bp.price;
      await sub_one_frombill(otmp, shkp[0]);
    }
    if (billamt) {
      price += billamt;
    } else if (ininv ? otmp.unpaid | 0 : !otmp.no_charge ? 1 : 0) {
      price += await get_pricing_units(otmp) * await get_cost(otmp, shkp[0]);
    }
    if (!!otmp.cobj) {
      price = await stolen_container(otmp, shkp[0], price, ininv);
    }
  }
  return price;
}

export async function stolen_value(obj: struct_obj | null, x: number, y: number, peaceful: number, silent: number): Promise<number> {
  let value = 0;
  let gvalue = 0;
  let billamt = 0;
  let roomno = $rd(in_rooms(x, y, SHOPBASE));
  let bp = null;
  const shkp = [null];
  shkp[0] = null;
  let was_unpaid = 0;
  let c_count = 0;
  let u_count = 0;
  was_unpaid = (obj.unpaid | 0 ? TRUE : FALSE) << 24 >> 24;
  if (!!obj.cobj) {
    c_count = await count_contents(obj, TRUE, FALSE, TRUE, FALSE);
    u_count = await count_contents(obj, TRUE, FALSE, FALSE, FALSE);
  }
  if (!await billable(P(shkp, 0), obj, roomno, FALSE)) {
    if (!!(bp = await onbill(obj, shkp[0], FALSE))) {
      billamt = bp.bquan * bp.price;
      await sub_one_frombill(obj, shkp[0]);
    }
    if (!bp && !u_count) {
      return 0;
    }
  }
  if (obj.oclass === COIN_CLASS) {
    gvalue += obj.quan;
  } else {
    if (billamt) {
      value += billamt;
    } else if (!obj.no_charge) {
      value += await get_pricing_units(obj) * await get_cost(obj, shkp[0]);
    }
    if (!!obj.cobj) {
      let ininv = (obj.where === OBJ_INVENT || obj.where === OBJ_FREE ? 1 : 0) << 24 >> 24;
      value += await stolen_container(obj, shkp[0], 0, ininv);
      if (!ininv) {
        gvalue += contained_gold(obj);
      }
    }
  }
  if (gvalue + value === 0) {
    return 0;
  }
  value += gvalue;
  if (peaceful) {
    let credit_use = (!!shkp[0].mextra.eshk.credit ? 1 : 0) << 24 >> 24;
    value = await check_credit(value, shkp[0]);
    if (!shkp[0].mpeaceful) {
      shkp[0].mextra.eshk.robbed += value;
    } else {
      shkp[0].mextra.eshk.debit += value;
    }
    if (!silent) {
      let buf = new Int8Array(256);
      let still = S("");
      if (credit_use) {
        if (shkp[0].mextra.eshk.credit) {
          await You(S("have %ld %s credit remaining."), shkp[0].mextra.eshk.credit, await currency(shkp[0].mextra.eshk.credit));
          return value;
        } else if (!value) {
          await You(S("have no credit remaining."));
          return 0;
        }
        still = S("still ");
      }
      sprintf(P(buf), S("%sowe %s %ld %s"), still, await shkname(shkp[0]), value, await currency(value));
      if (u_count) {
        sprintf(eos(P(buf)), S(" for %s%sits contents"), was_unpaid ? S("it and ") : S(""), c_count > u_count ? S("some of ") : S(""));
      } else if (obj.oclass !== COIN_CLASS) {
        sprintf(eos(P(buf)), S(" for %s"), obj.quan > 1 ? S("them") : S("it"));
      }
      await You(S("%s!"), P(buf));
    }
  } else {
    shkp[0].mextra.eshk.robbed += value;
    if (!silent) {
      if ((shkp[0].wormno | 0 ? worm_known(shkp[0]) : $rd(G.viz_array.a[G.viz_array.o + shkp[0].my], shkp[0].mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp[0] && shkp[0].data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp[0].my], shkp[0].mx) & 1 ? 1 : 0) && ((!shkp[0].minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp[0].mundetected)) {
        await Norep(S("%s booms: \"%s, you are a thief!\""), await Shknam(shkp[0]), P(G.plname));
      } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await Norep(S("You hear a scream, \"Thief!\""));
      }
    }
    hot_pursuit(shkp[0]);
    await angry_guards(FALSE);
  }
  return value;
}

export function sellobj_state(deliberate: number): void {
  sell_response = (deliberate !== SELL_NORMAL ? 0 : 97) << 24 >> 24;
  sell_how = deliberate;
  auto_credit = FALSE;
}

export async function sellobj(obj: struct_obj | null, x: number, y: number): Promise<void> {
  let shkp = null;
  let eshkp = null;
  let ltmp = 0;
  let cltmp = 0;
  let gltmp = 0;
  let offer = 0;
  let shkmoney = 0;
  let saleitem = 0;
  let cgold = FALSE;
  let container = (!!obj.cobj ? 1 : 0) << 24 >> 24;
  let isgold = (obj.oclass === COIN_CLASS ? 1 : 0) << 24 >> 24;
  let only_partially_your_contents = FALSE;
  if (!$rd(P(G.u.ushops))) {
    return;
  }
  if (!(shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) || !inhishop(shkp)) {
    return;
  }
  if (!await costly_spot(x, y)) {
    return;
  }
  if (obj.unpaid | 0 && !container && !isgold) {
    await sub_one_frombill(obj, shkp);
    return;
  }
  if (container) {
    cltmp = await contained_cost(obj, shkp, cltmp, TRUE, FALSE);
    gltmp += contained_gold(obj);
    cgold = (gltmp > 0 ? 1 : 0) << 24 >> 24;
  }
  saleitem = saleable(shkp, obj);
  if (!isgold && !obj.unpaid && saleitem) {
    ltmp = await set_cost(obj, shkp);
  }
  offer = ltmp + cltmp;
  if (!(isgold || cgold) && (offer + gltmp === 0 || sell_how === SELL_DONTSELL)) {
    let unpaid = is_unpaid(obj);
    if (container) {
      dropped_container(obj, shkp, FALSE);
      if (!obj.unpaid) {
        obj.no_charge = 1;
      }
      if (unpaid) {
        await subfrombill(obj, shkp);
      }
    } else {
      obj.no_charge = 1;
    }
    if (!unpaid && sell_how !== SELL_DONTSELL && !await special_stock(obj, shkp, FALSE)) {
      await pline(S("%s seems uninterested."), await Shknam(shkp));
    }
    return;
  }
  await rouse_shk(shkp, TRUE);
  eshkp = shkp.mextra.eshk;
  if (!shkp.mpeaceful) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("Thank you, scum!"));
    } else {
      await pline(S("%s smirks with satisfaction."), await Shknam(shkp));
    }
    await subfrombill(obj, shkp);
    return;
  }
  if (eshkp.robbed) {
    if (isgold) {
      offer = obj.quan;
    } else if (cgold) {
      offer += cgold;
    }
    if (eshkp.robbed -= offer < 0 ? 1 : 0) {
      eshkp.robbed = 0;
    }
    if (offer && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("Thank you for your contribution to restock this recently plundered shop."));
    }
    await subfrombill(obj, shkp);
    return;
  }
  if (isgold || cgold) {
    if (!cgold) {
      gltmp = obj.quan;
    }
    if (eshkp.debit >= gltmp) {
      if (eshkp.loan) {
        if (eshkp.loan >= gltmp) {
          eshkp.loan -= gltmp;
        } else {
          eshkp.loan = 0;
        }
      }
      eshkp.debit -= gltmp;
      await Your(S("debt is %spaid off."), eshkp.debit ? S("partially ") : S(""));
    } else {
      let delta = gltmp - eshkp.debit;
      eshkp.credit += delta;
      if (eshkp.debit) {
        eshkp.debit = 0;
        eshkp.loan = 0;
        await Your(S("debt is paid off."));
      }
      if (eshkp.credit === delta) {
        await You(S("have established %ld %s credit."), delta, await currency(delta));
      } else {
        await pline(S("%ld %s added to your credit; total is now %ld %s."), delta, await currency(delta), eshkp.credit, await currency(eshkp.credit));
      }
    }
    if (!offer || sell_how === SELL_DONTSELL) {
      if (!isgold) {
        if (container) {
          dropped_container(obj, shkp, FALSE);
        }
        if (!obj.unpaid) {
          obj.no_charge = 1;
        }
        await subfrombill(obj, shkp);
      }
      return;
    }
  }
  if (!saleitem && !(container && cltmp > 0) || eshkp.billct === BILLSZ || obj.oclass === BALL_CLASS || obj.oclass === CHAIN_CLASS || offer === 0 || obj.oclass === FOOD_CLASS && obj.oeaten || (obj.otyp === 199 || obj.otyp === 200) && obj.age < 20 * G.objects[obj.otyp].oc_cost) {
    await pline(S("%s seems uninterested%s."), await Shknam(shkp), cgold ? S(" in the rest") : S(""));
    if (container) {
      dropped_container(obj, shkp, FALSE);
    }
    obj.no_charge = 1;
    return;
  }
  shkmoney = money_cnt(shkp.minvent);
  if (!shkmoney) {
    let c = 0;
    let qbuf = new Int8Array(256);
    let tmpcr = Math.trunc(offer * 9 / 10) + (offer <= 1 ? 1 : 0);
    if (sell_how === SELL_NORMAL || auto_credit) {
      c = sell_response = 121;
    } else if (sell_response !== 110) {
      await pline(S("%s cannot pay you at present."), await Shknam(shkp));
      sprintf(P(qbuf), S("Will you accept %ld %s in credit for "), tmpcr, await currency(tmpcr));
      c = await yn_function(await safe_qbuf(P(qbuf), P(qbuf), S("?"), obj, doname, thesimpleoname, obj.quan === 1 ? S("that") : S("those")), P(G.ynaqchars), 121);
      if (c === 97) {
        c = 121;
        auto_credit = TRUE;
      }
    } else {
      c = 110;
    }
    if (c === 121) {
      await shk_names_obj(shkp, obj, sell_how !== SELL_NORMAL ? S("traded %s for %ld zorkmid%s in %scredit.") : S("relinquish %s and acquire %ld zorkmid%s in %scredit."), tmpcr, eshkp.credit > 0 ? S("additional ") : S(""));
      eshkp.credit += tmpcr;
      await subfrombill(obj, shkp);
    } else {
      if (c === 113) {
        sell_response = 110;
      }
      if (container) {
        dropped_container(obj, shkp, FALSE);
      }
      if (!obj.unpaid) {
        obj.no_charge = 1;
      }
      await subfrombill(obj, shkp);
    }
  } else {
    let qbuf = new Int8Array(256);
    let qsfx = new Int8Array(256);
    let short_funds = (offer > shkmoney ? 1 : 0) << 24 >> 24;
    let one = 0;
    if (short_funds) {
      offer = shkmoney;
    }
    if (!sell_response) {
      let yourc = 0;
      let shksc = 0;
      if (container) {
        shksc = await count_contents(obj, TRUE, TRUE, FALSE, TRUE);
        yourc = await count_contents(obj, TRUE, TRUE, TRUE, TRUE) - shksc;
        only_partially_your_contents = (shksc && yourc ? 1 : 0) << 24 >> 24;
      }
      sprintf(P(qbuf), S("%s offers%s %ld gold piece%s for %s%s "), await Shknam(shkp), short_funds ? S(" only") : S(""), offer, offer === 1 ? S("") : S("s"), cltmp && !ltmp ? yourc === 1 ? S("your item in ") : S("your items in ") : S(""), obj.unpaid | 0 ? S("the") : S("your"));
      one = (!ltmp ? yourc === 1 ? 1 : 0 : obj.quan === 1 && !cltmp ? 1 : 0) << 24 >> 24;
      sprintf(P(qsfx), S("%s.  Sell %s?"), cltmp && ltmp ? only_partially_your_contents ? yourc === 1 ? S(" and item inside") : S(" and items inside") : P(and_its_contents) : S(""), one ? S("it") : S("them"));
      await safe_qbuf(P(qbuf), P(qbuf), P(qsfx), obj, xname, simpleonames, one ? S("that") : S("those"));
    } else {
      qbuf[0] = 0;
    }
    switch (sell_response ? sell_response : await yn_function(P(qbuf), P(G.ynaqchars), 121)) {
    case 113:
      sell_response = 110;
    case 110:
      if (container) {
        dropped_container(obj, shkp, FALSE);
      }
      if (!obj.unpaid) {
        obj.no_charge = 1;
      }
      await subfrombill(obj, shkp);
      break;
    case 97:
      sell_response = 121;
    case 121:
      if (container) {
        dropped_container(obj, shkp, TRUE);
      }
      if (!obj.unpaid && !saleitem) {
        obj.no_charge = 1;
      }
      await subfrombill(obj, shkp);
      await pay(-offer, shkp);
      await shk_names_obj(shkp, obj, sell_how !== SELL_NORMAL ? !ltmp && cltmp && only_partially_your_contents ? S("sold some items inside %s for %ld gold piece%s.%s") : S("sold %s for %ld gold piece%s.%s") : S("relinquish %s and receive %ld gold piece%s in compensation.%s"), offer, S(""));
      break;
    default:
      await impossible(S("invalid sell response"));
    }
  }
}

export async function doinvbill(mode: number): Promise<number> {
  let $g = 0;
  let shkp = null;
  let eshkp = null;
  let bp = null;
  let end_bp = null;
  let obj = null;
  let totused = 0;
  let buf_p = null;
  let datawin = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      shkp = await shop_keeper($rd(P(G.u.ushops)));
      if (!shkp || !inhishop(shkp)) {
        if (mode !== 0) {
          await impossible(S("doinvbill: no shopkeeper?"));
        }
        return 0;
      }
      eshkp = shkp.mextra.eshk;
      if (mode === 0) {
        let cnt = !eshkp.debit ? 0 : 1;
        for (bp = eshkp.bill_p, end_bp = $sadd(eshkp.bill_p, eshkp.billct); $sidx(bp) < $sidx(end_bp); bp = $sadd(bp, 1)) {
          if (bp.useup || !!(obj = bp_to_obj(bp)) && obj.quan < bp.bquan) {
            ++cnt;
          }
        }
        return cnt;
      }
      datawin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_putstr(datawin, 0, S("Unpaid articles already used up:"));
      await G.windowprocs.win_putstr(datawin, 0, S(""));
      totused = 0;
      for (bp = eshkp.bill_p, end_bp = $sadd(eshkp.bill_p, eshkp.billct); $sidx(bp) < $sidx(end_bp); bp = $sadd(bp, 1)) {
        obj = bp_to_obj(bp);
        if (!obj) {
          await impossible(S("Bad shopkeeper administration."));
          { $g = 1; continue $L; }
        }
        if (bp.useup || bp.bquan > obj.quan) {
          let oquan = 0;
          let uquan = 0;
          let thisused = 0;
          oquan = obj.quan;
          uquan = bp.useup ? bp.bquan : bp.bquan - oquan;
          thisused = bp.price * uquan;
          totused += thisused;
          ++G.iflags.suppress_price;
          buf_p = await xprname(obj, null, 120, FALSE, thisused, uquan);
          --G.iflags.suppress_price;
          await G.windowprocs.win_putstr(datawin, 0, buf_p);
        }
      }
      if (eshkp.debit) {
        if (totused) {
          await G.windowprocs.win_putstr(datawin, 0, S(""));
        }
        totused += eshkp.debit;
        buf_p = await xprname(null, S("usage charges and/or other fees"), GOLD_SYM, FALSE, eshkp.debit, 0);
        await G.windowprocs.win_putstr(datawin, 0, buf_p);
      }
      buf_p = await xprname(null, S("Total:"), 42, FALSE, totused, 0);
      await G.windowprocs.win_putstr(datawin, 0, S(""));
      await G.windowprocs.win_putstr(datawin, 0, buf_p);
      await G.windowprocs.win_display_nhwindow(datawin, FALSE);
    case 1: // quit
      await G.windowprocs.win_destroy_nhwindow(datawin);
      return 0;
    }
    break;
  }
}

function getprice(obj: struct_obj | null, shk_buying: number): number {
  let tmp = G.objects[obj.otyp].oc_cost;
  if (obj.oartifact) {
    tmp = arti_cost(obj);
    if (shk_buying) {
      tmp = Math.trunc(tmp / 4);
    }
  }
  switch (obj.oclass) {
  case FOOD_CLASS:
    if (G.u.uhs >= HUNGRY && !shk_buying) {
      tmp = tmp * G.u.uhs;
    }
    if (obj.oeaten) {
      tmp = 0;
    }
    break;
  case WAND_CLASS:
    if (obj.spe === -1) {
      tmp = 0;
    }
    break;
  case POTION_CLASS:
    if (obj.otyp === POT_WATER && !obj.blessed && !obj.cursed) {
      tmp = 0;
    }
    break;
  case ARMOR_CLASS:
  case WEAPON_CLASS:
    if (obj.spe > 0) {
      tmp += 10 * obj.spe;
    }
    break;
  case TOOL_CLASS:
    if ((obj.otyp === 199 || obj.otyp === 200) && obj.age < 20 * G.objects[obj.otyp].oc_cost) {
      tmp = Math.trunc(tmp / 2);
    }
    break;
  }
  return tmp;
}

export async function shkcatch(obj: struct_obj | null, x: number, y: number): Promise<struct_monst | null> {
  let shkp = null;
  if (!(shkp = await shop_keeper(inside_shop(x, y))) || !inhishop(shkp)) {
    return null;
  }
  if (shkp.mcanmove | 0 && !shkp.msleeping && ($rd(P(G.u.ushops)) !== shkp.mextra.eshk.shoproom || !inside_shop(G.u.ux, G.u.uy)) && dist2(shkp.mx, shkp.my, x, y) < 3 && (shkp.mx !== x || shkp.my !== y)) {
    if (await mnearto(shkp, x, y, TRUE) === 2 && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await verbalize(S("Out of my way, scum!"));
    }
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await pline(S("%s nimbly%s catches %s."), await Shknam(shkp), x === shkp.mx && y === shkp.my ? S("") : S(" reaches over and"), await the(await xname(obj)));
      if (!((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected) || (!((shkp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & shkp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & shkp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === shkp.data)))) {
        await map_invisible(x, y);
      }
      await G.windowprocs.win_delay_output();
      G.windowprocs.win_mark_synch();
    }
    await subfrombill(obj, shkp);
    await mpickobj(shkp, obj);
    return shkp;
  }
  return null;
}

export async function add_damage(x: number, y: number, cost: number): Promise<void> {
  let tmp_dam = null;
  let shops = null;
  if ($at2(G.level.locations, x, y).typ === DOOR) {
    let mtmp = null;
    for (shops = in_rooms(x, y, SHOPBASE); shops.a[shops.o]; shops = shops.add(1)) {
      if (!!(mtmp = await shop_keeper(shops.a[shops.o])) && x === mtmp.mextra.eshk.shd.x && y === mtmp.mextra.eshk.shd.y) {
        break;
      }
    }
    if (!shops.a[shops.o]) {
      return;
    }
  }
  for (tmp_dam = G.level.damagelist; tmp_dam; tmp_dam = tmp_dam.next) {
    if (tmp_dam.place.x === x && tmp_dam.place.y === y) {
      tmp_dam.cost += cost;
      tmp_dam.when = G.monstermoves;
      return;
    }
  }
  tmp_dam = new struct_damage();
  memset(tmp_dam, 0, 32);
  tmp_dam.when = G.monstermoves;
  tmp_dam.place.x = x;
  tmp_dam.place.y = y;
  tmp_dam.cost = cost;
  tmp_dam.typ = $at2(G.level.locations, x, y).typ;
  tmp_dam.next = G.level.damagelist;
  G.level.damagelist = tmp_dam;
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    $at2(G.level.locations, x, y).seenv = SVALL;
  }
}

async function remove_damage(shkp: struct_monst | null, croaked: number): Promise<void> {
  let tmp_dam = null;
  let tmp2_dam = null;
  let shk_inv = shkp.minvent;
  let did_repair = FALSE;
  let saw_door = FALSE;
  let saw_floor = FALSE;
  let stop_picking = FALSE;
  let doorway_trap = FALSE;
  let skip_msg = FALSE;
  let saw_walls = 0;
  let saw_untrap = 0;
  const feedback = new Int32Array(1);
  let trapmsg = new Int8Array(256);
  feedback[0] = !croaked ? 1 : 0;
  tmp_dam = G.level.damagelist;
  tmp2_dam = null;
  while (tmp_dam) {
    let x = tmp_dam.place.x;
    let y = tmp_dam.place.y;
    let shops = new Int8Array(5);
    let disposition = 0;
    let old_doormask = 0;
    disposition = 0;
    strcpy(P(shops), in_rooms(x, y, SHOPBASE));
    if (strchr(P(shops), shkp.mextra.eshk.shoproom)) {
      if ($at2(G.level.locations, x, y).typ === DOOR) {
        old_doormask = $at2(G.level.locations, x, y).flags;
      }
      if (croaked) {
        disposition = shops[1] ? 0 : 1;
      } else if (stop_picking) {
        disposition = await repair_damage(shkp, tmp_dam, P(feedback, 0), FALSE);
      } else {
        if (closed_door(x, y)) {
          stop_picking = picking_at(x, y);
        }
        disposition = await repair_damage(shkp, tmp_dam, P(feedback, 0), FALSE);
        if (!disposition) {
          stop_picking = FALSE;
        }
      }
    }
    if (!disposition) {
      tmp2_dam = tmp_dam;
      tmp_dam = tmp_dam.next;
      continue;
    }
    if (disposition > 1) {
      did_repair = TRUE;
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        if ($at2(G.level.locations, x, y).typ && $at2(G.level.locations, x, y).typ <= DBWALL) {
          ++saw_walls;
        } else if ($at2(G.level.locations, x, y).typ === DOOR && !((old_doormask & (D_ISOPEN | D_CLOSED)) >>> 0)) {
          saw_door = TRUE;
        } else if (disposition === 3) {
          ++saw_untrap;
          if ($at2(G.level.locations, x, y).typ === DOOR) {
            doorway_trap = TRUE;
          }
        } else {
          saw_floor = TRUE;
        }
      }
    }
    tmp_dam = tmp_dam.next;
    if (!tmp2_dam) {
      free(G.level.damagelist);
      G.level.damagelist = tmp_dam;
    } else {
      free(tmp2_dam.next);
      tmp2_dam.next = tmp_dam;
    }
  }
  if (!did_repair) {
    return;
  }
  trapmsg[0] = 0;
  shk_inv = shkp.minvent !== shk_inv ? shkp.minvent : null;
  if (saw_untrap === 1 && shk_inv && (shk_inv.otyp === BEARTRAP || shk_inv.otyp === LAND_MINE) && ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected))) {
    await pline(S("%s untraps %s."), await Shknam(shkp), await ansimpleoname(shk_inv));
    saw_untrap = 0;
    skip_msg = (!(saw_walls || saw_door || saw_floor) ? 1 : 0) << 24 >> 24;
  } else if (saw_untrap) {
    sprintf(P(trapmsg), S("%s trap%s"), saw_untrap > 3 ? S("several") : saw_untrap > 1 ? S("some") : S("a"), saw_untrap === 1 ? S("") : S("s"));
    sprintf(eos(P(trapmsg)), S(" %s"), vtense(P(trapmsg), S("are")));
    sprintf(eos(P(trapmsg)), S(" removed from the %s"), doorway_trap && saw_untrap === 1 ? S("doorway") : S("floor"));
  }
  if (skip_msg) {
    ;
  } else if (saw_walls) {
    let wallbuf = new Int8Array(256);
    sprintf(P(wallbuf), S("section%s"), saw_walls === 1 ? S("") : S("s"));
    await pline(S("Suddenly, %s %s of wall %s up!"), saw_walls === 1 ? S("a") : saw_walls <= 3 ? S("some") : S("several"), P(wallbuf), vtense(P(wallbuf), S("close")));
    if (saw_door) {
      await pline_The(S("shop door reappears!"));
    }
    if (saw_floor) {
      await pline_The(S("floor is repaired!"));
    }
    if (saw_untrap) {
      await pline(S("%s!"), upstart(P(trapmsg)));
    }
  } else {
    if (saw_door || saw_floor || saw_untrap) {
      await pline(S("Suddenly, %s%s%s%s%s!"), saw_door ? S("the shop door reappears") : S(""), saw_door && saw_floor ? S(" and ") : S(""), saw_floor ? S("the floor damage is gone") : S(""), (saw_door || saw_floor) && $rd(P(trapmsg)) ? S(" and ") : S(""), P(trapmsg));
    } else if (inside_shop(G.u.ux, G.u.uy) === shkp.mextra.eshk.shoproom) {
      await You_feel(S("more claustrophobic than before."));
    } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !rn2(10)) {
      await Norep(S("The dungeon acoustics noticeably change."));
    }
  }
  if (stop_picking) {
    await stop_occupation();
  }
}

export async function repair_damage(shkp: struct_monst | null, tmp_dam: struct_damage | null, once: Ptr | null, catchup: number): Promise<number> {
  let x = 0;
  let y = 0;
  let litter = new Int8Array(9);
  let mtmp = null;
  let otmp = null;
  let ttmp = null;
  let i = 0;
  let k = 0;
  let ix = 0;
  let iy = 0;
  let disposition = 1;
  if (G.monstermoves - tmp_dam.when < REPAIR_DELAY) {
    return 0;
  }
  if (shkp.msleeping | 0 || !shkp.mcanmove || shkp.mextra.eshk.following) {
    return 0;
  }
  x = tmp_dam.place.x;
  y = tmp_dam.place.y;
  if (!(tmp_dam.typ >= ROOM)) {
    if (x === G.u.ux && y === G.u.uy && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) || x === shkp.mx && y === shkp.my || !!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && !((mtmp.data.mflags1 & 8) >>> 0 !== 0)) {
      return 0;
    }
  }
  ttmp = t_at(x, y);
  if (ttmp && x === G.u.ux && y === G.u.uy && !(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic)) {
    return 0;
  }
  if (once && once.a[once.o]) {
    let shk_closeby = (dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) <= Math.imul(BOLT_LIM / 2 | 0, BOLT_LIM / 2 | 0) ? 1 : 0) << 24 >> 24;
    if ((shkp.wormno | 0 ? worm_known(shkp) : $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && shkp && shkp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1 ? 1 : 0) && ((!shkp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !shkp.mundetected)) {
      await pline(S("%s whispers %s."), await Shknam(shkp), shk_closeby ? S("an incantation") : S("something"));
    } else if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && shk_closeby) {
      await You_hear(S("someone muttering an incantation."));
    }
    once.a[once.o] = 0;
  }
  if (ttmp) {
    if (((ttmp.ttyp | 0) === LANDMINE || (ttmp.ttyp | 0) === BEAR_TRAP) && dist2(x, y, shkp.mx, shkp.my) <= 2) {
      otmp = await mksobj((ttmp.ttyp | 0) === LANDMINE ? LAND_MINE : BEARTRAP, TRUE, FALSE);
      otmp.quan = 1;
      otmp.owt = await weight(otmp) >>> 0;
      await mpickobj(shkp, otmp);
    }
    await deltrap(ttmp);
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await newsym(x, y);
    }
    if (!catchup) {
      disposition = 3;
    }
  }
  if (tmp_dam.typ >= ROOM || tmp_dam.typ === $at2(G.level.locations, x, y).typ && (!(tmp_dam.typ === DOOR) || ($at2(G.level.locations, x, y).flags | 0) > D_BROKEN)) {
    return disposition;
  }
  $at2(G.level.locations, x, y).typ = tmp_dam.typ;
  if (tmp_dam.typ === DOOR) {
    $at2(G.level.locations, x, y).flags = (D_CLOSED) & 31;
  }
  memset(P(litter), 0, 9);
  k = 0;
  if (G.level.objects[x][y] && !($at2(G.level.locations, x, y).typ >= ROOM)) {
    for (i = 0; i < 9; ++i) {
      ix = x + (i % 3 - 1);
      iy = y + ((i / 3 | 0) - 1);
      if (i === 4 || !isok(ix, iy) || !($at2(G.level.locations, ix, iy).typ >= POOL)) {
        continue;
      }
      litter[i] = OPEN;
      if (inside_shop(ix, iy) === shkp.mextra.eshk.shoproom) {
        litter[i] = (litter[i] | INSHOP) << 24 >> 24;
        ++k;
      }
    }
  }
  if (k > 0) {
    if (!!G.uball && !G.u.uswallow && (G.uchain.ox === x && G.uchain.oy === y || G.uball.ox === x && G.uball.oy === y)) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(S("Get your junk out of my wall!"));
      }
      await unplacebc();
      await placebc();
    }
    while (!!(otmp = G.level.objects[x][y])) {
      if (otmp.otyp === BOULDER || otmp.otyp === ROCK) {
        await obj_extract_self(otmp);
        await obfree(otmp, null);
      } else {
        let trylimit = 50;
        do {
          i = rn2(9);
        } while (--trylimit && !(litter[i] & INSHOP));
        if ((litter[i] & (OPEN | INSHOP)) !== 0) {
          ix = x + (i % 3 - 1);
          iy = y + ((i / 3 | 0) - 1);
        } else {
          ix = shkp.mx;
          iy = shkp.my;
        }
        await remove_object(otmp);
        await place_object(otmp, ix, iy);
        litter[i] = (litter[i] | NEED_UPDATE) << 24 >> 24;
      }
    }
  }
  if (catchup) {
    return 1;
  }
  block_point(x, y);
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    if (tmp_dam.typ && tmp_dam.typ <= DBWALL) {
      $at2(G.level.locations, x, y).seenv = SVALL;
    }
    await newsym(x, y);
  }
  for (i = 0; i < 9; ++i) {
    if (litter[i] & NEED_UPDATE) {
      await newsym(x + (i % 3 - 1), y + ((i / 3 | 0) - 1));
    }
  }
  if (disposition < 3) {
    disposition = 2;
  }
  return disposition;
}

export async function shk_move(shkp: struct_monst | null): Promise<number> {
  let gx = 0;
  let gy = 0;
  let omx = 0;
  let omy = 0;
  let udist = 0;
  let appr = 0;
  let eshkp = shkp.mextra.eshk;
  let z = 0;
  let uondoor = FALSE;
  let satdoor = 0;
  let avoid = FALSE;
  let badinv = 0;
  omx = shkp.mx;
  omy = shkp.my;
  if (inhishop(shkp)) {
    await remove_damage(shkp, FALSE);
  }
  if ((udist = dist2(omx, omy, G.u.ux, G.u.uy)) < 3 && (shkp.data !== $sat(G.mons, PM_GRID_BUG) || (omx === G.u.ux || omy === G.u.uy))) {
    if (!shkp.mpeaceful || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !await resist(shkp, RING_CLASS, 0, 0)) {
      if (G.u.uprops[DISPLACED].extrinsic) {
        await Your(S("displaced image doesn't fool %s!"), await shkname(shkp));
      }
      await mattacku(shkp);
      return 0;
    }
    if (eshkp.following) {
      if (strncmp(P(eshkp.customer), P(G.plname), PL_NSIZ)) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
          await verbalize(S("%s, %s!  I was looking for %s."), Hello(shkp), P(G.plname), P(eshkp.customer));
        }
        eshkp.following = 0;
        return 0;
      }
      if (G.moves > followmsg + 4) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
          await verbalize(S("%s, %s!  Didn't you forget to pay?"), Hello(shkp), P(G.plname));
        } else {
          await pline(S("%s holds out %s upturned %s."), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].his, mbodypart(shkp, HAND));
        }
        followmsg = G.moves;
        if (!rn2(9)) {
          await pline(S("%s doesn't like customers who don't pay."), await Shknam(shkp));
          rile_shk(shkp);
        }
      }
      if (udist < 2) {
        return 0;
      }
    }
  }
  appr = 1;
  gx = eshkp.shk.x;
  gy = eshkp.shk.y;
  satdoor = (gx === omx && gy === omy ? 1 : 0) << 24 >> 24;
  if (eshkp.following || (z = holetime()) >= 0 && Math.imul(z, z) <= udist) {
    if (udist > 4 && eshkp.following && !eshkp.billct) {
      return -1;
    }
    gx = G.u.ux;
    gy = G.u.uy;
  } else if (!shkp.mpeaceful) {
    if (shkp.mcansee | 0 && ((!((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) || (shkp.data.mflags1 & 16777216) >>> 0 !== 0) && !G.u.uinwater && $rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 1)) {
      gx = G.u.ux;
      gy = G.u.uy;
    }
    avoid = FALSE;
  } else {
    if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked || G.u.usteed) {
      avoid = FALSE;
    } else {
      uondoor = (G.u.ux === eshkp.shd.x && G.u.uy === eshkp.shd.y ? 1 : 0) << 24 >> 24;
      if (uondoor) {
        badinv = (carrying(PICK_AXE) || carrying(DWARVISH_MATTOCK) || (G.u.uprops[FAST].intrinsic || G.u.uprops[FAST].extrinsic) && (sobj_at(PICK_AXE, G.u.ux, G.u.uy) || sobj_at(DWARVISH_MATTOCK, G.u.ux, G.u.uy)) ? 1 : 0) << 24 >> 24;
        if (satdoor && badinv) {
          return 0;
        }
        avoid = (!badinv ? 1 : 0) << 24 >> 24;
      } else {
        avoid = ($rd(P(G.u.ushops)) && dist2(gx, gy, G.u.ux, G.u.uy) > 8 ? 1 : 0) << 24 >> 24;
        badinv = FALSE;
      }
      if ((!eshkp.robbed && !eshkp.billct && !eshkp.debit || avoid) && dist2(omx, omy, gx, gy) < 3) {
        if (!badinv && !online2(omx, omy, G.u.ux, G.u.uy)) {
          return 0;
        }
        if (satdoor) {
          appr = gx = gy = 0;
        }
      }
    }
  }
  z = await move_special(shkp, inhishop(shkp), appr, uondoor, avoid, omx, omy, gx, gy);
  if (z > 0) {
    await after_shk_move(shkp);
  }
  return z;
}

export async function after_shk_move(shkp: struct_monst | null): Promise<void> {
  let eshkp = shkp.mextra.eshk;
  if (eshkp.bill_p === -1000 && inhishop(shkp)) {
    eshkp.bill_p = eshkp.bill[0];
    await check_special_room(FALSE);
  }
}

export function is_fshk(mtmp: struct_monst | null): number {
  return (mtmp.isshk | 0 && mtmp.mextra.eshk.following ? 1 : 0) << 24 >> 24;
}

export async function shopdig(fall: number): Promise<void> {
  let shkp = await shop_keeper($rd(P(G.u.ushops)));
  let lang = 0;
  let grabs = S("grabs");
  if (!shkp) {
    return;
  }
  lang = 0;
  if (shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound === 0) {
    ;
  } else if (shkp.data.msound <= MS_ANIMAL) {
    lang = 1;
  } else if (shkp.data.msound >= MS_HUMANOID) {
    lang = 2;
  }
  if (!inhishop(shkp)) {
    if (G.urole.malenum === 333) {
      await You_feel(S("like a common thief."));
      adjalign(-sgn(G.u.ualign.type));
    }
    return;
  }
  if (!fall) {
    if (lang === 2) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        if (G.u.utraptype === TT_PIT) {
          await verbalize(S("Be careful, %s, or you might fall through the floor."), G.flags.female ? S("madam") : S("sir"));
        } else {
          await verbalize(S("%s, do not damage the floor here!"), G.flags.female ? S("Madam") : S("Sir"));
        }
      }
    }
    if (G.urole.malenum === 333) {
      await You_feel(S("like a common thief."));
      adjalign(-sgn(G.u.ualign.type));
    }
  } else if (!um_dist(shkp.mx, shkp.my, 5) && !shkp.msleeping && shkp.mcanmove | 0 && (shkp.mextra.eshk.billct || shkp.mextra.eshk.debit)) {
    let obj = null;
    let obj2 = null;
    if ((shkp.data.mflags1 & 24576) >>> 0 === 24576) {
      grabs = S("knocks off");
    }
    if (dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) > 2) {
      await mnexto(shkp);
      if (dist2(shkp.mx, shkp.my, G.u.ux, G.u.uy) > 2) {
        if (lang === 2) {
          await pline(S("%s curses you in anger and frustration!"), await Shknam(shkp));
        } else if (lang === 1) {
          await growl(shkp);
        }
        rile_shk(shkp);
        return;
      } else {
        await pline(S("%s %s, and %s your backpack!"), await Shknam(shkp), await makeplural(locomotion(shkp.data, S("leap"))), grabs);
      }
    } else {
      await pline(S("%s %s your backpack!"), await Shknam(shkp), grabs);
    }
    for (obj = G.invent; obj; obj = obj2) {
      obj2 = obj.nobj;
      if ((obj.owornmask & ~(W_SWAPWEP | W_QUIVER)) !== 0 || obj === G.uswapwep && G.u.twoweap || obj.otyp === LEASH && obj.corpsenm) {
        continue;
      }
      if (obj === G.current_wand) {
        continue;
      }
      await setnotworn(obj);
      await freeinv(obj);
      await subfrombill(obj, shkp);
      await add_to_minv(shkp, obj);
    }
  }
}

async function makekops(mm: struct_nhcoord | null): Promise<void> {
  let k_cnt = new Int32Array(4);
  let cnt = 0;
  let mndx = 0;
  let k = 0;
  k_cnt[0] = cnt = Math.abs(depth(G.u.uz)) + rnd(5);
  k_cnt[1] = (cnt / 3 | 0) + 1;
  k_cnt[2] = cnt / 6 | 0;
  k_cnt[3] = cnt / 9 | 0;
  for (k = 0; k < 4; ++k) {
    if ((cnt = k_cnt[k]) === 0) {
      break;
    }
    mndx = makekops$k_mndx[k];
    if (G.mvitals[mndx].mvflags & G_GONE) {
      continue;
    }
    while (cnt--) {
      if (await enexto(mm, mm.x, mm.y, $sat(G.mons, mndx))) {
        await makemon($sat(G.mons, mndx), mm.x, mm.y, NO_MM_FLAGS);
      }
    }
  }
}

export async function pay_for_damage(dmgstr: Ptr | null, cant_mollify: number): Promise<void> {
  let $g = 0;
  let shkp = null;
  let shops_affected = new Int8Array(5);
  let uinshp = 0;
  let qbuf = new Int8Array(80);
  let x = 0;
  let y = 0;
  let dugwall = 0;
  let animal = 0;
  let pursue = 0;
  let tmp_dam = null;
  let appear_here = null;
  let cost_of_damage = 0;
  let nearest_shk = 0;
  let nearest_damage = 0;
  let picks = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      shkp = null;
      shops_affected = new Int8Array(5);
      uinshp = ($rd(P(G.u.ushops)) !== 0 ? 1 : 0) << 24 >> 24;
      qbuf = new Int8Array(80);
      dugwall = (!strcmp(dmgstr, S("dig into")) || !strcmp(dmgstr, S("damage")) ? 1 : 0) << 24 >> 24;
      appear_here = null;
      cost_of_damage = 0;
      nearest_shk = Math.imul(ROWNO, ROWNO) + Math.imul(COLNO, COLNO);
      nearest_damage = nearest_shk;
      picks = 0;
      for (tmp_dam = G.level.damagelist; tmp_dam; tmp_dam = tmp_dam.next) {
        let shp = null;
        if (tmp_dam.when !== G.monstermoves || !tmp_dam.cost) {
          continue;
        }
        cost_of_damage += tmp_dam.cost;
        strcpy(P(shops_affected), in_rooms(tmp_dam.place.x, tmp_dam.place.y, SHOPBASE));
        for (shp = P(shops_affected); shp.a[shp.o]; shp = shp.add(1)) {
          let tmp_shk = null;
          let shk_distance = 0;
          if (!(tmp_shk = await shop_keeper(shp.a[shp.o]))) {
            continue;
          }
          if (tmp_shk === shkp) {
            let damage_distance = dist2(tmp_dam.place.x, tmp_dam.place.y, G.u.ux, G.u.uy) >>> 0;
            if (damage_distance < nearest_damage) {
              nearest_damage = damage_distance;
              appear_here = tmp_dam;
            }
            continue;
          }
          if (!inhishop(tmp_shk)) {
            continue;
          }
          shk_distance = dist2(tmp_shk.mx, tmp_shk.my, G.u.ux, G.u.uy) >>> 0;
          if (shk_distance > nearest_shk) {
            continue;
          }
          if (shk_distance === nearest_shk && picks) {
            if (rn2(++picks)) {
              continue;
            }
          } else {
            picks = 1;
          }
          shkp = tmp_shk;
          nearest_shk = shk_distance;
          appear_here = tmp_dam;
          nearest_damage = dist2(tmp_dam.place.x, tmp_dam.place.y, G.u.ux, G.u.uy) >>> 0;
        }
      }
      if (!cost_of_damage || !shkp) {
        return;
      }
      animal = (shkp.data.msound <= MS_ANIMAL ? 1 : 0) << 24 >> 24;
      pursue = FALSE;
      x = appear_here.place.x;
      y = appear_here.place.y;
      strncpy(P(shkp.mextra.eshk.customer), P(G.plname), PL_NSIZ);
      if (!shkp.mpeaceful || shkp.mextra.eshk.following) {
        hot_pursuit(shkp);
        return;
      }
      if (!$rd(in_rooms(shkp.mx, shkp.my, SHOPBASE))) {
        if (!($rd(G.viz_array.a[G.viz_array.o + shkp.my], shkp.mx) & 2)) {
          return;
        }
        pursue = TRUE;
        { $g = 1; continue $L; }
      }
      if (uinshp) {
        if (um_dist(shkp.mx, shkp.my, 1) && !um_dist(shkp.mx, shkp.my, 3)) {
          await pline(S("%s leaps towards you!"), await Shknam(shkp));
          await mnexto(shkp);
        }
        pursue = um_dist(shkp.mx, shkp.my, 1);
        if (pursue) {
          { $g = 1; continue $L; }
        }
      } else {
        if (!!G.level.monsters[x][y]) {
          if (!animal) {
            if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
              await You_hear(S("an angry voice:"));
              await verbalize(S("Out of my way, scum!"));
            }
            await G.windowprocs.win_wait_synch();
            await sleep(1);
          } else {
            await growl(shkp);
          }
        }
        await mnearto(shkp, x, y, TRUE);
      }
      if (!(um_dist(x, y, 1) && !uinshp || cant_mollify || money_cnt(G.invent) + shkp.mextra.eshk.credit < cost_of_damage || !rn2(50))) { $g = 2; continue $L; }
    case 1: // getcad
      if (shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) {
        if (animal && shkp.mcanmove | 0 && !shkp.msleeping) {
          await yelp(shkp);
        }
      } else if (pursue || uinshp || !um_dist(x, y, 1)) {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await verbalize(S("How dare you %s my %s?"), dmgstr, dugwall ? S("shop") : S("door"));
        } else {
          await pline(S("%s is %s that you decided to %s %s %s!"), await Shknam(shkp), angrytexts[rn2(Math.trunc(24 / 8) | 0)], dmgstr, G.genders[pronoun_gender(shkp, 1)].his, dugwall ? S("shop") : S("door"));
        }
      } else {
        if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
          await pline(S("%s shouts:"), await Shknam(shkp));
          await verbalize(S("Who dared %s my %s?"), dmgstr, dugwall ? S("shop") : S("door"));
        } else {
          await pline(S("%s is %s that someone decided to %s %s %s!"), await Shknam(shkp), angrytexts[rn2(Math.trunc(24 / 8) | 0)], dmgstr, G.genders[pronoun_gender(shkp, 1)].his, dugwall ? S("shop") : S("door"));
        }
      }
      hot_pursuit(shkp);
      return;
    case 2:
      if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked) {
        await Your(S("invisibility does not fool %s!"), await shkname(shkp));
      }
      sprintf(P(qbuf), S("%sYou did %ld %s worth of damage!%s  Pay?"), !animal ? await cad(TRUE) : S(""), cost_of_damage, await currency(cost_of_damage), !animal ? S("\"") : S(""));
      if (await yn_function(P(qbuf), P(G.ynchars), 110) !== 110) {
        cost_of_damage = await check_credit(cost_of_damage, shkp);
        if (cost_of_damage > 0) {
          await money2mon(shkp, cost_of_damage);
          G.context.botl = 1;
        }
        await pline(S("Mollified, %s accepts your restitution."), await shkname(shkp));
        await home_shk(shkp, FALSE);
        pacify_shk(shkp);
      } else {
        if (!animal) {
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
            await verbalize(S("Oh, yes!  You'll pay!"));
          } else {
            await pline(S("%s lunges %s %s toward your %s!"), await Shknam(shkp), G.genders[pronoun_gender(shkp, 1)].his, mbodypart(shkp, HAND), body_part(NECK));
          }
        } else {
          await growl(shkp);
        }
        hot_pursuit(shkp);
        adjalign(-sgn(G.u.ualign.type));
      }
    }
    break;
  }
}

export async function costly_spot(x: number, y: number): Promise<number> {
  let shkp = null;
  let eshkp = null;
  if (!G.level.flags.has_shop) {
    return FALSE;
  }
  shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)));
  if (!shkp || !inhishop(shkp)) {
    return FALSE;
  }
  eshkp = shkp.mextra.eshk;
  return (inside_shop(x, y) && !(x === eshkp.shk.x && y === eshkp.shk.y) ? 1 : 0) << 24 >> 24;
}

export async function shop_object(x: number, y: number): Promise<struct_obj | null> {
  let otmp = null;
  let shkp = null;
  if (!(shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)))) || !inhishop(shkp)) {
    return null;
  }
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.oclass !== COIN_CLASS) {
      break;
    }
  }
  return otmp && await costly_spot(x, y) && shkp.mpeaceful | 0 && shkp.mcanmove | 0 && !shkp.msleeping ? otmp : null;
}

export async function price_quote(first_obj: struct_obj | null): Promise<void> {
  let otmp = null;
  let buf = new Int8Array(256);
  let price = new Int8Array(40);
  let cost = 0;
  let cnt = 0;
  let contentsonly = FALSE;
  let tmpwin = 0;
  let shkp = await shop_keeper(inside_shop(G.u.ux, G.u.uy));
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_putstr(tmpwin, 0, S("Fine goods for sale:"));
  await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  for (otmp = first_obj; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    cost = otmp.no_charge | 0 || otmp === G.uball || otmp === G.uchain ? 0 : await get_cost(otmp, shkp);
    contentsonly = (!cost ? 1 : 0) << 24 >> 24;
    if (!!otmp.cobj) {
      cost += await contained_cost(otmp, shkp, 0, FALSE, FALSE);
    }
    if (otmp.globby) {
      cost = cost * await get_pricing_units(otmp);
    }
    if (!cost) {
      strcpy(P(price), S("no charge"));
      contentsonly = FALSE;
    } else {
      sprintf(P(price), S("%ld %s%s"), cost, await currency(cost), otmp.quan > 1 ? S(" each") : S(""));
    }
    sprintf(P(buf), S("%s%s, %s"), contentsonly ? P(the_contents_of) : S(""), await doname(otmp), P(price));
    await G.windowprocs.win_putstr(tmpwin, 0, P(buf)), ++cnt;
  }
  if (cnt > 1) {
    await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
  } else if (cnt === 1) {
    if (!cost) {
      await pline(S("%s!"), upstart(P(buf)));
    } else {
      sprintf(P(buf), S("%s%s"), contentsonly ? P(the_contents_of) : S(""), await doname(first_obj));
      await pline(S("%s, price %ld %s%s%s"), upstart(P(buf)), cost, await currency(cost), first_obj.quan > 1 ? S(" each") : S(""), contentsonly ? S(".") : shk_embellish(first_obj, cost));
    }
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
}

function shk_embellish(itm: struct_obj | null, cost: number): Ptr | null {
  if (!rn2(3)) {
    let o = 0;
    let choice = rn2(5);
    if (choice === 0) {
      choice = cost < 100 ? 1 : cost < 500 ? 2 : 3;
    }
    switch (choice) {
    case 4:
      if (cost < 10) {
        break;
      } else {
        o = itm.oclass;
      }
      if (o === FOOD_CLASS) {
        return S(", gourmets' delight!");
      }
      if (G.objects[itm.otyp].oc_name_known | 0 ? G.objects[itm.otyp].oc_magic | 0 : o === AMULET_CLASS || o === RING_CLASS || o === WAND_CLASS || o === POTION_CLASS || o === SCROLL_CLASS || o === SPBOOK_CLASS ? 1 : 0) {
        return S(", painstakingly developed!");
      }
      return S(", superb craftsmanship!");
    case 3:
      return S(", finest quality.");
    case 2:
      return S(", an excellent choice.");
    case 1:
      return S(", a real bargain.");
    default:
      break;
    }
  } else if (itm.oartifact) {
    return S(", one of a kind!");
  }
  return S(".");
}

export async function shk_chat(shkp: struct_monst | null): Promise<void> {
  let eshk = null;
  let shkmoney = 0;
  if (!shkp.isshk) {
    await pline(S("%s asks whether you've seen any untended shops recently."), await Monnam(shkp));
    return;
  }
  eshk = shkp.mextra.eshk;
  if (!shkp.mpeaceful) {
    await pline(S("%s %s how much %s dislikes %s customers."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("mentions") : S("indicates"), G.genders[pronoun_gender(shkp, 1)].he, eshk.robbed ? S("non-paying") : S("rude"));
  } else if (eshk.following) {
    if (strncmp(P(eshk.customer), P(G.plname), PL_NSIZ)) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(S("%s %s!  I was looking for %s."), Hello(shkp), P(G.plname), P(eshk.customer));
      }
      eshk.following = 0;
    } else {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
        await verbalize(S("%s %s!  Didn't you forget to pay?"), Hello(shkp), P(G.plname));
      } else {
        await pline(S("%s taps you on the %s."), await Shknam(shkp), body_part(ARM));
      }
    }
  } else if (eshk.billct) {
    let total = addupbill(shkp) + eshk.debit;
    await pline(S("%s %s that your bill comes to %ld %s."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("says") : S("indicates"), total, await currency(total));
  } else if (eshk.debit) {
    await pline(S("%s %s that you owe %s %ld %s."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("reminds you") : S("indicates"), G.genders[pronoun_gender(shkp, 1)].him, eshk.debit, await currency(eshk.debit));
  } else if (eshk.credit) {
    await pline(S("%s encourages you to use your %ld %s of credit."), await Shknam(shkp), eshk.credit, await currency(eshk.credit));
  } else if (eshk.robbed) {
    await pline(S("%s %s about a recent robbery."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("complains") : S("indicates concern"));
  } else if ((shkmoney = money_cnt(shkp.minvent)) < 50) {
    await pline(S("%s %s that business is bad."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("complains") : S("indicates"));
  } else if (shkmoney > 4000) {
    await pline(S("%s %s that business is good."), await Shknam(shkp), !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13) ? S("says") : S("indicates"));
  } else if (is_izchak(shkp, FALSE)) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await pline(G.Izchak_speaks[rn2(Math.trunc(72 / 8) | 0)], await shkname(shkp));
    }
  } else {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
      await pline(S("%s talks about the problem of shoplifters."), await Shknam(shkp));
    }
  }
}

async function kops_gone(silent: number): Promise<void> {
  let cnt = 0;
  let mtmp = null;
  let mtmp2 = null;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
    mtmp2 = mtmp.nmon;
    if (mtmp.data.mlet === S_KOP) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
        ++cnt;
      }
      await mongone(mtmp);
    }
  }
  if (cnt && !silent) {
    await pline_The(S("Kop%s (disappointed) vanish%s into thin air."), cnt === 1 ? S("") : S("s"), cnt === 1 ? S("es") : S(""));
  }
}

async function cost_per_charge(shkp: struct_monst | null, otmp: struct_obj | null, altusage: number): Promise<number> {
  let tmp = 0;
  if (!shkp || !inhishop(shkp)) {
    return 0;
  }
  tmp = await get_cost(otmp, shkp);
  if (otmp.otyp === MAGIC_LAMP) {
    if (!altusage) {
      tmp = G.objects[OIL_LAMP].oc_cost;
    } else {
      tmp += Math.trunc(tmp / 3);
    }
  } else if (otmp.otyp === MAGIC_MARKER) {
    tmp = Math.trunc(tmp / 2);
  } else if (otmp.otyp === BAG_OF_TRICKS || otmp.otyp === HORN_OF_PLENTY) {
    if (!altusage) {
      tmp = Math.trunc(tmp / 5);
    }
  } else if (otmp.otyp === CRYSTAL_BALL || otmp.otyp === OIL_LAMP || otmp.otyp === BRASS_LANTERN || otmp.otyp >= MAGIC_FLUTE && otmp.otyp <= DRUM_OF_EARTHQUAKE || otmp.oclass === WAND_CLASS) {
    if (otmp.spe > 1) {
      tmp = Math.trunc(tmp / 4);
    }
  } else if (otmp.oclass === SPBOOK_CLASS) {
    tmp -= Math.trunc(tmp / 5);
  } else if (otmp.otyp === CAN_OF_GREASE || otmp.otyp === TINNING_KIT || otmp.otyp === EXPENSIVE_CAMERA) {
    tmp = Math.trunc(tmp / 10);
  } else if (otmp.otyp === POT_OIL) {
    tmp = Math.trunc(tmp / 5);
  }
  return tmp;
}

export async function check_unpaid_usage(otmp: struct_obj | null, altusage: number): Promise<void> {
  let shkp = null;
  let fmt = null;
  let arg1 = null;
  let arg2 = null;
  let buf = new Int8Array(256);
  let tmp = 0;
  if (!otmp.unpaid || !$rd(P(G.u.ushops)) || otmp.spe <= 0 && G.objects[otmp.otyp].oc_charged | 0) {
    return;
  }
  if (!(shkp = await shop_keeper($rd(P(G.u.ushops)))) || !inhishop(shkp)) {
    return;
  }
  if ((tmp = await cost_per_charge(shkp, otmp, altusage)) === 0) {
    return;
  }
  arg1 = arg2 = S("");
  if (otmp.oclass === SPBOOK_CLASS) {
    fmt = S("%sYou owe%s %ld %s.");
    sprintf(P(buf), S("This is no free library, %s!  "), await cad(FALSE));
    arg1 = rn2(2) ? P(buf) : S("");
    arg2 = shkp.mextra.eshk.debit > 0 ? S(" an additional") : S("");
  } else if (otmp.otyp === POT_OIL) {
    fmt = S("%s%sThat will cost you %ld %s (Yendorian Fuel Tax).");
  } else if (altusage && (otmp.otyp === BAG_OF_TRICKS || otmp.otyp === HORN_OF_PLENTY)) {
    fmt = S("%s%sEmptying that will cost you %ld %s.");
    if (!rn2(3)) {
      arg1 = S("Whoa!  ");
    }
    if (!rn2(3)) {
      arg1 = S("Watch it!  ");
    }
  } else {
    fmt = S("%s%sUsage fee, %ld %s.");
    if (!rn2(3)) {
      arg1 = S("Hey!  ");
    }
    if (!rn2(3)) {
      arg2 = S("Ahem.  ");
    }
  }
  if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && !(shkp.msleeping | 0 || !shkp.mcanmove || shkp.data.msound <= 13)) {
    await verbalize(fmt, arg1, arg2, tmp, await currency(tmp));
    await exercise(A_WIS, TRUE);
  }
  shkp.mextra.eshk.debit += tmp;
}

export async function check_unpaid(otmp: struct_obj | null): Promise<void> {
  await check_unpaid_usage(otmp, FALSE);
}

export async function costly_gold(x: number, y: number, amount: number): Promise<void> {
  let delta = 0;
  let shkp = null;
  let eshkp = null;
  if (!await costly_spot(x, y)) {
    return;
  }
  shkp = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)));
  eshkp = shkp.mextra.eshk;
  if (eshkp.credit >= amount) {
    if (eshkp.credit > amount) {
      await Your(S("credit is reduced by %ld %s."), amount, await currency(amount));
    } else {
      await Your(S("credit is erased."));
    }
    eshkp.credit -= amount;
  } else {
    delta = amount - eshkp.credit;
    if (eshkp.credit) {
      await Your(S("credit is erased."));
    }
    if (eshkp.debit) {
      await Your(S("debt increases by %ld %s."), delta, await currency(delta));
    } else {
      await You(S("owe %s %ld %s."), await shkname(shkp), delta, await currency(delta));
    }
    eshkp.debit += delta;
    eshkp.loan += delta;
    eshkp.credit = 0;
  }
}

export async function block_door(x: number, y: number): Promise<number> {
  let roomno = $rd(in_rooms(x, y, SHOPBASE));
  let shkp = null;
  if (roomno < 0 || !(G.rooms[roomno].rtype >= SHOPBASE)) {
    return FALSE;
  }
  if (!($at2(G.level.locations, x, y).typ === DOOR)) {
    return FALSE;
  }
  if (roomno !== $rd(P(G.u.ushops))) {
    return FALSE;
  }
  if (!(shkp = await shop_keeper(roomno << 24 >> 24)) || !inhishop(shkp)) {
    return FALSE;
  }
  if (shkp.mx === shkp.mextra.eshk.shk.x && shkp.my === shkp.mextra.eshk.shk.y && shkp.mextra.eshk.shd.x === x && shkp.mextra.eshk.shd.y === y && shkp.mcanmove | 0 && !shkp.msleeping && (shkp.mextra.eshk.debit || shkp.mextra.eshk.billct || shkp.mextra.eshk.robbed)) {
    await pline(S("%s%s blocks your way!"), await Shknam(shkp), (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? S(" senses your motion and") : S(""));
    return TRUE;
  }
  return FALSE;
}

export async function block_entry(x: number, y: number): Promise<number> {
  let sx = 0;
  let sy = 0;
  let roomno = 0;
  let shkp = null;
  if (!($at2(G.level.locations, G.u.ux, G.u.uy).typ === DOOR && ($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) === D_BROKEN)) {
    return FALSE;
  }
  roomno = $rd(in_rooms(x, y, SHOPBASE));
  if (roomno < 0 || !(G.rooms[roomno].rtype >= SHOPBASE)) {
    return FALSE;
  }
  if (!(shkp = await shop_keeper(roomno << 24 >> 24)) || !inhishop(shkp)) {
    return FALSE;
  }
  if (shkp.mextra.eshk.shd.x !== G.u.ux || shkp.mextra.eshk.shd.y !== G.u.uy) {
    return FALSE;
  }
  sx = shkp.mextra.eshk.shk.x;
  sy = shkp.mextra.eshk.shk.y;
  if (shkp.mx === sx && shkp.my === sy && shkp.mcanmove | 0 && !shkp.msleeping && (x === sx - 1 || x === sx + 1 || y === sy - 1 || y === sy + 1) && ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked || carrying(PICK_AXE) || carrying(DWARVISH_MATTOCK) || G.u.usteed)) {
    await pline(S("%s%s blocks your way!"), await Shknam(shkp), (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked ? S(" senses your motion and") : S(""));
    return TRUE;
  }
  return FALSE;
}

export async function shk_your(buf: Ptr | null, obj: struct_obj | null): Promise<Ptr | null> {
  if (!await shk_owns(buf, obj) && !await mon_owns(buf, obj)) {
    strcpy(buf, G.c_common_strings.c_the_your[obj.where === 3 ? 1 : 0]);
  }
  return strcat(buf, S(" "));
}

export async function Shk_Your(buf: Ptr | null, obj: struct_obj | null): Promise<Ptr | null> {
  await shk_your(buf, obj);
  buf.a[buf.o] = highc(buf.a[buf.o]);
  return buf;
}

async function shk_owns(buf: Ptr | null, obj: struct_obj | null): Promise<Ptr | null> {
  let shkp = null;
  const x = new Int8Array(1);
  const y = new Int8Array(1);
  if (get_obj_location(obj, P(x, 0), P(y, 0), 0) && (obj.unpaid | 0 || obj.where === OBJ_FLOOR && !obj.no_charge && await costly_spot(x[0], y[0]))) {
    shkp = await shop_keeper(inside_shop(x[0], y[0]));
    return strcpy(buf, shkp ? s_suffix(await shkname(shkp)) : G.c_common_strings.c_the_your[0]);
  }
  return null;
}

async function mon_owns(buf: Ptr | null, obj: struct_obj | null): Promise<Ptr | null> {
  if (obj.where === OBJ_MINVENT) {
    return strcpy(buf, s_suffix(await y_monnam(obj.v.v_ocarry)));
  }
  return null;
}

async function cad(altusage: number): Promise<Ptr | null> {
  let res = null;
  switch ((G.youmonst.data.mflags2 & 256) >>> 0 !== 0 ? 3 : poly_gender()) {
  case 0:
    res = S("cad");
    break;
  case 1:
    res = S("minx");
    break;
  case 2:
    res = S("beast");
    break;
  case 3:
    res = S("fiend");
    break;
  default:
    await impossible(S("cad: unknown gender"));
    res = S("thing");
    break;
  }
  if (altusage) {
    let cadbuf = await mon_nam(G.youmonst);
    sprintf(cadbuf, S("\"%s!  "), res);
    cadbuf.a[cadbuf.o + 1] = highc(cadbuf.a[cadbuf.o + 1]);
    res = cadbuf;
  }
  return res;
}

export async function globby_bill_fixup(obj_absorber: struct_obj | null, obj_absorbed: struct_obj | null): Promise<void> {
  let x = 0;
  let y = 0;
  let bp = null;
  let bp_absorber = null;
  const shkp = [null];
  shkp[0] = null;
  let eshkp = null;
  let amount = 0;
  let per_unit_cost = await set_cost(obj_absorbed, shkp[0]);
  let floor_absorber = (obj_absorber.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24;
  if (!obj_absorber.globby) {
    await impossible(S("globby_bill_fixup called for non-globby object"));
  }
  if (floor_absorber) {
    x = obj_absorber.ox, y = obj_absorber.oy;
  }
  if (obj_absorber.unpaid) {
    for (shkp[0] = next_shkp(G.level.monlist, TRUE); shkp[0]; shkp[0] = next_shkp(shkp[0].nmon, TRUE)) {
      if (await onbill(obj_absorber, shkp[0], TRUE)) {
        break;
      }
    }
  } else if (obj_absorbed.unpaid) {
    if (obj_absorbed.where === OBJ_FREE && floor_absorber && await costly_spot(x, y)) {
      shkp[0] = await shop_keeper($rd(in_rooms(x, y, SHOPBASE)));
    }
  }
  if (!shkp[0]) {
    shkp[0] = await shop_keeper($rd(P(G.u.ushops)));
  }
  if (!shkp[0]) {
    return;
  }
  bp_absorber = await onbill(obj_absorber, shkp[0], FALSE);
  bp = await onbill(obj_absorbed, shkp[0], FALSE);
  eshkp = shkp[0].mextra.eshk;
  if (bp && (!obj_absorber.no_charge || await billable(P(shkp, 0), obj_absorber, eshkp.shoproom, FALSE))) {
    amount = bp.price;
    --eshkp.billct;
    bp.$cp($sadd(eshkp.bill_p, eshkp.billct));
    await clear_unpaid_obj(shkp[0], obj_absorbed);
    if (bp_absorber) {
      bp_absorber.price += amount;
    } else {
      ;
    }
    return;
  }
  if (!bp_absorber && !bp && !obj_absorber.no_charge) {
    amount = await get_pricing_units(obj_absorbed) * per_unit_cost;
    if (saleable(shkp[0], obj_absorbed)) {
      if (eshkp.debit >= amount) {
        if (eshkp.loan) {
          if (eshkp.loan >= amount) {
            eshkp.loan -= amount;
          } else {
            eshkp.loan = 0;
          }
        }
        eshkp.debit -= amount;
        await pline_The(S("donated %s %spays off your debt."), await obj_typename(obj_absorbed.otyp), eshkp.debit ? S("partially ") : S(""));
      } else {
        let delta = amount - eshkp.debit;
        eshkp.credit += delta;
        if (eshkp.debit) {
          eshkp.debit = 0;
          eshkp.loan = 0;
          await Your(S("debt is paid off."));
        }
        if (eshkp.credit === delta) {
          await pline_The(S("%s established %ld %s credit."), await obj_typename(obj_absorbed.otyp), delta, await currency(delta));
        } else {
          await pline_The(S("%s added %ld %s %s %ld %s."), await obj_typename(obj_absorbed.otyp), delta, await currency(delta), S("to your credit; total is now"), eshkp.credit, await currency(eshkp.credit));
        }
      }
    }
    return;
  } else if (bp_absorber) {
    bp_absorber.price += per_unit_cost * await get_pricing_units(obj_absorbed);
    return;
  }
  if (bp && (obj_absorber.no_charge | 0 || floor_absorber && !await costly_spot(x, y))) {
    amount = bp.price;
    await bill_dummy_object(obj_absorbed);
    await verbalize(S("You owe me %ld %s for my %s that you %s with your%s"), amount, await currency(amount), await obj_typename(obj_absorbed.otyp), !shkp[0].mpeaceful ? S("had the audacity to mix") : S("just mixed"), !shkp[0].mpeaceful ? S(" stinking batch!") : S("s."));
    return;
  }
  return;
}

export function $init(): void {
  followmsg = 0;
  and_its_contents = $cs(" and its contents", 18);
  the_contents_of = $cs("the contents of ", 17);
  angrytexts = [S("quite upset"), S("ticked off"), S("furious")];
  no_money = $cs("Moreover, you%s have no money.", 31);
  not_enough_money = $cs("Besides, you don't have enough to interest %s.", 47);
  repo = new struct_repo();
  sell_response = 97;
  sell_how = 0;
  auto_credit = 0;
  G.Izchak_speaks = [S("%s says: 'These shopping malls give me a headache.'"),
S("%s says: 'Slow down.  Think clearly.'"),
S("%s says: 'You need to take things one at a time.'"),
S("%s says: 'I don't like poofy coffee... give me Colombian Supremo.'"),
S("%s says that getting the devteam's agreement on anything is difficult."),
S("%s says that he has noticed those who serve their deity will prosper."),
S("%s says: 'Don't try to steal from me - I have friends in high places!'"),
S("%s says: 'You may well need something from this shop in the future.'"),
S("%s comments about the Valley of the Dead as being a gateway.")];
  u_entered_shop$empty_shops = new Int8Array(5);
  pick_pick$pickmovetime = 0;
  append_honorific$honored = [S("good"),
S("honored"),
S("most gracious"),
S("esteemed"),
S("most renowned and sacred")];
  makekops$k_mndx = $ta(Int16Array, 4, [PM_KEYSTONE_KOP, PM_KOP_SERGEANT, PM_KOP_LIEUTENANT, PM_KOP_KAPTAIN]);
}
