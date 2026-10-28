// @ts-nocheck
// NetHack 3.6.7 ../sys/share/unixtty.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { strncmpi } from './hacklib.ts';
import { getioctls, setioctls } from './ioctl.ts';
import { struct_termios, struct_vt_mode } from './structs.ts';
import { G, R, S, VaList, atexit, cfgetospeed, exit, fpathconf, has_colors, ioctl, isatty, perror, putchar, strlen, tcgetattr, tcsetattr, vprintf, write } from './rt/index.ts';
import { CBRKMASK, ECHO, EXIT_FAILURE, EXTABS, FALSE, OFF, ON, STRIPHI, TRUE, VDISCARD, VLNEXT, VMIN, VREPRINT, VSUSP, VTIME, VT_GETMODE, VWERASE, _PC_VDISABLE, erase_sym, intr_sym, kill_sym } from './consts.ts';

let settty_needed: number;

function speednum(speed: number): number {
  switch (speed) {
  case 0:
    return 0;
  case 50:
    return 1;
  case 75:
    return 2;
  case 110:
    return 3;
  case 134:
    return 4;
  case 150:
    return 5;
  case 200:
    return 6;
  case 300:
    return 7;
  case 600:
    return 8;
  case 1200:
    return 9;
  case 1800:
    return 10;
  case 2400:
    return 11;
  case 4800:
    return 12;
  case 9600:
    return 13;
  case 19200:
    return 14;
  case 38400:
    return 15;
  }
  return 0;
}

function setctty(): void {
  if (tcsetattr(0, 1, G.curttyb) < 0 || 1 < 0) {
    perror(S("NetHack (setctty)"));
  }
}

export function gettty(): void {
  if (tcgetattr(0, G.inittyb) < 0 || 1 < 0) {
    perror(S("NetHack (gettty)"));
  }
  G.curttyb.$cp(G.inittyb);
  G.curttyb.$cp(G.inittyb);
  R.ospeed = speednum(cfgetospeed(G.inittyb)) << 16 >> 16;
  G.erase_char = G.inittyb.c_cc[erase_sym] << 24 >> 24;
  G.kill_char = G.inittyb.c_cc[kill_sym] << 24 >> 24;
  G.intr_char = G.inittyb.c_cc[intr_sym] << 24 >> 24;
  getioctls();
  if ((G.curttyb.c_oflag & EXTABS) >>> 0) {
    G.curttyb.c_oflag = (G.curttyb.c_oflag & 4294961151) >>> 0;
    setctty();
  }
  settty_needed = TRUE;
}

export async function settty(s: Ptr | null): Promise<void> {
  await G.windowprocs.win_end_screen();
  if (s) {
    G.windowprocs.win_raw_print(s);
  }
  if (tcsetattr(0, 1, G.inittyb) < 0 || 1 < 0) {
    perror(S("NetHack (settty)"));
  }
  G.iflags.echo = ((G.inittyb.c_lflag & ECHO) >>> 0 ? ON : OFF) << 24 >> 24;
  G.iflags.cbreak = (!((G.inittyb.c_lflag & CBRKMASK) >>> 0) ? ON : OFF) << 24 >> 24;
  G.curttyb.c_iflag = (G.curttyb.c_iflag | STRIPHI) >>> 0;
  setioctls();
  settty_needed = FALSE;
}

export function setftty(): void {
  let ef = 0;
  let cf = 0;
  let change = 0;
  ef = 0;
  cf = !CBRKMASK ? 1 : 0;
  G.iflags.cbreak = ON;
  G.iflags.echo = OFF;
  if ((G.curttyb.c_lflag & ECHO) >>> 0 !== ef) {
    G.curttyb.c_lflag = (G.curttyb.c_lflag & 4294967287) >>> 0;
    ++change;
  }
  if ((G.curttyb.c_lflag & CBRKMASK) >>> 0 !== cf) {
    G.curttyb.c_lflag = (G.curttyb.c_lflag & 4294967293) >>> 0;
    G.curttyb.c_lflag = (G.curttyb.c_lflag | cf) >>> 0;
    G.curttyb.c_cc[VMIN] = 1;
    G.curttyb.c_cc[VTIME] = 0;
    G.curttyb.c_cc[VSUSP] = fpathconf(0, _PC_VDISABLE) & 0xff;
    G.curttyb.c_cc[VREPRINT] = fpathconf(0, _PC_VDISABLE) & 0xff;
    G.curttyb.c_cc[VDISCARD] = fpathconf(0, _PC_VDISABLE) & 0xff;
    G.curttyb.c_cc[VWERASE] = fpathconf(0, _PC_VDISABLE) & 0xff;
    G.curttyb.c_cc[VLNEXT] = fpathconf(0, _PC_VDISABLE) & 0xff;
    ++change;
  }
  if (!((G.inittyb.c_cflag & 32) >>> 0)) {
    G.curttyb.c_iflag = (G.curttyb.c_iflag & 4294967263) >>> 0;
  }
  if (G.intr_char !== fpathconf(0, _PC_VDISABLE) && G.curttyb.c_cc[intr_sym] !== 3) {
    G.curttyb.c_cc[intr_sym] = 3;
    ++change;
  }
  if (change) {
    setctty();
  }
  G.windowprocs.win_start_screen();
}

export function intron(): void {
  if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && G.intr_char !== fpathconf(0, _PC_VDISABLE) && G.curttyb.c_cc[intr_sym] !== 3) {
    G.curttyb.c_cc[intr_sym] = 3;
    setctty();
  }
}

export function introff(): void {
  if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && G.curttyb.c_cc[intr_sym] !== fpathconf(0, _PC_VDISABLE)) {
    G.curttyb.c_cc[intr_sym] = fpathconf(0, _PC_VDISABLE) & 0xff;
    setctty();
  }
}

export function linux_mapon(): void {
  if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && G.linux_flag_console) {
    write(1, S("\x1b(B"), 3);
  }
}

export function linux_mapoff(): void {
  if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && G.linux_flag_console) {
    write(1, S("\x1b(U"), 3);
  }
}

export function check_linux_console(): void {
  let vtm = new struct_vt_mode();
  if (isatty(0) && ioctl(0, VT_GETMODE, vtm) >= 0) {
    G.linux_flag_console = 1;
  }
}

export function init_linux_cons(): void {
  if (G.windowprocs.name && !strncmpi(S("tty"), G.windowprocs.name, strlen(S("tty")) | 0) && G.linux_flag_console) {
    atexit(linux_mapon);
    linux_mapoff();
    if (has_colors()) {
      G.iflags.wc_color = TRUE;
    }
  }
}

export async function error(s: Ptr | null, ...$va: any[]): Promise<void> {
  let the_args = null;
  {
    the_args = new VaList($va);
    ;
    if (G.iflags.window_inited) {
      await G.windowprocs.win_exit_nhwindows(null);
    }
    if (settty_needed) {
      await settty(null);
    }
    vprintf(s, the_args);
    putchar(10);
    undefined;
  }
  ;
  exit(EXIT_FAILURE);
}

export function $init(): void {
  G.erase_char = 0;
  G.intr_char = 0;
  G.kill_char = 0;
  settty_needed = 0;
  G.inittyb = new struct_termios();
  G.curttyb = new struct_termios();
  G.linux_flag_console = 0;
}
