// @ts-nocheck
// NetHack 3.6.7 o_init.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { disp_artifact_discoveries } from './artifact.ts';
import { exercise } from './attrib.ts';
import { savech, yn_function } from './cmd.ts';
import { docall, objtyp_is_callable } from './do_name.ts';
import { def_char_to_objclass } from './drawing.ts';
import { ledger_no, maxledgerno } from './dungeon.ts';
import { eos, lowc, strkitten, upstart } from './hacklib.ts';
import { let_to_name, update_inventory } from './invent.ts';
import { obj_typename } from './objnam.ts';
import { You, impossible, pline, raw_printf } from './pline.ts';
import { mread } from './restore.ts';
import { rn2 } from './rnd.ts';
import { bwrite } from './save.ts';
import { gem_learned } from './shk.ts';
import { error } from './unixtty.ts';
import { struct_d_level, struct_obj, union_any } from './structs.ts';
import { $cs, $ta, G, P, S, free, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncat, strrchr } from './rt/index.ts';
import { AMULET_CLASS, AMULET_OF_YENDOR, ARMOR_CLASS, ATR_NONE, A_WIS, BELL_OF_OPENING, BUFSZ, CANDELABRUM_OF_INVOCATION, CLOAK_OF_DISPLACEMENT, CLOAK_OF_PROTECTION, FALSE, GAUNTLETS_OF_DEXTERITY, GEM_CLASS, HELMET, HELM_OF_TELEPATHY, IMMEDIATE, LAST_GEM, LEATHER_GLOVES, LEVITATION_BOOTS, MAXOCLASSES, MENU_COMBINATION, MENU_PARTIAL, MENU_TRADITIONAL, MENU_UNSELECTED, NHW_MENU, NODIR, NO_GLYPH, NUM_OBJECTS, PICK_ONE, POTION_CLASS, POT_WATER, RING_CLASS, SCROLL_CLASS, SPBOOK_CLASS, SPEED_BOOTS, SPE_BOOK_OF_THE_DEAD, STRANGE_OBJECT, TRUE, VENOM_CLASS, WAND_CLASS, WAN_NOTHING, WIN_ERR } from './consts.ts';

let disco: any;
let uniq_objs: any;
let shuffle_all$shuffle_classes: any;
let shuffle_all$shuffle_types: any;
let doclassdisco$prompt: any;
let doclassdisco$havent_discovered_any: any;
let doclassdisco$unique_items: any;
let doclassdisco$artifact_items: any;

async function setgemprobs(dlev: struct_d_level | null): Promise<void> {
  let j = 0;
  let first = 0;
  let lev = 0;
  if (dlev) {
    lev = ledger_no(dlev) > maxledgerno() ? maxledgerno() : ledger_no(dlev);
  } else {
    lev = 0;
  }
  first = G.bases[GEM_CLASS];
  for (j = 0; j < 9 - (lev / 3 | 0); ++j) {
    G.objects[first + j].oc_prob = 0;
  }
  first += j;
  if (first > LAST_GEM || G.objects[first].oc_class !== GEM_CLASS || !G.obj_descr[G.objects[first].oc_name_idx].oc_name) {
    raw_printf(S("Not enough gems? - first=%d j=%d LAST_GEM=%d"), first, j, LAST_GEM);
    await G.windowprocs.win_wait_synch();
  }
  for (j = first; j <= LAST_GEM; ++j) {
    G.objects[j].oc_prob = ((171 + j - first) / (LAST_GEM + 1 - first) | 0) << 16 >> 16;
  }
}

function shuffle(o_low: number, o_high: number, domaterial: number): void {
  let i = 0;
  let j = 0;
  let num_to_shuffle = 0;
  let sw = 0;
  let color = 0;
  for (num_to_shuffle = 0, j = o_low; j <= o_high; ++j) {
    if (!G.objects[j].oc_name_known) {
      ++num_to_shuffle;
    }
  }
  if (num_to_shuffle < 2) {
    return;
  }
  for (j = o_low; j <= o_high; ++j) {
    if (G.objects[j].oc_name_known) {
      continue;
    }
    do {
      i = j + rn2(o_high - j + 1);
    } while (G.objects[i].oc_name_known);
    sw = G.objects[j].oc_descr_idx;
    G.objects[j].oc_descr_idx = G.objects[i].oc_descr_idx;
    G.objects[i].oc_descr_idx = sw;
    sw = G.objects[j].oc_tough << 16 >> 16;
    G.objects[j].oc_tough = (G.objects[i].oc_tough) & 1;
    G.objects[i].oc_tough = (sw >>> 0) & 1;
    color = G.objects[j].oc_color;
    G.objects[j].oc_color = G.objects[i].oc_color;
    G.objects[i].oc_color = color & 0xff;
    if (domaterial) {
      sw = G.objects[j].oc_material << 16 >> 16;
      G.objects[j].oc_material = (G.objects[i].oc_material) & 31;
      G.objects[i].oc_material = (sw >>> 0) & 31;
    }
  }
}

export async function init_objects(): Promise<void> {
  let $g = 0;
  let i = 0;
  let first = 0;
  let last = 0;
  let sum = 0;
  let oclass = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      for (i = 0; i < MAXOCLASSES; ++i) {
        G.bases[i] = 0;
      }
      for (i = 0; i < NUM_OBJECTS; ++i) {
        G.objects[i].oc_name_idx = G.objects[i].oc_descr_idx = i << 16 >> 16;
      }
      first = 0;
    case 2:
      if (!(first < NUM_OBJECTS)) { $g = 3; continue $L; }
      oclass = G.objects[first].oc_class;
      last = first + 1;
      while (last < NUM_OBJECTS && G.objects[last].oc_class === oclass) {
        ++last;
      }
      G.bases[oclass] = first;
      if (oclass === GEM_CLASS) {
        await setgemprobs(null);
        if (rn2(2)) {
          G.objects[419].oc_descr_idx = G.objects[416].oc_descr_idx, G.objects[419].oc_color = G.objects[416].oc_color;
        }
        if (rn2(2)) {
          G.objects[421].oc_descr_idx = G.objects[416].oc_descr_idx, G.objects[421].oc_color = G.objects[416].oc_color;
        }
        switch (rn2(4)) {
        case 0:
          break;
        case 1:
          G.objects[430].oc_descr_idx = G.objects[416].oc_descr_idx, G.objects[430].oc_color = G.objects[416].oc_color;
          break;
        case 2:
          G.objects[430].oc_descr_idx = G.objects[413].oc_descr_idx, G.objects[430].oc_color = G.objects[413].oc_color;
          break;
        case 3:
          G.objects[430].oc_descr_idx = G.objects[418].oc_descr_idx, G.objects[430].oc_color = G.objects[418].oc_color;
          break;
        }
      }
    case 1: // check
      sum = 0;
      for (i = first; i < last; ++i) {
        sum += G.objects[i].oc_prob;
      }
      if (sum === 0) {
        for (i = first; i < last; ++i) {
          G.objects[i].oc_prob = ((1000 + i - first) / (last - first) | 0) << 16 >> 16;
        }
        { $g = 1; continue $L; }
      }
      if (sum !== 1000) {
        await error(S("init-prob error for class %d (%d%%)"), oclass, sum);
      }
      first = last;
      { $g = 2; continue $L; }
    case 3:
      shuffle_all();
      G.objects[WAN_NOTHING].oc_dir = ((rn2(2) ? NODIR : IMMEDIATE) >>> 0) & 3;
    }
    break;
  }
}

export function obj_shuffle_range(otyp: number, lo_p: Ptr | null, hi_p: Ptr | null): void {
  let i = 0;
  let ocls = G.objects[otyp].oc_class;
  lo_p.a[lo_p.o] = hi_p.a[hi_p.o] = otyp;
  switch (ocls) {
  case ARMOR_CLASS:
    if (otyp >= HELMET && otyp <= HELM_OF_TELEPATHY) {
      lo_p.a[lo_p.o] = HELMET, hi_p.a[hi_p.o] = HELM_OF_TELEPATHY;
    } else if (otyp >= LEATHER_GLOVES && otyp <= GAUNTLETS_OF_DEXTERITY) {
      lo_p.a[lo_p.o] = LEATHER_GLOVES, hi_p.a[hi_p.o] = GAUNTLETS_OF_DEXTERITY;
    } else if (otyp >= CLOAK_OF_PROTECTION && otyp <= CLOAK_OF_DISPLACEMENT) {
      lo_p.a[lo_p.o] = CLOAK_OF_PROTECTION, hi_p.a[hi_p.o] = CLOAK_OF_DISPLACEMENT;
    } else if (otyp >= SPEED_BOOTS && otyp <= LEVITATION_BOOTS) {
      lo_p.a[lo_p.o] = SPEED_BOOTS, hi_p.a[hi_p.o] = LEVITATION_BOOTS;
    }
    break;
  case POTION_CLASS:
    lo_p.a[lo_p.o] = G.bases[POTION_CLASS];
    hi_p.a[hi_p.o] = POT_WATER - 1;
    break;
  case AMULET_CLASS:
  case SCROLL_CLASS:
  case SPBOOK_CLASS:
    lo_p.a[lo_p.o] = G.bases[ocls];
    for (i = lo_p.a[lo_p.o]; G.objects[i].oc_class === ocls; ++i) {
      if (G.objects[i].oc_unique | 0 || !G.objects[i].oc_magic) {
        break;
      }
    }
    hi_p.a[hi_p.o] = i - 1;
    break;
  case RING_CLASS:
  case WAND_CLASS:
  case VENOM_CLASS:
    lo_p.a[lo_p.o] = G.bases[ocls];
    for (i = lo_p.a[lo_p.o]; G.objects[i].oc_class === ocls; ++i) {
      continue;
    }
    hi_p.a[hi_p.o] = i - 1;
    break;
  }
  if (otyp < lo_p.a[lo_p.o] || otyp > hi_p.a[hi_p.o]) {
    lo_p.a[lo_p.o] = hi_p.a[hi_p.o] = otyp;
  }
  return;
}

function shuffle_all(): void {
  const first = new Int32Array(1);
  const last = new Int32Array(1);
  let idx = 0;
  for (idx = 0; idx < (Math.trunc(7 / 1) | 0); ++idx) {
    obj_shuffle_range(G.bases[shuffle_all$shuffle_classes[idx]], P(first, 0), P(last, 0));
    shuffle(first[0], last[0], TRUE);
  }
  for (idx = 0; idx < (Math.trunc(8 / 2) | 0); ++idx) {
    obj_shuffle_range(shuffle_all$shuffle_types[idx], P(first, 0), P(last, 0));
    shuffle(first[0], last[0], FALSE);
  }
  return;
}

export async function find_skates(): Promise<number> {
  let i = 0;
  let s = null;
  for (i = SPEED_BOOTS; i <= LEVITATION_BOOTS; ++i) {
    if (!!(s = G.obj_descr[G.objects[i].oc_descr_idx].oc_descr) && !strcmp(s, S("snow boots"))) {
      return i;
    }
  }
  await impossible(S("snow boots not found?"));
  return -1;
}

export async function oinit(): Promise<void> {
  await setgemprobs(G.u.uz);
}

export async function savenames(fd: number, mode: number): Promise<void> {
  let i = 0;
  const len = new Uint32Array(1);
  if (mode & (1 | 2)) {
    await bwrite(fd, P(G.bases), 72);
    await bwrite(fd, P(disco), 908);
    await bwrite(fd, G.objects[0], 40 * NUM_OBJECTS);
  }
  for (i = 0; i < NUM_OBJECTS; ++i) {
    if (G.objects[i].oc_uname) {
      if (mode & (1 | 2)) {
        len[0] = strlen(G.objects[i].oc_uname) + 1 >>> 0;
        await bwrite(fd, P(len, 0), 4);
        await bwrite(fd, G.objects[i].oc_uname, len[0]);
      }
      if (mode & 4) {
        free(G.objects[i].oc_uname);
        G.objects[i].oc_uname = null;
      }
    }
  }
}

export async function restnames(fd: number): Promise<void> {
  let i = 0;
  const len = new Uint32Array(1);
  await mread(fd, P(G.bases), 72);
  await mread(fd, P(disco), 908);
  await mread(fd, G.objects[0], 40 * NUM_OBJECTS);
  for (i = 0; i < NUM_OBJECTS; ++i) {
    if (G.objects[i].oc_uname) {
      await mread(fd, P(len, 0), 4);
      G.objects[i].oc_uname = P(new Int8Array(len[0]));
      await mread(fd, G.objects[i].oc_uname, len[0]);
    }
  }
}

export async function discover_object(oindx: number, mark_as_known: number, credit_hero: number): Promise<void> {
  if (!G.objects[oindx].oc_name_known) {
    let dindx = 0;
    let acls = G.objects[oindx].oc_class;
    for (dindx = G.bases[acls]; disco[dindx] !== 0; ++dindx) {
      if (disco[dindx] === oindx) {
        break;
      }
    }
    disco[dindx] = oindx << 16 >> 16;
    if (mark_as_known) {
      G.objects[oindx].oc_name_known = 1;
      if (credit_hero) {
        await exercise(A_WIS, TRUE);
      }
    }
    if (G.moves > 1 && !G.program_state.gameover) {
      if (G.objects[oindx].oc_class === GEM_CLASS) {
        await gem_learned(oindx);
      }
      update_inventory();
    }
  }
}

export async function undiscover_object(oindx: number): Promise<void> {
  if (!G.objects[oindx].oc_name_known) {
    let dindx = 0;
    let acls = G.objects[oindx].oc_class;
    let found = FALSE;
    for (dindx = G.bases[acls]; dindx < NUM_OBJECTS && disco[dindx] !== 0 && G.objects[dindx].oc_class === acls; ++dindx) {
      if (found) {
        disco[dindx - 1] = disco[dindx];
      } else if (disco[dindx] === oindx) {
        found = TRUE;
      }
    }
    if (found) {
      disco[dindx - 1] = 0;
    } else {
      await impossible(S("named object not in disco"));
    }
    if (G.objects[oindx].oc_class === GEM_CLASS) {
      await gem_learned(oindx);
    }
    update_inventory();
  }
}

function interesting_to_discover(i: number): number {
  return (!!G.objects[i].oc_uname || G.objects[i].oc_name_known | 0 && !!G.obj_descr[G.objects[i].oc_descr_idx].oc_descr ? 1 : 0) << 24 >> 24;
}

async function disco_append_typename(buf: Ptr | null, dis: number): Promise<void> {
  let len = strlen(buf) >>> 0;
  let p = null;
  let typnm = await obj_typename(dis);
  if (len + (strlen(typnm) >>> 0) >>> 0 < BUFSZ) {
    strcat(buf, typnm);
  } else if (!!(p = strrchr(typnm, 40)) && p.o > typnm.o && p.a[p.o + -1] === 32 && !!strchr(p, 41)) {
    p = p.add(-1);
    strncat(buf, typnm, BUFSZ - 1 - (len + (strlen(p) >>> 0) >>> 0) >>> 0);
    strcat(buf, p);
  } else {
    strncat(buf, typnm, BUFSZ - 1 - len >>> 0);
  }
}

export async function dodiscovered(): Promise<number> {
  let i = 0;
  let dis = 0;
  let ct = 0;
  let s = null;
  let oclass = 0;
  let prev_class = 0;
  let classes = new Int8Array(18);
  let buf = new Int8Array(256);
  let tmpwin = 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_putstr(tmpwin, 0, S("Discoveries"));
  await G.windowprocs.win_putstr(tmpwin, 0, S(""));
  for (i = dis = 0; i < (Math.trunc(8 / 2) | 0); ++i) {
    if (G.objects[uniq_objs[i]].oc_name_known) {
      if (!dis++) {
        await G.windowprocs.win_putstr(tmpwin, G.iflags.menu_headings, S("Unique items"));
      }
      sprintf(P(buf), S("  %s"), G.obj_descr[G.objects[uniq_objs[i]].oc_name_idx].oc_name);
      await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
      ++ct;
    }
  }
  ct += await disp_artifact_discoveries(tmpwin);
  strcpy(P(classes), P(G.flags.inv_order));
  if (!strchr(P(classes), VENOM_CLASS)) {
    strkitten(P(classes), VENOM_CLASS);
  }
  for (s = P(classes); s.a[s.o]; s = s.add(1)) {
    oclass = s.a[s.o];
    prev_class = oclass + 1 << 24 >> 24;
    for (i = G.bases[oclass]; i < NUM_OBJECTS && G.objects[i].oc_class === oclass; ++i) {
      if ((dis = disco[i]) !== 0 && interesting_to_discover(dis)) {
        ++ct;
        if (oclass !== prev_class) {
          await G.windowprocs.win_putstr(tmpwin, G.iflags.menu_headings, await let_to_name(oclass, FALSE, FALSE));
          prev_class = oclass;
        }
        strcpy(P(buf), G.objects[dis].oc_pre_discovered | 0 ? S("* ") : S("  "));
        await disco_append_typename(P(buf), dis);
        await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
      }
    }
  }
  if (ct === 0) {
    await You(S("haven't discovered anything yet..."));
  } else {
    await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  return 0;
}

async function oclass_to_name(oclass: number, buf: Ptr | null): Promise<Ptr | null> {
  let s = null;
  strcpy(buf, await let_to_name(oclass, FALSE, FALSE));
  for (s = buf; s.a[s.o]; s = s.add(1)) {
    s.a[s.o] = lowc(s.a[s.o]);
  }
  return buf;
}

export async function doclassdisco(): Promise<number> {
  let $t1: any, $t2: any, $t3: any;
  let s = null;
  let c = 0;
  let oclass = 0;
  let menulet = 0;
  let allclasses = new Int8Array(18);
  let discosyms = new Int8Array(21);
  let buf = new Int8Array(256);
  let i = 0;
  let ct = 0;
  let dis = 0;
  let xtras = 0;
  let traditional = 0;
  let tmpwin = WIN_ERR;
  let any = new union_any();
  const pick_list = [null];
  pick_list[0] = null;
  discosyms[0] = 0;
  traditional = (G.flags.menu_style === MENU_TRADITIONAL || G.flags.menu_style === MENU_COMBINATION ? 1 : 0) << 24 >> 24;
  if (!traditional) {
    tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
    await G.windowprocs.win_start_menu(tmpwin);
  }
  any.$cp(G.zeroany);
  menulet = 97;
  for (i = 0; i < (Math.trunc(8 / 2) | 0); ++i) {
    if (G.objects[uniq_objs[i]].oc_name_known) {
      strcat(P(discosyms), S("u"));
      if (!traditional) {
        any.a_int = 117;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, ($t1 = menulet, menulet = $t1 + 1 << 24 >> 24, $t1), 0, ATR_NONE, P(doclassdisco$unique_items), MENU_UNSELECTED);
      }
      break;
    }
  }
  if (await disp_artifact_discoveries(WIN_ERR) > 0) {
    strcat(P(discosyms), S("a"));
    if (!traditional) {
      any.a_int = 97;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, ($t2 = menulet, menulet = $t2 + 1 << 24 >> 24, $t2), 0, ATR_NONE, P(doclassdisco$artifact_items), MENU_UNSELECTED);
    }
  }
  strcpy(P(allclasses), P(G.flags.inv_order));
  if (!strchr(P(allclasses), VENOM_CLASS)) {
    strkitten(P(allclasses), VENOM_CLASS);
  }
  for (s = P(allclasses); s.a[s.o]; s = s.add(1)) {
    oclass = s.a[s.o];
    c = G.def_oc_syms[oclass].sym;
    for (i = G.bases[oclass]; i < NUM_OBJECTS && G.objects[i].oc_class === oclass; ++i) {
      if ((dis = disco[i]) !== 0 && interesting_to_discover(dis)) {
        if (!strchr(P(discosyms), c)) {
          sprintf(eos(P(discosyms)), S("%c"), c);
          if (!traditional) {
            any.a_int = c;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, ($t3 = menulet, menulet = $t3 + 1 << 24 >> 24, $t3), c, ATR_NONE, await oclass_to_name(oclass, P(buf)), MENU_UNSELECTED);
          }
        }
      }
    }
  }
  if (!discosyms[0]) {
    await You(P(doclassdisco$havent_discovered_any), S("items"));
    if (tmpwin !== WIN_ERR) {
      await G.windowprocs.win_destroy_nhwindow(tmpwin);
    }
    return 0;
  }
  c = 0;
  if (traditional) {
    for (s = P(allclasses), xtras = 0; s.a[s.o]; s = s.add(1)) {
      c = G.def_oc_syms[s.a[s.o]].sym;
      if (!strchr(P(discosyms), c)) {
        if (!xtras++) {
          strkitten(P(discosyms), 27);
        }
        strkitten(P(discosyms), c);
      }
    }
    c = await yn_function(P(doclassdisco$prompt), P(discosyms), 0);
    savech(c);
    if (!c) {
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    }
  } else {
    if (!discosyms[1] && G.flags.menu_style === MENU_PARTIAL) {
      c = discosyms[0];
    } else {
      await G.windowprocs.win_end_menu(tmpwin, P(doclassdisco$prompt));
      i = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(pick_list, 0));
      if (i > 0) {
        c = pick_list[0].item.a_int << 24 >> 24;
        free(pick_list[0]);
      }
    }
    await G.windowprocs.win_destroy_nhwindow(tmpwin);
  }
  if (!c) {
    return 0;
  }
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  ct = 0;
  switch (c) {
  case 117:
    await G.windowprocs.win_putstr(tmpwin, G.iflags.menu_headings, upstart(strcpy(P(buf), P(doclassdisco$unique_items))));
    for (i = 0; i < (Math.trunc(8 / 2) | 0); ++i) {
      if (G.objects[uniq_objs[i]].oc_name_known) {
        sprintf(P(buf), S("  %s"), G.obj_descr[G.objects[uniq_objs[i]].oc_name_idx].oc_name);
        await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
        ++ct;
      }
    }
    if (!ct) {
      await You(P(doclassdisco$havent_discovered_any), P(doclassdisco$unique_items));
    }
    break;
  case 97:
    ct = await disp_artifact_discoveries(tmpwin);
    if (!ct) {
      await You(P(doclassdisco$havent_discovered_any), P(doclassdisco$artifact_items));
    }
    break;
  default:
    oclass = def_char_to_objclass(c) << 24 >> 24;
    sprintf(P(buf), S("Discovered %s"), await let_to_name(oclass, FALSE, FALSE));
    await G.windowprocs.win_putstr(tmpwin, G.iflags.menu_headings, P(buf));
    for (i = G.bases[oclass]; i < NUM_OBJECTS && G.objects[i].oc_class === oclass; ++i) {
      if ((dis = disco[i]) !== 0 && interesting_to_discover(dis)) {
        strcpy(P(buf), G.objects[dis].oc_pre_discovered | 0 ? S("* ") : S("  "));
        await disco_append_typename(P(buf), dis);
        await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
        ++ct;
      }
    }
    if (!ct) {
      await You(P(doclassdisco$havent_discovered_any), await oclass_to_name(oclass, P(buf)));
    }
    break;
  }
  if (ct) {
    await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  return 0;
}

export async function rename_disco(): Promise<void> {
  let i = 0;
  let dis = 0;
  let ct = 0;
  let mn = 0;
  let sl = 0;
  let s = null;
  let oclass = 0;
  let prev_class = 0;
  let tmpwin = 0;
  let any = new union_any();
  const selected = [null];
  selected[0] = null;
  any.$cp(G.zeroany);
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  for (s = P(G.flags.inv_order); s.a[s.o]; s = s.add(1)) {
    oclass = s.a[s.o];
    prev_class = oclass + 1 << 24 >> 24;
    for (i = G.bases[oclass]; i < NUM_OBJECTS && G.objects[i].oc_class === oclass; ++i) {
      dis = disco[i];
      if (!dis || !interesting_to_discover(dis)) {
        continue;
      }
      ++ct;
      if (!objtyp_is_callable(dis)) {
        continue;
      }
      ++mn;
      if (oclass !== prev_class) {
        any.a_int = 0;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, await let_to_name(oclass, FALSE, FALSE), MENU_UNSELECTED);
        prev_class = oclass;
      }
      any.a_int = dis;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, await obj_typename(dis), MENU_UNSELECTED);
    }
  }
  if (ct === 0) {
    await You(S("haven't discovered anything yet..."));
  } else if (mn === 0) {
    await pline(S("None of your discoveries can be assigned names..."));
  } else {
    await G.windowprocs.win_end_menu(tmpwin, S("Pick an object type to name"));
    dis = STRANGE_OBJECT;
    sl = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0));
    if (sl > 0) {
      dis = selected[0].item.a_int;
      free(selected[0]);
    }
    if (dis !== STRANGE_OBJECT) {
      let odummy = new struct_obj();
      odummy.$cp(G.zeroobj);
      odummy.otyp = dis << 16 >> 16;
      odummy.oclass = G.objects[dis].oc_class;
      odummy.quan = 1;
      odummy.known = ((!G.objects[dis].oc_uses_known ? 1 : 0) >>> 0) & 1;
      odummy.dknown = 1;
      await docall(odummy);
    }
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  return;
}

export function $init(): void {
  disco = new Int16Array(454);
  uniq_objs = $ta(Int16Array, 4, [AMULET_OF_YENDOR, SPE_BOOK_OF_THE_DEAD, CANDELABRUM_OF_INVOCATION, BELL_OF_OPENING]);
  shuffle_all$shuffle_classes = $ta(Int8Array, 7, [AMULET_CLASS, POTION_CLASS, RING_CLASS, SCROLL_CLASS, SPBOOK_CLASS, WAND_CLASS, VENOM_CLASS]);
  shuffle_all$shuffle_types = $ta(Int16Array, 4, [HELMET, LEATHER_GLOVES, CLOAK_OF_PROTECTION, SPEED_BOOTS]);
  doclassdisco$prompt = $cs("View discoveries for which sort of objects?", 44);
  doclassdisco$havent_discovered_any = $cs("haven't discovered any %s yet.", 31);
  doclassdisco$unique_items = $cs("unique items", 13);
  doclassdisco$artifact_items = $cs("artifacts", 10);
}
