// x11/about.c: the about window (five pages with the item list), the key reference and the MOTD
// viewers.
import { G } from './G.ts';
import { BLACK, WHITE, RED, ITEM_SIZE, ITEM_TRIANGLE_SIZE, NUM_ITEMS, MAX_MOTD_SIZE } from './consts.ts';
import { MAX, MIN, onReset, snprintf, sprintf } from './cutil.ts';
import { error, warn, xpprintf } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { Display, GC } from '../xlib/xlib.ts';
import { ShadowDrawString } from './xpaint.ts';
import { Item_get_text } from './xinit.ts';
import { Gui_paint_item } from './guiobjects.ts';
import { NO_WIDGET, Widget_create_viewer, Widget_destroy, Widget_map, Widget_update_viewer } from './widget.ts';
import { O, Get_keyHelpString } from './option.ts';
import { Net_ask_for_motd, Net_flush } from './netclient.ts';

const BORDER = 10;
const BTN_BORDER = 4;
const ABOUT_WINDOW_WIDTH = 600;
const ABOUT_WINDOW_HEIGHT = 700;
const NUM_ABOUT_PAGES = 5;
const LINE_MAX = 2048;

const A = {
  about_created: false, itemsplit: -1, keys_viewer: NO_WIDGET, motd_buf: null as string[] | null, motd_size: 0,
  motd_viewer: NO_WIDGET, motd_auto_popup: false,
};
onReset(() => Object.assign(A, {
  about_created: false, itemsplit: -1, keys_viewer: NO_WIDGET, motd_buf: null, motd_size: 0, motd_viewer: NO_WIDGET, motd_auto_popup: false,
}));

const isspace = (c: string) => c === ' ' || (c >= '\t' && c <= '\r');

/** wraps the text at whitespace; returns the vertical position it ended at */
export function DrawShadowText(display: Display, w: number, gc: GC, x_border: number, y_start: number, str: string | null, fg: number, bg: number): number {
  const font = X.XQueryFont(display, X.XGContextFromGC(gc));
  if (str === null || str === '') return 0;
  const wattr = X.XGetWindowAttributes(display, w);
  const wwidth = wattr ? wattr.width : 0;
  let x = x_border;
  let y = y_start + font.ascent;
  let p = 0;
  do {
    let word = '';
    for (; p < str.length && !isspace(str[p]) && word.length < LINE_MAX - 1; p++) word += str[p];
    const wordLen = X.XTextWidth(font, word, word.length);
    if (x + wordLen > wwidth - BORDER) {
      x = x_border;
      y += font.ascent + font.descent + 1;
    }
    ShadowDrawString(display, w, gc, x, y, word, fg, bg);
    x += wordLen;
    for (; p < str.length && isspace(str[p]); p++) {
      if (str[p] === '\n') {
        x = x_border;
        y += font.ascent + font.descent + 1;
      } else x += X.XTextWidth(font, ' ', 1);
    }
  } while (p < str.length);
  return y + font.descent + 1;
}

const PACKAGE_BUGREPORT = 'xpilot-hacks@lists.sourceforge.net';

export function Expose_about_window(): void {
  const W = G.colors[WHITE].pixel, B = G.colors[BLACK].pixel;
  X.XClearWindow(G.dpy, G.aboutWindow);
  switch (G.about_page) {
    case 0:
      DrawShadowText(G.dpy, G.aboutWindow, G.textGC, BORDER, BORDER,
        'ABOUT XPILOT\n\nThe game was conceived in its original form at the University of Troms\xf8 (Norway) by Ken Ronny Schouten and '
        + 'Bj\xf8rn Stabell during the fall of 1991, but much of the game today is the result of hard efforts by Bert Gijsbers of the '
        + 'molecular cytology lab at the University of Amsterdam (The Netherlands).  Bert joined the team in the spring of 1993.\n\n'
        + 'Dick Balaska (Connecticut, USA) ported XPilot to Windows 95 and NT in the summer of 1996.\n\n'
        + 'A large number of features have been contributed by XPilot fans from all around the world.  See the CREDITS file for details.\n\n'
        + 'For more information, read the XPilot FAQ (Frequently Asked Questions).\n\n\n'
        + 'Good luck as a future xpilot,\nBj\xf8rn Stabell, Ken Ronny Schouten, Bert Gijsbers & Dick Balaska', W, B);
      break;
    case 1:
      DrawShadowText(G.dpy, G.aboutWindow, G.textGC, BORDER, BORDER,
        'ABOUT XPILOT NG\n\nXPilot NG is an improved version of XPilot.\n\nFor more info visit http://xpilot.sourceforge.net/ or\n'
        + 'read the man pages xpilot-ng-x11(6) and xpilot-ng-server(6).\n\n'
        + `You can report any bug you find to <${PACKAGE_BUGREPORT}>.`, W, B);
      break;
    case 2:
      DrawShadowText(G.dpy, G.aboutWindow, G.textGC, BORDER, BORDER,
        'GAME OBJECTIVE\n\nXPilot is a multi-player 2D space game.  Some features are borrowed from classics like the Atari coin-ups '
        + 'Asteroids and Gravitar, and the home-computer games Thrust (Commdore 64) and Gravity Force, but XPilot has many '
        + 'new features as well.\n\nThe primary goal of the game is to collect points and increase your rating by destroying enemy '
        + 'fighters and cannons.  You are equipped with a machine gun when you start the game, but after a while you should have '
        + 'managed to collect some other fancy equipment.\n\nAnother important task is to refuel your ship.  This is vital because '
        + 'your engine, radar, weapons and shields all require fuel.  Some even work better the more fuel you have aboard (mainly '
        + 'the radar).\n\nOptional modes include variations on this game play: you can play together in teams, you can disable '
        + 'shields (and all other equipment if you like), you can race against time and fellow players, and much much more.', W, B);
      break;
    case 3:
    case 4: {
      let y: number, first: number, last: number;
      if (G.about_page === 3) {
        y = DrawShadowText(G.dpy, G.aboutWindow, G.textGC, BORDER, BORDER,
          'BONUS ITEMS\n\nScattered around the world you might find some of these red triangle objects.  They are well worth '
          + 'picking up since they either improve on the equipment you have, or they give you new equipment.  If a fighter '
          + 'explodes, some of its equipment might be found among the debris.', W, B);
        first = 0;
        last = A.itemsplit === -1 ? NUM_ITEMS - 1 : A.itemsplit;
      } else {
        y = DrawShadowText(G.dpy, G.aboutWindow, G.textGC, BORDER, BORDER, 'BONUS ITEMS CONTINUED\n', W, B);
        first = A.itemsplit + 1;
        last = NUM_ITEMS - 1;
      }
      y += BORDER;
      let box_start = y;
      y += BORDER / 2;
      for (let i = first; i <= last; i++) {
        y += BORDER / 2;
        const old_y = y;
        y = DrawShadowText(G.dpy, G.aboutWindow, G.textGC, 5 * BORDER + 2 * ITEM_SIZE, old_y, Item_get_text(i), W, B);
        if (y - old_y < 2 * ITEM_TRIANGLE_SIZE) y = old_y + 2 * ITEM_TRIANGLE_SIZE;
        let box_end = y + BORDER / 2;
        if (i === last) box_end += BORDER / 2;
        X.XSetForeground(G.dpy, G.textGC, G.colors[BLACK].pixel);
        X.XFillRectangle(G.dpy, G.aboutWindow, G.textGC, BORDER, box_start, 2 * ITEM_SIZE + 2 * BORDER, (box_end - box_start) >>> 0);
        X.XSetForeground(G.dpy, G.textGC, G.colors[RED].pixel);
        Gui_paint_item(i & 0xff, G.aboutWindow, G.textGC, 2 * BORDER + ITEM_SIZE, old_y + ITEM_TRIANGLE_SIZE);
        X.XSetForeground(G.dpy, G.textGC, G.colors[WHITE].pixel);
        if (G.about_page === 3 && A.itemsplit === -1
          && box_end >= ABOUT_WINDOW_HEIGHT - BORDER * 2 - 4 - (2 * BTN_BORDER + G.buttonFont.ascent + G.buttonFont.descent)) {
          A.itemsplit = i - 1;
          X.XSetForeground(G.dpy, G.textGC, G.colors[G.windowColor].pixel);
          X.XFillRectangle(G.dpy, G.aboutWindow, G.textGC, BORDER, box_start, ABOUT_WINDOW_WIDTH, (box_end - box_start) >>> 0);
          X.XSetForeground(G.dpy, G.textGC, G.colors[WHITE].pixel);
          break;
        }
        y = box_end;
        box_start = box_end;
      }
      if (G.about_page === 3 && A.itemsplit === -1) A.itemsplit = NUM_ITEMS - 1;
      break;
    }
    default:
      error(`Unkown page number ${G.about_page}\n`);
      break;
  }
}

function About_create_window(): void {
  const windowWidth = ABOUT_WINDOW_WIDTH;
  const buttonWindowHeight = 2 * BTN_BORDER + G.buttonFont.ascent + G.buttonFont.descent;
  const windowHeight = ABOUT_WINDOW_HEIGHT;
  let mask = 0;
  const sattr: X.XSetWindowAttributes = {};
  sattr.background_pixel = G.colors[G.windowColor].pixel;
  mask |= X.CWBackPixel;
  sattr.border_pixel = G.colors[G.borderColor].pixel;
  mask |= X.CWBorderPixel;
  if (G.colormap !== 0) {
    sattr.colormap = G.colormap;
    mask |= X.CWColormap;
  }
  sattr.backing_store = X.Always;
  mask |= X.CWBackingStore;
  G.aboutWindow = X.XCreateWindow(G.dpy, X.DefaultRootWindow(G.dpy), 0, 0, windowWidth, windowHeight, 2, G.dispDepth, X.InputOutput, mask, sattr);
  X.XStoreName(G.dpy, G.aboutWindow, 'XPilot - information');
  const by = windowHeight - BORDER - buttonWindowHeight - 4;
  let textWidth = X.XTextWidth(G.buttonFont, 'CLOSE', 5);
  G.about_close_b = X.XCreateSimpleWindow(G.dpy, G.aboutWindow, BORDER, by, 2 * BTN_BORDER + textWidth, buttonWindowHeight, 0, 0, G.colors[G.buttonColor].pixel);
  textWidth = X.XTextWidth(G.buttonFont, 'PREV', 4);
  G.about_prev_b = X.XCreateSimpleWindow(G.dpy, G.aboutWindow, windowWidth / 2 - BTN_BORDER - Math.trunc(textWidth / 2), by,
    2 * BTN_BORDER + textWidth, buttonWindowHeight, 0, 0, G.colors[G.buttonColor].pixel);
  textWidth = X.XTextWidth(G.buttonFont, 'NEXT', 4);
  G.about_next_b = X.XCreateSimpleWindow(G.dpy, G.aboutWindow, windowWidth - BORDER - 2 * BTN_BORDER - textWidth, by,
    2 * BTN_BORDER + textWidth, buttonWindowHeight, 0, 0, G.colors[G.buttonColor].pixel);
  const m = X.ExposureMask | X.ButtonPressMask | X.ButtonReleaseMask;
  X.XSelectInput(G.dpy, G.about_close_b, m);
  X.XSelectInput(G.dpy, G.about_next_b, m);
  X.XSelectInput(G.dpy, G.about_prev_b, m);
  X.XSelectInput(G.dpy, G.aboutWindow, X.ExposureMask);
  Expose_about_window();
  X.XMapSubwindows(G.dpy, G.aboutWindow);
}

export function Expose_button_window(color: number, w: number): void {
  if (w !== G.about_close_b && w !== G.about_next_b && w !== G.about_prev_b) return;
  const wattr = X.XGetWindowAttributes(G.dpy, w);
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[color].pixel);
  X.XFillRectangle(G.dpy, w, G.buttonGC, 0, 0, wattr ? wattr.width >>> 0 : 0, wattr ? wattr.height >>> 0 : 0);
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[WHITE].pixel);
  const W = G.colors[WHITE].pixel, B = G.colors[BLACK].pixel, y = G.buttonFont.ascent + BTN_BORDER;
  if (w === G.about_close_b) ShadowDrawString(G.dpy, w, G.buttonGC, BTN_BORDER, y, 'CLOSE', W, B);
  if (w === G.about_prev_b) ShadowDrawString(G.dpy, w, G.buttonGC, BTN_BORDER, y, 'PREV', W, B);
  if (w === G.about_next_b) ShadowDrawString(G.dpy, w, G.buttonGC, BTN_BORDER, y, 'NEXT', W, B);
}

export function About(w: number): void {
  if (A.about_created === false) {
    About_create_window();
    A.about_created = true;
  }
  if (w === G.about_close_b) {
    G.about_page = 0;
    X.XUnmapWindow(G.dpy, G.aboutWindow);
  } else if (w === G.about_next_b) {
    G.about_page++;
    if (G.about_page === 1 && A.itemsplit >= NUM_ITEMS - 1) G.about_page++;
    if (G.about_page >= NUM_ABOUT_PAGES) G.about_page = 0;
    Expose_about_window();
  } else if (w === G.about_prev_b) {
    G.about_page--;
    if (G.about_page === 1 && A.itemsplit >= NUM_ITEMS - 1) G.about_page--;
    if (G.about_page <= -1) G.about_page = NUM_ABOUT_PAGES - 1;
    Expose_about_window();
  }
}

export function About_callback(): number {
  if (A.about_created === false) {
    About_create_window();
    A.about_created = true;
  }
  X.XMapWindow(G.dpy, G.aboutWindow);
  return 0;
}

export function Keys_callback(): number {
  let maxkeylen = 0;
  const kd = O.keydefs;
  for (const k of kd) {
    const s = X.XKeysymToString(k.keysym);
    if (s !== null && s.length > maxkeylen) maxkeylen = s.length;
  }
  let bufsize = kd.length * 64;
  let buf = '';
  for (const k of kd) {
    const s = X.XKeysymToString(k.keysym);
    const help = s !== null ? Get_keyHelpString(k.key) : null;
    if (s === null || help === null) continue;
    if (buf.length + (maxkeylen + help.length + 4) >= bufsize) {
      bufsize += 4096;
      xpprintf(`realloc: ${bufsize}\n`);
    }
    buf += sprintf('%-*s  %s\n', maxkeylen, s, help);
  }
  A.keys_viewer = Widget_create_viewer(buf, buf.length, Math.trunc((2 * X.DisplayWidth(G.dpy, 0)) / 3), Math.trunc((4 * X.DisplayHeight(G.dpy, 0)) / 5),
    2, 'XPilot - key reference', 'XPilot:keys', G.motdFont);
  if (A.keys_viewer === NO_WIDGET) warn("Can't create key viewer");
  return 0;
}

export function Keys_destroy(): void {
  Widget_destroy(A.keys_viewer);
  A.keys_viewer = NO_WIDGET;
}

export function Motd_callback(): number {
  A.motd_auto_popup = false;
  Net_ask_for_motd(0, MAX_MOTD_SIZE);
  Net_flush();
  if (A.motd_viewer !== NO_WIDGET) Widget_map(A.motd_viewer);
  return 0;
}

export function Motd_destroy(): void {
  Widget_destroy(A.motd_viewer);
  A.motd_viewer = NO_WIDGET;
  A.motd_buf = null;
}

export function Handle_motd(off: number, buf: string, len: number, filesize: number): number {
  const no_motd_msg = '\nThis server has no MOTD.\n\n';
  if (!A.motd_buf) {
    A.motd_size = MIN(filesize, MAX_MOTD_SIZE);
    const n = MAX(A.motd_size, no_motd_msg.length + 1) + 1;
    A.motd_buf = new Array<string>(n).fill('\0');
    for (let i = 0; i < A.motd_size; i++) A.motd_buf[i] = ' ';
    for (let i = 39; i < A.motd_size; i += 40) A.motd_buf[i] = '\n';
  } else if (filesize < A.motd_size) {
    A.motd_size = filesize;
    A.motd_buf[A.motd_size] = '\0';
  }
  if (off < A.motd_size && len > 0) {
    if (off + len > A.motd_size) len = A.motd_size - off;
    for (let i = 0; i < len; i++) A.motd_buf[off + i] = buf[i];
  } else if (len === 0 && off > 0) return 0;
  const strlen = () => {
    const z = A.motd_buf!.indexOf('\0');
    return z < 0 ? A.motd_buf!.length : z;
  };
  if (A.motd_size === 0) {
    if (A.motd_auto_popup) {
      A.motd_buf = null;
      return 0;
    }
    for (let i = 0; i < no_motd_msg.length; i++) A.motd_buf[i] = no_motd_msg[i];
    A.motd_buf[no_motd_msg.length] = '\0';
    A.motd_size = strlen();
  }
  const text = A.motd_buf.join('');
  if (A.motd_viewer === NO_WIDGET) {
    const title = snprintf(100, 'XPilot motd from %s', G.servername);
    A.motd_viewer = Widget_create_viewer(text, off || len ? off + len : strlen(), Math.trunc((2 * X.DisplayWidth(G.dpy, 0)) / 3),
      Math.trunc((4 * X.DisplayHeight(G.dpy, 0)) / 8), 2, title, 'XPilot:motd', G.motdFont);
    if (A.motd_viewer === NO_WIDGET) warn("Can't create MOTD viewer");
  } else if (len > 0) Widget_update_viewer(A.motd_viewer, text, off + len);
  return 0;
}

export function aboutCleanup(): void {
  A.motd_buf = null;
}
