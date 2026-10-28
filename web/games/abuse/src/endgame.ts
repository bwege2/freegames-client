// endgame.cpp: the end sequences: the planet blowing up (show_end2), the shareware end
// (share_end) and the end picture (show_end), each with its scrolling plot text
import { image } from './imlib/image.ts';
import { event, EV_KEY, EV_MOUSE_BUTTON, EV_SPURIOUS } from './imlib/event.ts';
import { SPEC_CHARACTER, SPEC_IMAGE } from './imlib/specs.ts';
import { jrand } from './imlib/jrand.ts';
import { time_marker } from './rt/platform.ts';
import { find_or_create, lnumber_value, lstring_value } from './lisp/lisp.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { LG } from './light.ts';
import { S, SFX_INITIALIZED } from './sdlport/sound.ts';
import { scale_put_trans } from './scaleput.ts';
import { CUR } from './statbar.ts';
import { busy_hooks, text_draw } from './director.ts';
import { GM } from './gamma.ts';
import { fade_in, fade_out, MENU_STATE } from './game.ts';
import { show_sell } from './menu.ts';
import type { level } from './level.ts';
import { ID_SHOW_SELL } from './id.ts';

interface mask_line {
  x: number;
  size: number;
  /** uint16_t remap[size] */
  remap: Uint16Array;
  /** uint8_t light[size] */
  light: Uint8Array;
}


function make_mask_lines(mask: image, map_width: number): mask_line[] {
  const p: mask_line[] = [];
  const d = mask.m_data;
  for (let y = 0; y < mask.Size().y; y++) {
    // find the start of the run..
    let sl = mask.scan_line(y);
    let x = 0;
    // the scan is not bounded: a row of zeros runs on into the next rows (past the end of the
    // image the original reads the heap; here undefined, taken as not 0)
    while (d[sl] === 0) {
      sl++;
      x++;
    }
    const px = x;

    // find the length of the run
    let size = 0;
    let sl_start = sl;
    while (d[sl] !== 0 && x < mask.Size().x) {
      sl++;
      x++;
      size++;
    }

    // now calculate remap for line
    const remap = new Uint16Array(size);
    const light = new Uint8Array(size);
    for (x = 0; x < size; x++) {
      light[x] = d[sl_start++];
      if (x <= ((size / 2) | 0)) remap[x] = Math.trunc(Math.sqrt(x / (size * 2.0)) * map_width / 2.0);
      else remap[x] = ((map_width / 2) | 0) - Math.trunc(Math.sqrt((size - x) / (size * 2.0)) * map_width / 2.0);
    }
    p.push({ x: px, size, remap, light });
  }
  return p;
}

function scan_map(screen: image, sx: number, sy: number, im1: image, im2: image, fade256: number, paddr: Int32Array, p: mask_line[],
  mask_height: number, xoff: number, _coff: number): void {
  let x1 = 10000, x2 = 0;
  const iw = im1.Size().x;
  const sd = screen.m_data, d1 = im1.m_data, d2 = im2.m_data;
  const wl = LG.white_light;
  let y = 0;

  for (; y < mask_height; y++) {
    const n = p[y];
    let sl = screen.scan_line(y + sy) + sx + n.x;
    const sl2 = im1.scan_line(y);
    const sl3 = im2.scan_line(y);
    if (sx + n.x < x1) x1 = sx + n.x;
    let x = 0;
    for (; x < n.size; x++, sl++) {
      const r = n.remap[x];

      let off = (r + xoff) & 0xffff;
      if (off >= iw) off = (off - iw) & 0xffff;

      const p1 = paddr[d1[sl2 + off]];
      const p2 = paddr[d2[sl3 + off]];

      const r1 = p1 >> 16, g1 = (p1 >> 8) & 0xff, b1 = p1 & 0xff;
      const r2 = p2 >> 16, g2 = (p2 >> 8) & 0xff, b2 = p2 & 0xff;
      const r3 = r1 + ((Math.imul(r2 - r1, fade256) / 256) | 0),
        g3 = g1 + ((Math.imul(g2 - g1, fade256) / 256) | 0),
        b3 = b1 + ((Math.imul(b2 - b1, fade256) / 256) | 0);

      const c = G.color_table.Lookup(r3 >> 3, g3 >> 3, b3 >> 3);

      sd[sl] = wl[(((n.light[x] / 2) | 0) + 28 + (jrand() % 4)) * 256 + c];
    }
    if (sx + n.x + x > x2) x2 = sx + n.x + x;
  }
  screen.AddDirty(x1, sy, x2 + 1, sy + mask_height);
}

class ex_char {
  /** uint8_t frame, char_num */
  frame: number;
  char_num: number;
  x: number;
  y: number;
  next: ex_char | null;
  constructor(X: number, Y: number, Frame: number, Char_num: number, Next: ex_char | null) {
    this.x = X;
    this.y = Y;
    this.frame = Frame & 0xff;
    this.char_num = Char_num & 0xff;
    this.next = Next;
  }
}

/** time_marker now; while (now.diff_time(&start) < 0.18) now.get_time(); start.get_time(); */
async function wait_018(start: time_marker): Promise<void> {
  const now = new time_marker();
  while (now.diff_time(start) < 0.18) {
    now.get_time();
    const y = busy_hooks.spin();
    if (y) await y;
  }
  start.get_time();
}

export async function show_end2(): Promise<void> {
  let i: number;
  const screen = G.screen;
  const planet = cache.reg('art/fore/endgame.spe', 'planet', SPEC_IMAGE, 1);
  const planet2 = cache.reg('art/fore/endgame.spe', 'dead_planet', SPEC_IMAGE, 1);
  const mask = cache.reg('art/fore/endgame.spe', 'mask', SPEC_IMAGE, 1);
  const ship = cache.reg('art/fore/endgame.spe', 'ship', SPEC_IMAGE, 1);

  const explo_snd = lnumber_value(find_or_create('P_EXPLODE_SND').value);
  const space_snd = lnumber_value(find_or_create('SPACE_SND').value);
  const zip_snd = lnumber_value(find_or_create('SHIP_ZIP_SND').value);

  const p = make_mask_lines(cache.img(mask), cache.img(planet).Size().x);

  const explo_frames1: number[] = [], explo_frames2: number[] = [];

  for (i = 0; i < 8; i++) {
    const nm = `small_wite${String(i + 1).padStart(4, '0')}.pcx`;
    explo_frames1[i] = cache.reg('art/exp1.spe', nm, SPEC_CHARACTER, 1);
  }

  for (i = 0; i < 7; i++) {
    const nm = `small_fire${String(i + 1).padStart(4, '0')}.pcx`;
    explo_frames2[i] = cache.reg('art/exp1.spe', nm, SPEC_CHARACTER, 1);
  }

  let eoff = 0, coff = 0;

  const ex = ((G.xres / 2) | 0) - ((cache.img(mask).Size().x / 2) | 0);
  const ey = ((G.yres / 2) | 0) - ((cache.img(mask).Size().y / 2) | 0);
  await fade_out(16);

  const blank = new image(2, 2);
  blank.clear();
  G.wm.set_mouse_shape(blank.copy(), 0, 0); // don't show mouse

  screen.clear();
  const c = [G.pal.find_closest(222, 222, 22),
    G.pal.find_closest(200, 200, 200),
    G.pal.find_closest(100, 100, 100),
    G.pal.find_closest(64, 64, 64)];
  const sinfo = new Uint16Array(800 * 3);
  let si: number;

  for (si = 0, i = 0; i < 800; i++) {
    sinfo[si++] = jrand() % 320;
    sinfo[si++] = jrand() % 200;
    sinfo[si++] = c[jrand() % 4];
    screen.PutPixel(sinfo[si - 3], sinfo[si - 2], sinfo[si - 1]);
  }
  const paddr = new Int32Array(256);
  const old_pal = GM.old_pal;
  if (old_pal) {
    for (i = 0; i < 256; i++) paddr[i] = (old_pal.red(i) << 16) | (old_pal.green(i) << 8) | old_pal.blue(i);
  } else {
    const pal = G.pal;
    for (i = 0; i < 256; i++) paddr[i] = (pal.red(i) << 16) | (pal.green(i) << 8) | pal.blue(i);
  }

  const dx = ((G.xres + 1) / 2 | 0) - ((320 / 2) | 0), dy = ((G.yres + 1) / 2 | 0) - ((200 / 2) | 0);

  scan_map(screen, ex, ey, cache.img(planet), cache.img(planet2), 0, paddr, p, cache.img(mask).Size().y, eoff, coff);
  const tcopy = cache.img(planet).copy();
  await fade_in(null, 32);

  const old_time = new time_marker();

  for (i = 0; i < 80;) {
    const new_time = new time_marker();
    if (new_time.diff_time(old_time) > 0.1) {
      if ((i % 10) === 0 && (S.sound_avail & SFX_INITIALIZED)) cache.sfx(space_snd).play(64);

      old_time.get_time();
      screen.clear();
      let j: number;
      for (si = 0, j = 0; j < 800; j++, si += 3) screen.PutPixel(dx + sinfo[si], dy + sinfo[si + 1], sinfo[si + 2]);

      if (i >= 30 && i <= 37) {
        cache.img(planet).put_image(tcopy, 0, 0);
        cache.fig(explo_frames1[i - 30]).forward.PutImage(tcopy, 100, 50);
        scan_map(screen, ex, ey, tcopy, cache.img(planet2), 0, paddr, p, cache.img(mask).Size().y, eoff, coff);
      } else scan_map(screen, ex, ey, cache.img(planet), cache.img(planet2), 0, paddr, p, cache.img(mask).Size().y, eoff, coff);
      if (i > 38) {
        const t = i - 38;
        const s = cache.img(ship);
        const nw = (Math.imul(s.Size().x, t + 2) / 16) | 0,
          nh = (Math.imul(s.Size().y, t + 2) / 16) | 0;

        scale_put_trans(s, screen, ex - (i - 38) * 5, ey + ((cache.img(mask).Size().y / 2) | 0) + t * 4, nw, nh);
        if (i === 77) if (S.sound_avail & SFX_INITIALIZED) cache.sfx(zip_snd).play(127);
      }

      eoff += 2;
      if (eoff >= 320) eoff -= 320;
      coff += 1;
      if (coff >= 320) coff -= 320;
      G.wm.flush_screen();
      i++;
    }
    const y = busy_hooks.spin();
    if (y) await y;
  }
  // delete tcopy

  let clist: ex_char | null = null;
  for (i = 0; i < 200;) {
    const new_time = new time_marker();
    if (new_time.diff_time(old_time) > 0.1) {
      if ((i % 10) === 0 && (S.sound_avail & SFX_INITIALIZED)) cache.sfx(space_snd).play(64);

      old_time.get_time();
      screen.clear();
      let j: number;
      for (si = 0, j = 0; j < 800; j++, si += 3) screen.PutPixel(dx + sinfo[si], dy + sinfo[si + 1], sinfo[si + 2]);

      scan_map(screen, ex, ey, cache.img(planet), cache.img(planet2), (Math.imul(i, 256) / 200) | 0, paddr, p,
        cache.img(mask).Size().y, eoff, coff);

      eoff += 2;
      if (eoff >= 320) eoff -= 320;
      coff += 1;
      if (coff >= 320) coff -= 320;

      i++;
      if (i < 150 || (i < 170 && ((i - 149) % 2) === 0) || (i < 180 && ((i - 149) % 4) === 0) || (i < 190 && ((i - 149) % 8) === 0)) {
        // clang evaluates the arguments left to right: the x's jrand() before the y's
        const mw = cache.img(mask).Size().x;
        const ncx = ex + jrand() % (mw - ((mw / 3) | 0));
        const mh = cache.img(mask).Size().y;
        const ncy = ey + jrand() % (mh - ((mh / 3) | 0));
        clist = new ex_char(ncx, ncy, 0, 1, clist);
        if (S.sound_avail & SFX_INITIALIZED) cache.sfx(explo_snd).play(127);
      }

      let cc: ex_char | null = clist, last: ex_char | null = null;
      for (; cc;) {
        cc.frame = (cc.frame + 1) & 0xff;
        if (cc.frame > 6) {
          if (last) last.next = cc.next;
          else clist = cc.next;
          cc = cc.next;
        } else {
          last = cc;
          if (cc.char_num) cache.fig(explo_frames2[cc.frame]).forward.PutImage(screen, cc.x, cc.y);

          cc.x -= 3;
          cc = cc.next;
        }
      }

      G.wm.flush_screen();
    }
    const y = busy_hooks.spin();
    if (y) await y;
  }
  clist = null;

  screen.clear();
  let j: number;
  for (si = 0, j = 0; j < 800; j++, si += 3) screen.PutPixel(sinfo[si], sinfo[si + 1], sinfo[si + 2]);

  const ev = new event();
  i = 0;
  do {
    const new_time = new time_marker();
    if (new_time.diff_time(old_time) > 0.1) {
      if ((i % 10) === 0 && (S.sound_avail & SFX_INITIALIZED)) cache.sfx(space_snd).play(64);

      old_time.get_time();
      scan_map(screen, ex, ey, cache.img(planet), cache.img(planet2), 256, paddr, p, cache.img(mask).Size().y, eoff, coff);
      eoff += 2;
      if (eoff >= 320) eoff -= 320;
      coff += 1;
      if (coff >= 320) coff -= 320;
      G.wm.flush_screen();
      i++;
    }

    if (G.wm.event_waiting()) await G.wm.get_event(ev);
    else {
      const y = busy_hooks.spin();
      if (y) await y;
    }
  } while (ev.type !== EV_KEY && ev.type !== EV_MOUSE_BUTTON);

  const cmap = new Uint8Array(32);
  for (i = 0; i < 32; i++) cmap[i] = G.pal.find_closest((i * 256 / 32) | 0, (i * 256 / 32) | 0, (i * 256 / 32) | 0);

  const end_plot = find_or_create('plot_end').value;

  const start = new time_marker();

  ev.type = EV_SPURIOUS;
  for (i = 0; i < 320 && ev.type !== EV_KEY; i++) {
    screen.clear();
    for (si = 0, j = 0; j < 800; j++, si += 3) screen.PutPixel(dx + sinfo[si], dy + sinfo[si + 1], sinfo[si + 2]);

    scan_map(screen, ex, ey, cache.img(planet), cache.img(planet2), 256, paddr, p, cache.img(mask).Size().y, eoff, coff);
    text_draw(205 - i, dx + 10, dy, dx + 319 - 10, dy + 199, lstring_value(end_plot), G.wm.font(), cmap, G.wm.bright_color());
    G.wm.flush_screen();
    await wait_018(start);

    while (G.wm.event_waiting() && ev.type !== EV_KEY) await G.wm.get_event(ev);
  }

  // free(p[i].remap), free(p[i].light), free(p)

  if (G.current_level) G.current_level.destroy(); // delete current_level (delete NULL does nothing)
  G.current_level = null as unknown as level;

  await fade_out(16);
  screen.clear();

  G.wm.set_mouse_shape(cache.img(CUR.c_normal).copy(), 1, 1);
  G.the_game.set_state(MENU_STATE);
}

export async function share_end(): Promise<void> {
  const screen = G.screen;
  await fade_out(16);
  const blank = new image(2, 2);
  blank.clear();
  G.wm.set_mouse_shape(blank.copy(), 0, 0); // don't show mouse
  screen.clear();

  const im = cache.img(cache.reg('art/fore/endgame.spe', 'tbc', SPEC_IMAGE, 1));

  const to_be = find_or_create('to_be_continued').value;
  // PtrRef r1(to_be): kept from the garbage collector

  const mid_plot = find_or_create('plot_middle').value;
  // PtrRef r2(mid_plot)

  const dx = (((G.xres + 1) / 2) | 0) - ((im.Size().x / 2) | 0), dy = (((G.yres + 1) / 2) | 0) - ((im.Size().y / 2) | 0);
  const console_font = G.console_font;
  im.put_image(screen, dx, dy);
  console_font.put_string(screen, ((G.xres / 2) | 0) + 35, ((G.yres / 2) | 0) + 100 - console_font.height() - 2, lstring_value(to_be));
  await fade_in(null, 32);

  const cmap = new Uint8Array(32);
  let i: number;
  for (i = 0; i < 32; i++) cmap[i] = G.pal.find_closest((i * 256 / 32) | 0, (i * 256 / 32) | 0, (i * 256 / 32) | 0);

  const ev = new event();
  ev.type = EV_SPURIOUS;
  const start = new time_marker();
  for (i = 0; i < 320 && ev.type !== EV_KEY; i++) {
    im.put_image(screen, dx, dy);
    console_font.put_string(screen, ((G.xres / 2) | 0) + 35, ((G.yres / 2) | 0) + 100 - console_font.height() - 2, lstring_value(to_be));

    text_draw(205 - i, dx + 10, dy, dx + 319 - 10, dy + 199, lstring_value(mid_plot), G.wm.font(), cmap, G.wm.bright_color());
    G.wm.flush_screen();
    await wait_018(start);
    while (G.wm.event_waiting() && ev.type !== EV_KEY) await G.wm.get_event(ev);
  }

  if (ev.type !== EV_KEY) {
    do {
      G.wm.flush_screen();
      await G.wm.get_event(ev);
    } while (ev.type !== EV_KEY && ev.type !== EV_MOUSE_BUTTON);
  }

  await fade_out(16);
  G.wm.set_mouse_shape(blank.copy(), 0, 0); // don't show mouse
  await show_sell(1);
  G.wm.push_event(event.msg(ID_SHOW_SELL, null));
}

export async function show_end(): Promise<void> {
  const screen = G.screen;
  await fade_out(16);
  const blank = new image(2, 2);
  blank.clear();
  G.wm.set_mouse_shape(blank.copy(), 0, 0); // don't show mouse
  screen.clear();

  const im = cache.img(cache.reg('art/fore/endgame.spe', 'end.pcx', SPEC_IMAGE, 1));

  const dx = (((G.xres + 1) / 2) | 0) - ((320 / 2) | 0), dy = (((G.yres + 1) / 2) | 0) - ((200 / 2) | 0);

  const end_plot = find_or_create('plot_end').value;
  // PtrRef r2(end_plot)

  await fade_in(im, 32);

  const cmap = new Uint8Array(32);
  let i: number;
  for (i = 0; i < 32; i++) cmap[i] = G.pal.find_closest((i * 256 / 32) | 0, (i * 256 / 32) | 0, (i * 256 / 32) | 0);

  const ev = new event();
  ev.type = EV_SPURIOUS;
  const start = new time_marker();
  for (i = 0; i < 320 && ev.type !== EV_KEY; i++) {
    im.put_image(screen, dx, dy);

    text_draw(205 - i, dx + 10, dy, dx + 319 - 10, dy + 199, lstring_value(end_plot), G.wm.font(), cmap, G.wm.bright_color());
    G.wm.flush_screen();
    await wait_018(start);
    while (G.wm.event_waiting() && ev.type !== EV_KEY) await G.wm.get_event(ev);
  }

  if (ev.type !== EV_KEY) {
    do {
      G.wm.flush_screen();
      await G.wm.get_event(ev);
    } while (ev.type !== EV_KEY && ev.type !== EV_MOUSE_BUTTON);
  }

  if (G.current_level) G.current_level.destroy(); // delete current_level (delete NULL does nothing)
  G.current_level = null as unknown as level;

  await fade_out(16);
  screen.clear();

  await show_sell(1);

  G.wm.set_mouse_shape(cache.img(CUR.c_normal).copy(), 1, 1);
  G.the_game.set_state(MENU_STATE);
}
