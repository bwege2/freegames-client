// C-Dogs SDL 2.5.0, translated: the menu system (menu.c). Options point at their value through get/set closures
// (the original's int and bool pointers). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CLAMP, CMD_ESC, MAX, MIN, AnyButton, Button1, Button2, Down, Left, Right, Up, CamelToTitle, colorDarkGray, colorRed,
  colorSelectedBG, colorTransparent, colorWhite, ColorEquals, type Color, type Vec2i,
} from '../core/base.ts';
import { ConfigGet, ConfigGetInt, type ConfigEntry } from '../core/config.ts';
import { gSoundDevice, SoundPlay, StrSound } from '../core/sounds.ts';
import { PicManagerGetPic, PicManagerGetSprites, gPicManager } from '../core/pics.ts';
import {
  ARROW_LEFT, ARROW_RIGHT, BACKSPACE_CHAR, ENTER_CHAR, EventIsEscape, GetMenuCmd, GetPlayerCmds, KeyGetPressed, KeyIsDown,
  SDL_GetScancodeName, SDL_SCANCODE_BACKSPACE, SDL_SCANCODE_ESCAPE, SDL_SCANCODE_F10, SDL_SCANCODE_F9, SDL_SCANCODE_RETURN,
  ev, KeyInit,
} from '../platform/input.ts';
import {
  ALIGN_CENTER, ALIGN_END, DrawRectangle, FontH, FontOptsNew, FontStr, FontStrH, FontStrMask, FontStrNumLines, FontStrOpt,
  FontStrW, PicRender, gGfx,
} from '../render/gfx.ts';
import { DrawKeyboardMenuButtons, DrawOneButton } from '../render/buttons.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData } from './loop.ts';

export const MENU_TYPE_NORMAL = 0;
export const MENU_TYPE_OPTIONS = 1;
export const MENU_TYPE_BASIC = 2;
export const MENU_TYPE_SET_OPTION_TOGGLE = 3;
export const MENU_TYPE_SET_OPTION_RANGE = 4;
export const MENU_TYPE_SET_OPTION_SEED = 5;
export const MENU_TYPE_SET_OPTION_UP_DOWN_VOID_FUNC_VOID = 6;
export const MENU_TYPE_SET_OPTION_RANGE_GET_SET = 7;
export const MENU_TYPE_SET_OPTION_CHANGE_KEY = 8;
export const MENU_TYPE_VOID_FUNC = 9;
export const MENU_TYPE_BACK = 10;
export const MENU_TYPE_QUIT = 11;
export const MENU_TYPE_RETURN = 12;
export const MENU_TYPE_CUSTOM = 13;
export const MENU_OPTION_DISPLAY_STYLE_NONE = 0;
export const MENU_OPTION_DISPLAY_STYLE_STR_FUNC = 1;
export const MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC = 2;
export const MENU_DISPLAY_ITEMS_CREDITS = 1;
export const MENU_DISPLAY_ITEMS_AUTHORS = 2;
export const MENU_ALIGN_CENTER = 0;
export const MENU_ALIGN_LEFT = 1;
export const MENU_SOUND_ENTER = 0;
export const MENU_SOUND_BACK = 1;
export const MENU_SOUND_SWITCH = 2;
export const MENU_SOUND_START = 3;
export const MENU_SOUND_ERROR = 4;
export const CDOGS_SDL_VERSION = 'v2.5.0';

export type MenuDisplayFunc = (menu: Menu | null, pos: Vec2i, size: Vec2i, data: unknown) => void;
export interface Menu {
  name: string;
  type: number;
  parentMenu: Menu | null;
  isDisabled: boolean;
  color: Color;
  enterSound: number;
  mouseHover: boolean;
  customPostEnterFunc: ((m: Menu, data: unknown) => void) | null;
  customPostEnterData: unknown;
  customPostUpdateFunc: ((m: Menu, data: unknown) => void) | null;
  customPostUpdateData: unknown;
  customPostInputFunc: ((m: Menu, cmd: number, data: unknown) => void) | null;
  customPostInputData: unknown;
  customDisplayFunc: MenuDisplayFunc | null;
  customDisplayData: unknown;
  // u.normal
  title: string;
  isSubmenusAlt: boolean;
  displayItems: number;
  changeKeyMenu: Menu | null;
  index: number;
  scroll: number;
  maxItems: number;
  align: number;
  quitMenuIndex: number;
  subMenus: Menu[];
  // u.option
  displayStyle: number;
  toggle: { get: () => boolean; set: (v: boolean) => void } | null;
  range: { get: () => number; set: (v: number) => void; low: number; high: number; increment: number } | null;
  upDown: { up: () => void; down: () => void } | null;
  str: (() => string) | null;
  intToStr: ((v: number) => string) | null;
  voidFunc: ((data: unknown) => void) | null;
  voidData: unknown;
  changeKey: { code: number; playerIndex: number; isOptional: boolean } | null;
  returnCode: number;
  custom: { displayFunc: MenuDisplayFunc; inputFunc: ((cmd: number, data: unknown) => boolean) | null; data: unknown } | null;
}
export interface MenuSystem {
  root: Menu | null;
  current: Menu | null;
  exitTypes: number[];
  customDisplayFuncs: { Func: MenuDisplayFunc; Data: unknown }[];
  pos: Vec2i;
  size: Vec2i;
  align: number;
  allowAborts: boolean;
  hasAbort: boolean;
  creditsDisplayer: { draw: () => void } | null;
}
export function MenuSystemInit(pos: Vec2i, size: Vec2i): MenuSystem {
  return {
    root: null, current: null, exitTypes: [], customDisplayFuncs: [], pos, size, align: MENU_ALIGN_CENTER, allowAborts: false,
    hasAbort: false, creditsDisplayer: null,
  };
}
export function MenuHasExitType(ms: MenuSystem, t: number): boolean {
  return ms.exitTypes.includes(t);
}
export function MenuAddExitType(ms: MenuSystem, t: number): void {
  if (!MenuHasExitType(ms, t)) ms.exitTypes.push(t);
}
export function MenuSystemAddCustomDisplay(ms: MenuSystem, func: MenuDisplayFunc, data: unknown): void {
  ms.customDisplayFuncs.push({ Func: func, Data: data });
}
export function MenuIsExit(ms: MenuSystem): boolean {
  return ms.current == null || MenuHasExitType(ms, ms.current.type);
}
export const MenuTypeHasSubMenus = (t: number): boolean => t === MENU_TYPE_NORMAL || t === MENU_TYPE_OPTIONS;

function SubmenuGetSize(ms: MenuSystem, menu: Menu, idx: number): Vec2i {
  const sub = menu.subMenus[idx];
  let maxWidth = 0;
  for (const s of menu.subMenus) maxWidth = MAX(maxWidth, FontStrW(s.name));
  maxWidth = MIN(ms.size.x, maxWidth);
  switch (sub.type) {
    case MENU_TYPE_SET_OPTION_RANGE:
    case MENU_TYPE_SET_OPTION_SEED:
    case MENU_TYPE_SET_OPTION_UP_DOWN_VOID_FUNC_VOID:
    case MENU_TYPE_SET_OPTION_RANGE_GET_SET:
      if (sub.displayStyle !== MENU_OPTION_DISPLAY_STYLE_NONE) maxWidth += 80;
      break;
    case MENU_TYPE_SET_OPTION_TOGGLE:
    case MENU_TYPE_SET_OPTION_CHANGE_KEY:
      maxWidth += 80;
      break;
    default:
      break;
  }
  return { x: maxWidth, y: FontStrH(sub.name) };
}
type Rect = { Pos: Vec2i; Size: Vec2i };
const zeroRect = (): Rect => ({ Pos: { x: 0, y: 0 }, Size: { x: 0, y: 0 } });
const rectIsZero = (r: Rect): boolean => r.Pos.x === 0 && r.Pos.y === 0 && r.Size.x === 0 && r.Size.y === 0;
function MenuGetSubmenuBounds(ms: MenuSystem, idx: number): Rect {
  const menu = ms.current;
  if (menu == null || !MenuTypeHasSubMenus(menu.type)) return zeroRect();
  const maxItems = menu.maxItems;
  const iStart = maxItems > 0 ? menu.scroll : 0;
  if (idx < iStart) return zeroRect();
  const maxIEnd = MIN(maxItems > 0 ? iStart + maxItems : 99, menu.subMenus.length);
  let numMenuLines = 0;
  let iEnd: number;
  for (iEnd = iStart; iEnd < maxIEnd; iEnd++) {
    const numLines = FontStrNumLines(menu.subMenus[iEnd].name);
    if (menu.maxItems !== 0 && numMenuLines + numLines > menu.maxItems) break;
    numMenuLines += numLines;
  }
  if (iEnd <= idx) return zeroRect();
  let maxWidth = 0;
  for (const s of menu.subMenus) maxWidth = MAX(maxWidth, FontStrW(s.name));
  maxWidth = MIN(ms.size.x, maxWidth);
  const pos = { x: 0, y: 0 };
  const isCentered = menu.type === MENU_TYPE_NORMAL;
  switch (ms.align) {
    case MENU_ALIGN_CENTER:
      pos.x = ms.pos.x + Math.trunc((ms.size.x - maxWidth) / 2);
      if (!isCentered) pos.x -= 20;
      break;
    case MENU_ALIGN_LEFT:
      pos.x = ms.pos.x;
      break;
    default:
      return zeroRect();
  }
  pos.y = ms.pos.y + Math.trunc((ms.size.y - numMenuLines * FontH()) / 2);
  for (let i = iStart; i < idx; i++) pos.y += SubmenuGetSize(ms, menu, i).y;
  return { Pos: pos, Size: SubmenuGetSize(ms, menu, idx) };
}
function MoveIndexToNextEnabledSubmenu(menu: Menu, isDown: boolean): void {
  if (menu.index >= menu.subMenus.length) menu.index = menu.subMenus.length - 1;
  const firstIndex = menu.index;
  let isFirst = true;
  for (;;) {
    const cur = menu.subMenus[menu.index];
    if (!cur || !cur.isDisabled) break;
    if (menu.index === firstIndex && !isFirst) break;
    isFirst = false;
    if (isDown) {
      menu.index++;
      if (menu.index === menu.subMenus.length) menu.index = 0;
    } else {
      menu.index--;
      if (menu.index === -1) menu.index = menu.subMenus.length - 1;
    }
  }
}
export function MenuGetNumMenuItemsShown(menu: Menu): number {
  return menu.maxItems > 0 ? MIN(menu.maxItems, menu.subMenus.length) : menu.subMenus.length;
}
function MenuClampScroll(menu: Menu): void {
  const n = MenuGetNumMenuItemsShown(menu);
  menu.scroll = CLAMP(menu.scroll, MAX(0, menu.index - n + 1), MIN(menu.subMenus.length - n, menu.index));
  if (menu.index < menu.scroll) menu.scroll = menu.index;
}
function MenuChangeIndex(menu: Menu, d: number): void {
  if (d < 0) {
    menu.index--;
    if (menu.index === -1) menu.index = menu.subMenus.length - 1;
    MoveIndexToNextEnabledSubmenu(menu, false);
    MenuPlaySound(MENU_SOUND_SWITCH);
  } else if (d > 0) {
    menu.index++;
    if (menu.index === menu.subMenus.length) menu.index = 0;
    MoveIndexToNextEnabledSubmenu(menu, true);
    MenuPlaySound(MENU_SOUND_SWITCH);
  }
}
export function MenuLoop(ms: MenuSystem): GameLoopData {
  return GameLoopDataNew({ UpdateFunc: () => MenuUpdate(ms), DrawFunc: () => MenuDraw(ms) });
}
function MenuUpdateMouse(ms: MenuSystem): void {
  const menu = ms.current;
  if (menu == null || !MenuTypeHasSubMenus(menu.type)) return;
  if (ev.mouse.moved) {
    ev.mouse.moved = false;
    menu.mouseHover = false;
    for (let i = 0; i < menu.subMenus.length; i++) {
      const b = MenuGetSubmenuBounds(ms, i);
      const p = ev.mouse.pos;
      if (!(p.x >= b.Pos.x && p.x < b.Pos.x + b.Size.x && p.y >= b.Pos.y && p.y < b.Pos.y + b.Size.y)) continue;
      menu.mouseHover = true;
      if (menu.index !== i && !menu.subMenus[i].isDisabled) {
        menu.index = i;
        MenuPlaySound(MENU_SOUND_SWITCH);
      }
      break;
    }
  }
  const dWheel = ev.mouse.wheel.y;
  if (dWheel !== 0) {
    const dd = dWheel > 0 ? 1 : -1;
    for (let i = 0; i !== dWheel; i += dd) {
      const orig = menu.scroll;
      menu.scroll += dd;
      MenuClampScroll(menu);
      if (menu.scroll === orig) break;
      MenuChangeIndex(menu, dd);
    }
  }
}
export function MenuUpdate(ms: MenuSystem): number {
  if (ms.current!.type === MENU_TYPE_OPTIONS && ms.current!.changeKeyMenu != null) {
    MenuProcessChangeKey(ms.current!);
  } else {
    const cmd = GetMenuCmd(ms.current!.mouseHover);
    if (cmd) MenuProcessCmd(ms, cmd);
    else MenuUpdateMouse(ms);
  }
  const cmds = GetPlayerCmds();
  const aborted = ms.allowAborts && EventIsEscape(cmds, GetMenuCmd(false));
  if (aborted || ev.HasQuit) {
    ms.hasAbort = true;
    return UPDATE_RESULT_OK;
  }
  if (MenuIsExit(ms)) return UPDATE_RESULT_OK;
  if (ms.current!.customPostUpdateFunc) ms.current!.customPostUpdateFunc(ms.current!, ms.current!.customPostUpdateData);
  return UPDATE_RESULT_DRAW;
}
export function MenuDraw(ms: MenuSystem): void {
  ShowControls();
  MenuDisplay(ms);
}
export function MenuReset(ms: MenuSystem): void {
  ms.current = ms.root;
}
export function MenuDisableSubmenu(menu: Menu, idx: number): void {
  MenuSetDisabled(menu.subMenus[idx], true);
}
export function MenuEnableSubmenu(menu: Menu, idx: number): void {
  MenuSetDisabled(menu.subMenus[idx], false);
}
export function MenuSetDisabled(menu: Menu, d: boolean): void {
  menu.isDisabled = d;
  if (d && menu.parentMenu != null) MoveIndexToNextEnabledSubmenu(menu.parentMenu, true);
}
export function MenuGetSubmenuByName(menu: Menu, name: string): Menu | null {
  return menu.subMenus.find((m) => m.name === name) ?? null;
}
export function ShowControls(): void {
  const keyW = 13;
  let w = FontStrW(' or ') + keyW * 5 + 2;
  if (ev.joysticks.length > 0) w += 24 + FontStrW('#1 or ');
  let pos = { x: Math.trunc((gGfx.w - w) / 2), y: gGfx.h - 14 };
  pos = FontStr('use ', pos);
  if (ev.joysticks.length > 0) {
    const controller = PicManagerGetPic(gPicManager, 'controller')!;
    PicRender(controller, { x: pos.x, y: pos.y - 5 }, colorWhite);
    pos.x += controller.size.x + 2;
    pos = FontStr('#1 or ', pos);
  }
  pos = DrawKeyboardMenuButtons(pos);
  pos.x += 4;
  const bg = PicManagerGetSprites(gPicManager, 'key_back_wide');
  pos = DrawOneButton(bg, ENTER_CHAR, colorWhite, KeyIsDown(SDL_SCANCODE_RETURN), pos);
  pos.x += 2;
  DrawOneButton(bg, BACKSPACE_CHAR, colorWhite, KeyIsDown(SDL_SCANCODE_BACKSPACE), pos);
}
export function DisplayMenuItem(bounds: Rect, s: string, selected: boolean, isDisabled: boolean, color: Color): Vec2i {
  if (isDisabled) return FontStrMask(s, bounds.Pos, colorDarkGray);
  if (selected) {
    DrawRectangle({ x: bounds.Pos.x - 1, y: bounds.Pos.y - 1 }, { x: bounds.Size.x + 2, y: bounds.Size.y + 2 }, colorSelectedBG, true);
    return FontStrMask(s, bounds.Pos, colorRed);
  }
  if (!ColorEquals(color, colorTransparent)) return FontStrMask(s, bounds.Pos, color);
  return FontStr(s, bounds.Pos);
}
export function MenuCreate(name: string, type: number): Menu {
  return {
    name, type, parentMenu: null, isDisabled: false, color: { r: 0, g: 0, b: 0, a: 0 }, enterSound: MENU_SOUND_ENTER, mouseHover: false,
    customPostEnterFunc: null, customPostEnterData: null, customPostUpdateFunc: null, customPostUpdateData: null,
    customPostInputFunc: null, customPostInputData: null, customDisplayFunc: null, customDisplayData: null, title: '',
    isSubmenusAlt: false, displayItems: 0, changeKeyMenu: null, index: 0, scroll: 0, maxItems: 0, align: MENU_ALIGN_LEFT,
    quitMenuIndex: -1, subMenus: [], displayStyle: MENU_OPTION_DISPLAY_STYLE_NONE, toggle: null, range: null, upDown: null, str: null,
    intToStr: null, voidFunc: null, voidData: null, changeKey: null, returnCode: 0, custom: null,
  };
}
export function MenuCreateNormal(name: string, title: string, type: number, displayItems: number): Menu {
  const m = MenuCreate(name, type);
  m.title = title;
  m.displayItems = displayItems;
  return m;
}
function UpdateSubmenuParentPtrs(menu: Menu): void {
  for (const s of menu.subMenus) {
    s.parentMenu = menu;
    if (MenuTypeHasSubMenus(s.type)) UpdateSubmenuParentPtrs(s);
  }
}
export function MenuAddSubmenu(menu: Menu, sub: Menu): Menu {
  menu.subMenus.push(sub);
  if (sub.type === MENU_TYPE_QUIT) menu.quitMenuIndex = menu.subMenus.length - 1;
  UpdateSubmenuParentPtrs(menu);
  MoveIndexToNextEnabledSubmenu(menu, true);
  return sub;
}
export function MenuSetPostInputFunc(menu: Menu, f: (m: Menu, cmd: number, d: unknown) => void, data: unknown): void {
  menu.customPostInputFunc = f;
  menu.customPostInputData = data;
}
export function MenuSetPostEnterFunc(menu: Menu, f: (m: Menu, d: unknown) => void, data: unknown): void {
  menu.customPostEnterFunc = f;
  menu.customPostEnterData = data;
}
export function MenuSetPostUpdateFunc(menu: Menu, f: (m: Menu, d: unknown) => void, data: unknown): void {
  menu.customPostUpdateFunc = f;
  menu.customPostUpdateData = data;
}
export function MenuSetCustomDisplay(menu: Menu, f: MenuDisplayFunc, data: unknown): void {
  menu.customDisplayFunc = f;
  menu.customDisplayData = data;
}
/** MenuAddConfigOptionsItem */
export function MenuAddConfigOptionsItem(menu: Menu, c: ConfigEntry): void {
  const name = CamelToTitle(c.name.slice(c.name.lastIndexOf('.') + 1));
  switch (c.type) {
    case 'int':
      MenuAddSubmenu(menu, MenuCreateOptionRange(name, () => c.value as number, (v) => { c.value = v; }, c.min!, c.max!, c.inc!,
        MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC, c.str ?? null));
      break;
    case 'bool':
      MenuAddSubmenu(menu, MenuCreateOptionToggle(name, () => c.value as boolean, (v) => { c.value = v; }));
      break;
    case 'enum':
      MenuAddSubmenu(menu, MenuCreateOptionRange(name, () => c.value as number, (v) => { c.value = v; }, c.min!, c.max!, 1,
        MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC, c.str ?? null));
      break;
    default:
      break;
  }
}
export function MenuCreateOptionToggle(name: string, get: () => boolean, set: (v: boolean) => void): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_TOGGLE);
  m.toggle = { get, set };
  return m;
}
export function MenuCreateOptionRange(name: string, get: () => number, set: (v: number) => void, low: number, high: number,
  increment: number, style: number, func: ((v: number) => string) | (() => string) | null): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_RANGE);
  m.range = { get, set, low, high, increment };
  m.displayStyle = style;
  if (style === MENU_OPTION_DISPLAY_STYLE_STR_FUNC) m.str = func as () => string;
  else if (style === MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC) m.intToStr = func as (v: number) => string;
  return m;
}
export function MenuCreateOptionSeed(name: string, get: () => number, set: (v: number) => void): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_SEED);
  m.range = { get, set, low: 0, high: 0xffffffff, increment: 1 };
  m.displayStyle = MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC;
  m.intToStr = (v) => `${v >>> 0}`;
  return m;
}
export function MenuCreateOptionUpDownFunc(name: string, up: () => void, down: () => void, style: number, str: (() => string) | null): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_UP_DOWN_VOID_FUNC_VOID);
  m.upDown = { up, down };
  m.displayStyle = style;
  m.str = str;
  return m;
}
export function MenuCreateVoidFunc(name: string, func: (d: unknown) => void, data: unknown): Menu {
  const m = MenuCreate(name, MENU_TYPE_VOID_FUNC);
  m.voidFunc = func;
  m.voidData = data;
  return m;
}
export function MenuCreateOptionRangeGetSet(name: string, get: () => number, set: (v: number) => void, low: number, high: number,
  increment: number, style: number, func: ((v: number) => string) | null): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_RANGE_GET_SET);
  m.range = { get, set, low, high, increment };
  m.displayStyle = style;
  if (style === MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC) m.intToStr = func;
  return m;
}
export function MenuCreateSeparator(name: string): Menu {
  const m = MenuCreate(name, MENU_TYPE_BASIC);
  m.isDisabled = true;
  return m;
}
export const MenuCreateBack = (name: string): Menu => MenuCreate(name, MENU_TYPE_BACK);
export function MenuCreateReturn(name: string, code: number): Menu {
  const m = MenuCreate(name, MENU_TYPE_RETURN);
  m.returnCode = code;
  return m;
}
export function MenuCreateCustom(name: string, displayFunc: MenuDisplayFunc, inputFunc: ((cmd: number, d: unknown) => boolean) | null, data: unknown): Menu {
  const m = MenuCreate(name, MENU_TYPE_CUSTOM);
  m.custom = { displayFunc, inputFunc, data };
  return m;
}
export function MenuCreateChangeKey(name: string, code: number, playerIndex: number, isOptional: boolean): Menu {
  const m = MenuCreate(name, MENU_TYPE_SET_OPTION_CHANGE_KEY);
  m.changeKey = { code, playerIndex, isOptional };
  return m;
}
export function MenuDisplay(ms: MenuSystem): void {
  const menu = ms.current;
  if (menu != null) {
    if (menu.type === MENU_TYPE_CUSTOM) {
      menu.custom!.displayFunc(menu, ms.pos, ms.size, menu.custom!.data);
    } else {
      const d = menu.displayItems;
      if ((d & MENU_DISPLAY_ITEMS_CREDITS) && ms.creditsDisplayer) ms.creditsDisplayer.draw();
      if (d & MENU_DISPLAY_ITEMS_AUTHORS) {
        const logo = PicManagerGetPic(gPicManager, 'logo')!;
        PicRender(logo, { x: ms.pos.x + Math.trunc((ms.size.x - logo.size.x) / 2), y: ms.pos.y + Math.trunc(ms.size.y / 12) }, colorWhite);
        const o = FontOptsNew();
        o.HAlign = ALIGN_END;
        o.Area = ms.size;
        o.Pad = { x: 20, y: 20 };
        FontStrOpt(`Version: ${CDOGS_SDL_VERSION}`, ms.pos, o);
      }
      if (menu.title.length !== 0) {
        const o = FontOptsNew();
        o.HAlign = ALIGN_CENTER;
        o.Area = ms.size;
        o.Pad = { x: 20, y: 20 };
        FontStrOpt(menu.title, ms.pos, o);
      }
      MenuDisplaySubmenus(ms);
    }
  }
  for (const cdf of ms.customDisplayFuncs) cdf.Func(null, ms.pos, ms.size, cdf.Data);
  if (menu != null && menu.customDisplayFunc) menu.customDisplayFunc(menu, ms.pos, ms.size, menu.customDisplayData);
}
function MenuOptionGetIntValue(m: Menu): number {
  switch (m.type) {
    case MENU_TYPE_SET_OPTION_TOGGLE: return m.toggle!.get() ? 1 : 0;
    case MENU_TYPE_SET_OPTION_RANGE:
    case MENU_TYPE_SET_OPTION_SEED:
    case MENU_TYPE_SET_OPTION_RANGE_GET_SET:
      return m.range!.get();
    default: return 0;
  }
}
const KEY_NAMES = ['left', 'right', 'up', 'down', 'button1', 'button2', 'grenade', 'map'];
function MenuDisplaySubmenus(ms: MenuSystem): void {
  const menu = ms.current!;
  if (!MenuTypeHasSubMenus(menu.type)) return;
  let maxWidth = 0;
  for (const s of menu.subMenus) maxWidth = MAX(maxWidth, FontStrW(s.name));
  menu.subMenus.forEach((sub, i) => {
    const bounds = MenuGetSubmenuBounds(ms, i);
    if (rectIsZero(bounds)) return;
    const xOptions = bounds.Pos.x + maxWidth + 10;
    const nameBuf = sub.type === MENU_TYPE_NORMAL && sub.isSubmenusAlt ? `${sub.name} ${ARROW_RIGHT}` : sub.name;
    const isSelected = i === menu.index;
    DisplayMenuItem(bounds, nameBuf, isSelected, menu.isDisabled || sub.isDisabled, sub.color);
    const optionInt = MenuOptionGetIntValue(sub);
    let option: string | null = null;
    if (sub.type === MENU_TYPE_SET_OPTION_RANGE || sub.type === MENU_TYPE_SET_OPTION_SEED ||
      sub.type === MENU_TYPE_SET_OPTION_UP_DOWN_VOID_FUNC_VOID || sub.type === MENU_TYPE_SET_OPTION_RANGE_GET_SET) {
      if (sub.displayStyle === MENU_OPTION_DISPLAY_STYLE_STR_FUNC && sub.str) option = sub.str();
      else if (sub.displayStyle === MENU_OPTION_DISPLAY_STYLE_INT_TO_STR_FUNC && sub.intToStr) option = sub.intToStr(optionInt);
    } else if (sub.type === MENU_TYPE_SET_OPTION_TOGGLE) {
      option = optionInt ? 'Yes' : 'No';
    } else if (sub.type === MENU_TYPE_SET_OPTION_CHANGE_KEY) {
      if (menu.changeKeyMenu === sub) option = 'Press a key';
      else {
        const sc = ConfigGetInt(`Input.PlayerCodes${sub.changeKey!.playerIndex}.${KEY_NAMES[sub.changeKey!.code]}`);
        option = SDL_GetScancodeName(sc);
        if (sc === 0 || !option) option = 'Unset';
      }
    }
    if (option != null) FontStr(isSelected ? `${ARROW_LEFT} ${option} ${ARROW_RIGHT}` : option, { x: xOptions, y: bounds.Pos.y });
  });
}
export function MenuPlaySound(s: number): void {
  const names = ['menu_enter', 'menu_back', 'menu_switch', 'menu_start', 'menu_error'];
  if (names[s]) SoundPlay(gSoundDevice, StrSound(names[s]));
}
export function MenuClearSubmenus(menu: Menu): void {
  if (MenuTypeHasSubMenus(menu.type)) menu.subMenus = [];
}
export function MenuProcessCmd(ms: MenuSystem, cmd: number): void {
  const menu = ms.current;
  let menuToChange: Menu | null = null;
  if (menu != null) {
    let done = false;
    if (cmd === CMD_ESC || Button2(cmd) || (Left(cmd) && menu.isSubmenusAlt)) {
      menuToChange = MenuProcessEscCmd(menu);
      if (menuToChange != null) {
        MenuPlaySound(MENU_SOUND_BACK);
        ms.current = menuToChange;
        done = true;
      }
    }
    if (!done) {
      if (menu.type === MENU_TYPE_CUSTOM) {
        if (menu.custom!.inputFunc == null || menu.custom!.inputFunc(cmd, menu.custom!.data)) ms.current = menu.parentMenu;
      } else if (cmd !== 0) {
        menuToChange = MenuProcessButtonCmd(ms, menu, cmd);
        if (menuToChange != null) {
          MenuPlaySound(menuToChange.enterSound);
          ms.current = menuToChange;
        } else {
          MenuChangeIndexCmd(menu, cmd);
        }
      }
    }
  }
  if (menu && menu.customPostInputFunc) menu.customPostInputFunc(menu, cmd, menu.customPostInputData);
  if (menuToChange && menuToChange.customPostEnterFunc) menuToChange.customPostEnterFunc(menuToChange, menuToChange.customPostEnterData);
}
function MenuProcessEscCmd(menu: Menu): Menu | null {
  const q = menu.quitMenuIndex;
  if (q !== -1) {
    if (menu.index !== q) {
      MenuPlaySound(MENU_SOUND_SWITCH);
      menu.index = q;
      return null;
    }
    return menu.subMenus.length > 0 ? menu.subMenus[q] : null;
  }
  return menu.parentMenu;
}
function MenuProcessButtonCmd(ms: MenuSystem, menu: Menu, cmd: number): Menu | null {
  if (AnyButton(cmd) || Left(cmd) || Right(cmd)) {
    if (menu.subMenus.length === 0) return null;
    const sub = menu.subMenus[menu.index];
    switch (sub.type) {
      case MENU_TYPE_NORMAL:
      case MENU_TYPE_OPTIONS:
      case MENU_TYPE_CUSTOM:
        if (sub.isSubmenusAlt ? Right(cmd) : Button1(cmd)) return sub;
        break;
      case MENU_TYPE_BACK:
        if (Button1(cmd)) return menu.parentMenu;
        break;
      case MENU_TYPE_QUIT:
      case MENU_TYPE_RETURN:
        if (Button1(cmd)) return sub;
        break;
      default:
        MenuActivate(ms, sub, cmd);
        break;
    }
  }
  return null;
}
function KeyAvailable(key: number, code: number, playerIndex: number): boolean {
  if (key === SDL_SCANCODE_ESCAPE || key === SDL_SCANCODE_F9 || key === SDL_SCANCODE_F10) return false;
  if (key === 0) return true;
  if (key === ConfigGetInt('Input.PlayerCodes0.map')) return false;
  for (let i = 0; i < 7; i++) if (i !== code && ConfigGetInt(`Input.PlayerCodes${playerIndex}.${KEY_NAMES[i]}`) === key) return false;
  const o = 1 - playerIndex;
  for (const n of ['left', 'right', 'up', 'down', 'button1', 'button2']) if (ConfigGetInt(`Input.PlayerCodes${o}.${n}`) === key) return false;
  return true;
}
function MenuProcessChangeKey(menu: Menu): void {
  let key = KeyGetPressed();
  if (key === 0) return;
  const ck = menu.changeKeyMenu!.changeKey!;
  if (key === SDL_SCANCODE_ESCAPE) {
    if (ck.isOptional) key = 0;
    else MenuPlaySound(MENU_SOUND_BACK);
  }
  if (!KeyAvailable(key, ck.code, ck.playerIndex)) {
    MenuPlaySound(MENU_SOUND_ERROR);
  } else {
    const pi = ck.code === 7 ? 0 : ck.playerIndex;
    ConfigGet(`Input.PlayerCodes${pi}.${KEY_NAMES[ck.code]}`).value = key;
    KeyInit();
    MenuPlaySound(MENU_SOUND_ENTER);
  }
  menu.changeKeyMenu = null;
}
function MenuChangeIndexCmd(menu: Menu, cmd: number): void {
  if (menu.subMenus.length === 0) return;
  if (Up(cmd)) MenuChangeIndex(menu, -1);
  else if (Down(cmd)) MenuChangeIndex(menu, 1);
  MenuClampScroll(menu);
}
function MenuActivate(_ms: MenuSystem, menu: Menu, cmd: number): void {
  MenuPlaySound(MENU_SOUND_SWITCH);
  switch (menu.type) {
    case MENU_TYPE_BASIC:
      return;
    case MENU_TYPE_SET_OPTION_TOGGLE:
      menu.toggle!.set(!menu.toggle!.get());
      break;
    case MENU_TYPE_SET_OPTION_RANGE: {
      const r = menu.range!;
      let o = r.get();
      if (Left(cmd)) {
        if (r.low === o) o = r.high;
        else if (r.low + r.increment > o) o = r.low;
        else o -= r.increment;
      } else if (Right(cmd)) {
        if (r.high === o) o = r.low;
        else if (r.high - r.increment < o) o = r.high;
        else o += r.increment;
      }
      r.set(o);
      break;
    }
    case MENU_TYPE_SET_OPTION_SEED: {
      let seed = menu.range!.get() >>> 0;
      let inc = 1;
      if (Button1(cmd)) inc *= 10;
      if (Button2(cmd)) inc *= 100;
      if (Left(cmd)) seed = inc > seed ? 0 : seed - inc;
      else if (Right(cmd)) seed = 0xffffffff - inc < seed ? 0xffffffff : seed + inc;
      menu.range!.set(seed);
      break;
    }
    case MENU_TYPE_SET_OPTION_UP_DOWN_VOID_FUNC_VOID:
      if (Left(cmd)) menu.upDown!.up();
      else if (Right(cmd)) menu.upDown!.down();
      break;
    case MENU_TYPE_SET_OPTION_RANGE_GET_SET: {
      const r = menu.range!;
      let o = r.get();
      if (Left(cmd)) o = r.low + r.increment > o ? r.low : o - r.increment;
      else if (Right(cmd)) o = r.high - r.increment < o ? r.high : o + r.increment;
      r.set(o);
      break;
    }
    case MENU_TYPE_VOID_FUNC:
      if (AnyButton(cmd)) menu.voidFunc!(menu.voidData);
      break;
    case MENU_TYPE_SET_OPTION_CHANGE_KEY:
      menu.parentMenu!.changeKeyMenu = menu;
      break;
    default:
      break;
  }
}
export { MenuSystemInit as MenuSystemNew };
export const MenuSystemTerminate = (_ms: MenuSystem): void => {};
export type { GameLoopData };
export { UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, FontStrMask, FontStr, FontH, ConfigGet };
