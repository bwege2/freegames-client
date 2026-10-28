// @ts-nocheck
// NetHack 3.6.7 topten.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dlb_cleanup, dlb_init } from './dlb.ts';
import { oname } from './do_name.ts';
import { deepest_lev_reached, depth, init_dungeons, on_level } from './dungeon.ts';
import { num_genocides } from './end.ts';
import { fopen_datafile, lock_file, unlock_file } from './files.ts';
import { copynchars, digit, eos, highc, onlyspace, ordin, yyyymmdd } from './hacklib.ts';
import { set_corpsenm } from './mkobj.ts';
import { an } from './objnam.ts';
import { impossible, raw_printf } from './pline.ts';
import { rnd } from './rnd.ts';
import { str2race, str2role } from './role.ts';
import { free_dungeons } from './save.ts';
import { struct_d_level, struct_obj, struct_toptenentry } from './structs.ts';
import { $cs, $rd, $shl64, $wr, G, P, S, atoi, fclose, fgetc, fgets, fprintf, free, fscanf, getuid, rewind, sprintf, sscanf, strcat, strchr, strcmp, strcpy, strlen, strncat, strncmp } from './rt/index.ts';
import { ATR_BOLD, ATR_NONE, A_ORIGINAL, BUFSZ, COLNO, EOF, FALSE, NAMSZ, NHW_TEXT, NON_PM, PANICKED, PATCHLEVEL, PM_HUMAN, PM_HUMAN_MUMMY, PM_RANGER, ROLESZ, SCOREPREFIX, TRUE, TTFIELDS, VERSION_MAJOR, VERSION_MINOR, WIN_ERR, XLOG_SEP } from './consts.ts';

let toptenwin: number;
let formatkiller$killed_by_prefix: any;
let readentry$fmt: any;
let readentry$fmt32: any;
let readentry$fmt33: any;
let writeentry$fmt32: any;
let writeentry$fmt33: any;
let writeentry$fmt0: any;
let writeentry$fmtX: any;
let get_rnd_toptenentry$tt_buf: struct_toptenentry;

export async function formatkiller(buf: Ptr | null, siz: number, how: number, incl_helpless: number): Promise<void> {
  let $t1: any, $t2: any;
  let l = 0;
  let c = 0;
  let kname = P(G.killer.name);
  buf.a[buf.o] = 0;
  switch (G.killer.format) {
  default:
    await impossible(S("bad killer format? (%d)"), G.killer.format);
  case 2:
    break;
  case 0:
    kname = await an(kname);
  case 1:
    strncat(buf, formatkiller$killed_by_prefix[how], siz - 1 >>> 0);
    l = strlen(buf) >>> 0;
    buf = buf.add(l), siz = siz - l >>> 0;
    break;
  }
  while ((siz = siz - 1 >>> 0) > 0) {
    c = $rd(($t1 = kname, kname = $t1.add(1), $t1));
    if (!c) {
      break;
    } else if (c === 44) {
      c = 59;
    } else if (c === 61) {
      c = 95;
    } else if (c === 9) {
      c = 32;
    }
    $wr(($t2 = buf, buf = $t2.add(1), $t2), 0, c);
  }
  buf.a[buf.o] = 0;
  if (incl_helpless && G.multi) {
    if (G.multi_reason && strlen(G.multi_reason) + 9 <= siz) {
      sprintf(buf, S(", while %s"), G.multi_reason);
    } else if (17 <= siz) {
      strcpy(buf, S(", while helpless"));
    }
  }
}

async function topten_print(x: Ptr | null): Promise<void> {
  if (toptenwin === WIN_ERR) {
    G.windowprocs.win_raw_print(x);
  } else {
    await G.windowprocs.win_putstr(toptenwin, ATR_NONE, x);
  }
}

async function topten_print_bold(x: Ptr | null): Promise<void> {
  if (toptenwin === WIN_ERR) {
    G.windowprocs.win_raw_print_bold(x);
  } else {
    await G.windowprocs.win_putstr(toptenwin, ATR_BOLD, x);
  }
}

export function observable_depth(lev: struct_d_level | null): number {
  return depth(lev);
}

async function discardexcess(rfile: Ptr | null): Promise<void> {
  let c = 0;
  do {
    c = await fgetc(rfile);
  } while (c !== 10 && c !== EOF);
}

async function readentry(rfile: Ptr | null, tt: struct_toptenentry | null): Promise<void> {
  let inbuf = new Int8Array(129);
  let s1 = new Int8Array(129);
  let s2 = new Int8Array(129);
  let s3 = new Int8Array(129);
  let s4 = new Int8Array(129);
  let s5 = new Int8Array(129);
  let s6 = new Int8Array(129);
  if (fscanf(rfile, P(readentry$fmt), P(tt, "ver_major"), P(tt, "ver_minor"), P(tt, "patchlevel"), P(tt, "points"), P(tt, "deathdnum"), P(tt, "deathlev"), P(tt, "maxlvl"), P(tt, "hp"), P(tt, "maxhp"), P(tt, "deaths"), P(tt, "deathdate"), P(tt, "birthdate"), P(tt, "uid")) !== TTFIELDS) {
    tt.points = 0;
    await discardexcess(rfile);
  } else {
    if (!fgets(P(inbuf), 129, rfile)) {
      $wr(P(inbuf), 0, 0);
    } else if (!strchr(P(inbuf), 10)) {
      strcpy(P(inbuf, 129 - 2), S("\n"));
      await discardexcess(rfile);
    }
    if (tt.ver_major < 3 || tt.ver_major === 3 && tt.ver_minor < 3) {
      let i = 0;
      if (sscanf(P(inbuf), P(readentry$fmt32), P(tt.plrole), P(tt.plgend), P(s1), P(s2)) === 4) {
        tt.plrole[1] = tt.plgend[1] = 0;
        copynchars(P(tt.name), P(s1), 11 - 1);
        copynchars(P(tt.death), P(s2), 101 - 1);
      } else {
        tt.points = 0;
      }
      tt.plrole[1] = 0;
      if ((i = str2role(P(tt.plrole))) >= 0) {
        strcpy(P(tt.plrole), G.roles[i].filecode);
      }
      strcpy(P(tt.plrace), S("?"));
      strcpy(P(tt.plgend), tt.plgend[0] === 77 ? S("Mal") : S("Fem"));
      strcpy(P(tt.plalign), S("?"));
    } else if (sscanf(P(inbuf), P(readentry$fmt33), P(s1), P(s2), P(s3), P(s4), P(s5), P(s6)) === 6) {
      copynchars(P(tt.plrole), P(s1), 4 - 1);
      copynchars(P(tt.plrace), P(s2), 4 - 1);
      copynchars(P(tt.plgend), P(s3), 4 - 1);
      copynchars(P(tt.plalign), P(s4), 4 - 1);
      copynchars(P(tt.name), P(s5), 11 - 1);
      copynchars(P(tt.death), P(s6), 101 - 1);
    } else {
      tt.points = 0;
    }
  }
  if (tt.points > 0) {
    if (tt.birthdate < 19000000) {
      tt.birthdate += 19000000;
    }
    if (tt.deathdate < 19000000) {
      tt.deathdate += 19000000;
    }
  }
}

function writeentry(rfile: Ptr | null, tt: struct_toptenentry | null): void {
  fprintf(rfile, P(writeentry$fmt0), tt.ver_major, tt.ver_minor, tt.patchlevel, tt.points, tt.deathdnum, tt.deathlev, tt.maxlvl, tt.hp, tt.maxhp, tt.deaths, tt.deathdate, tt.birthdate, tt.uid);
  if (tt.ver_major < 3 || tt.ver_major === 3 && tt.ver_minor < 3) {
    fprintf(rfile, P(writeentry$fmt32), tt.plrole[0], tt.plgend[0]);
  } else {
    fprintf(rfile, P(writeentry$fmt33), P(tt.plrole), P(tt.plrace), P(tt.plgend), P(tt.plalign));
  }
  fprintf(rfile, P(writeentry$fmtX), onlyspace(P(tt.name)) ? S("_") : P(tt.name), P(tt.death));
}

async function writexlentry(rfile: Ptr | null, tt: struct_toptenentry | null, how: number): Promise<void> {
  let buf = new Int8Array(256);
  let tmpbuf = new Int8Array(101);
  sprintf(P(buf), S("version=%d.%d.%d"), tt.ver_major, tt.ver_minor, tt.patchlevel);
  sprintf(eos(P(buf)), S("%cpoints=%ld%cdeathdnum=%d%cdeathlev=%d"), XLOG_SEP, tt.points, XLOG_SEP, tt.deathdnum, XLOG_SEP, tt.deathlev);
  sprintf(eos(P(buf)), S("%cmaxlvl=%d%chp=%d%cmaxhp=%d"), XLOG_SEP, tt.maxlvl, XLOG_SEP, tt.hp, XLOG_SEP, tt.maxhp);
  sprintf(eos(P(buf)), S("%cdeaths=%d%cdeathdate=%ld%cbirthdate=%ld%cuid=%d"), XLOG_SEP, tt.deaths, XLOG_SEP, tt.deathdate, XLOG_SEP, tt.birthdate, XLOG_SEP, tt.uid);
  fprintf(rfile, S("%s"), P(buf));
  sprintf(P(buf), S("%crole=%s%crace=%s%cgender=%s%calign=%s"), XLOG_SEP, P(tt.plrole), XLOG_SEP, P(tt.plrace), XLOG_SEP, P(tt.plgend), XLOG_SEP, P(tt.plalign));
  await formatkiller(P(tmpbuf), 101, how, FALSE);
  fprintf(rfile, S("%s%cname=%s%cdeath=%s"), P(buf), XLOG_SEP, P(G.plname), XLOG_SEP, P(tmpbuf));
  if (G.multi) {
    fprintf(rfile, S("%cwhile=%s"), XLOG_SEP, G.multi_reason ? G.multi_reason : S("helpless"));
  }
  fprintf(rfile, S("%cconduct=0x%lx%cturns=%ld%cachieve=0x%lx"), XLOG_SEP, await encodeconduct(), XLOG_SEP, G.moves, XLOG_SEP, encodeachieve());
  fprintf(rfile, S("%crealtime=%ld%cstarttime=%ld%cendtime=%ld"), XLOG_SEP, G.urealtime.realtime, XLOG_SEP, G.ubirthday, XLOG_SEP, G.urealtime.finish_time);
  fprintf(rfile, S("%cgender0=%s%calign0=%s"), XLOG_SEP, G.genders[G.flags.initgend].filecode, XLOG_SEP, G.aligns[1 - G.u.ualignbase[A_ORIGINAL]].filecode);
  fprintf(rfile, S("%cflags=0x%lx"), XLOG_SEP, encodexlogflags());
  fprintf(rfile, S("\n"));
}

function encodexlogflags(): number {
  let e = 0;
  if (G.flags.debug) {
    e = e | $shl64(1, 0);
  }
  if (G.flags.explore) {
    e = e | $shl64(1, 1);
  }
  if (!G.u.uroleplay.numbones) {
    e = e | $shl64(1, 2);
  }
  return e;
}

async function encodeconduct(): Promise<number> {
  let e = 0;
  if (!G.u.uconduct.food) {
    e = e | $shl64(1, 0);
  }
  if (!G.u.uconduct.unvegan) {
    e = e | $shl64(1, 1);
  }
  if (!G.u.uconduct.unvegetarian) {
    e = e | $shl64(1, 2);
  }
  if (!G.u.uconduct.gnostic) {
    e = e | $shl64(1, 3);
  }
  if (!G.u.uconduct.weaphit) {
    e = e | $shl64(1, 4);
  }
  if (!G.u.uconduct.killer) {
    e = e | $shl64(1, 5);
  }
  if (!G.u.uconduct.literate) {
    e = e | $shl64(1, 6);
  }
  if (!G.u.uconduct.polypiles) {
    e = e | $shl64(1, 7);
  }
  if (!G.u.uconduct.polyselfs) {
    e = e | $shl64(1, 8);
  }
  if (!G.u.uconduct.wishes) {
    e = e | $shl64(1, 9);
  }
  if (!G.u.uconduct.wisharti) {
    e = e | $shl64(1, 10);
  }
  if (!await num_genocides()) {
    e = e | $shl64(1, 11);
  }
  return e;
}

function encodeachieve(): number {
  let r = 0;
  if (G.u.uachieve.bell) {
    r = r | $shl64(1, 0);
  }
  if (G.u.uachieve.enter_gehennom) {
    r = r | $shl64(1, 1);
  }
  if (G.u.uachieve.menorah) {
    r = r | $shl64(1, 2);
  }
  if (G.u.uachieve.book) {
    r = r | $shl64(1, 3);
  }
  if (G.u.uevent.invoked) {
    r = r | $shl64(1, 4);
  }
  if (G.u.uachieve.amulet) {
    r = r | $shl64(1, 5);
  }
  if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
    r = r | $shl64(1, 6);
  }
  if ((G.dungeon_topology.d_astral_level.dlevel || G.dungeon_topology.d_astral_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_astral_level)) {
    r = r | $shl64(1, 7);
  }
  if (G.u.uachieve.ascended) {
    r = r | $shl64(1, 8);
  }
  if (G.u.uachieve.mines_luckstone) {
    r = r | $shl64(1, 9);
  }
  if (G.u.uachieve.finish_sokoban) {
    r = r | $shl64(1, 10);
  }
  if (G.u.uachieve.killed_medusa) {
    r = r | $shl64(1, 11);
  }
  if (G.u.uroleplay.blind) {
    r = r | $shl64(1, 12);
  }
  if (G.u.uroleplay.nudist) {
    r = r | $shl64(1, 13);
  }
  return r;
}

function free_ttlist(tt: struct_toptenentry | null): void {
  let ttnext = null;
  while (tt.points > 0) {
    ttnext = tt.tt_next;
    free(tt);
    tt = ttnext;
  }
  free(tt);
}

export async function topten(how: number, when: number): Promise<void> {
  let $g = 0;
  let uid = 0;
  let rank = 0;
  let rank0 = 0;
  let rank1 = 0;
  let occ_cnt = 0;
  let t0 = null;
  let tprev = null;
  let t1 = null;
  let rfile = null;
  let flg = 0;
  let t0_used = 0;
  let lfile = null;
  let xlfile = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      uid = getuid() | 0;
      rank0 = -1;
      rank1 = 0;
      occ_cnt = G.sysopt.persmax;
      flg = 0;
      if (G.program_state.panicking) {
        return;
      }
      if (G.iflags.toptenwin) {
        toptenwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
      }
      t0_used = FALSE;
      t0 = new struct_toptenentry();
      t0.ver_major = VERSION_MAJOR;
      t0.ver_minor = VERSION_MINOR;
      t0.patchlevel = PATCHLEVEL;
      t0.points = G.u.urexp;
      t0.deathdnum = G.u.uz.dnum;
      t0.deathlev = observable_depth(G.u.uz);
      t0.maxlvl = deepest_lev_reached(TRUE);
      t0.hp = G.u.uhp;
      t0.maxhp = G.u.uhpmax;
      t0.deaths = G.u.umortality;
      t0.uid = uid;
      copynchars(P(t0.plrole), G.urole.filecode, ROLESZ);
      copynchars(P(t0.plrace), G.urace.filecode, ROLESZ);
      copynchars(P(t0.plgend), G.genders[G.flags.female].filecode, ROLESZ);
      copynchars(P(t0.plalign), G.aligns[1 - G.u.ualign.type].filecode, ROLESZ);
      copynchars(P(t0.name), P(G.plname), NAMSZ);
      await formatkiller(P(t0.death), 101, how, TRUE);
      t0.birthdate = yyyymmdd(G.ubirthday);
      t0.deathdate = yyyymmdd(when);
      t0.tt_next = null;
      if (await lock_file(S("logfile"), SCOREPREFIX, 10)) {
        if (!(lfile = fopen_datafile(S("logfile"), S("a"), SCOREPREFIX))) {
          if (!G.program_state.done_hup) {
            G.windowprocs.win_raw_print(S("Cannot open log file!"));
          }
        } else {
          writeentry(lfile, t0);
          fclose(lfile);
        }
        unlock_file(S("logfile"));
      }
      if (await lock_file(S("xlogfile"), SCOREPREFIX, 10)) {
        if (!(xlfile = fopen_datafile(S("xlogfile"), S("a"), SCOREPREFIX))) {
          if (!G.program_state.done_hup) {
            G.windowprocs.win_raw_print(S("Cannot open extended log file!"));
          }
        } else {
          await writexlentry(xlfile, t0, how);
          fclose(xlfile);
        }
        unlock_file(S("xlogfile"));
      }
      if (G.flags.debug || G.flags.explore) {
        if (how !== PANICKED) {
          if (!G.program_state.done_hup) {
            let pbuf = new Int8Array(256);
            await topten_print(S(""));
            sprintf(P(pbuf), S("Since you were in %s mode, the score list will not be checked."), G.flags.debug ? S("wizard") : S("discover"));
            await topten_print(P(pbuf));
          }
        }
        { $g = 1; continue $L; }
      }
      if (!await lock_file(S("record"), SCOREPREFIX, 60)) {
        { $g = 2; continue $L; }
      }
      rfile = fopen_datafile(S("record"), S("r"), SCOREPREFIX);
      if (!rfile) {
        if (!G.program_state.done_hup) {
          G.windowprocs.win_raw_print(S("Cannot open record file!"));
        }
        unlock_file(S("record"));
        { $g = 2; continue $L; }
      }
      if (!G.program_state.done_hup) {
        await topten_print(S(""));
      }
      if (t0.points < G.sysopt.pointsmin) {
        t0.points = 0;
      }
      t1 = G.tt_head = new struct_toptenentry();
      tprev = null;
      for (rank = 1; ; ) {
        await readentry(rfile, t1);
        if (t1.points < G.sysopt.pointsmin) {
          t1.points = 0;
        }
        if (rank0 < 0 && t1.points < t0.points) {
          rank0 = rank++;
          if (!tprev) {
            G.tt_head = t0;
          } else {
            tprev.tt_next = t0;
          }
          t0.tt_next = t1;
          t0_used = TRUE;
          --occ_cnt;
          ++flg;
        } else {
          tprev = t1;
        }
        if (t1.points === 0) {
          break;
        }
        if ((G.sysopt.pers_is_uid ? t1.uid === t0.uid ? 1 : 0 : strncmp(P(t1.name), P(t0.name), NAMSZ) === 0 ? 1 : 0) && !strncmp(P(t1.plrole), P(t0.plrole), ROLESZ) && --occ_cnt <= 0) {
          if (rank0 < 0) {
            rank0 = 0;
            rank1 = rank;
            if (!G.program_state.done_hup) {
              let pbuf = new Int8Array(256);
              sprintf(P(pbuf), S("You didn't beat your previous score of %ld points."), t1.points);
              await topten_print(P(pbuf));
              await topten_print(S(""));
            }
          }
          if (occ_cnt < 0) {
            ++flg;
            continue;
          }
        }
        if (rank <= G.sysopt.entrymax) {
          t1.tt_next = new struct_toptenentry();
          t1 = t1.tt_next;
          ++rank;
        }
        if (rank > G.sysopt.entrymax) {
          t1.points = 0;
          break;
        }
      }
      if (flg) {
        fclose(rfile);
        if (!(rfile = fopen_datafile(S("record"), S("w"), SCOREPREFIX))) {
          if (!G.program_state.done_hup) {
            G.windowprocs.win_raw_print(S("Cannot write record file"));
          }
          unlock_file(S("record"));
          free_ttlist(G.tt_head);
          { $g = 2; continue $L; }
        }
        if (!G.program_state.stopprint) {
          if (rank0 > 0) {
            if (rank0 <= 10) {
              await topten_print(S("You made the top ten list!"));
            } else {
              let pbuf = new Int8Array(256);
              sprintf(P(pbuf), S("You reached the %d%s place on the top %d list."), rank0, ordin(rank0), G.sysopt.entrymax);
              await topten_print(P(pbuf));
            }
            await topten_print(S(""));
          }
        }
      }
      if (rank0 === 0) {
        rank0 = rank1;
      }
      if (rank0 <= 0) {
        rank0 = rank;
      }
      if (!G.program_state.stopprint) {
        await outheader();
      }
      t1 = G.tt_head;
      for (rank = 1; t1.points !== 0; ++rank, t1 = t1.tt_next) {
        if (flg) {
          writeentry(rfile, t1);
        }
        if (G.program_state.stopprint) {
          continue;
        }
        if (rank > G.flags.end_top && (rank < rank0 - G.flags.end_around || rank > rank0 + G.flags.end_around) && (!G.flags.end_own || (G.sysopt.pers_is_uid ? t1.uid === t0.uid ? 1 : 0 : strncmp(P(t1.name), P(t0.name), NAMSZ) === 0 ? 1 : 0))) {
          continue;
        }
        if (rank === rank0 - G.flags.end_around && rank0 > G.flags.end_top + G.flags.end_around + 1 && !G.flags.end_own) {
          await topten_print(S(""));
        }
        if (rank !== rank0) {
          await outentry(rank, t1, FALSE);
        } else if (!rank1) {
          await outentry(rank, t1, TRUE);
        } else {
          await outentry(rank, t1, TRUE);
          await outentry(0, t0, TRUE);
        }
      }
      if (rank0 >= rank) {
        if (!G.program_state.stopprint) {
          await outentry(0, t0, TRUE);
        }
      }
      fclose(rfile);
      unlock_file(S("record"));
      free_ttlist(G.tt_head);
    case 1: // showwin
      if (G.iflags.toptenwin && !G.program_state.stopprint) {
        await G.windowprocs.win_display_nhwindow(toptenwin, 1);
      }
    case 2: // destroywin
      if (!t0_used) {
        free(t0);
      }
      if (G.iflags.toptenwin) {
        await G.windowprocs.win_destroy_nhwindow(toptenwin);
        toptenwin = WIN_ERR;
      }
    }
    break;
  }
}

async function outheader(): Promise<void> {
  let $t1: any;
  let linebuf = new Int8Array(256);
  let bp = null;
  strcpy(P(linebuf), S(" No  Points     Name"));
  bp = eos(P(linebuf));
  while (bp.o < P(linebuf).add(COLNO).add(-9).o) {
    $wr(($t1 = bp, bp = $t1.add(1), $t1), 0, 32);
  }
  strcpy(bp, S("Hp [max]"));
  await topten_print(P(linebuf));
}

async function outentry(rank: number, t1: struct_toptenentry | null, so: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any;
  let second_line = TRUE;
  let linebuf = new Int8Array(256);
  let bp = null;
  let hpbuf = new Int8Array(24);
  let linebuf3 = new Int8Array(256);
  let hppos = 0;
  let lngr = 0;
  linebuf[0] = 0;
  if (rank) {
    sprintf(eos(P(linebuf)), S("%3d"), rank);
  } else {
    strcat(P(linebuf), S("   "));
  }
  sprintf(eos(P(linebuf)), S(" %10ld  %.10s"), t1.points ? t1.points : G.u.urexp, P(t1.name));
  sprintf(eos(P(linebuf)), S("-%s"), P(t1.plrole));
  if (t1.plrace[0] !== 63) {
    sprintf(eos(P(linebuf)), S("-%s"), P(t1.plrace));
  }
  sprintf(eos(P(linebuf)), S("-%s"), P(t1.plgend));
  if (t1.plalign[0] !== 63) {
    sprintf(eos(P(linebuf)), S("-%s "), P(t1.plalign));
  } else {
    strcat(P(linebuf), S(" "));
  }
  if (!strncmp(S("escaped"), P(t1.death), 7)) {
    sprintf(eos(P(linebuf)), S("escaped the dungeon %s[max level %d]"), !strncmp(S(" ("), P(t1.death).add(7), 2) ? P(t1.death).add(7).add(2) : S(""), t1.maxlvl);
    if (!!(bp = strchr(P(linebuf), 41))) {
      bp.a[bp.o] = (t1.deathdnum === G.dungeon_topology.d_astral_level.dnum ? 0 : 32) << 24 >> 24;
    }
    second_line = FALSE;
  } else if (!strncmp(S("ascended"), P(t1.death), 8)) {
    sprintf(eos(P(linebuf)), S("ascended to demigod%s-hood"), t1.plgend[0] === 70 ? S("dess") : S(""));
    second_line = FALSE;
  } else {
    if (!strncmp(P(t1.death), S("quit"), 4)) {
      strcat(P(linebuf), S("quit"));
      second_line = FALSE;
    } else if (!strncmp(P(t1.death), S("died of st"), 10)) {
      strcat(P(linebuf), S("starved to death"));
      second_line = FALSE;
    } else if (!strncmp(P(t1.death), S("choked"), 6)) {
      sprintf(eos(P(linebuf)), S("choked on h%s food"), t1.plgend[0] === 70 ? S("er") : S("is"));
    } else if (!strncmp(P(t1.death), S("poisoned"), 8)) {
      strcat(P(linebuf), S("was poisoned"));
    } else if (!strncmp(P(t1.death), S("crushed"), 7)) {
      strcat(P(linebuf), S("was crushed to death"));
    } else if (!strncmp(P(t1.death), S("petrified by "), 13)) {
      strcat(P(linebuf), S("turned to stone"));
    } else {
      strcat(P(linebuf), S("died"));
    }
    if (t1.deathdnum === G.dungeon_topology.d_astral_level.dnum) {
      let arg = null;
      let fmt = S(" on the Plane of %s");
      switch (t1.deathlev) {
      case -5:
        fmt = S(" on the %s Plane");
        arg = S("Astral");
        break;
      case -4:
        arg = S("Water");
        break;
      case -3:
        arg = S("Fire");
        break;
      case -2:
        arg = S("Air");
        break;
      case -1:
        arg = S("Earth");
        break;
      default:
        arg = S("Void");
        break;
      }
      sprintf(eos(P(linebuf)), fmt, arg);
    } else {
      sprintf(eos(P(linebuf)), S(" in %s"), P(G.dungeons[t1.deathdnum].dname));
      if (t1.deathdnum !== G.dungeon_topology.d_knox_level.dnum) {
        sprintf(eos(P(linebuf)), S(" on level %d"), t1.deathlev);
      }
      if (t1.deathlev !== t1.maxlvl) {
        sprintf(eos(P(linebuf)), S(" [max %d]"), t1.maxlvl);
      }
    }
    if (!strncmp(P(t1.death), S("quit "), 5)) {
      strcat(P(linebuf), P(t1.death).add(4));
    }
  }
  strcat(P(linebuf), S("."));
  if (second_line) {
    sprintf(eos(P(linebuf)), S("  %c%s."), highc($rd(P(t1.death))), P(t1.death).add(1));
  }
  lngr = strlen(P(linebuf)) | 0;
  if (t1.hp <= 0) {
    hpbuf[0] = 45, hpbuf[1] = 0;
  } else {
    sprintf(P(hpbuf), S("%d"), t1.hp);
  }
  hppos = COLNO - (11 - 1);
  while (lngr >= hppos) {
    for (bp = eos(P(linebuf)); !(bp.a[bp.o] === 32 && bp.o - P(linebuf).o < hppos); bp = bp.add(-1)) {
      ;
    }
    if (P(linebuf).add(15).o >= bp.o) {
      bp = P(linebuf).add(hppos).add(-1);
    }
    if (bp.o > P(linebuf).add(5).o && !strncmp(bp.add(-5), S(" [max"), 5)) {
      bp = bp.add(-5);
    }
    if (bp.a[bp.o] !== 32) {
      strcpy(P(linebuf3), bp);
    } else {
      strcpy(P(linebuf3), bp.add(1));
    }
    bp.a[bp.o] = 0;
    if (so) {
      while (bp.o < P(linebuf).add(COLNO - 1).o) {
        $wr(($t1 = bp, bp = $t1.add(1), $t1), 0, 32);
      }
      bp.a[bp.o] = 0;
      await topten_print_bold(P(linebuf));
    } else {
      await topten_print(P(linebuf));
    }
    sprintf(P(linebuf), S("%15s %s"), S(""), P(linebuf3));
    lngr = strlen(P(linebuf)) | 0;
  }
  hppos = COLNO - 7 - (strlen(P(hpbuf)) | 0);
  bp = eos(P(linebuf));
  if (bp.o <= P(linebuf).add(hppos).o) {
    while (bp.o < P(linebuf).add(hppos).o) {
      $wr(($t2 = bp, bp = $t2.add(1), $t2), 0, 32);
    }
    strcpy(bp, P(hpbuf));
    sprintf(eos(bp), S(" %s[%d]"), t1.maxhp < 10 ? S("  ") : t1.maxhp < 100 ? S(" ") : S(""), t1.maxhp);
  }
  if (so) {
    bp = eos(P(linebuf));
    if (so >= COLNO) {
      so = COLNO - 1;
    }
    while (bp.o < P(linebuf).add(so).o) {
      $wr(($t3 = bp, bp = $t3.add(1), $t3), 0, 32);
    }
    bp.a[bp.o] = 0;
    await topten_print_bold(P(linebuf));
  } else {
    await topten_print(P(linebuf));
  }
}

function score_wanted(current_ver: number, rank: number, t1: struct_toptenentry | null, playerct: number, players: Ptr | null, uid: number): number {
  let i = 0;
  if (current_ver && (t1.ver_major !== VERSION_MAJOR || t1.ver_minor !== VERSION_MINOR || t1.patchlevel !== PATCHLEVEL)) {
    return 0;
  }
  if (G.sysopt.pers_is_uid && !playerct && t1.uid === uid) {
    return 1;
  }
  for (i = 0; i < playerct; ++i) {
    if ($rd(players.a[players.o + i]) === 45 && strchr(S("pr"), $rd(players.a[players.o + i], 1)) && $rd(players.a[players.o + i], 2) === 0 && i + 1 < playerct) {
      let arg = players.a[players.o + (i + 1)];
      if ($rd(players.a[players.o + i], 1) === 112 && str2role(arg) === str2role(P(t1.plrole)) || $rd(players.a[players.o + i], 1) === 114 && str2race(arg) === str2race(P(t1.plrace))) {
        return 1;
      }
      ++i;
    } else if (strcmp(players.a[players.o + i], S("all")) === 0 || strncmp(P(t1.name), players.a[players.o + i], NAMSZ) === 0 || $rd(players.a[players.o + i]) === 45 && $rd(players.a[players.o + i], 1) === t1.plrole[0] && $rd(players.a[players.o + i], 2) === 0 || digit($rd(players.a[players.o + i])) && rank <= atoi(players.a[players.o + i])) {
      return 1;
    }
  }
  return 0;
}

export async function prscore(argc: number, argv: Ptr | null): Promise<void> {
  let players = null;
  let playerct = 0;
  let rank = 0;
  let current_ver = TRUE;
  let init_done = FALSE;
  let t1 = null;
  let rfile = null;
  let match_found = FALSE;
  let i = 0;
  let pbuf = new Int8Array(256);
  let uid = -1;
  const player0 = [null];
  if (argc < 2 || strncmp(argv.a[argv.o + 1], S("-s"), 2)) {
    raw_printf(S("prscore: bad arguments (%d)"), argc);
    return;
  }
  rfile = fopen_datafile(S("record"), S("r"), SCOREPREFIX);
  if (!rfile) {
    G.windowprocs.win_raw_print(S("Cannot open record file!"));
    return;
  }
  if (G.dungeon_topology.d_wiz1_level.dlevel === 0) {
    await dlb_init();
    await init_dungeons();
    init_done = TRUE;
  }
  if (!$rd(argv.a[argv.o + 1], 2)) {
    --argc;
    argv = argv.add(1);
  } else {
    argv.a[argv.o + 1] = argv.a[argv.o + 1].add(2);
  }
  if (argc > 1 && !strcmp(argv.a[argv.o + 1], S("-v"))) {
    current_ver = FALSE;
    --argc;
    argv = argv.add(1);
  }
  if (argc <= 1) {
    if (G.sysopt.pers_is_uid) {
      uid = getuid() | 0;
      playerct = 0;
      players = null;
    } else {
      player0[0] = P(G.plname);
      if (!player0[0].a[player0[0].o]) {
        player0[0] = S("hackplayer");
      }
      playerct = 1;
      players = P(player0, 0);
    }
  } else {
    playerct = --argc;
    players = argv = argv.add(1);
  }
  G.windowprocs.win_raw_print(S(""));
  t1 = G.tt_head = new struct_toptenentry();
  for (rank = 1; ; ++rank) {
    await readentry(rfile, t1);
    if (t1.points === 0) {
      break;
    }
    if (!match_found && score_wanted(current_ver, rank, t1, playerct, players, uid)) {
      match_found = TRUE;
    }
    t1.tt_next = new struct_toptenentry();
    t1 = t1.tt_next;
  }
  fclose(rfile);
  if (init_done) {
    await free_dungeons();
    dlb_cleanup();
  }
  if (match_found) {
    await outheader();
    t1 = G.tt_head;
    for (rank = 1; t1.points !== 0; ++rank, t1 = t1.tt_next) {
      if (score_wanted(current_ver, rank, t1, playerct, players, uid)) {
        await outentry(rank, t1, FALSE);
      }
    }
  } else {
    sprintf(P(pbuf), S("Cannot find any %sentries for "), current_ver ? S("current ") : S(""));
    if (playerct < 1) {
      strcat(P(pbuf), S("you."));
    } else {
      if (playerct > 1) {
        strcat(P(pbuf), S("any of "));
      }
      for (i = 0; i < playerct; ++i) {
        if (strlen(P(pbuf)) + strlen(players.a[players.o + i]) + 2 >= BUFSZ) {
          if (strlen(P(pbuf)) < BUFSZ - 4) {
            strcat(P(pbuf), S("..."));
          } else {
            strcpy(P(pbuf).add(strlen(P(pbuf))).add(-4), S("..."));
          }
          break;
        }
        strcat(P(pbuf), players.a[players.o + i]);
        if (i < playerct - 1) {
          if ($rd(players.a[players.o + i]) === 45 && strchr(S("pr"), $rd(players.a[players.o + i], 1)) && $rd(players.a[players.o + i], 2) === 0) {
            strcat(P(pbuf), S(" "));
          } else {
            strcat(P(pbuf), S(":"));
          }
        }
      }
    }
    G.windowprocs.win_raw_print(P(pbuf));
    raw_printf(S("Usage: %s -s [-v] <playertypes> [maxrank] [playernames]"), G.hname);
    raw_printf(S("Player types are: [-p role] [-r race]"));
  }
  free_ttlist(G.tt_head);
}

async function classmon(plch: Ptr | null, fem: number): Promise<number> {
  let i = 0;
  for (i = 0; G.roles[i].name.m; ++i) {
    if (!strncmp(plch, G.roles[i].filecode, ROLESZ)) {
      if (fem && G.roles[i].femalenum !== NON_PM) {
        return G.roles[i].femalenum;
      } else if (G.roles[i].malenum !== NON_PM) {
        return G.roles[i].malenum;
      } else {
        return PM_HUMAN;
      }
    }
  }
  if (!strcmp(plch, S("E"))) {
    return PM_RANGER;
  }
  await impossible(S("What weird role is this? (%s)"), plch);
  return PM_HUMAN_MUMMY;
}

export async function get_rnd_toptenentry(): Promise<struct_toptenentry | null> {
  let $g = 0;
  let rank = 0;
  let i = 0;
  let rfile = null;
  let tt = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      rfile = fopen_datafile(S("record"), S("r"), SCOREPREFIX);
      if (!rfile) {
        await impossible(S("Cannot open record file!"));
        return null;
      }
      tt = get_rnd_toptenentry$tt_buf;
      rank = rnd(G.sysopt.tt_oname_maxrank);
    case 1: // pickentry
      for (i = rank; i; --i) {
        await readentry(rfile, tt);
        if (tt.points === 0) {
          break;
        }
      }
      if (tt.points === 0) {
        if (rank > 1) {
          rank = 1;
          rewind(rfile);
          { $g = 1; continue $L; }
        }
        tt = null;
      }
      fclose(rfile);
      return tt;
    }
    break;
  }
}

export async function tt_oname(otmp: struct_obj | null): Promise<struct_obj | null> {
  let tt = null;
  if (!otmp) {
    return null;
  }
  tt = await get_rnd_toptenentry();
  if (!tt) {
    return null;
  }
  await set_corpsenm(otmp, await classmon(P(tt.plrole), tt.plgend[0] === 70 ? 1 : 0));
  otmp = await oname(otmp, P(tt.name));
  return otmp;
}

export function $init(): void {
  G.tt_head = null;
  toptenwin = -1;
  formatkiller$killed_by_prefix = [S("killed by "),
S("choked on "),
S("poisoned by "),
S("died of "),
S("drowned in "),
S("burned by "),
S("dissolved in "),
S("crushed to death by "),
S("petrified by "),
S("turned to slime by "),
S("killed by "),
S(""),
S(""),
S(""),
S(""),
S("")];
  readentry$fmt = $cs("%d.%d.%d %ld %d %d %d %d %d %d %ld %ld %d ", 43);
  readentry$fmt32 = $cs("%c%c %[^,],%[^\n]%*c", 20);
  readentry$fmt33 = $cs("%s %s %s %s %[^,],%[^\n]%*c", 27);
  writeentry$fmt32 = $cs("%c%c ", 6);
  writeentry$fmt33 = $cs("%s %s %s %s ", 13);
  writeentry$fmt0 = $cs("%d.%d.%d %ld %d %d %d %d %d %d %ld %ld %d ", 43);
  writeentry$fmtX = $cs("%s,%s\n", 7);
  get_rnd_toptenentry$tt_buf = new struct_toptenentry();
}
