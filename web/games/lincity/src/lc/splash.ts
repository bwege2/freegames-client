// splash.c: the opening picture (opening/open.tga.gz, rendered with POV-Ray) with its three lines of
// scrolling text, until a key is pressed.
import { G, PATHS } from './g.ts';
import { platform, MapNotify } from './platform.ts';
import { fopen, fopenReadGzipped, type CFile } from './stdio.ts';
import { open_setcustompalette, HandleEvent, Fgl_setpixel, Fgl_setfont, Fgl_setfontcolors, Fgl_enableclipping,
  Fgl_setclippingwindow, Fgl_disableclipping, open_write } from './lcx11.ts';
import { start_font1, start_font2, start_font3 } from './screen.ts';
import { get_real_time, lc_usleep } from './timer.ts';
import { SPLASH_SCROLL_DELAY } from './consts.ts';
import { do_error } from './main.ts';

const SI_BLACK = 252, SI_RED = 253, SI_GREEN = 254, SI_YELLOW = 255;

export function load_start_image(): void {
  // popen ("gzip -d -c < open.tga.gz") does not fail
  const fp = fopenReadGzipped(PATHS.opening_pic);
  let l = 0;
  for (let x = 0; x < 7; x++) l = fp.fgetc();
  l &= 0xff;
  if (l === 0) l = 256;
  const pal = new Int32Array(768);
  for (let x = 0; x < l; x++) {
    pal[x * 3] = fp.fgetc();
    pal[x * 3 + 1] = fp.fgetc();
    pal[x * 3 + 2] = fp.fgetc();
  }
  // XColor's fields are unsigned shorts: -1 at the end of the file becomes 65535
  for (let i = 0; i < 768; i++) pal[i] &= 0xffff;
  pal.set([0, 0, 0], SI_BLACK * 3);
  pal.set([60, 0, 0], SI_RED * 3);
  pal.set([0, 60, 0], SI_GREEN * 3);
  pal.set([60, 60, 0], SI_YELLOW * 3);
  open_setcustompalette(pal);
  G.suppress_next_expose = 1;
  const p = platform();
  let type: number;
  do {
    while (!p.pending()) { /* busy wait, as the original */ }
    const ev = p.nextEvent();
    type = ev.type;
    HandleEvent(ev);
  } while (type !== MapNotify);
  for (let y = 0; y < 480; y++) {
    for (let x = 0; x < 640; x++) {
      let c = fp.fgetc();
      if (c === SI_BLACK) c = SI_BLACK - 4;
      if (c === SI_RED) c = SI_RED - 4;
      if (c === SI_GREEN) c = SI_GREEN - 4;
      if (c === SI_YELLOW) c = SI_YELLOW - 4;
      Fgl_setpixel(x, y, c);
    }
  }
  start_image_text();
}

function start_image_text(): void {
  Fgl_setfont(8, 8, start_font1);
  Fgl_setfontcolors(SI_BLACK, SI_RED);
  si_scroll_text();
}

function si_scroll_text(): void {
  let l1c = 0, l2c = 0, l3c = 0;
  Fgl_enableclipping();
  const open = (name: string): CFile => {
    const f = fopen(`${PATHS.opening_path}/${name}`, 'rb');
    if (!f) {
      do_error(`Can't open opening/${name}`);
      throw new Error('unreachable');
    }
    return f;
  };
  const inf1 = open('text1');
  const line1: number[] = [];
  for (let i = 0; i < 52; i++) line1.push(si_next_char(inf1));
  const inf2 = open('text2');
  const line2: number[] = [];
  for (let i = 0; i < 52; i++) line2.push(si_next_char(inf2));
  const inf3 = open('text3');
  const line3: number[] = [];
  for (let i = 0; i < 52; i++) line3.push(si_next_char(inf3));
  const p = platform();
  const str = (a: number[]): string => {
    let s = '';
    for (const c of a) {
      if (c === 0) break;
      s += String.fromCharCode(c & 0xff);
    }
    return s;
  };
  let c: number;
  do {
    get_real_time();
    // int t = real_time (a long) + 30: on LP64 the sum is cut to 32 bits (re/lincity/NOTES.md, "The splash screen")
    const t = (G.real_time + SPLASH_SCROLL_DELAY) | 0;
    if (p.pending()) HandleEvent(p.nextEvent());
    c = (G.x_key_value << 24) >> 24;
    if (l1c >= 8) {
      line1.shift();
      line1.push(si_next_char(inf1));
      l1c = 0;
    }
    Fgl_setfont(8, 8, start_font1);
    Fgl_setclippingwindow(120, 30, 520, 40);
    Fgl_setfontcolors(SI_BLACK, SI_RED);
    open_write(120 - l1c, 31, str(line1));
    l1c++;
    if (l2c >= 8) {
      line2.shift();
      line2.push(si_next_char(inf2));
      l2c = 0;
    }
    Fgl_setfont(8, 16, start_font2);
    Fgl_setclippingwindow(120, 55, 520, 73);
    Fgl_setfontcolors(SI_BLACK, SI_GREEN);
    open_write(120 - l2c, 57, str(line2));
    l2c += 2;
    if (l3c >= 8) {
      line3.shift();
      line3.push(si_next_char(inf3));
      l3c = 0;
    }
    Fgl_setfont(8, 16, start_font3);
    Fgl_setclippingwindow(120, 88, 520, 106);
    Fgl_setfontcolors(SI_BLACK, SI_YELLOW);
    open_write(120 - l3c, 90, str(line3));
    l3c += 2;
    p.dirty();
    while (G.real_time < t) {
      lc_usleep(1);
      get_real_time();
    }
  } while (c === 0);
  Fgl_disableclipping();
}

/** a char: EOF (-1) and bytes above 127 are negative */
function si_next_char(inf: CFile): number {
  if (inf.feof()) inf.fseekSet(0);
  let c = (inf.fgetc() << 24) >> 24;
  if (c === 0xa || c === 0xd) c = 32;
  return c;
}
