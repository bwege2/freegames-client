// @ts-nocheck
// NetHack 3.6.7 files.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { parse_status_hl1 } from './botl.ts';
import { parseautocomplete } from './cmd.ts';
import { dlb_fclose, dlb_fgets, dlb_fopen } from './dlb.ts';
import { clear_symsetentry, init_primary_symbols, init_rogue_symbols, switch_symbols, update_primary_symset, update_rogue_symset } from './drawing.ts';
import { In_quest, Is_special, maxledgerno } from './dungeon.ts';
import { build_english_list } from './end.ts';
import { inv_cnt } from './hack.ts';
import { copynchars, eos, fuzzymatch, getnow, hhmmss, mungspaces, pmatch, s_suffix, strip_newline, strncmpi, yyyymmdd } from './hacklib.ts';
import { addinv, merge_choice } from './invent.ts';
import { add_to_migration } from './mkobj.ts';
import { readobjnam } from './objnam.ts';
import { add_autopickup_exception, add_menu_coloring, assign_warnings, match_optname, match_sym, msgtype_parse_add, nh_getenv, parsebindings, parseoptions, parsesymbols, set_duplicate_opt_detection, sym_val } from './options.ts';
import { config_error_add, impossible, pline, raw_printf } from './pline.ts';
import { reset_restpref, validate } from './restore.ts';
import { rn2 } from './rnd.ts';
import { str2role } from './role.ts';
import { sysopt_seduce_set } from './sys.ts';
import { sethanguphandler } from './unixmain.ts';
import { regularize } from './unixunix.ts';
import { version_string } from './version.ts';
import { dump_fmtstr } from './windows.ts';
import { struct__config_error_frame, struct_d_level, struct_flock, struct_obj, struct_symsetentry } from './structs.ts';
import { $cs, $peq, $rd, $wr, G, P, R, S, access, atoi, close, creat, exit, fclose, fcntl, fgets, fopen, fprintf, free, getcwd, getenv, getuid, open, rename, signal, sleep, sprintf, strcat, strchr, strcmp, strcpy, strerror, strlen, strncpy, strrchr, strstr, unlink, write } from './rt/index.ts';
import { BONESPREFIX, BUFSZ, COIN_CLASS, ENOENT, EXIT_FAILURE, FALSE, FCMASK, F_SETLK, F_UNLCK, F_WRLCK, HACKPREFIX, H_UNK, LEVELPREFIX, LFILE_EXISTS, MIGR_NOBREAK, MIGR_NOSCATTER, MIGR_WITH_HERO, NHW_MENU, O_BINARY, O_CREAT, O_RDONLY, O_RDWR, PASSAGESCOPE, PATH_MAX, PL_NSIZ, PL_PSIZ, PRIMARY, ROGUESET, SAVEPREFIX, SCOREPREFIX, SECTIONSCOPE, SEEK_SET, SET_IN_SYS, SIGINT, SYM_BOULDER, SYM_CONTROL, SYM_OFF_X, SYSCONFPREFIX, TITLESCOPE, TROUBLEPREFIX, TRUE, WARNCOUNT, WIN_ERR, WIZKIT_MAX } from './consts.ts';

let wizkit: any;
let config_section_chosen: Ptr | null;
let config_section_current: Ptr | null;
let nesting: number;
let lockfd: number;
let config_error_data: struct__config_error_frame | null;
let symset_count: number;
let chosen_symset_start: number;
let chosen_symset_end: number;
let symset_which_set: number;
let fname_encode$hexdigits: any;
let fname_decode$hexdigits: any;

export function fname_encode(legal: Ptr | null, quotechar: number, s: Ptr | null, callerbuf: Ptr | null, bufsz: number): Ptr | null {
  let $t1: any;
  let sp = null;
  let op = null;
  let cnt = 0;
  sp = s;
  op = callerbuf;
  op.a[op.o] = 0;
  while (sp.a[sp.o]) {
    if (bufsz - cnt <= 4) {
      return callerbuf;
    }
    if (sp.a[sp.o] === quotechar) {
      sprintf(op, S("%c%02X"), quotechar, sp.a[sp.o]);
      op = op.add(3);
      cnt += 3;
    } else if (!!strchr(legal, sp.a[sp.o]) || !!strchr(P(fname_encode$hexdigits), sp.a[sp.o])) {
      $wr(($t1 = op, op = $t1.add(1), $t1), 0, sp.a[sp.o]);
      op.a[op.o] = 0;
      ++cnt;
    } else {
      sprintf(op, S("%c%02X"), quotechar, sp.a[sp.o]);
      op = op.add(3);
      cnt += 3;
    }
    sp = sp.add(1);
  }
  return callerbuf;
}

export function fname_decode(quotechar: number, s: Ptr | null, callerbuf: Ptr | null, bufsz: number): Ptr | null {
  let $t1: any, $t2: any, $t3: any;
  let sp = null;
  let op = null;
  let k = 0;
  let calc = 0;
  let cnt = 0;
  sp = s;
  op = callerbuf;
  op.a[op.o] = 0;
  calc = 0;
  while (sp.a[sp.o]) {
    if (bufsz - cnt <= 2) {
      return callerbuf;
    }
    if (sp.a[sp.o] === quotechar) {
      sp = sp.add(1);
      for (k = 0; k < 16; ++k) {
        if (sp.a[sp.o] === fname_decode$hexdigits[k]) {
          break;
        }
      }
      if (k >= 16) {
        return callerbuf;
      }
      calc = k << 4;
      sp = sp.add(1);
      for (k = 0; k < 16; ++k) {
        if (sp.a[sp.o] === fname_decode$hexdigits[k]) {
          break;
        }
      }
      if (k >= 16) {
        return callerbuf;
      }
      calc += k;
      sp = sp.add(1);
      $wr(($t1 = op, op = $t1.add(1), $t1), 0, calc << 24 >> 24);
      op.a[op.o] = 0;
    } else {
      $wr(($t2 = op, op = $t2.add(1), $t2), 0, $rd(($t3 = sp, sp = $t3.add(1), $t3)));
      op.a[op.o] = 0;
    }
    ++cnt;
  }
  return callerbuf;
}

export function fqname(basenam: Ptr | null, whichprefix: number, buffnum: number): Ptr | null {
  return basenam;
}

export function validate_prefix_locations(reasonbuf: Ptr | null): number {
  if (reasonbuf) {
    reasonbuf.a[reasonbuf.o] = 0;
  }
  return 1;
}

export function fopen_datafile(filename: Ptr | null, mode: Ptr | null, prefix: number): Ptr | null {
  let fp = null;
  filename = fqname(filename, prefix, prefix === TROUBLEPREFIX ? 3 : 0);
  fp = fopen(filename, mode);
  return fp;
}

export function set_levelfile_name(file: Ptr | null, lev: number): void {
  let tf = null;
  tf = strrchr(file, 46);
  if (!tf) {
    tf = eos(file);
  }
  sprintf(tf, S(".%d"), lev);
  return;
}

export function create_levelfile(lev: number, errbuf: Ptr | null): number {
  let $t1: any;
  let fd = 0;
  let fq_lock = null;
  if (errbuf) {
    errbuf.a[errbuf.o] = 0;
  }
  set_levelfile_name(P(G.lock), lev);
  fq_lock = fqname(P(G.lock), LEVELPREFIX, 0);
  fd = creat(fq_lock, FCMASK);
  if (fd >= 0) {
    ($t1 = G.level_info[lev], $t1.flags = ($t1.flags | LFILE_EXISTS) & 0xff);
  } else if (errbuf) {
    sprintf(errbuf, S("Cannot create file \"%s\" for level %d (errno %d)."), P(G.lock), lev, $rd(P(R, "errno")));
  }
  return fd;
}

export function open_levelfile(lev: number, errbuf: Ptr | null): number {
  let fd = 0;
  let fq_lock = null;
  if (errbuf) {
    errbuf.a[errbuf.o] = 0;
  }
  set_levelfile_name(P(G.lock), lev);
  fq_lock = fqname(P(G.lock), LEVELPREFIX, 0);
  fd = open(fq_lock, O_RDONLY | O_BINARY, 0);
  if (fd < 0 && errbuf) {
    sprintf(errbuf, S("Cannot open file \"%s\" for level %d (errno %d)."), P(G.lock), lev, $rd(P(R, "errno")));
  }
  return fd;
}

export function delete_levelfile(lev: number): void {
  let $t1: any;
  if (lev === 0 || G.level_info[lev].flags & LFILE_EXISTS) {
    set_levelfile_name(P(G.lock), lev);
    unlink(fqname(P(G.lock), LEVELPREFIX, 0));
    ($t1 = G.level_info[lev], $t1.flags = ($t1.flags & ~LFILE_EXISTS) & 0xff);
  }
}

export function clearlocks(): void {
  if (G.program_state.preserve_locks) {
    return;
  }
  {
    let x = 0;
    signal(SIGINT, 1);
    sethanguphandler(1);
    for (x = G.n_dgns ? maxledgerno() : 0; x >= 0; --x) {
      delete_levelfile(x);
    }
  }
}

export function nhclose(fd: number): number {
  return close(fd);
}

function set_bonesfile_name(file: Ptr | null, lev: struct_d_level | null): Ptr | null {
  let sptr = null;
  let dptr = null;
  strcpy(file, S("bon"));
  if (G.sysopt.bones_pools > 1) {
    let poolnum = G.sysopt.bones_pools >>> 0 < 10 ? G.sysopt.bones_pools >>> 0 : 10;
    poolnum = (G.ubirthday >>> 0) % poolnum;
    sprintf(eos(file), S("%u"), poolnum);
  }
  dptr = eos(file);
  sprintf(dptr, S("%c%s"), G.dungeons[lev.dnum].boneid, In_quest(lev) ? G.urole.filecode : S("0"));
  if (!!(sptr = Is_special(lev))) {
    sprintf(eos(dptr), S(".%c"), sptr.boneid);
  } else {
    sprintf(eos(dptr), S(".%d"), lev.dlevel);
  }
  return dptr;
}

function set_bonestemp_name(): Ptr | null {
  let tf = null;
  tf = strrchr(P(G.lock), 46);
  if (!tf) {
    tf = eos(P(G.lock));
  }
  sprintf(tf, S(".bn"));
  return P(G.lock);
}

export function create_bonesfile(lev: struct_d_level | null, bonesid: Ptr | null, errbuf: Ptr | null): number {
  let file = null;
  let fd = 0;
  if (errbuf) {
    errbuf.a[errbuf.o] = 0;
  }
  bonesid.a[bonesid.o] = set_bonesfile_name(P(G.bones), lev);
  file = set_bonestemp_name();
  file = fqname(file, BONESPREFIX, 0);
  fd = creat(file, FCMASK);
  if (fd < 0 && errbuf) {
    sprintf(errbuf, S("Cannot create bones \"%s\", id %s (errno %d)."), P(G.lock), bonesid.a[bonesid.o], $rd(P(R, "errno")));
  }
  return fd;
}

export async function commit_bonesfile(lev: struct_d_level | null): Promise<void> {
  let fq_bones = null;
  let tempname = null;
  let ret = 0;
  set_bonesfile_name(P(G.bones), lev);
  fq_bones = fqname(P(G.bones), BONESPREFIX, 0);
  tempname = set_bonestemp_name();
  tempname = fqname(tempname, BONESPREFIX, 1);
  ret = rename(tempname, fq_bones);
  if (G.flags.debug && ret !== 0) {
    await pline(S("couldn't rename %s to %s."), tempname, fq_bones);
  }
}

export function open_bonesfile(lev: struct_d_level | null, bonesid: Ptr | null): number {
  let fq_bones = null;
  let fd = 0;
  bonesid.a[bonesid.o] = set_bonesfile_name(P(G.bones), lev);
  fq_bones = fqname(P(G.bones), BONESPREFIX, 0);
  nh_uncompress(fq_bones);
  fd = open(fq_bones, O_RDONLY | O_BINARY, 0);
  return fd;
}

export function delete_bonesfile(lev: struct_d_level | null): number {
  set_bonesfile_name(P(G.bones), lev);
  return !(unlink(fqname(P(G.bones), BONESPREFIX, 0)) < 0) ? 1 : 0;
}

export function compress_bonesfile(): void {
  nh_compress(fqname(P(G.bones), BONESPREFIX, 0));
}

export function set_savefile_name(regularize_it: number): void {
  sprintf(P(G.SAVEF), S("save/%d%s"), getuid() | 0, P(G.plname));
  if (regularize_it) {
    regularize(P(G.SAVEF).add(5));
  }
}

export function save_savefile_name(fd: number): void {
  write(fd, P(G.SAVEF), 45);
}

export function set_error_savefile(): void {
  strcat(P(G.SAVEF), S(".e"));
}

export function create_savefile(): number {
  let fq_save = null;
  let fd = 0;
  fq_save = fqname(P(G.SAVEF), SAVEPREFIX, 0);
  fd = creat(fq_save, FCMASK);
  return fd;
}

export function open_savefile(): number {
  let fq_save = null;
  let fd = 0;
  fq_save = fqname(P(G.SAVEF), SAVEPREFIX, 0);
  fd = open(fq_save, O_RDONLY | O_BINARY, 0);
  return fd;
}

export function delete_savefile(): number {
  unlink(fqname(P(G.SAVEF), SAVEPREFIX, 0));
  return 0;
}

export async function restore_saved_game(): Promise<number> {
  let fq_save = null;
  let fd = 0;
  reset_restpref();
  set_savefile_name(TRUE);
  fq_save = fqname(P(G.SAVEF), SAVEPREFIX, 0);
  nh_uncompress(fq_save);
  if ((fd = open_savefile()) < 0) {
    return fd;
  }
  if (await validate(fd, fq_save) !== 0) {
    nhclose(fd), fd = -1;
    delete_savefile();
  }
  return fd;
}

export function get_saved_games(): Ptr | null {
  return null;
}

export function free_saved_games(saved: Ptr | null): void {
  if (saved) {
    let i = 0;
    while (saved.a[saved.o + i]) {
      free(saved.a[saved.o + i++]);
    }
    free(saved);
  }
}

export function nh_compress(filename: Ptr | null): void {
}

export function nh_uncompress(filename: Ptr | null): void {
}

export async function lock_file(filename: Ptr | null, whichprefix: number, retryct: number): Promise<number> {
  ++nesting;
  if (nesting > 1) {
    await impossible(S("TRIED TO NEST LOCKS"));
    return TRUE;
  }
  filename = fqname(filename, whichprefix, 0);
  lockfd = open(filename, O_RDWR);
  if (lockfd === -1) {
    if (!G.program_state.done_hup) {
      raw_printf(S("Cannot open file %s.  Is NetHack installed correctly?"), filename);
    }
    --nesting;
    return FALSE;
  }
  G.sflock.l_type = F_WRLCK;
  G.sflock.l_whence = SEEK_SET;
  G.sflock.l_start = 0;
  G.sflock.l_len = 0;
  while (fcntl(lockfd, F_SETLK, G.sflock) === -1) {
    if (retryct--) {
      if (!G.program_state.done_hup) {
        raw_printf(S("Waiting for release of fcntl lock on %s.  (%d retries left.)"), filename, retryct);
      }
      await sleep(1);
    } else {
      if (!G.program_state.done_hup) {
        G.windowprocs.win_raw_print(S("I give up.  Sorry."));
      }
      if (!G.program_state.done_hup) {
        raw_printf(S("Some other process has an unnatural grip on %s."), filename);
      }
      --nesting;
      return FALSE;
    }
  }
  return TRUE;
}

export function unlock_file(filename: Ptr | null): void {
  if (nesting === 1) {
    G.sflock.l_type = F_UNLCK;
    if (lockfd >= 0) {
      if (fcntl(lockfd, F_SETLK, G.sflock) === -1) {
        if (!G.program_state.done_hup) {
          raw_printf(S("Can't remove fcntl lock on %s."), filename);
        }
      }
      close(lockfd), lockfd = -1;
    }
  }
  --nesting;
}

function set_configfile_name(fname: Ptr | null): void {
  strncpy(P(G.configfile), fname, 256 - 1);
  G.configfile[256 - 1] = 0;
}

async function fopen_config_file(filename: Ptr | null, src: number): Promise<Ptr | null> {
  let fp = null;
  let tmp_config = new Int8Array(256);
  let envp = null;
  if (src === SET_IN_SYS) {
    if (filename && filename.a[filename.o]) {
      set_configfile_name(fqname(filename, SYSCONFPREFIX, 0));
      fp = fopen(P(G.configfile), S("r"));
    } else {
      fp = null;
    }
    return fp;
  }
  if (filename && filename.a[filename.o]) {
    set_configfile_name(filename);
    if (access(P(G.configfile), 4) === -1) {
      raw_printf(S("Access to %s denied (%d)."), P(G.configfile), $rd(P(R, "errno")));
      await G.windowprocs.win_wait_synch();
    } else if (!!(fp = fopen(P(G.configfile), S("r")))) {
      return fp;
    } else {
      raw_printf(S("Couldn't open requested config file %s (%d)."), P(G.configfile), $rd(P(R, "errno")));
      await G.windowprocs.win_wait_synch();
    }
  }
  envp = nh_getenv(S("HOME"));
  if (!envp) {
    strcpy(P(tmp_config), S(".nethackrc"));
  } else {
    sprintf(P(tmp_config), S("%s/%s"), envp, S(".nethackrc"));
  }
  set_configfile_name(P(tmp_config));
  if (!!(fp = fopen(P(G.configfile), S("r")))) {
    return fp;
  }
  if ($rd(P(R, "errno")) !== ENOENT) {
    let details = null;
    if (!(details = strerror($rd(P(R, "errno"))))) {
      details = S("");
    }
    raw_printf(S("Couldn't open default config file %s %s(%d)."), P(G.configfile), details, $rd(P(R, "errno")));
    await G.windowprocs.win_wait_synch();
  }
  return null;
}

async function get_uchars(bufp: Ptr | null, list: Ptr | null, modlist: number, size: number, name: Ptr | null): Promise<number> {
  let $g = 0;
  let num = 0;
  let count = 0;
  let havenum = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      num = 0;
      count = 0;
      havenum = FALSE;
    case 2:
      if (!1) { $g = 3; continue $L; }
      switch (bufp.a[bufp.o]) {
      case 32: { $g = 5; continue $L; }
      case 0: { $g = 6; continue $L; }
      case 9: { $g = 7; continue $L; }
      case 10: { $g = 8; continue $L; }
      case 48: { $g = 9; continue $L; }
      case 49: { $g = 10; continue $L; }
      case 50: { $g = 11; continue $L; }
      case 51: { $g = 12; continue $L; }
      case 52: { $g = 13; continue $L; }
      case 53: { $g = 14; continue $L; }
      case 54: { $g = 15; continue $L; }
      case 55: { $g = 16; continue $L; }
      case 56: { $g = 17; continue $L; }
      case 57: { $g = 18; continue $L; }
      case 92: { $g = 19; continue $L; }
      default: { $g = 20; continue $L; }
      }
    case 5:
    case 6:
    case 7:
    case 8:
      if (havenum) {
        if (num || !modlist) {
          list.a[list.o + count] = num & 0xff;
        }
        ++count;
        num = 0;
        havenum = FALSE;
      }
      if (count === size || !bufp.a[bufp.o]) {
        return count;
      }
      bufp = bufp.add(1);
      { $g = 4; continue $L; };
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
      havenum = TRUE;
      num = (num * 10 >>> 0) + (bufp.a[bufp.o] - 48 >>> 0) >>> 0;
      bufp = bufp.add(1);
      { $g = 4; continue $L; };
    case 19:
      { $g = 1; continue $L; }
      { $g = 4; continue $L; };
    case 20:
    case 1: // gi_error
      raw_printf(S("Syntax error in %s"), name);
      await G.windowprocs.win_wait_synch();
      return count;
    case 4:
      { $g = 2; continue $L; }
    case 3:
    }
    break;
  }
}

function choose_random_part(str: Ptr | null, sep: number): Ptr | null {
  let nsep = 1;
  let csep = 0;
  let len = 0;
  let begin = str;
  if (!str) {
    return null;
  }
  while (str.a[str.o]) {
    if (str.a[str.o] === sep) {
      ++nsep;
    }
    str = str.add(1);
  }
  csep = rn2(nsep);
  str = begin;
  while (csep > 0 && str.a[str.o]) {
    str = str.add(1);
    if (str.a[str.o] === sep) {
      --csep;
    }
  }
  if (str.a[str.o]) {
    if (str.a[str.o] === sep) {
      str = str.add(1);
    }
    begin = str;
    while (str.a[str.o] && str.a[str.o] !== sep) {
      str = str.add(1);
      ++len;
    }
    str.a[str.o] = 0;
    if (len) {
      return begin;
    }
  }
  return null;
}

function free_config_sections(): void {
  if (config_section_chosen) {
    free(config_section_chosen);
    config_section_chosen = null;
  }
  if (config_section_current) {
    free(config_section_current);
    config_section_current = null;
  }
}

function is_config_section(str: Ptr | null): number {
  let a = strrchr(str, 93);
  return (a && str.a[str.o] === 91 && $rd(a.add(1)) === 0 && (a.o - str.o | 0) > 0 ? 1 : 0) << 24 >> 24;
}

async function handle_config_section(buf: Ptr | null): Promise<number> {
  if (is_config_section(buf)) {
    let send = null;
    if (config_section_current) {
      free(config_section_current);
    }
    config_section_current = await dupstr(buf.add(1));
    send = strrchr(config_section_current, 93);
    send.a[send.o] = 0;
    do {
      if (await debugcore(S("files.c"), 1)) {
        await pline(S("set config section: '%s'"), config_section_current);
      }
    } while (0);
    return TRUE;
  }
  if (config_section_current) {
    if (!config_section_chosen) {
      return TRUE;
    }
    if (strcmp(config_section_current, config_section_chosen)) {
      return TRUE;
    }
  }
  return FALSE;
}

export function find_optparam(buf: Ptr | null): Ptr | null {
  let bufp = null;
  let altp = null;
  bufp = strchr(buf, 61);
  altp = strchr(buf, 58);
  if (!bufp || altp && altp.o < bufp.o) {
    bufp = altp;
  }
  return bufp;
}

export async function parse_config_line(origbuf: Ptr | null): Promise<number> {
  let n = 0;
  let src = G.iflags.parse_config_file_src;
  let bufp = null;
  let buf = new Int8Array(1024);
  let translate = new Uint8Array(96);
  let len = 0;
  let retval = TRUE;
  while (origbuf.a[origbuf.o] === 32 || origbuf.a[origbuf.o] === 9) {
    origbuf = origbuf.add(1);
  }
  strncpy(P(buf), origbuf, 1024 - 1);
  buf[1024 - 1] = 0;
  mungspaces(P(buf));
  bufp = find_optparam(P(buf));
  if (!bufp) {
    await config_error_add(S("Not a config statement, missing '='"));
    return FALSE;
  }
  bufp = bufp.add(1);
  if (bufp.a[bufp.o] === 32) {
    bufp = bufp.add(1);
  }
  if (match_optname(P(buf), S("OPTIONS"), 4, 1)) {
    bufp = find_optparam(origbuf);
    bufp = bufp.add(1);
    if (!await parseoptions(bufp, TRUE, TRUE)) {
      retval = FALSE;
    }
  } else if (match_optname(P(buf), S("AUTOPICKUP_EXCEPTION"), 5, 1)) {
    await add_autopickup_exception(bufp);
  } else if (match_optname(P(buf), S("BINDINGS"), 4, 1)) {
    if (!await parsebindings(bufp)) {
      retval = FALSE;
    }
  } else if (match_optname(P(buf), S("AUTOCOMPLETE"), 5, 1)) {
    await parseautocomplete(bufp, TRUE);
  } else if (match_optname(P(buf), S("MSGTYPE"), 7, 1)) {
    if (!await msgtype_parse_add(bufp)) {
      retval = FALSE;
    }
  } else if (match_optname(P(buf), S("NAME"), 4, 1)) {
    strncpy(P(G.plname), bufp, PL_NSIZ - 1);
  } else if (match_optname(P(buf), S("ROLE"), 4, 1) || match_optname(P(buf), S("CHARACTER"), 4, 1)) {
    if ((len = str2role(bufp)) >= 0) {
      G.flags.initrole = len;
    }
  } else if (match_optname(P(buf), S("DOGNAME"), 3, 1)) {
    strncpy(P(G.dogname), bufp, PL_PSIZ - 1);
  } else if (match_optname(P(buf), S("CATNAME"), 3, 1)) {
    strncpy(P(G.catname), bufp, PL_PSIZ - 1);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("WIZARDS"), 7, 1)) {
    if (G.sysopt.wizards) {
      free(G.sysopt.wizards);
    }
    G.sysopt.wizards = await dupstr(bufp);
    if (strlen(G.sysopt.wizards) && strcmp(G.sysopt.wizards, S("*"))) {
      if (G.sysopt.fmtd_wizard_list) {
        free(G.sysopt.fmtd_wizard_list);
      }
      G.sysopt.fmtd_wizard_list = await build_english_list(G.sysopt.wizards);
    }
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("SHELLERS"), 8, 1)) {
    if (G.sysopt.shellers) {
      free(G.sysopt.shellers);
    }
    G.sysopt.shellers = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("EXPLORERS"), 7, 1)) {
    if (G.sysopt.explorers) {
      free(G.sysopt.explorers);
    }
    G.sysopt.explorers = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("DEBUGFILES"), 5, 1)) {
    if (G.sysopt.env_dbgfl <= 0) {
      if (G.sysopt.debugfiles) {
        free(G.sysopt.debugfiles);
      }
      G.sysopt.debugfiles = await dupstr(bufp);
    }
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("DUMPLOGFILE"), 7, 1)) {
    if (G.sysopt.dumplogfile) {
      free(G.sysopt.dumplogfile);
    }
    G.sysopt.dumplogfile = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("GENERICUSERS"), 12, 1)) {
    if (G.sysopt.genericusers) {
      free(G.sysopt.genericusers);
    }
    G.sysopt.genericusers = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("BONES_POOLS"), 10, 1)) {
    n = atoi(bufp);
    G.sysopt.bones_pools = n <= 0 ? 0 : n < 10 ? n : 10;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("SUPPORT"), 7, 1)) {
    if (G.sysopt.support) {
      free(G.sysopt.support);
    }
    G.sysopt.support = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("RECOVER"), 7, 1)) {
    if (G.sysopt.recover) {
      free(G.sysopt.recover);
    }
    G.sysopt.recover = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("CHECK_SAVE_UID"), 14, 1)) {
    n = atoi(bufp);
    G.sysopt.check_save_uid = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("CHECK_PLNAME"), 12, 1)) {
    n = atoi(bufp);
    G.sysopt.check_plname = n;
  } else if (match_optname(P(buf), S("SEDUCE"), 6, 1)) {
    n = !!atoi(bufp) ? 1 : 0;
    if (src !== SET_IN_SYS && n !== 0) {
      await config_error_add(S("Illegal value in SEDUCE"));
      return FALSE;
    }
    G.sysopt.seduce = n;
    sysopt_seduce_set(G.sysopt.seduce);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("MAXPLAYERS"), 10, 1)) {
    n = atoi(bufp);
    if (n < 0 || n > 25) {
      await config_error_add(S("Illegal value in MAXPLAYERS (maximum is 25)."));
      return FALSE;
    }
    G.sysopt.maxplayers = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("PERSMAX"), 7, 1)) {
    n = atoi(bufp);
    if (n < 1) {
      await config_error_add(S("Illegal value in PERSMAX (minimum is 1)."));
      return FALSE;
    }
    G.sysopt.persmax = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("PERS_IS_UID"), 11, 1)) {
    n = atoi(bufp);
    if (n !== 0 && n !== 1) {
      await config_error_add(S("Illegal value in PERS_IS_UID (must be 0 or 1)."));
      return FALSE;
    }
    G.sysopt.pers_is_uid = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("ENTRYMAX"), 8, 1)) {
    n = atoi(bufp);
    if (n < 10) {
      await config_error_add(S("Illegal value in ENTRYMAX (minimum is 10)."));
      return FALSE;
    }
    G.sysopt.entrymax = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("POINTSMIN"), 9, 1)) {
    n = atoi(bufp);
    if (n < 1) {
      await config_error_add(S("Illegal value in POINTSMIN (minimum is 1)."));
      return FALSE;
    }
    G.sysopt.pointsmin = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("MAX_STATUENAME_RANK"), 10, 1)) {
    n = atoi(bufp);
    if (n < 1) {
      await config_error_add(S("Illegal value in MAX_STATUENAME_RANK (minimum is 1)."));
      return FALSE;
    }
    G.sysopt.tt_oname_maxrank = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("PANICTRACE_LIBC"), 15, 1)) {
    n = atoi(bufp);
    G.sysopt.panictrace_libc = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("PANICTRACE_GDB"), 14, 1)) {
    n = atoi(bufp);
    G.sysopt.panictrace_gdb = n;
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("GDBPATH"), 7, 1)) {
    if (G.sysopt.gdbpath) {
      free(G.sysopt.gdbpath);
    }
    G.sysopt.gdbpath = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("GREPPATH"), 7, 1)) {
    if (G.sysopt.greppath) {
      free(G.sysopt.greppath);
    }
    G.sysopt.greppath = await dupstr(bufp);
  } else if (src === SET_IN_SYS && match_optname(P(buf), S("ACCESSIBILITY"), 13, 1)) {
    n = atoi(bufp);
    if (n < 0 || n > 1) {
      await config_error_add(S("Illegal value in ACCESSIBILITY (not 0,1)."));
      return FALSE;
    }
    G.sysopt.accessibility = n;
  } else if (match_optname(P(buf), S("BOULDER"), 3, 1)) {
    await get_uchars(bufp, P(G.ov_primary_syms, SYM_BOULDER + SYM_OFF_X), TRUE, 1, S("BOULDER"));
  } else if (match_optname(P(buf), S("MENUCOLOR"), 9, 1)) {
    if (!await add_menu_coloring(bufp)) {
      retval = FALSE;
    }
  } else if (match_optname(P(buf), S("HILITE_STATUS"), 6, 1)) {
    if (!await parse_status_hl1(bufp, TRUE)) {
      retval = FALSE;
    }
  } else if (match_optname(P(buf), S("WARNINGS"), 5, 1)) {
    await get_uchars(bufp, P(translate), FALSE, WARNCOUNT, S("WARNINGS"));
    assign_warnings(P(translate));
  } else if (match_optname(P(buf), S("ROGUESYMBOLS"), 4, 1)) {
    if (!parsesymbols(bufp, ROGUESET)) {
      await config_error_add(S("Error in ROGUESYMBOLS definition '%s'"), bufp);
      retval = FALSE;
    }
    await switch_symbols(TRUE);
  } else if (match_optname(P(buf), S("SYMBOLS"), 4, 1)) {
    if (!parsesymbols(bufp, PRIMARY)) {
      await config_error_add(S("Error in SYMBOLS definition '%s'"), bufp);
      retval = FALSE;
    }
    await switch_symbols(TRUE);
  } else if (match_optname(P(buf), S("WIZKIT"), 6, 1)) {
    strncpy(P(wizkit), bufp, WIZKIT_MAX - 1);
  } else if (match_optname(P(buf), S("QT_TILEWIDTH"), 12, 1)) {
  } else if (match_optname(P(buf), S("QT_TILEHEIGHT"), 13, 1)) {
  } else if (match_optname(P(buf), S("QT_FONTSIZE"), 11, 1)) {
  } else if (match_optname(P(buf), S("QT_COMPACT"), 10, 1)) {
  } else {
    await config_error_add(S("Unknown config statement"));
    return FALSE;
  }
  return retval;
}

export async function config_error_init(from_file: number, sourcename: Ptr | null, secure: number): Promise<void> {
  let tmp = new struct__config_error_frame();
  tmp.line_num = 0;
  tmp.num_errors = 0;
  tmp.origline_shown = FALSE;
  tmp.fromfile = from_file;
  tmp.secure = secure;
  tmp.origline[0] = 0;
  if (sourcename && sourcename.a[sourcename.o]) {
    strncpy(P(tmp.source), sourcename, 256 - 1);
    tmp.source[256 - 1] = 0;
  } else {
    tmp.source[0] = 0;
  }
  tmp.next = config_error_data;
  config_error_data = tmp;
}

function config_error_nextline(line: Ptr | null): number {
  let ced = config_error_data;
  if (!ced) {
    return FALSE;
  }
  if (ced.num_errors && ced.secure) {
    return FALSE;
  }
  ++ced.line_num;
  ced.origline_shown = FALSE;
  if (line && line.a[line.o]) {
    strncpy(P(ced.origline), line, 1024 - 1);
    ced.origline[1024 - 1] = 0;
  } else {
    ced.origline[0] = 0;
  }
  return TRUE;
}

export async function config_erradd(buf: Ptr | null): Promise<void> {
  let lineno = new Int8Array(128);
  if (!buf || !buf.a[buf.o]) {
    buf = S("Unknown error");
  }
  if (!config_error_data) {
    await pline(S("%s%s."), !G.iflags.window_inited ? S("config_error_add: ") : S(""), buf);
    await G.windowprocs.win_wait_synch();
    return;
  }
  ++config_error_data.num_errors;
  if (!config_error_data.origline_shown && !config_error_data.secure) {
    await pline(S("\n%s"), P(config_error_data.origline));
    config_error_data.origline_shown = TRUE;
  }
  if (config_error_data.line_num > 0 && !config_error_data.secure) {
    sprintf(P(lineno), S("Line %d: "), config_error_data.line_num);
  } else {
    lineno[0] = 0;
  }
  await pline(S("%s %s%s."), config_error_data.secure ? S("Error:") : S(" *"), P(lineno), buf);
}

export async function config_error_done(): Promise<number> {
  let n = 0;
  let tmp = config_error_data;
  if (!config_error_data) {
    return 0;
  }
  n = config_error_data.num_errors;
  if (n) {
    await pline(S("\n%d error%s in %s.\n"), n, n > 1 ? S("s") : S(""), $rd(P(config_error_data.source)) ? P(config_error_data.source) : P(G.configfile));
    await G.windowprocs.win_wait_synch();
  }
  config_error_data = tmp.next;
  free(tmp);
  return n;
}

export async function read_config_file(filename: Ptr | null, src: number): Promise<number> {
  let fp = null;
  let rv = TRUE;
  if (!(fp = await fopen_config_file(filename, src))) {
    return FALSE;
  }
  await set_duplicate_opt_detection(1);
  free_config_sections();
  G.iflags.parse_config_file_src = src;
  rv = await parse_conf_file(fp, parse_config_line);
  fclose(fp);
  free_config_sections();
  await set_duplicate_opt_detection(0);
  return rv;
}

async function fopen_wizkit_file(): Promise<Ptr | null> {
  let fp = null;
  let tmp_wizkit = new Int8Array(256);
  let envp = null;
  envp = nh_getenv(S("WIZKIT"));
  if (envp && envp.a[envp.o]) {
    strncpy(P(wizkit), envp, WIZKIT_MAX - 1);
  }
  if (!wizkit[0]) {
    return null;
  }
  if (access(P(wizkit), 4) === -1) {
    raw_printf(S("Access to %s denied (%d)."), P(wizkit), $rd(P(R, "errno")));
    await G.windowprocs.win_wait_synch();
  } else if (!!(fp = fopen(P(wizkit), S("r")))) {
    return fp;
  } else {
    raw_printf(S("Couldn't open requested config file %s (%d)."), P(wizkit), $rd(P(R, "errno")));
    await G.windowprocs.win_wait_synch();
  }
  envp = nh_getenv(S("HOME"));
  if (envp) {
    sprintf(P(tmp_wizkit), S("%s/%s"), envp, P(wizkit));
  } else {
    strcpy(P(tmp_wizkit), P(wizkit));
  }
  if (!!(fp = fopen(P(tmp_wizkit), S("r")))) {
    return fp;
  } else if ($rd(P(R, "errno")) !== ENOENT) {
    raw_printf(S("Couldn't open default wizkit file %s (%d)."), P(tmp_wizkit), $rd(P(R, "errno")));
    await G.windowprocs.win_wait_synch();
  }
  return null;
}

async function wizkit_addinv(obj: struct_obj | null): Promise<void> {
  if (!obj || obj === G.zeroobj) {
    return;
  }
  obj.dknown = 1;
  if (G.urole.malenum === 335) {
    obj.bknown = 1;
  }
  if (obj.oclass !== COIN_CLASS && inv_cnt(FALSE) >= 52 && !await merge_choice(G.invent, obj)) {
    await add_to_migration(obj);
    obj.ox = 0;
    obj.oy = 1;
    obj.owornmask = MIGR_WITH_HERO | MIGR_NOBREAK | MIGR_NOSCATTER;
  } else {
    await addinv(obj);
  }
}

export async function proc_wizkit_line(buf: Ptr | null): Promise<number> {
  let otmp = null;
  if (strlen(buf) >= BUFSZ) {
    buf.a[buf.o + (BUFSZ - 1)] = 0;
  }
  otmp = await readobjnam(buf, null);
  if (otmp) {
    if (otmp !== G.zeroobj) {
      await wizkit_addinv(otmp);
    }
  } else {
    await config_error_add(S("Bad wizkit item: \"%.60s\""), buf);
    return FALSE;
  }
  return TRUE;
}

export async function read_wizkit(): Promise<void> {
  let fp = null;
  if (!G.flags.debug || !(fp = await fopen_wizkit_file())) {
    return;
  }
  G.program_state.wizkit_wishing = 1;
  await config_error_init(TRUE, S("WIZKIT"), FALSE);
  await parse_conf_file(fp, proc_wizkit_line);
  fclose(fp);
  await config_error_done();
  G.program_state.wizkit_wishing = 0;
  return;
}

async function parse_conf_file(fp: Ptr | null, proc: Function | null): Promise<number> {
  let $t1: any;
  let inbuf = new Int8Array(1024);
  let rv = TRUE;
  let ep = null;
  let skip = FALSE;
  let morelines = FALSE;
  let buf = null;
  let inbufsz = 1024;
  free_config_sections();
  while (fgets(P(inbuf), inbufsz | 0, fp)) {
    ep = strchr(P(inbuf), 10);
    if (skip) {
      if (ep) {
        skip = FALSE;
      }
    } else {
      if (!ep) {
        if (strlen(P(inbuf)) < inbufsz - 2) {
          ep = eos(P(inbuf));
        } else {
          await config_error_add(S("Line too long, skipping"));
          skip = TRUE;
        }
      } else {
        ep.a[ep.o] = 0;
      }
      if (ep) {
        let tmpbuf = null;
        let len = 0;
        let ignoreline = FALSE;
        let oldline = FALSE;
        morelines = ((ep = ep.add(-1)).o >= P(inbuf).o && ep.a[ep.o] === 92 ? 1 : 0) << 24 >> 24;
        if (morelines) {
          ep.a[ep.o] = 0;
        }
        while (ep.o >= P(inbuf).o && (ep.a[ep.o] === 32 || ep.a[ep.o] === 9 || ep.a[ep.o] === 13)) {
          $wr(($t1 = ep, ep = $t1.add(-1), $t1), 0, 0);
        }
        if (!config_error_nextline(P(inbuf))) {
          rv = FALSE;
          if (buf) {
            free(buf), buf = null;
          }
          break;
        }
        ep = P(inbuf);
        while (ep.a[ep.o] === 32 || ep.a[ep.o] === 9) {
          ep = ep.add(1);
        }
        if (!ep.a[ep.o] || ep.a[ep.o] === 35) {
          ignoreline = TRUE;
        }
        if (buf) {
          oldline = TRUE;
        }
        if (!ignoreline) {
          len = (strlen(ep) | 0) + 1;
          if (buf) {
            len += (strlen(buf) | 0) + 1;
          }
          tmpbuf = P(new Int8Array((len >>> 0)));
          tmpbuf.a[tmpbuf.o] = 0;
          if (buf) {
            strcat(strcpy(tmpbuf, buf), S(" "));
            free(buf);
          }
          buf = strcat(tmpbuf, ep);
          if (strlen(buf) >= 1024) {
            buf.a[buf.o + (1024 - 1)] = 0;
          }
        }
        if (morelines || ignoreline && !oldline) {
          continue;
        }
        if (await handle_config_section(buf)) {
          free(buf);
          buf = null;
          continue;
        }
        if (match_optname(buf, S("CHOOSE"), 6, 1)) {
          let section = null;
          let bufp = find_optparam(buf);
          if (!bufp) {
            await config_error_add(S("Format is CHOOSE=section1,section2,..."));
            rv = FALSE;
            free(buf);
            buf = null;
            continue;
          }
          bufp = bufp.add(1);
          if (config_section_chosen) {
            free(config_section_chosen), config_section_chosen = null;
          }
          section = choose_random_part(bufp, 44);
          if (section) {
            config_section_chosen = await dupstr(section);
          } else {
            await config_error_add(S("No config section to choose"));
            rv = FALSE;
          }
          free(buf);
          buf = null;
          continue;
        }
        if (!await proc(buf)) {
          rv = FALSE;
        }
        free(buf);
        buf = null;
      }
    }
  }
  if (buf) {
    free(buf);
  }
  free_config_sections();
  return rv;
}

function fopen_sym_file(): Ptr | null {
  let fp = null;
  fp = fopen_datafile(S("symbols"), S("r"), HACKPREFIX);
  return fp;
}

export async function read_sym_file(which_set: number): Promise<number> {
  let fp = null;
  G.symset[which_set].explicitly = (FALSE) & 1;
  if (!(fp = fopen_sym_file())) {
    return 0;
  }
  G.symset[which_set].explicitly = (TRUE) & 1;
  symset_count = 0;
  chosen_symset_start = chosen_symset_end = FALSE;
  symset_which_set = which_set;
  await config_error_init(TRUE, S("symbols"), FALSE);
  await parse_conf_file(fp, proc_symset_line);
  fclose(fp);
  if (!chosen_symset_start && !chosen_symset_end) {
    if (G.symset[which_set].name && (fuzzymatch(G.symset[which_set].name, S("Default symbols"), S(" -_"), TRUE) || !strncmpi(G.symset[which_set].name, S("default"), -1))) {
      clear_symsetentry(which_set, TRUE);
    }
    await config_error_done();
    if (G.symset[which_set].name) {
      G.symset[which_set].explicitly = (FALSE) & 1;
      return 0;
    }
    return 1;
  }
  if (!chosen_symset_end) {
    await config_error_add(S("Missing finish for symset \"%s\""), G.symset[which_set].name ? G.symset[which_set].name : S("unknown"));
  }
  await config_error_done();
  return 1;
}

export async function proc_symset_line(buf: Ptr | null): Promise<number> {
  return (!(await parse_sym_line(buf, symset_which_set) << 24 >> 24) ? 1 : 0) << 24 >> 24;
}

export async function parse_sym_line(buf: Ptr | null, which_set: number): Promise<number> {
  let val = 0;
  let i = 0;
  let symp = null;
  let bufp = null;
  let commentp = null;
  let altp = null;
  if (strlen(buf) >= BUFSZ) {
    buf.a[buf.o + (BUFSZ - 1)] = 0;
  }
  mungspaces(buf);
  if (!!(commentp = strrchr(buf, 35)) && commentp.a[commentp.o + -1] === 32) {
    commentp.a[commentp.o + -1] = 0;
  }
  bufp = strchr(buf, 61);
  altp = strchr(buf, 58);
  if (!bufp || altp && altp.o < bufp.o) {
    bufp = altp;
  }
  if (!bufp) {
    if (strncmpi(buf, S("finish"), 6) === 0) {
      if (chosen_symset_start) {
        chosen_symset_end = TRUE;
      }
      chosen_symset_start = FALSE;
      return 1;
    }
    await config_error_add(S("No \"finish\""));
    return 0;
  }
  bufp = bufp.add(1);
  if (bufp.a[bufp.o] === 32) {
    bufp = bufp.add(1);
  }
  symp = match_sym(buf);
  if (!symp) {
    await config_error_add(S("Unknown sym keyword"));
    return 0;
  }
  if (!G.symset[which_set].name) {
    if (symp.range === SYM_CONTROL) {
      let tmpsp = null;
      let lastsp = null;
      for (lastsp = G.symset_list; lastsp; lastsp = lastsp.next) {
        if (!lastsp.next) {
          break;
        }
      }
      switch (symp.idx) {
      case 0:
        tmpsp = new struct_symsetentry();
        tmpsp.next = null;
        if (!lastsp) {
          G.symset_list = tmpsp;
        } else {
          lastsp.next = tmpsp;
        }
        tmpsp.idx = symset_count++;
        tmpsp.name = await dupstr(bufp);
        tmpsp.desc = null;
        tmpsp.handling = H_UNK;
        tmpsp.nocolor = 0;
        tmpsp.primary = 0;
        tmpsp.rogue = 0;
        break;
      case 2:
        tmpsp = lastsp;
        for (i = 0; G.known_handling[i]; ++i) {
          if (!strncmpi(G.known_handling[i], bufp, -1)) {
            tmpsp.handling = i;
            break;
          }
        }
        break;
      case 3:
        tmpsp = lastsp;
        if (tmpsp && !tmpsp.desc) {
          tmpsp.desc = await dupstr(bufp);
        }
        break;
      case 5:
        tmpsp = lastsp;
        for (i = 0; G.known_restrictions[i]; ++i) {
          if (!strncmpi(G.known_restrictions[i], bufp, -1)) {
            switch (i) {
            case 0:
              tmpsp.primary = 1;
              break;
            case 1:
              tmpsp.rogue = 1;
              break;
            }
            break;
          }
        }
        break;
      }
    }
    return 1;
  }
  if (symp.range) {
    if (symp.range === SYM_CONTROL) {
      switch (symp.idx) {
      case 0:
        if (!strncmpi(bufp, G.symset[which_set].name, -1)) {
          chosen_symset_start = TRUE;
          if (which_set === ROGUESET) {
            init_rogue_symbols();
          } else if (which_set === PRIMARY) {
            init_primary_symbols();
          }
        }
        break;
      case 1:
        if (chosen_symset_start) {
          chosen_symset_end = TRUE;
        }
        chosen_symset_start = FALSE;
        break;
      case 2:
        if (chosen_symset_start) {
          set_symhandling(bufp, which_set);
        }
        break;
      case 4:
        if (chosen_symset_start) {
          if (bufp) {
            if (!strncmpi(bufp, S("true"), -1) || !strncmpi(bufp, S("yes"), -1) || !strncmpi(bufp, S("on"), -1)) {
              G.symset[which_set].nocolor = 0;
            } else if (!strncmpi(bufp, S("false"), -1) || !strncmpi(bufp, S("no"), -1) || !strncmpi(bufp, S("off"), -1)) {
              G.symset[which_set].nocolor = 1;
            }
          }
        }
        break;
      case 5:
        if (chosen_symset_start) {
          let n = 0;
          while (G.known_restrictions[n]) {
            if (!strncmpi(G.known_restrictions[n], bufp, -1)) {
              switch (n) {
              case 0:
                G.symset[which_set].primary = 1;
                break;
              case 1:
                G.symset[which_set].rogue = 1;
                break;
              }
              break;
            }
            ++n;
          }
        }
        break;
      }
    } else {
      val = sym_val(bufp);
      if (chosen_symset_start) {
        if (which_set === PRIMARY) {
          update_primary_symset(symp, val);
        } else if (which_set === ROGUESET) {
          update_rogue_symset(symp, val);
        }
      }
    }
  }
  return 1;
}

function set_symhandling(handling: Ptr | null, which_set: number): void {
  let i = 0;
  G.symset[which_set].handling = H_UNK;
  while (G.known_handling[i]) {
    if (!strncmpi(G.known_handling[i], handling, -1)) {
      G.symset[which_set].handling = i;
      return;
    }
    ++i;
  }
}

export async function check_recordfile(dir: Ptr | null): Promise<void> {
  let fq_record = null;
  let fd = 0;
  fq_record = fqname(S("record"), SCOREPREFIX, 0);
  fd = open(fq_record, O_RDWR, 0);
  if (fd >= 0) {
    nhclose(fd);
  } else if ((fd = open(fq_record, O_CREAT | O_RDWR, FCMASK)) >= 0) {
    nhclose(fd);
  } else {
    raw_printf(S("Warning: cannot write scoreboard file '%s'"), fq_record);
    await G.windowprocs.win_wait_synch();
  }
}

export function paniclog(type: Ptr | null, reason: Ptr | null): void {
  let lfile = null;
  let buf = new Int8Array(256);
  if (!G.program_state.in_paniclog) {
    G.program_state.in_paniclog = 1;
    lfile = fopen_datafile(S("paniclog"), S("a"), TROUBLEPREFIX);
    if (lfile) {
      let now = getnow();
      let uid = getuid() | 0;
      let playmode = (G.flags.debug ? 68 : G.flags.explore ? 88 : 45) << 24 >> 24;
      fprintf(lfile, S("%s %08ld %06ld %d %c: %s %s\n"), version_string(P(buf)), yyyymmdd(now), hhmmss(now), uid, playmode, type, reason);
      fclose(lfile);
    }
    G.program_state.in_paniclog = 0;
  }
  return;
}

export function testinglog(filenm: Ptr | null, type: Ptr | null, reason: Ptr | null): void {
  let lfile = null;
  let fnbuf = new Int8Array(256);
  if (!filenm) {
    return;
  }
  strcpy(P(fnbuf), filenm);
  if (!strchr(P(fnbuf), 46)) {
    strcat(P(fnbuf), S(".log"));
  }
  lfile = fopen_datafile(P(fnbuf), S("a"), TROUBLEPREFIX);
  if (lfile) {
    fprintf(lfile, S("%s\n%s\n"), type, reason);
    fclose(lfile);
  }
  return;
}

export function assure_syscf_file(): void {
  let fd = 0;
  fd = open(S("sysconf"), O_RDONLY);
  if (fd >= 0) {
    close(fd);
    return;
  }
  raw_printf(S("Unable to open SYSCF_FILE.\n"));
  exit(EXIT_FAILURE);
}

export async function debugcore(filename: Ptr | null, wildcards: number): Promise<number> {
  let debugfiles = null;
  let p = null;
  if (!filename || !filename.a[filename.o]) {
    return FALSE;
  }
  if (G.sysopt.env_dbgfl === 0) {
    if (!!(p = getenv(S("DEBUGFILES")))) {
      if (G.sysopt.debugfiles) {
        free(G.sysopt.debugfiles);
      }
      G.sysopt.debugfiles = await dupstr(p);
      G.sysopt.env_dbgfl = 1;
    } else {
      G.sysopt.env_dbgfl = -1;
    }
  }
  debugfiles = G.sysopt.debugfiles;
  if (!debugfiles || !debugfiles.a[debugfiles.o]) {
    return FALSE;
  }
  if (!!(p = strrchr(filename, 47))) {
    filename = p.add(1);
  }
  if (wildcards && pmatch(debugfiles, filename)) {
    return TRUE;
  }
  if (!!(p = strstr(debugfiles, filename))) {
    let l = strlen(filename) | 0;
    if (($peq(p, debugfiles) || p.a[p.o + -1] === 32 || p.a[p.o + -1] === 47) && (p.a[p.o + l] === 32 || p.a[p.o + l] === 0)) {
      return TRUE;
    }
  }
  return FALSE;
}

export function reveal_paths(): void {
  let fqn = null;
  let nodumpreason = null;
  let buf = new Int8Array(256);
  let filep = null;
  let gamename = G.hname && G.hname.a[G.hname.o] ? G.hname : S("NetHack");
  let endp = null;
  let envp = null;
  let cwdbuf = new Int8Array(4096);
  buf[0] = 0;
  raw_printf(S("%s system configuration file%s:"), s_suffix(gamename), P(buf));
  filep = S("sysconf");
  fqn = fqname(filep, SYSCONFPREFIX, 0);
  if (fqn) {
    set_configfile_name(fqn);
    filep = P(G.configfile);
  }
  raw_printf(S("    \"%s\""), filep);
  buf[0] = 0;
  envp = getcwd(P(cwdbuf), PATH_MAX);
  if (envp) {
    G.windowprocs.win_raw_print(S("The loadable symbols file:"));
    raw_printf(S("    \"%s/%s\""), envp, S("symbols"));
  }
  buf[0] = 0;
  raw_printf(S("Basic data files%s are collected inside:"), P(buf));
  filep = S("nhdat");
  raw_printf(S("    \"%s\""), filep);
  nodumpreason = S("disabled");
  fqn = G.sysopt.dumplogfile;
  if (fqn && fqn.a[fqn.o]) {
    G.windowprocs.win_raw_print(S("Your end-of-game disclosure file:"));
    dump_fmtstr(fqn, P(buf), FALSE);
    buf[256 - 7] = 0;
    raw_printf(S("    \"%s\""), P(buf));
  } else {
    raw_printf(S("No end-of-game disclosure file (%s)."), nodumpreason);
  }
  buf[0] = 0;
  raw_printf(S("Your personal configuration file%s:"), P(buf));
  buf[0] = 0;
  if (!!(envp = nh_getenv(S("HOME")))) {
    copynchars(P(buf), envp, 256 - 1 - 1);
    strcat(P(buf), S("/"));
  }
  endp = eos(P(buf));
  copynchars(endp, G.default_configfile, 256 - 1 - strlen(P(buf)) | 0);
  raw_printf(S("    \"%s\""), P(buf));
  G.windowprocs.win_raw_print(S(""));
}

function choose_passage(passagecnt: number, oid: number): number {
  let idx = 0;
  let res = 0;
  if (passagecnt < 1) {
    return 0;
  }
  if (oid !== G.context.novel.id || G.context.novel.count === 0) {
    let i = 0;
    let range = passagecnt;
    let limit = Math.trunc(30 / 1) | 0;
    G.context.novel.id = oid;
    if (range <= limit) {
      G.context.novel.count = passagecnt;
      for (idx = 0; idx < (Math.trunc(30 / 1) | 0); ++idx) {
        G.context.novel.pasg[idx] = (idx < passagecnt ? idx + 1 : 0) << 24 >> 24;
      }
    } else {
      G.context.novel.count = Math.trunc(30 / 1) | 0;
      for (idx = i = 0; i < passagecnt; ++i, --range) {
        if (range > 0 && rn2(range) < limit) {
          G.context.novel.pasg[idx++] = i + 1 << 24 >> 24;
          --limit;
        }
      }
    }
  }
  idx = rn2(G.context.novel.count);
  res = G.context.novel.pasg[idx];
  G.context.novel.pasg[idx] = G.context.novel.pasg[--G.context.novel.count];
  return res;
}

export async function read_tribute(tribsection: Ptr | null, tribtitle: Ptr | null, tribpassage: number, nowin_buf: Ptr | null, bufsz: number, oid: number): Promise<number> {
  let $t1: any;
  let $g = 0;
  let fp = null;
  let line = new Int8Array(256);
  let lastline = new Int8Array(256);
  let scope = 0;
  let linect = 0;
  let passagecnt = 0;
  let targetpassage = 0;
  let badtranslation = null;
  let matchedsection = 0;
  let matchedtitle = 0;
  let tribwin = 0;
  let grasped = 0;
  let foundpassage = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      line = new Int8Array(256);
      lastline = new Int8Array(256);
      scope = 0;
      linect = 0;
      passagecnt = 0;
      targetpassage = 0;
      badtranslation = S("an incomprehensible foreign translation");
      matchedsection = FALSE;
      matchedtitle = FALSE;
      tribwin = WIN_ERR;
      grasped = FALSE;
      foundpassage = FALSE;
      if (nowin_buf) {
        nowin_buf.a[nowin_buf.o] = 0;
      }
      if (!tribsection || !tribtitle) {
        if (!nowin_buf) {
          await pline(S("It's %s of \"%s\"!"), badtranslation, tribtitle);
        }
        return grasped;
      }
      do {
        if (await debugcore(S("files.c"), 1)) {
          await pline(S("read_tribute %s, %s, %d."), tribsection, tribtitle, tribpassage);
        }
      } while (0);
      fp = await dlb_fopen(S("tribute"), S("r"));
      if (!fp) {
        if (!nowin_buf) {
          await pline(S("You feel too overwhelmed to continue!"));
        }
        return grasped;
      }
      $wr(P(line), 0, $wr(P(lastline), 0, 0));
      while (!!dlb_fgets(P(line), 256, fp)) {
        ++linect;
        strip_newline(P(line));
        switch (line[0]) {
        case 37:
          if (!strncmpi(P(line, 1), S("section "), 9 - 1)) {
            let st = P(line, 9);
            scope = SECTIONSCOPE;
            matchedsection = (!strncmpi(st, tribsection, -1) ? TRUE : FALSE) << 24 >> 24;
          } else if (!strncmpi(P(line, 1), S("title "), 7 - 1)) {
            let st = P(line, 7);
            let p1 = null;
            let p2 = null;
            if (!!(p1 = strchr(st, 40))) {
              $wr(($t1 = p1, p1 = $t1.add(1), $t1), 0, 0);
              mungspaces(st);
              if (!!(p2 = strchr(p1, 41))) {
                p2.a[p2.o] = 0;
                passagecnt = atoi(p1);
                scope = TITLESCOPE;
                if (matchedsection && !strncmpi(st, tribtitle, -1)) {
                  matchedtitle = TRUE;
                  targetpassage = !tribpassage ? choose_passage(passagecnt, oid) : tribpassage <= passagecnt ? tribpassage : 0;
                } else {
                  matchedtitle = FALSE;
                }
              }
            }
          } else if (!strncmpi(P(line, 1), S("passage "), 9 - 1)) {
            let passagenum = 0;
            let st = P(line, 9);
            mungspaces(st);
            passagenum = atoi(st);
            if (passagenum > 0 && passagenum <= passagecnt) {
              scope = PASSAGESCOPE;
              if (matchedtitle && passagenum === targetpassage) {
                foundpassage = TRUE;
                if (!nowin_buf) {
                  tribwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
                  if (tribwin === WIN_ERR) {
                    { $g = 1; continue $L; }
                  }
                }
              }
            }
          } else if (!strncmpi(P(line, 1), S("e "), 3 - 1)) {
            if (foundpassage) {
              { $g = 1; continue $L; }
            }
            if (scope === TITLESCOPE) {
              matchedtitle = FALSE;
            }
            if (scope === SECTIONSCOPE) {
              matchedsection = FALSE;
            }
            if (scope) {
              --scope;
            }
          } else {
            do {
              if (await debugcore(S("files.c"), 1)) {
                await pline(S("tribute file error: bad %% command, line %d."), linect);
              }
            } while (0);
          }
          break;
        case 35:
          break;
        default:
          if (foundpassage) {
            if (!nowin_buf) {
              await G.windowprocs.win_putstr(tribwin, 0, P(line));
              if ($rd(P(line))) {
                strcpy(P(lastline), P(line));
              }
            } else {
              copynchars(nowin_buf, P(line), bufsz - 1);
              { $g = 1; continue $L; }
            }
          }
        }
      }
    case 1: // cleanup
      dlb_fclose(fp);
      if (nowin_buf) {
        grasped = (nowin_buf.a[nowin_buf.o] ? TRUE : FALSE) << 24 >> 24;
      } else {
        if (tribwin !== WIN_ERR) {
          if ($rd(P(lastline))) {
            await G.windowprocs.win_display_nhwindow(tribwin, FALSE);
            if (strchr(P(lastline), 91)) {
              mungspaces(P(lastline));
            } else {
              sprintf(P(lastline), S("[%s, by Terry Pratchett]"), tribtitle);
            }
            await G.windowprocs.win_putmsghistory(P(lastline), FALSE);
            grasped = TRUE;
          }
          await G.windowprocs.win_destroy_nhwindow(tribwin);
        }
        if (!grasped) {
          await pline(S("It seems to be %s of \"%s\"!"), badtranslation, tribtitle);
        }
      }
      return grasped;
    }
    break;
  }
}

export async function Death_quote(buf: Ptr | null, bufsz: number): Promise<number> {
  let death_oid = 1;
  return await read_tribute(S("Death"), S("Death Quotes"), 0, buf, bufsz, death_oid);
}

export function $init(): void {
  G.bones = $cs("bonesnn.xxx", 12);
  G.lock = $cs("1lock", 46);
  G.SAVEF = new Int8Array(45);
  wizkit = new Int8Array(128);
  config_section_chosen = null;
  config_section_current = null;
  nesting = 0;
  lockfd = -1;
  G.sflock = new struct_flock();
  G.default_configfile = S(".nethackrc");
  G.configfile = new Int8Array(256);
  config_error_data = null;
  symset_count = 0;
  chosen_symset_start = 0;
  chosen_symset_end = 0;
  symset_which_set = 0;
  fname_encode$hexdigits = $cs("0123456789ABCDEF", 17);
  fname_decode$hexdigits = $cs("0123456789ABCDEF", 17);
}
