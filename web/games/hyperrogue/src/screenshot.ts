// screenshot.cpp of HyperRogue 13.1o: the SVG renderer (namespace svg). (C) Zeno Rogue, GPL-2.0-or-later;
// TypeScript port.
//
// Stage 2, package D1 (PORTING-STAGE2.md). The drawing oracle (re/hyperrogue/oracle, `svg` command) prints the
// original's SVG; the port's drawing goes through this same renderer in the tests, so the output must be the
// same text: the printf formats (%.1f, %.3f, %f: cpp.ts fmtF, glibc's rounding), fixgamma's float arithmetic,
// the order of the attributes.
//
// Ported: the output stream and the formatting (cta, invisible, fixgamma, coord, stylestr,
// startstring/stopstring), circle, text, polygon, render, and shot::take / default_screenshot_content (the
// `svg ... map` command of the oracle). Not in stage 2: the PNG screenshots (CAP_PNG is 0 in the oracle), WRL,
// the command line options (-svgshot etc.), the animation recorder and the screenshot menu.
// Names: svg::coord -> svg_coord etc. (PORTING.md, "Names"). svg::render(fname, what) writes no file: the text
// collects in svg_f.s and svg_render returns it (the caller writes it where it goes; the harness prints it).
import { G, pconf } from './globals.ts';
import { fmtF, fround, u8 } from './cpp.ts';
import { hyperbolic } from './classes.ts';
import { callhooks, NotPorted } from './hyper.ts';
import { get_sightrange, displayfr } from './basegraph.ts';
import { doOvergenerate } from './landgen.ts';
import { calcparam, gamescreen } from './graph.ts';
import { models_configure } from './models.ts';
import { drawStats } from './hud.ts';

/** svg::f: the output (fhstream to the file; the port collects the text, the caller writes it where it goes) */
export const svg_f = { s: [] as string[] };
const print = (...a: string[]): void => { svg_f.s.push(a.join('')); };
/** println(f, ...) */
export const svg_println = (...a: string[]): void => { svg_f.s.push(a.join('') + '\n'); };

/** ld cta(color_t col): the alpha byte as 0..1 */
export function svg_cta(col: number): number {
  // col >>= 24;
  col &= 0xFF;
  return col / 255.0;
}

/** bool invisible(color_t col) */
export function svg_invisible(col: number): boolean { return (col & 0xFF) === 0; }

/** void fixgamma(unsigned int& color): bytes 1..3 (B, G, R of 0xRRGGBBAA) as 255 * pow(float(c/255.0),
 *  float(shot::gamma)), in float (libstdc++'s pow(float, float) is powf), truncated to unsigned char */
export function svg_fixgamma(color: number): number {
  let r = color & 0xFF;
  for (let i = 1; i < 4; i++) {
    const c = (color >>> (8 * i)) & 0xFF;
    const p = fround(Math.pow(fround(c / 255.0), fround(G.shot_gamma))); // powf
    r |= u8(Math.trunc(fround(255 * p))) << (8 * i);
  }
  return r >>> 0;
}

/** const char* coord(int val): val in 1/divby pixels */
export function svg_coord(val: number): string {
  if (G.svg_divby === 1) return String(val);
  else if (G.svg_divby <= 10) return fmtF(val * 1. / G.svg_divby, 1);
  else return fmtF(val * 1. / G.svg_divby, 2);
}

/** char* stylestr(color_t fill, color_t stroke, ld width=1, string extrastyle = "") */
export function svg_stylestr(fill: number, stroke: number, width = 1, extrastyle = ''): string {
  fill = svg_fixgamma(fill);
  stroke = svg_fixgamma(stroke);
  // (if(stroke == 0xFF00FF && false) {...}: never)
  const hex6 = (c: number): string => ((c >>> 8) & 0xFFFFFF).toString(16).padStart(6, '0');
  return `style="stroke:#${hex6(stroke)};stroke-opacity:${fmtF(svg_cta(stroke), 3)};stroke-width:${fmtF(width / G.svg_divby, 6)}px;fill:#${hex6(fill)};fill-opacity:${fmtF(svg_cta(fill), 3)}${extrastyle}"`;
}

/** void startstring() */
export function svg_startstring(): void {
  if (G.svg_link !== '') print('<a xlink:href="', G.svg_link, '" xlink:show="replace">');
}

/** void stopstring() */
export function svg_stopstring(): void {
  if (G.svg_link !== '') print('</a>');
}

/** string font, fontstyle, tspan; ld text_width_multiplier; int min_text (svg::text) */
export const svg_font = { font: 'Times', fontstyle: '', tspan: '', text_width_multiplier: 1 / 40., min_text: 3 };

/** void circle(int x, int y, int size, color_t col, color_t fillcol, double linewidth) */
export function svg_circle(x: number, y: number, size: number, col: number, fillcol: number, linewidth: number): void {
  if (!svg_invisible(col) || !svg_invisible(fillcol)) {
    if (pconf().stretch === 1)
      svg_println("<circle cx='", svg_coord(x), "' cy='", svg_coord(y), "' r='", svg_coord(size), "' ", svg_stylestr(fillcol, col, linewidth), '/>');
    else // coord(size*pconf.stretch): the int parameter truncates
      svg_println("<ellipse cx='", svg_coord(x), "' cy='", svg_coord(y), "' rx='", svg_coord(size), "' ry='", svg_coord(Math.trunc(size * pconf().stretch)), "' ", svg_stylestr(fillcol, col), '/>');
  }
}

/** void text(int x, int y, int size, const string& str, bool frame, color_t col, int align) */
export function svg_text(x: number, y: number, size: number, str: string, frame: boolean, col: number, align: number): void {
  if (size < svg_font.min_text) return;

  const dd = G.current_display;
  let dfc = (x - dd.xcenter) * (x - dd.xcenter) +
    (y - dd.ycenter) * (y - dd.ycenter);
  dfc /= dd.radius;
  dfc /= dd.radius;
  // 0 = center, 1 = edge
  dfc = 1 - dfc;

  col = (0xFF + (col << 8)) >>> 0;

  const uselatex = svg_font.font === 'latex';

  if (!svg_invisible(col)) {
    svg_startstring();
    let str2 = '';
    for (let i = 0; i < str.length; i++)
      if (str[i] === '&')
        str2 += '&amp;';
      else if (str[i] === '<')
        str2 += '&lt;';
      else if (str[i] === '>')
        str2 += '&gt;';
      else if (uselatex && str[i] === '#')
        str2 += '\\#';
      else str2 += str[i];
    if (uselatex) str2 = '\\myfont{' + svg_coord(size) + '}{' + str2 + '}';

    // coord(y+size*.4): the int parameter truncates
    print("<text x='", svg_coord(x), "' y='", svg_coord(Math.trunc(y + size * .4)), "' text-anchor='", align === 8 ? 'middle' :
      align < 8 ? 'start' :
        'end', "' ");
    if (!uselatex)
      print("font-family='", svg_font.font, "' font-size='", svg_coord(size), "' ");
    if (svg_font.tspan !== '') str2 =
      '<tspan style="' + svg_font.tspan + '">' + str2 + '</tspan>';
    print(
      svg_stylestr(col, frame ? 0x0000000FF : 0, (1 << get_sightrange()) * dfc * svg_font.text_width_multiplier, svg_font.fontstyle),
      '>', str2, '</text>');
    svg_stopstring();
    svg_println();
  }
}

/** void polygon(int *polyx, int *polyy, int polyi, color_t col, color_t outline, double linewidth) */
export function svg_polygon(polyx: ArrayLike<number>, polyy: ArrayLike<number>, polyi: number, col: number, outline: number, linewidth: number): void {

  if (svg_invisible(col) && svg_invisible(outline)) return;
  if (polyi < 2) return;

  if (G.svg_remove_out) {
    let minx = polyx[0], miny = polyy[0];
    let maxx = minx, maxy = miny;
    for (let i = 0; i < polyi; i++) if (polyx[i] < minx) minx = polyx[i]; else if (polyx[i] > maxx) maxx = polyx[i];
    for (let i = 0; i < polyi; i++) if (polyy[i] < miny) miny = polyy[i]; else if (polyy[i] > maxy) maxy = polyy[i];
    if (maxx < 0 || maxy < 0 || minx > G.vid.xres || miny > G.vid.yres) return;
  }

  svg_startstring();
  const parts: string[] = [];
  for (let i = 0; i < polyi; i++) {
    if (i === 0)
      parts.push('<path d="M ');
    else
      parts.push(' L ');
    parts.push(svg_coord(polyx[i]), ' ', svg_coord(polyy[i]));
  }
  print(parts.join(''));

  print('" ', svg_stylestr(col, outline, (hyperbolic() ? G.current_display.radius : G.current_display.scrsize) * linewidth / 256), '/>');
  svg_stopstring();
  svg_println();
}

/** void render(const string& fname, const function<void()>& what IS(shot::default_screenshot_content)):
 *  returns the SVG text (the port writes no file) */
export function svg_render(what: () => void = shot_default_screenshot_content): string {
  const v2 = G.svg_in, v3 = G.vid.usingGL;
  G.svg_in = true;
  G.vid.usingGL = false;
  try {
    svg_f.s = [];

    svg_println('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="', svg_coord(G.vid.xres), '" height="', svg_coord(G.vid.yres), '">');
    if (!G.shot_transparent)
      svg_println('<rect width="', svg_coord(G.vid.xres), '" height="', svg_coord(G.vid.yres), '" ', svg_stylestr(((G.backcolor << 8) | 0xFF) >>> 0, 0, 0), '/>');
    what();
    svg_println('</svg>');

    const out = svg_f.s.join('');
    svg_f.s = [];
    return out;
  } finally { G.svg_in = v2; G.vid.usingGL = v3; } // (on an exception the text so far stays in svg_f.s)
}

// --- namespace shot (CAP_SHOT) ---

/** enum screenshot_format { png, svg, wrl, rawfile } */
export const shot_png = 0, shot_svg = 1, shot_wrl = 2, shot_rawfile = 3;

function set_shotx(): void {
  if (G.shot_shotformat === -1) return;
  G.shot_shotx = G.shot_shoty;
  if (G.shot_shotformat === 1) G.shot_shotx = (G.shot_shotx * 4 / 3) | 0;
  if (G.shot_shotformat === 2) G.shot_shotx = (G.shot_shotx * 16 / 9) | 0;
  if (G.shot_shotformat === 3) {
    G.shot_shotx = (G.shot_shotx * 22 / 16) | 0;
    while (G.shot_shotx & 15) G.shot_shotx++;
  }
}

export function shot_default_screenshot_content(): void {

  gamescreen();

  if (G.shot_caption !== '')
    displayfr((G.vid.xres / 2) | 0, G.vid.fsize + ((G.vid.fsize / 4) | 0), 3, G.vid.fsize * 2, G.shot_caption, G.forecolor, 8);
  callhooks(G.hooks_hqshot);
  drawStats();
}

/** void take(string fname, const function<void()>& what IS(default_screenshot_content)): the SVG format (CAP_PNG
 *  is 0 in the oracle, WRL is stage 3); returns the SVG text ('' for the other formats) */
export function shot_take(what: () => void = shot_default_screenshot_content): string {

  if (G.cheater) doOvergenerate();

  // CAP_SVG
  const multiplier = (G.shot_format === shot_svg) ? G.svg_divby : G.shot_aa;

  // anims::aps (the animated parameters: CAP_ANIMATIONS, none in stage 2): anim_unchanged / anim_restore

  const vn = G.nohud, v2 = G.inHighQual, v6 = G.auraNOGL, v = G.vid.clone(), v7 = G.cmode;
  G.nohud = G.nohud || G.hide_hud;
  G.inHighQual = true;
  G.auraNOGL = true;
  G.cmode = 0n;
  let out = '';
  try {
    G.vid.smart_range_detail *= multiplier;
    G.darken = 0;

    set_shotx();
    G.vid.xres = G.shot_shotx * multiplier;
    G.vid.yres = G.shot_shoty * multiplier;
    G.vid.fsize *= multiplier;
    calcparam();
    models_configure();
    callhooks(G.hooks_take);

    switch (G.shot_format) {
      case shot_wrl:
        // CAP_WRL (stage 3)
        break;

      case shot_svg:
        // CAP_SVG
        out = svg_render(what);
        break;

      case shot_png:
      case shot_rawfile:
        // CAP_PNG is 0 in the oracle's build; PNG screenshots are a later stage
        break;
    }

    v.plevel_factor = G.vid.plevel_factor; // v.backup.plevel_factor = vid.plevel_factor;
  } finally {
    G.vid.assign(v);
    G.nohud = vn; G.inHighQual = v2; G.auraNOGL = v6; G.cmode = v7;
  }
  return out;
}

// --- namespace anims (CAP_ANIMATIONS: the animation recorder is stage 3) ---
/** void anims::reflect_view(): View after a shmup::reflect of centerover (mirrors; reached from optimizeview
 *  inside a mirror) */
export function anims_reflect_view(): void { throw new NotPorted('anims::reflect_view'); } // STAGE2-STUB

// added by D3 (graph.ts gamescreen, normalscreen): the parts of namespace anims that every frame runs; with no
// animation set up (anims::ma == maNone, no environment animation, no animated parameters) anims::apply is
// `lastticks = ticks; callhooks(hooks_anim); ... calcparam();` (STAGE2-STUB: the recorder is stage 3)
let anims_lastticks = 0;
/** void anims::apply() */
export function anims_apply(): void {
  anims_lastticks = G.ticks;
  // callhooks(hooks_anim): no hooks in stage 2
  // switch(ma): maNone; env_ocean, env_volcano: 0; CAP_RUG: rug rotations 0; apply_animated_parameters(): none
  calcparam();
}
/** void anims::rollback(): runs on_rollback (empty: only env_volcano fills it) */
export function anims_rollback(): void { }
/** bool anims::any_animation(): history::on, ma, rug rotations, ap_changes (all off in stage 2) */
export function anims_any_animation(): boolean { return G.history_on; }
/** bool anims::any_on() */
export function anims_any_on(): boolean { return anims_any_animation() || G.history_includeHistory || G.currently_scrolling; }
export function anims_lastticks_(): number { return anims_lastticks; }

// added by U3 (control.ts: the 'A' key): STAGE2-STUB (the screenshot menu, stage 3)
import { stub_screen_pop } from './control.ts';
/** void shot::menu() */
export function shot_menu(): void { stub_screen_pop(); } // STAGE2-STUB

// added by U2 (menus.ts showStartMenu): namespace startanims (CAP_STARTANIM). startanims::pick chooses
// null_animation whenever !vid.usingGL, which the port always is (the software renderer, PORTING-STAGE2.md):
// so `current` is always null_animation, whose render is gamescreen() and whose name is "". The other start
// animations (GL only in the original's choice) are not ported.
import { displayButtonS } from './basegraph.ts';
import { XLAT } from './language.ts';
import { VER } from './hyper.ts';
import { SDLK_F5 } from './sdl.ts';
/** EX bool startanims::enabled */
export const startanims = { enabled: true, ticks_start: 0, exploration: (() => { }) as () => void };
/** const int EXPLORE_START_ANIMATION = 2003 */
export const startanims_EXPLORE_START_ANIMATION = 2003;
/** void startanims::pick(): (... || !vid.usingGL || ...) -> current = &null_animation */
export function startanims_pick(): void {
  if (!G.vid.usingGL) return; // current = &null_animation
  throw new NotPorted('startanims::pick (the GL start animations)'); // STAGE2-STUB (never: the port has no GL)
}
/** void startanims::display() (current = null_animation) */
export function startanims_display(): void {
  gamescreen(); // null_animation.render
  const z = (G.vid.fsize >> 1) + 2;
  if (displayButtonS(4, G.vid.yres - 4 - z * 3, VER, 0x202020, 0, G.vid.fsize >> 1))
    G.getcstat = SDLK_F5;
  if (displayButtonS(4, G.vid.yres - 4 - z * 2, XLAT(''), 0x202020, 0, G.vid.fsize >> 1))
    G.getcstat = SDLK_F5;
}
/** void startanims::explore() */
export function startanims_explore(): void { startanims.exploration(); }

// added by U2 (menus.ts showCreative): STAGE2-STUB (the animation menu is stage 3)
/** void anims::show() */
export function anims_show(): void { stub_screen_pop(); } // STAGE2-STUB
