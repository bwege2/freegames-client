// @ts-nocheck
// NetHack 3.6.7 pickup.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_lit } from './apply.ts';
import { touch_artifact } from './artifact.ts';
import { exercise } from './attrib.ts';
import { bot } from './botl.ts';
import { get_adjacent_loc, isok, yn_function } from './cmd.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { flush_screen, newsym, newsym_force } from './display.ts';
import { doaltarobj, dropx, dropy, revive_corpse } from './do.ts';
import { Monnam, christen_monst, docall, hliquid, mon_nam, oname, rndmonnam, x_monnam } from './do_name.ts';
import { hitfloor } from './dothrow.ts';
import { def_char_to_objclass } from './drawing.ts';
import { container_contents, panic } from './end.ts';
import { can_reach_floor, cant_reach_floor, ceiling, freehand, read_engr_at, surface } from './engrave.ts';
import { debugcore } from './files.ts';
import { calc_capacity, check_capacity, in_rooms, inv_cnt, losehp, max_capacity, money_cnt, near_capacity, nomul, obj_to_any } from './hack.ts';
import { dist2, strsubst } from './hacklib.ts';
import { addinv, askchain, carrying, consume_obj_charge, count_buc, count_unpaid, currency, display_inventory, feel_cockatrice, freeinv, g_at, getobj, hold_another_object, is_worn, let_to_name, look_here, merge_choice, merged, nxtobj, obj_here, prinv, sobj_at, sortloot, tally_BUCX, unsortloot, update_inventory, useup, useupf, will_feel_cockatrice } from './invent.ts';
import { obj_is_burning } from './light.ts';
import { boxlock } from './lock.ts';
import { bagotricks, makemon, set_malign } from './makemon.ts';
import { add_to_container, add_to_minv, hornoplenty, obj_extract_self, set_bknown, set_corpsenm, splitobj, start_corpse_timeout, unsplitobj, weight } from './mkobj.ts';
import { courtmon } from './mkroom.ts';
import { hideunder } from './mon.ts';
import { monsndx, poly_when_stoned, stagger } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { Doname2, The, Tobjnam, Yname2, Ysimple_name2, an, ansimpleoname, corpse_xname, doname, doname_with_price, killer_xname, makesingular, otense, safe_qbuf, simpleonames, the, thesimpleoname, vtense, xname, yname, ysimple_name } from './objnam.ts';
import { self_lookat } from './pager.ts';
import { Norep, There, You, You_cant, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part, polymon } from './polyself.ts';
import { regex_match } from './posixregex.ts';
import { d, rn2, rnd } from './rnd.ts';
import { Shk_Your, addtobill, check_unpaid_usage, costly_spot, delete_contents, obfree, pick_pick, remote_burglary, sellobj, sellobj_state, shop_keeper, stolen_value, subfrombill } from './shk.ts';
import { rider_cant_reach } from './steed.ts';
import { stop_timer } from './timeout.ts';
import { chest_trap, instapetrify, t_at, uescaped_shaft, unconscious, uteetering_at_seen_pit } from './trap.ts';
import { setuqwep, setuswapwep, setuwep, welded, weldmsg } from './wield.ts';
import { worm_known } from './worm.ts';
import { update_mon_intrinsics, which_armor } from './worn.ts';
import { get_obj_location } from './zap.ts';
import { struct_autopickup_exception, struct_mi, struct_monst, struct_nhcoord, struct_obj, union_any } from './structs.ts';
import { $at2, $cs, $rd, $sadd, $sarr, $sat, $ta, $u64, $wr, G, P, S, free, rn2_on_display_rng, sprintf, strcat, strchr, strcmp, strcpy, strncmp } from './rt/index.ts';
import { ALLOW_COUNT, ALL_CLASSES, ALL_TYPES, ALL_TYPES_SELECTED, ALTAR, AMULET_OF_YENDOR, ARTICLE_THE, ATR_NONE, AUTOSELECT_SINGLE, A_WIS, BAG_OF_HOLDING, BAG_OF_TRICKS, BELL_OF_OPENING, BILLED_TYPES, BLINDED, BOULDER, BUCX_TYPES, BUC_BLESSED, BUC_CURSED, BUC_UNCURSED, BUC_UNKNOWN, BY_NEXTHERE, CANDELABRUM_OF_INVOCATION, CAN_OF_GREASE, CHEST, CHOOSE_ALL, COIN_CLASS, CONFUSION, CONTAINED_SYM, CORPSE, CRAM_RATION, CXN_ARTICLE, CXN_SINGULAR, DETECT_MONSTERS, EXPL_MAX, FALSE, FEEL_COCKATRICE, FOOD_RATION, FOOT, GOLD_PIECE, GRAVE, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, HORN_OF_PLENTY, HVY_ENCUMBER, ICE_BOX, INCLUDE_HERO, INFRAVISION, INVORDER_SORT, KILLED_BY_AN, LEASH, LEMBAS_WAFER, LOADSTONE, MAGIC_LAMP, MAXPCHARS, MENU_FULL, MENU_PARTIAL, MENU_SELECTED, MENU_TRADITIONAL, MENU_UNSELECTED, MM_ADJACENTOK, MOD_ENCUMBER, NHW_MENU, NHW_TEXT, NO_GLYPH, NO_MINVENT, NO_MM_FLAGS, OBJ_CONTAINED, OBJ_FLOOR, OBJ_MINVENT, OIL_LAMP, PICK_ANY, PICK_NONE, PICK_ONE, PLNMSG_OBJNAM_ONLY, PM_HOUSECAT, PM_STONE_GOLEM, POTION_CLASS, POT_OIL, P_BASIC, P_PICK_AXE, P_RIDING, REVIVE_MON, ROT_CORPSE, SCR_SCARE_MONSTER, SEE_INVIS, SELL_DELIBERATE, SELL_DONTSELL, SELL_NORMAL, SHOPBASE, SIGNAL_ESCAPE, SIGNAL_NOMENU, SLT_ENCUMBER, SORTLOOT_INVLET, SORTLOOT_LOOT, SORTLOOT_PACK, SORTLOOT_PETRIFY, SPE_BOOK_OF_THE_DEAD, SPE_WIZARD_LOCK, STATUE, STONE_RES, STUNNED, SUPPRESS_SADDLE, TELEPAT, THRONE, TOOL_CLASS, TRUE, T_LOOTED, UNENCUMBERED, UNPAID_TYPES, USE_INVLET, VENOM_CLASS, WAN_CANCELLATION, WARN_OF_MON, WEAPON_CLASS, WIN_ERR, WORN_TYPES, W_ACCESSORY, W_ARMOR, W_SADDLE, W_WEAPONS } from './consts.ts';

let current_container: struct_obj | null;
let abort_looting: number;
let moderateloadmsg: any;
let nearloadmsg: any;
let overloadmsg: any;
let val_for_n_or_more: number;
let valid_menu_classes: any;
let class_filter: number;
let bucx_filter: number;
let shop_filter: number;
let stashable: any;
let tippables: any;
let add_valid_menu_class$vmc_count: number;
let autopick_testobj$costly: number;
let encumber_msg$oldcap: number;
let observe_quantum_cat$sc: any;
let explain_container_prompt$explaintext: any;
let in_or_out_menu$lootchars: any;
let in_or_out_menu$abc_chars: any;

async function simple_look(otmp: struct_obj | null, here: number): Promise<void> {
  if (!otmp) {
    await impossible(S("simple_look(null)"));
  } else if (!(here ? otmp.v.v_nexthere : otmp.nobj)) {
    await pline(S("%s"), await doname(otmp));
  } else {
    let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_putstr(tmpwin, 0, S(""));
    do {
      await G.windowprocs.win_putstr(tmpwin, 0, await doname(otmp));
      otmp = here ? otmp.v.v_nexthere : otmp.nobj;
    } while (otmp);
    await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
    await G.windowprocs.win_destroy_nhwindow(tmpwin);
  }
}

export async function collect_obj_classes(ilets: Ptr | null, otmp: struct_obj | null, here: number, filter: Function | null, itemcount: Ptr | null): Promise<number> {
  let iletct = 0;
  let c = 0;
  itemcount.a[itemcount.o] = 0;
  ilets.a[ilets.o + iletct] = 0;
  while (otmp) {
    c = G.def_oc_syms[otmp.oclass].sym;
    if (!strchr(ilets, c) && (!filter || await filter(otmp))) {
      ilets.a[ilets.o + iletct++] = c, ilets.a[ilets.o + iletct] = 0;
    }
    itemcount.a[itemcount.o] += 1;
    otmp = here ? otmp.v.v_nexthere : otmp.nobj;
  }
  return iletct;
}

async function query_classes(oclasses: Ptr | null, one_at_a_time: Ptr | null, everything: Ptr | null, action: Ptr | null, objs: struct_obj | null, here: number, menu_on_demand: Ptr | null): Promise<number> {
  let $t1: any;
  let $g = 0;
  let ilets = new Int8Array(36);
  let inbuf = new Int8Array(256);
  let iletct = 0;
  let oclassct = 0;
  let not_everything = 0;
  let filtered = 0;
  let qbuf = new Int8Array(128);
  let m_seen = 0;
  let itemcount = new Int32Array(1);
  let bcnt = new Int32Array(1);
  let ucnt = new Int32Array(1);
  let ccnt = new Int32Array(1);
  let xcnt = new Int32Array(1);
  let ocnt = new Int32Array(1);
  let where = null;
  let sym = 0;
  let oc_of_sym = 0;
  let p = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ilets = new Int8Array(36);
      inbuf = new Int8Array(256);
      qbuf = new Int8Array(128);
      oclasses.a[oclasses.o + (oclassct = 0)] = 0;
      one_at_a_time.a[one_at_a_time.o] = everything.a[everything.o] = m_seen = FALSE;
      if (menu_on_demand) {
        menu_on_demand.a[menu_on_demand.o] = 0;
      }
      iletct = await collect_obj_classes(P(ilets), objs, here, null, P(itemcount, 0));
      if (iletct === 0) {
        return FALSE;
      }
      if (iletct === 1) {
        oclasses.a[oclasses.o] = def_char_to_objclass(ilets[0]) << 24 >> 24;
        oclasses.a[oclasses.o + 1] = 0;
      } else {
        ilets[iletct++] = 32;
        ilets[iletct++] = 97;
        ilets[iletct++] = 65;
        ilets[iletct++] = (objs === G.invent ? 105 : 58) << 24 >> 24;
      }
      if (itemcount[0] && menu_on_demand) {
        ilets[iletct++] = 109;
      }
      if (count_unpaid(objs)) {
        ilets[iletct++] = 117;
      }
      tally_BUCX(objs, here, P(bcnt, 0), P(ucnt, 0), P(ccnt, 0), P(xcnt, 0), P(ocnt, 0));
      if (bcnt[0]) {
        ilets[iletct++] = 66;
      }
      if (ucnt[0]) {
        ilets[iletct++] = 85;
      }
      if (ccnt[0]) {
        ilets[iletct++] = 67;
      }
      if (xcnt[0]) {
        ilets[iletct++] = 88;
      }
      ilets[iletct] = 0;
      if (!(iletct > 1)) { $g = 2; continue $L; }
      where = null;
    case 1: // ask_again
      oclasses.a[oclasses.o + (oclassct = 0)] = 0;
      one_at_a_time.a[one_at_a_time.o] = everything.a[everything.o] = FALSE;
      not_everything = filtered = FALSE;
      sprintf(P(qbuf), S("What kinds of thing do you want to %s? [%s]"), action, P(ilets));
      await G.windowprocs.win_getlin(P(qbuf), P(inbuf));
      if ($rd(P(inbuf)) === 27) {
        return FALSE;
      }
      for (p = P(inbuf); (sym = $rd(($t1 = p, p = $t1.add(1), $t1))) !== 0; ) {
        if (sym === 32) {
          continue;
        } else if (sym === 65) {
          one_at_a_time.a[one_at_a_time.o] = TRUE;
        } else if (sym === 97) {
          everything.a[everything.o] = TRUE;
        } else if (sym === 58) {
          await simple_look(objs, here);
          if (objs.where === OBJ_CONTAINED) {
            objs.v.v_ocontainer.cknown = 1;
          }
          { $g = 1; continue $L; }
        } else if (sym === 105) {
          await display_inventory(null, TRUE);
          { $g = 1; continue $L; }
        } else if (sym === 109) {
          m_seen = TRUE;
        } else if (strchr(S("uBUCX"), sym)) {
          add_valid_menu_class(sym);
          filtered = TRUE;
        } else {
          oc_of_sym = def_char_to_objclass(sym) << 24 >> 24;
          if (strchr(P(ilets), sym)) {
            add_valid_menu_class(oc_of_sym);
            oclasses.a[oclasses.o + oclassct++] = oc_of_sym;
            oclasses.a[oclasses.o + oclassct] = 0;
          } else {
            if (!where) {
              where = !strcmp(action, S("pick up")) ? S("here") : !strcmp(action, S("take out")) ? S("inside") : S("");
            }
            if (where.a[where.o]) {
              await There(S("are no %c's %s."), sym, where);
            } else {
              await You(S("have no %c's."), sym);
            }
            not_everything = TRUE;
          }
        }
      }
      if (m_seen && menu_on_demand) {
        menu_on_demand.a[menu_on_demand.o] = (everything.a[everything.o] || !oclassct) && !filtered ? -2 : -3;
        return FALSE;
      }
      if (!oclassct && (!everything.a[everything.o] || not_everything)) {
        one_at_a_time.a[one_at_a_time.o] = TRUE;
        everything.a[everything.o] = FALSE;
      }
    case 2:
      return TRUE;
    }
    break;
  }
}

async function fatal_corpse_mistake(obj: struct_obj | null, remotely: number): Promise<number> {
  if (G.uarmg || remotely || obj.otyp !== CORPSE || !($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) || (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    return FALSE;
  }
  if (poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)) {
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    return FALSE;
  }
  await pline(S("Touching %s is a fatal mistake."), await corpse_xname(obj, null, CXN_SINGULAR | CXN_ARTICLE));
  await instapetrify(await killer_xname(obj));
  return TRUE;
}

export async function rider_corpse_revival(obj: struct_obj | null, remotely: number): Promise<number> {
  if (!obj || obj.otyp !== CORPSE || !($sat(G.mons, obj.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 309))) {
    return FALSE;
  }
  await pline(S("At your %s, the corpse suddenly moves..."), remotely ? S("attempted acquisition") : S("touch"));
  await revive_corpse(obj);
  await exercise(A_WIS, FALSE);
  return TRUE;
}

async function check_here(picked_some: number): Promise<void> {
  let obj = null;
  let ct = 0;
  for (obj = G.level.objects[G.u.ux][G.u.uy]; obj; obj = obj.v.v_nexthere) {
    if (obj !== G.uchain) {
      ++ct;
    }
  }
  if (ct) {
    if (G.context.run) {
      nomul(0);
    }
    await flush_screen(1);
    await look_here(ct, picked_some);
  } else {
    await read_engr_at(G.u.ux, G.u.uy);
  }
}

function n_or_more(obj: struct_obj | null): number {
  if (obj === G.uchain) {
    return FALSE;
  }
  return (obj.quan >= val_for_n_or_more ? 1 : 0) << 24 >> 24;
}

export function menu_class_present(c: number): number {
  return (c && strchr(P(valid_menu_classes), c) ? TRUE : FALSE) << 24 >> 24;
}

export function add_valid_menu_class(c: number): void {
  if (c === 0) {
    add_valid_menu_class$vmc_count = 0;
    class_filter = bucx_filter = shop_filter = FALSE;
  } else if (!menu_class_present(c)) {
    valid_menu_classes[add_valid_menu_class$vmc_count++] = c << 24 >> 24;
    switch (c) {
    case 66:
    case 85:
    case 67:
    case 88:
      bucx_filter = TRUE;
      break;
    case 117:
      shop_filter = TRUE;
      break;
    default:
      class_filter = TRUE;
      break;
    }
  }
  valid_menu_classes[add_valid_menu_class$vmc_count] = 0;
}

function all_but_uchain(obj: struct_obj | null): number {
  return (obj !== G.uchain ? 1 : 0) << 24 >> 24;
}

export function allow_all(obj: struct_obj | null): number {
  return TRUE;
}

export function allow_category(obj: struct_obj | null): number {
  if (obj.oclass === COIN_CLASS) {
    return (class_filter ? strchr(P(valid_menu_classes), COIN_CLASS) ? TRUE : FALSE : shop_filter ? obj.unpaid | 0 ? TRUE : FALSE : bucx_filter ? strchr(P(valid_menu_classes), G.iflags.goldX ? 88 : 85) ? TRUE : FALSE : TRUE) << 24 >> 24;
  }
  if (G.urole.malenum === 335 && !obj.bknown) {
    set_bknown(obj, 1);
  }
  if (class_filter && !strchr(P(valid_menu_classes), obj.oclass)) {
    return FALSE;
  }
  if (shop_filter && !obj.unpaid && !(!!obj.cobj && count_unpaid(obj.cobj) > 0)) {
    return FALSE;
  }
  if (bucx_filter) {
    let bucx = (!obj.bknown ? 88 : obj.blessed | 0 ? 66 : obj.cursed | 0 ? 67 : 85) << 24 >> 24;
    if (!strchr(P(valid_menu_classes), bucx)) {
      return FALSE;
    }
  }
  return TRUE;
}

export function is_worn_by_type(otmp: struct_obj | null): number {
  return (is_worn(otmp) && allow_category(otmp) ? TRUE : FALSE) << 24 >> 24;
}

export async function pickup(what: number): Promise<number> {
  let $g = 0;
  let i = 0;
  let n = 0;
  let res = 0;
  let count = 0;
  let n_tried = 0;
  let n_picked = 0;
  let pick_list = [null];
  let autopickup = 0;
  let objchain_p = null;
  let traverse_how = 0;
  let ct = 0;
  let lcount = 0;
  let all_of_a_type = new Int8Array(1);
  let selective = new Int8Array(1);
  let bycat = 0;
  let oclasses = new Int8Array(28);
  let obj = null;
  let obj2 = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      n_tried = 0;
      n_picked = 0;
      pick_list[0] = null;
      autopickup = (what > 0 ? 1 : 0) << 24 >> 24;
      if (autopickup && G.multi < 0 && unconscious()) {
        return 0;
      }
      if (what < 0) {
        count = -what;
      } else {
        count = 0;
      }
      if (!G.u.uswallow) {
        let ttmp = null;
        if (autopickup && (G.context.nopick || !!!G.level.objects[G.u.ux][G.u.uy] || is_pool(G.u.ux, G.u.uy) && !G.u.uinwater || is_lava(G.u.ux, G.u.uy))) {
          await read_engr_at(G.u.ux, G.u.uy);
          return 0;
        }
        if (!can_reach_floor(TRUE)) {
          if (G.multi && !G.context.run || autopickup && !G.flags.pickup || !!(ttmp = t_at(G.u.ux, G.u.uy)) && (uteetering_at_seen_pit(ttmp) || uescaped_shaft(ttmp))) {
            await read_engr_at(G.u.ux, G.u.uy);
          }
          return 0;
        }
        if (G.multi && !G.context.run || autopickup && !G.flags.pickup) {
          await check_here(FALSE);
          return 0;
        }
        if ((G.youmonst.data.mflags1 & 2048) >>> 0 !== 0) {
          if (!autopickup) {
            await You(S("are physically incapable of picking anything up."));
          } else {
            await check_here(FALSE);
          }
          return 0;
        }
        if (!!G.level.objects[G.u.ux][G.u.uy] && G.context.run && G.context.run !== 8 && !G.context.nopick) {
          nomul(0);
        }
      }
      add_valid_menu_class(0);
      if (!G.u.uswallow) {
        objchain_p = P(G.level.objects[G.u.ux], G.u.uy);
        traverse_how = BY_NEXTHERE;
      } else {
        objchain_p = P(G.u.ustuck, "minvent");
        traverse_how = 0;
      }
      if (autopickup) {
        n = await autopick(objchain_p.a[objchain_p.o], traverse_how, P(pick_list, 0));
        { $g = 1; continue $L; }
      }
      if (!(G.flags.menu_style !== MENU_TRADITIONAL || G.iflags.menu_requested)) { $g = 5; continue $L; }
      traverse_how |= AUTOSELECT_SINGLE | (G.flags.sortpack ? INVORDER_SORT : 0);
      if (count) {
        let qbuf = new Int8Array(128);
        sprintf(P(qbuf), S("Pick %d of what?"), count);
        val_for_n_or_more = count;
        n = await query_objlist(P(qbuf), objchain_p, traverse_how, P(pick_list, 0), PICK_ONE, n_or_more);
        for (i = 0; i < n; ++i) {
          $sadd(pick_list[0], i).count = count;
        }
      } else {
        n = await query_objlist(S("Pick up what?"), objchain_p, traverse_how | FEEL_COCKATRICE, P(pick_list, 0), PICK_ANY, all_but_uchain);
      }
    case 1: // menu_pickup
      n_tried = n;
      for (n_picked = i = 0; i < n; ++i) {
        res = await pickup_object($sadd(pick_list[0], i).item.a_obj, $sadd(pick_list[0], i).count, FALSE);
        if (res < 0) {
          break;
        }
        n_picked += res;
      }
      if (pick_list[0]) {
        free(pick_list[0]);
      }
      { $g = 4; continue $L; }
    case 5:
      ct = 0;
      oclasses = new Int8Array(28);
      oclasses[0] = 0;
      all_of_a_type[0] = TRUE;
      selective[0] = FALSE;
      for (obj = objchain_p.a[objchain_p.o]; obj; obj = traverse_how & 1 ? obj.v.v_nexthere : obj.nobj) {
        ++ct;
      }
      if (ct === 1 && count) {
        obj = objchain_p.a[objchain_p.o];
        lcount = obj.quan < count ? obj.quan : count;
        ++n_tried;
        if (await pickup_object(obj, lcount, FALSE) > 0) {
          ++n_picked;
        }
        { $g = 2; continue $L; }
      } else if (ct >= 2) {
        const via_menu = new Int32Array(1);
        via_menu[0] = 0;
        await There(S("are %s objects here."), ct <= 10 ? S("several") : S("many"));
        if (!await query_classes(P(oclasses), P(selective, 0), P(all_of_a_type, 0), S("pick up"), objchain_p.a[objchain_p.o], traverse_how & BY_NEXTHERE ? TRUE : FALSE, P(via_menu, 0))) {
          if (!via_menu[0]) {
            { $g = 3; continue $L; }
          }
          if (selective[0]) {
            traverse_how |= INVORDER_SORT;
          }
          n = await query_objlist(S("Pick up what?"), objchain_p, traverse_how, P(pick_list, 0), PICK_ANY, via_menu[0] === -2 ? allow_all : allow_category);
          { $g = 1; continue $L; }
        }
      }
      bycat = (menu_class_present(66) || menu_class_present(85) || menu_class_present(67) || menu_class_present(88) ? 1 : 0) << 24 >> 24;
      for (obj = objchain_p.a[objchain_p.o]; obj; obj = obj2) {
        obj2 = traverse_how & 1 ? obj.v.v_nexthere : obj.nobj;
        if (bycat ? !allow_category(obj) ? 1 : 0 : !selective[0] && oclasses[0] && !strchr(P(oclasses), obj.oclass) ? 1 : 0) {
          continue;
        }
        lcount = -1;
        if (!all_of_a_type[0]) {
          let qbuf = new Int8Array(256);
          await safe_qbuf(P(qbuf), S("Pick up "), S("?"), obj, doname, ansimpleoname, G.c_common_strings.c_something);
          switch (obj.quan < 2 ? await yn_function(P(qbuf), P(G.ynaqchars), 121) : await yn_function(P(qbuf), P(G.ynNaqchars), 121)) {
          case 113:
            { $g = 2; continue $L; }
          case 110:
            continue;
          case 97:
            all_of_a_type[0] = TRUE;
            if (selective[0]) {
              selective[0] = FALSE;
              oclasses[0] = obj.oclass;
              oclasses[1] = 0;
            }
            break;
          case 35:
            if (!G.yn_number) {
              continue;
            }
            lcount = G.yn_number;
            if (lcount > obj.quan) {
              lcount = obj.quan;
            }
          default:
            break;
          }
        }
        if (lcount === -1) {
          lcount = obj.quan;
        }
        ++n_tried;
        if ((res = await pickup_object(obj, lcount, FALSE)) < 0) {
          break;
        }
        n_picked += res;
      }
    case 2: // end_query
      ;
    case 4:
      if (!G.u.uswallow) {
        if ((G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
          hideunder(G.youmonst);
        }
        if (n_picked) {
          await newsym_force(G.u.ux, G.u.uy);
        }
        if (autopickup) {
          await check_here(n_picked > 0 ? 1 : 0);
        }
      }
    case 3: // pickupdone
      add_valid_menu_class(0);
      return n_tried > 0 ? 1 : 0;
    }
    break;
  }
}

export async function check_autopickup_exceptions(obj: struct_obj | null): Promise<struct_autopickup_exception | null> {
  let ape = G.apelist;
  if (ape) {
    let objdesc = await makesingular(await doname(obj));
    while (ape && !regex_match(objdesc, ape.regex)) {
      ape = ape.next;
    }
  }
  return ape;
}

export async function autopick_testobj(otmp: struct_obj | null, calc_costly: number): Promise<number> {
  let ape = null;
  let otypes = P(G.flags.pickup_types);
  let pickit = 0;
  if (calc_costly) {
    autopick_testobj$costly = (otmp.where === OBJ_FLOOR && await costly_spot(otmp.ox, otmp.oy) ? 1 : 0) << 24 >> 24;
  }
  if (autopick_testobj$costly && !otmp.no_charge) {
    return FALSE;
  }
  pickit = (!otypes.a[otypes.o] || strchr(otypes, otmp.oclass) ? 1 : 0) << 24 >> 24;
  ape = await check_autopickup_exceptions(otmp);
  if (ape) {
    pickit = ape.grab;
  }
  if (!pickit) {
    pickit = (G.flags.pickup_thrown && otmp.was_thrown | 0 ? 1 : 0) << 24 >> 24;
  }
  return pickit;
}

async function autopick(olist: struct_obj | null, follow: number, pick_list: Ptr | null): Promise<number> {
  let pi = null;
  let curr = null;
  let n = 0;
  let check_costly = TRUE;
  for (n = 0, curr = olist; curr; curr = follow & 1 ? curr.v.v_nexthere : curr.nobj) {
    if (await autopick_testobj(curr, check_costly)) {
      ++n;
    }
    check_costly = FALSE;
  }
  if (n) {
    pick_list.a[pick_list.o] = pi = $sarr(struct_mi, (16 * $u64(n) >>> 0) / 16)[0];
    for (n = 0, curr = olist; curr; curr = follow & 1 ? curr.v.v_nexthere : curr.nobj) {
      if (await autopick_testobj(curr, FALSE)) {
        $sadd(pi, n).item.a_obj = curr;
        $sadd(pi, n).count = curr.quan;
        ++n;
      }
    }
  }
  return n;
}

export async function query_objlist(qstr: Ptr | null, olist_p: Ptr | null, qflags: number, pick_list: Ptr | null, how: number, allow: Function | null): Promise<number> {
  let i = 0;
  let n = 0;
  let win = 0;
  let curr = null;
  let last = null;
  let fake_hero_object = new struct_obj();
  const olist = [null];
  olist[0] = olist_p.a[olist_p.o];
  let pack = null;
  let any = new union_any();
  let printed_type_name = 0;
  let first = 0;
  let sorted = ((qflags & INVORDER_SORT) !== 0 ? 1 : 0) << 24 >> 24;
  let engulfer = ((qflags & INCLUDE_HERO) !== 0 ? 1 : 0) << 24 >> 24;
  let engulfer_minvent = 0;
  let sortflags = 0;
  const sortedolist = [null];
  let srtoli = null;
  pick_list.a[pick_list.o] = null;
  if (!olist[0] && !engulfer) {
    return 0;
  }
  for (n = 0, last = null, curr = olist[0]; curr; curr = qflags & 1 ? curr.v.v_nexthere : curr.nobj) {
    if (await allow(curr)) {
      last = curr;
      ++n;
    }
  }
  engulfer_minvent = (olist[0] && olist[0].where === OBJ_MINVENT && G.u.uswallow | 0 && olist[0].v.v_ocarry === G.u.ustuck ? 1 : 0) << 24 >> 24;
  if (engulfer_minvent && n === 1 && olist[0].owornmask !== 0) {
    qflags &= ~AUTOSELECT_SINGLE;
  }
  if (engulfer) {
    ++n;
    qflags &= ~AUTOSELECT_SINGLE;
  }
  if (n === 0) {
    return qflags & SIGNAL_NOMENU ? -1 : 0;
  }
  if (n === 1 && qflags & AUTOSELECT_SINGLE) {
    pick_list.a[pick_list.o] = new struct_mi();
    pick_list.a[pick_list.o].item.a_obj = last;
    pick_list.a[pick_list.o].count = last.quan;
    return 1;
  }
  sortflags = ((G.flags.sortloot === 102 || G.flags.sortloot === 108 && !(qflags & USE_INVLET) ? SORTLOOT_LOOT : qflags & USE_INVLET ? SORTLOOT_INVLET : 0) | (G.flags.sortpack ? SORTLOOT_PACK : 0) | (qflags & FEEL_COCKATRICE ? SORTLOOT_PETRIFY : 0)) >>> 0;
  sortedolist[0] = await sortloot(P(olist, 0), sortflags, qflags & BY_NEXTHERE ? TRUE : FALSE, allow);
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  any.$cp(G.zeroany);
  pack = P(G.flags.inv_order);
  first = TRUE;
  do {
    printed_type_name = FALSE;
    for (srtoli = sortedolist[0]; !!(curr = srtoli.obj); srtoli = $sadd(srtoli, 1)) {
      if (sorted && curr.oclass !== pack.a[pack.o]) {
        continue;
      }
      if (qflags & FEEL_COCKATRICE && curr.otyp === CORPSE && will_feel_cockatrice(curr, FALSE)) {
        await G.windowprocs.win_destroy_nhwindow(win);
        await look_here(0, FALSE);
        unsortloot(P(sortedolist, 0));
        return 0;
      }
      if (await allow(curr)) {
        if (sorted && !printed_type_name) {
          any.$cp(G.zeroany);
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, await let_to_name(pack.a[pack.o], FALSE, how !== PICK_NONE && G.iflags.menu_head_objsym ? 1 : 0), MENU_UNSELECTED);
          printed_type_name = TRUE;
        }
        any.a_obj = curr;
        await G.windowprocs.win_add_menu(win, curr.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : curr.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : curr.otyp === 240 ? curr.corpsenm + (382 + (1 + (382 + (382 + 0)))) : curr.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))), any, qflags & USE_INVLET ? curr.invlet : first && curr.oclass === COIN_CLASS ? 36 : 0, G.def_oc_syms[G.objects[curr.otyp].oc_class].sym, ATR_NONE, await doname_with_price(curr), MENU_UNSELECTED);
        first = FALSE;
      }
    }
    pack = pack.add(1);
  } while (sorted && pack.a[pack.o]);
  unsortloot(P(sortedolist, 0));
  if (engulfer) {
    let buf = new Int8Array(256);
    any.$cp(G.zeroany);
    if (sorted && n > 1) {
      sprintf(P(buf), S("%s Creatures"), (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("Swallowed") : S("Engulfed"));
      await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, P(buf), MENU_UNSELECTED);
    }
    fake_hero_object.$cp(G.zeroobj);
    fake_hero_object.quan = 1;
    any.a_obj = fake_hero_object;
    await G.windowprocs.win_add_menu(win, (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) : await monsndx(G.youmonst.data)) + 0, any, CONTAINED_SYM, 0, ATR_NONE, await an(await self_lookat(P(buf))), MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(win, qstr);
  n = await G.windowprocs.win_select_menu(win, how, pick_list);
  await G.windowprocs.win_destroy_nhwindow(win);
  if (n > 0) {
    let mi = null;
    let k = 0;
    for (i = k = 0, mi = pick_list.a[pick_list.o]; i < n; ++i, mi = $sadd(mi, 1)) {
      curr = mi.item.a_obj;
      if (curr === fake_hero_object) {
        await You_cant(S("pick yourself up!"));
        continue;
      }
      if (engulfer_minvent && curr.owornmask !== 0) {
        await You_cant(S("pick %s up."), await ysimple_name(curr));
        continue;
      }
      if (mi.count === -1 || mi.count > curr.quan) {
        mi.count = curr.quan;
      }
      if (k < i) {
        $sadd(pick_list.a[pick_list.o], k).$cp(mi);
      }
      ++k;
    }
    if (!k) {
      free(pick_list.a[pick_list.o]);
      pick_list.a[pick_list.o] = null;
      n = 0;
    } else if (k < n) {
      while (n > k) {
        --n;
        $sadd(pick_list.a[pick_list.o], n).item.$cp(G.zeroany);
        $sadd(pick_list.a[pick_list.o], n).count = 0;
      }
    }
  } else if (n < 0) {
    n = qflags & SIGNAL_ESCAPE ? -2 : 0;
  }
  return n;
}

export async function query_category(qstr: Ptr | null, olist: struct_obj | null, qflags: number, pick_list: Ptr | null, how: number): Promise<number> {
  let $t1: any;
  let $g = 0;
  let n = 0;
  let win = 0;
  let curr = null;
  let pack = null;
  let any = new union_any();
  let collected_type_name = 0;
  let invlet = 0;
  let ccount = 0;
  let ofilter = null;
  let do_unpaid = 0;
  let do_blessed = 0;
  let do_cursed = 0;
  let do_uncursed = 0;
  let do_buc_unknown = 0;
  let num_buc_types = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      any = new union_any();
      ofilter = null;
      do_unpaid = FALSE;
      do_blessed = FALSE;
      do_cursed = FALSE;
      do_uncursed = FALSE;
      do_buc_unknown = FALSE;
      num_buc_types = 0;
      pick_list.a[pick_list.o] = null;
      if (!olist) {
        return 0;
      }
      if (qflags & UNPAID_TYPES && count_unpaid(olist)) {
        do_unpaid = TRUE;
      }
      if (qflags & WORN_TYPES) {
        ofilter = is_worn;
      }
      if (qflags & BUC_BLESSED && await count_buc(olist, BUC_BLESSED, ofilter)) {
        do_blessed = TRUE;
        ++num_buc_types;
      }
      if (qflags & BUC_CURSED && await count_buc(olist, BUC_CURSED, ofilter)) {
        do_cursed = TRUE;
        ++num_buc_types;
      }
      if (qflags & BUC_UNCURSED && await count_buc(olist, BUC_UNCURSED, ofilter)) {
        do_uncursed = TRUE;
        ++num_buc_types;
      }
      if (qflags & BUC_UNKNOWN && await count_buc(olist, BUC_UNKNOWN, ofilter)) {
        do_buc_unknown = TRUE;
        ++num_buc_types;
      }
      ccount = count_categories(olist, qflags);
      if (ccount === 1 && !do_unpaid && num_buc_types <= 1 && !(qflags & BILLED_TYPES)) {
        for (curr = olist; curr; curr = qflags & 1 ? curr.v.v_nexthere : curr.nobj) {
          if (ofilter && !await ofilter(curr)) {
            continue;
          }
          break;
        }
        if (curr) {
          pick_list.a[pick_list.o] = new struct_mi();
          pick_list.a[pick_list.o].item.a_int = curr.oclass;
          n = 1;
        } else {
          do {
            if (await debugcore(S("pickup.c"), 1)) {
              await pline(S("query_category: no single object match"));
            }
          } while (0);
          n = 0;
        }
        return n;
      }
      win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_start_menu(win);
      pack = P(G.flags.inv_order);
      if (qflags & CHOOSE_ALL) {
        invlet = 65;
        any.$cp(G.zeroany);
        any.a_int = 65;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, qflags & WORN_TYPES ? S("Auto-select every item being worn") : S("Auto-select every item"), MENU_UNSELECTED);
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
      }
      if (qflags & ALL_TYPES && ccount > 1) {
        invlet = 97;
        any.$cp(G.zeroany);
        any.a_int = ALL_TYPES_SELECTED;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, qflags & WORN_TYPES ? S("All worn types") : S("All types"), MENU_UNSELECTED);
        invlet = 98;
      } else {
        invlet = 97;
      }
      do {
        collected_type_name = FALSE;
        for (curr = olist; curr; curr = qflags & 1 ? curr.v.v_nexthere : curr.nobj) {
          if (curr.oclass === pack.a[pack.o]) {
            if (ofilter && !await ofilter(curr)) {
              continue;
            }
            if (!collected_type_name) {
              any.$cp(G.zeroany);
              any.a_int = curr.oclass;
              await G.windowprocs.win_add_menu(win, NO_GLYPH, any, ($t1 = invlet, invlet = $t1 + 1 << 24 >> 24, $t1), G.def_oc_syms[G.objects[curr.otyp].oc_class].sym, ATR_NONE, await let_to_name(pack.a[pack.o], FALSE, how !== PICK_NONE && G.iflags.menu_head_objsym ? 1 : 0), MENU_UNSELECTED);
              collected_type_name = TRUE;
            }
          }
        }
        pack = pack.add(1);
        if (invlet >= 117) {
          await impossible(S("query_category: too many categories"));
          n = 0;
          { $g = 1; continue $L; }
        }
      } while (pack.a[pack.o]);
      if (do_unpaid || qflags & BILLED_TYPES || do_blessed || do_cursed || do_uncursed || do_buc_unknown) {
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
      }
      if (do_unpaid) {
        invlet = 117;
        any.$cp(G.zeroany);
        any.a_int = 117;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Unpaid items"), MENU_UNSELECTED);
      }
      if (qflags & BILLED_TYPES) {
        invlet = 120;
        any.$cp(G.zeroany);
        any.a_int = 120;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Unpaid items already used up"), MENU_UNSELECTED);
      }
      if (do_blessed) {
        invlet = 66;
        any.$cp(G.zeroany);
        any.a_int = 66;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Items known to be Blessed"), MENU_UNSELECTED);
      }
      if (do_cursed) {
        invlet = 67;
        any.$cp(G.zeroany);
        any.a_int = 67;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Items known to be Cursed"), MENU_UNSELECTED);
      }
      if (do_uncursed) {
        invlet = 85;
        any.$cp(G.zeroany);
        any.a_int = 85;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Items known to be Uncursed"), MENU_UNSELECTED);
      }
      if (do_buc_unknown) {
        invlet = 88;
        any.$cp(G.zeroany);
        any.a_int = 88;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, invlet, 0, ATR_NONE, S("Items of unknown Bless/Curse status"), MENU_UNSELECTED);
      }
      await G.windowprocs.win_end_menu(win, qstr);
      n = await G.windowprocs.win_select_menu(win, how, pick_list);
    case 1: // query_done
      await G.windowprocs.win_destroy_nhwindow(win);
      if (n < 0) {
        n = 0;
      }
      return n;
    }
    break;
  }
}

function count_categories(olist: struct_obj | null, qflags: number): number {
  let pack = null;
  let counted_category = 0;
  let ccount = 0;
  let curr = null;
  pack = P(G.flags.inv_order);
  do {
    counted_category = FALSE;
    for (curr = olist; curr; curr = qflags & 1 ? curr.v.v_nexthere : curr.nobj) {
      if (curr.oclass === pack.a[pack.o]) {
        if (qflags & WORN_TYPES && !(curr.owornmask & (W_ARMOR | W_ACCESSORY | W_WEAPONS))) {
          continue;
        }
        if (!counted_category) {
          ++ccount;
          counted_category = TRUE;
        }
      }
    }
    pack = pack.add(1);
  } while (pack.a[pack.o]);
  return ccount;
}

async function delta_cwt(container: struct_obj | null, obj: struct_obj | null): Promise<number> {
  let prev = null;
  let owt = 0;
  let nwt = 0;
  if (container.otyp !== BAG_OF_HOLDING) {
    return obj.owt | 0;
  }
  owt = nwt = container.owt | 0;
  for (prev = P(container, "cobj"); prev.a[prev.o]; prev = P(prev.a[prev.o], "nobj")) {
    if (prev.a[prev.o] === obj) {
      break;
    }
  }
  if (!prev.a[prev.o]) {
    await panic(S("delta_cwt: obj not inside container?"));
  } else {
    prev.a[prev.o] = obj.nobj;
    nwt = await weight(container);
    prev.a[prev.o] = obj;
  }
  return owt - nwt;
}

async function carry_count(obj: struct_obj | null, container: struct_obj | null, count: number, telekinesis: number, wt_before: Ptr | null, wt_after: Ptr | null): Promise<number> {
  let adjust_wt = (container && container.where === 3 ? 1 : 0) << 24 >> 24;
  let is_gold = (obj.oclass === COIN_CLASS ? 1 : 0) << 24 >> 24;
  let wt = 0;
  let iw = 0;
  let ow = 0;
  let oow = 0;
  let qq = 0;
  let savequan = 0;
  let umoney = 0;
  let saveowt = 0;
  let verb = null;
  let prefx1 = null;
  let prefx2 = null;
  let suffx = null;
  let obj_nambuf = new Int8Array(256);
  let where = new Int8Array(256);
  savequan = obj.quan;
  saveowt = obj.owt;
  umoney = money_cnt(G.invent);
  iw = max_capacity();
  if (count !== savequan) {
    obj.quan = count;
    obj.owt = await weight(obj) >>> 0;
  }
  wt = iw + (obj.owt | 0);
  if (adjust_wt) {
    wt -= await delta_cwt(container, obj);
  }
  if (is_gold) {
    wt -= Math.trunc((umoney + 50) / 100) + Math.trunc((count + 50) / 100) - Math.trunc((umoney + count + 50) / 100);
  }
  if (count !== savequan) {
    obj.quan = savequan;
    obj.owt = saveowt;
  }
  wt_before.a[wt_before.o] = iw;
  wt_after.a[wt_after.o] = wt;
  if (wt < 0) {
    return count;
  }
  if (is_gold) {
    iw -= Math.trunc((umoney + 50) / 100) | 0;
    if (!adjust_wt) {
      qq = iw * -100 - (umoney + 50) - 1;
    } else {
      oow = 0;
      qq = 50 - umoney % 100 - 1;
      if (qq < 0) {
        qq += 100;
      }
      for (; qq <= count; qq += 100) {
        obj.quan = qq;
        obj.owt = Math.trunc((qq + 50) / 100) >>> 0;
        ow = Math.trunc((umoney + qq + 50) / 100) | 0;
        ow -= await delta_cwt(container, obj);
        if (iw + ow >= 0) {
          break;
        }
        oow = ow;
      }
      iw -= oow;
      qq -= 100;
    }
    if (qq < 0) {
      qq = 0;
    } else if (qq > count) {
      qq = count;
    }
    wt = iw + (Math.trunc((umoney + qq + 50) / 100) | 0);
  } else if (count > 1 || count < obj.quan) {
    for (qq = 1; qq <= count; ++qq) {
      obj.quan = qq;
      obj.owt = (ow = await weight(obj)) >>> 0;
      if (adjust_wt) {
        ow -= await delta_cwt(container, obj);
      }
      if (iw + ow >= 0) {
        break;
      }
      wt = iw + ow;
    }
    --qq;
  } else {
    qq = 0;
  }
  obj.quan = savequan;
  obj.owt = saveowt;
  if (qq < count) {
    strcpy(P(obj_nambuf), await doname(obj));
    if (container) {
      sprintf(P(where), S("in %s"), await the(await xname(container)));
      verb = S("carry");
    } else {
      strcpy(P(where), S("lying here"));
      verb = telekinesis ? S("acquire") : S("lift");
    }
  } else {
    $wr(P(obj_nambuf), 0, $wr(P(where), 0, 0));
    verb = S("");
  }
  if (qq > 0) {
    if (qq < count) {
      await You(S("can only %s %s of the %s %s."), verb, qq === 1 ? S("one") : S("some"), P(obj_nambuf), P(where));
    }
    wt_after.a[wt_after.o] = wt;
    return qq;
  }
  if (!container) {
    strcpy(P(where), S("here"));
  }
  if (G.invent || umoney) {
    prefx1 = S("you cannot ");
    prefx2 = S("");
    suffx = S(" any more");
  } else {
    prefx1 = obj.quan === 1 ? S("it ") : S("even one ");
    prefx2 = S("is too heavy for you to ");
    suffx = S("");
  }
  await There(S("%s %s %s, but %s%s%s%s."), otense(obj, S("are")), P(obj_nambuf), P(where), prefx1, prefx2, verb, suffx);
  return 0;
}

async function lift_object(obj: struct_obj | null, container: struct_obj | null, cnt_p: Ptr | null, telekinesis: number): Promise<number> {
  let result = 0;
  const old_wt = new Int32Array(1);
  const new_wt = new Int32Array(1);
  let prev_encumbr = 0;
  let next_encumbr = 0;
  if (obj.otyp === BOULDER && G.level.flags.sokoban_rules | 0) {
    await You(S("cannot get your %s around this %s."), body_part(HAND), await xname(obj));
    return -1;
  }
  if (obj.otyp === LOADSTONE || obj.otyp === BOULDER && (G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0) {
    if (inv_cnt(FALSE) < 52 || !carrying(obj.otyp) || await merge_choice(G.invent, obj)) {
      return 1;
    }
    await You(S("are carrying too much stuff to pick up %s %s."), obj.quan === 1 ? S("another") : S("more"), await simpleonames(obj));
    return -1;
  }
  cnt_p.a[cnt_p.o] = await carry_count(obj, container, cnt_p.a[cnt_p.o], telekinesis, P(old_wt, 0), P(new_wt, 0));
  if (cnt_p.a[cnt_p.o] < 1) {
    result = -1;
  } else if (obj.oclass !== COIN_CLASS && inv_cnt(FALSE) >= 52 && !await merge_choice(G.invent, obj)) {
    await Your(S("knapsack cannot accommodate any more items%s."), nxtobj(obj, GOLD_PIECE, (obj.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24) ? S(" (except gold)") : S(""));
    result = -1;
  } else {
    result = 1;
    prev_encumbr = near_capacity();
    if (prev_encumbr < G.flags.pickup_burden) {
      prev_encumbr = G.flags.pickup_burden;
    }
    next_encumbr = calc_capacity(new_wt[0] - old_wt[0]);
    if (next_encumbr > prev_encumbr) {
      if (telekinesis) {
        result = 0;
      } else {
        let qbuf = new Int8Array(256);
        let savequan = obj.quan;
        obj.quan = cnt_p.a[cnt_p.o];
        strcpy(P(qbuf), next_encumbr > HVY_ENCUMBER ? P(overloadmsg) : next_encumbr > MOD_ENCUMBER ? P(nearloadmsg) : P(moderateloadmsg));
        if (container) {
          strsubst(P(qbuf), S("lifting"), S("removing"));
        }
        strcat(P(qbuf), S(" "));
        await safe_qbuf(P(qbuf), P(qbuf), S(".  Continue?"), obj, doname, ansimpleoname, G.c_common_strings.c_something);
        obj.quan = savequan;
        switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
        case 113:
          result = -1;
          break;
        case 110:
          result = 0;
          break;
        default:
          break;
        }
        await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
      }
    }
  }
  if (obj.otyp === SCR_SCARE_MONSTER && result <= 0 && !container) {
    obj.spe = 0;
  }
  return result;
}

export async function pickup_object(obj: struct_obj | null, count$: number, telekinesis: number): Promise<number> {
  const count = new Float64Array(1);
  count[0] = count$;
  let res = 0;
  let nearload = 0;
  if (obj.quan < count[0]) {
    await impossible(S("pickup_object: count %ld > quan %ld?"), count[0], obj.quan);
    return 0;
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    obj.dknown = 1;
  }
  if (obj === G.uchain) {
    return 0;
  } else if (obj.where === OBJ_MINVENT && obj.owornmask !== 0 && G.u.uswallow | 0 && obj.v.v_ocarry === G.u.ustuck) {
    await You_cant(S("pick %s up."), await ysimple_name(obj));
    return 0;
  } else if (obj.oartifact && !await touch_artifact(obj, G.youmonst)) {
    return 0;
  } else if (obj.otyp === CORPSE) {
    if (await fatal_corpse_mistake(obj, telekinesis) || await rider_corpse_revival(obj, telekinesis)) {
      return -1;
    }
  } else if (obj.otyp === SCR_SCARE_MONSTER) {
    if (obj.blessed) {
      obj.blessed = 0;
    } else if (!obj.spe && !obj.cursed) {
      obj.spe = 1;
    } else {
      await pline_The(S("scroll%s %s to dust as you %s %s up."), obj.quan === 1 ? S("") : S("s"), otense(obj, S("turn")), telekinesis ? S("raise") : S("pick"), obj.quan === 1 ? S("it") : S("them"));
      if (!G.objects[SCR_SCARE_MONSTER].oc_name_known && !G.objects[SCR_SCARE_MONSTER].oc_uname) {
        await docall(obj);
      }
      await useupf(obj, obj.quan);
      return 1;
    }
  }
  if ((res = await lift_object(obj, null, P(count, 0), telekinesis)) <= 0) {
    return res;
  }
  if (obj.oclass === COIN_CLASS) {
    G.context.botl = 1;
  }
  if (obj.quan !== count[0] && obj.otyp !== LOADSTONE) {
    obj = await splitobj(obj, count[0]);
  }
  obj = await pick_obj(obj);
  if (G.uwep && G.uwep === obj) {
    G.mrg_to_wielded = TRUE;
  }
  nearload = near_capacity();
  await prinv(nearload === SLT_ENCUMBER ? P(moderateloadmsg) : null, obj, count[0]);
  G.mrg_to_wielded = FALSE;
  return 1;
}

export async function pick_obj(otmp: struct_obj | null): Promise<struct_obj | null> {
  let result = null;
  let ox = otmp.ox;
  let oy = otmp.oy;
  let robshop = (!G.u.uswallow && otmp !== G.uball && await costly_spot(ox, oy) ? 1 : 0) << 24 >> 24;
  await obj_extract_self(otmp);
  await newsym(ox, oy);
  if (robshop) {
    let saveushops = new Int8Array(5);
    let fakeshop = new Int8Array(2);
    strcpy(P(saveushops), P(G.u.ushops));
    fakeshop[0] = $rd(in_rooms(ox, oy, SHOPBASE));
    fakeshop[1] = 0;
    strcpy(P(G.u.ushops), P(fakeshop));
    await addtobill(otmp, TRUE, FALSE, FALSE);
    strcpy(P(G.u.ushops), P(saveushops));
    robshop = (otmp.unpaid | 0 && !strchr(P(G.u.ushops), $rd(P(fakeshop))) ? 1 : 0) << 24 >> 24;
  }
  result = await addinv(otmp);
  if (robshop) {
    await remote_burglary(ox, oy);
  }
  return result;
}

export async function encumber_msg(): Promise<number> {
  let newcap = near_capacity();
  if (encumber_msg$oldcap < newcap) {
    switch (newcap) {
    case 1:
      await Your(S("movements are slowed slightly because of your load."));
      break;
    case 2:
      await You(S("rebalance your load.  Movement is difficult."));
      break;
    case 3:
      await You(S("%s under your heavy load.  Movement is very hard."), stagger(G.youmonst.data, S("stagger")));
      break;
    default:
      await You(S("%s move a handspan with this load!"), newcap === 4 ? S("can barely") : S("can't even"));
      break;
    }
    G.context.botl = 1;
  } else if (encumber_msg$oldcap > newcap) {
    switch (newcap) {
    case 0:
      await Your(S("movements are now unencumbered."));
      break;
    case 1:
      await Your(S("movements are only slowed slightly by your load."));
      break;
    case 2:
      await You(S("rebalance your load.  Movement is still difficult."));
      break;
    case 3:
      await You(S("%s under your load.  Movement is still very hard."), stagger(G.youmonst.data, S("stagger")));
      break;
    }
    G.context.botl = 1;
  }
  encumber_msg$oldcap = newcap;
  return newcap;
}

export function container_at(x: number, y: number, countem: number): number {
  let cobj = null;
  let nobj = null;
  let container_count = 0;
  for (cobj = G.level.objects[x][y]; cobj; cobj = nobj) {
    nobj = cobj.v.v_nexthere;
    if (cobj.otyp >= 189 && cobj.otyp <= 195) {
      ++container_count;
      if (!countem) {
        break;
      }
    }
  }
  return container_count;
}

async function able_to_loot(x: number, y: number, looting: number): Promise<number> {
  let verb = looting ? S("loot") : S("tip");
  if (!can_reach_floor(TRUE)) {
    if (G.u.usteed && G.u.weapon_skills[P_RIDING].skill < P_BASIC) {
      await rider_cant_reach();
    } else {
      await cant_reach_floor(x, y, FALSE, TRUE);
    }
    return FALSE;
  } else if (is_pool(x, y) && (looting || !G.u.uinwater) || is_lava(x, y)) {
    await You(S("cannot %s things that are deep in the %s."), verb, hliquid(is_lava(x, y) ? S("lava") : S("water")));
    return FALSE;
  } else if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576) {
    await pline(S("Without limbs, you cannot %s anything."), verb);
    return FALSE;
  } else if (looting && !freehand()) {
    await pline(S("Without a free %s, you cannot loot anything."), body_part(HAND));
    return FALSE;
  }
  return TRUE;
}

function mon_beside(x: number, y: number): number {
  let i = 0;
  let j = 0;
  let nx = 0;
  let ny = 0;
  for (i = -1; i <= 1; ++i) {
    for (j = -1; j <= 1; ++j) {
      nx = x + i;
      ny = y + j;
      if (isok(nx, ny) && !!G.level.monsters[nx][ny]) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

async function do_loot_cont(cobjp: Ptr | null, cindex: number, ccount: number): Promise<number> {
  let cobj = cobjp.a[cobjp.o];
  if (!cobj) {
    return 0;
  }
  if (cobj.olocked) {
    if (ccount < 2) {
      await pline(S("%s locked."), cobj.lknown | 0 ? S("It is") : S("Hmmm, it turns out to be"));
    } else if (cobj.lknown) {
      await pline(S("%s is locked."), await The(await xname(cobj)));
    } else {
      await pline(S("Hmmm, %s turns out to be locked."), await the(await xname(cobj)));
    }
    cobj.lknown = 1;
    return 0;
  }
  cobj.lknown = 1;
  if (cobj.otyp === BAG_OF_TRICKS) {
    let tmp = 0;
    await You(S("carefully open %s..."), await the(await xname(cobj)));
    await pline(S("It develops a huge set of teeth and bites you!"));
    tmp = rnd(10);
    await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (tmp + 1) / 2 | 0 : tmp, S("carnivorous bag"), KILLED_BY_AN);
    await discover_object(195, 1, 1);
    abort_looting = TRUE;
    return 1;
  }
  await You(S("%sopen %s..."), !cobj.cknown || !cobj.lknown ? S("carefully ") : S(""), await the(await xname(cobj)));
  return await use_container(cobjp, 0, (cindex < ccount ? 1 : 0) << 24 >> 24);
}

export async function doloot(): Promise<number> {
  let $g = 0;
  let cobj = [null];
  let nobj = null;
  let c = 0;
  let timepassed = 0;
  let cc = new struct_nhcoord();
  let underfoot = 0;
  let dont_find_anything = null;
  let mtmp = null;
  let qbuf = new Int8Array(256);
  let prev_inquiry = new Int32Array(1);
  let prev_loot = new Int8Array(1);
  let num_conts = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      c = -1;
      timepassed = 0;
      cc = new struct_nhcoord();
      underfoot = TRUE;
      dont_find_anything = S("don't find anything");
      qbuf = new Int8Array(256);
      prev_inquiry[0] = 0;
      prev_loot[0] = FALSE;
      num_conts = 0;
      abort_looting = FALSE;
      if (await check_capacity(null)) {
        return 0;
      }
      if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
        await You(S("have no hands!"));
        return 0;
      }
      if (G.u.uprops[CONFUSION].intrinsic) {
        if (rn2(6) && await reverse_loot()) {
          return 1;
        }
        if (rn2(2)) {
          await pline(S("Being confused, you find nothing to loot."));
          return 1;
        }
      }
      cc.x = G.u.ux;
      cc.y = G.u.uy;
      if (G.iflags.menu_requested) {
        { $g = 1; continue $L; }
      }
    case 2: // lootcont
      if ((num_conts = container_at(cc.x, cc.y, TRUE)) > 0) {
        let anyfound = FALSE;
        if (!await able_to_loot(cc.x, cc.y, TRUE)) {
          return 0;
        }
        if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !G.uarmg) {
          for (nobj = sobj_at(CORPSE, cc.x, cc.y); nobj; nobj = nxtobj(nobj, CORPSE, TRUE)) {
            if (will_feel_cockatrice(nobj, FALSE)) {
              await feel_cockatrice(nobj, FALSE);
              return 1;
            }
          }
        }
        if (num_conts > 1) {
          let n = 0;
          let i = 0;
          let win = 0;
          let any = new union_any();
          const pick_list = [null];
          pick_list[0] = null;
          any.a_void = null;
          win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
          await G.windowprocs.win_start_menu(win);
          for (cobj[0] = G.level.objects[cc.x][cc.y]; cobj[0]; cobj[0] = cobj[0].v.v_nexthere) {
            if (cobj[0].otyp >= 189 && cobj[0].otyp <= 195) {
              any.a_obj = cobj[0];
              await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, await doname(cobj[0]), MENU_UNSELECTED);
            }
          }
          await G.windowprocs.win_end_menu(win, S("Loot which containers?"));
          n = await G.windowprocs.win_select_menu(win, PICK_ANY, P(pick_list, 0));
          await G.windowprocs.win_destroy_nhwindow(win);
          if (n > 0) {
            for (i = 1; i <= n; ++i) {
              cobj[0] = $sadd(pick_list[0], (i - 1)).item.a_obj;
              timepassed |= await do_loot_cont(P(cobj, 0), i, n);
              if (abort_looting) {
                free(pick_list[0]);
                return timepassed;
              }
            }
            free(pick_list[0]);
          }
          if (n !== 0) {
            c = 121;
          }
        } else {
          for (cobj[0] = G.level.objects[cc.x][cc.y]; cobj[0]; cobj[0] = nobj) {
            nobj = cobj[0].v.v_nexthere;
            if (cobj[0].otyp >= 189 && cobj[0].otyp <= 195) {
              c = await yn_function(await safe_qbuf(P(qbuf), S("There is "), S(" here, loot it?"), cobj[0], doname, ansimpleoname, S("a container")), P(G.ynqchars), 113);
              if (c === 113) {
                return timepassed;
              }
              if (c === 110) {
                continue;
              }
              anyfound = TRUE;
              timepassed |= await do_loot_cont(P(cobj, 0), 1, 1);
              if (abort_looting) {
                return timepassed;
              }
            }
          }
          if (anyfound) {
            c = 121;
          }
        }
      } else if ($at2(G.level.locations, cc.x, cc.y).typ === GRAVE) {
        await You(S("need to dig up the grave to effectively loot it..."));
      }
    case 1: // lootmon
      if (c !== 121 && mon_beside(G.u.ux, G.u.uy)) {
        if (!await get_adjacent_loc(S("Loot in what direction?"), S("Invalid loot location"), G.u.ux, G.u.uy, cc)) {
          return 0;
        }
        if (cc.x === G.u.ux && cc.y === G.u.uy) {
          underfoot = TRUE;
          if (container_at(cc.x, cc.y, FALSE)) {
            { $g = 2; continue $L; }
          }
        } else {
          underfoot = FALSE;
        }
        if (G.u.dz < 0) {
          await You(S("%s to loot on the %s."), dont_find_anything, ceiling(cc.x, cc.y));
          timepassed = 1;
          return timepassed;
        }
        mtmp = !!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null;
        if (mtmp) {
          timepassed = await loot_mon(mtmp, P(prev_inquiry, 0), P(prev_loot, 0));
        }
        if (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic) {
          timepassed = 1;
        }
        if (!underfoot) {
          if (container_at(cc.x, cc.y, FALSE)) {
            if (mtmp) {
              await You_cant(S("loot anything %sthere with %s in the way."), prev_inquiry[0] ? S("else ") : S(""), await mon_nam(mtmp));
              return timepassed;
            } else {
              await You(S("have to be at a container to loot it."));
            }
          } else {
            await You(S("%s %sthere to loot."), dont_find_anything, prev_inquiry[0] || prev_loot[0] ? S("else ") : S(""));
            return timepassed;
          }
        }
      } else if (c !== 121 && c !== 110) {
        await You(S("%s %s to loot."), dont_find_anything, underfoot ? S("here") : S("there"));
      }
      return timepassed;
    }
    break;
  }
}

async function reverse_loot(): Promise<number> {
  let goldob = null;
  let coffers = null;
  let otmp = null;
  let boxdummy = new struct_obj();
  let mon = null;
  let contribution = 0;
  let n = 0;
  let x = G.u.ux;
  let y = G.u.uy;
  if (!rn2(3)) {
    for (n = inv_cnt(TRUE), otmp = G.invent; otmp; --n, otmp = otmp.nobj) {
      if (!rn2(n + 1)) {
        await prinv(S("You find old loot:"), otmp, 0);
        return TRUE;
      }
    }
    return FALSE;
  }
  for (goldob = G.invent; goldob; goldob = goldob.nobj) {
    if (goldob.oclass === COIN_CLASS) {
      contribution = Math.trunc((rnd(5) * goldob.quan + 4) / 5);
      if (contribution < goldob.quan) {
        goldob = await splitobj(goldob, contribution);
      }
      break;
    }
  }
  if (!goldob) {
    return FALSE;
  }
  if (!($at2(G.level.locations, x, y).typ === THRONE)) {
    await dropx(goldob);
    if (g_at(x, y)) {
      await pline(S("Ok, now there is loot here."));
    }
  } else {
    otmp = null;
    for (coffers = G.level.objlist; coffers; coffers = coffers.nobj) {
      if (coffers.otyp === CHEST) {
        if (coffers.spe === 2) {
          break;
        }
        if (!otmp || dist2(coffers.ox, coffers.oy, G.u.ux, G.u.uy) < dist2(otmp.ox, otmp.oy, G.u.ux, G.u.uy)) {
          otmp = coffers;
        }
      }
    }
    if (!coffers) {
      coffers = otmp;
    }
    if (coffers) {
      await verbalize(S("Thank you for your contribution to reduce the debt."));
      await freeinv(goldob);
      await add_to_container(coffers, goldob);
      coffers.owt = await weight(coffers) >>> 0;
      coffers.cknown = 0;
      if (!coffers.olocked) {
        boxdummy.$cp(G.zeroobj), boxdummy.otyp = SPE_WIZARD_LOCK;
        await boxlock(coffers, boxdummy);
      }
    } else if (($at2(G.level.locations, x, y).flags | 0) !== T_LOOTED && !!(mon = await makemon(await courtmon(), x, y, NO_MM_FLAGS))) {
      await freeinv(goldob);
      await add_to_minv(mon, goldob);
      await pline(S("The exchequer accepts your contribution."));
      if (!rn2(10)) {
        $at2(G.level.locations, x, y).flags = (T_LOOTED) & 31;
      }
    } else {
      await You(S("drop %s."), await doname(goldob));
      await dropx(goldob);
    }
  }
  return TRUE;
}

export async function loot_mon(mtmp: struct_monst | null, passed_info: Ptr | null, prev_loot: Ptr | null): Promise<number> {
  let c = -1;
  let timepassed = 0;
  let otmp = null;
  let qbuf = new Int8Array(128);
  if (mtmp && mtmp !== G.u.usteed && (otmp = await which_armor(mtmp, W_SADDLE))) {
    let unwornmask = 0;
    if (passed_info) {
      passed_info.a[passed_info.o] = 1;
    }
    sprintf(P(qbuf), S("Do you want to remove the saddle from %s?"), await x_monnam(mtmp, ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE));
    if ((c = await yn_function(P(qbuf), P(G.ynqchars), 110)) === 121) {
      if ((G.youmonst.data.mflags1 & 24576) >>> 0 === 24576) {
        await You_cant(S("do that without limbs."));
        return 0;
      }
      if (otmp.cursed) {
        await You(S("can't.  The saddle seems to be stuck to %s."), await x_monnam(mtmp, ARTICLE_THE, null, SUPPRESS_SADDLE, FALSE));
        return 1;
      }
      await obj_extract_self(otmp);
      if ((unwornmask = otmp.owornmask) !== 0) {
        mtmp.misc_worn_check = mtmp.misc_worn_check & ~unwornmask;
        otmp.owornmask = 0;
        await update_mon_intrinsics(mtmp, otmp, FALSE, FALSE);
      }
      otmp = await hold_another_object(otmp, S("You drop %s!"), await doname(otmp), null);
      ;
      timepassed = rnd(3);
      if (prev_loot) {
        prev_loot.a[prev_loot.o] = TRUE;
      }
    } else if (c === 113) {
      return 0;
    }
  }
  if (G.u.uswallow) {
    let count = passed_info ? passed_info.a[passed_info.o] : 0;
    timepassed = await pickup(count);
  }
  return timepassed;
}

function mbag_explodes(obj: struct_obj | null, depthin: number): number {
  if ((obj.otyp === WAN_CANCELLATION || obj.otyp === BAG_OF_TRICKS) && obj.spe <= 0) {
    return FALSE;
  }
  if ((obj.otyp === 194 || obj.otyp === 195 || obj.otyp === WAN_CANCELLATION) && rn2(1 << (depthin > 7 ? 7 : depthin)) <= depthin) {
    return TRUE;
  } else if (!!obj.cobj) {
    let otmp = null;
    for (otmp = obj.cobj; otmp; otmp = otmp.nobj) {
      if (mbag_explodes(otmp, depthin + 1)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

async function boh_loss(container: struct_obj | null, held: number): Promise<number> {
  if ((container.otyp === 194 || container.otyp === 195) && container.cursed | 0 && !!container.cobj) {
    let loss = 0;
    let curr = null;
    let otmp = null;
    for (curr = container.cobj; curr; curr = otmp) {
      otmp = curr.nobj;
      if (!rn2(13)) {
        await obj_extract_self(curr);
        loss += await mbag_item_gone(held, curr);
      }
    }
    return loss;
  }
  return 0;
}

async function in_container(obj: struct_obj | null): Promise<number> {
  let floor_container = (!(current_container.where === 3) ? 1 : 0) << 24 >> 24;
  let was_unpaid = FALSE;
  let buf = new Int8Array(256);
  if (!current_container) {
    await impossible(S("<in> no current_container?"));
    return 0;
  } else if (obj === G.uball || obj === G.uchain) {
    await You(S("must be kidding."));
    return 0;
  } else if (obj === current_container) {
    await pline(S("That would be an interesting topological exercise."));
    return 0;
  } else if (obj.owornmask & (W_ARMOR | W_ACCESSORY)) {
    await Norep(S("You cannot %s %s you are wearing."), current_container.otyp === 191 ? S("refrigerate") : S("stash"), G.c_common_strings.c_something);
    return 0;
  } else if (obj.otyp === LOADSTONE && obj.cursed | 0) {
    set_bknown(obj, 1);
    await pline_The(S("stone%s won't leave your person."), obj.quan === 1 ? S("") : S("s"));
    return 0;
  } else if (obj.otyp === AMULET_OF_YENDOR || obj.otyp === CANDELABRUM_OF_INVOCATION || obj.otyp === BELL_OF_OPENING || obj.otyp === SPE_BOOK_OF_THE_DEAD) {
    await pline(S("%s cannot be confined in such trappings."), await The(await xname(obj)));
    return 0;
  } else if (obj.otyp === LEASH && obj.corpsenm !== 0) {
    await pline(S("%s attached to your pet."), await Tobjnam(obj, S("are")));
    return 0;
  } else if (obj === G.uwep) {
    if (welded(obj)) {
      await weldmsg(obj);
      return 0;
    }
    await setuwep(null);
    if (G.uwep) {
      return 0;
    }
  } else if (obj === G.uswapwep) {
    await setuswapwep(null);
  } else if (obj === G.uquiver) {
    await setuqwep(null);
  }
  if (await fatal_corpse_mistake(obj, FALSE)) {
    return -1;
  }
  if (obj.otyp === ICE_BOX || (obj.otyp === 189 || obj.otyp === 190) || obj.otyp === BOULDER || obj.otyp === STATUE && $sat(G.mons, obj.corpsenm).msize >= 3) {
    strcpy(P(buf), await the(await xname(obj)));
    await You(S("cannot fit %s into %s."), P(buf), await the(await xname(current_container)));
    return 0;
  }
  await freeinv(obj);
  if (obj_is_burning(obj)) {
    await snuff_lit(obj);
  }
  if (floor_container && await costly_spot(G.u.ux, G.u.uy)) {
    if (obj.oclass !== COIN_CLASS) {
      was_unpaid = (obj.unpaid | 0 ? TRUE : FALSE) << 24 >> 24;
      sellobj_state(current_container.no_charge | 0 ? SELL_DONTSELL : SELL_DELIBERATE);
      await sellobj(obj, G.u.ux, G.u.uy);
      sellobj_state(SELL_NORMAL);
    }
  }
  if (current_container.otyp === 191 && !(obj.otyp === 201 || obj.otyp === 202 || obj.otyp === 237 || obj.otyp === 199 || obj.otyp === 200 || obj.otyp === 296)) {
    obj.age = G.monstermoves - obj.age;
    if (obj.otyp === CORPSE && obj.timed) {
      let rot_alarm = await stop_timer(ROT_CORPSE, obj_to_any(obj));
      await stop_timer(REVIVE_MON, obj_to_any(obj));
      if (rot_alarm) {
        obj.oeroded2 = 1;
      }
    }
  } else if ((current_container.otyp === 194 || current_container.otyp === 195) && mbag_explodes(obj, 0)) {
    await pline(S("As you put %s inside, you are blasted by a magical explosion!"), await doname(obj));
    if (was_unpaid) {
      await addtobill(obj, FALSE, FALSE, TRUE);
    }
    await obfree(obj, null);
    if (floor_container && await costly_spot(current_container.ox, current_container.oy)) {
      let save_no_charge = new struct_obj();
      save_no_charge.no_charge = (current_container.no_charge) & 1;
      await addtobill(current_container, FALSE, FALSE, FALSE);
      current_container.no_charge = (save_no_charge.no_charge) & 1;
    }
    await delete_contents(current_container);
    if (!floor_container) {
      await useup(current_container);
    } else if (obj_here(current_container, G.u.ux, G.u.uy)) {
      await useupf(current_container, current_container.quan);
    } else {
      await panic(S("in_container:  bag not found."));
    }
    await losehp(d(6, 6), S("magical explosion"), KILLED_BY_AN);
    current_container = null;
  }
  if (current_container) {
    strcpy(P(buf), await the(await xname(current_container)));
    await You(S("put %s into %s."), await doname(obj), P(buf));
    if (floor_container && obj.oclass === COIN_CLASS) {
      await sellobj(obj, current_container.ox, current_container.oy);
    }
    await add_to_container(current_container, obj);
    current_container.owt = await weight(current_container) >>> 0;
  }
  await bot();
  return current_container ? 1 : -1;
}

export function ck_bag(obj: struct_obj | null): number {
  return current_container && obj !== current_container ? 1 : 0;
}

async function out_container(obj: struct_obj | null): Promise<number> {
  let otmp = null;
  let is_gold = (obj.oclass === COIN_CLASS ? 1 : 0) << 24 >> 24;
  let res = 0;
  let loadlev = 0;
  const count = new Float64Array(1);
  if (!current_container) {
    await impossible(S("<out> no current_container?"));
    return -1;
  } else if (is_gold) {
    obj.owt = await weight(obj) >>> 0;
  }
  if (obj.oartifact && !await touch_artifact(obj, G.youmonst)) {
    return 0;
  }
  if (await fatal_corpse_mistake(obj, FALSE)) {
    return -1;
  }
  count[0] = obj.quan;
  if ((res = await lift_object(obj, current_container, P(count, 0), FALSE)) <= 0) {
    return res;
  }
  if (obj.quan !== count[0] && obj.otyp !== LOADSTONE) {
    obj = await splitobj(obj, count[0]);
  }
  await obj_extract_self(obj);
  current_container.owt = await weight(current_container) >>> 0;
  if (current_container.otyp === 191) {
    await removed_from_icebox(obj);
  }
  if (!obj.unpaid && !(current_container.where === 3) && await costly_spot(current_container.ox, current_container.oy)) {
    obj.ox = current_container.ox;
    obj.oy = current_container.oy;
    await addtobill(obj, FALSE, FALSE, FALSE);
  }
  if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_PICK_AXE) {
    await pick_pick(obj);
  }
  otmp = await addinv(obj);
  loadlev = near_capacity();
  await prinv(loadlev ? loadlev < MOD_ENCUMBER ? S("You have a little trouble removing") : S("You have much trouble removing") : null, otmp, count[0]);
  if (is_gold) {
    await bot();
  }
  return 1;
}

async function removed_from_icebox(obj: struct_obj | null): Promise<void> {
  if (!(obj.otyp === 201 || obj.otyp === 202 || obj.otyp === 237 || obj.otyp === 199 || obj.otyp === 200 || obj.otyp === 296)) {
    obj.age = G.monstermoves - obj.age;
    if (obj.otyp === CORPSE) {
      await start_corpse_timeout(obj);
    }
  }
}

async function mbag_item_gone(held: number, item: struct_obj | null): Promise<number> {
  let shkp = null;
  let loss = 0;
  if (item.dknown) {
    await pline(S("%s %s vanished!"), await Doname2(item), otense(item, S("have")));
  } else {
    await You(S("%s %s disappear!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("notice") : S("see"), await doname(item));
  }
  if ($rd(P(G.u.ushops)) && !!(shkp = await shop_keeper($rd(P(G.u.ushops))))) {
    if (held ? item.unpaid << 24 >> 24 : await costly_spot(G.u.ux, G.u.uy)) {
      loss = await stolen_value(item, G.u.ux, G.u.uy, shkp.mpeaceful << 24 >> 24, TRUE);
    }
  }
  await obfree(item, null);
  return loss;
}

export async function observe_quantum_cat(box: struct_obj | null, makecat: number, givemsg: number): Promise<void> {
  let deadcat = null;
  let livecat = null;
  const ox = new Int8Array(1);
  const oy = new Int8Array(1);
  let itsalive = (!rn2(2) ? 1 : 0) << 24 >> 24;
  if (get_obj_location(box, P(ox, 0), P(oy, 0), 0)) {
    box.ox = ox[0], box.oy = oy[0];
  }
  deadcat = box.cobj;
  if (itsalive) {
    if (makecat) {
      livecat = await makemon($sat(G.mons, PM_HOUSECAT), box.ox, box.oy, NO_MINVENT | MM_ADJACENTOK);
    }
    if (livecat) {
      livecat.mpeaceful = 1;
      set_malign(livecat);
      if (givemsg) {
        if (!((livecat.wormno | 0 ? worm_known(livecat) : $rd(G.viz_array.a[G.viz_array.o + livecat.my], livecat.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && livecat && livecat.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + livecat.my], livecat.mx) & 1 ? 1 : 0) && ((!livecat.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !livecat.mundetected) || (!((livecat.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(livecat.mx, livecat.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & livecat.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & livecat.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === livecat.data)))) {
          await You(S("think %s brushed your %s."), G.c_common_strings.c_something, body_part(FOOT));
        } else {
          await pline(S("%s inside the box is still alive!"), await Monnam(livecat));
        }
      }
      await christen_monst(livecat, P(observe_quantum_cat$sc));
      if (deadcat) {
        await obj_extract_self(deadcat);
        await obfree(deadcat, null), deadcat = null;
      }
      box.owt = await weight(box) >>> 0;
      box.spe = 0;
    }
  } else {
    box.spe = 0;
    if (deadcat) {
      deadcat.age = G.monstermoves;
      await set_corpsenm(deadcat, PM_HOUSECAT);
      deadcat = await oname(deadcat, P(observe_quantum_cat$sc));
    }
    if (givemsg) {
      await pline_The(S("%s inside the box is dead!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await rndmonnam(null) : S("housecat"));
    }
  }
  ;
  return;
}

export function container_gone(fn: Function | null): number {
  return ((fn === in_container || fn === out_container) && !current_container ? 1 : 0) << 24 >> 24;
}

async function explain_container_prompt(more_containers: number): Promise<void> {
  let txtpp = null;
  let win = 0;
  if ((win = await G.windowprocs.win_create_nhwindow(NHW_TEXT)) !== WIN_ERR) {
    for (txtpp = P(explain_container_prompt$explaintext); txtpp.a[txtpp.o]; txtpp = txtpp.add(1)) {
      if (!more_containers && !strncmp(txtpp.a[txtpp.o], S(" n "), 3)) {
        continue;
      }
      await G.windowprocs.win_putstr(win, 0, txtpp.a[txtpp.o]);
    }
    await G.windowprocs.win_display_nhwindow(win, FALSE);
    await G.windowprocs.win_destroy_nhwindow(win);
  }
}

export async function u_handsy(): Promise<number> {
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You(S("have no hands!"));
    return FALSE;
  } else if (!freehand()) {
    await You(S("have no free %s."), body_part(HAND));
    return FALSE;
  }
  return TRUE;
}

export async function use_container(objp: Ptr | null, held: number, more_containers: number): Promise<number> {
  let $g = 0;
  let otmp = null;
  let obj = null;
  let quantum_cat = 0;
  let cursed_mbag = 0;
  let loot_out = 0;
  let loot_in = 0;
  let loot_in_first = 0;
  let stash_one = 0;
  let inokay = 0;
  let outokay = 0;
  let outmaybe = 0;
  let c = 0;
  let emptymsg = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let pbuf = new Int8Array(128);
  let xbuf = new Int8Array(128);
  let used = 0;
  let loss = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      obj = objp.a[objp.o];
      emptymsg = new Int8Array(256);
      qbuf = new Int8Array(128);
      pbuf = new Int8Array(128);
      xbuf = new Int8Array(128);
      used = 0;
      abort_looting = FALSE;
      emptymsg[0] = 0;
      if (!await u_handsy()) {
        return 0;
      }
      if (!obj.lknown) {
        obj.lknown = 1;
        if (held) {
          update_inventory();
        }
      }
      if (obj.olocked) {
        await pline(S("%s locked."), await Tobjnam(obj, S("are")));
        if (held) {
          await You(S("must put it down to unlock."));
        }
        return 0;
      } else if (obj.otrapped) {
        if (held) {
          await You(S("open %s..."), await the(await xname(obj)));
        }
        await chest_trap(obj, HAND, FALSE);
        if (G.multi >= 0) {
          nomul(-1);
          G.multi_reason = S("opening a container");
          G.nomovemsg = S("");
        }
        abort_looting = TRUE;
        return 1;
      }
      current_container = obj;
      quantum_cat = (current_container.otyp === 189 && current_container.spe === 1 ? 1 : 0) << 24 >> 24;
      if (quantum_cat) {
        await observe_quantum_cat(current_container, TRUE, TRUE);
        used = 1;
      }
      cursed_mbag = ((current_container.otyp === 194 || current_container.otyp === 195) && current_container.cursed | 0 && !!current_container.cobj ? 1 : 0) << 24 >> 24;
      if (cursed_mbag && (loss = await boh_loss(current_container, held)) !== 0) {
        used = 1;
        await You(S("owe %ld %s for lost merchandise."), loss, await currency(loss));
        current_container.owt = await weight(current_container) >>> 0;
      }
      inokay = (!!G.invent && !(G.invent === current_container && !current_container.nobj) ? 1 : 0) << 24 >> 24;
      outokay = (!!current_container.cobj ? 1 : 0) << 24 >> 24;
      if (!outokay) {
        sprintf(P(emptymsg), S("%s is %sempty."), await Ysimple_name2(current_container), quantum_cat || cursed_mbag ? S("now ") : S(""));
      }
      for (; ; ) {
        outmaybe = (outokay || !current_container.cknown ? 1 : 0) << 24 >> 24;
        if (!outmaybe) {
          await safe_qbuf(P(qbuf), null, S(" is empty.  Do what with it?"), current_container, Yname2, Ysimple_name2, S("This"));
        } else {
          await safe_qbuf(P(qbuf), S("Do what with "), S("?"), current_container, yname, ysimple_name, S("it"));
        }
        if (G.flags.menu_style === MENU_PARTIAL || G.flags.menu_style === MENU_FULL) {
          if (!inokay && !outmaybe) {
            c = 98;
          } else {
            c = await in_or_out_menu(P(qbuf), current_container, outmaybe, inokay, (used !== 0 ? 1 : 0) << 24 >> 24, more_containers);
          }
        } else {
          xbuf[0] = 0;
          strcpy(P(pbuf), S(":"));
          strcat(outmaybe ? P(pbuf) : P(xbuf), S("o"));
          strcat(inokay ? P(pbuf) : P(xbuf), S("i"));
          strcat(outmaybe ? P(pbuf) : P(xbuf), S("b"));
          strcat(inokay ? P(pbuf) : P(xbuf), S("rs"));
          strcat(P(pbuf), S(" "));
          strcat(more_containers ? P(pbuf) : P(xbuf), S("n"));
          strcat(P(pbuf), S("q"));
          if (G.iflags.cmdassist) {
            strcat(P(pbuf), S(" or ?"));
          } else {
            strcat(P(xbuf), S("?"));
          }
          if ($rd(P(xbuf))) {
            strcat(strcat(P(pbuf), S("\x1b")), P(xbuf));
          }
          c = await yn_function(P(qbuf), P(pbuf), more_containers ? 110 : 113);
        }
        if (c === 63) {
          await explain_container_prompt(more_containers);
        } else if (c === 58) {
          if (!current_container.cknown) {
            used = 1;
          }
          await container_contents(current_container, FALSE, FALSE, TRUE);
        } else {
          break;
        }
      }
      if (c === 113) {
        abort_looting = TRUE;
      }
      if (c === 110 || c === 113) {
        { $g = 1; continue $L; }
      }
      loot_out = (c === 111 || c === 98 || c === 114 ? 1 : 0) << 24 >> 24;
      loot_in = (c === 105 || c === 98 || c === 114 ? 1 : 0) << 24 >> 24;
      loot_in_first = (c === 114 ? 1 : 0) << 24 >> 24;
      stash_one = (c === 115 ? 1 : 0) << 24 >> 24;
      if (loot_out && !loot_in_first) {
        if (!!!current_container.cobj) {
          await pline(S("%s"), P(emptymsg));
          if (!current_container.cknown) {
            used = 1;
          }
          current_container.cknown = 1;
        } else {
          add_valid_menu_class(0);
          if (G.flags.menu_style === MENU_TRADITIONAL) {
            used |= await traditional_loot(FALSE);
          } else {
            used |= await menu_loot(0, FALSE) > 0 ? 1 : 0;
          }
          add_valid_menu_class(0);
        }
      }
      if ((loot_in || stash_one) && (!G.invent || G.invent === current_container && !G.invent.nobj)) {
        await You(S("don't have anything%s to %s."), G.invent ? S(" else") : S(""), stash_one ? S("stash") : S("put in"));
        loot_in = stash_one = FALSE;
      }
      if (loot_in) {
        add_valid_menu_class(0);
        if (G.flags.menu_style === MENU_TRADITIONAL) {
          used |= await traditional_loot(TRUE);
        } else {
          used |= await menu_loot(0, TRUE) > 0 ? 1 : 0;
        }
        add_valid_menu_class(0);
      } else if (stash_one) {
        if (!!(otmp = await getobj(P(stashable), S("stash")))) {
          if (await in_container(otmp)) {
            used = 1;
          } else {
            await unsplitobj(otmp);
          }
        }
      }
      if (!current_container) {
        loot_out = FALSE;
      }
      if (loot_out && loot_in_first) {
        if (!!!current_container.cobj) {
          await pline(S("%s"), P(emptymsg));
          if (!current_container.cknown) {
            used = 1;
          }
          current_container.cknown = 1;
        } else {
          add_valid_menu_class(0);
          if (G.flags.menu_style === MENU_TRADITIONAL) {
            used |= await traditional_loot(FALSE);
          } else {
            used |= await menu_loot(0, FALSE) > 0 ? 1 : 0;
          }
          add_valid_menu_class(0);
        }
      }
    case 1: // containerdone
      if (used) {
        if (current_container) {
          current_container.cknown = 1;
        }
        update_inventory();
      }
      objp.a[objp.o] = current_container;
      if (current_container) {
        current_container = null;
      } else {
        abort_looting = TRUE;
      }
      return used;
    }
    break;
  }
}

async function traditional_loot(put_in: number): Promise<number> {
  let actionfunc = null;
  let checkfunc = null;
  let objlist = null;
  let selection = new Int8Array(28);
  let action = null;
  const one_by_one = new Int8Array(1);
  const allflag = new Int8Array(1);
  let used = 0;
  const menu_on_request = new Int32Array(1);
  menu_on_request[0] = 0;
  if (put_in) {
    action = S("put in");
    objlist = P(G, "invent");
    actionfunc = in_container;
    checkfunc = ck_bag;
  } else {
    action = S("take out");
    objlist = P(current_container, "cobj");
    actionfunc = out_container;
    checkfunc = null;
  }
  if (await query_classes(P(selection), P(one_by_one, 0), P(allflag, 0), action, objlist.a[objlist.o], FALSE, P(menu_on_request, 0))) {
    if (await askchain(objlist, one_by_one[0] ? null : P(selection), allflag[0], actionfunc, checkfunc, 0, action)) {
      used = 1;
    }
  } else if (menu_on_request[0] < 0) {
    used = await menu_loot(menu_on_request[0], put_in) > 0 ? 1 : 0;
  }
  return used;
}

async function menu_loot(retry: number, put_in: number): Promise<number> {
  let n = 0;
  let i = 0;
  let n_looted = 0;
  let all_categories = TRUE;
  let loot_everything = FALSE;
  let buf = new Int8Array(256);
  let action = put_in ? S("Put in") : S("Take out");
  const otmp = [null];
  let otmp2 = null;
  const pick_list = [null];
  let mflags = 0;
  let res = 0;
  let count = 0;
  if (retry) {
    all_categories = (retry === -2 ? 1 : 0) << 24 >> 24;
  } else if (G.flags.menu_style === MENU_FULL) {
    all_categories = FALSE;
    sprintf(P(buf), S("%s what type of objects?"), action);
    mflags = ALL_TYPES | UNPAID_TYPES | BUCX_TYPES | CHOOSE_ALL;
    n = await query_category(P(buf), put_in ? G.invent : current_container.cobj, mflags, P(pick_list, 0), PICK_ANY);
    if (!n) {
      return 0;
    }
    for (i = 0; i < n; ++i) {
      if ($sadd(pick_list[0], i).item.a_int === 65) {
        loot_everything = TRUE;
      } else if ($sadd(pick_list[0], i).item.a_int === ALL_TYPES_SELECTED) {
        all_categories = TRUE;
      } else {
        add_valid_menu_class($sadd(pick_list[0], i).item.a_int);
      }
    }
    free(pick_list[0]);
  }
  if (loot_everything) {
    if (!put_in) {
      current_container.cknown = 1;
      for (otmp[0] = current_container.cobj; otmp[0]; otmp[0] = otmp2) {
        otmp2 = otmp[0].nobj;
        res = await out_container(otmp[0]);
        if (res < 0) {
          break;
        }
        n_looted += res;
      }
    } else {
      for (otmp[0] = G.invent; otmp[0] && current_container; otmp[0] = otmp2) {
        otmp2 = otmp[0].nobj;
        res = await in_container(otmp[0]);
        if (res < 0) {
          break;
        }
        n_looted += res;
      }
    }
  } else {
    mflags = INVORDER_SORT;
    if (put_in && G.flags.invlet_constant) {
      mflags |= USE_INVLET;
    }
    if (!put_in) {
      current_container.cknown = 1;
    }
    sprintf(P(buf), S("%s what?"), action);
    n = await query_objlist(P(buf), put_in ? P(G, "invent") : P(current_container, "cobj"), mflags, P(pick_list, 0), PICK_ANY, all_categories ? allow_all : allow_category);
    if (n) {
      n_looted = n;
      for (i = 0; i < n; ++i) {
        otmp[0] = $sadd(pick_list[0], i).item.a_obj;
        count = $sadd(pick_list[0], i).count;
        if (count > 0 && count < otmp[0].quan) {
          otmp[0] = await splitobj(otmp[0], count);
        }
        res = put_in ? await in_container(otmp[0]) : await out_container(otmp[0]);
        if (res < 0) {
          if (!current_container) {
            otmp[0] = null;
          } else if (otmp[0] && otmp[0] !== $sadd(pick_list[0], i).item.a_obj) {
            await merged(P($sadd(pick_list[0], i).item, "a_obj"), P(otmp, 0));
          }
          break;
        }
      }
      free(pick_list[0]);
    }
  }
  return n_looted;
}

async function in_or_out_menu(prompt: Ptr | null, obj: struct_obj | null, outokay: number, inokay: number, alreadyused: number, more_containers: number): Promise<number> {
  let win = 0;
  let any = new union_any();
  const pick_list = [null];
  let buf = new Int8Array(256);
  let n = 0;
  let menuselector = G.flags.lootabc ? P(in_or_out_menu$abc_chars) : P(in_or_out_menu$lootchars);
  any.$cp(G.zeroany);
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  any.a_int = 1;
  sprintf(P(buf), S("Look inside %s"), await thesimpleoname(obj));
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  if (outokay) {
    any.a_int = 2;
    sprintf(P(buf), S("take %s out"), G.c_common_strings.c_something);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  if (inokay) {
    any.a_int = 3;
    sprintf(P(buf), S("put %s in"), G.c_common_strings.c_something);
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  if (outokay) {
    any.a_int = 4;
    sprintf(P(buf), S("%stake out, then put in"), inokay ? S("both; ") : S(""));
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  if (inokay) {
    any.a_int = 5;
    sprintf(P(buf), S("%sput in, then take out"), outokay ? S("both reversed; ") : S(""));
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    any.a_int = 6;
    sprintf(P(buf), S("stash one item into %s"), await thesimpleoname(obj));
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  any.a_int = 0;
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  if (more_containers) {
    any.a_int = 7;
    await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, S("loot next container"), MENU_SELECTED);
  }
  any.a_int = 8;
  strcpy(P(buf), alreadyused ? S("done") : S("do nothing"));
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, menuselector.a[menuselector.o + any.a_int], 0, ATR_NONE, P(buf), more_containers ? MENU_UNSELECTED : MENU_SELECTED);
  await G.windowprocs.win_end_menu(win, prompt);
  n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(pick_list, 0));
  await G.windowprocs.win_destroy_nhwindow(win);
  if (n > 0) {
    let k = pick_list[0].item.a_int;
    if (n > 1 && k === (more_containers ? 7 : 8)) {
      k = $sadd(pick_list[0], 1).item.a_int;
    }
    free(pick_list[0]);
    return in_or_out_menu$lootchars[k];
  }
  return (n === 0 && more_containers ? 110 : 113) << 24 >> 24;
}

export async function dotip(): Promise<number> {
  let cobj = null;
  let nobj = null;
  let cc = new struct_nhcoord();
  let boxes = 0;
  let c = 0;
  let buf = new Int8Array(256);
  let qbuf = new Int8Array(256);
  let spillage = null;
  cc.x = G.u.ux, cc.y = G.u.uy;
  if ((boxes = container_at(cc.x, cc.y, TRUE)) > 0) {
    sprintf(P(buf), S("You can't tip %s while carrying so much."), !G.flags.verbose ? S("a container") : boxes > 1 ? S("one") : S("it"));
    if (!await check_capacity(P(buf)) && await able_to_loot(cc.x, cc.y, FALSE)) {
      if (boxes > 1 && (G.flags.menu_style !== MENU_TRADITIONAL || G.iflags.menu_requested)) {
        let n = 0;
        let i = 0;
        let win = 0;
        let any = new union_any();
        const pick_list = [null];
        pick_list[0] = null;
        let dummyobj = new struct_obj();
        let otmp = null;
        any.$cp(G.zeroany);
        win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        await G.windowprocs.win_start_menu(win);
        for (cobj = G.level.objects[cc.x][cc.y], i = 0; cobj; cobj = cobj.v.v_nexthere) {
          if (cobj.otyp >= 189 && cobj.otyp <= 195) {
            ++i;
            any.a_obj = cobj;
            await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, await doname(cobj), MENU_UNSELECTED);
          }
        }
        if (G.invent) {
          any.$cp(G.zeroany);
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
          any.a_obj = dummyobj;
          i = i <= 105 - 97 && !G.flags.lootabc ? 105 : 0;
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, i, 0, ATR_NONE, S("tip something being carried"), MENU_SELECTED);
        }
        await G.windowprocs.win_end_menu(win, S("Tip which container?"));
        n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(pick_list, 0));
        await G.windowprocs.win_destroy_nhwindow(win);
        otmp = n <= 0 ? null : pick_list[0].item.a_obj;
        if (n > 1 && otmp === dummyobj) {
          otmp = $sadd(pick_list[0], 1).item.a_obj;
        }
        if (pick_list[0]) {
          free(pick_list[0]);
        }
        if (otmp && otmp !== dummyobj) {
          await tipcontainer(otmp);
          return 1;
        }
        if (n === -1) {
          return 0;
        }
      } else {
        for (cobj = G.level.objects[cc.x][cc.y]; cobj; cobj = nobj) {
          nobj = cobj.v.v_nexthere;
          if (!(cobj.otyp >= 189 && cobj.otyp <= 195)) {
            continue;
          }
          c = await yn_function(await safe_qbuf(P(qbuf), S("There is "), S(" here, tip it?"), cobj, doname, ansimpleoname, S("container")), P(G.ynqchars), 113);
          if (c === 113) {
            return 0;
          }
          if (c === 110) {
            continue;
          }
          await tipcontainer(cobj);
          return 1;
        }
      }
    }
  }
  cobj = await getobj(P(tippables), S("tip"));
  if (!cobj) {
    return 0;
  }
  if (cobj.otyp >= 189 && cobj.otyp <= 195 || cobj.otyp === HORN_OF_PLENTY) {
    await tipcontainer(cobj);
    return 1;
  }
  if ((cobj.otyp === 199 || cobj.otyp === 200) && cobj.lamplit | 0) {
    spillage = S("wax");
  } else if (cobj.otyp === POT_OIL && cobj.lamplit | 0 || cobj.otyp === OIL_LAMP && cobj.age !== 0 || cobj.otyp === MAGIC_LAMP && cobj.spe !== 0) {
    spillage = S("oil");
  } else if (cobj.otyp === CAN_OF_GREASE && cobj.spe > 0) {
    spillage = S("grease");
  } else if (cobj.otyp === FOOD_RATION || cobj.otyp === CRAM_RATION || cobj.otyp === LEMBAS_WAFER) {
    spillage = S("crumbs");
  } else if (cobj.oclass === VENOM_CLASS) {
    spillage = S("venom");
  }
  if (spillage) {
    buf[0] = 0;
    if (is_pool(G.u.ux, G.u.uy)) {
      sprintf(P(buf), S(" and gradually %s"), vtense(spillage, S("dissipate")));
    } else if (is_lava(G.u.ux, G.u.uy)) {
      sprintf(P(buf), S(" and immediately %s away"), vtense(spillage, S("burn")));
    }
    await pline(S("Some %s %s onto the %s%s."), spillage, vtense(spillage, S("spill")), surface(G.u.ux, G.u.uy), P(buf));
    if (cobj.otyp === CAN_OF_GREASE && cobj.spe > 0) {
      await consume_obj_charge(cobj, TRUE);
    }
    return 1;
  }
  if (cobj.oclass === POTION_CLASS) {
    await pline_The(S("%s %s securely sealed."), await xname(cobj), otense(cobj, S("are")));
  } else if (cobj.otyp === STATUE) {
    await pline(S("Nothing interesting happens."));
  } else {
    await pline(S("%s"), G.c_common_strings.c_nothing_happens);
  }
  return 0;
}

async function tipcontainer(box: struct_obj | null): Promise<void> {
  const ox = new Int8Array(1);
  ox[0] = G.u.ux;
  const oy = new Int8Array(1);
  oy[0] = G.u.uy;
  let empty_it = FALSE;
  let maybeshopgoods = 0;
  if (get_obj_location(box, P(ox, 0), P(oy, 0), 0)) {
    box.ox = ox[0], box.oy = oy[0];
  }
  maybeshopgoods = (!(box.where === 3) && await costly_spot(box.ox, box.oy) ? 1 : 0) << 24 >> 24;
  if (!box.lknown) {
    box.lknown = 1;
    if (box.where === 3) {
      update_inventory();
    }
  }
  if (box.olocked) {
    await pline(S("It's locked."));
  } else if (box.otrapped) {
    await chest_trap(box, HAND, FALSE);
    if (G.multi >= 0) {
      nomul(-1);
      G.multi_reason = S("tipping a container");
      G.nomovemsg = S("");
    }
  } else if (box.otyp === BAG_OF_TRICKS || box.otyp === HORN_OF_PLENTY) {
    let bag = (box.otyp === BAG_OF_TRICKS ? 1 : 0) << 24 >> 24;
    let old_spe = box.spe;
    const seen = new Int32Array(1);
    seen[0] = 0;
    if (maybeshopgoods && !box.no_charge) {
      await addtobill(box, FALSE, FALSE, TRUE);
    }
    do {
      if (!(bag ? await bagotricks(box, TRUE, P(seen, 0)) : await hornoplenty(box, TRUE))) {
        break;
      }
    } while (box.spe > 0);
    if (box.spe < old_spe) {
      if (bag) {
        await pline(seen[0] === 0 ? S("Nothing seems to happen.") : seen[0] === 1 ? S("A monster appears.") : S("Monsters appear!"));
      }
      box.spe = old_spe << 24 >> 24;
      await check_unpaid_usage(box, TRUE);
      box.spe = 0;
      box.cknown = 1;
    }
    if (maybeshopgoods && !box.no_charge) {
      await subfrombill(box, await shop_keeper($rd(in_rooms(ox[0], oy[0], SHOPBASE))));
    }
  } else if (box.otyp === 189 && box.spe === 1) {
    let yourbuf = new Int8Array(256);
    await observe_quantum_cat(box, TRUE, TRUE);
    if (!!!box.cobj) {
      await pline(S("%sbox is now empty."), await Shk_Your(P(yourbuf), box));
    } else {
      empty_it = TRUE;
    }
    box.cknown = 1;
  } else if (!!!box.cobj) {
    box.cknown = 1;
    await pline(S("It's empty."));
  } else {
    empty_it = TRUE;
  }
  if (empty_it) {
    let otmp = null;
    let nobj = null;
    let terse = 0;
    let highdrop = (!can_reach_floor(TRUE) ? 1 : 0) << 24 >> 24;
    let altarizing = ($at2(G.level.locations, ox[0], oy[0]).typ === ALTAR ? 1 : 0) << 24 >> 24;
    let cursed_mbag = ((box.otyp === 194 || box.otyp === 195) && box.cursed | 0 ? 1 : 0) << 24 >> 24;
    let held = box.where === 3 ? 1 : 0;
    let loss = 0;
    if (G.u.uswallow) {
      highdrop = altarizing = FALSE;
    }
    terse = (!(highdrop || altarizing || await costly_spot(box.ox, box.oy)) ? 1 : 0) << 24 >> 24;
    box.cknown = 1;
    await pline(S("%s out%c"), box.cobj.nobj ? S("Objects spill") : S("An object spills"), terse ? 58 : 46);
    for (otmp = box.cobj; otmp; otmp = nobj) {
      nobj = otmp.nobj;
      await obj_extract_self(otmp);
      otmp.ox = box.ox, otmp.oy = box.oy;
      if (box.otyp === ICE_BOX) {
        await removed_from_icebox(otmp);
      } else if (cursed_mbag && !rn2(13)) {
        loss += await mbag_item_gone(held, otmp);
        terse = FALSE;
        continue;
      }
      if (maybeshopgoods) {
        await addtobill(otmp, FALSE, FALSE, TRUE);
        ++G.iflags.suppress_price;
      }
      if (highdrop) {
        await hitfloor(otmp, TRUE);
      } else {
        if (altarizing) {
          await doaltarobj(otmp);
        } else if (!terse) {
          await pline(S("%s %s to the %s."), await Doname2(otmp), otense(otmp, S("drop")), surface(ox[0], oy[0]));
        } else {
          await pline(S("%s%c"), await doname(otmp), nobj ? 44 : 46);
          G.iflags.last_msg = PLNMSG_OBJNAM_ONLY;
        }
        await dropy(otmp);
        if (G.iflags.last_msg !== PLNMSG_OBJNAM_ONLY) {
          terse = FALSE;
        }
      }
      if (maybeshopgoods) {
        --G.iflags.suppress_price;
      }
    }
    if (loss) {
      await You(S("owe %ld %s for lost merchandise."), loss, await currency(loss));
    }
    box.owt = await weight(box) >>> 0;
    if (held) {
      await encumber_msg();
    }
  }
  if (box.where === 3) {
    update_inventory();
  }
}

export function $init(): void {
  current_container = null;
  abort_looting = 0;
  moderateloadmsg = $cs("You have a little trouble lifting", 34);
  nearloadmsg = $cs("You have much trouble lifting", 30);
  overloadmsg = $cs("You have extreme difficulty lifting", 36);
  val_for_n_or_more = 0;
  valid_menu_classes = new Int8Array(24);
  class_filter = 0;
  bucx_filter = 0;
  shop_filter = 0;
  stashable = $ta(Int8Array, 4, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES]);
  tippables = $ta(Int8Array, 3, [ALL_CLASSES, TOOL_CLASS]);
  add_valid_menu_class$vmc_count = 0;
  autopick_testobj$costly = 0;
  encumber_msg$oldcap = UNENCUMBERED;
  observe_quantum_cat$sc = $cs("Schroedinger's Cat", 19);
  explain_container_prompt$explaintext = [S("Container actions:"),
S(""),
S(" : -- Look: examine contents"),
S(" o -- Out: take things out"),
S(" i -- In: put things in"),
S(" b -- Both: first take things out, then put things in"),
S(" r -- Reversed: put things in, then take things out"),
S(" s -- Stash: put one item in"),
S(""),
S(" n -- Next: loot next selected container"),
S(" q -- Quit: finished"),
S(" ? -- Help: display this text."),
S(""),
null];
  in_or_out_menu$lootchars = $cs("_:oibrsnq", 10);
  in_or_out_menu$abc_chars = $cs("_:abcdenq", 10);
}
