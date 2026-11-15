// C-Dogs SDL 2.5.0, translated: drawn buttons (draw/drawtools.c DrawOneButton, DrawButton, DrawDirectionButtons,
// DrawKeyboardMenuButtons). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { CMD_DOWN, CMD_HAS_DIRECTION, CMD_DIRECTIONS, CMD_LEFT, CMD_RIGHT, CMD_UP, CmdToDirection, colorWhite, type Color, type Vec2i } from '../core/base.ts';
import { PicManagerGetSprites, gPicManager, type NamedSprites } from '../core/pics.ts';
import { INPUT_DEVICE_JOYSTICK, INPUT_DEVICE_KEYBOARD } from '../core/types.ts';
import {
  ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, GetOnePlayerCmd, InputGetButtonNameColor, KeyIsDown, SDL_SCANCODE_DOWN,
  SDL_SCANCODE_LEFT, SDL_SCANCODE_RIGHT, SDL_SCANCODE_UP,
} from '../platform/input.ts';
import { FontStrMask, FontStrW, PicRender } from './gfx.ts';

export function DrawOneButton(bg: NamedSprites | null, label: string, c: Color, isDown: boolean, pos: Vec2i): Vec2i {
  let totalW = FontStrW(label);
  let textOffsetX = 0;
  if (bg) {
    const pic = bg.pics[isDown ? 1 : 0];
    textOffsetX = Math.trunc((pic.size.x - totalW) / 2);
    totalW = pic.size.x + 1;
    PicRender(pic, { x: pos.x, y: pos.y - 1 }, colorWhite);
  }
  FontStrMask(label, { x: pos.x + textOffsetX, y: pos.y + (isDown ? 1 : 0) }, c);
  return { x: pos.x + totalW, y: pos.y };
}
export function DrawButton(inputDevice: number, deviceIndex: number, cmd: number, pos: Vec2i): Vec2i {
  const { name, color } = InputGetButtonNameColor(inputDevice, deviceIndex, cmd);
  let bg: NamedSprites | null = null;
  if (inputDevice === INPUT_DEVICE_KEYBOARD) bg = PicManagerGetSprites(gPicManager, 'key_back');
  else if (inputDevice === INPUT_DEVICE_JOYSTICK) bg = PicManagerGetSprites(gPicManager, 'button_back');
  else return pos;
  const isDown = (GetOnePlayerCmd(false, inputDevice, deviceIndex) & cmd) !== 0;
  if (name.length > 1) {
    const r = DrawOneButton(bg, name, color, isDown, { x: pos.x, y: pos.y + 8 });
    return { x: r.x, y: r.y - 8 };
  }
  return DrawOneButton(bg, name, color, isDown, pos);
}
export function DrawDirectionButtons(inputDevice: number, deviceIndex: number, pos: Vec2i): Vec2i {
  if (inputDevice === INPUT_DEVICE_KEYBOARD) {
    const bg = PicManagerGetSprites(gPicManager, 'key_back')!.pics[0];
    for (let cmd = CMD_LEFT; cmd <= CMD_DOWN; cmd <<= 1) {
      let bp = pos;
      if (cmd === CMD_RIGHT) bp = { x: pos.x + bg.size.x * 2 + 2, y: pos.y };
      else if (cmd === CMD_UP) bp = { x: pos.x + bg.size.x + 1, y: pos.y - bg.size.y - 1 };
      else if (cmd === CMD_DOWN) bp = { x: pos.x + bg.size.x + 1, y: pos.y };
      DrawButton(inputDevice, deviceIndex, cmd, bp);
    }
    return { x: pos.x + bg.size.x * 3 + 2, y: pos.y };
  }
  if (inputDevice === INPUT_DEVICE_JOYSTICK) {
    const ns = PicManagerGetSprites(gPicManager, 'dpad')!;
    const cmd = GetOnePlayerCmd(false, inputDevice, deviceIndex) & CMD_DIRECTIONS;
    const pic = ns.pics[CMD_HAS_DIRECTION(cmd) ? CmdToDirection(cmd) : 8];
    PicRender(pic, { x: pos.x, y: pos.y - 4 }, colorWhite);
    return { x: pos.x + pic.size.x + 2, y: pos.y };
  }
  return pos;
}
export function DrawKeyboardMenuButtons(pos: Vec2i): Vec2i {
  const ns = PicManagerGetSprites(gPicManager, 'key_back')!;
  const bg = ns.pics[0];
  const list: [string, number, Vec2i][] = [
    [ARROW_LEFT, SDL_SCANCODE_LEFT, pos],
    [ARROW_RIGHT, SDL_SCANCODE_RIGHT, { x: pos.x + bg.size.x * 2 + 2, y: pos.y }],
    [ARROW_UP, SDL_SCANCODE_UP, { x: pos.x + bg.size.x + 1, y: pos.y - bg.size.y - 1 }],
    [ARROW_DOWN, SDL_SCANCODE_DOWN, { x: pos.x + bg.size.x + 1, y: pos.y }],
  ];
  for (const [label, key, p] of list) DrawOneButton(ns, label, colorWhite, KeyIsDown(key), p);
  return { x: pos.x + bg.size.x * 3 + 2, y: pos.y };
}
export const buttonHooks = { drawButton: DrawButton, drawDirectionButtons: DrawDirectionButtons };
