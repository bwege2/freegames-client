// @ts-nocheck
// NetHack 3.6.7 invent.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { tinnable } from './apply.ts';
import { confers_luck, discover_artifact, set_artifact_intrinsic, touch_artifact } from './artifact.ts';
import { set_moreluck } from './attrib.ts';
import { get_count, readchar, savech, yn_function } from './cmd.ts';
import { is_drawbridge_wall, is_ice, is_lava, is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { dropx, dropy } from './do.ts';
import { mon_nam, noit_Monnam, objtyp_is_callable, oname, safe_oname } from './do_name.ts';
import { canwearobj, fingers_or_gloves, inaccessible_equipment } from './do_wear.ts';
import { hitfloor, throwing_weapon } from './dothrow.ts';
import { def_char_to_objclass } from './drawing.ts';
import { on_level } from './dungeon.ts';
import { is_edible } from './eat.ts';
import { panic } from './end.ts';
import { can_reach_floor, read_engr_at, surface } from './engrave.ts';
import { in_rooms, inv_cnt, money_cnt, near_capacity, obj_to_any } from './hack.ts';
import { digit, eos, highc, ing_suffix, letter, s_suffix, strkitten, strncmpi, strstri, visctrl } from './hacklib.ts';
import { obj_merge_light_sources } from './light.ts';
import { clear_splitobjs, curse, extract_nobj, obj_absorb, obj_extract_self, place_object, pudding_merge_message, splitobj, unknwn_contnr_contents, weight } from './mkobj.ts';
import { dead_species, hideunder } from './mon.ts';
import { poly_when_stoned } from './mondata.ts';
import { discover_object } from './o_init.ts';
import { an, ansimpleoname, corpse_xname, cxname_singular, distant_name, doname, doname_with_price, killer_xname, makeplural, not_fully_identified, safe_qbuf, simpleonames, xname } from './objnam.ts';
import { hide_unhide_msgtypes } from './options.ts';
import { add_valid_menu_class, allow_all, allow_category, ck_bag, collect_obj_classes, container_gone, menu_class_present, query_category, query_objlist } from './pickup.ts';
import { There, You, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, mbodypart } from './polyself.ts';
import { a_gname } from './pray.ts';
import { align_str } from './priest.ts';
import { artitouch } from './quest.ts';
import { is_quest_artifact } from './questpgr.ts';
import { is_chargeable, unpunish } from './read.ts';
import { rn2 } from './rnd.ts';
import { addtobill, check_unpaid, costly_spot, doinvbill, inhishop, inside_shop, obfree, picked_container, same_price, shop_keeper, shopper_financial_report, stolen_value, unpaid_cost } from './shk.ts';
import { attach_fig_transform_timeout, learn_egg_type, obj_stop_timers, stop_timer } from './timeout.ts';
import { instapetrify, t_at } from './trap.ts';
import { setuqwep, welded } from './wield.ts';
import { bypass_objlist, nxt_unbypassed_loot, setnotworn, setworn } from './worn.ts';
import { get_obj_location } from './zap.ts';
import { struct_monst, struct_nhcoord, struct_obj, struct_sortloot_item, struct_xprnctx, union_any } from './structs.ts';
import { $cs, $peq, $rd, $sadd, $sarr, $sat, $ta, $u64, $wr, G, P, S, free, qsort, rn2_on_display_rng, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp, strstr } from './rt/index.ts';
import { ALLOW_COUNT, ALLOW_NONE, ALL_CLASSES, ALL_FINISHED, ALTAR, AMULET_CLASS, AMULET_OF_YENDOR, AM_SHRINE, ARMOR_CLASS, ARM_BOOTS, ARM_CLOAK, ARM_GLOVES, ARM_HELM, ARM_SHIELD, ARM_SHIRT, ARM_SUIT, ART_MJOLLNIR, ATR_NONE, BAG_OF_TRICKS, BALL_CLASS, BELL_OF_OPENING, BILLED_TYPES, BLINDED, BLINDFOLD, BOULDER, BRASS_LANTERN, BUC_BLESSED, BUC_CURSED, BUC_UNCURSED, BUC_UNKNOWN, BUFSZ, BULLWHIP, CANDELABRUM_OF_INVOCATION, CAN_OF_GREASE, CHAIN_CLASS, COIN_CLASS, CONTAINED_SYM, CORPSE, CREAM_PIE, CRYSKNIFE, CRYSTAL_BALL, CXN_ARTICLE, CXN_PFX_THE, DBWALL, DOOR, DRAWBRIDGE_DOWN, EGG, EUCALYPTUS_LEAF, EXPL_MAX, FAKE_AMULET_OF_YENDOR, FALSE, FIGURINE, FIG_TRANSFORM, FINGERTIP, FOOD_CLASS, FOUNTAIN, FUMBLING, GEMSTONE, GEM_CLASS, GLASS, GOLD_INDX, GOLD_OFFSET, GOLD_SYM, GRAVE, HALLUC, HALLUC_RES, HAND, HANDED, HANDS_SYM, HORN_OF_PLENTY, INCLUDE_HERO, INVORDER_SORT, IRONBARS, LARGEST_INT, LEASH, LENSES, LOADSTONE, LOW_PM, MAGIC_LAMP, MAGIC_MARKER, MAXOCLASSES, MAXPCHARS, MEAT_RING, MENU_FULL, MENU_PARTIAL, MENU_TRADITIONAL, MENU_UNSELECTED, MINV_ALL, MINV_PICKMASK, MIRROR, MOD_ENCUMBER, MSGTYP_MASK_REP_SHOW, NHW_MENU, NOINVSYM, NON_PM, NO_GLYPH, OBJ_CONTAINED, OBJ_FLOOR, OBJ_FREE, OBJ_INVENT, OIL_LAMP, OVRFLW_INDX, PICK_ANY, PICK_NONE, PICK_ONE, PLNMSG_ONE_ITEM_HERE, PM_LIZARD, PM_RUST_MONSTER, POTION_CLASS, POT_OIL, POT_WATER, P_AXE, P_BOOMERANG, P_BOW, P_CROSSBOW, P_DAGGER, P_DART, P_KNIFE, P_LANCE, P_NONE, P_PICK_AXE, P_POLEARMS, P_SPEAR, RING_CLASS, ROCK, ROCK_CLASS, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_SCARE_MONSTER, SIGNAL_ESCAPE, SIGNAL_NOMENU, SINK, SORTLOOT_INVLET, SORTLOOT_LOOT, SORTLOOT_PACK, SORTLOOT_PETRIFY, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_NOVEL, STATUE, STOMACH, STONE_RES, S_TROLL, S_arrow_trap, S_dnladder, S_dnstair, S_fountain, S_grave, S_ice, S_lava, S_ndoor, S_sink, S_throne, S_tree, S_upladder, S_upstair, S_vcdbridge, S_vcdoor, S_vodbridge, S_vodoor, THRONE, TIN, TOOL_CLASS, TOWEL, TREE, TRUE, UNPAID_TYPES, USE_INVLET, VENOM_CLASS, WAND_CLASS, WEAPON_CLASS, WIN_ERR, W_ACCESSORY, W_ARMOR, W_ART, W_QUIVER, W_SADDLE, W_SWAPWEP, W_TOOL, W_WEAPONS, W_WEP } from './consts.ts';

let lastinvnr: number;
let venom_inv: any;
let sortlootmode: number;
let currencies: any;
let safeq_xprn_ctx: struct_xprnctx;
let removeables: any;
let cached_pickinv_win: number;
let this_type: number;
let names: any;
let oth_symbols: any;
let oth_names: any;
let invbuf: Ptr | null;
let invbufsiz: number;
let only: struct_nhcoord;
let loot_classify$def_srt_order: any;
let loot_classify$armcat: any;
let xprname$li: any;
let display_pickinv$not_carrying_anything: any;
let dfeature_at$altbuf: any;

function loot_classify(sort_item: struct_sortloot_item | null, obj: struct_obj | null): void {
  let classorder = null;
  let p = null;
  let k = 0;
  let otyp = obj.otyp;
  let oclass = obj.oclass;
  let seen = 0;
  let discovered = (G.objects[otyp].oc_name_known | 0 ? TRUE : FALSE) << 24 >> 24;
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    obj.dknown = 1;
  }
  seen = (obj.dknown | 0 ? TRUE : FALSE) << 24 >> 24, classorder = G.flags.sortpack ? P(G.flags.inv_order) : P(loot_classify$def_srt_order);
  p = strchr(classorder, oclass);
  if (p) {
    k = 1 + (p.o - classorder.o | 0);
  } else {
    k = 1 + (strlen(classorder) | 0) + (oclass !== VENOM_CLASS ? 1 : 0);
  }
  sort_item.orderclass = k << 24 >> 24;
  switch (oclass) {
  case ARMOR_CLASS:
    if (!loot_classify$armcat[7]) {
      loot_classify$armcat[ARM_HELM] = 1;
      loot_classify$armcat[ARM_GLOVES] = 2;
      loot_classify$armcat[ARM_BOOTS] = 3;
      loot_classify$armcat[ARM_SHIELD] = 4;
      loot_classify$armcat[ARM_CLOAK] = 5;
      loot_classify$armcat[ARM_SHIRT] = 6;
      loot_classify$armcat[ARM_SUIT] = 7;
      loot_classify$armcat[7] = 8;
    }
    k = G.objects[otyp].oc_subtyp;
    if (k < 0 || k >= 7) {
      k = 7;
    }
    k = loot_classify$armcat[k];
    break;
  case WEAPON_CLASS:
    k = G.objects[otyp].oc_subtyp;
    k = k < 0 ? k >= -P_CROSSBOW && k <= -P_BOW ? 1 : 3 : k >= P_BOW && k <= P_CROSSBOW ? 2 : k === P_SPEAR || k === P_DAGGER || k === P_KNIFE ? 4 : !((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && (G.objects[obj.otyp].oc_subtyp === P_POLEARMS || G.objects[obj.otyp].oc_subtyp === P_LANCE)) ? 5 : 6;
    break;
  case TOOL_CLASS:
    if (seen && discovered && (otyp === BAG_OF_TRICKS || otyp === HORN_OF_PLENTY)) {
      k = 2;
    } else if (obj.otyp >= 189 && obj.otyp <= 195) {
      k = 1;
    } else {
      switch (otyp) {
      case 222:
      case 223:
      case 224:
      case 225:
      case 226:
      case 228:
      case 229:
      case 231:
      case 232:
      case 233:
      case 227:
        k = 3;
        break;
      default:
        k = 4;
        break;
      }
    }
    break;
  case FOOD_CLASS:
    switch (otyp) {
    case 260:
      k = 1;
      break;
    default:
      k = obj.globby | 0 ? 6 : 2;
      break;
    case 271:
      k = 3;
      break;
    case 241:
      k = 4;
      break;
    case 240:
      k = 5;
      break;
    }
    break;
  case GEM_CLASS:
    switch (G.objects[obj.otyp].oc_material | 0) {
    case GEMSTONE:
      k = !seen ? 1 : !discovered ? 2 : 3;
      break;
    case GLASS:
      k = !seen ? 1 : !discovered ? 2 : 4;
      break;
    default:
      k = !seen ? 5 : obj.otyp !== ROCK ? !discovered ? 6 : 7 : 8;
      break;
    }
    break;
  default:
    k = 1;
    break;
  }
  sort_item.subclass = k << 24 >> 24;
  k = !seen ? 1 : discovered || !G.obj_descr[G.objects[otyp].oc_descr_idx].oc_descr ? 4 : G.objects[otyp].oc_uname ? 3 : 2;
  sort_item.disco = k << 24 >> 24;
}

async function loot_xname(obj: struct_obj | null): Promise<Ptr | null> {
  let saveo = new struct_obj();
  let save_debug = 0;
  let res = null;
  let save_oname = null;
  saveo.oeroded = (obj.oeroded) & 3;
  saveo.blessed = (obj.blessed) & 1, saveo.cursed = (obj.cursed) & 1;
  saveo.spe = obj.spe;
  saveo.owt = obj.owt;
  save_oname = obj.oextra && obj.oextra.oname ? obj.oextra.oname : null;
  save_debug = G.flags.debug;
  if (obj.oclass === POTION_CLASS) {
    obj.oeroded = 0;
    if (obj.otyp === POT_WATER) {
      obj.blessed = 0, obj.cursed = 0;
    }
  }
  if (obj.otyp === TOWEL) {
    obj.spe = 0;
  }
  if (obj.globby) {
    obj.owt = 200;
  }
  if (save_oname && !obj.oartifact) {
    obj.oextra.oname = null;
  }
  if (G.flags.debug) {
    G.program_state.something_worth_saving = 0;
    G.flags.debug = FALSE;
  }
  res = await cxname_singular(obj);
  if (save_debug) {
    G.flags.debug = TRUE;
    G.program_state.something_worth_saving = 1;
  }
  if (obj.oclass === POTION_CLASS) {
    obj.oeroded = (saveo.oeroded) & 3;
    if (obj.otyp === POT_WATER) {
      obj.blessed = (saveo.blessed) & 1, obj.cursed = (saveo.cursed) & 1;
    }
  }
  if (obj.otyp === TOWEL) {
    obj.spe = saveo.spe;
    strcat(res, obj.otyp === 209 && obj.spe > 0 ? obj.spe >= 3 ? S("x") : S("y") : S("z"));
  }
  if (obj.globby) {
    obj.owt = saveo.owt;
    strcat(res, obj.owt <= 100 ? S("a") : obj.owt <= 300 ? S("b") : obj.owt <= 500 ? S("c") : S("d"));
  }
  if (save_oname && !obj.oartifact) {
    obj.oextra.oname = save_oname;
  }
  return res;
}

async function sortloot_cmp(vptr1: any, vptr2: any): Promise<number> {
  let $g = 0;
  let sli1 = null;
  let sli2 = null;
  let obj1 = null;
  let obj2 = null;
  let nam1 = null;
  let nam2 = null;
  let val1 = 0;
  let val2 = 0;
  let c = 0;
  let namcmp = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      sli1 = vptr1;
      sli2 = vptr2;
      obj1 = sli1.obj;
      obj2 = sli2.obj;
      if ((sortlootmode & (SORTLOOT_PACK | SORTLOOT_INVLET)) >>> 0 !== SORTLOOT_INVLET) {
        if (!sli1.orderclass) {
          loot_classify(sli1, obj1);
        }
        if (!sli2.orderclass) {
          loot_classify(sli2, obj2);
        }
        val1 = sli1.orderclass;
        val2 = sli2.orderclass;
        if (val1 !== val2) {
          return val1 - val2;
        }
        if ((sortlootmode & SORTLOOT_INVLET) >>> 0 === 0) {
          val1 = sli1.subclass;
          val2 = sli2.subclass;
          if (val1 !== val2) {
            return val1 - val2;
          }
          val1 = sli1.disco;
          val2 = sli2.disco;
          if (val1 !== val2) {
            return val1 - val2;
          }
        }
      }
      if ((sortlootmode & SORTLOOT_INVLET) >>> 0 !== 0) {
        c = obj1.invlet;
        val1 = 97 <= c && c <= 122 ? c - 97 + 2 : 65 <= c && c <= 90 ? c - 65 + 2 + 26 : c === 36 ? 1 : c === 35 ? 1 + 52 + 1 : 1 + 52 + 1 + 1;
        c = obj2.invlet;
        val2 = 97 <= c && c <= 122 ? c - 97 + 2 : 65 <= c && c <= 90 ? c - 65 + 2 + 26 : c === 36 ? 1 : c === 35 ? 1 + 52 + 1 : 1 + 52 + 1 + 1;
        if (val1 !== val2) {
          return val1 - val2;
        }
      }
      if ((sortlootmode & SORTLOOT_LOOT) >>> 0 === 0) {
        { $g = 1; continue $L; }
      }
      nam1 = sli1.str;
      if (!nam1) {
        nam1 = sli1.str = await dupstr(await loot_xname(obj1));
      }
      nam2 = sli2.str;
      if (!nam2) {
        nam2 = sli2.str = await dupstr(await loot_xname(obj2));
      }
      if ((namcmp = strncmpi(nam1, nam2, -1)) !== 0) {
        return namcmp;
      }
      val1 = obj1.bknown | 0 ? obj1.blessed | 0 ? 3 : !obj1.cursed ? 2 : 1 : 0;
      val2 = obj2.bknown | 0 ? obj2.blessed | 0 ? 3 : !obj2.cursed ? 2 : 1 : 0;
      if (val1 !== val2) {
        return val2 - val1;
      }
      val1 = obj1.greased | 0;
      val2 = obj2.greased | 0;
      if (val1 !== val2) {
        return val2 - val1;
      }
      val1 = (obj1.oeroded | 0) > (obj1.oeroded2 | 0) ? obj1.oeroded | 0 : obj1.oeroded2 | 0;
      val2 = (obj2.oeroded | 0) > (obj2.oeroded2 | 0) ? obj2.oeroded | 0 : obj2.oeroded2 | 0;
      if (val1 !== val2) {
        return val1 - val2;
      }
      val1 = obj1.rknown | 0 && obj1.oerodeproof | 0 ? 1 : 0;
      val2 = obj2.rknown | 0 && obj2.oerodeproof | 0 ? 1 : 0;
      if (val1 !== val2) {
        return val2 - val1;
      }
      if (G.objects[obj1.otyp].oc_uses_known | 0 && obj1.oclass !== FOOD_CLASS) {
        val1 = obj1.known | 0 ? obj1.spe : -1000;
        val2 = obj2.known | 0 ? obj2.spe : -1000;
        if (val1 !== val2) {
          return val2 - val1;
        }
      }
    case 1: // tiebreak
      return sli1.indx - sli2.indx;
    }
    break;
  }
}

export async function sortloot(olist: Ptr | null, mode: number, by_nexthere: number, filterfunc: Function | null): Promise<struct_sortloot_item | null> {
  let sliarray = null;
  let o = null;
  let n = 0;
  let i = 0;
  let augment_filter = 0;
  for (n = 0, o = olist.a[olist.o]; o; o = by_nexthere ? o.v.v_nexthere : o.nobj) {
    n = n + 1 >>> 0;
  }
  sliarray = $sarr(struct_sortloot_item, ((n + 1 >>> 0) * 24 >>> 0) / 24)[0];
  augment_filter = ((mode & SORTLOOT_PETRIFY) >>> 0 ? TRUE : FALSE) << 24 >> 24;
  mode = (mode & 4294967263) >>> 0;
  for (i = 0, o = olist.a[olist.o]; o; o = by_nexthere ? o.v.v_nexthere : o.nobj) {
    if (filterfunc && !await filterfunc(o) && (!augment_filter || o.otyp !== CORPSE || !($sat(G.mons, o.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, o.corpsenm) === $sat(G.mons, 9)))) {
      continue;
    }
    $sadd(sliarray, i).obj = o, $sadd(sliarray, i).indx = i | 0;
    $sadd(sliarray, i).str = null;
    $sadd(sliarray, i).orderclass = $sadd(sliarray, i).subclass = $sadd(sliarray, i).disco = 0;
    i = i + 1 >>> 0;
  }
  n = i;
  $sadd(sliarray, n).obj = null, $sadd(sliarray, n).indx = -1;
  $sadd(sliarray, n).str = null;
  $sadd(sliarray, n).orderclass = $sadd(sliarray, n).subclass = $sadd(sliarray, n).disco = 0;
  if (mode && n > 1) {
    sortlootmode = mode;
    await qsort(sliarray, n, 24, sortloot_cmp);
    sortlootmode = 0;
    for (i = 0; i < n; i = i + 1 >>> 0) {
      if ($sadd(sliarray, i).str) {
        free($sadd(sliarray, i).str), $sadd(sliarray, i).str = null;
      }
    }
  }
  return sliarray;
}

export function unsortloot(loot_array_p: Ptr | null): void {
  if (loot_array_p.a[loot_array_p.o]) {
    free(loot_array_p.a[loot_array_p.o]), loot_array_p.a[loot_array_p.o] = null;
  }
}

export function assigninvlet(otmp: struct_obj | null): void {
  let inuse = new Int8Array(52);
  let i = 0;
  let obj = null;
  if (otmp.oclass === COIN_CLASS) {
    otmp.invlet = GOLD_SYM;
    return;
  }
  for (i = 0; i < 52; ++i) {
    inuse[i] = FALSE;
  }
  for (obj = G.invent; obj; obj = obj.nobj) {
    if (obj !== otmp) {
      i = obj.invlet;
      if (97 <= i && i <= 122) {
        inuse[i - 97] = TRUE;
      } else if (65 <= i && i <= 90) {
        inuse[i - 65 + 26] = TRUE;
      }
      if (i === otmp.invlet) {
        otmp.invlet = 0;
      }
    }
  }
  if ((i = otmp.invlet) && (97 <= i && i <= 122 || 65 <= i && i <= 90)) {
    return;
  }
  for (i = lastinvnr + 1; i !== lastinvnr; ++i) {
    if (i === 52) {
      i = -1;
      continue;
    }
    if (!inuse[i]) {
      break;
    }
  }
  otmp.invlet = (inuse[i] ? NOINVSYM : i < 26 ? 97 + i : 65 + i - 26) << 24 >> 24;
  lastinvnr = i;
}

function reorder_invent(): void {
  let otmp = null;
  let prev = null;
  let next = null;
  let need_more_sorting = 0;
  do {
    need_more_sorting = FALSE;
    for (otmp = G.invent, prev = null; otmp; ) {
      next = otmp.nobj;
      if (next && (next.invlet ^ 32) < (otmp.invlet ^ 32)) {
        need_more_sorting = TRUE;
        if (prev) {
          prev.nobj = next;
        } else {
          G.invent = next;
        }
        otmp.nobj = next.nobj;
        next.nobj = otmp;
        prev = next;
      } else {
        prev = otmp;
        otmp = next;
      }
    }
  } while (need_more_sorting);
}

export async function merge_choice(objlist: struct_obj | null, obj: struct_obj | null): Promise<struct_obj | null> {
  let shkp = null;
  let save_nocharge = 0;
  if (obj.otyp === SCR_SCARE_MONSTER) {
    return null;
  }
  save_nocharge = obj.no_charge | 0;
  if (objlist === G.invent && obj.where === OBJ_FLOOR && !!(shkp = await shop_keeper(inside_shop(obj.ox, obj.oy)))) {
    if (obj.no_charge) {
      obj.no_charge = 0;
    } else if (inhishop(shkp)) {
      return null;
    }
  }
  while (objlist) {
    if (await mergable(objlist, obj)) {
      break;
    }
    objlist = objlist.nobj;
  }
  obj.no_charge = (save_nocharge >>> 0) & 1;
  return objlist;
}

export async function merged(potmp: Ptr | null, pobj: Ptr | null): Promise<number> {
  let otmp = potmp.a[potmp.o];
  let obj = pobj.a[pobj.o];
  if (await mergable(otmp, obj)) {
    if (!obj.lamplit && !obj.globby) {
      otmp.age = Math.trunc((otmp.age * otmp.quan + obj.age * obj.quan) / (otmp.quan + obj.quan));
    }
    if (!otmp.globby) {
      otmp.quan += obj.quan;
    }
    if (otmp.oclass === COIN_CLASS) {
      otmp.owt = await weight(otmp) >>> 0, otmp.bknown = 0;
    } else if (!(otmp.otyp === 246 || otmp.otyp === 247 || otmp.otyp === 248 || otmp.otyp === 249)) {
      otmp.owt = otmp.owt + obj.owt >>> 0;
    }
    if (!(otmp.oextra && otmp.oextra.oname) && (obj.oextra && obj.oextra.oname)) {
      otmp = potmp.a[potmp.o] = await oname(otmp, obj.oextra.oname);
    }
    await obj_extract_self(obj);
    if (obj.lamplit) {
      await obj_merge_light_sources(obj, otmp);
    }
    if (obj.timed) {
      await obj_stop_timers(obj);
    }
    if (obj.owornmask && otmp.where === 3) {
      let wmask = otmp.owornmask | obj.owornmask;
      if (wmask & W_WEP) {
        wmask = W_WEP;
      } else if (wmask & W_SWAPWEP) {
        wmask = W_SWAPWEP;
      } else if (wmask & W_QUIVER) {
        wmask = W_QUIVER;
      } else {
        await impossible(S("merging strangely worn items (%lx)"), wmask);
        wmask = otmp.owornmask;
      }
      if ((otmp.owornmask & ~wmask) !== 0) {
        await setnotworn(otmp);
      }
      await setworn(otmp, wmask);
      await setnotworn(obj);
    }
    if (obj.globby) {
      await pudding_merge_message(otmp, obj);
      await obj_absorb(potmp, pobj);
      return 1;
    }
    await obfree(obj, otmp);
    return 1;
  }
  return 0;
}

export async function addinv_core1(obj: struct_obj | null): Promise<void> {
  if (obj.oclass === COIN_CLASS) {
    G.context.botl = 1;
  } else if (obj.otyp === AMULET_OF_YENDOR) {
    if (G.u.uhave.amulet) {
      await impossible(S("already have amulet?"));
    }
    G.u.uhave.amulet = 1;
    G.u.uachieve.amulet = 1;
  } else if (obj.otyp === CANDELABRUM_OF_INVOCATION) {
    if (G.u.uhave.menorah) {
      await impossible(S("already have candelabrum?"));
    }
    G.u.uhave.menorah = 1;
    G.u.uachieve.menorah = 1;
  } else if (obj.otyp === BELL_OF_OPENING) {
    if (G.u.uhave.bell) {
      await impossible(S("already have silver bell?"));
    }
    G.u.uhave.bell = 1;
    G.u.uachieve.bell = 1;
  } else if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
    if (G.u.uhave.book) {
      await impossible(S("already have the book?"));
    }
    G.u.uhave.book = 1;
    G.u.uachieve.book = 1;
  } else if (obj.oartifact) {
    if (is_quest_artifact(obj)) {
      if (G.u.uhave.questart) {
        await impossible(S("already have quest artifact?"));
      }
      G.u.uhave.questart = 1;
      await artitouch(obj);
    }
    await set_artifact_intrinsic(obj, 1, W_ART);
  }
  if (obj.otyp === G.iflags.mines_prize_type && obj.corpsenm === 1) {
    G.u.uachieve.mines_luckstone = 1;
    obj.corpsenm = NON_PM;
    obj.nomerge = 0;
  } else if (obj.otyp === G.iflags.soko_prize_type1 && obj.corpsenm === 2 || obj.otyp === G.iflags.soko_prize_type2 && obj.corpsenm === 3) {
    G.u.uachieve.finish_sokoban = 1;
    obj.corpsenm = NON_PM;
    obj.nomerge = 0;
  }
}

export function addinv_core2(obj: struct_obj | null): void {
  if (confers_luck(obj)) {
    set_moreluck();
  }
}

export async function addinv(obj$: struct_obj | null): Promise<struct_obj | null> {
  const obj = [null];
  obj[0] = obj$;
  let $g = 0;
  let otmp = [null];
  let prev = null;
  let saved_otyp = 0;
  let obj_was_thrown = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      saved_otyp = obj[0].otyp;
      if (obj[0].where !== OBJ_FREE) {
        await panic(S("addinv: obj not free"));
      }
      obj[0].no_charge = 0;
      if (!!obj[0].cobj) {
        picked_container(obj[0]);
      }
      obj_was_thrown = obj[0].was_thrown << 24 >> 24;
      obj[0].was_thrown = 0;
      await addinv_core1(obj[0]);
      if (G.uquiver && await merged(P(G, "uquiver"), P(obj, 0))) {
        obj[0] = G.uquiver;
        if (!obj[0]) {
          await panic(S("addinv: null obj after quiver merge otyp=%d"), saved_otyp);
        }
        { $g = 1; continue $L; }
      }
      for (prev = null, otmp[0] = G.invent; otmp[0]; prev = otmp[0], otmp[0] = otmp[0].nobj) {
        if (await merged(P(otmp, 0), P(obj, 0))) {
          obj[0] = otmp[0];
          if (!obj[0]) {
            await panic(S("addinv: null obj after merge otyp=%d"), saved_otyp);
          }
          { $g = 1; continue $L; }
        }
      }
      assigninvlet(obj[0]);
      if (G.flags.invlet_constant || !prev) {
        obj[0].nobj = G.invent;
        G.invent = obj[0];
        if (G.flags.invlet_constant) {
          reorder_invent();
        }
      } else {
        prev.nobj = obj[0];
        obj[0].nobj = null;
      }
      obj[0].where = OBJ_INVENT;
      if (G.flags.pickup_thrown && !G.uquiver && obj_was_thrown && obj[0].oartifact !== ART_MJOLLNIR && (throwing_weapon(obj[0]) || (obj[0].oclass === WEAPON_CLASS || obj[0].oclass === GEM_CLASS) && G.objects[obj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj[0].otyp].oc_subtyp <= -P_BOW)) {
        await setuqwep(obj[0]);
      }
    case 1: // added
      addinv_core2(obj[0]);
      await carry_obj_effects(obj[0]);
      update_inventory();
      return obj[0];
    }
    break;
  }
}

export async function carry_obj_effects(obj: struct_obj | null): Promise<void> {
  if (obj.otyp === FIGURINE) {
    if (obj.cursed | 0 && obj.corpsenm !== NON_PM && !dead_species(obj.corpsenm, TRUE)) {
      await attach_fig_transform_timeout(obj);
    }
  }
}

export async function hold_another_object(obj: struct_obj | null, drop_fmt: Ptr | null, drop_arg: Ptr | null, hold_msg: Ptr | null): Promise<struct_obj | null> {
  let $g = 0;
  let buf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        obj.dknown = 1;
      }
      if (obj.oartifact) {
        let crysknife = (obj.otyp === CRYSKNIFE ? 1 : 0) << 24 >> 24;
        let oerode = obj.oerodeproof | 0;
        let wasUpolyd = (G.u.umonnum !== G.u.umonster ? 1 : 0) << 24 >> 24;
        await place_object(obj, G.u.ux, G.u.uy);
        if (!await touch_artifact(obj, G.youmonst)) {
          await obj_extract_self(obj);
          await dropy(obj);
          return obj;
        } else if (wasUpolyd && !(G.u.umonnum !== G.u.umonster)) {
          if (drop_fmt) {
            await pline(drop_fmt, drop_arg);
          }
          await obj_extract_self(obj);
          await dropy(obj);
          return obj;
        }
        await obj_extract_self(obj);
        if (crysknife) {
          obj.otyp = CRYSKNIFE;
          obj.oerodeproof = (oerode >>> 0) & 1;
        }
      }
      if (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) {
        obj.nomerge = 1;
        obj = await addinv(obj);
        { $g = 1; continue $L; }
      } else {
        let oquan = obj.quan;
        let prev_encumbr = near_capacity();
        if (prev_encumbr < MOD_ENCUMBER) {
          prev_encumbr = MOD_ENCUMBER;
        }
        if (drop_arg) {
          drop_arg = strcpy(P(buf), drop_arg);
        }
        obj = await addinv(obj);
        if (inv_cnt(FALSE) > 52 || (obj.otyp !== LOADSTONE || !obj.cursed) && near_capacity() > prev_encumbr) {
          if (obj.quan > oquan) {
            obj = await splitobj(obj, oquan);
          }
          { $g = 1; continue $L; }
        } else {
          if (G.flags.autoquiver && !G.uquiver && !obj.owornmask && ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp) || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uswapwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uswapwep.otyp].oc_subtyp))) {
            await setuqwep(obj);
          }
          if (hold_msg || drop_fmt) {
            await prinv(hold_msg, obj, oquan);
          }
        }
      }
      return obj;
    case 1: // drop_it
      if (drop_fmt) {
        await pline(drop_fmt, drop_arg);
      }
      obj.nomerge = 0;
      if (can_reach_floor(TRUE)) {
        await dropx(obj);
      } else {
        await freeinv(obj);
        await hitfloor(obj, FALSE);
      }
      return null;
    }
    break;
  }
}

export async function useupall(obj: struct_obj | null): Promise<void> {
  await setnotworn(obj);
  await freeinv(obj);
  await obfree(obj, null);
}

export async function useup(obj: struct_obj | null): Promise<void> {
  if (obj.quan > 1) {
    obj.in_use = (FALSE) & 1;
    --obj.quan;
    obj.owt = await weight(obj) >>> 0;
    update_inventory();
  } else {
    await useupall(obj);
  }
}

export async function consume_obj_charge(obj: struct_obj | null, maybe_unpaid: number): Promise<void> {
  if (maybe_unpaid) {
    await check_unpaid(obj);
  }
  obj.spe = obj.spe - 1 << 24 >> 24;
  if (obj.known) {
    update_inventory();
  }
}

export async function freeinv_core(obj: struct_obj | null): Promise<void> {
  if (obj.oclass === COIN_CLASS) {
    G.context.botl = 1;
    return;
  } else if (obj.otyp === AMULET_OF_YENDOR) {
    if (!G.u.uhave.amulet) {
      await impossible(S("don't have amulet?"));
    }
    G.u.uhave.amulet = 0;
  } else if (obj.otyp === CANDELABRUM_OF_INVOCATION) {
    if (!G.u.uhave.menorah) {
      await impossible(S("don't have candelabrum?"));
    }
    G.u.uhave.menorah = 0;
  } else if (obj.otyp === BELL_OF_OPENING) {
    if (!G.u.uhave.bell) {
      await impossible(S("don't have silver bell?"));
    }
    G.u.uhave.bell = 0;
  } else if (obj.otyp === SPE_BOOK_OF_THE_DEAD) {
    if (!G.u.uhave.book) {
      await impossible(S("don't have the book?"));
    }
    G.u.uhave.book = 0;
  } else if (obj.oartifact) {
    if (is_quest_artifact(obj)) {
      if (!G.u.uhave.questart) {
        await impossible(S("don't have quest artifact?"));
      }
      G.u.uhave.questart = 0;
    }
    await set_artifact_intrinsic(obj, 0, W_ART);
  }
  if (obj.otyp === LOADSTONE) {
    await curse(obj);
  } else if (confers_luck(obj)) {
    set_moreluck();
    G.context.botl = 1;
  } else if (obj.otyp === FIGURINE && obj.timed) {
    await stop_timer(FIG_TRANSFORM, obj_to_any(obj));
  }
}

export async function freeinv(obj: struct_obj | null): Promise<void> {
  await extract_nobj(obj, P(G, "invent"));
  await freeinv_core(obj);
  update_inventory();
}

export async function delallobj(x: number, y: number): Promise<void> {
  let otmp = null;
  let otmp2 = null;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp2) {
    if (otmp === G.uball) {
      await unpunish();
    }
    otmp2 = otmp.v.v_nexthere;
    if (otmp === G.uchain) {
      continue;
    }
    await delobj(otmp);
  }
}

export async function delobj(obj: struct_obj | null): Promise<void> {
  let update_map = 0;
  if (obj.otyp === AMULET_OF_YENDOR || obj.otyp === CANDELABRUM_OF_INVOCATION || obj.otyp === BELL_OF_OPENING || obj.otyp === SPE_BOOK_OF_THE_DEAD) {
    return;
  }
  update_map = (obj.where === OBJ_FLOOR ? 1 : 0) << 24 >> 24;
  await obj_extract_self(obj);
  if (update_map) {
    await newsym(obj.ox, obj.oy);
  }
  await obfree(obj, null);
}

export function sobj_at(otyp: number, x: number, y: number): struct_obj | null {
  let otmp = null;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.otyp === otyp) {
      break;
    }
  }
  return otmp;
}

export function nxtobj(obj: struct_obj | null, type: number, by_nexthere: number): struct_obj | null {
  let otmp = null;
  otmp = obj;
  do {
    otmp = !by_nexthere ? otmp.nobj : otmp.v.v_nexthere;
    if (!otmp) {
      break;
    }
  } while (otmp.otyp !== type);
  return otmp;
}

export function carrying(type: number): struct_obj | null {
  let otmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === type) {
      return otmp;
    }
  }
  return null;
}

export async function currency(amount: number): Promise<Ptr | null> {
  let res = null;
  res = G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? currencies[rn2(Math.trunc(168 / 8) | 0)] : S("zorkmid");
  if (amount !== 1) {
    res = await makeplural(res);
  }
  return res;
}

export function have_lizard(): number {
  let otmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === CORPSE && otmp.corpsenm === PM_LIZARD) {
      return TRUE;
    }
  }
  return FALSE;
}

export function u_have_novel(): struct_obj | null {
  let otmp = null;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === SPE_NOVEL) {
      return otmp;
    }
  }
  return null;
}

export function o_on(id: number, objchn: struct_obj | null): struct_obj | null {
  let temp = null;
  while (objchn) {
    if (objchn.o_id === id) {
      return objchn;
    }
    if (!!objchn.cobj && (temp = o_on(id, objchn.cobj))) {
      return temp;
    }
    objchn = objchn.nobj;
  }
  return null;
}

export function obj_here(obj: struct_obj | null, x: number, y: number): number {
  let otmp = null;
  for (otmp = G.level.objects[x][y]; otmp; otmp = otmp.v.v_nexthere) {
    if (obj === otmp) {
      return TRUE;
    }
  }
  return FALSE;
}

export function g_at(x: number, y: number): struct_obj | null {
  let obj = G.level.objects[x][y];
  while (obj) {
    if (obj.oclass === COIN_CLASS) {
      return obj;
    }
    obj = obj.v.v_nexthere;
  }
  return null;
}

function compactify(buf: Ptr | null): void {
  let $t1: any, $t2: any;
  let i1 = 1;
  let i2 = 1;
  let ilet = 0;
  let ilet1 = 0;
  let ilet2 = 0;
  ilet2 = buf.a[buf.o];
  ilet1 = buf.a[buf.o + 1];
  ($t1 = buf.a[buf.o + ++i1], buf.a[buf.o + ++i2] = $t1);
  ilet = buf.a[buf.o + i1];
  while (ilet) {
    if (ilet === ilet1 + 1) {
      if (ilet1 === ilet2 + 1) {
        buf.a[buf.o + (i2 - 1)] = ilet1 = 45;
      } else if (ilet2 === 45) {
        buf.a[buf.o + (i2 - 1)] = ilet1 = ilet1 + 1 << 24 >> 24;
        buf.a[buf.o + i2] = buf.a[buf.o + ++i1];
        ilet = buf.a[buf.o + i1];
        continue;
      }
    } else if (ilet === NOINVSYM) {
      if (i2 >= 2 && buf.a[buf.o + (i2 - 2)] === NOINVSYM && buf.a[buf.o + (i2 - 1)] === NOINVSYM) {
        buf.a[buf.o + (i2 - 1)] = 45;
      } else if (i2 >= 3 && buf.a[buf.o + (i2 - 3)] === NOINVSYM && buf.a[buf.o + (i2 - 2)] === 45 && buf.a[buf.o + (i2 - 1)] === NOINVSYM) {
        --i2;
      }
    }
    ilet2 = ilet1;
    ilet1 = ilet;
    ($t2 = buf.a[buf.o + ++i1], buf.a[buf.o + ++i2] = $t2);
    ilet = buf.a[buf.o + i1];
  }
}

export function splittable(obj: struct_obj | null): number {
  return (!(obj.otyp === LOADSTONE && obj.cursed | 0 || obj === G.uwep && welded(G.uwep)) ? 1 : 0) << 24 >> 24;
}

function taking_off(action: Ptr | null): number {
  return (!strcmp(action, S("take off")) || !strcmp(action, S("remove")) ? 1 : 0) << 24 >> 24;
}

function putting_on(action: Ptr | null): number {
  return (!strcmp(action, S("wear")) || !strcmp(action, S("put on")) ? 1 : 0) << 24 >> 24;
}

export async function getobj(let_: Ptr | null, word: Ptr | null): Promise<struct_obj | null> {
  let $t1: any, $t2: any, $t3: any;
  let $g = 0;
  let otmp = null;
  let ilet = 0;
  let buf = new Int8Array(256);
  let qbuf = new Int8Array(128);
  let lets = new Int8Array(256);
  let altlets = new Int8Array(256);
  let ap = null;
  let foo = 0;
  let bp = null;
  let allowcnt = 0;
  let usegold = 0;
  let allowall = 0;
  let allownone = 0;
  let useboulder = 0;
  let foox = 0;
  let cnt = 0;
  let cntgiven = 0;
  let msggiven = 0;
  let oneloop = 0;
  let dummymask = new Float64Array(1);
  let sortedinvent = [null];
  let srtinv = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ilet = 0;
      buf = new Int8Array(256);
      qbuf = new Int8Array(128);
      lets = new Int8Array(256);
      altlets = new Int8Array(256);
      foo = 0;
      bp = P(buf);
      allowcnt = 0;
      usegold = FALSE;
      allowall = FALSE;
      allownone = FALSE;
      useboulder = FALSE;
      foox = 0;
      cntgiven = FALSE;
      msggiven = FALSE;
      oneloop = FALSE;
      if (let_.a[let_.o] === ALLOW_COUNT) {
        let_ = let_.add(1), allowcnt = 1;
      }
      if (let_.a[let_.o] === COIN_CLASS) {
        let_ = let_.add(1), usegold = TRUE;
      }
      if (usegold && !strcmp(word, S("eat")) && (!((G.youmonst.data.mflags1 & 2147483648) >>> 0 !== 0) || G.youmonst.data === $sat(G.mons, PM_RUST_MONSTER))) {
        usegold = FALSE;
      }
      if (let_.a[let_.o] === ALL_CLASSES) {
        let_ = let_.add(1), allowall = TRUE;
      }
      if (let_.a[let_.o] === ALLOW_NONE) {
        let_ = let_.add(1), allownone = TRUE;
      }
      if (allowall && !strcmp(word, S("read"))) {
        allowall = FALSE;
      }
      if (let_.a[let_.o] === WEAPON_CLASS && !strcmp(word, S("throw")) && (G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0) {
        useboulder = TRUE;
      }
      if (allownone) {
        $wr(($t1 = bp, bp = $t1.add(1), $t1), 0, HANDS_SYM), $wr(($t2 = bp, bp = $t2.add(1), $t2), 0, 32);
      }
      ap = P(altlets);
      if (!G.flags.invlet_constant) {
        reassign();
      }
      sortedinvent[0] = await sortloot(P(G, "invent"), SORTLOOT_INVLET, FALSE, null);
      for (srtinv = sortedinvent[0]; !!(otmp = srtinv.obj); srtinv = $sadd(srtinv, 1)) {
        if ($peq(bp.add(foo), P(buf, 256 - 1)) || $peq(ap, P(altlets, 256 - 1))) {
          await impossible(S("getobj: inventory overflow"));
          break;
        }
        if (!let_.a[let_.o] || strchr(let_, otmp.oclass) || usegold && otmp.invlet === GOLD_SYM || useboulder && otmp.otyp === BOULDER) {
          let otyp = otmp.otyp;
          bp.a[bp.o + foo++] = otmp.invlet;
          if (taking_off(word) && !(otmp.owornmask & (W_ARMOR | W_ACCESSORY)) || putting_on(word) && otmp.owornmask & (W_ARMOR | W_ACCESSORY) || !strcmp(word, S("ready")) && ((otmp === G.uwep || otmp === G.uswapwep && G.u.twoweap) && otmp.quan === 1) || (!strcmp(word, S("dip")) || !strcmp(word, S("grease"))) && await inaccessible_equipment(otmp, null, FALSE)) {
            --foo;
            foox = foox + 1 << 24 >> 24;
          } else if (putting_on(word) && (otmp.oclass === FOOD_CLASS && otmp.otyp !== MEAT_RING || otmp.oclass === TOOL_CLASS && otyp !== BLINDFOLD && otyp !== TOWEL && otyp !== LENSES) || !strcmp(word, S("wield")) && (otmp.oclass === TOOL_CLASS && !(otmp.oclass === TOOL_CLASS && G.objects[otmp.otyp].oc_subtyp !== P_NONE)) || !strcmp(word, S("eat")) && !is_edible(otmp) || !strcmp(word, S("sacrifice")) && (otyp !== CORPSE && otyp !== AMULET_OF_YENDOR && otyp !== FAKE_AMULET_OF_YENDOR) || !strcmp(word, S("write with")) && (otmp.oclass === TOOL_CLASS && otyp !== MAGIC_MARKER && otyp !== TOWEL) || !strcmp(word, S("tin")) && (otyp !== CORPSE || !tinnable(otmp)) || !strcmp(word, S("rub")) && (otmp.oclass === TOOL_CLASS && otyp !== OIL_LAMP && otyp !== MAGIC_LAMP && otyp !== BRASS_LANTERN || otmp.oclass === GEM_CLASS && !(otmp.otyp === 443 || otmp.otyp === 444 || otmp.otyp === 446 || otmp.otyp === 445)) || !strcmp(word, S("use or apply")) && (otmp.oclass === WEAPON_CLASS && !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_PICK_AXE) && !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp === P_AXE) && !((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && (G.objects[otmp.otyp].oc_subtyp === P_POLEARMS || G.objects[otmp.otyp].oc_subtyp === P_LANCE)) && otyp !== BULLWHIP || otmp.oclass === POTION_CLASS && (otyp !== POT_OIL || !otmp.dknown || !G.objects[POT_OIL].oc_name_known) || otmp.oclass === FOOD_CLASS && otyp !== CREAM_PIE && otyp !== EUCALYPTUS_LEAF || otmp.oclass === GEM_CLASS && !(otmp.otyp === 443 || otmp.otyp === 444 || otmp.otyp === 446 || otmp.otyp === 445)) || !strcmp(word, S("invoke")) && !otmp.oartifact && !G.objects[otyp].oc_unique && (otyp !== FAKE_AMULET_OF_YENDOR || otmp.known | 0) && otyp !== CRYSTAL_BALL && otyp !== MIRROR && otyp !== MAGIC_LAMP && (otyp !== OIL_LAMP || otmp.dknown | 0 && G.objects[OIL_LAMP].oc_name_known | 0) || !strcmp(word, S("untrap with")) && (otmp.oclass === TOOL_CLASS && otyp !== CAN_OF_GREASE || otmp.oclass === POTION_CLASS && (otyp !== POT_OIL || !otmp.dknown || !G.objects[POT_OIL].oc_name_known)) || !strcmp(word, S("tip")) && !(otmp.otyp >= 189 && otmp.otyp <= 195) && (otmp.otyp !== HORN_OF_PLENTY || !otmp.dknown || !G.objects[HORN_OF_PLENTY].oc_name_known) || !strcmp(word, S("charge")) && !is_chargeable(otmp) || !strcmp(word, S("open")) && otyp !== TIN || !strcmp(word, S("call")) && !objtyp_is_callable(otyp) || !strcmp(word, S("adjust")) && otmp.oclass === COIN_CLASS && !usegold) {
            --foo;
          } else if (putting_on(word) && let_.a[let_.o] === ARMOR_CLASS && !await canwearobj(otmp, P(dummymask, 0), FALSE) || (putting_on(word) || taking_off(word)) && (let_.a[let_.o] === ARMOR_CLASS ? 1 : 0) ^ (otmp.oclass === ARMOR_CLASS ? 1 : 0) || !strncmp(word, S("rub on the stone"), 16) && let_.a[let_.o] === GEM_CLASS && otmp.dknown | 0 && G.objects[otyp].oc_name_known | 0 || !strcmp(word, S("sacrifice")) && (!((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) ? 1 : 0) ^ (otmp.oclass !== AMULET_CLASS ? 1 : 0) || !strcmp(word, S("stash")) && !ck_bag(otmp) || taking_off(word) && await inaccessible_equipment(otmp, null, (otmp.oclass === RING_CLASS ? 1 : 0) << 24 >> 24) || !strcmp(word, S("write on")) && (!(otyp === SCR_BLANK_PAPER || otyp === SPE_BLANK_PAPER) || !otmp.dknown || !G.objects[otyp].oc_name_known)) {
            --foo;
            allowall = TRUE;
            $wr(($t3 = ap, ap = $t3.add(1), $t3), 0, otmp.invlet);
          }
        } else {
          if (!strcmp(word, S("read")) && (otmp.otyp === 264 || otmp.otyp === 116 || otmp.otyp === 123 || otmp.otyp === 198 || otmp.otyp === 215 || otmp.otyp === 217 || otmp.oclass === COIN_CLASS || otmp.oartifact === 32 || otmp.otyp === 263)) {
            allowall = usegold = TRUE;
          }
        }
      }
      unsortloot(P(sortedinvent, 0));
      bp.a[bp.o + foo] = 0;
      if (foo === 0 && bp.o > P(buf).o && bp.a[bp.o + -1] === 32) {
        $wr((bp = bp.add(-1)), 0, 0);
      }
      strcpy(P(lets), bp);
      if (foo > 5) {
        compactify(bp);
      }
      ap.a[ap.o] = 0;
      if (!foo && !allowall && !allownone) {
        await You(S("don't have anything %sto %s."), foox ? S("else ") : S(""), word);
        return null;
      } else if (!strcmp(word, S("write on"))) {
        allowall = FALSE;
      }
    case 2:
      cnt = 0;
      cntgiven = FALSE;
      sprintf(P(qbuf), S("What do you want to %s?"), word);
      if (G.in_doagain) {
        ilet = await readchar();
      } else if (G.iflags.force_invmenu) {
        if (!oneloop) {
          ilet = (let_.a[let_.o] ? 63 : 42) << 24 >> 24;
        }
        if (!msggiven) {
          await G.windowprocs.win_putmsghistory(P(qbuf), FALSE);
        }
        msggiven = TRUE;
        oneloop = TRUE;
      } else {
        if (!buf[0]) {
          strcat(P(qbuf), S(" [*]"));
        } else {
          sprintf(eos(P(qbuf)), S(" [%s or ?*]"), P(buf));
        }
        ilet = await yn_function(P(qbuf), null, 0);
      }
      if (digit(ilet)) {
        const tmpcnt = new Float64Array(1);
        tmpcnt[0] = 0;
        if (!allowcnt) {
          await pline(S("No count allowed with this command."));
          { $g = 3; continue $L; };
        }
        ilet = await get_count(null, ilet, LARGEST_INT, P(tmpcnt, 0), TRUE);
        if (tmpcnt[0]) {
          cnt = tmpcnt[0];
          cntgiven = TRUE;
        }
      }
      if (strchr(P(G.quitchars), ilet)) {
        if (G.flags.verbose) {
          await pline(S("%s"), G.c_common_strings.c_Never_mind);
        }
        return null;
      }
      if (ilet === HANDS_SYM) {
        if (!allownone) {
          let suf = null;
          strcpy(P(buf), word);
          if (!!(bp = strstr(P(buf), S(" on the ")))) {
            bp.a[bp.o] = 0;
            suf = bp.add(1);
          }
          if (!!(bp = strstr(P(buf), S(" or ")))) {
            bp.a[bp.o] = 0;
            bp = rn2(2) ? P(buf) : bp.add(4);
          } else {
            bp = P(buf);
          }
          await You(S("mime %s something%s%s."), ing_suffix(bp), suf ? S(" ") : S(""), suf ? suf : S(""));
        }
        return allownone ? G.zeroobj : null;
      }
    case 1: // redo_menu
      if (ilet === 63 || ilet === 42) {
        let allowed_choices = ilet === 63 ? P(lets) : null;
        const ctmp = new Float64Array(1);
        ctmp[0] = 0;
        let menuquery = new Int8Array(128);
        menuquery[0] = qbuf[0] = 0;
        if (G.iflags.force_invmenu) {
          sprintf(P(menuquery), S("What do you want to %s?"), word);
        }
        if (!strcmp(word, S("grease"))) {
          sprintf(P(qbuf), S("your %s"), await fingers_or_gloves(FALSE));
        } else if (!strcmp(word, S("write with"))) {
          sprintf(P(qbuf), S("your %s"), body_part(FINGERTIP));
        } else if (!strcmp(word, S("wield"))) {
          sprintf(P(qbuf), S("your %s %s%s"), G.uarmg ? S("gloved") : S("bare"), await makeplural(body_part(HAND)), !G.uwep ? S(" (wielded)") : S(""));
        } else if (!strcmp(word, S("ready"))) {
          sprintf(P(qbuf), S("empty quiver%s"), !G.uquiver ? S(" (nothing readied)") : S(""));
        }
        if (ilet === 63 && !$rd(P(lets)) && $rd(P(altlets))) {
          allowed_choices = P(altlets);
        }
        ilet = await display_pickinv(allowed_choices, $rd(P(qbuf)) ? P(qbuf) : null, P(menuquery), TRUE, allowcnt ? P(ctmp, 0) : null);
        if (!ilet) {
          { $g = 3; continue $L; };
        }
        if (ilet === HANDS_SYM) {
          return G.zeroobj;
        }
        if (ilet === 27) {
          if (G.flags.verbose) {
            await pline(S("%s"), G.c_common_strings.c_Never_mind);
          }
          return null;
        }
        if (ilet === 42) {
          { $g = 1; continue $L; }
        }
        if (allowcnt && ctmp[0] >= 0) {
          cnt = ctmp[0];
          cntgiven = TRUE;
        }
      }
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if (otmp.invlet === ilet) {
          break;
        }
      }
      if (ilet === G.def_oc_syms[COIN_CLASS].sym || otmp && otmp.oclass === COIN_CLASS) {
        if (!usegold) {
          await You(S("cannot %s gold."), word);
          return null;
        }
        if (cntgiven && cnt <= 0) {
          if (cnt < 0) {
            await pline_The(S("LRS would be very interested to know you have that much."));
          }
          return null;
        }
      }
      if (cntgiven && !strcmp(word, S("throw"))) {
        if (cnt === 0) {
          return null;
        }
        if (cnt > 1 && (ilet !== G.def_oc_syms[COIN_CLASS].sym && !(otmp && otmp.oclass === COIN_CLASS))) {
          await You(S("can only throw one item at a time."));
          { $g = 3; continue $L; };
        }
      }
      G.context.botl = 1;
      savech(ilet);
      if (!otmp) {
        await You(S("don't have that object."));
        if (G.in_doagain) {
          return null;
        }
        { $g = 3; continue $L; };
      } else if (cnt < 0 || otmp.quan < cnt) {
        await You(S("don't have that many!  You have only %ld."), otmp.quan);
        if (G.in_doagain) {
          return null;
        }
        { $g = 3; continue $L; };
      }
      { $g = 4; continue $L; };
    case 3:
      { $g = 2; continue $L; }
    case 4:
      if (!allowall && let_ && !strchr(let_, otmp.oclass) && !(usegold && otmp.oclass === COIN_CLASS)) {
        await silly_thing(word, otmp);
        return null;
      }
      if (cntgiven) {
        if (cnt === 0) {
          return null;
        }
        if (cnt !== otmp.quan) {
          if (splittable(otmp)) {
            otmp = await splitobj(otmp, cnt);
          } else if (otmp.otyp === LOADSTONE && otmp.cursed | 0) {
            otmp.corpsenm = cnt | 0;
          }
        }
      }
      return otmp;
    }
    break;
  }
}

export async function silly_thing(word: Ptr | null, otmp: struct_obj | null): Promise<void> {
  ;
  await pline(G.c_common_strings.c_silly_thing_to, word);
}

function ckvalidcat(otmp: struct_obj | null): number {
  return allow_category(otmp);
}

function ckunpaid(otmp: struct_obj | null): number {
  return otmp.unpaid | 0 || !!otmp.cobj && count_unpaid(otmp.cobj) ? 1 : 0;
}

export function wearing_armor(): number {
  return (G.uarm || G.uarmc || G.uarmf || G.uarmg || G.uarmh || G.uarms || G.uarmu ? 1 : 0) << 24 >> 24;
}

export function is_worn(otmp: struct_obj | null): number {
  return (otmp.owornmask & (W_ARMOR | W_ACCESSORY | W_SADDLE | W_WEAPONS) ? TRUE : FALSE) << 24 >> 24;
}

async function safeq_xprname(obj: struct_obj | null): Promise<Ptr | null> {
  return await xprname(obj, null, safeq_xprn_ctx.let, safeq_xprn_ctx.dot, 0, 0);
}

async function safeq_shortxprname(obj: struct_obj | null): Promise<Ptr | null> {
  return await xprname(obj, await ansimpleoname(obj), safeq_xprn_ctx.let, safeq_xprn_ctx.dot, 0, 0);
}

export async function ggetobj(word: Ptr | null, fn: Function | null, mx: number, combo: number, resultflags: Ptr | null): Promise<number> {
  let $t1: any;
  let ckfn = null;
  let ofilter = null;
  let takeoff = 0;
  let ident = 0;
  let allflag = 0;
  let m_seen = 0;
  const itemcount = new Int32Array(1);
  let oletct = 0;
  let iletct = 0;
  let unpaid = 0;
  let oc_of_sym = 0;
  let sym = 0;
  let ip = null;
  let olets = new Int8Array(23);
  let ilets = new Int8Array(28);
  let extra_removeables = new Int8Array(4);
  let buf = new Int8Array(256);
  let qbuf = new Int8Array(128);
  if (!G.invent) {
    await You(S("have nothing to %s."), word);
    if (resultflags) {
      resultflags.a[resultflags.o] = ALL_FINISHED;
    }
    return 0;
  }
  if (resultflags) {
    resultflags.a[resultflags.o] = 0;
  }
  takeoff = ident = allflag = m_seen = FALSE;
  add_valid_menu_class(0);
  if (taking_off(word)) {
    takeoff = TRUE;
    ofilter = is_worn;
  } else if (!strcmp(word, S("identify"))) {
    ident = TRUE;
    ofilter = not_fully_identified;
  }
  iletct = await collect_obj_classes(P(ilets), G.invent, FALSE, ofilter, P(itemcount, 0));
  unpaid = count_unpaid(G.invent);
  if (ident && !iletct) {
    return -1;
  } else if (G.invent) {
    ilets[iletct++] = 32;
    if (unpaid) {
      ilets[iletct++] = 117;
    }
    if (await count_buc(G.invent, BUC_BLESSED, ofilter)) {
      ilets[iletct++] = 66;
    }
    if (await count_buc(G.invent, BUC_UNCURSED, ofilter)) {
      ilets[iletct++] = 85;
    }
    if (await count_buc(G.invent, BUC_CURSED, ofilter)) {
      ilets[iletct++] = 67;
    }
    if (await count_buc(G.invent, BUC_UNKNOWN, ofilter)) {
      ilets[iletct++] = 88;
    }
    ilets[iletct++] = 97;
  }
  ilets[iletct++] = 105;
  if (!combo) {
    ilets[iletct++] = 109;
  }
  ilets[iletct] = 0;
  for (; ; ) {
    sprintf(P(qbuf), S("What kinds of thing do you want to %s? [%s]"), word, P(ilets));
    await G.windowprocs.win_getlin(P(qbuf), P(buf));
    if (buf[0] === 27) {
      return 0;
    }
    if (strchr(P(buf), 105)) {
      let ailets = new Int8Array(60);
      let otmp = null;
      ailets[0] = 0;
      if (ofilter) {
        for (otmp = G.invent; otmp; otmp = otmp.nobj) {
          if (await ofilter(otmp) && !strchr(P(ailets), otmp.invlet)) {
            strkitten(P(ailets), otmp.invlet);
          }
        }
      }
      if (await display_inventory(P(ailets), TRUE) === 27) {
        return 0;
      }
    } else {
      break;
    }
  }
  extra_removeables[0] = 0;
  if (takeoff) {
    if (G.uwep) {
      strkitten(P(extra_removeables), G.uwep.oclass);
    }
    if (G.uswapwep) {
      strkitten(P(extra_removeables), G.uswapwep.oclass);
    }
    if (G.uquiver) {
      strkitten(P(extra_removeables), G.uquiver.oclass);
    }
  }
  ip = P(buf);
  olets[oletct = 0] = 0;
  while ((sym = $rd(($t1 = ip, ip = $t1.add(1), $t1))) !== 0) {
    if (sym === 32) {
      continue;
    }
    oc_of_sym = def_char_to_objclass(sym);
    if (takeoff && oc_of_sym !== MAXOCLASSES) {
      if (strchr(P(extra_removeables), oc_of_sym)) {
        ;
      } else if (!strchr(P(removeables), oc_of_sym)) {
        await pline(S("Not applicable."));
        return 0;
      } else if (oc_of_sym === ARMOR_CLASS && !wearing_armor()) {
        await noarmor(FALSE);
        return 0;
      } else if (oc_of_sym === WEAPON_CLASS && !G.uwep && !G.uswapwep && !G.uquiver) {
        await You(S("are not wielding anything."));
        return 0;
      } else if (oc_of_sym === RING_CLASS && !G.uright && !G.uleft) {
        await You(S("are not wearing rings."));
        return 0;
      } else if (oc_of_sym === AMULET_CLASS && !G.uamul) {
        await You(S("are not wearing an amulet."));
        return 0;
      } else if (oc_of_sym === TOOL_CLASS && !G.ublindf) {
        await You(S("are not wearing a blindfold."));
        return 0;
      }
    }
    if (oc_of_sym === COIN_CLASS && !combo) {
      G.context.botl = 1;
    } else if (sym === 97) {
      allflag = TRUE;
    } else if (sym === 65) {
      ;
    } else if (sym === 117) {
      add_valid_menu_class(117);
      ckfn = ckunpaid;
    } else if (strchr(S("BUCX"), sym)) {
      add_valid_menu_class(sym);
      ckfn = ckvalidcat;
    } else if (sym === 109) {
      m_seen = TRUE;
    } else if (oc_of_sym === MAXOCLASSES) {
      await You(S("don't have any %c's."), sym);
    } else if (oc_of_sym !== VENOM_CLASS) {
      if (!strchr(P(olets), oc_of_sym)) {
        add_valid_menu_class(oc_of_sym);
        olets[oletct++] = oc_of_sym << 24 >> 24;
        olets[oletct] = 0;
      }
    }
  }
  if (m_seen) {
    return allflag || !oletct && ckfn !== ckunpaid && ckfn !== ckvalidcat ? -2 : -3;
  } else if (G.flags.menu_style !== MENU_TRADITIONAL && combo && !allflag) {
    return 0;
  } else {
    let cnt = await askchain(P(G, "invent"), P(olets), allflag, fn, ckfn, mx, word);
    if (combo && allflag && resultflags) {
      resultflags.a[resultflags.o] = (resultflags.a[resultflags.o] | ALL_FINISHED) >>> 0;
    }
    return cnt;
  }
}

export async function askchain(objchn: Ptr | null, olets: Ptr | null, allflag: number, fn: Function | null, ckfn: Function | null, mx: number, word: Ptr | null): Promise<number> {
  let $g = 0;
  let otmp = [null];
  let otmpo = [null];
  let sym = 0;
  let ilet = 0;
  let cnt = 0;
  let dud = 0;
  let tmp = 0;
  let takeoff = 0;
  let nodot = 0;
  let ident = 0;
  let take_out = 0;
  let put_in = 0;
  let first = 0;
  let ininv = 0;
  let bycat = 0;
  let qbuf = new Int8Array(128);
  let qpfx = new Int8Array(128);
  let sortedchn = [null];
  $L: for (;;) {
    switch ($g) {
    case 0:
      cnt = 0;
      dud = 0;
      qbuf = new Int8Array(128);
      qpfx = new Int8Array(128);
      sortedchn[0] = null;
      takeoff = taking_off(word);
      ident = (!strcmp(word, S("identify")) ? 1 : 0) << 24 >> 24;
      take_out = (!strcmp(word, S("take out")) ? 1 : 0) << 24 >> 24;
      put_in = (!strcmp(word, S("put in")) ? 1 : 0) << 24 >> 24;
      nodot = (!strcmp(word, S("nodot")) || !strcmp(word, S("drop")) || ident || takeoff || take_out || put_in ? 1 : 0) << 24 >> 24;
      ininv = (objchn.a[objchn.o] === G.invent ? 1 : 0) << 24 >> 24;
      bycat = (menu_class_present(117) || menu_class_present(66) || menu_class_present(85) || menu_class_present(67) || menu_class_present(88) ? 1 : 0) << 24 >> 24;
      sortedchn[0] = await sortloot(objchn, SORTLOOT_INVLET, FALSE, null);
      first = TRUE;
    case 1: // nextclass
      ilet = 97 - 1;
      if (objchn.a[objchn.o] && objchn.a[objchn.o].oclass === COIN_CLASS) {
        ilet = ilet - 1 << 24 >> 24;
      }
      bypass_objlist(objchn.a[objchn.o], FALSE);
      while (!!(otmp[0] = nxt_unbypassed_loot(sortedchn[0], objchn.a[objchn.o]))) {
        if (ilet === 122) {
          ilet = 65;
        } else if (ilet === 90) {
          ilet = NOINVSYM;
        } else {
          ilet = ilet + 1 << 24 >> 24;
        }
        if (olets && olets.a[olets.o] && otmp[0].oclass !== olets.a[olets.o]) {
          continue;
        }
        if (takeoff && !is_worn(otmp[0])) {
          continue;
        }
        if (ident && !not_fully_identified(otmp[0])) {
          continue;
        }
        if (ckfn && !await ckfn(otmp[0])) {
          continue;
        }
        if (bycat && !ckvalidcat(otmp[0])) {
          continue;
        }
        if (!allflag) {
          safeq_xprn_ctx.let = ilet;
          safeq_xprn_ctx.dot = (!nodot ? 1 : 0) << 24 >> 24;
          $wr(P(qpfx), 0, 0);
          if (first) {
            if (take_out || put_in) {
              sprintf(P(qpfx), S("%s: "), word), $wr(P(qpfx), 0, highc($rd(P(qpfx))));
            }
            first = FALSE;
          }
          await safe_qbuf(P(qbuf), P(qpfx), S("?"), otmp[0], ininv ? safeq_xprname : doname, ininv ? safeq_shortxprname : ansimpleoname, S("item"));
          sym = (takeoff || ident || otmp[0].quan < 2 ? await yn_function(P(qbuf), P(G.ynaqchars), 110) : await yn_function(P(qbuf), P(G.ynNaqchars), 110)) << 24 >> 24;
        } else {
          sym = 121;
        }
        otmpo[0] = otmp[0];
        if (sym === 35) {
          if (!G.yn_number) {
            sym = 110;
          } else {
            sym = 121;
            if (G.yn_number < otmp[0].quan && splittable(otmp[0])) {
              otmp[0] = await splitobj(otmp[0], G.yn_number);
            }
          }
        }
        switch (sym) {
        case 97:
          allflag = 1;
        case 121:
          tmp = await fn(otmp[0]);
          if (tmp < 0) {
            if (container_gone(fn)) {
              otmp[0] = null;
            } else if (otmp[0] && otmp[0] !== otmpo[0]) {
              await merged(P(otmpo, 0), P(otmp, 0));
            }
            { $g = 2; continue $L; }
          }
          cnt += tmp;
          if (--mx === 0) {
            { $g = 2; continue $L; }
          }
        case 110:
          if (nodot) {
            ++dud;
          }
        default:
          break;
        case 113:
          if (ident) {
            cnt = -1;
          }
          { $g = 2; continue $L; }
        }
      }
      if (olets && olets.a[olets.o] && $rd((olets = olets.add(1)))) {
        { $g = 1; continue $L; }
      }
      if (!takeoff && (dud || cnt)) {
        await pline(S("That was all."));
      } else if (!dud && !cnt) {
        await pline(S("No applicable objects."));
      }
    case 2: // ret
      unsortloot(P(sortedchn, 0));
      bypass_objlist(objchn.a[objchn.o], FALSE);
      return cnt;
    }
    break;
  }
}

export async function fully_identify_obj(otmp: struct_obj | null): Promise<void> {
  await discover_object(otmp.otyp, 1, 1);
  if (otmp.oartifact) {
    await discover_artifact(otmp.oartifact);
  }
  otmp.known = (otmp.dknown = (otmp.bknown = (otmp.rknown = 1) & 1) & 1) & 1;
  if (otmp.otyp >= 189 && otmp.otyp <= 195 || otmp.otyp === STATUE) {
    otmp.cknown = (otmp.lknown = 1) & 1;
  }
  if (otmp.otyp === EGG && otmp.corpsenm !== NON_PM) {
    learn_egg_type(otmp.corpsenm);
  }
}

export async function identify(otmp: struct_obj | null): Promise<number> {
  await fully_identify_obj(otmp);
  await prinv(null, otmp, 0);
  return 1;
}

async function menu_identify(id_limit: number): Promise<void> {
  const pick_list = [null];
  let n = 0;
  let i = 0;
  let first = 1;
  let tryct = 5;
  let buf = new Int8Array(256);
  while (id_limit) {
    sprintf(P(buf), S("What would you like to identify %s?"), first ? S("first") : S("next"));
    n = await query_objlist(P(buf), P(G, "invent"), SIGNAL_NOMENU | SIGNAL_ESCAPE | USE_INVLET | INVORDER_SORT, P(pick_list, 0), PICK_ANY, not_fully_identified);
    if (n > 0) {
      if (n > id_limit) {
        n = id_limit;
      }
      for (i = 0; i < n; ++i, --id_limit) {
        await identify($sadd(pick_list[0], i).item.a_obj);
      }
      free(pick_list[0]);
      G.windowprocs.win_mark_synch();
      first = 0;
    } else if (n === -2) {
      break;
    } else if (n === -1) {
      await pline(S("That was all."));
      break;
    } else if (!--tryct) {
      await pline(S("%s"), G.c_common_strings.c_thats_enough_tries);
      break;
    } else {
      await pline(S("Choose an item; use ESC to decline."));
    }
  }
}

export function count_unidentified(objchn: struct_obj | null): number {
  let unid_cnt = 0;
  let obj = null;
  for (obj = objchn; obj; obj = obj.nobj) {
    if (not_fully_identified(obj)) {
      ++unid_cnt;
    }
  }
  return unid_cnt;
}

export async function identify_pack(id_limit: number, learning_id: number): Promise<void> {
  let obj = null;
  let n = 0;
  let unid_cnt = count_unidentified(G.invent);
  if (!unid_cnt) {
    await You(S("have already identified all %sof your possessions."), learning_id ? S("the rest ") : S(""));
  } else if (!id_limit || id_limit >= unid_cnt) {
    for (obj = G.invent; obj; obj = obj.nobj) {
      if (not_fully_identified(obj)) {
        await identify(obj);
        if (unid_cnt === 1) {
          break;
        }
      }
    }
  } else {
    n = 0;
    if (G.flags.menu_style === MENU_TRADITIONAL) {
      do {
        n = await ggetobj(S("identify"), identify, id_limit, FALSE, null);
        if (n < 0) {
          break;
        }
      } while ((id_limit -= n) > 0);
    }
    if (n === 0 || n < -1) {
      await menu_identify(id_limit);
    }
  }
  update_inventory();
}

export async function learn_unseen_invent(): Promise<void> {
  let otmp = null;
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    return;
  }
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.dknown) {
      continue;
    }
    await xname(otmp);
  }
  update_inventory();
}

export function update_inventory(): void {
  if (G.restoring) {
    return;
  }
  G.windowprocs.win_update_inventory();
}

function obj_to_let(obj: struct_obj | null): number {
  if (!G.flags.invlet_constant) {
    obj.invlet = NOINVSYM;
    reassign();
  }
  return obj.invlet;
}

export async function prinv(prefix: Ptr | null, obj: struct_obj | null, quan: number): Promise<void> {
  if (!prefix) {
    prefix = S("");
  }
  await pline(S("%s%s%s"), prefix, prefix.a[prefix.o] ? S(" ") : S(""), await xprname(obj, null, obj_to_let(obj), TRUE, 0, quan));
}

export async function xprname(obj: struct_obj | null, txt: Ptr | null, let_: number, dot: number, cost: number, quan: number): Promise<Ptr | null> {
  let suffix = new Int8Array(80);
  let sfxlen = 0;
  let txtlen = 0;
  let fmt = null;
  let use_invlet = (G.flags.invlet_constant && let_ !== CONTAINED_SYM && let_ !== HANDS_SYM ? 1 : 0) << 24 >> 24;
  let savequan = 0;
  if (quan && obj) {
    savequan = obj.quan;
    obj.quan = quan;
  }
  fmt = S("%c - %.*s%s");
  if (!txt) {
    txt = await doname(obj);
  }
  txtlen = strlen(txt) | 0;
  if (cost !== 0 || let_ === 42) {
    if (dot && use_invlet) {
      let_ = obj.invlet;
    }
    sprintf(P(suffix), S("%c%6ld %.50s"), G.iflags.menu_tab_sep ? 9 : 32, cost, await currency(cost));
    if (!G.iflags.menu_tab_sep) {
      fmt = S("%c - %-45.*s%s");
      if (txtlen < 45) {
        txtlen = 45;
      }
    }
  } else {
    if (use_invlet) {
      let_ = obj.invlet;
    }
    strcpy(P(suffix), dot ? S(".") : S(""));
  }
  sfxlen = strlen(P(suffix)) | 0;
  if (txtlen > BUFSZ - 1 - (4 + sfxlen)) {
    txtlen = BUFSZ - 1 - (4 + sfxlen);
  }
  sprintf(P(xprname$li), fmt, let_, txtlen, txt, P(suffix));
  if (savequan) {
    obj.quan = savequan;
  }
  return P(xprname$li);
}

export async function ddoinv(): Promise<number> {
  await display_inventory(null, FALSE);
  return 0;
}

function find_unpaid(list: struct_obj | null, last_found: Ptr | null): struct_obj | null {
  let obj = null;
  while (list) {
    if (list.unpaid) {
      if (last_found.a[last_found.o]) {
        if (list === last_found.a[last_found.o]) {
          last_found.a[last_found.o] = null;
        }
      } else {
        return last_found.a[last_found.o] = list;
      }
    }
    if (!!list.cobj) {
      if (!!(obj = find_unpaid(list.cobj, last_found))) {
        return obj;
      }
    }
    list = list.nobj;
  }
  return null;
}

export async function free_pickinv_cache(): Promise<void> {
  if (cached_pickinv_win !== WIN_ERR) {
    await G.windowprocs.win_destroy_nhwindow(cached_pickinv_win);
    cached_pickinv_win = WIN_ERR;
  }
}

async function display_pickinv(lets: Ptr | null, xtra_choice: Ptr | null, query: Ptr | null, want_reply: number, out_cnt: Ptr | null): Promise<number> {
  let $g = 0;
  let otmp = null;
  let wizid_fakeobj = new struct_obj();
  let ilet = 0;
  let ret = 0;
  let invlet = null;
  let n = 0;
  let classcount = 0;
  let win = 0;
  let any = new union_any();
  let selected = [null];
  let sortflags = 0;
  let sortedinvent = [null];
  let srtinv = null;
  let wizid = 0;
  let gotsomething = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      wizid_fakeobj = new struct_obj();
      invlet = P(G.flags.inv_order);
      any = new union_any();
      wizid = (G.flags.debug && G.iflags.override_ID ? 1 : 0) << 24 >> 24;
      gotsomething = FALSE;
      if (lets && !lets.a[lets.o]) {
        lets = null;
      }
      if (G.iflags.perm_invent && (lets || xtra_choice || wizid)) {
        if (cached_pickinv_win === WIN_ERR) {
          cached_pickinv_win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        }
        win = cached_pickinv_win;
      } else {
        win = G.WIN_INVEN;
      }
      n = G.iflags.perm_invent && !lets && !want_reply ? 2 : lets ? strlen(lets) | 0 : !G.invent ? 0 : !G.invent.nobj ? 1 : 2;
      if (xtra_choice || n === 1 && (!lets || G.iflags.override_ID)) {
        ++n;
      }
      if (n === 0) {
        await pline(S("%s."), P(display_pickinv$not_carrying_anything));
        return 0;
      }
      if (!G.flags.invlet_constant) {
        reassign();
      }
      if (n === 1 && !G.iflags.force_invmenu) {
        ret = 0;
        if (xtra_choice) {
          ret = await G.windowprocs.win_message_menu(HANDS_SYM, PICK_ONE, await xprname(null, xtra_choice, HANDS_SYM, TRUE, 0, 0));
        } else {
          for (otmp = G.invent; otmp; otmp = otmp.nobj) {
            if (!lets || otmp.invlet === lets.a[lets.o]) {
              break;
            }
          }
          if (otmp) {
            ret = await G.windowprocs.win_message_menu(otmp.invlet, want_reply ? PICK_ONE : PICK_NONE, await xprname(otmp, null, lets.a[lets.o], TRUE, 0, 0));
          }
        }
        if (out_cnt) {
          out_cnt.a[out_cnt.o] = -1;
        }
        return ret;
      }
      sortflags = (G.flags.sortloot === 102 ? SORTLOOT_LOOT : SORTLOOT_INVLET) >>> 0;
      if (G.flags.sortpack) {
        sortflags = (sortflags | SORTLOOT_PACK) >>> 0;
      }
      sortedinvent[0] = await sortloot(P(G, "invent"), sortflags, FALSE, null);
      await G.windowprocs.win_start_menu(win);
      any.$cp(G.zeroany);
      if (G.flags.debug && G.iflags.override_ID) {
        let unid_cnt = 0;
        let prompt = new Int8Array(128);
        unid_cnt = count_unidentified(G.invent);
        sprintf(P(prompt), S("Debug Identify"));
        if (unid_cnt) {
          sprintf(eos(P(prompt)), S(" -- unidentified or partially identified item%s"), unid_cnt === 1 ? S("") : S("s"));
        }
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, P(prompt), MENU_UNSELECTED);
        if (!unid_cnt) {
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S("(all items are permanently identified already)"), MENU_UNSELECTED);
          gotsomething = TRUE;
        } else {
          any.a_obj = wizid_fakeobj;
          sprintf(P(prompt), S("select %s to permanently identify"), unid_cnt === 1 ? S("it") : S("any or all of them"));
          if (unid_cnt > 1) {
            sprintf(eos(P(prompt)), S(" (%s for all)"), visctrl(G.iflags.override_ID));
          }
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 95, G.iflags.override_ID, ATR_NONE, P(prompt), MENU_UNSELECTED);
          gotsomething = TRUE;
        }
      } else if (xtra_choice) {
        if (G.flags.sortpack) {
          await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Miscellaneous"), MENU_UNSELECTED);
        }
        any.a_char = HANDS_SYM;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, HANDS_SYM, 0, ATR_NONE, xtra_choice, MENU_UNSELECTED);
        gotsomething = TRUE;
      }
    case 1: // nextclass
      classcount = 0;
      for (srtinv = sortedinvent[0]; !!(otmp = srtinv.obj); srtinv = $sadd(srtinv, 1)) {
        if (lets && !strchr(lets, otmp.invlet)) {
          continue;
        }
        if (!G.flags.sortpack || otmp.oclass === invlet.a[invlet.o]) {
          if (wizid && !not_fully_identified(otmp)) {
            continue;
          }
          any.$cp(G.zeroany);
          ilet = otmp.invlet;
          if (G.flags.sortpack && !classcount) {
            await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, await let_to_name(invlet.a[invlet.o], FALSE, want_reply && G.iflags.menu_head_objsym ? 1 : 0), MENU_UNSELECTED);
            ++classcount;
          }
          if (wizid) {
            any.a_obj = otmp;
          } else {
            any.a_char = ilet;
          }
          await G.windowprocs.win_add_menu(win, otmp.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : otmp.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : otmp.otyp === 240 ? otmp.corpsenm + (382 + (1 + (382 + (382 + 0)))) : otmp.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))), any, ilet, wizid ? G.def_oc_syms[otmp.oclass].sym : 0, ATR_NONE, await doname(otmp), MENU_UNSELECTED);
          gotsomething = TRUE;
        }
      }
      if (G.flags.sortpack) {
        if ($rd((invlet = invlet.add(1)))) {
          { $g = 1; continue $L; }
        }
        if (!$peq(invlet = invlet.add(-1), P(venom_inv))) {
          invlet = P(venom_inv);
          { $g = 1; continue $L; }
        }
      }
      if (G.iflags.force_invmenu && lets && want_reply) {
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, S("Special"), MENU_UNSELECTED);
        any.a_char = 42;
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 42, 0, ATR_NONE, S("(list everything)"), MENU_UNSELECTED);
        gotsomething = TRUE;
      }
      unsortloot(P(sortedinvent, 0));
      if (G.iflags.perm_invent && !lets && !gotsomething) {
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, 0, P(display_pickinv$not_carrying_anything), MENU_UNSELECTED);
        want_reply = FALSE;
      }
      await G.windowprocs.win_end_menu(win, query && query.a[query.o] ? query : null);
      n = await G.windowprocs.win_select_menu(win, wizid ? PICK_ANY : want_reply ? PICK_ONE : PICK_NONE, P(selected, 0));
      if (n > 0) {
        if (wizid) {
          let i = 0;
          G.iflags.override_ID = 0;
          ret = 0;
          for (i = 0; i < n; ++i) {
            otmp = $sadd(selected[0], i).item.a_obj;
            if (otmp === wizid_fakeobj) {
              await identify_pack(0, FALSE);
            } else {
              if (not_fully_identified(otmp)) {
                await identify(otmp);
              }
            }
          }
        } else {
          ret = selected[0].item.a_char;
          if (out_cnt) {
            out_cnt.a[out_cnt.o] = selected[0].count;
          }
        }
        free(selected[0]);
      } else {
        ret = (!n ? 0 : 27) << 24 >> 24;
      }
      return ret;
    }
    break;
  }
}

export async function display_inventory(lets: Ptr | null, want_reply: number): Promise<number> {
  return await display_pickinv(lets, null, null, want_reply, null);
}

async function display_used_invlets(avoidlet: number): Promise<number> {
  let otmp = null;
  let ilet = 0;
  let ret = 0;
  let invlet = P(G.flags.inv_order);
  let n = 0;
  let classcount = 0;
  let invdone = 0;
  let win = 0;
  let any = new union_any();
  const selected = [null];
  if (G.invent) {
    win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_start_menu(win);
    while (!invdone) {
      any.$cp(G.zeroany);
      classcount = 0;
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        ilet = otmp.invlet;
        if (ilet === avoidlet) {
          continue;
        }
        if (!G.flags.sortpack || otmp.oclass === invlet.a[invlet.o]) {
          if (G.flags.sortpack && !classcount) {
            any.$cp(G.zeroany);
            await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, await let_to_name(invlet.a[invlet.o], FALSE, FALSE), MENU_UNSELECTED);
            ++classcount;
          }
          any.a_char = ilet;
          await G.windowprocs.win_add_menu(win, otmp.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : otmp.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : otmp.otyp === 240 ? otmp.corpsenm + (382 + (1 + (382 + (382 + 0)))) : otmp.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))), any, ilet, 0, ATR_NONE, await doname(otmp), MENU_UNSELECTED);
        }
      }
      if (G.flags.sortpack && $rd((invlet = invlet.add(1)))) {
        continue;
      }
      invdone = 1;
    }
    await G.windowprocs.win_end_menu(win, S("Inventory letters used:"));
    n = await G.windowprocs.win_select_menu(win, PICK_ONE, P(selected, 0));
    if (n > 0) {
      ret = selected[0].item.a_char;
      free(selected[0]);
    } else {
      ret = (!n ? 0 : 27) << 24 >> 24;
    }
    await G.windowprocs.win_destroy_nhwindow(win);
  }
  return ret;
}

export function count_unpaid(list: struct_obj | null): number {
  let count = 0;
  while (list) {
    if (list.unpaid) {
      ++count;
    }
    if (!!list.cobj) {
      count += count_unpaid(list.cobj);
    }
    list = list.nobj;
  }
  return count;
}

export async function count_buc(list: struct_obj | null, type: number, filterfunc: Function | null): Promise<number> {
  let count = 0;
  for (; list; list = list.nobj) {
    if (G.urole.malenum === 335) {
      list.bknown = ((list.oclass !== COIN_CLASS ? 1 : 0) >>> 0) & 1;
    }
    if (filterfunc && !await filterfunc(list)) {
      continue;
    }
    if (list.oclass === COIN_CLASS) {
      if (type === (G.iflags.goldX ? BUC_UNKNOWN : BUC_UNCURSED)) {
        ++count;
      }
      continue;
    }
    if (!list.bknown ? type === BUC_UNKNOWN ? 1 : 0 : list.blessed | 0 ? type === BUC_BLESSED ? 1 : 0 : list.cursed | 0 ? type === BUC_CURSED ? 1 : 0 : type === BUC_UNCURSED ? 1 : 0) {
      ++count;
    }
  }
  return count;
}

export function tally_BUCX(list: struct_obj | null, by_nexthere: number, bcp: Ptr | null, ucp: Ptr | null, ccp: Ptr | null, xcp: Ptr | null, ocp: Ptr | null): void {
  bcp.a[bcp.o] = ucp.a[ucp.o] = ccp.a[ccp.o] = xcp.a[xcp.o] = ocp.a[ocp.o] = 0;
  for (; list; list = by_nexthere ? list.v.v_nexthere : list.nobj) {
    if (G.urole.malenum === 335) {
      list.bknown = ((list.oclass !== COIN_CLASS ? 1 : 0) >>> 0) & 1;
    }
    if (list.oclass === COIN_CLASS) {
      if (G.iflags.goldX) {
        ++xcp.a[xcp.o];
      } else {
        ++ucp.a[ucp.o];
      }
      continue;
    }
    if (!list.bknown) {
      ++xcp.a[xcp.o];
    } else if (list.blessed) {
      ++bcp.a[bcp.o];
    } else if (list.cursed) {
      ++ccp.a[ccp.o];
    } else {
      ++ucp.a[ucp.o];
    }
  }
}

export async function count_contents(container: struct_obj | null, nested: number, quantity: number, everything: number, newdrop: number): Promise<number> {
  let otmp = null;
  let topc = null;
  let shoppy = FALSE;
  let count = 0;
  if (!everything && !newdrop) {
    const x = new Int8Array(1);
    const y = new Int8Array(1);
    for (topc = container; topc.where === OBJ_CONTAINED; topc = topc.v.v_ocontainer) {
      continue;
    }
    if (topc.where === OBJ_FLOOR && get_obj_location(topc, P(x, 0), P(y, 0), 0)) {
      shoppy = await costly_spot(x[0], y[0]);
    }
  }
  for (otmp = container.cobj; otmp; otmp = otmp.nobj) {
    if (nested && !!otmp.cobj) {
      count += await count_contents(otmp, nested, quantity, everything, newdrop);
    }
    if (everything || otmp.unpaid | 0 || shoppy && !otmp.no_charge) {
      count += quantity ? otmp.quan : 1;
    }
  }
  return count;
}

async function dounpaid(): Promise<void> {
  let win = 0;
  let otmp = null;
  const marker = [null];
  let contnr = null;
  let ilet = 0;
  let invlet = P(G.flags.inv_order);
  let classcount = 0;
  let count = 0;
  let num_so_far = 0;
  let cost = 0;
  let totcost = 0;
  count = count_unpaid(G.invent);
  otmp = marker[0] = contnr = null;
  if (count === 1) {
    otmp = find_unpaid(G.invent, P(marker, 0));
    contnr = unknwn_contnr_contents(otmp);
  }
  if (otmp && !contnr) {
    cost = await unpaid_cost(otmp, FALSE);
    ++G.iflags.suppress_price;
    await pline(S("%s"), await xprname(otmp, await distant_name(otmp, doname), otmp.where === 3 ? otmp.invlet : 62, 1, cost, 0));
    --G.iflags.suppress_price;
    return;
  }
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  cost = totcost = 0;
  num_so_far = 0;
  if (!G.flags.invlet_constant) {
    reassign();
  }
  do {
    classcount = 0;
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      ilet = otmp.invlet;
      if (otmp.unpaid) {
        if (!G.flags.sortpack || otmp.oclass === invlet.a[invlet.o]) {
          if (G.flags.sortpack && !classcount) {
            await G.windowprocs.win_putstr(win, 0, await let_to_name(invlet.a[invlet.o], TRUE, FALSE));
            ++classcount;
          }
          totcost += cost = await unpaid_cost(otmp, FALSE);
          ++G.iflags.suppress_price;
          await G.windowprocs.win_putstr(win, 0, await xprname(otmp, await distant_name(otmp, doname), ilet, TRUE, cost, 0));
          --G.iflags.suppress_price;
          ++num_so_far;
        }
      }
    }
  } while (G.flags.sortpack && $rd((invlet = invlet.add(1))));
  if (count > num_so_far) {
    if (G.flags.sortpack) {
      await G.windowprocs.win_putstr(win, 0, await let_to_name(CONTAINED_SYM, TRUE, FALSE));
    }
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (!!otmp.cobj) {
        let contcost = 0;
        marker[0] = null;
        while (find_unpaid(otmp.cobj, P(marker, 0))) {
          totcost += cost = await unpaid_cost(marker[0], FALSE);
          contcost += cost;
          if (otmp.cknown) {
            ++G.iflags.suppress_price;
            await G.windowprocs.win_putstr(win, 0, await xprname(marker[0], await distant_name(marker[0], doname), CONTAINED_SYM, TRUE, cost, 0));
            --G.iflags.suppress_price;
          }
        }
        if (!otmp.cknown) {
          let contbuf = new Int8Array(256);
          sprintf(P(contbuf), S("%s contents"), s_suffix(await xname(otmp)));
          await G.windowprocs.win_putstr(win, 0, await xprname(null, P(contbuf), CONTAINED_SYM, TRUE, contcost, 0));
        }
      }
    }
  }
  await G.windowprocs.win_putstr(win, 0, S(""));
  await G.windowprocs.win_putstr(win, 0, await xprname(null, S("Total:"), 42, FALSE, totcost, 0));
  await G.windowprocs.win_display_nhwindow(win, FALSE);
  await G.windowprocs.win_destroy_nhwindow(win);
}

function this_type_only(obj: struct_obj | null): number {
  let res = (obj.oclass === this_type ? 1 : 0) << 24 >> 24;
  if (obj.oclass === COIN_CLASS) {
    if (this_type && strchr(S("BUCX"), this_type)) {
      res = (this_type === (G.iflags.goldX ? 88 : 85) ? 1 : 0) << 24 >> 24;
    }
  } else {
    switch (this_type) {
    case 66:
      res = (obj.bknown | 0 && obj.blessed | 0 ? 1 : 0) << 24 >> 24;
      break;
    case 85:
      res = (obj.bknown | 0 && !(obj.blessed | 0 || obj.cursed | 0) ? 1 : 0) << 24 >> 24;
      break;
    case 67:
      res = (obj.bknown | 0 && obj.cursed | 0 ? 1 : 0) << 24 >> 24;
      break;
    case 88:
      res = (!obj.bknown ? 1 : 0) << 24 >> 24;
      break;
    default:
      break;
    }
  }
  return res;
}

export async function dotypeinv(): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any;
  let c = 0;
  let n = 0;
  let i = 0;
  let extra_types = null;
  let types = new Int8Array(256);
  let class_count = 0;
  let oclass = 0;
  let unpaid_count = 0;
  const itemcount = new Int32Array(1);
  const bcnt = new Int32Array(1);
  const ccnt = new Int32Array(1);
  const ucnt = new Int32Array(1);
  const xcnt = new Int32Array(1);
  const ocnt = new Int32Array(1);
  let billx = ($rd(P(G.u.ushops)) && await doinvbill(0) ? 1 : 0) << 24 >> 24;
  const pick_list = [null];
  let traditional = TRUE;
  let prompt = S("What type of object do you want an inventory of?");
  if (!G.invent && !billx) {
    await You(S("aren't carrying anything."));
    return 0;
  }
  unpaid_count = count_unpaid(G.invent);
  tally_BUCX(G.invent, FALSE, P(bcnt, 0), P(ucnt, 0), P(ccnt, 0), P(xcnt, 0), P(ocnt, 0));
  if (G.flags.menu_style !== MENU_TRADITIONAL) {
    if (G.flags.menu_style === MENU_FULL || G.flags.menu_style === MENU_PARTIAL) {
      traditional = FALSE;
      i = UNPAID_TYPES;
      if (billx) {
        i |= BILLED_TYPES;
      }
      if (bcnt[0]) {
        i |= BUC_BLESSED;
      }
      if (ucnt[0]) {
        i |= BUC_UNCURSED;
      }
      if (ccnt[0]) {
        i |= BUC_CURSED;
      }
      if (xcnt[0]) {
        i |= BUC_UNKNOWN;
      }
      n = await query_category(prompt, G.invent, i, P(pick_list, 0), PICK_ONE);
      if (!n) {
        return 0;
      }
      this_type = c = pick_list[0].item.a_int << 24 >> 24;
      free(pick_list[0]);
    }
  }
  if (traditional) {
    types[0] = 0;
    class_count = await collect_obj_classes(P(types), G.invent, FALSE, null, P(itemcount, 0));
    if (unpaid_count || billx || bcnt[0] + ccnt[0] + ucnt[0] + xcnt[0] !== 0) {
      types[class_count++] = 32;
    }
    if (unpaid_count) {
      types[class_count++] = 117;
    }
    if (billx) {
      types[class_count++] = 120;
    }
    if (bcnt[0]) {
      types[class_count++] = 66;
    }
    if (ucnt[0]) {
      types[class_count++] = 85;
    }
    if (ccnt[0]) {
      types[class_count++] = 67;
    }
    if (xcnt[0]) {
      types[class_count++] = 88;
    }
    types[class_count] = 0;
    extra_types = eos(P(types));
    $wr(($t1 = extra_types, extra_types = $t1.add(1), $t1), 0, 27);
    if (!unpaid_count) {
      $wr(($t2 = extra_types, extra_types = $t2.add(1), $t2), 0, 117);
    }
    if (!billx) {
      $wr(($t3 = extra_types, extra_types = $t3.add(1), $t3), 0, 120);
    }
    if (!bcnt[0]) {
      $wr(($t4 = extra_types, extra_types = $t4.add(1), $t4), 0, 66);
    }
    if (!ucnt[0]) {
      $wr(($t5 = extra_types, extra_types = $t5.add(1), $t5), 0, 85);
    }
    if (!ccnt[0]) {
      $wr(($t6 = extra_types, extra_types = $t6.add(1), $t6), 0, 67);
    }
    if (!xcnt[0]) {
      $wr(($t7 = extra_types, extra_types = $t7.add(1), $t7), 0, 88);
    }
    extra_types.a[extra_types.o] = 0;
    for (i = 0; i < MAXOCLASSES; ++i) {
      if (!strchr(P(types), G.def_oc_syms[i].sym)) {
        $wr(($t8 = extra_types, extra_types = $t8.add(1), $t8), 0, G.def_oc_syms[i].sym);
        extra_types.a[extra_types.o] = 0;
      }
    }
    if (class_count > 1) {
      c = await yn_function(prompt, P(types), 0);
      savech(c);
      if (c === 0) {
        await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
        return 0;
      }
    } else {
      if (unpaid_count) {
        c = 117;
      } else if (billx) {
        c = 120;
      } else {
        c = types[0];
      }
    }
  }
  if (c === 120 || c === 88 && billx && !xcnt[0]) {
    if (billx) {
      await doinvbill(1);
    } else {
      await pline(S("No used-up objects%s."), unpaid_count ? S(" on your shopping bill") : S(""));
    }
    return 0;
  }
  if (c === 117 || c === 85 && unpaid_count && !ucnt[0]) {
    if (unpaid_count) {
      await dounpaid();
    } else {
      await You(S("are not carrying any unpaid objects."));
    }
    return 0;
  }
  if (traditional) {
    if (strchr(S("BUCX"), c)) {
      oclass = c;
    } else {
      oclass = def_char_to_objclass(c);
    }
    if (oclass === COIN_CLASS) {
      return await doprgold();
    }
    if (strchr(P(types), c).o > strchr(P(types), 27).o) {
      let before = S("");
      let after = S("");
      switch (c) {
      case 66:
        before = S("known to be blessed ");
        break;
      case 85:
        before = S("known to be uncursed ");
        break;
      case 67:
        before = S("known to be cursed ");
        break;
      case 88:
        after = S(" whose blessed/uncursed/cursed status is unknown");
        break;
      default:
        before = S("such ");
        break;
      }
      await You(S("have no %sobjects%s."), before, after);
      return 0;
    }
    this_type = oclass;
  }
  if (await query_objlist(null, P(G, "invent"), (G.flags.invlet_constant ? USE_INVLET : 0) | INVORDER_SORT, P(pick_list, 0), PICK_NONE, this_type_only) > 0) {
    free(pick_list[0]);
  }
  return 0;
}

export async function dfeature_at(x: number, y: number, buf: Ptr | null): Promise<Ptr | null> {
  let lev = $sat(G.level.locations[x], y);
  let ltyp = lev.typ;
  let cmap = -1;
  let dfeature = null;
  if (ltyp === DOOR) {
    switch (lev.flags | 0) {
    case 0:
      cmap = S_ndoor;
      break;
    case 2:
      cmap = S_vodoor;
      break;
    case 1:
      dfeature = S("broken door");
      break;
    default:
      cmap = S_vcdoor;
      break;
    }
    if (is_drawbridge_wall(x, y) >= 0) {
      dfeature = S("open drawbridge portcullis"), cmap = -1;
    }
  } else if (ltyp === FOUNTAIN) {
    cmap = S_fountain;
  } else if (ltyp === THRONE) {
    cmap = S_throne;
  } else if (is_lava(x, y)) {
    cmap = S_lava;
  } else if (is_ice(x, y)) {
    cmap = S_ice;
  } else if (is_pool(x, y)) {
    dfeature = S("pool of water");
  } else if (ltyp === SINK) {
    cmap = S_sink;
  } else if (ltyp === ALTAR) {
    sprintf(P(dfeature_at$altbuf), S("%saltar to %s (%s)"), (lev.flags | 0) & AM_SHRINE && ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level) || (G.dungeon_topology.d_sanctum_level.dlevel || G.dungeon_topology.d_sanctum_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_sanctum_level)) ? S("high ") : S(""), await a_gname(), align_str((!((lev.flags | 0) & ~8) ? -128 : ((lev.flags | 0) & ~8) === 4 ? 1 : ((lev.flags | 0) & ~8) - 2) << 24 >> 24));
    dfeature = P(dfeature_at$altbuf);
  } else if (x === G.upstair.sx && y === G.upstair.sy || x === G.sstairs.sx && y === G.sstairs.sy && G.sstairs.up) {
    cmap = S_upstair;
  } else if (x === G.dnstair.sx && y === G.dnstair.sy || x === G.sstairs.sx && y === G.sstairs.sy && !G.sstairs.up) {
    cmap = S_dnstair;
  } else if (x === G.upladder.sx && y === G.upladder.sy) {
    cmap = S_upladder;
  } else if (x === G.dnladder.sx && y === G.dnladder.sy) {
    cmap = S_dnladder;
  } else if (ltyp === DRAWBRIDGE_DOWN) {
    cmap = S_vodbridge;
  } else if (ltyp === DBWALL) {
    cmap = S_vcdbridge;
  } else if (ltyp === GRAVE) {
    cmap = S_grave;
  } else if (ltyp === TREE) {
    cmap = S_tree;
  } else if (ltyp === IRONBARS) {
    dfeature = S("set of iron bars");
  }
  if (cmap >= 0) {
    dfeature = G.defsyms[cmap].explanation;
  }
  if (dfeature) {
    strcpy(buf, dfeature);
  }
  return dfeature;
}

export async function look_here(obj_cnt: number, picked_some: number): Promise<number> {
  let otmp = null;
  let trap = null;
  let verb = (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see");
  let dfeature = null;
  let fbuf = new Int8Array(256);
  let fbuf2 = new Int8Array(256);
  let tmpwin = 0;
  let skip_objects = 0;
  let felt_cockatrice = FALSE;
  skip_objects = (G.flags.pile_limit > 0 && obj_cnt >= G.flags.pile_limit ? 1 : 0) << 24 >> 24;
  if (G.u.uswallow | 0 && G.u.ustuck) {
    let mtmp = G.u.ustuck;
    sprintf(P(fbuf), S("Contents of %s %s"), s_suffix(await mon_nam(mtmp)), mbodypart(mtmp, STOMACH));
    await You(S("%s to %s what is lying in %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("try") : S("look around"), verb, P(fbuf, 12));
    otmp = mtmp.minvent;
    if (otmp) {
      for (; otmp; otmp = otmp.nobj) {
        if (otmp.otyp === CORPSE) {
          await feel_cockatrice(otmp, FALSE);
        }
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        strcpy(P(fbuf), S("You feel"));
      }
      strcat(P(fbuf), S(":"));
      await display_minventory(mtmp, MINV_ALL | PICK_NONE, P(fbuf));
    } else {
      await You(S("%s no objects here."), verb);
    }
    return !!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0;
  }
  if (!skip_objects && (trap = t_at(G.u.ux, G.u.uy)) && trap.tseen | 0) {
    await There(S("is %s here."), await an(G.defsyms[S_arrow_trap + (trap.ttyp | 0) - 1].explanation));
  }
  otmp = G.level.objects[G.u.ux][G.u.uy];
  dfeature = await dfeature_at(G.u.ux, G.u.uy, P(fbuf2));
  if (dfeature && !strcmp(dfeature, S("pool of water")) && G.u.uinwater | 0) {
    dfeature = null;
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    let drift = ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) ? 1 : 0) << 24 >> 24;
    if (dfeature && !strncmp(dfeature, S("altar "), 6)) {
      await You(S("try to feel what is here."));
    } else {
      let where = (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !can_reach_floor(TRUE) ? S("lying beneath you") : S("lying here on the ");
      let onwhat = (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !can_reach_floor(TRUE) ? S("") : surface(G.u.ux, G.u.uy);
      await You(S("try to feel what is %s%s."), drift ? S("floating here") : where, drift ? S("") : onwhat);
    }
    if (dfeature && !drift && !strcmp(dfeature, surface(G.u.ux, G.u.uy))) {
      dfeature = null;
    }
    if (!can_reach_floor(TRUE)) {
      await pline(S("But you can't reach it!"));
      return 0;
    }
  }
  if (dfeature) {
    sprintf(P(fbuf), S("There is %s here."), await an(dfeature));
  }
  if (!otmp || is_lava(G.u.ux, G.u.uy) || is_pool(G.u.ux, G.u.uy) && !G.u.uinwater) {
    if (dfeature) {
      await pline(S("%s"), P(fbuf));
    }
    await read_engr_at(G.u.ux, G.u.uy);
    if (!skip_objects && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !dfeature)) {
      await You(S("%s no objects here."), verb);
    }
    return !!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0;
  }
  if (skip_objects) {
    if (dfeature) {
      await pline(S("%s"), P(fbuf));
    }
    await read_engr_at(G.u.ux, G.u.uy);
    if (obj_cnt === 1 && otmp.quan === 1) {
      await There(S("is %s object here."), picked_some ? S("another") : S("an"));
    } else {
      await There(S("are %s%s objects here."), obj_cnt < 5 ? S("a few") : obj_cnt < 10 ? S("several") : S("many"), picked_some ? S(" more") : S(""));
    }
    for (; otmp; otmp = otmp.v.v_nexthere) {
      if (otmp.otyp === CORPSE && will_feel_cockatrice(otmp, FALSE)) {
        await pline(S("%s %s%s."), obj_cnt > 1 ? S("Including") : otmp.quan > 1 ? S("They're") : S("It's"), await corpse_xname(otmp, null, CXN_ARTICLE), poly_when_stoned(G.youmonst.data) ? S("") : S(", unfortunately"));
        await feel_cockatrice(otmp, FALSE);
        break;
      }
    }
  } else if (!otmp.v.v_nexthere) {
    if (dfeature) {
      await pline(S("%s"), P(fbuf));
    }
    await read_engr_at(G.u.ux, G.u.uy);
    await You(S("%s here %s."), verb, await doname_with_price(otmp));
    G.iflags.last_msg = PLNMSG_ONE_ITEM_HERE;
    if (otmp.otyp === CORPSE) {
      await feel_cockatrice(otmp, FALSE);
    }
  } else {
    let buf = new Int8Array(256);
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    if (dfeature) {
      await G.windowprocs.win_putstr(tmpwin, 0, P(fbuf));
      await G.windowprocs.win_putstr(tmpwin, 0, S(""));
    }
    sprintf(P(buf), S("%s that %s here:"), picked_some ? S("Other things") : S("Things"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("you feel") : S("are"));
    await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
    for (; otmp; otmp = otmp.v.v_nexthere) {
      if (otmp.otyp === CORPSE && will_feel_cockatrice(otmp, FALSE)) {
        felt_cockatrice = TRUE;
        sprintf(P(buf), S("%s..."), await doname(otmp));
        await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
        break;
      }
      await G.windowprocs.win_putstr(tmpwin, 0, await doname_with_price(otmp));
    }
    await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
    await G.windowprocs.win_destroy_nhwindow(tmpwin);
    if (felt_cockatrice) {
      await feel_cockatrice(otmp, FALSE);
    }
    await read_engr_at(G.u.ux, G.u.uy);
  }
  return !!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0;
}

export async function dolook(): Promise<number> {
  let res = 0;
  hide_unhide_msgtypes(TRUE, MSGTYP_MASK_REP_SHOW);
  res = await look_here(0, FALSE);
  hide_unhide_msgtypes(FALSE, MSGTYP_MASK_REP_SHOW);
  return res;
}

export function will_feel_cockatrice(otmp: struct_obj | null, force_touch: number): number {
  if (((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || force_touch) && !G.uarmg && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && (otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)))) {
    return TRUE;
  }
  return FALSE;
}

export async function feel_cockatrice(otmp: struct_obj | null, force_touch: number): Promise<void> {
  let kbuf = new Int8Array(256);
  if (will_feel_cockatrice(otmp, force_touch)) {
    strcpy(P(kbuf), await corpse_xname(otmp, null, CXN_PFX_THE));
    if (poly_when_stoned(G.youmonst.data)) {
      await You(S("touched %s with your bare %s."), P(kbuf), await makeplural(body_part(HAND)));
    } else {
      await pline(S("Touching %s is a fatal mistake..."), P(kbuf));
    }
    sprintf(P(kbuf), S("touching %s bare-handed"), await killer_xname(otmp));
    await instapetrify(P(kbuf));
  }
}

export async function stackobj(obj$: struct_obj | null): Promise<void> {
  const obj = [null];
  obj[0] = obj$;
  const otmp = [null];
  for (otmp[0] = G.level.objects[obj[0].ox][obj[0].oy]; otmp[0]; otmp[0] = otmp[0].v.v_nexthere) {
    if (otmp[0] !== obj[0] && await merged(P(obj, 0), P(otmp, 0))) {
      break;
    }
  }
  return;
}

export async function mergable(otmp: struct_obj | null, obj: struct_obj | null): Promise<number> {
  let objnamelth = 0;
  let otmpnamelth = 0;
  if (obj === otmp || obj.otyp !== otmp.otyp || obj.nomerge | 0 || otmp.nomerge | 0 || !G.objects[obj.otyp].oc_merge) {
    return FALSE;
  }
  if (obj.oclass === COIN_CLASS) {
    return TRUE;
  }
  if ((obj.bypass | 0) !== (otmp.bypass | 0) || (obj.cursed | 0) !== (otmp.cursed | 0) || (obj.blessed | 0) !== (otmp.blessed | 0)) {
    return FALSE;
  }
  if (obj.globby) {
    return TRUE;
  }
  if ((obj.unpaid | 0) !== (otmp.unpaid | 0) || obj.spe !== otmp.spe || (obj.no_charge | 0) !== (otmp.no_charge | 0) || (obj.obroken | 0) !== (otmp.obroken | 0) || (obj.otrapped | 0) !== (otmp.otrapped | 0) || (obj.lamplit | 0) !== (otmp.lamplit | 0)) {
    return FALSE;
  }
  if (obj.oclass === FOOD_CLASS && (obj.oeaten !== otmp.oeaten || (obj.oeroded | 0) !== (otmp.oeroded | 0))) {
    return FALSE;
  }
  if ((obj.dknown | 0) !== (otmp.dknown | 0) || (obj.bknown | 0) !== (otmp.bknown | 0) && !(G.urole.malenum === 335) || (obj.oeroded | 0) !== (otmp.oeroded | 0) || (obj.oeroded2 | 0) !== (otmp.oeroded2 | 0) || (obj.greased | 0) !== (otmp.greased | 0)) {
    return FALSE;
  }
  if ((obj.oclass === WEAPON_CLASS || obj.oclass === ARMOR_CLASS) && ((obj.oerodeproof | 0) !== (otmp.oerodeproof | 0) || (obj.rknown | 0) !== (otmp.rknown | 0))) {
    return FALSE;
  }
  if (obj.otyp === CORPSE || obj.otyp === EGG || obj.otyp === TIN) {
    if (obj.corpsenm !== otmp.corpsenm) {
      return FALSE;
    }
  }
  if (obj.otyp === EGG && (obj.timed || otmp.timed) || obj.otyp === CORPSE && otmp.corpsenm >= LOW_PM && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 308) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 310) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 309) || $sat(G.mons, otmp.corpsenm).mlet === S_TROLL)) {
    return FALSE;
  }
  if ((obj.otyp === 199 || obj.otyp === 200) && Math.trunc(obj.age / 25) !== Math.trunc(otmp.age / 25)) {
    return FALSE;
  }
  if (obj.otyp === POT_OIL && obj.lamplit | 0) {
    return FALSE;
  }
  if (obj.unpaid | 0 && !await same_price(obj, otmp)) {
    return FALSE;
  }
  objnamelth = strlen(safe_oname(obj)) | 0;
  otmpnamelth = strlen(safe_oname(otmp)) | 0;
  if (objnamelth !== otmpnamelth && (objnamelth && otmpnamelth || obj.otyp === CORPSE) || objnamelth && otmpnamelth && strncmp(obj.oextra.oname, otmp.oextra.oname, $u64(objnamelth))) {
    return FALSE;
  }
  if (obj.oextra && obj.oextra.omonst || obj.oextra && obj.oextra.omid || obj.oextra && obj.oextra.olong || otmp.oextra && otmp.oextra.omonst || otmp.oextra && otmp.oextra.omid || otmp.oextra && otmp.oextra.olong) {
    return FALSE;
  }
  if (obj.oartifact !== otmp.oartifact) {
    return FALSE;
  }
  if ((obj.known | 0) === (otmp.known | 0) || !G.objects[otmp.otyp].oc_uses_known) {
    return G.objects[obj.otyp].oc_merge << 24 >> 24;
  } else {
    return FALSE;
  }
}

export async function doprgold(): Promise<number> {
  let umoney = money_cnt(G.invent);
  if (!umoney) {
    await Your(S("wallet is empty."));
  } else {
    await Your(S("wallet contains %ld %s."), umoney, await currency(umoney));
  }
  await shopper_financial_report();
  return 0;
}

export async function doprwep(): Promise<number> {
  if (!G.uwep) {
    await You(S("are empty %s."), body_part(HANDED));
  } else {
    await prinv(null, G.uwep, 0);
    if (G.u.twoweap) {
      await prinv(null, G.uswapwep, 0);
    }
  }
  return 0;
}

async function noarmor(report_uskin: number): Promise<void> {
  if (!G.uskin || !report_uskin) {
    await You(S("are not wearing any armor."));
  } else {
    let p = null;
    let uskinname = null;
    let buf = new Int8Array(256);
    uskinname = strcpy(P(buf), await simpleonames(G.uskin));
    if (!strncmpi(uskinname, S("set of "), 7)) {
      uskinname = uskinname.add(7);
    }
    if (!!(p = strstri(uskinname, S(" dragon ")))) {
      while ((p.a[p.o + 1] = p.a[p.o + 8]) !== 0) {
        p = p.add(1);
      }
    }
    await You(S("are not wearing armor but have %s embedded in your skin."), uskinname);
  }
}

export async function doprarm(): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any;
  let lets = new Int8Array(8);
  let ct = 0;
  if (!wearing_armor()) {
    await noarmor(TRUE);
  } else {
    if (G.uarmu) {
      ($t1 = obj_to_let(G.uarmu), lets[ct++] = $t1);
    }
    if (G.uarm) {
      ($t2 = obj_to_let(G.uarm), lets[ct++] = $t2);
    }
    if (G.uarmc) {
      ($t3 = obj_to_let(G.uarmc), lets[ct++] = $t3);
    }
    if (G.uarmh) {
      ($t4 = obj_to_let(G.uarmh), lets[ct++] = $t4);
    }
    if (G.uarms) {
      ($t5 = obj_to_let(G.uarms), lets[ct++] = $t5);
    }
    if (G.uarmg) {
      ($t6 = obj_to_let(G.uarmg), lets[ct++] = $t6);
    }
    if (G.uarmf) {
      ($t7 = obj_to_let(G.uarmf), lets[ct++] = $t7);
    }
    lets[ct] = 0;
    await display_inventory(P(lets), FALSE);
  }
  return 0;
}

export async function doprring(): Promise<number> {
  let $t1: any, $t2: any;
  if (!G.uleft && !G.uright) {
    await You(S("are not wearing any rings."));
  } else {
    let lets = new Int8Array(3);
    let ct = 0;
    if (G.uleft) {
      ($t1 = obj_to_let(G.uleft), lets[ct++] = $t1);
    }
    if (G.uright) {
      ($t2 = obj_to_let(G.uright), lets[ct++] = $t2);
    }
    lets[ct] = 0;
    await display_inventory(P(lets), FALSE);
  }
  return 0;
}

export async function dopramulet(): Promise<number> {
  if (!G.uamul) {
    await You(S("are not wearing an amulet."));
  } else {
    await prinv(null, G.uamul, 0);
  }
  return 0;
}

function tool_in_use(obj: struct_obj | null): number {
  if ((obj.owornmask & (W_TOOL | W_SADDLE)) !== 0) {
    return TRUE;
  }
  if (obj.oclass !== TOOL_CLASS) {
    return FALSE;
  }
  return (obj === G.uwep || obj.lamplit | 0 || obj.otyp === LEASH && obj.corpsenm ? 1 : 0) << 24 >> 24;
}

export async function doprtool(): Promise<number> {
  let $t1: any;
  let otmp = null;
  let ct = 0;
  let lets = new Int8Array(53);
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (tool_in_use(otmp)) {
      ($t1 = obj_to_let(otmp), lets[ct++] = $t1);
    }
  }
  lets[ct] = 0;
  if (!ct) {
    await You(S("are not using any tools."));
  } else {
    await display_inventory(P(lets), FALSE);
  }
  return 0;
}

export async function doprinuse(): Promise<number> {
  let $t1: any;
  let otmp = null;
  let ct = 0;
  let lets = new Int8Array(53);
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (is_worn(otmp) || tool_in_use(otmp)) {
      ($t1 = obj_to_let(otmp), lets[ct++] = $t1);
    }
  }
  lets[ct] = 0;
  if (!ct) {
    await You(S("are not wearing or wielding anything."));
  } else {
    await display_inventory(P(lets), FALSE);
  }
  return 0;
}

export async function useupf(obj: struct_obj | null, numused: number): Promise<void> {
  let otmp = null;
  let at_u = (obj.ox === G.u.ux && obj.oy === G.u.uy ? 1 : 0) << 24 >> 24;
  if (obj.quan > numused) {
    otmp = await splitobj(obj, numused);
  } else {
    otmp = obj;
  }
  if (await costly_spot(otmp.ox, otmp.oy)) {
    if (strchr(P(G.u.urooms), $rd(in_rooms(otmp.ox, otmp.oy, 0)))) {
      await addtobill(otmp, FALSE, FALSE, FALSE);
    } else {
      await stolen_value(otmp, otmp.ox, otmp.oy, FALSE, FALSE);
    }
  }
  await delobj(otmp);
  if (at_u && G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
    hideunder(G.youmonst);
  }
}

export async function let_to_name(let_: number, unpaid: number, showsym: number): Promise<Ptr | null> {
  let ocsymfmt = S("  ('%c')");
  let invbuf_sympadding = 8;
  let class_name = null;
  let pos = null;
  let oclass = let_ >= 1 && let_ < MAXOCLASSES ? let_ : 0;
  let len = 0;
  if (oclass) {
    class_name = names[oclass];
  } else if (!!(pos = strchr(P(oth_symbols), let_))) {
    class_name = oth_names[pos.o - P(oth_symbols).o];
  } else {
    class_name = names[0];
  }
  len = strlen(class_name) + (unpaid ? 8 : 1) + (oclass ? strlen(ocsymfmt) + $u64(invbuf_sympadding) : 0) >>> 0;
  if (len > invbufsiz) {
    if (invbuf) {
      free(invbuf);
    }
    invbufsiz = len + 10 >>> 0;
    invbuf = P(new Int8Array(invbufsiz));
  }
  if (unpaid) {
    strcat(strcpy(invbuf, S("Unpaid ")), class_name);
  } else {
    strcpy(invbuf, class_name);
  }
  if (oclass !== 0 && showsym) {
    let bp = eos(invbuf);
    let mlen = $u64(invbuf_sympadding) - strlen(class_name) | 0;
    while (--mlen > 0) {
      bp.a[bp.o] = 32;
      bp = bp.add(1);
    }
    bp.a[bp.o] = 0;
    sprintf(eos(invbuf), ocsymfmt, G.def_oc_syms[oclass].sym);
  }
  return invbuf;
}

export function free_invbuf(): void {
  if (invbuf) {
    free(invbuf), invbuf = null;
  }
  invbufsiz = 0;
}

export function reassign(): void {
  let i = 0;
  let obj = null;
  let prevobj = null;
  let goldobj = null;
  prevobj = goldobj = null;
  for (obj = G.invent; obj; prevobj = obj, obj = obj.nobj) {
    if (obj.oclass === COIN_CLASS) {
      goldobj = obj;
      if (prevobj) {
        prevobj.nobj = goldobj.nobj;
      } else {
        G.invent = goldobj.nobj;
      }
      break;
    }
  }
  for (obj = G.invent, i = 0; obj; obj = obj.nobj, ++i) {
    obj.invlet = (i < 26 ? 97 + i : i < 52 ? 65 + i - 26 : NOINVSYM) << 24 >> 24;
  }
  if (goldobj) {
    goldobj.invlet = GOLD_SYM;
    goldobj.nobj = G.invent;
    G.invent = goldobj;
  }
  if (i >= 52) {
    i = 52 - 1;
  }
  lastinvnr = i;
}

export async function doorganize(): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let obj = [null];
  let otmp = [null];
  let splitting = [null];
  let bumped = null;
  let ix = 0;
  let cur = 0;
  let trycnt = 0;
  let goldstacks = 0;
  let let_ = 0;
  let lets = new Int8Array(55);
  let qbuf = new Int8Array(128);
  let allowall = new Int8Array(4);
  let objname = null;
  let otmpname = null;
  let adj_type = null;
  let ever_mind = 0;
  let collect = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      lets = new Int8Array(55);
      qbuf = new Int8Array(128);
      allowall = new Int8Array(4);
      ever_mind = FALSE;
      if (!G.invent || G.invent.oclass === COIN_CLASS && G.invent.invlet === GOLD_SYM && !G.invent.nobj) {
        await You(S("aren't carrying anything %s."), !G.invent ? S("to adjust") : S("adjustable"));
        return 0;
      }
      if (!G.flags.invlet_constant) {
        reassign();
      }
      allowall[0] = ALLOW_COUNT;
      allowall[1] = ALL_CLASSES;
      allowall[2] = 0;
      for (goldstacks = 0, otmp[0] = G.invent; otmp[0]; otmp[0] = otmp[0].nobj) {
        if (otmp[0].oclass === COIN_CLASS && (otmp[0].invlet !== GOLD_SYM || ++goldstacks > 1)) {
          allowall[1] = COIN_CLASS;
          allowall[2] = ALL_CLASSES;
          allowall[3] = 0;
          break;
        }
      }
      if (!(obj[0] = await getobj(P(allowall), S("adjust")))) {
        return 0;
      }
      splitting[0] = bumped = null;
      for (otmp[0] = G.invent; otmp[0]; otmp[0] = otmp[0].nobj) {
        if (otmp[0].nobj === obj[0]) {
          if (otmp[0].invlet === obj[0].invlet) {
            splitting[0] = otmp[0];
          }
          break;
        }
      }
      lets[GOLD_INDX] = (obj[0].oclass === COIN_CLASS ? GOLD_SYM : 32) << 24 >> 24;
      for (ix = GOLD_OFFSET, let_ = 97; let_ <= 122; ) {
        ($t2 = ($t1 = let_, let_ = $t1 + 1 << 24 >> 24, $t1), lets[ix++] = $t2);
      }
      for (let_ = 65; let_ <= 90; ) {
        ($t4 = ($t3 = let_, let_ = $t3 + 1 << 24 >> 24, $t3), lets[ix++] = $t4);
      }
      lets[OVRFLW_INDX] = 32;
      lets[55 - 1] = 0;
      if (!G.flags.invlet_constant && (ix = inv_cnt(FALSE)) < 52) {
        lets[ix + (splitting[0] ? 0 : 1)] = 0;
      }
      for (otmp[0] = G.invent; otmp[0]; otmp[0] = otmp[0].nobj) {
        if (otmp[0] !== obj[0] && !await mergable(otmp[0], obj[0])) {
          let_ = otmp[0].invlet;
          if (let_ >= 97 && let_ <= 122) {
            lets[GOLD_OFFSET + let_ - 97] = 32;
          } else if (let_ >= 65 && let_ <= 90) {
            lets[GOLD_OFFSET + let_ - 65 + 26] = 32;
          } else if (let_ === NOINVSYM) {
            lets[OVRFLW_INDX] = NOINVSYM;
          }
        }
      }
      for (ix = cur = 0; lets[ix]; ++ix) {
        if (lets[ix] !== 32 && cur++ < ix) {
          lets[cur - 1] = lets[ix];
        }
      }
      lets[cur] = 0;
      if (cur > 5) {
        compactify(P(lets));
      }
      sprintf(P(qbuf), S("Adjust letter to what [%s]%s?"), P(lets), G.invent ? S(" (? see used letters)") : S(""));
      trycnt = 1;
    case 2:
      let_ = await yn_function(P(qbuf), null, 0);
      if (let_ === 63 || let_ === 42) {
        let_ = await display_used_invlets(splitting[0] ? obj[0].invlet : 0);
        if (!let_) {
          { $g = 3; continue $L; };
        }
        if (let_ === 27) {
          { $g = 1; continue $L; }
        }
      }
      if (!(strchr(P(G.quitchars), let_) || splitting[0] && let_ === obj[0].invlet)) { $g = 6; continue $L; }
    case 1: // noadjust
      if (splitting[0]) {
        await merged(P(splitting, 0), P(obj, 0));
      }
      if (!ever_mind) {
        await pline(S("%s"), G.c_common_strings.c_Never_mind);
      }
      return 0;
      { $g = 5; continue $L; }
    case 6:
      if (let_ === GOLD_SYM && obj[0].oclass !== COIN_CLASS) {
        await pline(S("Only gold coins may be moved into the '%c' slot."), GOLD_SYM);
        ever_mind = TRUE;
        { $g = 1; continue $L; }
      }
    case 5:
      if (letter(let_) && let_ !== 64 || strchr(P(lets), let_) && let_ !== 45) {
        { $g = 4; continue $L; };
      }
      if (trycnt === 5) {
        { $g = 1; continue $L; }
      }
      await pline(S("Select an inventory slot letter."));
    case 3:
      ++trycnt;
      { $g = 2; continue $L; }
    case 4:
      collect = (let_ === obj[0].invlet ? 1 : 0) << 24 >> 24;
      adj_type = collect ? S("Collecting") : !splitting[0] ? S("Moving:") : S("Splitting:");
      await extract_nobj(obj[0], P(G, "invent"));
      for (otmp[0] = G.invent; otmp[0]; ) {
        objname = obj[0].oextra && obj[0].oextra.oname ? obj[0].oextra.oname : null;
        if (collect) {
          otmpname = otmp[0].oextra && otmp[0].oextra.oname ? otmp[0].oextra.oname : null;
          if ((!otmpname || objname && !strcmp(objname, otmpname)) && await merged(P(otmp, 0), P(obj, 0))) {
            adj_type = S("Merging:");
            obj[0] = otmp[0];
            otmp[0] = otmp[0].nobj;
            await extract_nobj(obj[0], P(G, "invent"));
            continue;
          }
        } else if (otmp[0].invlet === let_) {
          if (!splitting[0]) {
            adj_type = S("Swapping:");
            otmp[0].invlet = obj[0].invlet;
          } else {
            if (objname && !obj[0].oartifact) {
              obj[0].oextra.oname = null;
            }
            if (!await mergable(otmp[0], obj[0])) {
              if (objname) {
                obj[0].oextra.oname = objname;
              }
            } else {
              if (objname) {
                free(objname), objname = null;
              }
            }
            if (await merged(P(otmp, 0), P(obj, 0))) {
              adj_type = S("Splitting and merging:");
              obj[0] = otmp[0];
              await extract_nobj(obj[0], P(G, "invent"));
            } else if (inv_cnt(FALSE) >= 52) {
              await merged(P(splitting, 0), P(obj, 0));
              await Your(S("pack is too full."));
              return 0;
            } else {
              bumped = otmp[0];
              await extract_nobj(bumped, P(G, "invent"));
            }
          }
          break;
        }
        otmp[0] = otmp[0].nobj;
      }
      obj[0].invlet = let_;
      obj[0].nobj = G.invent;
      obj[0].where = OBJ_INVENT;
      G.invent = obj[0];
      reorder_invent();
      if (bumped) {
        assigninvlet(bumped);
        bumped.nobj = G.invent;
        bumped.where = OBJ_INVENT;
        G.invent = bumped;
        reorder_invent();
      }
      await prinv(adj_type, obj[0], 0);
      if (bumped) {
        await prinv(S("Moving:"), bumped, 0);
      }
      if (splitting[0]) {
        clear_splitobjs();
      }
      update_inventory();
      return 0;
    }
    break;
  }
}

async function invdisp_nothing(hdr: Ptr | null, txt: Ptr | null): Promise<void> {
  let win = 0;
  let any = new union_any();
  const selected = [null];
  any.$cp(G.zeroany);
  win = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(win);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, hdr, MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
  await G.windowprocs.win_add_menu(win, NO_GLYPH, any, 0, 0, ATR_NONE, txt, MENU_UNSELECTED);
  await G.windowprocs.win_end_menu(win, null);
  if (await G.windowprocs.win_select_menu(win, PICK_NONE, P(selected, 0)) > 0) {
    free(selected[0]);
  }
  await G.windowprocs.win_destroy_nhwindow(win);
  return;
}

function worn_wield_only(obj: struct_obj | null): number {
  return (obj.owornmask !== 0 ? 1 : 0) << 24 >> 24;
}

export async function display_minventory(mon: struct_monst | null, dflags: number, title: Ptr | null): Promise<struct_obj | null> {
  let ret = null;
  let tmp = new Int8Array(128);
  let n = 0;
  const selected = [null];
  selected[0] = null;
  let do_all = (dflags & MINV_ALL) !== 0 ? 1 : 0;
  let incl_hero = do_all && G.u.uswallow | 0 && mon === G.u.ustuck ? 1 : 0;
  let have_inv = !!mon.minvent ? 1 : 0;
  let have_any = have_inv || incl_hero ? 1 : 0;
  let pickings = dflags & MINV_PICKMASK;
  sprintf(P(tmp), S("%s %s:"), s_suffix(await noit_Monnam(mon)), do_all ? S("possessions") : S("armament"));
  if (do_all ? have_any : mon.misc_worn_check || mon.mw ? 1 : 0) {
    G.youmonst.data = mon.data;
    ++G.iflags.suppress_price;
    n = await query_objlist(title ? title : P(tmp), P(mon, "minvent"), INVORDER_SORT | (incl_hero ? INCLUDE_HERO : 0), P(selected, 0), pickings, do_all ? allow_all : worn_wield_only);
    --G.iflags.suppress_price;
    G.youmonst.data = $sat(G.mons, G.u.umonnum);
  } else {
    await invdisp_nothing(title ? title : P(tmp), S("(none)"));
    n = 0;
  }
  if (n > 0) {
    ret = selected[0].item.a_obj;
    free(selected[0]);
  } else {
    ret = null;
  }
  return ret;
}

export async function display_cinventory(obj: struct_obj | null): Promise<struct_obj | null> {
  let ret = null;
  let qbuf = new Int8Array(128);
  let n = 0;
  const selected = [null];
  selected[0] = null;
  await safe_qbuf(P(qbuf), S("Contents of "), S(":"), obj, doname, ansimpleoname, S("that"));
  if (obj.cobj) {
    n = await query_objlist(P(qbuf), P(obj, "cobj"), INVORDER_SORT, P(selected, 0), PICK_NONE, allow_all);
  } else {
    await invdisp_nothing(P(qbuf), S("(empty)"));
    n = 0;
  }
  if (n > 0) {
    ret = selected[0].item.a_obj;
    free(selected[0]);
  } else {
    ret = null;
  }
  obj.cknown = 1;
  return ret;
}

function only_here(obj: struct_obj | null): number {
  return (obj.ox === only.x && obj.oy === only.y ? 1 : 0) << 24 >> 24;
}

export async function display_binventory(x: number, y: number, as_if_seen: number): Promise<number> {
  let obj = null;
  const selected = [null];
  selected[0] = null;
  let n = 0;
  for (n = 0, obj = G.level.buriedobjlist; obj; obj = obj.nobj) {
    if (obj.ox === x && obj.oy === y) {
      if (as_if_seen) {
        obj.dknown = 1;
      }
      ++n;
    }
  }
  if (n) {
    only.x = x << 24 >> 24;
    only.y = y << 24 >> 24;
    if (await query_objlist(S("Things that are buried here:"), P(G.level, "buriedobjlist"), INVORDER_SORT, P(selected, 0), PICK_NONE, only_here) > 0) {
      free(selected[0]);
    }
    only.x = only.y = 0;
  }
  return n;
}

export function $init(): void {
  lastinvnr = 51;
  venom_inv = $ta(Int8Array, 2, [VENOM_CLASS]);
  sortlootmode = 0;
  currencies = [S("Altarian Dollar"),
S("Ankh-Morpork Dollar"),
S("auric"),
S("buckazoid"),
S("cirbozoid"),
S("credit chit"),
S("cubit"),
S("Flanian Pobble Bead"),
S("fretzer"),
S("imperial credit"),
S("Hong Kong Luna Dollar"),
S("kongbuck"),
S("nanite"),
S("quatloo"),
S("simoleon"),
S("solari"),
S("spacebuck"),
S("sporebuck"),
S("Triganic Pu"),
S("woolong"),
S("zorkmid")];
  safeq_xprn_ctx = new struct_xprnctx();
  removeables = $ta(Int8Array, 6, [ARMOR_CLASS, WEAPON_CLASS, RING_CLASS, AMULET_CLASS, TOOL_CLASS]);
  cached_pickinv_win = -1;
  this_type = 0;
  names = [null,
S("Illegal objects"),
S("Weapons"),
S("Armor"),
S("Rings"),
S("Amulets"),
S("Tools"),
S("Comestibles"),
S("Potions"),
S("Scrolls"),
S("Spellbooks"),
S("Wands"),
S("Coins"),
S("Gems/Stones"),
S("Boulders/Statues"),
S("Iron balls"),
S("Chains"),
S("Venoms")];
  oth_symbols = $ta(Int8Array, 2, [CONTAINED_SYM]);
  oth_names = [S("Bagged/Boxed items")];
  invbuf = null;
  invbufsiz = 0;
  only = new struct_nhcoord();
  loot_classify$def_srt_order = $ta(Int8Array, 18, [COIN_CLASS, AMULET_CLASS, RING_CLASS, WAND_CLASS, POTION_CLASS, SCROLL_CLASS, SPBOOK_CLASS, GEM_CLASS, FOOD_CLASS, TOOL_CLASS, WEAPON_CLASS, ARMOR_CLASS, ROCK_CLASS, BALL_CLASS, CHAIN_CLASS]);
  loot_classify$armcat = new Int8Array(8);
  xprname$li = new Int8Array(256);
  display_pickinv$not_carrying_anything = $cs("Not carrying anything", 22);
  dfeature_at$altbuf = new Int8Array(256);
}
