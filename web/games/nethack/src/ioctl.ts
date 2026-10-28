// @ts-nocheck
// NetHack 3.6.7 ../sys/share/ioctl.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { Norep, pline } from './pline.ts';
import { check_user_string } from './unixmain.ts';
import { linux_mapoff, linux_mapon } from './unixtty.ts';
import { struct_termios, struct_winsize } from './structs.ts';
import { $bytes, G, R, S, fileno, ioctl, kill, signal, tcgetattr, tcsetattr } from './rt/index.ts';
import { SIGTSTP, TCSADRAIN, TIOCGWINSZ } from './consts.ts';


export function getwindowsz(): void {
  let ttsz = new struct_winsize();
  if (ioctl(fileno(R.stdin), TIOCGWINSZ, $bytes(ttsz)) !== -1) {
    if (ttsz.ws_row) {
      G.tc_gbl_data.tc_LI = ttsz.ws_row;
    }
    if (ttsz.ws_col) {
      G.tc_gbl_data.tc_CO = ttsz.ws_col;
    }
  }
}

export function getioctls(): void {
  tcgetattr(fileno(R.stdin), G.termio);
  getwindowsz();
}

export function setioctls(): void {
  tcsetattr(fileno(R.stdin), TCSADRAIN, G.termio);
}

export async function dosuspend(): Promise<number> {
  if (!G.sysopt.shellers || !G.sysopt.shellers.a[G.sysopt.shellers.o] || !check_user_string(G.sysopt.shellers)) {
    await Norep(S("Suspend command not available."));
    return 0;
  }
  if (!signal(SIGTSTP, 1)) {
    await G.windowprocs.win_suspend_nhwindows(null);
    linux_mapon();
    signal(SIGTSTP, null);
    kill(0, SIGTSTP);
    linux_mapoff();
    await G.windowprocs.win_resume_nhwindows();
  } else {
    await pline(S("I don't think your shell has job control."));
  }
  return 0;
}

export function $init(): void {
  G.termio = new struct_termios();
}
