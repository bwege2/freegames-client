// @ts-nocheck
// NetHack 3.6.7 ../sys/unix/unixunix.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { yn_function } from './cmd.ts';
import { done1 } from './end.ts';
import { fqname, lock_file, set_levelfile_name, unlock_file } from './files.ts';
import { Norep, pline } from './pline.ts';
import { check_user_string } from './unixmain.ts';
import { error, linux_mapoff, linux_mapon } from './unixtty.ts';
import { struct_stat } from './structs.ts';
import { $cs, $rd, $u64, $wr, G, P, R, S, chdir, close, creat, execl, exit, fflush, fork, fstat, getchar, getenv, getgid, getuid, isatty, open, perror, printf, putchar, read, setgid, setuid, signal, sprintf, strchr, strcmp, time, unlink, wait, write } from './rt/index.ts';
import { ENOENT, EOF, EXIT_FAILURE, FCMASK, LEVELPREFIX, LOCKPREFIX, MAXDUNGEON, MAXLEVEL, SIGINT, SIGQUIT } from './consts.ts';

let buf: struct_stat;

function veryold(fd: number): number {
  const date = new Float64Array(1);
  if (fstat(fd, buf)) {
    return 0;
  }
  time(P(date, 0));
  if (date[0] - buf.st_mtim.tv_sec < 3 * 24 * 60 * 60) {
    const lockedpid = new Int32Array(1);
    if ($u64(read(fd, P(lockedpid, 0), 4)) !== 4) {
      return 0;
    }
    return 0;
  }
  close(fd);
  return 1;
}

function eraseoldlocks(): number {
  let i = 0;
  G.program_state.preserve_locks = 0;
  for (i = 1; i <= Math.imul(MAXDUNGEON, MAXLEVEL) + 1; ++i) {
    set_levelfile_name(P(G.lock), i);
    unlink(fqname(P(G.lock), LEVELPREFIX, 0));
  }
  set_levelfile_name(P(G.lock), 0);
  if (unlink(fqname(P(G.lock), LEVELPREFIX, 0))) {
    return 0;
  }
  return 1;
}

export async function getlock(): Promise<void> {
  let $g = 0;
  let i = 0;
  let fd = 0;
  let c = 0;
  let fq_lock = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      i = 0;
      if (!strcmp(G.windowprocs.name, S("tty"))) {
        if (!isatty(0)) {
          await error(S("You must play from a terminal."));
        }
      }
      if (!await lock_file(S("perm"), LOCKPREFIX, 10)) {
        await G.windowprocs.win_wait_synch();
        await error(S("%s"), S(""));
      }
      if (!G.locknum) {
        sprintf(P(G.lock), S("%u%s"), getuid(), P(G.plname));
      }
      regularize(P(G.lock));
      set_levelfile_name(P(G.lock), 0);
      if (G.locknum) {
        if (G.locknum > 25) {
          G.locknum = 25;
        }
        do {
          G.lock[0] = 97 + i++ << 24 >> 24;
          fq_lock = fqname(P(G.lock), LEVELPREFIX, 0);
          if ((fd = open(fq_lock, 0)) === -1) {
            if ($rd(P(R, "errno")) === ENOENT) {
              { $g = 1; continue $L; }
            }
            perror(fq_lock);
            unlock_file(S("perm"));
            await error(S("Cannot open %s"), fq_lock);
          }
          if (veryold(fd) && eraseoldlocks()) {
            { $g = 1; continue $L; }
          }
          close(fd);
        } while (i < G.locknum);
        unlock_file(S("perm"));
        await error(S("Too many hacks running now."));
      } else {
        fq_lock = fqname(P(G.lock), LEVELPREFIX, 0);
        if ((fd = open(fq_lock, 0)) === -1) {
          if ($rd(P(R, "errno")) === ENOENT) {
            { $g = 1; continue $L; }
          }
          perror(fq_lock);
          unlock_file(S("perm"));
          await error(S("Cannot open %s"), fq_lock);
        }
        if (veryold(fd) && eraseoldlocks()) {
          { $g = 1; continue $L; }
        }
        close(fd);
        {
          let destroy_old_game_prompt = $cs("There is already a game in progress under your name.  Destroy old game?", 72);
          if (G.iflags.window_inited) {
            c = await yn_function(P(destroy_old_game_prompt), P(G.ynchars), 110);
          } else {
            printf(S("\n%s [yn] "), P(destroy_old_game_prompt));
            fflush(R.stdout);
            if ((c = await getchar()) !== EOF) {
              let tmp = 0;
              putchar(c);
              fflush(R.stdout);
              while ((tmp = await getchar()) !== 10 && tmp !== EOF) {
                ;
              }
            }
          }
        }
        if (c === 121 || c === 89) {
          if (eraseoldlocks()) {
            { $g = 1; continue $L; }
          } else {
            unlock_file(S("perm"));
            await error(S("Couldn't destroy old game."));
          }
        } else {
          unlock_file(S("perm"));
          await error(S("%s"), S(""));
        }
      }
    case 1: // gotlock
      fd = creat(fq_lock, FCMASK);
      unlock_file(S("perm"));
      if (fd === -1) {
        await error(S("cannot creat lock file (%s)."), fq_lock);
      } else {
        if ($u64(write(fd, P(G, "hackpid"), 4)) !== 4) {
          await error(S("cannot write lock (%s)"), fq_lock);
        }
        if (close(fd) === -1) {
          await error(S("cannot close lock (%s)"), fq_lock);
        }
      }
    }
    break;
  }
}

export function regularize(s: Ptr | null): void {
  let lp = null;
  while (!!(lp = strchr(s, 46)) || !!(lp = strchr(s, 47)) || !!(lp = strchr(s, 32))) {
    lp.a[lp.o] = 95;
  }
}

export async function dosh(): Promise<number> {
  let str = null;
  if (!G.sysopt.shellers || !G.sysopt.shellers.a[G.sysopt.shellers.o] || !check_user_string(G.sysopt.shellers)) {
    await Norep(S("Unknown command '!'."));
    return 0;
  }
  if (await child(0)) {
    if (!!(str = getenv(S("SHELL")))) {
      execl(str, str, null);
    } else {
      execl(S("/bin/sh"), S("sh"), null);
    }
    G.windowprocs.win_raw_print(S("sh: cannot execute."));
    exit(EXIT_FAILURE);
  }
  return 0;
}

export async function child(wt: number): Promise<number> {
  let f = 0;
  await G.windowprocs.win_suspend_nhwindows(null);
  linux_mapon();
  if ((f = fork()) === 0) {
    setgid(getgid());
    setuid(getuid());
    chdir(getenv(S("HOME")));
    return 1;
  }
  if (f === -1) {
    await pline(S("Fork failed.  Try again."));
    return 0;
  }
  signal(SIGINT, 1);
  signal(SIGQUIT, 1);
  wait(null);
  linux_mapoff();
  signal(SIGINT, done1);
  if (G.flags.debug) {
    signal(SIGQUIT, null);
  }
  if (wt) {
    G.windowprocs.win_raw_print(S(""));
    await G.windowprocs.win_wait_synch();
  }
  await G.windowprocs.win_resume_nhwindows();
  return 0;
}

export function $init(): void {
  buf = new struct_stat();
}
