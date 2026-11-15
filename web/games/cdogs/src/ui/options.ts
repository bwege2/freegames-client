// C-Dogs SDL 2.5.0, translated: the options menus (options_menu.c), the briefing menu of the pause menu
// (briefing_menu.c) and config_apply.c. The original saves options.cnf; the port saves the same JSON in the player's
// server storage (configStore, set by index.ts). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { CMD_BUTTON1, CMD_BUTTON2 } from '../core/base.ts';
import { ConfigChanged, ConfigGet, ConfigGroup, ConfigResetChanged, ConfigSetChanged, ConfigToJSON } from '../core/config.ts';
import { CollisionSystemReset } from '../core/map.ts';
import type { MissionOptions } from '../core/state.ts';
import { FontStr } from '../render/gfx.ts';
import {
  MENU_TYPE_CUSTOM, MENU_TYPE_NORMAL, MENU_TYPE_OPTIONS, MenuAddConfigOptionsItem, MenuAddSubmenu, MenuCreate, MenuCreateBack,
  MenuCreateChangeKey, MenuCreateNormal, MenuCreateReturn, MenuCreateSeparator, MenuSetPostInputFunc, type Menu,
} from './menu.ts';
import { MissionBriefingDataNew, MissionBriefingDrawData } from './briefing.ts';

/** what applying options does outside the menus: sound volumes, the screen (set by index.ts) */
export const configStore = { save: (_text: string): void => {} };
export const applyHooks = { sound: (): void => {}, graphics: (): boolean => false };

/** ConfigApply (config_apply.c); returns whether the graphics are initialised (always, in the browser) */
export function ConfigApply(): { ok: boolean; resetBg: boolean } {
  CollisionSystemReset();
  if (ConfigChanged('Sound')) applyHooks.sound();
  let resetBg = false;
  if (ConfigChanged('Graphics')) resetBg = applyHooks.graphics();
  ConfigSetChanged();
  return { ok: true, resetBg };
}
export function ConfigSave(): void {
  configStore.save(ConfigToJSON());
}
/** used by prep.ts (GameOptions): ConfigApply(&gConfig, NULL), ConfigSave */
export const configHooks = { apply: (): boolean => ConfigApply().ok, save: ConfigSave };

export interface OptionsMenuData { gfxChangeCallback: ((resetBg: boolean) => void) | null }

function PostInputConfigApply(data: OptionsMenuData): void {
  const r = ConfigApply();
  if (!r.ok) ConfigResetChanged();
  else ConfigSave();
  data.gfxChangeCallback?.(r.resetBg);
}
function MenuCreateConfigOptions(name: string, title: string, group: string, data: OptionsMenuData, backOrReturn: boolean): Menu {
  const menu = MenuCreateNormal(name, title, MENU_TYPE_OPTIONS, 0);
  for (const c of ConfigGroup(group)) MenuAddConfigOptionsItem(menu, c);
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, backOrReturn ? MenuCreateBack('Done') : MenuCreateReturn('Done', 0));
  MenuSetPostInputFunc(menu, () => PostInputConfigApply(data), data);
  return menu;
}
function MenuCreateOptionsGraphics(name: string, data: OptionsMenuData): Menu {
  const menu = MenuCreateNormal(name, 'Graphics Options:', MENU_TYPE_OPTIONS, 0);
  for (const n of ['Brightness', 'Fullscreen', 'ScaleFactor', 'DOSPAR', 'ScaleMode', 'Shadows', 'Gore', 'Brass']) {
    MenuAddConfigOptionsItem(menu, ConfigGet(`Graphics.${n}`));
  }
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Done'));
  MenuSetPostInputFunc(menu, () => PostInputConfigApply(data), data);
  return menu;
}
const KEY_CODE_LEFT = 0;
const KEY_CODE_RIGHT = 1;
const KEY_CODE_UP = 2;
const KEY_CODE_DOWN = 3;
const KEY_CODE_BUTTON1 = 4;
const KEY_CODE_BUTTON2 = 5;
const KEY_CODE_GRENADE = 6;
const KEY_CODE_MAP = 7;
function MenuCreateKeysSingleSection(menu: Menu, sectionName: string, playerIndex: number): void {
  MenuAddSubmenu(menu, MenuCreateSeparator(sectionName));
  MenuAddSubmenu(menu, MenuCreateChangeKey('left', KEY_CODE_LEFT, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('right', KEY_CODE_RIGHT, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('up', KEY_CODE_UP, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('down', KEY_CODE_DOWN, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('fire', KEY_CODE_BUTTON1, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('switch/strafe', KEY_CODE_BUTTON2, playerIndex, false));
  MenuAddSubmenu(menu, MenuCreateChangeKey('grenade', KEY_CODE_GRENADE, playerIndex, true));
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
}
function MenuCreateKeys(name: string, data: OptionsMenuData): Menu {
  const menu = MenuCreateNormal(name, '', MENU_TYPE_OPTIONS, 0);
  MenuCreateKeysSingleSection(menu, 'Keyboard 1', 0);
  MenuCreateKeysSingleSection(menu, 'Keyboard 2', 1);
  MenuAddSubmenu(menu, MenuCreateChangeKey('map', KEY_CODE_MAP, 0, true));
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Done'));
  MenuSetPostInputFunc(menu, () => PostInputConfigApply(data), data);
  return menu;
}
export function MenuCreateOptions(name: string, data: OptionsMenuData): Menu {
  const menu = MenuCreateNormal(name, 'Options:', MENU_TYPE_NORMAL, 0);
  MenuAddSubmenu(menu, MenuCreateConfigOptions('Game...', 'Game Options:', 'Game', data, true));
  MenuAddSubmenu(menu, MenuCreateOptionsGraphics('Graphics...', data));
  MenuAddSubmenu(menu, MenuCreateConfigOptions('Interface...', 'Interface Options:', 'Interface', data, true));
  MenuAddSubmenu(menu, MenuCreateKeys('Redefine keys...', data));
  MenuAddSubmenu(menu, MenuCreateConfigOptions('Sound...', 'Configure Sound:', 'Sound', data, true));
  MenuAddSubmenu(menu, MenuCreateSeparator(''));
  MenuAddSubmenu(menu, MenuCreateBack('Back'));
  return menu;
}

/** briefing_menu.c MenuCreateBriefing */
export function MenuCreateBriefing(name: string, m: MissionOptions): Menu {
  const menu = MenuCreate(name, MENU_TYPE_CUSTOM);
  const b = MissionBriefingDataNew(m);
  menu.custom = {
    displayFunc: () => {
      FontStr(b.Description, b.DescriptionPos);
      MissionBriefingDrawData(b);
    },
    inputFunc: (cmd: number) => cmd === CMD_BUTTON1 || cmd === CMD_BUTTON2,
    data: b,
  };
  return menu;
}
