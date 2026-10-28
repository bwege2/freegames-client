// @ts-nocheck
// NetHack 3.6.7 ../sys/unix/unixmain.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { argcheck, display_gamewindows, moveloop, newgame } from './allmain.ts';
import { hangup, yn_function } from './cmd.ts';
import { dlb_init } from './dlb.ts';
import { switch_symbols } from './drawing.ts';
import { build_english_list, done1 } from './end.ts';
import { check_recordfile, config_error_done, config_error_init, delete_levelfile, delete_savefile, fqname, nh_compress, restore_saved_game, reveal_paths } from './files.ts';
import { eos, strncmpi } from './hacklib.ts';
import { getmailstatus } from './mail.ts';
import { initoptions, load_symset, nh_getenv, set_playmode } from './options.ts';
import { You, pline, raw_printf } from './pline.ts';
import { dorecover } from './restore.ts';
import { plnamesuffix, str2race, str2role } from './role.ts';
import { sys_early_init } from './sys.ts';
import { prscore } from './topten.ts';
import { check_linux_console, error, init_linux_cons } from './unixtty.ts';
import { getlock } from './unixunix.ts';
import { vision_init } from './vision.ts';
import { choose_windows } from './windows.ts';
import { struct_passwd, struct_sigaction } from './structs.ts';
import { $rd, $u64, $wr, G, P, S, chdir, chmod, exit, free, getgid, getlogin, getpid, getpwnam, getpwuid, getuid, isspace, memset, perror, setgid, setuid, sigaction, signal, strcat, strchr, strcmp, strcpy, strlen, strncat, strncmp, strncpy, umask } from './rt/index.ts';
import { ARG_DEBUG, ARG_SHOWPATHS, ARG_VERSION, EXIT_SUCCESS, FALSE, FCMASK, PRIMARY, ROGUESET, SAVEPREFIX, SIGHUP, SIGINT, SIGQUIT, SIGXCPU, TRUE } from './consts.ts';

let wiz_error_flag: number;
let get_unix_pw$pw: struct_passwd | null;
let get_login_name$buf: any;

export async function main(argc$: number, argv: Ptr | null): Promise<number> {
  const argc = new Int32Array(1);
  argc[0] = argc$;
  let $g = 0;
  let fd = 0;
  let dir = null;
  let exact_username = 0;
  let resuming = 0;
  let plsel_once = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      resuming = FALSE;
      plsel_once = FALSE;
      await sys_early_init();
      G.hname = argv.a[argv.o];
      G.hackpid = getpid();
      umask(511 & ~FCMASK);
      await choose_windows(S("tty"));
      dir = nh_getenv(S("NETHACKDIR"));
      if (!dir) {
        dir = nh_getenv(S("HACKDIR"));
      }
      if (argc[0] > 1) {
        if (argcheck(argc[0], argv, ARG_VERSION) === 2) {
          exit(EXIT_SUCCESS);
        }
        if (argcheck(argc[0], argv, ARG_SHOWPATHS) === 2) {
          await chdirx(null, 0);
          G.iflags.initoptions_noterminate = TRUE;
          await initoptions();
          G.iflags.initoptions_noterminate = FALSE;
          reveal_paths();
          exit(EXIT_SUCCESS);
        }
        if (argcheck(argc[0], argv, ARG_DEBUG) === 1) {
          --argc[0];
          argv = argv.add(1);
        }
        if (argc[0] > 1 && !strncmp(argv.a[argv.o + 1], S("-d"), 2) && $rd(argv.a[argv.o + 1], 2) !== 101) {
          --argc[0];
          argv = argv.add(1);
          dir = argv.a[argv.o].add(2);
          if (dir.a[dir.o] === 61 || dir.a[dir.o] === 58) {
            dir = dir.add(1);
          }
          if (!dir.a[dir.o] && argc[0] > 1) {
            --argc[0];
            argv = argv.add(1);
            dir = argv.a[argv.o];
          }
          if (!dir.a[dir.o]) {
            await error(S("Flag -d must be followed by a directory name."));
          }
        }
      }
      if (argc[0] > 1) {
        if (!strncmp(argv.a[argv.o + 1], S("-s"), 2) && strncmp(argv.a[argv.o + 1], S("-style"), 6)) {
          await chdirx(dir, 0);
          await initoptions();
          await prscore(argc[0], argv);
          exit(EXIT_SUCCESS);
        }
      }
      await chdirx(dir, 1);
      check_linux_console();
      await initoptions();
      exact_username = whoami();
      G.u.uhp = 1;
      G.program_state.preserve_locks = 1;
      sethanguphandler(hangup);
      await process_options(argc[0], argv);
      await G.windowprocs.win_init_nhwindows(P(argc, 0), argv);
      init_linux_cons();
      await getmailstatus();
      set_playmode();
      if (exact_username) {
        let len = strlen(P(G.plname)) | 0;
        if (++len < 32) {
          strncat(strcat(P(G.plname), S("-")), P(G.pl_character), 32 - $u64(len) - 1);
        }
      }
      await plnamesuffix();
      if (G.flags.debug) {
        G.locknum = 0;
      } else {
        signal(SIGQUIT, 1);
        signal(SIGINT, 1);
      }
      await dlb_init();
      vision_init();
      await display_gamewindows();
    case 1: // attempt_restore
      if ($rd(P(G.plname))) {
        await getlock();
        G.program_state.preserve_locks = 0;
      }
      if ($rd(P(G.plname)) && (fd = await restore_saved_game()) >= 0) {
        let fq_save = fqname(P(G.SAVEF), SAVEPREFIX, 1);
        chmod(fq_save, 0);
        signal(SIGINT, done1);
        if (G.iflags.news) {
          await G.windowprocs.win_display_file(S("news"), FALSE);
          G.iflags.news = FALSE;
        }
        await pline(S("Restoring save file..."));
        G.windowprocs.win_mark_synch();
        if (await dorecover(fd)) {
          resuming = TRUE;
          await wd_message();
          if (G.flags.explore || G.flags.debug) {
            if (await yn_function(S("Do you want to keep the save file?"), P(G.ynchars), 110) === 110) {
              delete_savefile();
            } else {
              chmod(fq_save, FCMASK);
              nh_compress(fq_save);
            }
          }
        }
      }
      if (!resuming) {
        let neednewlock = (!$rd(P(G.plname)) ? 1 : 0) << 24 >> 24;
        if (!G.iflags.renameinprogress || G.iflags.defer_plname || neednewlock) {
          if (!plsel_once) {
            await G.windowprocs.win_player_selection();
          }
          plsel_once = TRUE;
          if (neednewlock && $rd(P(G.plname))) {
            { $g = 1; continue $L; }
          }
          if (G.iflags.renameinprogress) {
            if (!G.locknum) {
              delete_levelfile(0);
              await getlock();
            }
            { $g = 1; continue $L; }
          }
        }
        await newgame();
        await wd_message();
      }
      await moveloop(resuming);
      exit(EXIT_SUCCESS);
      return 0;
    }
    break;
  }
}

async function process_options(argc: number, argv: Ptr | null): Promise<void> {
  let i = 0;
  let l = 0;
  while (argc > 1 && $rd(argv.a[argv.o + 1]) === 45) {
    argv = argv.add(1);
    --argc;
    l = strlen(argv.a[argv.o]) | 0;
    if (l < 4) {
      l = 4;
    }
    switch ($rd(argv.a[argv.o], 1)) {
    case 68:
    case 100:
      if ($rd(argv.a[argv.o], 1) === 68 && !$rd(argv.a[argv.o], 2) || !strncmpi(argv.a[argv.o], S("-debug"), -1)) {
        G.flags.debug = TRUE, G.flags.explore = FALSE;
      } else if (!strncmpi(argv.a[argv.o], S("-DECgraphics"), l)) {
        await load_symset(S("DECGraphics"), PRIMARY);
        await switch_symbols(TRUE);
      } else {
        raw_printf(S("Unknown option: %.60s"), argv.a[argv.o]);
      }
      break;
    case 88:
      G.flags.explore = TRUE, G.flags.debug = FALSE;
      break;
    case 110:
      G.iflags.news = FALSE;
      break;
    case 117:
      if ($rd(argv.a[argv.o], 2)) {
        strncpy(P(G.plname), argv.a[argv.o].add(2), 32 - 1);
      } else if (argc > 1) {
        --argc;
        argv = argv.add(1);
        strncpy(P(G.plname), argv.a[argv.o], 32 - 1);
      } else {
        G.windowprocs.win_raw_print(S("Player name expected after -u"));
      }
      break;
    case 73:
    case 105:
      if (!strncmpi(argv.a[argv.o], S("-IBMgraphics"), l)) {
        await load_symset(S("IBMGraphics"), PRIMARY);
        await load_symset(S("RogueIBM"), ROGUESET);
        await switch_symbols(TRUE);
      } else {
        raw_printf(S("Unknown option: %.60s"), argv.a[argv.o]);
      }
      break;
    case 112:
      if ($rd(argv.a[argv.o], 2)) {
        if ((i = str2role(argv.a[argv.o].add(2))) >= 0) {
          G.flags.initrole = i;
        }
      } else if (argc > 1) {
        --argc;
        argv = argv.add(1);
        if ((i = str2role(argv.a[argv.o])) >= 0) {
          G.flags.initrole = i;
        }
      }
      break;
    case 114:
      if ($rd(argv.a[argv.o], 2)) {
        if ((i = str2race(argv.a[argv.o].add(2))) >= 0) {
          G.flags.initrace = i;
        }
      } else if (argc > 1) {
        --argc;
        argv = argv.add(1);
        if ((i = str2race(argv.a[argv.o])) >= 0) {
          G.flags.initrace = i;
        }
      }
      break;
    case 119:
      await config_error_init(FALSE, S("command line"), FALSE);
      await choose_windows(argv.a[argv.o].add(2));
      await config_error_done();
      break;
    case 64:
      G.flags.randomall = 1;
      break;
    default:
      if ((i = str2role(argv.a[argv.o].add(1))) >= 0) {
        G.flags.initrole = i;
        break;
      }
    }
  }
  if (argc > 1) {
    raw_printf(S("MAXPLAYERS are set in sysconf file.\n"));
  }
  if (!G.locknum || G.sysopt.maxplayers && G.locknum > G.sysopt.maxplayers) {
    G.locknum = G.sysopt.maxplayers;
  }
}

async function chdirx(dir: Ptr | null, wr: number): Promise<void> {
  if (dir && strcmp(dir, S("."))) {
    setgid(getgid());
    setuid(getuid());
  } else {
  }
  if (!dir) {
    dir = S(".");
  }
  if (dir && chdir(dir) < 0) {
    perror(dir);
    await error(S("Cannot chdir to %s."), dir);
  }
  if (wr) {
    await check_recordfile(dir);
  }
}

function whoami(): number {
  if (!$rd(P(G.plname))) {
    let s = null;
    s = nh_getenv(S("USER"));
    if (!s || !s.a[s.o]) {
      s = nh_getenv(S("LOGNAME"));
    }
    if (!s || !s.a[s.o]) {
      s = getlogin();
    }
    if (s && s.a[s.o]) {
      strncpy(P(G.plname), s, 32 - 1);
      if (strchr(P(G.plname), 45)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

export function sethanguphandler(handler: Function | null): void {
  let sact = new struct_sigaction();
  memset(sact, 0, 152);
  sact.__sigaction_handler.sa_handler = handler;
  sigaction(SIGHUP, sact, null);
  sigaction(SIGXCPU, sact, null);
}

export function authorize_wizard_mode(): number {
  let pw = get_unix_pw();
  if (pw && G.sysopt.wizards && G.sysopt.wizards.a[G.sysopt.wizards.o]) {
    if (check_user_string(G.sysopt.wizards)) {
      return TRUE;
    }
  }
  wiz_error_flag = TRUE;
  return FALSE;
}

async function wd_message(): Promise<void> {
  if (wiz_error_flag) {
    if (G.sysopt.wizards && G.sysopt.wizards.a[G.sysopt.wizards.o]) {
      let tmp = await build_english_list(G.sysopt.wizards);
      await pline(S("Only user%s %s may access debug (wizard) mode."), strchr(G.sysopt.wizards, 32) ? S("s") : S(""), tmp);
      free(tmp);
    } else {
      await pline(S("Entering explore/discovery mode instead."));
    }
    G.flags.debug = 0, G.flags.explore = 1;
  } else if (G.flags.explore) {
    await You(S("are in non-scoring explore/discovery mode."));
  }
}

export function append_slash(name: Ptr | null): void {
  let ptr = null;
  if (!name.a[name.o]) {
    return;
  }
  ptr = name.add(strlen(name) - 1);
  if (ptr.a[ptr.o] !== 47) {
    $wr((ptr = ptr.add(1)), 0, 47);
    $wr((ptr = ptr.add(1)), 0, 0);
  }
  return;
}

export function check_user_string(optstr: Ptr | null): number {
  let pw = null;
  let pwlen = 0;
  let eop = null;
  let w = null;
  let pwname = null;
  if (optstr.a[optstr.o] === 42) {
    return TRUE;
  }
  if (G.sysopt.check_plname) {
    pwname = P(G.plname);
  } else if (!!(pw = get_unix_pw())) {
    pwname = pw.pw_name;
  }
  if (!pwname || !pwname.a[pwname.o]) {
    return FALSE;
  }
  pwlen = strlen(pwname) | 0;
  eop = eos(optstr);
  w = optstr;
  while (w.add(pwlen).o <= eop.o) {
    if (!w.a[w.o]) {
      break;
    }
    if (isspace(w.a[w.o])) {
      w = w.add(1);
      continue;
    }
    if (!strncmp(w, pwname, $u64(pwlen))) {
      if (!w.a[w.o + pwlen] || isspace(w.a[w.o + pwlen])) {
        return TRUE;
      }
    }
    while (w.a[w.o] && !isspace(w.a[w.o])) {
      w = w.add(1);
    }
  }
  return FALSE;
}

function get_unix_pw(): struct_passwd | null {
  let user = null;
  let uid = 0;
  if (get_unix_pw$pw) {
    return get_unix_pw$pw;
  }
  uid = getuid();
  user = getlogin();
  if (user) {
    get_unix_pw$pw = getpwnam(user);
    if (get_unix_pw$pw && get_unix_pw$pw.pw_uid !== uid) {
      get_unix_pw$pw = null;
    }
  }
  if (!get_unix_pw$pw) {
    user = nh_getenv(S("USER"));
    if (user) {
      get_unix_pw$pw = getpwnam(user);
      if (get_unix_pw$pw && get_unix_pw$pw.pw_uid !== uid) {
        get_unix_pw$pw = null;
      }
    }
    if (!get_unix_pw$pw) {
      get_unix_pw$pw = getpwuid(uid);
    }
  }
  return get_unix_pw$pw;
}

export function get_login_name(): Ptr | null {
  let pw = get_unix_pw();
  get_login_name$buf[0] = 0;
  if (pw) {
    strcpy(P(get_login_name$buf), pw.pw_name);
  }
  return P(get_login_name$buf);
}

export function $init(): void {
  wiz_error_flag = 0;
  get_unix_pw$pw = null;
  get_login_name$buf = new Int8Array(256);
}
