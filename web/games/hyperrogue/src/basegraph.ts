// basegraph.cpp of HyperRogue 13.1o. Stage 1 ported the message log (package P2): msginfo, msgs, gamelog,
// flashMessages, fullmsg, addMessageToLog, clearMessages, addMessage. Stage 2: display_data's methods and the
// non-GL projection calls (package D1); fonts, textwidth, displaystr/displayfr/displaychr, the messages on the
// screen (drawmessages), drawCircle, the buttons, calcfps, initialize_all (package U1; the text goes through the
// SDL_ttf shim src/sdlttf.ts). The window (init_graph, setvideomode, the screen settings: package U3), the GL font
// and the GL setup are not here. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G, type display_data, pconf } from './globals.ts';
import { isize, among, hr_exception } from './hyper.ts';
import { idiv, itrunc } from './cpp.ts';
import { GDIM, mdBall, sphere, euclid, mhybrid } from './classes.ts';
import { TTF_Init, TTF_Quit, TTF_OpenFont, TTF_SizeUTF8, TTF_RenderUTF8_Blended, TTF_RenderUTF8_Solid, SDL_BlitSurface,
  SDL_FreeSurface, SDL_OrText_anaglyph, type TTF_Font } from './sdlttf.ts';
import { sdl_srend, filledCircleColor, aacircleColor, circleColor, filledEllipseColor, ellipseColor, SDL_FillSurfaceRect } from './sdlgfx.ts';
import { part, gradient, align } from './colors.ts';
import { flip_sphere } from './hypgraph.ts';
import { in_perspective } from './graph.ts';
import { hud_margin, preparesort } from './hud.ts';
import { loadConfig, lang } from './config.ts';
import { cgi, check_cgi } from './geometry.ts';

/** #define AA_NOGL 1, AA_FONT 32 (hyper.h) */
export const AA_NOGL = 1, AA_FONT = 32;
import { getDistLimit } from './cell.ts';
import { time } from './cpp.ts';
import { changes } from './pcmove.ts';
import { its } from './hprint.ts';
import { getgametime } from './quit.ts';
import { NotPorted } from './hyper.ts';
import { sdl_window } from './sdl.ts';
import { initConfig } from './config.ts';
import { restartGraph } from './graph.ts';
import { arg_read } from './commandline.ts';
import { initAudio } from './sound.ts';

/** struct msginfo */
export class msginfo {
  stamp = 0;
  rtstamp = 0;
  gtstamp = 0;
  turnstamp = 0;
  /** char flashout */
  flashout = 0;
  /** char spamtype */
  spamtype = 0;
  quantity = 0;
  msg = '';

  clone(): msginfo {
    const m = new msginfo();
    m.stamp = this.stamp; m.rtstamp = this.rtstamp; m.gtstamp = this.gtstamp; m.turnstamp = this.turnstamp;
    m.flashout = this.flashout; m.spamtype = this.spamtype; m.quantity = this.quantity; m.msg = this.msg;
    return m;
  }
}

export function flashMessages(): void {
  const msgs = G.msgs;
  for (let i = 0; i < isize(msgs); i++)
    if (msgs[i].stamp < G.ticks - 1000 && !msgs[i].flashout) {
      msgs[i].flashout = 1;
      msgs[i].stamp = G.ticks;
    }
}

export function fullmsg(m: msginfo): string {
  let s = m.msg;
  if (m.quantity > 1) s += ' (x' + its(m.quantity) + ')';
  return s;
}

function addMessageToLog(m: msginfo, log: msginfo[]): void {
  if (isize(log) !== 0) {
    const last = log[isize(log) - 1];
    if (last.msg === m.msg) {
      const q = m.quantity + last.quantity;
      log[isize(log) - 1] = m.clone(); log[isize(log) - 1].quantity = q;
      return;
    }
  }
  if (isize(log) < 1000)
    log.push(m.clone());
  else {
    // for(int i=0; i<isize(log)-1; i++) swap(log[i], log[i+1]); log[isize(log)-1] = m;
    for (let i = 0; i < isize(log) - 1; i++) { const t = log[i]; log[i] = log[i + 1]; log[i + 1] = t; }
    log[isize(log) - 1] = m.clone();
  }
}

export function clearMessages(): void { G.msgs.length = 0; }

/** addMessage(string s, char spamtype IS(0)) */
export function addMessage(s: string, spamtype = 0): void {
  if (changes.on) { changes.at_commit(() => addMessage(s, spamtype)); return; }
  // DEBB(debug_messages, ("addMessage: ", s));

  const m = new msginfo();
  m.msg = s; m.spamtype = spamtype; m.flashout = 0; m.stamp = G.ticks;
  m.rtstamp = time();
  m.gtstamp = getgametime();
  m.turnstamp = G.turncount;
  m.quantity = 1;

  addMessageToLog(m, G.gamelog);
  addMessageToLog(m, G.msgs);
}

// --- added by P8 (system.ts): the rest of basegraph.cpp is graphics (a later stage); STAGE1-STUB ---

/** void initialize_all(): initConfig, restartGraph; without a GUI only arg::read(2); with one also preparesort,
 *  the configuration file, the window (init_graph: package U3), the shapes' basics and the fonts */
export function initialize_all(): void {
  // DEBBI(debug_init || debug_graph, ("initialize_all"));

  initConfig();

  // CAP_SDLJOY: joyx = joyy = 0; joydir.d = -1; (joysticks: not in the browser)

  restartGraph();

  if (G.noGUI) {
    // CAP_COMMANDLINE
    arg_read(2);
    return;
  }

  preparesort();
  // CAP_CONFIG
  loadConfig();
  // CAP_ARCM: arcm::current.parse(); (archimedean tilings: stage 3)
  if (mhybrid()) throw new NotPorted('initialize_all: hybrid geometries'); // STAGE2-STUB (geometry = hybrid::underlying)

  // CAP_COMMANDLINE
  arg_read(2);

  init_graph();
  check_cgi();
  cgi().require_basics();

  init_font();

  // CAP_SDLJOY initJoysticks_async(); (no SDL joysticks in the browser)
  // CAP_SDLAUDIO
  initAudio();
}

// --- stage 2, package U3: the window. The window is the canvas, sized by the page (src/sdl.ts sdl_window, in
// device pixels): the display (vid.xscr/yscr) and the window are both the canvas, as in the Emscripten build
// (ISWEB: get_canvas_size), and the window follows the page's size; the window size settings of the
// configuration have no effect. No GL: vid.usingGL stays false (PORTING-STAGE2.md, section 2). ---

// EX bool graphics_on: G.graphics_on
/** EX bool request_resolution_change */
let request_resolution_change = false;
export function do_request_resolution_change(): void { request_resolution_change = true; }

/** bool want_vsync() (no VR) */
export function want_vsync(): boolean { return G.vid.want_vsync; }

/** bool need_to_reopen_window() */
export function need_to_reopen_window(): boolean {
  const vid = G.vid;
  if (vid.want_antialias !== vid.antialias) return true;
  if (vid.wantGL !== vid.usingGL) return true;
  if (want_vsync() !== vid.current_vsync) return true;
  if (request_resolution_change) return true;
  return false;
}

/** bool need_to_apply_screen_settings() */
export function need_to_apply_screen_settings(): boolean {
  if (need_to_reopen_window()) return true;
  if (G.vid.want_fullscreen !== G.vid.full) return true;
  const [x, y] = get_requested_resolution();
  if (G.vid.xres !== x || G.vid.yres !== y) return true;
  return false;
}

/** void close_renderer() / close_window(): the canvas stays (the page owns it) */
export function close_renderer(): void { }
export function close_window(): void { close_renderer(); }

/** void apply_screen_settings() */
export function apply_screen_settings(): void {
  if (!need_to_apply_screen_settings()) return;
  if (!G.graphics_on) return;

  close_renderer();
  // CAP_VR: no

  G.graphics_on = false;
  // android_settings_changed();
  init_graph();
  // CAP_GL: no GL
}

/** pair<int, int> get_requested_resolution(): the canvas (as ISMOBILE || ISFAKEMOBILE returns the window's own
 *  size: the page decides it) */
export function get_requested_resolution(): [number, number] {
  return [sdl_window.w, sdl_window.h];
}

/** EX bool resizable = true */
export const resizable = true;

/** void setvideomode() */
export function setvideomode(): void {
  // DEBBI(debug_graph || debug_init, ("setvideomode"));
  const vid = G.vid;

  vid.full = vid.want_fullscreen;

  [vid.xres, vid.yres] = get_requested_resolution();

  compute_fsize();

  vid.antialias = vid.want_antialias;

  // CAP_GL: vid.usingGL = vid.wantGL; -- the port draws with the software renderer (no GL)
  vid.usingGL = false;
  vid.current_vsync = want_vsync();

  // create_win(): the window is the canvas; SDL_GetCurrentRenderOutputSize = the canvas size
  [vid.xres, vid.yres] = [sdl_window.w, sdl_window.h];
  if (!vid.xres || !vid.yres) {
    addMessage('Failed to set the graphical mode: ' + its(vid.xres) + 'x' + its(vid.yres) + (vid.full ? ' fullscreen' : ' windowed'));
    vid.xres = 640;
    vid.yres = 480;
  }
  request_resolution_change = false;
}

// EX bool noGUI = false: G.noGUI
/** EX bool sdl_on */
let sdl_on = false;

/** void init_graph() */
export function init_graph(): void {
  // CAP_SDL
  sdl_on = true; // SDL_Init1(SDL_INIT_VIDEO)

  // ISWEB: get_canvas_size(): the display is the canvas
  G.vid.xscr = G.vid.xres = sdl_window.w;
  G.vid.yscr = G.vid.yres = sdl_window.h;

  G.graphics_on = true;

  setvideomode();
}

/** quit_all(): closes the window and SDL */
export function quit_all(): void {
  // DEBBI(debug_init, ("quit_all"));
  // CAP_SDLJOY: closeJoysticks(); (no SDL joysticks)
  close_window();
  sdl_on = false;
}
export function sdl_is_on(): boolean { return sdl_on; }

/** subscreens::prepare(): the split-screen displays of several players (graphics) */
export function subscreens_prepare(): void { } // STAGE1-STUB (graphics)

// --- stage 2, package D1: display_data's methods, the non-GL projection calls, the sight range. The rest of
// basegraph.cpp (fonts, text, the screen stack, the window) is package U1's. ---

/** enum eStereo { sOFF, sAnaglyph, sLR, sODS, sPanini, sStereographic, sEquirectangular, sCylindrical } (hyper.h) */
export const sOFF = 0, sAnaglyph = 1, sLR = 2, sODS = 3, sPanini = 4, sStereographic = 5, sEquirectangular = 6, sCylindrical = 7;

/** bool display_data::in_anaglyph() */
export function display_data_in_anaglyph(_dd: display_data): boolean { return G.vid.stereo_mode === sAnaglyph; }
/** bool display_data::separate_eyes() */
export function display_data_separate_eyes(_dd: display_data): boolean { return among(G.vid.stereo_mode, sAnaglyph, sLR); }
/** ld display_data::eyewidth() */
export function display_data_eyewidth(_dd: display_data): number {
  switch (G.vid.stereo_mode) {
    case sAnaglyph:
      return G.vid.anaglyph_eyewidth;
    case sLR:
      return G.vid.lr_eyewidth;
    default:
      return 0;
  }
}

/** void display_data::set_all(int ed, ld shift): the GL projection, mask and viewport (the oracle's gl* calls are
 *  no-ops; the port draws without GL) */
export function display_data_set_all(_dd: display_data, _ed: number, _shift: number): void { }

/** reset_projection() (CAP_GL: new_projection_needed = true; only set_all reads it) */
export function reset_projection(): void { }
/** bool model_needs_depth() (CAP_GL) */
export function model_needs_depth(): boolean { return GDIM() === 3 || G.vid.projection_config.model === mdBall; }
/** flagtype get_shader_flags() (shaders.cpp): the flags of the current GL program. The port has no GL program;
 *  0 is what !CAP_GL gives. (The oracle compiles programs against no-op gl* stubs: the flags are only read on GL
 *  paths, in perspective models and in non_spatial_model, which the default 2D view does not reach.) */
export function get_shader_flags(): bigint { return 0n; }

/** int get_sightrange() */
export function get_sightrange(): number { return getDistLimit() + G.sightrange_bonus; }

/** void compute_fsize() (dual::split_or_do: one player) */
export function compute_fsize(): void {
  if (G.vid.relative_font)
    G.vid.fsize = Math.min(idiv(Math.imul(G.vid.yres, G.vid.fontscale), 3200), idiv(Math.imul(G.vid.xres, G.vid.fontscale), 4800));
  else
    G.vid.fsize = G.vid.abs_fsize;
  if (G.vid.fsize < 6) G.vid.fsize = 6;
}

// (drawCircle, displayfr, displayfrSP: package U1's section below)

/** bool subscreens::split(reaction_t what): the split screen of several players (multi::split_screen is off in
 *  stage 2: one player) */
export function subscreens_split(_what: () => void): boolean {
  // if(in) return false; (racing::in: never set in stage 2)
  if (!G.multi_split_screen) return false;
  throw new NotPorted('subscreens::split (several players: stage 3)'); // STAGE2-STUB
}

// --- stage 2, package U1: fonts, text, messages, circles and buttons on the screen (CAP_SDLTTF, SDL2, not GL:
// the port draws with the non-GL renderer, PORTING-STAGE2.md section 2). The GL font (CAP_GLFONT: glfont_t,
// init_glfont, gl_print, gl_width, getnext) is not reached: vid.usingGL stays false. ---

/** int utfsize(char c): the length of the UTF-8 sequence that starts with byte c. The port's strings are UTF-16:
 *  the length (in code units) of the character that starts at s[pos] (2 for a surrogate pair) */
export function utfsize(s: string, pos: number): number {
  const c = s.charCodeAt(pos);
  return c >= 0xD800 && c < 0xDC00 ? 2 : 1;
}

/** int utfsize_before(const string& s, int pos): the length of the character that ends before pos (UTF-16, as
 *  utfsize) */
export function utfsize_before(s: string, pos: number): number {
  if (!pos) return 0;
  let npos = pos - 1;
  while (npos && s.charCodeAt(npos) >= 0xDC00 && s.charCodeAt(npos) < 0xE000) npos--;
  return pos - npos;
}

/** pair<int, int> unicode_value(const string& s, int i): the codepoint at s[i] and the index after it */
export function unicode_value(s: string, i: number): [number, number] {
  const u = s.codePointAt(i)!;
  return [u, i + (u >= 0x10000 ? 2 : 1)];
}

/** constexpr int max_glfont_size = 72, max_font_size = 288 */
export const max_glfont_size = 72;
export const max_font_size = 288;

/** void fix_font_size(int& size): returns the fixed size */
export function fix_font_size(size: number): number {
  if (size < 1) size = 1;
  if (size > max_font_size) size = max_font_size;
  if (size > 72) size &= ~3;
  if (size > 144) size &= ~7;
  return size;
}

/** vector<string> font_filenames */
export const font_filenames = [
  'DejaVuSans-Bold.ttf',
  'DejaVuSans.ttf',
  'cmunss.ttf',
  'NotoSans-Regular.ttf',
  'OpenDyslexic3-Regular.ttf',
  'font.ttf',
  'font.otf',
];

/** vector<pair<string, string>> font_names */
export const font_names: [string, string][] = [
  ['DejaVu Sans Bold', ''],
  ['DejaVu Sans', ''],
  ['Computer Modern Sans', ''],
  ['Noto Sans', 'note: if using the Chinese translation, Noto Sans will override the options above it'],
  ['OpenDyslexic3-Regular', ''],
  ['TTF font', ''],
  ['OTF font', ''],
];

/** struct fontdata: a font file and its TTF_Fonts by size (the GL fonts and their textures: not in the port) */
export class fontdata {
  filename = '';
  // FONTCONFIG: use_fontconfig (no fontconfig in the browser)
  font: (TTF_Font | null)[] = new Array<TTF_Font | null>(max_font_size + 1).fill(null);
}

/** fontdata* font_by_name(string fname) */
export function font_by_name(fname: string): fontdata {
  let fd = G.fontdatas.get(fname);
  if (!fd) { fd = new fontdata(); G.fontdatas.set(fname, fd); }
  if (fd.filename === '') {
    fd.filename = fname;
    for (let i = 0; i <= max_font_size; i++) fd.font[i] = null;
  }
  return fd;
}

/** void loadfont(int siz) */
function loadfont(siz: number): void {
  siz = fix_font_size(siz);
  const cfont = G.cfont!;
  if (!cfont.font[siz]) {
    // find_file: the browser's start code registers the font files by name (sdlttf.ts ttf_load_fonts)
    cfont.font[siz] = TTF_OpenFont(cfont.filename, siz);
    if (cfont.font[siz] === null) {
      // printf("error: Font file not found: %s\n", cfont->filename.c_str());
      if (G.font_id === 0) throw new hr_exception('font file not found');
      G.font_id = 0; set_cfont(); loadfont(siz);
    }
  }
}

/** int textwidth(int siz, const string &str): TTF_SizeUTF8's width */
export function textwidth(siz: number, str: string): number {
  if (str.length === 0) return 0;

  // CAP_SDLTTF
  siz = fix_font_size(siz);
  loadfont(siz);

  return TTF_SizeUTF8(G.cfont!.font[siz]!, str).w;
}

/** bool displaystr(int x, int y, int shift, int size, const char *str, color_t color, int align): the text blitted
 *  onto the window (sdlttf.ts); returns whether the mouse is on it */
export function displaystr(x: number, y: number, shift: number, size: number, str: string, color: number, align: number): boolean {

  if (str.length === 0) return false;

  if (size < 4 || size > 2000) {
    return false;
  }

  // CAP_GLFONT: if(vid.usingGL) return gl_print(...): the port draws without GL
  if (G.vid.usingGL) throw new NotPorted('displaystr: gl_print (GL)'); // STAGE2-STUB (GL)

  const col = { r: (color >>> 16) & 255, g: (color >>> 8) & 255, b: (color >>> 0) & 255, a: 255 };

  col.r >>= G.darken; col.g >>= G.darken; col.b >>= G.darken;

  size = fix_font_size(size);
  loadfont(size);

  const txt = ((G.vid.antialias & AA_FONT) ? TTF_RenderUTF8_Blended : TTF_RenderUTF8_Solid)(G.cfont!.font[size]!, str, col);

  if (txt === null) return false;

  const rect = { x: 0, y: 0, w: txt.w, h: txt.h };

  rect.x = x - idiv(rect.w * align, 16);
  rect.y = y - idiv(rect.h, 2);

  const clicked = (G.mousex >= rect.x && G.mousey >= rect.y && G.mousex <= rect.x + rect.w && G.mousey <= rect.y + rect.h);

  if (shift) {
    // the text's pixels ORed into the window in red and cyan, shifted (src/sdlttf.ts; added by U2: inv::show)
    SDL_OrText_anaglyph(txt, rect, shift, color);
  }
  else {
    SDL_BlitSurface(txt, rect);
  }
  SDL_FreeSurface(txt);

  return clicked;
}

/** bool displayfrSP(int x, int y, int sh, int b, int size, const string &s, color_t color, int align, int p): the
 *  text with an outline of colour p (eight shifted copies) */
export function displayfrSP(x: number, y: number, _sh: number, b: number, size: number, s: string, color: number, align: number, p: number): boolean {
  if (b) {
    displaystr(x - b, y, 0, size, s, p, align);
    displaystr(x + b, y, 0, size, s, p, align);
    displaystr(x, y - b, 0, size, s, p, align);
    displaystr(x, y + b, 0, size, s, p, align);
  }
  if (b >= 2) {
    const b1 = b - 1;
    displaystr(x - b1, y - b1, 0, size, s, p, align);
    displaystr(x - b1, y + b1, 0, size, s, p, align);
    displaystr(x + b1, y - b1, 0, size, s, p, align);
    displaystr(x + b1, y + b1, 0, size, s, p, align);
  }
  return displaystr(x, y, 0, size, s, color, align);
}

/** bool displayfr(int x, int y, int b, int size, const string &s, color_t color, int align): with the outline of
 *  poly_outline */
export function displayfr(x: number, y: number, b: number, size: number, s: string, color: number, align: number): boolean {
  return displayfrSP(x, y, 0, b, size, s, color, align, G.poly_outline >>> 8);
}

/** bool displaychr(int x, int y, int shift, int size, char chr, color_t col) */
export function displaychr(x: number, y: number, shift: number, size: number, chr: string, col: number): boolean {
  return displaystr(x, y, shift, size, chr, col, 8);
}

/** color_t colormix(color_t a, color_t b, color_t c) */
export function colormix(a: number, b: number, c: number): number {
  for (let p = 0; p < 3; p++) {
    const v = (part(a, p) + idiv((part(b, p) - part(a, p)) * part(c, p), 255)) & 0xFF;
    a = ((a & ~(0xFF << (8 * p))) | (v << (8 * p))) >>> 0;
  }
  return a;
}

/** int color_diff(color_t a, color_t b): colour difference for 24-bit colours, from 0 to 255*3 */
export function color_diff(a: number, b: number): number {
  let res = 0;
  for (let i = 0; i < 3; i++) res += Math.abs(part(a, i) - part(b, i));
  return res;
}

/** int rhypot(int a, int b) */
export function rhypot(a: number, b: number): number { return itrunc(Math.sqrt(Math.imul(a, a) - Math.imul(b, b))); }

/** ld realradius() */
export function realradius(): number {
  let vradius = G.current_display.radius;
  if (sphere()) {
    if (flip_sphere())
      vradius /= Math.sqrt(pconf().alpha * pconf().alpha - 1);
    else
      vradius = 1e12; // use the following
  }
  if (euclid())
    vradius = G.current_display.radius * get_sightrange() / (1 + pconf().alpha) / 2.5;
  vradius = Math.min(vradius, Math.min(G.vid.xres, G.vid.yres) / 2);
  return vradius;
}

/** void drawmessage(const string& s, int& y, color_t col): returns the new y */
export function drawmessage(s: string, y: number, col: number): number {
  if (G.nomsg) return y;
  const cd = G.current_display, vid = G.vid;
  const rrad = itrunc(realradius());
  let space: number;
  if (G.dual_state || G.nomap || in_perspective())
    space = vid.xres;
  else if (y > cd.ycenter + rrad * pconf().stretch)
    space = vid.xres;
  else if (y > cd.ycenter)
    space = cd.xcenter - rhypot(rrad, itrunc((y - cd.ycenter) / pconf().stretch));
  else if (y > cd.ycenter - vid.fsize)
    space = cd.xcenter - rrad;
  else if (y > cd.ycenter - vid.fsize - rrad * pconf().stretch)
    space = cd.xcenter - rhypot(rrad, itrunc((cd.ycenter - vid.fsize - y) / pconf().stretch));
  else
    space = vid.xres;

  if (textwidth(vid.fsize, s) <= space) {
    displayfr(0, y, 1, vid.fsize, s, col, 0);
    y -= vid.fsize;
    return y;
  }

  for (let i = 1; i < s.length; i++)
    if (s[i - 1] === ' ' && textwidth(vid.fsize, '... ' + s.substring(i)) <= space) {
      displayfr(0, y, 1, vid.fsize, '... ' + s.substring(i), col, 0);
      y -= vid.fsize;
      y = drawmessage(s.substring(0, i - 1), y, col);
      return y;
    }

  // no chance
  displayfr(0, y, 1, vid.fsize, s, col, 0);
  y -= vid.fsize;
  return y;
}

/** void drawmessages() */
export function drawmessages(): void {
  // DEBBI(debug_graph, ("draw messages"));
  const msgs = G.msgs, vid = G.vid;
  let i = 0;
  const t = G.ticks;
  for (let j = 0; j < isize(msgs); j++) {
    if (j < isize(msgs) - vid.msglimit) continue;
    const age = msgs[j].flashout * (t - msgs[j].stamp);
    if (msgs[j].spamtype) {
      for (let i = j + 1; i < isize(msgs); i++) if (msgs[i].spamtype === msgs[j].spamtype)
        msgs[j].flashout = 2;
    }
    if (age < 256 * vid.flashtime)
      msgs[i++] = msgs[j].clone();
  }
  msgs.length = i;
  if (vid.msgleft === 2) {
    let y = vid.yres - vid.fsize - hud_margin(1);
    for (let j = isize(msgs) - 1; j >= 0; j--) {
      const age = msgs[j].flashout * (t - msgs[j].stamp);
      G.poly_outline = (gradient(G.bordcolor, G.backcolor, 0, age, 256 * vid.flashtime) << 8) >>> 0;
      const col = gradient(G.forecolor, G.backcolor, 0, age, 256 * vid.flashtime);
      y = drawmessage(fullmsg(msgs[j]), y, col);
    }
  }
  else {
    for (let j = 0; j < isize(msgs); j++) {
      const age = msgs[j].flashout * (t - msgs[j].stamp);
      const x = vid.msgleft ? 0 : idiv(vid.xres, 2);
      const y = vid.yres - vid.fsize * (isize(msgs) - j) - 0; // (ISIOS ? 4 : 0)
      G.poly_outline = (gradient(G.bordcolor, G.backcolor, 0, age, 256 * vid.flashtime) << 8) >>> 0;
      displayfr(x, y, 1, vid.fsize, fullmsg(msgs[j]), gradient(G.forecolor, G.backcolor, 0, age, 256 * vid.flashtime), vid.msgleft ? 0 : 8);
    }
  }
}

/** void drawCircle(int x, int y, int size, color_t color, color_t fillcolor IS(0)): CAP_SDLGFX (the GL branch is
 *  not reached: vid.usingGL stays false) */
export function drawCircle(x: number, y: number, size: number, color: number, fillcolor = 0): void {
  if (size < 0) size = -size;
  if (G.vid.usingGL) throw new NotPorted('drawCircle (GL)'); // STAGE2-STUB (GL)

  // CAP_SDLGFX
  const srend = sdl_srend();
  if (pconf().stretch === 1) {
    if (fillcolor) filledCircleColor(srend, x, y, size, fillcolor);
    if (color) ((G.vid.antialias && AA_NOGL) ? aacircleColor : circleColor)(srend, x, y, size, align(color));
  }
  else {
    if (fillcolor) filledEllipseColor(srend, x, y, size, itrunc(size * pconf().stretch), fillcolor);
    if (color) ellipseColor(srend, x, y, size, itrunc(size * pconf().stretch), align(color)); // (aaellipseColor: the canvas antialiases)
  }
}

/** void displayButton(int x, int y, const string& name, int key, int align, int rad IS(0)) */
export function displayButton(x: number, y: number, name: string, key: number, align: number, rad = 0): void {
  if (displayfr(x, y, rad, G.vid.fsize, name, 0x808080, align)) {
    displayfr(x, y, rad, G.vid.fsize, name, 0xFFFF00, align);
    G.getcstat = key;
  }
}

/** #define SETMOUSEKEY 5000 */
export const SETMOUSEKEY = 5000;

/** void displaymm(char c, int x, int y, int rad, int size, const string& title, int align) */
export function displaymm(c: number, x: number, y: number, rad: number, size: number, title: string, align: number): void {
  if (displayfr(x, y, rad, size, title, c === G.mousekey ? 0xFF8000 : 0xC0C0C0, align)) {
    displayfr(x, y, rad, size, title, 0xFFFF00, align);
    G.getcstat = SETMOUSEKEY; G.newmousekey = c;
  }
}

/** bool displayButtonS(int x, int y, const string& name, color_t col, int align, int size) */
export function displayButtonS(x: number, y: number, name: string, col: number, align: number, size: number): boolean {
  if (displaystr(x, y, 0, size, name, col, align)) {
    displaystr(x, y, 0, size, name, 0xFFFF00, align);
    return true;
  }
  else return false;
}

/** void displayColorButton(int x, int y, const string& name, int key, int align, int rad, color_t color, color_t color2 IS(0)) */
export function displayColorButton(x: number, y: number, name: string, key: number, align: number, rad: number, color: number, color2 = 0): void {
  if (displayfr(x, y, rad, G.vid.fsize, name, color, align)) {
    if (color2) displayfr(x, y, rad, G.vid.fsize, name, color2, align);
    G.getcstat = key;
  }
}

/** ld textscale() */
export function textscale(): number {
  return G.vid.fsize / (G.current_display.radius * cgi().crossf) * (1 + pconf().alpha) * 2;
}

/** void set_cfont(): the font of font_id; Chinese (lang() == 8) has Noto Sans in place of the first three */
export function set_cfont(): void {
  let f = G.font_id;
  let fch = f;
  if (among(f, 0, 1, 2)) fch = 3;
  if (lang() === 8) f = fch;
  G.cfont = font_by_name(font_filenames[G.last_font_id = f]);
  G.cfont_chinese = font_by_name(font_filenames[fch]);
}

/** void init_font() */
export function init_font(): void {
  // CAP_SDLTTF
  if (TTF_Init() < 0) {
    // printf("Failed to initialize TTF.\n");
    throw new hr_exception('Failed to initialize TTF.');
  }
  set_cfont();
}

/** void close_font() */
export function close_font(): void {
  G.fontdatas.clear();
  // CAP_SDLTTF
  TTF_Quit();
}

/** void present_screen() (CAP_SDL, not GL: present_surface, i.e. SDL_UpdateTexture + SDL_RenderCopy +
 *  SDL_RenderPresent of the window surface): the port draws on the canvas directly, there is nothing to present */
export function present_screen(): void { }

/** SDL_FillSurfaceRect(s, NULL, col): the window surface (the canvas) filled with col (0xRRGGBB); for graph.cpp's
 *  drawscreen */
export function sdl_fill_screen(col: number): void { SDL_FillSurfaceRect(sdl_srend(), null, col); }

/** int calcfps(): #define CFPS 30; static int last[CFPS], lidx */
const CFPS = 30;
const calcfps_last = new Array<number>(CFPS).fill(0);
let calcfps_lidx = 0;
export function calcfps(): number {
  const ct = G.ticks;
  const ret = ct - calcfps_last[calcfps_lidx];
  calcfps_last[calcfps_lidx] = ct;
  calcfps_lidx++; calcfps_lidx %= CFPS;
  if (ret === 0) return 0;
  return idiv(1000 * CFPS, ret);
}
