// @ts-nocheck
// NetHack 3.6.7 shknam.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { isok } from './cmd.ts';
import { cvt_sdoor_to_door } from './detect.ts';
import { newsym } from './display.ts';
import { noit_mon_nam } from './do_name.ts';
import { In_mines, Is_special, assign_level, depth, ledger_no } from './dungeon.ts';
import { set_tin_variety } from './eat.ts';
import { panic } from './end.ts';
import { make_engr_at } from './engrave.ts';
import { in_town } from './hack.ts';
import { distmin, highc, letter } from './hacklib.ts';
import { makemon, mkclass, mkmonmoney, mongets, newmextra, set_malign } from './makemon.ts';
import { mkobj_at, mksobj_at } from './mkobj.ts';
import { impossible, pline } from './pline.ts';
import { rn2, rnd } from './rnd.ts';
import { inside_shop } from './shk.ts';
import { rloc } from './teleport.ts';
import { struct_eshk, struct_itp, struct_mkroom, struct_monst, struct_obj, struct_shclass } from './structs.ts';
import { $at2, $peq, $sadd, $sarrOf, $sat, $sdiff, G, P, S, free, memset, sprintf, strcmp, strcpy, strncpy } from './rt/index.ts';
import { AMULET_CLASS, ARMOR_CLASS, BRASS_LANTERN, CORPSE, DUST, D_ISOPEN, D_LOCKED, D_NODOOR, D_SHOP, D_TRAPPED, EGG, ELVEN_CLOAK, FALSE, FOOD_CLASS, GEM_CLASS, HALLUC, HALLUC_RES, HEALTHY_TIN, ICE_BOX, LEATHER_GLOVES, LOW_PM, LUMP_OF_ROYAL_JELLY, MAGIC_LAMP, MAXOCLASSES, MM_ESHK, M_AP_OBJECT, NON_PM, NO_MM_FLAGS, NUM_OBJECTS, OIL_LAMP, PL_NSIZ, PM_LICHEN, PM_SHOPKEEPER, POTION_CLASS, POT_BOOZE, POT_FRUIT_JUICE, POT_FULL_HEALING, POT_HEALING, POT_OIL, POT_WATER, RANDOM_CLASS, RING_CLASS, ROOMOFFSET, SCROLL_CLASS, SCR_FOOD_DETECTION, SDOOR, SHOPBASE, SPBOOK_CLASS, SPE_NOVEL, STRANGE_OBJECT, S_BLOB, S_ELEMENTAL, S_FUNGUS, S_GHOST, S_GOLEM, S_JELLY, S_LIGHT, S_MIMIC, S_PUDDING, S_VORTEX, TALLOW_CANDLE, TIN, TOOL_CLASS, TOUCHSTONE, TRUE, VEGETARIAN_CLASS, VEGGY, WAND_CLASS, WAX_CANDLE, WEAPON_CLASS } from './consts.ts';

let shkliquors: any;
let shkbooks: any;
let shkarmors: any;
let shkwands: any;
let shkrings: any;
let shkfoods: any;
let shkweapons: any;
let shktools: any;
let shklight: any;
let shkgeneral: any;
let shkhealthfoods: any;

function veggy_item(obj: struct_obj | null, otyp: number): number {
  let corpsenm = 0;
  let oclass = 0;
  if (obj) {
    otyp = obj.otyp;
    oclass = obj.oclass;
    corpsenm = obj.corpsenm;
  } else {
    oclass = G.objects[otyp].oc_class;
    corpsenm = PM_LICHEN;
  }
  if (oclass === FOOD_CLASS) {
    if ((G.objects[otyp].oc_material | 0) === VEGGY || otyp === EGG) {
      return TRUE;
    }
    if (otyp === TIN && corpsenm === NON_PM) {
      return (obj.spe === 1 ? 1 : 0) << 24 >> 24;
    }
    if (otyp === TIN || otyp === CORPSE) {
      return (corpsenm >= LOW_PM && ($sat(G.mons, corpsenm).mlet === S_BLOB || $sat(G.mons, corpsenm).mlet === S_JELLY || $sat(G.mons, corpsenm).mlet === S_FUNGUS || $sat(G.mons, corpsenm).mlet === S_VORTEX || $sat(G.mons, corpsenm).mlet === S_LIGHT || $sat(G.mons, corpsenm).mlet === S_ELEMENTAL && $sat(G.mons, corpsenm) !== $sat(G.mons, 150) || $sat(G.mons, corpsenm).mlet === S_GOLEM && $sat(G.mons, corpsenm) !== $sat(G.mons, 251) && $sat(G.mons, corpsenm) !== $sat(G.mons, 249) || $sat(G.mons, corpsenm).mlet === S_GHOST || $sat(G.mons, corpsenm).mlet === S_PUDDING && $sat(G.mons, corpsenm) !== $sat(G.mons, 206)) ? 1 : 0) << 24 >> 24;
    }
  }
  return FALSE;
}

async function shkveg(): Promise<number> {
  let i = 0;
  let j = 0;
  let maxprob = 0;
  let prob = 0;
  let oclass = FOOD_CLASS;
  let ok = new Int32Array(454);
  j = maxprob = 0;
  ok[0] = 0;
  for (i = G.bases[oclass]; i < NUM_OBJECTS; ++i) {
    if (G.objects[i].oc_class !== oclass) {
      break;
    }
    if (veggy_item(null, i)) {
      ok[j++] = i;
      maxprob += G.objects[i].oc_prob;
    }
  }
  if (maxprob < 1) {
    await panic(S("shkveg no veggy objects"));
  }
  prob = rnd(maxprob);
  j = 0;
  i = ok[0];
  while ((prob -= G.objects[i].oc_prob) > 0) {
    ++j;
    i = ok[j];
  }
  if (G.objects[i].oc_class !== oclass || !G.obj_descr[G.objects[i].oc_name_idx].oc_name) {
    await panic(S("shkveg probtype error, oclass=%d i=%d"), oclass, i);
  }
  return i;
}

async function mkveggy_at(sx: number, sy: number): Promise<void> {
  let obj = await mksobj_at(await shkveg(), sx, sy, TRUE, TRUE);
  if (obj && obj.otyp === TIN) {
    set_tin_variety(obj, HEALTHY_TIN);
  }
  return;
}

async function mkshobj_at(shp: struct_shclass | null, sx: number, sy: number, mkspecl: number): Promise<void> {
  let mtmp = null;
  let ptr = null;
  let atype = 0;
  if (mkspecl && (!strcmp(shp.name, S("rare books")) || !strcmp(shp.name, S("second-hand bookstore")))) {
    let novel = await mksobj_at(SPE_NOVEL, sx, sy, FALSE, FALSE);
    if (novel) {
      G.context.tribute.bookstock = (TRUE) & 1;
    }
    return;
  }
  if (rn2(100) < depth(G.u.uz) && !!!G.level.monsters[sx][sy] && !!(ptr = await mkclass(S_MIMIC, 0)) && !!(mtmp = await makemon(ptr, sx, sy, NO_MM_FLAGS))) {
    if (rn2(10) >= depth(G.u.uz)) {
      mtmp.m_ap_type = M_AP_OBJECT;
      mtmp.mappearance = STRANGE_OBJECT;
    }
  } else {
    atype = get_shop_item($sdiff(shp, G.shtypes[0]) | 0);
    if (atype === VEGETARIAN_CLASS) {
      await mkveggy_at(sx, sy);
    } else if (atype < 0) {
      await mksobj_at(-atype, sx, sy, TRUE, TRUE);
    } else {
      await mkobj_at(atype, sx, sy, TRUE);
    }
  }
}

function nameshk(shk: struct_monst | null, nlp: Ptr | null): void {
  let i = 0;
  let trycnt = 0;
  let names_avail = 0;
  let shname = null;
  let mtmp = null;
  let name_wanted = 0;
  let sptr = null;
  if ($peq(nlp, P(shkfoods)) && In_mines(G.u.uz) && G.urole.malenum === 334 && !!(sptr = Is_special(G.u.uz)) && sptr.flags.town | 0) {
    nlp = P(shkhealthfoods);
  }
  if ($peq(nlp, P(shklight)) && In_mines(G.u.uz) && !!(sptr = Is_special(G.u.uz)) && sptr.flags.town | 0) {
    shname = S("+Izchak");
    shk.female = (FALSE) & 1;
  } else {
    let nseed = Math.trunc(G.ubirthday / 257) | 0;
    name_wanted = ledger_no(G.u.uz) + nseed % 13 - nseed % 5;
    if (name_wanted < 0) {
      name_wanted += 13 + 5;
    }
    shk.female = ((name_wanted & 1) >>> 0) & 1;
    for (names_avail = 0; nlp.a[nlp.o + names_avail]; ++names_avail) {
      continue;
    }
    for (trycnt = 0; trycnt < 50; ++trycnt) {
      if ($peq(nlp, P(shktools))) {
        shname = shktools[rn2(names_avail)];
        shk.female = 0;
      } else if (name_wanted < names_avail) {
        shname = nlp.a[nlp.o + name_wanted];
      } else if ((i = rn2(names_avail)) !== 0) {
        shname = nlp.a[nlp.o + (i - 1)];
      } else if (!$peq(nlp, P(shkgeneral))) {
        nlp = P(shkgeneral);
        for (names_avail = 0; nlp.a[nlp.o + names_avail]; ++names_avail) {
          continue;
        }
        continue;
      } else {
        shname = shk.female | 0 ? S("-Lucrezia") : S("+Dirk");
      }
      if (shname.a[shname.o] === 95 || shname.a[shname.o] === 45) {
        shk.female = 1;
      } else if (shname.a[shname.o] === 124 || shname.a[shname.o] === 43) {
        shk.female = 0;
      }
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1 || mtmp === shk || !mtmp.isshk) {
          continue;
        }
        if (strcmp(P(mtmp.mextra.eshk.shknam), shname)) {
          continue;
        }
        break;
      }
      if (!mtmp) {
        break;
      }
    }
  }
  strncpy(P(shk.mextra.eshk.shknam), shname, PL_NSIZ);
  shk.mextra.eshk.shknam[PL_NSIZ - 1] = 0;
}

export async function neweshk(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  if (!mtmp.mextra.eshk) {
    mtmp.mextra.eshk = new struct_eshk();
  }
  memset(mtmp.mextra.eshk, 0, 4936);
  mtmp.mextra.eshk.bill_p = null;
}

export function free_eshk(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.eshk) {
    free(mtmp.mextra.eshk);
    mtmp.mextra.eshk = null;
  }
  mtmp.isshk = 0;
}

async function shkinit(shp: struct_shclass | null, sroom: struct_mkroom | null): Promise<number> {
  let $g = 0;
  let sh = 0;
  let sx = 0;
  let sy = 0;
  let shk = null;
  let eshkp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      sh = sroom.fdoor;
      sx = G.doors[sh].x;
      sy = G.doors[sh].y;
      if (!sroom.irregular) { $g = 3; continue $L; }
      {
        let rmno = $sdiff(sroom, G.rooms[0]) + ROOMOFFSET | 0;
        if (isok(sx - 1, sy) && !$at2(G.level.locations, sx - 1, sy).edge && ($at2(G.level.locations, sx - 1, sy).roomno | 0) === rmno) {
          --sx;
        } else if (isok(sx + 1, sy) && !$at2(G.level.locations, sx + 1, sy).edge && ($at2(G.level.locations, sx + 1, sy).roomno | 0) === rmno) {
          ++sx;
        } else if (isok(sx, sy - 1) && !$at2(G.level.locations, sx, sy - 1).edge && ($at2(G.level.locations, sx, sy - 1).roomno | 0) === rmno) {
          --sy;
        } else if (isok(sx, sy + 1) && !$at2(G.level.locations, sx, sy + 1).edge && ($at2(G.level.locations, sx, sy + 1).roomno | 0) === rmno) {
          ++sy;
        } else {
          { $g = 1; continue $L; }
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(sx === sroom.lx - 1)) { $g = 5; continue $L; }
      {
        ++sx;
      }
      { $g = 4; continue $L; }
    case 5:
      if (!(sx === sroom.hx + 1)) { $g = 7; continue $L; }
      {
        --sx;
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(sy === sroom.ly - 1)) { $g = 9; continue $L; }
      {
        ++sy;
      }
      { $g = 8; continue $L; }
    case 9:
      if (!(sy === sroom.hy + 1)) { $g = 11; continue $L; }
      {
        --sy;
      }
      { $g = 10; continue $L; }
    case 11:
    case 1: // shk_failed
      if (G.flags.debug) {
        let j = sroom.doorct;
        await pline(S("Where is shopdoor?"));
        await pline(S("Room at (%d,%d),(%d,%d)."), sroom.lx, sroom.ly, sroom.hx, sroom.hy);
        await pline(S("doormax=%d doorct=%d fdoor=%d"), G.doorindex, sroom.doorct, sh);
        while (j--) {
          await pline(S("door [%d,%d]"), G.doors[sh].x, G.doors[sh].y);
          ++sh;
        }
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      }
      return -1;
    case 10:
    case 8:
    case 6:
    case 4:
    case 2:
      if (!!G.level.monsters[sx][sy]) {
        await rloc(!!G.level.monsters[sx][sy] ? G.level.monsters[sx][sy] : null, FALSE);
      }
      if (!(shk = await makemon($sat(G.mons, PM_SHOPKEEPER), sx, sy, MM_ESHK))) {
        return -1;
      }
      eshkp = shk.mextra.eshk;
      shk.isshk = (shk.mpeaceful = 1) & 1;
      set_malign(shk);
      shk.msleeping = 0;
      shk.mtrapseen = ~0;
      eshkp.shoproom = $sdiff(sroom, G.rooms[0]) + ROOMOFFSET << 24 >> 24;
      sroom.resident = shk;
      eshkp.shoptype = sroom.rtype;
      assign_level(eshkp.shoplevel, G.u.uz);
      eshkp.shd.$cp(G.doors[sh]);
      eshkp.shk.x = sx << 24 >> 24;
      eshkp.shk.y = sy << 24 >> 24;
      eshkp.robbed = eshkp.credit = eshkp.debit = eshkp.loan = 0;
      eshkp.following = eshkp.surcharge = eshkp.dismiss_kops = FALSE;
      eshkp.billct = eshkp.visitct = 0;
      eshkp.bill_p = null;
      eshkp.customer[0] = 0;
      await mkmonmoney(shk, 1000 + 30 * rnd(100));
      if ($peq(shp.shknms, P(shkrings))) {
        await mongets(shk, TOUCHSTONE);
      }
      nameshk(shk, shp.shknms);
      return sh;
    }
    break;
  }
}

function stock_room_goodpos(sroom: struct_mkroom | null, rmno: number, sh: number, sx: number, sy: number): number {
  if (sroom.irregular) {
    if ($at2(G.level.locations, sx, sy).edge | 0 || ($at2(G.level.locations, sx, sy).roomno | 0) !== rmno || distmin(sx, sy, G.doors[sh].x, G.doors[sh].y) <= 1) {
      return FALSE;
    }
  } else if (sx === sroom.lx && G.doors[sh].x === sx - 1 || sx === sroom.hx && G.doors[sh].x === sx + 1 || sy === sroom.ly && G.doors[sh].y === sy - 1 || sy === sroom.hy && G.doors[sh].y === sy + 1) {
    return FALSE;
  }
  return TRUE;
}

export async function stock_room(shp_indx: number, sroom: struct_mkroom | null): Promise<void> {
  let sx = 0;
  let sy = 0;
  let sh = 0;
  let stockcount = 0;
  let specialspot = 0;
  let buf = new Int8Array(256);
  let rmno = $sdiff(sroom, G.rooms[0]) + ROOMOFFSET | 0;
  let shp = $sat(G.shtypes, shp_indx);
  if ((sh = await shkinit(shp, sroom)) < 0) {
    return;
  }
  sx = G.doors[sroom.fdoor].x;
  sy = G.doors[sroom.fdoor].y;
  if (($at2(G.level.locations, sx, sy).flags | 0) === D_NODOOR) {
    $at2(G.level.locations, sx, sy).flags = (D_ISOPEN) & 31;
    await newsym(sx, sy);
  }
  if ($at2(G.level.locations, sx, sy).typ === SDOOR) {
    cvt_sdoor_to_door($sat(G.level.locations[sx], sy));
    await newsym(sx, sy);
  }
  if (($at2(G.level.locations, sx, sy).flags | 0) & D_TRAPPED) {
    $at2(G.level.locations, sx, sy).flags = (D_LOCKED) & 31;
  }
  if (($at2(G.level.locations, sx, sy).flags | 0) === D_LOCKED) {
    let m = sx;
    let n = sy;
    if (inside_shop(sx + 1, sy)) {
      --m;
    } else if (inside_shop(sx - 1, sy)) {
      ++m;
    }
    if (inside_shop(sx, sy + 1)) {
      --n;
    } else if (inside_shop(sx, sy - 1)) {
      ++n;
    }
    sprintf(P(buf), S("Closed for inventory"));
    await make_engr_at(m, n, P(buf), 0, DUST);
  }
  if (G.context.tribute.enabled && !G.context.tribute.bookstock) {
    for (sx = sroom.lx; sx <= sroom.hx; ++sx) {
      for (sy = sroom.ly; sy <= sroom.hy; ++sy) {
        if (stock_room_goodpos(sroom, rmno, sh, sx, sy)) {
          ++stockcount;
        }
      }
    }
    specialspot = rnd(stockcount);
    stockcount = 0;
  }
  for (sx = sroom.lx; sx <= sroom.hx; ++sx) {
    for (sy = sroom.ly; sy <= sroom.hy; ++sy) {
      if (stock_room_goodpos(sroom, rmno, sh, sx, sy)) {
        ++stockcount;
        await mkshobj_at(shp, sx, sy, stockcount && stockcount === specialspot ? 1 : 0);
      }
    }
  }
  G.level.flags.has_shop = (TRUE) & 1;
}

export function saleable(shkp: struct_monst | null, obj: struct_obj | null): number {
  let i = 0;
  let shp_indx = shkp.mextra.eshk.shoptype - SHOPBASE;
  let shp = $sat(G.shtypes, shp_indx);
  if (shp.symb === RANDOM_CLASS) {
    return TRUE;
  }
  for (i = 0; i < (Math.trunc(48 / 8) | 0) && shp.iprobs[i].iprob; ++i) {
    if (shp.iprobs[i].itype === VEGETARIAN_CLASS) {
      if (veggy_item(obj, 0)) {
        return TRUE;
      }
    } else if (shp.iprobs[i].itype < 0 ? shp.iprobs[i].itype === -obj.otyp ? 1 : 0 : shp.iprobs[i].itype === obj.oclass ? 1 : 0) {
      return TRUE;
    }
  }
  return FALSE;
}

export function get_shop_item(type: number): number {
  let shp = $sadd(G.shtypes[0], type);
  let i = 0;
  let j = 0;
  for (j = rnd(100), i = 0; (j -= shp.iprobs[i].iprob) > 0; ++i) {
    continue;
  }
  return shp.iprobs[i].itype;
}

export async function Shknam(mtmp: struct_monst | null): Promise<Ptr | null> {
  let nam = await shkname(mtmp);
  nam.a[nam.o] = highc(nam.a[nam.o]);
  return nam;
}

export async function shkname(mtmp: struct_monst | null): Promise<Ptr | null> {
  let nam = null;
  let save_isshk = mtmp.isshk;
  mtmp.isshk = 0;
  nam = await noit_mon_nam(mtmp);
  mtmp.isshk = (save_isshk) & 1;
  if (!mtmp.isshk) {
    await impossible(S("shkname: \"%s\" is not a shopkeeper."), nam);
  } else if (!(mtmp.mextra && mtmp.mextra.eshk)) {
    await panic(S("shkname: shopkeeper \"%s\" lacks 'eshk' data."), nam);
  } else {
    let shknm = P(mtmp.mextra.eshk.shknam);
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !G.program_state.gameover) {
      let nlp = null;
      let num = 0;
      for (num = 0; num < (Math.trunc(1040 / 80) | 0); ++num) {
        if (G.shtypes[num].prob === 0) {
          break;
        }
      }
      if (num > 0) {
        nlp = G.shtypes[rn2(num)].shknms;
        for (num = 0; nlp.a[nlp.o + num]; ++num) {
          continue;
        }
        if (num > 0) {
          shknm = nlp.a[nlp.o + rn2(num)];
        }
      }
    }
    if (!letter(shknm.a[shknm.o])) {
      shknm = shknm.add(1);
    }
    strcpy(nam, shknm);
  }
  return nam;
}

export function shkname_is_pname(mtmp: struct_monst | null): number {
  let shknm = P(mtmp.mextra.eshk.shknam);
  return (shknm.a[shknm.o] === 45 || shknm.a[shknm.o] === 43 || shknm.a[shknm.o] === 61 ? 1 : 0) << 24 >> 24;
}

export function is_izchak(shkp: struct_monst | null, override_hallucination: number): number {
  let shknm = null;
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && !override_hallucination) {
    return FALSE;
  }
  if (!shkp.isshk) {
    return FALSE;
  }
  if (!in_town(shkp.mx, shkp.my)) {
    return FALSE;
  }
  shknm = P(shkp.mextra.eshk.shknam);
  if (!letter(shknm.a[shknm.o])) {
    shknm = shknm.add(1);
  }
  return (!strcmp(shknm, S("Izchak")) ? 1 : 0) << 24 >> 24;
}

export function $init(): void {
  shkliquors = [S("Njezjin"),
S("Tsjernigof"),
S("Ossipewsk"),
S("Gorlowka"),
S("Gomel"),
S("Konosja"),
S("Weliki Oestjoeg"),
S("Syktywkar"),
S("Sablja"),
S("Narodnaja"),
S("Kyzyl"),
S("Walbrzych"),
S("Swidnica"),
S("Klodzko"),
S("Raciborz"),
S("Gliwice"),
S("Brzeg"),
S("Krnov"),
S("Hradec Kralove"),
S("Leuk"),
S("Brig"),
S("Brienz"),
S("Thun"),
S("Sarnen"),
S("Burglen"),
S("Elm"),
S("Flims"),
S("Vals"),
S("Schuls"),
S("Zum Loch"),
null];
  shkbooks = [S("Skibbereen"),
S("Kanturk"),
S("Rath Luirc"),
S("Ennistymon"),
S("Lahinch"),
S("Kinnegad"),
S("Lugnaquillia"),
S("Enniscorthy"),
S("Gweebarra"),
S("Kittamagh"),
S("Nenagh"),
S("Sneem"),
S("Ballingeary"),
S("Kilgarvan"),
S("Cahersiveen"),
S("Glenbeigh"),
S("Kilmihil"),
S("Kiltamagh"),
S("Droichead Atha"),
S("Inniscrone"),
S("Clonegal"),
S("Lisnaskea"),
S("Culdaff"),
S("Dunfanaghy"),
S("Inishbofin"),
S("Kesh"),
null];
  shkarmors = [S("Demirci"),
S("Kalecik"),
S("Boyabai"),
S("Yildizeli"),
S("Gaziantep"),
S("Siirt"),
S("Akhalataki"),
S("Tirebolu"),
S("Aksaray"),
S("Ermenak"),
S("Iskenderun"),
S("Kadirli"),
S("Siverek"),
S("Pervari"),
S("Malasgirt"),
S("Bayburt"),
S("Ayancik"),
S("Zonguldak"),
S("Balya"),
S("Tefenni"),
S("Artvin"),
S("Kars"),
S("Makharadze"),
S("Malazgirt"),
S("Midyat"),
S("Birecik"),
S("Kirikkale"),
S("Alaca"),
S("Polatli"),
S("Nallihan"),
null];
  shkwands = [S("Yr Wyddgrug"),
S("Trallwng"),
S("Mallwyd"),
S("Pontarfynach"),
S("Rhaeader"),
S("Llandrindod"),
S("Llanfair-ym-muallt"),
S("Y-Fenni"),
S("Maesteg"),
S("Rhydaman"),
S("Beddgelert"),
S("Curig"),
S("Llanrwst"),
S("Llanerchymedd"),
S("Caergybi"),
S("Nairn"),
S("Turriff"),
S("Inverurie"),
S("Braemar"),
S("Lochnagar"),
S("Kerloch"),
S("Beinn a Ghlo"),
S("Drumnadrochit"),
S("Morven"),
S("Uist"),
S("Storr"),
S("Sgurr na Ciche"),
S("Cannich"),
S("Gairloch"),
S("Kyleakin"),
S("Dunvegan"),
null];
  shkrings = [S("Feyfer"),
S("Flugi"),
S("Gheel"),
S("Havic"),
S("Haynin"),
S("Hoboken"),
S("Imbyze"),
S("Juyn"),
S("Kinsky"),
S("Massis"),
S("Matray"),
S("Moy"),
S("Olycan"),
S("Sadelin"),
S("Svaving"),
S("Tapper"),
S("Terwen"),
S("Wirix"),
S("Ypey"),
S("Rastegaisa"),
S("Varjag Njarga"),
S("Kautekeino"),
S("Abisko"),
S("Enontekis"),
S("Rovaniemi"),
S("Avasaksa"),
S("Haparanda"),
S("Lulea"),
S("Gellivare"),
S("Oeloe"),
S("Kajaani"),
S("Fauske"),
null];
  shkfoods = [S("Djasinga"),
S("Tjibarusa"),
S("Tjiwidej"),
S("Pengalengan"),
S("Bandjar"),
S("Parbalingga"),
S("Bojolali"),
S("Sarangan"),
S("Ngebel"),
S("Djombang"),
S("Ardjawinangun"),
S("Berbek"),
S("Papar"),
S("Baliga"),
S("Tjisolok"),
S("Siboga"),
S("Banjoewangi"),
S("Trenggalek"),
S("Karangkobar"),
S("Njalindoeng"),
S("Pasawahan"),
S("Pameunpeuk"),
S("Patjitan"),
S("Kediri"),
S("Pemboeang"),
S("Tringanoe"),
S("Makin"),
S("Tipor"),
S("Semai"),
S("Berhala"),
S("Tegal"),
S("Samoe"),
null];
  shkweapons = [S("Voulgezac"),
S("Rouffiac"),
S("Lerignac"),
S("Touverac"),
S("Guizengeard"),
S("Melac"),
S("Neuvicq"),
S("Vanzac"),
S("Picq"),
S("Urignac"),
S("Corignac"),
S("Fleac"),
S("Lonzac"),
S("Vergt"),
S("Queyssac"),
S("Liorac"),
S("Echourgnac"),
S("Cazelon"),
S("Eypau"),
S("Carignan"),
S("Monbazillac"),
S("Jonzac"),
S("Pons"),
S("Jumilhac"),
S("Fenouilledes"),
S("Laguiolet"),
S("Saujon"),
S("Eymoutiers"),
S("Eygurande"),
S("Eauze"),
S("Labouheyre"),
null];
  shktools = [S("Ymla"),
S("Eed-morra"),
S("Elan Lapinski"),
S("Cubask"),
S("Nieb"),
S("Bnowr Falr"),
S("Sperc"),
S("Noskcirdneh"),
S("Yawolloh"),
S("Hyeghu"),
S("Niskal"),
S("Trahnil"),
S("Htargcm"),
S("Enrobwem"),
S("Kachzi Rellim"),
S("Regien"),
S("Donmyar"),
S("Yelpur"),
S("Nosnehpets"),
S("Stewe"),
S("Renrut"),
S("Senna Hut"),
S("-Zlaw"),
S("Nosalnef"),
S("Rewuorb"),
S("Rellenk"),
S("Yad"),
S("Cire Htims"),
S("Y-crad"),
S("Nenilukah"),
S("Corsh"),
S("Aned"),
S("Dark Eery"),
S("Niknar"),
S("Lapu"),
S("Lechaim"),
S("Rebrol-nek"),
S("AlliWar Wickson"),
S("Oguhmk"),
S("Telloc Cyaj"),
null];
  shklight = [S("Zarnesti"),
S("Slanic"),
S("Nehoiasu"),
S("Ludus"),
S("Sighisoara"),
S("Nisipitu"),
S("Razboieni"),
S("Bicaz"),
S("Dorohoi"),
S("Vaslui"),
S("Fetesti"),
S("Tirgu Neamt"),
S("Babadag"),
S("Zimnicea"),
S("Zlatna"),
S("Jiu"),
S("Eforie"),
S("Mamaia"),
S("Silistra"),
S("Tulovo"),
S("Panagyuritshte"),
S("Smolyan"),
S("Kirklareli"),
S("Pernik"),
S("Lom"),
S("Haskovo"),
S("Dobrinishte"),
S("Varvara"),
S("Oryahovo"),
S("Troyan"),
S("Lovech"),
S("Sliven"),
null];
  shkgeneral = [S("Hebiwerie"),
S("Possogroenoe"),
S("Asidonhopo"),
S("Manlobbi"),
S("Adjama"),
S("Pakka Pakka"),
S("Kabalebo"),
S("Wonotobo"),
S("Akalapi"),
S("Sipaliwini"),
S("Annootok"),
S("Upernavik"),
S("Angmagssalik"),
S("Aklavik"),
S("Inuvik"),
S("Tuktoyaktuk"),
S("Chicoutimi"),
S("Ouiatchouane"),
S("Chibougamau"),
S("Matagami"),
S("Kipawa"),
S("Kinojevis"),
S("Abitibi"),
S("Maganasipi"),
S("Akureyri"),
S("Kopasker"),
S("Budereyri"),
S("Akranes"),
S("Bordeyri"),
S("Holmavik"),
null];
  shkhealthfoods = [S("Ga'er"),
S("Zhangmu"),
S("Rikaze"),
S("Jiangji"),
S("Changdu"),
S("Linzhi"),
S("Shigatse"),
S("Gyantse"),
S("Ganden"),
S("Tsurphu"),
S("Lhasa"),
S("Tsedong"),
S("Drepung"),
S("=Azura"),
S("=Blaze"),
S("=Breanna"),
S("=Breezy"),
S("=Dharma"),
S("=Feather"),
S("=Jasmine"),
S("=Luna"),
S("=Melody"),
S("=Moonjava"),
S("=Petal"),
S("=Rhiannon"),
S("=Starla"),
S("=Tranquilla"),
S("=Windsong"),
S("=Zennia"),
S("=Zoe"),
S("=Zora"),
null];
  G.shtypes = $sarrOf([struct_shclass.$of(S("general store"), RANDOM_CLASS, 42, D_SHOP, $sarrOf([struct_itp.$of(100, RANDOM_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkgeneral)),
struct_shclass.$of(S("used armor dealership"), ARMOR_CLASS, 14, D_SHOP, $sarrOf([struct_itp.$of(90, ARMOR_CLASS),
struct_itp.$of(10, WEAPON_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkarmors)),
struct_shclass.$of(S("second-hand bookstore"), SCROLL_CLASS, 10, D_SHOP, $sarrOf([struct_itp.$of(90, SCROLL_CLASS),
struct_itp.$of(10, SPBOOK_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkbooks)),
struct_shclass.$of(S("liquor emporium"), POTION_CLASS, 10, D_SHOP, $sarrOf([struct_itp.$of(100, POTION_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkliquors)),
struct_shclass.$of(S("antique weapons outlet"), WEAPON_CLASS, 5, D_SHOP, $sarrOf([struct_itp.$of(90, WEAPON_CLASS),
struct_itp.$of(10, ARMOR_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkweapons)),
struct_shclass.$of(S("delicatessen"), FOOD_CLASS, 5, D_SHOP, $sarrOf([struct_itp.$of(83, FOOD_CLASS),
struct_itp.$of(5, -POT_FRUIT_JUICE),
struct_itp.$of(4, -POT_BOOZE),
struct_itp.$of(5, -POT_WATER),
struct_itp.$of(3, -ICE_BOX),
struct_itp.$of()]), P(shkfoods)),
struct_shclass.$of(S("jewelers"), RING_CLASS, 3, D_SHOP, $sarrOf([struct_itp.$of(85, RING_CLASS),
struct_itp.$of(10, GEM_CLASS),
struct_itp.$of(5, AMULET_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkrings)),
struct_shclass.$of(S("quality apparel and accessories"), WAND_CLASS, 3, D_SHOP, $sarrOf([struct_itp.$of(90, WAND_CLASS),
struct_itp.$of(5, -LEATHER_GLOVES),
struct_itp.$of(5, -ELVEN_CLOAK),
struct_itp.$of(),
new struct_itp(),
new struct_itp()]), P(shkwands)),
struct_shclass.$of(S("hardware store"), TOOL_CLASS, 3, D_SHOP, $sarrOf([struct_itp.$of(100, TOOL_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shktools)),
struct_shclass.$of(S("rare books"), SPBOOK_CLASS, 3, D_SHOP, $sarrOf([struct_itp.$of(90, SPBOOK_CLASS),
struct_itp.$of(10, SCROLL_CLASS),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]), P(shkbooks)),
struct_shclass.$of(S("health food store"), FOOD_CLASS, 2, D_SHOP, $sarrOf([struct_itp.$of(70, MAXOCLASSES + 1),
struct_itp.$of(20, -POT_FRUIT_JUICE),
struct_itp.$of(4, -POT_HEALING),
struct_itp.$of(3, -POT_FULL_HEALING),
struct_itp.$of(2, -SCR_FOOD_DETECTION),
struct_itp.$of(1, -LUMP_OF_ROYAL_JELLY)]), P(shkhealthfoods)),
struct_shclass.$of(S("lighting store"), TOOL_CLASS, 0, D_SHOP, $sarrOf([struct_itp.$of(30, -WAX_CANDLE),
struct_itp.$of(48, -TALLOW_CANDLE),
struct_itp.$of(5, -BRASS_LANTERN),
struct_itp.$of(9, -OIL_LAMP),
struct_itp.$of(3, -MAGIC_LAMP),
struct_itp.$of(5, -POT_OIL)]), P(shklight)),
struct_shclass.$of(null, 0, 0, 0, $sarrOf([struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of(),
struct_itp.$of()]))]);
}
