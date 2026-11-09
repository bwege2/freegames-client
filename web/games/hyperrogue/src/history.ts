// history.cpp of HyperRogue 13.1o (package P8): the parts the rules use -- the kill/find/move histories that
// collectItem, killMonster and the player's moves record, restore/restoreBack, progress messages, and the
// hooks_clearmemory hook that resets them. The band and line animations (create, movetophase, apply,
// createImage, renderAutoband, the menu) are graphics (a later stage): they throw NotPorted, except that
// renderAutoband does nothing while autoband is off (its default). (C) Zeno Rogue, GPL-2.0-or-later.
import { G } from './globals.ts';
import { NotPorted, isize, addHook } from './hyper.ts';
import type { cell } from './locations.ts';
import { SDL_GetTicks } from './util.ts';
import { celldist } from './cell.ts';
import { addMessage } from './basegraph.ts';
import { allowIncreasedSight } from './graph.ts';
import { arg_add3 } from './commandline.ts';

// EX int lastprogress: G.history_lastprogress

export function history_progress_screen(): void { throw new NotPorted('history::progress_screen (UI)'); }

// EX int progress_each = 250: G

export function history_progress(str: string): void {
  // CAP_SDL
  const tick = SDL_GetTicks();
  if (tick > G.history_lastprogress + G.history_progress_each) {
    G.history_lastprogress = tick;
    G.msgs.length = 0;
    addMessage(str);
    // drawscreen(); (graphics)
  }
}

// EX bool on; EX vector<shmup::monster*> v; EX double phase; EX vector<pair<cell*, eMonster> > killhistory;
// EX vector<pair<cell*, eItem> > findhistory; EX vector<cell*> movehistory; EX bool includeHistory;
// EX ld lvspeed = 1; EX int bandhalf = 200; EX int bandsegment = 16000; EX int saved_ends;
// EX cell* first_center_at; EX transmatrix first_center_view: G.history_*

export function history_save_end(): void {
  if (!allowIncreasedSight()) {
    addMessage('Enable cheat mode or GAME OVER to use this');
    return;
  }
  if (G.cheater) G.cheater++;
  switch (G.history_saved_ends) {
    case 0:
      // first_center_at = centerover; first_center_view = View; (graphics)
      throw new NotPorted('history::save_end (centerover, View)');

    case 1:
      throw new NotPorted('history::save_end (create)');

    case 2:
      G.history_on = false;
      G.history_saved_ends = 0;
      return;
  }
}

// EX bool autoband = false; EX bool autobandhistory = false; EX bool dospiral = true; EX ld extra_line_steps;
// EX vector<cell*> path_for_lineanimation: G

export function history_clear(): void {
  G.history_on = false;
  G.history_v.length = 0;
}

export function history_smoothen_line(): void { throw new NotPorted('history::smoothen_line'); }
export function history_create(_start: cell, _target: cell, _last: unknown): void { throw new NotPorted('history::create'); }
export function history_create_playerpath(): void { throw new NotPorted('history::create_playerpath'); }
export function history_create_recenter_to_view(_precise: boolean): void { throw new NotPorted('history::create_recenter_to_view'); }
export function history_movetophase(): void { throw new NotPorted('history::movetophase'); }
export function history_apply(): void { throw new NotPorted('history::apply'); }
export function history_createImage(_name_format: string, _dospiral: boolean): void { throw new NotPorted('history::createImage'); }
export function history_open_filedialog_to_create_image(_ds: boolean): void { throw new NotPorted('history::open_filedialog_to_create_image'); }
export function history_band_renderable_now(): boolean { throw new NotPorted('history::band_renderable_now'); }
export function history_history_menu(): void { throw new NotPorted('history::history_menu'); }

// EX set<cell*> inmovehistory, inkillhistory, infindhistory: G

export function history_restore(): void {
  G.history_inmovehistory.clear();
  G.history_inkillhistory.clear();
  G.history_infindhistory.clear();
  for (let i = 0; i < isize(G.history_movehistory); i++)
    G.history_inmovehistory.add(G.history_movehistory[i]);
  const kh = G.history_killhistory;
  const sk = isize(kh);
  for (let i = 0; i < sk; i++) {
    const m = kh[i][1];
    kh[i][1] = kh[i][0].monst;
    kh[i][0].monst = m;
    G.history_inkillhistory.add(kh[i][0]);
  }
  const fh = G.history_findhistory;
  const si = isize(fh);
  for (let i = 0; i < si; i++) {
    const m = fh[i][1];
    fh[i][1] = fh[i][0].item;
    fh[i][0].item = m;
    G.history_infindhistory.add(fh[i][0]);
  }
}

export function history_restoreBack(): void {
  const kh = G.history_killhistory;
  const sk = isize(kh);
  for (let i = sk - 1; i >= 0; i--) {
    const m = kh[i][1];
    kh[i][1] = kh[i][0].monst;
    kh[i][0].monst = m;
  }
  const fh = G.history_findhistory;
  const si = isize(fh);
  for (let i = si - 1; i >= 0; i--) {
    const m = fh[i][1];
    fh[i][1] = fh[i][0].item;
    fh[i][0].item = m;
  }
}

export function history_renderAutoband(): void {
  // CAP_SDL && CAP_SHOT
  if (!G.cwt.at || celldist(G.cwt.at) <= 7) return;
  if (!G.history_autoband) return;
  throw new NotPorted('history::renderAutoband (band image)');
}

/** the static initializers of history.cpp */
export function register_history(): void {
  // auto hookArg = arg::add3("-playerpath", history::create_playerpath);
  arg_add3('-playerpath', history_create_playerpath);

  addHook(G.hooks_clearmemory, 0, () => {
    history_renderAutoband();
    G.history_on = false;
    G.history_killhistory.length = 0;
    G.history_findhistory.length = 0;
    G.history_movehistory.length = 0;
    G.history_path_for_lineanimation.length = 0;
    G.history_saved_ends = 0;
    G.history_includeHistory = false;
  });
  // + addHook(hooks_configfile, 0, ...): the parameters of config.cpp (a later stage)
}
