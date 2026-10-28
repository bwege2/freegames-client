// x11/xinit.c: the top window, the GCs and fonts, the playing windows (draw window, radar, the
// QUIT/ABOUT/MENU buttons, the score list), resizing, the dashes.
import { G } from './G.ts';
import {
  BLACK, WHITE, NUM_ITEMS, ITEM_SIZE, MIN_TOP_WIDTH, MAX_TOP_WIDTH, DEF_TOP_WIDTH, MIN_TOP_HEIGHT, MAX_TOP_HEIGHT,
  DEF_TOP_HEIGHT, NUM_DASHES,
} from './consts.ts';
import { LIMIT } from './cutil.ts';
import { fatal, error } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { GC, XFontStruct } from '../xlib/xlib.ts';
import { ICON_BITS, ITEM_BITS } from './bitmapdata.ts';
import { Colors_init, Colors_cleanup } from './colors.ts';
import { Init_spark_colors } from './colors.ts';
import { Widget_add_pulldown_entry, Widget_cleanup, Widget_create_activate, Widget_create_form, Widget_create_menu, Widget_map_sub } from './widget.ts';
import { About_callback, Keys_callback, Motd_callback } from './about.ts';
import { Config, Config_resize } from './configure.ts';
import { Talk_resize } from './talk.ts';
import { Check_view_dimensions, WINSCALE } from './paint.ts';
import { Net_flush } from './netclient.ts';
import { Paint_sliding_radar } from './paintradar.ts';
import { CONFIG_COLORS, CONFIG_DEFAULT, CONFIG_NONE } from './configure.ts';

const BTN_BORDER = 4;
const PIXMAP_COPY = 0;

function hexBytes(h: string): Uint8Array {
  const b = new Uint8Array(h.length / 2);
  for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(2 * i, 2), 16);
  return b;
}

const ITEM_TEXTS = [
  'Extra energy/fuel', 'Extra front cannons', 'Extra rear cannon', 'Afterburner; makes your engines more powerful',
  'Cloaking device; makes you almost invisible, both on radar and on screen',
  'Sensor; enables you to see cloaked opponents more easily', 'Transporter; enables you to steal equipment from other players',
  'Tank; makes refueling quicker, increases maximum fuel capacity and can be jettisoned to confuse enemies',
  'Mine; can be dropped as a bomb or as a stationary mine',
  'Rocket; can be utilized as smart missile, heatseeking missile, nuclear missile or just a plain unguided missile (torpedo)',
  'ECM (Electronic Counter Measures); can be used to disturb electronic equipment, for instance can it be used to confuse smart missiles and reprogram robots to seek certain players',
  'Laser; limited range laser beam, costs a lot of fuel, having more laser items increases the range of the laser, they can be irrepairably damaged by ECMs',
  'Emergency Thrust; gives emergency thrust capabilities for a limited period',
  'Tractor Beam; gives mutual attractive force to currently locked on ship, this means the heavier your ship, the less likely you will move when being tractored or using a tractor',
  'Autopilot; when on, the ship will turn and thrust against the direction of travel',
  'EmergencyShield; gives emergency shield capabilities for a limited period', 'Deflector; pushes hostile objects away from your ship',
  'Hyperjump; enables you to teleport to a random map location', 'Phasing Device; lets you fly through anything for a limited period',
  'Mirror; reflects laser beams', 'Armor; absorbs shots in the absence of shields',
];

export const Item_get_text = (i: number): string => ITEM_TEXTS[i];

function Set_font(gc: GC, fontName: string, resName: string): XFontStruct {
  const font = X.XLoadQueryFont(G.dpy, fontName);
  if (!font) {
    error(`Couldn't find font '${fontName}' for ${resName}, using default font`);
    return X.XQueryFont(G.dpy, X.XGContextFromGC(gc));
  }
  X.XSetFont(G.dpy, gc, font.fid);
  return font;
}

function Init_disp_prop(win: number): void {
  X.XCreateBitmapFromData(G.dpy, win, hexBytes(ICON_BITS), 80, 100);
  X.XStoreName(G.dpy, win, 'XPilot NG');
  G.ProtocolAtom = X.XInternAtom(G.dpy, 'WM_PROTOCOLS', false);
  G.KillAtom = X.XInternAtom(G.dpy, 'WM_DELETE_WINDOW', false);
}

export function Init_top(): number {
  if (G.topWindow) fatal('Init_top called twice');
  if (Colors_init() === -1) return -1;
  // the geometry
  const geo = G.geometry !== null && G.geometry.length ? X.XParseGeometry(G.geometry) : { mask: 0, x: 0, y: 0, w: 0, h: 0 };
  G.top_width = geo.mask & X.WidthValue ? geo.w : DEF_TOP_WIDTH;
  G.top_width = LIMIT(G.top_width, MIN_TOP_WIDTH, MAX_TOP_WIDTH);
  G.top_height = geo.mask & X.HeightValue ? geo.h : DEF_TOP_HEIGHT;
  G.top_height = LIMIT(G.top_height, MIN_TOP_HEIGHT, MAX_TOP_HEIGHT);
  const dw = X.DisplayWidth(G.dpy, 0), dh = X.DisplayHeight(G.dpy, 0);
  const top_x = geo.mask & X.XValue ? (geo.mask & X.XNegative ? dw - G.top_width + geo.x : geo.x) : Math.trunc((dw - G.top_width) / 2);
  const top_y = geo.mask & X.YValue ? (geo.mask & X.YNegative ? dh - G.top_height + geo.y : geo.y) : Math.trunc((dh - G.top_height) / 2);
  G.geometry = null;
  let mask = X.CWBackPixel | X.CWBorderPixel;
  const sattr: X.XSetWindowAttributes = { background_pixel: G.colors[BLACK].pixel, border_pixel: G.colors[WHITE].pixel };
  if (G.ignoreWindowManager) mask |= X.CWOverrideRedirect;
  G.topWindow = X.XCreateWindow(G.dpy, X.DefaultRootWindow(G.dpy), top_x, top_y, G.top_width, G.top_height, 0, G.dispDepth,
    X.InputOutput, mask, sattr);
  X.XSelectInput(G.dpy, G.topWindow, X.KeyPressMask | X.KeyReleaseMask | X.FocusChangeMask | X.StructureNotifyMask);
  Init_disp_prop(G.topWindow);
  for (let i = 0; i < NUM_ITEMS; i++) G.itemBitmaps[i] = X.XCreateBitmapFromData(G.dpy, G.topWindow, hexBytes(ITEM_BITS[i]), ITEM_SIZE, ITEM_SIZE);
  const xgc: X.XGCValues = { line_width: 0, line_style: X.LineSolid, cap_style: X.CapButt, join_style: X.JoinMiter, graphics_exposures: false };
  const values = X.GCLineWidth | X.GCLineStyle | X.GCCapStyle | X.GCJoinStyle | X.GCGraphicsExposures;
  G.messageGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.radarGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.buttonGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.scoreListGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.textGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.talkGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.motdGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  G.gameGC = X.XCreateGC(G.dpy, G.topWindow, values, xgc);
  X.XSetBackground(G.dpy, G.gameGC, G.colors[BLACK].pixel);
  G.gameFont = Set_font(G.gameGC, G.gameFontName, 'gameFont');
  G.messageFont = Set_font(G.messageGC, G.messageFontName, 'messageFont');
  G.scoreListFont = Set_font(G.scoreListGC, G.scoreListFontName, 'scoreListFont');
  G.buttonFont = Set_font(G.buttonGC, G.buttonFontName, 'buttonFont');
  G.textFont = Set_font(G.textGC, G.textFontName, 'textFont');
  G.talkFont = Set_font(G.talkGC, G.talkFontName, 'talkFont');
  G.motdFont = Set_font(G.motdGC, G.motdFontName, 'motdFont');
  const W = X.WhitePixel(G.dpy, 0), B = X.BlackPixel(G.dpy, 0);
  X.XSetState(G.dpy, G.gameGC, W, B, X.GXcopy, X.AllPlanes);
  X.XSetState(G.dpy, G.radarGC, W, B, X.GXcopy, X.AllPlanes);
  X.XSetState(G.dpy, G.messageGC, W, B, X.GXcopy, X.AllPlanes);
  X.XSetState(G.dpy, G.buttonGC, W, B, X.GXcopy, X.AllPlanes);
  X.XSetState(G.dpy, G.scoreListGC, W, B, X.GXcopy, X.AllPlanes);
  return 0;
}

const BUTTON_WIDTH = 84;

export function Init_playing_windows(): number {
  if (!G.topWindow) if (Init_top()) return -1;
  Scale_dashes();
  G.draw_width = G.top_width - (256 + 2);
  G.draw_height = G.top_height;
  G.drawWindow = X.XCreateSimpleWindow(G.dpy, G.topWindow, 258, 0, G.draw_width, G.draw_height, 0, 0, G.colors[BLACK].pixel);
  G.radarWindow = X.XCreateSimpleWindow(G.dpy, G.topWindow, 0, 0, 256, G.RadarHeight, 0, 0, G.colors[BLACK].pixel);
  G.radar_score_mapped = true;
  G.ButtonHeight = G.buttonFont.ascent + G.buttonFont.descent + 2 * BTN_BORDER;
  G.button_form = Widget_create_form(0, G.topWindow, 0, G.RadarHeight, 256, G.ButtonHeight + 2, 0);
  Widget_create_activate(G.button_form, 0 + 0 * BUTTON_WIDTH, 0, BUTTON_WIDTH, G.ButtonHeight, 1, 'QUIT', Quit_callback, null);
  Widget_create_activate(G.button_form, 1 + 1 * BUTTON_WIDTH, 0, BUTTON_WIDTH, G.ButtonHeight, 1, 'ABOUT', About_callback, null);
  const menu_button = Widget_create_menu(G.button_form, 2 + 2 * BUTTON_WIDTH, 0, BUTTON_WIDTH, G.ButtonHeight, 1, 'MENU');
  Widget_add_pulldown_entry(menu_button, 'KEYS', Keys_callback, null);
  Widget_add_pulldown_entry(menu_button, 'CONFIG', () => { Config(true, CONFIG_DEFAULT); return 0; }, null);
  Widget_add_pulldown_entry(menu_button, 'COLORS', () => { Config(true, CONFIG_COLORS); return 0; }, null);
  Widget_add_pulldown_entry(menu_button, 'SCORE', () => {
    Config(false, CONFIG_NONE);
    if (G.showUserName) { G.showUserName = false; G.scoresChanged = 1; }
    return 0;
  }, null);
  Widget_add_pulldown_entry(menu_button, 'PLAYER', () => {
    Config(false, CONFIG_NONE);
    if (!G.showUserName) { G.showUserName = true; G.scoresChanged = 1; }
    return 0;
  }, null);
  Widget_add_pulldown_entry(menu_button, 'MOTD', Motd_callback, null);
  Widget_map_sub(G.button_form);
  G.players_width = G.RadarWidth;
  G.players_height = G.top_height - (G.RadarHeight + G.ButtonHeight + 2);
  G.playersWindow = X.XCreateSimpleWindow(G.dpy, G.topWindow, 0, G.RadarHeight + G.ButtonHeight + 2, G.players_width, G.players_height,
    0, 0, G.colors[G.windowColor].pixel);
  X.XSelectInput(G.dpy, G.radarWindow, X.ExposureMask);
  X.XSelectInput(G.dpy, G.playersWindow, X.ExposureMask);
  X.XSelectInput(G.dpy, G.drawWindow, X.ButtonPressMask | X.ButtonReleaseMask);
  if (G.dbuf_state!.type === PIXMAP_COPY) {
    G.radarPixmap = X.XCreatePixmap(G.dpy, G.radarWindow, 256, G.RadarHeight, G.dispDepth);
    G.radarPixmap2 = X.XCreatePixmap(G.dpy, G.radarWindow, 256, G.RadarHeight, G.dispDepth);
    G.drawPixmap = X.XCreatePixmap(G.dpy, G.drawWindow, G.draw_width, G.draw_height, G.dispDepth);
  } else {
    G.radarPixmap2 = G.radarWindow;
    G.radarPixmap = G.radarWindow;
    G.drawPixmap = G.drawWindow;
    Paint_sliding_radar();
  }
  // a blank cursor for pointer control
  const pix = X.XCreatePixmap(G.dpy, G.drawWindow, 1, 1, 1);
  const cursorGC = X.XCreateGC(G.dpy, pix, 0, null);
  X.XSetForeground(G.dpy, cursorGC, 0);
  X.XFillRectangle(G.dpy, pix, cursorGC, 0, 0, 1, 1);
  X.XFreeGC(G.dpy, cursorGC);
  G.pointerControlCursor = X.XCreatePixmapCursor(G.dpy);
  X.XFreePixmap(G.dpy, pix);
  X.XMapSubwindows(G.dpy, G.topWindow);
  X.XMapWindow(G.dpy, G.topWindow);
  X.XSync(G.dpy, false);
  Init_spark_colors();
  return 0;
}

function Quit_callback(): number {
  G.quitting = true;
  return 0;
}

export function Raise_window(): void {
  X.XMapRaised(G.dpy, G.topWindow);
}

export function Resize(w: number, width: number, height: number): void {
  if (w !== G.topWindow) return;
  width = LIMIT(width, MIN_TOP_WIDTH, MAX_TOP_WIDTH);
  height = LIMIT(height, MIN_TOP_HEIGHT, MAX_TOP_HEIGHT);
  G.top_width = width;
  G.top_height = height;
  if (!G.drawWindow) return;
  G.draw_width = G.radar_score_mapped ? G.top_width - 258 : G.top_width;
  G.draw_height = G.top_height;
  Check_view_dimensions();
  Net_flush();
  X.XResizeWindow(G.dpy, G.drawWindow, G.draw_width, G.draw_height);
  if (G.dbuf_state!.type === PIXMAP_COPY) {
    X.XFreePixmap(G.dpy, G.drawPixmap);
    G.drawPixmap = X.XCreatePixmap(G.dpy, G.drawWindow, G.draw_width, G.draw_height, G.dispDepth);
  }
  G.players_height = G.top_height - (G.RadarHeight + G.ButtonHeight + 2);
  X.XResizeWindow(G.dpy, G.playersWindow, G.players_width, G.players_height);
  Talk_resize();
  Config_resize();
}

export function Platform_specific_cleanup(): void {
  if (G.dpy !== null && G.topWindow) {
    Colors_cleanup();
  }
  Widget_cleanup();
}

export function Scale_dashes(): void {
  if (G.dpy === null) return;
  G.dashes[0] = Math.max(1, WINSCALE(8)) & 0xff;
  G.dashes[1] = Math.max(1, WINSCALE(4)) & 0xff;
  G.cdashes[0] = Math.max(1, WINSCALE(3)) & 0xff;
  G.cdashes[1] = Math.max(1, WINSCALE(9)) & 0xff;
  X.XSetDashes(G.dpy, G.gameGC, 0, G.dashes, NUM_DASHES);
}
