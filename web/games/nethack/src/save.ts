// @ts-nocheck
// NetHack 3.6.7 save.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { save_artifacts } from './artifact.ts';
import { change_luck } from './attrib.ts';
import { status_finish } from './botl.ts';
import { yn_function } from './cmd.ts';
import { doredraw, tmp_at } from './display.ts';
import { ledger_no, maxledgerno, save_dungeon } from './dungeon.ts';
import { done, nh_terminate, panic, save_killers } from './end.ts';
import { save_engravings } from './engrave.ts';
import { create_levelfile, create_savefile, debugcore, delete_levelfile, delete_savefile, fqname, nh_compress, nh_uncompress, nhclose, open_levelfile, open_savefile, save_savefile_name } from './files.ts';
import { nomul } from './hack.ts';
import { getnow, strncmpi, yyyymmddhhmmss } from './hacklib.ts';
import { free_invbuf } from './invent.ts';
import { save_light_sources } from './light.ts';
import { free_maildata } from './mail.ts';
import { save_waterlevel } from './mkmaze.ts';
import { dealloc_obj } from './mkobj.ts';
import { save_rooms } from './mkroom.ts';
import { dealloc_monst, dmonsfree, mon_animal_list } from './mon.ts';
import { monsndx } from './mondata.ts';
import { savenames } from './o_init.ts';
import { free_autopickup_exceptions, free_menu_coloring, free_symsets, msgtype_free } from './options.ts';
import { There, dumplogfreemessages, free_youbuf, pline } from './pline.ts';
import { forget_temple_entry } from './priest.ts';
import { unload_qtlist } from './questpgr.ts';
import { save_regions } from './region.ts';
import { getlev, minit } from './restore.ts';
import { save_oracles } from './rumors.ts';
import { sysopt_release } from './sys.ts';
import { save_timers } from './timeout.ts';
import { sethanguphandler } from './unixmain.ts';
import { store_version } from './version.ts';
import { vision_recalc } from './vision.ts';
import { save_worm } from './worm.ts';
import { struct_d_level, struct_fruit, struct_monst, struct_obj, struct_save_procs, struct_trap } from './structs.ts';
import { $u64, G, P, S, fclose, fdopen, fflush, free, fwrite, getuid, read, signal, sprintf, strcpy, strlen, write } from './rt/index.ts';
import { BUFSZ, COLNO, DISP_FREEMEM, EOF, EXIT_FAILURE, EXIT_SUCCESS, FALSE, FREE_SAVE, FULL_MOON, LFILE_EXISTS, MAXSPELL, OBJ_FREE, PL_NSIZ, RANGE_GLOBAL, RANGE_LEVEL, ROWNO, SAVEPREFIX, SFI1_EXTERNALCOMP, SFI1_RLECOMP, SFI1_ZEROCOMP, SIGINT, TRICKED, TRUE, VISITED, WRITE_SAVE } from './consts.ts';

let saveprocs: struct_save_procs;
let ustuck_id: any;
let usteed_id: any;
let bw_fd: number;
let bw_FILE: Ptr | null;
let buffering: number;
let savestateinlock$havestate: number;
let savetrapchn$zerotrap: struct_trap;
let savefruitchn$zerofruit: struct_fruit;

export async function dosave(): Promise<number> {
  if (G.iflags.debug_fuzzer) {
    return 0;
  }
  await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
  if (await yn_function(S("Really save?"), P(G.ynchars), 110) === 110) {
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    if (G.multi > 0) {
      nomul(0);
    }
  } else {
    await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    await pline(S("Saving..."));
    G.program_state.done_hup = 0;
    if (await dosave0()) {
      G.u.uhp = -1;
      await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, TRUE);
      await G.windowprocs.win_exit_nhwindows(S("Be seeing you..."));
      await nh_terminate(EXIT_SUCCESS);
    } else {
      await doredraw();
    }
  }
  return 0;
}

export async function dosave0(): Promise<number> {
  let fq_save = null;
  let fd = 0;
  let ofd = 0;
  const ltmp = new Int8Array(1);
  let uz_save = new struct_d_level();
  let whynot = new Int8Array(256);
  G.u.uinvulnerable = 0;
  if (G.iflags.save_uswallow) {
    G.u.uswallow = 1, G.iflags.save_uswallow = 0;
  }
  if (G.iflags.save_uinwater) {
    G.u.uinwater = 1, G.iflags.save_uinwater = 0;
  }
  if (G.iflags.save_uburied) {
    G.u.uburied = 1, G.iflags.save_uburied = 0;
  }
  if (!G.program_state.something_worth_saving || !G.SAVEF[0]) {
    return 0;
  }
  fq_save = fqname(P(G.SAVEF), SAVEPREFIX, 1);
  sethanguphandler(1);
  signal(SIGINT, 1);
  if (!G.program_state.done_hup) {
    if (G.iflags.window_inited) {
      nh_uncompress(fq_save);
      fd = open_savefile();
      if (fd > 0) {
        nhclose(fd);
        await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
        await There(S("seems to be an old save file."));
        if (await yn_function(S("Overwrite the old file?"), P(G.ynchars), 110) === 110) {
          nh_compress(fq_save);
          return 0;
        }
      }
    }
  }
  if (!G.program_state.done_hup) {
    G.windowprocs.win_mark_synch();
  }
  fd = create_savefile();
  if (fd < 0) {
    if (!G.program_state.done_hup) {
      await pline(S("Cannot open save file."));
    }
    delete_savefile();
    return 0;
  }
  await vision_recalc(2);
  if (G.flags.moonphase === FULL_MOON) {
    change_luck(-1);
  }
  if (G.flags.friday13) {
    change_luck(1);
  }
  if (G.iflags.window_inited) {
    if (!G.program_state.done_hup) {
      await G.windowprocs.win_clear_nhwindow(G.WIN_MESSAGE);
    }
  }
  await store_version(fd);
  await store_savefileinfo(fd);
  await store_plname_in_file(fd);
  ustuck_id[0] = G.u.ustuck ? G.u.ustuck.m_id : 0;
  usteed_id[0] = G.u.usteed ? G.u.usteed.m_id : 0;
  await savelev(fd, ledger_no(G.u.uz), WRITE_SAVE | FREE_SAVE);
  await savegamestate(fd, WRITE_SAVE | FREE_SAVE);
  uz_save.$cp(G.u.uz);
  G.u.uz.dnum = G.u.uz.dlevel = 0;
  G.u.ustuck = null;
  G.u.usteed = null;
  for (ltmp[0] = 1; ltmp[0] <= maxledgerno(); ltmp[0] = ltmp[0] + 1 << 24 >> 24) {
    if (ltmp[0] === ledger_no(uz_save)) {
      continue;
    }
    if (!(G.level_info[ltmp[0]].flags & LFILE_EXISTS)) {
      continue;
    }
    ofd = open_levelfile(ltmp[0], P(whynot));
    if (ofd < 0) {
      if (!G.program_state.done_hup) {
        await pline(S("%s"), P(whynot));
      }
      nhclose(fd);
      delete_savefile();
      if (!G.program_state.done_hup) {
        strcpy(P(G.killer.name), P(whynot));
      }
      if (!G.program_state.done_hup) {
        await done(TRICKED);
      }
      return 0;
    }
    minit();
    await getlev(ofd, G.hackpid, ltmp[0], FALSE);
    nhclose(ofd);
    await bwrite(fd, P(ltmp, 0), 1);
    await savelev(fd, ltmp[0], WRITE_SAVE | FREE_SAVE);
    delete_levelfile(ltmp[0]);
  }
  await bclose(fd);
  G.u.uz.$cp(uz_save);
  delete_levelfile(ledger_no(G.u.uz));
  delete_levelfile(0);
  nh_compress(fq_save);
  G.program_state.something_worth_saving = 0;
  return 1;
}

async function savegamestate(fd: number, mode: number): Promise<void> {
  const uid = new Float64Array(1);
  let bc_objs = null;
  uid[0] = getuid();
  await bwrite(fd, P(uid, 0), 8);
  await bwrite(fd, G.context, 328);
  await bwrite(fd, G.flags, 160);
  G.urealtime.finish_time = getnow();
  G.urealtime.realtime += G.urealtime.finish_time - G.urealtime.start_timing;
  await bwrite(fd, G.u, 2392);
  await bwrite(fd, await yyyymmddhhmmss(G.ubirthday), 14);
  await bwrite(fd, P(G.urealtime, "realtime"), 8);
  await bwrite(fd, await yyyymmddhhmmss(G.urealtime.start_timing), 14);
  G.urealtime.start_timing = G.urealtime.finish_time;
  await save_killers(fd, mode);
  await save_timers(fd, mode, RANGE_GLOBAL);
  await save_light_sources(fd, mode, RANGE_GLOBAL);
  await saveobjchn(fd, G.invent, mode);
  if (G.u.uswallow | 0 && G.uchain && G.uchain.where === 0) {
    G.uchain.nobj = bc_objs;
    bc_objs = G.uchain;
  }
  if (G.u.uswallow | 0 && G.uball && G.uball.where === 0) {
    G.uball.nobj = bc_objs;
    bc_objs = G.uball;
  }
  await saveobjchn(fd, bc_objs, mode);
  await saveobjchn(fd, G.migrating_objs, mode);
  await savemonchn(fd, G.migrating_mons, mode);
  if (mode & 4) {
    G.invent = null;
    G.migrating_objs = null;
    G.migrating_mons = null;
  }
  await bwrite(fd, G.mvitals[0], 1146);
  await save_dungeon(fd, (!!(mode & (1 | 2)) ? 1 : 0) << 24 >> 24, (!!(mode & 4) ? 1 : 0) << 24 >> 24);
  await savelevchn(fd, mode);
  await bwrite(fd, P(G, "moves"), 8);
  await bwrite(fd, P(G, "monstermoves"), 8);
  await bwrite(fd, G.quest_status, 8);
  await bwrite(fd, G.spl_book[0], 8 * (MAXSPELL + 1));
  await save_artifacts(fd);
  await save_oracles(fd, mode);
  if (ustuck_id[0]) {
    await bwrite(fd, P(ustuck_id, 0), 4);
  }
  if (usteed_id[0]) {
    await bwrite(fd, P(usteed_id, 0), 4);
  }
  await bwrite(fd, P(G.pl_character), 32);
  await bwrite(fd, P(G.pl_fruit), 32);
  await savefruitchn(fd, mode);
  await savenames(fd, mode);
  await save_waterlevel(fd, mode);
  await save_msghistory(fd, mode);
  await bflush(fd);
}

export async function tricked_fileremoved(fd: number, whynot: Ptr | null): Promise<number> {
  if (fd < 0) {
    await pline(S("%s"), whynot);
    await pline(S("Probably someone removed it."));
    strcpy(P(G.killer.name), whynot);
    await done(TRICKED);
    return TRUE;
  }
  return FALSE;
}

export async function savestateinlock(): Promise<void> {
  let fd = 0;
  const hpid = new Int32Array(1);
  let whynot = new Int8Array(256);
  if (G.flags.ins_chkpt || savestateinlock$havestate) {
    fd = open_levelfile(0, P(whynot));
    if (await tricked_fileremoved(fd, P(whynot))) {
      return;
    }
    read(fd, P(hpid, 0), 4);
    if (G.hackpid !== hpid[0]) {
      sprintf(P(whynot), S("Level #0 pid (%d) doesn't match ours (%d)!"), hpid[0], G.hackpid);
      await pline(S("%s"), P(whynot));
      strcpy(P(G.killer.name), P(whynot));
      await done(TRICKED);
    }
    nhclose(fd);
    fd = create_levelfile(0, P(whynot));
    if (fd < 0) {
      await pline(S("%s"), P(whynot));
      strcpy(P(G.killer.name), P(whynot));
      await done(TRICKED);
      return;
    }
    write(fd, P(G, "hackpid"), 4);
    if (G.flags.ins_chkpt) {
      const currlev = new Int32Array(1);
      currlev[0] = ledger_no(G.u.uz);
      write(fd, P(currlev, 0), 4);
      save_savefile_name(fd);
      await store_version(fd);
      await store_savefileinfo(fd);
      await store_plname_in_file(fd);
      ustuck_id[0] = G.u.ustuck ? G.u.ustuck.m_id : 0;
      usteed_id[0] = G.u.usteed ? G.u.usteed.m_id : 0;
      await savegamestate(fd, WRITE_SAVE);
    }
    await bclose(fd);
  }
  savestateinlock$havestate = G.flags.ins_chkpt;
}

export async function savelev(fd: number, lev$: number, mode: number): Promise<void> {
  const lev = new Int8Array(1);
  lev[0] = lev$;
  let $t1: any;
  let $g = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (mode !== FREE_SAVE) {
        if (G.iflags.purge_monsters) {
          await dmonsfree();
        }
        if (fd < 0) {
          await panic(S("Save on bad file!"));
        }
        if (lev[0] >= 0 && lev[0] <= maxledgerno()) {
          ($t1 = G.level_info[lev[0]], $t1.flags = ($t1.flags | VISITED) & 0xff);
        }
        await bwrite(fd, P(G, "hackpid"), 4);
        await bwrite(fd, P(lev, 0), 1);
      }
      await savecemetery(fd, mode, P(G.level, "bonesinfo"));
      if (mode === FREE_SAVE) {
        { $g = 1; continue $L; }
      }
      await savelevl(fd, ((G.sfsaveinfo.sfi1 & SFI1_RLECOMP) >>> 0 === SFI1_RLECOMP ? 1 : 0) << 24 >> 24);
      await bwrite(fd, P(G.lastseentyp), 1680);
      await bwrite(fd, P(G, "monstermoves"), 8);
      await bwrite(fd, G.upstair, 5);
      await bwrite(fd, G.dnstair, 5);
      await bwrite(fd, G.upladder, 5);
      await bwrite(fd, G.dnladder, 5);
      await bwrite(fd, G.sstairs, 5);
      await bwrite(fd, G.updest, 8);
      await bwrite(fd, G.dndest, 8);
      await bwrite(fd, G.level.flags, 8);
      await bwrite(fd, G.doors[0], 240);
      await save_rooms(fd);
    case 1: // skip_lots
      await save_timers(fd, mode, RANGE_LEVEL);
      await save_light_sources(fd, mode, RANGE_LEVEL);
      await savemonchn(fd, G.level.monlist, mode);
      await save_worm(fd, mode);
      await savetrapchn(fd, G.ftrap, mode);
      await saveobjchn(fd, G.level.objlist, mode);
      await saveobjchn(fd, G.level.buriedobjlist, mode);
      await saveobjchn(fd, G.billobjs, mode);
      if (mode & 4) {
        let x = 0;
        let y = 0;
        for (y = 0; y < ROWNO; ++y) {
          for (x = 0; x < COLNO; ++x) {
            G.level.monsters[x][y] = null;
          }
        }
        G.level.monlist = null;
        G.ftrap = null;
        G.level.objlist = G.level.buriedobjlist = G.billobjs = null;
      }
      await save_engravings(fd, mode);
      await savedamage(fd, mode);
      await save_regions(fd, mode);
      if (mode !== FREE_SAVE) {
        await bflush(fd);
      }
    }
    break;
  }
}

async function savelevl(fd: number, rlecomp: number): Promise<void> {
  ;
  await bwrite(fd, P(G.level.locations), 13440);
}

export async function bufon(fd: number): Promise<void> {
  await saveprocs.save_bufon(fd);
  return;
}

export async function bufoff(fd: number): Promise<void> {
  await saveprocs.save_bufoff(fd);
  return;
}

export async function bflush(fd: number): Promise<void> {
  await saveprocs.save_bflush(fd);
  return;
}

export async function bwrite(fd: number, loc: any, num: number): Promise<void> {
  await saveprocs.save_bwrite(fd, loc, num);
  return;
}

export async function bclose(fd: number): Promise<void> {
  await saveprocs.save_bclose(fd);
  return;
}

async function def_bufon(fd: number): Promise<void> {
  if (bw_fd !== fd) {
    if (bw_fd >= 0) {
      await panic(S("double buffering unexpected"));
    }
    bw_fd = fd;
    if (!(bw_FILE = fdopen(fd, S("w")))) {
      await panic(S("buffering of file %d failed"), fd);
    }
  }
  buffering = TRUE;
}

async function def_bufoff(fd: number): Promise<void> {
  await def_bflush(fd);
  buffering = FALSE;
}

async function def_bflush(fd: number): Promise<void> {
  if (fd === bw_fd) {
    if (fflush(bw_FILE) === EOF) {
      await panic(S("flush of savefile failed!"));
    }
  }
  return;
}

async function def_bwrite(fd: number, loc: any, num: number): Promise<void> {
  let failed = 0;
  if (buffering) {
    if (fd !== bw_fd) {
      await panic(S("unbuffered write to fd %d (!= %d)"), fd, bw_fd);
    }
    failed = (fwrite(loc, $u64(num | 0), 1, bw_FILE) !== 1 ? 1 : 0) << 24 >> 24;
  } else {
    failed = (write(fd, loc, num) !== num ? 1 : 0) << 24 >> 24;
  }
  if (failed) {
    if (G.program_state.done_hup) {
      await nh_terminate(EXIT_FAILURE);
    } else {
      await panic(S("cannot write %u bytes to file #%d"), num, fd);
    }
  }
}

export async function def_bclose(fd: number): Promise<void> {
  await bufoff(fd);
  if (fd === bw_fd) {
    fclose(bw_FILE);
    bw_fd = -1;
    bw_FILE = null;
  } else {
    nhclose(fd);
  }
  return;
}

async function savelevchn(fd: number, mode: number): Promise<void> {
  let tmplev = null;
  let tmplev2 = null;
  const cnt = new Int32Array(1);
  cnt[0] = 0;
  for (tmplev = G.sp_levchn; tmplev; tmplev = tmplev.next) {
    ++cnt[0];
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, P(cnt, 0), 4);
  }
  for (tmplev = G.sp_levchn; tmplev; tmplev = tmplev2) {
    tmplev2 = tmplev.next;
    if (mode & (1 | 2)) {
      await bwrite(fd, tmplev, 32);
    }
    if (mode & 4) {
      free(tmplev);
    }
  }
  if (mode & 4) {
    G.sp_levchn = null;
  }
}

export async function savecemetery(fd: number, mode: number, cemeteryaddr: Ptr | null): Promise<void> {
  let thisbones = null;
  let nextbones = null;
  const flag = new Int32Array(1);
  flag[0] = cemeteryaddr.a[cemeteryaddr.o] ? 0 : -1;
  if (mode & (1 | 2)) {
    await bwrite(fd, P(flag, 0), 4);
  }
  nextbones = cemeteryaddr.a[cemeteryaddr.o];
  while (!!(thisbones = nextbones)) {
    nextbones = thisbones.next;
    if (mode & (1 | 2)) {
      await bwrite(fd, thisbones, 176);
    }
    if (mode & 4) {
      free(thisbones);
    }
  }
  if (mode & 4) {
    cemeteryaddr.a[cemeteryaddr.o] = null;
  }
}

async function savedamage(fd: number, mode: number): Promise<void> {
  let $t1: any;
  let damageptr = null;
  let tmp_dam = null;
  const xl = new Uint32Array(1);
  xl[0] = 0;
  damageptr = G.level.damagelist;
  for (tmp_dam = damageptr; tmp_dam; tmp_dam = tmp_dam.next) {
    xl[0] = xl[0] + 1 >>> 0;
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, P(xl, 0), 4);
  }
  while (($t1 = xl[0], xl[0] = $t1 - 1 >>> 0, $t1)) {
    if (mode & (1 | 2)) {
      await bwrite(fd, damageptr, 32);
    }
    tmp_dam = damageptr;
    damageptr = damageptr.next;
    if (mode & 4) {
      free(tmp_dam);
    }
  }
  if (mode & 4) {
    G.level.damagelist = null;
  }
}

async function saveobj(fd: number, otmp: struct_obj | null): Promise<void> {
  const buflen = new Int32Array(1);
  const zerobuf = new Int32Array(1);
  zerobuf[0] = 0;
  buflen[0] = 96;
  await bwrite(fd, P(buflen, 0), 4);
  await bwrite(fd, otmp, buflen[0] >>> 0);
  if (otmp.oextra) {
    buflen[0] = otmp.oextra.oname ? (strlen(otmp.oextra.oname) | 0) + 1 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, otmp.oextra.oname, buflen[0] >>> 0);
    }
    if (otmp.oextra.omonst) {
      await savemon(fd, otmp.oextra.omonst);
    } else {
      await bwrite(fd, P(zerobuf, 0), 4);
    }
    buflen[0] = otmp.oextra.omid ? 4 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, otmp.oextra.omid, buflen[0] >>> 0);
    }
    buflen[0] = otmp.oextra.olong ? 8 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, otmp.oextra.olong, buflen[0] >>> 0);
    }
    buflen[0] = otmp.oextra.omailcmd ? (strlen(otmp.oextra.omailcmd) | 0) + 1 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, otmp.oextra.omailcmd, buflen[0] >>> 0);
    }
  }
}

async function saveobjchn(fd: number, otmp: struct_obj | null, mode: number): Promise<void> {
  let otmp2 = null;
  const minusone = new Int32Array(1);
  minusone[0] = -1;
  while (otmp) {
    otmp2 = otmp.nobj;
    if (mode & (1 | 2)) {
      await saveobj(fd, otmp);
    }
    if (!!otmp.cobj) {
      await saveobjchn(fd, otmp.cobj, mode);
    }
    if (mode & 4) {
      if (otmp === G.context.victual.piece) {
        G.context.victual.o_id = otmp.o_id;
        G.context.victual.piece = null;
      }
      if (otmp === G.context.tin.tin) {
        G.context.tin.o_id = otmp.o_id;
        G.context.tin.tin = null;
      }
      if (otmp === G.context.spbook.book) {
        G.context.spbook.o_id = otmp.o_id;
        G.context.spbook.book = null;
      }
      otmp.where = OBJ_FREE;
      otmp.nobj = null;
      otmp.cobj = null;
      otmp.timed = 0;
      otmp.lamplit = 0;
      await dealloc_obj(otmp);
    }
    otmp = otmp2;
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, P(minusone, 0), 4);
  }
}

async function savemon(fd: number, mtmp: struct_monst | null): Promise<void> {
  const buflen = new Int32Array(1);
  mtmp.mburied = 0;
  buflen[0] = 144;
  await bwrite(fd, P(buflen, 0), 4);
  await bwrite(fd, mtmp, buflen[0] >>> 0);
  if (mtmp.mextra) {
    buflen[0] = mtmp.mextra.mname ? (strlen(mtmp.mextra.mname) | 0) + 1 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.mname, buflen[0] >>> 0);
    }
    buflen[0] = mtmp.mextra.egd ? 324 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.egd, buflen[0] >>> 0);
    }
    buflen[0] = mtmp.mextra.epri ? 40 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.epri, buflen[0] >>> 0);
    }
    buflen[0] = mtmp.mextra.eshk ? 4936 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.eshk, buflen[0] >>> 0);
    }
    buflen[0] = mtmp.mextra.emin ? 2 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.emin, buflen[0] >>> 0);
    }
    buflen[0] = mtmp.mextra.edog ? 56 : 0;
    await bwrite(fd, P(buflen, 0), 4);
    if (buflen[0] > 0) {
      await bwrite(fd, mtmp.mextra.edog, buflen[0] >>> 0);
    }
    await bwrite(fd, P(mtmp.mextra, "mcorpsenm"), 4);
  }
}

async function savemonchn(fd: number, mtmp: struct_monst | null, mode: number): Promise<void> {
  let mtmp2 = null;
  const minusone = new Int32Array(1);
  minusone[0] = -1;
  while (mtmp) {
    mtmp2 = mtmp.nmon;
    if (mode & (1 | 2)) {
      mtmp.mnum = await monsndx(mtmp.data) << 16 >> 16;
      if (mtmp.ispriest) {
        await forget_temple_entry(mtmp);
      }
      await savemon(fd, mtmp);
    }
    if (mtmp.minvent) {
      await saveobjchn(fd, mtmp.minvent, mode);
    }
    if (mode & 4) {
      if (mtmp === G.context.polearm.hitmon) {
        G.context.polearm.m_id = mtmp.m_id;
        G.context.polearm.hitmon = null;
      }
      mtmp.nmon = null;
      await dealloc_monst(mtmp);
    }
    mtmp = mtmp2;
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, P(minusone, 0), 4);
  }
}

async function savetrapchn(fd: number, trap: struct_trap | null, mode: number): Promise<void> {
  let trap2 = null;
  while (trap) {
    trap2 = trap.ntrap;
    if (mode & (1 | 2)) {
      await bwrite(fd, trap, 24);
    }
    if (mode & 4) {
      free(trap);
    }
    trap = trap2;
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, savetrapchn$zerotrap, 24);
  }
}

export async function savefruitchn(fd: number, mode: number): Promise<void> {
  let f2 = null;
  let f1 = null;
  f1 = G.ffruit;
  while (f1) {
    f2 = f1.nextf;
    if (f1.fid >= 0 && mode & (1 | 2)) {
      await bwrite(fd, f1, 48);
    }
    if (mode & 4) {
      free(f1);
    }
    f1 = f2;
  }
  if (mode & (1 | 2)) {
    await bwrite(fd, savefruitchn$zerofruit, 48);
  }
  if (mode & 4) {
    G.ffruit = null;
  }
}

export async function store_plname_in_file(fd: number): Promise<void> {
  const plsiztmp = new Int32Array(1);
  plsiztmp[0] = PL_NSIZ;
  await bufoff(fd);
  await bwrite(fd, P(plsiztmp, 0), 4);
  await bwrite(fd, P(G.plname), plsiztmp[0] >>> 0);
  await bufon(fd);
  return;
}

async function save_msghistory(fd: number, mode: number): Promise<void> {
  let msg = null;
  let msgcount = 0;
  const msglen = new Int32Array(1);
  const minusone = new Int32Array(1);
  minusone[0] = -1;
  let init = TRUE;
  if (mode & (1 | 2)) {
    while (!!(msg = await G.windowprocs.win_getmsghistory(init))) {
      init = FALSE;
      msglen[0] = strlen(msg) | 0;
      if (msglen[0] < 1) {
        continue;
      }
      if (msglen[0] > BUFSZ - 1) {
        msglen[0] = BUFSZ - 1;
      }
      await bwrite(fd, P(msglen, 0), 4);
      await bwrite(fd, msg, msglen[0] >>> 0);
      ++msgcount;
    }
    await bwrite(fd, P(minusone, 0), 4);
  }
  do {
    if (await debugcore(S("save.c"), 1)) {
      await pline(S("Stored %d messages into savefile."), msgcount);
    }
  } while (0);
}

export async function store_savefileinfo(fd: number): Promise<void> {
  await bufoff(fd);
  await bwrite(fd, G.sfsaveinfo, 24);
  await bufon(fd);
  return;
}

export function set_savepref(suitename: Ptr | null): void {
  if (!strncmpi(suitename, S("externalcomp"), -1)) {
    saveprocs.name = S("externalcomp");
    saveprocs.save_bufon = def_bufon;
    saveprocs.save_bufoff = def_bufoff;
    saveprocs.save_bflush = def_bflush;
    saveprocs.save_bwrite = def_bwrite;
    saveprocs.save_bclose = def_bclose;
    G.sfsaveinfo.sfi1 = (G.sfsaveinfo.sfi1 | SFI1_EXTERNALCOMP) >>> 0;
    G.sfsaveinfo.sfi1 = (G.sfsaveinfo.sfi1 & ~SFI1_ZEROCOMP >>> 0) >>> 0;
  }
  if (!strncmpi(suitename, S("!rlecomp"), -1)) {
    G.sfsaveinfo.sfi1 = (G.sfsaveinfo.sfi1 & ~SFI1_RLECOMP >>> 0) >>> 0;
  }
}

export async function free_dungeons(): Promise<void> {
  await savelevchn(0, FREE_SAVE);
  await save_dungeon(0, FALSE, TRUE);
  return;
}

export async function freedynamicdata(): Promise<void> {
  free_maildata();
  unload_qtlist();
  free_menu_coloring();
  free_invbuf();
  free_youbuf();
  msgtype_free();
  await tmp_at(DISP_FREEMEM, 0);
  await dmonsfree();
  await savelev(-1, -1, 4);
  await save_killers(0, 4);
  await save_timers(0, 4, 1);
  await save_light_sources(0, 4, 1);
  await saveobjchn(0, G.invent, 4), G.invent = null;
  await saveobjchn(0, G.migrating_objs, 4), G.migrating_objs = null;
  await savemonchn(0, G.migrating_mons, 4), G.migrating_mons = null;
  await savemonchn(0, G.mydogs, 4), G.mydogs = null;
  await mon_animal_list(0);
  await save_oracles(0, 4);
  await savefruitchn(0, 4);
  await savenames(0, 4);
  await save_waterlevel(0, 4);
  await free_dungeons();
  if (G.iflags.wc_font_map) {
    free(G.iflags.wc_font_map), G.iflags.wc_font_map = null;
  }
  if (G.iflags.wc_font_message) {
    free(G.iflags.wc_font_message), G.iflags.wc_font_message = null;
  }
  if (G.iflags.wc_font_text) {
    free(G.iflags.wc_font_text), G.iflags.wc_font_text = null;
  }
  if (G.iflags.wc_font_menu) {
    free(G.iflags.wc_font_menu), G.iflags.wc_font_menu = null;
  }
  if (G.iflags.wc_font_status) {
    free(G.iflags.wc_font_status), G.iflags.wc_font_status = null;
  }
  if (G.iflags.wc_tile_file) {
    free(G.iflags.wc_tile_file), G.iflags.wc_tile_file = null;
  }
  free_autopickup_exceptions();
  free_symsets();
  if ((G.windowprocs.wincap2 & (8 | 128)) >>> 0 !== 0) {
    status_finish();
  }
  dumplogfreemessages();
  sysopt_release();
  return;
}

export function $init(): void {
  saveprocs = struct_save_procs.$of(S("externalcomp"), def_bufon, def_bufoff, def_bflush, def_bwrite, def_bclose);
  ustuck_id = new Uint32Array(1);
  ustuck_id[0] = 0;
  usteed_id = new Uint32Array(1);
  usteed_id[0] = 0;
  bw_fd = -1;
  bw_FILE = null;
  buffering = 0;
  savestateinlock$havestate = 1;
  savetrapchn$zerotrap = new struct_trap();
  savefruitchn$zerofruit = new struct_fruit();
}
