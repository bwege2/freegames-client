// @ts-nocheck
// NetHack 3.6.7 end.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { arti_cost, artifact_name } from './artifact.ts';
import { adjattrib } from './attrib.ts';
import { lift_covet_and_placebc } from './ball.ts';
import { can_make_bones, savebones } from './bones.ts';
import { bot, do_statusline1, do_statusline2 } from './botl.ts';
import { enlightenment, isok, paranoid_query, show_conduct, yn_function } from './cmd.ts';
import { dump_map } from './detect.ts';
import { curs_on_u } from './display.ts';
import { dlb_cleanup } from './dlb.ts';
import { Monnam, free_oname, m_monnam, mon_nam } from './do_name.ts';
import { keepdogs } from './dog.ts';
import { endmultishot } from './dothrow.ts';
import { init_symbols } from './drawing.ts';
import { In_quest, deepest_lev_reached, depth, dunlev, on_level, show_overview } from './dungeon.ts';
import { init_uhunger } from './eat.ts';
import { make_grave } from './engrave.ts';
import { clearlocks, debugcore, paniclog, set_error_savefile } from './files.ts';
import { money_cnt, nomul } from './hack.ts';
import { copynchars, digit, dist2, eos, getnow, midnight, night, strncmpi, strstri, upstart, yyyymmddhhmmss } from './hacklib.ts';
import { carrying, currency, display_inventory, free_pickinv_cache, sortloot, stackobj, unsortloot, update_inventory, useup } from './invent.ts';
import { adj_lev } from './makemon.ts';
import { expels } from './mhitu.ts';
import { bless, mk_named_object, mksobj, place_object } from './mkobj.ts';
import { unstuck } from './mon.ts';
import { sticks } from './mondata.ts';
import { accessible } from './monmove.ts';
import { discover_object } from './o_init.ts';
import { an, doname_with_price, makeplural, the, the_unique_obj, the_unique_pm, thesimpleoname, xname } from './objnam.ts';
import { observe_quantum_cat } from './pickup.ts';
import { You, You_feel, Your, impossible, pline, pline_The, raw_printf } from './pline.ts';
import { make_sick, peffects } from './potion.ts';
import { clearpriests } from './priest.ts';
import { inven_inuse, mread } from './restore.ts';
import { genl_outrip } from './rip.ts';
import { d, rn2 } from './rnd.ts';
import { Goodbye } from './role.ts';
import { bwrite, dosave0, freedynamicdata } from './save.ts';
import { finish_paybill, obfree, paybill } from './shk.ts';
import { shkname, shkname_is_pname } from './shknam.ts';
import { formatkiller, topten } from './topten.ts';
import { force_launch_placement, launch_in_progress, reset_utrap } from './trap.ts';
import { sethanguphandler } from './unixmain.ts';
import { hidden_gold, paygd } from './vault.ts';
import { getversionstring } from './version.ts';
import { dump_close_log, dump_forward_putstr, dump_open_log, dump_redirect } from './windows.ts';
import { worm_known } from './worm.ts';
import { anon_end_c_532, struct_kinfo, struct_monst, struct_obj, struct_val_list, struct_valuable_data, union_any } from './structs.ts';
import { $rd, $sadd, $sarr, $sarrOf, $sat, $ta, $wr, G, P, S, VaList, abort, exit, free, isspace, memset, qsort, signal, sprintf, strcat, strchr, strcmp, strcpy, strlen, vsnprintf } from './rt/index.ts';
import { AMULET_CLASS, ASCENDED, ATR_NONE, A_CON, A_CURRENT, A_ORIGINAL, BAG_OF_TRICKS, BASICENLIGHTENMENT, BELL_OF_OPENING, BLINDED, BUFSZ, BURNING, CANDELABRUM_OF_INVOCATION, CHOKING, CORPSE, DETECT_MONSTERS, DIED, DISCLOSE_NO_WITHOUT_PROMPT, DISCLOSE_PROMPT_DEFAULT_SPECIAL, DISCLOSE_PROMPT_DEFAULT_YES, DISCLOSE_SPECIAL_WITHOUT_PROMPT, DISCLOSE_YES_WITHOUT_PROMPT, DISSOLVED, DUMPLOG_MSG_COUNT, ENL_GAMEOVERALIVE, ENL_GAMEOVERDEAD, ESCAPED, EXIT_SUCCESS, FAKE_AMULET_OF_YENDOR, FALSE, FIRST_AMULET, FIRST_GEM, GEM_CLASS, GENOCIDED, G_EXTINCT, G_GENOD, G_GONE, G_NOCORPSE, G_UNIQ, HALLUC, HALLUC_RES, INFRAVISION, IN_SIGHT, KILLED_BY, KILLED_BY_AN, LAST_GEM, LIFESAVED, LOW_PM, LUCKSTONE, MAGICENLIGHTENMENT, MENU_SELECTED, MENU_UNSELECTED, M_AP_MONSTER, NHW_MENU, NHW_TEXT, NON_PM, NO_GLYPH, NO_KILLER_PREFIX, NUMMONS, NUM_DISCLOSURE_OPTIONS, OBJ_FREE, PANICKED, PICK_ONE, PLNMSG_OK_DONT_DIE, PM_GHOST, PM_GHOUL, PM_GREEN_SLIME, PM_HIGH_PRIEST, PM_HOUSECAT, PM_VAMPIRE, PM_WRAITH, POT_RESTORE_ABILITY, POT_WATER, QUIT, SEE_INVIS, SICK, SICK_ALL, SIGINT, SIGQUIT, SORTLOOT_LOOT, SORTLOOT_PACK, SPE_BOOK_OF_THE_DEAD, STARVING, STATUE, STONING, S_DEMON, S_EEL, S_GHOST, S_GOLEM, S_HUMAN, S_LIZARD, S_MUMMY, S_VAMPIRE, S_WRAITH, S_ZOMBIE, TELEPAT, TIMEOUT, TRICKED, TRUE, TT_LAVA, TURNED_SLIME, UNCHANGING, VANQ_ALPHA_MIX, VANQ_ALPHA_SEP, VANQ_COUNT_H_L, VANQ_COUNT_L_H, VANQ_MCLS_HTOL, VANQ_MCLS_LTOH, VANQ_MLVL_MNDX, VANQ_MSTR_MNDX, WARN_OF_MON, WIN_ERR, override_restriction } from './consts.ts';

let gems: any;
let amulets: any;
let valuables: any;
let deaths: any;
let ends: any;
let Schroedingers_cat: number;
let death_fixups: any;
let vanqorders: any;
let vanq_sortmode: number;
let vanqsort_cmp$punctclasses: any;

export async function done1(sig_unused: number): Promise<void> {
  signal(SIGINT, 1);
  if (G.flags.ignintr) {
    signal(SIGINT, done1);
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    await curs_on_u();
    await G.windowprocs.win_wait_synch();
    if (G.multi > 0) {
      nomul(0);
    }
  } else {
    await done2();
  }
}

export async function done2(): Promise<number> {
  if (G.iflags.debug_fuzzer) {
    return 0;
  }
  if (!await paranoid_query((G.flags.paranoia_bits & 2) >>> 0 !== 0 ? 1 : 0, S("Really quit?"))) {
    signal(SIGINT, done1);
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    await curs_on_u();
    await G.windowprocs.win_wait_synch();
    if (G.multi > 0) {
      nomul(0);
    }
    if (G.multi === 0) {
      G.u.uinvulnerable = (FALSE) & 1;
      G.u.usleep = 0;
    }
    return 0;
  }
  if (G.flags.debug) {
    let c = 0;
    c = await yn_function(S("Dump core?"), P(G.ynqchars), 113);
    if (c === 121) {
      signal(SIGINT, done1);
      await G.windowprocs.win_exit_nhwindows(null);
      abort();
    } else if (c === 113) {
      ++G.program_state.stopprint;
    }
  }
  await done(QUIT);
  return 0;
}

function done_intr(sig_unused: number): void {
  ++G.program_state.stopprint;
  signal(SIGINT, 1);
  signal(SIGQUIT, 1);
  return;
}

function done_hangup(sig: number): void {
  ++G.program_state.done_hup;
  sethanguphandler(1);
  done_intr(sig);
  return;
}

export async function done_in_by(mtmp: struct_monst | null, how: number): Promise<void> {
  let buf = new Int8Array(256);
  let mptr = mtmp.data;
  let champtr = mtmp.cham >= LOW_PM ? $sat(G.mons, mtmp.cham) : mptr;
  let distorted = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? 1 : 0) << 24 >> 24;
  let mimicker = ((mtmp.m_ap_type & 7) === M_AP_MONSTER ? 1 : 0) << 24 >> 24;
  let imitator = (mptr !== champtr || mimicker ? 1 : 0) << 24 >> 24;
  await You(how === STONING ? S("turn to stone...") : S("die..."));
  G.windowprocs.win_mark_synch();
  buf[0] = 0;
  G.killer.format = KILLED_BY_AN;
  if ((mptr.geno & G_UNIQ) !== 0 && !(imitator && !mimicker) && !(mptr === $sat(G.mons, PM_HIGH_PRIEST) && !mtmp.ispriest)) {
    if (!((mptr.mflags2 & 524288) >>> 0 !== 0)) {
      strcat(P(buf), S("the "));
    }
    G.killer.format = KILLED_BY;
  }
  if (mptr === $sat(G.mons, PM_GHOST) && (mtmp.mextra && mtmp.mextra.mname)) {
    strcat(P(buf), S("the "));
    G.killer.format = KILLED_BY;
  }
  if (mtmp.minvis) {
    strcat(P(buf), S("invisible "));
  }
  if (distorted) {
    strcat(P(buf), S("hallucinogen-distorted "));
  }
  if (imitator) {
    let shape = new Int8Array(256);
    let realnm = champtr.mname;
    let fakenm = mptr.mname;
    let alt = (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224 ? 1 : 0) << 24 >> 24;
    if (mimicker) {
      mptr = $sat(G.mons, mtmp.mappearance);
      fakenm = mptr.mname;
    } else if (alt && strstri(realnm, S("vampire")) && !strcmp(fakenm, S("vampire bat"))) {
      fakenm = S("bat");
    }
    if (alt || (mptr.mflags2 & 524288) >>> 0 !== 0) {
      strcpy(P(shape), fakenm);
    } else if (the_unique_pm(mptr)) {
      sprintf(P(shape), S("the %s"), fakenm);
    } else {
      strcpy(P(shape), await an(fakenm));
    }
    sprintf(eos(P(buf)), alt ? S("%s in %s form") : mimicker ? S("%s disguised as %s") : S("%s imitating %s"), realnm, P(shape));
    mptr = mtmp.data;
  } else if (mptr === $sat(G.mons, PM_GHOST)) {
    strcat(P(buf), S("ghost"));
    if (mtmp.mextra && mtmp.mextra.mname) {
      sprintf(eos(P(buf)), S(" of %s"), mtmp.mextra.mname);
    }
  } else if (mtmp.isshk) {
    let shknm = await shkname(mtmp);
    let honorific = shkname_is_pname(mtmp) ? S("") : mtmp.female | 0 ? S("Ms. ") : S("Mr. ");
    sprintf(eos(P(buf)), S("%s%s, the shopkeeper"), honorific, shknm);
    G.killer.format = KILLED_BY;
  } else if (mtmp.ispriest | 0 || mtmp.isminion | 0) {
    strcat(P(buf), await m_monnam(mtmp));
  } else {
    strcat(P(buf), mptr.mname);
    if (mtmp.mextra && mtmp.mextra.mname) {
      sprintf(eos(P(buf)), S(" called %s"), mtmp.mextra.mname);
    }
  }
  strcpy(P(G.killer.name), P(buf));
  if (mptr.mlet === S_WRAITH) {
    G.u.ugrave_arise = PM_WRAITH;
  } else if (mptr.mlet === S_MUMMY && G.urace.mummynum !== NON_PM) {
    G.u.ugrave_arise = G.urace.mummynum;
  } else if (mptr.mlet === S_VAMPIRE && G.urace.malenum === 256) {
    G.u.ugrave_arise = PM_VAMPIRE;
  } else if (mptr === $sat(G.mons, PM_GHOUL)) {
    G.u.ugrave_arise = PM_GHOUL;
  }
  if (G.u.ugrave_arise >= LOW_PM && G.mvitals[G.u.ugrave_arise].mvflags & G_GENOD) {
    G.u.ugrave_arise = NON_PM;
  }
  await done(how);
  return;
}

function fixup_death(how: number): void {
  let i = 0;
  if (G.multi_reason) {
    for (i = 0; i < (Math.trunc(48 / 24) | 0); ++i) {
      if (death_fixups[i].why === how && !strcmp(death_fixups[i].exclude, G.multi_reason)) {
        if (death_fixups[i].include) {
          G.multi_reason = death_fixups[i].include;
        } else {
          G.multi_reason = null;
        }
        if (death_fixups[i].unmulti) {
          G.multi = 0;
        }
        break;
      }
    }
  }
}

export async function panic(str: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    if (G.program_state.panicking++) {
      abort();
    }
    if (G.iflags.window_inited) {
      G.windowprocs.win_raw_print(S("\r\nOops..."));
      await G.windowprocs.win_wait_synch();
      await G.windowprocs.win_exit_nhwindows(null);
      G.iflags.window_inited = 0;
    }
    G.windowprocs.win_raw_print(G.program_state.gameover ? S("Postgame wrapup disrupted.") : !G.program_state.something_worth_saving ? S("Program initialization has failed.") : S("Suddenly, the dungeon collapses."));
    if (!G.flags.debug) {
      let maybe_rebuild = !G.program_state.something_worth_saving ? S(".") : S("\nand it may be possible to rebuild.");
      if (G.sysopt.support) {
        raw_printf(S("To report this error, %s%s"), G.sysopt.support, maybe_rebuild);
      } else if (G.sysopt.fmtd_wizard_list) {
        raw_printf(S("To report this error, contact %s%s"), G.sysopt.fmtd_wizard_list, maybe_rebuild);
      } else {
        raw_printf(S("Report error to \"%s\"%s"), S("wizard"), maybe_rebuild);
      }
    }
    if (G.program_state.something_worth_saving && !G.iflags.debug_fuzzer) {
      set_error_savefile();
      if (await dosave0()) {
        if (G.sysopt.recover) {
          raw_printf(S("%s"), G.sysopt.recover);
        }
      }
    }
    {
      let buf = new Int8Array(256);
      vsnprintf(P(buf), 256, str, the_args);
      G.windowprocs.win_raw_print(P(buf));
      paniclog(S("panic"), P(buf));
    }
    if (G.flags.debug) {
      abort();
    }
    undefined;
  }
  ;
  await really_done(PANICKED);
}

async function should_query_disclose_option(category: number, defquery: Ptr | null): Promise<number> {
  let idx = 0;
  let disclose = 0;
  let dop = null;
  defquery.a[defquery.o] = 110;
  if (!!(dop = strchr(P(G.disclosure_options), category))) {
    idx = dop.o - P(G.disclosure_options).o | 0;
    if (idx < 0 || idx >= NUM_DISCLOSURE_OPTIONS) {
      await impossible(S("should_query_disclose_option: bad disclosure index %d %c"), idx, category);
      defquery.a[defquery.o] = DISCLOSE_PROMPT_DEFAULT_YES;
      return TRUE;
    }
    disclose = G.flags.end_disclose[idx];
    if (disclose === DISCLOSE_YES_WITHOUT_PROMPT) {
      defquery.a[defquery.o] = 121;
      return FALSE;
    } else if (disclose === DISCLOSE_SPECIAL_WITHOUT_PROMPT) {
      defquery.a[defquery.o] = 97;
      return FALSE;
    } else if (disclose === DISCLOSE_NO_WITHOUT_PROMPT) {
      defquery.a[defquery.o] = 110;
      return FALSE;
    } else if (disclose === DISCLOSE_PROMPT_DEFAULT_YES) {
      defquery.a[defquery.o] = 121;
      return TRUE;
    } else if (disclose === DISCLOSE_PROMPT_DEFAULT_SPECIAL) {
      defquery.a[defquery.o] = 97;
      return TRUE;
    } else {
      defquery.a[defquery.o] = 110;
      return TRUE;
    }
  }
  await impossible(S("should_query_disclose_option: bad category %c"), category);
  return TRUE;
}

async function dump_plines(): Promise<void> {
  let i = 0;
  let j = 0;
  let buf = new Int8Array(256);
  let strp = null;
  strcpy(P(buf), S(" "));
  await G.windowprocs.win_putstr(0, 0, S("Latest messages:"));
  for (i = 0, j = G.saved_pline_index | 0; i < DUMPLOG_MSG_COUNT; ++i, j = (j + 1) % DUMPLOG_MSG_COUNT) {
    strp = P(G.saved_plines, j);
    if (strp.a[strp.o]) {
      copynchars(P(buf, 1), strp.a[strp.o], BUFSZ - 1 - 1);
      await G.windowprocs.win_putstr(0, 0, P(buf));
      free(strp.a[strp.o]), strp.a[strp.o] = null;
    }
  }
}

async function dump_everything(how: number, when: number): Promise<void> {
  let pbuf = new Int8Array(256);
  let datetimebuf = new Int8Array(24);
  dump_redirect(TRUE);
  if (!G.iflags.in_dumplog) {
    return;
  }
  init_symbols();
  await G.windowprocs.win_putstr(0, 0, getversionstring(P(pbuf)));
  await G.windowprocs.win_putstr(0, 0, S(""));
  strcpy(P(datetimebuf), await yyyymmddhhmmss(G.ubirthday));
  sprintf(P(pbuf), S("Game began %4.4s-%2.2s-%2.2s %2.2s:%2.2s:%2.2s"), P(datetimebuf, 0), P(datetimebuf, 4), P(datetimebuf, 6), P(datetimebuf, 8), P(datetimebuf, 10), P(datetimebuf, 12));
  strcpy(P(datetimebuf), await yyyymmddhhmmss(when));
  sprintf(eos(P(pbuf)), S(", ended %4.4s-%2.2s-%2.2s %2.2s:%2.2s:%2.2s."), P(datetimebuf, 0), P(datetimebuf, 4), P(datetimebuf, 6), P(datetimebuf, 8), P(datetimebuf, 10), P(datetimebuf, 12));
  await G.windowprocs.win_putstr(0, 0, P(pbuf));
  await G.windowprocs.win_putstr(0, 0, S(""));
  sprintf(P(pbuf), S("%s, %s %s %s %s"), P(G.plname), G.aligns[1 - G.u.ualign.type].adj, G.genders[G.flags.female].adj, G.urace.adj, G.flags.female && G.urole.name.f ? G.urole.name.f : G.urole.name.m);
  await G.windowprocs.win_putstr(0, 0, P(pbuf));
  await G.windowprocs.win_putstr(0, 0, S(""));
  await dump_map();
  await G.windowprocs.win_putstr(0, 0, do_statusline1());
  await G.windowprocs.win_putstr(0, 0, await do_statusline2());
  await G.windowprocs.win_putstr(0, 0, S(""));
  await dump_plines();
  await G.windowprocs.win_putstr(0, 0, S(""));
  await G.windowprocs.win_putstr(0, 0, S("Inventory:"));
  await display_inventory(null, TRUE);
  await container_contents(G.invent, TRUE, TRUE, FALSE);
  await enlightenment(BASICENLIGHTENMENT | MAGICENLIGHTENMENT, how >= PANICKED ? ENL_GAMEOVERALIVE : ENL_GAMEOVERDEAD);
  await G.windowprocs.win_putstr(0, 0, S(""));
  await list_vanquished(100, FALSE);
  await G.windowprocs.win_putstr(0, 0, S(""));
  await list_genocided(100, FALSE);
  await G.windowprocs.win_putstr(0, 0, S(""));
  await show_conduct(how >= PANICKED ? 1 : 2);
  await G.windowprocs.win_putstr(0, 0, S(""));
  await show_overview(how >= PANICKED ? 1 : 2, how);
  await G.windowprocs.win_putstr(0, 0, S(""));
  dump_redirect(FALSE);
}

async function disclose(how: number, taken: number): Promise<void> {
  let c = 0;
  const defquery = new Int8Array(1);
  let qbuf = new Int8Array(128);
  let ask = FALSE;
  if (G.invent && !G.program_state.stopprint) {
    if (taken) {
      sprintf(P(qbuf), S("Do you want to see what you had when you %s?"), how === QUIT ? S("quit") : S("died"));
    } else {
      strcpy(P(qbuf), S("Do you want your possessions identified?"));
    }
    ask = await should_query_disclose_option(105, P(defquery, 0));
    c = (ask ? await yn_function(P(qbuf), P(G.ynqchars), defquery[0]) : defquery[0]) << 24 >> 24;
    if (c === 121) {
      await display_inventory(null, TRUE);
      await container_contents(G.invent, TRUE, TRUE, FALSE);
    }
    if (c === 113) {
      ++G.program_state.stopprint;
    }
  }
  if (!G.program_state.stopprint) {
    ask = await should_query_disclose_option(97, P(defquery, 0));
    c = (ask ? await yn_function(S("Do you want to see your attributes?"), P(G.ynqchars), defquery[0]) : defquery[0]) << 24 >> 24;
    if (c === 121) {
      await enlightenment(BASICENLIGHTENMENT | MAGICENLIGHTENMENT, how >= PANICKED ? ENL_GAMEOVERALIVE : ENL_GAMEOVERDEAD);
    }
    if (c === 113) {
      ++G.program_state.stopprint;
    }
  }
  if (!G.program_state.stopprint) {
    ask = await should_query_disclose_option(118, P(defquery, 0));
    await list_vanquished(defquery[0], ask);
  }
  if (!G.program_state.stopprint) {
    ask = await should_query_disclose_option(103, P(defquery, 0));
    await list_genocided(defquery[0], ask);
  }
  if (!G.program_state.stopprint) {
    ask = await should_query_disclose_option(99, P(defquery, 0));
    c = (ask ? await yn_function(S("Do you want to see your conduct?"), P(G.ynqchars), defquery[0]) : defquery[0]) << 24 >> 24;
    if (c === 121) {
      await show_conduct(how >= PANICKED ? 1 : 2);
    }
    if (c === 113) {
      ++G.program_state.stopprint;
    }
  }
  if (!G.program_state.stopprint) {
    ask = await should_query_disclose_option(111, P(defquery, 0));
    c = (ask ? await yn_function(S("Do you want to see the dungeon overview?"), P(G.ynqchars), defquery[0]) : defquery[0]) << 24 >> 24;
    if (c === 121) {
      await show_overview(how >= PANICKED ? 1 : 2, how);
    }
    if (c === 113) {
      ++G.program_state.stopprint;
    }
  }
}

async function savelife(how: number): Promise<void> {
  let uhpmin = 2 * G.u.ulevel > 10 ? 2 * G.u.ulevel : 10;
  if (G.u.uhpmax < uhpmin) {
    G.u.uhpmax = uhpmin;
  }
  G.u.uhp = G.u.uhpmax;
  if (G.u.umonnum !== G.u.umonster) {
    G.u.mh = G.u.mhmax;
  }
  if (G.u.uhunger < 500 || how === CHOKING) {
    await init_uhunger();
  }
  if ((G.u.uprops[SICK].intrinsic & TIMEOUT) === 1) {
    await make_sick(0, null, FALSE, SICK_ALL);
  }
  G.nomovemsg = S("You survived that attempt on your life.");
  G.context.move = 0;
  if (G.multi > 0) {
    G.multi = 0;
  } else {
    G.multi = -1;
  }
  if (G.u.utrap && G.u.utraptype === TT_LAVA) {
    await reset_utrap(FALSE);
  }
  G.context.botl = 1;
  G.u.ugrave_arise = NON_PM;
  G.u.uprops[UNCHANGING].intrinsic = 0;
  await curs_on_u();
  if (!G.context.mon_moving) {
    await endmultishot(FALSE);
  }
  if (G.u.uswallow) {
    await expels(G.u.ustuck, G.u.ustuck.data, TRUE);
  } else if (G.u.ustuck) {
    if (G.u.umonnum !== G.u.umonster && sticks(G.youmonst.data)) {
      await You(S("release %s."), await mon_nam(G.u.ustuck));
    } else {
      await pline(S("%s releases you."), await Monnam(G.u.ustuck));
    }
    await unstuck(G.u.ustuck);
  }
}

function get_valuables(list: struct_obj | null): void {
  let $t1: any, $t2: any;
  let obj = null;
  let i = 0;
  for (obj = list; obj; obj = obj.nobj) {
    if (!!obj.cobj) {
      get_valuables(obj.cobj);
    } else if (obj.oartifact) {
      continue;
    } else if (obj.oclass === AMULET_CLASS) {
      i = obj.otyp - FIRST_AMULET;
      if (!amulets[i].count) {
        amulets[i].count = obj.quan;
        amulets[i].typ = obj.otyp;
      } else {
        ($t1 = amulets[i], $t1.count = $t1.count + obj.quan);
      }
    } else if (obj.oclass === GEM_CLASS && obj.otyp < LUCKSTONE) {
      i = (obj.otyp < 433 + 1 ? obj.otyp : 433 + 1) - FIRST_GEM;
      if (!gems[i].count) {
        gems[i].count = obj.quan;
        gems[i].typ = obj.otyp;
      } else {
        ($t2 = gems[i], $t2.count = $t2.count + obj.quan);
      }
    }
  }
  return;
}

function sort_valuables(list: struct_valuable_data | null, size: number): void {
  let i = 0;
  let j = 0;
  let ltmp = new struct_valuable_data();
  for (i = 1; i < size; ++i) {
    if ($sadd(list, i).count === 0) {
      continue;
    }
    ltmp.$cp($sadd(list, i));
    for (j = i; j > 0; --j) {
      if ($sadd(list, (j - 1)).count >= ltmp.count) {
        break;
      } else {
        $sadd(list, j).$cp($sadd(list, (j - 1)));
      }
    }
    $sadd(list, j).$cp(ltmp);
  }
  return;
}

async function done_object_cleanup(): Promise<void> {
  let ox = 0;
  let oy = 0;
  await inven_inuse(TRUE);
  ox = G.u.ux + G.u.dx, oy = G.u.uy + G.u.dy;
  if (!isok(ox, oy) || !accessible(ox, oy)) {
    ox = G.u.ux, oy = G.u.uy;
  }
  if (G.thrownobj && G.thrownobj.where === OBJ_FREE) {
    await place_object(G.thrownobj, ox, oy);
    await stackobj(G.thrownobj), G.thrownobj = null;
  }
  if (G.kickedobj && G.kickedobj.where === OBJ_FREE) {
    await place_object(G.kickedobj, ox, oy);
    await stackobj(G.kickedobj), G.kickedobj = null;
  }
  if (G.uchain && G.uchain.where === OBJ_FREE) {
    await lift_covet_and_placebc(override_restriction);
  }
  if (G.iflags.perm_invent) {
    G.iflags.perm_invent = FALSE;
    update_inventory();
  }
  return;
}

async function artifact_score(list: struct_obj | null, counting: number, endwin: number): Promise<void> {
  let pbuf = new Int8Array(256);
  let otmp = null;
  let value = 0;
  let points = 0;
  const dummy = new Int16Array(1);
  for (otmp = list; otmp; otmp = otmp.nobj) {
    if (otmp.oartifact || otmp.otyp === BELL_OF_OPENING || otmp.otyp === SPE_BOOK_OF_THE_DEAD || otmp.otyp === CANDELABRUM_OF_INVOCATION) {
      value = arti_cost(otmp);
      points = Math.trunc(value * 5 / 2);
      if (counting) {
        G.u.urexp = G.u.urexp + points < 0 ? 9223372036854775807 : G.u.urexp + points;
      } else {
        await discover_object(otmp.otyp, TRUE, FALSE);
        otmp.known = (otmp.dknown = (otmp.bknown = (otmp.rknown = 1) & 1) & 1) & 1;
        sprintf(P(pbuf), S("%s%s (worth %ld %s and %ld points)"), the_unique_obj(otmp) ? S("The ") : S(""), otmp.oartifact ? artifact_name(await xname(otmp), P(dummy, 0)) : G.obj_descr[G.objects[otmp.otyp].oc_name_idx].oc_name, value, await currency(value), points);
        await G.windowprocs.win_putstr(endwin, 0, P(pbuf));
      }
    }
    if (!!otmp.cobj) {
      await artifact_score(otmp.cobj, counting, endwin);
    }
  }
}

export async function done(how: number): Promise<void> {
  let survive = FALSE;
  if (how === TRICKED) {
    if (G.killer.name[0]) {
      paniclog(S("trickery"), P(G.killer.name));
      G.killer.name[0] = 0;
    }
    if (G.flags.debug) {
      await You(S("are a very tricky wizard, it seems."));
      G.killer.format = KILLED_BY_AN;
      return;
    }
  }
  if (G.program_state.panicking || G.program_state.done_hup) {
    G.context.botl = G.context.botlx = G.iflags.time_botl = FALSE;
  } else {
    G.context.botlx = TRUE;
    await bot();
  }
  if (G.iflags.debug_fuzzer) {
    if (!(G.program_state.panicking || how === PANICKED)) {
      await savelife(how);
      if (!rn2(10)) {
        let potion = await mksobj(G.u.ulycn > LOW_PM && !rn2(3) ? POT_WATER : POT_RESTORE_ABILITY, TRUE, FALSE);
        await bless(potion);
        await peffects(potion);
        await obfree(potion, null);
      }
      G.killer.name[0] = 0;
      G.killer.format = 0;
      return;
    }
  } else if (how === ASCENDED || !G.killer.name[0] && how === GENOCIDED) {
    G.killer.format = NO_KILLER_PREFIX;
  }
  if (!G.killer.name[0] && (how === STARVING || how === BURNING)) {
    G.killer.format = KILLED_BY;
  }
  if (!G.killer.name[0] || how >= PANICKED) {
    strcpy(P(G.killer.name), deaths[how]);
  }
  if (how < PANICKED) {
    ++G.u.umortality;
    if (G.u.uhp !== 0 || G.u.umonnum !== G.u.umonster && G.u.mh !== 0) {
      G.u.uhp = G.u.mh = 0;
      G.context.botl = 1;
    }
  }
  if (G.u.uprops[LIFESAVED].extrinsic && how <= GENOCIDED) {
    await pline(S("But wait..."));
    await discover_object(179, 1, 1);
    await Your(S("medallion %s!"), !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? S("begins to glow") : S("feels warm"));
    if (how === CHOKING) {
      await You(S("vomit ..."));
    }
    await You_feel(S("much better!"));
    await pline_The(S("medallion crumbles to dust!"));
    if (G.uamul) {
      await useup(G.uamul);
    }
    await adjattrib(A_CON, -1, TRUE);
    await savelife(how);
    if (how === GENOCIDED) {
      await pline(S("Unfortunately you are still genocided..."));
    } else {
      survive = TRUE;
    }
  }
  if (!survive && (G.flags.debug || G.flags.explore) && how <= GENOCIDED && !await paranoid_query((G.flags.paranoia_bits & 4) >>> 0 !== 0 ? 1 : 0, S("Die?"))) {
    await pline(S("OK, so you don't %s."), how === CHOKING ? S("choke") : S("die"));
    G.iflags.last_msg = PLNMSG_OK_DONT_DIE;
    await savelife(how);
    survive = TRUE;
  }
  if (survive) {
    G.killer.name[0] = 0;
    G.killer.format = KILLED_BY_AN;
    return;
  }
  await really_done(how);
}

async function really_done(how: number): Promise<void> {
  let $t1: any, $t2: any;
  let taken = 0;
  let pbuf = new Int8Array(256);
  let endwin = WIN_ERR;
  let bones_ok = 0;
  let have_windows = G.iflags.window_inited;
  let corpse = null;
  let endtime = 0;
  let umoney = 0;
  let tmp = 0;
  G.program_state.gameover = 1;
  G.program_state.something_worth_saving = 0;
  if (G.program_state.done_hup) {
    ++G.program_state.stopprint;
  }
  G.iflags.vision_inited = 0;
  if (!G.program_state.panicking) {
    await done_object_cleanup();
  }
  G.iflags.perm_invent = FALSE;
  G.urealtime.finish_time = endtime = getnow();
  G.urealtime.realtime += endtime - G.urealtime.start_timing;
  G.iflags.at_night = night();
  G.iflags.at_midnight = midnight();
  dump_open_log(endtime);
  if (G.moves <= 1 && how < PANICKED && !G.program_state.stopprint) {
    await pline(S("Do not pass Go.  Do not collect 200 %s."), await currency(200));
  }
  if (have_windows) {
    await G.windowprocs.win_wait_synch();
  }
  signal(SIGINT, done_intr);
  signal(SIGQUIT, done_intr);
  sethanguphandler(done_hangup);
  bones_ok = (how < GENOCIDED && can_make_bones() ? 1 : 0) << 24 >> 24;
  if (bones_ok && launch_in_progress()) {
    await force_launch_placement();
  }
  if (how === PANICKED) {
    G.u.ugrave_arise = NON_PM - 3;
  } else if (how === BURNING || how === DISSOLVED) {
    G.u.ugrave_arise = NON_PM - 2;
  } else if (how === STONING) {
    G.u.ugrave_arise = NON_PM - 1;
  } else if (how === TURNED_SLIME && !(G.mvitals[PM_GREEN_SLIME].mvflags & G_GENOD)) {
    G.u.ugrave_arise = PM_GREEN_SLIME;
  }
  if (how === QUIT) {
    G.killer.format = NO_KILLER_PREFIX;
    if (G.u.uhp < 1) {
      how = DIED;
      ++G.u.umortality;
      strcpy(P(G.killer.name), S("quit while already on Charon's boat"));
    }
  }
  if (how === ESCAPED || how === PANICKED) {
    G.killer.format = NO_KILLER_PREFIX;
  }
  fixup_death(how);
  if (how !== PANICKED) {
    let silently = (G.program_state.stopprint ? TRUE : FALSE) << 24 >> 24;
    taken = await paybill(how === ESCAPED ? -1 : how !== QUIT ? 1 : 0, silently);
    await paygd(silently);
    await clearpriests();
  } else {
    taken = FALSE;
  }
  clearlocks();
  if (have_windows) {
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  }
  if (how !== PANICKED) {
    let obj = null;
    for (obj = G.invent; obj; obj = obj.nobj) {
      await discover_object(obj.otyp, TRUE, FALSE);
      obj.known = (obj.bknown = (obj.dknown = (obj.rknown = 1) & 1) & 1) & 1;
      if (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) {
        obj.cknown = (obj.lknown = 1) & 1;
      }
      if (obj.otyp === 189 && obj.spe === 1) {
        if (!Schroedingers_cat) {
          await observe_quantum_cat(obj, FALSE, FALSE);
          if (obj.otyp === 189 && obj.spe === 1) {
            Schroedingers_cat = TRUE;
          }
        } else {
          obj.spe = 0;
        }
      }
    }
    if (strcmp(P(G.flags.end_disclose), S("none"))) {
      await disclose(how, taken);
    }
    await dump_everything(how, endtime);
  }
  if (how === ESCAPED || how === ASCENDED) {
    await keepdogs(TRUE);
  }
  if (bones_ok && taken) {
    await finish_paybill();
  }
  if (bones_ok && G.u.ugrave_arise === NON_PM && !(G.mvitals[G.u.umonnum].mvflags & G_NOCORPSE)) {
    let mnum = G.u.umonnum;
    if (!(G.u.umonnum !== G.u.umonster)) {
      mnum = G.flags.female && G.urace.femalenum !== NON_PM ? G.urace.femalenum : G.urace.malenum;
    }
    corpse = await mk_named_object(CORPSE, $sat(G.mons, mnum), G.u.ux, G.u.uy, P(G.plname));
    sprintf(P(pbuf), S("%s, "), P(G.plname));
    await formatkiller(eos(P(pbuf)), 256 - strlen(P(pbuf)) >>> 0, how, TRUE);
    await make_grave(G.u.ux, G.u.uy, P(pbuf));
  }
  pbuf[0] = 0;
  {
    let deepest = deepest_lev_reached(FALSE);
    umoney = money_cnt(G.invent);
    tmp = G.u.umoney0;
    umoney += hidden_gold();
    tmp = umoney - tmp;
    if (tmp < 0) {
      tmp = 0;
    }
    if (how < PANICKED) {
      tmp -= Math.trunc(tmp / 10);
    }
    tmp += 50 * (deepest - 1);
    if (deepest > 20) {
      tmp += 1000 * (deepest > 30 ? 10 : deepest - 20);
    }
    G.u.urexp = G.u.urexp + tmp < 0 ? 9223372036854775807 : G.u.urexp + tmp;
    if (how === ASCENDED && G.u.ualign.type === G.u.ualignbase[A_ORIGINAL]) {
      tmp = G.u.ualignbase[A_CURRENT] === G.u.ualignbase[A_ORIGINAL] ? G.u.urexp : Math.trunc(G.u.urexp / 2);
      G.u.urexp = G.u.urexp + tmp < 0 ? 9223372036854775807 : G.u.urexp + tmp;
    }
  }
  if (G.u.ugrave_arise >= LOW_PM && !G.program_state.stopprint) {
    await Your(S("%s as %s..."), G.u.ugrave_arise !== PM_GREEN_SLIME ? S("body rises from the dead") : S("revenant persists"), await an(G.mons[G.u.ugrave_arise].mname));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  }
  if (bones_ok) {
    if (!G.flags.debug || await paranoid_query((G.flags.paranoia_bits & 8) >>> 0 !== 0 ? 1 : 0, S("Save bones?"))) {
      await savebones(how, endtime, corpse);
    }
    corpse = null;
  }
  G.done_money = umoney;
  if (have_windows) {
    await G.windowprocs.win_wait_synch();
    await free_pickinv_cache();
    if (G.WIN_INVEN !== WIN_ERR) {
      await G.windowprocs.win_destroy_nhwindow(G.WIN_INVEN), G.WIN_INVEN = WIN_ERR;
      G.iflags.perm_invent = 0;
    }
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
    await G.windowprocs.win_destroy_nhwindow(G.WIN_MAP), G.WIN_MAP = WIN_ERR;
    if (G.WIN_STATUS !== WIN_ERR) {
      await G.windowprocs.win_destroy_nhwindow(G.WIN_STATUS), G.WIN_STATUS = WIN_ERR;
    }
    await G.windowprocs.win_destroy_nhwindow(G.WIN_MESSAGE), G.WIN_MESSAGE = WIN_ERR;
    if (!G.program_state.stopprint || G.flags.tombstone) {
      endwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
    }
    if (how < GENOCIDED && G.flags.tombstone && endwin !== WIN_ERR) {
      await G.windowprocs.win_outrip(endwin, how, endtime);
    }
  } else {
    G.program_state.stopprint = 1;
  }
  if (how <= GENOCIDED) {
    dump_redirect(TRUE);
    if (G.iflags.in_dumplog) {
      await genl_outrip(0, how, endtime);
    }
    dump_redirect(FALSE);
  }
  if (G.u.uhave.amulet) {
    strcat(P(G.killer.name), S(" (with the Amulet)"));
  } else if (how === ESCAPED) {
    if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) {
      strcat(P(G.killer.name), S(" (in celestial disgrace)"));
    } else if (carrying(FAKE_AMULET_OF_YENDOR)) {
      strcat(P(G.killer.name), S(" (with a fake Amulet)"));
    }
  }
  sprintf(P(pbuf), S("%s %s the %s..."), Goodbye(), P(G.plname), how !== ASCENDED ? G.flags.female && G.urole.name.f ? G.urole.name.f : G.urole.name.m : G.flags.female ? S("Demigoddess") : S("Demigod"));
  await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
  await dump_forward_putstr(endwin, 0, S(""), G.program_state.stopprint);
  if (how === ESCAPED || how === ASCENDED) {
    let mtmp = null;
    let otmp = null;
    let val = null;
    let i = 0;
    for (val = valuables[0]; val.list; val = $sadd(val, 1)) {
      for (i = 0; i < val.size; ++i) {
        $sadd(val.list, i).count = 0;
      }
    }
    get_valuables(G.invent);
    for (val = valuables[0]; val.list; val = $sadd(val, 1)) {
      for (i = 0; i < val.size; ++i) {
        if ($sadd(val.list, i).count !== 0) {
          tmp = $sadd(val.list, i).count * G.objects[$sadd(val.list, i).typ].oc_cost;
          G.u.urexp = G.u.urexp + tmp < 0 ? 9223372036854775807 : G.u.urexp + tmp;
        }
      }
    }
    await artifact_score(G.invent, TRUE, endwin);
    ($t1 = G.viz_array.a[G.viz_array.o], $t2 = 0, $t1.a[$t1.o + $t2] = ($t1.a[$t1.o + $t2] | IN_SIGHT) << 24 >> 24);
    mtmp = G.mydogs;
    strcpy(P(pbuf), S("You"));
    if (mtmp || Schroedingers_cat) {
      while (mtmp) {
        sprintf(eos(P(pbuf)), S(" and %s"), await mon_nam(mtmp));
        if (mtmp.mtame) {
          G.u.urexp = G.u.urexp + mtmp.mhp < 0 ? 9223372036854775807 : G.u.urexp + mtmp.mhp;
        }
        mtmp = mtmp.nmon;
      }
      if (Schroedingers_cat) {
        let mhp = 0;
        let m_lev = adj_lev($sat(G.mons, PM_HOUSECAT));
        mhp = d(m_lev, 8);
        G.u.urexp = G.u.urexp + mhp < 0 ? 9223372036854775807 : G.u.urexp + mhp;
        strcat(eos(P(pbuf)), S(" and Schroedinger's cat"));
      }
      await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
      pbuf[0] = 0;
    } else {
      strcat(P(pbuf), S(" "));
    }
    sprintf(eos(P(pbuf)), S("%s with %ld point%s,"), how === ASCENDED ? S("went to your reward") : S("escaped from the dungeon"), G.u.urexp, G.u.urexp === 1 ? S("") : S("s"));
    await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
    if (!G.program_state.stopprint) {
      await artifact_score(G.invent, FALSE, endwin);
    }
    dump_redirect(TRUE);
    if (G.iflags.in_dumplog) {
      await artifact_score(G.invent, FALSE, 0);
    }
    dump_redirect(FALSE);
    for (val = valuables[0]; val.list; val = $sadd(val, 1)) {
      sort_valuables(val.list, val.size);
      for (i = 0; i < val.size && !G.program_state.stopprint; ++i) {
        let typ = $sadd(val.list, i).typ;
        let count = $sadd(val.list, i).count;
        if (count === 0) {
          continue;
        }
        if (G.objects[typ].oc_class !== GEM_CLASS || typ <= LAST_GEM) {
          otmp = await mksobj(typ, FALSE, FALSE);
          await discover_object(otmp.otyp, TRUE, FALSE);
          otmp.known = 1;
          otmp.dknown = 1;
          if (otmp.oextra && otmp.oextra.oname) {
            free_oname(otmp);
          }
          otmp.quan = count;
          sprintf(P(pbuf), S("%8ld %s (worth %ld %s),"), count, await xname(otmp), count * G.objects[typ].oc_cost, await currency(2));
          await obfree(otmp, null);
        } else {
          sprintf(P(pbuf), S("%8ld worthless piece%s of colored glass,"), count, count === 1 ? S("") : S("s"));
        }
        await dump_forward_putstr(endwin, 0, P(pbuf), 0);
      }
    }
  } else {
    if (G.u.uz.dnum === 0 && G.u.uz.dlevel <= 0) {
      sprintf(P(pbuf), S("You %s beyond the confines of the dungeon"), G.u.uz.dlevel < 0 ? S("passed away") : ends[how]);
    } else {
      let where = P(G.dungeons[G.u.uz.dnum].dname);
      if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) {
        where = S("The Astral Plane");
      }
      sprintf(P(pbuf), S("You %s in %s"), ends[how], where);
      if (!(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) && !((G.dungeon_topology.d_knox_level.dlevel || G.dungeon_topology.d_knox_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_knox_level))) {
        sprintf(eos(P(pbuf)), S(" on dungeon level %d"), In_quest(G.u.uz) ? dunlev(G.u.uz) : depth(G.u.uz));
      }
    }
    sprintf(eos(P(pbuf)), S(" with %ld point%s,"), G.u.urexp, G.u.urexp === 1 ? S("") : S("s"));
    await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
  }
  sprintf(P(pbuf), S("and %ld piece%s of gold, after %ld move%s."), umoney, umoney === 1 ? S("") : S("s"), G.moves, G.moves === 1 ? S("") : S("s"));
  await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
  sprintf(P(pbuf), S("You were level %d with a maximum of %d hit point%s when you %s."), G.u.ulevel, G.u.uhpmax, G.u.uhpmax === 1 ? S("") : S("s"), ends[how]);
  await dump_forward_putstr(endwin, 0, P(pbuf), G.program_state.stopprint);
  await dump_forward_putstr(endwin, 0, S(""), G.program_state.stopprint);
  if (!G.program_state.stopprint) {
    await G.windowprocs.win_display_nhwindow(endwin, TRUE);
  }
  if (endwin !== WIN_ERR) {
    await G.windowprocs.win_destroy_nhwindow(endwin);
  }
  dump_close_log();
  if (have_windows && !G.iflags.toptenwin) {
    await G.windowprocs.win_exit_nhwindows(null), have_windows = FALSE;
  }
  await topten(how, endtime);
  if (have_windows) {
    await G.windowprocs.win_exit_nhwindows(null);
  }
  if (G.program_state.stopprint) {
    G.windowprocs.win_raw_print(S(""));
    G.windowprocs.win_raw_print(S(""));
  }
  await nh_terminate(EXIT_SUCCESS);
}

export async function container_contents(list: struct_obj | null, identified: number, all_containers: number, reportempty: number): Promise<void> {
  let box = null;
  let obj = null;
  let buf = new Int8Array(256);
  let cat = 0;
  let dumping = G.iflags.in_dumplog;
  for (box = list; box; box = box.nobj) {
    if (box.otyp >= 189 && box.otyp <= 195 || box.otyp === STATUE) {
      if (!box.cknown || identified && !box.lknown) {
        box.cknown = 1;
        if (identified) {
          box.lknown = 1;
        }
        update_inventory();
      }
      if (box.otyp === BAG_OF_TRICKS) {
        continue;
      } else if (box.cobj) {
        let tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
        const sortedcobj = [null];
        let srtc = null;
        let sortflags = 0;
        cat = (box.otyp === 189 && box.spe === 1 ? 1 : 0) << 24 >> 24;
        sprintf(P(buf), S("Contents of %s:"), await the(await xname(box)));
        await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
        if (!dumping) {
          await G.windowprocs.win_putstr(tmpwin, 0, S(""));
        }
        buf[0] = buf[1] = 32;
        if (box.cobj && !cat) {
          sortflags = ((G.flags.sortloot === 108 || G.flags.sortloot === 102 ? SORTLOOT_LOOT : 0) | (G.flags.sortpack ? SORTLOOT_PACK : 0)) >>> 0;
          sortedcobj[0] = await sortloot(P(box, "cobj"), sortflags, FALSE, null);
          for (srtc = sortedcobj[0]; !!(obj = srtc.obj); srtc = $sadd(srtc, 1)) {
            if (identified) {
              await discover_object(obj.otyp, TRUE, FALSE);
              obj.known = (obj.bknown = (obj.dknown = (obj.rknown = 1) & 1) & 1) & 1;
              if (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) {
                obj.cknown = (obj.lknown = 1) & 1;
              }
            }
            strcpy(P(buf, 2), await doname_with_price(obj));
            await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
          }
          unsortloot(P(sortedcobj, 0));
        } else if (cat) {
          strcpy(P(buf, 2), S("Schroedinger's cat!"));
          await G.windowprocs.win_putstr(tmpwin, 0, P(buf));
        }
        if (dumping) {
          await G.windowprocs.win_putstr(0, 0, S(""));
        }
        await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
        if (all_containers) {
          await container_contents(box.cobj, identified, TRUE, reportempty);
        }
      } else if (reportempty) {
        await pline(S("%s is empty."), upstart(await thesimpleoname(box)));
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      }
    }
    if (!all_containers) {
      break;
    }
  }
}

export async function nh_terminate(status: number): Promise<void> {
  G.program_state.in_moveloop = 0;
  if (!G.program_state.panicking) {
    await freedynamicdata();
    dlb_cleanup();
  }
  G.program_state.exiting = 1;
  exit(status);
}

function vanqsort_cmp(vptr1: any, vptr2: any): number {
  let indx1 = vptr1.a[vptr1.o];
  let indx2 = vptr2.a[vptr2.o];
  let mlev1 = 0;
  let mlev2 = 0;
  let mstr1 = 0;
  let mstr2 = 0;
  let uniq1 = 0;
  let uniq2 = 0;
  let died1 = 0;
  let died2 = 0;
  let res = 0;
  let name1 = null;
  let name2 = null;
  let punct = null;
  let mcls1 = 0;
  let mcls2 = 0;
  switch (vanq_sortmode) {
  default:
  case VANQ_MLVL_MNDX:
    mlev1 = G.mons[indx1].mlevel, mlev2 = G.mons[indx2].mlevel;
    res = mlev2 - mlev1;
    break;
  case VANQ_MSTR_MNDX:
    mstr1 = G.mons[indx1].difficulty, mstr2 = G.mons[indx2].difficulty;
    res = mstr2 - mstr1;
    break;
  case VANQ_ALPHA_SEP:
    uniq1 = G.mons[indx1].geno & G_UNIQ && indx1 !== PM_HIGH_PRIEST ? 1 : 0;
    uniq2 = G.mons[indx2].geno & G_UNIQ && indx2 !== PM_HIGH_PRIEST ? 1 : 0;
    if (uniq1 ^ uniq2) {
      res = uniq2 - uniq1;
      break;
    }
  case VANQ_ALPHA_MIX:
    name1 = G.mons[indx1].mname, name2 = G.mons[indx2].mname;
    res = strncmpi(name1, name2, -1);
    break;
  case VANQ_MCLS_HTOL:
  case VANQ_MCLS_LTOH:
    mcls1 = G.mons[indx1].mlet, mcls2 = G.mons[indx2].mlet;
    if (mcls1 > S_ZOMBIE && mcls2 > S_ZOMBIE) {
      if (!!(punct = strchr(P(vanqsort_cmp$punctclasses), mcls1))) {
        mcls1 = S_ZOMBIE + 1 + (punct.o - P(vanqsort_cmp$punctclasses).o | 0) << 24 >> 24;
      }
      if (!!(punct = strchr(P(vanqsort_cmp$punctclasses), mcls2))) {
        mcls2 = S_ZOMBIE + 1 + (punct.o - P(vanqsort_cmp$punctclasses).o | 0) << 24 >> 24;
      }
    }
    res = mcls1 - mcls2;
    if (res === 0) {
      mlev1 = G.mons[indx1].mlevel, mlev2 = G.mons[indx2].mlevel;
      res = mlev1 - mlev2;
      if (vanq_sortmode === VANQ_MCLS_HTOL) {
        res = -res;
      }
    }
    break;
  case VANQ_COUNT_H_L:
  case VANQ_COUNT_L_H:
    died1 = G.mvitals[indx1].died, died2 = G.mvitals[indx2].died;
    res = died2 - died1;
    if (vanq_sortmode === VANQ_COUNT_L_H) {
      res = -res;
    }
    break;
  }
  if (res === 0) {
    res = indx1 - indx2;
  }
  return res;
}

async function set_vanq_order(): Promise<number> {
  let tmpwin = 0;
  const selected = [null];
  let any = new union_any();
  let i = 0;
  let n = 0;
  let choice = 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(64 / 8) | 0); ++i) {
    if (i === VANQ_ALPHA_MIX || i === VANQ_MCLS_HTOL) {
      continue;
    }
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, vanqorders[i], i === vanq_sortmode ? MENU_SELECTED : MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("Sort order for vanquished monster counts"));
  n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (n > 0) {
    choice = selected[0].item.a_int - 1;
    if (n > 1 && choice === vanq_sortmode) {
      choice = $sadd(selected[0], 1).item.a_int - 1;
    }
    free(selected[0]);
    vanq_sortmode = choice;
  }
  return n < 0 ? -1 : vanq_sortmode;
}

export async function dovanquished(): Promise<number> {
  await list_vanquished(97, FALSE);
  return 0;
}

async function list_vanquished(defquery: number, ask: number): Promise<void> {
  let $t1: any, $t2: any;
  let i = 0;
  let pfx = 0;
  let nkilled = 0;
  let ntypes = 0;
  let ni = 0;
  let total_killed = 0;
  let klwin = 0;
  let mindx = new Int16Array(382);
  let c = 0;
  let buf = new Int8Array(256);
  let buftoo = new Int8Array(256);
  let dumping = 0;
  dumping = (defquery === 100 ? 1 : 0) << 24 >> 24;
  if (dumping) {
    defquery = 121;
  }
  ntypes = 0;
  for (i = LOW_PM; i < NUMMONS; ++i) {
    if ((nkilled = G.mvitals[i].died) === 0) {
      continue;
    }
    mindx[($t2 = ntypes, ntypes = $t2 + 1 >>> 0, $t2)] = i << 16 >> 16;
    total_killed += nkilled;
  }
  if (ntypes !== 0) {
    let mlet = 0;
    let prev_mlet = 0;
    let class_header = 0;
    let uniq_header = 0;
    let was_uniq = FALSE;
    c = (ask ? await yn_function(S("Do you want an account of creatures vanquished?"), P(G.ynaqchars), defquery) : defquery) << 24 >> 24;
    if (c === 113) {
      ++G.program_state.stopprint;
    }
    if (c === 121 || c === 97) {
      if (c === 97) {
        if (await set_vanq_order() < 0) {
          return;
        }
      }
      uniq_header = (vanq_sortmode === VANQ_ALPHA_SEP ? 1 : 0) << 24 >> 24;
      class_header = (vanq_sortmode === VANQ_MCLS_LTOH || vanq_sortmode === VANQ_MCLS_HTOL ? 1 : 0) << 24 >> 24;
      klwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      await G.windowprocs.win_putstr(klwin, 0, S("Vanquished creatures:"));
      if (!dumping) {
        await G.windowprocs.win_putstr(klwin, 0, S(""));
      }
      await qsort(P(mindx), ntypes, 2, vanqsort_cmp);
      for (ni = 0; ni < ntypes; ni = ni + 1 >>> 0) {
        i = mindx[ni];
        nkilled = G.mvitals[i].died;
        mlet = G.mons[i].mlet;
        if (class_header && mlet !== prev_mlet) {
          strcpy(P(buf), G.def_monsyms[mlet].explain);
          await G.windowprocs.win_putstr(klwin, ask ? 0 : G.iflags.menu_headings, upstart(P(buf)));
          prev_mlet = mlet;
        }
        if (G.mons[i].geno & 4096 && i !== 272) {
          sprintf(P(buf), S("%s%s"), !(($sat(G.mons, i).mflags2 & 524288) >>> 0 !== 0) ? S("the ") : S(""), G.mons[i].mname);
          if (nkilled > 1) {
            switch (nkilled) {
            case 2:
              sprintf(eos(P(buf)), S(" (twice)"));
              break;
            case 3:
              sprintf(eos(P(buf)), S(" (thrice)"));
              break;
            default:
              sprintf(eos(P(buf)), S(" (%d times)"), nkilled);
              break;
            }
          }
          was_uniq = TRUE;
        } else {
          if (uniq_header && was_uniq) {
            await G.windowprocs.win_putstr(klwin, 0, S(""));
            was_uniq = FALSE;
          }
          if (nkilled === 1) {
            strcpy(P(buf), await an(G.mons[i].mname));
          } else {
            sprintf(P(buf), S("%3d %s"), nkilled, await makeplural(G.mons[i].mname));
          }
        }
        pfx = !strncmpi(P(buf), S("the "), 3) ? 0 : !strncmpi(P(buf), S("an "), 3) ? 1 : !strncmpi(P(buf), S("a "), 2) ? 2 : !digit(buf[2]) ? 4 : 0;
        if (class_header) {
          ++pfx;
        }
        sprintf(P(buftoo), S("%*s%s"), pfx, S(""), P(buf));
        await G.windowprocs.win_putstr(klwin, 0, P(buftoo));
      }
      if (ntypes > 1) {
        if (!dumping) {
          await G.windowprocs.win_putstr(klwin, 0, S(""));
        }
        sprintf(P(buf), S("%ld creatures vanquished."), total_killed);
        await G.windowprocs.win_putstr(klwin, 0, P(buf));
      }
      await G.windowprocs.win_display_nhwindow(klwin, TRUE);
      await G.windowprocs.win_destroy_nhwindow(klwin);
    }
  } else if (defquery === 97) {
    await pline(S("No creatures have been vanquished."));
  } else if (dumping) {
    await G.windowprocs.win_putstr(0, 0, S("No creatures were vanquished."));
  }
}

export async function num_genocides(): Promise<number> {
  let i = 0;
  let n = 0;
  for (i = LOW_PM; i < NUMMONS; ++i) {
    if (G.mvitals[i].mvflags & G_GENOD) {
      ++n;
      if (G.mons[i].geno & 4096 && i !== 272) {
        await impossible(S("unique creature '%d: %s' genocided?"), i, G.mons[i].mname);
      }
    }
  }
  return n;
}

function num_extinct(): number {
  let i = 0;
  let n = 0;
  for (i = LOW_PM; i < NUMMONS; ++i) {
    if (G.mons[i].geno & 4096 && i !== 272) {
      continue;
    }
    if ((G.mvitals[i].mvflags & G_GONE) === G_EXTINCT) {
      ++n;
    }
  }
  return n;
}

async function list_genocided(defquery: number, ask: number): Promise<void> {
  let i = 0;
  let ngenocided = 0;
  let nextinct = 0;
  let c = 0;
  let klwin = 0;
  let buf = new Int8Array(256);
  let dumping = 0;
  dumping = (defquery === 100 ? 1 : 0) << 24 >> 24;
  if (dumping) {
    defquery = 121;
  }
  ngenocided = await num_genocides();
  nextinct = num_extinct();
  if (ngenocided !== 0 || nextinct !== 0) {
    sprintf(P(buf), S("Do you want a list of %sspecies%s%s?"), nextinct && !ngenocided ? S("extinct ") : S(""), ngenocided ? S(" genocided") : S(""), nextinct && ngenocided ? S(" and extinct") : S(""));
    c = (ask ? await yn_function(P(buf), P(G.ynqchars), defquery) : defquery) << 24 >> 24;
    if (c === 113) {
      ++G.program_state.stopprint;
    }
    if (c === 121) {
      klwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
      sprintf(P(buf), S("%s%s species:"), ngenocided ? S("Genocided") : S("Extinct"), nextinct && ngenocided ? S(" or extinct") : S(""));
      await G.windowprocs.win_putstr(klwin, 0, P(buf));
      if (!dumping) {
        await G.windowprocs.win_putstr(klwin, 0, S(""));
      }
      for (i = LOW_PM; i < NUMMONS; ++i) {
        if (G.mons[i].geno & 4096 && i !== 272) {
          continue;
        }
        if (G.mvitals[i].mvflags & G_GONE) {
          sprintf(P(buf), S(" %s"), await makeplural(G.mons[i].mname));
          if ((G.mvitals[i].mvflags & G_GONE) === G_EXTINCT) {
            strcat(P(buf), S(" (extinct)"));
          }
          await G.windowprocs.win_putstr(klwin, 0, P(buf));
        }
      }
      if (!dumping) {
        await G.windowprocs.win_putstr(klwin, 0, S(""));
      }
      if (ngenocided > 0) {
        sprintf(P(buf), S("%d species genocided."), ngenocided);
        await G.windowprocs.win_putstr(klwin, 0, P(buf));
      }
      if (nextinct > 0) {
        sprintf(P(buf), S("%d species extinct."), nextinct);
        await G.windowprocs.win_putstr(klwin, 0, P(buf));
      }
      await G.windowprocs.win_display_nhwindow(klwin, TRUE);
      await G.windowprocs.win_destroy_nhwindow(klwin);
    }
  } else if (dumping) {
    await G.windowprocs.win_putstr(0, 0, S("No species were genocided or became extinct."));
  }
}

export async function delayed_killer(id: number, format: number, killername: Ptr | null): Promise<void> {
  let k = find_delayed_killer(id);
  if (!k) {
    k = new struct_kinfo();
    memset(k, 0, 272);
    k.id = id;
    k.next = G.killer.next;
    G.killer.next = k;
  }
  k.format = format;
  strcpy(P(k.name), killername ? killername : S(""));
  G.killer.name[0] = 0;
}

export function find_delayed_killer(id: number): struct_kinfo | null {
  let k = null;
  for (k = G.killer.next; !!k; k = k.next) {
    if (k.id === id) {
      break;
    }
  }
  return k;
}

export async function dealloc_killer(kptr: struct_kinfo | null): Promise<void> {
  let prev = G.killer;
  let k = null;
  if (!kptr) {
    return;
  }
  for (k = G.killer.next; !!k; k = k.next) {
    if (k === kptr) {
      break;
    }
    prev = k;
  }
  if (!k) {
    await impossible(S("dealloc_killer (#%d) not on list"), kptr.id);
  } else {
    prev.next = k.next;
    free(k);
    do {
      if (await debugcore(S("end.c"), 1)) {
        await pline(S("freed delayed killer #%d"), kptr.id);
      }
    } while (0);
  }
}

export async function save_killers(fd: number, mode: number): Promise<void> {
  let kptr = null;
  if (mode & (1 | 2)) {
    for (kptr = G.killer; !!kptr; kptr = kptr.next) {
      await bwrite(fd, kptr, 272);
    }
  }
  if (mode & 4) {
    while (G.killer.next) {
      kptr = G.killer.next.next;
      free(G.killer.next);
      G.killer.next = kptr;
    }
  }
}

export async function restore_killers(fd: number): Promise<void> {
  let kptr = null;
  for (kptr = G.killer; !!kptr; kptr = kptr.next) {
    await mread(fd, kptr, 272);
    if (kptr.next) {
      kptr.next = new struct_kinfo();
    }
  }
}

function wordcount(p: Ptr | null): number {
  let words = 0;
  while (p.a[p.o]) {
    while (p.a[p.o] && isspace(p.a[p.o] & 0xff)) {
      p = p.add(1);
    }
    if (p.a[p.o]) {
      ++words;
    }
    while (p.a[p.o] && !isspace(p.a[p.o] & 0xff)) {
      p = p.add(1);
    }
  }
  return words;
}

function bel_copy1(inp: Ptr | null, out: Ptr | null): void {
  let $t1: any, $t2: any;
  let in_ = inp.a[inp.o];
  out = out.add(strlen(out));
  while (in_.a[in_.o] && isspace(in_.a[in_.o] & 0xff)) {
    in_ = in_.add(1);
  }
  while (in_.a[in_.o] && !isspace(in_.a[in_.o] & 0xff)) {
    $wr(($t1 = out, out = $t1.add(1), $t1), 0, $rd(($t2 = in_, in_ = $t2.add(1), $t2)));
  }
  out.a[out.o] = 0;
  inp.a[inp.o] = in_;
}

export async function build_english_list(in_: Ptr | null): Promise<Ptr | null> {
  let out = null;
  const p = [null];
  p[0] = in_;
  let len = strlen(p[0]) | 0;
  let words = wordcount(p[0]);
  if (words > 1) {
    len += 3 + (words - 1);
  }
  out = P(new Int8Array((len + 1 >>> 0)));
  out.a[out.o] = 0;
  switch (words) {
  case 0:
    await impossible(S("no words in list"));
    break;
  case 1:
    bel_copy1(P(p, 0), out);
    break;
  default:
    if (words === 2) {
      bel_copy1(P(p, 0), out);
      strcat(out, S(" "));
    } else {
      do {
        bel_copy1(P(p, 0), out);
        strcat(out, S(", "));
      } while (--words > 1);
    }
    strcat(out, S("or "));
    bel_copy1(P(p, 0), out);
    break;
  }
  return out;
}

export function $init(): void {
  gems = $sarr(struct_valuable_data, 23);
  amulets = $sarr(struct_valuable_data, 11);
  valuables = $sarrOf([struct_val_list.$of(gems[0], Math.trunc(368 / 16) | 0), struct_val_list.$of(amulets[0], Math.trunc(176 / 16) | 0), struct_val_list.$of()]);
  deaths = [S("died"),
S("choked"),
S("poisoned"),
S("starvation"),
S("drowning"),
S("burning"),
S("dissolving under the heat and pressure"),
S("crushed"),
S("turned to stone"),
S("turned into slime"),
S("genocided"),
S("panic"),
S("trickery"),
S("quit"),
S("escaped"),
S("ascended")];
  ends = [S("died"),
S("choked"),
S("were poisoned"),
S("starved"),
S("drowned"),
S("burned"),
S("dissolved in the lava"),
S("were crushed"),
S("turned to stone"),
S("turned into slime"),
S("were genocided"),
S("panicked"),
S("were tricked"),
S("quit"),
S("escaped"),
S("ascended")];
  Schroedingers_cat = 0;
  death_fixups = $sarrOf([anon_end_c_532.$of(STONING, 1, S("getting stoned")), anon_end_c_532.$of(STARVING, 0, S("fainted from lack of food"), S("fainted"))]);
  vanqorders = [S("traditional: by monster level, by internal monster index"),
S("by monster toughness, by internal monster index"),
S("alphabetically, first unique monsters, then others"),
S("alphabetically, unique monsters and others intermixed"),
S("by monster class, high to low level within class"),
S("by monster class, low to high level within class"),
S("by count, high to low, by internal index within tied count"),
S("by count, low to high, by internal index within tied count")];
  vanq_sortmode = VANQ_MLVL_MNDX;
  vanqsort_cmp$punctclasses = $ta(Int8Array, 7, [S_LIZARD, S_EEL, S_GOLEM, S_GHOST, S_DEMON, S_HUMAN]);
}
