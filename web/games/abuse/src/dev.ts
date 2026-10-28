// dev.cpp: the level editor. The editor is not ported (README.md); what play needs of dev.cpp is
// here: dev_init (the -f, -demo, -nodelay options and defaults.prp), the quit dialog, and the
// dev_controll calls the game makes outside edit mode.
import { G, EDIT_MODE, DRAW_LIGHTS } from './globals.ts';
import { cache } from './cache.ts';
import { SPEC_IMAGE } from './imlib/specs.ts';
import { event, EV_CLOSE_WINDOW, EV_KEY, EV_MESSAGE } from './imlib/event.ts';
import { JK_ESC } from './imlib/keys.ts';
import { button, info_field } from './imlib/input.ts';
import { symbol_str } from './clisp.ts';
import { property_manager, PR } from './property.ts';
import { ID_CANCEL, ID_NULL, ID_QUIT_OK } from './id.ts';
import { AbuseError } from './imlib/dprint.ts';
import { time_marker } from './rt/platform.ts';
import type { view } from './view.ts';

export const DV = { start_nodelay: 0 };

export function get_option(name: string): number {
  for (let i = 1; i < G.start_argv.length; i++) if (G.start_argv[i] === name) return i;
  return 0;
}

export function dev_init(argv: string[]): void {
  G.dev = 0;
  PR.prop = new property_manager();
  PR.prop.load('defaults.prp');
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '-edit') throw new AbuseError('the level editor is not ported');
    else if (argv[i] === '-nodelay') DV.start_nodelay = 1;
    else if (argv[i] === '-f') G.level_file = argv[++i];
    else if (argv[i] === '-2') G.start_doubled = 1;
    else if (argv[i] === '-demo') G.demo_start = 1;
  }
  if ((get_option('-size') || get_option('-vmode')) && !G.start_edit) throw new AbuseError(symbol_str('no_hirez'));
  const p = PR.prop;
  G.fg_reversed = p.getd('fg_reversed', 0);
  G.mouse_scrolling = p.getd('mouse_scrolling', 0);
  G.palettes_locked = p.getd('palettes_locked', 0);
  G.view_shift_disabled = p.getd('view_shift_disabled', 0);
  G.fps_on = p.getd('fps_on', 0);
  G.show_names = p.getd('show_names', 0);
  G.raise_all = p.getd('raise_all', 0);
}

/** dev_controll, as far as play uses it */
export class dev_controll {
  /** dev.h's member time_marker last_area_click: constructed with the object, one clock reading */
  last_area_click = new time_marker();
  constructor() {
    if (DV.start_nodelay) G.the_game.toggle_delay();
    if (get_option('-nolight')) G.dev = G.dev ^ DRAW_LIGHTS;
  }
  set_state(_new_state: number): void { /* -2 (double_render) is not ported */ }
  load_stuff(): void { /* edit.lsp: edit mode only */ }
  /** called for messages only outside edit mode; the editor's messages do not occur in play */
  handle_event(_ev: event): void {}
  dev_draw(_v: view): void { /* edit mode only */ }
  ok_to_scroll(): number { return 0; }
  need_arrows(): number { return 0; }
}

export const DC = { dev_cont: null as dev_controll | null };

export async function confirm_quit(): Promise<number> {
  const ok_image = cache.img(cache.reg('art/frame.spe', 'dev_ok', SPEC_IMAGE, 1)).copy();
  const cancel_image = cache.img(cache.reg('art/frame.spe', 'cancel', SPEC_IMAGE, 1)).copy();
  const wm = G.wm;
  // clang evaluates the arguments left to right: quit_title is looked up after the fields' texts
  const sure = symbol_str('sure?');
  const fields = new button(10, wm.font().height() + 4, ID_QUIT_OK, ok_image,
    new button(38, wm.font().height() + 4, ID_CANCEL, cancel_image, new info_field(2, 2, ID_NULL, sure, null)));
  const quitw = wm.new_window(((G.xres / 2) | 0) + 40, (G.yres / 2) | 0, 80, -1, fields, symbol_str('quit_title'));
  wm.grab_focus(quitw);
  let fin = 0, quit = 0;
  while (!fin) {
    wm.flush_screen();
    const ev = new event();
    await wm.get_event(ev);
    if (ev.type === EV_MESSAGE && ev.message.id === ID_QUIT_OK) fin = quit = 1;
    else if (ev.type === EV_MESSAGE && ev.message.id === ID_CANCEL) fin = 1;
    else if (ev.type === EV_KEY && upper(ev.key) === upper(symbol_str('YES').charCodeAt(0))) fin = quit = 1;
    else if (ev.type === EV_KEY && upper(ev.key) === upper(symbol_str('NO').charCodeAt(0))) fin = 1;
    if ((ev.type === EV_KEY && ev.key === JK_ESC) || ev.type === EV_CLOSE_WINDOW) fin = 1;
  }
  G.the_game.reset_keymap();
  wm.close_window(quitw);
  wm.flush_screen();
  return quit;
}

function upper(c: number): number { return c >= 97 && c <= 122 ? c - 32 : c; }

void EDIT_MODE;
