// loadgame.cpp: the save slots (save0001.spe .. save0015.spe in the save directory) and the
// load/save dialog with its numbered icons and the thumbnail preview
import { image } from './imlib/image.ts';
import { Jwindow } from './imlib/jwindow.ts';
import { event, EV_CLOSE_WINDOW, EV_KEY, EV_MESSAGE } from './imlib/event.ts';
import { JK_ESC } from './imlib/keys.ts';
import { get_save_filename_prefix, open_file, spec_directory, SPEC_IMAGE } from './imlib/specs.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { DM } from './statbar.ts';
import { ico_button } from './gui.ts';
import { symbol_str } from './clisp.ts';
import { open_FILE } from './game.ts';
import { ID_LOAD_GAME_NUMBER, ID_LOAD_GAME_PREVIEW, ID_LOAD_PLAYER_GAME } from './id.ts';
import { CMP } from './compiled.ts';
import { stdout_printf } from './imlib/dprint.ts';

const MAX_SAVE_GAMES = 15;
const MAX_SAVE_LINES = 5;

export const save_buts = new Int32Array(MAX_SAVE_GAMES * 3);

/** sprintf("%04d") */
const d4 = (n: number): string => (n < 0 ? '-' + String(-n).padStart(3, '0') : String(n).padStart(4, '0'));

export function load_number_icons(): void {
  for (let i = 0; i < MAX_SAVE_GAMES * 3; i++) {
    const name = `nums${d4(i + 1)}.pcx`;
    save_buts[i] = cache.reg('art/icons.spe', name, SPEC_IMAGE, 1);
  }
}

export function last_savegame_name(): string {
  stdout_printf('last_savegame_name()\n');
  return `${get_save_filename_prefix()}save${d4(((CMP.last_save_game_number + MAX_SAVE_GAMES - 1) % MAX_SAVE_GAMES) + 1)}.spe`;
}

function create_num_window(mx: number, total_saved: number, lines: number, thumb_nails: (image | null)[] | null): Jwindow {
  const buts: ico_button[] = [];
  let y = 0, x = 0, i: number;
  const iw = cache.img(save_buts[0]).Size().x;
  const ih = cache.img(save_buts[0]).Size().y;
  let maxih = ih, maxiw = iw;
  let n = 0;
  for (i = 0; i < total_saved; i++, y += ih) {
    maxih = Math.max(ih, maxih);
    maxiw = Math.max(iw, maxiw);
    if (y >= lines * ih) {
      y = 0;
      x += iw;
    }
    if (thumb_nails) {
      while (!thumb_nails[n]) n++;
    }
    buts[i] = new ico_button(x, y, ID_LOAD_GAME_NUMBER + n,
      save_buts[n * 3 + 0], save_buts[n * 3 + 0], save_buts[n * 3 + 1], save_buts[n * 3 + 2], null);
    buts[i].set_act_id(ID_LOAD_GAME_PREVIEW + n);
    n++;
  }

  for (i = 0; i < total_saved - 1; i++) buts[i].next = buts[i + 1];

  return G.wm.new_window(mx, ((G.yres / 2) | 0) - (((Jwindow.top_border() + maxih * 5) / 2) | 0), -1, -1, buts[0]);
}

/** never called in the original (the save console asks with load_game) */
export async function get_save_spot(): Promise<number> {
  let i = MAX_SAVE_GAMES, last_free = 0;
  for (; i > 0;) {
    const name = `${get_save_filename_prefix()}save${d4(i)}.spe`;
    const fp = open_FILE(name, 'rb');
    if (fp) i = 0;
    else {
      last_free = i;
      i--;
    }
    // fclose(fp): fclose(NULL) crashes glibc when the slot does not exist
    if (!fp) throw new Error('fclose(NULL)');
    fp.close();
  }

  if (last_free) return last_free; // if there are any slots not created yet...

  const w = cache.img(save_buts[0]).Size().x;
  let mx = DM.last_demo_mx - ((w / 2) | 0);
  if (mx + w + 10 > G.xres) mx = G.xres - w - 10;
  if (mx < 0) mx = 0;

  const l_win = create_num_window(mx, MAX_SAVE_GAMES, MAX_SAVE_LINES, null);
  const ev = new event();
  let got_level = 0;
  let quit = 0;
  do {
    G.wm.flush_screen();
    await G.wm.get_event(ev);
    if (ev.type === EV_MESSAGE && ev.message.id >= ID_LOAD_GAME_NUMBER && ev.message.id < ID_LOAD_GAME_PREVIEW)
      got_level = ev.message.id - ID_LOAD_GAME_NUMBER + 1;

    if (ev.type === EV_CLOSE_WINDOW && ev.window === l_win) quit = 1;
  } while (!got_level && !quit);

  G.wm.close_window(l_win);
  G.the_game.reset_keymap();
  return got_level;
}

/** buf should be at least 50 bytes */
export function get_savegame_name(): string {
  const buf = `save${d4((CMP.last_save_game_number++ % MAX_SAVE_GAMES) + 1)}.spe`;
  /*  FILE *fp=open_FILE("lastsave.lsp","wb"); ... (commented out in the original) */
  return buf;
}

export function show_load_icon(): number {
  for (let i = 0; i < MAX_SAVE_GAMES; i++) {
    const nm = `${get_save_filename_prefix()}save${d4(i + 1)}.spe`;
    const fp = open_file(nm, 'rb');
    if (fp.open_failure()) {
      fp.close();
    } else {
      fp.close();
      return 1;
    }
  }
  return 0;
}

/** return 0 if the player escapes, else return the number of the game to load */
export async function load_game(show_all: number, title: string | null): Promise<number> {
  let total_saved = 0;
  const thumb_nails: (image | null)[] = new Array<image | null>(MAX_SAVE_GAMES).fill(null);
  let start_num = 0;
  let max_w = 160, max_h = 100;

  let first: image | null = null;

  for (start_num = 0; start_num < MAX_SAVE_GAMES; start_num++) {
    let fail = 0;

    const name = `${get_save_filename_prefix()}save${d4(start_num + 1)}.spe`;
    const fp = open_file(name, 'rb');
    if (fp.open_failure()) {
      fail = 1;
    } else {
      const sd = new spec_directory(fp);
      const se = sd.find('thumb nail');
      if (se && se.type === SPEC_IMAGE) {
        const t = image.load(fp, se);
        thumb_nails[start_num] = t;
        if (t.Size().x > max_w) max_w = t.Size().x;
        if (t.Size().y > max_h) max_h = t.Size().y;
        if (!first) first = t;
        total_saved++;
      } else fail = 1;
    }
    if (fail && show_all) {
      const t = new image(160, 100);
      thumb_nails[start_num] = t;
      t.clear();
      G.console_font.put_string(t, 0, 0, symbol_str('no_saved'));
      total_saved++;
      if (!first) first = t;
    }
    fp.close();
  }

  if (!total_saved) return 0;
  if (total_saved > MAX_SAVE_GAMES) total_saved = MAX_SAVE_GAMES;

  let i: number;

  const l_win = create_num_window(0, total_saved, MAX_SAVE_LINES, thumb_nails);
  const preview = G.wm.new_window(l_win.x + l_win.l + 5, l_win.y, max_w, max_h, null, title);

  first!.put_image(preview.screen, preview.x1(), preview.y1());

  const ev = new event();
  let got_level = 0;
  let quit = 0;
  do {
    G.wm.flush_screen();
    await G.wm.get_event(ev);
    if (ev.type === EV_MESSAGE && ev.message.id >= ID_LOAD_GAME_NUMBER && ev.message.id < ID_LOAD_GAME_PREVIEW)
      got_level = ev.message.id - ID_LOAD_GAME_NUMBER + 1;

    if (ev.type === EV_MESSAGE && ev.message.id >= ID_LOAD_GAME_PREVIEW && ev.message.id < ID_LOAD_PLAYER_GAME) {
      const draw_num = ev.message.id - ID_LOAD_GAME_PREVIEW;
      preview.clear();
      thumb_nails[draw_num]!.put_image(preview.screen, preview.x1(), preview.y1());
    }

    if ((ev.type === EV_CLOSE_WINDOW) || (ev.type === EV_KEY && ev.key === JK_ESC)) quit = 1;
  } while (!got_level && !quit);

  G.wm.close_window(l_win);
  G.wm.close_window(preview);

  for (i = 0; i < total_saved; i++) if (thumb_nails[i]) thumb_nails[i] = null; // delete thumb_nails[i]

  return got_level;
}
