// C-Dogs SDL 2.5.0, translated: the player's menus (player_select_menus.c), the name generator (namegen.c) and the
// player displays of the menus (menu_utils.c). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CLAMP_OPPOSITE, CMD_BUTTON1, CMD_BUTTON2, CMD_DOWN, CMD_LEFT, CMD_RIGHT, CMD_UP, DIRECTION_DOWN, DIRECTION_UP, DIRECTION_UPLEFT,
  MAX, Button1, Button2, Down, Left, Right, Up, colorWhite, rand, type Vec2i,
} from '../core/base.ts';
import { CharacterShuffleAppearance, gCharacterClasses } from '../core/classes.ts';
import {
  CHAR_COLOR_ARMS, CHAR_COLOR_BODY, CHAR_COLOR_FACEHAIR, CHAR_COLOR_FEET, CHAR_COLOR_GLASSES, CHAR_COLOR_HAIR, CHAR_COLOR_HAT,
  CHAR_COLOR_LEGS, CHAR_COLOR_SKIN, CharColorGetByType, CharColorSetByType, HEAD_PART_COUNT, PicManagerGetPic, gPicManager,
  pixelToColor, type Pic,
} from '../core/pics.ts';
import { INPUT_DEVICE_AI, INPUT_DEVICE_JOYSTICK, INPUT_DEVICE_KEYBOARD, INPUT_DEVICE_UNSET, MAX_WEAPONS, type WeaponClass } from '../core/types.ts';
import { PlayerDataGetByUID } from '../core/player.ts';
import { gData } from '../core/data.ts';
import { gSoundDevice, SoundPlay, StrSound } from '../core/sounds.ts';
import { MatGetFootstepSound } from '../core/actors.ts';
import {
  PlayerTemplateFromPlayerData, PlayerTemplateGetById, PlayerTemplateGetNum, PlayerTemplateToPlayerData, PlayerTemplatesSaveText,
  gPlayerTemplates, newPlayerTemplate, type PlayerTemplate,
} from '../core/templates.ts';
import { ev, JoyName } from '../platform/input.ts';
import { DrawRectangle, FontStr, FontStrMask, FontStrW, FontH, gGfx } from '../render/gfx.ts';
import { DrawCharacterSimple } from '../render/draw.ts';
import { DrawButton, DrawDirectionButtons } from '../render/buttons.ts';
import {
  DisplayMenuItem, MENU_ALIGN_LEFT, MENU_SOUND_BACK, MENU_SOUND_ENTER, MENU_SOUND_ERROR, MENU_SOUND_SWITCH, MENU_TYPE_NORMAL,
  MENU_TYPE_RETURN, MenuAddExitType, MenuAddSubmenu, MenuCreateBack, MenuCreateCustom, MenuCreateNormal, MenuCreateSeparator,
  MenuCreateVoidFunc, MenuClearSubmenus, MenuGetSubmenuByName, MenuPlaySound, MenuSetCustomDisplay, MenuSetPostEnterFunc,
  MenuSetPostInputFunc, MenuSetPostUpdateFunc, MenuSystemAddCustomDisplay, MenuSystemInit, type Menu, type MenuSystem,
} from './menu.ts';

// --- namegen.c -----------------------------------------------------------------------------------------------------

export interface NameGen { prefixes: string[]; suffixes: string[]; suffixNames: string[] }
function lines(path: string): string[] {
  const t = gData.text.get(path) ?? '';
  const l = t.split('\n');
  if (l.length && l[l.length - 1] === '') l.pop();
  return l.map((s) => s.replace(/\r$/, ''));
}
export function NameGenInit(): NameGen {
  return { prefixes: lines('data/prefixes.txt'), suffixes: lines('data/suffixes.txt'), suffixNames: lines('data/suffixnames.txt') };
}
const lower = (c: string): string => (c >= 'A' && c <= 'Z' ? String.fromCharCode(c.charCodeAt(0) - 32) : c);
function IsSameWord(l: string, r: string): boolean {
  if (l.length !== r.length) return false;
  for (let i = 0; i < l.length; i++) if (lower(l[i]) !== lower(r[i])) return false;
  return true;
}
export function NameGenMake(g: NameGen): string {
  for (;;) {
    const prefix = g.prefixes[rand() % g.prefixes.length];
    const si = rand() % (g.suffixes.length + g.suffixNames.length);
    const suffix = si < g.suffixes.length ? g.suffixes[si] : g.suffixNames[si - g.suffixes.length];
    if (IsSameWord(prefix, suffix)) continue;
    return si >= g.suffixes.length ? `${prefix} ${suffix}` : prefix + suffix;
  }
}

// --- menu_utils.c --------------------------------------------------------------------------------------------------

export interface MenuDisplayPlayerData { PlayerUID: number; ms: MenuSystem | null; Dir: number; GunIdx: number }
export function DisplayCharacterAndName(pos: Vec2i, c: import('../core/types.ts').Character, d: number, name: string, color: import('../core/base.ts').Color, gun: WeaponClass | null): void {
  const p = { x: pos.x, y: pos.y + 8 };
  DrawCharacterSimple(c, p, d, false, false, gun);
  FontStrMask(name, { x: p.x - Math.trunc(FontStrW(name) / 2), y: p.y - 30 }, color);
}
export function MenuDisplayPlayer(_m: Menu | null, pos: Vec2i, size: Vec2i, data: unknown): void {
  const d = data as MenuDisplayPlayerData;
  const dPos = { x: pos.x - size.x, y: pos.y };
  const playerPos = { x: dPos.x + Math.trunc((size.x * 3) / 4) - 6, y: dPos.y + Math.trunc(size.y / 2) - 12 };
  const p = PlayerDataGetByUID(d.PlayerUID)!;
  const s = d.ms && d.ms.current && d.ms.current.name === 'Name' ? `>${p.name}<` : p.name;
  const gun = d.GunIdx >= 0 && d.GunIdx < MAX_WEAPONS ? p.guns[d.GunIdx] : null;
  DisplayCharacterAndName(playerPos, p.Char, d.Dir, s, colorWhite, gun);
}
export function InputDeviceName(d: number, idx: number): string {
  switch (d) {
    case INPUT_DEVICE_KEYBOARD: return 'Keyboard';
    case INPUT_DEVICE_JOYSTICK: return JoyName(idx);
    case INPUT_DEVICE_AI: return 'AI';
    default: return '';
  }
}
export function MenuDisplayPlayerControls(_m: Menu | null, pos: Vec2i, size: Vec2i, data: unknown): void {
  const p = PlayerDataGetByUID((data as { PlayerUID: number }).PlayerUID)!;
  const y = pos.y + size.y - 13;
  switch (p.inputDevice) {
    case INPUT_DEVICE_KEYBOARD: {
      let kp = { x: pos.x - Math.trunc((13 * 5 + 3) / 2), y };
      kp = DrawDirectionButtons(p.inputDevice, p.deviceIndex, kp);
      kp.x += 3;
      kp = DrawButton(p.inputDevice, p.deviceIndex, CMD_BUTTON1, kp);
      DrawButton(p.inputDevice, p.deviceIndex, CMD_BUTTON2, kp);
      break;
    }
    case INPUT_DEVICE_JOYSTICK: {
      let bp = { x: pos.x - Math.trunc((14 + 13 * 2) / 2), y };
      bp = DrawDirectionButtons(p.inputDevice, p.deviceIndex, bp);
      bp.x += 3;
      bp = DrawButton(p.inputDevice, p.deviceIndex, CMD_BUTTON1, bp);
      DrawButton(p.inputDevice, p.deviceIndex, CMD_BUTTON2, bp);
      break;
    }
    case INPUT_DEVICE_AI: {
      const s = `(${InputDeviceName(p.inputDevice, p.deviceIndex)})`;
      FontStr(s, { x: pos.x - Math.trunc(FontStrW(s) / 2), y });
      break;
    }
    case INPUT_DEVICE_UNSET: {
      const s = '(no device; plug in a controller)';
      FontStr(s, { x: pos.x - Math.trunc(FontStrW(s) / 2), y });
      break;
    }
    default:
      break;
  }
}

// --- player_select_menus.c -----------------------------------------------------------------------------------------

const letters = "1234567890-QWERTYUIOP!ASDFGHJKL:'ZXCVBNM, .?";
const smallLetters = "1234567890-qwertyuiop!asdfghjkl:'zxcvbnm, .?";
const ENTRY_COLS = 11;
const ENTRY_SPACING = 7;
const PLAYER_NAME_MAXLEN = 20;
type Rect = { Pos: Vec2i; Size: Vec2i };
const inside = (r: Rect, p: Vec2i): boolean => p.x >= r.Pos.x && p.x < r.Pos.x + r.Size.x && p.y >= r.Pos.y && p.y < r.Pos.y + r.Size.y;

interface ColorMenuData { Type: number; PlayerUID: number; ms: MenuSystem; palette: Pic; selectedColor: Vec2i }
export interface PlayerSelectMenuData {
  display: MenuDisplayPlayerData;
  ms: MenuSystem;
  nameMenuSelection: number;
  nameGenerator: NameGen;
  playerTemplate: PlayerTemplate;
}
export interface PlayerSelectMenu { ms: MenuSystem; data: PlayerSelectMenuData }

function NameMenuItemBounds(b: Rect, i: number, label: string): Rect {
  const dy = FontH();
  const y = b.Pos.y + Math.trunc((b.Size.y - dy * Math.trunc((letters.length - 1) / ENTRY_COLS)) / 2);
  return { Pos: { x: b.Pos.x + (i % ENTRY_COLS) * ENTRY_SPACING, y: y + Math.trunc(i / ENTRY_COLS) * dy }, Size: { x: MAX(FontStrW(label), ENTRY_SPACING), y: dy } };
}
function DrawNameMenu(_m: Menu | null, pos: Vec2i, size: Vec2i, data: unknown): void {
  const d = data as PlayerSelectMenuData;
  let i = 0;
  for (; i < letters.length; i++) DisplayMenuItem(NameMenuItemBounds({ Pos: pos, Size: size }, i, letters[i]), letters[i], i === d.nameMenuSelection, false, colorWhite);
  DisplayMenuItem(NameMenuItemBounds({ Pos: pos, Size: size }, i, '(End)'), '(End)', i === d.nameMenuSelection, false, colorWhite);
}
function NameMenuPostUpdate(menu: Menu, data: unknown): void {
  const d = data as PlayerSelectMenuData;
  if (!ev.mouse.moved) return;
  menu.mouseHover = false;
  const r = { Pos: d.ms.pos, Size: d.ms.size };
  let i = 0;
  for (; i < letters.length; i++) {
    if (!inside(NameMenuItemBounds(r, i, letters[i]), ev.mouse.pos)) continue;
    menu.mouseHover = true;
    if (d.nameMenuSelection !== i) {
      d.nameMenuSelection = i;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
    break;
  }
  if (inside(NameMenuItemBounds(r, i, '(End)'), ev.mouse.pos)) {
    menu.mouseHover = true;
    if (d.nameMenuSelection !== i) {
      d.nameMenuSelection = i;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  }
}
function HandleInputNameMenu(cmd: number, data: unknown): boolean {
  const d = data as PlayerSelectMenuData;
  const p = PlayerDataGetByUID(d.display.PlayerUID)!;
  if (Button1(cmd)) {
    if (d.nameMenuSelection === letters.length) {
      MenuPlaySound(MENU_SOUND_ENTER);
      return true;
    }
    if (p.name.length < PLAYER_NAME_MAXLEN - 1) {
      const l = p.name.length;
      p.name += l > 0 && p.name[l - 1] !== ' ' ? smallLetters[d.nameMenuSelection] : letters[d.nameMenuSelection];
      MenuPlaySound(MENU_SOUND_ENTER);
    } else {
      MenuPlaySound(MENU_SOUND_ERROR);
    }
  } else if (Button2(cmd)) {
    if (p.name.length > 0) {
      p.name = p.name.slice(0, -1);
      MenuPlaySound(MENU_SOUND_BACK);
    } else {
      MenuPlaySound(MENU_SOUND_ERROR);
    }
  } else if (Left(cmd)) {
    if (d.nameMenuSelection > 0) {
      d.nameMenuSelection--;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Right(cmd)) {
    if (d.nameMenuSelection < letters.length) {
      d.nameMenuSelection++;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Up(cmd)) {
    if (d.nameMenuSelection >= ENTRY_COLS) {
      d.nameMenuSelection -= ENTRY_COLS;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  } else if (Down(cmd)) {
    if (d.nameMenuSelection <= letters.length - ENTRY_COLS) {
      d.nameMenuSelection += ENTRY_COLS;
      MenuPlaySound(MENU_SOUND_SWITCH);
    } else if (d.nameMenuSelection < letters.length) {
      d.nameMenuSelection = letters.length;
      MenuPlaySound(MENU_SOUND_SWITCH);
    }
  }
  return false;
}
function PostInputRotatePlayer(_m: Menu, cmd: number, data: unknown): void {
  const d = data as MenuDisplayPlayerData;
  const dx = Left(cmd) ? 1 : Right(cmd) ? -1 : 0;
  if (dx !== 0) {
    d.Dir = CLAMP_OPPOSITE(d.Dir + dx, DIRECTION_UP, DIRECTION_UPLEFT);
    const p = PlayerDataGetByUID(d.PlayerUID)!;
    SoundPlay(gSoundDevice, StrSound(MatGetFootstepSound(p.Char.Class!, null)));
  }
}
function CreateFaceMenu(data: MenuDisplayPlayerData): Menu {
  const menu = MenuCreateNormal('Face / Body', '', MENU_TYPE_NORMAL, 0);
  menu.maxItems = 11;
  for (const c of gCharacterClasses.Classes) MenuAddSubmenu(menu, MenuCreateBack(c.Name));
  for (const c of gCharacterClasses.CustomClasses) MenuAddSubmenu(menu, MenuCreateBack(c.Name));
  MenuSetPostInputFunc(menu, (m, cmd, dd) => {
    const p = PlayerDataGetByUID((dd as MenuDisplayPlayerData).PlayerUID)!;
    p.Char.Class = m.index < gCharacterClasses.Classes.length ? gCharacterClasses.Classes[m.index]
      : gCharacterClasses.CustomClasses[m.index - gCharacterClasses.Classes.length];
    PostInputRotatePlayer(m, cmd, dd);
  }, data);
  return menu;
}
const HEAD_PART_NAMES = ['Hair', 'Facial Hair', 'Hat', 'Glasses'];
function CreateHeadPartMenu(data: PlayerSelectMenuData, hp: number): Menu {
  const menu = MenuCreateNormal(HEAD_PART_NAMES[hp], '', MENU_TYPE_NORMAL, 0);
  menu.maxItems = 11;
  MenuAddSubmenu(menu, MenuCreateBack('(None)'));
  for (const h of gPicManager.headPartNames[hp]) MenuAddSubmenu(menu, MenuCreateBack(h));
  const hpmd = { PlayerUID: data.display.PlayerUID, Dir: 0 };
  MenuSetPostInputFunc(menu, (m, cmd) => {
    const p = PlayerDataGetByUID(hpmd.PlayerUID)!;
    p.Char.HeadParts[hp] = m.index > 0 ? gPicManager.headPartNames[hp][m.index - 1] : null;
    PostInputRotatePlayer(m, cmd, data.display);
  }, null);
  return menu;
}
function ColorSwatchBounds(b: Rect, palette: Pic, v: Vec2i): Rect {
  const sw = { x: 4, y: 4 };
  const dp = { x: b.Pos.x, y: b.Pos.y + Math.trunc((b.Size.y - palette.size.y * sw.y) / 2) };
  return { Pos: { x: dp.x + v.x * sw.x, y: dp.y + v.y * sw.y }, Size: sw };
}
function ColorMenuOnChange(d: ColorMenuData, v: Vec2i): void {
  if (v.x < 0 || v.y < 0 || v.x >= d.palette.size.x || v.y >= d.palette.size.y) return;
  if (d.selectedColor.x === v.x && d.selectedColor.y === v.y) return;
  const c = pixelToColor(d.palette.Data[v.x + v.y * d.palette.size.x]);
  if (c.a !== 0) {
    d.selectedColor = v;
    const p = PlayerDataGetByUID(d.PlayerUID)!;
    CharColorSetByType(p.Char.Colors, d.Type, c);
    MenuPlaySound(MENU_SOUND_SWITCH);
  }
}
function CreateColorMenu(name: string, ms: MenuSystem, type: number, playerUID: number): Menu {
  const palette = PicManagerGetPic(gPicManager, 'palette')!;
  const d: ColorMenuData = { Type: type, PlayerUID: playerUID, ms, palette, selectedColor: { x: 0, y: 0 } };
  let errorLowest = -1;
  const p = PlayerDataGetByUID(playerUID)!;
  const cur = CharColorGetByType(p.Char.Colors, type);
  for (let y = 0; y < palette.size.y; y++) {
    for (let x = 0; x < palette.size.x; x++) {
      const c = pixelToColor(palette.Data[x + y * palette.size.x]);
      if (c.a === 0) continue;
      const er = c.r - cur.r;
      const eg = c.g - cur.g;
      const eb = c.b - cur.b;
      const e = er * er + eg * eg + eb * eb;
      if (errorLowest === -1 || e < errorLowest) {
        errorLowest = e;
        d.selectedColor = { x, y };
      }
    }
  }
  const menu = MenuCreateCustom(name, (_m, pos, size) => {
    for (let y = 0; y < palette.size.y; y++) {
      for (let x = 0; x < palette.size.x; x++) {
        const c = pixelToColor(palette.Data[x + y * palette.size.x]);
        if (c.a === 0) continue;
        const r = ColorSwatchBounds({ Pos: pos, Size: size }, palette, { x, y });
        DrawRectangle(r.Pos, r.Size, c, true);
      }
    }
    const r = ColorSwatchBounds({ Pos: pos, Size: size }, palette, d.selectedColor);
    DrawRectangle({ x: r.Pos.x - 1, y: r.Pos.y - 1 }, { x: r.Size.x + 2, y: r.Size.y + 2 }, colorWhite, false);
  }, (cmd) => {
    const s = { ...d.selectedColor };
    switch (cmd) {
      case CMD_LEFT: s.x--; break;
      case CMD_RIGHT: s.x++; break;
      case CMD_UP: s.y--; break;
      case CMD_DOWN: s.y++; break;
      case CMD_BUTTON1:
      case CMD_BUTTON2:
        MenuPlaySound(MENU_SOUND_ENTER);
        return true;
      default: break;
    }
    ColorMenuOnChange(d, s);
    return false;
  }, d);
  MenuSetPostUpdateFunc(menu, (m) => {
    if (!ev.mouse.moved) return;
    m.mouseHover = false;
    for (let y = 0; y < palette.size.y; y++) {
      for (let x = 0; x < palette.size.x; x++) {
        if (!inside(ColorSwatchBounds({ Pos: d.ms.pos, Size: d.ms.size }, palette, { x, y }), ev.mouse.pos)) continue;
        m.mouseHover = true;
        ColorMenuOnChange(d, { x, y });
        return;
      }
    }
  }, null);
  return menu;
}
function LoadTemplateNamesAsMenuEntries(menu: Menu): void {
  MenuClearSubmenus(menu);
  for (let i = 0; ; i++) {
    const pt = PlayerTemplateGetById(i);
    if (pt == null) break;
    MenuAddSubmenu(menu, MenuCreateBack(pt.name));
  }
}
export const templateStore = { save: (_text: string): void => {} };
function CreateUseTemplateMenu(name: string, data: PlayerSelectMenuData): Menu {
  const menu = MenuCreateNormal(name, '', MENU_TYPE_NORMAL, 0);
  menu.maxItems = 11;
  MenuSetPostEnterFunc(menu, (m) => {
    LoadTemplateNamesAsMenuEntries(m);
    PlayerTemplateFromPlayerData(data.playerTemplate, PlayerDataGetByUID(data.display.PlayerUID)!);
    MenuAddSubmenu(m, MenuCreateSeparator(''));
    MenuAddSubmenu(m, MenuCreateBack('Back'));
  }, null);
  MenuSetPostInputFunc(menu, (_m, cmd) => {
    const p = PlayerDataGetByUID(data.display.PlayerUID)!;
    let clear = false;
    if (Button1(cmd)) clear = true;
    else if (Button2(cmd)) {
      PlayerTemplateToPlayerData(p, data.playerTemplate);
      clear = true;
    }
    if (clear) data.playerTemplate = newPlayerTemplate();
  }, null);
  MenuSetPostUpdateFunc(menu, (m) => {
    const p = PlayerDataGetByUID(data.display.PlayerUID)!;
    const t = PlayerTemplateGetById(m.index);
    PlayerTemplateToPlayerData(p, t ?? data.playerTemplate);
  }, null);
  return menu;
}
function CreateSaveTemplateMenu(name: string, data: PlayerSelectMenuData): Menu {
  const menu = MenuCreateNormal(name, '', MENU_TYPE_NORMAL, 0);
  menu.maxItems = 11;
  MenuSetPostEnterFunc(menu, (m) => {
    LoadTemplateNamesAsMenuEntries(m);
    MenuAddSubmenu(m, MenuCreateBack('(new)'));
    MenuAddSubmenu(m, MenuCreateSeparator(''));
    MenuAddSubmenu(m, MenuCreateBack('Back'));
  }, null);
  MenuSetPostInputFunc(menu, (m, cmd) => {
    if (!Button1(cmd) || m.index > PlayerTemplateGetNum()) return;
    const p = PlayerDataGetByUID(data.display.PlayerUID)!;
    let t = PlayerTemplateGetById(m.index);
    if (t == null) {
      t = newPlayerTemplate();
      gPlayerTemplates.Classes.push(t);
    }
    PlayerTemplateFromPlayerData(t, p);
    templateStore.save(PlayerTemplatesSaveText());
  }, null);
  MenuSetCustomDisplay(menu, (_m, pos) => FontStr(`Save ${PlayerDataGetByUID(data.display.PlayerUID)!.name}...`, pos), null);
  return menu;
}
function CheckReenableLoadMenu(menu: Menu): void {
  MenuGetSubmenuByName(menu, 'Load')!.isDisabled = PlayerTemplateGetById(0) == null;
}
function CreateCustomizeMenu(name: string, data: PlayerSelectMenuData): Menu {
  const menu = MenuCreateNormal(name, '', MENU_TYPE_NORMAL, 0);
  MenuAddSubmenu(menu, CreateFaceMenu(data.display));
  for (let hp = 0; hp < HEAD_PART_COUNT; hp++) MenuAddSubmenu(menu, CreateHeadPartMenu(data, hp));
  const uid = data.display.PlayerUID;
  for (const [n, t] of [['Skin Color', CHAR_COLOR_SKIN], ['Hair Color', CHAR_COLOR_HAIR], ['Facial Hair Color', CHAR_COLOR_FACEHAIR],
    ['Hat Color', CHAR_COLOR_HAT], ['Glasses Color', CHAR_COLOR_GLASSES], ['Arms Color', CHAR_COLOR_ARMS], ['Body Color', CHAR_COLOR_BODY],
    ['Legs Color', CHAR_COLOR_LEGS], ['Feet Color', CHAR_COLOR_FEET]] as [string, number][]) {
    MenuAddSubmenu(menu, CreateColorMenu(n, data.ms, t, uid));
  }
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Back'));
  MenuSetPostInputFunc(menu, PostInputRotatePlayer, data.display);
  MenuSetPostEnterFunc(menu, (m) => {
    const p = PlayerDataGetByUID(uid)!;
    for (let hp = 0; hp < HEAD_PART_COUNT; hp++) {
      const has = p.Char.Class!.HasHeadParts[hp];
      MenuGetSubmenuByName(m, HEAD_PART_NAMES[hp])!.isDisabled = !has;
      MenuGetSubmenuByName(m, `${HEAD_PART_NAMES[hp]} Color`)!.isDisabled = !has;
    }
  }, null);
  return menu;
}
export function PlayerSelectMenusCreate(numPlayers: number, player: number, playerUID: number, ng: NameGen): PlayerSelectMenu {
  const w = gGfx.w;
  const h = gGfx.h;
  let pos: Vec2i;
  let size: Vec2i;
  switch (numPlayers) {
    case 2: pos = { x: Math.trunc((player * w) / 2) + Math.trunc(w / 4), y: 0 }; size = { x: Math.trunc(w / 4), y: h }; break;
    case 3:
    case 4:
      pos = { x: Math.trunc(((player & 1) * w) / 2) + Math.trunc(w / 4), y: Math.trunc(Math.trunc(player / 2) * h / 2) };
      size = { x: Math.trunc(w / 4), y: Math.trunc(h / 2) };
      break;
    default: pos = { x: Math.trunc(w / 2), y: 0 }; size = { x: Math.trunc(w / 2), y: h }; break;
  }
  const ms = MenuSystemInit(pos, size);
  const data: PlayerSelectMenuData = {
    display: { PlayerUID: playerUID, ms, Dir: DIRECTION_DOWN, GunIdx: -1 }, ms, nameMenuSelection: letters.length, nameGenerator: ng,
    playerTemplate: newPlayerTemplate(),
  };
  ms.align = MENU_ALIGN_LEFT;
  ms.root = ms.current = MenuCreateNormal('', '', MENU_TYPE_NORMAL, 0);
  MenuSetPostInputFunc(ms.root, PostInputRotatePlayer, data.display);
  const nameMenu = MenuCreateCustom('Name', DrawNameMenu, HandleInputNameMenu, data);
  MenuSetPostUpdateFunc(nameMenu, NameMenuPostUpdate, data);
  MenuAddSubmenu(ms.root, nameMenu);
  MenuAddSubmenu(ms.root, CreateCustomizeMenu('Customize...', data));
  MenuAddSubmenu(ms.root, MenuCreateVoidFunc('Shuffle', () => {
    const p = PlayerDataGetByUID(playerUID)!;
    p.name = NameGenMake(ng);
    CharacterShuffleAppearance(p.Char);
  }, data));
  MenuAddSubmenu(ms.root, CreateUseTemplateMenu('Load', data));
  MenuAddSubmenu(ms.root, CreateSaveTemplateMenu('Save', data));
  MenuAddSubmenu(ms.root, MenuCreateSeparator(''));
  MenuAddSubmenu(ms.root, MenuCreateNormal('Done', '', MENU_TYPE_NORMAL, 0));
  ms.root.index = ms.root.subMenus.length - 1;
  MenuAddExitType(ms, MENU_TYPE_RETURN);
  MenuSystemAddCustomDisplay(ms, MenuDisplayPlayer, data.display);
  MenuSystemAddCustomDisplay(ms, MenuDisplayPlayerControls, data.display);
  CheckReenableLoadMenu(ms.root);
  MenuSetPostEnterFunc(ms.root, CheckReenableLoadMenu, null);
  return { ms, data };
}
