// help.cpp: the help screens (h, ? or F1 while playing)
import { event, EV_KEY } from './imlib/event.ts';
import { JK_ESC, JK_F1 } from './imlib/keys.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { HELP_STATE, RUN_STATE } from './game.ts';
import { main_net_cfg, net_configuration } from './netcfg.ts';

/** total_help_screens, help_screens (set by loader2.cpp from the Lisp list help_screens) */
export const HELP = {
  total_help_screens: 0,
  help_screens: null as number[] | null,
};
let help_page = 0;

/** called from game draw if in help mode */
export function draw_help(): void {
  const screen = G.screen;
  const im = cache.img(HELP.help_screens![help_page]);
  const x1 = ((G.xres / 2) | 0) - ((im.Size().x / 2) | 0), y1 = ((G.yres / 2) | 0) - ((im.Size().y / 2) | 0);
  const x2 = x1 + im.Size().x, y2 = y1 + im.Size().y;
  im.put_image(screen, x1, y1);
  screen.bar(0, 0, x1 - 1, G.yres, 0);
  screen.bar(0, 0, G.xres, y1 - 1, 0);
  screen.bar(x2, y1, G.xres, G.yres, 0);
  screen.bar(x1, y2, x2, G.yres, 0);
}

export function help_handle_event(ev: event): void {
  if (ev.window !== null) return;

  const the_game = G.the_game;
  if (the_game.state !== HELP_STATE) {
    if (ev.type === EV_KEY && (ev.key === 104 /* 'h' */ || ev.key === 63 /* '?' */ || ev.key === JK_F1) && HELP.help_screens) {
      if (!main_net_cfg || (main_net_cfg.state !== net_configuration.SERVER && main_net_cfg.state !== net_configuration.CLIENT)) {
        the_game.state = HELP_STATE;
        help_page = 0;
      }
    }
  } else if (ev.type === EV_KEY) {
    if (ev.key === JK_ESC || help_page >= HELP.total_help_screens - 1) {
      the_game.state = RUN_STATE;
      the_game.draw(0);
    } else help_page++;
  }
}
