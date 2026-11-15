// lw/score.ts: src/score.c: the scores after a battle: three test tubes (2nd, 1st, 3rd) filling up over a
// few seconds with the teams' shares or the times they lasted, then the winners' names.

import { type Bitmap, create_bitmap, draw_sprite, ellipse, ellipsefill, rectfill, vline } from '../al/bitmap.ts';
import { D_EXIT, D_HIDDEN, dialogArray, MSG_DRAW, shutdown_dialog } from '../al/gui.ts';
import { screenRef } from '../al/screen.ts';
import { rest, sys } from '../al/sys.ts';
import { random } from '../glibc.ts';
import { my_textbox_proc } from './alleg2.ts';
import { display_back_image } from './back.ts';
import {
  menu_real_y, my_do_dialog_no_clear, my_init_dialog, my_update_dialog, quick_buttons, standard_button,
  standard_small_button,
} from './dialog.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { confirm_quit } from './menu.ts';
import { my_fade_in } from './palette.ts';
import { play_win } from './sound.ts';
import {
  G, MENU_EXIT, MENU_FG, MENU_H_SPACE, MENU_PLAY, MENU_QUICK_BACK, MENU_QUICK_MAIN, MENU_QUICK_PLAY, MENU_QUICK_QUIT,
  MENU_TOP, NB_TEAMS,
} from './state.ts';

const LW_SCORE_TOMBOLA_MAX = 500;
const LW_SCORE_TOMBOLA_RESULT = [0, 0, 0, 0, 0, 0];

function get_cursor(classement: number): number {
  const C = G.CURRENT_CURSOR;
  let indice_curseur = -1;
  for (let i = 0; i < NB_TEAMS; ++i) {
    if (C[i]!.active && C[i]!.loose_time < 0) {
      C[i]!.score_order = 1;
      for (let j = 0; j < i; ++j) {
        if (C[j]!.active && G.ACTIVE_FIGHTERS[C[i]!.team]! <= G.ACTIVE_FIGHTERS[C[j]!.team]!) C[i]!.score_order++;
      }
      for (let j = i + 1; j < NB_TEAMS; ++j) {
        if (C[j]!.active && G.ACTIVE_FIGHTERS[C[i]!.team]! < G.ACTIVE_FIGHTERS[C[j]!.team]!) C[i]!.score_order++;
      }
    }
  }
  for (let i = 0; i < NB_TEAMS; ++i) {
    if (C[i]!.score_order === classement && (C[i]!.active || C[i]!.loose_time >= 0)) indice_curseur = i;
  }
  return indice_curseur;
}

const p2 = (n: number): string => (n < 10 && n >= 0 ? `0${n}` : String(n));

function write_score(indice: number, fill_level: number): string {
  if (indice < 0) return '';
  if (fill_level < 0) fill_level = 0;
  if (fill_level > 1000) fill_level = 1000;
  const c = G.CURRENT_CURSOR[indice]!;
  let s;
  if (!G.STARTUP_TOMBOLA) {
    if (c.score_order === 1 && G.PLAYING_TEAMS === 1) s = lw_lang_string(L.SCORE_WINNER);
    else if (c.loose_time <= 0) {
      const pourmille = Math.trunc((G.ACTIVE_FIGHTERS[c.team]! * fill_level) / G.CURRENT_ARMY_SIZE);
      s = `${Math.trunc(pourmille / 10)}.${pourmille % 10}%`;
    } else {
      const time = Math.trunc((c.loose_time * fill_level) / 1000);
      s = `${p2(Math.trunc(time / 60))}:${p2(time % 60)}`;
    }
  } else {
    const tombola = Math.trunc((LW_SCORE_TOMBOLA_RESULT[indice]! * fill_level) / 1000);
    s = String(tombola).padStart(3, '0');
  }
  return s.slice(0, 32);
}

function init_tombola(): void {
  for (let i = 0; i < NB_TEAMS; ++i) LW_SCORE_TOMBOLA_RESULT[i] = (random() % LW_SCORE_TOMBOLA_MAX) + 1;
}

function draw_score_bitmap(bitmap: Bitmap, cursor: number, ellipse_h: number, fill_level: number): number {
  let w = bitmap.w;
  if (!(w & 1)) w -= 1;
  const h = bitmap.h;
  const y_rect1 = Math.trunc(ellipse_h / 2);
  const y_rect2 = h - y_rect1 - 1;
  const x_mid = Math.trunc(w / 2);
  let color1 = 0, color2 = 0;
  if (cursor < 0) fill_level = 0;
  else {
    color1 = G.CURRENT_CURSOR[cursor]!.color_entry + Math.trunc(G.COLORS_PER_TEAM / 2);
    color2 = G.CURRENT_CURSOR[cursor]!.color_entry + G.COLORS_PER_TEAM - 1;
  }
  if (fill_level < 0) fill_level = 0;
  const to_be_filled = fill_level ? 1 : 0;
  const to_be_drawn = fill_level > 1000 ? 0 : 1;
  if (fill_level > 1000) fill_level = 1000;
  if (to_be_drawn) {
    fill_level = 1000 - fill_level;
    fill_level *= h - 3 * y_rect1;
    fill_level = Math.trunc(fill_level / 1000);
    fill_level += 2 * y_rect1;
    rectfill(bitmap, 0, 0, w, h, 0);
    if (to_be_filled) ellipsefill(bitmap, x_mid, y_rect2, x_mid, Math.trunc(ellipse_h / 2), color1);
    ellipse(bitmap, x_mid, y_rect2, x_mid, Math.trunc(ellipse_h / 2), MENU_FG);
    if (to_be_filled) {
      rectfill(bitmap, 1, fill_level, x_mid * 2 - 1, y_rect2 - 1, color1);
      ellipsefill(bitmap, x_mid, fill_level, x_mid - 1, Math.trunc(ellipse_h / 2) - 1, color2);
    }
    vline(bitmap, 0, y_rect1, y_rect2, MENU_FG);
    vline(bitmap, x_mid * 2, y_rect1, y_rect2, MENU_FG);
    ellipse(bitmap, x_mid, y_rect1, x_mid, Math.trunc(ellipse_h / 2), MENU_FG);
  }
  return to_be_drawn;
}

export async function display_scores(): Promise<number> {
  let last_draw_done = 0;
  let retour = 0;
  let choix = MENU_QUICK_MAIN;
  const d = dialogArray(11);
  const buf = ['', '', ''];
  const buf_old = ['', '', ''];
  const time_delay = [500, 2500, 1500];
  const done = [0, 0, 0];
  quick_buttons(d);
  for (let i = 0; i < 3; ++i) {
    standard_small_button(d[i + 4]!, i, 10, 3, 11);
    d[i + 4]!.proc = my_textbox_proc;
  }
  d[4]!.dp = d[5]!.dp = d[6]!.dp = '';
  standard_button(d[7]!, 0, 4, 3, 11);
  standard_button(d[8]!, 1, 0, 3, 11);
  standard_button(d[9]!, 2, 2, 3, 11);
  for (let i = 0; i < 3; ++i) {
    d[i + 7]!.proc = my_textbox_proc;
    d[i + 7]!.flags = D_HIDDEN;
  }
  d[7]!.dp = d[8]!.dp = d[9]!.dp = '';
  d[10]!.proc = null;
  init_tombola();
  const ellipse_h = d[4]!.h;
  const y = d[4]!.y - menu_real_y(MENU_H_SPACE);
  const h = [0, 2 * y - screenRef.screen.h, 0];
  h[0] = Math.trunc(h[1]! / 2);
  h[2] = Math.trunc((3 * h[1]!) / 4);
  const w = d[4]!.w;
  const x = [d[4]!.x, d[5]!.x, d[6]!.x];
  const cursor = [get_cursor(3), get_cursor(1), get_cursor(2)];
  const eprouvette: Bitmap[] = [];
  for (let i = 0; i < 3; ++i) {
    done[i] = 0;
    buf[i] = write_score(cursor[i]!, 0);
    buf_old[i] = '';
    eprouvette[i] = create_bitmap(w, h[i]!);
  }
  d[MENU_QUICK_QUIT]!.flags = D_HIDDEN;
  d[MENU_QUICK_PLAY]!.flags = D_HIDDEN;
  display_back_image();
  let dp = await my_init_dialog(d, 0);
  await my_update_dialog(dp);
  await shutdown_dialog(dp);
  my_fade_in();
  play_win();
  const first_ticker = sys.ticker();
  while (retour === 0) {
    if (!last_draw_done) {
      dp = await my_init_dialog(d, choix);
      while ((await my_update_dialog(dp)) && !last_draw_done) {
        let diff_ticker = sys.ticker() - first_ticker;
        if (cursor[0]! < 0) diff_ticker += 1000;
        for (let i = 0; i < 3; ++i) {
          if (!done[i]) {
            const fill_level = diff_ticker - time_delay[i]!;
            if (draw_score_bitmap(eprouvette[i]!, cursor[i]!, ellipse_h, fill_level)) {
              draw_sprite(screenRef.screen, eprouvette[i]!, x[i]!, y - h[i]!);
              if (fill_level > 0) {
                buf[i] = write_score(cursor[i]!, fill_level);
                if (buf[i] !== buf_old[i]) {
                  d[4 + i]!.dp = buf[i];
                  await d[4 + i]!.proc!(MSG_DRAW, d[4 + i]!, 0);
                  buf_old[i] = buf[i]!;
                }
              }
            } else {
              if (i === 1) last_draw_done = 1;
              d[7 + i]!.dp = G.CURRENT_CURSOR[cursor[i]!]?.name ?? '';
              d[7 + i]!.flags = 0;
              await d[7 + i]!.proc!(MSG_DRAW, d[7 + i]!, 0);
              done[i] = 1;
            }
          }
        }
        await rest(10);
      }
      choix = await shutdown_dialog(dp);
    }
    if (last_draw_done) {
      for (let i = 0; i < 3; ++i) draw_sprite(screenRef.screen, eprouvette[i]!, x[i]!, y - h[i]!);
      d[MENU_QUICK_QUIT]!.flags = D_EXIT;
      d[MENU_QUICK_PLAY]!.flags = D_EXIT;
      choix = await my_do_dialog_no_clear(d, last_draw_done === 1 ? MENU_QUICK_BACK : choix);
      last_draw_done = 2;
    }
    switch (choix) {
      case -1:
      case MENU_QUICK_BACK:
        retour = 1;
        break;
      case MENU_QUICK_MAIN:
        retour = MENU_TOP;
        break;
      case MENU_QUICK_QUIT:
        if (await confirm_quit()) retour = MENU_EXIT;
        else display_back_image();
        break;
      case MENU_QUICK_PLAY:
        retour = MENU_PLAY;
        break;
    }
  }
  if (retour > 0) retour--;
  return retour;
}
