// x11/colors.c and x11/dbuff.c: the 16 colours, the visual (the emulated server's TrueColor: pixel
// copying for double buffering), RGB values for full colour, spark colours, the colour options.
import { G } from './G.ts';
import { MAX_COLORS, MAX_COLOR_LEN, NUM_COLORS, RED, MSG_LEN, XP_OPTFLAG_DEFAULT } from './consts.ts';
import { isdigit, onReset, strlcpy, strtokAll } from './cutil.ts';
import { COLOR_INDEX_OPTION, ref, STORE_OPTIONS, XP_INT_OPTION, XP_STRING_OPTION, type xp_option_t } from './option.ts';
import { warn } from './error.ts';
import { XAllocColor, XParseColor } from '../xlib/xlib.ts';

const PIXMAP_COPY = 0;

const COLOR_DEFAULTS = [
  '#000000', '#FFFFFF', '#4E7CFF', '#FF3A27', '#33BB44', '#992200', '#BB7700', '#EE9900',
  '#002299', '#CC4400', '#DD8800', '#FFBB11', '#9F9F9F', '#5F5F5F', '#DFDFDF', '#202020',
];

const C = { color_names: new Array<string>(MAX_COLORS).fill(''), haveRGB: false };
onReset(() => Object.assign(C, { color_names: new Array<string>(MAX_COLORS).fill(''), haveRGB: false }));

/** RGB(): a pixel for an RGB triplet (TrueColor: 0xRRGGBB); null without full colour */
export function RGB(r: number, g: number, b: number): number {
  return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}
export const haveRGB = (): boolean => C.haveRGB;
const RGB2COLOR = (c: number) => RGB((c >> 16) & 255, (c >> 8) & 255, c & 255);

function Parse_colors(): number {
  for (let i = 0; i < G.maxColors; i++) {
    if (C.color_names[i].length > 0) {
      const tmp = strtokAll(C.color_names[i], ' \t\r\n')[0];
      const c = tmp ? XParseColor(G.dpy, 0, tmp) : null;
      if (c) { G.colors[i] = c; continue; }
      warn(`Can't parse color ${i} "${C.color_names[i]}".`);
    }
    const c = XParseColor(G.dpy, 0, COLOR_DEFAULTS[i]);
    if (c) { G.colors[i] = c; continue; }
    if (i < NUM_COLORS) return -1;
    G.colors[i] = { ...G.colors[i % NUM_COLORS] };
  }
  return 0;
}

export function Colors_init(): number {
  G.colormap = 0;
  G.dispDepth = 24;
  // a TrueColor visual: no colour switching
  G.colorSwitch = false;
  G.maxColors = G.maxColors >= 16 ? 16 : G.maxColors >= 8 ? 8 : 4;
  const num_planes = G.maxColors === 16 ? 4 : G.maxColors === 8 ? 3 : 2;
  if (Parse_colors() === -1) {
    warn('Color parsing failed.');
    return -1;
  }
  // dbuff.c start_dbuff(PIXMAP_COPY): every colour allocated
  G.dbuf_state = { type: PIXMAP_COPY, multibuffer_type: 0, drawing_planes: 0xffffffff, drawing_plane_masks: [0xffffffff, 0xffffffff] };
  for (let i = 0; i < 1 << num_planes; i++) XAllocColor(G.dpy, 0, G.colors[i]);
  for (let i = G.maxColors; i < MAX_COLORS; i++) G.colors[i] = { ...G.colors[i % G.maxColors] };
  G.dpl_1 = [0, 0];
  G.dpl_2 = [0, 0];
  Colors_init_bitmaps();
  return 0;
}

export function Colors_init_style_colors(): void {
  for (let i = 0; i < G.num_polygon_styles; i++) {
    const s = G.polygon_styles[i];
    s.color = G.fullColor && C.haveRGB ? RGB2COLOR(s.rgb) : G.wallColor;
  }
  for (let i = 0; i < G.num_edge_styles; i++) {
    const s = G.edge_styles[i];
    s.color = G.fullColor && C.haveRGB ? RGB2COLOR(s.rgb) : G.wallColor;
  }
}

export function Colors_init_bitmaps(): number {
  if (G.dbuf_state === null) return 0;
  if (G.fullColor) C.haveRGB = true;
  Colors_init_style_colors();
  return G.fullColor ? 0 : -1;
}

export function Colors_free_bitmaps(): void {
  C.haveRGB = false;
  G.fullColor = false;
  G.texturedObjects = false;
}

export function Colors_cleanup(): void {
  Colors_free_bitmaps();
  G.dbuf_state = null;
  G.colormap = 0;
}

export function Init_spark_colors(): void {
  G.num_spark_colors = 0;
  const src = G.sparkColors;
  for (let i = 0; i < src.length && G.num_spark_colors < 9; i++) {
    if (!isdigit(src[i])) continue;
    let buf = '';
    while (i < src.length && isdigit(src[i]) && buf.length < MSG_LEN - 1) buf += src[i++];
    i--;
    const col = parseInt(buf, 10) >>> 0;
    if (col < G.maxColors) G.spark_color[G.num_spark_colors++] = col;
  }
  if (G.num_spark_colors === 0) {
    if (G.maxColors <= 8) for (let i = 5; i < G.maxColors; i++) G.spark_color[G.num_spark_colors++] = i;
    else for (let i = 5; i < 12; i++) G.spark_color[G.num_spark_colors++] = i;
    G.spark_color[G.num_spark_colors++] = RED;
  }
  for (let i = G.num_spark_colors; i < MAX_COLORS; i++) G.spark_color[i] = G.spark_color[G.num_spark_colors - 1];
}

const g = <K extends keyof typeof G>(k: K) => ref(() => G, k);

function colorOption(i: number, nth: string): xp_option_t {
  return XP_STRING_OPTION(`color${i}`, COLOR_DEFAULTS[i], { get: () => C.color_names[i], set: (v) => { C.color_names[i] = v; } }, MAX_COLOR_LEN,
    (_o, v) => { C.color_names[i] = strlcpy(v, MAX_COLOR_LEN); return true; }, C.color_names, null, XP_OPTFLAG_DEFAULT,
    `The color value for the ${nth} color.\n`);
}

export function Store_color_options(): void {
  const nth = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth',
    'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth'];
  STORE_OPTIONS([
    XP_INT_OPTION('maxColors', MAX_COLORS, 4, MAX_COLORS, g('maxColors'), (_o, v) => {
      if (v === 4 || v === 8) {
        warn('Values 4 or 8 for maxColors are not actively supported. Use at own risk.');
        G.maxColors = v;
      } else G.maxColors = MAX_COLORS;
      return true;
    }, XP_OPTFLAG_DEFAULT, 'The number of colors to use.\nUse value 16. Other values are not actively supported.\n'),
    ...nth.map((n, i) => colorOption(i, n)),
    XP_STRING_OPTION('sparkColors', '5,6,7,3', g('sparkColors'), MSG_LEN, (_o, v) => {
      G.sparkColors = strlcpy(v, MSG_LEN);
      Init_spark_colors();
      return true;
    }, null, null, XP_OPTFLAG_DEFAULT, 'Which color numbers to use for spark and debris particles.\n'),
    COLOR_INDEX_OPTION('wallColor', 2, g('wallColor'), 'Which color number to use for drawing walls.\n'),
    COLOR_INDEX_OPTION('decorColor', 6, g('decorColor'), 'Which color number to use for drawing decorations.\n'),
    COLOR_INDEX_OPTION('windowColor', 8, g('windowColor'), 'Which color number to use for drawing windows.\n'),
    COLOR_INDEX_OPTION('buttonColor', 2, g('buttonColor'), 'Which color number to use for drawing buttons.\n'),
    COLOR_INDEX_OPTION('borderColor', 1, g('borderColor'), 'Which color number to use for drawing borders.\n'),
  ]);
}
