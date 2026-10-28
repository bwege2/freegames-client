// @ts-nocheck
// NetHack 3.6.7 botl.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr, fmt_ptr } from './alloc.ts';
import { acurr } from './attrib.ts';
import { In_quest, depth, dunlev, endgamelevelname, on_level } from './dungeon.ts';
import { panic } from './end.ts';
import { newuexp } from './exper.ts';
import { money_cnt, near_capacity } from './hack.ts';
import { digit, eos, fuzzymatch, highc, lowc, mungspaces, sgn, strNsubst, stripchars, strncmpi, strstri, strsubst, trimspaces } from './hacklib.ts';
import { encglyph } from './mapglyph.ts';
import { clr2colorname, match_str2attr, match_str2clr, query_attr, query_color } from './options.ts';
import { config_error_add, impossible, pline } from './pline.ts';
import { struct__cond_map, struct__status_hilite_line_str, struct_condmap, struct_fieldid_t, struct_hilite_s, struct_istat_s, union_any } from './structs.ts';
import { $arr, $at2, $cs, $peq, $rd, $sadd, $sarr, $sarrOf, $sat, $u64, $wr, G, P, S, atoi, atol, free, memset, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncpy } from './rt/index.ts';
import { ANY_INT, ANY_IPTR, ANY_LONG, ANY_LPTR, ANY_MASK32, ANY_STR, ANY_UINT, ANY_ULONG, ANY_ULPTR, ANY_UPTR, ATR_BLINK, ATR_BOLD, ATR_DIM, ATR_INVERSE, ATR_NONE, ATR_ULINE, A_CHA, A_CHAOTIC, A_CON, A_DEX, A_INT, A_NEUTRAL, A_STR, A_WIS, BLINDED, BL_AC, BL_ALIGN, BL_CAP, BL_CH, BL_CHARACTERISTICS, BL_CO, BL_CONDITION, BL_DX, BL_ENE, BL_ENEMAX, BL_EXP, BL_FLUSH, BL_GOLD, BL_HD, BL_HP, BL_HPMAX, BL_HUNGER, BL_IN, BL_LEVELDESC, BL_MASK_BLIND, BL_MASK_CONF, BL_MASK_DEAF, BL_MASK_FLY, BL_MASK_FOODPOIS, BL_MASK_HALLU, BL_MASK_LEV, BL_MASK_RIDE, BL_MASK_SLIME, BL_MASK_STONE, BL_MASK_STRNGL, BL_MASK_STUN, BL_MASK_TERMILL, BL_RESET, BL_SCORE, BL_STR, BL_TH_ALWAYS_HILITE, BL_TH_CONDITION, BL_TH_NONE, BL_TH_TEXTMATCH, BL_TH_UPDOWN, BL_TH_VAL_ABSOLUTE, BL_TH_VAL_PERCENTAGE, BL_TIME, BL_TITLE, BL_WI, BL_XP, BUFSZ, CLR_MAX, COIN_CLASS, COLNO, CONFUSION, DEAF, EQ_VALUE, FALSE, FLYING, GE_VALUE, GT_VALUE, HALLUC, HALLUC_RES, HL_ATTCLR_BLINK, HL_ATTCLR_BOLD, HL_ATTCLR_DIM, HL_ATTCLR_INVERSE, HL_ATTCLR_ULINE, HL_BLINK, HL_BOLD, HL_DIM, HL_INVERSE, HL_NONE, HL_ULINE, HL_UNDEF, LARGEST_INT, LEVITATION, LE_VALUE, LONG_MAX, LT_VALUE, MAXBLSTATS, MAXCO, MAX_SUBFIELDS, MAX_THRESH, MENU_UNSELECTED, NHW_MENU, NHW_TEXT, NON_PM, NOT_HUNGRY, NO_COLOR, NO_GLYPH, NO_LTEQGT, OVERLOADED, PICK_ANY, PICK_ONE, QBUFSZ, SATIATED, SICK, SICK_NONVOMITABLE, SICK_VOMITABLE, SLIMED, SLT_ENCUMBER, STARVED, STONED, STRANGLED, STUNNED, SYM_OFF_O, TRUE, TXT_VALUE, UNENCUMBERED, WC2_FLUSH_STATUS, WC2_RESET_STATUS } from './consts.ts';

let mrank_sz: number;
let initblstats: any;
let blinit: number;
let update_all: number;
let valset: any;
let bl_hilite_moves: number;
let cond_hilites: any;
let now_or_before_idx: number;
let fieldids_alias: any;
let threshold_value: any;
let is_out_of_range: any;
let status_hilite_str: struct__status_hilite_line_str | null;
let status_hilite_str_id: number;
let get_strength_str$buf: any;
let do_statusline1$newbot1: any;
let do_statusline2$newbot2: any;
let do_statusline2$dloc: any;
let do_statusline2$hlth: any;
let do_statusline2$expr: any;
let do_statusline2$tmmv: any;
let do_statusline2$cond: any;
let eval_notify_windowport_field$oldrndencode: number;
let eval_notify_windowport_field$oldgoldsym: number;
let init_blstats$initalready: number;
let splitsubfields$subfields: any;
let parse_status_hl2$aligntxt: any;
let parse_status_hl2$hutxt: any;
let conditionbitmask2str$buf: any;
let status_hilite2str$buf: any;
let status_hilite_menu_add$aligntxt: any;
let status_hilite_menu_add$hutxt: any;

function get_strength_str(): Ptr | null {
  let st = acurr(A_STR);
  if (st > 18) {
    if (st > 18 + 100) {
      sprintf(P(get_strength_str$buf), S("%2d"), st - 100);
    } else if (st < 18 + 100) {
      sprintf(P(get_strength_str$buf), S("18/%02d"), st - 18);
    } else {
      sprintf(P(get_strength_str$buf), S("18/**"));
    }
  } else {
    sprintf(P(get_strength_str$buf), S("%-1d"), st);
  }
  return P(get_strength_str$buf);
}

export function check_gold_symbol(): void {
  let goldch = G.showsyms[COIN_CLASS + SYM_OFF_O];
  G.iflags.invis_goldsym = (goldch <= 32 ? 1 : 0) << 24 >> 24;
}

export function do_statusline1(): Ptr | null {
  let nb = null;
  let i = 0;
  let j = 0;
  strcpy(P(do_statusline1$newbot1), P(G.plname));
  if (97 <= do_statusline1$newbot1[0] && do_statusline1$newbot1[0] <= 122) {
    do_statusline1$newbot1[0] += 65 - 97;
  }
  do_statusline1$newbot1[10] = 0;
  sprintf(nb = eos(P(do_statusline1$newbot1)), S(" the "));
  if (G.u.umonnum !== G.u.umonster) {
    let mbot = new Int8Array(256);
    let k = 0;
    strcpy(P(mbot), G.mons[G.u.umonnum].mname);
    while (mbot[k] !== 0) {
      if ((k === 0 || k > 0 && mbot[k - 1] === 32) && 97 <= mbot[k] && mbot[k] <= 122) {
        mbot[k] += 65 - 97;
      }
      ++k;
    }
    strcpy(nb = eos(nb), P(mbot));
  } else {
    strcpy(nb = eos(nb), rank());
  }
  sprintf(nb = eos(nb), S("  "));
  i = mrank_sz + 15;
  j = nb.add(2).o - P(do_statusline1$newbot1).o | 0;
  if (i - j > 0) {
    sprintf(nb = eos(nb), S("%*s"), i - j, S(" "));
  }
  sprintf(nb = eos(nb), S("St:%s Dx:%-1d Co:%-1d In:%-1d Wi:%-1d Ch:%-1d"), get_strength_str(), acurr(A_DEX), acurr(A_CON), acurr(A_INT), acurr(A_WIS), acurr(A_CHA));
  sprintf(nb = eos(nb), G.u.ualign.type === A_CHAOTIC ? S("  Chaotic") : G.u.ualign.type === A_NEUTRAL ? S("  Neutral") : S("  Lawful"));
  return P(do_statusline1$newbot1);
}

export async function do_statusline2(): Promise<Ptr | null> {
  let nb = null;
  let dln = 0;
  let dx = 0;
  let hln = 0;
  let xln = 0;
  let tln = 0;
  let cln = 0;
  let hp = 0;
  let hpmax = 0;
  let cap = 0;
  let money = 0;
  describe_level(P(do_statusline2$dloc));
  if ((money = money_cnt(G.invent)) < 0) {
    money = 0;
  }
  sprintf(eos(P(do_statusline2$dloc)), S("%s:%-2ld"), G.iflags.in_dumplog || G.iflags.invis_goldsym ? S("$") : encglyph(411 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))), money < 999999 ? money : 999999);
  dln = strlen(P(do_statusline2$dloc)) >>> 0;
  dx = (strstri(P(do_statusline2$dloc), S("\\G")) ? 9 : 0) >>> 0;
  hp = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp;
  hpmax = G.u.umonnum !== G.u.umonster ? G.u.mhmax : G.u.uhpmax;
  if (hp < 0) {
    hp = 0;
  }
  sprintf(P(do_statusline2$hlth), S("HP:%d(%d) Pw:%d(%d) AC:%-2d"), hp < 9999 ? hp : 9999, hpmax < 9999 ? hpmax : 9999, G.u.uen < 9999 ? G.u.uen : 9999, G.u.uenmax < 9999 ? G.u.uenmax : 9999, G.u.uac);
  hln = strlen(P(do_statusline2$hlth)) >>> 0;
  if (G.u.umonnum !== G.u.umonster) {
    sprintf(P(do_statusline2$expr), S("HD:%d"), G.mons[G.u.umonnum].mlevel);
  } else if (G.flags.showexp) {
    sprintf(P(do_statusline2$expr), S("Xp:%d/%-1ld"), G.u.ulevel, G.u.uexp);
  } else {
    sprintf(P(do_statusline2$expr), S("Exp:%d"), G.u.ulevel);
  }
  xln = strlen(P(do_statusline2$expr)) >>> 0;
  if (G.flags.time) {
    sprintf(P(do_statusline2$tmmv), S("T:%ld"), G.moves);
  } else {
    do_statusline2$tmmv[0] = 0;
  }
  tln = strlen(P(do_statusline2$tmmv)) >>> 0;
  do_statusline2$cond[0] = 0;
  nb = P(do_statusline2$cond);
  if (G.u.uprops[STONED].intrinsic) {
    strcpy(nb = eos(nb), S(" Stone"));
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    strcpy(nb = eos(nb), S(" Slime"));
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    strcpy(nb = eos(nb), S(" Strngl"));
  }
  if (G.u.uprops[SICK].intrinsic) {
    if ((G.u.usick_type | 0) & SICK_VOMITABLE) {
      strcpy(nb = eos(nb), S(" FoodPois"));
    }
    if ((G.u.usick_type | 0) & SICK_NONVOMITABLE) {
      strcpy(nb = eos(nb), S(" TermIll"));
    }
  }
  if (G.u.uhs !== NOT_HUNGRY) {
    sprintf(nb = eos(nb), S(" %s"), G.hu_stat[G.u.uhs]);
  }
  if ((cap = near_capacity()) > UNENCUMBERED) {
    sprintf(nb = eos(nb), S(" %s"), G.enc_stat[cap]);
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    strcpy(nb = eos(nb), S(" Blind"));
  }
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    strcpy(nb = eos(nb), S(" Deaf"));
  }
  if (G.u.uprops[STUNNED].intrinsic) {
    strcpy(nb = eos(nb), S(" Stun"));
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    strcpy(nb = eos(nb), S(" Conf"));
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    strcpy(nb = eos(nb), S(" Hallu"));
  }
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    strcpy(nb = eos(nb), S(" Lev"));
  }
  if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
    strcpy(nb = eos(nb), S(" Fly"));
  }
  if (G.u.usteed) {
    strcpy(nb = eos(nb), S(" Ride"));
  }
  cln = strlen(P(do_statusline2$cond)) >>> 0;
  if (((((((((dln - dx >>> 0) + 1 >>> 0) + hln >>> 0) + 1 >>> 0) + xln >>> 0) + 1 >>> 0) + tln >>> 0) + 1 >>> 0) + cln >>> 0 <= COLNO) {
    sprintf(P(do_statusline2$newbot2), S("%s %s %s %s %s"), P(do_statusline2$dloc), P(do_statusline2$hlth), P(do_statusline2$expr), P(do_statusline2$tmmv), P(do_statusline2$cond));
  } else {
    if (((((((((dln + 1 >>> 0) + hln >>> 0) + 1 >>> 0) + xln >>> 0) + 1 >>> 0) + tln >>> 0) + 1 >>> 0) + cln >>> 0) + 1 >>> 0 > MAXCO) {
      await panic(S("bot2: second status line exceeds MAXCO (%u > %d)"), ((((((((dln + 1 >>> 0) + hln >>> 0) + 1 >>> 0) + xln >>> 0) + 1 >>> 0) + tln >>> 0) + 1 >>> 0) + cln >>> 0) + 1 >>> 0, MAXCO);
    } else if (((((((dln - dx >>> 0) + 1 >>> 0) + hln >>> 0) + 1 >>> 0) + xln >>> 0) + 1 >>> 0) + cln >>> 0 <= COLNO) {
      sprintf(P(do_statusline2$newbot2), S("%s %s %s %s %s"), P(do_statusline2$dloc), P(do_statusline2$hlth), P(do_statusline2$expr), P(do_statusline2$cond), P(do_statusline2$tmmv));
    } else if (((((dln - dx >>> 0) + 1 >>> 0) + hln >>> 0) + 1 >>> 0) + cln >>> 0 <= COLNO) {
      sprintf(P(do_statusline2$newbot2), S("%s %s %s %s %s"), P(do_statusline2$dloc), P(do_statusline2$hlth), P(do_statusline2$cond), P(do_statusline2$expr), P(do_statusline2$tmmv));
    } else {
      sprintf(P(do_statusline2$newbot2), S("%s %s %s %s %s"), P(do_statusline2$hlth), P(do_statusline2$cond), P(do_statusline2$dloc), P(do_statusline2$expr), P(do_statusline2$tmmv));
    }
    mungspaces(P(do_statusline2$newbot2));
  }
  return P(do_statusline2$newbot2);
}

export async function bot(): Promise<void> {
  if (G.u.uhp !== -1 && G.youmonst.data && G.iflags.status_updates) {
    if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
      await bot_via_windowport();
    } else {
      await G.windowprocs.win_curs(G.WIN_STATUS, 1, 0);
      await G.windowprocs.win_putstr(G.WIN_STATUS, 0, do_statusline1());
      await G.windowprocs.win_curs(G.WIN_STATUS, 1, 1);
      await G.windowprocs.win_putmixed(G.WIN_STATUS, 0, await do_statusline2());
    }
  }
  G.context.botl = G.context.botlx = G.iflags.time_botl = FALSE;
}

export async function timebot(): Promise<void> {
  if (G.flags.time && G.iflags.status_updates) {
    if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
      await stat_update_time();
    } else {
      await bot();
    }
  }
  G.iflags.time_botl = FALSE;
}

export function xlev_to_rank(xlev: number): number {
  return xlev <= 2 ? 0 : xlev <= 30 ? (xlev + 2) / 4 | 0 : 8;
}

export function rank_of(lev: number, monnum: number, female: number): Ptr | null {
  let role = null;
  let i = 0;
  for (role = G.roles[0]; role.name.m; role = $sadd(role, 1)) {
    if (monnum === role.malenum || monnum === role.femalenum) {
      break;
    }
  }
  if (!role.name.m) {
    role = G.urole;
  }
  for (i = xlev_to_rank(lev); i >= 0; --i) {
    if (female && role.rank[i].f) {
      return role.rank[i].f;
    }
    if (role.rank[i].m) {
      return role.rank[i].m;
    }
  }
  if (female && role.name.f) {
    return role.name.f;
  } else if (role.name.m) {
    return role.name.m;
  }
  return S("Player");
}

function rank(): Ptr | null {
  return rank_of(G.u.ulevel, G.urole.malenum, G.flags.female);
}

export function title_to_mon(str: Ptr | null, rank_indx: Ptr | null, title_length: Ptr | null): number {
  let i = 0;
  let j = 0;
  for (i = 0; G.roles[i].name.m; ++i) {
    for (j = 0; j < 9; ++j) {
      if (G.roles[i].rank[j].m && !strncmpi(str, G.roles[i].rank[j].m, strlen(G.roles[i].rank[j].m) | 0)) {
        if (rank_indx) {
          rank_indx.a[rank_indx.o] = j;
        }
        if (title_length) {
          title_length.a[title_length.o] = strlen(G.roles[i].rank[j].m) | 0;
        }
        return G.roles[i].malenum;
      }
      if (G.roles[i].rank[j].f && !strncmpi(str, G.roles[i].rank[j].f, strlen(G.roles[i].rank[j].f) | 0)) {
        if (rank_indx) {
          rank_indx.a[rank_indx.o] = j;
        }
        if (title_length) {
          title_length.a[title_length.o] = strlen(G.roles[i].rank[j].f) | 0;
        }
        return G.roles[i].femalenum !== NON_PM ? G.roles[i].femalenum : G.roles[i].malenum;
      }
    }
  }
  return NON_PM;
}

export function max_rank_sz(): void {
  let i = 0;
  let r = 0;
  let maxr = 0;
  for (i = 0; i < 9; ++i) {
    if (G.urole.rank[i].m && (r = strlen(G.urole.rank[i].m) | 0) > maxr) {
      maxr = r;
    }
    if (G.urole.rank[i].f && (r = strlen(G.urole.rank[i].f) | 0) > maxr) {
      maxr = r;
    }
  }
  mrank_sz = maxr;
  return;
}

export function describe_level(buf: Ptr | null): number {
  let ret = 1;
  if ((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level)) {
    sprintf(buf, S("%s "), P(G.dungeons[G.u.uz.dnum].dname));
  } else if (In_quest(G.u.uz)) {
    sprintf(buf, S("Home %d "), dunlev(G.u.uz));
  } else if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    endgamelevelname(buf, depth(G.u.uz));
    strsubst(buf, S("Plane of "), S(""));
    strcat(buf, S(" "));
  } else {
    sprintf(buf, S("Dlvl:%-2d "), depth(G.u.uz));
    ret = 0;
  }
  return ret;
}

async function bot_via_windowport(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any;
  let buf = new Int8Array(256);
  let titl = null;
  let nb = null;
  let i = 0;
  let idx = 0;
  let cap = 0;
  let money = 0;
  if (!blinit) {
    await panic(S("bot before init."));
  }
  idx = 1 - now_or_before_idx;
  now_or_before_idx = idx;
  memset(P(valset), 0, MAXBLSTATS * 1);
  strcpy(nb = P(buf), P(G.plname));
  nb.a[nb.o] = highc(nb.a[nb.o]);
  titl = !(G.u.umonnum !== G.u.umonster) ? rank() : G.mons[G.u.umonnum].mname;
  i = strlen(P(buf)) + 6 + strlen(titl) - 1 | 0;
  if (i > 30) {
    i = 30 - (6 + strlen(titl) - 1 | 0);
    nb.a[nb.o + (i > 10 ? i : 10)] = 0;
  }
  strcpy(nb = eos(nb), S(" the "));
  strcpy(nb = eos(nb), titl);
  if (G.u.umonnum !== G.u.umonster) {
    for (i = 0; nb.a[nb.o + i]; ++i) {
      if (i === 0 || nb.a[nb.o + (i - 1)] === 32) {
        nb.a[nb.o + i] = highc(nb.a[nb.o + i]);
      }
    }
  }
  sprintf($at2(G.blstats, idx, BL_TITLE).val, S("%-30s"), P(buf));
  valset[BL_TITLE] = TRUE;
  $at2(G.blstats, idx, BL_STR).a.a_int = acurr(A_STR);
  strcpy($at2(G.blstats, idx, BL_STR).val, get_strength_str());
  valset[BL_STR] = TRUE;
  $at2(G.blstats, idx, BL_DX).a.a_int = acurr(A_DEX);
  $at2(G.blstats, idx, BL_CO).a.a_int = acurr(A_CON);
  $at2(G.blstats, idx, BL_IN).a.a_int = acurr(A_INT);
  $at2(G.blstats, idx, BL_WI).a.a_int = acurr(A_WIS);
  $at2(G.blstats, idx, BL_CH).a.a_int = acurr(A_CHA);
  strcpy($at2(G.blstats, idx, BL_ALIGN).val, G.u.ualign.type === A_CHAOTIC ? S("Chaotic") : G.u.ualign.type === A_NEUTRAL ? S("Neutral") : S("Lawful"));
  $at2(G.blstats, idx, BL_SCORE).a.a_long = 0;
  i = G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp;
  if (i < 0) {
    i = 0;
  }
  $at2(G.blstats, idx, BL_HP).a.a_int = i < 9999 ? i : 9999;
  i = G.u.umonnum !== G.u.umonster ? G.u.mhmax : G.u.uhpmax;
  $at2(G.blstats, idx, BL_HPMAX).a.a_int = i < 9999 ? i : 9999;
  describe_level($at2(G.blstats, idx, BL_LEVELDESC).val);
  valset[BL_LEVELDESC] = TRUE;
  if ((money = money_cnt(G.invent)) < 0) {
    money = 0;
  }
  $at2(G.blstats, idx, BL_GOLD).a.a_long = money < 999999 ? money : 999999;
  sprintf($at2(G.blstats, idx, BL_GOLD).val, S("%s:%ld"), G.iflags.in_dumplog || G.iflags.invis_goldsym ? S("$") : encglyph(411 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))), $at2(G.blstats, idx, BL_GOLD).a.a_long);
  valset[BL_GOLD] = TRUE;
  $at2(G.blstats, idx, BL_ENE).a.a_int = G.u.uen < 9999 ? G.u.uen : 9999;
  $at2(G.blstats, idx, BL_ENEMAX).a.a_int = G.u.uenmax < 9999 ? G.u.uenmax : 9999;
  $at2(G.blstats, idx, BL_AC).a.a_int = G.u.uac;
  $at2(G.blstats, idx, BL_HD).a.a_int = G.u.umonnum !== G.u.umonster ? G.mons[G.u.umonnum].mlevel : 0;
  $at2(G.blstats, idx, BL_XP).a.a_int = G.u.ulevel;
  $at2(G.blstats, idx, BL_EXP).a.a_long = G.u.uexp;
  $at2(G.blstats, idx, BL_TIME).a.a_long = G.moves;
  $at2(G.blstats, idx, BL_HUNGER).a.a_int = G.u.uhs | 0;
  strcpy($at2(G.blstats, idx, BL_HUNGER).val, G.u.uhs !== NOT_HUNGRY ? G.hu_stat[G.u.uhs] : S(""));
  valset[BL_HUNGER] = TRUE;
  cap = near_capacity();
  $at2(G.blstats, idx, BL_CAP).a.a_int = cap;
  strcpy($at2(G.blstats, idx, BL_CAP).val, cap > UNENCUMBERED ? G.enc_stat[cap] : S(""));
  valset[BL_CAP] = TRUE;
  $at2(G.blstats, idx, BL_CONDITION).a.a_ulong = 0;
  if (G.u.uprops[STONED].intrinsic) {
    ($t1 = $at2(G.blstats, idx, BL_CONDITION).a, $t1.a_ulong = ($t1.a_ulong | BL_MASK_STONE) >>> 0);
  }
  if (G.u.uprops[SLIMED].intrinsic) {
    ($t2 = $at2(G.blstats, idx, BL_CONDITION).a, $t2.a_ulong = ($t2.a_ulong | BL_MASK_SLIME) >>> 0);
  }
  if (G.u.uprops[STRANGLED].intrinsic) {
    ($t3 = $at2(G.blstats, idx, BL_CONDITION).a, $t3.a_ulong = ($t3.a_ulong | BL_MASK_STRNGL) >>> 0);
  }
  if (G.u.uprops[SICK].intrinsic && ((G.u.usick_type | 0) & SICK_VOMITABLE) !== 0) {
    ($t4 = $at2(G.blstats, idx, BL_CONDITION).a, $t4.a_ulong = ($t4.a_ulong | BL_MASK_FOODPOIS) >>> 0);
  }
  if (G.u.uprops[SICK].intrinsic && ((G.u.usick_type | 0) & SICK_NONVOMITABLE) !== 0) {
    ($t5 = $at2(G.blstats, idx, BL_CONDITION).a, $t5.a_ulong = ($t5.a_ulong | BL_MASK_TERMILL) >>> 0);
  }
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    ($t6 = $at2(G.blstats, idx, BL_CONDITION).a, $t6.a_ulong = ($t6.a_ulong | BL_MASK_BLIND) >>> 0);
  }
  if (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) {
    ($t7 = $at2(G.blstats, idx, BL_CONDITION).a, $t7.a_ulong = ($t7.a_ulong | BL_MASK_DEAF) >>> 0);
  }
  if (G.u.uprops[STUNNED].intrinsic) {
    ($t8 = $at2(G.blstats, idx, BL_CONDITION).a, $t8.a_ulong = ($t8.a_ulong | BL_MASK_STUN) >>> 0);
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    ($t9 = $at2(G.blstats, idx, BL_CONDITION).a, $t9.a_ulong = ($t9.a_ulong | BL_MASK_CONF) >>> 0);
  }
  if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
    ($t10 = $at2(G.blstats, idx, BL_CONDITION).a, $t10.a_ulong = ($t10.a_ulong | BL_MASK_HALLU) >>> 0);
  }
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    ($t11 = $at2(G.blstats, idx, BL_CONDITION).a, $t11.a_ulong = ($t11.a_ulong | BL_MASK_LEV) >>> 0);
  }
  if ((G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked) {
    ($t12 = $at2(G.blstats, idx, BL_CONDITION).a, $t12.a_ulong = ($t12.a_ulong | BL_MASK_FLY) >>> 0);
  }
  if (G.u.usteed) {
    ($t13 = $at2(G.blstats, idx, BL_CONDITION).a, $t13.a_ulong = ($t13.a_ulong | BL_MASK_RIDE) >>> 0);
  }
  await evaluate_and_notify_windowport(P(valset), idx);
}

async function stat_update_time(): Promise<void> {
  let idx = now_or_before_idx;
  let fld = BL_TIME;
  $at2(G.blstats, idx, fld).a.a_long = G.moves;
  valset[fld] = FALSE;
  await eval_notify_windowport_field(fld, P(valset), idx);
  if ((G.windowprocs.wincap2 & WC2_FLUSH_STATUS) >>> 0 !== 0) {
    await G.windowprocs.win_status_update(BL_FLUSH, null, 0, 0, NO_COLOR, null);
  }
  return;
}

async function eval_notify_windowport_field(fld: number, valsetlist: Ptr | null, idx: number): Promise<number> {
  let pc = 0;
  let chg = 0;
  const color = new Int32Array(1);
  color[0] = NO_COLOR;
  let anytype = 0;
  let updated = FALSE;
  let reset = 0;
  let curr = null;
  let prev = null;
  let fldmax = 0;
  anytype = $at2(G.blstats, idx, fld).anytype;
  curr = $sat(G.blstats[idx], fld);
  prev = $sat(G.blstats[1 - idx], fld);
  color[0] = NO_COLOR;
  chg = update_all ? 0 : await compare_blstats(prev, curr);
  if ((chg || update_all || fld === BL_XP) && curr.percent_matters && curr.thresholds || fld === BL_HP && G.iflags.wc2_hitpointbar) {
    fldmax = curr.idxmax;
    pc = fldmax === BL_EXP ? await exp_percentage() : fldmax >= 0 ? await percentage(curr, $sat(G.blstats[idx], fldmax)) : 0;
    if (pc !== prev.percent_value) {
      chg = 1;
    }
    curr.percent_value = pc << 16 >> 16;
  } else {
    pc = 0;
  }
  if (fld === BL_GOLD && (G.context.rndencode !== eval_notify_windowport_field$oldrndencode || G.showsyms[COIN_CLASS + SYM_OFF_O] !== eval_notify_windowport_field$oldgoldsym)) {
    update_all = TRUE;
    eval_notify_windowport_field$oldrndencode = G.context.rndencode;
    eval_notify_windowport_field$oldgoldsym = G.showsyms[COIN_CLASS + SYM_OFF_O];
  }
  reset = FALSE;
  if (!update_all && !chg && curr.time) {
    reset = hilite_reset_needed(prev, bl_hilite_moves);
    if (reset) {
      curr.time = prev.time = 0;
    }
  }
  if (update_all || chg || reset) {
    if (!valsetlist.a[valsetlist.o + fld]) {
      anything_to_s(curr.val, curr.a, anytype | 0);
    }
    if (anytype !== ANY_MASK32) {
      if (chg || curr.val.a[curr.val.o]) {
        if (chg === 1 && fld === BL_XP) {
          chg = await compare_blstats(prev, curr);
        }
        curr.hilite_rule = get_hilite(idx, fld, curr.a, chg, pc, P(color, 0));
        prev.hilite_rule = curr.hilite_rule;
        if (chg === 2) {
          color[0] = NO_COLOR;
          chg = 0;
        }
      }
      await G.windowprocs.win_status_update(fld, curr.val, chg, pc, color[0], null);
    } else {
      await G.windowprocs.win_status_update(fld, P(curr.a, "a_ulong"), chg, pc, color[0], P(cond_hilites));
    }
    curr.chg = prev.chg = TRUE;
    updated = TRUE;
  }
  return updated;
}

async function evaluate_and_notify_windowport(valsetlist: Ptr | null, idx: number): Promise<void> {
  let i = 0;
  let updated = 0;
  let notpresent = 0;
  for (i = 0; i < MAXBLSTATS; ++i) {
    if (i === BL_SCORE && !G.flags.showscore || i === BL_EXP && !G.flags.showexp || i === BL_TIME && !G.flags.time || i === BL_HD && !(G.u.umonnum !== G.u.umonster) || (i === BL_XP || i === BL_EXP) && G.u.umonnum !== G.u.umonster) {
      ++notpresent;
      continue;
    }
    if (await eval_notify_windowport_field(i, valsetlist, idx)) {
      ++updated;
    }
  }
  if (G.context.botlx && (G.windowprocs.wincap2 & WC2_RESET_STATUS) >>> 0 !== 0) {
    await G.windowprocs.win_status_update(BL_RESET, null, 0, 0, NO_COLOR, null);
  } else if ((updated || G.context.botlx) && (G.windowprocs.wincap2 & WC2_FLUSH_STATUS) >>> 0 !== 0) {
    await G.windowprocs.win_status_update(BL_FLUSH, null, 0, 0, NO_COLOR, null);
  }
  G.context.botl = G.context.botlx = G.iflags.time_botl = FALSE;
  update_all = FALSE;
}

export async function status_initialize(reassessment: number): Promise<void> {
  let fld = 0;
  let fldenabl = 0;
  let i = 0;
  let fieldfmt = null;
  let fieldname = null;
  if (!reassessment) {
    if (blinit) {
      await impossible(S("2nd status_initialize with full init."));
    }
    await init_blstats();
    await G.windowprocs.win_status_init();
    blinit = TRUE;
  } else if (!blinit) {
    await panic(S("status 'reassess' before init"));
  }
  for (i = 0; i < MAXBLSTATS; ++i) {
    fld = initblstats[i].fld;
    fldenabl = (fld === BL_SCORE ? G.flags.showscore : fld === BL_TIME ? G.flags.time : fld === BL_EXP ? (G.flags.showexp && !(G.u.umonnum !== G.u.umonster) ? 1 : 0) << 24 >> 24 : fld === BL_XP ? (!(G.u.umonnum !== G.u.umonster) ? 1 : 0) << 24 >> 24 : fld === BL_HD ? (G.u.umonnum !== G.u.umonster ? 1 : 0) << 24 >> 24 : TRUE) << 24 >> 24;
    fieldname = initblstats[i].fldname;
    fieldfmt = fld === BL_TITLE && G.iflags.wc2_hitpointbar ? S("%-30.30s") : initblstats[i].fldfmt;
    G.windowprocs.win_status_enablefield(fld, fieldname, fieldfmt, fldenabl);
  }
  update_all = TRUE;
  G.context.botlx = TRUE;
}

export function status_finish(): void {
  let i = 0;
  if (G.windowprocs.win_status_finish) {
    G.windowprocs.win_status_finish();
  }
  for (i = 0; i < MAXBLSTATS; ++i) {
    if ($at2(G.blstats, 0, i).val) {
      free($at2(G.blstats, 0, i).val), $at2(G.blstats, 0, i).val = null;
    }
    if ($at2(G.blstats, 1, i).val) {
      free($at2(G.blstats, 1, i).val), $at2(G.blstats, 1, i).val = null;
    }
    $at2(G.blstats, 0, i).hilite_rule = $at2(G.blstats, 1, i).hilite_rule = null;
    if ($at2(G.blstats, 0, i).thresholds) {
      let temp = null;
      let next = null;
      for (temp = $at2(G.blstats, 0, i).thresholds; temp; temp = next) {
        next = temp.next;
        free(temp);
      }
      $at2(G.blstats, 0, i).thresholds = $at2(G.blstats, 1, i).thresholds = null;
    }
  }
}

async function init_blstats(): Promise<void> {
  let i = 0;
  let j = 0;
  if (init_blstats$initalready) {
    await impossible(S("init_blstats called more than once."));
    return;
  }
  for (i = 0; i <= 1; ++i) {
    for (j = 0; j < MAXBLSTATS; ++j) {
      let keep_hilite_chain = $at2(G.blstats, i, j).thresholds;
      $at2(G.blstats, i, j).$cp(initblstats[j]);
      $at2(G.blstats, i, j).a.$cp(G.zeroany);
      if ($at2(G.blstats, i, j).valwidth) {
        $at2(G.blstats, i, j).val = P(new Int8Array(($at2(G.blstats, i, j).valwidth >>> 0)));
        $wr($at2(G.blstats, i, j).val, 0, 0);
      } else {
        $at2(G.blstats, i, j).val = null;
      }
      $at2(G.blstats, i, j).thresholds = keep_hilite_chain;
    }
  }
  init_blstats$initalready = TRUE;
}

async function compare_blstats(bl1: struct_istat_s | null, bl2: struct_istat_s | null): Promise<number> {
  let anytype = 0;
  let result = 0;
  if (!bl1 || !bl2) {
    await panic(S("compare_blstat: bad istat pointer %s, %s"), fmt_ptr(bl1), fmt_ptr(bl2));
  }
  anytype = bl1.anytype | 0;
  if ((!bl1.a.a_void || !bl2.a.a_void) && (anytype === ANY_IPTR || anytype === ANY_UPTR || anytype === ANY_LPTR || anytype === ANY_ULPTR)) {
    await panic(S("compare_blstat: invalid pointer %s, %s"), fmt_ptr(bl1.a.a_void), fmt_ptr(bl2.a.a_void));
  }
  switch (anytype) {
  case ANY_INT:
    result = bl1.a.a_int < bl2.a.a_int ? 1 : bl1.a.a_int > bl2.a.a_int ? -1 : 0;
    break;
  case ANY_IPTR:
    result = bl1.a.a_iptr.a[bl1.a.a_iptr.o] < bl2.a.a_iptr.a[bl2.a.a_iptr.o] ? 1 : bl1.a.a_iptr.a[bl1.a.a_iptr.o] > bl2.a.a_iptr.a[bl2.a.a_iptr.o] ? -1 : 0;
    break;
  case ANY_LONG:
    result = bl1.a.a_long < bl2.a.a_long ? 1 : bl1.a.a_long > bl2.a.a_long ? -1 : 0;
    break;
  case ANY_LPTR:
    result = bl1.a.a_lptr.a[bl1.a.a_lptr.o] < bl2.a.a_lptr.a[bl2.a.a_lptr.o] ? 1 : bl1.a.a_lptr.a[bl1.a.a_lptr.o] > bl2.a.a_lptr.a[bl2.a.a_lptr.o] ? -1 : 0;
    break;
  case ANY_UINT:
    result = bl1.a.a_uint < bl2.a.a_uint ? 1 : bl1.a.a_uint > bl2.a.a_uint ? -1 : 0;
    break;
  case ANY_UPTR:
    result = bl1.a.a_uptr.a[bl1.a.a_uptr.o] < bl2.a.a_uptr.a[bl2.a.a_uptr.o] ? 1 : bl1.a.a_uptr.a[bl1.a.a_uptr.o] > bl2.a.a_uptr.a[bl2.a.a_uptr.o] ? -1 : 0;
    break;
  case ANY_ULONG:
    result = bl1.a.a_ulong < bl2.a.a_ulong ? 1 : bl1.a.a_ulong > bl2.a.a_ulong ? -1 : 0;
    break;
  case ANY_ULPTR:
    result = bl1.a.a_ulptr.a[bl1.a.a_ulptr.o] < bl2.a.a_ulptr.a[bl2.a.a_ulptr.o] ? 1 : bl1.a.a_ulptr.a[bl1.a.a_ulptr.o] > bl2.a.a_ulptr.a[bl2.a.a_ulptr.o] ? -1 : 0;
    break;
  case ANY_STR:
    result = sgn(strcmp(bl1.val, bl2.val));
    break;
  case ANY_MASK32:
    result = bl1.a.a_ulong !== bl2.a.a_ulong ? 1 : 0;
    break;
  default:
    result = 1;
  }
  return result;
}

function anything_to_s(buf: Ptr | null, a: union_any | null, anytype: number): Ptr | null {
  if (!buf) {
    return null;
  }
  switch (anytype) {
  case ANY_ULONG:
    sprintf(buf, S("%lu"), a.a_ulong);
    break;
  case ANY_MASK32:
    sprintf(buf, S("%lx"), a.a_ulong);
    break;
  case ANY_LONG:
    sprintf(buf, S("%ld"), a.a_long);
    break;
  case ANY_INT:
    sprintf(buf, S("%d"), a.a_int);
    break;
  case ANY_UINT:
    sprintf(buf, S("%u"), a.a_uint);
    break;
  case ANY_IPTR:
    sprintf(buf, S("%d"), a.a_iptr.a[a.a_iptr.o]);
    break;
  case ANY_LPTR:
    sprintf(buf, S("%ld"), a.a_lptr.a[a.a_lptr.o]);
    break;
  case ANY_ULPTR:
    sprintf(buf, S("%lu"), a.a_ulptr.a[a.a_ulptr.o]);
    break;
  case ANY_UPTR:
    sprintf(buf, S("%u"), a.a_uptr.a[a.a_uptr.o]);
    break;
  case ANY_STR:
    ;
    break;
  default:
    buf.a[buf.o] = 0;
  }
  return buf;
}

function s_to_anything(a: union_any | null, buf: Ptr | null, anytype: number): void {
  if (!buf || !a) {
    return;
  }
  switch (anytype) {
  case ANY_LONG:
    a.a_long = atol(buf);
    break;
  case ANY_INT:
    a.a_int = atoi(buf);
    break;
  case ANY_UINT:
    a.a_uint = atoi(buf) >>> 0;
    break;
  case ANY_ULONG:
    a.a_ulong = $u64(atol(buf));
    break;
  case ANY_IPTR:
    if (a.a_iptr) {
      a.a_iptr.a[a.a_iptr.o] = atoi(buf);
    }
    break;
  case ANY_UPTR:
    if (a.a_uptr) {
      a.a_uptr.a[a.a_uptr.o] = atoi(buf) >>> 0;
    }
    break;
  case ANY_LPTR:
    if (a.a_lptr) {
      a.a_lptr.a[a.a_lptr.o] = atol(buf);
    }
    break;
  case ANY_ULPTR:
    if (a.a_ulptr) {
      a.a_ulptr.a[a.a_ulptr.o] = $u64(atol(buf));
    }
    break;
  case ANY_MASK32:
    a.a_ulong = $u64(atol(buf));
    break;
  default:
    a.a_void = null;
    break;
  }
  return;
}

async function percentage(bl: struct_istat_s | null, maxbl: struct_istat_s | null): Promise<number> {
  let result = 0;
  let anytype = 0;
  let ival = 0;
  let lval = 0;
  let uval = 0;
  let ulval = 0;
  if (!bl || !maxbl) {
    await impossible(S("percentage: bad istat pointer %s, %s"), fmt_ptr(bl), fmt_ptr(maxbl));
    return 0;
  }
  ival = 0, lval = 0, uval = 0, ulval = 0;
  anytype = bl.anytype | 0;
  if (maxbl.a.a_void) {
    switch (anytype) {
    case ANY_INT:
      ival = bl.a.a_int;
      result = 100 * ival / maxbl.a.a_int | 0;
      break;
    case ANY_LONG:
      lval = bl.a.a_long;
      result = Math.trunc(100 * lval / maxbl.a.a_long) | 0;
      break;
    case ANY_UINT:
      uval = bl.a.a_uint;
      result = (100 * uval >>> 0) / maxbl.a.a_uint >>> 0 | 0;
      break;
    case ANY_ULONG:
      ulval = bl.a.a_ulong;
      result = Math.trunc(100 * ulval / maxbl.a.a_ulong) | 0;
      break;
    case ANY_IPTR:
      ival = bl.a.a_iptr.a[bl.a.a_iptr.o];
      result = 100 * ival / maxbl.a.a_iptr.a[maxbl.a.a_iptr.o] | 0;
      break;
    case ANY_LPTR:
      lval = bl.a.a_lptr.a[bl.a.a_lptr.o];
      result = Math.trunc(100 * lval / maxbl.a.a_lptr.a[maxbl.a.a_lptr.o]) | 0;
      break;
    case ANY_UPTR:
      uval = bl.a.a_uptr.a[bl.a.a_uptr.o];
      result = (100 * uval >>> 0) / maxbl.a.a_uptr.a[maxbl.a.a_uptr.o] >>> 0 | 0;
      break;
    case ANY_ULPTR:
      ulval = bl.a.a_ulptr.a[bl.a.a_ulptr.o];
      result = Math.trunc(100 * ulval / maxbl.a.a_ulptr.a[maxbl.a.a_ulptr.o]) | 0;
      break;
    }
  }
  if (result === 0 && (ival !== 0 || lval !== 0 || uval !== 0 || ulval !== 0)) {
    result = 1;
  }
  return result;
}

async function exp_percentage(): Promise<number> {
  let res = 0;
  if (G.u.ulevel < 30) {
    let exp_val = 0;
    let nxt_exp_val = 0;
    let curlvlstart = 0;
    curlvlstart = newuexp(G.u.ulevel - 1);
    exp_val = G.u.uexp - curlvlstart;
    nxt_exp_val = newuexp(G.u.ulevel) - curlvlstart;
    if (exp_val === nxt_exp_val - 1) {
      res = 100;
    } else {
      let curval = new struct_istat_s();
      let maxval = new struct_istat_s();
      curval.anytype = maxval.anytype = ANY_LONG;
      curval.a.$cp(maxval.a.$cp(G.zeroany));
      curval.a.a_long = exp_val;
      maxval.a.a_long = nxt_exp_val;
      res = await percentage(curval, maxval);
    }
  }
  return res;
}

export async function exp_percent_changing(): Promise<number> {
  let pc = 0;
  const color_dummy = new Int32Array(1);
  let a = new union_any();
  let rule = null;
  let curr = null;
  if (!G.context.botl) {
    curr = $at2(G.blstats, now_or_before_idx, BL_XP);
    if (curr.percent_matters && curr.thresholds && (pc = await exp_percentage()) !== curr.percent_value) {
      a.$cp(G.zeroany);
      a.a_int = G.u.ulevel;
      rule = get_hilite(now_or_before_idx, BL_XP, a, 0, pc, P(color_dummy, 0));
      if (rule !== curr.hilite_rule) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function stat_cap_indx(): number {
  let cap = 0;
  cap = $at2(G.blstats, now_or_before_idx, BL_CAP).a.a_int;
  return cap;
}

export function stat_hunger_indx(): number {
  let uhs = 0;
  uhs = $at2(G.blstats, now_or_before_idx, BL_HUNGER).a.a_int;
  return uhs;
}

export function bl_idx_to_fldname(idx: number): Ptr | null {
  if (idx >= 0 && idx < MAXBLSTATS) {
    return initblstats[idx].fldname;
  }
  return null;
}

function fldname_to_bl_indx(name: Ptr | null): number {
  let i = 0;
  let nmatches = 0;
  let fld = 0;
  if (name && name.a[name.o]) {
    for (i = 0; i < (Math.trunc(1840 / 80) | 0); ++i) {
      if (fuzzymatch(initblstats[i].fldname, name, S(" -_"), TRUE)) {
        fld = initblstats[i].fld;
        ++nmatches;
      }
    }
    if (!nmatches) {
      for (i = 0; fieldids_alias[i].fieldname; ++i) {
        if (fuzzymatch(fieldids_alias[i].fieldname, name, S(" -_"), TRUE)) {
          fld = fieldids_alias[i].fldid;
          ++nmatches;
        }
      }
    }
    if (!nmatches) {
      let len = strlen(name) | 0;
      for (i = 0; i < (Math.trunc(1840 / 80) | 0); ++i) {
        if (!strncmpi(name, initblstats[i].fldname, len)) {
          fld = initblstats[i].fld;
          ++nmatches;
        }
      }
    }
  }
  return nmatches === 1 ? fld : BL_FLUSH;
}

function hilite_reset_needed(bl_p: struct_istat_s | null, augmented_time: number): number {
  if (G.multi) {
    return FALSE;
  }
  if (!(bl_p.hilite_rule && bl_p.hilite_rule.behavior === 102)) {
    return FALSE;
  }
  if (bl_p.time === 0 || bl_p.time >= augmented_time) {
    return FALSE;
  }
  return TRUE;
}

export function status_eval_next_unhilite(): void {
  let i = 0;
  let curr = null;
  let next_unhilite = 0;
  let this_unhilite = 0;
  bl_hilite_moves = G.moves;
  next_unhilite = 0;
  for (i = 0; i < MAXBLSTATS; ++i) {
    curr = $sat(G.blstats[0], i);
    if (curr.chg) {
      let prev = $sat(G.blstats[1], i);
      if (curr.hilite_rule && curr.hilite_rule.behavior === 102) {
        curr.time = prev.time = bl_hilite_moves + G.iflags.hilite_delta;
      } else {
        curr.time = prev.time = 0;
      }
      curr.chg = prev.chg = FALSE;
      G.context.botl = TRUE;
    }
    if (G.context.botl) {
      continue;
    }
    this_unhilite = curr.time;
    if (this_unhilite > 0 && (next_unhilite === 0 || this_unhilite < next_unhilite) && hilite_reset_needed(curr, this_unhilite + 1)) {
      next_unhilite = this_unhilite;
      if (next_unhilite < bl_hilite_moves) {
        G.context.botl = TRUE;
      }
    }
  }
}

export function reset_status_hilites(): void {
  if (G.iflags.hilite_delta) {
    let i = 0;
    for (i = 0; i < MAXBLSTATS; ++i) {
      $at2(G.blstats, 0, i).time = $at2(G.blstats, 1, i).time = 0;
    }
    update_all = TRUE;
  }
  G.context.botlx = TRUE;
}

function noneoftheabove(hl_text: Ptr | null): number {
  if (fuzzymatch(hl_text, S("none of the above"), S("\" -_"), TRUE) || fuzzymatch(hl_text, S("(polymorphed)"), S("\"()"), TRUE) || fuzzymatch(hl_text, S("none of the above (polymorphed)"), S("\" -_()"), TRUE)) {
    return TRUE;
  }
  return FALSE;
}

function get_hilite(idx: number, fldidx: number, vp: any, chg: number, pc: number, colorptr: Ptr | null): struct_hilite_s | null {
  let hl = null;
  let rule = null;
  let value = vp;
  let txtstr = null;
  if (fldidx < 0 || fldidx >= MAXBLSTATS) {
    return null;
  }
  if ($at2(G.blstats, 0, fldidx).thresholds) {
    let dt = 0;
    let max_pc = -1;
    let min_pc = 101;
    let max_ival = -LARGEST_INT;
    let min_ival = LARGEST_INT;
    let max_lval = -LONG_MAX;
    let min_lval = LONG_MAX;
    let exactmatch = FALSE;
    let updown = FALSE;
    let changed = FALSE;
    let perc_or_abs = FALSE;
    for (hl = $at2(G.blstats, 0, fldidx).thresholds; hl; hl = hl.next) {
      dt = initblstats[fldidx].anytype | 0;
      if ((updown || changed) && hl.behavior !== BL_TH_UPDOWN) {
        continue;
      }
      if (perc_or_abs && hl.behavior === BL_TH_ALWAYS_HILITE) {
        continue;
      }
      switch (hl.behavior) {
      case 100:
        if (hl.rel === EQ_VALUE && pc === hl.value.a_int) {
          rule = hl;
          min_pc = max_pc = hl.value.a_int;
          exactmatch = perc_or_abs = TRUE;
        } else if (exactmatch) {
          ;
        } else if (hl.rel === LT_VALUE && pc < hl.value.a_int && hl.value.a_int <= min_pc) {
          rule = hl;
          min_pc = hl.value.a_int;
          perc_or_abs = TRUE;
        } else if (hl.rel === LE_VALUE && pc <= hl.value.a_int && hl.value.a_int <= min_pc) {
          rule = hl;
          min_pc = hl.value.a_int;
          perc_or_abs = TRUE;
        } else if (hl.rel === GT_VALUE && pc > hl.value.a_int && hl.value.a_int >= max_pc) {
          rule = hl;
          max_pc = hl.value.a_int;
          perc_or_abs = TRUE;
        } else if (hl.rel === GE_VALUE && pc >= hl.value.a_int && hl.value.a_int >= max_pc) {
          rule = hl;
          max_pc = hl.value.a_int;
          perc_or_abs = TRUE;
        }
        break;
      case 102:
        if (chg < 0 && hl.rel === LT_VALUE) {
          rule = hl;
          updown = TRUE;
        } else if (chg > 0 && hl.rel === GT_VALUE) {
          rule = hl;
          updown = TRUE;
        } else if (chg !== 0 && hl.rel === EQ_VALUE && !updown) {
          rule = hl;
          changed = TRUE;
        }
        break;
      case 101:
        if (dt === ANY_INT) {
          if (hl.rel === EQ_VALUE && hl.value.a_int === value.a_int) {
            rule = hl;
            min_ival = max_ival = hl.value.a_int;
            exactmatch = perc_or_abs = TRUE;
          } else if (exactmatch) {
            ;
          } else if (hl.rel === LT_VALUE && value.a_int < hl.value.a_int && hl.value.a_int <= min_ival) {
            rule = hl;
            min_ival = hl.value.a_int;
            perc_or_abs = TRUE;
          } else if (hl.rel === LE_VALUE && value.a_int <= hl.value.a_int && hl.value.a_int <= min_ival) {
            rule = hl;
            min_ival = hl.value.a_int;
            perc_or_abs = TRUE;
          } else if (hl.rel === GT_VALUE && value.a_int > hl.value.a_int && hl.value.a_int >= max_ival) {
            rule = hl;
            max_ival = hl.value.a_int;
            perc_or_abs = TRUE;
          } else if (hl.rel === GE_VALUE && value.a_int >= hl.value.a_int && hl.value.a_int >= max_ival) {
            rule = hl;
            max_ival = hl.value.a_int;
            perc_or_abs = TRUE;
          }
        } else {
          if (hl.rel === EQ_VALUE && hl.value.a_long === value.a_long) {
            rule = hl;
            min_lval = max_lval = hl.value.a_long;
            exactmatch = perc_or_abs = TRUE;
          } else if (exactmatch) {
            ;
          } else if (hl.rel === LT_VALUE && value.a_long < hl.value.a_long && hl.value.a_long <= min_lval) {
            rule = hl;
            min_lval = hl.value.a_long;
            perc_or_abs = TRUE;
          } else if (hl.rel === LE_VALUE && value.a_long <= hl.value.a_long && hl.value.a_long <= min_lval) {
            rule = hl;
            min_lval = hl.value.a_long;
            perc_or_abs = TRUE;
          } else if (hl.rel === GT_VALUE && value.a_long > hl.value.a_long && hl.value.a_long >= max_lval) {
            rule = hl;
            max_lval = hl.value.a_long;
            perc_or_abs = TRUE;
          } else if (hl.rel === GE_VALUE && value.a_long >= hl.value.a_long && hl.value.a_long >= max_lval) {
            rule = hl;
            max_lval = hl.value.a_long;
            perc_or_abs = TRUE;
          }
        }
        break;
      case 104:
        txtstr = $at2(G.blstats, idx, fldidx).val;
        if (fldidx === BL_TITLE) {
          txtstr = txtstr.add(strlen(P(G.plname)) + 6 - 1);
        }
        if (hl.rel === TXT_VALUE && hl.textmatch[0]) {
          if (fuzzymatch(P(hl.textmatch), txtstr, S("\" -_"), TRUE)) {
            rule = hl;
            exactmatch = TRUE;
          } else if (exactmatch) {
            ;
          } else if (fldidx === BL_TITLE && G.u.umonnum !== G.u.umonster && noneoftheabove(P(hl.textmatch))) {
            rule = hl;
          }
        }
        break;
      case 105:
        rule = hl;
        break;
      case 0:
        break;
      default:
        break;
      }
    }
  }
  colorptr.a[colorptr.o] = rule ? rule.coloridx : NO_COLOR;
  return rule;
}

function split_clridx(idx: number, coloridx: Ptr | null, attrib: Ptr | null): void {
  if (coloridx) {
    coloridx.a[coloridx.o] = idx & 255;
  }
  if (attrib) {
    attrib.a[attrib.o] = idx >> 8 & 255;
  }
}

export async function parse_status_hl1(op: Ptr | null, from_configfile: number): Promise<number> {
  let hsbuf = $arr(21, () => new Int8Array(128));
  let rslt = 0;
  let badopt = FALSE;
  let i = 0;
  let fldnum = 0;
  let ccount = 0;
  let c = 0;
  fldnum = 0;
  for (i = 0; i < MAX_THRESH; ++i) {
    hsbuf[i][0] = 0;
  }
  while (op.a[op.o] && fldnum < MAX_THRESH && ccount < QBUFSZ - 2) {
    c = lowc(op.a[op.o]);
    if (c === 32) {
      if (fldnum >= 1) {
        if (fldnum === 1 && strncmpi(P(hsbuf[0]), S("title"), -1) === 0) {
          hsbuf[fldnum][ccount++] = c;
          hsbuf[fldnum][ccount] = 0;
          op = op.add(1);
          continue;
        }
        rslt = await parse_status_hl2(P(hsbuf), from_configfile);
        if (!rslt) {
          badopt = TRUE;
          break;
        }
      }
      for (i = 0; i < MAX_THRESH; ++i) {
        hsbuf[i][0] = 0;
      }
      fldnum = 0;
      ccount = 0;
    } else if (c === 47) {
      ++fldnum;
      ccount = 0;
    } else {
      hsbuf[fldnum][ccount++] = c;
      hsbuf[fldnum][ccount] = 0;
    }
    op = op.add(1);
  }
  if (fldnum >= 1 && !badopt) {
    rslt = await parse_status_hl2(P(hsbuf), from_configfile);
    if (!rslt) {
      badopt = TRUE;
    }
  }
  if (badopt) {
    return FALSE;
  }
  return TRUE;
}

function is_ltgt_percentnumber(str: Ptr | null): number {
  let s = str;
  if (s.a[s.o] === 60 || s.a[s.o] === 62) {
    s = s.add(1);
  }
  if (s.a[s.o] === 61) {
    s = s.add(1);
  }
  if (s.a[s.o] === 45 || s.a[s.o] === 43) {
    s = s.add(1);
  }
  if (!digit(s.a[s.o])) {
    return FALSE;
  }
  while (digit(s.a[s.o])) {
    s = s.add(1);
  }
  if (s.a[s.o] === 37) {
    s = s.add(1);
  }
  return (s.a[s.o] === 0 ? 1 : 0) << 24 >> 24;
}

function has_ltgt_percentnumber(str: Ptr | null): number {
  let s = str;
  while (s.a[s.o]) {
    if (!strchr(S("<>=-+0123456789%"), s.a[s.o])) {
      return FALSE;
    }
    s = s.add(1);
  }
  return TRUE;
}

function splitsubfields(str: Ptr | null, sfarr: Ptr | null, maxsf: number): number {
  let st = null;
  let sf = 0;
  if (!str) {
    return 0;
  }
  for (sf = 0; sf < MAX_SUBFIELDS; ++sf) {
    splitsubfields$subfields[sf] = null;
  }
  maxsf = maxsf === 0 ? MAX_SUBFIELDS : maxsf < 16 ? maxsf : 16;
  if (strchr(str, 43) || strchr(str, 38)) {
    let c = str;
    sf = 0;
    st = c;
    while (c.a[c.o] && sf < maxsf) {
      if (c.a[c.o] === 38 || c.a[c.o] === 43) {
        c.a[c.o] = 0;
        splitsubfields$subfields[sf] = st;
        st = c.add(1);
        ++sf;
      }
      c = c.add(1);
    }
    if (sf >= maxsf - 1) {
      return -1;
    }
    if (!c.a[c.o] && !$peq(c, st)) {
      splitsubfields$subfields[sf++] = st;
    }
  } else {
    sf = 1;
    splitsubfields$subfields[0] = str;
  }
  sfarr.a[sfarr.o] = P(splitsubfields$subfields);
  return sf;
}

function is_fld_arrayvalues(str: Ptr | null, arr: Ptr | null, arrmin: number, arrmax: number, retidx: Ptr | null): number {
  let i = 0;
  for (i = arrmin; i < arrmax; ++i) {
    if (!strncmpi(str, arr.a[arr.o + i], -1)) {
      retidx.a[retidx.o] = i;
      return TRUE;
    }
  }
  return FALSE;
}

async function query_arrayvalue(querystr: Ptr | null, arr: Ptr | null, arrmin: number, arrmax: number): Promise<number> {
  let i = 0;
  let res = 0;
  let ret = arrmin - 1;
  let tmpwin = 0;
  let any = new union_any();
  const picks = [null];
  picks[0] = null;
  let adj = arrmin > 0 ? 1 : arrmax;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  for (i = arrmin; i < arrmax; ++i) {
    any.$cp(G.zeroany);
    any.a_int = i + adj;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, arr.a[arr.o + i], MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, querystr);
  res = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (res > 0) {
    ret = picks[0].item.a_int - adj;
    free(picks[0]);
  }
  return ret;
}

async function status_hilite_add_threshold(fld: number, hilite: struct_hilite_s | null): Promise<void> {
  let new_hilite = null;
  if (!hilite) {
    return;
  }
  new_hilite = new struct_hilite_s();
  new_hilite.$cp(hilite);
  new_hilite.set = TRUE;
  new_hilite.fld = fld;
  new_hilite.next = $at2(G.blstats, 0, fld).thresholds;
  $at2(G.blstats, 0, fld).thresholds = new_hilite;
  $at2(G.blstats, 1, fld).thresholds = $at2(G.blstats, 0, fld).thresholds;
}

async function parse_status_hl2(s: Ptr | null, from_configfile: number): Promise<number> {
  let tmp = null;
  let how = null;
  let sidx = 0;
  let i = -1;
  let dt = -1;
  let coloridx = -1;
  let successes = 0;
  let disp_attrib = 0;
  let percent = 0;
  let changed = 0;
  let numeric = 0;
  let down = 0;
  let up = 0;
  let gt = 0;
  let lt = 0;
  let ge = 0;
  let le = 0;
  let eq = 0;
  let txtval = 0;
  let always = 0;
  let txt = null;
  let fld = BL_FLUSH;
  let hilite = new struct_hilite_s();
  let tmpbuf = new Int8Array(256);
  fld = fldname_to_bl_indx(P(s.a[s.o + sidx]));
  if (fld === BL_CHARACTERISTICS) {
    let res = FALSE;
    for (fld = BL_STR; fld <= BL_CH; ++fld) {
      strcpy(P(s.a[s.o + sidx]), initblstats[fld].fldname);
      res = await parse_status_hl2(s, from_configfile);
      if (!res) {
        return FALSE;
      }
    }
    return TRUE;
  }
  if (fld === BL_FLUSH) {
    await config_error_add(S("Unknown status field '%s'"), P(s.a[s.o + sidx]));
    return FALSE;
  }
  if (fld === BL_CONDITION) {
    return await parse_condition(s, sidx);
  }
  ++sidx;
  while (P(s.a[s.o + sidx])) {
    let buf = new Int8Array(256);
    const subfields = [null];
    let sf = 0;
    const kidx = new Int32Array(1);
    txt = null;
    percent = numeric = always = FALSE;
    down = up = changed = FALSE;
    gt = ge = eq = le = lt = txtval = FALSE;
    if (!s.a[s.o + sidx][0]) {
      return TRUE;
    }
    memset(hilite, 0, 128);
    hilite.set = FALSE;
    hilite.fld = fld;
    if ($rd(P(s.a[s.o + (sidx + 1)])) === 0 || !strncmpi(P(s.a[s.o + sidx]), S("always"), -1)) {
      always = TRUE;
      if ($rd(P(s.a[s.o + (sidx + 1)])) === 0) {
        --sidx;
      }
    } else if (!strncmpi(P(s.a[s.o + sidx]), S("up"), -1) || !strncmpi(P(s.a[s.o + sidx]), S("down"), -1)) {
      if (initblstats[fld].anytype === ANY_STR) {
        ;
      } else if (!strncmpi(P(s.a[s.o + sidx]), S("down"), -1)) {
        down = TRUE;
      } else {
        up = TRUE;
      }
      changed = TRUE;
    } else if (fld === BL_CAP && is_fld_arrayvalues(P(s.a[s.o + sidx]), P(G.enc_stat), SLT_ENCUMBER, OVERLOADED + 1, P(kidx, 0))) {
      txt = G.enc_stat[kidx[0]];
      txtval = TRUE;
    } else if (fld === BL_ALIGN && is_fld_arrayvalues(P(s.a[s.o + sidx]), P(parse_status_hl2$aligntxt), 0, 3, P(kidx, 0))) {
      txt = parse_status_hl2$aligntxt[kidx[0]];
      txtval = TRUE;
    } else if (fld === BL_HUNGER && is_fld_arrayvalues(P(s.a[s.o + sidx]), P(parse_status_hl2$hutxt), SATIATED, STARVED + 1, P(kidx, 0))) {
      txt = G.hu_stat[kidx[0]];
      txtval = TRUE;
    } else if (!strncmpi(P(s.a[s.o + sidx]), S("changed"), -1)) {
      changed = TRUE;
    } else if (is_ltgt_percentnumber(P(s.a[s.o + sidx]))) {
      let op = null;
      tmp = P(s.a[s.o + sidx]);
      if (strchr(tmp, 37)) {
        percent = TRUE;
      }
      if (tmp.a[tmp.o] === 60) {
        if (tmp.a[tmp.o + 1] === 61) {
          le = TRUE;
        } else {
          lt = TRUE;
        }
      } else if (tmp.a[tmp.o] === 62) {
        if (tmp.a[tmp.o + 1] === 61) {
          ge = TRUE;
        } else {
          gt = TRUE;
        }
      }
      tmp = await stripchars(P(tmpbuf), S("%<>=+"), tmp);
      numeric = TRUE;
      dt = (percent ? ANY_INT : initblstats[fld].anytype) | 0;
      s_to_anything(hilite.value, tmp, dt);
      op = gt ? S(">") : ge ? S(">=") : lt ? S("<") : le ? S("<=") : S("=");
      if (dt === ANY_INT && (hilite.value.a_int < (fld === BL_AC ? -128 : gt ? -1 : lt ? 1 : 0) || hilite.value.a_int > (percent ? lt ? 101 : 100 : LARGEST_INT))) {
        await config_error_add(S("%s'%s%d%s'%s"), P(threshold_value), op, hilite.value.a_int, percent ? S("%") : S(""), P(is_out_of_range));
        return FALSE;
      } else if (dt === ANY_LONG && hilite.value.a_long < (gt ? -1 : lt ? 1 : 0)) {
        await config_error_add(S("%s'%s%ld'%s"), P(threshold_value), op, hilite.value.a_long, P(is_out_of_range));
        return FALSE;
      }
    } else if (initblstats[fld].anytype === ANY_STR) {
      txt = P(s.a[s.o + sidx]);
      txtval = TRUE;
    } else {
      await config_error_add(has_ltgt_percentnumber(P(s.a[s.o + sidx])) ? S("Wrong format '%s', expected a threshold number or percent") : S("Unknown behavior '%s'"), P(s.a[s.o + sidx]));
      return FALSE;
    }
    if (gt || up) {
      hilite.rel = GT_VALUE;
    } else if (lt || down) {
      hilite.rel = LT_VALUE;
    } else if (ge) {
      hilite.rel = GE_VALUE;
    } else if (le) {
      hilite.rel = LE_VALUE;
    } else if (eq || percent || numeric || changed) {
      hilite.rel = EQ_VALUE;
    } else if (txtval) {
      hilite.rel = TXT_VALUE;
    } else {
      hilite.rel = LT_VALUE;
    }
    if (initblstats[fld].anytype === ANY_STR && (percent || numeric)) {
      await config_error_add(S("Field '%s' does not support numeric values"), initblstats[fld].fldname);
      return FALSE;
    }
    if (percent) {
      if (initblstats[fld].idxmax < 0) {
        await config_error_add(S("Cannot use percent with '%s'"), initblstats[fld].fldname);
        return FALSE;
      } else if (hilite.value.a_int < -1 || hilite.value.a_int === -1 && hilite.value.a_int !== GT_VALUE || hilite.value.a_int === 0 && hilite.rel === LT_VALUE || hilite.value.a_int === 100 && hilite.rel === GT_VALUE || hilite.value.a_int === 101 && hilite.value.a_int !== LT_VALUE || hilite.value.a_int > 101) {
        await config_error_add(S("hilite_status: invalid percentage value '%s%d%%'"), hilite.rel === LT_VALUE ? S("<") : hilite.rel === LE_VALUE ? S("<=") : hilite.rel === GT_VALUE ? S(">") : hilite.rel === GE_VALUE ? S(">=") : S("="), hilite.value.a_int);
        return FALSE;
      }
    }
    ++sidx;
    how = P(s.a[s.o + sidx]);
    if (!how) {
      if (!successes) {
        return FALSE;
      }
    }
    coloridx = -1;
    strcpy(P(buf), how);
    sf = splitsubfields(P(buf), P(subfields, 0), 0);
    if (sf < 1) {
      return FALSE;
    }
    disp_attrib = HL_UNDEF;
    for (i = 0; i < sf; ++i) {
      let a = await match_str2attr(subfields[0].a[subfields[0].o + i], FALSE);
      if (a === ATR_DIM) {
        disp_attrib |= HL_DIM;
      } else if (a === ATR_BLINK) {
        disp_attrib |= HL_BLINK;
      } else if (a === ATR_ULINE) {
        disp_attrib |= HL_ULINE;
      } else if (a === ATR_INVERSE) {
        disp_attrib |= HL_INVERSE;
      } else if (a === ATR_BOLD) {
        disp_attrib |= HL_BOLD;
      } else if (a === ATR_NONE) {
        disp_attrib = HL_NONE;
      } else {
        let c = await match_str2clr(subfields[0].a[subfields[0].o + i]);
        if (c >= CLR_MAX || coloridx !== -1) {
          return FALSE;
        }
        coloridx = c;
      }
    }
    if (coloridx === -1) {
      coloridx = NO_COLOR;
    }
    hilite.coloridx = coloridx | disp_attrib << 8;
    if (always) {
      hilite.behavior = BL_TH_ALWAYS_HILITE;
    } else if (percent) {
      hilite.behavior = BL_TH_VAL_PERCENTAGE;
    } else if (changed) {
      hilite.behavior = BL_TH_UPDOWN;
    } else if (numeric) {
      hilite.behavior = BL_TH_VAL_ABSOLUTE;
    } else if (txtval) {
      hilite.behavior = BL_TH_TEXTMATCH;
    } else if (hilite.value.a_void) {
      hilite.behavior = BL_TH_VAL_ABSOLUTE;
    } else {
      hilite.behavior = BL_TH_NONE;
    }
    hilite.anytype = dt >>> 0;
    if (hilite.behavior === BL_TH_TEXTMATCH && txt) {
      strncpy(P(hilite.textmatch), txt, 80);
      hilite.textmatch[80 - 1] = 0;
      trimspaces(P(hilite.textmatch));
    }
    await status_hilite_add_threshold(fld, hilite);
    ++successes;
    ++sidx;
  }
  return TRUE;
}

export async function query_conditions(): Promise<number> {
  let i = 0;
  let res = 0;
  let ret = 0;
  let tmpwin = 0;
  let any = new union_any();
  const picks = [null];
  picks[0] = null;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  for (i = 0; i < (Math.trunc(208 / 16) | 0); ++i) {
    any.$cp(G.zeroany);
    any.a_ulong = G.valid_conditions[i].bitmask;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, G.valid_conditions[i].id, MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Choose status conditions"));
  res = await G.windowprocs.win_select_menu(tmpwin, PICK_ANY, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (res > 0) {
    for (i = 0; i < res; ++i) {
      ret = (ret | $sadd(picks[0], i).item.a_ulong) >>> 0;
    }
    free(picks[0]);
  }
  return ret;
}

function conditionbitmask2str(ul: number): Ptr | null {
  let i = 0;
  let first = TRUE;
  let alias = null;
  conditionbitmask2str$buf[0] = 0;
  if (!ul) {
    return P(conditionbitmask2str$buf);
  }
  for (i = 1; i < (Math.trunc(80 / 16) | 0); ++i) {
    if (G.condition_aliases[i].bitmask === ul) {
      alias = G.condition_aliases[i].id;
    }
  }
  for (i = 0; i < (Math.trunc(208 / 16) | 0); ++i) {
    if ((G.valid_conditions[i].bitmask & ul) >>> 0 !== 0) {
      sprintf(eos(P(conditionbitmask2str$buf)), S("%s%s"), first ? S("") : S("+"), G.valid_conditions[i].id);
      first = FALSE;
    }
  }
  if (!first && alias) {
    sprintf(P(conditionbitmask2str$buf), S("%s"), alias);
  }
  return P(conditionbitmask2str$buf);
}

function match_str2conditionbitmask(str: Ptr | null): number {
  let i = 0;
  let nmatches = 0;
  let mask = 0;
  if (str && str.a[str.o]) {
    for (i = 0; i < (Math.trunc(208 / 16) | 0); ++i) {
      if (fuzzymatch(G.valid_conditions[i].id, str, S(" -_"), TRUE)) {
        mask = (mask | G.valid_conditions[i].bitmask) >>> 0;
        ++nmatches;
      }
    }
    if (!nmatches) {
      for (i = 0; i < (Math.trunc(80 / 16) | 0); ++i) {
        if (fuzzymatch(G.condition_aliases[i].id, str, S(" -_"), TRUE)) {
          mask = (mask | G.condition_aliases[i].bitmask) >>> 0;
          ++nmatches;
        }
      }
    }
    if (!nmatches) {
      let len = strlen(str) | 0;
      for (i = 0; i < (Math.trunc(80 / 16) | 0); ++i) {
        if (!strncmpi(str, G.condition_aliases[i].id, len)) {
          mask = (mask | G.condition_aliases[i].bitmask) >>> 0;
          ++nmatches;
        }
      }
    }
  }
  return mask;
}

async function str2conditionbitmask(str: Ptr | null): Promise<number> {
  let conditions_bitmask = 0;
  const subfields = [null];
  let i = 0;
  let sf = 0;
  sf = splitsubfields(str, P(subfields, 0), Math.trunc(208 / 16) | 0);
  if (sf < 1) {
    return 0;
  }
  for (i = 0; i < sf; ++i) {
    let bm = match_str2conditionbitmask(subfields[0].a[subfields[0].o + i]);
    if (!bm) {
      await config_error_add(S("Unknown condition '%s'"), subfields[0].a[subfields[0].o + i]);
      return 0;
    }
    conditions_bitmask = (conditions_bitmask | bm) >>> 0;
  }
  return conditions_bitmask;
}

async function parse_condition(s: Ptr | null, sidx: number): Promise<number> {
  let i = 0;
  let coloridx = NO_COLOR;
  let tmp = null;
  let how = null;
  let conditions_bitmask = 0;
  let success = FALSE;
  if (!s) {
    return FALSE;
  }
  ++sidx;
  while (P(s.a[s.o + sidx])) {
    let sf = 0;
    let buf = new Int8Array(256);
    const subfields = [null];
    tmp = P(s.a[s.o + sidx]);
    if (!tmp.a[tmp.o]) {
      if (!success) {
        await config_error_add(S("Missing condition(s)"));
      }
      return success;
    }
    strcpy(P(buf), tmp);
    conditions_bitmask = await str2conditionbitmask(P(buf));
    if (!conditions_bitmask) {
      return FALSE;
    }
    ++sidx;
    how = P(s.a[s.o + sidx]);
    if (!how || !how.a[how.o]) {
      await config_error_add(S("Missing color+attribute"));
      return FALSE;
    }
    strcpy(P(buf), how);
    sf = splitsubfields(P(buf), P(subfields, 0), 0);
    for (i = 0; i < sf; ++i) {
      let a = await match_str2attr(subfields[0].a[subfields[0].o + i], FALSE);
      if (a === ATR_DIM) {
        cond_hilites[HL_ATTCLR_DIM] = (cond_hilites[HL_ATTCLR_DIM] | conditions_bitmask) >>> 0;
      } else if (a === ATR_BLINK) {
        cond_hilites[HL_ATTCLR_BLINK] = (cond_hilites[HL_ATTCLR_BLINK] | conditions_bitmask) >>> 0;
      } else if (a === ATR_ULINE) {
        cond_hilites[HL_ATTCLR_ULINE] = (cond_hilites[HL_ATTCLR_ULINE] | conditions_bitmask) >>> 0;
      } else if (a === ATR_INVERSE) {
        cond_hilites[HL_ATTCLR_INVERSE] = (cond_hilites[HL_ATTCLR_INVERSE] | conditions_bitmask) >>> 0;
      } else if (a === ATR_BOLD) {
        cond_hilites[HL_ATTCLR_BOLD] = (cond_hilites[HL_ATTCLR_BOLD] | conditions_bitmask) >>> 0;
      } else if (a === ATR_NONE) {
        cond_hilites[HL_ATTCLR_DIM] = (cond_hilites[HL_ATTCLR_DIM] & ~conditions_bitmask >>> 0) >>> 0;
        cond_hilites[HL_ATTCLR_BLINK] = (cond_hilites[HL_ATTCLR_BLINK] & ~conditions_bitmask >>> 0) >>> 0;
        cond_hilites[HL_ATTCLR_ULINE] = (cond_hilites[HL_ATTCLR_ULINE] & ~conditions_bitmask >>> 0) >>> 0;
        cond_hilites[HL_ATTCLR_INVERSE] = (cond_hilites[HL_ATTCLR_INVERSE] & ~conditions_bitmask >>> 0) >>> 0;
        cond_hilites[HL_ATTCLR_BOLD] = (cond_hilites[HL_ATTCLR_BOLD] & ~conditions_bitmask >>> 0) >>> 0;
      } else {
        let k = await match_str2clr(subfields[0].a[subfields[0].o + i]);
        if (k >= CLR_MAX) {
          return FALSE;
        }
        coloridx = k;
      }
    }
    cond_hilites[coloridx] = (cond_hilites[coloridx] | conditions_bitmask) >>> 0;
    success = TRUE;
    ++sidx;
  }
  return TRUE;
}

export function clear_status_hilites(): void {
  let i = 0;
  for (i = 0; i < MAXBLSTATS; ++i) {
    let temp = null;
    let next = null;
    for (temp = $at2(G.blstats, 0, i).thresholds; temp; temp = next) {
      next = temp.next;
      free(temp);
    }
    $at2(G.blstats, 0, i).thresholds = $at2(G.blstats, 1, i).thresholds = null;
    $at2(G.blstats, 0, i).hilite_rule = $at2(G.blstats, 1, i).hilite_rule = null;
  }
}

function hlattr2attrname(attrib: number, buf: Ptr | null, bufsz: number): Ptr | null {
  if (attrib && buf) {
    let attbuf = new Int8Array(256);
    let k = 0;
    let first = 0;
    attbuf[0] = 0;
    if (attrib === HL_NONE) {
      strcpy(buf, S("normal"));
      return buf;
    }
    if (attrib & HL_BOLD) {
      strcat(P(attbuf), first++ ? S("+bold") : S("bold"));
    }
    if (attrib & HL_INVERSE) {
      strcat(P(attbuf), first++ ? S("+inverse") : S("inverse"));
    }
    if (attrib & HL_ULINE) {
      strcat(P(attbuf), first++ ? S("+underline") : S("underline"));
    }
    if (attrib & HL_BLINK) {
      strcat(P(attbuf), first++ ? S("+blink") : S("blink"));
    }
    if (attrib & HL_DIM) {
      strcat(P(attbuf), first++ ? S("+dim") : S("dim"));
    }
    k = strlen(P(attbuf)) | 0;
    if (k < bufsz - 1) {
      strcpy(buf, P(attbuf));
    }
    return buf;
  }
  return null;
}

async function status_hilite_linestr_add(fld: number, hl: struct_hilite_s | null, mask: number, str: Ptr | null): Promise<void> {
  let tmp = null;
  let nxt = null;
  tmp = new struct__status_hilite_line_str();
  memset(tmp, 0, 288);
  tmp.next = null;
  tmp.id = ++status_hilite_str_id;
  tmp.fld = fld;
  tmp.hl = hl;
  tmp.mask = mask;
  if (fld === BL_TITLE) {
    strcpy(P(tmp.str), str);
  } else {
    await stripchars(P(tmp.str), S(" "), str);
  }
  if (!!(nxt = status_hilite_str)) {
    while (nxt.next) {
      nxt = nxt.next;
    }
    nxt.next = tmp;
  } else {
    status_hilite_str = tmp;
  }
}

function status_hilite_linestr_done(): void {
  let nxt = null;
  let tmp = status_hilite_str;
  while (tmp) {
    nxt = tmp.next;
    free(tmp);
    tmp = nxt;
  }
  status_hilite_str = null;
  status_hilite_str_id = 0;
}

function status_hilite_linestr_countfield(fld: number): number {
  let tmp = null;
  let countall = (fld === BL_FLUSH ? 1 : 0) << 24 >> 24;
  let count = 0;
  for (tmp = status_hilite_str; tmp; tmp = tmp.next) {
    if (countall || tmp.fld === fld) {
      ++count;
    }
  }
  return count;
}

export async function count_status_hilites(): Promise<number> {
  let count = 0;
  await status_hilite_linestr_gather();
  count = status_hilite_linestr_countfield(BL_FLUSH);
  status_hilite_linestr_done();
  return count;
}

async function status_hilite_linestr_gather_conditions(): Promise<void> {
  let $t1: any;
  let i = 0;
  let cond_maps = $sarr(struct__cond_map, 13);
  memset(cond_maps[0], 0, $u64(Math.trunc(208 / 16) | 0) * 16);
  for (i = 0; i < (Math.trunc(208 / 16) | 0); ++i) {
    let clr = NO_COLOR;
    let atr = HL_NONE;
    let j = 0;
    for (j = 0; j < CLR_MAX; ++j) {
      if ((cond_hilites[j] & G.valid_conditions[i].bitmask) >>> 0) {
        clr = j;
        break;
      }
    }
    if ((cond_hilites[HL_ATTCLR_DIM] & G.valid_conditions[i].bitmask) >>> 0) {
      atr |= HL_DIM;
    }
    if ((cond_hilites[HL_ATTCLR_BOLD] & G.valid_conditions[i].bitmask) >>> 0) {
      atr |= HL_BOLD;
    }
    if ((cond_hilites[HL_ATTCLR_BLINK] & G.valid_conditions[i].bitmask) >>> 0) {
      atr |= HL_BLINK;
    }
    if ((cond_hilites[HL_ATTCLR_ULINE] & G.valid_conditions[i].bitmask) >>> 0) {
      atr |= HL_ULINE;
    }
    if ((cond_hilites[HL_ATTCLR_INVERSE] & G.valid_conditions[i].bitmask) >>> 0) {
      atr |= HL_INVERSE;
    }
    if (atr !== HL_NONE) {
      atr &= ~HL_NONE;
    }
    if (clr !== NO_COLOR || atr !== HL_NONE) {
      let ca = $u64(clr | atr << 8);
      let added_condmap = FALSE;
      for (j = 0; j < (Math.trunc(208 / 16) | 0); ++j) {
        if (cond_maps[j].clratr === ca) {
          ($t1 = cond_maps[j], $t1.bm = ($t1.bm | G.valid_conditions[i].bitmask) >>> 0);
          added_condmap = TRUE;
          break;
        }
      }
      if (!added_condmap) {
        for (j = 0; j < (Math.trunc(208 / 16) | 0); ++j) {
          if (!cond_maps[j].bm) {
            cond_maps[j].bm = G.valid_conditions[i].bitmask;
            cond_maps[j].clratr = ca;
            break;
          }
        }
      }
    }
  }
  for (i = 0; i < (Math.trunc(208 / 16) | 0); ++i) {
    if (cond_maps[i].bm) {
      const clr = new Int32Array(1);
      clr[0] = NO_COLOR;
      const atr = new Int32Array(1);
      atr[0] = HL_NONE;
      split_clridx(cond_maps[i].clratr | 0, P(clr, 0), P(atr, 0));
      if (clr[0] !== NO_COLOR || atr[0] !== HL_NONE) {
        let clrbuf = new Int8Array(256);
        let attrbuf = new Int8Array(256);
        let condbuf = new Int8Array(256);
        let tmpattr = null;
        strNsubst(strcpy(P(clrbuf), clr2colorname(clr[0])), S(" "), S("-"), 0);
        tmpattr = hlattr2attrname(atr[0], P(attrbuf), BUFSZ);
        if (tmpattr) {
          sprintf(eos(P(clrbuf)), S("&%s"), tmpattr);
        }
        sprintf(P(condbuf), S("condition/%s/%s"), conditionbitmask2str(cond_maps[i].bm), P(clrbuf));
        await status_hilite_linestr_add(BL_CONDITION, null, cond_maps[i].bm, P(condbuf));
      }
    }
  }
}

async function status_hilite_linestr_gather(): Promise<void> {
  let i = 0;
  let hl = null;
  status_hilite_linestr_done();
  for (i = 0; i < MAXBLSTATS; ++i) {
    hl = $at2(G.blstats, 0, i).thresholds;
    while (hl) {
      await status_hilite_linestr_add(i, hl, 0, await status_hilite2str(hl));
      hl = hl.next;
    }
  }
  await status_hilite_linestr_gather_conditions();
}

async function status_hilite2str(hl: struct_hilite_s | null): Promise<Ptr | null> {
  const clr = new Int32Array(1);
  clr[0] = 0;
  const attr = new Int32Array(1);
  attr[0] = 0;
  let behavebuf = new Int8Array(256);
  let clrbuf = new Int8Array(256);
  let attrbuf = new Int8Array(256);
  let tmpattr = null;
  let op = null;
  if (!hl) {
    return null;
  }
  behavebuf[0] = 0;
  clrbuf[0] = 0;
  op = hl.rel === LT_VALUE ? S("<") : hl.rel === LE_VALUE ? S("<=") : hl.rel === GT_VALUE ? S(">") : hl.rel === GE_VALUE ? S(">=") : hl.rel === EQ_VALUE ? S("=") : null;
  switch (hl.behavior) {
  case 100:
    if (op) {
      sprintf(P(behavebuf), S("%s%d%%"), op, hl.value.a_int);
    } else {
      await impossible(S("hl->behavior=percentage, rel error"));
    }
    break;
  case 102:
    if (hl.rel === LT_VALUE) {
      sprintf(P(behavebuf), S("down"));
    } else if (hl.rel === GT_VALUE) {
      sprintf(P(behavebuf), S("up"));
    } else if (hl.rel === EQ_VALUE) {
      sprintf(P(behavebuf), S("changed"));
    } else {
      await impossible(S("hl->behavior=updown, rel error"));
    }
    break;
  case 101:
    if (op) {
      sprintf(P(behavebuf), S("%s%d"), op, hl.value.a_int);
    } else {
      await impossible(S("hl->behavior=absolute, rel error"));
    }
    break;
  case 104:
    if (hl.rel === TXT_VALUE && hl.textmatch[0]) {
      sprintf(P(behavebuf), S("%s"), P(hl.textmatch));
    } else {
      await impossible(S("hl->behavior=textmatch, rel or textmatch error"));
    }
    break;
  case 103:
    if (hl.rel === EQ_VALUE) {
      sprintf(P(behavebuf), S("%s"), conditionbitmask2str(hl.value.a_ulong));
    } else {
      await impossible(S("hl->behavior=condition, rel error"));
    }
    break;
  case 105:
    sprintf(P(behavebuf), S("always"));
    break;
  case 0:
    break;
  default:
    break;
  }
  split_clridx(hl.coloridx, P(clr, 0), P(attr, 0));
  strNsubst(strcpy(P(clrbuf), clr2colorname(clr[0])), S(" "), S("-"), 0);
  if (attr[0] !== HL_UNDEF) {
    if (!!(tmpattr = hlattr2attrname(attr[0], P(attrbuf), BUFSZ))) {
      sprintf(eos(P(clrbuf)), S("&%s"), tmpattr);
    }
  }
  sprintf(P(status_hilite2str$buf), S("%s/%s/%s"), initblstats[hl.fld].fldname, P(behavebuf), P(clrbuf));
  return P(status_hilite2str$buf);
}

async function status_hilite_menu_choose_field(): Promise<number> {
  let tmpwin = 0;
  let i = 0;
  let res = 0;
  let fld = BL_FLUSH;
  let any = new union_any();
  const picks = [null];
  picks[0] = null;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  for (i = 0; i < MAXBLSTATS; ++i) {
    if (initblstats[i].fld === BL_SCORE && !G.blstats[0][BL_SCORE].thresholds) {
      continue;
    }
    any.$cp(G.zeroany);
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, initblstats[i].fldname, MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Select a hilite field:"));
  res = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (res > 0) {
    fld = picks[0].item.a_int - 1;
    free(picks[0]);
  }
  return fld;
}

async function status_hilite_menu_choose_behavior(fld: number): Promise<number> {
  let tmpwin = 0;
  let res = 0;
  let beh = BL_TH_NONE - 1;
  let any = new union_any();
  const picks = [null];
  picks[0] = null;
  let buf = new Int8Array(256);
  let at = 0;
  let onlybeh = BL_TH_NONE;
  let nopts = 0;
  if (fld < 0 || fld >= MAXBLSTATS) {
    return BL_TH_NONE;
  }
  at = initblstats[fld].anytype | 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  if (fld !== BL_CONDITION) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_ALWAYS_HILITE;
    sprintf(P(buf), S("Always highlight %s"), initblstats[fld].fldname);
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 97, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    ++nopts;
  }
  if (fld === BL_CONDITION) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_CONDITION;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 98, 0, ATR_NONE, S("Bitmask of conditions"), MENU_UNSELECTED);
    ++nopts;
  }
  if (fld !== BL_CONDITION) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_UPDOWN;
    sprintf(P(buf), S("%s value changes"), initblstats[fld].fldname);
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 99, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    ++nopts;
  }
  if (fld !== BL_CAP && fld !== BL_HUNGER && (at === ANY_INT || at === ANY_LONG)) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_VAL_ABSOLUTE;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 110, 0, ATR_NONE, S("Number threshold"), MENU_UNSELECTED);
    ++nopts;
  }
  if (initblstats[fld].idxmax >= 0) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_VAL_PERCENTAGE;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 112, 0, ATR_NONE, S("Percentage threshold"), MENU_UNSELECTED);
    ++nopts;
  }
  if (initblstats[fld].anytype === ANY_STR || fld === BL_CAP || fld === BL_HUNGER) {
    any.$cp(G.zeroany);
    any.a_int = onlybeh = BL_TH_TEXTMATCH;
    sprintf(P(buf), S("%s text match"), initblstats[fld].fldname);
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 116, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    ++nopts;
  }
  sprintf(P(buf), S("Select %s field hilite behavior:"), initblstats[fld].fldname);
  await G.windowprocs.win_end_menu(tmpwin, P(buf));
  if (nopts > 1) {
    res = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
    if (res === 0) {
      beh = BL_TH_NONE;
    } else if (res === -1) {
      beh = BL_TH_NONE - 1;
    }
  } else if (onlybeh !== BL_TH_NONE) {
    beh = onlybeh;
  }
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (res > 0) {
    beh = picks[0].item.a_int;
    free(picks[0]);
  }
  return beh;
}

async function status_hilite_menu_choose_updownboth(fld: number, str: Ptr | null, ltok: number, gtok: number): Promise<number> {
  let res = 0;
  let ret = NO_LTEQGT;
  let tmpwin = 0;
  let buf = new Int8Array(256);
  let any = new union_any();
  const picks = [null];
  picks[0] = null;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  if (ltok) {
    if (str) {
      sprintf(P(buf), S("%s than %s"), fld === BL_AC ? S("Better (lower)") : S("Less"), str);
    } else {
      sprintf(P(buf), S("Value goes down"));
    }
    any.$cp(G.zeroany);
    any.a_int = 10 + LT_VALUE;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    if (str) {
      sprintf(P(buf), S("%s or %s"), str, fld === BL_AC ? S("better (lower)") : S("less"));
      any.$cp(G.zeroany);
      any.a_int = 10 + LE_VALUE;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    }
  }
  if (str) {
    sprintf(P(buf), S("Exactly %s"), str);
  } else {
    sprintf(P(buf), S("Value changes"));
  }
  any.$cp(G.zeroany);
  any.a_int = 10 + EQ_VALUE;
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  if (gtok) {
    if (str) {
      sprintf(P(buf), S("%s or %s"), str, fld === BL_AC ? S("worse (higher)") : S("more"));
      any.$cp(G.zeroany);
      any.a_int = 10 + GE_VALUE;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
    }
    if (str) {
      sprintf(P(buf), S("%s than %s"), fld === BL_AC ? S("Worse (higher)") : S("More"), str);
    } else {
      sprintf(P(buf), S("Value goes up"));
    }
    any.$cp(G.zeroany);
    any.a_int = 10 + GT_VALUE;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  }
  sprintf(P(buf), S("Select field %s value:"), initblstats[fld].fldname);
  await G.windowprocs.win_end_menu(tmpwin, P(buf));
  res = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (res > 0) {
    ret = picks[0].item.a_int - 10;
    free(picks[0]);
  }
  return ret;
}

async function status_hilite_menu_add(origfld: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any;
  let $g = 0;
  let fld = 0;
  let behavior = 0;
  let lt_gt_eq = 0;
  let clr = 0;
  let atr = 0;
  let hilite = new struct_hilite_s();
  let cond = 0;
  let colorqry = new Int8Array(256);
  let attrqry = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      clr = NO_COLOR;
      atr = HL_UNDEF;
      hilite = new struct_hilite_s();
      cond = 0;
      colorqry = new Int8Array(256);
      attrqry = new Int8Array(256);
    case 1: // choose_field
      fld = origfld;
      if (fld === BL_FLUSH) {
        fld = await status_hilite_menu_choose_field();
        if (fld === BL_FLUSH) {
          return FALSE;
        }
      }
      if (fld === BL_FLUSH) {
        return FALSE;
      }
      colorqry[0] = 0;
      attrqry[0] = 0;
      memset(hilite, 0, 128);
      hilite.next = null;
      hilite.set = FALSE;
      hilite.fld = fld;
    case 2: // choose_behavior
      behavior = await status_hilite_menu_choose_behavior(fld);
      if (behavior === BL_TH_NONE - 1) {
        return FALSE;
      } else if (behavior === BL_TH_NONE) {
        if (origfld === BL_FLUSH) {
          { $g = 1; continue $L; }
        }
        return FALSE;
      }
      hilite.behavior = behavior;
    case 3: // choose_value
      if (behavior === BL_TH_VAL_PERCENTAGE || behavior === BL_TH_VAL_ABSOLUTE) {
        let inbuf = new Int8Array(256);
        let buf = new Int8Array(256);
        let aval = new union_any();
        let val = 0;
        let dt = 0;
        let gotnum = FALSE;
        let percent = (behavior === BL_TH_VAL_PERCENTAGE ? 1 : 0) << 24 >> 24;
        let inp = null;
        let numstart = null;
        let op = null;
        lt_gt_eq = NO_LTEQGT;
        inbuf[0] = 0;
        sprintf(P(buf), S("Enter %svalue for %s threshold:"), percent ? S("percentage ") : S(""), initblstats[fld].fldname);
        await G.windowprocs.win_getlin(P(buf), P(inbuf));
        if (inbuf[0] === 0 || inbuf[0] === 27) {
          { $g = 2; continue $L; }
        }
        inp = numstart = trimspaces(P(inbuf));
        if (!inp.a[inp.o]) {
          { $g = 2; continue $L; }
        }
        if (inp.a[inp.o] === 62 || inp.a[inp.o] === 60 || inp.a[inp.o] === 61) {
          lt_gt_eq = inp.a[inp.o] === 62 ? inp.a[inp.o + 1] === 61 ? GE_VALUE : GT_VALUE : inp.a[inp.o] === 60 ? inp.a[inp.o + 1] === 61 ? LE_VALUE : LT_VALUE : EQ_VALUE;
          $wr(($t1 = inp, inp = $t1.add(1), $t1), 0, 32);
          numstart = numstart.add(1);
          if (lt_gt_eq === GE_VALUE || lt_gt_eq === LE_VALUE) {
            $wr(($t2 = inp, inp = $t2.add(1), $t2), 0, 32);
            numstart = numstart.add(1);
          }
        }
        if (inp.a[inp.o] === 45) {
          inp = inp.add(1);
        } else if (inp.a[inp.o] === 43) {
          $wr(($t3 = inp, inp = $t3.add(1), $t3), 0, 32);
          numstart = numstart.add(1);
        }
        while (digit(inp.a[inp.o])) {
          inp = inp.add(1);
          gotnum = TRUE;
        }
        if (inp.a[inp.o] === 37) {
          if (!percent) {
            await pline(S("Not expecting a percentage."));
            { $g = 2; continue $L; }
          }
          inp.a[inp.o] = 0;
        } else if (inp.a[inp.o]) {
          await pline(S("\"%s\" is not a recognized number."), inp);
          { $g = 3; continue $L; }
        }
        if (!gotnum) {
          await pline(S("Is that an invisible number?"));
          { $g = 3; continue $L; }
        }
        op = lt_gt_eq === LT_VALUE ? S("<") : lt_gt_eq === LE_VALUE ? S("<=") : lt_gt_eq === GT_VALUE ? S(">") : lt_gt_eq === GE_VALUE ? S(">=") : lt_gt_eq === EQ_VALUE ? S("=") : S("");
        aval.$cp(G.zeroany);
        dt = (percent ? ANY_INT : initblstats[fld].anytype) | 0;
        s_to_anything(aval, numstart, dt);
        if (percent) {
          val = aval.a_int;
          if (initblstats[fld].idxmax === -1) {
            await pline(S("Field '%s' does not support percentage values."), initblstats[fld].fldname);
            behavior = BL_TH_VAL_ABSOLUTE;
            { $g = 3; continue $L; }
          }
          if (val < 0 && (val !== -1 || lt_gt_eq !== GT_VALUE) || val === 0 && lt_gt_eq === LT_VALUE || val === 100 && lt_gt_eq === GT_VALUE || val > 100 && (val !== 101 || lt_gt_eq !== LT_VALUE)) {
            await pline(S("'%s%d%%' is not a valid percent value."), op, val);
            { $g = 3; continue $L; }
          }
          if (!strchr(numstart, 37)) {
            strcat(numstart, S("%"));
          }
        } else if (dt === ANY_INT && aval.a_int < (fld === BL_AC ? -128 : lt_gt_eq === GT_VALUE ? -1 : lt_gt_eq === LT_VALUE ? 1 : 0)) {
          await pline(S("%s'%s%d'%s"), P(threshold_value), op, aval.a_int, P(is_out_of_range));
          { $g = 3; continue $L; }
        } else if (dt === ANY_LONG && aval.a_long < (lt_gt_eq === GT_VALUE ? -1 : lt_gt_eq === LT_VALUE ? 1 : 0)) {
          await pline(S("%s'%s%ld'%s"), P(threshold_value), op, aval.a_long, P(is_out_of_range));
          { $g = 3; continue $L; }
        }
        if (lt_gt_eq === NO_LTEQGT) {
          let ltok = (dt === ANY_INT ? aval.a_int > 0 || fld === BL_AC ? 1 : 0 : aval.a_long > 0 ? 1 : 0) << 24 >> 24;
          let gtok = (!percent || aval.a_long < 100 ? 1 : 0) << 24 >> 24;
          lt_gt_eq = await status_hilite_menu_choose_updownboth(fld, P(inbuf), ltok, gtok);
          if (lt_gt_eq === NO_LTEQGT) {
            { $g = 3; continue $L; }
          }
        }
        sprintf(P(colorqry), S("Choose a color for when %s is %s%s%s:"), initblstats[fld].fldname, lt_gt_eq === LT_VALUE ? S("less than ") : lt_gt_eq === GT_VALUE ? S("more than ") : S(""), numstart, lt_gt_eq === LE_VALUE ? S(" or less") : lt_gt_eq === GE_VALUE ? S(" or more") : S(""));
        sprintf(P(attrqry), S("Choose attribute for when %s is %s%s%s:"), initblstats[fld].fldname, lt_gt_eq === LT_VALUE ? S("less than ") : lt_gt_eq === GT_VALUE ? S("more than ") : S(""), numstart, lt_gt_eq === LE_VALUE ? S(" or less") : lt_gt_eq === GE_VALUE ? S(" or more") : S(""));
        hilite.rel = lt_gt_eq;
        hilite.value.$cp(aval);
      } else if (behavior === BL_TH_UPDOWN) {
        if (initblstats[fld].anytype !== ANY_STR) {
          let ltok = (fld !== BL_TIME ? 1 : 0) << 24 >> 24;
          let gtok = TRUE;
          lt_gt_eq = await status_hilite_menu_choose_updownboth(fld, null, ltok, gtok);
          if (lt_gt_eq === NO_LTEQGT) {
            { $g = 2; continue $L; }
          }
        } else {
          lt_gt_eq = EQ_VALUE;
        }
        sprintf(P(colorqry), S("Choose a color for when %s %s:"), initblstats[fld].fldname, lt_gt_eq === EQ_VALUE ? S("changes") : lt_gt_eq === LT_VALUE ? S("decreases") : S("increases"));
        sprintf(P(attrqry), S("Choose attribute for when %s %s:"), initblstats[fld].fldname, lt_gt_eq === EQ_VALUE ? S("changes") : lt_gt_eq === LT_VALUE ? S("decreases") : S("increases"));
        hilite.rel = lt_gt_eq;
      } else if (behavior === BL_TH_CONDITION) {
        cond = await query_conditions();
        if (!cond) {
          if (origfld === BL_FLUSH) {
            { $g = 1; continue $L; }
          }
          return FALSE;
        }
        sprintf(P(colorqry), S("Choose a color for conditions %s:"), conditionbitmask2str(cond));
        sprintf(P(attrqry), S("Choose attribute for conditions %s:"), conditionbitmask2str(cond));
      } else if (behavior === BL_TH_TEXTMATCH) {
        let qry_buf = new Int8Array(256);
        sprintf(P(qry_buf), S("%s %s text value to match:"), fld === BL_CAP || fld === BL_ALIGN || fld === BL_HUNGER || fld === BL_TITLE ? S("Choose") : S("Enter"), initblstats[fld].fldname);
        if (fld === BL_CAP) {
          let rv = await query_arrayvalue(P(qry_buf), P(G.enc_stat), SLT_ENCUMBER, OVERLOADED + 1);
          if (rv < SLT_ENCUMBER) {
            { $g = 2; continue $L; }
          }
          hilite.rel = TXT_VALUE;
          strcpy(P(hilite.textmatch), G.enc_stat[rv]);
        } else if (fld === BL_ALIGN) {
          let rv = await query_arrayvalue(P(qry_buf), P(status_hilite_menu_add$aligntxt), 0, 2 + 1);
          if (rv < 0) {
            { $g = 2; continue $L; }
          }
          hilite.rel = TXT_VALUE;
          strcpy(P(hilite.textmatch), status_hilite_menu_add$aligntxt[rv]);
        } else if (fld === BL_HUNGER) {
          let rv = await query_arrayvalue(P(qry_buf), P(status_hilite_menu_add$hutxt), SATIATED, STARVED + 1);
          if (rv < SATIATED) {
            { $g = 2; continue $L; }
          }
          hilite.rel = TXT_VALUE;
          strcpy(P(hilite.textmatch), status_hilite_menu_add$hutxt[rv]);
        } else if (fld === BL_TITLE) {
          let rolelist = new Array(28).fill(null);
          let mbuf = new Int8Array(80);
          let fbuf = new Int8Array(80);
          let obuf = new Int8Array(80);
          let i = 0;
          let j = 0;
          let rv = 0;
          for (i = j = 0; i < 9; ++i) {
            sprintf(P(mbuf), S("\"%s\""), G.urole.rank[i].m);
            if (G.urole.rank[i].f) {
              sprintf(P(fbuf), S("\"%s\""), G.urole.rank[i].f);
              sprintf(P(obuf), S("%s or %s"), G.flags.female ? P(fbuf) : P(mbuf), G.flags.female ? P(mbuf) : P(fbuf));
            } else {
              fbuf[0] = obuf[0] = 0;
            }
            if (G.flags.female) {
              if ($rd(P(fbuf))) {
                ($t4 = await dupstr(P(fbuf)), rolelist[j++] = $t4);
              }
              ($t5 = await dupstr(P(mbuf)), rolelist[j++] = $t5);
              if ($rd(P(obuf))) {
                ($t6 = await dupstr(P(obuf)), rolelist[j++] = $t6);
              }
            } else {
              ($t7 = await dupstr(P(mbuf)), rolelist[j++] = $t7);
              if ($rd(P(fbuf))) {
                ($t8 = await dupstr(P(fbuf)), rolelist[j++] = $t8);
              }
              if ($rd(P(obuf))) {
                ($t9 = await dupstr(P(obuf)), rolelist[j++] = $t9);
              }
            }
          }
          ($t10 = await dupstr(S("\"none of the above (polymorphed)\"")), rolelist[j++] = $t10);
          rv = await query_arrayvalue(P(qry_buf), P(rolelist), 0, j);
          if (rv >= 0) {
            hilite.rel = TXT_VALUE;
            strcpy(P(hilite.textmatch), rolelist[rv]);
          }
          for (i = 0; i < j; ++i) {
            free(rolelist[i]), rolelist[i] = null;
          }
          if (rv < 0) {
            { $g = 2; continue $L; }
          }
        } else {
          let inbuf = new Int8Array(256);
          inbuf[0] = 0;
          await G.windowprocs.win_getlin(P(qry_buf), P(inbuf));
          if (inbuf[0] === 0 || inbuf[0] === 27) {
            { $g = 2; continue $L; }
          }
          hilite.rel = TXT_VALUE;
          if (strlen(P(inbuf)) < 80) {
            strcpy(P(hilite.textmatch), P(inbuf));
          } else {
            return FALSE;
          }
        }
        sprintf(P(colorqry), S("Choose a color for when %s is '%s':"), initblstats[fld].fldname, P(hilite.textmatch));
        sprintf(P(attrqry), S("Choose attribute for when %s is '%s':"), initblstats[fld].fldname, P(hilite.textmatch));
      } else if (behavior === BL_TH_ALWAYS_HILITE) {
        sprintf(P(colorqry), S("Choose a color to always hilite %s:"), initblstats[fld].fldname);
        sprintf(P(attrqry), S("Choose attribute to always hilite %s:"), initblstats[fld].fldname);
      }
    case 4: // choose_color
      clr = await query_color(P(colorqry));
      if (clr === -1) {
        if (behavior !== BL_TH_ALWAYS_HILITE) {
          { $g = 3; continue $L; }
        } else {
          { $g = 2; continue $L; }
        }
      }
      atr = await query_attr(P(attrqry));
      if (atr === -1) {
        { $g = 4; continue $L; }
      }
      if (behavior === BL_TH_CONDITION) {
        let clrbuf = new Int8Array(256);
        let attrbuf = new Int8Array(256);
        let tmpattr = null;
        if (atr & HL_DIM) {
          cond_hilites[HL_ATTCLR_DIM] = (cond_hilites[HL_ATTCLR_DIM] | cond) >>> 0;
        }
        if (atr & HL_BLINK) {
          cond_hilites[HL_ATTCLR_BLINK] = (cond_hilites[HL_ATTCLR_BLINK] | cond) >>> 0;
        }
        if (atr & HL_ULINE) {
          cond_hilites[HL_ATTCLR_ULINE] = (cond_hilites[HL_ATTCLR_ULINE] | cond) >>> 0;
        }
        if (atr & HL_INVERSE) {
          cond_hilites[HL_ATTCLR_INVERSE] = (cond_hilites[HL_ATTCLR_INVERSE] | cond) >>> 0;
        }
        if (atr & HL_BOLD) {
          cond_hilites[HL_ATTCLR_BOLD] = (cond_hilites[HL_ATTCLR_BOLD] | cond) >>> 0;
        }
        if (atr === HL_NONE) {
          cond_hilites[HL_ATTCLR_DIM] = (cond_hilites[HL_ATTCLR_DIM] & ~cond >>> 0) >>> 0;
          cond_hilites[HL_ATTCLR_BLINK] = (cond_hilites[HL_ATTCLR_BLINK] & ~cond >>> 0) >>> 0;
          cond_hilites[HL_ATTCLR_ULINE] = (cond_hilites[HL_ATTCLR_ULINE] & ~cond >>> 0) >>> 0;
          cond_hilites[HL_ATTCLR_INVERSE] = (cond_hilites[HL_ATTCLR_INVERSE] & ~cond >>> 0) >>> 0;
          cond_hilites[HL_ATTCLR_BOLD] = (cond_hilites[HL_ATTCLR_BOLD] & ~cond >>> 0) >>> 0;
        }
        cond_hilites[clr] = (cond_hilites[clr] | cond) >>> 0;
        strNsubst(strcpy(P(clrbuf), clr2colorname(clr)), S(" "), S("-"), 0);
        tmpattr = hlattr2attrname(atr, P(attrbuf), BUFSZ);
        if (tmpattr) {
          sprintf(eos(P(clrbuf)), S("&%s"), tmpattr);
        }
        await pline(S("Added hilite condition/%s/%s"), conditionbitmask2str(cond), P(clrbuf));
      } else {
        let p = null;
        let q = null;
        hilite.coloridx = clr | atr << 8;
        hilite.anytype = initblstats[fld].anytype;
        if (fld === BL_TITLE && !!(p = strstri(P(hilite.textmatch), S(" or ")))) {
          p.a[p.o] = 0;
          await status_hilite_add_threshold(fld, hilite);
          await pline(S("Added hilite %s"), await status_hilite2str(hilite));
          p = p.add(5 - 1);
          q = P(hilite.textmatch);
          while ($wr(($t11 = q, q = $t11.add(1), $t11), 0, $rd(($t12 = p, p = $t12.add(1), $t12))) !== 0) {
            continue;
          }
        }
        await status_hilite_add_threshold(fld, hilite);
        await pline(S("Added hilite %s"), await status_hilite2str(hilite));
      }
      reset_status_hilites();
      return TRUE;
    }
    break;
  }
}

export function status_hilite_remove(id: number): number {
  let hlstr = status_hilite_str;
  while (hlstr && hlstr.id !== id) {
    hlstr = hlstr.next;
  }
  if (!hlstr) {
    return FALSE;
  }
  if (hlstr.fld === BL_CONDITION) {
    let i = 0;
    for (i = 0; i < CLR_MAX; ++i) {
      cond_hilites[i] = (cond_hilites[i] & ~hlstr.mask >>> 0) >>> 0;
    }
    cond_hilites[HL_ATTCLR_DIM] = (cond_hilites[HL_ATTCLR_DIM] & ~hlstr.mask >>> 0) >>> 0;
    cond_hilites[HL_ATTCLR_BOLD] = (cond_hilites[HL_ATTCLR_BOLD] & ~hlstr.mask >>> 0) >>> 0;
    cond_hilites[HL_ATTCLR_BLINK] = (cond_hilites[HL_ATTCLR_BLINK] & ~hlstr.mask >>> 0) >>> 0;
    cond_hilites[HL_ATTCLR_ULINE] = (cond_hilites[HL_ATTCLR_ULINE] & ~hlstr.mask >>> 0) >>> 0;
    cond_hilites[HL_ATTCLR_INVERSE] = (cond_hilites[HL_ATTCLR_INVERSE] & ~hlstr.mask >>> 0) >>> 0;
    return TRUE;
  } else {
    let fld = hlstr.fld;
    let hl = null;
    let hlprev = null;
    for (hl = $at2(G.blstats, 0, fld).thresholds; hl; hl = hl.next) {
      if (hlstr.hl === hl) {
        if (hlprev) {
          hlprev.next = hl.next;
        } else {
          $at2(G.blstats, 0, fld).thresholds = hl.next;
          $at2(G.blstats, 1, fld).thresholds = $at2(G.blstats, 0, fld).thresholds;
        }
        if ($at2(G.blstats, 0, fld).hilite_rule === hl) {
          $at2(G.blstats, 0, fld).hilite_rule = $at2(G.blstats, 1, fld).hilite_rule = null;
          $at2(G.blstats, 0, fld).time = $at2(G.blstats, 1, fld).time = 0;
        }
        free(hl);
        return TRUE;
      }
      hlprev = hl;
    }
  }
  return FALSE;
}

export async function status_hilite_menu_fld(fld: number): Promise<number> {
  let $g = 0;
  let tmpwin = 0;
  let i = 0;
  let res = 0;
  let picks = [null];
  let any = new union_any();
  let count = 0;
  let hlstr = null;
  let buf = new Int8Array(256);
  let acted = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      picks[0] = null;
      any = new union_any();
      count = status_hilite_linestr_countfield(fld);
      buf = new Int8Array(256);
      acted = FALSE;
      if (!count) {
        if (await status_hilite_menu_add(fld)) {
          status_hilite_linestr_done();
          await status_hilite_linestr_gather();
          count = status_hilite_linestr_countfield(fld);
        } else {
          return FALSE;
        }
      }
      tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_start_menu(tmpwin);
      if (count) {
        hlstr = status_hilite_str;
        while (hlstr) {
          if (hlstr.fld === fld) {
            any.$cp(G.zeroany);
            any.a_int = hlstr.id;
            await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(hlstr.str), MENU_UNSELECTED);
          }
          hlstr = hlstr.next;
        }
      } else {
        any.$cp(G.zeroany);
        sprintf(P(buf), S("No current hilites for %s"), initblstats[fld].fldname);
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
      any.$cp(G.zeroany);
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
      if (count) {
        any.$cp(G.zeroany);
        any.a_int = -1;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 88, 0, ATR_NONE, S("Remove selected hilites"), MENU_UNSELECTED);
      }
      if (fld === BL_SCORE) {
        ;
      } else {
        any.$cp(G.zeroany);
        any.a_int = -2;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 90, 0, ATR_NONE, S("Add a new hilite"), MENU_UNSELECTED);
      }
      sprintf(P(buf), S("Current %s hilites:"), initblstats[fld].fldname);
      await G.windowprocs.win_end_menu(tmpwin, P(buf));
      if ((res = await G.windowprocs.win_select_menu(tmpwin, PICK_ANY, P(picks, 0))) > 0) {
        let mode = 0;
        for (i = 0; i < res; ++i) {
          let idx = $sadd(picks[0], i).item.a_int;
          if (idx === -1) {
            if (mode) {
              { $g = 1; continue $L; }
            }
            mode = -1;
            break;
          } else if (idx === -2) {
            if (mode) {
              { $g = 1; continue $L; }
            }
            mode = -2;
            break;
          }
        }
        if (mode === -1) {
          for (i = 0; i < res; ++i) {
            let idx = $sadd(picks[0], i).item.a_int;
            if (idx > 0) {
              status_hilite_remove(idx);
            }
          }
          reset_status_hilites();
          acted = TRUE;
        } else if (mode === -2) {
          if (await status_hilite_menu_add(fld)) {
            acted = TRUE;
          }
        }
        free(picks[0]);
      }
    case 1: // shlmenu_free
      picks[0] = null;
      await G.windowprocs.win_destroy_nhwindow(tmpwin);
      return acted;
    }
    break;
  }
}

export async function status_hilites_viewall(): Promise<void> {
  let datawin = 0;
  let hlstr = status_hilite_str;
  let buf = new Int8Array(256);
  datawin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  while (hlstr) {
    sprintf(P(buf), S("OPTIONS=hilite_status: %.*s"), BUFSZ - 24 - 1, P(hlstr.str));
    await G.windowprocs.win_putstr(datawin, 0, P(buf));
    hlstr = hlstr.next;
  }
  await G.windowprocs.win_display_nhwindow(datawin, FALSE);
  await G.windowprocs.win_destroy_nhwindow(datawin);
}

export async function status_hilite_menu(): Promise<number> {
  let $g = 0;
  let tmpwin = 0;
  let i = 0;
  let res = 0;
  let picks = [null];
  let any = new union_any();
  let redo = 0;
  let countall = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      picks[0] = null;
      any = new union_any();
    case 1: // shlmenu_redo
      redo = FALSE;
      tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_start_menu(tmpwin);
      await status_hilite_linestr_gather();
      countall = status_hilite_linestr_countfield(BL_FLUSH);
      if (countall) {
        any.$cp(G.zeroany);
        any.a_int = -1;
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S("View all hilites in config format"), MENU_UNSELECTED);
        any.$cp(G.zeroany);
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
      }
      for (i = 0; i < MAXBLSTATS; ++i) {
        let count = status_hilite_linestr_countfield(i);
        let buf = new Int8Array(256);
        if (initblstats[i].fld === BL_SCORE && !count) {
          continue;
        }
        any.$cp(G.zeroany);
        any.a_int = i + 1;
        sprintf(P(buf), S("%-18s"), initblstats[i].fldname);
        if (count) {
          sprintf(eos(P(buf)), S(" (%d defined)"), count);
        }
        await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
      }
      await G.windowprocs.win_end_menu(tmpwin, S("Status hilites:"));
      if ((res = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(picks, 0))) > 0) {
        i = picks[0].item.a_int - 1;
        if (i < 0) {
          await status_hilites_viewall();
        } else {
          await status_hilite_menu_fld(i);
        }
        free(picks[0]), picks[0] = null;
        redo = TRUE;
      }
      await G.windowprocs.win_destroy_nhwindow(tmpwin);
      countall = status_hilite_linestr_countfield(BL_FLUSH);
      status_hilite_linestr_done();
      if (redo) {
        { $g = 1; continue $L; }
      }
      if (countall > 0 && !G.iflags.hilite_delta) {
        await pline(S("To have highlights become active, set 'statushilites' option to non-zero."));
      }
      return TRUE;
    }
    break;
  }
}

export function $init(): void {
  G.enc_stat = [S(""),
S("Burdened"),
S("Stressed"),
S("Strained"),
S("Overtaxed"),
S("Overloaded")];
  mrank_sz = 0;
  initblstats = $sarrOf([struct_istat_s.$of(S("title"), S("%s"), 0, 0, 0, 0, ANY_STR, union_any.$of_a_void(null), null, 80, -1, BL_TITLE),
struct_istat_s.$of(S("strength"), S(" St:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_STR),
struct_istat_s.$of(S("dexterity"), S(" Dx:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_DX),
struct_istat_s.$of(S("constitution"), S(" Co:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_CO),
struct_istat_s.$of(S("intelligence"), S(" In:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_IN),
struct_istat_s.$of(S("wisdom"), S(" Wi:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_WI),
struct_istat_s.$of(S("charisma"), S(" Ch:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_CH),
struct_istat_s.$of(S("alignment"), S(" %s"), 0, 0, 0, 0, ANY_STR, union_any.$of_a_void(null), null, 40, -1, BL_ALIGN),
struct_istat_s.$of(S("score"), S(" S:%s"), 0, 0, 0, 0, ANY_LONG, union_any.$of_a_void(null), null, 20, -1, BL_SCORE),
struct_istat_s.$of(S("carrying-capacity"), S(" %s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 20, -1, BL_CAP),
struct_istat_s.$of(S("gold"), S(" %s"), 0, 0, 0, 0, ANY_LONG, union_any.$of_a_void(null), null, 30, -1, BL_GOLD),
struct_istat_s.$of(S("power"), S(" Pw:%s"), 0, 0, 1, 0, ANY_INT, union_any.$of_a_void(null), null, 10, BL_ENEMAX, BL_ENE),
struct_istat_s.$of(S("power-max"), S("(%s)"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_ENEMAX),
struct_istat_s.$of(S("experience-level"), S(" Xp:%s"), 0, 0, 1, 0, ANY_INT, union_any.$of_a_void(null), null, 10, BL_EXP, BL_XP),
struct_istat_s.$of(S("armor-class"), S(" AC:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_AC),
struct_istat_s.$of(S("HD"), S(" HD:%s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_HD),
struct_istat_s.$of(S("time"), S(" T:%s"), 0, 0, 0, 0, ANY_LONG, union_any.$of_a_void(null), null, 20, -1, BL_TIME),
struct_istat_s.$of(S("hunger"), S(" %s"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 40, -1, BL_HUNGER),
struct_istat_s.$of(S("hitpoints"), S(" HP:%s"), 0, 0, 1, 0, ANY_INT, union_any.$of_a_void(null), null, 10, BL_HPMAX, BL_HP),
struct_istat_s.$of(S("hitpoints-max"), S("(%s)"), 0, 0, 0, 0, ANY_INT, union_any.$of_a_void(null), null, 10, -1, BL_HPMAX),
struct_istat_s.$of(S("dungeon-level"), S("%s"), 0, 0, 0, 0, ANY_STR, union_any.$of_a_void(null), null, 80, -1, BL_LEVELDESC),
struct_istat_s.$of(S("experience"), S("/%s"), 0, 0, 1, 0, ANY_LONG, union_any.$of_a_void(null), null, 20, BL_EXP, BL_EXP),
struct_istat_s.$of(S("condition"), S("%s"), 0, 0, 0, 0, ANY_MASK32, union_any.$of_a_void(null), null, 0, -1, BL_CONDITION)]);
  G.blstats = $arr(2, () => $sarr(struct_istat_s, 23));
  blinit = 0;
  update_all = 0;
  valset = new Int8Array(23);
  bl_hilite_moves = 0;
  cond_hilites = new Float64Array(21);
  now_or_before_idx = 0;
  G.status_hilites = $sarr(struct_hilite_s, 23);
  fieldids_alias = $sarrOf([struct_fieldid_t.$of(S("characteristics"), BL_CHARACTERISTICS),
struct_fieldid_t.$of(S("encumbrance"), BL_CAP),
struct_fieldid_t.$of(S("experience-points"), BL_EXP),
struct_fieldid_t.$of(S("dx"), BL_DX),
struct_fieldid_t.$of(S("co"), BL_CO),
struct_fieldid_t.$of(S("con"), BL_CO),
struct_fieldid_t.$of(S("points"), BL_SCORE),
struct_fieldid_t.$of(S("cap"), BL_CAP),
struct_fieldid_t.$of(S("pw"), BL_ENE),
struct_fieldid_t.$of(S("pw-max"), BL_ENEMAX),
struct_fieldid_t.$of(S("xl"), BL_XP),
struct_fieldid_t.$of(S("xplvl"), BL_XP),
struct_fieldid_t.$of(S("ac"), BL_AC),
struct_fieldid_t.$of(S("hit-dice"), BL_HD),
struct_fieldid_t.$of(S("turns"), BL_TIME),
struct_fieldid_t.$of(S("hp"), BL_HP),
struct_fieldid_t.$of(S("hp-max"), BL_HPMAX),
struct_fieldid_t.$of(S("dgn"), BL_LEVELDESC),
struct_fieldid_t.$of(S("xp"), BL_EXP),
struct_fieldid_t.$of(S("exp"), BL_EXP),
struct_fieldid_t.$of(S("flags"), BL_CONDITION),
struct_fieldid_t.$of(null, BL_FLUSH)]);
  threshold_value = $cs("hilite_status threshold ", 25);
  is_out_of_range = $cs(" is out of range", 17);
  G.valid_conditions = $sarrOf([struct_condmap.$of(S("stone"), BL_MASK_STONE),
struct_condmap.$of(S("slime"), BL_MASK_SLIME),
struct_condmap.$of(S("strngl"), BL_MASK_STRNGL),
struct_condmap.$of(S("foodPois"), BL_MASK_FOODPOIS),
struct_condmap.$of(S("termIll"), BL_MASK_TERMILL),
struct_condmap.$of(S("blind"), BL_MASK_BLIND),
struct_condmap.$of(S("deaf"), BL_MASK_DEAF),
struct_condmap.$of(S("stun"), BL_MASK_STUN),
struct_condmap.$of(S("conf"), BL_MASK_CONF),
struct_condmap.$of(S("hallu"), BL_MASK_HALLU),
struct_condmap.$of(S("lev"), BL_MASK_LEV),
struct_condmap.$of(S("fly"), BL_MASK_FLY),
struct_condmap.$of(S("ride"), BL_MASK_RIDE)]);
  G.condition_aliases = $sarrOf([struct_condmap.$of(S("strangled"), BL_MASK_STRNGL),
struct_condmap.$of(S("all"), BL_MASK_STONE | BL_MASK_SLIME | BL_MASK_STRNGL | BL_MASK_FOODPOIS | BL_MASK_TERMILL | BL_MASK_BLIND | BL_MASK_DEAF | BL_MASK_STUN | BL_MASK_CONF | BL_MASK_HALLU | BL_MASK_LEV | BL_MASK_FLY | BL_MASK_RIDE),
struct_condmap.$of(S("major_troubles"), BL_MASK_STONE | BL_MASK_SLIME | BL_MASK_STRNGL | BL_MASK_FOODPOIS | BL_MASK_TERMILL),
struct_condmap.$of(S("minor_troubles"), BL_MASK_BLIND | BL_MASK_DEAF | BL_MASK_STUN | BL_MASK_CONF | BL_MASK_HALLU),
struct_condmap.$of(S("movement"), BL_MASK_LEV | BL_MASK_FLY | BL_MASK_RIDE)]);
  status_hilite_str = null;
  status_hilite_str_id = 0;
  get_strength_str$buf = new Int8Array(32);
  do_statusline1$newbot1 = new Int8Array(256);
  do_statusline2$newbot2 = new Int8Array(256);
  do_statusline2$dloc = new Int8Array(128);
  do_statusline2$hlth = new Int8Array(128);
  do_statusline2$expr = new Int8Array(128);
  do_statusline2$tmmv = new Int8Array(128);
  do_statusline2$cond = new Int8Array(128);
  eval_notify_windowport_field$oldrndencode = 0;
  eval_notify_windowport_field$oldgoldsym = 0;
  init_blstats$initalready = 0;
  splitsubfields$subfields = new Array(16).fill(null);
  parse_status_hl2$aligntxt = [S("chaotic"), S("neutral"), S("lawful")];
  parse_status_hl2$hutxt = [S("Satiated"),
S(""),
S("Hungry"),
S("Weak"),
S("Fainting"),
S("Fainted"),
S("Starved")];
  conditionbitmask2str$buf = new Int8Array(256);
  status_hilite2str$buf = new Int8Array(256);
  status_hilite_menu_add$aligntxt = [S("chaotic"), S("neutral"), S("lawful")];
  status_hilite_menu_add$hutxt = [S("Satiated"),
null,
S("Hungry"),
S("Weak"),
S("Fainting"),
S("Fainted"),
S("Starved")];
}
