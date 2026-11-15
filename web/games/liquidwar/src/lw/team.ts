// lw/team.ts: src/team.c: the teams' menu: six boxes with name, control (off, human, computer), colour
// and keys.

import { d_box_proc, type Dialog, dialogArray, D_EXIT, MSG_DRAW } from '../al/gui.ts';
import { clear_keybuf } from '../al/keyboard.ts';
import { CharBuf, my_button_proc, my_edit_proc } from './alleg2.ts';
import { display_back_image } from './back.ts';
import { color_one_dialog, menu_real_x, menu_real_y, my_do_dialog_no_clear, quick_buttons } from './dialog.ts';
import { wait_key_pressed, wait_no_key } from './keyboard.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { confirm_quit } from './menu.ts';
import { lw_mouse_reset_control } from './mouse.ts';
import { my_set_palette, set_palette_for_choose_color } from './palette.ts';
import { play_click } from './sound.ts';
import {
  CONFIG_CONTROL_TYPE_CPU, CONFIG_CONTROL_TYPE_HUMAN, CONFIG_CONTROL_TYPE_OFF, G, MENU_BG, MENU_EXIT, MENU_H_SPACE,
  MENU_H_TEAM, MENU_PLAY, MENU_QUICK_BACK, MENU_QUICK_MAIN, MENU_QUICK_PLAY, MENU_QUICK_QUIT, MENU_TOP, MENU_VIRTUAL_H,
  MENU_VIRTUAL_W, MENU_W_SPACE, MENU_W_TEAM, NAME_SIZE, NB_TEAMS,
} from './state.ts';

// prettier-ignore
const MENU_KEY_NAMES = [
  'None', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
  'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Pad0', 'Pad1', 'Pad2', 'Pad3', 'Pad4', 'Pad5',
  'Pad6', 'Pad7', 'Pad8', 'Pad9', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'ESC', '~',
  '-', '=', 'Back', 'Tab', '{', '}', 'Enter', ':', '\'', '\\', '\\', ',', '.', '/', 'Space', 'Ins', 'Del', 'Home', 'End',
  'Pgup', 'Pgdn', '<', '>', '/\\', '\\/', 'Pad/', '*', 'Pad-', 'Pad+', 'Pad.', 'PadE', 'PScr', 'Pause', 'LShf', 'RShf',
  'LCnt', 'RCnt', 'Alt', 'Altgr', 'LWin', 'RWin', 'Menu', 'SLock', 'NLock', 'CLock', 'None', 'None', 'None', 'None',
  'J1/\\', 'J1>', 'J1\\/', 'J1<', 'J1B1', 'J1B2', 'J1B3', 'J1B4', 'J2/\\', 'J2>', 'J2\\/', 'J2<', 'J2B1', 'J2B2', 'M/\\',
  'M>', 'M\\/', 'M<',
];

export function get_key_name(num: number): string {
  return MENU_KEY_NAMES[num] ?? 'None';
}

/** lw_netmess_cleanup_arg (netmess.c): control characters, quotes and commas become spaces */
export function cleanup_arg(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i) & 0xff;
    out += c < 32 || c > 127 || c === 0x27 || c === 0x22 || c === 0x2c ? ' ' : s[i];
  }
  return out;
}

function suppress_conflicting_color(color: number, replacement: number): number {
  let n = -1;
  for (let i = 0; i < NB_TEAMS; ++i) {
    if (G.CONFIG_TEAM_COLOR[i] === color) G.CONFIG_TEAM_COLOR[(n = i)] = replacement;
  }
  return n;
}

async function change_key(d: Dialog, set: (v: number) => void): Promise<void> {
  lw_mouse_reset_control();
  await wait_no_key();
  const v = await wait_key_pressed();
  set(v);
  play_click();
  clear_keybuf();
  d.dp = get_key_name(v);
}

function update_team_box(d: Dialog[], b: number, number: number): void {
  switch (G.CONFIG_CONTROL_TYPE[number]) {
    case CONFIG_CONTROL_TYPE_OFF:
      d[b + 15]!.dp = lw_lang_string(L.TEAM_OFF);
      break;
    case CONFIG_CONTROL_TYPE_HUMAN:
      d[b + 15]!.dp = lw_lang_string(L.TEAM_HUMAN);
      break;
    case CONFIG_CONTROL_TYPE_CPU:
      d[b + 15]!.dp = lw_lang_string(L.TEAM_CPU);
      break;
    default:
      d[b + 15]!.dp = '???';
  }
  d[b]!.bg = G.CONFIG_CONTROL_TYPE[number] === CONFIG_CONTROL_TYPE_OFF ? MENU_BG : 128 + G.CONFIG_TEAM_COLOR[number]! * 10;
}

async function redraw_team_box(d: Dialog[], b: number, number: number): Promise<void> {
  update_team_box(d, b, number);
  for (let i = 0; i < 20; ++i) await d[b + i]!.proc!(MSG_DRAW, d[b + i]!, 0);
}

function team_param(d: Dialog[], b: number, x: number, y: number, number: number): void {
  d[b]!.x = x;
  d[b]!.y = y;
  const w1 = Math.trunc((menu_real_x(MENU_W_TEAM - 2 * MENU_W_SPACE) + 2) / 12);
  const w2 = Math.trunc((menu_real_x(MENU_W_TEAM - 2 * MENU_W_SPACE) + 2) / 2);
  const w3 = menu_real_x(MENU_W_TEAM - 2 * MENU_W_SPACE) + 2;
  const h = Math.trunc((menu_real_y(MENU_H_TEAM - 2 * MENU_H_SPACE) + 2) / 6);
  x += 2 + menu_real_x(MENU_W_SPACE);
  y += 2 + menu_real_y(MENU_H_SPACE);
  for (let i = 0; i < 20; ++i) {
    const o = d[b + i]!;
    o.proc = my_button_proc;
    o.key = 0;
    o.dp = '';
    o.flags = D_EXIT;
    o.h = h - 2;
    color_one_dialog(o);
  }
  d[b]!.proc = d_box_proc;
  d[b]!.w = menu_real_x(MENU_W_TEAM);
  d[b]!.h = menu_real_y(MENU_H_TEAM);
  d[b + 1]!.proc = d_box_proc;
  d[b + 1]!.x = d[b + 2]!.x = x;
  d[b + 1]!.y = d[b + 2]!.y = y;
  d[b + 1]!.w = d[b + 2]!.w = w3 - 2;
  for (let i = 2; i < 14; ++i) {
    d[b + i]!.x = x + (i - 2) * w1;
    d[b + i]!.y = y + 2 * h;
    d[b + i]!.w = w1 - 2;
    d[b + i]!.bg = 128 + (i - 2) * 10;
  }
  for (let i = 16; i < 20; ++i) d[b + i]!.w = w2 - 2;
  d[b + 14]!.x = d[b + 1]!.x + 1;
  d[b + 14]!.y = d[b + 1]!.y + 1;
  d[b + 14]!.w = d[b + 1]!.w - 2;
  d[b + 15]!.x = x + Math.trunc(w2 / 4);
  d[b + 15]!.y = y + h;
  d[b + 15]!.w = Math.trunc((3 * w2) / 2) - 2;
  d[b + 14]!.proc = my_edit_proc;
  d[b + 14]!.dp = new CharBuf(() => G.CONFIG_PLAYER_NAME[number]!, (s) => {
    G.CONFIG_PLAYER_NAME[number] = s;
  });
  d[b + 14]!.d1 = NAME_SIZE;
  d[b + 14]!.flags = 0;
  d[b + 16]!.x = d[b + 19]!.x = x + Math.trunc(w2 / 2);
  d[b + 17]!.x = x;
  d[b + 18]!.x = x + w2;
  d[b + 16]!.y = y + 3 * h;
  d[b + 17]!.y = d[b + 18]!.y = y + 4 * h;
  d[b + 19]!.y = y + 5 * h;
  d[b + 16]!.dp = get_key_name(G.CONFIG_KEY_UP[number]!);
  d[b + 17]!.dp = get_key_name(G.CONFIG_KEY_LEFT[number]!);
  d[b + 18]!.dp = get_key_name(G.CONFIG_KEY_RIGHT[number]!);
  d[b + 19]!.dp = get_key_name(G.CONFIG_KEY_DOWN[number]!);
  update_team_box(d, b, number);
}

export async function choose_teams(): Promise<number> {
  let retour = 0;
  const d = dialogArray(125);
  let choix = 0;
  quick_buttons(d);
  let x1 = Math.trunc((MENU_VIRTUAL_W - (3 * MENU_W_TEAM + 2 * MENU_W_SPACE)) / 2);
  let x2 = x1 + MENU_W_TEAM + MENU_W_SPACE;
  let x3 = x2 + MENU_W_TEAM + MENU_W_SPACE;
  let y1 = Math.trunc((MENU_VIRTUAL_H - (2 * MENU_H_TEAM + MENU_H_SPACE)) / 2);
  let y2 = y1 + MENU_H_TEAM + MENU_H_SPACE;
  x1 = menu_real_x(x1);
  x2 = menu_real_x(x2);
  x3 = menu_real_x(x3);
  y1 = menu_real_y(y1);
  y2 = menu_real_y(y2);
  team_param(d, 4, x1, y1, 0);
  team_param(d, 24, x2, y1, 1);
  team_param(d, 44, x3, y1, 2);
  team_param(d, 64, x1, y2, 3);
  team_param(d, 84, x2, y2, 4);
  team_param(d, 104, x3, y2, 5);
  d[124]!.proc = null;
  set_palette_for_choose_color();
  my_set_palette();
  display_back_image();
  while (retour === 0) {
    choix = await my_do_dialog_no_clear(d, choix);
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
      default: {
        const team = Math.trunc((choix - 4) / 20);
        const type = (choix - 4) % 20;
        const b = 4 + 20 * team;
        switch (type) {
          case 15:
            switch (G.CONFIG_CONTROL_TYPE[team]) {
              case CONFIG_CONTROL_TYPE_OFF:
                G.CONFIG_CONTROL_TYPE[team] = CONFIG_CONTROL_TYPE_HUMAN;
                break;
              case CONFIG_CONTROL_TYPE_HUMAN:
                G.CONFIG_CONTROL_TYPE[team] = CONFIG_CONTROL_TYPE_CPU;
                break;
              default:
                G.CONFIG_CONTROL_TYPE[team] = CONFIG_CONTROL_TYPE_OFF;
            }
            await redraw_team_box(d, b, team);
            break;
          case 16:
            await change_key(d[choix]!, (v) => (G.CONFIG_KEY_UP[team] = v));
            break;
          case 17:
            await change_key(d[choix]!, (v) => (G.CONFIG_KEY_LEFT[team] = v));
            break;
          case 18:
            await change_key(d[choix]!, (v) => (G.CONFIG_KEY_RIGHT[team] = v));
            break;
          case 19:
            await change_key(d[choix]!, (v) => (G.CONFIG_KEY_DOWN[team] = v));
            break;
          default:
            if (type >= 2 && type < 14) {
              const i = suppress_conflicting_color(type - 2, G.CONFIG_TEAM_COLOR[team]!);
              if (i >= 0) await redraw_team_box(d, 4 + 20 * i, i);
              G.CONFIG_TEAM_COLOR[team] = type - 2;
              await redraw_team_box(d, b, team);
            }
        }
      }
    }
  }
  for (let i = 0; i < NB_TEAMS; ++i) G.CONFIG_PLAYER_NAME[i] = cleanup_arg(G.CONFIG_PLAYER_NAME[i]!);
  if (retour > 0) retour--;
  return retour;
}
